'use server'

import { createClient } from '@/lib/supabase/server'

export async function signup(
  _prevState: { error: string; sent?: boolean; email?: string } | null,
  formData: FormData
): Promise<{ error: string; sent?: boolean; email?: string }> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const confirm = formData.get('confirm_password') as string
  const fullName = formData.get('full_name') as string

  if (password !== confirm) return { error: 'Passwords do not match.' }
  if (password.length < 8) return { error: 'Password must be at least 8 characters.' }

  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/auth/callback`,
    },
  })

  if (error) return { error: error.message }
  return { error: '', sent: true, email }
}
