# FlyerCal

Photograph a school newsletter, team schedule, flyer, or a screenshot from the parents' group chat
(or paste the text). Claude reads it, you review and confirm the events, and they land on the family
calendar with who's going, who's driving, and what to bring. Export with one tap to Google Calendar
or any calendar via `.ics`, or subscribe once to a per-family (or per-kid) feed.

This is the web app. It installs to a phone home screen as a PWA and is also what the native
store shell (`apps/flyercal-native`) wraps.

## Setup

```bash
cp .env.example .env     # fill in what you have; everything has a safe default
npm install
npm run db:push          # creates data/local.db (or syncs your Turso DB)
npm run db:seed          # demo@flyercal.app -> "The Demo Family"; prints the invite code
npm run dev              # http://localhost:3000
```

Then open `/login`, enter any email. With no `RESEND_API_KEY` the page shows the 6-digit code in
a yellow "Dev mode" box instead of emailing it. With no `ANTHROPIC_API_KEY` extraction runs in
demo mode (realistic sample events, a "Demo mode" badge everywhere).

Checks: `npm run lint`, `npm test` (pure unit tests, no DB), `npm run build`.

## How accounts work

- **Email + 6-digit code.** No passwords, no third-party login. Codes are hashed, expire in
  10 minutes, allow 5 wrong tries, and an email can request at most 5 codes an hour.
- **Sessions** are a random 32-byte token in an httpOnly cookie, 90 days, stored server-side so
  sign-out and account deletion revoke them.
- **Families.** After first sign-in you create a family (you become owner) or join one with its
  8-character invite code (Family tab, copy or share). Every query and action is scoped to the
  session's family; another family's snaps and events 404.
- **Calendar feeds** live at `/feed/<token>.ics` (token = per-family secret, no cookie needed
  because calendar apps can't send one). `?member=<id>` filters to one person. Reset the link from
  the Subscribe page.
- **Account deletion** is in Settings (two taps from anywhere). It removes sessions and the user; if
  they were the only grown-up in the family, the family and all its members, snaps and events go too.
- **Reviewer account.** Set `REVIEW_EMAIL` and `REVIEW_CODE`; that email always signs in with that
  code and no email is sent. Put the pair in the App Store / Play review notes.

## Images and retention

Uploaded photos are resized on the phone (max 1600px JPEG) and stored as a blob in the database
only while the snap awaits review. Confirming or discarding a snap deletes the bytes immediately;
anything older than 7 days is purged opportunistically (at most once an hour, triggered by home-page
loads, state in the `meta` table). Extracted events are kept until the user deletes them.

## Plans and metering

| | Free | Pro |
|---|---|---|
| Snaps per calendar month | `FREE_SNAPS_PER_MONTH` (default 5) | unlimited |
| Per-member calendar feeds | yes | yes |
| Priority support | | yes |

- Failed extractions don't count; discarded ones do (so discard-and-retry isn't a free loop).
- `/api/snaps` returns **402** with `{code: "limit_reached", used, limit}` when the free allowance is
  spent; `/snap` shows an upgrade card instead of the form.
- `/upgrade` shows prices from `PRO_PRICE_MONTHLY` / `PRO_PRICE_YEARLY`. Its buttons carry
  `data-product="pro_monthly|pro_yearly"` and do nothing on the web; the native shell intercepts
  them and runs the RevenueCat purchase.
- **Webhook** `POST /api/webhooks/revenuecat` with header `Authorization: Bearer
  $REVENUECAT_WEBHOOK_SECRET`. `event.app_user_id` must be the **family id** (the shell logs into
  RevenueCat with it). `INITIAL_PURCHASE`, `RENEWAL`, `UNCANCELLATION`, `PRODUCT_CHANGE` set `pro`;
  `EXPIRATION` (and `CANCELLATION` / `BILLING_ISSUE` whose expiration is already past) set `free`.
  Everything else is acknowledged with 200 and ignored.

## HTTP API (used by the pages and by the native shell)

| Method | Path | Body | Notes |
|---|---|---|---|
| POST | `/api/auth/request-code` | `{email}` | `{sent:true}` or `{sent:false, devCode}` in dev |
| POST | `/api/auth/verify` | `{email, code}` | sets the `session` cookie; returns `next: "/" \| "/welcome"` |
| POST | `/api/auth/signout` | | clears the cookie |
| POST | `/api/family` | `{name, timezone}` | create; caller becomes owner |
| POST | `/api/family/join` | `{code}` | join by invite code |
| POST | `/api/snaps` | multipart `image` or `text` | 401/403/402 as above; `{id, ok, count}` |
| GET | `/api/snaps/:id/image` | | 404 once the image is purged |
| GET | `/api/events/:id/ics` | | single-event download |
| GET | `/feed/:token.ics?member=` | | subscribable feed, no cookie |
| POST | `/api/webhooks/revenuecat` | RevenueCat event | bearer secret |
| GET | `/api/health` | | `{ok:true}` |

Bodies may be JSON or form-encoded.

## Environment

| Variable | Needed in production | Purpose |
|---|---|---|
| `ANTHROPIC_API_KEY` | yes | event extraction (demo mode without it) |
| `DATABASE_URL`, `DATABASE_AUTH_TOKEN` | yes | Turso / libsql (local file by default) |
| `RESEND_API_KEY`, `EMAIL_FROM` | yes | sign-in code emails (dev shows the code instead) |
| `APP_URL` | yes | absolute links in feeds and invites |
| `SUPPORT_EMAIL` | yes | privacy/terms/settings contact |
| `REVIEW_EMAIL`, `REVIEW_CODE` | for store review | fixed-code reviewer login |
| `FREE_SNAPS_PER_MONTH` | optional | default 5 |
| `PRO_PRICE_MONTHLY`, `PRO_PRICE_YEARLY` | optional | display prices on `/upgrade` |
| `REVENUECAT_WEBHOOK_SECRET` | yes, with subscriptions | webhook auth |

## Deploying

Vercel (or any Node host) + Turso. Set the variables above, run `npm run db:push` once against the
hosted database, deploy. Security headers (nosniff, DENY framing, strict referrer, camera only for
self) are set in `next.config.ts`. `/privacy` and `/terms` are the URLs to put in the store listings.

## What changed from v1

- One auto-created family -> real accounts, many families, invite codes, owner/member roles.
- Public `/calendar.ics` -> per-family tokenised `/feed/<token>.ics` with reset.
- Images deleted on confirm/discard and after 7 days; `/privacy` and `/terms` describe exactly that.
- Free/Pro plans with monthly metering, `/upgrade`, RevenueCat webhook.
- Marketing landing page for signed-out visitors, Settings tab with sign-out and account deletion.
- `npm test` with pure unit tests for ics, codes, plan logic and webhook mapping.

## Known gaps

- Real Claude extraction is untested here (no key in this environment); demo mode exercised every path.
- Subscriptions are store-only; there is no Stripe web checkout yet.
- Invite codes never expire; the owner can regenerate one at any time.
- No email-change flow; sign in with the new address and re-join with the invite code.
