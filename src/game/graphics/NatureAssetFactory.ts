import * as THREE from 'three';
import { TextureGenerator } from './TextureGenerator';

/**
 * Organic Nature & Overgrowth Asset Pipeline
 * Generates trees, ancient roots, ferns, hanging climbing vines, rocks, and foliage
 * inspired by INSIDE and Planet of Lana.
 */
export class NatureAssetFactory {
  private static matBark: THREE.MeshStandardMaterial;
  private static matLeaves: THREE.MeshStandardMaterial;
  private static matVines: THREE.MeshStandardMaterial;
  private static matRock: THREE.MeshStandardMaterial;

  public static init(): void {
    if (this.matBark) return;

    this.matBark = new THREE.MeshStandardMaterial({
      color: 0x3d322a,
      roughness: 0.9,
      metalness: 0.05,
      map: typeof document !== 'undefined' ? TextureGenerator.getTreeBark() : null,
    });

    this.matLeaves = new THREE.MeshStandardMaterial({
      color: 0x2e4a2d,
      roughness: 0.65,
      metalness: 0.0,
      side: THREE.DoubleSide,
    });

    this.matVines = new THREE.MeshStandardMaterial({
      color: 0x34542d,
      roughness: 0.7,
      metalness: 0.05,
    });

    this.matRock = new THREE.MeshStandardMaterial({
      color: 0x2c333a,
      roughness: 0.85,
      metalness: 0.15,
      map: typeof document !== 'undefined' ? TextureGenerator.getAgedConcrete() : null,
    });
  }

  /**
   * Creates an ancient gnarly tree reclaiming concrete facility foundations.
   */
  public static createAncientTree(height: number = 10): THREE.Group {
    this.init();
    const treeGroup = new THREE.Group();

    // Main Trunk with natural curvature
    const trunkGeom = new THREE.CylinderGeometry(0.35, 0.7, height, 8);
    const trunk = new THREE.Mesh(trunkGeom, this.matBark);
    trunk.position.y = height / 2;
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    treeGroup.add(trunk);

    // Twisted Root buttresses reaching into the floor
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2 + Math.PI / 4;
      const root = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.28, 2.5, 6),
        this.matBark
      );
      root.position.set(Math.cos(angle) * 0.7, 0.6, Math.sin(angle) * 0.7);
      root.rotation.z = Math.cos(angle) * 0.5;
      root.rotation.x = Math.sin(angle) * 0.5;
      treeGroup.add(root);
    }

    // Branching Canopies with clustered verdant foliage
    const branches = [
      { y: height * 0.6, scale: 2.2, offset: new THREE.Vector3(-0.8, 0, 0.2) },
      { y: height * 0.8, scale: 2.8, offset: new THREE.Vector3(0.9, 0, -0.3) },
      { y: height * 0.95, scale: 3.2, offset: new THREE.Vector3(0.0, 0, 0.0) },
    ];

    branches.forEach(b => {
      const foliageCluster = new THREE.Mesh(
        new THREE.DodecahedronGeometry(b.scale, 1),
        this.matLeaves
      );
      foliageCluster.position.set(b.offset.x, b.y, b.offset.z);
      foliageCluster.castShadow = true;
      treeGroup.add(foliageCluster);
    });

    return treeGroup;
  }

  /**
   * Creates natural hanging moss and climbing ivy vines to drape over concrete walls.
   */
  public static createHangingVines(length: number = 4.0): THREE.Group {
    this.init();
    const vineGroup = new THREE.Group();

    const segments = Math.floor(length / 0.8);
    for (let i = 0; i < segments; i++) {
      const strand = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.03, 0.9, 5),
        this.matVines
      );
      strand.position.set(
        Math.sin(i * 1.5) * 0.15,
        -i * 0.75,
        Math.cos(i * 1.5) * 0.1
      );
      strand.rotation.z = Math.sin(i) * 0.2;
      vineGroup.add(strand);
    }

    return vineGroup;
  }

  /**
   * Creates mossy weathered boulders and rock clusters.
   */
  public static createMossyBoulder(radius: number = 0.8): THREE.Mesh {
    this.init();
    const geom = new THREE.DodecahedronGeometry(radius, 1);
    // Displace vertices organically
    const pos = geom.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const v = new THREE.Vector3().fromBufferAttribute(pos, i);
      v.multiplyScalar(0.85 + Math.random() * 0.3);
      pos.setXYZ(i, v.x, v.y, v.z);
    }
    geom.computeVertexNormals();

    const rock = new THREE.Mesh(geom, this.matRock);
    rock.castShadow = true;
    rock.receiveShadow = true;
    return rock;
  }

  /**
   * Creates lush environmental ground ferns and undergrowth.
   */
  public static createFernPatch(): THREE.Group {
    this.init();
    const fernGroup = new THREE.Group();

    for (let i = 0; i < 7; i++) {
      const angle = (i * Math.PI * 2) / 7;
      const frond = new THREE.Mesh(
        new THREE.PlaneGeometry(0.25, 0.9),
        this.matLeaves
      );
      frond.position.set(Math.cos(angle) * 0.25, 0.35, Math.sin(angle) * 0.25);
      frond.rotation.y = angle;
      frond.rotation.x = Math.PI / 4;
      fernGroup.add(frond);
    }

    return fernGroup;
  }
}
