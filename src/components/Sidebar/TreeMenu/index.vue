<template>
  <div class="tree-menu" role="tree">
    <tree-node
      v-for="item in items"
      :key="item.id"
      :item="item"
      @toggle="toggleNode"
    />
  </div>
</template>

<script setup lang="ts">
import TreeNode from '@/components/Sidebar/TreeNode/index.vue'
import { useTreeState } from '@/components/Sidebar/useTreeState'
import type { TreeItem } from '@/components/Sidebar/types'
import { mockTreeData } from '@/components/Sidebar/mockTreeData'

// 定义props，默认值为mockTreeData
const props = withDefaults(
  defineProps<{
    initialItems?: TreeItem[]
  }>(),
  {
    initialItems: () => mockTreeData,
  },
)

const { items, toggleNode } = useTreeState(props.initialItems)
</script>

<style lang="scss" scoped>
.tree-menu {
  font-family: Arial, sans-serif;
  color: #333;
  padding: 10px;
}
</style>
