import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { signToken } from '@/lib/unsubscribe'
import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { FROM } from '@/lib/email'

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { subject, body, segment } = await request.json()
  if (!subject || !body) return NextResponse.json({ error: 'subject and body required.' }, { status: 400 })

  const admin = createAdminClient()

  // Server-side admin check — never trust the client
  const { data: profile } = await admin
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()
  if (!profile?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  // Query opted-in, not unsubscribed recipients (NEVER from leads table)
  let query = admin
    .from('profiles')
    .select('id, email, full_name')
    .eq('marketing_opt_in', true)
    .eq('unsubscribed', false)

  if (segment && segment !== 'all') {
    query = query.eq('segment', segment)
  }

  const { data: recipients, error: recipErr } = await query
  if (recipErr) return NextResponse.json({ error: recipErr.message }, { status: 500 })
  if (!recipients || recipients.length === 0) {
    return NextResponse.json({ sent: 0 })
  }

  // Create campaign record
  const { data: campaign, error: campErr } = await admin
    .from('email_campaigns')
    .insert({ created_by: user.id, subject, body, target_segment: segment ?? 'all', sent_count: 0 })
    .select('id')
    .single()
  if (campErr || !campaign) return NextResponse.json({ error: 'Failed to create campaign.' }, { status: 500 })

  const resend = new Resend(process.env.RESEND_API_KEY)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  let sent = 0
  const sendRows: { campaign_id: string; recipient_id: string; status: string }[] = []

  for (const recipient of recipients) {
    const firstName = (recipient.full_name ?? '').split(' ')[0] || 'there'
    const personalised = body.replace(/\{\{first_name\}\}/g, firstName)
    const unsubToken = signToken(recipient.id)
    const unsubUrl = `${siteUrl}/unsubscribe?token=${unsubToken}`
    const textBody = `${personalised}\n\n---\nTo unsubscribe: ${unsubUrl}`
    const htmlBody = `<div style="font-family:sans-serif;font-size:15px;line-height:1.6;color:#333;max-width:600px;margin:0 auto">
${personalised.replace(/\n/g, '<br>')}
<br><br>
<hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0">
<p style="font-size:12px;color:#9ca3af;margin:0">
  You're receiving this because you opted in to updates from JDC Tech Solutions.
  <a href="${unsubUrl}" style="color:#6366f1;text-decoration:underline">Unsubscribe</a>
</p>
</div>`

    const { error: sendErr } = await resend.emails.send({
      from: FROM,
      to: recipient.email,
      subject,
      text: textBody,
      html: htmlBody,
    })

    const status = sendErr ? 'failed' : 'sent'
    if (!sendErr) sent++
    sendRows.push({ campaign_id: campaign.id, recipient_id: recipient.id, status })
  }

  // Log sends
  await admin.from('email_sends').insert(sendRows)
  await admin.from('email_campaigns').update({ sent_count: sent }).eq('id', campaign.id)

  return NextResponse.json({ sent, total: recipients.length })
}
