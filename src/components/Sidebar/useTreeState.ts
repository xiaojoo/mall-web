import { ref } from 'vue'
import type { TreeItem } from './types'

export function useTreeState(initialItems: TreeItem[]) {
  const items = ref<TreeItem[]>(initialItems)

  const toggleNode = (item: TreeItem) => {
    item.expanded = !item.expanded
  }

  return {
    items,
    toggleNode,
  }
}
