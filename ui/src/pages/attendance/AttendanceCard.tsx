import {
  CheckCircle2,
  ClipboardCheck,
  Play,
  RotateCcw,
  Trash2,
  Users,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import type { AttendanceSummary } from '@/services/attendance.service'
import { statusLabels } from './attendance-utils'

export function AttendanceCard({
  row,
  today,
  busy,
  onCreate,
  onStart,
  onOpen,
  onReset,
  onDelete,
}: {
  row: AttendanceSummary
  today: boolean
  busy: boolean
  onCreate: () => void
  onStart: () => void
  onOpen: () => void
  onReset: () => void
  onDelete: () => void
}) {
  const status = row.status ? statusLabels[row.status] : 'Nu a fost creată'
  return (
    <article className="person-card">
      <div className="flex items-start justify-between gap-3">
        <div className="avatar butter">
          <ClipboardCheck size={26} />
        </div>
        <span className="little-tag">{status}</span>
      </div>
      <h2>{row.groupName}</h2>
      <p className="text-sm text-gray-500 flex items-center gap-2">
        <Users size={15} />
        {row.childrenCount} {row.childrenCount === 1 ? 'copil' : 'copii'}
        {row.status && <> · {row.checkedCount} completați</>}
      </p>
      <div className="card-actions">
        {!row.status && (
          <Button
            size="sm"
            className="!bg-emerald-600 !text-white hover:!bg-emerald-700"
            disabled={busy}
            onClick={onCreate}
          >
            <Play size={15} />
            Creează prezența
          </Button>
        )}
        {row.status === 'PENDING' && (
          <Button
            size="sm"
            className="!bg-emerald-600 !text-white hover:!bg-emerald-700"
            disabled={busy}
            onClick={onStart}
          >
            <Play size={15} />
            Pornește
          </Button>
        )}
        {row.status === 'IN_PROGRESS' && (
          <Button
            size="sm"
            className="!bg-emerald-600 !text-white hover:!bg-emerald-700"
            disabled={busy}
            onClick={onOpen}
          >
            <ClipboardCheck size={15} />
            Deschide tabla
          </Button>
        )}
        {row.status === 'FINISHED' && (
          <Button
            size="sm"
            variant="secondary"
            disabled={busy}
            onClick={onOpen}
          >
            <CheckCircle2 size={15} />
            Vezi rezumatul
          </Button>
        )}
        {today && row.status && (
          <>
            <button
              type="button"
              disabled={busy}
              onClick={onReset}
              title="Resetează prezența"
              aria-label={`Resetează prezența pentru ${row.groupName}`}
            >
              <RotateCcw size={16} />
              Resetează
            </button>
            <button
              type="button"
              disabled={busy}
              className="!text-red-600"
              onClick={onDelete}
              title="Șterge prezența"
              aria-label={`Șterge prezența pentru ${row.groupName}`}
            >
              <Trash2 size={16} />
            </button>
          </>
        )}
      </div>
    </article>
  )
}
