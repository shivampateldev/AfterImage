import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';
import { LevelConfig, EchoSample } from '../../types';
import { gameEvents, EVENTS } from '../events/GameEventBus';
import { sound } from '../../services/audio/AudioService';
import { RecordingSystem } from '../systems/RecordingSystem';
import { SciFiAssetFactory } from '../graphics/SciFiAssetFactory';
import { RapierPhysicsWorld } from '../physics/RapierPhysicsWorld';

export type SceneLifecycleState = 'new' | 'initializing' | 'ready' | 'destroying' | 'destroyed';

export interface PhysicalDoor {
  id: string;
  doorGroup: THREE.Group;
  slidingSlab: THREE.Mesh;
  body: RAPIER.RigidBody;
  initialY: number;
  openOffsetY: number;
  isOpen: boolean;
  reqPlateIds: string[];
  reqSwitchIds: string[];
}

export interface PhysicalPlate {
  id: string;
  plateGroup: THREE.Group;
  padMesh: THREE.Mesh;
  padLight: THREE.PointLight;
  sensorCollider: RAPIER.Collider;
  bounds: THREE.Box3;
  isPressed: boolean;
}

export interface PhysicalSwitch {
  id: string;
  terminalGroup: THREE.Group;
  beaconMesh: THREE.Mesh;
  beaconLight: THREE.PointLight;
  type: 'toggle' | 'timed';
  durationSeconds: number;
  timerRemaining: number;
  isActive: boolean;
  bounds: THREE.Box3;
}

export class Three25DScene {
  private container: HTMLElement;
  private state: SceneLifecycleState = 'new';

  private renderer: THREE.WebGLRenderer | null = null;
  private scene: THREE.Scene | null = null;
  private camera: THREE.PerspectiveCamera | null = null;

  // Physics World
  private physics: RapierPhysicsWorld | null = null;
  private playerBody: RAPIER.RigidBody | null = null;

  // 3D Player Meshes & Animation Hierarchy
  private playerGroup: THREE.Group | null = null;
  private playerLeftLeg: THREE.Mesh | null = null;
  private playerRightLeg: THREE.Mesh | null = null;
  private playerLeftArm: THREE.Mesh | null = null;
  private playerRightArm: THREE.Mesh | null = null;
  private playerPointLight: THREE.PointLight | null = null;
  private facingDirection: number = 1; // 1 = Right, -1 = Left

  // Player Locomotion Parameters & Buffers
  private isGrounded: boolean = false;
  private coyoteTimer: number = 0;
  private jumpBufferTimer: number = 0;
  private animTime: number = 0;

  // Echo Playback Instances
  private activeEchoTimelines: Array<{
    characterGroup: THREE.Group;
    samples: EchoSample[];
    startTime: number;
    durationMs: number;
  }> = [];
  private storedTracks: EchoSample[][] = [];

  // Puzzles & Geometry
  private platformMeshes: THREE.Group[] = [];
  private hazardBoxes: THREE.Box3[] = [];
  private exitPortalGroup: THREE.Group | null = null;
  private exitBox: THREE.Box3 = new THREE.Box3();
  private plates: Map<string, PhysicalPlate> = new Map();
  private switches: Map<string, PhysicalSwitch> = new Map();
  private doors: Map<string, PhysicalDoor> = new Map();

  // Systems
  private recordingSystem: RecordingSystem = new RecordingSystem();
  private currentLevelConfig: LevelConfig;
  private isLevelComplete = false;
  private levelStartTime = 0;
  private hintsUsedCount = 0;

  // Input states
  private keys: Record<string, boolean> = {};
  private reqInteraction = false;
  private animFrameId: number | null = null;
  private lastTickTime = performance.now();

  constructor(container: HTMLElement, levelConfig: LevelConfig) {
    this.container = container;
    this.currentLevelConfig = levelConfig;
  }

  public async init(): Promise<boolean> {
    if (this.state !== 'new') return false;
    this.state = 'initializing';

    try {
      // 1. Initialize Three.js WebGL Renderer & Scene
      this.initThree();
      this.initInputs();

      // Check if destroyed during synchronous setup
      if ((this.state as SceneLifecycleState) === 'destroying' || (this.state as SceneLifecycleState) === 'destroyed') {
        this.cleanup();
        return false;
      }

      // 2. Await Rapier Physics WASM and instantiate world
      this.physics = await RapierPhysicsWorld.createWorld();

      // Check if unmounted/destroyed while awaiting WASM
      if ((this.state as SceneLifecycleState) === 'destroying' || (this.state as SceneLifecycleState) === 'destroyed') {
        this.cleanup();
        return false;
      }

      // 3. Load Level Geometry & Colliders
      this.loadLevel(this.currentLevelConfig);

      // 4. Start 60Hz Physics & Render Loop
      this.state = 'ready';
      this.startLoop();

      return true;
    } catch (err) {
      console.error('Three25DScene initialization failed:', err);
      this.state = 'destroyed';
      this.cleanup();
      return false;
    }
  }

  public getState(): SceneLifecycleState {
    return this.state;
  }

  private initThree(): void {
    const width = this.container.clientWidth || 960;
    const height = this.container.clientHeight || 600;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a101d);
    this.scene.fog = new THREE.FogExp2(0x0a101d, 0.016);

    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 120);
    this.camera.position.set(0, 5, 26);
    this.camera.lookAt(0, 4, 0);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    // Supported modern shadow map type (replaces removed PCFSoftShadowMap)
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    this.container.appendChild(this.renderer.domElement);

    // Balanced Cinematic Lighting Setup
    const ambientLight = new THREE.AmbientLight(0x1a273e, 1.4);
    this.scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x38d9ff, 1.6);
    dirLight.position.set(12, 24, 18);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 60;
    dirLight.shadow.camera.left = -25;
    dirLight.shadow.camera.right = 25;
    dirLight.shadow.camera.top = 20;
    dirLight.shadow.camera.bottom = -15;
    this.scene.add(dirLight);

    const rimLight = new THREE.DirectionalLight(0xd4a52c, 1.1);
    rimLight.position.set(-18, 12, -12);
    this.scene.add(rimLight);

    // Dynamic Player Chest Point Light
    this.playerPointLight = new THREE.PointLight(0x38d9ff, 1.6, 9.0);
    this.scene.add(this.playerPointLight);

    window.addEventListener('resize', this.onResize);
  }

  private onResize = (): void => {
    if (!this.container || !this.renderer || !this.camera) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  private initInputs(): void {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
  }

  private onKeyDown = (e: KeyboardEvent): void => {
    this.keys[e.code] = true;
    if (e.code === 'KeyR') this.toggleRecording();
    if (e.code === 'KeyE') this.triggerReplayEcho();
    if (e.code === 'KeyF' || e.code === 'Enter') this.reqInteraction = true;
    if (e.code === 'Space' || e.code === 'KeyW' || e.code === 'ArrowUp') {
      this.jumpBufferTimer = 0.12; // 120ms jump buffer
    }
  };

  private onKeyUp = (e: KeyboardEvent): void => {
    this.keys[e.code] = false;
  };

  public loadLevel(config: LevelConfig): void {
    this.currentLevelConfig = config;

    // Safety guard: If physics or scene not ready yet, postpone until ready
    if (!this.physics || !this.scene) {
      return;
    }

    this.isLevelComplete = false;
    this.levelStartTime = performance.now();
    this.hintsUsedCount = 0;

    // Clear previous geometries and physics bodies
    this.clearSceneObjects();
    this.physics.resetWorld();
    this.recordingSystem.stopRecording();
    this.activeEchoTimelines = [];
    this.storedTracks = [];

    // Scale conversion: 1 unit in 3D = 40 pixels in level config
    const scale = 0.025;
    const offsetY = 7.0;
    const offsetX = -12.0;

    // 1. Build Ambient Facility Architecture (Walls, Gantry, Beams)
    const facilityBg = SciFiAssetFactory.createFacilityEnvironment(65, 26);
    this.scene.add(facilityBg);
    this.platformMeshes.push(facilityBg);

    // 2. Build Physical Platforms with Rapier Fixed RigidBodies
    for (const p of config.platforms) {
      const w = p.width * scale;
      const h = p.height * scale;
      const d = 4.0;
      const x = p.x * scale + w / 2 + offsetX;
      const y = -p.y * scale - h / 2 + offsetY;

      // Visual 3D Mesh
      const platGroup = SciFiAssetFactory.createIndustrialPlatform(w, h, d);
      platGroup.position.set(x, y, 0);
      this.scene.add(platGroup);
      this.platformMeshes.push(platGroup);

      // Real Rapier Static RigidBody & Cuboid Collider
      this.physics.createStaticPlatform(x, y, w, h, d);
    }

    // 3. Build Hazards (High-voltage pulsing lasers)
    if (config.hazards) {
      const laserMat = new THREE.MeshBasicMaterial({ color: 0xff0055 });
      for (const h of config.hazards) {
        const w = h.width * scale;
        const hgt = Math.max(0.35, h.height * scale);
        const x = h.x * scale + w / 2 + offsetX;
        const y = -h.y * scale - hgt / 2 + offsetY;

        const laserMesh = new THREE.Mesh(new THREE.BoxGeometry(w, hgt, 1.8), laserMat);
        laserMesh.position.set(x, y, 0);
        this.scene.add(laserMesh);

        const hazardLight = new THREE.PointLight(0xff0055, 1.4, 4.0);
        hazardLight.position.set(x, y + 0.2, 0.6);
        this.scene.add(hazardLight);

        this.hazardBoxes.push(
          new THREE.Box3(
            new THREE.Vector3(x - w / 2, y - hgt / 2, -1.0),
            new THREE.Vector3(x + w / 2, y + hgt / 2, 1.0)
          )
        );
      }
    }

    // 4. Build Pressure Plates with Rapier Sensor Triggers
    for (const p of config.pressurePlates) {
      const w = p.width * scale;
      const x = p.x * scale + w / 2 + offsetX;
      const y = -p.y * scale + offsetY;

      const { plateGroup, padMesh, padLight } = SciFiAssetFactory.createPressurePlate(w);
      plateGroup.position.set(x, y, 0);
      this.scene.add(plateGroup);

      const { collider } = this.physics.createSensor(x, y + 0.15, w, 0.35, 2.0);

      this.plates.set(p.id, {
        id: p.id,
        plateGroup,
        padMesh,
        padLight,
        sensorCollider: collider,
        bounds: new THREE.Box3(
          new THREE.Vector3(x - w / 2, y - 0.2, -1.0),
          new THREE.Vector3(x + w / 2, y + 0.6, 1.0)
        ),
        isPressed: false,
      });
    }

    // 5. Build Switch Consoles
    for (const sw of config.switches) {
      const x = sw.x * scale + offsetX;
      const y = -sw.y * scale + offsetY;

      const { terminalGroup, beaconMesh, beaconLight } = SciFiAssetFactory.createSwitchTerminal();
      terminalGroup.position.set(x, y, 0);
      this.scene.add(terminalGroup);

      this.switches.set(sw.id, {
        id: sw.id,
        terminalGroup,
        beaconMesh,
        beaconLight,
        type: sw.type,
        durationSeconds: sw.durationSeconds || 5,
        timerRemaining: 0,
        isActive: false,
        bounds: new THREE.Box3(
          new THREE.Vector3(x - 0.7, y, -1.0),
          new THREE.Vector3(x + 0.7, y + 1.4, 1.0)
        ),
      });
    }

    // 6. Build Mechanical Security Blast Doors
    for (const d of config.doors) {
      const w = d.width * scale;
      const h = d.height * scale;
      const x = d.x * scale + w / 2 + offsetX;
      const y = -d.y * scale - h / 2 + offsetY;

      const { doorGroup, slidingSlab } = SciFiAssetFactory.createMechanicalDoor(w, h, 2.0);
      doorGroup.position.set(x, y, 0);
      this.scene.add(doorGroup);

      const { body } = this.physics.createKinematicDoor(x, y, w, h, 2.0);

      const openOffsetY = (d.openOffset?.y || -120) * scale;
      const reqPlates = config.pressurePlates.filter(p => p.targetDoorId === d.id).map(p => p.id);
      const reqSw = config.switches.filter(s => s.targetDoorId === d.id).map(s => s.id);

      this.doors.set(d.id, {
        id: d.id,
        doorGroup,
        slidingSlab,
        body,
        initialY: y,
        openOffsetY,
        isOpen: false,
        reqPlateIds: reqPlates,
        reqSwitchIds: reqSw,
      });
    }

    // 7. Exit Gateway Portal
    const exitX = config.exitPoint.x * scale + offsetX;
    const exitY = -config.exitPoint.y * scale + offsetY;

    this.exitPortalGroup = new THREE.Group();
    const arch = new THREE.Mesh(
      new THREE.TorusGeometry(1.2, 0.2, 16, 32),
      new THREE.MeshStandardMaterial({
        color: 0x162238,
        emissive: 0x38d9ff,
        emissiveIntensity: 1.0,
      })
    );
    const vortex = new THREE.Mesh(
      new THREE.CircleGeometry(1.1, 32),
      new THREE.MeshBasicMaterial({ color: 0x38d9ff, transparent: true, opacity: 0.6 })
    );
    this.exitPortalGroup.add(arch, vortex);
    this.exitPortalGroup.position.set(exitX, exitY + 0.8, 0);
    this.scene.add(this.exitPortalGroup);

    this.exitBox.set(
      new THREE.Vector3(exitX - 0.8, exitY - 0.5, -1.0),
      new THREE.Vector3(exitX + 0.8, exitY + 2.0, 1.0)
    );

    // 8. Player Character Model & Rigid Body
    const spawnX = config.spawnPoint.x * scale + offsetX;
    const spawnY = -config.spawnPoint.y * scale + offsetY + 0.5;

    this.buildPlayer(spawnX, spawnY);

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

  private buildPlayer(spawnX: number, spawnY: number): void {
    if (!this.scene || !this.physics) return;
    if (this.playerGroup) this.scene.remove(this.playerGroup);

    const {
      characterGroup,
      leftLeg,
      rightLeg,
      leftArm,
      rightArm,
    } = SciFiAssetFactory.createHumanoidCharacter(false);

    this.playerGroup = characterGroup;
    this.playerLeftLeg = leftLeg;
    this.playerRightLeg = rightLeg;
    this.playerLeftArm = leftArm;
    this.playerRightArm = rightArm;

    this.scene.add(this.playerGroup);

    // Create Rapier Dynamic Rigid Body
    const { body } = this.physics.createPlayerBody(spawnX, spawnY);
    this.playerBody = body;
  }

  private startLoop(): void {
    if (this.animFrameId !== null) return; // Prevent duplicate loops

    const loop = (now: number) => {
      if (this.state !== 'ready') return;

      const dt = Math.min((now - this.lastTickTime) / 1000, 0.05);
      this.lastTickTime = now;

      // 1. Fixed Timestep Physics Simulation
      if (this.physics) {
        this.physics.step(dt);
      }

      // 2. Kinematics, Movement, Buffers & Jump Resolution
      this.updatePlayerKinematics(dt, now);

      // 3. Puzzles, Sensor Contacts & Mechanical Doors
      this.updatePuzzles(dt);

      // 4. Temporal Echoes Playback
      this.updateEchoes(now);

      // 5. Cinematic Smooth Camera
      this.updateCamera();

      // 6. WebGL Render
      if (this.renderer && this.scene && this.camera) {
        this.renderer.render(this.scene, this.camera);
      }

      this.animFrameId = requestAnimationFrame(loop);
    };
    this.animFrameId = requestAnimationFrame(loop);
  }

  private updatePlayerKinematics(dt: number, now: number): void {
    if (this.isLevelComplete || !this.playerBody || !this.physics || !this.playerGroup) return;

    // Robust Ground Detection via Raycast
    const physicallyGrounded = this.physics.checkGrounded(0.85);

    if (physicallyGrounded) {
      this.isGrounded = true;
      this.coyoteTimer = 0.1; // 100ms Coyote Time
    } else {
      this.coyoteTimer -= dt;
      if (this.coyoteTimer <= 0) {
        this.isGrounded = false;
      }
    }

    if (this.jumpBufferTimer > 0) {
      this.jumpBufferTimer -= dt;
    }

    // Horizontal Movement
    const maxSpeed = 7.5;
    const accel = 45.0;
    let targetVx = 0;
    if (this.keys['KeyA'] || this.keys['ArrowLeft']) targetVx -= maxSpeed;
    if (this.keys['KeyD'] || this.keys['ArrowRight']) targetVx += maxSpeed;

    const currentVel = this.playerBody.linvel();
    let newVx = THREE.MathUtils.lerp(currentVel.x, targetVx, accel * dt);
    let newVy = currentVel.y;

    // Handle Directional Orientation
    if (Math.abs(targetVx) > 0.1) {
      this.facingDirection = targetVx > 0 ? 1 : -1;
      this.playerGroup.rotation.y = this.facingDirection > 0 ? 0 : Math.PI;
    }

    // Jump Execution (Grounded or within Coyote Time)
    if (this.jumpBufferTimer > 0 && this.isGrounded) {
      newVy = 13.0; // Jump impulse
      this.isGrounded = false;
      this.coyoteTimer = 0;
      this.jumpBufferTimer = 0;
      sound.playJump();
    }

    // Apply linear velocity back to Rapier body (Constrained to XY plane: Z = 0)
    this.playerBody.setLinvel({ x: newVx, y: newVy, z: 0 }, true);

    // Synchronize Three.js 3D Mesh to Rapier Physics Body
    const translation = this.playerBody.translation();
    this.playerGroup.position.set(translation.x, translation.y - 0.75, 0);

    // Dynamic Player Light tracking
    if (this.playerPointLight) {
      this.playerPointLight.position.set(translation.x, translation.y + 0.2, 1.2);
    }

    // Procedural Running & Jumping Limb Animation
    this.animTime += dt * 10;
    if (this.playerLeftLeg && this.playerRightLeg && this.playerLeftArm && this.playerRightArm) {
      if (this.isGrounded && Math.abs(newVx) > 0.5) {
        const legAngle = Math.sin(this.animTime) * 0.45;
        this.playerLeftLeg.rotation.x = legAngle;
        this.playerRightLeg.rotation.x = -legAngle;
        this.playerLeftArm.rotation.x = -legAngle * 0.8;
        this.playerRightArm.rotation.x = legAngle * 0.8;
      } else {
        // Idle / In-Air Pose
        this.playerLeftLeg.rotation.x = 0;
        this.playerRightLeg.rotation.x = 0;
        this.playerLeftArm.rotation.x = !this.isGrounded ? 0.3 : 0;
        this.playerRightArm.rotation.x = !this.isGrounded ? 0.3 : 0;
      }
    }

    // Hazard Collisions
    const playerBounds = new THREE.Box3().setFromObject(this.playerGroup);
    for (const hBox of this.hazardBoxes) {
      if (playerBounds.intersectsBox(hBox)) {
        this.handlePlayerDeath();
        return;
      }
    }

    // Fall below level bounds check
    if (translation.y < -12) {
      this.handlePlayerDeath();
      return;
    }

    // Exit Gateway Check
    if (playerBounds.intersectsBox(this.exitBox)) {
      this.handleLevelComplete();
      return;
    }

    // Recording sampling
    if (this.recordingSystem.getIsRecording()) {
      this.recordingSystem.recordFrame(
        now,
        translation.x,
        translation.y - 0.75,
        newVx,
        newVy,
        this.facingDirection < 0,
        this.isGrounded ? (Math.abs(newVx) > 0.1 ? 'run' : 'idle') : 'jump',
        this.reqInteraction
      );
    }

    this.reqInteraction = false;
  }

  private updatePuzzles(dt: number): void {
    if (!this.playerGroup) return;
    const playerBounds = new THREE.Box3().setFromObject(this.playerGroup);

    // 1. Pressure Plates Check
    for (const [, plate] of this.plates) {
      let isPressed = playerBounds.intersectsBox(plate.bounds);

      // Check active echoes on plates
      for (const echo of this.activeEchoTimelines) {
        const echoBounds = new THREE.Box3().setFromObject(echo.characterGroup);
        if (echoBounds.intersectsBox(plate.bounds)) {
          isPressed = true;
          break;
        }
      }

      if (isPressed !== plate.isPressed) {
        plate.isPressed = isPressed;
        plate.padMesh.position.y = isPressed ? 0.02 : 0.08;
        plate.padLight.intensity = isPressed ? 1.6 : 0.8;
        sound.playSwitch();
      }
    }

    // 2. Timed Switches Countdown
    for (const [, sw] of this.switches) {
      if (sw.type === 'timed' && sw.isActive) {
        sw.timerRemaining -= dt;
        if (sw.timerRemaining <= 0) {
          sw.isActive = false;
          (sw.beaconMesh.material as THREE.MeshStandardMaterial).emissive.setHex(0xd4a52c);
          sw.beaconLight.color.setHex(0xd4a52c);
          sound.playSwitch();
        }
      }
    }

    // 3. Resolve Blast Doors & Synchronize Rapier Kinematic Bodies
    for (const [, door] of this.doors) {
      let shouldOpen = true;

      for (const plateId of door.reqPlateIds) {
        if (!this.plates.get(plateId)?.isPressed) {
          shouldOpen = false;
          break;
        }
      }

      for (const swId of door.reqSwitchIds) {
        if (!this.switches.get(swId)?.isActive) {
          shouldOpen = false;
          break;
        }
      }

      if (shouldOpen !== door.isOpen) {
        door.isOpen = shouldOpen;
        sound.playDoorOpen();
      }

      // Smooth slide open
      const targetY = door.isOpen ? door.initialY + door.openOffsetY : door.initialY;
      const currentY = door.slidingSlab.position.y;
      const newY = currentY + (targetY - currentY) * 0.15;
      door.slidingSlab.position.y = newY;

      // Update Kinematic RigidBody translation in Rapier
      const bodyPos = door.body.translation();
      door.body.setNextKinematicTranslation({
        x: bodyPos.x,
        y: newY,
        z: 0,
      });
    }
  }

  private updateEchoes(now: number): void {
    if (!this.scene) return;
    const expired: typeof this.activeEchoTimelines = [];

    for (const echo of this.activeEchoTimelines) {
      const elapsed = now - echo.startTime;
      if (elapsed >= echo.durationMs) {
        expired.push(echo);
        continue;
      }

      const sample = this.sampleTrack(echo.samples, elapsed);
      if (sample) {
        echo.characterGroup.position.set(sample.x, sample.y, 0);
        echo.characterGroup.rotation.y = sample.flipX ? Math.PI : 0;
      }
    }

    for (const exp of expired) {
      this.scene.remove(exp.characterGroup);
      this.activeEchoTimelines = this.activeEchoTimelines.filter(e => e !== exp);
    }
  }

  private sampleTrack(samples: EchoSample[], targetTime: number): EchoSample | null {
    if (samples.length === 0) return null;
    if (targetTime <= samples[0].timeOffset) return samples[0];
    if (targetTime >= samples[samples.length - 1].timeOffset) return samples[samples.length - 1];

    let low = 0;
    let high = samples.length - 1;
    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      if (samples[mid].timeOffset === targetTime) return samples[mid];
      if (samples[mid].timeOffset < targetTime) low = mid + 1;
      else high = mid - 1;
    }

    const s0 = samples[Math.max(0, high)];
    const s1 = samples[Math.min(samples.length - 1, low)];
    const factor = (targetTime - s0.timeOffset) / Math.max(1, s1.timeOffset - s0.timeOffset);

    return {
      timeOffset: targetTime,
      x: s0.x + (s1.x - s0.x) * factor,
      y: s0.y + (s1.y - s0.y) * factor,
      vx: s0.vx,
      vy: s0.vy,
      flipX: s1.flipX,
      animState: s1.animState,
      isInteracting: s1.isInteracting,
    };
  }

  private updateCamera(): void {
    if (!this.playerBody || !this.camera) return;
    const pos = this.playerBody.translation();

    // Cinematic camera lerping horizontally along player X
    const targetCamX = pos.x * 0.75;
    const targetCamY = Math.max(4.0, pos.y * 0.5 + 4.0);
    this.camera.position.x += (targetCamX - this.camera.position.x) * 0.08;
    this.camera.position.y += (targetCamY - this.camera.position.y) * 0.08;
    this.camera.lookAt(this.camera.position.x, this.camera.position.y - 1.0, 0);
  }

  public toggleRecording(): void {
    if (this.recordingSystem.getIsRecording()) {
      const samples = this.recordingSystem.stopRecording();
      if (samples.length > 0) {
        this.storedTracks.push(samples);
        if (this.storedTracks.length > this.currentLevelConfig.maxActiveEchoes) {
          this.storedTracks.shift();
        }
      }
    } else {
      this.recordingSystem.startRecording(this.currentLevelConfig.maxRecordingDurationSeconds);
    }
  }

  public triggerReplayEcho(): void {
    if (!this.scene) return;
    if (this.recordingSystem.getIsRecording()) {
      const samples = this.recordingSystem.stopRecording();
      if (samples.length > 0) this.storedTracks.push(samples);
    }

    if (this.storedTracks.length === 0) return;
    const track = this.storedTracks[this.storedTracks.length - 1];

    // Spawn 3D Spectral Echo Robot
    const { characterGroup } = SciFiAssetFactory.createHumanoidCharacter(true);
    const firstSample = track[0];
    characterGroup.position.set(firstSample.x, firstSample.y, 0);
    this.scene.add(characterGroup);

    this.activeEchoTimelines.push({
      characterGroup,
      samples: track,
      startTime: performance.now(),
      durationMs: track[track.length - 1].timeOffset,
    });

    sound.playEchoReplay();
  }

  private handlePlayerDeath(): void {
    if (this.isLevelComplete) return;
    sound.playSwitch();
    this.loadLevel(this.currentLevelConfig);
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

  private clearSceneObjects(): void {
    if (!this.scene) return;
    this.platformMeshes.forEach(mesh => this.scene?.remove(mesh));
    this.platformMeshes = [];
    this.hazardBoxes = [];
    this.plates.forEach(p => this.scene?.remove(p.plateGroup));
    this.plates.clear();
    this.switches.forEach(s => this.scene?.remove(s.terminalGroup));
    this.switches.clear();
    this.doors.forEach(d => this.scene?.remove(d.doorGroup));
    this.doors.clear();
    this.activeEchoTimelines.forEach(e => this.scene?.remove(e.characterGroup));
    this.activeEchoTimelines = [];
    if (this.exitPortalGroup) this.scene.remove(this.exitPortalGroup);
  }

  public destroy(): void {
    if (this.state === 'destroying' || this.state === 'destroyed') return;
    this.state = 'destroying';
    this.cleanup();
    this.state = 'destroyed';
  }

  private cleanup(): void {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }

    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', this.onResize);
      window.removeEventListener('keydown', this.onKeyDown);
      window.removeEventListener('keyup', this.onKeyUp);
    }

    this.clearSceneObjects();

    if (this.physics) {
      this.physics.destroy();
      this.physics = null;
    }

    if (this.renderer) {
      if (this.renderer.domElement && this.container.contains(this.renderer.domElement)) {
        this.container.removeChild(this.renderer.domElement);
      }
      this.renderer.dispose();
      this.renderer = null;
    }

    this.scene = null;
    this.camera = null;
    this.playerGroup = null;
    this.playerBody = null;
  }
}
