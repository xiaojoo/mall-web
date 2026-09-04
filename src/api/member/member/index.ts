import { request } from '@/utils/request'

enum API {
  MEMBER_LIST_URL = '/member/member/list',
  MEMBER_DELETE_URL = '/member/member/delete',
  MEMBER_INFO_URL = '/member/member/info',
  MEMBER_UPDATE_COMMIT = '/member/member',
}

export const reqMemberList = (page: number, limit: number, key: string) =>
  request.get<any, any>(
    API.MEMBER_LIST_URL + `?page=${page}&limit=${limit}&key=${key}`,
  )

export const reqMemberDelete = (ids: any) =>
  request.post<any, any>(API.MEMBER_DELETE_URL, ids)

export const reqMemberInfo = (id: number) =>
  request.get<any, any>(API.MEMBER_INFO_URL + `/${id}`)

// UPDATE提交
export const reqMemberUpdateCommit = (
  type: string,
  id: number,
  levelId: string,
  username: string,
  password: string,
  nickname: string,
  mobile: string,
  email: string,
  header: string,
  gender: string,
  birth: string,
  city: string,
  job: string,
  sign: string,
  sourceType: string,
  integration: string,
  growth: string,
  status: string,
  createTime: string,
) => {
  if (type == 'save') {
    return request.post<any, any>(API.MEMBER_UPDATE_COMMIT + `/${type}`, {
      levelId,
      username,
      password,
      nickname,
      mobile,
      email,
      header,
      gender,
      birth,
      city,
      job,
      sign,
      sourceType,
      integration,
      growth,
      status,
      createTime,
    })
  } else {
    return request.post<any, any>(API.MEMBER_UPDATE_COMMIT + `/${type}`, {
      id,
      levelId,
      username,
      password,
      nickname,
      mobile,
      email,
      header,
      gender,
      birth,
      city,
      job,
      sign,
      sourceType,
      integration,
      growth,
      status,
      createTime,
    })
  }
}
