# Phase 1: Walking Skeleton

**Created:** 2026-05-21
**Phase:** 1 — UI Development

## What the Skeleton Proves

The first deliverable (Plan 01) proves the entire Next.js stack works end-to-end with the thinnest possible real interaction:

1. **Build & dev server:** `npm run dev` boots without errors.
2. **Routing:** Visiting `/` issues a 307 redirect to `/login` (server-side via `redirect()` from `next/navigation`).
3. **Layout & styling:** The root layout renders the topbar with brand text "IC Podcast Recorder" (no red dot per D-06), Inter font is loaded via `next/font/google` and exposed as `--font-inter`, and `globals.css` design tokens (`--bg`, `--ink`, `--accent`, etc.) are applied to the body.
4. **Real UI interaction:** The login page renders an email + password form. Submitting the form (after passing client-side validation) calls `router.push('/lobby')` and the browser navigates to `/lobby`. The lobby route exists as a placeholder ("Lobby" text) so navigation can be verified.

## Minimal Interaction

```
User visits  http://localhost:3000/
   |
   v  (server-side redirect)
http://localhost:3000/login
   |
   v  (renders LoginView client component)
User fills:    email = "test@example.com"
               password = "0123456789"  (>= 10 chars)
   |
   v  (form submit, client-side validation passes)
router.push('/lobby')
   |
   v
http://localhost:3000/lobby   (placeholder page renders)
```

This single flow exercises: Next.js App Router, `next/font/google`, `globals.css`, Server Components (page.tsx), Client Components (`'use client'`), `useRouter`, form state, and client-side navigation.

## Architectural Decisions Locked In

| Decision | Value | Source |
|----------|-------|--------|
| Framework | Next.js 16.2.6 App Router | CONTEXT D-04 |
| Language | TypeScript 6.0.3 | CONTEXT |
| Styling | Single `app/globals.css` (no Tailwind, no CSS Modules) | CONTEXT D-02 |
| Font | Inter via `next/font/google` (self-hosted) | CONTEXT D-03 |
| Directory layout | `app/`, `components/`, `components/ui/`, no `src/` | RESEARCH project structure |
| Import alias | `@/*` → repo root | RESEARCH scaffold flags |
| Lint config | `eslint.config.mjs` (ESLint 9 / Next 16 default) | RESEARCH state-of-the-art |
| Page boundary rule | `app/**/page.tsx` are Server Components; view components carry `'use client'` | RESEARCH Pitfall 3 |
| Routing | `/` → `/login`, plus `/login`, `/lobby`, `/room`, `/download` | CONTEXT D-04 |
| Topbar | Shared in `app/layout.tsx`, brand text only, user/sign-out hidden in Phase 1 | CONTEXT D-05, D-06 |
| Test framework | Jest + React Testing Library + jest-environment-jsdom | RESEARCH validation |

## How to Verify the Skeleton

After Plan 01 completes:

1. `npm install` succeeds.
2. `npm run dev` starts the dev server on port 3000 without errors.
3. `curl -sI http://localhost:3000/` returns HTTP 307 with `location: /login`.
4. `curl -s http://localhost:3000/login` returns HTML containing the strings `IC Podcast Recorder`, `Record`, and `together`.
5. The page at `/login` renders the login form; submitting valid credentials navigates to `/lobby` (placeholder).
6. `npm run build` completes without errors.
7. `npm test -- --watchAll=false` runs (Jest configured) — the routing/redirect test passes.

## Out of Scope for the Skeleton (Plans 02–04)

- Full LoginView (tabs, register, error rendering) → Plan 02
- LobbyView (seats, waiting animation, room code) → Plan 02
- UI primitives (Button, Field, Avatar) → Plan 02
- RoomView state machine, RecordButton, MicVisualizer → Plan 03
- DownloadView (session list) → Plan 04
