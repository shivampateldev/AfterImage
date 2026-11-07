import Phaser from 'phaser';
import { EchoSample } from '../../types';
import { gameEvents, EVENTS } from '../events/GameEventBus';
import { sound } from '../../services/audio/AudioService';
import { ProgressionService } from '../../services/progression/ProgressionService';

export interface ActiveEchoInstance {
  id: string;
  samples: EchoSample[];
  playbackStartTime: number;
  durationMs: number;
  sprite: Phaser.Physics.Arcade.Sprite;
}

export class EchoSystem {
  private scene: Phaser.Scene;
  private activeEchoes: ActiveEchoInstance[] = [];
  private storedEchoTracks: EchoSample[][] = [];
  private maxActiveEchoes: number = 1;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  public setMaxActiveEchoes(max: number): void {
    this.maxActiveEchoes = max;
  }

  public storeRecordedTrack(samples: EchoSample[]): void {
    if (samples.length === 0) return;
    this.storedEchoTracks.push(samples);
    if (this.storedEchoTracks.length > this.maxActiveEchoes) {
      this.storedEchoTracks.shift();
    }
  }

  public spawnEchoFromLastRecording(): boolean {
    if (this.storedEchoTracks.length === 0) return false;

    const track = this.storedEchoTracks[this.storedEchoTracks.length - 1];
    if (track.length === 0) return false;

    if (this.activeEchoes.length >= this.maxActiveEchoes) {
      this.destroyEcho(this.activeEchoes[0]);
    }

    const firstSample = track[0];
    const sprite = this.scene.physics.add.sprite(firstSample.x, firstSample.y, 'echo_sheet', 0);
    sprite.setCollideWorldBounds(true);
    sprite.setDepth(18);

    const body = sprite.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setSize(20, 42);
    body.setOffset(6, 6);

    sprite.play('echo_idle_anim');

    const durationMs = track[track.length - 1].timeOffset;

    const instance: ActiveEchoInstance = {
      id: `echo_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      samples: track,
      playbackStartTime: performance.now(),
      durationMs,
      sprite,
    };

    this.activeEchoes.push(instance);
    sound.playEchoReplay();
    ProgressionService.getInstance().recordEchoUsed();
    gameEvents.emit(EVENTS.ECHO_SPAWNED, { echoId: instance.id, activeCount: this.activeEchoes.length });

    return true;
  }

  public update(currentTime: number): { activeEchoes: Phaser.Physics.Arcade.Sprite[]; interactingEchoes: Phaser.Physics.Arcade.Sprite[] } {
    const toRemove: ActiveEchoInstance[] = [];
    const interactingSprites: Phaser.Physics.Arcade.Sprite[] = [];

    for (const echo of this.activeEchoes) {
      const elapsed = currentTime - echo.playbackStartTime;

      if (elapsed > echo.durationMs) {
        toRemove.push(echo);
        continue;
      }

      const sample = this.samplePlayback(echo.samples, elapsed);
      if (sample) {
        echo.sprite.setPosition(sample.x, sample.y);
        echo.sprite.setFlipX(sample.flipX);

        if (sample.animState === 'run' && echo.sprite.anims.currentAnim?.key !== 'echo_run_anim') {
          echo.sprite.play('echo_run_anim');
        } else if (sample.animState === 'idle' && echo.sprite.anims.currentAnim?.key !== 'echo_idle_anim') {
          echo.sprite.play('echo_idle_anim');
        }

        const pulse = 0.65 + 0.2 * Math.sin(elapsed / 120);
        echo.sprite.setAlpha(pulse);

        if (sample.isInteracting) {
          interactingSprites.push(echo.sprite);
        }
      }
    }

    for (const expired of toRemove) {
      this.destroyEcho(expired);
    }

    return {
      activeEchoes: this.activeEchoes.map(e => e.sprite),
      interactingEchoes: interactingSprites,
    };
  }

  private samplePlayback(samples: EchoSample[], targetOffsetMs: number): EchoSample | null {
    if (samples.length === 0) return null;
    if (targetOffsetMs <= samples[0].timeOffset) return samples[0];
    if (targetOffsetMs >= samples[samples.length - 1].timeOffset) return samples[samples.length - 1];

    let low = 0;
    let high = samples.length - 1;

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      if (samples[mid].timeOffset === targetOffsetMs) return samples[mid];
      if (samples[mid].timeOffset < targetOffsetMs) low = mid + 1;
      else high = mid - 1;
    }

    const s0 = samples[Math.max(0, high)];
    const s1 = samples[Math.min(samples.length - 1, low)];
    const factor = (targetOffsetMs - s0.timeOffset) / Math.max(1, s1.timeOffset - s0.timeOffset);

    return {
      timeOffset: targetOffsetMs,
      x: s0.x + (s1.x - s0.x) * factor,
      y: s0.y + (s1.y - s0.y) * factor,
      vx: s0.vx,
      vy: s0.vy,
      flipX: s1.flipX,
      animState: s1.animState,
      isInteracting: s1.isInteracting || s0.isInteracting,
    };
  }

  public getActiveEchoSprites(): Phaser.Physics.Arcade.Sprite[] {
    return this.activeEchoes.map(e => e.sprite);
  }

  private destroyEcho(echo: ActiveEchoInstance): void {
    if (echo.sprite && echo.sprite.active) {
      echo.sprite.destroy();
    }
    this.activeEchoes = this.activeEchoes.filter(e => e.id !== echo.id);
    gameEvents.emit(EVENTS.ECHO_EXPIRED, { remaining: this.activeEchoes.length });
  }

  public resetStoredTracks(): void {
    this.activeEchoes.forEach(e => this.destroyEcho(e));
    this.activeEchoes = [];
    this.storedEchoTracks = [];
  }
}
