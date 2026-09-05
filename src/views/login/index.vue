<template>
  <div class="login-container">
    <div class="login-left"></div>
    <div class="login-right">
      <form class="login-form" @submit.prevent="onSubmit">
        <h1 class="login-title">管理系统登录</h1>
        <div class="form-group">
          <label for="username">用户名</label>
          <div class="input-wrapper">
            <svg-icon
              name="user"
              color="#ffffff"
              width="1.5rem"
              height="1.5rem"
              class="input-icon"
            />
            <input
              type="text"
              id="username"
              name="username"
              placeholder="请输入用户名"
              v-model="loginForm.username"
              @input="limitInput('username', 16)"
            />
          </div>
          <p v-if="errors.username" class="error-text">{{ errors.username }}</p>
        </div>
        <div class="form-group">
          <label for="password">密码</label>
          <div class="input-wrapper password-wrapper">
            <svg-icon
              name="lock"
              color="#ffffff"
              width="1.5rem"
              height="1.5rem"
              class="input-icon"
            />
            <input
              :type="passwordVisible ? 'text' : 'password'"
              id="password"
              name="password"
              placeholder="请输入密码"
              v-model="loginForm.password"
              @input="limitInput('password', 16)"
            />
            <span class="toggle-visibility" @click="togglePasswordVisibility">
              <svg-icon
                :name="passwordVisible ? 'eye' : 'eye-off'"
                color="#ffffff"
                width="1.5rem"
                height="1.5rem"
              />
            </span>
          </div>
          <p v-if="errors.password" class="error-text">{{ errors.password }}</p>
        </div>
        <!-- 新增验证码输入框 -->
        <div class="form-group">
          <label for="captcha">验证码</label>
          <div class="input-wrapper captcha-wrapper">
            <input
              type="text"
              id="captcha"
              name="captcha"
              placeholder="请输入验证码"
              v-model="loginForm.captcha"
              @input="limitInput('captcha', 4)"
            />
            <img
              :src="captchaSrc"
              alt="验证码"
              class="captcha-image"
              @click="reloadCaptcha"
            />
          </div>
          <p v-if="errors.captcha" class="error-text">{{ errors.captcha }}</p>
        </div>
        <button type="submit" class="login-button" :disabled="loading">
          <svg-icon
            v-if="loading"
            name="loading"
            color="#ffffff"
            width="1.5rem"
            height="1.5rem"
            class="loading-icon"
          />
          <span v-else>登录</span>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import * as yup from 'yup'
import useUserStore from '@/store/modules/user'
import { useRouter, useRoute } from 'vue-router'

import { getTime, getUUID } from '@/utils/time'

// 表单校验规则
const schema = yup.object({
  username: yup
    .string()
    .required('用户名不能为空')
    .min(3, '用户名至少 3 个字符')
    .max(16, '用户名最多 16 个字符'),
  password: yup
    .string()
    .required('密码不能为空')
    .min(4, '密码至少 6 个字符')
    .max(16, '密码最多 16 个字符'),
  captcha: yup.string().required('验证码不能为空').length(4, '验证码必须是4位'),
})

// 表单数据
const loginForm = reactive({
  username: 'admin',
  password: '123456',
  captcha: '',
  uuid: '',
})

// 表单错误信息
const errors = reactive({
  username: '',
  password: '',
  captcha: '',
})

const passwordVisible = ref(false) // 控制密码显示
const loading = ref(false) // 控制加载状态
const useStore = useUserStore()
const $router = useRouter()
const $route = useRoute()

const captchaSrc = ref('') // 用于存放验证码图片的URL

// 切换密码可见状态
const togglePasswordVisibility = () => {
  passwordVisible.value = !passwordVisible.value
}

// 加载验证码图片（同源 /api：dev 走 vite 代理、生产走 nginx 转发网关）
const loadCaptcha = () => {
  const uuid = getUUID()
  loginForm.uuid = uuid
  captchaSrc.value = `${import.meta.env.VITE_APP_BASE_API || ''}/captcha.jpg?uuid=${uuid}`
}

// 刷新验证码
const reloadCaptcha = () => {
  loadCaptcha()
}

// 表单提交
const onSubmit = async () => {
  // 清空错误信息
  errors.username = ''
  errors.password = ''
  errors.captcha = ''

  try {
    // 校验表单数据
    await schema.validate(loginForm, { abortEarly: false })
    loading.value = true
    // 调用登录接口
    await useStore.userLogin(loginForm)
    // 登录成功通知
    ElNotification({
      title: `Hi，${getTime()}`,
      message: '欢迎回来',
      type: 'success',
    })
    // 跳转到主页
    // 判断路由路径是否有query参数，有就往query调整，没有跳转到首页
    const redirect: any = $route.query.redirect
    await $router.push({ path: redirect || '/' })
  } catch (error: unknown) {
    // 如果是校验错误
    if (error instanceof yup.ValidationError) {
      // 收集校验错误
      error.inner.forEach((err) => {
        errors[err.path as keyof typeof errors] = err.message
      })
    } else {
      // 登录失败通知
      const errorMessage =
        (error as { message?: string }).message || '服务器错误，请稍后重试'
      ElNotification({
        title: '登录失败',
        message: errorMessage,
        type: 'error',
      })
    }
  } finally {
    loading.value = false
  }
}

// 输入框长度限制
const limitInput = (
  field: 'username' | 'password' | 'captcha',
  maxLength: number,
) => {
  if (loginForm[field].length > maxLength) {
    loginForm[field] = loginForm[field].slice(0, maxLength)
  }
}

// 初始化加载验证码
loadCaptcha()
// 登录页挂载/卸载切换 body 类以覆盖全局 body{min-width:80rem} 的横向滚动
onMounted(() => { document.documentElement.classList.add('login-page'); document.body.classList.add('login-page') })
onUnmounted(() => { document.documentElement.classList.remove('login-page'); document.body.classList.remove('login-page') })
</script>

<style lang="scss" scoped>
.login-container {
  position: fixed;
  inset: 0;
  display: flex;
  width: 100%;
  overflow: hidden;
  background: url('@/assets/images/background.jpg') no-repeat center center;
  background-size: cover;
}

.login-left {
  flex: 1 1 0;
  min-width: 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

.login-right {
  flex: 0 0 auto;
  width: 45%;
  min-width: 340px;
  max-width: 640px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #fff;
  padding: 2rem;
  box-sizing: border-box;
}

.login-title {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #fefeff;
  font-size: 1.5rem;
}

.login-form {
  width: 100%;
  max-width: 650px;
  min-width: 300px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  padding: 2rem;
  background: url('@/assets/images/login_form.png') no-repeat center center;
  background-size: cover;
  border-radius: 0.5rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 1rem;
}

label {
  font-size: 1rem;
  margin-bottom: 0.5rem;
  display: block;
}

.input-wrapper {
  display: flex;
  align-items: center;
  position: relative;
}

.input-icon {
  position: absolute;
  left: 0.7rem;
  width: 1.5rem;
  height: 1.5rem;
  color: #fff;
}

input {
  width: 100%;
  padding: 0.875rem 0.875rem 0.875rem 2.75rem;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 0.5rem;
  box-sizing: border-box;
}

input:focus {
  border-color: #6a89cc;
  outline: none;
  box-shadow: 0 0 4px rgba(106, 137, 204, 0.5);
}

.password-wrapper {
  position: relative;
}

.toggle-visibility {
  position: absolute;
  top: 50%;
  right: 0.75rem;
  transform: translateY(-50%);
  cursor: pointer;
}

.captcha-wrapper {
  position: relative;
}

.captcha-image {
  position: absolute;
  border-radius: 0 0.5rem 0.5rem 0;
  box-sizing: border-box;
  height: 98%;
  width: 40%;
  right: 0;
}

.login-button {
  background: #6a89cc;
  color: #fff;
  padding: 0.875rem;
  margin: 1rem 0;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s;
  display: flex;
  justify-content: center;
  align-items: center;
}

.login-button:hover {
  background: #4a69bd;
}

.login-button:disabled {
  cursor: not-allowed;
  background: #94a3b8;
}

.loading-icon {
  animation: spin 1s linear infinite;
}

.error-text {
  color: #ff6b6b;
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .login-container {
    padding: 1rem;
  }

  .login-left {
    display: none;
  }

  .login-right {
    width: 100%;
    min-width: 0;
    padding: 1rem;
  }

  .login-form {
    max-width: 100%;
    min-width: 0;
    padding: 1.25rem;
  }
}
</style>
<style>
html.login-page,
body.login-page {
  min-width: 0 !important;
  max-width: 100% !important;
  overflow: hidden !important;
  height: 100%;
}
</style>