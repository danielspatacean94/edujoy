import { useEffect, useState } from 'react'
import { childrenService } from '@/services/children.service'

export function useChildPhoto(
  childId: string | undefined,
  photoKey: string | null,
) {
  const [src, setSrc] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    let objectUrl = ''
    setSrc(null)
    if (!childId || !photoKey) return
    void childrenService
      .photo(childId)
      .then((blob) => {
        if (!active || !blob.size) return
        objectUrl = URL.createObjectURL(blob)
        setSrc(objectUrl)
      })
      .catch(() => {
        if (active) setSrc(null)
      })
    return () => {
      active = false
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [childId, photoKey])

  return { src, onError: () => setSrc(null) }
}
