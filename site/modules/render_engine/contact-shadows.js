// site/modules/render_engine/contact-shadows.js
// Silhouette-accurate soft contact shadows, ported from the canonical
// open-source algorithm (pmndrs/drei's <ContactShadows>). Not a hack:
//
//   1. Render the scene from a top-down orthographic camera with a depth
//      material that encodes (1 - viewZ) into alpha, colored by a uniform.
//   2. Blur that depth buffer horizontally then vertically with the classic
//      separable 9-tap Gaussian passes (three-stdlib blur shaders).
//   3. Optionally re-blur at 0.4× for a smoother core (drei's `smooth`).
//   4. Composite the result as a flat, transparent, unlit plane exactly on
//      the floor, under the model.
//
// The result is a shadow that follows the model's true silhouette and
// falls off continuously — no aliasing, no hard disk, no manual gradient.
//
// This module is plain three.js (no React / drei dependency). API:
//   const cs = new ContactShadows({ scene, renderer, size, resolution,
//                                   blur, opacity, far, color });
//   cs.render(scene);        // call once per frame while shadow is live
//   cs.setBlur(v); cs.setOpacity(v); cs.setColor(hex); cs.setSize(w,h);
//   cs.setVisible(bool); cs.getPlane(); cs.dispose();

import { THREE } from './three.js';

const HORIZONTAL_BLUR = {
  uniforms: { tDiffuse: { value: null }, h: { value: 1 / 512 } },
  vertexShader: /* glsl */`
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }`,
  fragmentShader: /* glsl */`
    uniform sampler2D tDiffuse;
    uniform float h;
    varying vec2 vUv;
    void main() {
      vec4 sum = vec4(0.0);
      sum += texture2D(tDiffuse, vec2(vUv.x - 4.0 * h, vUv.y)) * 0.051;
      sum += texture2D(tDiffuse, vec2(vUv.x - 3.0 * h, vUv.y)) * 0.0918;
      sum += texture2D(tDiffuse, vec2(vUv.x - 2.0 * h, vUv.y)) * 0.12245;
      sum += texture2D(tDiffuse, vec2(vUv.x - 1.0 * h, vUv.y)) * 0.1531;
      sum += texture2D(tDiffuse, vec2(vUv.x,            vUv.y)) * 0.1633;
      sum += texture2D(tDiffuse, vec2(vUv.x + 1.0 * h, vUv.y)) * 0.1531;
      sum += texture2D(tDiffuse, vec2(vUv.x + 2.0 * h, vUv.y)) * 0.12245;
      sum += texture2D(tDiffuse, vec2(vUv.x + 3.0 * h, vUv.y)) * 0.0918;
      sum += texture2D(tDiffuse, vec2(vUv.x + 4.0 * h, vUv.y)) * 0.051;
      gl_FragColor = sum;
    }`,
};

const VERTICAL_BLUR = {
  uniforms: { tDiffuse: { value: null }, v: { value: 1 / 512 } },
  vertexShader: /* glsl */`
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }`,
  fragmentShader: /* glsl */`
    uniform sampler2D tDiffuse;
    uniform float v;
    varying vec2 vUv;
    void main() {
      vec4 sum = vec4(0.0);
      sum += texture2D(tDiffuse, vec2(vUv.x, vUv.y - 4.0 * v)) * 0.051;
      sum += texture2D(tDiffuse, vec2(vUv.x, vUv.y - 3.0 * v)) * 0.0918;
      sum += texture2D(tDiffuse, vec2(vUv.x, vUv.y - 2.0 * v)) * 0.12245;
      sum += texture2D(tDiffuse, vec2(vUv.x, vUv.y - 1.0 * v)) * 0.1531;
      sum += texture2D(tDiffuse, vec2(vUv.x, vUv.y))            * 0.1633;
      sum += texture2D(tDiffuse, vec2(vUv.x, vUv.y + 1.0 * v)) * 0.1531;
      sum += texture2D(tDiffuse, vec2(vUv.x, vUv.y + 2.0 * v)) * 0.12245;
      sum += texture2D(tDiffuse, vec2(vUv.x, vUv.y + 3.0 * v)) * 0.0918;
      sum += texture2D(tDiffuse, vec2(vUv.x, vUv.y + 4.0 * v)) * 0.051;
      gl_FragColor = sum;
    }`,
};

export class ContactShadows {
  constructor({ scene, renderer, size = 8, resolution = 512, blur = 2.2,
                opacity = 1, far = 10, color = 0x000000, smooth = true }) {
    this.scene = scene;
    this.gl = renderer.inner;

    this._blur = blur;
    this._opacity = opacity;
    this._color = color;
    this._smooth = smooth;
    this._visible = true;
    this._disposed = false;
    this._renderCount = 0;
    this.needsUpdate = true;

    // drei maps shadow alpha to (1 - fragCoordZ), i.e. how HIGH above the
    // floor the object's surface is, normalised by the shadow camera's far
    // plane. With the default far=12 that yields only a few percent alpha in
    // the model's height band — a black spec on a bright floor is invisible.
    // We expose an intensity multiplier on the alpha so the shadow reads as a
    // real occlusion (default 4 ≈ 0.8 max alpha at the model's visible range).
    this._intensity = 4;

    const w = size, h = size;

    this.renderTarget = new THREE.WebGLRenderTarget(resolution, resolution);
    this.renderTargetBlur = new THREE.WebGLRenderTarget(resolution, resolution);
    this.renderTarget.texture.generateMipmaps = false;
    this.renderTargetBlur.texture.generateMipmaps = false;

    // Top-down orthographic camera. The blur passes and the depth pass share
    // this camera so UVs and coverage line up exactly.
    this.shadowCamera = new THREE.OrthographicCamera(-w / 2, w / 2, h / 2, -h / 2, 0.01, far);
    this.shadowCamera.position.set(0, far, 0);
    this.shadowCamera.lookAt(0, 0, 0);
    this.shadowCamera.updateMatrixWorld();
    this.far = far;

    // Depth material: encode (1 - fragCoordZ) into alpha, tint by color.
    // THREE.BasicDepthPacking is REQUIRED: it makes the fragment shader
    // output `vec4( vec3( 1.0 - fragCoordZ ), opacity );` — exactly the
    // string onBeforeCompile replaces. The default RGBADepthPacking (3201)
    // compiles to `packDepthToRGBA(fragCoordZ)`, whose packed RGB renders
    // as a solid/black plane, which is why an earlier iteration composited
    // opaque black over the floor.
    // The color uniform is a LIVE object so setColor() works without a
    // recompile — onBeforeCompile binds it by reference.
    this._colorUni = { value: new THREE.Color(color) };
    const depthMaterial = new THREE.MeshDepthMaterial({
      depthPacking: THREE.BasicDepthPacking,
    });
    this._depthSrc = 'vec4( vec3( 1.0 - fragCoordZ ), opacity );';
    this._intensityUni = { value: this._intensity };
    depthMaterial.onBeforeCompile = (shader) => {
      shader.uniforms.ucolor = this._colorUni;
      shader.uniforms.uintensity = this._intensityUni;
      shader.fragmentShader = shader.fragmentShader.replace(
        'void main() {',
        `uniform vec3 ucolor;
         uniform float uintensity;
         void main() {`,
      );
      // Robust replace: match regardless of the exact whitespace three emits
      // (it has changed across minor versions). Fail LOUDLY so a silent
      // regressions never produces an opaque plane again.
      const re = /\s*vec4\s*\(\s*vec3\s*\(\s*1\.0\s*-\s*fragCoordZ\s*\)\s*,\s*opacity\s*\)\s*;/;
      const hit = re.test(shader.fragmentShader);
      if (!hit) {
        console.warn('[contact-shadows] depth fragment encode pattern not found;',
          'shadow colours will be wrong. (three.js depth shader changed?)');
      }
      shader.fragmentShader = shader.fragmentShader.replace(
        re,
        'vec4( ucolor * fragCoordZ * 2.0, ( 1.0 - fragCoordZ ) * uintensity );',
      );
    };
    this.depthMaterial = depthMaterial;

    // Blur quad + the two separable blur materials. The quad is rendered
    // through a DEDICATED camera whose frustum exactly matches the 2×2 quad
    // (−1..1), NOT through the shadow ortho camera: that frustum spans
    // ±size/2 and its far plane sits exactly at the quad's y=0 at distance
    // `far`, so the quad gets depth-clipped and the blur writes nothing
    // (the RT then composites garbage). A dedicated ortho looking down −Z
    // with the quad mid-frustum can never clip.
    const blurGeo = new THREE.PlaneGeometry(2, 2);
    this.blurPlane = new THREE.Mesh(blurGeo);
    // MUST stay visible: we render it standalone via gl.render(object, camera)
    // (it is never added to a scene), and three's projectObject skips
    // invisible objects → the blur passes would write nothing.
    this.blurPlane.visible = true;
    this.blurCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.001, 2);
    this.blurCamera.position.set(0, 0, 0.5);
    this.blurCamera.lookAt(0, 0, 0);
    this.blurCamera.updateMatrixWorld();
    this.hBlur = new THREE.ShaderMaterial(HORIZONTAL_BLUR);
    this.vBlur = new THREE.ShaderMaterial(VERTICAL_BLUR);
    this.hBlur.depthTest = this.vBlur.depthTest = false;
    this.hBlur.depthWrite = this.vBlur.depthWrite = false;

    // Composite plane: the literally-visible shadow, laid flat on the floor.
    const planeGeo = new THREE.PlaneGeometry(w, h).rotateX(-Math.PI / 2);
    const planeMat = new THREE.MeshBasicMaterial({
      map: this.renderTarget.texture,
      transparent: true,
      opacity,
      depthWrite: false,
      toneMapped: false,
    });
    this.plane = new THREE.Mesh(planeGeo, planeMat);
    this.plane.position.y = 0.004;
    this.plane.renderOrder = 1;
    this.plane.userData.__isContactShadow = true;
  }

  /** Re-render the depth buffer and composite the blurred shadow plane.
   *  `frames` semantics mirror drei: pass Infinity for every frame, or an
   *  integer N to re-render N times then stay static (the caller flips
   *  `needsUpdate` when the model / spin changes). */
  render(scene, frames = Infinity) {
    if (this._disposed) return;
    if (frames !== Infinity) {
      if (this._renderCount >= frames && !this.needsUpdate) return;
      this._renderCount = (this._renderCount || 0) + 1;
      this.needsUpdate = false;
    }

    // Hide everything that must not participate in the depth pass:
    //  - our own composite plane (would occlude / z-fight)
    //  - the floor / ground mesh (it would fill the whole RT with near depth)
    //  - planar Reflector (its onBeforeRender re-renders the scene → recursion)
    //  - SSR / metalness helper meshes (they re-render too)
    const hidden = [];
    const hide = (o) => {
      if (o.visible) { hidden.push([o, o.visible]); o.visible = false; }
    };
    hide(this.plane);
    scene.traverse((o) => {
      if (o.userData && (o.userData.__isReflector || o.userData.__isReflectorForSSR ||
          o.userData.__isGroundMesh)) hide(o);
    });

    this._blurPass(scene, this._blur);
    if (this._smooth) this._blurPass(scene, this._blur * 0.4);

    this.plane.visible = this._visible;
    for (const [o, v] of hidden) o.visible = v;
    this.plane.material.needsUpdate = true;
  }

  _blurPass(scene, blur) {
    const gl = this.gl;
    scene.overrideMaterial = this.depthMaterial;

    // three fills the render target:
    //   (a) with scene.background (opaque studio colour) OR, when background
    //       is null, with the renderer's own clearColour/clearAlpha — and our
    //       Renderer sets clearAlpha = 1 to paint the opaque studio backdrop
    //       every frame. Either way the RT clears OPAQUE, so any region the
    //       model doesn't cover composites solid dark.
    //   (b) We must clear TRANSPARENT (alpha 0) so the blur only writes the
    //       model's silhouette + falloff.
    // I both null background/environment AND temporarily set the renderer's
    // clear alpha to 0 for the duration of the depth pass.
    const savedBg = scene.background;
    const savedEnv = scene.environment;
    scene.background = null;
    scene.environment = null;
    const savedClearColor = new THREE.Color();
    gl.getClearColor(savedClearColor);
    const savedClearAlpha = gl.getClearAlpha();
    gl.setClearColor(0x000000, 0);

    gl.setRenderTarget(this.renderTarget);
    gl.render(scene, this.shadowCamera);

    gl.setClearColor(savedClearColor, savedClearAlpha);
    scene.background = savedBg;
    scene.environment = savedEnv;
    scene.overrideMaterial = null;

    // Horizontal blur: read RT → write RT_Blur.
    this.hBlur.uniforms.tDiffuse.value = this.renderTarget.texture;
    this.hBlur.uniforms.h.value = blur * (1 / 256);
    this.blurPlane.material = this.hBlur;
    gl.setClearColor(0x000000, 0);
    gl.setRenderTarget(this.renderTargetBlur);
    gl.clear();
    gl.render(this.blurPlane, this.blurCamera);

    // Vertical blur: read RT_Blur → write RT. Produces the final shadow.
    this.vBlur.uniforms.tDiffuse.value = this.renderTargetBlur.texture;
    this.vBlur.uniforms.v.value = blur * (1 / 256);
    this.blurPlane.material = this.vBlur;
    gl.setRenderTarget(this.renderTarget);
    gl.clear();
    gl.render(this.blurPlane, this.blurCamera);

    gl.setRenderTarget(null);
  }

  // ── setters ──────────────────────────────────────────────────────────────

  setBlur(v)    { this._blur = v; }
  setOpacity(v) {
    this._opacity = v;
    if (this.plane.material) this.plane.material.opacity = v;
  }
  setColor(hex) {
    this._color = hex;
    if (this._colorUni && this._colorUni.value) {
      this._colorUni.value.set(hex);
    }
  }
  setIntensity(v) {
    this._intensity = v;
    if (this._intensityUni) this._intensityUni.value = v;
  }
  getIntensity() { return this._intensity; }
  setVisible(v) {
    this._visible = v;
    this.plane.visible = v;
  }
  getPlane() { return this.plane; }

  dispose() {
    this._disposed = true;
    this.renderTarget.dispose();
    this.renderTargetBlur.dispose();
    this.plane.geometry.dispose();
    this.plane.material.dispose();
    this.blurPlane.geometry.dispose();
    this.hBlur.dispose();
    this.vBlur.dispose();
    this.depthMaterial.dispose();
  }
}
