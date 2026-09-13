import { useState, useEffect, FormEvent } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/auth.store'
import { PasswordInput } from '@/components/ui/PasswordInput'

export function LoginPage() {
  const { login, isLoading, isAuthenticated, user } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: Location })?.from?.pathname

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(from ?? '/', { replace: true })
    }
  }, [isAuthenticated, user, from, navigate])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      await login(email, password)
      navigate(from ?? '/', { replace: true })
    } catch {
      setError('Adresa de e-mail sau parola este incorectă. Încearcă din nou.')
    }
  }

  return (
    <div className="login-page min-h-screen flex flex-col">
      <div className="h-1.5 bg-gradient-to-r from-brand-800 to-brand-500" />

      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200">
            <div className="px-8 py-6 bg-brand-800">
              <p className="text-xs font-semibold uppercase tracking-widest text-accent-400 mb-1">
                Pași mici. Viitor luminos.
              </p>
              <h1 className="text-xl font-bold text-white">EduJoy</h1>
              <p className="text-sm text-slate-400 mt-0.5">Un loc primitor pentru comunitatea grădiniței tale</p>
            </div>

            <div className="px-8 py-7">
              <p className="text-sm font-semibold text-slate-700 mb-5">Bine ai revenit!</p>

              {error && (
                <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2.5">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
                    Adresă de e-mail
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-slate-300 rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
                    Parolă
                  </label>
                  <PasswordInput
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full text-white py-2.5 rounded text-sm font-semibold disabled:opacity-50 transition-colors mt-2 bg-brand-800 hover:bg-brand-700"
                >
                  {isLoading ? 'Se autentifică...' : 'Autentificare'}
                </button>
              </form>
            </div>
          </div>

          <p className="text-center text-xs text-slate-400 mt-6">
            © {new Date().getFullYear()} EduJoy — Pentru zile pline de descoperiri
          </p>
        </div>
      </div>
    </div>
  )
}
