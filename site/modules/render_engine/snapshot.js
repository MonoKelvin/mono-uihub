// site/modules/render_engine/snapshot.js
// One-shot high-resolution render → PNG download. Because the renderer
// keeps preserveDrawingBuffer: false for performance, we render one fresh
// frame at the export resolution just before calling toDataURL.
//
// API:
//   const s = new Snapshotter(renderer);   // renderer = Renderer instance
//   const r = s.capture(scene, camera, {width:1920, height:1080});
//   s.download(r, 'render.png');

import { THREE } from './three.js';

export class Snapshotter {
  constructor(renderer) {
    // renderer is the Renderer class from renderer.js; the real
    // THREE.WebGLRenderer lives at renderer.inner.
    this.gl = renderer.inner;
  }

  capture(scene, camera, { width = 1920, height = 1080 } = {}) {
    const dom = this.gl.domElement;
    const prevCssSize = this.gl.getSize(new THREE.Vector2());
    const prevPixelRatio = this.gl.getPixelRatio();
    const prevAspect = camera.aspect;

    try {
      this.gl.setPixelRatio(1);
      this.gl.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      this.gl.clear();
      this.gl.render(scene, camera);

      const dataUrl = dom.toDataURL('image/png');
      return { dataUrl, width, height };
    } finally {
      this.gl.setPixelRatio(prevPixelRatio);
      this.gl.setSize(prevCssSize.x, prevCssSize.y, false);
      camera.aspect = prevAspect;
      camera.updateProjectionMatrix();
    }
  }

  download(result, filename = 'render.png') {
    const a = document.createElement('a');
    a.href = result.dataUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
}
