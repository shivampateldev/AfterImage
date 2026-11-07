import React, { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { createPhaserGame } from '../../game/PhaserGame';
import { gameEvents, EVENTS } from '../../game/events/GameEventBus';

interface Game25DCanvasProps {
  currentLevelId: number;
}

export const Game25DCanvas: React.FC<Game25DCanvasProps> = ({ currentLevelId }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const [initError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const containerId = 'phaser-pixel-game-container';
    containerRef.current.id = containerId;

    // Instantiate 2D Pixel-Art Phaser Engine
    const phaserGame = createPhaserGame(containerId, currentLevelId);
    gameRef.current = phaserGame;

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (gameRef.current && gameRef.current.scene.isActive('MainGameScene')) {
      gameEvents.emit(EVENTS.SET_CURRENT_LEVEL, { levelId: currentLevelId });
    }
  }, [currentLevelId]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex items-center justify-center relative overflow-hidden bg-[#07090e]"
      style={{ imageRendering: 'pixelated' }}
    >
      {initError && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 p-6 text-center">
          <div className="bg-red-950/80 border border-red-500 p-6 rounded-2xl max-w-md text-red-200">
            <h3 className="text-lg font-bold mb-2">Engine Initialization Alert</h3>
            <p className="text-xs mb-4">{initError}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-mono text-xs rounded-xl"
            >
              Reboot Engine
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
