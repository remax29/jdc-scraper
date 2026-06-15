import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import AppNav from '../../components/AppNav'
import MessageEditor from './MessageEditor'
import IncentiveEditor from './IncentiveEditor'

export default async function AdminMessagesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()
  const { data: self } = await admin.from('profiles').select('is_admin').eq('id', user.id).single()
  if (!self?.is_admin) redirect('/dashboard')

  const { data: messages } = await admin
    .from('in_app_messages')
    .select('*')
    .order('created_at', { ascending: false })

  const { data: incentive } = await admin
    .from('optin_incentive')
    .select('*')
    .eq('active', true)
    .single()

  return (
    <div className="min-h-screen flex flex-col bg-jdc-bg">
      <AppNav />
      <main className="max-w-4xl w-full mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-display font-bold text-white">In-app messages &amp; incentives</h1>
          <a href="/admin" className="text-sm text-jdc-dim hover:text-white transition-colors">← Users</a>
        </div>

        <IncentiveEditor
          current={incentive ?? { active: true, percent_off: 15, promo_code: 'OPTIN15', description: '' }}
        />

        <div className="mt-10">
          <h2 className="text-lg font-display font-semibold text-white mb-4">Banners &amp; CTAs</h2>
          <MessageEditor messages={messages ?? []} adminId={user.id} />
        </div>
      </main>
    </div>
  )
}
