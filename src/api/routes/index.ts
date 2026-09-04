// 统一管理用户相关接口
import { request } from '@/utils/request'

enum API {
  MENU_ROUTE_URL = '/sys/menu/nav',
}

export const routesUrl = () => request.get<any, any>(API.MENU_ROUTE_URL)
