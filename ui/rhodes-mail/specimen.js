/* Three.js r160, loaded by CDN in index.html. Faceted mineral geometry, PBR
   transmission and a local thickness/backlight approximation of subsurface
   scattering (not a screen-space diffusion or path-traced SSS solver). */
(() => {
  'use strict';
  const THREE = window.THREE;
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  const hash = (n) => { const value = Math.sin(n * 127.1 + 311.7) * 43758.5453; return value - Math.floor(value); };

  function crystalGeometry(radius, height, seed, tip = .58) {
    // A seeded crystal: irregular polygon cross-section (5-7 sides), a centreline that
    // wanders, per-ring size jitter and a slanted truncated cap. The result reads as a
    // raw grown shard rather than a machined prism. Two outline points flank each corner
    // so the broad faces stay separated by real bevels. tip sets the crown width: high
    // keeps the shard a chunky block, low slims it into a crystal spur.
    const rand = (n) => hash(seed * 1.619 + n * 3.17 + 11.3);
    const sides = 5 + Math.floor(rand(0) * 3);
    const corners = Array.from({ length: sides }, (_, i) => {
      const angle = (i / sides) * Math.PI * 2 + (rand(i + 1) - .5) * (Math.PI / sides) * .95;
      const reach = .6 + rand(i + 41) * .66;
      return { x: Math.cos(angle) * reach, z: Math.sin(angle) * reach };
    });
    const outline = [];
    corners.forEach((corner, i) => {
      const previous = corners[(i + sides - 1) % sides], next = corners[(i + 1) % sides];
      const bevel = .08 + rand(i + 83) * .09;
      outline.push({ x: corner.x + (previous.x - corner.x) * bevel, z: corner.z + (previous.z - corner.z) * bevel, corner: i });
      outline.push({ x: corner.x + (next.x - corner.x) * bevel, z: corner.z + (next.z - corner.z) * bevel, corner: i });
    });
    const perRing = outline.length;
    // Vertical profile: a chipped root flares to the full body, a near-straight shaft, then
    // a shoulder that breaks to a wide truncated crown. A high tip keeps the shard blocky;
    // a low tip slims it toward a crystal spur. radiusScale is jittered per band.
    const segments = 9;
    const rows = [];
    for (let s = 0; s <= segments; s++) {
      const t = s / segments;
      const body = t < .12 ? .72 + (t / .12) * .28 : 1 - (t - .12) * .12;
      const shoulder = Math.max(.06, 1 - (t - .66) / .34 * (1 - tip));
      const r = (t < .66 ? body : Math.min(body, shoulder)) * (.9 + rand(300 + s) * .16);
      rows.push({ t, r, y: (t - .5) * height });
    }
    // Centreline random walk, anchored at the root and growing toward the tip, plus a
    // slant applied to the upper rings so the crown is a broken plane, not a flat lid.
    let driftX = 0, driftZ = 0;
    const axis = rows.map((row, s) => {
      driftX += (rand(400 + s) - .5) * radius * .16;
      driftZ += (rand(500 + s) - .5) * radius * .16;
      return { x: driftX * row.t, z: driftZ * row.t };
    });
    const tiltX = (rand(700) - .5) * .55, tiltZ = (rand(701) - .5) * .55;
    const rings = rows.map((row, s) => outline.map((point, k) => {
      const localX = point.x * radius * row.r, localZ = point.z * radius * row.r;
      const jitter = (hash(seed + s * 7.13 + k * 3.37) - .5) * radius * .055;
      const slant = (localX * tiltX + localZ * tiltZ) * row.t * row.t * .4;
      return new THREE.Vector3(localX + axis[s].x + jitter, row.y + slant, localZ + axis[s].z + jitter);
    }));
    const positions = [], uvs = [], thicknesses = [], groups = [];
    const triangle = (a, b, c, uvA, uvB, uvC, thickness, material) => {
      const start = positions.length / 3;
      [a,b,c].forEach((p) => positions.push(p.x,p.y,p.z));
      [uvA,uvB,uvC].forEach((uv) => uvs.push(...uv));
      thicknesses.push(...thickness);
      groups.push({ start, count: 3, materialIndex: material });
    };
    for (let ring = 0; ring < rings.length - 1; ring++) {
      for (let i = 0; i < perRing; i++) {
        const j = (i + 1) % perRing, u = i / perRing, v = (i + 1) / perRing;
        const lower = rows[ring].t, upper = rows[ring + 1].t;
        const t0 = radius * rows[ring].r * 1.8, t1 = radius * rows[ring + 1].r * 1.8;
        const material = outline[i].corner % 2 === 0 ? 1 : ring >= segments - 3 ? 2 : 0;
        triangle(rings[ring][i], rings[ring + 1][i], rings[ring][j], [u,lower], [u,upper], [v,lower], [t0,t1,t0], material);
        triangle(rings[ring][j], rings[ring + 1][i], rings[ring + 1][j], [v,lower], [u,upper], [v,upper], [t0,t1,t1], material);
      }
    }
    [0,rings.length - 1].forEach((ring) => {
      const center = rings[ring].reduce((sum,p) => sum.add(p), new THREE.Vector3()).multiplyScalar(1 / perRing);
      for (let i = 0; i < perRing; i++) {
        const j = (i + 1) % perRing;
        const a = rings[ring][ring === 0 ? i : j], b = rings[ring][ring === 0 ? j : i];
        triangle(center,a,b,[.5,.5],[0,0],[1,0],Array(3).fill(radius * rows[ring].r * 1.8),2);
      }
    });
    // Group by material so each crystal needs three draw calls, not one per face.
    const geometry = new THREE.BufferGeometry();
    const index = [];
    for (let material = 0; material < 3; material++) {
      const start = index.length;
      groups.filter((group) => group.materialIndex === material).forEach((group) => index.push(group.start,group.start + 1,group.start + 2));
      geometry.addGroup(start,index.length - start,material);
    }
    geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
    geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));
    geometry.setAttribute('mineralThickness',new THREE.Float32BufferAttribute(thicknesses,1));
    geometry.setIndex(index);
    geometry.computeVertexNormals();
    geometry.computeBoundingSphere();
    return geometry;
  }

  function mineralSurface() {
    const size = 256, pixels = new Uint8Array(size * size * 4);
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      const growth = Math.sin(y * .49 + Math.sin(x * .075) * .7) * 8;
      const grain = (hash(y * size + x) - .5) * 13;
      pixels[i] = 145 + growth + grain;
      pixels[i + 1] = 172 + growth * .65 + grain;
      pixels[i + 2] = 0; pixels[i + 3] = 255;
    }
    const texture = new THREE.DataTexture(pixels,size,size);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.magFilter = THREE.LinearFilter;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.generateMipmaps = true;
    // Surface data stays linear; it is not an sRGB color map.
    texture.needsUpdate = true;
    return texture;
  }

  function scatterMaterial(parameters) {
    const material = new THREE.MeshPhysicalMaterial(parameters);
    material.onBeforeCompile = (shader) => {
      shader.vertexShader = shader.vertexShader.replace('#include <common>',`#include <common>
        attribute float mineralThickness;
        varying float vMineralThickness;`)
        .replace('#include <begin_vertex>',`#include <begin_vertex>
        vMineralThickness = mineralThickness;`);
      shader.fragmentShader = shader.fragmentShader.replace('#include <common>',`#include <common>
        varying float vMineralThickness;`)
        .replace('#include <lights_physical_pars_fragment>',`#include <lights_physical_pars_fragment>
        void RE_Direct_Mineral(const in IncidentLight directLight, const in vec3 geometryPosition,
          const in vec3 geometryNormal, const in vec3 geometryViewDir,
          const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material,
          inout ReflectedLight reflectedLight) {
          RE_Direct_Physical(directLight, geometryPosition, geometryNormal, geometryViewDir,
            geometryClearcoatNormal, material, reflectedLight);
          // Backlighting is attenuated by local optical thickness, and uses the
          // incident light after Three.js applies distance and shadow attenuation.
          float back = max(dot(-geometryNormal, directLight.direction), 0.0);
          vec3 bentLight = normalize(directLight.direction + geometryNormal * 0.28);
          float forward = pow(max(dot(geometryViewDir, -bentLight), 0.0), 3.0);
          // Red survives the mineral's optical depth longer than green or blue.
          vec3 absorption = exp(-vec3(1.6, 6.8, 5.2) * vMineralThickness);
          vec3 scatter = vec3(0.9, 0.05, 0.08) * absorption * back * (0.3 + forward) * 0.55;
          reflectedLight.directDiffuse += directLight.color * scatter * RECIPROCAL_PI;
        }
        #undef RE_Direct
        #define RE_Direct RE_Direct_Mineral`)
        .replace('#include <lights_physical_fragment>',`#include <lights_physical_fragment>
        #ifdef USE_TRANSMISSION
          material.thickness = max(vMineralThickness, 0.01);
          // The dense body stays dark; thin bevels and tips reveal the red interior.
          material.transmission *= mix(0.5, 1.0, exp(-vMineralThickness * 2.4));
        #endif`);
    };
    material.customProgramCacheKey = () => 'originium-crimson-sss-r160-v3';
    return material;
  }

  function studioEnvironment(renderer) {
    const studio = new THREE.Scene();
    studio.background = new THREE.Color(.08,.065,.075);
    const panels = [
      { position:[-3,4,4], size:[4,6], color:[3.8,3.65,3.65] },
      { position:[4,1,-2], size:[2,5], color:[1.1,.8,.85] },
      { position:[-1,3,-4], size:[3,2], color:[2.4,.07,.13] },
      { position:[0,-4,2], size:[5,3], color:[.22,.15,.17] }
    ];
    panels.forEach(({position,size,color}) => {
      const panel = new THREE.Mesh(new THREE.PlaneGeometry(...size),new THREE.MeshBasicMaterial({color:new THREE.Color(...color),side:THREE.DoubleSide}));
      panel.position.set(...position); panel.lookAt(0,0,0); studio.add(panel);
    });
    const generator = new THREE.PMREMGenerator(renderer);
    try { return generator.fromScene(studio,.035,.1,30); }
    finally {
      generator.dispose();
      studio.traverse((object) => { object.geometry?.dispose(); object.material?.dispose(); });
    }
  }

  class SpecimenView {
    constructor(canvas, { interactive = false, motion = true } = {}) {
      this.canvas = canvas; this.interactive = interactive; this.motion = motion;
      this.x = -.12; this.y = .56; this.zoom = 1; this.wireframe = false;
      this.visible = false; this.available = false; this.frame = null; this.dirty = true;
      this.abort = new AbortController();
      this.reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
      this.originalLabel = canvas.getAttribute('aria-label');
      const options = { signal:this.abort.signal };
      if (interactive) {
        this.status = document.createElement('span');
        this.status.className = 'specimen-status'; this.status.setAttribute('role','status');
        canvas.after(this.status);
      }
      try {
        if (!THREE) throw new Error('Three.js CDN unavailable');
        this.renderer = new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:interactive ? 'high-performance' : 'low-power'});
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.02;
        this.renderer.setClearColor(0x17212a,0);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.debug.onShaderError = () => { throw new Error('Mineral shader compilation failed'); };
        this.createScene();
        this.setAvailable(true);
      } catch (error) {
        console.warn('Specimen preview unavailable:',error.message);
        this.releaseGPU(); this.setAvailable(false);
        return;
      }
      canvas.addEventListener('webglcontextlost',(event) => {
        event.preventDefault(); this.drag = null; canvas.classList.remove('dragging');
        this.setAvailable(false); this.stopFrame();
      },options);
      canvas.addEventListener('webglcontextrestored',() => {
        if (!this.renderer) return;
        try {
          // Render-target contents do not survive context loss; rebuild the IBL.
          this.environment.dispose();
          this.environment = studioEnvironment(this.renderer);
          this.scene.environment = this.environment.texture;
          this.setAvailable(true); this.requestDraw();
        } catch (error) {
          console.warn('Specimen restore failed:',error.message);
          this.setAvailable(false); this.releaseGPU();
        }
      },options);
      this.observer = new ResizeObserver(() => this.requestDraw());
      this.observer.observe(canvas);
      this.intersection = new IntersectionObserver(([entry]) => {
        this.visible = entry.isIntersecting;
        if (this.visible) this.requestDraw(); else this.stopFrame();
      });
      this.intersection.observe(canvas);
      document.addEventListener('visibilitychange',() => {
        if (document.hidden) this.stopFrame(); else this.requestDraw();
      },options);
      this.reduce.addEventListener('change',() => { this.stopFrame(); this.requestDraw(); },options);
      if (interactive) this.bind();
    }

    createScene() {
      this.scene = new THREE.Scene();
      this.camera = new THREE.PerspectiveCamera(34,1,.1,40);
      this.camera.position.set(0,.45,7); this.camera.lookAt(0,0,0);
      this.environment = studioEnvironment(this.renderer);
      this.scene.environment = this.environment.texture;
      this.texture = mineralSurface();
      this.texture.anisotropy = Math.min(4,this.renderer.capabilities.getMaxAnisotropy());
      // Translucent mineral: high transmission with short red attenuation so a backlight and
      // the inner cores read through thin walls and tips while the dense body stays dark.
      // Ink-black mineral: an obsidian-dark shell that is mostly opaque, with just enough
      // transmission and a short, saturated red attenuation that any light reaching a thin
      // wall or an inner core leaves the stone as red. The black is the rock; red is only
      // what transmits from within.
      const common = {metalness:.04,roughness:.44,roughnessMap:this.texture,bumpMap:this.texture,bumpScale:.012,
        ior:1.66,transmission:.5,thickness:.9,attenuationColor:0xd8202a,attenuationDistance:.28,
        clearcoat:.52,clearcoatRoughness:.19,envMapIntensity:.6};
      this.shellMaterials = [
        scatterMaterial({...common,color:0x070708}),
        scatterMaterial({...common,color:0x0e0e12,roughness:.28,clearcoat:.64,bumpScale:.004}),
        scatterMaterial({...common,color:0x090a0d,transmission:.6,roughness:.32})
      ];
      const matrix = new THREE.MeshStandardMaterial({color:0x070707,roughness:.82,metalness:.05,bumpMap:this.texture,bumpScale:.035});
      // Inner cores: opaque red emissive blocks nested inside each black shell. They render
      // into the transmission buffer, so their light is refracted and reddened by the shell's
      // thickness — red glowing masses seen through black stone, never on its surface.
      const coreMaterial = new THREE.MeshStandardMaterial({color:0x4a0710,roughness:.55,metalness:0,emissive:0xc8142a,emissiveIntensity:1.7});
      const inclusion = new THREE.MeshStandardMaterial({color:0x660b18,roughness:.4,metalness:0,emissive:0xe52433,emissiveIntensity:2.1});
      const inclusionBright = new THREE.MeshStandardMaterial({color:0x821120,roughness:.3,metalness:0,emissive:0xff4a2e,emissiveIntensity:2.8});
      this.materials = [...this.shellMaterials,matrix,coreMaterial,inclusion,inclusionBright];
      this.model = new THREE.Group(); this.scene.add(this.model);
      const shards = [
        [-.05,.12,.02,.58,1.95,-.1,.2,.5], [.52,-.04,-.18,.45,1.4,-.42,.7,.62],
        [-.58,-.12,.08,.43,1.55,.52,.35,.54], [.34,-.4,.46,.4,1.15,-.55,.25,.66],
        [-.27,-.3,-.47,.39,1.5,.3,.85,.5], [.63,-.52,.2,.34,.98,-.6,.55,.7],
        [-.5,-.56,.42,.33,1.05,.62,1.15,.6], [.1,-.6,-.52,.37,1.15,-.2,1.45,.56],
        [0,.52,-.08,.3,1.2,.16,1.9,.32]
      ];
      shards.forEach(([x,y,z,radius,height,lean,spin,tip],i) => {
        const shard = new THREE.Group(); shard.position.set(x,y,z); shard.rotation.set(.06,spin,lean);
        this.model.add(shard);
        const geometry = crystalGeometry(radius,height,i * 13,tip);
        const shell = new THREE.Mesh(geometry,this.shellMaterials);
        shell.castShadow = shell.receiveShadow = true; shard.add(shell);
        // A red emissive block sits inside, leaving a black shell margin, so you read red
        // stone glowing through black mineral rather than a surface tint.
        const core = new THREE.Mesh(geometry,[inclusion,inclusionBright,coreMaterial][i % 3]);
        core.scale.set(.62,.84,.62); core.position.y = -height * .03; shard.add(core);
      });
      // A few low intergrown blocks ground the cluster without the old debris ring.
      for (let i = 0; i < 6; i++) {
        const angle = i * 2.39996 + 1;
        const geometry = crystalGeometry(.17 + hash(i + 30) * .13,.55 + hash(i + 90) * .5,i + 300,.52);
        const chip = new THREE.Mesh(geometry,i % 3 === 0 ? this.shellMaterials[2] : matrix);
        chip.position.set(Math.cos(angle) * (.42 + hash(i + 70) * .3),-.8 + hash(i + 120) * .24,Math.sin(angle) * (.4 + hash(i + 71) * .26));
        chip.rotation.set((hash(i + 7) - .5) * .7,angle,(hash(i + 16) - .5));
        chip.castShadow = chip.receiveShadow = true; this.model.add(chip);
      }
      // Fit the camera to the solid crystal meshes.
      const box = new THREE.Box3();
      this.model.traverse((object) => { if (object.isMesh) box.expandByObject(object); });
      const center = box.getCenter(new THREE.Vector3());
      this.model.children.forEach((child) => child.position.sub(center));
      this.radius = box.getBoundingSphere(new THREE.Sphere()).radius;
      this.bounds = new THREE.Box3();
      this.scene.add(new THREE.HemisphereLight(0xd9cdd0,0x211117,.55));
      this.key = new THREE.DirectionalLight(0xeee7e6,2.4);
      this.key.position.set(-3,5,4); this.key.castShadow = true;
      this.key.shadow.mapSize.set(this.interactive ? 1024 : 512,this.interactive ? 1024 : 512);
      Object.assign(this.key.shadow.camera,{left:-3.5,right:3.5,top:3.5,bottom:-3.5,near:.5,far:16});
      this.key.shadow.camera.updateProjectionMatrix();
      this.key.shadow.normalBias = .025; this.key.shadow.bias = -.0002;
      this.scene.add(this.key);
      const rim = new THREE.DirectionalLight(0xd42138,2.6); rim.position.set(1.5,1.5,-4.5); this.scene.add(rim);
      const fill = new THREE.DirectionalLight(0xbcafb5,.6); fill.position.set(4,.5,2); this.scene.add(fill);
      this.ground = new THREE.Mesh(new THREE.PlaneGeometry(30,30),new THREE.ShadowMaterial({color:0x0c1218,opacity:.35}));
      this.ground.rotation.x = -Math.PI / 2; this.ground.receiveShadow = true; this.scene.add(this.ground);
    }

    setAvailable(available) {
      this.available = available;
      this.canvas.dataset.renderer = available ? 'webgl' : 'fallback';
      if (this.interactive) {
        this.status.textContent = available ? '' : '三维预览暂不可用，已显示源石参考图';
        this.canvas.setAttribute('aria-label',available ? this.originalLabel : '源石参考图，三维预览暂不可用');
        this.canvas.closest('.dialog')?.querySelectorAll('.material-controls button, .material-controls input').forEach((control) => { control.disabled = !available; });
      }
    }

    bind() {
      const options = { signal:this.abort.signal };
      this.canvas.addEventListener('pointerdown',(event) => {
        if (!this.available || !event.isPrimary || event.button !== 0) return;
        this.drag = {x:event.clientX,y:event.clientY,angleX:this.x,angleY:this.y};
        this.lastInput = performance.now();
        this.canvas.setPointerCapture(event.pointerId); this.canvas.classList.add('dragging');
      },options);
      this.canvas.addEventListener('pointermove',(event) => {
        if (!this.drag) return;
        this.y = this.drag.angleY + (event.clientX - this.drag.x) * .011;
        this.x = clamp(this.drag.angleX + (event.clientY - this.drag.y) * .008,-1,1);
        this.requestDraw();
      },options);
      const stop = () => { this.drag = null; this.lastInput = performance.now(); this.canvas.classList.remove('dragging'); };
      ['pointerup','pointercancel','lostpointercapture'].forEach((event) => this.canvas.addEventListener(event,stop,options));
      this.canvas.addEventListener('keydown',(event) => {
        if (!this.available || !['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key)) return;
        event.preventDefault(); event.stopPropagation(); this.lastInput = performance.now();
        if (event.key === 'ArrowLeft') this.y -= .18;
        if (event.key === 'ArrowRight') this.y += .18;
        if (event.key === 'ArrowUp') this.x = clamp(this.x - .12,-1,1);
        if (event.key === 'ArrowDown') this.x = clamp(this.x + .12,-1,1);
        this.requestDraw();
      },options);
    }
    turn() { this.y += Math.PI / 4; this.lastInput = performance.now(); this.requestDraw(); }
    reset() { this.x = -.12; this.y = .56; this.zoom = 1; this.lastInput = performance.now(); this.requestDraw(); }
    setZoom(zoom) { this.zoom = clamp(zoom,.6,1.65); this.lastInput = performance.now(); this.requestDraw(); }
    setWireframe(enabled) {
      this.wireframe = enabled;
      this.materials?.forEach((material) => { material.wireframe = enabled; });
      this.lastInput = performance.now(); this.requestDraw();
    }
    setMotion(enabled) { this.motion = enabled; this.stopFrame(); this.requestDraw(); }
    stopFrame() { if (this.frame !== null) cancelAnimationFrame(this.frame); this.frame = null; this.lastDraw = 0; }
    requestDraw() {
      this.dirty = true;
      if (this.frame !== null || !this.available || !this.visible || document.hidden || this.abort.signal.aborted) return;
      this.frame = requestAnimationFrame((time) => this.tick(time));
    }
    tick(time) {
      this.frame = null;
      if (!this.available || !this.visible || document.hidden || this.abort.signal.aborted) return;
      const auto = this.interactive && this.motion && !this.reduce.matches;
      if (this.dirty || (auto && time - (this.lastDraw || 0) >= 1000 / 30)) {
        if (auto && !this.drag && time - (this.lastInput || 0) > 2200) this.y += Math.min(time - (this.lastDraw || time),50) * .000035;
        this.lastDraw = time; this.dirty = false;
        try { this.draw(); }
        catch (error) { console.warn('Specimen render failed:',error.message); this.setAvailable(false); this.releaseGPU(); }
      }
      if (auto && this.available) this.frame = requestAnimationFrame((next) => this.tick(next));
    }
    draw() {
      const width = this.canvas.clientWidth, height = this.canvas.clientHeight;
      if (!width || !height) return;
      const ratio = Math.min(window.devicePixelRatio || 1,this.interactive ? 2 : 1.5);
      if (this.width !== width || this.height !== height || this.ratio !== ratio) {
        this.width = width; this.height = height; this.ratio = ratio;
        this.renderer.setPixelRatio(ratio); this.renderer.setSize(width,height,false);
        this.camera.aspect = width / height;
      }
      // Fit a bounding sphere so rotation and narrow preview cards cannot clip tips.
      const vertical = THREE.MathUtils.degToRad(this.camera.fov * .5);
      const horizontal = Math.atan(Math.tan(vertical) * this.camera.aspect);
      const distance = this.radius / Math.sin(Math.min(vertical,horizontal)) * 1.04;
      this.camera.position.set(0,distance * .07,distance); this.camera.lookAt(0,0,0);
      this.camera.far = Math.max(40,distance + this.radius * 4);
      this.camera.zoom = this.zoom; this.camera.updateProjectionMatrix();
      this.model.rotation.set(this.x,this.y,-.055);
      this.ground.position.y = this.bounds.setFromObject(this.model).min.y - .025;
      this.ground.visible = !this.wireframe;
      this.renderer.render(this.scene,this.camera);
    }
    releaseGPU() {
      this.stopFrame();
      const geometries = new Set(), materials = new Set(this.materials || []);
      this.scene?.traverse((object) => {
        if (object.geometry) geometries.add(object.geometry);
        if (object.material) (Array.isArray(object.material) ? object.material : [object.material]).forEach((material) => materials.add(material));
      });
      geometries.forEach((geometry) => geometry.dispose()); materials.forEach((material) => material.dispose());
      this.texture?.dispose(); this.environment?.dispose(); this.key?.shadow.dispose();
      if (this.renderer) { this.renderer.dispose(); this.renderer.forceContextLoss(); }
      this.renderer = null; this.scene = null; this.materials = null;
      this.texture = null; this.environment = null; this.key = null;
    }
    destroy() {
      this.abort.abort(); this.observer?.disconnect(); this.intersection?.disconnect();
      this.releaseGPU(); this.status?.remove();
    }
  }
  window.SpecimenView = SpecimenView;
})();
