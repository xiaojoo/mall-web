<template>
  <el-dialog
    :model-value="modelValue"
    @update:model-value="updateVisible"
    title="关联分类"
  >
    <el-row>
      <el-col :span="24">
        <div style="margin-bottom: 15px">
          <el-button type="primary" @click="addRelation">新建关联</el-button>
          <el-button
            type="danger"
            @click="batchDeleteRelation"
            :disabled="dataListSelections.length <= 0"
            v-perms="'product:attrgroup:delete'"
          >
            批量删除
          </el-button>
        </div>
        <el-table
          :data="relationAttrs"
          style="width: 100%"
          @selection-change="selectionChangeHandle"
          border
        >
          <el-table-column
            type="selection"
            header-align="center"
            align="center"
            width="50"
          ></el-table-column>
          <el-table-column prop="attrId" label="#"></el-table-column>
          <el-table-column prop="attrName" label="属性名"></el-table-column>
          <el-table-column prop="valueSelect" label="可选值">
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
            fixed="right"
            header-align="center"
            align="center"
            label="操作"
          >
            <template #default="scope">
              <el-button size="small" @click="relationRemove(scope.row.attrId)">
                移除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-col>
    </el-row>
    <el-dialog
      width="40%"
      title="选择属性"
      v-model="innerVisible"
      append-to-body
    >
      <div>
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
          </el-form-item>
        </el-form>
        <el-table
          :data="dataList"
          border
          v-loading="dataListLoading"
          @selection-change="innerSelectionChangeHandle"
          style="width: 100%"
        >
          <el-table-column
            type="selection"
            header-align="center"
            align="center"
          ></el-table-column>
          <el-table-column
            prop="attrId"
            header-align="center"
            align="center"
            label="属性id"
          ></el-table-column>
          <el-table-column
            prop="attrName"
            header-align="center"
            align="center"
            label="属性名"
          ></el-table-column>
          <el-table-column
            prop="icon"
            header-align="center"
            align="center"
            label="属性图标"
          ></el-table-column>
          <!-- <el-table-column prop="valueSelect" header-align="center" align="center" label="可选值列表"></el-table-column> -->
          <el-table-column prop="valueSelect" label="可选值">
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
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleCancel">取消</el-button>
          <el-button type="primary" @click="submitAddRelation()">
            确认新增
          </el-button>
        </div>
      </template>
    </el-dialog>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  reqAddRelationResponseData,
  reqAttrInit,
  reqAttrInitList,
  reqDeleteRelationResponseData,
  reqDelRelationResponseData,
} from '@/api/product/attrgroup'
import type { PostData } from '@/api/product/attrgroup/type.ts'

const attrGroupId = ref(0)
const innerVisible = ref(false)
const relationAttrs = ref([])
const dataListSelections = ref<any[]>([])
const dataForm = ref({
  key: '',
})
const dataList = ref([
  {
    attrId: '',
    attrName: '',
    icon: '',
    valueSelect: '',
  },
])
const pageIndex = ref(1)
const pageSize = ref(10)
const totalPage = ref(0)
const dataListLoading = ref(false)
const innerDataListSelections = ref([])

defineProps(['modelValue'])

const emit = defineEmits(['update:modelValue', 'refreshData'])

const updateVisible = (value: boolean) => {
  emit('update:modelValue', value)
}

// 处理取消按钮点击
const handleCancel = () => {
  innerVisible.value = !innerVisible.value
}

const selectionChangeHandle = (val: any) => {
  dataListSelections.value = val
  console.log(val)
  console.log(dataListSelections.value)
}
const innerSelectionChangeHandle = (val: any) => {
  innerDataListSelections.value = val
}
const addRelation = () => {
  innerVisible.value = true
  getDataList()
}

const getDataList = async () => {
  dataListLoading.value = true
  try {
    const response = await reqAttrInitList(
      attrGroupId.value,
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

const batchDeleteRelation = async () => {
  let postData: PostData[] = []
  dataListSelections.value.forEach((item: any) => {
    postData.push({ attrId: item.attrId, attrGroupId: attrGroupId.value })
  })
  try {
    const response = await reqDeleteRelationResponseData(postData)
    if (response && response.code === 200) {
      ElMessage.success('删除成功')
      await init(attrGroupId.value)
    } else {
      ElMessage.error('删除失败')
    }
  } catch (error) {
    console.error('属性分类删除失败', error)
  }
}

const init = async (id: number) => {
  attrGroupId.value = id || 0
  try {
    const response = await reqAttrInit(attrGroupId.value)
    if (response && response.code === 200) {
      relationAttrs.value = response.data
    }
  } catch (error) {
    console.error('属性分类初始化失败', error)
  }
}

// 移除关联
const relationRemove = async (attrId: number) => {
  let data = []
  data.push({ attrId, attrGroupId: attrGroupId.value })
  try {
    const response = await reqDelRelationResponseData(data)
    if (response && response.code === 200) {
      await init(attrGroupId.value)
      ElMessage.success('移除关联成功')
    } else {
      ElMessage.error('移除关联失败')
    }
  } catch (error) {
    console.error('移除关联失败', error)
  }
}
const submitAddRelation = async () => {
  innerVisible.value = false
  if (innerDataListSelections.value.length > 0) {
    let postData: PostData[] = []
    innerDataListSelections.value.forEach((item: any) => {
      postData.push({ attrId: item.attrId, attrGroupId: attrGroupId.value })
    })
    try {
      const response = await reqAddRelationResponseData(postData)
      if (response.code === 200) {
        ElMessage.success('新增关联成功')
        emit('refreshData')
        await init(attrGroupId.value)
      } else {
        ElMessage.success('新增关联失败')
      }
    } catch (error) {
      console.error('添加关联失败', error)
    }
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

// 暴露方法
defineExpose({ init })
</script>

<style lang="scss" scoped></style>
