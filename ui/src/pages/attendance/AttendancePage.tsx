import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, CalendarDays, Check, CheckCircle2, ClipboardCheck, Flag, Play, RotateCcw, Trash2, UserRound, Users } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { edujoyService } from '@/services/edujoy.service'
import { attendanceService, errorMessage, type AttendanceDetail, type AttendanceStatus, type AttendanceSummary, type ChildAttendanceStatus } from '@/services/attendance.service'

function today() {
  const date = new Date()
  const offset = date.getTimezoneOffset()
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 10)
}

const statusLabels: Record<AttendanceStatus, string> = {
  PENDING: 'În așteptare',
  IN_PROGRESS: 'În desfășurare',
  FINISHED: 'Finalizată',
}

function updateSummary(rows: AttendanceSummary[], detail: AttendanceDetail) {
  return rows.map(row => row.groupId === detail.groupId
    ? { ...row, id: detail.id, status: detail.status, childrenCount: detail.childrenCount, checkedCount: detail.checkedCount }
    : row)
}

function initials(name: string) {
  return name.split(' ').map(part => part[0]).filter(Boolean).slice(0, 2).join('').toUpperCase()
}

function avatarTone(id: string) {
  return ['bg-rose-100 text-rose-700', 'bg-sky-100 text-sky-700', 'bg-amber-100 text-amber-700', 'bg-emerald-100 text-emerald-700', 'bg-violet-100 text-violet-700'][id.charCodeAt(0) % 5]
}

function announceAttendance(name: string, status: ChildAttendanceStatus) {
  if (!('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
  const speech = new SpeechSynthesisUtterance(`${name}, ${status === 'PRESENT' ? 'Prezent' : 'Absent'}`)
  speech.lang = 'ro-RO'
  speech.rate = 0.78
  speech.pitch = 1.3
  speech.volume = 1
  const romanianVoices = window.speechSynthesis.getVoices().filter(voice => voice.lang.toLowerCase().startsWith('ro'))
  console.log(romanianVoices);
  const femaleVoice = romanianVoices.find(voice => /female|feme|maria|ioana|elena|andreea|carmen|irina|ana|monica|raluca|simona|cristina|diana|sorina/i.test(voice.name))
  if (femaleVoice || romanianVoices[0]) speech.voice = femaleVoice || romanianVoices[0]
  window.speechSynthesis.speak(speech)
}

function playCompletionSound() {
  const sound = new Audio('/finish.mp3')
  sound.volume = 1
  void sound.play().catch(() => null)
}

function requestAttendanceFullscreen() {
  const request = document.documentElement.requestFullscreen
  if (request && !document.fullscreenElement) void request.call(document.documentElement).catch(() => null)
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
      setSelected(current => current?.date === date ? current : null)
    } catch (cause) {
      setError(errorMessage(cause))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!attendanceId) { void load(); return }
    setLoading(true); setError('')
    attendanceService.get(attendanceId)
      .then(detail => { setSelected(detail); setDate(detail.date) })
      .catch(cause => setError(errorMessage(cause)))
      .finally(() => setLoading(false))
  }, [attendanceId, date])

  async function create(row: AttendanceSummary) {
    setBusy(row.groupId); setError('')
    try {
      const detail = await attendanceService.create(row.groupId, date)
      setSelected(detail)
      setRows(current => updateSummary(current, detail))
    } catch (cause) { setError(errorMessage(cause)) } finally { setBusy('') }
  }

  async function open(row: AttendanceSummary) {
    if (!row.id) return
    requestAttendanceFullscreen()
    setBusy(row.groupId); setError('')
    try {
      const detail = await attendanceService.get(row.id)
      setSelected(detail)
      navigate(`/attendance/${detail.id}`)
    }
    catch (cause) { setError(errorMessage(cause)) }
    finally { setBusy('') }
  }

  async function start() {
    if (!selected?.id) return
    requestAttendanceFullscreen()
    setBusy(selected.groupId); setError('')
    try {
      const detail = await attendanceService.start(selected.id)
      setSelected(detail); setRows(current => updateSummary(current, detail)); navigate(`/attendance/${detail.id}`)
    } catch (cause) { setError(errorMessage(cause)) } finally { setBusy('') }
  }

  async function startRow(row: AttendanceSummary) {
    if (!row.id) return
    requestAttendanceFullscreen()
    setBusy(row.groupId); setError('')
    try {
      const detail = await attendanceService.start(row.id)
      setSelected(detail); setRows(current => updateSummary(current, detail)); navigate(`/attendance/${detail.id}`)
    } catch (cause) { setError(errorMessage(cause)) } finally { setBusy('') }
  }

  async function setChildStatus(childId: string, status: ChildAttendanceStatus) {
    if (!selected?.id || selected.status !== 'IN_PROGRESS') return
    const child = selected ? selected.children.find(item => item.id === childId) : undefined
    announceAttendance(child?.name ?? 'Copilul', status)
    setBusy(childId); setError('')
    try {
      const detail = await attendanceService.setChildStatus(selected.id, childId, status)
      setSelected(detail); setRows(current => updateSummary(current, detail))
      if (detail.status === 'FINISHED') playCompletionSound()
    } catch (cause) { setError(errorMessage(cause)) } finally { setBusy('') }
  }

  async function finish() {
    if (!selected?.id) return
    setBusy(selected.groupId); setError('')
    try {
      const detail = await attendanceService.finish(selected.id)
      setSelected(detail); setRows(current => updateSummary(current, detail))
      if (detail.status === 'FINISHED') playCompletionSound()
    } catch (cause) { setError(errorMessage(cause)) } finally { setBusy('') }
  }

  async function reset(row: Pick<AttendanceSummary, 'id' | 'groupId'>) {
    if (!row.id) return
    setBusy(row.groupId); setError('')
    try {
      const detail = await attendanceService.reset(row.id)
      setSelected(detail); setRows(current => updateSummary(current, detail))
    } catch (cause) { setError(errorMessage(cause)) } finally { setBusy('') }
  }

  async function remove(row: Pick<AttendanceSummary, 'id' | 'groupId' | 'groupName'>) {
    if (!row.id || !window.confirm(`Ștergi prezența pentru grupa ${row.groupName}?`)) return
    setBusy(row.groupId); setError('')
    try {
      await attendanceService.remove(row.id)
      if (selected?.groupId === row.groupId) setSelected(null)
      if (attendanceId) navigate('/attendance')
      await load()
    } catch (cause) { setError(errorMessage(cause)) } finally { setBusy('') }
  }

  return <div className={attendanceId ? 'h-screen overflow-hidden' : 'max-w-6xl mx-auto'}>
    {!attendanceId && <><section className="page-intro mint">
      <div><p className="eyebrow">RUTINA DE DIMINEAȚĂ</p><h1>Prezență</h1><p>Pornește ziua grupei și bifează fiecare copil pe măsură ce sosește.</p></div>
      <ClipboardCheck size={72} strokeWidth={1.4} className="hidden sm:block opacity-60" aria-hidden="true" />
    </section>

    <div className="flex flex-wrap items-center justify-between gap-4 my-7">
      <label className="flex items-center gap-3 text-sm font-medium text-slate-700"><CalendarDays size={18} className="text-brand-700" />Ziua<input type="date" value={date} onChange={event => setDate(event.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 font-normal" /></label>
      <span className="text-sm text-slate-500">{rows.length} {rows.length === 1 ? 'grupă' : 'grupe'}</span>
    </div>

    {error && <p role="alert" className="error-box mb-4">{error}</p>}
    {loading ? <div role="status" className="empty-state">Se încarcă grupele...</div> : !rows.length ? <div className="empty-state"><Users size={44} className="mx-auto mb-4 text-brand-500" /><h2>Nu există grupe active</h2><p>Creează mai întâi o grupă și adaugă copiii în ea.</p></div> : <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {rows.map(row => <AttendanceCard key={row.groupId} row={row} today={date === today()} busy={busy === row.groupId} onCreate={() => void create(row)} onStart={() => void startRow(row)} onOpen={() => void open(row)} onReset={() => void reset(row)} onDelete={() => void remove(row)} />)}
    </div>}</>}

    {attendanceId && loading && <div role="status" className="empty-state">Se încarcă prezența...</div>}
    {selected && <AttendanceBoard detail={selected} today={date === today()} busy={busy} onBack={attendanceId ? () => navigate('/attendance') : undefined} onStart={() => void start()} onStatus={(childId, status) => void setChildStatus(childId, status)} onFinish={() => void finish()} onReset={() => void reset({ id: selected.id, groupId: selected.groupId })} onDelete={() => void remove({ id: selected.id, groupId: selected.groupId, groupName: selected.groupName })} />}
  </div>
}

function AttendanceCard({ row, today, busy, onCreate, onStart, onOpen, onReset, onDelete }: { row: AttendanceSummary; today: boolean; busy: boolean; onCreate: () => void; onStart: () => void; onOpen: () => void; onReset: () => void; onDelete: () => void }) {
  const status = row.status ? statusLabels[row.status] : 'Nu a fost creată'
  return <article className="person-card">
    <div className="flex items-start justify-between gap-3"><div className="avatar butter"><ClipboardCheck size={26} /></div><span className="little-tag">{status}</span></div>
    <h2>{row.groupName}</h2>
    <p className="text-sm text-gray-500 flex items-center gap-2"><Users size={15} />{row.childrenCount} {row.childrenCount === 1 ? 'copil' : 'copii'}{row.status && <> · {row.checkedCount} completați</>}</p>
    <div className="card-actions">
      {!row.status && <Button size="sm" className="!bg-emerald-600 !text-white hover:!bg-emerald-700" disabled={busy} onClick={onCreate}><Play size={15} />Creează prezența</Button>}
      {row.status === 'PENDING' && <Button size="sm" className="!bg-emerald-600 !text-white hover:!bg-emerald-700" disabled={busy} onClick={onStart}><Play size={15} />Pornește</Button>}
      {row.status === 'IN_PROGRESS' && <Button size="sm" className="!bg-emerald-600 !text-white hover:!bg-emerald-700" disabled={busy} onClick={onOpen}><ClipboardCheck size={15} />Deschide tabla</Button>}
      {row.status === 'FINISHED' && <Button size="sm" variant="secondary" disabled={busy} onClick={onOpen}><CheckCircle2 size={15} />Vezi rezumatul</Button>}
      {today && row.status && <><button type="button" disabled={busy} onClick={onReset} title="Resetează prezența" aria-label={`Resetează prezența pentru ${row.groupName}`}><RotateCcw size={16} />Resetează</button><button type="button" disabled={busy} className="!text-red-600" onClick={onDelete} title="Șterge prezența" aria-label={`Șterge prezența pentru ${row.groupName}`}><Trash2 size={16} /></button></>}
    </div>
  </article>
}

function AttendanceBoard({ detail, today, busy, onBack, onStart, onStatus, onFinish, onReset, onDelete }: { detail: AttendanceDetail; today: boolean; busy: string; onBack?: () => void; onStart: () => void; onStatus: (childId: string, status: ChildAttendanceStatus) => void; onFinish: () => void; onReset: () => void; onDelete: () => void }) {
  const finished = detail.status === 'FINISHED'
  return <section className={`attendance-room relative min-h-[720px] overflow-hidden bg-[#ead5b5] shadow-[0_16px_30px_rgba(91,58,27,0.2)] ${onBack ? 'is-fullscreen min-h-0 rounded-none border-0' : 'mt-10 rounded-[2rem] border-8 border-[#9a663c]'}`}>
    <div className="attendance-board-banner relative z-10 flex items-center justify-center gap-3 bg-[#f5e6cd] px-5 py-4 text-center">{onBack && <button type="button" onClick={onBack} className="absolute left-4 inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium text-slate-600 hover:bg-white/60"><ArrowLeft size={16} />Înapoi</button>}<span className="text-2xl">☀</span><p className="font-semibold tracking-wide text-[#31566a]">Împreună creștem frumos!</p><span className="text-2xl text-rose-500">♥</span></div>
    <div className="attendance-board-info flex flex-wrap items-center justify-between gap-4 border-b-8 border-[#9a663c] bg-[#f1d39a] px-5 py-4 sm:px-7"><div className="attendance-group-sign"><p className="eyebrow text-[#31566a]">PANOURILE GRUPEI</p><h2>{detail.groupName}</h2><p>{detail.checkedCount} din {detail.childrenCount} copii completați</p></div><div className="flex flex-wrap items-center gap-2">{!onBack && <>{detail.status === 'PENDING' && <Button onClick={onStart} disabled={busy !== ''}><Play size={17} />Pornește</Button>}{detail.status === 'IN_PROGRESS' && <Button variant="secondary" onClick={onFinish} disabled={busy !== ''}><Flag size={17} />Finalizează</Button>}{finished && <span className="inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700"><CheckCircle2 size={17} />Finalizată</span>}{today && <><button type="button" disabled={busy !== ''} onClick={onReset} className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium text-slate-600 hover:bg-white/60"><RotateCcw size={16} />Resetează</button><button type="button" disabled={busy !== ''} onClick={onDelete} className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium text-red-600 hover:bg-white/60"><Trash2 size={16} />Șterge</button></>}</>}</div></div>
    {!detail.children.length ? <p className="attendance-board-empty bg-[#1e5947] px-5 py-16 text-center text-white/80">Grupa nu are copii activi.</p> : <div className="attendance-board-grid relative grid gap-6 bg-[#1e5947] p-5 sm:grid-cols-2 sm:p-8 lg:grid-cols-3 xl:grid-cols-4">{detail.children.map((child, index) => <AttendanceChildCard key={child.id} child={child} index={index} disabled={finished || detail.status !== 'IN_PROGRESS' || busy !== ''} onStatus={onStatus} />)}</div>}
    {detail.status === 'IN_PROGRESS' && <p className="border-t border-slate-100 pt-4 text-sm text-slate-500">Poți finaliza prezența oricând. Când fiecare copil are statutul Prezent sau Absent, se finalizează automat.</p>}
  </section>
}

function AttendanceChildCard({ child, index, disabled, onStatus }: { child: AttendanceDetail['children'][number]; index: number; disabled: boolean; onStatus: (childId: string, status: ChildAttendanceStatus) => void }) {
  return <article className={`group relative rounded-xl border-4 p-3 text-left shadow-[0_5px_10px_rgba(17,49,39,0.3)] transition-all ${['rotate-[-1deg]', 'rotate-[1deg]', 'rotate-[-0.5deg]', 'rotate-[0.8deg]'][index % 4]} ${child.status === 'PRESENT' ? 'border-emerald-300 bg-emerald-50 text-emerald-950' : child.status === 'ABSENT' ? 'border-rose-300 bg-rose-50 text-rose-950' : 'border-white bg-white'} ${disabled ? '' : 'hover:-translate-y-1 hover:rotate-0 hover:shadow-[0_10px_18px_rgba(17,49,39,0.4)]'}`}><span className={`absolute left-1/2 top-[-11px] z-10 h-5 w-5 -translate-x-1/2 rounded-full border-2 border-white shadow ${child.status ? child.status === 'PRESENT' ? 'bg-emerald-500' : 'bg-rose-500' : 'bg-amber-400'}`} aria-hidden="true" /><div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-slate-100"><div className={`absolute inset-0 flex flex-col items-center justify-center gap-2 ${avatarTone(child.id)}`}><UserRound size={42} strokeWidth={1.5} /><span className="text-2xl font-bold tracking-wide">{initials(child.name)}</span></div><AttendanceChildPhoto child={child} /></div><span className="mt-3 block truncate text-lg font-semibold">{child.name}</span><div className="mt-3 grid grid-cols-2 gap-2"><button type="button" disabled={disabled} onClick={() => onStatus(child.id, 'PRESENT')} className={`inline-flex items-center justify-center gap-1 rounded-lg px-2 py-2 text-sm font-semibold transition-colors ${child.status === 'PRESENT' ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'}`}><Check size={15} />Prezent</button><button type="button" disabled={disabled} onClick={() => onStatus(child.id, 'ABSENT')} className={`inline-flex items-center justify-center gap-1 rounded-lg px-2 py-2 text-sm font-semibold transition-colors ${child.status === 'ABSENT' ? 'bg-rose-600 text-white' : 'bg-rose-100 text-rose-800 hover:bg-rose-200'}`}><span aria-hidden="true">×</span>Absent</button></div></article>
}

function AttendanceChildPhoto({ child }: { child: AttendanceDetail['children'][number] }) {
  const [src, setSrc] = useState<string | null>(null)
  useEffect(() => {
    let objectUrl = ''
    let active = true
    edujoyService.photo(child.id)
      .then(blob => {
        if (blob.size === 0) return
        objectUrl = URL.createObjectURL(blob)
        if (active) setSrc(objectUrl)
      })
      .catch(() => { if (active) setSrc(null) })
    return () => { active = false; if (objectUrl) URL.revokeObjectURL(objectUrl) }
  }, [child.id])
  return src ? <img src={src} alt={`Fotografia lui ${child.name}`} loading="lazy" className="absolute inset-0 h-full w-full object-cover" decoding="async" onError={() => setSrc(null)} /> : null
}
