import { useChildPhoto } from '@/hooks/use-child-photo'
import { UserRound } from 'lucide-react'
import type { Child } from '@/services/children.service'

export function ChildPhoto({ child, index }: { child: Child; index: number }) {
  const { src, onError } = useChildPhoto(child.id, child.photoKey)

  return (
    <div
      className={`avatar relative overflow-hidden ${['peach', 'lavender', 'mint', 'butter'][index % 4]}`}
    >
      <UserRound size={28} aria-hidden="true" />
      {src && (
        <img
          src={src}
          alt={`Fotografia lui ${child.name}`}
          className="absolute inset-0 h-full w-full object-cover"
          decoding="async"
          onError={onError}
        />
      )}
    </div>
  )
}
