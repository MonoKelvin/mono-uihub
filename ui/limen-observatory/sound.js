/* 异物 · 异常观测室 — 音效合成层
 * 纯 Web Audio API 实时合成，零外部音频文件、零网络请求。
 * 暴露全局 window.LimenSound：
 *   LimenSound.init()             首次手势解锁 AudioContext
 *   LimenSound.setEnabled(bool)   开/关全部音效（持久化由调用方负责）
 *   LimenSound.enabled            当前是否启用（getter）
 *   LimenSound.play(name)         播放命名 UI 音效
 *   LimenSound.playSpecimen(id)   播放某异物的「声学签名」（仅当该异物有音效）
 *
 * 浏览器策略：AudioContext 必须在用户手势后 resume，故 play() 内部自动尝试 resume。
 * 所有声音经主增益 + 压缩器输出，避免叠加爆音；同时发声受 LIMIT 上限保护。
 */
(() => {
  "use strict";

  const LIMIT = 14;            // 同时发声上限，防止叠加爆音
  let ctx = null;
  let master = null;
  let comp = null;
  let enabled = true;
  let busy = 0;
  let unlocked = false;

  function ensure() {
    if (ctx) return ctx;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.7;
    comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -18;
    comp.ratio.value = 12;
    comp.attack.value = 0.003;
    comp.release.value = 0.25;
    master.connect(comp);
    comp.connect(ctx.destination);
    return ctx;
  }

  function unlock() {
    if (unlocked) return;
    const c = ensure();
    if (!c) return;
    if (c.state === "suspended") c.resume();
    unlocked = true;
  }

  function bindUnlock() {
    const h = () => unlock();
    window.addEventListener("pointerdown", h, { once: true });
    window.addEventListener("keydown", h, { once: true });
  }

  function tnow() { return ctx.currentTime; }

  // 通用包络：attack 起音 → decay 落到 sustain 比例 → 保持到 dur → release 收尾
  function applyEnv(param, t0, a, d, peak, sus, rel, dur) {
    const g = param;
    const pk = Math.max(0.0002, peak);
    const sv = Math.max(0.0002, pk * sus);
    g.cancelScheduledValues(t0);
    g.setValueAtTime(0.0001, t0);
    g.exponentialRampToValueAtTime(pk, t0 + a);
    g.exponentialRampToValueAtTime(sv, t0 + a + d);
    g.setValueAtTime(sv, t0 + dur);
    g.exponentialRampToValueAtTime(0.0001, t0 + dur + rel);
  }

  // 单振荡器音 + 可选滤波
  function tone(opts) {
    if (busy >= LIMIT) return;
    const c = ensure();
    if (!c) return;
    const t0 = tnow() + (opts.delay || 0);
    const dur = opts.dur || 0.15;
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = opts.type || "sine";
    osc.frequency.setValueAtTime(opts.freq, t0);
    if (opts.freqEnd) osc.frequency.exponentialRampToValueAtTime(opts.freqEnd, t0 + dur);

    let node = osc;
    if (opts.filter) {
      const f = c.createBiquadFilter();
      f.type = opts.filter.type || "lowpass";
      f.frequency.setValueAtTime(opts.filter.freq || 1200, t0);
      if (opts.filter.freqEnd) f.frequency.exponentialRampToValueAtTime(opts.filter.freqEnd, t0 + dur);
      f.Q.value = opts.filter.q || 1;
      osc.connect(f);
      node = f;
    }
    node.connect(g);
    applyEnv(
      g.gain, t0,
      opts.attack || 0.005, opts.decay || 0.08,
      opts.gain != null ? opts.gain : 0.5,
      opts.sustain != null ? opts.sustain : 0.0,
      opts.release || 0.06,
      dur
    );
    g.connect(master);
    busy++;
    osc.start(t0);
    osc.stop(t0 + dur + (opts.release || 0.06) + 0.02);
    osc.onended = () => { try { osc.disconnect(); if (node !== osc) node.disconnect(); g.disconnect(); } catch (_) {} busy--; };
  }

  // 白噪声（扫描 / 旋转的质感层）
  function noise(opts) {
    if (busy >= LIMIT) return;
    const c = ensure();
    if (!c) return;
    const t0 = tnow() + (opts.delay || 0);
    const dur = opts.dur || 0.2;
    const buf = c.createBuffer(1, Math.max(1, Math.ceil(c.sampleRate * dur)), c.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const src = c.createBufferSource();
    src.buffer = buf;
    const f = c.createBiquadFilter();
    f.type = opts.filterType || "bandpass";
    f.frequency.setValueAtTime(opts.filterFreq || 1000, t0);
    if (opts.filterFreqEnd) f.frequency.exponentialRampToValueAtTime(opts.filterFreqEnd, t0 + dur);
    f.Q.value = opts.q || 1;
    const g = c.createGain();
    applyEnv(
      g.gain, t0,
      opts.attack || 0.01, opts.decay || 0.1,
      opts.gain != null ? opts.gain : 0.3,
      opts.sustain != null ? opts.sustain : 0,
      opts.release || 0.05,
      dur
    );
    src.connect(f);
    f.connect(g);
    g.connect(master);
    busy++;
    src.start(t0);
    src.stop(t0 + dur + 0.02);
    src.onended = () => { try { src.disconnect(); f.disconnect(); g.disconnect(); } catch (_) {} busy--; };
  }

  /* ---------- 命名 UI 音效配方 ---------- */
  const RECIPES = {
    click() {
      tone({ type: "triangle", freq: 430, dur: 0.05, gain: 0.32, attack: 0.002, decay: 0.04, release: 0.03 });
    },
    tick() {
      tone({ type: "square", freq: 880, dur: 0.025, gain: 0.1, attack: 0.001, decay: 0.02, release: 0.02, filter: { type: "highpass", freq: 600 } });
    },
    hover() {
      tone({ type: "sine", freq: 1180, dur: 0.02, gain: 0.05, attack: 0.001, decay: 0.015, release: 0.02 });
    },
    toggle() {
      tone({ type: "triangle", freq: 520, freqEnd: 700, dur: 0.09, gain: 0.28 });
    },
    toggleOff() {
      tone({ type: "triangle", freq: 700, freqEnd: 480, dur: 0.09, gain: 0.26 });
    },
    open() {
      tone({ type: "sine", freq: 240, freqEnd: 360, dur: 0.18, gain: 0.3, attack: 0.01, decay: 0.12 });
      tone({ type: "sine", freq: 480, dur: 0.12, gain: 0.14, delay: 0.04 });
    },
    close() {
      tone({ type: "sine", freq: 360, freqEnd: 220, dur: 0.16, gain: 0.26, attack: 0.01, decay: 0.1 });
    },
    select() {
      tone({ type: "sine", freq: 330, dur: 0.22, gain: 0.32, attack: 0.005, decay: 0.16 });
      tone({ type: "sine", freq: 495, dur: 0.18, gain: 0.15, delay: 0.02 });
      tone({ type: "triangle", freq: 660, dur: 0.12, gain: 0.09, delay: 0.05 });
    },
    zoomIn() {
      tone({ type: "sine", freq: 600, freqEnd: 920, dur: 0.07, gain: 0.2 });
    },
    zoomOut() {
      tone({ type: "sine", freq: 920, freqEnd: 600, dur: 0.07, gain: 0.2 });
    },
    rotate() {
      noise({ filterType: "bandpass", filterFreq: 1800, filterFreqEnd: 600, dur: 0.16, gain: 0.16, q: 1.2, attack: 0.005, decay: 0.08, release: 0.06 });
      tone({ type: "triangle", freq: 300, freqEnd: 220, dur: 0.16, gain: 0.1 });
    },
    scan() {
      tone({ type: "sawtooth", freq: 220, freqEnd: 880, dur: 0.5, gain: 0.1, filter: { type: "lowpass", freq: 900, freqEnd: 2600, q: 2 } });
      noise({ filterType: "bandpass", filterFreq: 800, filterFreqEnd: 2000, dur: 0.5, gain: 0.05, q: 0.8 });
    },
    archive() {
      tone({ type: "sine", freq: 160, dur: 0.3, gain: 0.38, attack: 0.005, decay: 0.2 });
      tone({ type: "triangle", freq: 90, dur: 0.32, gain: 0.28, delay: 0.01 });
    },
    restore() {
      tone({ type: "sine", freq: 200, freqEnd: 420, dur: 0.3, gain: 0.28, attack: 0.01, decay: 0.2 });
    },
    export() {
      tone({ type: "sine", freq: 523, dur: 0.12, gain: 0.28 });
      tone({ type: "sine", freq: 784, dur: 0.18, gain: 0.26, delay: 0.09 });
    },
    error() {
      tone({ type: "square", freq: 140, dur: 0.18, gain: 0.24, filter: { type: "lowpass", freq: 500 } });
    },
  };

  function play(name) {
    if (!enabled) return;
    const c = ensure();
    if (!c) return;
    unlock();
    const fn = RECIPES[name];
    if (fn) { try { fn(); } catch (_) {} }
  }

  /* ---------- 异物声学签名 ---------- */
  // 由 id 派生确定性动机：小调五声音阶 + 低音衬底，神秘而不刺耳。
  function hashStr(s) {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
    return Math.abs(h);
  }
  const PENTA = [196.0, 233.08, 261.63, 311.13, 349.23, 392.0, 466.16]; // G 小调五声感

  function playSpecimen(id) {
    if (!enabled) return;
    const c = ensure();
    if (!c) return;
    unlock();
    if (busy >= LIMIT) return;
    const seed = hashStr(id || "");
    const root = PENTA[seed % PENTA.length];
    const wave = seed % 2 ? "sine" : "triangle";
    const steps = [0, 2 + (seed % 3), 4];
    steps.forEach((step, i) => {
      const f = root * Math.pow(2, step / 12);
      tone({ type: wave, freq: f, dur: 0.5, gain: 0.2, attack: 0.01, decay: 0.3, release: 0.4, delay: i * 0.16, filter: { type: "lowpass", freq: 2200 } });
    });
    // 低音衬底，营造空间感
    tone({ type: "sine", freq: root / 2, dur: 1.1, gain: 0.14, attack: 0.02, decay: 0.4, release: 0.5, filter: { type: "lowpass", freq: 600 } });
  }

  function setEnabled(v) {
    enabled = !!v;
    if (enabled) { ensure(); unlock(); }
  }

  // 主增益 0..1，受压缩器保护，避免叠加爆音。
  function setVolume(v) {
    const c = ensure();
    if (!c || !master) return;
    const vol = Math.max(0, Math.min(1, Number(v) || 0));
    master.gain.setTargetAtTime(vol, c.currentTime, 0.02);
  }

  window.LimenSound = {
    init() { ensure(); bindUnlock(); },
    setEnabled,
    setVolume,
    get enabled() { return enabled; },
    play,
    playSpecimen,
  };
})();
