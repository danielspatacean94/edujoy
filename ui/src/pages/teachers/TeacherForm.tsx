import { useState } from 'react'
import { Input } from '@/components/ui/Input'
import { PasswordInput } from '@/components/ui/PasswordInput'
import { EditorDialog } from '@/components/directory/EditorDialog'
import { KindergartenSelect } from '@/components/directory/KindergartenSelect'
import { useMutation } from '@/hooks/use-mutation'
import { teachersService, type Teacher } from '@/services/teachers.service'
import type { Kindergarten } from '@/services/kindergartens.service'

interface Props {
  teacher?: Teacher
  kindergartens: Kindergarten[]
  onClose: () => void
  onSaved: () => void
}

export function TeacherForm({
  teacher,
  kindergartens,
  onClose,
  onSaved,
}: Props) {
  const [fullName, setFullName] = useState(teacher?.fullName ?? '')
  const [kindergartenId, setKindergartenId] = useState(
    teacher?.kindergartenId ?? '',
  )
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { busy, error, run } = useMutation()

  return (
    <EditorDialog
      title={teacher ? 'Editează educatorul' : 'Adaugă educator'}
      busy={busy}
      error={error}
      onClose={onClose}
      onSubmit={(event) => {
        event.preventDefault()
        void run(async () => {
          const input = { fullName: fullName.trim(), kindergartenId }
          if (teacher) await teachersService.update(teacher.id, input)
          else
            await teachersService.create({
              ...input,
              email: email.trim(),
              password,
            })
          onSaved()
        })
      }}
    >
      <Input
        label="Nume"
        id="teacher-name"
        required
        maxLength={120}
        value={fullName}
        onChange={(event) => setFullName(event.target.value)}
        autoFocus
      />
      {!teacher && (
        <>
          <Input
            label="Adresă de e-mail"
            id="teacher-email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <label className="block text-sm font-medium">
            Parolă temporară
            <PasswordInput
              required
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
            />
          </label>
          <p className="text-xs text-gray-500">
            Cel puțin 8 caractere. Educatorul va alege o parolă nouă la prima
            autentificare.
          </p>
        </>
      )}
      <KindergartenSelect
        rows={kindergartens}
        value={kindergartenId}
        onChange={setKindergartenId}
      />
    </EditorDialog>
  )
}
