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
          v-perms="'member:level:delete'"
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
        label="等级名称"
      ></el-table-column>
      <el-table-column
        prop="growthPoint"
        header-align="center"
        align="center"
        label="所需成长值"
      ></el-table-column>
      <el-table-column
        prop="defaultStatus"
        header-align="center"
        align="center"
        label="默认等级"
      >
        <template #default="scope">
          <i class="el-icon-success" v-if="scope.row.defaultStatus == 1"></i>
          <i class="el-icon-error" v-else></i>
        </template>
      </el-table-column>
      <el-table-column
        prop="freeFreightPoint"
        header-align="center"
        align="center"
        label="免运费标准"
      ></el-table-column>
      <el-table-column
        prop="commentGrowthPoint"
        header-align="center"
        align="center"
        label="每次评价获取的成长值"
      ></el-table-column>
      <el-table-column label="特权">
        <el-table-column
          prop="priviledgeFreeFreight"
          header-align="center"
          align="center"
          label="免邮特权"
        >
          <template #default="scope">
            <i
              class="el-icon-success"
              v-if="scope.row.priviledgeFreeFreight == 1"
            ></i>
            <i class="el-icon-error" v-else></i>
          </template>
        </el-table-column>
        <el-table-column
          prop="priviledgeMemberPrice"
          header-align="center"
          align="center"
          label="会员价格特权"
        >
          <template #default="scope">
            <i
              class="el-icon-success"
              v-if="scope.row.priviledgeMemberPrice == 1"
            ></i>
            <i class="el-icon-error" v-else></i>
          </template>
        </el-table-column>
        <el-table-column
          prop="priviledgeBirthday"
          header-align="center"
          align="center"
          label="生日特权"
        >
          <template #default="scope">
            <i
              class="el-icon-success"
              v-if="scope.row.priviledgeBirthday == 1"
            ></i>
            <i class="el-icon-error" v-else></i>
          </template>
        </el-table-column>
      </el-table-column>
      <el-table-column
        prop="note"
        header-align="center"
        align="center"
        label="备注"
      ></el-table-column>
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
            v-perms="'member:level:update'"
          >
            修改
          </el-button>
          <el-button
            size="small"
            @click="deleteHandle(scope.row.id)"
            v-perms="'member:level:delete'"
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

import Add from './add.vue'
import { reqMemberLeveDelete, reqMemberLevelList } from '@/api/member/level'

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

const getDataList = async () => {
  dataListLoading.value = true
  try {
    const response = await reqMemberLevelList(
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
    const response = await reqMemberLeveDelete(ids)
    if (response && response.code === 200) {
      ElMessage({
        type: 'success',
        message: '会员等级删除成功',
        duration: 1500,
        onClose: () => {
          getDataList()
        },
      })
    } else {
      ElMessage.error(response.msg)
    }
  } catch (error) {
    ElMessage.info('已取消会员等级删除')
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
