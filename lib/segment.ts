import { WEBMAIL_DOMAINS } from './webmail-domains'

export type Segment = 'corporate' | 'solo'

const CORPORATE_USE_CASES = new Set(['agency', 'company', 'founder'])
const SOLO_USE_CASES = new Set(['freelancer', 'solo', ''])

export function deriveSegment(email: string, useCase: string): Segment {
  const domain = email.split('@')[1]?.toLowerCase() ?? ''
  const isFreemail = WEBMAIL_DOMAINS.has(domain)
  if (!isFreemail) return 'corporate'
  if (CORPORATE_USE_CASES.has(useCase)) return 'corporate'
  if (SOLO_USE_CASES.has(useCase) || !CORPORATE_USE_CASES.has(useCase)) return 'solo'
  return 'solo'
}
