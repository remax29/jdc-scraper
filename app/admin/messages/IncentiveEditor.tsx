'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Incentive = {
  id?: string
  active: boolean
  percent_off: number
  promo_code: string
  description: string
}

export default function IncentiveEditor({ current }: { current: Incentive }) {
  const [form, setForm] = useState(current)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const supabase = createClient()

  async function save() {
    setSaving(true); setMsg('')
    if (form.id) {
      await supabase.from('optin_incentive').update({
        percent_off: form.percent_off, promo_code: form.promo_code,
        description: form.description, active: form.active, updated_at: new Date().toISOString(),
      }).eq('id', form.id)
    } else {
      const { data } = await supabase.from('optin_incentive').insert({ ...form }).select().single()
      if (data) setForm(data as Incentive)
    }
    setMsg('Saved — new signups will see the updated offer immediately.')
    setSaving(false)
  }

  return (
    <div className="card-glass rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-display font-semibold text-white">Opt-in incentive (signup offer)</h2>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.active}
            onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))} className="h-4 w-4 rounded" />
          <span className="text-sm text-jdc-muted">Active</span>
        </label>
      </div>
      <div className="flex gap-4">
        <div>
          <label className="block text-xs font-medium text-jdc-dim mb-1">% off</label>
          <input type="number" min={1} max={100} value={form.percent_off}
            onChange={(e) => setForm((f) => ({ ...f, percent_off: Number(e.target.value) }))}
            className="input-dark w-24" />
        </div>
        <div className="flex-1">
          <label className="block text-xs font-medium text-jdc-dim mb-1">Promo code</label>
          <input value={form.promo_code} onChange={(e) => setForm((f) => ({ ...f, promo_code: e.target.value }))}
            className="input-dark font-mono" />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-jdc-dim mb-1">Description shown to user</label>
        <input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          placeholder="Get 15% off JDC automation & SMM service…" className="input-dark" />
      </div>
      {msg && <p className="text-sm text-jdc-cyan">{msg}</p>}
      <button onClick={save} disabled={saving} className="btn-primary px-5 py-2 text-sm disabled:opacity-50">
        {saving ? 'Saving…' : 'Save incentive'}
      </button>
    </div>
  )
}
