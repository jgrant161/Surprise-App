# Conventions (both apps)

Two independent Next.js apps live under `apps/`. Each has its own `package.json`,
database and `.env`. Nothing is shared at the code level on purpose: either app can be
deployed, sold or killed on its own.

| | `apps/snap-schedule` | `apps/gift-planner` |
|---|---|---|
| Product | Snap Schedule: photo/text of a schedule -> family calendar events | Surprise: gift ideas, occasions, budgets, hidden lists |
| Dev URL | http://localhost:3000 | http://localhost:3001 |

## Stack
- Next.js 16 App Router, `src/` dir, TypeScript, Tailwind 4. Server Components for reads,
  Server Actions (`"use server"` files under `src/app/**/actions.ts`) for writes, Route
  Handlers only for binary/feeds (image upload, `.ics`).
- `cacheComponents` is off. Root layout exports `dynamic = "force-dynamic"`; every page is
  rendered per request from the database.
- Before using any Next API, check the bundled docs in `node_modules/next/dist/docs/`.
- Database: Drizzle ORM + `@libsql/client`. Schema in `src/db/schema.ts`, client in
  `src/db/index.ts`. Local file `data/local.db`; hosted Turso in production via
  `DATABASE_URL` / `DATABASE_AUTH_TOKEN`. `npm run db:push` syncs schema (drizzle-kit),
  `npm run db:seed` loads demo data. IDs are text UUIDs (`crypto.randomUUID()`), timestamps
  are ISO strings.
- Claude: `@anthropic-ai/sdk` with `client.messages.parse` + `zodOutputFormat` (Zod 4),
  model `claude-opus-5-5`, `max_tokens: 16000`. All model calls live in `src/lib/claude.ts`.
  When `ANTHROPIC_API_KEY` is missing the function returns realistic sample output and the UI
  shows a "demo mode" badge, so the app is fully clickable without a key.
- Mobile first. PWA manifest (`src/app/manifest.ts`), bottom tab nav, large tap targets.
  Plain Tailwind, no component library.
- Quality bar before handing off: `npm run lint`, `npm run build`, and a smoke run of
  `npm run start` hitting the main pages with curl.
