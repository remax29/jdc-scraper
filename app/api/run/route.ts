import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// In-memory per-user rate limiter: 10 runs / hour
const rateMap = new Map<string, { count: number; resetAt: number }>()
const LIMIT = 10
const WINDOW = 60 * 60 * 1000

function checkRate(userId: string): boolean {
  const now = Date.now()
  const entry = rateMap.get(userId)
  if (!entry || now > entry.resetAt) {
    rateMap.set(userId, { count: 1, resetAt: now + WINDOW })
    return true
  }
  if (entry.count >= LIMIT) return false
  entry.count++
  return true
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (!checkRate(user.id)) {
    return NextResponse.json({ error: 'Rate limit reached (10 runs/hour). Try again later.' }, { status: 429 })
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 })
  }

  const { target, keywords, apify_token, apollo_key, hunter_key } = body as Record<string, string | string[]>

  if (!target || typeof target !== 'string' || !target.trim()) {
    return NextResponse.json({ error: 'target is required.' }, { status: 400 })
  }
  if (!apify_token || !apollo_key || !hunter_key) {
    return NextResponse.json({ error: 'All three API keys are required.' }, { status: 400 })
  }

  const webhookUrl = process.env.N8N_WEBHOOK_URL
  const sharedSecret = process.env.N8N_SHARED_SECRET ?? ''
  if (!webhookUrl) {
    return NextResponse.json({ error: 'n8n not configured on this server.' }, { status: 500 })
  }

  // Keys forwarded to n8n — never logged, never persisted
  let leads: Record<string, string>[] = []
  try {
    const n8nRes = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shared-Secret': sharedSecret,
      },
      body: JSON.stringify({ target, keywords, apify_token, apollo_key, hunter_key }),
      signal: AbortSignal.timeout(120_000),
    })
    if (!n8nRes.ok) throw new Error(`n8n ${n8nRes.status}`)
    const raw = await n8nRes.json()
    leads = Array.isArray(raw) ? raw : []
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[api/run] n8n error:', msg)
    return NextResponse.json(
      { error: 'Scrape failed. Check your API keys and try again.' },
      { status: 502 }
    )
  }

  // Persist run + leads (no key data stored)
  const { data: run, error: runErr } = await supabase
    .from('runs')
    .insert({ user_id: user.id, keywords: Array.isArray(keywords) ? keywords : [], lead_count: leads.length })
    .select('id')
    .single()

  if (runErr || !run) {
    return NextResponse.json({ error: 'Failed to save run.' }, { status: 500 })
  }

  if (leads.length > 0) {
    await supabase.from('leads').insert(
      leads.map((l) => ({
        run_id: run.id,
        user_id: user.id,
        company: l.company ?? '',
        contact_name: l.contact_name ?? l.name ?? '',
        title: l.title ?? l.job_title ?? '',
        email: l.email ?? '',
        email_status: l.email_status ?? l.emailStatus ?? 'unknown',
        source_url: l.source_url ?? l.url ?? '',
      }))
    )
  }

  return NextResponse.json({ runId: run.id, count: leads.length })
}
