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
      <el-form-item label="专题标题" prop="title">
        <el-input v-model="dataForm.title" placeholder="专题标题"></el-input>
      </el-form-item>
      <el-form-item label="专题副标题" prop="subTitle">
        <el-input
          v-model="dataForm.subTitle"
          placeholder="专题副标题"
        ></el-input>
      </el-form-item>
      <el-form-item label="显示状态" prop="status">
        <el-switch
          v-model="switchValue"
          active-color="#13ce66"
          inactive-color="#ff4949"
        ></el-switch>
      </el-form-item>
      <el-form-item label="详情连接" prop="url">
        <el-input v-model="dataForm.url" placeholder="详情连接"></el-input>
      </el-form-item>
      <el-form-item label="排序" prop="sort">
        <el-input v-model="dataForm.sort" placeholder="排序"></el-input>
      </el-form-item>
      <el-form-item label="专题图片地址" prop="img">
        <single-upload v-model="dataForm.img"></single-upload>
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
import SingleUpload from '@/components/upload/singleUpload.vue'
import { nextTick, ref, computed } from 'vue'

import {
  reqHomeSubjectInfo,
  reqHomeSubjectUpdateCommit,
} from '@/api/coupon/subject'

const dataForm = ref({
  id: 0,
  name: '',
  title: '',
  subTitle: '',
  status: 0,
  url: '',
  sort: '',
  img: '',
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

const switchValue = computed({
  get: () => dataForm.value.status === 1,
  set: (val: boolean) => {
    dataForm.value.status = val ? 1 : 0
  },
})

const dataFormSubmit = async () => {
  try {
    await reqHomeSubjectUpdateCommit(
      dataForm.value.id > 0 ? 'update' : 'save',
      dataForm.value.id,
      dataForm.value.name,
      dataForm.value.title,
      dataForm.value.subTitle,
      dataForm.value.status,
      dataForm.value.url,
      dataForm.value.sort,
      dataForm.value.img,
    )
    ElMessage.success(`专题活动${button.value}成功`)
  } catch (error) {
    console.error(`专题活动${button.value}失败`, error)
  }
}

const init = (id: number) => {
  button.value = id > 0 ? '修改' : '添加'
  nextTick(async () => {
    dataForm.value.id = 0
    dataForm.value.name = ''
    dataForm.value.title = ''
    dataForm.value.subTitle = ''
    dataForm.value.status = 0
    dataForm.value.url = ''
    dataForm.value.sort = ''
    dataForm.value.img = ''
    if (id > 0) {
      try {
        const response = await reqHomeSubjectInfo(id)
        if (response.code === 200) {
          dataForm.value.id = response.data.id
          dataForm.value.name = response.data.name
          dataForm.value.title = response.data.title
          dataForm.value.subTitle = response.data.subTitle
          dataForm.value.status = response.data.status
          dataForm.value.url = response.data.url
          dataForm.value.sort = response.data.sort
          dataForm.value.img = response.data.img
        }
      } catch (error) {
        console.error('专题活动信息获取失败:', error)
      }
    }
  })
}

// 暴露方法
defineExpose({ init })
</script>

<style scoped lang="scss"></style>
