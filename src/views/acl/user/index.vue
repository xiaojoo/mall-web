<template>
  <div class="mod-user">
    <el-form
      :inline="true"
      :model="dataForm"
      @keyup.enter.native="getDataList()"
    >
      <el-form-item>
        <el-input
          v-model="dataForm.userName"
          placeholder="用户名"
          clearable
        ></el-input>
      </el-form-item>
      <el-form-item>
        <el-button @click="getDataList()">查询</el-button>
        <el-button
          type="primary"
          @click="addOrUpdateHandle()"
          v-perms="'sys:user:save'"
        >
          新增
        </el-button>
        <el-button
          type="danger"
          @click="deleteHandle()"
          :disabled="dataListSelections.length <= 0"
          v-perms="'sys:user:delete'"
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
        prop="userId"
        header-align="center"
        align="center"
        width="200"
        label="ID"
      ></el-table-column>
      <el-table-column
        prop="username"
        header-align="center"
        align="center"
        label="用户名"
      ></el-table-column>
      <el-table-column
        prop="email"
        header-align="center"
        align="center"
        label="邮箱"
      ></el-table-column>
      <el-table-column
        prop="mobile"
        header-align="center"
        align="center"
        label="手机号"
      ></el-table-column>
      <el-table-column
        prop="status"
        header-align="center"
        align="center"
        label="状态"
      >
        <template #default="scope">
          <el-tag v-if="scope.row.status === 0" size="small" type="danger">
            禁用
          </el-tag>
          <el-tag v-else size="small">正常</el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="createTime"
        header-align="center"
        align="center"
        width="180"
        label="创建时间"
      ></el-table-column>
      <el-table-column
        fixed="right"
        header-align="center"
        align="center"
        width="250"
        label="操作"
      >
        <template #default="scope">
          <el-button
            size="small"
            @click="addOrUpdateHandle(scope.row.userId)"
            v-perms="'sys:user:update'"
          >
            修改
          </el-button>
          <el-button
            size="small"
            type="warning"
            @click="kickHandle(scope.row.userId)"
            v-perms="'sys:user:update'"
          >
            踢下线
          </el-button>
          <el-button
            size="small"
            @click="deleteHandle(scope.row.userId)"
            v-perms="'sys:user:delete'"
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
    ></Add>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue'

import Add from './add.vue'
import { reqUserDelete, reqUserList, reqUserKick } from '@/api/acl'

const dataForm = ref({
  userName: '',
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
    const response = await reqUserList(
      pageIndex.value,
      pageSize.value,
      dataForm.value.userName,
    )
    if (response && response.code === 0) {
      dataList.value = response.page.list
      totalPage.value = response.page.totalCount
    } else {
      dataList.value = []
      totalPage.value = 0
    }
    dataListLoading.value = false
  } catch (error) {
    console.error(error)
  }
}

// 踢下线：吊销该用户全部登录态（access 立即失效 + refresh 作废，需重新登录）
const kickHandle = async (userId: number) => {
  try {
    await ElMessageBox.confirm(
      `确定将[id=${userId}]用户踢下线？该用户所有登录态将立即失效。`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      },
    )
    const response = await reqUserKick(userId)
    if (response && response.code === 0) {
      ElMessage({
        type: 'success',
        message: '已踢下线',
        duration: 1500,
      })
    } else {
      ElMessage.error(response.message || response.msg || '操作失败')
    }
  } catch (error) {
    ElMessage.info('已取消操作')
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
    const response = await reqUserDelete(ids)
    if (response && response.code === 0) {
      ElMessage({
        type: 'success',
        message: '用户删除成功',
        duration: 1500,
        onClose: () => {
          getDataList()
        },
      })
    } else {
      ElMessage.error(response.message || response.msg || '操作失败')
    }
  } catch (error) {
    ElMessage.info('已取消用户删除')
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
