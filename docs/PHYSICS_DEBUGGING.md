# PHYSICS SYSTEM & RUNTIME DEBUGGING GUIDE
**Project:** AFTERIMAGE – THE LAST ECHO | AN SMP ORIGINAL  
**Engine:** Rapier 3D WebAssembly Physics (`@dimforge/rapier3d-compat` v0.21.0)  

---

## 1. Physics Architecture & Invariants

AFTERIMAGE utilizes 3D WebAssembly Rapier physics constrained to a strict 2.5D side-scrolling plane:

- **Gameplay Plane Constraint:** The player, platforms, doors, and sensors operate at $Z = 0.0$.
- **Physics Step Invariant:** On every step, `playerBody.translation().z` is clamped strictly to $0.0$, and linear velocity along $Z$ is zeroed.
- **Fixed Sub-stepping:** The simulation steps at a fixed delta time ($\Delta t = 1/60 \approx 0.0166\text{s}$) using an accumulator to prevent tunneling and frame-rate-dependent physics anomalies.
- **Continuous Collision Detection (CCD):** Active on the player rigid body to prevent falling through moving platforms or thin walls at high velocities.

---

## 2. Collider Specifications & Offsets

| Entity | Rapier Body Type | Collider Shape | Dimensions | Collision Group |
|---|---|---|---|---|
| **Player** | Dynamic (Rotations locked) | Capsule | Half-height: $0.4\text{m}$, Radius: $0.35\text{m}$ (Total height $1.5\text{m}$) | `GROUP_PLAYER` |
| **Ground / Platform** | Fixed | Cuboid | Half-extents: $(w/2, h/2, 2.0)$ | `GROUP_ENVIRONMENT` |
| **Bulkhead Door** | KinematicPositionBased | Cuboid | Half-extents: $(w/2, h/2, 1.0)$ | `GROUP_ENVIRONMENT` |
| **Pressure Plate Sensor** | Fixed | Cuboid (Sensor: true) | Half-extents: $(w/2, 0.15, 1.0)$ | `GROUP_SENSOR` |
| **Switch Terminal** | Fixed | Cuboid (Sensor: true) | Interaction bounds: $1.4\text{m} \times 1.6\text{m} \times 2.0\text{m}$ | `GROUP_SENSOR` |
| **Hazard Laser** | Fixed | Cuboid (Sensor: true) | Half-extents: $(w/2, h/2, 1.0)$ | `GROUP_SENSOR` |

### Character Alignment Formula
The visual character mesh root is anchored at the character's feet.  
Since the Rapier capsule collider center is at $Y_{center}$, and the capsule reaches from $Y_{center} - 0.75$ to $Y_{center} + 0.75$, the visual mesh is aligned by:
```typescript
mesh.position.set(pos.x, pos.y - 0.75, 0.0);
```
Ground contact raycasting originates from `pos.x, pos.y, 0` and casts downwards with distance $0.85\text{m}$, ensuring precise detection with a $0.1\text{m}$ margin for ramps and steps.

---

## 3. Runtime Physics Debugger

A development-only visual physics debugger is embedded in `Three25DScene`.

### Activation Controls
- **Key: `F1`** or **Backquote (`~` / `\``)**: Toggles physics debug wireframes on/off in real-time.
- **Debug Overlays Shown:**
  1. **Player Capsule Wireframe:** Cyan cylinder/spheres representing player collision boundary.
  2. **Platform Colliders:** Solid green wireframes for walkable platforms.
  3. **Door Colliders:** Yellow/orange wireframes for kinematic blocking doors.
  4. **Sensor Zones:** Magenta wireframes for pressure plates and switch interaction trigger zones.
  5. **Ground Detection Ray:** Red vertical line from player center showing current raycast trajectory and ground hit point.

---

## 4. Troubleshooting Common Physics Issues

1. **Player sticks to walls when jumping:**
   - Capsule collider has low friction ($0.15$) and restitution ($0.0$).
2. **Player falls through floor on low FPS:**
   - Fixed timestep sub-stepping guarantees consistent physics steps regardless of browser render frame rate.
   - CCD prevents capsule tunneling.
3. **Player jumps when slightly in air:**
   - Coyote time buffer ($0.1\text{s}$) allows responsive jumping right after walking off a platform ledge.
   - Jump buffer ($0.12\text{s}$) buffers the jump command right before hitting the ground.

