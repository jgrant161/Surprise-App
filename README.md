# Surprise-App: two small apps, built for fun, built to grow

This repo holds two independent consumer apps. Each one solves a real, recurring household
problem, costs almost nothing to run, and has a simple paid tier. They share a repo and a set
of conventions (see `CONVENTIONS.md`) but nothing else, so either can ship, be sold, or be
shut down on its own.

## 1. Snap Schedule (`apps/snap-schedule`)

Photograph a school newsletter, a sports schedule, a flyer, or a screenshot from the parents'
group chat. Claude reads it and turns the dates into events on the family calendar, with who's
going, who's driving, and what to bring. Review, confirm, and export to Google Calendar or any
calendar app via `.ics`.

- Pain: parents retype this stuff every week. Nobody has nailed it.
- Cost to run: a fraction of a cent per photo.
- Business model: free for a few snaps a month, then a family plan ($3.99/mo or $39.99/yr, two months free).
- Moat: the family layer (assignments, carpools, packing lists, conflicts across kids).

## 2. Surprise (`apps/gift-planner`)

Capture gift ideas the moment someone mentions wanting something. Track occasions and budgets,
keep each person's list hidden from them, claim an idea so two people don't buy the same
thing, and remember what was given in past years.

- Pain: ideas get lost between March and December, and surprises get spoiled by shared lists.
- Cost to run: near zero.
- Business model: free tier, premium family tier, and Amazon Associates revenue on outbound
  shopping links (every idea link is tracked and tagged).

## Running locally

Each app is a standard Next.js project:

```bash
cd apps/snap-schedule   # or apps/gift-planner
cp .env.example .env    # add ANTHROPIC_API_KEY to leave demo mode
npm install
npm run db:push         # create the local SQLite database
npm run db:seed         # demo family / household
npm run dev             # snap-schedule on :3000, gift-planner on :3001
```

Without an `ANTHROPIC_API_KEY` both apps run in **demo mode**: the Claude-powered steps return
realistic sample output so every screen is clickable. Snap Schedule signs you in with an
emailed 6-digit code; without a `RESEND_API_KEY` the code is shown on the login page instead
(dev mode). Set `REVIEW_EMAIL` and `REVIEW_CODE` for a fixed demo login (used for App Review).

## Deploying cheaply

Snap Schedule is set up for Render (a `render.yaml` blueprint is at the repo root, Starter
plan at $7/mo) with a Turso hosted-SQLite database and Resend for sign-in emails, both free
at this scale. Full steps in `docs/DEPLOY.md`; store submission steps in
`docs/store/RELEASE_CHECKLIST.md`. The iOS/Android shell lives in `apps/snap-schedule-native`.

## Roadmap (shared)

1. Real accounts (magic-link email) replacing the single-household v1.
2. Stripe subscriptions for the paid tiers.
3. Push reminders (web push) the evening before an event / two weeks before an occasion.
4. App-store wrappers once the web versions have paying users.
