import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { CalendarDays, ClipboardCheck, Users } from 'lucide-react'
import {
  attendanceService,
  errorMessage,
  type AttendanceDetail,
  type AttendanceSummary,
  type ChildAttendanceStatus,
} from '@/services/attendance.service'
import { AttendanceCard } from './AttendanceCard'
import { AttendanceBoard } from './AttendanceBoard'
import { today, updateSummary } from './attendance-utils'
import { announceAttendance, playCompletionSound } from './attendance-audio'

function requestAttendanceFullscreen() {
  const request = document.documentElement.requestFullscreen
  if (request && !document.fullscreenElement)
    void request.call(document.documentElement).catch(() => null)
}

export function AttendancePage() {
  const { id: attendanceId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [date, setDate] = useState(today)
  const [rows, setRows] = useState<AttendanceSummary[]>([])
  const [selected, setSelected] = useState<AttendanceDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    try {
      const result = await attendanceService.list(date)
      setRows(result.data)
      setSelected((current) => (current?.date === date ? current : null))
    } catch (cause) {
      setError(errorMessage(cause))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!attendanceId) {
      void load()
      return
    }
    setLoading(true)
    setError('')
    attendanceService
      .get(attendanceId)
      .then((detail) => {
        setSelected(detail)
        setDate(detail.date)
      })
      .catch((cause) => setError(errorMessage(cause)))
      .finally(() => setLoading(false))
  }, [attendanceId, date])

  async function create(row: AttendanceSummary) {
    setBusy(row.groupId)
    setError('')
    try {
      const detail = await attendanceService.create(row.groupId, date)
      setSelected(detail)
      setRows((current) => updateSummary(current, detail))
    } catch (cause) {
      setError(errorMessage(cause))
    } finally {
      setBusy('')
    }
  }

  async function open(row: AttendanceSummary) {
    if (!row.id) return
    requestAttendanceFullscreen()
    setBusy(row.groupId)
    setError('')
    try {
      const detail = await attendanceService.get(row.id)
      setSelected(detail)
      navigate(`/attendance/${detail.id}`)
    } catch (cause) {
      setError(errorMessage(cause))
    } finally {
      setBusy('')
    }
  }

  async function start() {
    if (!selected?.id) return
    requestAttendanceFullscreen()
    setBusy(selected.groupId)
    setError('')
    try {
      const detail = await attendanceService.start(selected.id)
      setSelected(detail)
      setRows((current) => updateSummary(current, detail))
      navigate(`/attendance/${detail.id}`)
    } catch (cause) {
      setError(errorMessage(cause))
    } finally {
      setBusy('')
    }
  }

  async function startRow(row: AttendanceSummary) {
    if (!row.id) return
    requestAttendanceFullscreen()
    setBusy(row.groupId)
    setError('')
    try {
      const detail = await attendanceService.start(row.id)
      setSelected(detail)
      setRows((current) => updateSummary(current, detail))
      navigate(`/attendance/${detail.id}`)
    } catch (cause) {
      setError(errorMessage(cause))
    } finally {
      setBusy('')
    }
  }

  async function setChildStatus(
    childId: string,
    status: ChildAttendanceStatus,
  ) {
    if (!selected?.id || selected.status !== 'IN_PROGRESS' || busy) return
    const child = selected
      ? selected.children.find((item) => item.id === childId)
      : undefined
    setBusy(childId)
    setError('')
    try {
      const detail = await attendanceService.setChildStatus(
        selected.id,
        childId,
        status,
      )
      announceAttendance(child?.name ?? 'Copilul', status, child?.genre)
      setSelected(detail)
      setRows((current) => updateSummary(current, detail))
      if (detail.status === 'FINISHED') playCompletionSound(2000)
    } catch (cause) {
      setError(errorMessage(cause))
    } finally {
      setBusy('')
    }
  }

  async function finish() {
    if (!selected?.id) return
    setBusy(selected.groupId)
    setError('')
    try {
      const detail = await attendanceService.finish(selected.id)
      setSelected(detail)
      setRows((current) => updateSummary(current, detail))
      if (detail.status === 'FINISHED') playCompletionSound()
    } catch (cause) {
      setError(errorMessage(cause))
    } finally {
      setBusy('')
    }
  }

  async function reset(row: Pick<AttendanceSummary, 'id' | 'groupId'>) {
    if (!row.id) return
    setBusy(row.groupId)
    setError('')
    try {
      const detail = await attendanceService.reset(row.id)
      setSelected(detail)
      setRows((current) => updateSummary(current, detail))
    } catch (cause) {
      setError(errorMessage(cause))
    } finally {
      setBusy('')
    }
  }

  async function remove(
    row: Pick<AttendanceSummary, 'id' | 'groupId' | 'groupName'>,
  ) {
    if (
      !row.id ||
      !window.confirm(`Ștergi prezența pentru grupa ${row.groupName}?`)
    )
      return
    setBusy(row.groupId)
    setError('')
    try {
      await attendanceService.remove(row.id)
      if (selected?.groupId === row.groupId) setSelected(null)
      if (attendanceId) navigate('/attendance')
      await load()
    } catch (cause) {
      setError(errorMessage(cause))
    } finally {
      setBusy('')
    }
  }

  return (
    <div
      className={
        attendanceId ? 'attendance-page-fullscreen' : 'max-w-6xl mx-auto'
      }
    >
      {!attendanceId && (
        <>
          <section className="page-intro mint">
            <div>
              <p className="eyebrow">RUTINA DE DIMINEAȚĂ</p>
              <h1>Prezență</h1>
              <p>
                Pornește ziua grupei și bifează fiecare copil pe măsură ce
                sosește.
              </p>
            </div>
            <ClipboardCheck
              size={72}
              strokeWidth={1.4}
              className="hidden sm:block opacity-60"
              aria-hidden="true"
            />
          </section>

          <div className="flex flex-wrap items-center justify-between gap-4 my-7">
            <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
              <CalendarDays size={18} className="text-brand-700" />
              Ziua
              <input
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className="rounded-lg border border-slate-200 px-3 py-2 font-normal"
              />
            </label>
            <span className="text-sm text-slate-500">
              {rows.length} {rows.length === 1 ? 'grupă' : 'grupe'}
            </span>
          </div>

          {error && (
            <p role="alert" className="error-box mb-4">
              {error}
            </p>
          )}
          {loading ? (
            <div role="status" className="empty-state">
              Se încarcă grupele...
            </div>
          ) : !rows.length ? (
            <div className="empty-state">
              <Users size={44} className="mx-auto mb-4 text-brand-500" />
              <h2>Nu există grupe active</h2>
              <p>Creează mai întâi o grupă și adaugă copiii în ea.</p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {rows.map((row) => (
                <AttendanceCard
                  key={row.groupId}
                  row={row}
                  today={date === today()}
                  busy={busy === row.groupId}
                  onCreate={() => void create(row)}
                  onStart={() => void startRow(row)}
                  onOpen={() => void open(row)}
                  onReset={() => void reset(row)}
                  onDelete={() => void remove(row)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {attendanceId && error && (
        <p role="alert" className="error-box">
          {error}
        </p>
      )}
      {attendanceId && loading && (
        <div role="status" className="empty-state">
          Se încarcă prezența...
        </div>
      )}
      {selected && (
        <AttendanceBoard
          detail={selected}
          today={date === today()}
          busy={busy}
          onBack={attendanceId ? () => navigate('/attendance') : undefined}
          onStart={() => void start()}
          onStatus={(childId, status) => void setChildStatus(childId, status)}
          onFinish={() => void finish()}
          onReset={() =>
            void reset({ id: selected.id, groupId: selected.groupId })
          }
          onDelete={() =>
            void remove({
              id: selected.id,
              groupId: selected.groupId,
              groupName: selected.groupName,
            })
          }
        />
      )}
    </div>
  )
}
