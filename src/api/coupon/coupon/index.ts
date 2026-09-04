import { request } from '@/utils/request'

enum API {
  MEMBER_LEVEL_LIST_URL = '/member/memberlevel/list',
  COUPON_LIST_URL = '/coupon/coupon/list',
  COUPON_DELETE_URL = '/coupon/coupon/delete',
  COUPON_INFO_URL = '/coupon/coupon/info',
  COUPON_UPDATE_COMMIT = '/coupon/coupon',
  COUPON_PUBLISH_URL = '/coupon/coupon/publish',
  COUPON_COPY_URL = '/coupon/coupon/copy',
  COUPON_USABLE_URL = '/coupon/coupon/usable/list',
  COUPON_SPU_RELATION_SAVE_URL = '/coupon/couponspurelation/save',
  COUPON_SPU_RELATION_UPDATE_URL = '/coupon/couponspurelation/update',
  COUPON_SPU_RELATION_DELETE_URL = '/coupon/couponspurelation/delete',
  COUPON_SPU_RELATION_LIST_URL = '/coupon/couponspurelation/list',
  COUPON_CATEGORY_RELATION_SAVE_URL = '/coupon/couponspucategoryrelation/save',
  COUPON_CATEGORY_RELATION_DELETE_URL = '/coupon/couponspucategoryrelation/delete',
  COUPON_CATEGORY_RELATION_LIST_URL = '/coupon/couponspucategoryrelation/list',
}

export const reqMemberLevelList = (page: number, limit: number) =>
  request.get<any, any>(
    API.MEMBER_LEVEL_LIST_URL + `?page=${page}&limit=${limit}`,
  )

export const reqCouponList = (page: number, limit: number, key: string) =>
  request.get<any, any>(
    API.COUPON_LIST_URL + `?page=${page}&limit=${limit}&key=${key}`,
  )

export const reqCouponDelete = (id: any) =>
  request.post<any, any>(API.COUPON_DELETE_URL, id)

// 发布/下架
export const reqCouponPublish = (id: any, publish: number) =>
  request.post<any, any>(API.COUPON_PUBLISH_URL, { id, publish })

// 复制优惠券
export const reqCouponCopy = (id: any) =>
  request.post<any, any>(API.COUPON_COPY_URL + `/${id}`)

export const reqCouponInfo = (id: number) =>
  request.get<any, any>(API.COUPON_INFO_URL + `/${id}`)

// 可使用优惠券列表（已发布且在有效窗口内；传 skuId 时按适用范围过滤：全场通用/指定分类含祖先/指定商品）
export const reqCouponUsableList = (skuId?: number | string) =>
  request.get<any, any>(
    API.COUPON_USABLE_URL + (skuId ? `?skuId=${skuId}` : ''),
  )

// 优惠券-指定商品关联（使用类型=指定商品时保存 skuId）
export const reqCouponSpuRelationSave = (data: any) =>
  request.post<any, any>(API.COUPON_SPU_RELATION_SAVE_URL, data)

export const reqCouponSpuRelationUpdate = (data: any) =>
  request.post<any, any>(API.COUPON_SPU_RELATION_UPDATE_URL, data)

export const reqCouponSpuRelationDelete = (ids: any[]) =>
  request.post<any, any>(API.COUPON_SPU_RELATION_DELETE_URL, ids)

export const reqCouponSpuRelationList = (couponId: number | string) =>
  request.get<any, any>(
    API.COUPON_SPU_RELATION_LIST_URL + `?page=1&limit=100&couponId=${couponId}`,
  )

// 优惠券-指定分类关联（使用类型=指定分类时保存分类）
export const reqCouponCategoryRelationSave = (data: any) =>
  request.post<any, any>(API.COUPON_CATEGORY_RELATION_SAVE_URL, data)

export const reqCouponCategoryRelationDelete = (ids: any[]) =>
  request.post<any, any>(API.COUPON_CATEGORY_RELATION_DELETE_URL, ids)

export const reqCouponCategoryRelationList = (couponId: number | string) =>
  request.get<any, any>(
    API.COUPON_CATEGORY_RELATION_LIST_URL +
      `?page=1&limit=100&couponId=${couponId}`,
  )

// UPDATE提交
export const reqCouponUpdateCommit = (
  type: string,
  id: number,
  couponType: string,
  couponImg: string,
  couponName: string,
  num: number,
  amount: number,
  perLimit: number,
  minPoint: number,
  startTime: string,
  endTime: string,
  useType: string,
  note: string,
  publishCount: number,
  useCount: string,
  receiveCount: string,
  enableStartTime: string,
  enableEndTime: string,
  code: string,
  memberLevel: string,
  publish: number,
  brandId: number | '' | null,
) => {
  if (type == 'save') {
    return request.post<any, any>(API.COUPON_UPDATE_COMMIT + `/${type}`, {
      couponType,
      couponImg,
      couponName,
      num,
      amount,
      perLimit,
      minPoint,
      startTime,
      endTime,
      useType,
      note,
      publishCount,
      useCount,
      receiveCount,
      enableStartTime,
      enableEndTime,
      code,
      memberLevel,
      publish,
      brandId: brandId || null,
    })
  } else {
    return request.post<any, any>(API.COUPON_UPDATE_COMMIT + `/${type}`, {
      id,
      couponType,
      couponImg,
      couponName,
      num,
      amount,
      perLimit,
      minPoint,
      startTime,
      endTime,
      useType,
      note,
      publishCount,
      useCount,
      receiveCount,
      enableStartTime,
      enableEndTime,
      code,
      memberLevel,
      publish,
      brandId: brandId || null,
    })
  }
}
