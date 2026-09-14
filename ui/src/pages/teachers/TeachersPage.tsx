import { useState } from 'react'
import { GraduationCap, KeyRound } from 'lucide-react'
import { CollectionLayout } from '@/components/directory/CollectionLayout'
import { DirectoryCard } from '@/components/directory/DirectoryCard'
import { DeleteDialog } from '@/components/directory/DeleteDialog'
import { useCollection } from '@/hooks/use-collection'
import { useOptions } from '@/hooks/use-options'
import { teachersService, type Teacher } from '@/services/teachers.service'
import { kindergartensService } from '@/services/kindergartens.service'
import { createTeachersStore } from './useTeachersStore'
import { TeacherForm } from './TeacherForm'
import { TeacherPasswordDialog } from './TeacherPasswordDialog'

export function TeachersPage() {
  const list = useCollection(createTeachersStore)
  const gardens = useOptions(kindergartensService.all)
  const [passwordTeacher, setPasswordTeacher] = useState<Teacher | null>(null)
  const { dialog, setDialog, saved } = list
  const gardenNames = new Map(
    gardens.rows.map((garden) => [garden.id, garden.name]),
  )

  return (
    <>
      <CollectionLayout
        title="Educatori"
        singular="educator"
        color="lavender"
        icon={GraduationCap}
        caption="Oamenii care aduc grijă și bucurie în fiecare zi."
        search={list.search}
        page={list.page}
        total={list.total}
        loading={list.loading || gardens.loading}
        empty={!list.rows.length}
        error={list.error || gardens.error}
        onSearch={list.setSearch}
        onPage={list.setPage}
        onCreate={() => setDialog({ type: 'create' })}
        onRetry={() => {
          void list.load()
          void gardens.reload()
        }}
      >
        {list.rows.map((teacher, index) => (
          <DirectoryCard
            key={teacher.id}
            name={teacher.fullName || teacher.email}
            badge="Educator"
            index={index}
            description={teacher.email}
            kindergarten={
              gardenNames.get(teacher.kindergartenId ?? '') ||
              'Grădiniță indisponibilă'
            }
            onEdit={() => setDialog({ type: 'edit', item: teacher })}
            onDelete={() => setDialog({ type: 'delete', item: teacher })}
            actions={
              <button
                type="button"
                onClick={() => setPasswordTeacher(teacher)}
                aria-label={`Resetează parola pentru ${teacher.fullName || teacher.email}`}
              >
                <KeyRound size={15} />
                Parolă
              </button>
            }
          />
        ))}
      </CollectionLayout>
      {dialog?.type === 'delete' && (
        <DeleteDialog
          name={dialog.item.fullName || dialog.item.email}
          onDelete={() => teachersService.remove(dialog.item.id)}
          onClose={() => setDialog(null)}
          onDeleted={saved}
        />
      )}
      {dialog && dialog.type !== 'delete' && (
        <TeacherForm
          teacher={dialog.type === 'edit' ? dialog.item : undefined}
          kindergartens={gardens.rows}
          onClose={() => setDialog(null)}
          onSaved={saved}
        />
      )}
      {passwordTeacher && (
        <TeacherPasswordDialog
          teacher={passwordTeacher}
          onClose={() => setPasswordTeacher(null)}
        />
      )}
    </>
  )
}
