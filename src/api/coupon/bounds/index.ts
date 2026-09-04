import { request } from '@/utils/request'

enum API {
  SPU_BOUNDS_LIST_URL = '/coupon/spubounds/list',
  SPU_BOUNDS_DELETE_URL = '/coupon/spubounds/delete',
  SPU_BOUNDS_INFO_URL = '/coupon/spubounds/info',
  SPU_BOUNDS_UPDATE_COMMIT = '/coupon/spubounds',
}

export const reqSpuBoundsList = (page: number, limit: number, key: string) =>
  request.get<any, any>(
    API.SPU_BOUNDS_LIST_URL + `?page=${page}&limit=${limit}&key=${key}`,
  )

export const reqSpuBoundsDelete = (id: any) =>
  request.post<any, any>(API.SPU_BOUNDS_DELETE_URL, id)

export const reqSpuBoundsInfo = (id: number) =>
  request.get<any, any>(API.SPU_BOUNDS_INFO_URL + `/${id}`)

// UPDATE提交
export const reqSpuBoundsUpdateCommit = (
  type: string,
  id: number,
  spuId: string,
  growBounds: string,
  buyBounds: string,
  work: string,
) => {
  if (type == 'save') {
    return request.post<any, any>(API.SPU_BOUNDS_UPDATE_COMMIT + `/${type}`, {
      spuId,
      growBounds,
      buyBounds,
      work,
    })
  } else {
    return request.post<any, any>(API.SPU_BOUNDS_UPDATE_COMMIT + `/${type}`, {
      id,
      spuId,
      growBounds,
      buyBounds,
      work,
    })
  }
}
