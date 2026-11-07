type GameEventCallback = (...args: unknown[]) => void;

class GameEventBus {
  private events: Map<string, Set<GameEventCallback>> = new Map();

  public on(event: string, callback: GameEventCallback): () => void {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    this.events.get(event)!.add(callback);
    return () => {
      this.off(event, callback);
    };
  }

  public off(event: string, callback: GameEventCallback): void {
    const set = this.events.get(event);
    if (set) {
      set.delete(callback);
      if (set.size === 0) {
        this.events.delete(event);
      }
    }
  }

  public emit(event: string, ...args: unknown[]): void {
    const set = this.events.get(event);
    if (set) {
      set.forEach(cb => {
        try {
          cb(...args);
        } catch (e) {
          console.error(`Error in GameEventBus callback for ${event}:`, e);
        }
      });
    }
  }

  public clear(): void {
    this.events.clear();
  }
}

export const gameEvents = new GameEventBus();

// Core event string constants
export const EVENTS = {
  // Gameplay state
  LEVEL_LOADED: 'level_loaded',
  LEVEL_COMPLETED: 'level_completed',
  PLAYER_DIED: 'player_died',
  LEVEL_RESTART: 'level_restart',

  // Echo recording & playback
  RECORDING_STARTED: 'recording_started',
  RECORDING_STOPPED: 'recording_stopped',
  RECORDING_UPDATE: 'recording_update', // { duration: number, maxDuration: number }
  ECHO_SPAWNED: 'echo_spawned',
  ECHO_EXPIRED: 'echo_expired',
  ECHO_TRIGGER_HIT: 'echo_trigger_hit',

  // Puzzles
  SWITCH_TOGGLED: 'switch_toggled',
  PLATE_TRIGGERED: 'plate_triggered',
  DOOR_STATE_CHANGED: 'door_state_changed',

  // UI requested actions into Phaser
  TRIGGER_RECORD: 'ui_trigger_record',
  TRIGGER_REPLAY: 'ui_trigger_replay',
  TRIGGER_RESTART: 'ui_trigger_restart',
  SET_CURRENT_LEVEL: 'ui_set_current_level',
  SET_PAUSED: 'ui_set_paused',
};

