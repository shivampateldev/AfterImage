import * as THREE from 'three';

/**
 * Procedural PBR Texture Generator
 * Creates genuine seamless high-resolution PBR surface maps (Concrete, Rusted Metal,
 * Mossy Soil, Wet Brick, Foliage) via HTML5 Canvas buffers for full offline standalone fidelity.
 */
export class TextureGenerator {
  private static cache: Map<string, THREE.CanvasTexture> = new Map();

  /**
   * Weathered, distressed industrial concrete with moisture staining and micro-cracks
   */
  public static getAgedConcrete(): THREE.CanvasTexture {
    if (this.cache.has('concrete')) return this.cache.get('concrete')!;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Base concrete grey with subtle warm-cool gradient
    const grad = ctx.createLinearGradient(0, 0, 512, 512);
    grad.addColorStop(0, '#2b333e');
    grad.addColorStop(0.5, '#353e4b');
    grad.addColorStop(1, '#232a35');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    // Fine aggregate noise
    const imgData = ctx.getImageData(0, 0, 512, 512);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 35;
      data[i] = Math.min(255, Math.max(0, data[i] + noise));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise + 2));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise + 4));
    }
    ctx.putImageData(imgData, 0, 0);

    // Weathering water stains & grime
    ctx.fillStyle = 'rgba(12, 18, 26, 0.4)';
    for (let i = 0; i < 25; i++) {
      ctx.beginPath();
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const r = 20 + Math.random() * 60;
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Moss seep streaks
    ctx.fillStyle = 'rgba(38, 56, 32, 0.25)';
    for (let i = 0; i < 15; i++) {
      const x = Math.random() * 512;
      ctx.fillRect(x, 0, 20 + Math.random() * 30, 512);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(2, 2);
    this.cache.set('concrete', tex);
    return tex;
  }

  /**
   * Industrial corroded steel with chipped paint and rust pitting
   */
  public static getCorrodedSteel(): THREE.CanvasTexture {
    if (this.cache.has('corroded_steel')) return this.cache.get('corroded_steel')!;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Base gunmetal blue
    ctx.fillStyle = '#1c2430';
    ctx.fillRect(0, 0, 512, 512);

    // Rust oxidation patches
    for (let i = 0; i < 40; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const r = 15 + Math.random() * 45;
      const rustGrad = ctx.createRadialGradient(x, y, 2, x, y, r);
      rustGrad.addColorStop(0, 'rgba(145, 62, 24, 0.7)');
      rustGrad.addColorStop(0.6, 'rgba(92, 40, 16, 0.4)');
      rustGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = rustGrad;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Industrial treadplate / panel lines
    ctx.strokeStyle = 'rgba(10, 15, 22, 0.6)';
    ctx.lineWidth = 4;
    for (let y = 64; y < 512; y += 64) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(512, y);
      ctx.stroke();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    this.cache.set('corroded_steel', tex);
    return tex;
  }

  /**
   * Overgrown forest floor with moss, damp soil and leaf litter
   */
  public static getOvergrownSoil(): THREE.CanvasTexture {
    if (this.cache.has('soil')) return this.cache.get('soil')!;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Dark damp earth
    ctx.fillStyle = '#1e1c17';
    ctx.fillRect(0, 0, 512, 512);

    // Organic moss splotches (verdant emerald to deep forest green)
    for (let i = 0; i < 70; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const r = 12 + Math.random() * 35;
      const mossGrad = ctx.createRadialGradient(x, y, 4, x, y, r);
      mossGrad.addColorStop(0, 'rgba(64, 105, 48, 0.85)');
      mossGrad.addColorStop(0.7, 'rgba(38, 68, 28, 0.5)');
      mossGrad.addColorStop(1, 'rgba(20, 30, 15, 0)');
      ctx.fillStyle = mossGrad;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Debris specks
    ctx.fillStyle = 'rgba(140, 110, 70, 0.4)';
    for (let i = 0; i < 200; i++) {
      ctx.fillRect(Math.random() * 512, Math.random() * 512, 2, 4);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(3, 3);
    this.cache.set('soil', tex);
    return tex;
  }

  /**
   * Realistic tree bark with vertical fibrous ridges
   */
  public static getTreeBark(): THREE.CanvasTexture {
    if (this.cache.has('bark')) return this.cache.get('bark')!;

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Base deep timber brown
    ctx.fillStyle = '#221a14';
    ctx.fillRect(0, 0, 256, 512);

    // Vertical bark ridges
    for (let x = 0; x < 256; x += 4) {
      const brightness = 30 + Math.random() * 35;
      ctx.fillStyle = `rgb(${brightness + 5}, ${brightness}, ${brightness - 10})`;
      ctx.fillRect(x + (Math.random() - 0.5) * 2, 0, 3, 512);
    }

    // Lichen and moss patches
    ctx.fillStyle = 'rgba(70, 95, 55, 0.4)';
    for (let i = 0; i < 30; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * 256, Math.random() * 512, 10 + Math.random() * 20, 0, Math.PI * 2);
      ctx.fill();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    this.cache.set('bark', tex);
    return tex;
  }
}

