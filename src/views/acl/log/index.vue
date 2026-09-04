<template>
  <div class="mod-log">
    <el-form
      :inline="true"
      :model="dataForm"
      @keyup.enter.native="getDataList()"
    >
      <el-form-item>
        <el-input
          v-model="dataForm.username"
          placeholder="操作用户名"
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
      style="width: 100%"
    >
      <el-table-column
        prop="id"
        header-align="center"
        align="center"
        width="80"
        label="ID"
      ></el-table-column>
      <el-table-column
        prop="username"
        header-align="center"
        align="center"
        label="操作用户"
      ></el-table-column>
      <el-table-column
        prop="operation"
        header-align="center"
        align="center"
        label="操作"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column
        prop="method"
        header-align="center"
        align="center"
        label="请求方法"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column
        prop="ip"
        header-align="center"
        align="center"
        width="140"
        label="IP地址"
      ></el-table-column>
      <el-table-column
        prop="status"
        header-align="center"
        align="center"
        width="80"
        label="状态"
      >
        <template #default="scope">
          <el-tag v-if="scope.row.status === 1" size="small" type="success">
            成功
          </el-tag>
          <el-tag v-else size="small" type="danger">失败</el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="createTime"
        header-align="center"
        align="center"
        width="180"
        label="操作时间"
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
import { request } from '@/utils/request'

const dataForm = ref({ username: '' })
const dataList = ref([])
const pageIndex = ref(1)
const pageSize = ref(10)
const totalPage = ref(0)
const dataListLoading = ref(false)

const getDataList = async () => {
  dataListLoading.value = true
  try {
    const response: any = await request.get('/sys/log/list', {
      params: {
        page: pageIndex.value,
        limit: pageSize.value,
        username: dataForm.value.username,
      },
    })
    if (response && response.code === 0) {
      dataList.value = response.page?.list || []
      totalPage.value = response.page?.totalCount || 0
    } else {
      dataList.value = []
      totalPage.value = 0
    }
  } catch (error) {
    console.error(error)
  } finally {
    dataListLoading.value = false
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

<style scoped lang="scss"></style>
