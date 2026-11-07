import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';
import { LevelConfig, EchoSample } from '../../types';
import { gameEvents, EVENTS } from '../events/GameEventBus';
import { sound } from '../../services/audio/AudioService';
import { RecordingSystem } from '../systems/RecordingSystem';
import { SciFiAssetFactory } from '../graphics/SciFiAssetFactory';
import { NatureAssetFactory } from '../graphics/NatureAssetFactory';
import { RapierPhysicsWorld } from '../physics/RapierPhysicsWorld';
import { ModelAssetPipeline } from '../graphics/ModelAssetPipeline';

export type SceneLifecycleState = 'new' | 'initializing' | 'ready' | 'destroying' | 'destroyed';

export interface PhysicalDoor {
  id: string;
  doorGroup: THREE.Group;
  slidingSlab: THREE.Object3D;
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

  // Semantic Scene Graph Layers (Phases 2 & 10)
  private backgroundGroup: THREE.Group = new THREE.Group();
  private architectureGroup: THREE.Group = new THREE.Group();
  private gameplayGroup: THREE.Group = new THREE.Group();
  private interactiveGroup: THREE.Group = new THREE.Group();
  private characterGroup: THREE.Group = new THREE.Group();
  private foregroundGroup: THREE.Group = new THREE.Group();
  private effectsGroup: THREE.Group = new THREE.Group();
  private debugGroup: THREE.Group = new THREE.Group();

  // Physics World (Rapier 3D WebAssembly)
  private physics: RapierPhysicsWorld | null = null;
  private playerBody: RAPIER.RigidBody | null = null;
  private debugPhysicsEnabled: boolean = false;

  // 3D Player Meshes & Articulation
  private playerMeshGroup: THREE.Group | null = null;
  private playerLeftLeg: THREE.Object3D | null = null;
  private playerRightLeg: THREE.Object3D | null = null;
  private playerLeftArm: THREE.Object3D | null = null;
  private playerRightArm: THREE.Object3D | null = null;
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
  private platformMeshes: THREE.Object3D[] = [];
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
      this.initThree();
      this.initInputs();

      if ((this.state as SceneLifecycleState) === 'destroying' || (this.state as SceneLifecycleState) === 'destroyed') {
        this.cleanup();
        return false;
      }

      this.physics = await RapierPhysicsWorld.createWorld();

      if ((this.state as SceneLifecycleState) === 'destroying' || (this.state as SceneLifecycleState) === 'destroyed') {
        this.cleanup();
        return false;
      }

      await this.loadLevel(this.currentLevelConfig);

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

    // Balanced natural atmosphere
    this.scene.background = new THREE.Color(0x16202c);
    this.scene.fog = new THREE.Fog(0x16202c, 24, 65);

    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    this.camera.position.set(0, 4.5, 24);
    this.camera.lookAt(0, 3.5, 0);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.35;
    this.container.appendChild(this.renderer.domElement);

    // Setup Scene Graph Groups
    this.scene.add(this.backgroundGroup);
    this.scene.add(this.architectureGroup);
    this.scene.add(this.gameplayGroup);
    this.scene.add(this.interactiveGroup);
    this.scene.add(this.characterGroup);
    this.scene.add(this.foregroundGroup);
    this.scene.add(this.effectsGroup);
    this.scene.add(this.debugGroup);

    // Realistic Balanced Lighting Pipeline (Phase 6)
    // 1. Natural Ambient/Hemisphere Sky & Ground Fill
    const hemiLight = new THREE.HemisphereLight(0x7ea8c8, 0x3a3028, 1.25);
    this.scene.add(hemiLight);

    // 2. Key Warm Sunlight Directional Light
    const sunLight = new THREE.DirectionalLight(0xfff5e6, 1.85);
    sunLight.position.set(14, 25, 18);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 65;
    sunLight.shadow.camera.left = -28;
    sunLight.shadow.camera.right = 28;
    sunLight.shadow.camera.top = 22;
    sunLight.shadow.camera.bottom = -16;
    sunLight.shadow.bias = -0.0005;
    this.scene.add(sunLight);

    // 3. Cool Subtle Temporal Rim Light
    const rimLight = new THREE.DirectionalLight(0x38d9ff, 0.85);
    rimLight.position.set(-16, 14, -10);
    this.scene.add(rimLight);

    // 4. Subtle Character Light
    this.playerPointLight = new THREE.PointLight(0x38d9ff, 1.4, 7.5);
    this.effectsGroup.add(this.playerPointLight);

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
    // Prevent browser scrolling on gameplay keys
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
      e.preventDefault();
    }

    this.keys[e.code] = true;

    if (e.code === 'KeyR') this.toggleRecording();
    if (e.code === 'KeyE') this.triggerReplayEcho();
    if (e.code === 'KeyF' || e.code === 'Enter') this.reqInteraction = true;

    // Toggle runtime physics wireframe debugger (Phase 3)
    if (e.code === 'F1' || e.code === 'Backquote') {
      this.debugPhysicsEnabled = !this.debugPhysicsEnabled;
      this.debugGroup.visible = this.debugPhysicsEnabled;
    }

    if (e.code === 'Space' || e.code === 'KeyW' || e.code === 'ArrowUp') {
      this.jumpBufferTimer = 0.12;
    }
  };

  private onKeyUp = (e: KeyboardEvent): void => {
    this.keys[e.code] = false;
  };

  public async loadLevel(config: LevelConfig): Promise<void> {
    this.currentLevelConfig = config;

    if (!this.physics || !this.scene) {
      return;
    }

    this.isLevelComplete = false;
    this.levelStartTime = performance.now();
    this.hintsUsedCount = 0;

    this.clearSceneObjects();
    this.physics.resetWorld();
    this.recordingSystem.reset();
    this.activeEchoTimelines = [];
    this.storedTracks = [];

    const scale = 0.025;
    const offsetY = 7.0;
    const offsetX = -12.0;

    const pipeline = ModelAssetPipeline.getInstance();

    // 1. Layer 1-3: Far Background & Facility Architecture (Z = -16 to -5)
    const facilityBg = SciFiAssetFactory.createFacilityEnvironment(75, 30);
    this.backgroundGroup.add(facilityBg);
    this.platformMeshes.push(facilityBg);

    // Natural Reclaimed Trees in Midground (Z = -5.5 to -4.5)
    try {
      const tree1 = await pipeline.loadModel('/assets/nature/tree_ancient.glb');
      tree1.position.set(-16, -1.0, -5.5);
      tree1.scale.set(1.15, 1.15, 1.15);
      this.architectureGroup.add(tree1);
      this.platformMeshes.push(tree1);

      const tree2 = await pipeline.loadModel('/assets/nature/tree_ancient.glb');
      tree2.position.set(17, -1.0, -5.0);
      tree2.scale.set(1.0, 1.0, 1.0);
      this.architectureGroup.add(tree2);
      this.platformMeshes.push(tree2);
    } catch (e) {
      console.warn('Nature GLB loading fallback:', e);
      const procTree1 = NatureAssetFactory.createAncientTree(12, 'oak');
      procTree1.position.set(-16, -1.0, -5.5);
      this.architectureGroup.add(procTree1);
      this.platformMeshes.push(procTree1);

      const procTree2 = NatureAssetFactory.createAncientTree(10, 'pine');
      procTree2.position.set(17, -1.0, -5.0);
      this.architectureGroup.add(procTree2);
      this.platformMeshes.push(procTree2);
    }

    // 2. Layer 4: Gameplay Environment Platforms (Z = 0)
    for (const p of config.platforms) {
      const w = p.width * scale;
      const h = p.height * scale;
      const d = 4.0;
      const x = p.x * scale + w / 2 + offsetX;
      const y = -p.y * scale - h / 2 + offsetY;

      const platGroup = SciFiAssetFactory.createIndustrialPlatform(w, h, d);
      platGroup.position.set(x, y, 0);
      this.gameplayGroup.add(platGroup);
      this.platformMeshes.push(platGroup);

      this.physics.createStaticPlatform(x, y, w, h, d);
    }

    // 3. Layer 4: Hazards (High-voltage pulsing lasers at Z = 0)
    if (config.hazards) {
      const laserMat = new THREE.MeshBasicMaterial({ color: 0xff0055 });
      for (const h of config.hazards) {
        const w = h.width * scale;
        const hgt = Math.max(0.35, h.height * scale);
        const x = h.x * scale + w / 2 + offsetX;
        const y = -h.y * scale - hgt / 2 + offsetY;

        const laserMesh = new THREE.Mesh(new THREE.BoxGeometry(w, hgt, 1.8), laserMat);
        laserMesh.position.set(x, y, 0);
        this.gameplayGroup.add(laserMesh);

        const hazardLight = new THREE.PointLight(0xff0055, 1.4, 4.0);
        hazardLight.position.set(x, y + 0.2, 0.6);
        this.effectsGroup.add(hazardLight);

        this.hazardBoxes.push(
          new THREE.Box3(
            new THREE.Vector3(x - w / 2, y - hgt / 2, -1.0),
            new THREE.Vector3(x + w / 2, y + hgt / 2, 1.0)
          )
        );
      }
    }

    // 4. Layer 5: Interactive Pressure Plates with Rapier Sensor Triggers (Z = 0)
    for (const p of config.pressurePlates) {
      const w = p.width * scale;
      const x = p.x * scale + w / 2 + offsetX;
      const y = -p.y * scale + offsetY;

      const { plateGroup, padMesh, padLight } = SciFiAssetFactory.createPressurePlate(w);
      plateGroup.position.set(x, y, 0);
      this.interactiveGroup.add(plateGroup);

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

    // 5. Layer 5: Interactive Switch Consoles (Z = 0)
    for (const sw of config.switches) {
      const x = sw.x * scale + offsetX;
      const y = -sw.y * scale + offsetY;

      let terminalGroup: THREE.Group;
      try {
        terminalGroup = await pipeline.loadModel('/assets/props/terminal_console.glb');
      } catch {
        terminalGroup = SciFiAssetFactory.createSwitchTerminal().terminalGroup;
      }
      terminalGroup.position.set(x, y, 0);
      this.interactiveGroup.add(terminalGroup);

      const beaconLight = new THREE.PointLight(0xd4a52c, 1.4, 4.5);
      beaconLight.position.set(x, y + 1.6, 0.4);
      this.effectsGroup.add(beaconLight);

      this.switches.set(sw.id, {
        id: sw.id,
        terminalGroup,
        beaconLight,
        type: sw.type,
        durationSeconds: sw.durationSeconds || 5,
        timerRemaining: 0,
        isActive: false,
        bounds: new THREE.Box3(
          new THREE.Vector3(x - 0.9, y - 0.2, -1.0),
          new THREE.Vector3(x + 0.9, y + 1.8, 1.0)
        ),
      });
    }

    // 6. Layer 5: Mechanical Security Blast Doors (Kinematic Rapier Collider at Z = 0)
    for (const d of config.doors) {
      const w = d.width * scale;
      const h = d.height * scale;
      const x = d.x * scale + w / 2 + offsetX;
      const y = -d.y * scale - h / 2 + offsetY;

      let doorGroup: THREE.Group;
      let slidingSlab: THREE.Object3D;

      try {
        doorGroup = await pipeline.loadModel('/assets/machinery/door_bulkhead.glb');
        slidingSlab = doorGroup.getObjectByName('Sliding_Slab') || doorGroup;
      } catch {
        const res = SciFiAssetFactory.createMechanicalDoor(w, h, 2.0);
        doorGroup = res.doorGroup;
        slidingSlab = res.slidingSlab;
      }

      doorGroup.position.set(x, y, 0);
      this.interactiveGroup.add(doorGroup);

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

    // 7. Layer 5: Exit Gateway Portal
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
      new THREE.MeshBasicMaterial({ color: 0x38d9ff, transparent: true, opacity: 0.65 })
    );
    this.exitPortalGroup.add(arch, vortex);
    this.exitPortalGroup.position.set(exitX, exitY + 0.8, 0);
    this.interactiveGroup.add(this.exitPortalGroup);

    this.exitBox.set(
      new THREE.Vector3(exitX - 0.8, exitY - 0.5, -1.0),
      new THREE.Vector3(exitX + 0.8, exitY + 2.0, 1.0)
    );

    // 8. Layer 6: Spawn Humanoid Explorer Player Model (Z = 0)
    const spawnX = config.spawnPoint.x * scale + offsetX;
    const spawnY = -config.spawnPoint.y * scale + offsetY + 0.5;

    await this.buildPlayer(spawnX, spawnY);

    // Build Debug Wireframes
    this.rebuildPhysicsDebugMeshes();

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

  private async buildPlayer(spawnX: number, spawnY: number): Promise<void> {
    if (!this.physics) return;
    if (this.playerMeshGroup) this.characterGroup.remove(this.playerMeshGroup);

    try {
      const pipeline = ModelAssetPipeline.getInstance();
      this.playerMeshGroup = await pipeline.loadModel('/assets/characters/player_explorer.glb');
      this.playerLeftLeg = this.playerMeshGroup.getObjectByName('LeftLeg') || null;
      this.playerRightLeg = this.playerMeshGroup.getObjectByName('RightLeg') || null;
      this.playerLeftArm = this.playerMeshGroup.getObjectByName('LeftArm') || null;
      this.playerRightArm = this.playerMeshGroup.getObjectByName('RightArm') || null;
    } catch {
      const {
        characterGroup,
        leftLeg,
        rightLeg,
        leftArm,
        rightArm,
      } = SciFiAssetFactory.createHumanoidCharacter(false);
      this.playerMeshGroup = characterGroup;
      this.playerLeftLeg = leftLeg;
      this.playerRightLeg = rightLeg;
      this.playerLeftArm = leftArm;
      this.playerRightArm = rightArm;
    }

    this.characterGroup.add(this.playerMeshGroup);

    const { body } = this.physics.createPlayerBody(spawnX, spawnY);
    this.playerBody = body;
  }

  private rebuildPhysicsDebugMeshes(): void {
    if (!this.physics) return;
    while (this.debugGroup.children.length > 0) {
      this.debugGroup.remove(this.debugGroup.children[0]);
    }

    const debugObjs = this.physics.getDebugObjects();
    const platMat = new THREE.MeshBasicMaterial({ color: 0x00ff88, wireframe: true });
    const sensorMat = new THREE.MeshBasicMaterial({ color: 0xff00ff, wireframe: true });

    for (const obj of debugObjs) {
      const geom = new THREE.BoxGeometry(obj.extents.x, obj.extents.y, obj.extents.z);
      const wireMesh = new THREE.Mesh(geom, obj.type === 'sensor' ? sensorMat : platMat);
      wireMesh.position.set(obj.position.x, obj.position.y, obj.position.z);
      this.debugGroup.add(wireMesh);
    }

    this.debugGroup.visible = this.debugPhysicsEnabled;
  }

  private startLoop(): void {
    if (this.animFrameId !== null) return;

    const loop = (now: number) => {
      if (this.state !== 'ready') return;

      const dt = Math.min((now - this.lastTickTime) / 1000, 0.05);
      this.lastTickTime = now;

      if (this.physics) {
        this.physics.step(dt);
      }

      this.updatePlayerKinematics(dt, now);
      this.updatePuzzles(dt);
      this.updateEchoes(now);
      this.updateCamera();

      if (this.renderer && this.scene && this.camera) {
        this.renderer.render(this.scene, this.camera);
      }

      this.animFrameId = requestAnimationFrame(loop);
    };
    this.animFrameId = requestAnimationFrame(loop);
  }

  private updatePlayerKinematics(dt: number, now: number): void {
    if (this.isLevelComplete || !this.playerBody || !this.physics || !this.playerMeshGroup) return;

    const physicallyGrounded = this.physics.checkGrounded(0.85);

    if (physicallyGrounded) {
      this.isGrounded = true;
      this.coyoteTimer = 0.1;
    } else {
      this.coyoteTimer -= dt;
      if (this.coyoteTimer <= 0) {
        this.isGrounded = false;
      }
    }

    if (this.jumpBufferTimer > 0) {
      this.jumpBufferTimer -= dt;
    }

    const maxSpeed = 7.5;
    const accel = 45.0;
    let targetVx = 0;
    if (this.keys['KeyA'] || this.keys['ArrowLeft']) targetVx -= maxSpeed;
    if (this.keys['KeyD'] || this.keys['ArrowRight']) targetVx += maxSpeed;

    const currentVel = this.playerBody.linvel();
    let newVx = THREE.MathUtils.lerp(currentVel.x, targetVx, accel * dt);
    let newVy = currentVel.y;

    if (Math.abs(targetVx) > 0.1) {
      this.facingDirection = targetVx > 0 ? 1 : -1;
      this.playerMeshGroup.rotation.y = this.facingDirection > 0 ? 0 : Math.PI;
    }

    if (this.jumpBufferTimer > 0 && this.isGrounded) {
      newVy = 13.5;
      this.isGrounded = false;
      this.coyoteTimer = 0;
      this.jumpBufferTimer = 0;
      sound.playJump();
    }

    this.playerBody.setLinvel({ x: newVx, y: newVy, z: 0 }, true);

    const translation = this.playerBody.translation();
    this.playerMeshGroup.position.set(translation.x, translation.y - 0.75, 0);

    if (this.playerPointLight) {
      this.playerPointLight.position.set(translation.x, translation.y + 0.2, 1.2);
    }

    // Articulated Locomotion Animation
    this.animTime += dt * 10;
    if (this.playerLeftLeg && this.playerRightLeg && this.playerLeftArm && this.playerRightArm) {
      if (this.isGrounded && Math.abs(newVx) > 0.5) {
        const legAngle = Math.sin(this.animTime) * 0.45;
        this.playerLeftLeg.rotation.x = legAngle;
        this.playerRightLeg.rotation.x = -legAngle;
        this.playerLeftArm.rotation.x = -legAngle * 0.8;
        this.playerRightArm.rotation.x = legAngle * 0.8;
      } else {
        this.playerLeftLeg.rotation.x = 0;
        this.playerRightLeg.rotation.x = 0;
        this.playerLeftArm.rotation.x = !this.isGrounded ? 0.3 : 0;
        this.playerRightArm.rotation.x = !this.isGrounded ? 0.3 : 0;
      }
    }

    const playerBounds = new THREE.Box3().setFromObject(this.playerMeshGroup);
    for (const hBox of this.hazardBoxes) {
      if (playerBounds.intersectsBox(hBox)) {
        this.handlePlayerDeath();
        return;
      }
    }

    if (translation.y < -12) {
      this.handlePlayerDeath();
      return;
    }

    if (playerBounds.intersectsBox(this.exitBox)) {
      this.handleLevelComplete();
      return;
    }

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
    if (!this.playerMeshGroup) return;
    const playerBounds = new THREE.Box3().setFromObject(this.playerMeshGroup);

    // 1. Update Pressure Plates
    for (const [, plate] of this.plates) {
      let isPressed = playerBounds.intersectsBox(plate.bounds);

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
        plate.padLight.intensity = isPressed ? 1.8 : 0.9;
        sound.playSwitch();
      }
    }

    // 2. Update Switches (Player Interaction Fix - Phase 4)
    for (const [, sw] of this.switches) {
      if (this.reqInteraction && playerBounds.intersectsBox(sw.bounds)) {
        if (sw.type === 'toggle') {
          sw.isActive = !sw.isActive;
        } else {
          sw.isActive = true;
          sw.timerRemaining = sw.durationSeconds;
        }
        sw.beaconLight.color.setHex(sw.isActive ? 0x2cd5f5 : 0xd4a52c);
        sound.playSwitch();
      }

      if (sw.type === 'timed' && sw.isActive) {
        sw.timerRemaining -= dt;
        if (sw.timerRemaining <= 0) {
          sw.isActive = false;
          sw.beaconLight.color.setHex(0xd4a52c);
          sound.playSwitch();
        }
      }
    }

    // 3. Update Doors (Sliding Bulkheads)
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

      const targetY = door.isOpen ? door.initialY + door.openOffsetY : door.initialY;
      const currentY = door.slidingSlab.position.y;
      const newY = currentY + (targetY - currentY) * 0.15;
      door.slidingSlab.position.y = newY;

      const bodyPos = door.body.translation();
      door.body.setNextKinematicTranslation({
        x: bodyPos.x,
        y: newY,
        z: 0,
      });
    }
  }

  private updateEchoes(now: number): void {
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

        // Echo Switch Interaction (Phase 5 Fix)
        if (sample.isInteracting) {
          const echoBounds = new THREE.Box3().setFromObject(echo.characterGroup);
          for (const [, sw] of this.switches) {
            if (echoBounds.intersectsBox(sw.bounds)) {
              if (sw.type === 'toggle') {
                sw.isActive = !sw.isActive;
              } else {
                sw.isActive = true;
                sw.timerRemaining = sw.durationSeconds;
              }
              sw.beaconLight.color.setHex(sw.isActive ? 0x2cd5f5 : 0xd4a52c);
              sound.playSwitch();
            }
          }
        }
      }
    }

    for (const exp of expired) {
      this.characterGroup.remove(exp.characterGroup);
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
    if (this.recordingSystem.getIsRecording()) {
      const samples = this.recordingSystem.stopRecording();
      if (samples.length > 0) this.storedTracks.push(samples);
    }

    if (this.storedTracks.length === 0) return;
    const track = this.storedTracks[this.storedTracks.length - 1];

    const { characterGroup } = SciFiAssetFactory.createHumanoidCharacter(true);
    const firstSample = track[0];
    characterGroup.position.set(firstSample.x, firstSample.y, 0);
    this.characterGroup.add(characterGroup);

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
    this.platformMeshes.forEach(mesh => {
      this.backgroundGroup.remove(mesh);
      this.architectureGroup.remove(mesh);
      this.gameplayGroup.remove(mesh);
    });
    this.platformMeshes = [];
    this.hazardBoxes = [];

    this.plates.forEach(p => this.interactiveGroup.remove(p.plateGroup));
    this.plates.clear();

    this.switches.forEach(s => this.interactiveGroup.remove(s.terminalGroup));
    this.switches.clear();

    this.doors.forEach(d => this.interactiveGroup.remove(d.doorGroup));
    this.doors.clear();

    this.activeEchoTimelines.forEach(e => this.characterGroup.remove(e.characterGroup));
    this.activeEchoTimelines = [];

    if (this.exitPortalGroup) this.interactiveGroup.remove(this.exitPortalGroup);

    while (this.effectsGroup.children.length > 0) {
      this.effectsGroup.remove(this.effectsGroup.children[0]);
    }
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
    this.playerMeshGroup = null;
    this.playerBody = null;
  }
}
