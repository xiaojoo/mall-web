import { request } from '@/utils/request'

enum API {
  LIST_URL = '/coupon/homenav/admin/list',
  INFO_URL = '/coupon/homenav/info',
  SAVE_URL = '/coupon/homenav/save',
  UPDATE_URL = '/coupon/homenav/update',
  DELETE_URL = '/coupon/homenav/delete',
}

// 管理端分页查询（key=名称模糊，status=0/1）
export const reqHomeNavList = (
  page: number,
  limit: number,
  key: string,
  status: string,
) =>
  request.get<any, any>(
    API.LIST_URL +
      `?page=${page}&limit=${limit}&key=${encodeURIComponent(key)}&status=${status}`,
  )

export const reqHomeNavInfo = (id: number) =>
  request.get<any, any>(API.INFO_URL + `/${id}`)

export const reqHomeNavSave = (data: any) =>
  request.post<any, any>(API.SAVE_URL, data)

export const reqHomeNavUpdate = (data: any) =>
  request.post<any, any>(API.UPDATE_URL, data)

export const reqHomeNavDelete = (ids: any[]) =>
  request.post<any, any>(API.DELETE_URL, ids)
