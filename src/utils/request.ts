import axios from 'axios'
//
// 引入用户相关仓库
import useUserStore from '@/store/modules/user.ts'
import {
  GET_REFRESH_TOKEN,
  REMOVE_REFRESH_TOKEN,
  REMOVE_TOKEN,
  SET_REFRESH_TOKEN,
  SET_TOKEN,
} from '@/utils/token'

// 创建 Axios 实例
export const request = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_API || '/',
  timeout: 5000,
})

// 解析 JWT payload 剩余有效期（秒），解析失败返回 0（视为过期）
function tokenRemainSeconds(token: string): number {
  try {
    const payload = token.split('.')[1]
    const json = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
    return (json.exp || 0) - Math.floor(Date.now() / 1000)
  } catch {
    return 0
  }
}

// 请求拦截器：access token 快过期（<5 分钟）且有 refreshToken 时先静默刷新，避免请求 401
request.interceptors.request.use(async (config) => {
  const userStore = useUserStore()
  if (
    userStore.token &&
    tokenRemainSeconds(userStore.token) < 300 &&
    GET_REFRESH_TOKEN()
  ) {
    const ok = await tryRefreshToken()
    if (ok) {
      config.headers = {
        ...(config.headers || {}),
        token: userStore.token,
      }
      return config
    }
  }
  if (userStore.token) {
    config.headers = {
      ...(config.headers || {}),
      token: userStore.token,
    }
  }
  return config
})

// ---------- JWT 双 token：401 自动刷新（单飞 + 重放） ----------
let refreshPromise: Promise<boolean> | null = null

// 刷新双 token（用原生 axios 避免递归走响应拦截器）
async function doRefreshToken(): Promise<boolean> {
  const refreshToken = GET_REFRESH_TOKEN()
  if (!refreshToken) {
    return false
  }
  try {
    const base = (import.meta.env.VITE_APP_BASE_API || '').replace(/\/+$/, '')
    const res = await axios.post(`${base}/sys/refresh`, { refreshToken })
    if (res.data && res.data.code === 0 && res.data.token) {
      SET_TOKEN(res.data.token)
      SET_REFRESH_TOKEN(res.data.refreshToken)
      useUserStore().token = res.data.token
      return true
    }
    return false
  } catch {
    return false
  }
}

function tryRefreshToken(): Promise<boolean> {
  // 单飞：并发 401 只发起一次刷新
  if (!refreshPromise) {
    refreshPromise = doRefreshToken().finally(() => {
      refreshPromise = null
    })
  }
  return refreshPromise
}

function clearLoginState() {
  const userStore = useUserStore()
  userStore.token = ''
  userStore.username = ''
  userStore.avatar = ''
  userStore.perms = []
  REMOVE_TOKEN()
  REMOVE_REFRESH_TOKEN()
}

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    if (response.status === 200) {
      return Promise.resolve(response.data)
    }
    return Promise.reject(response.data)
  },
  async (error) => {
    const status = error.response?.status || 0 // 状态码
    const config = error.config || {}

    // 401 → 尝试用 refresh token 刷新后重放原请求
    if (status === 401 && !config._retried) {
      config._retried = true
      const ok = await tryRefreshToken()
      if (ok) {
        config.headers = {
          ...(config.headers || {}),
          token: useUserStore().token,
        }
        return request(config)
      }
      // 刷新失败（refresh 过期/被吊销）→ 清理登录态跳登录页
      clearLoginState()
      window.location.hash = '#/login'
      return Promise.reject(new Error('登录已失效，请重新登录'))
    }

    const message = getErrorMessage(status, error.response?.data) // 获取错误信息
    return Promise.reject(new Error(message))
  },
)

// 定义状态码类型
type StatusCode = 400 | 401 | 403 | 404 | 429 | 500 | 502 | 503 | number

// 定义返回数据类型
interface ResponseData {
  message?: string // 错误消息
  [key: string]: any // 其他字段
}

// 通用错误消息处理函数
function getErrorMessage(status: StatusCode, data: ResponseData = {}): string {
  const defaultMessage = '请求失败，请稍后重试' // 默认消息

  // 状态码与消息的映射表
  const errorMessages: Record<StatusCode, string> = {
    400: '请求参数错误',
    401: '未授权，请登录',
    403: '拒绝访问，权限不足',
    404: '请求资源未找到',
    429: '请求过于频繁，请稍后重试',
    500: '服务器内部错误',
    502: '网关错误',
    503: '服务不可用，请稍后再试',
  }

  // 如果映射表中有对应消息，返回该消息
  if (errorMessages[status]) {
    return errorMessages[status]
  }

  // 优先返回服务器返回的消息，否则返回默认消息
  return data?.message || defaultMessage
}
