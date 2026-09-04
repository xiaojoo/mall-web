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
      label-width="200px"
    >
      <el-form-item label="等级名称" prop="name">
        <el-input v-model="dataForm.name" placeholder="等级名称"></el-input>
      </el-form-item>
      <el-form-item label="所需成长值" prop="growthPoint">
        <el-input-number
          v-model="dataForm.growthPoint"
          :min="0"
        ></el-input-number>
      </el-form-item>
      <el-form-item label="默认等级" prop="defaultStatus">
        <el-checkbox
          v-model="dataForm.defaultStatus"
          :true-value="1"
          :false-value="0"
        ></el-checkbox>
      </el-form-item>
      <el-form-item label="免运费标准" prop="freeFreightPoint">
        <el-input-number
          :min="0"
          v-model="dataForm.freeFreightPoint"
        ></el-input-number>
      </el-form-item>
      <el-form-item label="每次评价获取的成长值" prop="commentGrowthPoint">
        <el-input-number
          :min="0"
          v-model="dataForm.commentGrowthPoint"
        ></el-input-number>
      </el-form-item>
      <el-form-item label="是否有免邮特权" prop="priviledgeFreeFreight">
        <el-checkbox
          v-model="dataForm.priviledgeFreeFreight"
          :true-value="1"
          :false-value="0"
        ></el-checkbox>
      </el-form-item>
      <el-form-item label="是否有会员价格特权" prop="priviledgeMemberPrice">
        <el-checkbox
          v-model="dataForm.priviledgeMemberPrice"
          :true-value="1"
          :false-value="0"
        ></el-checkbox>
      </el-form-item>
      <el-form-item label="是否有生日特权" prop="priviledgeBirthday">
        <el-checkbox
          v-model="dataForm.priviledgeBirthday"
          :true-value="1"
          :false-value="0"
        ></el-checkbox>
      </el-form-item>
      <el-form-item label="备注" prop="note">
        <el-input v-model="dataForm.note" placeholder="备注"></el-input>
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
  reqMemberLeveInfo,
  reqMemberLeveUpdateCommit,
} from '@/api/member/level'

const dataForm = ref({
  id: 0,
  name: '',
  growthPoint: 0,
  defaultStatus: 0,
  freeFreightPoint: 0,
  commentGrowthPoint: 0,
  priviledgeFreeFreight: 0,
  priviledgeMemberPrice: 0,
  priviledgeBirthday: 0,
  note: '',
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
    await reqMemberLeveUpdateCommit(
      dataForm.value.id > 0 ? 'update' : 'save',
      dataForm.value.id,
      dataForm.value.name,
      dataForm.value.growthPoint,
      dataForm.value.defaultStatus,
      dataForm.value.freeFreightPoint,
      dataForm.value.commentGrowthPoint,
      dataForm.value.priviledgeFreeFreight,
      dataForm.value.priviledgeMemberPrice,
      dataForm.value.priviledgeBirthday,
      dataForm.value.note,
    )
    ElMessage.success(`会员等级${button.value}成功`)
  } catch (error) {
    console.error(`会员等级${button.value}失败`, error)
  }
}

const init = (id: number) => {
  button.value = id > 0 ? '修改' : '添加'
  nextTick(async () => {
    dataForm.value.id = 0
    dataForm.value.name = ''
    dataForm.value.growthPoint = 0
    dataForm.value.defaultStatus = 0
    dataForm.value.freeFreightPoint = 0
    dataForm.value.commentGrowthPoint = 0
    dataForm.value.priviledgeFreeFreight = 0
    dataForm.value.priviledgeMemberPrice = 0
    dataForm.value.priviledgeBirthday = 0
    dataForm.value.note = ''
    if (id > 0) {
      try {
        const response = await reqMemberLeveInfo(id)
        if (response.code === 200) {
          dataForm.value.id = response.data.id
          dataForm.value.name = response.data.name
          dataForm.value.growthPoint = response.data.growthPoint
          dataForm.value.defaultStatus = response.data.defaultStatus
          dataForm.value.freeFreightPoint = response.data.freeFreightPoint
          dataForm.value.commentGrowthPoint = response.data.commentGrowthPoint
          dataForm.value.priviledgeFreeFreight =
            response.data.priviledgeFreeFreight
          dataForm.value.priviledgeMemberPrice =
            response.data.priviledgeMemberPrice
          dataForm.value.priviledgeBirthday = response.data.priviledgeBirthday
          dataForm.value.note = response.data.note
        }
      } catch (error) {
        console.error('会员等级信息获取失败:', error)
      }
    }
  })
}

// 暴露方法
defineExpose({ init })
</script>

<style scoped lang="scss"></style>
