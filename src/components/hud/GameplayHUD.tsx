import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  RotateCcw, 
  HelpCircle, 
  Zap, 
  Volume2, 
  VolumeX, 
  BookOpen, 
  Trophy, 
  BarChart3, 
  ArrowLeft
} from 'lucide-react';
import { gameEvents, EVENTS } from '../../game/events/GameEventBus';
import { LevelConfig } from '../../types';
import { CAMPAIGN_LEVELS } from '../../data/levels';

interface GameplayHUDProps {
  currentLevelId: number;
  onOpenLearningHub: () => void;
  onOpenAchievements: () => void;
  onOpenStats: () => void;
  onReturnToMenu: () => void;
}

export const GameplayHUD: React.FC<GameplayHUDProps> = ({
  currentLevelId,
  onOpenLearningHub,
  onOpenAchievements,
  onOpenStats,
  onReturnToMenu,
}) => {
  const [levelInfo, setLevelInfo] = useState<Partial<LevelConfig> | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordProgress, setRecordProgress] = useState(0);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [activeEchoCount, setActiveEchoCount] = useState(0);
  const [showHintModal, setShowHintModal] = useState(false);
  const [currentHintIndex, setCurrentHintIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const config = CAMPAIGN_LEVELS.find(l => l.id === currentLevelId);
    if (config) {
      setLevelInfo(config);
    }

    const unsubLevelLoaded = gameEvents.on(EVENTS.LEVEL_LOADED, (data) => {
      setLevelInfo(data as LevelConfig);
      setIsRecording(false);
      setRecordProgress(0);
      setActiveEchoCount(0);
    });

    const unsubRecStart = gameEvents.on(EVENTS.RECORDING_STARTED, () => {
      setIsRecording(true);
      setRecordProgress(0);
    });

    const unsubRecStop = gameEvents.on(EVENTS.RECORDING_STOPPED, () => {
      setIsRecording(false);
      setRecordProgress(0);
      setRecordingSeconds(0);
    });

    const unsubRecUpdate = gameEvents.on(EVENTS.RECORDING_UPDATE, (data) => {
      const payload = data as { elapsedSeconds: number; maxSeconds: number; progress: number };
      setRecordingSeconds(payload.elapsedSeconds);
      setRecordProgress(payload.progress * 100);
    });

    const unsubEchoSpawn = gameEvents.on(EVENTS.ECHO_SPAWNED, (data) => {
      const payload = data as { activeCount: number };
      setActiveEchoCount(payload.activeCount);
    });

    const unsubEchoExpired = gameEvents.on(EVENTS.ECHO_EXPIRED, (data) => {
      const payload = data as { remaining: number };
      setActiveEchoCount(payload.remaining);
    });

    return () => {
      unsubLevelLoaded();
      unsubRecStart();
      unsubRecStop();
      unsubRecUpdate();
      unsubEchoSpawn();
      unsubEchoExpired();
    };
  }, [currentLevelId]);

  const handleRecordToggle = () => {
    gameEvents.emit(EVENTS.TRIGGER_RECORD);
  };

  const handleReplay = () => {
    gameEvents.emit(EVENTS.TRIGGER_REPLAY);
  };

  const handleRestart = () => {
    gameEvents.emit(EVENTS.TRIGGER_RESTART);
  };

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 z-20">
      {/* Top Bar Header */}
      <header className="flex justify-between items-start">
        {/* Left: Mission & Level Context */}
        <div className="flex items-center space-x-3 pointer-events-auto">
          <button 
            onClick={onReturnToMenu}
            className="p-2 bg-facility-900/90 hover:bg-facility-700/80 border border-facility-700 text-facility-cyan rounded-lg transition shadow-lg backdrop-blur-sm"
            title="Main Menu"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="bg-facility-900/90 border border-facility-700/80 px-4 py-2 rounded-xl backdrop-blur-md shadow-xl">
            <div className="flex items-center space-x-2">
              <span className="text-xs uppercase tracking-widest text-facility-cyan font-semibold">
                {levelInfo?.actTitle || 'SECTOR OPERATIONS'}
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-xs font-mono text-slate-400">
                LEVEL 0{currentLevelId}
              </span>
            </div>
            <h2 className="text-lg font-bold text-white tracking-wide">
              {levelInfo?.title || 'Unknown Sector'}
            </h2>
          </div>
        </div>

        {/* Right: Quick Navigation Hub */}
        <div className="flex items-center space-x-2 pointer-events-auto">
          <button
            onClick={() => setShowHintModal(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-facility-900/90 hover:bg-facility-800 border border-amber-500/40 text-amber-400 rounded-lg text-sm font-semibold backdrop-blur-sm transition"
          >
            <HelpCircle className="w-4 h-4" />
            <span>Hint</span>
          </button>

          <button
            onClick={onOpenLearningHub}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-facility-900/90 hover:bg-facility-800 border border-facility-cyan/40 text-facility-cyan rounded-lg text-sm font-semibold backdrop-blur-sm transition"
          >
            <BookOpen className="w-4 h-4" />
            <span>Code Lab</span>
          </button>

          <button
            onClick={onOpenAchievements}
            className="p-2 bg-facility-900/90 hover:bg-facility-800 border border-purple-500/40 text-purple-400 rounded-lg backdrop-blur-sm transition"
            title="Achievements"
          >
            <Trophy className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenStats}
            className="p-2 bg-facility-900/90 hover:bg-facility-800 border border-facility-700 text-slate-300 rounded-lg backdrop-blur-sm transition"
            title="Analytics"
          >
            <BarChart3 className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 bg-facility-900/90 hover:bg-facility-800 border border-facility-700 text-slate-300 rounded-lg backdrop-blur-sm transition"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Middle Banner: Temporal Recording Status */}
      <div className="flex flex-col items-center">
        {isRecording && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-red-950/80 border border-red-500 text-red-200 px-4 py-2 rounded-full flex items-center space-x-3 backdrop-blur-md glow-purple"
          >
            <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
            <span className="text-sm font-bold tracking-wider uppercase font-mono">
              RECORDING TIMELINE ({recordingSeconds.toFixed(1)}s / {levelInfo?.maxRecordingDurationSeconds || 10}s)
            </span>
          </motion.div>
        )}

        {/* Recording Timeline Bar */}
        {isRecording && (
          <div className="w-64 h-1.5 bg-facility-900/80 rounded-full mt-2 overflow-hidden border border-red-500/50">
            <motion.div 
              className="h-full bg-gradient-to-r from-red-500 via-purple-500 to-facility-cyan"
              style={{ width: `${recordProgress}%` }}
            />
          </div>
        )}
      </div>

      {/* Bottom Bar: Action Controls & Status Bar */}
      <footer className="flex justify-between items-end">
        {/* Left: Active Echo Counters */}
        <div className="bg-facility-900/90 border border-facility-700/80 p-3 rounded-xl backdrop-blur-md shadow-xl flex items-center space-x-4 pointer-events-auto">
          <div className="flex items-center space-x-2">
            <Zap className={`w-5 h-5 ${activeEchoCount > 0 ? 'text-facility-purple animate-pulse' : 'text-slate-500'}`} />
            <div>
              <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Temporal Clones</div>
              <div className="text-sm font-bold font-mono text-facility-cyan">
                {activeEchoCount} / {levelInfo?.maxActiveEchoes || 1} ACTIVE
              </div>
            </div>
          </div>
        </div>

        {/* Center: Primary Playback Actions */}
        <div className="flex items-center space-x-3 pointer-events-auto">
          <button
            onClick={handleRecordToggle}
            className={`px-5 py-3 rounded-xl font-bold flex items-center space-x-2 border transition shadow-lg backdrop-blur-md ${
              isRecording 
                ? 'bg-red-600/90 border-red-400 text-white animate-pulse' 
                : 'bg-facility-900/90 hover:bg-facility-800 border-facility-cyan/60 text-facility-cyan'
            }`}
          >
            <div className={`w-3 h-3 rounded-full ${isRecording ? 'bg-white' : 'bg-red-500'}`} />
            <span>{isRecording ? 'STOP [R]' : 'RECORD [R]'}</span>
          </button>

          <button
            onClick={handleReplay}
            className="px-6 py-3 bg-gradient-to-r from-facility-blue to-facility-purple hover:brightness-110 border border-facility-cyan/60 text-white rounded-xl font-bold flex items-center space-x-2 shadow-lg shadow-purple-900/30 transition"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>SUMMON ECHO [E]</span>
          </button>

          <button
            onClick={handleRestart}
            className="p-3 bg-facility-900/90 hover:bg-facility-800 border border-facility-700 text-slate-300 rounded-xl transition"
            title="Reset Level"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>

        {/* Right: Keyboard Control Reference */}
        <div className="hidden md:flex bg-facility-900/80 border border-facility-700/60 p-2.5 rounded-xl backdrop-blur-sm text-xs text-slate-400 font-mono space-x-3">
          <span><kbd className="bg-facility-800 px-1.5 py-0.5 rounded text-white border border-facility-700">A/D</kbd> Move</span>
          <span><kbd className="bg-facility-800 px-1.5 py-0.5 rounded text-white border border-facility-700">Space</kbd> Jump</span>
          <span><kbd className="bg-facility-800 px-1.5 py-0.5 rounded text-white border border-facility-700">R</kbd> Record</span>
          <span><kbd className="bg-facility-800 px-1.5 py-0.5 rounded text-white border border-facility-700">E</kbd> Echo</span>
        </div>
      </footer>

      {/* Hints Modal */}
      <AnimatePresence>
        {showHintModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 pointer-events-auto">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-facility-900 border border-facility-cyan/40 p-6 rounded-2xl max-w-md w-full shadow-2xl glow-cyan"
            >
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-2 text-facility-cyan">
                  <HelpCircle className="w-5 h-5" />
                  <h3 className="font-bold text-lg">Facility Tactical Advisory</h3>
                </div>
                <span className="text-xs font-mono text-slate-400">
                  Hint {currentHintIndex + 1} of {levelInfo?.hints?.length || 1}
                </span>
              </div>

              <div className="bg-facility-950/80 border border-facility-700/60 p-4 rounded-xl text-slate-200 text-sm mb-6 leading-relaxed">
                {levelInfo?.hints && levelInfo.hints[currentHintIndex] 
                  ? levelInfo.hints[currentHintIndex]
                  : 'Coordinate with your recorded temporal echo to bypass physical security locks.'}
              </div>

              <div className="flex justify-between items-center">
                <button
                  onClick={() => setCurrentHintIndex(prev => Math.max(0, prev - 1))}
                  disabled={currentHintIndex === 0}
                  className="px-3 py-1.5 bg-facility-800 hover:bg-facility-700 disabled:opacity-30 text-xs rounded-lg text-slate-300 font-semibold"
                >
                  Previous
                </button>

                <button
                  onClick={() => setShowHintModal(false)}
                  className="px-5 py-2 bg-facility-cyan hover:bg-cyan-400 text-facility-950 font-bold text-sm rounded-xl transition"
                >
                  Understood
                </button>

                <button
                  onClick={() => setCurrentHintIndex(prev => Math.min((levelInfo?.hints?.length || 1) - 1, prev + 1))}
                  disabled={!levelInfo?.hints || currentHintIndex >= levelInfo.hints.length - 1}
                  className="px-3 py-1.5 bg-facility-800 hover:bg-facility-700 disabled:opacity-30 text-xs rounded-lg text-slate-300 font-semibold"
                >
                  Next
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
