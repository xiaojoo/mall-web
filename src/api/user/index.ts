// 统一管理用户相关接口
import { request } from '@/utils/request'
import type { LoginFormData, LoginResponseData } from './type'

enum API {
  // mock数据
  // LOGIN_URL = '/user/login',
  // USERINFO_URL = '/user/info',
  // LOGIN_URL = '/admin/acl/index/login',
  // USERINFO_URL = '/admin/acl/index/info',
  // LOGOUT_URL = '/admin/acl/index/logout',
  LOGIN_URL = '/sys/login',
  USERINFO_URL = '/sys/user/info',
  LOGOUT_URL = '/sys/logout',
  CAPTCHA_URL = '/captcha',
}

export const reqLogin = (data: LoginFormData) =>
  request.post<any, LoginResponseData>(API.LOGIN_URL, data)

export const reqUserInfo = () => request.get<any, any>(API.USERINFO_URL)

export const reqLogOut = () => request.post<any, any>(API.LOGOUT_URL)

// 获取登录验证码
export const captchaInfo = () => request.get<any, any>(API.CAPTCHA_URL)
