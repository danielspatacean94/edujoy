import type { ReactNode } from 'react'
import { Pencil, School, Trash2 } from 'lucide-react'

interface Props {
  name: string
  badge: string
  index: number
  description: ReactNode
  kindergarten?: string
  avatar?: ReactNode
  actions?: ReactNode
  onEdit: () => void
  onDelete: () => void
}

export function DirectoryCard({
  name,
  badge,
  index,
  description,
  kindergarten,
  avatar,
  actions,
  onEdit,
  onDelete,
}: Props) {
  const initials = name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
  return (
    <article className="person-card">
      <div className="flex justify-between items-start">
        {avatar ?? (
          <div
            className={`avatar ${['peach', 'lavender', 'mint', 'butter'][index % 4]}`}
          >
            {initials}
          </div>
        )}
        <span className="little-tag">{badge}</span>
      </div>
      <h2>{name}</h2>
      <p className="text-sm text-gray-500 break-words">{description}</p>
      {kindergarten && (
        <p className="flex items-center gap-2 text-sm text-brand-700 mt-4">
          <School size={16} className="shrink-0" />
          {kindergarten}
        </p>
      )}
      <div className="card-actions">
        <button type="button" onClick={onEdit}>
          <Pencil size={15} />
          Editează
        </button>
        {actions}
        <button
          type="button"
          className="!text-red-600 ml-auto"
          onClick={onDelete}
          aria-label={`Șterge ${name}`}
        >
          <Trash2 size={16} />
        </button>
      </div>
    </article>
  )
}
