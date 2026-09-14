import { useChildPhoto } from '@/hooks/use-child-photo'
import type { AttendanceDetail } from '@/services/attendance.service'

export function AttendanceChildPhoto({
  child,
}: {
  child: AttendanceDetail['children'][number]
}) {
  const { src, onError } = useChildPhoto(child.id, child.photoKey)
  return src ? (
    <img
      src={src}
      alt={`Fotografia lui ${child.name}`}
      loading="lazy"
      className="absolute inset-0 h-full w-full object-cover"
      decoding="async"
      onError={onError}
    />
  ) : null
}
