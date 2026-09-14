import { useState } from 'react'
import { CHILD_GENRE_LABELS, type ChildGenre } from '@shared/types/child'
import { Input } from '@/components/ui/Input'
import { EditorDialog } from '@/components/directory/EditorDialog'
import { KindergartenSelect } from '@/components/directory/KindergartenSelect'
import { useMutation } from '@/hooks/use-mutation'
import { childrenService, type Child } from '@/services/children.service'
import type { Kindergarten } from '@/services/kindergartens.service'
import type { Group } from '@/services/groups.service'
import { ChildPhotoInput } from './ChildPhotoInput'

interface Props {
  child?: Child
  kindergartens: Kindergarten[]
  groups: Group[]
  admin: boolean
  onClose: () => void
  onSaved: () => void
}

export function ChildForm({
  child,
  kindergartens,
  groups,
  admin,
  onClose,
  onSaved,
}: Props) {
  const [name, setName] = useState(child?.name ?? '')
  const [age, setAge] = useState(child?.age.toString() ?? '')
  const [genre, setGenre] = useState<ChildGenre | ''>(child?.genre ?? '')
  const [kindergartenId, setKindergartenId] = useState(
    child?.kindergartenId ?? '',
  )
  const [groupId, setGroupId] = useState(child?.groupId ?? '')
  const [photo, setPhoto] = useState<File | null>(null)
  // Keep the created ID if photo upload fails so retrying cannot create a duplicate child.
  const [savedId, setSavedId] = useState(child?.id)
  const { busy, error, run } = useMutation()
  const availableGroups = groups.filter(
    (group) => !admin || group.kindergartenId === kindergartenId,
  )

  return (
    <EditorDialog
      title={child ? 'Editează copilul' : 'Adaugă copil'}
      busy={busy}
      error={error}
      onClose={onClose}
      onSubmit={(event) => {
        event.preventDefault()
        void run(async () => {
          if (!genre) throw new Error('Alege Fetiță sau Băiețel.')
          const input = {
            name: name.trim(),
            age: Number(age),
            genre,
            groupId,
            ...(admin ? { kindergartenId } : {}),
          }
          const saved = savedId
            ? await childrenService.update(savedId, input)
            : await childrenService.create(input)
          setSavedId(saved.id)
          if (photo) await childrenService.uploadPhoto(saved.id, photo)
          onSaved()
        })
      }}
    >
      <Input
        label="Nume"
        id="child-name"
        required
        maxLength={120}
        value={name}
        onChange={(event) => setName(event.target.value)}
        autoFocus
      />
      <div>
        <label htmlFor="child-genre" className="block text-sm font-medium mb-1">
          Gen
        </label>
        <select
          id="child-genre"
          required
          className="w-full border border-slate-300 rounded-xl px-3 py-2"
          value={genre}
          onChange={(event) => {
            const value = event.target.value
            setGenre(value === 'male' || value === 'female' ? value : '')
          }}
        >
          <option value="">Alege genul</option>
          <option value="female">{CHILD_GENRE_LABELS.female}</option>
          <option value="male">{CHILD_GENRE_LABELS.male}</option>
        </select>
      </div>
      <Input
        label="Vârsta (ani)"
        id="child-age"
        type="number"
        required
        min={0}
        max={18}
        step={1}
        value={age}
        onChange={(event) => setAge(event.target.value)}
      />
      <ChildPhotoInput
        childId={child?.id}
        photoKey={child?.photoKey ?? null}
        file={photo}
        onChange={setPhoto}
      />
      {admin ? (
        <KindergartenSelect
          rows={kindergartens}
          value={kindergartenId}
          onChange={(id) => {
            setKindergartenId(id)
            setGroupId('')
          }}
        />
      ) : (
        <p className="text-sm text-gray-500">
          Copilul va fi adăugat în grădinița care îți este atribuită.
        </p>
      )}
      <div>
        <label htmlFor="child-group" className="block text-sm font-medium mb-1">
          Grupă
        </label>
        <select
          id="child-group"
          required
          className="w-full border border-slate-300 rounded-xl px-3 py-2"
          value={groupId}
          onChange={(event) => setGroupId(event.target.value)}
        >
          <option value="">Alege o grupă</option>
          {availableGroups.map((group) => (
            <option key={group.id} value={group.id}>
              {group.name}
            </option>
          ))}
        </select>
        {!availableGroups.length && (
          <p className="text-sm text-amber-700 mt-2">
            Creează mai întâi o grupă pentru grădinița selectată.
          </p>
        )}
      </div>
    </EditorDialog>
  )
}
