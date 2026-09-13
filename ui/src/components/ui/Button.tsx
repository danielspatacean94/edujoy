import type { ButtonHTMLAttributes } from 'react'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md'
}

const variants = {
  primary: 'bg-brand-800 text-white hover:bg-brand-700',
  secondary: 'border border-slate-200 text-slate-600 hover:bg-slate-50',
  danger: 'bg-red-600 text-white hover:bg-red-700',
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
}

export function Button({ variant = 'primary', size = 'md', className = '', ...props }: Props) {
  return (
    <button
      {...props}
      className={`rounded-lg font-medium transition-colors disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
    />
  )
}
