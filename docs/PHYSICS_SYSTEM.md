# RAPIER 3D RIGID-BODY PHYSICS SPECIFICATION
**Project:** AFTERIMAGE – THE LAST ECHO | AN SMP ORIGINAL  
**Engine:** Three.js WebGL 2.5D + Rapier 3D WebAssembly Physics Engine  

---

## 1. Physics Engine Architecture & Planar Constraints

AFTERIMAGE utilizes `@dimforge/rapier3d-compat` for deterministic, hardware-accelerated rigid-body simulation running at a fixed 60Hz rate:

```text
    User Inputs (A/D/Space)
            │
            ▼
    [Locomotion Controller] ────► [Rapier Dynamic RigidBody (Capsule)]
                                              │
                                    ┌─────────┴─────────┐
                                    ▼                   ▼
                           [Continuous CCD]    [Z = 0 Planar Lock]
                                    │                   │
                                    ▼                   ▼
                      [Platform / Door Colliders]  [Zero Depth Drift]
```

### 1.1 Strict 2.5D Planar Lock
In `src/game/physics/RapierPhysicsWorld.ts`, on every simulation step (`world.step()`):
```ts
if (this.playerBody) {
  const pos = this.playerBody.translation();
  if (Math.abs(pos.z) > 0.001) {
    this.playerBody.setTranslation({ x: pos.x, y: pos.y, z: 0 }, true);
  }
  const linvel = this.playerBody.linvel();
  if (Math.abs(linvel.z) > 0.001) {
    this.playerBody.setLinvel({ x: linvel.x, y: linvel.y, z: 0 }, true);
  }
}
```
This mathematically guarantees that the player cannot accidentally slip, tilt, or tunnel along the depth ($Z$) axis.

---

## 2. Dynamic Player Collider & Locomotion

- **RigidBody Type:** Dynamic with Continuous Collision Detection (`setCcdEnabled(true)`) and locked 3D rotations (`lockRotations()`).
- **Collider Shape:** Capsule (`radius: 0.35`, `halfHeight: 0.4`), total height $1.5$ units.
- **Restitution:** $0.0$ (eliminates unwanted trampoline/bouncing upon landing).
- **Ground Detection:** Downward raycast (`checkGrounded(0.85)`) originating from player origin with exclusion of sensor colliders.
- **Game Feel Mechanics:**
  - **Coyote Time ($100\text{ms}$):** Permits jumping for a short window after running off an edge.
  - **Jump Buffering ($120\text{ms}$):** Buffers the jump key press if hit right before landing.
  - **Acceleration & Air Control:** Acceleration factor $45.0$ provides responsive direction changes without sluggish floatiness.

---

## 3. Environment Colliders & Sensors

- **Solid Platforms:** Static rigid bodies with cuboid colliders (`GROUP_ENVIRONMENT`).
- **Blast Doors:** Kinematic position-based rigid bodies (`createKinematicDoor`). When closed, doors block dynamic character bodies; when activated by switches or plates, their kinematic translation is smoothly tweened upward, clearing the path.
- **Sensors & Pressure Plates:** Fixed rigid bodies configured with `.setSensor(true)`. Intersects dynamically with both player and echo colliders without applying physical displacement forces.

