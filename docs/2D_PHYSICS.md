# 2D PHYSICS & LEVEL DESIGN SPECIFICATIONS
**Project:** AFTERIMAGE – THE LAST ECHO | AN SMP ORIGINAL ("1% CHANCE. 99% FAITH.")  
**Date:** 2026-11-07  

---

## 1. Ballistic Calculations & Jump Parameters

The platforming mechanics in Level 02 (*A Second Self*) have been calculated and verified using 2D kinematic equations:

- **Movement Speed ($V_x$):** $240\text{ px/s}$
- **Jump Velocity ($V_y$):** $-450\text{ px/s}$ (upwards)
- **Gravity ($g$):** $980\text{ px/s}^2$
- **Total Airtime ($T$):**
  $$T = \frac{2 \cdot |V_y|}{g} = \frac{900}{980} \approx 0.918\text{ seconds}$$
- **Maximum Horizontal Jump Distance ($D_{max}$):**
  $$D_{max} = V_x \cdot T = 240 \cdot 0.918 \approx 220.3\text{ pixels}$$

---

## 2. Level 02 Platform Configuration & Safety Margins

| Platform | Range (X) | Width | Y | Gap to Next | Gap Percentage of $D_{max}$ | Reachability |
|---|---|---|---|---|---|---|
| **Platform 1 (Spawn)** | $0 - 340$ | $340$ | $550$ | $80\text{ px}$ | $36.3\%$ | **Easily Reachable** ($63.7\%$ safety margin) |
| **Platform 2 (Pressure Plate)**| $420 - 600$ | $180$ | $550$ | $80\text{ px}$ | $36.3\%$ | **Easily Reachable** ($63.7\%$ safety margin) |
| **Platform 3 (Gate Corridor)** | $680 - 980$ | $300$ | $550$ | — (Exit) | — | — |
| **Elevated Ledge** | $440 - 580$ | $140$ | $430$ | — | — | Vertical reach $\Delta Y = 120\text{ px}$ ($h_{peak} \approx 103\text{ px}$, ledge step) |

---

## 3. Interactive Collision Zones & Dual Occupancy

1. **Pressure Plate (`plate_gate`):**
   - Active trigger zone: $80\text{ px} \times 22\text{ px}$.
   - Occupancy evaluated each frame against both physical player sprite and active echo sprites.
   - Stepping on the plate automatically sets `isOpen = true` on `door_1`.
2. **Blast Door (`door_1`):**
   - Solid Arcade Physics body ($24 \times 120\text{ px}$) enabled while closed (`isOpen === false`).
   - Disabled dynamically upon vertical retraction to allow unobstructed player passage.
