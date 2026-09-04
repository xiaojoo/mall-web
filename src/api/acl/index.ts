import { request } from '@/utils/request'

enum API {
  USER_LIST_URL = '/sys/user/list',
  USER_DELETE_URL = '/sys/user/delete',
  USER_INFO_URL = '/sys/user/info',
  USER_UPDATE_COMMIT = '/sys/user',
  USER_KICK_URL = '/sys/user/kick',

  ROLE_SELECT_URL = '/sys/role/select',
  ROLE_LIST_URL = '/sys/role/list',
  ROLE_INFO_URL = '/sys/role/info',
  ROLE_DELETE_URL = '/sys/role/delete',
  ROLE_UPDATE_COMMIT = '/sys/role',

  MENU_LIST_URL = '/sys/menu/list',
  MENU_SELECT_URL = '/sys/menu/select',
  MENU_INFO_URL = '/sys/menu/info',
  MENU_DELETE_URL = '/sys/menu/delete',
  MENU_UPDATE_COMMIT = '/sys/menu',

  LOG_LIST_URL = '/sys/log/list',
  LOG_STATS_URL = '/sys/log/stats',
  USER_PROFILE_URL = '/sys/user/profile',
  CHANGE_PASSWORD_URL = '/sys/user/updatePassword',
}

export const reqUserList = (page: number, limit: number, username: string) =>
  request.get<any, any>(
    API.USER_LIST_URL + `?page=${page}&limit=${limit}&username=${username}`,
  )

export const reqUserDelete = (id: any) =>
  request.post<any, any>(API.USER_DELETE_URL, id)

export const reqUserInfo = (id: any) =>
  request.get<any, any>(API.USER_INFO_URL + `/${id}`)

// 踢人：吊销该用户全部登录态（需 sys:user:update 权限）
export const reqUserKick = (userId: any) =>
  request.post<any, any>(API.USER_KICK_URL, { userId })

export const reqSelectInfo = () => request.get<any, any>(API.ROLE_SELECT_URL)

export const reqRoleList = (page: number, limit: number, roleName: string) =>
  request.get<any, any>(
    API.ROLE_LIST_URL + `?page=${page}&limit=${limit}&roleName=${roleName}`,
  )

export const reqRoleInfo = (id: any) =>
  request.get<any, any>(API.ROLE_INFO_URL + `/${id}`)

export const reqRoleDelete = (id: any) =>
  request.post<any, any>(API.ROLE_DELETE_URL, id)

export const reqMenuList = () => request.get<any, any>(API.MENU_LIST_URL)

export const reqMenuDelete = (id: any) =>
  request.post<any, any>(API.MENU_DELETE_URL + `/${id}`)

export const reqMenuSelectInfo = () =>
  request.get<any, any>(API.MENU_SELECT_URL)

export const reqMenuInfo = (id: any) =>
  request.get<any, any>(API.MENU_INFO_URL + `/${id}`)

export const reqUserUpdateCommit = (
  type: string,
  roleId: number,
  username: string,
  password: string,
  email: string,
  mobile: string,
  salt: string,
  status: number,
  roleIdList: string[],
) => {
  if (type == 'save') {
    return request.post<any, any>(API.USER_UPDATE_COMMIT + `/${type}`, {
      username,
      password,
      email,
      mobile,
      salt,
      status,
      roleIdList,
    })
  } else {
    return request.post<any, any>(API.USER_UPDATE_COMMIT + `/${type}`, {
      userId: roleId,
      username,
      password,
      email,
      mobile,
      salt,
      status,
      roleIdList,
    })
  }
}

export const reqRoleUpdateCommit = (
  type: string,
  roleId: number,
  roleName: string,
  remark: string,
  menuIdList: string[],
) => {
  if (type == 'save') {
    return request.post<any, any>(API.ROLE_UPDATE_COMMIT + `/${type}`, {
      roleName,
      remark,
      menuIdList,
    })
  } else {
    return request.post<any, any>(API.ROLE_UPDATE_COMMIT + `/${type}`, {
      roleId,
      roleName,
      remark,
      menuIdList,
    })
  }
}

export const reqMenuUpdateCommit = (
  typeUp: string,
  id: number,
  type: number,
  name: string,
  parentId: number,
  url: string,
  perms: string,
  icon: string,
  orderNum: number,
  roleIdList: string[],
) => {
  if (typeUp == 'save') {
    return request.post<any, any>(API.MENU_UPDATE_COMMIT + `/${typeUp}`, {
      type,
      name,
      parentId,
      url,
      perms,
      icon,
      orderNum,
      roleIdList,
    })
  } else {
    return request.post<any, any>(API.MENU_UPDATE_COMMIT + `/${typeUp}`, {
      menuId: id,
      type,
      name,
      parentId,
      url,
      perms,
      icon,
      orderNum,
      roleIdList,
    })
  }
}

// 操作日志统计（首页报表）
export const reqLogStats = () => request.get<any, any>(API.LOG_STATS_URL)

// 当前用户资料（头像弹窗）
export const reqUserProfile = () => request.get<any, any>(API.USER_PROFILE_URL)
export const reqUserProfileUpdate = (data: any) =>
  request.post<any, any>(API.USER_PROFILE_URL, data)
export const reqChangePassword = (data: any) =>
  request.post<any, any>(API.CHANGE_PASSWORD_URL, data)
