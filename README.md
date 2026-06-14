# JDC Scraper

[![Netlify](https://www.netlify.com/img/global/badges/netlify-color-accent.svg)](https://www.netlify.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**Free B2B lead generation tool — bring your own API keys, no subscription, no data lock-in.**

Built by [JDC Tech Solutions](https://jdctechsolutions.com).

---

## What it does

Paste your API keys, describe your target (keyword + location + industry), and get a clean CSV of verified B2B contacts ready for outreach. No per-search fees. Your keys, your quota, your data.

## Features

- Keyword + location targeting
- Email verification via Hunter.io
- CSV / Excel export — you own the leads
- Segment tagging (agency, clinic, restaurant, etc.)
- BYOK — bring your own OpenAI, Apollo.io & Hunter.io keys
- No monthly subscription

## Tech Stack

Next.js · TypeScript · Supabase · OpenAI · Apollo.io · Hunter.io · [Apify](https://apify.com?fpr=jdctechsolutions)

## Getting Started

```bash
npm install
cp .env.example .env.local   # add your API keys
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `OPENAI_API_KEY` | OpenAI key (user-supplied at runtime) |
| `APOLLO_API_KEY` | Apollo.io key (user-supplied at runtime) |
| `HUNTER_API_KEY` | Hunter.io key (user-supplied at runtime) |

## Contributing

Pull requests are welcome. Please read [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) before contributing.

## License

MIT — see [LICENSE](LICENSE).

---

This project is powered by [Netlify](https://www.netlify.com).
