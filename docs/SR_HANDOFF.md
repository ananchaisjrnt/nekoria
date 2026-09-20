# NEKORIA — SYSTEM REQUIREMENTS HANDOFF

Status: Movement Prototype v0.2 accepted; SR-003 Lock Target issued

SR owner: Sol

Target implementer: Terra

Acceptance owner: User

Development method: Sol assigns one system, Terra implements it, and the user tests it before Sol assigns the next system.

## 0. Locked workflow

The development workflow is:

1. Sol defines and issues the SR, scope, constraints, and acceptance criteria.
2. Terra implements only the issued SR.
3. Terra validates the implementation and hands it back without selecting or beginning another system.
4. The user plays/tests the deployed build and decides whether it is accepted or needs revision.
5. After user acceptance, Sol defines the next SR.

Terra must not independently expand scope, redesign locked requirements, or begin a likely next milestone. Any ambiguity that could materially change behavior must be returned to Sol for a decision.

## 1. Required reading

Before changing gameplay or visuals, read completely:

1. `docs/GAME_DESIGN.md`
2. `docs/ART_DIRECTION.md`
3. `AGENTS.md`
4. `docs/KANBAN.md`

Approved visual references are in `docs/references/`. Do not substitute generic chibi, realistic fantasy, or generic mobile MMORPG styling.

## 2. Current build

The repository is a pnpm monorepo with:

- React + TypeScript + Babylon.js web client
- NestJS + TypeScript server foundation
- shared `game-core`, `protocol`, and `shared` packages
- Render Blueprint configuration for the web and server services

Paw Meadow currently contains:

- stylized placeholder terrain and daylight
- Giant Tree landmark
- placeholder Adventurer cat
- placeholder Green Slimes
- elevated ArcRotate MMORPG camera with rotation and zoom
- responsive desktop/mobile HUD
- click/tap-to-move
- functional virtual joystick
- smooth acceleration, deceleration, turning, and camera follow

## 3. Movement v0.2 requirements

Movement has two input methods that feed the same `PlayerMovementController`:

- Desktop/mobile: click or tap walkable ground to set a destination.
- Desktop/mobile: drag the virtual joystick for continuous camera-relative movement.

Required behavior:

- A short tap moves; dragging the scene rotates the camera and must not issue a move command.
- Joystick input cancels the current click/tap destination.
- The character turns smoothly toward movement direction.
- Movement accelerates and decelerates instead of snapping instantly.
- The camera target follows the character while preserving ArcRotate rotation and zoom.
- The player remains inside the prototype map bounds.
- Movement logic remains separate from rendering/model construction.

This is currently client-simulated for the visual movement milestone. `MoveIntentPayload` exists in `packages/protocol` so server validation can replace the local authority later.

## 4. Manual test checklist

Test the deployed Render URL on both desktop and a real mobile browser:

1. Paw Meadow loads without a blank screen.
2. Tap/click multiple ground positions; the cat approaches each position and stops.
3. Drag the scene; the camera rotates without moving the cat.
4. Zoom using wheel on desktop and pinch on mobile.
5. Hold the joystick in all directions; movement follows camera orientation.
6. Release the joystick; the cat decelerates and stops.
7. Rotate the camera, then repeat the joystick test.
8. Resize or rotate the device; the canvas and controls remain usable.
9. Confirm disabled combat, skill, and Auto buttons do nothing.

## 5. Validation commands

Run before every handoff:

```bash
pnpm install --frozen-lockfile
pnpm typecheck
pnpm test
pnpm build
```

The current build emits a Babylon.js bundle-size warning. It is non-blocking for this prototype; do not perform unrelated optimization during a gameplay-system milestone.

## 6. Constraints for the next implementer

- Do not implement Login or Character Creation yet unless explicitly requested.
- Do not implement Class 2, Refine, Market, Soul Upgrade, PvP, or unrelated future systems.
- Do not begin the next gameplay system until Movement v0.2 has been tested and accepted.
- Keep mobile as a first-class input target.
- Preserve useful existing code and approved visual direction.
- Keep the server authoritative for future gameplay. The client sends intents and never decides combat results.
- Manual and Auto Battle must eventually use the same authoritative gameplay pathway.

## 7. Active system

Movement v0.2 was accepted by the user. Sol has issued `docs/SR_003_LOCK_TARGET.md` for Terra.

Terra may implement only SR-003. Basic Attack remains blocked until the user tests and accepts the deployed Lock Target build and Sol issues another SR.
