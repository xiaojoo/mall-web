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
      <el-form-item label="采购商品id" prop="skuId">
        <el-input v-model="dataForm.skuId" placeholder="采购商品id"></el-input>
      </el-form-item>
      <el-form-item label="采购数量" prop="skuNum">
        <el-input v-model="dataForm.skuNum" placeholder="采购数量"></el-input>
      </el-form-item>
      <el-form-item label="仓库" prop="wareId">
        <el-select v-model="dataForm.wareId" placeholder="请选择仓库" clearable>
          <el-option
            :label="w.name"
            :value="w.id"
            v-for="w in wareList"
            :key="w.id"
          ></el-option>
        </el-select>
      </el-form-item>
      <!-- [0新建，1已分配，2正在采购，3已完成，4采购失败] -->
      <!-- <el-form-item label="状态" prop="status">
        <el-select v-model="dataForm.status" placeholder="请选择状态" clearable>
          <el-option label="新建" :value="0"></el-option>
          <el-option label="已分配" :value="1"></el-option>
          <el-option label="正在采购" :value="2"></el-option>
          <el-option label="已完成" :value="3"></el-option>
          <el-option label="采购失败" :value="4"></el-option>
        </el-select>
      </el-form-item>-->
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
import { nextTick, ref, onMounted } from 'vue'

import { reqWareInfoList } from '@/api/ware/wareinfo'
import {
  reqWarePurchasedetailInfo,
  reqWarePurchasedetailUpdateCommit,
} from '@/api/ware/purchaseitem'

const dataForm = ref({
  id: 0,
  purchaseId: '',
  skuId: '',
  skuNum: '',
  skuPrice: '',
  wareId: '',
  status: 0,
})
const button = ref('添加')
const wareList = ref([
  {
    id: 0,
    name: '',
  },
])

defineProps(['modelValue'])

const emit = defineEmits(['update:modelValue'])

const updateVisible = (value: boolean) => {
  emit('update:modelValue', value)
}

// 处理取消按钮点击
const handleCancel = () => {
  updateVisible(false)
}

const getWares = async () => {
  try {
    const response = await reqWareInfoList(1, 500, '')
    if (response && response.code === 200) {
      wareList.value = response.data.list
    }
  } catch (error) {
    console.error(error)
  }
}

const dataFormSubmit = async () => {
  try {
    await reqWarePurchasedetailUpdateCommit(
      dataForm.value.id > 0 ? 'update' : 'save',
      dataForm.value.id,
      dataForm.value.purchaseId,
      dataForm.value.skuId,
      dataForm.value.skuNum,
      dataForm.value.skuPrice,
      dataForm.value.wareId,
      dataForm.value.status,
    )
    ElMessage.success(`采购${button.value}成功`)
  } catch (error) {
    console.error(`采购${button.value}失败`, error)
  }
}

const init = (id: number) => {
  button.value = id > 0 ? '修改' : '添加'
  nextTick(async () => {
    dataForm.value.id = 0
    dataForm.value.purchaseId = ''
    dataForm.value.skuId = ''
    dataForm.value.skuNum = ''
    dataForm.value.skuPrice = ''
    dataForm.value.wareId = ''
    dataForm.value.status = 0
    if (id > 0) {
      try {
        const response = await reqWarePurchasedetailInfo(id)
        if (response.code === 200) {
          dataForm.value.id = response.data.id
          dataForm.value.purchaseId = response.data.purchaseId
          dataForm.value.skuId = response.data.skuId
          dataForm.value.skuNum = response.data.skuNum
          dataForm.value.skuPrice = response.data.skuPrice
          dataForm.value.wareId = response.data.wareId
          dataForm.value.status = response.data.status
        }
      } catch (error) {
        console.error('采购信息获取失败:', error)
      }
    }
  })
}

// 暴露方法
defineExpose({ init })

onMounted(() => {
  getWares()
})
</script>

<style scoped lang="scss"></style>
