import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--gradient-hero)' }}>

      {/* Nav */}
      <header className="w-full px-6 py-5 flex items-center justify-between max-w-7xl mx-auto">
        <span className="font-display font-bold text-xl tracking-tight text-white">
          JDC <span className="gradient-text">Tech Solutions</span>
        </span>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-jdc-muted hover:text-white px-4 py-2 transition-colors">
            Sign in
          </Link>
          <Link href="/signup" className="btn-primary text-sm px-5 py-2.5">
            Get started free
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20 relative overflow-hidden">

        {/* Background glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(0,102,255,0.12) 0%, transparent 70%)' }} />
        <div className="absolute top-1/2 left-1/3 w-[400px] h-[400px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(0,212,255,0.08) 0%, transparent 70%)' }} />
        <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 70%)' }} />

        <div className="relative z-10 max-w-4xl">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase mb-8"
            style={{ border: '1px solid rgba(0,212,255,0.3)', color: '#00d4ff', background: 'rgba(0,212,255,0.06)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-jdc-cyan animate-pulse" />
            AI-Powered Lead Discovery
          </div>

          {/* Headline */}
          <h1 className="font-display font-bold leading-tight mb-6"
            style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)' }}>
            <span className="text-white">Find verified contacts</span>
            <br />
            <span className="gradient-text">for any niche.</span>
          </h1>

          <p className="text-jdc-muted text-lg max-w-xl mx-auto mb-10 leading-relaxed">
            Paste your own API keys. Describe your target. Get a clean list of verified leads — exported as CSV or Excel. Free to run, always.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup" className="btn-primary px-8 py-3.5 text-base glow-cyan">
              Start scraping free →
            </Link>
            <a href="https://jdctechsolutions.com" target="_blank" rel="noopener noreferrer"
              className="px-8 py-3.5 text-base font-semibold rounded-xl text-jdc-muted hover:text-white transition-colors"
              style={{ border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.04)' }}>
              About JDC Tech →
            </a>
          </div>

          <p className="mt-5 text-xs text-jdc-dim">
            No credit card. No per-search fees. Your keys, your quota.
          </p>
        </div>

        {/* Floating stat cards */}
        <div className="relative z-10 mt-20 grid grid-cols-3 gap-4 max-w-lg mx-auto">
          {[
            { value: 'BYOK', label: 'Bring Your Own Keys' },
            { value: '3-step', label: 'Scrape to export' },
            { value: '0 fees', label: 'Per search cost' },
          ].map((s) => (
            <div key={s.label} className="card-glass rounded-xl p-4 text-center">
              <div className="gradient-text font-display font-bold text-lg">{s.value}</div>
              <div className="text-jdc-dim text-xs mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-6 max-w-7xl mx-auto w-full flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-jdc-dim"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <span>© {new Date().getFullYear()} JDC Tech Solutions</span>
        <div className="flex gap-6">
          <Link href="/terms" className="hover:text-jdc-muted transition-colors">Terms</Link>
          <Link href="/privacy" className="hover:text-jdc-muted transition-colors">Privacy</Link>
          <Link href="/affiliate-disclosure" className="hover:text-jdc-muted transition-colors">Affiliate Disclosure</Link>
        </div>
      </footer>
    </div>
  )
}
