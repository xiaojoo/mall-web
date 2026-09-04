<template>
  <div class="mod-config">
    <el-form
      :inline="true"
      :model="dataForm"
      @keyup.enter.native="getDataList()"
    >
      <el-form-item label="仓库">
        <el-select
          style="width: 160px"
          v-model="dataForm.wareId"
          placeholder="请选择仓库"
          clearable
        >
          <el-option
            v-for="w in wareList"
            :label="w.name"
            :value="w.id"
            :key="w.id"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="skuId">
        <el-input
          v-model="dataForm.skuId"
          placeholder="skuId"
          clearable
        ></el-input>
      </el-form-item>
      <el-form-item>
        <el-button @click="getDataList()">查询</el-button>
        <el-button type="primary" @click="addOrUpdateHandle()">新增</el-button>
        <el-button
          type="danger"
          @click="deleteHandle()"
          :disabled="dataListSelections.length <= 0"
          v-perms="'ware:sku:delete'"
        >
          批量删除
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
        prop="skuId"
        header-align="center"
        align="center"
        label="sku_id"
      ></el-table-column>
      <el-table-column header-align="center" align="center" label="仓库名称">
        <template #default="scope">
          {{
            wareList.find((w) => w.id === scope.row.wareId)?.name ||
            scope.row.wareId
          }}
        </template>
      </el-table-column>
      <el-table-column
        prop="stock"
        header-align="center"
        align="center"
        label="库存数"
      ></el-table-column>
      <el-table-column
        prop="skuName"
        header-align="center"
        align="center"
        label="sku_name"
      ></el-table-column>
      <el-table-column
        prop="stockLocked"
        header-align="center"
        align="center"
        label="锁定库存"
      ></el-table-column>
      <el-table-column
        fixed="right"
        header-align="center"
        align="center"
        width="150"
        label="操作"
      >
        <template #default="scope">
          <el-button
            size="small"
            @click="addOrUpdateHandle(scope.row.id)"
            v-perms="'ware:sku:update'"
          >
            修改
          </el-button>
          <el-button
            size="small"
            @click="deleteHandle(scope.row.id)"
            v-perms="'ware:sku:delete'"
          >
            删除
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
      v-model="addOrUpdateVisible"
      ref="addOrUpdate"
      :sku-id="presetSkuId"
      @refreshDataList="getDataList"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted, watch } from 'vue'

import Add from './add.vue'
import { reqWareSkuDelete, reqWareSkuInfoList } from '@/api/ware/sku'
import { useRoute, useRouter } from 'vue-router'
import { reqWareInfoList } from '@/api/ware/wareinfo'

const dataForm = ref({
  wareId: '',
  skuId: '',
})
const dataList = ref([])
const wareList = ref([
  {
    id: 0,
    name: '',
  },
])
const pageIndex = ref(1)
const pageSize = ref(10)
const totalPage = ref(0)
const dataListLoading = ref(false)
const dataListSelections = ref<any[]>([])
const addOrUpdateVisible = ref(false)

const addOrUpdate = ref()

const getWares = async () => {
  dataListLoading.value = true
  try {
    const response = await reqWareInfoList(1, 500, '')
    if (response && response.code === 200) {
      wareList.value = response.data.list
    }
  } catch (error) {
    console.error(error)
  }
}

const getDataList = async () => {
  dataListLoading.value = true
  try {
    const response = await reqWareSkuInfoList(
      pageIndex.value,
      pageSize.value,
      dataForm.value.skuId,
      dataForm.value.wareId,
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

// 删除
const deleteHandle = async (id?: number) => {
  const ids = id ? [id] : dataListSelections.value.map((item) => item.id)
  try {
    await ElMessageBox.confirm(
      `确定对[id=${ids.join(',')}]进行[${id ? '删除' : '批量删除'}]操作?`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      },
    )
    const response = await reqWareSkuDelete(ids)
    if (response && response.code === 200) {
      ElMessage({
        type: 'success',
        message: '库存删除成功',
        duration: 1500,
        onClose: () => {
          getDataList()
        },
      })
    } else {
      ElMessage.error(response.msg)
    }
  } catch (error) {
    ElMessage.info('已取消库存删除')
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

const route = useRoute()
const router = useRouter()
// 从商品管理「库存管理」跳转带入的 skuId（自动打开添加弹窗并预填）
const presetSkuId = ref(Number(route.query.skuId) || 0)
// 清除跳转带入的 skuId 路由参数（弹窗关闭后不再保留）
const clearSkuIdQuery = () => {
  if (route.query.skuId) {
    const query = { ...route.query }
    delete query.skuId
    router.replace({ query })
  }
}
// 添加/修改弹窗关闭后清除 skuId（含保存成功自动关闭、手动取消）
watch(addOrUpdateVisible, (v) => {
  if (!v) clearSkuIdQuery()
})

onMounted(() => {
  if (route.query.skuId) {
    dataForm.value.skuId = route.query.skuId as string
  }
  getWares()
  getDataList()
  // 商品管理「库存管理」跳转：自动打开添加弹窗并预填 skuId
  if (presetSkuId.value) {
    addOrUpdateVisible.value = true
    nextTick(() => {
      addOrUpdate.value?.init(0)
    })
  }
})
</script>

<style scoped lang="scss"></style>
