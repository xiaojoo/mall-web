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
      <el-form-item label="订单号" prop="orderId">
        <el-input v-model="dataForm.orderId" placeholder="订单号"></el-input>
      </el-form-item>
      <el-form-item label="订单号（对外）" prop="orderSn">
        <el-input
          v-model="dataForm.orderSn"
          placeholder="订单号（对外）"
        ></el-input>
      </el-form-item>
      <el-form-item label="收货人" prop="consignee">
        <el-input v-model="dataForm.consignee" placeholder="收货人"></el-input>
      </el-form-item>
      <el-form-item label="收货人电话" prop="consigneeTel">
        <el-input
          v-model="dataForm.consigneeTel"
          placeholder="收货人电话"
        ></el-input>
      </el-form-item>
      <el-form-item label="配送地址" prop="deliveryAddress">
        <el-input
          v-model="dataForm.deliveryAddress"
          placeholder="配送地址"
        ></el-input>
      </el-form-item>
      <el-form-item label="订单备注" prop="orderComment">
        <el-input
          v-model="dataForm.orderComment"
          placeholder="订单备注"
        ></el-input>
      </el-form-item>
      <el-form-item
        label="付款方式【 1:在线付款 2:货到付款】"
        prop="paymentWay"
      >
        <el-input
          v-model="dataForm.paymentWay"
          placeholder="付款方式【 1:在线付款 2:货到付款】"
        ></el-input>
      </el-form-item>
      <el-form-item label="任务状态" prop="taskStatus">
        <el-input
          v-model="dataForm.taskStatus"
          placeholder="任务状态"
        ></el-input>
      </el-form-item>
      <el-form-item label="订单描述" prop="orderBody">
        <el-input
          v-model="dataForm.orderBody"
          placeholder="订单描述"
        ></el-input>
      </el-form-item>
      <el-form-item label="物流单号" prop="trackingNo">
        <el-input
          v-model="dataForm.trackingNo"
          placeholder="物流单号"
        ></el-input>
      </el-form-item>
      <el-form-item label="创建时间" prop="createTime">
        <el-input
          v-model="dataForm.createTime"
          placeholder="创建时间"
        ></el-input>
      </el-form-item>
      <el-form-item label="仓库id" prop="wareId">
        <el-input v-model="dataForm.wareId" placeholder="仓库id"></el-input>
      </el-form-item>
      <el-form-item label="工作单备注" prop="taskComment">
        <el-input
          v-model="dataForm.taskComment"
          placeholder="工作单备注"
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
import { nextTick, ref } from 'vue'

import { reqWareTaskInfo, reqWareTaskUpdateCommit } from '@/api/ware/task'

const dataForm = ref({
  id: 0,
  orderId: '',
  orderSn: '',
  consignee: '',
  consigneeTel: '',
  deliveryAddress: '',
  orderComment: '',
  paymentWay: '',
  taskStatus: '',
  orderBody: '',
  trackingNo: '',
  createTime: '',
  wareId: '',
  taskComment: '',
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
    await reqWareTaskUpdateCommit(
      dataForm.value.id > 0 ? 'update' : 'save',
      dataForm.value.id,
      dataForm.value.orderId,
      dataForm.value.orderSn,
      dataForm.value.consignee,
      dataForm.value.consigneeTel,
      dataForm.value.deliveryAddress,
      dataForm.value.orderComment,
      dataForm.value.paymentWay,
      dataForm.value.taskStatus,
      dataForm.value.orderBody,
      dataForm.value.trackingNo,
      dataForm.value.createTime,
      dataForm.value.wareId,
      dataForm.value.taskComment,
    )
    ElMessage.success(`仓库${button.value}成功`)
  } catch (error) {
    console.error(`仓库${button.value}失败`, error)
  }
}

const init = (id: number) => {
  button.value = id > 0 ? '修改' : '添加'
  nextTick(async () => {
    dataForm.value.id = 0
    dataForm.value.orderId = ''
    dataForm.value.orderSn = ''
    dataForm.value.consignee = ''
    dataForm.value.consigneeTel = ''
    dataForm.value.deliveryAddress = ''
    dataForm.value.orderComment = ''
    dataForm.value.paymentWay = ''
    dataForm.value.taskStatus = ''
    dataForm.value.orderBody = ''
    dataForm.value.trackingNo = ''
    dataForm.value.createTime = ''
    dataForm.value.wareId = ''
    dataForm.value.taskComment = ''
    if (id > 0) {
      try {
        const response = await reqWareTaskInfo(id)
        if (response.code === 200) {
          dataForm.value.id = response.data.id
          dataForm.value.orderId = response.data.orderId
          dataForm.value.orderSn = response.data.orderSn
          dataForm.value.consignee = response.data.consignee
          dataForm.value.consigneeTel = response.data.consigneeTel
          dataForm.value.deliveryAddress = response.data.deliveryAddress
          dataForm.value.orderComment = response.data.orderComment
          dataForm.value.paymentWay = response.data.paymentWay
          dataForm.value.taskStatus = response.data.taskStatus
          dataForm.value.orderBody = response.data.orderBody
          dataForm.value.trackingNo = response.data.trackingNo
          dataForm.value.createTime = response.data.createTime
          dataForm.value.wareId = response.data.wareId
          dataForm.value.taskComment = response.data.taskComment
        }
      } catch (error) {
        console.error('仓库信息获取失败:', error)
      }
    }
  })
}

// 暴露方法
defineExpose({ init })
</script>

<style scoped lang="scss"></style>
