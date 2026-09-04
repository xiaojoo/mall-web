import { request } from '@/utils/request'

enum API {
  // 获取分类列表
  CATEGORY_CASCADER_URL = '/product/category/list/tree',
}

// 获取分类信息
export const reqCategoryCascader = () =>
  request.get<any, any>(API.CATEGORY_CASCADER_URL)
