// site/modules/render_engine/environment.js
// Environment lighting. Two paths:
//   · load(url)      — pull an .hdr RGBE file through PMREM into a pre-filtered
//                      cube map; the PBR shader samples this every frame.
//   · applyFallback() — a procedural canvas gradient with two softboxes.
//                       Used when HDR loading fails (CORS under file://) or
//                       when PMREMGenerator refuses to init on the driver.
//
// PMREMGenerator is created LAZILY so that drivers where it throws at
// construction don't take the whole engine down.

import { THREE, RGBELoader } from './three.js';

export class Environment {
  constructor(scene, renderer) {
    this.scene = scene;
    this.renderer = renderer || null;   // THREE.WebGLRenderer — needed by PMREMGenerator
    this._pmrem = null;
    this._pmremFailed = false;
    this._current = null;
    this._currentMap = null;
    this._skyboxOn = false;
  }

  _getPmrem() {
    if (this._pmremFailed) return null;
    if (this._pmrem) return this._pmrem;
    // PMREMGenerator REQUIRES a WebGLRenderer. Passing a Scene (a common
    // mistake) makes it throw "this._renderer.compile is not a function"
    // on every driver — silently forcing the fallback env. Passing the
    // real renderer is what makes HDR reflections actually work.
    const gl = this.renderer && this.renderer.inner;
    if (!gl) {
      console.warn('[render_engine] no WebGLRenderer for PMREM, using fallback env');
      this._pmremFailed = true;
      return null;
    }
    try {
      this._pmrem = new THREE.PMREMGenerator(gl);
      return this._pmrem;
    } catch (err) {
      console.warn('[render_engine] PMREMGenerator unavailable, using fallback env', err);
      this._pmremFailed = true;
      return null;
    }
  }

  load(hdrUrl) {
    return new Promise((resolve, reject) => {
      new RGBELoader().load(
        hdrUrl,
        (texture) => {
          texture.mapping = THREE.EquirectangularReflectionMapping;
          const pmrem = this._getPmrem();
          if (!pmrem) { this._applySimple(texture); resolve(); return; }
          const mapped = pmrem.fromEquirectangular(texture);
          this._apply(texture, mapped);
          resolve();
        },
        undefined,
        (err) => reject(err),
      );
    });
  }

  applyFallback() {
    const W = 512, H = 256;
    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    const ctx = c.getContext('2d');
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0.00, '#4d6a8b');
    g.addColorStop(0.45, '#959fa8');
    g.addColorStop(0.55, '#6a6359');
    g.addColorStop(1.00, '#1d1f22');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    ctx.globalCompositeOperation = 'lighter';
    const blob = (cx, cy, r, alpha) => {
      const rg = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      rg.addColorStop(0, `rgba(255,245,225,${alpha})`);
      rg.addColorStop(1, 'rgba(255,245,225,0)');
      ctx.fillStyle = rg;
      ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
    };
    blob(110, 90,  80, 0.9);
    blob(400, 100, 70, 0.75);
    ctx.globalCompositeOperation = 'source-over';

    const tex = new THREE.CanvasTexture(c);
    tex.mapping = THREE.EquirectangularReflectionMapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    const pmrem = this._getPmrem();
    if (!pmrem) { this._applySimple(tex); return; }
    try {
      const mapped = pmrem.fromEquirectangular(tex);
      this._apply(tex, mapped);
    } catch (err) {
      console.warn('[render_engine] PMREM bake failed, using raw env texture', err);
      this._pmremFailed = true;
      this._applySimple(tex);
    }
  }

  _apply(rawTexture, pmremMap) {
    this._dispose();
    this.scene.environment = pmremMap;
    this._current = rawTexture;
    this._currentMap = pmremMap;
    this._applyBackground();
  }

  _applySimple(rawTexture) {
    this._dispose();
    this.scene.environment = rawTexture;
    this._current = rawTexture;
    this._applyBackground();
  }

  _applyBackground() {
    if (this._skyboxOn && this._current) {
      this.scene.background = this._current;
      this.scene.backgroundIntensity = 1;
    } else {
      this.scene.background = new THREE.Color(0x17191d);
      this.scene.backgroundIntensity = 1;
    }
  }

  setSkybox(visible) {
    this._skyboxOn = visible;
    this._applyBackground();
  }

  _dispose() {
    if (this._currentMap) { this._currentMap.dispose(); this._currentMap = null; }
    if (this._current)     { this._current.dispose();   this._current = null; }
  }

  applyFallbackSafe() {
    try { this.applyFallback(); return true; }
    catch (err) {
      console.warn('[render_engine] fallback env could not be applied', err);
      return false;
    }
  }

  dispose() {
    this._dispose();
    if (this._pmrem) this._pmrem.dispose();
  }
}
