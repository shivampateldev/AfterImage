import React, { useEffect, useRef, useState } from 'react';
import { Three25DScene } from '../../game/engine/Three25DScene';
import { CAMPAIGN_LEVELS } from '../../data/levels';
import { gameEvents, EVENTS } from '../../game/events/GameEventBus';

interface Game25DCanvasProps {
  currentLevelId: number;
}

export const Game25DCanvas: React.FC<Game25DCanvasProps> = ({ currentLevelId }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<Three25DScene | null>(null);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    let isCancelled = false;
    const container = containerRef.current;
    const levelConfig = CAMPAIGN_LEVELS.find(l => l.id === currentLevelId) || CAMPAIGN_LEVELS[0];

    const scene = new Three25DScene(container, levelConfig);
    sceneRef.current = scene;

    // Asynchronous lifecycle initialization (Three.js + Rapier WASM)
    scene.init().then((success) => {
      if (isCancelled) {
        scene.destroy();
        if (sceneRef.current === scene) {
          sceneRef.current = null;
        }
        return;
      }
      if (!success) {
        setInitError('Failed to initialize 2.5D graphics or physics engine.');
      }
    }).catch((err) => {
      if (!isCancelled) {
        console.error('Fatal scene initialization error:', err);
        setInitError(err instanceof Error ? err.message : 'Unknown initialization failure');
      }
    });

    const unsubLevelSet = gameEvents.on(EVENTS.SET_CURRENT_LEVEL, (data) => {
      if (sceneRef.current && sceneRef.current.getState() === 'ready') {
        const payload = data as { levelId: number };
        const cfg = CAMPAIGN_LEVELS.find(l => l.id === payload.levelId) || CAMPAIGN_LEVELS[0];
        sceneRef.current.loadLevel(cfg);
      }
    });

    const unsubRestart = gameEvents.on(EVENTS.TRIGGER_RESTART, () => {
      if (sceneRef.current && sceneRef.current.getState() === 'ready') {
        const cfg = CAMPAIGN_LEVELS.find(l => l.id === currentLevelId) || CAMPAIGN_LEVELS[0];
        sceneRef.current.loadLevel(cfg);
      }
    });

    const unsubRecord = gameEvents.on(EVENTS.TRIGGER_RECORD, () => {
      if (sceneRef.current && sceneRef.current.getState() === 'ready') {
        sceneRef.current.toggleRecording();
      }
    });

    const unsubReplay = gameEvents.on(EVENTS.TRIGGER_REPLAY, () => {
      if (sceneRef.current && sceneRef.current.getState() === 'ready') {
        sceneRef.current.triggerReplayEcho();
      }
    });

    return () => {
      isCancelled = true;
      unsubLevelSet();
      unsubRestart();
      unsubRecord();
      unsubReplay();
      if (sceneRef.current) {
        sceneRef.current.destroy();
        sceneRef.current = null;
      }
    };
  }, []); // React Strict Mode mount/unmount safety

  useEffect(() => {
    if (sceneRef.current && sceneRef.current.getState() === 'ready') {
      const cfg = CAMPAIGN_LEVELS.find(l => l.id === currentLevelId) || CAMPAIGN_LEVELS[0];
      sceneRef.current.loadLevel(cfg);
    }
  }, [currentLevelId]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex items-center justify-center relative overflow-hidden bg-[#07090e]"
    >
      {initError && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 p-6 text-center">
          <div className="bg-red-950/80 border border-red-500 p-6 rounded-2xl max-w-md text-red-200">
            <h3 className="text-lg font-bold mb-2">Simulation Initialization Alert</h3>
            <p className="text-xs mb-4">{initError}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-mono text-xs rounded-xl"
            >
              Reboot Simulation
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
