<template>
  <div class="logo" v-if="setting.logoHidden">
    <img :src="setting.logo" alt="logo" />
    <p class="logo-title" :style="{ display: fold ? 'none' : 'block' }">
      {{ setting.title }}
    </p>
  </div>
</template>

<script setup lang="ts">
import setting from '@/setting.ts'

defineProps(['fold'])
</script>

<style scoped lang="scss">
.logo {
  width: 100%;
  height: $base-menu-logo-height;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: $base-menu-min-with;
    height: $base-menu-min-with;
  }

  p {
    font-size: $base-logo-title-font-size;
    margin-left: 0.625rem;
    white-space: nowrap; /* 强制文本不换行 */
    overflow: hidden; /* 隐藏超出容器的内容 */
    text-overflow: ellipsis; /* 使用省略号表示被截断的内容 */
    width: calc(
      $base-menu-width - $base-menu-min-with
    ); /* 设置容器的宽度，具体值可根据需求调整 */
  }
}
</style>
