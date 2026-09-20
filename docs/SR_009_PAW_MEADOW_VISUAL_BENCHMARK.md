# NEKORIA — SR-009 PAW MEADOW VISUAL BENCHMARK

Status: User Testing

Owner: Sol

Implementer: Terra

Acceptance owner: User

## Objective

Raise the first playable area from programmer-art quality to a credible Nekoria visual benchmark without waiting for final production assets.

The benchmark must demonstrate the approved cute fantasy cat MMORPG direction during normal gameplay, not only in close-up screenshots.

## Mandatory references

Before implementation, read:

- `docs/GAME_DESIGN.md`
- `docs/ART_DIRECTION.md`
- all approved images in `docs/references/`

The approved Nekoria references take precedence over generic chibi, realistic fantasy, or generic mobile MMORPG styling.

## Scope

Polish an approximately 80×80 playable zone around the Paw Meadow spawn inside the existing 500×500 map.

The rest of the map may remain lower-detail placeholder terrain. Do not attempt to finish all 500×500 units during this SR.

## Required work

### 1. Adventurer placeholder upgrade

- Replace the capsule-style character with a readable anthropomorphic cat Adventurer placeholder.
- Use balanced stylized proportions with clearly separated head, torso, arms, legs, ears, muzzle, and tail.
- Avoid super-deformed oversized-head proportions.
- Add simple beginner clothing, boots, scarf or cape accent, pouch/backpack, and a basic weapon.
- Preserve readable silhouette from the locked elevated 3/4 camera.
- Keep gameplay entity/root separate from the rendered model so final assets can replace it later.

### 2. Character animation pass

Required prototype animations:

- Idle with subtle breathing, ear, or tail personality
- Run with smooth transition from idle
- Basic Attack with a readable anticipation and strike
- Hit reaction

Avoid robotic snapping and excessive motion.

### 3. Green Slime upgrade

- Replace the plain sphere appearance with a recognizable stylized slime silhouette.
- Add face, body squash, idle motion, movement motion, hit reaction, attack motion, and death animation.
- Keep the silhouette and target ring readable against grass and terrain.

### 4. Terrain composition

- Keep the existing 500×500 world boundary.
- Recompose the 80×80 benchmark zone with visible low hills, terraces, slopes, and shallow depressions.
- Create at least two readable elevation levels connected by walkable slopes.
- Include terrain or prop barriers that create a short choice between a main route and an alternate route.
- Avoid a flat rectangular arena appearance.
- Navigation must remain comfortable for desktop click-to-move and mobile joystick control.

### 5. Environment dressing

Use clustered composition rather than uniform random scattering.

Include:

- Curved dirt path
- Stylized grass variation
- Flower patches
- Bush clusters
- Rocks and small boulders
- Stylized trees
- Fence or wooden boundary accents
- A small stream crossing or bridge cue where practical
- Clear foreground, midground, and background separation

The Giant Tree must remain visible as a distant navigation landmark.

### 6. Materials and lighting

- Use a restrained stylized/toon material treatment.
- Improve grass, dirt, rock, foliage, water, character, and slime color separation.
- Use soft daylight and soft shadows.
- Add restrained distance fog or atmospheric perspective to support the larger map.
- Avoid photorealistic PBR noise, harsh black outlines, and excessive bloom.

### 7. Camera presentation

- Preserve the locked elevated 3/4 MMORPG camera.
- Ensure the player, weapon, slime, target indicator, terrain routes, and major props remain readable at normal zoom.
- Do not solve visual quality by moving the camera into a close action-game view.

### 8. Performance and architecture

- Preserve existing movement, targeting, combat, EXP, and server-authoritative pathways.
- Reuse materials and meshes where practical; use instances or thin instances for repeated props when appropriate.
- Avoid React state for per-frame animation.
- Keep visual models replaceable without rewriting gameplay logic.
- Maintain responsive desktop and mobile controls.

## Out of scope

- Final production-quality commissioned models
- Completing art across the entire 500×500 map
- One Tail city
- Class 2 models
- New combat systems or skills
- Ground loot
- Auto Battle
- Login or character creation
- Refine, Market, Souls, Party, Guild, PvP, Bosses, or Dungeons

## Acceptance criteria

The SR passes only when the deployed build demonstrates all of the following:

1. The first screen is visibly closer to the approved Nekoria references than programmer art.
2. The Adventurer reads as a cute anthropomorphic cat adventurer from normal gameplay zoom.
3. The character is not generic super-chibi and has readable limbs, clothing, tail, and weapon.
4. Idle, running, attacking, and hit reactions are visually distinct.
5. Green Slime has a deliberate stylized model and readable idle, movement, attack, hit, and death feedback.
6. The benchmark zone has obvious elevation, slopes, route framing, and clustered environmental composition.
7. The Giant Tree remains visible as a landmark.
8. Combat feedback and target selection remain readable among the new props.
9. Desktop and mobile movement remain usable without getting trapped on decorative props.
10. Existing authoritative combat and progression behavior still works.
11. `pnpm typecheck`, `pnpm test`, and `pnpm build` pass.
12. Changes are committed, pushed to `main`, and deployed to Render for user acceptance.

## Delivery notes

Terra must report:

- What visual assets or procedural models were added
- Any external asset source and license
- Performance compromises or placeholder limitations
- Validation results
- Commit SHA and deployed URL

## Implementation notes

- Adventurer and Green Slime are procedural Babylon.js placeholder models; no external art assets or licenses were added.
- Gameplay roots remain separate from visual model roots.
- The spawn benchmark now includes a curved path, stream, bridge cue, tree/bush clusters, grass tufts, fences, improved lighting, soft fog, and a larger Giant Tree landmark.
- Adventurer implements procedural Idle, Run, Basic Attack, and Hit motion. Green Slime implements idle squash, roaming hop, attack, hit flash, and the existing death animation.
- Automated production-page loading was verified, but the available cloud QA browser has no WebGL support. Final visual acceptance must be performed on the user's WebGL-capable mobile device or PC.
- Rocks, tree trunks, bush clusters, and fences register gameplay obstacles used by both player movement and monster roaming. Paths, water surfaces, and the bridge remain intentionally traversable.
