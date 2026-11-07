export type ProgrammingLanguage = 'c' | 'python' | 'javascript' | 'cpp' | 'java';

export type QuestionDifficulty = 'beginner' | 'intermediate';

export type QuestionTopic = 
  | 'variables'
  | 'operators'
  | 'conditionals'
  | 'loops'
  | 'functions'
  | 'arrays'
  | 'strings'
  | 'pointers'
  | 'recursion'
  | 'oop'
  | 'complexity'
  | 'algorithms';

export interface CodeQuestion {
  id: string;
  language: ProgrammingLanguage;
  topic: QuestionTopic;
  difficulty: QuestionDifficulty;
  question: string;
  codeSnippet?: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  conceptSummary: string;
  rewardXp: number;
}

export interface PlayerStats {
  totalXp: number;
  levelsCompleted: number[];
  questionsAttempted: number;
  correctAnswers: number;
  incorrectAnswers: number;
  answeredQuestionIds: string[];
  solvedChallengeIds: string[];
  accuracyByLanguage: Record<ProgrammingLanguage, { attempted: number; correct: number }>;
  conceptsMastered: string[];
  achievements: string[];
  echoesUsedTotal: number;
  totalPlayTimeSeconds: number;
  lastPlayedTimestamp: number;
  levelHighScores: Record<number, {
    bestTimeSeconds: number;
    echoesUsed: number;
    hintsUsed: number;
    stars: number;
  }>;
}

export interface GameSettings {
  masterVolume: number;
  sfxVolume: number;
  musicVolume: number;
  muted: boolean;
  screenShake: boolean;
  particlesEnabled: boolean;
  showTimer: boolean;
  highContrastHud: boolean;
}

export interface AchievementDefinition {
  id: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  unlockedAt?: number;
}

export interface EchoSample {
  timeOffset: number; // ms from recording start
  x: number;
  y: number;
  vx: number;
  vy: number;
  flipX: boolean;
  animState: 'idle' | 'run' | 'jump' | 'fall';
  isInteracting: boolean;
}

export interface LevelPuzzleObjective {
  id: string;
  description: string;
  completed: boolean;
}

export interface LevelConfig {
  id: number;
  title: string;
  act: number;
  actTitle: string;
  description: string;
  learningFocus: string;
  reflectionQuestion: string;
  spawnPoint: { x: number; y: number };
  exitPoint: { x: number; y: number };
  maxRecordingDurationSeconds: number;
  maxActiveEchoes: number;
  targetTimeSeconds: number;
  platforms: Array<{ x: number; y: number; width: number; height: number; type?: 'solid' | 'hazard' | 'energy' }>;
  pressurePlates: Array<{ id: string; x: number; y: number; width: number; height: number; targetDoorId?: string; targetBridgeId?: string }>;
  switches: Array<{ id: string; x: number; y: number; type: 'toggle' | 'timed'; durationSeconds?: number; targetDoorId?: string; targetPlatformId?: string }>;
  doors: Array<{ id: string; x: number; y: number; width: number; height: number; openOffset?: { x: number; y: number } }>;
  hazards?: Array<{ x: number; y: number; width: number; height: number; type: 'laser' | 'spikes' }>;
  movingPlatforms?: Array<{ id: string; x: number; y: number; width: number; height: number; path: Array<{ x: number; y: number }>; speed: number }>;
  hints: string[];
}

