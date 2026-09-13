export const PAGE_LIMIT = 50

export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface User {
  id: string
  email: string
  fullName: string | null
  kindergartenId?: string | null
  role: 'admin' | 'teacher'
  passwordExpiresAt: string | null
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}
