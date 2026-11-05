'use strict';

const templates = [
  { id: 'grey', name: '高级灰', titles: ['灰调之间', '安静的层次', '不止黑白', '温柔的分寸'], palettes: [['#E8E4E0', '#B6A6B3', '#777480', '#C3AB78', '#37383D'], ['#E6E5E4', '#A6A9AF', '#757B87', '#B9AAA1', '#333A45'], ['#E5E1DD', '#B5ADA6', '#87847D', '#A89D8C', '#383734'], ['#ECE7E9', '#C3B5BF', '#8A7989', '#ABA4BB', '#3F3644']] },
  { id: 'macaron', name: '马卡龙', titles: ['轻甜一刻', '柔软的相遇', '糖果的留白', '轻盈好心情'], palettes: [['#F6E9EA', '#DAB5CE', '#ACCAB7', '#F1CE8E', '#59637E'], ['#F5EEE2', '#F0B7AE', '#B7BFE0', '#BFD8BD', '#756385'], ['#EFF0F7', '#C1B0DC', '#F2C4CA', '#B5D6D8', '#686785'], ['#F6EEE6', '#B6D8CB', '#E9B8D0', '#EDCE9E', '#677971']] },
  { id: 'chinese', name: '中国风', titles: ['山河入色', '东方有韵', '一抹丹青', '古意新生'], palettes: [['#EDE5D4', '#B34135', '#66765D', '#C9A35D', '#343D3C'], ['#EAE1CD', '#9F393C', '#797A52', '#BB8D4B', '#3E3630'], ['#E8E6D9', '#7D998D', '#74839B', '#B77960', '#353E4B'], ['#EAE3D8', '#BA6E62', '#9C8A60', '#4D7375', '#3B3936']] },
  { id: 'zen', name: '日式禅意', titles: ['静谧有形', '寻一处宁静', '自然的呼吸', '侘寂之间'], palettes: [['#E8E4DB', '#9DAB8B', '#A49A85', '#B88C72', '#474C41'], ['#EAE5DA', '#B6AC8D', '#838A71', '#ACA5A0', '#494740'], ['#E4E2D9', '#9BA69B', '#B3A797', '#A08F80', '#3D4A43'], ['#E8E3DA', '#AD9F8A', '#8C9490', '#B8AA8E', '#494740']] },
  { id: 'european', name: '欧式简约', titles: ['少即是美', '恰好的秩序', '留白的艺术', '简而不凡'], palettes: [['#ECE9E1', '#AFBBC6', '#A59789', '#C2AC75', '#354250'], ['#E9E9E7', '#B8B4CF', '#8E929C', '#CCAF97', '#3C3A49'], ['#EBE8E4', '#AE9A91', '#8F9F9C', '#C0B483', '#3E4542'], ['#F0EBDD', '#B6BDB2', '#8C847C', '#D0B582', '#44423A']] },
  { id: 'american', name: '美式复古', titles: ['旧时光，新灵感', '有故事的颜色', '自由的温度', '经典不设限'], palettes: [['#EADBC2', '#AC5A40', '#647977', '#D3A346', '#354A59'], ['#EBDAC2', '#AD7447', '#79754F', '#C78B56', '#4B4240'], ['#E4D8C9', '#AB6957', '#717E98', '#B99A63', '#3C4352'], ['#EADDCC', '#9E5E48', '#707B61', '#CBAD6A', '#443A33']] }
];
const roles = ['底色', '主色', '辅色', '点缀', '深色'];
const canvas = document.querySelector('.canvas');
const styleList = document.getElementById('style-list');
const swatches = document.getElementById('swatches');
const range = document.getElementById('concentration');
const generateButton = document.getElementById('generate');
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
const state = {
  template: 0,
  colors: [...templates[0].palettes[0]],
  base: [...templates[0].palettes[0]],
  locked: Array(5).fill(false),
  concentration: 50,
  title: templates[0].titles[0],
  preview: 'sculpture',
  history: [],
  position: -1
};
const generated = new Set([state.colors.join(',')]);
let paletteMotion;
let viewMotion;
let toastTimer;
let dialogTrigger;
let sliderStart;
let previewOffset;

function clamp(value, min, max) { return Math.min(max, Math.max(min, value)); }
function random(min, max) {
  const value = new Uint32Array(1);
  crypto.getRandomValues(value);
  return min + (value[0] / 4294967296) * (max - min);
}
function hexToHsl(hex) {
  const rgb = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255);
  const max = Math.max(...rgb), min = Math.min(...rgb), d = max - min;
  const l = (max + min) / 2;
  let h = 0, s = 0;
  if (d) {
    s = d / (1 - Math.abs(2 * l - 1));
    if (max === rgb[0]) h = ((rgb[1] - rgb[2]) / d) % 6;
    else if (max === rgb[1]) h = (rgb[2] - rgb[0]) / d + 2;
    else h = (rgb[0] - rgb[1]) / d + 4;
    h *= 60;
  }
  return [(h + 360) % 360, s * 100, l * 100];
}
function hslToHex(h, s, l) {
  h = ((h % 360) + 360) % 360; s /= 100; l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;
  const rgb = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return '#' + rgb.map(v => Math.round((v + m) * 255).toString(16).padStart(2, '0')).join('').toUpperCase();
}
function luminance(hex) {
  const linear = [1, 3, 5].map(i => {
    const v = parseInt(hex.slice(i, i + 2), 16) / 255;
    return v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4;
  });
  return .2126 * linear[0] + .7152 * linear[1] + .0722 * linear[2];
}
function foreground(hex) {
  const l = luminance(hex);
  const darkContrast = (l + .05) / (luminance('#17171B') + .05);
  const lightContrast = 1.05 / (l + .05);
  return darkContrast >= 4.5 ? '#17171B' : lightContrast >= 4.5 ? '#FFFFFF' : '#000000';
}
function concentrated(hex, amount) {
  const [h, s, l] = hexToHsl(hex);
  return hslToHex(h, clamp(s * (.45 + amount * .011), 0, 80), l);
}
function colorDistance(a, b) {
  const rgbA = [1, 3, 5].map(i => parseInt(a.slice(i, i + 2), 16));
  const rgbB = [1, 3, 5].map(i => parseInt(b.slice(i, i + 2), 16));
  return Math.hypot(...rgbA.map((v, i) => v - rgbB[i]));
}
function snapshot() {
  return { colors: [...state.colors], base: [...state.base], template: state.template, concentration: state.concentration, title: state.title, time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) };
}
function saveHistory() {
  state.history = state.history.slice(0, state.position + 1);
  state.history.push(snapshot());
  if (state.history.length > 40) state.history.shift();
  state.position = state.history.length - 1;
  updateHistoryControls();
}
function updateHistoryControls() {
  document.getElementById('history-position').textContent = state.position + 1;
  document.getElementById('history-total').textContent = state.history.length;
  document.getElementById('undo').disabled = state.position <= 0;
  document.getElementById('redo').disabled = state.position >= state.history.length - 1;
}
function canAnimate(animate = true) { return animate && !motionPreference.matches && Boolean(window.gsap); }
function pointerAction(event) { return event.type === 'click' && event.detail > 0; }

styleList.innerHTML = templates.map((t, i) => `<button class="style-button" data-style="${i}" aria-pressed="${i === 0}"><span class="style-sample" aria-hidden="true">${t.palettes[0].map(c => `<b style="background:${c}"></b>`).join('')}</span><span>${t.name}</span></button>`).join('');
swatches.innerHTML = state.colors.map((c, i) => `<div class="swatch-slot" data-index="${i}"><div class="swatch" style="--color:${c};--on-color:${foreground(c)}"><button class="copy-color" data-copy="${i}" aria-label="复制${roles[i]} ${c}"><span class="copy-glyph" aria-hidden="true"><i class="ti ti-copy"></i><span>复制</span></span></button><div class="swatch-tools"><button class="lock-color" data-lock="${i}" aria-label="锁定${roles[i]}" aria-pressed="false"><i class="ti ti-lock-open lock-outline" aria-hidden="true"></i><svg class="lock-fill" width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V7a5 5 0 0 0-5-5ZM9 7a3 3 0 0 1 6 0v3H9V7Zm3 7a2 2 0 0 1 1 3.732V19h-2v-1.268A2 2 0 0 1 12 14Z"/></svg></button><button class="edit-color" data-edit="${i}" aria-label="编辑${roles[i]}色值"><i class="ti ti-pencil" aria-hidden="true"></i></button></div><span class="swatch-hex">${c}</span></div><p class="swatch-role">${roles[i]}</p></div>`).join('');
const swatchElements = [...document.querySelectorAll('.swatch')];

function render() {
  state.colors.forEach((color, i) => {
    canvas.style.setProperty(`--p${i + 1}`, color);
    canvas.style.setProperty(`--on-p${i + 1}`, foreground(color));
    const swatch = swatchElements[i];
    swatch.style.setProperty('--color', color);
    swatch.style.setProperty('--on-color', foreground(color));
    swatch.querySelector('.swatch-hex').textContent = color;
    swatch.querySelector('.copy-color').setAttribute('aria-label', `复制${roles[i]} ${color}`);
    const lock = swatch.querySelector('.lock-color');
    lock.setAttribute('aria-pressed', String(state.locked[i]));
    lock.setAttribute('aria-label', `${state.locked[i] ? '解锁' : '锁定'}${roles[i]}`);
  });
  document.querySelectorAll('.style-button').forEach((button, i) => button.setAttribute('aria-pressed', String(i === state.template)));
  document.getElementById('palette-title').textContent = state.title;
  const count = state.locked.filter(Boolean).length;
  document.getElementById('lock-hint').textContent = count ? `${count} 色已锁定` : '喜欢的颜色，锁住它';
  generateButton.disabled = count === 5;
  document.getElementById('generate-label').textContent = count === 5 ? '解锁后再生成' : '再来一组';
  range.disabled = count === 5;
  range.value = state.concentration;
  range.style.background = `linear-gradient(to right, var(--ink) ${state.concentration}%, var(--line) ${state.concentration}%)`;
  document.getElementById('concentration-value').textContent = state.concentration < 33 ? '柔和' : state.concentration > 66 ? '鲜明' : '适中';
  updateHistoryControls();
}

function animatePalette(animate, changed = state.colors.map((_, i) => i)) {
  if (paletteMotion) paletteMotion.kill();
  if (!canAnimate(animate)) {
    if (window.gsap) gsap.set([...swatchElements, ...document.querySelectorAll('.sculpture-piece'), document.querySelector('.generate-icon')], { x: 0, y: 0, rotationY: 0, scale: 1 });
    return;
  }
  const targets = changed.map(i => swatchElements[i]);
  paletteMotion = gsap.timeline({ defaults: { ease: 'power3.out', overwrite: 'auto' } });
  paletteMotion.to(targets, { rotationY: -18, y: -5, duration: .12, stagger: .028 }, 0)
    .to(targets, { rotationY: 0, y: 0, duration: .28, stagger: .028 }, .13)
    .to('.generate-icon', { rotation: '+=180', duration: .42 }, 0)
    .to('.harmony-mark', { rotation: '+=60', duration: .44 }, 0);
  if (state.preview === 'sculpture') {
    const pieces = document.querySelectorAll('.sculpture-piece');
    paletteMotion.to(pieces, { y: i => i === 0 ? 0 : -7 - i * 2, x: i => i % 2 ? 4 : -4, duration: .15, stagger: .025 }, .02)
      .to(pieces, { x: 0, y: 0, duration: .32, stagger: .025 }, .18);
  } else {
    paletteMotion.to(`[data-view="${state.preview}"]`, { scale: .985, duration: .1 }, 0)
      .to(`[data-view="${state.preview}"]`, { scale: 1, duration: .24 }, .1);
  }
}

function generatePalette(animate = true) {
  if (state.locked.every(Boolean)) return;
  const template = templates[state.template];
  const anchor = template.palettes[Math.floor(random(0, template.palettes.length))];
  const hueShift = random(-9, 9), lightShift = random(-2, 2);
  const nextBase = [...state.base], nextColors = [...state.colors];
  for (let i = 0; i < 5; i++) {
    if (state.locked[i]) continue;
    const [h, s, l] = hexToHsl(anchor[i]);
    let color, base;
    for (let attempt = 0; attempt < 80; attempt++) {
      base = hslToHex(h + hueShift + random(-6, 6), clamp(s + random(-4, 4), 2, 76), clamp(l + lightShift + random(-3, 3), i === 4 ? 12 : 25, i === 0 ? 94 : 87));
      color = concentrated(base, state.concentration);
      const separated = nextColors.every((other, j) => j === i || colorDistance(color, other) > 25);
      if (colorDistance(color, state.colors[i]) > 9 && separated) break;
    }
    if (color === state.colors[i]) {
      const [bh, bs, bl] = hexToHsl(base);
      base = hslToHex(bh, bs, clamp(bl + 2, 1, 99));
      color = concentrated(base, state.concentration);
    }
    nextBase[i] = base; nextColors[i] = color;
  }
  while (generated.has(nextColors.join(','))) {
    const i = state.locked.findIndex(locked => !locked);
    const [h, s, l] = hexToHsl(nextBase[i]);
    nextBase[i] = hslToHex(h + random(-3, 3), s, clamp(l + random(-2, 2), 3, 97));
    nextColors[i] = concentrated(nextBase[i], state.concentration);
  }
  const changed = nextColors.flatMap((c, i) => c !== state.colors[i] ? [i] : []);
  state.base = nextBase; state.colors = nextColors;
  const candidates = template.titles.filter(title => title !== state.title);
  state.title = candidates[Math.floor(random(0, candidates.length))];
  generated.add(nextColors.join(','));
  saveHistory(); render(); animatePalette(animate, changed);
  document.getElementById('live-region').textContent = `${template.name}，新配色：${state.colors.join('、')}`;
}

function restoreHistory(index, animate = true) {
  if (index < 0 || index >= state.history.length || index === state.position) return;
  const entry = state.history[index];
  const changed = entry.colors.flatMap((c, i) => c !== state.colors[i] ? [i] : []);
  state.colors = [...entry.colors]; state.base = [...entry.base]; state.template = entry.template;
  state.concentration = entry.concentration; state.title = entry.title; state.position = index;
  render(); animatePalette(animate, changed);
  document.getElementById('live-region').textContent = `已恢复第 ${index + 1} 组配色`;
}

function toast(message, error = false) {
  const element = document.getElementById('toast');
  clearTimeout(toastTimer);
  element.querySelector('span').textContent = message;
  element.querySelector('i').className = `ti ${error ? 'ti-alert-circle' : 'ti-check'}`;
  element.classList.add('is-visible');
  toastTimer = setTimeout(() => element.classList.remove('is-visible'), 2600);
}
async function copyText(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      const input = document.createElement('textarea');
      input.value = text; input.className = 'sr-only'; input.setAttribute('readonly', '');
      canvas.appendChild(input); input.select();
      const copied = document.execCommand('copy'); input.remove();
      if (!copied) throw new Error('clipboard');
    }
    toast(text.includes(',') ? '五色色值已复制' : `已复制 ${text}`);
  } catch {
    toast('无法访问剪贴板，请通过导出获取色值', true);
  }
}

styleList.addEventListener('click', event => {
  const button = event.target.closest('[data-style]');
  if (!button) return;
  if (state.locked.every(Boolean)) { toast('请先解锁至少一种颜色，再切换风格', true); return; }
  state.template = Number(button.dataset.style);
  generatePalette(pointerAction(event));
});
generateButton.addEventListener('click', event => generatePalette(pointerAction(event)));
document.getElementById('undo').addEventListener('click', event => restoreHistory(state.position - 1, pointerAction(event)));
document.getElementById('redo').addEventListener('click', event => restoreHistory(state.position + 1, pointerAction(event)));
document.getElementById('copy-all').addEventListener('click', () => copyText(state.colors.join(', ')));
swatches.addEventListener('click', event => {
  const lock = event.target.closest('[data-lock]');
  const edit = event.target.closest('[data-edit]');
  const copy = event.target.closest('[data-copy]');
  if (lock) {
    const i = Number(lock.dataset.lock);
    state.locked[i] = !state.locked[i]; render();
    if (canAnimate(pointerAction(event))) gsap.fromTo(lock, { scale: .86 }, { scale: 1, duration: .22, ease: 'back.out(1.7)', overwrite: 'auto' });
    document.getElementById('live-region').textContent = `${roles[i]}${state.locked[i] ? '已锁定' : '已解锁'}`;
  } else if (edit) openEditor(Number(edit.dataset.edit), edit);
  else if (copy) copyText(state.colors[Number(copy.dataset.copy)]);
});
range.addEventListener('pointerdown', () => { sliderStart = state.colors.join(','); });
range.addEventListener('keydown', () => { sliderStart ??= state.colors.join(','); });
range.addEventListener('input', () => {
  state.concentration = Number(range.value);
  state.colors = state.base.map((color, i) => state.locked[i] ? state.colors[i] : concentrated(color, state.concentration));
  render();
});
range.addEventListener('change', () => {
  if (state.colors.join(',') !== (sliderStart || state.history[state.position].colors.join(','))) saveHistory();
  sliderStart = undefined;
});

function placePreviewIndicator(animate = false) {
  const tabs = [...document.querySelectorAll('.preview-tab')];
  const index = tabs.findIndex(tab => tab.dataset.preview === state.preview);
  const indicator = document.querySelector('.preview-indicator');
  const target = tabs[index].offsetLeft - 5;
  if (canAnimate(animate)) gsap.to(indicator, { x: target, duration: .24, ease: 'power3.out', overwrite: 'auto' });
  else if (window.gsap) gsap.set(indicator, { x: target });
  else indicator.style.transform = `translateX(${target}px)`;
}
function switchPreview(name, animate = true) {
  if (name === state.preview) return;
  const previous = document.querySelector(`[data-view="${state.preview}"]`);
  const next = document.querySelector(`[data-view="${name}"]`);
  state.preview = name;
  if (viewMotion) viewMotion.kill();
  document.querySelectorAll('.preview-view').forEach(view => {
    view.hidden = view !== next;
    if (window.gsap) gsap.set(view, { opacity: 1, x: 0, scale: 1 });
  });
  document.querySelectorAll('.preview-tab').forEach(tab => {
    const active = tab.dataset.preview === name;
    tab.classList.toggle('is-active', active); tab.setAttribute('aria-pressed', String(active));
  });
  placePreviewIndicator(animate);
  if (canAnimate(animate)) {
    previous.hidden = false; previous.style.zIndex = '0'; next.style.zIndex = '1';
    viewMotion = gsap.timeline({ onComplete: () => { previous.hidden = true; } });
    viewMotion.fromTo(next, { opacity: 0, x: 10 }, { opacity: 1, x: 0, duration: .25, ease: 'power3.out' }, 0)
      .to(previous, { opacity: 0, duration: .18 }, 0);
  }
}
document.querySelector('.preview-switch').addEventListener('click', event => {
  const tab = event.target.closest('[data-preview]');
  if (tab) switchPreview(tab.dataset.preview, pointerAction(event));
});
new ResizeObserver(() => { placePreviewIndicator(); previewOffset = undefined; }).observe(document.querySelector('.preview-switch'));
document.fonts.ready.then(() => placePreviewIndicator());

const layer = document.getElementById('dialog-layer');
const dialog = document.getElementById('dialog');
const body = document.getElementById('dialog-body');
function openDialog(title, content, trigger) {
  dialogTrigger = trigger || document.activeElement;
  document.getElementById('dialog-title').textContent = title;
  body.replaceChildren(); body.innerHTML = content;
  layer.hidden = false;
  document.querySelector('.workspace').inert = true;
  document.querySelector('.styles').inert = true;
  document.querySelector('.header').inert = true;
  document.querySelector('.footer').inert = true;
  if (canAnimate()) gsap.fromTo(dialog, { y: 8, opacity: 0, scale: .97 }, { y: 0, opacity: 1, scale: 1, duration: .22, ease: 'power3.out', overwrite: 'auto' });
  else if (window.gsap) gsap.set(dialog, { y: 0, opacity: 1, scale: 1 });
  dialog.focus();
}
function closeDialog() {
  layer.hidden = true;
  document.querySelectorAll('.workspace, .styles, .header, .footer').forEach(element => { element.inert = false; });
  if (dialogTrigger && dialogTrigger.isConnected) dialogTrigger.focus();
}
document.getElementById('close-dialog').addEventListener('click', closeDialog);
document.getElementById('scrim').addEventListener('click', closeDialog);

function openHistory() {
  const entries = state.history.map((entry, i) => ({ ...entry, index: i })).reverse();
  openDialog('最近的配色', `<div class="history-list">${entries.map(entry => `<button class="history-item" data-history="${entry.index}" aria-current="${entry.index === state.position}"><span class="history-item-label"><span>${templates[entry.template].name}</span><small>${entry.time} · ${entry.title}</small></span><span class="history-colors" aria-hidden="true">${entry.colors.map(c => `<b style="background:${c}"></b>`).join('')}</span><i class="ti ${entry.index === state.position ? 'ti-check' : 'ti-arrow-up-right'}" aria-hidden="true"></i></button>`).join('')}</div>`, document.getElementById('history-button'));
  body.querySelectorAll('[data-history]').forEach(button => button.addEventListener('click', () => {
    restoreHistory(Number(button.dataset.history), false); closeDialog();
  }));
}
document.getElementById('history-button').addEventListener('click', openHistory);

function openEditor(index, trigger) {
  openDialog(`编辑${roles[index]}`, `<form id="color-form" novalidate><div class="editor-preview" style="background:${state.colors[index]}" aria-hidden="true"></div><label class="editor-label" for="hex-input">HEX 色值</label><input class="editor-input" id="hex-input" value="${state.colors[index]}" maxlength="7" autocomplete="off" spellcheck="false" aria-describedby="editor-error"><div class="editor-error" id="editor-error" role="alert"></div><button class="editor-submit" type="submit">应用颜色</button></form>`, trigger);
  const input = document.getElementById('hex-input');
  input.focus(); input.select();
  input.addEventListener('input', () => {
    const value = input.value.trim();
    if (/^#?[\da-f]{6}$/i.test(value)) body.querySelector('.editor-preview').style.background = value.startsWith('#') ? value : '#' + value;
    input.removeAttribute('aria-invalid'); document.getElementById('editor-error').textContent = '';
  });
  document.getElementById('color-form').addEventListener('submit', event => {
    event.preventDefault();
    let value = input.value.trim();
    if (!/^#?[\da-f]{6}$/i.test(value)) {
      document.getElementById('editor-error').textContent = '请输入 6 位十六进制色值，如 #B6A6B3';
      input.setAttribute('aria-invalid', 'true'); input.focus(); return;
    }
    value = (value.startsWith('#') ? value : '#' + value).toUpperCase();
    if (value !== state.colors[index]) {
      state.colors[index] = value;
      const [h, s, l] = hexToHsl(value);
      state.base[index] = hslToHex(h, clamp(s / (.45 + state.concentration * .011), 0, 100), l);
      saveHistory(); render();
    }
    closeDialog(); toast(`已应用 ${value}`);
  });
}

function download(content, type, extension) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement('a');
  link.href = url; link.download = `hue-${templates[state.template].id}-${Date.now()}.${extension}`;
  canvas.appendChild(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  toast(`${extension.toUpperCase()} 文件已导出`);
}
function exportFile(format) {
  const title = templates[state.template].name;
  if (format === 'css') {
    download(`:root {\n${state.colors.map((color, i) => `  --color-${['background', 'primary', 'secondary', 'accent', 'ink'][i]}: ${color};`).join('\n')}\n}\n`, 'text/css;charset=utf-8', 'css');
  } else if (format === 'json') {
    download(JSON.stringify({ name: title, colors: state.colors.map((hex, i) => ({ role: roles[i], hex })) }, null, 2), 'application/json;charset=utf-8', 'json');
  } else {
    const cells = state.colors.map((c, i) => `<rect x="${i * 200}" y="80" width="200" height="310" fill="${c}"/><text x="${i * 200 + 100}" y="352" fill="${foreground(c)}" text-anchor="middle" font-size="22" font-family="Arial,sans-serif">${c}</text>`).join('');
    download(`<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="450" viewBox="0 0 1000 450"><rect width="1000" height="450" fill="#FDFDFD"/><text x="32" y="49" fill="#303035" font-size="26" font-family="Arial,sans-serif">hue. ${title}</text>${cells}<text x="32" y="427" fill="#727177" font-size="16" font-family="Arial,sans-serif">五色之间，自成一派。</text></svg>`, 'image/svg+xml;charset=utf-8', 'svg');
  }
}
document.getElementById('export-button').addEventListener('click', event => {
  openDialog('把灵感带走', `<div class="export-colors" aria-hidden="true">${state.colors.map(c => `<b style="background:${c}"></b>`).join('')}</div><div class="export-options"><button class="export-option" data-export="svg"><i class="ti ti-photo" aria-hidden="true"></i><span>色卡 SVG<small>矢量色卡，可直接放进设计稿</small></span><i class="ti ti-download" aria-hidden="true"></i></button><button class="export-option" data-export="css"><i class="ti ti-code" aria-hidden="true"></i><span>CSS 变量<small>五种角色，直接应用到网页</small></span><i class="ti ti-download" aria-hidden="true"></i></button><button class="export-option" data-export="json"><i class="ti ti-braces" aria-hidden="true"></i><span>JSON 配色<small>完整色值与角色信息</small></span><i class="ti ti-download" aria-hidden="true"></i></button></div>`, event.currentTarget);
  body.querySelectorAll('[data-export]').forEach(button => button.addEventListener('click', () => exportFile(button.dataset.export)));
});

document.addEventListener('keydown', event => {
  if (!layer.hidden) {
    if (event.key === 'Escape') { event.preventDefault(); closeDialog(); }
    if (event.key === 'Tab') {
      const focusable = [...dialog.querySelectorAll('button, input, a[href], [tabindex="0"]')].filter(element => !element.disabled);
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog)) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
    return;
  }
  if (event.target.closest('input, textarea, button, a, [contenteditable="true"]')) return;
  if (event.code === 'Space') { event.preventDefault(); if (!event.repeat) generatePalette(false); }
  if (event.key === 'ArrowLeft') { event.preventDefault(); restoreHistory(state.position - 1, false); }
  if (event.key === 'ArrowRight') { event.preventDefault(); restoreHistory(state.position + 1, false); }
});

if (window.gsap) {
  const sculpture = document.getElementById('sculpture');
  const rotateX = gsap.quickTo(sculpture, 'rotationX', { duration: .5, ease: 'power3.out' });
  const rotateY = gsap.quickTo(sculpture, 'rotationY', { duration: .5, ease: 'power3.out' });
  document.getElementById('preview-frame').addEventListener('pointermove', event => {
    if (!finePointer.matches || motionPreference.matches || state.preview !== 'sculpture') return;
    previewOffset ||= event.currentTarget.getBoundingClientRect();
    rotateY(clamp(((event.clientX - previewOffset.left) / previewOffset.width - .5) * 12, -6, 6));
    rotateX(clamp(-((event.clientY - previewOffset.top) / previewOffset.height - .5) * 8, -4, 4));
  });
  document.getElementById('preview-frame').addEventListener('pointerleave', () => { rotateX(0); rotateY(0); previewOffset = undefined; });
  document.querySelector('.workspace').addEventListener('scroll', () => { previewOffset = undefined; }, { passive: true });
  motionPreference.addEventListener('change', () => {
    if (motionPreference.matches) {
      if (paletteMotion) paletteMotion.kill();
      gsap.set([...swatchElements, ...document.querySelectorAll('.sculpture-piece')], { x: 0, y: 0, rotationY: 0 });
      rotateX(0); rotateY(0);
    }
  });
}

saveHistory(); render(); placePreviewIndicator();
if (canAnimate()) {
  gsap.timeline({ defaults: { ease: 'power3.out' } })
    .from('.brand-symbol b', { y: -6, opacity: 0, duration: .28, stagger: .03 }, 0)
    .from('.swatch', { y: 14, rotationY: -10, opacity: 0, duration: .4, stagger: .04 }, 0)
    .from('.sculpture-piece', { y: 12, opacity: 0, duration: .35, stagger: .035 }, .1);
}
