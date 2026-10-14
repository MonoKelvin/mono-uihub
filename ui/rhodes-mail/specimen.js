/* Original faceted crystal geometry. Perspective projection; no game mesh or texture. */
(() => {
  'use strict';
  const mix = (a, b, t) => a.map((n, i) => n + (b[i] - n) * t);
  const rotate = ([x, y, z], ax, ay, az = 0) => {
    let a = y * Math.cos(ax) - z * Math.sin(ax);
    let b = y * Math.sin(ax) + z * Math.cos(ax);
    const c = x * Math.cos(ay) + b * Math.sin(ay);
    b = -x * Math.sin(ay) + b * Math.cos(ay);
    return [c * Math.cos(az) - a * Math.sin(az), c * Math.sin(az) + a * Math.cos(az), b];
  };
  function buildCluster() {
    const faces = [];
    const shards = [
      { x: -8, y: -12, z: 0, radius: 34, height: 170, lean: -.12, spin: .2 },
      { x: 36, y: 27, z: -8, radius: 26, height: 124, lean: .38, spin: .8 },
      { x: -47, y: 38, z: 2, radius: 23, height: 104, lean: -.6, spin: .4 },
      { x: 12, y: 63, z: 30, radius: 24, height: 88, lean: .55, spin: .1 },
      { x: -11, y: 51, z: -31, radius: 19, height: 102, lean: -.38, spin: .6 }
    ];
    shards.forEach((shard, index) => {
      const point = (p) => { const r = rotate(p, .04, shard.spin, shard.lean); return [r[0] + shard.x, r[1] + shard.y, r[2] + shard.z]; };
      const ring = (y, radius) => Array.from({ length: 6 }, (_, i) => point([Math.cos(i * Math.PI / 3) * radius, y, Math.sin(i * Math.PI / 3) * radius]));
      const shoulder = ring(-shard.height * .29, shard.radius * .79);
      const bottom = ring(shard.height * .34, shard.radius);
      const tip = point([shard.radius * .15, -shard.height * .68, -shard.radius * .1]);
      const root = point([0, shard.height * .52, 0]);
      for (let i = 0; i < 6; i++) {
        const j = (i + 1) % 6;
        faces.push({ points: [tip, shoulder[i], shoulder[j]], tone: (i + index) % 3 });
        faces.push({ points: [shoulder[i], bottom[i], bottom[j], shoulder[j]], tone: (i + index) % 3 });
        faces.push({ points: [bottom[i], root, bottom[j]], tone: 0 });
        if ((i + index) % 4 === 1) {
          faces.push({ points: [mix(shoulder[i], shoulder[j], .68), mix(bottom[i], bottom[j], .71), mix(bottom[i], bottom[j], .88), mix(shoulder[i], shoulder[j], .84)], amber: true });
        }
      }
    });
    return faces;
  }
  const geometry = buildCluster();
  class SpecimenView {
    constructor(canvas, { interactive = false } = {}) {
      this.canvas = canvas;
      this.context = canvas.getContext('2d');
      this.x = -.12; this.y = .56; this.zoom = 1;
      this.abort = new AbortController();
      this.observer = new ResizeObserver(() => this.requestDraw());
      this.observer.observe(canvas);
      if (interactive) this.bind();
      this.draw();
    }
    bind() {
      const options = { signal: this.abort.signal };
      this.canvas.addEventListener('pointerdown', (event) => {
        if (!event.isPrimary || event.button !== 0) return;
        this.drag = { x: event.clientX, y: event.clientY, angleX: this.x, angleY: this.y };
        this.canvas.setPointerCapture(event.pointerId);
        this.canvas.classList.add('dragging');
      }, options);
      this.canvas.addEventListener('pointermove', (event) => {
        if (!this.drag) return;
        this.y = this.drag.angleY + (event.clientX - this.drag.x) * .011;
        this.x = Math.max(-1, Math.min(1, this.drag.angleX + (event.clientY - this.drag.y) * .008));
        this.requestDraw();
      }, options);
      const stop = () => { this.drag = null; this.canvas.classList.remove('dragging'); };
      ['pointerup', 'pointercancel', 'lostpointercapture'].forEach((event) => this.canvas.addEventListener(event, stop, options));
      this.canvas.addEventListener('keydown', (event) => {
        if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
        event.preventDefault(); event.stopPropagation();
        if (event.key === 'ArrowLeft') this.y -= .18;
        if (event.key === 'ArrowRight') this.y += .18;
        if (event.key === 'ArrowUp') this.x = Math.max(-1, this.x - .12);
        if (event.key === 'ArrowDown') this.x = Math.min(1, this.x + .12);
        this.draw();
      }, options);
    }
    turn() { this.y += Math.PI / 4; this.draw(); }
    reset() { this.x = -.12; this.y = .56; this.zoom = 1; this.draw(); }
    setZoom(zoom) { this.zoom = Math.max(.6, Math.min(1.65, zoom)); this.draw(); }
    setWireframe(enabled) { this.wireframe = enabled; this.draw(); }
    requestDraw() {
      if (this.frame) return;
      this.frame = requestAnimationFrame(() => { this.frame = null; this.draw(); });
    }
    draw() {
      const bounds = this.canvas.getBoundingClientRect();
      if (!bounds.width || !bounds.height || !this.context) return;
      const ratio = Math.min(devicePixelRatio || 1, 2);
      const width = Math.round(bounds.width * ratio), height = Math.round(bounds.height * ratio);
      if (this.canvas.width !== width) this.canvas.width = width;
      if (this.canvas.height !== height) this.canvas.height = height;
      const ctx = this.context;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      ctx.clearRect(0, 0, bounds.width, bounds.height);
      const scale = Math.min(bounds.width / 245, bounds.height / 265) * this.zoom;
      const center = [bounds.width * .5, bounds.height * .49];
      const project = (p) => { const depth = 650 / (650 - p[2]); return [center[0] + p[0] * scale * depth, center[1] + p[1] * scale * depth]; };
      const faces = geometry.map((face) => {
        const vertices = face.points.map((p) => rotate(p, this.x, this.y, -.055));
        return { ...face, vertices, depth: vertices.reduce((total, p) => total + p[2], 0) / vertices.length };
      }).sort((a, b) => a.depth - b.depth || Number(a.amber) - Number(b.amber));
      faces.forEach((face) => {
        const [p, q, r] = face.vertices;
        const a = q.map((v, i) => v - p[i]);
        const b = r.map((v, i) => v - p[i]);
        const normal = [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
        const length = Math.hypot(...normal) || 1;
        const light = Math.abs((-normal[0] * .4 - normal[1] * .7 + normal[2] * .6) / length);
        const color = face.amber ? [178, 112, 48] : face.tone === 1 ? [92, 103, 118] : face.tone === 2 ? [60, 69, 82] : [36, 42, 53];
        const brightness = .57 + light * .58;
        ctx.beginPath();
        face.vertices.forEach((vertex, index) => { const point = project(vertex); if (index) ctx.lineTo(...point); else ctx.moveTo(...point); });
        ctx.closePath();
        ctx.fillStyle = 'rgb(' + color.map((v) => Math.min(255, Math.round(v * brightness))).join(',') + ')';
        if (!this.wireframe || face.amber) ctx.fill();
        if (!face.amber) { ctx.strokeStyle = this.wireframe ? 'rgba(186,203,208,.55)' : 'rgba(174,185,197,.26)'; ctx.lineWidth = this.wireframe ? .8 : .65; ctx.stroke(); }
      });
    }
    destroy() { this.abort.abort(); this.observer.disconnect(); if (this.frame) cancelAnimationFrame(this.frame); }
  }
  window.SpecimenView = SpecimenView;
})();
