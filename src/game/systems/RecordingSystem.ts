import { EchoSample } from '../../types';
import { gameEvents, EVENTS } from '../events/GameEventBus';
import { sound } from '../../services/audio/AudioService';

export class RecordingSystem {
  private isRecording: boolean = false;
  private startTime: number = 0;
  private maxDurationMs: number = 10000;
  private recordedSamples: EchoSample[] = [];
  private lastSampleTime: number = 0;
  private readonly SAMPLE_INTERVAL_MS = 16.66; // 60hz sampling rate

  public startRecording(maxDurationSeconds: number): boolean {
    if (this.isRecording) return false;
    this.isRecording = true;
    this.startTime = performance.now();
    this.maxDurationMs = maxDurationSeconds * 1000;
    this.recordedSamples = [];
    this.lastSampleTime = 0;

    sound.playRecordStart();
    gameEvents.emit(EVENTS.RECORDING_STARTED, { maxDuration: maxDurationSeconds });
    return true;
  }

  public stopRecording(): EchoSample[] {
    if (!this.isRecording) return [];
    this.isRecording = false;
    gameEvents.emit(EVENTS.RECORDING_STOPPED, { sampleCount: this.recordedSamples.length });
    return [...this.recordedSamples];
  }

  public recordFrame(
    currentTime: number,
    x: number,
    y: number,
    vx: number,
    vy: number,
    flipX: boolean,
    animState: 'idle' | 'run' | 'jump' | 'fall',
    isInteracting: boolean
  ): boolean {
    if (!this.isRecording) return false;

    const elapsed = currentTime - this.startTime;

    // Check duration limit
    if (elapsed >= this.maxDurationMs) {
      this.stopRecording();
      return false;
    }

    // Sample at 60Hz intervals
    if (currentTime - this.lastSampleTime >= this.SAMPLE_INTERVAL_MS) {
      this.recordedSamples.push({
        timeOffset: elapsed,
        x,
        y,
        vx,
        vy,
        flipX,
        animState,
        isInteracting
      });
      this.lastSampleTime = currentTime;

      // Emit recording progress for HUD
      gameEvents.emit(EVENTS.RECORDING_UPDATE, {
        elapsedSeconds: elapsed / 1000,
        maxSeconds: this.maxDurationMs / 1000,
        progress: elapsed / this.maxDurationMs,
      });
    }

    return true;
  }

  public getIsRecording(): boolean {
    return this.isRecording;
  }

  public getSampleCount(): number {
    return this.recordedSamples.length;
  }
}

