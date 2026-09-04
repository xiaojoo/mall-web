import { request } from '@/utils/request'
import type { CategoryResponseData, UpdateNode } from './type.ts'

enum API {
  // 获取分类列表
  CATEGORY_LIST_URL = '/product/category/list/tree',
  // 添加分类
  ADD_CATEGORY_URL = '/product/category/save',
  // 根据catId获取分类信息
  CATEGORY_INFO_URL = '/product/category/info',
  // 修改分类
  UPDATE_CATEGORY_URL = '/product/category/update',
  // 删除分类
  DELETE_CATEGORY_URL = '/product/category/delete',
  // 批量保存分类排序
  SORT_CATEGORY_URL = '/product/category/update/sort',
}

// 获取分类信息
export const reqCategoryList = () =>
  request.get<any, any>(API.CATEGORY_LIST_URL)

// 添加分类
export const reqAddCategory = (
  name: String,
  parentCid: number,
  catLevel: number,
  showStatus: number,
  sort: number,
  icon: String,
  productUnit: String,
) =>
  request.post<any, any>(API.ADD_CATEGORY_URL, {
    name: name,
    parentCid: parentCid,
    catLevel: catLevel,
    showStatus: showStatus,
    sort: sort,
    icon: icon,
    productUnit: productUnit,
  })

// 获取分类信息
export const reqCategoryCatIdInfo = (catId: null) =>
  request.get<any, CategoryResponseData>(API.CATEGORY_INFO_URL + `/${catId}`)

// 修改分类
export const reqUpdateCategory = (
  catId: null,
  name: String,
  icon: String,
  productUnit: String,
) =>
  request.post<any, any>(API.UPDATE_CATEGORY_URL, {
    catId: catId,
    name: name,
    icon: icon,
    productUnit: productUnit,
  })

// 删除分类
export const reqDeleteCategory = (catId: null[]) =>
  request.post<any, any>(API.DELETE_CATEGORY_URL, catId)

// 分类排序
export const reqSortCategory = (CategoryData: UpdateNode[]) =>
  request.post<any, any>(API.SORT_CATEGORY_URL, CategoryData)
