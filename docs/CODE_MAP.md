# CODE MAP – AFTERIMAGE: THE LAST ECHO (AN SMP ORIGINAL)
**Engine Version:** Three.js WebGL 2.5D + Rapier 3D WebAssembly Physics  
**Application:** React 18 + TypeScript (Strict Mode)  

---

## 1. System Dependency Matrix

| File Path | Called / Used By | Calls / Depends On | Primary Responsibility | Events Emitted / Handled |
|---|---|---|---|---|
| [`src/main.tsx`](file:///e:/shivam-personal/AFTERIMAGE%20–%20The%20Last%20Echo/src/main.tsx) | `index.html` | `React`, `ReactDOM`, `App.tsx` | React DOM mount root | None |
| [`src/app/App.tsx`](file:///e:/shivam-personal/AFTERIMAGE%20–%20The%20Last%20Echo/src/app/App.tsx) | `main.tsx` | `MainMenu`, `Game25DCanvas`, `GameplayHUD`, `SMPSplashScreen`, `AboutSMPModal`, `SettingsModal`, `LevelCompletionModal` | Root state orchestrator, modal routing, and session state | Listens: `LEVEL_COMPLETED`. Emits: `SET_CURRENT_LEVEL`, `TRIGGER_RESTART` |
| [`src/components/game/Game25DCanvas.tsx`](file:///e:/shivam-personal/AFTERIMAGE%20–%20The%20Last%20Echo/src/components/game/Game25DCanvas.tsx) | `App.tsx` | `Three25DScene.ts`, `GameEventBus.ts` | Mounts and manages WebGL canvas container and Three25DScene lifecycle | Emits/Relays: `TRIGGER_RECORD`, `TRIGGER_REPLAY`, `TRIGGER_RESTART`, `SET_CURRENT_LEVEL` |
| [`src/game/engine/Three25DScene.ts`](file:///e:/shivam-personal/AFTERIMAGE%20–%20The%20Last%20Echo/src/game/engine/Three25DScene.ts) | `Game25DCanvas.tsx` | `Three.js`, `RapierPhysicsWorld`, `SciFiAssetFactory`, `RecordingSystem`, `AudioService`, `GameEventBus` | Authoritative 2.5D game loop, Rapier 3D physics step, kinematic character locomotion, echo replay, camera tracking, and PBR rendering | Emits: `LEVEL_LOADED`, `LEVEL_COMPLETED`. Listens: Keyboard (`A/D/Space/R/E/F`) |
| [`src/game/physics/RapierPhysicsWorld.ts`](file:///e:/shivam-personal/AFTERIMAGE%20–%20The%20Last%20Echo/src/game/physics/RapierPhysicsWorld.ts) | `Three25DScene.ts`, Unit Tests | `@dimforge/rapier3d-compat` (WASM) | Authoritative physics world: gravity, capsule colliders, static platforms, kinematic doors, raycast ground detection, and Z=0 planar locking | None |
| [`src/game/graphics/SciFiAssetFactory.ts`](file:///e:/shivam-personal/AFTERIMAGE%20–%20The%20Last%20Echo/src/game/graphics/SciFiAssetFactory.ts) | `Three25DScene.ts` | `Three.js` | Procedural PBR asset pipeline: industrial platforms, mechanical blast doors, pressure plate pads, switch terminals, humanoid robot character, and facility architecture | None |
| [`src/game/systems/RecordingSystem.ts`](file:///e:/shivam-personal/AFTERIMAGE%20–%20The%20Last%20Echo/src/game/systems/RecordingSystem.ts) | `Three25DScene.ts` | `GameEventBus`, `AudioService` | 60Hz deterministic transform sampling of position, velocity, and animation states | Emits: `RECORDING_STARTED`, `RECORDING_STOPPED`, `RECORDING_UPDATE` |
| [`src/components/branding/SMPLogo.tsx`](file:///e:/shivam-personal/AFTERIMAGE%20–%20The%20Last%20Echo/src/components/branding/SMPLogo.tsx) | `SMPSplashScreen`, `MainMenu`, `AboutSMPModal` | React | Official SMP logo renderer loading `smp-logo.png` with metallic gold vector fallback | None |
| [`src/components/branding/SMPSplashScreen.tsx`](file:///e:/shivam-personal/AFTERIMAGE%20–%20The%20Last%20Echo/src/components/branding/SMPSplashScreen.tsx) | `App.tsx` | `SMPLogo.tsx`, `AudioService` | Animated cinematic intro with light sweep, audio resonance, and skip persistence | None |
| [`src/components/menus/AboutSMPModal.tsx`](file:///e:/shivam-personal/AFTERIMAGE%20–%20The%20Last%20Echo/src/components/menus/AboutSMPModal.tsx) | `App.tsx` | `SMPLogo.tsx` | Dedicated SMP ownership attribution, brand philosophies, and license credits | None |
| [`src/services/progression/ProgressionService.ts`](file:///e:/shivam-personal/AFTERIMAGE%20–%20The%20Last%20Echo/src/services/progression/ProgressionService.ts) | `Three25DScene`, `MainMenu`, `LevelCompletionModal`, `LearningHub` | `StorageService.ts`, `achievements.ts` | XP calculation, milestone checks, anti-farming reward validation, and local persistence | None |

---

## 2. Answers to Architectural Verification Questions

1. **Where does the application start?**  
   In [`src/main.tsx`](file:///e:/shivam-personal/AFTERIMAGE%20–%20The%20Last%20Echo/src/main.tsx) mounting [`src/app/App.tsx`](file:///e:/shivam-personal/AFTERIMAGE%20–%20The%20Last%20Echo/src/app/App.tsx).
2. **Where does the 3D scene initialize?**  
   In [`src/game/engine/Three25DScene.ts`](file:///e:/shivam-personal/AFTERIMAGE%20–%20The%20Last%20Echo/src/game/engine/Three25DScene.ts) via `initThree()` and `initAsync()`.
3. **Where does the camera get configured?**  
   In `Three25DScene.ts`: A perspective camera is placed at $(0, 5, 26)$ and dynamically lerps horizontally along player motion.
4. **Where does player movement happen?**  
   In `Three25DScene.updatePlayerKinematics()` querying inputs and setting linear velocities on the Rapier dynamic rigid body.
5. **Where is physics updated?**  
   In [`src/game/physics/RapierPhysicsWorld.ts`](file:///e:/shivam-personal/AFTERIMAGE%20–%20The%20Last%20Echo/src/game/physics/RapierPhysicsWorld.ts) via `world.step()` with locked rotation and planar constraint ($Z=0$).
6. **Where is ground detection & landing handled?**  
   In `RapierPhysicsWorld.checkGrounded(0.85)` using downward raycasting and coyote time tracking in `Three25DScene.ts`.
7. **Where are pressure plates and doors handled?**  
   In `Three25DScene.updatePuzzles()`: Pressure plate bounds detect overlap with the player and echo clones, triggering smooth door sliding and kinematic collider repositioning.
