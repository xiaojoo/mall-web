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
      <el-form-item label="仓库名" prop="name">
        <el-input v-model="dataForm.name" placeholder="仓库名"></el-input>
      </el-form-item>
      <el-form-item label="仓库地址" prop="address">
        <el-input v-model="dataForm.address" placeholder="仓库地址"></el-input>
      </el-form-item>
      <el-form-item label="区域编码" prop="areacode">
        <el-input v-model="dataForm.areacode" placeholder="区域编码"></el-input>
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
import { reqWareInfo, reqWareUpdateCommit } from '@/api/ware/wareinfo'

const dataForm = ref({
  id: 0,
  name: '',
  address: '',
  areacode: '',
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
    await reqWareUpdateCommit(
      dataForm.value.id > 0 ? 'update' : 'save',
      dataForm.value.id,
      dataForm.value.name,
      dataForm.value.address,
      dataForm.value.areacode,
    )
    ElMessage.success(`仓库${button.value}成功`)
  } catch (error) {
    console.error(`仓库${button.value}失败`, error)
  }
}

const init = (id: number) => {
  button.value = id > 0 ? '修改' : '添加'
  nextTick(async () => {
    dataForm.value.id = 0
    dataForm.value.name = ''
    dataForm.value.address = ''
    dataForm.value.areacode = ''
    if (id > 0) {
      try {
        const response = await reqWareInfo(id)
        if (response.code === 200) {
          dataForm.value.id = response.data.id
          dataForm.value.name = response.data.name
          dataForm.value.address = response.data.address
          dataForm.value.areacode = response.data.areacode
        }
      } catch (error) {
        console.error('仓库信息获取失败:', error)
      }
    }
  })
}

// 暴露方法
defineExpose({ init })
</script>

<style scoped lang="scss"></style>
