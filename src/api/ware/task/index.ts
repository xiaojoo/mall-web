import { request } from '@/utils/request'

enum API {
  // 获取分类列表
  WARE_TASK_URL = '/ware/wareordertask/list',
  // 删除仓库
  WARE_TASK_DELETE_URL = '/ware/wareordertask/delete',
  // UPDATE获取信息
  WARE_TASK_INFO_LIST = '/ware/wareordertask/info',
  // UPDATE提交
  WARE_TASK_UPDATE_COMMIT = '/ware/wareordertask',
}

// 获取分类信息
export const reqWareTaskInfoList = (page: number, limit: number, key: string) =>
  request.get<any, any>(
    API.WARE_TASK_URL + `?page=${page}&limit=${limit}&key=${key}`,
  )

// 删除仓库
export const reqWareTaskDelete = (ids: any) => {
  return request.post<any, any>(API.WARE_TASK_DELETE_URL, ids)
}

// UPDATE获取信息
export const reqWareTaskInfo = (id: number) =>
  request.get<any, any>(API.WARE_TASK_INFO_LIST + `/${id}`)

// UPDATE提交
export const reqWareTaskUpdateCommit = (
  type: string,
  id: number,
  orderId: string,
  orderSn: string,
  consignee: string,
  consigneeTel: string,
  deliveryAddress: string,
  orderComment: string,
  paymentWay: string,
  taskStatus: string,
  orderBody: string,
  trackingNo: string,
  createTime: string,
  wareId: string,
  taskComment: string,
) => {
  if (type == 'save') {
    return request.post<any, any>(API.WARE_TASK_UPDATE_COMMIT + `/${type}`, {
      orderId,
      orderSn,
      consignee,
      consigneeTel,
      deliveryAddress,
      orderComment,
      paymentWay,
      taskStatus,
      orderBody,
      trackingNo,
      createTime,
      wareId,
      taskComment,
    })
  } else {
    return request.post<any, any>(API.WARE_TASK_UPDATE_COMMIT + `/${type}`, {
      id,
      orderId,
      orderSn,
      consignee,
      consigneeTel,
      deliveryAddress,
      orderComment,
      paymentWay,
      taskStatus,
      orderBody,
      trackingNo,
      createTime,
      wareId,
      taskComment,
    })
  }
}
