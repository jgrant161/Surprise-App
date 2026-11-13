# Getting the developer accounts (Apple and Google)

Both are needed before either app can be submitted. Start them now: Apple takes a day or
two, Google can take three weeks for a personal account because of its testing rule.

## Apple Developer Program ($99/year)

**Individual or Organization?** Individual is faster (usually approved in 24 to 48 hours)
and needs no paperwork; the App Store shows your personal name as the seller. Organization
shows the business name instead but needs a D-U-N-S number, proof you can legally bind the
company, and takes one to several weeks. You can convert Individual to Organization later.
Recommendation: enroll as an Individual now, convert later if the business name matters.

Steps (works from an iPad):
1. Make sure your Apple Account has two-factor authentication on (Settings, your name,
   Sign-In & Security).
2. Install the **Apple Developer** app from the App Store on the iPad (or iPhone).
3. Open it, sign in, tap Account, then **Enroll Now**. Choose Individual, confirm your legal
   name and address, and scan your driver's license or passport when asked. The app does the
   identity check with the camera, which the website cannot.
4. Pay the $99. Approval email usually arrives within two days.
5. Once approved, sign in at appstoreconnect.apple.com and accept the agreements under
   Business, then set up Banking and Tax (needed before paid subscriptions can go live).

## Google Play Console ($25 once)

**Personal or Organization?** This choice matters more here. Personal accounts created after
November 13, 2023 must run a **closed test with at least 12 testers opted in for 14
continuous days** before Google grants production access, and that applies per app. The
clock resets if the tester count drops below 12 or the track is paused, and production
review afterward can take up to a week. Plan on three weeks per app. Organization accounts
are exempt but need a D-U-N-S number for the business.

Recommendation: if the shop already has a D-U-N-S number (many LLCs do; look it up free at
dnb.com), register as an Organization and skip the 14-day test. If not, request a D-U-N-S
(free, usually 1 to 5 business days) and decide whether that wait beats the 14-day test.

Steps (works from an iPad in a browser):
1. Go to play.google.com/console and sign in with the Google account you want to own the
   apps. Use a business or dedicated account, not a child's or a shared one.
2. Choose Personal or Organization, fill in the developer name (shown on the store),
   contact details, and for Organization the D-U-N-S number and business address.
3. Pay the $25 and complete identity verification: an ID document photo and, for
   Organization, a business document. Verification can take a few days.
4. Once approved, set up a merchant account (Payments profile) so subscriptions can be sold.
5. For a Personal account: create the app, upload a build to a **Closed testing** track,
   invite at least 12 testers by email or Google Group, get them all to opt in, keep it
   running 14 days, then apply for production access from the dashboard. Family, friends,
   and customers of the shop count as testers.

## Shared prerequisites

- A support email on each app's domain (set up with the domain).
- Privacy policy URL (served by each app at `/privacy`) and terms at `/terms`.
- A RevenueCat account (free) to sell the Pro subscriptions through both stores with one
  integration. Create one project per app.
- Screenshots per device size, produced with the scripts in this folder.
- Reviewer demo login per app: set `REVIEW_EMAIL` and `REVIEW_CODE` on the hosted service
  and paste them into the review notes.
