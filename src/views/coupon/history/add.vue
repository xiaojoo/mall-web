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
      label-width="120px"
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
  reqMemberLevelList,
} from '@/api/coupon/coupon'

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
  useType: '',
  note: '',
  publishCount: 0,
  useCount: '',
  receiveCount: '',
  enableStartTime: '',
  enableEndTime: '',
  code: '',
  memberLevel: '',
  publish: 0,
  timeRange: [''],
  useTimeRange: [''],
})
const button = ref('添加')

defineProps(['modelValue'])

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
    await reqCouponUpdateCommit(
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
      dataForm.value.useType,
      dataForm.value.note,
      dataForm.value.publishCount,
      dataForm.value.useCount,
      dataForm.value.receiveCount,
      dataForm.value.timeRange[0],
      dataForm.value.timeRange[1],
      dataForm.value.code,
      dataForm.value.memberLevel,
      dataForm.value.publish,
      null,
    )
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
    dataForm.value.publish = 0
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
          dataForm.value.timeRange = [
            dataForm.value.startTime,
            dataForm.value.endTime,
          ]
          dataForm.value.useTimeRange = [
            dataForm.value.startTime,
            dataForm.value.endTime,
          ]
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
})
</script>

<style scoped lang="scss"></style>
