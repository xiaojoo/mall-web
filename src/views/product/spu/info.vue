<template>
  <el-table
    :data="dataList"
    border
    v-loading="dataListLoading"
    @selection-change="selectionChangeHandle"
    style="width: 100%"
  >
    <!--    <el-table-column-->
    <!--      type="selection"-->
    <!--      header-align="center"-->
    <!--      align="center"-->
    <!--      width="50"-->
    <!--    ></el-table-column>-->
    <el-table-column
      prop="id"
      header-align="center"
      align="center"
      label="id"
    ></el-table-column>
    <el-table-column
      prop="spuName"
      header-align="center"
      align="center"
      label="名称"
    ></el-table-column>
    <el-table-column
      prop="spuDescription"
      header-align="center"
      align="center"
      label="描述"
    ></el-table-column>
    <el-table-column
      prop="catalogId"
      header-align="center"
      align="center"
      label="分类"
    ></el-table-column>
    <el-table-column
      prop="brandId"
      header-align="center"
      align="center"
      label="品牌"
    ></el-table-column>
    <el-table-column
      prop="weight"
      header-align="center"
      align="center"
      label="重量"
    ></el-table-column>
    <el-table-column
      prop="publishStatus"
      header-align="center"
      align="center"
      label="上架状态"
    >
      <template #default="scope">
        <el-tag v-if="scope.row.publishStatus == 0">新建</el-tag>
        <el-tag v-if="scope.row.publishStatus == 1">已上架</el-tag>
        <el-tag v-if="scope.row.publishStatus == 2">已下架</el-tag>
      </template>
    </el-table-column>
    <el-table-column
      prop="createTime"
      header-align="center"
      align="center"
      label="创建时间"
    ></el-table-column>
    <el-table-column
      prop="updateTime"
      header-align="center"
      align="center"
      label="修改时间"
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
          v-if="scope.row.publishStatus == 0"
          size="small"
          @click="productUp(scope.row.id)"
        >
          上架
        </el-button>
        <el-button
          v-if="scope.row.publishStatus == 1"
          size="small"
          type="warning"
          @click="productDown(scope.row.id)"
        >
          下架
        </el-button>
        <el-button
          v-if="scope.row.publishStatus == 2"
          size="small"
          type="success"
          @click="productUp(scope.row.id)"
        >
          重新上架
        </el-button>
        <el-dropdown
          size="small"
          trigger="click"
          @command="(cmd: string) => moreCommand(cmd, scope.row)"
        >
          <el-button size="small" style="margin-left: 10px">
            更多
            <el-icon><ArrowDown /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="delete">删除</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
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
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import {
  reqSpuInfo,
  reqUpSpu,
  reqDownSpu,
  reqDeleteSpu,
} from '@/api/product/spu'

import { ArrowDown } from '@element-plus/icons-vue'

let dataForm = reactive<Object>({
  catelogId: 0,
  brandId: 0,
  min: 0,
  max: 0,
  key: '',
})
const dataList = ref([])
const pageIndex = ref(1)
const pageSize = ref(10)
const totalPage = ref(0)
const dataListSelections = ref<any[]>([])
const dataListLoading = ref(false)

const props = defineProps({
  catId: {
    type: Number,
    default: 0,
  },
  dataFormSpu: {
    type: Object,
    default: () => ({
      catelogId: 0,
      brandId: 0,
      min: 0,
      max: 0,
      key: '',
    }),
  },
})

const getDataList = async () => {
  if (props.dataFormSpu) {
    dataForm = props.dataFormSpu
  }
  dataListLoading.value = true
  let param = {
    ...dataForm,
    page: pageIndex.value,
    limit: pageSize.value,
  }
  try {
    const response = await reqSpuInfo(param)
    if (response.code === 200) {
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

// 上架商品
const productUp = async (id: number) => {
  try {
    const response = await reqUpSpu(id)
    if (response.code === 200) {
      ElMessage({
        message: '商品上架成功',
        type: 'success',
        duration: 1500,
        onClose: () => {
          getDataList()
        },
      })
    } else {
      ElMessage.error(response.message || '商品上架失败')
    }
  } catch (error: any) {
    ElMessage.error(error?.message || '商品上架失败，请稍后重试')
  }
}

// 下架：删除ES中该SPU的上架数据
const productDown = async (id: number) => {
  try {
    await ElMessageBox.confirm(
      '下架后将从前台搜索中移除该商品，是否继续?',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      },
    )
    const response = await reqDownSpu(id)
    if (response.code === 200) {
      ElMessage({
        message: '商品下架成功',
        type: 'success',
        duration: 1500,
        onClose: () => {
          getDataList()
        },
      })
    } else {
      ElMessage.error(response.message || '商品下架失败')
    }
  } catch (error) {
    ElMessage.info('已取消下架')
  }
}

// 更多菜单：删除SPU（级联删除其下所有SKU）
const moreCommand = async (cmd: string, row: any) => {
  if (cmd === 'delete') {
    try {
      await ElMessageBox.confirm(
        `确定删除商品「${row.spuName}」及其下所有SKU吗？删除后不可恢复`,
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        },
      )
      const response = await reqDeleteSpu([row.id])
      if (response && response.code === 200) {
        ElMessage.success('删除成功')
        await getDataList()
      } else {
        ElMessage.error(response?.message || '删除失败')
      }
    } catch (error) {
      ElMessage.info('已取消删除')
    }
  }
}

// 多选
const selectionChangeHandle = (val: any) => {
  dataListSelections.value = val
}

// 每页数
const sizeChangeHandle = (val: number) => {
  pageSize.value = val
  pageIndex.value = 1
  getDataList()
}

// 当前页
const currentChangeHandle = (val: number) => {
  pageIndex.value = val
  getDataList()
}

defineExpose({ getDataList })

onMounted(() => {
  getDataList()
})
</script>

<style scoped lang="scss"></style>
