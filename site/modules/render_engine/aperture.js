// site/modules/render_engine/aperture.js
// The top-level orchestrator. Owns the render loop, the Scene graph, and
// every sub-system. Exposes a narrow imperative API used by UI code.
//
// Everything is synchronous except model / HDRI loading — those return
// promises so the UI can show a loading state.

import { THREE } from './three.js';
import { Renderer } from './renderer.js';
import { CameraRig } from './camera.js';
import { Environment } from './environment.js';
import { Ground } from './ground.js';
import { Loader } from './models.js';
import { Snapshotter } from './snapshot.js';
import { PostPipeline } from './postprocess.js';

export class ApertureEngine {
  constructor({ canvas, models, hdris, presets }) {
    this.canvas = canvas;
    this.models = models || [];
    this.hdris  = hdris  || [];
    this.presets = presets || [];

    this.renderer = new Renderer(canvas);
    this.camera   = new CameraRig(canvas);
    this.scene    = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0d0f12);
    this.environment = new Environment(this.scene, this.renderer);
    this.ground = new Ground(this.scene, this.renderer);
    this.ground.addTo(this.scene);
    this.loader = new Loader();
    this.snapshotter = new Snapshotter(this.renderer);
    this.post = new PostPipeline(this.renderer);

    this._buildLights();

    this.currentModel = null;
    this.currentModelId = null;
    this.currentHdriId = null;
    this.currentPreset = this.presets[0] || null;
    this.spinSpeed = this.currentPreset ? this.currentPreset.spin : 0;
    this.shadowEnabled = true;
    this.floorVisible = true;
    this.exposure = 1.0;
    this._userExpFactor = 1;   // user multiplier, preserved across HDRI switches
    this._hdriExp = 1;         // current HDRI's calibration exposure
    this._envIntensity = 1.0;

    this.lastModelWasFallback = false;
    this.lastModelFallbackReason = null;
    this.lastHdriWasFallback = false;
    this.lastHdriFallbackReason = null;

    this.onTick = null;
    this._raf = null;
    this._lastTime = performance.now();
    this._fpsEma = 0;
    this._startLoop();
    // Keep the post chain's render targets in step with the canvas size.
    this.renderer.onResize = (w, h) => {
      if (this.post) this.post.setSize(w, h);
    };
  }

  _buildLights() {
    // Key: warm, hard-ish studio key with a soft shadow. Radius blurs the
    // PCFSoft map for believable penumbra instead of a hard terminator.
    const key = new THREE.DirectionalLight(0xfff2e2, 1.6);
    key.position.set(4, 6, 3);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.camera.near = 0.5;
    key.shadow.camera.far = 20;
    key.shadow.camera.left = -4;
    key.shadow.camera.right = 4;
    key.shadow.camera.top = 4;
    key.shadow.camera.bottom = -4;
    key.shadow.bias = -0.0003;
    key.shadow.normalBias = 0.03;
    key.shadow.radius = 7;
    this.scene.add(key);

    // Soft ambient: a hemisphere light lifts shadow floors out of pure black,
    // which is what makes a studio render read as "lit" rather than "contrasty".
    const hemi = new THREE.HemisphereLight(0xffffff, 0x22201c, 0.35);
    hemi.position.set(0, 4, 0);
    this.scene.add(hemi);

    const fill = new THREE.DirectionalLight(0xbcd4ff, 0.45);
    fill.position.set(-3, 2, -1);
    this.scene.add(fill);

    const rim = new THREE.DirectionalLight(0xffd9a8, 0.6);
    rim.position.set(-2, 3, -4);
    this.scene.add(rim);

    this._key = key;
    this._fill = fill;
    this._rim = rim;
    this._hemi = hemi;
  }

  // ── public API ───────────────────────────────────────────────────────────

  /**
   * Load a model from an entry in this.models (matched by id).
   * Falls back to a procedural placeholder on failure.
   */
  loadModel(id) {
    const def = this.models.find((m) => m.id === id);
    if (!def) return Promise.resolve(false);
    if (id === this.currentModelId && this.currentModel) return Promise.resolve(true);

    return this._loadUrl(def.file)
      .then((object) => {
        const group = this.camera.normaliseModel(object);
        if (this.currentModel) this._disposeModel(this.currentModel);
        this.currentModel = group;
        this.currentModelId = id;
        this.scene.add(group);
        this.applyPreset(this.currentPreset ? this.currentPreset.id : null);
        this._requestShadowRebuild();
        this.lastModelWasFallback = object.userData?.__renderFallback === true;
        this.lastModelFallbackReason = object.userData?.__renderFallbackReason || null;
        return true;
      })
      .catch(() => {
        console.error('[render_engine] unexpected load failure for', def.file);
        return false;
      });
  }

  /** Load a model from a raw URL (used for drag-and-drop uploads). */
  loadModelFromUrl(url) {
    return this._loadUrl(url)
      .then((object) => {
        const group = this.camera.normaliseModel(object);
        if (this.currentModel) this._disposeModel(this.currentModel);
        this.currentModel = group;
        this.currentModelId = null;
        this.scene.add(group);
        this.applyPreset(this.currentPreset ? this.currentPreset.id : null);
        this._requestShadowRebuild();
        this.lastModelWasFallback = object.userData?.__renderFallback === true;
        this.lastModelFallbackReason = object.userData?.__renderFallbackReason || null;
        return true;
      })
      .catch(() => false);
  }

  /** Load a model from a File/Blob (drag-and-drop from disk). */
  async loadModelFromFile(file) {
    try {
      const obj = await this.loader.loadFile(file);
      obj.userData.__renderFallback = false;
      const group = this.camera.normaliseModel(obj);
      if (this.currentModel) this._disposeModel(this.currentModel);
      this.currentModel = group;
      this.currentModelId = null;
      this.scene.add(group);
      this.applyPreset(this.currentPreset ? this.currentPreset.id : null);
      this._requestShadowRebuild();
      this.lastModelWasFallback = false;
      this.lastModelFallbackReason = null;
      return true;
    } catch (err) {
      console.warn('[render_engine] File load failed, using fallback', err);
      return this._loadFallbackModel(file.name || 'file');
    }
  }

  _loadUrl(url) {
    return new Promise((resolve) => {
      this.loader.load(url)
        .then((obj) => {
          obj.userData.__renderFallback = false;
          resolve(obj);
        })
        .catch((err) => {
          console.warn('[render_engine] model load failed, using procedural fallback',
            '\n  source:', url,
            '\n  error:', err && err.message);
          const fb = this.loader.fallbackModel();
          fb.userData.__renderFallback = true;
          fb.userData.__renderFallbackReason = (err && err.message) || 'unknown';
          resolve(fb);
        });
    });
  }

  _loadFallbackModel(name) {
    const fb = this.loader.fallbackModel();
    fb.userData.__renderFallback = true;
    fb.userData.__renderFallbackReason = 'file load failed';
    const group = this.camera.normaliseModel(fb);
    if (this.currentModel) this._disposeModel(this.currentModel);
    this.currentModel = group;
    this.currentModelId = null;
    this.scene.add(group);
    this.applyPreset(this.currentPreset ? this.currentPreset.id : null);
    this._requestShadowRebuild();
    this.lastModelWasFallback = true;
    this.lastModelFallbackReason = 'file load failed';
    return Promise.resolve(true);
  }

  loadHdri(id) {
    const def = this.hdris.find((h) => h.id === id);
    if (!def) return Promise.resolve(false);
    if (id === this.currentHdriId) return Promise.resolve(true);

    const apply = () => {
      this.currentHdriId = id;
      // Recompute the applied exposure from the new HDRI's calibration and
      // the user's preserved factor. Do NOT call setExposure here — that
      // would re-derive the factor and accumulate on every switch.
      this._hdriExp = def.exp;
      this.exposure = this._hdriExp * this._userExpFactor;
      this._applyExposure();
      this.environment.setSkybox(this.currentPreset && this.currentPreset.bg === 'env');
    };

    return this.environment.load(def.file)
      .then(() => {
        apply();
        this.lastHdriWasFallback = false;
        this.lastHdriFallbackReason = null;
        return true;
      })
      .catch((err) => {
        console.warn('[render_engine] HDRI load failed, applying procedural fallback',
          '\n  source:', def.file,
          '\n  error:', err && err.message);
        const ok = this.environment.applyFallbackSafe();
        apply();
        this.lastHdriWasFallback = !ok;
        this.lastHdriFallbackReason = (err && err.message) || 'pmrem or fetch failure';
        return true;
      });
  }

  _disposeModel(group) {
    this.scene.remove(group);
    group.traverse((o) => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) {
        if (Array.isArray(o.material)) o.material.forEach((m) => m.dispose());
        else o.material.dispose();
      }
    });
  }

  applyPreset(id) {
    if (!this.presets.length) return;
    const preset = this.presets.find((p) => p.id === id) || this.presets[0];
    this.currentPreset = preset;
    this.camera.applyPreset(preset);
    this.spinSpeed = preset.spin;
    this.ground.setVisible(preset.showFloor);
    this.floorVisible = preset.showFloor;
    this.environment.setSkybox(preset.bg === 'env');
  }

  /**
   * Set the applied exposure directly (what the UI slider shows).
   * Derives the user factor relative to the current HDRI so a later HDRI
   * switch preserves the user's relative brightness choice.
   */
  setExposure(v) {
    this.exposure = v;
    this._userExpFactor = this._hdriExp ? v / this._hdriExp : v;
    this._applyExposure();
  }

  /**
   * Set the user exposure factor (relative multiplier). Recomputes the
   * applied exposure against the current HDRI.
   */
  setExposureFactor(f) {
    this._userExpFactor = f;
    this.exposure = this._hdriExp * f;
    this._applyExposure();
  }

  _applyExposure() {
    this.renderer.renderer.toneMappingExposure = this.exposure;
  }

  setShadow(v) {
    this.shadowEnabled = v;
    this._key.castShadow = v;
    this.renderer.renderer.shadowMap.autoUpdate = v;
    this.renderer.renderer.shadowMap.needsUpdate = true;
  }

  // ── light-rig control (3-point studio lighting) ─────────────────────────

  setKeyLight(intensity)   { if (this._key)  this._key.intensity = intensity; }
  setFillLight(intensity)  { if (this._fill) this._fill.intensity = intensity; }
  setRimLight(intensity)   { if (this._rim)  this._rim.intensity = intensity; }

  setLightIntensities({ key, fill, rim } = {}) {
    if (key  !== undefined) this.setKeyLight(key);
    if (fill !== undefined) this.setFillLight(fill);
    if (rim  !== undefined) this.setRimLight(rim);
  }

  getLightIntensities() {
    return {
      key:  this._key  ? this._key.intensity  : null,
      fill: this._fill ? this._fill.intensity : null,
      rim:  this._rim  ? this._rim.intensity  : null,
    };
  }

  setEnvironmentIntensity(v) {
    // Environment IBL strength: scale envMapIntensity across all PBR mats.
    this._envIntensity = v;
    if (this.currentModel) {
      this.currentModel.traverse((o) => {
        if (o.isMesh && o.material) {
          const mats = Array.isArray(o.material) ? o.material : [o.material];
          for (const m of mats) {
            if (m.envMapIntensity !== undefined) m.envMapIntensity = v;
          }
        }
      });
    }
  }

  getEnvironmentIntensity() { return this._envIntensity ?? 1.0; }

  setFloorVisible(v) {
    this.floorVisible = v;
    this.ground.setVisible(v);
  }

  /** Toggle the procedural soft contact shadow under the model. */
  setContactShadow(v) {
    this.ground.setContactShadowVisible(v);
  }

  setContactShadowOpacity(v) {
    this.ground.setContactShadowOpacity(v);
  }

  setContactShadowBlur(v) {
    this.ground.setContactShadowBlur(v);
  }

  /** Toggle the continuous planar mirror reflection (Reflector). */
  setReflection(v) {
    this.ground.setReflectionVisible(v);
  }

  setReflectionStrength(v) {
    this.ground.setReflectionStrength(v);
  }

  setShadowSoftness(v) {
    // Radius on the PCFSoft shadow map blurs the directional-light penumbra.
    if (this._key) this._key.shadow.radius = v;
  }

  setSpin(v) { this.spinSpeed = v; }
  getSpin()   { return this.spinSpeed; }

  // ── post-processing API ─────────────────────────────────────────────────
  // All effects default to disabled; the UI enables them explicitly. Each
  // setter merges partial state and re-applies to the live pass.

  setBloom(opts)   { this.post.setBloom(opts); }
  setDof(opts)     { this.post.setDof(opts); }
  setSsao(opts)    { this.post.setSsao(opts); }
  setFxaa(enabled) { this.post.setFxaa(enabled); }
  getPostStats()   { return this.post.getStats(); }

  snapshot({ width, height } = {}) {
    return this.snapshotter.capture(this.scene, this.camera.camera, { width, height });
  }

  downloadSnapshot(result, filename = 'render.png') {
    this.snapshotter.download(result, filename);
  }

  // ── internals ────────────────────────────────────────────────────────────

  _requestShadowRebuild() {
    if (this.ground && this.ground.contact) {
      this.ground.contact.needsUpdate = true;
      this.ground.contact._renderCount = 0;
    }
  }

  _countTriangles() {
    let n = 0;
    this.scene.traverse((o) => {
      if (!o.isMesh || !o.visible || !o.geometry) return;
      const g = o.geometry;
      if (g.index) n += (g.index.count / 3) | 0;
      else if (g.attributes && g.attributes.position) n += (g.attributes.position.count / 3) | 0;
    });
    return n;
  }

  _countDrawCalls() {
    let n = 0;
    this.scene.traverse((o) => {
      if (o.isMesh && o.visible && o.geometry) n += 1;
    });
    return n;
  }

  _startLoop() {
    const tick = (now) => {
      const dt = Math.min((now - this._lastTime) / 1000, 0.05);
      this._lastTime = now;

      if (this.currentModel && this.spinSpeed > 0) {
        this.currentModel.rotation.y += this.spinSpeed * dt;
      }

      this.camera.update();

      // Real depth+blur contact shadow. Re-render every frame while spinning
      // (the silhouette moves); stop after a few static frames otherwise. A
      // fresh shadow is forced whenever the model changes (needsUpdate=true).
      const frames = this.spinSpeed > 0 ? Infinity : 4;
      this.ground.renderShadows(this.scene, frames);

      // Render through the post chain. OutputPass performs tone mapping +
      // sRGB at the end, so exposure stays correct in both paths.
      if (this.post && this.post.composer) {
        this.post.render(this.scene, this.camera.camera);
      } else {
        this.renderer.render(this.scene, this.camera.camera);
      }

      if (dt > 0) {
        const instFps = 1 / dt;
        this._fpsEma = this._fpsEma ? this._fpsEma * 0.9 + instFps * 0.1 : instFps;
      }

      if (this.onTick) {
        this.onTick(dt, {
          fps: this._fpsEma,
          // NOTE: when the post chain is active, renderer.info is overwritten
          // by the final fullscreen-quad passes (FXAA / OutputPass), so its
          // triangle & call counts are not the scene's. Count from the graph.
          drawCalls: this._countDrawCalls(),
          triangles: this._countTriangles(),
        });
      }

      this._raf = requestAnimationFrame(tick);
    };
    this._raf = requestAnimationFrame(tick);
  }

  dispose() {
    if (this._raf) cancelAnimationFrame(this._raf);
    this.environment.dispose();
    this.ground.dispose();
    if (this.post) this.post.dispose();
    this.renderer.dispose();
  }
}
