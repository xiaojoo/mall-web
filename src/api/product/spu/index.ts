import { request } from '@/utils/request'

enum API {
  SPU_INFO_URL = '/product/spuinfo/list',
  SPU_UP_URL = '/product/spuinfo',
  BRAND_LIST_URL = '/product/categorybrandrelation/brands/list',
  SPU_BASE_URL = '/product/attrgroup',
  SPU_ATTRS_URL = '/product/attr/sale/list',
  SPU_ATTRS_SAVE = '/product/spuinfo/save',
  SKU_INFO_LIST = '/product/skuinfo/list',
  SPU_DELETE_URL = '/product/spuinfo/delete',
}

export const reqSpuInfo = (params: any) => {
  // 过滤掉值为0的catelogId、brandId、min、max，以及key为空字符串的情况
  const filteredParams = Object.fromEntries(
    Object.entries(params).filter(([key, value]) => {
      if (['catelogId', 'brandId', 'min', 'max'].includes(key))
        return value !== 0
      if (key === 'key') return value !== ''
      return true
    }),
  )
  return request.get<any, any>(API.SPU_INFO_URL, {
    params: Object.keys(filteredParams).length ? filteredParams : undefined,
  })
}

export const reqBrandList = (catId: any) =>
  request.get<any, any>(API.BRAND_LIST_URL + `?catId=${catId}`)

export const reqUpSpu = (id: number) =>
  request.post<any, any>(`${API.SPU_UP_URL}/${id}/up`)

// 下架（删除ES中上架数据并更新状态）
export const reqDownSpu = (id: number) =>
  request.post<any, any>(`${API.SPU_UP_URL}/${id}/down`)
export const reqBaseList = (catalogId: number) =>
  request.get<any, any>(API.SPU_BASE_URL + `/${catalogId}` + '/withattr')

export const reqAttrsList = (catalogId: number, limit: number, page: number) =>
  request.get<any, any>(
    API.SPU_ATTRS_URL + `/${catalogId}?limit=${limit}&page=${page}`,
  )

export const reqSaveSpu = (spu: any) =>
  request.post<any, any>(API.SPU_ATTRS_SAVE, spu)

// 批量发布商品（图片直接传 URL，逐个保存并自动上架）
export const reqBatchPublish = (data: any[]) =>
  request.post<any, any>('/product/spuinfo/batchPublish', data)

export const reqSkuInfoList = (
  catelogId: number,
  brandId: number,
  page: number,
  limit: number,
  key: string,
  min: number,
  max: number,
) =>
  request.get<any, any>(
    API.SKU_INFO_LIST +
      `?catelogId=${catelogId}&brandId=${brandId}&page=${page}&limit=${limit}&min=${min}&max=${max}&key=${key}`,
  )

// 删除SPU（后端级联删除其下所有SKU及关联数据）
export const reqDeleteSpu = (ids: any) =>
  request.post<any, any>(API.SPU_DELETE_URL, ids)

// SKU详情（含图集）
export const reqSkuDetail = (skuId: number) =>
  request.get<any, any>(`/product/skuinfo/detail/${skuId}`)

// 修改SKU基本信息
export const reqSkuUpdate = (data: any) =>
  request.post<any, any>('/product/skuinfo/update', data)

// SKU 图片新增（商品介绍图）
export const reqSkuImagesSave = (data: any) =>
  request.post<any, any>('/product/skuimages/save', data)

// SKU 图片删除
export const reqSkuImagesDelete = (ids: number[]) =>
  request.post<any, any>('/product/skuimages/delete', ids)

// SPU 商品细节图更新（decript 逗号分隔）
export const reqSpuInfoDescUpdate = (data: any) =>
  request.post<any, any>('/product/spuinfodesc/update', data)
