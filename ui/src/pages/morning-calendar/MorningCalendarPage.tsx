import { useEffect, useMemo, useState } from 'react'
import { CalendarHeart, Check, Plus, Save, Pencil } from 'lucide-react'
import { groupsService, type Group } from '@/services/groups.service'
import { morningCalendarService, type CalendarQuestion, type MorningCalendar } from '@/services/morning-calendar.service'
import { errorMessage } from '@/services/api-error'
import { Button } from '@/components/ui/Button'
import { useParams } from 'react-router-dom'

const today = () => new Date().toISOString().slice(0, 10)
const defaults = (): CalendarQuestion[] => [
  { type: 'weekday', label: 'Ce zi este?', options: ['Luni','Marți','Miercuri','Joi','Vineri'].map(label => ({ label, image: '📅' })) },
  { type: 'weather', label: 'Cum e vremea?', options: [['Soare','☀️'],['Nori','☁️'],['Ploaie','🌧️'],['Zăpadă','❄️']].map(([label,image]) => ({ label, image })) },
  { type: 'season', label: 'Ce anotimp este?', options: [['Primăvara','🌸'],['Vara','☀️'],['Toamna','🍂'],['Iarna','⛄']].map(([label,image]) => ({ label, image })) },
  { type: 'activity', label: 'Ce facem astăzi?', options: [] },
]
function OptionVisual({ value }: { value: string }) {
  return /^https?:\/\//.test(value) || value.startsWith('data:')
    ? <img src={value} alt="" className="mx-auto h-16 w-16 rounded-xl object-cover" />
    : <span>{value}</span>
}

export function MorningCalendarPage() {
  const { id } = useParams<{ id: string }>()
  const [groups, setGroups] = useState<Group[]>([]); const [groupId, setGroupId] = useState(''); const [date, setDate] = useState(today); const [calendar, setCalendar] = useState<MorningCalendar|null>(null); const [questions, setQuestions] = useState<CalendarQuestion[]>(defaults()); const [selected, setSelected] = useState<Record<string,string>>({}); const [editing, setEditing] = useState(false); const [loading, setLoading] = useState(true); const [busy, setBusy] = useState(false); const [error, setError] = useState('')
  const selectedGroup = useMemo(() => groups.find(g => g.id === groupId), [groups, groupId])
  useEffect(() => { groupsService.all().then(rows => { setGroups(rows); if (!groupId && rows[0]) setGroupId(rows[0].id) }).catch(e => setError(errorMessage(e))).finally(() => setLoading(false)) }, [])
  useEffect(() => { if (!groupId || id) return; morningCalendarService.list(groupId, date).then(rows => { const row = rows[0]; setCalendar(row || null); setQuestions(row?.questions || defaults()); setEditing(!row) }).catch(e => setError(errorMessage(e))) }, [groupId, date, id])
  useEffect(() => { if (!id) return; morningCalendarService.list().then(rows => { const row = rows.find(item => item.id === id); if (row) { setCalendar(row); setGroupId(row.groupId); setDate(row.date); setQuestions(row.questions) } }).catch(e => setError(errorMessage(e))) }, [id])
  async function save() { if (!groupId) return; setBusy(true); setError(''); try { const row = await morningCalendarService.save(groupId, date, questions); setCalendar(row) } catch(e) { setError(errorMessage(e)) } finally { setBusy(false) } }
  async function complete() { if (!calendar) return; setBusy(true); try { setCalendar(await morningCalendarService.complete(calendar.id)) } catch(e) { setError(errorMessage(e)) } finally { setBusy(false) } }
  if (loading) return <div className="empty-state">Se încarcă...</div>
  const running = Boolean(calendar) && !editing
  return <div className="max-w-6xl mx-auto pb-8"><div className="page-intro mint flex items-center justify-between"><div><p className="eyebrow">RUTINA DE DIMINEAȚĂ</p><h1>Calendarul dimineții</h1><p>Descoperiți împreună ziua, vremea, anotimpul și activitățile.</p></div><CalendarHeart size={64} className="hidden sm:block opacity-60" /></div>{error && <p role="alert" className="error-box my-4">{error}</p>}
    {(!running && !calendar) && <div className="flex flex-wrap gap-4 items-end my-6"><label className="field"><span>Grupa</span><select value={groupId} onChange={e => setGroupId(e.target.value)}>{groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}</select></label><label className="field"><span>Ziua</span><input type="date" value={date} onChange={e => setDate(e.target.value)} /></label><span className="text-sm text-slate-500">{selectedGroup?.name}</span></div>}
    {running ? <div className="space-y-6"><div className="flex items-center justify-between"><h2 className="text-2xl font-bold">{selectedGroup?.name || 'Calendarul grupei'}</h2><div className="flex gap-2"><Button variant="secondary" onClick={() => setEditing(true)}><Pencil size={16}/>Editeaza</Button><Button variant="secondary" onClick={() => void complete()} disabled={busy}><Check size={16}/>Finalizeaza</Button></div></div>{questions.map(q => <section key={q.id || q.type} className="rounded-3xl bg-white p-6 shadow-sm"><h3 className="text-xl font-bold text-center mb-5">{q.label}</h3><div className="grid grid-cols-2 sm:grid-cols-4 gap-4">{q.options.map(o => <button key={o.id || o.label} onClick={() => setSelected(s => ({...s, [q.type]: o.label}))} className={`rounded-2xl border-2 p-4 text-center transition ${selected[q.type] === o.label ? 'border-brand-600 bg-brand-50 scale-105' : 'border-slate-100 hover:border-brand-300'}`}><div className="text-5xl"><OptionVisual value={o.image} /></div><div className="mt-2 font-semibold">{o.label}</div></button>)}</div></section>)}</div> : <div className="space-y-4">{questions.map((q, qi) => <section key={q.id || q.type} className="rounded-2xl bg-white p-5 shadow-sm"><div className="flex items-center gap-3 mb-4"><input className="flex-1 text-lg font-bold border-b border-slate-200 pb-2" value={q.label} onChange={e => setQuestions(xs => xs.map((x,i) => i===qi ? {...x,label:e.target.value}:x))} /><span className="text-xs uppercase text-slate-400">{q.type}</span></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{q.options.map((o, oi) => <div key={o.id || oi} className="flex items-center gap-2 rounded-xl bg-slate-50 p-2"><input className="w-12 text-2xl text-center bg-transparent" value={o.image} onChange={e => setQuestions(xs => xs.map((x,i) => i===qi ? {...x,options:x.options.map((y,j)=>j===oi?{...y,image:e.target.value}:y)}:x))} /><input className="min-w-0 flex-1 bg-transparent" value={o.label} onChange={e => setQuestions(xs => xs.map((x,i) => i===qi ? {...x,options:x.options.map((y,j)=>j===oi?{...y,label:e.target.value}:y)}:x))} /></div>)}{q.type==='activity' && <button className="rounded-xl border-2 border-dashed border-brand-200 p-3 text-brand-700" onClick={() => setQuestions(xs => xs.map((x,i)=>i===qi?{...x,options:[...x.options,{label:'Activitate nouă',image:'🎨'}]}:x))}><Plus size={18} className="inline"/> Adaugă activitate</button>}</div></section>)}<div className="flex justify-end gap-3"><Button variant="secondary" onClick={() => void save()} disabled={busy}><Save size={16}/>Salvează</Button></div></div>}
  </div>
}
