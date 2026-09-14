import { apiClient } from './api'
import { fetchAllPages, type ListQuery } from './pagination'
import type { PaginatedResult } from '@/types'

export interface Kindergarten {
  id: string
  name: string
  location: string
}
export interface KindergartenInput {
  name: string
  location: string
}

export const kindergartensService = {
  async list(query: ListQuery) {
    return (
      await apiClient.get<PaginatedResult<Kindergarten>>('/kindergartens', {
        params: query,
      })
    ).data
  },
  all: (): Promise<Kindergarten[]> => fetchAllPages(kindergartensService.list),
  async create(input: KindergartenInput) {
    return (await apiClient.post<Kindergarten>('/kindergartens', input)).data
  },
  async update(id: string, input: KindergartenInput) {
    return (await apiClient.put<Kindergarten>(`/kindergartens/${id}`, input))
      .data
  },
  async remove(id: string) {
    await apiClient.delete(`/kindergartens/${id}`)
  },
}
