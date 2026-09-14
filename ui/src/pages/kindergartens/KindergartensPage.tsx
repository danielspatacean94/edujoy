import { School } from 'lucide-react'
import { CollectionLayout } from '@/components/directory/CollectionLayout'
import { DirectoryCard } from '@/components/directory/DirectoryCard'
import { DeleteDialog } from '@/components/directory/DeleteDialog'
import { useCollection } from '@/hooks/use-collection'
import { kindergartensService } from '@/services/kindergartens.service'
import { createKindergartensStore } from './useKindergartensStore'
import { KindergartenForm } from './KindergartenForm'

export function KindergartensPage() {
  const list = useCollection(createKindergartensStore)
  const { dialog, setDialog, saved } = list

  return (
    <>
      <CollectionLayout
        title="Grădinițe"
        singular="grădiniță"
        color="peach"
        icon={School}
        caption="Locuri pline de bucurie, în care cei mici cresc frumos."
        search={list.search}
        page={list.page}
        total={list.total}
        loading={list.loading}
        empty={!list.rows.length}
        error={list.error}
        onSearch={list.setSearch}
        onPage={list.setPage}
        onCreate={() => setDialog({ type: 'create' })}
        onRetry={() => void list.load()}
      >
        {list.rows.map((kindergarten, index) => (
          <DirectoryCard
            key={kindergarten.id}
            name={kindergarten.name}
            badge="Grădiniță"
            index={index}
            description={kindergarten.location}
            onEdit={() => setDialog({ type: 'edit', item: kindergarten })}
            onDelete={() => setDialog({ type: 'delete', item: kindergarten })}
          />
        ))}
      </CollectionLayout>
      {dialog?.type === 'delete' && (
        <DeleteDialog
          name={dialog.item.name}
          description="Mai întâi, mută sau șterge educatorii, grupele și copiii din această grădiniță."
          onDelete={() => kindergartensService.remove(dialog.item.id)}
          onClose={() => setDialog(null)}
          onDeleted={saved}
        />
      )}
      {dialog && dialog.type !== 'delete' && (
        <KindergartenForm
          kindergarten={dialog.type === 'edit' ? dialog.item : undefined}
          onClose={() => setDialog(null)}
          onSaved={saved}
        />
      )}
    </>
  )
}
