import { useState } from 'react'
import { DatePicker } from 'antd'
import dayjs from 'dayjs'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import type { AppBanner, CreateBannerDto, UpdateBannerDto } from '@/services/banners.service'
import { BANNER_STYLES, type BannerStyle } from '@shared/types/banner'

const BANNER_STYLE_LABELS: Record<BannerStyle, string> = {
  ANNOUNCEMENT: 'Simple announcement',
  CELEBRATION: 'Celebration 🎉',
}

function DateInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <DatePicker
        format="DD/MM/YYYY"
        value={value ? dayjs(value) : null}
        onChange={(d) => onChange(d ? d.format('YYYY-MM-DD') : '')}
        inputReadOnly
        className="w-full"
      />
    </div>
  )
}

function FormError({ message }: { message: string }) {
  return (
    <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">{message}</p>
  )
}

function DialogActions({ onClose, submitting, label }: {
  onClose: () => void
  submitting: boolean
  label: string
}) {
  return (
    <div className="flex justify-end gap-2 pt-1">
      <Button type="button" variant="secondary" size="sm" onClick={onClose}>
        Cancel
      </Button>
      <Button type="submit" size="sm" disabled={submitting}>
        {submitting ? `${label}…` : label}
      </Button>
    </div>
  )
}

interface BannerForm {
  message: string
  startDate: string
  endDate: string
  style: BannerStyle
}

function BannerFields({ form, set }: {
  form: BannerForm
  set: <K extends keyof BannerForm>(key: K, value: BannerForm[K]) => void
}) {
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
        <textarea
          required
          value={form.message}
          onChange={(e) => set('message', e.target.value)}
          rows={4}
          className="w-full text-sm border border-slate-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
          placeholder="The message shown in the header"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <DateInput label="Start date" value={form.startDate} onChange={(v) => set('startDate', v)} />
        <DateInput label="End date" value={form.endDate} onChange={(v) => set('endDate', v)} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Style</label>
        <select
          value={form.style}
          onChange={(e) => set('style', e.target.value as BannerStyle)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          {BANNER_STYLES.map((style) => (
            <option key={style} value={style}>{BANNER_STYLE_LABELS[style]}</option>
          ))}
        </select>
      </div>
    </div>
  )
}

export function CreateBannerDialog({ onClose, onSubmit }: {
  onClose: () => void
  onSubmit: (data: CreateBannerDto) => Promise<void>
}) {
  const [form, setForm] = useState<BannerForm>({
    message: '',
    startDate: '',
    endDate: '',
    style: 'ANNOUNCEMENT',
  })
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const set = <K extends keyof BannerForm>(key: K, value: BannerForm[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!form.startDate || !form.endDate) {
      setError('Select a start date and an end date.')
      return
    }
    setSaving(true)
    try {
      await onSubmit(form)
      onClose()
    } catch {
      setError('Failed to create banner. Please try again.')
      setSaving(false)
    }
  }

  return (
    <Modal title="New banner" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <FormError message={error} />}
        <BannerFields form={form} set={set} />
        <DialogActions onClose={onClose} submitting={saving} label="Create" />
      </form>
    </Modal>
  )
}

export function EditBannerDialog({ banner, onClose, onSubmit }: {
  banner: AppBanner
  onClose: () => void
  onSubmit: (data: UpdateBannerDto) => Promise<void>
}) {
  const [form, setForm] = useState<BannerForm>({
    message: banner.message,
    startDate: banner.startDate.slice(0, 10),
    endDate: banner.endDate.slice(0, 10),
    style: banner.style,
  })
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const set = <K extends keyof BannerForm>(key: K, value: BannerForm[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSaving(true)
    try {
      await onSubmit(form)
      onClose()
    } catch {
      setError('Failed to update banner. Please try again.')
      setSaving(false)
    }
  }

  return (
    <Modal title="Edit banner" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <FormError message={error} />}
        <BannerFields form={form} set={set} />
        <DialogActions onClose={onClose} submitting={saving} label="Save" />
      </form>
    </Modal>
  )
}

export function DeleteBannerDialog({ banner, onClose, onConfirm }: {
  banner: AppBanner
  onClose: () => void
  onConfirm: () => Promise<void>
}) {
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleConfirm = async () => {
    setError(null)
    setDeleting(true)
    try {
      await onConfirm()
      onClose()
    } catch {
      setError('Failed to delete banner. Please try again.')
      setDeleting(false)
    }
  }

  return (
    <Modal title="Delete banner" onClose={onClose}>
      <div className="space-y-4">
        {error && <FormError message={error} />}
        <p className="text-sm text-gray-600">
          Are you sure you want to delete the banner{' '}
          <span className="font-medium text-gray-900">"{banner.message}"</span>?
          This action cannot be undone.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={onClose}>Cancel</Button>
          <Button variant="danger" size="sm" onClick={handleConfirm} disabled={deleting}>
            {deleting ? 'Deleting…' : 'Delete'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
