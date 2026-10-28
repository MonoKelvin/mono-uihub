// site/modules/render_engine/postprocess.js
// Realistic-render post-processing chain. Composes bloom, depth-of-field,
// SSAO and FXAA over the main render pass so the output reads as a
// physically-graded photographic image rather than a flat viewport.
//
// The chain is fully optional and re-configurable at runtime. Every effect
// is created lazily and disabled by default; the UI only pays for passes it
// explicitly enables. SSAO in particular is expensive, so it starts off and
// the UI keeps it behind a toggle with a clear cost hint.
//
// Public API:
//   const pp = new PostPipeline(renderer);   // renderer = Renderer instance
//   pp.setSize(w, h);                        // call from ResizeObserver
//   pp.setExposure(v);                       // forwards to tone mapping
//   pp.render(scene, camera);
//   pp.setBloom({ enabled, intensity, threshold, radius });
//   pp.setDof({ enabled, focusDistance, focusRange, bokehScale });
//   pp.setSsao({ enabled, radius, intensity });
//   pp.setFxaa({ enabled });                 // cheap post AA (default on)
//   pp.getStats() -> { passes, bloom, dof, ssao };
//   pp.dispose();

import { THREE, EffectComposer, RenderPass, UnrealBloomPass, BokehPass,
         SSAOPass, OutputPass, ShaderPass, FXAAShader } from './three.js';

export class PostPipeline {
  constructor(renderer) {
    this.gl = renderer.inner;          // THREE.WebGLRenderer
    this.scene = null;
    this.camera = null;

    this.composer = new EffectComposer(this.gl);
    this.renderPass = new RenderPass(null, null);
    this.composer.addPass(this.renderPass);

    // OutputPass performs the tone-mapping + sRGB conversion at the END of
    // the chain (three r152+ moved output transform out of the renderer).
    this.outputPass = new OutputPass();
    this.composer.addPass(this.outputPass);

    // FXAA as the first anti-alias step (cheap, screen-space).
    this.fxaaPass = new ShaderPass(FXAAShader);
    this.fxaaPass.enabled = true;
    // Insert FXAA just before OutputPass so it runs on the LDR composite.
    this.composer.insertPass(this.fxaaPass, this.composer.passes.length - 1);

    // Lazy, disabled-by-default heavy passes.
    this._bloom = null;
    this._dof   = null;
    this._ssao  = null;

    this._state = {
      bloom: { enabled: false, intensity: 0.55, threshold: 0.85, radius: 0.4 },
      dof:   { enabled: false, focus: 3.0, aperture: 0.025, maxblur: 0.008 },
      ssao:  { enabled: false, radius: 8.0, minDistance: 0.005, maxDistance: 0.1 },
      fxaa:  { enabled: true },
    };

    this._dirty = false;
  }

  // ── wiring ──────────────────────────────────────────────────────────────

  setScene(scene)  { this.scene = scene; this.renderPass.scene = scene; }
  setCamera(camera){ this.camera = camera; this.renderPass.camera = camera; }

  setSize(w, h) {
    if (this.composer) this.composer.setSize(w, h);
  }

  setExposure(v) {
    // EffectComposer bypasses the renderer's own tone mapping in r152+, so
    // forward exposure through OutputPass (it reads renderer.toneMappingExposure).
    this.gl.toneMappingExposure = v;
  }

  // ── effect configuration ────────────────────────────────────────────────

  setBloom(opts = {}) {
    const s = this._state.bloom;
    for (const k of ['enabled', 'intensity', 'threshold', 'radius']) {
      if (k in opts) s[k] = opts[k];
    }
    this._ensureBloom();
    if (this._bloom) {
      this._bloom.enabled = s.enabled;
      this._bloom.strength = s.intensity;
      this._bloom.threshold = s.threshold;
      this._bloom.radius = s.radius;
    }
  }

  setDof(opts = {}) {
    const s = this._state.dof;
    for (const k of ['enabled', 'focus', 'aperture', 'maxblur']) {
      if (k in opts) s[k] = opts[k];
    }
    this._ensureDof();
    if (this._dof) {
      this._dof.enabled = s.enabled;
      this._dof.uniforms['focus'].value = s.focus;
      this._dof.uniforms['aperture'].value = s.aperture;
      this._dof.uniforms['maxblur'].value = s.maxblur;
    }
  }

  setSsao(opts = {}) {
    const s = this._state.ssao;
    for (const k of ['enabled', 'radius', 'minDistance', 'maxDistance']) {
      if (k in opts) s[k] = opts[k];
    }
    this._ensureSsao();
    if (this._ssao) {
      this._ssao.enabled = s.enabled;
      this._ssao.kernelRadius = s.radius;
      this._ssao.minDistance = s.minDistance;
      this._ssao.maxDistance = s.maxDistance;
    }
  }

  setFxaa(enabled) {
    this._state.fxaa.enabled = enabled;
    if (this.fxaaPass) this.fxaaPass.enabled = enabled;
  }

  // ── lazy pass creation ──────────────────────────────────────────────────

  _ensureBloom() {
    if (this._bloom) return;
    this._bloom = new UnrealBloomPass(new THREE.Vector2(256, 256),
                                      0.55, 0.85, 0.4);
    this._bloom.enabled = false;
    this.composer.addPass(this._bloom);
    // Bloom should run in HDR before tone mapping. Move it before OutputPass.
    this._moveBeforeOutput(this._bloom);
  }

  _ensureDof() {
    if (this._dof) return;
    this._dof = new BokehPass(this.scene || new THREE.Scene(),
                              this.camera || new THREE.PerspectiveCamera(),
                              { focus: 3.0, aperture: 0.025, maxblur: 0.008 });
    this._dof.enabled = false;
    this.composer.addPass(this._dof);
    this._moveBeforeOutput(this._dof);
  }

  _ensureSsao() {
    if (this._ssao) return;
    this._ssao = new SSAOPass(this.scene || new THREE.Scene(),
                              this.camera || new THREE.PerspectiveCamera(),
                              this.gl.domElement.width,
                              this.gl.domElement.height);
    this._ssao.enabled = false;
    this._ssao.kernelRadius = 8.0;
    this.composer.addPass(this._ssao);
    this._moveBeforeOutput(this._ssao);
  }

  _moveBeforeOutput(pass) {
    // Keep OutputPass as the LAST pass so tone mapping stays final.
    const idx = this.composer.passes.indexOf(pass);
    const outIdx = this.composer.passes.indexOf(this.outputPass);
    if (idx >= 0 && outIdx >= 0 && idx > outIdx) {
      this.composer.passes.splice(idx, 1);
      this.composer.passes.splice(outIdx, 0, pass);
    }
  }

  // ── render ──────────────────────────────────────────────────────────────

  render(scene, camera) {
    if (!this.composer) return;
    if (this.scene !== scene) this.setScene(scene);
    if (this.camera !== camera) this.setCamera(camera);

    // SSAO and DOF hold their own scene/camera references from construction
    // (which may be a fresh scene/camera). Re-point them each frame so they
    // stay in sync with the live graph.
    if (this._ssao && this._ssao.camera !== camera) this._ssao.camera = camera;
    if (this._ssao && this._ssao.scene !== scene)   this._ssao.scene = scene;
    if (this._dof && this._dof.camera !== camera)   this._dof.camera = camera;
    if (this._dof && this._dof.scene !== scene)     this._dof.scene = scene;

    this.composer.render();
  }

  // ── introspection ───────────────────────────────────────────────────────

  getStats() {
    return {
      passes: this.composer ? this.composer.passes.length : 0,
      bloom: this._state.bloom.enabled,
      dof:   this._state.dof.enabled,
      ssao:  this._state.ssao.enabled,
      fxaa:  this._state.fxaa.enabled,
    };
  }

  dispose() {
    if (this._bloom) this._bloom.dispose();
    if (this._dof)   this._dof.dispose();
    if (this._ssao)  this._ssao.dispose();
    if (this.composer) this.composer.dispose();
    this.composer = null;
  }
}
