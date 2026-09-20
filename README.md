# Nekoria

Cute Fantasy 3D Web MMORPG featuring anthropomorphic cat adventurers.

## Current milestone

Paw Meadow Visual Prototype v0.1: Babylon.js scene, elevated 3/4 MMORPG camera, placeholder Adventurer cat, Green Slimes, Giant Tree landmark, minimal HUD, and a responsive desktop/mobile control shell.

Gameplay controls are displayed but intentionally become functional one tested system at a time, beginning with movement.

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
