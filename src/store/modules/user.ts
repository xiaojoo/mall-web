import { defineStore } from 'pinia'
import { reqLogin, reqUserInfo, reqLogOut } from '@/api/user'
import type { LoginFormData } from '@/api/user/type'
import type { SidebarMenuItem, UserState } from '@/store/modules/types/type'
import {
  REMOVE_TOKEN,
  GET_TOKEN,
  SET_TOKEN,
  SET_REFRESH_TOKEN,
  REMOVE_REFRESH_TOKEN,
} from '@/utils/token'
import { constantRoute } from '@/router/routes.ts'
import { request } from '@/utils/request'
import type { RouteRecordRaw } from 'vue-router'

/**
 * 后端导航菜单（/sys/menu/nav，即「菜单管理」维护的 sys_menu）→ 侧边栏菜单结构。
 * 结构/标题/图标/顺序/层级全部以后端为准：改数据库菜单，下次跳转或刷新即生效。
 *
 * 前端路由表（constantRoute）仍是页面组件的注册表，仅用于给后端菜单做图标兜底
 * （后端 icon 未配置时用前端路由 meta.icon）。
 */
function buildMenuRoutesFromNav(nav: any[]): SidebarMenuItem[] {
  // 前端路由 path → meta（图标/标题兜底）以及 标题 → path（后端 url 对不上时按名匹配）
  const frontendMetaByPath: Record<string, Record<string, any>> = {}
  const pathByTitle: Record<string, string> = {}
  const collectFrontend = (routes: RouteRecordRaw[]) => {
    for (const r of routes || []) {
      if (r.path) {
        const p = String(r.path)
        const meta = (r.meta || {}) as Record<string, any>
        frontendMetaByPath[p] = meta
        // 标题→path 取后出现者优先：DFS 中叶子路由晚于同名隐藏布局目录
        // （如 /product 目录与 /spu/manager 叶子都叫“商品管理”），避免解析到目录页
        if (meta.title) {
          pathByTitle[String(meta.title)] = p
        }
      }
      collectFrontend((r.children as RouteRecordRaw[]) || [])
    }
  }
  collectFrontend(constantRoute)

  /** 后端 url → 可跳转的前端路由 path */
  const resolvePath = (url: string, name: string): string => {
    if (!url) return ''
    const normalized = url.startsWith('/') ? url : `/${url}`
    if (frontendMetaByPath[normalized]) return normalized
    // url 对不上时按菜单名匹配前端路由（如 sys/user → 用户管理 → /user）
    if (pathByTitle[name]) return pathByTitle[name]
    return normalized
  }

  const walk = (list: any[]): SidebarMenuItem[] =>
    (list || [])
      // 过滤禁用菜单（status=0）；老数据 status 缺失视为正常；按钮（type=2）双保险排除
      .filter(
        (m: any) =>
          m && Number(m.status ?? 1) !== 0 && Number(m.type ?? 1) !== 2,
      )
      .map((m: any) => {
        const url = String(m.url || '').trim()
        const children = walk(m.list)
        const title = String(m.name || '').trim()
        const hasChildren = children.length > 0
        // 有子级的目录：path 仅作 el-sub-menu index，无 url 时用占位；
        // 叶子菜单：必须能解析出真实前端路由 path 才能跳转
        const path = hasChildren
          ? resolvePath(url, title) || `/__dir_${m.menuId}`
          : resolvePath(url, title)
        const fMeta = frontendMetaByPath[path] || {}
        const icon = String(m.icon || fMeta.icon || '')
        const route: SidebarMenuItem = {
          path,
          name: `${title || path}_${m.menuId}`,
          meta: {
            title: title || fMeta.title || path,
            ...(icon ? { icon } : {}),
            ...(m.perms ? { perms: String(m.perms) } : {}),
          },
          ...(hasChildren ? { children } : {}),
        }
        return route
      })
      // 叶子节点必须有可跳转的真实路径；仅占位（无 url 且无子级）的目录丢弃
      .filter((r: SidebarMenuItem) => {
        const children = r.children as SidebarMenuItem[] | undefined
        if (children && children.length > 0) return true
        return Boolean(r.path) && !String(r.path).startsWith('/__dir_')
      })

  return walk(nav)
}

const useUserStore = defineStore('User', {
  state: (): UserState => {
    return {
      token: GET_TOKEN() || null,
      // 初始为空：权限异步返回后再过滤赋值，避免先渲染全量菜单再收缩的跳动
      menuRoutes: [] as SidebarMenuItem[],
      username: '',
      avatar: '',
      perms: [],
    }
  },
  actions: {
    async userLogin(data: LoginFormData) {
      const result: any = await reqLogin(data)
      if (result.code === 0) {
        this.token = result.token as string
        SET_TOKEN(result.token as string)
        if (result.refreshToken) {
          SET_REFRESH_TOKEN(result.refreshToken as string)
        }
        return 'ok'
      } else {
        return Promise.reject(
          new Error(result.message || result.msg || '操作失败'),
        )
      }
    },

    async userInfo() {
      const result = await reqUserInfo()
      if (result.code === 0) {
        this.username = result.user.username as string
        // 头像：优先使用用户设置的头像（/sys/user/profile 可修改），无则用默认图
        this.avatar =
          (result.user.avatar as string) || 'src/assets/images/logo.jpg'

        // 拉取权限 + 导航菜单（侧边栏结构以后端 sys_menu 为准）
        await this.refreshMenus()

        return 'ok'
      } else {
        return Promise.reject('获取用户信息失败')
      }
    },

    /**
     * 刷新权限与导航菜单：
     * - 权限（/sys/user/perms）：用于页面级校验（路由守卫 to.meta.perms）
     * - 导航菜单（/sys/menu/nav）：直接决定侧边栏结构/标题/图标/顺序
     * 任一步失败均沿用旧数据，不阻断导航。
     */
    async refreshMenus() {
      try {
        const permsRes: any = await request.get<any, any>('/sys/user/perms')
        if (permsRes.code === 0) {
          this.perms = permsRes.perms || []
        }
      } catch {
        // 权限拉取失败：沿用已有权限
      }
      try {
        const navRes: any = await request.get<any, any>('/sys/menu/nav')
        if (Array.isArray(navRes)) {
          const next = buildMenuRoutesFromNav(navRes)
          // 变更检测：数据未变时不替换数组，避免每次切页都重渲染整个侧边栏
          if (JSON.stringify(next) !== JSON.stringify(this.menuRoutes)) {
            this.menuRoutes = next
          }
        }
      } catch {
        // 导航菜单拉取失败：沿用已有菜单
      }
    },

    async userLogOut() {
      // 登出接口失败也清理本地登录态（token 可能已过期/被拉黑）
      try {
        await reqLogOut()
      } catch {
        // 忽略登出接口错误
      } finally {
        this.token = ''
        this.username = ''
        this.avatar = ''
        this.perms = []
        this.menuRoutes = []
        REMOVE_TOKEN()
        REMOVE_REFRESH_TOKEN()
      }
    },
  },
  getters: {},
})

export default useUserStore
