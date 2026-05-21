# IC Podcast Recorder

## What This Is

A simple web platform where two podcasters log in, join a shared room, talk to each other through the app (live audio via WebRTC), press a single red button to start recording, and after the session ends download one mixed MP3 file. No external equipment, no separate calls on Discord/Zoom, no post-session file merging.

## Core Value

Two people talk and hear each other in-app, press one button to record, get one mixed file. That's it.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Two users can create accounts and log in
- [ ] Two users join a shared room and hear each other live (WebRTC)
- [ ] Single red record button starts recording for both sides with 3-second countdown
- [ ] Each browser records locally via MediaRecorder (better quality, no network loss)
- [ ] When either user stops recording, both browser recordings upload to server
- [ ] Server mixes both uploaded tracks into one MP3 via FFmpeg
- [ ] Both users can see and download the mixed recording file
- [ ] Audio quality is clear enough for post-production editing (192kbps MP3)

### Out of Scope

- Multi-room support — only two founders, no scale needed initially
- Video — audio only
- Mobile app — web only
- TURN server — defer to post-launch if both users on typical home networks
- Real-time server-side recording — local browser recording is simpler and higher quality
- Go/pion/webrtc backend — WebRTC is peer-to-peer, Next.js only does signaling

## Context

Original design called for Go backend with pion/webrtc receiving SRTP and piping PCM to FFmpeg live. This was overkill for a 2-person, 2-week project. Simplified to: Next.js only (API routes + SPA), browser-to-browser WebRTC for live audio, local MediaRecorder recording per browser, server-side FFmpeg mix (one-shot command) on upload.

Prior tech decisions doc exists at docs/DESIGN.md (superseded by this project scope).

## Constraints

- **Tech stack**: Next.js only (API routes + SPA), no Go, no separate backend
- **Timeline**: 2 weeks
- **Users**: 2 max, single hardcoded room
- **Audio quality**: 192kbps MP3 or better
- **Storage**: Local filesystem (`./recordings/`)
- **Database**: SQLite with simple auth (bcrypt + cookie sessions)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Next.js only (no Go backend) | KISS, DRY, YAGNI. API routes handle auth, signaling, file serving. One runtime. | ✓ Good |
| Browser-to-browser WebRTC (p2p) | No server-side media relay needed for 2 users. Eliminates pion, SRTP handling, live FFmpeg pipeline. | ✓ Good |
| Local MediaRecorder per browser | Higher quality (direct mic capture, no network loss), simpler (no live PCM piping), no server resource cost during call. | ✓ Good |
| Server-side FFmpeg mix (one-shot) | One FFmpeg command after uploads, not a live pipeline. Simple, proven, reliable. | ✓ Good |
| WebSocket signaling in Next.js | Single WS endpoint in a Next.js API route. Passes SDP/ICE between peers. No gorilla/ws dependency needed — use native `ws` or Next.js route. | — Pending |
| Single hardcoded room | No room management complexity. Two users, one room. | ✓ Good |

---
*Last updated: 2026-05-21 after initialization*

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state
