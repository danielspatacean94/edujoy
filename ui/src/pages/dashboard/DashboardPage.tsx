import { Link } from 'react-router-dom'
import { School, GraduationCap, Sprout, ArrowUpRight, Sun, Heart } from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
export function DashboardPage() {
  const user = useAuthStore(s => s.user)
  const admin = user?.role === 'admin'
  const cards = [
    ...(admin ? [{ title: 'Grădinițe', text: 'Creează un loc primitor pentru învățare. Gestionează grădinițele și adresele lor.', path: '/admin/kindergartens', Icon: School, color: 'peach' },
    { title: 'Educatori', text: 'Reunește echipa și atribuie fiecărui educator o grădiniță.', path: '/admin/teachers', Icon: GraduationCap, color: 'lavender' }] : []),
    { title: 'Grupe', text: 'Organizează grupele grădiniței și descoperă copiii din fiecare grupă.', path: '/groups', Icon: GraduationCap, color: 'butter' },
    { title: 'Copii', text: 'Cunoaște micii exploratori și păstrează datele lor la zi.', path: '/children', Icon: Sprout, color: 'mint' },
  ]
  return <div className="max-w-6xl mx-auto">
    <section className="welcome-panel"><div className="relative z-10 max-w-xl"><p className="eyebrow">MOMENTE MICI. POSIBILITĂȚI MARI.</p><h1>Bună, {user?.fullName?.split(' ')[0] || 'prietene'} <span className="text-amber-500">☀</span></h1><p>Puțină grijă. Multă bucurie.<br />Să facem loc lucrurilor frumoase, în fiecare zi.</p><Link className="welcome-link" to={admin ? '/admin/kindergartens' : '/children'}>{admin ? 'Descoperă grădinițele tale' : 'Cunoaște micii exploratori'}<ArrowUpRight size={18} /></Link></div><div className="garden-art" aria-hidden="true"><div className="sun"><Sun size={74} /></div><div className="house"><div className="roof" /><div className="windows"><i /><i /></div><div className="door" /></div><div className="hill hill-one" /><div className="hill hill-two" /><Sprout className="flower" size={66} /></div></section>
    <div className="flex items-center gap-3 mt-10 mb-5"><Heart size={20} className="text-rose-400" /><h2 className="text-xl font-bold">Mica ta lume, împreună</h2></div>
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">{cards.map(({ title, text, path, Icon, color }) => <Link key={path} to={path} className="dashboard-card group"><div className={`avatar ${color}`}><Icon size={28} /></div><h2>{title}<ArrowUpRight className="text-gray-400 group-hover:text-brand-600" size={20} /></h2><p>{text}</p><span className="text-sm font-bold text-brand-600 mt-6 block">Vezi {title.toLowerCase()} →</span></Link>)}</div>
    <div className="mt-8 rounded-2xl border border-dashed border-amber-300 bg-amber-50/60 p-5 text-sm text-amber-900">{admin ? 'Începe cu o grădiniță, adaugă educatorii, apoi întâmpină copiii. Orice aventură frumoasă începe cu pași mici.' : 'Lista copiilor este comună educatorilor din grădinița ta. Împreună, faceți fiecare zi mai frumoasă.'}</div>
  </div>
}
