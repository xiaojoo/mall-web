import { request } from '@/utils/request'

enum API {
  LIST_URL = '/coupon/ticker/admin/list',
  INFO_URL = '/coupon/ticker/info',
  SAVE_URL = '/coupon/ticker/save',
  UPDATE_URL = '/coupon/ticker/update',
  DELETE_URL = '/coupon/ticker/delete',
}

// 管理端分页查询（key=公告内容模糊，status=0/1）
export const reqTickerList = (
  page: number,
  limit: number,
  key: string,
  status: string,
) =>
  request.get<any, any>(
    API.LIST_URL + `?page=${page}&limit=${limit}&key=${key}&status=${status}`,
  )

export const reqTickerInfo = (id: number) =>
  request.get<any, any>(API.INFO_URL + `/${id}`)

export const reqTickerSave = (data: any) =>
  request.post<any, any>(API.SAVE_URL, data)

export const reqTickerUpdate = (data: any) =>
  request.post<any, any>(API.UPDATE_URL, data)

export const reqTickerDelete = (ids: any[]) =>
  request.post<any, any>(API.DELETE_URL, ids)
