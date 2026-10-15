(() => {
  'use strict';

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const escapeHTML = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const svgNS = 'http://www.w3.org/2000/svg';
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const sessionStart = Date.now();
  const routes = {
    today: {
      distance: '5.8', copy: '纽约的晚高峰，<br>他一般走上面。',
      stops: [
        { time: '17:16', place: '炮台公园', x: 274, y: 537, detail: '帮游客找回被风吹走的帽子' },
        { time: '17:34', place: '苏豪区', x: 315, y: 430, detail: '百老汇上空，朝北摆荡' },
        { time: '17:51', place: '格林威治', x: 290, y: 335, detail: '华盛顿广场旁的屋顶' },
        { time: '18:08', place: '熨斗大厦', x: 393, y: 277, detail: '路口停留，扶起一辆自行车' },
        { time: '18:26', place: '第五大道', x: 443, y: 230, detail: '沿第五大道向中城移动' },
        { time: '18:42', place: '帝国大厦', x: 490, y: 156, detail: '楼顶短暂停留' }
      ]
    },
    yesterday: {
      distance: '4.3', copy: '昨天拯救了世界，<br>也救了一只猫。',
      stops: [
        { time: '16:02', place: '皇后区', x: 690, y: 119, detail: '地铁站外出现红蓝身影' },
        { time: '16:24', place: '东河', x: 626, y: 255, detail: '沿东河大桥向南移动' },
        { time: '16:47', place: '威廉斯堡', x: 617, y: 359, detail: '帮助居民找回走失的小猫' },
        { time: '17:11', place: '大桥东岸', x: 502, y: 495, detail: '桥塔上停留三分钟' },
        { time: '17:38', place: '金融区', x: 305, y: 500, detail: '制止一起街头争执' },
        { time: '18:05', place: '苏豪区', x: 315, y: 430, detail: '最后目击于百老汇上空' }
      ]
    }
  };
  const places = {
    midtown: { label: '帝国大厦 / 中城', x: 490, y: 156 },
    soho: { label: '苏豪区 / 百老汇', x: 315, y: 430 },
    greenwich: { label: '格林威治村', x: 290, y: 335 },
    brooklyn: { label: '布鲁克林大桥', x: 449, y: 512 },
    queens: { label: '皇后区', x: 690, y: 119 }
  };
  const routeCoordinates = {
    today: [[40.7033, -74.0170], [40.7246, -73.9996], [40.7308, -73.9973], [40.7411, -73.9897], [40.7453, -73.9869], [40.7484, -73.9857]],
    yesterday: [[40.7447, -73.9485], [40.7218, -73.9581], [40.7146, -73.9618], [40.7034, -73.9894], [40.7099, -74.0084], [40.7246, -73.9996]]
  };
  Object.entries(routes).forEach(([date, route]) => route.stops.forEach((stop, index) => { stop.latlng = routeCoordinates[date][index]; }));
  Object.assign(places.midtown, { latlng: [40.7484, -73.9857] });
  Object.assign(places.soho, { latlng: [40.7246, -73.9996] });
  Object.assign(places.greenwich, { latlng: [40.7308, -73.9973] });
  Object.assign(places.brooklyn, { latlng: [40.7061, -73.9969] });
  Object.assign(places.queens, { latlng: [40.7447, -73.9485] });
  const candidates = [
    { id: 'peter', name: '彼得·帕克', occupation: '摄影师 / 经常迟到', avatar: 11, confidence: 87,
      evidence: [ ['目击时间高度吻合', '6 次蜘蛛侠出现时，他都“刚好有事离开”。'], ['独家照片来源', '总能拍到近距离的蜘蛛侠照片，镜头位置尤其可疑。'] ],
      against: ['本人坚持否认', '“我？我连体育课都差点不及格。”'], note: '线索关联度不代表身份结论。还缺一张同时出现的合照。' },
    { id: 'miles', name: '迈尔斯·莫拉莱斯', occupation: '学生 / 涂鸦爱好者', avatar: 13, confidence: 64,
      evidence: [ ['皇后区活动重叠', '放学后的活动范围，与部分目击区域重叠。'], ['运动能力异常', '曾轻松越过学校围墙，理由是“校门关了”。'] ],
      against: ['战衣特征不符', '附近目击的黑红战衣，与当前红蓝目标存在差异。'], note: '也许纽约不止一位好邻居。保留线索，继续观察。' },
    { id: 'flash', name: '弗拉什·汤普森', occupation: '蜘蛛侠头号粉丝', avatar: 14, confidence: 12,
      evidence: [ ['本人非常确信', '多次在群聊中暗示自己“有一个秘密身份”。'], ['收藏完整战衣', '衣柜里有一套蜘蛛侠战衣，吊牌还没拆。'] ],
      against: ['有明确不在场证据', '最近一次目击发生时，他正在直播吃汉堡。'], note: '热爱一位英雄，不一定要成为那位英雄。' }
  ];
  const incidents = [
    { id: 'inc-1', title: '珠宝店触发入侵警报', place: '苏豪区，百老汇 580 号', severity: 'high', time: '18:39', x: 346, y: 447, status: 'active', claimed: false, source: '街区商户联防', description: '店铺卷帘门被强行打开，现场有两名可疑人员。商户已疏散顾客，附近观察员正在核实情况。', witnesses: 4 },
    { id: 'inc-2', title: '失控车辆驶向大桥', place: '布鲁克林大桥，西侧入口', severity: 'medium', time: '18:35', x: 431, y: 484, status: 'active', claimed: false, source: '路口目击报告', description: '一辆货车疑似制动故障，正在向大桥入口滑行。路口交通已暂缓，等待现场进一步消息。', witnesses: 7 },
    { id: 'inc-3', title: '街头抢包，嫌疑人逃离', place: '切尔西，第八大道', severity: 'low', time: '18:28', x: 298, y: 248, status: 'active', claimed: false, source: '群众目击', description: '一名行人的背包被抢走，嫌疑人沿第八大道向南跑去。失主目前安全，附近店铺提供了逃离方向。', witnesses: 2 },
    { id: 'inc-4', title: '被困电梯乘客已获救', place: '熨斗大厦附近', severity: 'medium', time: '18:12', x: 393, y: 290, status: 'resolved', claimed: true, source: '街区商户联防', description: '三名乘客已安全离开故障电梯。维修人员已接手，附近街区恢复正常。', witnesses: 5 },
    { id: 'inc-5', title: '走失小猫回到主人身边', place: '格林威治村', severity: 'low', time: '17:54', x: 277, y: 354, status: 'resolved', claimed: true, source: '群众目击', description: '小猫从消防梯上获救，已由主人接回。英雄的战衣上可能多了几根猫毛。', witnesses: 3 }
  ];
  const messages = [
    { id: 'msg-1', name: '住在五楼的莉兹', avatar: 47, time: '刚刚', content: '他刚从我窗外荡过去！手里好像还拿着半块披萨。', sighting: true, place: 'midtown', likes: 24, liked: false },
    { id: 'msg-2', name: '皇后区老本的热狗摊', avatar: 53, time: '2 分钟前', content: '小蜘蛛，今天的热狗给你留着。拯救世界也要吃饭啊。', sighting: false, place: 'queens', likes: 86, liked: false },
    { id: 'msg-3', name: 'J. 乔纳·詹姆森', avatar: 60, time: '5 分钟前', content: '又在大厦之间乱荡！有人考虑过玻璃清洁工的感受吗？', sighting: false, place: 'midtown', likes: 3, liked: false },
    { id: 'msg-4', name: '苏豪区夜班店员', avatar: 44, time: '8 分钟前', content: '百老汇的警报响了，有人看到蜘蛛侠往这边来吗？', sighting: true, place: 'soho', likes: 12, liked: false }
  ];
  const incidentCoordinates = [[40.7246, -73.9974], [40.7123, -74.0048], [40.7461, -74.0013], [40.7411, -73.9897], [40.7314, -73.9985]];
  messages.forEach((message, index) => { message.receivedAt = sessionStart - [0, 120000, 300000, 480000][index]; });
  incidents.forEach((item, index) => { item.latlng = incidentCoordinates[index]; });
  const sightings = [places.midtown, places.soho, places.greenwich, places.brooklyn].map(point => ({ ...point }));
  const patrol = [
    { ...routes.today.stops[5], address: '350 第五大道，曼哈顿' },
    { x: 478, y: 139, latlng: [40.7507, -73.9878], place: '先驱广场', address: '西 34 街，曼哈顿' },
    { x: 491, y: 118, latlng: [40.7536, -73.9832], place: '布莱恩公园', address: '第六大道与西 42 街' },
    { x: 513, y: 130, latlng: [40.7527, -73.9772], place: '中央车站', address: '89 东 42 街，曼哈顿' }
  ];
  const state = { date: 'today', selectedStop: 5, mode: 'live', progress: 0, speed: 1, frame: 0, lastFrame: 0, filter: 'active', sightingsOnly: false, sound: false, zoom: 1.15, tx: -67.5, ty: -48.75, newSightings: 0, reports: 0, id: 10, liveEnabled: true, livePosition: { ...patrol[0] }, liveElapsed: 0, liveFrame: 0, liveLastFrame: 0, livePhase: -1, lastSeenAt: Date.now(), follow: true, pendingMessages: [] };
  let cityMap = null;
  let randomMessageTimer;
  let eventIsPointer = true;
  let toastTimer;
  let audioContext;
  const detailDialog = $('#detail-dialog');
  const map = $('#city-map');
  const camera = $('#map-camera');
  const marker = $('#spidey-marker');
  const rightColumn = $('.right-column');
  let detailOpener;
  rightColumn.append(detailDialog);

  const compactLayout = matchMedia('(max-width: 1100px), (max-height: 700px)');
  function updateMapViewport() {
    map.setAttribute('viewBox', compactLayout.matches || $('.map-expanded') ? '0 0 900 650' : '-390 -25 1290 700');
  }
  compactLayout.addEventListener('change', updateMapViewport);
  updateMapViewport();

  function notify(message) {
    const toast = $('#toast');
    $('span', toast).textContent = message;
    toast.classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('visible'), 3400);
  }

  function animateContent(element) {
    if (reduceMotion.matches || !eventIsPointer || !element.animate) return;
    element.getAnimations().forEach(animation => animation.cancel());
    element.animate([{ opacity: .4, transform: 'translateY(4px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 180, easing: 'cubic-bezier(.23, 1, .32, 1)' });
  }

  function chime() {
    if (!state.sound || !audioContext) return;
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(620, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(830, audioContext.currentTime + .13);
    gain.gain.setValueAtTime(.045, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(.001, audioContext.currentTime + .22);
    oscillator.connect(gain).connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + .23);
  }

  function openDetail(kicker, html) {
    if ($('.map-expanded')) setExpanded(false);
    const alreadyOpen = detailDialog.open;
    const previousAction = document.activeElement.dataset.action;
    $('#dialog-kicker').textContent = kicker;
    $('#dialog-content').innerHTML = html;
    if (!alreadyOpen) {
      detailOpener = document.activeElement;
      $('.incidents-section').inert = true;
      $('.community-section').inert = true;
      rightColumn.classList.add('has-detail');
      detailDialog.show();
      $('#close-dialog').focus({ preventScroll: true });
      if (compactLayout.matches) rightColumn.scrollIntoView({ block: 'start', behavior: reduceMotion.matches ? 'instant' : 'smooth' });
    }
    else ($$('[data-action]', detailDialog).find(button => button.dataset.action === previousAction) || $('#close-dialog')).focus();
  }

  function setCamera(animate = true) {
    camera.style.transition = animate && !reduceMotion.matches ? 'transform 250ms cubic-bezier(.23, 1, .32, 1)' : 'none';
    camera.style.transformOrigin = '0 0';
    camera.style.transform = `matrix(${state.zoom}, 0, 0, ${state.zoom}, ${state.tx}, ${state.ty})`;
    if (!cityMap?.active) {
      $('#zoom-in').disabled = state.zoom >= 3.8;
      $('#zoom-out').disabled = state.zoom <= .7;
      $('#map-scale-value').textContent = `${Math.round(500 / state.zoom)} m`;
      $('#map-zoom-value').textContent = `${state.zoom.toFixed(1)}×`;
    }
  }

  function focusPoint(point, zoom = 1.4) {
    if (cityMap?.active) { cityMap.focus(point, 15.5); return; }
    state.zoom = zoom;
    state.tx = 450 - point.x * zoom;
    state.ty = 325 - point.y * zoom;
    setCamera();
  }

  function showMapSelection(text, point) {
    state.follow = false;
    $('#map-selection-text').textContent = text;
    $('#map-selection').hidden = false;
    if (point) focusPoint(point);
    if (matchMedia('(max-width: 1120px), (max-height: 670px)').matches) $('.workspace').scrollTo({ top: 0, behavior: reduceMotion.matches ? 'instant' : 'smooth' });
  }

  function positionMarker(point, title, detail) {
    state.markerPoint = point;
    state.markerTitle = title;
    state.markerDetail = detail;
    marker.setAttribute('transform', `translate(${point.x} ${point.y})`);
    if ($('#marker-name').textContent !== title) $('#marker-name').textContent = title;
    if ($('#marker-detail').textContent !== detail) $('#marker-detail').textContent = detail;
    cityMap?.position(point, title, detail);
  }

  function renderIdentities() {
    $('#identity-list').innerHTML = candidates.map(person => `<button class="identity-row" data-person="${person.id}" aria-label="查看${person.name}的身份线索，关联度 ${person.confidence}%"><img src="https://i.pravatar.cc/100?img=${person.avatar}" alt="${person.name}头像" width="35" height="39"><div><strong>${person.name}</strong><p>${person.occupation}</p></div><span class="identity-score mono">${person.confidence}<small>%</small></span></button>`).join('');
  }

  function showPerson(id) {
    const person = candidates.find(item => item.id === id);
    if (!person) return;
    openDetail('面罩之下 / 候选人线索', `<div class="dialog-person"><img src="https://i.pravatar.cc/120?img=${person.avatar}" alt="${person.name}头像"><div><h2 id="dialog-title">${person.name}</h2><p class="dialog-description">${person.occupation}</p><p class="mono">线索关联度 ${person.confidence}%</p></div></div><ul class="evidence-list">${person.evidence.map(([title, text]) => `<li><i class="ti ti-link" aria-hidden="true"></i><div><strong>${title}</strong><p>${text}</p></div></li>`).join('')}<li class="contradiction"><i class="ti ti-alert-circle" aria-hidden="true"></i><div><strong>${person.against[0]}</strong><p>${person.against[1]}</p></div></li></ul><p class="dialog-note">${person.note}</p><div class="dialog-actions"><button class="button button-blue" data-action="person-map" data-person="${person.id}"><i class="ti ti-map-pin" aria-hidden="true"></i>查看关联街区</button><button class="button button-outline" data-action="next-person" data-person="${person.id}">下一位候选人</button></div>`);
  }

  function severityInfo(incident) {
    if (incident.status === 'resolved') return { label: '已解决', icon: 'circle-check', css: 'resolved' };
    if (incident.claimed) return { label: '跟进中', icon: 'radar', css: 'low' };
    return { high: { label: '紧急', icon: 'alert-triangle', css: '' }, medium: { label: '关注', icon: 'alert-circle', css: 'medium' }, low: { label: '待核实', icon: 'info-circle', css: 'low' } }[incident.severity];
  }

  function renderIncidents() {
    const active = incidents.filter(item => item.status === 'active').length;
    const resolved = incidents.length - active;
    $('#pending-count').textContent = String(active).padStart(2, '0');
    $('#incident-count').textContent = active;
    $('#active-total').textContent = active;
    $('#resolved-total').textContent = resolved;
    const visible = incidents.filter(item => item.status === state.filter);
    $('#incident-list').innerHTML = visible.length ? visible.map(item => {
      const severity = severityInfo(item);
      return `<button class="incident-item ${item.status === 'active' && item.severity === 'high' ? 'is-urgent' : ''}" data-incident="${item.id}"><span class="incident-topline"><span class="severity ${severity.css}"><i class="ti ti-${severity.icon}" aria-hidden="true"></i>${severity.label}</span><time>${item.time}</time></span><h3>${escapeHTML(item.title)}<i class="ti ti-chevron-right" aria-hidden="true"></i></h3><p><i class="ti ti-map-pin" aria-hidden="true"></i>${escapeHTML(item.place)}</p></button>`;
    }).join('') : '<p class="empty-state">目前没有待处理事件。<br>好邻居，今天辛苦了。</p>';
    renderIncidentMarkers();
  }

  function renderIncidentMarkers() {
    cityMap?.incidents(incidents.filter(item => item.status === state.filter));
    const group = $('#incident-markers');
    group.replaceChildren();
    incidents.filter(item => item.status === state.filter).forEach(item => {
      const pin = document.createElementNS(svgNS, 'g');
      pin.setAttribute('transform', `translate(${item.x} ${item.y})`);
      pin.setAttribute('class', `map-incident ${item.status === 'resolved' ? 'resolved' : ''}`);
      pin.setAttribute('role', 'button');
      pin.setAttribute('tabindex', '0');
      pin.setAttribute('aria-label', item.title);
      pin.dataset.incident = item.id;
      pin.innerHTML = `<circle r="25" class="incident-halo"/><rect x="-12" y="-12" width="24" height="24" rx="7" class="incident-pin"/><text y="6">${item.status === 'resolved' ? '✓' : '!'}</text>`;
      group.append(pin);
    });
  }

  function showIncident(id) {
    const item = incidents.find(incident => incident.id === id);
    if (!item) return;
    const severity = severityInfo(item);
    openDetail(`街区警报 / ${severity.label}`, `<h2 id="dialog-title">${escapeHTML(item.title)}</h2><p class="dialog-description">${escapeHTML(item.description)}</p><dl class="detail-facts"><div><dt>发生地点</dt><dd>${escapeHTML(item.place)}</dd></div><div><dt>上报时间</dt><dd class="mono">10/15 ${item.time}</dd></div><div><dt>消息来源</dt><dd>${escapeHTML(item.source)}</dd></div><div><dt>现场目击</dt><dd>${item.witnesses} 位邻居</dd></div></dl><p class="dialog-note">${item.status === 'resolved' ? '事件已归档，现场恢复正常。' : item.claimed ? '你正在跟进这条事件。确认现场情况后，可更新为已解决。' : '尚未认领。可以先在地图上查看位置，再跟进现场消息。'}</p><div class="dialog-actions"><button class="button button-outline" data-action="incident-map" data-id="${item.id}"><i class="ti ti-map-pin" aria-hidden="true"></i>地图定位</button>${item.status === 'active' ? `<button class="button ${item.claimed ? 'button-blue' : 'button-red'}" data-action="${item.claimed ? 'resolve-incident' : 'claim-incident'}" data-id="${item.id}">${item.claimed ? '标记已解决' : '认领并跟进'}</button>` : ''}</div>`);
  }

  function renderMessages() {
    const visible = messages.filter(message => !state.sightingsOnly || message.sighting);
    $('#feed-list').innerHTML = visible.length ? visible.map(message => `<article class="feed-item"><img src="https://i.pravatar.cc/80?img=${message.avatar}" alt="${escapeHTML(message.name)}头像" width="28" height="28"><div class="feed-item-content"><div class="feed-meta"><strong>${escapeHTML(message.name)}</strong><time data-received="${message.receivedAt}">${messageAge(message.receivedAt)}</time></div><p>${message.sighting ? '<span class="feed-tag">目击</span>' : ''}${escapeHTML(message.content)}</p><div class="feed-actions"><button data-feed-place="${message.place}" aria-label="在地图查看${places[message.place].label}"><i class="ti ti-map-pin" aria-hidden="true"></i>${places[message.place].label.split(' / ')[0]}</button><button data-like="${message.id}" aria-label="${message.liked ? '取消点赞' : '点赞'}，${message.likes} 人点赞" aria-pressed="${message.liked}"><i class="ti ti-heart" aria-hidden="true"></i><span class="mono">${message.likes}</span></button></div></div></article>`).join('') : '<p class="empty-state">还没有目击消息。<br>发现红蓝身影时，记得告诉邻居。</p>';
  }

  function messageAge(timestamp) {
    const minutes = Math.floor((Date.now() - timestamp) / 60000);
    return minutes < 1 ? '刚刚' : minutes < 60 ? `${minutes} 分钟前` : `${Math.floor(minutes / 60)} 小时前`;
  }

  function setTabs(tab, attribute) {
    const tabs = $$(`[${attribute}]`, tab.parentElement);
    tabs.forEach(item => { const active = item === tab; item.setAttribute('aria-selected', String(active)); item.tabIndex = active ? 0 : -1; });
  }

  function setSightingFilter(value) {
    state.sightingsOnly = value;
    $('#feed-filter').setAttribute('aria-pressed', String(value));
    renderMessages();
    updateMessageQueue();
  }

  function renderRoute() {
    const route = routes[state.date];
    $('#route-distance').innerHTML = `${route.distance}<span> km</span>`;
    $('#route-stop-count').innerHTML = `${route.stops.length}<span> 个</span>`;
    $('#route-summary-copy').innerHTML = route.copy;
    const path = route.stops.map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x} ${point.y}`).join(' ');
    $('#route-path').setAttribute('d', path);
    $('#route-underlay').setAttribute('d', path);
    $('#timeline').innerHTML = route.stops.map((point, index) => `<button class="timeline-point ${state.selectedStop === index ? 'active' : ''}" data-stop="${index}" aria-pressed="${state.selectedStop === index}" aria-label="${point.time} ${point.place}，${point.detail}"><time>${point.time}</time><span>${point.place}</span></button>`).join('');
    $('#route-stops').innerHTML = route.stops.map((point, index) => `<g class="route-stop ${state.selectedStop === index ? 'selected' : ''}" transform="translate(${point.x} ${point.y})" data-stop="${index}" role="button" tabindex="0" aria-label="${point.time} ${point.place}"><circle r="9"/><text y=".5">${index + 1}</text></g>`).join('');
    cityMap?.route(route.stops);
    cityMap?.activeStop(state.selectedStop);
  }

  function setActiveStop(index) {
    state.selectedStop = index;
    $$('.timeline-point').forEach((button, i) => { button.classList.toggle('active', i === index); button.setAttribute('aria-pressed', String(i === index)); });
    $$('.route-stop').forEach((pin, i) => pin.classList.toggle('selected', i === index));
    cityMap?.activeStop(index);
  }

  function stopFrame() { cancelAnimationFrame(state.frame); state.frame = 0; state.lastFrame = 0; }

  function updatePlaybackUI() {
    const playing = state.mode === 'playing';
    $('#play-route').innerHTML = `<i class="ti ti-player-${playing ? 'pause' : 'play'}" aria-hidden="true"></i><span>${playing ? '暂停回放' : state.mode === 'paused' ? '继续回放' : '轨迹回放'}</span>`;
    $('#play-route').setAttribute('aria-label', playing ? '暂停轨迹回放' : state.mode === 'paused' ? '继续轨迹回放' : '回放出没路径');
    $('#playback-controls').hidden = state.mode === 'live';
    $('#map-status').textContent = state.mode === 'live' ? state.liveEnabled ? '实时追踪' : '动态已暂停' : state.mode === 'playing' ? '轨迹回放' : '历史目击';
    $('.app-window').dataset.playback = state.mode;
    $('.map-live-badge .status-dot').style.background = state.mode === 'live' ? 'var(--green)' : 'var(--red-soft)';
  }

  function interpolateProgress() {
    const stops = routes[state.date].stops;
    const position = state.progress * (stops.length - 1);
    const index = Math.min(Math.floor(position), stops.length - 2);
    const fraction = position - index;
    const a = stops[index];
    const b = stops[index + 1];
    const point = { x: a.x + (b.x - a.x) * fraction, y: a.y + (b.y - a.y) * fraction, latlng: a.latlng.map((coordinate, i) => coordinate + (b.latlng[i] - coordinate) * fraction) };
    const nearest = Math.round(position);
    const minute = time => Number(time.split(':')[0]) * 60 + Number(time.split(':')[1]);
    const minutes = Math.round(minute(a.time) + (minute(b.time) - minute(a.time)) * fraction);
    const label = `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
    positionMarker(point, `${label} / ${state.date === 'today' ? '今天' : '昨天'}`, stops[nearest].place);
    $('#route-scrubber').value = state.progress * 100;
    $('#map-clock').textContent = label;
    if (state.selectedStop !== nearest) setActiveStop(nearest);
  }

  function selectStop(index) {
    stopFrame();
    state.mode = 'history';
    state.progress = index / (routes[state.date].stops.length - 1);
    setActiveStop(index);
    interpolateProgress();
    updatePlaybackUI();
    const point = routes[state.date].stops[index];
    showMapSelection(`${point.time} ${point.place}：${point.detail}`, point);
  }

  function returnLive(zoomToTarget = false) {
    stopFrame();
    state.date = 'today';
    state.mode = 'live';
    state.progress = 0;
    state.selectedStop = 5;
    $('#route-date').value = 'today';
    $('#map-selection').hidden = true;
    renderRoute();
    positionMarker(state.livePosition, '你的好邻居', state.livePosition.place);
    state.follow = true;
    if (zoomToTarget) focusPoint(state.livePosition, 1.5);
    else { state.zoom = 1.15; state.tx = -67.5; state.ty = -48.75; setCamera(); if (cityMap?.active) cityMap.focus(state.livePosition, 15); }
    updatePlaybackUI();
    updateClock();
  }

  function playbackTick(time) {
    if (state.mode !== 'playing') return;
    if (!state.lastFrame) state.lastFrame = time;
    const elapsed = Math.min(time - state.lastFrame, 100);
    state.lastFrame = time;
    state.progress = Math.min(1, state.progress + elapsed / 14000 * state.speed);
    if (reduceMotion.matches) {
      const stopIndex = Math.floor(state.progress * (routes[state.date].stops.length - 1));
      if (state.selectedStop !== stopIndex) {
        setActiveStop(stopIndex);
        const point = routes[state.date].stops[stopIndex];
        positionMarker(point, `${point.time} / 历史目击`, point.place);
        $('#map-clock').textContent = point.time;
      }
      $('#route-scrubber').value = state.progress * 100;
    } else interpolateProgress();
    if (state.progress >= 1) {
      state.mode = 'history';
      stopFrame();
      interpolateProgress();
      updatePlaybackUI();
      notify('回放结束，可以选择任意时间点继续查看');
    } else state.frame = requestAnimationFrame(playbackTick);
  }

  function togglePlayback() {
    if (state.mode === 'playing') {
      stopFrame();
      state.mode = 'paused';
    } else {
      if (state.mode === 'live' || state.progress >= 1) state.progress = 0;
      state.mode = 'playing';
      state.zoom = 1; state.tx = 0; state.ty = 0;
      setCamera();
      if (cityMap?.active) cityMap.fitRoute(routes[state.date].stops);
      $('#map-selection').hidden = true;
      interpolateProgress();
      state.lastFrame = 0;
      state.frame = requestAnimationFrame(playbackTick);
    }
    updatePlaybackUI();
  }

  function clockText() {
    const seconds = 18 * 3600 + 42 * 60 + 8 + Math.floor((Date.now() - sessionStart) / 1000);
    return [Math.floor(seconds / 3600) % 24, Math.floor(seconds / 60) % 60, seconds % 60].map(part => String(part).padStart(2, '0')).join(':');
  }

  function updateClock() {
    const time = clockText();
    $('#footer-clock').textContent = time;
    if (state.mode === 'live') $('#map-clock').textContent = time;
    const age = Math.floor((Date.now() - state.lastSeenAt) / 1000);
    $('#location-age').textContent = age < 3 ? '刚刚更新' : `${age} 秒前更新`;
    $$('[data-received]').forEach(time => { const text = messageAge(Number(time.dataset.received)); if (time.textContent !== text) time.textContent = text; });
  }

  function updateLiveCard() {
    const point = state.livePosition;
    $('#current-place').textContent = point.place;
    $('#current-address').textContent = point.address;
    $('#current-coordinates').textContent = `${point.latlng[0].toFixed(4)}° N · ${Math.abs(point.latlng[1]).toFixed(4)}° W`;
    $('#movement-state').textContent = !state.liveEnabled ? '信号快照已暂停' : point.moving ? '蛛丝摆荡中' : '屋顶短暂停留';
    $('.app-window').dataset.moving = String(Boolean(point.moving && state.liveEnabled && state.mode === 'live'));
    if (state.liveEnabled) state.lastSeenAt = Date.now();
    if (state.mode === 'live' && state.follow) cityMap?.follow(point);
  }

  function liveTick(time) {
    state.liveFrame = 0;
    if (!state.liveEnabled || document.hidden) return;
    if (!state.liveLastFrame) state.liveLastFrame = time;
    state.liveElapsed += Math.min(time - state.liveLastFrame, 100);
    state.liveLastFrame = time;
    const phase = Math.floor(state.liveElapsed / 45000);
    const a = patrol[phase % patrol.length];
    const b = patrol[(phase + 1) % patrol.length];
    const progress = Math.max(0, (state.liveElapsed % 45000 - 12000) / 33000);
    const fraction = reduceMotion.matches ? 0 : progress;
    const location = fraction > .55 ? b : a;
    const eased = fraction * fraction * (3 - 2 * fraction);
    state.livePosition = {
      ...location, moving: progress > 0,
      x: a.x + (b.x - a.x) * eased,
      y: a.y + (b.y - a.y) * eased,
      latlng: a.latlng.map((value, i) => value + (b.latlng[i] - value) * eased)
    };
    if (state.mode === 'live' && (!reduceMotion.matches || state.livePhase !== phase)) {
      positionMarker(state.livePosition, '你的好邻居', state.livePosition.place);
    }
    state.livePhase = phase;
    state.liveFrame = requestAnimationFrame(liveTick);
  }

  const neighborhoodVoices = [
    { name: '住在五楼的莉兹', avatar: 47, content: '窗外刚飘过一根蛛丝。今天的晾衣绳又有着落了。', sighting: true, place: 'midtown' },
    { name: '皇后区老本的热狗摊', avatar: 53, content: '今日英雄套餐：热狗一份，第二份给被救下的小猫。猫不能吃热狗，换罐头。', place: 'queens' },
    { name: '布鲁克林骑行客', avatar: 13, content: '桥上风有点大。骑车扶好车把，荡蛛丝的那位请随意。', place: 'brooklyn' },
    { name: '中城咖啡师米娅', avatar: 49, content: '有位红蓝制服的客人倒挂着取咖啡。我现在相信杯盖的质量了。', sighting: true, place: 'midtown' },
    { name: '苏豪区夜班店员', avatar: 44, content: '刚看到他帮游客捡帽子。纽约的风，是他最稳定的客户。', sighting: true, place: 'soho' },
    { name: '格林威治遛狗人', avatar: 33, content: '狗狗追着天上的红点跑了半条街。抱歉，小蜘蛛，它把你当飞盘了。', sighting: true, place: 'greenwich' },
    { name: 'J. 乔纳·詹姆森', avatar: 60, content: '征集蜘蛛侠照片。清楚的。不要再发一条红色拖影给我。', place: 'midtown' },
    { name: '第五大道维修员', avatar: 14, content: '屋顶水箱已经修好。请某位好邻居下次落地时轻一点，谢谢。', place: 'midtown' }
  ];
  let voiceDeck = [];
  function recordSighting(point) {
    state.newSightings++;
    $('#sightings-count').innerHTML = `${28 + state.newSightings}<span>次</span>`;
    sightings.push({ ...point });
    if (sightings.length > 30) sightings.shift();
    const circle = document.createElementNS(svgNS, 'circle');
    circle.setAttribute('cx', point.x + 10);
    circle.setAttribute('cy', point.y + 15);
    circle.setAttribute('r', '5');
    const layer = $('#sighting-layer');
    layer.append(circle);
    if (layer.children.length > 30) layer.firstElementChild.remove();
    cityMap?.sightings(sightings);
  }

  function updateMessageQueue() {
    const count = state.pendingMessages.filter(message => !state.sightingsOnly || message.sighting).length;
    const button = $('#new-messages-button');
    button.hidden = !count;
    button.textContent = `↑ ${count} 条新街坊消息 · 点击查看`;
  }

  function receiveNeighborhoodMessage() {
    if (!voiceDeck.length) voiceDeck = neighborhoodVoices.map((_, i) => i);
    const index = voiceDeck.splice(Math.floor(Math.random() * voiceDeck.length), 1)[0];
    const message = { id: `msg-${++state.id}`, receivedAt: Date.now(), likes: 0, liked: false, sighting: false, ...neighborhoodVoices[index] };
    if (message.sighting) recordSighting(places[message.place]);
    $('.notification-button > span').hidden = false;
    if (state.sightingsOnly && !message.sighting) {
      messages.unshift(message);
      if (messages.length > 60) messages.length = 60;
      return;
    }
    const reading = $('#feed-list').scrollTop > 8 || $('.community-section').contains(document.activeElement) || detailDialog.open || $('#report-dialog').open;
    if (reading || state.pendingMessages.length) {
      state.pendingMessages.unshift(message);
      if (state.pendingMessages.length > 12) state.pendingMessages.length = 12;
      updateMessageQueue();
    } else {
      messages.unshift(message);
      if (messages.length > 60) messages.length = 60;
      renderMessages();
      animateContent($('.feed-item', $('#feed-list')));
    }
  }

  function scheduleMessage(delay = 14000 + Math.random() * 10000) {
    clearTimeout(randomMessageTimer);
    if (!state.liveEnabled || document.hidden) return;
    randomMessageTimer = setTimeout(() => { receiveNeighborhoodMessage(); scheduleMessage(); }, delay);
  }

  function syncLiveActivity() {
    cancelAnimationFrame(state.liveFrame);
    clearTimeout(randomMessageTimer);
    state.liveLastFrame = 0;
    if (state.liveEnabled && !document.hidden) {
      state.liveFrame = requestAnimationFrame(liveTick);
      scheduleMessage();
    }
    $('.app-window').dataset.live = String(state.liveEnabled && !document.hidden);
    $('#live-toggle').setAttribute('aria-pressed', String(state.liveEnabled));
    $('#live-toggle').setAttribute('aria-label', state.liveEnabled ? '暂停实时动态和随机消息' : '继续实时动态和随机消息');
    $('#live-toggle').title = state.liveEnabled ? '暂停实时动态' : '继续实时动态';
    $('#live-toggle i').className = `ti ti-player-${state.liveEnabled ? 'pause' : 'play'}`;
    updateLiveCard();
    updatePlaybackUI();
  }

  $('#live-toggle').addEventListener('click', () => { state.liveEnabled = !state.liveEnabled; syncLiveActivity(); });
  $('#new-messages-button').addEventListener('click', () => {
    messages.unshift(...state.pendingMessages);
    messages.sort((a, b) => b.receivedAt - a.receivedAt);
    state.pendingMessages = [];
    if (messages.length > 60) messages.length = 60;
    updateMessageQueue();
    renderMessages();
    $('#feed-list').scrollTop = 0;
    $('#feed-filter').focus({ preventScroll: true });
    animateContent($('#feed-list'));
  });
  document.addEventListener('visibilitychange', syncLiveActivity);

  async function refreshWeather() {
    const button = $('#weather-button');
    if (button.disabled) return;
    button.disabled = true;
    button.classList.add('loading');
    button.setAttribute('aria-busy', 'true');
    $('#weather-text').textContent = '天气同步中';
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 9000);
    try {
      const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=40.7484&longitude=-73.9857&current=temperature_2m,weather_code,wind_speed_10m&timezone=America%2FNew_York', { signal: controller.signal });
      if (!response.ok) throw new Error('Weather unavailable');
      const data = await response.json();
      const current = data.current;
      if (!current || !Number.isFinite(current.temperature_2m) || !Number.isFinite(current.weather_code) || typeof current.time !== 'string') throw new Error('Invalid weather');
      const code = current.weather_code;
      const weather = code === 0 ? ['晴', 'sun'] : code <= 3 ? ['多云', 'cloud'] : code <= 48 ? ['雾', 'mist'] : code >= 95 ? ['雷雨', 'cloud-storm'] : (code >= 71 && code <= 77) || code === 85 || code === 86 ? ['雪', 'snowflake'] : ['雨', 'cloud-rain'];
      $('#weather-text').textContent = `${Math.round(current.temperature_2m)}° ${weather[0]} · 纽约`;
      $('#weather-button i').className = `ti ti-${weather[1]}`;
      button.title = `Open-Meteo · 纽约当地 ${current.time.replace('T', ' ')} · 风速 ${current.wind_speed_10m} km/h · 点击刷新`;
      button.dataset.state = 'ready';
    } catch {
      $('#weather-text').textContent = '天气暂离线 · 重试';
      $('#weather-button i').className = 'ti ti-cloud-off';
      button.title = '暂时无法连接 Open-Meteo，点击重试';
      button.dataset.state = 'error';
    } finally {
      clearTimeout(timeout);
      button.disabled = false;
      button.classList.remove('loading');
      button.setAttribute('aria-busy', 'false');
    }
  }
  $('#weather-button').addEventListener('click', refreshWeather);

  function addMessage(content, options = {}) {
    const message = { id: `msg-${++state.id}`, name: '街区观察员（你）', avatar: 12, receivedAt: Date.now(), content, sighting: false, place: 'midtown', likes: 0, liked: false, ...options };
    messages.unshift(message);
    if (messages.length > 60) messages.length = 60;
    if (state.sightingsOnly && !message.sighting) setSightingFilter(false);
    else renderMessages();
    $('#feed-list').scrollTop = 0;
    animateContent($('.feed-item', $('#feed-list')));
  }

  $('#identity-list').addEventListener('click', event => { const target = event.target.closest('[data-person]'); if (target) showPerson(target.dataset.person); });
  $('#identity-all').addEventListener('click', () => showPerson('peter'));

  function openIncidentFromEvent(event) {
    const target = event.target.closest('[data-incident]');
    if (target) showIncident(target.dataset.incident);
  }
  $('#incident-list').addEventListener('click', openIncidentFromEvent);
  $('#incident-markers').addEventListener('click', openIncidentFromEvent);
  $('#refresh-incidents').addEventListener('click', () => { renderIncidents(); animateContent($('#incident-list')); notify('事件列表已更新，目前没有新的街区警报'); });
  $$('[data-incident-filter]').forEach(tab => tab.addEventListener('click', () => {
    state.filter = tab.dataset.incidentFilter;
    setTabs(tab, 'data-incident-filter');
    $('#incident-list').setAttribute('aria-labelledby', tab.id);
    renderIncidents();
    if (eventIsPointer) animateContent($('#incident-list'));
  }));

  document.addEventListener('pointerdown', () => { eventIsPointer = true; });
  document.addEventListener('keydown', () => { eventIsPointer = false; });
  $$('[role="tablist"]').forEach(tablist => tablist.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    const tabs = $$('[role="tab"]', tablist);
    const current = tabs.indexOf(document.activeElement);
    if (current < 0) return;
    event.preventDefault();
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (current + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
    tabs[next].focus();
    tabs[next].click();
  }));

  $('#dialog-content').addEventListener('click', event => {
    const button = event.target.closest('[data-action]');
    if (!button) return;
    const action = button.dataset.action;
    const item = incidents.find(incident => incident.id === button.dataset.id);
    if (action === 'next-person') {
      const index = candidates.findIndex(person => person.id === button.dataset.person);
      showPerson(candidates[(index + 1) % candidates.length].id);
    } else if (action === 'person-map') {
      const person = candidates.find(candidate => candidate.id === button.dataset.person);
      const point = person.id === 'peter' ? places.midtown : places.queens;
      detailDialog.close();
      showMapSelection(`${person.name}的关联目击街区：${point.label}`, point);
    } else if (action === 'incident-map' && item) {
      detailDialog.close();
      showMapSelection(`${item.title} / ${item.place}`, item);
    } else if (action === 'claim-incident' && item && item.status === 'active') {
      item.claimed = true;
      renderIncidents();
      showIncident(item.id);
      notify('已加入你的跟进列表');
    } else if (action === 'resolve-incident' && item && item.claimed && item.status === 'active') {
      item.status = 'resolved';
      detailDialog.close();
      renderIncidents();
      notify('事件已标记解决，可在“已解决”中查看');
      chime();
    }
  });
  $('#close-dialog').addEventListener('click', () => detailDialog.close());
  detailDialog.addEventListener('close', () => {
    $('.incidents-section').inert = false;
    $('.community-section').inert = false;
    rightColumn.classList.remove('has-detail');
    if (detailOpener?.isConnected) detailOpener.focus({ preventScroll: true });
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && detailDialog.open && !$('#report-dialog').open) detailDialog.close();
  });
  [detailDialog, $('#report-dialog')].forEach(dialog => dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  }));

  $('#feed-filter').addEventListener('click', () => { setSightingFilter(!state.sightingsOnly); animateContent($('#feed-list')); });
  $('#feed-list').addEventListener('click', event => {
    const like = event.target.closest('[data-like]');
    const location = event.target.closest('[data-feed-place]');
    if (like) {
      const message = messages.find(item => item.id === like.dataset.like);
      if (!message) return;
      message.liked = !message.liked;
      message.likes += message.liked ? 1 : -1;
      like.setAttribute('aria-pressed', String(message.liked));
      like.setAttribute('aria-label', `${message.liked ? '取消点赞' : '点赞'}，${message.likes} 人点赞`);
      $('i', like).className = 'ti ti-heart';
      $('span', like).textContent = message.likes;
    } else if (location) {
      const point = places[location.dataset.feedPlace];
      showMapSelection(`街坊消息来自：${point.label}`, point);
    }
  });
  $('#quick-message').addEventListener('submit', event => {
    event.preventDefault();
    const input = $('#message-input');
    const content = input.value.trim();
    if (!content) { input.setCustomValidity('写点内容再和邻居分享吧。'); input.reportValidity(); return; }
    addMessage(content);
    input.value = '';
    state.reports++;
    notify('留言已加入街坊消息');
  });
  $('#message-input').addEventListener('input', event => event.target.setCustomValidity(''));

  $$('[data-map-mode]').forEach(tab => tab.addEventListener('click', () => {
    setTabs(tab, 'data-map-mode');
    $('#map-stage').setAttribute('aria-labelledby', tab.id);
    $('#heat-layer').style.opacity = tab.dataset.mapMode === 'heat' ? '1' : '0';
    $('#route-layer').style.opacity = tab.dataset.mapMode === 'heat' ? '.35' : '1';
    cityMap?.layer('heat', tab.dataset.mapMode === 'heat');
    if (tab.dataset.mapMode === 'heat') showMapSelection('近 24 小时目击密度：中城、格林威治村最活跃');
    else $('#map-selection').hidden = true;
  }));
  $('#locate-button').addEventListener('click', () => {
    returnLive(true);
    if (matchMedia('(max-width: 1120px), (max-height: 670px)').matches) $('.workspace').scrollTo({ top: 0, behavior: reduceMotion.matches ? 'instant' : 'smooth' });
    notify(`已定位到最新位置：${state.livePosition.place}`);
  });
  $('#reset-map').addEventListener('click', () => { state.follow = false; state.zoom = 1; state.tx = 0; state.ty = 0; setCamera(); if (cityMap?.active) cityMap.fitRoute(routes[state.date].stops); $('#map-selection').hidden = true; });
  function zoomBy(amount) {
    state.follow = false;
    if (cityMap?.active) { cityMap.zoomBy(Math.sign(amount) * .5); return; }
    const next = Math.max(.7, Math.min(3.8, Math.round((state.zoom + amount) * 10) / 10));
    const ratio = next / state.zoom;
    state.tx = 450 - (450 - state.tx) * ratio;
    state.ty = 325 - (325 - state.ty) * ratio;
    state.zoom = next;
    setCamera();
  }
  $('#zoom-in').addEventListener('click', () => zoomBy(.3));
  $('#zoom-out').addEventListener('click', () => zoomBy(-.3));
  $('#layers-button').addEventListener('click', () => {
    const panel = $('#layer-panel');
    panel.hidden = !panel.hidden;
    $('#layers-button').setAttribute('aria-expanded', String(!panel.hidden));
  });
  const mapLayerNames = { 'route-layer': 'route', 'sighting-layer': 'sightings', 'incident-markers': 'incidents' };
  $$('[data-layer]').forEach(input => input.addEventListener('change', () => {
    document.getElementById(input.dataset.layer).style.display = input.checked ? '' : 'none';
    cityMap?.layer(mapLayerNames[input.dataset.layer], input.checked);
  }));
  $('#basemap-select').addEventListener('change', event => { cityMap?.useOnline(event.target.value === 'online'); setCamera(false); });
  $('#retry-map').addEventListener('click', () => { $('#basemap-select').value = 'online'; cityMap?.useOnline(true); });
  function setExpanded(expanded) {
    $('.app-window').classList.toggle('map-expanded', expanded);
    $('#expand-map').setAttribute('aria-expanded', String(expanded));
    $('#expand-map').setAttribute('aria-label', expanded ? '还原地图工作区' : '展开地图工作区');
    $('#expand-map').title = expanded ? '还原工作区' : '展开地图';
    $('#expand-map i').className = `ti ti-arrows-${expanded ? 'minimize' : 'maximize'}`;
    updateMapViewport();
  }
  $('#expand-map').addEventListener('click', () => setExpanded(!$('.map-expanded')));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && $('.map-expanded') && $('#layer-panel').hidden && !$('#report-dialog').open) setExpanded(false);
  });
  $('#clear-selection').addEventListener('click', () => { $('#map-selection').hidden = true; });
  document.addEventListener('pointerdown', event => {
    if (!event.target.closest('#layer-panel, #layers-button')) { $('#layer-panel').hidden = true; $('#layers-button').setAttribute('aria-expanded', 'false'); }
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !$('#layer-panel').hidden) { $('#layer-panel').hidden = true; $('#layers-button').setAttribute('aria-expanded', 'false'); $('#layers-button').focus(); }
  });

  let drag = null;
  function mapPoint(event) { return new DOMPoint(event.clientX, event.clientY).matrixTransform(map.getScreenCTM().inverse()); }
  map.addEventListener('pointerdown', event => {
    if (event.button !== 0 || event.target.closest('[role="button"]')) return;
    event.preventDefault();
    document.getSelection()?.removeAllRanges();
    document.body.classList.add('is-panning');
    state.follow = false;
    const point = mapPoint(event);
    drag = { id: event.pointerId, x: point.x, y: point.y, tx: state.tx, ty: state.ty };
    map.setPointerCapture(event.pointerId);
    map.classList.add('dragging');
  });
  map.addEventListener('pointermove', event => {
    if (!drag || drag.id !== event.pointerId) return;
    const point = mapPoint(event);
    state.tx = Math.max(-1200, Math.min(1200, drag.tx + point.x - drag.x));
    state.ty = Math.max(-1000, Math.min(1000, drag.ty + point.y - drag.y));
    setCamera(false);
  });
  function endDrag(event) {
    if (!drag || drag.id !== event.pointerId) return;
    drag = null;
    document.body.classList.remove('is-panning');
    map.classList.remove('dragging');
    if (map.hasPointerCapture(event.pointerId)) map.releasePointerCapture(event.pointerId);
  }
  map.addEventListener('pointerup', endDrag);
  map.addEventListener('pointercancel', endDrag);
  map.addEventListener('lostpointercapture', endDrag);
  map.addEventListener('dragstart', event => event.preventDefault());
  map.addEventListener('selectstart', event => event.preventDefault());
  map.addEventListener('wheel', event => {
    event.preventDefault();
    state.follow = false;
    const point = mapPoint(event);
    const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? 200 : 1);
    const next = Math.max(.7, Math.min(3.8, state.zoom * Math.exp(-Math.max(-150, Math.min(150, delta)) * .002)));
    const ratio = next / state.zoom;
    state.tx = point.x - (point.x - state.tx) * ratio;
    state.ty = point.y - (point.y - state.ty) * ratio;
    state.zoom = next;
    setCamera(true);
  }, { passive: false });
  window.addEventListener('blur', () => { drag = null; map.classList.remove('dragging'); document.body.classList.remove('is-panning'); });
  map.addEventListener('keydown', event => {
    if (!['Enter', ' '].includes(event.key)) return;
    const target = event.target.closest('[role="button"]');
    if (target) { event.preventDefault(); target.dispatchEvent(new MouseEvent('click', { bubbles: true })); }
  });

  $('#timeline').addEventListener('click', event => { const button = event.target.closest('[data-stop]'); if (button) selectStop(Number(button.dataset.stop)); });
  $('#route-stops').addEventListener('click', event => { const pin = event.target.closest('[data-stop]'); if (pin) selectStop(Number(pin.dataset.stop)); });
  $('#route-date').addEventListener('change', event => {
    stopFrame();
    state.date = event.target.value;
    state.selectedStop = 5;
    renderRoute();
    selectStop(5);
    state.zoom = 1; state.tx = 0; state.ty = 0; setCamera();
    if (cityMap?.active) cityMap.fitRoute(routes[state.date].stops);
  });
  $('#play-route').addEventListener('click', togglePlayback);
  $('#stop-playback').addEventListener('click', () => returnLive());
  $('#route-scrubber').addEventListener('input', event => { stopFrame(); state.progress = Number(event.target.value) / 100; state.mode = 'paused'; interpolateProgress(); updatePlaybackUI(); });
  $('#playback-speed').addEventListener('click', event => { state.speed = state.speed === 1 ? 2 : state.speed === 2 ? 4 : 1; event.currentTarget.textContent = `${state.speed}×`; });
  document.addEventListener('visibilitychange', () => { if (document.hidden && state.mode === 'playing') { stopFrame(); state.mode = 'paused'; updatePlaybackUI(); } });

  $('.report-trigger').addEventListener('click', () => $('#report-dialog').showModal());
  $('#close-report').addEventListener('click', () => $('#report-dialog').close());
  $('#report-text').addEventListener('input', event => {
    $('#report-char-count').textContent = `${event.target.value.length} / 240`;
    $('#report-error').textContent = '';
    event.target.setCustomValidity('');
  });
  $('#report-form').addEventListener('submit', event => {
    event.preventDefault();
    const input = $('#report-text');
    const content = input.value.trim();
    if (content.length < 5) { $('#report-error').textContent = '请至少写 5 个字，让邻居更容易了解情况。'; input.focus(); return; }
    const type = $('input[name="type"]:checked').value;
    const location = $('#report-place').value;
    const place = places[location];
    if (type === 'incident') {
      incidents.unshift({ id: `inc-${++state.id}`, title: content.length > 20 ? `${content.slice(0, 20)}…` : content, place: place.label, severity: 'low', time: clockText().slice(0, 5), x: place.x + 18, y: place.y + 18, latlng: place.latlng, status: 'active', claimed: false, source: '街区观察员（你）', description: content, witnesses: 1 });
      state.filter = 'active';
      setTabs($('#active-incidents-tab'), 'data-incident-filter');
      $('#incident-list').setAttribute('aria-labelledby', 'active-incidents-tab');
      renderIncidents();
      $('#incident-list').scrollTop = 0;
      notify('新事件已加入待处理列表，状态为“待核实”');
      chime();
    } else {
      addMessage(content, { sighting: type === 'sighting', place: location });
      if (type === 'sighting') {
        recordSighting(place);
      }
      notify(type === 'sighting' ? '目击线索已加入街坊消息和地图' : '留言已加入街坊消息');
    }
    state.reports++;
    $('#report-dialog').close();
    $('#report-form').reset();
    $('#report-char-count').textContent = '0 / 240';
    $('#report-error').textContent = '';
  });

  $('#sound-button').addEventListener('click', async event => {
    const button = event.currentTarget;
    if (!state.sound) {
      const AudioEngine = window.AudioContext || window.webkitAudioContext;
      if (!AudioEngine) { notify('当前浏览器不支持提示音'); return; }
      try { audioContext ||= new AudioEngine(); await audioContext.resume(); } catch { notify('提示音暂时无法开启'); return; }
    }
    state.sound = !state.sound;
    button.setAttribute('aria-pressed', String(state.sound));
    button.setAttribute('aria-label', state.sound ? '关闭事件提示音' : '开启事件提示音');
    $('i', button).className = `ti ti-volume${state.sound ? '' : '-off'}`;
    notify(state.sound ? '事件提示音已开启' : '事件提示音已关闭');
    if (state.sound) chime();
  });
  $('#notifications-button').addEventListener('click', () => {
    $('.notification-button > span').hidden = true;
    const active = incidents.filter(item => item.status === 'active').length;
    openDetail('蛛网收件箱', `<h2 id="dialog-title">街区动态</h2><div class="notification-list"><p>当前有 ${active} 条事件等待处理，可以在街区警报中认领跟进。<time>${clockText().slice(0, 5)}</time></p><p>最新目击地点：${state.livePosition.place}。${state.livePosition.moving ? '好邻居正在楼宇之间摆荡。' : '红蓝身影暂时停下了脚步。'}<time>${clockText().slice(0, 5)}</time></p><p>彼得·帕克的身份档案新增 2 条关联线索。<time>18:30</time></p></div><p class="dialog-note">街区活动为互动演示；在线底图与纽约天气来自公开服务。</p>`);
  });
  $('#profile-button').addEventListener('click', () => openDetail('邻里档案', `<div class="dialog-person"><img src="https://i.pravatar.cc/120?img=12" alt="观察员头像"><div><h2 id="dialog-title">街区观察员</h2><p class="dialog-description">在这里，每个人都能做一点英雄的事。</p></div></div><dl class="detail-facts"><div><dt>本次分享</dt><dd class="mono">${state.reports} 条</dd></div><div><dt>正在跟进</dt><dd class="mono">${incidents.filter(item => item.claimed && item.status === 'active').length} 个事件</dd></div></dl><p class="dialog-note">不需要超能力。一双留意街区的眼睛，就已经很了不起。</p>`));

  cityMap = window.createCityMap({
    onStatus(mode, text) {
      $('#basemap-status').dataset.state = mode;
      $('#basemap-label').textContent = text;
      $('#retry-map').hidden = !['fallback', 'partial'].includes(mode);
      $('#connection-label').textContent = mode === 'online' ? '真实街区 · 动态演示' : mode === 'partial' ? '部分图块离线 · 动态演示' : mode === 'loading' ? '正在连接街区地图' : '示意地图 · 动态演示';
      if (!cityMap?.active) setCamera(false);
    },
    onReady() {
      cityMap.route(routes[state.date].stops);
      cityMap.activeStop(state.selectedStop);
      cityMap.incidents(incidents.filter(item => item.status === state.filter));
      cityMap.sightings(sightings);
      $$('[data-layer]').forEach(input => cityMap.layer(mapLayerNames[input.dataset.layer], input.checked));
      cityMap.layer('heat', $('#heat-tab').getAttribute('aria-selected') === 'true');
      cityMap.position(state.markerPoint || state.livePosition, state.markerTitle || '你的好邻居', state.markerDetail || state.livePosition.place);
      if (state.mode === 'live') cityMap.focus(state.livePosition, 15.5, false);
      else cityMap.fitRoute(routes[state.date].stops);
    },
    onIncident: showIncident,
    onStop: selectStop,
    onSighting: point => showMapSelection(`群众目击：${point.label || point.place}`, point),
    onTarget: () => showMapSelection(state.mode === 'live' ? `最新目击：${state.livePosition.place}` : state.markerDetail, state.markerPoint || state.livePosition),
    onManualMove: () => { state.follow = false; }
  });

  renderIdentities();
  renderIncidents();
  renderMessages();
  renderRoute();
  setCamera(false);
  updatePlaybackUI();
  positionMarker(state.livePosition, '你的好邻居', state.livePosition.place);
  syncLiveActivity();
  updateClock();
  setInterval(() => { if (!document.hidden) { updateLiveCard(); updateClock(); } }, 1000);
  scheduleMessage(7000);
  cityMap.init();
  refreshWeather();
})();
