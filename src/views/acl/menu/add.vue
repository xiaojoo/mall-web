<template>
  <el-dialog
    :model-value="modelValue"
    @update:model-value="updateVisible"
    :title="!dataForm.id ? '新增' : '修改'"
    :close-on-click-modal="false"
  >
    <el-form :model="dataForm" @keyup.enter="dataFormSubmit" label-width="80px">
      <el-form-item label="类型" prop="type" for="menu-form-type">
        <el-radio-group v-model="dataForm.type">
          <el-radio
            v-for="(type, index) in dataForm.typeList"
            :value="index"
            :key="index"
          >
            {{ type }}
          </el-radio>
        </el-radio-group>
        <!-- element-plus 会把 form-item 的 label for 指向 radio-group 容器 div（div 不是合法表单控件），
             Chrome 报 Incorrect use of <label for>；补一个隐藏的原生 radio 承接 for -->
        <input
          id="menu-form-type"
          type="radio"
          class="menu-form-type-fix"
          tabindex="-1"
          aria-hidden="true"
        />
      </el-form-item>

      <el-form-item
        :label="dataForm.typeList[dataForm.type] + '名称'"
        prop="name"
      >
        <el-input
          v-model="dataForm.name"
          :placeholder="dataForm.typeList[dataForm.type] + '名称'"
        />
      </el-form-item>

      <el-form-item label="上级菜单" prop="parentName">
        <el-popover
          ref="menuListPopover"
          placement="bottom-start"
          trigger="click"
        >
          <el-tree
            :data="menuList"
            :props="menuListTreeProps"
            node-key="menuId"
            ref="treeRef"
            @current-change="menuListTreeCurrentChangeHandle"
            :default-expand-all="false"
            :highlight-current="true"
            :expand-on-click-node="false"
          />
          <template #reference>
            <div style="width: 200px">
              <el-input
                v-model="dataForm.parentName"
                readonly
                placeholder="点击选择上级菜单"
                class="menu-list__input"
              />
            </div>
          </template>
        </el-popover>
      </el-form-item>

      <el-form-item v-if="dataForm.type === 1" label="菜单路由" prop="url">
        <el-input v-model="dataForm.url" placeholder="菜单路由" />
      </el-form-item>

      <el-form-item v-if="dataForm.type !== 0" label="授权标识" prop="perms">
        <el-input
          v-model="dataForm.perms"
          placeholder="多个用逗号分隔, 如: user:list,user:create"
        />
      </el-form-item>

      <el-form-item v-if="dataForm.type !== 2" label="排序号" prop="orderNum">
        <el-input-number
          v-model="dataForm.orderNum"
          controls-position="right"
          :min="0"
          label="排序号"
        />
      </el-form-item>

      <el-form-item v-if="dataForm.type !== 2" label="菜单图标" prop="icon">
        <el-row :gutter="8" style="width: 100%">
          <el-col :span="22">
            <el-popover
              ref="iconListPopover"
              placement="bottom-start"
              trigger="click"
              :width="iconPopoverWidth"
              popper-class="mod-menu__icon-popover"
              @after-enter="syncIconPopoverWidth"
            >
              <div class="mod-menu__icon-inner">
                <div class="mod-menu__icon-list">
                  <el-button
                    v-for="item in iconList"
                    :key="item"
                    @click="iconActiveHandle(item)"
                    :class="{
                      'is-active': item === dataForm.icon,
                      'is-used': isIconUsed(item),
                    }"
                    :title="isIconUsed(item) ? item + '（已使用）' : item"
                  >
                    <el-icon :size="18">
                      <component :is="resolveMenuIcon(item)" />
                    </el-icon>
                    <span v-if="isIconUsed(item)" class="icon-used-badge" />
                  </el-button>
                </div>
              </div>
              <template #reference>
                <el-input
                  ref="iconInputRef"
                  v-model="dataForm.icon"
                  readonly
                  placeholder="点击选择菜单图标"
                  class="menu-list__input"
                >
                  <template #prepend>
                    <el-icon v-if="dataForm.icon">
                      <component :is="resolveMenuIcon(dataForm.icon)" />
                    </el-icon>
                    <el-icon v-else>
                      <component :is="resolveMenuIcon('')" />
                    </el-icon>
                  </template>
                </el-input>
              </template>
            </el-popover>
          </el-col>
          <el-col :span="2" class="icon-list__tips">
            <el-tooltip placement="top" effect="light">
              <template #content>
                图标名与侧边栏菜单一一对应，配置后侧边栏即按此显示
              </template>
              <i class="el-icon-warning"></i>
            </el-tooltip>
          </el-col>
        </el-row>
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel()">取消</el-button>
        <el-button type="primary" @click="dataFormSubmit()">确定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { nextTick, ref, onMounted } from 'vue'

import { reqMenuInfo, reqMenuSelectInfo, reqMenuUpdateCommit } from '@/api/acl'
import { treeDataTranslate } from '@/utils/token.ts'
import {
  MENU_ICON_NAMES,
  menuIconMap,
  resolveMenuIcon,
} from '@/utils/menuIcons'
import type { Component } from 'vue'

const dataForm = ref({
  id: 0,
  type: 1,
  typeList: ['目录', '菜单', '按钮'],
  name: '',
  parentId: 0,
  parentName: '',
  url: '',
  perms: '',
  orderNum: 0,
  icon: '',
  iconList: [],
})
const button = ref('添加')
const menuList = ref([])
const menuListTreeProps = ref({
  label: 'name',
  children: 'children',
})
const treeRef = ref()
const iconList = ref<string[]>([])
const iconInputRef = ref()
// 已被现有菜单使用的图标组件集合（用于右上角“已使用”角标，不影响继续选择）
const usedIconComponents = ref<Set<Component>>(new Set())
const isIconUsed = (name: string) =>
  usedIconComponents.value.has(menuIconMap[name])
// 图标选择弹框宽度：与触发输入框等宽；值不变时不更新，避免打开瞬间触发重渲染
const iconPopoverWidth = ref(260)
const syncIconPopoverWidth = () => {
  const input = iconInputRef.value?.$el
  if (!input) {
    return
  }
  const w = input.offsetWidth
  if (w && w !== iconPopoverWidth.value) {
    iconPopoverWidth.value = w
  }
}
defineProps(['modelValue'])

const emit = defineEmits(['update:modelValue', 'refreshDataList'])

const updateVisible = (value: boolean) => {
  emit('update:modelValue', value)
}

// 处理取消按钮点击
const handleCancel = () => {
  updateVisible(false)
}

const dataFormSubmit = async () => {
  try {
    const response = await reqMenuUpdateCommit(
      dataForm.value.id > 0 ? 'update' : 'save',
      dataForm.value.id,
      dataForm.value.type,
      dataForm.value.name,
      dataForm.value.parentId,
      dataForm.value.url,
      dataForm.value.perms,
      dataForm.value.icon,
      dataForm.value.orderNum,
      dataForm.value.iconList,
    )
    if (response.code === 0) {
      ElMessage.success(`${button.value}成功`)
      // 成功后关闭弹窗并通知父组件刷新菜单列表
      emit('refreshDataList')
      updateVisible(false)
    } else {
      ElMessage.error(response.message || response.msg || '操作失败')
    }
  } catch (error) {
    console.error(`${button.value}失败`, error)
  }
}

const init = async (id: number) => {
  button.value = id > 0 ? '修改' : '添加'
  const menu = await reqMenuSelectInfo()
  if (menu) {
    // 收集已被菜单使用的图标（按渲染组件去重），用于右上角“已使用”角标
    const used = new Set<Component>()
    for (const m of menu.menuList || []) {
      if (m.icon && menuIconMap[m.icon]) {
        used.add(menuIconMap[m.icon])
      }
    }
    usedIconComponents.value = used
    menuList.value = treeDataTranslate(menu.menuList, 'menuId')
  } else {
    ElMessage.error('菜单获取失败')
  }
  await nextTick(async () => {
    dataForm.value.id = 0
    dataForm.value.type = 1
    dataForm.value.typeList = ['目录', '菜单', '按钮']
    dataForm.value.name = ''
    dataForm.value.parentId = 0
    dataForm.value.parentName = ''
    dataForm.value.url = ''
    dataForm.value.perms = ''
    dataForm.value.orderNum = 0
    dataForm.value.icon = ''
    dataForm.value.iconList = []
    if (id > 0) {
      menuListTreeSetCurrentNode()
      try {
        const response = await reqMenuInfo(id)
        if (response.code === 0) {
          dataForm.value.id = response.menu.menuId
          dataForm.value.type = response.menu.type
          dataForm.value.name = response.menu.name
          dataForm.value.parentId = response.menu.parentId
          dataForm.value.url = response.menu.url
          dataForm.value.perms = response.menu.perms
          dataForm.value.orderNum = response.menu.orderNum
          dataForm.value.icon = response.menu.icon
          menuListTreeSetCurrentNode()
        }
      } catch (error) {
        console.error('菜单信息获取失败:', error)
      }
    }
    // 图标弹框宽度提前对齐输入框，打开时无需重渲染
    syncIconPopoverWidth()
  })
}

// 菜单树设置当前选中节点
const menuListTreeSetCurrentNode = () => {
  // el-tree 在 popover 内，首次打开弹窗时可能尚未挂载，需防御
  if (!treeRef.value) {
    return
  }
  treeRef.value.setCurrentKey(dataForm.value.parentId)
  dataForm.value.parentName = (treeRef.value.getCurrentNode() || {})['name']
}

// 菜单树选中
const menuListTreeCurrentChangeHandle = (data: any) => {
  dataForm.value.parentId = data.menuId
  dataForm.value.parentName = data.name
}

// 图标选中
const iconActiveHandle = (iconName: any) => {
  dataForm.value.icon = iconName
}

// 暴露方法
defineExpose({ init })

onMounted(() => {
  // 可选图标 = 侧边栏图标注册表，保证配置后侧边栏能渲染
  iconList.value = MENU_ICON_NAMES
})
</script>

<style lang="scss" scoped>
.mod-menu__icon-inner {
  padding: 4px;
}

// 图标选择弹框：网格排列，行/列对齐且有间距
.mod-menu__icon-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(48px, 1fr));
  gap: 8px;
  max-height: 240px;
  overflow-y: auto;

  .el-button {
    // 覆盖 el-button 默认相邻间距（margin-left: 12px），保证每行首列对齐
    margin-left: 0;
    width: 100%;
    height: 40px;
    padding: 0;
  }

  .el-button.is-active {
    border-color: var(--el-color-primary);
    color: var(--el-color-primary);
    background-color: var(--el-color-primary-light-9);
  }

  // 已使用角标：右上角小三角，仅标识，不禁止选择
  .el-button {
    position: relative;

    .icon-used-badge {
      position: absolute;
      top: -1px;
      right: -1px;
      width: 0;
      height: 0;
      border-top: 8px solid var(--el-color-warning);
      border-left: 8px solid transparent;
      pointer-events: none;
    }
  }
}

// 类型 label 的 for 承接元素：仅用于消除 a11y 告警，不参与布局
.menu-form-type-fix {
  display: none;
}
</style>
