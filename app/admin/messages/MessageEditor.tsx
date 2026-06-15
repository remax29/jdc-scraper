'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Message = {
  id: string
  title: string | null
  body: string
  cta_label: string | null
  cta_url: string | null
  image_url: string | null
  placement: string
  target_segment: string
  active: boolean
  created_at: string
  view_count: number
  click_count: number
}

const EMPTY: Omit<Message, 'id' | 'created_at' | 'view_count' | 'click_count'> = {
  title: '',
  body: '',
  cta_label: '',
  cta_url: '',
  image_url: '',
  placement: 'dashboard',
  target_segment: 'all',
  active: true,
}

const PLACEMENTS = ['dashboard', 'results', 'landing', 'all']
const SEGMENTS = ['all', 'corporate', 'solo']

function timeLive(createdAt: string): string {
  const diffMs = Date.now() - new Date(createdAt).getTime()
  const hrs = Math.floor(diffMs / (1000 * 60 * 60))
  if (hrs < 1) return 'just now'
  if (hrs < 24) return `${hrs}h`
  const days = Math.floor(hrs / 24)
  const rem = hrs % 24
  return rem > 0 ? `${days}d ${rem}h` : `${days}d`
}

function BannerForm({
  value,
  onChange,
  onSave,
  onCancel,
  saving,
  saveLabel,
  statusMsg,
}: {
  value: Omit<Message, 'id' | 'created_at' | 'view_count' | 'click_count'>
  onChange: (v: typeof value) => void
  onSave: () => void
  onCancel?: () => void
  saving: boolean
  saveLabel: string
  statusMsg: string
}) {
  const set = (k: keyof typeof value, v: string | boolean) =>
    onChange({ ...value, [k]: v })

  return (
    <div className="space-y-3">
      <input
        placeholder="Title (optional)"
        value={value.title ?? ''}
        onChange={(e) => set('title', e.target.value)}
        className="input-dark"
      />
      <textarea
        placeholder="Body text *"
        value={value.body}
        onChange={(e) => set('body', e.target.value)}
        rows={3}
        className="input-dark resize-none"
      />
      <div className="flex gap-3">
        <input
          placeholder="CTA label"
          value={value.cta_label ?? ''}
          onChange={(e) => set('cta_label', e.target.value)}
          className="input-dark flex-1"
        />
        <input
          placeholder="CTA URL"
          value={value.cta_url ?? ''}
          onChange={(e) => set('cta_url', e.target.value)}
          className="input-dark flex-1"
        />
      </div>
      <input
        placeholder="Image URL (the clickable image shown to users)"
        value={value.image_url ?? ''}
        onChange={(e) => set('image_url', e.target.value)}
        className="input-dark"
      />
      {value.image_url && (
        <div className="rounded-lg overflow-hidden" style={{ height: 100, width: 160 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value.image_url} alt="preview" className="w-full h-full object-cover" />
        </div>
      )}
      <div className="flex gap-3 flex-wrap">
        <select
          value={value.placement}
          onChange={(e) => set('placement', e.target.value)}
          className="input-dark w-auto"
        >
          {PLACEMENTS.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <select
          value={value.target_segment}
          onChange={(e) => set('target_segment', e.target.value)}
          className="input-dark w-auto"
        >
          {SEGMENTS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <label className="flex items-center gap-2 text-sm text-jdc-muted cursor-pointer">
          <input
            type="checkbox"
            checked={value.active}
            onChange={(e) => set('active', e.target.checked)}
            className="h-4 w-4 rounded"
          />
          Active
        </label>
      </div>
      {statusMsg && (
        <p className={`text-sm ${statusMsg.startsWith('Error') ? 'text-red-400' : 'text-jdc-cyan'}`}>
          {statusMsg}
        </p>
      )}
      <div className="flex gap-3">
        <button
          onClick={onSave}
          disabled={saving || !value.body}
          className="btn-primary px-5 py-2 text-sm disabled:opacity-60"
        >
          {saving ? 'Saving…' : saveLabel}
        </button>
        {onCancel && (
          <button onClick={onCancel} className="text-sm text-jdc-dim hover:text-white transition-colors px-3">
            Cancel
          </button>
        )}
      </div>
    </div>
  )
}

export default function MessageEditor({
  messages: initial,
  adminId,
}: {
  messages: Message[]
  adminId: string
}) {
  const [messages, setMessages] = useState(initial)
  const [createForm, setCreateForm] = useState(EMPTY)
  const [creating, setCreating] = useState(false)
  const [createMsg, setCreateMsg] = useState('')
  const [showCreate, setShowCreate] = useState(false)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState(EMPTY)
  const [editSaving, setEditSaving] = useState(false)
  const [editMsg, setEditMsg] = useState('')

  const supabase = createClient()

  async function create() {
    setCreating(true); setCreateMsg('')
    const { data, error } = await supabase
      .from('in_app_messages')
      .insert({ ...createForm, created_by: adminId })
      .select()
      .single()
    if (error) { setCreateMsg(`Error: ${error.message}`); setCreating(false); return }
    setMessages((m) => [{ ...(data as Message), view_count: 0, click_count: 0 }, ...m])
    setCreateForm(EMPTY)
    setCreateMsg('Banner created.')
    setShowCreate(false)
    setCreating(false)
  }

  function startEdit(m: Message) {
    setEditingId(m.id)
    setEditForm({
      title: m.title,
      body: m.body,
      cta_label: m.cta_label,
      cta_url: m.cta_url,
      image_url: m.image_url,
      placement: m.placement,
      target_segment: m.target_segment,
      active: m.active,
    })
    setEditMsg('')
  }

  async function saveEdit() {
    if (!editingId) return
    setEditSaving(true); setEditMsg('')
    const { error } = await supabase
      .from('in_app_messages')
      .update(editForm)
      .eq('id', editingId)
    if (error) { setEditMsg(`Error: ${error.message}`); setEditSaving(false); return }
    setMessages((m) =>
      m.map((x) => x.id === editingId ? { ...x, ...editForm } : x)
    )
    setEditingId(null)
    setEditSaving(false)
  }

  async function toggleActive(id: string, current: boolean) {
    await supabase.from('in_app_messages').update({ active: !current }).eq('id', id)
    setMessages((m) => m.map((x) => x.id === id ? { ...x, active: !current } : x))
  }

  async function remove(id: string) {
    if (!confirm('Delete this banner?')) return
    await supabase.from('in_app_messages').delete().eq('id', id)
    setMessages((m) => m.filter((x) => x.id !== id))
  }

  return (
    <div className="space-y-4">
      {/* Create new toggle */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-jdc-dim">{messages.length} banner{messages.length !== 1 ? 's' : ''}</p>
        <button
          onClick={() => { setShowCreate((s) => !s); setCreateMsg('') }}
          className="btn-primary px-4 py-2 text-sm"
        >
          {showCreate ? '✕ Cancel' : '+ New banner'}
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="card-glass rounded-2xl p-6 space-y-4">
          <h3 className="font-semibold text-white text-sm">New banner</h3>
          <BannerForm
            value={createForm}
            onChange={setCreateForm}
            onSave={create}
            saving={creating}
            saveLabel="Create banner"
            statusMsg={createMsg}
          />
        </div>
      )}

      {/* Banner list */}
      {messages.length === 0 && !showCreate && (
        <div className="card-glass rounded-2xl p-10 text-center text-jdc-dim text-sm">
          No banners yet. Create one above.
        </div>
      )}

      {messages.map((m) => (
        <div
          key={m.id}
          className={`card-glass rounded-2xl overflow-hidden transition-opacity ${!m.active ? 'opacity-50' : ''}`}
        >
          {/* Banner preview + info row */}
          <div className="flex gap-4 p-4 items-start">
            {/* Image thumbnail */}
            <div
              className="flex-none rounded-lg overflow-hidden"
              style={{
                width: 100,
                height: 66,
                background: m.image_url
                  ? `url('${m.image_url}') center/cover no-repeat #0a0a1a`
                  : 'linear-gradient(135deg, rgba(0,102,255,0.2), rgba(0,212,255,0.08))',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            />

            {/* Info */}
            <div className="flex-1 min-w-0">
              {m.title && (
                <p className="text-white text-sm font-semibold truncate">{m.title}</p>
              )}
              <p className="text-jdc-dim text-xs mt-0.5 line-clamp-2">{m.body}</p>

              {/* Stats row */}
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-jdc-dim">
                <span style={{ color: 'rgba(0,212,255,0.7)' }}>
                  👁 {(m.view_count ?? 0).toLocaleString()} views
                </span>
                <span style={{ color: 'rgba(124,58,237,0.8)' }}>
                  🖱 {(m.click_count ?? 0).toLocaleString()} clicks
                </span>
                {m.created_at && (
                  <span>Live {timeLive(m.created_at)}</span>
                )}
                <span className="text-jdc-dim">
                  {m.placement} · {m.target_segment}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => (editingId === m.id ? setEditingId(null) : startEdit(m))}
                className="text-xs px-2.5 py-1 rounded-full font-medium transition-colors"
                style={{
                  background: editingId === m.id ? 'rgba(0,212,255,0.15)' : 'rgba(255,255,255,0.06)',
                  color: editingId === m.id ? '#00d4ff' : '#a8b2d8',
                  border: `1px solid ${editingId === m.id ? 'rgba(0,212,255,0.3)' : 'rgba(255,255,255,0.08)'}`,
                }}
              >
                {editingId === m.id ? 'Close' : 'Edit'}
              </button>
              <button
                onClick={() => toggleActive(m.id, m.active)}
                className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  m.active
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-white/5 text-jdc-dim'
                }`}
              >
                {m.active ? 'Live' : 'Off'}
              </button>
              <button
                onClick={() => remove(m.id)}
                className="text-xs px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>

          {/* Inline edit panel */}
          {editingId === m.id && (
            <div
              className="px-4 pb-4 pt-0 space-y-3"
              style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
            >
              <p className="text-xs text-jdc-dim pt-3 font-medium uppercase tracking-widest">Edit banner</p>
              <BannerForm
                value={editForm}
                onChange={setEditForm}
                onSave={saveEdit}
                onCancel={() => setEditingId(null)}
                saving={editSaving}
                saveLabel="Save changes"
                statusMsg={editMsg}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
