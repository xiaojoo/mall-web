// 后台管理专属键：与 mall-ui（商城）隔离，避免同源时读到商城会员 ID token
const TOKEN_KEY = 'MALL_WEB_TOKEN'
const REFRESH_TOKEN_KEY = 'MALL_WEB_REFRESH_TOKEN'

export const SET_TOKEN = (token: string) => {
  localStorage.setItem(TOKEN_KEY, token)
}

export const GET_TOKEN = () => {
  return localStorage.getItem(TOKEN_KEY)
}

// 本地存储删除TOKEN
export const REMOVE_TOKEN = () => {
  localStorage.removeItem(TOKEN_KEY)
}

export const SET_REFRESH_TOKEN = (token: string) => {
  localStorage.setItem(REFRESH_TOKEN_KEY, token)
}

export const GET_REFRESH_TOKEN = () => {
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

export const REMOVE_REFRESH_TOKEN = () => {
  localStorage.removeItem(REFRESH_TOKEN_KEY)
}

interface TreeNode {
  [key: string]: any

  children?: TreeNode[]
  _level?: number
}

/**
 * Converts flat array to tree structure
 * @param data Flat array of nodes
 * @param id Key name for node identifier (default: 'id')
 * @param pid Key name for parent identifier (default: 'parentId')
 * @returns Tree structure array
 */
export function treeDataTranslate<T extends TreeNode>(
  data: T[],
  id: string = 'id',
  pid: string = 'parentId',
): T[] {
  const nodeMap = new Map<string | number, T>()
  const tree: T[] = []

  // Create map of all nodes（key 统一转字符串：后端 Long 序列化为字符串后 menuId 与 parentId 类型可能不一致）
  data.forEach((node) => {
    nodeMap.set(String(node[id]), { ...node })
  })

  // Build tree structure
  data.forEach((node) => {
    const parentNode = nodeMap.get(String(node[pid]))

    if (parentNode && String(node[id]) !== String(node[pid])) {
      if (!parentNode.children) {
        parentNode.children = []
      }

      parentNode._level = parentNode._level ?? 1
      const currentNode = nodeMap.get(String(node[id]))!
      currentNode._level = parentNode._level + 1

      parentNode.children.push(currentNode)
    } else {
      tree.push(nodeMap.get(String(node[id]))!)
    }
  })

  return tree
}
