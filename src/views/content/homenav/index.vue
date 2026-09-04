<template>
  <div class="mod-homenav">
    <el-form :inline="true" :model="searchForm" @keyup.enter="getDataList()">
      <el-form-item>
        <el-input
          v-model="searchForm.key"
          placeholder="名称"
          clearable
          style="width: 14rem"
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
      <el-table-column prop="icon" label="图标" width="80" align="center" />
      <el-table-column
        prop="name"
        label="名称"
        min-width="140"
        align="center"
      />
      <el-table-column label="跳转链接" min-width="220">
        <template #default="scope">
          <el-link
            v-if="scope.row.link"
            :href="scope.row.link"
            :target="isExternal(scope.row.link) ? '_blank' : undefined"
            type="primary"
            :underline="false"
          >
            {{ scope.row.link }}
          </el-link>
          <span v-else class="dim-tip">空=按名称跳列表筛选</span>
        </template>
      </el-table-column>
      <el-table-column label="标签" width="110" align="center">
        <template #default="scope">
          <el-tag
            v-if="scope.row.tag || Number(scope.row.hot) === 1"
            size="small"
            :style="{
              background:
                scope.row.tagColor ||
                'linear-gradient(135deg, #39ff88, #00f0ff)',
              borderColor: 'transparent',
              color: '#02101a',
            }"
          >
            {{ scope.row.tag || 'HOT' }}
          </el-tag>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column prop="sort" label="排序" width="70" align="center" />
      <el-table-column label="状态" width="90" align="center">
        <template #default="scope">
          <el-switch
            v-model="scope.row.showStatus"
            :active-value="1"
            :inactive-value="0"
            @change="updateStatus(scope.row)"
          />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150" align="center">
        <template #default="scope">
          <el-button size="small" @click="addOrUpdateHandle(scope.row.id)">
            修改
          </el-button>
          <el-button
            size="small"
            type="danger"
            @click="deleteHandle(scope.row.id)"
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
      :title="!dataForm.id ? '新增快捷导航' : '修改快捷导航'"
      width="560px"
      :close-on-click-modal="false"
    >
      <el-form :model="dataForm" label-width="110px">
        <el-form-item label="名称" required>
          <el-input
            v-model="dataForm.name"
            placeholder="如：全息设备 / 新品首发"
          />
        </el-form-item>
        <el-form-item label="图标" required>
          <el-popover
            placement="bottom-start"
            trigger="hover"
            :show-after="0"
            :hide-after="0"
            :transition="''"
            :width="iconPopoverWidth"
            popper-class="mod-homenav__icon-popover"
            @after-enter="syncIconPopoverWidth"
          >
            <div class="mod-homenav__icon-list">
              <el-button
                v-for="o in ICON_OPTIONS"
                :key="o.glyph"
                :class="{ 'is-active': dataForm.icon === o.glyph }"
                :title="o.label"
                @click="dataForm.icon = o.glyph"
              >
                {{ o.glyph }}
              </el-button>
            </div>
            <template #reference>
              <el-input
                ref="iconInputRef"
                v-model="dataForm.icon"
                readonly
                placeholder="点击选择图标"
                class="homenav-icon-input"
              />
            </template>
          </el-popover>
        </el-form-item>
        <el-form-item label="跳转链接">
          <el-input
            v-model="dataForm.link"
            placeholder="空=按名称跳列表筛选，链接例子：https://www.xxx.com"
          />
        </el-form-item>
        <el-form-item label="标签">
          <el-input
            v-model="dataForm.tag"
            placeholder="留空=不显示；如 HOT / 新品 / 爆款"
          />
        </el-form-item>
        <el-form-item label="标签颜色">
          <div class="tag-color-row">
            <span
              v-for="c in TAG_COLORS"
              :key="c.value"
              class="tag-color-dot"
              :class="{ on: dataForm.tagColor === c.value }"
              :style="{ background: c.value }"
              :title="c.label"
              @click="dataForm.tagColor = c.value"
            ></span>
            <el-tag
              size="small"
              :style="{
                background:
                  dataForm.tagColor ||
                  'linear-gradient(135deg, #39ff88, #00f0ff)',
                borderColor: 'transparent',
                color: '#02101a',
              }"
            >
              {{ dataForm.tag || '预览' }}
            </el-tag>
          </div>
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="dataForm.sort" :min="0" />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch
            v-model="dataForm.showStatus"
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
  reqHomeNavList,
  reqHomeNavInfo,
  reqHomeNavSave,
  reqHomeNavUpdate,
  reqHomeNavDelete,
} from '@/api/content/homenav'

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
  icon: '',
  link: '',
  hot: 0,
  tag: '',
  tagColor: '',
  sort: 0,
  showStatus: 1,
})
const dialogVisible = ref(false)

// 图标选择弹框宽度：与触发输入框等宽（参考菜单管理菜单图标）
const iconInputRef = ref()
const iconPopoverWidth = ref(280)
const syncIconPopoverWidth = () => {
  const input = iconInputRef.value?.$el
  if (!input) return
  const w = input.offsetWidth
  if (w && w !== iconPopoverWidth.value) {
    iconPopoverWidth.value = w
  }
}

const isExternal = (url: string) => /^https?:\/\//i.test(url)

// 图标预设（支持输入自定义字符）
const ICON_OPTIONS = [
  { glyph: '⌬', label: '全息设备' },
  { glyph: '◈', label: '量子计算' },
  { glyph: '⬡', label: '机甲外骨骼' },
  { glyph: '✦', label: '神经接口' },
  { glyph: '◉', label: '智能义体' },
  { glyph: '✧', label: '太空装备' },
  { glyph: '⚡', label: '能量补给' },
  { glyph: '▸', label: '新品/箭头' },
  { glyph: '🛸', label: '星舰' },
  { glyph: '🚀', label: '火箭' },
  { glyph: '🧠', label: '大脑' },
  { glyph: '🛡', label: '盾牌' },
  { glyph: '♻', label: '循环' },
  { glyph: '⚙', label: '齿轮' },
  { glyph: '🔥', label: '火焰' },
  { glyph: '★', label: '星标' },
  { glyph: '☄', label: '彗星' },
  { glyph: '🌌', label: '银河' },
  { glyph: '♥', label: '心形' },
]
const TAG_COLORS = [
  { label: '绿', value: 'linear-gradient(135deg, #39ff88, #00f0ff)' },
  { label: '红', value: 'linear-gradient(135deg, #ff2e63, #ff7eb3)' },
  { label: '橙', value: 'linear-gradient(135deg, #ff9f1a, #ffd166)' },
  { label: '蓝', value: 'linear-gradient(135deg, #3d7bff, #00d4ff)' },
  { label: '紫', value: 'linear-gradient(135deg, #a855f7, #ff2ec4)' },
  { label: '青', value: 'linear-gradient(135deg, #00f0ff, #3d7bff)' },
  { label: '粉', value: 'linear-gradient(135deg, #ff7eb3, #ff2e63)' },
]

const getDataList = async (pager = 1) => {
  pageIndex.value = pager
  dataListLoading.value = true
  try {
    const response = await reqHomeNavList(
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
    const res = await reqHomeNavUpdate({
      id: row.id,
      showStatus: row.showStatus,
    })
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
    const res = await reqHomeNavDelete(ids)
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
    icon: '',
    link: '',
    hot: 0,
    tag: '',
    tagColor: '',
    sort: 0,
    showStatus: 1,
  }
  dialogVisible.value = true
  if (id) {
    try {
      const response = await reqHomeNavInfo(id)
      if (response && response.code === 200) {
        const d = response.data
        dataForm.value = {
          id: d.id,
          name: d.name || '',
          icon: d.icon || '',
          link: d.link || '',
          hot: Number(d.hot ?? 0),
          tag: d.tag || '',
          tagColor: d.tagColor || '',
          sort: d.sort ?? 0,
          showStatus: d.showStatus ?? 1,
        }
      }
    } catch (error) {
      console.error('快捷导航信息获取失败', error)
    }
  }
}

const dataFormSubmit = async () => {
  if (!dataForm.value.name.trim() || !dataForm.value.icon.trim()) {
    ElMessage.warning('请填写名称与图标')
    return
  }
  const payload = {
    id: dataForm.value.id || undefined,
    name: dataForm.value.name.trim(),
    icon: dataForm.value.icon.trim(),
    // 空串而非 null：updateById 会忽略 null 字段，传 null 修改时清不掉旧链接
    link: dataForm.value.link.trim(),
    hot: dataForm.value.hot,
    tag: dataForm.value.tag.trim(),
    tagColor: dataForm.value.tagColor,
    sort: dataForm.value.sort,
    showStatus: dataForm.value.showStatus,
  }
  try {
    const res = dataForm.value.id
      ? await reqHomeNavUpdate(payload)
      : await reqHomeNavSave(payload)
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

<style scoped>
.dim-tip {
  color: var(--el-text-color-secondary);
  font-size: 12px;
}
.tag-color-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.tag-color-dot {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  cursor: pointer;
  border: 2px solid transparent;
  transition: 0.2s;
}
.tag-color-dot:hover {
  transform: scale(1.15);
}
.tag-color-dot.on {
  border-color: #fff;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.4);
}
</style>

<!-- 图标选择弹框（popper 挂在 body 下，需全局样式；参考菜单管理菜单图标选择器） -->
<style>
.mod-homenav__icon-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(48px, 1fr));
  gap: 8px;
  max-height: 240px;
  overflow-y: auto;
}
.mod-homenav__icon-list .el-button {
  margin-left: 0;
  width: 100%;
  height: 40px;
  padding: 0;
  font-size: 18px;
}
.mod-homenav__icon-list .el-button.is-active {
  border-color: var(--el-color-primary);
  color: var(--el-color-primary);
  background-color: var(--el-color-primary-light-9);
}
.mod-homenav__icon-list .el-button:hover {
  border-color: var(--el-color-primary);
  color: var(--el-color-primary);
}
</style>
