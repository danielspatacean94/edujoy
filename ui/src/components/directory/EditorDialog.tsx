import type { FormEvent, ReactNode } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'

interface Props {
  title: string
  busy: boolean
  error: string
  onClose: () => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  children: ReactNode
  submitLabel?: string
  danger?: boolean
}

export function EditorDialog({
  title,
  busy,
  error,
  onClose,
  onSubmit,
  children,
  submitLabel = 'Salvează',
  danger = false,
}: Props) {
  return (
    <Modal
      title={title}
      onClose={() => {
        if (!busy) onClose()
      }}
    >
      <form onSubmit={onSubmit} className="space-y-4">
        {error && (
          <p className="error-box" role="alert">
            {error}
          </p>
        )}
        <fieldset disabled={busy} className="space-y-4">
          {children}
        </fieldset>
        <div className="flex justify-end gap-3 pt-3">
          <Button
            type="button"
            variant="secondary"
            disabled={busy}
            onClick={onClose}
          >
            Anulează
          </Button>
          <Button
            type="submit"
            variant={danger ? 'danger' : 'primary'}
            disabled={busy}
          >
            {busy ? 'Se salvează...' : submitLabel}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
