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
          v-perms="'coupon:coupon:delete'"
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
        prop="couponType"
        header-align="center"
        align="center"
        label="优惠券类型"
        width="100"
      >
        <template #default="scope">
          <el-tag v-if="scope.row.couponType == 0">全场赠券</el-tag>
          <el-tag type="info" v-if="scope.row.couponType == 1">会员赠券</el-tag>
          <el-tag type="success" v-if="scope.row.couponType == 2">
            购物赠券
          </el-tag>
          <el-tag type="warning" v-if="scope.row.couponType == 3">
            注册赠券
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="couponImg"
        header-align="center"
        align="center"
        label="优惠券图片"
      >
        <template #default="scope">
          <el-image
            v-if="scope.row.couponImg"
            :src="scope.row.couponImg"
            style="width: 50px; height: 50px"
            fit="cover"
            :preview-src-list="[scope.row.couponImg]"
            preview-teleported
          ></el-image>
        </template>
      </el-table-column>
      <el-table-column
        prop="couponName"
        header-align="center"
        align="center"
        label="优惠卷名字"
        width="160"
      ></el-table-column>
      <el-table-column
        prop="brandId"
        header-align="center"
        align="center"
        label="所属店铺"
        width="120"
      >
        <template #default="{ row }">
          <el-tag v-if="row.brandId" size="small" type="warning">
            店铺 {{ row.brandId }}
          </el-tag>
          <span v-else>全场</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="num"
        header-align="center"
        align="center"
        label="数量"
      ></el-table-column>
      <el-table-column
        prop="amount"
        header-align="center"
        align="center"
        label="金额"
      ></el-table-column>
      <el-table-column
        prop="perLimit"
        header-align="center"
        align="center"
        label="每人限领张数"
      ></el-table-column>
      <el-table-column
        prop="minPoint"
        header-align="center"
        align="center"
        label="使用门槛"
      ></el-table-column>
      <el-table-column
        prop="startTime"
        header-align="center"
        align="center"
        label="开始时间"
        width="160"
      ></el-table-column>
      <el-table-column
        prop="endTime"
        header-align="center"
        align="center"
        label="结束时间"
        width="160"
      ></el-table-column>
      <el-table-column
        prop="useType"
        header-align="center"
        align="center"
        label="使用类型"
        width="100"
      >
        <template #default="scope">
          <el-tag v-if="scope.row.useType == 0">全场通用</el-tag>
          <el-tag type="info" v-if="scope.row.useType == 1">指定分类</el-tag>
          <el-tag type="success" v-if="scope.row.useType == 2">指定商品</el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="note"
        header-align="center"
        align="center"
        label="备注"
      ></el-table-column>
      <el-table-column
        prop="publishCount"
        header-align="center"
        align="center"
        label="发行数量"
      ></el-table-column>
      <el-table-column
        prop="useCount"
        header-align="center"
        align="center"
        label="已使用数量"
      ></el-table-column>
      <el-table-column
        prop="receiveCount"
        header-align="center"
        align="center"
        label="领取数量"
      ></el-table-column>
      <el-table-column label="可以领取的日期">
        <el-table-column
          prop="enableStartTime"
          header-align="center"
          align="center"
          label="开始日期"
          width="160"
        ></el-table-column>
        <el-table-column
          prop="enableEndTime"
          header-align="center"
          align="center"
          label="结束日期"
          width="160"
        ></el-table-column>
      </el-table-column>
      <el-table-column
        prop="code"
        header-align="center"
        align="center"
        label="优惠码"
        width="160"
      ></el-table-column>
      <el-table-column
        prop="memberLevel"
        header-align="center"
        align="center"
        label="领取所需等级"
        width="100"
      >
        <template #default="scope">
          <el-tag v-if="scope.row.memberLevel == 0">不限等级</el-tag>
          <el-tag type="info" v-else>
            {{ getLevel(scope.row.memberLevel) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="publish"
        header-align="center"
        align="center"
        label="发布状态"
        width="100"
      >
        <template #default="scope">
          <el-tag v-if="scope.row.publish == 0">未发布</el-tag>
          <el-tag type="success" v-else>已发布</el-tag>
        </template>
      </el-table-column>
      <el-table-column
        fixed="right"
        header-align="center"
        align="center"
        width="300"
        label="操作"
      >
        <template #default="scope">
          <el-button
            size="small"
            :type="scope.row.publish == 1 ? 'warning' : 'success'"
            @click="publishHandle(scope.row)"
            v-perms="'coupon:coupon:update'"
          >
            {{ scope.row.publish == 1 ? '下架' : '发布' }}
          </el-button>
          <el-button
            size="small"
            type="primary"
            @click="copyHandle(scope.row)"
            v-perms="'coupon:coupon:save'"
          >
            复制
          </el-button>
          <el-button
            size="small"
            @click="addOrUpdateHandle(scope.row.id)"
            v-perms="'coupon:coupon:update'"
          >
            修改
          </el-button>
          <el-button
            size="small"
            @click="deleteHandle(scope.row.id)"
            v-perms="'coupon:coupon:delete'"
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
      :sku-id="skuId"
      v-model="addOrUpdateVisible"
      ref="addOrUpdate"
      @refreshDataList="getDataList"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import Add from './add.vue'
import {
  reqCouponCopy,
  reqCouponDelete,
  reqCouponList,
  reqCouponPublish,
  reqMemberLevelList,
} from '@/api/coupon/coupon'

interface MemberLevels {
  [key: string]: string
}

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
const memberLevels: MemberLevels = {
  level_1: '普通会员',
  level_2: '白银会员',
  level_3: '黄金会员',
}

const addOrUpdate = ref()
const route = useRoute()
const router = useRouter()
// 清除跳转带入的 skuId 路由参数（弹窗关闭/删除后不再保留，避免脏 URL 和后续预填）
const clearSkuIdQuery = () => {
  if (route.query.skuId) {
    const query = { ...route.query }
    delete query.skuId
    router.replace({ query })
  }
}
// 添加/修改弹窗关闭后清除 skuId（含保存成功自动关闭、手动取消）
watch(addOrUpdateVisible, (v) => {
  if (!v) clearSkuIdQuery()
})
// 从商品管理「优惠券」跳转带入的 skuId（仅用于自动打开添加弹窗；优惠券表单无 skuId 字段）
const skuId = ref(Number(route.query.skuId) || 0)

const getLevel = (level: number): string => {
  const key = `level_${level}` as const
  return memberLevels[key] || ''
}

// 获取所有的会员等级
const getMemberLevels = async () => {
  try {
    const response = await reqMemberLevelList(pageIndex.value, pageSize.value)
    if (response && response.code === 200) {
      if (response.data.list)
        response.data.list.forEach((item: any) => {
          memberLevels['level_' + item.id] = item.name
        })
    }
  } catch (error) {
    console.error(error)
  }
}

const getDataList = async () => {
  dataListLoading.value = true
  try {
    const response = await reqCouponList(
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

// 发布/下架
const publishHandle = async (row: any) => {
  try {
    const next = row.publish == 1 ? 0 : 1
    const response = await reqCouponPublish(row.id, next)
    if (response && response.code === 200) {
      ElMessage({
        type: 'success',
        message: next === 1 ? '优惠券已发布' : '优惠券已下架',
        duration: 1500,
        onClose: () => {
          getDataList()
        },
      })
    } else {
      ElMessage.error(response.msg)
    }
  } catch (error) {
    console.error(error)
  }
}

// 复制优惠券
const copyHandle = async (row: any) => {
  try {
    await ElMessageBox.confirm(
      `确定复制优惠券[${row.couponName}]?复制后生成一张新券（数量归零、默认未发布）`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      },
    )
    const response = await reqCouponCopy(row.id)
    if (response && response.code === 200) {
      ElMessage({
        type: 'success',
        message: '优惠券复制成功',
        duration: 1500,
        onClose: () => {
          getDataList()
        },
      })
    } else {
      ElMessage.error(response.msg)
    }
  } catch (error) {
    ElMessage.info('已取消优惠券复制')
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
    const response = await reqCouponDelete(ids)
    if (response && response.code === 200) {
      clearSkuIdQuery()
      ElMessage({
        type: 'success',
        message: '优惠券删除成功',
        duration: 1500,
        onClose: () => {
          getDataList()
        },
      })
    } else {
      ElMessage.error(response.msg)
    }
  } catch (error) {
    ElMessage.info('已取消优惠券删除')
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
  getMemberLevels()
  // 商品管理「优惠券」跳转：自动打开添加弹窗
  if (skuId.value) {
    addOrUpdateVisible.value = true
    nextTick(() => {
      addOrUpdate.value?.init()
    })
  }
})
</script>

<style scoped lang="scss"></style>
