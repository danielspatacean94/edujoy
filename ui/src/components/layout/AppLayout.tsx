import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

export function AppLayout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-slate-100">
      {mobileNavOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setMobileNavOpen(false)}
        />
      )}
      <Sidebar mobileOpen={mobileNavOpen} onMobileClose={() => setMobileNavOpen(false)} />
      <div className="flex flex-col flex-1 min-w-0">
        <Header onMenuClick={() => setMobileNavOpen(true)} />
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
