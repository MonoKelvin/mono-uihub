(() => {
  'use strict';
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];
  const state = {
    view: 'drive', mode: 'gt', locked: true, frunk: false, chargePort: false, mirrors: false,
    driver: 21.5, passenger: 21.5, auto: true, ac: true, defrost: false, sync: false,
    driverHeat: 0, passengerHeat: 0, fan: 3, chargeLimit: 80,
    playing: false, track: 0, elapsed: 0, volume: 35, previousVolume: 35,
    navigating: false, destination: 0,
  };
  const modes = {
    range: { name: '续航', description: '优先续航与能量效率', range: 446, response: '柔和', chassis: '舒适', recovery: '较强' },
    gt: { name: 'GT 巡航', description: '平衡动力与舒适', range: 412, response: '均衡', chassis: '自适应', recovery: '标准' },
    sport: { name: '运动', description: '更直接的动力与路感', range: 368, response: '敏锐', chassis: '运动', recovery: '较低' },
  };
  const destinations = [
    { name: '西岸艺术中心', address: '徐汇区龙腾大道 2555 号', minutes: 18, distance: 8.6, icon: 'building-community', route: 'M97 330 L141 260 L177 282 L223 244 L242 255', point: [242, 255], turn: '右转进入龙腾大道', turnDistance: '800 m', steps: [['arrow-ramp-right', '龙腾大道', '800 m'], ['arrow-up', '沿龙腾大道直行', '6.9 km'], ['map-pin', '西岸艺术中心', '900 m']] },
    { name: '上海国际赛车场', address: '嘉定区伊宁路 2000 号', minutes: 52, distance: 42.3, icon: 'flag-3', route: 'M97 330 L141 260 L168 217 L196 157 L212 117', point: [212, 117], turn: '前往内环高架路', turnDistance: '600 m', steps: [['arrow-ramp-right', '内环高架路', '600 m'], ['arrow-up', '沪嘉高速、上海绕城高速', '38.2 km'], ['map-pin', '伊宁路赛车场入口', '3.5 km']] },
    { name: '前滩太古里充电站', address: '浦东新区东育路 500 号', minutes: 24, distance: 12.1, icon: 'charging-pile', route: 'M97 330 L141 260 L202 298 L262 306 L311 327', point: [311, 327], turn: '前往龙耀路隧道', turnDistance: '1.2 km', steps: [['arrow-ramp-right', '龙耀路隧道', '1.2 km'], ['arrow-up', '沿耀龙路直行', '9.8 km'], ['charging-pile', '前滩太古里地下充电站', '1.1 km']] },
  ];
  const tracks = [
    { title: 'A Walk', artist: 'Tycho', duration: 316 },
    { title: 'Awake', artist: 'Tycho', duration: 284 },
    { title: 'Kerala', artist: 'Bonobo', duration: 237 },
  ];
  const dialog = $('#control-dialog');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const rootElement = document.documentElement;
  let dialogType = '';
  let dialogHistory = [];
  let dialogTrigger;
  let toastTimer;
  const icon = (name) => `<i class="ti ti-${name}" aria-hidden="true"></i>`;
  const formatTime = (seconds) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

  function stopContentMotion() {
    $$('.hero-content, .content-view, #dialog-content').forEach((element) => element.getAnimations().forEach((animation) => animation.cancel()));
  }
  function revealContent(element) {
    element.getAnimations().forEach((animation) => animation.cancel());
    if (reducedMotion.matches || rootElement.classList.contains('keyboard-input')) return;
    const tokens = getComputedStyle(rootElement);
    element.animate([{ opacity: .55 }, { opacity: 1 }], {
      duration: parseFloat(tokens.getPropertyValue('--motion-fast')),
      easing: tokens.getPropertyValue('--ease').trim(),
    });
  }
  document.addEventListener('keydown', () => {
    rootElement.classList.add('keyboard-input');
    stopContentMotion();
  }, { capture: true });
  document.addEventListener('pointerdown', () => rootElement.classList.remove('keyboard-input'), { passive: true, capture: true });
  reducedMotion.addEventListener('change', () => { if (reducedMotion.matches) stopContentMotion(); });

  function notify(message) {
    clearTimeout(toastTimer);
    $('#toast').textContent = message;
    $('#toast').classList.add('is-visible');
    toastTimer = setTimeout(() => $('#toast').classList.remove('is-visible'), 2600);
  }
  function updateClock() {
    const now = new Date();
    $('#clock').textContent = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false });
    $('#clock').dateTime = now.toISOString();
  }
  updateClock();
  setInterval(updateClock, 30000);

  function setView(view) {
    if (state.view === view) return;
    stopContentMotion();
    state.view = view;
    $('.cockpit').dataset.view = view;
    $$('.view-tab').forEach((button) => {
      button.classList.toggle('is-active', button.dataset.view === view);
      button.setAttribute('aria-pressed', String(button.dataset.view === view));
    });
    ['drive', 'energy', 'journey'].forEach((key) => { $(`#${key}-content`).hidden = key !== view; });
    $('#view-title').textContent = { drive: '车辆概览', energy: '能量与充电', journey: '行程统计' }[view];
    revealContent($(`#${view}-content`));
  }
  function setMode(mode) {
    if (state.mode === mode) return;
    state.mode = mode;
    $('#mode-description').textContent = modes[mode].description;
    $('#range-value').textContent = modes[mode].range;
    $$('[data-mode]').forEach((button) => {
      button.classList.toggle('is-active', button.dataset.mode === mode);
      button.setAttribute('aria-pressed', String(button.dataset.mode === mode));
    });
    if (dialog.open && dialogType === 'mode') updateModeDetails();
    updateNavigation();
    notify(`已切换至${modes[mode].name}模式`);
  }
  function updateVehicle() {
    $('#lock-button').setAttribute('aria-pressed', String(state.locked));
    $('#lock-button').setAttribute('aria-label', state.locked ? '解锁车门' : '锁定车门');
    $('#lock-button .ti').className = `ti ti-${state.locked ? 'lock' : 'lock-open'}`;
    $('#lock-label').textContent = state.locked ? '已锁定' : '已解锁';
    $('#frunk-button').setAttribute('aria-pressed', String(state.frunk));
    $('#frunk-label').textContent = state.frunk ? '关闭' : '开启';
    $('#charge-port-button').setAttribute('aria-pressed', String(state.chargePort));
    $('#charge-port-label').textContent = state.chargePort ? '关闭' : '开启';
    $('#frunk-pin').hidden = !state.frunk;
    $('#charge-pin').hidden = !state.chargePort;
    $('#mirror-pin').hidden = !state.mirrors;
    $('#vehicle-note').textContent = state.frunk ? '已驻车，前备厢未关闭' : state.chargePort ? '已驻车，充电口已打开' : '已驻车，系统正常';
  }
  function updateClimate() {
    ['driver', 'passenger'].forEach((side) => {
      const text = `${state[side].toFixed(1)}°`;
      $(`#${side}-temp`).textContent = text;
      $$(`[data-temperature-output="${side}"]`).forEach((output) => { output.textContent = text; });
      $$(`[data-temp="${side}"]`).forEach((button) => { button.disabled = Number(button.dataset.delta) < 0 ? state[side] <= 16 : state[side] >= 30; });
      $$(`[data-seat="${side}"]`).forEach((button) => {
        const heat = state[`${side}Heat`];
        const label = `${side === 'driver' ? '主驾' : '副驾'}座椅加热，${heat ? `${heat}挡` : '已关闭'}`;
        button.setAttribute('aria-label', label);
        button.querySelectorAll('.heat-level i').forEach((dot, index) => dot.classList.toggle('is-on', index < heat));
        const output = button.querySelector('.seat-output');
        if (output) output.textContent = heat ? `${heat}挡` : '关闭';
      });
    });
    $('#climate-status').textContent = state.auto ? '自动空调' : `手动风量 ${state.fan} 挡`;
    $('#climate-detail').textContent = state.defrost ? '前挡除雾已开启' : state.ac ? 'A/C 已开启' : 'A/C 已关闭';
    $$('[data-climate]').forEach((button) => button.setAttribute('aria-pressed', String(state[button.dataset.climate])));
    $$('[data-setting="sync"]').forEach((button) => button.setAttribute('aria-checked', String(state.sync)));
    $$('[data-fan]').forEach((button) => {
      button.classList.toggle('is-on', Number(button.dataset.fan) <= state.fan);
      button.setAttribute('aria-pressed', String(Number(button.dataset.fan) === state.fan));
    });
    if ($('#fan-value')) $('#fan-value').textContent = `${state.fan} 挡${state.auto ? ' / 自动' : ''}`;
  }
  function changeTemperature(side, delta) {
    state[side] = Math.max(16, Math.min(30, state[side] + delta));
    if (state.sync) state.driver = state.passenger = state[side];
    updateClimate();
  }
  function toggleClimate(key) {
    state[key] = !state[key];
    if (key === 'auto' && state.auto) { state.ac = true; state.defrost = false; }
    if (key === 'ac' && !state.ac) { state.auto = false; state.defrost = false; }
    if (key === 'defrost' && state.defrost) { state.ac = true; state.auto = false; }
    updateClimate();
  }
  function arrivalCharge() {
    return Math.max(0, 78 - Math.ceil(destinations[state.destination].distance / modes[state.mode].range * 78));
  }
  function updateNavigation() {
    const place = destinations[state.destination];
    $('#destination-name').textContent = place.name;
    $('#destination-time').textContent = place.minutes;
    $('#destination-distance').textContent = place.distance.toFixed(1);
    $('#arrival-charge').textContent = `${arrivalCharge()}%`;
    ['#map-route', '#map-route-line'].forEach((selector) => $(selector).setAttribute('d', place.route));
    $('#map-destination').setAttribute('cx', place.point[0]);
    $('#map-destination').setAttribute('cy', place.point[1]);
    $('#route-button').classList.toggle('is-active', state.navigating);
    $('#route-button > span').textContent = state.navigating ? '结束导航' : '开始导航';
    $('#route-button .ti').className = `ti ti-${state.navigating ? 'x' : 'navigation'}`;
    $('#destination-type').textContent = state.navigating ? '正在导航' : '已选目的地';
    $('#navigation-instruction').hidden = !state.navigating;
    $('#navigation-instruction b').textContent = place.turnDistance;
    $('#navigation-instruction div > span').textContent = place.turn;
    $('.map').setAttribute('aria-label', `前往${place.name}的路线，${place.distance}公里`);
  }
  function toggleNavigation() {
    state.navigating = !state.navigating;
    updateNavigation();
    notify(state.navigating ? `前往${destinations[state.destination].name}，预计 ${destinations[state.destination].minutes} 分钟` : '导航已结束');
  }
  function updatePlayer() {
    const track = tracks[state.track];
    $('#track-title').textContent = track.title;
    $('#track-artist').textContent = track.artist;
    $('#play-button').setAttribute('aria-label', state.playing ? '暂停音乐' : '播放音乐');
    $('#play-button').setAttribute('aria-pressed', String(state.playing));
    $('#play-button .ti').className = `ti ti-player-${state.playing ? 'pause' : 'play'}`;
    $('.music-panel').classList.toggle('is-playing', state.playing);
    if (dialog.open && dialogType === 'media') {
      $('#media-title').textContent = track.title;
      $('#media-artist').textContent = track.artist;
      $('#media-play').setAttribute('aria-label', state.playing ? '暂停音乐' : '播放音乐');
      $('#media-play').setAttribute('aria-pressed', String(state.playing));
      $('#media-play .ti').className = `ti ti-player-${state.playing ? 'pause' : 'play'}`;
      $('#media-seek').max = track.duration;
      $('#media-seek').value = state.elapsed;
      $('#media-elapsed').textContent = formatTime(state.elapsed);
      $('#media-duration').textContent = formatTime(track.duration);
      $$('[data-track]').forEach((button) => {
        button.classList.toggle('is-active', Number(button.dataset.track) === state.track);
        button.setAttribute('aria-pressed', String(Number(button.dataset.track) === state.track));
      });
    }
  }
  function changeTrack(index) {
    state.track = (index + tracks.length) % tracks.length;
    state.elapsed = 0;
    updatePlayer();
  }
  setInterval(() => {
    if (!state.playing) return;
    state.elapsed += 1;
    if (state.elapsed >= tracks[state.track].duration) changeTrack(state.track + 1);
    else updatePlayer();
  }, 1000);

  function switchRow(key, title, description) {
    return `<div class="settings-row"><div><span>${title}</span><p>${description}</p></div><button class="switch" role="switch" aria-label="${title}" aria-checked="${state[key]}" data-setting="${key}"><span class="switch-track"></span></button></div>`;
  }
  function renderDestinations(query = '') {
    const places = destinations.map((place, index) => ({ ...place, index })).filter((place) => `${place.name}${place.address}`.includes(query.trim()));
    $('#destination-results').innerHTML = places.length ? places.map((place) => `<button class="destination-option" data-destination="${place.index}">${icon(place.icon)}<span><strong>${place.name}</strong><small>${place.address}</small></span><span class="number">${place.distance} km</span></button>`).join('') : '<p class="empty-state">没有找到这个地点。试试“西岸”“赛车场”或“充电站”。</p>';
  }
  function updateModeDetails() {
    const mode = modes[state.mode];
    $('#dialog-title').textContent = `${mode.name}模式`;
    $('#mode-response').textContent = mode.response;
    $('#mode-chassis').textContent = mode.chassis;
    $('#mode-recovery').textContent = mode.recovery;
    $('#mode-range').textContent = `${mode.range} km`;
  }
  function updateCharge() {
    $('#charge-limit-summary').innerHTML = `${state.chargeLimit}<small>%</small>`;
    if (dialog.open && dialogType === 'charge') {
      $('#range-output').textContent = state.chargeLimit;
      $('#dialog-range').value = state.chargeLimit;
      $$('[data-charge-preset]').forEach((button) => button.setAttribute('aria-pressed', String(Number(button.dataset.chargePreset) === state.chargeLimit)));
      $('#charge-note').textContent = state.chargeLimit <= 78 ? '当前电量已达到设定上限，接入电源后无需继续充电。' : `当前电量 78%，接入电源后将充至 ${state.chargeLimit}%。`;
    }
  }
  function updateVolume() {
    $('.volume-button .ti').className = `ti ti-${state.volume ? 'volume' : 'volume-off'}`;
    if (state.volume) state.previousVolume = state.volume;
    if (dialog.open && dialogType === 'volume') {
      $('#range-output').textContent = state.volume;
      $('#dialog-range').value = state.volume;
      $('#mute-button').setAttribute('aria-pressed', String(state.volume === 0));
      $('#mute-button span').textContent = state.volume === 0 ? '恢复音量' : '静音';
    }
  }
  function openDialog(type, trigger, remember = true) {
    const titles = { destination: '选择目的地', settings: '车辆设置', climate: '座舱舒适', volume: '媒体音量', charge: '充电设置', mode: '驾驶模式', route: '路线详情', tires: '胎压监测', media: '正在播放' };
    const wasOpen = dialog.open;
    if (!wasOpen) {
      dialogTrigger = trigger || document.activeElement;
      dialogHistory = [];
    } else if (remember && type !== dialogType) dialogHistory.push(dialogType);
    dialogType = type;
    $('#dialog-back').hidden = !dialogHistory.length;
    $('#dialog-title').textContent = titles[type];
    $('#dialog-context').textContent = type === 'route' ? destinations[state.destination].name : '极点 GT';
    const content = $('#dialog-content');
    if (type === 'destination') {
      content.innerHTML = `<label class="destination-search">${icon('search')}<input type="search" id="destination-search" placeholder="搜索地点或充电站" aria-label="搜索目的地" autocomplete="off"></label><div id="destination-results"></div>`;
      renderDestinations();
    } else if (type === 'settings') {
      content.innerHTML = switchRow('mirrors', '折叠后视镜', '收起两侧后视镜') + switchRow('sync', '双区温度同步', '主驾与副驾使用相同温度') + `<button class="destination-option" data-dialog="tires">${icon('car-4wd')}<span><strong>胎压监测</strong><small>四轮胎压正常</small></span>${icon('chevron-right')}</button><button class="destination-option" data-dialog="volume">${icon('volume')}<span><strong>媒体音量</strong><small>当前 ${state.volume}%</small></span>${icon('chevron-right')}</button>`;
    } else if (type === 'climate') {
      content.innerHTML = `<div class="temperature-zones">${['driver', 'passenger'].map((side) => `<div class="temperature-zone"><span>${side === 'driver' ? '主驾' : '副驾'}</span><div class="zone-stepper"><button class="icon-button" data-temp="${side}" data-delta="-0.5" aria-label="降低${side === 'driver' ? '主驾' : '副驾'}温度">${icon('minus')}</button><output class="number" data-temperature-output="${side}"></output><button class="icon-button" data-temp="${side}" data-delta="0.5" aria-label="升高${side === 'driver' ? '主驾' : '副驾'}温度">${icon('plus')}</button></div></div>`).join('')}</div>${switchRow('sync', '温度同步', '两侧温度随当前调整同步')}<div class="climate-options"><button class="climate-option" data-climate="auto" aria-pressed="${state.auto}">${icon('refresh')}自动</button><button class="climate-option" data-climate="ac" aria-pressed="${state.ac}">${icon('snowflake')}A/C</button><button class="climate-option" data-climate="defrost" aria-pressed="${state.defrost}">${icon('wind')}前挡除雾</button></div><div class="fan-heading"><span>风量</span><span class="number" id="fan-value"></span></div><div class="fan-levels" role="group" aria-label="风量挡位">${Array.from({ length: 7 }, (_, index) => `<button data-fan="${index + 1}" aria-label="风量${index + 1}挡">${index + 1}</button>`).join('')}</div><div class="settings-row"><span>座椅加热</span><div class="climate-options seat-options">${['driver', 'passenger'].map((side) => `<button class="climate-option" data-seat="${side}">${icon('armchair')}<span>${side === 'driver' ? '主驾' : '副驾'} <span class="seat-output"></span></span></button>`).join('')}</div></div>`;
      updateClimate();
    } else if (type === 'mode') {
      content.innerHTML = '<dl class="mode-detail-list"><div><dt>动力响应</dt><dd id="mode-response"></dd></div><div><dt>底盘设定</dt><dd id="mode-chassis"></dd></div><div><dt>动能回收</dt><dd id="mode-recovery"></dd></div><div><dt>预计续航</dt><dd class="number" id="mode-range"></dd></div></dl>' + `<div class="mode-selector mode-dialog-selector">${Object.entries(modes).map(([key, mode]) => `<button data-mode="${key}" aria-pressed="${state.mode === key}" class="${state.mode === key ? 'is-active' : ''}">${mode.name}</button>`).join('')}</div>`;
      updateModeDetails();
    } else if (type === 'route') {
      const place = destinations[state.destination];
      content.innerHTML = `<div class="route-summary"><span><b class="number">${place.minutes}</b> <small>分钟</small></span><span><b class="number">${place.distance}</b> <small>km</small></span></div><p class="dialog-note">到达时预计电量 ${arrivalCharge()}%</p><ol class="route-steps">${place.steps.map(([symbol, name, distance]) => `<li>${icon(symbol)}<span>${name}</span><small class="number">${distance}</small></li>`).join('')}</ol><button class="primary-button dialog-full-button" id="dialog-route-button">${icon(state.navigating ? 'x' : 'navigation')}${state.navigating ? '结束导航' : '开始导航'}</button>`;
    } else if (type === 'tires') {
      content.innerHTML = '<div class="tires-layout"><div class="tire-pair"><div><strong>2.6 <small>bar</small></strong><span>左前轮</span></div><div><strong>2.7 <small>bar</small></strong><span>左后轮</span></div></div><img src="assets/vehicle.svg" alt="车辆四轮位置俯视图"><div class="tire-pair"><div><strong>2.6 <small>bar</small></strong><span>右前轮</span></div><div><strong>2.7 <small>bar</small></strong><span>右后轮</span></div></div></div><p class="dialog-note">四轮胎压正常。胎压会随环境温度和行驶状态变化。</p>';
    } else if (type === 'media') {
      content.innerHTML = `<div class="media-header"><span class="album-art" aria-hidden="true"><span></span></span><div><h3 id="media-title"></h3><p id="media-artist"></p></div></div><input class="range-control" id="media-seek" type="range" min="0" aria-label="播放进度"><div class="range-caption number"><span id="media-elapsed"></span><span id="media-duration"></span></div><div class="media-controls"><button class="icon-button" data-player="previous" aria-label="上一首">${icon('player-skip-back')}</button><button class="icon-button media-play" id="media-play" data-player="toggle" aria-label="播放音乐">${icon('player-play')}</button><button class="icon-button" data-player="next" aria-label="下一首">${icon('player-skip-forward')}</button><button class="icon-button" data-dialog="volume" aria-label="调节媒体音量">${icon('volume')}</button></div><div aria-label="播放列表">${tracks.map((track, index) => `<button class="media-track" data-track="${index}"><span>${track.title}</span><span>${track.artist}</span><span class="number">${formatTime(track.duration)}</span></button>`).join('')}</div>`;
    } else if (type === 'charge' || type === 'volume') {
      const charge = type === 'charge';
      const value = charge ? state.chargeLimit : state.volume;
      content.innerHTML = `<label for="dialog-range">${charge ? '充电上限' : '当前音量'}</label><div class="dialog-value number"><output id="range-output" for="dialog-range">${value}</output><small>%</small></div><input class="range-control" id="dialog-range" type="range" min="${charge ? 50 : 0}" max="100" value="${value}" aria-label="${titles[type]}"><div class="range-caption"><span>${charge ? '50%' : '静音'}</span><span>100%</span></div>`;
      content.innerHTML += charge ? '<div class="preset-buttons"><button data-charge-preset="80">日常 80%</button><button data-charge-preset="100">长途 100%</button></div><p class="dialog-note" id="charge-note"></p>' : `<button class="outlined-button dialog-full-button" id="mute-button" aria-pressed="${state.volume === 0}">${icon('volume-off')}<span>${state.volume === 0 ? '恢复音量' : '静音'}</span></button>`;
    }
    if (!dialog.open) dialog.showModal();
    else $('#close-dialog').focus();
    if (type === 'destination') $('#destination-search').focus();
    if (type === 'media') updatePlayer();
    if (type === 'charge') updateCharge();
    if (type === 'volume') updateVolume();
    if (wasOpen) revealContent(content);
  }

  // One handler keeps main-screen controls and the control sheets synchronized.
  document.addEventListener('click', (event) => {
    const button = event.target.closest('button');
    if (!button || button.disabled) return;
    if (event.detail === 0) rootElement.classList.add('keyboard-input');
    if (button.dataset.dialog) { openDialog(button.dataset.dialog, button); return; }
    if (button.dataset.view) { setView(button.dataset.view); return; }
    if (button.dataset.mode) { setMode(button.dataset.mode); return; }
    if (button.dataset.temp) { changeTemperature(button.dataset.temp, Number(button.dataset.delta)); return; }
    if (button.dataset.climate) { toggleClimate(button.dataset.climate); return; }
    if (button.dataset.fan) { state.fan = Number(button.dataset.fan); state.auto = false; updateClimate(); return; }
    if (button.dataset.seat) {
      const side = button.dataset.seat;
      state[`${side}Heat`] = (state[`${side}Heat`] + 1) % 4;
      updateClimate();
      if (!dialog.open) notify(`${side === 'driver' ? '主驾' : '副驾'}座椅加热${state[`${side}Heat`] ? ` ${state[`${side}Heat`]} 挡` : '已关闭'}`);
      return;
    }
    if (button.dataset.setting) {
      const key = button.dataset.setting;
      state[key] = !state[key];
      button.setAttribute('aria-checked', String(state[key]));
      if (key === 'sync' && state.sync) state.passenger = state.driver;
      updateClimate();
      updateVehicle();
      return;
    }
    if (button.dataset.destination !== undefined) {
      state.destination = Number(button.dataset.destination);
      state.navigating = false;
      updateNavigation();
      dialog.close();
      notify(`已选择${destinations[state.destination].name}`);
      return;
    }
    if (button.dataset.chargePreset) { state.chargeLimit = Number(button.dataset.chargePreset); updateCharge(); return; }
    if (button.dataset.track !== undefined) { changeTrack(Number(button.dataset.track)); return; }
    if (button.dataset.player) {
      if (button.dataset.player === 'toggle') { state.playing = !state.playing; updatePlayer(); }
      else changeTrack(state.track + (button.dataset.player === 'next' ? 1 : -1));
      return;
    }
    switch (button.id) {
      case 'lock-button': state.locked = !state.locked; updateVehicle(); notify(state.locked ? '车门已锁定' : '车门已解锁'); break;
      case 'frunk-button': state.frunk = !state.frunk; updateVehicle(); break;
      case 'charge-port-button': state.chargePort = !state.chargePort; updateVehicle(); break;
      case 'play-button': state.playing = !state.playing; updatePlayer(); break;
      case 'next-button': changeTrack(state.track + 1); break;
      case 'route-button': toggleNavigation(); break;
      case 'dialog-route-button': toggleNavigation(); dialog.close(); break;
      case 'close-dialog': dialog.close(); break;
      case 'dialog-back': if (dialogHistory.length) openDialog(dialogHistory.pop(), null, false); break;
      case 'mute-button': state.volume = state.volume ? 0 : state.previousVolume; updateVolume(); break;
      case 'map-center':
        $('.map').classList.remove('is-recentering');
        requestAnimationFrame(() => requestAnimationFrame(() => $('.map').classList.add('is-recentering')));
        notify('已回到当前位置');
        break;
    }
  });
  dialog.addEventListener('input', (event) => {
    if (event.target.id === 'destination-search') renderDestinations(event.target.value);
    if (event.target.id === 'media-seek') { state.elapsed = Number(event.target.value); updatePlayer(); }
    if (event.target.id === 'dialog-range') {
      if (dialogType === 'charge') { state.chargeLimit = Number(event.target.value); updateCharge(); }
      if (dialogType === 'volume') { state.volume = Number(event.target.value); updateVolume(); }
    }
  });
  dialog.addEventListener('click', (event) => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => { dialogType = ''; dialogHistory = []; if (dialogTrigger?.isConnected) dialogTrigger.focus(); });
  ['#car-render', '#energy-render'].forEach((selector) => {
    const image = $(selector);
    const fallback = () => { image.classList.add('is-fallback'); image.src = 'assets/vehicle.svg'; image.alt = '纯电超跑车辆俯视图'; };
    image.addEventListener('error', fallback, { once: true });
    if (image.complete && !image.naturalWidth) fallback();
  });
  updateVehicle();
  updateClimate();
  updateNavigation();
})();
