import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { useMutation } from '@/hooks/use-mutation'
import { teachersService, type Teacher } from '@/services/teachers.service'

export function TeacherPasswordDialog({
  teacher,
  onClose,
}: {
  teacher: Teacher
  onClose: () => void
}) {
  const [password, setPassword] = useState('')
  const { busy, error, run } = useMutation()
  return (
    <Modal
      title="Resetează parola educatorului"
      onClose={() => {
        if (!busy) onClose()
      }}
    >
      {error && (
        <p className="error-box mb-4" role="alert">
          {error}
        </p>
      )}
      <p>
        Generează o parolă temporară pentru{' '}
        <strong>{teacher.fullName || teacher.email}</strong>. La următoarea
        autentificare va alege o parolă nouă.
      </p>
      {password && (
        <div className="mt-4">
          <p className="text-sm mb-2">
            Transmite această parolă educatorului printr-un canal sigur:
          </p>
          <code className="block rounded-xl bg-amber-50 p-4 select-all break-all">
            {password}
          </code>
        </div>
      )}
      <div className="flex justify-end gap-3 pt-4">
        <Button variant="secondary" disabled={busy} onClick={onClose}>
          {password ? 'Gata' : 'Anulează'}
        </Button>
        {!password && (
          <Button
            disabled={busy}
            onClick={() =>
              void run(async () => {
                const result = await teachersService.resetPassword(teacher.id)
                setPassword(result.password)
              })
            }
          >
            {busy ? 'Se generează...' : 'Generează parola'}
          </Button>
        )}
      </div>
    </Modal>
  )
}
