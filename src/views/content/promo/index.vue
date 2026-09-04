<template>
  <div class="mod-promo">
    <el-form :inline="true" :model="searchForm" @keyup.enter="getDataList()">
      <el-form-item>
        <el-input
          v-model="searchForm.key"
          placeholder="标题/描述"
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
          v-perms="'content:promo:delete'"
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
      <el-table-column label="促销标题" min-width="220">
        <template #default="scope">
          🎆 {{ scope.row.title1 }} · {{ scope.row.title2 }}
        </template>
      </el-table-column>
      <el-table-column
        prop="description"
        label="促销描述"
        min-width="260"
        :show-overflow-tooltip="true"
      />
      <el-table-column prop="code" label="优惠码" width="130" align="center" />
      <el-table-column label="按钮" width="150" align="center">
        <template #default="scope">
          {{ scope.row.btnText }}（{{ scope.row.btnLink }}）
        </template>
      </el-table-column>
      <el-table-column prop="sort" label="排序" width="70" align="center" />
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
            v-perms="'content:promo:update'"
          >
            修改
          </el-button>
          <el-button
            size="small"
            type="danger"
            @click="deleteHandle(scope.row.id)"
            v-perms="'content:promo:delete'"
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
      :title="!dataForm.id ? '新增大促' : '修改大促'"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form :model="dataForm" label-width="90px">
        <el-form-item label="主标题1" required>
          <el-input
            v-model="dataForm.title1"
            placeholder="如：618 星际狂欢节"
          />
        </el-form-item>
        <el-form-item label="主标题2" required>
          <el-input v-model="dataForm.title2" placeholder="如：全场低至 1 折" />
        </el-form-item>
        <el-form-item label="促销描述">
          <el-input
            v-model="dataForm.description"
            type="textarea"
            :rows="2"
            placeholder="如：新用户注册立得 ¥888 星元 · 满 5000 减 800 上不封顶"
          />
        </el-form-item>
        <el-form-item label="优惠码">
          <el-input v-model="dataForm.code" placeholder="如：NEBULA-618" />
        </el-form-item>
        <el-form-item label="按钮文案">
          <el-input v-model="dataForm.btnText" placeholder="如：立即抢购 ⟶" />
        </el-form-item>
        <el-form-item label="跳转链接">
          <el-input v-model="dataForm.btnLink" placeholder="如：/list" />
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
  reqPromoList,
  reqPromoInfo,
  reqPromoSave,
  reqPromoUpdate,
  reqPromoDelete,
} from '@/api/content/promo'

const searchForm = ref({ key: '', status: '' })
const pageIndex = ref(1)
const pageSize = ref(10)
const totalPage = ref(0)
const dataList = ref<any[]>([])
const dataListLoading = ref(false)
const dataListSelections = ref<any[]>([])
const dataForm = ref({
  id: 0,
  title1: '',
  title2: '',
  description: '',
  code: '',
  btnText: '',
  btnLink: '',
  status: 1,
  sort: 0,
})
const dialogVisible = ref(false)

const getDataList = async (pager = 1) => {
  pageIndex.value = pager
  dataListLoading.value = true
  try {
    const response = await reqPromoList(
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
    const res = await reqPromoUpdate({ id: row.id, status: row.status })
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
    const res = await reqPromoDelete(ids)
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
    title1: '',
    title2: '',
    description: '',
    code: '',
    btnText: '',
    btnLink: '',
    status: 1,
    sort: 0,
  }
  dialogVisible.value = true
  if (id) {
    try {
      const response = await reqPromoInfo(id)
      if (response && response.code === 200) {
        const d = response.data
        dataForm.value = {
          id: d.id,
          title1: d.title1 || '',
          title2: d.title2 || '',
          description: d.description || '',
          code: d.code || '',
          btnText: d.btnText || '',
          btnLink: d.btnLink || '',
          status: d.status ?? 1,
          sort: d.sort ?? 0,
        }
      }
    } catch (error) {
      console.error('大促信息获取失败', error)
    }
  }
}

const dataFormSubmit = async () => {
  if (!dataForm.value.title1.trim() || !dataForm.value.title2.trim()) {
    ElMessage.warning('请填写促销主标题')
    return
  }
  const payload = {
    id: dataForm.value.id || undefined,
    title1: dataForm.value.title1.trim(),
    title2: dataForm.value.title2.trim(),
    description: dataForm.value.description.trim(),
    code: dataForm.value.code.trim(),
    btnText: dataForm.value.btnText.trim(),
    btnLink: dataForm.value.btnLink.trim(),
    status: dataForm.value.status,
    sort: dataForm.value.sort,
  }
  try {
    const res = dataForm.value.id
      ? await reqPromoUpdate(payload)
      : await reqPromoSave(payload)
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
