<template>
  <div class="mod-config">
    <el-form
      :inline="true"
      :model="dataForm"
      @keyup.enter.native="getDataList()"
    >
      <el-form :inline="true" :model="dataForm">
        <el-form-item label="分类">
          <Cascader :catelogPath="catelogPath" />
        </el-form-item>
        <el-form-item label="品牌">
          <Select style="width: 160px" />
        </el-form-item>
        <el-form-item label="价格">
          <el-input-number
            style="width: 160px"
            v-model="dataForm.price.min"
            :min="0"
          ></el-input-number>
          至
          <el-input-number
            style="width: 160px"
            v-model="dataForm.price.max"
            :min="0"
          ></el-input-number>
        </el-form-item>
        <el-form-item label="检索">
          <el-input
            style="width: 160px"
            v-model="dataForm.key"
            clearable
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="searchSkuInfo">查询</el-button>
        </el-form-item>
      </el-form>
    </el-form>
    <el-table
      :data="dataList"
      border
      v-loading="dataListLoading"
      @selection-change="selectionChangeHandle"
      style="width: 100%"
      @expand-change="getSkuDetails"
    >
      <el-table-column type="expand">
        <template #default="scope">
          <div v-if="detailMap[scope.row.skuId]" class="sku-detail">
            <el-descriptions
              :column="3"
              border
              size="small"
              class="sku-info-descriptions"
            >
              <el-descriptions-item label="SKU ID">
                {{ detailMap[scope.row.skuId].sku.skuId }}
              </el-descriptions-item>
              <el-descriptions-item label="SKU名称">
                {{ detailMap[scope.row.skuId].sku.skuName }}
              </el-descriptions-item>
              <el-descriptions-item label="SPU ID">
                {{ detailMap[scope.row.skuId].sku.spuId }}
              </el-descriptions-item>
              <el-descriptions-item label="价格">
                {{ detailMap[scope.row.skuId].sku.price }}
              </el-descriptions-item>
              <el-descriptions-item label="销量">
                {{ detailMap[scope.row.skuId].sku.saleCount }}
              </el-descriptions-item>
              <el-descriptions-item label="分类ID">
                {{ detailMap[scope.row.skuId].sku.catalogId }}
              </el-descriptions-item>
              <el-descriptions-item label="品牌ID">
                {{ detailMap[scope.row.skuId].sku.brandId }}
              </el-descriptions-item>
              <el-descriptions-item label="标题" :span="2">
                {{ detailMap[scope.row.skuId].sku.skuTitle }}
              </el-descriptions-item>
              <el-descriptions-item label="副标题" :span="3">
                {{ detailMap[scope.row.skuId].sku.skuSubtitle }}
              </el-descriptions-item>
              <el-descriptions-item label="描述" :span="3">
                {{ detailMap[scope.row.skuId].sku.skuDesc }}
              </el-descriptions-item>
              <!-- 优惠信息 / 会员价（只读展示，修改请点“修改”）——紧跟描述 -->
              <el-descriptions-item label="优惠信息" :span="3">
                {{ promoSummary(scope.row) }}
              </el-descriptions-item>
              <el-descriptions-item label="会员价" :span="3">
                {{ memberPriceText(scope.row) }}
              </el-descriptions-item>
              <el-descriptions-item label="积分信息" :span="3">
                {{ boundsText(scope.row) }}
              </el-descriptions-item>
              <el-descriptions-item label="库存">
                {{ stockText(scope.row) }}
              </el-descriptions-item>
              <el-descriptions-item label="可使用优惠券" :span="2">
                <template
                  v-if="
                    detailMap[scope.row.skuId].coupons &&
                    detailMap[scope.row.skuId].coupons.length > 0
                  "
                >
                  <el-tag
                    v-for="c in detailMap[scope.row.skuId].coupons"
                    :key="c.id"
                    size="small"
                    style="margin: 2px 6px 2px 0"
                  >
                    {{ couponText(c) }}
                  </el-tag>
                </template>
                <span v-else style="color: #999">暂无可用优惠券</span>
              </el-descriptions-item>
            </el-descriptions>
            <el-descriptions
              :column="1"
              border
              size="small"
              class="sku-img-descriptions"
              style="margin-top: 10px"
            >
              <el-descriptions-item label="商品图片">
                <el-image
                  :src="detailMap[scope.row.skuId].sku.skuDefaultImg"
                  style="width: 100px; height: 100px"
                  :preview-src-list="[
                    detailMap[scope.row.skuId].sku.skuDefaultImg,
                  ]"
                  preview-teleported
                  fit="cover"
                />
              </el-descriptions-item>
              <el-descriptions-item label="商品介绍">
                <el-image
                  v-for="(img, imgIdx) in detailMap[scope.row.skuId].images"
                  :key="img.id"
                  :src="img.imgUrl"
                  style="width: 100px; height: 100px; margin-right: 8px"
                  :preview-src-list="
                    detailMap[scope.row.skuId].images.map((i: any) => i.imgUrl)
                  "
                  :initial-index="imgIdx"
                  preview-teleported
                  fit="cover"
                />
                <span
                  v-if="
                    !detailMap[scope.row.skuId].images ||
                    detailMap[scope.row.skuId].images.length === 0
                  "
                >
                  暂无图片
                </span>
              </el-descriptions-item>
              <el-descriptions-item label="商品细节">
                <el-image
                  v-for="(url, idx) in detailMap[scope.row.skuId].decript || []"
                  :key="idx"
                  :src="url"
                  style="width: 100px; height: 100px; margin-right: 8px"
                  :preview-src-list="detailMap[scope.row.skuId].decript || []"
                  :initial-index="idx"
                  preview-teleported
                  fit="cover"
                />
                <span
                  v-if="
                    !detailMap[scope.row.skuId].decript ||
                    detailMap[scope.row.skuId].decript.length === 0
                  "
                >
                  暂无图片
                </span>
              </el-descriptions-item>
            </el-descriptions>
          </div>
          <div v-else>加载中...</div>
        </template>
      </el-table-column>
      <!--      <el-table-column-->
      <!--        type="selection"-->
      <!--        header-align="center"-->
      <!--        align="center"-->
      <!--        width="50"-->
      <!--      ></el-table-column>-->
      <el-table-column
        prop="skuId"
        header-align="center"
        align="center"
        label="skuId"
        width="200"
      ></el-table-column>
      <el-table-column
        prop="skuName"
        header-align="center"
        align="center"
        label="名称"
      ></el-table-column>
      <el-table-column
        prop="skuDefaultImg"
        header-align="center"
        align="center"
        label="默认图片"
      >
        <template #default="scope">
          <img
            :src="scope.row.skuDefaultImg"
            style="width: 80px; height: 80px"
            alt=""
          />
        </template>
      </el-table-column>
      <el-table-column
        prop="price"
        header-align="center"
        align="center"
        label="价格"
      ></el-table-column>
      <el-table-column
        prop="saleCount"
        header-align="center"
        align="center"
        label="销量"
      ></el-table-column>
      <el-table-column
        fixed="right"
        header-align="center"
        align="center"
        width="233"
        label="操作"
      >
        <template #default="scope">
          <el-button
            size="small"
            @click="openEdit(scope.row)"
            v-perms="'product:manager:update'"
          >
            修改
          </el-button>
          <el-button size="small">评论</el-button>
          <el-dropdown
            @command="handleCommand(scope.row, $event)"
            size="small"
            split-button
            style="margin: 1px 0 0 12px"
          >
            更多
            <template #dropdown>
              <el-dropdown-item command="uploadImages">
                上传图片
              </el-dropdown-item>
              <el-dropdown-item command="seckillSettings">
                参与秒杀
              </el-dropdown-item>
              <el-dropdown-item command="reductionSettings">
                满减设置
              </el-dropdown-item>
              <el-dropdown-item command="discountSettings">
                折扣设置
              </el-dropdown-item>
              <el-dropdown-item command="memberPriceSettings">
                会员价格
              </el-dropdown-item>
              <el-dropdown-item command="boundsSettings">
                积分维护
              </el-dropdown-item>
              <el-dropdown-item command="stockSettings">
                库存管理
              </el-dropdown-item>
              <el-dropdown-item command="couponSettings">
                优惠劵
              </el-dropdown-item>
            </template>
          </el-dropdown>
        </template>
      </el-table-column>
    </el-table>
    <div class="pagination-box">
      <el-pagination
        @size-change="sizeChangeHandle"
        @current-change="currentChangeHandle"
        :current-page="pageIndex"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="pageSize"
        :total="totalPage"
        layout="total, sizes, prev, pager, next, jumper"
      />
    </div>

    <!-- SKU 修改弹窗 -->
    <el-dialog
      v-model="editVisible"
      title="修改SKU"
      width="900px"
      :close-on-click-modal="false"
    >
      <el-form :model="editForm" label-width="90px">
        <el-form-item label="SKU名称">
          <el-input v-model="editForm.skuName" />
        </el-form-item>
        <el-form-item label="价格">
          <el-input-number v-model="editForm.price" :min="0" :precision="2" />
        </el-form-item>
        <el-form-item label="标题">
          <el-input v-model="editForm.skuTitle" />
        </el-form-item>
        <el-form-item label="副标题">
          <el-input v-model="editForm.skuSubtitle" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="editForm.skuDesc" type="textarea" :rows="3" />
        </el-form-item>
        <!-- 优惠信息：折扣 + 满减 -->
        <el-divider content-position="left">优惠信息</el-divider>
        <el-form-item label="设置折扣">
          <div class="promo-line">
            <span>满</span>
            <el-input-number
              v-model="editForm.promo.fullCount"
              class="promo-number"
              :min="0"
              controls-position="right"
            />
            <span>件</span>
            <span class="promo-text">打</span>
            <el-input-number
              v-model="editForm.promo.discount"
              class="promo-number"
              :precision="2"
              :max="1"
              :min="0"
              :step="0.01"
              controls-position="right"
            />
            <span>折</span>
            <el-checkbox
              v-model="editForm.promo.ladderAddOther"
              :true-value="1"
              :false-value="0"
              class="promo-checkbox"
            >
              可叠加优惠
            </el-checkbox>
          </div>
        </el-form-item>
        <el-form-item label="设置满减">
          <div class="promo-line">
            <span>满</span>
            <el-input-number
              v-model="editForm.promo.fullPrice"
              class="promo-number"
              :step="100"
              :min="0"
              controls-position="right"
            />
            <span>元</span>
            <span class="promo-text">减</span>
            <el-input-number
              v-model="editForm.promo.reducePrice"
              class="promo-number"
              :step="10"
              :min="0"
              controls-position="right"
            />
            <span>元</span>
            <el-checkbox
              v-model="editForm.promo.fullAddOther"
              :true-value="1"
              :false-value="0"
              class="promo-checkbox"
            >
              可叠加优惠
            </el-checkbox>
          </div>
        </el-form-item>

        <!-- 会员价 -->
        <el-divider content-position="left">会员价</el-divider>
        <el-form-item label="设置会员价" label-position="top">
          <div
            v-if="editForm.memberPrices && editForm.memberPrices.length"
            class="member-price-list"
          >
            <div
              v-for="mp in editForm.memberPrices"
              :key="mp.levelId"
              class="member-price-line"
            >
              <span class="member-name">{{ mp.name }}</span>
              <el-input-number
                v-model="mp.price"
                class="promo-number"
                :precision="2"
                :min="0"
                controls-position="right"
              />
              <span class="member-tip">（留空/0 表示不设置）</span>
            </div>
          </div>
          <span v-else style="color: #999">暂无会员等级</span>
        </el-form-item>

        <el-form-item label="商品图片">
          <div class="img-editor">
            <div
              class="img-box"
              @click="pickImage('default')"
              title="点击上传/替换"
            >
              <img
                v-if="editForm.skuDefaultImg"
                :src="editForm.skuDefaultImg"
                alt=""
              />
              <span v-else class="img-box-plus">＋</span>
              <span
                v-if="editForm.skuDefaultImg"
                class="img-box-del"
                @click.stop="editForm.skuDefaultImg = ''"
              >
                ×
              </span>
            </div>
          </div>
        </el-form-item>
        <el-form-item label="商品介绍">
          <div class="img-editor">
            <div
              v-for="(url, i) in editForm.skuImages"
              :key="i"
              class="img-box"
              @click="previewImage('skuImages', i)"
              title="点击查看大图"
            >
              <img :src="url" alt="" />
              <span
                class="img-box-edit"
                @click.stop="pickImage('skuImages', i)"
                title="替换图片"
              >
                ✎
              </span>
              <span
                class="img-box-del"
                @click.stop="editForm.skuImages.splice(i, 1)"
              >
                ×
              </span>
            </div>
            <div
              class="img-box img-box-add"
              @click="pickImage('skuImages')"
              title="添加图片"
            >
              <span class="img-box-plus">＋</span>
            </div>
          </div>
        </el-form-item>
        <el-form-item label="商品细节">
          <div class="img-editor">
            <div
              v-for="(url, i) in editForm.decript"
              :key="i"
              class="img-box"
              @click="previewImage('decript', i)"
              title="点击查看大图"
            >
              <img :src="url" alt="" />
              <span
                class="img-box-edit"
                @click.stop="pickImage('decript', i)"
                title="替换图片"
              >
                ✎
              </span>
              <span
                class="img-box-del"
                @click.stop="editForm.decript.splice(i, 1)"
              >
                ×
              </span>
            </div>
            <div
              class="img-box img-box-add"
              @click="pickImage('decript')"
              title="添加图片"
            >
              <span class="img-box-plus">＋</span>
            </div>
          </div>
        </el-form-item>
      </el-form>
      <!-- 大图预览（点击多图预览） -->
      <el-image-viewer
        v-if="previewVisible"
        :url-list="previewList"
        :initial-index="previewIndex"
        @close="previewVisible = false"
        teleported
      />
      <!-- 图片选择（点击图片框触发，选择后直接上传替换/新增） -->
      <input
        ref="fileInputRef"
        type="file"
        accept="image/jpeg,image/png,image/gif"
        style="display: none"
        @change="onFilePick"
      />
      <template #footer>
        <el-button @click="editVisible = false">取消</el-button>
        <el-button type="primary" @click="editSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>
<script lang="ts" setup>
import Cascader from '@/views/common/cascader.vue'
import Select from '@/views/common/select.vue'
import { ref, reactive, onMounted, watch } from 'vue'
import catBrandStore from '@/store/modules/spu.ts'
import { storeToRefs } from 'pinia'
import {
  reqSkuInfoList,
  reqSkuDetail,
  reqSkuUpdate,
  reqSkuImagesSave,
  reqSkuImagesDelete,
  reqSpuInfoDescUpdate,
} from '@/api/product/spu'
import {
  reqSkuLadderList,
  reqSkuLadderUpdateCommit,
  reqSkuLadderDelete,
} from '@/api/coupon/skuladder'
import {
  reqSkuFullReductionList,
  reqSkuFullReductionUpdateCommit,
  reqSkuFullReductionDelete,
} from '@/api/coupon/full'
import {
  reqMemberPriceList,
  reqMemberPriceUpdateCommit,
  reqMemberPriceDelete,
} from '@/api/coupon/memberprice'
import { reqMemberLevelList, reqCouponUsableList } from '@/api/coupon/coupon'
import { reqSpuBoundsList } from '@/api/coupon/bounds'
import { reqWareSkuList } from '@/api/ware'
import { getUUID } from '@/utils/time'
import { reqImage } from '@/api/file/file'

import { useRouter } from 'vue-router'

const catPtahStore = catBrandStore()
const { catPath, brandId } = storeToRefs(catPtahStore)
const dataForm = ref<{
  key: string
  brandId: number
  catelogId: number
  price: {
    min: number
    max: number
  }
}>({
  key: '',
  brandId: 0,
  catelogId: 0,
  price: {
    min: 0,
    max: 0,
  },
})
const dataList = ref([])
const pageIndex = ref(1)
const pageSize = ref(10)
const totalPage = ref(0)
const dataListLoading = ref(false)
const dataListSelections = ref<any[]>([])
// SKU 详情缓存（key=skuId，展开时懒加载，不污染行对象）
const detailMap = reactive<Record<string, any>>({})
const catelogPath = ref([])
const router = useRouter()

watch(brandId, (newBrandId: any) => {
  if (dataForm.value.catelogId === 0) {
    dataForm.value.brandId = 0
  }
  dataForm.value.brandId = newBrandId
})

watch(catPath, (newCatPath) => {
  if (newCatPath && newCatPath.length > 0) {
    dataForm.value.catelogId = newCatPath[newCatPath.length - 1]
  } else {
    dataForm.value.catelogId = 0
    dataForm.value.brandId = 0
  }
})

const getDataList = async () => {
  dataListLoading.value = true
  try {
    const response = await reqSkuInfoList(
      dataForm.value.catelogId,
      dataForm.value.brandId,
      pageIndex.value,
      pageSize.value,
      dataForm.value.key,
      dataForm.value.price.min,
      dataForm.value.price.max,
    )
    if (response && response.code === 200) {
      dataList.value = response.data.list
      totalPage.value = response.data.totalCount
    } else {
      dataList.value = []
      totalPage.value = 0
    }
    dataListLoading.value = false
  } catch (error) {}
}

const searchSkuInfo = () => {
  getDataList()
}

// 处理更多指令
const handleCommand = (row: any, command: any) => {
  const skuId = row.skuId
  if (command === 'stockSettings') {
    router.push({
      path: '/sku',
      query: { skuId },
    })
  }
  // 参与秒杀：跳到关联秒杀商品页，自动打开添加弹窗并预填 skuId
  if (command === 'seckillSettings') {
    router.push({
      path: '/seckillskurelation',
      query: { skuId },
    })
  }
  // 满减设置 → SKU 满减管理
  if (command === 'reductionSettings') {
    router.push({ path: '/full', query: { skuId } })
  }
  // 折扣设置 → SKU 阶梯折扣管理
  if (command === 'discountSettings') {
    router.push({ path: '/skuladder', query: { skuId } })
  }
  // 会员价格 → 会员价格管理
  if (command === 'memberPriceSettings') {
    router.push({ path: '/memberprice', query: { skuId } })
  }
  // 优惠券 → 优惠券管理
  if (command === 'couponSettings') {
    router.push({ path: '/coupon', query: { skuId } })
  }
  // 积分维护 → 积分维护管理
  if (command === 'boundsSettings') {
    router.push({ path: '/bounds', query: { skuId, spuId: row.spuId } })
  }
  // 上传图片：打开该 SKU 的修改弹窗（内含默认图/SKU图/详情图上传）
  if (command === 'uploadImages') {
    openEdit(row)
  }
}

const getSkuDetails = async (row: any, expandedRows: any) => {
  // 展开时按需加载详情；数据存 detailMap，不修改 row 对象（避免触发表格重渲染导致展开状态丢失）
  if (expandedRows && expandedRows.length > 0) {
    if (!detailMap[row.skuId]) {
      await refreshDetail(row.skuId)
    }
  }
}

// 上传组件绑定值（上传成功后清空，避免残留）
// 展开区只读展示，图片编辑统一在修改弹窗内进行

// 刷新展开详情
const refreshDetail = async (skuId: number) => {
  try {
    const response = await reqSkuDetail(skuId)
    if (response && response.code === 200) {
      detailMap[skuId] = response.data
      // 积分信息（按 SPU 记：spubounds/list key=spuId 过滤）
      const spuId = detailMap[skuId].sku?.spuId
      try {
        const [
          ladderRes,
          fullRes,
          priceRes,
          levelRes,
          wareRes,
          couponRes,
          boundsRes,
        ] = await Promise.all([
          reqSkuLadderList(1, 1, String(skuId)),
          reqSkuFullReductionList(1, 1, String(skuId)),
          reqMemberPriceList(1, 100, String(skuId)),
          reqMemberLevelList(1, 100),
          reqWareSkuList(skuId),
          reqCouponUsableList(skuId),
          spuId ? reqSpuBoundsList(1, 1, String(spuId)) : Promise.resolve(null),
        ])
        const ladder =
          ladderRes?.code === 200 ? ladderRes.data?.list?.[0] || null : null
        const full =
          fullRes?.code === 200 ? fullRes.data?.list?.[0] || null : null
        const prices: any[] =
          priceRes?.code === 200 ? priceRes.data?.list || [] : []
        const levels: any[] =
          levelRes?.code === 200 ? levelRes.data?.list || [] : []
        const priceMap = new Map<string, any>(
          prices.map((p: any) => [String(p.memberLevelId), p]),
        )
        detailMap[skuId].promo = {
          ladder: ladder
            ? {
                fullCount: ladder.fullCount,
                discount: ladder.discount,
                addOther: ladder.addOther,
              }
            : null,
          full: full
            ? {
                fullPrice: full.fullPrice,
                reducePrice: full.reducePrice,
                addOther: full.addOther,
              }
            : null,
          memberPrices: (levels || [])
            .map((lv: any) => {
              const p = priceMap.get(String(lv.id))
              return { name: lv.name, price: p ? Number(p.memberPrice) : null }
            })
            .filter((m: any) => m.price !== null && m.price > 0),
        }
        // 库存（ware /list 按 skuId 过滤，多仓库行求和，与库存管理页口径一致）
        const wareRows: any[] =
          wareRes?.code === 200 ? wareRes.data?.list || [] : []
        detailMap[skuId].stock = wareRows.reduce(
          (sum: number, r: any) => sum + Number(r.stock ?? 0),
          0,
        )
        // 可使用优惠券（coupon 服务已发布且在有效窗口内）
        detailMap[skuId].coupons =
          couponRes?.code === 200 ? couponRes.data || [] : []
        // 积分信息（spu_bounds，同一 SPU 下各 SKU 一致）
        detailMap[skuId].bounds =
          boundsRes?.code === 200 ? boundsRes.data?.list?.[0] || null : null
      } catch (e) {
        console.error('加载优惠信息失败', e)
      }
    }
  } catch (error) {
    console.error('SKU详情获取失败', error)
  }
}

// 库存展示（未加载时显示 —，避免误显示 0）
const stockText = (row: any): string => {
  const d = detailMap[row.skuId]
  if (!d || d.stock == null) return '—'
  return String(d.stock)
}

// 优惠券展示文本：名称（满X减Y）
const couponText = (c: any): string => {
  const name = c.couponName || `优惠券#${c.id}`
  const min = Number(c.minPoint ?? 0)
  const amount = Number(c.amount ?? 0)
  if (min > 0 && amount > 0) return `${name}（满${min}减${amount}）`
  if (amount > 0) return `${name}（减${amount}）`
  return name
}

// 展开行取优惠信息（模板里避免超长表达式）
const promoOf = (row: any) => detailMap[row.skuId]?.promo || null

// 优惠信息展示文本（折扣/满减）
const promoSummary = (row: any): string => {
  const p = promoOf(row)
  if (!p) {
    return '未设置'
  }
  const parts: string[] = []
  if (p.ladder) {
    parts.push(
      `折扣：满 ${p.ladder.fullCount} 件打 ${p.ladder.discount} 折${p.ladder.addOther === 1 ? '（可叠加）' : ''}`,
    )
  }
  if (p.full) {
    parts.push(
      `满减：满 ${p.full.fullPrice} 元减 ${p.full.reducePrice} 元${p.full.addOther === 1 ? '（可叠加）' : ''}`,
    )
  }
  return parts.length ? parts.join('；') : '未设置'
}

// 会员价展示文本
const memberPriceText = (row: any): string => {
  const p = promoOf(row)
  if (!p || !p.memberPrices.length) {
    return '未设置'
  }
  return p.memberPrices.map((m: any) => `${m.name}：${m.price}`).join('；')
}

// 积分信息展示文本（成长/购物积分 + 优惠生效位：0不赠送 1赠送）
const boundsText = (row: any): string => {
  const b = detailMap[row.skuId]?.bounds
  if (!b) {
    return '未设置'
  }
  const work = Number(b.work) || 0
  const gift = (v: number) => (v ? '赠送' : '不赠送')
  return [
    `成长积分：${b.growBounds ?? 0}`,
    `购物积分：${b.buyBounds ?? 0}`,
    `无优惠：成长${gift(work & 1)}/购物${gift(work & 2)}`,
    `有优惠：成长${gift(work & 4)}/购物${gift(work & 8)}`,
  ].join('；')
}

// ===== 图片编辑（点击图片框直接上传替换/新增，无需先删除） =====
const fileInputRef = ref<HTMLInputElement | null>(null)
const pickTarget = ref<{
  type: 'default' | 'skuImages' | 'decript'
  index?: number
} | null>(null)

// 大图预览（多图：商品介绍/商品细节，点击图片查看）
const previewVisible = ref(false)
const previewList = ref<string[]>([])
const previewIndex = ref(0)

const previewImage = (type: 'skuImages' | 'decript', index: number) => {
  const list =
    type === 'skuImages' ? editForm.value.skuImages : editForm.value.decript
  previewList.value = [...list]
  previewIndex.value = index
  previewVisible.value = true
}

const pickImage = (
  type: 'default' | 'skuImages' | 'decript',
  index?: number,
) => {
  pickTarget.value = { type, index }
  fileInputRef.value?.click()
}

const onFilePick = async (e: Event) => {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = '' // 允许重复选择同一文件
  const target = pickTarget.value
  if (!file || !target) return
  try {
    const url = await uploadOss(file)
    if (target.type === 'default') {
      editForm.value.skuDefaultImg = url
    } else if (target.type === 'skuImages') {
      if (target.index !== undefined) {
        editForm.value.skuImages[target.index] = url
      } else {
        editForm.value.skuImages.push(url)
      }
    } else if (target.type === 'decript') {
      if (target.index !== undefined) {
        editForm.value.decript[target.index] = url
      } else {
        editForm.value.decript.push(url)
      }
    }
  } catch (error) {
    console.error('上传失败', error)
    ElMessage.error('上传失败，请重试')
  } finally {
    pickTarget.value = null
  }
}

// OSS 直传（与 nativeUpload 一致：签名接口 + PostObject）
const uploadOss = async (file: File) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif']
  if (!allowedTypes.includes(file.type)) {
    ElMessage.error('图片格式错误，仅支持 jpg/png/gif!')
    throw new Error('类型不支持')
  }
  if (file.size / 1024 / 1024 > 2) {
    ElMessage.error('图片大小超过2MB!')
    throw new Error('文件过大')
  }
  const UUID = getUUID()
  const res = await reqImage(UUID)
  const key = `${res.data.dir}${UUID}_${file.name}`
  const fd = new FormData()
  fd.append('key', key)
  fd.append('policy', res.data.policy)
  fd.append('OSSAccessKeyId', res.data.accessid)
  fd.append('signature', res.data.signature)
  fd.append('success_action_status', '200')
  fd.append('file', file)
  const resp = await fetch(res.data.host, { method: 'POST', body: fd })
  if (!resp.ok) {
    throw new Error(`OSS上传失败: HTTP ${resp.status}`)
  }
  return `${res.data.host}/${key}`
}

// ===== SKU 修改 =====
const editVisible = ref(false)
const editForm = ref<any>({})

// 加载优惠信息/会员价（折扣、满减、会员价按 skuId 查询回填）
const loadPromo = async (skuId: number) => {
  const promo = editForm.value.promo
  try {
    // 折扣（阶梯价）
    const ladderRes = await reqSkuLadderList(1, 1, String(skuId))
    if (ladderRes?.code === 200 && ladderRes.data?.list?.length) {
      const l = ladderRes.data.list[0]
      promo.ladderId = l.id
      promo.fullCount = l.fullCount || 0
      promo.discount = l.discount || 0
      promo.ladderAddOther = l.addOther ?? 0
    }
    // 满减
    const fullRes = await reqSkuFullReductionList(1, 1, String(skuId))
    if (fullRes?.code === 200 && fullRes.data?.list?.length) {
      const f = fullRes.data.list[0]
      promo.fullId = f.id
      promo.fullPrice = f.fullPrice || 0
      promo.reducePrice = f.reducePrice || 0
      promo.fullAddOther = f.addOther ?? 0
    }
    // 会员价：按会员等级全量渲染，已有价格回填
    const [priceRes, levelRes] = await Promise.all([
      reqMemberPriceList(1, 100, String(skuId)),
      reqMemberLevelList(1, 100),
    ])
    const prices: any[] =
      priceRes?.code === 200 ? priceRes.data?.list || [] : []
    const levels: any[] =
      levelRes?.code === 200 ? levelRes.data?.list || [] : []
    const priceMap = new Map<string, any>(
      prices.map((p: any) => [String(p.memberLevelId), p]),
    )
    editForm.value.memberPrices = (levels || []).map((lv: any) => {
      const p = priceMap.get(String(lv.id))
      return {
        levelId: lv.id,
        name: lv.name,
        price: p ? Number(p.memberPrice) : null,
        id: p?.id || null,
      }
    })
  } catch (error) {
    console.error('加载优惠信息失败', error)
  }
}
// 打开弹窗时的图片快照，提交时用于计算增删
const editSnapshots = ref<any>({})

const openEdit = async (row: any) => {
  editForm.value = {
    skuId: row.skuId,
    skuName: row.skuName,
    price: row.price,
    skuTitle: row.skuTitle,
    skuSubtitle: row.skuSubtitle,
    skuDesc: row.skuDesc,
    skuDefaultImg: row.skuDefaultImg || '',
    skuImages: [] as string[],
    decript: [] as string[],
    promo: {
      ladderId: null,
      fullCount: 0,
      discount: 0,
      ladderAddOther: 0,
      fullId: null,
      fullPrice: 0,
      reducePrice: 0,
      fullAddOther: 0,
    },
    memberPrices: [] as any[],
  }
  editVisible.value = true
  loadPromo(row.skuId)
  // 拉取详情填充图片数据（商品介绍图集 / 商品细节 decript）
  try {
    const response = await reqSkuDetail(row.skuId)
    if (response && response.code === 200) {
      const data = response.data
      editForm.value.skuDefaultImg = data.sku?.skuDefaultImg || ''
      editForm.value.skuImages = (data.images || []).map((i: any) => i.imgUrl)
      editForm.value.decript = data.decript || []
      editSnapshots.value = {
        skuImages: [...editForm.value.skuImages],
        decript: [...editForm.value.decript],
        imagesMeta: data.images || [],
      }
    }
  } catch (error) {
    console.error('SKU详情获取失败', error)
  }
}

const editSubmit = async () => {
  const form = editForm.value
  const snap = editSnapshots.value
  try {
    // 1. 基本信息 + 商品图片（默认图）
    const res = await reqSkuUpdate({
      skuId: form.skuId,
      skuName: form.skuName,
      price: form.price,
      skuTitle: form.skuTitle,
      skuSubtitle: form.skuSubtitle,
      skuDesc: form.skuDesc,
      skuDefaultImg: form.skuDefaultImg,
    })
    if (!res || res.code !== 200) {
      ElMessage.error(res?.message || '修改失败')
      return
    }

    // 2. 商品介绍（SKU 图集）增删：新增的 save，删除的按 id delete
    const added = form.skuImages.filter(
      (u: string) => !snap.skuImages.includes(u),
    )
    const removed = snap.skuImages.filter(
      (u: string) => !form.skuImages.includes(u),
    )
    for (const url of added) {
      await reqSkuImagesSave({ skuId: form.skuId, imgUrl: url, defaultImg: 0 })
    }
    const removedIds = (snap.imagesMeta || [])
      .filter((i: any) => removed.includes(i.imgUrl))
      .map((i: any) => i.id)
    if (removedIds.length > 0) {
      await reqSkuImagesDelete(removedIds)
    }

    // 3. 商品细节（SPU decript）
    if (snap.decript.join(',') !== form.decript.join(',')) {
      const detail = detailMap[form.skuId]
      const spuId = detail?.sku?.spuId
      if (spuId) {
        const r2 = await reqSpuInfoDescUpdate({
          spuId,
          decript: form.decript.join(','),
        })
        if (!r2 || r2.code !== 200) {
          ElMessage.error(r2?.message || '商品细节保存失败')
          return
        }
      }
    }

    // 4. 优惠信息：折扣（阶梯价）——有值保存，无值且有旧记录则删除
    const p = form.promo
    if (p.fullCount > 0) {
      const ladderRes = p.ladderId
        ? await reqSkuLadderUpdateCommit(
            'update',
            p.ladderId,
            form.skuId,
            p.fullCount,
            p.discount,
            '0',
            p.ladderAddOther,
          )
        : await reqSkuLadderUpdateCommit(
            'save',
            0,
            form.skuId,
            p.fullCount,
            p.discount,
            '0',
            p.ladderAddOther,
          )
      if (!ladderRes || ladderRes.code !== 200) {
        ElMessage.error(ladderRes?.message || '折扣保存失败')
        return
      }
    } else if (p.ladderId) {
      await reqSkuLadderDelete([p.ladderId])
    }

    // 5. 优惠信息：满减
    if (p.fullPrice > 0) {
      const fullRes = p.fullId
        ? await reqSkuFullReductionUpdateCommit(
            'update',
            p.fullId,
            form.skuId,
            p.fullPrice,
            p.reducePrice,
            p.fullAddOther,
          )
        : await reqSkuFullReductionUpdateCommit(
            'save',
            0,
            form.skuId,
            p.fullPrice,
            p.reducePrice,
            p.fullAddOther,
          )
      if (!fullRes || fullRes.code !== 200) {
        ElMessage.error(fullRes?.message || '满减保存失败')
        return
      }
    } else if (p.fullId) {
      await reqSkuFullReductionDelete([p.fullId])
    }

    // 6. 会员价：逐等级保存/更新/删除
    for (const mp of form.memberPrices || []) {
      if (mp.price !== null && mp.price > 0) {
        const mpRes = mp.id
          ? await reqMemberPriceUpdateCommit(
              'update',
              mp.id,
              form.skuId,
              mp.levelId,
              mp.name,
              String(mp.price),
              '0',
            )
          : await reqMemberPriceUpdateCommit(
              'save',
              0,
              form.skuId,
              mp.levelId,
              mp.name,
              String(mp.price),
              '0',
            )
        if (!mpRes || mpRes.code !== 200) {
          ElMessage.error(mpRes?.message || `会员价(${mp.name})保存失败`)
          return
        }
      } else if (mp.id) {
        await reqMemberPriceDelete([mp.id])
      }
    }

    ElMessage.success('修改成功')
    editVisible.value = false
    getDataList()
    refreshDetail(form.skuId)
  } catch (error) {
    ElMessage.error('修改失败')
  }
}

// 多选
const selectionChangeHandle = (val: any) => {
  dataListSelections.value = val
}

// 每页数
const sizeChangeHandle = (val: number) => {
  pageSize.value = val
  pageIndex.value = 1
  getDataList()
}

// 当前页
const currentChangeHandle = (val: number) => {
  pageIndex.value = val
  getDataList()
}

onMounted(() => {
  getDataList()
})
</script>
<style lang="scss">
/* 图片描述表：label 列宽固定（table-layout fixed，不受图片数量影响）
   注意：全局样式块不能使用 :deep()，用普通后代选择器 */
.sku-img-descriptions {
  table-layout: fixed;

  .el-descriptions__label {
    width: 170px;
    min-width: 170px;
    max-width: 170px;
  }

  .el-descriptions__cell {
    vertical-align: middle;
  }
}

/* 主描述表（SKU 信息）：label 列同样固定 170px，与图片描述表对齐 */
.sku-info-descriptions {
  table-layout: fixed;

  .el-descriptions__label {
    width: 170px;
    min-width: 170px;
    max-width: 170px;
  }

  .el-descriptions__cell {
    vertical-align: middle;
  }
}

/* 图片编辑框：图片展示即上传框，点击直接换图 */
.img-editor {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.img-box {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100px;
  height: 100px;
  overflow: hidden;
  cursor: pointer;
  background: #f5f7fa;
  border: 1px dashed #dcdfe6;
  border-radius: 6px;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &:hover {
    border-color: #409eff;
  }

  .img-box-plus {
    font-size: 24px;
    color: #8c939d;
  }

  .img-box-del {
    position: absolute;
    top: 4px;
    right: 4px;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    color: #fff;
    cursor: pointer;
    background: rgb(0 0 0 / 60%);
    border-radius: 50%;
    font-size: 14px;
  }

  .img-box-edit {
    position: absolute;
    top: 4px;
    left: 4px;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    color: #fff;
    cursor: pointer;
    background: rgb(0 0 0 / 60%);
    border-radius: 50%;
    font-size: 12px;
  }
}

// 优惠信息/会员价排版（与发布商品页一致）
.promo-line {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
}
.promo-number {
  width: 120px;
}

.promo-text {
  margin: 0 2px;
}

.promo-checkbox {
  margin-left: 8px;
}

.member-price-list {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.member-price-line {
  display: flex;
  align-items: center;
  gap: 8px;
}

.member-name {
  min-width: 80px;
  text-align: right;
}

.member-tip {
  color: #999;
  font-size: 12px;
}

// 展开行单元格背景/文字色（与描述表格标签底色一致）
// 注意：本文件 style 是全局块（无 scoped），用普通后代选择器，不能用 :deep()
.el-table__cell.el-table__expanded-cell {
  background: var(--el-descriptions-item-bordered-label-background);
  color: var(--el-text-color-regular);
}

// 描述内容单元格背景与标签底色一致
.el-descriptions__cell.el-descriptions__content.is-bordered-content {
  background: var(--el-descriptions-item-bordered-label-background);
}
</style>
