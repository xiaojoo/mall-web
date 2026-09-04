import { request } from '@/utils/request'

enum API {
  WARE_PURCHASE_UPDATE = '/ware/purchase/update',
  SYS_USER_LIST = '/sys/user/list',
  WARE_PURCHASE_LIST = '/ware/purchase/list',
  WARE_PURCHASE_DELETE = '/ware/purchase/delete',
  WARE_PURCHASE_UPDATE_COMMIT = '/ware/purchase',
  WARE_PURCHASE_INFO_LIST = '/ware/purchase/info',
}

export const reqWarePurchaseDelete = (ids: any) => {
  return request.post<any, any>(API.WARE_PURCHASE_DELETE, ids)
}

export const reqWarePurchaseInfo = (id: number) =>
  request.get<any, any>(API.WARE_PURCHASE_INFO_LIST + `/${id}`)

export const reqWarePurchaseUpdate = (items: any) => {
  return request.post<any, any>(API.WARE_PURCHASE_UPDATE, items)
}

export const reqSysUserList = (page: number, limit: number) =>
  request.get<any, any>(API.SYS_USER_LIST + `?page=${page}&limit=${limit}`)

export const reqPurchaseList = (
  page: number,
  limit: number,
  status: string,
  key: string,
) =>
  request.get<any, any>(
    API.WARE_PURCHASE_LIST +
      `?page=${page}&limit=${limit}&status=${status}&key=${key}`,
  )

// UPDATE提交
export const reqWarePurchaseUpdateCommit = (
  type: string,
  id: number,
  assigneeId: string,
  assigneeName: string,
  phone: string,
  priority: string,
  status: number,
  wareId: string,
  amount: string,
  createTime: string,
  updateTime: string,
) => {
  if (type == 'save') {
    return request.post<any, any>(
      API.WARE_PURCHASE_UPDATE_COMMIT + `/${type}`,
      {
        assigneeId,
        assigneeName,
        phone,
        priority,
        status,
        wareId,
        amount,
        createTime,
        updateTime,
      },
    )
  } else {
    return request.post<any, any>(
      API.WARE_PURCHASE_UPDATE_COMMIT + `/${type}`,
      {
        id,
        assigneeId,
        assigneeName,
        phone,
        priority,
        status,
        wareId,
        amount,
        createTime,
        updateTime,
      },
    )
  }
}
