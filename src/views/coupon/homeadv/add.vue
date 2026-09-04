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
      <el-form-item label="名字" prop="name">
        <el-input v-model="dataForm.name" placeholder="名字"></el-input>
      </el-form-item>
      <el-form-item label="图片地址" prop="pic">
        <el-input v-model="dataForm.pic" placeholder="图片地址"></el-input>
      </el-form-item>
      <el-form-item label="开始时间" prop="startTime">
        <el-input
          v-model="dataForm.startTime"
          placeholder="开始时间"
        ></el-input>
      </el-form-item>
      <el-form-item label="结束时间" prop="endTime">
        <el-input v-model="dataForm.endTime" placeholder="结束时间"></el-input>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-input v-model="dataForm.status" placeholder="状态"></el-input>
      </el-form-item>
      <el-form-item label="点击数" prop="clickCount">
        <el-input v-model="dataForm.clickCount" placeholder="点击数"></el-input>
      </el-form-item>
      <el-form-item label="广告详情连接地址" prop="url">
        <el-input
          v-model="dataForm.url"
          placeholder="广告详情连接地址"
        ></el-input>
      </el-form-item>
      <el-form-item label="备注" prop="note">
        <el-input v-model="dataForm.note" placeholder="备注"></el-input>
      </el-form-item>
      <el-form-item label="排序" prop="sort">
        <el-input v-model="dataForm.sort" placeholder="排序"></el-input>
      </el-form-item>
      <el-form-item label="发布者" prop="publisherId">
        <el-input
          v-model="dataForm.publisherId"
          placeholder="发布者"
        ></el-input>
      </el-form-item>
      <el-form-item label="审核者" prop="authId">
        <el-input v-model="dataForm.authId" placeholder="审核者"></el-input>
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

import { reqHomeDdvInfo, reqHomeDdvUpdateCommit } from '@/api/coupon/homeadv'

const dataForm = ref({
  id: 0,
  name: '',
  pic: '',
  startTime: '',
  endTime: '',
  status: '',
  clickCount: '',
  url: '',
  note: '',
  sort: '',
  publisherId: '',
  authId: '',
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
    await reqHomeDdvUpdateCommit(
      dataForm.value.id > 0 ? 'update' : 'save',
      dataForm.value.id,
      dataForm.value.name,
      dataForm.value.pic,
      dataForm.value.startTime,
      dataForm.value.endTime,
      dataForm.value.status,
      dataForm.value.clickCount,
      dataForm.value.url,
      dataForm.value.note,
      dataForm.value.sort,
      dataForm.value.publisherId,
      dataForm.value.authId,
    )
    ElMessage.success(`首页广告${button.value}成功`)
  } catch (error) {
    console.error(`首页广告${button.value}失败`, error)
  }
}

const init = (id: number) => {
  button.value = id > 0 ? '修改' : '添加'
  nextTick(async () => {
    dataForm.value.id = 0
    dataForm.value.name = ''
    dataForm.value.pic = ''
    dataForm.value.startTime = ''
    dataForm.value.endTime = ''
    dataForm.value.status = ''
    dataForm.value.clickCount = ''
    dataForm.value.url = ''
    dataForm.value.note = ''
    dataForm.value.sort = ''
    dataForm.value.publisherId = ''
    dataForm.value.authId = ''
    if (id > 0) {
      try {
        const response = await reqHomeDdvInfo(id)
        if (response.code === 200) {
          dataForm.value.id = response.data.id
          dataForm.value.name = response.data.name
          dataForm.value.pic = response.data.pic
          dataForm.value.startTime = response.data.startTime
          dataForm.value.endTime = response.data.endTime
          dataForm.value.status = response.data.status
          dataForm.value.clickCount = response.data.clickCount
          dataForm.value.url = response.data.url
          dataForm.value.note = response.data.note
          dataForm.value.sort = response.data.sort
          dataForm.value.publisherId = response.data.publisherId
          dataForm.value.authId = response.data.authId
        }
      } catch (error) {
        console.error('首页广告信息获取失败:', error)
      }
    }
  })
}

// 暴露方法
defineExpose({ init })
</script>

<style scoped lang="scss"></style>
