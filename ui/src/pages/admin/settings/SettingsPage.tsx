import { useEffect, useState } from 'react'
import { Save } from 'lucide-react'
import { Spinner } from '@/components/ui/Spinner'
import { Button } from '@/components/ui/Button'
import { settingsService } from '@/services/settings.service'

export function SettingsPage() {
  const [raw, setRaw] = useState('{}')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    settingsService.get()
      .then(({ data }) => setRaw(JSON.stringify(data.global ?? {}, null, 2)))
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setError(null)
    setSaved(false)

    let parsed: Record<string, unknown>
    try {
      parsed = JSON.parse(raw)
      if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
        throw new Error('not an object')
      }
    } catch {
      setError('Invalid JSON — must be a valid JSON object.')
      return
    }

    setSaving(true)
    try {
      const { data } = await settingsService.update(parsed)
      setRaw(JSON.stringify(data.global ?? {}, null, 2))
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      setError('Save failed. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="max-w-2xl">
      <p className="text-base text-gray-500 mb-6">
        Edit app-wide configuration. This is an open-ended JSON blob for now — give it real, typed
        fields (and a proper form) once specific settings requirements are known.
      </p>

      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Settings (JSON)</label>
          <textarea
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            spellCheck={false}
            rows={14}
            className="w-full px-3 py-2 text-sm font-mono border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
        )}

        {saved && (
          <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">Settings saved.</p>
        )}

        <Button onClick={handleSave} disabled={saving} className="flex items-center gap-2">
          <Save size={14} />
          {saving ? 'Saving…' : 'Save'}
        </Button>
      </div>
    </div>
  )
}
