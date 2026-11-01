(() => {
  'use strict';
  const fui = window.KeplerFUI = window.KeplerFUI || {};

  // 想切换另一台船体，只改 ACTIVE_HULL：scout = Spaceshiptest（1.8k 面，小尺寸线框清晰）
  // viper = scifi_spaceship_viper_mark_ii（38k 面，线框在 240px 内会过密，适合更大的展示尺寸）
  // 换到没有内联数据的模型时，file:// 直开会退回 STANDBY，需按 assets/hull-model.js 首行注释重新生成内联数据
  const HULLS = {
    scout: { file: 'assets/Spaceshiptest.glb', tilt: -Math.PI / 2, embedded: true },
    viper: { file: 'assets/scifi_spaceship_viper_mark_ii.glb', tilt: 0 }
  };
  const ACTIVE_HULL = 'scout';

  const VERTEX = `
    attribute vec3 a_position;
    attribute vec3 a_normal;
    attribute vec3 a_bary;
    uniform mat4 u_projection;
    uniform mat4 u_view;
    uniform mat4 u_model;
    varying vec3 v_bary;
    varying vec3 v_normal;
    varying vec3 v_position;
    varying float v_depth;
    void main() {
      vec4 world = u_model * vec4(a_position, 1.0);
      vec4 eye = u_view * world;
      v_bary = a_bary;
      v_normal = mat3(u_model[0].xyz, u_model[1].xyz, u_model[2].xyz) * a_normal;
      v_position = world.xyz;
      v_depth = -eye.z;
      gl_Position = u_projection * eye;
    }
  `;

  const FRAGMENT = `
    precision mediump float;
    uniform vec3 u_color;
    uniform vec3 u_hot;
    uniform float u_time;
    uniform float u_opacity;
    uniform float u_camera;
    uniform float u_pass;
    varying vec3 v_bary;
    varying vec3 v_normal;
    varying vec3 v_position;
    varying float v_depth;

    void main() {
      vec3 delta = fwidth(v_bary);
      vec3 ramp = smoothstep(vec3(0.0), delta * 1.6, v_bary);
      float edge = 1.0 - min(min(ramp.x, ramp.y), ramp.z);
      if (edge < 0.004) discard;

      float facing = abs(normalize(v_normal).z);
      float rim = pow(1.0 - facing, 1.45);
      float scan = 0.5 + 0.5 * sin(v_position.y * 46.0 - u_time * 1.8);
      float sweep = smoothstep(0.62, 1.0, sin(v_position.y * 1.7 - u_time * 0.5) * 0.5 + 0.5);
      float fog = 1.0 - smoothstep(u_camera - 0.5, u_camera + 1.35, v_depth);
      float flicker = 0.955 + 0.045 * sin(u_time * 13.0);

      float alpha = edge * (0.14 + 0.84 * rim + 0.26 * sweep) * (0.86 + 0.14 * scan);
      alpha *= fog * flicker * u_opacity * u_pass;
      alpha = min(alpha, 0.86);

      vec3 tone = mix(u_color, u_hot, clamp(rim * 0.9 + sweep * 0.4, 0.0, 1.0));
      gl_FragColor = vec4(tone * alpha, alpha);
    }
  `;

  const COMPONENT_COUNT = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4 };
  const COMPONENT_TYPE = {
    5120: Int8Array, 5121: Uint8Array, 5122: Int16Array,
    5123: Uint16Array, 5125: Uint32Array, 5126: Float32Array
  };

  const isWhitespace = (value) => value === undefined || value === null || value === '';

  function readGlb(buffer) {
    const view = new DataView(buffer);
    if (view.byteLength < 20 || view.getUint32(0, true) !== 0x46546c67) throw new Error('Invalid GLB container');
    const total = Math.min(view.getUint32(8, true), view.byteLength);
    let json = null;
    let binary = null;
    let offset = 12;
    while (offset + 8 <= total) {
      const length = view.getUint32(offset, true);
      const type = view.getUint32(offset + 4, true);
      const start = offset + 8;
      if (type === 0x4e4f534a) json = JSON.parse(new TextDecoder().decode(new Uint8Array(buffer, start, length)));
      else if (type === 0x004e4942) binary = new Uint8Array(buffer, start, length);
      offset = start + length + ((4 - (length % 4)) % 4);
    }
    if (!json || !binary) throw new Error('GLB is missing a chunk');
    return { json, binary };
  }

  function readAccessor(gltf, binary, index) {
    const accessor = gltf.accessors[index];
    const view = gltf.bufferViews[accessor.bufferView];
    const per = COMPONENT_COUNT[accessor.type] || 1;
    const Ctor = COMPONENT_TYPE[accessor.componentType];
    const stride = view.byteStride;
    const offset = (view.byteOffset || 0) + (accessor.byteOffset || 0);
    if (stride && stride !== per * Ctor.BYTES_PER_ELEMENT) throw new Error('Interleaved geometry is unsupported');
    return new Ctor(binary.buffer, binary.byteOffset + offset, accessor.count * per);
  }

  // 取出三角形并烘焙朝向、居中、归一化到半径 ≈ 1 的模型空间
  function buildHull(gltf, binary, tilt) {
    const points = [];
    const normals = [];
    const indices = [];
    for (const mesh of gltf.meshes || []) {
      for (const primitive of mesh.primitives || []) {
        if (!isWhitespace(primitive.mode) && primitive.mode !== 4) continue;
        const position = readAccessor(gltf, binary, primitive.attributes.POSITION);
        const normal = isWhitespace(primitive.attributes.NORMAL) ? null : readAccessor(gltf, binary, primitive.attributes.NORMAL);
        const base = points.length / 3;
        points.push(...position);
        if (normal) normals.push(...normal);
        else for (let index = 0; index < position.length; index++) normals.push(0);
        if (!isWhitespace(primitive.indices)) {
          const source = readAccessor(gltf, binary, primitive.indices);
          for (let index = 0; index < source.length; index++) indices.push(source[index] + base);
        } else {
          const count = position.length / 3;
          for (let index = 0; index < count; index++) indices.push(index);
        }
      }
    }
    if (indices.length < 3) throw new Error('Hull has no triangles');

    const cos = Math.cos(tilt);
    const sin = Math.sin(tilt);
    const min = [Infinity, Infinity, Infinity];
    const max = [-Infinity, -Infinity, -Infinity];
    for (let index = 0; index < points.length; index += 3) {
      const x = points[index];
      const y = points[index + 1] * cos - points[index + 2] * sin;
      const z = points[index + 1] * sin + points[index + 2] * cos;
      points[index] = x;
      points[index + 1] = y;
      points[index + 2] = z;
      const ny = normals[index + 1] * cos - normals[index + 2] * sin;
      const nz = normals[index + 1] * sin + normals[index + 2] * cos;
      normals[index + 1] = ny;
      normals[index + 2] = nz;
      for (let axis = 0; axis < 3; axis++) {
        const value = points[index + axis];
        if (value < min[axis]) min[axis] = value;
        if (value > max[axis]) max[axis] = value;
      }
    }
    const center = [(min[0] + max[0]) / 2, (min[1] + max[1]) / 2, (min[2] + max[2]) / 2];
    const extent = [max[0] - min[0], max[1] - min[1], max[2] - min[2]];
    const scale = 2 / Math.max(extent[0], extent[1], extent[2], 1e-6);
    for (let index = 0; index < points.length; index += 3) {
      for (let axis = 0; axis < 3; axis++) points[index + axis] = (points[index + axis] - center[axis]) * scale;
    }
    for (let index = 0; index < normals.length; index += 3) {
      const length = Math.hypot(normals[index], normals[index + 1], normals[index + 2]) || 1;
      normals[index] /= length;
      normals[index + 1] /= length;
      normals[index + 2] /= length;
    }

    const triangles = indices.length / 3;
    const data = new Float32Array(triangles * 27);
    const bary = [1, 0, 0, 0, 1, 0, 0, 0, 1];
    let cursor = 0;
    for (let index = 0; index < triangles * 3; index++) {
      const vertex = indices[index] * 3;
      let nx = normals[vertex];
      let ny = normals[vertex + 1];
      let nz = normals[vertex + 2];
      if (nx === 0 && ny === 0 && nz === 0) {
        const a = indices[index - (index % 3)] * 3;
        const b = indices[index - (index % 3) + 1] * 3;
        const c = indices[index - (index % 3) + 2] * 3;
        const ab = [points[b] - points[a], points[b + 1] - points[a + 1], points[b + 2] - points[a + 2]];
        const ac = [points[c] - points[a], points[c + 1] - points[a + 1], points[c + 2] - points[a + 2]];
        nx = ab[1] * ac[2] - ab[2] * ac[1];
        ny = ab[2] * ac[0] - ab[0] * ac[2];
        nz = ab[0] * ac[1] - ab[1] * ac[0];
        const length = Math.hypot(nx, ny, nz) || 1;
        nx /= length; ny /= length; nz /= length;
      }
      data[cursor++] = points[vertex];
      data[cursor++] = points[vertex + 1];
      data[cursor++] = points[vertex + 2];
      data[cursor++] = nx;
      data[cursor++] = ny;
      data[cursor++] = nz;
      const step = (index % 3) * 3;
      data[cursor++] = bary[step];
      data[cursor++] = bary[step + 1];
      data[cursor++] = bary[step + 2];
    }
    // 取景用的顶点采样：包围盒角点比真实船体大一圈，直接用角点取景会把模型推得太远
    const total = points.length / 3;
    const stride = Math.max(1, Math.floor(total / 1200)) * 3;
    const sample = [];
    for (let index = 0; index < points.length; index += stride) {
      sample.push(points[index], points[index + 1], points[index + 2]);
    }
    return {
      data,
      vertices: triangles * 3,
      extent: [extent[0] * scale / 2, extent[1] * scale / 2, extent[2] * scale / 2],
      sample: Float32Array.from(sample)
    };
  }

  function multiply(a, b) {
    const out = new Float32Array(16);
    for (let column = 0; column < 4; column++) {
      for (let row = 0; row < 4; row++) {
        let sum = 0;
        for (let step = 0; step < 4; step++) sum += a[step * 4 + row] * b[column * 4 + step];
        out[column * 4 + row] = sum;
      }
    }
    return out;
  }

  function rotationX(angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return new Float32Array([1, 0, 0, 0, 0, cos, sin, 0, 0, -sin, cos, 0, 0, 0, 0, 1]);
  }

  function rotationY(angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return new Float32Array([cos, 0, -sin, 0, 0, 1, 0, 0, sin, 0, cos, 0, 0, 0, 0, 1]);
  }

  function rotationZ(angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return new Float32Array([cos, sin, 0, 0, -sin, cos, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
  }

  function translation(x, y, z) {
    return new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1]);
  }

  // 采样顶点经 model 旋转后，在视平面上的半宽、半高与纵向中心
  // 采样点在 NDC 空间的实际包围盒：透视会让“视空间中心”和“屏幕中心”错开，
  // 所以取景必须在投影之后量，才能既贴满又不裁边。
  function screenBounds(sample, model, distance, aspect, fov) {
    if (!sample || !sample.length) return { halfW: 1, halfH: 1, centerX: 0, centerY: 0 };
    const f = 1 / Math.tan(fov / 2);
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    for (let i = 0; i < sample.length; i += 3) {
      const x = model[0] * sample[i] + model[4] * sample[i + 1] + model[8] * sample[i + 2];
      const y = model[1] * sample[i] + model[5] * sample[i + 1] + model[9] * sample[i + 2];
      const z = model[2] * sample[i] + model[6] * sample[i + 1] + model[10] * sample[i + 2];
      const depth = distance - z;
      if (depth < 0.12) continue;
      const nx = (f / aspect) * x / depth;
      const ny = f * y / depth;
      if (nx < minX) minX = nx;
      if (nx > maxX) maxX = nx;
      if (ny < minY) minY = ny;
      if (ny > maxY) maxY = ny;
    }
    if (minX > maxX) return { halfW: 1, halfH: 1, centerX: 0, centerY: 0 };
    return {
      halfW: (maxX - minX) / 2,
      halfH: (maxY - minY) / 2,
      centerX: (maxX + minX) / 2,
      centerY: (maxY + minY) / 2,
      f
    };
  }

  function perspective(field, aspect, near, far) {
    const f = 1 / Math.tan(field / 2);
    const range = 1 / (near - far);
    return new Float32Array([
      f / aspect, 0, 0, 0,
      0, f, 0, 0,
      0, 0, (far + near) * range, -1,
      0, 0, 2 * far * near * range, 0
    ]);
  }

  function parseHex(value, fallback) {
    const match = /^#?([\da-f]{6})$/i.exec((value || '').trim());
    if (!match) return fallback;
    const number = parseInt(match[1], 16);
    return [((number >> 16) & 255) / 255, ((number >> 8) & 255) / 255, (number & 255) / 255];
  }

  function createRenderer(canvas, options = {}) {
    const stage = canvas.closest('.holo-stage');
    const status = stage ? stage.querySelector('[data-holo-status]') : null;
    const readout = stage ? stage.querySelector('[data-holo-spin]') : null;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const settings = HULLS[options.hull || ACTIVE_HULL] || HULLS.scout;
    const field = 30 * Math.PI / 180;

    // 固定用 WebGL1：fwidth 走 OES_standard_derivatives，比在 WebGL2 里跑 ES1 着色器更省心
    const attributes = { alpha: true, antialias: false, depth: true, premultipliedAlpha: true, powerPreference: 'low-power' };
    const gl = canvas.getContext('webgl', attributes) || canvas.getContext('experimental-webgl', attributes);
    if (!gl) {
      stage?.classList.add('is-offline');
      if (status) status.textContent = 'NO GL';
      return null;
    }
    if (!gl.getContextAttributes()?.depth) {
      stage?.classList.add('is-offline');
      if (status) status.textContent = 'NO DEPTH';
      return null;
    }

    if (!gl.getExtension('OES_standard_derivatives')) {
      stage?.classList.add('is-offline');
      if (status) status.textContent = 'NO DERIVATIVE';
      return null;
    }

    let program = null;
    let buffer = null;
    let hull = null;
    let frame = 0;
    let clock = 0;
    let last = 0;
    let playing = false;
    let desired = options.playing !== false;
    let ready = false;
    let uniform = {};
    let width = 1;
    let height = 1;

    function compile(type, source) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const log = gl.getShaderInfoLog(shader);
        gl.deleteShader(shader);
        throw new Error(log || 'Shader compilation failed');
      }
      return shader;
    }

    function initialize() {
      const shaders = [];
      try {
        const prefix = '#extension GL_OES_standard_derivatives : enable\n';
        shaders.push(compile(gl.VERTEX_SHADER, VERTEX));
        shaders.push(compile(gl.FRAGMENT_SHADER, prefix + FRAGMENT));
        program = gl.createProgram();
        shaders.forEach((shader) => gl.attachShader(program, shader));
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) || 'Program linking failed');
        uniform = {
          projection: gl.getUniformLocation(program, 'u_projection'),
          view: gl.getUniformLocation(program, 'u_view'),
          model: gl.getUniformLocation(program, 'u_model'),
          color: gl.getUniformLocation(program, 'u_color'),
          hot: gl.getUniformLocation(program, 'u_hot'),
          time: gl.getUniformLocation(program, 'u_time'),
          opacity: gl.getUniformLocation(program, 'u_opacity'),
          camera: gl.getUniformLocation(program, 'u_camera'),
          pass: gl.getUniformLocation(program, 'u_pass')
        };
        const root = getComputedStyle(document.documentElement);
        gl.useProgram(program);
        gl.uniform3fv(uniform.color, parseHex(root.getPropertyValue('--cyan'), [0.674, 0.804, 0.835]));
        gl.uniform3fv(uniform.hot, [0.729, 0.855, 0.894]);
        gl.clearColor(0, 0, 0, 0);
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE);
        gl.disable(gl.CULL_FACE);
        return true;
      } catch (error) {
        console.warn('Hologram projection unavailable:', error.message);
        stage?.classList.add('is-offline');
        if (status) status.textContent = 'NO SHADER';
        return false;
      } finally {
        shaders.forEach((shader) => gl.deleteShader(shader));
      }
    }

    function resize() {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(1, Math.round(rect.width * ratio));
      height = Math.max(1, Math.round(rect.height * ratio));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      if (ready) render(clock);
    }

    // 取景状态跨帧保留，才能做缓动而不是每帧重新计算导致抖动
    let camDistance = 0;
    let viewX = 0;
    let viewY = 0;

    function render(time) {
      if (!ready) return;
      const aspect = width / height;
      const spin = 0.72 + time * (Math.PI * 2 / 38);
      const tilt = -0.72 + Math.sin(time * 0.16) * 0.06;
      const roll = 0.06 + Math.sin(time * 0.11) * 0.04;
      const bob = Math.sin(time * 0.42) * 0.02;
      const model = multiply(translation(0, bob, 0), multiply(rotationZ(roll), multiply(rotationX(tilt), rotationY(spin))));
      // 用包围盒 8 个角点求真实的投影范围：既不会随自转裁边，也不会像“圆盘上界”那样把船推得太远
      // 迭代两次解取景：投影范围与机位互相依赖，单次估算会留偏差
      let goal = camDistance || 6;
      let box = screenBounds(hull.sample, model, goal, aspect, field);
      for (let pass = 0; pass < 2; pass++) {
        // NDC 半径与机位近似成反比：占得太满就拉远（fill > 1），太空就靠近
        const fill = Math.max(box.halfW / 0.90, box.halfH / 0.86);
        if (fill > 0.001 && fill < 12) goal *= fill;
        box = screenBounds(hull.sample, model, goal, aspect, field);
      }
      // 首帧直接落位，之后缓动跟手，避免逐帧跳动
      camDistance = camDistance ? camDistance + (goal - camDistance) * 0.16 : goal;
      // 按投影中心把船体挪到展示舱正中（NDC 偏差换算回视空间）
      const targetX = -box.centerX * camDistance * aspect / box.f;
      const targetY = -box.centerY * camDistance / box.f;
      if (!viewX && !viewY) { viewX = targetX; viewY = targetY; }
      viewX += (targetX - viewX) * 0.14;
      viewY += (targetY - viewY) * 0.14;
      const view = translation(viewX, viewY, -camDistance);

      gl.viewport(0, 0, width, height);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.useProgram(program);
      gl.uniformMatrix4fv(uniform.projection, false, perspective(field, aspect, Math.max(0.2, camDistance - 1.9), camDistance + 1.9));
      gl.uniformMatrix4fv(uniform.view, false, view);
      gl.uniformMatrix4fv(uniform.model, false, model);
      gl.uniform1f(uniform.time, time);
      gl.uniform1f(uniform.camera, camDistance);
      gl.uniform1f(uniform.opacity, 0.72);

      gl.depthMask(false);
      gl.disable(gl.DEPTH_TEST);
      gl.uniform1f(uniform.pass, 0.26);
      gl.drawArrays(gl.TRIANGLES, 0, hull.vertices);

      gl.enable(gl.DEPTH_TEST);
      gl.depthMask(true);
      gl.uniform1f(uniform.pass, 1);
      gl.drawArrays(gl.TRIANGLES, 0, hull.vertices);

      if (readout) {
        const degrees = Math.round((spin * 180 / Math.PI) % 360);
        const label = String(degrees).padStart(3, '0') + '\u00b0';
        if (readout.textContent !== label) readout.textContent = label;
      }
    }

    function tick(timestamp) {
      if (!playing) { frame = 0; return; }
      if (last) clock += Math.min((timestamp - last) / 1000, 0.08);
      last = timestamp;
      render(clock);
      frame = requestAnimationFrame(tick);
    }

    function setPlaying(next) {
      desired = Boolean(next);
      playing = desired && ready && !reduceMotion.matches;
      if (!playing) { cancelAnimationFrame(frame); frame = 0; last = 0; if (ready) render(clock); return; }
      if (frame) return;
      last = 0;
      frame = requestAnimationFrame(tick);
    }

    // file:// 下浏览器会拦截本地 fetch，此时退回 assets/hull-model.js 内联的同一份几何
    function decodeEmbedded() {
      const source = window.KEPLER_HULL_DATA;
      if (!settings.embedded || !source || !source.base64) throw new Error('No inline hull data');
      const raw = atob(source.base64);
      const bytes = new Uint8Array(raw.length);
      for (let index = 0; index < raw.length; index++) bytes[index] = raw.charCodeAt(index);
      return bytes.buffer;
    }

    async function load() {
      let buffer;
      try {
        const response = await fetch(settings.file, { cache: 'force-cache' });
        if (!response.ok) throw new Error('Hull asset returned ' + response.status);
        buffer = await response.arrayBuffer();
      } catch (error) {
        buffer = decodeEmbedded();
      }
      const gltf = readGlb(buffer);
      return buildHull(gltf.json, gltf.binary, settings.tilt);
    }

    if (!initialize()) return null;

    load().then((geometry) => {
      hull = geometry;
      buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, hull.data, gl.STATIC_DRAW);
      const position = gl.getAttribLocation(program, 'a_position');
      const normal = gl.getAttribLocation(program, 'a_normal');
      const bary = gl.getAttribLocation(program, 'a_bary');
      const stride = 9 * 4;
      gl.enableVertexAttribArray(position);
      gl.vertexAttribPointer(position, 3, gl.FLOAT, false, stride, 0);
      gl.enableVertexAttribArray(normal);
      gl.vertexAttribPointer(normal, 3, gl.FLOAT, false, stride, 12);
      gl.enableVertexAttribArray(bary);
      gl.vertexAttribPointer(bary, 3, gl.FLOAT, false, stride, 24);
      ready = true;
      stage?.classList.add('is-live');
      if (status) status.textContent = 'LIVE';
      resize();
      render(clock);
      setPlaying(desired);
    }).catch((error) => {
      console.warn('Hologram projection standby:', error.message);
      if (stage) stage.classList.add('is-standby');
      if (status) status.textContent = 'STANDBY';
    });

    const sizes = new ResizeObserver(resize);
    sizes.observe(canvas);
    reduceMotion.addEventListener('change', () => setPlaying(desired));
    canvas.addEventListener('webglcontextlost', (event) => {
      event.preventDefault();
      ready = false;
      playing = false;
      cancelAnimationFrame(frame);
      frame = 0;
      stage?.classList.remove('is-live');
      if (status) status.textContent = 'LINK LOST';
    });

    return { setPlaying, resize };
  }

  fui.createHologram = createRenderer;
})();
