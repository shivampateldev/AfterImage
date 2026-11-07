import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  ArrowLeft, 
  Zap, 
  CheckCircle2, 
  Clock, 
  Target, 
  Code,
  Activity,
  Award
} from 'lucide-react';
import { ProgressionService } from '../../services/progression/ProgressionService';
import { ProgrammingLanguage } from '../../types';

interface StatisticsModalProps {
  onClose: () => void;
}

export const StatisticsModal: React.FC<StatisticsModalProps> = ({ onClose }) => {
  const progression = ProgressionService.getInstance();
  const [stats] = useState(progression.getStats());

  const totalAttempted = stats.questionsAttempted;
  const overallAccuracy = totalAttempted > 0 
    ? Math.round((stats.correctAnswers / totalAttempted) * 100) 
    : 0;

  const languages: ProgrammingLanguage[] = ['python', 'javascript', 'c', 'cpp', 'java'];

  return (
    <div className="fixed inset-0 bg-facility-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-facility-900 border border-facility-cyan/40 rounded-2xl max-w-3xl w-full p-6 shadow-2xl glow-cyan max-h-[88vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-facility-800">
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="p-2 bg-facility-800 hover:bg-facility-700 text-facility-cyan rounded-xl transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-facility-cyan" />
                <h2 className="text-xl font-bold text-white tracking-wide">
                  OPERATIONAL METRICS & COGNITIVE ANALYTICS
                </h2>
              </div>
              <p className="text-xs text-slate-400">
                Real-time tracking of puzzle efficiency, echo deployment, and programming mastery.
              </p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto mt-4 space-y-6 pr-1">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-facility-950/80 border border-facility-700/60 p-3.5 rounded-xl">
              <div className="flex items-center space-x-1.5 text-xs text-slate-400 mb-1">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Total XP Earned</span>
              </div>
              <div className="text-2xl font-bold font-mono text-amber-400">
                {stats.totalXp}
              </div>
            </div>

            <div className="bg-facility-950/80 border border-facility-700/60 p-3.5 rounded-xl">
              <div className="flex items-center space-x-1.5 text-xs text-slate-400 mb-1">
                <Award className="w-4 h-4 text-facility-cyan" />
                <span>Sectors Cleared</span>
              </div>
              <div className="text-2xl font-bold font-mono text-facility-cyan">
                {stats.levelsCompleted.length} / 9
              </div>
            </div>

            <div className="bg-facility-950/80 border border-facility-700/60 p-3.5 rounded-xl">
              <div className="flex items-center space-x-1.5 text-xs text-slate-400 mb-1">
                <Target className="w-4 h-4 text-emerald-400" />
                <span>Coding Accuracy</span>
              </div>
              <div className="text-2xl font-bold font-mono text-emerald-400">
                {overallAccuracy}%
              </div>
            </div>

            <div className="bg-facility-950/80 border border-facility-700/60 p-3.5 rounded-xl">
              <div className="flex items-center space-x-1.5 text-xs text-slate-400 mb-1">
                <Activity className="w-4 h-4 text-facility-purple" />
                <span>Echoes Summoned</span>
              </div>
              <div className="text-2xl font-bold font-mono text-facility-purple">
                {stats.echoesUsedTotal}
              </div>
            </div>
          </div>

          {/* Programming Language Mastery Chart */}
          <div className="bg-facility-950/70 border border-facility-800 p-4 rounded-xl">
            <h4 className="text-xs uppercase font-mono tracking-wider text-facility-cyan mb-3 flex items-center space-x-1.5">
              <Code className="w-4 h-4" />
              <span>Language Proficiency Breakdown</span>
            </h4>

            <div className="space-y-3">
              {languages.map(lang => {
                const langData = stats.accuracyByLanguage[lang] || { attempted: 0, correct: 0 };
                const pct = langData.attempted > 0 
                  ? Math.round((langData.correct / langData.attempted) * 100) 
                  : 0;

                return (
                  <div key={lang} className="space-y-1">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="uppercase font-semibold text-slate-300">{lang}</span>
                      <span className="text-slate-400">
                        {langData.correct} / {langData.attempted} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-facility-900 rounded-full overflow-hidden border border-facility-800">
                      <div
                        className="h-full bg-gradient-to-r from-facility-blue to-facility-cyan"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Concepts Mastered Tags */}
          <div className="bg-facility-950/70 border border-facility-800 p-4 rounded-xl">
            <h4 className="text-xs uppercase font-mono tracking-wider text-slate-300 mb-3">
              Verified Concept Mastery ({stats.conceptsMastered.length})
            </h4>

            {stats.conceptsMastered.length === 0 ? (
              <p className="text-xs text-slate-500 italic">
                Solve coding challenges in the Code Lab to verify core concepts and data structures.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {stats.conceptsMastered.map((c, idx) => (
                  <span
                    key={idx}
                    className="text-xs bg-facility-800/80 border border-facility-cyan/30 text-facility-cyan px-2.5 py-1 rounded-lg font-mono flex items-center space-x-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{c}</span>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Level Highscores & Best Times */}
          <div className="bg-facility-950/70 border border-facility-800 p-4 rounded-xl">
            <h4 className="text-xs uppercase font-mono tracking-wider text-slate-300 mb-3 flex items-center space-x-1.5">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>Sector Records</span>
            </h4>

            {Object.keys(stats.levelHighScores).length === 0 ? (
              <p className="text-xs text-slate-500 italic">
                No sectors cleared yet. Complete campaign missions to log best clear times and star rankings.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                {Object.entries(stats.levelHighScores).map(([lvl, record]) => (
                  <div key={lvl} className="bg-facility-900 p-2.5 rounded-lg border border-facility-800 flex justify-between items-center text-xs">
                    <span className="font-bold text-white font-mono">SECTOR 0{lvl}</span>
                    <span className="text-facility-cyan font-mono">{record.bestTimeSeconds}s</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

