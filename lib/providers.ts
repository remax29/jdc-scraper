export type Provider = {
  id: string
  name: string
  keyLabel: string
  keyPlaceholder: string
  signupUrl: string
  affiliateUrl: string
  keyInstructions: string
}

// Replace AFFILIATE_ID placeholders with your actual IDs once approved
export const PROVIDERS: Provider[] = [
  {
    id: 'apify',
    name: 'Apify',
    keyLabel: 'Apify API Token',
    keyPlaceholder: 'apify_api_...',
    signupUrl: 'https://console.apify.com',
    affiliateUrl: 'https://apify.com/?fpr=AFFILIATE_ID', // replace with your ref link
    keyInstructions: 'Console → Settings → Integrations → API token',
  },
  {
    id: 'apollo',
    name: 'Apollo.io',
    keyLabel: 'Apollo API Key',
    keyPlaceholder: 'apollo_...',
    signupUrl: 'https://www.apollo.io/sign-up',
    affiliateUrl: 'https://www.apollo.io/?ref=AFFILIATE_ID', // replace with your ref link
    keyInstructions: 'Settings → Integrations → API → create key',
  },
  {
    id: 'hunter',
    name: 'Hunter.io',
    keyLabel: 'Hunter API Key',
    keyPlaceholder: 'hunter_...',
    signupUrl: 'https://hunter.io/users/sign_up',
    affiliateUrl: 'https://hunter.io/?rel=AFFILIATE_ID', // replace with your ref link
    keyInstructions: 'Dashboard → API → API key',
  },
]
