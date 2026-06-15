'use client'

import { exportCsv, exportXlsx, type LeadRow } from '@/lib/export'

export default function ExportButtons({ leads }: { leads: LeadRow[] }) {
  return (
    <div className="flex gap-3">
      <button
        onClick={() => exportCsv(leads)}
        className="text-sm text-jdc-muted px-4 py-2 rounded-lg hover:text-white transition-colors"
        style={{ border: '1px solid rgba(255,255,255,0.12)' }}
      >
        Download CSV
      </button>
      <button
        onClick={() => exportXlsx(leads)}
        className="btn-primary text-sm px-4 py-2"
      >
        Download Excel (.xlsx)
      </button>
    </div>
  )
}
