# Phase 1: UI Development - Research

**Researched:** 2026-05-21
**Domain:** Next.js 16 App Router, TypeScript, CSS custom properties, React client components
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**CSS Strategy**
- D-01: CSS custom properties (`:root` token block) ported as-is into `app/globals.css`. All 11 tokens: `--bg`, `--bg-2`, `--bg-3`, `--line`, `--ink`, `--ink-dim`, `--ink-mute`, `--accent`, `--rec`, `--rec-deep`, `--ok`, `--sans`.
- D-02: All component-scoped styles (`.login-wrap`, `.lobby-inner`, `.panel`, `.pillar`, `.rec-btn`, etc.) live in `app/globals.css`. No CSS Modules, no Tailwind.
- D-03: Inter font via `next/font/google` (self-hosted). No Google CDN `<link>` tags in layout.

**Routing**
- D-04: Separate routes per view — `/` redirects to `/login`, `/lobby`, `/room`, `/download`. Uses Next.js App Router pages.
- D-05: Topbar lives in `app/layout.tsx` as a shared layout element. Renders on every page. User name + sign-out are conditionally hidden when no session (Phase 1 defaults to hidden).
- D-06: Brand in topbar has no red dot — text only (`IC Podcast Recorder`).

**Components**
- D-07: Shared primitives in `components/ui/`: `Button`, `Field`, `Avatar`. Page-level views in `components/`: `LoginView`, `LobbyView`, `RoomView`, `DownloadView`. `RecordButton` and `MicVisualizer` as standalone components inside the room view.
- D-08: `app/(route)/page.tsx` files are thin shells — they import and render the matching view component.
- D-09: `MicVisualizer` generates bar elements in `useEffect` with random `animationDelay` and `animationDuration` via inline `style` props.

**Phase 1 Scope**
- D-10: Components accept typed props with placeholder defaults. Example: `user?: { name: string; initials: string }`, `peerStatus?: 'waiting' | 'connected'`. Phase 2–4 pass real data without rework.
- D-11: `RoomView` builds the full local state machine: `idle → countdown → recording → uploading → mixing → ready`. All CSS state classes (`.room.recording`, `.countdown.show`) are wired. Phase 3–4 replace the local trigger with WebRTC/upload signals.
- D-12: Login/register form does client-side validation only (required fields, email format, password length). On success, navigates to `/lobby` (placeholder). No server action called in Phase 1.

### Claude's Discretion

None — discussion stayed within phase scope.

### Deferred Ideas (OUT OF SCOPE)

None.
</user_constraints>

---

## Summary

Phase 1 translates an existing single-file HTML prototype (`IC Podcast Recorder.html`) into a Next.js 16 App Router project with TypeScript. The HTML file is the complete design source: all 4 views (Login, Lobby, Room, Post-session), the full CSS token system, all animations, and the room state machine are already defined there. The migration task is structural, not creative — faithfully port the HTML's class names, tokens, and state logic into React components without altering the visual output.

The project has no existing Next.js scaffold yet. Phase 1 must therefore deliver both the Walking Skeleton (project creation, routing proving end-to-end stack) and all UI components in a single phase. Because all styles live in `globals.css` (D-02), there are no CSS Module or utility class complications. The primary technical complexity is: (1) preserving CSS class-name-driven state toggling in a React world using `className` conditionals and data attributes, and (2) correctly splitting components at the `'use client'` boundary — all view components need state or effects, so every view is a Client Component.

The standard scaffold command is `npx create-next-app@latest` with TypeScript selected and Tailwind explicitly deselected. Inter font uses `next/font/google` which self-hosts the font at build time — the Google CDN `<link>` tags in the HTML prototype are NOT ported.

**Primary recommendation:** Scaffold with `create-next-app`, skip Tailwind, port the HTML's entire `<style>` block verbatim into `globals.css`, then build each view component as a `'use client'` file that mirrors the HTML structure using the same class names.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| App shell / topbar | Frontend Server (SSR layout) | — | `app/layout.tsx` is a Server Component; topbar is static markup with a client-side session slot |
| Route rendering | Frontend Server (SSR pages) | — | Page files are thin Server Components that import view components |
| View interactivity (forms, state machine, animations) | Browser / Client | — | All views use `useState`, `useEffect`, event handlers — must be Client Components |
| CSS token system | Browser / Client | — | CSS custom properties in `globals.css`, applied at runtime via class names |
| Font loading | CDN / Static | — | `next/font/google` self-hosts Inter at build time, inlines CSS |
| Room state machine | Browser / Client | — | `RoomView` owns `idle → countdown → recording → uploading → mixing → ready` state locally in Phase 1 |
| MicVisualizer bars | Browser / Client | — | DOM manipulation via `useEffect` for random animation delays |

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next | 16.2.6 | Framework, routing, font optimization, dev server | Project constraint; latest stable as of research date |
| react | 19.2.6 | Component model | Peer dependency of Next.js 16 |
| react-dom | 19.2.6 | DOM rendering | Peer dependency of Next.js 16 |
| typescript | 6.0.3 | Type safety | Project uses TypeScript per CONTEXT.md |

[VERIFIED: npm registry — versions confirmed 2026-05-21]

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @types/react | 19.2.15 | TypeScript types for React | Always with TypeScript + React |
| @types/node | 25.9.1 | TypeScript types for Node.js globals | Needed for Next.js config and env types |
| eslint-config-next | 16.2.6 | Next.js ESLint rules | Auto-configured by create-next-app |

[VERIFIED: npm registry — versions confirmed 2026-05-21]

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `app/globals.css` for all styles | CSS Modules | D-02 locks this out; CSS Modules would require renaming classes and lose the direct HTML-to-React mapping |
| `next/font/google` | Google CDN `<link>` | D-03 locks this out; CDN adds external request, violates privacy, slower |
| App Router | Pages Router | D-04 locks App Router; no reason to deviate |

**Installation:**
```bash
npx create-next-app@latest ic-podcast --typescript --no-tailwind --eslint --app --no-src-dir --import-alias "@/*"
```

**Version verification:** All versions confirmed via `npm view <pkg> version` on 2026-05-21.

---

## Package Legitimacy Audit

All packages are core Next.js ecosystem packages with multi-year histories on npm.

| Package | Registry | Age | Downloads | Source Repo | slopcheck | Disposition |
|---------|----------|-----|-----------|-------------|-----------|-------------|
| next | npm | ~9 yrs | ~9M/wk | github.com/vercel/next.js | N/A (npm verified) | Approved |
| react | npm | ~11 yrs | ~50M/wk | github.com/facebook/react | N/A (npm verified) | Approved |
| react-dom | npm | ~11 yrs | ~50M/wk | github.com/facebook/react | N/A (npm verified) | Approved |
| typescript | npm | ~11 yrs | ~60M/wk | github.com/microsoft/TypeScript | N/A (npm verified) | Approved |
| @types/react | npm | ~8 yrs | ~45M/wk | github.com/DefinitelyTyped/DefinitelyTyped | N/A (npm verified) | Approved |
| @types/node | npm | ~8 yrs | ~55M/wk | github.com/DefinitelyTyped/DefinitelyTyped | N/A (npm verified) | Approved |

Note: slopcheck runs against PyPI; these are npm packages. Registry cross-check was performed directly with `npm view` instead. All packages are long-established with authoritative source repos.

**Packages removed due to slopcheck [SLOP] verdict:** none
**Packages flagged as suspicious [SUS]:** none

---

## Architecture Patterns

### System Architecture Diagram

```
Browser request
      |
      v
Next.js App Router (server)
      |
      +-- app/layout.tsx (Server Component)
      |       |
      |       +-- Inter font CSS injected (next/font/google)
      |       +-- app/globals.css (tokens + all component styles)
      |       +-- <header class="topbar"> (static markup)
      |       +-- {children}
      |
      +-- app/page.tsx  --> redirect('/login')
      |
      +-- app/login/page.tsx  --> <LoginView />
      +-- app/lobby/page.tsx  --> <LobbyView />
      +-- app/room/page.tsx   --> <RoomView />
      +-- app/download/page.tsx --> <DownloadView />
             |
             v (each view is 'use client')
        React Client Component
             |
        useState / useEffect
             |
        CSS class toggling
        (e.g. .room.recording, .countdown.show)
```

Data flows: placeholder props (Phase 1) → component renders static/animated HTML → CSS classes drive visual state.

### Recommended Project Structure

```
ic-podcast/
├── app/
│   ├── globals.css          # ALL styles: tokens + every component class
│   ├── layout.tsx           # Root layout: Inter font, topbar, body wrapper
│   ├── page.tsx             # Redirects to /login
│   ├── login/
│   │   └── page.tsx         # Thin shell: renders <LoginView />
│   ├── lobby/
│   │   └── page.tsx         # Thin shell: renders <LobbyView />
│   ├── room/
│   │   └── page.tsx         # Thin shell: renders <RoomView />
│   └── download/
│       └── page.tsx         # Thin shell: renders <DownloadView />
├── components/
│   ├── ui/
│   │   ├── Button.tsx       # .btn, .btn.primary, .btn.ghost, .btn.block
│   │   ├── Field.tsx        # .field, label, input
│   │   └── Avatar.tsx       # .avatar, .avatar.empty, .status dot
│   ├── LoginView.tsx        # Login + Register tabs, form, validation
│   ├── LobbyView.tsx        # Seats, waiting animation, lobby actions
│   ├── RoomView.tsx         # Room head, panels, pillar, state machine
│   ├── DownloadView.tsx     # Post-session recording list
│   ├── RecordButton.tsx     # .rec-btn, .rec-shell, dotrec/square toggle
│   └── MicVisualizer.tsx    # .vis bars with random animation delays
├── next.config.ts
├── tsconfig.json
└── package.json
```

### Pattern 1: CSS Class-Driven State (React Version)

**What:** The HTML's `room.classList.toggle('recording')` becomes a conditional className in React. All CSS state selectors (`.room.recording .live`, `.room.recording .rec-btn`) continue to work unchanged because the class names are preserved.

**When to use:** Every state transition in `RoomView`.

**Example:**
```tsx
// Source: Verified pattern from Next.js + standard React
'use client'
import { useState } from 'react'

type RoomState = 'idle' | 'countdown' | 'recording' | 'uploading' | 'mixing' | 'ready'

export default function RoomView() {
  const [roomState, setRoomState] = useState<RoomState>('idle')

  return (
    <div className={`room${roomState === 'recording' ? ' recording' : ''}`}>
      {/* .countdown conditionally shown */}
      <div className={`countdown${roomState === 'countdown' ? ' show' : ''}`}>
        {/* countdown content */}
      </div>
    </div>
  )
}
```

### Pattern 2: `next/font/google` Self-Hosted Inter

**What:** Inter is loaded at build time, self-hosted, and applied to the `<html>` element. The `variable` option exposes it as a CSS custom property (`--font-inter`) so `globals.css` can reference it via `var(--sans)`.

**When to use:** Root layout only. Declared once, applied globally.

**Example:**
```tsx
// Source: https://nextjs.org/docs/app/api-reference/components/font [VERIFIED: official docs]
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  )
}
```

Then in `globals.css`, the existing `--sans` token picks up the variable:
```css
:root {
  --sans: var(--font-inter), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}
```

### Pattern 3: MicVisualizer with `useEffect`

**What:** Mirrors the HTML's `buildVis()` function. Generates bar `<div>` elements with random `animationDelay` and `animationDuration` on mount. Must be in `useEffect` to avoid SSR mismatch (Math.random() values differ server vs client).

**When to use:** `MicVisualizer` component only.

**Example:**
```tsx
// Source: Derived from HTML's buildVis() + React useEffect docs [VERIFIED: official docs]
'use client'
import { useEffect, useRef } from 'react'

export default function MicVisualizer({ count = 36 }: { count?: number }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.innerHTML = ''
    for (let i = 0; i < count; i++) {
      const bar = document.createElement('div')
      bar.className = 'bar'
      bar.style.animationDelay = (Math.random() * 1).toFixed(2) + 's'
      bar.style.animationDuration = (0.55 + Math.random() * 0.8).toFixed(2) + 's'
      el.appendChild(bar)
    }
  }, [count])

  return <div ref={ref} className="vis" />
}
```

### Pattern 4: Root `/` Redirect

**What:** `app/page.tsx` redirects to `/login`. Uses `redirect()` from `next/navigation` in a Server Component — cleanest approach, no client JS needed.

**Example:**
```tsx
// Source: https://nextjs.org/docs/app/api-reference/functions/redirect [VERIFIED: official docs]
import { redirect } from 'next/navigation'

export default function RootPage() {
  redirect('/login')
}
```

### Pattern 5: Thin Page Shell

**What:** `app/login/page.tsx` is a Server Component whose only job is to render the corresponding view component. This keeps routing logic server-side and view logic in the component.

**Example:**
```tsx
// Source: D-08 from CONTEXT.md + Next.js App Router convention [VERIFIED: official docs]
import LoginView from '@/components/LoginView'

export default function LoginPage() {
  return <LoginView />
}
```

### Anti-Patterns to Avoid

- **Putting `'use client'` on page.tsx files:** Page files should stay Server Components. The view components carry the `'use client'` boundary. This avoids pulling the whole page into the client bundle.
- **Importing Google Fonts via `<link>` in layout:** D-03 forbids this. `next/font/google` downloads at build time; a CDN `<link>` adds a runtime external request.
- **Using `Math.random()` during SSR render:** Produces hydration mismatch. Random values for `MicVisualizer` bars must be computed inside `useEffect`, not in the render body.
- **Adding a `.dot` element to the topbar brand:** D-06 explicitly removes the red dot. The HTML has `<span class="dot">` — do not port it.
- **CSS Modules or inline styles for component styles:** D-02 puts all styles in `globals.css`. React component classNames must exactly match the HTML class names for the existing CSS selectors to apply.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Font self-hosting | Manual font file download + `@font-face` | `next/font/google` | Handles subsetting, preloading, fallback, zero layout shift — all automatic |
| Form validation error display | Custom error state manager | Direct `useState` per form | D-12 scopes validation to simple field checks — a library would be overkill |
| CSS animations | JS-driven animation | CSS `@keyframes` already in HTML | All animations (`dotPulse`, `barLive`, `recPulse`, `cdPop`, `livePulse`) are defined in CSS; React only toggles classes |
| Route redirect | `useEffect` + `router.push` | `redirect()` from `next/navigation` | Server-side redirect is cleaner and requires no client JS for a static redirect |

**Key insight:** This phase is primarily a faithful port, not a build. The CSS and animation logic already exist in the HTML file. React's job is to toggle the right classes; it should not re-implement what CSS already does.

---

## Common Pitfalls

### Pitfall 1: SSR Hydration Mismatch in MicVisualizer

**What goes wrong:** `Math.random()` called during server render produces different values than during client hydration, causing React to throw a hydration error and re-render.

**Why it happens:** Server and client renders must produce identical HTML. Random values break this.

**How to avoid:** All bar element creation in `useEffect` only. The `<div class="vis">` renders empty from the server; `useEffect` populates it client-side after hydration.

**Warning signs:** Console error "Hydration failed because the initial UI does not match what was rendered on the server."

### Pitfall 2: CSS Class Name Drift

**What goes wrong:** A React component uses a slightly different class name than the HTML (e.g., `recBtn` instead of `rec-btn`, or `panel-live` instead of `panel live`). The CSS selector in `globals.css` no longer matches and styles silently disappear.

**Why it happens:** Auto-completion or habit applying camelCase React conventions to CSS class names.

**How to avoid:** Copy class names directly from the HTML prototype. The HTML file is the source of truth. Never rename a CSS class during porting.

**Warning signs:** Component renders but looks completely unstyled.

### Pitfall 3: `'use client'` Missing on View Components

**What goes wrong:** `LoginView`, `LobbyView`, `RoomView`, or `DownloadView` use `useState`/`useEffect` without the `'use client'` directive, causing a build-time error: "You're importing a component that needs useState. It only works in a Client Component."

**Why it happens:** Default in App Router is Server Components; forgetting to opt in.

**How to avoid:** Every view component and every component that uses hooks must have `'use client'` as the first line.

**Warning signs:** Build fails with "useState is not allowed in Server Components" or similar.

### Pitfall 4: Countdown Animation Restart

**What goes wrong:** The `cdPop` CSS animation on the countdown number only plays once; pressing the record button again doesn't re-trigger it because the element already exists.

**Why it happens:** CSS animations only play when an element is first inserted or when `animation-name` is reset.

**How to avoid:** The HTML's trick is to remove and re-add the animation: `num.style.animation = 'none'; void num.offsetWidth; num.style.animation = ''`. In React, use a `key` prop increment or toggle a class to force re-render of the number element.

**Warning signs:** 3-2-1 animation works once, then the number changes but doesn't animate on subsequent recording starts.

### Pitfall 5: `create-next-app` Defaults Include Tailwind

**What goes wrong:** Running `npx create-next-app@latest --yes` enables Tailwind by default (per confirmed Next.js 16 docs). This adds Tailwind config, PostCSS, and changes `globals.css` to use `@import 'tailwindcss'` — conflicting with D-02.

**Why it happens:** `--yes` accepts all defaults, and Tailwind is now a default in Next.js 16.

**How to avoid:** Use explicit flags: `--no-tailwind`. Or use the interactive prompt and explicitly decline Tailwind.

**Warning signs:** `globals.css` contains `@import 'tailwindcss'` after scaffolding.

---

## Code Examples

Verified patterns from official sources:

### Inter Font with CSS Variable (for globals.css `--sans` token)
```tsx
// Source: https://nextjs.org/docs/app/api-reference/components/font [VERIFIED: official docs]
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',  // exposes as CSS var for use in globals.css
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  )
}
```

### globals.css Token Block (verbatim from HTML, with font fix)
```css
/* Source: IC Podcast Recorder.html <style> block — port verbatim except --sans */
:root {
  --bg:       #0f0f10;
  --bg-2:     #161618;
  --bg-3:     #1c1c1f;
  --line:     #232327;
  --ink:      #ececea;
  --ink-dim:  #8b8b85;
  --ink-mute: #5a5a55;
  --accent:   #d9b96a;
  --rec:      #e53e3e;
  --rec-deep: #8a1e1e;
  --ok:       #6cd07a;
  --sans:     var(--font-inter), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}
```

### Room State Machine Hook (Phase 1 local version)
```tsx
// Source: Derived from HTML applyRoomState() switch — React adaptation
'use client'
import { useState, useRef, useEffect } from 'react'

type RoomState = 'idle' | 'countdown' | 'recording' | 'uploading' | 'mixing' | 'ready'

export function useRoomState() {
  const [state, setState] = useState<RoomState>('idle')
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const pendingRef = useRef<ReturnType<typeof setTimeout>[]>([])

  function clearTimers() {
    if (timerRef.current) clearInterval(timerRef.current)
    pendingRef.current.forEach(clearTimeout)
    pendingRef.current = []
  }

  // Phase 3 replaces this: accept external trigger instead of local click
  function onRecClick() {
    if (state === 'recording') {
      clearTimers()
      setState('uploading')
    } else {
      setState('countdown')
    }
  }

  useEffect(() => () => clearTimers(), [])

  return { state, setState, onRecClick }
}
```

### Button Primitive
```tsx
// Source: HTML .btn class pattern — React adaptation preserving class names
type ButtonVariant = 'default' | 'primary' | 'ghost'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  block?: boolean
}

export function Button({ variant = 'default', block = false, className = '', ...props }: ButtonProps) {
  const cls = [
    'btn',
    variant === 'primary' ? 'primary' : '',
    variant === 'ghost' ? 'ghost' : '',
    block ? 'block' : '',
    className,
  ].filter(Boolean).join(' ')

  return <button className={cls} {...props} />
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `@next/font` package | `next/font` built-in | Next.js 13.2 | No install needed; already included in `next` |
| Tailwind opt-in | Tailwind is default in `create-next-app` | Next.js 15+ | Must explicitly pass `--no-tailwind` to skip |
| `next dev` uses Webpack | `next dev` uses Turbopack by default | Next.js 15+ | Faster dev; `--webpack` flag to revert if needed |
| `next build` ran linter | Linter decoupled from build | Next.js 16 | Must run `npm run lint` explicitly; build no longer blocks on lint |
| `.eslintrc.json` | `eslint.config.mjs` recommended | ESLint 9 (adopted in Next.js 16) | `create-next-app` generates the new format |

**Deprecated/outdated:**
- Google Fonts `<link>` tag in `<head>`: superseded by `next/font/google`. The HTML prototype uses this — do not port it.
- `pages/` directory: App Router (`app/`) is the standard. No Pages Router in this project.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `create-next-app` interactive prompt allows declining Tailwind when choosing "customize settings" | Common Pitfalls #5 | Low — confirmed via official docs that prompt exists; exact flag `--no-tailwind` verified from docs |

**All other claims were verified or cited. No high-risk assumptions.**

---

## Open Questions

1. **Topbar session state in Phase 1**
   - What we know: D-05 says user name + sign-out default to hidden in Phase 1 since there's no session.
   - What's unclear: Should the topbar accept an optional `user` prop even in Phase 1, or just render the hidden placeholder?
   - Recommendation: Add `user?: { name: string }` prop to the topbar (in layout or as a slot) so Phase 2 can wire it without changing layout.tsx. Default to `null`.

2. **Walking Skeleton interaction**
   - What we know: Phase 1 must prove the stack end-to-end with one real interaction.
   - What's unclear: Which interaction qualifies? The login form navigating to `/lobby` (D-12) is the strongest candidate — it exercises routing, form state, and client navigation.
   - Recommendation: Login form submit → `router.push('/lobby')` is the walking skeleton interaction.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Next.js runtime | Yes | v24.7.0 | — |
| npm | Package management | Yes | 11.5.1 | — |
| Next.js scaffold | Project creation | Yes (npx) | 16.2.6 via create-next-app | — |

**Missing dependencies with no fallback:** None.

---

## Validation Architecture

> `workflow.nyquist_validation` is `true` in config.json — section is included.

### Test Framework

Phase 1 is a new project with no test infrastructure yet. No `package.json`, no test config.

| Property | Value |
|----------|-------|
| Framework | Jest + React Testing Library (standard for Next.js App Router) |
| Config file | `jest.config.ts` — does not exist, Wave 0 gap |
| Quick run command | `npm test -- --watchAll=false` |
| Full suite command | `npm test -- --watchAll=false --coverage` |

Note: Next.js 16 also supports Vitest as an alternative. Either works. Jest is more established for RTL; Vitest is faster. [ASSUMED — no project preference stated; planner should choose one.]

### Phase Requirements → Test Map

Phase 1 covers AUTH-01 through AUTH-04 UI only (forms, validation, navigation). The actual auth logic is Phase 2.

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| UI-LOGIN | Login form shows email + password fields with validation | unit | `npm test -- LoginView` | Wave 0 |
| UI-REGISTER | Register form shows name + email + password with validation | unit | `npm test -- LoginView` | Wave 0 |
| UI-LOBBY | Lobby renders seats grid and waiting animation | unit | `npm test -- LobbyView` | Wave 0 |
| UI-ROOM | Room renders with correct state classes per state | unit | `npm test -- RoomView` | Wave 0 |
| UI-DOWNLOAD | Download page renders session list | unit | `npm test -- DownloadView` | Wave 0 |
| UI-ROUTING | `/` redirects to `/login` | integration | `npm test -- RootPage` | Wave 0 |
| UI-STATEMACHINE | RoomView state transitions apply correct CSS classes | unit | `npm test -- RoomView` | Wave 0 |

### Sampling Rate

- **Per task commit:** `npm test -- --watchAll=false <component>`
- **Per wave merge:** `npm test -- --watchAll=false`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `jest.config.ts` — framework config
- [ ] `jest.setup.ts` — `@testing-library/jest-dom` setup
- [ ] `__tests__/LoginView.test.tsx` — covers UI-LOGIN, UI-REGISTER
- [ ] `__tests__/LobbyView.test.tsx` — covers UI-LOBBY
- [ ] `__tests__/RoomView.test.tsx` — covers UI-ROOM, UI-STATEMACHINE
- [ ] `__tests__/DownloadView.test.tsx` — covers UI-DOWNLOAD
- [ ] `__tests__/page.test.tsx` — covers UI-ROUTING
- [ ] Install: `npm install --save-dev jest @testing-library/react @testing-library/jest-dom jest-environment-jsdom @types/jest`

---

## Security Domain

> Phase 1 is pure UI with no data persistence, no auth, no API calls, and no external input processed server-side. ASVS categories V2 (auth) and V3 (session) are explicitly deferred to Phase 2.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No (Phase 2) | — |
| V3 Session Management | No (Phase 2) | — |
| V4 Access Control | No (Phase 2) | — |
| V5 Input Validation | Partial — client-side only | D-12: email format, required fields, password length >= 10 chars |
| V6 Cryptography | No | — |

### Phase 1 Security Notes

- Client-side validation (D-12) is UX, not security. Phase 2 must re-validate server-side.
- No secrets, no API keys, no environment variables are used in Phase 1.
- No `dangerouslySetInnerHTML` — all content is static strings and typed props.

---

## Sources

### Primary (HIGH confidence)
- `https://nextjs.org/docs/app/api-reference/components/font` — `next/font/google` Inter usage, variable font pattern, CSS variable option [VERIFIED: official Next.js docs, version 16.2.6]
- `https://nextjs.org/docs/app/getting-started/installation` — `create-next-app` flags, TypeScript setup, default Tailwind behavior [VERIFIED: official Next.js docs, version 16.2.6]
- `https://nextjs.org/docs/app/api-reference/functions/redirect` — `redirect()` in Server Components [VERIFIED: official Next.js docs, version 16.2.6]
- `https://nextjs.org/docs/app/getting-started/server-and-client-components` — `'use client'` boundary rules, when hooks require client components [VERIFIED: official Next.js docs, version 16.2.6]
- `IC Podcast Recorder.html` — All CSS tokens, class names, animations, state machine logic, HTML structure [VERIFIED: canonical file in repo]

### Secondary (MEDIUM confidence)
- npm registry (`npm view`) — package versions and publish dates for next, react, react-dom, typescript, @types/* [VERIFIED: npm registry, 2026-05-21]

### Tertiary (LOW confidence)
- None

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — versions verified directly via npm registry
- Architecture: HIGH — patterns verified against official Next.js 16 docs
- Pitfalls: HIGH — SSR hydration mismatch is documented; CSS class drift and `'use client'` omission are structural facts; `create-next-app` Tailwind default confirmed in official docs
- Validation architecture: MEDIUM — Jest/RTL is standard but no project preference stated for Jest vs Vitest

**Research date:** 2026-05-21
**Valid until:** 2026-06-20 (Next.js releases frequently; re-verify if > 30 days)
