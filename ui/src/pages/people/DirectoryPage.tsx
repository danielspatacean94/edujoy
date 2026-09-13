import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, KeyRound, School, Sprout, GraduationCap, Search, ImagePlus, UserRound } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { PasswordInput } from '@/components/ui/PasswordInput'
import { useAuthStore } from '@/store/auth.store'
import { edujoyService, errorMessage, type RecordItem, type RecordInput, type Resource } from '@/services/edujoy.service'
import { createDirectoryStore } from './useDirectoryStore'

const labels = {
  kindergartens: { title: 'Grădinițe', singular: 'grădiniță', caption: 'Locuri pline de bucurie, în care cei mici cresc frumos.', Icon: School, color: 'peach' },
  teachers: { title: 'Educatori', singular: 'educator', caption: 'Oamenii care aduc grijă și bucurie în fiecare zi.', Icon: GraduationCap, color: 'lavender' },
  children: { title: 'Copii', singular: 'copil', caption: 'Imaginație fără margini. Mici exploratori. O comunitate fericită.', Icon: Sprout, color: 'mint' },
  groups: { title: 'Grupe', singular: 'grupă', caption: 'Spații în care copiii descoperă, învață și se joacă împreună.', Icon: Sprout, color: 'butter' },
}
type Dialog = { type: 'create' } | { type: 'edit' | 'delete' | 'reset'; row: RecordItem }
export function DirectoryPage({ resource }: { resource: Resource }) {
  const [useDirectoryStore] = useState(createDirectoryStore)
  const { rows, total, loading, error, load } = useDirectoryStore()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [dialog, setDialog] = useState<Dialog | null>(null)
  const [gardens, setGardens] = useState<RecordItem[]>([])
  const [groups, setGroups] = useState<RecordItem[]>([])
  const [lookupError, setLookupError] = useState('')
  const admin = useAuthStore(s => s.user?.role === 'admin')
  const meta = labels[resource]
  useEffect(() => {
    const timer = setTimeout(() => { void load(resource, page, search) }, 200)
    return () => clearTimeout(timer)
  }, [resource, page, search, load])
  useEffect(() => {
    if (admin && resource !== 'kindergartens') edujoyService.kindergartens().then(setGardens).catch(e => setLookupError(errorMessage(e)))
  }, [admin, resource])
  useEffect(() => {
    if (resource === 'children') edujoyService.groups().then(setGroups).catch(e => setLookupError(errorMessage(e)))
  }, [resource])
  const refresh = () => { setDialog(null); void load(resource, page, search) }
  useEffect(() => { if (!loading && page > 1 && total <= (page - 1) * 12) setPage(page - 1) }, [total, loading, page])
  return <div className="directory max-w-6xl mx-auto">
    <div className={`page-intro ${meta.color}`}>
      <div><p className="eyebrow">COMUNITATEA NOASTRĂ EDUJOY</p><h1>{meta.title}</h1><p>{meta.caption}</p></div>
      <meta.Icon size={72} strokeWidth={1.4} className="hidden sm:block opacity-60" aria-hidden="true" />
    </div>
    <div className="flex flex-wrap gap-4 items-center justify-between my-7">
      <div className="relative"><Search className="absolute left-3 top-3 text-gray-400" size={18} /><input aria-label={`Caută în lista de ${meta.title.toLowerCase()}`} className="search-field" placeholder={`Caută după nume...`} value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} /></div>
      <Button onClick={() => setDialog({ type: 'create' })} className="flex items-center gap-2"><Plus size={18} />Adaugă {meta.singular}</Button>
    </div>
    {(error || lookupError) && <p role="alert" className="error-box mb-4">{error || lookupError} <button className="underline" onClick={() => { void load(resource, page, search); if (admin) edujoyService.kindergartens().then(v => { setGardens(v); setLookupError('') }).catch(e => setLookupError(errorMessage(e))) }}>Încearcă din nou</button></p>}
    {loading ? <div role="status" className="empty-state">Se încarcă membrii comunității...</div> : !rows.length ? <div className="empty-state"><meta.Icon size={44} className="mx-auto mb-4 text-brand-500" /><h2>{search ? 'Nu am găsit rezultate' : `Un loc pentru noi începuturi`}</h2><p>{search ? 'Încearcă un alt nume.' : `Folosește butonul „Adaugă” pentru a începe.`}</p></div> :
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{rows.map((row, index) => <article key={row.id} className="person-card">
        <div className="flex justify-between items-start">{resource === 'children' ? <ChildAvatar row={row} tone={['peach', 'lavender', 'mint', 'butter'][index % 4]} /> : <div className={`avatar ${['peach', 'lavender', 'mint', 'butter'][index % 4]}`}>{(row.name || row.fullName || '?').split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}</div>}<span className="little-tag">{resource === 'children' ? `${row.age} ${row.age === 1 ? 'an' : 'ani'}` : resource === 'teachers' ? 'Educator' : 'Grădiniță'}</span></div>
        <h2>{row.name || row.fullName}</h2>
        <p className="text-sm text-gray-500 break-words">{resource === 'kindergartens' ? row.location : resource === 'teachers' ? row.email : resource === 'children' ? groups.find(g => g.id === row.groupId)?.name || 'Grupă indisponibilă' : resource === 'groups' ? `${row.childrenCount ?? 0} ${row.childrenCount === 1 ? 'copil' : 'copii'}` : 'Creștem, învățăm și descoperim'}</p>
        {admin && resource !== 'kindergartens' && <p className="flex items-center gap-2 text-sm text-brand-700 mt-4"><School size={16} className="shrink-0" />{gardens.find(g => g.id === row.kindergartenId)?.name || 'Grădiniță indisponibilă'}</p>}
        <div className="card-actions"><button onClick={() => setDialog({ type: 'edit', row })}><Pencil size={15} />Editează</button>{resource === 'teachers' && <button onClick={() => setDialog({ type: 'reset', row })} aria-label={`Resetează parola pentru ${row.fullName}`}><KeyRound size={15} />Parolă</button>}<button className="!text-red-600 ml-auto" onClick={() => setDialog({ type: 'delete', row })} aria-label={`Șterge ${row.name || row.fullName}`}><Trash2 size={16} /></button></div>
      </article>)}</div>}
    <div className="flex items-center justify-between mt-7 gap-3 text-sm text-gray-500"><span>{total} {meta.title.toLowerCase()}</span><div className="flex gap-3 items-center"><Button variant="secondary" disabled={page <= 1 || loading} onClick={() => setPage(page - 1)}>Înapoi</Button><span>{page} / {Math.max(1, Math.ceil(total / 12))}</span><Button variant="secondary" disabled={page * 12 >= total || loading} onClick={() => setPage(page + 1)}>Înainte</Button></div></div>
    {dialog && <RecordDialog resource={resource} dialog={dialog} gardens={gardens} groups={groups} admin={admin} onClose={() => setDialog(null)} onSaved={refresh} />}
  </div>
}

function ChildAvatar({ row, tone }: { row: RecordItem; tone: string }) {
  const [src, setSrc] = useState<string | null>(null)
  useEffect(() => {
    let objectUrl = ''
    let active = true
    edujoyService.photo(row.id)
      .then(data => {
        if (data.size === 0) return
        objectUrl = URL.createObjectURL(data)
        if (active) setSrc(objectUrl)
      })
      .catch(() => { if (active) setSrc(null) })
    return () => { active = false; if (objectUrl) URL.revokeObjectURL(objectUrl) }
  }, [row.id])
  return <div className={`avatar relative overflow-hidden ${tone}`}>{src && <img src={src} alt={`Fotografia lui ${row.name}`} className="absolute inset-0 h-full w-full object-cover" decoding="async" onError={() => setSrc(null)} />}</div>
}

function RecordDialog({ resource, dialog, gardens, groups, admin, onClose, onSaved }: { resource: Resource; dialog: Dialog; gardens: RecordItem[]; groups: RecordItem[]; admin: boolean; onClose: () => void; onSaved: () => void }) {
  const row = 'row' in dialog ? dialog.row : undefined
  const [name, setName] = useState(row?.name || row?.fullName || '')
  const [location, setLocation] = useState(row?.location || '')
  const [age, setAge] = useState(row?.age?.toString() || '')
  const [photo, setPhoto] = useState<File | null>(null)
  const [garden, setGarden] = useState(row?.kindergartenId || '')
  const [group, setGroup] = useState(row?.groupId || '')
  const [email, setEmail] = useState(row?.email || '')
  const [password, setPassword] = useState('')
  const [generated, setGenerated] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [photoPreview, setPhotoPreview] = useState(row?.photoKey ? `/api/children/${row.id}/photo` : '')
  useEffect(() => {
    if (!photo) { setPhotoPreview(row?.photoKey ? `/api/children/${row.id}/photo` : ''); return }
    const preview = URL.createObjectURL(photo)
    setPhotoPreview(preview)
    return () => URL.revokeObjectURL(preview)
  }, [photo, row?.photoKey, row?.id])
  const singular = labels[resource].singular
  const title = dialog.type === 'reset' ? 'Resetează parola educatorului' : `${dialog.type === 'create' ? 'Adaugă' : dialog.type === 'edit' ? 'Editează' : 'Șterge'} ${singular}`
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setError('')
    try {
      if (dialog.type === 'delete' && row) await edujoyService.remove(resource, row.id)
      else if (dialog.type === 'reset' && row) { const { data } = await edujoyService.reset(row.id); setGenerated(data.password); return }
      else {
        let input: RecordInput
        if (resource === 'kindergartens') input = { name: name.trim(), location: location.trim() }
        else if (resource === 'teachers') input = { fullName: name.trim(), kindergartenId: garden, role: 'teacher', ...(!row ? { email, password } : {}) }
        else input = { name: name.trim(), age: Number(age), groupId: group, ...(admin ? { kindergartenId: garden } : {}) }
        const saved = await edujoyService.save(resource, input, row?.id)
        if (resource === 'children' && photo) await edujoyService.uploadChildPhoto(row?.id || saved.data.id, photo)
      }
      onSaved()
    } catch (e) { setError(errorMessage(e)) } finally { setBusy(false) }
  }
  return <Modal title={title} onClose={busy ? () => {} : onClose}><form onSubmit={submit} className="space-y-4">
    {error && <p className="error-box" role="alert">{error}</p>}
    {dialog.type === 'delete' ? <p>Ștergi înregistrarea pentru <strong>{name}</strong>? {resource === 'kindergartens' ? 'Mai întâi, mută sau șterge educatorii și copiii din această grădiniță.' : 'Această înregistrare va fi eliminată din lista activă.'}</p> : dialog.type === 'reset' ? <div><p>Generează o parolă temporară pentru <strong>{name}</strong>. La următoarea autentificare va alege o parolă nouă.</p>{generated && <div className="mt-4"><p className="text-sm mb-2">Transmite această parolă educatorului printr-un canal sigur:</p><code className="block rounded-xl bg-amber-50 p-4 select-all break-all">{generated}</code></div>}</div> : <>
      <Input label="Nume" id="record-name" required maxLength={120} value={name} onChange={e => setName(e.target.value)} autoFocus />
      {resource === 'kindergartens' && <Input label="Adresă" id="record-location" required maxLength={250} placeholder="Stradă, localitate" value={location} onChange={e => setLocation(e.target.value)} />}
      {resource === 'children' && <Input label="Vârsta (ani)" id="record-age" type="number" required min={0} max={18} step={1} value={age} onChange={e => setAge(e.target.value)} />}
      {resource === 'children' && <div className="rounded-xl border border-slate-200 bg-slate-50 p-3"><p className="mb-2 text-sm font-medium text-gray-700">Fotografie (opțional)</p><div className="flex items-center gap-3"><div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-amber-100 text-amber-700">{photoPreview ? <img src={photoPreview} alt="Previzualizare fotografie" className="h-full w-full object-cover" /> : <UserRound size={28} strokeWidth={1.5} />}</div><label htmlFor="record-photo" className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"><ImagePlus size={16} />Alege fotografia<input id="record-photo" type="file" accept="image/*" className="sr-only" onChange={e => setPhoto(e.target.files?.[0] ?? null)} /></label></div><p className="mt-2 text-xs text-gray-500">Redimensionare automată: maximum 400×400 px și 120 KB.</p></div>}
      {resource === 'teachers' && !row && <><Input label="Adresă de e-mail" id="teacher-email" type="email" required value={email} onChange={e => setEmail(e.target.value)} /><label className="block text-sm font-medium">Parolă temporară<PasswordInput required minLength={8} value={password} onChange={e => setPassword(e.target.value)} autoComplete="new-password" /></label><p className="text-xs text-gray-500">Cel puțin 8 caractere. Educatorul va alege o parolă nouă la prima autentificare.</p></>}
      {resource !== 'kindergartens' && admin && <div><label htmlFor="kindergarten" className="block text-sm font-medium mb-1">Grădiniță</label><select id="kindergarten" required className="w-full border border-slate-300 rounded-xl px-3 py-2" value={garden} onChange={e => { setGarden(e.target.value); if (resource === 'children') setGroup('') }}><option value="">Alege o grădiniță</option>{gardens.map(g => <option key={g.id} value={g.id}>{g.name} — {g.location}</option>)}</select>{!gardens.length && <p className="text-sm text-amber-700 mt-2">Creează mai întâi o grădiniță, apoi adaugă membrii comunității.</p>}</div>}
      {resource === 'children' && !admin && <p className="text-sm text-gray-500">Copilul va fi adăugat în grădinița care îți este atribuită.</p>}
      {resource === 'children' && <div><label htmlFor="group" className="block text-sm font-medium mb-1">Grupă</label><select id="group" required className="w-full border border-slate-300 rounded-xl px-3 py-2" value={group} onChange={e => setGroup(e.target.value)}><option value="">Alege o grupă</option>{groups.filter(item => !admin || item.kindergartenId === garden).map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select>{!groups.some(item => !admin || item.kindergartenId === garden) && <p className="text-sm text-amber-700 mt-2">Creează mai întâi o grupă pentru grădinița selectată.</p>}</div>}
    </>}
    <div className="flex justify-end gap-3 pt-3"><Button type="button" variant="secondary" disabled={busy} onClick={onClose}>{generated ? 'Gata' : 'Anulează'}</Button>{!generated && <Button type="submit" variant={dialog.type === 'delete' ? 'danger' : 'primary'} disabled={busy}>{busy ? 'Se salvează...' : dialog.type === 'delete' ? 'Șterge' : dialog.type === 'reset' ? 'Generează parola' : 'Salvează'}</Button>}</div>
  </form></Modal>
}
