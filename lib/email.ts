import { Resend } from 'resend'
import { signToken } from './unsubscribe'

const resend = new Resend(process.env.RESEND_API_KEY)
const email = process.env.RESEND_FROM_EMAIL ?? 'noreply@jdctechsolutions.com'
export const FROM = `- NO REPLY - JDC Tech Solutions <${email}>`
const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

function toHtml(text: string, unsubUrl?: string) {
  const body = text.replace(/\n\n---\n.*$/s, '').replace(/\n/g, '<br>')
  const footer = unsubUrl
    ? `<hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0">
<p style="font-size:12px;color:#9ca3af;margin:0">
  You're receiving this because you opted in to updates from JDC Tech Solutions.
  <a href="${unsubUrl}" style="color:#6366f1;text-decoration:underline">Unsubscribe</a>
</p>`
    : ''
  return `<div style="font-family:sans-serif;font-size:15px;line-height:1.6;color:#333;max-width:600px;margin:0 auto">${body}<br><br>${footer}</div>`
}

export async function sendWelcomeEmail(to: string, name: string) {
  const firstName = name.split(' ')[0] || 'there'
  const text = `Hi ${firstName},

Welcome to JDC Tech Solutions. Your scraper is ready. Setup takes 2 minutes: paste your API keys, drop in 3–5 keywords describing the clients you want (e.g. "needs social media manager", "wants automation"), and hit Run.

Tip: tighter keywords beat broad ones — fewer but far better leads.

Open your dashboard: ${SITE}/dashboard

— JDC Tech Solutions`

  return resend.emails.send({
    from: FROM,
    to,
    subject: "You're in — here's how to get your first 10 leads",
    text,
    html: toHtml(text),
  })
}

export async function sendDripSequence(
  to: string,
  name: string,
  userId: string,
  segment: 'corporate' | 'solo' | string
) {
  const firstName = name.split(' ')[0] || 'there'
  const unsubUrl = `${SITE}/unsubscribe?token=${signToken(userId)}`
  const isCorp = segment === 'corporate'

  const emails = [
    {
      delayDays: 3,
      subject: 'The part everyone skips after finding leads',
      body: isCorp
        ? `Hi ${firstName},\n\nFinding leads is step one. The teams that convert them scale their follow-up — exactly the part that's easiest to automate.\n\nA simple pipeline auto-verifies each email, drafts a personalised first message, and schedules follow-ups so nothing slips through.\n\nWant to see what the ROI looks like for your business? ${SITE}/services\n\n— JDC Tech Solutions\n\n---\nUnsubscribe: ${unsubUrl}`
        : `Hi ${firstName},\n\nFinding the lead is step one. The freelancers who win clients follow up fast and consistently — exactly the part that's easy to automate.\n\nA simple setup can auto-verify each email, draft a personalized first message, and schedule follow-ups so nothing slips.\n\nWant to see what that looks like for your niche? ${SITE}/services\n\n— JDC Tech Solutions\n\n---\nUnsubscribe: ${unsubUrl}`,
    },
    {
      delayDays: 6,
      subject: 'Want this whole thing done for you?',
      body: isCorp
        ? `Hi ${firstName},\n\nYou've been using the scraper to find leads — great. If you'd rather skip the manual work, that's what JDC Tech Solutions does: we build the full pipeline for you — lead discovery → outreach → follow-up → CRM — and handle social media for any niche.\n\nMost clients go from "hunting for leads" to "leads landing in a sheet every morning" within a week. For a team, that's hours of time back daily.\n\nGrab a free 15-min slot: ${SITE}/contact\n\n— JDC Tech Solutions\n\n---\nUnsubscribe: ${unsubUrl}`
        : `Hi ${firstName},\n\nYou've been using the scraper to find leads — nice. If you'd rather skip the manual work, that's what JDC Tech Solutions does: we build the full pipeline for you — lead discovery → outreach → follow-up → CRM — and handle the social media side too, whatever niche you're in.\n\nMost clients go from "hunting for leads" to "leads landing in a sheet every morning" within a week.\n\nGrab a free 15-min slot: ${SITE}/contact\n\n— JDC Tech Solutions\n\n---\nUnsubscribe: ${unsubUrl}`,
    },
    {
      delayDays: 10,
      subject: 'Should I close your file?',
      body: `Hi ${firstName},\n\nNo worries if now's not the time — I won't keep nudging. If finding or following up with clients is still a pain point, my door's open: ${SITE}/contact\n\nEither way, the free tool is yours to keep. Good luck out there.\n\n— JDC Tech Solutions\n\n---\nUnsubscribe: ${unsubUrl}`,
    },
  ]

  return emails.map((e) => ({ ...e, html: toHtml(e.body, unsubUrl) }))
}
