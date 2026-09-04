<template>
  <div class="mod-config">
    <el-form
      :inline="true"
      :model="dataForm"
      @keyup.enter.native="getDataList()"
    >
      <el-form-item label="仓库">
        <el-select
          style="width: 120px"
          v-model="dataForm.wareId"
          placeholder="请选择仓库"
          clearable
        >
          <el-option
            v-for="w in wareList"
            :label="w.name"
            :value="w.id"
            :key="w.id"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="状态">
        <el-select
          style="width: 120px"
          v-model="dataForm.status"
          placeholder="请选择状态"
          clearable
        >
          <el-option label="新建" :value="0"></el-option>
          <el-option label="已分配" :value="1"></el-option>
          <el-option label="正在采购" :value="2"></el-option>
          <el-option label="已完成" :value="3"></el-option>
          <el-option label="采购失败" :value="4"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="关键字">
        <el-input
          style="width: 120px"
          v-model="dataForm.key"
          placeholder="参数名"
          clearable
        ></el-input>
      </el-form-item>
      <el-form-item>
        <el-button @click="getDataList()">查询</el-button>
        <el-button type="primary" @click="addOrUpdateHandle()">新增</el-button>
        <el-dropdown
          @command="handleBatchCommand"
          :disabled="dataListSelections.length <= 0"
          style="margin-left: 10px"
        >
          <span class="el-dropdown-link">
            <el-button type="danger">
              批量操作
              <el-icon class="el-icon--right">
                <arrow-down />
              </el-icon>
            </el-button>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="delete">批量删除</el-dropdown-item>
              <el-dropdown-item command="merge">合并整单</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
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
        prop="purchaseId"
        header-align="center"
        align="center"
        label="采购单id"
      ></el-table-column>
      <el-table-column
        prop="skuId"
        header-align="center"
        align="center"
        label="采购商品id"
      ></el-table-column>
      <el-table-column
        prop="skuNum"
        header-align="center"
        align="center"
        label="采购数量"
      ></el-table-column>
      <el-table-column
        prop="skuPrice"
        header-align="center"
        align="center"
        label="采购金额"
      ></el-table-column>
      <el-table-column
        prop="wareId"
        header-align="center"
        align="center"
        label="仓库id"
      ></el-table-column>
      <el-table-column
        prop="status"
        header-align="center"
        align="center"
        label="状态"
      >
        <template #default="scope">
          <el-tag v-if="scope.row.status == 0">新建</el-tag>
          <el-tag type="info" v-if="scope.row.status == 1">已分配</el-tag>
          <el-tag type="warning" v-if="scope.row.status == 2">正在采购</el-tag>
          <el-tag type="success" v-if="scope.row.status == 3">已完成</el-tag>
          <el-tag type="danger" v-if="scope.row.status == 4">采购失败</el-tag>
        </template>
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
            v-perms="'ware:purchaseitem:update'"
          >
            修改
          </el-button>
          <el-button
            size="small"
            @click="deleteHandle(scope.row.id)"
            v-perms="'ware:purchaseitem:delete'"
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
    <el-dialog title="合并到整单" v-model="mergedialogVisible">
      <el-select v-model="purchaseId" placeholder="请选择" clearable filterable>
        <el-option
          v-for="item in purchasetableData"
          :key="item.id"
          :label="item.id"
          :value="item.id"
        >
          <span style="float: left">{{ item.id }}</span>
          <span style="float: right; color: #8492a6; font-size: 13px">
            {{ item.assigneeName }}：{{ item.phone }}
          </span>
        </el-option>
      </el-select>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="mergedialogVisible = false">取消</el-button>
          <el-button type="primary" @click="mergeItem()">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue'

import Add from './add.vue'
import { reqWareInfoList } from '@/api/ware/wareinfo'
import {
  reqWarePurchasedetailDelete,
  reqWarePurchasedetailInfoList,
  reqWarePurchasedetailMerge,
  reqWarePurchasedetailUnreceive,
} from '@/api/ware/purchaseitem'
import type { Action } from 'element-plus'
import { ArrowDown } from '@element-plus/icons-vue'

const dataForm = ref({
  key: '',
  status: '',
  wareId: '',
})
const dataList = ref([])
const wareList = ref([
  {
    id: 0,
    name: '',
  },
])
const pageIndex = ref(1)
const pageSize = ref(10)
const totalPage = ref(0)
const dataListLoading = ref(false)
const dataListSelections = ref<any[]>([])
const addOrUpdateVisible = ref(false)
const mergedialogVisible = ref(false)
const purchaseId = ref('')
const purchasetableData = ref([
  {
    id: 0,
    phone: '',
    assigneeName: '',
  },
])

const addOrUpdate = ref()

// 合并采购单
const mergeItem = async () => {
  const items = dataListSelections.value.map((item) => item.id)
  if (!purchaseId.value) {
    try {
      await ElMessageBox.confirm(
        `没有选择任何【采购单】，将自动创建新单进行合并。确认吗？`,
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        },
      )
      const response = await reqWarePurchasedetailMerge({ items: items })
      if (response && response.code === 200) {
        ElMessage({
          type: 'success',
          message: '采购单合并成功',
          duration: 1500,
          onClose: () => {
            getDataList()
          },
        })
      } else {
        ElMessage.error(response.msg)
      }
    } catch (error) {
      ElMessage.info('已取消库采购单合并')
    }
  } else {
    try {
      const response = await reqWarePurchasedetailMerge({
        purchaseId: purchaseId.value,
        items: items,
      })
      if (response && response.code === 200) {
        ElMessage({
          type: 'success',
          message: '采购单合并成功',
          duration: 1500,
          onClose: () => {
            getDataList()
          },
        })
      } else {
        ElMessage.error(response.msg)
      }
    } catch (error) {
      ElMessage.info('已取消库采购单合并')
    }
  }
  mergedialogVisible.value = false
}

const handleBatchCommand = (cmd: string) => {
  if (cmd === 'delete') {
    deleteHandle()
  }
  if (cmd === 'merge') {
    if (dataListSelections.value.length !== 0) {
      getUnreceivedPurchase()
      mergedialogVisible.value = true
    } else {
      ElMessageBox.alert('请先选择需要合并的需求', '提示', {
        confirmButtonText: '确定',
        callback: (action: Action) => {
          ElMessage({
            type: 'info',
            message: `action: ${action}`,
          })
        },
      })
    }
  }
}

const getUnreceivedPurchase = async () => {
  try {
    const response = await reqWarePurchasedetailUnreceive()
    if (response && response.code === 200) {
      purchasetableData.value = response.data.list
    }
  } catch (error) {
    console.error(error)
  }
}

const getWares = async () => {
  dataListLoading.value = true
  try {
    const response = await reqWareInfoList(pageIndex.value, pageSize.value, '')
    if (response && response.code === 200) {
      wareList.value = response.data.list
    }
  } catch (error) {
    console.error(error)
  }
}

const getDataList = async () => {
  dataListLoading.value = true
  try {
    const response = await reqWarePurchasedetailInfoList(
      pageIndex.value,
      pageSize.value,
      dataForm.value.key,
      dataForm.value.status,
      dataForm.value.wareId,
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
    const response = await reqWarePurchasedetailDelete(ids)
    if (response && response.code === 200) {
      ElMessage({
        type: 'success',
        message: '库存删除成功',
        duration: 1500,
        onClose: () => {
          getDataList()
        },
      })
    } else {
      ElMessage.error(response.msg)
    }
  } catch (error) {
    ElMessage.info('已取消库存删除')
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
  getWares()
  getDataList()
})
</script>

<style scoped lang="scss"></style>
