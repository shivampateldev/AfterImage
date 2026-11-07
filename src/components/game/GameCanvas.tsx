import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { createPhaserGame } from '../../game/PhaserGame';
import { gameEvents, EVENTS } from '../../game/events/GameEventBus';

interface GameCanvasProps {
  currentLevelId: number;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ currentLevelId }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Create single instance of Phaser game
    const game = createPhaserGame(containerRef.current.id, currentLevelId);
    gameRef.current = game;

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []); // Run once on mount

  // When level prop changes, tell the active scene to load the new level
  useEffect(() => {
    if (gameRef.current) {
      gameEvents.emit(EVENTS.SET_CURRENT_LEVEL, { levelId: currentLevelId });
    }
  }, [currentLevelId]);

  return (
    <div 
      id="phaser-game-container" 
      ref={containerRef} 
      className="w-full h-full flex items-center justify-center relative overflow-hidden bg-facility-950"
    />
  );
};

