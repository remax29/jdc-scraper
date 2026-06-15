import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const placement = searchParams.get('placement') ?? 'all'

  const supabase = await createClient()

  // Determine user segment (null for unauthenticated visitors)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let segment: string | null = null
  if (user) {
    const adminClient = createAdminClient()
    const { data: profile } = await adminClient
      .from('profiles')
      .select('segment')
      .eq('id', user.id)
      .single()
    segment = profile?.segment ?? null
  }

  let query = supabase
    .from('in_app_messages')
    .select('id, title, body, cta_label, cta_url, placement, target_segment')
    .eq('active', true)

  if (placement !== 'all') {
    query = query.or(`placement.eq.${placement},placement.eq.all`)
  }

  const { data: messages } = await query

  // Filter by segment client-side (cheaper than complex SQL)
  const filtered = (messages ?? []).filter(
    (m) => m.target_segment === 'all' || !segment || m.target_segment === segment
  )

  return NextResponse.json({ messages: filtered })
}
