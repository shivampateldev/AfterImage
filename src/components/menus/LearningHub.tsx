import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  CheckCircle, 
  XCircle, 
  Sparkles, 
  Filter, 
  ArrowLeft, 
  Terminal, 
  Trophy 
} from 'lucide-react';
import { CODING_QUESTIONS } from '../../data/questions';
import { CodeQuestion, ProgrammingLanguage, QuestionDifficulty } from '../../types';
import { ProgressionService } from '../../services/progression/ProgressionService';

interface LearningHubProps {
  onClose: () => void;
}

export const LearningHub: React.FC<LearningHubProps> = ({ onClose }) => {
  const progression = ProgressionService.getInstance();
  const [stats, setStats] = useState(progression.getStats());

  const [selectedLang, setSelectedLang] = useState<ProgrammingLanguage | 'all'>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<QuestionDifficulty | 'all'>('all');
  const [activeQuestion, setActiveQuestion] = useState<CodeQuestion | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);
  const [lastXpAwarded, setLastXpAwarded] = useState<number>(0);

  const filteredQuestions = CODING_QUESTIONS.filter(q => {
    if (selectedLang !== 'all' && q.language !== selectedLang) return false;
    if (selectedDifficulty !== 'all' && q.difficulty !== selectedDifficulty) return false;
    return true;
  });

  const handleSelectQuestion = (q: CodeQuestion) => {
    setActiveQuestion(q);
    setSelectedOption(null);
    setIsAnswerSubmitted(stats.answeredQuestionIds.includes(q.id));
    setLastXpAwarded(0);
  };

  const handleVerifyAnswer = () => {
    if (!activeQuestion || selectedOption === null || isAnswerSubmitted) return;
    setIsAnswerSubmitted(true);
    const isCorrect = selectedOption === activeQuestion.correctAnswerIndex;
    const res = progression.recordQuestionResult(
      activeQuestion.id,
      activeQuestion.language,
      activeQuestion.conceptSummary,
      isCorrect,
      activeQuestion.rewardXp
    );
    setLastXpAwarded(res.xpAwarded);
    setStats(progression.getStats());
  };

  return (
    <div className="fixed inset-0 bg-facility-950/90 backdrop-blur-md z-50 flex flex-col p-4 md:p-8 overflow-hidden">
      {/* Top Header */}
      <header className="flex justify-between items-center pb-4 border-b border-facility-800">
        <div className="flex items-center space-x-3">
          <button
            onClick={onClose}
            className="p-2.5 bg-facility-900 hover:bg-facility-800 border border-facility-700 text-facility-cyan rounded-xl transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <Terminal className="w-5 h-5 text-facility-cyan" />
              <h2 className="text-xl font-bold text-white tracking-wide">
                NEURAL CODE LAB (LEARN TO EARN)
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              No ads or paywalls. Solve programming output prediction & algorithm challenges to power up your temporal echo.
            </p>
          </div>
        </div>

        {/* Global XP & Solved Count */}
        <div className="flex items-center space-x-4 bg-facility-900/90 border border-facility-700/80 px-4 py-2 rounded-xl">
          <div className="text-right">
            <div className="text-[10px] text-slate-400 uppercase font-mono">Total XP</div>
            <div className="text-base font-bold text-amber-400 font-mono">
              {stats.totalXp} XP
            </div>
          </div>
          <div className="h-8 w-px bg-facility-700" />
          <div className="text-right">
            <div className="text-[10px] text-slate-400 uppercase font-mono">Solved</div>
            <div className="text-base font-bold text-facility-cyan font-mono">
              {stats.solvedChallengeIds.length} / {CODING_QUESTIONS.length}
            </div>
          </div>
        </div>
      </header>

      {/* Main Grid: Question Browser & Interactive Solver */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-6 flex-1 overflow-hidden">
        {/* Left Column: Filter & Challenge List (5 cols) */}
        <div className="md:col-span-5 flex flex-col h-full bg-facility-900/60 border border-facility-800 rounded-2xl p-4 overflow-hidden">
          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-4 pb-3 border-b border-facility-800">
            <div className="flex items-center space-x-1.5 text-xs text-slate-400 mr-2">
              <Filter className="w-3.5 h-3.5" />
              <span>Language:</span>
            </div>
            {(['all', 'python', 'javascript', 'c', 'cpp', 'java'] as const).map(lang => (
              <button
                key={lang}
                onClick={() => setSelectedLang(lang)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono transition uppercase ${
                  selectedLang === lang
                    ? 'bg-facility-cyan text-facility-950 font-bold'
                    : 'bg-facility-800 text-slate-300 hover:bg-facility-700'
                }`}
              >
                {lang}
              </button>
            ))}

            <div className="flex items-center space-x-1.5 text-xs text-slate-400 ml-3 mr-1">
              <span>Tier:</span>
            </div>
            {(['all', 'beginner', 'intermediate'] as const).map(diff => (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                className={`px-2 py-0.5 rounded text-[11px] font-mono transition uppercase ${
                  selectedDifficulty === diff
                    ? 'bg-facility-purple text-white font-bold'
                    : 'bg-facility-800/80 text-slate-400 hover:text-white'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>

          {/* List of questions */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {filteredQuestions.map(q => {
              const isSolved = stats.solvedChallengeIds.includes(q.id);
              const isSelected = activeQuestion?.id === q.id;

              return (
                <button
                  key={q.id}
                  onClick={() => handleSelectQuestion(q)}
                  className={`w-full text-left p-3 rounded-xl border transition flex items-center justify-between ${
                    isSelected
                      ? 'border-facility-cyan bg-facility-800/90 glow-cyan'
                      : isSolved
                      ? 'border-emerald-500/30 bg-emerald-950/20 hover:border-emerald-500/60'
                      : 'border-facility-800/80 bg-facility-950/40 hover:border-facility-700'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-facility-800 text-facility-cyan uppercase">
                        {q.language}
                      </span>
                      <span className="text-xs font-bold text-white line-clamp-1">
                        {q.topic}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 line-clamp-1">
                      {q.question}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-2 flex-shrink-0">
                    <span className="text-[11px] font-mono text-amber-400 font-semibold">
                      +{q.rewardXp} XP
                    </span>
                    {isSolved && (
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Challenge Detail & Workspace (7 cols) */}
        <div className="md:col-span-7 flex flex-col h-full bg-facility-900/60 border border-facility-800 rounded-2xl p-6 overflow-y-auto">
          {activeQuestion ? (
            <motion.div
              key={activeQuestion.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-5"
            >
              <div className="flex justify-between items-center border-b border-facility-800 pb-3">
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-1 rounded bg-facility-cyan/20 border border-facility-cyan/40 text-facility-cyan font-mono text-xs uppercase font-bold">
                    {activeQuestion.language}
                  </span>
                  <span className="text-slate-400 text-xs font-mono">
                    Topic: {activeQuestion.topic} • Difficulty: {activeQuestion.difficulty}
                  </span>
                </div>
                <div className="flex items-center space-x-1 text-amber-400 font-mono text-sm font-bold">
                  <Sparkles className="w-4 h-4" />
                  <span>+{activeQuestion.rewardXp} XP</span>
                </div>
              </div>

              <h3 className="text-lg font-bold text-white leading-snug">
                {activeQuestion.question}
              </h3>

              {activeQuestion.codeSnippet && (
                <div className="relative">
                  <pre className="bg-facility-950 p-4 rounded-xl border border-facility-800 font-mono text-sm text-cyan-300 overflow-x-auto leading-relaxed">
                    <code>{activeQuestion.codeSnippet}</code>
                  </pre>
                </div>
              )}

              {/* Multiple Choice Options */}
              <div className="space-y-2.5">
                <div className="text-xs uppercase font-mono tracking-wider text-slate-400 mb-1">
                  Choose Correct Evaluation:
                </div>
                {activeQuestion.options.map((opt, idx) => {
                  let borderCls = 'border-facility-700/80 hover:border-facility-cyan/60';
                  let bgCls = 'bg-facility-950/60';

                  if (isAnswerSubmitted) {
                    if (idx === activeQuestion.correctAnswerIndex) {
                      borderCls = 'border-emerald-500 text-emerald-300';
                      bgCls = 'bg-emerald-950/40';
                    } else if (idx === selectedOption) {
                      borderCls = 'border-red-500 text-red-300';
                      bgCls = 'bg-red-950/40';
                    }
                  } else if (idx === selectedOption) {
                    borderCls = 'border-facility-cyan text-facility-cyan';
                    bgCls = 'bg-facility-800';
                  }

                  return (
                    <button
                      key={idx}
                      disabled={isAnswerSubmitted}
                      onClick={() => setSelectedOption(idx)}
                      className={`w-full text-left p-3.5 rounded-xl border font-mono text-xs transition flex items-center justify-between ${borderCls} ${bgCls}`}
                    >
                      <span>{String.fromCharCode(65 + idx)}. {opt}</span>
                      {isAnswerSubmitted && idx === activeQuestion.correctAnswerIndex && (
                        <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      )}
                      {isAnswerSubmitted && idx === selectedOption && idx !== activeQuestion.correctAnswerIndex && (
                        <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Feedback Explanation */}
              {isAnswerSubmitted && (
                <div
                  className={`p-4 rounded-xl border text-xs leading-relaxed space-y-2 ${
                    selectedOption === activeQuestion.correctAnswerIndex
                      ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-200'
                      : 'bg-red-950/50 border-red-500/50 text-red-200'
                  }`}
                >
                  <div className="font-bold flex items-center space-x-1.5 text-sm">
                    {selectedOption === activeQuestion.correctAnswerIndex ? (
                      <>
                        <Trophy className="w-4 h-4 text-amber-300" />
                        <span>VERIFIED CORRECT! {lastXpAwarded > 0 ? `+${lastXpAwarded} XP AWARDED` : '(Already Claimed)'}</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-red-400" />
                        <span>INCORRECT SOLUTION</span>
                      </>
                    )}
                  </div>
                  <p className="text-slate-200">{activeQuestion.explanation}</p>
                  <div className="pt-2 border-t border-slate-700/50 text-[11px] text-slate-300 font-mono">
                    Key Concept: {activeQuestion.conceptSummary}
                  </div>
                </div>
              )}

              {!isAnswerSubmitted && (
                <button
                  onClick={handleVerifyAnswer}
                  disabled={selectedOption === null}
                  className="w-full py-3 bg-gradient-to-r from-facility-blue to-facility-cyan hover:brightness-110 disabled:opacity-40 text-facility-950 font-bold rounded-xl text-sm transition shadow-lg"
                >
                  Submit & Evaluate Answer
                </button>
              )}
            </motion.div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
              <BookOpen className="w-12 h-12 text-facility-700 mb-3" />
              <h4 className="text-base font-bold text-slate-300 mb-1">Select a Challenge</h4>
              <p className="text-xs max-w-sm">
                Pick any programming language and problem from the left panel to test output prediction, operators, and logic.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
