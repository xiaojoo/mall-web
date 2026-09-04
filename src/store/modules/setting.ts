import { defineStore } from 'pinia'

const useLayOutSettingStore = defineStore('SettingStore', {
  state: () => {
    return {
      isCollapse: false,
      refresh: false,
    }
  },
})

export default useLayOutSettingStore
