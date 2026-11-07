const fs = require('fs');
const path = require('path');
const THREE = require('three');
const { GLTFExporter } = require('three/examples/jsm/exporters/GLTFExporter.js');

// Polyfill FileReader for Node.js
class FileReaderPolyfill {
  readAsArrayBuffer(blob) {
    blob.arrayBuffer().then((buf) => {
      this.result = buf;
      if (this.onloadend) this.onloadend();
    });
  }
}
global.FileReader = FileReaderPolyfill;

const projectRoot = path.resolve(__dirname, '..');

function exportToGLB(object, outputPath) {
  const exporter = new GLTFExporter();
  exporter.parse(
    object,
    (gltf) => {
      fs.mkdirSync(path.dirname(outputPath), { recursive: true });
      fs.writeFileSync(outputPath, Buffer.from(gltf));
      console.log(`Generated binary GLB: ${path.relative(projectRoot, outputPath)} (${gltf.byteLength} bytes)`);
    },
    (error) => {
      console.error(`Export error for ${outputPath}:`, error);
    },
    { binary: true }
  );
}

// 1. GENERATE REAL PLAYER CHARACTER (HUMANOID EXPLORER GLB)
function generatePlayerModel() {
  const root = new THREE.Group();
  root.name = 'Explorer_Character';

  const suitMat = new THREE.MeshStandardMaterial({
    color: 0x334458,
    roughness: 0.65,
    metalness: 0.25,
    name: 'Suit_Fabric'
  });
  const armorMat = new THREE.MeshStandardMaterial({
    color: 0xd4a52c, // SMP Gold
    roughness: 0.35,
    metalness: 0.85,
    name: 'SMP_Gold_Armor'
  });
  const visorMat = new THREE.MeshStandardMaterial({
    color: 0x38d9ff,
    emissive: 0x38d9ff,
    emissiveIntensity: 1.2,
    roughness: 0.1,
    name: 'Visor_Glow'
  });
  const metalDark = new THREE.MeshStandardMaterial({
    color: 0x222a36,
    roughness: 0.5,
    metalness: 0.9,
    name: 'Dark_Alloy'
  });

  // Hips
  const pelvis = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.25, 0.35), suitMat);
  pelvis.position.y = 0.8;
  pelvis.name = 'Hips';
  root.add(pelvis);

  // Chest
  const chest = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.65, 0.44), suitMat);
  chest.position.y = 0.45;
  chest.name = 'Chest';
  pelvis.add(chest);

  // Chest Armor Plate with SMP Accent
  const armorPlate = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.42, 0.12), armorMat);
  armorPlate.position.set(0, 0.05, 0.22);
  chest.add(armorPlate);

  // Temporal Reactor Core
  const reactor = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.08, 16), visorMat);
  reactor.rotation.x = Math.PI / 2;
  reactor.position.set(0, 0.05, 0.28);
  chest.add(reactor);

  // Atmospheric Life-Support Backpack
  const backpack = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.55, 0.24), metalDark);
  backpack.position.set(0, 0.05, -0.26);
  chest.add(backpack);

  // Neck & Helmet
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.12, 8), metalDark);
  neck.position.y = 0.38;
  chest.add(neck);

  const head = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.44, 0.42), suitMat);
  head.position.y = 0.24;
  head.name = 'Head';
  neck.add(head);

  // Curved Cybernetic Visor
  const visor = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.14, 0.16), visorMat);
  visor.position.set(0, 0.02, 0.18);
  head.add(visor);

  // Left Arm
  const armL = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.6, 0.2), suitMat);
  armL.name = 'LeftArm';
  armL.position.set(-0.46, 0.15, 0);
  const pauldronL = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.16, 0.26), armorMat);
  pauldronL.position.set(0, 0.22, 0);
  armL.add(pauldronL);
  chest.add(armL);

  // Right Arm
  const armR = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.6, 0.2), suitMat);
  armR.name = 'RightArm';
  armR.position.set(0.46, 0.15, 0);
  const pauldronR = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.16, 0.26), armorMat);
  pauldronR.position.set(0, 0.22, 0);
  armR.add(pauldronR);
  chest.add(armR);

  // Left Leg
  const legL = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.72, 0.26), suitMat);
  legL.name = 'LeftLeg';
  legL.position.set(-0.18, -0.45, 0);
  const bootL = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.2, 0.34), metalDark);
  bootL.position.set(0, -0.3, 0.04);
  legL.add(bootL);
  pelvis.add(legL);

  // Right Leg
  const legR = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.72, 0.26), suitMat);
  legR.name = 'RightLeg';
  legR.position.set(0.18, -0.45, 0);
  const bootR = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.2, 0.34), metalDark);
  bootR.position.set(0, -0.3, 0.04);
  legR.add(bootR);
  pelvis.add(legR);

  exportToGLB(root, path.join(projectRoot, 'public/assets/characters/player_explorer.glb'));
}

// 2. GENERATE NATURAL ENVIRONMENT 3D MODELS (ORGANIC TREES & FOLIAGE)
function generateNatureModels() {
  const treeRoot = new THREE.Group();
  treeRoot.name = 'Ancient_Tree_Reclaimed';
  const barkMat = new THREE.MeshStandardMaterial({ color: 0x42382e, roughness: 0.85, metalness: 0.05 });
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x3d6335, roughness: 0.7, side: THREE.DoubleSide });

  // Natural tapered trunk
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.65, 11, 10), barkMat);
  trunk.position.y = 5.5;
  treeRoot.add(trunk);

  // Root buttresses
  for (let i = 0; i < 4; i++) {
    const angle = (i * Math.PI) / 2 + 0.3;
    const root = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.25, 2.5, 6), barkMat);
    root.position.set(Math.cos(angle) * 0.6, 0.8, Math.sin(angle) * 0.6);
    root.rotation.z = Math.cos(angle) * 0.45;
    root.rotation.x = Math.sin(angle) * 0.45;
    treeRoot.add(root);
  }

  // Branch limbs and layered foliage clusters
  const branches = [
    { y: 6.0, rotZ: 0.55, rotY: 0.2, length: 2.8, folScale: 1.6 },
    { y: 7.5, rotZ: -0.5, rotY: 1.2, length: 3.2, folScale: 1.9 },
    { y: 8.8, rotZ: 0.4, rotY: -0.8, length: 2.4, folScale: 1.7 },
    { y: 10.0, rotZ: -0.25, rotY: 0.6, length: 2.0, folScale: 1.5 },
    { y: 10.8, rotZ: 0.1, rotY: 2.0, length: 1.8, folScale: 2.2 },
  ];

  branches.forEach(b => {
    const limb = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.2, b.length, 6), barkMat);
    limb.position.set(0, b.y, 0);
    limb.rotation.z = b.rotZ;
    limb.rotation.y = b.rotY;
    treeRoot.add(limb);

    const tip = new THREE.Vector3(0, b.length / 2, 0).applyEuler(limb.rotation);
    const cluster = new THREE.Mesh(new THREE.IcosahedronGeometry(b.folScale, 1), leafMat);
    cluster.position.set(tip.x, b.y + tip.y, tip.z);
    treeRoot.add(cluster);
  });

  exportToGLB(treeRoot, path.join(projectRoot, 'public/assets/nature/tree_ancient.glb'));

  // Mossy Boulder GLB
  const rockGeom = new THREE.IcosahedronGeometry(1.0, 1);
  const rockMat = new THREE.MeshStandardMaterial({ color: 0x48525e, roughness: 0.8, metalness: 0.15 });
  const rock = new THREE.Mesh(rockGeom, rockMat);
  rock.name = 'Mossy_Boulder';
  exportToGLB(rock, path.join(projectRoot, 'public/assets/nature/boulder_mossy.glb'));

  // Fern Cluster GLB
  const fernRoot = new THREE.Group();
  fernRoot.name = 'Fern_Cluster';
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI * 2) / 6;
    const frond = new THREE.Mesh(new THREE.PlaneGeometry(0.25, 0.8), leafMat);
    frond.position.set(Math.cos(angle) * 0.25, 0.35, Math.sin(angle) * 0.25);
    frond.rotation.y = angle;
    frond.rotation.x = Math.PI / 4.5;
    fernRoot.add(frond);
  }
  exportToGLB(fernRoot, path.join(projectRoot, 'public/assets/nature/fern_cluster.glb'));
}

// 3. GENERATE RESEARCH MACHINERY & ARCHITECTURE
function generateMachineryModels() {
  const steelMat = new THREE.MeshStandardMaterial({ color: 0x4a5568, roughness: 0.45, metalness: 0.8 });
  const darkAlloy = new THREE.MeshStandardMaterial({ color: 0x222a36, roughness: 0.55, metalness: 0.9 });
  const cyanEmissive = new THREE.MeshStandardMaterial({ color: 0x2cd5f5, emissive: 0x2cd5f5, emissiveIntensity: 1.0 });

  // Mechanical Door GLB
  const doorRoot = new THREE.Group();
  doorRoot.name = 'Security_Bulkhead_Door';
  const archL = new THREE.Mesh(new THREE.BoxGeometry(0.6, 5.0, 2.4), steelMat);
  archL.position.set(-1.8, 2.5, 0);
  const archR = new THREE.Mesh(new THREE.BoxGeometry(0.6, 5.0, 2.4), steelMat);
  archR.position.set(1.8, 2.5, 0);
  const archTop = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.8, 2.4), steelMat);
  archTop.position.set(0, 4.8, 0);

  const doorSlab = new THREE.Mesh(new THREE.BoxGeometry(3.0, 4.5, 1.8), darkAlloy);
  doorSlab.name = 'Sliding_Slab';
  doorSlab.position.set(0, 2.25, 0);
  const lockBar = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.16, 2.0), cyanEmissive);
  lockBar.position.y = 0;
  doorSlab.add(lockBar);

  doorRoot.add(archL, archR, archTop, doorSlab);
  exportToGLB(doorRoot, path.join(projectRoot, 'public/assets/machinery/door_bulkhead.glb'));

  // Terminal Console GLB
  const consoleRoot = new THREE.Group();
  consoleRoot.name = 'Research_Terminal_Console';
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.4, 1.2, 8), steelMat);
  base.position.y = 0.6;
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.45, 0.6), darkAlloy);
  head.position.set(0, 1.3, 0.15);
  head.rotation.x = -Math.PI / 6;
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.32), cyanEmissive);
  screen.position.set(0, 0.05, 0.31);
  head.add(screen);
  consoleRoot.add(base, head);
  exportToGLB(consoleRoot, path.join(projectRoot, 'public/assets/props/terminal_console.glb'));
}

generatePlayerModel();
generateNatureModels();
generateMachineryModels();
