# Nekoria Development Rules

Before implementing gameplay or visuals, read:

- `docs/GAME_DESIGN.md`
- `docs/ART_DIRECTION.md`
- approved references in `docs/references/`

Do not replace the approved Nekoria direction with generic chibi, realistic fantasy, or generic mobile MMORPG styling. Placeholder assets are allowed, but camera, scale, proportions, colors, and presentation must move toward the approved references.

Work incrementally: implement and test one system at a time. Keep the server authoritative, keep realtime simulation outside React state, and do not implement future systems unless explicitly requested.

Controls must be designed for desktop and mobile browsers. Keep the HUD responsive and touch targets usable without covering the central play area.

