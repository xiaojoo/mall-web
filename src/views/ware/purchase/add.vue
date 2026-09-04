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
      <el-form-item label="优先级" prop="priority">
        <el-input v-model="dataForm.priority" placeholder="优先级"></el-input>
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
  reqWarePurchaseInfo,
  reqWarePurchaseUpdateCommit,
} from '@/api/ware/purchase'

const dataForm = ref({
  id: 0,
  assigneeId: '',
  assigneeName: '',
  phone: '',
  priority: '',
  status: 0,
  wareId: '',
  amount: '',
  createTime: '',
  updateTime: '',
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
    await reqWarePurchaseUpdateCommit(
      dataForm.value.id > 0 ? 'update' : 'save',
      dataForm.value.id,
      dataForm.value.assigneeId,
      dataForm.value.assigneeName,
      dataForm.value.phone,
      dataForm.value.priority,
      dataForm.value.status,
      dataForm.value.wareId,
      dataForm.value.amount,
      dataForm.value.createTime,
      dataForm.value.updateTime,
    )
    ElMessage.success(`采购单${button.value}成功`)
  } catch (error) {
    console.error(`采购单${button.value}失败`, error)
  }
}

const init = (id: number) => {
  button.value = id > 0 ? '修改' : '添加'
  nextTick(async () => {
    dataForm.value.id = 0
    dataForm.value.assigneeId = ''
    dataForm.value.assigneeName = ''
    dataForm.value.phone = ''
    dataForm.value.priority = ''
    dataForm.value.status = 0
    dataForm.value.wareId = ''
    dataForm.value.amount = ''
    dataForm.value.createTime = ''
    dataForm.value.updateTime = ''
    if (id > 0) {
      try {
        const response = await reqWarePurchaseInfo(id)
        if (response.code === 200) {
          dataForm.value.id = response.data.id
          dataForm.value.assigneeId = response.data.assigneeId
          dataForm.value.assigneeName = response.data.assigneeName
          dataForm.value.phone = response.data.phone
          dataForm.value.priority = response.data.priority
          dataForm.value.status = response.data.status
          dataForm.value.wareId = response.data.wareId
          dataForm.value.amount = response.data.amount
          dataForm.value.createTime = response.data.createTime
          dataForm.value.updateTime = response.data.updateTime
        }
      } catch (error) {
        console.error('采购单信息获取失败:', error)
      }
    }
  })
}

// 暴露方法
defineExpose({ init })
</script>

<style scoped lang="scss"></style>
