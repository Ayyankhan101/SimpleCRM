# Product Strategy

## The Wedge

**Simple CRM for small businesses that hate HubSpot.**

Small businesses (1-10 people) need to track customers and deals. HubSpot has 1,200+ features. They need 5.

## Who We Serve

**Primary:** Small business owners (contractors, consultants, freelancers, local services)
- 1-10 employees
- Revenue $50K-$5M/year
- Currently using spreadsheets, sticky notes, or HubSpot free tier
- Tech-savvy enough to use a web app, not technical enough to customize CRMs

**Secondary:** Small agencies (marketing, design, dev shops)
- 2-15 people
- Track client deals and follow-ups
- Need pipeline visibility without enterprise complexity

## The Pain

HubSpot free tier is a trap:
- Limited to 1,000 contacts
- UI is overwhelming — 47 menu items for a 5-person company
- Sales features you'll never use (lead scoring, sequences, playbooks)
- Forces you into their ecosystem
- When you grow, pricing jumps to $20/user/month instantly

**The real cost:** Small business owner spends 30 minutes navigating HubSpot instead of closing deals.

## What We Are

A CRM with exactly 3 things:
1. **Contacts** — who are your customers
2. **Deals** — what's in your pipeline
3. **Tasks** — what you need to follow up on

That's it. No marketing automation. No lead scoring. No email sequences. No reports you'll never read.

## What We Are NOT

- Not HubSpot (we won't try to be everything)
- Not Salesforce (we won't charge per seat for basic features)
- Not Airtable (we're not a spreadsheet, we're a workflow tool)
- Not analytics (we don't track COVID data, trends, or forecasts)

## Positioning

**One-liner:** "The CRM that doesn't make you feel stupid."

**Elevator pitch:** "HubSpot has 1,200 features. You need 5. We built the 5 you need — contacts, deals, tasks — without the 1,195 you don't. Free for small teams, $10/month when you grow."

**Landing page headline:** "Stop paying for features you'll never use."

## Competitive Landscape

| Competitor | Their Weakness | Our Advantage |
|------------|---------------|---------------|
| HubSpot Free | Limited contacts, overwhelming UI | Unlimited contacts, simple UI |
| HubSpot Starter | $20/user/month, still complex | $10/user/month, 3 features only |
| Pipedrive | $14/user/month, sales-focused | $10/user/month, relationship-focused |
| Zoho CRM | $14/user/month, 45+ modules | $10/user/month, 3 modules |
| Copper | $29/user/month, Google-only | $10/user/month, works anywhere |
| Spreadsheets | No pipeline view, no reminders | Visual pipeline, task reminders |

## Pricing

| Plan | Price | Limits |
|------|-------|--------|
| Free | $0 | 1 user, 100 contacts, 25 deals |
| Starter | $10/month | 3 users, 1,000 contacts, unlimited deals |
| Growth | $25/month | 10 users, unlimited everything |

**Why free tier exists:** Get them in. Let them see value. When they add a second user, they pay $10/month — cheaper than HubSpot's $20.

## Revenue Model

- Monthly subscription (Stripe)
- No setup fees
- No per-contact fees
- No feature gates on core CRM (all plans get contacts, deals, tasks)
- Premium: API access, integrations, priority support

## Growth Strategy

### Phase 1: Find 5 paying users (Week 1-2)
- Cold outreach to local businesses
- LinkedIn outreach to small agency owners
- Post in r/smallbusiness, r/freelance, r/entrepreneur
- Goal: 5 people who pay $10/month

### Phase 2: Get to 50 users (Month 1-3)
- Referral program (give a month free for each referral)
- Content marketing: "Why I left HubSpot" blog posts
- Product Hunt launch
- Goal: 50 paying users, $500 MRR

### Phase 3: Get to 500 users (Month 3-6)
- SEO: "simple CRM for small business"
- Partnerships with small business coaches
- Integration with QuickBooks, Stripe
- Goal: 500 paying users, $5,000 MRR

## Key Metrics

- **Activation rate:** % of signups who create a contact within 24 hours (target: 60%)
- **Week 2 retention:** % of users who come back after 7 days (target: 40%)
- **Conversion rate:** % of free users who upgrade to paid (target: 10%)
- **Monthly churn:** % of paid users who cancel (target: <5%)

## What We're Building (MVP)

### Must Have (Week 1)
- [ ] Simple contact management (name, email, phone, company, notes)
- [ ] Deal pipeline (3 stages: Lead, Proposal, Closed)
- [ ] Task management (follow-up reminders)
- [ ] Dashboard (total deals, total contacts, tasks due today)
- [ ] One-click import from CSV

### Should Have (Week 2-3)
- [ ] Email integration (send emails from deal page)
- [ ] Mobile-responsive design
- [ ] Team sharing (invite team members)
- [ ] Basic reporting (deals closed this month, pipeline value)

### Nice to Have (Month 2+)
- [ ] API access
- [ ] QuickBooks integration
- [ ] Stripe integration
- [ ] Custom fields

## What We're REMOVING

### Remove Immediately
- Data entries (COVID/generic data tracking) — not CRM
- Analytics (trends, forecasts, anomalies) — not CRM
- Categories (data categories) — not CRM
- Sources (API, CSV, webhook data sources) — not CRM
- Notifications (email/webhook alerts) — overkill for MVP
- Webhooks (receive data) — not needed for MVP
- Country comparison — not CRM
- Complex analytics features — not CRM

### Keep But Simplify
- Dashboard → show only: total deals, total contacts, tasks due today
- Auth → keep as-is (multi-tenant, RBAC)
- Import/CSV → keep for contacts only

## User Outreach Script

### Cold Email Template

```
Subject: Quick question about your CRM

Hi [Name],

I noticed you're running [business name] — looks like great work.

Quick question: what do you currently use to track your customers and deals?

I'm building a simple CRM for small businesses — just contacts, deals, and tasks. No HubSpot complexity, no enterprise features you'll never use.

Would you be open to a 10-minute call to tell me what you wish your CRM did better? I'll give you free access for life if you do.

Best,
[Your name]
```

### LinkedIn Message Template

```
Hey [Name],

Saw you run [business] — nice.

Quick Q: how do you track your customer deals right now? Spreadsheet? HubSpot?

I'm building something simpler — just contacts, deals, tasks. No bloat.

Want to try it free? I'd love your feedback.
```

### Reddit Post Template

```
Title: I built a CRM because HubSpot was too complicated for my small business

Hey r/smallbusiness,

I run a small [type of business] and tried HubSpot. It has 1,200 features. I needed 5.

So I built a simple CRM: contacts, deals, tasks. That's it. No marketing automation, no lead scoring, no enterprise features.

It's free for 1 user. Would love your feedback if you've ever felt overwhelmed by CRMs.

[Link]
```

## Success Criteria

**In 2 weeks:** 5 people have paid $10/month
**In 3 months:** 50 paying users, $500 MRR
**In 6 months:** 500 paying users, $5,000 MRR

If we don't hit 5 paying users in 2 weeks, we pivot or kill it.
