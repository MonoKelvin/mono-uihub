(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const defaults = {
    name: '松风入怀', paper: 'xuan', paperColor: '#f3eddf', pattern: 'plain',
    wood: 'bamboo', smallWood: 'bamboo', ribCount: 16, size: 9, head: 'round', pin: 'brass',
    handle: 'plain', crease: 0.35, edge: true, edgeColor: '#b5a07c',
    text: '清风徐来', font: 'cursive', inkColor: '#373831', textSize: 1,
    textLayout: 'arc', seal: 'square', sealText: '听风', sealFont: 'seal', sealStyle: 'yin',
    pendant: 'red', cordLength: 1
  };
  const presets = [
    { config: { ...defaults } },
    { config: { ...defaults, name: '竹影清音', pattern: 'bamboo', paperColor: '#eee7d8', wood: 'sandal', text: '竹影清风', font: 'running', textLayout: 'vertical', pendant: 'jade', sealText: '清音' } },
    { config: { ...defaults, name: '丹鹤朝阳', pattern: 'crane', paper: 'gold', paperColor: '#e8d8b8', wood: 'rosewood', smallWood: 'rosewood', text: '云鹤长春', font: 'running', textLayout: 'vertical', sealText: '长春', edgeColor: '#a3543d', pendant: 'red', ribCount: 18 } },
    { config: { ...defaults, name: '沧海明月', pattern: 'wave', paper: 'silk', paperColor: '#dce2df', wood: 'ebony', smallWood: 'ebony', text: '海上明月', font: 'brush', inkColor: '#354954', pin: 'silver', edgeColor: '#829492', pendant: 'ink', seal: 'round' } }
  ];
  const choices = {
    paper: [['xuan', '宣纸'], ['silk', '绢布'], ['gold', '洒金']],
    pattern: [['landscape', '山水'], ['bamboo', '竹影'], ['crane', '丹鹤'], ['wave', '海纹'], ['plain', '留白']],
    wood: [['bamboo', '原竹'], ['ebony', '乌木'], ['rosewood', '红木'], ['sandal', '檀木']],
    smallWood: [['bamboo', '原竹'], ['ebony', '乌木'], ['rosewood', '红木'], ['sandal', '檀木']],
    ribCount: [[12, '12'], [16, '16'], [18, '18'], [24, '24']],
    size: [[8, '8 寸'], [9, '9 寸'], [10, '10 寸'], [11, '11 寸']],
    head: [['round', '圆头'], ['square', '方头'], ['gourd', '葫芦头']],
    pin: [['brass', '黄铜'], ['silver', '白银'], ['agate', '红玛瑙']],
    handle: [['plain', '素柄'], ['carved', '竹节刻纹']],
    font: [['cursive', '毛草'], ['running', '行书'], ['brush', '古草']],
    textLayout: [['arc', '横题'], ['vertical', '竖题']],
    sealFont: [['seal', '篆书'], ['running', '行书']],
    sealStyle: [['yin', '白文'], ['yang', '朱文']],
    seal: [['square', '方印'], ['round', '圆印'], ['none', '无印']],
    pendant: [['none', '无坠'], ['red', '朱红流苏'], ['ink', '墨色流苏'], ['jade', '平安玉扣']]
  };
  const woodColors = { bamboo: '#bc9560', ebony: '#38352f', rosewood: '#7c3e2e', sandal: '#d0b58a' };
  const labels = (key, value) => choices[key]?.find(([id]) => String(id) === String(value))?.[1] || String(value);
  const clone = (value) => ({ ...value });
  let config = clone(defaults), activeTab = 'ink', undo = [], redo = [], pendingEdit = null;
  const collection = [];
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const view = { yaw: -0.18, pitch: -0.1, zoom: 1, open: motion.matches ? 1 : 0.16, explode: 0 };
  const target = { ...view, open: 1 };
  const velocities = { yaw: 0, pitch: 0, zoom: 0, open: 0, explode: 0 };
  let renderer, frame = 0, lastTime = 0, toastTimer, opener, dialogSubmit = null, exportStyle = 'paper', exportRequest = 0;
  let drag = null, panelAnimation = null, typographyRequest = 0, fontWarningShown = false;
  const fontDefinitions = loadFontDefinitions();

  async function loadFontDefinitions() {
    await Promise.all([['running', 72], ['brush', 107], ['seal', 236]].map(async ([key, id]) => {
      try {
        const response = await fetch(`https://fontsapi-storagedriver.zeoseven.com/${id}/main/result.css`);
        if (!response.ok) throw new Error('字体样式不可用');
        const css = await response.text();
        const match = css.match(/font-family\s*:\s*["']([^"']+)["']/i);
        if (!match) throw new Error('字体字族未声明');
        const family = match[1];
        window.FanRenderer.fontFamilies[key] = family;
        document.documentElement.style.setProperty(`--${key}`, `${JSON.stringify(family)}, 'KaiTi', cursive`);
      } catch (error) {
        if (!fontWarningShown) { fontWarningShown = true; notify('部分书法字体未能加载，请检查网络。', true); }
        console.warn(error);
      }
    }));
  }
  async function refreshTypography() {
    const request = ++typographyRequest;
    await fontDefinitions;
    try {
      const works = [config, ...presets.map(preset => preset.config)];
      await Promise.all(works.flatMap(work => [[work.font, work.text || '清风'], [work.sealFont, work.sealText || '听风']]).map(([key, text]) => {
        const family = window.FanRenderer.fontFamilies[key];
        return family ? document.fonts.load(`128px ${JSON.stringify(family)}`, text) : Promise.resolve();
      }));
      if (request !== typographyRequest) return;
      renderer?.setConfig(config); requestRender(); updateUI();
      document.querySelectorAll('[data-preset]').forEach(button => drawMini(button.querySelector('canvas'), presets[Number(button.dataset.preset)].config));
    } catch (error) {
      if (!fontWarningShown) { fontWarningShown = true; notify('书法字体加载失败，请检查网络。', true); }
      console.warn(error);
    }
  }

  function optionRow(key, label = key) {
    const list = choices[key];
    return `<div class="option-row ${list.length === 2 ? 'two' : list.length === 4 ? 'four' : ''}" role="group" aria-label="${label}">${list.map(([value, name]) => `<button class="choice" data-key="${key}" data-value="${value}" aria-pressed="false">${name}</button>`).join('')}</div>`;
  }
  function group(title, body, readout = '') {
    return `<section class="control-group"><div class="control-label"><span>${title}</span>${readout ? `<output data-readout="${readout}"></output>` : ''}</div>${body}</section>`;
  }
  function swatches(key, colors) {
    return `<div class="swatch-row" role="group" aria-label="颜色">${colors.map(([hex, label]) => `<button class="swatch" style="--swatch:${hex}" data-key="${key}" data-value="${hex}" aria-pressed="false" aria-label="${label}" title="${label}"></button>`).join('')}</div>`;
  }
  function range(key, min, max, step, label) {
    return `<input type="range" data-key="${key}" min="${min}" max="${max}" step="${step}" aria-label="${label}">`;
  }
  function details(label, content) {
    return `<details class="fine-settings"><summary>${label}<i class="ti ti-plus" aria-hidden="true"></i></summary>${content}</details>`;
  }
  function renderPanel(animate = false) {
    const panel = $('custom-panel');
    if (activeTab === 'paper') {
      panel.innerHTML = group('材质', optionRow('paper', '扇面材质'))
        + group('纸色', swatches('paperColor', [['#f3eddf', '玉版白'], ['#e8d8b8', '古宣黄'], ['#ead7cf', '藕荷粉'], ['#dce2df', '月白'], ['#dcd8c7', '竹青']]))
        + group('纹样', `<div class="pattern-options" role="group" aria-label="扇面图案">${choices.pattern.map(([value, label]) => `<button class="pattern-choice ${value === 'plain' ? 'plain' : ''}" data-key="pattern" data-value="${value}" aria-pressed="false">${value !== 'plain' ? `<canvas data-pattern="${value}" aria-hidden="true"></canvas>` : ''}<span>${label}</span></button>`).join('')}</div>`)
        + group('尺寸', optionRow('size', '折扇尺寸'))
        + details('细节', group('折痕', range('crease', 0, 1, 0.05, '折痕深浅'), 'crease')
          + `<div class="switch-line"><span>包边</span><button class="switch" role="switch" aria-label="细绢包边" aria-checked="false" data-switch="edge"></button></div>`
          + group('边色', swatches('edgeColor', [['#b5a07c', '香槟金'], ['#a3543d', '朱砂'], ['#829492', '灰青'], ['#514a3b', '墨褐']])));
    } else if (activeTab === 'bones') {
      panel.innerHTML = group('大骨', `<div class="option-row two" role="group" aria-label="大骨材质">${choices.wood.map(([value, label]) => `<button class="choice wood-choice" data-key="wood" data-value="${value}" aria-pressed="false"><span class="wood-sample" style="--wood:${woodColors[value]}"></span>${label}</button>`).join('')}</div>`)
        + group('小骨', optionRow('smallWood', '小骨材质'))
        + group('档数', optionRow('ribCount', '扇骨档数'))
        + group('扇头', optionRow('head', '扇头形制'))
        + group('扇柄', optionRow('handle', '扇柄工艺'));
    } else if (activeTab === 'ink') {
      panel.innerHTML = group('题字', '<input class="text-input" id="inscription-input" data-key="text" maxlength="8" aria-label="扇面题字" placeholder="最多八字">')
        + group('书体', `<div class="font-options" role="group" aria-label="书法字体">${choices.font.map(([value, label]) => `<button class="font-choice" data-key="font" data-value="${value}" aria-pressed="false"><span class="font-example">风</span><span class="font-name">${label}</span></button>`).join('')}</div>`)
        + group('排布', optionRow('textLayout', '题字排布'))
        + group('墨色', swatches('inkColor', [['#373831', '焦墨'], ['#354954', '青墨'], ['#a33f32', '朱砂'], ['#7c6743', '赭石']]))
        + group('字号', range('textSize', 0.7, 1.3, 0.05, '题字大小'), 'textSize')
        + group('印章', `<div class="seal-editor"><canvas class="seal-preview" id="seal-preview" role="img" aria-label="印章预览"></canvas><div class="seal-options">${optionRow('seal', '印章形制')}${optionRow('sealStyle', '朱文白文')}</div></div><input class="text-input" id="seal-input" data-key="sealText" maxlength="4" aria-label="印文，最多四字" placeholder="印文">`)
        + details('印字', optionRow('sealFont', '印章字形'));
    } else {
      panel.innerHTML = group('扇钉', optionRow('pin', '扇钉材质'))
        + group('吊坠', `<div class="option-row two" role="group" aria-label="吊坠">${choices.pendant.map(([value, label]) => `<button class="choice pendant-choice" data-key="pendant" data-value="${value}" aria-pressed="false"><span class="pendant-sample ${value}" style="--pendant:${value === 'red' ? '#a33f32' : '#454b45'}"></span>${label}</button>`).join('')}</div>`)
        + group('绳长', range('cordLength', 0.6, 1.4, 0.05, '挂绳长度'), 'cordLength');
    }
    panel.scrollTop = 0;
    updateUI();
    panel.querySelectorAll('[data-pattern]').forEach(canvas => drawMini(canvas, { ...config, pattern: canvas.dataset.pattern, text: '', seal: 'none' }));
    if (panelAnimation) panelAnimation.cancel();
    if (animate && !motion.matches) panelAnimation = panel.animate([{ opacity: 0, transform: 'translateY(5px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 180, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' });
  }

  function drawMini(canvas, state) {
    if (!window.FanRenderer) return;
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(80, Math.round(rect.width || 140)), height = Math.max(40, Math.round(rect.height || 82));
    canvas.width = width * 2; canvas.height = height * 2;
    const ctx = canvas.getContext('2d');
    ctx.scale(2, 2); ctx.clearRect(0, 0, width, height);
    const radius = Math.min(width * 0.49, height * 0.90), inner = radius * 0.385;
    ctx.translate(width / 2, height * 0.94);
    const start = -Math.PI / 2 - Math.PI * 145 / 360, end = -Math.PI / 2 + Math.PI * 145 / 360;
    const texture = window.FanRenderer.artwork(state);
    ctx.save(); ctx.beginPath(); ctx.arc(0, 0, radius, start, end); ctx.arc(0, 0, inner, end, start, true); ctx.closePath(); ctx.clip();
    ctx.drawImage(texture, -radius * 1.015, -radius * 1.026, radius * 2.03, radius * 0.896);
    for (let i = 0; i < state.ribCount - 1; i++) {
      const a = start + (end - start) * i / (state.ribCount - 1), b = start + (end - start) * (i + 1) / (state.ribCount - 1);
      const shine = ctx.createLinearGradient(Math.cos(a) * radius, 0, Math.cos(b) * radius, 0);
      shine.addColorStop(0, '#fff0'); shine.addColorStop(0.5, '#6b4e2520'); shine.addColorStop(1, '#fff3');
      ctx.fillStyle = shine; ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, radius, a, b); ctx.closePath(); ctx.fill();
    }
    ctx.restore();
    for (let i = 0; i < state.ribCount; i++) {
      const a = start + (end - start) * i / (state.ribCount - 1), big = i === 0 || i === state.ribCount - 1;
      ctx.strokeStyle = woodColors[big ? state.wood : state.smallWood]; ctx.lineWidth = big ? 2.2 : 0.85;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * (big ? radius : inner), Math.sin(a) * (big ? radius : inner)); ctx.stroke();
    }
    if (state.edge) { ctx.strokeStyle = state.edgeColor; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.arc(0, 0, radius, start, end); ctx.stroke(); }
    ctx.fillStyle = '#b48b4b'; ctx.beginPath(); ctx.arc(0, 0, 2, 0, Math.PI * 2); ctx.fill();
  }

  function updateUI() {
    const brand = $('brand-seal-preview');
    const mark = window.FanRenderer.sealArtwork({ seal: 'square', sealStyle: 'yin', sealText: '听风', sealFont: 'seal' });
    brand.width = mark.width; brand.height = mark.height;
    brand.getContext('2d').drawImage(mark, 0, 0);
    $('design-name').textContent = config.name;
    $('design-summary').textContent = `${config.size} 寸 · ${config.ribCount} 档`;
    $('undo-button').disabled = undo.length === 0 && !pendingEdit;
    $('redo-button').disabled = redo.length === 0;
    document.querySelectorAll('.preset').forEach((el, i) => {
      const selected = JSON.stringify(config) === JSON.stringify(presets[i].config);
      el.classList.toggle('active', selected); el.setAttribute('aria-pressed', String(selected));
    });
    $('custom-panel').querySelectorAll('button[data-key]').forEach(button => {
      const selected = String(config[button.dataset.key]) === button.dataset.value;
      button.classList.toggle('active', selected); button.setAttribute('aria-pressed', String(selected));
      if (button.dataset.key === 'edgeColor') button.disabled = !config.edge;
      if (button.dataset.key === 'sealFont' || button.dataset.key === 'sealStyle') button.disabled = config.seal === 'none';
    });
    $('custom-panel').querySelectorAll('[data-readout]').forEach(el => { el.textContent = `${Math.round(config[el.dataset.readout] * 100)}%`; });
    if ($('inscription-input')) $('inscription-input').style.fontFamily = `var(--${config.font})`;
    if ($('seal-preview')) {
      const canvas = $('seal-preview'), artwork = window.FanRenderer.sealArtwork(config);
      canvas.width = artwork.width; canvas.height = artwork.height;
      canvas.getContext('2d').drawImage(artwork, 0, 0);
      canvas.setAttribute('aria-label', config.seal === 'none' ? '未启用印章' : `${config.sealText}，${labels('seal', config.seal)}，${labels('sealStyle', config.sealStyle)}`);
    }
    $('custom-panel').querySelectorAll('input[data-key]').forEach(input => {
      if (document.activeElement !== input) input.value = config[input.dataset.key];
      if (input.type === 'range') setRangeFill(input);
      input.disabled = input.dataset.key === 'sealText' ? config.seal === 'none' : input.dataset.key === 'cordLength' ? config.pendant === 'none' : false;
    });
    $('custom-panel').querySelectorAll('[data-switch]').forEach(el => el.setAttribute('aria-checked', String(config[el.dataset.switch])));
    $('collection-count').hidden = collection.length === 0; $('collection-count').textContent = collection.length;
  }
  function setRangeFill(input) {
    input.style.setProperty('--progress', `${(Number(input.value) - Number(input.min)) / (Number(input.max) - Number(input.min)) * 100}%`);
  }
  function commitPending() {
    if (pendingEdit && JSON.stringify(pendingEdit) !== JSON.stringify(config)) { undo.push(pendingEdit); redo = []; }
    pendingEdit = null;
  }
  function apply(patch, record = true) {
    if (record) commitPending();
    const next = { ...config, ...patch };
    if (JSON.stringify(next) === JSON.stringify(config)) return;
    if (record) { undo.push(clone(config)); redo = []; }
    config = next;
    renderer?.setConfig(config); requestRender(); updateUI();
    if (Object.hasOwn(patch, 'paper') || Object.hasOwn(patch, 'paperColor')) {
      $('custom-panel').querySelectorAll('[data-pattern]').forEach(canvas => drawMini(canvas, { ...config, pattern: canvas.dataset.pattern, text: '', seal: 'none' }));
    }
    refreshTypography();
  }
  function notify(message, error = false) {
    clearTimeout(toastTimer);
    $('toast').querySelector('span').textContent = message;
    $('toast').querySelector('i').className = error ? 'ti ti-alert-circle' : 'ti ti-check';
    $('toast').classList.add('visible');
    toastTimer = setTimeout(() => $('toast').classList.remove('visible'), 2800);
  }

  function requestRender() {
    if (!frame && !document.hidden && renderer) frame = requestAnimationFrame(tick);
  }
  function tick(time) {
    frame = 0;
    const dt = Math.min((time - (lastTime || time - 16)) / 1000, 0.025); lastTime = time;
    let moving = false;
    for (const key of Object.keys(view)) {
      if (motion.matches) { view[key] = target[key]; velocities[key] = 0; continue; }
      const delta = target[key] - view[key];
      if (Math.abs(delta) < 0.0001 && Math.abs(velocities[key]) < 0.002) { view[key] = target[key]; velocities[key] = 0; continue; }
      const stiffness = key === 'open' || key === 'explode' ? 100 : 180;
      const damping = key === 'open' || key === 'explode' ? 20 : 26;
      velocities[key] += (delta * stiffness - velocities[key] * damping) * dt;
      view[key] += velocities[key] * dt; moving = true;
    }
    try { renderer.setView(view); renderer.render(); } catch (error) { showRenderError(error); return; }
    $('fan-shadow').style.opacity = String(1 - view.explode * 0.65);
    $('fan-shadow').style.transform = `rotate(${-6 + Math.sin(view.yaw) * 8}deg) scaleX(${0.55 + Math.abs(Math.cos(view.yaw)) * 0.45})`;
    if (moving) requestRender(); else lastTime = 0;
  }
  function changeView(patch, snap = false) {
    Object.assign(target, patch);
    target.zoom = Math.max(0.65, Math.min(1.6, target.zoom));
    target.pitch = Math.max(-1.15, Math.min(1.15, target.pitch));
    target.open = Math.max(0.06, Math.min(1, target.open));
    if (snap) { Object.assign(view, target); Object.keys(velocities).forEach(key => { velocities[key] = 0; }); }
    $('opening-range').value = Math.round(target.open * 100); setRangeFill($('opening-range'));
    $('opening-value').textContent = `${Math.round(145 * target.open)}°`;
    $('fold-button').querySelector('span').textContent = target.open > 0.3 ? '收扇' : '展扇';
    $('fold-button').setAttribute('aria-label', target.open > 0.3 ? '收起折扇' : '展开折扇');
    $('explode-button').classList.toggle('active', target.explode > 0.5);
    $('explode-button').setAttribute('aria-pressed', String(target.explode > 0.5));
    const facing = Math.cos(target.yaw) >= 0 ? 'front' : 'back';
    document.querySelectorAll('[data-view]').forEach(button => { button.classList.toggle('active', button.dataset.view === facing); button.setAttribute('aria-pressed', String(button.dataset.view === facing)); });
    requestRender();
  }
  function initRenderer() {
    try {
      renderer?.destroy(); renderer = new window.FanRenderer($('fan-canvas')); renderer.setConfig(config);
      $('render-error').hidden = true; $('export-button').disabled = false;
      changeView({}, motion.matches);
      if (!renderer.supported) notify('当前设备使用平面预览。');
    } catch (error) { showRenderError(error); }
  }
  function showRenderError(error) {
    $('render-error').hidden = false; $('export-button').disabled = true;
    console.error(error);
  }

  function openDialog(title, body, footer = '', compact = false) {
    commitPending(); opener = document.activeElement;
    $('dialog-title').textContent = title; $('dialog-body').innerHTML = body; $('dialog-footer').innerHTML = footer;
    $('dialog-layer').querySelector('.dialog').classList.toggle('compact', compact);
    $('dialog-layer').inert = false; $('dialog-layer').setAttribute('aria-hidden', 'false'); $('dialog-layer').classList.add('open');
    document.querySelectorAll('.topbar, .workspace').forEach(el => { el.inert = true; });
    $('dialog-body').scrollTop = 0;
    const focus = $('dialog-body').querySelector('input, button') || $('dialog-close'); focus.focus();
  }
  function closeDialog() {
    exportRequest += 1;
    $('dialog-layer').classList.remove('open');
    document.querySelectorAll('.topbar, .workspace').forEach(el => { el.inert = false; });
    opener?.focus(); $('dialog-layer').inert = true; $('dialog-layer').setAttribute('aria-hidden', 'true'); dialogSubmit = null;
  }
  function download(blob, filename) {
    const url = URL.createObjectURL(blob), a = document.createElement('a');
    a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function filename(name) { return name.replace(/[<>:"/\\|?*\x00-\x1f]/g, '-').slice(0, 24) || '听风折扇'; }
  function saveDesign() {
    commitPending();
    const snapshot = clone(config);
    download(new Blob([JSON.stringify({ format: 'tingfeng-fan-v1', config: snapshot }, null, 2)], { type: 'application/json' }), `${filename(config.name)}.json`);
    if (!collection.some(item => JSON.stringify(item) === JSON.stringify(snapshot))) collection.unshift(snapshot);
    updateUI(); notify('方案已导出。');
  }
  function showCollection() {
    openDialog('藏扇', collection.length ? '<div class="collection-grid" id="collection-grid"></div>' : '<div class="empty-collection"><i class="ti ti-folder" aria-hidden="true"></i><h3>暂无藏扇</h3></div>', '<button class="button quiet" id="collection-import">导入</button><button class="button primary" id="collection-return">返回</button>');
    const grid = $('collection-grid');
    if (grid) collection.forEach(item => {
      const button = document.createElement('button'); button.className = 'collection-card';
      const canvas = document.createElement('canvas'), strong = document.createElement('strong'), small = document.createElement('small');
      canvas.setAttribute('aria-hidden', 'true'); strong.textContent = item.name; small.textContent = `${labels('size', item.size)} · ${labels('wood', item.wood)}`;
      button.append(canvas, strong, small); grid.append(button); drawMini(canvas, item);
      button.addEventListener('click', () => { apply(item); renderPanel(); closeDialog(); });
    });
    $('collection-import').onclick = () => { closeDialog(); $('import-input').click(); };
    $('collection-return').onclick = closeDialog;
  }
  function showSpecs() {
    const row = (title, value) => { const el = document.createElement('div'); el.className = 'spec-row'; const dt = document.createElement('dt'), dd = document.createElement('dd'); dt.textContent = title; dd.textContent = value; el.append(dt, dd); return el; };
    openDialog('定制清单', '<p class="dialog-note" id="spec-caption"></p><dl class="spec-grid" id="spec-grid"></dl>', '<button class="button quiet" id="spec-return">关闭</button><button class="button primary" id="spec-save">下载方案</button>');
    $('spec-caption').textContent = `${config.name} · ${labels('size', config.size)}，约 ${Number(config.size * 3.33).toFixed(1)} 厘米。`;
    const specs = [['扇面', labels('paper', config.paper)], ['图案', labels('pattern', config.pattern)], ['大骨', labels('wood', config.wood)], ['小骨', labels('smallWood', config.smallWood)], ['档数', labels('ribCount', config.ribCount)], ['扇头', labels('head', config.head)], ['扇柄', labels('handle', config.handle)], ['扇钉', labels('pin', config.pin)], ['折痕', `${Math.round(config.crease * 100)}%`], ['包边', config.edge ? '细绢包边' : '无包边'], ['题字', config.text || '留白'], ['书体', labels('font', config.font)], ['印章', config.seal === 'none' ? '无印' : `${labels('seal', config.seal)} · ${config.sealText || '无印文'}`], ['吊坠', labels('pendant', config.pendant)]];
    specs.forEach(([title, value]) => $('spec-grid').append(row(title, value)));
    $('spec-return').onclick = closeDialog; $('spec-save').onclick = saveDesign;
  }
  function showExport() {
    exportStyle = 'paper';
    openDialog('导出', '<div class="export-options"><button class="export-choice active" data-export="paper" aria-pressed="true"><span class="export-sample"><canvas aria-hidden="true"></canvas></span><strong>清纸</strong><small>PNG · 1600 × 1200</small></button><button class="export-choice" data-export="transparent" aria-pressed="false"><span class="export-sample transparent"><canvas aria-hidden="true"></canvas></span><strong>透明</strong><small>PNG · 透明背景</small></button></div>', '<button class="button quiet" id="export-cancel">取消</button><button class="button primary" id="export-confirm">导出 PNG<i class="ti ti-download" aria-hidden="true"></i></button>');
    document.querySelectorAll('[data-export]').forEach(button => {
      drawMini(button.querySelector('canvas'), config);
      button.onclick = () => { exportStyle = button.dataset.export; document.querySelectorAll('[data-export]').forEach(el => { el.classList.toggle('active', el === button); el.setAttribute('aria-pressed', String(el === button)); }); };
    });
    $('export-cancel').onclick = closeDialog;
    $('export-confirm').onclick = async () => {
      const button = $('export-confirm'), state = clone(config), style = exportStyle, captureView = { ...view }, request = ++exportRequest;
      button.disabled = true; button.textContent = '正在导出…';
      try {
        await fontDefinitions;
        await Promise.all([[state.font, state.text], [state.sealFont, state.sealText], ['ui', state.name + '听风']].map(([key, text]) => {
          const family = window.FanRenderer.fontFamilies[key];
          return family ? document.fonts.load(`128px ${JSON.stringify(family)}`, text || '听风') : Promise.resolve();
        }));
        if (request !== exportRequest) return;
        renderer.setConfig(state); renderer.setView(captureView); renderer.render();
        const result = document.createElement('canvas'); result.width = 1600; result.height = 1200;
        const ctx = result.getContext('2d'), source = $('fan-canvas');
        if (style === 'paper') {
          ctx.fillStyle = '#f4f3ef'; ctx.fillRect(0, 0, 1600, 1200);
          ctx.fillStyle = '#302e2b'; ctx.font = '34px "LXGW Neo XiHei", sans-serif'; ctx.fillText(state.name, 90, 110);
          ctx.fillStyle = '#78746e'; ctx.font = '19px "LXGW Neo XiHei", sans-serif'; ctx.fillText(`${state.size} 寸 · ${state.ribCount} 档`, 92, 151);
          ctx.font = '23px "LXGW Neo XiHei", sans-serif'; ctx.fillStyle = '#80503c'; ctx.fillText('听风', 1410, 1110);
        }
        const scale = Math.min(1450 / source.width, (style === 'paper' ? 880 : 1160) / source.height);
        const w = source.width * scale, h = source.height * scale;
        ctx.drawImage(source, (1600 - w) / 2, (1200 - h) / 2 + (style === 'paper' ? 25 : 0), w, h);
        const blob = await new Promise((resolve, reject) => result.toBlob(value => value ? resolve(value) : reject(new Error('无法生成图片')), 'image/png'));
        if (request !== exportRequest) return;
        download(blob, `${filename(state.name)}-${style === 'paper' ? '清纸' : '透明'}.png`);
        closeDialog(); notify('作品图片已导出。');
      } catch (error) {
        if (request !== exportRequest) return;
        notify('图片导出失败，请重试。', true); button.disabled = false; button.textContent = '重新导出 PNG'; console.error(error);
      } finally {
        renderer.setConfig(config); renderer.setView(view); requestRender();
      }
    };
  }

  $('preset-list').innerHTML = presets.map((preset, i) => `<button class="preset" data-preset="${i}" aria-pressed="false"><canvas aria-hidden="true"></canvas><span class="preset-name">${preset.config.name}</span></button>`).join('');
  document.querySelectorAll('[data-preset]').forEach(button => {
    drawMini(button.querySelector('canvas'), presets[Number(button.dataset.preset)].config);
    button.onclick = () => { apply(presets[Number(button.dataset.preset)].config); renderPanel(); };
  });
  const tabs = [...document.querySelectorAll('[data-tab]')];
  function selectTab(button, animate) {
    commitPending(); activeTab = button.dataset.tab;
    tabs.forEach(el => { const active = el === button; el.classList.toggle('active', active); el.setAttribute('aria-selected', String(active)); el.tabIndex = active ? 0 : -1; });
    $('tab-indicator').style.transform = `translateX(${tabs.indexOf(button) * 100}%)`;
    $('custom-panel').setAttribute('aria-labelledby', button.id); renderPanel(animate);
  }
  tabs.forEach(button => {
    button.onclick = event => selectTab(button, event.detail !== 0);
    button.onkeydown = event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault(); const i = tabs.indexOf(button);
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (i + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
      tabs[next].focus(); selectTab(tabs[next], false);
    };
  });
  $('custom-panel').addEventListener('click', event => {
    const button = event.target.closest('button'); if (!button || button.disabled) return;
    if (button.dataset.switch) apply({ [button.dataset.switch]: !config[button.dataset.switch] });
    else if (button.dataset.key) { const key = button.dataset.key; apply({ [key]: typeof defaults[key] === 'number' ? Number(button.dataset.value) : button.dataset.value }); }
  });
  $('custom-panel').addEventListener('input', event => {
    const input = event.target, key = input.dataset.key; if (!key || event.isComposing) return;
    if (!pendingEdit) pendingEdit = clone(config);
    let value = input.type === 'range' ? Number(input.value) : input.value;
    if (key === 'text' || key === 'sealText') value = Array.from(value).slice(0, key === 'text' ? 8 : 4).join('');
    apply({ [key]: value }, false);
  });
  $('custom-panel').addEventListener('compositionend', event => event.target.dispatchEvent(new Event('input', { bubbles: true })));
  $('custom-panel').addEventListener('change', () => { commitPending(); updateUI(); });
  $('undo-button').onclick = () => { commitPending(); if (!undo.length) return; redo.push(clone(config)); config = undo.pop(); renderer?.setConfig(config); requestRender(); renderPanel(); };
  $('redo-button').onclick = () => { commitPending(); if (!redo.length) return; undo.push(clone(config)); config = redo.pop(); renderer?.setConfig(config); requestRender(); renderPanel(); };
  $('rename-button').onclick = () => {
    openDialog('重命名', '<label class="control-label" for="name-input">作品名称</label><input class="text-input" id="name-input" maxlength="24"><p class="form-error" id="name-error" role="alert"></p>', '<button class="button quiet" id="name-cancel">取消</button><button class="button primary" id="name-confirm">确认</button>', true);
    $('name-input').value = config.name; $('name-input').select();
    dialogSubmit = () => { const name = $('name-input').value.trim(); if (!name) { $('name-error').textContent = '请为折扇起一个名字。'; $('name-input').focus(); return; } apply({ name: name.slice(0, 24) }); closeDialog(); };
    $('name-confirm').onclick = dialogSubmit; $('name-cancel').onclick = closeDialog;
  };
  $('save-button').onclick = saveDesign; $('export-button').onclick = showExport; $('collection-button').onclick = showCollection;
  $('spec-button').onclick = showSpecs;
  $('reset-design').onclick = () => { apply(defaults); renderPanel(); changeView({ yaw: -0.18, pitch: -0.1, zoom: 1, open: 1, explode: 0 }); notify('已重置，可撤销。'); };
  $('reset-view').onclick = () => changeView({ yaw: -0.18, pitch: -0.1, zoom: 1, explode: 0 });
  document.querySelectorAll('[data-view]').forEach(button => { button.onclick = () => { const base = target.yaw + Math.atan2(Math.sin((button.dataset.view === 'back' ? Math.PI - 0.18 : -0.18) - target.yaw), Math.cos((button.dataset.view === 'back' ? Math.PI - 0.18 : -0.18) - target.yaw)); changeView({ yaw: base, pitch: -0.1 }); }; });
  $('explode-button').onclick = () => changeView({ explode: target.explode > 0.5 ? 0 : 1, open: 1, pitch: -0.35, yaw: -0.6 });
  $('fold-button').onclick = () => changeView({ open: target.open > 0.3 ? 0.06 : 1, explode: 0 });
  $('opening-range').oninput = event => changeView({ open: Number(event.target.value) / 100, explode: 0 });
  $('zoom-in').onclick = () => changeView({ zoom: target.zoom + 0.12 }); $('zoom-out').onclick = () => changeView({ zoom: target.zoom - 0.12 });
  $('fan-canvas').addEventListener('pointerdown', event => {
    if (drag || !event.isPrimary || event.button !== 0) return;
    drag = { id: event.pointerId, x: event.clientX, y: event.clientY, yaw: target.yaw, pitch: target.pitch };
    $('fan-canvas').setPointerCapture(event.pointerId);
  });
  $('fan-canvas').addEventListener('pointermove', event => { if (!drag || drag.id !== event.pointerId) return; changeView({ yaw: drag.yaw + (event.clientX - drag.x) * 0.008, pitch: drag.pitch + (event.clientY - drag.y) * 0.006 }); });
  const endDrag = event => { if (drag && drag.id === event.pointerId) drag = null; };
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(name => $('fan-canvas').addEventListener(name, endDrag));
  $('fan-canvas').addEventListener('wheel', event => { event.preventDefault(); changeView({ zoom: target.zoom - event.deltaY * 0.001 }); }, { passive: false });
  $('fan-canvas').addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', '+', '=', '-'].includes(event.key)) return;
    event.preventDefault(); const patch = event.key === 'ArrowLeft' ? { yaw: target.yaw - 0.12 } : event.key === 'ArrowRight' ? { yaw: target.yaw + 0.12 } : event.key === 'ArrowUp' ? { pitch: target.pitch - 0.08 } : event.key === 'ArrowDown' ? { pitch: target.pitch + 0.08 } : { zoom: target.zoom + (event.key === '-' ? -0.1 : 0.1) };
    changeView(patch, true);
  });
  $('dialog-close').onclick = closeDialog; $('dialog-scrim').onclick = closeDialog;
  document.addEventListener('keydown', event => {
    if ($('dialog-layer').classList.contains('open')) {
      if (event.key === 'Escape') { event.preventDefault(); closeDialog(); }
      if (event.key === 'Enter' && dialogSubmit && !event.isComposing) { event.preventDefault(); dialogSubmit(); }
      if (event.key === 'Tab') {
        const focusables = [...$('dialog-layer').querySelectorAll('button:not(:disabled), input:not(:disabled), [tabindex="0"]')].filter(el => el.getClientRects().length);
        const first = focusables[0], last = focusables[focusables.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
      return;
    }
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) return;
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') { event.preventDefault(); (event.shiftKey ? $('redo-button') : $('undo-button')).click(); }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') { event.preventDefault(); saveDesign(); }
  });
  $('import-button').onclick = () => $('import-input').click();
  $('import-input').onchange = async event => {
    const file = event.target.files[0]; if (!file) return;
    try {
      if (file.size > 262144) throw new Error('方案文件过大。');
      const data = JSON.parse(await file.text());
      if (data.format !== 'tingfeng-fan-v1' || !data.config || typeof data.config !== 'object' || Array.isArray(data.config)) throw new Error('请选择听风导出的方案文件。');
      const imported = {}, limits = { crease: [0, 1], textSize: [0.7, 1.3], cordLength: [0.6, 1.4] };
      for (const [key, value] of Object.entries(defaults)) {
        const incoming = data.config[key];
        if (choices[key] && !choices[key].some(([id]) => id === incoming)) throw new Error('方案包含不支持的定制选项。');
        if (typeof incoming !== typeof value) throw new Error('方案内容不完整。');
        if (['paperColor', 'edgeColor', 'inkColor'].includes(key) && !/^#[0-9a-f]{6}$/i.test(incoming)) throw new Error('方案中的颜色格式不正确。');
        if (limits[key] && (!Number.isFinite(incoming) || incoming < limits[key][0] || incoming > limits[key][1])) throw new Error('方案中的尺寸参数超出范围。');
        if (['name', 'text', 'sealText'].includes(key) && (Array.from(incoming).length > (key === 'name' ? 24 : key === 'text' ? 8 : 4) || key === 'name' && !incoming.trim())) throw new Error('方案中的文字长度不正确。');
        imported[key] = incoming;
      }
      apply(imported); renderPanel(); notify('方案已载入。');
    } catch (error) { notify(error instanceof SyntaxError ? '文件无法读取，请选择有效的 JSON 方案。' : error.message, true); }
    finally { event.target.value = ''; }
  };
  $('retry-button').onclick = initRenderer;
  $('fan-canvas').addEventListener('webglcontextlost', event => { event.preventDefault(); if (frame) cancelAnimationFrame(frame); frame = 0; showRenderError(new Error('图形上下文暂时中断')); });
  $('fan-canvas').addEventListener('webglcontextrestored', initRenderer);
  const resizeObserver = new ResizeObserver(requestRender); resizeObserver.observe($('render-area'));
  document.addEventListener('visibilitychange', () => { if (document.hidden) { cancelAnimationFrame(frame); frame = 0; lastTime = 0; } else requestRender(); });
  motion.addEventListener('change', () => changeView({}, true));
  document.fonts.ready.then(() => {
    renderer?.setConfig(config); requestRender();
    document.querySelectorAll('[data-preset]').forEach(button => drawMini(button.querySelector('canvas'), presets[Number(button.dataset.preset)].config));
    $('custom-panel').querySelectorAll('[data-pattern]').forEach(canvas => drawMini(canvas, { ...config, pattern: canvas.dataset.pattern, text: '', seal: 'none' }));
  });
  window.addEventListener('pagehide', () => { cancelAnimationFrame(frame); resizeObserver.disconnect(); renderer?.destroy(); clearTimeout(toastTimer); });
  renderPanel(); initRenderer(); refreshTypography();
})();
