# NEKORIA — PROJECT HANDOFF v1.0

> Source of truth for the current locked game direction and technical requirements. Sections marked **LOCKED** remain requirements unless explicitly changed later.

## 1. GAME VISION

Nekoria is a **Cute Fantasy 3D Web MMORPG featuring anthropomorphic cat adventurers.**

Core identity:

- Browser-based 3D MMORPG
- Shared open-world fields
- Cute fantasy visual style
- Cat characters only
- Exploration-heavy world
- Grinding/progression inspired by classic MMORPGs
- Basic Attack is a legitimate endgame build
- Hybrid target combat
- Ground loot
- Player economy
- Risky equipment refining
- Official built-in Auto Battle
- Slow long-term progression
- Server-authoritative architecture

Core development statement:

> Cute Cat 3D Web MMORPG with Shared Open World, Lock-target + Hybrid Combat, Manual Stat Builds, Basic Attack as a real build, Ground Loot, Risky Refine, Player Economy, Slow Progression, Official Auto Farming, with server-authoritative game state.

The game should feel closer to classic MMORPGs such as Ragnarok Online / Seal Online than modern action MMORPGs.

## 2. VISUAL DIRECTION

- Cute fantasy; stylized anime; bright/colorful environments
- Detailed fantasy clothing and expressive cat characters
- NOT generic super-deformed/chibi
- Longer limbs and balanced proportions; same body proportions across classes
- Class identity comes primarily from equipment, weapon, silhouette, and VFX
- Cheerful world may contain mysterious/darker lore
- Stylized low/medium-poly, toon/stylized materials, soft shadows
- Clear skill/hit effects and smooth animation
- Target 60 FPS on normal PCs where practical; scalable quality later

## 3. CAMERA — LOCKED

Classic MMORPG 3/4 camera: elevated third-person, approximately 35–50° downward angle, relatively small character, much of the world visible, camera rotation and zoom. Do not build an FPS or close over-the-shoulder action camera.

## 4. WORLD DESIGN PHILOSOPHY

> Curiosity should be rewarded.

Maps are open fields, not stage-select screens. Every major field should generally contain a Main Road, Side Road, Hidden Road, and at least one mysterious landmark/“what is that?” discovery. Examples include high-level monsters in low-level maps, hidden caves, night-only paths, strange NPCs, and physically reachable distant landmarks. Do not overload every corner with secrets.

## 5. WORLD — PHASE 1

### One Tail

Starting city. Approximate South Gate-to-North Gate traversal: 2–3 minutes.

Locations: Tail Plaza, Adventurer Guild, Catnap Inn, Blacksmith, Potion Shop, Market, Warehouse, Training Ground, and Houses.

- South Gate → Paw Meadow
- North Gate → later regions / Whispering Forest
- Landmark: guild tower/banner containing one cat tail
- Giant Tree outside the city visible from parts of One Tail
- Secret: behind the Blacksmith is an unexplained old hidden door marked `V`

## 6. REGION PROGRESSION

```text
One Tail
↓
Paw Meadow Lv1–8
↓
Bluepaw Coast Lv5–12
↓
Mushroom Hollow Lv8–15
↓
Whispering Forest Lv12–20
↓
Ancient Ruins Lv15+
↓
First Major Boss ~Lv20
↓
Job Change
↓
Deep Whisper Lv20–28
↓
Two Bells / City 02
↓
Highland Trail Lv25–35
↓
City 03 Lv30+
↓
Frostfang Lv35–45 or Suntail Lv35–45
↓
City 04 Lv40+
↓
Skybreak Ridge Lv45–50
↓
Final Dungeon Lv48–50
```

North Gate / future region leads to Phase 2. Names after One Tail are provisional.

## 7. PAW MEADOW — FIRST VERTICAL SLICE

First playable map, Lv1–8. Bright grassland with small hills, stream, flowers, and the Giant Tree visible in the distance.

| Monster | Level | Type | Notes |
|---|---:|---|---|
| Green Slime | 1 | Weak | — |
| Meadow Puff | 3 | Normal | — |
| Horn Rabbit | 5 | Normal | Higher AGI/FLEE |
| Shell Beetle | 7 | Tough | Higher DEF |
| Old Fang Wolf | 15 | Elite | Intentionally accessible to Lv1 players |

Near Giant Tree: `??? Burrow`, a potential future Lv12–18 mini-dungeon.

## 8. FIRST DEVELOPMENT MILESTONE

Do not build the entire MMO yet. The Paw Meadow vertical slice implements: 3D map, player movement, 3/4 camera, monster spawning, Lock Target, Basic Attack, HIT/MISS/CRIT, monster HP/death, EXP/Level Up/Status Points, ground loot, walk-to-loot/pickup, Weight, Auto Battle, and Return Bell.

Earliest visual prototype may contain only Paw Meadow, placeholder cat/player, Green Slime, camera, and movement, then progressively add combat.

Do not yet implement Guild, full Party, Market, Soul upgrading, full Refine gameplay, Dungeon, Boss, Class 2, PvP, or Class 3. Architecture/data structures must not prevent them later.

## 9. CLASS PROGRESSION — LOCKED

Everyone starts as **Class 1 — Adventurer**, Base Lv1–20. At Base Lv20, the player completes a Job Trial and chooses Class 2: Swordsman, Archer, Mage, or Healer. Class 2 covers Base Lv20–50; Phase 1 ends at Base Lv50 / Class 2. Class 3 belongs to Phase 2.

Provisional future branches: Swordsman → Knight/Berserker; Archer → Ranger/Hunter; Mage → Wizard/Sorcerer; Healer → Priest/Druid.

## 10. IMPORTANT CLASS SKILL RULE — LOCKED

After Adventurer changes to Class 2, all Adventurer/Class 1 skills become unusable. Class 2 has its own Skill Tree and Skill Points, and Job Level resets. Only Class 1 skills become unusable; Monster Journal, equipment, inventory, Status, Souls, Auto Battle, consumables, and general systems remain. Changing class changes the skill set, not the character.

## 11. BASE LEVEL AND JOB LEVEL — LOCKED

- Base Level controls character progression and Status Points; Phase 1 is Lv1–50.
- Job Level controls Skill Points; Adventurer is Job Lv1–20.
- Example: Base Lv20 / Adventurer Job Lv20 → Base Lv20 / Swordsman Job Lv1. Base Level does not reset.

## 12. PRIMARY STATS — LOCKED

| Stat | Effects |
|---|---|
| STR | Physical ATK, melee scaling, carrying capacity |
| AGI | ASPD, FLEE |
| VIT | Max HP, some DEF, status resistance |
| INT | MATK, Max SP, healing, MDEF, SP regeneration |
| DEX | HIT, ranged damage, Cast Time |
| LUK | CRIT, critical resistance, status success/resistance |

LUK has no effect on Drop Rate.

## 13. STATUS POINT SYSTEM — LOCKED v1

Starting stats: STR/AGI/VIT/INT/DEX/LUK = 1 each.

Status Points per new Base Level: Lv2–9 +3; Lv10–19 +4; Lv20–29 +5; Lv30–39 +6; Lv40–49 +7; Lv50 +8. Equivalent rule: `3 + floor(NewLevel / 10)` with band handling matching these values. Approximately 250 Status Points by Lv50.

## 14. STAT COST — LOCKED

| Current Base Stat | Cost |
|---:|---:|
| 1–10 | 2 |
| 11–20 | 3 |
| 21–30 | 4 |
| 31–40 | 5 |
| 41–50 | 6 |
| 51–60 | 7 |
| 61–70 | 8 |
| 71–80 | 9 |
| 81–90 | 10 |
| 91–99 | 11 |

Equipment/Soul bonuses do not affect upgrade cost. Only Base Stat determines cost. Support Base Stats to at least 99.

## 15. COMBAT TARGETING — LOCKED

Hybrid Target Combat: Basic Attack and single-target skills lock target; AoE is non-target/ground/directional per skill. Selection locks the monster. If out of range, the character automatically approaches, then attacks according to ASPD until the target dies, changes, or attack is cancelled. Archer stops at bow range. Lock Target does not guarantee hit; HIT/FLEE remains server-calculated.

## 16. BASIC ATTACK PHILOSOPHY — LOCKED

Basic Attack is a real build, not filler, and remains viable through endgame. Skill builds gain burst/AoE/CC/utility. Auto builds gain sustained DPS, low SP use, ASPD, CRIT, and on-hit mechanics.

## 17. SKILL TIMING — LOCKED

Each skill independently has Cast Time, Animation Time, After Skill Delay, and Cooldown. No large modern MMO global cooldown. DEX reduces Cast Time. AGI/ASPD reduces neither After Skill Delay nor Cooldown; ASPD primarily affects Basic Attack.

## 18. HIT

`HIT = 80 + BaseLevel + DEX + EquipmentHIT`

`Hit Rate = 80 + (AttackerHIT - TargetFLEE)`, clamped to 20%–95%.

## 19. FLEE

`FLEE = 50 + BaseLevel + AGI + EquipmentFLEE`

Mob penalty: 1 attacker 100%; 2 95%; 3 90%; 4 80%; 5 70%; 6+ 60%. AGI is strong 1v1; VIT is more reliable against groups.

## 20. CRIT — LOCKED baseline

`CRIT = 5% + LUK × 0.25% + EquipmentCRIT`; Phase 1 cap 60%; critical damage ×1.5. Critical attacks cannot MISS but do not ignore DEF.

## 21. ASPD — LOCKED baseline

`ASPD = BaseASPD + floor(AGI × 0.35) + Gear + Buff`; Phase 1 cap 190.

| ASPD | Hits/sec |
|---:|---:|
| 140 | 1.00 |
| 150 | 1.11 |
| 160 | 1.25 |
| 170 | 1.43 |
| 180 | 1.67 |
| 185 | 1.82 |
| 190 | 2.00 |

Example weapon Base ASPD: Sword 145, Dagger 150, Bow 140, Staff 138, Mace 140. DEX does not increase ASPD. ASPD affects Basic Attack only.

## 22. HP / SP — PROVISIONAL

`BaseHP = 100 + (Level - 1) × 15 + floor((Level - 1)² × 0.15)` (Lv1 100; Lv10 247; Lv20 439; Lv30 661; Lv40 913; Lv50 1195).

`BaseSP = 40 + (Level - 1) × 3` (Lv1 40; Lv20 97; Lv50 187).

`FinalHP = BaseHP × ClassHPModifier + VIT × 10 + EquipmentHP`

`FinalSP = BaseSP × ClassSPModifier + INT × 3 + EquipmentSP`

Provisional class HP/SP modifiers: Swordsman 1.30/0.85; Archer 1.00/0.95; Mage 0.80/1.40; Healer 0.95/1.25.

## 23. PHYSICAL ATK — PROVISIONAL

`CharacterATK = STR + floor(STR² / 120) + floor(DEX / 5) + floor(LUK / 10)`

`Raw Physical ATK = CharacterATK + WeaponATK + RefineATK + EquipmentATK`

## 24. MATK — PROVISIONAL

`CharacterMATK = INT + floor(INT² / 120) + floor(DEX / 10)`

`Raw MATK = CharacterMATK + WeaponMATK + RefineMATK + EquipmentMATK`

## 25. DEF

> Tank = difficult to kill, not impossible to damage.

Use diminishing returns: `DamageReduction = DEF / (DEF + 200)`. Examples: DEF 50=20%, 100=33%, 200=50%, 300=60%, 500=71%, 800=80%, 1000=83%. Avoid `Damage = ATK - DEF`. Armor is the main DEF source; VIT supplies HP, modest DEF, and status resistance.

## 26. MONSTER HP — PROVISIONAL

Normal curve: `80 + 20L + 2L²` (Lv1 102; Lv5 230; Lv10 480; Lv20 1280; Lv30 2480; Lv40 4080; Lv50 6080). Multipliers: Weak ×0.65, Normal ×1, Tough ×1.5, Elite ×3–5.

Target TTK: Normal 8–12 sec; Weak 4–7 sec; Tough 15–25 sec; Elite 30–60 sec; Mini Boss 2–5 min; Field Boss 5–15+ min.

## 27. ELEMENT SYSTEM

Elements: Neutral, Fire, Water, Wind, Earth, Light, Dark. Fire > Earth > Wind > Water > Fire; Light ↔ Dark. Provisional multiplier: advantage ×1.25, neutral ×1.00, disadvantage ×0.75. Monsters may additionally have Race and Size.

## 28. SWORDSMAN ELEMENT — LOCKED

Swordsman uses 10-minute consumable Fire/Water/Wind/Earth/Light/Dark Element Scrolls. They change weapon element only and grant no direct ATK. Basic Attack and skills with `elementSource = WEAPON` inherit it; some skills remain Neutral. A new scroll replaces the old without stacking. Logout pauses timer; login resumes. Death and map change do not remove it.

## 29. ARCHER ARROWS — LOCKED

Physical ammunition: Basic Attack consumes one Arrow; skill arrow cost is configurable. Normal/Fire/Water/Wind/Earth/Light/Dark arrows determine attack element. Archer does not use Swordsman Element Scroll. NPC Quivers contain 500 arrows. Opening adds 500. Example weight: 10 arrows = Weight 1, and a Quiver retains equivalent weight. With no arrows, a Bow cannot fire.

## 30. EQUIPMENT SLOTS

Head, Body, Weapon, Off-hand, Shoes, Accessory 1, Accessory 2. Random option maxima: Weapon 3; Head/Body/Shoes/Shield 2; Accessory 1.

## 31. RANDOM EQUIPMENT OPTIONS — LOCKED direction

Equipment may drop with 0–3 random options by slot. Phase 1 options: STR/AGI/VIT/INT/DEX/LUK +1–2; ATK/MATK +2–5; HIT/FLEE +2–4; CRIT +1–3; rare ASPD +1–2; Max HP +10–30; Max SP +5–15.

Do not add Final Damage %, Physical Damage %, Boss Damage %, Skill Damage %, Critical Damage %, Ignore DEF %, or Element Damage % in Phase 1.

## 32. IDENTIFICATION SYSTEM — LOCKED v1

Equipment with Random Options drops unidentified. Option count/values are hidden, but options are rolled and stored server-side when the item is created. Identification does not roll. The client never receives hidden options before Identify. Appraisal Lens (working name) is bought from NPC using Bell; one per equipment. Unidentified gear may be held, stored, traded, and listed on Market, but cannot be equipped or refined.

## 33. REFINE SYSTEM — LOCKED

Phase 1 maximum +10.

| Upgrade | Success | Downgrade | Destroy |
|---|---:|---:|---:|
| +0→+1 | 100% | 0% | 0% |
| +1→+2 / +2→+3 | 80% | 10% | 10% |
| +3→+4 / +4→+5 | 60% | 25% | 15% |
| +5→+6 / +6→+7 | 40% | 40% | 20% |
| +7→+8 / +8→+9 | 20% | 55% | 25% |
| +9→+10 | 10% | 65% | 25% |

Destroyed equipment and its random options are permanently gone.

## 34. REFINE ATK

`+0=0, +1=2, +2=4, +3=6, +4=9, +5=12, +6=16, +7=20, +8=25, +9=30, +10=36` flat ATK/MATK.

## 35. REFINE VISUAL EFFECT — LOCKED

Weapon only, cosmetic: +0–+6 no glow; +7 light blue glow/particles; +8 purple; +9 gold; +10 strongest red effect.

## 36. REFINE MATERIALS — LOCKED

Separate Weapon Ore and Armor Ore. Grades: Lv1–20 I, Lv21–30 II, Lv31–40 III, Lv41–50 IV. Materials are Weapon Ore I–IV and Armor Ore I–IV.

Required quantity: +1→+3 ×1; +4→+5 ×2; +6→+7 ×3; +8→+9 ×4; +10 ×5. Refine requires Bell plus correct Ore. Ore is farmed/traded; NPC does not sell it.

## 37. SOUL SYSTEM — LOCKED direction

Monsters can drop Souls, equipped directly on character rather than socketed into weapons. Phase 1 target: 3 slots. Bonuses are small (e.g. stat +1, HIT, FLEE, CRIT, small HP/SP); avoid Final Damage %, Skill Damage %, and large Element Damage %. Max upgrade +5. A full setup contributes only ~5–8% total character power.

## 38. POTIONS — LOCKED direction

Small/Medium/Large HP and SP potions. Global Potion Delay 1 second, separate from skill and attack delays. VIT/INT do not increase HP/SP potion healing. Potions have Weight.

## 39. NATURAL REGEN

Natural HP/SP regeneration is higher out of combat and lower in combat; potential transition ~5 sec and tick every 3 sec. VIT affects HP regen; INT affects SP regen. Sitting (cat sits/lies down) gives approximately ×2, disallows attacks/skills, and being hit forces standing. Exact values are tunable.

## 40. DEATH — LOCKED v1.1

PvE death immediately loses 5% Base EXP of the current level requirement, never below 0%, with no level down. No equipment, inventory, Bell, Souls, or refine loss. Options: Return to Save Point; Revive Here using Moonstone/Cash; wait for Healer Resurrection. Resurrection does not restore EXP. Death stops Auto. Auto never spends Moonstone.

## 41. RETURN BELL

Bell-purchased consumable returning player to latest Save Point. Proposed: 5-sec cast cancelled by damage, consumed on successful teleport, Weight 2. Auto may use it at configured Weight threshold or when HP potions, SP potions, or arrows are empty. Auto stops in town and never automatically sells, buys, stores, or returns to the farm map.

## 42. OFFICIAL AUTO BATTLE — LOCKED

Official Auto Battle is intentional, not cheating. It scans monsters, selects/locks target, approaches, uses Basic Attack/configured skills, approaches/picks up ground loot, and repeats. It may use configured potions and Return Bell. It cannot quest, autonomously change maps, buy/sell/store/refine, open Quivers, manage town, return to the farm after town, or use Cash Revive. Manual and Auto use identical damage, EXP, drops, and formulas, with no bonus or penalty.

## 43. EXP PACING — LOCKED target

Phase 1 Lv1→50 targets 250–300 farming hours (~275 center). Lv1→20 is ~25–30 hours before boosts. Efficient Lv49→50 is ~8% EXP/hour (~12.5 hours). Cash Base EXP and Job EXP boosts max +25% each. Balance around farming hours. Quests guide/supplement grinding, not replace it.

## 44. LEVEL DIFFERENCE — PROVISIONAL EXP MODIFIER

Monster +10 or higher ~120% cap; +5–9 115%; +2–4 110%; ±0–1 100%; player 2–4 higher 90%; 5–7 70%; 8–10 40%; 11–15 15%; 16+ 5%.

## 45. DROP PENALTY — LOCKED direction

For normal loot, the player with most cumulative damage (`topDamagePlayerId`) determines penalty. Player above monster: 0–4 levels 100%; 5–9 80%; 10–14 50%; 15–19 25%; 20–29 10%; 30+ 5%. Applies to Junk, Equipment, Material, Soul. LUK has no effect.

## 46. GROUND LOOT — LOCKED

Server rolls drop and creates a world item entity; client renders scattered items. Player/Auto must physically approach and pick up; no default vacuum. Rare Soul, 3-option equipment, and Boss rare drops may have beam, particles, and special sound.

## 47. MULTIPLAYER ARCHITECTURE — LOCKED direction

Open shared fields: players in the same Map/Channel see each other in real time. `World → Map Server → Map Instance/Channel → Players + Monsters`. Use AOI; do not broadcast every entity to every player. Multiple players may attack one monster; server tracks contribution.

## 48. PARTY

Future architecture supports parties of different levels. Do not use average party level for low-level EXP. Eligibility may require range, alive state, and meaningful damage/tanking/healing/buffs/debuffs/CC participation. AFK nearby receives no EXP.

## 49. CURRENCY — LOCKED

Exactly two currencies:

- **Bell**: normal currency (`🪙 12,850 Bell`) for NPC, Potion, Element Scroll, Refine, Craft, Teleport, Market, trade; Weight 0.
- **Moonstone**: premium (`💎 1,250 Moonstone`), mainly real-money; cannot trade, sell, or exchange directly to Bell. Cash progression items are Account Bound.

## 50. ECONOMY — LOCKED

Monsters drop 0 Bell. Main faucet: monster Junk → NPC sale → Bell. Equipment NPC sale value is very low. Souls, Ore, good equipment, and rare crafting materials gain value mainly through player Market.

## 51. MARKET TAX — LOCKED

10% successful-sale tax. Buyer pays 1000 Bell, seller gets 900, 100 is removed. No initial listing fee.

## 52. INVENTORY / WEIGHT

RO-style. Bell/Moonstone 0; example Junk 1, crafting 2–5, Soul/Lens 1, Scroll 2, Potion 3–8+, refine materials 5–10+, equipment significantly heavier. STR increases max Weight; exact formula TBD. Under 50% normal; 50%+ natural regen stops; ~90% heavy penalty TBD; 100% cannot pick up more.

## 53. MONETIZATION PRINCIPLES

Base/Job Cash EXP boosts max +25%. Focus on cosmetics, inventory/storage, character slots, appearance, pet/mount skins, and convenience. Potential Protection Crystal changes Destroy → Downgrade without raising success rate. Never sell guaranteed +10, direct +10 weapon, perfect 3-option weapon, stronger cash-only Souls, or cash-only stronger weapons.

## 54. ASPD BUFF

In-game 5-minute ASPD potion/buff affects Basic Attack only. Different ASPD potions do not stack; new replaces/resets timer. Logout pauses; death does not remove. AGI alone generally cannot cap; require gear/passive/potion/Soul combination.

## 55. ADVENTURER SKILLS

Job Lv1–20, ~19 points. Draft: Basic Combat Training 5, Tough Paw 5, Quick Paw 5, First Aid 5, Power Strike 5, Focus 5, Rest 3, Survival Instinct 3, Adventurer Spirit 1, Cat's Instinct utility scan. These become unusable after Class 2. Monster Journal is a general system independent of Adventurer skills.

## 56. CLASS 2 HIGH-LEVEL DESIGN

Not in the first prototype. Swordsman, Archer, Mage, Healer. Workflow: high-level blueprint → individual design → combat simulation → exact-number balance. Every class has at least one viable solo build.

## 57. SWORDSMAN DIRECTION

Builds: STR Skill, AGI Auto, VIT Tank, AGI/LUK Crit, Hybrid. Weapons: Sword+Shield, 2H Sword, Dagger. Draft branches: Offense (Weapon Mastery, Power Slash, Bash, Whirlwind, Overpower); Guard (Shield Guard, Provoke, Iron Body, Fortress); Speed (Quick Blade, Weapon Tempo, Double Strike, Blade Instinct). Numbers not final.

## 58. ARCHER DIRECTION

Builds: DEX Power, AGI Auto, AGI/LUK Crit, Hunter/Control. Draft: Bow Mastery, Power Shot, Piercing Arrow, Multi Shot; Quick Draw, Rapid Shot, Double Arrow, Critical Aim; Eagle Eye, Wind Step, Snare Trap, Hunter's Mark, Survival Sense. Element comes from Arrow.

## 59. MAGE DIRECTION

Builds: INT Burst, AoE, Element, Control. Draft: Mana Mastery; Fire Bolt/Burst; Water Bolt/Frost Field; Wind Bolt/Thunder Storm; Earth Spike/Wall; Mana Flow, Quick Cast, Magic Barrier, Arcane Focus, Elemental Insight. Mage cannot max every element.

## 60. HEALER DIRECTION

Builds: Pure Support, Battle Healer, Tank-Healer, Light Mage. Draft: Heal, Greater Heal, Regeneration, Group Heal, Resurrection; Blessing, Protection, Cleanse, Sanctuary; Mace Mastery, Holy Strike, Light Bolt, Divine Shield, Retribution. Resurrection does not restore Death EXP.

## 61. TECH STACK — LOCKED for prototype

Frontend: React, TypeScript, Babylon.js. React owns UI/HUD/menus/inventory/panels. Babylon owns 3D world/camera/characters/monsters/animations/rendering/VFX. React must not own the realtime loop.

## 62. BACKEND

NestJS + TypeScript + WebSocket; later PostgreSQL and Redis when needed. Server authoritative; client sends intents (`MOVE`, `TARGET`, `ATTACK`, `USE_SKILL`, `USE_ITEM`, `PICKUP_ITEM`). Server validates/calculates position, movement, range, target, timing, HIT/MISS/CRIT/damage, monster HP/death, EXP/level/drops, hidden options, inventory/Weight/Bell, and Refine RNG. Never trust client combat results.

## 63. REPOSITORY ARCHITECTURE

pnpm monorepo:

```text
nekoria/
├── apps/
│   ├── web/       # React + TypeScript + Babylon.js
│   └── server/    # NestJS + WebSocket
├── packages/
│   ├── game-core/
│   ├── protocol/
│   └── shared/
├── assets/
├── docs/
│   └── GAME_DESIGN.md
├── AGENTS.md
├── render.yaml
├── pnpm-workspace.yaml
├── package.json
└── README.md
```

`game-core`: shared formulas/config/data definitions. `protocol`: network contracts. `shared`: generic shared TS types/utilities. Avoid circular dependencies.

## 64. NETWORK ARCHITECTURE

`Client → WebSocket → NestJS Server → Authoritative World State`; eventually `Gateway → Map Servers → Map Instances`. Start with one authoritative server, with boundaries permitting later splits. Do not prematurely distribute the prototype.

## 65. AUTO BATTLE ARCHITECTURE — SECURITY REQUIREMENT

Auto and manual use the same server combat path. Never create separate `autoDamage()` and `manualDamage()`. Manual `ATTACK` intent and Auto target choice both call `CombatService.attack()` with identical formulas, restrictions, and rewards.

## 66. SERVER TIME

Server time controls and validates attack interval, skill cast, cooldown, potion delay, distance, and movement. Never trust client timers.

## 67. DATA-DRIVEN DESIGN

Avoid scattered hardcoding. Prefer `MonsterDefinition`, `ItemDefinition`, `SkillDefinition`, `ClassDefinition`, `MapDefinition`, and `DropTable`. Example Green Slime definition: id `green_slime`, level 1, type weak, final element TBD, HP from curve/config. Balance without rewriting systems.

## 68. ITEM INSTANCE DESIGN

Equipment is an item instance. Definition example: Iron Sword. Instance fields: `instanceId`, `definitionId`, `refineLevel`, `identified`, `randomOptions`, `boundState`. Hidden options exist server-side while unidentified; client receives only safe/public representation.

## 69. SECURITY

Client never decides damage, death, EXP, drops, random options, refine success, Bell gain, or item creation. Server decides requested actions. Later detection may examine impossible movement/action rate, abnormal acquisition, packet rate, and behavior. Do not rely on CAPTCHA as normal gameplay.

## 70. DATABASE

PostgreSQL planned. Do not overbuild schema before vertical slice. Eventual entities include Account, Character, CharacterStat, Inventory, ItemInstance, Skill, CharacterSkill, Soul, Storage, MarketListing, Quest, MapSavePoint. Use migrations.

## 71. DEVELOPMENT PLATFORM

Repository: `ananchaisjrnt/nekoria`; main branch `main`; development deployment Render. Pipeline: Local/Codex → Git Commit → GitHub → Render Auto Deploy.

## 72. RENDER

Prototype Web is a static React/Vite service/site; Server is a Node/NestJS Web Service; later PostgreSQL. Include `render.yaml` where practical. Never hardcode production URLs. Frontend: `VITE_GAME_SERVER_URL`; server: `PORT`, `DATABASE_URL`, `CORS_ORIGIN`.

## 73. ENVIRONMENT

Provide `.env.example`. Never commit `.env`, credentials, tokens, or API secrets.

## 74. CODE QUALITY

Use TypeScript strict mode, clear domain naming, small focused services, shared protocol types, and data-driven definitions. Avoid giant GameManager classes, React per-frame simulation state, client-authoritative combat, premature microservices, and unnecessary abstraction. Prefer readable code.

## 75. FIRST CODING TASK

Inspect repository, bootstrap monorepo if absent, create `apps/web`, `apps/server`, `packages/game-core`, `packages/protocol`, `packages/shared`, then implement Paw Meadow v0.1: Babylon scene, stylized green ground, daylight, 3/4 ArcRotate-style camera, placeholder cat and Green Slime, rotation/zoom/resize, and HUD showing NEKORIA / Paw Meadow / Prototype v0.1. No production assets needed.

## 76. SECOND CODING TASK

Add player movement (click-to-move or initial keyboard), separate movement logic from rendering, face travel direction, keep MMORPG camera, and design protocol for later server authority. Prefer eventual click-to-move.

## 77. THIRD CODING TASK

Lock Target: click Green Slime, show target indicator/name/level/HP. Basic Attack out of range approaches; in range attacks.

## 78. FOURTH CODING TASK

Move combat authority server-side: HIT/MISS/CRIT, damage, ASPD interval, HP/death. Client renders server events and floating damage/MISS/CRIT text.

## 79. FIFTH CODING TASK

EXP, Level Up, Status Points from Lv1. No Class 2. Debug UI exposes Level, EXP, six stats, unused Status Points.

## 80. SIXTH CODING TASK

Ground Loot: Green Slime death triggers server roll/entity; client renders; player approaches and sends `PICKUP_ITEM`; server checks distance, ownership, inventory, and Weight before grant.

## 81. SEVENTH CODING TASK

Minimal `AUTO`: scan eligible nearby monsters → target → approach → attack → kill → approach loot → pick up → repeat, using the same `CombatService` as manual. Initial configurable radius ~15–20m from Auto start.

## 82. IMPORTANT DEVELOPMENT RULE

Do not implement all systems immediately. Source-of-truth priority: Paw Meadow → Movement → Targeting → Basic Attack → Combat → EXP → Loot → Auto Battle. Expand only after this loop feels good.

## 83. CURRENT DEFINITION OF DONE

The first meaningful build lets a user open Nekoria, see Paw Meadow, move a cat, see/select Green Slimes, Basic Attack with HIT/MISS/CRIT, kill/gain EXP, see/approach/pick up ground loot, enable AUTO, and watch the cat repeat the same legitimate loop.

## 84. INSTRUCTIONS TO CODEX

Before changes: inspect the repository; preserve useful code; do not rewrite working systems without reason; follow this document; keep server authoritative; avoid unrelated future systems; use placeholders; keep formulas configurable; run typecheck/build/tests and fix errors; update README for setup changes; never commit secrets; keep commits focused.

Initial task (only when explicitly authorized): project bootstrap and Paw Meadow v0.1. Then run install/build/typecheck, report implementation and limitations, and commit with suggested message `feat: bootstrap Nekoria Paw Meadow prototype`.

Do not begin Class 2, Refine, Market, Soul Upgrade, PvP, or other future systems unless explicitly requested.

---

## CURRENT DEVELOPMENT STATUS

Development is authorized and proceeds one testable system at a time. Current milestone: project foundation and Paw Meadow Visual Prototype v0.1. Do not advance to the next gameplay system until the current system has been tested.
