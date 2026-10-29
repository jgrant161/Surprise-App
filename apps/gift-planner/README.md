# Surprise

A family gift planner. Capture ideas the moment someone mentions wanting something, keep them
hidden from the person they're for, coordinate who's buying what, track occasions and budgets,
and remember what was given in past years.

## What makes it different

- **No peeking.** Everyone in the family uses the same household, but a signed-in person never
  sees gifts, budgets, counts or totals for themself. The rule is enforced server-side in one
  place (`src/lib/visibility.ts`) and applied to every query, action and outbound link.
- **Capture what you heard.** Paste "Mom said she wants a garden kneeler, Jake keeps talking
  about the Lego Rivendell set" and Claude turns it into ideas assigned to the right people.
- **Claim to avoid duplicates.** "I've got this" marks who's buying; others see "Dad has it."
- **Occasions and budgets.** Christmas for everyone, birthdays per person, budget vs. spent.
- **History.** Everything marked given, by year and person, so nobody gets the same thing twice.

## Setup

```bash
cp .env.example .env         # add ANTHROPIC_API_KEY for real parsing (optional)
npm install
npm run db:push              # create the SQLite schema in data/local.db
npm run db:seed              # sample family: Mom, Dad (members, PIN 1234), Ava, Jake, Grandma Jo
npm run dev                  # http://localhost:3001
```

Without `ANTHROPIC_API_KEY` the Capture page runs in **demo mode** (badge shown) and returns a
realistic sample so every screen is clickable.

## The privacy model

- `people.isMember = 1` means the person can sign in on `/who` (optionally with a 4-digit PIN).
  Kids and grandparents who only receive gifts are not members.
- Signing in sets an httpOnly `viewer` cookie. Every page redirects to `/who` without it.
- `ideasVisibleTo(viewerId)` is the only way ideas are read. `loadIdeaForViewer` and
  `assertNotSelf` guard every write. `/go/[ideaId]` returns 404 for the viewer's own gifts.
- The viewer's own person page shows "No peeking" with just their profile editor.

## Stack

Next.js 16 (App Router, Server Actions), Tailwind 4, Drizzle ORM + libsql (SQLite locally, Turso
hosted), Anthropic SDK (`claude-opus-5-5`, structured output via Zod). Installable as a PWA.

## Deploy

1. Create a Turso database, set `DATABASE_URL=libsql://…` and `DATABASE_AUTH_TOKEN`.
2. Run `npm run db:push` against it once.
3. Deploy to Vercel with `ANTHROPIC_API_KEY`, `DATABASE_URL`, `DATABASE_AUTH_TOKEN` and
   `AMAZON_ASSOCIATES_TAG` set. Root directory: `apps/gift-planner`.

## Monetization

1. Free for one household with a handful of people.
2. Premium family tier (unlimited people, shared with grandparents, reminders) for a few dollars a month.
3. Amazon Associates tag on every outbound shopping link via `/go/[ideaId]`; clicks are counted per idea.

## Known gaps (v1)

- Single household; no real accounts or invites yet (PIN per member only).
- No reminders or notifications before an occasion.
- Link metadata (title, image, price) is not fetched from the URL yet.
