import * as THREE from 'three';
import { TextureGenerator } from './TextureGenerator';
import { NatureAssetFactory } from './NatureAssetFactory';

export class SciFiAssetFactory {
  private static matFloor: THREE.MeshStandardMaterial;
  private static matWall: THREE.MeshStandardMaterial;
  private static matTrim: THREE.MeshStandardMaterial;
  private static matCyanEmissive: THREE.MeshStandardMaterial;
  private static matVioletEmissive: THREE.MeshStandardMaterial;
  private static matGoldEmissive: THREE.MeshStandardMaterial;
  private static matMetalDark: THREE.MeshStandardMaterial;
  private static matGlass: THREE.MeshPhysicalMaterial;

  public static initMaterials(): void {
    if (this.matFloor) return;

    const hasDoc = typeof document !== 'undefined';

    // 1. Weathered Concrete Floor with Natural Moss & Water Stains
    this.matFloor = new THREE.MeshStandardMaterial({
      color: 0x5a697c,
      roughness: 0.68,
      metalness: 0.1,
      map: hasDoc ? TextureGenerator.getAgedConcrete() : null,
    });

    // 2. Industrial Wall Panels with Architectural Grime & Seams
    this.matWall = new THREE.MeshStandardMaterial({
      color: 0x425064,
      roughness: 0.72,
      metalness: 0.15,
      map: hasDoc ? TextureGenerator.getAgedConcrete() : null,
    });

    // 3. Heavy Corroded Steel Beams & Structural Framing
    this.matTrim = new THREE.MeshStandardMaterial({
      color: 0x5f6e82,
      roughness: 0.48,
      metalness: 0.75,
      map: hasDoc ? TextureGenerator.getCorrodedSteel() : null,
    });

    // 4. Dark Weathered Alloy
    this.matMetalDark = new THREE.MeshStandardMaterial({
      color: 0x2c3746,
      roughness: 0.52,
      metalness: 0.85,
      map: hasDoc ? TextureGenerator.getCorrodedSteel() : null,
    });

    // 5. Restrained Atmospheric Cyan Circuitry
    this.matCyanEmissive = new THREE.MeshStandardMaterial({
      color: 0x2cd5f5,
      emissive: 0x2cd5f5,
      emissiveIntensity: 0.9,
      roughness: 0.2,
    });

    // 6. Spectral Echo Violet
    this.matVioletEmissive = new THREE.MeshStandardMaterial({
      color: 0x8b66fa,
      emissive: 0x8b66fa,
      emissiveIntensity: 0.8,
      roughness: 0.3,
    });

    // 7. SMP Gold Accents
    this.matGoldEmissive = new THREE.MeshStandardMaterial({
      color: 0xd4a52c,
      emissive: 0xd4a52c,
      emissiveIntensity: 0.8,
      roughness: 0.35,
      metalness: 0.8,
    });

    // 8. Observation Window Glass
    this.matGlass = new THREE.MeshPhysicalMaterial({
      color: 0x8eb4d0,
      transmission: 0.7,
      opacity: 0.85,
      transparent: true,
      roughness: 0.2,
      ior: 1.5,
    });
  }

  /**
   * Builds an overgrown, weathered industrial concrete platform reclaimed by moss,
   * with structural support columns underneath extending downward.
   */
  public static createIndustrialPlatform(width: number, height: number, depth: number = 4.0): THREE.Group {
    this.initMaterials();
    const group = new THREE.Group();

    // 1. Main Weathered Concrete Slab
    const slabGeom = new THREE.BoxGeometry(width, height, depth);
    const mainMesh = new THREE.Mesh(slabGeom, this.matFloor);
    mainMesh.castShadow = true;
    mainMesh.receiveShadow = true;
    group.add(mainMesh);

    // 2. Weathered Industrial Steel Curb Rails
    const curbGeom = new THREE.BoxGeometry(width, 0.1, 0.2);
    const curbFront = new THREE.Mesh(curbGeom, this.matTrim);
    curbFront.position.set(0, height / 2 + 0.05, depth / 2 - 0.15);
    const curbBack = new THREE.Mesh(curbGeom, this.matTrim);
    curbBack.position.set(0, height / 2 + 0.05, -depth / 2 + 0.15);
    group.add(curbFront, curbBack);

    // 3. Structural Concrete Support Columns Extending to Foundation
    const columnCount = Math.max(1, Math.floor(width / 3.5));
    for (let i = 0; i < columnCount; i++) {
      const xPos = -width / 2 + (width / (columnCount + 1)) * (i + 1);
      const col = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 4.5, 0.8),
        this.matWall
      );
      col.position.set(xPos, -height / 2 - 2.25, -0.2);
      col.castShadow = true;
      group.add(col);
    }

    // 4. Overgrowth Vines draping along the support pillars
    if (width >= 2.5) {
      const vine = NatureAssetFactory.createHangingVines(2.0);
      vine.position.set(-width * 0.25, -height / 2, -0.4);
      group.add(vine);
    }

    return group;
  }

  /**
   * Architectural Research Bulkhead Wall with observation windows, cable channels,
   * maintenance hatches, and recessed structural buttresses.
   */
  public static createArchitecturalWall(roomWidth: number = 75, roomHeight: number = 30): THREE.Group {
    this.initMaterials();
    const wallGroup = new THREE.Group();

    // 1. Main Continuous Architectural Concrete Wall
    const wallGeom = new THREE.PlaneGeometry(roomWidth, roomHeight);
    const backWall = new THREE.Mesh(wallGeom, this.matWall);
    backWall.position.set(0, roomHeight / 2 - 2, -7.0);
    backWall.receiveShadow = true;
    wallGroup.add(backWall);

    // 2. Recessed Concrete Foundation Dado (Lower Wall Wainscot)
    const dadoGeom = new THREE.BoxGeometry(roomWidth + 2, 3.5, 0.4);
    const dado = new THREE.Mesh(dadoGeom, this.matTrim);
    dado.position.set(0, 0, -6.8);
    dado.receiveShadow = true;
    wallGroup.add(dado);

    // 3. Observation Glass Windows & Lab Recesses
    const windowIntervals = [-22, -8, 8, 22];
    windowIntervals.forEach((wx) => {
      // Recessed Bay Frame
      const bayFrame = new THREE.Mesh(new THREE.BoxGeometry(5.0, 3.2, 0.4), this.matMetalDark);
      bayFrame.position.set(wx, 8.5, -6.8);

      const glassPane = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 2.6), this.matGlass);
      glassPane.position.set(wx, 8.5, -6.6);

      // Backlit laboratory interior glow behind window
      const interiorBack = new THREE.Mesh(
        new THREE.PlaneGeometry(4.6, 2.8),
        new THREE.MeshStandardMaterial({
          color: 0x1d2e3d,
          emissive: 0x1d3d52,
          emissiveIntensity: 0.6,
        })
      );
      interiorBack.position.set(wx, 8.5, -7.1);

      wallGroup.add(bayFrame, glassPane, interiorBack);
    });

    // 4. Structural Overhead Gantry Columns & Heavy Heavy I-Beam Lintels
    for (let x = -roomWidth / 2 + 5; x <= roomWidth / 2 - 5; x += 11) {
      const colGroup = new THREE.Group();
      colGroup.position.set(x, 0, -5.2);

      // Concrete Buttress Column
      const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.7, roomHeight, 1.0), this.matTrim);
      pillar.position.set(0, roomHeight / 2 - 2, 0);
      pillar.castShadow = true;
      pillar.receiveShadow = true;

      // Industrial Conduit Runs (Twin high-voltage cables)
      const conduit1 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, roomHeight, 8), this.matMetalDark);
      conduit1.position.set(0.45, roomHeight / 2 - 2, 0.2);

      const conduit2 = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, roomHeight, 8), this.matMetalDark);
      conduit2.position.set(0.45, roomHeight / 2 - 2, 0.4);

      colGroup.add(pillar, conduit1, conduit2);
      wallGroup.add(colGroup);
    }

    return wallGroup;
  }

  /**
   * Articulated Mechanical Blast Door with heavy steel bulkhead frames,
   * hydraulic pistons, warning stripes, and sliding lock teeth.
   */
  public static createMechanicalDoor(width: number, height: number, depth: number = 2.0): {
    doorGroup: THREE.Group;
    slidingSlab: THREE.Mesh;
  } {
    this.initMaterials();
    const doorGroup = new THREE.Group();

    // Heavy Concrete & Steel Framing Arch
    const pillarGeom = new THREE.BoxGeometry(0.7, height + 1.2, depth + 0.6);
    const leftPillar = new THREE.Mesh(pillarGeom, this.matTrim);
    leftPillar.position.set(-width / 2 - 0.35, 0.2, 0);
    const rightPillar = new THREE.Mesh(pillarGeom, this.matTrim);
    rightPillar.position.set(width / 2 + 0.35, 0.2, 0);

    const topLintel = new THREE.Mesh(
      new THREE.BoxGeometry(width + 1.6, 0.8, depth + 0.6),
      this.matTrim
    );
    topLintel.position.set(0, height / 2 + 0.6, 0);
    doorGroup.add(leftPillar, rightPillar, topLintel);

    // Sliding Reinforced Bulkhead Door
    const slabGeom = new THREE.BoxGeometry(width, height, depth);
    const slidingSlab = new THREE.Mesh(slabGeom, this.matMetalDark);
    slidingSlab.castShadow = true;
    slidingSlab.receiveShadow = true;

    // Status lock indicator
    const lockBar = new THREE.Mesh(
      new THREE.BoxGeometry(width * 0.7, 0.16, depth + 0.08),
      this.matCyanEmissive
    );
    slidingSlab.add(lockBar);

    doorGroup.add(slidingSlab);
    return { doorGroup, slidingSlab };
  }
  public static createPressurePlate(width: number): {
    plateGroup: THREE.Group;
    padMesh: THREE.Mesh;
    padLight: THREE.PointLight;
  } {
    this.initMaterials();
    const plateGroup = new THREE.Group();

    const baseMesh = new THREE.Mesh(
      new THREE.BoxGeometry(width + 0.3, 0.15, 2.4),
      this.matTrim
    );
    plateGroup.add(baseMesh);

    const padMesh = new THREE.Mesh(
      new THREE.BoxGeometry(width, 0.12, 1.9),
      this.matCyanEmissive
    );
    padMesh.position.y = 0.08;
    plateGroup.add(padMesh);

    const padLight = new THREE.PointLight(0x2cd5f5, 0.9, 4.0);
    padLight.position.set(0, 0.5, 0.5);
    plateGroup.add(padLight);

    return { plateGroup, padMesh, padLight };
  }

  /**
   * Research Terminal Console
   */
  public static createSwitchTerminal(): {
    terminalGroup: THREE.Group;
    beaconMesh: THREE.Mesh;
    beaconLight: THREE.PointLight;
  } {
    this.initMaterials();
    const terminalGroup = new THREE.Group();

    const pedestal = new THREE.Mesh(
      new THREE.CylinderGeometry(0.25, 0.35, 1.1, 8),
      this.matTrim
    );
    pedestal.position.y = 0.55;

    const consoleHead = new THREE.Mesh(
      new THREE.BoxGeometry(0.7, 0.45, 0.55),
      this.matMetalDark
    );
    consoleHead.position.set(0, 1.25, 0.15);
    consoleHead.rotation.x = -Math.PI / 6;

    const beaconMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 16, 16),
      this.matGoldEmissive
    );
    beaconMesh.position.set(0, 1.52, 0.1);

    const beaconLight = new THREE.PointLight(0xd4a52c, 1.2, 4.5);
    beaconLight.position.set(0, 1.6, 0.4);

    terminalGroup.add(pedestal, consoleHead, beaconMesh, beaconLight);
    return { terminalGroup, beaconMesh, beaconLight };
  }

  /**
   * Humanoid Explorer Character
   */
  public static createHumanoidCharacter(isEcho: boolean = false): {
    characterGroup: THREE.Group;
    leftLeg: THREE.Mesh;
    rightLeg: THREE.Mesh;
    leftArm: THREE.Mesh;
    rightArm: THREE.Mesh;
  } {
    this.initMaterials();
    const characterGroup = new THREE.Group();

    const suitMat = isEcho
      ? new THREE.MeshStandardMaterial({
          color: 0x8b66fa,
          emissive: 0x38d9ff,
          emissiveIntensity: 0.8,
          transparent: true,
          opacity: 0.7,
          roughness: 0.3,
        })
      : new THREE.MeshStandardMaterial({
          color: 0x334458,
          roughness: 0.65,
          metalness: 0.25,
        });

    const armorMat = isEcho
      ? this.matVioletEmissive
      : new THREE.MeshStandardMaterial({
          color: 0xd4a52c,
          roughness: 0.35,
          metalness: 0.8,
        });

    const visorMat = isEcho ? this.matVioletEmissive : this.matCyanEmissive;

    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.82, 0.44), suitMat);
    torso.position.y = 0.95;
    torso.castShadow = !isEcho;

    const backpack = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.6, 0.22), this.matMetalDark);
    backpack.position.set(0, 0.05, -0.28);
    torso.add(backpack);

    const core = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 16), visorMat);
    core.position.set(0, 0.12, 0.24);
    torso.add(core);

    const head = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.44, 0.42), suitMat);
    head.position.y = 1.55;
    const visor = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.14, 0.16), visorMat);
    visor.position.set(0, 0.02, 0.2);
    head.add(visor);

    const armGeom = new THREE.BoxGeometry(0.18, 0.65, 0.2);
    const leftArm = new THREE.Mesh(armGeom, suitMat);
    leftArm.position.set(-0.46, 0.9, 0);
    const rightArm = new THREE.Mesh(armGeom, suitMat);
    rightArm.position.set(0.46, 0.9, 0);

    const pauldronL = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.15, 0.26), armorMat);
    pauldronL.position.set(0, 0.3, 0);
    leftArm.add(pauldronL);
    const pauldronR = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.15, 0.26), armorMat);
    pauldronR.position.set(0, 0.3, 0);
    rightArm.add(pauldronR);

    const legGeom = new THREE.BoxGeometry(0.22, 0.7, 0.26);
    const leftLeg = new THREE.Mesh(legGeom, suitMat);
    leftLeg.position.set(-0.2, 0.35, 0);
    const rightLeg = new THREE.Mesh(legGeom, suitMat);
    rightLeg.position.set(0.2, 0.35, 0);

    characterGroup.add(torso, head, leftArm, rightArm, leftLeg, rightLeg);

    return {
      characterGroup,
      leftLeg,
      rightLeg,
      leftArm,
      rightArm,
    };
  }

  /**
   * Multi-Layered Facility Environment
   */
  public static createFacilityEnvironment(roomWidth: number = 75, roomHeight: number = 30): THREE.Group {
    this.initMaterials();
    const envGroup = new THREE.Group();

    // 1. Distant Foggy Mountain Landscape (Far Background: Z = -16)
    const mountainGeom = new THREE.PlaneGeometry(roomWidth * 1.5, roomHeight * 1.2);
    const mountainMat = new THREE.MeshStandardMaterial({
      color: 0x223040,
      roughness: 0.95,
      metalness: 0.05,
    });
    const mountain = new THREE.Mesh(mountainGeom, mountainMat);
    mountain.position.set(0, roomHeight / 2 - 2, -16.0);
    envGroup.add(mountain);

    // 2. Continuous Architectural Facility Wall
    const archWall = this.createArchitecturalWall(roomWidth, roomHeight);
    envGroup.add(archWall);

    return envGroup;
  }
}
