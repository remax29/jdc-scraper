'use server'

import { createClient } from '@/lib/supabase/server'

export async function forgotPassword(
  _prev: { error: string; sent: boolean } | null,
  formData: FormData
): Promise<{ error: string; sent: boolean }> {
  const email = formData.get('email') as string
  if (!email) return { error: 'Email is required.', sent: false }

  const supabase = await createClient()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/auth/callback?type=recovery`,
  })

  // Return success even if email doesn't exist — prevents user enumeration
  if (error && error.status !== 400) return { error: error.message, sent: false }
  return { error: '', sent: true }
}
