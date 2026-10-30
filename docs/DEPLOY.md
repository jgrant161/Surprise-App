# Deploying the Snap Schedule web app

The web app (`apps/snap-schedule`) is what users and the native shell actually load. This
guide gets it to production cheaply: Render for hosting (you already have an account),
Turso for the database, Resend for sign-in emails, Anthropic for extraction. Vercel is
covered as an alternative at the end of section 3.

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
long time at launch; move images to S3 or Cloudflare R2 when the table passes a gigabyte.

## 2. Email: Resend

1. Sign up at resend.com, add your domain, create the DNS records it shows (DKIM, SPF, MX for bounces), wait for Verified.
2. Create an API key (Sending access only).
3. `EMAIL_FROM` must use the verified domain, for example `Snap Schedule <hello@snapschedule.app>`.
4. Until the domain is verified you can send only to your own address; good enough for testing.

## 3. Hosting: Render (recommended)

The repo ships a `render.yaml` Blueprint at the root, so the service, plan, health check and
environment variable names are all predefined.

1. In the Render dashboard: **New -> Blueprint**, connect the GitHub repo, pick the branch.
   Render reads `render.yaml` and shows one service, `snap-schedule`.
2. It prompts for the secrets marked `sync: false`. Paste these:

   | Variable | Value | Notes |
   |---|---|---|
   | `ANTHROPIC_API_KEY` | `sk-ant-...` | From console.anthropic.com. Set a monthly spend limit there. |
   | `DATABASE_URL` | `libsql://...turso.io` | From step 1 |
   | `DATABASE_AUTH_TOKEN` | token | From step 1 |
   | `RESEND_API_KEY` | `re_...` | From step 2 |
   | `REVIEW_EMAIL` | `review@yourdomain` | Demo login for App Review; this address accepts the fixed code |
   | `REVIEW_CODE` | 6 digits | The fixed code for `REVIEW_EMAIL` |
   | `REVENUECAT_WEBHOOK_SECRET` | long random string | Must match the Authorization header configured in RevenueCat |

   The non-secret ones (`APP_URL`, `EMAIL_FROM`, `SUPPORT_EMAIL`, prices, free limit) are
   pre-filled in the blueprint; edit them in the service's Environment tab to match your domain.
3. Click **Apply**. The first build takes 3-5 minutes. The service is healthy when
   `https://<service>.onrender.com/api/health` returns `{"ok":true}`.
4. Custom domain: service **Settings -> Custom Domains -> Add**, enter `snapschedule.app`
   and `www.snapschedule.app`, create the CNAME/ALIAS records it shows at your registrar.
   Render issues the certificate automatically. Then set `APP_URL` to the final domain.
5. Auto-deploy is on: every push to the connected branch redeploys. Turn it off in Settings
   if you prefer to click Deploy manually.

Plan: `starter` ($7/mo) is in the blueprint on purpose. The free plan sleeps after 15 minutes
of inactivity and takes 30+ seconds to wake, which fails App Review's first tap and annoys
users. Starter has no sleep and a 60s request timeout, enough for the 10-30s extraction call.
Render allows commercial use on all plans.

### Alternative: Vercel

Vercel works too, with one catch: the free Hobby plan is for non-commercial use, so a paid
app needs Pro at $20/mo. Import the repo, set Root Directory `apps/snap-schedule`, Node 22,
and the same environment variables as above. Image extraction can take 10-30 seconds; the
upload route sets `maxDuration`, keep it at or below your plan's function limit.

## 4. Staging

Create a second Render web service from the same repo (duplicate the blueprint service with
a different name, or New -> Web Service pointed at a `staging` branch) with its own Turso
database (`turso db create snap-schedule-staging`) and the same variables. Point
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
push and pull request. Render deploys independently on push to the connected branch. Keep
the GitHub check green before merging.

## 7. What it costs

| Service | Free tier | When you'd pay |
|---|---|---|
| Render Starter | none (free plan sleeps) | $7/mo flat; commercial use allowed |
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
