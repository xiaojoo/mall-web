import { request } from '@/utils/request'

enum API {
  HOME_SUBJECT_LIST_URL = '/coupon/homesubject/list',
  HOME_SUBJECT_DELETE_URL = '/coupon/homesubject/delete',
  HOME_SUBJECT_INFO_URL = '/coupon/homesubject/info',
  HOME_SUBJECT_UPDATE_COMMIT = '/coupon/homesubject',
}

export const reqHomeSubjectList = (page: number, limit: number, key: string) =>
  request.get<any, any>(
    API.HOME_SUBJECT_LIST_URL + `?page=${page}&limit=${limit}&key=${key}`,
  )

export const reqHomeSubjectDelete = (id: any) =>
  request.post<any, any>(API.HOME_SUBJECT_DELETE_URL, id)

export const reqHomeSubjectInfo = (id: number) =>
  request.get<any, any>(API.HOME_SUBJECT_INFO_URL + `/${id}`)

// UPDATE提交
export const reqHomeSubjectUpdateCommit = (
  type: string,
  id: number,
  name: string,
  title: string,
  subTitle: string,
  status: number,
  url: string,
  sort: string,
  img: string,
) => {
  if (type == 'save') {
    return request.post<any, any>(API.HOME_SUBJECT_UPDATE_COMMIT + `/${type}`, {
      name,
      title,
      subTitle,
      status,
      url,
      sort,
      img,
    })
  } else {
    return request.post<any, any>(API.HOME_SUBJECT_UPDATE_COMMIT + `/${type}`, {
      id,
      name,
      title,
      subTitle,
      status,
      url,
      sort,
      img,
    })
  }
}
