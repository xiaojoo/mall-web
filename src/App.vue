<template>
  <!-- el-config-provider 提供中文 locale（按需引入下代替 app.use(ElementPlus, {locale})） -->
  <el-config-provider :locale="zhCn">
    <router-view></router-view>
  </el-config-provider>
</template>

<script setup lang="ts">
import zhCn from 'element-plus/es/locale/lang/zh-cn'
</script>

<style scoped lang="scss"></style>
