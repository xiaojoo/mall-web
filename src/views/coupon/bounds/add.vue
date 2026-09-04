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
      <el-form-item label="spuId" prop="spuId">
        <el-input v-model="dataForm.spuId" placeholder=""></el-input>
      </el-form-item>
      <el-form-item label="成长积分" prop="growBounds">
        <el-input
          v-model="dataForm.growBounds"
          placeholder="成长积分"
        ></el-input>
      </el-form-item>
      <el-form-item label="购物积分" prop="buyBounds">
        <el-input
          v-model="dataForm.buyBounds"
          placeholder="购物积分"
        ></el-input>
      </el-form-item>
      <!-- [1111（四个状态位，从右到左）;0 - 无优惠，成长积分是否赠送;1 - 无优惠，购物积分是否赠送;2 - 有优惠，成长积分是否赠送;3 - 有优惠，购物积分是否赠送【状态位0：不赠送，1：赠送】] -->
      <el-form-item label="优惠生效情况" prop="work">
        <el-input v-model="dataForm.work" placeholder="优惠生效情况"></el-input>
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

import { reqSpuBoundsInfo, reqSpuBoundsUpdateCommit } from '@/api/coupon/bounds'

const dataForm = ref({
  id: 0,
  spuId: '',
  growBounds: '',
  buyBounds: '',
  work: '',
})
const button = ref('添加')

const props = defineProps(['modelValue', 'spuId'])

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
    await reqSpuBoundsUpdateCommit(
      dataForm.value.id > 0 ? 'update' : 'save',
      dataForm.value.id,
      dataForm.value.spuId,
      dataForm.value.growBounds,
      dataForm.value.buyBounds,
      dataForm.value.work,
    )
    ElMessage.success(`积分${button.value}成功`)
  } catch (error) {
    console.error(`积分${button.value}失败`, error)
  }
}

const init = (id: number) => {
  button.value = id > 0 ? '修改' : '添加'
  nextTick(async () => {
    dataForm.value.id = 0
    dataForm.value.spuId = props.spuId ? String(props.spuId) : ''
    dataForm.value.growBounds = ''
    dataForm.value.buyBounds = ''
    dataForm.value.work = ''
    if (id > 0) {
      try {
        const response = await reqSpuBoundsInfo(id)
        if (response.code === 200) {
          dataForm.value.id = response.data.id
          dataForm.value.spuId = response.data.spuId
          dataForm.value.growBounds = response.data.growBounds
          dataForm.value.buyBounds = response.data.buyBounds
          dataForm.value.work = response.data.work
        }
      } catch (error) {
        console.error('积分信息获取失败:', error)
      }
    }
  })
}

// 暴露方法
defineExpose({ init })
</script>

<style scoped lang="scss"></style>
