'use server'

import { createClient } from '@/lib/supabase/server'

export async function resetPassword(
  _prev: { error: string; success?: boolean } | null,
  formData: FormData
): Promise<{ error: string; success?: boolean }> {
  const password = formData.get('password') as string
  const confirm = formData.get('confirm_password') as string

  if (password !== confirm) return { error: 'Passwords do not match.' }
  if (password.length < 8) return { error: 'Password must be at least 8 characters.' }

  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ password })
  if (error) return { error: error.message }

  await supabase.auth.signOut()
  return { error: '', success: true }
}
