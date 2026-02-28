# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev           # Dev server (Next.js 16 + Turbopack)
npm run build         # Production build
npm run lint          # ESLint
npm run db:generate   # Generate Prisma client (run after schema changes)
npm run db:push       # Push schema to Neon PostgreSQL
npm run db:studio     # Prisma Studio GUI
npm run db:seed       # Seed database (npx tsx prisma/seed.ts)
```

No test runner is configured.

## Tech Stack

Next.js 16 (App Router) + React 19 + TypeScript 5.9 + Tailwind CSS v4 + Prisma 6 (Neon PostgreSQL). AI via OpenRouter (Claude for stories, Flux for images). Background jobs via Trigger.dev v3. Auth via NextAuth.js v5 (JWT strategy). Payments via LemonSqueezy, print fulfillment via Lulu API. Internationalization via `next-intl` (en, he).

## Architecture

### Book Generation Pipeline

The core flow: User completes 5-step wizard (`/create`) → API creates Book (DRAFT) → Trigger.dev task (`src/trigger/generate-book.ts`) runs 6 stages sequentially: STORY → SAFETY_REVIEW → CHARACTER_DESIGN → PAGE_ILLUSTRATIONS → PDF_ASSEMBLY → QUALITY_CHECK → Book status becomes PREVIEW_READY. The `/generate/[bookId]` page polls via SSE (`/api/stream/[bookId]`) which checks GenerationLog entries every 2s.

### AI Services via OpenRouter

Both story generation (`src/lib/claude.ts`) and image generation (`src/lib/image-gen.ts`) use the OpenAI SDK client pointed at `https://openrouter.ai/api/v1`. Models are configured via env vars: `STORY_MODEL`, `REVIEW_MODEL`, `IMAGE_MODEL`. Story generation returns JSON (markdown fences stripped before parsing). Images are generated 4 at a time to avoid rate limits. A single character reference image is generated first and used across all page illustrations for visual consistency.

### Auth & Route Protection

NextAuth.js v5 with JWT strategy (`src/lib/auth.ts`). Middleware (`src/proxy.ts`) runs at the edge — it wraps `next-intl/middleware` for locale detection and checks session cookies for auth (no Prisma). Protected paths: `/dashboard`, `/create`, `/preview`, `/checkout`, `/generate`. API routes check `session?.user?.id` from `auth()` and return 401 if missing.

### Internationalization

`next-intl` with `[locale]` route segment (`src/app/[locale]/`). Supported locales defined in `src/i18n/routing.ts` (currently `en`, `he`). Translation files in `messages/{locale}.json`. Two label systems: `src/lib/constant-labels.ts` (server-side, always English for AI prompts) and inline `useTranslations("Constants")` calls (client-side, localized). User locale preference persisted in `User.locale` field via `PUT /api/user/locale`. Hebrew uses RTL layout with dedicated fonts (Rubik, Heebo) swapped via CSS `[lang="he"]` selectors in `globals.css`.

### State Management

Zustand store (`src/hooks/use-wizard-store.ts`) with `persist` middleware (localStorage key: `"wizard-storage"`). Uses `partialize` to exclude File objects from persistence while keeping photoPreview data URLs.

### File Storage

Cloudflare R2 via AWS S3 SDK (`src/lib/r2.ts`). Client uploads use presigned URLs (1hr expiry). Key patterns: `photos/{userId}/...`, `books/{bookId}/illustrations/...`, `books/{bookId}/{print|preview}.pdf`. Public URLs via `R2_PUBLIC_URL`.

### Styling

Tailwind CSS v4 using `@import "tailwindcss"` + `@theme` in `globals.css`. Custom design tokens (colors, radii) defined in `@theme` block. Five font families: `--font-sans` (Quicksand), `--font-display` (Fredoka), `--font-story` (Baloo 2), `--font-sans-he` (Rubik), `--font-story-he` (Heebo). Hebrew fonts override `--font-sans` and `--font-story` via `[lang="he"]` in `globals.css`. UI components in `src/components/ui/` follow shadcn patterns using `class-variance-authority` + `clsx` + `tailwind-merge`.

## Key Conventions

- **Path alias**: `@/*` maps to `src/*`
- **Prisma singleton**: `src/lib/db.ts` — import as `db`, attached to `globalThis` in dev for HMR
- **Resend client**: Lazy-initialized via `getResend()` in `src/lib/resend.ts` to avoid build errors when env var is missing
- **Zod v4**: Use `{ message: "..." }` for enum params, not `{ required_error: "..." }`
- **Prisma JSON fields**: Cast with `as any` for TypeScript compatibility
- **`useSearchParams()`**: Must wrap in `<Suspense>` for static generation compatibility
- **Middleware is edge-only**: No Prisma or Node.js APIs in `src/proxy.ts`
- **Book status flow**: `DRAFT → GENERATING → COVER_READY → PREVIEW_READY → APPROVED → ORDERED`
- **Locale source of truth**: `src/i18n/routing.ts` — all locale lists (validators, middleware regex, etc.) derive from `routing.locales`
- **API route pattern**: Validate with Zod, check auth via `auth()`, try/catch with descriptive errors
