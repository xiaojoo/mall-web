<template>
  <el-dialog
    title="日志列表"
    :model-value="visible"
    @update:model-value="updateVisible"
    :close-on-click-modal="false"
  >
    <el-form
      :inline="true"
      :model="dataForm"
      @keyup.enter.native="getDataList()"
    >
      <el-form-item>
        <el-input
          v-model="dataForm.id"
          placeholder="任务ID"
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
      height="460"
      style="width: 100%"
    >
      <el-table-column
        prop="logId"
        header-align="center"
        align="center"
        width="80"
        label="日志ID"
      ></el-table-column>
      <el-table-column
        prop="jobId"
        header-align="center"
        align="center"
        width="80"
        label="任务ID"
      ></el-table-column>
      <el-table-column
        prop="beanName"
        header-align="center"
        align="center"
        label="bean名称"
      ></el-table-column>
      <el-table-column
        prop="params"
        header-align="center"
        align="center"
        label="参数"
      ></el-table-column>
      <el-table-column
        prop="status"
        header-align="center"
        align="center"
        label="状态"
      >
        <template #default="scope">
          <el-tag v-if="scope.row.status === 0" size="small">成功</el-tag>
          <el-tag
            v-else
            @click.native="showErrorInfo(scope.row.logId)"
            size="small"
            type="danger"
            style="cursor: pointer"
          >
            失败
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="times"
        header-align="center"
        align="center"
        label="耗时(单位: 毫秒)"
      ></el-table-column>
      <el-table-column
        prop="createTime"
        header-align="center"
        align="center"
        width="180"
        label="执行时间"
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
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

import { reqScheduleLogInfo, reqScheduleLogList } from '@/api/schedule'

const dataForm = ref({
  id: '',
})
const dataList = ref([])
const pageIndex = ref(1)
const pageSize = ref(10)
const totalPage = ref(0)
const dataListLoading = ref(false)
const visible = ref(false)

defineProps(['logVisible'])

const emit = defineEmits(['update:logVisible'])

const updateVisible = (value: boolean) => {
  emit('update:logVisible', value)
}

const init = () => {
  getDataList()
}
const getDataList = async () => {
  dataListLoading.value = true
  try {
    const response = await reqScheduleLogList(
      pageIndex.value,
      pageSize.value,
      dataForm.value.id,
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

const showErrorInfo = async (id: any) => {
  dataListLoading.value = true
  try {
    const response = await reqScheduleLogInfo(id)
    if (response && response.code === 200) {
      await ElMessageBox.alert(response.data.error)
    } else {
      ElMessage.error(response.data.msg)
    }
  } catch (error) {
    console.error(error)
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

// 暴露方法
defineExpose({ init })

onMounted(() => {
  getDataList()
})
</script>

<style scoped lang="scss"></style>
