# Phase 1: UI Development - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-21
**Phase:** 1-UI Development
**Areas discussed:** CSS strategy, Page routing vs. view switching, Component granularity, Phase 1 scope

---

## CSS Strategy

### Token System

| Option | Description | Selected |
|--------|-------------|----------|
| globals.css + CSS vars | Paste :root block into globals.css as-is. All components use var(--token). | ✓ |
| Tailwind with custom tokens | Map each CSS var to a Tailwind color/font token. Requires tailwind.config.js. | |
| CSS Modules per component | Each component gets a .module.css. Design tokens duplicated or imported. | |

**User's choice:** globals.css + CSS vars
**Notes:** None

### Component-scoped Styles

| Option | Description | Selected |
|--------|-------------|----------|
| All in globals.css | One file, mirrors the HTML directly. | ✓ |
| CSS Modules per component | LoginView.module.css, RoomView.module.css, etc. | |
| Inline styles for dynamic values | Static layout in globals.css, dynamic things as React inline style props. | |

**User's choice:** All in globals.css

### Font Loading

| Option | Description | Selected |
|--------|-------------|----------|
| next/font/google | Self-hosted, zero layout shift, no external font request. | ✓ |
| Keep Google CDN link | Paste the <link> tags into layout.tsx head. | |

**User's choice:** next/font/google

---

## Page Routing vs. View Switching

### Route Structure

| Option | Description | Selected |
|--------|-------------|----------|
| Separate routes | /login, /lobby, /room, /download as Next.js App Router pages. | ✓ |
| Single route with state | app/page.tsx manages currentView state. All 4 views render conditionally. | |

**User's choice:** Separate routes

### Topbar Placement

| Option | Description | Selected |
|--------|-------------|----------|
| app/layout.tsx | Root layout renders TopBar. All pages inherit it. | ✓ |
| Per-page inclusion | Each page renders <TopBar /> itself. | |

**User's choice:** app/layout.tsx

### Topbar Auth State

| Option | Description | Selected |
|--------|-------------|----------|
| Render always, hide user info conditionally | Brand always shows. User name + sign-out hidden when no session. | ✓ |
| Hide topbar on login page | Layout checks current path or route group nesting. | |

**User's choice:** Always visible, hide user info conditionally
**Notes:** Remove the red dot from the brand. Text-only brand: "IC Podcast Recorder".

---

## Component Granularity

### Breakdown Level

| Option | Description | Selected |
|--------|-------------|----------|
| Shared primitives + page views | components/ui/ for Button/Field/Avatar, page components for each view. | ✓ |
| Just page views | One component per page, everything inside. | |
| Full atomic design | atoms/Button, molecules/RecordButton, organisms/RoomPanel. | |

**User's choice:** Shared primitives + page views

### File Tree

| Option | Description | Selected |
|--------|-------------|----------|
| components/ at root | components/ui/ for primitives, components/ for views. Pages are thin shells. | ✓ |
| Co-located with routes | app/(auth)/login/_components/LoginView.tsx etc. | |

**User's choice:** components/ at root

### MicVisualizer Animation

| Option | Description | Selected |
|--------|-------------|----------|
| useEffect + inline style | Generate bars in useEffect with random animationDelay/Duration via style prop. | ✓ |
| Static CSS only | Pre-define bars with fixed nth-child delays in globals.css. | |
| Framer Motion | Replace CSS keyframes with Framer Motion variants. | |

**User's choice:** useEffect + inline style

---

## Phase 1 Scope

### Component Props

| Option | Description | Selected |
|--------|-------------|----------|
| Typed props with placeholder defaults | Components accept typed props, default to placeholder values. | ✓ |
| Hardcoded placeholder only | Components render hardcoded names, no props. | |
| Full prop API now | Design every prop a component might ever need upfront. | |

**User's choice:** Typed props with placeholder defaults

### Room State Machine

| Option | Description | Selected |
|--------|-------------|----------|
| Build full state machine in Phase 1 | idle → countdown → recording → uploading → mixing → ready, all wired. | ✓ |
| Static visual only | Room renders in idle state only. | |

**User's choice:** Build the full state machine in Phase 1

### Login Form Server Interaction

| Option | Description | Selected |
|--------|-------------|----------|
| Client-side validation only | Validate inputs, navigate to /lobby on success. No API call. | ✓ |
| Wire up server action stub | Create empty stubs in actions.ts. Form calls the action. | |

**User's choice:** Client-side validation only, no server call

---

## Claude's Discretion

None — user made explicit choices for all gray areas.

## Deferred Ideas

None — discussion stayed within phase scope.
