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
      label-width="150px"
    >
      <el-form-item label="skuId" prop="skuId">
        <el-input v-model="dataForm.skuId" placeholder="spu_id"></el-input>
      </el-form-item>
      <el-form-item label="满多少" prop="fullPrice">
        <el-input v-model="dataForm.fullPrice" placeholder="满多少"></el-input>
      </el-form-item>
      <el-form-item label="减多少" prop="reducePrice">
        <el-input
          v-model="dataForm.reducePrice"
          placeholder="减多少"
        ></el-input>
      </el-form-item>
      <el-form-item label="是否参与其他优惠" prop="addOther">
        <el-input
          v-model="dataForm.addOther"
          placeholder="是否参与其他优惠"
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

import {
  reqSkuFullReductionInfo,
  reqSkuFullReductionUpdateCommit,
} from '@/api/coupon/full'

const dataForm = ref({
  id: 0,
  skuId: '',
  fullPrice: '',
  reducePrice: '',
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
    await reqSkuFullReductionUpdateCommit(
      dataForm.value.id > 0 ? 'update' : 'save',
      dataForm.value.id,
      dataForm.value.skuId,
      dataForm.value.fullPrice,
      dataForm.value.reducePrice,
      dataForm.value.addOther,
    )
    ElMessage.success(`满减折扣${button.value}成功`)
  } catch (error) {
    console.error(`满减折扣${button.value}失败`, error)
  }
}

const init = (id: number) => {
  button.value = id > 0 ? '修改' : '添加'
  nextTick(async () => {
    dataForm.value.id = 0
    dataForm.value.skuId = props.skuId ? String(props.skuId) : ''
    dataForm.value.fullPrice = ''
    dataForm.value.reducePrice = ''
    dataForm.value.addOther = ''
    if (id > 0) {
      try {
        const response = await reqSkuFullReductionInfo(id)
        if (response.code === 200) {
          dataForm.value.id = response.data.id
          dataForm.value.skuId = response.data.skuId
          dataForm.value.fullPrice = response.data.fullPrice
          dataForm.value.reducePrice = response.data.reducePrice
          dataForm.value.addOther = response.data.addOther
        }
      } catch (error) {
        console.error('满减折扣信息获取失败:', error)
      }
    }
  })
}

// 暴露方法
defineExpose({ init })
</script>

<style scoped lang="scss"></style>
