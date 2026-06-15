import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

// Called by n8n when scraping is complete — no user session, verified by shared secret
export async function POST(request: Request) {
  const secret = request.headers.get('x-shared-secret') ?? ''
  if (!secret || secret !== process.env.N8N_SHARED_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 })
  }

  const { runId, leads, error: n8nError } = body as {
    runId: string
    leads?: Record<string, string>[]
    error?: string
  }

  if (!runId) {
    return NextResponse.json({ error: 'runId is required.' }, { status: 400 })
  }

  const supabase = createAdminClient()

  // If n8n reported an error, mark the run as failed
  if (n8nError) {
    await supabase.from('runs').update({ status: 'error' }).eq('id', runId)
    return NextResponse.json({ ok: true })
  }

  const safeLeads = Array.isArray(leads) ? leads : []

  if (safeLeads.length > 0) {
    // Fetch user_id from the run row (needed for RLS on leads)
    const { data: run } = await supabase
      .from('runs')
      .select('user_id')
      .eq('id', runId)
      .single()

    if (run) {
      await supabase.from('leads').insert(
        safeLeads.map((l) => ({
          run_id: runId,
          user_id: run.user_id,
          company: l.company ?? '',
          contact_name: l.contact_name ?? l.name ?? '',
          title: l.title ?? l.job_title ?? '',
          email: l.email ?? '',
          email_status: l.email_status ?? l.emailStatus ?? 'unknown',
          source_url: l.source_url ?? l.url ?? '',
        }))
      )
    }
  }

  await supabase
    .from('runs')
    .update({ status: 'done', lead_count: safeLeads.length })
    .eq('id', runId)

  return NextResponse.json({ ok: true })
}
