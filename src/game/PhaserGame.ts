import Phaser from 'phaser';
import { MainGameScene } from './scenes/MainGameScene';

export function createPhaserGame(parentContainerId: string, levelId: number = 1): Phaser.Game {
  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent: parentContainerId,
    width: 960,
    height: 600,
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: 0, x: 0 },
        debug: false,
      },
    },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    render: {
      pixelArt: false,
      antialias: true,
    },
    backgroundColor: '#07090e',
    scene: [MainGameScene],
  };

  const game = new Phaser.Game(config);

  // Pass initial level
  game.scene.start('MainGameScene', { levelId });

  return game;
}

