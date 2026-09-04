<template>
  <el-icon
    style="margin-right: 10px; cursor: pointer"
    size="20px"
    @click="changeIcon"
  >
    <component :is="LayOutSettingStore.isCollapse ? Fold : Expand"></component>
  </el-icon>
  <!-- 面包屑-->
  <el-breadcrumb :separator-icon="ArrowRight">
    <el-breadcrumb-item
      v-for="(item, index) in $route.matched"
      :key="index"
      :to="item.path"
    >
      {{ item.meta.title }}
    </el-breadcrumb-item>
  </el-breadcrumb>
</template>

<script setup lang="ts">
import { ArrowRight, Expand, Fold } from '@element-plus/icons-vue'
import useLayOutSettingStore from '@/store/modules/setting.ts'
import { useRoute } from 'vue-router'

const LayOutSettingStore = useLayOutSettingStore()

const $route = useRoute()

const changeIcon = () => {
  LayOutSettingStore.isCollapse = !LayOutSettingStore.isCollapse
}
</script>

<style scoped lang="scss"></style>
