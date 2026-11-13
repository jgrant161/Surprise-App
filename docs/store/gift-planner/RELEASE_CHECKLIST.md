# Surprise Stash release checklist

The Apple, Google, RevenueCat, build and submit steps are identical to FlyerCal's. Follow
`docs/store/RELEASE_CHECKLIST.md` for those and swap in the items below where they differ.

## 0. Domain and web (once)

- [ ] Buy `surprisestash.app` (and the `.com` if cheap, forwarded to the `.app`).
- [ ] Turso database `surprise-stash-prod`, schema pushed (see `docs/DEPLOY.md`, section 4b).
- [ ] Render service `surprise-stash` deployed from the blueprint; custom domain attached; `APP_URL`, `EMAIL_FROM`, `SUPPORT_EMAIL` already carry the surprisestash.app values.
- [ ] Add `surprisestash.app` as a sending domain in Resend, add its DNS records, verify.
- [ ] `support@surprisestash.app` reaches a real inbox (GoDaddy forwarding or mailbox).
- [ ] `REVIEW_EMAIL` / `REVIEW_CODE` set on the service so reviewers can sign in without an inbox.

## 1. App-specific additions

- [ ] Amazon Associates: apply at affiliate-program.amazon.com (needs a live site with real content; the deployed landing and privacy pages are enough). Put the tag in `AMAZON_ASSOCIATES_TAG` on Render. You must make 3 qualifying sales within 180 days or the account is closed; reapply if so.
- [ ] Add the Associates disclosure line to the privacy page and the store description ("As an Amazon Associate we earn from qualifying purchases") once approved. Amazon requires it.
- [ ] RevenueCat: create a **separate project** for this app. Products `pro_monthly` ($2.99) and `pro_yearly` ($29.99) in App Store Connect and Play Console, entitlement `pro`, webhook `https://surprisestash.app/api/webhooks/revenuecat` with this app's `REVENUECAT_WEBHOOK_SECRET`.
- [ ] App Store Connect app record: name `Surprise Stash: Gift Ideas`, SKU `surprise-stash-ios`, bundle id `app.surprisestash.mobile` registered first.
- [ ] Play Console: app (not game), free, with in-app purchases, category Lifestyle, package `app.surprisestash.mobile`.
- [ ] Seed the review household with two people, several ideas in different statuses, a birthday within 30 days and a budget, so the first screens aren't empty.
- [ ] Screenshots with `SCREENSHOTS.md` (six pages); feature graphic 1024x500 for Play.

## 2. Reminders that differ from FlyerCal

- No camera or photo permissions: if a reviewer asks why the Capture tab needs none, the answer is that it is text-only.
- The App Review note explains the "No peeking" rule; reviewers sometimes open their own page and report it as a bug.
- Pasted capture text goes to Anthropic for parsing; both data forms already say so.
