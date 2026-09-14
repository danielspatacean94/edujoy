import { useState } from 'react'
import { Input } from '@/components/ui/Input'
import { EditorDialog } from '@/components/directory/EditorDialog'
import { KindergartenSelect } from '@/components/directory/KindergartenSelect'
import { useMutation } from '@/hooks/use-mutation'
import { groupsService, type Group } from '@/services/groups.service'
import type { Kindergarten } from '@/services/kindergartens.service'

interface Props {
  group?: Group
  kindergartens: Kindergarten[]
  admin: boolean
  onClose: () => void
  onSaved: () => void
}

export function GroupForm({
  group,
  kindergartens,
  admin,
  onClose,
  onSaved,
}: Props) {
  const [name, setName] = useState(group?.name ?? '')
  const [kindergartenId, setKindergartenId] = useState(
    group?.kindergartenId ?? '',
  )
  const { busy, error, run } = useMutation()

  return (
    <EditorDialog
      title={group ? 'Editează grupa' : 'Adaugă grupă'}
      busy={busy}
      error={error}
      onClose={onClose}
      onSubmit={(event) => {
        event.preventDefault()
        void run(async () => {
          const input = {
            name: name.trim(),
            ...(admin ? { kindergartenId } : {}),
          }
          if (group) await groupsService.update(group.id, input)
          else await groupsService.create(input)
          onSaved()
        })
      }}
    >
      <Input
        label="Nume"
        id="group-name"
        required
        maxLength={120}
        value={name}
        onChange={(event) => setName(event.target.value)}
        autoFocus
      />
      {admin ? (
        <KindergartenSelect
          rows={kindergartens}
          value={kindergartenId}
          onChange={setKindergartenId}
        />
      ) : (
        <p className="text-sm text-gray-500">
          Grupa va fi adăugată în grădinița care îți este atribuită.
        </p>
      )}
    </EditorDialog>
  )
}
