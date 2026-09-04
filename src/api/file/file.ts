import { request } from '@/utils/request'

enum API {
  IMAGE_URL = '/thirdparty/oss/policy',
}

// 上传图片
export const reqImage = (t: any) =>
  request.get<any, any>(API.IMAGE_URL + `?t=${t}`)
