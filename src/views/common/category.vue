<template>
  <el-input
    placeholder="搜索"
    v-model="filterText"
    style="margin-bottom: 1.2rem"
  />
  <el-tree
    :data="menus"
    :props="defaultProps"
    node-key="catId"
    ref="menuTree"
    @node-click="nodeClick"
    :filter-node-method="filterNode"
    :highlight-current="true"
    :default-expanded-keys="expandedKey"
  />
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { reqCategoryCascader } from '@/api/common/cascader.ts'

const filterText = ref('')
const menus = ref([])
const expandedKey = ref<number[]>([])
const menuTree = ref()

interface Menu {
  catId: string
  name: string
  children?: Menu[]
}

const defaultProps = {
  children: 'children',
  label: 'name',
}

watch(filterText, (val) => {
  if (filterText.value === '') {
    expandedKey.value = []
  }
  menuTree.value!.filter(val)
})

const filterNode = (value: any, data: any) => {
  if (!value) return true
  return data.name.indexOf(value) !== -1
}

const getMenus = async () => {
  try {
    const response = await reqCategoryCascader()
    menus.value = response.data
  } catch (error) {
    console.error(error)
  }
}

const emit = defineEmits(['treeNodeClick'])

const nodeClick = (data: Menu, node: any, component: any) => {
  emit('treeNodeClick', data, node, component)
}

onMounted(() => {
  getMenus()
})
</script>

<style scoped lang="scss"></style>
