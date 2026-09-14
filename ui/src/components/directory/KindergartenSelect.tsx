import { useId } from 'react'
import type { Kindergarten } from '@/services/kindergartens.service'

export function KindergartenSelect({
  rows,
  value,
  onChange,
}: {
  rows: Kindergarten[]
  value: string
  onChange: (id: string) => void
}) {
  const id = useId()
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium mb-1">
        Grădiniță
      </label>
      <select
        id={id}
        required
        className="w-full border border-slate-300 rounded-xl px-3 py-2"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">Alege o grădiniță</option>
        {rows.map((row) => (
          <option key={row.id} value={row.id}>
            {row.name} — {row.location}
          </option>
        ))}
      </select>
      {!rows.length && (
        <p className="text-sm text-amber-700 mt-2">
          Creează mai întâi o grădiniță, apoi adaugă membrii comunității.
        </p>
      )}
    </div>
  )
}
