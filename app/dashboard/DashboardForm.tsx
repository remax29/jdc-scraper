'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PROVIDERS } from '@/lib/providers'

export default function DashboardForm() {
  const router = useRouter()
  const [target, setTarget] = useState('')
  const [keywords, setKeywords] = useState('')
  const [keys, setKeys] = useState({ apify: '', apollo: '', hunter: '' })
  const [loading, setLoading] = useState(false)
  const [statusMsg, setStatusMsg] = useState('')
  const [error, setError] = useState('')

  async function pollStatus(runId: string) {
    const INTERVAL = 3000
    const MAX_WAIT = 5 * 60 * 1000 // 5 minutes
    const started = Date.now()

    return new Promise<void>((resolve, reject) => {
      const tick = async () => {
        if (Date.now() - started > MAX_WAIT) {
          reject(new Error('Scrape timed out. Please try again.'))
          return
        }
        try {
          const res = await fetch(`/api/run/status/${runId}`)
          const data = await res.json()
          if (data.status === 'done') {
            resolve()
            router.push(`/results/${runId}`)
          } else if (data.status === 'error') {
            reject(new Error('Scrape failed. Check your API keys and try again.'))
          } else {
            setTimeout(tick, INTERVAL)
          }
        } catch {
          reject(new Error('Network error while checking status.'))
        }
      }
      setTimeout(tick, INTERVAL)
    })
  }

  async function handleRun(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    setStatusMsg('Starting scrape…')
    try {
      const res = await fetch('/api/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target,
          keywords: keywords.split(',').map((k) => k.trim()).filter(Boolean),
          apify_token: keys.apify,
          apollo_key: keys.apollo,
          hunter_key: keys.hunter,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Run failed.'); return }

      setStatusMsg('Scraping in progress — this takes 30–90 seconds…')
      await pollStatus(data.runId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setLoading(false)
      setStatusMsg('')
    }
  }

  return (
    <form onSubmit={handleRun} className="space-y-6">
      {/* Target */}
      <div>
        <label htmlFor="target" className="block text-sm font-semibold text-white mb-1">
          What do you want to scrape?
        </label>
        <textarea
          id="target"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          required
          rows={2}
          placeholder="e.g. dental clinics in Cebu with no website, SaaS founders hiring marketers, agencies needing social media in Manila"
          className="input-dark resize-none"
        />
        <p className="text-xs text-jdc-dim mt-1">Any niche, any city, any role. The more specific, the better.</p>
      </div>

      {/* Optional keywords */}
      <div>
        <label htmlFor="keywords" className="block text-sm font-medium text-jdc-muted mb-1">
          Keywords to refine <span className="text-jdc-dim font-normal">(optional, comma-separated)</span>
        </label>
        <input
          id="keywords"
          type="text"
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
          placeholder="e.g. dental, clinic, dentist"
          className="input-dark"
        />
      </div>

      {/* API keys */}
      <div className="rounded-xl p-5 space-y-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <p className="text-sm font-semibold text-white">
          Your API keys <span className="text-jdc-dim font-normal">(session only — never saved)</span>
        </p>
        {PROVIDERS.map((p) => (
          <div key={p.id}>
            <label htmlFor={`key-${p.id}`} className="block text-sm font-medium text-jdc-muted mb-1">
              {p.keyLabel}
              <a
                href={p.affiliateUrl}
                target="_blank"
                rel="sponsored noopener noreferrer"
                className="ml-2 text-jdc-cyan text-xs hover:text-jdc-cyan-l transition-colors"
              >
                Get your key →
              </a>
            </label>
            <input
              id={`key-${p.id}`}
              type="password"
              placeholder={p.keyPlaceholder}
              value={keys[p.id as keyof typeof keys]}
              onChange={(e) => setKeys((k) => ({ ...k, [p.id]: e.target.value }))}
              required
              autoComplete="off"
              className="input-dark font-mono"
            />
            <p className="text-xs text-jdc-dim mt-0.5">{p.keyInstructions}</p>
          </div>
        ))}

        <p className="text-xs text-jdc-dim pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          Some links above are affiliate links. If you sign up through them, JDC Tech Solutions
          may earn a commission at no extra cost to you.{' '}
          <a href="/affiliate-disclosure" className="underline hover:text-jdc-muted transition-colors">Learn more</a>
        </p>
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}
      {loading && statusMsg && (
        <div className="flex items-center gap-3 text-sm text-jdc-muted">
          <svg className="animate-spin h-4 w-4 text-jdc-cyan" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          {statusMsg}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full py-3 text-sm disabled:opacity-60"
      >
        {loading ? 'Scraping…' : 'Run scrape →'}
      </button>
    </form>
  )
}
