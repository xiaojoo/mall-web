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
        prop="couponId"
        header-align="center"
        align="center"
        label="优惠券id"
      ></el-table-column>
      <el-table-column
        prop="memberId"
        header-align="center"
        align="center"
        label="会员id"
      ></el-table-column>
      <el-table-column
        prop="memberNickName"
        header-align="center"
        align="center"
        label="会员名字"
      ></el-table-column>
      <el-table-column
        prop="getType"
        header-align="center"
        align="center"
        label="获取方式"
      >
        <template #default="scope">
          <el-tag type="primary" v-if="scope.row.getType == 0">后台赠送</el-tag>
          <el-tag type="success" v-else>主动领取</el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="createTime"
        header-align="center"
        align="center"
        label="创建时间"
      ></el-table-column>
      <el-table-column
        prop="useType"
        header-align="center"
        align="center"
        label="使用状态"
      >
        <template #default="scope">
          <el-tag type="primary" v-if="scope.row.useType == 0">未使用</el-tag>
          <el-tag type="success" v-if="scope.row.useType == 1">已使用</el-tag>
          <el-tag type="warning" v-if="scope.row.useType == 2">已过期</el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="useTime"
        header-align="center"
        align="center"
        label="使用时间"
      ></el-table-column>
      <el-table-column
        prop="orderId"
        header-align="center"
        align="center"
        label="订单id"
      ></el-table-column>
      <el-table-column
        prop="orderSn"
        header-align="center"
        align="center"
        label="订单号"
      ></el-table-column>
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
import { ref, onMounted } from 'vue'
//
import { reqCouponHistoryList } from '@/api/coupon/history'

const dataForm = ref({
  key: '',
})
const dataList = ref([])
const pageIndex = ref(1)
const pageSize = ref(10)
const totalPage = ref(0)
const dataListLoading = ref(false)
const dataListSelections = ref<any[]>([])

const getDataList = async () => {
  dataListLoading.value = true
  try {
    const response = await reqCouponHistoryList(
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
// const deleteHandle = async (id?: number) => {
//   const ids = id ? [id] : dataListSelections.value.map((item) => item.id)
//   try {
//     await ElMessageBox.confirm(
//       `确定对[id=${ids.join(',')}]进行[${id ? '删除' : '批量删除'}]操作?`,
//       '提示',
//       {
//         confirmButtonText: '确定',
//         cancelButtonText: '取消',
//         type: 'warning',
//       },
//     )
//     const response = await reqCouponHistoryDelete(ids)
//     if (response && response.code === 200) {
//       ElMessage({
//         type: 'success',
//         message: '优惠券发放历史删除成功',
//         duration: 1500,
//         onClose: () => {
//           getDataList()
//         },
//       })
//     } else {
//       ElMessage.error(response.msg)
//     }
//   } catch (error) {
//     ElMessage.info('已取消优惠券发放历史删除')
//   }
// }

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

onMounted(() => {
  getDataList()
})
</script>

<style scoped lang="scss"></style>
