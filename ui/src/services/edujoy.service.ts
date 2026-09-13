import { isAxiosError } from 'axios'
import { apiClient } from './api'
import type { PaginatedResult } from '@/types'
export type Resource = 'kindergartens' | 'teachers' | 'children' | 'groups'
export interface RecordItem {
  id: string; name?: string; fullName?: string | null; location?: string; age?: number;
  groupId?: string | null; kindergartenId?: string | null; photoKey?: string | null; childrenCount?: number; email?: string; role?: 'admin' | 'teacher'
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
    ? apiClient.put<RecordItem>(`${endpoint(resource)}/${id}`, input)
    : apiClient.post<RecordItem>(endpoint(resource), input),
  async uploadChildPhoto(id: string, file: File) {
    const prepared = await prepareChildPhoto(file)
    const form = new FormData()
    form.append('file', prepared)
    return apiClient.post<RecordItem>(`/children/${id}/photo`, form)
  },
  async photo(id: string) {
    const response = await apiClient.get<ArrayBuffer>(`/children/${id}/photo`, { responseType: 'arraybuffer' })
    const contentType = String(response.headers['content-type'] ?? '')
    const rawBytes = new Uint8Array(response.data)
    const rawText = new TextDecoder().decode(rawBytes).trimStart()
    if (contentType.includes('application/json') || rawText.startsWith('{')) {
      const parsed: unknown = JSON.parse(rawText)
      if (parsed && typeof parsed === 'object' && 'type' in parsed && 'data' in parsed && parsed.type === 'Buffer' && Array.isArray(parsed.data)) {
        const bytes = parsed.data.filter((value): value is number => typeof value === 'number')
        return new Blob([Uint8Array.from(bytes)], { type: 'image/jpeg' })
      }
    }
    return new Blob([response.data], { type: contentType || 'image/jpeg' })
  },
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

export const CHILD_PHOTO_MAX_PIXELS = 400
export const CHILD_PHOTO_MAX_BYTES = 120 * 1024

export async function prepareChildPhoto(file: File) {
  if (!file.type.startsWith('image/')) throw new Error('Alege un fișier imagine.')
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, CHILD_PHOTO_MAX_PIXELS / bitmap.width, CHILD_PHOTO_MAX_PIXELS / bitmap.height)
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(bitmap.width * scale))
  canvas.height = Math.max(1, Math.round(bitmap.height * scale))
  canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()
  let quality = 0.82
  let blob: Blob | null = null
  while (quality >= 0.42) {
    blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', quality))
    if (blob && blob.size <= CHILD_PHOTO_MAX_BYTES) break
    quality -= 0.1
  }
  if (!blob || blob.size > CHILD_PHOTO_MAX_BYTES) throw new Error('Fotografia este prea mare. Alege o imagine mai simplă.')
  return new File([blob], 'child-photo.jpg', { type: 'image/jpeg' })
}
export function errorMessage(error: unknown) {
  if (isAxiosError(error)) {
    const message: unknown = error.response?.data?.message
    if (typeof message === 'string') return message
    if (Array.isArray(message)) return message.join('. ')
  }
  return 'A apărut o eroare. Încearcă din nou.'
}
