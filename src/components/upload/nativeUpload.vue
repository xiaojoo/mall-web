<template>
  <div class="native-upload">
    <div class="upload-list">
      <template v-if="!hideList">
        <div
          v-for="(item, i) in displayList"
          :key="item.uid"
          class="upload-item"
        >
          <img :src="item.url" alt="" @click="preview(item.url)" />
          <span v-if="item.uploading" class="uploading">上传中</span>
          <span class="del" @click.stop="removeItem(i)">×</span>
        </div>
      </template>
      <div
        v-if="!isSingle || displayList.length === 0"
        class="upload-trigger"
        @click="pick"
      >
        <span class="plus">＋</span>
        <input
          ref="inputRef"
          type="file"
          multiple
          accept="image/jpeg,image/png,image/gif"
          style="display: none"
          @change="onPick"
        />
      </div>
    </div>

    <!-- 预览 -->
    <el-dialog v-model="previewVisible" width="60%">
      <img :src="previewUrl" style="width: 100%" alt="预览图片" />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import { getUUID } from '@/utils/time.ts'
import { reqImage } from '@/api/file/file.ts'

/**
 * 原生 JS OSS 图片上传组件（每张图独立签名，支持多选并发，无竞态）
 * - 绑定字符串 → 单图模式；绑定数组 → 多图模式
 * - 复用现有 /api/thirdparty/oss/policy 签名接口 + OSS PostObject 直传
 */

const props = defineProps<{
  modelValue?: string | string[]
  limit?: number
  hideList?: boolean
}>()

const emit = defineEmits(['update:modelValue'])

const isSingle = computed(() => typeof props.modelValue === 'string')
const maxCount = computed(() => props.limit ?? 9)

const allowedTypes = ['image/jpeg', 'image/png', 'image/gif']

const toList = (val: string | string[] | undefined): string[] => {
  if (!val) return []
  return Array.isArray(val) ? val : val ? [val] : []
}

interface UploadItem {
  uid: string
  url: string
  uploading?: boolean
}

// 显示列表（本地状态，与 v-model 同步）
const displayList = ref<UploadItem[]>([])

watch(
  () => props.modelValue,
  (val) => {
    displayList.value = toList(val).map((url) => ({ uid: url, url }))
  },
  { immediate: true },
)

const emitValue = (val: string | string[]) => {
  emit('update:modelValue', val)
}

const inputRef = ref<HTMLInputElement | null>(null)

const pick = () => {
  inputRef.value?.click()
}

// 选择文件（可一次多选）
const onPick = async (e: Event) => {
  const input = e.target as HTMLInputElement
  const files = Array.from(input.files || [])
  input.value = '' // 允许重复选择同一文件

  if (files.length === 0) return
  if (isSingle.value) {
    // 单图：取第一张替换
    await uploadOne(files[0], true)
  } else {
    if (displayList.value.length + files.length > maxCount.value) {
      ElMessage.warning(`最多只能上传 ${maxCount.value} 张图片`)
      return
    }
    // 每张独立签名上传，并发执行无竞态
    await Promise.all(files.map((f) => uploadOne(f, false)))
  }
}

// 单张上传：独立拿签名 → FormData POST OSS → 更新列表与 v-model
const uploadOne = async (file: File, replace: boolean) => {
  if (!allowedTypes.includes(file.type)) {
    ElMessage.error('图片格式错误，仅支持 jpg/png/gif!')
    return
  }
  if (file.size / 1024 / 1024 > 2) {
    ElMessage.error('图片大小超过2MB!')
    return
  }

  // 先加入本地预览（上传中）
  const localUrl = URL.createObjectURL(file)
  const item: UploadItem = { uid: getUUID(), url: localUrl, uploading: true }
  if (replace) {
    displayList.value = [item]
  } else {
    displayList.value.push(item)
  }

  try {
    const UUID = getUUID()
    const res = await reqImage(UUID)
    const key = `${res.data.dir}${UUID}_${file.name}`

    // OSS PostObject 直传
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

    const url = `${res.data.host}/${key}`
    // 更新显示（本地预览 → OSS 地址）
    const cur = displayList.value.find((i) => i.uid === item.uid)
    if (cur) {
      cur.url = url
      cur.uploading = false
    }

    // 更新 v-model
    if (isSingle.value) {
      emitValue(url)
    } else {
      const list = [...toList(props.modelValue)]
      if (!list.includes(url)) list.push(url)
      emitValue(list)
    }
  } catch (err) {
    console.error('上传失败', err)
    ElMessage.error('上传失败，请重试')
    displayList.value = displayList.value.filter((i) => i.uid !== item.uid)
  }
}

// 删除
const removeItem = (i: number) => {
  const item = displayList.value[i]
  displayList.value.splice(i, 1)
  if (isSingle.value) {
    emitValue('')
  } else {
    const list = toList(props.modelValue).filter((u) => u !== item.url)
    emitValue(list)
  }
}

// 预览
const previewVisible = ref(false)
const previewUrl = ref('')
const preview = (url: string) => {
  previewUrl.value = url
  previewVisible.value = true
}
</script>

<style scoped>
.upload-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.upload-item {
  position: relative;
  width: 148px;
  height: 148px;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  overflow: hidden;
  cursor: pointer;
}
.upload-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.upload-item .uploading {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}
.upload-item .del {
  position: absolute;
  right: 2px;
  top: 2px;
  width: 18px;
  height: 18px;
  line-height: 16px;
  text-align: center;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  border-radius: 50%;
  font-size: 14px;
  cursor: pointer;
}
.upload-trigger {
  width: 148px;
  height: 148px;
  border: 1px dashed #dcdfe6;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #8c939d;
}
.upload-trigger:hover {
  border-color: #409eff;
  color: #409eff;
}
.upload-trigger .plus {
  font-size: 24px;
}
</style>
