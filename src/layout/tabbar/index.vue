<template>
  <div class="tab-bar">
    <div class="tab-bat-left">
      <Breadcrumb />
    </div>
    <div class="tab-bat-right">
      <String />
    </div>
  </div>
</template>

<script setup lang="ts">
import String from './setting/index.vue'
import Breadcrumb from './breadcrumb/index.vue'
</script>

<style scoped lang="scss">
.tab-bar {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 1rem;

  .tab-bat-left,
  .tab-bat-right {
    height: 100%;
    display: flex;
    align-items: center;
  }
}
</style>
