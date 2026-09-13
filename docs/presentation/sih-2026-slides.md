---
marp: true
theme: default
paginate: true
backgroundColor: '#0f172a'
color: '#f1f5f9'
style: |
  section {
    font-family: 'Helvetica Neue', Arial, sans-serif;
    font-size: 22px;
    padding: 50px 60px;
  }
  h1 { color: #ef4444; font-size: 2em; margin-bottom: 8px; }
  h2 { color: #ef4444; font-size: 1.4em; border-bottom: 2px solid #ef4444; padding-bottom: 8px; }
  h3 { color: #94a3b8; font-size: 1em; text-transform: uppercase; letter-spacing: 2px; }
  strong { color: #fbbf24; }
  code { background: #1e293b; padding: 2px 8px; border-radius: 4px; font-size: 0.85em; }
  pre { background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 20px; }
  table { width: 100%; border-collapse: collapse; }
  th { background: #1e293b; color: #94a3b8; padding: 8px 12px; text-align: left; }
  td { padding: 8px 12px; border-bottom: 1px solid #1e293b; }
  li { margin-bottom: 6px; }
  .red { color: #ef4444; }
  .green { color: #22c55e; }
  .yellow { color: #eab308; }
---

<!-- Slide 1: Title -->

# ⚠ EmailThreat
## AI-Powered Email Threat Detection & Forensic Intelligence Platform

### SIH 2026 — Problem Statement PS 26106

**Team:** Abdul Aziz (hawk-aa) · Solo Builder
**Stack:** Next.js 14 · PostgreSQL (Supabase) · HuggingFace AI

---

<!-- Slide 2: The Problem -->

## The Problem

Email is the **#1 attack vector** for phishing, BEC, and financial fraud.

> "This email is phishing" is not enough.
> Investigators need: **where did it come from? Is it part of a campaign?**

**What existing tools miss:**
- MXToolbox, VirusTotal → per-email verdict only
- No relay path tracing
- No campaign correlation
- No downloadable forensic report

**SIH PS 26106 asks for all of this.**

---

<!-- Slide 3: Our Differentiator -->

## What Makes This Different

We searched GitHub — **4 other teams** are building PS 26106.

| Feature | Competing tools | EmailThreat |
|---------|----------------|-------------|
| Phishing verdict | ✓ | ✓ |
| Header / relay trace | Partial | ✓ |
| IP geolocation | ✗ | ✓ |
| WHOIS domain age | ✗ | ✓ |
| **Campaign correlation** | **✗ none** | **✓ unique** |
| PDF forensic report | ✗ | ✓ |

**Campaign clustering is our moat.** No competing team has it.

---

<!-- Slide 4: How It Works — Architecture -->

## Architecture

```
[Browser]
    │
    ▼
[Next.js on Vercel]  ── POST /api/analyze ──► SSE stream
    │                         │
    │                    mailparser
    │                    ipinfo.io  (geolocation)
    │                    HuggingFace BART (AI classifier)
    │                    whoiser  (WHOIS)
    │                    AbuseIPDB  (IP reputation)
    │                         │
    │                    Fraud score + verdict
    │                    Campaign clustering (union-find)
    │                         ▼
    └──────────────► [Supabase PostgreSQL]
                     [PDF generation]
```

**2 services. No backend microservices. Ships in 17 days.**

---

<!-- Slide 5: The Analysis Pipeline -->

## Analysis Pipeline

**Input:** Paste raw `.eml` content or upload a file

The system streams live progress — judges see it happening:

1. `Parsing headers... ✓` — relay hops, SPF/DKIM/DMARC from `Authentication-Results`
2. `Geolocating IPs... ✓` — parallel fetch to ipinfo.io for all relay hops
3. `AI classification... ✓` — HuggingFace `bart-large-mnli` zero-shot: `["phishing", "legitimate"]`
4. `WHOIS lookup... ✓` — domain registration age (< 30 days = suspicious)
5. `IP reputation... ✓` — AbuseIPDB check on originating IP
6. `Saving results... ✓` — DB write + campaign clustering

**Total: < 30 seconds on a warm server**

---

<!-- Slide 6: Fraud Scoring -->

## Fraud Score Formula

**Score: 0 – 100**

| Signal | Points |
|--------|--------|
| SPF authentication fail | +20 |
| DKIM authentication fail | +20 |
| DMARC authentication fail | +15 |
| Sender domain < 30 days old | +20 |
| AI phishing confidence > 70% | +15 |
| AbuseIPDB score > 50% | +10 |

**Verdicts:**
- < 40 → 🟢 **Legitimate**
- 40–59 → 🟡 **Suspicious**
- ≥ 60 → 🔴 **Fraudulent**

*If SPF + DKIM + DMARC all fail → minimum Suspicious regardless*

---

<!-- Slide 7: Campaign Correlation -->

## Campaign Correlation (The Differentiator)

**Problem:** Individual email verdicts don't reveal coordinated attacks.

**Our approach:** Union-find clustering on shared IPs and sender domains.

```
Email A (203.0.113.42) ─── same IP ──► Campaign #4
Email B (203.0.113.42) ─────────────► Campaign #4
Email C (phish-domain.com) ── same domain ──► Campaign #4
```

**Result displayed:**
> "Campaign #4 — 7 emails, originating from AS-47764 (HostKey Russia)"

- Runs inside the DB transaction — atomic with the email insert
- Merges overlapping campaigns automatically (lowest ID wins)
- Scales to the demo; advisory lock available for concurrency

---

<!-- Slide 8: The PDF Report -->

## One-Click Forensic PDF

**8 sections, auto-generated, downloadable:**

1. **Executive Summary** — verdict + fraud score
2. **Email Header Analysis** — relay hops, anomalies
3. **Authentication Status** — SPF / DKIM / DMARC table
4. **Geolocation Trace** — IP hop table: country, ASN, org, abuse %
5. **Domain Intelligence** — WHOIS registration age, registrar
6. **NLP Phishing Analysis** — BART confidence score
7. **Campaign Attribution** — campaign ID, email count, origin network
8. **Indicators of Compromise** — IPs, domains, URLs extracted

**Suitable for institutional and law enforcement reporting.**

---

<!-- Slide 9: Tech Stack -->

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend + API | Next.js 14 (App Router) | One deployment, no FastAPI complexity |
| Streaming | Server-Sent Events | Bypasses Vercel 10s timeout limit |
| Database | Supabase PostgreSQL + Prisma | Free tier, instant setup |
| Email parsing | `mailparser` npm | Pure JS, no system dependencies |
| AI classifier | HuggingFace `bart-large-mnli` | Zero-shot, no fine-tuning needed |
| Geolocation | ipinfo.io free tier | 50k req/month, sufficient for demo |
| IP reputation | AbuseIPDB (DB-cached) | 1k req/day, 7-day cache extends it |
| WHOIS | `whoiser` npm | Pure JS, TCP-based, no binary deps |
| PDF | `@react-pdf/renderer` | React components → PDF, runs in Node.js |

---

<!-- Slide 10: Live Demo Flow -->

## Live Demo Flow

**Step 1 — Paste a phishing email**
Paste raw `.eml` from PhishTank → click Analyze

**Step 2 — Watch it happen**
Live progress: Parsing → Geolocating → Classifying → Done

**Step 3 — See the verdict**
Red card: "Fraudulent — Score 82/100"

**Step 4 — Download the PDF**
8-section forensic report, one click

**Step 5 — Show campaign correlation**
3 pre-loaded phishing emails from the same IP cluster → Campaign #1

**Backup:** Pre-recorded video if live demo fails

---

<!-- Slide 11: Constraints Met -->

## Constraints → How We Met Them

| Constraint | Solution |
|-----------|---------|
| Solo builder, 17 days | Next.js-only stack, no FastAPI. All logic in `lib/`. |
| No custom ML training | HuggingFace Inference API (zero-shot) |
| Vercel free tier (10s limit) | SSE streaming — each step emits progress as it finishes |
| Supabase free tier pauses | GitHub Actions keep-alive cron (every 3 days) |
| AbuseIPDB 1k req/day | 7-day DB cache per IP — repeat senders never re-query |
| HuggingFace cold start | Keep-alive cron warms the model; SSE shows progress while waiting |

---

<!-- Slide 12: Deployment -->

## Deployment & CI/CD

```
git push main
    │
    ▼
GitHub Actions CI:
  ✓ TypeScript check (tsc --noEmit)
  ✓ ESLint
  ✓ 19 unit tests (fraud score + email parser)
    │
    ▼
Vercel Auto-Deploy:
  prisma generate && next build → deploy
    │
    ▼
Keep-Alive Cron (every 3 days):
  → ping /api/health (Supabase)
  → dummy HuggingFace inference (warms model)
```

**Live URL:** Deploy before Sep 28 (2-day buffer before deadline)

---

<!-- Slide 13: Success Criteria -->

## Success Criteria

✅ **Paste phishing email → first progress event in < 2s**
✅ **Full analysis complete in < 30s (warm server)**
✅ **PDF downloads with all 8 sections**
✅ **3+ emails correctly clustered into one campaign**
✅ **Publicly accessible URL before Sep 28**

---

<!-- Slide 14: Thank You -->

# Thank You

## EmailThreat — Forensic Intelligence Platform

**The gap we fill:** Campaign-level forensic intelligence, not just per-email verdicts.

**The differentiator:** Union-find campaign clustering — no other SIH PS 26106 submission has this.

---

*Built solo in 17 days for SIH 2026 · PS 26106*
*Stack: Next.js · Supabase · HuggingFace · Vercel*
