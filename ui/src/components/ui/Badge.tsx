interface Props {
  label: string
  variant?: 'default' | 'purple' | 'green' | 'red'
}

const variants = {
  default: 'bg-gray-100 text-gray-600',
  purple: 'bg-purple-100 text-purple-700',
  green: 'bg-green-100 text-green-700',
  red: 'bg-red-100 text-red-700',
}

export function Badge({ label, variant = 'default' }: Props) {
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${variants[variant]}`}>
      {label}
    </span>
  )
}
