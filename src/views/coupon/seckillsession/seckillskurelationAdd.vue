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
      <el-form-item label="每日秒杀" prop="promotionSessionId">
        <el-select
          v-model="dataForm.promotionSessionId"
          placeholder="选择每日秒杀场次"
          style="width: 100%"
        >
          <el-option
            v-for="s in sessionOptions"
            :key="s.id"
            :label="`${s.name || '场次#' + s.id}（${fmtTime(s.startTime)} ~ ${fmtTime(s.endTime)}）`"
            :value="String(s.id)"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="商品id" prop="skuId">
        <el-input v-model="dataForm.skuId" placeholder="商品id"></el-input>
      </el-form-item>
      <el-form-item label="秒杀价格" prop="seckillPrice">
        <el-input-number
          v-model="dataForm.seckillPrice"
          :min="0"
          :precision="2"
          :step="0.1"
        ></el-input-number>
      </el-form-item>
      <el-form-item label="秒杀总量" prop="seckillCount">
        <el-input-number
          v-model="dataForm.seckillCount"
          :min="1"
          label="秒杀总量"
        ></el-input-number>
      </el-form-item>
      <el-form-item label="每人限购数量" prop="seckillLimit">
        <el-input-number
          v-model="dataForm.seckillLimit"
          :min="1"
          label="每人限购数量"
        ></el-input-number>
      </el-form-item>
      <el-form-item label="排序" prop="seckillSort">
        <el-input v-model="dataForm.seckillSort" placeholder="排序"></el-input>
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

import {
  reqSeckillSkuRelationInfo,
  reqSeckillSkuRelationUpdateCommit,
  reqSeckillSessionList,
} from '@/api/coupon/seckillsession'

const dataForm = ref({
  id: 0,
  promotionId: '',
  promotionSessionId: '',
  skuId: '',
  seckillPrice: 0,
  seckillCount: 0,
  seckillLimit: 1,
  seckillSort: 0,
})
const button = ref('添加')
// 每日秒杀场次下拉选项（添加/关联商品合并：表单里直接选场次）
const sessionOptions = ref<any[]>([])

const props = defineProps(['modelValue', 'sessionId', 'skuId'])

const emit = defineEmits(['update:modelValue', 'refreshDataList'])

// 时间展示：去掉 T 只留 yyyy-MM-dd HH:mm:ss
const fmtTime = (v: any) =>
  String(v || '')
    .replace('T', ' ')
    .slice(0, 16)

// 加载每日秒杀场次选项
const loadSessions = async () => {
  try {
    const res: any = await reqSeckillSessionList(1, 100, '')
    if (res?.code === 200 && res.data?.list) {
      sessionOptions.value = res.data.list
    }
  } catch (error) {
    console.error('每日秒杀场次加载失败', error)
  }
}

onMounted(() => {
  loadSessions()
})

const updateVisible = (value: boolean) => {
  emit('update:modelValue', value)
}

// 处理取消按钮点击
const handleCancel = () => {
  updateVisible(false)
}

const dataFormSubmit = async () => {
  try {
    const res: any = await reqSeckillSkuRelationUpdateCommit(
      dataForm.value.id > 0 ? 'update' : 'save',
      dataForm.value.id,
      dataForm.value.promotionId,
      Number(dataForm.value.promotionSessionId) || 0,
      dataForm.value.skuId,
      dataForm.value.seckillPrice,
      dataForm.value.seckillCount,
      dataForm.value.seckillLimit,
      dataForm.value.seckillSort,
    )
    if (res?.code !== 200) {
      ElMessage.error(res?.message || res?.msg || `秒杀商品${button.value}失败`)
      return
    }
    ElMessage.success(`秒杀商品${button.value}成功`)
    // 新增/修改成功后：关闭弹窗 + 通知父组件刷新列表
    emit('update:modelValue', false)
    emit('refreshDataList')
  } catch (error) {
    console.error(`秒杀商品${button.value}失败`, error)
    ElMessage.error(`秒杀商品${button.value}失败`)
  }
}

const init = (id: number) => {
  button.value = id > 0 ? '修改' : '添加'
  nextTick(async () => {
    dataForm.value.id = 0
    dataForm.value.promotionId = ''
    // 新增：预选当前每日秒杀场次（页面带入），可切换；统一字符串与选项匹配
    dataForm.value.promotionSessionId = props.sessionId
      ? String(props.sessionId)
      : ''
    // 新增：从商品管理「参与秒杀」跳转带入的 skuId，可修改
    dataForm.value.skuId = props.skuId ? String(props.skuId) : ''
    dataForm.value.seckillPrice = 0
    dataForm.value.seckillCount = 0
    dataForm.value.seckillLimit = 1
    dataForm.value.seckillSort = 0
    if (id > 0) {
      try {
        const response = await reqSeckillSkuRelationInfo(id)
        if (response.code === 200) {
          dataForm.value.id = response.data.id
          dataForm.value.promotionId = response.data.promotionId
          dataForm.value.promotionSessionId =
            response.data.promotionSessionId != null
              ? String(response.data.promotionSessionId)
              : ''
          dataForm.value.skuId = response.data.skuId
          dataForm.value.seckillPrice = response.data.seckillPrice
          dataForm.value.seckillCount = response.data.seckillCount
          dataForm.value.seckillLimit = response.data.seckillLimit
          dataForm.value.seckillSort = response.data.seckillSort
        }
      } catch (error) {
        console.error('秒杀商品信息获取失败:', error)
      }
    }
  })
}

// 暴露方法
defineExpose({ init })
</script>

<style scoped lang="scss"></style>
