# Phase 1: UI Development - Context

**Gathered:** 2026-05-21
**Status:** Ready for planning

<domain>
## Phase Boundary

Translate the existing HTML prototype (`IC Podcast Recorder.html`) into a Next.js App Router project. Deliver the full app shell, routing structure, base styling system, and all UI components with typed props and placeholder data. No auth, no WebRTC, no MediaRecorder, no server actions — pure UI.

</domain>

<decisions>
## Implementation Decisions

### CSS Strategy
- **D-01:** CSS custom properties (`:root` token block) ported as-is into `app/globals.css`. All 11 tokens: `--bg`, `--bg-2`, `--bg-3`, `--line`, `--ink`, `--ink-dim`, `--ink-mute`, `--accent`, `--rec`, `--rec-deep`, `--ok`, `--sans`.
- **D-02:** All component-scoped styles (`.login-wrap`, `.lobby-inner`, `.panel`, `.pillar`, `.rec-btn`, etc.) live in `app/globals.css`. No CSS Modules, no Tailwind.
- **D-03:** Inter font via `next/font/google` (self-hosted). No Google CDN `<link>` tags in layout.

### Routing
- **D-04:** Separate routes per view — `/` redirects to `/login`, `/lobby`, `/room`, `/download`. Uses Next.js App Router pages.
- **D-05:** Topbar lives in `app/layout.tsx` as a shared layout element. Renders on every page. User name + sign-out are conditionally hidden when no session (Phase 2 wires the real session check — Phase 1 can default to hidden).
- **D-06:** Brand in topbar has no red dot — text only (`IC Podcast Recorder`).

### Components
- **D-07:** Shared primitives in `components/ui/`: `Button`, `Field`, `Avatar`. Page-level views in `components/`: `LoginView`, `LobbyView`, `RoomView`, `DownloadView`. `RecordButton` and `MicVisualizer` as standalone components inside the room view.
- **D-08:** `app/(route)/page.tsx` files are thin shells — they import and render the matching view component.
- **D-09:** `MicVisualizer` generates bar elements in `useEffect` with random `animationDelay` and `animationDuration` via inline `style` props. Same approach as `buildVis()` in the HTML.

### Phase 1 Scope
- **D-10:** Components accept typed props with placeholder defaults. Example: `user?: { name: string; initials: string }`, `peerStatus?: 'waiting' | 'connected'`. Phase 2–4 pass real data without rework.
- **D-11:** `RoomView` builds the full local state machine: `idle → countdown → recording → uploading → mixing → ready`. All CSS state classes (`.room.recording`, `.countdown.show`) are wired. Phase 3–4 replace the local trigger with WebRTC/upload signals.
- **D-12:** Login/register form does client-side validation only (required fields, email format, password length). On success, navigates to `/lobby` (placeholder). No server action called in Phase 1.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Design Source
- `IC Podcast Recorder.html` — Complete HTML prototype. All 4 views (Login, Lobby, Room, Post-session), full CSS token system, animations, and state machine. This is the visual and structural ground truth for Phase 1.

### Project Scope
- `.planning/PROJECT.md` — Tech stack constraints (Next.js only, SQLite, no Go), out-of-scope list, key decisions log.
- `.planning/ROADMAP.md` — Phase 1 goal, and Phase 2–4 file structure that Phase 1 components must be shaped to receive.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- None yet — greenfield project. The HTML file is the only existing asset.

### Established Patterns
- The HTML's CSS class naming is the established pattern (`.btn`, `.btn.primary`, `.btn.ghost`, `.btn.block`, `.field`, `.avatar`, `.avatar.empty`, etc.) — preserve these class names in React components so globals.css styles apply without modification.
- The room state machine in the HTML (`applyRoomState` switch) maps directly to a React `useState` with a union type: `'idle' | 'countdown' | 'recording' | 'uploading' | 'mixing' | 'ready'`.

### Integration Points
- Phase 2 will wire `LoginView`/`RegisterView` form submit to a server action — the form component must accept an `onSubmit` prop or use a `<form action={...}>` pattern.
- Phase 3 will replace `RoomView`'s local state triggers (`onRecClick`) with WebRTC peer signals — keep the state machine in one hook so it can be driven externally.
- Phase 4 uploads happen after the `'recording' → 'uploading'` transition — the state machine boundary is the right handoff point.

</code_context>

<specifics>
## Specific Ideas

- Brand: text-only, no red dot. "IC Podcast Recorder" in `font-weight: 500`.
- Login page headline: "Record *together.*" (italic on "together") — use `<em>` or `<i>` styled with `color: var(--accent)`.
- Lobby headline: "Waiting for your *co-host.*" — same italic accent pattern.
- Post-session headline: "Your *sessions.*" — same.
- RecordButton: radial gradient from `#ff7676 → var(--rec) → var(--rec-deep)`, pulsing box-shadow when recording.
- Countdown overlay: fullscreen backdrop blur, 200px number, animates out with `cdPop` keyframe.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 1-UI Development*
*Context gathered: 2026-05-21*
