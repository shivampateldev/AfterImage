# CROSS-PLATFORM DISTRIBUTION ARCHITECTURE & PACKAGING GUIDE
**Project:** AFTERIMAGE – THE LAST ECHO  
**Brand Identity:** AN SMP ORIGINAL  
**Target Platforms:** Web (PWA), Windows Desktop, Android  

---

## 1. Single Authoritative Codebase Strategy

AFTERIMAGE utilizes a unified frontend and rendering core across all target platforms:
- **Core Engine:** React 18 + Three.js 2.5D + TypeScript + Tailwind CSS.
- **Platform Layer:** [`src/platform/PlatformBridge.ts`](file:///e:/shivam-personal/AFTERIMAGE%20–%20The%20Last%20Echo/src/platform/PlatformBridge.ts) dynamically identifies runtime environment capabilities (`isElectron`, `isCapacitor`, `isWeb`, `hasTouch`) and handles fullscreen requests and app termination cleanly without platform leaks.

---

## 2. Web Build & Deployment

### Production Command:
```bash
pnpm build
```
### Artifacts:
Outputs fully optimized, tree-shaken static assets to `dist/`:
- `dist/index.html`
- `dist/assets/*.js`
- `dist/assets/*.css`
- `dist/assets/branding/`
- `dist/favicon.svg`

### Local Preview:
```bash
pnpm preview
```

---

## 3. Windows Desktop Distribution (Electron / Tauri)

To bundle AFTERIMAGE into a native Windows executable (`.exe`) installer or portable binary:

### Electron Packaging Configuration:
1. Initialize desktop wrapper:
   ```bash
   pnpm add -D electron electron-builder
   ```
2. Build command:
   ```bash
   pnpm build
   pnpm exec electron-builder --win nsis
   ```
3. Target output:
   - `dist/win-unpacked/AFTERIMAGE.exe`
   - `dist/AFTERIMAGE Setup 1.2.0.exe`

---

## 4. Android Distribution (Capacitor)

To compile an Android APK or release AAB:

### Prerequisites:
- Android Studio & Android SDK (API 33+)
- Java JDK 17+

### Setup & Build Steps:
1. Add Capacitor Android dependencies:
   ```bash
   pnpm add @capacitor/core @capacitor/android
   pnpm add -D @capacitor/cli
   ```
2. Initialize project configuration:
   ```bash
   pnpm exec cap init "AFTERIMAGE - The Last Echo" "com.smp.afterimage" --web-dir dist
   ```
3. Add Android platform:
   ```bash
   pnpm build
   pnpm exec cap add android
   ```
4. Build APK in Android Studio or CLI:
   ```bash
   pnpm exec cap copy android
   cd android && ./gradlew assembleDebug
   ```
5. Output APK location:
   `android/app/build/outputs/apk/debug/app-debug.apk`

---

## 5. Persistence Portability & Security

- Saves are structured through `StorageService` using versioned JSON schemas (`afterimage_player_stats_v1` and `afterimage_game_settings_v1`).
- Graceful fallbacks prevent crashes in sandboxed web views, offline modes, or mobile storage environments.

