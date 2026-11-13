# Surprise Stash

The family gift list that keeps the secret. Capture ideas the moment someone mentions wanting
something, keep each person's list hidden from them, coordinate who's buying what, track
occasions and budgets, and remember what was given in past years.

This is the web app (folder `apps/gift-planner`, package `surprise-stash`). It installs to a
phone home screen as a PWA and is what the native store shell wraps.

## Setup

```bash
cp .env.example .env     # fill in what you have; everything has a safe default
npm install
npm run db:push          # creates data/local.db (or syncs your Turso DB)
npm run db:seed          # demo@surprisestash.app (Mom) + dad@surprisestash.app -> "The Demo Household"
npm run dev              # http://localhost:3001
```

Then open `/login` and enter any email. With no `RESEND_API_KEY` the page shows the 6-digit code
in a yellow "Dev mode" box instead of emailing it. With no `ANTHROPIC_API_KEY` the Capture page
runs in demo mode (sample ideas, a "demo mode" badge).

Checks: `npm run lint`, `npm test` (pure unit tests, no DB), `npm run build`.

## How accounts and households work

- **Email + 6-digit code.** No passwords, no third-party login. Codes are hashed, expire in
  10 minutes, allow 5 wrong tries, and an email can request at most 5 codes an hour.
- **Sessions** are a random 32-byte token in an httpOnly cookie, 90 days, stored server-side so
  sign-out and account deletion revoke them.
- **Households.** After first sign-in you start a household (you become owner and get your own
  row in `people`) or join one with its 8-character invite code. When joining you pick which
  existing person you are (so the list the owner already made for you stays hidden from you) or
  add yourself. Every query and action is scoped to the session's household; another household's
  people, ideas and links 404.
- **The privacy rule.** The session's `person` is the viewer. `ideasVisibleTo(viewer.id, …)` is
  the only way ideas are read, `loadIdeaForViewer`/`assertNotSelf` guard every write, budgets and
  counts for the viewer are stripped, Capture drops ideas about the viewer before they are shown,
  and `/go/[ideaId]` 404s on the viewer's own gifts. The viewer's own person page says "No peeking".
- **Members can't be deleted** from the People page; they leave from Settings (their person row
  stays as a recipient). Last one out deletes the household and everything in it.
- **Account deletion** is in Settings, two taps from anywhere.
- **Reviewer account.** Set `REVIEW_EMAIL` and `REVIEW_CODE`; that email always signs in with that
  code and no email is sent. Put the pair in the App Store / Play review notes.

## Plans and metering

| | Free | Pro |
|---|---|---|
| People in the household | `FREE_RECIPIENTS` (default 4, members included) | unlimited |
| AI captures per calendar month | `FREE_CAPTURES_PER_MONTH` (default 5) | unlimited |
| Budgets, claims, history | yes | yes |

- Adding a person past the limit shows an upgrade card; the action redirects to `/upgrade`.
- Capture past the limit shows an upgrade card; `POST /api/capture` returns **402** with
  `{code: "limit_reached", used, limit}`. Each capture is one row in `captures`.
- `/upgrade` shows prices from `PRO_PRICE_MONTHLY` / `PRO_PRICE_YEARLY` (defaults $2.99 and
  $29.99, two months free). Its buttons carry `data-product="pro_monthly|pro_yearly"` and the page
  root carries `data-household-id`; the native shell intercepts them and starts a RevenueCat
  purchase. Real prices live in the stores.
- `POST /api/webhooks/revenuecat` requires `Authorization: Bearer $REVENUECAT_WEBHOOK_SECRET`,
  reads `event.type` and `event.app_user_id` (= household id), sets `plan` to `pro` on
  purchase/renewal and `free` on expiration. Set the household id as the RevenueCat app user id.

## Affiliate links

Every idea link is opened through `/go/[ideaId]`, which requires a session, enforces the privacy
rule, counts the click, and redirects. For `amazon.*` hosts the `tag` query parameter is set to
`AMAZON_ASSOCIATES_TAG` when configured. Other hosts pass through unchanged.

## JSON endpoints

Used by the forms, curl, and the native shell. All return JSON; errors are `{error}`.

| Endpoint | Body | Notes |
|---|---|---|
| `POST /api/auth/request-code` | `{email}` | `{sent:true}` or, with email off, `{sent:false, devCode}` |
| `POST /api/auth/verify` | `{email, code}` | sets the cookie; `{next: "/" or "/welcome"}` |
| `POST /api/auth/signout` | | |
| `POST /api/household` | `{name, yourName}` | create; you become owner |
| `POST /api/household/lookup` | `{code}` | `{name, people:[{id,name,color}]}` you could sign in as |
| `POST /api/household/join` | `{code, personId?}` or `{code, yourName}` | join as an existing or new person |
| `POST /api/capture` | `{text}` | parsed ideas (never yours); 402 when over the free limit |
| `POST /api/webhooks/revenuecat` | RevenueCat event | bearer secret |
| `GET /api/health` | | `{ok:true}` |

## Environment

| Variable | Required in prod | Purpose |
|---|---|---|
| `DATABASE_URL`, `DATABASE_AUTH_TOKEN` | yes | Turso libsql URL + token (local file by default) |
| `ANTHROPIC_API_KEY` | yes | Capture; demo mode without it |
| `RESEND_API_KEY`, `EMAIL_FROM` | yes | sign-in codes; dev mode shows the code without it |
| `APP_URL` | yes | public URL, used in invite messages |
| `SUPPORT_EMAIL` | yes | shown in Settings and legal pages |
| `REVIEW_EMAIL`, `REVIEW_CODE` | for store review | fixed demo login |
| `REVENUECAT_WEBHOOK_SECRET` | with subscriptions | webhook auth |
| `AMAZON_ASSOCIATES_TAG` | optional | affiliate tag on amazon links |
| `FREE_RECIPIENTS`, `FREE_CAPTURES_PER_MONTH` | optional | free tier limits |
| `PRO_PRICE_MONTHLY`, `PRO_PRICE_YEARLY` | optional | display prices on `/upgrade` |

## Stack

Next.js 16 (App Router, Server Actions), Tailwind 4, Drizzle ORM + libsql (SQLite locally, Turso
hosted), Anthropic SDK (`claude-opus-5-5`, structured output via Zod). Security headers are set
in `next.config.ts`.

## Deploy

Same shape as FlyerCal: a Render web service (Root Directory `apps/gift-planner`, build
`npm ci --include=dev && npm run build`, start `npm run start`, health check `/api/health`), a
Turso database (`npm run db:push` against it once), Resend for email. Do not set `NODE_ENV` as an
env var on the service.

## What changed from v1

- PIN picker (`/who`, `viewer` cookie) replaced by email-code accounts, sessions and households
  with invite codes; one household per user.
- Every read and write is scoped to the session's household, with the privacy rule keyed on the
  session's person.
- Free-tier limits on people and captures, Pro plan, upgrade page, RevenueCat webhook.
- Privacy and terms pages, Settings with account deletion and leave-household, health check,
  security headers, reviewer login, unit tests, Render-ready.

## Known gaps

- No reminders or notifications before an occasion.
- Link metadata (title, image, price) is not fetched from the URL yet.
- No web checkout; subscriptions are store-only by design.
