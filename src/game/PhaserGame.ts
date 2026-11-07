import Phaser from 'phaser';
import { MainGameScene } from './scenes/MainGameScene';

export function createPhaserGame(parentContainerId: string, levelId: number = 2): Phaser.Game {
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
      pixelArt: true, // Integer nearest-neighbor crisp pixel scaling
      antialias: false,
      roundPixels: true,
    },
    backgroundColor: '#090e17',
    scene: [MainGameScene],
  };

  const game = new Phaser.Game(config);
  game.scene.start('MainGameScene', { levelId });

  return game;
}
