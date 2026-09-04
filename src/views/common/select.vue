<template>
  <el-select placeholder="请选择" v-model="brandId" filterable clearable>
    <el-option
      v-for="item in brands"
      :key="item.brandId"
      :label="item.brandName"
      :value="item.brandId"
    ></el-option>
  </el-select>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import catBrandStore from '@/store/modules/spu'
import { reqBrandList } from '@/api/product/spu'
import { storeToRefs } from 'pinia'

const catId = ref(0)
const brands = ref([
  {
    brandName: 'a',
    brandId: 1,
  },
])
const brandId = ref('')
const brandStore = catBrandStore()
const { catPath } = storeToRefs(brandStore)

watch(brandId, (val: any) => {
  brandStore.setBrandId(val || 0)
})

watch(catPath, (newValue) => {
  brandId.value = ''
  if (newValue && newValue.length > 0) {
    catId.value = newValue[newValue.length - 1]
    getCatBrands()
  }
})

// watch([brandId, catPath], ([newBrandId, newCatPath]) => {
//   brandStore.setBrandId(newBrandId)
//   if (newCatPath && newCatPath.length > 0) {
//     catId.value = newCatPath[newCatPath.length - 1]
//     getCatBrands()
//   } else {
//     catId.value = 0
//   }
// })

const getCatBrands = async () => {
  try {
    const response = await reqBrandList(catId.value)
    if (response.code == 200) {
      brands.value = response.data
    }
  } catch (error) {
    console.error(error)
  }
}

onMounted(() => {
  getCatBrands()
})
</script>

<style scoped lang="scss"></style>
