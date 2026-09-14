import type { ReactNode } from 'react'
import { Plus, Search, type LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { PAGE_SIZE } from '@/store/create-collection-store'

interface Props {
  title: string
  singular: string
  caption: string
  color: string
  icon: LucideIcon
  search: string
  page: number
  total: number
  loading: boolean
  empty: boolean
  error: string
  onSearch: (value: string) => void
  onPage: (page: number) => void
  onCreate: () => void
  onRetry: () => void
  children: ReactNode
}

export function CollectionLayout({
  title,
  singular,
  caption,
  color,
  icon: Icon,
  search,
  page,
  total,
  loading,
  empty,
  error,
  onSearch,
  onPage,
  onCreate,
  onRetry,
  children,
}: Props) {
  return (
    <div className="directory max-w-6xl mx-auto">
      <section className={`page-intro ${color}`}>
        <div>
          <p className="eyebrow">COMUNITATEA NOASTRĂ EDUJOY</p>
          <h1>{title}</h1>
          <p>{caption}</p>
        </div>
        <Icon
          size={72}
          strokeWidth={1.4}
          className="hidden sm:block opacity-60"
          aria-hidden="true"
        />
      </section>
      <div className="flex flex-wrap gap-4 items-center justify-between my-7">
        <div className="relative">
          <Search
            className="absolute left-3 top-3 text-gray-400"
            size={18}
            aria-hidden="true"
          />
          <input
            aria-label={`Caută în lista de ${title.toLowerCase()}`}
            className="search-field"
            placeholder="Caută după nume..."
            value={search}
            onChange={(event) => onSearch(event.target.value)}
          />
        </div>
        <Button onClick={onCreate} className="flex items-center gap-2">
          <Plus size={18} />
          Adaugă {singular}
        </Button>
      </div>
      {error && (
        <p role="alert" className="error-box mb-4">
          {error}{' '}
          <button type="button" className="underline" onClick={onRetry}>
            Încearcă din nou
          </button>
        </p>
      )}
      {loading ? (
        <div role="status" className="empty-state">
          Se încarcă lista...
        </div>
      ) : empty ? (
        <div className="empty-state">
          <Icon
            size={44}
            className="mx-auto mb-4 text-brand-500"
            aria-hidden="true"
          />
          <h2>
            {search ? 'Nu am găsit rezultate' : 'Un loc pentru noi începuturi'}
          </h2>
          <p>
            {search
              ? 'Încearcă un alt nume.'
              : 'Folosește butonul „Adaugă” pentru a începe.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {children}
        </div>
      )}
      <div className="flex items-center justify-between mt-7 gap-3 text-sm text-gray-500">
        <span>
          {total.toLocaleString('ro-RO')} {title.toLowerCase()}
        </span>
        <div className="flex gap-3 items-center">
          <Button
            variant="secondary"
            disabled={page <= 1 || loading}
            onClick={() => onPage(page - 1)}
          >
            Înapoi
          </Button>
          <span>
            {page} / {Math.max(1, Math.ceil(total / PAGE_SIZE))}
          </span>
          <Button
            variant="secondary"
            disabled={page * PAGE_SIZE >= total || loading}
            onClick={() => onPage(page + 1)}
          >
            Înainte
          </Button>
        </div>
      </div>
    </div>
  )
}
