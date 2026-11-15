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
import { performanceManager } from '../systems/PerformanceManager';
import { SarthiTutorialService } from '../../services/sarthi/SarthiTutorialService';
import { platform } from '../../platform/PlatformBridge';

const IS_DEV = import.meta.env.DEV;

export class MainGameScene extends Phaser.Scene {
  public currentLevelIndex: number = 1;
  public currentLevelConfig!: LevelConfig;
  public player!: PlayerController;
  public recordingSystem!: RecordingSystem;
  public echoSystem!: EchoSystem;
  public puzzleSystem!: PuzzleSystem;
  public lives: number = 3;
  public isGameOver: boolean = false;

  private platformsGroup!: Phaser.Physics.Arcade.StaticGroup;
  private hazardsGroup!: Phaser.Physics.Arcade.StaticGroup;
  private exitPortal!: Phaser.GameObjects.Sprite;
  private levelStartTime: number = 0;
  private isLevelComplete: boolean = false;
  private hintsUsedCount: number = 0;
  private unsubscribers: Array<() => void> = [];
  private isInvulnerable: boolean = false;
  private debugText!: Phaser.GameObjects.Text;
  private decorSprites: Phaser.GameObjects.Sprite[] = [];
  private playerColliders: Phaser.Physics.Arcade.Collider[] = [];

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
    // Span at least 2400 to cover ultrawide phone viewports and full level bounds
    const initialSpan = 2400;
    this.bgSky = this.add.tileSprite(initialSpan / 2, 300, initialSpan, 600, 'bg_sky_mountains');
    this.bgSky.setScrollFactor(0);
    this.bgSky.setDepth(1);

    this.bgFacility = this.add.tileSprite(initialSpan / 2, 300, initialSpan, 600, 'bg_facility_wall');
    this.bgFacility.setScrollFactor(0.2);
    this.bgFacility.setDepth(2);

    // 2. Physics Groups
    this.platformsGroup = this.physics.add.staticGroup();
    this.hazardsGroup = this.physics.add.staticGroup();

    // 3. Systems
    this.recordingSystem = new RecordingSystem();
    this.echoSystem = new EchoSystem(this);
    this.puzzleSystem = new PuzzleSystem(this);

    // Diagnostics overlay — only in development builds
    if (IS_DEV) {
      this.debugText = this.add.text(16, 550, '', {
        fontSize: '11px',
        fontFamily: 'monospace',
        color: '#38d9ff',
        backgroundColor: 'rgba(5, 10, 20, 0.75)',
        padding: { x: 8, y: 4 }
      });
      this.debugText.setDepth(100);
      this.debugText.setScrollFactor(0);
    }

    this.setupEventListeners();
    this.setupKeyboardShortcuts();
    this.scale.on('resize', this.updateCameraZoom, this);
    this.loadLevel(this.currentLevelIndex);
  }

  private setupKeyboardShortcuts(): void {
    if (!this.input.keyboard) return;

    this.input.keyboard.on('keydown', (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (key === 'r') {
        this.toggleRecording();
      } else if (key === 'e') {
        this.triggerReplayEcho();
      } else if (event.key === 'F11') {
        event.preventDefault();
        platform.toggleFullscreen();
      }
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
    this.recordingSystem.reset();

    // 1. Remove old colliders & overlaps
    this.playerColliders.forEach(c => {
      if (c && c.active) c.destroy();
    });
    this.playerColliders = [];

    // 2. Destroy and recreate StaticPhysicsGroups safely
    if (this.platformsGroup) {
      this.platformsGroup.destroy(true);
    }
    this.platformsGroup = this.physics.add.staticGroup();

    if (this.hazardsGroup) {
      this.hazardsGroup.destroy(true);
    }
    this.hazardsGroup = this.physics.add.staticGroup();

    // Clear decorative sprites
    this.decorSprites.forEach(s => {
      if (s && s.active) s.destroy();
    });
    this.decorSprites = [];

    if (this.exitPortal && this.exitPortal.active) {
      this.exitPortal.destroy();
    }

    // 3. Environmental Theme Setup (Level 02 Lab vs Level 03 Ruins vs Level 04 Archive vs Level 01 Tutorial)
    const isLevel2Lab = config.id === 2;
    const isLevel3Ruins = config.id === 3;
    const isLevel4Archive = config.id === 4;

    if (isLevel2Lab) {
      // Level 02: Indoor Abandoned Research Facility
      this.bgSky.setTexture('bg_lab_interior');
      this.bgFacility.setTexture('bg_facility_wall');
      this.bgFacility.setAlpha(0.85);

      const server1 = this.add.sprite(220, 550, 'lab_server_rack');
      server1.setOrigin(0.5, 1.0);
      server1.setDepth(6);
      this.decorSprites.push(server1);

      const server2 = this.add.sprite(820, 550, 'lab_server_rack');
      server2.setOrigin(0.5, 1.0);
      server2.setDepth(6);
      this.decorSprites.push(server2);

      const col1 = this.add.sprite(120, 430, 'facility_column');
      col1.setOrigin(0.5, 1.0);
      col1.setDepth(5);
      col1.setAlpha(0.6);
      this.decorSprites.push(col1);

      const col2 = this.add.sprite(640, 430, 'facility_column');
      col2.setOrigin(0.5, 1.0);
      col2.setDepth(5);
      col2.setAlpha(0.6);
      this.decorSprites.push(col2);
    } else if (isLevel3Ruins) {
      // Level 03: Ancient Temporal Ruins & Forgotten Forest
      this.bgSky.setTexture('bg_ruins_sky');
      this.bgFacility.setTexture('bg_ruins_canopy');
      this.bgFacility.setAlpha(0.9);

      const tree1 = this.add.sprite(110, 550, 'pixel_tree_ancient');
      tree1.setOrigin(0.5, 1.0);
      tree1.setDepth(5);
      tree1.setScale(1.1);
      this.decorSprites.push(tree1);

      const tree2 = this.add.sprite(860, 550, 'pixel_tree_ancient');
      tree2.setOrigin(0.5, 1.0);
      tree2.setDepth(5);
      tree2.setScale(1.05);
      tree2.setFlipX(true);
      this.decorSprites.push(tree2);
    } else if (isLevel4Archive) {
      // Level 04: Archival Depths (Indigo Cyber Archives)
      this.bgSky.setTexture('bg_archive_deep');
      this.bgFacility.setTexture('bg_archive_gantry');
      this.bgFacility.setAlpha(0.9);

      // Add high-tech server racks and archival terminals
      const rack1 = this.add.sprite(120, 550, 'lab_server_rack');
      rack1.setOrigin(0.5, 1.0);
      rack1.setDepth(6);
      this.decorSprites.push(rack1);

      const rack2 = this.add.sprite(620, 550, 'lab_server_rack');
      rack2.setOrigin(0.5, 1.0);
      rack2.setDepth(6);
      this.decorSprites.push(rack2);
    } else {
      // Introductory Level 01
      this.bgSky.setTexture('bg_sky_mountains');
      this.bgFacility.setTexture('bg_facility_wall');
      this.bgFacility.setAlpha(0.6);

      const tree1 = this.add.sprite(70, 550, 'pixel_tree_ancient');
      tree1.setOrigin(0.5, 1.0);
      tree1.setDepth(5);
      this.decorSprites.push(tree1);

      const tree2 = this.add.sprite(880, 550, 'pixel_tree_ancient');
      tree2.setOrigin(0.5, 1.0);
      tree2.setDepth(5);
      tree2.setFlipX(true);
      this.decorSprites.push(tree2);
    }

    // 4. Build Platforms (Facility Tiles vs Weathered Ruins Stone vs Cyber Archival Tiles)
    const platformTexture = isLevel3Ruins 
      ? 'ruins_stone_tile' 
      : (isLevel4Archive ? 'archive_tile' : 'facility_tile');
    for (const p of config.platforms) {
      const tileWidth = 32;
      const count = Math.ceil(p.width / tileWidth);

      for (let i = 0; i < count; i++) {
        const x = p.x + i * tileWidth + tileWidth / 2;
        const y = p.y + p.height / 2;
        const tile = this.platformsGroup.create(x, y, platformTexture);
        tile.setDisplaySize(tileWidth, p.height);
        tile.setDepth(10);
        tile.refreshBody();
      }
    }

    // 5. Build Hazard Lasers
    if (config.hazards) {
      for (const h of config.hazards) {
        const laser = this.hazardsGroup.create(h.x + h.width / 2, h.y + h.height / 2, 'laser_grid');
        laser.setDisplaySize(h.width, h.height);
        laser.setDepth(12);
        laser.refreshBody();
      }
    }

    // 6. Initialize Blast Gates, Pressure Plates & Switches
    this.puzzleSystem.initialize(config);

    // 7. Exit Portal Gateway with High-Visibility Atmospheric Beacon
    this.exitPortal = this.add.sprite(config.exitPoint.x, config.exitPoint.y - 10, 'exit_portal');
    this.exitPortal.setDisplaySize(56, 80);
    this.exitPortal.setDepth(18);

    // Dynamic glowing beacon and overhead indicator for unmistakable visibility across all screen sizes
    const portalGlow = this.add.circle(config.exitPoint.x, config.exitPoint.y - 10, 36, 0x00f0ff, 0.25);
    portalGlow.setDepth(16);
    this.decorSprites.push(portalGlow as unknown as Phaser.GameObjects.Sprite);

    this.tweens.add({
      targets: portalGlow,
      scaleX: 1.4,
      scaleY: 1.4,
      alpha: { from: 0.35, to: 0.1 },
      yoyo: true,
      repeat: -1,
      duration: 1000,
    });

    const exitTag = this.add.text(config.exitPoint.x, config.exitPoint.y - 64, '▼ EXIT GATE', {
      fontSize: '11px',
      fontFamily: 'monospace',
      color: '#38d9ff',
      backgroundColor: 'rgba(5, 10, 25, 0.85)',
      padding: { x: 6, y: 3 },
    }).setOrigin(0.5, 0.5).setDepth(19);
    this.decorSprites.push(exitTag as unknown as Phaser.GameObjects.Sprite);

    // 8. Spawn Player Explorer Character
    if (this.player && this.player.sprite && this.player.sprite.active) {
      this.player.sprite.destroy();
    }
    this.player = new PlayerController(this, config.spawnPoint.x, config.spawnPoint.y);
    this.player.sprite.setDepth(20);

    // Compute dynamic level world width so the map is never truncated
    let levelMaxX = Math.max(1600, config.exitPoint.x + 200);
    for (const p of config.platforms) {
      if (p.x + p.width > levelMaxX) {
        levelMaxX = p.x + p.width + 100;
      }
    }
    // Set world physics & camera bounds with safe margin
    this.physics.world.setBounds(0, 0, levelMaxX, 600);
    this.cameras.main.setBounds(0, 0, levelMaxX, 600);
    this.cameras.main.startFollow(this.player.sprite, true, 0.08, 0.08, 0, 30);

    // Ensure parallax background tileSprites cover the full world bounds
    if (this.bgSky) {
      this.bgSky.setSize(levelMaxX, 600);
      this.bgSky.setPosition(levelMaxX / 2, 300);
    }
    if (this.bgFacility) {
      this.bgFacility.setSize(levelMaxX, 600);
      this.bgFacility.setPosition(levelMaxX / 2, 300);
    }

    // Platform Collisions
    const platCol = this.physics.add.collider(this.player.sprite, this.platformsGroup);
    this.playerColliders.push(platCol);

    this.updateCameraZoom();

    // Blast Door Solid Colliders
    for (const doorSprite of this.puzzleSystem.getDoorsGroup()) {
      const doorCol = this.physics.add.collider(this.player.sprite, doorSprite);
      this.playerColliders.push(doorCol);
    }

    // Hazards
    const hazOverlap = this.physics.add.overlap(this.player.sprite, this.hazardsGroup, () => {
      this.handlePlayerDeath();
    });
    this.playerColliders.push(hazOverlap);

    // Notify UI of Level & Lives
    gameEvents.emit(EVENTS.LIVES_UPDATED, { lives: this.lives, maxLives: 3 });
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
    if (this.isLevelComplete || this.isGameOver || !this.player || !this.player.sprite.body) return;

    // 1. Update Echoes & Evaluate One-Way Solid Platform Collision BEFORE player update
    // This allows player.update() to immediately see externalGrounded = true when standing on an echo
    const { activeEchoes, interactingEchoes } = this.echoSystem.update(time);
    this.updateEchoOneWayPlatformPhysics();

    // 2. Update Player Controls & Kinematics
    const movement = this.player.update(delta);

    // 3. Parallax camera scroll according to adaptive performance profile
    const perfProfile = performanceManager.getProfile();
    if (perfProfile.backgroundParallaxEnabled) {
      this.bgSky.tilePositionX = this.player.sprite.x * 0.05;
      this.bgFacility.tilePositionX = this.player.sprite.x * 0.15;
    }

    // Report FPS telemetry to adaptive performance manager
    if (delta > 0) {
      performanceManager.reportFps(Math.round(1000 / delta));
    }

    // Check echo interactions with switches
    for (const echoSprite of interactingEchoes) {
      this.puzzleSystem.handleInteraction(echoSprite);
    }

    // 4. Check Puzzle Occupancy (Pressure plates & doors)
    this.puzzleSystem.checkCollisions(this.player.sprite, activeEchoes, delta / 1000);

    // Update Sarthi Tutorial with live player position & recording state
    if (this.currentLevelConfig.id === 0) {
      SarthiTutorialService.getInstance().tick(
        delta / 1000,
        this.player.sprite.x,
        this.player.sprite.y,
        this.recordingSystem.getIsRecording()
      );
    }

    // 5. Handle Player Manual Switch Interaction (Key F)
    if (movement.isInteracting) {
      this.puzzleSystem.handleInteraction(this.player.sprite);
      SarthiTutorialService.getInstance().recordInteract();
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

    // 7. Check Level Exit Reached (Authoritative overlap & gate clearance check)
    // Validate player is physically at exit portal and has crossed the blast gate corridor
    const distToExit = Phaser.Math.Distance.Between(
      this.player.sprite.x,
      this.player.sprite.y,
      this.currentLevelConfig.exitPoint.x,
      this.currentLevelConfig.exitPoint.y
    );
    // Player must be within 70px of exit portal and, if level has doors, must be past the door X coordinate
    const doorX = this.currentLevelConfig.doors.length > 0 ? this.currentLevelConfig.doors[0].x : 0;
    const isPastGate = this.currentLevelConfig.doors.length === 0 || this.player.sprite.x > doorX;
    if (distToExit < 70 && isPastGate) {
      this.handleLevelComplete();
    }

    // 8. Pit fall check (authoritative death trigger)
    if (this.player.sprite.y > 610) {
      this.handlePlayerDeath();
    }

    // 9. Diagnostics HUD readout & SARTHI Telemetry Dispatch
    if (this.debugText && this.player.sprite.body) {
      const b = this.player.sprite.body as Phaser.Physics.Arcade.Body;
      const recState = this.recordingSystem.getState();
      const samples = this.recordingSystem.getSampleCount();
      const echoCount = this.echoSystem.getActiveEchoCount();
      const onEcho = this.player.externalGrounded ? ' [ON ECHO]' : '';
      this.debugText.setText(
        `POS:(${Math.round(this.player.sprite.x)},${Math.round(this.player.sprite.y)}) VEL:(${Math.round(b.velocity.x)},${Math.round(b.velocity.y)})${onEcho} | LIVES:${this.lives} | REC:${recState} (${samples} samples) | ECHOES:${echoCount}`
      );

      // Throttled telemetry dispatch to Sarthi AI companion (every ~10 frames)
      if (Math.round(time) % 10 === 0) {
        const puzzleStates: Record<string, boolean> = {};
        for (const [id, door] of this.puzzleSystem.doors) {
          puzzleStates[id] = door.isOpen;
        }
        for (const [id, plate] of this.puzzleSystem.plates) {
          puzzleStates[id] = plate.isPressed;
        }

        gameEvents.emit(EVENTS.SARTHI_CONTEXT_UPDATE, {
          levelId: this.currentLevelConfig.id,
          levelTitle: this.currentLevelConfig.title,
          playerPosition: { x: this.player.sprite.x, y: this.player.sprite.y },
          playerVelocity: { vx: b.velocity.x, vy: b.velocity.y },
          lives: this.lives,
          maxLives: 3,
          objective: this.currentLevelConfig.description,
          puzzleState: puzzleStates,
          activeEchoes: echoCount,
          maxEchoes: this.currentLevelConfig.maxActiveEchoes,
          isRecording: this.recordingSystem.getIsRecording(),
          recordingAvailable: true,
          levelCompleted: this.isLevelComplete,
          isGroundedOnEcho: this.player.externalGrounded,
        });
      }
    }
  }

  /**
   * One-Way Moving Platform Physics for Temporal Echoes
   * Allows the player to jump onto an echo from above or below,
   * land stably on its top boundary, stand on it, ride horizontal movement,
   * and jump off to higher platforms without getting stuck or pushed horizontally.
   */
  private updateEchoOneWayPlatformPhysics(): void {
    if (!this.player || !this.player.sprite || !this.player.sprite.body) return;

    const pSprite = this.player.sprite;
    const pBody = pSprite.body as Phaser.Physics.Arcade.Body;
    const echoes = this.echoSystem.getActiveEchoInstances();

    let supportedByEcho = false;

    // Player bounding box
    const playerFeetY = pBody.y + pBody.height; // Current bottom edge of player collision body
    const playerPrevFeetY = pBody.prev.y + pBody.height;
    const playerLeft = pBody.x;
    const playerRight = pBody.x + pBody.width;

    for (const echo of echoes) {
      if (!echo.sprite || !echo.sprite.active) continue;

      const eBody = echo.sprite.body as Phaser.Physics.Arcade.Body;
      const echoTopY = eBody.y; // Top boundary of echo collision body
      const echoLeft = eBody.x - 4; // Generous horizontal landing surface
      const echoRight = eBody.x + eBody.width + 4;

      // 1. Check horizontal alignment: player feet overlap echo top surface
      const isHorizontallyAligned = playerRight > echoLeft && playerLeft < echoRight;

      if (!isHorizontallyAligned) continue;

      // 2. Vertical landing condition:
      // Only snap if player is descending or resting (velocity.y >= 0).
      // If player is jumping upward (velocity.y < 0), let them ascend freely without snapping back!
      const isDescendingOrResting = pBody.velocity.y >= 0;
      const wasAboveOrAtTop = playerPrevFeetY <= echoTopY + 8;
      const isWithinLandingBand = playerFeetY >= echoTopY - 4 && playerFeetY <= echoTopY + 16;

      if (isDescendingOrResting && wasAboveOrAtTop && isWithinLandingBand) {
        // Snap player feet to rest smoothly on the echo top boundary
        const targetSpriteY = echoTopY - pBody.height - pBody.offset.y + echo.sprite.originY * pSprite.height;
        // Accurate Arcade adjustment:
        pSprite.setY(targetSpriteY);
        pBody.setVelocityY(0);
        pBody.position.y = echoTopY - pBody.height;

        // Mark player as standing on an external solid floor
        this.player.externalGrounded = true;
        // Transfer horizontal velocity/delta so player rides moving echo naturally
        this.player.ridingPlatformDeltaX = echo.deltaX;
        supportedByEcho = true;
        break;
      }
    }

    if (!supportedByEcho && pBody.velocity.y >= 0) {
      this.player.externalGrounded = false;
      this.player.ridingPlatformDeltaX = 0;
    }
  }

  public toggleRecording(): void {
    if (!this.recordingSystem || !this.currentLevelConfig) return;
    if (this.recordingSystem.getIsRecording()) {
      const samples = this.recordingSystem.stopRecording();
      if (samples.length > 0) {
        this.echoSystem.storeRecordedTrack(samples);
        SarthiTutorialService.getInstance().recordTimelineSaved();
      }
    } else {
      this.recordingSystem.startRecording(this.currentLevelConfig.maxRecordingDurationSeconds);
      SarthiTutorialService.getInstance().recordTimelineStarted();
    }
  }

  public triggerReplayEcho(): void {
    if (!this.echoSystem) return;
    if (this.recordingSystem && this.recordingSystem.getIsRecording()) {
      const samples = this.recordingSystem.stopRecording();
      if (samples.length > 0) {
        this.echoSystem.storeRecordedTrack(samples);
        SarthiTutorialService.getInstance().recordTimelineSaved();
      }
    }
    this.echoSystem.spawnEchoFromLastRecording();
    SarthiTutorialService.getInstance().recordEchoSummoned();
  }

  public restartFullRun(): void {
    this.lives = 3;
    this.isGameOver = false;
    this.isInvulnerable = false;
    this.recordingSystem.reset();
    this.echoSystem.resetStoredTracks();
    gameEvents.emit(EVENTS.LIVES_UPDATED, { lives: this.lives, maxLives: 3 });
    this.loadLevel(this.currentLevelIndex);
  }

  private handlePlayerDeath(): void {
    if (this.isLevelComplete || this.isInvulnerable || this.isGameOver) return;
    
    sound.playDeath();
    this.lives = Math.max(0, this.lives - 1);
    gameEvents.emit(EVENTS.PLAYER_DIED, { lives: this.lives, maxLives: 3 });
    gameEvents.emit(EVENTS.LIVES_UPDATED, { lives: this.lives, maxLives: 3 });

    if (this.lives <= 0) {
      this.isGameOver = true;
      if (this.player && this.player.sprite && this.player.sprite.body) {
        this.player.sprite.setVelocity(0, 0);
        this.player.sprite.setAlpha(0.4);
      }
      gameEvents.emit(EVENTS.GAME_OVER, {
        levelId: this.currentLevelIndex,
        reason: 'depleted_lives',
      });
      return;
    }

    // Respawn with invulnerability grace period
    this.isInvulnerable = true;
    if (this.player && this.player.sprite && this.player.sprite.body) {
      this.player.sprite.setPosition(this.currentLevelConfig.spawnPoint.x, this.currentLevelConfig.spawnPoint.y);
      this.player.sprite.setVelocity(0, 0);
      
      // Visual blinking indicator for invulnerability
      this.tweens.add({
        targets: this.player.sprite,
        alpha: 0.3,
        duration: 150,
        yoyo: true,
        repeat: 4,
        onComplete: () => {
          if (this.player && this.player.sprite) {
            this.player.sprite.setAlpha(1);
          }
          this.isInvulnerable = false;
        }
      });
    }

    // Reset recording & echoes on death
    this.recordingSystem.reset();
    this.echoSystem.resetStoredTracks();
  }

  private handleLevelComplete(): void {
    if (this.isLevelComplete) return;
    this.isLevelComplete = true;

    // Freeze player movement & stop systems immediately
    if (this.player && this.player.sprite && this.player.sprite.body) {
      this.player.sprite.setVelocity(0, 0);
    }
    this.recordingSystem.reset();
    this.echoSystem.resetStoredTracks();

    sound.playLevelSuccess();

    if (this.currentLevelConfig.id === 0) {
      SarthiTutorialService.getInstance().recordFinalAssessmentSolved();
    }

    const elapsed = Math.round((performance.now() - this.levelStartTime) / 1000);
    gameEvents.emit(EVENTS.LEVEL_COMPLETED, {
      levelId: this.currentLevelConfig.id,
      completionTimeSeconds: elapsed,
      hintsUsed: this.hintsUsedCount,
      reflectionQuestion: this.currentLevelConfig.reflectionQuestion,
    });
  }

  private setupEventListeners(): void {
    // Unsubscribe any previous listeners before resubscribing
    this.unsubscribers.forEach(u => u());
    this.unsubscribers = [];
    this.unsubscribers.push(
      gameEvents.on(EVENTS.TRIGGER_RECORD, () => this.toggleRecording()),
      gameEvents.on(EVENTS.TRIGGER_REPLAY, () => this.triggerReplayEcho()),
      gameEvents.on(EVENTS.TRIGGER_RESTART, () => this.restartFullRun()),
      gameEvents.on(EVENTS.SET_CURRENT_LEVEL, (data) => {
        const payload = data as { levelId: number };
        this.loadLevel(payload.levelId);
      }),
      gameEvents.on(EVENTS.SARTHI_SHOW_TARGET, (data) => {
        const payload = data as { x: number; y: number; label: string };
        if (payload) {
          this.highlightObjectiveTarget(payload.x, payload.y, payload.label);
        }
      })
    );
  }

  /**
   * SARTHI "Show Me" Objective Indicator VFX
   * Renders an animated pulse beacon and guide arrow above the targeted objective
   */
  private highlightObjectiveTarget(x: number, y: number, label: string): void {
    // Pulse beacon circle
    const beacon = this.add.circle(x, y, 24, 0x00f0ff, 0.4);
    beacon.setDepth(45);

    // Objective text tag
    const tag = this.add.text(x, y - 40, `▼ ${label}`, {
      fontSize: '11px',
      fontFamily: 'monospace',
      color: '#00f0ff',
      backgroundColor: 'rgba(11, 19, 36, 0.85)',
      padding: { x: 6, y: 3 },
    });
    tag.setOrigin(0.5, 0.5);
    tag.setDepth(46);

    this.tweens.add({
      targets: beacon,
      scaleX: 1.8,
      scaleY: 1.8,
      alpha: 0,
      duration: 800,
      repeat: 3,
      onComplete: () => {
        beacon.destroy();
        tag.destroy();
      }
    });
  }

  public updateCameraZoom(): void {
    const { width, height } = this.scale;
    if (!width || !height || !this.cameras || !this.cameras.main) return;

    const isPortrait = height > width;
    let targetZoom = 1.0;

    if (isPortrait) {
      // In portrait, ensure the explorer and platforms are clear and prominent
      // Screen width is narrow (360-430px), zoom in to keep character scale visible
      targetZoom = Math.min(1.5, Math.max(1.3, height / 600));
    } else {
      // In landscape:
      // Smaller screens (height <= 450) need more zoom (1.35)
      // Standard 720p/1080p landscape screens use 1.25x for clear character and platform details
      targetZoom = height <= 450 ? 1.35 : 1.25;
    }

    this.cameras.main.setZoom(targetZoom);
  }

  public destroyScene(): void {
    if (this.input && this.input.keyboard) {
      this.input.keyboard.off('keydown');
    }
    this.scale.off('resize', this.updateCameraZoom, this);
    this.unsubscribers.forEach(u => u());
    this.unsubscribers = [];
    if (this.puzzleSystem) {
      this.puzzleSystem.cleanup();
    }
  }
}
