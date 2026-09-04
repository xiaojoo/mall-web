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
      label-width="140px"
    >
      <el-form-item label="spu_id" prop="skuId">
        <el-input v-model="dataForm.skuId" placeholder="spu_id"></el-input>
      </el-form-item>
      <el-form-item label="满几件" prop="fullCount">
        <el-input v-model="dataForm.fullCount" placeholder="满几件"></el-input>
      </el-form-item>
      <el-form-item label="打几折" prop="discount">
        <el-input v-model="dataForm.discount" placeholder="打几折"></el-input>
      </el-form-item>
      <el-form-item label="折后价" prop="price">
        <el-input v-model="dataForm.price" placeholder="折后价"></el-input>
      </el-form-item>
      <el-form-item label="是否叠加其他优惠" prop="addOther">
        <el-select v-model="dataForm.addOther" placeholder="请选择">
          <el-option label="不可叠加" :value="0"></el-option>
          <el-option label="可以叠加" :value="1"></el-option>
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
  reqSkuLadderInfo,
  reqSkuLadderUpdateCommit,
} from '@/api/coupon/skuladder'

const dataForm = ref({
  id: 0,
  skuId: '',
  fullCount: '',
  discount: '',
  price: '',
  addOther: '',
})
const button = ref('添加')

const props = defineProps(['modelValue', 'skuId'])

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
    await reqSkuLadderUpdateCommit(
      dataForm.value.id > 0 ? 'update' : 'save',
      dataForm.value.id,
      dataForm.value.skuId,
      dataForm.value.fullCount,
      dataForm.value.discount,
      dataForm.value.price,
      dataForm.value.addOther,
    )
    ElMessage.success(`打折优惠${button.value}成功`)
  } catch (error) {
    console.error(`打折优惠${button.value}失败`, error)
  }
}

const init = (id: number) => {
  button.value = id > 0 ? '修改' : '添加'
  nextTick(async () => {
    dataForm.value.id = 0
    dataForm.value.skuId = props.skuId ? String(props.skuId) : ''
    dataForm.value.fullCount = ''
    dataForm.value.discount = ''
    dataForm.value.price = ''
    dataForm.value.addOther = ''
    if (id > 0) {
      try {
        const response = await reqSkuLadderInfo(id)
        if (response.code === 200) {
          dataForm.value.id = response.data.id
          dataForm.value.skuId = response.data.skuId
          dataForm.value.fullCount = response.data.fullCount
          dataForm.value.discount = response.data.discount
          dataForm.value.price = response.data.price
          dataForm.value.addOther = response.data.addOther
        }
      } catch (error) {
        console.error('打折优惠信息获取失败:', error)
      }
    }
  })
}

// 暴露方法
defineExpose({ init })
</script>

<style scoped lang="scss"></style>
