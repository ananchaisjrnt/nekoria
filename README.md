# Nekoria

Cute Fantasy 3D Web MMORPG featuring anthropomorphic cat adventurers.

## Current milestone

Paw Meadow Combat Prototype v0.4: a 160×136 layered Babylon.js field, elevated 3/4 MMORPG camera, desktop/mobile movement, lock target, server-authoritative basic attacks, monster retaliation, EXP, Level Up, and Status Points.

Click or tap walkable ground to move there, or use the on-screen joystick on desktop/mobile. Click or tap a Green Slime to lock it as the current target. Drag the world to rotate the camera and use the mouse wheel or pinch gesture to zoom.

Combat, skills, and Auto Battle remain intentionally disabled until their individual test milestones. Lock Target is visual-only in v0.3: it does not move, attack, or damage the target.

## Requirements

- Node.js 22+
- pnpm 11+

## Setup

```bash
pnpm install
cp .env.example .env
pnpm dev
```

- Web: `http://localhost:5173`
- Server health: `http://localhost:3001/health`

Run only the visual prototype with `pnpm dev:web`.

## Mobile testing

The web app is deployed as the `nekoria-web` Render Static Site. Open its public `onrender.com` URL in a mobile browser; no installation is required. Render automatically deploys new commits from the connected branch.

## Validation

```bash
pnpm typecheck
pnpm build
pnpm test
```

## Structure

- `apps/web`: React UI and Babylon.js rendering
- `apps/server`: NestJS authoritative server foundation
- `packages/game-core`: game definitions and formulas
- `packages/protocol`: client/server message contracts
- `packages/shared`: generic shared types and utilities
- `docs`: design source of truth and approved references
test add
