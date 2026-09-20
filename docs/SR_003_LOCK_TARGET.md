# NEKORIA — SR-003 LOCK TARGET

Status: Ready for implementation

SR owner: Sol

Target implementer: Terra

Acceptance owner: User

Depends on: Accepted Movement Prototype v0.2

## 1. Objective

Add the first isolated targeting system to Paw Meadow. A player must be able to select a Green Slime on desktop or mobile and clearly see which monster is locked.

This milestone ends at target selection and presentation. It does not include approaching the target, attacking, damage, HIT, MISS, CRIT, death, EXP, loot, or Auto Battle.

## 2. Required reading

Before implementation, read completely:

1. `AGENTS.md`
2. `docs/GAME_DESIGN.md`
3. `docs/ART_DIRECTION.md`
4. `docs/SR_HANDOFF.md`
5. `docs/KANBAN.md`
6. this SR

Use approved references in `docs/references/` for presentation direction.

## 3. Functional requirements

### 3.1 Select target

- Clicking or tapping any visible part of a Green Slime selects that slime.
- Every slime must have a stable entity ID independent of its rendered child meshes.
- Selecting another slime replaces the current target.
- Selecting a slime must not also issue a ground-movement command.
- Camera drag/rotation must not accidentally select a slime.
- UI touches must not pass through and select or move in the 3D world.

### 3.2 Clear target

- Clicking or tapping valid ground clears the current target and retains the existing click/tap-to-move behavior.
- `Escape` clears the target on desktop.
- The target panel must provide a touch-friendly close button for mobile.
- Clearing a target removes every target-only visual immediately.

### 3.3 World indicator

- Show one clear selection ring beneath the selected monster.
- The ring follows the selected monster and remains visible from the normal 3/4 camera.
- Use the approved cute-fantasy UI/VFX language: warm gold or cream with a restrained glow/pulse.
- Do not use a screen-filling effect or obscure the slime.
- Only one target indicator may exist at a time.

### 3.4 Target HUD

When a target is selected, display a responsive target panel containing:

- `Green Slime`
- `Lv. 1`
- HP bar
- current/max HP text
- close/cancel control

For this milestone HP is read-only and remains full. Use the configured Green Slime maximum HP if a definition already exists; otherwise add one minimal data-driven monster definition in the appropriate game-data package rather than scattering values through React and scene code.

The panel should appear near the upper center, below or between existing corner HUD cards, without covering the player or central combat area on mobile.

### 3.5 Target state boundary

- Target state must not be owned by per-frame React state.
- Babylon/entity interaction resolves the selected entity ID.
- React may own the low-frequency HUD representation of the current target.
- Rendering code must not be the source of monster gameplay identity or stats.
- Add or extend a `TARGET` intent payload in `packages/protocol` so later server validation can use a stable entity ID.
- Do not claim that target selection is server-authoritative in this milestone if no server round trip is implemented.

## 4. Input precedence

Input resolution must follow this order:

1. HUD or joystick input consumes the interaction.
2. A short tap/click on a monster selects it.
3. A short tap/click on walkable ground clears the target and moves there.
4. A drag rotates the camera and performs neither selection nor movement.

Do not break the accepted joystick direction or movement behavior.

## 5. Visual and mobile requirements

- Minimum touch target for the close control: approximately 44 × 44 CSS pixels.
- Target panel must fit a narrow portrait mobile viewport without colliding with the top-left brand and top-right map card.
- Text and HP bar must remain legible over bright grass and sky.
- Avoid generic Bootstrap styling, sci-fi HUD styling, or excessive ornate framing.
- Maintain smooth rendering; do not use React updates inside the Babylon render loop.

## 6. Out of scope

Do not implement:

- Basic Attack or an enabled ATK button
- automatic approach or attack range
- server damage/combat simulation
- changing monster HP
- HIT, MISS, CRIT, death, respawn, EXP, or loot
- skills or Auto Battle
- login or character creation
- unrelated visual redesign or bundle optimization

Disabled skill, ATK, and AUTO controls must remain disabled.

## 7. Manual acceptance test

Test on desktop and a real mobile browser using the Render deployment:

1. Select each Green Slime by clicking/tapping its body.
2. Confirm the correct slime alone receives the target ring.
3. Confirm the target panel shows Green Slime, Lv. 1, and full HP.
4. Select a second slime and confirm target replacement without duplicate rings.
5. Drag to rotate the camera and confirm no accidental selection or movement.
6. Click/tap ground and confirm the target clears while the cat moves normally.
7. Clear with `Escape` on desktop.
8. Clear with the panel close control on mobile.
9. Use the joystick after selecting a target and confirm movement remains correct.
10. Confirm ATK, skills, and AUTO remain disabled.
11. Rotate/resize the device and confirm the target HUD remains usable.

## 8. Required validation

Before handoff, run:

```bash
pnpm install --frozen-lockfile
pnpm typecheck
pnpm test
pnpm build
```

Fix all errors. The known Babylon.js bundle-size warning remains non-blocking.

## 9. Handoff requirements

Terra must report:

- files changed
- targeting/input architecture used
- manual behaviors verified locally
- validation command results
- remaining limitations
- commit SHA and push/deployment status

After handoff, stop. Do not begin Basic Attack. The user must test the deployed Lock Target build before Sol issues the next SR.
