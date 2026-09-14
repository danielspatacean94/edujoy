import { Sprout } from 'lucide-react'
import { CollectionLayout } from '@/components/directory/CollectionLayout'
import { DirectoryCard } from '@/components/directory/DirectoryCard'
import { DeleteDialog } from '@/components/directory/DeleteDialog'
import { useCollection } from '@/hooks/use-collection'
import { useOptions } from '@/hooks/use-options'
import { useAuthStore } from '@/store/auth.store'
import { groupsService } from '@/services/groups.service'
import { kindergartensService } from '@/services/kindergartens.service'
import { createGroupsStore } from './useGroupsStore'
import { GroupForm } from './GroupForm'

export function GroupsPage() {
  const admin = useAuthStore((state) => state.user?.role === 'admin')
  const list = useCollection(createGroupsStore)
  const gardens = useOptions(kindergartensService.all, admin)
  const { dialog, setDialog, saved } = list
  const gardenNames = new Map(
    gardens.rows.map((garden) => [garden.id, garden.name]),
  )

  return (
    <>
      <CollectionLayout
        title="Grupe"
        singular="grupă"
        color="butter"
        icon={Sprout}
        caption="Spații în care copiii descoperă, învață și se joacă împreună."
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
        {list.rows.map((group, index) => (
          <DirectoryCard
            key={group.id}
            name={group.name}
            badge="Grupă"
            index={index}
            description={`${group.childrenCount} ${group.childrenCount === 1 ? 'copil' : 'copii'}`}
            kindergarten={
              admin
                ? gardenNames.get(group.kindergartenId) ||
                  'Grădiniță indisponibilă'
                : undefined
            }
            onEdit={() => setDialog({ type: 'edit', item: group })}
            onDelete={() => setDialog({ type: 'delete', item: group })}
          />
        ))}
      </CollectionLayout>
      {dialog?.type === 'delete' && (
        <DeleteDialog
          name={dialog.item.name}
          onDelete={() => groupsService.remove(dialog.item.id)}
          onClose={() => setDialog(null)}
          onDeleted={saved}
        />
      )}
      {dialog && dialog.type !== 'delete' && (
        <GroupForm
          group={dialog.type === 'edit' ? dialog.item : undefined}
          kindergartens={gardens.rows}
          admin={admin}
          onClose={() => setDialog(null)}
          onSaved={saved}
        />
      )}
    </>
  )
}
