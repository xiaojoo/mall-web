import { createVNode, render } from 'vue'
import CustomNotification from '@/components/Notification/CustomNotification.vue'

interface NotificationOptions {
  title?: string
  message: string
  type?: 'success' | 'info' | 'warning' | 'error'
  duration?: number
}

interface NotificationInstance {
  id: string
  vnode: any
  container: HTMLElement
}

let notifications: NotificationInstance[] = []
let idCounter = 0
const GAP = 20 // 每个通知之间的固定间隙
const TOP_OFFSET = 11 // 第一个通知框与顶部的间隙
const ITEM_HEIGHT = 60 // 每个通知框的高度，包括间隙

export function useCustomNotification() {
  const notify = (options: NotificationOptions) => {
    const id = `notification-${idCounter++}`
    const container = document.createElement('div')
    document.body.appendChild(container)

    const removeNotification = (removeId: string) => {
      const index = notifications.findIndex((n) => n.id === removeId)
      if (index !== -1) {
        const { container } = notifications[index]
        render(null, container)
        document.body.removeChild(container)
        notifications.splice(index, 1)
        adjustPositions() // 调整剩余通知的位置
      }
    }

    const adjustPositions = () => {
      notifications.forEach((item, index) => {
        const vnode = item.vnode
        vnode.component.props.positionOffset =
          TOP_OFFSET + index * (ITEM_HEIGHT + GAP)
      })
    }

    const vnode = createVNode(CustomNotification, {
      ...options,
      id,
      positionOffset: TOP_OFFSET + notifications.length * (ITEM_HEIGHT + GAP),
      onClose: removeNotification,
    })

    notifications.push({ id, vnode, container })
    render(vnode, container)
  }

  return { notify }
}
