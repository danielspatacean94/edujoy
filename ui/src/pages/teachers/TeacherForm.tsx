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
  const [passwordCopied, setPasswordCopied] = useState(false)
  const { busy, error, run } = useMutation()

  const generateStrongPassword = async () => {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';

  const passwordLength = 16;

  const generatedPassword = Array.from(
    { length: passwordLength },
    () => chars[Math.floor(Math.random() * chars.length)],
  ).join('');

  setPassword(generatedPassword);

  await navigator.clipboard.writeText(generatedPassword);

   setPasswordCopied(true);

  setTimeout(() => {
    setPasswordCopied(false);
  }, 3000);
};

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

    <div className="flex items-center gap-2">
      <div className="flex-1">
        <PasswordInput
          required
          minLength={8}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="new-password"
        />
      </div>

      <button
        type="button"
        onClick={generateStrongPassword}
        className="rounded-md border px-3 py-2 text-sm hover:bg-gray-50"
      >
        Generează
      </button>
    </div>
          {passwordCopied && (
  <p className="mt-1 text-xs text-green-600">
    ✓ Parola copiată în clipboard
  </p>
)}
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
