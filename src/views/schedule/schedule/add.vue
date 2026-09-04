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
      label-width="100px"
    >
      <el-form-item label="bean名称" prop="beanName">
        <el-input
          v-model="dataForm.beanName"
          placeholder="spring bean名称, 如: testTask"
        ></el-input>
      </el-form-item>
      <el-form-item label="参数" prop="params">
        <el-input v-model="dataForm.params" placeholder="参数"></el-input>
      </el-form-item>
      <el-form-item label="cron表达式" prop="cronExpression">
        <el-input
          v-model="dataForm.cronExpression"
          placeholder="如: 0 0 12 * * ?"
        ></el-input>
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="dataForm.remark" placeholder="备注"></el-input>
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

import { reqScheduleInfo, reqSchedulerUpdateCommit } from '@/api/schedule'

const dataForm = ref({
  id: 0,
  beanName: '',
  params: '',
  cronExpression: '',
  remark: '',
  status: 0,
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
    await reqSchedulerUpdateCommit(
      dataForm.value.id > 0 ? 'update' : 'save',
      dataForm.value.id,
      dataForm.value.beanName,
      dataForm.value.params,
      dataForm.value.cronExpression,
      dataForm.value.remark,
      dataForm.value.status,
    )
    ElMessage.success(`打折优惠${button.value}成功`)
  } catch (error) {
    console.error(`任务调度${button.value}失败`, error)
  }
}

const init = (id: number) => {
  button.value = id > 0 ? '修改' : '添加'
  nextTick(async () => {
    dataForm.value.id = 0
    dataForm.value.beanName = ''
    dataForm.value.params = ''
    dataForm.value.cronExpression = ''
    dataForm.value.remark = ''
    dataForm.value.status = 0
    if (id > 0) {
      try {
        const response = await reqScheduleInfo(id)
        if (response.code === 200) {
          dataForm.value.id = response.data.id
          dataForm.value.beanName = response.data.beanName
          dataForm.value.params = response.data.params
          dataForm.value.cronExpression = response.data.cronExpression
          dataForm.value.remark = response.data.remark
          dataForm.value.status = response.data.status
        }
      } catch (error) {
        console.error('任务调度信息获取失败:', error)
      }
    }
  })
}

// 暴露方法
defineExpose({ init })
</script>

<style scoped lang="scss"></style>
