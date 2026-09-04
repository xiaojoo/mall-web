export interface ResponseData {
  code: number
  msg: string
}

// ts数据类型
export interface Info {
  catelogId: number
  brandId: number
  min: number
  max: number
  page: number
  limit: number
  key: string
}

export interface Brand {
  brandId: number
  brandName: string
}

export interface brandResponseData extends ResponseData {
  code: number
  data: Brand
}
