<template>
  <router-view v-slot="{ Component }">
    <transition name="fade">
      <component :is="Component" v-if="flag" />
    </transition>
  </router-view>
</template>

<script setup lang="ts">
import { watch, ref, nextTick } from 'vue'
import useLayOutSettingStore from '@/store/modules/setting.ts'

const layOutSettingStore = useLayOutSettingStore()
const flag = ref(true)

watch(
  () => layOutSettingStore.refresh,
  () => {
    flag.value = false
    nextTick(() => {
      flag.value = true
    })
  },
)
</script>

<style scoped lang="scss">
.fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.fade-enter-active {
  /* 只用合成器友好的 opacity/transform，避免 scale 整页缩放与 all 全属性过渡导致的卡顿 */
  transition:
    opacity 0.25s ease,
    transform 0.25s ease;
}

.fade-enter-to {
  opacity: 1;
  transform: translateY(0);
}
</style>
