# DATA FLOW SPECIFICATION – AFTERIMAGE: THE LAST ECHO

This document details how data and signals flow through the application during each stage of interaction.

---

## 1. Player Input to Movement & Recording

```mermaid
flowchart TD
    A[Keyboard: A/D/Space] --> B[PlayerController.update]
    B --> C[Phaser Arcade Physics: setVelocityX / setVelocityY]
    C --> D[World Collision Solver: Platforms & Obstacles]
    
    E[Key: R] --> F[RecordingSystem.startRecording / stopRecording]
    F --> G{Is Recording Active?}
    G -- Yes --> H[Record Sample: x, y, vx, vy, animState, timeOffset]
    G -- No --> I[Finalize Track -> EchoSystem.storeRecordedTrack]
    H --> J[GameEventBus: RECORDING_UPDATE]
    J --> K[GameplayHUD: Update Live Recording Bar]
```

---

## 2. Echo Playback to Puzzle Activation Flow

```mermaid
flowchart TD
    A[Key: E or Summon Button] --> B[EchoSystem.spawnEchoFromLastRecording]
    B --> C[Instantiate Echo Ghost Sprite]
    C --> D[MainGameScene.update loop]
    D --> E[EchoSystem.update: Linear Interpolation along Timeline]
    E --> F[PuzzleSystem.checkCollisions]
    
    F --> G{Echo overlapping Pressure Plate?}
    G -- Yes --> H[Plate set to Active State]
    H --> I[PuzzleSystem checks Target Door requirements]
    I --> J{All requirements met?}
    J -- Yes --> K[Tween Door Sprite to Open Position & Disable Collider]
    J -- No --> L[Door remains locked]
    
    F --> M{Echo overlapping Switch?}
    M -- Yes --> N[Toggle / Timed Switch activated]
    N --> I
```

---

## 3. Level Completion, Educational Challenge & Progression Flow

```mermaid
flowchart TD
    A[Player touches Exit Portal] --> B[MainGameScene.handleLevelComplete]
    B --> C[AudioService: playLevelSuccess]
    B --> D[GameEventBus: LEVEL_COMPLETED]
    D --> E[App.tsx switches state: Show LevelCompletionModal]
    
    E --> F[ProgressionService.completeLevel]
    F --> G[Calculate Earned XP: Base + Efficiency + No-Hint Bonus]
    F --> H[Check Milestone Achievements: ach_first_steps, etc.]
    F --> I[StorageService.savePlayerStats: Persist to localStorage]
    
    E --> J[Optional: Player clicks Code Bonus tab]
    J --> K[Select Multiple Choice Option]
    K --> L[ProgressionService.recordQuestionResult]
    L --> M{Is Answer Correct?}
    M -- Yes --> N[Award Challenge XP if not already claimed]
    M -- No --> O[Record Incorrect Attempt for Analytics]
    N --> P[Update Mastered Concepts & Re-evaluate Polyglot Achievements]
    O --> I
    P --> I
```

