// site/modules/render_engine/renderer.js
// Owns the WebGLRenderer. Physically-correct output, ACES tone mapping,
// PCFSoft shadows, device-pixel-ratio capped at 2. Respects CSS-sized
// parent — canvas backing store updates via ResizeObserver, CSS controls
// on-screen size.

import { THREE } from './three.js';

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
      // preserveDrawingBuffer stays false. snapshot() does a fresh render
      // pass right before toDataURL, so we don't pay for the retained buffer.
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.shadowMap.autoUpdate = true;

    this._observer = new ResizeObserver(() => this._onResize());
    this._observer.observe(canvas.parentElement);
    this.onResize = null;   // optional callback (used to resize the post chain)
    this._onResize();
  }

  /** The underlying THREE.WebGLRenderer (used by Snapshotter & PostPipeline). */
  get inner() { return this.renderer; }

  _onResize() {
    const parent = this.canvas.parentElement;
    const w = parent.clientWidth || 1;
    const h = parent.clientHeight || 1;
    this.renderer.setSize(w, h, false);
    if (this.onResize) this.onResize(w, h);
  }

  setSize(width, height) {
    this.renderer.setSize(width, height, false);
  }

  render(scene, camera) {
    this.renderer.render(scene, camera);
  }

  getDrawCalls()  { return this.renderer.info.render.calls; }
  getTriangles()  { return this.renderer.info.render.triangles; }

  dispose() {
    this._observer.disconnect();
    this.renderer.dispose();
  }
}
