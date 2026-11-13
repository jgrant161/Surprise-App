# Surprise Stash: store listing copy

Everything below is ready to paste into App Store Connect and Google Play Console.
Character limits are noted where the stores enforce them.

| Field | Value |
|---|---|
| App name (30 chars max, 26 used) | `Surprise Stash: Gift Ideas` |
| Brand / short name | Surprise Stash |
| Bundle / package id | `app.surprisestash.mobile` (change in `apps/gift-planner-native/capacitor.config.ts` before first submission) |
| Support URL | https://surprisestash.app/support |
| Marketing URL | https://surprisestash.app |
| Privacy policy URL | https://surprisestash.app/privacy |
| Terms of use URL | https://surprisestash.app/terms |
| Support email | support@surprisestash.app |
| Copyright | 2026 Surprise Stash |

## Apple App Store

**Subtitle** (30 chars max, 23 used)
```
Gift ideas, kept secret
```
Alternatives if it tests poorly: `Never spoil a surprise again` (28), `Remember every gift idea` (24).

**Promotional text** (170 chars max, can change without a new build)
```
Capture the gift idea the moment they mention it. Keep it hidden from them, share it with everyone else, and never buy the same thing twice.
```

**Keywords** (100 chars max, no spaces after commas)
```
gift,gifts,ideas,wishlist,family,birthday,christmas,secret,budget,planner,registry,holiday,kids
```
(97 used)

**Primary category**: Lifestyle. **Secondary category**: Productivity.

**Description** (4000 chars max)
```
Capture the idea the moment they mention it. Keep it hidden from them. Never buy the same gift twice. Remember what you gave last year.

Surprise Stash is the gift planner for families. When your daughter says "I wish I had the fancy pencils like at school" in March, type it in and it's waiting for you in December. When Grandma mentions a garden kneeler, it goes on her list, not on a sticky note you'll lose.

EVERY PERSON GETS A LIST, AND THEY CAN'T SEE THEIR OWN
Each family member signs in with their own email. You see everyone's lists except yours. Your partner sees everyone's except theirs. The surprise survives a shared iPad on the kitchen counter.

NEVER DOUBLE UP
Tap "I've got this" on an idea and everyone else sees who's covering it. No more two Lego sets under the tree.

BUILT FOR THE WAY FAMILIES ACTUALLY SHOP
• Capture by typing a sentence: "Mom wants a garden kneeler and Jake keeps talking about the Rivendell set." The app sorts it onto the right people.
• Occasions with countdowns: birthdays, Christmas, anniversaries, anything yearly.
• A budget per person per occasion, with what's been spent so far.
• Ideas move from idea to planned to bought to wrapped to given, so you know where you stand on December 23rd.
• Links to wherever you found it, with price and notes.
• Gift history by year and person, so you never give the same scarf twice.

FREE TO START
Track gifts for a few people for free. Pro removes the limits for the whole family. Subscriptions renew monthly or yearly and can be cancelled any time in your App Store settings.

PRIVACY
Your family's names, dates, ideas and notes are stored for your household only. We don't sell data and there are no ads. Shopping links may use referral tags that cost you nothing. Full policy: https://surprisestash.app/privacy

Made by a parent who found the perfect gift in October and forgot about it by December.
```

**What's New in 1.0**
```
Welcome to Surprise Stash. Capture gift ideas year-round, keep each person's list hidden from them, claim ideas so nobody doubles up, set budgets per occasion, and look back at what you gave in past years.
```

**Age rating**: answer "None" to every content question. Result: 4+. No unrestricted web
access (the app loads only its own site; shopping links open in the system browser), no
gambling, no user-generated content shared between strangers (a household is a closed,
invite-only group).

**App Privacy (nutrition label)**

| Data type | Collected | Linked to user | Used for tracking | Purpose |
|---|---|---|---|---|
| Contact Info: Email Address | Yes | Yes | No | App Functionality (sign-in codes, account) |
| Contact Info: Name (people you add) | Yes | No | No | App Functionality |
| Sensitive Info / Other: birthdays, interests, sizes, notes | Yes | No | No | App Functionality |
| User Content: Other User Content (gift ideas, notes, pasted text) | Yes | No | No | App Functionality |
| Identifiers: User ID | Yes | Yes | No | App Functionality |
| Purchases: Purchase History | Yes | Yes | No | App Functionality (Pro plan status) |

Everything else: Not collected. **Tracking**: No. Outbound shopping links carry an affiliate
tag, but no device identifier or user data is shared with the retailer, so this is not
"tracking" in Apple's definition (no cross-app or cross-site data linking). Pasted capture
text is sent to a third-party AI provider (Anthropic) solely to turn it into ideas; it is not
used to train models and is not advertising.

**App Review notes** (paste into "Notes" under App Review Information; set the demo account fields too)
```
Surprise Stash is a private gift planner for one household. Each family member signs in with their own email so that nobody can see the gifts planned for them.

DEMO ACCOUNT
Sign-in uses a one-time code sent by email. For review, use:
  Email: <REVIEW_EMAIL>
  Code:  <REVIEW_CODE>
This address always accepts that fixed code, so no inbox is needed.

HOW TO TEST
1. Sign in with the demo account. On first sign-in you are asked to create a household: enter any name and continue.
2. People tab: add two people (for example "Ava" with a birthday and "Grandma Jo").
3. Capture tab: paste "Ava wants watercolor pencils and Grandma Jo mentioned a garden kneeler", review, save. The ideas land on each person.
4. Open Ava: tap "I've got this", then move the idea to Planned and Bought.
5. Occasions tab: "Create birthday occasions" adds yearly occasions; set a budget.
6. Settings: the Pro upgrade screen, privacy policy, terms and account deletion are here.

THE PRIVACY RULE
Open your own person page (the demo user) and you'll see "No peeking": the app never shows a signed-in member the gifts meant for them. This is enforced on the server.

SUBSCRIPTION
The Pro plan is sold through in-app purchase (RevenueCat). Pricing and terms are on the Upgrade screen; links to the privacy policy and terms are in Settings and on the sign-in screen.
```

## Google Play

**App name** (30 chars max, 26 used): `Surprise Stash: Gift Ideas`

**Short description** (80 chars max)
```
Capture gift ideas all year. Hidden from the recipient, shared with the family.
```
(78 used)

**Full description** (4000 chars max): use the App Store description above verbatim; replace
"App Store settings" with "Google Play".

**Category**: Lifestyle. **Tags**: Family, Shopping, Productivity.

**Content rating questionnaire** (IARC): no violence, no sexual content, no profanity, no
controlled substances, no gambling, no user interaction between strangers, does not share
location. Result: Everyone.

**Data safety form**

| Question | Answer |
|---|---|
| Does your app collect or share any of the required user data types? | Yes |
| Is all collected data encrypted in transit? | Yes |
| Do you provide a way for users to request deletion? | Yes (Settings, Delete my account; also email support) |
| Personal info: Email address | Collected, not shared, required, purpose: Account management, App functionality |
| Personal info: Name (people you add) | Collected, not shared, optional, purpose: App functionality |
| Personal info: Other (birthdays, interests, sizes) | Collected, not shared, optional, purpose: App functionality |
| App activity: Other user-generated content | Collected, shared with a service provider (AI parsing of pasted text), optional, purpose: App functionality |
| Financial info: Purchase history | Collected via Google Play Billing, purpose: App functionality |
| Device or other IDs | Not collected |
| App info and performance: Crash logs | Not collected (add if you enable Crashlytics/Sentry) |

**Target audience**: 18 and over (parents and gift-givers). Not designed for children.

**Ads**: No. (Affiliate links are not ads under Play's definition: nothing is displayed, and
no ad SDK is included.)

## Shared

**Promo video**: none for 1.0.

**Screenshot captions** (used by `screenshots.cjs` frames)

| Page | Caption |
|---|---|
| `/` | Every occasion, every person, one glance |
| `/people` | A list for everyone. Nobody sees their own |
| `/people/<id>` | Claim it so nobody doubles up |
| `/capture` | Type what they said. It lands on the right person |
| `/occasions` | Budgets per person, per occasion |
| `/history` | Never give the same gift twice |
