export interface ResponseData {
  code: number
  msg: string
}

// 已有的品牌的ts数据类型
export interface TradeMark {
  brandId?: number
  name: string
  logo: string
  descript: string
  showStatus: number
  firstLetter: string
  sort: number
}

// 包含全部品牌数据的ts
export type Records = TradeMark[]

// 获取已有全部品牌的数据ts类型
export interface TradeMarkResponseData extends ResponseData {
  page: {
    totalCount: number
    pageSize: number
    totalPage: number
    currPage: number
    list: Records
  }
}
