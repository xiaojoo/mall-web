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
      <el-form-item label="专题名字" prop="name">
        <el-input v-model="dataForm.name" placeholder="专题名字"></el-input>
      </el-form-item>
      <el-form-item label="专题id" prop="subjectId">
        <el-input v-model="dataForm.subjectId" placeholder="专题id"></el-input>
      </el-form-item>
      <el-form-item label="spu_id" prop="spuId">
        <el-input v-model="dataForm.spuId" placeholder="spu_id"></el-input>
      </el-form-item>
      <el-form-item label="排序" prop="sort">
        <el-input v-model="dataForm.sort" placeholder="排序"></el-input>
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
  reqHomeSubjectSpuInfo,
  reqHomeSubjectSpuUpdateCommit,
} from '@/api/coupon/homesubjectspu'

const dataForm = ref({
  id: 0,
  name: '',
  subjectId: '',
  spuId: '',
  sort: '',
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
    await reqHomeSubjectSpuUpdateCommit(
      dataForm.value.id > 0 ? 'update' : 'save',
      dataForm.value.id,
      dataForm.value.name,
      dataForm.value.subjectId,
      dataForm.value.spuId,
      dataForm.value.sort,
    )
    ElMessage.success(`spu专题${button.value}成功`)
  } catch (error) {
    console.error(`spu专题${button.value}失败`, error)
  }
}

const init = (id: number) => {
  button.value = id > 0 ? '修改' : '添加'
  nextTick(async () => {
    dataForm.value.id = 0
    dataForm.value.name = ''
    dataForm.value.subjectId = ''
    dataForm.value.spuId = ''
    dataForm.value.sort = ''
    if (id > 0) {
      try {
        const response = await reqHomeSubjectSpuInfo(id)
        if (response.code === 200) {
          dataForm.value.id = response.data.id
          dataForm.value.name = response.data.name
          dataForm.value.subjectId = response.data.subjectId
          dataForm.value.spuId = response.data.spuId
          dataForm.value.sort = response.data.sort
        }
      } catch (error) {
        console.error('spu专题信息获取失败:', error)
      }
    }
  })
}

// 暴露方法
defineExpose({ init })
</script>

<style scoped lang="scss"></style>
