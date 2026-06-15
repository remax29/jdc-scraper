import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-lg font-bold text-indigo-600">JDC Tech Solutions</Link>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-6 py-16 prose prose-slate">
        <h1>Privacy Policy</h1>
        <p className="text-slate-400 text-sm">Last updated: {new Date().toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

        <p>JDC Tech Solutions (&ldquo;we&rdquo;, &ldquo;our&rdquo;) operates jdctechsolutions.com and the BYOK lead scraper tool. This policy explains how we collect, use, and protect your information in compliance with the Philippine Data Privacy Act of 2012 (RA 10173), and applicable international standards including GDPR and CAN-SPAM.</p>

        <h2>1. What we collect</h2>
        <ul>
          <li><strong>Account data:</strong> email address, full name, and your self-reported use case (e.g. &ldquo;freelancer&rdquo;).</li>
          <li><strong>Usage data:</strong> scrape history (keywords, lead counts) — not the content of API keys.</li>
          <li><strong>Marketing preferences:</strong> whether you opted in to marketing emails and your unsubscribe status.</li>
          <li><strong>API keys (session only):</strong> your Apify, Apollo, and Hunter keys are passed to our workflow engine for the duration of your scrape and are immediately discarded. They are never logged or stored in our database.</li>
        </ul>

        <h2>2. How we use your data</h2>
        <ul>
          <li>To operate your account and run scrapes on your behalf.</li>
          <li>To send transactional emails (account confirmation, scrape completion).</li>
          <li>To send marketing emails and service offers <strong>only if you explicitly opted in</strong>.</li>
          <li>To display relevant in-app messages and service promotions inside the tool.</li>
        </ul>

        <h2>3. Affiliate links</h2>
        <p>We display links to Apify, Apollo.io, and Hunter.io. Some are affiliate links — we may earn a commission if you sign up through them. See our <Link href="/affiliate-disclosure">Affiliate Disclosure</Link> for details.</p>

        <h2>4. Data sharing</h2>
        <p>We do not sell your data. We share it only with the service providers we use to operate the platform (Supabase for database/auth, Resend for email), bound by their own privacy policies.</p>

        <h2>5. Your rights (RA 10173 / GDPR)</h2>
        <p>You have the right to access, correct, delete, and port your data. You may also withdraw consent for marketing emails at any time. To exercise these rights, delete your account in Settings or email us at <a href="mailto:hello@jdctechsolutions.com">hello@jdctechsolutions.com</a>.</p>

        <h2>6. Retention</h2>
        <p>We retain your data while your account is active. Upon account deletion, your profile, runs, leads, and any stored codes are permanently erased within 30 days.</p>

        <h2>7. Contact</h2>
        <p>For privacy inquiries: <a href="mailto:hello@jdctechsolutions.com">hello@jdctechsolutions.com</a>.</p>
      </main>
      <footer className="border-t border-slate-200 py-6 px-6 text-center text-sm text-slate-400">
        <div className="flex justify-center gap-6">
          <Link href="/terms" className="hover:text-slate-600">Terms of Service</Link>
          <Link href="/affiliate-disclosure" className="hover:text-slate-600">Affiliate Disclosure</Link>
        </div>
      </footer>
    </div>
  )
}
