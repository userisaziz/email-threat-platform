# SIH 2026 Presentation Slides

## Export to PDF / PPTX

Install Marp CLI (one-time):
```bash
npm install -g @marp-team/marp-cli
```

Export to PDF:
```bash
marp sih-2026-slides.md --pdf --allow-local-files -o sih-2026.pdf
```

Export to PowerPoint (.pptx):
```bash
marp sih-2026-slides.md --pptx --allow-local-files -o sih-2026.pptx
```

Export to HTML (interactive slides):
```bash
marp sih-2026-slides.md --html -o sih-2026.html
```

## Slide Structure (14 slides)

1. Title
2. The Problem
3. Our Differentiator (competitor comparison table)
4. Architecture diagram
5. Analysis Pipeline (6-step SSE flow)
6. Fraud Score Formula (table)
7. Campaign Correlation (union-find, the differentiator)
8. One-Click Forensic PDF (8 sections)
9. Tech Stack (table)
10. Live Demo Flow (5 steps)
11. Constraints → How We Met Them
12. Deployment & CI/CD
13. Success Criteria
14. Thank You
