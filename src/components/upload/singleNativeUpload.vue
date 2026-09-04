<template>
  <div class="single-native-upload">
    <!-- 已上传：显示单张预览 + 删除 -->
    <div v-if="currentUrl" class="preview-wrap">
      <img :src="currentUrl" alt="" @click="preview" />
      <span class="del" @click="remove">×</span>
    </div>
    <!-- 未上传：显示上传入口 -->
    <div v-else class="upload-trigger" @click="pick">
      <span class="plus">＋</span>
      <span>上传图片</span>
      <input
        ref="inputRef"
        type="file"
        accept="image/jpeg,image/png,image/gif"
        style="display: none"
        @change="onPick"
      />
    </div>

    <!-- 预览大图 -->
    <el-dialog v-model="previewVisible" width="60%">
      <img :src="previewUrl" style="width: 100%" alt="预览图片" />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

import { getUUID } from '@/utils/time.ts'
import { reqImage } from '@/api/file/file.ts'

/**
 * 原生 JS 单图上传组件（可删除后重新上传）
 * v-model 绑定数组（0 或 1 个 URL，兼容 spu.images 数组结构）
 * 复用现有 /api/thirdparty/oss/policy 签名接口 + OSS PostObject 直传
 */

const props = defineProps<{
  modelValue?: string | string[]
}>()

const emit = defineEmits(['update:modelValue'])

const currentUrl = computed(() => {
  if (!props.modelValue) return ''
  return Array.isArray(props.modelValue)
    ? props.modelValue[0] || ''
    : props.modelValue
})

const allowedTypes = ['image/jpeg', 'image/png', 'image/gif']

const inputRef = ref<HTMLInputElement | null>(null)

const pick = () => {
  inputRef.value?.click()
}

const onPick = async (e: Event) => {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = '' // 允许重复选择同一文件
  if (!file) return

  if (!allowedTypes.includes(file.type)) {
    ElMessage.error('图片格式错误，仅支持 jpg/png/gif!')
    return
  }
  if (file.size / 1024 / 1024 > 2) {
    ElMessage.error('图片大小超过2MB!')
    return
  }

  try {
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

    emit('update:modelValue', [`${res.data.host}/${key}`])
  } catch (err) {
    console.error('上传失败', err)
    ElMessage.error('上传失败，请重试')
  }
}

// 删除图片（可重新上传）
const remove = () => {
  emit('update:modelValue', [])
}

// 预览
const previewVisible = ref(false)
const previewUrl = ref('')
const preview = () => {
  previewUrl.value = currentUrl.value
  previewVisible.value = true
}
</script>

<style scoped>
.preview-wrap {
  position: relative;
  width: 148px;
  height: 148px;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  overflow: hidden;
  cursor: pointer;
}
.preview-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.preview-wrap .del {
  position: absolute;
  right: 4px;
  top: 4px;
  width: 20px;
  height: 20px;
  line-height: 18px;
  text-align: center;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  border-radius: 50%;
  font-size: 15px;
  cursor: pointer;
  z-index: 2;
}
.upload-trigger {
  width: 148px;
  height: 148px;
  border: 1px dashed #dcdfe6;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #8c939d;
  gap: 4px;
}
.upload-trigger:hover {
  border-color: #409eff;
  color: #409eff;
}
.upload-trigger .plus {
  font-size: 24px;
}
</style>
