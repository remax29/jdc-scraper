import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import OnboardingForm from './OnboardingForm'

export default async function OnboardingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const adminClient = createAdminClient()
  const { data: profile } = await adminClient
    .from('profiles')
    .select('use_case, full_name')
    .eq('id', user.id)
    .single()

  if (profile?.use_case) redirect('/dashboard')

  const { data: incentive } = await supabase
    .from('optin_incentive')
    .select('percent_off, description')
    .eq('active', true)
    .single()

  return (
    <div className="min-h-screen flex items-center justify-center bg-jdc-bg px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-display font-bold text-white">Quick setup</h1>
          <p className="mt-1 text-jdc-dim text-sm">Takes 30 seconds — helps us personalise your experience</p>
        </div>
        <div className="card-glass rounded-2xl p-8">
          <OnboardingForm
            incentivePercent={incentive?.percent_off ?? 15}
            incentiveDescription={incentive?.description ?? ''}
          />
        </div>
      </div>
    </div>
  )
}
