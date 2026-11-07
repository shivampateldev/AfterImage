import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export class ModelAssetPipeline {
  private static instance: ModelAssetPipeline;
  private loader: GLTFLoader = new GLTFLoader();
  private cache: Map<string, THREE.Group> = new Map();

  private constructor() {}

  public static getInstance(): ModelAssetPipeline {
    if (!ModelAssetPipeline.instance) {
      ModelAssetPipeline.instance = new ModelAssetPipeline();
    }
    return ModelAssetPipeline.instance;
  }

  /**
   * Asynchronously loads a binary GLB asset from the public assets directory with memory caching.
   */
  public async loadModel(path: string): Promise<THREE.Group> {
    if (this.cache.has(path)) {
      return this.cache.get(path)!.clone(true);
    }

    return new Promise((resolve, reject) => {
      this.loader.load(
        path,
        (gltf) => {
          // Traverse and configure PBR materials and shadow flags
          gltf.scene.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              const mesh = child as THREE.Mesh;
              mesh.castShadow = true;
              mesh.receiveShadow = true;
            }
          });
          this.cache.set(path, gltf.scene);
          resolve(gltf.scene.clone(true));
        },
        undefined,
        (error) => {
          console.warn(`ModelAssetPipeline: Failed to load ${path}, fallback initiated.`, error);
          reject(error);
        }
      );
    });
  }
}
