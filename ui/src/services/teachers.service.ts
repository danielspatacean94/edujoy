import { apiClient } from './api'
import type { ListQuery } from './pagination'
import type { PaginatedResult } from '@/types'

export interface Teacher {
  id: string
  fullName: string | null
  email: string
  kindergartenId: string | null
}
export interface TeacherInput {
  fullName: string
  kindergartenId: string
}
export interface CreateTeacherInput extends TeacherInput {
  email: string
  password: string
}

export const teachersService = {
  async list(query: ListQuery) {
    return (
      await apiClient.get<PaginatedResult<Teacher>>('/users', { params: query })
    ).data
  },
  async create(input: CreateTeacherInput) {
    return (
      await apiClient.post<Teacher>('/users', { ...input, role: 'teacher' })
    ).data
  },
  async update(id: string, input: TeacherInput) {
    return (await apiClient.put<Teacher>(`/users/${id}`, input)).data
  },
  async remove(id: string) {
    await apiClient.delete(`/users/${id}`)
  },
  async resetPassword(id: string) {
    return (
      await apiClient.post<{ password: string }>(`/users/${id}/reset-password`)
    ).data
  },
}
