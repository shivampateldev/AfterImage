# AUDIT: PHYSICS SIMULATION AND VISUAL RENDERING DEFICIENCIES
**Project:** AFTERIMAGE – THE LAST ECHO | AN SMP ORIGINAL  
**Audit Date:** November 07, 2026  
**Subject:** Investigation of Primitive Geometry, Manual Kinematics, Collision Artifacts, and Visual Deficiencies

---

## 1. Actual Problems Discovered

### A. Physics Engine Deficiency: Pseudo-Physics with Manual Coordinate Increments
In `src/game/engine/Three25DScene.ts`:
1. **No Genuine Physics Engine:** There is no rigid-body physics world (such as Rapier 3D / Cannon / PhysX). The simulation relies on manual coordinate arithmetic (`playerPos.x += playerVelocity.x * dt`, `playerPos.y += playerVelocity.y * dt`).
2. **Defective Collision & Tunneling:**
   - Collision detection is implemented via simplistic axis checks:
     ```ts
     for (const p of this.platformBoxes) {
       if (newX + playerHalfW > p.box.min.x && newX - playerHalfW < p.box.max.x) {
         if (this.playerPos.y >= p.box.max.y - 0.2 && resolvedY <= p.box.max.y) {
           resolvedY = p.box.max.y;
           this.playerVelocity.y = 0;
           this.isGrounded = true;
         }
       }
     }
     ```
   - **Tunneling & Dropping:** If the player's downward velocity is high (`resolvedY` drops below `p.box.max.y - 0.2` in a single delta tick), the collision condition fails, and the player falls straight through solid platforms into the abyss.
   - **No Side / Ceiling Collision:** Platforms only test top-surface landings. If the player jumps into the side of a platform or hits their head on an elevated ledge, there is no horizontal or upward normal impulse; the player clips directly through.
3. **Fragile Ground Detection:** Ground state (`isGrounded`) is a single boolean set during the landing loop. There is no contact normal evaluation, raycasting, coyote time, jump buffering, or slope resolution.
4. **No Dynamic Moving Platform Physics:** If a platform moves, there is no friction or velocity transfer to dynamic bodies standing atop it.
5. **Echo Pseudo-Interaction:** Echoes are played back purely as visual transforms. Their sensor interaction is checked by calculating AABB intersections on every frame rather than proper collision masks and physical trigger zones.

---

### B. Visual Rendering Deficiencies: Primitive Box Grids & Empty Dark Voids
1. **Primitive Geometry:**
   - The player character is composed of crude unarticulated box primitives (`new THREE.BoxGeometry(...)`) stacked on top of each other.
   - Platforms are plain extruded blocks (`BoxGeometry(w, h, d)`) without edge bevels, trim sheets, metallic paneling, caution stripes, or structural supports.
   - The environment background is an empty plane with primitive untextured cylinders acting as "pillars", leaving the world looking like a dark void with floating boxes.
2. **Lighting & Contrast Collapse:**
   - Scene relies on a single directional light and a harsh point light against pitch black background (`#07090e`).
   - Lack of environmental ambient occlusion, floor reflections, industrial props, conduits, modular laboratory bulkheads, ceiling gantries, and control consoles.
3. **Camera Disconnect:**
   - Camera simply tracks player X linearly without depth layering, framing zones, or contextual pan angles, making platforms look like disconnected floating rafts.

---

## 2. Root Cause Summary

| Symptom | Root Cause | Impact |
|---|---|---|
| Falling through platforms | Manual coordinate delta without continuous collision detection (CCD) or swept capsule queries | Game-breaking; player falls into void unexpectedly |
| Boxy, primitive visual appearance | Scene built with untextured Three.js default primitive meshes instead of detailed modular 3D architectural models | Looks like an unstyled prototype |
| Unresponsive jump / sticky movement | No jump buffer, no coyote time, hard instantaneous velocity resets | Clunky platformer game feel |
| Overly dark, empty scene | Unlit backgrounds, lack of volumetric ambient fill, absence of laboratory environment geometry | Extreme eye strain; level objectives unclear |

---

## 3. Remediation Architecture & Action Plan

1. **Install and Integrate Genuine Rapier 3D Physics (`@dimforge/rapier3d-compat`)**:
   - Initialize deterministic Rapier 3D physics world with fixed 60Hz timestep (`world.step()`).
   - Dynamic RigidBody with Capsule Collider for the player with locked Z-translation and locked rotations ($X, Y, Z$) to guarantee planar 2.5D side-scrolling kinematics.
   - Fixed RigidBodies with Trimesh/Cuboid colliders for all static and moving platforms, doors, and pressure plates.
   - Kinematic/Sensor colliders for echoes and triggers to prevent physical displacement of the player while ensuring reliable sensor triggering.
   - Implement Coyote time (100ms) and Jump buffering (120ms) for responsive movement.
2. **Replace Primitive Blocks with Rich Architectural Modular 3D Meshes**:
   - Construct detailed sci-fi laboratory modular environments: industrial wall panels with conduit grooves, support beams, floor grates with metallic trim, control terminals, glass containment tubes, hydraulic door frames, and glowing energy coils.
   - Build a detailed humanoid robotic suit character with proper limbs, joints, helmet visor, chest reactor, and running/jumping animation blend.
3. **Upgrade Materials & Lighting**:
   - Implement PBR materials with realistic roughness, metalness, normal perturbation, and emissive circuitry.
   - Balanced three-point lighting: broad laboratory fill, directional key light with contact shadows, and dramatic rim highlights.
4. **Comprehensive Automated & Real Gameplay Testing**:
   - Vitest automated physics simulation tests.
   - Full 20-step browser gameplay verification.

