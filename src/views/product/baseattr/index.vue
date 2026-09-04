<template>
  <el-row :gutter="20">
    <el-col :span="5">
      <category @tree-node-click="treeNodeClick" />
    </el-col>
    <el-col :span="19">
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
            <el-button type="success" @click="getAllDataList()">
              查询全部
            </el-button>
            <el-button type="primary" @click="addOrUpdateHandle(-1)">
              新增
            </el-button>
            <el-button type="primary" plain @click="batchAddVisible = true">
              批量添加
            </el-button>
            <el-button
              type="danger"
              @click="deleteHandle()"
              :disabled="dataListSelections.length <= 0"
              v-perms="'product:baseattr:delete'"
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
            prop="attrId"
            header-align="center"
            align="center"
            label="id"
          ></el-table-column>
          <el-table-column
            prop="attrName"
            header-align="center"
            align="center"
            label="属性名"
          ></el-table-column>
          <el-table-column
            v-if="props.attrType == 1"
            prop="searchType"
            header-align="center"
            align="center"
            label="可检索"
          >
            <template #default="scope">
              <el-switch
                :model-value="scope.row.searchType"
                :active-value="1"
                :inactive-value="0"
                active-color="#13ce66"
                inactive-color="#ff4949"
                disabled
              ></el-switch>
            </template>
          </el-table-column>
          <el-table-column
            prop="valueType"
            header-align="center"
            align="center"
            label="值类型"
          >
            <template #default="scope">
              <el-tag type="success" v-if="scope.row.valueType == 0">
                单选
              </el-tag>
              <el-tag v-else>多选</el-tag>
            </template>
          </el-table-column>
          <el-table-column header-align="center" align="center" label="图标">
            <template #default="scope">
              <!-- 图标名命中注册表则渲染图形，否则回退显示文本 -->
              <el-icon
                v-if="scope.row.icon && menuIconMap[scope.row.icon]"
                :size="18"
              >
                <component :is="resolveMenuIcon(scope.row.icon)" />
              </el-icon>
              <span v-else-if="scope.row.icon">{{ scope.row.icon }}</span>
            </template>
          </el-table-column>
          <el-table-column
            prop="valueSelect"
            header-align="center"
            align="center"
            label="可选值"
          >
            <template #default="scope">
              <el-tooltip placement="top">
                <template #content>
                  <span
                    v-for="(i, index) in scope.row.valueSelect.split(';')"
                    :key="index"
                  >
                    {{ i }}
                    <br />
                  </span>
                </template>
                <el-tag>
                  {{ scope.row.valueSelect.split(';')[0] + ' ...' }}
                </el-tag>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column
            prop="catelogName"
            header-align="center"
            align="center"
            label="所属分类"
          ></el-table-column>
          <el-table-column
            v-if="props.attrType == 1"
            prop="groupName"
            header-align="center"
            align="center"
            label="所属分组"
          ></el-table-column>
          <el-table-column
            v-if="props.attrType == 1"
            prop="showDesc"
            header-align="center"
            align="center"
            label="快速展示"
          >
            <template #default="scope">
              <el-switch
                :model-value="scope.row.showDesc"
                :active-value="1"
                :inactive-value="0"
                active-color="#13ce66"
                inactive-color="#ff4949"
                disabled
              ></el-switch>
            </template>
          </el-table-column>
          <el-table-column
            prop="enable"
            header-align="center"
            align="center"
            label="启用状态"
          >
            <template #default="scope">
              <el-switch
                :model-value="scope.row.enable"
                :active-value="1"
                :inactive-value="0"
                active-color="#13ce66"
                inactive-color="#ff4949"
                disabled
              ></el-switch>
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
                @click="addOrUpdateHandle(scope.row.attrId)"
                v-perms="'product:baseattr:update'"
              >
                修改
              </el-button>
              <el-button
                size="small"
                @click="deleteHandle(scope.row.attrId)"
                v-perms="'product:baseattr:delete'"
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
        <!-- 弹窗, 新增 / 修改 -->
        <Add
          v-model:type="props.attrType"
          v-model:visible="addOrUpdateVisible"
          ref="addOrUpdate"
          @refreshDataList="getDataList"
        />
        <BatchAdd
          v-model="batchAddVisible"
          :attr-type="props.attrType"
          @refreshDataList="getDataList"
        />
      </div>
    </el-col>
  </el-row>
</template>

<script setup lang="ts">
import Category from '@/views/common/category.vue'
import { nextTick, onMounted, ref } from 'vue'
import {
  reqBaseAttrList,
  reqDeleteAttrResponseData,
} from '@/api/product/baseattr'

import Add from './add.vue'
import BatchAdd from './batchAdd.vue'
import { menuIconMap, resolveMenuIcon } from '@/utils/menuIcons'

const catId = ref(0)
const dataForm = ref({
  key: '',
})
const dataList = ref([])
const pageIndex = ref(1)
const pageSize = ref(10)
const totalPage = ref(0)
const dataListLoading = ref(false)
const dataListSelections = ref([
  {
    attrGroupId: '',
    name: '',
    attrId: '',
  },
])
const addOrUpdate = ref()
const props = defineProps({
  attrType: {
    type: Number,
    default: 1,
  },
})

const addOrUpdateVisible = ref(false)
const batchAddVisible = ref(false)
// 感知树节点被点击
const treeNodeClick = (data: any, node: any) => {
  if (node.level === 3) {
    catId.value = data.catId
    getDataList()
  }
}

const getAllDataList = () => {
  catId.value = 0
  getDataList()
}

const getDataList = async () => {
  dataListLoading.value = true
  let type = props.attrType === 0 ? 'sale' : 'base'
  try {
    const response = await reqBaseAttrList(
      type,
      catId.value,
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

const addOrUpdateHandle = (attrId: number) => {
  addOrUpdateVisible.value = true
  nextTick(() => {
    addOrUpdate.value?.init(attrId)
  })
}

const selectionChangeHandle = (val: any) => {
  dataListSelections.value = val
}

const deleteHandle = async (attrId?: number) => {
  const ids = attrId
    ? [attrId]
    : dataListSelections.value.map((item) => item.attrId)

  try {
    await ElMessageBox.confirm(
      `确定对[id=${ids.join(',')}]进行[${attrId ? '删除' : '批量删除'}]操作?`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      },
    )
    const response = await reqDeleteAttrResponseData(ids)
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
      ElMessage.error(response.msg)
    }
  } catch (error) {
    ElMessage.info('已取消删除')
  }
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

onMounted(() => {
  getDataList()
})
</script>

<style scoped lang="scss"></style>
