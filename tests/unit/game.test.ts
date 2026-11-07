import { describe, it, expect, beforeEach } from 'vitest';
import { ProgressionService } from '../../src/services/progression/ProgressionService';
import { StorageService } from '../../src/services/storage/StorageService';
import { CODING_QUESTIONS } from '../../src/data/questions';
import { CAMPAIGN_LEVELS } from '../../src/data/levels';

describe('AFTERIMAGE Game Systems & Logic', () => {
  beforeEach(() => {
    StorageService.getInstance().resetAllProgress();
    ProgressionService.getInstance().resetStats();
  });

  describe('Campaign Level Definitions', () => {
    it('has exactly 9 campaign levels across 3 acts', () => {
      expect(CAMPAIGN_LEVELS.length).toBe(9);
      expect(CAMPAIGN_LEVELS.map(l => l.id)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });

    it('each level has valid spawn, exit, and platform collisions', () => {
      CAMPAIGN_LEVELS.forEach(lvl => {
        expect(lvl.spawnPoint.x).toBeGreaterThanOrEqual(0);
        expect(lvl.exitPoint.x).toBeGreaterThanOrEqual(0);
        expect(lvl.platforms.length).toBeGreaterThan(0);
        expect(lvl.maxRecordingDurationSeconds).toBeGreaterThan(0);
        expect(lvl.maxActiveEchoes).toBeGreaterThanOrEqual(1);
      });
    });

    it('levels with doors have matching triggers (switches or plates)', () => {
      CAMPAIGN_LEVELS.forEach(lvl => {
        if (lvl.doors.length > 0) {
          const doorIds = new Set(lvl.doors.map(d => d.id));
          const triggerTargetIds = new Set([
            ...lvl.pressurePlates.map(p => p.targetDoorId),
            ...lvl.switches.map(s => s.targetDoorId),
          ].filter(Boolean));

          doorIds.forEach(dId => {
            expect(triggerTargetIds.has(dId)).toBe(true);
          });
        }
      });
    });
  });

  describe('Educational System (Questions & Validation)', () => {
    it('contains at least 50 validated programming questions', () => {
      expect(CODING_QUESTIONS.length).toBeGreaterThanOrEqual(50);
    });

    it('covers all five required programming languages', () => {
      const languages = new Set(CODING_QUESTIONS.map(q => q.language));
      expect(languages.has('python')).toBe(true);
      expect(languages.has('javascript')).toBe(true);
      expect(languages.has('c')).toBe(true);
      expect(languages.has('cpp')).toBe(true);
      expect(languages.has('java')).toBe(true);
    });

    it('every question has valid non-empty options and a legal correctAnswerIndex', () => {
      CODING_QUESTIONS.forEach(q => {
        expect(q.options.length).toBeGreaterThanOrEqual(2);
        expect(q.correctAnswerIndex).toBeGreaterThanOrEqual(0);
        expect(q.correctAnswerIndex).toBeLessThan(q.options.length);
        expect(q.explanation.length).toBeGreaterThan(10);
        expect(q.rewardXp).toBeGreaterThan(0);
      });
    });
  });

  describe('Progression & Reward Mechanics', () => {
    it('awards level XP on completion', () => {
      const progression = ProgressionService.getInstance();
      const initialStats = progression.getStats();
      expect(initialStats.totalXp).toBe(0);

      const result = progression.completeLevel(1, 15, 0, 0);
      expect(result.earnedXp).toBeGreaterThanOrEqual(100);

      const updatedStats = progression.getStats();
      expect(updatedStats.levelsCompleted).toContain(1);
      // Base XP (150) + Unlocked "ach_first_steps" (50) = 200 XP
      expect(updatedStats.totalXp).toBeGreaterThanOrEqual(result.earnedXp);
    });

    it('prevents XP reward farming on repeated correct answers', () => {
      const progression = ProgressionService.getInstance();
      const question = CODING_QUESTIONS[0];

      // First solve
      const firstAttempt = progression.recordQuestionResult(
        question.id,
        question.language,
        question.conceptSummary,
        true,
        question.rewardXp
      );
      expect(firstAttempt.xpAwarded).toBe(question.rewardXp);

      const xpAfterFirst = progression.getStats().totalXp;

      // Duplicate solve
      const secondAttempt = progression.recordQuestionResult(
        question.id,
        question.language,
        question.conceptSummary,
        true,
        question.rewardXp
      );
      expect(secondAttempt.xpAwarded).toBe(0);
      expect(progression.getStats().totalXp).toBe(xpAfterFirst);
    });

    it('unlocks achievements through verified gameplay', () => {
      const progression = ProgressionService.getInstance();
      progression.completeLevel(1, 20, 0, 0);
      progression.recordEchoUsed();

      const stats = progression.getStats();
      expect(stats.achievements).toContain('ach_first_steps');
      expect(stats.achievements).toContain('ach_first_echo');
    });
  });
});
