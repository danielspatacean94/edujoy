import { create } from 'zustand'
import { bannersService, type AppBanner } from '@/services/banners.service'

interface BannerState {
  activeBanners: AppBanner[]
  fetchActive: () => Promise<void>
}

// Read by Header to render active banners — separate from the admin-only
// management store in pages/admin/banners/useBannersStore.ts.
export const useBannerStore = create<BannerState>()((set) => ({
  activeBanners: [],

  fetchActive: async () => {
    const { data } = await bannersService.findActive()
    set({ activeBanners: data })
  },
}))
