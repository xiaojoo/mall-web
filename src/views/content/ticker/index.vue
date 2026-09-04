<template>
  <div class="mod-ticker">
    <el-form :inline="true" :model="searchForm" @keyup.enter="getDataList()">
      <el-form-item>
        <el-input
          v-model="searchForm.key"
          placeholder="公告内容"
          clearable
          style="width: 18rem"
        />
      </el-form-item>
      <el-form-item>
        <el-select
          v-model="searchForm.status"
          placeholder="状态"
          clearable
          style="width: 10rem"
        >
          <el-option label="启用" :value="1" />
          <el-option label="停用" :value="0" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="getDataList()">查询</el-button>
        <el-button type="primary" plain @click="addOrUpdateHandle()">
          新增
        </el-button>
        <el-button
          type="danger"
          @click="deleteHandle()"
          :disabled="dataListSelections.length <= 0"
          v-perms="'content:ticker:delete'"
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
      <el-table-column type="selection" width="50" align="center" />
      <el-table-column prop="id" label="ID" width="180" />
      <el-table-column prop="content" label="公告内容" min-width="300" />
      <el-table-column prop="sort" label="排序" width="80" align="center" />
      <el-table-column label="状态" width="90" align="center">
        <template #default="scope">
          <el-switch
            v-model="scope.row.status"
            :active-value="1"
            :inactive-value="0"
            @change="updateStatus(scope.row)"
          />
        </template>
      </el-table-column>
      <el-table-column
        prop="updateTime"
        label="更新时间"
        width="170"
        align="center"
      />
      <el-table-column label="操作" width="150" align="center">
        <template #default="scope">
          <el-button
            size="small"
            @click="addOrUpdateHandle(scope.row.id)"
            v-perms="'content:ticker:update'"
          >
            修改
          </el-button>
          <el-button
            size="small"
            type="danger"
            @click="deleteHandle(scope.row.id)"
            v-perms="'content:ticker:delete'"
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

    <!-- 新增 / 修改 -->
    <el-dialog
      v-model="dialogVisible"
      :title="!dataForm.id ? '新增公告' : '修改公告'"
      width="560px"
      :close-on-click-modal="false"
    >
      <el-form :model="dataForm" label-width="90px">
        <el-form-item label="公告内容" required>
          <el-input
            v-model="dataForm.content"
            type="textarea"
            :rows="3"
            maxlength="255"
            show-word-limit
            placeholder="如：⚡ 618 星际狂欢节 · 全场低至 1 折"
          />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="dataForm.sort" :min="0" />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch
            v-model="dataForm.status"
            :active-value="1"
            :inactive-value="0"
            active-text="启用"
            inactive-text="停用"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="dataFormSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import {
  reqTickerList,
  reqTickerInfo,
  reqTickerSave,
  reqTickerUpdate,
  reqTickerDelete,
} from '@/api/content/ticker'

const searchForm = ref({ key: '', status: '' })
const pageIndex = ref(1)
const pageSize = ref(10)
const totalPage = ref(0)
const dataList = ref<any[]>([])
const dataListLoading = ref(false)
const dataListSelections = ref<any[]>([])
const dataForm = ref({ id: 0, content: '', status: 1, sort: 0 })
const dialogVisible = ref(false)

const getDataList = async (pager = 1) => {
  pageIndex.value = pager
  dataListLoading.value = true
  try {
    const response = await reqTickerList(
      pageIndex.value,
      pageSize.value,
      searchForm.value.key,
      searchForm.value.status,
    )
    if (response && response.code === 200) {
      dataList.value = response.data.list || []
      totalPage.value = response.data.totalCount || 0
    } else {
      ElMessage.error(response?.message || response?.msg || '获取列表失败')
    }
  } catch (error) {
    console.error(error)
  } finally {
    dataListLoading.value = false
  }
}

// 状态切换
const updateStatus = async (row: any) => {
  try {
    const res = await reqTickerUpdate({ id: row.id, status: row.status })
    if (!res || res.code !== 200) {
      ElMessage.error(res?.message || res?.msg || '状态更新失败')
      getDataList(pageIndex.value)
    }
  } catch (error) {
    console.error(error)
    getDataList(pageIndex.value)
  }
}

// 删除
const deleteHandle = async (id?: number) => {
  const ids = id ? [id] : dataListSelections.value.map((item) => item.id)
  try {
    await ElMessageBox.confirm(
      `确定对[id=${ids.join(',')}]进行[${id ? '删除' : '批量删除'}]操作?`,
      '提示',
      { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' },
    )
    const res = await reqTickerDelete(ids)
    if (res && res.code === 200) {
      ElMessage.success('删除成功')
      getDataList()
    } else {
      ElMessage.error(res?.message || res?.msg || '删除失败')
    }
  } catch (error) {
    ElMessage.info('已取消删除')
  }
}

// 新增/修改
const addOrUpdateHandle = async (id?: number) => {
  dataForm.value = { id: 0, content: '', status: 1, sort: 0 }
  dialogVisible.value = true
  if (id) {
    try {
      const response = await reqTickerInfo(id)
      if (response && response.code === 200) {
        const d = response.data
        dataForm.value = {
          id: d.id,
          content: d.content || '',
          status: d.status ?? 1,
          sort: d.sort ?? 0,
        }
      }
    } catch (error) {
      console.error('公告信息获取失败', error)
    }
  }
}

const dataFormSubmit = async () => {
  if (!dataForm.value.content.trim()) {
    ElMessage.warning('请填写公告内容')
    return
  }
  const payload = {
    id: dataForm.value.id || undefined,
    content: dataForm.value.content.trim(),
    status: dataForm.value.status,
    sort: dataForm.value.sort,
  }
  try {
    const res = dataForm.value.id
      ? await reqTickerUpdate(payload)
      : await reqTickerSave(payload)
    if (res && res.code === 200) {
      ElMessage.success(dataForm.value.id ? '修改成功' : '新增成功')
      dialogVisible.value = false
      getDataList()
    } else {
      ElMessage.error(res?.message || res?.msg || '保存失败')
    }
  } catch (error) {
    console.error(error)
    ElMessage.error('保存失败')
  }
}

const selectionChangeHandle = (val: any[]) => {
  dataListSelections.value = val
}
const sizeChangeHandle = (val: number) => {
  pageSize.value = val
  pageIndex.value = 1
  getDataList()
}
const currentChangeHandle = (val: number) => {
  getDataList(val)
}

onMounted(() => {
  getDataList()
})
</script>

<style scoped lang="scss"></style>
