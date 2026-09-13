import { apiClient } from './api'
import type { PaginatedResult } from '@/types'

export type AuditAction = 'INSERT' | 'UPDATE' | 'SOFT_DELETE'

export interface AuditLog {
  _id: string
  userId: string | null
  userEmail: string | null
  userFullName: string | null
  action: AuditAction
  entityType: string
  entityId: string | null
  entityBefore: Record<string, any> | null
  entityAfter: Record<string, any> | null
  createdAt: string
}

export interface AuditLogFilters {
  entityType?: string
  entityId?: string
  userId?: string
  action?: AuditAction
  search?: string
}

export const auditLogService = {
  findAll: (page: number, limit: number, filters: AuditLogFilters = {}) =>
    apiClient.get<PaginatedResult<AuditLog>>('/audit-logs', { params: { page, limit, ...filters } }),
}
