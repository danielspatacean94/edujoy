import { EditorDialog } from './EditorDialog'
import { useMutation } from '@/hooks/use-mutation'

interface Props {
  name: string
  description?: string
  onDelete: () => Promise<void>
  onClose: () => void
  onDeleted: () => void
}

export function DeleteDialog({
  name,
  description = 'Această înregistrare va fi eliminată din lista activă.',
  onDelete,
  onClose,
  onDeleted,
}: Props) {
  const { busy, error, run } = useMutation()
  return (
    <EditorDialog
      title={`Șterge ${name}`}
      busy={busy}
      error={error}
      danger
      submitLabel="Șterge"
      onClose={onClose}
      onSubmit={(event) => {
        event.preventDefault()
        void run(async () => {
          await onDelete()
          onDeleted()
        })
      }}
    >
      <p>
        Ștergi înregistrarea pentru <strong>{name}</strong>? {description}
      </p>
    </EditorDialog>
  )
}
