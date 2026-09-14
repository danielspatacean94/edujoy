import type {
  AttendanceDetail,
  AttendanceStatus,
  AttendanceSummary,
} from '@/services/attendance.service'

export function today() {
  const date = new Date()
  const offset = date.getTimezoneOffset()
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 10)
}

export const statusLabels: Record<AttendanceStatus, string> = {
  PENDING: 'În așteptare',
  IN_PROGRESS: 'În desfășurare',
  FINISHED: 'Finalizată',
}

export function updateSummary(
  rows: AttendanceSummary[],
  detail: AttendanceDetail,
) {
  return rows.map((row) =>
    row.groupId === detail.groupId
      ? {
          ...row,
          id: detail.id,
          status: detail.status,
          childrenCount: detail.childrenCount,
          checkedCount: detail.checkedCount,
        }
      : row,
  )
}
