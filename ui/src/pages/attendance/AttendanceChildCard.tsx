import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { CheckCircle2, UserRound } from 'lucide-react'
import type {
  AttendanceDetail,
  ChildAttendanceStatus,
} from '@/services/attendance.service'
import { AttendanceChildPhoto } from './AttendanceChildPhoto'

function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function avatarTone(id: string) {
  return [
    'bg-rose-100 text-rose-700',
    'bg-sky-100 text-sky-700',
    'bg-amber-100 text-amber-700',
    'bg-emerald-100 text-emerald-700',
    'bg-violet-100 text-violet-700',
  ][id.charCodeAt(0) % 5]
}
export function AttendanceChildCard({
  child,
  index,
  disabled,
  onStatus,
}: {
  child: AttendanceDetail['children'][number]
  index: number
  disabled: boolean
  onStatus: (childId: string, status: ChildAttendanceStatus) => void
}) {
  const previousStatus = useRef(child.status)
  const [celebrating, setCelebrating] = useState(false)
  useEffect(() => {
    const justMarked =
      previousStatus.current !== 'PRESENT' && child.status === 'PRESENT'
    previousStatus.current = child.status
    if (!justMarked) {
      setCelebrating(false)
      return
    }
    setCelebrating(true)
    const timeout = window.setTimeout(() => setCelebrating(false), 1500)
    return () => window.clearTimeout(timeout)
  }, [child.status])

  return (
    <article
      style={
        {
          '--card-angle': `${[-7, 4, -3, 7, -5, 2, 6, -4, 3, -6, 5][index % 11]}deg`,
          '--card-x': `${[2, -3, 1, -2, 3, -1, 0][index % 7]}%`,
          '--card-y': `${[-3, 2, -1, 3, 0, -2, 1, 2, -3][index % 9]}%`,
        } as CSSProperties
      }
      className={`attendance-child-card ${celebrating ? 'is-celebrating' : ''} group relative rounded-xl border-4 p-3 text-left shadow-[0_5px_10px_rgba(17,49,39,0.3)] transition-all ${child.status === 'PRESENT' ? 'border-emerald-300 bg-emerald-50 text-emerald-950' : child.status === 'ABSENT' ? 'border-rose-300 bg-rose-50 text-rose-950' : 'border-white bg-white'} ${disabled ? '' : 'hover:shadow-[0_10px_18px_rgba(17,49,39,0.4)]'}`}
    >
      <span
        className={`absolute left-1/2 top-[-11px] z-10 h-5 w-5 -translate-x-1/2 rounded-full border-2 border-white shadow ${child.status ? (child.status === 'PRESENT' ? 'bg-emerald-500' : 'bg-rose-500') : 'bg-amber-400'}`}
        aria-hidden="true"
      />
      <button
        type="button"
        disabled={disabled || child.status === 'PRESENT'}
        onClick={() => onStatus(child.id, 'PRESENT')}
        aria-label={`${child.name}: ${child.status === 'PRESENT' ? 'prezent' : child.status === 'ABSENT' ? 'absent' : 'marchează prezent'}`}
        className="relative block aspect-[4/3] w-full overflow-hidden rounded-lg bg-slate-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-400 disabled:cursor-default"
      >
        <div
          className={`absolute inset-0 flex flex-col items-center justify-center gap-2 ${avatarTone(child.id)}`}
        >
          <UserRound size={42} strokeWidth={1.5} />
          <span className="text-2xl font-bold tracking-wide">
            {initials(child.name)}
          </span>
        </div>
        <AttendanceChildPhoto child={child} />
        {celebrating && (
          <span className="attendance-present-effect" aria-hidden="true">
            <span className="attendance-present-check">
              <CheckCircle2 size={42} strokeWidth={3} />
            </span>
            {[0, 1, 2, 3, 4, 5].map((spark) => (
              <span
                key={spark}
                className="attendance-spark"
                style={{ '--spark-angle': `${spark * 60}deg` } as CSSProperties}
              >
                ✦
              </span>
            ))}
          </span>
        )}
      </button>
      <span className="attendance-child-name" title={child.name}>
        {child.name}
      </span>
      {celebrating && (
        <span className="attendance-fireworks" aria-hidden="true">
          {[0, 1, 2].map((burst) => (
            <span
              key={burst}
              className={`attendance-firework attendance-firework-${burst}`}
            >
              {Array.from({ length: 12 }, (_, particle) => (
                <span
                  key={particle}
                  className="attendance-firework-particle"
                  style={
                    {
                      '--firework-angle': `${particle * 30}deg`,
                      '--firework-distance': `${34 + (particle % 3) * 12}px`,
                      '--firework-color': [
                        '#fbbf24',
                        '#fb7185',
                        '#38bdf8',
                        '#a78bfa',
                        '#34d399',
                        '#fb923c',
                      ][particle % 6],
                      '--firework-delay': `${burst * 180}ms`,
                    } as CSSProperties
                  }
                />
              ))}
            </span>
          ))}
        </span>
      )}
    </article>
  )
}
