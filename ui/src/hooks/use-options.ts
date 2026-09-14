import { useCallback, useEffect, useRef, useState } from 'react'
import { errorMessage } from '@/services/api-error'

export function useOptions<T>(
  fetchOptions: () => Promise<T[]>,
  enabled = true,
) {
  const [rows, setRows] = useState<T[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(enabled)
  const request = useRef(0)

  const reload = useCallback(async () => {
    const current = ++request.current
    if (!enabled) {
      setRows([])
      setError('')
      setLoading(false)
      return
    }
    setLoading(true)
    setError('')
    try {
      const result = await fetchOptions()
      if (request.current === current) setRows(result)
    } catch (cause) {
      if (request.current === current) setError(errorMessage(cause))
    } finally {
      if (request.current === current) setLoading(false)
    }
  }, [enabled, fetchOptions])

  useEffect(() => {
    void reload()
    return () => {
      request.current++
    }
  }, [reload])

  return { rows, loading, error, reload }
}
