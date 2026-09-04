<template>
  <div class="mod-config">
    <el-form
      :inline="true"
      :model="dataForm"
      @keyup.enter.native="getDataList()"
    >
      <el-form-item label="状态">
        <el-select
          style="width: 120px"
          v-model="dataForm.status"
          placeholder="请选择状态"
          clearable
        >
          <el-option label="新建" :value="0"></el-option>
          <el-option label="已分配" :value="1"></el-option>
          <el-option label="已领取" :value="2"></el-option>
          <el-option label="已完成" :value="3"></el-option>
          <el-option label="有异常" :value="4"></el-option>
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
        <el-button
          type="danger"
          @click="deleteHandle()"
          :disabled="dataListSelections.length <= 0"
          v-perms="'ware:purchase:delete'"
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
        label="采购单id"
      ></el-table-column>
      <el-table-column
        prop="assigneeId"
        header-align="center"
        align="center"
        label="采购人id"
      ></el-table-column>
      <el-table-column
        prop="assigneeName"
        header-align="center"
        align="center"
        label="采购人名"
      ></el-table-column>
      <el-table-column
        prop="phone"
        header-align="center"
        align="center"
        label="联系方式"
      ></el-table-column>
      <el-table-column
        prop="priority"
        header-align="center"
        align="center"
        label="优先级"
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
          <el-tag type="warning" v-if="scope.row.status == 2">已领取</el-tag>
          <el-tag type="success" v-if="scope.row.status == 3">已完成</el-tag>
          <el-tag type="danger" v-if="scope.row.status == 4">有异常</el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="wareId"
        header-align="center"
        align="center"
        label="仓库id"
      ></el-table-column>
      <el-table-column
        prop="amount"
        header-align="center"
        align="center"
        label="总金额"
      ></el-table-column>
      <el-table-column
        prop="createTime"
        header-align="center"
        align="center"
        label="创建日期"
      ></el-table-column>
      <el-table-column
        prop="updateTime"
        header-align="center"
        align="center"
        label="更新日期"
      ></el-table-column>
      <el-table-column
        fixed="right"
        header-align="center"
        align="center"
        width="260"
        label="操作"
      >
        <template #default="scope">
          <el-button size="small" @click="openDetail(scope.row)">
            详情
          </el-button>
          <el-button
            size="small"
            v-if="scope.row.status == 0 || scope.row.status == 1"
            @click="opendrawer(scope.row)"
          >
            分配
          </el-button>
          <el-button
            size="small"
            @click="addOrUpdateHandle(scope.row.id)"
            v-perms="'ware:purchase:update'"
          >
            修改
          </el-button>
          <el-button
            size="small"
            @click="deleteHandle(scope.row.id)"
            v-perms="'ware:purchase:delete'"
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
    <el-dialog title="分配采购人员" v-model="caigoudialogVisible" width="30%">
      <el-select v-model="userId" filterable placeholder="请选择">
        <el-option
          v-for="item in userList"
          :key="item.userId"
          :label="item.username"
          :value="item.userId"
        ></el-option>
      </el-select>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="caigoudialogVisible = false">取消</el-button>
          <el-button type="primary" @click="assignUser()">确定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- ===== 采购单详情 ===== -->
    <el-dialog title="采购单详情" v-model="detailVisible" width="70%">
      <el-descriptions :column="3" border size="small">
        <el-descriptions-item label="采购单ID">
          {{ detailRow.id }}
        </el-descriptions-item>
        <el-descriptions-item label="采购人">
          {{ detailRow.assigneeName || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="联系方式">
          {{ detailRow.phone || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="优先级">
          {{ detailRow.priority ?? '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          {{ purchaseStatusText(detailRow.status) }}
        </el-descriptions-item>
        <el-descriptions-item label="总金额">
          {{ detailRow.amount != null ? '¥' + detailRow.amount : '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">
          {{ detailRow.createTime || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="更新时间">
          {{ detailRow.updateTime || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="仓库ID">
          {{ detailRow.wareId ?? '-' }}
        </el-descriptions-item>
      </el-descriptions>

      <el-table
        :data="detailItems"
        border
        stripe
        size="small"
        style="margin-top: 16px"
        v-loading="detailLoading"
      >
        <el-table-column prop="id" label="采购项ID" width="90" />
        <el-table-column prop="skuId" label="SKU ID" width="100" />
        <el-table-column prop="skuNum" label="数量" width="80" align="center" />
        <el-table-column
          prop="skuPrice"
          label="单价"
          width="100"
          align="center"
        />
        <el-table-column
          prop="wareId"
          label="仓库ID"
          width="90"
          align="center"
        />
        <el-table-column label="状态" width="110" align="center">
          <template #default="scope">
            <el-tag :type="detailStatusType(scope.row.status)">
              {{ detailStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="purchaseId"
          label="所属采购单"
          width="100"
          align="center"
        />
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue'

import Add from './add.vue'
import { reqWarePurchasedetailInfoList } from '@/api/ware/purchaseitem'
import {
  reqPurchaseList,
  reqSysUserList,
  reqWarePurchaseDelete,
  reqWarePurchaseUpdate,
} from '@/api/ware/purchase'

const dataForm = ref({
  key: '',
  status: '',
})

const dataList = ref([])
const pageIndex = ref(1)
const pageSize = ref(10)
const totalPage = ref(0)
const dataListLoading = ref(false)
const dataListSelections = ref<any[]>([])
const addOrUpdateVisible = ref(false)
const caigoudialogVisible = ref(false)
const userId = ref('')
const currentRow = ref()
const userList = ref([
  {
    userId: 0,
    username: '',
  },
])

const addOrUpdate = ref()

// ===== 采购单详情 =====
const detailVisible = ref(false)
const detailLoading = ref(false)
const detailRow = ref<any>({})
const detailItems = ref<any[]>([])

const purchaseStatusText = (s: any) =>
  ({ 0: '新建', 1: '已分配', 2: '已领取', 3: '已完成', 4: '有异常' })[s] ?? '-'
const detailStatusText = (s: any) =>
  ({ 0: '新建', 1: '已分配', 2: '正在采购', 3: '已完成', 4: '采购失败' })[s] ??
  '-'
const detailStatusType = (s: any) =>
  ({ 0: 'info', 1: 'primary', 2: 'warning', 3: 'success', 4: 'danger' })[s] ??
  'info'

const openDetail = async (row: any) => {
  detailRow.value = row
  detailVisible.value = true
  detailLoading.value = true
  try {
    const response = await reqWarePurchasedetailInfoList(1, 100, row.id, '', '')
    detailItems.value =
      response && response.code === 200 ? response.data.list || [] : []
  } catch {
    detailItems.value = []
  } finally {
    detailLoading.value = false
  }
}

const opendrawer = (row: any) => {
  getUserList()
  currentRow.value = row
  caigoudialogVisible.value = true
}

const assignUser = async () => {
  let user = { userId: '', username: '', mobile: '' }
  userList.value.forEach((item: any) => {
    if (item.userId === userId.value) {
      user = item
    }
  })
  caigoudialogVisible.value = false
  try {
    const response = await reqWarePurchaseUpdate({
      id: currentRow.value.id,
      assigneeId: user.userId,
      assigneeName: user.username,
      phone: user.mobile,
      status: 1,
    })
    if (response && response.code === 200) {
      ElMessage({
        message: '操作成功',
        type: 'success',
        duration: 1500,
      })
      userId.value = ''
      await getDataList()
    } else {
      ElMessage.error(response.msg)
    }
  } catch (error) {
    console.error(error)
  }
}

const getUserList = async () => {
  try {
    const response = await reqSysUserList(pageIndex.value, pageSize.value)
    // /sys/user/list 返回 code=0 + page.list（管理端特有结构），兼容两种
    const list = response?.page?.list || response?.data?.list || []
    userList.value = Array.isArray(list) ? list : []
  } catch (error) {
    console.error(error)
  }
}

const getDataList = async () => {
  dataListLoading.value = true
  try {
    const response = await reqPurchaseList(
      pageIndex.value,
      pageSize.value,
      dataForm.value.status,
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
    const response = await reqWarePurchaseDelete(ids)
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
  getDataList()
})
</script>

<style scoped lang="scss"></style>
