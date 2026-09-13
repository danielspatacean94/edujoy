import { X } from 'lucide-react'

interface Props {
  title: string
  onClose: () => void
  children: React.ReactNode
}

export function Modal({ title, onClose, children }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-gray-900">{title}</h2>
          <button onClick={onClose} className="p-1 rounded text-gray-400 hover:text-gray-600 transition-colors">
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
