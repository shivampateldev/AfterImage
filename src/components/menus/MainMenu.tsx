import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Play, 
  Zap, 
  Terminal, 
  Trophy, 
  BarChart3, 
  Settings, 
  Info,
  Layers
} from 'lucide-react';
import { CAMPAIGN_LEVELS } from '../../data/levels';
import { ProgressionService } from '../../services/progression/ProgressionService';
import { SMPLogo } from '../branding/SMPLogo';

interface MainMenuProps {
  onStartGame: (levelId: number) => void;
  onOpenLearningHub: () => void;
  onOpenAchievements: () => void;
  onOpenStats: () => void;
  onOpenSettings: () => void;
  onOpenAboutSMP: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  onStartGame,
  onOpenLearningHub,
  onOpenAchievements,
  onOpenStats,
  onOpenSettings,
  onOpenAboutSMP,
}) => {
  const progression = ProgressionService.getInstance();
  const [stats] = useState(progression.getStats());
  const [showLevelSelect, setShowLevelSelect] = useState<boolean>(false);

  const highestUnlocked = Math.min(9, Math.max(1, (stats.levelsCompleted.length > 0 ? Math.max(...stats.levelsCompleted) + 1 : 1)));

  return (
    <div className="relative w-full h-full flex flex-col justify-between p-6 md:p-12 overflow-hidden bg-[#07090e]">
      {/* Background Visual Atmosphere */}
      <div className="absolute inset-0 scanlines opacity-40 pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-r from-[#D4A52C]/10 via-[#38D9FF]/15 to-[#9875FF]/20 blur-3xl pointer-events-none" />

      {/* Top Navigation */}
      <header className="relative z-10 flex justify-between items-center">
        {/* SMP Official Attribution Brand */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={onOpenAboutSMP}>
          <div className="p-1 rounded-xl bg-facility-900/80 border border-[#D4A52C]/40 backdrop-blur-md">
            <SMPLogo size="sm" showTagline={false} />
          </div>
          <div className="hidden sm:block">
            <div className="text-[10px] uppercase font-mono tracking-[0.25em] text-[#D4A52C] font-bold">
              AN SMP ORIGINAL
            </div>
            <div className="text-[9px] font-mono text-slate-400">
              "1% CHANCE. 99% FAITH."
            </div>
          </div>
        </div>

        {/* Global Controls & Metrics */}
        <div className="flex items-center space-x-2.5">
          <div className="bg-facility-900/80 border border-facility-700/60 px-3.5 py-1.5 rounded-xl font-mono text-xs flex items-center space-x-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <span className="text-slate-300">XP:</span>
            <span className="text-amber-400 font-bold">{stats.totalXp}</span>
          </div>

          <button
            onClick={onOpenAchievements}
            className="p-2.5 bg-facility-900/80 hover:bg-facility-800 border border-purple-500/40 text-purple-300 rounded-xl transition"
            title="Achievements"
          >
            <Trophy className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenStats}
            className="p-2.5 bg-facility-900/80 hover:bg-facility-800 border border-facility-700 text-slate-300 rounded-xl transition"
            title="Analytics"
          >
            <BarChart3 className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenSettings}
            className="p-2.5 bg-facility-900/80 hover:bg-facility-800 border border-facility-700 text-slate-300 rounded-xl transition"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenAboutSMP}
            className="p-2.5 bg-facility-900/80 hover:bg-facility-800 border border-[#D4A52C]/50 text-[#D4A52C] rounded-xl transition"
            title="About SMP & Credits"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Center Branding & Play Actions */}
      <div className="relative z-10 max-w-2xl my-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-facility-purple/20 border border-facility-purple/40 text-facility-purple font-mono text-xs uppercase font-bold tracking-widest mb-3">
            <Layers className="w-3.5 h-3.5 text-facility-cyan" />
            <span>2.5D KINEMATIC SIMULATION ENGINE</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-facility-cyan tracking-wider font-mono uppercase leading-tight">
            AFTERIMAGE
          </h1>
          <h2 className="text-xl md:text-2xl font-semibold text-facility-cyan tracking-widest mt-1 mb-4">
            THE LAST ECHO
          </h2>

          <p className="text-slate-300 text-sm md:text-base leading-relaxed mb-8 max-w-xl">
            <span className="text-[#38D9FF] font-semibold">"Your past self becomes your greatest teammate."</span> Reconstruct chronological timelines to activate magnetic pressure plates, override laser containment sectors, and escape the subterranean temporal facility.
          </p>

          {!showLevelSelect ? (
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => onStartGame(highestUnlocked)}
                className="px-8 py-4 bg-gradient-to-r from-facility-blue via-facility-cyan to-[#D4A52C] hover:brightness-110 text-facility-950 font-bold rounded-2xl text-base shadow-xl glow-cyan flex items-center space-x-3 transition group"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>{stats.levelsCompleted.length > 0 ? 'RESUME CAMPAIGN' : 'INITIATE CAMPAIGN'}</span>
              </button>

              <button
                onClick={() => setShowLevelSelect(true)}
                className="px-6 py-4 bg-facility-900/90 hover:bg-facility-800 border border-facility-700/80 text-white font-semibold rounded-2xl text-sm transition"
              >
                SECTOR SELECTION (1-9)
              </button>

              <button
                onClick={onOpenLearningHub}
                className="px-6 py-4 bg-facility-900/90 hover:bg-facility-800 border border-[#D4A52C]/40 text-[#D4A52C] font-semibold rounded-2xl text-sm transition flex items-center space-x-2"
              >
                <Terminal className="w-4 h-4" />
                <span>NEURAL CODE LAB</span>
              </button>
            </div>
          ) : (
            /* Level Select View */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-facility-900/90 border border-facility-700/80 p-5 rounded-2xl backdrop-blur-md"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-facility-cyan">
                  Select Facility Sector
                </h3>
                <button
                  onClick={() => setShowLevelSelect(false)}
                  className="text-xs text-slate-400 hover:text-white underline font-mono"
                >
                  Back to Menu
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                {CAMPAIGN_LEVELS.map(level => {
                  const isCompleted = stats.levelsCompleted.includes(level.id);
                  const isUnlocked = level.id <= highestUnlocked;

                  return (
                    <button
                      key={level.id}
                      disabled={!isUnlocked}
                      onClick={() => onStartGame(level.id)}
                      className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                        isCompleted
                          ? 'border-emerald-500/40 bg-emerald-950/20 hover:border-emerald-500'
                          : isUnlocked
                          ? 'border-facility-cyan/50 bg-facility-800/80 hover:border-facility-cyan glow-cyan'
                          : 'border-facility-800 bg-facility-950/40 opacity-40 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-mono text-facility-cyan font-bold">
                          SECTOR 0{level.id}
                        </span>
                        {isCompleted && (
                          <span className="text-[10px] font-mono text-emerald-400 font-bold">✓ CLEARED</span>
                        )}
                      </div>
                      <div className="text-xs font-semibold text-white truncate">
                        {level.title}
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Footer Info */}
      <footer className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs text-slate-400 font-mono pt-6 border-t border-facility-800/60">
        <div>
          DESKTOP: <span className="text-slate-300">A/D</span> MOVE • <span className="text-slate-300">SPACE</span> JUMP • <span className="text-facility-cyan">R</span> RECORD • <span className="text-purple-400">E</span> ECHO
        </div>
        <div className="mt-2 sm:mt-0 flex items-center space-x-2">
          <span>AN SMP ORIGINAL</span>
          <span>•</span>
          <span className="text-[#D4A52C]">"1% CHANCE. 99% FAITH."</span>
        </div>
      </footer>
    </div>
  );
};
