---
phase: 01-ui-development
plan: 01
subsystem: frontend
tags: [nextjs, scaffold, walking-skeleton, app-router, typescript, jest, css-tokens]
requires: []
provides: [nextjs-scaffold, design-tokens, route-shells, login-view, jest-config]
affects: []
tech-stack:
  added:
    - next@16.2.6
    - react@19.2.4
    - react-dom@19.2.4
    - typescript@^5
    - jest@^29.7.0
    - "@testing-library/react@^16.3.0"
    - "@testing-library/jest-dom@^6.6.3"
    - "@testing-library/user-event@^14.6.1"
    - jest-environment-jsdom@^29.7.0
    - ts-node@^10.9.2
  patterns:
    - Next.js App Router with Server Components for pages, Client Components for views
    - next/font/google for self-hosted Inter via CSS variable --font-inter
    - globals.css single-file CSS strategy (all component styles, no Tailwind, no CSS Modules)
    - TDD with Jest + React Testing Library
key-files:
  created:
    - package.json
    - tsconfig.json
    - next.config.ts
    - eslint.config.mjs
    - app/globals.css
    - app/layout.tsx
    - app/page.tsx
    - app/login/page.tsx
    - app/lobby/page.tsx
    - app/room/page.tsx
    - app/download/page.tsx
    - components/LoginView.tsx
    - jest.config.ts
    - jest.setup.ts
    - __tests__/page.test.tsx
    - __tests__/LoginView.skeleton.test.tsx
  modified: []
decisions:
  - "Used setupFilesAfterEnv (not setupFilesAfterEach) — confirmed from Jest source"
  - "ts-node added as devDependency for jest.config.ts TypeScript support"
  - "LoginView error div uses inline styles matching HTML prototype (font-size, color, margin-top)"
metrics:
  duration: ~25min
  completed: 2026-05-21
  tasks_completed: 2
  files_created: 16
  tests_passing: 4
---

# Phase 1 Plan 01: Walking Skeleton Summary

Next.js 16 App Router scaffold with verbatim HTML CSS port, Inter font via next/font/google, all four route shells, and a minimal LoginView that validates and navigates to /lobby.

## What Was Built

### Task 1: Scaffold Next.js project

Ran `npx create-next-app@latest ic-podcast-temp --typescript --no-tailwind --eslint --app --no-src-dir --import-alias "@/*"` in `/tmp`, then copied scaffold files to the repo root. No Tailwind config files generated; no `@import 'tailwindcss'` in globals.css.

- `package.json`: next@16.2.6, react@19.2.4, typescript@^5, eslint@^9
- `tsconfig.json`: paths `"@/*": ["./*"]` configured
- `npm run build` passes on bare scaffold

### Task 2: Design tokens, layout, route shells, LoginView, Jest

**app/globals.css** — Verbatim port of the HTML `<style>` block (lines 10-452) with exactly 3 edits:
1. `--sans: var(--font-inter), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;` (was `"Inter", ...`)
2. `.brand .dot { ... }` rule deleted (D-06)
3. `.view { ... }` and `.view.active { ... }` rules deleted (routing replaces view toggling)

All CSS ported including: tokens, body reset, `.frame`, `.topbar`, `.brand`, buttons, login, lobby, room, panel, vis, pillar, rec-btn, countdown, progress, post-session, responsive, all keyframes.

**app/layout.tsx** — Server Component. Inter from `next/font/google` with `variable: '--font-inter'`. Topbar with brand text "IC Podcast Recorder" (no `.dot`). `topbar-right` block with `style={{ display: 'none' }}` for Phase 1.

**app/page.tsx** — Server Component. Calls `redirect('/login')` from `next/navigation`.

**Route shells** — Four thin Server Components:
- `app/login/page.tsx`: renders `<LoginView />`
- `app/lobby/page.tsx`, `app/room/page.tsx`, `app/download/page.tsx`: placeholder `<h1>` with route name, comments noting which plan replaces them

**components/LoginView.tsx** — `'use client'` as first line. Renders `.login-wrap > .login-inner` with `.mark` headline (`Record <i>together.</i>`), `.tag`, `.tabs` row (Sign in + Create account tabs), login form with email + password fields, `.error` div (conditional), `.submit-row` with Sign in button. Validation: non-empty fields, `@` in email, password length >= 10. On pass: `router.push('/lobby')`.

**Jest configuration**:
- `jest.config.ts` using `next/jest` preset, `testEnvironment: 'jsdom'`, `setupFilesAfterEnv: ['<rootDir>/jest.setup.ts']`, `moduleNameMapper` for `@/` alias
- `jest.setup.ts` imports `@testing-library/jest-dom`
- `ts-node` added as devDependency (required for TypeScript jest config files)

**Tests** (4 passing):
- `__tests__/page.test.tsx`: mocks `next/navigation`, asserts `redirect('/login')` called
- `__tests__/LoginView.skeleton.test.tsx`: renders LoginView, asserts headline text, empty form shows error with "fill", valid submission calls `push('/lobby')`

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] ts-node missing for jest.config.ts**
- **Found during:** Task 2 — jest failed to parse TypeScript config file
- **Issue:** `jest.config.ts` requires `ts-node` to be installed; it was not in the plan's explicit dependencies
- **Fix:** Added `ts-node@^10.9.2` as devDependency; the plan did mention it as "if needed"
- **Files modified:** `package.json`
- **Commit:** included in Task 2 commit (025aa55)

**2. [Rule 3 - Blocking] Incorrect Jest config key name**
- **Found during:** Task 2 — Jest TypeScript error on `setupFilesAfterFramework`
- **Issue:** Plan mentioned `setupFilesAfterEach` (ambiguous); confirmed correct key is `setupFilesAfterEnv` via Jest source
- **Fix:** Used `setupFilesAfterEnv` in jest.config.ts
- **Files modified:** `jest.config.ts`
- **Commit:** included in Task 2 commit (025aa55)

**3. [Rule 1 - Cleanup] Removed unused scaffold page.module.css**
- **Found during:** Post-Task 2 check
- **Issue:** `app/page.module.css` was created by scaffold but not imported by replacement `app/page.tsx`
- **Fix:** `git rm app/page.module.css`
- **Commit:** c186406

## Verification

- `npm run build`: exits 0, all 6 routes generated (/, /login, /lobby, /room, /download, /_not-found)
- `npm run test:ci`: exits 0, 4 tests passing across 2 test suites
- `app/globals.css`: 0 tailwindcss occurrences, 1 `#d9b96a` occurrence, 1 `var(--font-inter)` occurrence, 0 `.brand .dot` occurrences, 0 `.view.active` occurrences
- `components/LoginView.tsx` first line: `'use client'`
- `app/page.tsx` contains `redirect('/login')`

## Known Stubs

- `app/lobby/page.tsx`: placeholder `<h1>Lobby</h1>` — replaced in Plan 02
- `app/room/page.tsx`: placeholder `<h1>Room</h1>` — replaced in Plan 03
- `app/download/page.tsx`: placeholder `<h1>Download</h1>` — replaced in Plan 04
- `components/LoginView.tsx`: "Create account" tab is non-functional (no register form) — Plan 02 adds register tab

These stubs are intentional per plan scope. The Walking Skeleton only requires login → lobby navigation to be working.

## Threat Flags

None — Phase 1 is pure client-side UI with no data persistence, no API calls, no auth, no external input processed server-side.

## Self-Check: PASSED

All 14 key files exist. All 3 task commits present (e35f536, 025aa55, c186406). `npm run build` and `npm run test:ci` both exit 0.
