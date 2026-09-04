import { request } from '@/utils/request'

enum API {
  LIST_URL = '/coupon/promo/admin/list',
  INFO_URL = '/coupon/promo/info',
  SAVE_URL = '/coupon/promo/save',
  UPDATE_URL = '/coupon/promo/update',
  DELETE_URL = '/coupon/promo/delete',
}

// 管理端分页查询（key=标题/描述模糊，status=0/1）
export const reqPromoList = (
  page: number,
  limit: number,
  key: string,
  status: string,
) =>
  request.get<any, any>(
    API.LIST_URL +
      `?page=${page}&limit=${limit}&key=${encodeURIComponent(key)}&status=${status}`,
  )

export const reqPromoInfo = (id: number) =>
  request.get<any, any>(API.INFO_URL + `/${id}`)

export const reqPromoSave = (data: any) =>
  request.post<any, any>(API.SAVE_URL, data)

export const reqPromoUpdate = (data: any) =>
  request.post<any, any>(API.UPDATE_URL, data)

export const reqPromoDelete = (ids: any[]) =>
  request.post<any, any>(API.DELETE_URL, ids)
