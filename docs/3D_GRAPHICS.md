# 3D & 2.5D GRAPHICS ARCHITECTURE SPECIFICATION
**Project:** AFTERIMAGE – THE LAST ECHO  
**Brand Identity:** AN SMP ORIGINAL  
**Engine:** Three.js WebGL 2.5D Kinematic Simulation Engine  

---

## 1. 2.5D Rendering Principles

AFTERIMAGE achieves a genuine 2.5D visual aesthetic by rendering full 3D geometry, spatial lighting, dynamic shadows, and volumetric fog while constraining player movement strictly to a 2D planar subspace:

```text
                Y (Up / Jump Axis)
                ▲
                │      [3D Player & Echo Meshes]
                │      [3D Extruded Platforms & Doors]
                │
                └──────────────► X (Side-scrolling Traversal)
               /
              / 
             ▼ Z (Depth: Camera at Z = +28, Scene at Z = 0, Facility Walls at Z = -5)
```

1. **Planar Constraint:** Kinematics ($x, y, v_x, v_y$) are evaluated in the $XY$ plane at $Z = 0.0$. The player cannot accidentally slip or move along the $Z$ depth axis.
2. **Perspective Projection:** A $45^\circ$ FOV Perspective Camera is positioned at $Z = 28$, allowing platforms, background structural pillars, and lighting to exhibit natural 3D depth and parallax.
3. **Smooth Camera Lerping:** Camera horizontally tracks player locomotion with easing factor $0.08$, softening jumps and directional changes.

---

## 2. Lighting & Volumetric Atmosphere

- **Ambient Base (`0x162238`):** Deep midnight blue ambient fill providing soft shadow detail.
- **Directional Key Light (`0x38d9ff`, Intensity 1.4):** Temporal cyan key illumination with PCF soft shadow mapping.
- **Opposing Rim Light (`0x9875ff`, Intensity 1.0):** Echo violet rim lighting casting highlights on mesh silhouettes.
- **Dynamic Point Light:** Bound to player's temporal chest reactor with a soft radial falloff of 10 units, illuminating nearby switches and platforms in real time.
- **Exponential Volumetric Fog (`THREE.FogExp2(0x07090e, 0.015)`):** Blends the distant geometry seamlessly into the facility abyss.

---

## 3. Character & Echo Mesh Construction

- **Player Avatar:**
  - Torso: Modular extruded composite armor in dark navy metallic finish (`metalness: 0.8`, `roughness: 0.3`).
  - Core: Spherical cyan temporal reactor with emissive bloom.
  - Visor: Cybernetic horizontal visor emitting temporal cyan glow.
  - Limbs: Articulated dual-mesh legs responding to directional flipping (`rotation.y = 0 | Math.PI`).
- **Temporal Echo Ghost:**
  - Material: `MeshStandardMaterial` with translucent alpha blending (`opacity: 0.65`, `transparent: true`).
  - Emissive: Echo violet (`0x9875ff`) with glowing cyan undertone, leaving a spectral visual footprint during playback.

