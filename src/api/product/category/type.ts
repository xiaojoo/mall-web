export interface ResponseData {
  code: number
  msg: string
}

// 已有分类ts数据类型
export interface Category {
  catId: null
  name: string
  parentCid: number
  catLevel: number
  showStatus: number
  sort: number
  icon: string
  productUnit: string
  productCount: number
}

// 分类排序
export interface UpdateNode {
  catId: number
  sort: number
  parentCid: number
  catLevel: number
}

// 包含全部分类数据的ts
export type Records = Category[]

// 获取已有全部分类的数据ts类型
export interface CategoryResponseData extends ResponseData {
  data: Category
}
