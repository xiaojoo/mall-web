<template>
  <div class="mod-config">
    <el-form
      :inline="true"
      :model="dataForm"
      @keyup.enter.native="getDataList()"
    >
      <el-form-item label="状态">
        <el-select
          v-model="dataForm.status"
          placeholder="全部"
          clearable
          style="width: 140px"
        >
          <el-option label="待处理" :value="0"></el-option>
          <el-option label="退货中" :value="1"></el-option>
          <el-option label="已完成" :value="2"></el-option>
          <el-option label="已拒绝" :value="3"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button @click="getDataList()">查询</el-button>
      </el-form-item>
    </el-form>
    <el-table
      :data="dataList"
      border
      v-loading="dataListLoading"
      style="width: 100%"
    >
      <el-table-column
        prop="id"
        header-align="center"
        align="center"
        label="id"
        width="80"
      ></el-table-column>
      <el-table-column
        prop="orderSn"
        header-align="center"
        align="center"
        label="订单号"
        width="200"
      ></el-table-column>
      <el-table-column
        prop="memberUsername"
        header-align="center"
        align="center"
        label="会员"
        width="120"
      ></el-table-column>
      <el-table-column
        prop="returnAmount"
        header-align="center"
        align="center"
        label="退款金额"
        width="110"
      >
        <template #default="scope">
          ¥{{ Number(scope.row.returnAmount || 0).toFixed(2) }}
        </template>
      </el-table-column>
      <el-table-column
        prop="reason"
        header-align="center"
        align="center"
        label="退款原因"
        min-width="140"
      ></el-table-column>
      <el-table-column
        prop="status"
        header-align="center"
        align="center"
        label="状态"
        width="100"
      >
        <template #default="scope">
          <el-tag v-if="scope.row.status == 0" type="warning">待处理</el-tag>
          <el-tag v-else-if="scope.row.status == 1" type="primary">
            退货中
          </el-tag>
          <el-tag v-else-if="scope.row.status == 2" type="success">
            已完成
          </el-tag>
          <el-tag v-else-if="scope.row.status == 3" type="info">已拒绝</el-tag>
          <el-tag v-else type="info">未知</el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="createTime"
        header-align="center"
        align="center"
        label="申请时间"
        width="170"
      ></el-table-column>
      <el-table-column
        prop="handleTime"
        header-align="center"
        align="center"
        label="处理时间"
        width="170"
      ></el-table-column>
      <el-table-column
        fixed="right"
        header-align="center"
        align="center"
        width="130"
        label="操作"
      >
        <template #default="scope">
          <el-button
            size="small"
            type="danger"
            @click="approveHandle(scope.row)"
            :disabled="scope.row.status != 0 && scope.row.status != 1"
            v-perms="'order:orderreturnapply:approve'"
          >
            审核通过
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
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import {
  reqReturnApplyApprove,
  reqReturnApplyList,
} from '@/api/order/orderreturnapply'

const dataForm = ref({
  status: '' as number | '',
})

const dataList = ref([])
const pageIndex = ref(1)
const pageSize = ref(10)
const totalPage = ref(0)
const dataListLoading = ref(false)

const getDataList = async () => {
  dataListLoading.value = true
  try {
    const response = await reqReturnApplyList(
      pageIndex.value,
      pageSize.value,
      dataForm.value.status === '' ? '' : String(dataForm.value.status),
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
    dataListLoading.value = false
  }
}

// 审核通过：确认后调后端发起支付宝退款
const approveHandle = async (row: any) => {
  try {
    await ElMessageBox.confirm(
      `确定审核通过订单[${row.orderSn}]的售后申请？\n将立即向买家发起支付宝退款 ¥${Number(
        row.returnAmount || 0,
      ).toFixed(2)}，且不可撤销。`,
      '审核通过',
      {
        confirmButtonText: '确定退款',
        cancelButtonText: '取消',
        type: 'warning',
      },
    )
  } catch {
    ElMessage.info('已取消审核')
    return
  }
  try {
    const response = await reqReturnApplyApprove(row.id)
    if (response && response.code === 200) {
      ElMessage({
        type: 'success',
        message: '审核通过，退款已发起',
        duration: 1500,
        onClose: () => {
          getDataList()
        },
      })
    } else {
      ElMessage.error(response.msg || '退款失败')
      getDataList()
    }
  } catch (error) {
    console.error(error)
    ElMessage.error('退款调用失败，请稍后重试')
  }
}

const sizeChangeHandle = (val: number) => {
  pageSize.value = val
  pageIndex.value = 1
  getDataList()
}
const currentChangeHandle = (val: number) => {
  pageIndex.value = val
  getDataList()
}

onMounted(() => {
  getDataList()
})
</script>
