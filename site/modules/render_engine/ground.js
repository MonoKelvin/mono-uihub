// site/modules/render_engine/ground.js
// Studio floor: a large PBR circle + a real silhouette-accurate contact
// shadow + an optional planar Reflector (continuous mirror) for smooth,
// unbroken product reflections.
//
// The contact shadow is produced by the depth+blur algorithm in
// contact-shadows.js (ported from pmndrs/drei). The Reflector is a planar
// mirror that reflects the scene continuously — it never shows the
// "discontinuous" blotches a noise-roughness PBR floor does.
//
// API:
//   const g = new Ground(scene, renderer);
//   g.addTo(scene);
//   g.setVisible(false);
//   g.setReflectionVisible(true);
//   g.setShadowBlur(2.2);
//   g.renderShadows(scene);   // call from the render loop
//   g.dispose();

import { THREE, Reflector } from './three.js';
import { ContactShadows } from './contact-shadows.js';

const NOISE_SIZE = 256;

// Very subtle micro-roughness — just enough to break up the mirror, not so
// much that the env reflection turns blotchy and "discontinuous".
function buildFloorTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = NOISE_SIZE;
  const ctx = c.getContext('2d');
  const img = ctx.createImageData(NOISE_SIZE, NOISE_SIZE);
  const d = img.data;
  for (let y = 0; y < NOISE_SIZE; y++) {
    for (let x = 0; x < NOISE_SIZE; x++) {
      const v = 0.78 + 0.22 * Math.random();   // narrow band around 0.78–1.0
      const g = Math.max(0, Math.min(255, Math.round(v * 255)));
      const i = (y * NOISE_SIZE + x) * 4;
      d[i] = d[i + 1] = d[i + 2] = g;
      d[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(6, 6);
  tex.anisotropy = 8;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export class Ground {
  constructor(scene, renderer) {
    this.scene = scene;
    this.renderer = renderer;
    this.mesh = new THREE.Mesh();
    this._build();
    this._buildContactShadow();
    this._buildReflector();
  }

  _build() {
    const geo = new THREE.CircleGeometry(6, 96);
    const map = buildFloorTexture();
    const mat = new THREE.MeshStandardMaterial({
      color: 0xa3a6aa,
      roughness: 0.38,       // smooth: reflections stay continuous
      metalness: 0.35,       // metallic sheen so env reflection is strong
      map,
    });
    this.mesh.material = mat;
    this.mesh.geometry = geo;
    this.mesh.rotation.x = -Math.PI / 2;
    this.mesh.position.y = 0;
    this.mesh.receiveShadow = true;
    this.mesh.castShadow = false;
    this.mesh.userData.__isGroundMesh = true;
  }

  _buildContactShadow() {
    // Real depth+blur contact shadow (drei algorithm), sized to sit under
    // a normalised model (PRODUCT_RADIUS ≈ 1.0 in camera.js).
    this.contact = new ContactShadows({
      scene: this.scene,
      renderer: this.renderer,
      size: 4.5,
      resolution: 512,
      blur: 2.6,
      opacity: 1,
      far: 12,
      color: 0x000000,
      smooth: true,
    });
    this.contact.getPlane();
  }

  _buildReflector() {
    // Continuous planar mirror. Slightly faded so it reads as a glossy
    // studio floor rather than a pure mirror; blends with the PBR floor.
    this.reflector = new Reflector(new THREE.PlaneGeometry(12, 12), {
      textureWidth: 512,
      textureHeight: 512,
      color: 0x8890a0,
      clipBias: 0.003,
    });
    this.reflector.rotation.x = -Math.PI / 2;
    this.reflector.position.y = 0.001;
    this._reflectorOn = false;
    this.reflector.visible = false;       // off by default; UI can enable
    this.reflector.userData.__isReflector = true;
    this.reflector.userData.__isReflectorForSSR = false;
  }

  addTo(scene) {
    scene.add(this.mesh);
    scene.add(this.contact.getPlane());
    scene.add(this.reflector);
  }

  /** Render the contact shadow. Call every frame; `frames` caps frequency. */
  renderShadows(scene, frames = Infinity) {
    if (this.contact && this.mesh.visible) {
      this.contact.render(scene, frames);
    }
  }

  setContactShadowVisible(v) {
    if (this.contact) this.contact.setVisible(v);
  }

  setContactShadowOpacity(v) {
    if (this.contact) this.contact.setOpacity(v);
  }

  setContactShadowIntensity(v) {
    if (this.contact) this.contact.setIntensity(v);
  }

  getContactShadowIntensity() {
    return this.contact ? this.contact.getIntensity() : null;
  }

  setContactShadowBlur(v) {
    if (this.contact) this.contact.setBlur(v);
  }

  setContactShadowSize(v) {
    // Rebuild the composite plane geometry.
    if (this.contact) {
      this.contact.plane.geometry.dispose();
      const geo = new THREE.PlaneGeometry(v, v).rotateX(-Math.PI / 2);
      this.contact.plane.geometry = geo;
    }
  }

  /** Toggle the continuous planar mirror reflection. */
  setReflectionVisible(v) {
    this._reflectorOn = v;
    if (this.reflector) this.reflector.visible = v;
  }

  setReflectionStrength(v) {
    if (this.reflector && this.reflector.material && this.reflector.material.uniforms) {
      // Reflector uses a custom shader; we expose strength via color fade.
      const col = this.reflector.material.uniforms.color;
      if (col) {
        const base = new THREE.Color(0x8890a0);
        col.value = base.clone().lerp(new THREE.Color(0x000000), 1 - Math.min(1, Math.max(0, v)));
        // 0 → black reflector = mirror; but for usability we keep ≥ 0.25.
      }
      this.reflector.material.opacity = Math.min(1, Math.max(0.15, v));
      this.reflector.material.transparent = v < 1;
      this.reflector.material.needsUpdate = true;
    }
  }

  setVisible(v) {
    this.mesh.visible = v;
    // Contact shadow + reflector ride with the floor, but keep the
    // reflector's own toggle state independent of the floor toggle.
    if (this.contact) this.contact.setVisible(v);
    if (this.reflector) this.reflector.visible = v && this._reflectorOn;
  }

  /** Tune the floor PBR material. Accepts a partial {color, roughness, metalness}. */
  setMaterial({ color, roughness, metalness } = {}) {
    const m = this.mesh.material;
    if (color !== undefined)     m.color.set(color);
    if (roughness !== undefined) m.roughness = roughness;
    if (metalness !== undefined) m.metalness = metalness;
    m.needsUpdate = true;
  }

  getMaterial() {
    const m = this.mesh.material;
    return {
      color: '#' + m.color.getHexString(),
      roughness: m.roughness,
      metalness: m.metalness,
    };
  }

  dispose() {
    this.mesh.geometry.dispose();
    if (this.mesh.material.map) this.mesh.material.map.dispose();
    this.mesh.material.dispose();
    if (this.contact) this.contact.dispose();
    if (this.reflector) {
      this.reflector.geometry.dispose();
      if (this.reflector.material) this.reflector.material.dispose();
    }
  }
}
