import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import LogoutButton from './LogoutButton'

export default async function AppNav() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const adminClient = createAdminClient()
  const { data: profile } = user
    ? await adminClient.from('profiles').select('is_admin, full_name').eq('id', user.id).single()
    : { data: null }

  return (
    <header style={{ background: 'rgba(5,5,15,0.9)', borderBottom: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)' }}
      className="sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="font-display font-bold text-lg text-white">
            JDC <span className="gradient-text">Scraper</span>
          </Link>
          <nav className="hidden sm:flex gap-5 text-sm text-jdc-dim">
            <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
            {profile?.is_admin && (
              <Link href="/admin" className="hover:text-white transition-colors">Admin</Link>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/settings" className="text-jdc-muted hover:text-white transition-colors">
            {profile?.full_name ?? user?.email}
          </Link>
          <LogoutButton />
        </div>
      </div>
    </header>
  )
}
