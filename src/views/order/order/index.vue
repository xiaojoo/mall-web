<template>
  <div class="mod-config">
    <el-form
      :inline="true"
      :model="dataForm"
      @keyup.enter.native="getDataList()"
    >
      <el-form-item label="订单号/会员">
        <el-input
          v-model="dataForm.key"
          placeholder="订单号 / 会员名"
          clearable
          style="width: 200px"
        ></el-input>
      </el-form-item>
      <el-form-item label="状态">
        <el-select
          v-model="dataForm.status"
          placeholder="全部"
          clearable
          style="width: 130px"
        >
          <el-option label="待付款" :value="0"></el-option>
          <el-option label="待发货" :value="1"></el-option>
          <el-option label="已发货" :value="2"></el-option>
          <el-option label="已完成" :value="3"></el-option>
          <el-option label="已关闭" :value="4"></el-option>
          <el-option label="无效订单" :value="5"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="getDataList()">查询</el-button>
        <el-button @click="resetHandle()">重置</el-button>
        <el-button
          type="danger"
          @click="deleteHandle()"
          :disabled="dataListSelections.length <= 0"
          v-perms="'order:order:delete'"
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
        width="80"
      ></el-table-column>
      <el-table-column
        prop="orderSn"
        header-align="center"
        align="center"
        label="订单号"
        width="210"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column
        prop="memberUsername"
        header-align="center"
        align="center"
        label="会员"
        width="110"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column
        header-align="center"
        align="center"
        label="应付金额"
        width="110"
      >
        <template #default="scope">
          ¥{{
            Number(scope.row.payAmount ?? scope.row.totalAmount ?? 0).toFixed(2)
          }}
        </template>
      </el-table-column>
      <el-table-column
        header-align="center"
        align="center"
        label="支付方式"
        width="100"
      >
        <template #default="scope">
          <el-tag v-if="scope.row.payType == 1" type="success">支付宝</el-tag>
          <el-tag v-else-if="scope.row.payType == 2" type="success">
            微信
          </el-tag>
          <el-tag v-else-if="scope.row.payType == 3" type="info">银联</el-tag>
          <el-tag v-else-if="scope.row.payType == 4" type="warning">
            货到付款
          </el-tag>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column
        header-align="center"
        align="center"
        label="来源"
        width="80"
      >
        <template #default="scope">
          <span v-if="scope.row.sourceType == 0">PC</span>
          <span v-else-if="scope.row.sourceType == 1">App</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="status"
        header-align="center"
        align="center"
        label="状态"
        width="100"
      >
        <template #default="scope">
          <el-tag v-if="scope.row.status == 0" type="warning">待付款</el-tag>
          <el-tag v-else-if="scope.row.status == 1" type="primary">
            待发货
          </el-tag>
          <el-tag v-else-if="scope.row.status == 2" type="success">
            已发货
          </el-tag>
          <el-tag v-else-if="scope.row.status == 3" type="success">
            已完成
          </el-tag>
          <el-tag v-else-if="scope.row.status == 4" type="info">已关闭</el-tag>
          <el-tag v-else-if="scope.row.status == 5" type="danger">
            无效订单
          </el-tag>
          <el-tag v-else type="info">未知</el-tag>
        </template>
      </el-table-column>
      <el-table-column
        header-align="center"
        align="center"
        label="物流"
        width="140"
        show-overflow-tooltip
      >
        <template #default="scope">
          <span v-if="scope.row.deliverySn">
            {{ scope.row.deliveryCompany }} {{ scope.row.deliverySn }}
          </span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="paymentTime"
        header-align="center"
        align="center"
        label="支付时间"
        width="170"
      ></el-table-column>
      <el-table-column
        prop="createTime"
        header-align="center"
        align="center"
        label="下单时间"
        width="170"
      ></el-table-column>
      <el-table-column
        fixed="right"
        header-align="center"
        align="center"
        width="280"
        label="操作"
      >
        <template #default="scope">
          <el-button
            size="small"
            type="primary"
            @click="detailHandle(scope.row)"
          >
            详情
          </el-button>
          <el-button
            size="small"
            type="success"
            @click="deliveryHandle(scope.row)"
            :disabled="scope.row.status != 1"
            v-perms="'order:order:update'"
          >
            发货
          </el-button>
          <el-button
            size="small"
            type="warning"
            @click="closeHandle(scope.row)"
            :disabled="scope.row.status != 0"
            v-perms="'order:order:update'"
          >
            关闭
          </el-button>
          <el-button
            size="small"
            type="danger"
            @click="deleteHandle(scope.row)"
            v-perms="'order:order:delete'"
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

    <!-- 发货弹窗 -->
    <el-dialog
      v-model="deliveryVisible"
      title="订单发货"
      width="480px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="deliveryFormRef"
        :model="deliveryForm"
        :rules="deliveryRules"
        label-width="90px"
      >
        <el-form-item label="订单号">
          <el-input :model-value="deliveryForm.orderSn" disabled></el-input>
        </el-form-item>
        <el-form-item label="物流公司" prop="deliveryCompany">
          <el-select
            v-model="deliveryForm.deliveryCompany"
            placeholder="请选择物流公司"
            filterable
            allow-create
            style="width: 100%"
          >
            <el-option
              v-for="c in deliveryCompanies"
              :key="c"
              :label="c"
              :value="c"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="物流单号" prop="deliverySn">
          <el-input
            v-model="deliveryForm.deliverySn"
            placeholder="请输入物流单号"
          ></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="deliveryVisible = false">取消</el-button>
        <el-button
          type="primary"
          :loading="deliverySubmitting"
          @click="deliverySubmit"
        >
          确定发货
        </el-button>
      </template>
    </el-dialog>

    <!-- 详情弹窗 -->
    <el-dialog v-model="detailVisible" title="订单详情" width="760px">
      <el-descriptions v-if="detailData" :column="2" border>
        <el-descriptions-item label="订单号" :span="2">
          {{ detailData.orderSn }}
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          {{ statusText(detailData.status) }}
        </el-descriptions-item>
        <el-descriptions-item label="会员">
          {{ detailData.memberUsername }}
          <span v-if="detailData.memberId">
            （ID: {{ detailData.memberId }}）
          </span>
        </el-descriptions-item>
        <el-descriptions-item label="订单总额">
          ¥{{ Number(detailData.totalAmount || 0).toFixed(2) }}
        </el-descriptions-item>
        <el-descriptions-item label="应付总额">
          ¥{{ Number(detailData.payAmount || 0).toFixed(2) }}
        </el-descriptions-item>
        <el-descriptions-item label="运费">
          ¥{{ Number(detailData.freightAmount || 0).toFixed(2) }}
        </el-descriptions-item>
        <el-descriptions-item label="促销优惠">
          -¥{{ Number(detailData.promotionAmount || 0).toFixed(2) }}
        </el-descriptions-item>
        <el-descriptions-item label="积分抵扣">
          -¥{{ Number(detailData.integrationAmount || 0).toFixed(2) }}
        </el-descriptions-item>
        <el-descriptions-item label="优惠券抵扣">
          -¥{{ Number(detailData.couponAmount || 0).toFixed(2) }}
        </el-descriptions-item>
        <el-descriptions-item label="后台调整">
          -¥{{ Number(detailData.discountAmount || 0).toFixed(2) }}
        </el-descriptions-item>
        <el-descriptions-item label="支付方式">
          {{ payTypeText(detailData.payType) }}
        </el-descriptions-item>
        <el-descriptions-item label="订单来源">
          {{
            detailData.sourceType == 0
              ? 'PC订单'
              : detailData.sourceType == 1
                ? 'App订单'
                : '-'
          }}
        </el-descriptions-item>
        <el-descriptions-item label="支付时间">
          {{ detailData.paymentTime || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="发货时间">
          {{ detailData.deliveryTime || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="确认收货时间">
          {{ detailData.receiveTime || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="物流公司">
          {{ detailData.deliveryCompany || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="物流单号">
          {{ detailData.deliverySn || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="收货人" :span="2">
          {{ detailData.receiverName }}（{{ detailData.receiverPhone }}）
        </el-descriptions-item>
        <el-descriptions-item label="收货邮编">
          {{ detailData.receiverPostCode || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="确认收货状态">
          {{
            detailData.confirmStatus == 1
              ? '已确认'
              : detailData.confirmStatus == 0
                ? '未确认'
                : '-'
          }}
        </el-descriptions-item>
        <el-descriptions-item label="收货地址" :span="2">
          {{ detailData.receiverProvince || ''
          }}{{ detailData.receiverCity || ''
          }}{{ detailData.receiverRegion || ''
          }}{{ detailData.receiverDetailAddress || '' }}
        </el-descriptions-item>
        <el-descriptions-item label="订单备注" :span="2">
          {{ detailData.note || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="下单时间">
          {{ detailData.createTime || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="修改时间">
          {{ detailData.modifyTime || '-' }}
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import {
  reqOrderDeleteBySn,
  reqOrderInfoBySn,
  reqOrderList,
  reqOrderUpdate,
} from '@/api/order/order'

const dataForm = ref({
  key: '',
  status: '' as number | '',
})

const dataList = ref<any[]>([])
const dataListSelections = ref<any[]>([])
const pageIndex = ref(1)
const pageSize = ref(10)
const totalPage = ref(0)
const dataListLoading = ref(false)

const getDataList = async () => {
  dataListLoading.value = true
  try {
    const response = await reqOrderList(
      pageIndex.value,
      pageSize.value,
      dataForm.value.key.trim(),
      dataForm.value.status,
    )
    if (response && response.code === 200) {
      dataList.value = response.data.list
      totalPage.value = response.data.totalCount
    } else {
      ElMessage.error(response?.message || '加载订单列表失败')
      dataList.value = []
      totalPage.value = 0
    }
    dataListLoading.value = false
  } catch (error) {
    console.error(error)
    dataListLoading.value = false
  }
}

const resetHandle = () => {
  dataForm.value.key = ''
  dataForm.value.status = ''
  pageIndex.value = 1
  getDataList()
}

const selectionChangeHandle = (val: any[]) => {
  dataListSelections.value = val
}

// ---------- 发货 ----------
const deliveryVisible = ref(false)
const deliverySubmitting = ref(false)
const deliveryFormRef = ref()
const deliveryCompanies = [
  '顺丰速运',
  '圆通速递',
  '中通快递',
  '韵达快递',
  '申通快递',
  '京东物流',
  '邮政EMS',
]
const deliveryForm = ref({
  orderSn: '',
  deliveryCompany: '',
  deliverySn: '',
})
const deliveryRules = {
  deliveryCompany: [
    { required: true, message: '请选择或输入物流公司', trigger: 'change' },
  ],
  deliverySn: [{ required: true, message: '请输入物流单号', trigger: 'blur' }],
}

const deliveryHandle = (row: any) => {
  deliveryForm.value = {
    orderSn: row.orderSn,
    deliveryCompany: row.deliveryCompany || '',
    deliverySn: row.deliverySn || '',
  }
  deliveryVisible.value = true
}

const deliverySubmit = async () => {
  if (!deliveryFormRef.value) return
  try {
    await deliveryFormRef.value.validate()
  } catch {
    return
  }
  deliverySubmitting.value = true
  try {
    const response = await reqOrderUpdate({
      orderSn: deliveryForm.value.orderSn,
      deliveryCompany: deliveryForm.value.deliveryCompany,
      deliverySn: deliveryForm.value.deliverySn,
      status: 2,
      deliveryTime: new Date().toISOString(),
    })
    deliverySubmitting.value = false
    if (response && response.code === 200) {
      ElMessage({
        type: 'success',
        message: '发货成功',
        duration: 1500,
        onClose: () => {
          deliveryVisible.value = false
          getDataList()
        },
      })
    } else {
      ElMessage.error(response.message || '发货失败')
    }
  } catch (error) {
    console.error(error)
    deliverySubmitting.value = false
    ElMessage.error('发货失败，请稍后重试')
  }
}

// ---------- 关闭订单 ----------
const closeHandle = async (row: any) => {
  try {
    await ElMessageBox.confirm(
      `确定关闭订单[${row.orderSn}]？关闭后该订单不可恢复。`,
      '关闭订单',
      {
        confirmButtonText: '确定关闭',
        cancelButtonText: '取消',
        type: 'warning',
      },
    )
  } catch {
    ElMessage.info('已取消关闭')
    return
  }
  try {
    const response = await reqOrderUpdate({ orderSn: row.orderSn, status: 4 })
    if (response && response.code === 200) {
      ElMessage({
        type: 'success',
        message: '订单已关闭',
        duration: 1500,
        onClose: () => {
          getDataList()
        },
      })
    } else {
      ElMessage.error(response.message || '关闭失败')
    }
  } catch (error) {
    console.error(error)
    ElMessage.error('关闭失败，请稍后重试')
  }
}

// ---------- 删除 ----------
const deleteHandle = (row?: any) => {
  const orderSns = row
    ? [row.orderSn]
    : dataListSelections.value.map((item) => item.orderSn)
  if (!orderSns.length) {
    ElMessage.warning('请先选择要删除的订单')
    return
  }
  ElMessageBox.confirm(
    `确定删除选中的 ${orderSns.length} 条订单记录？`,
    '删除订单',
    {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
    },
  )
    .then(async () => {
      const response = await reqOrderDeleteBySn(orderSns)
      if (response && response.code === 200) {
        ElMessage({
          type: 'success',
          message: '删除成功',
          duration: 1500,
          onClose: () => {
            getDataList()
          },
        })
      } else {
        ElMessage.error(response.message || '删除失败')
      }
    })
    .catch(() => {
      ElMessage.info('已取消删除')
    })
}

// ---------- 详情 ----------
const detailVisible = ref(false)
const detailData = ref<any>(null)

// 按订单号拉详情（业务主键）；失败时回退用列表行数据，保证弹窗不空
const detailHandle = async (row: any) => {
  detailData.value = row
  detailVisible.value = true
  try {
    const response = await reqOrderInfoBySn(row.orderSn)
    if (response && response.code === 200 && response.data) {
      detailData.value = response.data
    }
  } catch (error) {
    console.error(error)
  }
}

const payTypeText = (t: any) => {
  if (t == 1) return '支付宝'
  if (t == 2) return '微信'
  if (t == 3) return '银联'
  if (t == 4) return '货到付款'
  return '-'
}

const statusText = (s: any) => {
  if (s == 0) return '待付款'
  if (s == 1) return '待发货'
  if (s == 2) return '已发货'
  if (s == 3) return '已完成'
  if (s == 4) return '已关闭'
  if (s == 5) return '无效订单'
  return '未知'
}

// ---------- 分页 ----------
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
