const fs = require('fs');
const path = require('path');
const THREE = require('three');
const { GLTFExporter } = require('three/examples/jsm/exporters/GLTFExporter.js');

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

// 1. GENERATE PLAYER MODEL
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
    color: 0xd4a52c,
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

  const pelvis = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.25, 0.35), suitMat);
  pelvis.position.y = 0.8;
  pelvis.name = 'Hips';
  root.add(pelvis);

  const chest = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.65, 0.44), suitMat);
  chest.position.y = 0.45;
  chest.name = 'Chest';
  pelvis.add(chest);

  const armorPlate = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.42, 0.12), armorMat);
  armorPlate.position.set(0, 0.05, 0.22);
  chest.add(armorPlate);

  const reactor = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.08, 16), visorMat);
  reactor.rotation.x = Math.PI / 2;
  reactor.position.set(0, 0.05, 0.28);
  chest.add(reactor);

  const backpack = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.55, 0.24), metalDark);
  backpack.position.set(0, 0.05, -0.26);
  chest.add(backpack);

  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.12, 8), metalDark);
  neck.position.y = 0.38;
  chest.add(neck);

  const head = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.44, 0.42), suitMat);
  head.position.y = 0.24;
  head.name = 'Head';
  neck.add(head);

  const visor = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.14, 0.16), visorMat);
  visor.position.set(0, 0.02, 0.18);
  head.add(visor);

  const armL = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.6, 0.2), suitMat);
  armL.name = 'LeftArm';
  armL.position.set(-0.46, 0.15, 0);
  const pauldronL = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.16, 0.26), armorMat);
  pauldronL.position.set(0, 0.22, 0);
  armL.add(pauldronL);
  chest.add(armL);

  const armR = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.6, 0.2), suitMat);
  armR.name = 'RightArm';
  armR.position.set(0.46, 0.15, 0);
  const pauldronR = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.16, 0.26), armorMat);
  pauldronR.position.set(0, 0.22, 0);
  armR.add(pauldronR);
  chest.add(armR);

  const legL = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.72, 0.26), suitMat);
  legL.name = 'LeftLeg';
  legL.position.set(-0.18, -0.45, 0);
  const bootL = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.2, 0.34), metalDark);
  bootL.position.set(0, -0.3, 0.04);
  legL.add(bootL);
  pelvis.add(legL);

  const legR = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.72, 0.26), suitMat);
  legR.name = 'RightLeg';
  legR.position.set(0.18, -0.45, 0);
  const bootR = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.2, 0.34), metalDark);
  bootR.position.set(0, -0.3, 0.04);
  legR.add(bootR);
  pelvis.add(legR);

  exportToGLB(root, path.join(projectRoot, 'public/assets/characters/player_explorer.glb'));
}

// 2. GENERATE BOTANICAL ORGANIC TREES
function generateNatureModels() {
  const treeRoot = new THREE.Group();
  treeRoot.name = 'Botanical_Organic_Tree';
  const barkMat = new THREE.MeshStandardMaterial({ color: 0x544336, roughness: 0.88, metalness: 0.04 });
  const leafMat = new THREE.MeshStandardMaterial({
    color: 0x4f7d3a,
    roughness: 0.62,
    metalness: 0.0,
    side: THREE.DoubleSide
  });

  const height = 11.0;
  const trunkCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0.25, height * 0.3, 0.1),
    new THREE.Vector3(-0.2, height * 0.65, -0.15),
    new THREE.Vector3(0.1, height * 0.9, 0.05),
    new THREE.Vector3(0, height, 0),
  ]);

  const trunk = new THREE.Mesh(new THREE.TubeGeometry(trunkCurve, 16, 0.42, 8, false), barkMat);
  treeRoot.add(trunk);

  for (let i = 0; i < 5; i++) {
    const angle = (i * Math.PI * 2) / 5 + 0.2;
    const rootCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(Math.cos(angle) * 0.4, 0.8, Math.sin(angle) * 0.4),
      new THREE.Vector3(Math.cos(angle) * 1.0, 0.2, Math.sin(angle) * 1.0),
      new THREE.Vector3(Math.cos(angle) * 2.2, -0.2, Math.sin(angle) * 2.2),
    ]);
    const root = new THREE.Mesh(new THREE.TubeGeometry(rootCurve, 8, 0.16, 6, false), barkMat);
    treeRoot.add(root);
  }

  const branches = [
    { y: 5.0, dir: new THREE.Vector3(1.2, 0.7, 0.4), len: 3.2, thick: 0.18 },
    { y: 6.5, dir: new THREE.Vector3(-1.4, 0.8, -0.3), len: 3.5, thick: 0.19 },
    { y: 8.0, dir: new THREE.Vector3(0.8, 0.9, -0.8), len: 2.8, thick: 0.16 },
    { y: 9.3, dir: new THREE.Vector3(-0.9, 1.0, 0.7), len: 2.4, thick: 0.14 },
    { y: 10.4, dir: new THREE.Vector3(0.3, 1.1, 0.2), len: 2.0, thick: 0.12 },
  ];

  branches.forEach(b => {
    const startPt = trunkCurve.getPoint(b.y / height);
    const endPt = startPt.clone().add(b.dir.clone().normalize().multiplyScalar(b.len));
    const branchCurve = new THREE.CatmullRomCurve3([
      startPt,
      startPt.clone().add(b.dir.clone().multiplyScalar(0.5)).add(new THREE.Vector3(0, 0.2, 0)),
      endPt,
    ]);
    const branchMesh = new THREE.Mesh(new THREE.TubeGeometry(branchCurve, 8, b.thick, 6, false), barkMat);
    treeRoot.add(branchMesh);

    const folGroup = new THREE.Group();
    folGroup.position.copy(endPt);
    for (let j = 0; j < 14; j++) {
      const card = new THREE.Mesh(
        new THREE.PlaneGeometry(0.85 + Math.random() * 0.4, 0.65 + Math.random() * 0.3),
        leafMat
      );
      card.position.set(
        (Math.random() - 0.5) * 2.2,
        (Math.random() - 0.3) * 1.8,
        (Math.random() - 0.5) * 2.2
      );
      card.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      folGroup.add(card);
    }
    treeRoot.add(folGroup);
  });

  exportToGLB(treeRoot, path.join(projectRoot, 'public/assets/nature/tree_ancient.glb'));

  const rockGeom = new THREE.IcosahedronGeometry(1.0, 2);
  const rockMat = new THREE.MeshStandardMaterial({ color: 0x5a6575, roughness: 0.8, metalness: 0.15 });
  const rock = new THREE.Mesh(rockGeom, rockMat);
  rock.name = 'Mossy_Boulder';
  exportToGLB(rock, path.join(projectRoot, 'public/assets/nature/boulder_mossy.glb'));

  const fernRoot = new THREE.Group();
  fernRoot.name = 'Fern_Cluster';
  for (let i = 0; i < 7; i++) {
    const angle = (i * Math.PI * 2) / 7;
    const frond = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.9), leafMat);
    frond.position.set(Math.cos(angle) * 0.28, 0.4, Math.sin(angle) * 0.28);
    frond.rotation.y = angle;
    frond.rotation.x = Math.PI / 4.2;
    fernRoot.add(frond);
  }
  exportToGLB(fernRoot, path.join(projectRoot, 'public/assets/nature/fern_cluster.glb'));
}

// 3. GENERATE COMPLETE INDUSTRIAL SLIDING BLAST DOOR (VISIBLE SOLID DOOR PANEL)
function generateMachineryModels() {
  const concreteMat = new THREE.MeshStandardMaterial({ color: 0x627387, roughness: 0.7, metalness: 0.15 });
  const frameSteel = new THREE.MeshStandardMaterial({ color: 0x3e4a5b, roughness: 0.45, metalness: 0.8 });
  const doorPanelSteel = new THREE.MeshStandardMaterial({ color: 0x242d3a, roughness: 0.4, metalness: 0.85 });
  const cyanEmissive = new THREE.MeshStandardMaterial({ color: 0x2cd5f5, emissive: 0x2cd5f5, emissiveIntensity: 1.2 });
  const amberEmissive = new THREE.MeshStandardMaterial({ color: 0xd4a52c, emissive: 0xd4a52c, emissiveIntensity: 1.0 });

  const gateRoot = new THREE.Group();
  gateRoot.name = 'Security_Bulkhead_Gate_System';

  // Surrounding concrete archway piers (anchored firmly to floor & ceiling)
  const pierL = new THREE.Mesh(new THREE.BoxGeometry(0.8, 5.5, 2.8), concreteMat);
  pierL.position.set(-1.8, 2.25, 0);
  const pierR = new THREE.Mesh(new THREE.BoxGeometry(0.8, 5.5, 2.8), concreteMat);
  pierR.position.set(1.8, 2.25, 0);

  // Mechanical Guide Rails running vertically along inner piers
  const railL = new THREE.Mesh(new THREE.BoxGeometry(0.2, 5.5, 0.3), frameSteel);
  railL.position.set(-1.3, 2.25, 0);
  const railR = new THREE.Mesh(new THREE.BoxGeometry(0.2, 5.5, 0.3), frameSteel);
  railR.position.set(1.3, 2.25, 0);

  // Heavy steel overhead lintel & hydraulic housing
  const lintel = new THREE.Mesh(new THREE.BoxGeometry(4.4, 1.2, 3.0), frameSteel);
  lintel.position.set(0, 4.6, 0);

  // Twin Hydraulic Actuator Cylinders
  const cylL = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 1.8, 8), frameSteel);
  cylL.position.set(-1.1, 4.1, 0.6);
  const cylR = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 1.8, 8), frameSteel);
  cylR.position.set(1.1, 4.1, 0.6);

  // Complete Visible Solid Sliding Blast Door Panel (occupies doorway when closed)
  const slidingSlab = new THREE.Group();
  slidingSlab.name = 'Sliding_Slab';
  slidingSlab.position.set(0, 1.8, 0);

  // Thick armored slab mesh
  const slabBody = new THREE.Mesh(new THREE.BoxGeometry(2.4, 3.8, 1.2), doorPanelSteel);
  slidingSlab.add(slabBody);

  // Heavy horizontal reinforcing armor bars (3 prominent bands)
  for (let b = -1.2; b <= 1.2; b += 1.2) {
    const rib = new THREE.Mesh(new THREE.BoxGeometry(2.44, 0.28, 1.3), frameSteel);
    rib.position.y = b;
    slidingSlab.add(rib);
  }

  // Cyan magnetic seal line
  const sealBar = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.14, 1.34), cyanEmissive);
  sealBar.position.set(0, 0, 0);
  slidingSlab.add(sealBar);

  // Amber hydraulic status beacon
  const beacon = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.1, 16), amberEmissive);
  beacon.rotation.x = Math.PI / 2;
  beacon.position.set(0, 1.3, 0.62);
  slidingSlab.add(beacon);

  gateRoot.add(pierL, pierR, railL, railR, lintel, cylL, cylR, slidingSlab);
  exportToGLB(gateRoot, path.join(projectRoot, 'public/assets/machinery/door_bulkhead.glb'));

  // Terminal Console (mounted neatly beside gate, human interaction height)
  const consoleRoot = new THREE.Group();
  consoleRoot.name = 'Research_Terminal_Console';
  const bracket = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.8, 0.2), frameSteel);
  bracket.position.set(0, 0.9, -0.2);
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.42, 0.35), doorPanelSteel);
  head.position.set(0, 1.15, 0.05);
  head.rotation.x = -Math.PI / 8;
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.28), cyanEmissive);
  screen.position.set(0, 0.05, 0.18);
  head.add(screen);
  consoleRoot.add(bracket, head);
  exportToGLB(consoleRoot, path.join(projectRoot, 'public/assets/props/terminal_console.glb'));
}

generatePlayerModel();
generateNatureModels();
generateMachineryModels();
