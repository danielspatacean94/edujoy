import { create } from 'zustand'
import { usersService, type AppUser, type CreateUserDto, type UpdateUserDto } from '@/services/users.service'
import { PAGE_LIMIT } from '@/types'

interface UsersState {
  users: AppUser[]
  total: number
  loading: boolean

  fetchUsers: (page?: number, search?: string) => Promise<void>
  createUser: (dto: CreateUserDto) => Promise<void>
  updateUser: (id: string, dto: UpdateUserDto) => Promise<void>
  deleteUser: (id: string) => Promise<void>
  resetPassword: (id: string) => Promise<string>
}

export const useUsersStore = create<UsersState>()((set) => ({
  users: [],
  total: 0,
  loading: false,

  fetchUsers: async (page = 1, search) => {
    set({ loading: true })
    try {
      const { data: result } = await usersService.findAll(page, PAGE_LIMIT, search)
      set({ users: result.data, total: result.total })
    } finally {
      set({ loading: false })
    }
  },

  createUser: async (dto) => {
    const { data } = await usersService.create(dto)
    set((s) => ({ users: [...s.users, data], total: s.total + 1 }))
  },

  updateUser: async (id, dto) => {
    const { data } = await usersService.update(id, dto)
    set((s) => ({ users: s.users.map((u) => (u.id === id ? data : u)) }))
  },

  deleteUser: async (id) => {
    await usersService.remove(id)
    set((s) => ({ users: s.users.filter((u) => u.id !== id), total: s.total - 1 }))
  },

  resetPassword: async (id) => {
    const { data } = await usersService.resetPassword(id)
    return data.password
  },
}))
