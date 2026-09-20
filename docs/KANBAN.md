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

### NK-003 — Lock Target

- SR: `docs/SR_003_LOCK_TARGET.md`
- Owner: Terra
- Status: Ready for implementation
- Scope: select Green Slime, target ring, target HUD, clear/switch target
- Excludes: approach, attack, damage, HP changes, death, EXP, loot, Auto Battle
- Issued commit: `5212705`

## In Progress

No active card.

## User Testing

No card awaiting user testing.

## Done

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

1. NK-004 — Basic Attack and automatic approach
2. NK-005 — Server-authoritative HIT, MISS, CRIT, damage, ASPD, monster HP and death
3. NK-006 — EXP, Level Up and Status Points
4. NK-007 — Ground Loot, walk-to-loot, pickup and Weight
5. NK-008 — Minimal Auto Battle using the shared authoritative pathway
6. NK-009 — Return Bell

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
| 2026-09-20 | NK-003 | SR issued; moved to Ready | Sol | `5212705` |
| 2026-09-20 | NK-002 | Movement accepted after joystick-axis fix | User / Sol | `777e04e` |
| 2026-09-20 | NK-002 | Movement v0.2 implemented | Sol | `44da50c` |
| 2026-09-20 | NK-001 | Render build command fixed | Sol | `29e1bf3` |
| 2026-09-20 | NK-001 | Prototype and Render bootstrap completed | Sol | `5a6fdd0` |

