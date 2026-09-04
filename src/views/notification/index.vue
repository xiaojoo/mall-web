<template>
  <button @click="showNotification">显示通知</button>
</template>

<script setup lang="ts">
import { useCustomNotification } from '@/hook/useCustomNotification'

function getTime(): string {
  const hours = new Date().getHours()
  if (hours < 12) return '早上好'
  if (hours < 18) return '下午好'
  return '晚上好'
}

const { notify } = useCustomNotification()

const showNotification = () => {
  notify({
    title: `Hi，${getTime()}`,
    message: '欢迎回来',
    type: 'success',
    duration: 3000,
  })
}
</script>
