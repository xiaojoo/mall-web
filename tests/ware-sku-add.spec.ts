import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ElementPlus from 'element-plus'

// 商品库存「新增/修改」弹窗（ware/sku/add.vue）回归测试：
// 四级菜单（分类三级 + SKU 第四级），三级分类可多选，SKU 显示名称、提交 ID；
// 商品管理「更多→库存管理」跳转预填的 skuId 能回显分类路径。
const mocks = vi.hoisted(() => {
  const categoryChildren = vi.fn(async (cid: number) => {
    if (cid === 0) {
      return {
        code: 200,
        data: [
          { catId: 1, name: '一级A' },
          { catId: 4, name: '一级B' },
        ],
      }
    }
    if (cid === 1) {
      return { code: 200, data: [{ catId: 2, name: '二级A' }] }
    }
    if (cid === 2) {
      return { code: 200, data: [{ catId: 3, name: '三级A' }] }
    }
    return { code: 200, data: [] }
  })
  const skuByCatelog = vi.fn(async () => ({
    code: 200,
    data: { list: [{ skuId: 111, skuName: 'SKU-A' }] },
  }))
  const skuPath = vi.fn(async () => ({
    code: 200,
    data: { skuName: 'SKU-A', catalogPath: [1, 2, 3] },
  }))
  return { categoryChildren, skuByCatelog, skuPath }
})

vi.mock('@/api/ware/sku', () => ({
  reqCategoryChildren: mocks.categoryChildren,
  reqSkuByCatelog: mocks.skuByCatelog,
  reqSkuPath: mocks.skuPath,
  reqWareSkuInfo: vi.fn(),
  reqWareSkuUpdateCommit: vi.fn(),
}))

vi.mock('@/api/ware/wareinfo', () => ({
  reqWareInfoList: vi.fn(async () => ({
    code: 200,
    data: { list: [{ id: 1, name: '华东仓' }] },
  })),
}))

import SkuAdd from '@/views/ware/sku/add.vue'

describe('商品库存添加弹窗（四级菜单）', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  const mountAdd = (props: Record<string, any> = {}) =>
    mount(SkuAdd, {
      props: { modelValue: true, skuId: 0, ...props },
      global: {
        plugins: [ElementPlus, createPinia()],
        // el-dialog 默认 teleport 到 body，测试里关掉以便在 wrapper 内断言
        stubs: { teleport: { template: '<div><slot /></div>' } },
      },
    })

  const findCascader = (wrapper: any) =>
    wrapper.findComponent({ name: 'ElCascader' })

  it('四级菜单配置：lazy + 多选 + checkStrictly', async () => {
    const wrapper = mountAdd()
    await flushPromises()

    const cascader = findCascader(wrapper)
    expect(cascader.exists()).toBe(true)
    // element-plus 2.9：multiple/checkStrictly 需在 props 内
    expect(cascader.props('props')).toMatchObject({
      lazy: true,
      multiple: true,
      checkStrictly: true,
    })
  })

  it('商品管理跳转预填 skuId：回显四级别联路径并显示 SKU 名称', async () => {
    const wrapper = mountAdd({ skuId: 111 })
    await flushPromises()
    ;(wrapper.vm as any).init(0) // 与 index.vue 打开弹窗后一致
    await flushPromises()
    await flushPromises()

    // 预填路径 [1,2,3,111]（一级→二级→三级→SKU）
    expect(findCascader(wrapper).props('modelValue')).toEqual([[1, 2, 3, 111]])
    // 按分类懒加载路径各级（一级→二级→三级→SKU）
    expect(mocks.categoryChildren).toHaveBeenCalledWith(0)
    expect(mocks.categoryChildren).toHaveBeenCalledWith(1)
    expect(mocks.categoryChildren).toHaveBeenCalledWith(2)
    // 显示的是名称
    expect(wrapper.text()).toContain('SKU-A')
    expect(wrapper.text()).toContain('已选：SKU-A（ID: 111）')
  })

  it('只勾选三级分类（多选）未选 SKU 时不清空提交值', async () => {
    const wrapper = mountAdd()
    await flushPromises()
    ;(wrapper.vm as any).init(0)
    await flushPromises()

    // 模拟勾选两个三级分类（长度 3 的路径）
    const cascader = findCascader(wrapper)
    const twoCats = [
      [1, 2, 3],
      [1, 2, 6],
    ]
    cascader.vm.$emit('update:modelValue', twoCats)
    cascader.vm.$emit('change', twoCats)
    await flushPromises()
    // 未选 SKU：级联保留分类多选
    expect(cascader.props('modelValue')).toEqual([
      [1, 2, 3],
      [1, 2, 6],
    ])
    expect(wrapper.text()).not.toContain('已选：')
  })

  it('选择第四级 SKU：显示名称、提交 ID，且只保留一个 SKU 路径', async () => {
    const wrapper = mountAdd()
    await flushPromises()
    ;(wrapper.vm as any).init(0)
    await flushPromises()

    const cascader = findCascader(wrapper)
    // 先勾分类再选 SKU：SKU 路径长度 4（真实交互中展开分类的 lazyLoad
    // 会先填充 skuNameMap，这里分两步模拟）
    const withSku = [
      [1, 2, 3],
      [1, 2, 3, 111],
    ]
    cascader.vm.$emit('update:modelValue', withSku)
    await flushPromises() // 级联懒加载路径，填充 skuId→名称映射
    cascader.vm.$emit('change', withSku)
    await flushPromises()

    // 选中 SKU 后自动取消三级分类勾选，只保留 SKU 路径（SKU 单选）
    expect(cascader.props('modelValue')).toEqual([[1, 2, 3, 111]])
    // 显示名称、提交用 ID
    expect(wrapper.text()).toContain('已选：SKU-A（ID: 111）')
  })
})
