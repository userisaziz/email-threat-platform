# Setup Guide

## Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com) account (free tier)
- API keys for: HuggingFace, ipinfo.io, AbuseIPDB

## Local Development

**1. Clone and install**
```bash
git clone https://github.com/hawk-aa/ai-learn
cd ai-learn
npm install
```

**2. Configure environment**
```bash
cp .env.local.example .env.local
# Edit .env.local with your real values
```

Required values in `.env.local`:
| Key | Where to get it |
|-----|----------------|
| `DATABASE_URL` | Supabase → Settings → Database → Connection string (URI mode) |
| `HF_TOKEN` | huggingface.co/settings/tokens |
| `IPINFO_TOKEN` | ipinfo.io/account/token |
| `ABUSEIPDB_KEY` | abuseipdb.com/account/api |

**3. Create database tables**
```bash
npm run db:migrate
# Enter migration name: init
```

**4. Start dev server**
```bash
npm run dev
# Open http://localhost:3000
```

## Production Deploy (Vercel)

1. Push to GitHub
2. Import repo in [vercel.com/new](https://vercel.com/new)
3. Add environment variables in Vercel dashboard (same 4 keys as above, plus `APP_URL=https://your-app.vercel.app`)
4. Add `APP_URL` and `HF_TOKEN` to GitHub repo secrets (for the keep-alive cron)
5. Deploy — Vercel runs `prisma generate && next build` automatically

## Test the pipeline

Download a sample phishing email from [PhishTank](https://phishtank.org) or use the example below, then paste it into the app:

```
From: security-alert@paypa1-verify.com
To: victim@example.com
Subject: Your account has been limited - Action Required
Message-ID: <abc123@paypa1-verify.com>
Date: Mon, 13 Sep 2026 10:00:00 +0000
MIME-Version: 1.0
Received: from mail.paypa1-verify.com ([185.220.101.47])
  by mx1.example.com with SMTP
Authentication-Results: mx1.example.com;
  spf=fail smtp.mailfrom=paypa1-verify.com;
  dkim=fail header.d=paypa1-verify.com;
  dmarc=fail header.from=paypa1-verify.com
Content-Type: text/plain

Dear Customer,

Your account has been limited due to suspicious activity. Please verify your identity immediately:

http://paypa1-verify.com/secure/login?cmd=_account-verify&token=ABC123XYZ

Failure to verify within 24 hours will result in account suspension.

PayPal Security Team
```
