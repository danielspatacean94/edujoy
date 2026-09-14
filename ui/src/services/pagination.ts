import type { PaginatedResult } from '@/types'

export interface ListQuery {
  page: number
  search: string
  limit: number
}

export async function fetchAllPages<T>(
  fetchPage: (query: ListQuery) => Promise<PaginatedResult<T>>,
): Promise<T[]> {
  const rows: T[] = []
  let page = 1
  let totalPages = 1
  do {
    const result = await fetchPage({ page, search: '', limit: 1000 })
    rows.push(...result.data)
    totalPages = result.totalPages
    page++
  } while (page <= totalPages)
  return rows
}
