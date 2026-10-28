// site/modules/render_engine/three.js
// Namespace entry point for three.js. Every other render_engine module
// imports from this file, not from the CDN directly, so consumers get one
// version of three.js no matter how many engine modules they import.
//
// IMPORTANT: esm.sh re-exports three.js as NAMED exports (no default).
// `export * as THREE` rebuilds the namespace so downstream code can still
// do `import { THREE } from './three.js'`.
export * as THREE from 'https://esm.sh/three@0.168.0';
export { OrbitControls } from 'https://esm.sh/three@0.168.0/examples/jsm/controls/OrbitControls.js';
export { GLTFLoader }    from 'https://esm.sh/three@0.168.0/examples/jsm/loaders/GLTFLoader.js';
export { RGBELoader }    from 'https://esm.sh/three@0.168.0/examples/jsm/loaders/RGBELoader.js';
export { FBXLoader }     from 'https://esm.sh/three@0.168.0/examples/jsm/loaders/FBXLoader.js';
export { OBJLoader }     from 'https://esm.sh/three@0.168.0/examples/jsm/loaders/OBJLoader.js';
export { MTLLoader }     from 'https://esm.sh/three@0.168.0/examples/jsm/loaders/MTLLoader.js';
export { STLLoader }     from 'https://esm.sh/three@0.168.0/examples/jsm/loaders/STLLoader.js';

// ── post-processing (realistic-render pipeline) ───────────────────────────
export { EffectComposer }     from 'https://esm.sh/three@0.168.0/examples/jsm/postprocessing/EffectComposer.js';
export { RenderPass }         from 'https://esm.sh/three@0.168.0/examples/jsm/postprocessing/RenderPass.js';
export { UnrealBloomPass }    from 'https://esm.sh/three@0.168.0/examples/jsm/postprocessing/UnrealBloomPass.js';
export { BokehPass }          from 'https://esm.sh/three@0.168.0/examples/jsm/postprocessing/BokehPass.js';
export { SSAOPass }           from 'https://esm.sh/three@0.168.0/examples/jsm/postprocessing/SSAOPass.js';
export { OutputPass }         from 'https://esm.sh/three@0.168.0/examples/jsm/postprocessing/OutputPass.js';
export { ShaderPass }         from 'https://esm.sh/three@0.168.0/examples/jsm/postprocessing/ShaderPass.js';
export { FXAAShader }         from 'https://esm.sh/three@0.168.0/examples/jsm/shaders/FXAAShader.js';

// ── reflection / SSR ──────────────────────────────────────────────────────
// Reflector gives a sharp, continuous planar mirror for the floor; SSRPass
// adds real screen-space reflections that bend around the model.
export { Reflector }         from 'https://esm.sh/three@0.168.0/examples/jsm/objects/Reflector.js';
export { ReflectorForSSRPass } from 'https://esm.sh/three@0.168.0/examples/jsm/objects/ReflectorForSSRPass.js';
export { SSRPass }          from 'https://esm.sh/three@0.168.0/examples/jsm/postprocessing/SSRPass.js';
