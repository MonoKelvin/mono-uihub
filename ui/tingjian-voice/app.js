const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const escapeText = (value) => String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

/* ---------- 数据 ---------- */
const personas = {
  gentle: { name: '知夏', tone: '温柔陪伴', description: '温柔有分寸，认真听你说。' },
  clear: { name: '知夏', tone: '清晰理性', description: '思路清晰，和你一起找到重点。' },
  bright: { name: '知夏', tone: '轻松有趣', description: '有趣不喧闹，陪你换个角度。' },
};
const voices = [
  { name: '清透女声', description: '自然、轻柔，像熟悉的朋友', pitch: 1.1 },
  { name: '沉静男声', description: '舒缓、沉稳，留出思考的空间', pitch: .85 },
  { name: '明亮中性', description: '轻快、干净，让想法更自在', pitch: 1 },
];
const interestChoices = ['设计与创作', '独处时光', '自然散步', '慢节奏生活', '阅读', '电影', '运动', '旅行', '音乐', '美食'];
const promptIdeas = [
  '今天最想理清的一件事',
  '一件还没跟人提起的小事',
  '最近让你停顿下来的瞬间',
  '明天想先做好的那一件事',
  '一句一直想对谁说的话',
  '一个放不下、但可以放下的念头',
  '今天做得还不错的地方',
  '此刻最想有人接住的话',
];
const history = [
  { id: 'h1', group: '今天', date: '10 / 19', time: '08:42', title: '给自己留一点空白', preview: '不是所有空白，都需要马上填满。', type: '语音', starred: true, messages: [{ role: 'user', time: '08:42', text: '最近总觉得一天不够用，可是忙完又说不上做了什么。' }, { role: 'ai', time: '08:42', text: '听起来你一直在回应事情，却很少有机会问问自己真正想做什么。\n\n不妨先留出十分钟，不安排任务。空白不是浪费，而是让自己的节奏慢慢回来。' }, { role: 'user', time: '08:43', text: '我想从今天的午休开始，先出去走走。' }, { role: 'ai', time: '08:43', text: '那就让午休只属于散步，不顺便回复消息，也不急着想下午的事。回来之后，再看看自己的感觉。' }] },
  { id: 'h2', group: '今天', date: '10 / 19', time: '07:16', title: '新项目，从哪里开始', preview: '先找到这次设计最需要回答的问题。', type: '文字', starred: false, messages: [{ role: 'user', time: '07:16', text: '接了一个新项目，信息很多，想知道从哪里开始比较好。' }, { role: 'ai', time: '07:16', text: '先不急着画界面。写下三个问题：谁在使用、他们要完成什么、现在最困难的地方在哪里。\n\n选一个最核心的使用场景，把它从开始到结束走一遍，信息就会慢慢有顺序。' }] },
  { id: 'h3', group: '昨天', date: '10 / 18', time: '21:37', title: '晚一点，也没关系', preview: '把自己的进度，和别人的时刻表分开。', type: '语音', starred: false, messages: [{ role: 'user', time: '21:37', text: '看别人进展很快，有点担心自己是不是太慢了。' }, { role: 'ai', time: '21:37', text: '我们通常看见别人的结果，却知道自己每一步的困难，这样的比较很难公平。\n\n试试只和上个月的自己比较：有什么变得更清楚了？哪一件事做起来更顺手了？' }] },
  { id: 'h4', group: '昨天', date: '10 / 18', time: '12:08', title: '周末去山里走走', preview: '找一条不赶时间的路线，轻装出发。', type: '文字', starred: true, messages: [{ role: 'user', time: '12:08', text: '周末想去附近山里走走，不想安排得太满。' }, { role: 'ai', time: '12:08', text: '可以选一条往返两三个小时的成熟步道，把剩下的时间留给休息。\n\n出发前确认天气、交通和步道开放情况，带上水和简单补给。风景不必看完，舒服就好。' }] },
  { id: 'h5', group: '更早', date: '10 / 16', time: '19:23', title: '我的表达习惯', preview: '想说的话，可以简单一点，也具体一点。', type: '语音', starred: false, messages: [{ role: 'user', time: '19:23', text: '有时候会想很多，说出来反而乱了。' }, { role: 'ai', time: '19:23', text: '可以先只说一件事：发生了什么、你的感受是什么、希望对方怎么回应。\n\n不用一次说完整，先给对方一个明确的起点。' }] },
];

/* ---------- 状态 ---------- */
let persona = 'gentle';
let voiceIndex = 0;
let pace = 1;
let followup = true;
let soundEnabled = true;
let memoryEnabled = true;
let page = 'home';
let historyFilter = 'all';
let profile = { name: '林悦', bio: '设计师，也是生活的观察者。', interests: ['设计与创作', '独处时光', '自然散步', '慢节奏生活'] };
let memories = [
  { id: 'm1', icon: 'plant-2', title: '喜欢用散步整理想法', description: '你在上次对话中提到' },
  { id: 'm2', icon: 'coffee', title: '偏爱安静的早晨', description: '一天从不赶时间开始' },
  { id: 'm3', icon: 'message-2', title: '建议简短，不需要太多术语', description: '你的表达偏好' },
];
let activeConversation = null;
let sheetKind = '';
let sheetReturnFocus = null;
let sheetRevision = 0;
const pendingReplies = new Set();
let toastTimer = null;
let voiceTimer = null;
let previewSpeaking = false;
let selectedInterests = [];
let voiceOpen = false;
let voiceReturnFocus = null;

/* ---------- 工具 ---------- */
const nowTime = () => { const now = new Date(); return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`; };
const mmss = (total) => `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
function toast(text) {
  clearTimeout(toastTimer);
  $('#toast').textContent = text;
  $('#toast').classList.add('visible');
  toastTimer = setTimeout(() => $('#toast').classList.remove('visible'), 2400);
}
function updateClock() { $('#status-time').textContent = nowTime(); }

/* ---------- 声波图案：rAF 行波推进，制造律动 ---------- */
const ribbon = { raf: null, bars: [], t: 0 };
function ribbonTick() {
  ribbon.t += .016;
  const t = ribbon.t;
  ribbon.bars.forEach((bar, i) => {
    const phase = i * .7;
    const primary = Math.sin(t * 2.7 - phase);
    const overtone = Math.sin(t * 4.6 - phase * 1.7) * .3;
    const v = .38 + .56 * (.5 + .5 * (primary * .72 + overtone));
    bar.style.transform = `scaleY(${v.toFixed(3)})`;
    bar.style.opacity = (.35 + v * .45).toFixed(3);
  });
  ribbon.raf = requestAnimationFrame(ribbonTick);
}
function pauseRibbon() { if (ribbon.raf) { cancelAnimationFrame(ribbon.raf); ribbon.raf = null; } }
function resumeRibbon() { if (!ribbon.raf && !reduceMotion.matches && ribbon.bars.length) ribbonTick(); }
function buildRibbon() {
  const group = $('#ribbon-lines');
  if (!group) return;
  const bars = 6;
  const barWidth = 12;
  const gap = 8;
  const total = bars * barWidth + (bars - 1) * gap;
  const startX = (320 - total) / 2;
  const centerY = 114;
  /* 不规则节奏轮廓：避免等距等高造成的呆板 */
  const rhythm = [.5, .88, .62, 1, .7, .42];
  let markup = '';
  for (let i = 0; i < bars; i += 1) {
    const height = 30 + rhythm[i] * 130;
    const x = startX + i * (barWidth + gap);
    markup += `<rect x="${x.toFixed(1)}" y="${(centerY - height / 2).toFixed(1)}" width="${barWidth}" height="${height.toFixed(1)}" rx="${(barWidth / 2).toFixed(1)}" fill="rgb(21 146 230 / .85)"></rect>`;
  }
  group.innerHTML = markup;
  ribbon.bars = $$('#ribbon-lines rect');
  if (reduceMotion.matches) ribbon.bars.forEach((bar, i) => { bar.style.transform = `scaleY(${(.5 + rhythm[i] * .45).toFixed(3)})`; bar.style.opacity = '.85'; });
  else ribbonTick();
}

/* ---------- 语音全屏态：声波跟随引擎 ---------- */
const wave = { raf: null, mode: 'idle', bars: 46, values: null, targets: null, t: 0, dpr: 1 };
function waveRoundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  if (ctx.roundRect) { ctx.roundRect(x, y, w, h, r); return; }
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
function waveResize() {
  const canvas = $('#voice-wave');
  if (!canvas) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.max(1, rect.width * dpr);
  canvas.height = Math.max(1, rect.height * dpr);
  wave.dpr = dpr;
  if (!wave.values) { wave.values = new Float32Array(wave.bars); wave.targets = new Float32Array(wave.bars); }
}
function waveTargets() {
  const { bars, targets, t, mode } = wave;
  for (let i = 0; i < bars; i += 1) {
    const x = i / (bars - 1);
    const envelope = Math.sin(x * Math.PI) ** .8;
    const travel = Math.sin(x * 9 - t * (mode === 'speaking' ? 3.4 : 1.5));
    let amp;
    if (mode === 'idle') amp = (.05 + .05 * (0.5 + 0.5 * travel)) * envelope;
    else if (mode === 'listening') amp = (.2 + .32 * Math.abs(travel)) * envelope;
    else amp = (.42 + .52 * Math.abs(travel + Math.sin(t * 7 + i))) * envelope;
    targets[i] = Math.max(.02, amp);
  }
}
function waveDraw() {
  const canvas = $('#voice-wave');
  if (!canvas || !wave.values) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  const { bars, values, dpr } = wave;
  const gap = 5 * dpr;
  const barW = (w - gap * (bars - 1)) / bars;
  const mid = h / 2;
  for (let i = 0; i < bars; i += 1) {
    const v = values[i];
    const bh = Math.max(2 * dpr, v * h * .92);
    ctx.fillStyle = `rgba(247, 251, 255, ${(.4 + v * .6).toFixed(3)})`;
    waveRoundRect(ctx, i * (barW + gap), mid - bh / 2, barW, bh, Math.min(barW / 2, 3 * dpr));
    ctx.fill();
  }
}
function waveTick() {
  wave.t += .016;
  waveTargets();
  const { values, targets } = wave;
  for (let i = 0; i < values.length; i += 1) values[i] += (targets[i] - values[i]) * .14;
  waveDraw();
  wave.raf = requestAnimationFrame(waveTick);
}
function startWave(mode) {
  wave.mode = mode;
  waveResize();
  if (reduceMotion.matches) {
    waveTargets();
    wave.values.set(wave.targets);
    waveDraw();
    return;
  }
  if (!wave.raf) waveTick();
}
function stopWave() {
  if (wave.raf) cancelAnimationFrame(wave.raf);
  wave.raf = null;
}

/* ---------- 语音全屏态：morph 展开 ---------- */
function setVoiceStageText(state, caption) {
  $('#voice-stage-state').textContent = state;
  $('#voice-stage-caption').textContent = caption;
}
function openVoiceStage(origin) {
  if (voiceOpen) return;
  voiceOpen = true;
  sheetRevision++;
  sheetKind = 'voice';
  stopVoice();
  if ('speechSynthesis' in window) speechSynthesis.cancel();
  if (previewSpeaking) setPreviewSpeaking(false);
  const phone = $('.phone');
  const base = phone.getBoundingClientRect();
  const rect = (origin || phone).getBoundingClientRect();
  const stage = $('#voice-stage');
  // 起点 = 按钮自身的圆形边界；先关过渡写入起点，再展开
  stage.style.transition = 'none';
  stage.style.setProperty('--ct', `${rect.top - base.top}px`);
  stage.style.setProperty('--cl', `${rect.left - base.left}px`);
  stage.style.setProperty('--cr', `${base.right - rect.right}px`);
  stage.style.setProperty('--cb', `${base.bottom - rect.bottom}px`);
  stage.style.setProperty('--cround', `${Math.min(rect.width, rect.height) / 2}px`);
  void stage.offsetWidth;
  stage.style.transition = '';
  voiceReturnFocus = document.activeElement;
  $('#app-shell').inert = true;
  stage.removeAttribute('inert');
  stage.setAttribute('aria-hidden', 'false');
  stage.classList.add('open');
  setVoiceStageText('准备好，开始吧。', '试试一句：“帮我整理一下思路。”');
  $('#voice-stage-timer').textContent = '00:00';
  setDemoButton('play', '播放示例');
  requestAnimationFrame(() => startWave('idle'));
}
function closeVoiceStage() {
  if (!voiceOpen) return;
  voiceOpen = false;
  sheetRevision++;
  sheetKind = '';
  stopVoice();
  if ('speechSynthesis' in window) speechSynthesis.cancel();
  if (previewSpeaking) setPreviewSpeaking(false);
  stopWave();
  const stage = $('#voice-stage');
  stage.classList.add('leaving');
  stage.classList.remove('open');
  setTimeout(() => {
    stage.classList.remove('leaving');
    stage.setAttribute('aria-hidden', 'true');
    stage.inert = true;
    if (!$('#overlay').classList.contains('open')) {
      $('#app-shell').inert = false;
      if (voiceReturnFocus?.isConnected && !voiceReturnFocus.closest('[hidden]')) voiceReturnFocus.focus({ preventScroll: true });
    }
  }, 480);
  voiceReturnFocus = null;
}
function setDemoButton(state, label) {
  const demo = $('#voice-demo');
  const icon = { play: 'player-play', live: 'microphone', replay: 'reload' }[state];
  demo.disabled = state === 'live';
  demo.classList.toggle('live', state === 'live');
  demo.setAttribute('aria-label', label);
  demo.innerHTML = `<i class="ti ti-${icon}" aria-hidden="true"></i>`;
}
function startDemoVoice() {
  if (voiceTimer) return;
  setDemoButton('live', '正在试聊');
  startWave('listening');
  setVoiceStageText('“帮我整理一下思路。”', '示例语句');
  let seconds = 0;
  const revision = sheetRevision;
  voiceTimer = setInterval(() => {
    if (sheetRevision !== revision || !voiceOpen) { stopVoice(); return; }
    seconds += 1;
    $('#voice-stage-timer').textContent = mmss(seconds);
    if (seconds === 2) {
      setVoiceStageText('先从一件小事开始。', '把今天需要做的事写下来，选出最重要的一件。');
      startWave('speaking');
      if (soundEnabled) speak('把今天需要做的事写下来，选出最重要的一件。不用一次解决所有问题。');
    }
    if (seconds >= 8) {
      stopVoice();
      startWave('idle');
      setVoiceStageText('现在，换你来说。', '用文字继续，把自己的想法聊清楚。');
      setDemoButton('replay', '再听一次');
    }
  }, 1000);
}

/* ---------- 视图切换 ---------- */
function enterView(view) {
  if (reduceMotion.matches) return;
  view.animate([{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 240, easing: 'cubic-bezier(.22,.61,.36,1)' });
  $$('[data-entrance]', view).forEach((element, index) => {
    element.animate([{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 320, delay: 40 + index * 60, easing: 'cubic-bezier(.22,.61,.36,1)', fill: 'backwards' });
  });
}
function navigate(destination) {
  if (destination === page) return;
  const previous = $(`#view-${page}`);
  previous.hidden = true;
  previous.classList.remove('active');
  page = destination;
  const next = $(`#view-${page}`);
  next.hidden = false;
  next.classList.add('active');
  enterView(next);
  const order = ['home', 'history', 'personality', 'profile'];
  $('#tab-indicator').style.transform = `translateX(${order.indexOf(page) * 100}%)`;
  $$('.tab-bar button').forEach((button) => {
    const active = button.dataset.page === page;
    button.classList.toggle('active', active);
    if (active) button.setAttribute('aria-current', 'page');
    else button.removeAttribute('aria-current');
  });
  if (page === 'history') renderHistory();
  if (page === 'home') resumeRibbon();
  else pauseRibbon();
}

/* ---------- 历史 ---------- */
function renderFilterState() {
  const on = historyFilter === 'starred';
  const button = $('#star-filter');
  button.setAttribute('aria-pressed', String(on));
  button.innerHTML = `<i class="ti ti-bookmark${on ? '-filled' : ''}" aria-hidden="true"></i>`;
}
function renderHistory() {
  const query = $('#history-search').value.trim().toLocaleLowerCase();
  const matches = history.filter((item) => (historyFilter !== 'starred' || item.starred) && `${item.title} ${item.preview} ${item.messages.map((message) => message.text).join(' ')}`.toLocaleLowerCase().includes(query));
  const groups = [...new Set(matches.map((item) => item.group))];
  $('#history-list').innerHTML = groups.map((group) => {
    const items = matches.filter((item) => item.group === group);
    return `<section class="history-group"><h2 class="history-date">${escapeText(group)}<span class="date-number">${escapeText(items[0].date)}</span></h2>${items.map((item) => `<div class="history-item"><button class="history-open" data-history="${item.id}"><h3>${escapeText(item.title)}</h3><p>${escapeText(item.preview)}</p></button><button class="icon-button bookmark-button" data-bookmark="${item.id}" aria-label="${item.starred ? '取消收藏' : '收藏'}${escapeText(item.title)}" aria-pressed="${item.starred}"><i class="ti ti-bookmark${item.starred ? '-filled' : ''}" aria-hidden="true"></i></button></div>`).join('')}</section>`;
  }).join('');
  $('#history-empty').hidden = matches.length > 0;
  if (!history.length && !query) $('#empty-title').textContent = '第一段对话，从这里开始';
  else if (historyFilter === 'starred' && !query && !matches.length) $('#empty-title').textContent = '把想重温的话，留在这里';
  else $('#empty-title').textContent = '没有找到这段对话';
}

/* ---------- 首页 · 继续对话 ---------- */
function updateRecent() {
  const button = $('#recent-button');
  const latest = history[0];
  if (!latest) { button.hidden = true; return; }
  button.hidden = false;
  button.dataset.history = latest.id;
  button.setAttribute('aria-label', `继续：${latest.title}`);
}

/* ---------- 性格 ---------- */
function syncSegmented(selector, key, value) {
  const group = $(selector);
  if (!group) return;
  const buttons = $$(`[data-${key}]`, group);
  buttons.forEach((button, index) => {
    const selected = button.dataset[key] === value;
    button.classList.toggle('selected', selected);
    button.setAttribute('aria-pressed', String(selected));
    if (selected) group.style.setProperty('--i', index);
  });
  group.style.setProperty('--n', buttons.length);
}
function renderPersonality() {
  const current = personas[persona];
  $('#home-persona').textContent = current.name;
  $('#persona-name').textContent = current.name;
  const description = $('#persona-description');
  if (description.textContent !== current.description) {
    description.textContent = current.description;
    description.classList.remove('swap');
    void description.offsetWidth;
    description.classList.add('swap');
  }
  syncSegmented('#persona-options', 'persona', persona);
  syncSegmented('#pace-options', 'pace', String(pace));
  $('#voice-label').textContent = voices[voiceIndex].name;
  $('#followup-toggle').setAttribute('aria-checked', String(followup));
  $('#sound-toggle').setAttribute('aria-checked', String(soundEnabled));
}

/* ---------- 画像 ---------- */
function renderProfile() {
  $('#profile-name').textContent = profile.name;
  $('#profile-bio').textContent = profile.bio;
  $('.profile-head img').alt = `${profile.name}的头像`;
  $('#interest-tags').innerHTML = profile.interests.length ? profile.interests.map((interest) => `<span class="interest-tag">${escapeText(interest)}</span>`).join('') : '<p class="memory-empty">添加感兴趣的事情，让聊天更贴近你。</p>';
  $('#memory-list').innerHTML = memories.length ? memories.map((memory) => `<div class="memory-row"><span class="memory-symbol"><i class="ti ti-${memory.icon}" aria-hidden="true"></i></span><div><strong>${escapeText(memory.title)}</strong></div><button class="icon-button" data-delete-memory="${memory.id}" aria-label="忘记${escapeText(memory.title)}"><i class="ti ti-x" aria-hidden="true"></i></button></div>`).join('') : '<p class="memory-empty">这里还没有偏好。你愿意分享的时候，听间会认真记住。</p>';
  $('#memory-toggle').setAttribute('aria-checked', String(memoryEnabled));
  $('#memory-list').classList.toggle('paused', !memoryEnabled);
}

/* ---------- 底部面板 ---------- */
function openSheet(title, body, footer = '', kind = '') {
  sheetRevision++;
  sheetKind = kind;
  stopVoice();
  if ('speechSynthesis' in window) speechSynthesis.cancel();
  if (previewSpeaking) setPreviewSpeaking(false);
  if (!$('#overlay').classList.contains('open')) sheetReturnFocus = document.activeElement;
  $('#sheet-title').textContent = title;
  $('#sheet-body').innerHTML = body;
  $('#sheet-footer').innerHTML = footer;
  $('#sheet-body').scrollTop = 0;
  $('#app-shell').inert = true;
  $('#overlay').inert = false;
  $('#overlay').setAttribute('aria-hidden', 'false');
  $('#overlay').classList.add('open');
  $('#sheet').focus({ preventScroll: true });
}
function closeSheet() {
  sheetRevision++;
  sheetKind = '';
  stopVoice();
  if ('speechSynthesis' in window) speechSynthesis.cancel();
  if (previewSpeaking) setPreviewSpeaking(false);
  $('#overlay').classList.remove('open');
  $('#overlay').setAttribute('aria-hidden', 'true');
  $('#overlay').inert = true;
  $('#app-shell').inert = false;
  if (sheetReturnFocus?.isConnected && !sheetReturnFocus.closest('[hidden]')) sheetReturnFocus.focus({ preventScroll: true });
  sheetReturnFocus = null;
}

/* ---------- 对话 ---------- */
function messageHTML(message, index, total) {
  const fresh = index === total - 1 ? ' fresh' : '';
  if (message.role === 'user') {
    return `<div class="message user${fresh}"><p>${escapeText(message.text)}</p><time class="message-time">${escapeText(message.time || '')}</time></div>`;
  }
  return `<div class="message${fresh}"><div class="message-label"><i class="ti ti-wave-sine" aria-hidden="true"></i>${personas[persona].name}<time>${escapeText(message.time || '')}</time></div><p>${escapeText(message.text)}</p><div class="message-actions"><button class="icon-button" data-copy="${index}" aria-label="复制回答"><i class="ti ti-copy" aria-hidden="true"></i></button><button class="icon-button" data-speak="${index}" aria-label="朗读回答"><i class="ti ti-volume" aria-hidden="true"></i></button></div></div>`;
}
function chatFooter() {
  const idea = promptIdeas[Math.floor(Math.random() * promptIdeas.length)];
  return `<div class="chat-footer"><button class="prompt-hint" id="prompt-hint" data-prompt-send="${escapeText(idea)}"><i class="ti ti-message-circle" aria-hidden="true"></i><span>${escapeText(idea)}</span></button><form class="chat-form" id="chat-form"><input id="chat-input" type="text" placeholder="把想说的话写下来…" maxlength="400" aria-label="消息内容" autocomplete="off" enterkeyhint="send"><button class="icon-button send-button" type="submit" aria-label="发送消息"><i class="ti ti-arrow-up" aria-hidden="true"></i></button></form></div>`;
}
function renderChat() {
  if (sheetKind !== 'chat') return;
  const conversation = activeConversation;
  $('#sheet-title').textContent = conversation?.title || '和知夏聊聊';
  if (!conversation || !conversation.messages.length) {
    $('#sheet-body').innerHTML = '<div class="chat-intro"><div class="voice-mark" aria-hidden="true"><span></span><span></span><span></span><span></span><span></span></div><h3>我在，听你说。</h3></div>';
  } else {
    $('#prompt-hint')?.remove();
    $('#sheet-body').innerHTML = `<div class="transcript-meta"><time>${escapeText(conversation.date)} ${escapeText(conversation.time)}</time><span>${conversation.type}对话</span></div><div class="transcript">${conversation.messages.map((message, index) => messageHTML(message, index, conversation.messages.length)).join('')}${pendingReplies.has(conversation) ? '<div class="pending-message" role="status"><span class="pending-dots" aria-hidden="true"><span></span><span></span><span></span></span>正在整理思路</div>' : ''}</div>`;
  }
  const sendButton = $('#chat-form button');
  if (sendButton) sendButton.disabled = pendingReplies.has(conversation);
  $('#sheet-body').scrollTop = $('#sheet-body').scrollHeight;
}
function openChat(id = null, prompt = '') {
  activeConversation = id ? history.find((conversation) => conversation.id === id) : null;
  openSheet(activeConversation?.title || '和知夏聊聊', '', chatFooter(), 'chat');
  renderChat();
  if (prompt) sendMessage(prompt);
  else requestAnimationFrame(() => setTimeout(() => $('#chat-input')?.focus({ preventScroll: true }), 320));
}
function buildReply(text) {
  let main;
  if (/思路|整理|项目|工作|设计/.test(text)) main = '先把脑子里的事情分成两类：今天需要推进的，和暂时可以放一放的。\n\n从最需要你判断的一件事开始，只写下一步要做什么。不用一次把所有问题都解决。';
  else if (/状态|焦虑|累|忙|心情|烦|压力/.test(text)) main = '听起来你最近装着不少事情。先不用急着把状态调整好，可以给自己一点不需要完成任务的时间。\n\n喝口水、离开屏幕，或者出去走几分钟。等感觉慢下来，再选一件最小的事开始。';
  else if (/散步|周末|旅行|山/.test(text)) main = '可以把计划留得松一点，选一个容易到达、也方便回来的地方。\n\n少安排一个目的地，多留一点休息的时间。出发前记得确认天气和路线。';
  else main = '可以先从这件事里，选出你最在意的部分。把发生的事情和自己的感受分开说，往往会更容易看清想法。\n\n今天不必急着得出完整的答案，先找到一个愿意尝试的小步骤。';
  if (persona === 'clear') main = `我们先抓住一个重点。\n\n${main.replace('听起来你最近装着不少事情。', '当前更需要的是减少负担，而不是增加任务。')}`;
  if (persona === 'bright') main = `先给脑子里的小剧场按一下暂停。\n\n${main}`;
  if (pace === 0) main = main.split('\n\n').slice(0, persona === 'gentle' ? 1 : 2).join('\n\n');
  if (pace === 2) main += '\n\n你可以写下这一步，留出十分钟试试，然后再决定要不要继续。';
  if (followup) main += '\n\n现在，你最想先聊哪一部分？';
  return main;
}
function sendMessage(text) {
  text = text.trim();
  if (!text || pendingReplies.has(activeConversation)) return;
  if (!activeConversation) {
    const now = new Date();
    activeConversation = {
      id: `h${Date.now()}`,
      group: '今天',
      date: `${String(now.getMonth() + 1).padStart(2, '0')} / ${String(now.getDate()).padStart(2, '0')}`,
      time: nowTime(),
      title: text.length > 13 ? `${text.slice(0, 13)}…` : text,
      preview: text,
      type: '文字',
      starred: false,
      messages: [],
    };
    history.unshift(activeConversation);
  }
  const conversation = activeConversation;
  conversation.messages.push({ role: 'user', time: nowTime(), text });
  pendingReplies.add(conversation);
  const reply = buildReply(text);
  $('#chat-input').value = '';
  renderChat();
  renderHistory();
  updateRecent();
  setTimeout(() => {
    pendingReplies.delete(conversation);
    if (!history.includes(conversation)) return;
    conversation.messages.push({ role: 'ai', time: nowTime(), text: reply });
    conversation.preview = reply.split('\n\n')[0];
    renderHistory();
    if (sheetKind === 'chat' && activeConversation === conversation) renderChat();
  }, 650);
}

/* ---------- 语音合成 ---------- */
function speak(text, onEnd) {
  if (!('speechSynthesis' in window)) { toast('当前浏览器不支持朗读，可直接阅读文字'); return false; }
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'zh-CN';
  utterance.rate = [.95, .9, .85][pace];
  utterance.pitch = voices[voiceIndex].pitch;
  const available = speechSynthesis.getVoices().filter((voice) => voice.lang.startsWith('zh'));
  if (available.length) utterance.voice = available[Math.min(voiceIndex, available.length - 1)];
  utterance.onend = () => onEnd?.();
  utterance.onerror = (event) => { onEnd?.(); if (!['canceled', 'interrupted'].includes(event.error)) toast('声音暂时不可用，请查看文字'); };
  speechSynthesis.speak(utterance);
  return true;
}
function stopVoice() {
  clearInterval(voiceTimer);
  voiceTimer = null;
}
function setPreviewSpeaking(active) {
  previewSpeaking = active;
  $('#preview-mark')?.classList.toggle('speaking', active);
  const icon = active ? 'player-stop' : 'player-play';
  const playButton = $('#preview-voice');
  if (playButton) {
    playButton.setAttribute('aria-pressed', String(active));
    playButton.setAttribute('aria-label', active ? '停止试听' : '试听当前声音');
    playButton.innerHTML = `<i class="ti ti-${icon}" aria-hidden="true"></i>`;
  }
  const sheetButton = $('#sheet-preview-voice');
  if (sheetButton) sheetButton.innerHTML = `<i class="ti ti-${icon}" aria-hidden="true"></i>${active ? '停止' : '试听'}`;
}

/* ---------- 编辑面板 ---------- */
function editProfile() {
  openSheet('怎样称呼你', `<form id="profile-form"><label class="form-field"><span>你的名字</span><input id="name-input" type="text" value="${escapeText(profile.name)}" maxlength="12" autocomplete="off" aria-describedby="profile-error" required></label><label class="form-field"><span>一句话介绍自己</span><textarea id="bio-input" rows="2" maxlength="60">${escapeText(profile.bio)}</textarea></label><p class="form-error" id="profile-error" role="status"></p></form>`, '<button class="plain-button" data-action="close-sheet">取消</button><button class="primary-button" type="submit" form="profile-form">完成</button>', 'profile');
}
function editInterests() {
  selectedInterests = [...profile.interests];
  openSheet('你在意的事情', `<p class="sheet-copy">选择感兴趣的话题，最多选 6 个。</p><div class="interest-picker">${interestChoices.map((choice) => `<button data-interest="${choice}" aria-pressed="${selectedInterests.includes(choice)}">${choice}</button>`).join('')}</div>`, '<button class="plain-button" data-action="close-sheet">取消</button><button class="primary-button" data-action="save-interests">完成</button>', 'interests');
}
function pickVoice() {
  openSheet('选一个熟悉的声音', `<p class="sheet-copy">选择后立即应用。试听使用设备可用的语音。</p>${voices.map((voice, index) => `<button class="voice-choice ${index === voiceIndex ? 'selected' : ''}" data-voice="${index}" aria-pressed="${index === voiceIndex}"><i class="ti ti-wave-sine" aria-hidden="true"></i><span><strong>${voice.name}</strong><small>${voice.description}</small></span><span class="choice-circle"><i class="ti ti-check" aria-hidden="true"></i></span></button>`).join('')}`, '<button class="plain-button" id="sheet-preview-voice" data-action="preview-voice"><i class="ti ti-player-play" aria-hidden="true"></i>试听</button><button class="primary-button" data-action="close-sheet">完成</button>', 'voice-picker');
}
async function copyMessage(index) {
  const message = activeConversation?.messages[index];
  if (!message) return;
  if (!navigator.clipboard?.writeText) { toast('请长按或选中文字复制'); return; }
  try { await navigator.clipboard.writeText(message.text); toast('回答已复制'); }
  catch { toast('请长按或选中文字复制'); }
}

/* ---------- 动作 ---------- */
function handleAction(action, button) {
  switch (action) {
    case 'close-sheet': closeSheet(); break;
    case 'close-voice': closeVoiceStage(); break;
    case 'compose': openChat(); break;
    case 'voice': openVoiceStage(button); break;
    case 'voice-to-text': closeVoiceStage(); openChat(); break;
    case 'start-demo-voice': startDemoVoice(button); break;
    case 'preview-voice': {
      if (previewSpeaking) { speechSynthesis.cancel(); setPreviewSpeaking(false); break; }
      const phrase = `${profile.name}，我在。${personas[persona].description}`;
      const began = speak(phrase, () => setPreviewSpeaking(false));
      if (began) { setPreviewSpeaking(true); toast('正在试听设备语音'); }
      break;
    }
    case 'reset-personality': persona = 'gentle'; voiceIndex = 0; pace = 1; followup = true; renderPersonality(); toast('已恢复默认相处方式'); break;
    case 'voice-picker': pickVoice(); break;
    case 'edit-profile': editProfile(); break;
    case 'edit-interests': editInterests(); break;
    case 'save-interests': profile.interests = [...selectedInterests]; renderProfile(); closeSheet(); toast('兴趣已更新'); break;
    case 'reset-search':
      $('#history-search').value = '';
      historyFilter = 'all';
      renderFilterState();
      renderHistory();
      break;
    case 'privacy':
      openSheet('你的记录，由你掌握', '<p class="sheet-copy">对话与偏好可在历史记录里查看、收藏，也可随时让我忘记。清空会移除当前全部对话和偏好，不影响声音与性格设置。</p>', '<button class="plain-button" data-action="close-sheet">返回</button><button class="danger-button" data-action="confirm-clear">清空记录</button>', 'privacy');
      break;
    case 'confirm-clear': openSheet('清空所有记录？', '<p class="sheet-copy">全部对话和已记录的偏好将被移除。兴趣、个人信息与性格设置不会改变。</p>', '<button class="plain-button" data-action="close-sheet">保留记录</button><button class="danger-button" data-action="clear-records">清空记录</button>', 'confirm-clear'); break;
    case 'clear-records':
      history.length = 0;
      memories = [];
      activeConversation = null;
      pendingReplies.clear();
      renderHistory();
      renderProfile();
      updateRecent();
      closeSheet();
      toast('对话和偏好已清空');
      break;
  }
}

/* ---------- 事件 ---------- */
document.addEventListener('click', (event) => {
  const button = event.target.closest('button, .scrim');
  if (!button || button.disabled) return;
  if (button.dataset.page) return navigate(button.dataset.page);
  if (button.dataset.prompt) return openChat(null, button.dataset.prompt);
  if (button.dataset.promptSend) return sendMessage(button.dataset.promptSend);
  if (button.dataset.history) {
    if (!history.some((item) => item.id === button.dataset.history)) return toast('这段对话已清空');
    return openChat(button.dataset.history);
  }
  if (button.dataset.bookmark) {
    const item = history.find((conversation) => conversation.id === button.dataset.bookmark);
    item.starred = !item.starred;
    button.setAttribute('aria-pressed', String(item.starred));
    button.setAttribute('aria-label', `${item.starred ? '取消收藏' : '收藏'}${item.title}`);
    button.innerHTML = `<i class="ti ti-bookmark${item.starred ? '-filled' : ''}" aria-hidden="true"></i>`;
    toast(item.starred ? '对话已收藏' : '已取消收藏');
    return;
  }
  if (button.dataset.filterToggle) {
    historyFilter = historyFilter === button.dataset.filterToggle ? 'all' : button.dataset.filterToggle;
    renderFilterState();
    return renderHistory();
  }
  if (button.dataset.persona) { persona = button.dataset.persona; renderPersonality(); return; }
  if (button.dataset.pace !== undefined) { pace = Number(button.dataset.pace); renderPersonality(); return; }
  if (button.dataset.voice !== undefined) {
    voiceIndex = Number(button.dataset.voice);
    renderPersonality();
    $$('[data-voice]').forEach((item) => { const selected = Number(item.dataset.voice) === voiceIndex; item.classList.toggle('selected', selected); item.setAttribute('aria-pressed', String(selected)); });
    return;
  }
  if (button.dataset.interest) {
    const interest = button.dataset.interest;
    if (selectedInterests.includes(interest)) selectedInterests = selectedInterests.filter((value) => value !== interest);
    else if (selectedInterests.length >= 6) return toast('最多选择 6 个感兴趣的话题');
    else selectedInterests.push(interest);
    button.setAttribute('aria-pressed', String(selectedInterests.includes(interest)));
    return;
  }
  if (button.dataset.deleteMemory) {
    memories = memories.filter((memory) => memory.id !== button.dataset.deleteMemory);
    renderProfile();
    return toast('这条偏好已忘记');
  }
  if (button.dataset.copy !== undefined) return copyMessage(Number(button.dataset.copy));
  if (button.dataset.speak !== undefined) {
    const message = activeConversation?.messages[Number(button.dataset.speak)];
    if (message) speak(message.text);
    return;
  }
  if (button.id === 'followup-toggle') { followup = !followup; renderPersonality(); return; }
  if (button.id === 'sound-toggle') {
    soundEnabled = !soundEnabled;
    renderPersonality();
    if (!soundEnabled && 'speechSynthesis' in window) speechSynthesis.cancel();
    toast(soundEnabled ? '语音播放已开启' : '语音播放已关闭');
    return;
  }
  if (button.id === 'memory-toggle') { memoryEnabled = !memoryEnabled; renderProfile(); return toast(memoryEnabled ? '可以继续记住你的偏好' : '已停止记录新的偏好'); }
  if (button.dataset.action) handleAction(button.dataset.action, button);
});

$('#history-search').addEventListener('input', renderHistory);
window.addEventListener('resize', () => { if (voiceOpen) waveResize(); });
document.addEventListener('submit', (event) => {
  if (event.target.id === 'chat-form') { event.preventDefault(); sendMessage($('#chat-input').value); }
  if (event.target.id === 'profile-form') {
    event.preventDefault();
    const name = $('#name-input').value.trim();
    if (!name) { $('#profile-error').textContent = '写一个你喜欢的称呼。'; $('#name-input').focus(); return; }
    profile.name = name;
    profile.bio = $('#bio-input').value.trim();
    renderProfile();
    renderPersonality();
    closeSheet();
    toast('个人信息已更新');
  }
});
document.addEventListener('keydown', (event) => {
  if (voiceOpen && $('#voice-stage').classList.contains('open')) {
    if (event.key === 'Escape') { event.preventDefault(); closeVoiceStage(); return; }
    if (event.key !== 'Tab') return;
    const focusable = $$('button:not(:disabled), input:not(:disabled)', $('#voice-stage')).filter((element) => element.getClientRects().length);
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && (document.activeElement === first || document.activeElement === $('#voice-stage'))) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && (document.activeElement === last || document.activeElement === $('#voice-stage'))) { event.preventDefault(); first?.focus(); }
    return;
  }
  if (!$('#overlay').classList.contains('open')) return;
  if (event.key === 'Escape') { event.preventDefault(); closeSheet(); return; }
  if (event.key !== 'Tab') return;
  const focusable = $$('button:not(:disabled), input:not(:disabled), textarea:not(:disabled)', $('#sheet')).filter((element) => element.getClientRects().length);
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && (document.activeElement === first || document.activeElement === $('#sheet'))) { event.preventDefault(); last?.focus(); }
  else if (!event.shiftKey && (document.activeElement === last || document.activeElement === $('#sheet'))) { event.preventDefault(); first?.focus(); }
});

/* ---------- 初始化 ---------- */
buildRibbon();
updateClock();
setInterval(updateClock, 20000);
renderFilterState();
renderHistory();
renderPersonality();
renderProfile();
updateRecent();
