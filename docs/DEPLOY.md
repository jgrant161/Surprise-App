# Deploying the Snap Schedule web app

The web app (`apps/snap-schedule`) is what users and the native shell actually load. This
guide gets it to production on free tiers: Vercel for hosting, Turso for the database,
Resend for sign-in emails, Anthropic for extraction.

## 1. Database: Turso

1. Sign up at turso.tech, install the CLI (`brew install tursodatabase/tap/turso`), `turso auth login`.
2. Create the database and credentials:
   ```bash
   turso db create snap-schedule-prod
   turso db show snap-schedule-prod --url        # libsql://snap-schedule-prod-<org>.turso.io
   turso db tokens create snap-schedule-prod     # long-lived auth token
   ```
3. Push the schema from your machine (the app never migrates at runtime):
   ```bash
   cd apps/snap-schedule
   DATABASE_URL=libsql://... DATABASE_AUTH_TOKEN=... npm run db:push
   ```
4. Optional: seed the review family the same way with `npm run db:seed`.

Images are stored as blobs in this database for v1. Turso's free tier (several GB) covers a
long time at launch; move images to Vercel Blob or S3 when the table passes a gigabyte.

## 2. Email: Resend

1. Sign up at resend.com, add your domain, create the DNS records it shows (DKIM, SPF, MX for bounces), wait for Verified.
2. Create an API key (Sending access only).
3. `EMAIL_FROM` must use the verified domain, for example `Snap Schedule <hello@snapschedule.app>`.
4. Until the domain is verified you can send only to your own address; good enough for testing.

## 3. Hosting: Vercel

1. vercel.com, Add New Project, import the GitHub repo.
2. Settings that matter:
   - Root Directory: `apps/snap-schedule`
   - Framework Preset: Next.js (auto-detected)
   - Node.js Version: 22.x
   - Build command and output: leave defaults (`next build`).
3. Environment variables (Production, and Preview if you want preview deploys to work):

   | Variable | Value | Notes |
   |---|---|---|
   | `ANTHROPIC_API_KEY` | `sk-ant-...` | From console.anthropic.com. Set a monthly spend limit there. |
   | `DATABASE_URL` | `libsql://...turso.io` | From step 1 |
   | `DATABASE_AUTH_TOKEN` | token | From step 1 |
   | `RESEND_API_KEY` | `re_...` | From step 2 |
   | `EMAIL_FROM` | `Snap Schedule <hello@yourdomain>` | Verified domain only |
   | `APP_URL` | `https://snapschedule.app` | Used in emails, `.ics` feed URLs, redirects |
   | `SUPPORT_EMAIL` | `support@yourdomain` | Shown in the app and store listing |
   | `REVIEW_EMAIL` | `review@yourdomain` | Demo login for App Review; this address accepts the fixed code |
   | `REVIEW_CODE` | 6 digits | The fixed code for `REVIEW_EMAIL` |
   | `FREE_SNAPS_PER_MONTH` | `5` | Free tier limit |
   | `PRO_PRICE_MONTHLY` | `3.99` | Display only; real prices live in the stores |
   | `PRO_PRICE_YEARLY` | `24.99` | Display only |
   | `REVENUECAT_WEBHOOK_SECRET` | long random string | Must match the Authorization header configured in RevenueCat |

4. Deploy. The first deploy takes a few minutes; later ones about a minute.
5. Domains: add `snapschedule.app` (and `www`), create the DNS records Vercel lists at your registrar, wait for the certificate.

Function limits: image extraction can take 10-30 seconds. On the Hobby plan the default
function timeout is 60 seconds on Node 22 with Fluid compute, which is enough. The upload
route already sets `maxDuration`; keep it at or below the plan limit.

## 4. Staging

Create a second Vercel project from the same repo (or use the Preview environment) with its
own Turso database (`turso db create snap-schedule-staging`) and the same variables. Point
the native shell at it with `SNAP_SCHEDULE_URL=https://staging.snapschedule.app npx cap sync`
when testing a native build against unreleased web changes.

## 5. Rolling out a schema change

Drizzle `push` is additive-safe for new tables and columns. Order of operations:

1. Merge the schema change.
2. From your machine, run `npm run db:push` against **staging**, test.
3. Run `npm run db:push` against **production** (with the prod `DATABASE_URL`/token).
4. Deploy the app. New code then finds the columns it expects. Never deploy first.

Destructive changes (dropping or renaming a column) need a two-step deploy: add the new
column, deploy code that writes both, backfill, then drop the old one in a later release.

## 6. Continuous integration

`.github/workflows/ci.yml` runs lint, tests, and a production build for both apps on every
push and pull request. Vercel deploys independently on push to `main` (production) and on
every branch (preview). Keep the GitHub check green before merging.

## 7. What it costs

| Service | Free tier | When you'd pay |
|---|---|---|
| Vercel Hobby | free, non-commercial use | Pro at $20/mo once you charge users (Vercel's terms) |
| Turso | free: 500 DBs, 9 GB storage, 1 billion row reads/mo | Rarely at this scale |
| Resend | free: 3,000 emails/mo, 100/day | $20/mo above that |
| Anthropic | pay per token | See below |
| Apple / Google | $99/yr + $25 once | Plus 15% of subscription revenue (Small Business Program) |

Per-snap AI cost on Claude Opus 5.5 ($4 per million input tokens, $20 per million output):
a 1600px photo is roughly 1,600 input tokens, the prompt about 400, and the structured
output a few hundred. Call it 2,500 input and 500 output tokens: about $0.02 per snap at
list price, or under a cent per snap with prompt caching on the system prompt. A free user
at 5 snaps/month costs well under a dime; a Pro family at 30 snaps/month costs under a
dollar against a $3.99 subscription. Set a monthly limit in the Anthropic console so a bug
can't run up a bill.
