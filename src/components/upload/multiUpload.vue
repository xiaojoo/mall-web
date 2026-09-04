<template>
  <el-upload
    :file-list="uploadFileList"
    action="http://mall-xiaojoo.oss-cn-beijing.aliyuncs.com"
    :data="dataObj"
    :multiple="true"
    list-type="picture-card"
    :before-upload="beforeUpload"
    :on-preview="handlePictureCardPreview"
    :on-remove="handleRemove"
    :on-success="handleUploadSuccess"
    :limit="maxCount"
    :on-exceed="handleExceed"
    :show-file-list="true"
  >
    <el-icon>
      <Plus />
    </el-icon>
  </el-upload>
  <el-dialog v-model="dialogVisible">
    <img :src="dialogImageUrl" alt="展示大图" />
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import type { UploadProps, UploadUserFile } from 'element-plus'
import { getUUID } from '@/utils/time.ts'
import { reqImage } from '@/api/file/file.ts'

const dialogImageUrl = ref('')
const dialogVisible = ref(false)
const dataObj = ref({
  policy: '',
  signature: '',
  key: '',
  ossaccessKeyId: '',
  dir: '',
  host: '',
})
const props = defineProps(['modelValue'])
const maxCount = ref(20)
const emits = defineEmits(['update:modelValue'])
const imagesUrl = ref<string[]>([])

// 只存储远程图片URL，避免本地地址
const uploadFileList = ref<UploadUserFile[]>([])

// 监听modelValue变化，确保uploadFileList只存储远程地址
watch(
  () => props.modelValue,
  (newVal) => {
    imagesUrl.value = newVal || []
    // 不直接覆盖已有图片
    uploadFileList.value = (newVal || []).map((url: string) => ({
      uid: url,
      url,
      status: 'success',
    }))
  },
  { immediate: true },
)

// 触发父组件更新modelValue
const emitInput = () => {
  // const value = uploadFileList.value.map((file) => file.url!)
  // emits('update:modelValue', value)
  emits('update:modelValue', imagesUrl.value)
}

// 处理删除图片
const handleRemove: UploadProps['onRemove'] = (file) => {
  imagesUrl.value = imagesUrl.value.filter((url) => url !== file.url)
  uploadFileList.value = uploadFileList.value.filter(
    (item) => item.url !== file.url,
  )
  emitInput()
}

// 预览图片
const handlePictureCardPreview: UploadProps['onPreview'] = (uploadFile) => {
  dialogImageUrl.value = uploadFile.url!
  dialogVisible.value = true
}

// 上传成功回调
const handleUploadSuccess: UploadProps['onSuccess'] = (uploadFile) => {
  const uploadedUrl = `${dataObj.value.host}/${dataObj.value.key}`
  if (!imagesUrl.value.includes(uploadedUrl)) {
    imagesUrl.value.push(uploadedUrl)
    uploadFileList.value.push({
      uid: uploadFile.uid,
      name: uploadFile.name,
      url: uploadedUrl,
      status: 'success',
      size: uploadFile.size,
    })
    emitInput()
  }
}

// 上传前校验
const beforeUpload: UploadProps['beforeUpload'] = async (file) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif']
  if (!allowedTypes.includes(file.type)) {
    ElMessage.error('图片格式错误!')
    return false
  }
  if (file.size / 1024 / 1024 > 2) {
    ElMessage.error('图片大小超过2MB!')
    return false
  }
  try {
    const UUID = getUUID()
    const response = await reqImage(UUID)
    const imageUrl = `${response.data.host}/${response.data.dir}${UUID}_${file.name}`
    imagesUrl.value.push(imageUrl) // 确保在 beforeUpload 阶段就加入 URL
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
    console.error('图片上传失败:', error)
    return false
  }
}

// 超出数量限制处理
const handleExceed = () => {
  ElMessage.warning(`最多只能上传 ${maxCount.value} 张图片`)
}
</script>

<style scoped></style>
