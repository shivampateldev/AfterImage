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
    spawnPoint: { x: 80, y: 480 },
    exitPoint: { x: 880, y: 480 },
    maxRecordingDurationSeconds: 8,
    maxActiveEchoes: 1,
    targetTimeSeconds: 20,
    platforms: [
      { x: 0, y: 550, width: 960, height: 50 },
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
      'Head towards the exit on the far right.'
    ]
  },
  {
    id: 2,
    act: 1,
    actTitle: 'ACT 1 – THE AWAKENING',
    title: 'A Second Self',
    description: 'The recording apparatus engages. Stand on the magnetic pressure plate to open the blast gate, then record your echo to keep it held open while you cross.',
    learningFocus: 'Continuous State & Temporal Coordination: Automatic pressure plates require continuous mass. Record an echo to sustain the connection while you advance.',
    reflectionQuestion: 'Why does the blast gate slam shut when you leave the plate? How did recording your past self sustain the circuit?',
    spawnPoint: { x: 60, y: 480 },
    exitPoint: { x: 900, y: 480 },
    maxRecordingDurationSeconds: 10,
    maxActiveEchoes: 1,
    targetTimeSeconds: 30,
    // Calculated Jump Range: Velocity 13.5m/s, Gravity 26m/s^2 => Max gap ~7.0m (~280px).
    // Gaps engineered between 80px and 120px with safety margins.
    platforms: [
      // Starting platform (contains spawn & recording start)
      { x: 0, y: 550, width: 340, height: 50 },
      // Middle stepping platform (contains Pressure Plate)
      { x: 420, y: 550, width: 180, height: 50 },
      // Elevated surveying ledge
      { x: 440, y: 430, width: 140, height: 20 },
      // Corridor past the blast gate leading to the exit
      { x: 680, y: 550, width: 300, height: 50 },
    ],
    pressurePlates: [
      // Automatic Pressure Plate: standing on this plate opens door_1
      { id: 'plate_gate', x: 470, y: 540, width: 80, height: 12, targetDoorId: 'door_1' }
    ],
    switches: [
      // Auxiliary switch mounted beside the gate
      { id: 'sw_gate_override', x: 650, y: 470, type: 'toggle', targetDoorId: 'door_1' }
    ],
    doors: [
      // Heavy Industrial Blast Gate physically sealing the corridor at x = 680
      { id: 'door_1', x: 690, y: 430, width: 24, height: 120, openOffset: { x: 0, y: -125 } }
    ],
    hints: [
      'Step onto the yellow/cyan pressure plate. Notice the hydraulic blast door raises automatically!',
      'Press [R] to record timeline. Walk onto the pressure plate and stand still on it for 5-6 seconds.',
      'Press [R] again to save your echo, then position yourself near the blast gate.',
      'Press [E] to summon your echo. While your past self holds the plate down, run through the open gate!'
    ]
  },
  {
    id: 3,
    act: 1,
    actTitle: 'ACT 1 – THE AWAKENING',
    title: 'Echoes of the Past',
    description: 'A magnetic lock requires sustained mass on a pressure plate while dodging laser containment zones.',
    learningFocus: 'Cause & Effect & Holding State: An echo provides continuous presence on sensors.',
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
      'Standing on the plate opens the security blast door.',
      'Record your echo standing on the plate for 5 seconds, then summon it to pass through.'
    ]
  },
  // --- ACT 2: ARCHIVAL DEPTHS ---
  {
    id: 4,
    act: 2,
    actTitle: 'ACT 2 – ARCHIVAL DEPTHS',
    title: 'Chronological Relay',
    description: 'Deep in the data archives. Two distant sensors must be triggered within a tight synchronization window.',
    learningFocus: 'Concurrency & Decomposition: Split a composite requirement into concurrent temporal streams.',
    reflectionQuestion: 'How did temporal overlap allow you to bridge physical separation?',
    spawnPoint: { x: 60, y: 480 },
    exitPoint: { x: 900, y: 220 },
    maxRecordingDurationSeconds: 10,
    maxActiveEchoes: 2,
    targetTimeSeconds: 40,
    platforms: [
      { x: 0, y: 550, width: 280, height: 50 },
      { x: 350, y: 550, width: 260, height: 50 },
      { x: 680, y: 550, width: 280, height: 50 },
      { x: 200, y: 380, width: 140, height: 20 },
      { x: 620, y: 290, width: 160, height: 20 },
      { x: 800, y: 290, width: 160, height: 20 },
    ],
    pressurePlates: [
      { id: 'p_relay_1', x: 100, y: 540, width: 70, height: 10, targetDoorId: 'door_relay' },
      { id: 'p_relay_2', x: 450, y: 540, width: 70, height: 10, targetDoorId: 'door_relay' },
    ],
    switches: [],
    doors: [
      { id: 'door_relay', x: 780, y: 170, width: 24, height: 120, openOffset: { x: 0, y: -120 } },
    ],
    hints: [
      'Both pressure plates must be pressed at the same time to open the archival blast door.',
      'Record yourself standing on Plate 1 for 6 seconds.',
      'While your echo holds Plate 1, stand on Plate 2 yourself, then leap across the upper ledges!'
    ]
  },
  {
    id: 5,
    act: 2,
    actTitle: 'ACT 2 – ARCHIVAL DEPTHS',
    title: 'Synchronized Flux',
    description: 'High-voltage laser containment grids flicker on predictable cycles. Time your echo to clear the pathway.',
    learningFocus: 'State Timing: Coordinating movement phases to bypass cyclic hazards.',
    reflectionQuestion: 'Did you synchronize your movements before or during the hazard cycle?',
    spawnPoint: { x: 80, y: 480 },
    exitPoint: { x: 900, y: 480 },
    maxRecordingDurationSeconds: 12,
    maxActiveEchoes: 2,
    targetTimeSeconds: 45,
    platforms: [
      { x: 0, y: 550, width: 960, height: 50 },
      { x: 280, y: 440, width: 120, height: 20 },
      { x: 540, y: 440, width: 120, height: 20 },
    ],
    hazards: [
      { x: 380, y: 535, width: 140, height: 15, type: 'laser' },
    ],
    pressurePlates: [
      { id: 'p_flux', x: 160, y: 540, width: 80, height: 10, targetDoorId: 'door_flux' },
    ],
    switches: [],
    doors: [
      { id: 'door_flux', x: 750, y: 430, width: 24, height: 120, openOffset: { x: 0, y: -120 } },
    ],
    hints: [
      'The hazard zone requires precise navigation across upper gantry platforms.',
      'Send your echo to maintain pressure on the flux plate while you navigate above the laser grid.'
    ]
  },
  {
    id: 6,
    act: 2,
    actTitle: 'ACT 2 – ARCHIVAL DEPTHS',
    title: 'The Mirror Room',
    description: 'Symmetric consoles require simultaneous toggle activation. Your echo mirrors the counter-terminal.',
    learningFocus: 'Parallel Problem Decomposition: Converting serial workflows into parallel synchronization.',
    reflectionQuestion: 'How did decomposing the dual-switch problem reduce execution duration?',
    spawnPoint: { x: 80, y: 480 },
    exitPoint: { x: 900, y: 220 },
    maxRecordingDurationSeconds: 10,
    maxActiveEchoes: 2,
    targetTimeSeconds: 45,
    platforms: [
      { x: 0, y: 550, width: 440, height: 50 },
      { x: 520, y: 550, width: 440, height: 50 },
      { x: 200, y: 380, width: 140, height: 20 },
      { x: 620, y: 380, width: 140, height: 20 },
      { x: 740, y: 290, width: 220, height: 20 },
    ],
    pressurePlates: [],
    switches: [
      { id: 'sw_left', x: 250, y: 360, type: 'timed', durationSeconds: 6, targetDoorId: 'door_mirror' },
      { id: 'sw_right', x: 670, y: 360, type: 'timed', durationSeconds: 6, targetDoorId: 'door_mirror' },
    ],
    doors: [
      { id: 'door_mirror', x: 780, y: 170, width: 24, height: 120, openOffset: { x: 0, y: -120 } },
    ],
    hints: [
      'Both switches are timed (6 seconds). One agent cannot reach both before the first expires.',
      'Record yourself running to Switch 1 and activating it.',
      'Summon your echo, and simultaneously run to Switch 2!'
    ]
  },
  // --- ACT 3: THE CHRONO CORE ---
  {
    id: 7,
    act: 3,
    actTitle: 'ACT 3 – THE CHRONO CORE',
    title: 'Triple Timeline',
    description: 'At the perimeter of the Reactor Core. Three temporal echoes must be orchestrated to unlock the primary containment ring.',
    learningFocus: 'Advanced Coordination: Managing three concurrent asynchronous pipelines.',
    reflectionQuestion: 'What strategy did you use to order the recording of three different echoes?',
    spawnPoint: { x: 60, y: 480 },
    exitPoint: { x: 900, y: 220 },
    maxRecordingDurationSeconds: 12,
    maxActiveEchoes: 3,
    targetTimeSeconds: 60,
    platforms: [
      { x: 0, y: 550, width: 960, height: 50 },
      { x: 200, y: 440, width: 120, height: 20 },
      { x: 420, y: 360, width: 120, height: 20 },
      { x: 640, y: 280, width: 140, height: 20 },
      { x: 800, y: 290, width: 160, height: 20 },
    ],
    pressurePlates: [
      { id: 'p_core_1', x: 120, y: 540, width: 60, height: 10, targetDoorId: 'door_core_outer' },
      { id: 'p_core_2', x: 240, y: 430, width: 60, height: 10, targetDoorId: 'door_core_outer' },
      { id: 'p_core_3', x: 460, y: 350, width: 60, height: 10, targetDoorId: 'door_core_outer' },
    ],
    switches: [],
    doors: [
      { id: 'door_core_outer', x: 780, y: 170, width: 24, height: 120, openOffset: { x: 0, y: -120 } },
    ],
    hints: [
      'Three pressure plates at different elevations must be depressed simultaneously.',
      'Record Echo 1 on Plate 1, Echo 2 on Plate 2, then summon both while you occupy Plate 3!'
    ]
  },
  {
    id: 8,
    act: 3,
    actTitle: 'ACT 3 – THE CHRONO CORE',
    title: 'Temporal Resonance',
    description: 'Resonance waves sweep across the reactor floor. Leap over pulses while echoes maintain the coolant bypass valves.',
    learningFocus: 'Complex Sequencing: Dynamic obstacle avoidance under strict temporal constraints.',
    reflectionQuestion: 'Did you prioritize hazard avoidance or echo duration when planning your route?',
    spawnPoint: { x: 60, y: 480 },
    exitPoint: { x: 920, y: 480 },
    maxRecordingDurationSeconds: 12,
    maxActiveEchoes: 3,
    targetTimeSeconds: 55,
    platforms: [
      { x: 0, y: 550, width: 300, height: 50 },
      { x: 380, y: 550, width: 200, height: 50 },
      { x: 660, y: 550, width: 300, height: 50 },
      { x: 220, y: 400, width: 120, height: 20 },
      { x: 500, y: 400, width: 120, height: 20 },
    ],
    hazards: [
      { x: 295, y: 540, width: 85, height: 20, type: 'laser' },
      { x: 575, y: 540, width: 85, height: 20, type: 'laser' },
    ],
    pressurePlates: [
      { id: 'p_res_1', x: 100, y: 540, width: 70, height: 10, targetDoorId: 'door_res' },
    ],
    switches: [
      { id: 'sw_res_1', x: 460, y: 530, type: 'toggle', targetDoorId: 'door_res' },
    ],
    doors: [
      { id: 'door_res', x: 800, y: 430, width: 24, height: 120, openOffset: { x: 0, y: -120 } },
    ],
    hints: [
      'The pit hazards divide the facility into three compartments.',
      'Use an echo to hold Plate 1 while you leap the first pit and activate the central switch!'
    ]
  },
  {
    id: 9,
    act: 3,
    actTitle: 'ACT 3 – THE CHRONO CORE',
    title: 'The Last Echo',
    description: 'The core collapse sequence has begun. Chain all temporal faculties to stabilize the resonance chamber and escape.',
    learningFocus: 'Synthesis: Unifying all learned principles of concurrency, state holding, and sequencing under crisis.',
    reflectionQuestion: 'Looking back from the final escape, how did your understanding of past actions evolve across your journey?',
    spawnPoint: { x: 60, y: 480 },
    exitPoint: { x: 920, y: 140 },
    maxRecordingDurationSeconds: 15,
    maxActiveEchoes: 3,
    targetTimeSeconds: 70,
    platforms: [
      { x: 0, y: 550, width: 240, height: 50 },
      { x: 300, y: 550, width: 200, height: 50 },
      { x: 560, y: 550, width: 200, height: 50 },
      { x: 140, y: 420, width: 120, height: 20 },
      { x: 380, y: 340, width: 140, height: 20 },
      { x: 640, y: 260, width: 140, height: 20 },
      { x: 820, y: 210, width: 140, height: 20 },
    ],
    hazards: [
      { x: 235, y: 540, width: 65, height: 20, type: 'laser' },
      { x: 495, y: 540, width: 65, height: 20, type: 'laser' },
    ],
    pressurePlates: [
      { id: 'p_final_1', x: 80, y: 540, width: 70, height: 10, targetDoorId: 'door_final' },
      { id: 'p_final_2', x: 410, y: 330, width: 60, height: 10, targetDoorId: 'door_final' },
    ],
    switches: [
      { id: 'sw_final', x: 690, y: 240, type: 'timed', durationSeconds: 8, targetDoorId: 'door_final' },
    ],
    doors: [
      { id: 'door_final', x: 860, y: 90, width: 24, height: 120, openOffset: { x: 0, y: -120 } },
    ],
    hints: [
      'The final escape gateway requires two held pressure plates and one active timed switch.',
      'Deconstruct the puzzle into three distinct echo timelines leading up to the apex gantry.'
    ]
  },
];
