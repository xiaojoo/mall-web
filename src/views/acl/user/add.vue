<template>
  <el-dialog
    :model-value="modelValue"
    @update:model-value="updateVisible"
    :close-on-click-modal="false"
    :title="button"
  >
    <el-form
      :model="dataForm"
      @keyup.enter.native="dataFormSubmit()"
      label-width="80px"
    >
      <el-form-item label="用户名" prop="userName">
        <el-input v-model="dataForm.userName" placeholder="登录帐号"></el-input>
      </el-form-item>
      <el-form-item
        v-if="!dataForm.id"
        label="密码"
        prop="password"
        :class="{ 'is-required': !dataForm.id }"
      >
        <el-input
          v-model="dataForm.password"
          type="password"
          placeholder="密码"
        ></el-input>
      </el-form-item>
      <el-form-item
        v-if="!dataForm.id"
        label="确认密码"
        prop="comfirmPassword"
        :class="{ 'is-required': !dataForm.id }"
      >
        <el-input
          v-model="dataForm.comfirmPassword"
          type="password"
          placeholder="确认密码"
        ></el-input>
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="dataForm.email" placeholder="邮箱"></el-input>
      </el-form-item>
      <el-form-item label="手机号" prop="mobile">
        <el-input v-model="dataForm.mobile" placeholder="手机号"></el-input>
      </el-form-item>
      <el-form-item label="角色" size="small" prop="roleIdList">
        <el-checkbox-group v-model="dataForm.roleIdList">
          <el-checkbox
            v-for="role in roleList"
            :key="role.roleId"
            :value="role.roleId"
          >
            {{ role.roleName }}
          </el-checkbox>
        </el-checkbox-group>
      </el-form-item>
      <el-form-item label="状态" size="small" prop="status">
        <el-radio-group v-model="dataForm.status">
          <el-radio :value="0">禁用</el-radio>
          <el-radio :value="1">正常</el-radio>
        </el-radio-group>
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

import { reqSelectInfo, reqUserInfo, reqUserUpdateCommit } from '@/api/acl'

const dataForm = ref({
  id: 0,
  userName: '',
  password: '',
  comfirmPassword: '',
  salt: '',
  email: '',
  mobile: '',
  roleIdList: [],
  status: 1,
})
const button = ref('添加')
const roleList = ref([
  {
    roleId: 0,
    roleName: '',
  },
])

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
    const response = await reqUserUpdateCommit(
      dataForm.value.id > 0 ? 'update' : 'save',
      dataForm.value.id,
      dataForm.value.userName,
      dataForm.value.password,
      dataForm.value.email,
      dataForm.value.mobile,
      dataForm.value.salt,
      dataForm.value.status,
      dataForm.value.roleIdList,
    )
    if (response.code === 0) {
      ElMessage.success(`用户${button.value}成功`)
    } else {
      ElMessage.error(response.message || response.msg || '操作失败')
    }
  } catch (error) {
    console.error(`用户${button.value}失败`, error)
  }
}

const init = async (id: number) => {
  button.value = id > 0 ? '修改' : '添加'
  const role = await reqSelectInfo()
  if (role.code === 0) {
    roleList.value = role.list
  } else {
    ElMessage.error(role.msg)
  }
  await nextTick(async () => {
    dataForm.value.id = 0
    dataForm.value.userName = ''
    dataForm.value.salt = ''
    dataForm.value.email = ''
    dataForm.value.mobile = ''
    dataForm.value.status = 1
    dataForm.value.roleIdList = []
    if (id > 0) {
      try {
        const response = await reqUserInfo(id)
        if (response.code === 0) {
          dataForm.value.id = response.user.userId
          dataForm.value.userName = response.user.username
          dataForm.value.salt = response.user.salt
          dataForm.value.email = response.user.email
          dataForm.value.mobile = response.user.mobile
          dataForm.value.status = response.user.status
          // 后端 Long 数字数组 → 字符串（雪花 ID 精度 + 与 checkbox value 匹配）
          dataForm.value.roleIdList = (response.user.roleIdList || []).map(
            String,
          )
        }
      } catch (error) {
        console.error('用户信息获取失败:', error)
      }
    }
  })
}

// 暴露方法
defineExpose({ init })
</script>

<style scoped lang="scss"></style>
