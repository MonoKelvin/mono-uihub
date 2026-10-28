// site/modules/render_engine/models.js
// Format-aware model loader. Detects file type by extension and dispatches
// to the correct three.js loader. Also handles .obj + .mtl material
// loading and upgrading legacy materials to MeshStandardMaterial so that
// FBX / OBJ / STL assets — which ship with Lambert / Phong / Basic — still
// react correctly to PBR environment lighting.
//
// Public API:
//   Loader.load(url)              → Object3D, Promise
//   Loader.loadFile(File|Blob)    → Object3D, Promise (for drag-and-drop)
//   Loader.fallbackModel()        → Object3D, synchronous procedural stand-in

import { THREE, GLTFLoader, FBXLoader, OBJLoader, MTLLoader, STLLoader } from './three.js';

const EXT = (u) => (u.match(/\.[^.\\/]+$/) || ['.'])[0].toLowerCase();

const FALLBACK_COLOR = 0xb8bcc4;

/**
 * Detect the file type from an extension string. Returns one of:
 *   'glb' | 'gltf' | 'fbx' | 'obj' | 'stl' | 'unknown'
 */
export function detectFormat(url) {
  const ext = EXT(url);
  if (ext === '.glb' || ext === '.gltf') return 'glb';
  if (ext === '.fbx')                    return 'fbx';
  if (ext === '.obj')                    return 'obj';
  if (ext === '.stl')                    return 'stl';
  return 'unknown';
}

/**
 * Upgrade a mesh's material to MeshStandardMaterial, preserving its base
 * color where possible. Keeps map/normalMap/etc. if the original material
 * had them; otherwise sets a neutral gray with reasonable roughness.
 */
function upgradeToPBR(mesh, original) {
  if (original.isMeshStandardMaterial) return original;
  const mat = new THREE.MeshStandardMaterial({
    color: (original && original.color) ? original.color.clone() : new THREE.Color(FALLBACK_COLOR),
    metalness: 0.05,
    roughness: 0.65,
    envMapIntensity: 1.0,
  });
  // Carry over texture maps if present
  for (const k of ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'emissiveMap', 'aoMap', 'bumpMap']) {
    if (original && original[k]) {
      mat[k] = original[k];
      if (mat[k].needsUpdate !== undefined) mat[k].needsUpdate = true;
    }
  }
  if (original && original.map) {
    mat.color.set(0xffffff); // let the map drive color
    mat.needsUpdate = true;
  }
  return mat;
}

export class Loader {
  constructor() {
    this._gltf = new GLTFLoader();
    this._fbx  = new FBXLoader();
    this._obj  = new OBJLoader();
    this._stl  = new STLLoader();
    this._mtl  = new MTLLoader();
  }

  /**
   * Load a model file (GLB/OBJ/FBX/STL) from a URL.
   * Auto-detects format by extension.
   * For OBJ, tries to fetch a companion .mtl from the same directory.
   */
  load(url) {
    const fmt = detectFormat(url);
    switch (fmt) {
      case 'glb':    return this._loadGLB(url);
      case 'fbx':    return this._loadFBX(url);
      case 'obj':    return this._loadOBJ(url);
      case 'stl':    return this._loadSTL(url);
      default:
        // Default to GLB — the most common case in practice.
        return this._loadGLB(url);
    }
  }

  async _loadGLB(url) {
    const gltf = await this._gltf.loadAsync(url);
    return gltf.scene;
  }

  async _loadFBX(url) {
    // FBXLoader.loadAsync is not exposed, use callback wrapper.
    const obj = await new Promise((resolve, reject) => {
      this._fbx.load(url, resolve, undefined, reject);
    });
    this._upgradeMaterials(obj);
    return obj;
  }

  async _loadOBJ(url) {
    // Try to load a companion .mtl from the same directory. MTL textures
    // resolve relative to the MTL's own path, so we load the MTL by its
    // absolute URL and call setResourcePath (not setPath) so the MTL's own
    // directory is used as the base for any texture references.
    const obj = await this._obj.loadAsync(url);
    const mtlUrl = url.replace(/\.[^.]+$/, '.mtl');
    try {
      this._mtl.setResourcePath(mtlUrl.replace(/[^/]*$/, ''));
      const mtlData = await this._mtl.loadAsync(mtlUrl);
      obj.traverse((child) => {
        if (child.isMesh && child.material && mtlData.materials[child.material.name]) {
          child.material = mtlData.materials[child.material.name];
        }
      });
    } catch (_) {
      /* No companion MTL, or MTL/texture resolution failed — continue
         with the plain OBJ geometry and let upgradeToPBR assign a
         sensible MeshStandardMaterial. */
    }
    this._upgradeMaterials(obj);
    return obj;
  }

  async _loadSTL(url) {
    const geometry = await this._stl.loadAsync(url);
    geometry.computeVertexNormals();
    const mat = new THREE.MeshStandardMaterial({
      color: FALLBACK_COLOR,
      metalness: 0.0,
      roughness: 0.7,
      envMapIntensity: 1.0,
    });
    return new THREE.Mesh(geometry, mat);
  }

  /**
   * Load a model from a File / Blob (drag-and-drop path).
   * Sniffs the type from the file extension.
   */
  loadFile(file) {
    const fmt = detectFormat(file.name);
    const url = URL.createObjectURL(file);
    // Ensure OBJ's companion MTL lookup fails gracefully — the URL is a
    // blob: URL, so its "directory" doesn't contain an MTL.
    const finish = (obj) => {
      if (fmt === 'fbx' || fmt === 'obj' || fmt === 'stl') this._upgradeMaterials(obj);
      URL.revokeObjectURL(url);
      return obj;
    };
    switch (fmt) {
      case 'glb':    return this._gltf.loadAsync(url).then((g) => finish(g.scene));
      case 'fbx':    return new Promise((resolve, reject) => {
        this._fbx.load(url, (o) => resolve(finish(o)), undefined, reject);
      });
      case 'obj':    return this._obj.loadAsync(url).then((o) => finish(o));
      case 'stl':    return this._stl.loadAsync(url).then((g) => {
        g.computeVertexNormals();
        const m = new THREE.MeshStandardMaterial({ color: FALLBACK_COLOR, metalness: 0, roughness: 0.7, envMapIntensity: 1 });
        return finish(new THREE.Mesh(g, m));
      });
      default:       return this._gltf.loadAsync(url).then((g) => finish(g.scene));
    }
  }

  _upgradeMaterials(root) {
    root.traverse((child) => {
      if (!child.isMesh) return;
      const src = child.material;
      const upgraded = Array.isArray(src)
        ? src.map((m) => upgradeToPBR(child, m))
        : upgradeToPBR(child, src);
      child.material = upgraded;
      child.castShadow = true;
      child.receiveShadow = true;
    });
  }

  /**
   * Synchronous procedural stand-in for cases where the network load fails
   * and we still want a rendered object on screen.
   */
  fallbackModel() {
    const g = new THREE.Group();
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0xa0a4ac, metalness: 0.1, roughness: 0.6, envMapIntensity: 1,
    });
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xb08850, metalness: 0.8, roughness: 0.25, envMapIntensity: 1.2,
    });
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.42, 0.85, 12, 24), bodyMat);
    body.position.y = 0.85;
    body.castShadow = body.receiveShadow = true;
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.035, 12, 48), ringMat);
    ring.position.y = 0.42;
    ring.rotation.x = Math.PI / 2;
    ring.castShadow = ring.receiveShadow = true;
    g.add(body);
    g.add(ring);
    return g;
  }

  dispose() {
    this._gltf.dispose();
    this._obj.dispose();
    this._stl.dispose();
  }
}
