import { AchievementDefinition } from '../types';

export const ACHIEVEMENTS: AchievementDefinition[] = [
  {
    id: 'ach_first_steps',
    title: 'Temporal Awakening',
    description: 'Awaken in the research facility and master standard locomotion.',
    icon: 'Footprints',
    xpReward: 50,
  },
  {
    id: 'ach_first_echo',
    title: 'First Echo',
    description: 'Record your timeline and summon your first temporal duplicate.',
    icon: 'Copy',
    xpReward: 100,
  },
  {
    id: 'ach_puzzle_solver',
    title: 'First Puzzle Solved',
    description: 'Coordinate an echo to hold a pressure plate and unlock a security door.',
    icon: 'KeyRound',
    xpReward: 100,
  },
  {
    id: 'ach_timed_master',
    title: 'Temporal Alignment',
    description: 'Successfully synchronize with a timed switch before the capacitor discharges.',
    icon: 'Timer',
    xpReward: 150,
  },
  {
    id: 'ach_multi_echo',
    title: 'Parallel Decisions',
    description: 'Deploy multiple echoes simultaneously to overcome multi-gate locks.',
    icon: 'GitFork',
    xpReward: 200,
  },
  {
    id: 'ach_campaign_complete',
    title: 'The Last Echo',
    description: 'Complete all nine research facility sectors and discover the facility truth.',
    icon: 'Trophy',
    xpReward: 500,
  },
  {
    id: 'ach_no_hints',
    title: 'Pure Intuition',
    description: 'Clear any level with zero hint usage.',
    icon: 'Sparkles',
    xpReward: 100,
  },
  {
    id: 'ach_coder_bronze',
    title: 'Code Apprentice',
    description: 'Answer your first post-mission programming challenge correctly.',
    icon: 'Code2',
    xpReward: 50,
  },
  {
    id: 'ach_coder_polyglot',
    title: 'Polyglot Mind',
    description: 'Solve coding questions across at least 3 distinct programming languages.',
    icon: 'Terminal',
    xpReward: 200,
  },
  {
    id: 'ach_flawless_coder',
    title: 'Compiler Brain',
    description: 'Maintain a 100% correct answer rate on at least 5 consecutive challenges.',
    icon: 'CheckCircle2',
    xpReward: 250,
  }
];

