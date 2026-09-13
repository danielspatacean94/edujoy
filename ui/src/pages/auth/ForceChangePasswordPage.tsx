import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'
import { authService } from '@/services/auth.service'
import { useAuthStore } from '@/store/auth.store'
import { PasswordInput } from '@/components/ui/PasswordInput'

export function ForceChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { logout } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (newPassword.length < 8) {
      setError('Parola nouă trebuie să conțină cel puțin 8 caractere.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Parolele nu coincid.')
      return
    }

    setSubmitting(true)
    try {
      await authService.changePassword(currentPassword, newPassword)
      logout()
      navigate('/login')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(msg ?? 'Parola nu a putut fi schimbată.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-xl p-8">
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-3">
            <ShieldAlert size={24} className="text-amber-600" />
          </div>
          <h1 className="text-lg font-semibold text-gray-900">Parolă expirată</h1>
          <p className="text-sm text-gray-500 text-center mt-1">
            Alege o parolă nouă pentru a continua. Parola actuală este temporară sau a expirat.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Parola actuală <span className="text-red-500">*</span>
            </label>
            <PasswordInput
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Parola nouă <span className="text-red-500">*</span>
            </label>
            <PasswordInput
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirmă parola nouă <span className="text-red-500">*</span>
            </label>
            <PasswordInput
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-1 px-3 py-2 text-sm rounded-lg bg-brand-800 text-white font-medium hover:bg-brand-700 disabled:opacity-50 transition-colors"
          >
            {submitting ? 'Se salvează...' : 'Schimbă parola'}
          </button>
        </form>

        <button
          onClick={handleLogout}
          className="w-full mt-3 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          Deconectare
        </button>
      </div>
    </div>
  )
}
