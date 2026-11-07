# BOTANICAL TREE ASSET RECONSTRUCTION
**Project:** AFTERIMAGE – THE LAST ECHO | AN SMP ORIGINAL ("1% CHANCE. 99% FAITH.")  
**Date:** 2026-11-07  
**Status:** **REPLACED & VALIDATED (ZERO SPHERES)**  

---

## 1. Problem Post-Mortem: Why Previous Trees Failed
The previous tree models were built from stacked, low-poly `DodecahedronGeometry` and `SphereGeometry` primitives (radii $2.8\text{m}$ to $4.0\text{m}$). This produced giant, dark polygonal blobs resembling floating spheres rather than natural vegetation reclaiming concrete facility foundations.

---

## 2. Botanical Organic Architecture Implemented

The tree creation pipeline was rebuilt across [NatureAssetFactory.ts](file:///e:/shivam-personal/AFTERIMAGE%20–%20The%20Last%20Echo/src/game/graphics/NatureAssetFactory.ts) and [scripts/generate-game-assets.cjs](file:///e:/shivam-personal/AFTERIMAGE%20–%20The%20Last%20Echo/scripts/generate-game-assets.cjs):

1. **Catmull-Rom Spline Trunks:**
   - Instead of static cylinders, the trunk is generated from a 5-point Catmull-Rom 3D spline with natural tapering, organic curvature, and radial bark segments.
2. **Root Flare & Buttresses:**
   - 5 independent curved root buttresses flare outwards from the trunk base at varying angles ($2.2\text{m}$ spread) establishing ground contact with concrete foundations.
3. **Multi-tier Branching Hierarchy:**
   - 5 branch tiers emerge along the trunk height at distinct vertical elevations ($45\%$, $58\%$, $72\%$, $84\%$, $94\%$).
   - Each branch tapers outward with its own secondary spline curve and angle.
4. **Instanced Foliage Cards (Non-Spherical Silhouette):**
   - Completely eliminated spherical geometry.
   - Replaced by angled, double-sided translucent foliage card planes (`0.85m \times 0.65m`) clustered at branch tips.
   - Alpha-tested and double-sided with natural verdant chlorophyll tones (`0x4f7d3a`).

---

## 3. Asset Specifications

- **File Path:** `public/assets/nature/tree_ancient.glb`
- **File Size:** $132.1\text{ KB}$ (Binary GLB)
- **Geometry Type:** Tube splines + crossed planar foliage card quads
- **Material Properties:**
  - Bark: `color: 0x544336`, `roughness: 0.88`, `metalness: 0.04` with procedural tree bark normal displacement.
  - Leaves: `color: 0x4f7d3a`, `roughness: 0.62`, `side: THREE.DoubleSide`, `alphaTest: 0.15`.
- **Runtime Validation:** Verified in real Chrome browser (`02_main_environment.png`, `03_jumping_and_locomotion.png`).
