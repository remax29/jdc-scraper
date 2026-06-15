import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { id, event } = await req.json()
    if (!id || !['view', 'click'].includes(event)) {
      return NextResponse.json({ error: 'Bad request' }, { status: 400 })
    }

    const admin = createAdminClient()
    const col = event === 'view' ? 'view_count' : 'click_count'

    const { data: row } = await admin
      .from('in_app_messages')
      .select(col)
      .eq('id', id)
      .single()

    if (row) {
      await admin
        .from('in_app_messages')
        .update({ [col]: ((row as Record<string, number>)[col] ?? 0) + 1 })
        .eq('id', id)
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
