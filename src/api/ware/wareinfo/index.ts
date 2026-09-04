import { request } from '@/utils/request'

enum API {
  // 获取分类列表
  WARE_INFO_URL = '/ware/wareinfo/list',
  // 删除仓库
  WARE_DELETE_URL = '/ware/wareinfo/delete',
  // UPDATE获取信息
  WARE_INFO_LIST = '/ware/wareinfo/info',
  // UPDATE提交
  WARE_UPDATE_COMMIT = '/ware/wareinfo',
}

// 获取分类信息
export const reqWareInfoList = (page: number, limit: number, key: string) =>
  request.get<any, any>(
    API.WARE_INFO_URL + `?page=${page}&limit=${limit}&key=${key}`,
  )

// 删除仓库
export const reqWareDelete = (ids: any) => {
  return request.post<any, any>(API.WARE_DELETE_URL, ids)
}

// UPDATE获取信息
export const reqWareInfo = (id: number) =>
  request.get<any, any>(API.WARE_INFO_LIST + `/${id}`)

// UPDATE提交
export const reqWareUpdateCommit = (
  type: string,
  id: number,
  name: string,
  address: string,
  areacode: string,
) => {
  return request.post<any, any>(API.WARE_UPDATE_COMMIT + `/${type}`, {
    id,
    name,
    address,
    areacode,
  })
}
