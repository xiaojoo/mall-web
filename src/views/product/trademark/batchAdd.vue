<template>
  <el-dialog
    :model-value="visible"
    @update:model-value="updateVisible"
    title="批量添加品牌"
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
每行一个品牌，格式：品牌名|图片|首字母（如 华为|https://.../huawei.png|H）；也支持粘贴 JSON 数组：
[
  { "name": "品牌名", "logo": "https://.../logo.png", "firstLetter": "A", "sort": 1 }
]
品牌介绍留空时自动用品牌名填充；首字母留空时自动取英文品牌名首字母。</pre
      >
    </el-alert>

    <el-input
      v-model="jsonText"
      type="textarea"
      :rows="10"
      placeholder="例如：&#10;华为|https://example.com/huawei.png|H&#10;小米|https://example.com/xiaomi.png|X&#10;苹果"
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
      <el-table-column prop="name" label="品牌名" min-width="140" />
      <el-table-column label="结果" width="90" align="center">
        <template #default="scope">
          <el-tag :type="scope.row.success ? 'success' : 'danger'">
            {{ scope.row.success ? '成功' : '失败' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="品牌ID" prop="brandId" width="160" />
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
import { computed, ref } from 'vue'
import { reqBatchSaveTrademark } from '@/api/product/trademark'
import type { TradeMark } from '@/api/product/trademark/type.ts'

defineProps<{ visible: boolean }>()
const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'refreshDataList'): void
}>()
const updateVisible = (value: boolean) => {
  emit('update:visible', value)
}

const jsonText = ref('')
const submitting = ref(false)
const results = ref<any[]>([])
// 存在失败时才展示“失败原因”列
const hasFailure = computed(() => results.value.some((r) => !r.success))

const fillSample = () => {
  jsonText.value = [
    '华为|https://example.com/huawei.png|H',
    '小米|https://example.com/xiaomi.png|X',
    '苹果',
  ].join('\n')
}

// 首字母：有传则用，否则英文品牌名取首字母大写，中文留空
const firstLetterOf = (name: string): string => {
  const ch = name.trim().charAt(0)
  return /[a-zA-Z]/.test(ch) ? ch.toUpperCase() : ''
}

const normalize = (raw: any): TradeMark => {
  // 首字母：指定 > 英文品牌名首字母自动；品牌介绍留空则用品牌名填充
  const firstLetter = raw.firstLetter
    ? String(raw.firstLetter).trim().toUpperCase()
    : firstLetterOf(raw.name || '')
  return {
    name: String(raw.name ?? '').trim(),
    logo: raw.logo || '',
    descript: String(raw.descript || raw.name || '').trim(),
    showStatus: raw.showStatus ?? 1,
    firstLetter,
    sort: raw.sort ?? 0,
  }
}

const parseInput = (text: string): TradeMark[] => {
  const t = text.trim()
  if (!t) {
    throw new Error('请输入品牌数据')
  }
  // 支持 JSON 数组
  if (t.startsWith('[')) {
    try {
      const arr = JSON.parse(t)
      if (!Array.isArray(arr)) {
        throw new Error('JSON 必须是数组')
      }
      return arr.map(normalize)
    } catch (e: any) {
      // JSON 解析失败给出明确提示
      throw new Error('JSON 解析失败：' + (e.message || e))
    }
  }
  // 行格式：品牌名 | 图片 | 首字母（兼容 4 段：品牌名|品牌介绍|图片|首字母；中文竖线也支持）
  return t
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split(/[|｜]/).map((s) => s.trim())
      let name = parts[0]
      let descript = ''
      let logo = ''
      let firstLetter = ''
      if (parts.length >= 4) {
        // 品牌名|品牌介绍|图片|首字母
        descript = parts[1]
        logo = parts[2]
        firstLetter = parts[3]
      } else {
        logo = parts[1] || ''
        firstLetter = parts[2] || ''
      }
      return normalize({ name, descript, logo, firstLetter })
    })
}

const doBatchAdd = async () => {
  let list: TradeMark[]
  try {
    list = parseInput(jsonText.value)
  } catch (e: any) {
    ElMessage.error(e.message || '数据格式错误')
    return
  }
  submitting.value = true
  try {
    const res: any = await reqBatchSaveTrademark(list)
    if (res && res.code === 200) {
      results.value = res.data || []
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
    console.error('批量添加品牌失败', error)
    ElMessage.error('批量添加失败')
  } finally {
    submitting.value = false
  }
}
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
