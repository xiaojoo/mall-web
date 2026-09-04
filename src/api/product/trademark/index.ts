import { request } from '@/utils/request'
import type { TradeMarkResponseData, TradeMark } from './type'

enum API {
  TRADEMARK_URL = '/product/brand/list',
  STATUS_URL = '/product/brand/update/status',
  // 添加品牌
  ADD_TRADEMARK_URL = '/product/brand/save',
  // 修改品牌
  UPDATE_TRADEMARK_URL = '/product/brand/update',
  // 删除品牌
  DELETE_TRADEMARK_URL = '/product/brand/delete',
  // 批量添加品牌
  BATCH_SAVE_TRADEMARK_URL = '/product/brand/batchSave',
  // 获取品牌
  TRADEMARK_INFO_URL = '/product/brand/info',
  // 获取关联
  CATELOG_INFO_URL = '/product/categorybrandrelation/catelog/list',
  // 保存关联
  SAVE_CATELOG_URL = '/product/categorybrandrelation/catelog/save',
  // 删除关联
  DELETE_CATELOG_URL = '/product/categorybrandrelation/delete',
}

export const reqTrademark = (page: number, limit: number, key: string) =>
  request.get<any, TradeMarkResponseData>(
    API.TRADEMARK_URL + `?page=${page}&limit=${limit}&key=${key}`,
  )

// 品牌显示状态
export const reqStatus = (brandId: number, showStatus: number) =>
  request.post<any, any>(API.STATUS_URL, {
    brandId: brandId,
    showStatus: showStatus,
  })

// 添加或者修改已有品牌接口
export const reqAddOrUpdateTrademark = (data: TradeMark) => {
  if (data.brandId) {
    // 修改已有品牌
    return request.post<any, any>(API.UPDATE_TRADEMARK_URL, data)
  } else {
    // 添加品牌
    return request.post<any, any>(API.ADD_TRADEMARK_URL, data)
  }
}

// 删除品牌
export const reqDeleteTrademark = (data: any) => {
  return request.post<any, any>(API.DELETE_TRADEMARK_URL, data)
}

// 批量添加品牌（后端逐条保存，单条失败不影响其他条）
export const reqBatchSaveTrademark = (data: TradeMark[]) =>
  request.post<any, any>(API.BATCH_SAVE_TRADEMARK_URL, data)

// 获取品牌信息
export const reqTrademarkInfo = (brandId: number) =>
  request.get<any, any>(API.TRADEMARK_INFO_URL + `/${brandId}`)

// 获取关联
export const reqCatelogInfo = (brandId: number) => {
  return request.get<any, any>(API.CATELOG_INFO_URL + `?brandId=${brandId}`)
}

// 保存关联
export const reqCatelogSave = (brandId: number, catelogId: number) => {
  return request.post<any, any>(API.SAVE_CATELOG_URL, { brandId, catelogId })
}

// 删除关联
export const reqDeleteCatelog = (id: number[]) => {
  return request.post<any, any>(API.DELETE_CATELOG_URL, id)
}
