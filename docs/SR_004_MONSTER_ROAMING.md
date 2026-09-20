# NEKORIA — SR-004 MONSTER ROAMING

Status: Ready for implementation

SR owner: Sol

Target implementer: Terra

Acceptance owner: User

Depends on: Accepted SR-003 Lock Target

## 1. Objective

Make Green Slimes move naturally around their spawn areas so Paw Meadow feels alive, while preserving movement, camera, and Lock Target behavior.

This milestone covers peaceful idle roaming only. It does not include aggro, chasing, attacking, damage, combat AI, death, respawn, or pathfinding around complex obstacles.

## 2. Required reading

Before implementation, read completely:

1. `AGENTS.md`
2. `docs/GAME_DESIGN.md`
3. `docs/ART_DIRECTION.md`
4. `docs/SR_HANDOFF.md`
5. `docs/KANBAN.md`
6. this SR

## 3. Functional requirements

### 3.1 Spawn origin and leash

- Every monster entity stores an immutable spawn origin.
- Every Green Slime has a configurable roam radius; use approximately 3–5 world meters for the prototype.
- A roam destination must remain inside the map and inside the monster's leash circle.
- A slime must not drift permanently away from its spawn area.

### 3.2 Roaming loop

Each slime repeats this peaceful loop:

1. idle for a randomized duration
2. choose a valid random point within its roam radius
3. turn smoothly toward the destination
4. move there at a slow slime-appropriate speed
5. stop and idle again

Recommended prototype ranges are configurable rather than scattered constants:

- idle: approximately 1.5–4 seconds
- move speed: approximately 0.8–1.3 meters/second
- roam radius: approximately 3–5 meters
- arrival tolerance: approximately 0.1–0.25 meters

Use deterministic per-entity variation or a controlled random source so all slimes do not move and stop in perfect synchronization.

### 3.3 Visual movement

- Slimes turn smoothly; no instant rotation snapping.
- Retain the existing soft idle bounce.
- During movement, add a restrained squash/bob impression if practical without creating a new production animation system.
- A selected slime's target ring must remain attached while it moves.
- The target HUD must continue showing the same stable entity.

### 3.4 Gameplay boundaries

- Roaming must be managed outside React and outside React state.
- Keep monster simulation separate from mesh/model construction.
- Introduce a focused monster movement/roaming controller rather than expanding `PawMeadowScene` into a giant manager.
- Define a future-facing monster movement snapshot or intent contract only if needed; do not build WebSocket synchronization in this SR.
- Clearly document that prototype roaming is locally simulated and will move to the authoritative server before multiplayer combat.

### 3.5 Walkable area

For this placeholder map, a simple bounded roaming solution is acceptable.

- Slimes must remain on the visible meadow ground.
- Avoid placing roam destinations inside obvious Giant Tree geometry, large hills, or outside map bounds.
- Full navigation mesh and complex obstacle avoidance are out of scope.

## 4. Out of scope

Do not implement:

- aggro detection
- chasing or attacking the player
- retaliation
- combat damage or monster HP changes
- server-authoritative monster simulation
- navmesh/pathfinding system
- monster death or respawn
- Basic Attack, skills, or Auto Battle
- new monster species

ATK, skills, and AUTO remain disabled.

## 5. Manual acceptance test

Test on desktop and a real mobile browser:

1. Observe all Green Slimes for at least 30 seconds.
2. Confirm each alternates between idling and slow movement.
3. Confirm they do not move in perfect synchronization.
4. Confirm they stay near their individual spawn positions.
5. Select a moving slime and confirm its ring and HUD remain attached to the same entity.
6. Switch between moving slimes and confirm correct target replacement.
7. Confirm click/tap movement, joystick direction, camera rotation, zoom, and target clearing still work.
8. Confirm no slime attacks or chases the player.
9. Confirm ATK, skills, and AUTO remain disabled.
10. Confirm performance remains smooth on mobile.

## 6. Required validation

```bash
pnpm install --frozen-lockfile
pnpm typecheck
pnpm test
pnpm build
```

Fix all errors. The known Babylon.js bundle-size warning remains non-blocking.

## 7. Handoff

Terra must update `docs/KANBAN.md`, report the movement-controller boundary, files changed, validation results, limitations, commit SHA, and deployment status. Then stop for user testing. Do not begin SR-005.

