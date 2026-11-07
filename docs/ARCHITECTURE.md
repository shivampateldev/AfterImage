# ARCHITECTURE SPECIFICATION – AFTERIMAGE: THE LAST ECHO

## 1. System Architecture Overview

```mermaid
graph TD
    subgraph Presentation ["Presentation & UI Layer (React 18 + Tailwind + Framer Motion)"]
        UI_App[App.tsx]
        UI_Menu[MainMenu.tsx]
        UI_HUD[GameplayHUD.tsx]
        UI_Modal[LevelCompletionModal.tsx]
        UI_Hub[LearningHub.tsx]
        UI_Ach[AchievementsModal.tsx]
        UI_Stats[StatisticsModal.tsx]
    end

    subgraph Bridge ["Event Communication Bridge"]
        EventBus[GameEventBus.ts]
    end

    subgraph Simulation ["Simulation & Gameplay Core (Phaser 3 Arcade)"]
        Game_Canvas[GameCanvas.tsx]
        Game_Core[PhaserGame.ts]
        Game_Scene[MainGameScene.ts]
        Game_Player[PlayerController.ts]
        Sys_Record[RecordingSystem.ts]
        Sys_Echo[EchoSystem.ts]
        Sys_Puzzle[PuzzleSystem.ts]
        Gen_Asset[AssetGenerator.ts]
    end

    subgraph Services ["Services & Persistence Layer"]
        Svc_Prog[ProgressionService.ts]
        Svc_Store[StorageService.ts]
        Svc_Audio[AudioService.ts]
    end

    subgraph Data ["Declarative Game Data"]
        Data_Levels[levels.ts - 9 Campaign Sectors]
        Data_Questions[questions.ts - 52 Coding Challenges]
        Data_Ach[achievements.ts - 10 Achievements]
    end

    UI_App --> UI_Menu
    UI_App --> UI_HUD
    UI_App --> UI_Modal
    UI_App --> Game_Canvas

    Game_Canvas --> Game_Core
    Game_Core --> Game_Scene

    Game_Scene --> Game_Player
    Game_Scene --> Sys_Record
    Game_Scene --> Sys_Echo
    Game_Scene --> Sys_Puzzle
    Game_Scene --> Gen_Asset

    Game_Scene <--> EventBus
    UI_HUD <--> EventBus
    UI_Modal <--> EventBus

    Game_Scene --> Data_Levels
    UI_Modal --> Data_Questions
    UI_Hub --> Data_Questions

    Sys_Echo --> Svc_Prog
    UI_Modal --> Svc_Prog
    UI_Hub --> Svc_Prog
    Svc_Prog --> Svc_Store
    Svc_Prog --> Data_Ach
    Game_Player --> Svc_Audio
    Sys_Puzzle --> Svc_Audio
```

---

## 2. Core Design Decisions

1. **Separation of Concerns: Phaser vs React**:
   - Phaser 3 owns the canvas rendering, 60 FPS update loop, world collisions, kinematics, and particle systems.
   - React owns high-level UI states: menus, tactical advisory hints, HUD overlays, code challenge evaluation modals, and analytics charts.
   - Decoupled via `GameEventBus`, ensuring zero unnecessary React re-renders during 60 FPS gameplay.

2. **Deterministic Echo Recording (Kinematic Timeline Sampling)**:
   - Rather than relying on non-deterministic physics replay or AI agents, `RecordingSystem` samples player coordinate transforms, velocities, and interaction flags at a fixed 60Hz rate into compact arrays.
   - `EchoSystem` replays these tracks using binary-search timeline sampling and linear interpolation. This guarantees reproducible, glitch-free puzzle solutions across runs.

3. **Sensor-Based Puzzle Triggering**:
   - Echoes do not require physical collision bodies that could push walls or glitch through solid geometry.
   - Instead, echoes interact through dedicated Phaser trigger sensor zones in `PuzzleSystem.ts`.

4. **Educational Integrity ("Learn to Earn")**:
   - No forced advertising, energy timers, or paywalls.
   - Players earn bonus XP by solving output prediction and algorithm challenges across Python, JavaScript, C, C++, and Java.
   - Safe client evaluation: evaluated against canonical answer indices without using unsafe `eval()`.
   - Anti-farming protection: records solved challenge IDs to reward XP only once per question.

5. **Robust Audio via Web Audio API**:
   - Procedural futuristic audio synthesis using `AudioContext` oscillators, envelopes, and gain nodes.
   - Zero external audio file download dependencies, zero latency, and zero broken asset paths.

