<template>
  <div class="app-container">
    <el-card class="box-card">
      <div slot="header" class="clearfix title">
        <span>批量发布商品</span>
        <el-button
          style="float: right; padding: 3px 0"
          link
          type="primary"
          @click="fillSample"
        >
          填入格式示例
        </el-button>
      </div>

      <el-alert
        type="info"
        :closable="false"
        show-icon
        title="说明：粘贴商品 JSON 数组，每件商品一张对象；图片字段（decript / images / sku.images）直接填图片地址 URL，无需上传。提交后逐个保存并自动上架（写入 ES），单条失败不影响其他条。"
        style="margin-bottom: 16px"
      />

      <el-input
        v-model="jsonText"
        type="textarea"
        :rows="14"
        placeholder='[{"spuName":"商品名","catalogId":225,"brandId":4,"decript":["https://.../desc.jpg"],"images":["https://.../main.jpg"],"skus":[{"skuName":"SKU名","price":1999,"images":[{"imgUrl":"https://.../sku.jpg","defaultImg":1}]}]}]'
      />

      <div style="margin-top: 16px; text-align: right">
        <el-button type="primary" :loading="submitting" @click="doPublish">
          ⚡ 批量发布
        </el-button>
      </div>
    </el-card>

    <el-card
      v-if="results.length > 0"
      class="box-card"
      style="margin-top: 16px"
    >
      <div slot="header" class="clearfix">
        <span>发布结果（成功 {{ okCount }} / {{ results.length }}）</span>
        <el-button
          style="float: right; padding: 3px 0"
          link
          type="primary"
          @click="results = []"
        >
          清空结果
        </el-button>
      </div>
      <el-table :data="results" border stripe>
        <el-table-column prop="spuName" label="商品名称" min-width="200" />
        <el-table-column label="结果" width="110" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.success ? 'success' : 'danger'">
              {{ scope.row.success ? '成功' : '失败' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="spuId"
          label="SPU ID"
          width="110"
          align="center"
        />
        <el-table-column
          prop="error"
          label="失败原因"
          min-width="240"
          show-overflow-tooltip
        />
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { reqBatchPublish } from '@/api/product/spu'

const jsonText = ref('')
const submitting = ref(false)
const results = ref<any[]>([])

const okCount = computed(() => results.value.filter((r) => r.success).length)

function fillSample() {
  jsonText.value = JSON.stringify(
    [
      {
        spuName: '小米 手机 黑色 120Hz（批量示例）',
        spuDescription: '批量发布接口示例商品',
        catalogId: 225,
        brandId: 4,
        weight: 0.2,
        publishStatus: 1,
        decript: ['https://mall-xiaojoo.oss-cn-beijing.aliyuncs.com/desc1.jpg'],
        images: ['https://mall-xiaojoo.oss-cn-beijing.aliyuncs.com/main1.jpg'],
        bounds: { buyBounds: 0, growBounds: 0 },
        baseAttrs: [
          { attrId: 22, attrValues: '黑色', showDesc: 1 },
          { attrId: 23, attrValues: '120Hz', showDesc: 1 },
        ],
        skus: [
          {
            skuName: '小米 手机 黑色 120Hz',
            price: 1999,
            skuTitle: '小米 手机 黑色 120Hz',
            skuSubtitle: '批量发布测试',
            images: [
              {
                imgUrl:
                  'https://mall-xiaojoo.oss-cn-beijing.aliyuncs.com/sku1.jpg',
                defaultImg: 1,
              },
            ],
            attr: [{ attrId: 22, attrName: '机身颜色', attrValue: '黑色' }],
            fullCount: 0,
            fullPrice: 0,
            reducePrice: 0,
            memberPrice: [],
          },
        ],
      },
    ],
    null,
    2,
  )
}

async function doPublish() {
  let list: any[]
  try {
    list = JSON.parse(jsonText.value)
  } catch {
    ElMessage.error('JSON 格式错误，请检查后重试')
    return
  }
  if (!Array.isArray(list) || list.length === 0) {
    ElMessage.warning('请至少填入一条商品数据')
    return
  }
  submitting.value = true
  try {
    const res: any = await reqBatchPublish(list)
    if (res.code === 200) {
      results.value = res.data || []
      ElMessage.success(
        `批量发布完成：成功 ${okCount.value} / ${results.value.length}`,
      )
    } else {
      ElMessage.error(res.message || '批量发布失败')
    }
  } catch (e: any) {
    ElMessage.error(e.message || '批量发布失败')
  } finally {
    submitting.value = false
  }
}
</script>
<style lang="scss" scoped>
.title {
  margin-bottom: 16px;
  color: var(--el-text-color-primary);
  & > span {
    font-size: 18px;
    line-height: 18px;
  }
}
</style>
