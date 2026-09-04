<template>
  <el-row>
    <el-col :span="24">
      <el-form :inline="true" :model="dataForm">
        <el-form-item label="分类">
          <Cascader :catelogPath="catelogPath"></Cascader>
        </el-form-item>
        <el-form-item label="品牌">
          <Select style="width: 160px"></Select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select style="width: 160px" v-model="dataForm.status" clearable>
            <el-option label="新建" :value="0"></el-option>
            <el-option label="上架" :value="1"></el-option>
            <el-option label="下架" :value="2"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="检索">
          <el-input
            style="width: 160px"
            v-model="dataForm.key"
            clearable
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="searchSpuInfo">查询</el-button>
        </el-form-item>
      </el-form>
    </el-col>
    <el-col :span="24">
      <Info :catId="catId" :dataFormSpu="dataForm" ref="childList"></Info>
    </el-col>
  </el-row>
</template>

<script setup lang="ts">
import Cascader from '@/views/common/cascader.vue'
import Select from '@/views/common/select.vue'
import Info from './info.vue'
import { reactive, ref } from 'vue'

const catId = ref(0)
const catelogPath = ref(0)
const dataForm = reactive({
  status: '',
  key: '',
  brandId: 0,
  catelogId: 0,
})
const childList = ref<InstanceType<typeof Info> | null>(null)

const searchSpuInfo = () => {
  childList.value?.getDataList()
}
</script>

<style scoped lang="scss"></style>
