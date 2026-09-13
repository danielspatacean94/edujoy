import { apiClient } from './api'

export interface AppSettings {
  appName: string
  version: string
  nodeEnv: string
  global: Record<string, unknown> | null
}

export const settingsService = {
  get: () => apiClient.get<AppSettings>('/settings'),
  update: (global: Record<string, unknown>) => apiClient.patch<AppSettings>('/settings', { global }),
}
