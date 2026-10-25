(() => {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const materials = [
    { id: 'porcelain', name: '青花瓷', description: '釉下青花陶瓷珠', category: 'stone', kind: 'porcelain', light: '#f6f9fd', mid: '#e7edf7', dark: '#a0b3cd', price: 7.5, sizes: [6, 8, 10, 12] },
    { id: 'aventurine', name: '绿东陵', description: '天然石英岩玉', category: 'stone', kind: 'jade', light: '#b4c6a4', mid: '#78956f', dark: '#465c43', price: 5.2, sizes: [6, 8, 10, 12] },
    { id: 'agate', name: '白玛瑙', description: '温润半透玉髓', category: 'stone', kind: 'cloud', light: '#f2f0e3', mid: '#dfdfd0', dark: '#b3b8a7', price: 4.6, sizes: [6, 8, 10, 12] },
    { id: 'amazonite', name: '天河石', description: '天然微斜长石', category: 'stone', kind: 'jade', light: '#b2d6cd', mid: '#78aaa0', dark: '#4d7770', price: 6.8, sizes: [6, 8, 10, 12] },
    { id: 'rose-quartz', name: '粉晶', description: '天然蔷薇石英', category: 'stone', kind: 'cloud', light: '#edced1', mid: '#d3a9b3', dark: '#a07b8b', price: 5.8, sizes: [6, 8, 10, 12] },
    { id: 'obsidian', name: '黑曜石', description: '天然火山玻璃', category: 'stone', kind: 'glass', light: '#8a9491', mid: '#424e4a', dark: '#202d28', price: 3.8, sizes: [6, 8, 10, 12] },
    { id: 'amethyst', name: '紫水晶', description: '天然紫色石英', category: 'stone', kind: 'cloud', light: '#c7bbd4', mid: '#9a89af', dark: '#645275', price: 7.2, sizes: [6, 8, 10, 12] },
    { id: 'tiger-eye', name: '虎眼石', description: '天然猫眼光泽', category: 'stone', kind: 'tiger', light: '#d8bf82', mid: '#a58949', dark: '#63502c', price: 4.8, sizes: [6, 8, 10, 12] },
    { id: 'aquamarine', name: '海蓝宝', description: '天然蓝色绿柱石', category: 'stone', kind: 'cloud', light: '#d0e3e4', mid: '#a6c6ca', dark: '#73979e', price: 8.6, sizes: [6, 8, 10, 12] },
    { id: 'sandalwood', name: '檀木', description: '细磨原木珠', category: 'wood', kind: 'wood', light: '#b69a6e', mid: '#8b6b41', dark: '#553e27', price: 3.6, sizes: [6, 8, 10, 12] },
    { id: 'walnut', name: '胡桃木', description: '深色天然木纹', category: 'wood', kind: 'wood', light: '#93806b', mid: '#665241', dark: '#3c3028', price: 4.2, sizes: [6, 8, 10, 12] },
    { id: 'brass', name: '黄铜隔珠', description: '哑光黄铜配饰', category: 'metal', kind: 'metal', light: '#e8dcb2', mid: '#b6a16a', dark: '#7c683c', price: 2.5, sizes: [2, 4, 6] },
    { id: 'silver', name: '银色隔珠', description: '镀银合金配饰', category: 'metal', kind: 'metal', light: '#e3e8e4', mid: '#b4bfba', dark: '#75847c', price: 3.2, sizes: [2, 4, 6] }
  ];
  const byMaterial = new Map(materials.map((material) => [material.id, material]));
  const cords = { ivory: { color: '#dfe6f0', name: '瓷白' }, green: { color: '#77938a', name: '松绿' }, pink: { color: '#cda6a4', name: '浅粉' }, dark: { color: '#4e5554', name: '岩灰' } };
  const presets = {
    porcelain: { name: '素青', description: '青花瓷、白玛瑙与银色隔珠', cord: 'ivory' },
    jade: { name: '翠玉', description: '绿东陵、白玛瑙与黄铜隔珠', cord: 'ivory' },
    rose: { name: '映桃', description: '粉晶、白玛瑙与银色隔珠', cord: 'pink' },
    wood: { name: '见山', description: '檀木、虎眼石与黄铜隔珠', cord: 'dark' }
  };
  const MAX_BEADS = 80;
  let nextId = 1;
  const makeBead = (material, diameter) => ({ id: nextId++, material, diameter });
  function presetBeads(key) {
    const main = key === 'porcelain' ? 'porcelain' : key === 'jade' ? 'aventurine' : key === 'rose' ? 'rose-quartz' : 'sandalwood';
    const accent = key === 'wood' ? 'tiger-eye' : 'agate';
    const metal = key === 'rose' || key === 'porcelain' ? 'silver' : 'brass';
    return Array.from({ length: 24 }, (_, index) => {
      if (index === 10 || index === 13) return makeBead(metal, 4);
      if (index === 11 || index === 12) return makeBead(accent, 10);
      return makeBead(main, 8);
    });
  }
  const initialBeads = presetBeads('porcelain');
  let state = { name: '素青', beads: initialBeads, selected: initialBeads[0].id, wrist: 15.5, ease: 0.5, cord: 'ivory', preset: 'porcelain' };
  let libraryMaterial = 'porcelain';
  let libraryDiameter = 8;
  let category = 'stone';
  let zoom = 1;
  let orientation = -0.12;
  let view = 'flat';
  let ruler = false;
  let undoStack = [];
  let redoStack = [];
  let sliderSnapshot = null;
  let toastTimer;
  let dialogReturnFocus;
  let draggedId = null;
  let hits = [];
  /* 多选：selection 存当前选中的珠子，state.selected 始终是其中的锚点 */
  let selection = [initialBeads[0].id];
  let scene = null;
  let dragBead = null;
  let dragMoved = false;
  let dragOrigin = null;
  let dragSlot = -1;
  const selectionIds = () => selection.filter((id) => state.beads.some((bead) => bead.id === id));
  function syncSelection() {
    selection = selectionIds();
    if (!selection.length) selection = state.selected != null ? [state.selected] : [];
    else if (state.selected == null || !selection.includes(state.selected)) state.selected = selection[selection.length - 1];
  }
  let drawFrame = 0;
  const spriteCache = new Map();
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const canvas = $('bracelet-canvas');
  const ctx = canvas.getContext('2d');
  const theme = getComputedStyle(document.documentElement);
  const colors = Object.fromEntries(['canvas', 'ink', 'ink-secondary', 'ink-muted', 'accent'].map((key) => [key, theme.getPropertyValue(`--${key}`).trim()]));
  const timing = { curve: theme.getPropertyValue('--ease').trim(), fast: parseFloat(theme.getPropertyValue('--motion-fast')), step: parseFloat(theme.getPropertyValue('--motion-step')), canvas: parseFloat(theme.getPropertyValue('--motion-canvas')) };
  const curve = timing.curve.match(/[\d.]+/g).map(Number);
  let sceneMotion = null;
  let selectedPreviewKey = '';
  const canAnimate = () => !motion.matches && document.body.dataset.input !== 'keyboard';
  const beadShadow = document.createElement('canvas');
  beadShadow.width = beadShadow.height = 128;
  const shadowPaint = beadShadow.getContext('2d');
  const shadowGradient = shadowPaint.createRadialGradient(64, 64, 0, 64, 64, 64);
  shadowGradient.addColorStop(0, '#23344d26');
  shadowGradient.addColorStop(0.55, '#23344d14');
  shadowGradient.addColorStop(1, '#23344d00');
  shadowPaint.fillStyle = shadowGradient;
  shadowPaint.fillRect(0, 0, 128, 128);
  const snapshot = () => JSON.parse(JSON.stringify(state));
  const selectedBead = () => state.beads.find((bead) => bead.id === state.selected);
  const selectedIndex = () => state.beads.findIndex((bead) => bead.id === state.selected);
  const priceFor = (bead) => { const material = byMaterial.get(bead.material); return Math.round(material.price * (bead.diameter / (material.category === 'metal' ? 4 : 8)) * 100) / 100; };
  const money = (amount) => amount.toFixed(2);
  const escapeHTML = (text) => String(text).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));

  function animateElement(element, frames, duration = timing.step) {
    if (!canAnimate()) return;
    element.getAnimations().forEach((animation) => animation.cancel());
    element.animate(frames, { duration, easing: timing.curve });
  }

  function beginSceneMotion() {
    sceneMotion = canAnimate() && hits.length ? {
      from: new Map(hits.map((position) => [position.bead.id, { ...position, bead: { ...position.bead } }])),
      shape: { ...hits[0] },
      started: performance.now()
    } : null;
  }

  function easedProgress(progress) {
    const sample = (t, a, b) => 3 * (1 - t) ** 2 * t * a + 3 * (1 - t) * t ** 2 * b + t ** 3;
    let low = 0;
    let high = 1;
    for (let index = 0; index < 16; index++) {
      const middle = (low + high) / 2;
      if (sample(middle, curve[0], curve[2]) < progress) low = middle;
      else high = middle;
    }
    return sample((low + high) / 2, curve[1], curve[3]);
  }

  function beadMarkup(material, extraClass = '') {
    return `<span class="bead ${extraClass}" data-kind="${material.category === 'metal' ? 'metal' : material.kind}" style="--bead-light:${material.light};--bead-mid:${material.mid};--bead-dark:${material.dark}" aria-hidden="true"></span>`;
  }

  function notify(message, error = false) {
    clearTimeout(toastTimer);
    $('toast').querySelector('span').textContent = message;
    $('toast').querySelector('i').className = `ti ${error ? 'ti-alert-circle' : 'ti-check'}`;
    $('toast').hidden = false;
    toastTimer = setTimeout(() => { $('toast').hidden = true; }, 2600);
  }

  function finishSlider() {
    if (!sliderSnapshot) return;
    if (sliderSnapshot.wrist !== state.wrist) {
      undoStack.push(sliderSnapshot);
      if (undoStack.length > 70) undoStack.shift();
      redoStack = [];
      state.preset = null;
      $('edit-status').textContent = '佩戴尺寸已调整';
    }
    sliderSnapshot = null;
    renderHistory();
    renderPresets();
  }

  function commit(mutate, label) {
    finishSlider();
    const previousBeads = JSON.stringify(state.beads);
    undoStack.push(snapshot());
    if (undoStack.length > 70) undoStack.shift();
    redoStack = [];
    mutate();
    if (JSON.stringify(state.beads) !== previousBeads) beginSceneMotion();
    if (!state.beads.some((bead) => bead.id === state.selected)) state.selected = state.beads[0]?.id ?? null;
    $('edit-status').textContent = label;
    render();
  }

  function undo() {
    finishSlider();
    if (!undoStack.length) return;
    const previousBeads = JSON.stringify(state.beads);
    redoStack.push(snapshot());
    state = undoStack.pop();
    selection = state.selected != null ? [state.selected] : [];
    if (JSON.stringify(state.beads) !== previousBeads) beginSceneMotion();
    $('edit-status').textContent = '已撤销';
    render();
  }

  function redo() {
    finishSlider();
    if (!redoStack.length) return;
    const previousBeads = JSON.stringify(state.beads);
    undoStack.push(snapshot());
    state = redoStack.pop();
    selection = state.selected != null ? [state.selected] : [];
    if (JSON.stringify(state.beads) !== previousBeads) beginSceneMotion();
    $('edit-status').textContent = '已重做';
    render();
  }

  function renderHistory() {
    $('undo').disabled = undoStack.length === 0;
    $('redo').disabled = redoStack.length === 0;
  }

  function renderLibrary() {
    const query = $('material-search').value.trim().toLowerCase();
    const visible = materials.filter((material) => (!query ? material.category === category : true) && `${material.name} ${material.description} ${material.id}`.toLowerCase().includes(query));
    $('material-count').textContent = String(visible.length).padStart(2, '0');
    $('material-list').innerHTML = visible.length ? visible.map((material) => `<button class="material-card ${material.id === libraryMaterial ? 'active' : ''}" data-material="${material.id}" aria-pressed="${material.id === libraryMaterial}" aria-label="${material.name}，${material.price.toFixed(1)} 元每颗，${material.category === 'metal' ? 4 : 8} 毫米">${beadMarkup(material)}<i class="ti ti-check" aria-hidden="true"></i><h3>${material.name}</h3><p>¥${material.price.toFixed(1)} / ${material.category === 'metal' ? 4 : 8}mm</p></button>`).join('') : '<div class="material-empty"><i class="ti ti-search" aria-hidden="true"></i>没有找到这颗珠子<br><button id="clear-search">清除搜索</button></div>';
    document.querySelectorAll('[data-category]').forEach((button) => {
      const active = button.dataset.category === category;
      button.classList.toggle('active', active);
      button.setAttribute('aria-selected', String(active));
    });
    renderSizes('library-sizes', byMaterial.get(libraryMaterial).sizes, libraryDiameter);
    $('add-bead').disabled = state.beads.length >= MAX_BEADS;
    $('add-bead').title = state.beads.length >= MAX_BEADS ? '最多可编排 80 颗珠子' : `加入一颗 ${libraryDiameter} mm ${byMaterial.get(libraryMaterial).name}`;
  }

  function renderSizes(id, sizes, activeDiameter) {
    $(id).innerHTML = sizes.map((diameter) => `<button data-diameter="${diameter}" class="${diameter === activeDiameter ? 'active' : ''}" aria-pressed="${diameter === activeDiameter}" aria-label="${diameter} 毫米">${diameter}</button>`).join('');
  }

  function renderSequence() {
    const sequence = $('bead-sequence');
    const previous = new Map([...sequence.querySelectorAll('[data-bead]')].map((button) => [Number(button.dataset.bead), button.getBoundingClientRect()]));
    const count = state.beads.length;
    $('sequence-count').textContent = `${count} 颗`;
    sequence.innerHTML = count ? state.beads.map((bead, index) => {
      const chosen = selection.includes(bead.id);
      return `<button class="sequence-bead ${chosen ? 'active' : ''} ${bead.id === state.selected ? 'anchor' : ''}" data-bead="${bead.id}" draggable="true" aria-pressed="${chosen}" aria-label="第 ${index + 1} 颗，${byMaterial.get(bead.material).name}，${bead.diameter} 毫米">${beadMarkup(byMaterial.get(bead.material))}<span>${String(index + 1).padStart(2, '0')}</span></button>`;
    }).join('') : '<span class="sequence-empty">还没有珠子</span>';
    if (previous.size && canAnimate()) {
      sequence.querySelectorAll('[data-bead]').forEach((button) => {
        const before = previous.get(Number(button.dataset.bead));
        const after = button.getBoundingClientRect();
        if (!before) animateElement(button, [{ opacity: 0, transform: 'scale(.95)' }, { opacity: 1, transform: 'scale(1)' }]);
        else if (Math.abs(before.left - after.left) > 1 || Math.abs(before.top - after.top) > 1) animateElement(button, [{ transform: `translate(${before.left - after.left}px, ${before.top - after.top}px)` }, { transform: 'translate(0, 0)' }]);
      });
    }
    $('reverse-sequence').disabled = count < 2;
    $('empty-design').hidden = count > 0;
    $('export-image').disabled = count === 0;
  }

  function renderSelected() {
    const ids = selectionIds();
    const multi = ids.length > 1;
    const bead = selectedBead();
    $('selected-material').hidden = !bead;
    $('selected-controls').hidden = !bead;
    $('selected-empty').hidden = Boolean(bead);
    $('selected-position').textContent = bead ? (multi ? `已选 ${ids.length}` : `#${String(selectedIndex() + 1).padStart(2, '0')}`) : '';
    if (!bead) { selectedPreviewKey = ''; return; }
    const material = byMaterial.get(bead.material);
    const previewKey = `${multi ? ids.join('-') : bead.id}-${bead.material}-${bead.diameter}`;
    $('selected-bead-preview').innerHTML = beadMarkup(material);
    if (selectedPreviewKey && selectedPreviewKey !== previewKey) animateElement($('selected-bead-preview'), [{ opacity: .75, transform: 'scale(.98)' }, { opacity: 1, transform: 'scale(1)' }], timing.fast);
    selectedPreviewKey = previewKey;
    $('selected-name').textContent = multi ? `批量 · ${ids.length} 颗` : material.name;
    $('selected-description').textContent = multi ? '同时调整珠径与珠材' : material.description;
    const diameters = new Set(ids.map((id) => state.beads.find((item) => item.id === id)?.diameter));
    renderSizes('selected-sizes', material.sizes, diameters.size === 1 ? bead.diameter : null);
    $('move-left').disabled = multi || selectedIndex() === 0;
    $('move-right').disabled = multi || selectedIndex() === state.beads.length - 1;
    $('duplicate-bead').disabled = state.beads.length >= MAX_BEADS;
  }

  function totals() {
    const count = state.beads.length;
    const strandLength = state.beads.reduce((sum, bead) => sum + bead.diameter, 0);
    const averageDiameter = count ? strandLength / count : 0;
    // 内围近似为珠心周长减去一圈珠径；异径珠仅提供配珠参考。
    const inner = Math.max(0, strandLength - Math.PI * averageDiameter) / 10;
    return { count, inner, price: state.beads.reduce((sum, bead) => sum + priceFor(bead), 0), target: state.wrist + state.ease };
  }

  function renderTotals() {
    const total = totals();
    $('wrist-size').value = state.wrist.toFixed(1);
    $('wrist-range').value = state.wrist;
    $('wrist-size').removeAttribute('aria-invalid');
    $('wrist-error').hidden = true;
    $('ease-value').textContent = `+${state.ease.toFixed(1)} cm`;
    $('inner-length').textContent = `${total.inner.toFixed(1)} cm`;
    const difference = total.inner - total.target;
    const fits = total.count > 2 && difference >= -0.2 && difference <= 0.8;
    $('fit-feedback').classList.toggle('needs-adjustment', !fits);
    $('fit-feedback').querySelector('.ti').className = `ti ${fits ? 'ti-circle-check' : 'ti-info-circle'}`;
    $('fit-label').textContent = !total.count ? '未配珠' : fits ? '合适' : difference < -.2 ? '偏小' : '偏大';
    $('fit-feedback').title = `目标内围 ${total.target.toFixed(1)} cm；估算内围 ${total.inner.toFixed(1)} cm，实物会因珠径和穿线产生差异`;
    $('total-price').textContent = money(total.price);
    $('total-beads').textContent = `${total.count} 颗珠子`;
    document.querySelectorAll('[data-ease]').forEach((button) => {
      const active = Number(button.dataset.ease) === state.ease;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    document.querySelectorAll('[data-cord]').forEach((button) => {
      const active = button.dataset.cord === state.cord;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    $('cord-label').textContent = cords[state.cord].name;
    canvas.setAttribute('aria-label', `${state.name}手串，${total.count}颗珠子，估算内围${total.inner.toFixed(1)}厘米，材料估价${money(total.price)}元；点击珠子编辑，也可使用下方珠序选择。`);
  }

  function renderPresets() {
    document.querySelectorAll('.preset-button').forEach((button) => {
      const active = button.dataset.preset === state.preset;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  }

  function render() {
    syncSelection();
    $('design-name').value = state.name;
    renderLibrary();
    renderSequence();
    renderSelected();
    renderTotals();
    renderHistory();
    renderPresets();
    queueDraw();
  }

  function selectBead(id, focusSequence = false, additive = false) {
    if (!state.beads.some((bead) => bead.id === id)) return;
    if (additive) {
      const at = selection.indexOf(id);
      if (at >= 0) {
        if (selection.length > 1) selection.splice(at, 1);
      } else {
        selection.push(id);
      }
      state.selected = selection.includes(id) ? id : selection[selection.length - 1] ?? null;
    } else {
      selection = [id];
      state.selected = id;
    }
    renderSelected();
    document.querySelectorAll('.sequence-bead').forEach((button) => {
      const beadId = Number(button.dataset.bead);
      const chosen = selection.includes(beadId);
      button.classList.toggle('active', chosen);
      button.classList.toggle('anchor', beadId === state.selected);
      button.setAttribute('aria-pressed', String(chosen));
      if (chosen && focusSequence && beadId === state.selected) button.focus({ preventScroll: true });
    });
    queueDraw();
  }

  function chooseLibrary(id) {
    const material = byMaterial.get(id);
    if (!material) return;
    libraryMaterial = id;
    if (!material.sizes.includes(libraryDiameter)) libraryDiameter = material.sizes.includes(8) ? 8 : 4;
    renderLibrary();
  }

  function addBead() {
    if (state.beads.length >= MAX_BEADS) return notify('最多可编排 80 颗珠子', true);
    const bead = makeBead(libraryMaterial, libraryDiameter);
    commit(() => {
      const index = selectedIndex();
      state.beads.splice(index < 0 ? state.beads.length : index + 1, 0, bead);
      state.selected = bead.id;
      state.preset = null;
      selection = [bead.id];
    }, `已加入 ${byMaterial.get(libraryMaterial).name}`);
    setMobilePanel('preview');
    notify(`已加入 ${libraryDiameter} mm ${byMaterial.get(libraryMaterial).name}`);
  }

  function duplicateBead() {
    const ids = selectionIds();
    if (!ids.length) return;
    const room = MAX_BEADS - state.beads.length;
    if (room <= 0) return notify('最多可编排 80 颗珠子', true);
    const copies = state.beads.filter((bead) => ids.includes(bead.id)).slice(0, room).map((bead) => makeBead(bead.material, bead.diameter));
    if (!copies.length) return;
    const anchor = Math.max(0, selectedIndex());
    commit(() => {
      state.beads.splice(anchor + 1, 0, ...copies);
      state.selected = copies[0].id;
      state.preset = null;
      selection = copies.map((copy) => copy.id);
    }, ids.length > 1 ? `已复制 ${copies.length} 颗` : '已复制珠子');
  }

  function deleteBead() {
    const ids = selectionIds();
    const index = selectedIndex();
    if (!ids.length || index < 0) return;
    commit(() => {
      state.beads = state.beads.filter((bead) => !ids.includes(bead.id));
      state.selected = state.beads[Math.min(index, state.beads.length - 1)]?.id ?? null;
      state.preset = null;
      selection = state.selected != null ? [state.selected] : [];
    }, ids.length > 1 ? `已删除 ${ids.length} 颗` : '已删除珠子');
  }

  function moveBead(offset) {
    if (selectionIds().length > 1) return notify('多选时不能调整顺序', true);
    const from = selectedIndex();
    const to = from + offset;
    if (from < 0 || to < 0 || to >= state.beads.length) return;
    commit(() => { const [bead] = state.beads.splice(from, 1); state.beads.splice(to, 0, bead); state.preset = null; }, '珠序已调整');
    document.querySelector(`.sequence-bead[data-bead="${state.selected}"]`)?.focus({ preventScroll: true });
  }

  function changePreset(key) {
    const preset = presets[key];
    if (!preset) return;
    commit(() => {
      state.beads = presetBeads(key);
      state.selected = state.beads[0].id;
      state.name = preset.name;
      state.cord = preset.cord;
      state.preset = key;
      selection = [state.beads[0].id];
    }, `已应用「${preset.name}」`);
    libraryMaterial = state.beads[0].material;
    category = byMaterial.get(libraryMaterial).category;
    $('material-search').value = '';
    libraryDiameter = 8;
    renderLibrary();
    setMobilePanel('preview');
    notify(`已应用「${preset.name}」，可撤销`);
  }

  function setMobilePanel(panel) {
    $('workspace').dataset.mobilePanel = panel;
    document.querySelectorAll('[data-panel]').forEach((button) => {
      const active = button.dataset.panel === panel;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    queueDraw();
  }

  function seededRandom(seed) {
    let value = seed | 0;
    return () => { value = Math.imul(value ^ value >>> 16, 0x45d9f3b); value = Math.imul(value ^ value >>> 16, 0x45d9f3b); value ^= value >>> 16; return (value >>> 0) / 4294967296; };
  }

  function spriteFor(material, id) {
    const key = `${material.id}-${id % 37}`;
    if (spriteCache.has(key)) return spriteCache.get(key);
    const sprite = document.createElement('canvas');
    sprite.width = 216;
    sprite.height = 216;
    const paint = sprite.getContext('2d');
    const random = seededRandom(id * 733 + material.id.length * 103);
    const cx = 108;
    const cy = 108;
    const radius = 88;
    paint.save();
    paint.beginPath();
    paint.arc(cx, cy, radius, 0, Math.PI * 2);
    paint.clip();
    const body = paint.createRadialGradient(77, 68, 4, 118, 114, 103);
    body.addColorStop(0, material.light);
    body.addColorStop(0.48, material.mid);
    body.addColorStop(0.88, material.dark);
    body.addColorStop(1, material.mid);
    paint.fillStyle = body;
    paint.fillRect(15, 15, 186, 186);

    if (material.kind === 'porcelain') {
      [[70, 91, -.4], [141, 127, .9]].forEach(([x, y, rotation]) => {
        paint.save();
        paint.translate(x, y);
        paint.rotate(rotation + random() * .25);
        paint.strokeStyle = '#28538c';
        paint.fillStyle = '#28538c';
        paint.globalAlpha = .8;
        paint.lineWidth = 2;
        paint.lineCap = 'round';
        paint.beginPath();
        paint.moveTo(-22, 29);
        paint.bezierCurveTo(9, 15, -9, -16, 19, -27);
        paint.stroke();
        [[-7, 10, -.8], [4, -5, 1.3], [15, -23, -.5]].forEach(([leafX, leafY, leafAngle]) => {
          paint.save();
          paint.translate(leafX, leafY);
          paint.rotate(leafAngle);
          paint.beginPath();
          paint.moveTo(0, 0);
          paint.bezierCurveTo(-2, -13, 11, -18, 12, -11);
          paint.bezierCurveTo(12, -4, 7, 1, 0, 0);
          paint.fill();
          paint.restore();
        });
        paint.translate(19, -27);
        for (let petal = 0; petal < 5; petal++) {
          paint.rotate(Math.PI * 2 / 5);
          paint.beginPath();
          paint.ellipse(0, -7, 3, 6, 0, 0, Math.PI * 2);
          paint.fill();
        }
        paint.restore();
      });
    } else if (material.kind === 'wood' || material.kind === 'tiger') {
      paint.save();
      paint.translate(cx, cy);
      paint.rotate(random() * 1.5 - 0.75);
      const tiger = material.kind === 'tiger';
      for (let index = 0; index < 28; index++) {
        const x = -110 + index * (tiger ? 10 : 8);
        paint.beginPath();
        paint.moveTo(x, -120);
        paint.bezierCurveTo(x + 15, -35, x - 30, 50, x + 8, 120);
        paint.strokeStyle = index % 3 === 0 ? '#f2dc9c38' : '#382a2029';
        paint.lineWidth = tiger ? 3 + random() * 8 : 0.5 + random() * 1.8;
        paint.stroke();
      }
      paint.restore();
    } else if (material.kind !== 'glass') {
      for (let index = 0; index < 66; index++) {
        const x = 26 + random() * 164;
        const y = 26 + random() * 164;
        const size = 3 + random() * 17;
        const mineral = paint.createRadialGradient(x, y, 0, x, y, size);
        mineral.addColorStop(0, index % 3 ? '#f6f7e52d' : `${material.dark}16`);
        mineral.addColorStop(1, index % 3 ? '#f6f7e500' : `${material.dark}00`);
        paint.fillStyle = mineral;
        paint.fillRect(x - size, y - size, size * 2, size * 2);
      }
      paint.save();
      paint.rotate(0.08);
      for (let index = 0; index < 5; index++) {
        const y = 40 + random() * 145;
        paint.beginPath();
        paint.moveTo(-10, y);
        paint.bezierCurveTo(45, y - 24, 110, y + 34, 220, y - 16);
        paint.strokeStyle = material.kind === 'cloud' ? '#f8faee26' : '#d4e0bb18';
        paint.lineWidth = 1 + random() * 4;
        paint.stroke();
      }
      paint.restore();
    }

    const rim = paint.createRadialGradient(cx - 8, cy - 12, 52, cx, cy, radius);
    rim.addColorStop(0, '#f1f7de00');
    rim.addColorStop(0.82, '#f1f7de00');
    rim.addColorStop(1, '#ecf3d536');
    paint.fillStyle = rim;
    paint.fillRect(15, 15, 186, 186);
    const sheen = paint.createRadialGradient(77, 61, 2, 82, 66, 55);
    sheen.addColorStop(0, material.kind === 'wood' ? '#f9faf22b' : '#f9faf2b8');
    sheen.addColorStop(0.23, material.kind === 'wood' ? '#f9faf214' : '#f9faf25e');
    sheen.addColorStop(1, '#f9faf200');
    paint.fillStyle = sheen;
    paint.fillRect(18, 18, 180, 180);
    if (material.kind !== 'wood') {
      paint.translate(77, 57);
      paint.rotate(-0.5);
      const glint = paint.createRadialGradient(0, 0, 1, 0, 0, 13);
      glint.addColorStop(0, '#fcfdf5b3');
      glint.addColorStop(0.6, '#fcfdf540');
      glint.addColorStop(1, '#fcfdf500');
      paint.scale(1.2, 0.48);
      paint.fillStyle = glint;
      paint.fillRect(-16, -16, 32, 32);
    }
    paint.restore();
    if (spriteCache.size > 400) spriteCache.clear();
    spriteCache.set(key, sprite);
    return sprite;
  }

  function drawMetal(paint, material, x, y, radius, angle) {
    paint.save();
    paint.translate(x, y);
    paint.rotate(angle);
    paint.scale(0.66, 1.25);
    paint.beginPath();
    paint.arc(0, 0, radius, 0, Math.PI * 2);
    const metal = paint.createLinearGradient(-radius, -radius, radius, radius);
    metal.addColorStop(0, material.dark);
    metal.addColorStop(0.18, material.light);
    metal.addColorStop(0.4, material.mid);
    metal.addColorStop(0.59, material.dark);
    metal.addColorStop(0.78, material.light);
    metal.addColorStop(1, material.mid);
    paint.fillStyle = metal;
    paint.fill();
    paint.strokeStyle = `${material.dark}68`;
    paint.lineWidth = 0.5;
    paint.stroke();
    paint.beginPath();
    paint.ellipse(-radius * 0.12, -radius * 0.45, radius * 0.52, radius * 0.11, -0.5, 0, Math.PI * 2);
    paint.fillStyle = '#f8f5e57d';
    paint.fill();
    paint.restore();
  }

  function paintScene(paint, width, height, exporting = false) {
    paint.clearRect(0, 0, width, height);
    if (exporting) { paint.fillStyle = colors.canvas; paint.fillRect(0, 0, width, height); }
    if (!state.beads.length || width < 1 || height < 1) {
      if (!exporting) { hits = []; sceneMotion = null; }
      return;
    }
    if (!exporting && !canAnimate()) sceneMotion = null;
    const transition = !exporting ? sceneMotion : null;
    const progress = transition ? Math.min(1, (performance.now() - transition.started) / timing.canvas) : 1;
    const eased = progress === 1 ? 1 : easedProgress(progress);
    const blend = (from, to) => from + (to - from) * eased;
    const circumference = state.beads.reduce((sum, bead) => sum + bead.diameter + .15, 0);
    const worldRadius = circumference / (2 * Math.PI);
    const maxDiameter = Math.max(...state.beads.map((bead) => bead.diameter));
    const outerDiameter = worldRadius * 2 + maxDiameter;
    const availableHeight = exporting ? height * .73 : Math.max(50, height - 96);
    const scale = Math.min(width * (exporting ? .77 : .8) / outerDiameter, availableHeight / outerDiameter) * (exporting ? 1 : zoom);
    const targetRadius = worldRadius * scale;
    const targetCenterX = width / 2;
    const targetCenterY = exporting ? height * .44 : (height - 64) / 2;
    const targetProjection = view === 'perspective' && !exporting ? .68 : 1;
    const radius = transition ? blend(transition.shape.orbit, targetRadius) : targetRadius;
    const centerX = transition ? blend(transition.shape.centerX, targetCenterX) : targetCenterX;
    const centerY = transition ? blend(transition.shape.centerY, targetCenterY) : targetCenterY;
    const yScale = transition ? blend(transition.shape.projection, targetProjection) : targetProjection;
    const positions = [];
    const ghosts = [];
    let offset = 0;
    state.beads.forEach((bead) => {
      const interval = bead.diameter + .15;
      const targetAngle = (offset + interval / 2) / circumference * Math.PI * 2 - Math.PI / 2 + orientation;
      const before = transition?.from.get(bead.id);
      const delta = before ? Math.atan2(Math.sin(targetAngle - before.angle), Math.cos(targetAngle - before.angle)) : 0;
      const angle = before ? before.angle + delta * eased : targetAngle;
      const targetSize = bead.diameter / 2 * scale;
      const beadRadius = before ? blend(before.radius, targetSize) : targetSize * (transition ? .94 + .06 * eased : 1);
      const replacing = before && before.bead.material !== bead.material;
      const opacity = transition ? !before || replacing ? eased : blend(before.opacity, 1) : 1;
      const position = { bead: { ...bead }, angle, x: centerX + Math.cos(angle) * radius, y: centerY + Math.sin(angle) * radius * yScale, radius: beadRadius, orbit: radius, projection: yScale, centerX, centerY, opacity };
      positions.push(position);
      if (replacing && progress < 1) ghosts.push({ ...position, bead: before.bead, opacity: before.opacity * (1 - eased) });
      offset += interval;
    });
    if (transition && progress < 1) {
      const present = new Set(state.beads.map((bead) => bead.id));
      transition.from.forEach((before, id) => {
        if (!present.has(id)) ghosts.push({ ...before, radius: before.radius * (1 - .06 * eased), opacity: before.opacity * (1 - eased) });
      });
    }
    if (!exporting) {
      hits = positions;
      scene = { centerX, centerY, radius, yScale, count: positions.length };
      if (progress === 1) sceneMotion = null;
    }

    paint.save();
    paint.beginPath();
    paint.ellipse(centerX + 2 * scale, centerY + 3 * scale, radius, radius * yScale, 0, 0, Math.PI * 2);
    paint.lineWidth = maxDiameter * scale * .55;
    paint.strokeStyle = '#23344d09';
    paint.filter = `blur(${Math.max(4, scale * 2)}px)`;
    paint.stroke();
    paint.restore();
    paint.beginPath();
    paint.ellipse(centerX, centerY, radius, radius * yScale, 0, 0, Math.PI * 2);
    paint.strokeStyle = cords[state.cord].color;
    paint.lineWidth = Math.max(1, scale * .5);
    paint.stroke();

    [...ghosts, ...positions].forEach(({ bead, x, y, radius: beadRadius, angle, opacity }) => {
      if (opacity <= 0) return;
      const material = byMaterial.get(bead.material);
      paint.save();
      paint.globalAlpha = opacity;
      paint.drawImage(beadShadow, x - beadRadius * .98, y - beadRadius * .36, beadRadius * 2.2, beadRadius * 1.4);
      if (material.kind === 'metal') drawMetal(paint, material, x, y, beadRadius, angle + Math.PI / 2);
      else {
        const sprite = spriteFor(material, bead.id);
        const spriteSize = beadRadius * 216 / 88;
        paint.drawImage(sprite, x - spriteSize / 2, y - spriteSize / 2, spriteSize, spriteSize);
      }
      paint.restore();
    });

    if (ruler && !exporting) {
      const innerRadius = Math.max(0, radius - maxDiameter * scale / 2 - 12);
      paint.save();
      paint.beginPath();
      paint.ellipse(centerX, centerY, innerRadius, innerRadius * yScale, 0, 0, Math.PI * 2);
      paint.strokeStyle = `${colors.accent}40`;
      paint.lineWidth = 1;
      paint.setLineDash([2, 5]);
      paint.stroke();
      paint.setLineDash([]);
      paint.fillStyle = colors['ink-secondary'];
      paint.font = '13px "DM Mono", monospace';
      paint.textAlign = 'center';
      paint.fillText(`≈ ${totals().inner.toFixed(1)} cm`, centerX, centerY + 5);
      paint.font = '11px "Noto Sans SC", "Microsoft YaHei", sans-serif';
      paint.fillStyle = colors['ink-muted'];
      paint.fillText('内围', centerX, centerY + 24);
      paint.restore();
    }
    if (!exporting) {
      selectionIds().forEach((id) => {
        const position = positions.find((item) => item.bead.id === id);
        if (!position) return;
        const anchor = id === state.selected;
        paint.save();
        paint.globalAlpha = position.opacity ?? 1;
        paint.beginPath();
        paint.arc(position.x, position.y, position.radius + (anchor ? 5 : 4), 0, Math.PI * 2);
        paint.strokeStyle = anchor ? `${colors.accent}90` : `${colors.accent}55`;
        paint.lineWidth = anchor ? 1.2 : 1;
        paint.stroke();
        if (anchor) {
          paint.beginPath();
          paint.arc(position.x + Math.cos(position.angle) * (position.radius + 5), position.y + Math.sin(position.angle) * (position.radius + 5), 2.5, 0, Math.PI * 2);
          paint.fillStyle = colors.accent;
          paint.fill();
        }
        paint.restore();
      });
      if (dragBead && dragSlot >= 0 && positions[dragSlot] && positions[dragSlot].bead.id !== dragBead.id) {
        const target = positions[dragSlot];
        paint.save();
        paint.beginPath();
        paint.arc(target.x, target.y, target.radius + 7, 0, Math.PI * 2);
        paint.setLineDash([3, 4]);
        paint.strokeStyle = `${colors.accent}aa`;
        paint.lineWidth = 1.2;
        paint.stroke();
        paint.restore();
      }
    } else {
      paint.textAlign = 'center';
      paint.fillStyle = colors.ink;
      paint.font = `400 ${width * .035}px "Noto Serif SC", "Songti SC", serif`;
      paint.fillText(state.name, centerX, height * .875, width * .85);
      paint.fillStyle = colors['ink-secondary'];
      paint.font = `${width * .013}px "DM Mono", "Microsoft YaHei", sans-serif`;
      paint.fillText(`${state.beads.length} 颗  /  内围约 ${totals().inner.toFixed(1)} cm`, centerX, height * .919);
      paint.fillStyle = colors.accent;
      paint.font = `400 ${width * .015}px "Noto Serif SC", "Songti SC", serif`;
      paint.fillText('串间', centerX, height * .964);
    }
  }

  function queueDraw() {
    if (drawFrame) return;
    drawFrame = requestAnimationFrame(() => {
      drawFrame = 0;
      const rectangle = canvas.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.round(rectangle.width * ratio);
      const height = Math.round(rectangle.height * ratio);
      if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; sceneMotion = null; }
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      paintScene(ctx, rectangle.width, rectangle.height);
      if (sceneMotion) queueDraw();
    });
  }

  function hitAt(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    return hits.find((position) => Math.hypot(position.x - x, position.y - y) <= position.radius + 4);
  }

  function showDialog(title, content, actions = []) {
    dialogReturnFocus = document.activeElement;
    $('dialog-title').textContent = title;
    $('dialog-content').innerHTML = content;
    $('dialog-actions').replaceChildren();
    actions.forEach(({ label, primary = false, action }) => {
      const button = document.createElement('button');
      button.className = primary ? 'primary-button' : 'text-button';
      button.textContent = label;
      button.addEventListener('click', () => { closeDialog(); action?.(); });
      $('dialog-actions').append(button);
    });
    $('studio-dialog').showModal();
  }

  function closeDialog() {
    $('studio-dialog').close();
    if (dialogReturnFocus instanceof HTMLElement && dialogReturnFocus.isConnected) dialogReturnFocus.focus({ preventScroll: true });
  }

  function confirmChange(title, message, action) {
    showDialog(title, `<p class="dialog-copy">${escapeHTML(message)}</p>`, [{ label: '继续编辑' }, { label: title, primary: true, action }]);
  }

  function billRows() {
    const groups = new Map();
    state.beads.forEach((bead) => {
      const key = `${bead.material}-${bead.diameter}`;
      if (!groups.has(key)) groups.set(key, { material: byMaterial.get(bead.material), diameter: bead.diameter, count: 0, price: 0 });
      const group = groups.get(key);
      group.count++;
      group.price += priceFor(bead);
    });
    return [...groups.values()];
  }

  function showBill() {
    const rows = billRows();
    const content = rows.length ? `<table class="bill-table"><thead><tr><th>珠材</th><th>珠径</th><th>数量</th><th>小计</th></tr></thead><tbody>${rows.map((row) => `<tr><td>${row.material.name}</td><td>${row.diameter} mm</td><td>${row.count}</td><td>¥${money(row.price)}</td></tr>`).join('')}</tbody><tfoot><tr><td colspan="3">材料合计</td><td>¥${money(totals().price)}</td></tr></tfoot></table><p class="bill-note">珠材单价为配珠估价，不含加工、运费及损耗。</p>` : '<p class="dialog-copy">还没有材料。先加入一颗珠子。</p>';
    showDialog('材料清单', content, rows.length ? [{ label: '打印清单', action: () => { showBill(); window.print(); } }, { label: '导出清单', primary: true, action: saveBill }] : []);
  }

  function saveBill() {
    const lines = ['珠材,珠径(mm),数量,单价(元),小计(元)', ...billRows().map((row) => `${row.material.name},${row.diameter},${row.count},${money(row.price / row.count)},${money(row.price)}`), `材料合计,,,,${money(totals().price)}`];
    download(new Blob(['﻿', lines.join('\r\n')], { type: 'text/csv;charset=utf-8' }), `${safeFilename()}-材料清单.csv`);
    notify('材料清单已导出');
  }

  function showHelp() {
    const shortcuts = [['保存方案', 'Ctrl / ⌘ S'], ['导入方案', 'Ctrl / ⌘ O'], ['撤销', 'Ctrl / ⌘ Z'], ['重做', 'Ctrl / ⌘ Shift Z'], ['复制选中珠子', 'Ctrl / ⌘ D'], ['删除选中珠子', 'Delete'], ['前移 / 后移珠子', 'Alt + 方向键'], ['选中相邻珠子', '左右方向键'], ['搜索材料', '/'], ['关闭弹窗', 'Esc']];
    showDialog('快捷键', `<div class="shortcut-list">${shortcuts.map(([label, key]) => `<span>${label}</span><kbd>${escapeHTML(key)}</kbd>`).join('')}</div>`);
  }

  function showInspiration() {
    showDialog('选一份配色灵感', `<div class="inspiration-list">${Object.entries(presets).map(([key, preset]) => `<button data-dialog-preset="${key}"><span class="preset-swatch ${key}-swatch"></span><div><h3>${preset.name}</h3><p>${preset.description}</p></div></button>`).join('')}</div>`);
  }

  function showReplacement() {
    if (!selectedBead()) return;
    showDialog('替换这颗珠子', `<div class="material-list replacement-list">${materials.map((material) => `<button class="material-card" data-replacement="${material.id}">${beadMarkup(material)}<h3>${material.name}</h3></button>`).join('')}</div>`);
  }

  function safeFilename() { return state.name.replace(/[\\/:*?"<>|\x00-\x1f]/g, '').trim() || '串间手串'; }

  function download(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function saveJSON() {
    finishSlider();
    const data = { format: 'chuanjian', version: 1, name: state.name, wrist: state.wrist, ease: state.ease, cord: state.cord, beads: state.beads.map(({ material, diameter }) => ({ material, diameter })) };
    download(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }), `${safeFilename()}.json`);
    $('edit-status').textContent = '方案已导出为文件';
    notify('方案已导出为 JSON 文件');
  }

  function exportImage() {
    if (!state.beads.length) return;
    const output = document.createElement('canvas');
    output.width = 1600;
    output.height = 1600;
    paintScene(output.getContext('2d'), 1600, 1600, true);
    const filename = `${safeFilename()}.png`;
    output.toBlob((blob) => {
      if (!blob) return notify('图片导出失败，请重试', true);
      download(blob, filename);
      notify('成品图已导出为 PNG');
    }, 'image/png');
  }

  function validImport(data) {
    return data && data.format === 'chuanjian' && data.version === 1 && typeof data.name === 'string' && data.name.trim().length > 0 && data.name.length <= 30 && Number.isFinite(data.wrist) && data.wrist >= 12 && data.wrist <= 22 && [0.3, 0.5, 1].includes(data.ease) && typeof data.cord === 'string' && Object.hasOwn(cords, data.cord) && Array.isArray(data.beads) && data.beads.length <= MAX_BEADS && data.beads.every((bead) => bead && byMaterial.has(bead.material) && byMaterial.get(bead.material).sizes.includes(bead.diameter));
  }

  async function importJSON(event) {
    const file = event.target.files[0];
    event.target.value = '';
    if (!file) return;
    if (file.size > 128 * 1024) return notify('方案文件不能超过 128 KB', true);
    let data;
    try { data = JSON.parse(await file.text()); } catch { return notify('文件不是有效的 JSON 方案', true); }
    if (!validImport(data)) return notify('方案格式不正确，请导入串间导出的文件', true);
    const apply = () => {
      commit(() => {
        state.beads = data.beads.map((bead) => makeBead(bead.material, bead.diameter));
        state.selected = state.beads[0]?.id ?? null;
        state.name = data.name.trim();
        state.wrist = Math.round(data.wrist * 10) / 10;
        state.ease = data.ease;
        state.cord = data.cord;
        state.preset = null;
      }, '方案已导入');
      setMobilePanel('preview');
      notify('方案已导入，可撤销');
    };
    if (state.beads.length) confirmChange('导入方案', `将载入「${data.name}」并替换当前设计。你可以撤销这次操作。`, apply);
    else apply();
  }

  document.addEventListener('pointerdown', () => { document.body.dataset.input = 'pointer'; }, true);
  document.addEventListener('keydown', () => {
    document.body.dataset.input = 'keyboard';
    sceneMotion = null;
    document.getAnimations().forEach((animation) => animation.cancel());
    queueDraw();
  }, true);
  motion.addEventListener('change', () => {
    if (motion.matches) {
      sceneMotion = null;
      document.getAnimations().forEach((animation) => animation.cancel());
      queueDraw();
    }
  });
  $('material-list').addEventListener('click', (event) => {
    const button = event.target.closest('[data-material]');
    if (button) chooseLibrary(button.dataset.material);
    if (event.target.closest('#clear-search')) { $('material-search').value = ''; renderLibrary(); $('material-search').focus(); }
  });
  $('material-list').addEventListener('dblclick', (event) => { const button = event.target.closest('[data-material]'); if (button) { chooseLibrary(button.dataset.material); addBead(); } });
  $('material-search').addEventListener('input', renderLibrary);
  document.querySelectorAll('[data-category]').forEach((button) => button.addEventListener('click', () => { category = button.dataset.category; $('material-search').value = ''; renderLibrary(); }));
  $('library-sizes').addEventListener('click', (event) => { const button = event.target.closest('[data-diameter]'); if (button) { libraryDiameter = Number(button.dataset.diameter); renderSizes('library-sizes', byMaterial.get(libraryMaterial).sizes, libraryDiameter); } });
  $('selected-sizes').addEventListener('click', (event) => {
    const button = event.target.closest('[data-diameter]');
    const ids = selectionIds();
    if (!button || !ids.length) return;
    const target = Number(button.dataset.diameter);
    const affected = state.beads.filter((bead) => ids.includes(bead.id) && bead.diameter !== target && byMaterial.get(bead.material).sizes.includes(target));
    if (!affected.length) return;
    commit(() => { affected.forEach((bead) => { bead.diameter = target; }); state.preset = null; }, affected.length > 1 ? `已统一 ${affected.length} 颗为 ${target} mm` : '单珠直径已调整');
  });
  $('add-bead').addEventListener('click', addBead);
  $('empty-add').addEventListener('click', addBead);
  $('duplicate-bead').addEventListener('click', duplicateBead);
  $('delete-bead').addEventListener('click', deleteBead);
  $('move-left').addEventListener('click', () => moveBead(-1));
  $('move-right').addEventListener('click', () => moveBead(1));
  $('replace-bead').addEventListener('click', showReplacement);
  $('locate-material').addEventListener('click', () => {
    const bead = selectedBead();
    if (!bead) return;
    category = byMaterial.get(bead.material).category;
    libraryMaterial = bead.material;
    libraryDiameter = bead.diameter;
    $('material-search').value = '';
    renderLibrary();
    setMobilePanel('materials');
    document.querySelector(`[data-material="${bead.material}"]`)?.focus({ preventScroll: true });
  });
  $('bead-sequence').addEventListener('click', (event) => { const button = event.target.closest('[data-bead]'); if (button) selectBead(Number(button.dataset.bead), false, event.shiftKey || event.metaKey || event.ctrlKey); });
  $('bead-sequence').addEventListener('dragstart', (event) => {
    const button = event.target.closest('[data-bead]');
    if (!button) return;
    draggedId = Number(button.dataset.bead);
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', String(draggedId));
    button.classList.add('dragging');
  });
  $('bead-sequence').addEventListener('dragover', (event) => {
    const button = event.target.closest('[data-bead]');
    if (!button || draggedId === null) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    document.querySelectorAll('.drop-target').forEach((target) => target.classList.remove('drop-target'));
    button.classList.add('drop-target');
  });
  $('bead-sequence').addEventListener('drop', (event) => {
    event.preventDefault();
    const button = event.target.closest('[data-bead]');
    const from = state.beads.findIndex((bead) => bead.id === draggedId);
    const to = button ? state.beads.findIndex((bead) => bead.id === Number(button.dataset.bead)) : -1;
    if (from >= 0 && to >= 0 && from !== to) commit(() => { const [bead] = state.beads.splice(from, 1); state.beads.splice(to, 0, bead); state.selected = bead.id; state.preset = null; }, '珠序已调整');
    draggedId = null;
    document.querySelectorAll('.drop-target, .dragging').forEach((target) => target.classList.remove('drop-target', 'dragging'));
  });
  $('bead-sequence').addEventListener('dragend', () => { draggedId = null; document.querySelectorAll('.drop-target, .dragging').forEach((button) => button.classList.remove('drop-target', 'dragging')); });
  $('reverse-sequence').addEventListener('click', () => { if (state.beads.length > 1) commit(() => { state.beads.reverse(); state.preset = null; }, '珠序已反转'); });
  /* ---------- 画布：滚轮缩放、拖动换位、Shift 多选 ---------- */
  function pointerPoint(event) {
    const rect = canvas.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }
  function slotIndexAt(point) {
    if (!scene || !scene.count) return -1;
    const angle = Math.atan2((point.y - scene.centerY) / (scene.yScale || 1), point.x - scene.centerX);
    let turn = (angle + Math.PI / 2 - orientation) / (Math.PI * 2);
    turn = ((turn % 1) + 1) % 1;
    return Math.round(turn * scene.count) % scene.count;
  }
  canvas.addEventListener('pointerdown', (event) => {
    if (event.button !== 0) return;
    const hit = hitAt(event);
    if (!hit) return;
    dragBead = hit.bead;
    dragMoved = false;
    dragOrigin = pointerPoint(event);
    canvas.setPointerCapture(event.pointerId);
  });
  canvas.addEventListener('pointermove', (event) => {
    if (!dragBead) { canvas.style.cursor = hitAt(event) ? 'pointer' : 'default'; return; }
    const point = pointerPoint(event);
    if (!dragMoved && Math.hypot(point.x - dragOrigin.x, point.y - dragOrigin.y) > 4) {
      dragMoved = true;
      canvas.style.cursor = 'grabbing';
    }
    if (dragMoved) {
      const slot = slotIndexAt(point);
      if (slot !== dragSlot) { dragSlot = slot; queueDraw(); }
    }
  });
  canvas.addEventListener('pointerup', (event) => {
    if (!dragBead) return;
    const bead = dragBead;
    const moved = dragMoved;
    const slot = slotIndexAt(pointerPoint(event));
    dragBead = null;
    dragMoved = false;
    dragSlot = -1;
    canvas.style.cursor = 'pointer';
    if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
    if (!moved) {
      selectBead(bead.id, false, event.shiftKey || event.metaKey || event.ctrlKey);
      return;
    }
    const from = state.beads.findIndex((item) => item.id === bead.id);
    if (from < 0 || slot < 0 || slot === from) { queueDraw(); return; }
    commit(() => {
      const [moved] = state.beads.splice(from, 1);
      state.beads.splice(slot, 0, moved);
      state.selected = moved.id;
      state.preset = null;
      selection = [moved.id];
    }, '珠子位置已调整');
  });
  canvas.addEventListener('pointercancel', () => { dragBead = null; dragMoved = false; dragSlot = -1; queueDraw(); });
  canvas.addEventListener('wheel', (event) => {
    if (!state.beads.length) return;
    event.preventDefault();
    adjustZoom(event.deltaY > 0 ? -.08 : .08);
  }, { passive: false });
  $('undo').addEventListener('click', undo);
  $('redo').addEventListener('click', redo);
  $('design-name').addEventListener('change', () => {
    const name = $('design-name').value.trim();
    if (!name) { $('design-name').value = state.name; return notify('给这条手串起个名字', true); }
    if (name !== state.name) commit(() => { state.name = name; state.preset = null; }, '方案已重命名');
  });
  $('wrist-size').addEventListener('change', () => {
    const raw = $('wrist-size').value.trim();
    const value = Number(raw);
    if (!raw || !Number.isFinite(value) || value < 12 || value > 22) { $('wrist-size').setAttribute('aria-invalid', 'true'); $('wrist-error').hidden = false; return; }
    const wrist = Math.round(value * 10) / 10;
    if (wrist !== state.wrist) commit(() => { state.wrist = wrist; state.preset = null; }, '佩戴尺寸已调整');
    else renderTotals();
  });
  $('wrist-range').addEventListener('input', () => {
    if (!sliderSnapshot) sliderSnapshot = snapshot();
    state.wrist = Number($('wrist-range').value);
    renderTotals();
  });
  $('wrist-range').addEventListener('change', finishSlider);
  document.querySelectorAll('[data-ease]').forEach((button) => button.addEventListener('click', () => { const ease = Number(button.dataset.ease); if (state.ease !== ease) commit(() => { state.ease = ease; state.preset = null; }, '佩戴松量已调整'); }));
  document.querySelectorAll('[data-cord]').forEach((button) => button.addEventListener('click', () => { const cord = button.dataset.cord; if (state.cord !== cord) commit(() => { state.cord = cord; state.preset = null; }, '弹力线颜色已调整'); }));
  document.querySelectorAll('.preset-button').forEach((button) => button.addEventListener('click', () => changePreset(button.dataset.preset)));
  document.querySelectorAll('[data-panel]').forEach((button) => button.addEventListener('click', () => setMobilePanel(button.dataset.panel)));
  document.querySelectorAll('[data-view]').forEach((button) => button.addEventListener('click', () => {
    if (view === button.dataset.view) return;
    beginSceneMotion();
    view = button.dataset.view;
    document.querySelectorAll('[data-view]').forEach((option) => { const active = option.dataset.view === view; option.classList.toggle('active', active); option.setAttribute('aria-pressed', String(active)); });
    queueDraw();
  }));
  function adjustZoom(amount) {
    const next = Math.max(.65, Math.min(1.3, Math.round((zoom + amount) * 100) / 100));
    if (next !== zoom) beginSceneMotion();
    zoom = next;
    $('zoom-reset').textContent = `${Math.round(zoom * 100)}%`;
    $('zoom-out').disabled = zoom <= .65;
    $('zoom-in').disabled = zoom >= 1.3;
    queueDraw();
  }
  $('zoom-in').addEventListener('click', () => adjustZoom(.1));
  $('zoom-out').addEventListener('click', () => adjustZoom(-.1));
  $('zoom-reset').addEventListener('click', () => adjustZoom(1 - zoom));
  $('rotate-left').addEventListener('click', () => { beginSceneMotion(); orientation -= Math.PI / 12; queueDraw(); });
  $('rotate-right').addEventListener('click', () => { beginSceneMotion(); orientation += Math.PI / 12; queueDraw(); });
  $('toggle-ruler').addEventListener('click', () => { ruler = !ruler; $('toggle-ruler').setAttribute('aria-pressed', String(ruler)); queueDraw(); });
  $('save-json').addEventListener('click', saveJSON);
  $('export-image').addEventListener('click', exportImage);
  $('import-file').addEventListener('change', importJSON);
  $('show-bill').addEventListener('click', showBill);
  $('inspiration-info').addEventListener('click', showInspiration);
  $('keyboard-help').addEventListener('click', showHelp);
  $('close-dialog').addEventListener('click', closeDialog);
  $('studio-dialog').addEventListener('click', (event) => { if (event.target === $('studio-dialog')) { const rect = $('studio-dialog').getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeDialog(); } });
  $('studio-dialog').addEventListener('cancel', (event) => { event.preventDefault(); closeDialog(); });
  $('dialog-content').addEventListener('click', (event) => {
    const preset = event.target.closest('[data-dialog-preset]');
    if (preset) { closeDialog(); changePreset(preset.dataset.dialogPreset); }
    const replacement = event.target.closest('[data-replacement]');
    if (replacement) {
      const ids = selectionIds();
      const material = byMaterial.get(replacement.dataset.replacement);
      closeDialog();
      const affected = state.beads.filter((bead) => ids.includes(bead.id) && bead.material !== material.id);
      if (!affected.length) return;
      commit(() => {
        affected.forEach((bead) => {
          bead.material = material.id;
          if (!material.sizes.includes(bead.diameter)) bead.diameter = material.category === 'metal' ? 4 : 8;
        });
        state.preset = null;
      }, affected.length > 1 ? `已替换 ${affected.length} 颗为 ${material.name}` : `已替换为 ${material.name}`);
      notify(`已替换为 ${material.name}`);
    }
  });
  function closeFileMenu() { $('file-menu').hidden = true; $('file-menu-toggle').setAttribute('aria-expanded', 'false'); }
  $('file-menu-toggle').addEventListener('click', () => { const open = $('file-menu').hidden; $('file-menu').hidden = !open; $('file-menu-toggle').setAttribute('aria-expanded', String(open)); });
  document.addEventListener('click', (event) => { if (!event.target.closest('.menu-anchor')) closeFileMenu(); });
  $('file-menu').addEventListener('click', (event) => {
    const button = event.target.closest('[data-file]');
    if (!button) return;
    closeFileMenu();
    const action = button.dataset.file;
    if (action === 'import') $('import-file').click();
    if (action === 'save') saveJSON();
    if (action === 'list') showBill();
    if (action === 'help') showHelp();
    if (action === 'new') confirmChange('新建手串', '从空白开始编排。当前设计可通过撤销恢复。', () => { commit(() => { state.beads = []; state.selected = null; state.name = '未命名手串'; state.preset = null; }, '已新建空白手串'); setMobilePanel('preview'); });
    if (action === 'reset') confirmChange('恢复初始设计', '恢复「素青」的配珠和佩戴尺寸，当前设计可撤销恢复。', () => {
      commit(() => {
        const beads = presetBeads('porcelain');
        state = { name: '素青', beads, selected: beads[0].id, wrist: 15.5, ease: .5, cord: 'ivory', preset: 'porcelain' };
        orientation = -.12;
        zoom = 1;
        view = 'flat';
        ruler = false;
        libraryMaterial = 'porcelain';
        libraryDiameter = 8;
        category = 'stone';
        $('material-search').value = '';
        $('toggle-ruler').setAttribute('aria-pressed', 'false');
        document.querySelectorAll('[data-view]').forEach((option) => { const active = option.dataset.view === view; option.classList.toggle('active', active); option.setAttribute('aria-pressed', String(active)); });
      }, '已恢复初始设计');
      adjustZoom(0);
      setMobilePanel('preview');
    });
  });
  document.addEventListener('keydown', (event) => {
    const input = event.target instanceof HTMLElement && event.target.matches('input, textarea, [contenteditable="true"]');
    const mod = event.ctrlKey || event.metaKey;
    if ($('studio-dialog').open) return;
    if (mod && event.key.toLowerCase() === 's') { event.preventDefault(); if (event.target === $('design-name')) $('design-name').blur(); saveJSON(); return; }
    if (mod && event.key.toLowerCase() === 'o') { event.preventDefault(); $('import-file').click(); return; }
    if (input) return;
    if (mod && event.key.toLowerCase() === 'z') { event.preventDefault(); event.shiftKey ? redo() : undo(); }
    else if (mod && event.key.toLowerCase() === 'y') { event.preventDefault(); redo(); }
    else if (mod && event.key.toLowerCase() === 'd') { event.preventDefault(); duplicateBead(); }
    else if (event.key === 'Delete' || event.key === 'Backspace') { event.preventDefault(); deleteBead(); }
    else if (event.altKey && ['ArrowLeft', 'ArrowRight'].includes(event.key)) { event.preventDefault(); moveBead(event.key === 'ArrowLeft' ? -1 : 1); }
    else if (['ArrowLeft', 'ArrowRight'].includes(event.key) && event.target.closest('.bead-sequence')) { event.preventDefault(); const index = selectedIndex() + (event.key === 'ArrowLeft' ? -1 : 1); if (state.beads[index]) selectBead(state.beads[index].id, true); }
    else if (event.key === '/') { event.preventDefault(); setMobilePanel('materials'); $('material-search').focus(); }
    else if (event.key === 'Escape') { closeFileMenu(); $('file-menu-toggle').focus(); }
  });
  new ResizeObserver(queueDraw).observe($('canvas-stage'));
  window.addEventListener('resize', queueDraw);
  document.fonts.ready.then(queueDraw);
  setMobilePanel('preview');
  render();
})();
