import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ElementPlus from 'element-plus'

// 商品管理「更多 → 库存管理」跳转商品库存页（/sku?skuId=xxx）的回归测试：
// 应自动弹开「添加」弹窗并把 skuId 预填给 Add 组件；弹窗关闭后清除路由中的 skuId。
const mocks = vi.hoisted(() => {
  const routeQuery: Record<string, string> = {}
  const routerReplace = vi.fn()
  return { routeQuery, routerReplace }
})

vi.mock('vue-router', () => ({
  useRoute: () => ({ query: mocks.routeQuery }),
  useRouter: () => ({ replace: mocks.routerReplace }),
}))

vi.mock('@/api/ware/sku', () => ({
  reqWareSkuDelete: vi.fn(),
  reqWareSkuInfoList: vi.fn(async () => ({
    code: 200,
    data: { list: [], totalCount: 0 },
  })),
}))

vi.mock('@/api/ware/wareinfo', () => ({
  reqWareInfoList: vi.fn(async () => ({ code: 200, data: { list: [] } })),
}))

import SkuIndex from '@/views/ware/sku/index.vue'

// 用桩替换 Add 子组件：只验证 index.vue 是否自动打开弹窗并传入 skuId
const AddStub = {
  name: 'Add',
  template: '<div class="add-stub" />',
  props: ['modelValue', 'skuId'],
  emits: ['update:modelValue'],
  methods: { init: () => {} },
}

describe('商品管理→库存管理跳转（/sku?skuId=xxx）', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    delete mocks.routeQuery.skuId
    mocks.routerReplace.mockClear()
  })

  it('携带 skuId 进入商品库存页时自动弹开添加框并预填 skuId', async () => {
    mocks.routeQuery.skuId = '123'
    const wrapper = mount(SkuIndex, {
      global: {
        plugins: [ElementPlus, createPinia()],
        stubs: { Add: AddStub },
        directives: { perms: {} },
      },
    })
    await flushPromises()

    const addStub = wrapper.findComponent(AddStub)
    expect(addStub.exists()).toBe(true)
    // 添加弹窗已打开
    expect(addStub.props('modelValue')).toBe(true)
    // skuId 预填（number 化后传给 Add）
    expect(addStub.props('skuId')).toBe(123)
  })

  it('无 skuId 参数时添加弹窗保持关闭', async () => {
    const wrapper = mount(SkuIndex, {
      global: {
        plugins: [ElementPlus, createPinia()],
        stubs: { Add: AddStub },
        directives: { perms: {} },
      },
    })
    await flushPromises()

    const addStub = wrapper.findComponent(AddStub)
    expect(addStub.props('modelValue')).toBe(false)
    expect(addStub.props('skuId')).toBe(0)
  })

  it('添加弹窗关闭后清除路由中的 skuId 参数', async () => {
    mocks.routeQuery.skuId = '123'
    const wrapper = mount(SkuIndex, {
      global: {
        plugins: [ElementPlus, createPinia()],
        stubs: { Add: AddStub },
        directives: { perms: {} },
      },
    })
    await flushPromises()

    const addStub = wrapper.findComponent(AddStub)
    expect(addStub.props('modelValue')).toBe(true)

    // 模拟取消/保存成功关闭弹窗（Add 触发 update:modelValue false）
    addStub.vm.$emit('update:modelValue', false)
    await flushPromises()

    expect(mocks.routerReplace).toHaveBeenCalledWith({ query: {} })
  })
})
