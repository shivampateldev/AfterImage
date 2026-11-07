import Phaser from 'phaser';
import { LevelConfig } from '../../types';
import { gameEvents, EVENTS } from '../events/GameEventBus';
import { sound } from '../../services/audio/AudioService';

export interface PuzzleDoor {
  id: string;
  sprite: Phaser.Physics.Arcade.Sprite;
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

    // 1. Setup Doors
    for (const d of config.doors) {
      const openOffset = d.openOffset || { x: 0, y: -120 };
      const doorSprite = this.scene.physics.add.sprite(d.x + d.width / 2, d.y + d.height / 2, 'door_texture');
      doorSprite.setDisplaySize(d.width, d.height);
      (doorSprite.body as Phaser.Physics.Arcade.Body).setImmovable(true);
      (doorSprite.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);

      this.doors.set(d.id, {
        id: d.id,
        sprite: doorSprite,
        initialX: doorSprite.x,
        initialY: doorSprite.y,
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

      const zone = this.scene.add.zone(p.x + p.width / 2, p.y + p.height / 2, p.width, p.height + 8);
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

    // 3. Setup Switches
    for (const sw of config.switches) {
      const switchSprite = this.scene.add.sprite(sw.x, sw.y, 'switch_off');
      const zone = this.scene.add.zone(sw.x, sw.y, 32, 40);
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
    // 1. Pressure Plates Check
    for (const [, plate] of this.plates) {
      let isOccupied = false;

      // Check player overlap
      if (this.scene.physics.overlap(playerSprite, plate.zone)) {
        isOccupied = true;
      }

      // Check echoes overlap
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
        gameEvents.emit(EVENTS.PLATE_TRIGGERED, { plateId: plate.id, isPressed: isOccupied });
      }
    }

    // 2. Timed switches countdown
    for (const [, sw] of this.switches) {
      if (sw.type === 'timed' && sw.isActive) {
        sw.timerRemaining -= deltaSeconds;
        if (sw.timerRemaining <= 0) {
          sw.isActive = false;
          sw.timerRemaining = 0;
          sw.sprite.setTexture('switch_off');
          sound.playSwitch();
          gameEvents.emit(EVENTS.SWITCH_TOGGLED, { switchId: sw.id, isActive: false });
        }
      }
    }

    // 3. Resolve Door States
    for (const [, door] of this.doors) {
      let shouldOpen = true;

      // Must have all required plates pressed
      for (const plateId of door.reqPlateIds) {
        const plate = this.plates.get(plateId);
        if (!plate || !plate.isPressed) {
          shouldOpen = false;
          break;
        }
      }

      // Must have all required switches active
      for (const switchId of door.reqSwitchIds) {
        const sw = this.switches.get(switchId);
        if (!sw || !sw.isActive) {
          shouldOpen = false;
          break;
        }
      }

      // If door has neither requirement, remain as configured
      if (door.reqPlateIds.length === 0 && door.reqSwitchIds.length === 0) {
        shouldOpen = door.isOpen;
      }

      if (shouldOpen !== door.isOpen) {
        this.setDoorState(door, shouldOpen);
      }
    }
  }

  public tryInteractSwitch(interactor: Phaser.GameObjects.GameObject): boolean {
    for (const [, sw] of this.switches) {
      if (this.scene.physics.overlap(interactor, sw.zone)) {
        if (sw.type === 'toggle') {
          sw.isActive = !sw.isActive;
        } else if (sw.type === 'timed') {
          sw.isActive = true;
          sw.timerRemaining = sw.durationSeconds;
        }
        sw.sprite.setTexture(sw.isActive ? 'switch_on' : 'switch_off');
        sound.playSwitch();
        gameEvents.emit(EVENTS.SWITCH_TOGGLED, { switchId: sw.id, isActive: sw.isActive });
        return true;
      }
    }
    return false;
  }

  private setDoorState(door: PuzzleDoor, open: boolean): void {
    door.isOpen = open;
    sound.playDoorOpen();

    const targetX = open ? door.initialX + door.openOffset.x : door.initialX;
    const targetY = open ? door.initialY + door.openOffset.y : door.initialY;

    this.scene.tweens.add({
      targets: door.sprite,
      x: targetX,
      y: targetY,
      duration: 350,
      ease: 'Power2',
      onComplete: () => {
        // Toggle solid collision body based on open state
        (door.sprite.body as Phaser.Physics.Arcade.Body).enable = !open;
      }
    });

    if (open) {
      (door.sprite.body as Phaser.Physics.Arcade.Body).enable = false;
    }

    gameEvents.emit(EVENTS.DOOR_STATE_CHANGED, { doorId: door.id, isOpen: open });
  }

  public getDoorSprites(): Phaser.Physics.Arcade.Sprite[] {
    return Array.from(this.doors.values()).map(d => d.sprite);
  }

  public cleanup(): void {
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

    this.doors.forEach(d => {
      d.sprite.destroy();
    });
    this.doors.clear();
  }
}
