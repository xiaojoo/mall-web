import { request } from '@/utils/request'

enum API {
  RETURN_APPLY_LIST_URL = '/order/orderreturnapply/list',
  RETURN_APPLY_APPROVE_URL = '/order/orderreturnapply/approve',
}

// 售后申请列表（status 空串 = 全部）
export const reqReturnApplyList = (
  page: number,
  limit: number,
  status?: string,
) =>
  request.get<any, any>(
    API.RETURN_APPLY_LIST_URL +
      `?page=${page}&limit=${limit}` +
      (status !== '' && status != null ? `&status=${status}` : ''),
  )

// 审核通过：调支付宝退款，成功后将申请单状态置为已完成(2)
export const reqReturnApplyApprove = (id: number) =>
  request.post<any, any>(API.RETURN_APPLY_APPROVE_URL + `?id=${id}`)
