# Phase 1: UI Development - Pattern Map

**Mapped:** 2026-05-21
**Files analyzed:** 16 new files
**Analogs found:** 16 / 16 (all from HTML prototype — greenfield project, no existing source files)

---

## File Classification

| New File | Role | Data Flow | Closest Analog | Match Quality |
|----------|------|-----------|----------------|---------------|
| `app/globals.css` | config | transform | HTML `<style>` block, lines 10–452 | exact |
| `app/layout.tsx` | layout | request-response | HTML `<header class="topbar">`, lines 456–467 | exact |
| `app/page.tsx` | route | request-response | HTML `setView('login')` redirect intent | exact |
| `app/login/page.tsx` | route | request-response | HTML `<section id="view-login">`, line 472 | exact |
| `app/lobby/page.tsx` | route | request-response | HTML `<section id="view-lobby">`, line 526 | exact |
| `app/room/page.tsx` | route | request-response | HTML `<section id="view-room">`, line 566 | exact |
| `app/download/page.tsx` | route | request-response | HTML `<section id="view-post">`, line 629 | exact |
| `components/LoginView.tsx` | component | request-response | HTML `#view-login` + `doLogin()`/`doRegister()`, lines 472–523, 751–788 | exact |
| `components/LobbyView.tsx` | component | request-response | HTML `#view-lobby` + `enterLobby()`, lines 526–563, 791–821 | exact |
| `components/RoomView.tsx` | component | event-driven | HTML `#view-room` + `applyRoomState()` + `onRecClick()`, lines 566–665, 822–961 | exact |
| `components/DownloadView.tsx` | component | request-response | HTML `#view-post`, lines 629–666 | exact |
| `components/RecordButton.tsx` | component | event-driven | HTML `.rec-btn` + `.rec-shell`, lines 289–331 | exact |
| `components/MicVisualizer.tsx` | component | event-driven | HTML `buildVis()` + `.vis .bar`, lines 264–281, 706–717 | exact |
| `components/ui/Button.tsx` | component | request-response | HTML `.btn` classes, lines 82–94 | exact |
| `components/ui/Field.tsx` | component | request-response | HTML `.field` + `label` + `input`, lines 120–130 | exact |
| `components/ui/Avatar.tsx` | component | request-response | HTML `.avatar`, `.avatar.empty`, `.status`, lines 180–207 | exact |

---

## Pattern Assignments

### `app/globals.css` (config, transform)

**Analog:** HTML `<style>` block, lines 10–452

**CSS token block** (HTML lines 11–24):
```css
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
  /* Replace next line — font comes from next/font/google, not the HTML CDN link */
  --sans:     var(--font-inter), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}
```

**Body reset** (HTML lines 26–39):
```css
* { box-sizing: border-box; }
html, body { height: 100%; }
body {
  margin: 0;
  background: var(--bg);
  color: var(--ink);
  font-family: var(--sans);
  font-size: 15px;
  line-height: 1.55;
  font-weight: 400;
  -webkit-font-smoothing: antialiased;
  overflow: hidden;
  letter-spacing: .005em;
}
```

**Frame / topbar** (HTML lines 41–74):
```css
.frame {
  position: fixed; inset: 0;
  display: grid;
  grid-template-rows: 60px 1fr;
}
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
  background: var(--bg);
  border-bottom: 1px solid var(--line);
}
.brand {
  display: flex; align-items: center; gap: 12px;
  font-size: 15px; font-weight: 500;
  color: var(--ink); letter-spacing: -.005em;
}
/* NOTE: .brand .dot is intentionally omitted — D-06 removes the red dot */
.topbar-right {
  font-size: 13px; color: var(--ink-dim);
  display: flex; align-items: center; gap: 18px;
}
.topbar-right .user-name { color: var(--ink); font-weight: 500; }
.topbar-right .sign-out {
  color: var(--ink-mute); cursor: pointer;
  transition: color .15s;
}
.topbar-right .sign-out:hover { color: var(--ink-dim); }
```

**Stage / view routing** (HTML lines 77–79):
```css
.stage { position: relative; overflow: auto; }
/* .view / .view.active are NOT needed in Next.js — routing handles view switching */
```

**Entire `<style>` block is ported verbatim** (HTML lines 82–451). The only changes are:
1. Remove `.brand .dot` rule (D-06)
2. Replace `--sans: "Inter", ...` with `--sans: var(--font-inter), ...` (D-03)
3. Remove `.view` / `.view.active` rules (routing replaces view toggling)

---

### `app/layout.tsx` (layout, request-response)

**Analog:** HTML `<header class="topbar">`, lines 456–467; font `<link>` tags, lines 7–9

**Font + layout pattern** (from RESEARCH.md Pattern 2):
```tsx
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <div className="frame">
          <header className="topbar">
            {/* brand — text only, no .dot (D-06) */}
            <div className="brand">
              <span>IC Podcast Recorder</span>
            </div>
            {/* topbar-right: hidden by default in Phase 1; Phase 2 wires session */}
            <div className="topbar-right" style={{ display: 'none' }}>
              <span className="user-name"></span>
              <span className="sign-out">Sign out</span>
            </div>
          </header>
          <main className="stage">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
```

**HTML source markup** (lines 456–467):
```html
<header class="topbar">
  <div class="brand">
    <!-- .dot omitted per D-06 -->
    <span>IC Podcast Recorder</span>
  </div>
  <div class="topbar-right" id="topbar-right" style="display:none">
    <span class="user-name" id="topbar-name"></span>
    <span class="sign-out" onclick="signOut()">Sign out</span>
  </div>
</header>
```

---

### `app/page.tsx` (route, request-response)

**Analog:** HTML `setView()` redirect to login on init; RESEARCH.md Pattern 4

**Server-side redirect pattern:**
```tsx
import { redirect } from 'next/navigation'

export default function RootPage() {
  redirect('/login')
}
```

No JSX needed — `redirect()` throws internally and Next.js handles the 307.

---

### `app/login/page.tsx`, `app/lobby/page.tsx`, `app/room/page.tsx`, `app/download/page.tsx` (route, request-response)

**Analog:** HTML view sections, lines 472, 526, 566, 629; RESEARCH.md Pattern 5

**Thin shell pattern** (identical structure for all four pages):
```tsx
// app/login/page.tsx
import LoginView from '@/components/LoginView'

export default function LoginPage() {
  return <LoginView />
}
```

```tsx
// app/lobby/page.tsx
import LobbyView from '@/components/LobbyView'

export default function LobbyPage() {
  return <LobbyView />
}
```

```tsx
// app/room/page.tsx
import RoomView from '@/components/RoomView'

export default function RoomPage() {
  return <RoomView />
}
```

```tsx
// app/download/page.tsx
import DownloadView from '@/components/DownloadView'

export default function DownloadPage() {
  return <DownloadView />
}
```

**Rule:** Page files are Server Components — no `'use client'` directive. No state, no hooks, no event handlers.

---

### `components/LoginView.tsx` (component, request-response)

**Analog:** HTML `#view-login`, lines 472–523; `doLogin()`, lines 751–761; `doRegister()`, lines 763–772; `switchAuth()`, lines 731–738

**HTML markup structure** (lines 472–523):
```html
<div class="login-wrap">
  <div class="login-inner">
    <div class="mark">Record <i>together.</i></div>
    <div class="tag">Two hosts. One room. One mixed file.</div>
    <div class="tabs">
      <div class="tab on" data-auth="login">Sign in</div>
      <div class="tab" data-auth="register">Create account</div>
    </div>
    <div id="auth-login">
      <!-- email field, password field, error div, submit-row, login-alt -->
    </div>
    <div id="auth-register" style="display:none">
      <!-- name field, email field, password field, error div, submit-row -->
    </div>
  </div>
</div>
```

**Client component pattern** (RESEARCH.md Pattern 1 applied):
```tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

type AuthTab = 'login' | 'register'

export default function LoginView() {
  const [tab, setTab] = useState<AuthTab>('login')
  const [error, setError] = useState('')
  const router = useRouter()

  // Validation mirrors doLogin() and doRegister() from HTML lines 751–772
  function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const email = (form.elements.namedItem('email') as HTMLInputElement).value.trim()
    const pass = (form.elements.namedItem('password') as HTMLInputElement).value
    if (!email || !pass) { setError('Please fill in all fields.'); return }
    if (!email.includes('@')) { setError('Enter a valid email.'); return }
    router.push('/lobby')
  }

  function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const name = (form.elements.namedItem('name') as HTMLInputElement).value.trim()
    const email = (form.elements.namedItem('email') as HTMLInputElement).value.trim()
    const pass = (form.elements.namedItem('password') as HTMLInputElement).value
    if (!name || !email || !pass) { setError('Please fill in all fields.'); return }
    if (!email.includes('@')) { setError('Enter a valid email.'); return }
    if (pass.length < 10) { setError('Password must be at least 10 characters.'); return }
    router.push('/lobby')
  }

  return (
    <div className="login-wrap">
      <div className="login-inner">
        <div className="mark">Record <i>together.</i></div>
        <div className="tag">Two hosts. One room. One mixed file.</div>
        <div className="tabs">
          <div className={`tab${tab === 'login' ? ' on' : ''}`} onClick={() => { setTab('login'); setError('') }}>Sign in</div>
          <div className={`tab${tab === 'register' ? ' on' : ''}`} onClick={() => { setTab('register'); setError('') }}>Create account</div>
        </div>
        {/* render login or register form based on tab state */}
      </div>
    </div>
  )
}
```

**Key italic accent pattern** (HTML lines 475, 108): Use `<i>` tag styled with `color: var(--accent); font-style: normal; font-weight: 500` via the `.mark i` and `.login-inner .mark i` CSS rules already in globals.css. Do not add inline styles.

**Phase 2 handoff note:** Accept an optional `onSubmit` prop or use `<form action={...}>` to wire server action without rework (D from CONTEXT.md).

---

### `components/LobbyView.tsx` (component, request-response)

**Analog:** HTML `#view-lobby`, lines 526–563; `enterLobby()`, lines 791–799

**HTML markup structure** (lines 526–563):
```html
<div class="lobby-wrap">
  <div class="lobby-inner">
    <div class="head">
      <h1>Waiting for your <i>co-host.</i></h1>
      <div class="sub">
        The room opens when both seats are filled
        <span class="dots"><span></span><span></span><span></span></span>
      </div>
    </div>
    <div class="seats">
      <div class="seat">
        <div class="avatar">JR<span class="status online"></span></div>
        <div class="name">June Reyes</div>
        <div class="stat">Connected</div>
      </div>
      <div class="seat waiting">
        <div class="avatar empty">?<span class="status pending"></span></div>
        <div class="name">Co-host</div>
        <div class="stat">Waiting…</div>
      </div>
    </div>
    <div class="lobby-actions">
      <div class="leave-link">← Leave room</div>
      <div class="room-code">Share code <code>ORBIT-7F2K</code>
        <button class="btn">Both joined →</button>
      </div>
    </div>
  </div>
</div>
```

**Props interface** (D-10):
```tsx
interface LobbyViewProps {
  user?: { name: string; initials: string }
  roomCode?: string
  peerStatus?: 'waiting' | 'connected'
  onJoin?: () => void
  onLeave?: () => void
}
```

**Waiting dots animation:** The `.dots span` elements and `dotPulse` keyframe are already in globals.css (HTML lines 159–170). React just renders the markup:
```tsx
<span className="dots"><span></span><span></span><span></span></span>
```

---

### `components/RoomView.tsx` (component, event-driven)

**Analog:** HTML `#view-room`, lines 566–665; `applyRoomState()`, lines 822–866; `onRecClick()`, lines 947–956; `runCountdown()`, lines 868–892; `startRecording()`, lines 894–912

**State machine type** (derived from HTML `applyRoomState` switch, line 833):
```tsx
type RoomState = 'idle' | 'countdown' | 'recording' | 'uploading' | 'mixing' | 'ready'
```

**CSS class-driven state pattern** (RESEARCH.md Pattern 1):
```tsx
'use client'
import { useState, useRef, useEffect } from 'react'

export default function RoomView() {
  const [roomState, setRoomState] = useState<RoomState>('idle')

  return (
    // .room.recording triggers CSS rules for live indicator, rec button, etc.
    <div className={`room${roomState === 'recording' ? ' recording' : ''}`}>
      {/* countdown: .countdown.show triggers display:flex */}
      <div className={`countdown${roomState === 'countdown' ? ' show' : ''}`}>
        <div className="num">3</div>
      </div>
      {/* rest of room structure */}
    </div>
  )
}
```

**HTML markup structure** (lines 566–626):
```html
<div class="room" id="room">
  <div class="room-head">
    <div class="left">
      <span class="room-name">Room ORBIT-7F2K</span>
      <span>·</span>
      <span class="status-idle">2 hosts present</span>
      <span class="live"><span class="pip"></span>Recording live</span>
    </div>
    <div>
      <button class="btn ghost">Back to lobby</button>
      <button class="btn ghost">End session</button>
    </div>
  </div>
  <div class="room-body">
    <div class="panel live" id="panel-a"><!-- avatar, nm, sub, vis --></div>
    <div class="pillar"><!-- rec-shell, timer, state-label --></div>
    <div class="panel live" id="panel-b"><!-- avatar, nm, sub, vis --></div>
  </div>
  <div class="progress-row">
    <div class="status-line"></div>
  </div>
  <div class="countdown">
    <div class="num">3</div>
  </div>
</div>
```

**Countdown animation restart** (HTML lines 885–888 — critical pitfall):
```tsx
// HTML technique to re-trigger CSS animation on same element:
// num.style.animation = 'none'; void num.offsetWidth; num.style.animation = '';
// React equivalent: use a key prop that increments each countdown start
const [cdKey, setCdKey] = useState(0)
// When starting countdown: setCdKey(k => k + 1)
// In JSX: <div key={cdKey} className={`num${cdNum === 'GO' ? ' go' : ''}`}>{cdNum}</div>
```

**Timer logic** (HTML lines 903–908 — `formatTime` + `setInterval`):
```tsx
// formatTime from HTML lines 699–703
function formatTime(s: number): string {
  const h = String(Math.floor(s / 3600)).padStart(2, '0')
  const m = String(Math.floor((s % 3600) / 60)).padStart(2, '0')
  const sec = String(s % 60).padStart(2, '0')
  return `${h}:${m}:${sec}`
}
```

**Props interface** (D-10, D-11):
```tsx
interface RoomViewProps {
  user?: { name: string; initials: string }
  peer?: { name: string; initials: string; location?: string }
  roomCode?: string
  peerStatus?: 'waiting' | 'connected'
  onLeave?: () => void
  onEndSession?: () => void
  // Phase 3 replaces local onRecClick with: externalRecTrigger?: RoomState
}
```

---

### `components/DownloadView.tsx` (component, request-response)

**Analog:** HTML `#view-post`, lines 629–666

**HTML markup structure** (lines 629–666):
```html
<div class="post-wrap">
  <div class="post-head">
    <div>
      <div class="ttl">Your <i>sessions.</i></div>
      <div class="sub">4 takes · 2h 11m total</div>
    </div>
    <button class="btn primary">+ &nbsp;New session</button>
  </div>
  <div class="rec-list">
    <div class="rec-row">
      <div class="ttle">Orbit Drift, Ep. 17<span class="ep">with Mira Senna · May 21</span></div>
      <div class="cell hide-sm"><b>01:08:42</b></div>
      <div class="cell hide-sm">62.3 MB</div>
      <div class="dl">↓&nbsp; Download</div>
    </div>
    <!-- more .rec-row entries -->
  </div>
</div>
```

**Props interface** (D-10):
```tsx
interface Session {
  id: string
  title: string
  guest: string
  date: string
  duration: string
  sizeMB: string
}

interface DownloadViewProps {
  sessions?: Session[]
  onNewSession?: () => void
}
```

**Default placeholder data** matches the HTML's 4 hardcoded rows (lines 640–663). Phase 4 replaces with real data.

---

### `components/RecordButton.tsx` (component, event-driven)

**Analog:** HTML `.rec-shell` + `.rec-btn`, lines 289–331; `.room.recording .rec-btn` state classes, lines 313–315

**HTML markup structure** (lines 593–601):
```html
<div class="rec-shell">
  <button class="rec-btn" id="rec-btn" onclick="onRecClick()">
    <div class="inner">
      <div class="dotrec"></div>   <!-- shown when idle -->
      <div class="square"></div>   <!-- shown when recording, via .room.recording CSS -->
      <div id="rec-text">Start Recording</div>
    </div>
  </button>
</div>
```

**CSS state rule** (HTML lines 313–315) — the parent `.room.recording` class on `RoomView`'s wrapper drives the icon swap. `RecordButton` itself needs no state:
```css
.room.recording .rec-btn .dotrec { display: none; }
.room.recording .rec-btn .square { display: block; }
.room.recording .rec-btn { animation: recPulse 1.8s ease-in-out infinite; }
```

**Props interface:**
```tsx
interface RecordButtonProps {
  label?: string       // 'Start Recording' | 'Stop'
  onClick?: () => void
}
```

The recording visual state is inherited from the `.room.recording` ancestor class — `RecordButton` renders the static markup; `RoomView` controls the class on the wrapper.

---

### `components/MicVisualizer.tsx` (component, event-driven)

**Analog:** HTML `buildVis()`, lines 706–717; `.vis .bar` CSS, lines 265–281

**HTML source function** (lines 706–717):
```js
function buildVis(id, count) {
  const el = document.getElementById(id);
  if (!el) return;
  el.innerHTML = '';
  for (let i = 0; i < count; i++) {
    const b = document.createElement('div');
    b.className = 'bar';
    b.style.animationDelay = (Math.random() * 1).toFixed(2) + 's';
    b.style.animationDuration = (0.55 + Math.random() * 0.8).toFixed(2) + 's';
    el.appendChild(b);
  }
}
```

**React adaptation** (RESEARCH.md Pattern 3):
```tsx
'use client'
import { useEffect, useRef } from 'react'

interface MicVisualizerProps {
  count?: number  // default 36 — matches HTML buildVis('vis-a', 36)
}

export default function MicVisualizer({ count = 36 }: MicVisualizerProps) {
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

**Critical:** `Math.random()` MUST be inside `useEffect`. Never call it during render — SSR produces different values than client hydration, causing a React hydration error.

**Panel class drives animation:** `.panel.live .vis .bar` triggers `barLive` animation. `.panel.muted .vis .bar` disables it. The `panel` wrapper in `RoomView` carries the `.live` / `.muted` class, not `MicVisualizer` itself.

---

### `components/ui/Button.tsx` (component, request-response)

**Analog:** HTML `.btn` CSS rules, lines 82–94; HTML `<button class="btn primary">` usages

**HTML CSS rules** (lines 82–94):
```css
.btn {
  appearance: none; border: 1px solid var(--line);
  background: transparent; color: var(--ink);
  font-family: var(--sans); font-size: 13.5px; font-weight: 500;
  padding: 10px 16px; border-radius: 4px; cursor: pointer;
  transition: background .15s, border-color .15s, color .15s;
}
.btn.primary { background: var(--ink); color: #111; border-color: var(--ink); font-weight: 600; }
.btn.ghost { border-color: transparent; color: var(--ink-dim); padding: 10px 12px; }
.btn.block { width: 100%; padding: 13px; }
```

**React component pattern** (RESEARCH.md Code Examples):
```tsx
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

**Class name rule:** The className values (`btn`, `primary`, `ghost`, `block`) are the exact HTML class names. Never rename to camelCase.

---

### `components/ui/Field.tsx` (component, request-response)

**Analog:** HTML `.field` CSS, lines 120–130; `<div class="field">` usages, lines 483–491

**HTML CSS rules** (lines 120–130):
```css
.field { margin-bottom: 18px; }
.field label { display: block; font-size: 12.5px; color: var(--ink-dim); margin-bottom: 8px; }
.field input {
  width: 100%; background: transparent;
  border: none; border-bottom: 1px solid var(--line);
  color: var(--ink); font-family: var(--sans); font-size: 15px;
  padding: 8px 0 10px; outline: none;
  transition: border-color .15s;
}
.field input:focus { border-bottom-color: var(--ink); }
.field input::placeholder { color: var(--ink-mute); }
```

**HTML markup pattern** (lines 483–491):
```html
<div class="field">
  <label for="li-email">Email</label>
  <input id="li-email" type="email" placeholder="you@studio.fm" autocomplete="email" />
</div>
```

**Props interface:**
```tsx
interface FieldProps {
  label: string
  id?: string
  type?: React.HTMLInputTypeAttribute
  placeholder?: string
  autoComplete?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  name?: string
}
```

---

### `components/ui/Avatar.tsx` (component, request-response)

**Analog:** HTML `.avatar`, `.avatar.empty`, `.status` CSS, lines 180–207; `<div class="avatar">` usages

**HTML CSS rules** (lines 180–207):
```css
.avatar {
  width: 88px; height: 88px; border-radius: 50%;
  background: var(--bg-2); color: var(--ink);
  font-size: 24px; font-weight: 500;
  display: grid; place-items: center;
  margin-bottom: 18px; position: relative;
  border: 1px solid var(--line);
}
.avatar.empty { color: var(--ink-mute); background: transparent; border-style: dashed; }
.avatar .status {
  position: absolute; bottom: 2px; right: 2px;
  width: 14px; height: 14px; border-radius: 50%;
  border: 3px solid var(--bg); background: var(--ink-mute);
}
.avatar .status.online { background: var(--ok); }
.avatar .status.pending {
  background: var(--accent);
  animation: pendingPulse 1.6s ease-in-out infinite;
}
```

**HTML markup pattern** (lines 538–542):
```html
<div class="avatar">JR
  <span class="status online"></span>
</div>
```

**Props interface:**
```tsx
interface AvatarProps {
  initials?: string               // 'JR', 'MS', '?'
  empty?: boolean                 // adds .empty class
  status?: 'online' | 'pending' | 'offline' | null
  size?: 'sm' | 'md'             // sm = 72px (room panel), md = 88px (lobby)
}
```

**Size note:** Room panels use `72px` avatars (HTML line 260: `.panel .avatar { width: 72px; height: 72px }`). Lobby uses `88px` (default). Use a `size` prop to toggle a data attribute or additional class, or apply an inline style override.

---

## Shared Patterns

### `'use client'` Boundary
**Rule:** Every view component and any component using hooks requires `'use client'` as the literal first line of the file.
**Apply to:** `LoginView.tsx`, `LobbyView.tsx`, `RoomView.tsx`, `DownloadView.tsx`, `RecordButton.tsx`, `MicVisualizer.tsx`
**Source:** RESEARCH.md Pitfall 3; Next.js App Router server/client boundary

### CSS Class Name Fidelity
**Rule:** Copy class names verbatim from the HTML. Never rename to camelCase or kebab-case variants.
**Apply to:** All component files
**Source:** HTML prototype; RESEARCH.md Pitfall 2
```
HTML class → React className (correct)    HTML class → React className (wrong)
.rec-btn   → className="rec-btn"           .rec-btn  → className="recBtn"
.panel.live → className="panel live"       .panel.live → className="panelLive"
.btn.primary → className="btn primary"
```

### Italic Accent Pattern
**Rule:** Italic accent words (`together`, `co-host`, `sessions`) use `<i>` tags. Styles come from globals.css (`.mark i`, `.lobby-inner h1 i`, `.post-head .ttl i`). No inline styles on `<i>`.
**Apply to:** `LoginView.tsx` (headline), `LobbyView.tsx` (h1), `DownloadView.tsx` (title)
**Source:** HTML lines 475, 530, 634

### No `Math.random()` in Render
**Rule:** Random values for animation delays must be computed inside `useEffect`. Never call `Math.random()` in the render function body.
**Apply to:** `MicVisualizer.tsx`
**Source:** RESEARCH.md Pitfall 1

### Timer cleanup
**Rule:** All `setInterval` and `setTimeout` references must be cleared on unmount via `useEffect` cleanup return.
**Apply to:** `RoomView.tsx` (timer interval + countdown timeouts)
**Source:** HTML `clearRoomTimers()`, lines 719–728; React `useEffect` cleanup convention

---

## No Analog Found

None — all files have a direct analog in the HTML prototype.

---

## Metadata

**Analog search scope:** `IC Podcast Recorder.html` (sole existing asset; greenfield project)
**Files scanned:** 1 (HTML prototype)
**Pattern extraction date:** 2026-05-21
**HTML line count:** 977
**Sections read:** lines 1–977 (full file, one pass)
