import { request } from '@/utils/request'

enum API {
  HOME_SUBJECT_SPU_LIST_URL = '/coupon/homesubjectspu/list',
  HOME_SUBJECT_SPU_DELETE_URL = '/coupon/homesubjectspu/delete',
  HOME_SUBJECT_SPU_INFO_URL = '/coupon/homesubjectspu/info',
  HOME_SUBJECT_SPU_UPDATE_COMMIT = '/coupon/homesubjectspu',
}

export const reqHomeSubjectSpuList = (
  page: number,
  limit: number,
  key: string,
) =>
  request.get<any, any>(
    API.HOME_SUBJECT_SPU_LIST_URL + `?page=${page}&limit=${limit}&key=${key}`,
  )

export const reqHomeSubjectSpuDelete = (id: any) =>
  request.post<any, any>(API.HOME_SUBJECT_SPU_DELETE_URL, id)

export const reqHomeSubjectSpuInfo = (id: number) =>
  request.get<any, any>(API.HOME_SUBJECT_SPU_INFO_URL + `/${id}`)

// UPDATE提交
export const reqHomeSubjectSpuUpdateCommit = (
  type: string,
  id: number,
  name: string,
  subjectId: string,
  spuId: string,
  sort: string,
) => {
  if (type == 'save') {
    return request.post<any, any>(
      API.HOME_SUBJECT_SPU_UPDATE_COMMIT + `/${type}`,
      {
        name,
        subjectId,
        spuId,
        sort,
      },
    )
  } else {
    return request.post<any, any>(
      API.HOME_SUBJECT_SPU_UPDATE_COMMIT + `/${type}`,
      {
        id,
        name,
        subjectId,
        spuId,
        sort,
      },
    )
  }
}
