<template>
  <div
    v-show="visible"
    :class="['custom-notification', `custom-notification--${type}`]"
    :style="{ top: `${positionOffset}px` }"
  >
    <div class="custom-notification-icon"></div>
    <div class="custom-notification-content">
      <div class="custom-notification-title">{{ title }}</div>
      <div class="custom-notification-message">{{ message }}</div>
    </div>
    <span class="custom-notification-close" @click="close">×</span>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted, watch } from 'vue'

const props = defineProps({
  title: {
    type: String,
    default: '提示',
  },
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String as () => 'success' | 'info' | 'warning' | 'error',
    default: 'info',
  },
  duration: {
    type: Number,
    default: 3000,
  },
  positionOffset: {
    type: Number,
    required: true,
  },
  id: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['close'])

const visible = ref(true)
let timer: ReturnType<typeof setTimeout> | null = null

const close = () => {
  visible.value = false
  emit('close', props.id)
}

watch(visible, (newValue) => {
  if (!newValue) {
    timer && clearTimeout(timer)
  }
})

timer = setTimeout(() => {
  close()
}, props.duration)

onUnmounted(() => {
  timer && clearTimeout(timer)
})
</script>

<style scoped>
.custom-notification {
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  min-width: 18.75rem;
  background-color: #fff;
  border: 0.0625rem solid #ebeef5;
  border-radius: 0.5rem;
  box-shadow: 0 0.125rem 0.75rem rgba(0, 0, 0, 0.1);
  padding: 0.9375rem;
  display: flex;
  align-items: flex-start;
  z-index: 2000;
  transition: all 0.3s ease;
}

.custom-notification-icon {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  margin-top: 0.125rem;
  margin-right: 0.5rem;
  background-color: var(--notification-icon-bg, #409eff);
}

.custom-notification-icon svg {
  fill: #fff;
  width: 0.8rem;
  height: 0.8rem;
}

.custom-notification-content {
  flex: 1;
}

.custom-notification-title {
  font-size: 1rem;
  font-weight: bold;
  color: #303133;
  line-height: 1.18;
}

.custom-notification-message {
  font-size: 0.875rem;
  color: #606266;
}

.custom-notification-close {
  font-size: 1.125rem;
  color: #c0c4cc;
  cursor: pointer;
  margin-left: 0.625rem;
  transition: color 0.3s;
}

.custom-notification-close:hover {
  color: #909399;
}

/* 类型样式 */
.custom-notification--success .custom-notification-icon {
  --notification-icon-bg: #67c23a;
}

.custom-notification--info .custom-notification-icon {
  --notification-icon-bg: #409eff;
}

.custom-notification--warning .custom-notification-icon {
  --notification-icon-bg: #e6a23c;
}

.custom-notification--error .custom-notification-icon {
  --notification-icon-bg: #f56c6c;
}
</style>
