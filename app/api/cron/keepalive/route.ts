import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const secret = request.headers.get('x-cron-secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const admin = createAdminClient()

  // Insert ping
  const { error } = await admin.from('keepalive').insert({})
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Cleanup rows older than 7 days
  await admin
    .from('keepalive')
    .delete()
    .lt('pinged_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

  return NextResponse.json({ ok: true, at: new Date().toISOString() })
}
