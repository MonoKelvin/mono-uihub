'use strict';

(() => {
  const $ = (id) => document.getElementById(id);
  const canvas = document.querySelector('.canvas');
  const viewport = $('viewport');
  const world = $('sceneWorld');
  const clone = (value) => structuredClone(value);
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const uid = () => globalThis.crypto?.randomUUID?.() || `item-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const escapeHTML = (value) => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const icon = (name) => `<i class="ti ti-${name}" aria-hidden="true"></i>`;
  const materials = {
    original: { name: 'Original', filter: 'none' },
    silver: { name: 'Silver', filter: 'grayscale(1) brightness(1.2) contrast(1.08)' },
    clay: { name: 'Terracotta', filter: 'sepia(1) saturate(1.55) hue-rotate(330deg) brightness(.94)' },
    graphite: { name: 'Graphite', filter: 'grayscale(1) brightness(.65) contrast(1.12)' },
    obsidian: { name: 'Obsidian', filter: 'grayscale(1) brightness(.38) contrast(1.3)' },
  };
  const types = { character: { name: 'Boy character', icon: 'user', ratio: 331 / 639 }, sphere: { name: 'Sphere', icon: 'sphere', ratio: 1 }, cube: { name: 'Cube', icon: 'cube', ratio: 1 }, cone: { name: 'Cone', icon: 'cone', ratio: 1 }, image: { name: 'Image', icon: 'photo' }, video: { name: 'Video', icon: 'movie' } };
  const MAX_FILE = 10 * 1024 * 1024;
  const MAX_PROJECT = 30 * 1024 * 1024;
  const MAX_OBJECTS = 100;
  const makeObject = (type, extra = {}) => ({ id: uid(), type, name: types[type].name, x: 50, y: 50, scale: 1, rotation: 0, opacity: 100, visible: true, locked: false, material: 'original', ratio: types[type].ratio || 1, ...extra });
  const initial = () => ({ name: '3D Boy Character', objects: [makeObject('character')], comments: [], references: [], background: { hex: 'F8F7F7', opacity: 100, style: 'neutral' }, camera: { mode: 'isometric', distortion: 40 }, animation: { motion: 'idle', duration: 8, loop: true } });
  let state = initial();
  let selected = state.objects[0].id;
  let tool = 'select';
  let model = 'Scene presets';
  let view = { zoom: 100, panX: 0, panY: 0 };
  let dimensions = { width: 1, height: 1 };
  let crop = { x: 15, y: 10, width: 70, height: 80 };
  let undoStack = [];
  let redoStack = [];
  let projectEpoch = 0;
  let activeMenu = null;
  let dialogReturnFocus = null;
  let dialogCleanup = null;
  let toastTimer;
  let gesture = null;
  let rangeBefore = null;
  let playback = { playing: false, started: 0, elapsed: 0, frame: 0 };
  let recognition = null;
  let importBusy = false;
  let exportBusy = false;
  const nodes = new Map();
  const shapeSources = new Map();
  const imageCache = new Map();
  const selectedObject = () => state.objects.find((object) => object.id === selected);

  function notify(text) {
    $('toastText').textContent = text;
    $('toast').hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { $('toast').hidden = true; }, 3600);
  }
  function historyEntry() { return { state: clone(state), selected }; }
  function pushHistory(before) {
    if (JSON.stringify(before.state) === JSON.stringify(state)) return;
    undoStack.push(before);
    if (undoStack.length > 60) undoStack.shift();
    redoStack = [];
  }
  function mutate(change) {
    const before = historyEntry();
    change();
    pushHistory(before);
    render();
  }
  function travel(direction) {
    finishGesture(false);
    finishRange();
    const source = direction === 'undo' ? undoStack : redoStack;
    const destination = direction === 'undo' ? redoStack : undoStack;
    if (!source.length) return;
    stopPlayback();
    stopVoice();
    projectEpoch++;
    destination.push(historyEntry());
    const entry = source.pop();
    state = entry.state;
    selected = entry.selected;
    closeDialog();
    render();
  }
  function replaceProject(next, nextSelection = next.objects[0]?.id || null) {
    stopPlayback(); stopVoice(); finishGesture(true); finishRange();
    projectEpoch++;
    mutate(() => { state = next; selected = nextSelection; });
    $('promptInput').value = '';
    view = { zoom: 100, panX: 0, panY: 0 };
    setTool('select');
    render();
  }
  function requireObject() {
    const object = selectedObject();
    if (!object) { notify('Select an object first.'); return null; }
    if (object.locked) { notify('Unlock this object before editing.'); return null; }
    return object;
  }
  function selectObject(id) {
    selected = id;
    renderTree(); renderInspector(); renderSelection(); renderObjects();
  }
  function addObject(type) {
    if (!types[type]) return;
    if (state.objects.length >= MAX_OBJECTS) { notify('A scene can contain up to 100 objects.'); return; }
    const offset = state.objects.length % 5;
    const object = makeObject(type, { x: state.objects.length ? 25 + offset * 9 : 50, y: type === 'character' ? 50 : 65, scale: type === 'character' && state.objects.length ? .55 : 1 });
    const names = new Set(state.objects.map((item) => item.name));
    if (names.has(object.name)) {
      let index = 2; while (names.has(`${object.name} ${index}`)) index++;
      object.name += ` ${index}`;
    }
    mutate(() => { state.objects.push(object); selected = object.id; });
    closeDialog(); closeMenus(); closeDrawers(); setTool('select');
  }
  function removeObject(id) {
    const object = state.objects.find((item) => item.id === id);
    if (!object || object.locked) { notify('Unlock this object before deleting.'); return; }
    mutate(() => {
      const index = state.objects.findIndex((item) => item.id === id);
      state.objects.splice(index, 1);
      if (selected === id) selected = state.objects[Math.min(index, state.objects.length - 1)]?.id || null;
    });
    if (!state.objects.some((item) => item.visible)) stopPlayback();
    closeDialog();
  }
  function duplicateObject() {
    const source = selectedObject();
    if (!source) return;
    if (state.objects.length >= MAX_OBJECTS) { notify('A scene can contain up to 100 objects.'); return; }
    const object = { ...clone(source), id: uid(), name: `${source.name} copy`.slice(0, 80), x: clamp(source.x + 6, 0, 100), y: clamp(source.y + 3, 0, 100), locked: false };
    mutate(() => { state.objects.push(object); selected = object.id; });
    closeDialog();
  }
  function applyMaterial(material) {
    const object = requireObject();
    if (!object || !materials[material]) return;
    mutate(() => { object.material = material; });
    closeDialog();
  }
  function applyStyle(style) {
    if (!['neutral', 'architecture', 'dreamscape'].includes(style)) return;
    mutate(() => { state.background.style = style; });
    closeDialog();
  }

  // 几何对象共用同一张 Canvas 图像，屏幕预览与导出不会各画一套。
  function shapeSource(type) {
    if (shapeSources.has(type)) return shapeSources.get(type);
    const surface = document.createElement('canvas'); surface.width = surface.height = 256;
    const ctx = surface.getContext('2d');
    if (type === 'sphere') {
      const gradient = ctx.createRadialGradient(77, 63, 7, 126, 130, 116);
      [[0, '#edf1e7'], [.22, '#c7d2bc'], [.57, '#879d79'], [.9, '#41583a'], [1, '#52684b']].forEach(([point, color]) => gradient.addColorStop(point, color));
      ctx.fillStyle = gradient; ctx.beginPath(); ctx.arc(128, 128, 112, 0, Math.PI * 2); ctx.fill();
    } else if (type === 'cube') {
      const face = (points, color) => { ctx.fillStyle = color; ctx.beginPath(); points.forEach(([x, y], index) => index ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath(); ctx.fill(); };
      face([[20, 71], [128, 18], [235, 72], [129, 125]], '#c7d2bc');
      face([[20, 71], [129, 125], [129, 237], [20, 182]], '#91a580');
      face([[129, 125], [235, 72], [235, 183], [129, 237]], '#516747');
    } else {
      const gradient = ctx.createLinearGradient(26, 0, 226, 0);
      gradient.addColorStop(0, '#435e3b'); gradient.addColorStop(.42, '#d3ddc9'); gradient.addColorStop(1, '#4a613e');
      ctx.fillStyle = gradient; ctx.beginPath(); ctx.moveTo(128, 15); ctx.lineTo(229, 211); ctx.ellipse(128, 211, 101, 30, 0, 0, Math.PI); ctx.closePath(); ctx.fill();
    }
    const src = surface.toDataURL('image/png'); shapeSources.set(type, src); return src;
  }
  function objectSource(object) { return object.type === 'character' ? window.BRAINWAVE_CHARACTER_SOURCE : ['sphere', 'cube', 'cone'].includes(object.type) ? shapeSource(object.type) : object.src; }
  function objectSize(object, size = dimensions) {
    const height = (object.type === 'character' ? Math.min(639, size.height * .94) : Math.min(180, size.height * .26)) * object.scale;
    return { height, width: height * object.ratio };
  }
  function cameraFactors(camera = state.camera) {
    const amount = camera.mode === 'perspective' ? camera.distortion / 100 : 0;
    return { skew: amount * .12, stretch: 1 - amount * .08 };
  }
  function renderView() {
    const { skew, stretch } = cameraFactors();
    world.style.transform = `translate(${view.panX}px, ${view.panY}px) scale(${view.zoom / 100}) matrix(1,0,${skew},${stretch},0,0)`;
    $('zoomLabel').textContent = `${view.zoom}%`;
    renderCrop();
  }
  function drawBackground(ctx, width, height, background, transparent = false) {
    if (transparent) return;
    ctx.save();
    ctx.globalAlpha = background.opacity / 100;
    ctx.fillStyle = `#${background.hex}`; ctx.fillRect(0, 0, width, height);
    if (background.style === 'architecture') {
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, '#f6e4e4'); gradient.addColorStop(1, '#e4eaf0');
      ctx.fillStyle = gradient; ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = '#d2dcea'; ctx.fillRect(0, height * .78, width, height * .22);
      ctx.fillStyle = '#ecc9c4'; ctx.fillRect(width * .07, height * .38, width * .2, height * .4);
      ctx.fillStyle = '#d4bdbe'; ctx.beginPath(); ctx.ellipse(width * .17, height * .4, width * .1, height * .13, 0, Math.PI, 0); ctx.fill();
      ctx.fillStyle = '#b7c8d8'; ctx.fillRect(width * .8, height * .55, width * .13, height * .23);
      ctx.fillStyle = '#c9d6e3'; ctx.beginPath(); ctx.moveTo(width * .8, height * .55); ctx.lineTo(width * .86, height * .5); ctx.lineTo(width * .99, height * .5); ctx.lineTo(width * .93, height * .55); ctx.closePath(); ctx.fill();
    } else if (background.style === 'dreamscape') {
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, '#ece0ef'); gradient.addColorStop(.55, '#f2c9d3'); gradient.addColorStop(1, '#c4d2e9');
      ctx.fillStyle = gradient; ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = '#ffead7'; ctx.beginPath(); ctx.arc(width * .73, height * .3, Math.min(width, height) * .09, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#b2c2dd'; ctx.beginPath(); ctx.moveTo(0, height * .81); ctx.bezierCurveTo(width * .3, height * .57, width * .55, height * .91, width, height * .69); ctx.lineTo(width, height); ctx.lineTo(0, height); ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  }
  function renderBackground() {
    const element = $('sceneBackground');
    const pixelRatio = Math.min(devicePixelRatio || 1, 2);
    element.width = Math.round(dimensions.width * pixelRatio); element.height = Math.round(dimensions.height * pixelRatio);
    const ctx = element.getContext('2d'); ctx.scale(pixelRatio, pixelRatio);
    drawBackground(ctx, dimensions.width, dimensions.height, state.background);
  }
  function renderObjects() {
    const ids = new Set(state.objects.map((item) => item.id));
    for (const [id, node] of nodes) {
      if (!ids.has(id)) { node.querySelector('video')?.pause(); node.remove(); nodes.delete(id); }
    }
    for (const object of state.objects) {
      let node = nodes.get(object.id);
      const src = objectSource(object);
      if (node && (node.dataset.type !== object.type || node.querySelector('img, video').getAttribute('src') !== src)) {
        node.querySelector('video')?.pause(); node.remove(); nodes.delete(object.id); node = null;
      }
      if (!node) {
        node = document.createElement('button'); node.type = 'button'; node.className = 'scene-object'; node.dataset.objectId = object.id; node.dataset.type = object.type;
        const motion = document.createElement('span'); motion.className = 'object-motion';
        const media = document.createElement(object.type === 'video' ? 'video' : 'img');
        if (object.type === 'video') { media.muted = true; media.loop = true; media.playsInline = true; media.preload = 'auto'; }
        else { media.alt = object.name; media.draggable = false; }
        media.src = objectSource(object);
        media.addEventListener('error', () => notify(`Could not load ${object.name}. Try importing it again.`), { once: true });
        motion.append(media); node.append(motion); nodes.set(object.id, node);
      }
      // append 移动已有节点，保证 DOM 顺序始终等于图层顺序。
      $('objectsLayer').append(node);
      node.hidden = !object.visible;
      node.classList.toggle('selected', object.id === selected && tool === 'select');
      node.dataset.locked = object.locked;
      node.setAttribute('aria-label', `${object.name}${object.locked ? ', locked' : ''}`);
      node.setAttribute('aria-pressed', object.id === selected);
      node.title = object.name;
      const size = objectSize(object);
      Object.assign(node.style, { left: `${object.x}%`, top: `${object.y}%`, width: `${size.width}px`, height: `${size.height}px`, opacity: object.opacity / 100 });
      node.style.setProperty('--rotation', `${object.rotation}deg`);
      node.firstElementChild.style.filter = materials[object.material].filter;
      const video = node.querySelector('video');
      if (video) { video.loop = state.animation.loop; if (playback.playing && object.visible) video.play().catch(() => {}); else video.pause(); }
    }
    $('viewportEmpty').hidden = state.objects.some((object) => object.visible);
    $('viewportEmpty').querySelector('p').textContent = state.objects.length ? 'Your objects are hidden.' : 'A little space for your next idea.';
    renderMotion();
  }
  function renderTree() {
    const query = $('sceneSearch').value.trim().toLowerCase();
    const objects = state.objects.filter((object) => object.name.toLowerCase().includes(query));
    $('sceneTree').innerHTML = objects.map((object) => `<div class="scene-item${object.id === selected ? ' selected' : ''}${!object.visible ? ' is-hidden' : ''}${object.locked ? ' is-locked' : ''}">
      <button class="object-select" data-select="${escapeHTML(object.id)}" title="${escapeHTML(object.name)}"><span class="object-icon">${icon(types[object.type].icon)}</span><span class="object-name">${escapeHTML(object.name)}</span></button>
      <span class="object-actions"><button data-object-action="visibility" data-id="${escapeHTML(object.id)}" aria-label="${object.visible ? 'Hide' : 'Show'} ${escapeHTML(object.name)}" title="${object.visible ? 'Hide' : 'Show'} object">${icon(object.visible ? 'eye' : 'eye-off')}</button><button data-object-action="lock" data-id="${escapeHTML(object.id)}" aria-label="${object.locked ? 'Unlock' : 'Lock'} ${escapeHTML(object.name)}" aria-pressed="${object.locked}" title="${object.locked ? 'Unlock' : 'Lock'} object">${icon(object.locked ? 'lock' : 'lock-open')}</button><button data-object-action="settings" data-id="${escapeHTML(object.id)}" aria-label="Settings for ${escapeHTML(object.name)}" title="Object settings">${icon('dots')}</button></span></div>`).join('');
    $('sceneEmpty').hidden = objects.length > 0;
    $('sceneEmpty').querySelector('p').textContent = query ? 'No objects match your search.' : 'Your scene is empty.';
    const button = $('sceneEmpty').querySelector('button'); button.dataset.action = query ? 'clear-search' : 'add-object'; button.textContent = query ? 'Clear search' : 'Add an object';
  }
  function updateRange(element) {
    element.style.setProperty('--range-fill', `${(Number(element.value) - Number(element.min)) / (Number(element.max) - Number(element.min)) * 100}%`);
  }
  function renderInspector() {
    const object = selectedObject();
    $('inspectorObjectName').textContent = object ? object.name : 'No object selected';
    $('materialValue').textContent = object ? materials[object.material].name : '—';
    const values = { objectX: object?.x, objectY: object?.y, objectScale: object ? object.scale * 100 : null, objectRotation: object?.rotation };
    for (const [id, value] of Object.entries(values)) {
      $(id).value = value == null ? '' : Math.round(value * 10) / 10;
      $(id).disabled = !object || object.locked;
    }
    document.querySelectorAll('[data-material]').forEach((button) => { button.setAttribute('aria-pressed', object?.material === button.dataset.material); button.disabled = !object || object.locked; });
    document.querySelectorAll('[data-style]').forEach((button) => button.setAttribute('aria-pressed', state.background.style === button.dataset.style));
    $('backgroundHex').value = state.background.hex;
    $('backgroundOpacity').value = state.background.opacity;
    $('backgroundSwatch').style.background = `#${state.background.hex}`;
    document.querySelectorAll('[data-camera]').forEach((button) => button.setAttribute('aria-pressed', button.dataset.camera === state.camera.mode));
    document.querySelector('.camera-mode').classList.toggle('second-active', state.camera.mode === 'perspective');
    $('distortionRange').value = state.camera.distortion; updateRange($('distortionRange'));
    $('distortionValue').textContent = `${state.camera.distortion}%`;
    $('distortionRange').disabled = state.camera.mode === 'isometric';
    $('animationDuration').value = state.animation.duration; updateRange($('animationDuration'));
    $('animationDurationValue').textContent = `${state.animation.duration} seconds`;
    $('durationLabel').textContent = `${state.animation.duration}s`;
    $('loopAnimation').checked = state.animation.loop;
    document.querySelectorAll('[data-motion]').forEach((button) => { button.classList.toggle('active', state.animation.motion === button.dataset.motion); button.setAttribute('aria-pressed', state.animation.motion === button.dataset.motion); });
  }
  function renderSelection() {
    const object = selectedObject();
    $('selectionLabel').textContent = object?.name || 'Select an object';
    $('sceneCount').textContent = `${state.objects.length} object${state.objects.length === 1 ? '' : 's'}`;
    $('undoButton').disabled = !undoStack.length; $('redoButton').disabled = !redoStack.length;
    $('projectName').textContent = state.name; document.querySelector('.mobile-project-name').textContent = state.name;
    document.title = `${state.name} — Brainwave`;
  }
  function renderReferences() {
    $('attachmentList').hidden = !state.references.length;
    $('attachmentList').innerHTML = state.references.map((reference) => `<span class="attachment-chip">${icon('file-text')}<button data-reference-open="${escapeHTML(reference.id)}" title="Open ${escapeHTML(reference.name)}"><span>${escapeHTML(reference.name)}</span></button><button data-reference-remove="${escapeHTML(reference.id)}" aria-label="Remove ${escapeHTML(reference.name)}">${icon('x')}</button></span>`).join('');
  }
  function renderComments() {
    $('commentsLayer').innerHTML = state.comments.map((comment, index) => `<button class="comment-pin${comment.resolved ? ' resolved' : ''}" data-comment="${escapeHTML(comment.id)}" style="left:${comment.x}%;top:${comment.y}%" title="${escapeHTML(comment.text)}" aria-label="Comment ${index + 1}: ${escapeHTML(comment.text)}">${icon(comment.resolved ? 'check' : 'message')}</button>`).join('');
  }
  function renderCrop() {
    Object.assign($('cropFrame').style, { left: `${crop.x}%`, top: `${crop.y}%`, width: `${crop.width}%`, height: `${crop.height}%` });
  }
  function render() { renderTree(); renderInspector(); renderSelection(); renderReferences(); renderComments(); renderObjects(); renderBackground(); renderView(); }

  const menuPairs = [['projectMenuButton', 'projectMenu', 'down'], ['zoomButton', 'zoomMenu', 'down'], ['addButton', 'addMenu', 'up'], ['inspirationButton', 'inspirationMenu', 'up'], ['modelButton', 'modelMenu', 'up']];
  for (const [trigger, menu] of menuPairs) {
    canvas.append($(menu));
    $(trigger).addEventListener('click', () => toggleMenu(trigger, menu));
  }
  function positionMenu() {
    if (!activeMenu) return;
    const [triggerId, menuId, direction] = activeMenu;
    const trigger = $(triggerId).getBoundingClientRect(); const box = canvas.getBoundingClientRect(); const menu = $(menuId);
    menu.style.maxWidth = `${box.width - 24}px`;
    const left = clamp(trigger.left - box.left, 12, box.width - menu.offsetWidth - 12);
    let top = direction === 'up' ? trigger.top - box.top - menu.offsetHeight - 8 : trigger.bottom - box.top + 8;
    top = clamp(top, 12, box.height - menu.offsetHeight - 12);
    Object.assign(menu.style, { left: `${left}px`, top: `${top}px` });
  }
  function toggleMenu(trigger, menu) {
    const wasOpen = !$(menu).hidden; closeMenus();
    if (wasOpen) return;
    activeMenu = menuPairs.find((pair) => pair[0] === trigger);
    $(menu).hidden = false; $(trigger).setAttribute('aria-expanded', 'true'); positionMenu();
  }
  function closeMenus() {
    menuPairs.forEach(([trigger, menu]) => { $(menu).hidden = true; $(trigger).setAttribute('aria-expanded', 'false'); }); activeMenu = null;
  }
  function switchTab(kind, value) {
    const scene = kind === 'scene';
    const choices = scene ? ['scene', 'assets'] : ['design', 'animation'];
    choices.forEach((choice) => { $(`${choice}View`).hidden = choice !== value; $(`${choice}Tab`).setAttribute('aria-selected', choice === value); });
    $(scene ? 'sceneTab' : 'designTab').parentElement.classList.toggle('second-active', value === choices[1]);
  }
  function closeDrawers() {
    document.querySelectorAll('.drawer-open').forEach((panel) => panel.classList.remove('drawer-open'));
    $('panelScrim').hidden = true;
    document.querySelectorAll('.mobile-header button').forEach((button) => button.setAttribute('aria-expanded', 'false'));
  }
  function togglePanel(side) {
    closeMenus();
    if (matchMedia('(max-width: 1050px)').matches) {
      const panel = document.querySelector(side === 'scene' ? '.scene-panel' : '.inspector'); const open = !panel.classList.contains('drawer-open');
      closeDrawers(); panel.classList.toggle('drawer-open', open); $('panelScrim').hidden = !open;
      document.querySelector(`.mobile-header [data-action="toggle-${side}"]`).setAttribute('aria-expanded', open);
    } else if (side === 'scene') {
      canvas.classList.toggle('scene-collapsed'); document.querySelector('.collapsed-scene-button').hidden = !canvas.classList.contains('scene-collapsed');
    }
  }
  function openDialog({ title, description = '', body, compact = false, buttons = [], setup }) {
    closeDialog(false); closeMenus(); closeDrawers();
    dialogReturnFocus = document.activeElement;
    $('dialogTitle').textContent = title; $('dialogDescription').textContent = description; $('dialogDescription').hidden = !description;
    $('dialogBody').innerHTML = body + '<p class="form-error" id="dialogError" role="alert" hidden></p>';
    $('dialogFooter').replaceChildren();
    buttons.forEach(({ label, kind = 'secondary', onClick }) => {
      const button = document.createElement('button'); button.type = 'button'; button.className = `surface-button ${kind}`; button.textContent = label;
      button.addEventListener('click', async () => {
        if (button.disabled) return;
        try { await onClick(button); } catch (error) { dialogError(error.message || 'This operation could not be completed.'); }
      });
      $('dialogFooter').append(button);
    });
    document.querySelector('.dialog').classList.toggle('compact', compact);
    $('dialogLayer').hidden = false;
    document.querySelector('.workspace').inert = true; document.querySelector('.scene-panel').inert = true; document.querySelector('.inspector').inert = true; document.querySelector('.mobile-header').inert = true;
    setup?.();
    const focus = $('dialogBody').querySelector('input:not([type=checkbox]), textarea') || document.querySelector('.dialog'); focus.focus();
  }
  function closeDialog(restoreFocus = true) {
    if ($('dialogLayer').hidden) return;
    dialogCleanup?.(); dialogCleanup = null;
    $('dialogLayer').hidden = true;
    document.querySelectorAll('.workspace, .scene-panel, .inspector, .mobile-header').forEach((element) => { element.inert = false; });
    if (restoreFocus && dialogReturnFocus?.isConnected) dialogReturnFocus.focus();
    dialogReturnFocus = null;
  }
  function dialogError(text) { if (!$('dialogError')) { notify(text); return; } $('dialogError').textContent = text; $('dialogError').hidden = false; }
  const cancelButton = () => ({ label: 'Cancel', onClick: () => closeDialog() });
  function nameDialog(project = true) {
    const object = project ? null : selectedObject();
    if (!project && !requireObject()) return;
    const name = project ? state.name : object.name;
    openDialog({ title: project ? 'Rename project' : 'Rename object', compact: true, body: `<label class="dialog-label" for="nameInput">Name</label><input class="dialog-input" id="nameInput" maxlength="80" value="${escapeHTML(name)}">`, buttons: [cancelButton(), { label: 'Rename', kind: 'primary', onClick: () => {
      const next = $('nameInput').value.trim(); if (!next) { dialogError('Enter a name.'); return; }
      mutate(() => { if (project) state.name = next; else object.name = next; }); closeDialog();
    } }], setup: () => $('nameInput').select() });
  }
  function objectSettings() {
    const object = selectedObject(); if (!object) { notify('Select an object first.'); return; }
    openDialog({ title: object.name, description: 'Object appearance and layer order.', body: `<div class="dialog-grid"><div><label class="dialog-label" for="objectNameInput">Name</label><input id="objectNameInput" class="dialog-input" maxlength="80" value="${escapeHTML(object.name)}" ${object.locked ? 'disabled' : ''}><div class="dialog-field" style="margin-top:16px"><label class="dialog-label" for="objectOpacity">Opacity</label><input id="objectOpacity" type="range" min="0" max="100" value="${object.opacity}" ${object.locked ? 'disabled' : ''}><output id="objectOpacityValue" class="form-help">${object.opacity}%</output></div></div><div><label class="dialog-label" for="objectLayer">Layer order</label><select id="objectLayer" class="dialog-input" ${object.locked ? 'disabled' : ''}>${state.objects.map((item, index) => `<option value="${index}" ${item.id === object.id ? 'selected' : ''}>${index + 1}${index === 0 ? ' · back' : index === state.objects.length - 1 ? ' · front' : ''}</option>`).join('')}</select><p class="form-help">Higher layers appear in front.</p><button class="text-button" id="unlockObject">${object.locked ? 'Unlock object' : 'Lock object'}</button></div></div>`, buttons: [{ label: 'Delete', kind: 'danger', onClick: () => removeObject(object.id) }, { label: 'Duplicate', onClick: duplicateObject }, { label: 'Done', kind: 'primary', onClick: () => {
      if (object.locked) { closeDialog(); return; }
      const name = $('objectNameInput').value.trim(); if (!name) { dialogError('Enter an object name.'); return; }
      const index = Number($('objectLayer').value);
      mutate(() => { object.name = name; object.opacity = Number($('objectOpacity').value); state.objects.splice(state.objects.indexOf(object), 1); state.objects.splice(index, 0, object); }); closeDialog();
    } }], setup: () => {
      $('objectOpacity').addEventListener('input', () => { updateRange($('objectOpacity')); $('objectOpacityValue').textContent = `${$('objectOpacity').value}%`; }); updateRange($('objectOpacity'));
      $('unlockObject').addEventListener('click', () => { mutate(() => { object.locked = !object.locked; }); objectSettings(); });
    } });
  }
  function objectLibrary() {
    openDialog({ title: 'Add an object', description: 'Choose a starting shape for your scene.', body: `<div class="object-library">${['character', 'sphere', 'cube', 'cone'].map((type) => `<button class="asset-card" data-add="${type}"><span class="asset-preview">${type === 'character' ? '<img src="assets/boy-character.webp" alt="Boy character">' : `<span class="mini-shape mini-${type}"></span>`}</span><span>${types[type].name}</span></button>`).join('')}</div>`, buttons: [{ label: 'Import media', onClick: () => { closeDialog(); $('mediaInput').click(); } }, { label: 'Close', onClick: () => closeDialog() }] });
  }
  function materialLibrary() {
    if (!requireObject()) return;
    openDialog({ title: 'Materials', description: `Apply an appearance to ${selectedObject().name}.`, body: `<div class="material-library">${Object.entries(materials).map(([key, material]) => `<button data-material="${key}" aria-pressed="${selectedObject().material === key}"><span class="material-card ${selectedObject().material === key ? 'active' : ''}">${key === 'original' ? icon('palette') : `<img src="assets/material-${key}.png" alt="">`}</span>${material.name}</button>`).join('')}</div>`, buttons: [{ label: 'Close', onClick: () => closeDialog() }] });
  }
  function styleLibrary() {
    openDialog({ title: 'Scene styles', description: 'Set the atmosphere without changing your objects.', body: `<div class="style-library">${[['neutral', 'Studio'], ['architecture', 'Pastel architecture'], ['dreamscape', 'Dreamscape']].map(([key, label]) => `<button data-style="${key}"><span class="style-card ${key === 'neutral' ? 'neutral-style' : ''}">${key === 'neutral' ? icon('sun') : `<img src="assets/style-${key}.png" alt="">`}</span>${label}</button>`).join('')}</div>`, buttons: [{ label: 'Close', onClick: () => closeDialog() }] });
  }
  function colorDialog() {
    openDialog({ title: 'Background color', description: 'A solid color returns the scene to Studio style.', body: `<div class="color-options">${['F8F7F7', 'E9DED2', 'E6EBDD', 'DDE5EF', 'EBD7DD', '272A2E'].map((hex) => `<button class="color-option${hex === state.background.hex ? ' active' : ''}" style="--swatch:#${hex}" data-color="${hex}" aria-label="#${hex}"></button>`).join('')}</div><div class="dialog-grid"><div><label class="dialog-label" for="colorHexInput">Hex color</label><input id="colorHexInput" class="dialog-input" value="${state.background.hex}" maxlength="7" spellcheck="false"></div><div><label class="dialog-label" for="colorOpacityInput">Opacity (%)</label><input id="colorOpacityInput" class="dialog-input" type="number" min="0" max="100" value="${state.background.opacity}"></div></div>`, buttons: [cancelButton(), { label: 'Apply', kind: 'primary', onClick: () => {
      const hex = parseHex($('colorHexInput').value); const opacity = Number($('colorOpacityInput').value);
      if (!hex) { dialogError('Use a 3- or 6-digit hex color.'); return; }
      if ($('colorOpacityInput').value === '' || !Number.isFinite(opacity) || opacity < 0 || opacity > 100) { dialogError('Opacity must be between 0 and 100.'); return; }
      mutate(() => { state.background = { hex, opacity, style: 'neutral' }; }); closeDialog();
    } }], setup: () => $('dialogBody').querySelectorAll('[data-color]').forEach((button) => button.addEventListener('click', () => { $('colorHexInput').value = button.dataset.color; $('dialogBody').querySelectorAll('[data-color]').forEach((item) => item.classList.toggle('active', item === button)); })) });
  }
  function parseHex(value) {
    const hex = value.trim().replace(/^#/, '').toUpperCase();
    return /^[0-9A-F]{6}$/.test(hex) ? hex : /^[0-9A-F]{3}$/.test(hex) ? [...hex].map((char) => char + char).join('') : null;
  }

  function setTool(value) {
    if (!['select', 'hand', 'comment', 'crop'].includes(value)) return;
    tool = value; viewport.dataset.tool = value; $('cropFrame').hidden = value !== 'crop';
    document.querySelectorAll('[data-tool]').forEach((button) => { button.classList.toggle('active', button.dataset.tool === value); button.setAttribute('aria-pressed', button.dataset.tool === value); });
    renderObjects();
    if (value === 'comment') notify('Click a point in the scene to add a comment.');
  }
  function zoomTo(value) { view.zoom = Math.round(clamp(value, 25, 200)); renderView(); closeMenus(); }
  function fitView() {
    const objects = state.objects.filter((object) => object.visible);
    if (!objects.length) { view = { zoom: 100, panX: 0, panY: 0 }; renderView(); return; }
    const { skew, stretch } = cameraFactors();
    const bounds = { left: Infinity, right: -Infinity, top: Infinity, bottom: -Infinity };
    objects.forEach((object) => {
      const { width, height } = objectSize(object); const angle = object.rotation * Math.PI / 180;
      for (const dx of [-width / 2, width / 2]) for (const dy of [-height / 2, height / 2]) {
        const x = object.x / 100 * dimensions.width + dx * Math.cos(angle) - dy * Math.sin(angle) - dimensions.width / 2;
        const y = object.y / 100 * dimensions.height + dx * Math.sin(angle) + dy * Math.cos(angle) - dimensions.height / 2;
        const px = x + skew * y; const py = stretch * y;
        bounds.left = Math.min(bounds.left, px); bounds.right = Math.max(bounds.right, px); bounds.top = Math.min(bounds.top, py); bounds.bottom = Math.max(bounds.bottom, py);
      }
    });
    const zoom = clamp(Math.min(dimensions.width * .88 / Math.max(1, bounds.right - bounds.left), dimensions.height * .92 / Math.max(1, bounds.bottom - bounds.top)), .25, 2);
    view = { zoom: Math.floor(zoom * 100), panX: -(bounds.left + bounds.right) / 2 * zoom, panY: -(bounds.top + bounds.bottom) / 2 * zoom };
    renderView(); closeMenus();
  }
  function screenToScene(clientX, clientY) {
    const rect = viewport.getBoundingClientRect(); const zoom = view.zoom / 100; const { skew, stretch } = cameraFactors();
    const y = ((clientY - rect.top - dimensions.height / 2 - view.panY) / zoom) / stretch;
    const x = (clientX - rect.left - dimensions.width / 2 - view.panX) / zoom - skew * y;
    return { x: (x + dimensions.width / 2) / dimensions.width * 100, y: (y + dimensions.height / 2) / dimensions.height * 100 };
  }
  viewport.addEventListener('pointerdown', (event) => {
    if (event.button !== 0 && event.button !== 1) return;
    if (event.target.closest('.comment-pin, [data-action="export-crop"]')) return;
    const cropTarget = event.target.closest('#cropFrame');
    const objectNode = event.target.closest('[data-object-id]');
    if (event.button === 1 || tool === 'hand') {
      gesture = { kind: 'pan', id: event.pointerId, startX: event.clientX, startY: event.clientY, beforeView: { ...view } };
    } else if (tool === 'crop' && cropTarget) {
      gesture = { kind: 'crop', id: event.pointerId, handle: event.target.closest('[data-crop-handle]')?.dataset.cropHandle, startX: event.clientX, startY: event.clientY, beforeCrop: { ...crop } };
    } else if (tool === 'comment') {
      if (state.comments.length >= 100) { notify('A scene can contain up to 100 comments.'); return; }
      const point = screenToScene(event.clientX, event.clientY); commentDialog(null, { x: clamp(point.x, 0, 100), y: clamp(point.y, 0, 100) }); return;
    } else if (tool === 'select' && objectNode) {
      selectObject(objectNode.dataset.objectId);
      const object = selectedObject(); if (object.locked) return;
      stopPlayback();
      gesture = { kind: 'object', id: event.pointerId, startX: event.clientX, startY: event.clientY, point: screenToScene(event.clientX, event.clientY), before: historyEntry(), objectId: object.id, initial: { x: object.x, y: object.y } };
    } else if (tool === 'select') { selectObject(null); return; }
    if (gesture) { event.preventDefault(); viewport.setPointerCapture(event.pointerId); viewport.classList.add('dragging'); closeMenus(); }
  });
  viewport.addEventListener('pointermove', (event) => {
    if (!gesture || gesture.id !== event.pointerId) return;
    const dx = event.clientX - gesture.startX; const dy = event.clientY - gesture.startY;
    if (gesture.kind === 'pan') { view.panX = gesture.beforeView.panX + dx; view.panY = gesture.beforeView.panY + dy; renderView(); }
    else if (gesture.kind === 'object') {
      const object = state.objects.find((item) => item.id === gesture.objectId); const point = screenToScene(event.clientX, event.clientY);
      if (!object) return;
      object.x = clamp(gesture.initial.x + point.x - gesture.point.x, 0, 100); object.y = clamp(gesture.initial.y + point.y - gesture.point.y, 0, 100);
      renderObjects(); renderInspector();
    } else {
      const before = gesture.beforeCrop; const x = dx / dimensions.width * 100; const y = dy / dimensions.height * 100;
      if (!gesture.handle) { crop.x = clamp(before.x + x, 0, 100 - before.width); crop.y = clamp(before.y + y, 0, 100 - before.height); }
      else {
        let left = before.x, right = left + before.width, top = before.y, bottom = top + before.height;
        if (gesture.handle.includes('w')) left = clamp(left + x, 0, right - 15); else right = clamp(right + x, left + 15, 100);
        if (gesture.handle.includes('n')) top = clamp(top + y, 0, bottom - 15); else bottom = clamp(bottom + y, top + 15, 100);
        crop = { x: left, y: top, width: right - left, height: bottom - top };
      }
      renderCrop();
    }
  });
  function finishGesture(cancel = false) {
    if (!gesture) return;
    const previous = gesture; gesture = null;
    if (previous.kind === 'object') { if (cancel) state = previous.before.state; else pushHistory(previous.before); }
    if (cancel && previous.kind === 'crop') crop = previous.beforeCrop;
    if (cancel && previous.kind === 'pan') view = previous.beforeView;
    if (viewport.hasPointerCapture(previous.id)) viewport.releasePointerCapture(previous.id);
    viewport.classList.remove('dragging'); render();
  }
  viewport.addEventListener('pointerup', () => finishGesture());
  viewport.addEventListener('pointercancel', () => finishGesture(true));
  viewport.addEventListener('lostpointercapture', () => { if (gesture) finishGesture(); });
  viewport.addEventListener('wheel', (event) => { event.preventDefault(); zoomTo(view.zoom * (event.deltaY > 0 ? .93 : 1.07)); }, { passive: false });

  function motionAt(time, animation = state.animation) {
    const phase = time / (animation.duration * 1000) * Math.PI * 2;
    if (animation.motion === 'float') return { x: 0, y: -(1 - Math.cos(phase)) * 9, rotation: 0, sx: 1, sy: 1 };
    if (animation.motion === 'sway') return { x: 0, y: 0, rotation: Math.sin(phase) * 1.6, sx: 1, sy: 1 };
    return { x: 0, y: 0, rotation: 0, sx: 1 + (1 - Math.cos(phase)) * .004, sy: 1 + (1 - Math.cos(phase)) * .008 };
  }
  function renderMotion() {
    const motion = motionAt(playback.elapsed);
    for (const node of nodes.values()) node.firstElementChild.style.transform = `translate(${motion.x}px,${motion.y}px) rotate(${motion.rotation}deg) scale(${motion.sx},${motion.sy})`;
  }
  function playbackUI() {
    $('playButton').setAttribute('aria-pressed', playback.playing);
    $('playButton').setAttribute('aria-label', playback.playing ? 'Pause animation' : 'Play animation');
    $('playButton').innerHTML = icon(playback.playing ? 'player-pause' : 'player-play');
    $('animationPlayLabel').textContent = playback.playing ? 'Pause animation' : 'Preview animation';
    document.querySelector('.animation-preview > .ti').className = `ti ti-player-${playback.playing ? 'pause' : 'play'}`;
  }
  function tick(now) {
    if (!playback.playing) return;
    playback.elapsed = now - playback.started;
    if (!state.animation.loop && playback.elapsed >= state.animation.duration * 1000) { stopPlayback(); return; }
    renderMotion(); playback.frame = requestAnimationFrame(tick);
  }
  function stopPlayback(reset = true) {
    cancelAnimationFrame(playback.frame); playback.playing = false;
    if (reset) playback.elapsed = 0;
    for (const node of nodes.values()) { const video = node.querySelector('video'); if (video) { video.pause(); if (reset && video.readyState >= 1) video.currentTime = 0; } }
    renderMotion(); playbackUI();
  }
  function togglePlayback() {
    if (playback.playing) { stopPlayback(false); return; }
    if (!state.objects.some((object) => object.visible)) { notify('Add or show an object to preview animation.'); return; }
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { notify('Animation is paused by your reduced-motion preference.'); return; }
    playback.playing = true; playback.started = performance.now() - playback.elapsed;
    renderObjects(); playbackUI(); playback.frame = requestAnimationFrame(tick);
  }
  document.addEventListener('visibilitychange', () => { if (document.hidden) { stopPlayback(false); stopVoice(); } });
  matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (event) => { if (event.matches) stopPlayback(); });

  function commentDialog(id, point) {
    const comment = state.comments.find((item) => item.id === id);
    if (!comment) {
      openDialog({ title: 'Add a comment', compact: true, body: '<label class="dialog-label" for="commentInput">Comment</label><textarea class="dialog-input" id="commentInput" maxlength="1000" placeholder="What would you like to change?"></textarea>', buttons: [cancelButton(), { label: 'Add comment', kind: 'primary', onClick: () => {
        const text = $('commentInput').value.trim(); if (!text) { dialogError('Write a comment first.'); return; }
        mutate(() => { state.comments.push({ id: uid(), ...point, text, resolved: false }); }); closeDialog(); setTool('select');
      } }] }); return;
    }
    openDialog({ title: comment.resolved ? 'Resolved comment' : 'Scene comment', compact: true, body: `<p class="comment-text">${escapeHTML(comment.text)}</p>`, buttons: [{ label: 'Delete', kind: 'danger', onClick: () => { mutate(() => { state.comments = state.comments.filter((item) => item.id !== id); }); closeDialog(); } }, { label: 'Edit', onClick: () => {
      openDialog({ title: 'Edit comment', compact: true, body: `<textarea class="dialog-input" id="commentInput" maxlength="1000" aria-label="Comment">${escapeHTML(comment.text)}</textarea>`, buttons: [cancelButton(), { label: 'Apply', kind: 'primary', onClick: () => { const text = $('commentInput').value.trim(); if (!text) { dialogError('Write a comment first.'); return; } mutate(() => { comment.text = text; }); closeDialog(); } }] });
    } }, { label: comment.resolved ? 'Reopen' : 'Resolve', kind: 'primary', onClick: () => { mutate(() => { comment.resolved = !comment.resolved; }); closeDialog(); } }] });
  }

  function readDataURL(file) {
    return new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = () => reject(new Error('The file could not be read.')); reader.onabort = () => reject(new Error('File reading was interrupted.')); reader.readAsDataURL(file); });
  }
  function loadImage(src) {
    if (imageCache.has(src)) return imageCache.get(src);
    const promise = new Promise((resolve, reject) => {
      const image = new Image(); const timer = setTimeout(() => reject(new Error('The image took too long to load.')), 12000);
      image.onload = () => { clearTimeout(timer); resolve(image); }; image.onerror = () => { clearTimeout(timer); reject(new Error('The image format could not be decoded.')); }; image.src = src;
    });
    imageCache.set(src, promise); promise.catch(() => imageCache.delete(src)); return promise;
  }
  async function mediaObject(file) {
    if (file.size > MAX_FILE) throw new Error(`${file.name}: use a file smaller than 10 MB.`);
    if (!['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'video/mp4', 'video/webm'].includes(file.type)) throw new Error(`${file.name}: use PNG, JPEG, WebP, GIF, MP4 or WebM.`);
    const src = await readDataURL(file); const type = file.type.startsWith('video/') ? 'video' : 'image';
    let width, height;
    if (type === 'image') { const image = await loadImage(src); width = image.naturalWidth; height = image.naturalHeight; }
    else {
      const size = await new Promise((resolve, reject) => {
        const video = document.createElement('video');
        const cleanup = () => { clearTimeout(timer); video.removeAttribute('src'); video.load(); };
        const timer = setTimeout(() => { cleanup(); reject(new Error(`${file.name}: video decoding timed out.`)); }, 12000);
        video.onloadedmetadata = () => { const result = { width: video.videoWidth, height: video.videoHeight }; cleanup(); resolve(result); };
        video.onerror = () => { cleanup(); reject(new Error(`${file.name}: this video codec is not supported.`)); };
        video.src = src; video.load();
      }); width = size.width; height = size.height;
    }
    if (!width || !height || width / height > 10 || width / height < .1 || width * height > 40000000) throw new Error(`${file.name}: use an image or video with a supported size and aspect ratio.`);
    return makeObject(type, { name: file.name.slice(0, 80), src, ratio: width / height, x: 40, y: 50 });
  }
  function projectBytes(next) { return new Blob([JSON.stringify(next)]).size; }
  async function importMedia(files) {
    if (importBusy) { notify('Please wait for the current import.'); return; }
    if (!files.length) return;
    if (files.length + state.objects.length > MAX_OBJECTS) { notify('A scene can contain up to 100 objects.'); return; }
    const epoch = projectEpoch; importBusy = true;
    $('mediaInput').disabled = true; notify(`Importing ${files.length} file${files.length === 1 ? '' : 's'}…`);
    try {
      const objects = [];
      for (const file of files) objects.push(await mediaObject(file));
      if (epoch !== projectEpoch) return;
      if (state.objects.length + objects.length > MAX_OBJECTS || projectBytes({ ...state, objects: [...state.objects, ...objects] }) > MAX_PROJECT) throw new Error('The project is too large. Remove some media before importing.');
      objects.forEach((object, index) => { object.x = 35 + index % 5 * 8; });
      mutate(() => { state.objects.push(...objects); selected = objects[objects.length - 1].id; });
      setTool('select'); closeMenus(); closeDrawers(); notify(`Added ${objects.length} file${objects.length === 1 ? '' : 's'} to the scene.`);
    } catch (error) { notify(error.message); }
    finally { importBusy = false; $('mediaInput').disabled = false; $('mediaInput').value = ''; }
  }
  async function importReferences(files) {
    if (importBusy) { notify('Please wait for the current import.'); return; }
    if (!files.length) return;
    if (files.length + state.references.length > 20) { notify('A project can contain up to 20 reference files.'); return; }
    const epoch = projectEpoch; importBusy = true;
    try {
      const references = [];
      for (const file of files) {
        if (file.size > MAX_FILE) throw new Error(`${file.name}: use a file smaller than 10 MB.`);
        const extension = file.name.split('.').pop().toLowerCase();
        if (!['txt', 'md', 'json', 'pdf', 'doc', 'docx', 'obj', 'gltf', 'glb'].includes(extension)) throw new Error(`${file.name}: this reference format is not supported.`);
        const text = ['txt', 'md', 'json', 'obj', 'gltf'].includes(extension) ? (await file.text()).slice(0, 100000) : '';
        if (extension === 'json') {
          try { const data = JSON.parse(text); if (data.app === 'brainwave-studio') { if (files.length !== 1) throw new Error('Open project files one at a time.'); await openProjectFile(file); return; } }
          catch (error) { if (!(error instanceof SyntaxError)) throw error; }
        }
        references.push({ id: uid(), name: file.name.slice(0, 80), text, src: await readDataURL(file), extension });
      }
      if (epoch !== projectEpoch) return;
      if (projectBytes({ ...state, references: [...state.references, ...references] }) > MAX_PROJECT) throw new Error('The project exceeds the 30 MB limit.');
      mutate(() => { state.references.push(...references); });
      notify('Reference files attached. Open a file chip to inspect it.'); closeMenus();
    } catch (error) { notify(error.message); }
    finally { importBusy = false; $('fileInput').value = ''; }
  }
  function openReference(id) {
    const reference = state.references.find((item) => item.id === id); if (!reference) return;
    openDialog({ title: reference.name, description: reference.text ? 'Reference file contents' : 'Attached reference file', body: reference.text ? `<pre class="comment-text">${escapeHTML(reference.text)}</pre>` : `<p>This file is attached to your project. Download it to open in a compatible application.</p>`, buttons: [{ label: 'Close', onClick: () => closeDialog() }, { label: 'Download file', kind: 'primary', onClick: () => downloadDataURL(reference.src, reference.name) }] });
  }
  function download(blob, filename) {
    const link = document.createElement('a'); const url = URL.createObjectURL(blob); link.href = url; link.download = filename; link.hidden = true; canvas.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 30000);
  }
  async function downloadDataURL(src, name) { const response = await fetch(src); download(await response.blob(), name); }
  function filename(extension) { return `${state.name.replace(/[<>:"/\\|?*\x00-\x1F]/g, '-').trim() || 'brainwave-scene'}.${extension}`; }
  function downloadProject() {
    const payload = { app: 'brainwave-studio', version: 1, scene: state };
    download(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }), filename('brainwave.json'));
    notify('Project file downloaded, including media and comments.');
  }
  // 导入先完整验证，再原子替换。仅接受内置素材和嵌入媒体，不加载文件中的远程 URL。
  function validateProject(data) {
    const fail = () => { throw new Error('This is not a supported Brainwave project file.'); };
    if (data?.app !== 'brainwave-studio' || data.version !== 1 || !data.scene || typeof data.scene !== 'object') fail();
    const scene = data.scene;
    const text = (value, max = 80) => typeof value === 'string' && value.trim().length > 0 && value.length <= max;
    const number = (value, min, max) => typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max;
    const bool = (value) => typeof value === 'boolean';
    const ids = new Set();
    const id = (value) => { if (!text(value, 100) || ids.has(value)) fail(); ids.add(value); return value; };
    if (!text(scene.name) || !Array.isArray(scene.objects) || scene.objects.length > MAX_OBJECTS || !Array.isArray(scene.comments) || scene.comments.length > 100 || !Array.isArray(scene.references) || scene.references.length > 20) fail();
    const objects = scene.objects.map((object) => {
      if (!object || !Object.hasOwn(types, object.type) || !text(object.name) || !number(object.x, 0, 100) || !number(object.y, 0, 100) || !number(object.scale, .1, 3) || !number(object.rotation, -180, 180) || !number(object.opacity, 0, 100) || !number(object.ratio, .1, 10) || !bool(object.visible) || !bool(object.locked) || !Object.hasOwn(materials, object.material)) fail();
      const next = { id: id(object.id), type: object.type, name: object.name, x: object.x, y: object.y, scale: object.scale, rotation: object.rotation, opacity: object.opacity, ratio: object.ratio, visible: object.visible, locked: object.locked, material: object.material };
      if (['image', 'video'].includes(object.type)) {
        const pattern = object.type === 'image' ? /^data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+/=]+$/ : /^data:video\/(mp4|webm);base64,[A-Za-z0-9+/=]+$/;
        if (typeof object.src !== 'string' || object.src.length > MAX_FILE * 1.4 || !pattern.test(object.src)) fail(); next.src = object.src;
      } else next.ratio = types[object.type].ratio;
      return next;
    });
    const comments = scene.comments.map((comment) => { if (!comment || !text(comment.text, 1000) || !number(comment.x, 0, 100) || !number(comment.y, 0, 100) || !bool(comment.resolved)) fail(); return { id: id(comment.id), text: comment.text, x: comment.x, y: comment.y, resolved: comment.resolved }; });
    const references = scene.references.map((reference) => {
      if (!reference || !text(reference.name) || typeof reference.text !== 'string' || reference.text.length > 100000 || !['txt', 'md', 'json', 'pdf', 'doc', 'docx', 'obj', 'gltf', 'glb'].includes(reference.extension) || typeof reference.src !== 'string' || reference.src.length > MAX_FILE * 1.4 || !/^data:[a-zA-Z0-9.+/-]*;base64,[A-Za-z0-9+/=]*$/.test(reference.src)) fail();
      return { id: id(reference.id), name: reference.name, text: reference.text, src: reference.src, extension: reference.extension };
    });
    const { background, camera, animation } = scene;
    if (!background || !/^[0-9A-Fa-f]{6}$/.test(background.hex) || !number(background.opacity, 0, 100) || !['neutral', 'architecture', 'dreamscape'].includes(background.style) || !camera || !['isometric', 'perspective'].includes(camera.mode) || !number(camera.distortion, 0, 100) || !animation || !['idle', 'float', 'sway'].includes(animation.motion) || !number(animation.duration, 2, 16) || !bool(animation.loop)) fail();
    return { name: scene.name, objects, comments, references, background: { hex: background.hex.toUpperCase(), opacity: background.opacity, style: background.style }, camera: { mode: camera.mode, distortion: camera.distortion }, animation: { motion: animation.motion, duration: animation.duration, loop: animation.loop } };
  }
  async function openProjectFile(file) {
    if (!file) return;
    const epoch = projectEpoch;
    try {
      if (file.size > MAX_PROJECT) throw new Error('Use a project smaller than 30 MB.');
      const next = validateProject(JSON.parse(await file.text()));
      for (const object of next.objects.filter((item) => item.type === 'image')) await loadImage(object.src);
      if (epoch !== projectEpoch) return;
      replaceProject(next); closeDialog(); notify('Project opened.');
    } catch (error) { notify(error instanceof SyntaxError ? 'This file does not contain valid JSON.' : error.message); }
    finally { $('projectInput').value = ''; }
  }
  $('mediaInput').addEventListener('change', () => importMedia([...$('mediaInput').files]));
  $('fileInput').addEventListener('change', () => importReferences([...$('fileInput').files]));
  $('projectInput').addEventListener('change', () => openProjectFile($('projectInput').files[0]));
  viewport.addEventListener('dragover', (event) => { event.preventDefault(); });
  viewport.addEventListener('drop', (event) => { event.preventDefault(); const files = [...event.dataTransfer.files]; if (files.length === 1 && files[0].name.endsWith('.json')) openProjectFile(files[0]); else importMedia(files); });

  async function composite({ scale = 1, transparent = false, cropped = false } = {}) {
    const snapshot = clone(state); const savedView = { ...view }; const sizeSnapshot = { ...dimensions };
    const width = sizeSnapshot.width, height = sizeSnapshot.height;
    const motion = motionAt(playback.elapsed, snapshot.animation);
    const cropRect = cropped ? { x: crop.x / 100 * width, y: crop.y / 100 * height, width: crop.width / 100 * width, height: crop.height / 100 * height } : { x: 0, y: 0, width, height };
    const output = document.createElement('canvas'); output.width = Math.max(1, Math.round(cropRect.width * scale)); output.height = Math.max(1, Math.round(cropRect.height * scale));
    const ctx = output.getContext('2d'); ctx.scale(scale, scale); ctx.translate(-cropRect.x, -cropRect.y);
    drawBackground(ctx, width, height, snapshot.background, transparent);
    ctx.save(); ctx.translate(width / 2 + savedView.panX, height / 2 + savedView.panY); ctx.scale(savedView.zoom / 100, savedView.zoom / 100);
    const { skew, stretch } = cameraFactors(snapshot.camera); ctx.transform(1, 0, skew, stretch, 0, 0); ctx.translate(-width / 2, -height / 2);
    for (const object of snapshot.objects.filter((item) => item.visible)) {
      const media = object.type === 'video' ? nodes.get(object.id)?.querySelector('video') : await loadImage(objectSource(object));
      if (!media || (object.type === 'video' && media.readyState < 2)) throw new Error(`${object.name} is still loading. Try exporting again.`);
      const size = objectSize(object, sizeSnapshot);
      ctx.save(); ctx.translate(object.x / 100 * width, object.y / 100 * height); ctx.rotate(object.rotation * Math.PI / 180);
      ctx.translate(motion.x, motion.y); ctx.rotate(motion.rotation * Math.PI / 180); ctx.scale(motion.sx, motion.sy);
      ctx.globalAlpha = object.opacity / 100; ctx.filter = materials[object.material].filter;
      ctx.drawImage(media, -size.width / 2, -size.height / 2, size.width, size.height); ctx.restore();
    }
    ctx.restore(); return output;
  }
  async function exportDialog(cropped = false) {
    stopPlayback(false);
    let format = 'png'; let previewToken = 0; let dialogOpen = true;
    openDialog({ title: cropped ? 'Export crop' : 'Export scene', description: 'Download the current view, without editor controls or comments.', body: '<div class="dialog-grid"><div class="export-preview" id="exportPreview"></div><div><label class="dialog-label">Format</label><div class="choice-row"><button class="choice-button active" data-export-format="png">PNG</button><button class="choice-button" data-export-format="jpeg">JPEG</button></div><div class="dialog-field"><label class="dialog-label" for="exportScale">Resolution</label><select class="dialog-input" id="exportScale"><option value="1">1× · Original size</option><option value="2" selected>2× · High resolution</option><option value="3">3× · Extra detail</option></select><span id="exportDimensions" class="form-help"></span></div><label class="switch-row"><span>Transparent background</span><input type="checkbox" role="switch" id="exportTransparent"><span class="switch" aria-hidden="true"></span></label></div></div>', buttons: [{ label: 'Project file', onClick: downloadProject }, { label: 'Download image', kind: 'primary', onClick: async (button) => {
      if (exportBusy) return;
      exportBusy = true; button.disabled = true; button.textContent = 'Exporting…';
      try {
        const transparent = format === 'png' && $('exportTransparent').checked;
        const output = await composite({ scale: Number($('exportScale').value), transparent, cropped });
        if (format === 'jpeg') {
          const ctx = output.getContext('2d'); ctx.save(); ctx.globalCompositeOperation = 'destination-over'; ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, output.width, output.height); ctx.restore();
        }
        const blob = await new Promise((resolve) => output.toBlob(resolve, `image/${format}`, .94));
        if (!blob) throw new Error('The image could not be encoded.');
        download(blob, filename(cropped ? `crop.${format === 'jpeg' ? 'jpg' : 'png'}` : format === 'jpeg' ? 'jpg' : 'png'));
        if (dialogOpen) closeDialog(); notify('Image downloaded.');
      } finally { exportBusy = false; button.disabled = false; button.textContent = 'Download image'; }
    } }], setup: () => {
      dialogCleanup = () => { dialogOpen = false; previewToken++; };
      const update = async () => {
        const token = ++previewToken;
        try {
          const surface = await composite({ cropped, transparent: format === 'png' && $('exportTransparent').checked });
          if (!dialogOpen || token !== previewToken) return;
          if (format === 'jpeg') { const ctx = surface.getContext('2d'); ctx.save(); ctx.globalCompositeOperation = 'destination-over'; ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, surface.width, surface.height); ctx.restore(); }
          $('exportPreview').replaceChildren(surface);
          $('exportDimensions').textContent = `${surface.width * Number($('exportScale').value)} × ${surface.height * Number($('exportScale').value)} px`;
        } catch (error) { if (dialogOpen && token === previewToken) dialogError(error.message); }
      };
      $('dialogBody').querySelectorAll('[data-export-format]').forEach((button) => button.addEventListener('click', () => {
        format = button.dataset.exportFormat;
        $('dialogBody').querySelectorAll('[data-export-format]').forEach((item) => item.classList.toggle('active', item === button));
        $('exportTransparent').disabled = format === 'jpeg'; update();
      }));
      $('exportScale').addEventListener('change', update); $('exportTransparent').addEventListener('change', update); update();
    } });
  }

  function serviceDialog(kind = 'AI generation') {
    const ai = kind === 'AI generation';
    openDialog({ title: ai ? model : 'Share project', description: ai ? 'A generation service is required for custom 3D content.' : 'Send an editable project file to another person.', body: `<div class="connection-card">${icon(ai ? 'plug-connected' : 'file-export')}<div><strong>${ai ? 'Connect a generation service' : 'Share an editable file'}</strong><p>${ai ? 'Cloud generation is not connected. You can still apply scene presets and edit every object.' : 'Project files include your scene, media, settings and comments. Live collaboration requires a connected workspace.'}</p></div></div>`, buttons: [{ label: 'Close', onClick: () => closeDialog() }, { label: ai ? 'Use scene presets' : 'Download project', kind: 'primary', onClick: () => { if (ai) { model = 'Scene presets'; $('modelLabel').textContent = model; closeDialog(); } else downloadProject(); } }] });
  }
  function collaboratorsDialog() {
    openDialog({ title: 'Project contributors', description: 'Project credits. Live presence requires a connected workspace.', body: '<div class="collaborator-row"><img src="assets/avatar-designer.webp" alt="Alex Morgan"><div><strong>Alex Morgan</strong><small>Scene design</small></div><span class="collaborator-role">Designer</span></div><div class="collaborator-row"><img src="assets/avatar-artist.webp" alt="Jamie Chen"><div><strong>Jamie Chen</strong><small>Character art</small></div><span class="collaborator-role">Artist</span></div>', buttons: [{ label: 'Close', onClick: () => closeDialog() }, { label: 'Share project file', kind: 'primary', onClick: () => serviceDialog('share') }] });
  }
  const presets = [
    { name: 'Clay studio', words: /clay|terracotta|陶|黏土|粘土|赤陶/i, material: 'clay', style: 'neutral', hex: 'E9DED2', motion: 'idle' },
    { name: 'Pastel architecture', words: /architect|pastel|建筑|粉彩/i, material: 'original', style: 'architecture', hex: 'F8F7F7', motion: 'sway' },
    { name: 'After sunset', words: /dream|sunset|pink|梦|日落|落日|粉色/i, material: 'original', style: 'dreamscape', hex: 'EBD7DD', motion: 'float' },
  ];
  $('promptForm').addEventListener('submit', (event) => {
    event.preventDefault();
    if (model !== 'Scene presets') { serviceDialog(); return; }
    const prompt = $('promptInput').value.trim();
    if (!prompt) { notify('Describe a scene or choose an inspiration.'); $('promptInput').focus(); return; }
    const chosen = presets.find((preset) => preset.words.test(prompt));
    if (!chosen) {
      openDialog({ title: 'Choose a scene preset', description: 'Custom requests need a connected generation service. Choose an atmosphere to continue.', body: `<p class="prompt-summary">${escapeHTML(prompt)}</p><div class="choice-row">${presets.map((preset, index) => `<button class="choice-button" data-preset="${index}">${preset.name}</button>`).join('')}</div>`, buttons: [{ label: 'Keep editing', onClick: () => closeDialog() }] }); return;
    }
    applyPreset(chosen);
  });
  function applyPreset(preset) {
    let target = selectedObject() || state.objects.find((object) => !object.locked);
    if (!target && state.objects.length) { notify('Select an unlocked object before applying a preset.'); return; }
    if (target?.locked) { notify('Unlock the selected object before applying a preset.'); return; }
    mutate(() => {
      if (!target) { target = makeObject('character'); state.objects.push(target); selected = target.id; }
      target.material = preset.material;
      state.background = { hex: preset.hex, opacity: 100, style: preset.style };
      state.animation.motion = preset.motion;
    });
    stopPlayback(); closeDialog(); notify(`${preset.name} applied.`);
  }
  function stopVoice() {
    recognition?.abort(); recognition = null;
    document.querySelector('.microphone-button').classList.remove('listening');
    document.querySelector('.microphone-button').setAttribute('aria-label', 'Voice input');
  }
  function voiceInput() {
    if (recognition) { recognition.stop(); return; }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { notify('Voice input is not available in this browser. Type your scene description instead.'); return; }
    const instance = new SpeechRecognition();
    const before = $('promptInput').value;
    instance.lang = navigator.language || 'en-US'; instance.interimResults = true; instance.continuous = false;
    instance.onresult = (event) => {
      if (recognition !== instance) return;
      const transcript = [...event.results].map((result) => result[0].transcript).join(' ');
      $('promptInput').value = `${before}${before ? ' ' : ''}${transcript}`.slice(0, 1200);
    };
    instance.onerror = (event) => { if (recognition === instance && event.error !== 'aborted') notify(event.error === 'not-allowed' ? 'Microphone access was denied. Your typed text is unchanged.' : 'Voice input could not complete. You can keep typing.'); };
    instance.onend = () => { if (recognition === instance) { recognition = null; document.querySelector('.microphone-button').classList.remove('listening'); document.querySelector('.microphone-button').setAttribute('aria-label', 'Voice input'); } };
    // 浏览器语音识别可能使用平台服务：用户确认后才启用麦克风。
    openDialog({ title: 'Voice input', compact: true, body: '<p>Your browser may send audio to its speech recognition service. Start only if you want to use that service.</p>', buttons: [{ label: 'Cancel', onClick: () => { recognition = null; closeDialog(); } }, { label: 'Start microphone', kind: 'primary', onClick: () => {
      closeDialog(); try { recognition = instance; instance.start(); document.querySelector('.microphone-button').classList.add('listening'); document.querySelector('.microphone-button').setAttribute('aria-label', 'Stop voice input'); } catch { recognition = null; notify('The microphone could not be started.'); }
    } }] });
  }

  function finishRange() {
    if (!rangeBefore) return;
    pushHistory(rangeBefore); rangeBefore = null; render();
  }
  for (const [id, key, target] of [['distortionRange', 'distortion', 'camera'], ['animationDuration', 'duration', 'animation']]) {
    $(id).addEventListener('input', () => {
      if (!rangeBefore) rangeBefore = historyEntry();
      state[target][key] = Number($(id).value);
      if (target === 'animation') stopPlayback();
      renderInspector(); renderView();
    });
    $(id).addEventListener('change', finishRange); $(id).addEventListener('blur', finishRange);
  }
  for (const [id, key, factor] of [['objectX', 'x', 1], ['objectY', 'y', 1], ['objectScale', 'scale', .01], ['objectRotation', 'rotation', 1]]) {
    $(id).addEventListener('change', () => {
      const object = requireObject(); const value = Number($(id).value);
      if (!object) { renderInspector(); return; }
      if ($(id).value === '' || !Number.isFinite(value) || value < Number($(id).min) || value > Number($(id).max)) { notify(`Enter a value between ${$(id).min} and ${$(id).max}.`); renderInspector(); return; }
      mutate(() => { object[key] = value * factor; });
    });
  }
  $('backgroundHex').addEventListener('change', () => {
    const hex = parseHex($('backgroundHex').value); if (!hex) { notify('Use a 3- or 6-digit hex color.'); renderInspector(); return; }
    mutate(() => { state.background.hex = hex; state.background.style = 'neutral'; });
  });
  $('backgroundOpacity').addEventListener('change', () => {
    const value = Number($('backgroundOpacity').value);
    if ($('backgroundOpacity').value === '' || !Number.isFinite(value) || value < 0 || value > 100) { notify('Opacity must be between 0 and 100.'); renderInspector(); return; }
    mutate(() => { state.background.opacity = value; });
  });
  $('loopAnimation').addEventListener('change', () => mutate(() => { state.animation.loop = $('loopAnimation').checked; }));
  $('sceneSearch').addEventListener('input', renderTree);
  const actions = {
    'toggle-scene': () => togglePanel('scene'), 'toggle-inspector': () => togglePanel('inspector'),
    'rename-project': () => nameDialog(), 'duplicate-project': () => { const next = clone(state); next.name = `${next.name} copy`.slice(0, 80); next.objects.forEach((object) => { object.id = uid(); }); next.comments.forEach((comment) => { comment.id = uid(); }); next.references.forEach((reference) => { reference.id = uid(); }); replaceProject(next); notify('Project copy created. Download a project file to keep it.'); },
    'new-project': () => openDialog({ title: 'New project', description: 'Start with an empty scene. You can undo this change.', compact: true, body: '<label class="dialog-label" for="newProjectName">Project name</label><input id="newProjectName" class="dialog-input" maxlength="80" value="Untitled scene">', buttons: [cancelButton(), { label: 'Create project', kind: 'primary', onClick: () => { const name = $('newProjectName').value.trim(); if (!name) { dialogError('Enter a project name.'); return; } const next = initial(); next.name = name; next.objects = []; replaceProject(next); closeDialog(); } }] }),
    'open-project': () => { closeMenus(); $('projectInput').click(); }, 'download-project': downloadProject,
    'clear-search': () => { $('sceneSearch').value = ''; renderTree(); }, 'play': togglePlayback,
    'undo': () => travel('undo'), 'redo': () => travel('redo'), 'fit-view': fitView,
    'export': () => exportDialog(), 'export-crop': () => exportDialog(true),
    'add-object': objectLibrary, 'import-media': () => { closeMenus(); $('mediaInput').click(); }, 'import-file': () => { closeMenus(); $('fileInput').click(); },
    'materials': materialLibrary, 'styles': styleLibrary, 'background': colorDialog, 'object-settings': objectSettings,
    'camera': () => { mutate(() => { state.camera = { mode: 'isometric', distortion: 40 }; }); fitView(); },
    'animation-settings': () => { switchTab('inspector', 'animation'); if (matchMedia('(max-width: 1050px)').matches) togglePanel('inspector'); },
    'reset-animation': () => { stopPlayback(); mutate(() => { state.animation = { motion: 'idle', duration: 8, loop: true }; }); },
    'toggle-grid': () => { $('viewportGrid').hidden = !$('viewportGrid').hidden; $('gridButton').setAttribute('aria-pressed', !$('viewportGrid').hidden); },
    'collaborators': collaboratorsDialog, 'share': () => serviceDialog('share'), 'voice': voiceInput, 'close-dialog': () => closeDialog(),
  };
  canvas.addEventListener('click', (event) => {
    const button = event.target.closest('button, .scrim'); if (!button || button.disabled) return;
    const data = button.dataset;
    if (data.action && actions[data.action]) { actions[data.action](); return; }
    if (data.select) { selectObject(data.select); return; }
    if (data.objectId && tool === 'select') { selectObject(data.objectId); return; }
    if (data.objectAction) {
      const object = state.objects.find((item) => item.id === data.id); if (!object) return;
      if (data.objectAction === 'settings') { selected = object.id; render(); objectSettings(); }
      else mutate(() => { if (data.objectAction === 'visibility') object.visible = !object.visible; if (data.objectAction === 'lock') object.locked = !object.locked; });
    }
    if (data.add) addObject(data.add);
    if (data.tool) setTool(data.tool);
    if (data.sceneTab) switchTab('scene', data.sceneTab);
    if (data.inspectorTab) switchTab('inspector', data.inspectorTab);
    if (data.zoom) zoomTo(Number(data.zoom));
    if (data.material) applyMaterial(data.material);
    if (data.style) applyStyle(data.style);
    if (data.camera) mutate(() => { state.camera.mode = data.camera; });
    if (data.motion) { stopPlayback(); mutate(() => { state.animation.motion = data.motion; }); }
    if (data.prompt) { $('promptInput').value = data.prompt; closeMenus(); $('promptInput').focus(); }
    if (data.model) { model = data.model; $('modelLabel').textContent = model; closeMenus(); if (model !== 'Scene presets') serviceDialog(); }
    if (data.comment) commentDialog(data.comment);
    if (data.referenceRemove) mutate(() => { state.references = state.references.filter((item) => item.id !== data.referenceRemove); });
    if (data.referenceOpen) openReference(data.referenceOpen);
    if (data.preset != null) applyPreset(presets[Number(data.preset)]);
  });
  document.addEventListener('pointerdown', (event) => {
    if (activeMenu && !event.target.closest('.popover') && !menuPairs.some(([id]) => $(id).contains(event.target))) closeMenus();
  });
  $('panelScrim').addEventListener('click', closeDrawers);
  document.addEventListener('keydown', (event) => {
    const editing = event.target.matches('input, textarea, select, [contenteditable=true]'); const mod = event.ctrlKey || event.metaKey;
    if (event.key === 'Escape') { finishGesture(true); stopVoice(); if (!$('dialogLayer').hidden) closeDialog(); else { closeMenus(); closeDrawers(); setTool('select'); } return; }
    if (!$('dialogLayer').hidden) {
      if (event.key === 'Tab') {
        const focusable = [...$('dialogLayer').querySelectorAll('button:not(:disabled), input:not(:disabled), textarea:not(:disabled), select:not(:disabled), [tabindex="0"]')].filter((element) => element.getClientRects().length);
        const first = focusable[0], last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
      return;
    }
    if (mod && event.key === 'Enter') { event.preventDefault(); $('promptForm').requestSubmit(); return; }
    if (mod && event.key.toLowerCase() === 's') { event.preventDefault(); downloadProject(); return; }
    if (mod && event.key.toLowerCase() === 'k') { event.preventDefault(); if (matchMedia('(max-width: 1050px)').matches && !document.querySelector('.scene-panel').classList.contains('drawer-open')) togglePanel('scene'); switchTab('scene', 'scene'); $('sceneSearch').focus(); return; }
    if (editing) return;
    if (mod && event.key.toLowerCase() === 'z') { event.preventDefault(); travel(event.shiftKey ? 'redo' : 'undo'); return; }
    if (mod && event.key.toLowerCase() === 'y') { event.preventDefault(); travel('redo'); return; }
    if (mod && event.key.toLowerCase() === 'd') { event.preventDefault(); duplicateObject(); return; }
    if (event.key === 'Delete' || event.key === 'Backspace') { if (selectedObject()) { event.preventDefault(); removeObject(selected); } return; }
    if (event.key === ' ') { event.preventDefault(); togglePlayback(); return; }
    if (event.key.toLowerCase() === 'v') setTool('select'); if (event.key.toLowerCase() === 'h') setTool('hand'); if (event.key.toLowerCase() === 'c') setTool('comment'); if (event.key.toLowerCase() === 'x') setTool('crop');
    if (event.key === '0') fitView(); if (event.key === '+' || event.key === '=') zoomTo(view.zoom + 10); if (event.key === '-') zoomTo(view.zoom - 10);
    if (event.key === 'F2') { event.preventDefault(); nameDialog(false); }
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key) && selectedObject()) {
      event.preventDefault(); const object = requireObject(); if (!object) return; const amount = event.shiftKey ? 5 : 1;
      mutate(() => { object.x = clamp(object.x + (event.key === 'ArrowLeft' ? -amount : event.key === 'ArrowRight' ? amount : 0), 0, 100); object.y = clamp(object.y + (event.key === 'ArrowUp' ? -amount : event.key === 'ArrowDown' ? amount : 0), 0, 100); });
    }
  });
  new ResizeObserver(() => {
    dimensions = { width: viewport.clientWidth || 1, height: viewport.clientHeight || 1 };
    renderObjects(); renderBackground(); renderView(); positionMenu();
  }).observe(viewport);
  window.addEventListener('resize', () => { closeDrawers(); positionMenu(); });
  window.addEventListener('pagehide', () => { stopPlayback(); stopVoice(); clearTimeout(toastTimer); });
  setTool('select'); render(); playbackUI();
  canvas.classList.add('entering');
  canvas.addEventListener('animationend', () => canvas.classList.remove('entering'), { once: true });
})();
