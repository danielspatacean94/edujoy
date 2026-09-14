import { Fragment, useState, useRef, useEffect } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { Menu, LogOut, KeyRound, ChevronDown, Megaphone, PartyPopper } from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
import { authService } from '@/services/auth.service'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { PasswordInput } from '@/components/ui/PasswordInput'
import { NotificationBell } from './NotificationBell'
import { useBannerStore } from '@/store/banner.store'
import type { AppBanner } from '@/services/banners.service'

// Derives breadcrumbs from the path. Replace with explicit per-route labels
// once routes have localized or non-1:1-with-the-URL labels; this generic
// version just title-cases segments.
function useBreadcrumbs(): { label: string; href?: string }[] {
  const { pathname } = useLocation()
  const home = { label: 'Acasă', href: '/' }
  if (pathname === '/') return [{ label: 'Acasă' }]

  const segments = pathname.split('/').filter(Boolean)
  const crumbs: { label: string; href?: string }[] = [home]
  let acc = ''
  segments.forEach((seg, i) => {
    acc += `/${seg}`
    const label = ({ admin: 'Administrare', kindergartens: 'Grădinițe', teachers: 'Educatori', children: 'Copii', groups: 'Grupe', users: 'Utilizatori', history: 'Istoric', settings: 'Setări', banners: 'Anunțuri', attendance: 'Prezență', wheel: 'Roata copiilor' } as Record<string, string>)[seg] ?? seg
    crumbs.push(i === segments.length - 1 ? { label } : { label, href: acc })
  })
  return crumbs
}

// Plain, low-key bar — same treatment for every 'ANNOUNCEMENT' banner
// regardless of content.
function AnnouncementBar({ banner }: { banner: AppBanner }) {
  return (
    <div className="flex items-center gap-2 px-4 md:px-6 py-2 bg-amber-50 border-b border-amber-200 text-amber-800 text-sm">
      <Megaphone size={15} className="shrink-0" />
      <span>{banner.message}</span>
    </div>
  )
}

// 'CELEBRATION' gets the fancy treatment: an animated gradient sheen
// (banner-shimmer, see tailwind.config.js) plus a couple of static
// PartyPopper icons — deliberately no confetti/canvas library, this is
// meant to read as festive, not distracting.
function CelebrationBar({ banner }: { banner: AppBanner }) {
  return (
    <div
      className="relative flex items-center justify-center gap-2 px-4 md:px-6 py-2.5 text-white text-sm font-medium text-center overflow-hidden
        bg-gradient-to-r from-fuchsia-500 via-purple-500 to-indigo-500 bg-[length:200%_100%] animate-banner-shimmer"
    >
      <PartyPopper size={16} className="shrink-0" />
      <span>{banner.message}</span>
      <PartyPopper size={16} className="shrink-0 -scale-x-100" />
    </div>
  )
}

// Admin-managed announcements active right now — see
// BannersService.findActive(). Stacked as one bar per banner, rendered
// below the fixed h-14 breadcrumb row so that row's height/layout stays
// untouched. `style` picks which of the two bar components renders each one
// (see Banner entity/BannersService).
function BannerStrip() {
  const { activeBanners, fetchActive } = useBannerStore()

  useEffect(() => {
    fetchActive()
  }, [])

  if (!activeBanners.length) return null

  return (
    <>
      {activeBanners.map((b) =>
        b.style === 'CELEBRATION' ? <CelebrationBar key={b.id} banner={b} /> : <AnnouncementBar key={b.id} banner={b} />
      )}
    </>
  )
}

function ChangePasswordModal({ onClose }: { onClose: () => void }) {
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

  return (
    <Modal title="Schimbă parola" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Parola actuală <span className="text-red-500">*</span>
          </label>
          <PasswordInput value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required autoFocus />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Parola nouă <span className="text-red-500">*</span>
          </label>
          <PasswordInput value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Confirmă parola nouă <span className="text-red-500">*</span>
          </label>
          <PasswordInput value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">{error}</p>
        )}

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="secondary" size="sm" onClick={onClose}>Anulează</Button>
          <Button type="submit" size="sm" disabled={submitting}>{submitting ? 'Se salvează…' : 'Salvează'}</Button>
        </div>
      </form>
    </Modal>
  )
}

function UserMenu() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [showChangePassword, setShowChangePassword] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 pl-2 pr-1.5 py-1 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <div className="text-right leading-tight">
          <p className="block text-sm font-medium text-gray-800 truncate max-w-[90px] sm:max-w-[160px]">
            {user?.fullName ?? user?.email}
          </p>
        </div>
        <ChevronDown size={14} className={`text-gray-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden py-1">
          <button
            onClick={() => { setShowChangePassword(true); setOpen(false) }}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <KeyRound size={15} className="text-gray-400" />
            Schimbă parola
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut size={15} />
            Deconectare
          </button>
        </div>
      )}

      {showChangePassword && <ChangePasswordModal onClose={() => setShowChangePassword(false)} />}
    </div>
  )
}

interface HeaderProps {
  onMenuClick: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const crumbs = useBreadcrumbs()

  return (
    <div className="shrink-0">
      <header className="h-20 bg-white border-b border-slate-200 shadow-sm flex items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onMenuClick}
            className="p-1.5 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors md:hidden shrink-0"
            aria-label="Deschide meniul"
          >
            <Menu size={20} />
          </button>
          <nav className="flex items-center gap-1 text-sm min-w-0">
            <div className="hidden sm:flex items-center gap-1">
              {crumbs.map((crumb, i) => (
                <Fragment key={i}>
                  {i > 0 && <span className="text-gray-400 shrink-0">/</span>}
                  {crumb.href ? (
                    <Link to={crumb.href} className="text-gray-500 hover:text-gray-700 transition-colors">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-gray-800 font-medium">{crumb.label}</span>
                  )}
                </Fragment>
              ))}
            </div>
            <span className="sm:hidden text-gray-800 font-medium truncate">
              {crumbs[crumbs.length - 1].label}
            </span>
          </nav>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <NotificationBell />
          <UserMenu />
        </div>
      </header>
      <BannerStrip />
    </div>
  )
}
