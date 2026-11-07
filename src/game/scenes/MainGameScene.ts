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
  private currentLevelIndex: number = 2;
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

  // Parallax layers
  private bgSky!: Phaser.GameObjects.TileSprite;
  private bgFacility!: Phaser.GameObjects.TileSprite;

  constructor() {
    super({ key: 'MainGameScene' });
  }

  public init(data: { levelId?: number }): void {
    if (data && data.levelId) {
      this.currentLevelIndex = data.levelId;
    }
  }

  public preload(): void {
    AssetGenerator.generateProceduralTextures(this);
  }

  public create(): void {
    this.cameras.main.setBackgroundColor('#090e17');

    // 1. Create Parallax Background Layers
    this.bgSky = this.add.tileSprite(480, 300, 960, 600, 'bg_sky_mountains');
    this.bgSky.setScrollFactor(0);
    this.bgSky.setDepth(1);

    this.bgFacility = this.add.tileSprite(480, 300, 960, 600, 'bg_facility_wall');
    this.bgFacility.setScrollFactor(0.2);
    this.bgFacility.setDepth(2);

    // 2. Physics Groups
    this.platformsGroup = this.physics.add.staticGroup();
    this.hazardsGroup = this.physics.add.staticGroup();

    // 3. Systems
    this.recordingSystem = new RecordingSystem();
    this.echoSystem = new EchoSystem(this);
    this.puzzleSystem = new PuzzleSystem(this);

    this.setupEventListeners();
    this.loadLevel(this.currentLevelIndex);
  }

  public loadLevel(levelId: number): void {
    this.currentLevelIndex = levelId;
    const config = CAMPAIGN_LEVELS.find(l => l.id === levelId) || CAMPAIGN_LEVELS[1];
    this.currentLevelConfig = config;
    this.isLevelComplete = false;
    this.levelStartTime = performance.now();
    this.hintsUsedCount = 0;

    // Reset systems
    this.echoSystem.resetStoredTracks();
    this.echoSystem.setMaxActiveEchoes(config.maxActiveEchoes);
    this.recordingSystem.reset();

    // Clear previous platforms
    this.platformsGroup.clear(true, true);
    this.hazardsGroup.clear(true, true);
    if (this.exitPortal) this.exitPortal.destroy();

    // 1. Spawn Botanical Ancient Trees (Midground Depth: 5)
    const tree1 = this.add.sprite(180, 320, 'pixel_tree_ancient');
    tree1.setDepth(5);
    tree1.setScale(1.1);

    const tree2 = this.add.sprite(820, 320, 'pixel_tree_ancient');
    tree2.setDepth(5);
    tree2.setScale(0.95);

    // 2. Build Industrial Concrete Platforms
    for (const p of config.platforms) {
      const tileWidth = 32;
      const count = Math.ceil(p.width / tileWidth);

      for (let i = 0; i < count; i++) {
        const x = p.x + i * tileWidth + tileWidth / 2;
        const y = p.y + p.height / 2;
        const tile = this.platformsGroup.create(x, y, 'facility_tile');
        tile.setDisplaySize(tileWidth, p.height);
        tile.setDepth(10);
        tile.refreshBody();
      }
    }

    // 3. Build Hazard Lasers
    if (config.hazards) {
      for (const h of config.hazards) {
        const laser = this.hazardsGroup.create(h.x + h.width / 2, h.y + h.height / 2, 'laser_grid');
        laser.setDisplaySize(h.width, h.height);
        laser.setDepth(12);
        laser.refreshBody();
      }
    }

    // 4. Initialize Blast Gates, Pressure Plates & Switches
    this.puzzleSystem.initialize(config);

    // 5. Exit Portal Gateway
    this.exitPortal = this.add.sprite(config.exitPoint.x, config.exitPoint.y - 10, 'exit_portal');
    this.exitPortal.setDisplaySize(48, 72);
    this.exitPortal.setDepth(11);

    // 6. Spawn Player Explorer Character
    if (this.player && this.player.sprite) {
      this.player.sprite.destroy();
    }
    this.player = new PlayerController(this, config.spawnPoint.x, config.spawnPoint.y);
    this.player.sprite.setDepth(20);

    // Platform Collisions
    this.physics.add.collider(this.player.sprite, this.platformsGroup);

    // Blast Door Solid Colliders
    for (const doorSprite of this.puzzleSystem.getDoorsGroup()) {
      this.physics.add.collider(this.player.sprite, doorSprite);
    }

    // Hazards
    this.physics.add.overlap(this.player.sprite, this.hazardsGroup, () => {
      this.handlePlayerDeath();
    });

    // Notify UI
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

  public update(time: number, delta: number): void {
    if (this.isLevelComplete || !this.player || !this.player.sprite.body) return;

    // 1. Update Player Controls & Kinematics
    const movement = this.player.update(delta);

    // 2. Parallax camera scroll
    this.bgSky.tilePositionX = this.player.sprite.x * 0.05;
    this.bgFacility.tilePositionX = this.player.sprite.x * 0.15;

    // 3. Update Echoes
    const { activeEchoes, interactingEchoes } = this.echoSystem.update(time);

    // Check echo interactions with switches
    for (const echoSprite of interactingEchoes) {
      this.puzzleSystem.handleInteraction(echoSprite);
    }

    // 4. Check Puzzle Occupancy (Pressure plates & doors)
    this.puzzleSystem.checkCollisions(this.player.sprite, activeEchoes, delta / 1000);

    // 5. Handle Player Manual Switch Interaction (Key F)
    if (movement.isInteracting) {
      this.puzzleSystem.handleInteraction(this.player.sprite);
    }

    // 6. Record frame if recording active
    if (this.recordingSystem.getIsRecording()) {
      this.recordingSystem.recordFrame(
        time,
        this.player.sprite.x,
        this.player.sprite.y,
        movement.vx,
        movement.vy,
        movement.flipX,
        movement.animState,
        movement.isInteracting
      );
    }

    // 7. Check Level Exit Reached
    const distToExit = Phaser.Math.Distance.Between(
      this.player.sprite.x,
      this.player.sprite.y,
      this.currentLevelConfig.exitPoint.x,
      this.currentLevelConfig.exitPoint.y
    );
    if (distToExit < 38) {
      this.handleLevelComplete();
    }

    // 8. Pit fall check
    if (this.player.sprite.y > 650) {
      this.handlePlayerDeath();
    }
  }

  public toggleRecording(): void {
    if (this.recordingSystem.getIsRecording()) {
      const samples = this.recordingSystem.stopRecording();
      if (samples.length > 0) {
        this.echoSystem.storeRecordedTrack(samples);
      }
    } else {
      this.recordingSystem.startRecording(this.currentLevelConfig.maxRecordingDurationSeconds);
    }
  }

  public triggerReplayEcho(): void {
    if (this.recordingSystem.getIsRecording()) {
      const samples = this.recordingSystem.stopRecording();
      if (samples.length > 0) {
        this.echoSystem.storeRecordedTrack(samples);
      }
    }
    this.echoSystem.spawnEchoFromLastRecording();
  }

  private handlePlayerDeath(): void {
    if (this.isLevelComplete) return;
    sound.playSwitch();
    this.loadLevel(this.currentLevelIndex);
  }

  private handleLevelComplete(): void {
    if (this.isLevelComplete) return;
    this.isLevelComplete = true;
    sound.playLevelSuccess();

    const elapsed = Math.round((performance.now() - this.levelStartTime) / 1000);
    gameEvents.emit(EVENTS.LEVEL_COMPLETED, {
      levelId: this.currentLevelConfig.id,
      completionTimeSeconds: elapsed,
      hintsUsed: this.hintsUsedCount,
      reflectionQuestion: this.currentLevelConfig.reflectionQuestion,
    });
  }

  private setupEventListeners(): void {
    this.unsubscribers.push(
      gameEvents.on(EVENTS.TRIGGER_RECORD, () => this.toggleRecording()),
      gameEvents.on(EVENTS.TRIGGER_REPLAY, () => this.triggerReplayEcho()),
      gameEvents.on(EVENTS.TRIGGER_RESTART, () => this.loadLevel(this.currentLevelIndex)),
      gameEvents.on(EVENTS.SET_CURRENT_LEVEL, (data) => {
        const payload = data as { levelId: number };
        this.loadLevel(payload.levelId);
      })
    );
  }

  public destroyScene(): void {
    this.unsubscribers.forEach(u => u());
    this.unsubscribers = [];
    this.puzzleSystem.cleanup();
  }
}
