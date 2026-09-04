import { defineAsyncComponent } from 'vue'

export { default as Pagination } from './Pagination/index.vue'
export { default as SvgIcon } from './SvgIcon/index.vue'
// ChartBox 改为异步组件：ECharts 体积较大（约 300KB+），
// 全局同步注册会把 echarts 打进主入口包，拖慢首屏刷新。
// 异步加载后 echarts 独立成 chunk，只在真正渲染图表的页面加载。
export const ChartBox = defineAsyncComponent(
  () => import('./ChartBox/index.vue'),
)
