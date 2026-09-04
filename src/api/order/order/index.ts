import { request } from '@/utils/request'

enum API {
  ORDER_LIST_URL = '/order/order/list',
  ORDER_INFO_URL = '/order/order/info',
  ORDER_INFO_BY_SN_URL = '/order/order/infoBySn',
  ORDER_UPDATE_URL = '/order/order/update',
  ORDER_DELETE_URL = '/order/order/delete',
  ORDER_DELETE_BY_SN_URL = '/order/order/deleteBySn',
}

// 订单列表（key：订单号/会员名模糊；status 空串 = 全部）
export const reqOrderList = (
  page: number,
  limit: number,
  key: string,
  status: number | '',
) =>
  request.get<any, any>(
    API.ORDER_LIST_URL +
      `?page=${page}&limit=${limit}&key=${key}` +
      (status !== '' && status != null ? `&status=${status}` : ''),
  )

// 订单详情（按订单号，业务主键）
export const reqOrderInfoBySn = (orderSn: string) =>
  request.get<any, any>(API.ORDER_INFO_BY_SN_URL + `/${orderSn}`)

// 修改订单（发货/关闭：传 orderSn + 变更字段）
export const reqOrderUpdate = (data: any) =>
  request.post<any, any>(API.ORDER_UPDATE_URL, data)

// 删除订单（传 id 数组）
export const reqOrderDelete = (ids: number[]) =>
  request.post<any, any>(API.ORDER_DELETE_URL, ids)

// 删除订单（按订单号）
export const reqOrderDeleteBySn = (orderSns: string[]) =>
  request.post<any, any>(API.ORDER_DELETE_BY_SN_URL, orderSns)
