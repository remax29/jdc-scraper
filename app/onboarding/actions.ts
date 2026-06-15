'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { deriveSegment } from '@/lib/segment'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { Resend } from 'resend'
import { FROM } from '@/lib/email'

export async function completeOnboarding(
  _prev: { error: string } | null,
  formData: FormData
): Promise<{ error: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated.' }

  const useCase = formData.get('use_case') as string
  const marketingOptIn = formData.get('marketing_opt_in') === 'on'

  const segment = deriveSegment(user.email ?? '', useCase)

  const adminClient = createAdminClient()

  const { error: updateErr } = await adminClient
    .from('profiles')
    .update({ use_case: useCase, segment, marketing_opt_in: marketingOptIn })
    .eq('id', user.id)

  if (updateErr) return { error: updateErr.message }

  // If opted in, issue discount code
  if (marketingOptIn) {
    const { data: incentive } = await adminClient
      .from('optin_incentive')
      .select('promo_code, percent_off')
      .eq('active', true)
      .single()

    if (incentive) {
      await adminClient.from('issued_codes').insert({
        user_id: user.id,
        promo_code: incentive.promo_code,
        percent_off: incentive.percent_off,
      })

      // Send transactional email with code
      const resend = new Resend(process.env.RESEND_API_KEY)
      await resend.emails.send({
        from: FROM,
        to: user.email!,
        subject: `Your ${incentive.percent_off}% discount code from JDC Tech Solutions`,
        text: `Hi,\n\nThank you for opting in! Your discount code is: ${incentive.promo_code}\n\nThis gives you ${incentive.percent_off}% off JDC's automation & SMM service when you're ready to automate your outreach.\n\nHead to your dashboard: ${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/dashboard\n\n— JDC Tech Solutions`,
      }).catch(() => { /* non-fatal — code is still issued */ })
    }
  }

  const { data: updatedProfile } = await adminClient
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  revalidatePath('/dashboard')
  revalidatePath('/onboarding')
  redirect(updatedProfile?.is_admin ? '/admin' : '/dashboard')
}
