(() => {
  'use strict';

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];
  const canvas = $('#console');
  const motionButton = $('#motion-button');
  const gsap = window.gsap;
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const presets = {
    cruise: { thrust: 64, power: 78, temperature: 21.5, pitch: 0, yaw: 0 },
    maneuver: { thrust: 86, power: 100, temperature: 20, pitch: 2, yaw: -3 },
    dock: { thrust: 18, power: 52, temperature: 22, pitch: 0, yaw: 0 }
  };
  const modeNames = { cruise: 'CRUISE', maneuver: 'MANEUVER', dock: 'DOCK', manual: 'MANUAL' };
  const specs = {
    thrust: { min: 0, max: 100, step: 0.5, digits: 1, label: 'THRUST', unit: '%' },
    power: { min: 20, max: 100, step: 1, digits: 0, label: 'POWER CAP', unit: '%' },
    temperature: { min: 16, max: 30, step: 0.5, digits: 1, label: 'CABIN TEMP', unit: '°C' },
    pitch: { min: -10, max: 10, step: 0.1, digits: 1, label: 'PITCH', unit: '°' },
    yaw: { min: -15, max: 15, step: 0.1, digits: 1, label: 'YAW', unit: '°' }
  };
  const state = { ...presets.cruise, engine: true, oxygen: true, thermal: true, stabilizer: true, mode: 'cruise' };
  const controllers = {};
  const switchButtons = $$('[data-switch]');
  const modeButtons = $$('[data-mode]');
  const elements = {
    reactor: $('#reactor-meter'), reactorValue: $('#reactor-value'), reactorProgress: $('#reactor-progress'),
    reactorStatus: $('#reactor-status'), load: $('#load-value'), capacity: $('#capacity-value'),
    vector: $('#vector-value'), outputStatus: $('#output-status'), engineCaption: $('#engine-caption'),
    thrustState: $('#thrust-state'), mainState: $('#main-readout-state'),
    oxygenMeter: $('#oxygen-meter'), oxygenProgress: $('#oxygen-progress'), oxygenValue: $('#oxygen-value'),
    temperatureSummary: $('#temperature-summary'), attitudeLock: $('#attitude-lock'),
    attitude: $('#attitude-svg'), ship: $('#attitude-ship'), overview: $('#system-overview'),
    overviewTitle: $('#overview-title'), overviewCaption: $('#overview-caption'), overviewIcon: $('.overview-icon .ti'),
    log: $('#event-log'), layer: $('#dialog-layer'), dialog: $('.console-dialog'),
    dialogTitle: $('#dialog-title'), dialogBody: $('#dialog-body'), dialogConfirm: $('#dialog-confirm'),
    dialogCancel: $('#dialog-cancel'), notice: $('#console-notice'), clock: $('#utc-clock')
  };
  const switchStatuses = {};
  const switchPositions = {};
  const leds = {};
  for (const name of ['oxygen', 'thermal', 'stabilizer']) {
    switchStatuses[name] = $(`[data-switch-status="${name}"]`);
    switchPositions[name] = $(`[data-switch-position="${name}"]`);
    leds[name] = $(`[data-led="${name}"]`);
  }
  const history = [];
  let initialized = false;
  let dialogType = null;
  let returnFocus = null;
  let noticeTimer;
  let lastNavRead = 0;
  let waterfallTimer;
  let clockTimer;
  let readyTimeline;
  let hudMotionEnabled = true;
  let hologram;
  let navMap;
  let navTour;

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const text = (element, value) => { if (element.textContent !== String(value)) element.textContent = value; };
  const round = (value, spec) => Number(clamp(Math.round((value - spec.min) / spec.step) * spec.step + spec.min, spec.min, spec.max).toFixed(spec.digits));
  const angleFor = (value, spec) => -135 + (value - spec.min) / (spec.max - spec.min) * 270;
  const valueFor = (angle, spec) => round(spec.min + (clamp(angle, -135, 135) + 135) / 270 * (spec.max - spec.min), spec);
  const point = (center, radius, angle) => {
    const radians = angle * Math.PI / 180;
    return [center + radius * Math.sin(radians), center - radius * Math.cos(radians)];
  };
  const svgNode = (tag, attributes) => {
    const node = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (const [name, value] of Object.entries(attributes)) node.setAttribute(name, value);
    return node;
  };
  const utcTime = () => new Date().toISOString().slice(11, 16);

  function logEvent(message) {
    if (history[0] && history[0].message === message) {
      // 同一条事件重复触发（同一目标反复锁定等）只刷新时间，不刷屏
      history[0].time = utcTime();
    } else {
      history.unshift({ time: utcTime(), message });
      history.splice(4);
    }
    elements.log.replaceChildren(...history.map((event) => {
      const row = document.createElement('li');
      const time = document.createElement('time');
      const message = document.createElement('span');
      const dot = document.createElement('span');
      time.textContent = event.time;
      message.textContent = event.message;
      message.title = event.message;
      dot.className = 'log-dot';
      row.append(time, message, dot);
      return row;
    }));
  }

  function buildScale(dial, spec) {
    const svg = dial.querySelector('.dial-scale');
    const size = 200;
    const center = size / 2;
    const radius = size * 0.372;
    const start = point(center, radius, -135);
    const end = point(center, radius, 135);
    const arc = `M ${start[0]} ${start[1]} A ${radius} ${radius} 0 1 1 ${end[0]} ${end[1]}`;
    const track = svgNode('path', { d: arc, class: 'dial-scale-track', pathLength: 100 });
    const progress = svgNode('path', { d: arc, class: 'dial-scale-progress', pathLength: 100, 'stroke-dasharray': '0 100' });
    svg.append(track, progress);
    const count = 26;
    const ticks = [];
    for (let index = 0; index <= count; index++) {
      const angle = -135 + index / count * 270;
      const major = index % 6 === 0 || index === count;
      const outside = point(center, size * 0.427, angle);
      const inside = point(center, size * (major ? 0.402 : 0.414), angle);
      const tick = svgNode('line', { x1: inside[0], y1: inside[1], x2: outside[0], y2: outside[1], class: `dial-scale-tick${major ? ' is-major' : ''}` });
      ticks.push(tick);
      svg.append(tick);
    }
    return { progress, ticks };
  }

  function renderDial(controller, angle) {
    const { spec, rotor, scale, dial } = controller;
    const value = valueFor(angle, spec);
    const ratio = (value - spec.min) / (spec.max - spec.min);
    controller.value = value;
    state[controller.name] = value;
    text(controller.readout, value.toFixed(spec.digits));
    rotor.setAttribute('aria-valuenow', value);
    const detail = controller.name === 'power' ? `, ${value * 2} kilowatts` : '';
    rotor.setAttribute('aria-valuetext', `${value} ${spec.unit}${detail}`);
    scale.progress.setAttribute('stroke-dasharray', `${ratio * 100} 100`);
    const activeTick = Math.round(ratio * (scale.ticks.length - 1));
    if (activeTick !== controller.activeTick) {
      scale.ticks.forEach((tick, index) => tick.classList.toggle('is-lit', index <= activeTick));
      controller.activeTick = activeTick;
    }
    dial.dataset.value = value;
    if (initialized) renderSystems();
  }

  function stopController(controller) {
    controller.animation?.kill();
    controller.draggable?.tween?.kill();
  }

  function cancelGesture(controller) {
    if (controller.draggable?.isPressed) {
      controller.draggable.endDrag();
      controller.draggable.tween?.kill();
    }
    controller.cancelNativeDrag?.();
    controller.dial.classList.remove('is-dragging');
  }

  function setValue(controller, value, animate = false) {
    stopController(controller);
    const angle = angleFor(round(value, controller.spec), controller.spec);
    if (gsap && animate && !motionPreference.matches) {
      controller.animation = gsap.to(controller.rotor, {
        rotation: angle, duration: 0.2, ease: 'power3.out', overwrite: 'auto',
        onUpdate: () => {
          renderDial(controller, Number(gsap.getProperty(controller.rotor, 'rotation')));
          controller.draggable?.update();
        },
        onComplete: () => { renderDial(controller, angle); controller.draggable?.update(); }
      });
    } else {
      if (gsap) gsap.set(controller.rotor, { rotation: angle });
      else controller.rotor.style.transform = `rotate(${angle}deg)`;
      renderDial(controller, angle);
      controller.draggable?.update();
    }
  }

  function markManual() {
    if (state.mode === 'manual') return;
    state.mode = 'manual';
    modeButtons.forEach((button) => { button.classList.remove('is-active'); button.setAttribute('aria-pressed', 'false'); });
    renderSystems();
  }

  function finishAdjustment(controller) {
    logEvent(`${controller.spec.label} SET TO ${controller.value.toFixed(controller.spec.digits)}${controller.spec.unit}`);
  }

  function nativeDrag(controller) {
    let pointer = null;
    let lastAngle = 0;
    let rotation = 0;
    let center;
    let vertical = false;
    let previousY = 0;
    let moved = false;
    const angleAt = (event) => Math.atan2(event.clientY - center.y, event.clientX - center.x) * 180 / Math.PI;
    controller.rotor.addEventListener('pointerdown', (event) => {
      if (controller.disabled || pointer !== null || event.button !== 0) return;
      event.preventDefault();
      if (controller.animation?.isActive()) markManual();
      stopController(controller);
      const rect = controller.rotor.getBoundingClientRect();
      center = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
      vertical = Math.hypot(event.clientX - center.x, event.clientY - center.y) < rect.width * 0.2;
      lastAngle = angleAt(event);
      previousY = event.clientY;
      rotation = angleFor(controller.value, controller.spec);
      pointer = event.pointerId;
      moved = false;
      controller.rotor.setPointerCapture(pointer);
      controller.rotor.focus({ preventScroll: true });
      controller.dial.classList.add('is-dragging');
    });
    controller.rotor.addEventListener('pointermove', (event) => {
      if (event.pointerId !== pointer || controller.disabled) return;
      const angle = angleAt(event);
      const delta = vertical ? (previousY - event.clientY) * 0.8 : ((angle - lastAngle + 540) % 360) - 180;
      if (Math.abs(delta) < 0.05) return;
      moved = true;
      markManual();
      rotation = clamp(rotation + delta, -135, 135);
      if (gsap) gsap.set(controller.rotor, { rotation });
      else controller.rotor.style.transform = `rotate(${rotation}deg)`;
      renderDial(controller, rotation);
      lastAngle = angle;
      previousY = event.clientY;
    });
    const release = (event) => {
      if (event.pointerId !== pointer) return;
      pointer = null;
      controller.dial.classList.remove('is-dragging');
      setValue(controller, controller.value);
      if (moved) finishAdjustment(controller);
    };
    controller.rotor.addEventListener('pointerup', release);
    controller.rotor.addEventListener('pointercancel', release);
    controller.rotor.addEventListener('lostpointercapture', release);
    controller.cancelNativeDrag = () => {
      if (pointer === null) return;
      const id = pointer;
      pointer = null;
      if (controller.rotor.hasPointerCapture(id)) controller.rotor.releasePointerCapture(id);
    };
  }

  function bindController(controller) {
    if (gsap && window.Draggable && window.InertiaPlugin) {
      controller.draggable = window.Draggable.create(controller.rotor, {
        type: 'rotation', bounds: { minRotation: -135, maxRotation: 135 },
        inertia: !motionPreference.matches, dragResistance: 0.14, edgeResistance: 1,
        throwResistance: 4200, minDuration: 0.12, maxDuration: 0.28, overshootTolerance: 0,
        cursor: 'grab', activeCursor: 'grabbing',
        snap: (angle) => angleFor(valueFor(angle, controller.spec), controller.spec),
        onPress() {
          if (controller.animation?.isActive()) markManual();
          controller.animation?.kill();
          controller.rotor.focus({ preventScroll: true });
          controller.dial.classList.add('is-dragging');
        },
        onDragStart() { markManual(); },
        onDrag() { markManual(); renderDial(controller, this.rotation); },
        onRelease() { controller.dial.classList.remove('is-dragging'); },
        onDragEnd() {
          if (!this.vars.inertia) { setValue(controller, controller.value); finishAdjustment(controller); }
        },
        onThrowUpdate() { renderDial(controller, this.rotation); },
        onThrowComplete() {
          renderDial(controller, this.rotation);
          finishAdjustment(controller);
        }
      })[0];
    } else nativeDrag(controller);

    controller.rotor.addEventListener('keydown', (event) => {
      if (controller.disabled) return;
      const { spec } = controller;
      const changes = { ArrowUp: spec.step, ArrowRight: spec.step, ArrowDown: -spec.step, ArrowLeft: -spec.step, PageUp: spec.step * 10, PageDown: -spec.step * 10 };
      let value;
      if (event.key === 'Home') value = spec.min;
      else if (event.key === 'End') value = spec.max;
      else if (Object.hasOwn(changes, event.key)) value = controller.value + changes[event.key];
      else return;
      event.preventDefault();
      markManual();
      setValue(controller, value);
      finishAdjustment(controller);
    });
    controller.rotor.addEventListener('dblclick', () => {
      if (controller.disabled) return;
      markManual();
      setValue(controller, presets.cruise[controller.name], true);
      logEvent(`${controller.spec.label} RESTORED`);
    });
  }

  function setDisabled(controller, disabled) {
    if (controller.disabled === disabled) return;
    controller.disabled = disabled;
    controller.rotor.setAttribute('aria-disabled', disabled);
    controller.dial.classList.toggle('is-disabled', disabled);
    if (disabled) {
      cancelGesture(controller);
      stopController(controller);
      controller.draggable?.disable();
    } else controller.draggable?.enable();
  }

  function renderSystems() {
    const available = state.power * 2;
    const requested = 6 + (state.engine ? 20 + state.thrust * 0.96 : 0) + (state.oxygen ? 8 : 0) + (state.thermal ? 12 : 0) + (state.stabilizer ? 4 : 0);
    const load = requested / available * 100;
    const limited = requested > available;
    const thrust = state.engine ? state.thrust * Math.min(1, available / requested) * 0.76 : 0;
    const engineState = state.engine ? 'on' : 'off';
    const oxygenState = state.oxygen ? 'on' : 'off';
    if (canvas.dataset.engine !== engineState) canvas.dataset.engine = engineState;
    if (canvas.dataset.oxygen !== oxygenState) canvas.dataset.oxygen = oxygenState;
    text(elements.reactorValue, load.toFixed(1));
    text(elements.load, requested.toFixed(1));
    text(elements.capacity, available.toFixed(0));
    text(elements.reactorStatus.lastChild, limited ? 'POWER LIMITED' : 'POWER STABLE');
    elements.reactorProgress.setAttribute('stroke-dasharray', `${Math.min(load, 100)} 100`);
    elements.reactor.setAttribute('aria-valuenow', Math.min(load, 100).toFixed(1));
    elements.reactor.setAttribute('aria-valuetext', `Demand ${load.toFixed(1)}%, ${limited ? 'power limited' : 'power stable'}`);
    elements.reactor.classList.toggle('is-overloaded', limited);
    text(elements.vector, thrust.toFixed(1));
    text(elements.outputStatus, state.engine ? (limited ? 'POWER LIMITED' : 'NOMINAL RANGE') : 'DRIVE STANDBY');
    text(elements.mainState, state.engine ? (limited ? 'POWER LIMITED' : `${modeNames[state.mode]} OUTPUT`) : 'POWER OFF');
    text(elements.thrustState.lastChild, state.engine ? (limited ? 'OUTPUT LIMITED' : 'DRIVE READY') : 'DRIVE STANDBY');
    elements.thrustState.classList.toggle('is-off', !state.engine);
    text(elements.engineCaption, state.engine ? 'MAIN DRIVE ONLINE' : 'SETPOINT HELD / POWER OFF');
    setDisabled(controllers.thrust, !state.engine);
    setDisabled(controllers.temperature, !state.thermal);
    text(elements.oxygenValue, state.oxygen ? '98' : '0');
    elements.oxygenProgress.setAttribute('stroke-dasharray', `${state.oxygen ? 98 : 0} 100`);
    elements.oxygenMeter.setAttribute('aria-valuenow', state.oxygen ? 98 : 0);
    text(elements.temperatureSummary, state.thermal ? (state.temperature >= 20 && state.temperature <= 24 ? 'COMFORT RANGE' : 'ADJUSTING') : 'THERMAL PAUSED');
    const labels = { oxygen: ['CLOSED CYCLE', 'CYCLE PAUSED'], thermal: ['REGULATING', 'LOOP OFF'], stabilizer: ['3-AXIS LOCK', 'MANUAL CONTROL'] };
    switchButtons.forEach((button) => button.setAttribute('aria-checked', state[button.dataset.switch]));
    for (const name of Object.keys(labels)) {
      text(switchStatuses[name], labels[name][state[name] ? 0 : 1]);
      text(switchPositions[name], state[name] ? 'ON' : 'OFF');
      leds[name].classList.toggle('is-off', !state[name]);
    }
    text(elements.attitudeLock.querySelector('span'), state.stabilizer ? '3-AXIS LOCK' : 'MANUAL CONTROL');
    elements.attitudeLock.querySelector('i').className = `ti ti-${state.stabilizer ? 'lock' : 'lock-open'}`;
    elements.ship.setAttribute('transform', `translate(0 ${state.pitch * 0.8}) rotate(${state.yaw} 115 55)`);
    text($('#attitude-pitch'), state.pitch.toFixed(1));
    text($('#attitude-yaw'), state.yaw.toFixed(1));
    text($('#attitude-roll'), (state.yaw * -0.35 + state.pitch * 0.2).toFixed(1));
    elements.attitude.setAttribute('aria-label', `Attitude reference, pitch ${state.pitch.toFixed(1)} degrees, yaw ${state.yaw.toFixed(1)} degrees`);
    const warning = limited || !state.oxygen || !state.thermal;
    const critical = !state.oxygen;
    text(elements.overviewTitle, !state.oxygen ? 'OXYGEN LOOP PAUSED' : limited ? 'POWER LIMITED' : !state.thermal ? 'THERMAL LOOP OFF' : !state.engine ? 'DRIVE STANDBY' : 'ALL SYSTEMS NOMINAL');
    text(elements.overviewCaption, `${limited ? 'DEMAND EXCEEDS CAP' : 'POWER STABLE'} / ${state.stabilizer ? 'ATTITUDE LOCKED' : 'MANUAL ATTITUDE'}`);
    elements.overview.classList.toggle('is-warning', warning);
    elements.overview.classList.toggle('is-critical', critical);
    elements.overviewIcon.className = `ti ti-${warning ? 'alert-triangle' : 'check'}`;
  }

  function applyPreset(name, animate = true) {
    Object.values(controllers).forEach((controller) => { cancelGesture(controller); stopController(controller); });
    state.mode = name;
    state.engine = true;
    state.oxygen = true;
    state.thermal = true;
    state.stabilizer = name !== 'maneuver';
    modeButtons.forEach((button) => {
      const active = button.dataset.mode === name;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', active);
    });
    renderSystems();
    Object.entries(presets[name]).forEach(([key, value]) => setValue(controllers[key], value, animate));
    logEvent(`${modeNames[name]} PROFILE LOADED`);
  }

  function closeDialog() {
    if (elements.layer.hidden) return;
    elements.layer.hidden = true;
    dialogType = null;
    $('.command-header').inert = false;
    $('.workspace').inert = false;
    $('.console-footer').inert = false;
    returnFocus?.focus({ preventScroll: true });
  }

  function openDialog(type, trigger) {
    dialogType = type;
    returnFocus = trigger;
    const confirm = type === 'reset';
    elements.dialog.classList.toggle('is-confirmation', confirm);
    text(elements.dialogTitle, confirm ? 'RESTORE CRUISE PROFILE?' : 'CONTROL GUIDE');
    elements.dialogConfirm.hidden = !confirm;
    text(elements.dialogCancel, confirm ? 'KEEP CURRENT' : 'CLOSE');
    if (confirm) {
      elements.dialogBody.textContent = 'Restore cruise settings for thrust, power, cabin temperature and attitude. The ion drive, oxygen, thermal and stabilization loops will reconnect.';
    } else {
      elements.dialogBody.innerHTML = '<div class="help-grid"><div class="help-item"><h3><i class="ti ti-rotate-clockwise" aria-hidden="true"></i>ROTARY CONTROL</h3><p>Drag around the outer rim to turn a dial. Release to let the control decelerate into its nearest precision detent.</p></div><div class="help-item"><h3><i class="ti ti-keyboard" aria-hidden="true"></i>PRECISION TRIM</h3><p>Use <kbd>Tab</kbd> to focus a dial and arrow keys to adjust one step. <kbd>Page Up</kbd> and <kbd>Page Down</kbd> adjust ten steps; <kbd>Home</kbd> and <kbd>End</kbd> reach the stops.</p></div><div class="help-item"><h3><i class="ti ti-adjustments" aria-hidden="true"></i>SYSTEM LOOPS</h3><p>Switch a loop on or off. Available power limits actual thrust while preserving the selected setpoint.</p></div><div class="help-item"><h3><i class="ti ti-restore" aria-hidden="true"></i>PROFILE RESTORE</h3><p>Double-click a dial to restore its cruise value. Flight profiles update all settings. The radar button pauses all projection layers.</p></div></div>';
    }
    elements.layer.hidden = false;
    $('.command-header').inert = true;
    $('.workspace').inert = true;
    $('.console-footer').inert = true;
    elements.dialog.focus({ preventScroll: true });
  }

  function notice(message) {
    clearTimeout(noticeTimer);
    text(elements.notice, message);
    elements.notice.hidden = false;
    noticeTimer = setTimeout(() => { elements.notice.hidden = true; }, 3200);
  }

  function syncHUDMotion() {
    const reduced = motionPreference.matches;
    const playing = hudMotionEnabled && !reduced;
    canvas.classList.toggle('motion-paused', !playing);
    motionButton.setAttribute('aria-pressed', playing);
    motionButton.disabled = reduced;
    const label = reduced ? 'Motion reduced by system preference' : playing ? 'Pause HUD motion' : 'Resume HUD motion';
    motionButton.setAttribute('aria-label', label);
    motionButton.title = label;
    text($('#motion-status'), reduced ? 'REDUCED' : playing ? 'AUTO SCAN' : 'HOLD');
    hologram?.setPlaying(playing && !document.hidden);
    navMap?.setPlaying(playing && !document.hidden);
    if (playing) navTour?.start(); else navTour?.stop();
    if (!playing) readyTimeline?.progress(1);
  }

  // 厚玻璃反射：把当前 UI 克隆一份，沿 Z 轴后退 + 模糊 + 极低透明度，压在内容之下
  const buildGlassReflection = () => {
    const source = $('#console');
    if (!source || source.querySelector('.canvas-ghost')) return;
    const ghost = source.cloneNode(true);
    ghost.classList.add('canvas-ghost');
    ghost.removeAttribute('id');
    ghost.setAttribute('aria-hidden', 'true');
    ghost.querySelectorAll('[id]').forEach((node) => node.removeAttribute('id'));
    ghost.querySelectorAll('canvas, .map-overlay, .map-hud, .holo-stage, .map-glitch').forEach((node) => node.remove());
    ghost.querySelectorAll('button, a, input, [tabindex]').forEach((node) => {
      node.setAttribute('tabindex', '-1');
      node.setAttribute('aria-hidden', 'true');
    });
    ghost.querySelectorAll('[hidden]').forEach((node) => node.remove());
    source.append(ghost);
  };

  buildGlassReflection();
  window.KeplerFUI.initGraphics();
  hologram = window.KeplerFUI.createHologram($('#holo-canvas'));
  navMap = window.KeplerFUI.createMap($('#map-canvas'), {
    onFrame(camera, time) {
      if (time - lastNavRead < 0.22) return;
      lastNavRead = time;
      text($('#nav-range'), (148 / camera.zoom + 12.4).toFixed(1));
      const bearing = (camera.pan.x * 412 + 118) % 360;
      text($('#nav-bearing'), bearing.toFixed(1));
      text($('#compass-az'), bearing.toFixed(1));
      text($('#map-coords'), (18.402 + (0.5 - camera.pan.y) * 0.62).toFixed(3) + ' N / ' + (11.318 + (camera.pan.x - 0.5) * 0.62).toFixed(3) + ' W');
      text($('#map-scale-label'), Math.round(500 / camera.zoom) + ' M');
      text($('#loop-flow'), (11.6 + camera.zoom * 0.62).toFixed(1));
      text($('#loop-dp'), (2.6 + camera.pan.y * 1.4).toFixed(1));
    }
  });
  navTour = navMap ? window.KeplerFUI.createMapTour(navMap) : null;
  navMap?.ready.then(() => {
    navMap.setLock(true);
    window.dispatchEvent(new CustomEvent('kepler:lock', { detail: { site: navMap.sites[0], index: 0 } }));
    if (hudMotionEnabled && !motionPreference.matches) navTour?.start();
  });
  if (gsap && window.Draggable && window.InertiaPlugin) gsap.registerPlugin(window.Draggable, window.InertiaPlugin);
  for (const [name, spec] of Object.entries(specs)) {
    const dial = $(`[data-control="${name}"]`);
    const controller = { name, spec, dial, rotor: dial.querySelector('.knob-rotor'), readout: dial.querySelector('.dial-value'), scale: buildScale(dial, spec), value: state[name], activeTick: -1, disabled: false };
    controllers[name] = controller;
    setValue(controller, state[name]);
    bindController(controller);
  }
  const reactorTicks = $('#reactor-ticks');
  for (let index = 0; index < 60; index++) {
    const angle = index * 6;
    const inner = point(120, index % 5 === 0 ? 98 : 101, angle);
    const outer = point(120, 106, angle);
    reactorTicks.append(svgNode('line', { x1: inner[0], y1: inner[1], x2: outer[0], y2: outer[1], class: `reactor-tick${index % 5 === 0 ? ' is-major' : ''}` }));
  }
  initialized = true;
  renderSystems();
  logEvent('CABIN LOOPS ONLINE');
  logEvent('CRUISE PROFILE LOADED');
  logEvent('HULL PROJECTION ONLINE');
  logEvent('SURFACE SCAN ACQUIRED');

  const dialSizes = new ResizeObserver((entries) => {
    for (const entry of entries) {
      if (entry.contentRect.width === 0) continue;
      entry.target.querySelectorAll('.dial-scale-label').forEach((label) => { label.style.fontSize = `${14 * 400 / entry.contentRect.width}px`; });
      controllers[entry.target.dataset.control].draggable?.update();
    }
  });
  Object.values(controllers).forEach((controller) => dialSizes.observe(controller.dial));

  switchButtons.forEach((button) => button.addEventListener('click', () => {
    const name = button.dataset.switch;
    state[name] = !state[name];
    markManual();
    renderSystems();
    const names = { engine: 'ION POWER', oxygen: 'OXYGEN LOOP', thermal: 'THERMAL LOOP', stabilizer: 'STABILIZER' };
    logEvent(`${names[name]} ${state[name] ? 'ONLINE' : 'OFFLINE'}`);
  }));
  modeButtons.forEach((button) => button.addEventListener('click', () => applyPreset(button.dataset.mode)));
  $('#help-button').addEventListener('click', (event) => openDialog('help', event.currentTarget));
  $('#reset-button').addEventListener('click', (event) => openDialog('reset', event.currentTarget));
  $('#dialog-close').addEventListener('click', closeDialog);
  elements.dialogCancel.addEventListener('click', closeDialog);
  elements.dialogConfirm.addEventListener('click', () => { applyPreset('cruise'); closeDialog(); });
  $('.scrim').addEventListener('click', closeDialog);
  document.addEventListener('keydown', (event) => {
    if (elements.layer.hidden) return;
    if (event.key === 'Escape') { event.preventDefault(); closeDialog(); return; }
    if (event.key !== 'Tab') return;
    const focusable = [...elements.dialog.querySelectorAll('button:not([hidden])')];
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && (document.activeElement === first || document.activeElement === elements.dialog)) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && (document.activeElement === last || document.activeElement === elements.dialog)) { event.preventDefault(); first.focus(); }
  });
  $('#fullscreen-button').addEventListener('click', async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if ($('#console').requestFullscreen) await $('#console').requestFullscreen();
      else notice('Fullscreen is unavailable. Use the browser fullscreen control.');
    } catch { notice('Fullscreen was not allowed. Check browser permissions.'); }
  });
  document.addEventListener('fullscreenchange', () => {
    const active = Boolean(document.fullscreenElement);
    $('#fullscreen-button').setAttribute('aria-label', active ? 'Exit fullscreen' : 'Enter fullscreen');
    $('#fullscreen-button').title = active ? 'Exit fullscreen' : 'Enter fullscreen';
    $('#fullscreen-button i').className = `ti ti-${active ? 'minimize' : 'maximize'}`;
  });
  motionButton.addEventListener('click', () => { hudMotionEnabled = !hudMotionEnabled; syncHUDMotion(); });
  document.addEventListener('visibilitychange', () => {
    canvas.classList.toggle('document-paused', document.hidden);
    hologram?.setPlaying(hudMotionEnabled && !motionPreference.matches && !document.hidden);
    navMap?.setPlaying(hudMotionEnabled && !motionPreference.matches && !document.hidden);
    if (!document.hidden && hudMotionEnabled) navTour?.start(); else navTour?.stop();
  });
  motionPreference.addEventListener('change', () => {
    for (const controller of Object.values(controllers)) {
      if (controller.draggable) controller.draggable.vars.inertia = !motionPreference.matches;
      if (motionPreference.matches) setValue(controller, controller.value);
    }
    syncHUDMotion();
  });
  if (gsap && !motionPreference.matches) {
    // 开机序列：顶栏 → 标题 → 舱位标题 → 地图 → 控制条 → 底栏，逐级浮现
    readyTimeline = gsap.timeline({ defaults: { duration: 0.46, ease: 'power3.out' } });
    readyTimeline
      .from('.command-header', { opacity: 0, y: -6 })
      .from('.page-heading', { opacity: 0, y: -4, duration: 0.4 }, '-=0.32')
      .from('.bay-heading', { opacity: 0, y: -4, stagger: 0.06, duration: 0.4 }, '-=0.26')
      .from('.energy-bay > *, .environment-bay > *', { opacity: 0, y: 6, stagger: 0.035, duration: 0.45 }, '-=0.3')
      .from('.nav-stage', { opacity: 0, duration: 0.7 }, '-=0.42')
      .from('.control-bank .trim-control', { opacity: 0, y: 7, stagger: 0.05, duration: 0.45 }, '-=0.5')
      .from('.attitude-display, .drive-module, .flight-log', { opacity: 0, y: 7, stagger: 0.045, duration: 0.45 }, '<')
      .from('.console-footer', { opacity: 0, duration: 0.4 }, '-=0.24');
  }
  syncHUDMotion();
  const startClock = () => {
    clearInterval(clockTimer);
    const update = () => { const now = new Date(); text(elements.clock, now.toISOString().slice(11, 19)); elements.clock.dateTime = now.toISOString(); };
    update();
    clockTimer = setInterval(update, 1000);
  };
  window.addEventListener('pagehide', () => {
    clearInterval(clockTimer);
    clearTimeout(noticeTimer);
    clearTimeout(waterfallTimer);
    clearTimeout(waveTimer);
    clearTimeout(loadTimer);
    clearTimeout(cellTimer);
    clearTimeout(telemetryTimer);
    clearTimeout(logTimer);
    readyTimeline?.progress(1);
    canvas.classList.add('document-paused');
    hologram?.setPlaying(false);
    navMap?.setPlaying(false);
    navTour?.stop();
    Object.values(controllers).forEach((controller) => { cancelGesture(controller); stopController(controller); controller.draggable?.disable(); });
  });
  window.addEventListener('pageshow', () => {
    canvas.classList.toggle('document-paused', document.hidden);
    syncHUDMotion();
    startClock();
    Object.values(controllers).forEach((controller) => { if (!controller.disabled) controller.draggable?.enable(); });
  });
  const bars = $('#waterfall-bars');
  if (bars) {
    const seeds = Array.from({ length: 22 }, (_, index) => 0.32 + 0.68 * Math.abs(Math.sin(index * 1.7)));
    const nodes = seeds.map(() => {
      const bar = document.createElement('span');
      bars.append(bar);
      return bar;
    });
    const tickBars = () => {
      const level = state.engine ? state.thrust / 100 : 0;
      nodes.forEach((bar, index) => {
        const wobble = 0.5 + 0.5 * Math.sin(lastNavRead * (1.7 + index * 0.13) + seeds[index] * 9);
        const height = 10 + level * 84 * (0.35 + seeds[index] * 0.65) * (0.55 + wobble * 0.75);
        bar.style.height = Math.min(100, height).toFixed(1) + '%';
        bar.classList.toggle('is-peak', height > 76);
      });
      waterfallTimer = setTimeout(tickBars, 140);
    };
    tickBars();
  }

  // 负载历史曲线：最近一段时间的负载采样折线 + 面积渐变
  const loadLine = $('#load-line');
  const loadArea = $('#load-area');
  const loadHead = $('#load-head');
  const loadNow = $('#load-now');
  const loadSamples = Array.from({ length: 44 }, (_, index) => 70 + Math.sin(index * 0.52) * 5.4 + Math.sin(index * 1.83) * 2.1);
  let loadTimer;
  const drawLoad = () => {
    const current = Number(elements.reactorValue?.textContent) || 71;
    loadSamples.push(current + (Math.random() - 0.5) * 4.4);
    loadSamples.shift();
    const points = loadSamples.map((value, index) => {
      const x = index / (loadSamples.length - 1) * 200;
      const y = 32 - Math.max(0.05, Math.min(1, (value - 44) / 46)) * 29;
      return x.toFixed(1) + ',' + y.toFixed(1);
    });
    if (loadLine) loadLine.setAttribute('points', points.join(' '));
    if (loadArea) loadArea.setAttribute('points', '0,33 ' + points.join(' ') + ' 200,33');
    const last = points[points.length - 1].split(',');
    if (loadHead) {
      loadHead.setAttribute('cx', last[0]);
      loadHead.setAttribute('cy', last[1]);
    }
    text(loadNow, loadSamples[loadSamples.length - 1].toFixed(1));
    loadTimer = window.setTimeout(drawLoad, motionPreference.matches || !hudMotionEnabled ? 900 : 320);
  };
  drawLoad();

  // 电池阵列：随机单元充能点亮，制造“正在运算”的活性
  const cells = Array.from(document.querySelectorAll('.cell-grid i'));
  let cellTimer;
  const chargeCells = () => {
    cells.forEach((cell) => cell.classList.remove('is-hot'));
    const count = 3 + Math.floor(Math.random() * 4);
    for (let step = 0; step < count; step += 1) {
      cells[Math.floor(Math.random() * cells.length)]?.classList.add('is-hot');
    }
    cellTimer = window.setTimeout(chargeCells, motionPreference.matches || !hudMotionEnabled ? 1800 : 220 + Math.random() * 260);
  };
  if (cells.length) chargeCells();

  // 生命维持信号波形：确定性正弦叠加，跟着 HUD 动效暂停
  const waveLine = $('#wave-line');
  let waveTimer;
  const drawWave = () => {
    if (!waveLine) return;
    const t = performance.now() / 1000;
    const points = [];
    for (let x = 0; x <= 200; x += 2.5) {
      const y = 22
        + Math.sin(x * 0.10 + t * 1.5) * 11
        + Math.sin(x * 0.27 - t * 2.2) * 5.5
        + Math.sin(x * 0.61 + t * 3.6) * 2.2;
      points.push(x.toFixed(1) + ',' + y.toFixed(1));
    }
    waveLine.setAttribute('points', points.join(' '));
    waveTimer = window.setTimeout(drawWave, motionPreference.matches || !hudMotionEnabled ? 400 : 70);
  };
  drawWave();

  // 偶发的局部信号故障：只闪某个面板的局部，不全屏
  const glitchTargets = ['.map-readout', '.module-chip', '.reactor-detail', '.cell-array', '.environment-meter'];
  const scheduleGlitch = () => {
    window.setTimeout(() => {
      if (hudMotionEnabled && !motionPreference.matches && !document.hidden) {
        const target = document.querySelector(glitchTargets[Math.floor(Math.random() * glitchTargets.length)]);
        if (target) {
          target.classList.add('is-corrupt');
          window.setTimeout(() => target.classList.remove('is-corrupt'), 260);
        }
      }
      scheduleGlitch();
    }, 6400 + Math.random() * 7200);
  };
  scheduleGlitch();

  // 生命维持 / 母线遥测：缓慢漂移，避免一排死值
  const telemetryFields = [
    ['#loop-co2', () => (0.031 + Math.random() * 0.018).toFixed(3)],
    ['#loop-hum', () => String(41 + Math.round(Math.random() * 3))],
    ['#loop-dt', () => (0.62 + Math.random() * 0.36).toFixed(2)],
    ['#cell-volts', () => (28.02 + Math.random() * 0.05).toFixed(2)]
  ];
  let telemetryTimer;
  const driftTelemetry = () => {
    if (hudMotionEnabled && !motionPreference.matches && !document.hidden) {
      telemetryFields.forEach(([selector, next]) => text($(selector), next()));
    }
    telemetryTimer = window.setTimeout(driftTelemetry, 2400);
  };
  driftTelemetry();

  // 事件日志自动追加：让终端始终处于“运行中”
  const ambientEvents = [
    () => 'SCAN SWEEP ' + (92 + Math.floor(Math.random() * 7)) + '% COMPLETE',
    () => 'THERMAL LOOP DT ' + (0.62 + Math.random() * 0.36).toFixed(2),
    () => 'BUS A RIPPLE ' + (0.01 + Math.random() * 0.02).toFixed(2) + ' V',
    () => 'STAR TRACKER REACQUIRED',
    () => 'HULL PROJECTION RESYNC',
    () => 'ECLSS CO2 ' + (0.031 + Math.random() * 0.018).toFixed(3) + ' %',
    () => 'ORBIT EPHEMERIS UPDATED',
    () => 'ION VECTOR TRIM ' + (47.8 + Math.random() * 1.6).toFixed(1) + ' kN'
  ];
  let logTimer;
  const ambientLog = () => {
    if (hudMotionEnabled && !motionPreference.matches && !document.hidden) {
      logEvent(ambientEvents[Math.floor(Math.random() * ambientEvents.length)]());
    }
    logTimer = window.setTimeout(ambientLog, 9000 + Math.random() * 7000);
  };
  ambientLog();

  window.addEventListener('kepler:lock', (event) => {
    const site = event.detail?.site;
    if (!site) return;
    logEvent('SITE ' + site.code + ' LOCKED');
    text($('#map-band'), site.state === 'STRIKE' ? 'BAND 07' : (site.state === 'PRIMARY' ? 'BAND 02' : 'BAND 04'));
    const index = Number(event.detail?.index) || 0;
    const velocity = 1.12 + index * 0.41;
    const confidence = 88 + ((index * 3) % 9);
    text($('[data-stack-class]'), site.state);
    text($('[data-stack-vel]'), velocity.toFixed(2));
    text($('[data-stack-conf]'), String(confidence));
    const bar = $('[data-stack-bar]');
    if (bar) bar.style.width = confidence + '%';
  });

  startClock();
})();
