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
          v-perms="'coupon:seckillsession:delete'"
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
        prop="name"
        header-align="center"
        align="center"
        label="场次名称"
      ></el-table-column>
      <el-table-column
        prop="startTime"
        header-align="center"
        align="center"
        label="每日开始时间"
      ></el-table-column>
      <el-table-column
        prop="endTime"
        header-align="center"
        align="center"
        label="每日结束时间"
      ></el-table-column>
      <el-table-column
        prop="status"
        header-align="center"
        align="center"
        label="启用状态"
      ></el-table-column>
      <el-table-column
        prop="createTime"
        header-align="center"
        align="center"
        label="创建时间"
      ></el-table-column>
      <el-table-column
        fixed="right"
        header-align="center"
        align="center"
        width="230"
        label="操作"
      >
        <template #default="scope">
          <el-button size="small" @click="relationProduct(scope.row)">
            关联商品
          </el-button>
          <el-button
            size="small"
            @click="addOrUpdateHandle(scope.row.id)"
            v-perms="'coupon:seckillsession:update'"
          >
            修改
          </el-button>
          <el-button
            size="small"
            @click="deleteHandle(scope.row.id)"
            v-perms="'coupon:seckillsession:delete'"
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
import { useRouter } from 'vue-router'

import Add from './add.vue'
import {
  reqSeckillSessionDelete,
  reqSeckillSessionList,
} from '@/api/coupon/seckillsession'

const router = useRouter()

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

// 关联商品：跳转独立页面（添加与关联合并，新页面表单里可直接选每日秒杀场次）
const relationProduct = (row: any) => {
  router.push({
    path: '/seckillskurelation',
    query: {
      sessionId: String(row.id),
      sessionName: String(row.name || ''),
    },
  })
}

const getDataList = async () => {
  dataListLoading.value = true
  try {
    const response = await reqSeckillSessionList(
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
    const response = await reqSeckillSessionDelete(ids)
    if (response && response.code === 200) {
      ElMessage({
        type: 'success',
        message: '每日秒杀删除成功',
        duration: 1500,
        onClose: () => {
          getDataList()
        },
      })
    } else {
      ElMessage.error(response.message || response.msg)
    }
  } catch (error) {
    ElMessage.info('已取消每日秒杀删除')
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
