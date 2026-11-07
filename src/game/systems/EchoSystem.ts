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
  trailEmitter?: Phaser.GameObjects.Particles.ParticleEmitter;
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
    // Add to pool of tracks
    this.storedEchoTracks.push(samples);
    // Keep only the most recent recordings if multiple
    if (this.storedEchoTracks.length > this.maxActiveEchoes) {
      this.storedEchoTracks.shift();
    }
  }

  public spawnEchoFromLastRecording(): boolean {
    if (this.storedEchoTracks.length === 0) return false;

    // Pick the most recent track
    const track = this.storedEchoTracks[this.storedEchoTracks.length - 1];
    if (track.length === 0) return false;

    // If reached max active echoes, clear oldest active echo
    if (this.activeEchoes.length >= this.maxActiveEchoes) {
      this.destroyEcho(this.activeEchoes[0]);
    }

    const firstSample = track[0];
    const sprite = this.scene.physics.add.sprite(firstSample.x, firstSample.y, 'echo_ghost');
    sprite.setCollideWorldBounds(true);
    // Crucial: Echo interacts as an arcade sensor / ghost
    (sprite.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
    (sprite.body as Phaser.Physics.Arcade.Body).setSize(24, 44);
    (sprite.body as Phaser.Physics.Arcade.Body).setOffset(4, 4);

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

  public update(currentTime: number): void {
    const toRemove: ActiveEchoInstance[] = [];

    for (const echo of this.activeEchoes) {
      const elapsed = currentTime - echo.playbackStartTime;

      if (elapsed > echo.durationMs) {
        toRemove.push(echo);
        continue;
      }

      // Linear interpolation between closest temporal samples
      const sample = this.samplePlayback(echo.samples, elapsed);
      if (sample) {
        echo.sprite.setPosition(sample.x, sample.y);
        echo.sprite.setFlipX(sample.flipX);

        // Visual pulsing effect
        const pulse = 0.65 + 0.15 * Math.sin(elapsed / 100);
        echo.sprite.setAlpha(pulse);
      }
    }

    for (const expired of toRemove) {
      this.destroyEcho(expired);
    }
  }

  private samplePlayback(samples: EchoSample[], targetOffsetMs: number): EchoSample | null {
    if (samples.length === 0) return null;
    if (targetOffsetMs <= samples[0].timeOffset) return samples[0];
    if (targetOffsetMs >= samples[samples.length - 1].timeOffset) return samples[samples.length - 1];

    // Binary search for nearest samples
    let low = 0;
    let high = samples.length - 1;

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      if (samples[mid].timeOffset === targetOffsetMs) {
        return samples[mid];
      }
      if (samples[mid].timeOffset < targetOffsetMs) {
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }

    const s0 = samples[Math.max(0, high)];
    const s1 = samples[Math.min(samples.length - 1, low)];
    const factor = (targetOffsetMs - s0.timeOffset) / Math.max(1, s1.timeOffset - s0.timeOffset);

    // Deterministic position interpolation
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

  private destroyEcho(echo: ActiveEchoInstance): void {
    if (echo.sprite && echo.sprite.active) {
      // Small dissipation effect
      const scene = this.scene;
      const g = scene.add.circle(echo.sprite.x, echo.sprite.y, 16, 0xb347ff, 0.8);
      scene.tweens.add({
        targets: g,
        radius: 32,
        alpha: 0,
        duration: 250,
        onComplete: () => g.destroy()
      });

      echo.sprite.destroy();
    }
    this.activeEchoes = this.activeEchoes.filter(e => e.id !== echo.id);
    gameEvents.emit(EVENTS.ECHO_EXPIRED, { echoId: echo.id, remaining: this.activeEchoes.length });
  }

  public getActiveSprites(): Phaser.Physics.Arcade.Sprite[] {
    return this.activeEchoes.map(e => e.sprite).filter(s => s && s.active);
  }

  public clearAllEchoes(): void {
    for (const echo of this.activeEchoes) {
      if (echo.sprite && echo.sprite.active) {
        echo.sprite.destroy();
      }
    }
    this.activeEchoes = [];
  }

  public resetStoredTracks(): void {
    this.clearAllEchoes();
    this.storedEchoTracks = [];
  }
}

