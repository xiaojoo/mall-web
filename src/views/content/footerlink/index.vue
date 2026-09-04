<template>
  <div class="mod-footerlink">
    <el-form :inline="true" :model="searchForm" @keyup.enter="getDataList()">
      <el-form-item>
        <el-input
          v-model="searchForm.key"
          placeholder="列标题/链接名"
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
          v-perms="'content:footerlink:delete'"
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
      <el-table-column prop="id" label="ID" width="160" />
      <el-table-column
        prop="groupName"
        label="所属列"
        width="140"
        align="center"
      />
      <el-table-column
        prop="name"
        label="链接名称"
        min-width="140"
        align="center"
      />
      <el-table-column label="跳转链接" min-width="220">
        <template #default="scope">
          <el-link
            v-if="scope.row.url"
            :href="scope.row.url"
            :target="isExternal(scope.row.url) ? '_blank' : undefined"
            type="primary"
            :underline="false"
          >
            {{ scope.row.url }}
          </el-link>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="groupSort"
        label="列序"
        width="70"
        align="center"
      />
      <el-table-column prop="sort" label="组内序" width="70" align="center" />
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
      <el-table-column label="操作" width="150" align="center">
        <template #default="scope">
          <el-button
            size="small"
            @click="addOrUpdateHandle(scope.row.id)"
            v-perms="'content:footerlink:update'"
          >
            修改
          </el-button>
          <el-button
            size="small"
            type="danger"
            @click="deleteHandle(scope.row.id)"
            v-perms="'content:footerlink:delete'"
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
      :title="!dataForm.id ? '新增页脚链接' : '修改页脚链接'"
      width="560px"
      :close-on-click-modal="false"
    >
      <el-form :model="dataForm" label-width="90px">
        <el-form-item label="所属列" required>
          <el-input
            v-model="dataForm.groupName"
            placeholder="如：购物指南 / 配送服务 / 关于我们"
          />
        </el-form-item>
        <el-form-item label="链接名称" required>
          <el-input v-model="dataForm.name" placeholder="如：购物流程" />
        </el-form-item>
        <el-form-item label="跳转链接" required>
          <el-input
            v-model="dataForm.url"
            placeholder="/list 站内路径，或 https:// 外部链接"
          />
        </el-form-item>
        <el-form-item label="列排序">
          <el-input-number v-model="dataForm.groupSort" :min="0" />
        </el-form-item>
        <el-form-item label="组内排序">
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
  reqFooterLinkList,
  reqFooterLinkInfo,
  reqFooterLinkSave,
  reqFooterLinkUpdate,
  reqFooterLinkDelete,
} from '@/api/content/footerlink'

const searchForm = ref({ key: '', status: '' })
const pageIndex = ref(1)
const pageSize = ref(10)
const totalPage = ref(0)
const dataList = ref<any[]>([])
const dataListLoading = ref(false)
const dataListSelections = ref<any[]>([])
const dataForm = ref({
  id: 0,
  groupName: '',
  name: '',
  url: '',
  groupSort: 0,
  sort: 0,
  status: 1,
})
const dialogVisible = ref(false)

const isExternal = (url: string) => /^https?:\/\//i.test(url)

const getDataList = async (pager = 1) => {
  pageIndex.value = pager
  dataListLoading.value = true
  try {
    const response = await reqFooterLinkList(
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
    const res = await reqFooterLinkUpdate({ id: row.id, status: row.status })
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
    const res = await reqFooterLinkDelete(ids)
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
  dataForm.value = {
    id: 0,
    groupName: '',
    name: '',
    url: '',
    groupSort: 0,
    sort: 0,
    status: 1,
  }
  dialogVisible.value = true
  if (id) {
    try {
      const response = await reqFooterLinkInfo(id)
      if (response && response.code === 200) {
        const d = response.data
        dataForm.value = {
          id: d.id,
          groupName: d.groupName || '',
          name: d.name || '',
          url: d.url || '',
          groupSort: d.groupSort ?? 0,
          sort: d.sort ?? 0,
          status: d.status ?? 1,
        }
      }
    } catch (error) {
      console.error('页脚链接信息获取失败', error)
    }
  }
}

const dataFormSubmit = async () => {
  if (!dataForm.value.groupName.trim() || !dataForm.value.name.trim()) {
    ElMessage.warning('请填写所属列与链接名称')
    return
  }
  if (!dataForm.value.url.trim()) {
    ElMessage.warning('请填写跳转链接')
    return
  }
  const payload = {
    id: dataForm.value.id || undefined,
    groupName: dataForm.value.groupName.trim(),
    name: dataForm.value.name.trim(),
    url: dataForm.value.url.trim(),
    groupSort: dataForm.value.groupSort,
    sort: dataForm.value.sort,
    status: dataForm.value.status,
  }
  try {
    const res = dataForm.value.id
      ? await reqFooterLinkUpdate(payload)
      : await reqFooterLinkSave(payload)
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
