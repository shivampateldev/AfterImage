# AFTERIMAGE – THE LAST ECHO
### AN SMP ORIGINAL
> *"Your past self becomes your greatest teammate."*  
> **Brand Philosophy:** *"1% CHANCE. 99% FAITH."*

AFTERIMAGE is a production-quality, cross-platform **2.5D educational puzzle-platformer** set inside an abandoned temporal memory laboratory.

Created and owned exclusively by **SMP**.

---

## 1. Product Identity & SMP Integration

- **Brand Ownership:** AN SMP ORIGINAL
- **Created by:** SMP
- **Official Palette:** Metallic SMP Gold (`#D4A52C`), Deep Navy (`#090A0D`), Temporal Cyan (`#38D9FF`), Echo Violet (`#9875FF`).
- **Cinematic Startup Sequence:** Animated SMP metallic emblem reveal, light sweep, tagline manifestation, and smooth transition to the 2.5D research complex.
- **Dedicated About & Credits Screen:** Accessible from the main menu, displaying comprehensive SMP ownership attribution, game philosophies, and technology credits.
- **Source Logo Placement:** Place the official SMP logo in `public/assets/branding/smp-logo.png`. The game includes an automatic procedural metallic gold vector fallback.

---

## 2. 2.5D Architecture & Technology Stack

- **Rendering Engine:** **Three.js WebGL 2.5D Engine** (`src/game/engine/Three25DScene.ts`)
  - Real 3D geometry with depth platforms, illuminated sensor pads, 3D animated security blast doors, dynamic point lights, and volumetric depth fog.
  - Constrained 2.5D side-scrolling planar kinematics (player locomotion locked to the $XY$ plane at $Z = 0$).
  - Smooth cinematic perspective camera ($45^\circ$ FOV at $Z = 28$).
- **Application & UI:** **React 18**, **Tailwind CSS**, **Framer Motion**, and **Lucide Icons**.
- **Physics & Collisions:** Deterministic 2.5D AABB collision detection and gravity simulation.
- **Core Echo Mechanic:** Fixed-rate 60Hz transform recording with binary search timeline playback and linear interpolation.
- **Educational System ("Learn to Earn"):** 52 validated questions across **Python**, **JavaScript**, **C**, **C++**, and **Java** with zero ads, zero paywalls, and anti-farming XP protection.
- **Audio Engine:** Pure procedural futuristic sound effects synthesized via the **Web Audio API (`AudioContext`)**.
- **Platform Layer:** Cross-platform abstraction in `src/platform/PlatformBridge.ts` supporting Web, Windows Desktop, and Android.

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
Generates production-optimized static assets in `dist/`.

---

## 4. Controls

| Input Key | Mobile Touch Control | Action |
|---|---|---|
| **A / Left Arrow** | Left D-Pad | Move Left |
| **D / Right Arrow** | Right D-Pad | Move Right |
| **Space / Up / W** | Jump Button | Jump |
| **R** | Record Button | Start / Stop Movement Recording |
| **E** | Echo Button | Summon / Replay Temporal Echo Clone |
| **ESC / Menu Button** | Menu Icon | Open Settings / Return to Main Menu |

---

## 5. Campaign Sectors (All 9 Levels Playable)

- **Act 1: The Awakening**
  - *Sector 01: First Signal* (Kinematic locomotion & spatial jumps)
  - *Sector 02: A Second Self* (Movement recording & temporal replay)
  - *Sector 03: Echoes of the Past* (Pressure plate coordination)
- **Act 2: The Experiment**
  - *Sector 04: Locked Memories* (Multi-tiered puzzle decomposition)
  - *Sector 05: Temporal Alignment* (Timed capacitor switches with 5s decay)
  - *Sector 06: Broken Sequence* (Lethal laser field bypass)
- **Act 3: The Collapse**
  - *Sector 07: Parallel Decisions* (Dual simultaneous echo deployment)
  - *Sector 08: The Last Protocol* (Synchronized compound locks)
  - *Sector 09: The Last Echo* (Triple-core overload facility escape)

---

## 6. Comprehensive Technical Documentation

All project architecture, engineering decisions, and quality audits are documented:
- **[`docs/UPGRADE_AUDIT.md`](file:///e:/shivam-personal/AFTERIMAGE%20–%20The%20Last%20Echo/docs/UPGRADE_AUDIT.md)**: Repository audit, baseline assessment, and migration strategy.
- **[`docs/CODE_MAP.md`](file:///e:/shivam-personal/AFTERIMAGE%20–%20The%20Last%20Echo/docs/CODE_MAP.md)**: File-by-file dependency matrix and architectural answers.
- **[`docs/3D_GRAPHICS.md`](file:///e:/shivam-personal/AFTERIMAGE%20–%20The%20Last%20Echo/docs/3D_GRAPHICS.md)**: 2.5D rendering principles, lighting, materials, and camera dynamics.
- **[`docs/PLATFORM_DISTRIBUTION.md`](file:///e:/shivam-personal/AFTERIMAGE%20–%20The%20Last%20Echo/docs/PLATFORM_DISTRIBUTION.md)**: Packaging guides for Web, Windows Desktop, and Android.
- **[`docs/TESTING.md`](file:///e:/shivam-personal/AFTERIMAGE%20–%20The%20Last%20Echo/docs/TESTING.md)**: QA validation and test execution results.
- **[`docs/ASSET_CREDITS.md`](file:///e:/shivam-personal/AFTERIMAGE%20–%20The%20Last%20Echo/docs/ASSET_CREDITS.md)**: Third-party open source licenses and SMP attribution.

---

## 7. Official Copyright Notice

© 2026 SMP. All Rights Reserved.  
*AN SMP ORIGINAL* • *"1% CHANCE. 99% FAITH."*
