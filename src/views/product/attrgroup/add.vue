<template>
  <el-dialog
    :model-value="modelValue"
    @update:model-value="updateVisible"
    :title="button"
  >
    <el-form
      :model="dataForm"
      @keyup.enter.native="dataFormSubmit()"
      label-width="120px"
    >
      <el-form-item label="组名" prop="attrGroupName">
        <el-input v-model="dataForm.attrGroupName" placeholder="组名" />
      </el-form-item>
      <el-form-item label="排序">
        <el-input v-model="dataForm.sort" placeholder="排序" />
      </el-form-item>
      <el-form-item label="描述">
        <el-input v-model="dataForm.descript" placeholder="描述" />
      </el-form-item>
      <el-form-item label="组图标">
        <el-input v-model="dataForm.icon" placeholder="组图标" />
      </el-form-item>
      <el-form-item label="所属分类ID">
        <el-cascader
          filterable
          v-model="dataForm.catelogPath"
          :options="catgorys"
          clearable
          :props="props"
        />
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
import { ref, onMounted, nextTick, reactive } from 'vue'
import { reqCategoryList } from '@/api/product/category'
import {
  reqAddResponseData,
  reqAttrGroup,
} from '@/api/product/attrgroup/index.ts'

const catgorys = ref([])
const dataForm = reactive({
  attrGroupId: 0,
  attrGroupName: '',
  sort: 0,
  descript: '',
  icon: '',
  catelogPath: [],
  catelogId: 0,
})
const props = {
  value: 'catId',
  label: 'name',
  children: 'children',
}
const button = ref('添加')

defineProps(['modelValue'])

const emit = defineEmits(['update:modelValue'])

const getMenus = async () => {
  try {
    const response = await reqCategoryList()
    catgorys.value = response.data
  } catch (error) {
    console.error('获取属性列表失败', error)
  }
}

const updateVisible = (value: boolean) => {
  emit('update:modelValue', value)
}
// 处理取消按钮点击
const handleCancel = () => {
  updateVisible(false)
}

const init = (id: number) => {
  dataForm.attrGroupId = id || 0
  button.value = id > 0 ? '修改' : '添加'
  nextTick(async () => {
    dataForm.attrGroupId = 0
    dataForm.attrGroupName = ''
    dataForm.sort = 0
    dataForm.descript = ''
    dataForm.icon = ''
    dataForm.catelogId = 0
    dataForm.catelogPath = []
    if (id > 0) {
      try {
        const response = await reqAttrGroup(id)
        if (response.code === 200) {
          dataForm.attrGroupId = response.data.attrGroupId
          dataForm.attrGroupName = response.data.attrGroupName
          dataForm.sort = response.data.sort
          dataForm.descript = response.data.descript
          dataForm.icon = response.data.icon
          dataForm.catelogId = response.data.catelogId
          dataForm.catelogPath = response.data.catelogPath
        }
      } catch (error) {
        console.error('属性信息获取失败:', error)
      }
    }
  })
}

const dataFormSubmit = async () => {
  try {
    await reqAddResponseData(
      dataForm.attrGroupId > 0 ? 'update' : 'save',
      dataForm.attrGroupId,
      dataForm.attrGroupName,
      dataForm.sort,
      dataForm.descript,
      dataForm.icon,
      dataForm.catelogPath[dataForm.catelogPath.length - 1],
    )
    ElMessage.success(`属性${button.value}成功`)
  } catch (error) {
    console.error(`属性${button.value}失败`, error)
  }
}

// 暴露方法
defineExpose({ init })

onMounted(() => {
  getMenus()
})
</script>

<style scoped lang="scss">
.el-cascader {
  width: 100%;
}
</style>
