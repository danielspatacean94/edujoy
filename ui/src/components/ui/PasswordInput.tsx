import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import type { InputHTMLAttributes } from 'react'

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>

export function PasswordInput({ className = '', ...props }: Props) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="relative">
      <input
        {...props}
        type={visible ? 'text' : 'password'}
        className={`w-full border border-slate-300 rounded px-3 py-2 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 ${className}`}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute inset-y-0 right-0 flex items-center px-2.5 text-gray-400 hover:text-gray-600 transition-colors"
        tabIndex={-1}
      >
        {visible ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
    </div>
  )
}
