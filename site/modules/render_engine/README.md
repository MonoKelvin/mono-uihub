# render_engine

Shared WebGL 3D rendering engine used by prototypes. Wraps three.js 0.168.0
and provides physically-based lighting, HDR environment maps, orbit
camera, format-aware model loading (GLB / FBX / OBJ / STL), and PNG
snapshot export.

UI-free by design. Every module in this folder is a pure
three.js / WebGL primitive — no DOM, no CSS, no event listeners on
elements outside the `<canvas>` you hand it.

## Quick start

```html
<script type="importmap">
{ "imports": { "three": "https://esm.sh/three@0.168.0" } }
</script>
<script type="module">
  import { ApertureEngine } from './modules/render_engine/index.js';

  const engine = new ApertureEngine({
    canvas: document.getElementById('stage'),
    models: [
      { id: 'bottle',   file: './models/WaterBottle.glb', title: 'Bottle' },
      { id: 'fox',      file: './models/Fox.glb',          title: 'Fox' },
      { id: 'tree',     file: './models/tree.obj',         title: 'Tree' },
      { id: 'monkey',   file: './models/monkey.fbx',       title: 'Monkey' },
    ],
    hdris: [
      { id: 'studio', file: './hdris/studio_small_03.hdr', title: 'Studio', exp: 1.0 },
    ],
    presets: [
      { id: 'product', name: 'Product', fov: 38, dist: 3.2, tilt: 0.28, spin: 0.35, bg: 'env', showFloor: true },
    ],
  });

  engine.loadHdri('studio');
  engine.loadModel('bottle');

  engine.onTick = (dt, stats) => {
    document.getElementById('fps').textContent = Math.round(stats.fps);
  };
</script>
```

## Files

| File | Purpose |
| --- | --- |
| `three.js`     | Namespace re-export of `three@0.168.0` + all loaders |
| `renderer.js`  | WebGLRenderer with ACES tone mapping + PCFSoft shadows |
| `camera.js`    | PerspectiveCamera + OrbitControls + bounding-sphere normalisation |
| `environment.js` | HDR loading + PMREM + procedural fallback env |
| `ground.js`    | Circle geometry + procedural roughness canvas map |
| `models.js`    | Format-aware loader (GLB / FBX / OBJ+MTL / STL) + PBR upgrade |
| `snapshot.js`  | High-res PNG capture |
| `aperture.js`  | Orchestrator: owns the loop and all the sub-systems |
| `index.js`     | Public entry — import from here |

## Loading formats

`Loader.detectFormat(url)` inspects the file extension and dispatches to the
right three.js loader:

| Extension | Loader          | Notes |
| --------- | --------------- | ----- |
| `.glb` / `.gltf` | `GLTFLoader` | Materials kept as-is (usually `MeshStandardMaterial`) |
| `.fbx` | `FBXLoader`  | Materials upgraded to `MeshStandardMaterial` (FBX ships with Lambert / Phong) |
| `.obj` | `OBJLoader`  | Tries to auto-load a companion `.mtl` from the same directory. Materials upgraded to PBR |
| `.stl` | `STLLoader`  | Geometry only — assigns a neutral `MeshStandardMaterial` |

FBX / OBJ / STL materials are always upgraded because the legacy `MeshBasicMaterial` /
`MeshLambertMaterial` / `MeshPhongMaterial` that those formats ship with don't
participate in PBR environment lighting. Upgrade preserves base colour and any
`map` / `normalMap` already on the material.

## Drag-and-drop loading

For loading files the user drops onto the UI:

```js
stage.addEventListener('drop', async (e) => {
  const file = e.dataTransfer.files[0];
  if (!file) return;
  await engine.loadModelFromFile(file);
});
```

`loadModelFromFile(File)` accepts any of the four supported formats, reads it
via a `blob:` URL, and disposes the object URL on completion. The engine
handles normalisation, shadow setup, and the same fallback path as URL
loading.

## Snapshot export

```js
const result = engine.snapshot({ width: 2560, height: 1440 });
engine.downloadSnapshot(result, 'product.png');
```

`snapshot()` temporarily resizes the renderer to the export resolution and
re-renders one frame, so the readback is never empty despite
`preserveDrawingBuffer: false`. The live canvas is restored immediately after.

## Environment fallback

`environment.load(url)` uses `PMREMGenerator` to bake the HDR into a
pre-filtered cube map for physically-correct roughness sampling. Two drivers
where PMREM misbehaves:

- **Headless chromium + swiftshader**: `new PMREMGenerator()` throws at
  construction with `_renderer.compile is not a function`. The module falls
  back to the raw equirectangular texture — reflections still work, just
  without the pre-filtered mips.
- **CORS / file://**: HDR fetch fails. The engine falls back to a procedural
  canvas gradient with two softbox blobs, which is what you see when no
  HDR loads.

Both fallbacks are applied automatically; `loadHdri()` resolves `true` in
either case because the scene is still lit and renderable.

## License

This module re-exports three.js (MIT, per
`https://github.com/mrdoob/three.js/blob/dev/LICENSE`) at runtime via
`https://esm.sh/three@0.168.0`. The module's own source (renderer.js,
camera.js, environment.js, ground.js, models.js, snapshot.js, aperture.js,
index.js) is MIT and may be copied freely.
