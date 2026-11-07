import * as THREE from 'three';
import { TextureGenerator } from './TextureGenerator';

/**
 * Organic Nature & Overgrowth Asset Pipeline
 * Generates botanically inspired trees with organic bark topology,
 * multiple levels of natural branching (trunks -> main limbs -> twigs),
 * and angled planar foliage leaf-cards with translucency, eliminating spherical blobs.
 */
export class NatureAssetFactory {
  private static matBark: THREE.MeshStandardMaterial;
  private static matLeaves: THREE.MeshStandardMaterial;
  private static matVines: THREE.MeshStandardMaterial;
  private static matRock: THREE.MeshStandardMaterial;

  public static init(): void {
    if (this.matBark) return;

    const hasDoc = typeof document !== 'undefined';

    // Warm, deeply textured organic tree bark
    this.matBark = new THREE.MeshStandardMaterial({
      color: 0x544336,
      roughness: 0.88,
      metalness: 0.04,
      map: hasDoc ? TextureGenerator.getTreeBark() : null,
    });

    // Realistic foliage card material with double-sided rendering and translucency
    this.matLeaves = new THREE.MeshStandardMaterial({
      color: 0x4f7d3a,
      roughness: 0.62,
      metalness: 0.0,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.95,
      alphaTest: 0.15,
    });

    this.matVines = new THREE.MeshStandardMaterial({
      color: 0x456c32,
      roughness: 0.72,
      metalness: 0.05,
    });

    this.matRock = new THREE.MeshStandardMaterial({
      color: 0x5a6575,
      roughness: 0.82,
      metalness: 0.12,
      map: hasDoc ? TextureGenerator.getAgedConcrete() : null,
    });
  }

  /**
   * Creates an organic tree with tapered curved trunk, root flare, multi-tier branches,
   * and non-spherical instanced leaf-card clusters.
   */
  public static createAncientTree(height: number = 11, species: 'oak' | 'pine' | 'willow' = 'oak'): THREE.Group {
    this.init();
    const treeGroup = new THREE.Group();
    treeGroup.name = `Tree_${species}_${height}`;

    // 1. Organic Tapered Trunk
    const trunkCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0.2, height * 0.3, 0.1),
      new THREE.Vector3(-0.15, height * 0.65, -0.1),
      new THREE.Vector3(0.1, height * 0.9, 0.05),
      new THREE.Vector3(0, height, 0),
    ]);

    const trunkGeom = new THREE.TubeGeometry(trunkCurve, 16, 0.42, 8, false);
    const trunk = new THREE.Mesh(trunkGeom, this.matBark);
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    treeGroup.add(trunk);

    // 2. Flared Root Buttresses
    for (let i = 0; i < 5; i++) {
      const angle = (i * Math.PI * 2) / 5 + 0.2;
      const rootLength = 1.8 + Math.random() * 0.8;
      const rootCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(Math.cos(angle) * 0.4, 0.8, Math.sin(angle) * 0.4),
        new THREE.Vector3(Math.cos(angle) * 1.0, 0.2, Math.sin(angle) * 1.0),
        new THREE.Vector3(Math.cos(angle) * rootLength, -0.2, Math.sin(angle) * rootLength),
      ]);
      const rootMesh = new THREE.Mesh(
        new THREE.TubeGeometry(rootCurve, 8, 0.18, 6, false),
        this.matBark
      );
      rootMesh.castShadow = true;
      treeGroup.add(rootMesh);
    }

    // 3. Multi-tier Branching Hierarchy (Trunk -> Primary Limbs -> Secondary Twigs)
    const branchTiers = [
      { y: height * 0.45, dir: new THREE.Vector3(1.2, 0.7, 0.4), len: 3.2, thick: 0.18 },
      { y: height * 0.58, dir: new THREE.Vector3(-1.4, 0.8, -0.3), len: 3.5, thick: 0.19 },
      { y: height * 0.72, dir: new THREE.Vector3(0.8, 0.9, -0.8), len: 2.8, thick: 0.16 },
      { y: height * 0.84, dir: new THREE.Vector3(-0.9, 1.0, 0.7), len: 2.4, thick: 0.14 },
      { y: height * 0.94, dir: new THREE.Vector3(0.3, 1.1, 0.2), len: 2.0, thick: 0.12 },
    ];

    branchTiers.forEach((tier) => {
      const startPt = trunkCurve.getPoint(tier.y / height);
      const endPt = startPt.clone().add(tier.dir.clone().normalize().multiplyScalar(tier.len));

      const branchCurve = new THREE.CatmullRomCurve3([
        startPt,
        startPt.clone().add(tier.dir.clone().multiplyScalar(0.5)).add(new THREE.Vector3(0, 0.2, 0)),
        endPt,
      ]);

      const branchMesh = new THREE.Mesh(
        new THREE.TubeGeometry(branchCurve, 8, tier.thick, 6, false),
        this.matBark
      );
      branchMesh.castShadow = true;
      treeGroup.add(branchMesh);

      // 4. Foliage Cards: Irregular leaf planes angled naturally (NO SPHERES!)
      const foliageGroup = new THREE.Group();
      foliageGroup.position.copy(endPt);

      const leafCount = 14;
      for (let j = 0; j < leafCount; j++) {
        const spread = 1.3;
        const lx = (Math.random() - 0.5) * spread * 2;
        const ly = (Math.random() - 0.3) * spread * 1.5;
        const lz = (Math.random() - 0.5) * spread * 2;

        // Crossed leaf card planes
        const cardGeom = new THREE.PlaneGeometry(0.85 + Math.random() * 0.4, 0.65 + Math.random() * 0.3);
        const card = new THREE.Mesh(cardGeom, this.matLeaves);
        card.position.set(lx, ly, lz);
        card.rotation.set(
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI
        );
        card.castShadow = true;
        card.receiveShadow = true;
        foliageGroup.add(card);
      }
      treeGroup.add(foliageGroup);
    });

    return treeGroup;
  }

  /**
   * Creates natural hanging moss and climbing ivy vines to drape over concrete walls.
   */
  public static createHangingVines(length: number = 3.5): THREE.Group {
    this.init();
    const vineGroup = new THREE.Group();
    vineGroup.name = 'HangingVinesGroup';

    const segments = Math.floor(length / 0.7);
    for (let i = 0; i < segments; i++) {
      const strand = new THREE.Mesh(
        new THREE.CylinderGeometry(0.035, 0.025, 0.8, 5),
        this.matVines
      );
      strand.position.set(
        Math.sin(i * 1.4) * 0.12,
        -i * 0.65,
        Math.cos(i * 1.4) * 0.08
      );
      strand.rotation.z = Math.sin(i) * 0.18;
      vineGroup.add(strand);
    }

    return vineGroup;
  }

  /**
   * Creates mossy weathered boulders.
   */
  public static createMossyBoulder(radius: number = 0.8): THREE.Mesh {
    this.init();
    const geom = new THREE.IcosahedronGeometry(radius, 2);
    const pos = geom.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const v = new THREE.Vector3().fromBufferAttribute(pos, i);
      v.multiplyScalar(0.85 + Math.random() * 0.28);
      pos.setXYZ(i, v.x, v.y, v.z);
    }
    geom.computeVertexNormals();

    const rock = new THREE.Mesh(geom, this.matRock);
    rock.castShadow = true;
    rock.receiveShadow = true;
    return rock;
  }

  /**
   * Creates clusters of verdant ferns.
   */
  public static createFernPatch(): THREE.Group {
    this.init();
    const patch = new THREE.Group();
    patch.name = 'FernPatchGroup';

    for (let i = 0; i < 7; i++) {
      const angle = (i * Math.PI * 2) / 7;
      const frond = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.95), this.matLeaves);
      frond.position.set(Math.cos(angle) * 0.28, 0.4, Math.sin(angle) * 0.28);
      frond.rotation.y = angle;
      frond.rotation.x = Math.PI / 4.2;
      patch.add(frond);
    }

    return patch;
  }
}
