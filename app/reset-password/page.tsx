'use client'

import { useActionState, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { resetPassword } from './actions'

const initial = { error: '', success: false }

function CountdownRedirect() {
  const router = useRouter()
  const [count, setCount] = useState(10)

  useEffect(() => {
    if (count === 0) { router.push('/login'); return }
    const t = setTimeout(() => setCount(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [count, router])

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--gradient-hero)' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="font-display font-bold text-2xl text-white">
            JDC <span className="gradient-text">Tech Solutions</span>
          </Link>
        </div>
        <div className="card-glass rounded-2xl p-8 text-center">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)' }}>
            <svg className="w-7 h-7 text-jdc-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-white mb-1">Password updated successfully.</h2>
          <p className="text-jdc-dim text-sm mb-6">
            Sign in with your new password.{' '}
            Redirecting in <span className="font-bold text-jdc-cyan">{count}</span>s…
          </p>
          <Link href="/login" className="btn-primary inline-block px-6 py-2.5 text-sm">
            Sign in now →
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  const [state, formAction, pending] = useActionState(resetPassword, initial)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const mismatch = confirm.length > 0 && password !== confirm

  if (state?.success) return <CountdownRedirect />

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--gradient-hero)' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="font-display font-bold text-2xl text-white">
            JDC <span className="gradient-text">Tech Solutions</span>
          </Link>
          <p className="mt-2 text-sm text-jdc-dim">Set a new password</p>
        </div>
        <div className="card-glass rounded-2xl p-8">
          <form action={formAction} className="space-y-5">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-jdc-muted mb-1">New password</label>
              <input id="password" name="password" type="password" autoComplete="new-password" required minLength={8}
                value={password} onChange={(e) => setPassword(e.target.value)} className="input-dark w-full" />
              <p className="text-xs text-jdc-dim mt-1">Minimum 8 characters</p>
            </div>
            <div>
              <label htmlFor="confirm_password" className="block text-sm font-medium text-jdc-muted mb-1">Confirm new password</label>
              <input id="confirm_password" name="confirm_password" type="password" autoComplete="new-password" required minLength={8}
                value={confirm} onChange={(e) => setConfirm(e.target.value)}
                className={`input-dark w-full ${mismatch ? 'border-red-500' : ''}`} />
              {mismatch && <p className="text-red-400 text-xs mt-1">Passwords do not match</p>}
            </div>
            {state?.error && <p className="text-red-400 text-sm">{state.error}</p>}
            <button type="submit" disabled={pending || mismatch || password.length < 8}
              className="btn-primary w-full py-2.5 text-sm disabled:opacity-50">
              {pending ? 'Updating…' : 'Update password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
