import * as THREE from 'three';

export class SciFiAssetFactory {
  // Shared PBR Material Cache to ensure peak GPU performance
  private static matFloor: THREE.MeshStandardMaterial;
  private static matWall: THREE.MeshStandardMaterial;
  private static matTrim: THREE.MeshStandardMaterial;
  private static matCyanEmissive: THREE.MeshStandardMaterial;
  private static matVioletEmissive: THREE.MeshStandardMaterial;
  private static matGoldEmissive: THREE.MeshStandardMaterial;
  private static matMetalDark: THREE.MeshStandardMaterial;

  public static initMaterials(): void {
    if (this.matFloor) return;

    // 1. Procedural High-Tech Industrial Floor Material
    this.matFloor = new THREE.MeshStandardMaterial({
      color: 0x161e2e,
      roughness: 0.35,
      metalness: 0.85,
    });

    // 2. High-Tech Wall Panels with subtle blue-gray sheen
    this.matWall = new THREE.MeshStandardMaterial({
      color: 0x0c1322,
      roughness: 0.55,
      metalness: 0.6,
    });

    // 3. Heavy Industrial Trim & Framing
    this.matTrim = new THREE.MeshStandardMaterial({
      color: 0x1f2c42,
      roughness: 0.25,
      metalness: 0.9,
    });

    // 4. Dark Reinforced Carbon Alloy
    this.matMetalDark = new THREE.MeshStandardMaterial({
      color: 0x070b12,
      roughness: 0.4,
      metalness: 0.95,
    });

    // 5. Temporal Cyan Glowing Circuitry
    this.matCyanEmissive = new THREE.MeshStandardMaterial({
      color: 0x38d9ff,
      emissive: 0x38d9ff,
      emissiveIntensity: 1.2,
      roughness: 0.1,
    });

    // 6. Echo Violet Glowing Elements
    this.matVioletEmissive = new THREE.MeshStandardMaterial({
      color: 0x9875ff,
      emissive: 0x9875ff,
      emissiveIntensity: 1.0,
      roughness: 0.2,
    });

    // 7. SMP Gold Circuitry & Accents
    this.matGoldEmissive = new THREE.MeshStandardMaterial({
      color: 0xd4a52c,
      emissive: 0xd4a52c,
      emissiveIntensity: 0.8,
      roughness: 0.25,
      metalness: 0.9,
    });
  }

  /**
   * Builds an industrial modular sci-fi platform with top grating, side chamfers,
   * neon trim lines, and hydraulic underside struts.
   */
  public static createIndustrialPlatform(width: number, height: number, depth: number = 4.0): THREE.Group {
    this.initMaterials();
    const group = new THREE.Group();

    // Main structural block
    const mainMesh = new THREE.Mesh(
      new THREE.BoxGeometry(width, height, depth),
      this.matFloor
    );
    mainMesh.castShadow = true;
    mainMesh.receiveShadow = true;
    group.add(mainMesh);

    // Top neon guide rails along the traversable edge
    const railGeom = new THREE.BoxGeometry(width, 0.06, 0.08);
    const railFront = new THREE.Mesh(railGeom, this.matCyanEmissive);
    railFront.position.set(0, height / 2 + 0.03, depth / 2 - 0.2);
    const railBack = new THREE.Mesh(railGeom, this.matCyanEmissive);
    railBack.position.set(0, height / 2 + 0.03, -depth / 2 + 0.2);
    group.add(railFront, railBack);

    // Industrial metallic end-caps
    const capWidth = Math.min(0.3, width * 0.1);
    const capGeom = new THREE.BoxGeometry(capWidth, height + 0.05, depth + 0.05);
    const capLeft = new THREE.Mesh(capGeom, this.matTrim);
    capLeft.position.set(-width / 2 + capWidth / 2, 0, 0);
    const capRight = new THREE.Mesh(capGeom, this.matTrim);
    capRight.position.set(width / 2 - capWidth / 2, 0, 0);
    group.add(capLeft, capRight);

    // Underside hydraulic support bracket
    const strutGeom = new THREE.CylinderGeometry(0.08, 0.12, 1.2, 8);
    const strutLeft = new THREE.Mesh(strutGeom, this.matMetalDark);
    strutLeft.position.set(-width * 0.35, -height / 2 - 0.5, 0);
    const strutRight = new THREE.Mesh(strutGeom, this.matMetalDark);
    strutRight.position.set(width * 0.35, -height / 2 - 0.5, 0);
    group.add(strutLeft, strutRight);

    return group;
  }

  /**
   * Builds an articulated mechanical Security Blast Door with locking teeth,
   * warning hazard chevrons, and hydraulic rail tracks.
   */
  public static createMechanicalDoor(width: number, height: number, depth: number = 2.0): {
    doorGroup: THREE.Group;
    slidingSlab: THREE.Mesh;
  } {
    this.initMaterials();
    const doorGroup = new THREE.Group();

    // Outer door frame archway
    const framePillarGeom = new THREE.BoxGeometry(0.3, height + 0.6, depth + 0.4);
    const leftPillar = new THREE.Mesh(framePillarGeom, this.matTrim);
    leftPillar.position.set(-width / 2 - 0.15, 0, 0);
    const rightPillar = new THREE.Mesh(framePillarGeom, this.matTrim);
    rightPillar.position.set(width / 2 + 0.15, 0, 0);
    const topLintel = new THREE.Mesh(
      new THREE.BoxGeometry(width + 0.9, 0.4, depth + 0.4),
      this.matTrim
    );
    topLintel.position.set(0, height / 2 + 0.2, 0);
    doorGroup.add(leftPillar, rightPillar, topLintel);

    // Sliding Door Slab
    const slabGeom = new THREE.BoxGeometry(width, height, depth);
    const slidingSlab = new THREE.Mesh(slabGeom, this.matMetalDark);
    slidingSlab.castShadow = true;
    slidingSlab.receiveShadow = true;

    // Glowing security lock lines on door
    const lockBar = new THREE.Mesh(new THREE.BoxGeometry(width * 0.8, 0.1, depth + 0.05), this.matCyanEmissive);
    slidingSlab.add(lockBar);

    doorGroup.add(slidingSlab);

    return { doorGroup, slidingSlab };
  }

  /**
   * Builds a 3D Pressure Plate Sensor with beveled rim, hydraulic dampers, and central energy pad.
   */
  public static createPressurePlate(width: number): {
    plateGroup: THREE.Group;
    padMesh: THREE.Mesh;
    padLight: THREE.PointLight;
  } {
    this.initMaterials();
    const plateGroup = new THREE.Group();

    // Base Rim
    const baseMesh = new THREE.Mesh(
      new THREE.BoxGeometry(width + 0.2, 0.15, 2.2),
      this.matTrim
    );
    plateGroup.add(baseMesh);

    // Depressible Sensor Pad
    const padMesh = new THREE.Mesh(
      new THREE.BoxGeometry(width, 0.12, 1.8),
      this.matCyanEmissive
    );
    padMesh.position.y = 0.08;
    plateGroup.add(padMesh);

    // Dynamic Sensor Point Light
    const padLight = new THREE.PointLight(0x38d9ff, 0.8, 3.5);
    padLight.position.set(0, 0.4, 0.5);
    plateGroup.add(padLight);

    return { plateGroup, padMesh, padLight };
  }

  /**
   * Builds a high-tech Switch Console with angled interactive interface and status beacon.
   */
  public static createSwitchTerminal(): {
    terminalGroup: THREE.Group;
    beaconMesh: THREE.Mesh;
    beaconLight: THREE.PointLight;
  } {
    this.initMaterials();
    const terminalGroup = new THREE.Group();

    // Pedestal
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.35, 1.1, 8), this.matTrim);
    base.position.y = 0.55;

    // Angled console head
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.3, 0.5), this.matMetalDark);
    head.position.set(0, 1.15, 0.1);
    head.rotation.x = -Math.PI / 6;

    // Status Beacon (Red = Off, Cyan = Active)
    const beaconMesh = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16), this.matGoldEmissive);
    beaconMesh.position.set(0, 1.35, 0.05);

    const beaconLight = new THREE.PointLight(0xd4a52c, 1.2, 4.0);
    beaconLight.position.set(0, 1.45, 0.3);

    terminalGroup.add(base, head, beaconMesh, beaconLight);

    return { terminalGroup, beaconMesh, beaconLight };
  }

  /**
   * Builds a highly detailed science-fiction Humanoid Robotic Explorer
   * with articulated limbs, helmet visor, chest reactor, and shoulder guards.
   */
  public static createHumanoidCharacter(isEcho: boolean = false): {
    characterGroup: THREE.Group;
    torso: THREE.Mesh;
    head: THREE.Mesh;
    leftArm: THREE.Mesh;
    rightArm: THREE.Mesh;
    leftLeg: THREE.Mesh;
    rightLeg: THREE.Mesh;
  } {
    this.initMaterials();
    const characterGroup = new THREE.Group();

    const primaryMat = isEcho
      ? new THREE.MeshStandardMaterial({
          color: 0x9875ff,
          emissive: 0x38d9ff,
          emissiveIntensity: 0.8,
          transparent: true,
          opacity: 0.65,
          roughness: 0.2,
        })
      : this.matTrim;

    const accentMat = isEcho
      ? this.matVioletEmissive
      : this.matCyanEmissive;

    // 1. Torso & Armor Chestplate
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.8, 0.4), primaryMat);
    torso.position.y = 0.95;
    torso.castShadow = !isEcho;

    // Glowing Temporal Core (Reactor)
    const reactor = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.1, 16), accentMat);
    reactor.rotation.x = Math.PI / 2;
    reactor.position.set(0, 0.1, 0.21);
    torso.add(reactor);

    // 2. Helmet & Visor
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.45, 0.42), primaryMat);
    head.position.y = 1.55;
    const visor = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.14, 0.15), accentMat);
    visor.position.set(0, 0.02, 0.2);
    head.add(visor);

    // 3. Arms
    const armGeom = new THREE.BoxGeometry(0.18, 0.65, 0.2);
    const leftArm = new THREE.Mesh(armGeom, primaryMat);
    leftArm.position.set(-0.45, 0.9, 0);
    const rightArm = new THREE.Mesh(armGeom, primaryMat);
    rightArm.position.set(0.45, 0.9, 0);

    // 4. Legs
    const legGeom = new THREE.BoxGeometry(0.22, 0.7, 0.25);
    const leftLeg = new THREE.Mesh(legGeom, primaryMat);
    leftLeg.position.set(-0.2, 0.35, 0);
    const rightLeg = new THREE.Mesh(legGeom, primaryMat);
    rightLeg.position.set(0.2, 0.35, 0);

    characterGroup.add(torso, head, leftArm, rightArm, leftLeg, rightLeg);

    return {
      characterGroup,
      torso,
      head,
      leftArm,
      rightArm,
      leftLeg,
      rightLeg,
    };
  }

  /**
   * Builds the Atmospheric Research Facility Interior with back walls, support arches,
   * high-voltage conduits, and modular ceiling panels.
   */
  public static createFacilityEnvironment(roomWidth: number = 60, roomHeight: number = 24): THREE.Group {
    this.initMaterials();
    const envGroup = new THREE.Group();

    // Background Modular Wall Panels
    const wallGeom = new THREE.PlaneGeometry(roomWidth, roomHeight);
    const backWall = new THREE.Mesh(wallGeom, this.matWall);
    backWall.position.set(0, roomHeight / 2 - 2, -6.0);
    backWall.receiveShadow = true;
    envGroup.add(backWall);

    // Structural Gantry Arches
    for (let x = -roomWidth / 2 + 5; x <= roomWidth / 2 - 5; x += 8) {
      const archGroup = new THREE.Group();
      archGroup.position.set(x, 0, -4.5);

      const pillarL = new THREE.Mesh(new THREE.BoxGeometry(0.4, roomHeight, 0.6), this.matTrim);
      pillarL.position.set(0, roomHeight / 2 - 2, 0);

      // Horizontal conduit pipes crossing the ceiling
      const pipe = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.12, 8.0, 8),
        this.matMetalDark
      );
      pipe.rotation.z = Math.PI / 2;
      pipe.position.set(4.0, roomHeight - 4, -0.5);

      archGroup.add(pillarL, pipe);
      envGroup.add(archGroup);
    }

    return envGroup;
  }
}
