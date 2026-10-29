# Snap Schedule

Photograph a school newsletter, a team schedule, a flyer, or a screenshot of the parents' group
chat (or just paste the text). Claude reads it, pulls out every dated event, you fix anything that
looks off, tap **Confirm**, and the events are on the family calendar with who's going, who's
driving and what to bring. Export any event to Google Calendar in one tap, download an `.ics`, or
subscribe your phone to the family feed once and never retype a schedule again.

Mobile-first web app that installs to the home screen (PWA). One family per deployment in v1.

## Run it

```bash
cp .env.example .env        # add ANTHROPIC_API_KEY for real extraction (optional)
npm install
npm run db:push             # create the local SQLite database (data/local.db)
npm run db:seed             # Mom, Dad, Ava, Jake
npm run dev                 # http://localhost:3000
```

Scripts: `dev`, `build`, `start`, `lint`, `db:push` (sync schema with drizzle-kit), `db:seed`.

### Demo mode

Without `ANTHROPIC_API_KEY` the app still works end to end: every snap returns the same four
sample events (picture day, two soccer practices, a PTA meeting) and the UI shows a **Demo mode**
badge. Add a key to `.env` and restart to extract real events.

## How it works

| Piece | Where |
|---|---|
| Schema (families, members, snaps, events, event_members) | `src/db/schema.ts` |
| Claude extraction: vision/text → structured events (Zod + `messages.parse`) | `src/lib/claude.ts` |
| Store snap → extract → write draft events | `src/lib/snaps.ts`, `src/app/api/snaps/route.ts` |
| Review & confirm drafts | `src/app/snaps/[id]/review/` |
| Home list, filters, review banner | `src/app/page.tsx` |
| Event detail / edit / Google link / `.ics` | `src/app/events/[id]/`, `src/app/api/events/[id]/ics` |
| Subscribable feed (`/calendar.ics`, `?member=<id>`) | `src/app/calendar.ics/route.ts`, `src/lib/ics.ts` |
| Family members, colors, drivers, time zone | `src/app/family/` |

Photos are resized on the phone (max 1600px JPEG) before upload, then stored as a blob in the
database alongside the extraction. Times are stored as local wall-clock strings
(`2026-11-03T17:30`) and exported as floating times, so they land at the right hour on every
family member's phone.

## Deploying

- **Vercel** for the app. Set `ANTHROPIC_API_KEY`, `DATABASE_URL`, `DATABASE_AUTH_TOKEN`.
- **Turso** (hosted libSQL) for the database: `DATABASE_URL=libsql://<db>.turso.io` plus the
  token, then `npm run db:push` once against it. The free tier is plenty for thousands of families.
- v1 stores images as blobs in the database to keep moving parts at zero. When storage grows,
  move them to Vercel Blob or S3 and keep only a URL on the snap row.
- No auth yet: one deployment = one family. Adding households + sign-in is the first real
  product milestone after you've used it with your own family for a couple of weeks.

## Monetization plan

Free: 5 snaps a month. Family plan at $3.99/month or $29/year: unlimited snaps, per-member
calendar feeds, carpool assignments. Each snap costs well under a cent to process, so margins stay
above 90% and growth comes from parents sharing it in the same group chats the screenshots come from.
