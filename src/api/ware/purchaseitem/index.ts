import { request } from '@/utils/request'

enum API {
  // 获取分类列表
  WARE_PURCHASEDETAIL_URL = '/ware/purchasedetail/list',
  // 删除采购单
  WARE_PURCHASEDETAIL_DELETE_URL = '/ware/purchasedetail/delete',
  // UPDATE获取信息
  WARE_PURCHASEDETAIL_INFO_LIST = '/ware/purchasedetail/info',
  // UPDATE提交
  WARE_PURCHASEDETAIL_UPDATE_COMMIT = '/ware/purchasedetail',
  // 合并采购单
  WARE_PURCHASEDETAIL_MERGE = '/ware/purchase/merge',
  // 采购单列表
  WARE_PURCHASEDETAIL_UNRECEIVE = '/ware/purchase/unreceive/list',
}

// 获取分类信息
export const reqWarePurchasedetailInfoList = (
  page: number,
  limit: number,
  key: string,
  status: string,
  wareId: string,
) =>
  request.get<any, any>(
    API.WARE_PURCHASEDETAIL_URL +
      `?page=${page}&limit=${limit}&status=${status}&wareId=${wareId}&key=${key}`,
  )

// 删除采购单
export const reqWarePurchasedetailDelete = (ids: any) => {
  return request.post<any, any>(API.WARE_PURCHASEDETAIL_DELETE_URL, ids)
}

// UPDATE获取信息
export const reqWarePurchasedetailInfo = (id: number) =>
  request.get<any, any>(API.WARE_PURCHASEDETAIL_INFO_LIST + `/${id}`)

// 合并采购单
export const reqWarePurchasedetailMerge = (items: any) => {
  return request.post<any, any>(API.WARE_PURCHASEDETAIL_MERGE, items)
}

export const reqWarePurchasedetailUnreceive = () =>
  request.get<any, any>(API.WARE_PURCHASEDETAIL_UNRECEIVE)

// UPDATE提交
export const reqWarePurchasedetailUpdateCommit = (
  type: string,
  id: number,
  purchaseId: string,
  skuId: string,
  skuNum: string,
  skuPrice: string,
  wareId: string,
  status: number,
) => {
  if (type == 'save') {
    return request.post<any, any>(
      API.WARE_PURCHASEDETAIL_UPDATE_COMMIT + `/${type}`,
      {
        purchaseId,
        skuId,
        skuNum,
        skuPrice,
        wareId,
        status,
      },
    )
  } else {
    return request.post<any, any>(
      API.WARE_PURCHASEDETAIL_UPDATE_COMMIT + `/${type}`,
      {
        id,
        purchaseId,
        skuId,
        skuNum,
        skuPrice,
        wareId,
        status,
      },
    )
  }
}
