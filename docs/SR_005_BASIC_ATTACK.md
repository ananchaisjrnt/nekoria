# NEKORIA — SR-005 BASIC ATTACK AND AUTO APPROACH

Status: Ready for implementation

SR owner: Sol

Target implementer: Terra

Acceptance owner: User

Depends on: Accepted SR-003 Lock Target and accepted SR-004 Monster Roaming

## 1. Objective

Implement the Basic Attack command flow and platform-specific targeting controls:

- desktop players may press ATK or double-click a monster
- mobile players move with the virtual joystick, receive a nearby soft target, and press ATK themselves
- an attack command automatically approaches the locked target when out of range

This milestone proves command, approach, facing, and visible attack behavior. Authoritative HIT, MISS, CRIT, damage, monster HP reduction, death, and rewards belong to the following combat SR.

## 2. Required reading

Before implementation, read completely:

1. `AGENTS.md`
2. `docs/GAME_DESIGN.md`
3. `docs/ART_DIRECTION.md`
4. `docs/SR_HANDOFF.md`
5. `docs/KANBAN.md`
6. `docs/SR_004_MONSTER_ROAMING.md`
7. this SR

## 3. Platform controls

### 3.1 Desktop

- Single-click a monster: lock target only.
- Press the ATK button with a valid target: issue Basic Attack.
- Double-click the same monster: lock it and issue the same Basic Attack command.
- ATK and double-click must converge on one attack-command pathway.
- Clicking walkable ground cancels the current target and attack command, then performs normal movement.

### 3.2 Mobile

- Keep the virtual joystick as the primary movement control.
- While the player moves near monsters, softly lock the nearest eligible monster within a configurable radius; start with approximately 5 meters.
- Proximity lock never attacks automatically.
- The player must press ATK to issue Basic Attack.
- Tapping a monster remains available for explicit manual selection.
- Manual selection has priority and must not be replaced by proximity lock while valid.
- Do not require double-tap on mobile.

### 3.3 Proximity target stability

- Auto-lock only when there is no valid target.
- Do not continuously switch between similarly distant monsters.
- Track whether the current target came from manual selection or proximity selection.
- A proximity-selected target may clear after exceeding a configurable release radius; start near 8 meters.
- A manually selected target follows existing explicit clear/cancel rules and is not discarded merely because another monster becomes closer.
- Walking near a monster never starts combat.

Detect mobile/coarse-pointer behavior through browser capabilities or responsive input mode, not fragile user-agent matching.

## 4. Attack command state

Use one focused command/state pathway shared by ATK and desktop double-click:

```text
IDLE
→ ATTACK_REQUESTED
→ APPROACHING (only if out of range)
→ ATTACKING
→ IDLE / repeat-ready
```

Required behavior:

- No target: ATK does nothing except optional restrained UI feedback.
- Target out of range: move toward the target until attack range is reached.
- Target in range: stop movement, face the target, and perform the placeholder Basic Attack animation.
- Approach must follow a roaming target's current position rather than its old position.
- Manual joystick or ground movement cancels the active approach/attack command.
- Clearing or changing target cancels the old command safely.
- Never teleport or snap the player into range.

Use a configurable prototype melee range around 2 meters. Do not encode future bow range in UI or scene code; the architecture should accept a range value later.

## 5. Visual attack

- Enable the ATK button on desktop and mobile.
- Provide clear pressed/active feedback.
- Use a simple placeholder attack motion suitable for the current cat model.
- The player must visibly face the target before the strike.
- Do not show damage numbers, HIT, MISS, CRIT, HP loss, death, or loot.
- Monster retaliation is out of scope.

The visual attack may use provisional local timing only for this milestone. Do not present it as authoritative combat; the next SR moves validation and results to server time.

## 6. Architecture and protocol

- ATK button and double-click must produce the same `ATTACK` intent shape.
- Extend `packages/protocol` with a typed attack payload referencing the stable target entity ID and a monotonically increasing sequence/request value.
- Do not create separate desktop, mobile, manual, or future Auto damage functions.
- Separate command/control logic from Babylon model rendering and React HUD.
- React must not own the per-frame approach or attack loop.
- Preserve the future pathway in which manual input and Auto Battle both call the same authoritative combat service.

## 7. Out of scope

Do not implement:

- HIT, MISS, CRIT, damage, DEF, or HP reduction
- server-authoritative attack timing
- ASPD balancing or continuous damage loop
- monster death, EXP, drops, or respawn
- skills
- monster retaliation or aggro
- Auto Battle
- login or persistence

## 8. Manual acceptance test

Test on desktop and a real mobile browser:

1. Desktop single-click locks without attacking.
2. Desktop ATK approaches a distant target and performs the placeholder strike in range.
3. Desktop double-click performs the same command behavior.
4. Mobile joystick movement near a slime softly locks it without attacking.
5. Mobile ATK approaches if necessary and strikes only after reaching range.
6. A manual mobile target is not replaced by a nearer slime.
7. Proximity lock does not flicker or switch repeatedly.
8. Approach tracks a roaming target.
9. Joystick or ground movement cancels an active approach/attack cleanly.
10. Clearing/changing target cancels the old command.
11. No HP changes, damage text, death, EXP, or loot occur.
12. Skills and AUTO remain disabled.

## 9. Required validation

```bash
pnpm install --frozen-lockfile
pnpm typecheck
pnpm test
pnpm build
```

Fix all errors. The known Babylon.js bundle-size warning remains non-blocking.

## 10. Handoff

Terra must update `docs/KANBAN.md`, report files changed, command/state architecture, platform behavior tested, validation results, limitations, commit SHA, and deployment status. Then stop for user testing. Do not begin authoritative combat.
