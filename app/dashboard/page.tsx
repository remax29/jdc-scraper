import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import AppNav from '../components/AppNav'
import InAppBanner from '../components/InAppBanner'
import DashboardForm from './DashboardForm'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const adminClient = createAdminClient()
  const { data: profile } = await adminClient
    .from('profiles')
    .select('use_case, full_name')
    .eq('id', user.id)
    .single()
  if (!profile?.use_case) redirect('/onboarding')

  const { data: runs } = await supabase
    .from('runs')
    .select('id, lead_count, keywords, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <div className="min-h-screen flex flex-col bg-jdc-bg">
      <AppNav />
      <main className="flex-1 max-w-3xl w-full mx-auto px-6 py-10">
        <InAppBanner placement="dashboard" />

        <h1 className="text-2xl font-display font-bold text-white mb-1">Find contacts</h1>
        <p className="text-jdc-dim text-sm mb-8">
          Describe your target, paste your API keys, and get a verified lead list in minutes.
        </p>

        <div className="card-glass rounded-2xl p-8">
          <DashboardForm />
        </div>

        {runs && runs.length > 0 && (
          <div className="mt-10">
            <h2 className="text-sm font-semibold text-jdc-muted mb-3 uppercase tracking-wide">Recent scrapes</h2>
            <div className="space-y-2">
              {runs.map((run) => (
                <a key={run.id} href={`/results/${run.id}`}
                  className="flex items-center justify-between card-glass rounded-xl px-5 py-3.5 hover:border-jdc-cyan transition-all group">
                  <div>
                    <p className="text-sm font-medium text-white group-hover:text-jdc-cyan transition-colors">
                      {Array.isArray(run.keywords) && run.keywords.length > 0
                        ? run.keywords.join(', ')
                        : 'Unnamed scrape'}
                    </p>
                    <p className="text-xs text-jdc-dim mt-0.5">
                      {new Date(run.created_at as string).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-jdc-cyan">{run.lead_count} leads →</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
