<template>
  <el-menu
    :collapse="LayOutSettingStore.isCollapse"
    :collapse-transition="false"
  >
    <template v-for="menu in menuList" :key="menu.path">
      <!-- 无子菜单（或子级全隐藏的空 children：扁平一级菜单，index/goRoute 用 redirect） -->
      <el-menu-item
        v-if="!menu.children || menu.children.length === 0"
        :index="menu.redirect || menu.path"
        @click="goRoute(menu)"
      >
        <el-icon>
          <component :is="resolveMenuIcon(menu.meta.icon)" />
        </el-icon>
        <span>{{ menu.meta.title }}</span>
      </el-menu-item>

      <!-- 有子菜单 -->
      <el-sub-menu
        v-else-if="menu.children && menu.children.length > 0"
        :index="menu.path"
      >
        <template #title>
          <el-icon>
            <component :is="resolveMenuIcon(menu.meta.icon)" />
          </el-icon>
          <span>{{ menu.meta.title }}</span>
        </template>
        <template v-for="subMenu in menu.children" :key="subMenu.path">
          <!-- 子菜单无子项 -->
          <el-menu-item
            v-if="!subMenu.children || subMenu.children.length === 0"
            :index="subMenu.path"
            @click="goRoute(subMenu)"
          >
            <el-icon>
              <component :is="resolveMenuIcon(subMenu.meta.icon)" />
            </el-icon>
            <span>{{ subMenu.meta.title }}</span>
          </el-menu-item>
          <!-- 子菜单有子项 -->
          <el-sub-menu
            v-else-if="subMenu.children && subMenu.children.length > 0"
            :index="subMenu.path"
          >
            <template #title style="padding-left: 0">
              <el-icon>
                <component :is="resolveMenuIcon(subMenu.meta.icon)" />
              </el-icon>
              <span>{{ subMenu.meta.title }}</span>
            </template>
            <el-menu-item
              v-for="sub in subMenu.children"
              :key="sub.path"
              :index="sub.path"
              @click="goRoute(sub)"
            >
              <template #title>
                <el-icon>
                  <component :is="resolveMenuIcon(sub.meta.icon)" />
                </el-icon>
                <span>{{ sub.meta.title }}</span>
              </template>
            </el-menu-item>
          </el-sub-menu>
        </template>
      </el-sub-menu>
    </template>
  </el-menu>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

import { resolveMenuIcon } from '@/utils/menuIcons'
import useLayOutSettingStore from '@/store/modules/setting.ts'

defineProps(['menuList'])

const LayOutSettingStore = useLayOutSettingStore()

// 点击菜单的回调
const $router = useRouter()

// 路由跳转（扁平一级菜单用 redirect 目标，保证高亮与跳转一致）
const goRoute = (menu: any) => {
  $router.push({ path: menu.redirect || menu.path })
}
</script>

<style lang="scss" scoped>
.el-menu {
  border: none;
}
</style>
