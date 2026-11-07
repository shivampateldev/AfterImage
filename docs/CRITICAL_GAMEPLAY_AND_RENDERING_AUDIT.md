# CRITICAL GAMEPLAY, PHYSICS & RENDERING AUDIT
**Project:** AFTERIMAGE – THE LAST ECHO | AN SMP ORIGINAL  
**Audit Date:** 2026-11-07  
**Status:** In Progress / Systematic Remediation  

---

## 1. Executive Summary & Root Cause Matrix

A full source code and pipeline audit was conducted across the physics simulation, 3D graphics rendering, scene graph hierarchy, asset generator, input management, and echo playback systems.

The investigation revealed 9 critical technical flaws causing the visual and gameplay defects:

| ID | Domain | Root Cause | Affected File(s) | Impact |
|---|---|---|---|---|
| **ISS-01** | **Scene Graph & Depth** | Unstratified scene graph; random foreground/midground objects added to `this.scene` root without semantic layers. Duplicated nature elements at $Z=+1.8$ clipping and occluding gameplay plane ($Z=0$). | `Three25DScene.ts`, `SciFiAssetFactory.ts` | Disconnected floating objects, strange foreground occlusions, lack of visual depth hierarchy. |
| **ISS-02** | **Lighting & Rendering** | Extreme dark background (`0x0c131e`), heavy exponential fog (`FogExp2` at 0.015), over-saturated blue directional light, and low ambient fill causing environment meshes to appear as black silhouettes. | `Three25DScene.ts` | Scene appears as pitch-black void with silhouette boxes instead of readable facility architecture. |
| **ISS-03** | **Interactive Puzzle Triggering** | Switch interaction check `playerBounds.intersectsBox` was never called in `updatePuzzles()`, and `KeyF` / `Enter` interaction was ignored for switches; only plates were checked! | `Three25DScene.ts` (`updatePuzzles`) | Switches could NEVER be toggled by the player, breaking puzzle progression in Level 02! |
| **ISS-04** | **Echo Interaction System** | Echoes only checked collisions against pressure plates; echoes never interacted with switches or activated consoles during replay. | `Three25DScene.ts` (`updatePuzzles`, `updateEchoes`) | Echo could not trigger switches or coordinate actions, breaking core gameplay philosophy. |
| **ISS-05** | **Physics Plane Drift & Fixed Timestep** | Timestep variable `dt` was passed straight from RAF without fixed accumulator sub-stepping, allowing variable physics integration and micro-jitter. | `Three25DScene.ts`, `RapierPhysicsWorld.ts` | Jittery landing, platform clipping risks on frame drops. |
| **ISS-06** | **Collider vs Geometry Misalignment** | Platform collider depth was 4.0 but visual models had curb rails at $+2.0$ without ground alignment; player capsule offset was manually adjusted with arbitrary magic numbers (`-0.75`). | `Three25DScene.ts`, `RapierPhysicsWorld.ts` | Player feet floating above platforms or sinking into ground; jump instability. |
| **ISS-07** | **Input State Loss & Focus** | Key listeners attached directly to `window` with no focus tracking or event filtering; browser default scrolling on `Space`/Arrows not suppressed (`e.preventDefault()`). | `Three25DScene.ts` (`initInputs`) | Space bar causes viewport scroll/stutter; keys get stuck down if focus shifts to UI. |
| **ISS-08** | **Tree & Asset Silhouettes** | Tree canopy constructed from 3 giant low-poly `DodecahedronGeometry` meshes (2.8m - 4.0m) creating black blob silhouettes instead of layered organic branches and foliage. | `NatureAssetFactory.ts`, `generate-game-assets.cjs` | Trees look like dark polygonal blob monsters rather than atmospheric nature reclamation. |
| **ISS-09** | **Physics Debugging Missing** | No visual collider debug rendering or ground ray visualization existed to verify Rapier colliders vs Three.js meshes. | `Three25DScene.ts` | Impossible to visually diagnose collider alignment, sensor zones, and raycast hits in runtime. |

---

## 2. Detailed Technical Issue Breakdown

### Issue 1: Switch Activation Logic Completely Missing
- **Root Cause:** In `Three25DScene.ts`, lines 627-695 define `updatePuzzles(dt)`. It iterates through `this.plates` and updates plate state, and checks timed switch countdowns, but **never checks player proximity or interaction for switches**. When player presses `KeyF` or `Enter`, `reqInteraction` is set to `true`, but `updatePuzzles` never evaluated it against `sw.bounds`!
- **Reproduction:** Walk up to switch console in Level 02, press `F` or `Enter`. Nothing happens. Door never opens.
- **Solution:** Add explicit player and echo interaction evaluation in `updatePuzzles()`, checking if player is within `sw.bounds` and `reqInteraction` is true. Also evaluate echo `sample.isInteracting` when replaying.

### Issue 2: Echo Cannot Interact with Switches
- **Root Cause:** `RecordingSystem.ts` captured `isInteracting: boolean`, but during replay in `Three25DScene.ts`, only plate bounds intersection was calculated. The echo's recorded interaction was never applied to toggle switches.
- **Reproduction:** Record player pressing `F` at a switch. Replay echo with `E`. Echo walks past switch without triggering it.
- **Solution:** In `updateEchoes()`, when an active echo sample has `isInteracting === true`, find any switch within reach of the echo's bounds and activate it.

### Issue 3: Incoherent Scene Graph & Z-Depth Coordinates
- **Root Cause:** All scene objects (background mountains, back wall, gantry columns, trees, platforms, hazard lasers, switches, doors, exit portal, and foreground boulders) were added indiscriminately to `this.scene`. Random foreground boulders were placed at $Z = +1.8$ directly in front of the camera, occluding the player and platforms.
- **Reproduction:** Observe gameplay screenshot where black boulder shapes appear in the foreground blocking the player view.
- **Solution:** Reconstruct the scene graph using distinct semantic `THREE.Group` instances with strict coordinate depth layering:
  - `backgroundGroup` ($Z = -18$ to $-12$)
  - `architectureGroup` ($Z = -7$ to $-4$)
  - `gameplayGroup` ($Z = 0$, strictly aligned with Rapier colliders)
  - `interactiveGroup` ($Z = 0$, switches, plates, doors)
  - `characterGroup` ($Z = 0$, player and echoes)
  - `foregroundGroup` ($Z = +3.5$ to $+5.0$, subtle depth framing, strictly out of character movement line of sight)
  - `effectsGroup` ($Z = 0$ to $+1$)

### Issue 4: Black Silhouettes & Unreadable Lighting
- **Root Cause:** Background color set to `#0c131e` with dense fog, while key light was a high-intensity cyan directional light ($1.7$) that blew out cyan areas while leaving unlit surfaces in near-total darkness. Ambient light was too weak and too blue ($0x233148$, intensity 1.4).
- **Reproduction:** Scene rendered with pitch-black environment walls and unreadable platforms.
- **Solution:**
  - Background color adjusted to soft twilight atmosphere (`0x1a2333`).
  - Fog adjusted to subtle linear depth fog (`THREE.Fog(0x1a2333, 18, 55)`).
  - Add soft hemispheric environment fill (Sky: `0x7eb6e8`, Ground: `0x3a2c20`, intensity 1.2).
  - Key warm sun directional light (Intensity 1.8, warm sunlight `0xfff2dc`).
  - Cool cyan atmospheric fill from opposite angle (Intensity 0.9, `0x38d9ff`).
  - Balanced tone mapping exposure ($1.35$) and standard sRGB encoding.

### Issue 5: Physics Timestep & Character Controller Stability
- **Root Cause:** `physics.step(dt)` directly took variable RAF `dt`. Furthermore, player jump velocity was hardcoded at $13.0$ with linear drag lerp, without fixed-timestep physics accumulation.
- **Reproduction:** Rapid FPS fluctuations caused variable jump heights and potential missed collisions.
- **Solution:** Implement a fixed timestep accumulator (e.g. $1/60\text{s} = 0.0166\text{s}$) with max sub-steps ($3$), locking player $Z = 0$, and providing exact physics capsule height alignment.

---

## 3. Action Plan & Systematic Remediation Steps

1. **Phase 2 (Scene Graph & Depth):** Group architecture into semantic groups with documented Z-conventions. Remove stray foreground boulders blocking gameplay.
2. **Phase 3 (Authoritative Physics & Debug Mode):** Add runtime wireframe physics debugger toggled with `F1` / `Backquote`. Fix collider alignments and fixed accumulator timestep.
3. **Phase 4 (Input & Interaction):** Prevent default on gameplay keys (`Space`, `Arrows`), implement proper focus safety, and bind interaction (`KeyF`, `Enter`, `KeyE`).
4. **Phase 5 (Echo System Repair):** Formalize echo state machine (`IDLE`, `RECORDING`, `RECORDED`, `REPLAYING`, `COMPLETED`), enable echo switch triggering, and add comprehensive unit tests.
5. **Phase 6 & 7 (Environment & Lighting Rebuild):** Reconstruct trees with natural trunk/branch branching and fine instanced leaf foliage; warm balanced lighting; distinct material readability.
6. **Phase 8 & 9 (Asset & Character Verification):** Ensure Explorer character model has proper rig/scale, feet resting on platform surface.
7. **Phase 10 & 11 (Level 02 End-to-End Walkthrough):** Test Level 02 end-to-end: Player spawn -> movement -> jump -> record timeline -> switch activation -> stop recording -> replay echo -> echo flips switch -> door opens -> player advances to exit -> level completes.
8. **Phase 12-15 (Testing, Performance & Documentation):** Add unit tests for echo state machine, inputs, and switch interaction. Update all docs and architecture diagrams.
