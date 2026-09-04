<template>
  <el-dialog
    :title="button"
    :close-on-click-modal="false"
    :model-value="visible"
    @update:model-value="updateVisible"
    @closed="dialogClose"
  >
    <el-form :model="dataForm" label-width="120px">
      <!--       @keyup.enter.native="dataFormSubmit()" -->
      <el-form-item label="属性名" prop="attrName">
        <el-input v-model="dataForm.attrName" placeholder="属性名"></el-input>
      </el-form-item>
      <el-form-item label="属性类型" prop="attrType">
        <el-select v-model="dataForm.attrType" placeholder="请选择">
          <el-option label="规格参数" :value="1"></el-option>
          <el-option label="销售属性" :value="0"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="值类型" prop="valueType">
        <el-switch
          v-model="dataForm.valueType"
          active-text="允许多个值"
          inactive-text="只能单个值"
          active-color="#13ce66"
          inactive-color="#ff4949"
          :inactive-value="0"
          :active-value="1"
        ></el-switch>
      </el-form-item>
      <el-form-item label="可选值" prop="valueSelect">
        <!-- <el-input v-model="dataForm.valueSelect"></el-input> -->
        <el-select
          v-model="dataForm.valueSelect"
          multiple
          filterable
          allow-create
          placeholder="请输入内容"
        ></el-select>
      </el-form-item>
      <el-form-item label="属性图标" prop="icon">
        <el-input v-model="dataForm.icon" placeholder="属性图标"></el-input>
      </el-form-item>
      <el-form-item label="所属分类" prop="catelogId">
        <Cascader style="width: 100%" v-model:catelogPath="catelogPath" />
      </el-form-item>
      <el-form-item
        label="所属分组"
        prop="attrGroupId"
        v-if="props.attrType == 1"
      >
        <el-select
          ref="groupSelect"
          v-model="dataForm.attrGroupId"
          placeholder="请选择"
        >
          <el-option
            v-for="item in attrGroups"
            :key="item.attrGroupId"
            :label="item.attrGroupName"
            :value="item.attrGroupId"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="可检索" prop="searchType" v-if="props.attrType == 1">
        <el-switch
          v-model="dataForm.searchType"
          active-color="#13ce66"
          inactive-color="#ff4949"
          :active-value="1"
          :inactive-value="0"
        ></el-switch>
      </el-form-item>
      <el-form-item label="快速展示" prop="showDesc" v-if="props.attrType == 1">
        <el-switch
          v-model="dataForm.showDesc"
          active-color="#13ce66"
          inactive-color="#ff4949"
          :active-value="1"
          :inactive-value="0"
        ></el-switch>
      </el-form-item>
      <el-form-item label="启用状态" prop="enable">
        <el-switch
          v-model="dataForm.enable"
          active-color="#13ce66"
          inactive-color="#ff4949"
          :active-value="1"
          :inactive-value="0"
        ></el-switch>
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
import { nextTick, reactive, ref, watch } from 'vue'
import Cascader from '@/views/common/cascader.vue'

import {
  reqAddResponseData,
  reqInitAttrList,
  reqPathAttrList,
} from '@/api/product/baseattr'

const dataForm = reactive({
  attrId: 0,
  attrName: '',
  searchType: 0,
  valueType: 1,
  icon: '',
  valueSelect: [],
  attrType: 1,
  enable: 1,
  catelogId: '',
  attrGroupId: '',
  showDesc: 0,
})
const catelogPath = ref([])
// 未选择分类时分组列表为空，避免出现假选项（如 attrGroupId: 0）
const attrGroups = ref<Array<{ attrGroupId: number; attrGroupName: string }>>(
  [],
)

const button = ref('')
const props = defineProps({
  attrType: {
    type: Number,
    default: 1,
  },
  visible: Boolean,
})

const emit = defineEmits(['update:type', 'update:visible'])

const updateVisible = (value: boolean) => {
  emit('update:visible', value)
}

const handleCancel = () => {
  updateVisible(false)
}

const dialogClose = () => {
  catelogPath.value = []
}

watch(
  () => catelogPath.value,
  async (path: any) => {
    attrGroups.value = []
    dataForm.attrGroupId = ''
    // 编辑回显时后端可能返回 null（分类路径异常），避免 path.length 报错
    path = path || []
    dataForm.catelogId = path[path.length - 1] || ''
    if (path.length === 3) {
      try {
        const response = await reqPathAttrList(
          path[path.length - 1] || '',
          1,
          100000,
        )
        if (response.code === 200) {
          attrGroups.value = response.data.list
        } else {
          console.error(response.msg)
        }
      } catch (error) {
        console.error('请求失败', error)
      }
    } else if (path.length === 0) {
      dataForm.catelogId = ''
    } else {
      console.error('请选择正确的分类')
      dataForm.catelogId = ''
    }
  },
)

const init = (attrId: number) => {
  dataForm.attrId = attrId
  dataForm.attrType = props.attrType
  button.value = attrId > 0 ? '修改' : '新增'
  nextTick(async () => {
    dataForm.attrName = ''
    dataForm.searchType = 0
    dataForm.valueType = 1
    dataForm.icon = ''
    dataForm.valueSelect = []
    dataForm.enable = 1
    dataForm.catelogId = ''
    dataForm.attrGroupId = ''
    dataForm.showDesc = 0
    if (attrId > 0) {
      try {
        const response = await reqInitAttrList(attrId)
        if (response.code === 200) {
          dataForm.attrName = response.data.attrName
          dataForm.searchType = response.data.searchType
          dataForm.valueType = response.data.valueType
          dataForm.icon = response.data.icon
          dataForm.valueSelect = (response.data.valueSelect || '').split(';')
          dataForm.attrType = response.data.attrType
          dataForm.enable = response.data.enable
          dataForm.catelogId = response.data.catelogId
          dataForm.showDesc = response.data.showDesc
          catelogPath.value = response.data.catelogPath || []
          await nextTick(() => {
            // 无分组（0/null）时置空，避免下拉框显示 0
            dataForm.attrGroupId = response.data.attrGroupId || ''
          })
        }
      } catch (error) {
        console.error('规则参数获取失败:', error)
      }
    }
  })
}

const dataFormSubmit = async () => {
  try {
    await reqAddResponseData(
      dataForm.attrId < 0 ? 'save' : 'update',
      dataForm.attrId,
      dataForm.attrName,
      dataForm.searchType,
      dataForm.icon,
      dataForm.valueSelect.join(';'),
      dataForm.attrType,
      dataForm.enable,
      dataForm.catelogId,
      dataForm.attrGroupId,
      dataForm.showDesc,
    )
    ElMessage.success(`规则参数${button.value}成功`)
  } catch (error) {
    console.error(`规则参数${button.value}失败`, error)
    ElMessage.error(`规则参数${button.value}失败，请稍后重试`)
  }
}

// 暴露方法
defineExpose({ init })
</script>

<style scoped lang="scss"></style>
