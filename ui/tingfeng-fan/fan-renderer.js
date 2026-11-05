(() => {
  'use strict';

  const DEFAULTS = {
    name: '松风入怀', paper: 'xuan', paperColor: '#f3eddf', pattern: 'plain',
    wood: 'bamboo', smallWood: 'bamboo', ribCount: 16, size: 9, head: 'round', pin: 'brass',
    handle: 'plain', crease: 0.35, edge: true, edgeColor: '#b5a07c',
    text: '清风徐来', font: 'cursive', inkColor: '#373831', textSize: 1,
    textLayout: 'arc', seal: 'square', sealText: '听风', sealFont: 'seal', sealStyle: 'yin',
    pendant: 'red', cordLength: 1
  };
  const WOODS = {
    bamboo: [0.58, 0.39, 0.20], ebony: [0.12, 0.105, 0.085],
    rosewood: [0.35, 0.16, 0.12], sandal: [0.72, 0.57, 0.36]
  };
  const PINS = {
    brass: [0.73, 0.57, 0.29], silver: [0.69, 0.72, 0.73], agate: [0.48, 0.13, 0.12]
  };
  const SWEEP = Math.PI * 145 / 180;
  const RADIUS = 2.68;
  const INNER = 1.03;
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  const color = hex => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255);
  const radial = (r, a, z = 0) => [Math.sin(a) * r, Math.cos(a) * r, z];
  const subtract = (a, b) => a.map((n, i) => n - b[i]);
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const normalize = a => {
    const length = Math.hypot(...a) || 1;
    return a.map(n => n / length);
  };
  const identity = () => new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
  function multiply(a, b) {
    const out = new Float32Array(16);
    for (let col = 0; col < 4; col++) {
      for (let row = 0; row < 4; row++) {
        for (let k = 0; k < 4; k++) out[col * 4 + row] += a[k * 4 + row] * b[col * 4 + k];
      }
    }
    return out;
  }
  function rotation(yaw, pitch) {
    const c = Math.cos(yaw), s = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
    const y = new Float32Array([c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1]);
    const x = new Float32Array([1, 0, 0, 0, 0, cp, sp, 0, 0, -sp, cp, 0, 0, 0, 0, 1]);
    return multiply(x, y);
  }
  function project(matrix, p) {
    const v = [p[0], p[1], p[2], 1];
    const result = [0, 0, 0, 0];
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) result[row] += matrix[col * 4 + row] * v[col];
    }
    return result.slice(0, 3).map(n => n / result[3]);
  }
  function seeded(seed = 217) {
    return () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 4294967296;
    };
  }

  const VERTEX = `
    attribute vec3 aPosition;
    attribute vec3 aNormal;
    attribute vec2 aUV;
    uniform mat4 uMVP;
    uniform mat4 uModel;
    uniform mat3 uNormal;
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec2 vUV;
    void main() {
      gl_Position = uMVP * vec4(aPosition, 1.0);
      vPosition = (uModel * vec4(aPosition, 1.0)).xyz;
      vNormal = uNormal * aNormal;
      vUV = aUV;
    }
  `;
  const FRAGMENT = `
    precision mediump float;
    uniform sampler2D uTexture;
    uniform vec3 uColor;
    uniform float uMaterial;
    uniform float uPaperKind;
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec2 vUV;
    void main() {
      vec3 n = normalize(vNormal);
      if (!gl_FrontFacing) n = -n;
      vec3 light = normalize(vec3(-0.65, 0.85, 1.8));
      vec3 eye = normalize(vec3(0.0, 0.0, 9.0) - vPosition);
      vec3 halfVector = normalize(light + eye);
      float diffuse = max(dot(n, light), 0.0);
      float backFill = max(dot(n, normalize(vec3(0.8, -0.1, -1.0))), 0.0);
      vec3 base = uColor;
      float specular = 0.0;
      if (uMaterial < 0.5) {
        base = texture2D(uTexture, vUV).rgb;
        float fibre = sin(vUV.x * 1890.0 + sin(vUV.y * 420.0)) * 0.008;
        base += vec3(fibre);
        specular = pow(max(dot(n, halfVector), 0.0), 48.0) * (0.02 + uPaperKind * 0.045);
      } else if (uMaterial < 1.5) {
        float grain = sin(vUV.x * 38.0 + sin(vUV.y * 25.0) * 0.7 + sin(vUV.y * 83.0) * 0.15);
        float fineGrain = sin(vUV.x * 169.0 + vUV.y * 5.0);
        base *= 0.91 + grain * 0.095 + fineGrain * 0.025;
        specular = pow(max(dot(n, halfVector), 0.0), 35.0) * 0.22;
      } else if (uMaterial < 2.5) {
        specular = pow(max(dot(n, halfVector), 0.0), 72.0) * 0.85;
        base *= 0.9 + 0.1 * sin(vUV.x * 60.0);
      } else if (uMaterial < 3.5) {
        float cloud = sin(vPosition.x * 35.0 + vPosition.y * 19.0) * sin(vPosition.y * 43.0);
        base *= 0.95 + cloud * 0.08;
        specular = pow(max(dot(n, halfVector), 0.0), 60.0) * 0.55;
      } else {
        specular = pow(max(dot(n, halfVector), 0.0), 24.0) * 0.1;
      }
      float illumination = 0.64 + diffuse * 0.37 + backFill * 0.13;
      vec3 result = base * illumination + vec3(1.0, 0.94, 0.82) * specular;
      gl_FragColor = vec4(result, 1.0);
    }
  `;

  class FanRenderer {
    static fontFamilies = { ui: 'LXGW Neo XiHei', cursive: 'Liu Jian Mao Cao', running: '', brush: '', seal: '' };

    constructor(canvas) {
      this.canvas = canvas;
      this.config = { ...DEFAULTS };
      this.view = { yaw: -0.18, pitch: -0.1, zoom: 1, open: 1, explode: 0 };
      this.textureCanvas = document.createElement('canvas');
      this.textureCanvas.width = 1536;
      this.textureCanvas.height = 1024;
      this.paint = this.textureCanvas.getContext('2d');
      this.parts = [];
      this.geometryDirty = true;
      this.textureDirty = true;
      this.disposed = false;
      this.gl = canvas.getContext('webgl', { alpha: true, antialias: true, preserveDrawingBuffer: true, premultipliedAlpha: false });
      this.supported = !!this.gl;
      if (this.supported) this.initGL();
      else this.ctx = canvas.getContext('2d');
    }

    initGL() {
      const gl = this.gl;
      const compile = (type, source) => {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
          const message = gl.getShaderInfoLog(shader);
          gl.deleteShader(shader);
          throw new Error(`折扇着色器编译失败：${message}`);
        }
        return shader;
      };
      this.program = gl.createProgram();
      const vertex = compile(gl.VERTEX_SHADER, VERTEX);
      const fragment = compile(gl.FRAGMENT_SHADER, FRAGMENT);
      gl.attachShader(this.program, vertex);
      gl.attachShader(this.program, fragment);
      gl.linkProgram(this.program);
      gl.deleteShader(vertex);
      gl.deleteShader(fragment);
      if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) throw new Error(`折扇着色器链接失败：${gl.getProgramInfoLog(this.program)}`);
      gl.useProgram(this.program);
      this.locations = {};
      ['aPosition', 'aNormal', 'aUV'].forEach(name => { this.locations[name] = gl.getAttribLocation(this.program, name); });
      ['uMVP', 'uModel', 'uNormal', 'uTexture', 'uColor', 'uMaterial', 'uPaperKind'].forEach(name => { this.locations[name] = gl.getUniformLocation(this.program, name); });
      this.texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, this.texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.enable(gl.DEPTH_TEST);
      gl.depthFunc(gl.LEQUAL);
      gl.disable(gl.CULL_FACE);
      gl.clearColor(0, 0, 0, 0);
    }

    static artwork(config) {
      const painter = Object.create(FanRenderer.prototype);
      painter.config = { ...DEFAULTS, ...config };
      painter.textureCanvas = document.createElement('canvas');
      painter.textureCanvas.width = 1536;
      painter.textureCanvas.height = 1024;
      painter.paint = painter.textureCanvas.getContext('2d');
      painter.drawTexture();
      return painter.textureCanvas;
    }

    static sealArtwork(config) {
      const size = 384, center = size / 2;
      const canvas = document.createElement('canvas');
      canvas.width = size; canvas.height = size;
      if (config.seal === 'none') return canvas;
      const makeLayer = () => {
        const layer = document.createElement('canvas');
        layer.width = size; layer.height = size;
        return layer;
      };
      const mask = makeLayer(), glyphs = makeLayer();
      const ink = mask.getContext('2d'), text = glyphs.getContext('2d');
      const letters = Array.from(config.sealText).filter(letter => !/\s/.test(letter)).slice(0, 4);
      const round = config.seal === 'round';
      let seed = round ? 613 : 307;
      letters.forEach(letter => { seed = (seed * 31 + letter.codePointAt(0)) >>> 0; });
      const random = seeded(seed);
      const outline = ctx => {
        ctx.beginPath();
        if (round) ctx.arc(center, center, 172, 0, Math.PI * 2);
        else {
          ctx.moveTo(27, 20); ctx.lineTo(357, 20);
          ctx.quadraticCurveTo(364, 20, 364, 27); ctx.lineTo(364, 357);
          ctx.quadraticCurveTo(364, 364, 357, 364); ctx.lineTo(27, 364);
          ctx.quadraticCurveTo(20, 364, 20, 357); ctx.lineTo(20, 27);
          ctx.quadraticCurveTo(20, 20, 27, 20);
        }
        ctx.closePath();
      };
      const extent = round ? 146 * Math.SQRT2 : 284;
      const origin = (size - extent) / 2, half = extent / 2;
      const cells = letters.length === 1 ? [[origin, origin, extent, extent]]
        : letters.length === 2 ? [[origin + half, origin, half, extent], [origin, origin, half, extent]]
        : letters.length === 3 ? [[origin + half, origin, half, extent], [origin, origin, half, half], [origin, origin + half, half, half]]
        : [[origin + half, origin, half, half], [origin + half, origin + half, half, half], [origin, origin, half, half], [origin, origin + half, half, half]];
      text.save();
      text.beginPath();
      if (round) text.arc(center, center, 146, 0, Math.PI * 2);
      else text.rect(origin, origin, extent, extent);
      text.clip();
      text.font = `256px ${JSON.stringify(FanRenderer.fontFamilies[config.sealFont] || 'KaiTi')}, cursive`;
      text.textAlign = 'left'; text.textBaseline = 'alphabetic';
      text.fillStyle = '#000000'; text.strokeStyle = '#000000'; text.lineWidth = 1.4;
      letters.forEach((letter, index) => {
        const metrics = text.measureText(letter);
        const width = metrics.actualBoundingBoxLeft + metrics.actualBoundingBoxRight;
        const height = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
        if (width <= 0 || height <= 0) return;
        const [x, y, w, h] = cells[index];
        const scale = Math.min(w * 0.88 / width, h * 0.88 / height);
        text.save(); text.translate(x + w / 2, y + h / 2); text.scale(scale, scale);
        const bx = (metrics.actualBoundingBoxLeft - metrics.actualBoundingBoxRight) / 2;
        const by = (metrics.actualBoundingBoxAscent - metrics.actualBoundingBoxDescent) / 2;
        text.fillText(letter, bx, by); text.strokeText(letter, bx, by);
        text.restore();
      });
      text.restore();
      ink.fillStyle = '#000000'; ink.strokeStyle = '#000000'; ink.lineWidth = 14;
      outline(ink);
      if (config.sealStyle === 'yin') {
        ink.fill(); ink.stroke();
        ink.globalCompositeOperation = 'destination-out'; ink.drawImage(glyphs, 0, 0);
      } else {
        ink.stroke(); ink.drawImage(glyphs, 0, 0);
      }
      ink.globalCompositeOperation = 'destination-out';
      for (let i = 0; i < 10; i++) {
        const depth = 8 + random() * 9, width = 3 + random() * 5;
        ink.save();
        if (round) {
          const angle = i / 10 * Math.PI * 2 + random() * 0.2;
          ink.translate(center + Math.cos(angle) * 180, center + Math.sin(angle) * 180);
          ink.rotate(angle);
        } else {
          const side = i % 4, position = 44 + random() * 288;
          const edges = [[position, 12, -Math.PI / 2], [372, position, 0], [position, 372, Math.PI / 2], [12, position, Math.PI]];
          const [x, y, angle] = edges[side]; ink.translate(x, y); ink.rotate(angle);
        }
        ink.beginPath(); ink.moveTo(6, -width); ink.lineTo(-depth * 0.62, -width * 0.55);
        ink.lineTo(-depth, width * 0.12); ink.lineTo(-depth * 0.52, width * 0.6);
        ink.lineTo(6, width); ink.closePath(); ink.fill(); ink.restore();
      }
      ink.globalAlpha = 0.32; ink.lineWidth = 1.8; ink.lineCap = 'butt';
      for (let i = 0; i < 23; i++) {
        const x = 34 + random() * 310, y = 34 + random() * 310;
        ink.beginPath(); ink.moveTo(x, y);
        ink.lineTo(x + 8 + random() * 18, y - 2 - random() * 5); ink.stroke();
      }
      ink.globalAlpha = 1;
      const pressure = ink.createLinearGradient(0, 0, size, size);
      pressure.addColorStop(0, 'rgba(0,0,0,.025)');
      pressure.addColorStop(0.5, 'rgba(0,0,0,.065)');
      pressure.addColorStop(1, 'rgba(0,0,0,.025)');
      ink.fillStyle = pressure; ink.fillRect(0, 0, size, size);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(mask, 0, 0); ctx.globalCompositeOperation = 'source-in';
      const pigment = ctx.createLinearGradient(38, 24, 320, 366);
      pigment.addColorStop(0, '#9b382b'); pigment.addColorStop(0.45, '#ad4935'); pigment.addColorStop(1, '#97372c');
      ctx.fillStyle = pigment; ctx.fillRect(0, 0, size, size);
      const rim = makeLayer(), edge = rim.getContext('2d');
      [[1.5, '#6f241d'], [-1.5, '#d8795e']].forEach(([offset, tint]) => {
        edge.clearRect(0, 0, size, size); edge.globalCompositeOperation = 'source-over';
        edge.drawImage(mask, 0, 0); edge.globalCompositeOperation = 'destination-out';
        edge.drawImage(mask, offset, offset); edge.globalCompositeOperation = 'source-in';
        edge.fillStyle = tint; edge.fillRect(0, 0, size, size);
        ctx.globalCompositeOperation = 'source-atop'; ctx.globalAlpha = 0.2;
        ctx.drawImage(rim, 0, 0);
      });
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
      return canvas;
    }

    setConfig(config) {
      Object.assign(this.config, config);
      this.textureDirty = true;
      this.geometryDirty = true;
    }

    setView(view) {
      if (view.open !== undefined) {
        const open = clamp(view.open, 0.06, 1);
        if (Math.abs(open - this.view.open) > 0.00005) this.geometryDirty = true;
        this.view.open = open;
      }
      if (view.explode !== undefined) {
        const explode = clamp(view.explode, 0, 1);
        if (Math.abs(explode - this.view.explode) > 0.00005) this.geometryDirty = true;
        this.view.explode = explode;
      }
      if (view.yaw !== undefined) this.view.yaw = view.yaw;
      if (view.pitch !== undefined) this.view.pitch = clamp(view.pitch, -1.25, 1.25);
      if (view.zoom !== undefined) this.view.zoom = clamp(view.zoom, 0.65, 1.6);
    }

    drawTexture() {
      const ctx = this.paint, c = this.config, width = 1536, height = 1024;
      const random = seeded();
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = c.paperColor;
      ctx.fillRect(0, 0, width, height);
      const tint = ctx.createLinearGradient(0, 0, 400, height);
      tint.addColorStop(0, 'rgba(255,255,255,.11)');
      tint.addColorStop(0.6, 'rgba(255,255,255,0)');
      tint.addColorStop(1, 'rgba(103,77,42,.045)');
      ctx.fillStyle = tint;
      ctx.fillRect(0, 0, width, height);
      ctx.strokeStyle = 'rgba(92,77,53,.025)';
      ctx.lineWidth = 0.8;
      for (let i = 0; i < 230; i++) {
        const x = random() * width, y = random() * height;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + 15 + random() * 50, y + random() * 3);
        ctx.stroke();
      }
      if (c.paper === 'silk') {
        ctx.strokeStyle = 'rgba(133,112,82,.055)';
        ctx.lineWidth = 0.6;
        for (let y = 0; y < height; y += 5) {
          ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
        }
      }
      if (c.paper === 'gold') {
        for (let i = 0; i < 160; i++) {
          ctx.fillStyle = `rgba(177,136,59,${0.15 + random() * 0.18})`;
          const x = random() * width, y = random() * height, r = 1 + random() * 3;
          ctx.beginPath();
          ctx.moveTo(x, y - r); ctx.lineTo(x + r * 1.7, y); ctx.lineTo(x, y + r * 0.8); ctx.lineTo(x - r, y);
          ctx.closePath(); ctx.fill();
        }
      }
      if (c.pattern === 'landscape') this.paintLandscape(ctx, random);
      if (c.pattern === 'bamboo') this.paintBamboo(ctx, random);
      if (c.pattern === 'crane') this.paintCranes(ctx);
      if (c.pattern === 'wave') this.paintWaves(ctx);
      this.paintInscription(ctx);
      if (this.gl) {
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
        this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.textureCanvas);
      }
      this.textureDirty = false;
    }

    paintLandscape(ctx, random) {
      const layers = [
        { y: 440, amplitude: 140, alpha: 0.15, phase: 1.8 },
        { y: 550, amplitude: 180, alpha: 0.19, phase: 0.5 },
        { y: 670, amplitude: 175, alpha: 0.24, phase: 3.7 },
        { y: 770, amplitude: 215, alpha: 0.33, phase: 5.0 }
      ];
      layers.forEach((layer, index) => {
        const points = [];
        for (let i = 0; i <= 64; i++) {
          const x = i * 24;
          const slope = Math.sin(i * 0.13 + layer.phase) * 0.52 + Math.sin(i * 0.34 + layer.phase) * 0.24 + Math.sin(i * 0.67) * 0.11;
          const y = layer.y - Math.pow(Math.max(0, slope + 0.4), 1.55) * layer.amplitude + (random() - 0.5) * 13;
          points.push([x, y]);
        }
        const wash = ctx.createLinearGradient(0, layer.y - layer.amplitude, 0, layer.y + 140);
        wash.addColorStop(0, `rgba(67,73,65,${layer.alpha})`);
        wash.addColorStop(0.5, `rgba(91,95,80,${layer.alpha * 0.75})`);
        wash.addColorStop(1, 'rgba(96,101,91,0)');
        ctx.beginPath(); ctx.moveTo(...points[0]);
        for (let i = 1; i < points.length - 1; i++) {
          const midX = (points[i][0] + points[i + 1][0]) / 2;
          const midY = (points[i][1] + points[i + 1][1]) / 2;
          ctx.quadraticCurveTo(...points[i], midX, midY);
        }
        ctx.lineTo(1536, layer.y + 180); ctx.lineTo(0, layer.y + 180); ctx.closePath();
        ctx.fillStyle = wash; ctx.fill();
        if (index >= 2) {
          ctx.strokeStyle = `rgba(54,63,54,${layer.alpha * 0.55})`;
          ctx.lineWidth = 0.9;
          for (let i = 4; i < points.length - 4; i += 2) {
            const [x, y] = points[i];
            ctx.beginPath(); ctx.moveTo(x, y + 7);
            ctx.bezierCurveTo(x - 13, y + 28, x - 15, y + 66, x - 41, y + 85 + random() * 32);
            ctx.stroke();
          }
        }
      });
      const fog = ctx.createLinearGradient(0, 670, 0, 880);
      fog.addColorStop(0, 'rgba(240,233,215,0)');
      fog.addColorStop(0.55, 'rgba(240,233,215,.35)');
      fog.addColorStop(1, 'rgba(240,233,215,0)');
      ctx.fillStyle = fog; ctx.fillRect(0, 670, 1536, 240);
      this.paintPine(ctx, 315, 650, 1.1, random);
      this.paintPine(ctx, 414, 700, 0.67, random);
      ctx.strokeStyle = 'rgba(58,65,53,.43)';
      ctx.lineWidth = 1.6;
      [[865, 384], [883, 373], [910, 400]].forEach(([x, y]) => {
        ctx.beginPath(); ctx.moveTo(x - 10, y + 3);
        ctx.quadraticCurveTo(x - 3, y - 5, x, y);
        ctx.quadraticCurveTo(x + 7, y - 6, x + 15, y - 4); ctx.stroke();
      });
      ctx.strokeStyle = 'rgba(84,89,73,.15)';
      for (let i = 0; i < 8; i++) {
        ctx.beginPath(); ctx.moveTo(650 + i * 17, 780 + i * 12);
        ctx.bezierCurveTo(800, 770 + i * 12, 870, 798 + i * 12, 1020 - i * 22, 788 + i * 12);
        ctx.stroke();
      }
    }

    paintPine(ctx, x, y, scale, random) {
      ctx.save(); ctx.translate(x, y); ctx.scale(scale, scale);
      ctx.strokeStyle = 'rgba(43,53,40,.63)';
      ctx.lineCap = 'round'; ctx.lineWidth = 7;
      ctx.beginPath(); ctx.moveTo(0, 30); ctx.bezierCurveTo(-23, -65, 14, -151, -18, -245); ctx.stroke();
      const branches = [[-8, -180, -93, -220], [-9, -143, 77, -186], [-7, -100, -102, -143], [-3, -60, 108, -99], [-12, -222, 30, -255]];
      branches.forEach(([a, b, tipX, tipY]) => {
        ctx.lineWidth = 3.2;
        ctx.beginPath(); ctx.moveTo(a, b); ctx.quadraticCurveTo(tipX * 0.55, tipY + 22, tipX, tipY); ctx.stroke();
        for (let j = 0; j < 85; j++) {
          const needleX = tipX + (random() - 0.5) * 90;
          const needleY = tipY + (random() - 0.5) * 23;
          ctx.strokeStyle = `rgba(43,54,40,${0.2 + random() * 0.42})`;
          ctx.lineWidth = 0.6 + random() * 1.1;
          ctx.beginPath(); ctx.moveTo(needleX, needleY);
          ctx.lineTo(needleX + (random() - 0.5) * 20, needleY - 7 - random() * 13); ctx.stroke();
        }
        ctx.strokeStyle = 'rgba(43,53,40,.63)';
      });
      ctx.restore();
    }

    paintBamboo(ctx, random) {
      ctx.save(); ctx.translate(395, 810); ctx.rotate(-0.13);
      for (let stem = 0; stem < 3; stem++) {
        const x = stem * 68, top = -410 - stem * 65;
        ctx.strokeStyle = 'rgba(44,61,46,.65)'; ctx.lineWidth = 7 - stem;
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.bezierCurveTo(x - 15, -160, x + 17, -340, x + 6, top); ctx.stroke();
        for (let y = -70; y > top; y -= 75) {
          ctx.strokeStyle = 'rgba(41,56,41,.67)'; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(x - 9, y); ctx.lineTo(x + 10, y - 1); ctx.stroke();
          const direction = y % 2 === 0 ? 1 : -1;
          ctx.beginPath(); ctx.moveTo(x, y);
          ctx.quadraticCurveTo(x + 65 * direction, y - 26, x + 126 * direction, y - 64); ctx.stroke();
          for (let leaf = 0; leaf < 8; leaf++) {
            const lx = x + (20 + leaf * 13) * direction, ly = y - 12 - leaf * 5;
            const dx = (25 + random() * 26) * direction, dy = -32 + random() * 54;
            ctx.fillStyle = `rgba(35,56,39,${0.45 + random() * 0.33})`;
            ctx.beginPath(); ctx.moveTo(lx, ly);
            ctx.quadraticCurveTo(lx + dx * 0.7 - 5, ly + dy * 0.15 - 10, lx + dx, ly + dy);
            ctx.quadraticCurveTo(lx + dx * 0.4 + 4, ly + dy * 0.55 + 5, lx, ly); ctx.fill();
          }
        }
      }
      ctx.restore();
      ctx.strokeStyle = 'rgba(64,83,59,.14)'; ctx.lineWidth = 2;
      for (let i = 0; i < 5; i++) {
        ctx.beginPath(); ctx.moveTo(860 + i * 29, 740);
        ctx.quadraticCurveTo(870 + i * 30, 530, 825 + i * 42, 420); ctx.stroke();
      }
    }

    paintCranes(ctx) {
      const crane = (x, y, angle, scale) => {
        ctx.save(); ctx.translate(x, y); ctx.rotate(angle); ctx.scale(scale, scale);
        ctx.fillStyle = 'rgba(250,247,232,.94)'; ctx.strokeStyle = 'rgba(89,86,71,.58)'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.ellipse(0, 0, 76, 34, -0.15, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = 'rgba(42,48,44,.86)';
        ctx.beginPath(); ctx.moveTo(-55, -18); ctx.bezierCurveTo(-95, -66, -153, -100, -189, -78);
        ctx.lineTo(-112, -10); ctx.quadraticCurveTo(-49, 31, 19, 19); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = 'rgba(51,59,54,.88)'; ctx.lineWidth = 13;
        ctx.beginPath(); ctx.moveTo(55, -6); ctx.bezierCurveTo(106, -10, 91, -94, 117, -114); ctx.stroke();
        ctx.strokeStyle = '#e4ddc8'; ctx.lineWidth = 7;
        ctx.beginPath(); ctx.moveTo(55, -9); ctx.bezierCurveTo(100, -19, 87, -91, 116, -115); ctx.stroke();
        ctx.fillStyle = '#a64532'; ctx.beginPath(); ctx.ellipse(121, -119, 12, 7, -0.2, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#373e37'; ctx.beginPath(); ctx.moveTo(127, -115); ctx.lineTo(161, -111); ctx.lineTo(127, -111); ctx.fill();
        ctx.strokeStyle = 'rgba(56,57,48,.76)'; ctx.lineWidth = 3;
        [-8, 16].forEach(offset => {
          ctx.beginPath(); ctx.moveTo(offset, 23); ctx.lineTo(offset - 18, 131); ctx.lineTo(offset - 10, 174); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(offset - 10, 174); ctx.lineTo(offset + 10, 178); ctx.stroke();
        });
        ctx.restore();
      };
      ctx.fillStyle = 'rgba(164,65,44,.72)'; ctx.beginPath(); ctx.arc(608, 350, 77, 0, Math.PI * 2); ctx.fill();
      crane(475, 600, -0.12, 1.15);
      crane(762, 637, 0.08, 0.9);
      ctx.strokeStyle = 'rgba(100,105,75,.43)'; ctx.lineWidth = 2;
      for (let i = 0; i < 14; i++) {
        const x = 202 + i * 29;
        ctx.beginPath(); ctx.moveTo(x, 902); ctx.quadraticCurveTo(x - 20, 762, x + 36, 690 + i % 4 * 18); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x + 18, 745); ctx.quadraticCurveTo(x + 50, 733, x + 55, 702); ctx.stroke();
      }
    }

    paintWaves(ctx) {
      ctx.strokeStyle = 'rgba(56,89,104,.28)'; ctx.lineWidth = 2;
      for (let row = 0; row < 9; row++) {
        for (let col = -1; col < 13; col++) {
          const x = col * 124 + row % 2 * 62, y = 510 + row * 43;
          for (let ring = 0; ring < 4; ring++) {
            ctx.beginPath(); ctx.arc(x, y, 29 + ring * 9, Math.PI * 1.08, Math.PI * 1.92); ctx.stroke();
          }
        }
      }
      ctx.fillStyle = 'rgba(187,153,74,.47)'; ctx.beginPath(); ctx.arc(555, 340, 61, 0, Math.PI * 2); ctx.fill();
    }

    paintInscription(ctx) {
      const c = this.config, families = FanRenderer.fontFamilies;
      const letters = Array.from(c.text).slice(0, 8);
      const family = families[c.font] || 'KaiTi';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = c.inkColor;
      let sealX = 1110, sealY = 660;
      if (c.textLayout === 'arc') {
        const spread = Math.min(1.65, Math.max(0.4, (letters.length - 1) * 0.46));
        const fontSize = Math.min(245, 860 / Math.max(letters.length, 1)) * c.textSize;
        ctx.font = `${fontSize}px ${JSON.stringify(family)}, cursive`;
        letters.forEach((letter, i) => {
          const a = letters.length === 1 ? 0 : (i / (letters.length - 1) - 0.5) * spread;
          const r = 2.03 + (i % 2 ? 0.015 : -0.015);
          const x = (Math.sin(a) * r + 2.72) / 5.44 * 1536;
          const y = (2.75 - Math.cos(a) * r) / 2.4 * 1024;
          ctx.save(); ctx.translate(x, y); ctx.rotate(a * 0.12);
          ctx.fillText(letter, 0, 0); ctx.restore();
        });
      } else {
        const fontSize = 104 * c.textSize;
        const columns = letters.length > 4 ? 2 : 1;
        const rows = Math.min(letters.length, 4);
        const advance = Math.min(120, fontSize + 16);
        ctx.font = `${fontSize}px ${JSON.stringify(family)}, cursive`;
        letters.forEach((letter, i) => {
          ctx.fillText(letter, 1080 - Math.floor(i / 4) * 130, 290 + i % 4 * advance);
        });
        sealX = 1040 - (columns - 1) * 130;
        sealY = Math.min(750, 300 + rows * advance + 8);
      }
      if (c.seal === 'none') return;
      ctx.save(); ctx.translate(sealX, sealY); ctx.rotate(-0.035);
      ctx.drawImage(FanRenderer.sealArtwork(c), 0, 0, 86, 86);
      ctx.restore();
    }

    newPart(name, tint, material) {
      const previous = this.parts.find(part => part.name === name);
      return { name, color: tint, material, vertices: [], buffer: previous ? previous.buffer : this.gl ? this.gl.createBuffer() : null };
    }

    triangle(part, a, b, c, uvA = [0, 0], uvB = [1, 0], uvC = [1, 1], normals) {
      const face = normalize(cross(subtract(b, a), subtract(c, a)));
      [a, b, c].forEach((point, i) => {
        part.vertices.push(...point, ...(normals ? normals[i] : face), ...[uvA, uvB, uvC][i]);
      });
    }

    quad(part, a, b, c, d, uv = [[0, 0], [1, 0], [1, 1], [0, 1]]) {
      this.triangle(part, a, b, c, uv[0], uv[1], uv[2]);
      this.triangle(part, a, c, d, uv[0], uv[2], uv[3]);
    }

    sweepBone(part, angle, big, index) {
      const c = this.config, explode = this.view.explode;
      const z = -0.027 + (index - c.ribCount / 2) * (1 - this.view.open) * 0.002 - explode * (big ? 0.11 : 0.22);
      const width = big ? 0.105 : 0.033;
      const thickness = big ? 0.026 : 0.012;
      const length = big ? 2.745 : 2.7;
      const tangent = [Math.cos(angle), -Math.sin(angle), 0];
      const profile = [
        [0, 0.78], [0.04, 1], [0.25, 0.94], [0.55, 0.78], [1.03, 0.68],
        [1.55, 0.58], [2.12, 0.52], [length - 0.03, 0.46], [length, 0.1]
      ];
      const rings = profile.map(([r, w]) => {
        const center = radial(r, angle, z);
        const ring = [];
        for (let side = 0; side < 8; side++) {
          const t = side / 8 * Math.PI * 2;
          const across = Math.cos(t) * width * w / 2;
          ring.push([center[0] + tangent[0] * across, center[1] + tangent[1] * across, center[2] + Math.sin(t) * thickness]);
        }
        return ring;
      });
      for (let ring = 0; ring < rings.length - 1; ring++) {
        for (let side = 0; side < 8; side++) {
          const next = (side + 1) % 8;
          const u = side / 8, v = profile[ring][0] / length;
          this.quad(part, rings[ring][side], rings[ring + 1][side], rings[ring + 1][next], rings[ring][next], [[u, v], [u, profile[ring + 1][0] / length], [u + 0.125, profile[ring + 1][0] / length], [u + 0.125, v]]);
        }
      }
      if (big) {
        let headProfile;
        if (c.head === 'square') headProfile = [[-0.025, 0.052], [-0.18, 0.052], [-0.19, 0.001]];
        else if (c.head === 'gourd') headProfile = [[-0.015, 0.049], [-0.07, 0.024], [-0.15, 0.067], [-0.23, 0.046], [-0.25, 0.004]];
        else headProfile = [[-0.015, 0.05], [-0.1, 0.051], [-0.155, 0.038], [-0.18, 0.002]];
        for (let i = 0; i < headProfile.length - 1; i++) {
          const [r1, w1] = headProfile[i], [r2, w2] = headProfile[i + 1];
          const p1 = radial(r1, angle, z), p2 = radial(r2, angle, z);
          const sidePoint = (p, w, side, depth) => [p[0] + tangent[0] * w * side, p[1] + tangent[1] * w * side, p[2] + depth];
          this.quad(part, sidePoint(p1, w1, -1, thickness), sidePoint(p2, w2, -1, thickness), sidePoint(p2, w2, 1, thickness), sidePoint(p1, w1, 1, thickness));
          this.quad(part, sidePoint(p1, w1, 1, -thickness), sidePoint(p2, w2, 1, -thickness), sidePoint(p2, w2, -1, -thickness), sidePoint(p1, w1, -1, -thickness));
          [-1, 1].forEach(side => this.quad(part, sidePoint(p1, w1, side, -thickness), sidePoint(p2, w2, side, -thickness), sidePoint(p2, w2, side, thickness), sidePoint(p1, w1, side, thickness)));
        }
      }
    }

    cylinder(part, center, radius, depth, sides = 28) {
      const zBack = center[2] - depth / 2, zFront = center[2] + depth / 2;
      for (let i = 0; i < sides; i++) {
        const a = i / sides * Math.PI * 2, b = (i + 1) / sides * Math.PI * 2;
        const point = (angle, z) => [center[0] + Math.cos(angle) * radius, center[1] + Math.sin(angle) * radius, z];
        this.quad(part, point(a, zBack), point(b, zBack), point(b, zFront), point(a, zFront));
        this.triangle(part, [center[0], center[1], zFront], point(a, zFront), point(b, zFront));
        this.triangle(part, [center[0], center[1], zBack], point(b, zBack), point(a, zBack));
      }
    }

    torus(part, center, radius, tubeRadius, major = 28, minor = 8, stretch = 1) {
      const p = (a, b) => [
        center[0] + (radius + Math.cos(b) * tubeRadius) * Math.cos(a),
        center[1] + (radius + Math.cos(b) * tubeRadius) * Math.sin(a) * stretch,
        center[2] + Math.sin(b) * tubeRadius
      ];
      for (let i = 0; i < major; i++) {
        for (let j = 0; j < minor; j++) {
          const a = i / major * Math.PI * 2, b = j / minor * Math.PI * 2;
          const a2 = (i + 1) / major * Math.PI * 2, b2 = (j + 1) / minor * Math.PI * 2;
          this.quad(part, p(a, b), p(a2, b), p(a2, b2), p(a, b2));
        }
      }
    }

    tube(part, points, radius, sides = 5) {
      const rings = points.map((point, index) => {
        const tangent = normalize(subtract(points[Math.min(index + 1, points.length - 1)], points[Math.max(index - 1, 0)]));
        const side = normalize(cross(tangent, Math.abs(tangent[2]) < 0.9 ? [0, 0, 1] : [0, 1, 0]));
        const up = normalize(cross(side, tangent));
        return Array.from({ length: sides }, (_, j) => {
          const a = j / sides * Math.PI * 2;
          return point.map((v, k) => v + radius * (side[k] * Math.cos(a) + up[k] * Math.sin(a)));
        });
      });
      for (let i = 0; i < rings.length - 1; i++) {
        for (let j = 0; j < sides; j++) this.quad(part, rings[i][j], rings[i + 1][j], rings[i + 1][(j + 1) % sides], rings[i][(j + 1) % sides]);
      }
    }

    buildGeometry() {
      const c = this.config, open = this.view.open, explode = this.view.explode;
      const wood = this.newPart('wood', WOODS[c.wood], 1);
      const smallWood = this.newPart('smallWood', WOODS[c.smallWood], 1);
      const paper = this.newPart('paper', [1, 1, 1], 0);
      const edge = this.newPart('edge', color(c.edgeColor), 4);
      const metal = this.newPart('metal', PINS[c.pin], c.pin === 'agate' ? 3 : 2);
      const carved = this.newPart('carved', WOODS[c.wood].map(n => n * 0.57), 4);
      const cordColor = c.pendant === 'ink' ? [0.19, 0.20, 0.19] : c.pendant === 'jade' ? [0.49, 0.46, 0.31] : [0.48, 0.115, 0.10];
      const cord = this.newPart('cord', cordColor, 4);
      const jade = this.newPart('jade', [0.40, 0.58, 0.45], 3);
      const inset = this.newPart('inset', [0.18, 0.15, 0.105], 2);
      const count = c.ribCount;
      const foldDepth = (0.011 + c.crease * 0.042) + (1 - open) * 0.065;
      const uv = (r, a) => {
        const p = radial(r, a);
        return [(p[0] + 2.72) / 5.44, (p[1] - 0.35) / 2.4];
      };
      for (let i = 0; i < count; i++) {
        const angle = (i / (count - 1) - 0.5) * SWEEP * open;
        const big = i === 0 || i === count - 1;
        this.sweepBone(big ? wood : smallWood, angle, big, i);
        if ((i === 0 || i === count - 1) && c.handle === 'carved') {
          for (let j = 0; j < 10; j++) {
            const r = 0.25 + j * 0.057;
            const p = radial(r, angle, 0.001 - explode * 0.11);
            const t = [Math.cos(angle), -Math.sin(angle), 0];
            this.tube(carved, [[p[0] - t[0] * 0.026, p[1] - t[1] * 0.026, p[2]], [p[0] + t[0] * 0.026, p[1] + t[1] * 0.026, p[2]]], 0.0019, 4);
          }
        }
      }
      for (let sector = 0; sector < count - 1; sector++) {
        for (let half = 0; half < 2; half++) {
          const fractionA = (sector + half * 0.5) / (count - 1);
          const fractionB = (sector + (half + 1) * 0.5) / (count - 1);
          const fullA = (fractionA - 0.5) * SWEEP, fullB = (fractionB - 0.5) * SWEEP;
          const angleA = fullA * open, angleB = fullB * open;
          const position = (r, angle, peak) => radial(r, angle, 0.024 + peak * foldDepth * (0.38 + r / RADIUS * 0.62) + explode * 0.58);
          for (let ring = 0; ring < 10; ring++) {
            const r1 = INNER + (RADIUS - INNER) * ring / 10;
            const r2 = INNER + (RADIUS - INNER) * (ring + 1) / 10;
            this.quad(paper, position(r1, angleA, half === 0 ? 0 : 1), position(r2, angleA, half === 0 ? 0 : 1), position(r2, angleB, half === 0 ? 1 : 0), position(r1, angleB, half === 0 ? 1 : 0), [uv(r1, fullA), uv(r2, fullA), uv(r2, fullB), uv(r1, fullB)]);
          }
          if (c.edge) {
            const edgeZ = 0.001;
            const outer = (r, angle, peak) => {
              const p = position(r, angle, peak); p[2] += edgeZ; return p;
            };
            this.quad(edge, outer(RADIUS - 0.018, angleA, half === 0 ? 0 : 1), outer(RADIUS, angleA, half === 0 ? 0 : 1), outer(RADIUS, angleB, half === 0 ? 1 : 0), outer(RADIUS - 0.018, angleB, half === 0 ? 1 : 0));
          }
        }
      }
      const pinZ = 0.027 + explode * 0.12;
      this.cylinder(metal, [0, 0, pinZ], 0.112, 0.048);
      this.torus(metal, [0, 0, pinZ + 0.024], 0.087, 0.015);
      this.cylinder(metal, [0, 0, pinZ + 0.037], 0.057, 0.018, 24);
      this.cylinder(inset, [0, 0, pinZ + 0.048], 0.011, 0.004, 12);
      if (c.pendant !== 'none') {
        const length = c.cordLength;
        const dropY = -0.36 * length;
        this.tube(cord, [[0.013, -0.043, 0.065], [0.053, -0.17, 0.062], [0.10, -0.27 * length, 0.045], [0.066, dropY, 0.035]], 0.008, 6);
        this.tube(cord, [[0.013, -0.043, 0.065], [-0.029, -0.14, 0.06], [0.024, -0.25 * length, 0.032], [0.066, dropY, 0.035]], 0.006, 6);
        if (c.pendant === 'jade') {
          this.torus(jade, [0.067, dropY - 0.142, 0.04], 0.105, 0.032, 32, 10, 1.13);
          this.cylinder(metal, [0.067, dropY - 0.016, 0.034], 0.027, 0.036, 16);
          this.tube(cord, [[0.068, dropY - 0.24, 0.04], [0.078, dropY - 0.34, 0.042], [0.092, dropY - 0.45, 0.04]], 0.01, 6);
        } else {
          this.torus(cord, [0.066, dropY - 0.025, 0.035], 0.037, 0.015, 18, 6, 0.82);
          this.cylinder(metal, [0.066, dropY - 0.083, 0.034], 0.032, 0.012, 16);
          for (let thread = 0; thread < 34; thread++) {
            const a = thread / 34 * Math.PI * 2;
            const offset = Math.sin(a) * 0.026;
            const points = [];
            for (let i = 0; i < 8; i++) {
              const t = i / 7;
              points.push([
                0.066 + offset * (1 + t * 2.1) + Math.sin(t * 2.8 + a) * 0.012 * t,
                dropY - 0.083 - t * (0.39 + Math.cos(a * 3) * 0.013) * length,
                0.035 + Math.cos(a) * 0.022 * (1 + t * 1.2)
              ]);
            }
            this.tube(cord, points, 0.0032, 4);
          }
        }
      }
      const next = [wood, smallWood, carved, metal, inset, cord, jade, paper, edge];
      if (this.gl) {
        const keep = new Set(next.map(part => part.buffer));
        this.parts.forEach(part => { if (!keep.has(part.buffer)) this.gl.deleteBuffer(part.buffer); });
        next.forEach(part => {
          part.count = part.vertices.length / 8;
          this.gl.bindBuffer(this.gl.ARRAY_BUFFER, part.buffer);
          this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(part.vertices), this.gl.DYNAMIC_DRAW);
        });
      }
      this.parts = next;
      this.geometryDirty = false;
    }

    matrices(width, height) {
      const aspect = width / Math.max(height, 1);
      const halfHeight = Math.max(2.24, 2.96 / aspect);
      const halfWidth = halfHeight * aspect;
      const projection = identity();
      projection[0] = 1 / halfWidth;
      projection[5] = 1 / halfHeight;
      projection[10] = -2 / 30;
      projection[14] = -1;
      const rot = rotation(this.view.yaw, this.view.pitch);
      const size = this.config.size / 9 * this.view.zoom;
      const scale = identity(); scale[0] = size; scale[5] = size; scale[10] = size;
      const center = identity(); center[13] = -0.91;
      const model = multiply(multiply(rot, scale), center);
      model[14] -= 8;
      const normal = new Float32Array([rot[0], rot[1], rot[2], rot[4], rot[5], rot[6], rot[8], rot[9], rot[10]]);
      return { model, mvp: multiply(projection, model), normal };
    }

    resize() {
      const rect = this.canvas.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(1, Math.round(rect.width * ratio));
      const height = Math.max(1, Math.round(rect.height * ratio));
      if (this.canvas.width !== width || this.canvas.height !== height) {
        this.canvas.width = width; this.canvas.height = height;
      }
      return { width, height };
    }

    render() {
      if (this.disposed || this.gl && this.gl.isContextLost()) return;
      const { width, height } = this.resize();
      if (this.textureDirty) this.drawTexture();
      if (this.geometryDirty) this.buildGeometry();
      const matrices = this.matrices(width, height);
      if (!this.gl) { this.render2D(width, height, matrices.mvp); return; }
      const gl = this.gl, loc = this.locations;
      gl.viewport(0, 0, width, height);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.useProgram(this.program);
      gl.uniformMatrix4fv(loc.uMVP, false, matrices.mvp);
      gl.uniformMatrix4fv(loc.uModel, false, matrices.model);
      gl.uniformMatrix3fv(loc.uNormal, false, matrices.normal);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.texture);
      gl.uniform1i(loc.uTexture, 0);
      gl.uniform1f(loc.uPaperKind, this.config.paper === 'silk' ? 1 : this.config.paper === 'gold' ? 2 : 0);
      this.parts.forEach(part => {
        if (!part.count) return;
        gl.bindBuffer(gl.ARRAY_BUFFER, part.buffer);
        gl.enableVertexAttribArray(loc.aPosition);
        gl.enableVertexAttribArray(loc.aNormal);
        gl.enableVertexAttribArray(loc.aUV);
        gl.vertexAttribPointer(loc.aPosition, 3, gl.FLOAT, false, 32, 0);
        gl.vertexAttribPointer(loc.aNormal, 3, gl.FLOAT, false, 32, 12);
        gl.vertexAttribPointer(loc.aUV, 2, gl.FLOAT, false, 32, 24);
        gl.uniform3fv(loc.uColor, part.color);
        gl.uniform1f(loc.uMaterial, part.material);
        gl.drawArrays(gl.TRIANGLES, 0, part.count);
      });
    }

    render2D(width, height, mvp) {
      const ctx = this.ctx;
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);
      const projected = p => {
        const out = project(mvp, p);
        return [(out[0] + 1) * width / 2, (1 - out[1]) * height / 2, out[2]];
      };
      const faces = [];
      this.parts.forEach(part => {
        for (let offset = 0; offset < part.vertices.length; offset += 24) {
          const vertices = [0, 8, 16].map(i => part.vertices.slice(offset + i, offset + i + 8));
          const points = vertices.map(v => projected(v.slice(0, 3)));
          faces.push({ part, vertices, points, depth: points.reduce((sum, p) => sum + p[2], 0) / 3 });
        }
      });
      faces.sort((a, b) => b.depth - a.depth);
      faces.forEach(({ part, vertices, points }) => {
        ctx.save(); ctx.beginPath(); ctx.moveTo(points[0][0], points[0][1]);
        ctx.lineTo(points[1][0], points[1][1]); ctx.lineTo(points[2][0], points[2][1]); ctx.closePath();
        if (part.material === 0) {
          ctx.clip();
          const source = vertices.map(v => [v[6] * 1536, (1 - v[7]) * 1024]);
          const [s0, s1, s2] = source, [d0, d1, d2] = points;
          const x1 = s1[0] - s0[0], y1 = s1[1] - s0[1], x2 = s2[0] - s0[0], y2 = s2[1] - s0[1];
          const det = x1 * y2 - x2 * y1;
          if (Math.abs(det) > 0.00001) {
            const dx1 = d1[0] - d0[0], dy1 = d1[1] - d0[1], dx2 = d2[0] - d0[0], dy2 = d2[1] - d0[1];
            const a = (dx1 * y2 - dx2 * y1) / det, b = (dy1 * y2 - dy2 * y1) / det;
            const c = (dx2 * x1 - dx1 * x2) / det, d = (dy2 * x1 - dy1 * x2) / det;
            ctx.transform(a, b, c, d, d0[0] - a * s0[0] - c * s0[1], d0[1] - b * s0[0] - d * s0[1]);
            ctx.drawImage(this.textureCanvas, 0, 0);
          }
        } else {
          const light = clamp(0.8 + Math.abs(vertices[0][5]) * 0.21, 0.65, 1);
          ctx.fillStyle = `rgb(${part.color.map(n => Math.round(n * 255 * light)).join(',')})`;
          ctx.fill();
        }
        ctx.restore();
        if (part.material === 0) {
          const shade = 0.03 + (1 - Math.abs(vertices[0][5])) * 0.14;
          ctx.fillStyle = `rgba(49,37,20,${shade})`;
          ctx.beginPath(); ctx.moveTo(points[0][0], points[0][1]);
          ctx.lineTo(points[1][0], points[1][1]); ctx.lineTo(points[2][0], points[2][1]); ctx.closePath(); ctx.fill();
        }
      });
    }

    destroy() {
      if (this.disposed) return;
      this.disposed = true;
      if (this.gl) {
        this.parts.forEach(part => this.gl.deleteBuffer(part.buffer));
        this.gl.deleteTexture(this.texture);
        this.gl.deleteProgram(this.program);
      }
      this.parts = [];
    }
  }

  window.FanRenderer = FanRenderer;
})();
