import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'
import { AppLayout } from '@/components/layout/AppLayout'
import { LoginPage } from '@/pages/auth/LoginPage'
import { NoAccessPage } from '@/pages/auth/NoAccessPage'
import { ForceChangePasswordPage } from '@/pages/auth/ForceChangePasswordPage'
import { DashboardPage } from '@/pages/dashboard/DashboardPage'
import { UsersPage } from '@/pages/admin/users/UsersPage'
import { HistoryPage } from '@/pages/admin/history/HistoryPage'
import { SettingsPage } from '@/pages/admin/settings/SettingsPage'
import { BannersPage } from '@/pages/admin/banners/BannersPage'
// import each new page here as it's created, e.g.:
// import { ClientsPage } from '@/pages/clients/ClientsPage'

const AdminRoute = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute role="admin">{children}</ProtectedRoute>
)

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/no-access" element={<NoAccessPage />} />
        <Route path="/change-password" element={<ProtectedRoute><ForceChangePasswordPage /></ProtectedRoute>} />

        <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route index element={<DashboardPage />} />

          {/* one <Route> per page, mirroring the nav entries in Sidebar.tsx, e.g.: */}
          {/* <Route path="/clients" element={<ClientsPage />} /> */}

          <Route path="/admin/users" element={<AdminRoute><UsersPage /></AdminRoute>} />
          <Route path="/admin/history" element={<AdminRoute><HistoryPage /></AdminRoute>} />
          <Route path="/admin/settings" element={<AdminRoute><SettingsPage /></AdminRoute>} />
          <Route path="/admin/banners" element={<AdminRoute><BannersPage /></AdminRoute>} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
