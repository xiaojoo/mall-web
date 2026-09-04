import { request } from '@/utils/request'
import type {
  AttrGroupResponseData,
  PostData,
  RelationResponseData,
} from '@/api/product/attrgroup/type.ts'

enum API {
  // 获取分类列表
  ATTRGROUP_LIST_URL = '/product/attrgroup/list',
  // 获取属性列表
  RELATION_LIST_URL = '/product/attrgroup',
  // 获取属性信息
  ATTRGROUP_INFO_URL = '/product/attrgroup/info',
  // 获取属性信息
  ATTRGROUP_DELETE_URL = '/product/attrgroup/delete',
  // 属性分类删除
  RELATION_DELETE_URL = '/product/attrgroup/attr/relation/delete',
  // 批量添加属性分组
  ATTRGROUP_BATCH_SAVE_URL = '/product/attrgroup/batchSave',
  // 添加属性关联
  RELATION_ADD_URL = '/product/attrgroup/attr/relation',
  // 移除关联
  RELATION_DEL_URL = '/product/attrgroup/attr/relation/delete',
}

// 获取分类信息
export const reqAttrGroupList = (
  catId: number,
  page: number,
  limit: number,
  key: string,
) =>
  request.get<any, any>(
    API.ATTRGROUP_LIST_URL +
      `?catelogId=${catId}&page=${page}&limit=${limit}&key=${key}`,
  )

// 获取属性列表
export const reqRelationList = (
  attrGroupId: number,
  page: number,
  limit: number,
  key: string,
) =>
  request.get<any, RelationResponseData>(
    API.RELATION_LIST_URL +
      `/${attrGroupId}` +
      '/noattr/relation' +
      `?page=${page}&limit=${limit}&key=${key}`,
  )

// 获取属性信息
export const reqAttrGroup = (attrGroupId: number) =>
  request.get<any, AttrGroupResponseData>(
    API.ATTRGROUP_INFO_URL + `/${attrGroupId}`,
  )

// 添加属性信息
export const reqAddResponseData = (
  url: string,
  attrGroupId: number,
  attrGroupName: string,
  sort: number,
  descript: string,
  icon: string,
  catelogId: number,
) => {
  return request.post<any, any>(API.RELATION_LIST_URL + `/${url}`, {
    attrGroupId,
    attrGroupName,
    sort,
    descript,
    icon,
    catelogId,
  })
}

// 批量添加属性分组（后端逐条保存，单条失败不影响其他条）
export const reqAttrGroupBatchSave = (data: any[]) =>
  request.post<any, any>(API.ATTRGROUP_BATCH_SAVE_URL, data)

// 删除属性信息
export const reqDeleteResponseData = (ids: any) => {
  return request.post<any, any>(API.ATTRGROUP_DELETE_URL, ids)
}

// 删除属性分类
export const reqDeleteRelationResponseData = (postData: PostData[]) => {
  return request.post<any, any>(API.RELATION_DELETE_URL, postData)
}

// 属性分类初始化
export const reqAttrInit = (attrGroupId: number) =>
  request.get<any, any>(
    API.RELATION_LIST_URL + `/${attrGroupId}` + '/attr/relation',
  )

// 属性分类初始化列表
export const reqAttrInitList = (
  attrGroupId: number,
  page: number,
  limit: number,
  key: string,
) =>
  request.get<any, any>(
    API.RELATION_LIST_URL +
      `/${attrGroupId}` +
      '/noattr/relation' +
      `?page=${page}&limit=${limit}&key=${key}`,
  )

// 添加属性关联
export const reqAddRelationResponseData = (postData: PostData[]) => {
  return request.post<any, any>(API.RELATION_ADD_URL, postData)
}

// 移除关联
export const reqDelRelationResponseData = (data: any) => {
  return request.post<any, any>(API.RELATION_DEL_URL, data)
}
