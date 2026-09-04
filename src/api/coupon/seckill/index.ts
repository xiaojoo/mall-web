import { request } from '@/utils/request'

enum API {
  SECKILL_PROMOTION_LIST_URL = '/coupon/seckillpromotion/list',
  SECKILL_PROMOTION_DELETE_URL = '/coupon/seckillpromotion/delete',
  SECKILL_PROMOTION_INFO_URL = '/coupon/seckillpromotion/info',
  SECKILL_PROMOTION_UPDATE_COMMIT = '/coupon/seckillpromotion',
}

export const reqSeckillPromotionList = (
  page: number,
  limit: number,
  key: string,
) =>
  request.get<any, any>(
    API.SECKILL_PROMOTION_LIST_URL + `?page=${page}&limit=${limit}&key=${key}`,
  )

export const reqSeckillPromotionDelete = (id: any) =>
  request.post<any, any>(API.SECKILL_PROMOTION_DELETE_URL, id)

export const reqSeckillPromotionInfo = (id: number) =>
  request.get<any, any>(API.SECKILL_PROMOTION_INFO_URL + `/${id}`)

// UPDATE提交
export const reqSeckillPromotionUpdateCommit = (
  type: string,
  id: number,
  title: string,
  startTime: string,
  endTime: string,
  status: number,
  // createTime: string,
  userId: string,
) => {
  if (type == 'save') {
    return request.post<any, any>(
      API.SECKILL_PROMOTION_UPDATE_COMMIT + `/${type}`,
      {
        title,
        startTime,
        endTime,
        status,
        // createTime,
        userId,
      },
    )
  } else {
    return request.post<any, any>(
      API.SECKILL_PROMOTION_UPDATE_COMMIT + `/${type}`,
      {
        id,
        title,
        startTime,
        endTime,
        status,
        // createTime,
        userId,
      },
    )
  }
}
