# NEKORIA — DEVELOPMENT KANBAN

Last updated: 2026-09-20

Workflow owner: Sol

Implementer: Terra

Acceptance owner: User

## Board rules

- Sol creates the SR and moves one card to **Ready**.
- Terra moves that card to **In Progress** when implementation begins.
- Terra moves it to **User Testing** only after validation, commit, push, and deployment handoff.
- The user tests the deployed build.
- After user acceptance, Sol moves the card to **Done** and may issue the next SR.
- Terra must not start a Backlog or Blocked card without an issued SR from Sol.
- Each completed card records its acceptance status and relevant commit.

## Ready

No card ready for implementation.

## In Progress

No active card.

## User Testing

### NK-006 / NK-007 / NK-008 — Map, Combat, Progression

- Status: Awaiting combined deployed-build acceptance
- Scope: 4× map area, authoritative combat results, monster engagement, EXP/Level/Status Points

## Done

### NK-005 — Basic Attack and Auto Approach

- Status: Accepted by user
- Commit: `f265d4c`

### NK-004 — Monster Roaming

- Status: Accepted by user
- Completed: 2026-09-20
- Features: locally simulated peaceful roaming, spawn leash, per-entity movement variation, selected-target tracking
- Commit: `e948f03`

### NK-003 — Lock Target

- Status: Accepted by user
- Completed: 2026-09-20
- Features: stable monster IDs, click/tap selection, target ring, responsive target HUD, clear/switch target
- Commit: `62601fb`

### NK-002 — Player Movement v0.2

- Status: Accepted by user
- Completed: 2026-09-20
- Features: click/tap-to-move, mobile joystick, camera-relative movement, smooth turning and camera follow
- Follow-up fix: corrected reversed horizontal joystick direction
- Commits: `44da50c`, `777e04e`

### NK-001 — Paw Meadow Visual Prototype v0.1

- Status: Completed
- Completed: 2026-09-20
- Features: pnpm monorepo, Babylon.js Paw Meadow, 3/4 camera, placeholder Adventurer, Green Slimes, Giant Tree, responsive HUD, Render Blueprint
- Deployment fix: removed `corepack enable` from Render build commands and pinned Node.js
- Commits: `5a6fdd0`, `29e1bf3`

### NK-000 — Design and Art Direction

- Status: Locked source of truth established
- Documents: `docs/GAME_DESIGN.md`, `docs/ART_DIRECTION.md`, `AGENTS.md`
- References: `docs/references/`

## Backlog — ordered vertical slice

These cards are not authorized for implementation until Sol issues an SR.

1. NK-009 — Ground Loot, walk-to-loot, pickup and Weight
2. NK-010 — Minimal Auto Battle using the shared authoritative pathway
3. NK-011 — Return Bell

## Blocked / Later

Do not begin these systems during the current vertical slice unless Sol explicitly changes the priority:

- Login and Account persistence
- Character Creation
- Class 2 and Job Change
- Party and Guild
- Market and player trade
- Refine gameplay
- Soul upgrades
- Dungeons and Bosses
- PvP

## Update log

| Date | Card | Change | Owner | Commit |
|---|---|---|---|---|
| 2026-09-20 | NK-007 | Fixed elevation targeting and isolated monster HP per WebSocket session | Sol / Terra | pending push |
| 2026-09-20 | NK-006 | Expanded Paw Meadow to 500×500 and increased visible elevation layers | Sol / Terra | pending push |
| 2026-09-20 | NK-007 | Dispose dead monster entities and remove their controllers after death animation | Sol / Terra | pending push |
| 2026-09-20 | NK-006 | Expanded field to 160×136 with layered terrain and blocking rock ridges | Sol / Terra | pending push |
| 2026-09-20 | NK-007 | Prevented mobile proximity targeting from relocking dead monsters | Sol / Terra | pending push |
| 2026-09-20 | NK-007 | Added Green Slime death animation before despawn | Sol / Terra | pending push |
| 2026-09-20 | NK-007 | Fixed stale target and attack animation after monster death | Sol / Terra | pending push |
| 2026-09-20 | NK-007 | Fixed Render internal-host WebSocket URL used by browser clients | Sol / Terra | pending push |
| 2026-09-20 | NK-006/007/008 | 4× map, authoritative combat, monster retaliation, and progression moved to User Testing | Sol / Terra | pending push |
| 2026-09-20 | NK-005 | SR unblocked; moved to Ready | Sol | pending push |
| 2026-09-20 | NK-004 | User accepted Monster Roaming; moved to Done | User / Sol | `e948f03` |
| 2026-09-20 | NK-004 | Implemented; moved to User Testing | Terra | `e948f03` |
| 2026-09-20 | NK-005 | SR written; queued behind NK-004 | Sol | `d7d91a7` |
| 2026-09-20 | NK-004 | SR issued; moved to Ready | Sol | `d7d91a7` |
| 2026-09-20 | NK-003 | User accepted Lock Target; moved to Done | User / Sol | `62601fb` |
| 2026-09-20 | NK-003 | Implemented; moved to User Testing | Terra | `62601fb` |
| 2026-09-20 | NK-003 | SR issued; moved to Ready | Sol | `5212705` |
| 2026-09-20 | NK-002 | Movement accepted after joystick-axis fix | User / Sol | `777e04e` |
| 2026-09-20 | NK-002 | Movement v0.2 implemented | Sol | `44da50c` |
| 2026-09-20 | NK-001 | Render build command fixed | Sol | `29e1bf3` |
| 2026-09-20 | NK-001 | Prototype and Render bootstrap completed | Sol | `5a6fdd0` |
