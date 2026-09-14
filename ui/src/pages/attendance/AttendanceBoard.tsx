import {
  ArrowLeft,
  CheckCircle2,
  Flag,
  Play,
  RotateCcw,
  Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import type {
  AttendanceDetail,
  ChildAttendanceStatus,
} from '@/services/attendance.service'
import { AttendanceChildCard } from './AttendanceChildCard'
import { useAttendanceGrid } from './use-attendance-grid'

export function AttendanceBoard({
  detail,
  today,
  busy,
  onBack,
  onStart,
  onStatus,
  onFinish,
  onReset,
  onDelete,
}: {
  detail: AttendanceDetail
  today: boolean
  busy: string
  onBack?: () => void
  onStart: () => void
  onStatus: (childId: string, status: ChildAttendanceStatus) => void
  onFinish: () => void
  onReset: () => void
  onDelete: () => void
}) {
  const finished = detail.status === 'FINISHED'
  const grid = useAttendanceGrid(detail.children.length, Boolean(onBack))
  return (
    <section
      className={`attendance-room relative overflow-hidden bg-[#ead5b5] shadow-[0_16px_30px_rgba(91,58,27,0.2)] ${onBack ? 'is-fullscreen rounded-none border-0' : 'mt-10 min-h-[720px] rounded-[2rem] border-8 border-[#9a663c]'}`}
    >
      <div className="attendance-board-banner relative z-10 grid shrink-0 grid-cols-[1fr_auto] items-center gap-3 bg-[#f5e6cd] px-5 py-4 text-center sm:grid-cols-[1fr_auto_1fr]">
        <div className="flex justify-start">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium text-slate-600 hover:bg-white/60"
            >
              <ArrowLeft size={16} />
              Înapoi
            </button>
          )}
        </div>
        <div className="col-span-2 row-start-2 flex items-center justify-center gap-3 sm:col-span-1 sm:col-start-2 sm:row-start-1">
          <span className="text-2xl">☀</span>
          <p className="font-semibold tracking-wide text-[#31566a]">
            Împreună creștem frumos!
          </p>
          <span className="text-2xl text-rose-500">♥</span>
        </div>
        <div className="col-start-2 row-start-1 flex justify-end sm:col-start-3">
          {detail.status === 'IN_PROGRESS' && (
            <Button
              variant="secondary"
              onClick={onFinish}
              disabled={busy !== ''}
            >
              <Flag size={17} />
              Finalizează prezența
            </Button>
          )}
        </div>
      </div>
      <div className="attendance-board-info grid grid-cols-1 items-center gap-4 border-b-8 border-[#9a663c] bg-[#f1d39a] px-5 py-4 sm:px-7">
        <div className="attendance-group-sign">
          <h2>{detail.groupName}</h2>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2 empty:hidden">
          {onBack && finished && (
            <span className="font-semibold text-emerald-700">Finalizată</span>
          )}
          {!onBack && (
            <>
              {detail.status === 'PENDING' && (
                <Button
                  onClick={onStart}
                  disabled={busy !== ''}
                  className="inline-flex items-center justify-center gap-2 !bg-emerald-600 !text-white shadow-sm hover:!bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed"
                >
                  <Play size={17} />
                  Pornește
                </Button>
              )}
              {finished && (
                <span className="inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
                  <CheckCircle2 size={17} />
                  Finalizată
                </span>
              )}
              {today && (
                <>
                  <button
                    type="button"
                    disabled={busy !== ''}
                    onClick={onReset}
                    className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium text-slate-600 hover:bg-white/60"
                  >
                    <RotateCcw size={16} />
                    Resetează
                  </button>
                  <button
                    type="button"
                    disabled={busy !== ''}
                    onClick={onDelete}
                    className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium text-red-600 hover:bg-white/60"
                  >
                    <Trash2 size={16} />
                    Șterge
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>
      {!detail.children.length ? (
        <p className="attendance-board-empty bg-[#1e5947] px-5 py-16 text-center text-white/80">
          Grupa nu are copii activi.
        </p>
      ) : (
        <div
          ref={grid.ref}
          style={grid.style}
          className="attendance-board-grid relative grid gap-6 bg-[#1e5947] p-5 sm:grid-cols-2 sm:p-8 lg:grid-cols-3 xl:grid-cols-4"
          role="region"
          aria-label="Copiii grupei"
          tabIndex={0}
        >
          {detail.children.map((child, index) => (
            <AttendanceChildCard
              key={child.id}
              child={child}
              index={index}
              disabled={
                finished || detail.status !== 'IN_PROGRESS' || busy !== ''
              }
              onStatus={onStatus}
            />
          ))}
        </div>
      )}
      {detail.status === 'IN_PROGRESS' && (
        <p className="attendance-board-help border-t border-slate-100 text-sm text-slate-600">
          Atinge fotografia ta pentru a fi marcat prezent. Prezența se
          finalizează automat când toți copiii sunt prezenți. La finalizare,
          copiii nemarcați vor fi trecuți absenți.
        </p>
      )}
    </section>
  )
}
