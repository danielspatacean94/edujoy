import { create } from 'zustand'
import { edujoyService, errorMessage, type RecordItem, type Resource } from '@/services/edujoy.service'
interface DirectoryState {
  rows: RecordItem[]; total: number; loading: boolean; error: string; request: number
  load: (resource: Resource, page: number, search: string, filters?: { kindergartenId?: string; groupId?: string }) => Promise<void>
}
export const createDirectoryStore = () => create<DirectoryState>((set, get) => ({
  rows: [], total: 0, loading: false, error: '', request: 0,
  load: async (resource, page, search, filters) => {
    const request = get().request + 1
    set({ loading: true, error: '', request })
    try {
      const { data } = await edujoyService.list(resource, page, search, 12, filters)
      if (get().request === request) set({ rows: data.data, total: data.total, loading: false })
    } catch (error) {
      if (get().request === request) set({ rows: [], total: 0, error: errorMessage(error), loading: false })
    }
  },
}))
