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
      <el-form-item label="会员Id" prop="memberId">
        <el-input
          v-model="dataForm.memberId"
          placeholder="member_id"
        ></el-input>
      </el-form-item>
      <el-form-item label="sku_id" prop="skuId">
        <el-input v-model="dataForm.skuId" placeholder="sku_id"></el-input>
      </el-form-item>
      <el-form-item label="活动场次id" prop="sessionId">
        <el-input
          v-model="dataForm.sessionId"
          placeholder="活动场次id"
        ></el-input>
      </el-form-item>
      <el-form-item label="订阅时间" prop="subcribeTime">
        <el-input
          v-model="dataForm.subcribeTime"
          placeholder="订阅时间"
        ></el-input>
      </el-form-item>
      <el-form-item label="发送时间" prop="sendTime">
        <el-input v-model="dataForm.sendTime" placeholder="发送时间"></el-input>
      </el-form-item>
      <el-form-item label="通知方式" prop="noticeType">
        <el-select v-model="dataForm.noticeType" placeholder="请选择">
          <el-option label="短信" :value="0"></el-option>
          <el-option label="邮件" :value="1"></el-option>
        </el-select>
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
  reqSeckillSkuNoticeInfo,
  reqSeckillSkuNoticeUpdateCommit,
} from '@/api/coupon/seckillskunotice'

const dataForm = ref({
  id: 0,
  memberId: '',
  skuId: '',
  sessionId: '',
  subcribeTime: '',
  sendTime: '',
  noticeType: '',
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
    await reqSeckillSkuNoticeUpdateCommit(
      dataForm.value.id > 0 ? 'update' : 'save',
      dataForm.value.id,
      dataForm.value.memberId,
      dataForm.value.skuId,
      dataForm.value.sessionId,
      dataForm.value.subcribeTime,
      dataForm.value.sendTime,
      dataForm.value.noticeType,
    )
    ElMessage.success(`spu专题${button.value}成功`)
  } catch (error) {
    console.error(`秒杀配置${button.value}失败`, error)
  }
}

const init = (id: number) => {
  button.value = id > 0 ? '修改' : '添加'
  nextTick(async () => {
    dataForm.value.id = 0
    dataForm.value.memberId = ''
    dataForm.value.sessionId = ''
    dataForm.value.subcribeTime = ''
    dataForm.value.sendTime = ''
    dataForm.value.noticeType = ''
    if (id > 0) {
      try {
        const response = await reqSeckillSkuNoticeInfo(id)
        if (response.code === 200) {
          dataForm.value.id = response.data.id
          dataForm.value.memberId = response.data.memberId
          dataForm.value.sessionId = response.data.sessionId
          dataForm.value.subcribeTime = response.data.subcribeTime
          dataForm.value.sendTime = response.data.sendTime
          dataForm.value.noticeType = response.data.noticeType
        }
      } catch (error) {
        console.error('秒杀配置信息获取失败:', error)
      }
    }
  })
}

// 暴露方法
defineExpose({ init })
</script>

<style scoped lang="scss"></style>
