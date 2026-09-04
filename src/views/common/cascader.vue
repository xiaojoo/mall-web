<template>
  <el-cascader
    class="category-cascader"
    filterable
    clearable
    placeholder="请搜索内容"
    v-model="localPath"
    :options="categorys"
    :props="setting"
  />
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { reqCategoryCascader } from '@/api/common/cascader'
import catBrandStore from '@/store/modules/spu.ts'

const props = defineProps(['catelogPath'])

const setting = {
  value: 'catId',
  label: 'name',
  children: 'children',
}

const categorys = ref([])

const emits = defineEmits(['update:catelogPath'])

const localPath = ref<number[]>(props.catelogPath || [])

const brandStore = catBrandStore()

// 监听props变化，更新本地state
watch(
  () => props.catelogPath,
  (newValue) => {
    localPath.value = newValue || []
  },
  { immediate: true },
)

// 监听本地state变化，通知父组件更新
watch(localPath, (newValue) => {
  emits('update:catelogPath', newValue)
  brandStore.setCatPath(newValue)
})

const getCategory = async () => {
  try {
    const response = await reqCategoryCascader()
    categorys.value = response.data
  } catch (error) {
    console.error('获取关联分类数据失败', error)
  }
}

onMounted(() => {
  getCategory()
})
</script>

<style lang="scss">
/* 选择框撑满表单行宽度（非 scoped：避免组件根元素 scopeId/attrs 落点问题，类名唯一无副作用） */
.category-cascader {
  width: 100% !important;

  .el-input__wrapper {
    width: 100% !important;
  }
}
</style>
