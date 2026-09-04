<template>
  <div class="oss-upload">
    <el-upload
      :file-list="fileList"
      action="http://mall-xiaojoo.oss-cn-beijing.aliyuncs.com"
      :data="dataObj"
      :multiple="!isSingle"
      list-type="picture-card"
      :limit="isSingle ? 1 : limit"
      :before-upload="beforeUpload"
      :on-success="handleSuccess"
      :on-remove="handleRemove"
      :on-exceed="handleExceed"
      :on-preview="handlePreview"
      :accept="accept"
    >
      <el-icon><Plus /></el-icon>
    </el-upload>

    <!-- 预览大图 -->
    <el-dialog v-model="previewVisible" width="60%">
      <img :src="previewUrl" style="width: 100%" alt="预览图片" />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import type { UploadProps } from 'element-plus'
import { getUUID } from '@/utils/time.ts'
import { reqImage } from '@/api/file/file.ts'

/**
 * 通用 OSS 图片上传组件（兼容旧写法，v-model 自动识别单图/多图）
 * - 绑定值为字符串 → 单图模式（可换图）
 * - 绑定值为数组   → 多图模式（一次可选多张）
 * 复用现有 /api/thirdparty/oss/policy 签名接口 + OSS 直传
 */

const props = defineProps<{
  modelValue?: string | string[]
  limit?: number
  accept?: string
}>()

const emit = defineEmits(['update:modelValue'])

// 单图模式：绑定值为字符串
const isSingle = computed(() => typeof props.modelValue === 'string')

const maxCount = computed(() => (isSingle.value ? 1 : (props.limit ?? 9)))
const accept = props.accept || 'image/jpeg,image/png,image/gif'

const dataObj = ref({
  policy: '',
  signature: '',
  key: '',
  ossaccessKeyId: '',
  dir: '',
  host: '',
})

// 回显文件列表（只存远程 URL）
const fileList = ref<any[]>([])

const toList = (val: string | string[] | undefined): string[] => {
  if (!val) return []
  return Array.isArray(val) ? val : val ? [val] : []
}

watch(
  () => props.modelValue,
  (val) => {
    // 用 URL 作为稳定 uid，避免 el-upload 把重建列表当全新文件导致状态错乱
    fileList.value = toList(val).map((url) => ({
      uid: url as any,
      url,
      status: 'success' as const,
    }))
  },
  { immediate: true },
)

const emitValue = (val: string | string[]) => {
  emit('update:modelValue', val)
}

// 上传前：校验 + 获取 OSS 签名
const beforeUpload: UploadProps['beforeUpload'] = async (file) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif']
  if (!allowedTypes.includes(file.type)) {
    ElMessage.error('图片格式错误，仅支持 jpg/png/gif!')
    return false
  }
  if (file.size / 1024 / 1024 > 2) {
    ElMessage.error('图片大小超过2MB!')
    return false
  }
  try {
    const UUID = getUUID()
    const response = await reqImage(UUID)
    dataObj.value = {
      policy: response.data.policy,
      signature: response.data.signature,
      key: `${response.data.dir}${UUID}_${file.name}`,
      dir: response.data.dir,
      host: response.data.host,
      ossaccessKeyId: response.data.accessid,
    }
    return true
  } catch (error) {
    console.error('获取上传签名失败', error)
    ElMessage.error('上传失败，请重试')
    return false
  }
}

// 上传成功：拿到 OSS 地址，写回 v-model
const handleSuccess: UploadProps['onSuccess'] = (_resp, uploadFile) => {
  const uploadedUrl = `${dataObj.value.host}/${dataObj.value.key}`
  // 让 el-upload 内部文件带上真实 OSS 地址与稳定 uid（删除时才能正确匹配）
  uploadFile.url = uploadedUrl
  ;(uploadFile as any).uid = uploadedUrl

  if (isSingle.value) {
    emitValue(uploadedUrl)
  } else {
    // 拷贝数组，避免直接修改 props.modelValue
    const cur = [...toList(props.modelValue)]
    if (!cur.includes(uploadedUrl)) {
      cur.push(uploadedUrl)
    }
    emitValue(cur)
  }
}

// 删除图片
const handleRemove: UploadProps['onRemove'] = (_file, uploadFiles) => {
  if (isSingle.value) {
    emitValue('')
    return
  }
  // 以 el-upload 删除后的剩余列表为准（其 url/uid 已由回显与上传成功逻辑保证为 OSS 地址）
  const remaining = uploadFiles
    .map((f: any) => f.url || f.uid)
    .filter((u: any) => !!u && typeof u === 'string')
  const cur =
    remaining.length > 0
      ? toList(props.modelValue).filter((url) => remaining.includes(url))
      : []
  emitValue(cur)
}

// 超出数量限制
const handleExceed = () => {
  ElMessage.warning(`最多只能上传 ${maxCount.value} 张图片`)
}

// 预览
const previewVisible = ref(false)
const previewUrl = ref('')
const handlePreview: UploadProps['onPreview'] = (uploadFile) => {
  previewUrl.value = uploadFile.url!
  previewVisible.value = true
}
</script>

<style scoped>
.oss-upload :deep(.el-upload-list--picture-card .el-upload-list__item) {
  transition: none;
}
</style>
