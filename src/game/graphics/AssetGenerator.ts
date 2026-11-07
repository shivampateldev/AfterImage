import Phaser from 'phaser';

/**
 * High-Definition Pixel-Art Asset Pipeline for AFTERIMAGE – THE LAST ECHO
 * Generates crisp 2D pixel-art textures, multi-frame character sprite sheets,
 * botanical ancient trees, industrial blast doors, platforms, and environmental tiles.
 */
export class AssetGenerator {
  public static generateProceduralTextures(scene: Phaser.Scene): void {
    this.createPlayerSpriteSheet(scene);
    this.createEchoGhostSpriteSheet(scene);
    this.createBotanicalTreeTextures(scene);
    this.createBlastDoorTextures(scene);
    this.createSwitchAndPlateTextures(scene);
    this.createIndustrialTiles(scene);
    this.createParallaxBackgrounds(scene);
    this.createVFXTextures(scene);
  }

  /**
   * 1. Multi-Frame Animated Pixel-Art Explorer Character
   * Frames: Idle (4 frames), Run (6 frames), Jump (2 frames)
   * Style: Cyberpunk/Research suit in slate-navy with SMP Gold Pauldrons and Cyan Visor.
   */
  private static createPlayerSpriteSheet(scene: Phaser.Scene): void {
    if (scene.textures.exists('player_sheet')) return;

    // Sprite dimensions: 32x48 per frame, 12 frames total => 384x48 texture
    const frameW = 32;
    const frameH = 48;
    const totalFrames = 12;
    const canvas = document.createElement('canvas');
    canvas.width = frameW * totalFrames;
    canvas.height = frameH;
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;

    for (let f = 0; f < totalFrames; f++) {
      const ox = f * frameW;
      const isRunning = f >= 4 && f < 10;
      const isJumping = f >= 10;
      const bobY = isRunning ? (f % 2 === 0 ? 0 : 2) : 0;
      const legSpread = isRunning ? Math.sin((f - 4) * Math.PI / 3) * 6 : 0;

      // Hips / Pelvis
      ctx.fillStyle = '#1c2838';
      ctx.fillRect(ox + 10, 24 + bobY, 12, 8);

      // Legs / Boots
      if (isJumping) {
        // Tucked jump legs
        ctx.fillStyle = '#0f1722';
        ctx.fillRect(ox + 8, 32 + bobY, 6, 8);
        ctx.fillRect(ox + 18, 30 + bobY, 6, 8);
        ctx.fillStyle = '#263445';
        ctx.fillRect(ox + 6, 38 + bobY, 8, 4);
        ctx.fillRect(ox + 18, 36 + bobY, 8, 4);
      } else {
        // Walking/Idle legs
        ctx.fillStyle = '#0f1722';
        ctx.fillRect(ox + 10 - legSpread, 32 + bobY, 5, 10);
        ctx.fillRect(ox + 17 + legSpread, 32 + bobY, 5, 10);
        ctx.fillStyle = '#263445'; // Boots
        ctx.fillRect(ox + 9 - legSpread, 42 + bobY, 7, 4);
        ctx.fillRect(ox + 16 + legSpread, 42 + bobY, 7, 4);
      }

      // Torso / Exploration Jacket
      ctx.fillStyle = '#2c3b4e';
      ctx.fillRect(ox + 8, 14 + bobY, 16, 12);
      ctx.fillStyle = '#1a2533';
      ctx.fillRect(ox + 10, 16 + bobY, 12, 10);

      // SMP Gold Chest Badge & Pauldrons (Recognizable brand identity)
      ctx.fillStyle = '#d4a52c';
      ctx.fillRect(ox + 14, 18 + bobY, 4, 4); // Chest reactor frame
      ctx.fillStyle = '#38d9ff';
      ctx.fillRect(ox + 15, 19 + bobY, 2, 2); // Glowing core

      // Shoulders / SMP Pauldrons
      ctx.fillStyle = '#d4a52c';
      ctx.fillRect(ox + 6, 14 + bobY, 4, 4);
      ctx.fillRect(ox + 22, 14 + bobY, 4, 4);

      // Arms
      ctx.fillStyle = '#2c3b4e';
      ctx.fillRect(ox + 6, 18 + bobY, 4, 8);
      ctx.fillRect(ox + 22, 18 + bobY, 4, 8);

      // Head / Helmet
      ctx.fillStyle = '#1e2b3c';
      ctx.fillRect(ox + 10, 4 + bobY, 12, 10);
      ctx.fillStyle = '#111822';
      ctx.fillRect(ox + 11, 3 + bobY, 10, 2); // Crest

      // Cyan Visor Glow
      ctx.fillStyle = '#38d9ff';
      ctx.fillRect(ox + 14, 7 + bobY, 8, 3);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(ox + 18, 7 + bobY, 2, 2); // Highlight
    }

    scene.textures.addSpriteSheet('player_sheet', canvas as unknown as HTMLImageElement, {
      frameWidth: frameW,
      frameHeight: frameH,
    });

    // Register Sprite Animations
    if (!scene.anims.exists('player_idle_anim')) {
      scene.anims.create({
        key: 'player_idle_anim',
        frames: scene.anims.generateFrameNumbers('player_sheet', { start: 0, end: 3 }),
        frameRate: 6,
        repeat: -1,
      });
      scene.anims.create({
        key: 'player_run_anim',
        frames: scene.anims.generateFrameNumbers('player_sheet', { start: 4, end: 9 }),
        frameRate: 12,
        repeat: -1,
      });
      scene.anims.create({
        key: 'player_jump_anim',
        frames: scene.anims.generateFrameNumbers('player_sheet', { start: 10, end: 11 }),
        frameRate: 6,
        repeat: 0,
      });
    }
  }

  /**
   * 2. Spectral Echo Ghost Sprite Sheet
   * Translucent chromatic aberration with violet/cyan aura.
   */
  private static createEchoGhostSpriteSheet(scene: Phaser.Scene): void {
    if (scene.textures.exists('echo_sheet')) return;

    const frameW = 32;
    const frameH = 48;
    const totalFrames = 12;
    const canvas = document.createElement('canvas');
    canvas.width = frameW * totalFrames;
    canvas.height = frameH;
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;

    for (let f = 0; f < totalFrames; f++) {
      const ox = f * frameW;
      const isRunning = f >= 4 && f < 10;
      const bobY = isRunning ? (f % 2 === 0 ? 0 : 2) : 0;
      const legSpread = isRunning ? Math.sin((f - 4) * Math.PI / 3) * 6 : 0;

      // Translucent purple/violet body with glowing cyan contours
      ctx.fillStyle = 'rgba(155, 89, 255, 0.45)';
      ctx.fillRect(ox + 8, 12 + bobY, 16, 20);
      ctx.fillRect(ox + 10, 4 + bobY, 12, 10);

      // Cyan Spectral Rim
      ctx.strokeStyle = '#38d9ff';
      ctx.lineWidth = 1;
      ctx.strokeRect(ox + 8.5, 12.5 + bobY, 15, 19);
      ctx.strokeRect(ox + 10.5, 4.5 + bobY, 11, 9);

      // Visor Glow
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(ox + 14, 7 + bobY, 8, 3);

      // Legs
      ctx.fillStyle = 'rgba(56, 217, 255, 0.5)';
      ctx.fillRect(ox + 10 - legSpread, 32 + bobY, 5, 12);
      ctx.fillRect(ox + 17 + legSpread, 32 + bobY, 5, 12);
    }

    scene.textures.addSpriteSheet('echo_sheet', canvas as unknown as HTMLImageElement, {
      frameWidth: frameW,
      frameHeight: frameH,
    });

    if (!scene.anims.exists('echo_idle_anim')) {
      scene.anims.create({
        key: 'echo_idle_anim',
        frames: scene.anims.generateFrameNumbers('echo_sheet', { start: 0, end: 3 }),
        frameRate: 6,
        repeat: -1,
      });
      scene.anims.create({
        key: 'echo_run_anim',
        frames: scene.anims.generateFrameNumbers('echo_sheet', { start: 4, end: 9 }),
        frameRate: 12,
        repeat: -1,
      });
    }
  }

  /**
   * 3. Botanical Pixel-Art Trees & Foliage (ZERO SPHERES)
   * High-detail gnarly bark trunks with natural branching and clustered leaf pixels.
   */
  private static createBotanicalTreeTextures(scene: Phaser.Scene): void {
    if (scene.textures.exists('pixel_tree_ancient')) return;

    // Tree dimensions: 160x280 pixel art canvas
    const canvas = document.createElement('canvas');
    canvas.width = 160;
    canvas.height = 280;
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;

    // A. Root Flaring & Ground contact
    ctx.fillStyle = '#3a2d22';
    ctx.fillRect(60, 260, 40, 20);
    ctx.fillRect(40, 270, 30, 10);
    ctx.fillRect(90, 270, 35, 10);
    ctx.fillStyle = '#524032';
    ctx.fillRect(50, 265, 15, 8);
    ctx.fillRect(95, 265, 18, 8);

    // B. Gnarly Curved Trunk
    const trunkSegments = [
      { y: 260, x1: 65, w: 30 },
      { y: 220, x1: 68, w: 26 },
      { y: 180, x1: 64, w: 22 },
      { y: 140, x1: 66, w: 18 },
      { y: 100, x1: 70, w: 16 },
      { y: 60, x1: 72, w: 14 },
    ];

    for (let i = 0; i < trunkSegments.length - 1; i++) {
      const s0 = trunkSegments[i];
      const s1 = trunkSegments[i + 1];
      ctx.fillStyle = '#3e3025';
      ctx.beginPath();
      ctx.moveTo(s0.x1, s0.y);
      ctx.lineTo(s0.x1 + s0.w, s0.y);
      ctx.lineTo(s1.x1 + s1.w, s1.y);
      ctx.lineTo(s1.x1, s1.y);
      ctx.fill();

      // Bark Highlights
      ctx.fillStyle = '#5c4839';
      ctx.fillRect(s0.x1 + 4, s1.y + 10, 4, 25);
      ctx.fillRect(s0.x1 + s0.w - 8, s1.y + 15, 3, 20);
    }

    // C. Branches Tapering Outwards
    const branches = [
      { x1: 68, y1: 170, x2: 25, y2: 130, w: 7 },
      { x1: 85, y1: 150, x2: 135, y2: 110, w: 8 },
      { x1: 70, y1: 120, x2: 35, y2: 80, w: 6 },
      { x1: 82, y1: 95, x2: 125, y2: 55, w: 6 },
    ];

    ctx.strokeStyle = '#3e3025';
    branches.forEach(b => {
      ctx.lineWidth = b.w;
      ctx.beginPath();
      ctx.moveTo(b.x1, b.y1);
      ctx.quadraticCurveTo((b.x1 + b.x2) / 2, b.y1 + 10, b.x2, b.y2);
      ctx.stroke();
    });

    // D. Organic Clustered Leaf Masses (Angular pixel patches, NOT circles!)
    const leafClusters = [
      { x: 10, y: 90, w: 55, h: 45 },
      { x: 105, y: 75, w: 50, h: 45 },
      { x: 25, y: 50, w: 50, h: 40 },
      { x: 95, y: 35, w: 55, h: 45 },
      { x: 50, y: 15, w: 65, h: 50 },
    ];

    leafClusters.forEach(c => {
      // Dark under-leaves
      ctx.fillStyle = '#22381f';
      ctx.fillRect(c.x, c.y + 8, c.w, c.h - 8);
      ctx.fillRect(c.x + 4, c.y, c.w - 8, c.h);

      // Mid-tone verdant green
      ctx.fillStyle = '#3a6133';
      ctx.fillRect(c.x + 3, c.y + 3, c.w - 6, c.h - 10);
      ctx.fillRect(c.x + 8, c.y - 2, c.w - 16, c.h - 8);

      // Highlight leaves with sunlight
      ctx.fillStyle = '#5c8c50';
      ctx.fillRect(c.x + 6, c.y + 2, Math.floor(c.w * 0.5), 8);
      ctx.fillRect(c.x + 12, c.y + 8, Math.floor(c.w * 0.4), 6);
      ctx.fillStyle = '#8ab87b';
      ctx.fillRect(c.x + 10, c.y + 4, 8, 4);
    });

    scene.textures.addCanvas('pixel_tree_ancient', canvas);
  }

  /**
   * 4. Industrial Security Blast Gate & Door Panels
   * Heavy reinforced bulkhead door, guide rails, and hydraulic pistons.
   */
  private static createBlastDoorTextures(scene: Phaser.Scene): void {
    // A. Door Frame / Gateway Archway (64x140)
    if (!scene.textures.exists('gate_frame')) {
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 140;
      const ctx = canvas.getContext('2d')!;
      ctx.imageSmoothingEnabled = false;

      // Concrete / Steel Piers
      ctx.fillStyle = '#2d3a4c';
      ctx.fillRect(0, 0, 16, 140);
      ctx.fillRect(48, 0, 16, 140);

      // Steel Lintel housing at top
      ctx.fillStyle = '#1e2634';
      ctx.fillRect(0, 0, 64, 24);
      ctx.fillStyle = '#3f4f66';
      ctx.fillRect(2, 2, 60, 4);

      // Vertical guide tracks
      ctx.fillStyle = '#151d29';
      ctx.fillRect(16, 24, 4, 116);
      ctx.fillRect(44, 24, 4, 116);

      // Hazard Warning Chevrons on frame
      for (let y = 30; y < 130; y += 20) {
        ctx.fillStyle = '#d4a52c';
        ctx.fillRect(2, y, 12, 6);
        ctx.fillRect(50, y, 12, 6);
      }

      scene.textures.addCanvas('gate_frame', canvas);
    }

    // B. Solid Armored Sliding Blast Door Slab (28x120)
    if (!scene.textures.exists('door_slab')) {
      const canvas = document.createElement('canvas');
      canvas.width = 28;
      canvas.height = 120;
      const ctx = canvas.getContext('2d')!;
      ctx.imageSmoothingEnabled = false;

      // Dark reinforced armor slab
      ctx.fillStyle = '#1a222e';
      ctx.fillRect(0, 0, 28, 120);

      // Heavy horizontal armor ribs (3 prominent bands)
      const ribs = [15, 55, 95];
      ribs.forEach(ry => {
        ctx.fillStyle = '#2e3d52';
        ctx.fillRect(2, ry, 24, 12);
        ctx.fillStyle = '#4a5d78';
        ctx.fillRect(3, ry + 1, 22, 2);
        // Rivets
        ctx.fillStyle = '#0a0f16';
        ctx.fillRect(4, ry + 5, 2, 2);
        ctx.fillRect(22, ry + 5, 2, 2);
      });

      // Cyan magnetic seal line
      ctx.fillStyle = '#38d9ff';
      ctx.fillRect(3, 58, 22, 4);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(10, 59, 8, 2);

      // Status indicator light
      ctx.fillStyle = '#d4a52c';
      ctx.fillRect(12, 25, 4, 4);

      scene.textures.addCanvas('door_slab', canvas);
    }
  }

  /**
   * 5. Interactive Pressure Plate & Wall Switch Console
   */
  private static createSwitchAndPlateTextures(scene: Phaser.Scene): void {
    // Inactive Plate (48x12)
    if (!scene.textures.exists('plate_inactive')) {
      const canvas = document.createElement('canvas');
      canvas.width = 48;
      canvas.height = 12;
      const ctx = canvas.getContext('2d')!;
      ctx.imageSmoothingEnabled = false;

      // Heavy metal beveled base
      ctx.fillStyle = '#222c3c';
      ctx.fillRect(0, 4, 48, 8);
      ctx.fillStyle = '#38465c';
      ctx.fillRect(2, 4, 44, 2);

      // Elevated pad
      ctx.fillStyle = '#d4a52c'; // SMP Gold indicator
      ctx.fillRect(6, 1, 36, 4);
      ctx.fillStyle = '#fff0ba';
      ctx.fillRect(8, 2, 32, 1);

      scene.textures.addCanvas('plate_inactive', canvas);
    }

    // Active Depressed Plate (48x12)
    if (!scene.textures.exists('plate_active')) {
      const canvas = document.createElement('canvas');
      canvas.width = 48;
      canvas.height = 12;
      const ctx = canvas.getContext('2d')!;
      ctx.imageSmoothingEnabled = false;

      // Depressed base with cyan glow
      ctx.fillStyle = '#222c3c';
      ctx.fillRect(0, 5, 48, 7);

      // Flush glowing pad
      ctx.fillStyle = '#38d9ff';
      ctx.fillRect(6, 4, 36, 3);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(10, 4, 28, 2);

      scene.textures.addCanvas('plate_active', canvas);
    }

    // Wall Switch Console (24x36) - Neat wall-mounted box
    if (!scene.textures.exists('switch_off')) {
      const canvas = document.createElement('canvas');
      canvas.width = 24;
      canvas.height = 36;
      const ctx = canvas.getContext('2d')!;
      ctx.imageSmoothingEnabled = false;

      // Wall bracket
      ctx.fillStyle = '#1c2432';
      ctx.fillRect(2, 6, 20, 26);
      ctx.fillStyle = '#2e3b50';
      ctx.fillRect(4, 8, 16, 22);

      // Terminal screen
      ctx.fillStyle = '#0f1722';
      ctx.fillRect(6, 10, 12, 10);
      ctx.fillStyle = '#d4a52c';
      ctx.fillRect(10, 13, 4, 4); // Amber standby light

      // Wire conduit
      ctx.fillStyle = '#111822';
      ctx.fillRect(11, 32, 2, 4);

      scene.textures.addCanvas('switch_off', canvas);
    }

    if (!scene.textures.exists('switch_on')) {
      const canvas = document.createElement('canvas');
      canvas.width = 24;
      canvas.height = 36;
      const ctx = canvas.getContext('2d')!;
      ctx.imageSmoothingEnabled = false;

      ctx.fillStyle = '#1c2432';
      ctx.fillRect(2, 6, 20, 26);
      ctx.fillStyle = '#2e3b50';
      ctx.fillRect(4, 8, 16, 22);

      // Glowing active cyan screen
      ctx.fillStyle = '#38d9ff';
      ctx.fillRect(6, 10, 12, 10);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(8, 12, 8, 4);

      ctx.fillStyle = '#111822';
      ctx.fillRect(11, 32, 2, 4);

      scene.textures.addCanvas('switch_on', canvas);
    }
  }

  /**
   * 6. High-Detail Industrial & Concrete Platform Tiles (32x32)
   */
  private static createIndustrialTiles(scene: Phaser.Scene): void {
    if (!scene.textures.exists('facility_tile')) {
      const canvas = document.createElement('canvas');
      canvas.width = 32;
      canvas.height = 32;
      const ctx = canvas.getContext('2d')!;
      ctx.imageSmoothingEnabled = false;

      // Weathered concrete slab
      ctx.fillStyle = '#2b3646';
      ctx.fillRect(0, 0, 32, 32);

      // Top steel curb edging
      ctx.fillStyle = '#45556c';
      ctx.fillRect(0, 0, 32, 3);
      ctx.fillStyle = '#5c708e';
      ctx.fillRect(0, 0, 32, 1);

      // Moss stains & seams
      ctx.fillStyle = '#202a37';
      ctx.fillRect(0, 31, 32, 1);
      ctx.fillRect(31, 0, 1, 32);
      ctx.fillStyle = '#324a2e'; // Organic moss patches
      ctx.fillRect(6, 4, 8, 3);
      ctx.fillRect(18, 5, 10, 2);

      scene.textures.addCanvas('facility_tile', canvas);
    }
  }

  /**
   * 7. Multi-Layer Parallax Backgrounds (480x270 internal canvas)
   */
  private static createParallaxBackgrounds(scene: Phaser.Scene): void {
    // Parallax Layer 1: Distant Sky & Mountains (480x270)
    if (!scene.textures.exists('bg_sky_mountains')) {
      const canvas = document.createElement('canvas');
      canvas.width = 480;
      canvas.height = 270;
      const ctx = canvas.getContext('2d')!;

      // Atmospheric twilight gradient
      const grad = ctx.createLinearGradient(0, 0, 0, 270);
      grad.addColorStop(0, '#0c1322');
      grad.addColorStop(0.6, '#182438');
      grad.addColorStop(1, '#25354e');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 480, 270);

      // Distant mountain ridge silhouettes
      ctx.fillStyle = '#101a28';
      ctx.beginPath();
      ctx.moveTo(0, 270);
      ctx.lineTo(0, 160);
      ctx.lineTo(80, 120);
      ctx.lineTo(160, 150);
      ctx.lineTo(260, 100);
      ctx.lineTo(360, 140);
      ctx.lineTo(440, 115);
      ctx.lineTo(480, 135);
      ctx.lineTo(480, 270);
      ctx.fill();

      scene.textures.addCanvas('bg_sky_mountains', canvas);
    }

    // Parallax Layer 2: Midground Facility Architecture (480x270)
    if (!scene.textures.exists('bg_facility_wall')) {
      const canvas = document.createElement('canvas');
      canvas.width = 480;
      canvas.height = 270;
      const ctx = canvas.getContext('2d')!;
      ctx.imageSmoothingEnabled = false;

      // Transparent backdrop with industrial gantry silhouette
      ctx.fillStyle = 'rgba(21, 31, 46, 0.75)';
      ctx.fillRect(0, 0, 480, 270);

      // Observation Bay Windows
      for (let x = 40; x < 460; x += 120) {
        ctx.fillStyle = '#0e1622';
        ctx.fillRect(x, 60, 60, 36);
        ctx.fillStyle = '#22384d';
        ctx.fillRect(x + 2, 62, 56, 32);
        // Faint backlit glow
        ctx.fillStyle = 'rgba(56, 217, 255, 0.15)';
        ctx.fillRect(x + 4, 64, 52, 28);
      }

      // Vertical Support Pillars
      for (let x = 10; x < 480; x += 80) {
        ctx.fillStyle = '#151e2b';
        ctx.fillRect(x, 0, 14, 270);
        ctx.fillStyle = '#243245';
        ctx.fillRect(x + 2, 0, 4, 270);
      }

      scene.textures.addCanvas('bg_facility_wall', canvas);
    }
  }

  /**
   * 8. Particle VFX & Exit Gateway Textures
   */
  private static createVFXTextures(scene: Phaser.Scene): void {
    if (!scene.textures.exists('exit_portal')) {
      const canvas = document.createElement('canvas');
      canvas.width = 48;
      canvas.height = 72;
      const ctx = canvas.getContext('2d')!;
      ctx.imageSmoothingEnabled = false;

      // Gateway Frame
      ctx.fillStyle = '#1e2838';
      ctx.fillRect(0, 0, 48, 72);
      ctx.fillStyle = '#38d9ff';
      ctx.fillRect(2, 2, 44, 68);

      // Swirling portal vortex
      const portalGrad = ctx.createRadialGradient(24, 36, 4, 24, 36, 22);
      portalGrad.addColorStop(0, '#ffffff');
      portalGrad.addColorStop(0.4, '#38d9ff');
      portalGrad.addColorStop(1, '#0c1322');
      ctx.fillStyle = portalGrad;
      ctx.fillRect(4, 4, 40, 64);

      scene.textures.addCanvas('exit_portal', canvas);
    }
  }
}
