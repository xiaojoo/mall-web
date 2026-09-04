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
      <el-form-item label="场次名称" prop="name">
        <el-input v-model="dataForm.name" placeholder="场次名称"></el-input>
      </el-form-item>
      <el-form-item label="每日开始时间" prop="startTime">
        <el-date-picker
          type="datetime"
          placeholder="每日开始时间"
          v-model="dataForm.startTime"
        ></el-date-picker>
      </el-form-item>
      <el-form-item label="每日结束时间" prop="endTime">
        <el-date-picker
          type="datetime"
          placeholder="每日结束时间"
          v-model="dataForm.endTime"
        ></el-date-picker>
      </el-form-item>
      <el-form-item label="启用状态" prop="status">
        <el-input v-model="dataForm.status" placeholder="启用状态"></el-input>
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
  reqSeckillSessionInfo,
  reqSeckillSessionUpdateCommit,
} from '@/api/coupon/seckillsession'

const dataForm = ref({
  id: 0,
  name: '',
  startTime: '',
  endTime: '',
  status: '',
  createTime: '',
})
const button = ref('添加')

defineProps(['modelValue'])

const emit = defineEmits(['update:modelValue', 'refreshDataList'])

const updateVisible = (value: boolean) => {
  emit('update:modelValue', value)
}

// 处理取消按钮点击
const handleCancel = () => {
  updateVisible(false)
}

const dataFormSubmit = async () => {
  try {
    const res: any = await reqSeckillSessionUpdateCommit(
      dataForm.value.id > 0 ? 'update' : 'save',
      dataForm.value.id,
      dataForm.value.name,
      dataForm.value.startTime,
      dataForm.value.endTime,
      dataForm.value.status,
      new Date(),
    )
    if (res?.code !== 200) {
      ElMessage.error(res?.message || res?.msg || `每日秒杀${button.value}失败`)
      return
    }
    ElMessage.success(`每日秒杀${button.value}成功`)
    // 新增/修改成功后：关闭弹窗 + 通知父组件刷新列表
    emit('update:modelValue', false)
    emit('refreshDataList')
  } catch (error) {
    console.error(`每日秒杀${button.value}失败`, error)
    ElMessage.error(`每日秒杀${button.value}失败`)
  }
}

const init = (id: number) => {
  button.value = id > 0 ? '修改' : '添加'
  nextTick(async () => {
    dataForm.value.id = 0
    dataForm.value.name = ''
    dataForm.value.startTime = ''
    dataForm.value.endTime = ''
    dataForm.value.status = ''
    dataForm.value.createTime = ''
    if (id > 0) {
      try {
        const response = await reqSeckillSessionInfo(id)
        if (response.code === 200) {
          dataForm.value.id = response.data.id
          dataForm.value.name = response.data.name
          dataForm.value.startTime = response.data.startTime
          dataForm.value.endTime = response.data.endTime
          dataForm.value.status = response.data.status
          dataForm.value.createTime = response.data.createTime
        }
      } catch (error) {
        console.error('每日秒杀信息获取失败:', error)
      }
    }
  })
}

// 暴露方法
defineExpose({ init })
</script>

<style scoped lang="scss"></style>
