import { verifyToken } from '@/lib/unsubscribe'
import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'

interface Props {
  searchParams: Promise<{ token?: string }>
}

export default async function UnsubscribePage({ searchParams }: Props) {
  const { token } = await searchParams

  if (!token) {
    return <UnsubscribeLayout>Invalid or missing token.</UnsubscribeLayout>
  }

  const userId = verifyToken(token)
  if (!userId) {
    return <UnsubscribeLayout>This link is invalid or has expired.</UnsubscribeLayout>
  }

  const admin = createAdminClient()
  const { error } = await admin
    .from('profiles')
    .update({ unsubscribed: true })
    .eq('id', userId)

  if (error) {
    return <UnsubscribeLayout>Something went wrong. Please try again or contact us.</UnsubscribeLayout>
  }

  return (
    <UnsubscribeLayout>
      <p className="text-slate-700">You&apos;ve been unsubscribed from marketing emails.</p>
      <p className="text-slate-500 text-sm mt-2">
        You&apos;ll still receive transactional emails (account, scrape confirmations). You can
        update this anytime in your{' '}
        <Link href="/settings" className="text-indigo-600 underline">account settings</Link>.
      </p>
    </UnsubscribeLayout>
  )
}

function UnsubscribeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-10 text-center shadow-sm">
        <Link href="/" className="text-xl font-bold text-indigo-600 block mb-6">JDC Tech Solutions</Link>
        <h1 className="text-xl font-bold text-slate-900 mb-4">Unsubscribe</h1>
        {typeof children === 'string' ? (
          <p className="text-slate-500">{children}</p>
        ) : children}
        <Link href="/" className="mt-8 inline-block text-sm text-slate-400 hover:text-slate-600">
          ← Back to home
        </Link>
      </div>
    </div>
  )
}
