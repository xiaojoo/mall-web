<template>
  <div class="layout-container">
    <div class="layout-slider">
      <Logo />
      <Sidebar :menus="menus" @toggle-menu="handleToggleMenu" />
    </div>
    <div class="layout-bar">22</div>
    <div class="layout-main">
      <div style="height: 5000px">111111</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Logo from './logo/index.vue'
import Sidebar from '@/components/Sidebar/index.vue'
import { reactive } from 'vue'

interface MenuItem {
  title: string
  link?: string
  icon?: string
  open: boolean
  children?: MenuItem[]
}

const menus = reactive<MenuItem[]>([
  {
    title: '用户管理',
    icon: 'input-icon',
    open: false,
    children: [
      { title: '用户列表', link: '#1', icon: 'input-icon', open: false },
      {
        title: '添加用户',
        open: false,
        children: [
          { title: '普通用户', link: '#2', icon: 'input-icon', open: false },
          { title: '管理员', link: '#3', icon: 'input-icon', open: false },
        ],
      },
    ],
  },
  {
    title: '系统设置',
    icon: 'input-icon',
    open: false,
    children: [
      { title: '常规设置', link: '#4', icon: 'input-icon', open: false },
      {
        title: '安全设置',
        open: false,
        children: [
          { title: '密码管理', link: '#5', icon: 'input-icon', open: false },
          { title: '权限管理', link: '#6', icon: 'input-icon', open: false },
        ],
      },
    ],
  },
])

const handleToggleMenu = (updatedMenus: MenuItem[]) => {
  menus.splice(0, menus.length, ...updatedMenus)
}
</script>

<style lang="scss" scoped>
.layout-container {
  width: 100%;
  height: 100vh;
  background-color: $base-bg-color;

  .layout-slider {
    width: $base-menu-width;
    height: 100vh;
    background-color: #0c2556;
  }

  .layout-bar {
    position: fixed;
    width: calc(100% - $base-menu-width);
    height: $base-bar-height;
    background-color: #ffffff;
    left: $base-menu-width;
    top: 0;
  }

  .layout-main {
    position: absolute;
    width: calc(100% - $base-menu-width);
    height: calc(100vh - $base-bar-height);
    background-color: $base-bg-color;
    left: $base-menu-width;
    top: $base-bar-height;
    padding: 1rem;
    overflow: auto;
  }
}
</style>
