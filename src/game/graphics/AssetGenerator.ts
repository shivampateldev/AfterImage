import Phaser from 'phaser';

export class AssetGenerator {
  public static generateProceduralTextures(scene: Phaser.Scene): void {
    // 1. Player Sprite Texture (32x48)
    if (!scene.textures.exists('player_idle')) {
      const g = scene.make.graphics({ x: 0, y: 0 });
      // Body (Suit)
      g.fillStyle(0x0d1e38, 1);
      g.fillRoundedRect(6, 12, 20, 32, 4);
      // Chest reactor / core
      g.fillStyle(0x00f3ff, 1);
      g.fillCircle(16, 22, 4);
      // Temporal shoulders
      g.fillStyle(0x00a8ff, 1);
      g.fillRect(4, 14, 5, 8);
      g.fillRect(23, 14, 5, 8);
      // Visor / Helmet
      g.fillStyle(0x1a2b4c, 1);
      g.fillRoundedRect(8, 2, 16, 14, 3);
      g.fillStyle(0x00f3ff, 0.95);
      g.fillRect(10, 5, 12, 5);
      // Legs
      g.fillStyle(0x081020, 1);
      g.fillRect(8, 38, 6, 10);
      g.fillRect(18, 38, 6, 10);

      g.generateTexture('player_idle', 32, 48);
      g.destroy();
    }

    // 2. Echo Ghost Texture (Translucent Cyan/Purple temporal clone)
    if (!scene.textures.exists('echo_ghost')) {
      const g = scene.make.graphics({ x: 0, y: 0 });
      // Translucent ethereal body
      g.fillStyle(0xb347ff, 0.45);
      g.fillRoundedRect(6, 12, 20, 32, 4);
      g.lineStyle(2, 0x00f3ff, 0.9);
      g.strokeRoundedRect(6, 12, 20, 32, 4);
      // Temporal Core
      g.fillStyle(0xffffff, 0.9);
      g.fillCircle(16, 22, 4);
      // Visor
      g.fillStyle(0xb347ff, 0.7);
      g.fillRoundedRect(8, 2, 16, 14, 3);
      g.lineStyle(1.5, 0x00f3ff, 1);
      g.strokeRoundedRect(8, 2, 16, 14, 3);
      g.fillStyle(0x00f3ff, 0.85);
      g.fillRect(10, 5, 12, 5);
      // Temporal trail particles
      g.fillStyle(0x00f3ff, 0.4);
      g.fillCircle(8, 44, 3);
      g.fillCircle(24, 44, 3);

      g.generateTexture('echo_ghost', 32, 48);
      g.destroy();
    }

    // 3. Facility Solid Platform Tile (32x32)
    if (!scene.textures.exists('facility_tile')) {
      const g = scene.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0x101726, 1);
      g.fillRect(0, 0, 32, 32);
      g.lineStyle(1, 0x1f2e4d, 1);
      g.strokeRect(0, 0, 32, 32);
      // Top tech rail highlight
      g.fillStyle(0x00f3ff, 0.7);
      g.fillRect(0, 0, 32, 2);
      // Inner circuitry pattern
      g.lineStyle(1, 0x0066ff, 0.3);
      g.moveTo(4, 16);
      g.lineTo(28, 16);
      g.strokePath();

      g.generateTexture('facility_tile', 32, 32);
      g.destroy();
    }

    // 4. Pressure Plate (40x12)
    if (!scene.textures.exists('plate_inactive')) {
      const g = scene.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0x1a233a, 1);
      g.fillRoundedRect(0, 4, 40, 8, 2);
      g.fillStyle(0x556688, 1);
      g.fillRect(4, 0, 32, 4);
      g.generateTexture('plate_inactive', 40, 12);
      g.destroy();
    }

    if (!scene.textures.exists('plate_active')) {
      const g = scene.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0x00f3ff, 1);
      g.fillRoundedRect(0, 6, 40, 6, 2);
      g.fillStyle(0xffffff, 0.9);
      g.fillRect(4, 4, 32, 3);
      g.generateTexture('plate_active', 40, 12);
      g.destroy();
    }

    // 5. Switch Console (24x36)
    if (!scene.textures.exists('switch_off')) {
      const g = scene.make.graphics({ x: 0, y: 0 });
      // Base pedestal
      g.fillStyle(0x162035, 1);
      g.fillRect(6, 12, 12, 24);
      // Terminal head
      g.fillStyle(0x223355, 1);
      g.fillRoundedRect(2, 0, 20, 14, 2);
      // Red LED
      g.fillStyle(0xff2255, 1);
      g.fillCircle(12, 7, 3);
      g.generateTexture('switch_off', 24, 36);
      g.destroy();
    }

    if (!scene.textures.exists('switch_on')) {
      const g = scene.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0x162035, 1);
      g.fillRect(6, 12, 12, 24);
      g.fillStyle(0x005577, 1);
      g.fillRoundedRect(2, 0, 20, 14, 2);
      // Cyan glowing LED
      g.fillStyle(0x00f3ff, 1);
      g.fillCircle(12, 7, 4);
      g.generateTexture('switch_on', 24, 36);
      g.destroy();
    }

    // 6. Security Door (24x120)
    if (!scene.textures.exists('door_texture')) {
      const g = scene.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0x0b1320, 1);
      g.fillRect(0, 0, 24, 120);
      g.lineStyle(2, 0x00f3ff, 0.8);
      g.strokeRect(1, 1, 22, 118);
      // Energy containment grids
      for (let y = 15; y < 110; y += 20) {
        g.fillStyle(0x00a8ff, 0.6);
        g.fillRect(4, y, 16, 4);
      }
      g.generateTexture('door_texture', 24, 120);
      g.destroy();
    }

    // 7. Hazard Laser (32x16)
    if (!scene.textures.exists('hazard_laser')) {
      const g = scene.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0xff0055, 0.85);
      g.fillRect(0, 4, 32, 8);
      g.fillStyle(0xffffff, 0.95);
      g.fillRect(0, 6, 32, 4);
      g.generateTexture('hazard_laser', 32, 16);
      g.destroy();
    }

    // 8. Exit Portal / Terminal (40x60)
    if (!scene.textures.exists('exit_portal')) {
      const g = scene.make.graphics({ x: 0, y: 0 });
      // Arch frame
      g.fillStyle(0x162238, 1);
      g.fillRoundedRect(0, 0, 40, 60, 6);
      // Portal vortex interior
      g.fillStyle(0x00f3ff, 0.7);
      g.fillEllipse(20, 30, 14, 24);
      g.fillStyle(0xffffff, 0.9);
      g.fillEllipse(20, 30, 6, 14);
      g.generateTexture('exit_portal', 40, 60);
      g.destroy();
    }
  }
}

