import Link from 'next/link'
import { PROVIDERS } from '@/lib/providers'

export default function AffiliateDisclosurePage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link href="/" className="text-lg font-bold text-indigo-600">JDC Tech Solutions</Link>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-6 py-16 prose prose-slate">
        <h1>Affiliate Disclosure</h1>
        <p>JDC Tech Solutions participates in affiliate programs. Some links on our platform — specifically the &ldquo;Get your API key&rdquo; links on the dashboard — are affiliate links. If you sign up for a service through one of these links, we may receive a commission at no extra cost to you.</p>

        <h2>Which links are affiliate links?</h2>
        <p>The following providers have affiliate programs we participate in (or plan to):</p>
        <ul>
          {PROVIDERS.map((p) => (
            <li key={p.id}>
              <strong>{p.name}</strong> — sign-up link on the dashboard is an affiliate link.
            </li>
          ))}
        </ul>

        <h2>How we use commissions</h2>
        <p>Commissions help us keep the scraper tool free to use. They have no impact on the price you pay or the independence of our recommendations — these are tools you genuinely need to use the service.</p>

        <h2>FTC / Transparency compliance</h2>
        <p>Affiliate links on our dashboard are marked with a visible disclosure adjacent to the link. We do not promote affiliate links through paid advertisements.</p>

        <h2>Questions?</h2>
        <p>Contact us at <a href="mailto:hello@jdctechsolutions.com">hello@jdctechsolutions.com</a>.</p>
      </main>
    </div>
  )
}
