import type { App, Directive, DirectiveBinding } from 'vue'
import useUserStore from '@/store/modules/user.ts'

/**
 * 按钮级权限指令 v-perms
 *
 * 用法：
 *   单个权限：v-perms="'sys:user:save'"
 *   多个权限（满足任一）：v-perms="['sys:user:save', 'sys:user:update']"
 *   多个权限（满足全部）：v-perms="{ value: ['sys:user:save', 'sys:user:update'], mode: 'and' }"
 *
 * 无权限时：
 *   - 默认：隐藏元素 (display: none)
 *   - 可选：禁用元素 (添加 disabled 属性)
 */
const permsDirective: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const userStore = useUserStore()
    const userPerms: string[] = userStore.perms || []

    // 超级管理员拥有全部权限
    if (userPerms.includes('*:*:*')) {
      return
    }

    let required: string[] = []
    let mode: 'or' | 'and' = 'or'
    let action: 'hide' | 'disable' = 'hide'

    const value = binding.value
    if (typeof value === 'string') {
      required = [value]
    } else if (Array.isArray(value)) {
      required = value
    } else if (value && typeof value === 'object') {
      required = value.value || value.perms || []
      mode = value.mode || 'or'
      action = value.action || 'hide'
    }

    if (required.length === 0) return

    let hasPermission: boolean
    if (mode === 'and') {
      hasPermission = required.every((p) => userPerms.includes(p))
    } else {
      hasPermission = required.some((p) => userPerms.includes(p))
    }

    if (!hasPermission) {
      if (action === 'disable') {
        el.setAttribute('disabled', 'true')
        el.classList.add('is-disabled')
        el.style.pointerEvents = 'none'
        el.style.opacity = '0.5'
      } else {
        el.style.display = 'none'
      }
    }
  },
}

export function setupPermsDirective(app: App) {
  app.directive('perms', permsDirective)
}

export default permsDirective
