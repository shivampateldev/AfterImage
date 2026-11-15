# AFTERIMAGE: THE LAST ECHO — Official Game Website & Distribution

> **"Your past self becomes your greatest teammate."**  
> An official **SMP** original production.

Official static web distribution and showcase portal for **AFTERIMAGE: THE LAST ECHO**, featuring game details, campaign sector walk-throughs, technical architecture, and direct Android release APK downloads with cryptographic signature verification.

---

## 🎮 About the Game

AFTERIMAGE: THE LAST ECHO is a 2.5D kinematic puzzle-platformer engineered in Phaser 3, React 18, and TypeScript, packaged for Android via Capacitor. Players navigate chronological anomalies by recording time loops and collaborating with physical echoes of their past actions.

- **15 Handcrafted Campaign Sectors + Sector 0 (Sarthi Academy)**
- **Deterministic 2.5D Physics & Recording System**
- **Sarthi Interactive Temporal Guidance System**
- **Permanent Production Release Keystore (SMP Original, Mumbai)**

---

## 🌐 Website Structure

The `website/` directory contains the complete standalone responsive portal:

```
website/
├── index.html                 # Complete responsive single-page game site
├── assets/
│   ├── branding/
│   │   ├── afterimage-cover.png   # Official 1:1 cover artwork (1254x1254)
│   │   ├── game-cover.png         # Game showcase artwork
│   │   ├── smp-logo.png           # Metallic gold SMP brand crest
│   │   └── app-icon.png           # Android launcher badge
│   └── screenshots/
│       ├── gameplay-1.png         # Sector 01 locomotion & hazard grid
│       ├── gameplay-2.png         # Chronological recording & echo clone
│       └── gameplay-3.png         # Magnetic pressure plate & blast door
└── downloads/
    └── AFTERIMAGE-release.apk     # Cryptographically signed release APK
```

---

## 🔒 APK Verification Details

| Attribute | Verified Value |
|---|---|
| **Package ID** | `com.smp.afterimage` |
| **Version** | `1.2.0` (Version Code `10200`) |
| **File Size** | `37,883,867 bytes` (36.13 MB) |
| **APK SHA-256** | `9DF9D796F95E47CF8E2C4D393DA649E2B3AC590B7BADB42B43A70737A8EC65C9` |
| **Signer Certificate** | `CN=SMP Original, OU=Games, O=SMP Original, L=Mumbai, ST=Maharashtra, C=IN` |
| **Signer SHA-256** | `0d5e7f7541a0ecdc6115b4b6ec6b668aa287c978b1432fa7db135ccd32f86588` |
| **Signature Scheme** | Android APK Signature Scheme v2 |

---

## ☁️ Cloudflare Pages Deployment

Deploying the website to Cloudflare Pages:

### Method 1: Git Integration (Recommended)
1. In Cloudflare Dashboard, go to **Compute (Workers) > Pages**.
2. Click **Connect to Git** and select repository `shivampateldev/AfterImage`.
3. Set build configuration:
   - **Framework preset:** `None`
   - **Build command:** *(leave blank)*
   - **Build output directory:** `website`
4. Click **Save and Deploy**.

### Method 2: Direct Upload via Wrangler CLI
```bash
npx wrangler pages deploy website --project-name=afterimage
```

---

## 📄 License & Attribution

© 2026 **SMP**. All Rights Reserved.  
*"1% CHANCE. 99% FAITH."*
