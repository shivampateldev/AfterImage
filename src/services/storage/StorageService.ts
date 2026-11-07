import { PlayerStats, GameSettings } from '../../types';

const STATS_STORAGE_KEY = 'afterimage_player_stats_v1';
const SETTINGS_STORAGE_KEY = 'afterimage_game_settings_v1';

const DEFAULT_SETTINGS: GameSettings = {
  masterVolume: 0.8,
  sfxVolume: 0.8,
  musicVolume: 0.6,
  muted: false,
  screenShake: true,
  particlesEnabled: true,
  showTimer: true,
  highContrastHud: false,
};

const DEFAULT_STATS: PlayerStats = {
  totalXp: 0,
  levelsCompleted: [],
  questionsAttempted: 0,
  correctAnswers: 0,
  incorrectAnswers: 0,
  answeredQuestionIds: [],
  solvedChallengeIds: [],
  accuracyByLanguage: {
    c: { attempted: 0, correct: 0 },
    python: { attempted: 0, correct: 0 },
    javascript: { attempted: 0, correct: 0 },
    cpp: { attempted: 0, correct: 0 },
    java: { attempted: 0, correct: 0 },
  },
  conceptsMastered: [],
  achievements: [],
  echoesUsedTotal: 0,
  totalPlayTimeSeconds: 0,
  lastPlayedTimestamp: Date.now(),
  levelHighScores: {},
};

export class StorageService {
  private static instance: StorageService;

  private constructor() {}

  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  public getSettings(): GameSettings {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return DEFAULT_SETTINGS;
      const data = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (!data) return DEFAULT_SETTINGS;
      return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  public saveSettings(settings: GameSettings): void {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return;
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings:', e);
    }
  }

  public getPlayerStats(): PlayerStats {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return JSON.parse(JSON.stringify(DEFAULT_STATS));
      const data = localStorage.getItem(STATS_STORAGE_KEY);
      if (!data) return JSON.parse(JSON.stringify(DEFAULT_STATS));
      const parsed = JSON.parse(data);
      // Validate schema migration / structure
      return {
        ...DEFAULT_STATS,
        ...parsed,
        accuracyByLanguage: {
          ...DEFAULT_STATS.accuracyByLanguage,
          ...(parsed.accuracyByLanguage || {}),
        },
        levelHighScores: {
          ...DEFAULT_STATS.levelHighScores,
          ...(parsed.levelHighScores || {}),
        },
      };
    } catch (e) {
      console.warn('Corrupted save data detected, resetting to defaults safely.', e);
      return JSON.parse(JSON.stringify(DEFAULT_STATS));
    }
  }

  public savePlayerStats(stats: PlayerStats): void {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return;
      stats.lastPlayedTimestamp = Date.now();
      localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(stats));
    } catch (e) {
      console.error('Failed to save player stats:', e);
    }
  }

  public resetAllProgress(): void {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return;
      localStorage.removeItem(STATS_STORAGE_KEY);
    } catch (e) {
      console.error('Failed to reset progress:', e);
    }
  }
}
