<template>
  <el-card class="box-card">
    <el-form
      :inline="true"
      :model="dataForm"
      @keyup.enter.native="getHasTrademark()"
    >
      <el-form-item>
        <el-input
          v-model="dataForm.key"
          placeholder="参数名"
          clearable
        ></el-input>
      </el-form-item>
      <el-form-item>
        <el-button @click="getHasTrademark()">查询</el-button>
        <el-button
          type="primary"
          size="default"
          :icon="Plus"
          @click="addOrUpdateHandle()"
        >
          添加
        </el-button>
        <el-button
          type="primary"
          plain
          size="default"
          :icon="Files"
          @click="batchAddVisible = true"
        >
          批量添加
        </el-button>
        <el-button
          type="danger"
          @click="deleteHandle()"
          :disabled="dataListSelections.length <= 0"
          v-perms="'product:brand:delete'"
        >
          批量删除
        </el-button>
      </el-form-item>
    </el-form>
    <el-table
      style="width: 100%"
      border
      :data="trademarkArr"
      @selection-change="selectionChangeHandle"
      v-loading="dataListLoading"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="品牌ID" prop="brandId"></el-table-column>
      <el-table-column label="品牌名称" prop="name"></el-table-column>
      <el-table-column label="品牌LOGO" prop="logo">
        <template #default="scope">
          <img
            style="height: 5rem; border: none"
            :src="scope.row.logo"
            alt="logo"
          />
        </template>
      </el-table-column>
      <el-table-column label="品牌介绍" prop="descript"></el-table-column>
      <el-table-column label="显示状态" prop="showStatus">
        <template #default="scope">
          <el-switch
            v-model="scope.row.showStatus"
            @change="updateStatus(scope.row)"
            :active-value="1"
            :inactive-value="0"
            active-color="#13ce66"
            inactive-color="#ff4949"
          ></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="检索首字母" prop="firstLetter"></el-table-column>
      <el-table-column label="排序" prop="sort"></el-table-column>
      <el-table-column label="品牌操作" width="257">
        <template #default="scope">
          <el-button
            type="success"
            plain
            @click="updateCatelogHandle(scope.row.brandId)"
          >
            关联分类
          </el-button>
          <el-button
            type="info"
            plain
            @click="addOrUpdateHandle(scope.row.brandId)"
            v-perms="'product:brand:update'"
          >
            修改
          </el-button>
          <el-button
            type="danger"
            plain
            @click="deleteHandle(scope.row.brandId)"
            v-perms="'product:brand:delete'"
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
      v-model:visible="visible"
      ref="childRef"
      @refreshDataList="getHasTrademark"
    />
    <BatchAdd
      v-model:visible="batchAddVisible"
      @refreshDataList="getHasTrademark"
    />
    <el-dialog title="关联分类" v-model="cateRelationDialogVisible">
      <div style="display: flex">
        <Cascader v-model:catelogPath="catelogPath" />
        <el-button
          type="primary"
          @click="addCatelogSelect"
          class="dialog-button-bottom"
        >
          新增关联
        </el-button>
      </div>
      <el-table :data="cateRelationTableData" style="width: 100%">
        <el-table-column prop="id" label="序号" width="100" />
        <el-table-column prop="brandName" label="品牌名" />
        <el-table-column prop="catelogName" label="分类名" />
        <el-table-column
          fixed="right"
          header-align="center"
          align="right"
          label="操作"
          width="100"
        >
          <template #default="scope">
            <el-button
              size="small"
              @click="deleteCateRelationHandle(scope.row.id)"
            >
              移除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="cateRelationDialogVisible = false">
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup lang="ts">
import { onMounted, ref, nextTick } from 'vue'
import { Plus, Files } from '@element-plus/icons-vue'
import type { ComponentSize } from 'element-plus'
import {
  reqStatus,
  reqTrademark,
  reqDeleteTrademark,
  reqCatelogInfo,
  reqCatelogSave,
  reqDeleteCatelog,
} from '@/api/product/trademark'
import Add from './add/index.vue'
import BatchAdd from './batchAdd.vue'
import type {
  TradeMarkResponseData,
  Records,
  TradeMark,
} from '@/api/product/trademark/type.ts'
import ChildComponent from './ChildComponent.vue'
import Cascader from '@/views/common/cascader.vue'

const pageIndex = ref(1)
const pageSize = ref(10)
const size = ref<ComponentSize>('default')
const background = ref(true)
const disabled = ref(false)
const totalPage = ref(0)
const trademarkArr = ref<Records>([])
const visible = ref(false)
const batchAddVisible = ref(false)
const dataForm = ref({ key: '' })
const dataListLoading = ref(false)
const dataListSelections = ref<TradeMark[]>([])
const cateRelationDialogVisible = ref(false)
const cateRelationTableData = ref([])
const brandId = ref()
const catelogPath = ref([])

// 获取API数据
const getHasTrademark = async (pager = 1) => {
  pageIndex.value = pager
  dataListLoading.value = true
  try {
    const result: TradeMarkResponseData = await reqTrademark(
      pageIndex.value,
      pageSize.value,
      dataForm.value.key,
    )
    if (result.code === 200) {
      totalPage.value = result.data.totalCount
      trademarkArr.value = result.data.list
    }
  } catch (error) {
    // ElMessage.error('分页请求失败')
    console.error('分页请求失败:', error)
  } finally {
    dataListLoading.value = false
  }
}

const sizeChangeHandle = () => {
  getHasTrademark()
}

const currentChangeHandle = (val: number) => {
  getHasTrademark(val)
}

const updateStatus = async (data: any) => {
  try {
    const { brandId, showStatus } = data
    const result = await reqStatus(brandId, showStatus)
    if (result.code === 200) {
      await getHasTrademark(pageIndex.value)
      ElMessage.success('状态更新成功')
    }
  } catch (error) {
    // ElMessage.error('状态更新失败')
    console.error('状态更新失败:', error)
  }
}

const childRef = ref<InstanceType<typeof ChildComponent>>(null)

// 添加、修改
const addOrUpdateHandle = (brandId?: number) => {
  visible.value = !visible.value
  nextTick(() => {
    childRef.value?.init(brandId)
  })
}

const selectionChangeHandle = (val: any) => {
  dataListSelections.value = val
}

// 批量删除
const deleteHandle = async (brandId?: number) => {
  const ids = brandId
    ? [brandId]
    : dataListSelections.value.map((item) => item.brandId)
  try {
    await ElMessageBox.confirm(
      `确定对[id=${ids.join(',')}]进行[${brandId ? '删除' : '批量删除'}]操作?`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      },
    )
    const data = await reqDeleteTrademark(ids)
    if (data && data.code === 200) {
      ElMessage({
        type: 'success',
        message: '删除成功',
        duration: 1500,
        onClose: () => {
          getHasTrademark()
        },
      })
    } else {
      ElMessage.error(data.msg)
    }
  } catch (error) {
    ElMessage.info('已取消删除')
  }
}

// 关联分类
const updateCatelogHandle = (val: number) => {
  cateRelationDialogVisible.value = true
  brandId.value = val
  getCateRelation()
}

const getCateRelation = async () => {
  try {
    const response = await reqCatelogInfo(brandId.value)
    cateRelationTableData.value = response.data
  } catch (error) {
    console.error('获取关联分类数据失败', error)
    ElMessage.error(error as string)
  }
}
const addCatelogSelect = async () => {
  // 判空：未选品牌/分类时给出提示，不发请求
  if (!brandId.value) {
    ElMessage.warning('请先选择品牌')
    return
  }
  const path = catelogPath.value || []
  if (path.length === 0) {
    ElMessage.warning('请先选择分类')
    return
  }
  try {
    const response: any = await reqCatelogSave(
      brandId.value,
      path[path.length - 1],
    )
    if (response && response.code === 200) {
      await getCateRelation()
      ElMessage.success('关联分类添加成功')
    } else {
      ElMessage.error(response?.message || response?.msg || '关联分类添加失败')
    }
  } catch (error) {
    console.error('关联分类添加失败', error)
    ElMessage.error('关联分类添加失败')
  }
}

const deleteCateRelationHandle = async (id: number) => {
  try {
    const response: any = await reqDeleteCatelog([id])
    if (response && response.code === 200) {
      await getCateRelation()
      ElMessage.success('关联分类移除成功')
    } else {
      ElMessage.error(response?.message || response?.msg || '关联分类移除失败')
    }
  } catch (error) {
    console.error('关联分类移除失败', error)
    ElMessage.error('关联分类移除失败')
  }
}

onMounted(() => {
  getHasTrademark()
})
</script>

<style scoped lang="scss">
.el-form--inline .el-form-item {
  margin-right: 0.8rem;
}

.dialog-button-bottom {
  margin-left: 1rem;
}
</style>
