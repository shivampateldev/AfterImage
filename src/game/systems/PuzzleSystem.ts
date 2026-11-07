import Phaser from 'phaser';
import { LevelConfig } from '../../types';
import { sound } from '../../services/audio/AudioService';

export interface PuzzleDoor {
  id: string;
  frameSprite: Phaser.GameObjects.Sprite;
  slabSprite: Phaser.Physics.Arcade.Sprite;
  initialX: number;
  initialY: number;
  openOffset: { x: number; y: number };
  isOpen: boolean;
  reqPlateIds: string[];
  reqSwitchIds: string[];
}

export interface PuzzlePlate {
  id: string;
  sprite: Phaser.GameObjects.Sprite;
  zone: Phaser.GameObjects.Zone;
  isPressed: boolean;
  targetDoorId?: string;
  targetBridgeId?: string;
}

export interface PuzzleSwitch {
  id: string;
  sprite: Phaser.GameObjects.Sprite;
  zone: Phaser.GameObjects.Zone;
  type: 'toggle' | 'timed';
  durationSeconds: number;
  timerRemaining: number;
  isActive: boolean;
  targetDoorId?: string;
}

export class PuzzleSystem {
  private scene: Phaser.Scene;
  private plates: Map<string, PuzzlePlate> = new Map();
  private switches: Map<string, PuzzleSwitch> = new Map();
  private doors: Map<string, PuzzleDoor> = new Map();

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  public initialize(config: LevelConfig): void {
    this.cleanup();

    // 1. Setup Industrial Blast Doors
    for (const d of config.doors) {
      const openOffset = d.openOffset || { x: 0, y: -120 };

      // Outer Reinforced Frame
      const frameSprite = this.scene.add.sprite(d.x + d.width / 2, d.y + d.height / 2, 'gate_frame');
      frameSprite.setDisplaySize(d.width + 36, d.height + 20);
      frameSprite.setDepth(15);

      // Solid Armored Sliding Slab (with physical collider)
      const slabSprite = this.scene.physics.add.sprite(d.x + d.width / 2, d.y + d.height / 2, 'door_slab');
      slabSprite.setDisplaySize(d.width + 4, d.height);
      slabSprite.setDepth(12);

      const slabBody = slabSprite.body as Phaser.Physics.Arcade.Body;
      slabBody.setImmovable(true);
      slabBody.setAllowGravity(false);

      this.doors.set(d.id, {
        id: d.id,
        frameSprite,
        slabSprite,
        initialX: slabSprite.x,
        initialY: slabSprite.y,
        openOffset,
        isOpen: false,
        reqPlateIds: [],
        reqSwitchIds: [],
      });
    }

    // 2. Setup Pressure Plates
    for (const p of config.pressurePlates) {
      const plateSprite = this.scene.add.sprite(p.x + p.width / 2, p.y + p.height / 2, 'plate_inactive');
      plateSprite.setDisplaySize(p.width, p.height);
      plateSprite.setDepth(10);

      const zone = this.scene.add.zone(p.x + p.width / 2, p.y + p.height / 2, p.width, p.height + 10);
      this.scene.physics.add.existing(zone, true);

      this.plates.set(p.id, {
        id: p.id,
        sprite: plateSprite,
        zone,
        isPressed: false,
        targetDoorId: p.targetDoorId,
        targetBridgeId: p.targetBridgeId,
      });

      if (p.targetDoorId && this.doors.has(p.targetDoorId)) {
        this.doors.get(p.targetDoorId)!.reqPlateIds.push(p.id);
      }
    }

    // 3. Setup Wall Switch Consoles
    for (const sw of config.switches) {
      const switchSprite = this.scene.add.sprite(sw.x, sw.y, 'switch_off');
      switchSprite.setDisplaySize(28, 40);
      switchSprite.setDepth(10);

      const zone = this.scene.add.zone(sw.x, sw.y, 44, 50);
      this.scene.physics.add.existing(zone, true);

      this.switches.set(sw.id, {
        id: sw.id,
        sprite: switchSprite,
        zone,
        type: sw.type,
        durationSeconds: sw.durationSeconds || 5,
        timerRemaining: 0,
        isActive: false,
        targetDoorId: sw.targetDoorId,
      });

      if (sw.targetDoorId && this.doors.has(sw.targetDoorId)) {
        this.doors.get(sw.targetDoorId)!.reqSwitchIds.push(sw.id);
      }
    }
  }

  public checkCollisions(
    playerSprite: Phaser.Physics.Arcade.Sprite,
    echoSprites: Phaser.Physics.Arcade.Sprite[],
    deltaSeconds: number
  ): void {
    // 1. Automatic Pressure Plate Occupancy
    for (const [, plate] of this.plates) {
      let isOccupied = false;

      // Check player overlap
      if (this.scene.physics.overlap(playerSprite, plate.zone)) {
        isOccupied = true;
      }

      // Check temporal echo overlap
      for (const echo of echoSprites) {
        if (echo && echo.active && this.scene.physics.overlap(echo, plate.zone)) {
          isOccupied = true;
          break;
        }
      }

      if (isOccupied !== plate.isPressed) {
        plate.isPressed = isOccupied;
        plate.sprite.setTexture(isOccupied ? 'plate_active' : 'plate_inactive');
        if (isOccupied) sound.playSwitch();
      }
    }

    // 2. Timed Switches countdown
    for (const [, sw] of this.switches) {
      if (sw.type === 'timed' && sw.isActive) {
        sw.timerRemaining -= deltaSeconds;
        if (sw.timerRemaining <= 0) {
          sw.isActive = false;
          sw.sprite.setTexture('switch_off');
          sound.playSwitch();
        }
      }
    }

    // 3. Sliding Blast Door Updates
    for (const [, door] of this.doors) {
      let shouldOpen = true;

      for (const plateId of door.reqPlateIds) {
        if (!this.plates.get(plateId)?.isPressed) {
          shouldOpen = false;
          break;
        }
      }

      for (const swId of door.reqSwitchIds) {
        if (!this.switches.get(swId)?.isActive) {
          shouldOpen = false;
          break;
        }
      }

      if (shouldOpen !== door.isOpen) {
        door.isOpen = shouldOpen;
        sound.playDoorOpen();
      }

      // Smooth vertical sliding translation
      const targetY = door.isOpen ? door.initialY + door.openOffset.y : door.initialY;
      const currentY = door.slabSprite.y;
      const newY = currentY + (targetY - currentY) * 0.18;
      door.slabSprite.setY(newY);

      // Disable physics collider body when door is raised open
      (door.slabSprite.body as Phaser.Physics.Arcade.Body).enable = !door.isOpen;
    }
  }

  public handleInteraction(actorSprite: Phaser.Physics.Arcade.Sprite): boolean {
    for (const [, sw] of this.switches) {
      if (this.scene.physics.overlap(actorSprite, sw.zone)) {
        if (sw.type === 'toggle') {
          sw.isActive = !sw.isActive;
        } else {
          sw.isActive = true;
          sw.timerRemaining = sw.durationSeconds;
        }

        sw.sprite.setTexture(sw.isActive ? 'switch_on' : 'switch_off');
        sound.playSwitch();
        return true;
      }
    }
    return false;
  }

  public getDoorsGroup(): Phaser.Physics.Arcade.Sprite[] {
    return Array.from(this.doors.values()).map(d => d.slabSprite);
  }

  public cleanup(): void {
    this.doors.forEach(d => {
      d.frameSprite.destroy();
      d.slabSprite.destroy();
    });
    this.doors.clear();

    this.plates.forEach(p => {
      p.sprite.destroy();
      p.zone.destroy();
    });
    this.plates.clear();

    this.switches.forEach(s => {
      s.sprite.destroy();
      s.zone.destroy();
    });
    this.switches.clear();
  }
}
