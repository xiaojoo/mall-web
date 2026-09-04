// 登录接口需要携带参数ts类型
export interface LoginFormData {
  username: string
  password: string
}

interface dataType {
  token?: string
  message?: string
}

export interface LoginResponseData {
  code: number
  data: dataType
}

interface userInfo {
  userId: number
  avatar: string
  name: string
  username: string
  passward: string
  desc: string
  roles: string[]
  buttons: string[]
  routes: string[]
  token: string
}

interface user {
  checkUser: userInfo
}

export interface userInfoResponseData {
  code: number
  data: user
}
