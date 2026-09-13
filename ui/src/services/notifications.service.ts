import { apiClient } from './api'

export interface AppNotification {
  id: string
  title: string
  message: string | null
  link: string | null
  isRead: boolean
  createdAt: string
}

export const notificationsService = {
  findRecent: (limit = 20) => apiClient.get<AppNotification[]>('/notifications', { params: { limit } }),
  findToday: () => apiClient.get<AppNotification[]>('/notifications/today'),
  markAsRead: (id: string) => apiClient.patch(`/notifications/${id}/read`),
  markAllRead: () => apiClient.patch('/notifications/read-all'),
  deleteOne: (id: string) => apiClient.delete(`/notifications/${id}`),
}
