<template>
  <div class="home">
    <!-- 统计卡片（6 张撑满一行） -->
    <el-row :gutter="16" class="stat-row">
      <el-col
        :span="12"
        :md="8"
        :lg="4"
        v-for="card in statCards"
        :key="card.label"
      >
        <el-card shadow="hover" class="stat-card">
          <div class="stat-label">{{ card.label }}</div>
          <div class="stat-value" :style="{ color: card.color }">
            {{ card.value }}
          </div>
          <div class="stat-sub" v-if="card.sub">{{ card.sub }}</div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 折线图：近 7 天趋势 + 环形图：成功/失败 -->
    <el-row :gutter="16" class="chart-row">
      <el-col :span="24" :lg="16">
        <el-card shadow="hover">
          <template #header>
            <div class="card-title">
              <span>近 7 天请求趋势</span>
              <el-tag type="info" size="small">按操作时间统计</el-tag>
            </div>
          </template>
          <ChartBox :option="trendOption" height="100%" />
        </el-card>
      </el-col>
      <el-col :span="24" :lg="8">
        <el-card shadow="hover">
          <template #header>
            <div class="card-title">
              <span>请求成功率</span>
              <el-tag :type="rateType" size="small">
                {{ stats.successRate ?? 0 }}%
              </el-tag>
            </div>
          </template>
          <ChartBox :option="rateOption" height="100%" />
        </el-card>
      </el-col>
    </el-row>

    <!-- 条形图：今日每小时 + 饼图：请求方法分布 -->
    <el-row :gutter="16" class="chart-row">
      <el-col :span="24" :lg="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-title">
              <span>今日请求分布（按小时）</span>
              <el-tag type="warning" size="small">
                今日共 {{ stats.todayTotal ?? 0 }} 次
              </el-tag>
            </div>
          </template>
          <ChartBox :option="hourOption" height="100%" />
        </el-card>
      </el-col>
      <el-col :span="24" :lg="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-title">
              <span>请求方法分布 TOP10</span>
              <el-tag type="primary" size="small">
                {{ stats.methodCount ?? 0 }} 种方法
              </el-tag>
            </div>
          </template>
          <ChartBox :option="methodOption" height="100%" />
        </el-card>
      </el-col>
    </el-row>

    <!-- 失败方法 TOP10 + 活跃用户 TOP10 -->
    <el-row :gutter="16" class="chart-row table-row">
      <el-col :span="24" :lg="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-title">
              <span>失败方法 TOP10</span>
              <el-tag type="danger" size="small">
                {{ stats.fail ?? 0 }} 次失败
              </el-tag>
            </div>
          </template>
          <el-table
            :data="stats.topFailMethods || []"
            size="small"
            empty-text="暂无失败记录"
          >
            <el-table-column type="index" label="#" width="50" />
            <el-table-column
              prop="method"
              label="请求方法"
              show-overflow-tooltip
            />
            <el-table-column
              prop="failCount"
              label="失败次数"
              width="100"
              align="center"
            >
              <template #default="{ row }">
                <el-tag type="danger" size="small">{{ row.failCount }}</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="24" :lg="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-title">
              <span>活跃用户 TOP10</span>
              <el-tag type="success" size="small">
                {{ stats.userCount ?? 0 }} 个登录用户
              </el-tag>
            </div>
          </template>
          <el-table :data="stats.topUsers || []" size="small">
            <el-table-column type="index" label="#" width="50" />
            <el-table-column prop="username" label="用户名" />
            <el-table-column
              prop="cnt"
              label="操作次数"
              width="100"
              align="center"
            >
              <template #default="{ row }">
                <el-tag type="success" size="small">{{ row.cnt }}</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import { reqLogStats } from '@/api/acl'

const stats = ref<any>({})

const rateType = computed(() => {
  const rate = stats.value.successRate ?? 0
  return rate >= 90 ? 'success' : rate >= 60 ? 'warning' : 'danger'
})

const statCards = computed(() => {
  const rate = stats.value.successRate ?? 0
  const rateColor = rate >= 90 ? '#67c23a' : rate >= 60 ? '#e6a23c' : '#f56c6c'
  return [
    {
      label: '总请求数',
      value: stats.value.total ?? '-',
      sub: '累计统计',
      color: '#409eff',
    },
    {
      label: '今日请求',
      value: stats.value.todayTotal ?? '-',
      sub: `今日失败 ${stats.value.todayFail ?? 0} 次`,
      color: '#79bbff',
    },
    {
      label: '登录用户数',
      value: stats.value.userCount ?? '-',
      sub: '去重统计',
      color: '#67c23a',
    },
    {
      label: '请求方法数',
      value: stats.value.methodCount ?? '-',
      sub: '去重统计',
      color: '#909399',
    },
    {
      label: 'IP 地址数',
      value: stats.value.ipCount ?? '-',
      sub: '去重统计',
      color: '#e6a23c',
    },
    {
      label: '成功率',
      value: rate + '%',
      sub: `失败 ${stats.value.fail ?? 0} 次`,
      color: rateColor,
    },
  ]
})

const chartColors = [
  '#409eff',
  '#67c23a',
  '#e6a23c',
  '#f56c6c',
  '#909399',
  '#79bbff',
  '#b37feb',
  '#36cfc9',
  '#ff85c0',
  '#ffc53d',
]

// 近 7 天趋势折线图
const trendOption = computed(() => {
  const trend = stats.value.trend || []
  return {
    tooltip: { trigger: 'axis' },
    legend: { data: ['总请求', '成功'], top: 0 },
    grid: { left: 40, right: 20, top: 40, bottom: 30 },
    xAxis: {
      type: 'category',
      data: trend.map((t: any) => String(t.day).slice(5)),
    },
    yAxis: { type: 'value', minInterval: 1 },
    series: [
      {
        name: '总请求',
        type: 'line',
        smooth: true,
        data: trend.map((t: any) => t.total),
        itemStyle: { color: '#409eff' },
        areaStyle: { opacity: 0.08 },
      },
      {
        name: '成功',
        type: 'line',
        smooth: true,
        data: trend.map((t: any) => t.success),
        itemStyle: { color: '#67c23a' },
        areaStyle: { opacity: 0.08 },
      },
    ],
  }
})

// 成功率环形图
const rateOption = computed(() => {
  const success = stats.value.success ?? 0
  const fail = stats.value.fail ?? 0
  return {
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { bottom: 0 },
    series: [
      {
        type: 'pie',
        radius: ['45%', '70%'],
        center: ['50%', '45%'],
        avoidLabelOverlap: true,
        label: { show: false },
        emphasis: { label: { show: true, fontWeight: 'bold' } },
        data: [
          { name: '成功', value: success, itemStyle: { color: '#67c23a' } },
          { name: '失败', value: fail, itemStyle: { color: '#f56c6c' } },
        ],
      },
    ],
  }
})

// 今日每小时条形图
const hourOption = computed(() => {
  const hours = stats.value.hourDist || []
  return {
    tooltip: { trigger: 'axis' },
    grid: { left: 40, right: 20, top: 20, bottom: 30 },
    xAxis: {
      type: 'category',
      data: hours.map((h: any) => `${h.hour}时`),
    },
    yAxis: { type: 'value', minInterval: 1 },
    series: [
      {
        name: '请求数',
        type: 'bar',
        barMaxWidth: 14,
        data: hours.map((h: any) => h.cnt),
        itemStyle: { color: '#79bbff', borderRadius: [3, 3, 0, 0] },
      },
    ],
  }
})

// 请求方法分布饼图
const methodOption = computed(() => {
  const dist = stats.value.methodDist || []
  return {
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { type: 'scroll', bottom: 0 },
    series: [
      {
        type: 'pie',
        radius: '65%',
        center: ['50%', '45%'],
        label: { show: false },
        emphasis: { label: { show: true, fontWeight: 'bold' } },
        data: dist.map((m: any, i: number) => ({
          name: m.method,
          value: m.cnt,
          itemStyle: { color: chartColors[i % chartColors.length] },
        })),
      },
    ],
  }
})

const loadStats = async () => {
  try {
    const res: any = await reqLogStats()
    if (res && res.code === 0) {
      stats.value = res.data || {}
    }
  } catch {
    // 接口失败静默，保留空报表
  }
}

onMounted(loadStats)
</script>

<style scoped lang="scss">
.home {
  /* 撑满主区垂直视口：视口高 - 顶栏(4.375rem) - 主区上下 padding(2rem) */
  height: calc(100vh - 6.375rem);
  display: flex;
  flex-direction: column;
  gap: 1rem;

  .stat-row {
    flex-shrink: 0;

    .stat-card {
      :deep(.el-card__body) {
        height: 184px;
        box-sizing: border-box;
        padding: 1.5rem 1.75rem; /* 内边距放大 */
      }

      .stat-label {
        color: #909399;
        font-size: 1rem;
        margin-bottom: 0.75rem;
      }

      .stat-value {
        font-size: 2.5rem;
        font-weight: 600;
        line-height: 1.2;
      }

      .stat-sub {
        color: #c0c4cc;
        font-size: 0.875rem;
        margin-top: 0.5rem;
      }
    }
  }

  .chart-row {
    flex: 1;
    min-height: 0;

    /* 图表列/卡片/内容区高度链条：撑满所在行 */
    :deep(.el-col) {
      height: 100%;
    }

    :deep(.el-card) {
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    :deep(.el-card__body) {
      flex: 1;
      min-height: 0;
    }
  }

  .table-row {
    flex-shrink: 0;
  }

  .card-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
</style>
