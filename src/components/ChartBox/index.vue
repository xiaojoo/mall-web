<template>
  <div ref="chartRef" class="chart-box"></div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import echarts from '@/utils/echarts'

const props = defineProps<{
  option: Record<string, any>
  height?: string
}>()

const chartRef = ref<HTMLDivElement>()
let chart: echarts.ECharts | null = null

const resize = () => chart?.resize()

const render = () => {
  if (!chart || !props.option) return
  chart.setOption(props.option, true)
}

onMounted(() => {
  if (!chartRef.value) return
  chart = echarts.init(chartRef.value)
  render()
  window.addEventListener('resize', resize)
})

// option 变化时重绘（deep watch 兼容接口返回后整体替换）
watch(
  () => props.option,
  () => render(),
  { deep: true },
)

onBeforeUnmount(() => {
  window.removeEventListener('resize', resize)
  chart?.dispose()
  chart = null
})
</script>

<style scoped lang="scss">
.chart-box {
  width: 100%;
  height: v-bind('props.height || "320px"');
}
</style>
