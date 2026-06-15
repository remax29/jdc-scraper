import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })

export const metadata: Metadata = {
  title: 'JDC Tech Solutions — Free Lead Scraper',
  description:
    'Find verified contacts for any niche. Paste your own API keys, describe who you want to find, and export a ready-to-use lead list as CSV or Excel.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} h-full`}>
      <body className="min-h-full bg-slate-50 text-slate-900 font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
