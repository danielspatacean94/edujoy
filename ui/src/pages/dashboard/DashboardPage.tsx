import { Link } from 'react-router-dom'
import { ClipboardCheck, Dices, Sprout, ArrowUpRight, Sun, Heart, Users } from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
export function DashboardPage() {
  const user = useAuthStore(s => s.user)
  const cards = [
    { title: 'Prezență', text: 'Bifează rapid copiii care au sosit și finalizează prezența grupei.', path: '/attendance', Icon: ClipboardCheck, color: 'peach' },
    { title: 'Roata copiilor', text: 'Alege aleatoriu următorul copil pentru activitatea voastră.', path: '/wheel', Icon: Dices, color: 'lavender' },
    { title: 'Grupe', text: 'Organizează grupele și descoperă copiii din fiecare grupă.', path: '/groups', Icon: Users, color: 'butter' },
    { title: 'Copii', text: 'Cunoaște micii exploratori și păstrează datele lor la zi.', path: '/children', Icon: Sprout, color: 'mint' },
  ]
  return <div className="dashboard-page max-w-6xl mx-auto">
    <section className="welcome-panel"><div className="relative z-10 max-w-xl"><p className="eyebrow">MOMENTE MICI. POSIBILITĂȚI MARI.</p><h1>Bună, {user?.fullName?.split(' ')[0] || 'prietene'} <span className="text-amber-500">☀</span></h1><p>Puțină grijă. Multă bucurie.<br />Să facem loc lucrurilor frumoase, în fiecare zi.</p><Link className="welcome-link" to="/attendance">Începe ziua grupei<ArrowUpRight size={18} /></Link></div><div className="garden-art" aria-hidden="true"><div className="sun"><Sun size={74} /></div><div className="house"><div className="roof" /><div className="windows"><i /><i /></div><div className="door" /></div><div className="hill hill-one" /><div className="hill hill-two" /><Sprout className="flower" size={66} /></div></section>
    <div className="flex items-center gap-3 mt-10 mb-5"><Heart size={20} className="text-rose-400" /><h2 className="text-xl font-bold">Mica ta lume, împreună</h2></div>
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">{cards.map(({ title, text, path, Icon, color }) => <Link key={path} to={path} className="dashboard-card group"><div className={`avatar ${color}`}><Icon size={28} /></div><h2>{title}<ArrowUpRight className="text-gray-400 group-hover:text-brand-600" size={20} /></h2><p>{text}</p><span className="text-sm font-bold text-brand-600 mt-6 block">Vezi {title.toLowerCase()} →</span></Link>)}</div>
    <div className="mt-8 rounded-2xl border border-dashed border-amber-300 bg-amber-50/60 p-5 text-sm text-amber-900">Alege o activitate și fă fiecare zi mai frumoasă, pas cu pas.</div>
  </div>
}
