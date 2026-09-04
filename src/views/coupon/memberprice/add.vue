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
      <el-form-item label="sku_id" prop="skuId">
        <el-input v-model="dataForm.skuId" placeholder="sku_id"></el-input>
      </el-form-item>
      <el-form-item label="会员等级id" prop="memberLevelId">
        <el-input
          v-model="dataForm.memberLevelId"
          placeholder="会员等级id"
        ></el-input>
      </el-form-item>
      <el-form-item label="会员等级名" prop="memberLevelName">
        <el-input
          v-model="dataForm.memberLevelName"
          placeholder="会员等级名"
        ></el-input>
      </el-form-item>
      <el-form-item label="会员对应价格" prop="memberPrice">
        <el-input
          v-model="dataForm.memberPrice"
          placeholder="会员对应价格"
        ></el-input>
      </el-form-item>
      <el-form-item label="可否叠加其他优惠" prop="addOther">
        <el-switch
          v-model="dataForm.addOther"
          :active-value="1"
          inactive-value="0"
          active-text="可叠加"
          inactive-text="不可叠加"
        ></el-switch>
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
  reqMemberPriceInfo,
  reqMemberPriceUpdateCommit,
} from '@/api/coupon/memberprice'

const dataForm = ref({
  id: 0,
  skuId: '',
  memberLevelId: '',
  memberLevelName: '',
  memberPrice: '',
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
    await reqMemberPriceUpdateCommit(
      dataForm.value.id > 0 ? 'update' : 'save',
      dataForm.value.id,
      dataForm.value.skuId,
      dataForm.value.memberLevelId,
      dataForm.value.memberLevelName,
      dataForm.value.memberPrice,
      dataForm.value.addOther,
    )
    ElMessage.success(`会员价格${button.value}成功`)
  } catch (error) {
    console.error(`会员价格${button.value}失败`, error)
  }
}

const init = (id: number) => {
  button.value = id > 0 ? '修改' : '添加'
  nextTick(async () => {
    dataForm.value.id = 0
    dataForm.value.skuId = props.skuId ? String(props.skuId) : ''
    dataForm.value.memberLevelId = ''
    dataForm.value.memberLevelName = ''
    dataForm.value.memberPrice = ''
    dataForm.value.addOther = ''
    if (id > 0) {
      try {
        const response = await reqMemberPriceInfo(id)
        if (response.code === 200) {
          dataForm.value.id = response.data.id
          dataForm.value.skuId = response.data.skuId
          dataForm.value.memberLevelId = response.data.memberLevelId
          dataForm.value.memberLevelName = response.data.memberLevelName
          dataForm.value.memberPrice = response.data.memberPrice
          dataForm.value.addOther = response.data.addOther
        }
      } catch (error) {
        console.error('会员价格信息获取失败:', error)
      }
    }
  })
}

// 暴露方法
defineExpose({ init })
</script>

<style scoped lang="scss"></style>
