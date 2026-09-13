import { useEffect, useState } from 'react'
import { AppRouter } from '@/router/AppRouter'
import { useAuthStore } from '@/store/auth.store'

export default function App() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const init = async () => {
      if (useAuthStore.getState().isAuthenticated) {
        try {
          await useAuthStore.getState().refreshUser()
        } catch {
          // 401 interceptor in services/api.ts handles logout + redirect
        }
      }

      setReady(true)
    }

    init()
  }, [])

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return <AppRouter />
}
