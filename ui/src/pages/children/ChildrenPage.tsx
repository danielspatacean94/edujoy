import { Sprout } from 'lucide-react'
import { CollectionLayout } from '@/components/directory/CollectionLayout'
import { DirectoryCard } from '@/components/directory/DirectoryCard'
import { DeleteDialog } from '@/components/directory/DeleteDialog'
import { useCollection } from '@/hooks/use-collection'
import { useOptions } from '@/hooks/use-options'
import { useAuthStore } from '@/store/auth.store'
import { childrenService } from '@/services/children.service'
import { groupsService } from '@/services/groups.service'
import { kindergartensService } from '@/services/kindergartens.service'
import { createChildrenStore } from './useChildrenStore'
import { ChildForm } from './ChildForm'
import { ChildPhoto } from './ChildPhoto'

export function ChildrenPage() {
  const admin = useAuthStore((state) => state.user?.role === 'admin')
  const list = useCollection(createChildrenStore)
  const gardens = useOptions(kindergartensService.all, admin)
  const groups = useOptions(groupsService.all)
  const { dialog, setDialog, saved } = list
  const gardenNames = new Map(
    gardens.rows.map((garden) => [garden.id, garden.name]),
  )
  const groupNames = new Map(groups.rows.map((group) => [group.id, group.name]))

  return (
    <>
      <CollectionLayout
        title="Copii"
        singular="copil"
        color="mint"
        icon={Sprout}
        caption="Imaginație fără margini. Mici exploratori. O comunitate fericită."
        search={list.search}
        page={list.page}
        total={list.total}
        loading={list.loading || gardens.loading || groups.loading}
        empty={!list.rows.length}
        error={list.error || gardens.error || groups.error}
        onSearch={list.setSearch}
        onPage={list.setPage}
        onCreate={() => setDialog({ type: 'create' })}
        onRetry={() => {
          void list.load()
          void gardens.reload()
          void groups.reload()
        }}
      >
        {list.rows.map((child, index) => (
          <DirectoryCard
            key={child.id}
            name={child.name}
            badge={`${child.age} ${child.age === 1 ? 'an' : 'ani'}`}
            index={index}
            avatar={<ChildPhoto child={child} index={index} />}
            description={
              groupNames.get(child.groupId ?? '') || 'Grupă indisponibilă'
            }
            kindergarten={
              admin
                ? gardenNames.get(child.kindergartenId) ||
                  'Grădiniță indisponibilă'
                : undefined
            }
            onEdit={() => setDialog({ type: 'edit', item: child })}
            onDelete={() => setDialog({ type: 'delete', item: child })}
          />
        ))}
      </CollectionLayout>
      {dialog?.type === 'delete' && (
        <DeleteDialog
          name={dialog.item.name}
          onDelete={() => childrenService.remove(dialog.item.id)}
          onClose={() => setDialog(null)}
          onDeleted={saved}
        />
      )}
      {dialog && dialog.type !== 'delete' && (
        <ChildForm
          child={dialog.type === 'edit' ? dialog.item : undefined}
          kindergartens={gardens.rows}
          groups={groups.rows}
          admin={admin}
          onClose={() => {
            setDialog(null)
            void list.load()
          }}
          onSaved={saved}
        />
      )}
    </>
  )
}
