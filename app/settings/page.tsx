import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import AppNav from '../components/AppNav'
import SettingsForm from './SettingsForm'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const adminClient = createAdminClient()
  const { data: profile } = await adminClient
    .from('profiles')
    .select('full_name, use_case, segment, marketing_opt_in, unsubscribed')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen flex flex-col bg-jdc-bg">
      <AppNav />
      <main className="max-w-2xl w-full mx-auto px-6 py-10">
        <h1 className="text-2xl font-display font-bold text-white mb-8">Account settings</h1>
        <div className="card-glass rounded-2xl p-8">
          <SettingsForm
            email={user.email ?? ''}
            profile={{
              full_name: profile?.full_name ?? '',
              use_case: profile?.use_case ?? '',
              marketing_opt_in: profile?.marketing_opt_in ?? false,
              unsubscribed: profile?.unsubscribed ?? false,
            }}
          />
        </div>
      </main>
    </div>
  )
}
