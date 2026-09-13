import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { PasswordInput } from '@/components/ui/PasswordInput'
import type { AppUser, CreateUserDto, UpdateUserDto } from '@/services/users.service'

function FormError({ message }: { message: string }) {
  return (
    <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">{message}</p>
  )
}

function DialogActions({ onClose, submitting, label }: {
  onClose: () => void
  submitting: boolean
  label: string
}) {
  return (
    <div className="flex justify-end gap-2 pt-1">
      <Button type="button" variant="secondary" size="sm" onClick={onClose}>
        Anulează
      </Button>
      <Button type="submit" size="sm" disabled={submitting}>
        {submitting ? `${label}…` : label}
      </Button>
    </div>
  )
}

export function CreateUserDialog({ onClose, onSubmit }: {
  onClose: () => void
  onSubmit: (data: CreateUserDto) => Promise<void>
}) {
  const [form, setForm] = useState<CreateUserDto>({ email: '', fullName: '', password: '', role: 'teacher' })
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const set = <K extends keyof CreateUserDto>(key: K, value: CreateUserDto[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSaving(true)
    try {
      await onSubmit(form)
      onClose()
    } catch {
      setError('Utilizatorul nu a putut fi creat. Încearcă din nou.')
      setSaving(false)
    }
  }

  return (
    <Modal title="Utilizator nou" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <FormError message={error} />}

        <Input
          label="Nume complet"
          type="text"
          required
          value={form.fullName}
          onChange={(e) => set('fullName', e.target.value)}
          placeholder="Jane Doe"
        />

        <Input
          label="Email"
          type="email"
          required
          value={form.email}
          onChange={(e) => set('email', e.target.value)}
          placeholder="user@example.com"
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Parolă</label>
          <PasswordInput
            required
            value={form.password}
            onChange={(e) => set('password', e.target.value)}
            placeholder="••••••••"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
          <select
            value={form.role}
            onChange={(e) => set('role', e.target.value as 'admin' | 'teacher')}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="teacher">Educator</option>
            <option value="admin">Administrare</option>
          </select>
        </div>

        <DialogActions onClose={onClose} submitting={saving} label="Creează" />
      </form>
    </Modal>
  )
}

export function EditUserDialog({ user, onClose, onSubmit }: {
  user: AppUser
  onClose: () => void
  onSubmit: (data: UpdateUserDto) => Promise<void>
}) {
  const [form, setForm] = useState<UpdateUserDto>({ fullName: user.fullName ?? '', role: user.role })
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const set = <K extends keyof UpdateUserDto>(key: K, value: UpdateUserDto[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSaving(true)
    try {
      await onSubmit(form)
      onClose()
    } catch {
      setError('Utilizatorul nu a putut fi actualizat. Încearcă din nou.')
      setSaving(false)
    }
  }

  return (
    <Modal title="Editează utilizatorul" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <FormError message={error} />}

        <Input
          label="Nume complet"
          type="text"
          required
          value={form.fullName}
          onChange={(e) => set('fullName', e.target.value)}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
          <select
            value={form.role}
            onChange={(e) => set('role', e.target.value as 'admin' | 'teacher')}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="teacher">Educator</option>
            <option value="admin">Administrare</option>
          </select>
        </div>

        <DialogActions onClose={onClose} submitting={saving} label="Salvează" />
      </form>
    </Modal>
  )
}

export function DeleteUserDialog({ user, onClose, onConfirm }: {
  user: AppUser
  onClose: () => void
  onConfirm: () => Promise<void>
}) {
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleConfirm = async () => {
    setError(null)
    setDeleting(true)
    try {
      await onConfirm()
      onClose()
    } catch {
      setError('Utilizatorul nu a putut fi șters. Încearcă din nou.')
      setDeleting(false)
    }
  }

  return (
    <Modal title="Șterge utilizatorul" onClose={onClose}>
      <div className="space-y-4">
        {error && <FormError message={error} />}
        <p className="text-sm text-gray-600">
          Sigur vrei să ștergi{' '}
          <span className="font-medium text-gray-900">{user.email}</span>?
          Această acțiune nu poate fi anulată.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={onClose}>Anulează</Button>
          <Button variant="danger" size="sm" onClick={handleConfirm} disabled={deleting}>
            {deleting ? 'Se șterge…' : 'Șterge'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export function ResetPasswordDialog({ user, onClose, onConfirm }: {
  user: AppUser
  onClose: () => void
  onConfirm: () => Promise<string>
}) {
  const [loading, setLoading] = useState(false)
  const [newPassword, setNewPassword] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const handleReset = async () => {
    setError(null)
    setLoading(true)
    try {
      const password = await onConfirm()
      setNewPassword(password)
    } catch {
      setError('Parola nu a putut fi resetată. Încearcă din nou.')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    if (!newPassword) return
    navigator.clipboard.writeText(newPassword)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Modal title="Resetează parola" onClose={onClose}>
      <div className="space-y-4">
        {error && <FormError message={error} />}

        {!newPassword ? (
          <>
            <p className="text-sm text-gray-600">
              Resetezi parola pentru{' '}
              <span className="font-medium text-gray-900">{user.email}</span>?
              O parolă nouă va fi generată automat.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" size="sm" onClick={onClose}>Anulează</Button>
              <Button size="sm" onClick={handleReset} disabled={loading}>
                {loading ? 'Se resetează…' : 'Resetează parola'}
              </Button>
            </div>
          </>
        ) : (
          <>
            <p className="text-sm text-gray-600">Parola a fost resetată. Transmite-o utilizatorului:</p>
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
              <code className="flex-1 text-sm font-mono text-gray-900 select-all">{newPassword}</code>
              <button onClick={handleCopy} className="text-xs font-medium text-brand-700 hover:text-brand-800 shrink-0">
                {copied ? 'Copiat!' : 'Copiază'}
              </button>
            </div>
            <div className="flex justify-end">
              <Button size="sm" onClick={onClose}>Gata</Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}
