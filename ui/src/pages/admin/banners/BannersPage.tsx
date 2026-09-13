import { useEffect, useState } from 'react'
import { Pencil, Trash2, Plus } from 'lucide-react'
import { PAGE_LIMIT } from '@/types'
import { Table, type Column } from '@/components/ui/Table'
import { MobileTable } from '@/components/ui/MobileTable'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { CreateBannerDialog, EditBannerDialog, DeleteBannerDialog } from './BannerDialogs'
import type { AppBanner } from '@/services/banners.service'
import type { BannerStyle } from '@shared/types/banner'
import { useBannersStore } from './useBannersStore'

const BANNER_STYLE_BADGE: Record<BannerStyle, { label: string; variant: 'default' | 'purple' }> = {
  ANNOUNCEMENT: { label: 'Anunț', variant: 'default' },
  CELEBRATION: { label: 'Sărbătoare 🎉', variant: 'purple' },
}

type DialogState =
  | { type: 'none' }
  | { type: 'create' }
  | { type: 'edit'; banner: AppBanner }
  | { type: 'delete'; banner: AppBanner }

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ro-RO')
}

function isActiveNow(banner: AppBanner): boolean {
  const now = Date.now()
  return new Date(banner.startDate).getTime() <= now && now <= new Date(banner.endDate).getTime()
}

export function BannersPage() {
  const { banners, total, loading, fetchBanners, createBanner, updateBanner, deleteBanner } = useBannersStore()
  const [dialog, setDialog] = useState<DialogState>({ type: 'none' })
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchBanners(page, search || undefined)
  }, [page, search])

  const handleSearch = (query: string) => { setSearch(query); setPage(1) }

  const close = () => setDialog({ type: 'none' })

  const bannerActions = (b: AppBanner, size: number) => (
    <div className="flex items-center gap-1">
      <button onClick={() => setDialog({ type: 'edit', banner: b })} title="Editează" className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
        <Pencil size={size} />
      </button>
      <button onClick={() => setDialog({ type: 'delete', banner: b })} title="Șterge" className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors">
        <Trash2 size={size} />
      </button>
    </div>
  )

  const columns: Column<AppBanner>[] = [
    {
      key: 'message',
      header: 'Mesaj',
      className: 'max-w-[320px] truncate',
      render: (b) => b.message,
    },
    {
      key: 'period',
      header: 'Perioadă',
      className: 'whitespace-nowrap',
      render: (b) => `${formatDate(b.startDate)} – ${formatDate(b.endDate)}`,
    },
    {
      key: 'style',
      header: 'Stil',
      render: (b) => <Badge label={BANNER_STYLE_BADGE[b.style].label} variant={BANNER_STYLE_BADGE[b.style].variant} />,
    },
    {
      key: 'active',
      header: 'Stare',
      render: (b) => isActiveNow(b) ? <Badge label="Activ" variant="green" /> : <Badge label="Inactiv" variant="default" />,
    },
    {
      key: 'actions',
      header: '',
      render: (b) => <div className="flex justify-end">{bannerActions(b, 14)}</div>,
    },
  ]

  const totalPages = Math.ceil(total / PAGE_LIMIT)

  return (
    <>
      <div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
          <p className="text-base text-gray-500">Gestionează anunțurile afișate în partea de sus a paginii.</p>
          <Button size="sm" className="flex items-center gap-2 self-start sm:self-auto" onClick={() => setDialog({ type: 'create' })}>
            <Plus size={15} />
            Anunț nou
          </Button>
        </div>

        {/* Desktop table */}
        <div className="hidden md:block">
          <Table
            columns={columns}
            data={banners}
            rowKey={(b) => b.id}
            loading={loading}
            onSearch={handleSearch}
            pagination={total > 0 ? { total, page, limit: PAGE_LIMIT, totalPages, onPageChange: setPage } : undefined}
          />
        </div>

        {/* Mobile cards */}
        <div className="md:hidden">
          <MobileTable
            data={banners}
            rowKey={(b) => b.id}
            getSearchText={(b) => b.message}
            pagination={total > 0 ? { total, page, limit: PAGE_LIMIT, totalPages, onPageChange: setPage } : undefined}
            renderContent={(b) => (
              <>
                <div className="flex items-center gap-2 flex-wrap">
                  {isActiveNow(b) ? <Badge label="Activ" variant="green" /> : <Badge label="Inactiv" variant="default" />}
                  <Badge label={BANNER_STYLE_BADGE[b.style].label} variant={BANNER_STYLE_BADGE[b.style].variant} />
                  <span className="text-xs text-gray-500">{formatDate(b.startDate)} – {formatDate(b.endDate)}</span>
                </div>
                <p className="text-sm font-medium text-gray-900 mt-1.5">{b.message}</p>
              </>
            )}
            renderActions={(b) => bannerActions(b, 15)}
          />
        </div>
      </div>

      {dialog.type === 'create' && <CreateBannerDialog onClose={close} onSubmit={createBanner} />}
      {dialog.type === 'edit' && <EditBannerDialog banner={dialog.banner} onClose={close} onSubmit={(data) => updateBanner(dialog.banner.id, data)} />}
      {dialog.type === 'delete' && <DeleteBannerDialog banner={dialog.banner} onClose={close} onConfirm={() => deleteBanner(dialog.banner.id)} />}
    </>
  )
}
