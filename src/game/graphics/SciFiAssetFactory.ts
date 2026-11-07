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

  public static initMaterials(): void {
    if (this.matFloor) return;

    const hasDoc = typeof document !== 'undefined';

    // 1. Weathered Concrete Floor with Natural Moss & Water Stains
    this.matFloor = new THREE.MeshStandardMaterial({
      color: 0x3a4656,
      roughness: 0.75,
      metalness: 0.15,
      map: hasDoc ? TextureGenerator.getAgedConcrete() : null,
    });

    // 2. Industrial Wall Panels with Architectural Grime
    this.matWall = new THREE.MeshStandardMaterial({
      color: 0x222c3a,
      roughness: 0.8,
      metalness: 0.25,
      map: hasDoc ? TextureGenerator.getAgedConcrete() : null,
    });

    // 3. Heavy Corroded Steel Beams & Structural Framing
    this.matTrim = new THREE.MeshStandardMaterial({
      color: 0x3d4959,
      roughness: 0.55,
      metalness: 0.75,
      map: hasDoc ? TextureGenerator.getCorrodedSteel() : null,
    });

    // 4. Dark Weathered Alloy
    this.matMetalDark = new THREE.MeshStandardMaterial({
      color: 0x18202c,
      roughness: 0.6,
      metalness: 0.85,
      map: hasDoc ? TextureGenerator.getCorrodedSteel() : null,
    });

    // 5. Restrained Atmospheric Cyan Circuitry
    this.matCyanEmissive = new THREE.MeshStandardMaterial({
      color: 0x2cd5f5,
      emissive: 0x2cd5f5,
      emissiveIntensity: 0.8,
      roughness: 0.2,
    });

    // 6. Spectral Echo Violet
    this.matVioletEmissive = new THREE.MeshStandardMaterial({
      color: 0x8b66fa,
      emissive: 0x8b66fa,
      emissiveIntensity: 0.7,
      roughness: 0.3,
    });

    // 7. SMP Gold Accents
    this.matGoldEmissive = new THREE.MeshStandardMaterial({
      color: 0xd4a52c,
      emissive: 0xd4a52c,
      emissiveIntensity: 0.7,
      roughness: 0.35,
      metalness: 0.8,
    });
  }

  /**
   * Builds an overgrown, weathered industrial concrete platform reclaimed by moss,
   * with steel curb edging, hanging roots, and underside cable conduits.
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

    // 3. Overgrown Nature & Hanging Foliage
    if (width >= 2.5) {
      const vineLeft = NatureAssetFactory.createHangingVines(1.8);
      vineLeft.position.set(-width * 0.3, -height / 2, depth / 2 + 0.05);
      group.add(vineLeft);

      const fern = NatureAssetFactory.createFernPatch();
      fern.position.set(width * 0.25, height / 2, depth * 0.2);
      group.add(fern);
    }

    // 4. Underside Heavy Structural I-Beams
    const beamCount = Math.max(1, Math.floor(width / 3.0));
    for (let i = 0; i < beamCount; i++) {
      const xPos = -width / 2 + (width / (beamCount + 1)) * (i + 1);
      const beam = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.16, 2.0, 8),
        this.matMetalDark
      );
      beam.position.set(xPos, -height / 2 - 0.9, 0);
      group.add(beam);
    }

    return group;
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
    const pillarGeom = new THREE.BoxGeometry(0.5, height + 1.2, depth + 0.6);
    const leftPillar = new THREE.Mesh(pillarGeom, this.matTrim);
    leftPillar.position.set(-width / 2 - 0.25, 0.2, 0);
    const rightPillar = new THREE.Mesh(pillarGeom, this.matTrim);
    rightPillar.position.set(width / 2 + 0.25, 0.2, 0);

    const topLintel = new THREE.Mesh(
      new THREE.BoxGeometry(width + 1.4, 0.6, depth + 0.6),
      this.matTrim
    );
    topLintel.position.set(0, height / 2 + 0.5, 0);
    doorGroup.add(leftPillar, rightPillar, topLintel);

    // Sliding Reinforced Bulkhead Door
    const slabGeom = new THREE.BoxGeometry(width, height, depth);
    const slidingSlab = new THREE.Mesh(slabGeom, this.matMetalDark);
    slidingSlab.castShadow = true;
    slidingSlab.receiveShadow = true;

    // Glowing status lock indicator
    const lockBar = new THREE.Mesh(
      new THREE.BoxGeometry(width * 0.7, 0.12, depth + 0.08),
      this.matCyanEmissive
    );
    slidingSlab.add(lockBar);

    doorGroup.add(slidingSlab);
    return { doorGroup, slidingSlab };
  }

  /**
   * Environmental 3D Pressure Plate Sensor with hydraulic dampers and damp concrete rim.
   */
  public static createPressurePlate(width: number): {
    plateGroup: THREE.Group;
    padMesh: THREE.Mesh;
    padLight: THREE.PointLight;
  } {
    this.initMaterials();
    const plateGroup = new THREE.Group();

    // Concrete & Rusted Rim
    const baseMesh = new THREE.Mesh(
      new THREE.BoxGeometry(width + 0.3, 0.15, 2.4),
      this.matTrim
    );
    plateGroup.add(baseMesh);

    // Depressible Sensor Pad
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
   * Abandoned Research Terminal Console with tactile CRT monitor and status beacon.
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

    // Glowing Amber Beacon
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
   * High-Fidelity Humanoid Explorer Character
   * Proportioned character with research jacket, cybernetic visor, atmospheric backpack,
   * and articulated limbs for realistic walk/run/jump cycles.
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
          emissive: 0x2cd5f5,
          emissiveIntensity: 0.8,
          transparent: true,
          opacity: 0.65,
          roughness: 0.3,
        })
      : new THREE.MeshStandardMaterial({
          color: 0x2b384a, // Weathered slate-navy exploratory suit
          roughness: 0.65,
          metalness: 0.25,
        });

    const armorMat = isEcho
      ? this.matVioletEmissive
      : new THREE.MeshStandardMaterial({
          color: 0xd4a52c, // SMP Gold exploratory shoulder plates
          roughness: 0.35,
          metalness: 0.8,
        });

    const visorMat = isEcho ? this.matVioletEmissive : this.matCyanEmissive;

    // 1. Torso & Exploration Parka
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.82, 0.44), suitMat);
    torso.position.y = 0.95;
    torso.castShadow = !isEcho;

    // Life Support Backpack
    const backpack = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.6, 0.22), this.matMetalDark);
    backpack.position.set(0, 0.05, -0.28);
    torso.add(backpack);

    // Glowing Chest Reactor
    const core = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 16), visorMat);
    core.position.set(0, 0.12, 0.24);
    torso.add(core);

    // 2. Helmet & Detailed Visor
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.44, 0.42), suitMat);
    head.position.y = 1.55;
    const visor = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.14, 0.16), visorMat);
    visor.position.set(0, 0.02, 0.2);
    head.add(visor);

    // 3. Shoulders & Arms
    const armGeom = new THREE.BoxGeometry(0.18, 0.65, 0.2);
    const leftArm = new THREE.Mesh(armGeom, suitMat);
    leftArm.position.set(-0.46, 0.9, 0);
    const rightArm = new THREE.Mesh(armGeom, suitMat);
    rightArm.position.set(0.46, 0.9, 0);

    // Shoulder Pauldrons
    const pauldronL = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.15, 0.26), armorMat);
    pauldronL.position.set(0, 0.3, 0);
    leftArm.add(pauldronL);
    const pauldronR = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.15, 0.26), armorMat);
    pauldronR.position.set(0, 0.3, 0);
    rightArm.add(pauldronR);

    // 4. Articulated Legs
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
   * Multi-Layered Cinematic 2.5D Environment:
   * Combines broken research architecture, mossy overgrown walls, ancient trees,
   * climbing ivy, hanging conduits, and distant mountain silhouettes.
   */
  public static createFacilityEnvironment(roomWidth: number = 70, roomHeight: number = 28): THREE.Group {
    this.initMaterials();
    const envGroup = new THREE.Group();

    // 1. Distant Foggy Landscape (Far Background: Z = -16)
    const mountainGeom = new THREE.PlaneGeometry(roomWidth * 1.5, roomHeight * 1.2);
    const mountainMat = new THREE.MeshStandardMaterial({
      color: 0x121a24,
      roughness: 0.95,
      metalness: 0.05,
    });
    const mountain = new THREE.Mesh(mountainGeom, mountainMat);
    mountain.position.set(0, roomHeight / 2 - 2, -16.0);
    envGroup.add(mountain);

    // 2. Overgrown Research Facility Wall with Moss & Ivy (Midground: Z = -7)
    const wallGeom = new THREE.PlaneGeometry(roomWidth, roomHeight);
    const backWall = new THREE.Mesh(wallGeom, this.matWall);
    backWall.position.set(0, roomHeight / 2 - 2, -7.0);
    backWall.receiveShadow = true;
    envGroup.add(backWall);

    // 3. Ancient Trees & Giant Roots Reclaiming the Complex
    const tree1 = NatureAssetFactory.createAncientTree(14);
    tree1.position.set(-18, -1.0, -5.5);
    envGroup.add(tree1);

    const tree2 = NatureAssetFactory.createAncientTree(12);
    tree2.position.set(16, -1.0, -5.0);
    envGroup.add(tree2);

    // 4. Overgrown Gantry Columns & Broken Ceiling Trusses
    for (let x = -roomWidth / 2 + 6; x <= roomWidth / 2 - 6; x += 10) {
      const archGroup = new THREE.Group();
      archGroup.position.set(x, 0, -4.8);

      // Heavy industrial column
      const pillar = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, roomHeight, 0.7),
        this.matTrim
      );
      pillar.position.set(0, roomHeight / 2 - 2, 0);

      // Overgrown Ivy Vines hanging from the column
      const vine = NatureAssetFactory.createHangingVines(3.5);
      vine.position.set(0.1, roomHeight - 6, 0.35);
      archGroup.add(pillar, vine);

      // Overhead industrial conduit
      const conduit = new THREE.Mesh(
        new THREE.CylinderGeometry(0.14, 0.14, 10.0, 8),
        this.matMetalDark
      );
      conduit.rotation.z = Math.PI / 2;
      conduit.position.set(5.0, roomHeight - 5, -0.4);
      archGroup.add(conduit);

      envGroup.add(archGroup);
    }

    // 5. Environmental Foreground Boulders & Undergrowth (Z = 1.5 to 2.5)
    for (let x = -20; x <= 20; x += 9) {
      const rock = NatureAssetFactory.createMossyBoulder(0.6 + Math.random() * 0.4);
      rock.position.set(x + (Math.random() - 0.5) * 3, -1.8, 1.8);
      envGroup.add(rock);

      const fern = NatureAssetFactory.createFernPatch();
      fern.position.set(x + (Math.random() - 0.5) * 2, -1.8, 1.4);
      envGroup.add(fern);
    }

    return envGroup;
  }
}
