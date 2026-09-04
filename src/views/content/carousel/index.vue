<template>
  <div class="mod-carousel">
    <el-form :inline="true" :model="dataForm" @keyup.enter="getDataList()">
      <el-form-item>
        <el-input
          v-model="searchForm.key"
          placeholder="轮播名称"
          clearable
          style="width: 15rem"
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
          v-perms="'content:carousel:delete'"
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
      <el-table-column prop="name" label="轮播名称" min-width="120" />
      <el-table-column prop="theme" label="主题" width="80" align="center">
        <template #default="scope">
          <el-tag size="small">{{ scope.row.theme || '-' }}</el-tag>
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
            v-perms="'content:carousel:update'"
          >
            修改
          </el-button>
          <el-button
            size="small"
            type="danger"
            @click="deleteHandle(scope.row.id)"
            v-perms="'content:carousel:delete'"
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
      :title="!dataForm.id ? '新增轮播' : '修改轮播'"
      width="720px"
      :close-on-click-modal="false"
    >
      <el-form :model="dataForm" label-width="90px">
        <el-form-item label="轮播名称" required>
          <el-input v-model="dataForm.name" placeholder="如：AI智选" />
        </el-form-item>
        <el-form-item label="主题" required>
          <el-select v-model="dataForm.theme" style="width: 200px">
            <el-option label="s1（AI智选·青）" value="s1" />
            <el-option label="s2（秒杀·红）" value="s2" />
            <el-option label="s3（会员·紫）" value="s3" />
          </el-select>
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
        <el-form-item label="内容JSON">
          <div style="width: 100%">
            <el-input
              v-model="dataForm.content"
              type="textarea"
              :rows="12"
              placeholder='{"kicker":"顶部小字","title":"主标题1","highlight1":"高亮词1","title2":"主标题2","highlight2":"高亮词2","sub":"描述","buttons":[{"text":"按钮","type":"primary","link":"/list"}],"stats":[{"num":"1","unit":"","label":""}],"chips":[{"pos":"a","text":""}],"price":{"label":"","value":"","decimals":""}}'
            />
            <div style="margin-top: 8px; display: flex; gap: 8px">
              <el-button size="small" @click="formatContent">格式化</el-button>
              <el-button size="small" link type="primary" @click="fillSample">
                填入示例
              </el-button>
              <span
                v-if="contentValid === false"
                style="color: var(--el-color-danger); font-size: 12px"
              >
                JSON 格式错误
              </span>
            </div>
          </div>
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
  reqCarouselList,
  reqCarouselInfo,
  reqCarouselSave,
  reqCarouselUpdate,
  reqCarouselDelete,
} from '@/api/content/carousel'

const searchForm = ref({ key: '', status: '' })
const pageIndex = ref(1)
const pageSize = ref(10)
const totalPage = ref(0)
const dataList = ref<any[]>([])
const dataListLoading = ref(false)
const dataListSelections = ref<any[]>([])
const dataForm = ref({
  id: 0,
  name: '',
  theme: 's1',
  status: 1,
  sort: 0,
  content: '',
})
const dialogVisible = ref(false)
const contentValid = ref<boolean | null>(null)

const getDataList = async (pager = 1) => {
  pageIndex.value = pager
  dataListLoading.value = true
  try {
    const response = await reqCarouselList(
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
    const res = await reqCarouselUpdate({ id: row.id, status: row.status })
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
    const res = await reqCarouselDelete(ids)
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
    name: '',
    theme: 's1',
    status: 1,
    sort: 0,
    content: '',
  }
  contentValid.value = null
  dialogVisible.value = true
  if (id) {
    try {
      const response = await reqCarouselInfo(id)
      if (response && response.code === 200) {
        const d = response.data
        dataForm.value = {
          id: d.id,
          name: d.name || '',
          theme: d.theme || 's1',
          status: d.status ?? 1,
          sort: d.sort ?? 0,
          content: d.content
            ? JSON.stringify(JSON.parse(d.content), null, 2)
            : '',
        }
      }
    } catch (error) {
      console.error('轮播信息获取失败', error)
    }
  }
}

// 格式化 JSON（带校验）
const formatContent = () => {
  try {
    dataForm.value.content = JSON.stringify(
      JSON.parse(dataForm.value.content),
      null,
      2,
    )
    contentValid.value = true
  } catch (e) {
    contentValid.value = false
    ElMessage.error('JSON 格式错误')
  }
}

const fillSample = () => {
  dataForm.value.content = JSON.stringify(
    {
      kicker: '◢ NEURAL-SHOPPING ONLINE · AI 智选已上线 ◣',
      title: '未来已至 · ',
      highlight1: '银河级',
      title2: '智能购物体验',
      highlight2: '全息启动',
      sub: '接入<b>量子推荐引擎</b>，3 秒生成专属购物矩阵。',
      buttons: [
        { text: '立即探索 ⟶', type: 'primary', link: '/list' },
        { text: '▶ 观看全息演示', type: 'ghost', link: '' },
      ],
      stats: [
        { num: '2.4', unit: '亿+', label: '注册星际用户' },
        { num: '98', unit: '%', label: 'AI 推荐精准度' },
      ],
      chips: [
        { pos: 'a', text: '◈ QUANTUM CORE 量子核心' },
        { pos: 'b', text: '✓ 已接入星域网 · 信号满格' },
      ],
      price: { label: '限时首发', value: '9,999', decimals: '.00' },
    },
    null,
    2,
  )
  contentValid.value = true
}

const dataFormSubmit = async () => {
  // 校验 JSON
  let content = dataForm.value.content
  try {
    JSON.parse(content)
    contentValid.value = true
  } catch (e) {
    contentValid.value = false
    ElMessage.error('内容 JSON 格式错误')
    return
  }
  if (!dataForm.value.name.trim()) {
    ElMessage.warning('请填写轮播名称')
    return
  }
  const payload = {
    id: dataForm.value.id || undefined,
    name: dataForm.value.name.trim(),
    theme: dataForm.value.theme,
    status: dataForm.value.status,
    sort: dataForm.value.sort,
    content,
  }
  try {
    const res = dataForm.value.id
      ? await reqCarouselUpdate(payload)
      : await reqCarouselSave(payload)
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
