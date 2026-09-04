export interface ResponseData {
  code: number
  msg: string
}

// 已有属性ts数据类型
export interface Relation {
  attrId: number
  attrName: string
  searchType: number
  valueType: number
  icon: string
  valueSelect: string
  attrType: number
  enable: number
  catelogId: number
  showDesc: number
}

export interface AttrGroup {
  attrGroupId: number
  attrGroupName: string
  sort: number
  descript: string
  icon: string
  catelogId: number
  catelogPath: []
}

// 属性分类类型
export interface PostData {
  attrId: number
  attrGroupId: number
}

// 属性修改数据
// 后端 Result 结构：{code, message, data: AttrGroup}
export interface AttrGroupResponseData extends ResponseData {
  data: AttrGroup
}

// 包含全部分类数据的ts
export type Records = Relation[]

// 获取已有全部分类的数据ts类型
export interface RelationResponseData extends ResponseData {
  data: Records
}
