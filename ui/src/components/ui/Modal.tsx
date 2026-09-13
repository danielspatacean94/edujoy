import { X } from 'lucide-react'
import { useEffect, useId, useRef } from 'react'

interface Props {
  title: string
  onClose: () => void
  children: React.ReactNode
}

export function Modal({ title, onClose, children }: Props) {
  const titleId = useId()
  const panel = useRef<HTMLDivElement>(null)
  const closeRef = useRef(onClose)
  closeRef.current = onClose
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const focusable = () => Array.from(panel.current?.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href], [tabindex="0"]') ?? [])
    if (!panel.current?.contains(document.activeElement)) (focusable()[0] ?? panel.current)?.focus()
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeRef.current()
      if (event.key !== 'Tab') return
      const elements = focusable()
      const first = elements[0], last = elements[elements.length - 1]
      if (!first) { event.preventDefault(); panel.current?.focus(); return }
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => { document.removeEventListener('keydown', onKeyDown); document.body.style.overflow = previousOverflow; previous?.focus() }
  }, [])
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div ref={panel} role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1} className="w-full max-w-md max-h-[90dvh] overflow-y-auto bg-white rounded-xl shadow-xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 id={titleId} className="text-base font-semibold text-gray-900">{title}</h2>
          <button aria-label="Închide fereastra" onClick={onClose} className="p-1 rounded text-gray-400 hover:text-gray-600 transition-colors">
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
