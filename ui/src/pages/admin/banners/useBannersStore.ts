import { create } from 'zustand'
import { bannersService, type AppBanner, type CreateBannerDto, type UpdateBannerDto } from '@/services/banners.service'
import { PAGE_LIMIT } from '@/types'

interface BannersState {
  banners: AppBanner[]
  total: number
  loading: boolean

  fetchBanners: (page?: number, search?: string) => Promise<void>
  createBanner: (dto: CreateBannerDto) => Promise<void>
  updateBanner: (id: string, dto: UpdateBannerDto) => Promise<void>
  deleteBanner: (id: string) => Promise<void>
}

export const useBannersStore = create<BannersState>()((set) => ({
  banners: [],
  total: 0,
  loading: false,

  fetchBanners: async (page = 1, search) => {
    set({ loading: true })
    try {
      const { data: result } = await bannersService.findAll(page, PAGE_LIMIT, search)
      set({ banners: result.data, total: result.total })
    } finally {
      set({ loading: false })
    }
  },

  createBanner: async (dto) => {
    const { data } = await bannersService.create(dto)
    set((s) => ({ banners: [data, ...s.banners], total: s.total + 1 }))
  },

  updateBanner: async (id, dto) => {
    const { data } = await bannersService.update(id, dto)
    set((s) => ({ banners: s.banners.map((b) => (b.id === id ? data : b)) }))
  },

  deleteBanner: async (id) => {
    await bannersService.remove(id)
    set((s) => ({ banners: s.banners.filter((b) => b.id !== id), total: s.total - 1 }))
  },
}))
