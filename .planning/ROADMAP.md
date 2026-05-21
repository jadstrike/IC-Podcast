# ROADMAP: IC Podcast Recorder

**Created:** 2026-05-21
**Mode:** mvp
**Phases:** 4 | **Requirements:** 19 mapped | All v1 requirements covered

| # | Phase | Goal | Requirements | Success Criteria |
|---|-------|------|--------------|------------------|
| 1 | UI Development | App shell, layout, base styling, and component system | UI-ROUTING, UI-LOGIN, UI-REGISTER, UI-LOBBY, UI-ROOM, UI-STATEMACHINE, UI-DOWNLOAD | All four routes (`/login`, `/lobby`, `/room`, `/download`) render with full HTML-prototype parity; client-side validation works; room state machine cycles all six states |
| 2 | Auth & Foundation | Users can register, log in, and access protected pages | AUTH-01, AUTH-02, AUTH-03, AUTH-04 | 2 accounts exist, login works, session persists |
| 3 | Room & WebRTC | Two users join room, hear each other live | ROOM-01, ROOM-02, ROOM-03, WEBRTC-01, WEBRTC-02 | Both users in room, audio flows both ways, <500ms latency |
| 4 | Recording & Download | Record button, local recording, upload, server mix, download | REC-01 through REC-08, DL-01, DL-02 | Red button works, countdown, both record, upload, mix produces one MP3, download works |

---

### Phase 1: UI Development

**Goal:** As a podcast host, I want a fully styled Next.js app where I can sign in, see a lobby, enter a room with a working record/countdown/timer state machine, and view a post-session download list, so that all UI surface is locked in before auth, WebRTC, and recording are wired up.

**Mode:** mvp

**Plans:** 4 plans
- [ ] 01-01-PLAN.md — Walking Skeleton: Next.js scaffold, design tokens, root layout + topbar, all four route shells, minimal LoginView with router.push('/lobby')
- [ ] 01-02-PLAN.md — UI primitives (Button, Field, Avatar), full LoginView (tabs + register with validation), full LobbyView with seats and navigation to /room
- [ ] 01-03-PLAN.md — RoomView with full six-state machine, RecordButton, MicVisualizer, timer, countdown overlay
- [ ] 01-04-PLAN.md — DownloadView with placeholder session list and New Session navigation

**Success Criteria:**
1. `/` redirects to `/login`; topbar renders on every page with brand text "IC Podcast Recorder"
2. Sign in and Create account forms validate client-side and navigate to `/lobby` on success
3. Lobby shows two seats (one filled, one waiting with dashed empty avatar) and a working "Both joined" button
4. Room enters countdown -> recording -> uploading -> mixing -> ready states with correct CSS classes applied
5. Download page lists four placeholder sessions and a "+ New session" action returning to lobby
6. `npm run build` and `npm run test:ci` succeed

---

### Phase 2: Auth & Foundation

**Goal:** Users can create accounts, log in, and access protected pages. SQLite database, bcrypt auth, cookie sessions.

**Mode:** mvp

**Success Criteria:**
1. User visits `/`, sees login or room (redirect)
2. User can create account with username + password (first two only)
3. Logged-in user persists session across browser refresh
4. Third user attempting signup sees "Registration closed"

**Files to create:**
- `package.json` — Next.js project setup
- `app/layout.tsx` — Root layout
- `app/(auth)/login/page.tsx` — Login page
- `app/(auth)/register/page.tsx` — Registration page
- `app/(auth)/actions.ts` — Server actions for login/register
- `lib/db.ts` — SQLite initialization and queries
- `lib/session.ts` — Cookie session management (set/get/delete)
- `lib/auth.ts` — Password hashing and verification utilities
- `middleware.ts` — Route protection (redirect unauthenticated to /login)

---

### Phase 3: Room & WebRTC

**Goal:** Two logged-in users join a shared room, see connection status, and hear each other live via peer-to-peer WebRTC audio.

**Mode:** mvp

**Success Criteria:**
1. Both users navigate to `/room`, see "Waiting for other user..." then "Connected"
2. When both connected, both hear each other with minimal delay
3. Third user navigating to `/room` sees "Room full — only 2 spots"
4. User disconnecting updates room status for other user

**Files to create:**
- `app/api/ws/route.ts` — WebSocket signaling endpoint (SDP/ICE exchange)
- `app/(room)/room/page.tsx` — Room page with WebRTC connection UI
- `app/(room)/room/use-webrtc.ts` — WebRTC hook (peer connection, media stream)
- `app/(room)/room/use-signaling.ts` — WebSocket signaling hook (send/receive SDP, ICE)
- `lib/room.ts` — Room state (who's connected, third-user rejection)
- `types/webrtc.ts` — WebSocket message types for signaling protocol

**Signaling protocol:**
```
// Client → Server (WebSocket messages)
{ type: "join" }                              — User joins room, server assigns role (offerer/answerer)
{ type: "sdp", sdp: {...} }                   — SDP offer or answer
{ type: "ice", candidate: {...} }             — ICE candidate

// Server → Client (WebSocket messages)
{ type: "joined", role: "offerer" | "answerer", peerCount: 1|2 }
{ type: "room_full" }                          — Third user rejected
{ type: "sdp", sdp: {...} }                   — Forward SDP to peer
{ type: "ice", candidate: {...} }             — Forward ICE to peer
{ type: "peer_left" }                         — Peer disconnected notification
```

---

### Phase 4: Recording & Download

**Goal:** Single red record button starts synchronized local recording on both browsers. Stop triggers upload, server mixes into one MP3, both can download.

**Mode:** mvp

**Success Criteria:**
1. Both users see red record button, one presses it
2. 3-second countdown displays, then recording starts on both browsers
3. Either user pressing "Stop" ends recording for both
4. Both recordings upload, server mixes, single MP3 appears on download page
5. Both users can download the mixed file

**Files to create:**
- `app/(room)/room/use-recorder.ts` — MediaRecorder hook (start/stop/local blob)
- `app/(room)/room/record-button.tsx` — Red button + countdown component
- `app/api/upload/route.ts` — Receive uploaded recording blobs
- `app/api/mix/route.ts` — Trigger FFmpeg mix of two uploads
- `app/(download)/download/page.tsx` — Download page with recording list
- `lib/recordings.ts` — Recording metadata storage and file serving
- `lib/ffmpeg.ts` — FFmpeg spawn utility (mix two audio files into one MP3)

**Recording flow:**
1. User A presses record → WS message to User B
2. Both start `MediaRecorder` simultaneously (3-second countdown)
3. User A or B presses stop → WS message to other user
4. Both stop `MediaRecorder`, get final blobs
5. Both blobs uploaded to `/api/upload` (via `FormData`)
6. Server spawns FFmpeg: `ffmpeg -i track-a.webm -i track-b.webm -filter_complex amix=inputs=2:duration=longest -b:a 192k output.mp3`
7. Final MP3 saved to `./recordings/session-{timestamp}.mp3`
8. Download page updated, both users can download

---

*Last updated: 2026-05-21 — Phase 1 plans finalized*
