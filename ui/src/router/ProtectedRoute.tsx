import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/auth.store'

interface Props {
  children: React.ReactNode
  role?: string
}

function isPasswordExpired(expiresAt: string | null | undefined): boolean {
  if (!expiresAt) return false
  return new Date(expiresAt) < new Date()
}

export function ProtectedRoute({ children, role }: Props) {
  const { isAuthenticated, user } = useAuthStore()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (isPasswordExpired(user?.passwordExpiresAt) && location.pathname !== '/change-password') {
    return <Navigate to="/change-password" replace />
  }

  if (role && user?.role !== role) {
    return <Navigate to="/no-access" replace />
  }

  return <>{children}</>
}
