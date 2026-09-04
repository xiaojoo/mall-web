import { request } from '@/utils/request'

enum API {
  // 获取分类列表
  WARE_SKU_URL = '/ware/waresku/list',
  // 删除库存
  WARE_SKU_DELETE_URL = '/ware/waresku/delete',
  // UPDATE获取信息
  WARE_SKU_INFO_LIST = '/ware/waresku/info',
  // UPDATE提交
  WARE_SKU_UPDATE_COMMIT = '/ware/waresku',
  // SKU搜索（skuId/skuName，下拉选择用，必须带关键字）
  SKU_OPTIONS_URL = '/product/skuinfo/search',
}

// 搜索SKU（skuId/skuName，供库存添加/修改下拉选择）
export const reqSkuOptions = (key: string) =>
  request.get<any, any>(API.SKU_OPTIONS_URL + `?key=${encodeURIComponent(key)}`)

// 获取分类信息
export const reqWareSkuInfoList = (
  page: number,
  limit: number,
  skuId: string,
  wareId: string,
) =>
  request.get<any, any>(
    API.WARE_SKU_URL +
      `?page=${page}&limit=${limit}&skuId=${skuId}&wareId=${wareId}`,
  )

// 删除仓库
export const reqWareSkuDelete = (ids: any) => {
  return request.post<any, any>(API.WARE_SKU_DELETE_URL, ids)
}

// UPDATE获取信息
export const reqWareSkuInfo = (id: number) =>
  request.get<any, any>(API.WARE_SKU_INFO_LIST + `/${id}`)

// UPDATE提交
export const reqWareSkuUpdateCommit = (
  type: string,
  id: number,
  skuId: number | undefined,
  wareId: string,
  stock: number,
  skuName: string,
  stockLocked: number,
) => {
  if (type == 'save') {
    return request.post<any, any>(API.WARE_SKU_UPDATE_COMMIT + `/${type}`, {
      skuId,
      wareId,
      stock,
      skuName,
      stockLocked,
    })
  } else {
    return request.post<any, any>(API.WARE_SKU_UPDATE_COMMIT + `/${type}`, {
      id,
      skuId,
      wareId,
      stock,
      skuName,
      stockLocked,
    })
  }
}

// 按父级查询子分类（树形懒加载）
export const reqCategoryChildren = (parentCid: number) =>
  request.get<any, any>(`/product/category/list/${parentCid}`)

// 查询SKU分类路径（编辑回显）
export const reqSkuPath = (skuId: number) =>
  request.get<any, any>(`/product/skuinfo/path/${skuId}`)

// 按分类查询SKU（树形第四级）
export const reqSkuByCatelog = (catelogId: number) =>
  request.get<any, any>(
    `/product/skuinfo/list?catelogId=${catelogId}&page=1&limit=100000`,
  )
