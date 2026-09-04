import { request } from '@/utils/request'

enum API {
  SKU_LADDER_LIST_URL = '/coupon/skuladder/list',
  SKU_LADDER_DELETE_URL = '/coupon/skuladder/delete',
  SKU_LADDER_INFO_URL = '/coupon/skuladder/info',
  SKU_LADDER_UPDATE_COMMIT = '/coupon/skuladder',
}

export const reqSkuLadderList = (page: number, limit: number, key: string) =>
  request.get<any, any>(
    API.SKU_LADDER_LIST_URL + `?page=${page}&limit=${limit}&key=${key}`,
  )

export const reqSkuLadderDelete = (id: any) =>
  request.post<any, any>(API.SKU_LADDER_DELETE_URL, id)

export const reqSkuLadderInfo = (id: number) =>
  request.get<any, any>(API.SKU_LADDER_INFO_URL + `/${id}`)

// UPDATE提交
export const reqSkuLadderUpdateCommit = (
  type: string,
  id: number,
  skuId: string,
  fullCount: string,
  discount: string,
  price: string,
  addOther: string,
) => {
  if (type == 'save') {
    return request.post<any, any>(API.SKU_LADDER_UPDATE_COMMIT + `/${type}`, {
      skuId,
      fullCount,
      discount,
      price,
      addOther,
    })
  } else {
    return request.post<any, any>(API.SKU_LADDER_UPDATE_COMMIT + `/${type}`, {
      id,
      skuId,
      fullCount,
      discount,
      price,
      addOther,
    })
  }
}
