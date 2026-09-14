import { apiClient } from './api'
import type { ChildGenre } from '@shared/types/child'
import type { ListQuery } from './pagination'
import type { PaginatedResult } from '@/types'
import { prepareChildPhoto, loadChildPhoto } from './child-photo.service'

export interface Child {
  id: string
  name: string
  age: number
  genre: ChildGenre | null
  kindergartenId: string
  groupId: string | null
  photoKey: string | null
}
export interface ChildInput {
  name: string
  age: number
  genre: ChildGenre
  groupId: string
  kindergartenId?: string
}

export const childrenService = {
  async list(query: ListQuery) {
    return (
      await apiClient.get<PaginatedResult<Child>>('/children', {
        params: query,
      })
    ).data
  },
  async create(input: ChildInput) {
    return (await apiClient.post<Child>('/children', input)).data
  },
  async update(id: string, input: ChildInput) {
    return (await apiClient.put<Child>(`/children/${id}`, input)).data
  },
  async remove(id: string) {
    await apiClient.delete(`/children/${id}`)
  },
  photo: loadChildPhoto,
  async uploadPhoto(id: string, file: File) {
    const form = new FormData()
    form.append('file', await prepareChildPhoto(file))
    return (await apiClient.post<Child>(`/children/${id}/photo`, form)).data
  },
}
