import { request } from '@/utils/request'

enum API {
  SECKILL_SKU_NOTICE_LIST_URL = '/coupon/seckillskunotice/list',
  SECKILL_SKU_NOTICE_DELETE_URL = '/coupon/seckillskunotice/delete',
  SECKILL_SKU_NOTICE_INFO_URL = '/coupon/seckillskunotice/info',
  SECKILL_SKU_NOTICE_UPDATE_COMMIT = '/coupon/seckillskunotice',
}

export const reqSeckillSkuNoticeList = (
  page: number,
  limit: number,
  key: string,
) =>
  request.get<any, any>(
    API.SECKILL_SKU_NOTICE_LIST_URL + `?page=${page}&limit=${limit}&key=${key}`,
  )

export const reqSeckillSkuNoticeDelete = (id: any) =>
  request.post<any, any>(API.SECKILL_SKU_NOTICE_DELETE_URL, id)

export const reqSeckillSkuNoticeInfo = (id: number) =>
  request.get<any, any>(API.SECKILL_SKU_NOTICE_INFO_URL + `/${id}`)

// UPDATE提交
export const reqSeckillSkuNoticeUpdateCommit = (
  type: string,
  id: number,
  memberId: string,
  skuId: string,
  sessionId: string,
  subcribeTime: string,
  sendTime: string,
  noticeType: string,
) => {
  if (type == 'save') {
    return request.post<any, any>(
      API.SECKILL_SKU_NOTICE_UPDATE_COMMIT + `/${type}`,
      {
        memberId,
        skuId,
        sessionId,
        subcribeTime,
        sendTime,
        noticeType,
      },
    )
  } else {
    return request.post<any, any>(
      API.SECKILL_SKU_NOTICE_UPDATE_COMMIT + `/${type}`,
      {
        id,
        memberId,
        skuId,
        sessionId,
        subcribeTime,
        sendTime,
        noticeType,
      },
    )
  }
}
