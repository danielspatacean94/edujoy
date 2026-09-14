import { useEffect, useState } from 'react'
import { createCollectionStore } from '@/store/create-collection-store'

export function useCollection<T>(
  createStore: () => ReturnType<typeof createCollectionStore<T>>,
) {
  const [useStore] = useState(createStore)
  const state = useStore()
  const { page, search, load, invalidate, setDialog } = state

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load()
    }, 200)
    return () => {
      window.clearTimeout(timer)
      invalidate()
    }
  }, [page, search, load, invalidate])

  const saved = () => {
    setDialog(null)
    void load()
  }
  return { ...state, saved }
}
