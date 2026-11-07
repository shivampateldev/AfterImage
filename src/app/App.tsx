import React, { useState, useEffect } from 'react';
import { MainMenu } from '../components/menus/MainMenu';
import { Game25DCanvas } from '../components/game/Game25DCanvas';
import { GameplayHUD } from '../components/hud/GameplayHUD';
import { LevelCompletionModal } from '../components/hud/LevelCompletionModal';
import { LearningHub } from '../components/menus/LearningHub';
import { AchievementsModal } from '../components/menus/AchievementsModal';
import { StatisticsModal } from '../components/menus/StatisticsModal';
import { SettingsModal } from '../components/menus/SettingsModal';
import { AboutSMPModal } from '../components/menus/AboutSMPModal';
import { SMPSplashScreen } from '../components/branding/SMPSplashScreen';
import { gameEvents, EVENTS } from '../game/events/GameEventBus';
import { CAMPAIGN_LEVELS } from '../data/levels';

type AppScreen = 'splash' | 'menu' | 'gameplay';

export const App: React.FC = () => {
  const [screen, setScreen] = useState<AppScreen>(() => {
    // Check if intro has been viewed in this session
    const seen = sessionStorage.getItem('afterimage_intro_viewed');
    return seen ? 'menu' : 'splash';
  });

  const [currentLevelId, setCurrentLevelId] = useState<number>(1);
  const [isLevelCleared, setIsLevelCleared] = useState<boolean>(false);
  const [clearedLevelData, setClearedLevelData] = useState<{
    levelId: number;
    completionTimeSeconds: number;
    hintsUsed: number;
    reflectionQuestion: string;
  } | null>(null);

  // Modals overlay
  const [showLearningHub, setShowLearningHub] = useState<boolean>(false);
  const [showAchievements, setShowAchievements] = useState<boolean>(false);
  const [showStats, setShowStats] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showAboutSMP, setShowAboutSMP] = useState<boolean>(false);

  useEffect(() => {
    const unsubLevelComplete = gameEvents.on(EVENTS.LEVEL_COMPLETED, (data) => {
      setClearedLevelData(data as typeof clearedLevelData);
      setIsLevelCleared(true);
    });

    return () => {
      unsubLevelComplete();
    };
  }, []);

  const handleSplashComplete = () => {
    sessionStorage.setItem('afterimage_intro_viewed', 'true');
    setScreen('menu');
  };

  const handleStartGame = (levelId: number) => {
    setCurrentLevelId(levelId);
    setScreen('gameplay');
    setIsLevelCleared(false);
  };

  const handleContinueNextLevel = () => {
    setIsLevelCleared(false);
    const nextLevel = Math.min(CAMPAIGN_LEVELS.length, currentLevelId + 1);
    setCurrentLevelId(nextLevel);
    gameEvents.emit(EVENTS.SET_CURRENT_LEVEL, { levelId: nextLevel });
  };

  const handleReplayLevel = () => {
    setIsLevelCleared(false);
    gameEvents.emit(EVENTS.TRIGGER_RESTART);
  };

  return (
    <div className="w-screen h-screen relative bg-[#07090e] text-slate-100 overflow-hidden font-sans select-none">
      {screen === 'splash' && (
        <SMPSplashScreen onComplete={handleSplashComplete} />
      )}

      {screen === 'menu' && (
        <MainMenu
          onStartGame={handleStartGame}
          onOpenLearningHub={() => setShowLearningHub(true)}
          onOpenAchievements={() => setShowAchievements(true)}
          onOpenStats={() => setShowStats(true)}
          onOpenSettings={() => setShowSettings(true)}
          onOpenAboutSMP={() => setShowAboutSMP(true)}
        />
      )}

      {screen === 'gameplay' && (
        <div className="relative w-full h-full flex flex-col justify-center items-center">
          <Game25DCanvas currentLevelId={currentLevelId} />
          
          <GameplayHUD
            currentLevelId={currentLevelId}
            onOpenLearningHub={() => setShowLearningHub(true)}
            onOpenAchievements={() => setShowAchievements(true)}
            onOpenStats={() => setShowStats(true)}
            onReturnToMenu={() => setScreen('menu')}
          />

          {isLevelCleared && clearedLevelData && (
            <LevelCompletionModal
              levelId={clearedLevelData.levelId}
              completionTimeSeconds={clearedLevelData.completionTimeSeconds}
              hintsUsed={clearedLevelData.hintsUsed}
              reflectionQuestion={clearedLevelData.reflectionQuestion}
              onContinueNextLevel={handleContinueNextLevel}
              onReplayLevel={handleReplayLevel}
            />
          )}
        </div>
      )}

      {/* Global Modals */}
      {showLearningHub && (
        <LearningHub onClose={() => setShowLearningHub(false)} />
      )}

      {showAchievements && (
        <AchievementsModal onClose={() => setShowAchievements(false)} />
      )}

      {showStats && (
        <StatisticsModal onClose={() => setShowStats(false)} />
      )}

      {showSettings && (
        <SettingsModal onClose={() => setShowSettings(false)} />
      )}

      {showAboutSMP && (
        <AboutSMPModal onClose={() => setShowAboutSMP(false)} />
      )}
    </div>
  );
};
export default App;
