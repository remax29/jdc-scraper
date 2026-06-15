'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Profile {
  full_name: string
  use_case: string
  marketing_opt_in: boolean
  unsubscribed: boolean
}

export default function SettingsForm({ email, profile }: { email: string; profile: Profile }) {
  const router = useRouter()
  const [name, setName] = useState(profile.full_name)
  const [unsubscribed, setUnsubscribed] = useState(profile.unsubscribed)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')
  const supabase = createClient()

  async function saveProfile() {
    setSaving(true); setMsg(''); setError('')
    const res = await fetch('/api/settings/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ full_name: name, unsubscribed }),
    })
    const data = await res.json()
    if (res.ok) setMsg('Saved.')
    else setError(data.error ?? 'Failed to save.')
    setSaving(false)
  }

  async function deleteAccount() {
    if (!confirm('Delete your account and all data? This cannot be undone.')) return
    setDeleting(true)
    const res = await fetch('/api/settings/delete', { method: 'DELETE' })
    if (res.ok) { await supabase.auth.signOut(); router.push('/') }
    else { setError('Failed to delete account.'); setDeleting(false) }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs text-jdc-dim font-medium uppercase tracking-widest mb-3">Account</p>
        <div className="text-sm text-jdc-dim mb-4">
          Email: <span className="text-white font-medium">{email}</span>
        </div>
        <label className="block text-sm font-medium text-jdc-muted mb-1">Full name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} className="input-dark" />
      </div>

      <div className="pt-5" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <p className="text-xs text-jdc-dim font-medium uppercase tracking-widest mb-3">Email preferences</p>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={unsubscribed} onChange={(e) => setUnsubscribed(e.target.checked)}
            className="h-4 w-4 rounded" />
          <span className="text-sm text-jdc-muted">Unsubscribe from marketing emails</span>
        </label>
        <p className="text-xs text-jdc-dim mt-2">Transactional emails (account, run confirmations) still apply.</p>
      </div>

      {msg && <p className="text-jdc-cyan text-sm">{msg}</p>}
      {error && <p className="text-red-400 text-sm">{error}</p>}

      <button onClick={saveProfile} disabled={saving} className="btn-primary px-5 py-2.5 text-sm disabled:opacity-50">
        {saving ? 'Saving…' : 'Save changes'}
      </button>

      <div className="pt-6 mt-2" style={{ borderTop: '1px solid rgba(255,50,50,0.15)' }}>
        <p className="text-xs text-jdc-dim font-medium uppercase tracking-widest mb-3">Danger zone</p>
        <button onClick={deleteAccount} disabled={deleting}
          className="text-sm text-red-400 px-4 py-2 rounded-lg disabled:opacity-60 transition-colors hover:text-red-300"
          style={{ border: '1px solid rgba(255,50,50,0.25)' }}>
          {deleting ? 'Deleting…' : 'Delete my account and all data'}
        </button>
      </div>
    </div>
  )
}
