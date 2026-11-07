# ARCHITECTURE & SUBSYSTEM COUPLING
**Project:** AFTERIMAGE – THE LAST ECHO | AN SMP ORIGINAL ("1% CHANCE. 99% FAITH.")  
**Date:** 2026-11-07  

---

## 1. System Dependency Flow

```mermaid
flowchart TD
    subgraph UI ["React Application & UI Layer"]
        A[App.tsx] --> B[GameView.tsx]
        B --> C[Game25DCanvas.tsx]
        B --> D[GameHud.tsx]
        B --> E[LevelCompletionModal.tsx]
        B --> F[LearningHub.tsx]
    end

    subgraph Core ["Engine & Scene Graph Hierarchy"]
        C -->|Instantiates & Mounts| G[Three25DScene.ts]
        G --> H1[BackgroundGroup: Z=-16 to -12]
        G --> H2[ArchitectureGroup: Z=-7 to -4]
        G --> H3[GameplayGroup: Z=0]
        G --> H4[InteractiveGroup: Z=0]
        G --> H5[CharacterGroup: Z=0]
        G --> H6[EffectsGroup: Z=0 to +1]
        G --> H7[DebugGroup: Wireframes]
    end

    subgraph Assets ["Asset & Model Pipeline"]
        G --> I[ModelAssetPipeline.ts]
        I -->|Binary GLB| J1[player_explorer.glb]
        I -->|Binary GLB| J2[tree_ancient.glb]
        I -->|Binary GLB| J3[door_bulkhead.glb]
        I -->|Binary GLB| J4[terminal_console.glb]
        G --> K[SciFiAssetFactory.ts]
        G --> L[NatureAssetFactory.ts]
        K --> M[TextureGenerator.ts]
        L --> M
    end

    subgraph Phys ["Authoritative Physics & Dynamics"]
        G --> N[RapierPhysicsWorld.ts]
        N -->|WebAssembly| O[@dimforge/rapier3d-compat]
        N -->|Sub-stepped Delta 60Hz| P[Accumulator & CCD]
        N -->|Planar 2.5D Lock| Q[Constraint: Z=0, linvel.z=0]
    end

    subgraph EchoSys ["Temporal Echo & Input Subsystems"]
        G --> R[RecordingSystem.ts]
        R -->|State Machine| S[IDLE -> RECORDING -> RECORDED -> REPLAYING]
        R -->|60Hz Timestamped Samples| T[EchoSample Array]
        G -->|Interaction Dispatcher| U[Switches, Plates, Bulkhead Doors]
        G --> V[AudioService.ts: Web Audio Procedural Synthesis]
        G --> W[GameEventBus.ts]
        W -.->|State & Events| UI
    end
```

---

## 2. Subsystem Ownership & Responsibilities

1. **`Game25DCanvas.tsx`**:
   - Manages the WebGL DOM container and the React component lifecycle.
   - Enforces React Strict Mode mount/unmount safety via explicit cancellation token (`isCancelled`) and async teardown.
   - Connects `GameEventBus` signals (`TRIGGER_RECORD`, `TRIGGER_REPLAY`, `SET_CURRENT_LEVEL`) directly to `Three25DScene`.

2. **`Three25DScene.ts`**:
   - Core 2.5D orchestrator. Owns Three.js rendering, lighting, camera interpolation, input polling, and puzzle logic.
   - Enforces the 7 semantic scene graph layers (`backgroundGroup`, `architectureGroup`, `gameplayGroup`, `interactiveGroup`, `characterGroup`, `effectsGroup`, `debugGroup`).
   - Dispatches player and echo interactions (`KeyF` / `Enter` / recorded `isInteracting`) to puzzle elements.

3. **`RapierPhysicsWorld.ts`**:
   - The authoritative physics simulation.
   - Prevents player jitter and tunneling via 60Hz sub-stepping accumulator and Continuous Collision Detection (CCD).
   - Constrains all dynamic motion to $Z = 0.0$.
   - Provides raycast ground detection with $0.85\text{m}$ reach for stable jumping and coyote time.
   - Provides collider geometry metadata for runtime physics debugging (`F1` / `~`).

4. **`RecordingSystem.ts`**:
   - Deterministic temporal memory recording.
   - Operates a formal 6-state machine: `IDLE`, `RECORDING`, `RECORDED`, `REPLAYING`, `COMPLETED`, `CANCELLED`.
   - Records player coordinates, velocity, facing direction, jump/run state, and environmental interaction events at 60Hz.

5. **`ModelAssetPipeline.ts` & Asset Factories**:
   - Asynchronously loads binary GLB 3D assets with internal memory caching.
   - Fallbacks to procedural PBR assets (`SciFiAssetFactory`, `NatureAssetFactory`, `TextureGenerator`) if network/local GLB loading fails.
