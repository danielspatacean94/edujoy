import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth.store'

export function NoAccessPage() {
  const navigate = useNavigate()
  const logout = useAuthStore((s) => s.logout)

  const handleSignOut = async () => {
    try {
      await logout()
    } finally {
      navigate('/login', { replace: true })
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-gray-300 mb-4">403</h1>
        <p className="text-lg font-semibold text-gray-700 mb-2">Access Denied</p>
        <p className="text-sm text-gray-500 mb-6">
          You don't have permission to view this application.
        </p>
        <button
          onClick={handleSignOut}
          className="text-sm text-brand-700 hover:underline"
        >
          Sign in with a different account
        </button>
      </div>
    </div>
  )
}
