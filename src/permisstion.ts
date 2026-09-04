// 路由鉴权
import router from '@/router'
// 进度条插件
import nprogress from 'nprogress'
import 'nprogress/nprogress.css'

nprogress.configure({ showSpinner: false, trickleSpeed: 100 })
// 获取用户相关小仓库token数据，判断用户是否登录
import useUserStore from '@/store/modules/user.ts'
import pinia from './store'

const userStore = useUserStore(pinia)
// 全局前置守卫
router.beforeEach(async (to, _from, next) => {
  document.title = 'Mall-' + to.meta.title
  // to: 你将要访问哪个路由
  // from: 你从哪个路由而来
  // next: 路由的放行函数
  nprogress.start()
  // 获取token，判断用户是否登录
  const token = userStore.token
  // 获取用户名字
  const username = userStore.username
  // 判断用户登录状态
  if (token) {
    if (to.path === '/login') {
      next({ path: '/' })
    } else {
      // 登录成功访问其余路由
      // 有用户信息
      if (username) {
        // 非阻塞刷新菜单/权限：不等待接口返回，避免每次切页被 2 个请求拖慢；
        // 数据到达后侧边栏自动更新（数据库 sys_menu 改动下次跳转即生效）
        userStore.refreshMenus().catch(() => {
          /* 忽略刷新失败 */
        })
        // 页面级权限校验：meta.perms 标记的路由，无权限则拦截回首页
        // 注意：perms 为空数组 = 权限接口拉取失败/数据缺失，不代表无任何权限——
        // 此时不拦截（菜单本身由后端 /sys/menu/nav 按角色下发，真正的安全边界在后端接口鉴权），
        // 避免所有带 perms 的二级页面全被弹回首页（“只有一级菜单能跳转”的假象）
        const needPerms = (to.meta as Record<string, any>)?.perms
        if (needPerms) {
          const need: string[] = Array.isArray(needPerms)
            ? needPerms
            : [needPerms]
          const userPerms: string[] = userStore.perms || []
          const ok =
            userPerms.includes('*:*:*') ||
            userPerms.length === 0 ||
            need.some((p) => userPerms.includes(p))
          if (!ok) {
            nprogress.done()
            return next({ path: '/home' })
          }
        }
        next()
      } else {
        try {
          await userStore.userInfo()
          // 拉取权限后同样校验页面权限
          const needPerms = (to.meta as Record<string, any>)?.perms
          if (needPerms) {
            const need: string[] = Array.isArray(needPerms)
              ? needPerms
              : [needPerms]
            const userPerms: string[] = userStore.perms || []
            const ok =
              userPerms.includes('*:*:*') ||
              need.some((p) => userPerms.includes(p))
            if (!ok) {
              nprogress.done()
              return next({ path: '/home' })
            }
          }
          next()
        } catch (error) {
          await userStore.userLogOut()
          next({ path: '/login', query: { redirect: to.path } })
        }
      }
    }
  } else {
    // 未登录
    if (to.path == '/login') {
      next()
    } else {
      next({ path: '/login', query: { redirect: to.path } })
    }
  }
})
// 全局后置守卫
router.afterEach(async (to) => {
  // 等目标路由的懒加载组件 chunk 真正下载完再收进度条：
  // Vue Router 4 的 afterEach 不等待 () => import() 的异步组件 resolve，
  // 不等待的话进度条会在页面加载完成前就消失，刷新时看起来“卡/不同步”。
  await Promise.all(
    to.matched.flatMap((record) =>
      Object.values(record.components ?? {}).map((comp) => {
        // 只预取懒加载 loader（普通对象组件直接放行）
        if (typeof comp === 'function') {
          return Promise.resolve(comp()).catch(() => undefined)
        }
        return Promise.resolve(undefined)
      }),
    ),
  )
  nprogress.done()
})
