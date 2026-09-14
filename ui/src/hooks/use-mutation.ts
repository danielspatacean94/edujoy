import { useRef, useState } from 'react'
import { errorMessage } from '@/services/api-error'

export function useMutation() {
  const pending = useRef(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function run(action: () => Promise<void>) {
    if (pending.current) return
    pending.current = true
    setBusy(true)
    setError('')
    try {
      await action()
    } catch (cause) {
      setError(errorMessage(cause))
    } finally {
      pending.current = false
      setBusy(false)
    }
  }
  return { busy, error, run }
}
