<template>
  <el-dialog
    :model-value="modelValue"
    @update:model-value="updateVisible"
    title="批量添加属性分组"
    width="720px"
    :close-on-click-modal="false"
  >
    <el-alert
      type="info"
      :closable="false"
      show-icon
      style="margin-bottom: 12px"
    >
      <pre class="batch-format-example">
每行一个分组，格式：组名|排序|描述|图标；也支持粘贴 JSON 数组：
[
  { "attrGroupName": "组名", "sort": 1, "descript": "描述", "icon": "", "catelogId": 225 }
]
所属分类可多选，仅三级分类生效（每个生成一条）；JSON 里指定了 catelogId 则优先。</pre
      >
    </el-alert>

    <el-form label-width="80px">
      <el-form-item label="所属分类" required>
        <el-cascader
          v-model="catelogPath"
          :options="catgorys"
          :props="cascaderProps"
          filterable
          clearable
          placeholder="选择所属分类（可多选，仅三级分类可选）"
          style="width: 100%"
        />
      </el-form-item>
    </el-form>

    <el-input
      v-model="jsonText"
      type="textarea"
      :rows="8"
      placeholder="例如：&#10;颜色组|1|颜色相关分组&#10;尺寸组|2|尺寸相关分组&#10;材质组|3|材质相关分组|tag"
    />

    <div style="margin-top: 12px; text-align: right">
      <el-button link type="primary" @click="fillSample">
        填入格式示例
      </el-button>
      <el-button type="primary" :loading="submitting" @click="doBatchAdd">
        批量添加
      </el-button>
    </div>

    <el-table
      v-if="results.length > 0"
      :data="results"
      border
      stripe
      style="margin-top: 16px"
      max-height="260"
    >
      <el-table-column prop="index" label="序号" width="60" align="center" />
      <el-table-column prop="attrGroupName" label="组名" min-width="140" />
      <el-table-column prop="catelogName" label="所属分类" min-width="120" />
      <el-table-column label="结果" width="90" align="center">
        <template #default="scope">
          <el-tag :type="scope.row.success ? 'success' : 'danger'">
            {{ scope.row.success ? '成功' : '失败' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="分组ID" prop="attrGroupId" width="160" />
      <el-table-column
        v-if="hasFailure"
        label="失败原因"
        prop="error"
        min-width="160"
        :show-overflow-tooltip="true"
      >
        <template #default="scope">
          {{ scope.row.error || '-' }}
        </template>
      </el-table-column>
    </el-table>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { reqCategoryList } from '@/api/product/category'
import { reqAttrGroupBatchSave } from '@/api/product/attrgroup/index.ts'

defineProps(['modelValue'])
const emit = defineEmits(['update:modelValue', 'refreshDataList'])
const updateVisible = (value: boolean) => {
  emit('update:modelValue', value)
}

const catgorys = ref<any[]>([])
const cascaderProps = {
  value: 'catId',
  label: 'name',
  children: 'children',
  // element-plus 2.9 的 multiple 需写在 props 里（顶层 multiple 属性不生效）
  multiple: true,
  // 允许多选时勾选任意层级节点（不强制选叶子）
  checkStrictly: true,
}
// 多选：值为路径数组（每条路径是 [一级id, 二级id, ...]）
const catelogPath = ref<number[][]>([])
// 分类 id → 名称（结果表展示用）
const catNameMap = new Map<string, string>()
// 三级（叶子）分类 id 集合：只有叶子分类才生成数据
const leafCatIds = new Set<string>()

const jsonText = ref('')
const submitting = ref(false)
const results = ref<any[]>([])
const hasFailure = computed(() => results.value.some((r) => !r.success))

// 保险：勾选值里混入非三级分类时立即剔除（防搜索/其他入口绕过 disabled）
watch(
  catelogPath,
  (paths) => {
    if (!paths || paths.length === 0 || leafCatIds.size === 0) {
      return
    }
    const filtered = paths.filter((p) =>
      leafCatIds.has(String(p[p.length - 1])),
    )
    if (filtered.length !== paths.length) {
      catelogPath.value = filtered
    }
  },
  { deep: true },
)

const getMenus = async () => {
  try {
    const response = await reqCategoryList()
    // 非三级（有子节点）节点禁用勾选：只有三级分类能选中填入
    const enrichDisabled = (list: any[]): any[] =>
      (list || []).map((c: any) => {
        const hasChildren = c.children && c.children.length > 0
        return {
          ...c,
          disabled: hasChildren,
          children: hasChildren ? enrichDisabled(c.children) : undefined,
        }
      })
    catgorys.value = enrichDisabled(response.data)
    // 构建 分类id→名称 映射 与 叶子分类集合
    catNameMap.clear()
    leafCatIds.clear()
    const walk = (list: any[]) => {
      list.forEach((c: any) => {
        catNameMap.set(String(c.catId), c.name)
        if (c.children && c.children.length) {
          walk(c.children)
        } else {
          // 无子节点 = 三级叶子分类
          leafCatIds.add(String(c.catId))
        }
      })
    }
    walk(response.data || [])
  } catch (error) {
    console.error('获取分类列表失败', error)
  }
}

const fillSample = () => {
  jsonText.value = [
    '颜色组|1|颜色相关分组',
    '尺寸组|2|尺寸相关分组',
    '材质组|3|材质相关分组|tag',
  ].join('\n')
}

// 行格式：组名 | 排序 | 描述 | 图标
const parseLines = (text: string): any[] => {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split(/[|｜]/).map((s) => s.trim())
      return {
        attrGroupName: parts[0],
        sort: parts[1] !== undefined ? Number(parts[1]) || 0 : 0,
        descript: parts[2] || '',
        icon: parts[3] || '',
      }
    })
}

const doBatchAdd = async () => {
  // 多选：取每条路径末位作为分类 id；仅三级（叶子）分类生效，一级/二级忽略并提示
  const rawIds = catelogPath.value
    .map((path) => path[path.length - 1])
    .filter(Boolean)
  const ignoredCount = rawIds.filter((id) => !leafCatIds.has(String(id))).length
  const selectedCatIds = rawIds.filter((id) => leafCatIds.has(String(id)))
  if (selectedCatIds.length === 0) {
    ElMessage.warning('请选择三级分类（一级/二级不生成数据）')
    return
  }
  if (ignoredCount > 0) {
    ElMessage.warning(
      `已忽略 ${ignoredCount} 个一级/二级分类，仅三级分类生成数据`,
    )
  }
  const t = jsonText.value.trim()
  if (!t) {
    ElMessage.warning('请输入分组数据')
    return
  }

  let list: any[]
  try {
    if (t.startsWith('[')) {
      const arr = JSON.parse(t)
      if (!Array.isArray(arr)) {
        throw new Error('JSON 必须是数组')
      }
      list = arr
    } else {
      list = parseLines(t)
    }
    // 统一补默认值；JSON 指定 catelogId 的条目不展开，否则每个选中分类各生成一条
    list = list.flatMap((item: any) => {
      const base = {
        attrGroupName: String(item.attrGroupName ?? '').trim(),
        sort: item.sort ?? 0,
        descript: item.descript ?? '',
        icon: item.icon ?? '',
      }
      const catIds = item.catelogId ? [item.catelogId] : selectedCatIds
      return catIds.map((catelogId: number) => ({
        ...base,
        catelogId,
        catelogName: catNameMap.get(String(catelogId)) || '',
      }))
    })
  } catch (e: any) {
    ElMessage.error(e.message || '数据格式错误')
    return
  }

  submitting.value = true
  try {
    const res: any = await reqAttrGroupBatchSave(list)
    if (res && res.code === 200) {
      // 后端返回不含分类名，按序号合并回显
      results.value = (res.data || []).map((row: any, i: number) => ({
        ...row,
        catelogName: list[i]?.catelogName || '',
      }))
      const okCount = results.value.filter((r) => r.success).length
      ElMessage.success(
        `批量添加完成：成功 ${okCount} / ${results.value.length}`,
      )
      if (okCount > 0) {
        emit('refreshDataList')
      }
    } else {
      ElMessage.error(res?.message || res?.msg || '批量添加失败')
    }
  } catch (error) {
    console.error('批量添加属性分组失败', error)
    ElMessage.error('批量添加失败')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  getMenus()
})
</script>

<style lang="scss" scoped>
// 格式示例：说明 + JSON 一体代码块展示
.batch-format-example {
  margin: 0;
  padding-left: 15px;
  border-left: 1px solid rgba(0, 0, 0, 0.04);
  font-family: 'SFMono-Regular', Consolas, Menlo, monospace;
  font-size: 12px;
  line-height: 1.8;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
