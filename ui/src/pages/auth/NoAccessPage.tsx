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
        <p className="text-lg font-semibold text-gray-700 mb-2">Acces interzis</p>
        <p className="text-sm text-gray-500 mb-6">
          Nu ai permisiunea de a accesa această pagină.
        </p>
        <button
          onClick={handleSignOut}
          className="text-sm text-brand-700 hover:underline"
        >
          Autentifică-te cu un alt cont
        </button>
      </div>
    </div>
  )
}
