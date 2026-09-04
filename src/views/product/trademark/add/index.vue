<template>
  <el-dialog
    :model-value="visible"
    @update:model-value="updateVisible"
    :title="!dataForm.brandId ? '增加' : '修改'"
    width="50%"
  >
    <el-form
      :model="dataForm"
      label-width="120px"
      @keyup.enter.native="submit()"
    >
      <el-form-item label="品牌名" prop="name">
        <el-input v-model="dataForm.name" placeholder="品牌名"></el-input>
      </el-form-item>
      <el-form-item label="品牌Logo地址" prop="logo">
        <single-upload v-model="dataForm.logo" />
      </el-form-item>
      <el-form-item label="介绍" prop="desc">
        <el-input v-model="dataForm.descript" placeholder="介绍"></el-input>
      </el-form-item>
      <el-form-item label="显示状态" prop="showStatus">
        <el-switch
          v-model="dataForm.showStatus"
          :active-value="1"
          :inactive-value="0"
          active-color="#13ce66"
          inactive-color="#ff4949"
        ></el-switch>
      </el-form-item>
      <el-form-item label="检索首字母" prop="firstLetter">
        <el-input
          v-model="dataForm.firstLetter"
          placeholder="检索首字母"
        ></el-input>
      </el-form-item>
      <el-form-item label="排序" prop="sort">
        <el-input v-model="dataForm.sort" placeholder="排序"></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="submit()">{{ button }}</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { reactive, ref, nextTick } from 'vue'
import type { TradeMark } from '@/api/product/trademark/type.ts'
import singleUpload from '@/components/upload/singleUpload.vue'
import {
  reqAddOrUpdateTrademark,
  reqTrademarkInfo,
} from '@/api/product/trademark'

defineProps<{ visible: boolean }>()
const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'refreshDataList'): void
}>()
const updateVisible = (value: boolean) => {
  emit('update:visible', value)
}

const dataForm = reactive<TradeMark>({
  name: '',
  logo: '',
  descript: '',
  showStatus: 0,
  firstLetter: '',
  sort: 0,
})

const button = ref('添加')
// 处理取消按钮点击
const handleCancel = () => {
  updateVisible(false)
}

// 提交表单
const submit = async () => {
  try {
    const response: any = await reqAddOrUpdateTrademark(dataForm)
    if (response && response.code === 200) {
      ElMessage.success(`品牌${button.value}成功`)
      updateVisible(false)
      emit('refreshDataList')
    } else {
      // 后端校验失败等（HTTP 200 + code!=200，如参数格式校验）：拼接字段错误信息展示
      const fieldErrors = response?.extra?.data
        ? Object.values(response.extra.data).join('；')
        : ''
      ElMessage.error(
        (response?.message || response?.msg || `品牌${button.value}失败`) +
          (fieldErrors ? `：${fieldErrors}` : ''),
      )
    }
  } catch (error) {
    console.error(`品牌${button.value}失败`, error)
    ElMessage.error(`品牌${button.value}失败`)
  }
}

// 更新品牌时获取信息
const init = (brandId: number) => {
  dataForm.brandId = brandId
  button.value = brandId >= 0 ? '修改' : '添加'
  nextTick(async () => {
    dataForm.name = ''
    dataForm.logo = ''
    dataForm.descript = ''
    dataForm.showStatus = 1
    dataForm.firstLetter = ''
    dataForm.sort = 0
    if (brandId > 0) {
      try {
        const response = await reqTrademarkInfo(brandId)
        if (response.code === 200) {
          dataForm.name = response.data.name
          dataForm.logo = response.data.logo
          dataForm.descript = response.data.descript
          dataForm.showStatus = response.data.showStatus
          dataForm.firstLetter = response.data.firstLetter
          dataForm.sort = response.data.sort
        }
      } catch (error) {
        // ElMessage.error('获取品牌信息失败')
        console.error('品牌添加失败:', error)
      }
    }
  })
}

// 暴露方法
defineExpose({ init })
</script>
