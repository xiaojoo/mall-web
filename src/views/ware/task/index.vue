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
          v-perms="'ware:task:delete'"
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
        prop="orderId"
        header-align="center"
        align="center"
        label="订单号"
      ></el-table-column>
      <el-table-column
        prop="orderSn"
        header-align="center"
        align="center"
        label="订单号（对外）"
      ></el-table-column>
      <el-table-column
        prop="consignee"
        header-align="center"
        align="center"
        label="收货人"
      ></el-table-column>
      <el-table-column
        prop="consigneeTel"
        header-align="center"
        align="center"
        label="收货人电话"
      ></el-table-column>
      <el-table-column
        prop="deliveryAddress"
        header-align="center"
        align="center"
        label="配送地址"
      ></el-table-column>
      <el-table-column
        prop="orderComment"
        header-align="center"
        align="center"
        label="订单备注"
      ></el-table-column>
      <el-table-column
        prop="paymentWay"
        header-align="center"
        align="center"
        label="付款方式"
      >
        <template #default="scope">
          <div class="flex gap-2">
            <el-tag type="primary" v-if="scope.row.paymentWay == 1">
              在线付款
            </el-tag>
            <el-tag type="success" v-if="scope.row.paymentWay == 2">
              货到付款
            </el-tag>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        prop="taskStatus"
        header-align="center"
        align="center"
        label="任务状态"
      ></el-table-column>
      <el-table-column
        prop="orderBody"
        header-align="center"
        align="center"
        label="订单描述"
      ></el-table-column>
      <el-table-column
        prop="trackingNo"
        header-align="center"
        align="center"
        label="物流单号"
      ></el-table-column>
      <el-table-column
        prop="createTime"
        header-align="center"
        align="center"
        label="创建时间"
      ></el-table-column>
      <el-table-column
        prop="wareId"
        header-align="center"
        align="center"
        label="仓库id"
      ></el-table-column>
      <el-table-column
        prop="taskComment"
        header-align="center"
        align="center"
        label="工作单备注"
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
            v-perms="'ware:task:update'"
          >
            修改
          </el-button>
          <el-button
            size="small"
            @click="deleteHandle(scope.row.id)"
            v-perms="'ware:task:delete'"
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
      @refreshDataList="getDataList"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue'

import Add from './add.vue'
import { reqWareTaskDelete, reqWareTaskInfoList } from '@/api/ware/task'

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

const getDataList = async () => {
  dataListLoading.value = true
  try {
    const response = await reqWareTaskInfoList(
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
    const response = await reqWareTaskDelete(ids)
    if (response && response.code === 200) {
      ElMessage({
        type: 'success',
        message: '仓库删除成功',
        duration: 1500,
        onClose: () => {
          getDataList()
        },
      })
    } else {
      ElMessage.error(response.msg)
    }
  } catch (error) {
    ElMessage.info('已取消仓库删除')
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
})
</script>

<style scoped lang="scss"></style>
