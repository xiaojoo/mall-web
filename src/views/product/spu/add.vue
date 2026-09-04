<template>
  <el-row>
    <el-col :span="24" class="col-box-show">
      <el-steps :active="step" align-center finish-status="success">
        <el-step title="基本信息"></el-step>
        <el-step title="规格参数"></el-step>
        <el-step title="销售属性"></el-step>
        <el-step title="SKU信息"></el-step>
        <el-step title="保存完成"></el-step>
      </el-steps>
    </el-col>
    <el-col :span="24" v-show="step == 0">
      <el-card class="box-card">
        <el-form :model="spu" label-width="120px">
          <el-form-item label="商品名称" prop="spuName">
            <el-input v-model="spu.spuName"></el-input>
          </el-form-item>
          <el-form-item label="商品描述" prop="spuDescription">
            <el-input v-model="spu.spuDescription"></el-input>
          </el-form-item>
          <el-form-item label="选择分类" prop="catalogId">
            <Cascader></Cascader>
          </el-form-item>
          <el-form-item label="选择品牌" prop="brandId">
            <Select></Select>
          </el-form-item>
          <el-form-item label="商品重量(Kg)" prop="weight">
            <el-input-number
              v-model="spu.weight"
              :min="0"
              :precision="3"
              :step="0.1"
            ></el-input-number>
          </el-form-item>
          <el-form-item label="设置金币" prop="bounds">
            <el-input-number
              placeholder="金币"
              v-model="spu.bounds.buyBounds"
              :min="0"
              controls-position="right"
            ></el-input-number>
          </el-form-item>
          <el-form-item label="设置成长值" prop="bounds">
            <el-input-number
              placeholder="成长值"
              v-model="spu.bounds.growBounds"
              :min="0"
              controls-position="right"
            >
              <template slot="prepend">成长值</template>
            </el-input-number>
          </el-form-item>
          <el-form-item label="商品介绍" prop="decript">
            <native-upload v-model="spu.decript" :limit="9" />
          </el-form-item>
          <el-form-item label="商品图片" prop="images">
            <single-upload v-model="spu.images" />
          </el-form-item>
          <el-form-item>
            <el-button type="success" @click="collectSpuBaseInfo">
              下一步：设置基本参数
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </el-col>
    <el-col :span="24" v-show="step == 1">
      <el-card class="box-card">
        <el-tabs tab-position="left" style="width: 98%">
          <el-tab-pane
            :label="group.attrGroupName"
            v-for="(group, gIdx) in dataResp.attrGroups"
            :key="group.attrGroupId"
          >
            <!-- 遍历属性,每个tab-pane对应一个表单，每个属性是一个表单项  spu.baseAttrs[0] = [{attrId:xx,val:}]-->
            <el-form ref="form" :model="spu" label-width="120px">
              <el-form-item
                :label="attr.attrName"
                v-for="(attr, aidx) in group.attrs"
                :key="attr.attrId"
              >
                <el-input
                  v-model="dataResp.baseAttrs[gIdx][aidx].attrId"
                  v-show="false"
                ></el-input>
                <el-select
                  v-model="dataResp.baseAttrs[gIdx][aidx].attrValues"
                  :multiple="attr.valueType == 1"
                  filterable
                  allow-create
                  default-first-option
                  placeholder="请选择或输入值"
                >
                  <el-option
                    v-for="(val, vIdx) in attr.valueSelect.split(';')"
                    :key="vIdx"
                    :label="val"
                    :value="val"
                  ></el-option>
                </el-select>
                <el-checkbox
                  v-model="dataResp.baseAttrs[gIdx][aidx].showDesc"
                  :true-value="1"
                  :false-value="0"
                >
                  快速展示
                </el-checkbox>
              </el-form-item>
            </el-form>
          </el-tab-pane>
        </el-tabs>
        <div style="margin: auto">
          <el-button type="primary" @click="prevStep">上一步</el-button>
          <el-button type="success" @click="generateSaleAttrs">
            下一步：设置销售属性
          </el-button>
        </div>
      </el-card>
    </el-col>
    <el-col :span="24" v-show="step == 2">
      <el-card class="box-card">
        <div class="clearfix">
          <span>选择销售属性</span>
        </div>

        <el-form ref="saleform" :model="spu" class="sale-attr-form">
          <el-form-item
            :label="attr.attrName"
            v-for="(attr, aidx) in dataResp.saleAttrs"
            :key="attr.attrId"
            class="sale-attr-item"
          >
            <el-input
              v-model="dataResp.tempSaleAttrs[aidx].attrId"
              v-show="false"
            ></el-input>

            <!-- 销售属性 checkbox -->
            <el-checkbox-group
              v-model="dataResp.tempSaleAttrs[aidx].attrValues"
              class="sale-checkbox-group"
            >
              <el-checkbox
                v-if="dataResp.saleAttrs[aidx].valueSelect != ''"
                v-for="val in dataResp.saleAttrs[aidx].valueSelect.split(';')"
                :key="val"
                :value="val"
                class="sale-checkbox"
              >
                {{ val }}
              </el-checkbox>

              <!-- 自定义 -->
              <div class="sale-custom-wrapper">
                <el-button
                  v-show="!inputVisible[aidx].view"
                  class="button-new-tag"
                  size="small"
                  @click="showInput(aidx)"
                >
                  + 自定义
                </el-button>

                <el-input
                  v-show="inputVisible[aidx].view"
                  v-model="inputValue[aidx].val"
                  :ref="'saveTagInput' + aidx"
                  size="small"
                  class="sale-custom-input"
                  @keyup.enter="handleInputConfirm(aidx)"
                  @blur="handleInputConfirm(aidx)"
                ></el-input>
              </div>
            </el-checkbox-group>
          </el-form-item>
        </el-form>
        <el-button type="primary" @click="prevStep">上一步</el-button>
        <el-button type="success" @click="generateSkus">
          下一步：设置SKU信息
        </el-button>
      </el-card>
    </el-col>
    <el-col :span="24" v-show="step == 3">
      <el-card class="box-card">
        <el-table :data="spu.skus" style="width: 100%" :row-key="getRowKey">
          <el-table-column label="属性组合">
            <el-table-column
              :label="item.attrName"
              v-for="(item, index) in dataResp.tableAttrColumn"
              :key="item.attrId"
            >
              <template #default="scope">
                <span style="margin-left: 10px">
                  {{ scope.row.attr[index].attrValue }}
                </span>
              </template>
            </el-table-column>
          </el-table-column>
          <el-table-column label="商品名称" prop="skuName">
            <template #default="scope">
              <el-input v-model="scope.row.skuName"></el-input>
            </template>
          </el-table-column>
          <el-table-column label="标题" prop="skuTitle">
            <template #default="scope">
              <el-input v-model="scope.row.skuTitle"></el-input>
            </template>
          </el-table-column>
          <el-table-column label="副标题" prop="skuSubtitle">
            <template #default="scope">
              <el-input v-model="scope.row.skuSubtitle"></el-input>
            </template>
          </el-table-column>
          <el-table-column label="价格" prop="price">
            <template #default="scope">
              <el-input v-model="scope.row.price"></el-input>
            </template>
          </el-table-column>
          <el-table-column type="expand">
            <template #default="scope">
              <!-- 商品图 / SKU上传图 / 上传按钮 全部放同一个 flex 容器 -->
              <div class="image-card-flex-out">
                <!-- 细节图标题：与图片同行 -->
                <div class="detail-img-title">商品细节</div>

                <!-- 商品原始图片 -->
                <el-card
                  v-for="(img, index) in spu.images"
                  :key="'spu-' + index"
                  class="image-card-flex"
                  :body-style="{ padding: '0px' }"
                >
                  <img :src="img" class="sku-image" alt="" />

                  <div class="image-flex">
                    <div class="image-flex-line">
                      <el-radio-group v-model="scope.row.defaultImgIndex">
                        <el-radio :value="index">设为默认</el-radio>
                      </el-radio-group>
                    </div>
                  </div>
                </el-card>

                <!-- SKU 自己上传的图片 -->
                <el-card
                  v-for="(img, j) in scope.row.uploadImages || []"
                  :key="'upload-' + j"
                  class="image-card-flex upload-img-card"
                  :body-style="{ padding: '0px' }"
                >
                  <img :src="img" class="sku-image" alt="" />

                  <span
                    class="upload-img-del"
                    @click="removeUploadImg(scope.row, j)"
                  >
                    ×
                  </span>

                  <div class="image-flex">
                    <div class="image-flex-line">
                      <el-radio-group v-model="scope.row.defaultImgIndex">
                        <el-radio :value="spu.images.length + j">
                          设为默认
                        </el-radio>
                      </el-radio-group>
                    </div>
                  </div>
                </el-card>

                <!-- 上传图片按钮 -->
                <div class="upload-list">
                  <native-upload
                    v-model="scope.row.uploadImages"
                    :limit="9"
                    hideList
                  />
                </div>
              </div>

              <!-- 折扣、满减、会员价 -->
              <div class="sku-promo-wrapper">
                <el-form
                  :model="scope.row"
                  class="sku-promo-form"
                  label-width="90px"
                  label-position="left"
                >
                  <!-- 折扣 -->
                  <el-form-item label="设置折扣">
                    <div class="promo-line">
                      <span>满</span>

                      <el-input-number
                        v-model="scope.row.fullCount"
                        class="promo-number"
                        :min="0"
                        controls-position="right"
                      />

                      <span>件</span>

                      <span class="promo-text">打</span>

                      <el-input-number
                        v-model="scope.row.discount"
                        class="promo-number"
                        :precision="2"
                        :max="1"
                        :min="0"
                        :step="0.01"
                        controls-position="right"
                      />

                      <span>折</span>

                      <el-checkbox
                        v-model="scope.row.countStatus"
                        :true-value="1"
                        :false-value="0"
                        class="promo-checkbox"
                      >
                        可叠加优惠
                      </el-checkbox>
                    </div>
                  </el-form-item>

                  <!-- 满减 -->
                  <el-form-item label="设置满减">
                    <div class="promo-line">
                      <span>满</span>

                      <el-input-number
                        v-model="scope.row.fullPrice"
                        class="promo-number"
                        :step="100"
                        :min="0"
                        controls-position="right"
                      />

                      <span>元</span>

                      <span class="promo-text">减</span>

                      <el-input-number
                        v-model="scope.row.reducePrice"
                        class="promo-number"
                        :step="10"
                        :min="0"
                        controls-position="right"
                      />

                      <span>元</span>

                      <el-checkbox
                        v-model="scope.row.priceStatus"
                        :true-value="1"
                        :false-value="0"
                        class="promo-checkbox"
                      >
                        可叠加优惠
                      </el-checkbox>
                    </div>
                  </el-form-item>

                  <!-- 会员价 -->
                  <el-form-item
                    label="设置会员价"
                    v-if="scope.row.memberPrice.length > 0"
                    label-position="top"
                  >
                    <div class="member-price-list">
                      <div
                        v-for="(mp, mpidx) in scope.row.memberPrice"
                        :key="mp.id"
                        class="member-price-line"
                      >
                        <span class="member-name">
                          {{ mp.name }}
                        </span>

                        <span class="member-price-label">优</span>

                        <el-input-number
                          v-model="scope.row.memberPrice[mpidx].price"
                          class="promo-number"
                          :precision="2"
                          :min="0"
                          controls-position="right"
                        />
                      </div>
                    </div>
                  </el-form-item>
                </el-form>
              </div>
            </template>
          </el-table-column>
        </el-table>
        <div class="next-bottom">
          <el-button type="primary" @click="prevStep">上一步</el-button>
          <el-button el-button type="success" @click="submitSkus">
            下一步：保存商品信息
          </el-button>
        </div>
      </el-card>
    </el-col>
    <el-col :span="24" v-show="step == 4">
      <el-card class="box-card" style="margin: 20px auto">
        <h1>保存成功</h1>
        <el-button type="primary" @click="addAgain">继续添加</el-button>
      </el-card>
    </el-col>
  </el-row>
</template>
<script setup lang="ts">
import Cascader from '@/views/common/cascader.vue'
import Select from '@/views/common/select.vue'
import NativeUpload from '@/components/upload/nativeUpload.vue'
import SingleUpload from '@/components/upload/singleNativeUpload.vue'
import { ref, watch } from 'vue'
import { reqAttrsList, reqBaseList, reqSaveSpu } from '@/api/product/spu'
import { reqMemberLevelList } from '@/api/coupon/coupon'
import catBrandStore from '@/store/modules/spu.ts'
import { storeToRefs } from 'pinia'

interface Sku {
  attr: Array<{ attrId: any; attrName: string; attrValue: any }>
  skuName: string
  price: number
  skuTitle: string
  skuSubtitle: string
  images: Array<{ imgUrl: string; defaultImg: number }>
  descar: string[]
  fullCount: number
  discount: number
  countStatus: number
  fullPrice: number
  reducePrice: number
  priceStatus: number
  memberPrice: Array<{ id: number; name: string; price: number }>
  defaultImgIndex: number
  uploadImages?: string[]
}

const step = ref(0)
const spu = ref<{
  spuName: string
  spuDescription: string
  catalogId: number
  brandId: number
  weight: number
  publishStatus: number
  decript: any[]
  images: any[]
  bounds: {
    buyBounds: number
    growBounds: number
  }
  baseAttrs: { attrId: number; attrValues: string; showDesc: number }[]
  skus: Sku[]
}>({
  spuName: '',
  spuDescription: '',
  catalogId: 0,
  brandId: 0,
  weight: 0,
  publishStatus: 0,
  decript: [],
  images: [],
  bounds: {
    buyBounds: 0,
    growBounds: 0,
  },
  baseAttrs: [{ attrId: 0, attrValues: '', showDesc: 0 }],
  skus: [],
})

const inputVisible = ref<{ view: boolean }[]>([{ view: false }])
const inputValue = ref<{ val: string }[]>([{ val: '' }])
const dataResp = ref({
  attrGroups: [
    {
      attrGroupId: 0,
      attrGroupName: '',
      attrs: [
        {
          attrId: 0,
          attrName: '',
          valueType: 0,
          valueSelect: '',
        },
      ],
    },
  ], // 后台返回的所有数据
  baseAttrs: [
    [
      {
        attrId: 0,
        attrValues: '',
        showDesc: 0,
      },
    ],
  ],
  saleAttrs: [
    {
      attrId: 0,
      attrName: '',
      searchType: 0,
      valueType: 0,
      icon: '',
      valueSelect: '',
      attrType: 0,
      enable: 0,
      catelogId: 0,
      showDesc: 0,
      attrGroupId: null,
      catelogName: '',
      groupName: null,
      catelogPath: null,
    },
  ],
  tempSaleAttrs: [
    {
      attrId: 0,
      attrValues: [],
      attrName: '',
    },
  ],
  tableAttrColumn: [
    {
      attrId: 0,
      attrValues: [],
      attrName: '',
    },
  ],
  memberLevels: [
    {
      id: 0,
      name: '',
      price: 0,
      priviledgeMemberPrice: 0,
    },
  ],
  steped: [false, false, false, false, false],
})
const catPtahStore = catBrandStore()
const { catPath, brandId } = storeToRefs(catPtahStore)

// 上一步
const prevStep = () => {
  if (step.value > 0) step.value--
}

// 下一步
const nextStep = () => {
  if (step.value < 4) step.value++
}

watch(brandId, (newBrandId: any) => {
  // 品牌随 store 同步；分类变更时 Select 组件已自行清空品牌，这里不做额外重置
  // （catalogId===0 时重置会导致已选品牌被误清，校验误报“请选择品牌”）
  spu.value.brandId = newBrandId || 0
})

watch(catPath, (newCatPath) => {
  if (newCatPath && newCatPath.length > 0) {
    spu.value.catalogId = newCatPath[newCatPath.length - 1]
  } else {
    spu.value.catalogId = 0
    spu.value.brandId = 0
  }
})

const collectSpuBaseInfo = async () => {
  // 校验：基本信息必填
  if (!spu.value.spuName || !spu.value.spuName.trim()) {
    ElMessage.warning('请填写商品名称')
    return
  }
  if (!spu.value.catalogId) {
    ElMessage.warning('请选择商品分类')
    return
  }
  if (!spu.value.brandId) {
    // 兜底同步：下拉已选但 watch 未及时同步/被分类变更误清时，从 store 直接取值
    if (catPtahStore.brandId) {
      spu.value.brandId = catPtahStore.brandId
    } else {
      ElMessage.warning('请选择品牌')
      return
    }
  }
  if (!spu.value.images || spu.value.images.length === 0) {
    ElMessage.warning('请上传商品图片')
    return
  }
  nextStep()
  if (!dataResp.value.steped[0]) {
    try {
      const response = await reqBaseList(spu.value.catalogId)
      if (response && response.code === 200) {
        dataResp.value.baseAttrs = response.data.map((item: any) =>
          (item.attrs || []).map((attr: any) => ({
            attrId: attr.attrId,
            attrValues: '',
            showDesc: attr.showDesc,
          })),
        )
        // dataResp.value.steped[0] = true
        dataResp.value.attrGroups = response.data
      }
    } catch (error) {
      console.error('SPU设置基本参数', error)
    }
  }
}

// step-2
const generateSaleAttrs = () => {
  // 校验：规格参数全部填写
  const allAttrs = (dataResp.value.baseAttrs || []).flat()
  if (allAttrs.length === 0) {
    ElMessage.warning('当前分类没有规格参数，请返回上一步检查')
    return
  }
  const emptyAttr = allAttrs.find((a: any) => {
    const v = a.attrValues
    return (
      v == null || (typeof v === 'string' ? v.trim() === '' : v.length === 0)
    )
  })
  if (emptyAttr) {
    ElMessage.warning('请填写完整的规格参数后再继续')
    return
  }
  nextStep()
  spu.value.baseAttrs = []
  dataResp.value.baseAttrs.map((item: any) => {
    item.map((attr: any) => {
      let { attrId, attrValues, showDesc } = attr
      if (attrValues && attrValues.length > 0) {
        if (attrValues instanceof Array) {
          attrValues = attrValues.join(';')
        }
        spu.value.baseAttrs.push({ attrId, attrValues, showDesc })
      }
    })
  })
  getShowSaleAttr()
}

const getShowSaleAttr = async () => {
  if (!dataResp.value.steped[1]) {
    try {
      const response = await reqAttrsList(spu.value.catalogId, 100, 1)
      if (response && response.code === 200) {
        console.log(response.data.list)
        dataResp.value.saleAttrs = response.data.list || []
        console.log(dataResp.value.saleAttrs)
        // 重置数组而非在占位元素上追加：否则模板按 aidx 索引时错位一位，
        // 第一个销售属性的值会记到占位元素（attrId=0）上，导致提交的销售属性 id 为 0
        dataResp.value.tempSaleAttrs = []
        inputVisible.value = []
        inputValue.value = []
        dataResp.value.saleAttrs.map((item: any) => {
          dataResp.value.tempSaleAttrs.push({
            attrId: item.attrId,
            attrValues: [],
            attrName: item.attrName,
          })
          inputVisible.value.push({ view: false })
          inputValue.value.push({ val: '' })
        })
        // dataResp.value.steped[1] = true
      }
    } catch (error) {
      console.log('销售属性:' + error)
    }
  }
}

const showInput = (idx: number) => {
  inputVisible.value[idx].view = true
}

const handleInputConfirm = (idx: number) => {
  let input = inputValue.value[idx].val
  if (input) {
    if (dataResp.value.saleAttrs[idx].valueSelect === '') {
      dataResp.value.saleAttrs[idx].valueSelect = input
    } else {
      dataResp.value.saleAttrs[idx].valueSelect += ';' + input
    }
  }
  inputVisible.value[idx].view = false
  inputValue.value[idx].val = ''
}

// step-3
const generateSkus = async () => {
  // 校验：至少选择一个销售属性值
  const hasSaleAttr = (dataResp.value.tempSaleAttrs || []).some(
    (a: any) => a.attrValues && a.attrValues.length > 0,
  )
  if (!hasSaleAttr) {
    ElMessage.warning('请至少选择一个销售属性值（勾选或自定义）')
    return
  }
  nextStep()
  // 加载会员等级（生成 SKU 会员价列表需要；之前从未加载导致 memberPrice 恒为空）
  try {
    const resp: any = await reqMemberLevelList(1, 100)
    if (resp?.code === 200) {
      dataResp.value.memberLevels = resp.data?.list || []
    } else {
      dataResp.value.memberLevels = []
    }
  } catch {
    console.error('加载会员等级失败')
    dataResp.value.memberLevels = []
  }
  let selectValues: Array<{ attrValues: any[] }> = []
  dataResp.value.tableAttrColumn = []
  dataResp.value.tempSaleAttrs.map((item: any) => {
    if (item.attrValues.length > 0) {
      selectValues.push({ attrValues: item.attrValues })
      dataResp.value.tableAttrColumn.push({
        attrId: item.attrId,
        attrValues: item.attrValues,
        attrName: item.attrName,
      })
    }
  })
  let descartesArray = descartes(selectValues)
  console.log(JSON.stringify(descartesArray))
  let skus: Sku[] = []
  descartesArray.forEach((descartesItem) => {
    let attrArray: Array<{ attrId: any; attrName: string; attrValue: any }> = [] // sku属性组
    descartesItem.forEach((de, index) => {
      // 构造saleAttr信息
      let saleAttrItem = {
        attrId: dataResp.value.tableAttrColumn[index].attrId,
        attrName: dataResp.value.tableAttrColumn[index].attrName,
        attrValue: de,
      }
      attrArray.push(saleAttrItem)
    })

    let imgs: Array<{ imgUrl: string; defaultImg: number }> = []
    // SKU 图片继承第一步上传的商品图集，第一张为默认图（可在展开行用单选修改）
    spu.value.images.forEach((item: any, idx: number) => {
      imgs.push({ imgUrl: item, defaultImg: idx === 0 ? 1 : 0 })
    })
    // 会员价，也必须在循环里面生成，否则会导致数据绑定问题
    let memberPrices: Array<{ id: number; name: string; price: number }> = []
    if (dataResp.value.memberLevels.length > 0) {
      for (let i = 0; i < dataResp.value.memberLevels.length; i++) {
        if (dataResp.value.memberLevels[i].priviledgeMemberPrice === 1) {
          memberPrices.push({
            id: dataResp.value.memberLevels[i].id,
            name: dataResp.value.memberLevels[i].name,
            price: 0,
          })
        }
      }
    }

    let res = hasAndReturnSku(spu.value.skus, descartesItem)
    if (res === null) {
      skus.push({
        attr: attrArray,
        skuName: spu.value.spuName + ' ' + descartesItem.join(' '),
        price: 0,
        skuTitle: spu.value.spuName + ' ' + descartesItem.join(' '),
        skuSubtitle: '',
        images: imgs,
        descar: descartesItem,
        fullCount: 0,
        discount: 0,
        countStatus: 0,
        fullPrice: 0.0,
        reducePrice: 0.0,
        priceStatus: 0,
        memberPrice: [...memberPrices],
        defaultImgIndex: 0,
        uploadImages: [],
      })
    } else {
      skus.push(res)
    }
  })
  spu.value.skus = skus
  console.log('结果!!!', spu.value.skus, dataResp.value.tableAttrColumn)
}

const hasAndReturnSku = (skus: Array<Sku>, descar: string[]): Sku | null => {
  let res: Sku | null = null

  if (skus.length > 0) {
    for (let i = 0; i < skus.length; i++) {
      if (skus[i].descar.join(' ') === descar.join(' ')) {
        res = skus[i]
        break
      }
    }
  }
  return res
}

// 笛卡尔积运算
const descartes = (list: { attrValues: any[] }[]): any[][] => {
  if (!Array.isArray(list) || list.length === 0) return []

  let result: any[][] = []
  let point: number[] = new Array(list.length).fill(0)
  let temp: any[] = []
  let pIndex = 0
  while (true) {
    // 生成当前组合
    temp = list.map((obj) => obj.attrValues[point[list.indexOf(obj)]])
    result.push([...temp]) // 深拷贝保存当前组合
    // 更新指针，生成下一组数据
    for (pIndex = list.length - 1; pIndex >= 0; pIndex--) {
      if (point[pIndex] + 1 < list[pIndex].attrValues.length) {
        point[pIndex]++
        break
      }
      point[pIndex] = 0 // 当前位重置，进位
    }
    if (pIndex < 0) break // 结束条件：所有指针回归到 0
  }
  return result
}

// step-4
const getRowKey = (item: any) => {
  return spu.value.skus.indexOf(item).toString()
}

// 删除SKU上传的图片（若删的是默认图则重置默认图为第一张）
const removeUploadImg = (row: any, j: number) => {
  const n = spu.value.images.length
  if (row.defaultImgIndex === n + j) {
    row.defaultImgIndex = 0
  }
  row.uploadImages.splice(j, 1)
}

// 保存
const submitSkus = () => {
  // 校验：SKU 信息必填
  if (!spu.value.skus || spu.value.skus.length === 0) {
    ElMessage.warning('请先生成SKU信息')
    return
  }
  const emptySku = spu.value.skus.find(
    (s: any) => !s.skuName || !String(s.skuName).trim(),
  )
  if (emptySku) {
    ElMessage.warning('SKU名称不能为空')
    return
  }
  console.log('~~~~~', JSON.stringify(spu.value))
  ElMessageBox.confirm('将要提交商品数据，需要一小段时间，是否继续?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      // 合并每行SKU上传的图片进 sku.images（去重）
      spu.value.skus.forEach((sku: any) => {
        const spuImgCount = sku.images.length // 合并前 = 图集数量
        const extra: string[] = sku.uploadImages || []
        const existing = new Set(sku.images.map((i: any) => i.imgUrl))
        extra.forEach((url: string) => {
          if (url && !existing.has(url)) {
            sku.images.push({ imgUrl: url, defaultImg: 0 })
          }
        })
        // 按单选下标（图集部分 0..n-1，上传部分 n..n+m-1）算出默认图 URL，再按 URL 精确标记
        const idx = sku.defaultImgIndex ?? 0
        let defaultUrl = ''
        if (idx < spuImgCount) {
          defaultUrl = sku.images[idx]?.imgUrl || ''
        } else {
          defaultUrl = extra[idx - spuImgCount] || ''
        }
        sku.images.forEach((img: any) => {
          img.defaultImg = img.imgUrl === defaultUrl ? 1 : 0
        })
      })
      // 销售属性值一并提交（入库 + ES 索引，供高级筛选按销售属性过滤）
      const submittedAttrIds = new Set(
        spu.value.baseAttrs.map((a: any) => a.attrId),
      )
      dataResp.value.tempSaleAttrs.forEach((item: any) => {
        if (
          item.attrValues &&
          item.attrValues.length > 0 &&
          !submittedAttrIds.has(item.attrId)
        ) {
          spu.value.baseAttrs.push({
            attrId: item.attrId,
            attrValues: item.attrValues.join(';'),
            showDesc: 0,
          })
        }
      })
      const response = await reqSaveSpu(spu.value)
      if (response && response.code === 200) {
        ElMessage({
          type: 'success',
          message: '保存SPU信息成功',
        })
        nextStep()
      } else {
        ElMessage.error(response?.message || '保存SPU失败')
      }
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: '取消保存SPU信息',
      })
    })
}
const addAgain = () => {
  step.value = 0
  resetSpuData()
}

const resetSpuData = () => {
  spu.value = {
    spuName: '',
    spuDescription: '',
    catalogId: 0,
    brandId: 0,
    weight: 0,
    publishStatus: 0,
    decript: [],
    images: [],
    bounds: {
      buyBounds: 0,
      growBounds: 0,
    },
    baseAttrs: [],
    skus: [],
  }
}
</script>
<style scoped lang="scss">
.box-card {
  width: 100%;
  margin: 20px auto;
}

.col-box-show {
  -webkit-box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.el-steps--horizontal {
  padding: 20px;
}

.next-bottom {
  padding: 15px 0;
}

.image-card-flex-out {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: flex-start;
  width: 100%;
}

.image-card-flex {
  position: relative;
  width: 148px;
  height: 148px;
  margin: 20px 8px 10px 0;
  box-sizing: border-box;
}

.sku-image {
  display: block;
  width: 148px;
  height: 148px;
  object-fit: cover;
}

/* 上传按钮卡片：与图片卡片同尺寸同间距，NativeUpload 放里面 */
.upload-list {
  width: 148px;
  height: 148px;
  margin: 20px 8px 10px 0;
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  box-sizing: border-box;
}

.upload-list :deep(.el-upload) {
  width: 148px;
  height: 148px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-list :deep(.el-upload-dragger) {
  width: 148px;
  height: 148px;
  box-sizing: border-box;
}

.upload-img-card {
  position: relative;
}

.upload-img-del {
  position: absolute;
  right: 4px;
  top: 4px;
  width: 20px;
  height: 20px;
  line-height: 18px;
  text-align: center;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  border-radius: 50%;
  font-size: 15px;
  cursor: pointer;
  z-index: 2;
}

.img-style {
  background: #f5f7fa;
  line-height: 44px;
}

.image-flex {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  width: auto;
  margin: 0;
  padding: 4px 0;
  justify-content: center;
  background: rgba(0, 0, 0, 0.45);

  :deep(.el-radio__label) {
    color: #fff;
  }
}

.image-checkbox {
  flex-wrap: nowrap;
}

/* =========================================================
   销售属性
   ========================================================= */

.sale-attr-form {
  width: 100%;
  margin-top: 20px;
}

.sale-attr-item {
  margin-bottom: 18px;
}

.sale-attr-item :deep(.el-form-item__content) {
  display: flex;
  align-items: center;
  min-height: 32px;
}

/* checkbox-group 使用 flex：勾选项与自定义按钮同行，自动换行 */
.sale-checkbox-group {
  display: flex !important;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px 18px;
  width: 100%;
  min-height: 32px;
}

.sale-checkbox {
  display: inline-flex !important;
  align-items: center;
  margin-left: 0 !important;
  margin-right: 0 !important;
  white-space: nowrap;
}

.sale-custom-wrapper {
  display: inline-flex;
  align-items: center;
  margin-left: 2px;
}

.sale-custom-input {
  width: 150px;
}

/* =========================================================
   SKU 优惠
   ========================================================= */

.sku-promo-wrapper {
  width: 100%;
  margin-top: 20px;
}

.sku-promo-form {
  width: 100%;
}

.sku-promo-form :deep(.el-form-item) {
  margin-bottom: 12px;
}

.sku-promo-form :deep(.el-form-item__label) {
  font-weight: 500;
  color: #606266;
}

.sku-promo-form :deep(.el-form-item__content) {
  display: flex;
  align-items: center;
  min-height: 32px;
}

/* 折扣 / 满减 */
.promo-line {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  min-height: 32px;
}

.promo-number {
  width: 160px !important;
}

.promo-text {
  margin-left: 10px;
}

.promo-checkbox {
  margin-left: 18px !important;
  margin-right: 0 !important;
  white-space: nowrap;
}

/* 会员价 */
.member-price-list {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.member-price-line {
  display: flex;
  align-items: center;
  min-height: 42px;
  margin-bottom: 8px;
}

.member-name {
  width: 90px;
  color: #606266;
  text-align: left;
}

.member-price-label {
  margin-right: 8px;
}

/* SKU 信息表格：单元格 12px 内边距 */
:deep(.el-table tbody td) {
  padding: 12px;
}

/* SKU 细节图上传区标题 */
.detail-img-title {
  align-self: center;
  width: 104px;
  margin: 0 8px 0 0;
  font-size: 14px;
  font-weight: 500;
  color: #606266;
  white-space: nowrap;
}

.el-tag,
.image-radio {
  vertical-align: middle;
}

.image-radio {
  margin-top: -2px;
  margin-right: 5px;
}
</style>
