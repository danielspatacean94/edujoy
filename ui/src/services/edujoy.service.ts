import { isAxiosError } from 'axios'
import { apiClient } from './api'
import type { PaginatedResult } from '@/types'
export type Resource = 'kindergartens' | 'teachers' | 'children' | 'groups'
export interface RecordItem {
  id: string; name?: string; fullName?: string | null; location?: string; age?: number;
  groupId?: string | null; kindergartenId?: string | null; childrenCount?: number; email?: string; role?: 'admin' | 'teacher'
}
export interface RecordInput {
  name?: string; fullName?: string; location?: string; age?: number;
  groupId?: string; kindergartenId?: string; email?: string; password?: string; role?: 'teacher'
}
const endpoint = (resource: Resource) => resource === 'teachers' ? '/users' : `/${resource}`
export const edujoyService = {
  list: (resource: Resource, page = 1, search = '', limit = 12, filters: { kindergartenId?: string; groupId?: string } = {}) =>
    apiClient.get<PaginatedResult<RecordItem>>(endpoint(resource), { params: { page, limit, search, ...filters } }),
  save: (resource: Resource, input: RecordInput, id?: string) => id
    ? apiClient.put(`${endpoint(resource)}/${id}`, input)
    : apiClient.post(endpoint(resource), input),
  remove: (resource: Resource, id: string) => apiClient.delete(`${endpoint(resource)}/${id}`),
  reset: (id: string) => apiClient.post<{ password: string }>(`/users/${id}/reset-password`),
  async groups(kindergartenId?: string) {
    const rows: RecordItem[] = []
    let page = 1, pages = 1
    do {
      const { data } = await this.list('groups', page, '', 1000, { kindergartenId })
      rows.push(...data.data); pages = data.totalPages; page++
    } while (page <= pages)
    return rows
  },
  async kindergartens() {
    const rows: RecordItem[] = []
    let page = 1, pages = 1
    do {
      const { data } = await this.list('kindergartens', page, '', 1000)
      rows.push(...data.data); pages = data.totalPages; page++
    } while (page <= pages)
    return rows
  },
}
export function errorMessage(error: unknown) {
  if (isAxiosError(error)) {
    const message: unknown = error.response?.data?.message
    if (typeof message === 'string') return message
    if (Array.isArray(message)) return message.join('. ')
  }
  return 'A apărut o eroare. Încearcă din nou.'
}
