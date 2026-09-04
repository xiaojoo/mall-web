<template>
  <el-dialog
    :model-value="modelValue"
    @update:model-value="updateVisible"
    :close-on-click-modal="false"
    :title="button"
  >
    <el-form
      :model="dataForm"
      @keyup.enter.native="dataFormSubmit()"
      label-width="120px"
    >
      <el-form-item label="SKU" required>
        <!-- 四级菜单：一级→二级→三级分类→SKU；三级分类可多选，SKU 显示名称、值为 ID -->
        <el-cascader
          v-model="skuPath"
          :props="cascaderProps"
          :disabled="cascaderDisabled"
          placeholder="选择分类后选择SKU（三级分类可多选）"
          clearable
          style="width: 100%"
          @change="onCascaderChange"
        />
        <div v-if="dataForm.skuId" class="sku-selected">
          已选：{{ dataForm.skuName }}（ID: {{ dataForm.skuId }}）
        </div>
      </el-form-item>
      <el-form-item label="仓库" prop="wareId">
        <el-select
          v-model="dataForm.wareId"
          placeholder="请选择仓库"
          clearable
          show-overflow-tooltip
          style="width: 100%"
        >
          <el-option
            v-for="w in wareList"
            :label="w.name"
            :value="w.id"
            :key="w.id"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="库存数" prop="stock">
        <el-input v-model="dataForm.stock" placeholder="库存数"></el-input>
      </el-form-item>
      <el-form-item label="锁定库存" prop="stockLocked">
        <el-input
          v-model="dataForm.stockLocked"
          placeholder="锁定库存"
        ></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="dataFormSubmit()">
          {{ button }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>
<script setup lang="ts">
import { nextTick, ref, onMounted } from 'vue'

import { reqWareInfoList } from '@/api/ware/wareinfo'
import {
  reqCategoryChildren,
  reqSkuByCatelog,
  reqSkuPath,
  reqWareSkuInfo,
  reqWareSkuUpdateCommit,
} from '@/api/ware/sku'

const dataForm = ref({
  id: 0,
  skuId: undefined as number | undefined,
  wareId: '',
  stock: 0,
  skuName: '',
  stockLocked: 0,
})
const button = ref('添加')
const wareList = ref([
  {
    id: 0,
    name: '',
  },
])
// 四级菜单：分类三级 + SKU 第四级；SKU 节点显示名称、值为 skuId
const skuPath = ref<number[][]>([])
const cascaderDisabled = ref(false)
// skuId → skuName（懒加载 SKU 节点时记录，用于回显/提交）
const skuNameMap = new Map<number, string>()
const cascaderProps = {
  lazy: true,
  // element-plus 2.9 的 multiple 需写在 props 里（顶层 multiple 属性不生效）
  multiple: true,
  // 允许多选时勾选任意层级节点（三级分类可多选）
  checkStrictly: true,
  lazyLoad: async (node: any, resolve: any) => {
    const { level, value } = node
    if (level < 3) {
      // 分类层级：根(0) 或按父级查子分类；一级/二级禁用勾选（仅可展开），三级可勾选
      const parentCid = level === 0 ? 0 : value
      try {
        const res = await reqCategoryChildren(parentCid)
        const nodes = (res.data || []).map((c: any) => ({
          value: c.catId,
          label: c.name,
          leaf: false,
          disabled: level < 2,
        }))
        resolve(nodes)
      } catch (e) {
        console.error('加载分类失败', e)
        resolve([])
      }
    } else if (level === 3) {
      // 第三级分类下加载 SKU（叶子节点）：显示名称，值为 skuId
      try {
        const res = await reqSkuByCatelog(value)
        const nodes = (res.data?.list || []).map((s: any) => {
          skuNameMap.set(s.skuId, s.skuName)
          return { value: s.skuId, label: s.skuName, leaf: true }
        })
        resolve(nodes)
      } catch (e) {
        console.error('加载SKU失败', e)
        resolve([])
      }
    } else {
      resolve([])
    }
  },
}
// 级联变化：SKU 路径长度=4、三级分类路径长度=3；SKU 单选（多个时只留最后一个，
// 并自动取消三级分类勾选），提交取 SKU 路径末位 ID
const onCascaderChange = (val: any) => {
  const paths: number[][] = val || []
  const skuPaths = paths.filter((p) => p.length === 4)
  if (skuPaths.length > 0) {
    const last = skuPaths[skuPaths.length - 1]
    if (paths.length !== 1 || paths[0] !== last) {
      skuPath.value = [last]
    }
    const skuId = last[3]
    dataForm.value.skuId = skuId
    dataForm.value.skuName = skuNameMap.get(skuId) || `SKU#${skuId}`
  } else {
    // 仅勾选了三级分类（多选）或清空：SKU 未定
    dataForm.value.skuId = undefined
    dataForm.value.skuName = ''
  }
}

const props = defineProps(['modelValue', 'skuId'])

const emit = defineEmits(['update:modelValue'])

const updateVisible = (value: boolean) => {
  emit('update:modelValue', value)
}

// 处理取消按钮点击
const handleCancel = () => {
  updateVisible(false)
}

const getWares = async () => {
  try {
    const response = await reqWareInfoList(1, 500, '')
    if (response && response.code === 200) {
      wareList.value = response.data.list
    }
  } catch (error) {
    console.error(error)
  }
}

const dataFormSubmit = async () => {
  if (!dataForm.value.skuId) {
    ElMessage.warning('请先选择SKU')
    return
  }
  try {
    await reqWareSkuUpdateCommit(
      dataForm.value.id > 0 ? 'update' : 'save',
      dataForm.value.id,
      dataForm.value.skuId,
      dataForm.value.wareId,
      dataForm.value.stock,
      dataForm.value.skuName,
      dataForm.value.stockLocked,
    )
    ElMessage.success(`库存${button.value}成功`)
  } catch (error) {
    console.error(`库存${button.value}失败`, error)
  }
}

const init = (id: number) => {
  button.value = id > 0 ? '修改' : '添加'
  nextTick(async () => {
    dataForm.value.id = 0
    dataForm.value.skuId = undefined
    dataForm.value.wareId = ''
    dataForm.value.stock = 0
    dataForm.value.skuName = ''
    dataForm.value.stockLocked = 0
    if (id > 0) {
      try {
        const response = await reqWareSkuInfo(id)
        if (response.code === 200 && response.data) {
          const ws = response.data
          dataForm.value.id = ws.id
          dataForm.value.skuId = ws.skuId
          dataForm.value.wareId = ws.wareId
          dataForm.value.stock = ws.stock
          dataForm.value.skuName = ws.skuName
          dataForm.value.stockLocked = ws.stockLocked
          // 回显分类路径（编辑时 SKU 只读，不可改）
          cascaderDisabled.value = true
          try {
            const pathRes = await reqSkuPath(ws.skuId)
            if (pathRes.code === 200 && pathRes.data?.catalogPath) {
              dataForm.value.skuName = ws.skuName || pathRes.data.skuName || ''
              skuNameMap.set(ws.skuId, dataForm.value.skuName)
              skuPath.value = [[...pathRes.data.catalogPath, ws.skuId]]
            }
          } catch (e) {
            console.error('SKU分类路径获取失败', e)
          }
        } else {
          ElMessage.error(response?.message || '库存信息获取失败')
        }
      } catch (error) {
        console.error('库存信息获取失败:', error)
      }
    } else {
      cascaderDisabled.value = false
      skuPath.value = []
      // 商品管理「库存管理」跳转带入的 skuId：预填分类路径与 SKU
      if (props.skuId) {
        const presetId = Number(props.skuId)
        try {
          const pathRes = await reqSkuPath(presetId)
          if (pathRes.code === 200 && pathRes.data?.catalogPath) {
            dataForm.value.skuId = presetId
            dataForm.value.skuName = pathRes.data.skuName || ''
            skuNameMap.set(presetId, dataForm.value.skuName)
            skuPath.value = [[...pathRes.data.catalogPath, presetId]]
          }
        } catch (e) {
          console.error('SKU分类路径获取失败', e)
        }
      }
    }
  })
}

// 暴露方法
defineExpose({ init })

onMounted(() => {
  getWares()
  // 不自动触发SKU搜索，等待用户点击搜索按钮
})
</script>

<style scoped lang="scss">
.sku-selected {
  margin-top: 8px;
  font-size: 13px;
  color: var(--el-color-primary);
}
</style>
