import { apiClient } from './api'
import type { PaginatedResult } from '@/types'
import type { BannerStyle } from '@shared/types/banner'

export interface AppBanner {
  id: string
  message: string
  startDate: string
  endDate: string
  style: BannerStyle
  createdAt: string
  updatedAt: string
}

export interface CreateBannerDto {
  message: string
  startDate: string
  endDate: string
  style: BannerStyle
}

export interface UpdateBannerDto {
  message?: string
  startDate?: string
  endDate?: string
  style?: BannerStyle
}

export const bannersService = {
  findAll: (page: number, limit: number, search?: string) =>
    apiClient.get<PaginatedResult<AppBanner>>('/banners', { params: { page, limit, ...(search ? { search } : {}) } }),

  // Banners currently active app-wide — what Header renders. Not
  // paginated, no admin gating.
  findActive: () => apiClient.get<AppBanner[]>('/banners/active'),

  create: (dto: CreateBannerDto) => apiClient.post<AppBanner>('/banners', dto),

  update: (id: string, dto: UpdateBannerDto) => apiClient.put<AppBanner>(`/banners/${id}`, dto),

  remove: (id: string) => apiClient.delete(`/banners/${id}`),
}
