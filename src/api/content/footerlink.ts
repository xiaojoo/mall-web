import { request } from '@/utils/request'

enum API {
  LIST_URL = '/coupon/footerlink/admin/list',
  INFO_URL = '/coupon/footerlink/info',
  SAVE_URL = '/coupon/footerlink/save',
  UPDATE_URL = '/coupon/footerlink/update',
  DELETE_URL = '/coupon/footerlink/delete',
}

// 管理端分页查询（key=列标题/链接名模糊，status=0/1）
export const reqFooterLinkList = (
  page: number,
  limit: number,
  key: string,
  status: string,
) =>
  request.get<any, any>(
    API.LIST_URL +
      `?page=${page}&limit=${limit}&key=${encodeURIComponent(key)}&status=${status}`,
  )

export const reqFooterLinkInfo = (id: number) =>
  request.get<any, any>(API.INFO_URL + `/${id}`)

export const reqFooterLinkSave = (data: any) =>
  request.post<any, any>(API.SAVE_URL, data)

export const reqFooterLinkUpdate = (data: any) =>
  request.post<any, any>(API.UPDATE_URL, data)

export const reqFooterLinkDelete = (ids: any[]) =>
  request.post<any, any>(API.DELETE_URL, ids)
