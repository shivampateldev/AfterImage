import * as THREE from 'three';
import { TextureGenerator } from './TextureGenerator';

/**
 * Organic Nature & Overgrowth Asset Pipeline
 * Generates trees with natural trunk branching, leaf clusters, mossy boulders,
 * and hanging vines inspired by INSIDE and Planet of Lana.
 */
export class NatureAssetFactory {
  private static matBark: THREE.MeshStandardMaterial;
  private static matLeaves: THREE.MeshStandardMaterial;
  private static matVines: THREE.MeshStandardMaterial;
  private static matRock: THREE.MeshStandardMaterial;

  public static init(): void {
    if (this.matBark) return;

    const hasDoc = typeof document !== 'undefined';

    this.matBark = new THREE.MeshStandardMaterial({
      color: 0x42382e,
      roughness: 0.85,
      metalness: 0.05,
      map: hasDoc ? TextureGenerator.getTreeBark() : null,
    });

    this.matLeaves = new THREE.MeshStandardMaterial({
      color: 0x3d6335,
      roughness: 0.7,
      metalness: 0.0,
      side: THREE.DoubleSide,
    });

    this.matVines = new THREE.MeshStandardMaterial({
      color: 0x385c2c,
      roughness: 0.75,
      metalness: 0.05,
    });

    this.matRock = new THREE.MeshStandardMaterial({
      color: 0x48525e,
      roughness: 0.8,
      metalness: 0.15,
      map: hasDoc ? TextureGenerator.getAgedConcrete() : null,
    });
  }

  /**
   * Creates an ancient gnarly tree with detailed branch canopy and natural silhouette.
   */
  public static createAncientTree(height: number = 10): THREE.Group {
    this.init();
    const treeGroup = new THREE.Group();
    treeGroup.name = 'AncientTreeGroup';

    // Main Trunk with natural tapered curvature
    const trunkGeom = new THREE.CylinderGeometry(0.3, 0.65, height, 10);
    const trunk = new THREE.Mesh(trunkGeom, this.matBark);
    trunk.position.y = height / 2;
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    treeGroup.add(trunk);

    // Twisted Root buttresses reaching into the floor
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2 + Math.PI / 4;
      const root = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.25, 2.2, 6),
        this.matBark
      );
      root.position.set(Math.cos(angle) * 0.6, 0.6, Math.sin(angle) * 0.6);
      root.rotation.z = Math.cos(angle) * 0.45;
      root.rotation.x = Math.sin(angle) * 0.45;
      treeGroup.add(root);
    }

    // Natural Branch Spreads
    const branchConfigs = [
      { y: height * 0.55, rotZ: 0.6, rotY: 0.2, length: 2.8, scale: 1.6 },
      { y: height * 0.7, rotZ: -0.55, rotY: 1.4, length: 3.2, scale: 1.8 },
      { y: height * 0.82, rotZ: 0.45, rotY: -1.0, length: 2.4, scale: 1.5 },
      { y: height * 0.92, rotZ: -0.3, rotY: 0.5, length: 2.0, scale: 1.4 },
      { y: height * 0.98, rotZ: 0.1, rotY: 2.1, length: 1.8, scale: 2.2 },
    ];

    branchConfigs.forEach((cfg) => {
      const limb = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.22, cfg.length, 6),
        this.matBark
      );
      limb.position.set(0, cfg.y, 0);
      limb.rotation.z = cfg.rotZ;
      limb.rotation.y = cfg.rotY;
      treeGroup.add(limb);

      // Fine leaf cluster at the tip of each branch
      const tipOffset = new THREE.Vector3(0, cfg.length / 2, 0).applyEuler(limb.rotation);
      const leafCluster = new THREE.Mesh(
        new THREE.IcosahedronGeometry(cfg.scale, 1),
        this.matLeaves
      );
      leafCluster.position.set(tipOffset.x, cfg.y + tipOffset.y, tipOffset.z);
      leafCluster.castShadow = true;
      treeGroup.add(leafCluster);
    });

    return treeGroup;
  }

  /**
   * Creates natural hanging moss and climbing ivy vines.
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
    const geom = new THREE.IcosahedronGeometry(radius, 1);
    const pos = geom.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const v = new THREE.Vector3().fromBufferAttribute(pos, i);
      v.multiplyScalar(0.88 + Math.random() * 0.25);
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

    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI * 2) / 6;
      const frond = new THREE.Mesh(new THREE.PlaneGeometry(0.25, 0.8), this.matLeaves);
      frond.position.set(Math.cos(angle) * 0.25, 0.35, Math.sin(angle) * 0.25);
      frond.rotation.y = angle;
      frond.rotation.x = Math.PI / 4.5;
      patch.add(frond);
    }

    return patch;
  }
}
