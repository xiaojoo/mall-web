import { request } from '@/utils/request'

enum API {
  HOME_ADV_LIST_URL = '/coupon/homeadv/list',
  HOME_ADV_DELETE_URL = '/coupon/homeadv/delete',
  HOME_ADV_INFO_URL = '/coupon/homeadv/info',
  HOME_ADV_UPDATE_COMMIT = '/coupon/homeadv',
}

export const reqHomeDdvList = (page: number, limit: number, key: string) =>
  request.get<any, any>(
    API.HOME_ADV_LIST_URL + `?page=${page}&limit=${limit}&key=${key}`,
  )

export const reqHomeDdvDelete = (id: any) =>
  request.post<any, any>(API.HOME_ADV_DELETE_URL, id)

export const reqHomeDdvInfo = (id: number) =>
  request.get<any, any>(API.HOME_ADV_INFO_URL + `/${id}`)

// UPDATE提交
export const reqHomeDdvUpdateCommit = (
  type: string,
  id: number,
  name: string,
  pic: string,
  startTime: string,
  endTime: string,
  status: string,
  clickCount: string,
  url: string,
  note: string,
  sort: string,
  publisherId: string,
  authId: string,
) => {
  if (type == 'save') {
    return request.post<any, any>(API.HOME_ADV_UPDATE_COMMIT + `/${type}`, {
      name,
      pic,
      startTime,
      endTime,
      status,
      clickCount,
      url,
      note,
      sort,
      publisherId,
      authId,
    })
  } else {
    return request.post<any, any>(API.HOME_ADV_UPDATE_COMMIT + `/${type}`, {
      id,
      name,
      pic,
      startTime,
      endTime,
      status,
      clickCount,
      url,
      note,
      sort,
      publisherId,
      authId,
    })
  }
}
