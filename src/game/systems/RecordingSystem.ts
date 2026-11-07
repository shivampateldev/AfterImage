import { EchoSample } from '../../types';
import { gameEvents, EVENTS } from '../events/GameEventBus';
import { sound } from '../../services/audio/AudioService';

export type EchoRecorderState = 'IDLE' | 'RECORDING' | 'RECORDED' | 'REPLAYING' | 'COMPLETED' | 'CANCELLED';

export class RecordingSystem {
  private state: EchoRecorderState = 'IDLE';
  private startTime: number = 0;
  private maxDurationMs: number = 10000;
  private recordedSamples: EchoSample[] = [];
  private lastSampleTime: number = 0;
  private readonly SAMPLE_INTERVAL_MS = 16.66; // 60hz sampling rate

  public getState(): EchoRecorderState {
    return this.state;
  }

  public startRecording(maxDurationSeconds: number): boolean {
    if (this.state === 'RECORDING') return false;

    this.state = 'RECORDING';
    this.startTime = performance.now();
    this.maxDurationMs = maxDurationSeconds * 1000;
    this.recordedSamples = [];
    this.lastSampleTime = 0;

    sound.playRecordStart();
    gameEvents.emit(EVENTS.RECORDING_STARTED, { maxDuration: maxDurationSeconds });
    return true;
  }

  public stopRecording(): EchoSample[] {
    if (this.state !== 'RECORDING') return [];

    this.state = this.recordedSamples.length > 0 ? 'RECORDED' : 'IDLE';
    gameEvents.emit(EVENTS.RECORDING_STOPPED, { sampleCount: this.recordedSamples.length });
    return [...this.recordedSamples];
  }

  public cancelRecording(): void {
    if (this.state === 'RECORDING') {
      this.state = 'CANCELLED';
      this.recordedSamples = [];
      gameEvents.emit(EVENTS.RECORDING_STOPPED, { sampleCount: 0 });
      this.state = 'IDLE';
    }
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
    if (this.state !== 'RECORDING') return false;

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
    return this.state === 'RECORDING';
  }

  public getSampleCount(): number {
    return this.recordedSamples.length;
  }

  public reset(): void {
    this.state = 'IDLE';
    this.recordedSamples = [];
    this.startTime = 0;
    this.lastSampleTime = 0;
  }
}
