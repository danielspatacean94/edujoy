import axios from 'axios'
import { useAuthStore } from '@/store/auth.store'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
  withCredentials: true,
})

// Logs out and bounces to /login on any 401, so an expired/invalid session
// never gets stuck showing stale authenticated UI.
apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      if (!window.location.pathname.startsWith('/login')) {
        useAuthStore.getState().logout().catch(() => null)
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  },
)
