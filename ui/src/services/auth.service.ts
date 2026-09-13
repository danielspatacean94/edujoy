import { apiClient } from './api'
import type { User } from '@/types'

export const authService = {
  login: (email: string, password: string) =>
    apiClient.post<{ access_token: string }>('/auth/login', { email, password }),

  me: () => apiClient.get<User>('/auth/me'),

  logout: () => apiClient.post('/auth/logout'),

  changePassword: (currentPassword: string, newPassword: string) =>
    apiClient.put('/auth/change-password', { currentPassword, newPassword }),
}
