import { useState, useRef, useEffect } from 'react'
import { ChevronDown, X, Search } from 'lucide-react'

interface Props<T> {
  items: T[]
  selected: string[]
  getKey: (item: T) => string
  getLabel: (item: T) => string
  onChange: (keys: string[]) => void
  placeholder?: string
}

export function MultiSelect<T>({
  items,
  selected,
  getKey,
  getLabel,
  onChange,
  placeholder = 'Select…',
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

  const toggle = (key: string) => {
    onChange(selected.includes(key) ? selected.filter((k) => k !== key) : [...selected, key])
  }

  const remove = (key: string, e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(selected.filter((k) => k !== key))
  }

  const selectedItems = items.filter((item) => selected.includes(getKey(item)))

  return (
    <div ref={ref} className="relative">
      <div
        onClick={() => setOpen((o) => !o)}
        className="min-h-[38px] w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm cursor-pointer flex flex-wrap gap-1 items-center hover:border-gray-400 transition-colors"
      >
        {selectedItems.length === 0 ? (
          <span className="text-gray-400 px-1 py-0.5 select-none">{placeholder}</span>
        ) : (
          selectedItems.map((item) => {
            const key = getKey(item)
            return (
              <span
                key={key}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-brand-700 border border-blue-100 text-xs font-medium"
              >
                {getLabel(item)}
                <button
                  type="button"
                  onClick={(e) => remove(key, e)}
                  className="text-brand-400 hover:text-brand-700 transition-colors"
                >
                  <X size={11} />
                </button>
              </span>
            )
          })
        )}
        <ChevronDown
          size={14}
          className={`ml-auto shrink-0 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
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
                placeholder="Search…"
                className="w-full pl-7 pr-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>
          <ul className="max-h-48 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-sm text-gray-400">No results.</li>
            ) : (
              filtered.map((item) => {
                const key = getKey(item)
                const checked = selected.includes(key)
                return (
                  <li
                    key={key}
                    onClick={() => toggle(key)}
                    className="flex items-center gap-2.5 px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 select-none"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      readOnly
                      className="rounded border-gray-300 text-brand-700 focus:ring-brand-500 pointer-events-none"
                    />
                    <span className={checked ? 'text-gray-900 font-medium' : 'text-gray-600'}>
                      {getLabel(item)}
                    </span>
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
