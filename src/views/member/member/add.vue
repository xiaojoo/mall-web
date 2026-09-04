<template>
  <el-dialog
    :model-value="modelValue"
    @update:model-value="updateVisible"
    :close-on-click-modal="false"
    :title="button"
  >
    <el-form :model="dataForm" label-width="120px">
      <el-form-item label="会员等级id" prop="levelId">
        <el-input
          v-model="dataForm.levelId"
          placeholder="会员等级id"
        ></el-input>
      </el-form-item>
      <el-form-item label="用户名" prop="username">
        <el-input v-model="dataForm.username" placeholder="用户名"></el-input>
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input v-model="dataForm.password" placeholder="密码"></el-input>
      </el-form-item>
      <el-form-item label="昵称" prop="nickname">
        <el-input v-model="dataForm.nickname" placeholder="昵称"></el-input>
      </el-form-item>
      <el-form-item label="手机号码" prop="mobile">
        <el-input v-model="dataForm.mobile" placeholder="手机号码"></el-input>
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="dataForm.email" placeholder="邮箱"></el-input>
      </el-form-item>
      <el-form-item label="头像" prop="header">
        <img-box-upload v-model="dataForm.header" />
      </el-form-item>
      <el-form-item label="性别" prop="gender">
        <el-input v-model="dataForm.gender" placeholder="性别"></el-input>
      </el-form-item>
      <el-form-item label="生日" prop="birth">
        <el-input v-model="dataForm.birth" placeholder="生日"></el-input>
      </el-form-item>
      <el-form-item label="所在城市" prop="city">
        <el-input v-model="dataForm.city" placeholder="所在城市"></el-input>
      </el-form-item>
      <el-form-item label="职业" prop="job">
        <el-input v-model="dataForm.job" placeholder="职业"></el-input>
      </el-form-item>
      <el-form-item label="个性签名" prop="sign">
        <el-input v-model="dataForm.sign" placeholder="个性签名"></el-input>
      </el-form-item>
      <el-form-item label="用户来源" prop="sourceType">
        <el-input
          v-model="dataForm.sourceType"
          placeholder="用户来源"
        ></el-input>
      </el-form-item>
      <el-form-item label="积分" prop="integration">
        <el-input v-model="dataForm.integration" placeholder="积分"></el-input>
      </el-form-item>
      <el-form-item label="成长值" prop="growth">
        <el-input v-model="dataForm.growth" placeholder="成长值"></el-input>
      </el-form-item>
      <el-form-item label="启用状态" prop="status">
        <el-input v-model="dataForm.status" placeholder="启用状态"></el-input>
      </el-form-item>
      <el-form-item label="注册时间" prop="createTime">
        <el-input
          v-model="dataForm.createTime"
          placeholder="注册时间"
        ></el-input>
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

import { reqMemberInfo, reqMemberUpdateCommit } from '@/api/member/member'
import ImgBoxUpload from '@/components/upload/imgBoxUpload.vue'

const dataForm = ref({
  id: 0,
  levelId: '',
  username: '',
  password: '',
  nickname: '',
  mobile: '',
  email: '',
  header: '',
  gender: '',
  birth: '',
  city: '',
  job: '',
  sign: '',
  sourceType: '',
  integration: '',
  growth: '',
  status: '',
  createTime: '',
})
const button = ref('添加')

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
    await reqMemberUpdateCommit(
      dataForm.value.id > 0 ? 'update' : 'save',
      dataForm.value.id,
      dataForm.value.levelId,
      dataForm.value.username,
      dataForm.value.password,
      dataForm.value.nickname,
      dataForm.value.mobile,
      dataForm.value.email,
      dataForm.value.header,
      dataForm.value.gender,
      dataForm.value.birth,
      dataForm.value.city,
      dataForm.value.job,
      dataForm.value.sign,
      dataForm.value.sourceType,
      dataForm.value.integration,
      dataForm.value.growth,
      dataForm.value.status,
      dataForm.value.createTime,
    )
    ElMessage.success(`会员${button.value}成功`)
    updateVisible(false)
    emit('refreshDataList')
  } catch (error) {
    console.error(`会员${button.value}失败`, error)
  }
}

const init = (id: number) => {
  button.value = id > 0 ? '修改' : '添加'
  nextTick(async () => {
    dataForm.value.id = 0
    dataForm.value.levelId = ''
    dataForm.value.username = ''
    dataForm.value.password = ''
    dataForm.value.nickname = ''
    dataForm.value.mobile = ''
    dataForm.value.email = ''
    dataForm.value.header = ''
    dataForm.value.gender = ''
    dataForm.value.birth = ''
    dataForm.value.city = ''
    dataForm.value.job = ''
    dataForm.value.sign = ''
    dataForm.value.sourceType = ''
    dataForm.value.integration = ''
    dataForm.value.growth = ''
    dataForm.value.status = ''
    dataForm.value.createTime = ''
    if (id > 0) {
      try {
        const response = await reqMemberInfo(id)
        if (response.code === 200 && response.data) {
          dataForm.value.id = response.data.id
          dataForm.value.levelId = response.data.levelId
          dataForm.value.username = response.data.username
          dataForm.value.password = response.data.password
          dataForm.value.nickname = response.data.nickname
          dataForm.value.mobile = response.data.mobile
          dataForm.value.email = response.data.email
          dataForm.value.header = response.data.header
          dataForm.value.gender = response.data.gender
          dataForm.value.birth = response.data.birth
          dataForm.value.city = response.data.city
          dataForm.value.job = response.data.job
          dataForm.value.sign = response.data.sign
          dataForm.value.sourceType = response.data.sourceType
          dataForm.value.integration = response.data.integration
          dataForm.value.growth = response.data.growth
          dataForm.value.status = response.data.status
          dataForm.value.createTime = response.data.createTime
        } else {
          ElMessage.error(response?.message || '会员信息不存在或已删除')
        }
      } catch (error) {
        console.error('会员信息获取失败:', error)
      }
    }
  })
}

// 暴露方法
defineExpose({ init })
</script>

<style scoped lang="scss"></style>
