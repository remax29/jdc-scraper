'use client'

import { useState } from 'react'

export default function AdminBulkComposer({ recipientCount }: { recipientCount: number }) {
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [segment, setSegment] = useState('all')
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<{ sent?: number; total?: number; error?: string } | null>(null)

  async function send() {
    if (!subject || !body) return
    if (!confirm(`Send to ${recipientCount} opted-in recipients? This cannot be undone.`)) return
    setSending(true); setResult(null)
    const res = await fetch('/api/admin/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject, body, segment }),
    })
    setResult(await res.json())
    setSending(false)
  }

  return (
    <div className="card-glass rounded-2xl p-8">
      <h2 className="text-lg font-display font-bold text-white mb-1">Bulk email</h2>
      <p className="text-sm text-jdc-dim mb-6">
        Sends only to opted-in, non-unsubscribed users. Scraped contacts are never emailed here.
      </p>
      <div className="space-y-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-jdc-muted mb-1">Subject</label>
            <input value={subject} onChange={(e) => setSubject(e.target.value)}
              placeholder="Your email subject" className="input-dark" />
          </div>
          <div>
            <label className="block text-sm font-medium text-jdc-muted mb-1">Segment</label>
            <select value={segment} onChange={(e) => setSegment(e.target.value)} className="input-dark">
              <option value="all">All opted-in</option>
              <option value="corporate">Corporate</option>
              <option value="solo">Solo</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-jdc-muted mb-1">
            Body <span className="text-jdc-dim font-normal">— use {'{{first_name}}'} for personalisation</span>
          </label>
          <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={6}
            placeholder={`Hi {{first_name}},\n\nYour message here...`}
            className="input-dark font-mono resize-y" />
          <p className="text-xs text-jdc-dim mt-1">Unsubscribe link added automatically to every email.</p>
        </div>
        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-jdc-dim">
            Live recipient count: <strong className="text-white">{recipientCount}</strong> opted-in users
          </p>
          <button onClick={send} disabled={sending || !subject || !body}
            className="btn-primary px-6 py-2.5 text-sm disabled:opacity-50">
            {sending ? 'Sending…' : 'Send campaign'}
          </button>
        </div>
        {result && (
          <div className={`rounded-lg px-4 py-3 text-sm ${result.error
            ? 'text-red-400 bg-red-500/10 border border-red-500/20'
            : 'text-jdc-cyan bg-jdc-cyan/10 border border-jdc-cyan/20'}`}>
            {result.error ?? `Sent to ${result.sent} of ${result.total} recipients.`}
          </div>
        )}
      </div>
    </div>
  )
}
