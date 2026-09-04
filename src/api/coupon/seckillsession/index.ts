import { request } from '@/utils/request'

enum API {
  SECKILL_SESSION_LIST_URL = '/coupon/seckillsession/list',
  SECKILL_SKU_RELATION_LIST_URL = '/coupon/seckillskurelation/list',
  SECKILL_SESSION_DELETE_URL = '/coupon/seckillsession/delete',
  SECKILL_SKU_RELATION_SHELF_URL = '/coupon/seckillskurelation/shelf',
  SECKILL_SESSION_INFO_URL = '/coupon/seckillsession/info',
  SECKILL_SKU_RELATION_INFO_URL = '/coupon/seckillskurelation/info',
  SECKILL_SESSION_UPDATE_COMMIT = '/coupon/seckillsession',
  SECKILL_SKU_RELATION_UPDATE_COMMIT = '/coupon/seckillskurelation',
}

export const reqSeckillSessionList = (
  page: number,
  limit: number,
  key: string,
) =>
  request.get<any, any>(
    API.SECKILL_SESSION_LIST_URL + `?page=${page}&limit=${limit}&key=${key}`,
  )

export const reqSeckillSessionDelete = (id: any) =>
  request.post<any, any>(API.SECKILL_SESSION_DELETE_URL, id)

// 下架/上架/补库存（DB 持久化 shelf_status + Redis 同步）
export const reqSeckillSkuRelationShelf = (id: number, shelf: boolean) =>
  request.post<any, any>(API.SECKILL_SKU_RELATION_SHELF_URL, null, {
    params: { id, shelf },
  })

export const reqSeckillSessionInfo = (id: number) =>
  request.get<any, any>(API.SECKILL_SESSION_INFO_URL + `/${id}`)

export const reqSeckillSkuRelationInfo = (id: number) =>
  request.get<any, any>(API.SECKILL_SKU_RELATION_INFO_URL + `/${id}`)

export const reqSeckillSkuRelationList = (
  page: number,
  limit: number,
  key: string,
  promotionSessionId: number,
) =>
  request.get<any, any>(
    API.SECKILL_SKU_RELATION_LIST_URL +
      `?page=${page}&limit=${limit}&key=${key}&promotionSessionId=${promotionSessionId}`,
  )

// UPDATE提交
export const reqSeckillSessionUpdateCommit = (
  type: string,
  id: number,
  name: string,
  startTime: string,
  endTime: string,
  status: string,
  createTime: Date,
) => {
  if (type == 'save') {
    return request.post<any, any>(
      API.SECKILL_SESSION_UPDATE_COMMIT + `/${type}`,
      {
        name,
        startTime,
        endTime,
        status,
        createTime,
      },
    )
  } else {
    return request.post<any, any>(
      API.SECKILL_SESSION_UPDATE_COMMIT + `/${type}`,
      {
        id,
        name,
        startTime,
        endTime,
        status,
        createTime,
      },
    )
  }
}

export const reqSeckillSkuRelationUpdateCommit = (
  type: string,
  id: number,
  promotionId: string,
  sessionId: number,
  skuId: string,
  seckillPrice: number,
  seckillCount: number,
  seckillLimit: number,
  seckillSort: number,
) => {
  if (type == 'save') {
    return request.post<any, any>(
      API.SECKILL_SKU_RELATION_UPDATE_COMMIT + `/${type}`,
      {
        promotionId,
        promotionSessionId: sessionId,
        skuId,
        seckillPrice,
        seckillCount,
        seckillLimit,
        seckillSort,
      },
    )
  } else {
    return request.post<any, any>(
      API.SECKILL_SKU_RELATION_UPDATE_COMMIT + `/${type}`,
      {
        id,
        promotionId,
        promotionSessionId: sessionId,
        skuId,
        seckillPrice,
        seckillCount,
        seckillLimit,
        seckillSort,
      },
    )
  }
}
