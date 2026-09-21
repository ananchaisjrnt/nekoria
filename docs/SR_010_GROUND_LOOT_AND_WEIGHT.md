# NEKORIA — SR-010 GROUND LOOT, PICKUP, INVENTORY, AND WEIGHT

Status: Ready

Owner: Sol

Implementer: Terra

Acceptance owner: User

## Objective

Complete the next part of the Paw Meadow gameplay loop:

```text
Kill Green Slime
→ server creates loot
→ loot appears on the ground
→ player physically approaches it
→ player requests pickup
→ server validates and grants the item
→ inventory and Weight update
```

Keep the first implementation small. Ground appearance must communicate the item's category, but individual item definitions inside a category may reuse one model.

## Locked ground appearance rule

Players must be able to recognize the broad loot category before pickup.

| Loot category | Ground representation | Examples |
|---|---|---|
| General monster loot | One shared cute gift bag / item pouch | Slime Jelly and other monster junk |
| Weapon | Shared weapon box or wrapped-weapon box | Sword, Dagger, Bow, Staff, Mace |
| Body armor | Shared body-armor/clothes box | Body equipment |
| Shoes | Shared shoe box | Shoes equipment |
| Head equipment | Shared headgear box | Head equipment |
| Off-hand armor | Shared off-hand/shield box | Shield and other off-hand equipment |
| Accessory | Shared accessory box | Rings and other accessories |
| HP/SP potion | The potion bottle itself; no bag or box | Small HP Potion, Small SP Potion |
| Refine material | The ore/material itself; no bag or box | Weapon Ore, Armor Ore |
| Soul | A small stylized Soul resembling its source monster, with a readable colored aura/glow | Green Slime Soul |

Items within one equipment slot category should reuse its box model/material where practical. The box hides the exact equipment definition until appraisal, but its slot category remains readable.

Do not create a unique ground model for every weapon, armor definition, potion size, or ore grade during this SR. Potion and refine-material families may use color/material variants. Soul is the exception: its silhouette should identify the source monster, while sharing a reusable Soul shader/VFX system.

## Hidden equipment identity and options

When equipment drops, the server must create the real item instance immediately.

The server-side item instance must already contain:

- `instanceId`
- real `definitionId`
- equipment category/slot
- `identified = false`
- pre-rolled random options
- bound state
- weight

The client must not receive the hidden definition or random options before appraisal.

Before appraisal, the public inventory representation may show only a category label such as:

- `Unidentified Weapon`
- `Unidentified Body Armor`
- `Unidentified Shoes`
- `Unidentified Head Equipment`
- `Unidentified Off-hand`
- `Unidentified Accessory`

The later Appraisal/Identification system will reveal what the equipment is and what options it already contains.

Important security rule:

> Appraisal reveals an item that already exists. It never rolls or changes the item.

The Appraisal Lens UI and identification action are out of scope for this SR, but the item-instance structure must support them.

## Minimal Phase 1 drop definitions

Implement only enough items to verify the loop.

### Slime Jelly

- Type: Junk / General
- Ground appearance: Gift Bag
- Weight: 1
- Purpose: future NPC Bell faucet
- Green Slime drop rate: configurable baseline around 60–70%

### Small HP Potion

- Type: Consumable / Potion
- Ground appearance: Red HP potion bottle, not a bag or box
- Public inventory name after pickup: `Small HP Potion`
- Stackable: Yes
- Weight: configurable baseline 3 per potion
- Green Slime drop rate: uncommon and configurable, suggested prototype baseline around 10–15%

### Small SP Potion

- Type: Consumable / Potion
- Ground appearance: Blue SP potion bottle, not a bag or box
- Public inventory name after pickup: `Small SP Potion`
- Stackable: Yes
- Weight: configurable baseline 3 per potion
- Green Slime drop rate: uncommon and configurable, suggested prototype baseline around 5–10%

Potion use, healing/SP restoration, and the locked one-second Potion Delay are not implemented in this SR. This SR only creates, drops, picks up, stacks, displays, and weighs the potion items.

### Unidentified Beginner Body Armor

- Type: Equipment / Body
- Ground appearance: Body Armor Box
- Weight: configurable baseline around 12–18
- Drop rate: low and configurable
- Exact definition and options stored server-side only

### Unidentified Beginner Weapon

- Type: Equipment / Weapon
- Ground appearance: Weapon Box
- Weight: configurable baseline around 15–22
- Drop rate: low and configurable
- Exact definition and options stored server-side only

The exact rates are prototype values, not locked balance.

Refine materials and Souls are required ground-appearance categories and must be supported by the data/protocol/rendering architecture. Green Slime does not need to drop refine material or a Soul at a meaningful production rate in this minimal test; a debug spawn or very low configurable test rate is acceptable for visual verification.

For a Green Slime Soul prototype:

- Use a small simplified Green Slime-like Soul silhouette.
- Add a colored emissive aura/soft particles so it is immediately distinct from the living monster and ordinary loot.
- Keep the effect readable without producing a screen-filling beam.
- Soul bonuses, equipping, slots, and upgrading remain out of scope.

## Server-authoritative requirements

The client never decides whether loot exists or whether pickup succeeds.

On monster death, the server must:

1. Roll the configured drop table.
2. Create item instances server-side.
3. Create ground-item entities with unique entity IDs.
4. Assign map position and small scatter offsets near the monster death position.
5. Assign ownership/protection metadata.
6. Send only the safe public ground representation to the client.

For `PICKUP_ITEM`, the server validates:

- Ground item still exists
- Player/session is eligible to pick it up
- Pickup distance is within configurable range
- Inventory has capacity
- Adding the item does not exceed 100% Weight
- Request rate and duplicate pickup protection

After successful pickup, the server must atomically:

1. Remove the ground entity.
2. Add the item instance to inventory.
3. Recalculate Weight.
4. Send pickup/inventory result to the client.

Failed pickup must not duplicate or destroy the item.

## Protocol direction

Add typed contracts for at least:

- `GROUND_ITEM_SPAWNED`
- `GROUND_ITEM_REMOVED`
- `PICKUP_ITEM`
- `PICKUP_RESULT`
- `INVENTORY_SNAPSHOT` or an equivalent authoritative inventory update

Safe public ground data should include only what rendering needs, such as:

- ground entity ID
- broad appearance type, supporting at least `GIFT_BAG | WEAPON_BOX | BODY_BOX | SHOES_BOX | HEAD_BOX | OFF_HAND_BOX | ACCESSORY_BOX | HP_POTION | SP_POTION | REFINE_MATERIAL | SOUL`
- public category label
- rarity presentation tier if applicable
- position
- ownership availability state
- expiration time when needed

Never send hidden equipment definition/options in the ground-entity payload.

## Ground loot presentation

- Loot must physically appear near the monster death position.
- Use a short scatter/pop animation rather than instant static placement.
- Add a subtle idle bob or sparkle so the item is visible from the 3/4 camera.
- Common/general loot uses restrained feedback.
- Equipment boxes must make their slot category readable without revealing the exact item.
- Potions and refine materials render as the actual category object, not inside a generic container.
- Souls resemble their source monster and use a distinct colored aura/glow.
- Equipment boxes may be slightly more visible but must not look like a rare endgame beam.
- Do not use vacuum pickup.
- Keep effects readable and mobile-friendly.

## Player interaction

### Desktop

- Clicking or double-clicking a ground item selects it as the pickup destination.
- If out of range, the character walks toward it.
- At valid range, send `PICKUP_ITEM`.

### Mobile

- The joystick remains the primary movement control.
- When an eligible ground item is nearby, show a touch-friendly `PICKUP` button or context action.
- Pressing it may approach the selected/nearest eligible item and then request pickup.
- Walking near loot by itself must not automatically collect it during this SR.

Manual movement cancels an active auto-approach-to-loot action.

## Inventory debug UI

Add a small prototype inventory panel sufficient for verification.

It must show:

- Public item name/category
- Quantity for stackable general items
- Weight per stack/item
- Current Weight / Max Weight
- Enough information to confirm unidentified equipment is not leaking hidden data

The panel does not need final production art.

## Weight baseline

Use a configurable prototype formula that preserves the locked STR direction:

`Max Weight = Base Carry Weight + STR × Carry Weight Per STR`

Suggested prototype values:

- Base Carry Weight: 100
- Carry Weight per Base STR: 10
- Starting STR 1 → Max Weight 110

Weight behavior required now:

- Under 50%: normal
- 50%+: display overweight warning; natural-regeneration integration remains future work
- Around 90%: display heavy warning; movement penalty remains future work
- 100%: pickup that would exceed capacity is rejected

Bell and Moonstone remain Weight 0 and are not implemented as monster drops.

## Ownership and lifetime

Use configurable prototype values.

Suggested baseline:

- Initial owner protection: killer/session only
- Protection duration: approximately 10–20 seconds
- Ground lifetime: approximately 45–60 seconds

After protection expires, architecture may allow public pickup later. For this single-session prototype, it is acceptable to retain session-only eligibility while keeping ownership fields in the contract.

When lifetime expires, the server removes the ground entity and notifies the client.

## Data-driven requirements

Add or extend focused definitions rather than scattering hardcoded values:

- `ItemDefinition`
- `ItemInstance`
- `DropTable`
- `GroundItemEntity`
- Weight configuration
- Pickup configuration

The design must allow more items and distinct rare-drop visuals later without rewriting pickup logic.

## Auto Battle compatibility

Do not implement Auto Battle in this SR.

However, manual pickup and future Auto pickup must ultimately use the same authoritative pickup service and validation pathway.

Do not create separate future-only shortcuts such as `autoGrantLoot()`.

## Out of scope

- Appraisal Lens and identification UI/action
- Equipping items
- Equipment stats affecting combat
- Unique 3D ground model for each item
- Rare-drop beam tiers beyond a simple extensible field
- NPC selling and Bell gain
- Storage
- Market or player trade
- Drop penalty by player level
- Party loot rules
- Persistent database inventory
- Auto Battle
- Return Bell

## Acceptance criteria

The SR passes only when the deployed build demonstrates all of the following:

1. Killing Green Slime can produce a server-rolled ground item.
2. Loot appears physically near the monster death point with a short scatter animation.
3. Monster junk/general items use the shared Gift Bag appearance.
4. Small HP Potion and Small SP Potion can drop as recognizable potion bottles, stack separately in inventory, and contribute Weight.
5. Equipment drops use category-readable boxes: Weapon, Body, Shoes, Head, Off-hand, and Accessory.
6. Equipment boxes reveal their slot category but not the exact definition or random options.
7. Refine material is supported as a directly rendered ore/material object rather than a bag or box.
8. A Green Slime Soul can be visually verified as a small Slime-like Soul with a distinct colored aura/glow.
9. The exact equipment identity and random options are stored server-side and are not present in client ground payloads.
10. Desktop can approach and pick up loot through an explicit click/double-click action.
11. Mobile can explicitly pick up nearby loot with a touch-friendly action.
12. Walking near loot alone does not collect it.
13. Server rejects pickup outside range, duplicate pickup, ineligible ownership, full inventory, or excessive Weight.
14. Successful pickup removes the world entity exactly once and adds the item exactly once.
15. Inventory debug UI and Weight update from authoritative server results.
16. A pickup that would exceed 100% Weight is rejected without losing the ground item.
17. Existing movement, targeting, combat, EXP, visual benchmark, and obstacle collision still work.
18. `pnpm typecheck`, `pnpm test`, and `pnpm build` pass.
19. Changes are committed, pushed to `main`, and deployed to Render for user acceptance.

## Delivery notes

Terra must report:

- Implemented drop definitions and configured prototype rates
- Public versus hidden item fields
- Pickup distance, ownership duration, ground lifetime, and Weight configuration
- Validation results
- Remaining limitations
- Commit SHA and deployed URL
