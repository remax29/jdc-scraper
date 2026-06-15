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

  // Create the run row immediately with status 'pending'
  const { data: run, error: runErr } = await supabase
    .from('runs')
    .insert({
      user_id: user.id,
      keywords: Array.isArray(keywords) ? keywords : [],
      lead_count: 0,
      status: 'pending',
    })
    .select('id')
    .single()

  if (runErr || !run) {
    return NextResponse.json({ error: 'Failed to create run.' }, { status: 500 })
  }

  // Fire-and-forget: send to n8n with runId so it can POST back to /api/run/callback
  // Keys are forwarded but never logged or persisted
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? ''
  fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shared-Secret': sharedSecret,
    },
    body: JSON.stringify({
      runId: run.id,
      callbackUrl: `${siteUrl}/api/run/callback`,
      target,
      keywords,
      apify_token,
      apollo_key,
      hunter_key,
    }),
  }).catch((err) => console.error('[api/run] n8n fire-and-forget error:', err))

  // Return immediately — client will poll /api/run/status/:runId
  return NextResponse.json({ runId: run.id })
}
