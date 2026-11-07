import { describe, it, expect, beforeEach } from 'vitest';
import { Three25DScene } from '../../src/game/engine/Three25DScene';
import { CAMPAIGN_LEVELS } from '../../src/data/levels';
import { RapierPhysicsWorld } from '../../src/game/physics/RapierPhysicsWorld';

describe('Three25DScene Lifecycle & React Strict Mode Tolerance', () => {
  let mockContainer: HTMLElement;

  beforeEach(() => {
    mockContainer = {
      clientWidth: 960,
      clientHeight: 600,
      appendChild: () => {},
      removeChild: () => {},
      contains: () => true,
    } as unknown as HTMLElement;
  });

  it('initializes with state "new"', () => {
    const scene = new Three25DScene(mockContainer, CAMPAIGN_LEVELS[0]);
    expect(scene.getState()).toBe('new');
    expect(() => scene.destroy()).not.toThrow();
  });

  it('can destroy before init completes without throw', () => {
    const scene = new Three25DScene(mockContainer, CAMPAIGN_LEVELS[0]);
    expect(() => scene.destroy()).not.toThrow();
    expect(scene.getState()).toBe('destroyed');
  });

  it('idempotent destroy call does not throw', () => {
    const scene = new Three25DScene(mockContainer, CAMPAIGN_LEVELS[0]);
    scene.destroy();
    expect(() => scene.destroy()).not.toThrow();
    expect(scene.getState()).toBe('destroyed');
  });

  it('loadLevel before init completes is safely guarded and does not crash', () => {
    const scene = new Three25DScene(mockContainer, CAMPAIGN_LEVELS[0]);
    expect(() => scene.loadLevel(CAMPAIGN_LEVELS[1])).not.toThrow();
  });

  it('RapierPhysicsWorld createWorld and resetWorld execute safely', async () => {
    const world = await RapierPhysicsWorld.createWorld();
    expect(world).toBeDefined();

    world.createStaticPlatform(0, 0, 10, 1);
    world.createPlayerBody(0, 5);

    expect(() => world.resetWorld()).not.toThrow();
    expect(() => world.destroy()).not.toThrow();
  });
});
