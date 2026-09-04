<template>
  <div class="layout-container">
    <div class="layout-slider" :class="{ fold: LayOutSettingStore.isCollapse }">
      <Logo :fold="LayOutSettingStore.isCollapse" />
      <el-scrollbar class="scrollbar">
        <Menu
          background-color="$base-bar-bg-color"
          text-color="#959ea6"
          :menuList="userStore.menuRoutes"
          :default-active="$route.path"
        />
        <!--        active-text-color="#fff"-->
      </el-scrollbar>
    </div>
    <div class="layout-right">
      <div class="layout-bar">
        <Tabbar />
      </div>
      <div class="layout-main">
        <Main />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import Logo from './logo/index.vue'
import Menu from './menu/index.vue'
import Main from './main/index.vue'
import Tabbar from './tabbar/index.vue'
import useUserStore from '@/store/modules/user.ts'
import useLayOutSettingStore from '@/store/modules/setting.ts'

const userStore = useUserStore()
const LayOutSettingStore = useLayOutSettingStore()

let $route = useRoute()

// 视口小于该宽度时自动折叠为纯图标菜单（与最小宽度一致）
const COLLAPSE_BREAKPOINT = 1280

let wasSmall = window.innerWidth < COLLAPSE_BREAKPOINT
const handleResize = () => {
  const isSmall = window.innerWidth < COLLAPSE_BREAKPOINT
  // 只在跨越断点时强制切换，不覆盖用户在宽屏下的手动折叠选择
  if (isSmall !== wasSmall) {
    LayOutSettingStore.isCollapse = isSmall
    wasSmall = isSmall
  }
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style lang="scss" scoped>
.layout-container {
  display: flex;
  /* 最小宽度：达到后不再缩小，视口更小时 body 出现横向滚动 */
  min-width: 80rem;
  height: 100vh;
  background-color: $base-bg-color;
  overflow: hidden;

  .layout-slider {
    flex-shrink: 0;
    width: $base-menu-width;
    height: 100vh;
    background-color: #0c2556;
    /* 只过渡宽度：过渡 all 会在折叠瞬间引发内容跳动；overflow hidden 抑制过渡期溢出 */
    transition: width 0.3s;
    overflow: hidden;

    .scrollbar {
      max-height: calc(100vh - $base-menu-logo-height);
    }

    &.fold {
      width: $base-menu-min-with;
    }
  }

  .layout-right {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    height: 100vh;
  }

  .layout-bar {
    flex-shrink: 0;
    height: $base-bar-height;
    background-color: #ffffff;
    overflow: hidden;
  }

  .layout-main {
    flex: 1;
    min-height: 0;
    background-color: $base-bg-color;
    padding: 1rem;
    overflow: auto;
  }
}
</style>
