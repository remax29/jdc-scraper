'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { completeOnboarding } from './actions'

const USE_CASES = [
  { value: 'agency', label: 'Agency owner' },
  { value: 'company', label: 'Company / startup' },
  { value: 'founder', label: 'Founder / exec' },
  { value: 'freelancer', label: 'Freelancer' },
  { value: 'solo', label: 'Solo / side project' },
]

interface Props {
  incentivePercent: number
  incentiveDescription: string
}

const initial = { error: '' }

export default function OnboardingForm({ incentivePercent, incentiveDescription }: Props) {
  const [state, formAction, pending] = useActionState(completeOnboarding, initial)

  return (
    <form action={formAction} className="space-y-6">
      <div>
        <label htmlFor="use_case" className="block text-sm font-medium text-jdc-muted mb-1">
          How would you describe yourself?
        </label>
        <select
          id="use_case"
          name="use_case"
          required
          className="input-dark"
        >
          <option value="">Select one…</option>
          {USE_CASES.map((u) => (
            <option key={u.value} value={u.value}>{u.label}</option>
          ))}
        </select>
      </div>

      <div className="space-y-3" style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.25rem' }}>
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            name="terms"
            type="checkbox"
            required
            className="mt-0.5 h-4 w-4 rounded"
          />
          <span className="text-sm text-jdc-muted">
            I agree to the{' '}
            <Link href="/terms" target="_blank" className="text-jdc-cyan hover:text-jdc-cyan-l underline transition-colors">Terms of Service</Link>
            {' '}and{' '}
            <Link href="/privacy" target="_blank" className="text-jdc-cyan hover:text-jdc-cyan-l underline transition-colors">Privacy Policy</Link>.
            I understand this tool runs searches using the API keys I provide, and that I am
            responsible for my own API usage and any costs on those accounts.
          </span>
        </label>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            name="marketing_opt_in"
            type="checkbox"
            className="mt-0.5 h-4 w-4 rounded"
          />
          <span className="text-sm text-jdc-muted">
            Email me occasional tips and offers from JDC Tech Solutions — and get{' '}
            <strong className="text-white">{incentivePercent}% off</strong> our automation &amp; SMM service.
            {incentiveDescription ? ` ${incentiveDescription}` : " We'll send your discount code."}
            {' '}(Optional — unsubscribe anytime.)
          </span>
        </label>

        <p className="text-xs text-jdc-dim pt-1">
          JDC Tech Solutions does not sell your data. We use your email to operate your account
          and, only if you opt in above, to share relevant service offers. Delete your account
          anytime in Settings.
        </p>
      </div>

      {state?.error && <p className="text-red-400 text-sm">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="btn-primary w-full py-2.5 text-sm disabled:opacity-60"
      >
        {pending ? 'Saving…' : 'Go to dashboard →'}
      </button>
    </form>
  )
}
