import { apiClient } from './api'
import { fetchAllPages, type ListQuery } from './pagination'
import type { PaginatedResult } from '@/types'

export interface Group {
  id: string
  name: string
  kindergartenId: string
  childrenCount: number
}
export interface GroupInput {
  name: string
  kindergartenId?: string
}

export const groupsService = {
  async list(query: ListQuery) {
    return (
      await apiClient.get<PaginatedResult<Group>>('/groups', { params: query })
    ).data
  },
  all: (): Promise<Group[]> => fetchAllPages(groupsService.list),
  async create(input: GroupInput) {
    return (await apiClient.post<Group>('/groups', input)).data
  },
  async update(id: string, input: GroupInput) {
    return (await apiClient.put<Group>(`/groups/${id}`, input)).data
  },
  async remove(id: string) {
    await apiClient.delete(`/groups/${id}`)
  },
}
