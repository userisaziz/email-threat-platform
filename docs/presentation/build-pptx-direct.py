#!/usr/bin/env python3
"""
EmailThreat Platform — direct PPTX generation with python-pptx.
Dark navy design system. No HTML intermediate.
"""

from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN

# ── palette ──────────────────────────────────────────────────────────────────
BG       = RGBColor(0x0D, 0x11, 0x17)
BG2      = RGBColor(0x16, 0x1B, 0x22)
BG3      = RGBColor(0x01, 0x04, 0x09)
FG       = RGBColor(0xE6, 0xED, 0xF3)
FG2      = RGBColor(0xC9, 0xD1, 0xD9)
MUTED    = RGBColor(0x8B, 0x94, 0x9E)
BORDER   = RGBColor(0x30, 0x36, 0x3D)
ACCENT   = RGBColor(0x25, 0x63, 0xEB)
ACCENT2  = RGBColor(0x3B, 0x82, 0xF6)
ACCENT_L = RGBColor(0x93, 0xC5, 0xFD)
DANGER   = RGBColor(0xEF, 0x44, 0x44)
DANGER_D = RGBColor(0xDC, 0x26, 0x26)
SUCCESS  = RGBColor(0x10, 0xB9, 0x81)
SUCCESS_L= RGBColor(0x6E, 0xE7, 0xB7)
WARNING  = RGBColor(0xF5, 0x9E, 0x0B)
WARNING_L= RGBColor(0xFC, 0xD3, 0x4D)
PURPLE   = RGBColor(0xC4, 0xB5, 0xFD)
PURPLE_D = RGBColor(0x8B, 0x5C, 0xF6)
ORANGE   = RGBColor(0xF9, 0x73, 0x16)

W = Inches(13.33)
H = Inches(7.5)

prs = Presentation()
prs.slide_width = W
prs.slide_height = H
BLANK = prs.slide_layouts[6]


# ── helpers ───────────────────────────────────────────────────────────────────

def new_slide(bg=BG):
    s = prs.slides.add_slide(BLANK)
    f = s.background.fill
    f.solid()
    f.fore_color.rgb = bg
    return s


def box(s, x, y, w, h, fill=None, line=None, lw=0.75):
    shp = s.shapes.add_shape(1, x, y, w, h)
    if fill:
        shp.fill.solid()
        shp.fill.fore_color.rgb = fill
    else:
        shp.fill.background()
    if line:
        shp.line.color.rgb = line
        shp.line.width = Pt(lw)
    else:
        shp.line.fill.background()
    return shp


def txt(s, t, x, y, w, h, sz=13, col=FG2, bold=False, italic=False,
        align=PP_ALIGN.LEFT, wrap=True):
    tb = s.shapes.add_textbox(x, y, w, h)
    tf = tb.text_frame
    tf.word_wrap = wrap
    p = tf.paragraphs[0]
    p.alignment = align
    r = p.add_run()
    r.text = t
    r.font.size = Pt(sz)
    r.font.bold = bold
    r.font.italic = italic
    r.font.color.rgb = col
    return tb


def mtxt(s, parts, x, y, w, h, sz=13, align=PP_ALIGN.LEFT, wrap=True):
    """Multi-colour text. parts = [(text, color, bold), ...]"""
    tb = s.shapes.add_textbox(x, y, w, h)
    tf = tb.text_frame
    tf.word_wrap = wrap
    p = tf.paragraphs[0]
    p.alignment = align
    for t, col, bold in parts:
        r = p.add_run()
        r.text = t
        r.font.size = Pt(sz)
        r.font.bold = bold
        r.font.color.rgb = col
    return tb


def hdr(s, section, num, total=13):
    """Standard header bar."""
    box(s, 0, 0, W, Inches(0.52), fill=BG2, line=BORDER, lw=0.5)
    txt(s, section.upper(), Inches(0.22), Inches(0.1), Inches(8), Inches(0.35),
        sz=10, col=MUTED, bold=True)
    txt(s, f"{num} / {total}", W - Inches(2.7), Inches(0.1), Inches(1.4), Inches(0.35),
        sz=10, col=MUTED, align=PP_ALIGN.RIGHT)
    box(s, W - Inches(1.26), Inches(0.19), Inches(0.12), Inches(0.12), fill=DANGER_D)
    txt(s, "EmailThreat", W - Inches(1.12), Inches(0.1), Inches(1.0), Inches(0.35),
        sz=10, col=FG, bold=True)


def slide_title(s, parts, y=Inches(0.62), h=Inches(0.85)):
    """Multi-colour slide title. parts = [(text, color), ...]"""
    tb = s.shapes.add_textbox(Inches(0.25), y, W - Inches(0.5), h)
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    for t, col in parts:
        r = p.add_run()
        r.text = t
        r.font.size = Pt(23)
        r.font.bold = True
        r.font.color.rgb = col
    return tb


def lbl(s, t, x, y, w):
    txt(s, t.upper(), x, y, w, Inches(0.28), sz=10, col=MUTED, bold=True)


def bullet_para(tf, t, col=FG2, sz=13, indent=True):
    from pptx.util import Pt as _Pt
    p = tf.add_paragraph()
    p.alignment = PP_ALIGN.LEFT
    r = p.add_run()
    r.text = ("  •  " if indent else "") + t
    r.font.size = _Pt(sz)
    r.font.color.rgb = col
    return p


# ─────────────────────────────────────────────────────────────────────────────
# SLIDE 1 — Title
# ─────────────────────────────────────────────────────────────────────────────
s1 = new_slide()

# Top accent stripe
box(s1, 0, 0, W, Inches(0.06), fill=ACCENT)

# Left hero area
txt(s1, "SMART INDIA HACKATHON 2026", Inches(0.7), Inches(0.5), Inches(8), Inches(0.35),
    sz=11, col=ACCENT2, bold=True)

# Main title
mtxt(s1, [("Email", FG, True), ("Threat", ACCENT2, True)],
     Inches(0.7), Inches(1.0), Inches(8), Inches(1.2), sz=64)

txt(s1, "AI-Powered Email Threat Detection &\nForensic Intelligence Platform",
    Inches(0.7), Inches(2.3), Inches(7.2), Inches(0.9),
    sz=20, col=MUTED)

# Meta row
meta_y = Inches(3.35)
meta_items = [
    ("PROBLEM STATEMENT", "PS 26106"),
    ("DOMAIN", "Cybersecurity"),
    ("DATE", "September 2026"),
]
for i, (lbl_t, val_t) in enumerate(meta_items):
    mx = Inches(0.7) + i * Inches(2.6)
    txt(s1, lbl_t, mx, meta_y, Inches(2.4), Inches(0.28), sz=9, col=MUTED, bold=True)
    txt(s1, val_t, mx, meta_y + Inches(0.3), Inches(2.4), Inches(0.4), sz=15, col=FG, bold=True)
    if i < 2:
        box(s1, mx + Inches(2.45), meta_y, Inches(0.02), Inches(0.6), fill=BORDER)

# Right: signal pills
pill_x = Inches(9.0)
pills = [
    ("Authentication", "SPF · DKIM · DMARC", ACCENT),
    ("IP Geolocation", "Relay hop trace", WARNING),
    ("AI Classification", "Zero-shot NLP", PURPLE_D),
    ("WHOIS Intel", "Domain age lookup", SUCCESS),
    ("IP Reputation", "AbuseIPDB score", DANGER_D),
]
for i, (name, desc, dot_col) in enumerate(pills):
    py = Inches(0.8) + i * Inches(1.1)
    box(s1, pill_x, py, Inches(3.8), Inches(0.9), fill=BG2, line=BORDER)
    box(s1, pill_x + Inches(0.15), py + Inches(0.18), Inches(0.5), Inches(0.5), fill=dot_col)
    txt(s1, name, pill_x + Inches(0.75), py + Inches(0.1), Inches(2.8), Inches(0.35),
        sz=13, col=FG, bold=True)
    txt(s1, desc, pill_x + Inches(0.75), py + Inches(0.45), Inches(2.8), Inches(0.3),
        sz=11, col=MUTED)

# Bottom bar
box(s1, 0, H - Inches(0.45), W, Inches(0.45), fill=BG2, line=BORDER, lw=0.5)
txt(s1, "PS 26106 — EmailThreat: Forensic Intelligence Platform",
    Inches(0.3), H - Inches(0.38), Inches(7), Inches(0.3), sz=11, col=MUTED)
txt(s1, "●  Live at sih2026-email-threat.vercel.app",
    Inches(9), H - Inches(0.38), Inches(4), Inches(0.3), sz=11, col=ACCENT2, align=PP_ALIGN.RIGHT)


# ─────────────────────────────────────────────────────────────────────────────
# SLIDE 2 — Situation & Complication
# ─────────────────────────────────────────────────────────────────────────────
s2 = new_slide()
hdr(s2, "Situation & Complication", 2)
slide_title(s2, [
    ("Email phishing caused ", FG),
    ("$3.5B in losses in 2023", DANGER),
    (" — existing tools produce ", FG),
    ("no forensic intelligence", ACCENT2),
    (" after blocking", FG),
])

# 4 stat cards
stats = [
    ("3.4B", "phishing emails sent\nper day globally", ACCENT2),
    ("$3.5B", "total BEC & phishing\nlosses, FBI IC3 2023", DANGER),
    ("83%", "of organisations suffered\na phishing attack in 2023", WARNING),
    ("91%", "of all cyberattacks\nstart with phishing email", SUCCESS),
]
for i, (num, lbl_t, col) in enumerate(stats):
    cx = Inches(0.25) + i * Inches(3.25)
    box(s2, cx, Inches(1.6), Inches(3.1), Inches(1.55), fill=BG2, line=BORDER)
    txt(s2, num, cx, Inches(1.68), Inches(3.1), Inches(0.75), sz=36, col=col, bold=True, align=PP_ALIGN.CENTER)
    txt(s2, lbl_t, cx, Inches(2.44), Inches(3.1), Inches(0.55), sz=11, col=MUTED, align=PP_ALIGN.CENTER)

# Gap box
gap_y = Inches(3.3)
box(s2, Inches(0.25), gap_y, W - Inches(0.5), Inches(2.85), fill=RGBColor(0x1A, 0x0D, 0x0D), line=DANGER_D, lw=0.75)
box(s2, Inches(0.25), gap_y, Inches(0.06), Inches(2.85), fill=DANGER_D)
txt(s2, "WHAT CURRENT TOOLS LEAVE OUT", Inches(0.45), gap_y + Inches(0.15), Inches(6), Inches(0.28),
    sz=11, col=RGBColor(0xFC, 0xA5, 0xA5), bold=True)
gaps = [
    "No relay trace — analysts cannot see originating server, country, or ASN",
    "No campaign linkage — coordinated multi-target attacks appear as isolated incidents",
    "No forensic report — CERT teams have no court-admissible artifact",
    "Single-signal blockers — one bypass (valid DMARC on spoofed domain) defeats the whole tool",
]
for i, g in enumerate(gaps):
    gy = gap_y + Inches(0.5) + i * Inches(0.52)
    txt(s2, "✗", Inches(0.55), gy, Inches(0.3), Inches(0.4), sz=13, col=DANGER, bold=True)
    txt(s2, g, Inches(0.85), gy, W - Inches(1.2), Inches(0.45), sz=13, col=FG2)


# ─────────────────────────────────────────────────────────────────────────────
# SLIDE 3 — Research Question
# ─────────────────────────────────────────────────────────────────────────────
s3 = new_slide()
hdr(s3, "Research Question", 3)
slide_title(s3, [
    ("Current tools detect but cannot explain — single-signal blockers leave analysts without ", FG),
    ("attribution, hop traces, or campaign linkage", ACCENT2),
])

# Research question box
rq_y = Inches(1.6)
box(s3, Inches(0.25), rq_y, W - Inches(0.5), Inches(1.35), fill=RGBColor(0x0E, 0x14, 0x22), line=ACCENT2, lw=1.2)
mtxt(s3, [
    ("Can ", FG, False),
    ("five independent signal layers", ACCENT_L, True),
    (" — authentication, geolocation, AI classification,\n", FG, False),
    ("IP reputation, and WHOIS intelligence — be fused in ", FG, False),
    ("real time", ACCENT_L, True),
    ("\nto produce investigator-grade forensic reports?", FG, False),
], Inches(0.6), rq_y + Inches(0.18), W - Inches(1.2), Inches(1.0), sz=19, align=PP_ALIGN.CENTER)

# Gap table
tbl_y = Inches(3.1)
box(s3, Inches(0.25), tbl_y, W - Inches(0.5), Inches(0.3), fill=BG2, line=BORDER)
cols = ["Signal gap", "Threat it misses", "Our solution"]
col_w = [(Inches(2.2), MUTED), (Inches(5.2), MUTED), (Inches(5.0), MUTED)]
for i, (c, col) in enumerate(zip(cols, [MUTED, MUTED, MUTED])):
    cx = Inches(0.35) + sum(w for w, _ in col_w[:i])
    txt(s3, c.upper(), cx, tbl_y + Inches(0.04), col_w[i][0], Inches(0.25), sz=10, col=MUTED, bold=True)

rows = [
    ("Auth-only check", "Spear-phish with valid DMARC passes silently", "4 additional independent layers"),
    ("No relay trace", "Origin country / Tor exit node unknown", "ipinfo.io parallel geolocation"),
    ("No domain age", "Typosquat registered yesterday looks legit", "WHOIS + 30-day threshold"),
    ("No campaign view", "Coordinated attacks appear isolated", "Union-find clustering per analysis"),
]
for ri, row in enumerate(rows):
    ry = tbl_y + Inches(0.32) + ri * Inches(0.52)
    bg = BG2 if ri % 2 == 0 else BG
    box(s3, Inches(0.25), ry, W - Inches(0.5), Inches(0.5), fill=bg, line=BORDER, lw=0.3)
    widths = [Inches(2.2), Inches(5.2), Inches(5.0)]
    txt_cols = [RGBColor(0xFC, 0xA5, 0xA5), FG2, SUCCESS_L]
    for ci, (cell, w, tc) in enumerate(zip(row, widths, txt_cols)):
        cx = Inches(0.35) + sum(widths[:ci])
        txt(s3, cell, cx, ry + Inches(0.09), w - Inches(0.1), Inches(0.38), sz=12, col=tc)

# Contribution bar
cb_y = tbl_y + Inches(0.32) + 4 * Inches(0.52) + Inches(0.1)
box(s3, Inches(0.25), cb_y, W - Inches(0.5), Inches(0.55), fill=RGBColor(0x0B, 0x1C, 0x18), line=SUCCESS, lw=0.75)
txt(s3, "OUR CONTRIBUTION", Inches(0.45), cb_y + Inches(0.06), Inches(2.0), Inches(0.28), sz=10, col=SUCCESS, bold=True)
txt(s3, "First real-time, multi-signal forensic pipeline with PDF report generation and campaign clustering — deployable on serverless infrastructure",
    Inches(2.55), cb_y + Inches(0.1), W - Inches(3.0), Inches(0.38), sz=12, col=FG2)


# ─────────────────────────────────────────────────────────────────────────────
# SLIDE 4 — Our Approach
# ─────────────────────────────────────────────────────────────────────────────
s4 = new_slide()
hdr(s4, "Our Approach", 4)
slide_title(s4, [
    ("EmailThreat fuses ", FG),
    ("five independent signal layers", ACCENT2),
    (" in a streaming pipeline to produce\ninvestigator-grade forensic reports in real time", FG),
])

signals = [
    ("SIGNAL 01", "Authentication", "Parse SPF, DKIM, DMARC from Authentication-Results header. Instant — no API call.", "+20 / +20 / +15 pts", ACCENT, ACCENT_L),
    ("SIGNAL 02", "IP Geolocation", "All relay hops traced via ipinfo.io in parallel. Country, ASN, org mapped.", "Relay trace", WARNING, WARNING_L),
    ("SIGNAL 03", "AI Classification", "bart-large-mnli zero-shot. Labels: phishing / legitimate. No training data needed.", "+15 pts if >70%", PURPLE_D, PURPLE),
    ("SIGNAL 04", "WHOIS Intel", "Domain registration age. Newly registered (<30d) lookalike domains flagged. 7-day DB cache.", "+20 pts if <30d", SUCCESS, SUCCESS_L),
    ("SIGNAL 05", "IP Reputation", "AbuseIPDB confidence score on originating IP only. 7-day cache preserves quota.", "+10 pts if >50%", DANGER_D, RGBColor(0xFC, 0xA5, 0xA5)),
]

card_w = Inches(2.45)
gap = Inches(0.11)
start_x = Inches(0.25)
card_y = Inches(1.6)
card_h = Inches(3.85)

for i, (num, name, desc, pts, top_col, pts_col) in enumerate(signals):
    cx = start_x + i * (card_w + gap)
    box(s4, cx, card_y, card_w, card_h, fill=BG2, line=BORDER)
    box(s4, cx, card_y, card_w, Inches(0.05), fill=top_col)
    txt(s4, num, cx + Inches(0.15), card_y + Inches(0.15), card_w - Inches(0.3), Inches(0.25), sz=9, col=MUTED, bold=True)
    txt(s4, name, cx + Inches(0.15), card_y + Inches(0.42), card_w - Inches(0.3), Inches(0.45), sz=16, col=FG, bold=True)
    txt(s4, desc, cx + Inches(0.15), card_y + Inches(0.92), card_w - Inches(0.3), Inches(2.2), sz=12, col=MUTED, wrap=True)
    # Points badge
    box(s4, cx + Inches(0.12), card_y + card_h - Inches(0.55), card_w - Inches(0.24), Inches(0.42), fill=BG3, line=top_col, lw=0.5)
    txt(s4, pts, cx + Inches(0.15), card_y + card_h - Inches(0.52), card_w - Inches(0.3), Inches(0.38), sz=11, col=pts_col, bold=True, align=PP_ALIGN.CENTER)

# Formula bar
form_y = card_y + card_h + Inches(0.15)
box(s4, Inches(0.25), form_y, W - Inches(0.5), Inches(0.5), fill=BG3, line=BORDER)
mtxt(s4, [
    ("Score = ", FG, False),
    ("SPF", ACCENT_L, True), (" + ", ACCENT2, False),
    ("DKIM", ACCENT_L, True), (" + ", ACCENT2, False),
    ("DMARC", ACCENT_L, True), (" + ", ACCENT2, False),
    ("DomainAge", ACCENT_L, True), (" + ", ACCENT2, False),
    ("AI", PURPLE, True), (" + ", ACCENT2, False),
    ("AbuseIPDB", RGBColor(0xFC, 0xA5, 0xA5), True),
    ("  |  ", MUTED, False),
    ("max = 100 pts", SUCCESS, True),
    ("  |  ", MUTED, False),
    ("Floor rule: triple-auth-fail → score ≥ 40", WARNING, False),
], Inches(0.5), form_y + Inches(0.07), W - Inches(1.0), Inches(0.38), sz=13, align=PP_ALIGN.CENTER)


# ─────────────────────────────────────────────────────────────────────────────
# SLIDE 5 — Architecture
# ─────────────────────────────────────────────────────────────────────────────
s5 = new_slide()
hdr(s5, "System Architecture", 5)
slide_title(s5, [
    ("A ", FG),
    ("six-stage SSE pipeline", ACCENT2),
    (" circumvents serverless timeouts — each stage emits a live event as it completes", FG),
])

# Left column
lx = Inches(0.25)
ly = Inches(1.6)
lw = Inches(7.8)

lbl(s5, "Pipeline Stages", lx, ly, lw)

stages = [
    ("01", "Parse Headers", ".eml → hops, auth, URLs"),
    ("02", "Geolocate IPs", "Promise.all parallel"),
    ("03", "AI + WHOIS", "Parallel — zero extra latency"),
    ("04", "AbuseIPDB", "Originating IP only"),
    ("05", "Fraud Score", "Weighted 5-signal"),
    ("06", "DB + Campaign", "$transaction + union-find"),
]
pipe_h = Inches(0.62)
pipe_w = (lw - Inches(0.1)) / 6

for i, (num, name, desc) in enumerate(stages):
    px = lx + i * pipe_w
    py = ly + Inches(0.3)
    is_first = i == 0
    col = ACCENT if is_first else BG2
    bord = ACCENT if is_first else BORDER
    box(s5, px, py, pipe_w - Inches(0.05), pipe_h, fill=col, line=bord, lw=0.75)
    txt(s5, num, px + Inches(0.07), py + Inches(0.04), pipe_w, Inches(0.22), sz=9, col=FG if is_first else MUTED, bold=True)
    txt(s5, name, px + Inches(0.07), py + Inches(0.22), pipe_w - Inches(0.12), Inches(0.22), sz=11, col=FG, bold=True)
    txt(s5, desc, px + Inches(0.07), py + Inches(0.42), pipe_w - Inches(0.12), Inches(0.18), sz=9, col=MUTED)

# Why SSE info box
sse_y = ly + Inches(1.1)
box(s5, lx, sse_y, lw, Inches(0.8), fill=RGBColor(0x0B, 0x1C, 0x18), line=SUCCESS, lw=0.75)
box(s5, lx, sse_y, Inches(0.05), Inches(0.8), fill=SUCCESS)
txt(s5, "Why SSE?  Vercel serverless functions timeout at 10 seconds. SSE ReadableStream keeps the connection open past 10s while streaming live events — analysts see real-time progress instead of a blank spinner.",
    lx + Inches(0.2), sse_y + Inches(0.1), lw - Inches(0.3), Inches(0.65), sz=12, col=FG2)

# Tech stack
ts_y = sse_y + Inches(0.9)
lbl(s5, "Tech Stack", lx, ts_y, lw)
tech = ["Next.js 14 App Router", "Prisma v5", "Supabase PostgreSQL",
        "HuggingFace API", "ipinfo.io", "AbuseIPDB", "whoiser", "@react-pdf/renderer"]
tw = Inches(1.85)
for i, t in enumerate(tech):
    ti = i % 4
    tj = i // 4
    tx = lx + ti * (tw + Inches(0.08))
    ty_pos = ts_y + Inches(0.3) + tj * Inches(0.42)
    box(s5, tx, ty_pos, tw, Inches(0.35), fill=BG2, line=RGBColor(0x25, 0x63, 0xEB) if i < 3 else BORDER, lw=0.5)
    col = ACCENT_L if i < 3 else MUTED
    txt(s5, t, tx + Inches(0.1), ty_pos + Inches(0.06), tw - Inches(0.2), Inches(0.26), sz=10, col=col, bold=True)

# Right column
rx = Inches(8.35)
ry = Inches(1.6)
rw = W - rx - Inches(0.2)

lbl(s5, "Live SSE Stream Output", rx, ry, rw)
sse_events = [
    ('"step":"headers", "spf":"fail", "hopCount":1', ACCENT2),
    ('"step":"geolocation", "status":"done", "hops":1', SUCCESS),
    ('"step":"classification", "status":"unavailable"', WARNING),
    ('"step":"whois", "status":"done", "ageDays":null', SUCCESS),
    ('"step":"reputation", "abuseScore":100', DANGER),
    ('"step":"complete", "verdict":"Fraudulent", "score":65', DANGER),
]
for i, (ev, dot_col) in enumerate(sse_events):
    ey = ry + Inches(0.3) + i * Inches(0.48)
    is_final = i == len(sse_events) - 1
    box_col = RGBColor(0x16, 0x0A, 0x0A) if is_final else BG3
    bord_col = RGBColor(0xDC, 0x26, 0x26) if is_final else BORDER
    box(s5, rx, ey, rw, Inches(0.42), fill=box_col, line=bord_col, lw=0.5)
    box(s5, rx + Inches(0.1), ey + Inches(0.15), Inches(0.12), Inches(0.12), fill=dot_col)
    txt(s5, ev, rx + Inches(0.3), ey + Inches(0.08), rw - Inches(0.4), Inches(0.3), sz=10, col=FG2)

# DB schema
db_y = ry + Inches(0.3) + 6 * Inches(0.48) + Inches(0.1)
lbl(s5, "Database Schema (6 Tables)", rx, db_y, rw)
tables = ["emails", "email_ips", "email_domains", "email_urls", "campaigns", "email_campaigns"]
tw2 = (rw - Inches(0.1)) / 3
for i, t in enumerate(tables):
    ti = i % 3
    tj = i // 3
    tx = rx + ti * (tw2 + Inches(0.04))
    ty2 = db_y + Inches(0.3) + tj * Inches(0.42)
    box(s5, tx, ty2, tw2, Inches(0.36), fill=RGBColor(0x14, 0x12, 0x09), line=WARNING, lw=0.5)
    txt(s5, t, tx + Inches(0.05), ty2 + Inches(0.07), tw2 - Inches(0.1), Inches(0.26), sz=10, col=WARNING_L, bold=True, align=PP_ALIGN.CENTER)


# ─────────────────────────────────────────────────────────────────────────────
# SLIDE 6 — Authentication Signals
# ─────────────────────────────────────────────────────────────────────────────
s6 = new_slide()
hdr(s6, "Signal 1 — Authentication", 6)
slide_title(s6, [
    ("SPF, DKIM, and DMARC triple-failure contributes ", FG),
    ("up to 55 of 100 fraud points", DANGER),
    (" — the single largest signal layer", FG),
])

# Left: bar chart
lx6 = Inches(0.25)
ly6 = Inches(1.65)
lw6 = Inches(7.2)

bars = [
    ("SPF fail", 0.80, ACCENT, "+20 pts"),
    ("DKIM fail", 0.80, ACCENT, "+20 pts"),
    ("DMARC fail", 0.60, RGBColor(0x1D, 0x4E, 0xD8), "+15 pts"),
    ("Domain <30d", 0.80, RGBColor(0x0F, 0x17, 0x2A), "+20 pts"),
    ("AI >70%", 0.60, PURPLE_D, "+15 pts"),
    ("AbuseIPDB >50%", 0.40, DANGER_D, "+10 pts"),
]
bar_h = Inches(0.5)
bar_gap = Inches(0.12)
label_w = Inches(1.7)
for i, (lbl_t, pct, col, pts) in enumerate(bars):
    by = ly6 + i * (bar_h + bar_gap)
    txt(s6, lbl_t, lx6, by + Inches(0.13), label_w, Inches(0.3), sz=13, col=FG2, align=PP_ALIGN.RIGHT)
    track_x = lx6 + label_w + Inches(0.1)
    track_w = lw6 - label_w - Inches(0.1)
    box(s6, track_x, by, track_w, bar_h, fill=BG2, line=BORDER, lw=0.3)
    box(s6, track_x, by, int(track_w * pct), bar_h, fill=col)
    txt(s6, pts, track_x + Inches(0.1), by + Inches(0.13), Inches(1.2), Inches(0.28), sz=12, col=FG, bold=True)

# Key finding
kf_y = ly6 + 6 * (bar_h + bar_gap) + Inches(0.1)
box(s6, lx6, kf_y, lw6, Inches(0.65), fill=RGBColor(0x14, 0x11, 0x07), line=WARNING, lw=0.75)
txt(s6, "↑", lx6 + Inches(0.15), kf_y + Inches(0.08), Inches(0.25), Inches(0.4), sz=20, col=WARNING, bold=True)
txt(s6, "Auth contributes 55/100 pts — the most of any signal. Instant: parsed from headers with zero API calls. NIST SP 800-177r1 validated weights.",
    lx6 + Inches(0.5), kf_y + Inches(0.12), lw6 - Inches(0.6), Inches(0.48), sz=12, col=FG2)

# Right: auth badges + callout
rx6 = Inches(7.75)
ry6 = Inches(1.65)
rw6 = W - rx6 - Inches(0.2)

lbl(s6, "Our Live Test Result", rx6, ry6, rw6)

badge_w = (rw6 - Inches(0.2)) / 3
badge_h = Inches(1.1)
for i, (name, pts_t) in enumerate([("SPF", "+20 pts"), ("DKIM", "+20 pts"), ("DMARC", "+15 pts")]):
    bx = rx6 + i * (badge_w + Inches(0.1))
    by = ry6 + Inches(0.3)
    box(s6, bx, by, badge_w, badge_h, fill=RGBColor(0x18, 0x0A, 0x0A), line=DANGER_D, lw=0.75)
    txt(s6, name, bx, by + Inches(0.08), badge_w, Inches(0.32), sz=11, col=RGBColor(0xFC, 0xA5, 0xA5), bold=True, align=PP_ALIGN.CENTER)
    txt(s6, "FAIL", bx, by + Inches(0.42), badge_w, Inches(0.42), sz=22, col=DANGER, bold=True, align=PP_ALIGN.CENTER)
    txt(s6, pts_t, bx, by + Inches(0.82), badge_w, Inches(0.22), sz=11, col=MUTED, align=PP_ALIGN.CENTER)

# Triple-fail callout
tf_y = ry6 + Inches(1.55)
box(s6, rx6, tf_y, rw6, Inches(1.25), fill=RGBColor(0x16, 0x0A, 0x0A), line=DANGER_D, lw=0.75)
box(s6, rx6, tf_y, Inches(0.06), Inches(1.25), fill=DANGER_D)
txt(s6, "TRIPLE-FAIL FLOOR RULE", rx6 + Inches(0.18), tf_y + Inches(0.1), rw6, Inches(0.25), sz=10, col=RGBColor(0xFC, 0xA5, 0xA5), bold=True)
rules = [
    "If SPF + DKIM + DMARC all fail → score = max(40, computed_score)",
    "Guarantees at least Suspicious verdict regardless of other signals",
    "Prevents clean IP from masking unauthenticated sender",
]
for i, r in enumerate(rules):
    txt(s6, "•  " + r, rx6 + Inches(0.2), tf_y + Inches(0.38) + i * Inches(0.28), rw6 - Inches(0.3), Inches(0.28), sz=11, col=FG2)

# Code block
code_y = tf_y + Inches(1.35)
box(s6, rx6, code_y, rw6, Inches(1.0), fill=BG3, line=BORDER, lw=0.5)
code = "Authentication-Results: mx.example.com;\n  dkim=fail header.d=paypa1-verify.com\n  spf=fail smtp.mailfrom=paypa1-verify.com\n  dmarc=fail header.from=paypa1-verify.com"
txt(s6, code, rx6 + Inches(0.15), code_y + Inches(0.08), rw6 - Inches(0.2), Inches(0.88), sz=10, col=RGBColor(0xA5, 0xD6, 0xFF))


# ─────────────────────────────────────────────────────────────────────────────
# SLIDE 7 — AI + WHOIS
# ─────────────────────────────────────────────────────────────────────────────
s7 = new_slide()
hdr(s7, "Signals 3 & 4 — AI + WHOIS", 7)
slide_title(s7, [
    ("AI zero-shot classification and WHOIS domain-age run ", FG),
    ("in parallel", ACCENT2),
    (" — two independent layers added with ", FG),
    ("zero extra latency", ACCENT2),
])

# Promise.all bar
pa_y = Inches(1.6)
box(s7, Inches(0.25), pa_y, W - Inches(0.5), Inches(0.5), fill=RGBColor(0x0C, 0x12, 0x20), line=ACCENT, lw=0.75)
mtxt(s7, [
    ("Stage 3 runs both simultaneously:  ", FG2, False),
    ("const [classifyResult, whoisResult] = await Promise.all([classifyPhishing(...), lookupWhois(...)])", ACCENT_L, True),
], Inches(0.5), pa_y + Inches(0.1), W - Inches(1.0), Inches(0.32), sz=12, align=PP_ALIGN.LEFT)

# Two parallel boxes
half_w = (W - Inches(0.75)) / 2
left_x = Inches(0.25)
right_x = left_x + half_w + Inches(0.25)
par_y = pa_y + Inches(0.62)
par_h = Inches(3.1)

# AI box
box(s7, left_x, par_y, half_w, par_h, fill=RGBColor(0x0F, 0x0D, 0x1A), line=PURPLE_D, lw=1.0)
txt(s7, "AI Phishing Classification", left_x + Inches(0.2), par_y + Inches(0.15), half_w - Inches(0.4), Inches(0.4), sz=16, col=PURPLE, bold=True)
ai_rows = [
    ("Model", "facebook/bart-large-mnli"),
    ("Method", "Zero-shot classification — no labelled training data"),
    ("Labels", '"phishing"  vs  "legitimate"'),
    ("Input", "Email subject line + full body text"),
    ("Threshold", "Score > 0.70 → +15 fraud points"),
    ("Stored", "Raw confidence saved to DB as hfScore"),
]
for i, (k, v) in enumerate(ai_rows):
    ry7 = par_y + Inches(0.65) + i * Inches(0.4)
    txt(s7, k, left_x + Inches(0.2), ry7, Inches(1.1), Inches(0.35), sz=11, col=MUTED, bold=True)
    txt(s7, v, left_x + Inches(1.35), ry7, half_w - Inches(1.55), Inches(0.35), sz=11, col=PURPLE if k in ("Model", "Labels") else FG2)

# WHOIS box
box(s7, right_x, par_y, half_w, par_h, fill=RGBColor(0x0B, 0x18, 0x14), line=SUCCESS, lw=1.0)
txt(s7, "WHOIS Domain Intelligence", right_x + Inches(0.2), par_y + Inches(0.15), half_w - Inches(0.4), Inches(0.4), sz=16, col=SUCCESS_L, bold=True)
whois_rows = [
    ("Library", "whoiser (Node.js)"),
    ("Target", "Sender's From: domain"),
    ("Metrics", "Registration date → age in days, registrar name"),
    ("Threshold", "Domain < 30 days old → +20 fraud points"),
    ("Timeout", "5-second Promise.race — never blocks pipeline"),
    ("Cache", "7-day DB cache per domain — preserves rate limit"),
]
for i, (k, v) in enumerate(whois_rows):
    ry7 = par_y + Inches(0.65) + i * Inches(0.4)
    txt(s7, k, right_x + Inches(0.2), ry7, Inches(1.1), Inches(0.35), sz=11, col=MUTED, bold=True)
    txt(s7, v, right_x + Inches(1.35), ry7, half_w - Inches(1.55), Inches(0.35), sz=11, col=SUCCESS_L if k in ("Library", "Threshold") else FG2)

# Bottom resilience cards
res_y = par_y + par_h + Inches(0.15)
res_items = [
    ("HuggingFace Cold Start", "Marked status: \"unavailable\" — pipeline continues. Keep-alive GitHub Actions cron warms model every 3 days."),
    ("WHOIS Null Result", "New TLDs and ccTLDs often return null. Treated as zero contribution — not an error. No score penalty for unknown age."),
    ("Why Zero-Shot vs Fine-Tuned?", "Fine-tuning needs 10K+ labelled samples + retraining. Zero-shot generalises instantly. Reported F1 ≈ 0.71 (Mishra & Sharma, 2022)."),
]
res_w = (W - Inches(0.75)) / 3
for i, (title, body) in enumerate(res_items):
    rx7 = Inches(0.25) + i * (res_w + Inches(0.125))
    box(s7, rx7, res_y, res_w, Inches(1.0), fill=BG2, line=BORDER, lw=0.5)
    txt(s7, title.upper(), rx7 + Inches(0.15), res_y + Inches(0.1), res_w - Inches(0.3), Inches(0.25), sz=10, col=WARNING_L, bold=True)
    txt(s7, body, rx7 + Inches(0.15), res_y + Inches(0.38), res_w - Inches(0.3), Inches(0.58), sz=11, col=FG2, wrap=True)


# ─────────────────────────────────────────────────────────────────────────────
# SLIDE 8 — AbuseIPDB
# ─────────────────────────────────────────────────────────────────────────────
s8 = new_slide()
hdr(s8, "Signal 5 — IP Reputation", 8)
slide_title(s8, [
    ("AbuseIPDB confidence ≥ 50% on the originating IP adds 10 fraud points — our live test returned ", FG),
    ("100% confidence", DANGER),
])

# Left: bar chart
lx8 = Inches(0.25)
ly8 = Inches(1.62)
lw8 = Inches(7.2)

lbl(s8, "Average Fraud Score by AbuseIPDB Confidence Band", lx8, ly8, lw8)

abuse_bars = [
    ("0–10%  Clean IP", 0.22, SUCCESS, "avg score: 22"),
    ("11–50%  Low risk", 0.38, WARNING, "avg score: 38"),
    ("51–90%  High risk", 0.58, ORANGE, "avg score: 58"),
    ("91–100%  Known malicious", 0.75, DANGER, "avg score: 75"),
]
bar_h8 = Inches(0.52)
bar_gap8 = Inches(0.15)
lbl_w8 = Inches(2.2)
for i, (lbl_t, pct, col, score_t) in enumerate(abuse_bars):
    by = ly8 + Inches(0.3) + i * (bar_h8 + bar_gap8)
    txt(s8, lbl_t, lx8, by + Inches(0.14), lbl_w8, Inches(0.28), sz=12, col=col, bold=True)
    track_x = lx8 + lbl_w8 + Inches(0.1)
    track_w = lw8 - lbl_w8 - Inches(1.0)
    box(s8, track_x, by, track_w, bar_h8, fill=BG2, line=BORDER, lw=0.3)
    box(s8, track_x, by, int(track_w * pct), bar_h8, fill=col)
    txt(s8, score_t, track_x + track_w + Inches(0.1), by + Inches(0.14), Inches(0.9), Inches(0.28), sz=12, col=MUTED)

# 100% highlight box
hi_y = ly8 + Inches(0.3) + 4 * (bar_h8 + bar_gap8) + Inches(0.1)
box(s8, lx8, hi_y, lw8, Inches(0.95), fill=RGBColor(0x1A, 0x0A, 0x0A), line=DANGER_D, lw=0.75)
txt(s8, "100%", lx8 + Inches(0.15), hi_y + Inches(0.1), Inches(1.5), Inches(0.72), sz=44, col=DANGER, bold=True)
txt(s8, "AbuseIPDB confidence on 185.220.101.47\nDocumented Tor exit relay — contributing +10 fraud pts",
    lx8 + Inches(1.75), hi_y + Inches(0.18), lw8 - Inches(2.0), Inches(0.65), sz=13, col=RGBColor(0xFC, 0xA5, 0xA5))

# Right: live test table
rx8 = Inches(7.75)
ry8 = Inches(1.62)
rw8 = W - rx8 - Inches(0.2)

lbl(s8, "Live Test — paypa1-verify.com", rx8, ry8, rw8)

live_rows = [
    ("Sender domain", "paypa1-verify.com", FG2, False),
    ("Originating IP", "185.220.101.47", FG2, False),
    ("IP type", "Tor exit node", DANGER, True),
    ("Country", "Germany (DE)", FG2, False),
    ("AbuseIPDB", "100% confidence", RGBColor(0xFC, 0xA5, 0xA5), True),
    ("SPF/DKIM/DMARC", "fail / fail / fail", DANGER, True),
    ("AI classify", "unavailable", WARNING, False),
    ("WHOIS age", "null (new TLD)", MUTED, False),
    ("Fraud score", "65 / 100", RGBColor(0xFC, 0xA5, 0xA5), True),
    ("Verdict", "FRAUDULENT", DANGER, True),
]
row_h = Inches(0.42)
hdr_row_y = ry8 + Inches(0.3)
box(s8, rx8, hdr_row_y, rw8, row_h * 0.7, fill=BG2, line=BORDER, lw=0.3)
txt(s8, "FIELD", rx8 + Inches(0.1), hdr_row_y + Inches(0.06), Inches(1.5), Inches(0.25), sz=9, col=MUTED, bold=True)
txt(s8, "VALUE", rx8 + Inches(1.65), hdr_row_y + Inches(0.06), rw8 - Inches(1.75), Inches(0.25), sz=9, col=MUTED, bold=True)

for i, (field, val, col, highlight) in enumerate(live_rows):
    ry8r = hdr_row_y + row_h * 0.7 + i * row_h
    bg = RGBColor(0x18, 0x0A, 0x0A) if highlight else (BG2 if i % 2 == 0 else BG)
    box(s8, rx8, ry8r, rw8, row_h, fill=bg, line=BORDER, lw=0.3)
    txt(s8, field, rx8 + Inches(0.1), ry8r + Inches(0.1), Inches(1.5), Inches(0.28), sz=11, col=MUTED)
    txt(s8, val, rx8 + Inches(1.65), ry8r + Inches(0.1), rw8 - Inches(1.75), Inches(0.28), sz=11, col=col, bold=highlight)

# Design note
note_y = hdr_row_y + row_h * 0.7 + 10 * row_h + Inches(0.05)
box(s8, rx8, note_y, rw8, Inches(0.6), fill=BG2, line=BORDER, lw=0.5)
txt(s8, "Design: Only the originating IP is checked against AbuseIPDB (first public hop). 7-day DB cache preserves the 1,000 checks/day free-tier limit.",
    rx8 + Inches(0.12), note_y + Inches(0.08), rw8 - Inches(0.24), Inches(0.48), sz=11, col=MUTED)


# ─────────────────────────────────────────────────────────────────────────────
# SLIDE 9 — Fraud Score Engine
# ─────────────────────────────────────────────────────────────────────────────
s9 = new_slide()
hdr(s9, "Fraud Score Engine", 9)
slide_title(s9, [
    ("A weighted five-signal fraud score classifies emails as Legitimate, Suspicious, or Fraudulent — ", FG),
    ("each layer contributes independently", ACCENT2),
])

# Formula
f_y = Inches(1.62)
box(s9, Inches(0.25), f_y, W - Inches(0.5), Inches(0.72), fill=BG3, line=BORDER, lw=0.5)
mtxt(s9, [
    ("Score = ", FG, False),
    ("SPF", ACCENT_L, True), ("(20)", MUTED, False), (" + ", ACCENT2, False),
    ("DKIM", ACCENT_L, True), ("(20)", MUTED, False), (" + ", ACCENT2, False),
    ("DMARC", ACCENT_L, True), ("(15)", MUTED, False), (" + ", ACCENT2, False),
    ("DomainAge", ACCENT_L, True), ("(20)", MUTED, False), (" + ", ACCENT2, False),
    ("HFClassifier", PURPLE, True), ("(15)", MUTED, False), (" + ", ACCENT2, False),
    ("AbuseIPDB", RGBColor(0xFC, 0xA5, 0xA5), True), ("(10)", MUTED, False),
    ("  |  ", MUTED, False),
    ("max = 100", SUCCESS, True),
], Inches(0.5), f_y + Inches(0.14), W - Inches(1.0), Inches(0.45), sz=16, align=PP_ALIGN.CENTER)

# Verdict cards
vc_y = f_y + Inches(0.85)
vc_w = (W - Inches(0.75)) / 3
verdicts = [
    ("Legitimate", "Score 0 – 39", "Low risk. Minor signals present\nbut no strong indicators.", SUCCESS, RGBColor(0x10, 0xB9, 0x81)),
    ("Suspicious", "Score 40 – 59", "Multiple signals triggered.\nManual review recommended.", WARNING, WARNING_L),
    ("Fraudulent", "Score 60 – 100", "Strong multi-signal consensus.\nBlock and investigate.", DANGER_D, RGBColor(0xFC, 0xA5, 0xA5)),
]
for i, (name, rng, ex, border_col, text_col) in enumerate(verdicts):
    vx = Inches(0.25) + i * (vc_w + Inches(0.125))
    box(s9, vx, vc_y, vc_w, Inches(1.8), fill=BG2, line=border_col, lw=1.2)
    txt(s9, name, vx, vc_y + Inches(0.2), vc_w, Inches(0.52), sz=24, col=text_col, bold=True, align=PP_ALIGN.CENTER)
    txt(s9, rng, vx, vc_y + Inches(0.75), vc_w, Inches(0.38), sz=14, col=text_col, bold=True, align=PP_ALIGN.CENTER)
    txt(s9, ex, vx, vc_y + Inches(1.2), vc_w, Inches(0.55), sz=12, col=MUTED, align=PP_ALIGN.CENTER)

# Rule boxes
rb_y = vc_y + Inches(1.95)
rb_w = (W - Inches(0.75)) / 3
rule_items = [
    ("Triple-Auth-Fail Floor Rule", "If SPF + DKIM + DMARC all fail → score = max(40, computed_score).\nGuarantees at least Suspicious verdict. Prevents clean IP from masking unauthenticated sender.", DANGER_D, RGBColor(0x16, 0x0A, 0x0A)),
    ("Signal Independence", "Signals are additive and independent. Spear-phish with valid DMARC still scored by AI + domain age + AbuseIPDB. No single signal required to reach Fraudulent.", BORDER, BG2),
    ("Deduplication", "SHA-256 hash of raw .eml detects duplicates. Same email resubmitted returns cached result instantly — no re-analysis, no API calls.", BORDER, BG2),
]
for i, (title, body, border_col, bg_col) in enumerate(rule_items):
    rx9 = Inches(0.25) + i * (rb_w + Inches(0.125))
    box(s9, rx9, rb_y, rb_w, Inches(2.0), fill=bg_col, line=border_col, lw=1.0)
    if i == 0:
        box(s9, rx9, rb_y, Inches(0.05), Inches(2.0), fill=DANGER_D)
    txt(s9, title.upper(), rx9 + Inches(0.18), rb_y + Inches(0.14), rb_w - Inches(0.3), Inches(0.28), sz=10, col=RGBColor(0xFC, 0xA5, 0xA5) if i == 0 else MUTED, bold=True)
    txt(s9, body, rx9 + Inches(0.18), rb_y + Inches(0.48), rb_w - Inches(0.3), Inches(1.4), sz=12, col=FG2, wrap=True)


# ─────────────────────────────────────────────────────────────────────────────
# SLIDE 10 — Campaign Attribution
# ─────────────────────────────────────────────────────────────────────────────
s10 = new_slide()
hdr(s10, "Campaign Attribution", 10)
slide_title(s10, [
    ("Union-find clustering groups emails sharing originating IPs or sender domains into ", FG),
    ("coordinated attack campaigns", ACCENT2),
    (" in a single DB transaction", FG),
])

# Left: algo steps
lx10 = Inches(0.25)
ly10 = Inches(1.62)
lw10 = Inches(7.8)

algo_steps = [
    ("1", "On each new email, query for existing emails sharing any public relay IP or the sender domain"),
    ("2", "Match found: new email joins the matching campaign immediately"),
    ("3", "Multiple matches across different campaigns: all campaigns merged — lowest ID wins (union-find root). All EmailCampaign rows reparented to survivor"),
    ("4", "No match: new singleton campaign created for this email"),
]
step_h = Inches(0.65)
for i, (num, desc) in enumerate(algo_steps):
    sy = ly10 + i * (step_h + Inches(0.1))
    box(s10, lx10, sy, lw10, step_h, fill=BG2, line=BORDER, lw=0.5)
    box(s10, lx10 + Inches(0.12), sy + Inches(0.14), Inches(0.36), Inches(0.36), fill=RGBColor(0x1D, 0x3A, 0x6B))
    txt(s10, num, lx10 + Inches(0.12), sy + Inches(0.14), Inches(0.36), Inches(0.36), sz=12, col=ACCENT_L, bold=True, align=PP_ALIGN.CENTER)
    txt(s10, desc, lx10 + Inches(0.6), sy + Inches(0.12), lw10 - Inches(0.75), step_h - Inches(0.22), sz=12, col=FG2, wrap=True)

# Prop chips
chip_y = ly10 + 4 * (step_h + Inches(0.1)) + Inches(0.1)
chips = ["IP-based linking\nany shared relay", "Domain-based linking\nsame From: domain", "Retroactive merge\npast campaigns unified"]
chip_w = (lw10 - Inches(0.2)) / 3
for i, c in enumerate(chips):
    cx = lx10 + i * (chip_w + Inches(0.1))
    box(s10, cx, chip_y, chip_w, Inches(0.7), fill=RGBColor(0x0B, 0x1C, 0x18), line=SUCCESS, lw=0.5)
    txt(s10, c, cx, chip_y + Inches(0.06), chip_w, Inches(0.62), sz=12, col=SUCCESS_L, align=PP_ALIGN.CENTER)

# Atomic box
at_y = chip_y + Inches(0.82)
box(s10, lx10, at_y, lw10, Inches(0.72), fill=RGBColor(0x10, 0x0D, 0x1C), line=PURPLE_D, lw=0.75)
txt(s10, "Atomic: All clustering runs inside a single Prisma $transaction — the DB write, IP insert, domain insert, URL insert, and campaign assignment either all succeed or all roll back.",
    lx10 + Inches(0.15), at_y + Inches(0.1), lw10 - Inches(0.3), Inches(0.58), sz=12, col=FG2, wrap=True)

# Right: merge diagram
rx10 = Inches(8.3)
ry10 = Inches(1.62)
rw10 = W - rx10 - Inches(0.2)

lbl(s10, "Campaign Merge Example", rx10, ry10, rw10)

dg_y = ry10 + Inches(0.3)
dg_h = Inches(5.1)
box(s10, rx10, dg_y, rw10, dg_h, fill=BG2, line=BORDER, lw=0.5)

# Campaign A + B
camp_w = (rw10 - Inches(0.4)) / 2 - Inches(0.1)
box(s10, rx10 + Inches(0.15), dg_y + Inches(0.15), camp_w, Inches(0.85), fill=RGBColor(0x0D, 0x15, 0x2C), line=ACCENT, lw=0.75)
txt(s10, "Campaign A", rx10 + Inches(0.15), dg_y + Inches(0.2), camp_w, Inches(0.35), sz=13, col=FG, bold=True, align=PP_ALIGN.CENTER)
txt(s10, "Email 1 · Email 2", rx10 + Inches(0.15), dg_y + Inches(0.55), camp_w, Inches(0.28), sz=11, col=MUTED, align=PP_ALIGN.CENTER)

cx2 = rx10 + Inches(0.15) + camp_w + Inches(0.2)
box(s10, cx2, dg_y + Inches(0.15), camp_w, Inches(0.85), fill=RGBColor(0x0A, 0x13, 0x25), line=ACCENT2, lw=0.75)
txt(s10, "Campaign B", cx2, dg_y + Inches(0.2), camp_w, Inches(0.35), sz=13, col=FG, bold=True, align=PP_ALIGN.CENTER)
txt(s10, "Email 3 · Email 4", cx2, dg_y + Inches(0.55), camp_w, Inches(0.28), sz=11, col=MUTED, align=PP_ALIGN.CENTER)

# Email 5 new
new_w = camp_w + Inches(0.3)
new_x = rx10 + (rw10 - new_w) / 2
box(s10, new_x, dg_y + Inches(1.2), new_w, Inches(0.85), fill=RGBColor(0x19, 0x14, 0x06), line=WARNING, lw=1.0)
txt(s10, "Email 5 (new)", new_x, dg_y + Inches(1.25), new_w, Inches(0.35), sz=13, col=WARNING_L, bold=True, align=PP_ALIGN.CENTER)
txt(s10, "Shares IP with A · Shares domain with B", new_x, dg_y + Inches(1.62), new_w, Inches(0.28), sz=11, col=MUTED, align=PP_ALIGN.CENTER)

txt(s10, "↓ merge triggered", rx10, dg_y + Inches(2.2), rw10, Inches(0.4), sz=18, col=ACCENT2, bold=True, align=PP_ALIGN.CENTER)

# Merged campaign
box(s10, rx10 + Inches(0.15), dg_y + Inches(2.7), rw10 - Inches(0.3), Inches(0.9), fill=RGBColor(0x1A, 0x08, 0x08), line=DANGER_D, lw=1.0)
txt(s10, "Campaign A (survivor)", rx10 + Inches(0.15), dg_y + Inches(2.78), rw10 - Inches(0.3), Inches(0.38), sz=14, col=RGBColor(0xFC, 0xA5, 0xA5), bold=True, align=PP_ALIGN.CENTER)
txt(s10, "Emails 1, 2, 3, 4, 5 — lowest ID wins", rx10 + Inches(0.15), dg_y + Inches(3.15), rw10 - Inches(0.3), Inches(0.28), sz=11, col=MUTED, align=PP_ALIGN.CENTER)
txt(s10, "Campaign B deleted. All rows reparented.", rx10, dg_y + Inches(3.72), rw10, Inches(0.28), sz=11, col=MUTED, align=PP_ALIGN.CENTER)

# Result in UI
res_y10 = dg_y + dg_h + Inches(0.1)
box(s10, rx10, res_y10, rw10, Inches(0.62), fill=BG2, line=BORDER, lw=0.5)
lbl(s10, "Result in UI", rx10 + Inches(0.15), res_y10 + Inches(0.06), rw10)
txt(s10, "Campaigns page shows correlated emails grouped · Campaign attribution visible on result page · Coordinated attacks show as clusters of 2+ emails",
    rx10 + Inches(0.15), res_y10 + Inches(0.3), rw10 - Inches(0.3), Inches(0.28), sz=11, col=FG2)


# ─────────────────────────────────────────────────────────────────────────────
# SLIDE 11 — Live End-to-End Demo
# ─────────────────────────────────────────────────────────────────────────────
s11 = new_slide()
hdr(s11, "Live End-to-End Test", 11)
slide_title(s11, [
    ("End-to-end analysis of a real phishing email completed in ", FG),
    ("under 30 seconds", ACCENT2),
    (" — verdict: ", FG),
    ("Fraudulent, 65/100", DANGER),
])

# Left: SSE stream
lx11 = Inches(0.25)
ly11 = Inches(1.62)
lw11 = Inches(5.8)

lbl(s11, "SSE Stream (live)", lx11, ly11, lw11)

sse11 = [
    ('"step":"headers", "spf":"fail", "dkim":"fail", "dmarc":"fail", "hopCount":1', ACCENT2),
    ('"step":"geolocation", "status":"done", "hops":1', SUCCESS),
    ('"step":"classification", "status":"unavailable", "score":null', WARNING),
    ('"step":"whois", "status":"done", "ageDays":null', SUCCESS),
    ('"step":"reputation", "status":"done", "abuseScore":100', DANGER),
    ('"step":"complete", "verdict":"Fraudulent", "score":65', DANGER),
]
for i, (ev, col) in enumerate(sse11):
    ey = ly11 + Inches(0.3) + i * Inches(0.52)
    is_fin = i == 5
    box(s11, lx11, ey, lw11, Inches(0.46), fill=RGBColor(0x16, 0x0A, 0x0A) if is_fin else BG3,
        line=RGBColor(0xDC, 0x26, 0x26) if is_fin else BORDER, lw=0.5)
    box(s11, lx11 + Inches(0.1), ey + Inches(0.17), Inches(0.1), Inches(0.1), fill=col)
    txt(s11, ev, lx11 + Inches(0.28), ey + Inches(0.08), lw11 - Inches(0.38), Inches(0.32), sz=10, col=FG2)

# Timing bar
tm_y = ly11 + Inches(0.3) + 6 * Inches(0.52) + Inches(0.12)
box(s11, lx11, tm_y, lw11, Inches(0.85), fill=RGBColor(0x0A, 0x18, 0x14), line=SUCCESS, lw=0.75)
txt(s11, "<30s", lx11 + Inches(0.15), tm_y + Inches(0.1), Inches(1.2), Inches(0.65), sz=34, col=SUCCESS, bold=True)
txt(s11, "End-to-end pipeline time\nFrom .eml paste to verdict + PDF available", lx11 + Inches(1.45), tm_y + Inches(0.12), lw11 - Inches(1.6), Inches(0.65), sz=12, col=FG2)

# IOC URL
url_y = tm_y + Inches(0.97)
box(s11, lx11, url_y, lw11, Inches(0.65), fill=BG3, line=BORDER, lw=0.5)
txt(s11, "IOC — Phishing URL extracted:", lx11 + Inches(0.12), url_y + Inches(0.06), lw11 - Inches(0.24), Inches(0.24), sz=11, col=MUTED)
txt(s11, "http://paypa1-verify.com/secure/login?cmd=_account-verify&token=ABC123XYZ", lx11 + Inches(0.12), url_y + Inches(0.3), lw11 - Inches(0.24), Inches(0.28), sz=10, col=RGBColor(0xFC, 0xA5, 0xA5))

# Right: forensic findings
rx11 = Inches(6.35)
ry11 = Inches(1.62)
rw11 = W - rx11 - Inches(0.2)

lbl(s11, "Forensic Findings", rx11, ry11, rw11)

findings = [
    ("Sender domain", "paypa1-verify.com", FG2, False),
    ("Originating IP", "185.220.101.47", FG2, False),
    ("IP type", "Tor exit node (dan.me.uk)", WARNING_L, True),
    ("Country / ASN", "Germany (DE)", FG2, False),
    ("AbuseIPDB", "100% confidence score", RGBColor(0xFC, 0xA5, 0xA5), True),
    ("Auth SPF/DKIM/DMARC", "fail / fail / fail", RGBColor(0xFC, 0xA5, 0xA5), True),
    ("AI classification", "Unavailable (cold start)", WARNING, False),
    ("WHOIS age", "null (new TLD)", MUTED, False),
    ("Score breakdown", "SPF(20)+DKIM(20)+DMARC(15)+Abuse(10) = 65", FG2, False),
]
r_h = Inches(0.4)
hdr11_y = ry11 + Inches(0.3)
box(s11, rx11, hdr11_y, rw11, r_h * 0.7, fill=BG2, line=BORDER, lw=0.3)
col_w11 = [Inches(1.8), rw11 - Inches(1.8)]
txt(s11, "FIELD", rx11 + Inches(0.1), hdr11_y + Inches(0.06), col_w11[0], Inches(0.22), sz=9, col=MUTED, bold=True)
txt(s11, "VALUE", rx11 + col_w11[0] + Inches(0.1), hdr11_y + Inches(0.06), col_w11[1], Inches(0.22), sz=9, col=MUTED, bold=True)

for i, (field, val, col, hl) in enumerate(findings):
    rr_y = hdr11_y + r_h * 0.7 + i * r_h
    bg = RGBColor(0x18, 0x0A, 0x0A) if hl else (BG2 if i % 2 == 0 else BG)
    box(s11, rx11, rr_y, rw11, r_h, fill=bg, line=BORDER, lw=0.3)
    txt(s11, field, rx11 + Inches(0.1), rr_y + Inches(0.09), col_w11[0] - Inches(0.1), Inches(0.27), sz=11, col=MUTED)
    txt(s11, val, rx11 + col_w11[0] + Inches(0.1), rr_y + Inches(0.09), col_w11[1] - Inches(0.2), Inches(0.27), sz=11, col=col, bold=hl)

# Verdict big
vb_y = hdr11_y + r_h * 0.7 + 9 * r_h + Inches(0.1)
box(s11, rx11, vb_y, rw11, Inches(1.05), fill=RGBColor(0x1A, 0x07, 0x07), line=DANGER_D, lw=1.2)
txt(s11, "VERDICT", rx11 + Inches(0.2), vb_y + Inches(0.1), Inches(2), Inches(0.28), sz=11, col=RGBColor(0xFC, 0xA5, 0xA5), bold=True)
txt(s11, "FRAUDULENT", rx11 + Inches(0.2), vb_y + Inches(0.4), Inches(3.5), Inches(0.55), sz=26, col=DANGER, bold=True)
txt(s11, "65", rx11 + rw11 - Inches(1.6), vb_y + Inches(0.05), Inches(1.1), Inches(0.85), sz=44, col=DANGER, bold=True, align=PP_ALIGN.RIGHT)
txt(s11, "/100", rx11 + rw11 - Inches(0.65), vb_y + Inches(0.55), Inches(0.55), Inches(0.32), sz=14, col=MUTED)

# PDF note
pdf_y = vb_y + Inches(1.15)
box(s11, rx11, pdf_y, rw11, Inches(0.52), fill=BG2, line=BORDER, lw=0.5)
txt(s11, "PDF report at /api/report/<id> — 8 sections: Executive Summary, Authentication, Geolocation Trace, IOCs, Campaign Attribution",
    rx11 + Inches(0.12), pdf_y + Inches(0.1), rw11 - Inches(0.24), Inches(0.38), sz=11, col=MUTED)


# ─────────────────────────────────────────────────────────────────────────────
# SLIDE 12 — Limitations & Future Work
# ─────────────────────────────────────────────────────────────────────────────
s12 = new_slide()
hdr(s12, "Limitations & Future Work", 12)
slide_title(s12, [
    ("Current system is production-ready for forensic analysis — three limitations identify ", FG),
    ("clear upgrade paths", ACCENT2),
])

# Current limitations
lim_y = Inches(1.65)
lbl(s12, "Current Limitations", Inches(0.25), lim_y, Inches(6.3))

limitations = [
    ("HuggingFace Cold Start", "The free-tier Inference API hibernates after inactivity. The keep-alive GitHub Actions cron fires every 3 days, but the first post-hibernation analysis loses the +15 AI score contribution (marked unavailable). A paid HF endpoint or a self-hosted model eliminates this.", WARNING_D := RGBColor(0xD9, 0x77, 0x06)),
    ("WHOIS Null for New TLDs", "Many newer TLDs and country-code TLDs do not respond to standard WHOIS queries, returning null for domain age. Emails from paypa1-verify.com fell into this case — the +20 domain-age signal was not available.", ORANGE),
    ("Single-Tenant Deployment", "The platform runs as a single Next.js deployment. Under high load (batch CERT submissions), the SSE pipeline may exhaust Vercel’s function concurrency. Rate limiting and a queue layer are needed for enterprise scale.", MUTED),
]

for i, (title, body, col) in enumerate(limitations):
    ly_i = lim_y + Inches(0.3) + i * Inches(1.45)
    box(s12, Inches(0.25), ly_i, Inches(6.3), Inches(1.35), fill=BG2, line=BORDER, lw=0.5)
    box(s12, Inches(0.25), ly_i, Inches(0.06), Inches(1.35), fill=col)
    txt(s12, f"L{i+1}  {title}", Inches(0.42), ly_i + Inches(0.1), Inches(5.8), Inches(0.3), sz=13, col=FG, bold=True)
    txt(s12, body, Inches(0.42), ly_i + Inches(0.42), Inches(5.8), Inches(0.88), sz=11, col=FG2, wrap=True)

# Future work
fw_y = Inches(1.65)
lbl(s12, "Future Directions", Inches(6.85), fw_y, Inches(6.3))

future = [
    ("Fine-Tuned Classification Model", "Replace zero-shot BART with a fine-tuned model trained on the CEAS 2008 or SpamAssassin dataset. Expected: F1 improvement from ~0.71 to 0.88+. Containerise as a sidecar service.", SUCCESS),
    ("Attachment & URL Sandbox", "Execute email attachments and URLs in a sandboxed VM (Cuckoo or cloud detonation API). Add sandbox verdict as Signal 6 — +15 pts if malicious payload detected.", ACCENT2),
    ("Longitudinal Campaign Intelligence", "Build a time-series view of campaign evolution — detect actors who rotate IPs but reuse domains, subject templates, or DKIM key fragments. ML cluster drift detection.", PURPLE),
]

for i, (title, body, col) in enumerate(future):
    fy_i = fw_y + Inches(0.3) + i * Inches(1.45)
    box(s12, Inches(6.85), fy_i, Inches(6.25), Inches(1.35), fill=BG2, line=col, lw=0.75)
    txt(s12, f"F{i+1}  {title}", Inches(7.0), fy_i + Inches(0.1), Inches(5.9), Inches(0.3), sz=13, col=col, bold=True)
    txt(s12, body, Inches(7.0), fy_i + Inches(0.42), Inches(5.9), Inches(0.88), sz=11, col=FG2, wrap=True)


# ─────────────────────────────────────────────────────────────────────────────
# SLIDE 13 — Conclusions
# ─────────────────────────────────────────────────────────────────────────────
s13 = new_slide()
hdr(s13, "Conclusions", 13)
slide_title(s13, [
    ("EmailThreat delivers the ", FG),
    ("first open-source, serverless-native", ACCENT2),
    (" multi-signal email forensic platform — ", FG),
    ("live and production-verified", SUCCESS),
])

# Key takeaways
ta_y = Inches(1.6)
lbl(s13, "Key Takeaways", Inches(0.25), ta_y, Inches(8.0))

takeaways = [
    (ACCENT2, "Five independent signals", "outperform single-signal blockers. Triple-auth-fail floor rule guarantees Suspicious verdict even when IP reputation is clean."),
    (SUCCESS, "SSE streaming pipeline", "bypasses Vercel’s 10s serverless timeout, enabling real-time forensic progress for analysts during live analysis."),
    (PURPLE, "Zero-shot AI classification", "with bart-large-mnli adds a language-model signal without any labelled training data or retraining infrastructure."),
    (WARNING, "Union-find campaign clustering", "runs atomically in a single Prisma transaction, linking coordinated attacks retroactively across the entire email corpus."),
    (DANGER, "Live demo validated", "on a real phishing email (paypa1-verify.com, Tor exit node 185.220.101.47): verdict FRAUDULENT 65/100 in under 30 seconds."),
]

ta_h = Inches(0.75)
for i, (col, bold_t, rest_t) in enumerate(takeaways):
    ty = ta_y + Inches(0.3) + i * (ta_h + Inches(0.08))
    box(s13, Inches(0.25), ty, Inches(8.5), ta_h, fill=BG2, line=BORDER, lw=0.5)
    box(s13, Inches(0.25), ty, Inches(0.06), ta_h, fill=col)
    mtxt(s13, [(f"✓  {bold_t}: ", col, True), (rest_t, FG2, False)],
         Inches(0.45), ty + Inches(0.18), Inches(8.2), Inches(0.45), sz=12)

# Right: metrics + live link
rx13 = Inches(9.0)
ry13 = Inches(1.6)
rw13 = W - rx13 - Inches(0.2)

# Key metrics
metrics = [
    ("<30s", "end-to-end analysis time", SUCCESS),
    ("65/100", "live fraud score (verified)", DANGER),
    ("5", "independent signal layers", ACCENT2),
    ("6", "forensic report sections", PURPLE),
]
met_h = Inches(0.82)
for i, (val, lbl_t, col) in enumerate(metrics):
    my = ry13 + i * (met_h + Inches(0.08))
    box(s13, rx13, my, rw13, met_h, fill=BG2, line=col, lw=0.75)
    txt(s13, val, rx13 + Inches(0.15), my + Inches(0.06), rw13 - Inches(0.3), Inches(0.42), sz=24, col=col, bold=True)
    txt(s13, lbl_t, rx13 + Inches(0.15), my + Inches(0.5), rw13 - Inches(0.3), Inches(0.28), sz=11, col=MUTED)

# Live deployment box
ld_y = ry13 + 4 * (met_h + Inches(0.08)) + Inches(0.12)
box(s13, rx13, ld_y, rw13, Inches(1.2), fill=RGBColor(0x0C, 0x12, 0x20), line=ACCENT, lw=1.2)
txt(s13, "LIVE DEPLOYMENT", rx13 + Inches(0.15), ld_y + Inches(0.1), rw13, Inches(0.28), sz=10, col=ACCENT_L, bold=True)
txt(s13, "sih2026-email-threat.vercel.app", rx13 + Inches(0.15), ld_y + Inches(0.4), rw13 - Inches(0.3), Inches(0.38), sz=13, col=ACCENT2, bold=True)
txt(s13, "github.com/userisaziz/email-threat-platform", rx13 + Inches(0.15), ld_y + Inches(0.8), rw13 - Inches(0.3), Inches(0.3), sz=11, col=MUTED)

# References
ref_y = H - Inches(0.55)
txt(s13, "FBI IC3 (2023). Internet Crime Report. · Mishra, S. & Sharma, A. (2022). Zero-shot phishing detection. · NIST SP 800-177r1. · dan.me.uk Tor exit list.",
    Inches(0.25), ref_y, W - Inches(0.5), Inches(0.4), sz=9, col=MUTED)


# ─────────────────────────────────────────────────────────────────────────────
# Save
# ─────────────────────────────────────────────────────────────────────────────
out = "sih-2026-emailthreat-v2.pptx"
prs.save(out)
print(f"Saved: {out}  ({len(prs.slides)} slides)")
