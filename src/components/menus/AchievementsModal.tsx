import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  ArrowLeft, 
  CheckCircle, 
  Lock, 
  Sparkles
} from 'lucide-react';
import { ACHIEVEMENTS } from '../../data/achievements';
import { ProgressionService } from '../../services/progression/ProgressionService';

interface AchievementsModalProps {
  onClose: () => void;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({ onClose }) => {
  const progression = ProgressionService.getInstance();
  const [stats] = useState(progression.getStats());

  const unlockedCount = stats.achievements.length;
  const totalCount = ACHIEVEMENTS.length;
  const progressPercent = Math.round((unlockedCount / totalCount) * 100);

  return (
    <div className="fixed inset-0 bg-facility-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-facility-900 border border-facility-purple/40 rounded-2xl max-w-2xl w-full p-6 shadow-2xl glow-purple max-h-[85vh] flex flex-col"
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
                <Trophy className="w-5 h-5 text-amber-400" />
                <h2 className="text-xl font-bold text-white tracking-wide">
                  FACILITY PROTOCOL ACHIEVEMENTS
                </h2>
              </div>
              <p className="text-xs text-slate-400">
                Unlock milestones across temporal puzzles and computer science challenges.
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs font-mono text-slate-400">UNLOCKED</div>
            <div className="text-base font-bold font-mono text-facility-cyan">
              {unlockedCount} / {totalCount} ({progressPercent}%)
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 bg-facility-950 rounded-full mt-4 overflow-hidden border border-facility-800">
          <div 
            className="h-full bg-gradient-to-r from-facility-blue via-facility-purple to-amber-400 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Achievement Grid */}
        <div className="flex-1 overflow-y-auto mt-4 space-y-2.5 pr-1">
          {ACHIEVEMENTS.map(ach => {
            const isUnlocked = stats.achievements.includes(ach.id);

            return (
              <div
                key={ach.id}
                className={`p-3.5 rounded-xl border flex items-center justify-between transition ${
                  isUnlocked
                    ? 'border-amber-500/40 bg-facility-800/60 shadow-md'
                    : 'border-facility-800/60 bg-facility-950/40 opacity-60'
                }`}
              >
                <div className="flex items-center space-x-3.5">
                  <div className={`p-2.5 rounded-xl border ${
                    isUnlocked 
                      ? 'border-amber-400/50 bg-amber-950/40 text-amber-400' 
                      : 'border-facility-800 bg-facility-900 text-slate-600'
                  }`}>
                    {isUnlocked ? <Trophy className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className={`text-sm font-bold ${isUnlocked ? 'text-white' : 'text-slate-400'}`}>
                        {ach.title}
                      </h4>
                      {isUnlocked && (
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                      )}
                    </div>
                    <p className="text-xs text-slate-400 max-w-md">
                      {ach.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-1 font-mono text-xs font-bold text-amber-400 ml-4 flex-shrink-0">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>+{ach.xpReward} XP</span>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};
