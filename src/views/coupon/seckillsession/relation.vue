<template>
  <div class="mod-config">
    <el-form
      :inline="true"
      :model="dataForm"
      @keyup.enter.native="getDataList()"
    >
      <el-form-item>
        <el-input
          v-model="dataForm.key"
          placeholder="商品id"
          clearable
        ></el-input>
      </el-form-item>
      <el-form-item>
        <el-button @click="getDataList()">查询</el-button>
        <el-select
          v-model="sessionFilter"
          placeholder="场次筛选"
          style="width: 280px; margin: 0 10px"
          @change="onSessionChange"
        >
          <el-option label="全部场次" value=""></el-option>
          <el-option
            v-for="s in sessionOptions"
            :key="s.id"
            :label="`${s.name || '场次#' + s.id}（${fmtTime(s.startTime)} ~ ${fmtTime(s.endTime)}）`"
            :value="String(s.id)"
          ></el-option>
        </el-select>
        <el-button type="primary" @click="addOrUpdateHandle()">新增</el-button>
        <el-button
          type="warning"
          @click="batchShelfHandle(false)"
          :disabled="dataListSelections.length <= 0"
        >
          批量下架
        </el-button>
        <el-button
          type="success"
          @click="batchShelfHandle(true)"
          :disabled="dataListSelections.length <= 0"
        >
          批量上架
        </el-button>
      </el-form-item>
    </el-form>
    <el-table
      :data="dataList"
      border
      v-loading="dataListLoading"
      @selection-change="selectionChangeHandle"
      style="width: 100%"
    >
      <el-table-column
        type="selection"
        header-align="center"
        align="center"
        width="50"
      ></el-table-column>
      <el-table-column
        prop="id"
        header-align="center"
        align="center"
        label="id"
      ></el-table-column>
      <el-table-column
        prop="promotionSessionId"
        header-align="center"
        align="center"
        label="场次id"
      ></el-table-column>
      <el-table-column
        prop="skuId"
        header-align="center"
        align="center"
        label="商品id"
      ></el-table-column>
      <el-table-column
        prop="seckillPrice"
        header-align="center"
        align="center"
        label="秒杀价格"
      ></el-table-column>
      <el-table-column
        prop="seckillCount"
        header-align="center"
        align="center"
        label="秒杀总量"
      ></el-table-column>
      <el-table-column
        prop="seckillLimit"
        header-align="center"
        align="center"
        label="每人限购数量"
      ></el-table-column>
      <el-table-column
        prop="seckillSort"
        header-align="center"
        align="center"
        label="排序"
      ></el-table-column>
      <el-table-column
        header-align="center"
        align="center"
        width="100"
        label="状态"
      >
        <template #default="scope">
          <el-tag
            v-if="(scope.row.shelfStatus ?? 1) === 0"
            type="danger"
            size="small"
          >
            已下架
          </el-tag>
          <el-tag
            v-else-if="Number(scope.row.stock ?? 0) < 0"
            type="info"
            size="small"
          >
            待上架
          </el-tag>
          <el-tag
            v-else-if="Number(scope.row.stock ?? 0) <= 0"
            type="warning"
            size="small"
          >
            已售罄
          </el-tag>
          <el-tag v-else type="success" size="small">上架中</el-tag>
        </template>
      </el-table-column>
      <el-table-column
        fixed="right"
        header-align="center"
        align="center"
        width="190"
        label="操作"
      >
        <template #default="scope">
          <el-button
            v-if="(scope.row.shelfStatus ?? 1) === 0"
            size="small"
            type="success"
            @click="shelfHandle(scope.row, true)"
          >
            上架
          </el-button>
          <el-button
            v-else-if="Number(scope.row.stock ?? 0) > 0"
            size="small"
            type="warning"
            @click="shelfHandle(scope.row, false)"
          >
            下架
          </el-button>
          <el-button
            v-else-if="Number(scope.row.stock ?? 0) === 0"
            size="small"
            type="primary"
            @click="shelfHandle(scope.row, true)"
          >
            补库存
          </el-button>
          <el-button
            size="small"
            @click="addOrUpdateHandle(scope.row.id)"
            v-perms="'coupon:seckillsession:update'"
          >
            修改
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="pagination-box">
      <el-pagination
        @size-change="sizeChangeHandle"
        @current-change="currentChangeHandle"
        :current-page="pageIndex"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="pageSize"
        :total="totalPage"
        layout="total, sizes, prev, pager, next, jumper"
      />
    </div>
    <Add
      :session-id="sessionId"
      :sku-id="skuId"
      v-model="addOrUpdateVisible"
      ref="addOrUpdate"
      @refreshDataList="getDataList"
    ></Add>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import Add from './seckillskurelationAdd.vue'
import {
  reqSeckillSkuRelationList,
  reqSeckillSkuRelationShelf,
  reqSeckillSessionList,
} from '@/api/coupon/seckillsession'

const route = useRoute()
const router = useRouter()
// 清除跳转带入的 skuId 路由参数（弹窗关闭后不再保留）
const clearSkuIdQuery = () => {
  if (route.query.skuId) {
    const query = { ...route.query }
    delete query.skuId
    router.replace({ query })
  }
}

const dataForm = ref({
  key: '',
})
// 从每日秒杀列表跳转带入的场次
const sessionId = ref(Number(route.query.sessionId) || 0)
// 从商品管理「参与秒杀」跳转带入的 skuId（自动打开添加弹窗并预填）
const skuId = ref(Number(route.query.skuId) || 0)
// 场次筛选（''=全部场次）；统一字符串与 el-option 的 String(s.id) 匹配，避免回显成 ID
const sessionFilter = ref(sessionId.value ? String(sessionId.value) : '')
const sessionOptions = ref<any[]>([])

// 时间展示：去掉 T 只留 yyyy-MM-dd HH:mm:ss
const fmtTime = (v: any) =>
  String(v || '')
    .replace('T', ' ')
    .slice(0, 16)

// 加载每日秒杀场次选项
const loadSessions = async () => {
  try {
    const res: any = await reqSeckillSessionList(1, 100, '')
    if (res?.code === 200 && res.data?.list) {
      sessionOptions.value = res.data.list
    }
  } catch {
    /* 忽略 */
  }
}

// 切换场次筛选
const onSessionChange = (val: string) => {
  sessionId.value = val ? Number(val) : 0
  pageIndex.value = 1
  getDataList()
}
const dataList = ref([])
const pageIndex = ref(1)
const pageSize = ref(10)
const totalPage = ref(0)
const dataListLoading = ref(false)
const dataListSelections = ref<any[]>([])
const addOrUpdateVisible = ref(false)
// 添加/修改弹窗关闭后清除 skuId（含保存成功自动关闭、手动取消）
watch(addOrUpdateVisible, (v) => {
  if (!v) clearSkuIdQuery()
})
const addOrUpdate = ref()

const getDataList = async () => {
  dataListLoading.value = true
  try {
    const response = await reqSeckillSkuRelationList(
      pageIndex.value,
      pageSize.value,
      dataForm.value.key,
      sessionId.value,
    )
    if (response && response.code === 200) {
      dataList.value = response.data.list
      totalPage.value = response.data.totalCount
    } else {
      dataList.value = []
      totalPage.value = 0
    }
    dataListLoading.value = false
  } catch (error) {
    console.error(error)
  }
}

// 下架/上架/补库存：DB 先行（shelf_status 持久化）+ Redis 同步；上架/补库存按 DB 最新配置重置库存
const shelfHandle = async (row: any, shelf: boolean) => {
  const actionText = shelf
    ? (row.shelfStatus ?? 1) === 0
      ? '上架'
      : '补库存'
    : '下架'
  try {
    await ElMessageBox.confirm(
      `确定对[id=${row.id}]进行[${actionText}]操作?`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      },
    )
    const response = await reqSeckillSkuRelationShelf(row.id, shelf)
    if (response && response.code === 200) {
      ElMessage.success(`秒杀商品${actionText}成功`)
      getDataList()
    } else {
      ElMessage.error(response.message || response.msg)
    }
  } catch (error) {
    ElMessage.info(`已取消秒杀商品${actionText}`)
  }
}

// 批量下架/上架
const batchShelfHandle = (shelf: boolean) => {
  const ids = dataListSelections.value.map((item) => item.id)
  const actionText = shelf ? '上架' : '下架'
  try {
    ElMessageBox.confirm(
      `确定对[id=${ids.join(',')}]进行批量[${actionText}]操作?`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      },
    ).then(async () => {
      for (const id of ids) {
        await reqSeckillSkuRelationShelf(id, shelf)
      }
      ElMessage.success(`批量${actionText}成功`)
      getDataList()
    })
  } catch (error) {
    ElMessage.info(`已取消批量${actionText}`)
  }
}

// 每页数
const sizeChangeHandle = (val: any) => {
  pageSize.value = val
  pageIndex.value = 1
  getDataList()
}

// 当前页
const currentChangeHandle = (val: any) => {
  pageIndex.value = val
  getDataList()
}

// 多选
const selectionChangeHandle = (val: any) => {
  dataListSelections.value = val
}

// 新增/修改
const addOrUpdateHandle = (id?: any) => {
  addOrUpdateVisible.value = true
  nextTick(() => {
    addOrUpdate.value?.init(id)
  })
}

onMounted(() => {
  loadSessions()
  getDataList()
  // 商品管理「参与秒杀」跳转：自动打开添加弹窗并预填 skuId
  if (skuId.value) {
    addOrUpdateVisible.value = true
    nextTick(() => {
      addOrUpdate.value?.init()
    })
  }
})
</script>

<style scoped lang="scss"></style>
