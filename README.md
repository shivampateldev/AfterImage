# AFTERIMAGE – THE LAST ECHO
> *"Your past self becomes your greatest teammate."*

A 2D educational puzzle-platformer built with **TypeScript**, **Phaser 3**, **React 18**, **Tailwind CSS**, and **Framer Motion**.

---

## 1. Game Concept

Set within an abandoned futuristic research facility where temporal memory experiments went catastrophically wrong, you possess the ability to record snapshots of your previous actions and manifest them as translucent **echoes**.

Coordinate with your past selves to:
- Depress heavy magnetic pressure plates.
- Synchronize with fleeting capacitor switches.
- Bypass electrified laser fields.
- Coordinate multiple simultaneous timelines.
- Escape the 9 chambers of the research complex.

### Educational Pillar: "Learn to Earn"
AFTERIMAGE contains **no advertisements, no forced video gates, no paid hints, and no artificial cooldown timers**. Instead, players can test and expand their computer science knowledge through **output prediction and algorithmic challenges** across **Python, JavaScript, C, C++, and Java** to earn bonus XP and unlock neural upgrades.

---

## 2. Technology Stack

- **Game Engine & Kinematics**: Phaser 3 (Arcade Physics, Canvas/WebGL rendering)
- **UI & Presentation**: React 18, Tailwind CSS, Framer Motion, Lucide Icons
- **Language**: TypeScript 5.7+ (Strict mode)
- **Audio**: Web Audio API (Synthesized procedural futuristic SFX)
- **Persistence**: LocalStorage with schema versioning and validation
- **Build & Dev Tooling**: Vite 5, Vitest

---

## 3. Quickstart & Local Development

### Prerequisites
- Node.js `v18+` or `v20+` (Tested on Node v24)
- `pnpm` or `npm`

### Installation
```bash
# Install dependencies
pnpm install
```

### Running Locally
```bash
# Start Vite development server
pnpm dev
```
Open your browser at `http://localhost:3000`.

### Running Unit Tests
```bash
# Run Vitest test suite
pnpm test
```

### Building for Production
```bash
# Run TypeScript type check and production bundle
pnpm build
```
The compiled output is output to `dist/`.

---

## 4. Controls

| Input Key | Mobile Touch Control | Action |
|---|---|---|
| **A / Left Arrow** | On-screen Left D-Pad | Move Left |
| **D / Right Arrow** | On-screen Right D-Pad | Move Right |
| **Space / Up Arrow / W** | Jump Button | Jump |
| **R** | Record Button | Start / Stop Timeline Recording |
| **E** | Echo Button | Summon / Replay Temporal Echo |
| **ESC / Menu Button** | Menu Icon | Return to Operations Menu |

---

## 5. Campaign Level Overview

| Act | Sector | Name | Mechanics Introduced |
|---|---|---|---|
| **Act 1: The Awakening** | Sector 01 | First Signal | Kinematic locomotion and jump traversal |
| | Sector 02 | A Second Self | Movement recording & echo playback |
| | Sector 03 | Echoes of the Past | Pressure plates requiring sustained physical presence |
| **Act 2: The Experiment** | Sector 04 | Locked Memories | Multi-tiered switch decomposition |
| | Sector 05 | Temporal Alignment | Rapid capacitor switches with 5-second decay timers |
| | Sector 06 | Broken Sequence | High-voltage laser fields and remote bridges |
| **Act 3: The Collapse** | Sector 07 | Parallel Decisions | Dual-echo concurrency (2 simultaneous temporal clones) |
| | Sector 08 | The Last Protocol | Compound puzzles combining lasers, timed triggers & doors |
| | Sector 09 | The Last Echo | Final temporal core overload puzzle |

---

## 6. How Systems Work

### The Echo Mechanic
When you press `R`, the `RecordingSystem` samples your kinematics at 60Hz:
```ts
{ timeOffset, x, y, vx, vy, flipX, animState, isInteracting }
```
When you summon an echo with `E`, the `EchoSystem` creates an ethereal clone that traverses along your sampled timeline using binary search interpolation, allowing deterministic recreation of movements.

### Pressure Plates and Doors
Pressure plates register overlap collisions for both the player and active echoes. When an echo steps on a plate, the linked security blast door opens smoothly via tweens, disabling its collision barrier.

### Learn to Earn
A collection of 52 verified programming challenges are stored in `src/data/questions.ts`. Players evaluate code output directly in the HUD or in the dedicated Neural Code Lab. XP is awarded once per challenge to prevent farming.

---

## 7. Project Documentation

Comprehensive technical documentation is provided in the `docs/` folder:
- **[`docs/CODE_MAP.md`](file:///e:/shivam-personal/AFTERIMAGE%20–%20The%20Last%20Echo/docs/CODE_MAP.md)**: Detailed dependency matrix, file call graph, and FAQ.
- **[`docs/ARCHITECTURE.md`](file:///e:/shivam-personal/AFTERIMAGE%20–%20The%20Last%20Echo/docs/ARCHITECTURE.md)**: System design and architectural decisions.
- **[`docs/DATA_FLOW.md`](file:///e:/shivam-personal/AFTERIMAGE%20–%20The%20Last%20Echo/docs/DATA_FLOW.md)**: Sequence diagrams and data persistence flows.

---

## 8. License

MIT License. Designed and developed for educational mastery and temporal puzzle adventure.

