# AFTERIMAGE – THE LAST ECHO
### AN SMP ORIGINAL
> *"Your past self becomes your greatest teammate."*  
> **Brand Philosophy:** *"1% CHANCE. 99% FAITH."*

AFTERIMAGE is a production-quality, cross-platform **cinematic 2.5D educational puzzle-platformer** set inside an overgrown, abandoned research facility.

Created and owned exclusively by **SMP**.

---

## 1. Visual & Environmental Art Direction

Inspired by atmospheric narrative platformers (*INSIDE*, *Planet of Lana*, *Little Nightmares*), AFTERIMAGE replaces sterile, dark polygon boxes with a rich, overgrown science-fiction world where industrial technology and reclaimed nature coexist:
- **Multi-Layered Depth Staging:**
  - *Far Background ($Z = -16$):* Distant misty silhouettes and cavernous facility architecture.
  - *Midground ($Z = -7$ to $-4.5$):* Weathered concrete walls, climbing ivy vines, ancient roots, structural gantry arches, and conduit pipes.
  - *Gameplay Plane ($Z = 0$):* Heavy industrial platforms with steel curb edging, mechanical blast doors with locking teeth, glowing pressure plates, and switch consoles.
  - *Foreground ($Z = +1.5$ to $+2.5$):* Mossy boulders and fern undergrowth creating cinematic depth-of-field separation.
- **PBR Surface Textures:**
  - Procedural seamless texture maps for aged concrete, corroded steel with rust oxidation, overgrown soil with moss clusters, and fibrous tree bark (`src/game/graphics/TextureGenerator.ts`).
- **Articulated Humanoid Explorer:**
  - Proportioned character with exploratory parka, SMP gold pauldrons, atmospheric life-support backpack, cybernetic visor, and procedural running/jumping limb animations.
  - Spectral, translucent echo duplicate with violet/cyan emissive glow.
- **Cinematic Atmospheric Lighting:**
  - Ambient base fill (`0x1a273e`), soft-shadowed directional key lighting (`0x38d9ff`), warm SMP gold rim lights (`0xd4a52c`), player reactor illumination, and exponential volumetric depth fog.

---

## 2. Rapier 3D WebAssembly Physics Engine

- Authoritative rigid-body physics simulation running at a fixed 60Hz rate via `@dimforge/rapier3d-compat`.
- Dynamic Capsule collider with Continuous Collision Detection (`setCcdEnabled(true)`) to prevent platform tunneling.
- Strict 2.5D planar constraint locking position and velocity along the $Z = 0$ axis.
- Downward raycasting ground detection with **Coyote Time (100ms)** and **Jump Buffering (120ms)** for responsive game feel.
- Kinematic position-based blast doors that block movement when closed and lift cleanly when puzzles are solved.

---

## 3. Quickstart & Local Development

### Prerequisites
- Node.js `v18+` or `v20+` (Tested on Node v24)
- `pnpm` (Recommended) or `npm`

### Installation
```bash
pnpm install
```

### Running Locally
```bash
pnpm dev
```
Open `http://localhost:3000` in any modern web browser.

### Running Automated Tests
```bash
pnpm test
```

### Building for Production
```bash
pnpm build
```

---

## 4. Comprehensive Documentation Suite

- **[`docs/ASSET_CATALOG.md`](file:///e:/shivam-personal/AFTERIMAGE%20–%20The%20Last%20Echo/docs/ASSET_CATALOG.md)**: Asset hierarchy, procedural PBR texture generators, and CC0 licensing registry.
- **[`docs/VISUAL_QUALITY_REVIEW.md`](file:///e:/shivam-personal/AFTERIMAGE%20–%20The%20Last%20Echo/docs/VISUAL_QUALITY_REVIEW.md)**: Art direction analysis and Level 02 (*A Second Self*) vertical slice walkthrough.
- **[`docs/PHYSICS_SYSTEM.md`](file:///e:/shivam-personal/AFTERIMAGE%20–%20The%20Last%20Echo/docs/PHYSICS_SYSTEM.md)**: Rapier 3D rigid-body kinematics, capsule colliders, and planar constraints.
- **[`docs/LIFECYCLE_AND_INITIALIZATION_FIX.md`](file:///e:/shivam-personal/AFTERIMAGE%20–%20The%20Last%20Echo/docs/LIFECYCLE_AND_INITIALIZATION_FIX.md)**: Asynchronous WASM initialization, React Strict Mode cancellation guards, and idempotent disposal.
- **[`docs/PLATFORM_DISTRIBUTION.md`](file:///e:/shivam-personal/AFTERIMAGE%20–%20The%20Last%20Echo/docs/PLATFORM_DISTRIBUTION.md)**: Cross-platform packaging guide for Web, Windows, and Android.
- **[`docs/CODE_MAP.md`](file:///e:/shivam-personal/AFTERIMAGE%20–%20The%20Last%20Echo/docs/CODE_MAP.md)**: Dependency matrix and architectural call graph.
