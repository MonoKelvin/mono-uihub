const $ = (selector, root = document) => root.querySelector(selector);
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const css = getComputedStyle(document.documentElement);
const color = name => css.getPropertyValue(`--${name}`).trim();
const MOODS = {
  serene: { name: '安宁', color: color('serene') },
  tender: { name: '温存', color: color('tender') },
  adrift: { name: '迷惑', color: color('adrift') },
  unease: { name: '不安', color: color('unease') },
  dread: { name: '惊惧', color: color('dread') },
};
const KIND = { person: '人物', place: '地点', mood: '情绪' };
const NODES = [
  { id: 'elevator', label: '电梯', type: 'place', count: 14 },
  { id: 'fall', label: '坠落感', type: 'mood', count: 12, mood: 'dread' },
  { id: 'kitchen', label: '老屋厨房', type: 'place', count: 9 },
  { id: 'grandma', label: '外婆', type: 'person', count: 8 },
  { id: 'exam', label: '考场', type: 'place', count: 7 },
  { id: 'confuse', label: '迷惑', type: 'mood', count: 7, mood: 'adrift' },
  { id: 'tender', label: '温存', type: 'mood', count: 6, mood: 'tender' },
  { id: 'rainst', label: '雨街', type: 'place', count: 6 },
  { id: 'mute', label: '失声', type: 'mood', count: 5, mood: 'adrift' },
  { id: 'chased', label: '被追', type: 'mood', count: 5, mood: 'unease' },
  { id: 'corridor', label: '旧居走廊', type: 'place', count: 5 },
  { id: 'mother', label: '母亲', type: 'person', count: 5 },
  { id: 'hospital', label: '医院长廊', type: 'place', count: 4 },
  { id: 'station', label: '水下车站', type: 'place', count: 4 },
  { id: 'chenyu', label: '陈屿', type: 'person', count: 4 },
  { id: 'rooftop', label: '学校天台', type: 'place', count: 4 },
  { id: 'shame', label: '羞耻', type: 'mood', count: 4, mood: 'unease' },
  { id: 'stranger', label: '陌生女人', type: 'person', count: 3 },
  { id: 'teacher', label: '班主任', type: 'person', count: 3 },
  { id: 'coastrd', label: '海边公路', type: 'place', count: 3 },
  { id: 'relief', label: '释然', type: 'mood', count: 3, mood: 'serene' },
];
const EDGES = [
  ['elevator', 'fall', 6], ['elevator', 'corridor', 3], ['elevator', 'hospital', 2],
  ['kitchen', 'grandma', 6], ['kitchen', 'tender', 5], ['grandma', 'tender', 4],
  ['exam', 'shame', 4], ['exam', 'teacher', 3], ['exam', 'mute', 3], ['exam', 'confuse', 2],
  ['rooftop', 'fall', 3], ['rooftop', 'chenyu', 2], ['station', 'confuse', 4],
  ['station', 'mute', 2], ['station', 'fall', 2], ['rainst', 'stranger', 3],
  ['rainst', 'confuse', 3], ['rainst', 'relief', 1], ['stranger', 'chased', 2],
  ['chased', 'corridor', 3], ['chased', 'mute', 2], ['hospital', 'mother', 4],
  ['hospital', 'mute', 2], ['mother', 'tender', 2], ['corridor', 'mother', 2],
  ['coastrd', 'relief', 3], ['coastrd', 'chenyu', 2], ['chenyu', 'confuse', 2],
  ['fall', 'mute', 2], ['shame', 'teacher', 2], ['kitchen', 'corridor', 2],
  ['grandma', 'hospital', 3],
];
const DREAMS = [
  { id: 'd1', at: 100, time: '01:28', cycle: 1, duration: 12, mood: 'adrift',
    text: '水下的车站，列车来了，但门是镜子。', nodes: ['station', 'mute', 'confuse'] },
  { id: 'd2', at: 175, time: '02:43', cycle: 2, duration: 20, mood: 'adrift',
    text: '路面是温的雨。没人打伞，有人叫我名字，却看不见脸。', nodes: ['rainst', 'stranger', 'confuse'] },
  { id: 'd3', at: 268, time: '04:16', cycle: 3, duration: 27, mood: 'tender',
    text: '外婆在老屋厨房削苹果，皮一直没断，窗外天还没亮。', nodes: ['kitchen', 'grandma', 'tender'] },
  { id: 'd4', at: 330, time: '05:18', cycle: 4, duration: 30, mood: 'unease',
    text: '考场找不到座位，卷子是空白的。班主任在门口点名。', nodes: ['exam', 'shame', 'teacher'] },
  { id: 'd5', at: 395, time: '06:23', cycle: 5, duration: 28, mood: 'dread',
    text: '电梯一直往下，按钮上的数字是手写的，按哪个都不停。', nodes: ['elevator', 'fall', 'corridor'] },
];
const HYPNO = [
  [0, 14, 'wake'], [14, 55, 'light'], [55, 85, 'deep'], [85, 100, 'light'],
  [100, 112, 'rem'], [112, 125, 'light'], [125, 160, 'deep'], [160, 175, 'light'],
  [175, 195, 'rem'], [195, 205, 'wake'], [205, 225, 'light'], [225, 250, 'deep'],
  [250, 268, 'light'], [268, 295, 'rem'], [295, 330, 'light'], [330, 360, 'rem'],
  [360, 370, 'wake'], [370, 395, 'light'], [395, 423, 'rem'], [423, 434, 'wake'],
];
const TREND = [-.22, -.46, -.12, .15, -.31, -.58, -.34, .06, .21, -.17, -.52, -.71, -.26, .12];
const trendDate = i => i === 0 ? '09/30' : `10/${String(i).padStart(2, '0')}`;
const THEMES = [
  { name: '电梯持续下坠', count: '9 周 7 次', note: '常与旧居走廊一起出现',
    weeks: [1, 1, 0, 1, 1, 1, 0, 1, 1], nodes: ['elevator', 'fall', 'corridor'] },
  { name: '找不到座位的考场', count: '本月 3 次', note: '回忆里反复出现点名与空白试卷',
    weeks: [0, 0, 1, 0, 1, 0, 0, 1, 0], nodes: ['exam', 'shame', 'mute'] },
  { name: '水下的车站', count: '6 周 4 次', note: '尝试记下每次不一样的细节',
    weeks: [0, 0, 0, 1, 1, 0, 1, 1, 0], nodes: ['station', 'confuse', 'mute'] },
];
const byId = new Map(NODES.map(n => [n.id, n]));
const neighbors = new Map(NODES.map(n => [n.id, []]));
EDGES.forEach(([a, b, count]) => {
  neighbors.get(a).push({ id: b, count });
  neighbors.get(b).push({ id: a, count });
});
neighbors.forEach(list => list.sort((a, b) => b.count - a.count));
const nodeColor = n => n.type === 'mood' ? MOODS[n.mood].color : n.type === 'place' ? color('place') : color('ink');

let toastTimer;
function toast(message) {
  $('#toast').textContent = message;
  $('#toast').classList.add('is-on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $('#toast').classList.remove('is-on'), 3400);
}
function timeLabel(date = new Date()) {
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false });
}
function tickClock() {
  const now = new Date();
  $('#clock').textContent = timeLabel(now);
  $('#clock').dateTime = now.toISOString();
  $('#dozeTime').textContent = timeLabel(now);
}
function durationLabel(seconds) {
  return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
}
function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const STORAGE_KEY = 'night-journal-text-notes';
let notes = [];
try {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  if (Array.isArray(saved)) {
    notes = saved.filter(n => n && typeof n.text === 'string' && n.text.length <= 4000 &&
      typeof n.createdAt === 'string' && Number.isFinite(Date.parse(n.createdAt)))
      .map(n => ({ text: n.text, createdAt: n.createdAt }));
  }
} catch {
  $('#storageNote').textContent = '本机存储不可用，文字暂留本页；请及时导出。';
}
const demoNotes = [...DREAMS].reverse().map(d => ({ ...d, demo: true }));
function tagIds(note) {
  return note.demo ? note.nodes : NODES.filter(n => note.text.includes(n.label)).map(n => n.id);
}
function makeTag(id) {
  const node = byId.get(id);
  const tag = document.createElement('span');
  tag.className = 'tag';
  const icon = document.createElement('i');
  icon.className = node.type === 'mood' ? 'swatch' : `ti ti-${node.type === 'person' ? 'user' : 'map-pin'}`;
  icon.setAttribute('aria-hidden', 'true');
  if (node.type === 'mood') icon.style.background = nodeColor(node);
  tag.append(icon, document.createTextNode(node.label));
  return tag;
}
function renderFragments() {
  const query = $('#searchInput').value.trim().toLocaleLowerCase();
  const all = [...notes, ...demoNotes];
  const shown = all.filter(n => `${n.text} ${tagIds(n).map(id => byId.get(id).label).join(' ')}`.toLocaleLowerCase().includes(query));
  const list = $('#frags');
  list.replaceChildren();
  $('#fragCount').textContent = query ? `${shown.length} / ${all.length} 条` : `${all.length} 条`;
  shown.forEach(note => {
    const li = document.createElement('li');
    li.className = 'frag';
    const meta = document.createElement('div');
    meta.className = 'frag-meta';
    const icon = document.createElement('i');
    icon.className = `ti ti-${note.audioUrl ? 'microphone' : 'pencil'}`;
    icon.setAttribute('aria-hidden', 'true');
    const stamp = document.createElement('time');
    stamp.className = 'frag-time';
    stamp.textContent = note.demo ? note.time : timeLabel(new Date(note.createdAt));
    stamp.dateTime = note.demo ? `2026-10-13T${note.time}:00` : note.createdAt;
    const source = document.createElement('span');
    source.textContent = note.demo ? '10/13 演示' : `${new Date(note.createdAt).toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })} ${note.audioUrl ? '本页录音' : '我的文字'}`;
    meta.append(icon, stamp, source);
    const text = document.createElement('p');
    text.className = 'frag-text';
    text.textContent = note.text;
    li.append(meta, text);
    if (note.audioUrl) {
      const audio = document.createElement('audio');
      audio.controls = true;
      audio.preload = 'metadata';
      audio.src = note.audioUrl;
      const save = document.createElement('a');
      save.className = 'text-btn';
      save.href = note.audioUrl;
      save.download = `夜录-${note.createdAt.replace(/[:.]/g, '-')}.${note.extension}`;
      save.textContent = '下载录音（刷新后不保留）';
      li.append(audio, save);
    } else {
      const tags = document.createElement('div');
      tags.className = 'frag-tags';
      tags.setAttribute('aria-label', note.demo ? '解析示例标签' : '本地关键词建议');
      tagIds(note).forEach(id => tags.append(makeTag(id)));
      if (!note.demo && !tags.childElementCount) {
        const empty = document.createElement('span');
        empty.className = 'local-note';
        empty.textContent = '未匹配到关键词，原文已保留。';
        tags.append(empty);
      }
      li.append(tags);
    }
    list.append(li);
  });
  if (!shown.length) {
    const empty = document.createElement('li');
    empty.className = 'empty-message';
    empty.textContent = '没有找到这段梦。试试其他文字。';
    list.append(empty);
  }
}
function showNewNote() {
  $('#searchInput').value = '';
  renderFragments();
  $('#frags').scrollTop = 0;
}
$('#jotForm').addEventListener('submit', event => {
  event.preventDefault();
  const input = $('#jotInput');
  const text = input.value.trim();
  if (!text) { toast('写下一点还记得的画面。'); input.focus(); return; }
  notes.unshift({ text, createdAt: new Date().toISOString() });
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes.filter(n => !n.audioUrl)));
    toast('这段梦已保存在本机。');
  } catch {
    $('#storageNote').textContent = '本机存储不可用，文字暂留本页；请及时导出。';
    toast('暂留本页，请用右上角按钮导出文字。');
  }
  input.value = '';
  showNewNote();
});
$('#searchToggle').addEventListener('click', () => {
  const row = $('#searchRow');
  row.hidden = !row.hidden;
  $('#searchToggle').setAttribute('aria-expanded', String(!row.hidden));
  if (!row.hidden) {
    $('#body').scrollIntoView({ block: 'start' });
    $('#searchInput').focus();
  } else {
    $('#searchInput').value = '';
    renderFragments();
  }
});
$('#searchInput').addEventListener('input', renderFragments);
$('#exportNotes').addEventListener('click', () => {
  const textNotes = notes.filter(n => !n.audioUrl);
  if (!textNotes.length) { toast('还没有自己的文字笔记，先记下一段梦。'); return; }
  downloadBlob(new Blob([JSON.stringify(textNotes, null, 2)], { type: 'application/json;charset=utf-8' }), '夜录-文字笔记.json');
});

let mediaRecorder = null;
let recordingStream = null;
let recordingPhase = 'idle';
let recordingTimer;
let recordingStart = 0;
let captureTicket = 0;
const recorderButtons = [$('#recBtn'), $('#dozeRec')];
function recordingMessage(message) {
  $('#recHint').textContent = message;
  $('#dozeHint').textContent = message;
}
function syncRecorder() {
  const active = recordingPhase === 'recording';
  const busy = recordingPhase === 'requesting' || recordingPhase === 'stopping';
  const label = active ? '结束录音' : busy ? '请稍候' : '点击录音';
  recorderButtons.forEach(button => {
    button.disabled = busy;
    button.classList.toggle('is-rec', active);
    button.setAttribute('aria-pressed', String(active));
    button.setAttribute('aria-label', active ? '结束录音' : '开始录音');
    $('i.ti', button).className = `ti ti-${active ? 'square' : 'microphone'}`;
  });
  $('.rec-label').textContent = label;
  $('#dozeRecLabel').textContent = label;
}
function releaseStream() {
  recordingStream?.getTracks().forEach(track => track.stop());
  recordingStream = null;
  clearInterval(recordingTimer);
}
function stopRecording() {
  if (recordingPhase === 'requesting') {
    captureTicket += 1;
    recordingPhase = 'idle';
    recordingMessage('已取消麦克风请求。');
    syncRecorder();
  } else if (mediaRecorder?.state === 'recording') {
    recordingPhase = 'stopping';
    syncRecorder();
    mediaRecorder.stop();
    releaseStream();
  }
}
async function toggleRecording() {
  if (recordingPhase === 'recording') { stopRecording(); return; }
  if (recordingPhase !== 'idle') return;
  if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
    recordingMessage('此环境不支持录音，请使用文字记录。');
    toast('录音需要支持麦克风的浏览器与安全访问环境。');
    return;
  }
  recordingPhase = 'requesting';
  const ticket = ++captureTicket;
  recordingMessage('请在浏览器中允许使用麦克风。');
  syncRecorder();
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    if (ticket !== captureTicket) { stream.getTracks().forEach(track => track.stop()); return; }
    recordingStream = stream;
    const recorder = new MediaRecorder(stream);
    mediaRecorder = recorder;
    const chunks = [];
    let failed = false;
    recorder.addEventListener('dataavailable', event => { if (event.data.size) chunks.push(event.data); });
    recorder.addEventListener('error', () => { failed = true; stopRecording(); });
    recorder.addEventListener('stop', () => {
      const seconds = (Date.now() - recordingStart) / 1000;
      releaseStream();
      mediaRecorder = null;
      recordingPhase = 'idle';
      syncRecorder();
      const blob = new Blob(chunks, { type: recorder.mimeType || chunks[0]?.type || 'audio/webm' });
      if (failed || !blob.size) {
        recordingMessage('没有取得录音，请重试或改用文字。');
        return;
      }
      const extension = blob.type.includes('mp4') ? 'm4a' : blob.type.includes('ogg') ? 'ogg' : 'webm';
      notes.unshift({ text: `语音片段 ${durationLabel(seconds)}，未转写。`, createdAt: new Date().toISOString(),
        audioUrl: URL.createObjectURL(blob), extension });
      showNewNote();
      recordingMessage('录音已留在本页，可回听或下载；未上传、未转写。');
    });
    recorder.start();
    recordingStart = Date.now();
    recordingPhase = 'recording';
    syncRecorder();
    recordingMessage('正在录音 0:00，再点一次结束。');
    recordingTimer = setInterval(() => recordingMessage(`正在录音 ${durationLabel((Date.now() - recordingStart) / 1000)}，再点一次结束。`), 500);
  } catch (error) {
    if (ticket !== captureTicket) return;
    releaseStream();
    recordingPhase = 'idle';
    syncRecorder();
    recordingMessage(error.name === 'NotAllowedError' ? '麦克风未获授权，仍可用文字记录。' : '麦克风不可用，请重试或用文字记录。');
  }
}
recorderButtons.forEach(button => button.addEventListener('click', toggleRecording));
function closeDoze() {
  stopRecording();
  $('#doze').hidden = true;
  $('#workspace').inert = false;
  $('.topbar').inert = false;
  $('#dozeOpen').focus();
}
$('#dozeOpen').addEventListener('click', () => {
  $('#doze').hidden = false;
  $('#workspace').inert = true;
  $('.topbar').inert = true;
  $('#dozeRec').focus();
});
$('#dozeClose').addEventListener('click', closeDoze);
$('#dozeText').addEventListener('click', () => { closeDoze(); $('#jotInput').focus(); });
$('#doze').addEventListener('keydown', event => {
  if (event.key === 'Escape') closeDoze();
  if (event.key !== 'Tab') return;
  const buttons = [...$('#doze').querySelectorAll('button:not(:disabled)')];
  const first = buttons[0], last = buttons.at(-1);
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
});
addEventListener('pagehide', () => {
  captureTicket += 1;
  stopRecording();
  releaseStream();
});

const canvas = $('#graph');
const ctx = canvas.getContext('2d');
const wrap = $('#canvasWrap');
const sim = NODES.map((n, i) => ({ ...n, r: Math.sqrt(n.count) * 6.8, x: 0, y: 0, vx: 0, vy: 0, index: i, pinned: false }));
const simById = new Map(sim.map(n => [n.id, n]));
const state = { w: 0, h: 0, active: new Set(Object.keys(KIND)), selected: null, hover: null, focus: null, drag: null };
let graphFrame = 0;
let graphTicks = 0;
const visible = n => state.active.has(n.type);
function seedGraph() {
  sim.forEach((n, i) => {
    const angle = i * 2.39996;
    const radius = Math.sqrt((i + 1) / sim.length) * Math.min(state.w, state.h) * .33;
    n.x = state.w / 2 + Math.cos(angle) * radius;
    n.y = state.h / 2 + Math.sin(angle) * radius;
    n.vx = 0; n.vy = 0;
  });
}
function stepGraph() {
  const nodes = sim.filter(visible);
  const scale = Math.min(1.3, Math.max(.6, Math.min(state.w / 540, state.h / 390)));
  nodes.forEach((a, i) => {
    nodes.slice(i + 1).forEach(b => {
      const dx = b.x - a.x || .1, dy = b.y - a.y || .1;
      const d2 = Math.max(1, dx * dx + dy * dy);
      const distance = Math.sqrt(d2);
      let force = 2600 * scale / d2;
      if (distance < a.r + b.r + 32) force += (a.r + b.r + 32 - distance) * .08;
      a.vx -= dx / distance * force; a.vy -= dy / distance * force;
      b.vx += dx / distance * force; b.vy += dy / distance * force;
      const overlapX = (Math.max(a.r * 2, a.label.length * 12) + Math.max(b.r * 2, b.label.length * 12)) / 2 + 16 - Math.abs(dx);
      const overlapY = a.r + b.r + 32 - Math.abs(dy);
      if (overlapX > 0 && overlapY > 0) {
        if (overlapX < overlapY) {
          const push = Math.sign(dx) * overlapX * .25;
          a.vx -= push; b.vx += push;
        } else {
          const push = Math.sign(dy) * overlapY * .25;
          a.vy -= push; b.vy += push;
        }
      }
    });
  });
  EDGES.forEach(([ida, idb, weight]) => {
    const a = simById.get(ida), b = simById.get(idb);
    if (!visible(a) || !visible(b)) return;
    const dx = b.x - a.x, dy = b.y - a.y;
    const distance = Math.hypot(dx, dy) || 1;
    const force = (distance - (95 + (6 - weight) * 13) * scale) * .006;
    a.vx += dx / distance * force; a.vy += dy / distance * force;
    b.vx -= dx / distance * force; b.vy -= dy / distance * force;
  });
  nodes.forEach(n => {
    if (n.pinned) { n.vx = 0; n.vy = 0; return; }
    n.vx = (n.vx + (state.w / 2 - n.x) * .0022) * .8;
    n.vy = (n.vy + (state.h / 2 - n.y) * .012) * .8;
    const horizontal = Math.max(n.r + 12, n.label.length * 6.5 + 10);
    n.x = Math.max(horizontal, Math.min(state.w - horizontal, n.x + Math.max(-7, Math.min(7, n.vx))));
    n.y = Math.max(n.r + 10, Math.min(state.h - n.r - 44, n.y + Math.max(-7, Math.min(7, n.vy))));
  });
}
function focusedNodes() {
  if (state.focus) return state.focus;
  const id = state.selected || state.hover;
  return id ? new Set([id, ...neighbors.get(id).map(n => n.id)]) : null;
}
function drawGraph() {
  const focus = focusedNodes();
  ctx.clearRect(0, 0, state.w, state.h);
  EDGES.forEach(([ida, idb, weight]) => {
    const a = simById.get(ida), b = simById.get(idb);
    if (!visible(a) || !visible(b)) return;
    const lit = focus?.has(ida) && focus.has(idb);
    ctx.strokeStyle = lit ? color('accent') : color('ink-2');
    ctx.globalAlpha = focus && !lit ? .045 : lit ? .45 : .10 + weight * .018;
    ctx.lineWidth = .6 + weight * .22;
    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
  });
  sim.filter(visible).forEach(n => {
    const dim = focus && !focus.has(n.id);
    ctx.globalAlpha = dim ? .24 : 1;
    const inside = n.type !== 'mood' && n.count >= 6;
    ctx.fillStyle = n.type === 'person' ? color('panel') : inside ? '#E1EBF1' : nodeColor(n);
    ctx.strokeStyle = n.type === 'person' || inside ? '#8DA7B8' : '#F4F7F9';
    ctx.lineWidth = n.type === 'person' ? 1.5 : 1;
    ctx.beginPath();
    if (n.type === 'mood') {
      const r = n.r * 1.18;
      ctx.moveTo(n.x, n.y - r); ctx.lineTo(n.x + r, n.y); ctx.lineTo(n.x, n.y + r); ctx.lineTo(n.x - r, n.y); ctx.closePath();
    } else ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();
    if (n.id === state.selected) {
      ctx.strokeStyle = color('accent'); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(n.x, n.y, n.r + 9, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.font = `${inside ? '500' : '400'} 12px ${css.getPropertyValue('--f-sans')}`;
    ctx.textAlign = 'center';
    ctx.fillStyle = color(n.id === state.selected ? 'ink' : 'ink-2');
    if (inside) {
      ctx.textBaseline = 'middle';
      if (n.label.length > 2) {
        ctx.fillText(n.label.slice(0, 2), n.x, n.y - 7);
        ctx.fillText(n.label.slice(2), n.x, n.y + 8);
      } else ctx.fillText(n.label, n.x, n.y);
    } else {
      ctx.textBaseline = 'top';
      ctx.fillText(n.label, n.x, n.y + n.r + 9);
    }
  });
  ctx.globalAlpha = 1;
}
function graphLoop() {
  graphFrame = 0;
  if (document.hidden) return;
  stepGraph(); drawGraph();
  if (--graphTicks > 0 || state.drag) graphFrame = requestAnimationFrame(graphLoop);
}
function wakeGraph(ticks = 100) {
  if (!state.w || !state.h) return;
  if (reducedMotion.matches) {
    cancelAnimationFrame(graphFrame); graphFrame = 0;
    for (let i = 0; i < ticks; i++) stepGraph();
    drawGraph();
    return;
  }
  graphTicks = ticks;
  if (!graphFrame) graphFrame = requestAnimationFrame(graphLoop);
}
function resizeGraph() {
  const width = wrap.clientWidth, height = wrap.clientHeight;
  if (!width || !height) return;
  const first = !state.w;
  const sx = state.w ? width / state.w : 1, sy = state.h ? height / state.h : 1;
  state.w = width; state.h = height;
  const dpr = Math.min(devicePixelRatio || 1, 2);
  canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  if (first) {
    seedGraph();
    for (let i = 0; i < 180; i++) stepGraph();
  } else sim.forEach(n => { n.x *= sx; n.y *= sy; });
  wakeGraph(160);
}
function syncFilters() {
  document.querySelectorAll('.chip[data-type]').forEach(button => {
    const active = state.active.has(button.dataset.type);
    button.classList.toggle('is-on', active);
    button.setAttribute('aria-pressed', String(active));
  });
}
function clearSelection() {
  state.selected = null; state.focus = null; state.hover = null;
  document.querySelectorAll('.card, .hypno-mark, #freq li, .theme').forEach(el => {
    el.classList.remove('is-sel');
    el.setAttribute('aria-pressed', 'false');
  });
  $('#graphTooltip').hidden = true;
}
function renderInspector() {
  $('#inspectorEmpty').hidden = Boolean(state.selected);
  $('#inspectorCard').hidden = !state.selected;
  if (!state.selected) return;
  const n = byId.get(state.selected);
  $('#insKind').textContent = KIND[n.type];
  $('#insName').textContent = n.label;
  $('#insCount').textContent = `${n.count} 次`;
  const list = $('#insLinks');
  list.replaceChildren();
  neighbors.get(n.id).slice(0, 3).forEach(nb => {
    const li = document.createElement('li');
    li.dataset.node = nb.id;
    li.tabIndex = 0;
    li.setAttribute('role', 'button');
    li.textContent = byId.get(nb.id).label;
    const count = document.createElement('em');
    count.textContent = `${nb.count} 次`;
    li.append(count); list.append(li);
  });
}
function selectNode(id) {
  clearSelection();
  state.selected = id;
  state.active.add(byId.get(id).type);
  syncFilters(); renderInspector();
  const row = $(`#freq [data-node="${id}"]`);
  row?.classList.add('is-sel'); row?.setAttribute('aria-pressed', 'true');
  wakeGraph(40);
}
function selectGroup(ids) {
  clearSelection();
  ids.forEach(id => state.active.add(byId.get(id).type));
  state.focus = new Set(ids);
  syncFilters(); renderInspector(); wakeGraph(40);
}
function selectDream(id) {
  const dream = DREAMS.find(d => d.id === id);
  selectGroup(dream.nodes);
  document.querySelectorAll(`[data-dream="${id}"]`).forEach(el => { el.classList.add('is-sel'); el.setAttribute('aria-pressed', 'true'); });
  $('.map-observation').textContent = `${dream.time} 的梦：${dream.nodes.map(n => byId.get(n).label).join('、')}`;
}
function resetGraph() {
  clearSelection();
  state.active = new Set(Object.keys(KIND));
  syncFilters(); renderInspector();
  $('.map-observation').textContent = '一些梦散去了，一些仍在彼此靠近。';
  seedGraph(); wakeGraph(240);
}
function hitTest(event) {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left, y = event.clientY - rect.top;
  return { x, y, node: sim.filter(visible).find(n => Math.hypot(n.x - x, n.y - y) < n.r + 10) };
}
canvas.addEventListener('pointerdown', event => {
  if (event.button !== 0) return;
  const { node } = hitTest(event);
  if (!node) { clearSelection(); renderInspector(); drawGraph(); return; }
  selectNode(node.id);
  state.drag = node; node.pinned = true;
  canvas.setPointerCapture(event.pointerId);
  canvas.classList.add('is-drag');
});
canvas.addEventListener('pointermove', event => {
  const { x, y, node } = hitTest(event);
  if (state.drag) {
    const padding = Math.max(42, state.drag.r + 14);
    state.drag.x = Math.max(padding, Math.min(state.w - padding, x));
    state.drag.y = Math.max(28, Math.min(state.h - 46, y));
    $('#graphTooltip').hidden = true;
    wakeGraph(30); return;
  }
  state.hover = node?.id || null;
  canvas.classList.toggle('is-hit', Boolean(node));
  const tip = $('#graphTooltip');
  tip.hidden = !node;
  if (node) {
    tip.textContent = `${node.label} / ${KIND[node.type]} / ${node.count} 次`;
    tip.style.left = `${Math.max(8, Math.min(state.w - 195, x + 16))}px`;
    tip.style.top = `${Math.max(8, y - 40)}px`;
  }
  drawGraph();
});
function releaseDrag() {
  if (state.drag) state.drag.pinned = false;
  state.drag = null;
  canvas.classList.remove('is-drag');
  wakeGraph(45);
}
canvas.addEventListener('pointerup', releaseDrag);
canvas.addEventListener('pointercancel', releaseDrag);
canvas.addEventListener('lostpointercapture', releaseDrag);
canvas.addEventListener('pointerleave', () => {
  state.hover = null; $('#graphTooltip').hidden = true;
  canvas.classList.remove('is-hit'); drawGraph();
});
canvas.addEventListener('keydown', event => {
  if (event.key === 'Escape') { clearSelection(); renderInspector(); drawGraph(); return; }
  if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Enter'].includes(event.key)) return;
  event.preventDefault();
  const nodes = sim.filter(visible);
  const index = nodes.findIndex(n => n.id === state.selected);
  const step = ['ArrowLeft', 'ArrowUp'].includes(event.key) ? -1 : 1;
  const next = event.key === 'Enter' && index >= 0 ? index : (index + step + nodes.length) % nodes.length;
  selectNode(nodes[next].id);
});
$('.chips').addEventListener('click', event => {
  const button = event.target.closest('[data-type]');
  if (!button) return;
  const type = button.dataset.type;
  if (state.active.has(type)) {
    if (state.active.size === 1) { toast('至少保留一类元素。'); return; }
    state.active.delete(type);
  } else state.active.add(type);
  clearSelection(); syncFilters(); renderInspector(); wakeGraph(120);
});
$('#insClose').addEventListener('click', () => { clearSelection(); renderInspector(); drawGraph(); });
$('#resetGraph').addEventListener('click', resetGraph);

function renderFrequency() {
  $('#freq').innerHTML = NODES.slice(0, 6).map(n => `<li data-node="${n.id}" tabindex="0" role="button" aria-pressed="false" title="${n.label}：${n.count} 次；点击查看共现">
    <div class="freq-row"><span class="freq-name">${n.label}</span><span class="freq-val">${n.count} 次</span></div>
    <div class="freq-bar"><span class="freq-fill" style="--w:${n.count / 14 * 100}%;width:${n.count / 14 * 100}%"></span></div></li>`).join('');
}
function renderThemes() {
  $('#themes').innerHTML = THEMES.map((theme, i) => `<li class="theme" data-theme="${i}" tabindex="0" role="button" aria-pressed="false" title="${theme.note}">
    <div class="theme-top"><span class="theme-name">${theme.name}</span><span class="theme-count">${theme.count}</span></div>
    <div class="theme-weeks" role="img" aria-label="近9周出现于第${theme.weeks.map((on, week) => on ? week + 1 : '').filter(Boolean).join('、')}周">
    ${theme.weeks.map(on => `<i class="${on ? 'on' : ''}" aria-hidden="true"></i>`).join('')}<span>近 9 周</span></div></li>`).join('');
}
function renderTrend() {
  const points = TREND.map((value, i) => [i / 13 * 300, 54 - value * 42]);
  const path = points.map(([x, y], i) => `${i ? 'L' : 'M'}${x} ${y}`).join(' ');
  $('#trendLine').setAttribute('d', path);
  $('#trendArea').setAttribute('d', `${path}L300 54 L0 54 Z`);
  $('#trendArea').classList.add('is-in');
  const hit = $('#trendHit');
  let active = 13;
  function inspect(index) {
    active = Math.max(0, Math.min(13, index));
    const [x, y] = points[active];
    $('#trendCursor').setAttribute('cx', x); $('#trendCursor').setAttribute('cy', y);
    const crosshair = $('#trendCrosshair');
    crosshair.setAttribute('x1', x); crosshair.setAttribute('x2', x); crosshair.setAttribute('visibility', 'visible');
    const description = `${trendDate(active)} ${TREND[active] > 0 ? '+' : ''}${TREND[active].toFixed(2)}`;
    $('#trendRead').textContent = description;
    hit.setAttribute('aria-valuenow', active + 1);
    hit.setAttribute('aria-valuetext', description);
  }
  hit.addEventListener('pointermove', event => {
    const rect = hit.getBoundingClientRect();
    inspect(Math.round((event.clientX - rect.left) / rect.width * 13));
  });
  hit.addEventListener('pointerleave', () => {
    if (document.activeElement === hit) return;
    $('#trendCursor').setAttribute('cx', -9);
    $('#trendCrosshair').setAttribute('visibility', 'hidden');
    $('#trendRead').textContent = '近 14 夜';
  });
  hit.addEventListener('focus', () => inspect(active));
  hit.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    inspect(event.key === 'Home' ? 0 : event.key === 'End' ? 13 : active + (event.key === 'ArrowLeft' ? -1 : 1));
  });
}
const LEVEL = { wake: 10, rem: 26, light: 42, deep: 58 };
function renderHypno() {
  const svg = $('#hypnoSvg');
  const width = svg.clientWidth || 1000;
  const height = svg.clientHeight || 48;
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  const x = minute => minute / 434 * width;
  const y = level => LEVEL[level] / 72 * height;
  const bands = HYPNO.filter(s => s[2] === 'rem').map(([a, b]) => `<rect class="hypno-rem" x="${x(a)}" y="0" width="${x(b - a)}" height="${height}"></rect>`).join('');
  const lines = Object.keys(LEVEL).map(level => `<line class="hypno-grid" x1="0" y1="${y(level)}" x2="${width}" y2="${y(level)}"></line>`).join('');
  const path = HYPNO.map(([a, b, level], i) => `${i ? 'L' : 'M'}${x(a)} ${y(level)}L${x(b)} ${y(level)}`).join(' ');
  const marks = DREAMS.map(d => `<g class="hypno-mark" data-dream="${d.id}" role="button" tabindex="0" aria-pressed="false" aria-label="${d.time} 第${d.cycle}周期，${MOODS[d.mood].name}">
    <title>${d.time} / REM ${d.cycle} / ${MOODS[d.mood].name} / ${d.duration} 分钟</title>
    <circle class="hit-area" cx="${x(d.at)}" cy="${y('rem')}" r="14" fill="transparent"></circle>
    <circle class="halo" cx="${x(d.at)}" cy="${y('rem')}" r="9"></circle>
    <circle class="mark" cx="${x(d.at)}" cy="${y('rem')}" r="4.5" fill="${MOODS[d.mood].color}"></circle></g>`).join('');
  svg.innerHTML = `${bands}${lines}<path class="hypno-line" d="${path}"></path>${marks}`;
  const selected = $('#cards .is-sel')?.dataset.dream;
  if (selected) {
    const mark = $(`[data-dream="${selected}"]`, svg);
    mark.classList.add('is-sel'); mark.setAttribute('aria-pressed', 'true');
  }
}
function renderCards() {
  $('#cards').innerHTML = DREAMS.map(d => `<button class="card" type="button" data-dream="${d.id}" aria-pressed="false" style="--mood:${MOODS[d.mood].color}">
    <div class="card-top"><span class="card-time">${d.time}</span><span class="card-cycle">REM ${d.cycle}</span><span class="card-mood" aria-hidden="true"></span></div>
    <p class="card-text">${d.text}</p><div class="card-foot"><span>${MOODS[d.mood].name}</span><span class="card-dur">${d.duration} 分钟</span></div></button>`).join('');
  $('#legendMoods').innerHTML = Object.values(MOODS).map(m => `<span class="legend-mood"><i style="background:${m.color}" aria-hidden="true"></i>${m.name}</span>`).join('');
}
function activateLink(target) {
  const node = target.closest('[data-node]');
  if (node) { selectNode(node.dataset.node); return; }
  const theme = target.closest('[data-theme]');
  if (theme) {
    const t = THEMES[Number(theme.dataset.theme)];
    selectGroup(t.nodes);
    theme.classList.add('is-sel'); theme.setAttribute('aria-pressed', 'true');
    $('.map-observation').textContent = `重复主题：${t.name}`;
    return;
  }
  const dream = target.closest('[data-dream]');
  if (dream) selectDream(dream.dataset.dream);
}
$('#workspace').addEventListener('click', event => activateLink(event.target));
$('#workspace').addEventListener('keydown', event => {
  if (!['Enter', ' '].includes(event.key) || event.target.tagName === 'BUTTON') return;
  if (!event.target.closest('[data-node], [data-theme], [data-dream]')) return;
  event.preventDefault(); activateLink(event.target);
});
function makeTable(title, headers, rows) {
  const table = document.createElement('table');
  const caption = table.createCaption(); caption.textContent = title;
  const head = table.createTHead().insertRow();
  headers.forEach(label => { const th = document.createElement('th'); th.scope = 'col'; th.textContent = label; head.append(th); });
  const body = table.createTBody();
  rows.forEach(values => { const row = body.insertRow(); values.forEach(value => { row.insertCell().textContent = String(value); }); });
  return table;
}
function renderDataTables() {
  const levels = { wake: '醒', rem: 'REM', light: '浅睡', deep: '深睡' };
  $('#dataTables').replaceChildren(
    makeTable('梦境元素', ['元素', '类型', '出现次数'], NODES.map(n => [n.label, KIND[n.type], n.count])),
    makeTable('共现关系', ['元素', '关联元素', '共现次数'], EDGES.map(([a, b, count]) => [byId.get(a).label, byId.get(b).label, count])),
    makeTable('情绪倾向（−1 沉重，+1 轻盈）', ['日期', '倾向'], TREND.map((value, i) => [trendDate(i), value.toFixed(2)])),
    makeTable('睡眠分期（以 23:48 为第 0 分钟）', ['开始 / 分钟', '结束 / 分钟', '分期'], HYPNO.map(([a, b, stage]) => [a, b, levels[stage]])),
  );
}
$('#openData').addEventListener('click', () => $('#dataDialog').showModal());
$('#closeData').addEventListener('click', () => $('#dataDialog').close());
$('#dataDialog').addEventListener('click', event => {
  const rect = $('#dataDialog').getBoundingClientRect();
  if (event.target === $('#dataDialog') && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) $('#dataDialog').close();
});
renderFragments(); renderFrequency(); renderThemes(); renderTrend(); renderHypno(); renderCards(); renderDataTables();
renderInspector(); tickClock();
setInterval(tickClock, 15000);
resizeGraph();
new ResizeObserver(resizeGraph).observe(wrap);
new ResizeObserver(renderHypno).observe($('#hypnoSvg'));
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { stopRecording(); cancelAnimationFrame(graphFrame); graphFrame = 0; }
  else wakeGraph(30);
});
reducedMotion.addEventListener('change', () => wakeGraph(180));
