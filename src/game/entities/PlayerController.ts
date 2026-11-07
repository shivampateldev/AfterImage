import Phaser from 'phaser';
import { sound } from '../../services/audio/AudioService';

export class PlayerController {
  public sprite: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasdKeys!: {
    up: Phaser.Input.Keyboard.Key;
    left: Phaser.Input.Keyboard.Key;
    down: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
    space: Phaser.Input.Keyboard.Key;
    r: Phaser.Input.Keyboard.Key;
    e: Phaser.Input.Keyboard.Key;
  };

  private readonly MOVE_SPEED = 240;
  private readonly JUMP_VELOCITY = -440;
  private isInteractingRequested = false;

  // Virtual inputs for mobile touch controls
  public virtualLeft = false;
  public virtualRight = false;
  public virtualJump = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.sprite = scene.physics.add.sprite(x, y, 'player_idle');
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setBounce(0.02);

    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setSize(24, 44);
    body.setOffset(4, 4);
    body.setGravityY(850);

    if (scene.input.keyboard) {
      this.cursors = scene.input.keyboard.createCursorKeys();
      this.wasdKeys = {
        up: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
        left: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        down: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
        right: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
        space: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
        r: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R),
        e: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E),
      };
    }
  }

  public update(): {
    vx: number;
    vy: number;
    flipX: boolean;
    animState: 'idle' | 'run' | 'jump' | 'fall';
    isInteracting: boolean;
  } {
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    const left = this.cursors?.left.isDown || this.wasdKeys?.left.isDown || this.virtualLeft;
    const right = this.cursors?.right.isDown || this.wasdKeys?.right.isDown || this.virtualRight;
    const jump = this.cursors?.up.isDown || this.wasdKeys?.space.isDown || this.wasdKeys?.up.isDown || this.virtualJump;

    // Horizontal movement
    if (left) {
      body.setVelocityX(-this.MOVE_SPEED);
      this.sprite.setFlipX(true);
    } else if (right) {
      body.setVelocityX(this.MOVE_SPEED);
      this.sprite.setFlipX(false);
    } else {
      body.setVelocityX(0);
    }

    // Jump
    const onFloor = body.blocked.down || body.touching.down;
    if (jump && onFloor) {
      body.setVelocityY(this.JUMP_VELOCITY);
      sound.playJump();
    }

    // Animation state
    let animState: 'idle' | 'run' | 'jump' | 'fall' = 'idle';
    if (!onFloor) {
      animState = body.velocity.y < 0 ? 'jump' : 'fall';
    } else if (Math.abs(body.velocity.x) > 10) {
      animState = 'run';
    }

    const interacting = this.isInteractingRequested;
    this.isInteractingRequested = false;

    return {
      vx: body.velocity.x,
      vy: body.velocity.y,
      flipX: this.sprite.flipX,
      animState,
      isInteracting: interacting,
    };
  }

  public requestInteraction(): void {
    this.isInteractingRequested = true;
  }

  public setPosition(x: number, y: number): void {
    this.sprite.setPosition(x, y);
    (this.sprite.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
  }

  public destroy(): void {
    this.sprite.destroy();
  }
}

