import { apiClient } from './api'
import type { PaginatedResult } from '@/types'

export interface AppUser {
  id: string
  email: string
  fullName: string | null
  kindergartenId?: string | null
  role: 'admin' | 'teacher'
  createdAt: string
  updatedAt: string
}

export interface CreateUserDto {
  email: string
  fullName?: string
  password?: string
  kindergartenId?: string
  role?: 'admin' | 'teacher'
}

export interface UpdateUserDto {
  fullName?: string
  kindergartenId?: string
  role?: 'admin' | 'teacher'
}

export const usersService = {
  findAll: (page: number, limit: number, search?: string) =>
    apiClient.get<PaginatedResult<AppUser>>('/users', { params: { page, limit, ...(search ? { search } : {}) } }),

  create: (dto: CreateUserDto) => apiClient.post<AppUser>('/users', dto),

  update: (id: string, dto: UpdateUserDto) => apiClient.put<AppUser>(`/users/${id}`, dto),

  remove: (id: string) => apiClient.delete(`/users/${id}`),

  resetPassword: (id: string) => apiClient.post<{ password: string }>(`/users/${id}/reset-password`),
}
