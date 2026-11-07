import { describe, it, expect, beforeEach } from 'vitest';
import { RecordingSystem } from '../../src/game/systems/RecordingSystem';

describe('RecordingSystem & Echo State Machine (Phase 5 & 12)', () => {
  let recorder: RecordingSystem;

  beforeEach(() => {
    recorder = new RecordingSystem();
  });

  it('initializes in IDLE state', () => {
    expect(recorder.getState()).toBe('IDLE');
    expect(recorder.getIsRecording()).toBe(false);
    expect(recorder.getSampleCount()).toBe(0);
  });

  it('transitions from IDLE to RECORDING upon startRecording', () => {
    const started = recorder.startRecording(8);
    expect(started).toBe(true);
    expect(recorder.getState()).toBe('RECORDING');
    expect(recorder.getIsRecording()).toBe(true);
  });

  it('rejects concurrent startRecording when already RECORDING', () => {
    recorder.startRecording(8);
    const secondStart = recorder.startRecording(8);
    expect(secondStart).toBe(false);
    expect(recorder.getState()).toBe('RECORDING');
  });

  it('records 60Hz timestamped samples with interaction flags', () => {
    recorder.startRecording(8);
    const now = performance.now();

    // Record initial frame
    const rec1 = recorder.recordFrame(now, 10, 5, 2.5, 0, false, 'run', false);
    expect(rec1).toBe(true);
    expect(recorder.getSampleCount()).toBe(1);

    // Frame within 16.66ms sample interval is throttled to preserve 60Hz fidelity
    const recTooFast = recorder.recordFrame(now + 5, 10.1, 5, 2.5, 0, false, 'run', false);
    expect(recTooFast).toBe(true);
    expect(recorder.getSampleCount()).toBe(1);

    // Frame after 20ms is recorded
    const rec2 = recorder.recordFrame(now + 25, 10.5, 5, 2.5, 0, false, 'run', true);
    expect(rec2).toBe(true);
    expect(recorder.getSampleCount()).toBe(2);
  });

  it('transitions to RECORDED when stopped with samples', () => {
    recorder.startRecording(8);
    const now = performance.now();
    recorder.recordFrame(now, 0, 0, 0, 0, false, 'idle', false);

    const samples = recorder.stopRecording();
    expect(recorder.getState()).toBe('RECORDED');
    expect(samples.length).toBe(1);
    expect(recorder.getIsRecording()).toBe(false);
  });

  it('transitions to IDLE when stopped with zero samples', () => {
    recorder.startRecording(8);
    const samples = recorder.stopRecording();
    expect(recorder.getState()).toBe('IDLE');
    expect(samples.length).toBe(0);
  });

  it('transitions to CANCELLED and then IDLE when canceled', () => {
    recorder.startRecording(8);
    recorder.recordFrame(performance.now(), 5, 5, 0, 0, false, 'idle', false);
    recorder.cancelRecording();

    expect(recorder.getState()).toBe('IDLE');
    expect(recorder.getSampleCount()).toBe(0);
  });

  it('automatically stops recording when maxDuration is exceeded', () => {
    recorder.startRecording(2); // 2 seconds
    const now = performance.now();
    recorder.recordFrame(now, 0, 0, 0, 0, false, 'idle', false);

    // Advance beyond 2000ms
    const res = recorder.recordFrame(now + 2500, 10, 0, 0, 0, false, 'idle', false);
    expect(res).toBe(false);
    expect(recorder.getState()).toBe('RECORDED');
  });
});
