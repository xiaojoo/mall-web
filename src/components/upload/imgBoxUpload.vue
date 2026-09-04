<template>
  <div class="img-editor">
    <div
      class="img-box"
      @click="pick"
      :title="modelValue ? '点击上传/替换' : '点击上传图片'"
    >
      <img v-if="modelValue" :src="modelValue" alt="" />
      <span v-else class="img-box-plus">＋</span>
      <span
        v-if="modelValue"
        class="img-box-del"
        @click.stop="remove"
        title="删除图片"
      >
        ×
      </span>
    </div>
    <!-- 图片选择：点击图片框触发，选择后直接上传替换 -->
    <input
      ref="fileInputRef"
      type="file"
      accept="image/jpeg,image/png,image/gif"
      style="display: none"
      @change="onFilePick"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import { getUUID } from '@/utils/time'
import { reqImage } from '@/api/file/file'

/**
 * 单图上传组件：图片展示即上传框（点击图片框直接换图，右上角 × 删除），
 * 不显示独立的上传按钮框。
 */
const props = defineProps<{
  modelValue?: string
}>()

const emit = defineEmits(['update:modelValue'])

const fileInputRef = ref<HTMLInputElement | null>(null)

const pick = () => {
  fileInputRef.value?.click()
}

const onFilePick = async (e: Event) => {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = '' // 允许重复选择同一文件
  if (!file) return
  try {
    emit('update:modelValue', await uploadOss(file))
  } catch (error) {
    console.error('上传失败', error)
    ElMessage.error('上传失败，请重试')
  }
}

const remove = () => {
  emit('update:modelValue', '')
}

// OSS 直传（与 nativeUpload 一致：签名接口 + PostObject）
const uploadOss = async (file: File) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif']
  if (!allowedTypes.includes(file.type)) {
    ElMessage.error('图片格式错误，仅支持 jpg/png/gif!')
    throw new Error('类型不支持')
  }
  if (file.size / 1024 / 1024 > 2) {
    ElMessage.error('图片大小超过2MB!')
    throw new Error('文件过大')
  }
  const UUID = getUUID()
  const res = await reqImage(UUID)
  const key = `${res.data.dir}${UUID}_${file.name}`
  const fd = new FormData()
  fd.append('key', key)
  fd.append('policy', res.data.policy)
  fd.append('OSSAccessKeyId', res.data.accessid)
  fd.append('signature', res.data.signature)
  fd.append('success_action_status', '200')
  fd.append('file', file)
  const resp = await fetch(res.data.host, { method: 'POST', body: fd })
  if (!resp.ok) {
    throw new Error(`OSS上传失败: HTTP ${resp.status}`)
  }
  return `${res.data.host}/${key}`
}
</script>

<style scoped lang="scss">
.img-editor {
  display: flex;
}

.img-box {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100px;
  height: 100px;
  overflow: hidden;
  cursor: pointer;
  background: #f5f7fa;
  border: 1px dashed #dcdfe6;
  border-radius: 6px;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &:hover {
    border-color: #409eff;
  }

  .img-box-plus {
    font-size: 24px;
    color: #8c939d;
  }

  .img-box-del {
    position: absolute;
    top: 4px;
    right: 4px;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    color: #fff;
    cursor: pointer;
    background: rgb(0 0 0 / 60%);
    border-radius: 50%;
    font-size: 14px;
  }
}
</style>
