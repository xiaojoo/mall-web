<template>
  <el-card class="box-card">
    <el-row :gutter="20" class="gutter_row">
      <el-col :span="6">
        <el-input
          placeholder="输入关键字进行过滤"
          v-model="filterText"
        ></el-input>
      </el-col>
      <el-col :span="4">
        <el-switch
          class="custom-tree-node1"
          v-model="draggable"
          active-text="开启拖拽"
          inactive-text="关闭拖拽"
        />
      </el-col>
      <el-col :span="14" class="col-content-right">
        <el-button v-if="draggable" @click="batchSave">批量保存</el-button>
        <el-button
          type="danger"
          @click="batchDelete"
          v-perms="'product:category:delete'"
        >
          批量删除
        </el-button>
      </el-col>
    </el-row>
    <el-tree
      :data="menus"
      :props="defaultProps"
      :expand-on-click-node="false"
      :default-expanded-keys="expandedKey"
      node-key="catId"
      show-checkbox
      :draggable="draggable"
      :allow-drop="allowDrop"
      @node-drop="handleDrop"
      :filter-node-method="filterNode"
      ref="menuTree"
    >
      <template #default="{ node, data }">
        <span class="custom-tree-node">
          <span>{{ node.label }}</span>
          <span>
            <el-button
              v-if="node.level <= 2"
              type="primary"
              link
              @click="append(data)"
            >
              添加
            </el-button>
            <el-button
              type="primary"
              link
              @click="edit(data)"
              v-perms="'product:category:update'"
            >
              修改
            </el-button>
            <el-button
              v-if="node.childNodes.length == 0"
              type="danger"
              link
              @click="remove(node, data)"
              v-perms="'product:category:delete'"
            >
              删除
            </el-button>
          </span>
        </span>
      </template>
    </el-tree>
    <el-dialog
      v-model="dialogVisible"
      width="30%"
      :title="title"
      :close-on-click-modal="false"
    >
      <el-form :model="category">
        <el-form-item label="分类名称" :label-width="formLabelWidth">
          <el-input v-model="category.name" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="分类图标" :label-width="formLabelWidth">
          <el-input v-model="category.icon" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="计量单位" :label-width="formLabelWidth">
          <el-input
            v-model="category.productUnit"
            autocomplete="off"
          ></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitData()">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </el-card>
</template>
<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue'

import type { UpdateNode } from '@/api/product/category/type.ts'
import {
  reqCategoryList,
  reqAddCategory,
  reqUpdateCategory,
  reqCategoryCatIdInfo,
  reqDeleteCategory,
  reqSortCategory,
} from '@/api/product/category'

interface Tree {
  id: number
  label: string
  children?: Tree[]
}

const filterText = ref('')
const draggable = ref(false)
const updateNodes = ref<UpdateNode[]>([])
const maxLevel = ref(0)
const title = ref('')
const dialogType = ref('')
const category = reactive({
  catId: null,
  name: '',
  parentCid: 0,
  catLevel: 0,
  showStatus: 1,
  sort: 0,
  icon: '',
  productUnit: '',
})
const menus = ref<Tree[]>([])
const defaultProps = {
  children: 'children',
  label: 'name',
}
const expandedKey = ref<number[]>([])
const dialogVisible = ref(false)
const formLabelWidth = ref('120px')
const state = reactive({
  pCid: [] as number[],
  updateNodes: [] as UpdateNode[],
})

const getMenus = async () => {
  try {
    const response = await reqCategoryList()
    menus.value = response.data
  } catch (error) {
    console.error(error)
  }
}

// 添加分类数据组装
const append = (data: any) => {
  dialogVisible.value = true
  category.catId = null
  category.name = ''
  category.icon = ''
  category.productUnit = ''
  category.sort = 0
  category.showStatus = 1
  dialogType.value = 'add'
  title.value = '添加分类'
  category.parentCid = data.catId
  category.catLevel = data.catLevel * 1 + 1
}

// 修改分类数据组装
const edit = async (data: any) => {
  dialogVisible.value = true
  dialogType.value = 'edit'
  title.value = '修改分类'
  try {
    const response = await reqCategoryCatIdInfo(data.catId)
    category.name = response.data.name
    category.catId = response.data.catId
    category.icon = response.data.icon
    category.parentCid = response.data.parentCid
    category.productUnit = response.data.productUnit
  } catch (error) {
    console.error(error)
  }
}

// 删除分类数据
const remove = async (node: any, data: { catId: null; name: string }) => {
  const ids = [data.catId]
  const name = data.name
  try {
    await ElMessageBox.confirm(`是否删除【${name}】菜单？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    const response = await reqDeleteCategory(ids)
    if (response && response.code === 200) {
      ElMessage({
        type: 'success',
        message: '删除成功',
      })
      await getMenus()
      expandedKey.value = [node.parent.data.catId]
    } else {
      ElMessage.error(response.msg)
    }
  } catch (error) {
    ElMessage.info('已取消删除')
  }
}

const menuTree = ref()

// 批量删除
const batchDelete = async () => {
  const catIds = []
  const catNames = []
  const parentCids = []
  const checkedNodes = menuTree.value.getCheckedNodes()
  for (let i = 0; i < checkedNodes.length; i++) {
    catIds.push(checkedNodes[i].catId)
    catNames.push(checkedNodes[i].name)
    parentCids.push(checkedNodes[i].parentCid)
  }
  try {
    await ElMessageBox.confirm(`是否批量删除【${catNames}】菜单？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    const response = await reqDeleteCategory(catIds)
    if (response && response.code === 200) {
      ElMessage({
        type: 'success',
        message: '菜单批量删除成功',
      })
      await getMenus()
      expandedKey.value = parentCids
    } else {
      ElMessage.error(response.msg)
    }
  } catch (error) {
    ElMessage.info('已取消菜单批量删除')
  }
}

// 添加、修改菜单
const submitData = () => {
  if (dialogType.value === 'add') {
    addCategory()
  }
  if (dialogType.value === 'edit') {
    editCategory()
  }
}

// 添加菜单
const addCategory = async () => {
  const { name, parentCid, catLevel, showStatus, sort, icon, productUnit } =
    category
  try {
    await reqAddCategory(
      name,
      parentCid,
      catLevel,
      showStatus,
      sort,
      icon,
      productUnit,
    )
    ElMessage.success('分类添加成功')
    dialogVisible.value = false
    await getMenus()
    expandedKey.value = [category.parentCid]
  } catch (error) {
    console.error(error)
  }
}

// 修改菜单
const editCategory = async () => {
  const { catId, name, icon, productUnit } = category
  try {
    const response: any = await reqUpdateCategory(
      catId,
      name,
      icon,
      productUnit,
    )
    if (response && response.code === 200) {
      ElMessage.success('分类修改成功')
      dialogVisible.value = false
      await getMenus()
      expandedKey.value = [category.parentCid]
    } else {
      ElMessage.error(response?.message || response?.msg || '分类修改失败')
    }
  } catch (error) {
    console.error(error)
    ElMessage.error('分类修改失败')
  }
}

// 菜单搜索
watch(filterText, (val) => {
  menuTree.value!.filter(val)
})

const filterNode = (value: any, data: any) => {
  if (!value) return true
  return data.name.indexOf(value) !== -1
}

// 拖拽排序
const allowDrop = (draggingNode: any, dropNode: any, type: any) => {
  maxLevel.value = draggingNode.level
  countNodeLevel(draggingNode)
  const draggingDepth = Math.abs(maxLevel.value - draggingNode.level) + 1
  if (type === 'inner') {
    return draggingDepth + dropNode.level <= 3
  } else {
    return draggingDepth + dropNode.parent.level <= 3
  }
}

const countNodeLevel = (node: any) => {
  // 遍历所有子节点，计算出最大深度
  if (node.childNodes != null && node.childNodes.length > 0) {
    for (let i = 0; i < node.childNodes.length; i++) {
      const childNode = node.childNodes[i]
      if (childNode.level > maxLevel.value) {
        maxLevel.value = childNode.level
      }
      countNodeLevel(childNode)
    }
  }
}

const handleDrop = (draggingNode: any, dropNode: any, dropType: any) => {
  let pCid
  let siblings
  if (dropType === 'before' || dropType === 'after') {
    pCid =
      dropNode.parent.data.catId === undefined ? 0 : dropNode.parent.data.catId
    siblings = dropNode.parent.childNodes
  } else {
    pCid = dropNode.data.catId
    siblings = dropNode.childNodes
  }
  state.pCid.push(pCid)

  for (let i = 0; i < siblings.length; i++) {
    if (siblings[i].data.catId === draggingNode.data.catId) {
      let catLevel = draggingNode.level
      if (siblings[i].level !== draggingNode.level) {
        catLevel = siblings[i].level
        updateChildNodeLevel(siblings[i])
      }
      state.updateNodes.push({
        catId: siblings[i].data.catId,
        sort: i,
        parentCid: pCid,
        catLevel: catLevel,
      })
    } else {
      state.updateNodes.push({
        catId: siblings[i].data.catId,
        sort: i,
        parentCid: pCid,
        catLevel: siblings[i].level,
      })
    }
  }
  return true
}

const updateChildNodeLevel = (node: any) => {
  if (node.childNodes.length > 0) {
    for (let i = 0; i < node.childNodes.length; i++) {
      const cNode = node.childNodes[i].data
      state.updateNodes.push({
        catId: cNode.catId,
        catLevel: node.childNodes[i].level,
        parentCid: node.data.catId,
        sort: i,
      })
      updateChildNodeLevel(node.childNodes[i])
    }
  }
}

// 批量保存
const batchSave = async () => {
  try {
    await ElMessageBox.confirm(`是否批量分类排序？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    const response = await reqSortCategory(state.updateNodes)
    if (response && response.code === 200) {
      ElMessage({
        type: 'success',
        message: '菜单批量删除成功',
      })
      await getMenus()
      expandedKey.value = state.pCid
      updateNodes.value = []
      maxLevel.value = 0
    } else {
      ElMessage.error(response.msg)
    }
  } catch (error) {
    ElMessage.info('已取消菜单批量删除')
  }
}

onMounted(() => {
  getMenus()
})
</script>

<style scoped lang="scss">
.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.875rem;
}

.gutter_row {
  padding: 1rem 0;
}

.col-content-right {
  text-align: right;
}
</style>
