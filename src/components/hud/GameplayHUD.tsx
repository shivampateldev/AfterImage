import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HelpCircle, 
  Volume2, 
  VolumeX, 
  BookOpen, 
  Trophy, 
  BarChart3, 
  ArrowLeft,
  Heart,
  RotateCcw
} from 'lucide-react';
import { gameEvents, EVENTS } from '../../game/events/GameEventBus';
import { LevelConfig } from '../../types';
import { CAMPAIGN_LEVELS } from '../../data/levels';
import { SarthiCompanion } from '../sarthi/SarthiCompanion';
import { SarthiTutorialOverlay } from './SarthiTutorialOverlay';
import { LiveTestOverlay } from './LiveTestOverlay';
import { VirtualJoystick } from './VirtualJoystick';
import { MobileActionButtons } from './MobileActionButtons';
import { SarthiTutorialService, HighlightControl } from '../../services/sarthi/SarthiTutorialService';
import { platform } from '../../platform/PlatformBridge';

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
  const [lives, setLives] = useState(3);
  const [showHintModal, setShowHintModal] = useState(false);
  const [currentHintIndex, setCurrentHintIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [tutorialHighlight, setTutorialHighlight] = useState<HighlightControl>('NONE');

  const isSector0Tutorial = currentLevelId === 0;

  useEffect(() => {
    const config = CAMPAIGN_LEVELS.find(l => l.id === currentLevelId);
    if (config) {
      setLevelInfo(config);
    }

    const unsubLevelLoaded = gameEvents.on(EVENTS.LEVEL_LOADED, (data) => {
      setLevelInfo(data as LevelConfig);
      setIsRecording(false);
    });

    const unsubRecStart = gameEvents.on(EVENTS.RECORDING_STARTED, () => {
      setIsRecording(true);
    });

    const unsubRecStop = gameEvents.on(EVENTS.RECORDING_STOPPED, () => {
      setIsRecording(false);
    });

    const unsubLives = gameEvents.on(EVENTS.LIVES_UPDATED, (data) => {
      const payload = data as { lives: number; maxLives: number };
      setLives(payload.lives);
    });

    let unsubTutorial: (() => void) | null = null;
    if (isSector0Tutorial) {
      unsubTutorial = SarthiTutorialService.getInstance().subscribe((step) => {
        setTutorialHighlight(step.highlightControl);
      });
    }

    return () => {
      unsubLevelLoaded();
      unsubRecStart();
      unsubRecStop();
      unsubLives();
      if (unsubTutorial) unsubTutorial();
    };
  }, [currentLevelId, isSector0Tutorial]);

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
      <header className="flex justify-between items-start pt-[max(0.75rem,env(safe-area-inset-top))] px-[max(1rem,env(safe-area-inset-left))] pointer-events-none">
        {/* Left: Mission & Level Context */}
        <div className="flex items-center space-x-2.5 pointer-events-auto">
          <button 
            onClick={onReturnToMenu}
            className="p-2 bg-facility-900/90 hover:bg-facility-700/80 border border-facility-700 text-facility-cyan rounded-xl transition shadow-lg backdrop-blur-sm"
            title="Main Menu"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <button
            onClick={handleRestart}
            className={`p-2 bg-facility-900/90 hover:bg-facility-700/80 border text-slate-300 rounded-xl transition shadow-lg backdrop-blur-sm ${
              tutorialHighlight === 'RESTART'
                ? 'border-amber-400 text-amber-300 ring-2 ring-amber-400 animate-pulse'
                : 'border-facility-700'
            }`}
            title="Restart Sector"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <div className="bg-facility-900/90 border border-facility-700/80 px-3.5 py-1.5 rounded-xl backdrop-blur-md shadow-xl flex items-center space-x-2.5">
            <div>
              <span className="text-[10px] uppercase tracking-widest text-facility-cyan font-bold block">
                {levelInfo?.actTitle?.split('–')[0]?.trim() || 'SECTOR'} • LVL {currentLevelId}
              </span>
              <h2 className="text-sm font-bold text-white tracking-wide leading-none mt-0.5">
                {levelInfo?.title || 'Unknown Sector'}
              </h2>
            </div>
            
            <div className="w-px h-5 bg-facility-700/80" />

            {/* Life Resonance Modules */}
            <div className="flex items-center space-x-1" title="Life Resonance Modules">
              {[1, 2, 3].map((heartIndex) => (
                <Heart
                  key={heartIndex}
                  className={`w-4 h-4 transition-all duration-300 ${
                    heartIndex <= lives
                      ? 'text-red-500 fill-red-500 filter drop-shadow-[0_0_5px_rgba(239,68,68,0.7)]'
                      : 'text-slate-600 fill-slate-800/40 opacity-40'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right: Sleek Action Hub */}
        <div className="flex items-center space-x-2 pointer-events-auto pr-[max(0.5rem,env(safe-area-inset-right))]">
          <button
            onClick={() => setShowHintModal(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-facility-900/90 hover:bg-facility-800 border border-amber-500/40 text-amber-300 rounded-xl text-xs font-semibold backdrop-blur-sm transition shadow-lg"
          >
            <HelpCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Hint</span>
          </button>

          <button
            onClick={onOpenLearningHub}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-facility-900/90 hover:bg-facility-800 border border-facility-cyan/40 text-facility-cyan rounded-xl text-xs font-semibold backdrop-blur-sm transition shadow-lg"
            title="Sarthi Code Lab"
          >
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Code Lab</span>
          </button>

          <button
            onClick={onOpenAchievements}
            className="p-2 bg-facility-900/90 hover:bg-facility-800 border border-purple-500/40 text-purple-400 rounded-xl backdrop-blur-sm transition shadow-lg"
            title="Achievements"
          >
            <Trophy className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenStats}
            className="p-2 bg-facility-900/90 hover:bg-facility-800 border border-facility-700 text-slate-300 rounded-xl backdrop-blur-sm transition shadow-lg"
            title="Analytics"
          >
            <BarChart3 className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 bg-facility-900/90 hover:bg-facility-800 border border-facility-700 text-slate-300 rounded-xl backdrop-blur-sm transition shadow-lg"
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Sarthi Sector 0 Interactive Dialogue Overlay */}
      {isSector0Tutorial && (
        <SarthiTutorialOverlay onCompleteTutorial={onReturnToMenu} />
      )}

      {/* Bottom Bar: Action Controls */}
      {platform.getCapabilities().hasTouch ? (
        <footer className="flex justify-between items-end pb-1 px-1">
          {/* Left: Mobile Virtual Joystick */}
          <div className="pointer-events-auto">
            <div className="touch-none select-none p-1 bg-black/20 rounded-3xl border border-cyan-500/15 backdrop-blur-sm shadow-lg">
              <VirtualJoystick size={118} highlightControl={tutorialHighlight} />
            </div>
          </div>

          {/* Right: Mobile Action Buttons (Jump, Use, Rec, Echo) */}
          <div className="pointer-events-auto">
            <MobileActionButtons
              isRecording={isRecording}
              onToggleRecord={handleRecordToggle}
              onSummonEcho={handleReplay}
              highlightControl={tutorialHighlight}
            />
          </div>
        </footer>
      ) : (
        <footer className="flex justify-center items-end pb-3 px-4 pointer-events-none">
          <div className="flex items-center space-x-3 px-4 py-1.5 bg-facility-950/80 border border-facility-700/60 rounded-full text-xs font-mono text-slate-300 backdrop-blur-md shadow-xl">
            <span className="flex items-center space-x-1.5">
              <kbd className="px-1.5 py-0.5 bg-facility-800 rounded border border-slate-600 text-cyan-400 font-bold">A</kbd>
              <kbd className="px-1.5 py-0.5 bg-facility-800 rounded border border-slate-600 text-cyan-400 font-bold">D</kbd>
              <span className="text-slate-400">Move</span>
            </span>
            <span className="text-slate-600">•</span>
            <span className="flex items-center space-x-1.5">
              <kbd className="px-2 py-0.5 bg-facility-800 rounded border border-slate-600 text-cyan-400 font-bold">SPACE</kbd>
              <span className="text-slate-400">Jump</span>
            </span>
            <span className="text-slate-600">•</span>
            <span className="flex items-center space-x-1.5">
              <kbd className={`px-1.5 py-0.5 bg-facility-800 rounded border font-bold ${
                isRecording 
                  ? 'border-red-500 text-red-400 animate-pulse' 
                  : tutorialHighlight === 'RECORD' 
                  ? 'border-amber-400 text-amber-300 animate-pulse' 
                  : 'border-slate-600 text-cyan-400'
              }`}>R</kbd>
              <span className={isRecording ? 'text-red-400 font-semibold' : 'text-slate-400'}>
                {isRecording ? 'Recording...' : 'Record'}
              </span>
            </span>
            <span className="text-slate-600">•</span>
            <span className="flex items-center space-x-1.5">
              <kbd className={`px-1.5 py-0.5 bg-facility-800 rounded border font-bold ${
                tutorialHighlight === 'ECHO'
                  ? 'border-cyan-400 text-cyan-300 animate-pulse'
                  : 'border-slate-600 text-purple-400'
              }`}>E</kbd>
              <span className="text-slate-400">Echo Clone</span>
            </span>
            <span className="text-slate-600">•</span>
            <span className="flex items-center space-x-1.5">
              <kbd className="px-1.5 py-0.5 bg-facility-800 rounded border border-slate-600 text-cyan-400 font-bold">F</kbd>
              <span className="text-slate-400">Interact</span>
            </span>
            <span className="text-slate-600">•</span>
            <span className="flex items-center space-x-1.5">
              <kbd className="px-1.5 py-0.5 bg-facility-800 rounded border border-slate-600 text-slate-300 font-bold">F11</kbd>
              <span className="text-slate-400">Fullscreen</span>
            </span>
          </div>
        </footer>
      )}

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

      {/* Permanent AI Wolf Companion — SARTHI (For levels > 0) */}
      {!isSector0Tutorial && <SarthiCompanion currentLevelId={currentLevelId} />}

      {/* Live Testing Telemetry Overlay */}
      <LiveTestOverlay />
    </div>
  );
};
