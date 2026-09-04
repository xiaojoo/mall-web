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
          placeholder="参数名"
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
          v-perms="'coupon:skuladder:delete'"
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
        label="spu_id"
      ></el-table-column>
      <el-table-column
        prop="fullCount"
        header-align="center"
        align="center"
        label="满几件"
      ></el-table-column>
      <el-table-column
        prop="discount"
        header-align="center"
        align="center"
        label="打几折"
      ></el-table-column>
      <el-table-column
        prop="price"
        header-align="center"
        align="center"
        label="折后价"
      ></el-table-column>
      <el-table-column
        prop="addOther"
        header-align="center"
        align="center"
        label="是否叠加优惠"
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
            v-perms="'coupon:skuladder:update'"
          >
            修改
          </el-button>
          <el-button
            size="small"
            @click="deleteHandle(scope.row.id)"
            v-perms="'coupon:skuladder:delete'"
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

import Add from './add.vue'
import { reqSkuLadderDelete, reqSkuLadderList } from '@/api/coupon/skuladder'

const dataForm = ref({
  key: '',
})
const dataList = ref([])
const pageIndex = ref(1)
const pageSize = ref(10)
const totalPage = ref(0)
const dataListLoading = ref(false)
const dataListSelections = ref<any[]>([])
const addOrUpdateVisible = ref(false)

const addOrUpdate = ref()
const route = useRoute()
const router = useRouter()
// 清除跳转带入的 skuId 路由参数（弹窗关闭/删除后不再保留）
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
// 从商品管理「折扣设置」跳转带入的 skuId（自动打开添加弹窗并预填）
const skuId = ref(Number(route.query.skuId) || 0)

const getDataList = async () => {
  dataListLoading.value = true
  try {
    const response = await reqSkuLadderList(
      pageIndex.value,
      pageSize.value,
      dataForm.value.key,
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
    const response = await reqSkuLadderDelete(ids)
    if (response && response.code === 200) {
      clearSkuIdQuery()
      ElMessage({
        type: 'success',
        message: '打折优惠删除成功',
        duration: 1500,
        onClose: () => {
          getDataList()
        },
      })
    } else {
      ElMessage.error(response.msg)
    }
  } catch (error) {
    ElMessage.info('已取消打折优惠删除')
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
  getDataList()
  // 商品管理「折扣设置」跳转：自动打开添加弹窗并预填 skuId
  if (skuId.value) {
    addOrUpdateVisible.value = true
    nextTick(() => {
      addOrUpdate.value?.init()
    })
  }
})
</script>

<style scoped lang="scss"></style>
