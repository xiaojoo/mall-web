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
          v-perms="'coupon:bounds:delete'"
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
        prop="spuId"
        header-align="center"
        align="center"
        label="spuId"
      ></el-table-column>
      <el-table-column
        prop="growBounds"
        header-align="center"
        align="center"
        label="成长积分"
      ></el-table-column>
      <el-table-column
        prop="buyBounds"
        header-align="center"
        align="center"
        label="购物积分"
      ></el-table-column>
      <el-table-column
        prop="work"
        header-align="center"
        align="center"
        label="优惠生效情况"
      >
        <!-- [1111（四个状态位，从右到左）;0 - 无优惠，成长积分是否赠送;1 - 无优惠，购物积分是否赠送;2 - 有优惠，成长积分是否赠送;3 - 有优惠，购物积分是否赠送【状态位0：不赠送，1：赠送】] -->
      </el-table-column>
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
            v-perms="'coupon:bounds:update'"
          >
            修改
          </el-button>
          <el-button
            size="small"
            @click="deleteHandle(scope.row.id)"
            v-perms="'coupon:bounds:delete'"
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
      :spu-id="spuId"
      v-model="addOrUpdateVisible"
      ref="addOrUpdate"
      @refreshDataList="getDataList"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import Add from './add.vue'
import { reqSpuBoundsDelete, reqSpuBoundsList } from '@/api/coupon/bounds'

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
// 从商品管理「积分维护」跳转带入的 spuId（自动打开添加弹窗并预填）
const spuId = ref(Number(route.query.spuId) || 0)
// 清除跳转带入的 spuId 路由参数（弹窗关闭后不再保留）
const clearSpuIdQuery = () => {
  if (route.query.spuId) {
    const query = { ...route.query }
    delete query.spuId
    router.replace({ query })
  }
}
// 添加/修改弹窗关闭后清除 spuId（含保存成功自动关闭、手动取消）
watch(addOrUpdateVisible, (v) => {
  if (!v) clearSpuIdQuery()
})

const getDataList = async () => {
  dataListLoading.value = true
  try {
    const response = await reqSpuBoundsList(
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
    const response = await reqSpuBoundsDelete(ids)
    if (response && response.code === 200) {
      ElMessage({
        type: 'success',
        message: '积分删除成功',
        duration: 1500,
        onClose: () => {
          getDataList()
        },
      })
    } else {
      ElMessage.error(response.msg)
    }
  } catch (error) {
    ElMessage.info('已取消积分删除')
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
  // 商品管理「积分维护」跳转：自动打开添加弹窗并预填 spuId
  if (spuId.value) {
    addOrUpdateVisible.value = true
    nextTick(() => {
      addOrUpdate.value?.init()
    })
  }
})
</script>

<style scoped lang="scss"></style>
