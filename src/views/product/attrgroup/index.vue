<template>
  <el-row :gutter="20">
    <el-col :span="5">
      <div class="grid-content bg-purple">
        <Category @tree-node-click="treeNodeClick"></Category>
      </div>
    </el-col>
    <el-col :span="19">
      <div class="grid-content bg-purple">
        <el-form
          :inline="true"
          :model="dataForm"
          @keyup.enter.native="getDataList()"
        >
          <el-form-item>
            <el-input
              v-model="dataForm.key"
              placeholder="搜索"
              style="width: 15rem"
              clearable
            />
          </el-form-item>
          <el-form-item>
            <el-button
              class="el-button-title"
              type="primary"
              @click="getDataList()"
            >
              查询
            </el-button>
            <el-button
              class="el-button-title"
              type="success"
              @click="getAllDataList()"
            >
              查询全部
            </el-button>
            <el-button
              class="el-button-title"
              type="primary"
              @click="addOrUpdateHandle()"
            >
              新增
            </el-button>
            <el-button
              class="el-button-title"
              type="primary"
              plain
              @click="batchAddVisible = true"
            >
              批量添加
            </el-button>
            <el-button
              class="el-button-title"
              type="danger"
              @click="deleteHandle()"
              :disabled="dataListSelections.length <= 0"
              v-perms="'product:attrgroup:delete'"
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
            prop="attrGroupId"
            header-align="center"
            align="center"
            label="分组id"
          ></el-table-column>
          <el-table-column
            prop="attrGroupName"
            header-align="center"
            align="center"
            label="组名"
          ></el-table-column>
          <el-table-column
            prop="sort"
            header-align="center"
            align="center"
            label="排序"
          ></el-table-column>
          <el-table-column
            prop="descript"
            header-align="center"
            align="center"
            label="描述"
          ></el-table-column>
          <el-table-column header-align="center" align="center" label="组图标">
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
            prop="catelogId"
            header-align="center"
            align="center"
            label="所属分类id"
          ></el-table-column>
          <el-table-column
            fixed="right"
            header-align="center"
            align="left"
            width="200"
            label="操作"
          >
            <template #default="scope">
              <el-button
                size="small"
                type="primary"
                @click="relationHandle(scope.row.attrGroupId)"
              >
                关联分类
              </el-button>
              <el-button
                class="el-button-two"
                size="small"
                type="success"
                @click="addOrUpdateHandle(scope.row.attrGroupId)"
                v-perms="'product:attrgroup:update'"
              >
                修改
              </el-button>
              <el-button
                size="small"
                class="el-button-two"
                type="danger"
                @click="deleteHandle(scope.row.attrGroupId)"
                v-perms="'product:attrgroup:delete'"
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
        <BatchAdd v-model="batchAddVisible" @refreshDataList="getDataList" />
        <Relation v-model="relationVisible" ref="relationUpdate" />
      </div>
    </el-col>
  </el-row>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue'
import Category from '@/views/common/category.vue'
import {
  reqAttrGroupList,
  reqDeleteResponseData,
} from '@/api/product/attrgroup/index.ts'
import Add from './add.vue'
import BatchAdd from './batchAdd.vue'
import Relation from './relation.vue'
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
  },
])
const addOrUpdateVisible = ref(false)
const batchAddVisible = ref(false)
const relationVisible = ref(false)
const addOrUpdate = ref()
const relationUpdate = ref()

const getDataList = async () => {
  dataListLoading.value = true
  try {
    const response = await reqAttrGroupList(
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
    console.error('属性分组获取失败', error)
  }
}
// 菜单联动
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

const selectionChangeHandle = (val: any) => {
  dataListSelections.value = val
}

const addOrUpdateHandle = (attrGroupId?: number) => {
  addOrUpdateVisible.value = true
  nextTick(() => {
    addOrUpdate.value?.init(attrGroupId)
  })
}

const relationHandle = (attrGroupId: number) => {
  relationVisible.value = true
  nextTick(() => {
    relationUpdate.value?.init(attrGroupId)
  })
}
const deleteHandle = async (attrGroupId?: number) => {
  const ids = attrGroupId
    ? [attrGroupId]
    : dataListSelections.value.map((item) => item.attrGroupId)
  try {
    await ElMessageBox.confirm(
      `确定对[id=${ids.join(',')}]进行[${attrGroupId ? '删除' : '批量删除'}]操作?`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      },
    )
    const response = await reqDeleteResponseData(ids)
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

<style scoped lang="scss">
.el-button-two {
  margin-left: 0;
}

.el-button--small {
  padding: 0.5rem;
  margin-left: 0.5rem;
}

.el-form--inline .el-form-item {
  margin-right: 0.6rem;
}
</style>
