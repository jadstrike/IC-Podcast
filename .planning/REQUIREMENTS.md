# Requirements: IC Podcast Recorder

**Defined:** 2026-05-21
**Core Value:** Two people talk and hear each other in-app, press one button to record, get one mixed file. That's it.

## v1 Requirements

### Authentication

- [ ] **AUTH-01**: User can create account with username and password
- [ ] **AUTH-02**: User can log in with username and password
- [ ] **AUTH-03**: User session persists across browser refresh
- [ ] **AUTH-04**: Only two accounts can exist (no open registration after 2 users)

### Room & WebRTC

- [ ] **ROOM-01**: Logged-in user can join the shared room
- [ ] **ROOM-02**: Second user joining shows room status (who's connected)
- [ ] **ROOM-03**: Third user sees "Room full" message
- [ ] **WEBRTC-01**: Two users hear each other with minimal latency (<500ms)
- [ ] **WEBRTC-02**: Audio is clear enough for conversation (192kbps+ quality)

### Recording

- [ ] **REC-01**: Single red record button visible to both users
- [ ] **REC-02**: Pressing record starts a 3-second countdown (visual)
- [ ] **REC-03**: Countdown starts recording for both sides simultaneously
- [ ] **REC-04**: Each browser records locally via MediaRecorder (no server relay)
- [ ] **REC-05**: Either user pressing "Stop" ends recording for both
- [ ] **REC-06**: Both browser recordings upload to server when recording stops
- [ ] **REC-07**: Server mixes both uploaded tracks into one MP3 via FFmpeg
- [ ] **REC-08**: Final mixed file is saved as MP3 192kbps

### Download

- [ ] **DL-01**: Both users can see list of completed recordings
- [ ] **DL-02**: Both users can download any completed recording file

## v2 Requirements

(None yet)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Video | Audio-only podcast |
| Multi-room | Two founders only, no scale needed |
| Mobile app | Web-first |
| TURN server | Defer if both users on typical home networks |
| Server-side live recording | Browser recording is simpler, higher quality |
| Go/pion/webrtc backend | WebRTC is p2p, Next.js only does signaling |
| OAuth / social login | Simple username/password sufficient for 2 users |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | Phase 1 | Pending |
| AUTH-02 | Phase 1 | Pending |
| AUTH-03 | Phase 1 | Pending |
| AUTH-04 | Phase 1 | Pending |
| ROOM-01 | Phase 2 | Pending |
| ROOM-02 | Phase 2 | Pending |
| ROOM-03 | Phase 2 | Pending |
| WEBRTC-01 | Phase 2 | Pending |
| WEBRTC-02 | Phase 2 | Pending |
| REC-01 | Phase 3 | Pending |
| REC-02 | Phase 3 | Pending |
| REC-03 | Phase 3 | Pending |
| REC-04 | Phase 3 | Pending |
| REC-05 | Phase 3 | Pending |
| REC-06 | Phase 3 | Pending |
| REC-07 | Phase 3 | Pending |
| REC-08 | Phase 3 | Pending |
| DL-01 | Phase 3 | Pending |
| DL-02 | Phase 3 | Pending |

**Coverage:**
- v1 requirements: 19 total
- Mapped to phases: 19
- Unmapped: 0 ✓

---
*Requirements defined: 2026-05-21*
*Last updated: 2026-05-21 after initial definition*
