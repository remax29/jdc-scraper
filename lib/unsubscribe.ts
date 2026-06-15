import crypto from 'crypto'

function getSecret(): string {
  const s = process.env.UNSUBSCRIBE_SECRET
  if (!s) throw new Error('UNSUBSCRIBE_SECRET not set')
  return s
}

export function signToken(userId: string): string {
  const payload = Buffer.from(userId).toString('base64url')
  const sig = crypto
    .createHmac('sha256', getSecret())
    .update(payload)
    .digest('base64url')
  return `${payload}.${sig}`
}

export function verifyToken(token: string): string | null {
  const dotIndex = token.lastIndexOf('.')
  if (dotIndex === -1) return null
  const payload = token.slice(0, dotIndex)
  const sig = token.slice(dotIndex + 1)
  const expected = crypto
    .createHmac('sha256', getSecret())
    .update(payload)
    .digest('base64url')
  const sigBuf = Buffer.from(sig)
  const expectedBuf = Buffer.from(expected)
  if (sigBuf.length !== expectedBuf.length) return null
  if (!crypto.timingSafeEqual(sigBuf, expectedBuf)) return null
  return Buffer.from(payload, 'base64url').toString()
}
