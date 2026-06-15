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
  const [error, setError] = useState('')

  async function handleRun(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
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
      router.push(`/results/${data.runId}`)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
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
