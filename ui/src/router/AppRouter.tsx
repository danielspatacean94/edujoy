import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'
import { AppLayout } from '@/components/layout/AppLayout'
import { LoginPage } from '@/pages/auth/LoginPage'
import { NoAccessPage } from '@/pages/auth/NoAccessPage'
import { ForceChangePasswordPage } from '@/pages/auth/ForceChangePasswordPage'
import { DashboardPage } from '@/pages/dashboard/DashboardPage'
import { KindergartensPage } from '@/pages/kindergartens/KindergartensPage'
import { TeachersPage } from '@/pages/teachers/TeachersPage'
import { GroupsPage } from '@/pages/groups/GroupsPage'
import { ChildrenPage } from '@/pages/children/ChildrenPage'
import { HistoryPage } from '@/pages/admin/history/HistoryPage'
import { SettingsPage } from '@/pages/admin/settings/SettingsPage'
import { BannersPage } from '@/pages/admin/banners/BannersPage'
import { AttendancePage } from '@/pages/attendance/AttendancePage'
import { ChildrenWheelPage } from '@/pages/wheel/ChildrenWheelPage'

const AdminRoute = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute role="admin">{children}</ProtectedRoute>
)

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/no-access" element={<NoAccessPage />} />
        <Route
          path="/change-password"
          element={
            <ProtectedRoute>
              <ForceChangePasswordPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/attendance/:id"
          element={
            <ProtectedRoute>
              <AttendancePage />
            </ProtectedRoute>
          }
        />

        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />

          <Route
            path="/admin/users"
            element={<Navigate to="/admin/teachers" replace />}
          />
          <Route
            path="/admin/kindergartens"
            element={
              <AdminRoute>
                <KindergartensPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/teachers"
            element={
              <AdminRoute>
                <TeachersPage />
              </AdminRoute>
            }
          />
          <Route path="/groups" element={<GroupsPage />} />
          <Route path="/children" element={<ChildrenPage />} />
          <Route path="/attendance" element={<AttendancePage />} />
          <Route path="/wheel" element={<ChildrenWheelPage />} />
          <Route
            path="/admin/history"
            element={
              <AdminRoute>
                <HistoryPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <AdminRoute>
                <SettingsPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/banners"
            element={
              <AdminRoute>
                <BannersPage />
              </AdminRoute>
            }
          />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
