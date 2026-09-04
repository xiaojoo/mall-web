<template>
  <el-dialog
    :model-value="modelValue"
    @update:model-value="updateVisible"
    :close-on-click-modal="false"
    :title="button"
  >
    <el-form
      :model="dataForm"
      @keyup.enter.native="dataFormSubmit()"
      label-width="155px"
    >
      <el-form-item label="优惠卷类型" prop="couponType">
        <el-select v-model="dataForm.couponType" placeholder="请选择">
          <el-option label="全场赠券" :value="0"></el-option>
          <el-option label="会员赠券" :value="1"></el-option>
          <el-option label="购物赠券" :value="2"></el-option>
          <el-option label="注册赠券" :value="3"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="优惠券图片" prop="couponImg">
        <single-upload v-model="dataForm.couponImg"></single-upload>
      </el-form-item>
      <el-form-item label="优惠卷名字" prop="couponName">
        <el-input
          v-model="dataForm.couponName"
          placeholder="优惠卷名字"
        ></el-input>
      </el-form-item>
      <el-form-item label="所属店铺" prop="brandId">
        <el-select
          v-model="dataForm.brandId"
          placeholder="不选=全场券；选品牌=该店铺专享券"
          clearable
          filterable
        >
          <el-option
            v-for="b in brandOptions"
            :key="b.brandId"
            :label="b.name"
            :value="b.brandId"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="数量" prop="num">
        <el-input-number :min="0" v-model="dataForm.num"></el-input-number>
      </el-form-item>
      <el-form-item label="金额" prop="amount">
        <el-input-number
          :min="0"
          v-model="dataForm.amount"
          :precision="2"
        ></el-input-number>
      </el-form-item>
      <el-form-item label="每人限领张数" prop="perLimit">
        <el-input-number :min="0" v-model="dataForm.perLimit"></el-input-number>
      </el-form-item>
      <el-form-item label="使用门槛（最小积分）" prop="minPoint">
        <el-input-number :min="0" v-model="dataForm.minPoint"></el-input-number>
      </el-form-item>
      <el-form-item label="有效时间" prop="useTimeRange">
        <el-date-picker
          v-model="dataForm.useTimeRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
        ></el-date-picker>
      </el-form-item>
      <el-form-item label="使用类型" prop="useType">
        <el-select v-model="dataForm.useType" placeholder="请选择">
          <el-option :value="0" label="全场通用"></el-option>
          <el-option :value="1" label="指定分类"></el-option>
          <el-option :value="2" label="指定商品"></el-option>
        </el-select>
      </el-form-item>
      <!-- 使用类型=指定商品 时填写 skuId（保存到 sms_coupon_spu_relation） -->
      <el-form-item
        v-if="Number(dataForm.useType) === 2"
        label="skuId"
        prop="skuId"
      >
        <el-input
          v-model="dataForm.skuId"
          placeholder="填写商品skuId"
        ></el-input>
      </el-form-item>
      <!-- 使用类型=指定分类 时多选三级分类（保存到 sms_coupon_spu_category_relation） -->
      <el-form-item
        v-if="Number(dataForm.useType) === 1"
        label="指定分类"
        prop="categoryIds"
      >
        <el-cascader
          v-model="dataForm.categoryIds"
          :options="categoryOptions"
          :props="categoryProps"
          filterable
          clearable
          collapse-tags
          collapse-tags-tooltip
          placeholder="选择商品分类（可多选，仅三级可选）"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item label="备注" prop="note">
        <el-input v-model="dataForm.note" placeholder="备注"></el-input>
      </el-form-item>
      <el-form-item label="发行数量" prop="publishCount">
        <el-input-number
          v-model="dataForm.publishCount"
          :min="0"
        ></el-input-number>
      </el-form-item>
      <el-form-item label="领取日期" prop="enableStartTime">
        <el-date-picker
          v-model="dataForm.timeRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        ></el-date-picker>
      </el-form-item>
      <el-form-item label="优惠码" prop="code">
        <el-input v-model="dataForm.code" placeholder="优惠码"></el-input>
      </el-form-item>
      <el-form-item label="领取所需等级" prop="memberLevel">
        <el-select v-model="dataForm.memberLevel" placeholder="请选择">
          <el-option :value="0" label="不限制"></el-option>
          <el-option
            v-for="item in memberLevels"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          ></el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="dataFormSubmit()">
          {{ button }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import SingleUpload from '@/components/upload/singleUpload.vue'
import { nextTick, ref, onMounted } from 'vue'

import {
  reqCouponInfo,
  reqCouponUpdateCommit,
  reqCouponSpuRelationList,
  reqCouponSpuRelationSave,
  reqCouponSpuRelationUpdate,
  reqCouponSpuRelationDelete,
  reqCouponCategoryRelationList,
  reqCouponCategoryRelationSave,
  reqCouponCategoryRelationDelete,
  reqMemberLevelList,
} from '@/api/coupon/coupon'
import { reqCategoryCascader } from '@/api/common/cascader'
import { reqTrademark } from '@/api/product/trademark'

// ===== 所属店铺（品牌，仅展示中的） =====
const brandOptions = ref<any[]>([])
const loadBrandOptions = async () => {
  try {
    const res: any = await reqTrademark(1, 200, '')
    const list: any[] = res?.data?.list || []
    brandOptions.value = list.filter((b) => Number(b.showStatus) === 1)
  } catch (e) {
    brandOptions.value = []
  }
}

// ===== 指定分类：三级分类树多选（与属性分组批量添加同款 el-cascader） =====
const categoryOptions = ref<any[]>([])
const categoryProps = {
  value: 'catId',
  label: 'name',
  children: 'children',
  // element-plus 2.9：multiple 必须写在 props 里，顶层 multiple 属性不生效
  multiple: true,
  checkStrictly: true,
  emitPath: false,
}
// catId -> 分类名（保存关联时带 categoryName）
const catNameMap = ref<Record<string, string>>({})
const loadCategories = async () => {
  try {
    const res: any = await reqCategoryCascader()
    const tree = res?.data || []
    // 只允许选中三级分类：一级/二级节点禁用（灰色不可勾，多选时只能勾三级叶子）
    const markDisabled = (list: any[]) => {
      for (const c of list || []) {
        catNameMap.value[String(c.catId)] = c.name
        const hasChildren = c.children && c.children.length > 0
        const level = Number(c.catLevel ?? (hasChildren ? 1 : 3))
        c.disabled = level < 3
        markDisabled(c.children || [])
      }
    }
    markDisabled(tree)
    categoryOptions.value = tree
  } catch {
    /* 分类加载失败不影响表单 */
  }
}

const memberLevels = ref([
  {
    id: 0,
    name: '',
  },
])
const dataForm = ref({
  id: 0,
  couponType: '',
  couponImg: '',
  couponName: '',
  num: 0,
  amount: 0,
  perLimit: 0,
  minPoint: 0,
  startTime: '',
  endTime: '',
  useType: '' as string | number,
  note: '',
  publishCount: 0,
  useCount: '',
  receiveCount: '',
  enableStartTime: '',
  enableEndTime: '',
  code: '',
  memberLevel: '',
  publish: 1,
  // 所属店铺/品牌（空=全场券；非空=该店铺专享券）
  brandId: '' as number | '',
  // 使用类型=指定商品 时的 skuId（关联表 sms_coupon_spu_relation）
  skuId: '',
  // 已存在的关联记录 id（编辑时回填，用于更新而非重复新增）
  relationId: 0,
  // 使用类型=指定分类 时的三级分类多选（保存到 sms_coupon_spu_category_relation）
  categoryIds: [] as (number | string)[],
  // 已存在的分类关联记录 id（编辑时回填，保存时先删后建）
  categoryRelationIds: [] as number[],
  timeRange: [''],
  useTimeRange: [''],
})
const button = ref('添加')

const props = defineProps(['modelValue', 'skuId'])

const emit = defineEmits(['update:modelValue'])

const updateVisible = (value: boolean) => {
  emit('update:modelValue', value)
}

// 处理取消按钮点击
const handleCancel = () => {
  updateVisible(false)
}

// 获取所有的会员等级
const getMemberLevels = async () => {
  try {
    const response = await reqMemberLevelList(1, 500)
    if (response && response.code === 200) {
      memberLevels.value = response.data.list
    }
  } catch (error) {
    console.error(error)
  }
}

const dataFormSubmit = async () => {
  try {
    const response: any = await reqCouponUpdateCommit(
      dataForm.value.id > 0 ? 'update' : 'save',
      dataForm.value.id,
      dataForm.value.couponType,
      dataForm.value.couponImg,
      dataForm.value.couponName,
      dataForm.value.num,
      dataForm.value.amount,
      dataForm.value.perLimit,
      dataForm.value.minPoint,
      dataForm.value.useTimeRange[0],
      dataForm.value.useTimeRange[1],
      String(dataForm.value.useType),
      dataForm.value.note,
      dataForm.value.publishCount,
      dataForm.value.useCount,
      dataForm.value.receiveCount,
      dataForm.value.timeRange[0],
      dataForm.value.timeRange[1],
      dataForm.value.code,
      dataForm.value.memberLevel,
      dataForm.value.publish,
      dataForm.value.brandId || null,
    )
    // 使用类型=指定商品：保存/更新 优惠券-SKU 关联（新建时 save 接口返回新券 id）
    const couponId = dataForm.value.id > 0 ? dataForm.value.id : response?.data
    if (Number(dataForm.value.useType) === 2 && dataForm.value.skuId) {
      const relation = {
        couponId,
        spuId: dataForm.value.skuId,
      }
      if (dataForm.value.relationId) {
        await reqCouponSpuRelationUpdate({
          id: dataForm.value.relationId,
          ...relation,
        })
      } else {
        await reqCouponSpuRelationSave(relation)
      }
    } else if (dataForm.value.relationId) {
      // 不再是指定商品：清理旧关联
      await reqCouponSpuRelationDelete([dataForm.value.relationId])
    }
    // 使用类型=指定分类：先删旧关联，再写新关联（可多选）
    if (Number(dataForm.value.useType) === 1) {
      if (dataForm.value.categoryRelationIds.length > 0) {
        await reqCouponCategoryRelationDelete(
          dataForm.value.categoryRelationIds,
        )
      }
      for (const cid of dataForm.value.categoryIds || []) {
        await reqCouponCategoryRelationSave({
          couponId,
          categoryId: cid,
          categoryName: catNameMap.value[String(cid)] || '',
        })
      }
    } else if (dataForm.value.categoryRelationIds.length > 0) {
      // 不再是指定分类：清理旧分类关联
      await reqCouponCategoryRelationDelete(dataForm.value.categoryRelationIds)
    }
    ElMessage.success(`优惠券${button.value}成功`)
  } catch (error) {
    console.error(`优惠券${button.value}失败`, error)
  }
}

const init = (id: number) => {
  button.value = id > 0 ? '修改' : '添加'
  nextTick(async () => {
    dataForm.value.id = 0
    dataForm.value.couponType = ''
    dataForm.value.couponImg = ''
    dataForm.value.couponName = ''
    dataForm.value.num = 0
    dataForm.value.amount = 0
    dataForm.value.perLimit = 0
    dataForm.value.minPoint = 0
    dataForm.value.startTime = ''
    dataForm.value.endTime = ''
    dataForm.value.useType = ''
    dataForm.value.note = ''
    dataForm.value.publishCount = 0
    dataForm.value.useCount = ''
    dataForm.value.receiveCount = ''
    dataForm.value.enableStartTime = ''
    dataForm.value.enableEndTime = ''
    dataForm.value.code = ''
    dataForm.value.memberLevel = ''
    dataForm.value.publish = 1
    dataForm.value.brandId = ''
    dataForm.value.skuId = props.skuId ? String(props.skuId) : ''
    dataForm.value.relationId = 0
    dataForm.value.categoryIds = []
    dataForm.value.categoryRelationIds = []
    // 从商品管理跳转带入 skuId：自动选中「指定商品」使用类型
    if (props.skuId) {
      dataForm.value.useType = 2
    }
    dataForm.value.timeRange = []
    dataForm.value.useTimeRange = []
    if (id > 0) {
      try {
        const response = await reqCouponInfo(id)
        if (response.code === 200) {
          dataForm.value.id = response.data.id
          dataForm.value.couponType = response.data.couponType
          dataForm.value.couponImg = response.data.couponImg
          dataForm.value.couponName = response.data.couponName
          dataForm.value.num = response.data.num
          dataForm.value.amount = response.data.amount
          dataForm.value.perLimit = response.data.perLimit
          dataForm.value.minPoint = response.data.minPoint
          dataForm.value.startTime = response.data.startTime
          dataForm.value.endTime = response.data.endTime
          dataForm.value.useType = response.data.useType
          dataForm.value.note = response.data.note
          dataForm.value.publishCount = response.data.publishCount
          dataForm.value.useCount = response.data.useCount
          dataForm.value.receiveCount = response.data.receiveCount
          dataForm.value.enableStartTime = response.data.enableStartTime
          dataForm.value.enableEndTime = response.data.enableEndTime
          dataForm.value.code = response.data.code
          dataForm.value.memberLevel = response.data.memberLevel
          dataForm.value.publish = response.data.publish
          dataForm.value.brandId = response.data.brandId || ''
          dataForm.value.timeRange = [
            dataForm.value.startTime,
            dataForm.value.endTime,
          ]
          dataForm.value.useTimeRange = [
            dataForm.value.startTime,
            dataForm.value.endTime,
          ]
          // 编辑：回填「指定商品」关联的 skuId
          try {
            const relRes: any = await reqCouponSpuRelationList(id)
            const relList: any[] =
              relRes?.code === 200 ? relRes.data?.list || [] : []
            const rel = relList.find(
              (r: any) => String(r.couponId) === String(id),
            )
            if (rel) {
              dataForm.value.relationId = rel.id
              dataForm.value.skuId = String(rel.spuId ?? '')
            }
          } catch {
            /* 关联查询失败不阻断编辑 */
          }
          // 编辑：回填「指定分类」关联的分类列表
          try {
            const catRes: any = await reqCouponCategoryRelationList(id)
            const catList: any[] =
              catRes?.code === 200 ? catRes.data?.list || [] : []
            dataForm.value.categoryRelationIds = catList
              .filter((r: any) => String(r.couponId) === String(id))
              .map((r: any) => Number(r.id))
            dataForm.value.categoryIds = catList
              .filter((r: any) => String(r.couponId) === String(id))
              .map((r: any) => r.categoryId)
          } catch {
            /* 关联查询失败不阻断编辑 */
          }
        }
      } catch (error) {
        console.error('优惠券信息获取失败:', error)
      }
    }
  })
}

// 暴露方法
defineExpose({ init })

onMounted(() => {
  getMemberLevels()
  loadCategories()
  loadBrandOptions()
})
</script>

<style scoped lang="scss"></style>
