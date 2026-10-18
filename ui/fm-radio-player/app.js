/* ============================================================
   夜航电台 · 交互与音频合成
   ------------------------------------------------------------
   音频全部由 Web Audio 实时合成，不加载任何外部音频文件：
     · 底噪层  白噪声 → 带通 → LFO 扫频，模拟接收机静噪
     · 节目层  每个电台一组和弦垫音 + 双层琶音 + 旋律动机，
               各台调式、音色、速度、滤波都不同
     · 调谐层  拖动时静噪抬升、节目层压低，锁台一声咔哒
     · 示波器  读 AnalyserNode 时域数据，自适应增益 + 余晖拖尾
   ============================================================ */

(function () {
  'use strict';

  var FMIN = 88, FMAX = 108, TOLERANCE = 0.45;

  /* 六家电台。base 是根音，chord 是和弦音级，
     scale 是可用音级，motif 是旋律动机（相对根音的半音数，null 为休止） */
  var STATIONS = [
    {
      freq: 88.6, name: '夜航电台', mode: '立体声', signal: 4,
      program: '夜航信箱', byline: '沈砚秋 · 22:00',
      base: 146.83, chord: [0, 7, 12, 16], scale: [0, 3, 5, 7, 10],
      motif: [null, 7, null, 10, 12, null, 10, 7, null, 5, null, 7],
      tone: 'sine', filter: 640, tempo: 0.15
    },
    {
      freq: 91.3, name: '海港调度', mode: '单声道', signal: 3,
      program: '港口夜班表', byline: '老周 · 21:00',
      base: 130.81, chord: [0, 5, 9, 12], scale: [0, 2, 3, 7, 8],
      motif: [12, null, 10, null, 7, null, null, 5, 7, null, null, 3],
      tone: 'triangle', filter: 520, tempo: 0.13
    },
    {
      freq: 95.8, name: '旧唱片行', mode: '立体声', signal: 5,
      program: 'B 面之间', byline: '阮沁 · 20:00',
      base: 174.61, chord: [0, 4, 7, 11], scale: [0, 2, 4, 7, 9, 11],
      motif: [null, null, 4, 7, null, 11, null, 9, 7, null, 4, null],
      tone: 'sine', filter: 820, tempo: 0.19
    },
    {
      freq: 101.7, name: '城市频道', mode: '单声道', signal: 2,
      program: '晚高峰回声', byline: '陈叙 · 23:30',
      base: 155.56, chord: [0, 3, 7, 10], scale: [0, 3, 5, 7, 10, 12],
      motif: [0, 3, 7, 10, 7, 3, null, 0, 5, 7, null, 3],
      tone: 'sawtooth', filter: 380, tempo: 0.11
    },
    {
      freq: 105.9, name: '长波实验室', mode: '立体声', signal: 4,
      program: '短波来信', byline: '白澍 · 22:30',
      base: 110.0, chord: [0, 7, 10, 14], scale: [0, 2, 3, 7, 9, 10],
      motif: [null, null, null, 14, null, 12, null, 10, null, 7, null, null],
      tone: 'sine', filter: 340, tempo: 0.09
    },
    {
      freq: 106.8, name: '深夜厨房', mode: '立体声', signal: 5,
      program: '午夜烹饪', byline: '小满 · 00:00',
      base: 196.0, chord: [0, 5, 9, 14], scale: [0, 2, 4, 5, 7, 9],
      motif: [7, null, 9, null, 12, null, 14, null, 12, 9, 7, null],
      tone: 'triangle', filter: 900, tempo: 0.17
    }
  ];

  var state = {
    freq: 88.6, index: 0, playing: false, dragging: false,
    programRunning: false, volume: 72, motifStep: 0
  };

  var $ = function (id) { return document.getElementById(id); };
  var rx = document.querySelector('.rx');
  var dialEl = $('dial');
  var innerEl = $('dialInner');
  var needleEl = $('needle');
  var ticksEl = $('ticks');
  var slotsEl = $('slots');

  var pct = function (f) { return (f - FMIN) / (FMAX - FMIN) * 100; };
  var semi = function (n) { return Math.pow(2, n / 12); };

  var SIGNAL_TEXT = { 1: '信号极弱', 2: '信号偏弱', 3: '信号一般', 4: '信号良好', 5: '信号清晰' };
  function signalText(v) { return SIGNAL_TEXT[v] || '信号一般'; }

  /* 信号强度条：4 格，按 1-5 级映射点亮格数 */
  (function buildSignalBars() {
    var wrap = $('winBars');
    for (var i = 0; i < 4; i++) wrap.appendChild(document.createElement('i'));
  })();

  function paintSignalBars(level) {
    var lit = level === 0 ? 0 : Math.min(4, Math.max(1, Math.round(level / 5 * 4)));
    Array.prototype.forEach.call($('winBars').children, function (b, i) {
      b.dataset.on = i < lit ? 'true' : 'false';
    });
  }

  /* ==================== 滚轮数字 ====================
     每一位是一个独立的玻璃小窗，内部是 0-9 的机械翻片滚轮，
     通过 translateY 露出目标数字。两个关键点：
     1) 每一格宽度固定，整块数字宽度恒定，
        所以 MHz 的锚点不会被数字变化带着跑。
     2) 9→0 不能滚满一圈。每格 strip 建两份 0-9，
        按「最短路径」选择落在哪一份，实现顺滑回绕。 */

  var REPEAT = 2;                 // 每格 strip 里 0-9 的重复份数（2 份用于回绕）
  var odoCur = [0, 0, 0, 0];      // 每格当前「等效数字」0-9

  (function buildOdometer() {
    // 小数点窗格：此前是空元素，导致小数点完全不显示
    var dot = document.querySelector('.odo-dot');
    if (dot) dot.textContent = '.';

    var strips = document.querySelectorAll('.odo-strip');
    strips.forEach(function (strip) {
      for (var r = 0; r < REPEAT; r++) {
        for (var d = 0; d <= 9; d++) {
          var b = document.createElement('b');
          b.textContent = String(d);
          strip.appendChild(b);
        }
      }
    });
  })();

  function paintCellInstant(i, d) {
    var cur = document.querySelectorAll('.odo-strip')[i];
    odoCur[i] = d;
    cur.style.transition = 'none';
    cur.style.transform = 'translateY(' + (-d) + 'em)';
    void cur.offsetHeight;      // 强制回流，恢复过渡
    cur.style.transition = '';
  }

  /** 把第 i 位滚到 target(0-9)，走最短路径（9→0 只回退一格，不空转一圈） */
  function rollDigit(i, target, instant) {
    var from = odoCur[i];
    if (instant) { paintCellInstant(i, target); return; }
    if (from === target) return;

    var diff = target - from;
    if (diff > 5) diff -= 10;
    else if (diff < -5) diff += 10;

    var dest = from + diff;                 // -5 ~ 14
    var pos = dest < 0 ? dest + 10 : dest;  // 负数映射到第二份
    odoCur[i] = target;
    document.querySelectorAll('.odo-strip')[i].style.transform = 'translateY(' + (-pos) + 'em)';
  }

  /** 把频率写成 3 位整数 + 1 位小数，例如 88.6 → [0,8,8,6] */
  function setOdometer(freq, instant) {
    var s = freq.toFixed(1);
    var digits = (s.indexOf('.') === 0 ? '0' + s : s).split('');
    var intPart = digits.slice(0, 3).map(function (c) { return c === '.' ? 0 : Number(c); });
    var dec = Number(digits[digits.length - 1]);

    for (var i = 0; i < 3; i++) rollDigit(i, intPart[i], instant);
    rollDigit(3, dec, instant);
  }

  /* ==================== 音频引擎 ==================== */

  var audio = {
    ctx: null, master: null, hissGain: null, programGain: null,
    noiseFilter: null, analyser: null, timeData: null,
    voices: [], timers: [], ready: false
  };

  function initAudio() {
    if (audio.ready) return true;
    var Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return false;

    var ctx = new Ctx();
    audio.ctx = ctx;

    var master = ctx.createGain();
    master.gain.value = state.volume / 100 * 0.9;

    var analyser = ctx.createAnalyser();
    analyser.fftSize = 1024;
    analyser.smoothingTimeConstant = 0.7;
    audio.timeData = new Uint8Array(analyser.fftSize);

    master.connect(analyser);
    analyser.connect(ctx.destination);
    audio.master = master;
    audio.analyser = analyser;

    // --- 底噪：白噪声 → 带通 → LFO
    var buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    var d = buffer.getChannelData(0);
    for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;

    var noise = ctx.createBufferSource();
    noise.buffer = buffer; noise.loop = true;

    var bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 1400;
    bp.Q.value = 0.7;

    var hiss = ctx.createGain();
    hiss.gain.value = 0.02;

    var lfo = ctx.createOscillator();
    lfo.frequency.value = 0.07;
    var lfoGain = ctx.createGain();
    lfoGain.gain.value = 520;
    lfo.connect(lfoGain).connect(bp.frequency);

    noise.connect(bp).connect(hiss).connect(master);
    noise.start(); lfo.start();

    audio.noiseFilter = bp;
    audio.hissGain = hiss;

    var pg = ctx.createGain();
    pg.gain.value = 0;
    pg.connect(master);
    audio.programGain = pg;

    audio.ready = true;
    return true;
  }

  function stopVoices() {
    audio.timers.forEach(clearInterval);
    audio.timers = [];
    audio.voices.forEach(function (v) {
      try { v.stop(audio.ctx.currentTime + 0.6); } catch (e) { /* 已停止 */ }
    });
    audio.voices = [];
    state.programRunning = false;
  }

  /* 和弦垫音：四振荡器失谐，铺底 */
  function playPad(st) {
    var ctx = audio.ctx;
    var lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = st.filter;
    lp.Q.value = 0.7;
    lp.connect(audio.programGain);

    st.chord.forEach(function (s, i) {
      var osc = ctx.createOscillator();
      osc.type = st.tone;
      osc.frequency.value = st.base * semi(s);
      osc.detune.value = (i - 1.5) * 6;
      var g = ctx.createGain();
      g.gain.value = 0.05 / (i + 1);
      osc.connect(g).connect(lp);
      osc.start();
      audio.voices.push(osc);
    });
  }

  /* 旋律动机：按固定序列走，比随机琶音更「像一首歌」 */
  function playMotif(st) {
    var ctx = audio.ctx, t = ctx.currentTime;
    var note = st.motif[state.motifStep % st.motif.length];
    state.motifStep++;

    if (note !== null && note !== undefined) {
      // 旋律音用可用音级里的音高，保持调式一致
      var oct = note >= 12 ? 12 : 0;
      var target = st.base * semi(note % 12) * (oct ? 2 : 1);

      var osc = ctx.createOscillator();
      osc.type = st.tone === 'sawtooth' ? 'square' : 'triangle';
      osc.frequency.value = target;

      var lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = st.filter * 1.6;

      var g = ctx.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.075, t + 0.04);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 1.1);

      osc.connect(lp).connect(g).connect(audio.programGain);
      osc.start(t); osc.stop(t + 1.2);
      audio.voices.push(osc);
    }
  }

  function playClick() {
    if (!audio.ready) return;
    var ctx = audio.ctx, t = ctx.currentTime;
    var osc = ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(1800, t);
    osc.frequency.exponentialRampToValueAtTime(340, t + 0.04);
    var g = ctx.createGain();
    g.gain.setValueAtTime(0.055, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.08);
    osc.connect(g).connect(audio.master);
    osc.start(t); osc.stop(t + 0.1);
  }

  function startProgram(index) {
    if (!audio.ready) return;
    stopVoices();
    var st = STATIONS[index];
    playPad(st);
    state.motifStep = 0;
    var stepMs = st.tempo * 1000;
    audio.timers.push(setInterval(function () { playMotif(st); }, stepMs));
    // 慢速点缀，填住节奏间隙
    audio.timers.push(setInterval(function () {
      var ctx = audio.ctx, t = ctx.currentTime;
      var s = st.chord[Math.floor(Math.random() * st.chord.length)] + 12;
      var osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = st.base * semi(s);
      var g = ctx.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.03, t + 0.08);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 1.8);
      osc.connect(g).connect(audio.programGain);
      osc.start(t); osc.stop(t + 1.9);
      audio.voices.push(osc);
    }, stepMs * 3));
    state.programRunning = true;
  }

  function setPlaying(on) {
    initAudio();
    if (!audio.ready) return;
    if (audio.ctx.state === 'suspended') audio.ctx.resume();
    state.playing = on;

    $('playIcon').innerHTML = on
      ? '<rect x="6.4" y="5" width="3.6" height="14" rx=".6"/><rect x="14" y="5" width="3.6" height="14" rx=".6"/>'
      : '<path d="M7.5 4.6v14.8L19.4 12z"/>';
    $('play').setAttribute('aria-label', on ? '暂停' : '播放');
    $('play').dataset.on = on ? 'true' : 'false';

    var tally = $('tally');
    tally.dataset.on = on ? 'true' : 'false';
    tally.querySelector('.tally-text').textContent =
      on ? '播出中' : (rx.dataset.signal === 'on' ? '已暂停' : '待播');

    render(state.freq, false);
  }

  /* ==================== 调谐 ==================== */

  function nearest(f) {
    var best = -1, bestD = TOLERANCE;
    for (var i = 0; i < STATIONS.length; i++) {
      var dd = Math.abs(STATIONS[i].freq - f);
      if (dd <= bestD) { bestD = dd; best = i; }
    }
    return best;
  }

  function render(f, announce) {
    state.freq = f;
    var idx = nearest(f);
    var on = idx >= 0;
    var was = state.index;

    if (on) { state.index = idx; f = STATIONS[idx].freq; state.freq = f; }

    needleEl.style.setProperty('--x', pct(f));
    setOdometer(f, !window.__odoReady);
    window.__odoReady = true;
    dialEl.setAttribute('aria-valuenow', f.toFixed(1));

    if (on) {
      var st = STATIONS[idx];
      dialEl.setAttribute('aria-valuetext', f.toFixed(1) + ' 兆赫，' + st.name);
      $('station').textContent = st.name;
      $('winMode').textContent = st.mode;
      $('winSignal').textContent = signalText(st.signal);
      paintSignalBars(st.signal);
      $('program').textContent = st.program;
      $('byline').textContent = st.byline;
      $('freqText').textContent = f.toFixed(1) + ' 兆赫，' + st.name + '，' + signalText(st.signal);
    } else {
      dialEl.setAttribute('aria-valuetext', f.toFixed(1) + ' 兆赫，无信号');
      $('station').textContent = '无信号';
      $('winMode').textContent = '静噪';
      $('winSignal').textContent = '拖动刻度盘';
      paintSignalBars(0);
      $('program').textContent = '频段空白';
      $('byline').textContent = '换个位置试试';
      $('freqText').textContent = f.toFixed(1) + ' 兆赫，无信号';
    }

    rx.dataset.signal = on ? 'on' : 'off';

    Array.prototype.forEach.call(slotsEl.children, function (s, i) {
      s.dataset.on = (i === idx) ? 'true' : 'false';
    });

    var audible = on && state.playing && !state.dragging;
    if (audio.ready) {
      var t = audio.ctx.currentTime;
      audio.hissGain.gain.setTargetAtTime(audible ? 0.016 : (on ? 0.05 : 0.14), t, 0.25);
      audio.programGain.gain.setTargetAtTime(audible ? 1 : 0, t, 0.3);
      if (audible && (was !== idx || !state.programRunning)) startProgram(idx);
      if (!audible) stopVoices();
    }

    if (announce && on && was !== idx) playClick();
  }

  /* ---- 刻度盘：每 1 MHz 一根刻度，5 的倍数加高；台位在刻度下方 ---- */

  (function buildDial() {
    var frag = document.createDocumentFragment();
    // 先铺整段 1 MHz 细刻度
    for (var v = FMIN; v <= FMAX + 0.001; v += 1) {
      var f = Math.round(v * 10) / 10;
      var t = document.createElement('span');
      t.className = 'dtick';
      t.style.setProperty('--x', pct(f));
      frag.appendChild(t);
    }
    // 再叠加 5 MHz 的长刻度（盖在细刻度上形成层次）
    for (var w = FMIN; w <= FMAX + 0.001; w += 5) {
      var mf = Math.round(w * 10) / 10;
      var m = document.createElement('span');
      m.className = 'dtick dtick--major';
      m.style.setProperty('--x', pct(mf));
      frag.appendChild(m);
    }
    ticksEl.appendChild(frag);

    var sfrag = document.createDocumentFragment();
    STATIONS.forEach(function (st) {
      var s = document.createElement('span');
      s.className = 'dslot';
      s.style.setProperty('--x', pct(st.freq));
      sfrag.appendChild(s);
    });
    slotsEl.appendChild(sfrag);
  })();

  /* ---- 旋钮刻度环 ----
     刻度与指针画在同一个 SVG（viewBox 0 0 100 100）里，共用中心 (50,50)。
     这样指针必然精确落在刻度上，不存在半径失配。

     几何关系（viewBox 单位）：
       金属盘直径 = 容器的 44% → 盘半径 ≈ viewBox 22
       刻度半径 KTICK_R = 38（画在 35.5→40.5 的径向线段）
       指针从盘心 (50,50) 伸到半径 24，端点小圆点 r=2.6 落在盘缘附近

     角度公式：deg = -135 + (v/100)×270，0° 正上、顺时针为正。 */

  var KTICK_R = 38;
  var knobTickEls = [];

  (function buildKnobTicks() {
    var wrap = $('kticks');
    var svgNS = 'http://www.w3.org/2000/svg';

    for (var i = 0; i <= 10; i++) {
      var v = i * 10;
      var deg = -135 + (v / 100) * 270;
      var rad = deg * Math.PI / 180;
      var sx = 50 + Math.sin(rad) * (KTICK_R - 2.5);
      var sy = 50 - Math.cos(rad) * (KTICK_R - 2.5);
      var ex = 50 + Math.sin(rad) * (KTICK_R + 2.5);
      var ey = 50 - Math.cos(rad) * (KTICK_R + 2.5);

      var t = document.createElementNS(svgNS, 'line');
      t.setAttribute('x1', sx.toFixed(2));
      t.setAttribute('y1', sy.toFixed(2));
      t.setAttribute('x2', ex.toFixed(2));
      t.setAttribute('y2', ey.toFixed(2));
      t.setAttribute('class', v % 50 === 0 ? 'ktick ktick--major' : 'ktick');
      t.dataset.v = v;
      knobTickEls.push(t);
      wrap.appendChild(t);
    }
  })();

  /* ==================== 示波器 ==================== */

  var canvas = $('scope');
  var ctx2d = canvas.getContext('2d');
  var trail = [];       // 余晖：保留最近若干帧的点
  var TRAIL_MAX = 14;

  function sizeCanvas() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function drawScope() {
    var w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) { requestAnimationFrame(drawScope); return; }

    ctx2d.clearRect(0, 0, w, h);
    var mid = h / 2;
    var amp = h * 0.42;
    var on = rx.dataset.signal === 'on';
    var live = audio.ready && state.playing && state.volume > 0 && on;

    // ---- 余晖：先画越来越淡的历史波形，再画当前帧
    for (var q = 0; q < trail.length; q++) {
      var frame = trail[q];
      var age = (q + 1) / trail.length;
      ctx2d.beginPath();
      ctx2d.strokeStyle = live ? 'rgba(217,80,45,' + (age * 0.22).toFixed(3) + ')' : 'rgba(91,84,75,0.05)';
      ctx2d.lineWidth = 1;
      for (var i = 0; i < frame.length; i++) {
        var px = i / (frame.length - 1) * w;
        if (i === 0) ctx2d.moveTo(px, frame[i]); else ctx2d.lineTo(px, frame[i]);
      }
      ctx2d.stroke();
    }

    // ---- 当前帧
    var pts = new Array(Math.max(2, Math.floor(w / 2)));
    if (audio.ready && state.playing && audio.timeData) {
      audio.analyser.getByteTimeDomainData(audio.timeData);
      var buf = audio.timeData, n = buf.length;

      // 自适应增益：合成音乐绝对电平很低，固定映射会压成一条直线
      var peak = 0;
      for (var j = 0; j < n; j++) {
        var dv = Math.abs(buf[j] - 128);
        if (dv > peak) peak = dv;
      }
      var gain = peak > 0 ? Math.min(255 / Math.max(peak, 26), 9) : 1;

      var stepX = n / pts.length;
      for (var x = 0; x < pts.length; x++) {
        var v = ((buf[Math.floor(x * stepX)] - 128) / 128) * gain;
        if (v > 1) v = 1; else if (v < -1) v = -1;
        pts[x] = mid - v * amp;
      }
    } else {
      // 待机：极缓的低幅正弦，像通电但无信号
      var t = performance.now() / 1000;
      for (var k = 0; k < pts.length; k++) {
        pts[k] = mid + Math.sin(k / pts.length * Math.PI * 2 + t * 0.55) * (h * 0.07);
      }
    }

    trail.push(pts);
    if (trail.length > TRAIL_MAX) trail.shift();

    ctx2d.beginPath();
    ctx2d.strokeStyle = live ? 'rgba(230,90,55,0.95)' : 'rgba(110,100,88,0.5)';
    ctx2d.lineWidth = 1.2;
    for (var m = 0; m < pts.length; m++) {
      var xx = m / (pts.length - 1) * w;
      if (m === 0) ctx2d.moveTo(xx, pts[m]); else ctx2d.lineTo(xx, pts[m]);
    }
    ctx2d.stroke();

    requestAnimationFrame(drawScope);
  }

  /* ==================== 旋钮 ====================
     旋钮有 11 格刻度（0,10,…,100），对应 -135° → +135° 共 270° 弧。
     **指针角度必须由格数推导，而不是独立算**：
         deg = -135 + (格数/10) × 270
     这样指针永远精确落在高亮的当前格上，不会出现"指针指在两格之间
     但高亮的是另一格"的错位。

     交互改为**水平拖动**：真实旋钮是绕轴转，横向拖动最贴合直觉，
     且行程恒定（不随拖动方向变化）。 */

  var knob = $('knob');
  var knobNeedle = $('kneedle');
  var knobStart = null;

  function applyVolume(v) {
    state.volume = Math.max(0, Math.min(100, Math.round(v)));

    /* 指针角度与刻度角度用同一个公式、同一套坐标系，必然对齐。
       用 CSS transform（inline style）而非 SVG transform 属性 ——
       属性上的 rotate(deg cx cy) 会与 CSS 的 transform-origin 中心
       重复叠加，导致指针不按预期绕盘心旋转。 */
    var cur = Math.round(state.volume / 10);
    var deg = -135 + (cur / 10) * 270;
    knobNeedle.style.transform = 'rotate(' + deg.toFixed(2) + 'deg)';

    $('volNum').textContent = state.volume === 0 ? '静音' : String(state.volume);
    knob.setAttribute('aria-valuenow', String(state.volume));
    knob.setAttribute('aria-valuetext', state.volume === 0 ? '静音' : state.volume + '%');

    // 刻度高亮分两级：data-on 已过（示方向），data-cur 当前格（示位置）
    knobTickEls.forEach(function (t) {
      var tv = Number(t.dataset.v);
      t.dataset.on = tv <= state.volume ? 'true' : 'false';
      t.dataset.cur = tv === cur * 10 ? 'true' : 'false';
    });

    if (audio.ready) {
      audio.master.gain.setTargetAtTime(state.volume / 100 * 0.9, audio.ctx.currentTime, 0.05);
    }
  }

  // 水平拖动：向右增大，向左减小。180px 走完全程，行程恒定。
  knob.addEventListener('pointerdown', function (ev) {
    knobStart = { x: ev.clientX, v: state.volume };
    knob.setPointerCapture(ev.pointerId);
    knob.dataset.dragging = 'true';
    ev.preventDefault();
  });
  knob.addEventListener('pointermove', function (ev) {
    if (!knobStart) return;
    applyVolume(knobStart.v + (ev.clientX - knobStart.x) / 180 * 100);
  });
  function endKnobDrag() { knobStart = null; knob.dataset.dragging = 'false'; }
  knob.addEventListener('pointerup', endKnobDrag);
  knob.addEventListener('pointercancel', endKnobDrag);

  knob.addEventListener('keydown', function (ev) {
    var step = ev.shiftKey ? 10 : 4;
    if (ev.key === 'ArrowUp' || ev.key === 'ArrowRight') applyVolume(state.volume + step);
    else if (ev.key === 'ArrowDown' || ev.key === 'ArrowLeft') applyVolume(state.volume - step);
    else if (ev.key === 'Home') applyVolume(0);
    else if (ev.key === 'End') applyVolume(100);
    else return;
    ev.preventDefault();
  });

  /* ==================== 刻度盘交互 ==================== */

  function freqAt(clientX) {
    var r = innerEl.getBoundingClientRect();
    var p = (clientX - r.left) / r.width;
    return Math.round(Math.max(FMIN, Math.min(FMAX, FMIN + p * (FMAX - FMIN))) * 10) / 10;
  }

  dialEl.addEventListener('pointerdown', function (ev) {
    initAudio();
    if (audio.ready && audio.ctx.state === 'suspended') audio.ctx.resume();
    state.dragging = true;
    rx.dataset.dragging = 'true';
    dialEl.setPointerCapture(ev.pointerId);
    if (audio.ready) audio.noiseFilter.frequency.setTargetAtTime(1900, audio.ctx.currentTime, 0.1);
    render(freqAt(ev.clientX), false);
    ev.preventDefault();
  });
  dialEl.addEventListener('pointermove', function (ev) {
    if (!state.dragging) return;
    render(freqAt(ev.clientX), false);
  });
  function endDrag(ev) {
    if (!state.dragging) return;
    state.dragging = false;
    rx.dataset.dragging = 'false';
    try { dialEl.releasePointerCapture(ev.pointerId); } catch (e) { /* noop */ }
    render(state.freq, true);
  }
  dialEl.addEventListener('pointerup', endDrag);
  dialEl.addEventListener('pointercancel', endDrag);

  dialEl.addEventListener('keydown', function (ev) {
    var step = ev.shiftKey ? 1 : 0.2;
    var next = null;
    if (ev.key === 'ArrowRight' || ev.key === 'ArrowUp') next = state.freq + step;
    else if (ev.key === 'ArrowLeft' || ev.key === 'ArrowDown') next = state.freq - step;
    else if (ev.key === 'Home') next = FMIN;
    else if (ev.key === 'End') next = FMAX;
    else return;
    ev.preventDefault();
    render(Math.round(Math.max(FMIN, Math.min(FMAX, next)) * 10) / 10, true);
  });

  /* ==================== 传输键 ==================== */

  function stepStation(dir) {
    var i = (state.index + dir + STATIONS.length) % STATIONS.length;
    render(STATIONS[i].freq, true);
  }
  $('prev').addEventListener('click', function () { stepStation(-1); });
  $('next').addEventListener('click', function () { stepStation(1); });
  $('play').addEventListener('click', function () { setPlaying(!state.playing); });

  // 空格播放/暂停，双击刻度盘回到最近电台
  document.addEventListener('keydown', function (ev) {
    if (ev.code !== 'Space') return;
    var tag = document.activeElement && document.activeElement.tagName;
    if (tag === 'INPUT' || tag === 'BUTTON') return;
    ev.preventDefault();
    setPlaying(!state.playing);
  });

  /* ==================== 初始化 ==================== */

  sizeCanvas();
  window.addEventListener('resize', sizeCanvas);
  applyVolume(state.volume);
  render(state.freq, false);
  drawScope();

})();
