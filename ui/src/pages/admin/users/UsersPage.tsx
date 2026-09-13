import { useEffect, useState } from 'react'
import { Pencil, Trash2, KeyRound, Plus } from 'lucide-react'
import { PAGE_LIMIT } from '@/types'
import { Table, type Column } from '@/components/ui/Table'
import { MobileTable } from '@/components/ui/MobileTable'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { CreateUserDialog, EditUserDialog, DeleteUserDialog, ResetPasswordDialog } from './UserDialogs'
import type { AppUser } from '@/services/users.service'
import { useUsersStore } from './useUsersStore'

type DialogState =
  | { type: 'none' }
  | { type: 'create' }
  | { type: 'edit'; user: AppUser }
  | { type: 'delete'; user: AppUser }
  | { type: 'reset'; user: AppUser }

export function UsersPage() {
  const { users, total, loading, fetchUsers, createUser, updateUser, deleteUser, resetPassword } = useUsersStore()
  const [dialog, setDialog] = useState<DialogState>({ type: 'none' })
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchUsers(page, search || undefined)
  }, [page, search])

  const handleSearch = (query: string) => { setSearch(query); setPage(1) }

  const close = () => setDialog({ type: 'none' })

  const roleBadge = (u: AppUser) => (
    <Badge label={u.role === 'admin' ? 'Administrator' : 'Educator'} variant={u.role === 'admin' ? 'purple' : 'default'} />
  )

  const userActions = (u: AppUser, size: number) => u.role === 'admin' ? null : (
    <div className="flex items-center gap-1">
      <button onClick={() => setDialog({ type: 'edit', user: u })} title="Editează" className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
        <Pencil size={size} />
      </button>
      <button onClick={() => setDialog({ type: 'reset', user: u })} title="Resetează parola" className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
        <KeyRound size={size} />
      </button>
      <button onClick={() => setDialog({ type: 'delete', user: u })} title="Șterge" className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors">
        <Trash2 size={size} />
      </button>
    </div>
  )

  const columns: Column<AppUser>[] = [
    {
      key: 'fullName',
      header: 'Nume',
      render: (u) => u.fullName ?? <span className="text-gray-400">—</span>,
    },
    {
      key: 'email',
      header: 'Email',
      render: (u) => u.email,
    },
    {
      key: 'role',
      header: 'Rol',
      render: roleBadge,
    },
    {
      key: 'actions',
      header: '',
      render: (u) => <div className="flex justify-end">{userActions(u, 14)}</div>,
    },
  ]

  const totalPages = Math.ceil(total / PAGE_LIMIT)

  return (
    <>
      <div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
          <p className="text-base text-gray-500">Gestionează utilizatorii aplicației.</p>
          <Button size="sm" className="flex items-center gap-2 self-start sm:self-auto" onClick={() => setDialog({ type: 'create' })}>
            <Plus size={15} />
            Utilizator nou
          </Button>
        </div>

        {/* Desktop table */}
        <div className="hidden md:block">
          <Table
            columns={columns}
            data={users}
            rowKey={(u) => u.id}
            loading={loading}
            onSearch={handleSearch}
            pagination={total > 0 ? { total, page, limit: PAGE_LIMIT, totalPages, onPageChange: setPage } : undefined}
          />
        </div>

        {/* Mobile cards */}
        <div className="md:hidden">
          <MobileTable
            data={users}
            rowKey={(u) => u.id}
            getSearchText={(u) => `${u.fullName ?? ''} ${u.email}`}
            pagination={total > 0 ? { total, page, limit: PAGE_LIMIT, totalPages, onPageChange: setPage } : undefined}
            renderContent={(u) => (
              <>
                {u.fullName && <p className="text-sm font-medium text-gray-900 truncate">{u.fullName}</p>}
                <p className="text-sm text-gray-500 truncate">{u.email}</p>
                <span className="mt-1 inline-block">{roleBadge(u)}</span>
              </>
            )}
            renderActions={(u) => userActions(u, 15)}
          />
        </div>
      </div>

      {dialog.type === 'create' && <CreateUserDialog onClose={close} onSubmit={createUser} />}
      {dialog.type === 'edit' && <EditUserDialog user={dialog.user} onClose={close} onSubmit={(data) => updateUser(dialog.user.id, data)} />}
      {dialog.type === 'delete' && <DeleteUserDialog user={dialog.user} onClose={close} onConfirm={() => deleteUser(dialog.user.id)} />}
      {dialog.type === 'reset' && <ResetPasswordDialog user={dialog.user} onClose={close} onConfirm={() => resetPassword(dialog.user.id)} />}
    </>
  )
}
