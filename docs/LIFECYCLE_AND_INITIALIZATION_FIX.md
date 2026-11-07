# CRITICAL REMEDIATION: INITIALIZATION & LIFECYCLE FIX REPORT
**Project:** AFTERIMAGE – THE LAST ECHO | AN SMP ORIGINAL  
**Date:** November 07, 2026  
**Subject:** Resolution of Rapier WASM Async Initialization, Strict Mode Lifecycle, and Shadow Map API

---

## 1. Root Cause Analysis

### Error 1: `Cannot read properties of undefined (reading 'resetWorld')`
- **Location:** `Three25DScene.ts:210` via `Game25DCanvas.tsx:55`
- **Root Cause:** In the initial implementation, `Three25DScene` invoked an asynchronous `initAsync()` from inside its constructor without returning a promise or blocking caller access. React's subsequent effect hooks (`useEffect` with `[currentLevelId]`) immediately invoked `sceneRef.current.loadLevel(cfg)`. Because `Rapier.init()` was still downloading/instantiating the WebAssembly binary, `this.physics` remained `undefined`. Attempting to access `this.physics.resetWorld()` triggered an uncaught TypeError.

### Error 2: `Cannot read properties of undefined (reading 'dispose')`
- **Location:** `Three25DScene.ts:779` via `Game25DCanvas.tsx:46`
- **Root Cause:** In React 18 development Strict Mode, components mount, immediately unmount, and remount. The unmount cleanup function ran `sceneRef.current.destroy()`. Because the asynchronous initialization was still pending, `this.renderer` had not yet been created, triggering an uncaught TypeError on `this.renderer.dispose()`.

### Warning 3: `THREE.WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead.`
- **Location:** `Three25DScene.ts:141`
- **Root Cause:** In modern Three.js (v0.187.0), `PCFSoftShadowMap` was deprecated and replaced with `THREE.PCFShadowMap`.

---

## 2. Code Changes & Architecture Remediation

1. **RapierPhysicsWorld Factory & WASM Synchronization ([`src/game/physics/RapierPhysicsWorld.ts`](file:///e:/shivam-personal/AFTERIMAGE%20–%20The%20Last%20Echo/src/game/physics/RapierPhysicsWorld.ts))**:
   - Implemented `RapierPhysicsWorld.createWorld()` factory with an internal `ensureWasm()` lock.
   - Guarded WASM initialization so concurrent calls await the same promise without duplicating instances.
   - Added safe `destroy()` and `free()` methods for clean teardown.

2. **Finite State Lifecycle Machine ([`src/game/engine/Three25DScene.ts`](file:///e:/shivam-personal/AFTERIMAGE%20–%20The%20Last%20Echo/src/game/engine/Three25DScene.ts))**:
   - Introduced explicit lifecycle states: `'new' | 'initializing' | 'ready' | 'destroying' | 'destroyed'`.
   - Constructor no longer fires asynchronous detached promises. The scene exposes an explicit `async init(): Promise<boolean>`.
   - `loadLevel()` safely guards against calls prior to `this.physics` and `this.scene` readiness.
   - `destroy()` is completely idempotent and safe against partially initialized states. If destroyed while awaiting WASM, it cancels gracefully without spawning zombie animation loops or leaking WebGL contexts.
   - Updated shadow map to `THREE.PCFShadowMap`.

3. **React Strict Mode & Cancellation Guards ([`src/components/game/Game25DCanvas.tsx`](file:///e:/shivam-personal/AFTERIMAGE%20–%20The%20Last%20Echo/src/components/game/Game25DCanvas.tsx))**:
   - Added cancellation tracking (`isCancelled`) to ensure that if Strict Mode unmounts the component before WASM loads, the pending scene is safely discarded and destroyed.
   - Added user-facing fallback alert if initialization ever encounters fatal GPU/WASM hurdles.
   - Guarded all event handlers (`TRIGGER_RECORD`, `TRIGGER_REPLAY`, `TRIGGER_RESTART`, `SET_CURRENT_LEVEL`) with `scene.getState() === 'ready'`.

---

## 3. Test Verification

```text
$ pnpm test

 RUN  v2.1.9 E:/shivam-personal/AFTERIMAGE – The Last Echo

 ✓ tests/unit/game.test.ts (9 tests) 14ms
 ✓ tests/unit/lifecycle.test.ts (5 tests) 57ms
   ✓ Three25DScene Lifecycle & React Strict Mode Tolerance > initializes with state "new"
   ✓ Three25DScene Lifecycle & React Strict Mode Tolerance > can destroy before init completes without throw
   ✓ Three25DScene Lifecycle & React Strict Mode Tolerance > idempotent destroy call does not throw
   ✓ Three25DScene Lifecycle & React Strict Mode Tolerance > loadLevel before init completes is safely guarded and does not crash
   ✓ Three25DScene Lifecycle & React Strict Mode Tolerance > RapierPhysicsWorld createWorld and resetWorld execute safely
 ✓ tests/unit/physics.test.ts (6 tests) 184ms

 Test Files  3 passed (3)
      Tests  20 passed (20)
   Duration  1.87s
```

