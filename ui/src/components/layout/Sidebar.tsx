import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { School, Sprout, Sun, LayoutDashboard, ChevronLeft, ChevronRight, Users, History, Settings, Megaphone, ClipboardCheck, Dices } from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
import { settingsService, type AppSettings } from '@/services/settings.service'

// One entry per top-level page. Add one row here for every page added to
// AppRouter.tsx, using whichever lucide-react icon fits the domain.
const mainNav = [
  { label: 'Ziua mea', path: '/', Icon: LayoutDashboard },
  { label: 'Prezență', path: '/attendance', Icon: ClipboardCheck },
  { label: 'Roata copiilor', path: '/wheel', Icon: Dices },
  // { label: 'Calendarul dimineții', path: '/morning-calendar', Icon: CalendarHeart },
  // { label: '<Domain>', path: '/<route>', Icon: SomeIcon },
]

// Nav entries rendered below a divider, visible to admins only.
const managementNav: typeof mainNav = [
  { label: 'Grupe', path: '/groups', Icon: Users },
  { label: 'Copii', path: '/children', Icon: Sprout },
]

const adminNav: typeof mainNav = [
  { label: 'Grădinițe', path: '/admin/kindergartens', Icon: School },
  { label: 'Educatori', path: '/admin/teachers', Icon: Users },
  { label: 'Anunțuri', path: '/admin/banners', Icon: Megaphone },
  { label: 'Setări', path: '/admin/settings', Icon: Settings },
  { label: 'Istoric', path: '/admin/history', Icon: History },
]

function NavItem({ label, path, Icon, collapsed, onClick }: {
  label: string
  path: string
  Icon: React.ElementType
  collapsed: boolean
  onClick?: () => void
}) {
  return (
    <NavLink
      to={path}
      end={path === '/'}
      title={collapsed ? label : undefined}
      onClick={onClick}
      className={({ isActive }) =>
        `relative flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors ${collapsed ? 'justify-center' : ''} ${
          isActive
            ? 'bg-brand-700 text-white border-l-[3px] border-accent-400 pl-[calc(0.75rem-3px)]'
            : 'text-slate-300 hover:bg-brand-700 hover:text-white border-l-[3px] border-transparent pl-[calc(0.75rem-3px)]'
        }`
      }
    >
      <Icon size={17} className="shrink-0" />
      {!collapsed && <span className="whitespace-nowrap">{label}</span>}
    </NavLink>
  )
}

interface SidebarProps {
  mobileOpen: boolean
  onMobileClose: () => void
}

export function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('sidebar-collapsed') === 'true')
  const user = useAuthStore((s) => s.user)
  const isAdmin = user?.role === 'admin'
  const effectiveCollapsed = collapsed && !mobileOpen
  const [appInfo, setAppInfo] = useState<AppSettings | null>(null)

  useEffect(() => {
    settingsService.get()
      .then(({ data }) => setAppInfo(data))
      .catch(() => setAppInfo(null))
  }, [])

  const isDev = appInfo?.nodeEnv !== 'production'

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-40
        md:relative md:inset-auto md:z-auto
        bg-brand-800 text-white flex flex-col
        transition-transform duration-200 ease-in-out
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        ${effectiveCollapsed ? 'w-16' : 'w-60'}
      `}
    >
      {/* Logo / brand */}
      <div className="flex items-center border-b border-brand-700 h-20 px-3 gap-2 shrink-0">
        <Sun size={27} className="text-accent-300 shrink-0" />
        {!effectiveCollapsed && (
          <div className="flex-1 min-w-0">
            <span className="block text-2xl font-bold tracking-wide text-white truncate">
              EduJoy
            </span>
            {appInfo && (
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] text-slate-400">v{appInfo.version}</span>
                <span className={`px-1 py-px rounded text-[9px] font-bold uppercase tracking-wide ${isDev ? 'bg-amber-900/60 text-amber-400' : 'bg-emerald-900/60 text-emerald-400'}`}>
                  {isDev ? 'dev' : 'prod'}
                </span>
              </div>
            )}
          </div>
        )}
        {effectiveCollapsed && <div className="flex-1" />}
        <button
          onClick={() => {
            const next = !collapsed
            setCollapsed(next)
            localStorage.setItem('sidebar-collapsed', String(next))
          }}
          className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-brand-700 transition-colors shrink-0 hidden md:flex"
          aria-label={collapsed ? 'Extinde meniul' : 'Restrânge meniul'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <nav className="flex-1 py-3 overflow-y-auto">
        <div className="space-y-0.5 px-2">
          {mainNav.map(({ label, path, Icon }) => (
            <NavItem key={path} label={label} path={path} Icon={Icon} collapsed={effectiveCollapsed} onClick={onMobileClose} />
          ))}
        </div>

        {(managementNav.length > 0 || isAdmin) && (
          <>
            <div className={`pt-4 pb-2 ${effectiveCollapsed ? 'px-2' : 'px-4'}`}>
              {effectiveCollapsed
                ? <div className="border-t border-brand-700" />
                : <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Administrare</p>
              }
            </div>
            <div className="space-y-0.5 px-2">
              {managementNav.map(({ label, path, Icon }) => (
                <NavItem key={path} label={label} path={path} Icon={Icon} collapsed={effectiveCollapsed} onClick={onMobileClose} />
              ))}
              {isAdmin && adminNav.map(({ label, path, Icon }) => (
                <NavItem key={path} label={label} path={path} Icon={Icon} collapsed={effectiveCollapsed} onClick={onMobileClose} />
              ))}
            </div>
          </>
        )}
      </nav>
      {!effectiveCollapsed && <p className="text-xs text-white/70 px-5 pb-6">Pași mici. Viitor luminos.</p>}
    </aside>
  )
}
