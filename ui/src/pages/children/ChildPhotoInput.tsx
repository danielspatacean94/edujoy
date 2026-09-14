import { useChildPhoto } from '@/hooks/use-child-photo'
import { useEffect, useState } from 'react'
import { ImagePlus, UserRound } from 'lucide-react'

export function ChildPhotoInput({
  childId,
  photoKey,
  file,
  onChange,
}: {
  childId?: string
  photoKey: string | null
  file: File | null
  onChange: (file: File | null) => void
}) {
  const { src: savedPhoto, onError } = useChildPhoto(childId, photoKey)
  const [preview, setPreview] = useState('')
  useEffect(() => {
    if (!file) {
      setPreview('')
      return
    }
    const url = URL.createObjectURL(file)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [file])
  const src = preview || savedPhoto

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <p className="mb-2 text-sm font-medium text-gray-700">
        Fotografie (opțional)
      </p>
      <div className="flex items-center gap-3">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-amber-100 text-amber-700">
          {src ? (
            <img
              src={src}
              onError={onError}
              alt="Previzualizare fotografie"
              className="h-full w-full object-cover"
            />
          ) : (
            <UserRound size={28} strokeWidth={1.5} />
          )}
        </div>
        <label
          htmlFor="child-photo"
          className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <ImagePlus size={16} />
          Alege fotografia
          <input
            id="child-photo"
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(event) => onChange(event.target.files?.[0] ?? null)}
          />
        </label>
      </div>
      <p className="mt-2 text-xs text-gray-500">
        Redimensionare automată: maximum 400×400 px și 120 KB.
      </p>
    </div>
  )
}
