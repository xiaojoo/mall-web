import { request } from '@/utils/request'

enum API {
  SCHEDULE_LIST_URL = '/sys/schedule/list',
  SCHEDULE_DELETE_URL = '/sys/schedule/delete',
  SCHEDULE_PAUSE_URL = '/sys/schedule/pause',
  SCHEDULE_RESUME_URL = '/sys/schedule/resume',
  SCHEDULE_RUN_URL = '/sys/schedule/run',
  SCHEDULE_INFO_URL = '/sys/schedule/info',
  SCHEDULE_UPDATE_COMMIT = '/sys/schedule',
  SCHEDULE_LOG_LIST = '/sys/scheduleLog/list',
  SCHEDULE_LOG_INFO = '/sys/scheduleLog/info',
}

export const reqScheduleList = (page: number, limit: number, jobName: string) =>
  request.get<any, any>(
    API.SCHEDULE_LIST_URL + `?page=${page}&limit=${limit}&jobName=${jobName}`,
  )

export const reqScheduleDelete = (id: any) =>
  request.post<any, any>(API.SCHEDULE_DELETE_URL, id)

export const reqSchedulePause = (id: any) =>
  request.post<any, any>(API.SCHEDULE_PAUSE_URL, id)

export const reqScheduleResume = (id: any) =>
  request.post<any, any>(API.SCHEDULE_RESUME_URL, id)

export const reqScheduleRun = (id: any) =>
  request.post<any, any>(API.SCHEDULE_RUN_URL, id)

export const reqScheduleInfo = (id: number) =>
  request.get<any, any>(API.SCHEDULE_INFO_URL + `/${id}`)

export const reqScheduleLogList = (
  page: number,
  limit: number,
  jobId: string,
) =>
  request.get<any, any>(
    API.SCHEDULE_LOG_LIST + `?page=${page}&limit=${limit}&jobId=${jobId}`,
  )

export const reqScheduleLogInfo = (id: number) =>
  request.get<any, any>(API.SCHEDULE_LOG_INFO + `/${id}`)

// UPDATE提交
export const reqSchedulerUpdateCommit = (
  type: string,
  id: number,
  jobName: string,
  params: string,
  cronExpression: string,
  remark: string,
  status: number,
) => {
  if (type == 'save') {
    return request.post<any, any>(API.SCHEDULE_UPDATE_COMMIT + `/${type}`, {
      jobName,
      params,
      cronExpression,
      remark,
      status,
    })
  } else {
    return request.post<any, any>(API.SCHEDULE_UPDATE_COMMIT + `/${type}`, {
      id,
      jobName,
      params,
      cronExpression,
      remark,
      status,
    })
  }
}
