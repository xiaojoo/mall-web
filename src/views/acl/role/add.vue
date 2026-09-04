<template>
  <el-dialog
    :model-value="modelValue"
    @update:model-value="updateVisible"
    :close-on-click-modal="false"
    :title="button"
  >
    <el-form
      :model="dataForm"
      @keyup.enter="dataFormSubmit()"
      label-width="80px"
    >
      <el-form-item label="角色名称" prop="roleName">
        <el-input v-model="dataForm.roleName" placeholder="角色名称" />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="dataForm.remark" placeholder="备注" />
      </el-form-item>
      <el-form-item size="small" label="授权">
        <el-tree
          ref="treeRef"
          :data="menuList"
          :props="menuListTreeProps"
          node-key="menuId"
          :default-expand-all="false"
          :default-expanded-keys="expandedKeys"
          show-checkbox
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="dataFormSubmit()">
          {{ button }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { nextTick, ref } from 'vue'

import { reqMenuList, reqRoleInfo, reqRoleUpdateCommit } from '@/api/acl'
import { treeDataTranslate } from '@/utils/token.ts'

const dataForm = ref({
  id: 0,
  roleName: '',
  remark: '',
  menuIdList: [],
})
const button = ref('添加')
const menuList = ref([])
const treeRef = ref()
const expandedKeys = ref([])
const menuListTreeProps = ref({
  label: 'name',
  children: 'children',
})

defineProps(['modelValue'])

const emit = defineEmits(['update:modelValue'])

const updateVisible = (value: boolean) => {
  emit('update:modelValue', value)
}

// 处理取消按钮点击
const handleCancel = () => {
  updateVisible(false)
}

const dataFormSubmit = async () => {
  try {
    const response = await reqRoleUpdateCommit(
      dataForm.value.id > 0 ? 'update' : 'save',
      dataForm.value.id,
      dataForm.value.roleName,
      dataForm.value.remark,
      [
        ...treeRef.value.getCheckedKeys(),
        ...treeRef.value.getHalfCheckedKeys(),
      ],
    )
    if (response.code === 0) {
      ElMessage.success(`角色${button.value}成功`)
    } else {
      ElMessage.error(response.message || response.msg || '操作失败')
    }
  } catch (error) {
    console.error(`角色${button.value}失败`, error)
  }
}

const init = async (id: number) => {
  button.value = id > 0 ? '修改' : '添加'
  await menuSelect()
  await nextTick(async () => {
    dataForm.value.id = 0
    dataForm.value.roleName = ''
    dataForm.value.remark = ''
    expandedKeys.value = []
    treeRef.value.setCheckedKeys([])
    if (id > 0) {
      try {
        const response = await reqRoleInfo(id)
        if (response.code === 0 && response.role) {
          const { roleName, remark, menuIdList: rawMenuIdList } = response.role
          // 后端 Long 转字符串数组（雪花 ID 精度 + 与 node-key 匹配），剔除占位符 -666666
          const menuIdList = (rawMenuIdList || [])
            .map(String)
            .filter((mid: string) => mid !== '-666666')
          dataForm.value = {
            id,
            roleName,
            remark,
            menuIdList,
          }
          // 只勾选叶子节点（父级交给 el-tree 级联自动半选/全选），
          // 避免勾选父级时级联误选未授权的子菜单导致权限膨胀
          const parentIdSet = new Set<string>()
          const collectParentIds = (nodes: any[]) => {
            for (const n of nodes) {
              if (n.children && n.children.length) {
                parentIdSet.add(String(n.menuId))
                collectParentIds(n.children)
              }
            }
          }
          collectParentIds(menuList.value)
          const leafMenuIds = menuIdList.filter(
            (mid: string) => !parentIdSet.has(mid),
          )
          treeRef.value?.setCheckedKeys(leafMenuIds)
          expandedKeys.value = menuIdList
        } else {
          ElMessage.error(
            response.message || response.msg || '角色信息获取失败',
          )
        }
      } catch (error) {
        console.error('角色信息获取失败:', error)
        ElMessage.error('角色信息获取失败')
      }
    }
  })
}

const menuSelect = async () => {
  const response = await reqMenuList()
  if (response) {
    menuList.value = treeDataTranslate(response, 'menuId')
  } else {
    ElMessage.error('角色添加页面-系统列表获取失败')
  }
}

// 暴露方法
defineExpose({ init })
</script>

<style scoped lang="scss"></style>
