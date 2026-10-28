// site/modules/render_engine/camera.js
// PerspectiveCamera + OrbitControls + normalisation helper.
//
// Every loaded model is scaled to fit a virtual product sphere of radius
// ~1.0 and re-seated so its lowest point sits on y=0. This is why presets
// feel consistent across wildly different assets (a 0.001-unit GLB and a
// 400-unit OBJ both frame the same way).

import { THREE, OrbitControls } from './three.js';

const PRODUCT_RADIUS = 1.0;

export class CameraRig {
  constructor(canvas) {
    this.canvas = canvas;
    this.camera = new THREE.PerspectiveCamera(42, 1, 0.01, 200);
    this.camera.position.set(2.4, 1.2, 3.2);
    this.camera.lookAt(0, 0, 0);

    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.rotateSpeed = 0.85;
    this.controls.zoomSpeed = 0.9;
    this.controls.panSpeed = 0.6;
    this.controls.screenSpacePanning = false;
    this.controls.minDistance = 0.6;
    this.controls.maxDistance = 12;
    this.controls.maxPolarAngle = Math.PI * 0.52;
    this.controls.target.set(0, 0.05, 0);

    this._aspect = 1;
  }

  setAspect(w, h) {
    const aspect = w / Math.max(h, 1);
    if (aspect === this._aspect) return;
    this._aspect = aspect;
    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();
  }

  applyPreset(preset) {
    this.camera.fov = preset.fov;
    this.camera.updateProjectionMatrix();
    const target = this.controls.target.clone();
    const r = preset.dist;
    const y = r * Math.sin(preset.tilt);
    const hz = r * Math.cos(preset.tilt);
    this.camera.position.set(0, y, hz);
    this.controls.target.copy(target);
    this.controls.update();
  }

  /**
   * Wrap a loaded Object3D in a group, scale so bounding sphere fits
   * PRODUCT_RADIUS, re-seat lowest point at y=0. Returns the group.
   */
  normaliseModel(object) {
    const box = new THREE.Box3().setFromObject(object);
    const sphere = box.getBoundingSphere(new THREE.Sphere());
    const center = sphere.center.clone();
    const size = Math.max(sphere.radius, 1e-6);
    const scale = PRODUCT_RADIUS / size;

    const group = new THREE.Group();
    object.scale.setScalar(scale);
    object.position.sub(center.multiplyScalar(scale));
    group.add(object);

    const after = new THREE.Box3().setFromObject(group);
    group.position.y -= after.min.y;

    return group;
  }

  update() { this.controls.update(); }

  reset() {
    this.controls.reset();
    this.controls.target.set(0, 0.05, 0);
    this.camera.position.set(2.4, 1.2, 3.2);
    this.camera.lookAt(0, 0.05, 0);
  }
}
