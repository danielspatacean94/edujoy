import { describe, expect, it, jest } from '@jest/globals'
import { createCollectionStore } from './create-collection-store'
import type { PaginatedResult } from '@/types'

interface Item {
  id: string
}
function result(ids: string[], total = ids.length): PaginatedResult<Item> {
  return {
    data: ids.map((id) => ({ id })),
    total,
    page: 1,
    limit: 12,
    totalPages: Math.ceil(total / 12),
  }
}
function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((done) => {
    resolve = done
  })
  return { promise, resolve }
}

describe('Collection state', () => {
  it('keeps page instances isolated', async () => {
    const first = createCollectionStore(async () => result(['first']))
    const second = createCollectionStore(async () => result(['second']))
    first.getState().setSearch('Ana')
    first.getState().setDialog({ type: 'create' })
    await first.getState().load()
    expect(second.getState().search).toBe('')
    expect(second.getState().dialog).toBeNull()
    expect(second.getState().rows).toEqual([])
  })

  it('ignores old responses after the search changes, even before the next request starts', async () => {
    const old = deferred<PaginatedResult<Item>>()
    const fetchList = jest
      .fn<() => Promise<PaginatedResult<Item>>>()
      .mockReturnValueOnce(old.promise)
      .mockResolvedValueOnce(result(['new']))
    const store = createCollectionStore(fetchList)
    const loading = store.getState().load()
    store.getState().setSearch('new')
    old.resolve(result(['old']))
    await loading
    expect(store.getState().rows).toEqual([])
    await store.getState().load()
    expect(store.getState().rows).toEqual([{ id: 'new' }])
  })

  it('keeps the latest response when requests finish out of order', async () => {
    const old = deferred<PaginatedResult<Item>>()
    const fetchList = jest
      .fn<() => Promise<PaginatedResult<Item>>>()
      .mockReturnValueOnce(old.promise)
      .mockResolvedValueOnce(result(['latest']))
    const store = createCollectionStore(fetchList)
    const loading = store.getState().load()
    await store.getState().load()
    old.resolve(result(['old']))
    await loading
    expect(store.getState().rows).toEqual([{ id: 'latest' }])
  })

  it('moves to the last valid page after deleting the last item on a page', async () => {
    const store = createCollectionStore(async () => result([], 12))
    store.getState().setPage(2)
    await store.getState().load()
    expect(store.getState().page).toBe(1)
    expect(store.getState().loading).toBe(true)
  })

  it('preserves loaded data on error and clears errors on retry', async () => {
    const fetchList = jest
      .fn<() => Promise<PaginatedResult<Item>>>()
      .mockResolvedValueOnce(result(['saved']))
      .mockRejectedValueOnce(new Error('Conexiune întreruptă.'))
      .mockResolvedValueOnce(result(['updated']))
    const store = createCollectionStore(fetchList)
    await store.getState().load()
    await store.getState().load()
    expect(store.getState().rows).toEqual([{ id: 'saved' }])
    expect(store.getState().error).toBe('Conexiune întreruptă.')
    await store.getState().load()
    expect(store.getState().error).toBe('')
    expect(store.getState().rows).toEqual([{ id: 'updated' }])
  })

  it('ignores a response after the page unmounts', async () => {
    const pending = deferred<PaginatedResult<Item>>()
    const store = createCollectionStore(() => pending.promise)
    const loading = store.getState().load()
    store.getState().invalidate()
    pending.resolve(result(['stale']))
    await loading
    expect(store.getState().rows).toEqual([])
  })
})
