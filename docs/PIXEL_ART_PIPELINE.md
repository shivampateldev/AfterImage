# 2D PIXEL-ART PIPELINE & ASSET SPECIFICATIONS
**Project:** AFTERIMAGE – THE LAST ECHO | AN SMP ORIGINAL ("1% CHANCE. 99% FAITH.")  
**Engine:** Phaser 3.90.0 (2D Pixel-Art Mode) + Arcade Physics  
**Internal Resolution:** $960 \times 600$ (Native $480 \times 270$ base geometry scaled with integer pixel scaling)  
**Date:** 2026-11-07  

---

## 1. Pixel-Art Architecture Overview
AFTERIMAGE has been fully migrated to a genuine 2D pixel-art pipeline using Phaser 3:
- **Renderer:** WebGL with `pixelArt: true`, `antialias: false`, and `roundPixels: true` for zero texture blurring on 1080p and 1440p displays.
- **Physics:** Phaser Arcade Physics configured with a fixed gravitational constant ($980\text{ px/s}^2$), sub-frame collision detection, coyote time ($0.1\text{s}$), and jump buffering ($0.12\text{s}$).
- **Parallax System:** Multi-tier background planes (`bg_sky_mountains` at $0.05\times$, `bg_facility_wall` at $0.15\times$).

---

## 2. Sprite Sheets & Texture Manifest

### 1. Animated Explorer Player (`player_sheet`)
- **Dimensions:** $384 \times 48\text{ px}$ (12 frames, $32 \times 48\text{ px}$ each).
- **Animations:**
  - `player_idle_anim` (Frames 0–3, 6 FPS loop): Subtle breathing bob and glowing cyan visor highlight.
  - `player_run_anim` (Frames 4–9, 12 FPS loop): Articulated 6-frame run cycle with leg extension, parka sway, and SMP gold pauldrons.
  - `player_jump_anim` (Frames 10–11): Tucked dynamic jump posture with boot thruster flare.

### 2. Spectral Echo Ghost (`echo_sheet`)
- **Dimensions:** $384 \times 48\text{ px}$ (12 frames, $32 \times 48\text{ px}$ each).
- **Style:** Semi-transparent chromatic aberration with violet aura (`rgba(155, 89, 255, 0.45)`), cyan rim lighting (`#38d9ff`), and sine-wave alpha pulsing.

### 3. Botanical Ancient Trees (`pixel_tree_ancient`)
- **Dimensions:** $160 \times 280\text{ px}$.
- **Zero Spherical Blobs:** Built from curved organic trunk splines, 5 flared root buttresses, multi-tier tapered branches, and irregular angular foliage leaf clusters with highlight shading (`#22381f`, `#3a6133`, `#5c8c50`, `#8ab87b`).

### 4. Security Blast Gate System (`gate_frame` & `door_slab`)
- **Gate Frame:** $64 \times 140\text{ px}$ reinforced steel/concrete piers with yellow/black hazard chevrons and vertical guide tracks.
- **Sliding Slab:** $28 \times 120\text{ px}$ armored dark alloy with horizontal reinforcing ribs, cyan magnetic seal bar, and amber status beacon. Smoothly slides vertically when unlocked.

### 5. Interactive Components
- **Pressure Plate (`plate_inactive` & `plate_active`):** $48 \times 12\text{ px}$ beveled metal base. Flushes with floor and glows cyan when occupied by player or echo.
- **Wall Console (`switch_off` & `switch_on`):** $24 \times 36\text{ px}$ wall-mounted bracket with conduit wiring and illuminated terminal screen.
- **Terrain Tiles (`facility_tile`):** $32 \times 32\text{ px}$ weathered concrete with steel curb rails and moss stains.
