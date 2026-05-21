---
phase: 1
slug: ui-development
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-21
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | jest 29.x + React Testing Library |
| **Config file** | `jest.config.ts` — Wave 0 installs |
| **Quick run command** | `npx jest --passWithNoTests` |
| **Full suite command** | `npx jest --coverage` |
| **Estimated runtime** | ~15 seconds |

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
| 1-01-01 | 01 | 0 | D-01/D-02/D-03 | — | N/A | setup | `npx jest --passWithNoTests` | ❌ W0 | ⬜ pending |
| 1-02-01 | 02 | 1 | D-04/D-05/D-06 | — | N/A | unit | `npx jest src/components/` | ❌ W0 | ⬜ pending |
| 1-03-01 | 03 | 1 | D-07/D-08 | — | N/A | unit | `npx jest src/components/ui/` | ❌ W0 | ⬜ pending |
| 1-04-01 | 04 | 2 | D-09/D-11 | — | N/A | unit | `npx jest RoomView` | ❌ W0 | ⬜ pending |
| 1-05-01 | 05 | 2 | D-10/D-12 | — | N/A | unit | `npx jest LoginView` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `jest.config.ts` — Jest + RTL configuration
- [ ] `jest.setup.ts` — `@testing-library/jest-dom` setup
- [ ] Install: `jest`, `@testing-library/react`, `@testing-library/jest-dom`, `jest-environment-jsdom`

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Visual fidelity matches HTML prototype | D-01/D-02 | CSS pixel comparison not automated | Load `localhost:3000` in browser, compare each view side-by-side with `IC Podcast Recorder.html` |
| MicVisualizer bars animate correctly | D-09 | Animation timing is visual | Open `/room` in browser, confirm bars animate with random delays |
| Countdown overlay displays and animates | D-11 | CSS keyframe animation | Trigger countdown in RoomView, verify fullscreen overlay with animated number |
| Font renders as Inter | D-03 | Visual check | Inspect computed font-family in DevTools |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
