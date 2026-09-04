import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

// ---- 真实构建菜单数据（复刻 store 逻辑）----
import { constantRoute } from '@/router/routes'

// 复刻 user.ts 的 buildMenuRoutesFromNav（未导出，测试内联）
function buildMenuRoutesFromNav(nav: any[]): any[] {
  const frontendMetaByPath: Record<string, any> = {}
  const pathByTitle: Record<string, string> = {}
  const collectFrontend = (routes: any[]) => {
    for (const r of routes || []) {
      if (r.path) {
        const p = String(r.path)
        const meta = (r.meta || {}) as Record<string, any>
        frontendMetaByPath[p] = meta
        if (meta.title) {
          pathByTitle[String(meta.title)] = p
        }
      }
      collectFrontend((r.children as any[]) || [])
    }
  }
  collectFrontend(constantRoute)

  const resolvePath = (url: string, name: string): string => {
    if (!url) return ''
    const normalized = url.startsWith('/') ? url : `/${url}`
    if (frontendMetaByPath[normalized]) return normalized
    if (pathByTitle[name]) return pathByTitle[name]
    return normalized
  }

  const walk = (list: any[]): any[] =>
    (list || [])
      .filter(
        (m: any) =>
          m && Number(m.status ?? 1) !== 0 && Number(m.type ?? 1) !== 2,
      )
      .map((m: any) => {
        const url = String(m.url || '').trim()
        const children = walk(m.list)
        const title = String(m.name || '').trim()
        const hasChildren = children.length > 0
        const path = hasChildren
          ? resolvePath(url, title) || `/__dir_${m.menuId}`
          : resolvePath(url, title)
        const fMeta = frontendMetaByPath[path] || {}
        const icon = String(m.icon || fMeta.icon || '')
        const route: any = {
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
      .filter((r: any) => {
        const children = r.children as any[] | undefined
        if (children && children.length > 0) return true
        return Boolean(r.path) && !String(r.path).startsWith('/__dir_')
      })

  return walk(nav)
}

const nav = [
  {
    menuId: 1,
    name: '系统管理',
    url: null,
    type: 0,
    list: [
      { menuId: 10, name: '用户管理', url: '/sys/user', type: 1, list: [] },
      { menuId: 11, name: '角色管理', url: '/sys/role', type: 1, list: [] },
    ],
  },
  {
    menuId: 2,
    name: '商品管理',
    url: null,
    type: 0,
    list: [
      { menuId: 201, name: '分类管理', url: '/category', type: 1, list: [] },
      {
        menuId: 209,
        name: '平台属性',
        url: null,
        type: 0,
        list: [
          {
            menuId: 203,
            name: '属性分组',
            url: '/attrgroup',
            type: 1,
            list: [],
          },
        ],
      },
    ],
  },
]

const pushes: any[] = []
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: (p: any) => {
      pushes.push(p)
      return Promise.resolve()
    },
  }),
}))

import Menu from '@/layout/menu/index.vue'

describe('layout/menu 二级菜单点击', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    pushes.length = 0
  })

  it('挂载并点击二级菜单项 → goRoute 应 push 对应 path', async () => {
    const menuRoutes = buildMenuRoutesFromNav(nav as any)
    console.log('构建菜单:', JSON.stringify(menuRoutes, null, 1))

    const wrapper = mount(Menu, {
      props: { menuList: menuRoutes as any },
      global: { plugins: [ElementPlus, createPinia()] },
      attachTo: document.body,
    })
    await flushPromises()

    // 展开「商品管理」一级目录
    const subMenuTitles = wrapper.findAll('.el-sub-menu__title')
    console.log('一级目录数:', subMenuTitles.length)
    const productSub = subMenuTitles.find((t) => t.text().includes('商品管理'))
    expect(productSub).toBeTruthy()
    await productSub!.trigger('click')
    await flushPromises()

    // 找到二级菜单项「分类管理」并点击
    const items = wrapper.findAll('.el-menu-item')
    console.log(
      '渲染出的 menu-item:',
      items.map((i) => i.text().trim()),
    )
    const cat = items.find((i) => i.text().includes('分类管理'))
    expect(cat).toBeTruthy()
    await cat!.trigger('click')
    await flushPromises()

    console.log('router.push 调用:', JSON.stringify(pushes))
    expect(pushes.length).toBe(1)
    expect(pushes[0]).toEqual({ path: '/category' })
  })
})
