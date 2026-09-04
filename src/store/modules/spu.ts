import { defineStore } from 'pinia'
import type { CatBrandState } from './types/type.ts'

const catBrandStore = defineStore('Brand', {
  // 数据存储
  state: (): CatBrandState => {
    return {
      catPath: [],
      brandId: 0,
    }
  },
  // 异步、逻辑处理
  actions: {
    setCatPath(catPathSub: number[]) {
      this.catPath = catPathSub
    },
    setBrandId(brandIdSub: number) {
      this.brandId = brandIdSub
    },
    clearData() {
      this.catPath = []
      this.brandId = 0
    },
  },
  getters: {},
})

export default catBrandStore
