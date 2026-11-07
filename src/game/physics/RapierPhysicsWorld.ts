import RAPIER from '@dimforge/rapier3d-compat';

export interface DebugColliderMeshInfo {
  type: 'cuboid' | 'capsule' | 'sensor';
  position: { x: number; y: number; z: number };
  extents: { x: number; y: number; z: number };
}

export class RapierPhysicsWorld {
  private static wasmInitialized = false;
  private static wasmInitPromise: Promise<void> | null = null;

  private world!: RAPIER.World;
  private gravity = { x: 0.0, y: -26.0, z: 0.0 };

  // Collision Groups (Bitmasks)
  public static readonly GROUP_PLAYER = 0x0001;
  public static readonly GROUP_ENVIRONMENT = 0x0002;
  public static readonly GROUP_SENSOR = 0x0004;
  public static readonly GROUP_ECHO = 0x0008;

  // Tracked colliders & bodies
  private playerBody: RAPIER.RigidBody | null = null;
  private playerCollider: RAPIER.Collider | null = null;

  // Track all active debug objects for wireframe rendering
  private debugObjects: DebugColliderMeshInfo[] = [];

  // Reusable raycaster for ground detection
  private ray = new RAPIER.Ray({ x: 0, y: 0, z: 0 }, { x: 0, y: -1, z: 0 });

  // Fixed timestep simulation accumulator
  private readonly FIXED_DELTA = 1 / 60;
  private accumulator = 0;

  public constructor() {
    this.world = new RAPIER.World(this.gravity);
  }

  /**
   * Ensures the Rapier WASM module is initialized before instantiating a physics world.
   * Safe to call multiple times concurrently.
   */
  public static async ensureWasm(): Promise<void> {
    if (RapierPhysicsWorld.wasmInitialized) return;
    if (!RapierPhysicsWorld.wasmInitPromise) {
      RapierPhysicsWorld.wasmInitPromise = RAPIER.init().then(() => {
        RapierPhysicsWorld.wasmInitialized = true;
      });
    }
    await RapierPhysicsWorld.wasmInitPromise;
  }

  /**
   * Factory function that guarantees WASM is initialized before constructing a world.
   */
  public static async createWorld(): Promise<RapierPhysicsWorld> {
    await RapierPhysicsWorld.ensureWasm();
    return new RapierPhysicsWorld();
  }

  public static async init(): Promise<RapierPhysicsWorld> {
    return RapierPhysicsWorld.createWorld();
  }

  /**
   * Sub-stepped fixed physics integration to guarantee determinism and eliminate tunneling.
   */
  public step(dt: number = 1 / 60): void {
    if (!this.world) return;

    this.accumulator += Math.min(dt, 0.05);

    while (this.accumulator >= this.FIXED_DELTA) {
      this.world.timestep = this.FIXED_DELTA;
      this.world.step();
      this.accumulator -= this.FIXED_DELTA;

      // Enforce strict 2.5D side-scrolling planar constraint:
      // Lock player position to Z = 0 and clamp velocities along depth
      if (this.playerBody) {
        const pos = this.playerBody.translation();
        if (Math.abs(pos.z) > 0.0001) {
          this.playerBody.setTranslation({ x: pos.x, y: pos.y, z: 0 }, true);
        }
        const linvel = this.playerBody.linvel();
        if (Math.abs(linvel.z) > 0.0001) {
          this.playerBody.setLinvel({ x: linvel.x, y: linvel.y, z: 0 }, true);
        }
      }
    }
  }

  /**
   * Spawns the player's dynamic rigid body with locked rotations and capsule collider.
   */
  public createPlayerBody(x: number, y: number): {
    body: RAPIER.RigidBody;
    collider: RAPIER.Collider;
  } {
    const bodyDesc = RAPIER.RigidBodyDesc.dynamic()
      .setTranslation(x, y, 0)
      .lockRotations()
      .setCcdEnabled(true);

    this.playerBody = this.world.createRigidBody(bodyDesc);

    // Half-height 0.4, radius 0.35 => total height ~1.5m, centered at (x, y)
    const colliderDesc = RAPIER.ColliderDesc.capsule(0.4, 0.35)
      .setFriction(0.15)
      .setRestitution(0.0)
      .setCollisionGroups(
        (RapierPhysicsWorld.GROUP_PLAYER << 16) |
        (RapierPhysicsWorld.GROUP_ENVIRONMENT | RapierPhysicsWorld.GROUP_SENSOR)
      );

    this.playerCollider = this.world.createCollider(colliderDesc, this.playerBody);

    return { body: this.playerBody, collider: this.playerCollider };
  }

  /**
   * Creates a static, immovable environment platform.
   */
  public createStaticPlatform(x: number, y: number, width: number, height: number, depth: number = 4.0): {
    body: RAPIER.RigidBody;
    collider: RAPIER.Collider;
  } {
    const bodyDesc = RAPIER.RigidBodyDesc.fixed().setTranslation(x, y, 0);
    const body = this.world.createRigidBody(bodyDesc);

    const colliderDesc = RAPIER.ColliderDesc.cuboid(width / 2, height / 2, depth / 2)
      .setFriction(0.6)
      .setRestitution(0.0)
      .setCollisionGroups(
        (RapierPhysicsWorld.GROUP_ENVIRONMENT << 16) |
        (RapierPhysicsWorld.GROUP_PLAYER | RapierPhysicsWorld.GROUP_ECHO)
      );

    const collider = this.world.createCollider(colliderDesc, body);

    this.debugObjects.push({
      type: 'cuboid',
      position: { x, y, z: 0 },
      extents: { x: width, y: height, z: depth }
    });

    return { body, collider };
  }

  /**
   * Creates a kinematic door slab whose position can be moved programmatically while blocking physical bodies.
   */
  public createKinematicDoor(x: number, y: number, width: number, height: number, depth: number = 2.0): {
    body: RAPIER.RigidBody;
    collider: RAPIER.Collider;
  } {
    const bodyDesc = RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(x, y, 0);
    const body = this.world.createRigidBody(bodyDesc);

    const colliderDesc = RAPIER.ColliderDesc.cuboid(width / 2, height / 2, depth / 2)
      .setCollisionGroups(
        (RapierPhysicsWorld.GROUP_ENVIRONMENT << 16) | RapierPhysicsWorld.GROUP_PLAYER
      );

    const collider = this.world.createCollider(colliderDesc, body);

    this.debugObjects.push({
      type: 'cuboid',
      position: { x, y, z: 0 },
      extents: { x: width, y: height, z: depth }
    });

    return { body, collider };
  }

  /**
   * Creates a trigger sensor collider (for pressure plates, switches, hazards, or exit zones).
   */
  public createSensor(x: number, y: number, width: number, height: number, depth: number = 2.0): {
    body: RAPIER.RigidBody;
    collider: RAPIER.Collider;
  } {
    const bodyDesc = RAPIER.RigidBodyDesc.fixed().setTranslation(x, y, 0);
    const body = this.world.createRigidBody(bodyDesc);

    const colliderDesc = RAPIER.ColliderDesc.cuboid(width / 2, height / 2, depth / 2)
      .setSensor(true)
      .setCollisionGroups(
        (RapierPhysicsWorld.GROUP_SENSOR << 16) |
        (RapierPhysicsWorld.GROUP_PLAYER | RapierPhysicsWorld.GROUP_ECHO)
      );

    const collider = this.world.createCollider(colliderDesc, body);

    this.debugObjects.push({
      type: 'sensor',
      position: { x, y, z: 0 },
      extents: { x: width, y: height, z: depth }
    });

    return { body, collider };
  }

  /**
   * Precise Raycast Ground Detection to eliminate floating and falling bugs.
   */
  public checkGrounded(maxDistance: number = 0.85): boolean {
    if (!this.playerBody || !this.world) return false;
    const pos = this.playerBody.translation();

    this.ray.origin = { x: pos.x, y: pos.y, z: 0 };
    this.ray.dir = { x: 0, y: -1, z: 0 };

    const hit = this.world.castRay(
      this.ray,
      maxDistance,
      true, // solid
      RAPIER.QueryFilterFlags.EXCLUDE_SENSORS,
      (RapierPhysicsWorld.GROUP_PLAYER << 16) | RapierPhysicsWorld.GROUP_ENVIRONMENT
    );

    return hit !== null && hit.timeOfImpact <= maxDistance;
  }

  public getPlayerBody(): RAPIER.RigidBody | null {
    return this.playerBody;
  }

  public getDebugObjects(): DebugColliderMeshInfo[] {
    return this.debugObjects;
  }

  public resetWorld(): void {
    if (this.world) {
      this.world.free();
      this.world = new RAPIER.World(this.gravity);
      this.playerBody = null;
      this.playerCollider = null;
      this.debugObjects = [];
      this.accumulator = 0;
    }
  }

  public destroy(): void {
    if (this.world) {
      this.world.free();
      this.playerBody = null;
      this.playerCollider = null;
      this.debugObjects = [];
    }
  }
}
