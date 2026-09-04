import { request } from '@/utils/request'

enum API {
  COUPON_HISTORY_LIST_URL = '/coupon/couponhistory/list',
  COUPON_HISTORY_DELETE_URL = '/coupon/couponhistory/delete',
}

export const reqCouponHistoryList = (
  page: number,
  limit: number,
  key: string,
) =>
  request.get<any, any>(
    API.COUPON_HISTORY_LIST_URL + `?page=${page}&limit=${limit}&key=${key}`,
  )

export const reqCouponHistoryDelete = (ids: any) =>
  request.post<any, any>(API.COUPON_HISTORY_DELETE_URL, ids)
