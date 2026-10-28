# Aperture Studio · Assets & Licenses

All runtime assets live in `assets/` and are downloaded from open repositories. They load from local paths via the ES module loader — no CDN assets at runtime except three.js and Tabler icons.

## GLB models — [KhronosGroup/glTF-Sample-Assets](https://github.com/KhronosGroup/glTF-Sample-Assets)

License: **CC0-1.0** (public domain dedication). Base URL: `https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/`

| Local file | Bytes | Source (path suffix) |
| --- | --- | --- |
| `assets/models/WaterBottle.glb` | 8,966,700 | `WaterBottle/glTF-Binary/WaterBottle.glb` |
| `assets/models/DamagedHelmet.glb` | 3,773,916 | `DamagedHelmet/glTF-Binary/DamagedHelmet.glb` |
| `assets/models/MetalRoughSpheres.glb` | 11,221,356 | `MetalRoughSpheres/glTF-Binary/MetalRoughSpheres.glb` |
| `assets/models/Fox.glb` | 162,852 | `Fox/glTF-Binary/Fox.glb` |

## OBJ / FBX sample models — [mrdoob/three.js dev branch](https://github.com/mrdoob/three.js/tree/dev/examples/models)

License: **MIT** (three.js examples). Base URL: `https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/models/`

| Local file | Bytes | Source |
| --- | --- | --- |
| `assets/models/tree.obj` | 125,161 | `tree.obj` |
| `assets/models/walt_head.obj` | 1,071,914 | `walt/WaltHead.obj` |
| `assets/models/walt_head.mtl` | 178 | `walt/WaltHead.mtl` |
| `assets/models/monkey.fbx` | 44,892 | `monkey.fbx` |
| `assets/models/rotation.fbx` | 19,228 | `RotationTest.fbx` |
| `assets/models/head_69.fbx` | 2,082,668 | `Head_69.fbx` |

OBJ / FBX assets are loaded by `OBJLoader` (with companion `.mtl` for Walt Head) and `FBXLoader` respectively. Materials using basic / lambert / phong shading (common for `.obj` and older `.fbx`) are upgraded to `MeshStandardMaterial` at load time so they participate in the PBR pipeline (`site/modules/render_engine/models.js` → `upgradeToPBR`).

## HDR environments — [Poly Haven](https://polyhaven.com/hdris)

License: **CC0-1.0** (public domain dedication). Base URL: `https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/`

| Local file | Bytes | Poly Haven asset |
| --- | --- | --- |
| `assets/hdris/studio_small_03.hdr` | 1,686,299 | studio_small_03 |
| `assets/hdris/studio_small_02_1k.hdr` | 1,701,272 | studio_small_02 |
| `assets/hdris/studio_small_08.hdr` | 1,508,872 | studio_small_08 |
| `assets/hdris/studio_small_09_1k.hdr` | 1,615,248 | studio_small_09 |
| `assets/hdris/brown_photostudio_02_1k.hdr` | 1,648,130 | brown_photostudio_02 |
| `assets/hdris/kloppenheim_02_1k.hdr` | 1,740,414 | kloppenheim_02 |

HDRIs are loaded at runtime via `RGBELoader` + `PMREMGenerator` so they produce the physically correct irradiance / specular maps that drive PBR reflections. If PMREM fails (e.g. headless WebGL with swiftshader), the engine falls back to a procedural canvas-gradient environment with two softbox blobs so the model is still visible — real GPU browsers load the HDR cleanly.

## Runtime libraries

- **three.js 0.168.0** — MIT. Loaded at runtime from `https://esm.sh/three@0.168.0` via the importmap in `index.html`. Not bundled locally.
- **Tabler Icons 3.21.0** webfont — MIT. Loaded from `cdn.jsdelivr.net`.
- **Google Fonts** — Instrument Sans, Bricolage Grotesque, JetBrains Mono — SIL Open Font License.

## Local engine module

The core render engine is factored into `site/modules/render_engine/` so it can be shared across prototypes. The page (`app.js`) imports the engine directly via the URL-relative path `../../../site/modules/render_engine/` — there is no `engine/` shim directory. The page-specific catalog (model / HDRI / preset lists) is defined inline in `app.js`. When the site build mirrors prototypes to `public/prototypes/`, it also mirrors the module to `public/prototypes/site/modules/` so the same relative path keeps resolving (see `site/scripts/sync-prototypes.mjs`).

## Notes

- All models and HDRIs were fetched during authoring and are committed under `assets/`.
- The renderer opens local assets relative to `index.html`, so the page works offline after the first load (except the three.js CDN itself).
- Nothing in this project ships any paid, proprietary, or licensed-only asset.
