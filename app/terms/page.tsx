import Link from 'next/link'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-lg font-bold text-indigo-600">JDC Tech Solutions</Link>
          <Link href="/signup" className="text-sm text-indigo-600 hover:underline">Get started free →</Link>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-6 py-16 prose prose-slate">
        <h1>Terms of Service</h1>
        <p className="text-slate-400 text-sm">Last updated: {new Date().toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

        <h2>1. Acceptance</h2>
        <p>By creating an account and using JDC Tech Solutions&apos; lead scraper tool (&ldquo;the Service&rdquo;), you agree to these Terms of Service. If you do not agree, do not use the Service.</p>

        <h2>2. BYOK — Your Own API Keys</h2>
        <p>The Service operates on a Bring-Your-Own-Key (BYOK) model. You supply your own Apify, Apollo.io, and Hunter.io API keys. You are solely responsible for your API usage, associated costs, and compliance with each provider&apos;s terms of service.</p>
        <p>JDC Tech Solutions does not store your API keys beyond the duration of a single scrape session (Mode A). Your keys are used only to forward your search request to the configured workflow engine and are discarded immediately after.</p>

        <h2>3. Permitted Use</h2>
        <p>You may use the Service to find publicly available business contact information for legitimate outreach, sales, marketing, and research purposes. You must comply with all applicable laws, including the Philippine Data Privacy Act of 2012, GDPR (if applicable), and CAN-SPAM.</p>
        <p>You may not scrape LinkedIn, Upwork, Indeed, or other platforms in violation of their Terms of Service. The Service is designed for SERP results, public company pages, and similar public data sources.</p>

        <h2>4. Prohibited Use</h2>
        <p>You may not use the Service to: (a) spam or harass individuals; (b) build contact lists for unsolicited bulk email without consent; (c) violate the terms of any third-party API provider; (d) attempt to reverse-engineer or resell the Service; or (e) violate any law.</p>

        <h2>5. Disclaimer</h2>
        <p>The Service is provided &ldquo;as is&rdquo; without warranties of any kind. Lead data accuracy depends on your API providers. JDC Tech Solutions is not liable for any damages arising from your use of the Service or the leads you obtain.</p>

        <h2>6. Termination</h2>
        <p>We reserve the right to suspend or terminate your account for violation of these Terms. You may delete your account at any time from Settings.</p>

        <h2>7. Contact</h2>
        <p>Questions? Email us at <a href="mailto:hello@jdctechsolutions.com">hello@jdctechsolutions.com</a>.</p>
      </main>
      <footer className="border-t border-slate-200 py-6 px-6 text-center text-sm text-slate-400">
        <div className="flex justify-center gap-6">
          <Link href="/privacy" className="hover:text-slate-600">Privacy Policy</Link>
          <Link href="/affiliate-disclosure" className="hover:text-slate-600">Affiliate Disclosure</Link>
          <Link href="/" className="hover:text-slate-600">Home</Link>
        </div>
      </footer>
    </div>
  )
}
