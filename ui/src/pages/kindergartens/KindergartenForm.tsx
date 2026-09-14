import { useState } from 'react'
import { Input } from '@/components/ui/Input'
import { EditorDialog } from '@/components/directory/EditorDialog'
import { useMutation } from '@/hooks/use-mutation'
import {
  kindergartensService,
  type Kindergarten,
} from '@/services/kindergartens.service'

export function KindergartenForm({
  kindergarten,
  onClose,
  onSaved,
}: {
  kindergarten?: Kindergarten
  onClose: () => void
  onSaved: () => void
}) {
  const [name, setName] = useState(kindergarten?.name ?? '')
  const [location, setLocation] = useState(kindergarten?.location ?? '')
  const { busy, error, run } = useMutation()

  return (
    <EditorDialog
      title={kindergarten ? 'Editează grădinița' : 'Adaugă grădiniță'}
      busy={busy}
      error={error}
      onClose={onClose}
      onSubmit={(event) => {
        event.preventDefault()
        void run(async () => {
          const input = { name: name.trim(), location: location.trim() }
          if (kindergarten)
            await kindergartensService.update(kindergarten.id, input)
          else await kindergartensService.create(input)
          onSaved()
        })
      }}
    >
      <Input
        label="Nume"
        id="kindergarten-name"
        required
        maxLength={120}
        value={name}
        onChange={(event) => setName(event.target.value)}
        autoFocus
      />
      <Input
        label="Adresă"
        id="kindergarten-location"
        required
        maxLength={250}
        value={location}
        onChange={(event) => setLocation(event.target.value)}
        placeholder="Stradă, localitate"
      />
    </EditorDialog>
  )
}
