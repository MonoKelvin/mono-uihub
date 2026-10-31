/* 异物 · 异常观测室 — 音效合成层
 * 纯 Web Audio API 实时合成，零外部音频文件、零网络请求。
 * 暴露全局 window.LimenSound：
 *   LimenSound.init()             首次手势解锁 AudioContext
 *   LimenSound.setEnabled(bool)   开/关全部音效（持久化由调用方负责）
 *   LimenSound.enabled            当前是否启用（getter）
 *   LimenSound.play(name)         播放命名 UI 音效
 *   LimenSound.playSpecimen(id)   播放某异物的「声学签名」（仅当该异物有音效）
 *   LimenSound.playRecord(name)   播放档案录音条目，返回时长（秒）
 *
 * 长音频（档案录音）额外挂一路程序生成的卷积混响：IR 由指数衰减的滤波白噪声
 * 现算，按 room / hall / tunnel / void 四个预设缓存复用，不加载任何音频文件。
 *
 * 浏览器策略：AudioContext 必须在用户手势后 resume，故 play() 内部自动尝试 resume。
 * 所有声音经主增益 + 压缩器输出，避免叠加爆音；同时发声受 LIMIT 上限保护。
 */
(() => {
  "use strict";

  const LIMIT = 34;            // 同时发声上限：长音频一段叠 4–6 层，需比 UI 音效更宽
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

  /* ---------- 混响总线：程序生成 IR，按预设缓存复用 ----------
   * 不加载任何音频文件：用指数衰减的滤波白噪声当脉冲响应。
   * damp 越大高频衰减越快（近处硬墙）；dur 决定尾音长度（廊道/空洞）。
   */
  const REVERB_PRESETS = {
    room: { dur: 0.9, decay: 3.4, damp: 0.6 },
    hall: { dur: 2.8, decay: 2.4, damp: 0.45 },
    tunnel: { dur: 4.6, decay: 1.8, damp: 0.32 },
    void: { dur: 7.5, decay: 1.25, damp: 0.2 },
  };
  const revCache = new Map();

  function reverbBus(name) {
    const c = ensure();
    if (!c || !master) return null;
    const key = REVERB_PRESETS[name] ? name : "hall";
    if (revCache.has(key)) return revCache.get(key);
    const p = REVERB_PRESETS[key];
    const len = Math.max(1, Math.ceil(c.sampleRate * p.dur));
    const buf = c.createBuffer(2, len, c.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      let lp = 0;
      for (let i = 0; i < len; i++) {
        const t = i / len;
        const white = Math.random() * 2 - 1;
        // 一阶低通随尾部推进而收紧 → 尾音越远越闷，像真实房间
        lp += (white - lp) * (1 - p.damp * t);
        d[i] = lp * Math.pow(1 - t, p.decay);
      }
    }
    const conv = c.createConvolver();
    conv.buffer = buf;
    const out = c.createGain();
    out.gain.value = 0.9;
    conv.connect(out);
    out.connect(master);
    const bus = { input: conv, out };
    revCache.set(key, bus);
    return bus;
  }

  // 把已包络处理的输出送一路进混响；返回该 send 增益供清理
  function sendWet(srcNode, amount, rev) {
    const c = ensure();
    if (!c || !amount) return null;
    const bus = reverbBus(rev);
    if (!bus) return null;
    const s = c.createGain();
    s.gain.value = amount;
    srcNode.connect(s);
    s.connect(bus.input);
    return s;
  }

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

    // 颤音：低频振荡器调制音高。深度小 = 失谐的"人声呜咽"，深度大 = 恐惧的抖
    let lfo = null;
    let lfoGain = null;
    if (opts.vibrato) {
      lfo = c.createOscillator();
      lfoGain = c.createGain();
      lfo.frequency.value = opts.vibrato.rate || 5;
      lfoGain.gain.value = opts.vibrato.depth || 6;
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
    }

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
    const send = sendWet(g, opts.wet, opts.rev);
    busy++;
    osc.start(t0);
    if (lfo) lfo.start(t0);
    osc.stop(t0 + dur + (opts.release || 0.06) + 0.02);
    if (lfo) lfo.stop(t0 + dur + (opts.release || 0.06) + 0.02);
    osc.onended = () => {
      try {
        osc.disconnect();
        if (node !== osc) node.disconnect();
        g.disconnect();
        if (lfo) { lfo.disconnect(); }
        if (lfoGain) lfoGain.disconnect();
        if (send) send.disconnect();
      } catch (_) {}
      busy--;
    };
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
    const send = sendWet(g, opts.wet, opts.rev);
    busy++;
    src.start(t0);
    src.stop(t0 + dur + 0.02);
    src.onended = () => {
      try { src.disconnect(); f.disconnect(); g.disconnect(); if (send) send.disconnect(); } catch (_) {}
      busy--;
    };
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

  /* ---------- 档案录音：6–14 秒长音频 ----------
   * 全部实时合成，零外部文件。三条关键设计：
   *   1. 族选择：关键词优先；**无关键词时不再一律落到 fog**，改由名称哈希在全部族里分派。
   *      旧版 29 条录音名（"…环境音""…第 22 秒"）几乎都不含关键词，全部落到 fog，
   *      且旧版只有 7 个族 —— 这才是"很多条听起来都一样"的真正原因。
   *   2. 长音必须显式给 sustain。tone/noise 的默认 sustain=0 是为 UI 短音效设计的，
   *      长音频沿用会在起音后 0.1 秒衰减到静音 —— 旧版听起来只剩一记闷响。
   *   3. 每族 3–5 层（主层 + 质感层 + 空间层），全部经 sendWet 进程序生成的混响；
   *      同族不同条目靠 seed 派生的频率/节奏区分，播放时再叠 ±3% 微扰，
   *      既保证"同一条录音每次像同一条"，又不会机械重复。
   */
  const RECORD_FAMILY = [
    { re: /低语|耳语|私语|喃|诵|念/, id: "whisper" },
    { re: /哀|怨|泣|呜|哭|叹|悲|幽|咽|丧/, id: "mourn" },
    { re: /恐怖|噩梦|低吼|窒息|颤动|闷|压迫|沉重|深处/, id: "dread" },
    { re: /喘|呼吸|吸气|吹|呼|咳/, id: "gasp" },
    { re: /刺|尖|啸|高频|锐|警报|蜂|鸣响/, id: "pierce" },
    { re: /噪|静电|干扰|沙沙|杂|电流|信号|接收|输出|频/, id: "static" },
    { re: /刮|擦|摩|拖|刻|刃|爪|撕/, id: "scrape" },
    { re: /倒放|逆|回溯|反转|倒序/, id: "reverse" },
    { re: /钟|铃|鸣|共振|共鸣|嗡/, id: "bell" },
    { re: /磁带|走带|回放|播放|卡座|带/, id: "tape" },
    { re: /雨|水|潮|滴|渗|流|池|浸|盐/, id: "water" },
    { re: /机械|齿|金属|锈|计数|锁|铆|走时/, id: "machine" },
    { re: /走廊|廊|阶梯|通道|井口|楼道/, id: "tunnel" },
    { re: /犹豫|断续|迟疑|卡顿|停顿|重复|复述|口述|询问|受试/, id: "hesitate" },
    { re: /本底|底噪|静置|空旷|长鸣/, id: "drone" },
  ];

  /* 无关键词命中时的抽签池。权重：幽怨 / 低语 / 恐怖 / 窒息 / 刮擦 / 倒放 各 2 份
   * ——这些是"人声与异响"，在档案语境里最该被听见；其余各 1 份。
   * 排列顺序不是随手写的：按现存 29 条录音名的散列分布调过一轮，
   * 目标是让 29 条尽可能铺满全部 16 个族、且没有哪个族超过 4 条。
   * 新增录音会改变分布，但只是分布变化，不影响正确性。 */
  const HASH_POOL = [
    "fog", "tunnel", "scrape", "water", "pierce", "whisper", "dread", "tape",
    "drone", "static", "dread", "machine", "bell", "scrape", "mourn", "mourn",
    "whisper", "hesitate", "gasp", "gasp", "reverse", "reverse",
  ];

  const RECORD_VOICES = {
    /* 刺耳：高频窄带噪声 + 泛音锯齿 + 上方一条游走的正弦，三者的拍频产生耳压 */
    pierce({ r, d, jit, wet }) {
      noise({ filterType: "highpass", filterFreq: 3200 * jit, filterFreqEnd: 5400, q: 7, dur: d * 0.92, gain: 0.06, attack: 0.9, decay: 0.5, sustain: 0.85, release: 1.8, wet, rev: "tunnel" });
      tone({ type: "sawtooth", freq: (2200 + r(1) * 900) * jit, freqEnd: 2800 + r(2) * 800, dur: d * 0.78, gain: 0.032, attack: 1.2, decay: 0.6, sustain: 0.7, release: 2.0, filter: { type: "highpass", freq: 1800 }, wet: wet + 0.1, rev: "tunnel" });
      tone({ type: "sine", freq: 4700 + r(3) * 1300, dur: d * 0.5, gain: 0.016, attack: 0.7, sustain: 0.55, release: 1.4, delay: d * 0.3, vibrato: { rate: 7.4, depth: 24 } });
    },

    /* 恐怖低频：次声级下坠 + 失谐衬底 + 心跳双拍，最后一条是无源可查的"呼吸"底噪 */
    dread({ r, d, jit, wet }) {
      tone({ type: "sine", freq: (38 + r(1) * 16) * jit, freqEnd: 24 + r(2) * 9, dur: d * 0.95, gain: 0.185, attack: 1.8, decay: 1.4, sustain: 0.8, release: 3.0, filter: { type: "lowpass", freq: 110 }, wet: Math.min(1, wet + 0.2), rev: "void" });
      tone({ type: "triangle", freq: 57 + r(3) * 11, dur: d * 0.82, gain: 0.062, attack: 2.4, decay: 1.0, sustain: 0.75, release: 2.8, wet, rev: "void" });
      noise({ filterType: "lowpass", filterFreq: 360, q: 1.4, dur: d, gain: 0.042, attack: 2.2, decay: 1.0, sustain: 0.82, release: 2.6, wet, rev: "void" });
      const beat = 1.35 + r(4) * 0.6;
      for (let i = 0; i * beat < d * 0.8; i++) {
        tone({ type: "sine", freq: 64, freqEnd: 36, dur: 0.18, gain: 0.11, attack: 0.005, decay: 0.12, release: 0.12, delay: i * beat });
        tone({ type: "sine", freq: 52, freqEnd: 31, dur: 0.15, gain: 0.07, attack: 0.005, decay: 0.1, release: 0.12, delay: i * beat + 0.3 });
      }
    },

    /* 幽怨：失谐锯齿经高 Q 带通 → 类似元音的"呜"，慢颤音 + 下行滑音，
       第二声更低更远，制造"不止一个人在哭"的错位 */
    mourn({ r, d, jit, wet }) {
      const f0 = (150 + r(1) * 75) * jit;
      tone({
        type: "sawtooth", freq: f0, freqEnd: f0 * (0.7 + r(2) * 0.2),
        dur: d * 0.86, gain: 0.078, attack: 1.5, decay: 1.2, sustain: 0.8, release: 2.6,
        filter: { type: "bandpass", freq: 720 + r(3) * 380, q: 6 },
        vibrato: { rate: 4.1 + r(4) * 1.7, depth: 7 + r(5) * 7 },
        wet: Math.min(1, wet + 0.22), rev: "hall",
      });
      tone({
        type: "sawtooth", freq: f0 * 0.74, freqEnd: f0 * 0.5,
        dur: d * 0.72, gain: 0.044, attack: 2.6, decay: 1.4, sustain: 0.72, release: 3.0,
        filter: { type: "bandpass", freq: 470 + r(6) * 240, q: 8 },
        vibrato: { rate: 3.0 + r(7) * 1.3, depth: 10 },
        delay: d * 0.16, wet: 0.88, rev: "void",
      });
      noise({ filterType: "bandpass", filterFreq: 1500, filterFreqEnd: 480, q: 1.6, dur: d, gain: 0.026, attack: 1.8, decay: 1.0, sustain: 0.8, release: 2.4, wet, rev: "hall" });
    },

    /* 窒息：吸/呼交替，吸气更亮更短，呼气更长更闷，间隔随机 */
    gasp({ r, d, jit, wet }) {
      let t = 0.3;
      let i = 0;
      while (t < d * 0.82 && i < 24) {
        const inhale = i % 2 === 0;
        noise({
          filterType: "bandpass",
          filterFreq: (inhale ? 1500 : 700) * (0.85 + r(i) * 0.32) * jit,
          filterFreqEnd: inhale ? 2500 : 360,
          q: 2.2, dur: inhale ? 0.72 : 0.55,
          gain: inhale ? 0.05 : 0.042,
          attack: 0.14, decay: 0.22, sustain: 0.42, release: 0.28,
          delay: t, wet: Math.min(1, wet + 0.12), rev: "room",
        });
        t += inhale ? 1.35 + r(i + 3) * 0.55 : 0.85 + r(i + 4) * 0.45;
        i++;
      }
      tone({ type: "sine", freq: 76, dur: d * 0.9, gain: 0.045, attack: 2.2, decay: 1.0, sustain: 0.7, release: 2.2, filter: { type: "lowpass", freq: 190 }, wet, rev: "hall" });
    },

    /* 犹豫：短音节 + 长问隙，节奏由 seed 决定；底噪让它像"没关掉的录音机" */
    hesitate({ r, d, jit, wet }) {
      let t = 0.3;
      let i = 0;
      while (t < d * 0.85 && i < 26) {
        const dur = 0.12 + r(i) * 0.22;
        tone({ type: "sine", freq: (235 + r(i + 1) * 230) * jit, dur, gain: 0.075, attack: 0.012, decay: dur * 0.55, release: 0.12, delay: t, wet: wet * 0.5, rev: "room" });
        t += dur + 0.35 + r(i + 2) * 0.95;
        i++;
      }
      noise({ filterType: "bandpass", filterFreq: 820, q: 1.8, dur: d, gain: 0.02, attack: 1.4, decay: 0.8, sustain: 0.86, release: 2.0, wet, rev: "hall" });
    },

    /* 静电：宽带噪声床 + 四个随机爆点，像接触不良的接收机 */
    static({ r, d, jit, wet }) {
      noise({ filterType: "bandpass", filterFreq: (1300 + r(1) * 600) * jit, filterFreqEnd: 720, q: 0.9, dur: d, gain: 0.09, attack: 0.35, decay: 0.5, sustain: 0.88, release: 1.6, wet: wet * 0.4, rev: "room" });
      noise({ filterType: "highpass", filterFreq: 4000, q: 0.7, dur: d * 0.72, gain: 0.032, attack: 0.25, decay: 0.4, sustain: 0.7, release: 1.2 });
      for (let i = 0; i < 4; i++) {
        noise({ filterType: "highpass", filterFreq: 5200, dur: 0.05, gain: 0.06, attack: 0.001, decay: 0.04, release: 0.06, delay: 0.6 + i * (1.4 + r(i) * 1.3) });
      }
    },

    /* 低语：一串窄带噪声"音节"，每个音节的中心频率各不相同；底下垫一条几乎听不见的低音 */
    whisper({ r, d, jit, wet }) {
      let t = 0.35;
      let i = 0;
      while (t < d * 0.88 && i < 22) {
        noise({ filterType: "bandpass", filterFreq: (1050 + r(i) * 1150) * jit, q: 5, dur: 0.5 + r(i + 1) * 0.55, gain: 0.046, attack: 0.22, decay: 0.3, sustain: 0.35, release: 0.5, delay: t, wet: Math.min(1, wet + 0.18), rev: "hall" });
        t += 0.75 + r(i + 2) * 1.05;
        i++;
      }
      tone({ type: "sine", freq: 116 + r(3) * 28, dur: d, gain: 0.042, attack: 2.2, decay: 1.0, sustain: 0.7, release: 2.4, filter: { type: "lowpass", freq: 260 }, wet, rev: "void" });
    },

    /* 水：低频涌动 + 随机气泡（每个气泡是一次快速下滑的正弦） */
    water({ r, d, jit, wet }) {
      noise({ filterType: "lowpass", filterFreq: (2400 + r(1) * 900) * jit, filterFreqEnd: 600, q: 0.8, dur: d, gain: 0.068, attack: 0.9, decay: 0.8, sustain: 0.86, release: 2.4, wet: Math.min(1, wet + 0.2), rev: "tunnel" });
      let t = 0.5;
      for (let i = 0; i < 12 && t < d * 0.86; i++) {
        tone({ type: "sine", freq: (470 + r(i) * 820) * jit, freqEnd: 250, dur: 0.2, gain: 0.055, attack: 0.004, decay: 0.1, release: 0.18, delay: t, wet: wet * 0.6, rev: "tunnel" });
        t += 0.48 + r(i + 5) * 1.05;
      }
    },

    /* 机械：低频方波节拍 + 三分音不协和泛音，像锈住的齿轮组 */
    machine({ r, d, jit, wet }) {
      const step = 0.42 + r(1) * 0.3;
      for (let i = 0; i * step < d * 0.9; i++) {
        tone({ type: "square", freq: (92 + (i % 3) * 15) * jit, dur: 0.08, gain: 0.05, attack: 0.002, decay: 0.05, release: 0.05, delay: i * step, filter: { type: "lowpass", freq: 620 }, wet: wet * 0.5, rev: "room" });
      }
      [1, 2.76, 5.4].forEach((m, i) => {
        tone({ type: "sine", freq: 218 * m * jit, dur: d * 0.62, gain: 0.019 - i * 0.005, attack: 1.3, decay: 1.0, sustain: 0.62, release: 1.6, wet, rev: "hall" });
      });
    },

    /* 刮擦：一串高速高频颗粒，频率与增益逐个随机 —— 刃物刮过金属 */
    scrape({ r, d, jit, wet }) {
      const n = Math.min(26, Math.max(8, Math.floor(d * 2.4)));
      for (let i = 0; i < n; i++) {
        const t = (i / n) * d * 0.9;
        noise({ filterType: "bandpass", filterFreq: (2600 + r(i) * 3200) * jit, q: 9, dur: 0.045 + r(i + 1) * 0.06, gain: 0.04 + r(i + 2) * 0.028, attack: 0.002, decay: 0.03, release: 0.05, delay: t });
      }
      tone({ type: "triangle", freq: 1750 + r(5) * 950, freqEnd: 600, dur: d * 0.72, gain: 0.022, attack: 0.9, decay: 1.0, sustain: 0.5, release: 1.5, filter: { type: "bandpass", freq: 2400, q: 7 }, wet, rev: "room" });
    },

    /* 倒放：包络由无渐强到满再骤断（attack 占到 dur 的七成），听感就是磁带倒带 */
    reverse({ r, d, jit, wet }) {
      noise({ filterType: "bandpass", filterFreq: 300, filterFreqEnd: 3200, q: 1.2, dur: d * 0.92, gain: 0.085, attack: d * 0.72, decay: 0.04, sustain: 1, release: 0.16, wet: Math.min(1, wet + 0.3), rev: "void" });
      tone({ type: "sine", freq: (68 + r(1) * 42) * jit, freqEnd: 430, dur: d * 0.9, gain: 0.055, attack: d * 0.7, decay: 0.04, sustain: 1, release: 0.18, wet, rev: "void" });
    },

    /* 钟鸣：非谐泛音列（2.0/3.01/4.2/5.43/6.79 是钟的基本比例），高次衰减更快 */
    bell({ r, d, jit, wet }) {
      const base = (108 + r(1) * 62) * jit;
      [1, 2.0, 3.01, 4.2, 5.43, 6.79].forEach((m, i) => {
        tone({
          type: "sine", freq: base * m,
          dur: d * Math.max(0.35, 0.9 - i * 0.1),
          gain: 0.085 / (i + 1),
          attack: 0.004, decay: 0.7 + i * 0.32, sustain: 0.22, release: 1.8 + i * 0.45,
          wet: Math.min(1, wet + 0.35), rev: "tunnel",
        });
      });
    },

    /* 磁带：低频机箱嗡鸣 + 走带噪声 + 不定期的机械咔哒 + 极慢的音高漂移 */
    tape({ r, d, jit, wet }) {
      noise({ filterType: "lowpass", filterFreq: 2500, q: 0.6, dur: d, gain: 0.042, attack: 0.2, decay: 0.5, sustain: 0.8, release: 1.2 });
      tone({ type: "sine", freq: 47 + r(1) * 13, dur: d, gain: 0.045, attack: 0.5, decay: 0.6, sustain: 0.85, release: 1.4, filter: { type: "lowpass", freq: 120 } });
      for (let i = 0; i < 8; i++) {
        tone({ type: "square", freq: 1400 + r(i) * 420, dur: 0.012, gain: 0.026, attack: 0.001, decay: 0.01, release: 0.015, delay: 0.3 + i * (0.9 + r(i + 1) * 0.85), filter: { type: "highpass", freq: 900 } });
      }
      tone({ type: "triangle", freq: 218 * jit, freqEnd: 192 * jit, dur: d * 0.82, gain: 0.018, attack: 1.2, decay: 1.0, sustain: 0.6, release: 1.6, vibrato: { rate: 0.7, depth: 9 }, wet, rev: "hall" });
    },

    /* 廊道：脚步的离散回响 + 极长尾音，空旷感靠 void 混响撑起来 */
    tunnel({ r, d, jit, wet }) {
      const step = 0.72 + r(1) * 0.42;
      for (let i = 0; i * step < d * 0.82; i++) {
        tone({ type: "sine", freq: 94, freqEnd: 56, dur: 0.13, gain: 0.062, attack: 0.003, decay: 0.09, release: 0.11, delay: i * step, wet: 0.92, rev: "tunnel" });
      }
      noise({ filterType: "bandpass", filterFreq: 420, filterFreqEnd: 250, q: 1.1, dur: d, gain: 0.03, attack: 1.6, decay: 1.0, sustain: 0.85, release: 2.2, wet: 0.86, rev: "tunnel" });
      tone({ type: "sine", freq: 60 + r(2) * 22, dur: d, gain: 0.038, attack: 2.4, decay: 1.2, sustain: 0.75, release: 2.8, wet: 0.8, rev: "void" });
    },

    /* 嗡鸣：两支相差 0.5% 的振荡器产生缓慢拍频，最"不动"的一种 */
    drone({ r, d, jit, wet }) {
      const f = (56 + r(1) * 16) * jit;
      tone({ type: "sawtooth", freq: f, dur: d, gain: 0.05, attack: 2.6, decay: 1.2, sustain: 0.86, release: 3.0, filter: { type: "lowpass", freq: 440, q: 2 }, wet: Math.min(1, wet + 0.22), rev: "void" });
      tone({ type: "sine", freq: f * 1.005, dur: d, gain: 0.046, attack: 3.2, decay: 1.2, sustain: 0.86, release: 3.0, wet, rev: "void" });
      noise({ filterType: "bandpass", filterFreq: 520, q: 0.8, dur: d, gain: 0.026, attack: 2.2, decay: 1.0, sustain: 0.85, release: 2.6, wet, rev: "void" });
    },

    /* 兜底：模糊底噪 + 缓慢下坠的基频 */
    fog({ r, d, jit, wet }) {
      noise({ filterType: "bandpass", filterFreq: (520 + r(1) * 300) * jit, filterFreqEnd: 250, q: 0.8, dur: d, gain: 0.05, attack: 1.6, decay: 1.0, sustain: 0.86, release: 2.2, wet: Math.min(1, wet + 0.2), rev: "hall" });
      tone({ type: "sine", freq: (86 + r(2) * 36) * jit, freqEnd: 66, dur: d * 0.95, gain: 0.07, attack: 2.0, decay: 1.0, sustain: 0.8, release: 2.4, filter: { type: "lowpass", freq: 300 }, wet, rev: "void" });
    },
  };

  /* 播放一条档案录音。返回该条的时长（秒），供 UI 控制高亮与进度；
   * 返回 0 表示未播放（静音 / 上下文不可用 / 并发超限）。 */
  function playRecord(name) {
    if (!enabled) return 0;
    const c = ensure();
    if (!c) return 0;
    unlock();
    if (busy >= LIMIT - 10) return 0;

    const key = String(name || "");
    const seed = hashStr(key);
    const r = (n) => (Math.abs(seed * (n * 17 + 7) + n * 131) % 1000) / 1000;

    let fam = "fog";
    for (const f of RECORD_FAMILY) {
      if (f.re.test(key)) { fam = f.id; break; }
    }
    // 无关键词命中时不能一律落 fog（旧版即因此"每条都一样"），交给加权哈希分派。
    // 权重：幽怨 / 低语 / 恐怖 / 窒息 / 刮擦 各 2 份 —— 这些是"人声与异响"，
    // 在档案语境里最该被听见；其余族各 1 份。池子顺序即抽签顺序，无其他含义。
    if (fam === "fog") {
      const h = (seed * 2654435761) % 4294967296;
      fam = HASH_POOL[h % HASH_POOL.length];
    }

    const d = Math.round((6 + (seed % 81) / 10) * 10) / 10;   // 6.0–14.0 秒
    const jit = 0.97 + Math.random() * 0.06;                  // 播放微扰：同名不完全相同
    const wet = 0.32 + ((seed >> 3) % 42) / 100;

    const voice = RECORD_VOICES[fam] || RECORD_VOICES.fog;
    try { voice({ r, d, jit, wet }); } catch (_) {}
    return d;
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
    playRecord,
  };
})();
