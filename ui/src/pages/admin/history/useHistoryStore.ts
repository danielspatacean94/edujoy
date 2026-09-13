import { create } from 'zustand'
import { auditLogService, type AuditLog, type AuditLogFilters } from '@/services/audit-log.service'
import { PAGE_LIMIT } from '@/types'

export type { AuditLog, AuditLogFilters }
export const HISTORY_LIMIT = PAGE_LIMIT

interface HistoryState {
  logs: AuditLog[]
  total: number
  loading: boolean
  fetchLogs: (page?: number, filters?: AuditLogFilters) => Promise<void>
}

export const useHistoryStore = create<HistoryState>()((set) => ({
  logs: [],
  total: 0,
  loading: false,

  fetchLogs: async (page = 1, filters = {}) => {
    set({ loading: true })
    try {
      const { data: result } = await auditLogService.findAll(page, HISTORY_LIMIT, filters)
      set({ logs: result.data, total: result.total })
    } finally {
      set({ loading: false })
    }
  },
}))
