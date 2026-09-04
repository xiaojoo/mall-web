<template>
  <el-upload
    class="avatar-uploader"
    action="http://mall-xiaojoo.oss-cn-beijing.aliyuncs.com"
    :data="dataObj"
    :show-file-list="false"
    :on-success="handleAvatarSuccess"
    :before-upload="beforeAvatarUpload"
    :model-value="modelValue"
    @update:model-value="updateModelValue"
  >
    <img v-if="imageUrl" :src="imageUrl" class="avatar" alt="上传图片" />
    <el-icon v-else class="avatar-uploader-icon">
      <Plus />
    </el-icon>
  </el-upload>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'

import { Plus } from '@element-plus/icons-vue'
import { getUUID } from '@/utils/time.ts'
import type { UploadProps } from 'element-plus'
import { reqImage } from '@/api/file/file'

const dataObj = ref({
  policy: '',
  signature: '',
  key: '',
  ossaccessKeyId: '',
  dir: '',
  host: '',
})

const updateModelValue = ref()

const props = defineProps(['modelValue'])

const emits = defineEmits(['update:modelValue'])

const imageUrl = ref('')

// 监听父组件传入的modelValue变化
watch(
  () => props.modelValue,
  (newVal) => {
    imageUrl.value = newVal
  },
)

const handleAvatarSuccess: UploadProps['onSuccess'] = (
  response,
  uploadFile,
) => {
  imageUrl.value = URL.createObjectURL(uploadFile.raw!)
  // 上传成功后通知父组件更新值
  emits(
    'update:modelValue',
    dataObj.value.host +
      '/' +
      dataObj.value.key.replace('${' + 'filename' + '}', uploadFile.name),
  )
}

const allowedTypes = ['image/jpeg', 'image/png', 'image/gif']
const beforeAvatarUpload: UploadProps['beforeUpload'] = async (filename) => {
  if (!allowedTypes.includes(filename.type)) {
    ElMessage.error('图片格式错误!')
    return false
  } else if (filename.size / 1024 / 1024 > 2) {
    ElMessage.error('图片大小超过2MB!')
    return false
  }
  try {
    const UUID = getUUID()
    const response = await reqImage(UUID)
    dataObj.value = {
      policy: response.data.policy,
      signature: response.data.signature,
      key: `${response.data.dir}${UUID}_${filename.name}`,
      dir: response.data.dir,
      host: response.data.host,
      ossaccessKeyId: response.data.accessid,
    }
  } catch (error) {
    // ElMessage.error('图片上传失败')
    console.error('图片上传失败:', error)
  }
}
</script>

<style scoped>
.avatar-uploader .avatar {
  width: 178px;
  height: 178px;
  display: block;
}
</style>

<style>
.avatar-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.el-icon.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
}
</style>
