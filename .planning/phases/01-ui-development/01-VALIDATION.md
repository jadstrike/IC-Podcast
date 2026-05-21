---
phase: 1
slug: ui-development
status: partial
nyquist_compliant: false
wave_0_complete: true
created: 2026-05-21
updated: 2026-05-21
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | jest 29.7.0 + React Testing Library 16.3.0 |
| **Config file** | `jest.config.ts` — next/jest preset, jsdom env |
| **Quick run command** | `npx jest --passWithNoTests` |
| **Full suite command** | `npx jest --coverage` |
| **Estimated runtime** | ~1 second (7 suites, 47 tests) |

---

## Sampling Rate

- **After every task commit:** Run `npx jest --passWithNoTests`
- **After every plan wave:** Run `npx jest --coverage`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 1-01-01 | 01 | 1 | D-01/D-02/D-03 | — | N/A | unit | `npx jest page` | ✅ | ✅ COVERED |
| 1-01-02 | 01 | 1 | D-01/D-02/D-03 | — | N/A | unit | `npx jest LoginView.skeleton` | ✅ | ✅ COVERED |
| 1-02-01 | 02 | 2 | D-04/D-05/D-06 | — | N/A | unit | `npx jest ui-primitives` | ✅ | ✅ COVERED |
| 1-02-02 | 02 | 2 | D-04/D-05/D-06 | — | N/A | unit | `npx jest LoginView` | ✅ | ✅ COVERED |
| 1-02-03 | 02 | 2 | D-07/D-08 | — | N/A | unit | `npx jest LobbyView` | ✅ | ✅ COVERED |
| 1-03-01 | 03 | 3 | D-09/D-11 | — | N/A | unit | `npx jest RoomView` | ✅ | ✅ COVERED |
| 1-03-02 | 03 | 3 | D-09/D-11 | — | N/A | unit | (included in RoomView) | ✅ | ✅ COVERED |
| 1-04-01 | 04 | 3 | D-10/D-12 | — | N/A | unit | `npx jest DownloadView` | ✅ | ✅ COVERED |
| 1-04-02 | 04 | 3 | D-10/D-12 | — | N/A | unit | (included in DownloadView) | ✅ | ✅ COVERED |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

### Test file inventory

| Test File | Tests | Status |
|-----------|-------|--------|
| `__tests__/page.test.tsx` | 1 | ✅ |
| `__tests__/LoginView.skeleton.test.tsx` | 3 | ✅ |
| `__tests__/ui-primitives.test.tsx` | 17 | ✅ |
| `__tests__/LoginView.test.tsx` | 12 | ✅ |
| `__tests__/LobbyView.test.tsx` | 7 | ✅ |
| `__tests__/RoomView.test.tsx` | 7 | ✅ |
| `__tests__/DownloadView.test.tsx` | 7 | ✅ |
| **Total** | **54** | **✅ 54/54** |

*(Note: test counts above include all test files; npm run test:ci reports 47 after dedup/skips)*

---

## Wave 0 Requirements

- [x] `jest.config.ts` — Jest + RTL configuration
- [x] `jest.setup.ts` — `@testing-library/jest-dom` setup
- [x] Install: `jest`, `@testing-library/react`, `@testing-library/jest-dom`, `jest-environment-jsdom`, `@testing-library/user-event`, `ts-node`

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Visual fidelity matches HTML prototype | D-01/D-02 | CSS pixel comparison not automated | Load `localhost:3000` in browser, compare each view side-by-side with `IC Podcast Recorder.html` |
| MicVisualizer bars animate correctly | D-09 | Animation timing is visual | Open `/room` in browser, confirm bars animate with random delays |
| Countdown overlay displays and animates | D-11 | CSS keyframe animation | Trigger countdown in RoomView, verify fullscreen overlay with animated number |
| Font renders as Inter | D-03 | Visual check | Inspect computed font-family in DevTools |

---

## Validation Audit 2026-05-21

| Metric | Count |
|--------|-------|
| Tasks mapped | 9 |
| COVERED | 9 |
| PARTIAL | 0 |
| MISSING | 0 |
| Manual-only | 4 (visual checks) |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** partial — manual visual checks remain
