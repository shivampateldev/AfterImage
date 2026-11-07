import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  RotateCcw, 
  ArrowRight, 
  Clock, 
  Zap, 
  Code2, 
  CheckCircle, 
  XCircle, 
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { CodeQuestion } from '../../types';
import { CODING_QUESTIONS } from '../../data/questions';
import { ProgressionService } from '../../services/progression/ProgressionService';

interface LevelCompletionModalProps {
  levelId: number;
  completionTimeSeconds: number;
  hintsUsed: number;
  reflectionQuestion: string;
  onContinueNextLevel: () => void;
  onReplayLevel: () => void;
}

export const LevelCompletionModal: React.FC<LevelCompletionModalProps> = ({
  levelId,
  completionTimeSeconds,
  hintsUsed,
  reflectionQuestion,
  onContinueNextLevel,
  onReplayLevel,
}) => {
  const progression = ProgressionService.getInstance();
  const [activeTab, setActiveTab] = useState<'summary' | 'challenge'>('summary');
  
  // Pick an educational question matching progress or random
  const [question] = useState<CodeQuestion>(() => {
    const questionsForLevel = CODING_QUESTIONS.slice((levelId - 1) * 3, levelId * 3 + 4);
    const chosen = questionsForLevel.length > 0 
      ? questionsForLevel[Math.floor(Math.random() * questionsForLevel.length)]
      : CODING_QUESTIONS[0];
    return chosen;
  });

  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [earnedBonusXp, setEarnedBonusXp] = useState<number>(0);
  const [levelCompletionResult] = useState(() => {
    return progression.completeLevel(levelId, completionTimeSeconds, 1, hintsUsed);
  });

  const handleSelectOption = (idx: number) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(idx);
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null || isAnswerSubmitted) return;
    setIsAnswerSubmitted(true);
    const isCorrect = selectedOption === question.correctAnswerIndex;
    const result = progression.recordQuestionResult(
      question.id,
      question.language,
      question.conceptSummary,
      isCorrect,
      question.rewardXp
    );
    setEarnedBonusXp(result.xpAwarded);
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-40 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="bg-facility-900 border border-facility-cyan/40 rounded-2xl max-w-xl w-full p-6 shadow-2xl glow-cyan overflow-hidden"
      >
        {/* Header Tabs */}
        <div className="flex border-b border-facility-700/60 pb-3 mb-5 justify-between items-center">
          <div className="flex space-x-3">
            <button
              onClick={() => setActiveTab('summary')}
              className={`text-sm font-bold tracking-wider uppercase pb-1 transition flex items-center space-x-1.5 ${
                activeTab === 'summary' 
                  ? 'text-facility-cyan border-b-2 border-facility-cyan' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Trophy className="w-4 h-4" />
              <span>Mission Cleared</span>
            </button>
            <button
              onClick={() => setActiveTab('challenge')}
              className={`text-sm font-bold tracking-wider uppercase pb-1 transition flex items-center space-x-1.5 ${
                activeTab === 'challenge' 
                  ? 'text-facility-purple border-b-2 border-facility-purple' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Code2 className="w-4 h-4" />
              <span>Code Bonus (+{question.rewardXp} XP)</span>
            </button>
          </div>

          <span className="text-xs font-mono text-facility-cyan bg-facility-800 px-2 py-1 rounded">
            LEVEL 0{levelId}
          </span>
        </div>

        {/* Tab 1: Mission Summary */}
        {activeTab === 'summary' && (
          <div className="space-y-5">
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-facility-950/80 border border-facility-700/50 p-3 rounded-xl text-center">
                <div className="text-xs text-slate-400 flex items-center justify-center space-x-1 mb-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Time</span>
                </div>
                <div className="text-lg font-bold font-mono text-white">
                  {completionTimeSeconds}s
                </div>
              </div>

              <div className="bg-facility-950/80 border border-facility-700/50 p-3 rounded-xl text-center">
                <div className="text-xs text-slate-400 flex items-center justify-center space-x-1 mb-1">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>XP Gained</span>
                </div>
                <div className="text-lg font-bold font-mono text-amber-400">
                  +{levelCompletionResult.earnedXp}
                </div>
              </div>

              <div className="bg-facility-950/80 border border-facility-700/50 p-3 rounded-xl text-center">
                <div className="text-xs text-slate-400 flex items-center justify-center space-x-1 mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-facility-purple" />
                  <span>Hints</span>
                </div>
                <div className="text-lg font-bold font-mono text-purple-400">
                  {hintsUsed === 0 ? 'Flawless' : `${hintsUsed} Used`}
                </div>
              </div>
            </div>

            {/* Reflection prompt */}
            <div className="bg-facility-950/90 border border-facility-cyan/30 p-4 rounded-xl">
              <div className="text-xs font-bold text-facility-cyan uppercase tracking-wider mb-1 flex items-center space-x-1.5">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Tactical Reflection</span>
              </div>
              <p className="text-slate-300 text-sm italic">
                "{reflectionQuestion}"
              </p>
            </div>

            {/* Unlocked Achievements Notice if any */}
            {levelCompletionResult.unlockedAchievements.length > 0 && (
              <div className="bg-amber-950/60 border border-amber-500/50 p-3 rounded-xl flex items-center space-x-3">
                <Trophy className="w-6 h-6 text-amber-400 flex-shrink-0" />
                <div>
                  <div className="text-xs font-bold text-amber-300 uppercase">Achievement Unlocked!</div>
                  <div className="text-xs text-amber-100 font-mono">
                    Check your Achievements panel to view rewards.
                  </div>
                </div>
              </div>
            )}

            <div className="bg-facility-800/40 border border-facility-700/50 p-3 rounded-xl flex items-center justify-between">
              <span className="text-xs text-slate-400">Optional: Earn bonus XP with a quick coding challenge</span>
              <button
                onClick={() => setActiveTab('challenge')}
                className="text-xs font-bold text-facility-cyan hover:underline flex items-center space-x-1"
              >
                <span>Take Challenge</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Coding Challenge (Learn to Earn) */}
        {activeTab === 'challenge' && (
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            <div className="flex justify-between items-center text-xs">
              <span className="font-mono uppercase bg-facility-800 text-facility-cyan px-2 py-0.5 rounded border border-facility-700">
                {question.language.toUpperCase()} • {question.topic.toUpperCase()}
              </span>
              <span className="text-slate-400 font-mono">Difficulty: {question.difficulty}</span>
            </div>

            <h4 className="text-sm font-semibold text-white">
              {question.question}
            </h4>

            {question.codeSnippet && (
              <pre className="bg-facility-950 p-3 rounded-xl border border-facility-800 font-mono text-xs text-slate-200 overflow-x-auto leading-relaxed">
                <code>{question.codeSnippet}</code>
              </pre>
            )}

            {/* Answer Options */}
            <div className="space-y-2">
              {question.options.map((option, idx) => {
                let borderStyle = 'border-facility-700 hover:border-slate-500';
                let bgStyle = 'bg-facility-950/60';

                if (isAnswerSubmitted) {
                  if (idx === question.correctAnswerIndex) {
                    borderStyle = 'border-emerald-500 text-emerald-300';
                    bgStyle = 'bg-emerald-950/50';
                  } else if (idx === selectedOption) {
                    borderStyle = 'border-red-500 text-red-300';
                    bgStyle = 'bg-red-950/50';
                  }
                } else if (idx === selectedOption) {
                  borderStyle = 'border-facility-cyan text-facility-cyan';
                  bgStyle = 'bg-facility-800/80';
                }

                return (
                  <button
                    key={idx}
                    disabled={isAnswerSubmitted}
                    onClick={() => handleSelectOption(idx)}
                    className={`w-full text-left p-3 rounded-xl border text-xs font-mono transition flex items-center justify-between ${borderStyle} ${bgStyle}`}
                  >
                    <span>{String.fromCharCode(65 + idx)}. {option}</span>
                    {isAnswerSubmitted && idx === question.correctAnswerIndex && (
                      <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    )}
                    {isAnswerSubmitted && idx === selectedOption && idx !== question.correctAnswerIndex && (
                      <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation & Feedback */}
            {isAnswerSubmitted && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className={`p-3 rounded-xl border text-xs leading-relaxed ${
                  selectedOption === question.correctAnswerIndex 
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200' 
                    : 'bg-red-950/40 border-red-500/40 text-red-200'
                }`}
              >
                <div className="font-bold mb-1 flex items-center space-x-1">
                  {selectedOption === question.correctAnswerIndex ? (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>CORRECT! +{earnedBonusXp} XP EARNED</span>
                    </>
                  ) : (
                    <span>INCORRECT</span>
                  )}
                </div>
                <p className="text-slate-300">{question.explanation}</p>
                <div className="mt-2 text-[10px] text-slate-400 font-mono">
                  Concept: {question.conceptSummary}
                </div>
              </motion.div>
            )}

            {!isAnswerSubmitted && (
              <button
                onClick={handleSubmitAnswer}
                disabled={selectedOption === null}
                className="w-full py-2.5 bg-facility-cyan hover:bg-cyan-400 disabled:opacity-40 text-facility-950 font-bold text-xs rounded-xl transition"
              >
                Verify Solution
              </button>
            )}
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex justify-between items-center mt-6 pt-4 border-t border-facility-800">
          <button
            onClick={onReplayLevel}
            className="flex items-center space-x-2 px-4 py-2.5 bg-facility-800 hover:bg-facility-700 text-slate-300 rounded-xl text-xs font-semibold transition"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Replay Sector</span>
          </button>

          <button
            onClick={onContinueNextLevel}
            className="flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-facility-blue to-facility-cyan hover:brightness-110 text-facility-950 font-bold rounded-xl text-xs shadow-lg transition"
          >
            <span>Proceed to Next Sector</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};
