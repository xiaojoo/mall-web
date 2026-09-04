<template>
  <el-button circle size="small" :icon="Refresh" @click="updateRefresh" />
  <el-button circle size="small" :icon="FullScreen" @click="updateFullScreen" />
  <!-- 系统设置：仅图标，点击弹出模态框（996 × 665） -->
  <el-button
    circle
    size="small"
    :icon="Setting"
    @click="settingVisible = true"
  />
  <!-- 头像：点击弹出账号信息模态框 -->
  <img
    :src="userStore.avatar"
    alt=""
    class="user-avatar"
    @click="openProfile"
  />
  <el-dropdown>
    <span class="el-dropdown-link" style="cursor: pointer">
      {{ userStore.username }}
      <el-icon class="el-icon--right">
        <arrow-down />
      </el-icon>
    </span>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item @click="logout()">退出登录</el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>

  <!-- 账号信息模态框（点击头像弹出，展示+修改） -->
  <el-dialog
    v-model="profileVisible"
    title="账号信息"
    width="480px"
    align-center
    :close-on-click-modal="false"
  >
    <div class="profile-body">
      <div class="profile-avatar">
        <SingleUpload v-model="profile.avatar" />
        <div class="avatar-tip">点击上传/更换头像</div>
      </div>
      <el-form label-width="80px" class="profile-form">
        <el-form-item label="用户名">
          <el-input v-model="profile.username" disabled />
        </el-form-item>
        <el-form-item label="姓名">
          <el-input
            v-model="profile.realName"
            placeholder="请输入姓名"
            maxlength="50"
          />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input
            v-model="profile.email"
            placeholder="请输入邮箱"
            maxlength="100"
          />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input
            v-model="profile.mobile"
            placeholder="请输入手机号"
            maxlength="20"
          />
        </el-form-item>
      </el-form>
      <div class="profile-divider">修改密码</div>
      <el-form label-width="80px" class="profile-form">
        <el-form-item label="原密码">
          <el-input
            v-model="pwdForm.oldPassword"
            type="password"
            show-password
            placeholder="请输入原密码"
          />
        </el-form-item>
        <el-form-item label="新密码">
          <el-input
            v-model="pwdForm.newPassword"
            type="password"
            show-password
            placeholder="至少 6 位"
          />
        </el-form-item>
        <el-form-item label="确认密码">
          <el-input
            v-model="pwdForm.confirmPassword"
            type="password"
            show-password
            placeholder="再次输入新密码"
          />
        </el-form-item>
      </el-form>
    </div>
    <template #footer>
      <el-button @click="profileVisible = false">取消</el-button>
      <el-button type="primary" :loading="savingProfile" @click="saveProfile">
        保存资料
      </el-button>
      <el-button type="warning" :loading="savingPwd" @click="savePassword">
        修改密码
      </el-button>
    </template>
  </el-dialog>

  <!-- 系统设置模态框（666 × 400，align-center 垂直水平居中） -->
  <el-dialog
    v-model="settingVisible"
    title="系统设置"
    width="666px"
    align-center
    class="setting-dialog"
  >
    <div class="setting-body">
      <div class="setting-item">
        <span class="setting-label">主题色</span>
        <el-color-picker
          v-model="color"
          :predefine="predefineColors"
          @change="setColor"
        />
        <span class="setting-tip">选择后全局主色调立即生效</span>
      </div>
      <div class="setting-item">
        <span class="setting-label">暗色模式</span>
        <el-switch v-model="dark" @change="changeDark" />
        <span class="setting-tip">深色主题，适合夜间使用</span>
      </div>
      <div class="setting-item">
        <span class="setting-label">全屏切换</span>
        <el-button size="small" :icon="FullScreen" @click="updateFullScreen">
          {{ isFullscreen ? '退出全屏' : '进入全屏' }}
        </el-button>
        <span class="setting-tip">
          当前{{ isFullscreen ? '处于' : '未处于' }}全屏
        </span>
      </div>
      <div class="setting-item">
        <span class="setting-label">刷新页面</span>
        <el-button size="small" :icon="Refresh" @click="updateRefresh">
          刷新
        </el-button>
        <span class="setting-tip">重新渲染当前页面内容</span>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import {
  Refresh,
  FullScreen,
  Setting,
  ArrowDown,
} from '@element-plus/icons-vue'
import useLayOutSettingStore from '@/store/modules/setting.ts'
// 获取用户相关小仓库
import useUserStore from '@/store/modules/user.ts'
import SingleUpload from '@/components/upload/singleUpload.vue'
import {
  reqUserProfile,
  reqUserProfileUpdate,
  reqChangePassword,
} from '@/api/acl'
import { useRouter, useRoute } from 'vue-router'

const layOutSettingStore = useLayOutSettingStore()
const userStore = useUserStore()
const $router = useRouter()
const $route = useRoute()

const settingVisible = ref(false)
const profileVisible = ref(false)
const savingProfile = ref(false)
const savingPwd = ref(false)

// 账号资料
const profile = ref<any>({
  username: userStore.username,
  realName: '',
  email: '',
  mobile: '',
  avatar: '',
})

// 头像上传/修改后立即同步顶栏（无需等保存）
watch(
  () => profile.value.avatar,
  (val) => {
    if (val) {
      userStore.avatar = val
    }
  },
)

// 修改密码表单
const pwdForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
})

// 打开账号信息弹窗时加载资料
const openProfile = async () => {
  profileVisible.value = true
  try {
    const res: any = await reqUserProfile()
    if (res && res.code === 0 && res.user) {
      profile.value = {
        username: res.user.username || userStore.username,
        realName: res.user.realName || '',
        email: res.user.email || '',
        mobile: res.user.mobile || '',
        avatar: res.user.avatar || '',
      }
    }
  } catch {
    // 加载失败保留默认值
  }
}

// 保存资料
const saveProfile = async () => {
  if (
    !profile.value.realName &&
    !profile.value.email &&
    !profile.value.mobile
  ) {
    ElMessage.warning('请至少填写一项资料')
    return
  }
  savingProfile.value = true
  try {
    const res: any = await reqUserProfileUpdate({
      realName: profile.value.realName,
      email: profile.value.email,
      mobile: profile.value.mobile,
      avatar: profile.value.avatar,
    })
    if (res && res.code === 0) {
      ElMessage.success('资料已保存')
      // 同步顶栏头像
      if (profile.value.avatar) {
        userStore.avatar = profile.value.avatar
      }
    } else {
      ElMessage.error(res?.message || res?.msg || '保存失败')
    }
  } catch {
    ElMessage.error('保存失败，请稍后重试')
  } finally {
    savingProfile.value = false
  }
}

// 修改密码
const savePassword = async () => {
  const { oldPassword, newPassword, confirmPassword } = pwdForm.value
  if (!oldPassword || !newPassword) {
    ElMessage.warning('请填写原密码和新密码')
    return
  }
  if (newPassword.length < 6) {
    ElMessage.warning('新密码至少 6 位')
    return
  }
  if (newPassword !== confirmPassword) {
    ElMessage.warning('两次输入的新密码不一致')
    return
  }
  savingPwd.value = true
  try {
    const res: any = await reqChangePassword({
      oldPassword,
      newPassword,
    })
    if (res && res.code === 0) {
      ElMessage.success('密码已修改，下次登录生效')
      pwdForm.value = { oldPassword: '', newPassword: '', confirmPassword: '' }
    } else {
      ElMessage.error(res?.message || res?.msg || '修改失败')
    }
  } catch {
    ElMessage.error('修改失败，请稍后重试')
  } finally {
    savingPwd.value = false
  }
}

const color = ref('#409eff')
const predefineColors = ref([
  '#ff4500',
  '#ff8c00',
  '#ffd700',
  '#90ee90',
  '#00ced1',
  '#1e90ff',
  '#c71585',
  '#409eff',
  '#67c23a',
  '#e6a23c',
  '#f56c6c',
])

const dark = ref(false)

// 暗色模式（Element Plus 暗色变量见 main.ts 引入的 dark/css-vars.css）
const changeDark = (val: boolean) => {
  const html = document.documentElement
  if (val) {
    html.classList.add('dark')
  } else {
    html.classList.remove('dark')
  }
}

// 主题色：覆盖 --el-color-primary 主色变量及浅色态
const setColor = (val: string) => {
  const html = document.documentElement
  html.style.setProperty('--el-color-primary', val)
  html.style.setProperty('--el-color-primary-light-3', `${val}33`)
  html.style.setProperty('--el-color-primary-light-5', `${val}66`)
  html.style.setProperty('--el-color-primary-light-7', `${val}99`)
  html.style.setProperty('--el-color-primary-light-8', `${val}b3`)
  html.style.setProperty('--el-color-primary-light-9', `${val}cc`)
  html.style.setProperty('--el-color-primary-dark-2', `${val}b3`)
}

const isFullscreen = ref(false)
const updateFullscreenState = () => {
  isFullscreen.value = !!document.fullscreenElement
}

// 刷新
const updateRefresh = () => {
  layOutSettingStore.refresh = !layOutSettingStore.refresh
}

// 全屏
const updateFullScreen = () => {
  const full = document.fullscreenElement
  if (!full) {
    document.documentElement.requestFullscreen()
  } else {
    document.exitFullscreen()
  }
  updateFullscreenState()
}

// 退出登录
const logout = async () => {
  try {
    await userStore.userLogOut()
    // 跳转登录界面
    await $router.push({ path: '/login', query: { redirect: $route.path } })
  } catch (error) {
    // 可以根据需要显示提示信息
    ElMessage.error('退出登录失败，请稍后再试')
  }
}

onMounted(() => {
  document.addEventListener('fullscreenchange', updateFullscreenState)
})
onBeforeUnmount(() => {
  document.removeEventListener('fullscreenchange', updateFullscreenState)
})
</script>

<style scoped lang="scss">
img {
  width: 24px;
  height: 24px;
  border-radius: 20px;
  margin: 0 10px;
}

.user-avatar {
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.8;
  }
}

.profile-body {
  .profile-avatar {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 1rem;

    .avatar-tip {
      color: #909399;
      font-size: 0.75rem;
      margin-top: 0.5rem;
    }
  }

  .profile-divider {
    margin: 1rem 0 0.5rem;
    padding-left: 0.5rem;
    font-weight: 600;
    font-size: 0.875rem;
    color: var(--el-text-color-primary);
    border-left: 3px solid var(--el-color-primary);
  }
}

.setting-body {
  height: 400px;
  box-sizing: border-box;
  overflow: auto;
  padding: 0 1rem;

  .setting-item {
    display: flex;
    align-items: center;
    padding: 0.75rem 0;
    border-bottom: 1px solid var(--el-border-color-lighter);

    &:last-child {
      border-bottom: none;
    }

    .setting-label {
      width: 6.25rem;
      flex-shrink: 0;
      color: var(--el-text-color-primary);
      font-size: 0.875rem;
    }

    .setting-tip {
      color: #909399;
      font-size: 0.75rem;
      margin-left: 0.625rem;
    }
  }
}
</style>
