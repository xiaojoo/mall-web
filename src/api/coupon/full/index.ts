import { request } from '@/utils/request'

enum API {
  SKU_FULL_REDUCTION_LIST_URL = '/coupon/skufullreduction/list',
  SKU_FULL_REDUCTION_DELETE_URL = '/coupon/skufullreduction/delete',
  SKU_FULL_REDUCTION_INFO_URL = '/coupon/skufullreduction/info',
  SKU_FULL_REDUCTION_UPDATE_COMMIT = '/coupon/skufullreduction',
}

export const reqSkuFullReductionList = (
  page: number,
  limit: number,
  key: string,
) =>
  request.get<any, any>(
    API.SKU_FULL_REDUCTION_LIST_URL + `?page=${page}&limit=${limit}&key=${key}`,
  )

export const reqSkuFullReductionDelete = (id: any) =>
  request.post<any, any>(API.SKU_FULL_REDUCTION_DELETE_URL, id)

export const reqSkuFullReductionInfo = (id: number) =>
  request.get<any, any>(API.SKU_FULL_REDUCTION_INFO_URL + `/${id}`)

// UPDATE提交
export const reqSkuFullReductionUpdateCommit = (
  type: string,
  id: number,
  skuId: string,
  fullPrice: string,
  reducePrice: string,
  addOther: string,
) => {
  if (type == 'save') {
    return request.post<any, any>(
      API.SKU_FULL_REDUCTION_UPDATE_COMMIT + `/${type}`,
      {
        skuId,
        fullPrice,
        reducePrice,
        addOther,
      },
    )
  } else {
    return request.post<any, any>(
      API.SKU_FULL_REDUCTION_UPDATE_COMMIT + `/${type}`,
      {
        id,
        skuId,
        fullPrice,
        reducePrice,
        addOther,
      },
    )
  }
}
