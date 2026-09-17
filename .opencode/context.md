# Project Context

## Current Status
**Frontend redesign DEPLOYED.** New UI live at https://frontend-navy-psi-33.vercel.app

### Completed This Session
- **Frontend redesign:** All 11 phases complete, committed (`1605100`), pushed, deployed
- **Login:** Split-screen (dark left + white form), emerald accents, Geist font
- **Dashboard:** Bento grid, stat cards, pipeline chart, empty states
- **Contacts:** Search/filter, table with badges, modal, empty state
- **Deals:** Stats row, filter, table with badges, modal
- **Activities:** Card-based feed with Phosphor icons
- **Browser verified:** Desktop (1440x900) + mobile (375x812)

### Backend (unchanged)
- Models: User, Organization, Contact, Deal, Activity, Tag, AuditLog
- Routes: auth, health, contacts, deals, activities
- Tests: 87 total pass
- Login: `demo@example.com` / `demo123`

### Deployed
- **Vercel production:** `https://frontend-navy-psi-33.vercel.app` ✓ LIVE
- **Landing page:** Netlify (needs claiming at `app.netlify.com`)

## Pending Tasks
1. **Set up Vercel Postgres** — manual dashboard for persistent data (currently SQLite = ephemeral)
2. **Claim Netlify landing page** — user logs into `app.netlify.com`

## Key Files
- `STRATEGY.md` — product strategy
- `OUTREACH-MESSAGES.md` — 50 outreach messages ready
- `frontend/tailwind.config.js` — Tailwind config (Geist font, emerald accent)
- `frontend/src/lib/constants.js` — stage colors, formatters
- `frontend/src/components/ui/` — 8 shared UI components

## Environment
- Python 3.13, Flask-Smorest 0.47.0, marshmallow 4.3.1
- React + Vite, Tailwind CSS v3, Framer Motion, Phosphor Icons, Geist font
- Branch: `develop`
- Caveman mode: full
