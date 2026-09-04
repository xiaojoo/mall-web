import { request } from '@/utils/request'

enum API {
  MEMBER_PRICE_LIST_URL = '/coupon/memberprice/list',
  MEMBER_PRICE_DELETE_URL = '/coupon/memberprice/delete',
  MEMBER_PRICE_INFO_URL = '/coupon/memberprice/info',
  MEMBER_PRICE_UPDATE_COMMIT = '/coupon/memberprice',
}

export const reqMemberPriceList = (page: number, limit: number, key: string) =>
  request.get<any, any>(
    API.MEMBER_PRICE_LIST_URL + `?page=${page}&limit=${limit}&key=${key}`,
  )

export const reqMemberPriceDelete = (id: any) =>
  request.post<any, any>(API.MEMBER_PRICE_DELETE_URL, id)

export const reqMemberPriceInfo = (id: number) =>
  request.get<any, any>(API.MEMBER_PRICE_INFO_URL + `/${id}`)

// UPDATE提交
export const reqMemberPriceUpdateCommit = (
  type: string,
  id: number,
  skuId: string,
  memberLevelId: string,
  memberLevelName: string,
  memberPrice: string,
  addOther: string,
) => {
  if (type == 'save') {
    return request.post<any, any>(API.MEMBER_PRICE_UPDATE_COMMIT + `/${type}`, {
      skuId,
      memberLevelId,
      memberLevelName,
      memberPrice,
      addOther,
    })
  } else {
    return request.post<any, any>(API.MEMBER_PRICE_UPDATE_COMMIT + `/${type}`, {
      id,
      skuId,
      memberLevelId,
      memberLevelName,
      memberPrice,
      addOther,
    })
  }
}
