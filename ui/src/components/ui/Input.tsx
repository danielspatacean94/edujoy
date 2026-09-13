import type { InputHTMLAttributes } from 'react'

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export function Input({ label, className = '', ...props }: Props) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      <input
        {...props}
        className={`border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 ${className}`}
      />
    </div>
  )
}
