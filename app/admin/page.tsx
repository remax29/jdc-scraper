import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import AppNav from '../components/AppNav'
import AdminBulkComposer from './AdminBulkComposer'

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ segment?: string; opted?: string; q?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const params = await searchParams
  const { segment = 'all', opted = 'all', q = '' } = params

  const admin = createAdminClient()
  const { data: self } = await admin.from('profiles').select('is_admin').eq('id', user.id).single()
  if (!self?.is_admin) redirect('/dashboard')

  const { data: runCounts } = await admin.from('runs').select('user_id')
  const countsByUser = (runCounts ?? []).reduce<Record<string, number>>((acc, r) => {
    acc[r.user_id] = (acc[r.user_id] ?? 0) + 1; return acc
  }, {})

  let profileQuery = admin
    .from('profiles')
    .select('id, email, full_name, segment, use_case, marketing_opt_in, unsubscribed, created_at')
    .order('created_at', { ascending: false })
  if (segment !== 'all') profileQuery = profileQuery.eq('segment', segment)
  if (opted === 'opted') profileQuery = profileQuery.eq('marketing_opt_in', true)
  const { data: profiles } = await profileQuery

  const filtered = (profiles ?? []).filter((p) =>
    q ? (p.email?.includes(q) || p.full_name?.includes(q)) : true
  )
  const totals = {
    total: filtered.length,
    optedIn: filtered.filter((p) => p.marketing_opt_in && !p.unsubscribed).length,
    corporate: filtered.filter((p) => p.segment === 'corporate').length,
    solo: filtered.filter((p) => p.segment === 'solo').length,
  }

  function activityBadge(userId: string) {
    const count = countsByUser[userId] ?? 0
    if (count >= 3) return { label: 'Hot 🔥', cls: 'bg-orange-500/20 text-orange-400' }
    if (count >= 1) return { label: 'Warm', cls: 'bg-yellow-500/20 text-yellow-400' }
    return { label: 'Cold', cls: 'bg-white/5 text-jdc-dim' }
  }

  return (
    <div className="min-h-screen flex flex-col bg-jdc-bg">
      <AppNav />
      <main className="max-w-7xl w-full mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-display font-bold text-white">Admin — Users</h1>
          <a href="/admin/messages" className="text-sm text-jdc-cyan hover:text-jdc-cyan-l transition-colors">
            Manage messages & incentives →
          </a>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total', value: totals.total },
            { label: 'Opted-in', value: totals.optedIn },
            { label: 'Corporate', value: totals.corporate },
            { label: 'Solo', value: totals.solo },
          ].map((s) => (
            <div key={s.label} className="card-glass rounded-xl p-5">
              <p className="text-xs text-jdc-dim font-medium uppercase tracking-widest">{s.label}</p>
              <p className="text-3xl font-bold text-white mt-1">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <form method="GET" className="flex flex-wrap gap-3 mb-6">
          <input name="q" defaultValue={q} placeholder="Search email or name"
            className="input-dark w-56" />
          <select name="segment" defaultValue={segment}
            className="input-dark w-auto">
            <option value="all">All segments</option>
            <option value="corporate">Corporate</option>
            <option value="solo">Solo</option>
          </select>
          <select name="opted" defaultValue={opted} className="input-dark w-auto">
            <option value="all">All users</option>
            <option value="opted">Opted-in only</option>
          </select>
          <button type="submit" className="btn-primary px-4 py-2 text-sm">Filter</button>
        </form>

        {/* User table */}
        <div className="card-glass rounded-2xl overflow-hidden mb-10">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}>
                <tr>
                  {['Email', 'Name', 'Segment', 'Use case', 'Runs', 'Opt-in', 'Activity', 'Joined'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 font-semibold text-jdc-dim text-xs uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody style={{ ['--tw-divide-color' as string]: 'rgba(255,255,255,0.05)' }} className="divide-y divide-white/5">
                {filtered.map((p) => {
                  const badge = activityBadge(p.id)
                  return (
                    <tr key={p.id} className="hover:bg-white/3 transition-colors">
                      <td className="px-4 py-3 font-medium text-jdc-cyan">{p.email}</td>
                      <td className="px-4 py-3 text-jdc-muted">{p.full_name || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.segment === 'corporate' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}>
                          {p.segment ?? '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-jdc-dim">{p.use_case || '—'}</td>
                      <td className="px-4 py-3 text-white">{countsByUser[p.id] ?? 0}</td>
                      <td className="px-4 py-3">
                        {p.marketing_opt_in && !p.unsubscribed
                          ? <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">Yes</span>
                          : <span className="text-xs text-jdc-dim">No</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badge.cls}`}>{badge.label}</span>
                      </td>
                      <td className="px-4 py-3 text-jdc-dim text-xs">
                        {new Date(p.created_at as string).toLocaleDateString()}
                      </td>
                    </tr>
                  )
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={8} className="px-4 py-8 text-center text-jdc-dim">No users match your filters.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <AdminBulkComposer recipientCount={totals.optedIn} />
      </main>
    </div>
  )
}
