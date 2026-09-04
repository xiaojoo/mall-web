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
      <el-form-item label="活动标题" prop="title">
        <el-input v-model="dataForm.title" placeholder="活动标题"></el-input>
      </el-form-item>
      <el-form-item label="生效日期" prop="enableStartTime">
        <el-date-picker
          v-model="dataForm.timeRange"
          type="datetimerange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        ></el-date-picker>
      </el-form-item>
      <el-form-item label="上下线状态" prop="status">
        <el-select v-model="dataForm.status" placeholder="上下线状态">
          <el-option :value="1" label="上线"></el-option>
          <el-option :value="0" label="下线"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="创建人" prop="userId">
        <el-input v-model="dataForm.userId" placeholder="创建人"></el-input>
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
import { nextTick, ref } from 'vue'

import {
  reqSeckillPromotionInfo,
  reqSeckillPromotionUpdateCommit,
} from '@/api/coupon/seckill'

const dataForm = ref({
  id: 0,
  title: '',
  startTime: '',
  endTime: '',
  status: 0,
  createTime: '',
  userId: '',
  timeRange: [''],
})
const button = ref('添加')

defineProps(['modelValue'])

const emit = defineEmits(['update:modelValue'])

const updateVisible = (value: boolean) => {
  emit('update:modelValue', value)
}

// 处理取消按钮点击
const handleCancel = () => {
  updateVisible(false)
}

const dataFormSubmit = async () => {
  try {
    await reqSeckillPromotionUpdateCommit(
      dataForm.value.id > 0 ? 'update' : 'save',
      dataForm.value.id,
      dataForm.value.title,
      dataForm.value.timeRange[0],
      dataForm.value.timeRange[1],
      dataForm.value.status,
      // new Date().toLocaleString(),
      dataForm.value.userId,
    )
    ElMessage.success(`专题活动${button.value}成功`)
  } catch (error) {
    console.error(`专题活动${button.value}失败`, error)
  }
}

const init = (id: number) => {
  button.value = id > 0 ? '修改' : '添加'
  nextTick(async () => {
    dataForm.value.id = 0
    dataForm.value.title = ''
    dataForm.value.startTime = ''
    dataForm.value.endTime = ''
    dataForm.value.status = 0
    dataForm.value.createTime = ''
    dataForm.value.userId = ''
    dataForm.value.timeRange = []
    if (id > 0) {
      try {
        const response = await reqSeckillPromotionInfo(id)
        if (response.code === 200) {
          dataForm.value.id = response.data.id
          dataForm.value.title = response.data.title
          dataForm.value.startTime = response.data.startTime
          dataForm.value.endTime = response.data.endTime
          dataForm.value.status = response.data.status
          dataForm.value.createTime = response.data.createTime
          dataForm.value.userId = response.data.userId
          dataForm.value.timeRange.push(dataForm.value.startTime)
          dataForm.value.timeRange.push(dataForm.value.endTime)
        }
      } catch (error) {
        console.error('专题活动信息获取失败:', error)
      }
    }
  })
}

// 暴露方法
defineExpose({ init })
</script>

<style scoped lang="scss"></style>
