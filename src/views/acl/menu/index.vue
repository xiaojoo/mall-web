<template>
  <div class="mod-menu">
    <el-form :inline="true" :model="dataForm">
      <el-form-item>
        <el-button
          type="primary"
          @click="addOrUpdateHandle()"
          v-perms="'sys:menu:save'"
        >
          新增
        </el-button>
      </el-form-item>
      <el-form-item>
        <el-input
          v-model="searchKeyword"
          placeholder="搜索菜单名称 / URL / 授权标识"
          clearable
          style="width: 280px"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </el-form-item>
    </el-form>

    <el-table
      ref="tableRef"
      :data="filteredData"
      row-key="menuId"
      border
      style="width: 100%"
      :empty-text="searchKeyword ? '未找到匹配的菜单' : '暂无数据'"
    >
      <el-table-column
        prop="name"
        header-align="center"
        min-width="150"
        label="名称"
      ></el-table-column>
      <el-table-column
        prop="parentName"
        header-align="center"
        align="center"
        width="120"
        label="上级菜单"
      ></el-table-column>
      <el-table-column header-align="center" align="center" label="图标">
        <template #default="scope">
          <el-icon v-if="scope.row.icon" :size="18">
            <component :is="resolveMenuIcon(scope.row.icon)" />
          </el-icon>
        </template>
      </el-table-column>
      <el-table-column
        prop="type"
        header-align="center"
        align="center"
        label="类型"
      >
        <template #default="scope">
          <el-tag v-if="scope.row.type === 0" size="small">目录</el-tag>
          <el-tag v-else-if="scope.row.type === 1" size="small" type="success">
            菜单
          </el-tag>
          <el-tag v-else-if="scope.row.type === 2" size="small" type="info">
            按钮
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="orderNum"
        header-align="center"
        align="center"
        label="排序号"
      ></el-table-column>
      <el-table-column
        prop="url"
        header-align="center"
        align="center"
        width="150"
        :show-overflow-tooltip="true"
        label="菜单URL"
      ></el-table-column>
      <el-table-column
        prop="perms"
        header-align="center"
        align="center"
        width="150"
        :show-overflow-tooltip="true"
        label="授权标识"
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
            size="small"
            @click="addOrUpdateHandle(scope.row.menuId)"
            v-perms="'sys:menu:update'"
          >
            修改
          </el-button>
          <el-button
            size="small"
            @click="deleteHandle(scope.row.menuId)"
            v-perms="'sys:menu:delete'"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <Add
      v-model="addOrUpdateVisible"
      ref="addOrUpdate"
      @refreshDataList="getDataList"
    ></Add>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from 'vue'

import { Search } from '@element-plus/icons-vue'
import Add from './add.vue'
import { reqMenuDelete, reqMenuList } from '@/api/acl'
import { treeDataTranslate } from '@/utils/token.ts'
import { resolveMenuIcon } from '@/utils/menuIcons'

const dataForm = ref({
  userName: '',
})
const dataList = ref([])
const dataListLoading = ref(false)
const dataListSelections = ref<any[]>([])
const addOrUpdateVisible = ref(false)

const addOrUpdate = ref()
const tableRef = ref()

// ===== 菜单搜索：命中节点 + 其全部后代 + 祖先链路，命中后自动展开 =====
const searchKeyword = ref('')

function filterMenuTree(list: any[], kw: string): any[] {
  if (!kw) return list
  const k = kw.trim().toLowerCase()
  const result: any[] = []
  for (const node of list || []) {
    const hit = [node.name, node.url, node.perms].some(
      (v) => v != null && String(v).toLowerCase().includes(k),
    )
    if (hit) {
      // 命中：整棵子树保留（展开后能看到其下所有子菜单）
      result.push(node)
    } else if (node.children && node.children.length > 0) {
      const sub = filterMenuTree(node.children, k)
      if (sub.length > 0) {
        // 后代命中：保留祖先链路
        result.push({ ...node, children: sub })
      }
    }
  }
  return result
}

const filteredData = computed(() =>
  filterMenuTree(dataList.value, searchKeyword.value),
)

// 搜索时自动展开所有可见节点；清空搜索恢复完整树
watch(filteredData, async () => {
  await nextTick()
  if (!searchKeyword.value.trim() || !tableRef.value) return
  const rows: any[] = []
  const walk = (list: any[]) => {
    for (const r of list || []) {
      rows.push(r)
      walk(r.children)
    }
  }
  walk(filteredData.value)
  rows.forEach((r) => tableRef.value.toggleRowExpansion(r, true))
})

const getDataList = async () => {
  dataListLoading.value = true
  try {
    const response = await reqMenuList()
    if (response) {
      // 后端 list 不返回 parentName，前端按 parentId 补齐上级菜单名
      const nameById = new Map(
        response.map((m: any) => [String(m.menuId), m.name]),
      )
      response.forEach((m: any) => {
        m.parentName = (m.parentId && nameById.get(String(m.parentId))) || ''
      })
      dataList.value = treeDataTranslate(response, 'menuId')
      dataListLoading.value = false
    } else {
      ElMessage.error('菜单获取失败')
    }
    dataListLoading.value = false
  } catch (error) {
    console.error(error)
  }
}

// 删除
const deleteHandle = async (id?: number) => {
  const ids = id ? [id] : dataListSelections.value.map((item) => item.id)
  try {
    await ElMessageBox.confirm(
      `确定对[id=${ids.join(',')}]进行[${id ? '删除' : '批量删除'}]操作?`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      },
    )
    const response = await reqMenuDelete(ids)
    if (response && response.code === 0) {
      ElMessage({
        type: 'success',
        message: '菜单删除成功',
        duration: 1500,
        onClose: () => {
          getDataList()
        },
      })
    } else {
      ElMessage.error(response.message || response.msg || '操作失败')
    }
  } catch (error) {
    ElMessage.info('已取消菜单删除')
  }
}

// 新增/修改
const addOrUpdateHandle = (id?: any) => {
  addOrUpdateVisible.value = true
  nextTick(() => {
    addOrUpdate.value?.init(id)
  })
}

onMounted(() => {
  getDataList()
})
</script>

<style scoped lang="scss"></style>
