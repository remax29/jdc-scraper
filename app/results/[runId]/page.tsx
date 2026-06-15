import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import AppNav from '@/app/components/AppNav'
import InAppBanner from '@/app/components/InAppBanner'
import ExportButtons from './ExportButtons'
import type { LeadRow } from '@/lib/export'

interface Props {
  params: Promise<{ runId: string }>
}

export default async function ResultsPage({ params }: Props) {
  const { runId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: run } = await supabase
    .from('runs')
    .select('id, lead_count, keywords, created_at, user_id')
    .eq('id', runId)
    .single()

  if (!run || run.user_id !== user.id) notFound()

  const { data: leads } = await supabase
    .from('leads')
    .select('company, contact_name, title, email, email_status, source_url')
    .eq('run_id', runId)
    .order('created_at')

  const rows: LeadRow[] = (leads ?? []).map((l) => ({
    company: l.company ?? '',
    contact_name: l.contact_name ?? '',
    title: l.title ?? '',
    email: l.email ?? '',
    email_status: l.email_status ?? '',
    source_url: l.source_url ?? '',
  }))

  return (
    <div className="min-h-screen flex flex-col bg-jdc-bg">
      <AppNav />
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-10">
        <InAppBanner placement="results" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-display font-bold text-white">
              {run.lead_count ?? rows.length} leads found
            </h1>
            <p className="text-jdc-dim text-sm mt-1">
              {Array.isArray(run.keywords) && run.keywords.length
                ? `Keywords: ${run.keywords.join(', ')}`
                : 'Scrape results'}{' '}
              · {new Date(run.created_at as string).toLocaleString()}
            </p>
          </div>
          {rows.length > 0 && <ExportButtons leads={rows} />}
        </div>

        {rows.length === 0 ? (
          <div className="card-glass rounded-2xl p-12 text-center">
            <p className="text-jdc-dim">No leads found. Try a more specific target or different keywords.</p>
          </div>
        ) : (
          <div className="card-glass rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}>
                  <tr>
                    {['Company', 'Contact', 'Title', 'Email', 'Status', 'Source'].map((h) => (
                      <th key={h} className="text-left px-4 py-3 font-semibold text-jdc-dim text-xs uppercase tracking-wide">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {rows.map((row, i) => (
                    <tr key={i} className="hover:bg-white/3 transition-colors">
                      <td className="px-4 py-3 font-medium text-white">{row.company || '—'}</td>
                      <td className="px-4 py-3 text-jdc-muted">{row.contact_name || '—'}</td>
                      <td className="px-4 py-3 text-jdc-dim">{row.title || '—'}</td>
                      <td className="px-4 py-3 text-jdc-cyan font-mono text-xs">{row.email || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                          row.email_status === 'valid'
                            ? 'bg-green-500/20 text-green-400'
                            : row.email_status === 'invalid'
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-white/5 text-jdc-dim'
                        }`}>
                          {row.email_status || 'unknown'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {row.source_url ? (
                          <a href={row.source_url} target="_blank" rel="noopener noreferrer"
                            className="text-jdc-cyan hover:text-jdc-cyan-l transition-colors text-xs truncate max-w-30 inline-block">
                            link
                          </a>
                        ) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="mt-6 text-center">
          <a href="/dashboard" className="text-jdc-cyan text-sm hover:text-jdc-cyan-l transition-colors">← Run another scrape</a>
        </div>
      </main>
    </div>
  )
}
