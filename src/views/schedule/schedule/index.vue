<template>
  <div class="mod-schedule">
    <el-form
      :inline="true"
      :model="dataForm"
      @keyup.enter.native="getDataList()"
    >
      <el-form-item>
        <el-input
          v-model="dataForm.beanName"
          placeholder="bean名称"
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
          v-perms="'sys:schedule:delete'"
        >
          批量删除
        </el-button>
        <el-button
          type="danger"
          @click="pauseHandle()"
          :disabled="dataListSelections.length <= 0"
        >
          批量暂停
        </el-button>
        <el-button
          type="danger"
          @click="resumeHandle()"
          :disabled="dataListSelections.length <= 0"
        >
          批量恢复
        </el-button>
        <el-button
          type="danger"
          @click="runHandle()"
          :disabled="dataListSelections.length <= 0"
        >
          批量立即执行
        </el-button>
        <el-button type="success" @click="logHandle()">日志列表</el-button>
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
        prop="jobId"
        header-align="center"
        align="center"
        width="80"
        label="ID"
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
        prop="cronExpression"
        header-align="center"
        align="center"
        label="cron表达式"
      ></el-table-column>
      <el-table-column
        prop="remark"
        header-align="center"
        align="center"
        label="备注"
      ></el-table-column>
      <el-table-column
        prop="status"
        header-align="center"
        align="center"
        label="状态"
      >
        <template #default="scope">
          <el-tag v-if="scope.row.status === 0" size="small">正常</el-tag>
          <el-tag v-else size="small" type="danger">暂停</el-tag>
        </template>
      </el-table-column>
      <el-table-column
        fixed="right"
        header-align="center"
        align="center"
        width="340"
        label="操作"
      >
        <template #default="scope">
          <el-button
            size="small"
            @click="addOrUpdateHandle(scope.row.jobId)"
            v-perms="'sys:schedule:update'"
          >
            修改
          </el-button>
          <el-button
            size="small"
            @click="deleteHandle(scope.row.jobId)"
            v-perms="'sys:schedule:delete'"
          >
            删除
          </el-button>
          <el-button size="small" @click="pauseHandle(scope.row.jobId)">
            暂停
          </el-button>
          <el-button size="small" @click="resumeHandle(scope.row.jobId)">
            恢复
          </el-button>
          <el-button size="small" @click="runHandle(scope.row.jobId)">
            立即执行
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
    <Log v-model="logVisible" ref="log" />
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue'

import Add from './add.vue'
import Log from './log.vue'
import {
  reqScheduleDelete,
  reqScheduleList,
  reqSchedulePause,
  reqScheduleResume,
  reqScheduleRun,
} from '@/api/schedule'

const dataForm = ref({
  beanName: '',
})
const dataList = ref([])
const pageIndex = ref(1)
const pageSize = ref(10)
const totalPage = ref(0)
const dataListLoading = ref(false)
const dataListSelections = ref<any[]>([])
const addOrUpdateVisible = ref(false)
const logVisible = ref(false)

const addOrUpdate = ref()
const log = ref()

const getDataList = async () => {
  dataListLoading.value = true
  try {
    const response = await reqScheduleList(
      pageIndex.value,
      pageSize.value,
      dataForm.value.beanName,
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

// // 删除
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
//     const response = await reqScheduleDelete(ids)
//     if (response && response.code === 200) {
//       ElMessage({
//         type: 'success',
//         message: '任务调度删除成功',
//         duration: 1500,
//         onClose: () => {
//           getDataList()
//         },
//       })
//     } else {
//       ElMessage.error(response.msg)
//     }
//   } catch (error) {
//     ElMessage.info('已取消任务调度删除')
//   }
// }
//
// // 暂停
// const pauseHandle = async (id?: any) => {
//   const ids = id ? [id] : dataListSelections.value.map((item) => item.id)
//   try {
//     await ElMessageBox.confirm(
//       `确定对[id=${ids.join(',')}]进行[${id ? '暂停' : '批量暂停'}]操作?`,
//       '提示',
//       {
//         confirmButtonText: '确定',
//         cancelButtonText: '取消',
//         type: 'warning',
//       },
//     )
//     const response = await reqSchedulePause(ids)
//     if (response && response.code === 200) {
//       ElMessage({
//         type: 'success',
//         message: '任务调度暂停成功',
//         duration: 1500,
//         onClose: () => {
//           getDataList()
//         },
//       })
//     } else {
//       ElMessage.error(response.msg)
//     }
//   } catch (error) {
//     ElMessage.info('已取消任务调度暂停')
//   }
// }
//
// // 恢复
// const resumeHandle = async (id?: any) => {
//   const ids = id ? [id] : dataListSelections.value.map((item) => item.id)
//   try {
//     await ElMessageBox.confirm(
//       `确定对[id=${ids.join(',')}]进行[${id ? '恢复' : '批量恢复'}]操作?`,
//       '提示',
//       {
//         confirmButtonText: '确定',
//         cancelButtonText: '取消',
//         type: 'warning',
//       },
//     )
//     const response = await reqScheduleResume(ids)
//     if (response && response.code === 200) {
//       ElMessage({
//         type: 'success',
//         message: '任务调度恢复成功',
//         duration: 1500,
//         onClose: () => {
//           getDataList()
//         },
//       })
//     } else {
//       ElMessage.error(response.msg)
//     }
//   } catch (error) {
//     ElMessage.info('已取消任务调度恢复')
//   }
// }
//
// // 立即执行
// const runHandle = async (id?: any) => {
//   const ids = id ? [id] : dataListSelections.value.map((item) => item.id)
//   try {
//     await ElMessageBox.confirm(
//       `确定对[id=${ids.join(',')}]进行[${id ? '立即执行' : '批量立即执行'}]操作?`,
//       '提示',
//       {
//         confirmButtonText: '确定',
//         cancelButtonText: '取消',
//         type: 'warning',
//       },
//     )
//     const response = await reqScheduleRun(ids)
//     if (response && response.code === 200) {
//       ElMessage({
//         type: 'success',
//         message: '任务调度删除立即执行',
//         duration: 1500,
//         onClose: () => {
//           getDataList()
//         },
//       })
//     } else {
//       ElMessage.error(response.msg)
//     }
//   } catch (error) {
//     ElMessage.info('已取消任务调度立即执行')
//   }
// }

const confirmAndExecute = async (
  ids: number[],
  actionType: string,
  apiFunc: (ids: number[]) => Promise<any>,
  getDataList: () => void,
) => {
  try {
    const isSingle = ids.length === 1
    const actionText = isSingle ? actionType : `批量${actionType}`

    await ElMessageBox.confirm(
      `确定对[id=${ids.join(',')}]进行[${actionText}]操作?`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      },
    )

    const response = await apiFunc(ids)

    if (response?.code === 200) {
      ElMessage({
        type: 'success',
        message: `任务调度${actionType}成功`,
        duration: 1500,
        onClose: getDataList,
      })
    } else {
      ElMessage.error(response?.msg || '操作失败')
    }
  } catch (error) {
    ElMessage.info(`已取消任务调度${actionType}`)
  }
}

// 删除
const deleteHandle = async (id?: number) => {
  const ids = id ? [id] : dataListSelections.value.map((item) => item.id)
  await confirmAndExecute(ids, '删除', reqScheduleDelete, getDataList)
}

// 暂停
const pauseHandle = async (id?: number) => {
  const ids = id ? [id] : dataListSelections.value.map((item) => item.id)
  await confirmAndExecute(ids, '暂停', reqSchedulePause, getDataList)
}

// 恢复
const resumeHandle = async (id?: number) => {
  const ids = id ? [id] : dataListSelections.value.map((item) => item.id)
  await confirmAndExecute(ids, '恢复', reqScheduleResume, getDataList)
}

// 立即执行
const runHandle = async (id?: number) => {
  const ids = id ? [id] : dataListSelections.value.map((item) => item.id)
  await confirmAndExecute(ids, '立即执行', reqScheduleRun, getDataList)
}

// 日志列表
const logHandle = () => {
  logVisible.value = true
  nextTick(() => {
    log.value?.init()
  })
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
