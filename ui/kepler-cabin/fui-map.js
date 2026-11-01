(() => {
  'use strict';
  const fui = window.KeplerFUI = window.KeplerFUI || {};

  // 战术图标定点（uv = 贴图坐标，左上为原点）
  const SITES = [
    { code: 'S-01', name: 'TYCHO RIDGE', uv: [0.316, 0.404], state: 'SURVEY', depth: '112.4' },
    { code: 'S-02', name: 'COPERNICUS', uv: [0.466, 0.316], state: 'PRIMARY', depth: '86.1' },
    { code: 'S-03', name: 'RIMA SYSTEM', uv: [0.374, 0.616], state: 'SURVEY', depth: '134.9' },
    { code: 'S-04', name: 'MARE EDGE', uv: [0.616, 0.472], state: 'RELAY', depth: '97.6' },
    { code: 'S-05', name: 'IMPACT 07', uv: [0.532, 0.700], state: 'STRIKE', depth: '42.3' }
  ];

  const VERTEX = `
    attribute vec2 a_position;
    void main() { gl_Position = vec4(a_position, 0.0, 1.0); }
  `;

  const FRAGMENT = `
    precision mediump float;
    uniform sampler2D u_map;
    uniform vec2 u_resolution;
    uniform float u_time;
    uniform vec2 u_pan;
    uniform float u_zoom;
    uniform float u_rotate;
    uniform vec2 u_target;
    uniform vec3 u_ink;
    uniform vec3 u_warm;
    uniform float u_grid;
    uniform float u_lock;

    vec2 spin(vec2 p, float a) {
      float c = cos(a);
      float s = sin(a);
      return vec2(c * p.x - s * p.y, s * p.x + c * p.y);
    }

    float iso(float x, float w) {
      return 1.0 - smoothstep(0.0, w, abs(fract(x + 0.5) - 0.5));
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / u_resolution;
      float aspect = u_resolution.x / u_resolution.y;

      vec2 p = (uv - 0.5) * vec2(aspect, 1.0);
      p = spin(p, -u_rotate);
      vec2 m = u_pan + p / u_zoom;

      vec2 clampUv = clamp(m, vec2(0.002), vec2(0.998));
      vec2 texel = vec2(0.0046);
      float h = texture2D(u_map, clampUv).r;
      float hs = h;
      hs += texture2D(u_map, clampUv + vec2(texel.x, 0.0)).r;
      hs += texture2D(u_map, clampUv - vec2(texel.x, 0.0)).r;
      hs += texture2D(u_map, clampUv + vec2(0.0, texel.y)).r;
      hs += texture2D(u_map, clampUv - vec2(0.0, texel.y)).r;
      hs += texture2D(u_map, clampUv + texel).r;
      hs += texture2D(u_map, clampUv - texel).r;
      hs += texture2D(u_map, clampUv + vec2(texel.x, -texel.y)).r;
      hs += texture2D(u_map, clampUv + vec2(-texel.x, texel.y)).r;
      hs /= 9.0;

      float highland = smoothstep(0.30, 0.58, hs);
      float mare = 1.0 - highland;
      float relief = smoothstep(0.004, 0.026, fwidth(hs));

      float minor = iso(hs * 26.0, fwidth(hs * 26.0) * 1.25);
      float major = iso(hs * 8.0, fwidth(hs * 8.0) * 1.6);
      float hatch = step(0.62, fract((m.x + m.y) * 210.0)) * mare * 0.5;

      vec2 g = m * u_grid;
      vec2 gf = abs(fract(g + 0.5) - 0.5);
      float lattice = 1.0 - smoothstep(0.0, fwidth(g.x) * 1.35, min(gf.x, gf.y));
      vec2 cellId = floor(g);
      float rnd = fract(sin(dot(cellId, vec2(12.9898, 78.233))) * 43758.5453);
      // 采样小方块：只在高地稀疏出现，避免整片灰斑
      float inside = 1.0 - step(0.22, max(gf.x, gf.y));
      float block = inside * step(0.945, rnd) * (0.45 + 0.55 * sin(u_time * 1.6 + rnd * 26.0)) * highland;

      float sweep = fract(u_time * 0.052);
      float ds = abs(uv.y - sweep);
      float band = exp(-pow(ds * 30.0, 2.0));
      float front = exp(-pow(ds * 130.0, 2.0));

      vec2 dp = (uv - u_target) * vec2(aspect, 1.0);
      float radius = length(dp);
      float angle = atan(dp.y, dp.x);
      float wedge = smoothstep(0.2, 0.9, sin(angle - u_time * 1.15)) * exp(-radius * 3.1);
      float lockRing = exp(-pow((radius - 0.118) / 0.008, 2.0)) * u_lock;
      float wave = fract(u_time * 0.34);
      float ping = exp(-pow((radius - wave * 0.42) / 0.014, 2.0)) * (1.0 - wave) * u_lock;

      float edgeFade = smoothstep(0.0, 0.03, m.x) * smoothstep(0.0, 0.03, 1.0 - m.x)
                     * smoothstep(0.0, 0.03, m.y) * smoothstep(0.0, 0.03, 1.0 - m.y);
      float vig = smoothstep(1.14, 0.24, length((uv - 0.5) * vec2(aspect, 1.0)));

      vec3 ink = mix(u_ink, u_warm, highland * 0.68);
      vec3 col = vec3(0.007, 0.014, 0.017);
      col += ink * highland * 0.030;
      col += ink * relief * 0.075;
      col += ink * hatch * 0.030;
      col += ink * minor * (0.042 + highland * 0.096);
      col += ink * major * (0.124 + highland * 0.206);
      col += ink * lattice * 0.072;
      col += ink * block * 0.085;
      col += ink * (band * 0.030 + front * 0.130) * (0.40 + highland);
      col += ink * wedge * 0.05;
      col += ink * ping * 0.28;

      float grain = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233)) + u_time * 0.4) * 43758.5453);
      col += (grain - 0.5) * 0.008;
      col *= vig * mix(1.0, edgeFade, 0.9);

      gl_FragColor = vec4(col, 1.0);
    }
  `;

  function parseHex(value, fallback) {
    const match = /^#?([\da-f]{6})$/i.exec((value || '').trim());
    if (!match) return fallback;
    const number = parseInt(match[1], 16);
    return [((number >> 16) & 255) / 255, ((number >> 8) & 255) / 255, (number & 255) / 255];
  }

  function createMap(canvas, options = {}) {
    const root = canvas.closest('[data-map-root]') || canvas.parentElement;
    const overlay = root.querySelector('[data-map-overlay]');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const gl = canvas.getContext('webgl', { alpha: false, antialias: false, depth: false, premultipliedAlpha: false, powerPreference: 'low-power' })
      || canvas.getContext('experimental-webgl', { alpha: false, antialias: false, depth: false });

    if (!gl.getExtension('OES_standard_derivatives')) {
      root.classList.add('is-offline');
      return null;
    }

    const camera = { pan: { x: 0.40, y: 0.48 }, zoom: 1.02, rotate: 0 };
    const state = { playing: false, ready: false, track: 0, lock: false, cover: 1.2 };
    let resolveReady;
    const ready = new Promise((resolve) => { resolveReady = resolve; });

    if (!gl) {
      root.classList.add('is-offline');
      return null;
    }

    let program = null;
    let buffer = null;
    let uniform = {};
    let frame = 0;
    let clock = 0;
    let last = 0;
    let rect = canvas.getBoundingClientRect();
    let nodes = [];

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
        shaders.push(compile(gl.VERTEX_SHADER, VERTEX));
        shaders.push(compile(gl.FRAGMENT_SHADER, '#extension GL_OES_standard_derivatives : enable\n' + FRAGMENT));
        program = gl.createProgram();
        shaders.forEach((shader) => gl.attachShader(program, shader));
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) || 'Program linking failed');
        uniform = {
          map: gl.getUniformLocation(program, 'u_map'),
          resolution: gl.getUniformLocation(program, 'u_resolution'),
          time: gl.getUniformLocation(program, 'u_time'),
          pan: gl.getUniformLocation(program, 'u_pan'),
          zoom: gl.getUniformLocation(program, 'u_zoom'),
          rotate: gl.getUniformLocation(program, 'u_rotate'),
          target: gl.getUniformLocation(program, 'u_target'),
          ink: gl.getUniformLocation(program, 'u_ink'),
          warm: gl.getUniformLocation(program, 'u_warm'),
          grid: gl.getUniformLocation(program, 'u_grid'),
          lock: gl.getUniformLocation(program, 'u_lock')
        };
        buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
        const position = gl.getAttribLocation(program, 'a_position');
        gl.enableVertexAttribArray(position);
        gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
        gl.useProgram(program);
        gl.uniform1i(uniform.map, 0);
        const tokens = getComputedStyle(document.documentElement);
        gl.uniform3fv(uniform.ink, parseHex(tokens.getPropertyValue('--cyan'), [0.65, 0.75, 0.77]));
        gl.uniform3fv(uniform.warm, parseHex(tokens.getPropertyValue('--sand'), [0.79, 0.74, 0.62]));
        return true;
      } catch (error) {
        console.warn('Tactical map unavailable:', error.message);
        root.classList.add('is-offline');
        return false;
      } finally {
        shaders.forEach((shader) => gl.deleteShader(shader));
      }
    }

    function resize() {
      rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      state.cover = Math.max(rect.width / Math.max(rect.height, 1), 1);
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(1, Math.round(rect.width * ratio));
      const height = Math.max(1, Math.round(rect.height * ratio));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      if (state.ready) render(clock);
    }

    // 贴图坐标 → 画布像素坐标（与顶点/片元里的变换严格互逆）
    function project(uv) {
      const aspect = rect.width / Math.max(rect.height, 1);
      const zoom = camera.zoom * state.cover;
      const x = (uv[0] - camera.pan.x) * zoom;
      const y = (uv[1] - camera.pan.y) * zoom;
      const cos = Math.cos(camera.rotate);
      const sin = Math.sin(camera.rotate);
      const rx = cos * x - sin * y;
      const ry = sin * x + cos * y;
      return { x: (rx / aspect + 0.5) * rect.width, y: (0.5 - ry) * rect.height };
    }

    const siteUv = (site) => [site.uv[0], 1 - site.uv[1]];

    function render(time) {
      if (!state.ready || !rect.width) return;
      const target = project(siteUv(SITES[state.track] || SITES[0]));
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.useProgram(program);
      gl.uniform2f(uniform.resolution, canvas.width, canvas.height);
      gl.uniform1f(uniform.time, time);
      gl.uniform2f(uniform.pan, camera.pan.x, camera.pan.y);
      gl.uniform1f(uniform.zoom, camera.zoom * state.cover);
      gl.uniform1f(uniform.rotate, camera.rotate);
      gl.uniform2f(uniform.target, target.x / Math.max(rect.width, 1), 1 - target.y / Math.max(rect.height, 1));
      gl.uniform1f(uniform.grid, 9.0 * Math.pow(camera.zoom * state.cover, 0.55));
      gl.uniform1f(uniform.lock, state.lock ? 1 : 0.3);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      paintOverlay();
      options.onFrame?.(camera, time);
    }

    function tick(timestamp) {
      if (!state.playing) { frame = 0; return; }
      if (last) clock += Math.min((timestamp - last) / 1000, 0.08);
      last = timestamp;
      render(clock);
      frame = requestAnimationFrame(tick);
    }

    function setPlaying(next) {
      state.playing = Boolean(next) && state.ready && !reduceMotion.matches;
      if (!state.playing) {
        cancelAnimationFrame(frame);
        frame = 0;
        last = 0;
        if (state.ready) render(clock);
        return;
      }
      if (frame) return;
      last = 0;
      frame = requestAnimationFrame(tick);
    }

    function paintOverlay() {
      if (!overlay) return;
      const active = state.track;
      const target = project(siteUv(SITES[active] || SITES[0]));
      const reticle = overlay.querySelector('.map-reticle');
      if (reticle) {
        reticle.style.transform = `translate3d(${target.x.toFixed(1)}px, ${target.y.toFixed(1)}px, 0)`;
        const site = SITES[active] || SITES[0];
        const code = reticle.querySelector('[data-lock-code]');
        const state = reticle.querySelector('[data-lock-state]');
        if (code) code.textContent = site.code;
        if (state) { state.textContent = site.state; state.dataset.state = site.state.toLowerCase(); }
      }
      nodes.forEach(({ marker, line, site }, index) => {
        const point = project(siteUv(site));
        const near = point.x > -80 && point.x < rect.width + 80 && point.y > -40 && point.y < rect.height + 40;
        marker.style.opacity = near ? '1' : '0';
        marker.style.transform = `translate3d(${point.x.toFixed(1)}px, ${point.y.toFixed(1)}px, 0)`;
        marker.classList.toggle('is-tracked', index === active);
        const flipX = point.x > rect.width * 0.58;
        const flipY = point.y > rect.height * 0.62;
        const dx = flipX ? -104 : 26;
        const dy = flipY ? -30 : 16;
        marker.style.setProperty('--label-x', `${dx}px`);
        marker.style.setProperty('--label-y', `${dy}px`);
        line.setAttribute('points', `${point.x.toFixed(1)},${point.y.toFixed(1)} ${(point.x + dx * 0.55).toFixed(1)},${(point.y + dy - 6).toFixed(1)} ${(point.x + dx - 4).toFixed(1)},${(point.y + dy - 6).toFixed(1)}`);
        line.classList.toggle('is-tracked', index === active);
      });
    }

    function buildOverlay() {
      if (!overlay) return;
      const svg = overlay.querySelector('.map-leaders') || document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      if (!svg.parentElement) {
        svg.setAttribute('class', 'map-leaders');
        overlay.prepend(svg);
      }
      const reticle = document.createElement('div');
      reticle.className = 'map-reticle';
      reticle.innerHTML = '<span class="reticle-ring"></span>'
        + '<span class="reticle-gate"><i></i><i></i><i></i><i></i></span>'
        + '<span class="reticle-tick reticle-tick--n"></span><span class="reticle-tick reticle-tick--e"></span>'
        + '<span class="reticle-tick reticle-tick--s"></span><span class="reticle-tick reticle-tick--w"></span>'
        + '<span class="reticle-core"></span>'
        + '<span class="reticle-lock"><b data-lock-code>—</b><span data-lock-state>—</span><i class="lock-meter"><em></em></i></span>';
      overlay.prepend(reticle);
      nodes = SITES.map((site, index) => {
        const marker = document.createElement('button');
        marker.type = 'button';
        marker.className = 'map-marker';
        marker.dataset.index = String(index);
        marker.dataset.state = site.state.toLowerCase();
        marker.innerHTML = `<span class="marker-pin"></span><span class="marker-label"><span class="marker-code">${site.code}</span><span class="marker-name">${site.name}</span></span>`;
        marker.addEventListener('click', (event) => {
          event.preventDefault();
          fui.focusSite?.(index);
        });
        overlay.append(marker);
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
        line.setAttribute('class', 'map-leader');
        svg.append(line);
        return { marker, line, site };
      });
      paintOverlay();
    }

    const image = new Image();
    image.decoding = 'async';
    image.onload = () => {
      if (!initialize()) return;
      const texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      state.ready = true;
      root.classList.add('is-live');
      buildOverlay();
      resize();
      render(clock);
      setPlaying(true);
      resolveReady(handle);
    };
    image.onerror = () => {
      root.classList.add('is-offline');
      console.warn('Tactical map texture unavailable');
    };
    image.src = options.texture || window.KEPLER_MAP_TEXTURE || '';

    const sizes = new ResizeObserver(resize);
    sizes.observe(canvas);
    reduceMotion.addEventListener('change', () => setPlaying(state.playing));

    const handle = {
      camera,
      state,
      sites: SITES,
      project,
      ready,
      render: () => render(clock),
      setPlaying,
      setTrack(index) {
        state.track = index;
        render(clock);
      },
      setLock(value) {
        state.lock = Boolean(value);
        root.dataset.lock = value ? 'on' : 'off';
        const reticle = overlay?.querySelector('.map-reticle');
        if (reticle) reticle.classList.toggle('is-locked', Boolean(value));
        render(clock);
      },
      get time() { return clock; }
    };
    return handle;
  }

  fui.createMap = createMap;

  // 巡航：概览 → 逐点锁定（缩放 + 微旋转 + 本地故障 + 读数刷新），循环
  fui.createMapTour = (map) => {
    const gsap = window.gsap;
    if (!gsap) return { start() {}, stop() {}, focus() {} };
    const readout = document.querySelector('[data-map-readout]');
    const sites = map.sites;
    let index = 0;

    const setReadout = (site, i) => {
      if (!readout) return;
      readout.querySelector('[data-site-code]').textContent = site.code;
      readout.querySelector('[data-site-name]').textContent = site.name;
      const stateEl = readout.querySelector('[data-site-state]');
      stateEl.textContent = site.state;
      stateEl.dataset.state = site.state.toLowerCase();
      readout.querySelector('[data-site-count]').textContent = String(i + 1).padStart(2, '0') + ' / ' + String(sites.length).padStart(2, '0');
      readout.querySelector('[data-site-depth]').textContent = site.depth;
      map.setTrack(i);
    };

    const lock = (i) => {
      index = i;
      setReadout(sites[i], i);
      map.setLock(true);
      window.dispatchEvent(new CustomEvent('kepler:lock', { detail: { site: sites[i], index: i } }));
    };

    const overview = { x: 0.40, y: 0.48 };
    // 运镜统一用 power2.inOut + 长时长：起停都软，不出现急停
    const flyTo = (i, hold = 2.1) => {
      const site = sites[i];
      const travel = 2.9;
      const tl = gsap.timeline();
      tl.call(() => map.setLock(false))
        .to(map.camera.pan, { x: site.uv[0], y: 1 - site.uv[1], duration: travel, ease: 'power2.inOut' })
        .to(map.camera, { zoom: 2.3, duration: travel, ease: 'power2.inOut' }, 0)
        .to(map.camera, { rotate: i % 2 ? -0.042 : 0.036, duration: travel, ease: 'power2.inOut' }, 0)
        .call(() => lock(i))
        .to({}, { duration: hold })
        .to(map.camera, { zoom: 1.12, duration: 2.3, ease: 'power2.inOut' })
        .to(map.camera.pan, { x: overview.x, y: overview.y, duration: 2.3, ease: 'power2.inOut' }, '<')
        .to(map.camera, { rotate: 0, duration: 2.3, ease: 'power2.inOut' }, '<');
      return tl;
    };

    fui.focusSite = (i) => {
      if (timer) timer.kill();
      current?.kill();
      current = flyTo(i);
      restart(9000);
    };

    let current = null;
    let timer = null;
    const restart = (delay) => {
      timer?.kill();
      timer = gsap.delayedCall(delay / 1000, cycle);
    };

    const cycle = () => {
      current = flyTo(index);
      current.eventCallback('onComplete', () => {
        index = (index + 1) % sites.length;
        restart(900);
      });
    };

    const start = () => {
      // 幂等：重复 start（初始化 / pageshow / 动效开关）不应叠加多条并行的巡航时间线
      current?.kill();
      timer?.kill();
      current = null;
      index = 0;
      setReadout(sites[0], 0);
      gsap.set(map.camera.pan, { x: 0.40, y: 0.48 });
      gsap.set(map.camera, { zoom: 1.02 });
      cycle();
    };

    return {
      start,
      stop() { current?.kill(); timer?.kill(); },
      focus: (i) => fui.focusSite?.(i)
    };
  };

  fui.MAP_SITES = SITES;
})();
