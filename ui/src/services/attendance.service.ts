import { apiClient } from './api'
import { errorMessage } from './edujoy.service'

export type AttendanceStatus = 'PENDING' | 'IN_PROGRESS' | 'FINISHED'
export type ChildAttendanceStatus = 'PRESENT' | 'ABSENT'

export interface AttendanceSummary {
  id: string | null
  groupId: string
  groupName: string
  date: string
  status: AttendanceStatus | null
  childrenCount: number
  checkedCount: number
}

export interface AttendanceChild {
  id: string
  name: string
  age: number
  photoKey: string | null
  status: ChildAttendanceStatus | null
}

export interface AttendanceDetail extends AttendanceSummary {
  startedAt: string | null
  finishedAt: string | null
  children: AttendanceChild[]
}

export const attendanceService = {
  async list(date: string) {
    const { data } = await apiClient.get<{ date: string; data: AttendanceSummary[] }>('/attendances', { params: { date } })
    return data
  },
  async create(groupId: string, date: string) {
    const { data } = await apiClient.post<AttendanceDetail>('/attendances', { groupId, date })
    return data
  },
  async start(id: string) {
    const { data } = await apiClient.post<AttendanceDetail>(`/attendances/${id}/start`)
    return data
  },
  async setChildStatus(id: string, childId: string, status: ChildAttendanceStatus) {
    const { data } = await apiClient.post<AttendanceDetail>(`/attendances/${id}/children/${childId}/status`, { status })
    return data
  },
  async finish(id: string) {
    const { data } = await apiClient.post<AttendanceDetail>(`/attendances/${id}/finish`)
    return data
  },
  async reset(id: string) {
    const { data } = await apiClient.post<AttendanceDetail>(`/attendances/${id}/reset`)
    return data
  },
  async remove(id: string) {
    await apiClient.delete(`/attendances/${id}`)
  },
  async get(id: string) {
    const { data } = await apiClient.get<AttendanceDetail>(`/attendances/${id}`)
    return data
  },
}

export { errorMessage }
