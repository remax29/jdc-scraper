'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function login(
  _prevState: { error: string } | null,
  formData: FormData
): Promise<{ error: string }> {
  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  })
  if (error) return { error: error.message }
  redirect('/dashboard')
}

export async function sendMagicLink(
  _prevState: { error: string; sent: boolean } | null,
  formData: FormData
): Promise<{ error: string; sent: boolean }> {
  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithOtp({
    email: formData.get('email') as string,
    options: { emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/auth/callback` },
  })
  if (error) return { error: error.message, sent: false }
  return { error: '', sent: true }
}
