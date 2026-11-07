import { describe, it, expect, beforeEach } from 'vitest';
import { RapierPhysicsWorld } from '../../src/game/physics/RapierPhysicsWorld';

describe('RapierPhysicsWorld & 2.5D Kinematics', () => {
  let physics: RapierPhysicsWorld;

  beforeEach(async () => {
    physics = await RapierPhysicsWorld.init();
    physics.resetWorld();
  });

  it('initializes physics world with gravity', () => {
    expect(physics).toBeDefined();
  });

  it('spawns dynamic player body and simulates natural gravity fall', () => {
    const { body } = physics.createPlayerBody(0, 10);
    expect(body.translation().y).toBe(10);

    // Simulate 10 frames of gravity
    for (let i = 0; i < 10; i++) {
      physics.step(1 / 60);
    }

    // Player should have fallen downwards under gravity
    expect(body.translation().y).toBeLessThan(10);
    expect(body.linvel().y).toBeLessThan(0);
  });

  it('solid platform stops player from falling through (prevents tunneling)', () => {
    // Create static platform at y = 0, width 10, height 1
    physics.createStaticPlatform(0, 0, 10, 1.0, 4.0);

    // Spawn player at y = 3 directly above platform
    const { body } = physics.createPlayerBody(0, 3);

    // Step physics for 60 frames (1 second of simulation)
    for (let i = 0; i < 60; i++) {
      physics.step(1 / 60);
    }

    const finalY = body.translation().y;
    // Platform top is at 0 + 0.5 = 0.5; Player capsule half-height + radius ~ 0.75 -> settles around y ~ 1.2
    expect(finalY).toBeGreaterThanOrEqual(1.0);
    expect(finalY).toBeLessThan(1.5);
    expect(Math.abs(body.linvel().y)).toBeLessThan(0.1);
  });

  it('constrains motion strictly to the 2.5D plane (Z = 0)', () => {
    const { body } = physics.createPlayerBody(0, 5);

    // Attempt to induce a Z-axis perturbation
    body.setLinvel({ x: 5, y: 0, z: 10 }, true);
    physics.step(1 / 60);

    const pos = body.translation();
    const vel = body.linvel();
    expect(pos.z).toBe(0);
    expect(vel.z).toBe(0);
  });

  it('detects ground state via raycasting accurately', () => {
    physics.createStaticPlatform(0, 0, 10, 1.0, 4.0);
    physics.createPlayerBody(0, 3);

    // In mid-air initially
    physics.step(1 / 60);
    expect(physics.checkGrounded(0.85)).toBe(false);

    // Fall onto platform
    for (let i = 0; i < 50; i++) {
      physics.step(1 / 60);
    }

    // Now securely rested on platform
    expect(physics.checkGrounded(0.85)).toBe(true);
  });

  it('kinematic door blocks horizontal passage until opened', () => {
    // Create static floor
    physics.createStaticPlatform(0, 0, 20, 1.0, 4.0);

    // Create closed door at x = 2
    physics.createKinematicDoor(2, 2, 0.5, 3.0, 2.0);

    // Spawn player at x = 0
    const { body } = physics.createPlayerBody(0, 1.5);

    // Apply horizontal velocity towards door
    body.setLinvel({ x: 10, y: 0, z: 0 }, true);

    for (let i = 0; i < 30; i++) {
      physics.step(1 / 60);
    }

    // Player should be physically stopped by the door collider and not penetrate past x = 2
    expect(body.translation().x).toBeLessThan(2.0);
  });
});
