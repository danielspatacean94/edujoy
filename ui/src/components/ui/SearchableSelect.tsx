import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Search } from 'lucide-react'

interface Props<T> {
  items: T[]
  value: string
  getKey: (item: T) => string
  getLabel: (item: T) => string
  onChange: (key: string) => void
  placeholder?: string
  required?: boolean
}

export function SearchableSelect<T>({
  items,
  value,
  getKey,
  getLabel,
  onChange,
  placeholder = 'Alege…',
  required,
}: Props<T>) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const filtered = items.filter((item) =>
    getLabel(item).toLowerCase().includes(search.toLowerCase())
  )

  const selectedItem = items.find((item) => getKey(item) === value)

  const select = (key: string) => {
    onChange(key)
    setOpen(false)
    setSearch('')
  }

  return (
    <div ref={ref} className="relative">
      {/* Hidden native input for required validation */}
      {required && (
        <input
          tabIndex={-1}
          required
          value={value}
          onChange={() => {}}
          className="absolute opacity-0 h-0 w-0 pointer-events-none"
        />
      )}
      <div
        onClick={() => setOpen((o) => !o)}
        className="min-h-[38px] w-full border border-gray-300 rounded-md px-3 py-2 text-sm cursor-pointer flex items-center hover:border-gray-400 transition-colors bg-white"
      >
        <span className={selectedItem ? 'text-gray-900 flex-1' : 'text-gray-400 flex-1 select-none'}>
          {selectedItem ? getLabel(selectedItem) : placeholder}
        </span>
        <ChevronDown
          size={14}
          className={`shrink-0 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </div>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg">
          <div className="p-2 border-b border-gray-100">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                autoFocus
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Caută…"
                className="w-full pl-7 pr-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>
          <ul className="max-h-48 overflow-y-auto py-1">
            {value && (
              <li
                onClick={() => select('')}
                className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 text-gray-400 select-none"
              >
                — {placeholder} —
              </li>
            )}
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-sm text-gray-400">Nu am găsit rezultate.</li>
            ) : (
              filtered.map((item) => {
                const key = getKey(item)
                const active = key === value
                return (
                  <li
                    key={key}
                    onClick={() => select(key)}
                    className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 select-none ${active ? 'text-brand-700 font-medium bg-blue-50' : 'text-gray-700'}`}
                  >
                    {getLabel(item)}
                  </li>
                )
              })
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
