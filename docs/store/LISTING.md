# Snap Schedule: store listing copy

Everything below is ready to paste into App Store Connect and Google Play Console.
Character limits are noted where the stores enforce them. Replace the three URLs if the
domain changes.

| Field | Value |
|---|---|
| App name | Snap Schedule |
| Bundle / package id | `app.snapschedule.mobile` (change in `apps/snap-schedule-native/capacitor.config.ts` before first submission if desired) |
| Support URL | https://snapschedule.app/support |
| Marketing URL | https://snapschedule.app |
| Privacy policy URL | https://snapschedule.app/privacy |
| Terms of use URL | https://snapschedule.app/terms |
| Support email | support@snapschedule.app |
| Copyright | 2026 Snap Schedule |

## Apple App Store

**Subtitle** (30 chars max, 29 used)
```
Photo to family calendar
```

**Promotional text** (170 chars max, can change without a new build)
```
Snap the school newsletter, the team schedule, or that group-chat screenshot. Every date lands on the family calendar with who's going and what to bring.
```

**Keywords** (100 chars max, no spaces after commas, 99 used)
```
family,calendar,school,schedule,kids,parents,sports,newsletter,scan,ocr,events,planner,carpool
```

**Primary category**: Productivity. **Secondary category**: Lifestyle.

**Description** (4000 chars max)
```
Stop retyping the school newsletter.

Snap Schedule turns photos into family calendar events. Point your camera at a school newsletter, a sports schedule, a flyer on the fridge, or a screenshot from the parents' group chat. Every date is pulled out for you: picture day, practice on Tuesdays, the PTA meeting, early dismissal. Review the list, fix anything that looks off, and confirm. Done.

WHAT IT PULLS OUT
• Dates and times, including "every Tuesday through November"
• Where it is
• What to bring, wear, sign, or pay
• Which kid it's for

BUILT FOR FAMILIES
• Color-code each family member and filter the calendar by kid
• Mark who's going and who's driving
• See the next 30 days at a glance
• Paste text from an email or group chat when there's nothing to photograph

WORKS WITH THE CALENDAR YOU ALREADY USE
• Add any event to Google Calendar with one tap
• Download an .ics for Apple Calendar, Outlook, or anything else
• Subscribe to your family feed so confirmed events appear automatically, with a reminder an hour before

YOU STAY IN CONTROL
Nothing is added to your calendar until you've looked at it. Low-confidence dates are flagged with the original text so you can double-check.

FREE TO START
Snap a few schedules every month for free. Snap Schedule Pro removes the limit for the whole family. Subscriptions renew monthly or yearly and can be cancelled any time in your App Store settings.

PRIVACY
Photos are used only to read the schedule and are stored with your family's account so you can look back at the source. They are never used for advertising. Full policy: https://snapschedule.app/privacy

Made by a parent who was tired of typing "Picture Day" into the calendar for the third year in a row.
```

**What's New in 1.0**
```
Welcome to Snap Schedule. Photograph a school newsletter or team schedule and watch the events land on your family calendar. This first version includes photo and text capture, review and confirm, per-kid colors, who's driving, what to bring, Google Calendar links, and a subscribable family feed.
```

**Age rating**: answer "None" to every content question. Result: 4+. No unrestricted web access (the app loads only its own site), no gambling, no user-generated content shared between users.

**App Privacy (nutrition label)**

| Data type | Collected | Linked to user | Used for tracking | Purpose |
|---|---|---|---|---|
| Contact Info: Email Address | Yes | Yes | No | App Functionality (sign-in codes, account) |
| User Content: Photos or Videos | Yes | No | No | App Functionality (reading the schedule) |
| User Content: Other User Content (pasted text, event titles) | Yes | No | No | App Functionality |
| Identifiers: User ID | Yes | Yes | No | App Functionality |
| Purchases: Purchase History | Yes | Yes | No | App Functionality (Pro plan status) |

Everything else: Not collected. **Tracking**: No. Data is sent to a third-party AI provider
(Anthropic) solely to extract events; it is not used to train models and is not advertising.

**App Review notes** (paste into "Notes" under App Review Information; set the demo account fields too)
```
Snap Schedule photographs paper or on-screen schedules and extracts calendar events for a family.

DEMO ACCOUNT
Sign-in uses a one-time code sent by email. For review, use:
  Email: <REVIEW_EMAIL>
  Code:  <REVIEW_CODE>
This address always accepts that fixed code, so no inbox is needed.

HOW TO TEST
1. Sign in with the demo account. A sample family (Mom, Dad, Ava, Jake) is already set up.
2. Tap Snap. Take a photo of any printed schedule, or choose "Paste text" and paste something like "Picture Day is Thursday Nov 12. Soccer practice Tuesdays 5:30-6:30 at Riverside Field 3, bring water."
3. Review the extracted events, then tap Confirm. They appear on the Home tab.
4. Open an event for the Google Calendar link and .ics download.

CAMERA
The camera and photo library are used only to capture the schedule being read. Nothing is uploaded except the chosen image, which is processed to extract dates.

SUBSCRIPTION
The Pro plan is sold through in-app purchase (RevenueCat). Pricing and terms are shown on the Upgrade screen, and links to the privacy policy and terms of use are in Settings and on the sign-in screen.
```

## Google Play

**App name** (30 chars): `Snap Schedule`

**Short description** (80 chars max, 73 used)
```
Photograph a school or team schedule. The events land on your family calendar.
```

**Full description** (4000 chars max): use the App Store description above verbatim; replace the
App Store settings sentence with "cancelled any time in Google Play".

**Category**: Parenting (fallback: Productivity). **Tags**: Calendar, Family, Productivity.

**Content rating questionnaire** (IARC): no violence, no sexual content, no profanity, no
controlled substances, no gambling, no user interaction between strangers, does not share
location. Result: Everyone.

**Data safety form**

| Question | Answer |
|---|---|
| Does your app collect or share any of the required user data types? | Yes |
| Is all collected data encrypted in transit? | Yes |
| Do you provide a way for users to request deletion? | Yes (Settings, Delete family; also email support) |
| Personal info: Email address | Collected, not shared, required, purpose: Account management, App functionality |
| Photos and videos: Photos | Collected, shared with a service provider (AI extraction), optional, purpose: App functionality |
| App activity: Other user-generated content | Collected, not shared, optional, purpose: App functionality |
| App info and performance: Crash logs | Not collected (add if you enable Crashlytics/Sentry) |
| Device or other IDs | Not collected |
| Financial info: Purchase history | Collected via Google Play Billing, purpose: App functionality |

**Target audience**: 18 and over (parents). Not designed for children, so no Families policy
requirements apply.

**Ads**: No.

## Shared

**Promo video**: none for 1.0.

**Screenshot captions** (used by `screenshots.cjs` frames)

| Page | Caption |
|---|---|
| `/` | Your whole family's month, one glance |
| `/snap` | Snap a newsletter, flyer, or screenshot |
| `/snaps/<id>/review` | Review, fix, confirm. Nothing lands unchecked |
| `/family` | Color-code every kid, see who's driving |
| `/subscribe` | Syncs with the calendar you already use |
