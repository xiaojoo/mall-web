import { request } from '@/utils/request'

// 仓库库存列表（按 skuId 过滤，返回 wms_ware_sku 行：每行一个仓库的 stock/stockLocked）
export const reqWareSkuList = (skuId: number | string, limit = 100) =>
  request.get<any, any>(
    `/ware/waresku/list?page=1&limit=${limit}&skuId=${skuId}`,
  )
