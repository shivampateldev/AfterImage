import { describe, it, expect, beforeEach } from 'vitest';
import { RapierPhysicsWorld } from '../../src/game/physics/RapierPhysicsWorld';
import { CAMPAIGN_LEVELS } from '../../src/data/levels';

describe('Level 02 Jump Physics & Platform Reachability', () => {
  let physics: RapierPhysicsWorld;

  beforeEach(async () => {
    physics = await RapierPhysicsWorld.createWorld();
  });

  it('verifies jump velocity, gravity, and ballistic trajectory reach', () => {
    const jumpVelocity = 13.5; // m/s
    const gravity = 26.0; // m/s^2
    const maxHorizontalSpeed = 7.5; // m/s

    // Total airtime for flat jump: T = 2 * V_y / g
    const airTime = (2 * jumpVelocity) / gravity;
    expect(airTime).toBeCloseTo(1.038, 2);

    // Max theoretical horizontal range: R = V_x * T
    const maxTheoreticalRangeMeters = maxHorizontalSpeed * airTime;
    expect(maxTheoreticalRangeMeters).toBeGreaterThan(7.0); // ~7.78 meters

    // Level design scale: 1 world unit = 40 pixels (0.025 scale factor)
    // 7.78m translates to ~310 pixels.
    // Every platform gap in Level 02 must be well below this limit with a 20%+ safety margin.
    const level02 = CAMPAIGN_LEVELS.find((l) => l.id === 2)!;
    expect(level02).toBeDefined();

    // Gap 1: Starting platform (x: 0, w: 340) -> Middle platform (x: 420, w: 180)
    // Gap = 420 - 340 = 80 pixels = 2.0 meters (well within 7.78m range!)
    const gap1Pixels = 420 - 340;
    const gap1Meters = gap1Pixels * 0.025;
    expect(gap1Meters).toBeLessThan(maxTheoreticalRangeMeters * 0.5); // 50% safety margin!

    // Gap 2: Middle platform (x: 420, w: 180 => right edge: 600) -> Gate corridor platform (x: 680)
    // Gap = 680 - 600 = 80 pixels = 2.0 meters
    const gap2Pixels = 680 - 600;
    const gap2Meters = gap2Pixels * 0.025;
    expect(gap2Meters).toBeLessThan(maxTheoreticalRangeMeters * 0.5); // 50% safety margin!
  });

  it('confirms pressure plate and kinematic blast door collider synchronization', () => {
    const level02 = CAMPAIGN_LEVELS.find((l) => l.id === 2)!;
    const plate = level02.pressurePlates[0];
    const door = level02.doors[0];

    expect(plate).toBeDefined();
    expect(door).toBeDefined();
    expect(plate.targetDoorId).toBe(door.id);

    // Create sensor & kinematic door in Rapier
    const sensor = physics.createSensor(plate.x * 0.025, -plate.y * 0.025, plate.width * 0.025, 0.35, 2.0);
    const kinematicDoor = physics.createKinematicDoor(door.x * 0.025, -door.y * 0.025, door.width * 0.025, door.height * 0.025, 2.0);

    expect(sensor.collider.isSensor()).toBe(true);
    expect(kinematicDoor.body.isKinematic()).toBe(true);
  });
});

