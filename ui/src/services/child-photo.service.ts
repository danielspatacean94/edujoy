import { apiClient } from './api'

export async function loadChildPhoto(id: string) {
  const response = await apiClient.get<ArrayBuffer>(`/children/${id}/photo`, {
    responseType: 'arraybuffer',
  })
  const contentType = String(response.headers['content-type'] ?? '')
  const rawBytes = new Uint8Array(response.data)
  const rawText = new TextDecoder().decode(rawBytes).trimStart()
  if (contentType.includes('application/json') || rawText.startsWith('{')) {
    const parsed: unknown = JSON.parse(rawText)
    if (
      parsed &&
      typeof parsed === 'object' &&
      'type' in parsed &&
      'data' in parsed &&
      parsed.type === 'Buffer' &&
      Array.isArray(parsed.data)
    ) {
      const bytes = parsed.data.filter(
        (value): value is number => typeof value === 'number',
      )
      return new Blob([Uint8Array.from(bytes)], { type: 'image/jpeg' })
    }
  }
  return new Blob([response.data], { type: contentType || 'image/jpeg' })
}

export const CHILD_PHOTO_MAX_PIXELS = 400
export const CHILD_PHOTO_MAX_BYTES = 120 * 1024

export async function prepareChildPhoto(file: File) {
  if (!file.type.startsWith('image/'))
    throw new Error('Alege un fișier imagine.')
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(
    1,
    CHILD_PHOTO_MAX_PIXELS / bitmap.width,
    CHILD_PHOTO_MAX_PIXELS / bitmap.height,
  )
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(bitmap.width * scale))
  canvas.height = Math.max(1, Math.round(bitmap.height * scale))
  canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()
  let quality = 0.82
  let blob: Blob | null = null
  while (quality >= 0.42) {
    blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', quality),
    )
    if (blob && blob.size <= CHILD_PHOTO_MAX_BYTES) break
    quality -= 0.1
  }
  if (!blob || blob.size > CHILD_PHOTO_MAX_BYTES)
    throw new Error('Fotografia este prea mare. Alege o imagine mai simplă.')
  return new File([blob], 'child-photo.jpg', { type: 'image/jpeg' })
}
