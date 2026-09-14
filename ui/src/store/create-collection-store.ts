import { create } from 'zustand'
import { errorMessage } from '@/services/api-error'
import type { ListQuery } from '@/services/pagination'
import type { PaginatedResult } from '@/types'

export type EditorState<T> =
  { type: 'create' } | { type: 'edit' | 'delete'; item: T }

interface CollectionState<T> {
  rows: T[]
  total: number
  page: number
  search: string
  loading: boolean
  error: string
  request: number
  dialog: EditorState<T> | null
  setPage: (page: number) => void
  setSearch: (search: string) => void
  setDialog: (dialog: EditorState<T> | null) => void
  load: () => Promise<void>
  invalidate: () => void
}

export const PAGE_SIZE = 12

export function createCollectionStore<T>(
  fetchList: (query: ListQuery) => Promise<PaginatedResult<T>>,
) {
  return create<CollectionState<T>>((set, get) => ({
    rows: [],
    total: 0,
    page: 1,
    search: '',
    loading: true,
    error: '',
    request: 0,
    dialog: null,
    setPage: (page) =>
      set((state) => ({ page, request: state.request + 1, loading: true })),
    setSearch: (search) =>
      set((state) => ({
        search,
        page: 1,
        request: state.request + 1,
        loading: true,
      })),
    setDialog: (dialog) => set({ dialog }),
    invalidate: () => set((state) => ({ request: state.request + 1 })),
    load: async () => {
      const { page, search } = get()
      const request = get().request + 1
      set({ request, loading: true, error: '' })
      try {
        const result = await fetchList({ page, search, limit: PAGE_SIZE })
        if (get().request !== request) return
        const lastPage = Math.max(1, Math.ceil(result.total / PAGE_SIZE))
        if (page > lastPage) {
          set({ page: lastPage })
          return
        }
        set({ rows: result.data, total: result.total, loading: false })
      } catch (cause) {
        if (get().request === request)
          set({ error: errorMessage(cause), loading: false })
      }
    },
  }))
}
