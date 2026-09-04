import { request } from '@/utils/request'

enum API {
  MEMBER_LEVEL_LIST_URL = '/member/memberlevel/list',
  MEMBER_LEVEL_DELETE_URL = '/member/memberlevel/delete',
  MEMBER_LEVEL_INFO_URL = '/member/memberlevel/info',
  MEMBER_LEVEL_UPDATE_COMMIT = '/member/memberlevel',
}

export const reqMemberLevelList = (page: number, limit: number, key: string) =>
  request.get<any, any>(
    API.MEMBER_LEVEL_LIST_URL + `?page=${page}&limit=${limit}&key=${key}`,
  )

export const reqMemberLeveDelete = (ids: any) =>
  request.post<any, any>(API.MEMBER_LEVEL_DELETE_URL, ids)

export const reqMemberLeveInfo = (id: number) =>
  request.get<any, any>(API.MEMBER_LEVEL_INFO_URL + `/${id}`)

// UPDATE提交
export const reqMemberLeveUpdateCommit = (
  type: string,
  id: number,
  name: string,
  growthPoint: number,
  defaultStatus: number,
  freeFreightPoint: number,
  commentGrowthPoint: number,
  priviledgeFreeFreight: number,
  priviledgeMemberPrice: number,
  priviledgeBirthday: number,
  note: string,
) => {
  if (type == 'save') {
    return request.post<any, any>(API.MEMBER_LEVEL_UPDATE_COMMIT + `/${type}`, {
      name,
      growthPoint,
      defaultStatus,
      freeFreightPoint,
      commentGrowthPoint,
      priviledgeFreeFreight,
      priviledgeMemberPrice,
      priviledgeBirthday,
      note,
    })
  } else {
    return request.post<any, any>(API.MEMBER_LEVEL_UPDATE_COMMIT + `/${type}`, {
      id,
      name,
      growthPoint,
      defaultStatus,
      freeFreightPoint,
      commentGrowthPoint,
      priviledgeFreeFreight,
      priviledgeMemberPrice,
      priviledgeBirthday,
      note,
    })
  }
}
