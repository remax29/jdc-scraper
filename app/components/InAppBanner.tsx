'use client'

import { useEffect, useRef, useState } from 'react'

type Message = {
  id: string
  title: string | null
  cta_label: string | null
  cta_url: string | null
  image_url: string | null
}

const CARD_W = 208
const GAP = 12
const CARD_STRIDE = CARD_W + GAP
const AUTO_SPEED = 0.6    // px/frame when idle (~36 px/s at 60 fps)
const MAX_SPEED = 5       // px/frame at the far edge (~300 px/s)

export default function InAppBanner({ placement }: { placement: string }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [cursorSide, setCursorSide] = useState<'left' | 'right' | null>(null)

  const containerRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const offsetRef = useRef(0)          // translateX in px (positive = content moved left)
  const speedRef = useRef(AUTO_SPEED)  // px per frame; +ve = left, -ve = right
  const rafRef = useRef(0)

  useEffect(() => {
    fetch(`/api/messages?placement=${placement}`)
      .then((r) => r.json())
      .then((data) => {
        const msgs: Message[] = data.messages ?? []
        setMessages(msgs)
        msgs.forEach((m) => fireTrack(m.id, 'view'))
      })
      .catch(() => {})
  }, [placement])

  // rAF animation loop — runs for the lifetime of the component
  useEffect(() => {
    if (!messages.length) return
    const loopWidth = messages.length * CARD_STRIDE

    function tick() {
      offsetRef.current += speedRef.current
      if (offsetRef.current >= loopWidth) offsetRef.current -= loopWidth
      if (offsetRef.current < 0) offsetRef.current += loopWidth
      if (trackRef.current) {
        trackRef.current.style.transform = `translateX(-${offsetRef.current}px)`
      }
      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [messages.length])

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    // normalized: -1 = far left, 0 = centre, +1 = far right
    const norm = ((e.clientX - rect.left) / rect.width - 0.5) * 2
    speedRef.current = norm * MAX_SPEED  // right → scroll left; left → scroll right
    setCursorSide(norm < 0 ? 'left' : 'right')
  }

  function handleMouseLeave() {
    speedRef.current = AUTO_SPEED
    setCursorSide(null)
  }

  function fireTrack(id: string, event: 'view' | 'click') {
    fetch('/api/messages/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, event }),
    }).catch(() => {})
  }

  if (!messages.length) return null

  // Duplicate so the loop has enough width; triple short lists so gaps never show
  const fill = messages.length < 4
    ? [...messages, ...messages, ...messages, ...messages]
    : [...messages, ...messages]

  const cursorStyle =
    cursorSide === 'left' ? 'w-resize' :
    cursorSide === 'right' ? 'e-resize' : 'default'

  return (
    <div ref={containerRef} className="mb-8 select-none"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ cursor: cursorStyle }}
    >
      <div
        className="rounded-2xl overflow-hidden relative"
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.07)',
          padding: '12px 0',
        }}
      >
        {/* Gradient fade — left */}
        <div className="absolute left-0 top-0 bottom-0 z-10 pointer-events-none"
          style={{ width: 64, background: 'linear-gradient(to right, rgba(5,5,15,0.95), transparent)' }} />

        {/* Direction hint — left */}
        {cursorSide === 'left' && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 z-20 pointer-events-none flex items-center gap-1"
            style={{ color: 'rgba(0,212,255,0.75)', fontSize: 11, fontWeight: 600, letterSpacing: '0.05em' }}>
            ← scroll
          </div>
        )}

        {/* Scrolling track */}
        <div
          ref={trackRef}
          className="flex gap-3 px-3"
          style={{ width: 'max-content', willChange: 'transform' }}
        >
          {fill.map((m, i) => (
            <a
              key={`${m.id}-${i}`}
              href={m.cta_url ?? '#'}
              onClick={() => fireTrack(m.id, 'click')}
              target={m.cta_url?.startsWith('http') ? '_blank' : undefined}
              rel="noopener noreferrer"
              className="group flex-none rounded-xl overflow-hidden relative block"
              style={{
                width: CARD_W,
                height: 136,
                background: m.image_url
                  ? `url('${m.image_url}') center/cover no-repeat #0a0a1a`
                  : 'linear-gradient(135deg,rgba(0,102,255,0.18),rgba(0,212,255,0.08))',
                border: '1px solid rgba(255,255,255,0.08)',
                flexShrink: 0,
              }}
              title={m.title ?? undefined}
            >
              {/* Hover glow ring */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
                style={{ border: '2px solid rgba(0,212,255,0.5)', borderRadius: 'inherit' }} />

              {/* CTA label on hover */}
              {m.cta_label && (
                <div className="absolute inset-x-0 bottom-0 pb-3 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <span className="text-white text-xs font-semibold px-3 py-1 rounded-full"
                    style={{ background: 'rgba(0,212,255,0.3)', backdropFilter: 'blur(8px)' }}>
                    {m.cta_label} →
                  </span>
                </div>
              )}

              {/* Fallback when no image */}
              {!m.image_url && m.title && (
                <div className="absolute inset-0 flex items-center justify-center p-4">
                  <p className="text-white text-sm font-semibold text-center leading-tight">{m.title}</p>
                </div>
              )}
            </a>
          ))}
        </div>

        {/* Direction hint — right */}
        {cursorSide === 'right' && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20 pointer-events-none flex items-center gap-1"
            style={{ color: 'rgba(0,212,255,0.75)', fontSize: 11, fontWeight: 600, letterSpacing: '0.05em' }}>
            scroll →
          </div>
        )}

        {/* Gradient fade — right */}
        <div className="absolute right-0 top-0 bottom-0 z-10 pointer-events-none"
          style={{ width: 64, background: 'linear-gradient(to left, rgba(5,5,15,0.95), transparent)' }} />
      </div>
    </div>
  )
}
