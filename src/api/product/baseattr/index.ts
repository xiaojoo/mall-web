import { request } from '@/utils/request'

enum API {
  // 获取规则参数列表
  BASE_ATTR_LIST_URL = '/product/attr',
  // 规则参数列表
  INIT_ATTR_LIST_URL = '/product/attr/info',
  // 添加规则参数列表
  ADD_ATTR_LIST_URL = '/product/attr',
  // 路径变化
  PATH_ATTR_LIST_URL = '/product/attrgroup/list',
  // 删除规则参数
  DELETE_ATTR_URL = '/product/attr/delete',
  // 批量添加规则参数
  ATTR_BATCH_SAVE_URL = '/product/attr/batchSave',
}

// 获取分类信息
export const reqBaseAttrList = (
  attrType: string,
  catId: number,
  page: number,
  limit: number,
  key: string,
) =>
  request.get<any, any>(
    API.BASE_ATTR_LIST_URL +
      `/${attrType}/list/${catId}?page=${page}&limit=${limit}&key=${key}`,
  )

// 路径变化
export const reqPathAttrList = (path: any, page: number, limit: number) =>
  request.get<any, any>(
    API.PATH_ATTR_LIST_URL + `/${path}?page=${page}&limit=${limit}`,
  )

// 规则参数列表
export const reqInitAttrList = (attrId: number) =>
  request.get<any, any>(API.INIT_ATTR_LIST_URL + `/${attrId}`)

// 添加规则参数
export const reqAddResponseData = (
  url: string,
  attrId: number,
  attrName: string,
  searchType: number,
  icon: string,
  valueSelect: string,
  attrType: number,
  enable: number,
  catelogId: string,
  attrGroupId: string,
  showDesc: number,
) => {
  if (attrId < 0) {
    return request.post<any, any>(API.ADD_ATTR_LIST_URL + `/${url}`, {
      attrName,
      searchType,
      icon,
      valueSelect,
      attrType,
      enable,
      // 空字符串会导致后端 Long 反序列化 400，置空为 null
      catelogId: catelogId || null,
      attrGroupId: attrGroupId || null,
      showDesc,
    })
  } else {
    return request.post<any, any>(API.ADD_ATTR_LIST_URL + `/${url}`, {
      attrId,
      attrName,
      searchType,
      icon,
      valueSelect,
      attrType,
      enable,
      catelogId: catelogId || null,
      attrGroupId: attrGroupId || null,
      showDesc,
    })
  }
}

// 删除规则参数
export const reqDeleteAttrResponseData = (postData: any[]) => {
  return request.post<any, any>(API.DELETE_ATTR_URL, postData)
}

// 批量添加规则参数（后端逐条保存，单条失败不影响其他条）
export const reqAttrBatchSave = (data: any[]) =>
  request.post<any, any>(API.ATTR_BATCH_SAVE_URL, data)
