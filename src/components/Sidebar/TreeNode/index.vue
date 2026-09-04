<template>
  <div class="tree-node" :aria-expanded="item.expanded">
    <div
      class="tree-node-content"
      @click="toggle"
      role="treeitem"
      :aria-expanded="item.expanded"
    >
      <span class="tree-node-toggle" v-if="hasChildren" aria-hidden="true">
        {{ item.expanded ? '▼' : '▶' }}
      </span>
      <span class="tree-node-icon" v-if="item.icon" aria-hidden="true">
        <svg-icon :name="item.icon" width="16px" height="16px" />
      </span>
      <span class="tree-node-label">{{ item.label }}</span>
    </div>
    <transition name="fade">
      <div
        v-if="item.expanded && hasChildren"
        class="tree-node-children"
        role="group"
      >
        <tree-node
          v-for="child in item.children"
          :key="child.id"
          :item="child"
          @toggle="$emit('toggle', $event)"
        />
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { TreeItem } from '../types'
import TreeNode from '@/components/Sidebar/TreeNode/index.vue'

const props = defineProps<{
  item: TreeItem
}>()

const emit = defineEmits<{
  (e: 'toggle', item: TreeItem): void
}>()

const hasChildren = computed(
  () => props.item.children && props.item.children.length > 0,
)

const toggle = () => {
  emit('toggle', props.item)
}
</script>

<style lang="scss" scoped>
.tree-node {
  &-content {
    display: flex;
    align-items: center;
    cursor: pointer;
    padding: 5px 0;

    &:hover {
      background-color: #f0f0f0;
    }
  }

  &-toggle {
    width: 20px;
    text-align: center;
    font-size: 12px;
  }

  &-icon {
    margin-right: 5px;
  }

  &-label {
    flex-grow: 1;
  }

  &-children {
    padding-left: 20px;
    overflow: hidden;
  }
}

.expand-fade-enter-active,
.expand-fade-leave-active {
  transition:
    height 0.3s ease,
    opacity 0.3s ease;
}

.expand-fade-enter-from,
.expand-fade-leave-to {
  height: 0;
  opacity: 0;
}

.expand-fade-enter-to,
.expand-fade-leave-from {
  height: auto;
  opacity: 1;
}
</style>
