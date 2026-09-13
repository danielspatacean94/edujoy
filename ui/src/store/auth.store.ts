import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthState, User } from '@/types'
import { apiClient } from '@/services/api'

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true })
        try {
          await apiClient.post('/auth/login', { email, password })
          const { data } = await apiClient.get<User>('/auth/me')
          set({ user: data, isAuthenticated: true, isLoading: false })
        } catch (err) {
          set({ isLoading: false })
          throw err
        }
      },

      logout: async () => {
        try {
          await apiClient.post('/auth/logout')
        } finally {
          set({ user: null, isAuthenticated: false })
        }
      },

      refreshUser: async () => {
        const { data } = await apiClient.get<User>('/auth/me')
        set({ user: data })
      },
    }),
    {
      name: 'app-skeleton-auth',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    },
  ),
)
