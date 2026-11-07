import { LevelConfig } from '../types';

export const CAMPAIGN_LEVELS: LevelConfig[] = [
  // --- ACT 1: THE AWAKENING ---
  {
    id: 1,
    act: 1,
    actTitle: 'ACT 1 – THE AWAKENING',
    title: 'First Signal',
    description: 'Awaken in Sector 01. Test movement systems and reach the decontamination gate.',
    learningFocus: 'Observation & Traversal: Basic kinematic movement, jump height awareness, and environment navigation.',
    reflectionQuestion: 'Did you observe any obstacles you could not pass without vertical momentum?',
    spawnPoint: { x: 100, y: 480 },
    exitPoint: { x: 880, y: 480 },
    maxRecordingDurationSeconds: 8,
    maxActiveEchoes: 1,
    targetTimeSeconds: 20,
    platforms: [
      // Ground
      { x: 0, y: 550, width: 960, height: 50 },
      // Step platforms
      { x: 300, y: 460, width: 140, height: 20 },
      { x: 520, y: 380, width: 160, height: 20 },
      { x: 740, y: 460, width: 120, height: 20 },
    ],
    pressurePlates: [],
    switches: [],
    doors: [],
    hints: [
      'Use A/D or Left/Right arrows to move horizontally.',
      'Press Space to jump across elevated facility ledges.',
      'Head towards the glowing cyan exit terminal on the far right.'
    ]
  },
  {
    id: 2,
    act: 1,
    actTitle: 'ACT 1 – THE AWAKENING',
    title: 'A Second Self',
    description: 'The recording apparatus engages. Create your first temporal echo to survey unreachable heights.',
    learningFocus: 'Sequencing: Actions recorded in the past replay faithfully in sequence.',
    reflectionQuestion: 'How does creating a clone change your perspective on single-agent limitations?',
    spawnPoint: { x: 80, y: 480 },
    exitPoint: { x: 880, y: 220 },
    maxRecordingDurationSeconds: 8,
    maxActiveEchoes: 1,
    targetTimeSeconds: 30,
    platforms: [
      // Main floor
      { x: 0, y: 550, width: 450, height: 50 },
      // Pit separation
      { x: 580, y: 550, width: 380, height: 50 },
      // High ledge
      { x: 720, y: 290, width: 240, height: 20 },
      // Mid platform
      { x: 350, y: 420, width: 120, height: 20 },
    ],
    pressurePlates: [],
    switches: [
      { id: 'sw_1', x: 260, y: 530, type: 'toggle', targetDoorId: 'door_1' }
    ],
    doors: [
      { id: 'door_1', x: 720, y: 170, width: 24, height: 120, openOffset: { x: 0, y: -120 } }
    ],
    hints: [
      'Press R to begin recording your timeline. A temporal aura will envelop you.',
      'Walk over and interact with the wall console switch, then press R again to save your echo.',
      'Press E to replay your echo. Watch your past self trigger the circuit while you advance!'
    ]
  },
  {
    id: 3,
    act: 1,
    actTitle: 'ACT 1 – THE AWAKENING',
    title: 'Echoes of the Past',
    description: 'A magnetic lock requires sustained mass on a pressure plate. A single human cannot be in two places at once... or can they?',
    learningFocus: 'Cause & Effect & Holding State: An echo can provide continuous presence on sensors.',
    reflectionQuestion: 'Why did the door shut as soon as you stepped off? How did your echo solve this continuous condition?',
    spawnPoint: { x: 80, y: 480 },
    exitPoint: { x: 900, y: 480 },
    maxRecordingDurationSeconds: 10,
    maxActiveEchoes: 1,
    targetTimeSeconds: 35,
    platforms: [
      { x: 0, y: 550, width: 960, height: 50 },
      { x: 400, y: 380, width: 180, height: 20 },
    ],
    pressurePlates: [
      { id: 'plate_1', x: 280, y: 540, width: 80, height: 10, targetDoorId: 'door_main' }
    ],
    switches: [],
    doors: [
      { id: 'door_main', x: 700, y: 430, width: 24, height: 120, openOffset: { x: 0, y: -120 } }
    ],
    hints: [
      'Notice the pressure plate on the floor. Standing on it opens the security blast door.',
      'Press R to record: walk onto the pressure plate and stand firmly on it for 5-6 seconds.',
      'Press R to stop recording, then run close to the door. Press E to replay: your echo will stand on the plate while you walk through!'
    ]
  },

  // --- ACT 2: THE EXPERIMENT ---
  {
    id: 4,
    act: 2,
    actTitle: 'ACT 2 – THE EXPERIMENT',
    title: 'Locked Memories',
    description: 'Dual security containment. Synchronize switches across multiple tiers.',
    learningFocus: 'Problem Decomposition: Dividing a compound puzzle into separate spatial and temporal sub-tasks.',
    reflectionQuestion: 'Did you plan where your echo was going before hitting the record button?',
    spawnPoint: { x: 80, y: 480 },
    exitPoint: { x: 880, y: 150 },
    maxRecordingDurationSeconds: 10,
    maxActiveEchoes: 1,
    targetTimeSeconds: 40,
    platforms: [
      { x: 0, y: 550, width: 960, height: 50 },
      { x: 180, y: 420, width: 200, height: 20 },
      { x: 500, y: 310, width: 240, height: 20 },
      { x: 760, y: 220, width: 200, height: 20 },
    ],
    pressurePlates: [
      { id: 'plate_lower', x: 260, y: 410, width: 70, height: 10, targetDoorId: 'door_upper' }
    ],
    switches: [
      { id: 'sw_tier1', x: 600, y: 290, type: 'toggle', targetDoorId: 'door_exit' }
    ],
    doors: [
      { id: 'door_upper', x: 480, y: 210, width: 20, height: 100, openOffset: { x: 0, y: -100 } },
      { id: 'door_exit', x: 840, y: 120, width: 20, height: 100, openOffset: { x: 0, y: -100 } }
    ],
    hints: [
      'The upper door is wired to the pressure plate on the first ledge.',
      'Record your echo walking onto that pressure plate and waiting.',
      'While your echo holds the plate, navigate through the opened door to toggle the switch that unlocks the final exit.'
    ]
  },
  {
    id: 5,
    act: 2,
    actTitle: 'ACT 2 – THE EXPERIMENT',
    title: 'Temporal Alignment',
    description: 'Capacitor switches discharge quickly. Precision timing between you and your past echo is mandatory.',
    learningFocus: 'Temporal Synchronization: Coordinating real-time action with a pre-recorded timeline.',
    reflectionQuestion: 'How crucial was the pause buffer before your echo hit the timed switch?',
    spawnPoint: { x: 80, y: 480 },
    exitPoint: { x: 900, y: 480 },
    maxRecordingDurationSeconds: 12,
    maxActiveEchoes: 1,
    targetTimeSeconds: 45,
    platforms: [
      { x: 0, y: 550, width: 960, height: 50 },
      { x: 150, y: 390, width: 140, height: 20 },
      { x: 400, y: 460, width: 160, height: 20 },
    ],
    pressurePlates: [],
    switches: [
      // Timed switch lasts 5 seconds
      { id: 'sw_timed', x: 200, y: 370, type: 'timed', durationSeconds: 5, targetDoorId: 'door_timed' }
    ],
    doors: [
      { id: 'door_timed', x: 680, y: 430, width: 24, height: 120, openOffset: { x: 0, y: -120 } }
    ],
    hazards: [
      { x: 420, y: 535, width: 140, height: 15, type: 'laser' }
    ],
    hints: [
      'The console switch only stays active for 5 seconds before closing!',
      'Record yourself jumping up and flipping the timed switch.',
      'Position yourself near the door before triggering replay (E), then sprint through as soon as your echo triggers the console.'
    ]
  },
  {
    id: 6,
    act: 2,
    actTitle: 'ACT 2 – THE EXPERIMENT',
    title: 'Broken Sequence',
    description: 'A shattered laboratory sector with high-voltage laser barriers blocking direct traversal.',
    learningFocus: 'Hazard Avoidance & Multi-Phase Planning: Disabling defense grids from remote control nodes.',
    reflectionQuestion: 'What steps did you take to eliminate risk while testing the switch sequence?',
    spawnPoint: { x: 80, y: 480 },
    exitPoint: { x: 880, y: 220 },
    maxRecordingDurationSeconds: 12,
    maxActiveEchoes: 1,
    targetTimeSeconds: 50,
    platforms: [
      { x: 0, y: 550, width: 400, height: 50 },
      { x: 560, y: 550, width: 400, height: 50 },
      { x: 200, y: 380, width: 150, height: 20 },
      { x: 500, y: 380, width: 150, height: 20 },
      { x: 700, y: 280, width: 260, height: 20 },
    ],
    hazards: [
      { x: 400, y: 535, width: 160, height: 15, type: 'laser' }
    ],
    pressurePlates: [
      { id: 'plate_bypass', x: 250, y: 370, width: 60, height: 10, targetBridgeId: 'bridge_energy' }
    ],
    switches: [
      { id: 'sw_final', x: 560, y: 360, type: 'toggle', targetDoorId: 'door_exit_6' }
    ],
    doors: [
      { id: 'door_exit_6', x: 820, y: 160, width: 24, height: 120, openOffset: { x: 0, y: -120 } }
    ],
    hints: [
      'The floor hazard is lethal. Do not jump down into the laser pit!',
      'Record an echo to hold the upper bypass plate, which extends a safe path across.',
      'Cross to the right station, toggle the door terminal, and escape.'
    ]
  },

  // --- ACT 3: THE COLLAPSE ---
  {
    id: 7,
    act: 3,
    actTitle: 'ACT 3 – THE COLLAPSE',
    title: 'Parallel Decisions',
    description: 'Quantum memory upgrade unlocked: You can now deploy TWO concurrent echoes in parallel!',
    learningFocus: 'Parallelism & Concurrency: Orchestrating multiple asynchronous timelines to solve simultaneous barriers.',
    reflectionQuestion: 'How does managing two simultaneous threads of past action mirror parallel computing?',
    spawnPoint: { x: 80, y: 480 },
    exitPoint: { x: 880, y: 480 },
    maxRecordingDurationSeconds: 14,
    maxActiveEchoes: 2,
    targetTimeSeconds: 60,
    platforms: [
      { x: 0, y: 550, width: 960, height: 50 },
      { x: 220, y: 380, width: 160, height: 20 },
      { x: 560, y: 380, width: 160, height: 20 },
    ],
    pressurePlates: [
      { id: 'plate_left', x: 260, y: 370, width: 60, height: 10, targetDoorId: 'door_gate1' },
      { id: 'plate_right', x: 610, y: 370, width: 60, height: 10, targetDoorId: 'door_gate2' }
    ],
    switches: [],
    doors: [
      { id: 'door_gate1', x: 460, y: 430, width: 20, height: 120, openOffset: { x: 0, y: -120 } },
      { id: 'door_gate2', x: 780, y: 430, width: 20, height: 120, openOffset: { x: 0, y: -120 } }
    ],
    hints: [
      'This chamber has two locks: Door 1 and Door 2.',
      'Record your first echo to jump up and hold Plate 1. Replay it (E).',
      'While Echo 1 is running, press R to record Echo 2 holding Plate 2!',
      'With both past echoes operating their respective plates, walk freely through both open gates!'
    ]
  },
  {
    id: 8,
    act: 3,
    actTitle: 'ACT 3 – THE COLLAPSE',
    title: 'The Last Protocol',
    description: 'Facility structural collapse imminent. Timed security gates, pressure triggers, and active energy surges.',
    learningFocus: 'System Integration: Synthesizing observation, sequencing, timing, and multi-echo execution.',
    reflectionQuestion: 'Which sub-problem was the bottleneck in your initial attempt?',
    spawnPoint: { x: 80, y: 480 },
    exitPoint: { x: 890, y: 150 },
    maxRecordingDurationSeconds: 15,
    maxActiveEchoes: 2,
    targetTimeSeconds: 70,
    platforms: [
      { x: 0, y: 550, width: 960, height: 50 },
      { x: 200, y: 440, width: 140, height: 20 },
      { x: 420, y: 340, width: 180, height: 20 },
      { x: 700, y: 240, width: 260, height: 20 },
    ],
    hazards: [
      { x: 350, y: 535, width: 120, height: 15, type: 'laser' }
    ],
    pressurePlates: [
      { id: 'p_8a', x: 240, y: 430, width: 60, height: 10, targetDoorId: 'd_8a' }
    ],
    switches: [
      { id: 's_8b', x: 500, y: 320, type: 'timed', durationSeconds: 6, targetDoorId: 'd_8b' }
    ],
    doors: [
      { id: 'd_8a', x: 380, y: 220, width: 20, height: 120, openOffset: { x: 0, y: -120 } },
      { id: 'd_8b', x: 820, y: 120, width: 24, height: 120, openOffset: { x: 0, y: -120 } }
    ],
    hints: [
      'Deconstruct the puzzle: First open Door A to gain access to the central platform.',
      'Deploy an echo on Plate A to keep the corridor open.',
      'Use a second echo or your real-time avatar to trigger the timed switch B and reach the high escape ladder.'
    ]
  },
  {
    id: 9,
    act: 3,
    actTitle: 'ACT 3 – THE COLLAPSE',
    title: 'The Last Echo',
    description: 'The central temporal core. Overload all three containment coils to breach the research facility.',
    learningFocus: 'Mastery & Synthesis: Full symphony of temporal clones operating in perfect harmony.',
    reflectionQuestion: 'How does mastering the echo mechanic teach you to decompose grand goals into smaller milestones?',
    spawnPoint: { x: 80, y: 480 },
    exitPoint: { x: 900, y: 480 },
    maxRecordingDurationSeconds: 16,
    maxActiveEchoes: 2,
    targetTimeSeconds: 80,
    platforms: [
      { x: 0, y: 550, width: 960, height: 50 },
      { x: 180, y: 410, width: 130, height: 20 },
      { x: 400, y: 310, width: 160, height: 20 },
      { x: 650, y: 410, width: 130, height: 20 },
    ],
    hazards: [
      { x: 310, y: 535, width: 90, height: 15, type: 'laser' },
      { x: 560, y: 535, width: 90, height: 15, type: 'laser' }
    ],
    pressurePlates: [
      { id: 'p_core_1', x: 220, y: 400, width: 60, height: 10, targetDoorId: 'door_core_outer' },
      { id: 'p_core_2', x: 690, y: 400, width: 60, height: 10, targetDoorId: 'door_core_final' }
    ],
    switches: [
      { id: 'sw_core_top', x: 470, y: 290, type: 'toggle', targetDoorId: 'door_core_inner' }
    ],
    doors: [
      { id: 'door_core_outer', x: 380, y: 430, width: 20, height: 120, openOffset: { x: 0, y: -120 } },
      { id: 'door_core_inner', x: 560, y: 430, width: 20, height: 120, openOffset: { x: 0, y: -120 } },
      { id: 'door_core_final', x: 820, y: 430, width: 20, height: 120, openOffset: { x: 0, y: -120 } }
    ],
    hints: [
      'Three magnetic barriers guard the exit tunnel.',
      'Assign Echo 1 to hold Plate 1 on the left platform.',
      'Reach the top console to disable the central laser barrier.',
      'Assign Echo 2 to hold Plate 2 on the right platform, opening the final gate to freedom!'
    ]
  }
];

