import { request } from '@/utils/request'

enum API {
  LIST_URL = '/coupon/carousel/admin/list',
  INFO_URL = '/coupon/carousel/info',
  SAVE_URL = '/coupon/carousel/save',
  UPDATE_URL = '/coupon/carousel/update',
  DELETE_URL = '/coupon/carousel/delete',
}

// 管理端分页查询（key=名称模糊，status=0/1）
export const reqCarouselList = (
  page: number,
  limit: number,
  key: string,
  status: string,
) =>
  request.get<any, any>(
    API.LIST_URL +
      `?page=${page}&limit=${limit}&key=${encodeURIComponent(key)}&status=${status}`,
  )

export const reqCarouselInfo = (id: number) =>
  request.get<any, any>(API.INFO_URL + `/${id}`)

export const reqCarouselSave = (data: any) =>
  request.post<any, any>(API.SAVE_URL, data)

export const reqCarouselUpdate = (data: any) =>
  request.post<any, any>(API.UPDATE_URL, data)

export const reqCarouselDelete = (ids: any[]) =>
  request.post<any, any>(API.DELETE_URL, ids)
