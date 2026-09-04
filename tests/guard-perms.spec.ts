import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import ElementPlus from 'element-plus'

// mock 请求层：/sys/user/perms 与 /sys/menu/nav 可控制
const mockState: { perms: string[] } = { perms: [] }
vi.mock('@/utils/request', () => ({
  request: {
    get: vi.fn(async (url: string) => {
      if (url === '/sys/user/perms') {
        return { code: 0, perms: mockState.perms }
      }
      if (url === '/sys/menu/nav') {
        return [
          {
            menuId: 1,
            name: '系统管理',
            url: null,
            type: 0,
            list: [
              {
                menuId: 10,
                name: '用户管理',
                url: '/sys/user',
                type: 1,
                list: [],
              },
            ],
          },
          {
            menuId: 2,
            name: '商品管理',
            url: null,
            type: 0,
            list: [
              {
                menuId: 201,
                name: '分类管理',
                url: '/category',
                type: 1,
                list: [],
              },
            ],
          },
        ]
      }
      return {}
    }),
  },
}))

import router from '@/router'
import '@/permisstion'
import pinia from '@/store'
import useUserStore from '@/store/modules/user'

describe('路由守卫 perms 拦截', () => {
  beforeEach(async () => {
    setActivePinia(pinia)
    localStorage.clear()
    vi.clearAllMocks()
    const s = useUserStore(pinia)
    s.perms = []
    s.token = ''
    s.username = ''
    // 回到 /home，避免上一条用例停在 /category 导致同路由 push 不触发重定向
    await router.replace('/home').catch(() => {})
  })

  it('perms=[]（权限接口失败/数据缺失）时访问 /category 放行（fail-open，不再误弹回首页）', async () => {
    mockState.perms = []
    const store = useUserStore(pinia)
    store.token = 'fake-token'
    store.username = 'admin'
    store.perms = []

    await router.push('/category')
    await new Promise((r) => setTimeout(r, 80))
    console.log('当前路由:', router.currentRoute.value.path)
    expect(router.currentRoute.value.path).toBe('/category')
  })

  it('perms 非空且缺少所需权限时访问 /category 仍被拦截回 /home', async () => {
    mockState.perms = ['ware:sku:list']
    const store = useUserStore(pinia)
    store.token = 'fake-token'
    store.username = 'admin'
    store.perms = ['ware:sku:list']

    await router.push('/category')
    await new Promise((r) => setTimeout(r, 80))
    console.log('当前路由:', router.currentRoute.value.path)
    expect(router.currentRoute.value.path).toBe('/home')
  })

  it('perms=[*:*:*]（超管）时访问 /category 正常进入', async () => {
    mockState.perms = ['*:*:*']
    const store = useUserStore(pinia)
    store.token = 'fake-token'
    store.username = 'admin'
    store.perms = ['*:*:*'] // 模拟登录时已拉取到超管权限

    await router.push('/category')
    await new Promise((r) => setTimeout(r, 80))
    console.log('当前路由:', router.currentRoute.value.path)
    expect(router.currentRoute.value.path).toBe('/category')
  })
})
