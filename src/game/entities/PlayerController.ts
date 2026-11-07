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
    f: Phaser.Input.Keyboard.Key;
  };

  private readonly MOVE_SPEED = 240;
  private readonly JUMP_VELOCITY = -450;
  private isInteractingRequested = false;

  // Coyote time & jump buffering
  private coyoteTimer = 0;
  private jumpBufferTimer = 0;

  // Virtual inputs for touch/mobile
  public virtualLeft = false;
  public virtualRight = false;
  public virtualJump = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    // 32x48 pixel art sprite
    this.sprite = scene.physics.add.sprite(x, y, 'player_sheet', 0);
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setBounce(0.0);

    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setSize(20, 42);
    body.setOffset(6, 6);
    body.setGravityY(980);

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
        f: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F),
      };
    }

    this.sprite.play('player_idle_anim');
  }

  public update(delta: number): {
    vx: number;
    vy: number;
    flipX: boolean;
    animState: 'idle' | 'run' | 'jump' | 'fall';
    isInteracting: boolean;
  } {
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    const dt = delta / 1000;

    const left = this.cursors?.left.isDown || this.wasdKeys?.left.isDown || this.virtualLeft;
    const right = this.cursors?.right.isDown || this.wasdKeys?.right.isDown || this.virtualRight;
    const jumpPressed = Phaser.Input.Keyboard.JustDown(this.cursors?.up) ||
                        Phaser.Input.Keyboard.JustDown(this.wasdKeys?.space) ||
                        Phaser.Input.Keyboard.JustDown(this.wasdKeys?.up) ||
                        this.virtualJump;

    if (Phaser.Input.Keyboard.JustDown(this.wasdKeys?.f)) {
      this.isInteractingRequested = true;
    }

    const onFloor = body.blocked.down || body.touching.down;
    if (onFloor) {
      this.coyoteTimer = 0.1;
    } else {
      this.coyoteTimer -= dt;
    }

    if (jumpPressed) {
      this.jumpBufferTimer = 0.12;
    } else {
      this.jumpBufferTimer -= dt;
    }

    // Horizontal Locomotion
    if (left) {
      body.setVelocityX(-this.MOVE_SPEED);
      this.sprite.setFlipX(true);
      if (onFloor && this.sprite.anims.currentAnim?.key !== 'player_run_anim') {
        this.sprite.play('player_run_anim');
      }
    } else if (right) {
      body.setVelocityX(this.MOVE_SPEED);
      this.sprite.setFlipX(false);
      if (onFloor && this.sprite.anims.currentAnim?.key !== 'player_run_anim') {
        this.sprite.play('player_run_anim');
      }
    } else {
      body.setVelocityX(0);
      if (onFloor && this.sprite.anims.currentAnim?.key !== 'player_idle_anim') {
        this.sprite.play('player_idle_anim');
      }
    }

    // Jumping execution
    if (this.jumpBufferTimer > 0 && this.coyoteTimer > 0) {
      body.setVelocityY(this.JUMP_VELOCITY);
      this.coyoteTimer = 0;
      this.jumpBufferTimer = 0;
      this.sprite.play('player_jump_anim');
      sound.playJump();
    }

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
}
