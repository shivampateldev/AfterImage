import { StorageService } from '../storage/StorageService';
import { PlayerStats, ProgrammingLanguage } from '../../types';
import { ACHIEVEMENTS } from '../../data/achievements';

export class ProgressionService {
  private static instance: ProgressionService;
  private storage: StorageService;
  private stats: PlayerStats;
  private listeners: Array<(stats: PlayerStats) => void> = [];

  private constructor() {
    this.storage = StorageService.getInstance();
    this.stats = this.storage.getPlayerStats();
  }

  public static getInstance(): ProgressionService {
    if (!ProgressionService.instance) {
      ProgressionService.instance = new ProgressionService();
    }
    return ProgressionService.instance;
  }

  public resetStats(): void {
    this.stats = {
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
    this.notify();
  }

  public getStats(): PlayerStats {
    return { ...this.stats };
  }

  public subscribe(listener: (stats: PlayerStats) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify(): void {
    this.storage.savePlayerStats(this.stats);
    this.listeners.forEach(cb => cb({ ...this.stats }));
  }

  public addXp(amount: number): void {
    if (amount <= 0) return;
    this.stats.totalXp += amount;
    this.notify();
  }

  public recordEchoUsed(): void {
    this.stats.echoesUsedTotal += 1;
    this.checkAchievements();
    this.notify();
  }

  public completeLevel(
    levelId: number,
    completionTimeSeconds: number,
    echoesUsed: number,
    hintsUsed: number
  ): { earnedXp: number; unlockedAchievements: string[] } {
    let earnedXp = 100; // Base level XP
    if (hintsUsed === 0) earnedXp += 25; // Bonus for no hints
    if (completionTimeSeconds < 45) earnedXp += 25; // Efficiency bonus

    const alreadyCompleted = this.stats.levelsCompleted.includes(levelId);
    if (!alreadyCompleted) {
      this.stats.levelsCompleted.push(levelId);
      this.stats.totalXp += earnedXp;
    }

    const currentBest = this.stats.levelHighScores[levelId];
    if (!currentBest || completionTimeSeconds < currentBest.bestTimeSeconds) {
      this.stats.levelHighScores[levelId] = {
        bestTimeSeconds: Math.floor(completionTimeSeconds),
        echoesUsed,
        hintsUsed,
        stars: hintsUsed === 0 ? 3 : (hintsUsed <= 1 ? 2 : 1),
      };
    }

    const unlockedAchievements = this.checkAchievements();
    this.notify();

    return { earnedXp, unlockedAchievements };
  }

  public recordQuestionResult(
    questionId: string,
    language: ProgrammingLanguage,
    concept: string,
    isCorrect: boolean,
    rewardXp: number
  ): { xpAwarded: number } {
    this.stats.questionsAttempted += 1;

    if (!this.stats.accuracyByLanguage[language]) {
      this.stats.accuracyByLanguage[language] = { attempted: 0, correct: 0 };
    }
    this.stats.accuracyByLanguage[language].attempted += 1;

    let xpAwarded = 0;
    if (isCorrect) {
      this.stats.correctAnswers += 1;
      this.stats.accuracyByLanguage[language].correct += 1;

      if (!this.stats.conceptsMastered.includes(concept)) {
        this.stats.conceptsMastered.push(concept);
      }

      // Prevent unlimited reward farming: award XP only on first correct solve
      if (!this.stats.solvedChallengeIds.includes(questionId)) {
        this.stats.solvedChallengeIds.push(questionId);
        xpAwarded = rewardXp;
        this.stats.totalXp += xpAwarded;
      }
    } else {
      this.stats.incorrectAnswers += 1;
    }

    if (!this.stats.answeredQuestionIds.includes(questionId)) {
      this.stats.answeredQuestionIds.push(questionId);
    }

    this.checkAchievements();
    this.notify();
    return { xpAwarded };
  }

  public checkAchievements(): string[] {
    const newlyUnlocked: string[] = [];

    const unlock = (id: string) => {
      if (!this.stats.achievements.includes(id)) {
        this.stats.achievements.push(id);
        const ach = ACHIEVEMENTS.find(a => a.id === id);
        if (ach) {
          this.stats.totalXp += ach.xpReward;
        }
        newlyUnlocked.push(id);
      }
    };

    // First steps: completed level 1
    if (this.stats.levelsCompleted.includes(1)) {
      unlock('ach_first_steps');
    }

    // First echo used
    if (this.stats.echoesUsedTotal >= 1) {
      unlock('ach_first_echo');
    }

    // First puzzle solved (level 3 completed)
    if (this.stats.levelsCompleted.includes(3)) {
      unlock('ach_puzzle_solver');
    }

    // Timed master (level 5 completed)
    if (this.stats.levelsCompleted.includes(5)) {
      unlock('ach_timed_master');
    }

    // Multi-echo (level 7 completed)
    if (this.stats.levelsCompleted.includes(7)) {
      unlock('ach_multi_echo');
    }

    // All campaign levels (1..9)
    if ([1, 2, 3, 4, 5, 6, 7, 8, 9].every(lvl => this.stats.levelsCompleted.includes(lvl))) {
      unlock('ach_campaign_complete');
    }

    // No hint master
    const anyNoHint = Object.values(this.stats.levelHighScores).some(s => s.hintsUsed === 0);
    if (anyNoHint) {
      unlock('ach_no_hints');
    }

    // Coding apprentice
    if (this.stats.correctAnswers >= 1) {
      unlock('ach_coder_bronze');
    }

    // Polyglot mind: correct answers across >= 3 languages
    const activeLangs = Object.values(this.stats.accuracyByLanguage).filter(l => l.correct > 0).length;
    if (activeLangs >= 3) {
      unlock('ach_coder_polyglot');
    }

    // Compiler Brain: 5 correct answers with high accuracy
    if (this.stats.correctAnswers >= 5 && (this.stats.correctAnswers / Math.max(1, this.stats.questionsAttempted)) >= 0.8) {
      unlock('ach_flawless_coder');
    }

    return newlyUnlocked;
  }
}
