import Phaser from 'phaser';
import { CAMPAIGN_LEVELS } from '../../data/levels';
import { LevelConfig } from '../../types';
import { AssetGenerator } from '../graphics/AssetGenerator';
import { PlayerController } from '../entities/PlayerController';
import { RecordingSystem } from '../systems/RecordingSystem';
import { EchoSystem } from '../systems/EchoSystem';
import { PuzzleSystem } from '../systems/PuzzleSystem';
import { gameEvents, EVENTS } from '../events/GameEventBus';
import { sound } from '../../services/audio/AudioService';

export class MainGameScene extends Phaser.Scene {
  private currentLevelIndex: number = 1;
  private currentLevelConfig!: LevelConfig;
  private player!: PlayerController;
  private recordingSystem!: RecordingSystem;
  private echoSystem!: EchoSystem;
  private puzzleSystem!: PuzzleSystem;

  private platformsGroup!: Phaser.Physics.Arcade.StaticGroup;
  private hazardsGroup!: Phaser.Physics.Arcade.StaticGroup;
  private exitPortal!: Phaser.GameObjects.Sprite;
  private levelStartTime: number = 0;
  private isLevelComplete: boolean = false;
  private hintsUsedCount: number = 0;
  private unsubscribers: Array<() => void> = [];

  constructor() {
    super({ key: 'MainGameScene' });
  }

  public init(data: { levelId?: number }): void {
    if (data && data.levelId) {
      this.currentLevelIndex = data.levelId;
    }
  }

  public preload(): void {
    // Generate procedural assets using canvas graphics
    AssetGenerator.generateProceduralTextures(this);
  }

  public create(): void {
    this.cameras.main.setBackgroundColor('#07090e');
    this.createAtmosphericBackground();

    this.platformsGroup = this.physics.add.staticGroup();
    this.hazardsGroup = this.physics.add.staticGroup();

    this.recordingSystem = new RecordingSystem();
    this.echoSystem = new EchoSystem(this);
    this.puzzleSystem = new PuzzleSystem(this);

    this.setupEventListeners();
    this.loadLevel(this.currentLevelIndex);
  }

  private createAtmosphericBackground(): void {
    // Futuristic gridlines and ambient lighting
    const g = this.add.graphics();
    g.lineStyle(1, 0x141d30, 0.4);
    for (let x = 0; x < 960; x += 40) {
      g.moveTo(x, 0);
      g.lineTo(x, 600);
    }
    for (let y = 0; y < 600; y += 40) {
      g.moveTo(0, y);
      g.lineTo(960, y);
    }
    g.strokePath();

    // Ambient glow accents
    const ambient1 = this.add.circle(200, 150, 180, 0x0066ff, 0.05);
    const ambient2 = this.add.circle(750, 350, 220, 0xb347ff, 0.04);
    this.tweens.add({
      targets: [ambient1, ambient2],
      alpha: 0.1,
      duration: 4000,
      yoyo: true,
      repeat: -1,
    });
  }

  public loadLevel(levelId: number): void {
    this.currentLevelIndex = levelId;
    const config = CAMPAIGN_LEVELS.find(l => l.id === levelId) || CAMPAIGN_LEVELS[0];
    this.currentLevelConfig = config;
    this.isLevelComplete = false;
    this.levelStartTime = performance.now();
    this.hintsUsedCount = 0;

    // Reset systems
    this.echoSystem.resetStoredTracks();
    this.echoSystem.setMaxActiveEchoes(config.maxActiveEchoes);
    this.recordingSystem.stopRecording();

    // Clear static platforms and hazards
    this.platformsGroup.clear(true, true);
    this.hazardsGroup.clear(true, true);
    if (this.exitPortal) this.exitPortal.destroy();

    // Build Level Geometry
    for (const p of config.platforms) {
      const tileWidth = 32;
      const count = Math.ceil(p.width / tileWidth);
      for (let i = 0; i < count; i++) {
        const x = p.x + i * tileWidth + tileWidth / 2;
        const y = p.y + p.height / 2;
        const tile = this.platformsGroup.create(x, y, 'facility_tile');
        tile.setDisplaySize(tileWidth, p.height);
        tile.refreshBody();
      }
    }

    // Build Hazards
    if (config.hazards) {
      for (const h of config.hazards) {
        const hazard = this.hazardsGroup.create(h.x + h.width / 2, h.y + h.height / 2, 'hazard_laser');
        hazard.setDisplaySize(h.width, h.height);
        hazard.refreshBody();
      }
    }

    // Build Puzzles
    this.puzzleSystem.initialize(config);

    // Setup Exit Portal
    this.exitPortal = this.add.sprite(config.exitPoint.x, config.exitPoint.y, 'exit_portal');
    this.physics.add.existing(this.exitPortal, true);

    // Setup Player
    if (!this.player) {
      this.player = new PlayerController(this, config.spawnPoint.x, config.spawnPoint.y);
    } else {
      this.player.setPosition(config.spawnPoint.x, config.spawnPoint.y);
    }

    // Collisions
    this.physics.add.collider(this.player.sprite, this.platformsGroup);
    this.physics.add.collider(this.player.sprite, this.puzzleSystem.getDoorSprites());

    // Hazard overlap
    this.physics.add.overlap(this.player.sprite, this.hazardsGroup, () => {
      this.handlePlayerDeath();
    });

    // Exit portal overlap
    this.physics.add.overlap(this.player.sprite, this.exitPortal, () => {
      this.handleLevelComplete();
    });

    gameEvents.emit(EVENTS.LEVEL_LOADED, {
      levelId: config.id,
      title: config.title,
      actTitle: config.actTitle,
      description: config.description,
      learningFocus: config.learningFocus,
      maxRecordingSeconds: config.maxRecordingDurationSeconds,
      maxEchoes: config.maxActiveEchoes,
      hints: config.hints,
    });
  }

  private handlePlayerDeath(): void {
    if (this.isLevelComplete) return;
    sound.playSwitch();
    // Screen shake
    this.cameras.main.shake(200, 0.02);
    this.player.setPosition(this.currentLevelConfig.spawnPoint.x, this.currentLevelConfig.spawnPoint.y);
    gameEvents.emit(EVENTS.PLAYER_DIED, { levelId: this.currentLevelIndex });
  }

  private handleLevelComplete(): void {
    if (this.isLevelComplete) return;
    this.isLevelComplete = true;

    sound.playLevelSuccess();
    const durationSeconds = (performance.now() - this.levelStartTime) / 1000;

    gameEvents.emit(EVENTS.LEVEL_COMPLETED, {
      levelId: this.currentLevelIndex,
      completionTimeSeconds: Math.round(durationSeconds),
      hintsUsed: this.hintsUsedCount,
      reflectionQuestion: this.currentLevelConfig.reflectionQuestion,
    });
  }

  public update(_time: number, delta: number): void {
    if (this.isLevelComplete || !this.player) return;

    const deltaSeconds = delta / 1000;
    const now = performance.now();

    // 1. Update player locomotion
    const moveState = this.player.update();

    // 2. Check manual interactions
    if (moveState.isInteracting) {
      this.puzzleSystem.tryInteractSwitch(this.player.sprite);
    }

    // 3. Record sample if active
    if (this.recordingSystem.getIsRecording()) {
      this.recordingSystem.recordFrame(
        now,
        this.player.sprite.x,
        this.player.sprite.y,
        moveState.vx,
        moveState.vy,
        moveState.flipX,
        moveState.animState,
        moveState.isInteracting
      );
    }

    // 4. Update echoes playback
    this.echoSystem.update(now);

    // 5. Update puzzles and sensor collisions with echoes
    const echoSprites = this.echoSystem.getActiveSprites();
    this.puzzleSystem.checkCollisions(this.player.sprite, echoSprites, deltaSeconds);

    // Echoes interacting with switches
    for (const echo of echoSprites) {
      this.puzzleSystem.tryInteractSwitch(echo);
    }
  }

  private setupEventListeners(): void {
    // Clean old listeners
    this.unsubscribers.forEach(u => u());
    this.unsubscribers = [];

    // Keyboard shortcuts (R & E)
    this.input.keyboard?.on('keydown-R', () => {
      this.toggleRecording();
    });

    this.input.keyboard?.on('keydown-E', () => {
      this.triggerReplayEcho();
    });

    // Listen to UI controls
    this.unsubscribers.push(
      gameEvents.on(EVENTS.TRIGGER_RECORD, () => this.toggleRecording()),
      gameEvents.on(EVENTS.TRIGGER_REPLAY, () => this.triggerReplayEcho()),
      gameEvents.on(EVENTS.TRIGGER_RESTART, () => this.loadLevel(this.currentLevelIndex)),
      gameEvents.on(EVENTS.SET_CURRENT_LEVEL, (data) => {
        const lvl = (data as { levelId: number })?.levelId || 1;
        this.loadLevel(lvl);
      })
    );
  }

  private toggleRecording(): void {
    if (this.recordingSystem.getIsRecording()) {
      const samples = this.recordingSystem.stopRecording();
      if (samples.length > 0) {
        this.echoSystem.storeRecordedTrack(samples);
      }
    } else {
      this.recordingSystem.startRecording(this.currentLevelConfig.maxRecordingDurationSeconds);
    }
  }

  private triggerReplayEcho(): void {
    // If user presses replay while recording, finalize the recording first
    if (this.recordingSystem.getIsRecording()) {
      const samples = this.recordingSystem.stopRecording();
      if (samples.length > 0) {
        this.echoSystem.storeRecordedTrack(samples);
      }
    }
    this.echoSystem.spawnEchoFromLastRecording();
  }

  public getPlayerController(): PlayerController {
    return this.player;
  }

  public shutdown(): void {
    this.unsubscribers.forEach(u => u());
    this.puzzleSystem.cleanup();
    this.echoSystem.clearAllEchoes();
  }
}
