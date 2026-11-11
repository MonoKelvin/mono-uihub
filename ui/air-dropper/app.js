(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const app = $('#app');
  const workspace = $('#workspace');
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const icon = name => `<i class="ti ti-${name}" aria-hidden="true"></i>`;
  const models = ['Falcon-X2', 'Kestrel-V', 'Cargo-S4'];
  const bases = ['North Hub', 'City Depot', 'Riverside Base'];
  const imageFor = model => `./assets/drone-${model === 'Kestrel-V' ? 'kestrel' : model === 'Cargo-S4' ? 'cargo' : 'black'}.webp`;
  const seed = [
    ['AD 0968-1593', 'Falcon-X2', 'flying', 48, 1.4, 2],
    ['AD 1149-4579', 'Kestrel-V', 'flying', 72, .8, 1],
    ['AD 3415-2323', 'Falcon-X2', 'flying', 64, 1.2, 2],
    ['AD 9235-1254', 'Falcon-X2', 'flying', 28, 1.2, 2],
    ['AD 4567-2846', 'Falcon-X2', 'flying', 56, 2.1, 4],
    ['AD 9242-1298', 'Falcon-X2', 'idle', 54, 0, 0],
    ['AD 9267-9587', 'Falcon-X2', 'charging', 14, 0, 0],
    ['AD 9296-0872', 'Falcon-X2', 'flying', 48, 1.4, 2],
    ['SP 5489-1237', 'Falcon-X2', 'flying', 56, 2.2, 4],
    ['SP 4367-1665', 'Kestrel-V', 'flying', 98, .4, 1]
  ];
  const drones = seed.map((d, index) => ({ id: d[0], model: d[1], status: d[2], battery: d[3], payload: d[4], parcels: d[5], capacity: 2.5, base: bases[index % 3], serial: index === 2 ? 'FX2-88213' : `FX2-${88101 + index * 13}`, hours: index === 2 ? 312 : 312 + index * 7, altitude: 120, speed: 65, flightTime: 45, gps: index === 2 ? '50.4501, 30.5234' : `${(50.43 + index * .003).toFixed(4)}, ${(30.51 + index * .002).toFixed(4)}`, certification: index === 2 ? 118 : 118 - index, image: index === 2 || index === 6 ? './assets/drone-silver.webp' : imageFor(d[1]) }));
  for (let i = 0; i < 22; i++) {
    const model = models[i % 3];
    drones.push({ id: `AD ${1300 + i * 17}-${4100 + i * 31}`, model, status: i < 12 ? 'flying' : i < 19 ? 'idle' : 'charging', battery: 36 + i % 8 * 8, payload: i < 12 ? +(.3 + i % 5 * .35).toFixed(1) : 0, parcels: i < 12 ? 1 + i % 3 : 0, capacity: 2.5, base: bases[i % 3], serial: `AD-${90110 + i}`, hours: 86 + i * 8, altitude: 120, speed: 65, flightTime: 45, gps: `${(50.441 + i * .002).toFixed(4)}, ${(30.50 + i * .001).toFixed(4)}`, certification: 162, image: imageFor(model) });
  }
  const missions = [
    { id: 'MS-2048', name: 'North Hub → Podil', from: 'North Hub', to: '18 Khoryva St, Podil', drone: 'AD 3415-2323', status: 'flying', distance: 4.8, eta: '6 min', weight: 1.2, progress: 62 },
    { id: 'MS-2049', name: 'City Depot → Pechersk', from: 'City Depot', to: '24 Lesi Ukrainky Blvd', drone: 'AD 0968-1593', status: 'flying', distance: 6.2, eta: '9 min', weight: 1.4, progress: 38 },
    { id: 'MS-2050', name: 'Riverside → Obolon', from: 'Riverside Base', to: '12 Obolonska Embankment', drone: 'AD 1149-4579', status: 'flying', distance: 5.6, eta: '7 min', weight: .8, progress: 54 },
    { id: 'MS-2051', name: 'North Hub → Lukianivka', from: 'North Hub', to: '8 Illienka St', drone: 'AD 9296-0872', status: 'flying', distance: 3.4, eta: '4 min', weight: 1.4, progress: 78 },
    { id: 'MS-2052', name: 'City Depot → Lypky', from: 'City Depot', to: '6 Shovkovychna St', drone: 'AD 9242-1298', status: 'draft', distance: 2.9, eta: '—', weight: .6, progress: 0 },
    { id: 'MS-2045', name: 'North Hub → Sviatoshyn', from: 'North Hub', to: '42 Beresteiskyi Ave', drone: 'SP 5489-1237', status: 'completed', distance: 8.1, eta: '11:32', weight: 2.2, progress: 100 }
  ];
  const operationOrder = ['MS-2050', 'MS-2048', 'MS-2049', 'MS-2051', 'MS-2045', 'MS-2052'];
  missions.sort((a, b) => operationOrder.indexOf(a.id) - operationOrder.indexOf(b.id));
  Object.assign(missions.find(m => m.id === 'MS-2050'), { originLabel: 'WH-03 Downtown', to: '1 Harbor View', destinationLabel: '1 Harbor View', timing: 'On time', delay: 10 });
  Object.assign(missions.find(m => m.id === 'MS-2048'), { originLabel: 'WH-02 Riverside', to: '24 Riverside Ave', destinationLabel: '24 Riverside Ave', timing: 'On time', delay: 5, distance: 3.2, progress: 46, eta: '1h 31m' });
  Object.assign(missions.find(m => m.id === 'MS-2049'), { originLabel: 'WH-01 North', to: '8 Harbor View', destinationLabel: '8 Harbor View', timing: 'Delayed', delay: -1 });
  Object.assign(missions.find(m => m.id === 'MS-2051'), { drone: 'SP 4367-1665', originLabel: 'WH-02 Riverside', to: '118 Riverside Ave', destinationLabel: '118 Riverside Ave', timing: 'Re-routing', alert: 'deviation', delay: 8 });
  const batteryMission = { id: 'MS-2100', name: 'Downtown → Harbor View', from: 'North Hub', to: '1 Harbor View', originLabel: 'WH-03 Downtown', destinationLabel: '1 Harbor View', drone: 'AD 9235-1254', status: 'flying', alert: 'low-battery', distance: 4.1, eta: '12 min', weight: 1.2, progress: 52, timing: 'On time', delay: 5 };
  missions.splice(4, 0, batteryMission);
  for (let i = 0; i < 10; i++) {
    const drone = drones[10 + i];
    missions.push({ id: `MS-${2101 + i}`, name: `${drone.base} → Harbor district`, from: drone.base, to: `${16 + i * 3} Harbor View`, originLabel: ['WH-01 North', 'WH-02 Riverside', 'WH-03 Downtown'][i % 3], destinationLabel: `${16 + i * 3} Harbor View`, drone: drone.id, status: i > 7 ? 'completed' : 'flying', distance: +(2.5 + i * .35).toFixed(1), eta: `${5 + i} min`, weight: drone.payload || .8, progress: i > 7 ? 100 : 28 + i * 6, timing: 'On time', delay: 0 });
  }
  const orders = [
    { id: 'DL-08241', recipient: 'Sofia Kovalenko', address: '18 Khoryva St, Podil', from: 'North Hub', mission: 'MS-2048', status: 'in transit', weight: 1.2, contents: 'Medical supplies', time: '11:48' },
    { id: 'DL-08242', recipient: 'Daniel Park', address: '24 Lesi Ukrainky Blvd', from: 'City Depot', mission: 'MS-2049', status: 'in transit', weight: 1.4, contents: 'Documents & equipment', time: '11:51' },
    { id: 'DL-08243', recipient: 'Anna Melnyk', address: '12 Obolonska Embankment', from: 'Riverside Base', mission: 'MS-2050', status: 'in transit', weight: .8, contents: 'Office essentials', time: '11:49' },
    { id: 'DL-08244', recipient: 'Oliver Reed', address: '8 Illienka St', from: 'North Hub', mission: 'MS-2051', status: 'in transit', weight: 1.4, contents: 'Small electronics', time: '11:46' },
    { id: 'DL-08245', recipient: 'Mila Shevchenko', address: '6 Shovkovychna St', from: 'City Depot', mission: 'MS-2052', status: 'queued', weight: .6, contents: 'Lab materials', time: '12:05' },
    { id: 'DL-08238', recipient: 'Leo Novak', address: '42 Beresteiskyi Ave', from: 'North Hub', mission: 'MS-2045', status: 'delivered', weight: 2.2, contents: 'Retail parcel', time: '11:32' }
  ];
  orders.forEach(o => { const mission = missions.find(m => m.id === o.mission); if (mission) o.address = mission.to; });
  const state = { view: 'fleet', search: '', filter: 'all', page: 0, selected: 'AD 3415-2323', model: 'All models', battery: 'Any battery', sort: 'Registration order', missionFilter: 'all', orderFilter: 'all', mission: 'MS-2048', order: 'DL-08241', missionPage: 0, orderPage: 0, settings: 'general', chartRange: 'Last 7 days', chartTable: false, mapZoom: 1, previewReverse: false, commandError: '', exportBusy: false, formBusy: false, connectionBusy: false, returnView: 'fleet' };
  const titles = { fleet: 'Drone Fleet', overview: 'Overview', missions: 'Missions', orders: 'Deliveries', analytics: 'Analytics', settings: 'Settings', register: 'Register Drone', missionForm: 'New Mission', orderForm: 'New Delivery' };
  const preferences = { motion: true, lowBattery: true, notifications: true, units: 'Metric', ...readPreferences() };
  const profile = { name: 'Alex Morgan', email: 'alex@airdropper.io', organization: 'Air Dropper' };
  let toastTimer;
  let dialogFocus;
  let menuFocus;
  let started = false;
  let lastCommand;
  let missionSequence = 2053;
  let orderSequence = 8246;
  function recordPagination(length, kind) {
    const page = state[`${kind}Page`];
    return `<footer class="pagination record-pagination"><span>${length ? `${page * 6 + 1}–${Math.min(page * 6 + 6, length)} of ${length}` : '0 records'}</span><div class="pagination-controls"><button class="icon-button" data-record-page="${kind}" data-direction="-1" aria-label="Previous ${kind} page" ${page === 0 ? 'disabled' : ''}>${icon('chevron-left')}</button><span>${page + 1} / ${Math.max(1, Math.ceil(length / 6))}</span><button class="icon-button" data-record-page="${kind}" data-direction="1" aria-label="Next ${kind} page" ${(page + 1) * 6 >= length ? 'disabled' : ''}>${icon('chevron-right')}</button></div></footer>`;
  }
  function readPreferences() { try { return JSON.parse(localStorage.getItem('air-dropper-preferences') || '{}'); } catch { return {}; } }
  function savePreferences() { try { localStorage.setItem('air-dropper-preferences', JSON.stringify(preferences)); } catch { /* 禁用存储时仍使用当前会话的偏好。 */ } }
  function status(label) {
    const cls = label.replace(/ /g, '-');
    const text = ({ flying: 'Flying', idle: 'Idle', charging: 'Charging', maintenance: 'Maintenance', draft: 'Draft', completed: 'Completed', 'in transit': 'In transit', queued: 'Queued', delivered: 'Delivered', offline: 'Offline' })[label] || label;
    return `<span class="status ${escape(cls)}">${escape(text)}</span>`;
  }
  function button(label, action, classes = '', iconName = '', extra = '') { return `<button class="btn ${classes}" data-action="${action}" ${extra}>${iconName ? icon(iconName) : ''}${escape(label)}</button>`; }
  function tab(label, key, count, active, attr = 'filter') { return `<button class="tab ${key === active ? 'active' : ''}" data-${attr}="${key}" aria-pressed="${key === active}">${escape(label)}${count === undefined ? '' : `<span class="tab-count">${count}</span>`}</button>`; }
  function customSelect(name, selected, options, disabled = []) {
    return `<div class="custom-select" data-select="${name}" data-value="${escape(selected)}"><button type="button" class="select-trigger" aria-haspopup="listbox" aria-expanded="false" aria-label="${escape(name)}"><span>${escape(selected)}</span>${icon('chevron-down')}</button><div class="select-panel" role="listbox" aria-label="${escape(name)}" hidden>${options.map(option => `<button type="button" class="menu-option" role="option" data-option="${escape(option)}" aria-selected="${option === selected}" ${disabled.includes(option) ? 'disabled' : ''}>${escape(option)}${option === selected ? icon('check') : ''}</button>`).join('')}</div></div>`;
  }
  function filteredDrones() {
    const q = state.search.toLowerCase();
    let result = drones.filter(d => (state.filter === 'all' || d.status === state.filter) && (state.model === 'All models' || d.model === state.model) && (state.battery === 'Any battery' || (state.battery === 'Below 30%' ? d.battery < 30 : d.battery >= 30)) && `${d.id} ${d.model} ${d.serial} ${d.base}`.toLowerCase().includes(q));
    if (state.sort === 'Battery level') result = result.toSorted((a, b) => a.battery - b.battery);
    if (state.sort === 'Payload weight') result = result.toSorted((a, b) => b.payload - a.payload);
    return result;
  }
  function droneCard(d) {
    return `<button class="drone-card ${d.id === state.selected ? 'selected' : ''}" data-drone="${escape(d.id)}" aria-pressed="${d.id === state.selected}" aria-label="${escape(d.id)}, ${escape(d.model)}, ${d.status}, battery ${d.battery}%">${status(d.status)}<img src="${d.image}" alt="${escape(d.model)} drone"><div class="drone-info"><div><div class="drone-name">${escape(d.id)}</div><div class="drone-model muted">${escape(d.model)}</div></div><div class="payload"><div class="meter" role="meter" aria-label="Payload weight" aria-valuemin="0" aria-valuemax="${d.capacity}" aria-valuenow="${d.payload}"><span class="meter-fill" style="--value:${d.payload / d.capacity * 100}%"></span></div><span class="capacity"><strong>${d.payload.toFixed(1)}</strong> /${d.capacity} kg</span></div><div class="drone-stats"><span><i class="ti ti-battery-3 battery ${d.battery < 30 ? 'low' : ''}" aria-hidden="true"></i>${d.battery}%</span><span>${icon('wifi')}Good</span><span>${icon('package')}${d.parcels}/4</span></div></div></button>`;
  }
  function fact(label, value) { return `<div class="fact"><dt>${escape(label)}</dt><dd>${value}</dd></div>`; }
  function droneDetail(d) {
    if (!d) return `<aside class="detail-panel"><div class="empty-state">${icon('drone')}<h3>No drone selected</h3><p>Select a drone to view its specifications.</p></div></aside>`;
    return `<aside class="detail-panel ${state.commandError ? 'has-command-error' : ''}" aria-label="Selected drone details"><div class="detail-top"><span><i class="ti ti-battery-3 battery ${d.battery < 30 ? 'low' : ''}" aria-hidden="true"></i>${d.battery}%</span><span>${icon('package')}${d.parcels}/4 &nbsp; ${icon('wifi')}Good</span></div><div class="drone-preview"><span class="preview-orbit"></span><img class="${state.previewReverse ? 'reverse' : ''}" src="${d.image}" alt="${escape(d.model)} product view"><div class="preview-controls"><button data-action="preview-left" aria-label="Previous product orientation">${icon('caret-left')}</button><button data-action="preview-right" aria-label="Next product orientation">${icon('caret-right')}</button></div></div><div class="detail-heading"><h2>${escape(d.id)}</h2><span class="status ${d.status}">${d.status === 'flying' ? 'In flight' : escape(d.status[0].toUpperCase() + d.status.slice(1))}</span></div><p class="detail-subtitle">${escape(d.model)} · Serial ${escape(d.serial)}</p><div class="spec-row"><div class="spec"><span class="spec-label">Max altitude</span><span class="spec-value">${d.altitude} <small>m</small></span></div><div class="spec"><span class="spec-label">Max speed</span><span class="spec-value">${d.speed} <small>km/h</small></span></div><div class="spec"><span class="spec-label">Flight time</span><span class="spec-value">${d.flightTime} <small>m</small></span></div></div><dl class="detail-facts">${fact('GPS', escape(d.gps))}${fact('Flight hours', `${d.hours}h`)}${fact('Payload rated', '4.5 kg max')}${fact('Certification', `<span class="good-text">Valid</span> &nbsp;${d.certification}d left`)}</dl><div class="detail-actions">${state.commandError ? `<div class="inline-error" role="alert">${escape(state.commandError)} ${button('Save request', 'save-command', 'small ghost', 'download')}</div>` : ''}${button('Return to base', 'return-base', '', 'rotate-clockwise', d.status !== 'flying' ? 'disabled title="Only available for flying drones"' : '')}${button('Take offline', 'take-offline', 'danger', 'circle-x', d.status === 'offline' ? 'disabled' : '')}</div></aside>`;
  }
  function renderFleet() {
    const results = filteredDrones();
    state.page = Math.max(0, Math.min(state.page, Math.ceil(results.length / 10) - 1));
    const selected = drones.find(d => d.id === state.selected);
    const counts = key => key === 'all' ? drones.length : drones.filter(d => d.status === key).length;
    return `<div class="toolbar"><div class="tabs" aria-label="Fleet status">${[['All', 'all'], ['Flying', 'flying'], ['Idle', 'idle'], ['Charging', 'charging'], ['Maintenance', 'maintenance']].map(([l, k]) => tab(l, k, counts(k), state.filter)).join('')}</div><div class="toolbar-actions"><button class="icon-button ${state.model !== 'All models' || state.battery !== 'Any battery' ? 'pressed' : ''}" data-action="fleet-filters" aria-label="Filter and sort fleet" aria-expanded="false" title="Filter and sort">${icon('filter')}</button>${button('Register Drone', 'register', 'primary', 'plus')}</div></div><div class="fleet-layout"><div class="fleet-list"><div class="drone-grid">${results.length ? results.slice(state.page * 10, state.page * 10 + 10).map(droneCard).join('') : `<div class="empty-state">${icon('drone')}<h3>${state.filter === 'maintenance' && !state.search ? 'No drones in maintenance' : 'No drones found'}</h3><p>${state.filter === 'maintenance' && !state.search ? 'Your fleet is ready for its next assignment.' : 'Try another search or reset your filters.'}</p>${button('View all drones', 'reset-filters', '', 'arrow-left')}</div>`}</div></div>${droneDetail(results.length ? selected : null)}</div>`;
  }
  function mapMarkup(selected = state.selected, small = false) {
    const shown = ['AD 3415-2323', 'AD 0968-1593', 'AD 1149-4579', 'AD 9296-0872'];
    const points = [[41, 36], [69, 62], [72, 23], [22, 58]];
    return `<div class="map ${small ? 'map--compact' : ''}" aria-label="Kyiv flight routes"><svg viewBox="0 0 700 440" role="img" aria-label="Kyiv route network, North Hub, City Depot and Riverside Base"><g style="transform:scale(${state.mapZoom});transform-origin:350px 220px"><path d="M545-10C510 90 590 120 548 217S481 322 542 450" stroke="#dae3e6" stroke-width="58" fill="none"/><g fill="#e3e7e1"><path d="M5 22h113v60H5zM37 290h120v114H37zM390 50h84v81h-84zM562 260h120v100H562z"/></g><g class="map-road"><path d="M-15 90L705 350M-5 275L700 35M150-10L270 450M383-10L410 450M-5 400L705 176"/></g><g class="map-road-minor"><path d="M40-10L170 450M220-10L360 450M310-10L484 450M440-10L610 450M-10 160L710 408M-10 340L715 100M-10 25L695 270"/></g><path class="map-route" d="M160 270L250 225L290 160L405 124L515 95"/><path class="map-route" d="M290 160L362 189L460 263L493 280" opacity=".5"/><g class="map-label"><text x="245" y="82">PODIL</text><text x="357" y="363">PECHERSK</text><text x="30" y="195">LUKIANIVKA</text><text x="582" y="80">DNIPRO</text></g><g class="map-small-label"><text x="97" y="310">North Hub</text><text x="390" y="233">City Depot</text><text x="550" y="391">Riverside Base</text></g></g></svg>${shown.map((id, i) => { const interactive = state.view === 'overview' || state.view === 'missions'; const tag = interactive ? 'button' : 'span'; return `<${tag} class="map-pin ${selected === id ? 'active' : ''}" style="left:${50 + (points[i][0] - 50) * state.mapZoom}%;top:${50 + (points[i][1] - 50) * state.mapZoom}%" ${interactive ? `data-map-drone="${id}" aria-label="Locate ${id}" title="${id}"` : 'aria-hidden="true"'}>${icon('drone')}</${tag}>`; }).join('')}<div class="map-key"><span></span>Active flight routes</div>${small ? '' : `<div class="map-controls"><button class="icon-button" data-action="map-in" aria-label="Zoom in" ${state.mapZoom >= 1.5 ? 'disabled' : ''}>${icon('plus')}</button><button class="icon-button" data-action="map-out" aria-label="Zoom out" ${state.mapZoom <= 1 ? 'disabled' : ''}>${icon('minus')}</button><button class="icon-button" data-action="map-reset" aria-label="Reset map view">${icon('focus-centered')}</button></div>`}</div>`;
  }
  function renderOverview() {
    const live = missions.filter(m => m.status === 'flying' && `${m.id} ${m.name} ${m.drone}`.toLowerCase().includes(state.search.toLowerCase()));
    return `<div class="toolbar"><div class="tabs">${tab('Live operations', 'live', undefined, 'live', 'overview-tab')}</div><div class="toolbar-actions">${button('View missions', 'open-missions', '', 'route')}${button('New Mission', 'new-mission', 'primary', 'plus')}</div></div><div class="overview-layout"><div class="overview-left"><div class="kpi-row"><div class="kpi"><span>Fleet available</span><strong>${drones.filter(d => d.status === 'idle').length}</strong><small>of ${drones.length} drones</small></div><div class="kpi"><span>In flight</span><strong>${drones.filter(d => d.status === 'flying').length}</strong><small>drones</small></div><div class="kpi"><span>Charging</span><strong>${drones.filter(d => d.status === 'charging').length}</strong><small>drones</small></div></div>${mapMarkup()}</div><aside class="panel"><div class="panel-title"><h2>Active missions</h2><span class="muted">${live.length}</span></div>${live.length ? live.slice(0, 4).map(m => `<button class="live-flight" data-mission-link="${m.id}"><img src="${drones.find(d => d.id === m.drone)?.image || imageFor('Falcon-X2')}" alt=""><div class="flight-text"><strong>${escape(m.drone)}</strong><p>${escape(m.name)}</p><p>${m.distance} km · ${m.eta} remaining</p></div>${status(m.status)}</button>`).join('') : `<div class="table-empty"><h3>No matching missions</h3><p class="panel-subtitle">Clear your search to view active flights.</p></div>`}<div class="base-section"><h3>Ground stations</h3>${bases.map((b, i) => `<div class="base-row"><span>${b}</span><span class="muted">${drones.filter(d => d.base === b).length} drones</span></div>`).join('')}</div></aside></div>`;
  }
  function matches(record) { return Object.values(record).join(' ').toLowerCase().includes(state.search.toLowerCase()); }
  function filteredMissions() {
    return missions.filter(m => matches(m) && (state.missionFilter === 'all' || (state.missionFilter === 'attention' ? !!m.alert : m.status === state.missionFilter)));
  }
  function operationCard(m) {
    const d = drones.find(d => d.id === m.drone);
    const label = m.alert === 'deviation' ? 'Deviation' : m.alert === 'low-battery' ? 'Low battery' : m.status === 'flying' ? 'Flying' : m.status === 'draft' ? 'Draft' : 'Completed';
    const origin = m.originLabel || m.from;
    const destination = m.destinationLabel || m.to;
    return `<article class="operation-card ${m.id === state.mission ? 'selected' : ''}"><button class="operation-select" data-mission="${m.id}" aria-pressed="${m.id === state.mission}" aria-label="${escape(m.id)}, ${escape(m.drone)}, ${escape(origin)} to ${escape(destination)}"><img src="${d?.image || imageFor('Falcon-X2')}" alt=""><div class="operation-info"><div class="operation-name">${escape(m.drone)} ${icon(m.alert === 'low-battery' ? 'battery-1' : m.alert === 'deviation' ? 'route-alt-left' : 'arrow-up-right')}</div><span class="status ${m.alert ? 'warning' : m.status}">${label}</span><div class="flight-progress" role="meter" aria-label="Route progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${m.progress}"><span style="--value:${m.progress}%"></span><b style="left:${m.progress}%"></b></div><div class="operation-endpoints"><span title="${escape(origin)}">${escape(origin)}</span><span title="${escape(destination)}">${escape(destination)}</span></div><div class="operation-timing"><span class="${m.alert ? 'attention-text' : ''}">${escape(m.timing || (m.status === 'draft' ? 'Awaiting dispatch' : 'On time'))}</span><span class="${m.delay > 0 ? 'late' : m.delay < 0 ? 'early' : ''}">${m.alert === 'deviation' ? 'Deviation' : m.delay ? `${m.delay > 0 ? '+' : ''}${m.delay} min` : m.status === 'completed' ? 'Arrived' : 'On time'}</span></div></div></button><button class="operation-more" data-action="operation-menu" data-operation-id="${m.id}" aria-label="Options for ${escape(m.id)}" title="Mission options">${icon('dots')}</button></article>`;
  }
  function streetMap(m) {
    let blocks = '', streets = '';
    for (let y = -40, row = 0; y < 810; y += 65, row++) {
      for (let x = -50, col = 0; x < 1190; x += 57, col++) {
        const offset = row % 2 ? 12 : 0;
        blocks += `<rect x="${x + offset}" y="${y}" width="45" height="53" rx="1" class="city-block ${((row + col) % 9 === 0) ? 'city-block-park' : ''}"/><path d="M${x + 21 + offset} ${y}v53M${x + offset} ${y + 27}h45" class="parcel-line"/>`;
      }
    }
    for (let i = 0; i < 12; i++) streets += `<path d="M${390 + i * 61} -50L${355 + i * 59} 810" class="district-street"/>`;
    const routes = [
      { past: 'M495 131H527V215H592V265L744 286L738 371', future: 'M738 371L725 451L820 469V520L870 543V601H962', start: [495,131], current: [738,371], end: [962,601] },
      { past: 'M520 130H547V221H610V271L742 288L736 366', future: 'M736 366L724 446L820 463V518L901 538V597L977 603', start: [520,130], current: [736,366], end: [977,603] },
      { past: 'M570 155H592V225H643V276L766 293L760 378', future: 'M760 378L744 456L832 474V525L924 544V602H995', start: [570,155], current: [760,378], end: [995,602] }
    ];
    const route = routes[m ? (Number(m.id.replace(/\D/g, '')) + 2) % routes.length : 0];
    const tag = (name, x, y) => `<span class="route-map-label" style="left:${x / 11}%;top:${y / 7.6}%">${escape(name)}</span>`;
    return `<div class="mission-map ${state.trackBuildings ? 'buildings-layer' : ''}"><div class="map-geometry" style="--map-zoom:${state.trackZoom || 1}"><svg viewBox="0 0 1100 760" preserveAspectRatio="none" role="img" aria-label="${escape(m?.originLabel || m?.from || 'Ground station')} to ${escape(m?.destinationLabel || m?.to || 'Harbor View')} flight route"><defs><pattern id="road-hatching" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="8" stroke="var(--closure-line)" stroke-width="2"/></pattern></defs><g class="street-network" transform="rotate(-4 700 350)">${blocks}${streets}<path d="M340 80L1115 225M330 310L1120 465M350 567L1120 696M557-30L523 790M760-30L719 790M951-30L900 790" class="district-avenue"/><path d="M680 420L729 452L820 420L907 463L1100 578" class="district-avenue narrow"/><path d="M980 620L1100 624L1100 765L1000 765Z" class="water-area"/></g>${m ? `<path d="${route.future}" class="future-route"/><path d="${route.past}" class="past-route"/><circle cx="${route.start[0]}" cy="${route.start[1]}" r="5" class="route-endpoint"/><circle cx="${route.end[0]}" cy="${route.end[1]}" r="5" class="route-endpoint"/>` : ''}<path d="M486 240h111v9H486zM828 189h9v77h-9zM743 576h121v9H743z" fill="url(#road-hatching)"/></svg>${m ? `${tag(m.originLabel || m.from, route.start[0]+4, route.start[1]-31)}${tag(m.destinationLabel || m.to, route.end[0]+2, route.end[1]-29)}<button class="aircraft-marker" style="left:${route.current[0] / 11}%;top:${route.current[1] / 7.6}%" data-action="toggle-flight-card" aria-label="${escape(m.drone)} flight details" aria-expanded="${state.trackCard !== false}">${icon('drone')}</button>` : ''}<button class="map-closure closure-one" data-action="closure-info" data-closure="Central crossing" aria-label="Road closure, Central crossing"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10.3 3.7a2 2 0 0 1 3.4 0l8 14a2 2 0 0 1-1.7 3H4a2 2 0 0 1-1.7-3z" fill="currentColor"/><path d="M12 8v5" stroke="var(--surface)" stroke-width="1.5" stroke-linecap="round"/><circle cx="12" cy="16" r=".8" fill="var(--surface)"/></svg></button><button class="map-closure closure-two" data-action="closure-info" data-closure="Riverside crossing" aria-label="Road closure, Riverside crossing"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10.3 3.7a2 2 0 0 1 3.4 0l8 14a2 2 0 0 1-1.7 3H4a2 2 0 0 1-1.7-3z" fill="currentColor"/><path d="M12 8v5" stroke="var(--surface)" stroke-width="1.5" stroke-linecap="round"/><circle cx="12" cy="16" r=".8" fill="var(--surface)"/></svg></button><button class="map-closure closure-three" data-action="closure-info" data-closure="Harbor crossing" aria-label="Road closure, Harbor crossing"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10.3 3.7a2 2 0 0 1 3.4 0l8 14a2 2 0 0 1-1.7 3H4a2 2 0 0 1-1.7-3z" fill="currentColor"/><path d="M12 8v5" stroke="var(--surface)" stroke-width="1.5" stroke-linecap="round"/><circle cx="12" cy="16" r=".8" fill="var(--surface)"/></svg></button></div></div>`;
  }
  function flightTelemetry(m) {
    const d = drones.find(d => d.id === m.drone);
    const battery = d?.battery ?? 86;
    return `<section class="flight-telemetry" aria-label="Flight telemetry"><div class="telemetry-readings"><div class="telemetry-value"><span>ALT</span><strong>${m.status === 'draft' ? '—' : 400} <small>m</small></strong></div><div class="telemetry-value"><span>WGH</span><strong>${m.weight.toFixed(1)} <small>kg</small></strong></div><div class="telemetry-value"><span>SPD</span><strong>${m.status === 'draft' ? '—' : 26} <small>km/h</small></strong></div><div class="telemetry-value"><span>PWR</span><strong>${icon('battery-3')}${battery} <small>%</small></strong></div></div><div class="flight-instrument"><div class="instrument-header"><span>HDG</span><button data-action="telemetry-menu" aria-label="Heading instrument options">${icon('dots')}</button></div><div class="attitude-dial" role="img" aria-label="Pitch 2 degrees, roll 6 degrees"><span class="horizon-line"></span><span class="attitude-pointer"></span><span class="attitude-number">2°</span><span class="roll-number">6°</span></div></div><div class="flight-instrument"><div class="instrument-header"><span>CMP</span><button data-action="telemetry-menu" aria-label="Compass instrument options">${icon('dots')}</button></div><div class="compass-dial" role="img" aria-label="Heading 105 degrees"><span class="compass-north">N</span><span class="compass-east">E</span><span class="compass-south">S</span><span class="compass-west">W</span><span class="compass-needle"></span><span class="compass-value">105°</span></div></div></section>`;
  }
  function renderMissions() {
    const result = filteredMissions();
    state.missionPage = Math.max(0, Math.min(state.missionPage, Math.ceil(result.length / 5) - 1));
    const visible = result.slice(state.missionPage * 5, state.missionPage * 5 + 5);
    if (!visible.some(m => m.id === state.mission)) state.mission = visible[0]?.id;
    const m = result.find(m => m.id === state.mission);
    const capacity = drones.find(d => d.id === m?.drone)?.capacity || 2.5;
    return `<section class="tracking-layout ${state.trackExpanded ? 'map-expanded' : ''}" aria-label="Mission tracking">${streetMap(m)}<aside class="operations-list"><header class="operations-header"><button data-action="operations-filter" aria-label="Filter and browse ${result.length} operations" aria-expanded="false">${result.length} operations</button><div><button data-action="operation-search" aria-label="Search operations" title="Search operations">${icon('search')}</button><button data-action="new-mission" aria-label="New mission" title="New mission">${icon('plus')}</button></div></header><div class="operation-grid">${visible.length ? visible.map(operationCard).join('') : `<div class="empty-state">${icon('route')}<h3>No operations found</h3><p>Try another search or reset the operation filters.</p>${button('Reset filters','reset-operations','','restore')}</div>`}</div></aside><div class="scene-preview"><button class="scene-expand" data-action="expand-feed" aria-label="Open camera image" title="Open camera image">${icon('arrows-maximize')}</button><img src="./assets/city-feed.webp" alt="City camera image"></div><button class="expand-tracking" data-action="expand-tracking" aria-label="${state.trackExpanded ? 'Restore operations panel' : 'Expand map'}" title="${state.trackExpanded ? 'Restore operations panel' : 'Expand map'}">${icon(state.trackExpanded ? 'arrows-minimize' : 'arrows-maximize')}</button><div class="map-layer-controls"><button class="${!state.trackBuildings ? 'active' : ''}" data-action="street-layer" aria-pressed="${!state.trackBuildings}" aria-label="Street layer" title="Street layer">${icon('map')}</button><button class="${state.trackBuildings ? 'active' : ''}" data-action="building-layer" aria-pressed="${!!state.trackBuildings}" aria-label="Building layer" title="Building layer">${icon('cube')}</button></div>${m ? `<article class="flight-info-card" ${state.trackCard === false ? 'hidden' : ''}><div class="flight-info-header"><strong>${escape(m.drone)}</strong><button data-action="mission-drone" aria-label="View selected drone" title="View drone">${icon('arrow-up-right')}</button></div><span class="status ${m.status}">${m.status === 'flying' ? 'Flying' : m.status === 'draft' ? 'Draft' : 'Completed'}</span><div class="payload"><div class="meter" role="meter" aria-label="Parcel weight" aria-valuemin="0" aria-valuemax="${capacity}" aria-valuenow="${m.weight}"><span class="meter-fill" style="--value:${m.weight / capacity * 100}%"></span></div><span class="capacity">${m.weight.toFixed(1)} /${capacity} kg</span></div><p>Distance: <strong>${m.distance.toFixed(1)} km</strong></p><p>ETA: <strong>${escape(m.eta)}</strong>${m.delay ? `<span class="late"> (${m.delay > 0 ? '+' : ''}${m.delay} min)</span>` : ''}</p>${m.status === 'draft' ? button('Edit flight plan','edit-mission','small ghost','pencil') : ''}</article>${flightTelemetry(m)}` : ''}</section>`;
  }
  function renderOrders() {
    const result = orders.filter(o => matches(o) && (state.orderFilter === 'all' || o.status === state.orderFilter));
    state.orderPage = Math.max(0, Math.min(state.orderPage, Math.ceil(result.length / 6) - 1));
    const visible = result.slice(state.orderPage * 6, state.orderPage * 6 + 6);
    if (!visible.some(o => o.id === state.order)) state.order = visible[0]?.id;
    const o = result.find(o => o.id === state.order);
    return `<div class="toolbar"><div class="tabs">${[['All deliveries','all'], ['In transit','in transit'], ['Queued','queued'], ['Delivered','delivered']].map(([l,k]) => tab(l,k,orders.filter(o => k === 'all' || o.status === k).length,state.orderFilter,'order-filter')).join('')}</div><div class="toolbar-actions">${button('Export', 'export-orders', '', 'download')}${button('New Delivery', 'new-order', 'primary', 'plus')}</div></div><div class="split-view"><section class="panel"><div class="panel-title"><h2>Delivery queue</h2><span class="muted">${result.length} deliveries</span></div>${result.length ? `<table class="records" aria-label="Delivery orders"><thead><tr><th style="width:28%">Delivery</th><th style="width:43%">Recipient / address</th><th style="width:29%">Status</th></tr></thead><tbody>${visible.map(x => `<tr tabindex="0" role="button" data-order="${x.id}" class="${x.id === state.order ? 'selected' : ''}" aria-label="Open delivery ${escape(x.id)}"><td>${escape(x.id)}<span class="secondary">${x.weight.toFixed(1)} kg</span></td><td>${escape(x.recipient)}<span class="secondary">${escape(x.address)}</span></td><td>${status(x.status)}<span class="secondary">${x.time}</span></td></tr>`).join('')}</tbody></table>${recordPagination(result.length, 'order')}` : `<div class="empty-state">${icon('package')}<h3>No deliveries found</h3><p>Choose a different filter or add a delivery.</p>${button('New Delivery','new-order','','plus')}</div>`}</section><aside class="panel order-detail">${o ? `<div class="panel-title"><h2>${escape(o.id)}</h2>${status(o.status)}</div><h3>${escape(o.recipient)}</h3><p class="panel-subtitle">${escape(o.contents)}</p><div class="route-card"><div class="route-stop">${icon('building-warehouse')}<div>${escape(o.from)}<small>Pickup location</small></div></div><div class="route-link"></div><div class="route-stop">${icon('map-pin')}<div>${escape(o.address)}<small>Recipient address</small></div></div></div><h3>Delivery timeline</h3><div class="timeline"><div class="timeline-step">${icon('circle-check')}<div>Order received<small>11:24 · ${escape(o.from)}</small></div></div><div class="timeline-step ${o.status === 'queued' ? 'pending' : ''}">${icon(o.status === 'queued' ? 'circle' : 'circle-check')}<div>Parcel collected<small>${o.status === 'queued' ? 'Awaiting collection' : '11:36 · Weight verified'}</small></div></div><div class="timeline-step ${o.status === 'queued' ? 'pending' : ''}">${icon(o.status === 'queued' ? 'circle' : 'drone')}<div>${o.status === 'delivered' ? 'Flight completed' : 'On the way'}<small>${o.status === 'queued' ? 'Awaiting dispatch' : 'Mission ' + escape(o.mission)}</small></div></div><div class="timeline-step ${o.status === 'delivered' ? '' : 'pending'}">${icon(o.status === 'delivered' ? 'circle-check' : 'circle')}<div>${o.status === 'delivered' ? 'Delivered at ' + o.time : 'Estimated arrival · ' + o.time}<small>${o.status === 'delivered' ? 'Parcel received' : 'Recipient notified on arrival'}</small></div></div></div><dl>${fact('Weight', `${o.weight.toFixed(1)} kg`)}${fact('Mission', escape(o.mission || 'Unassigned'))}</dl><div class="detail-actions">${button(o.mission ? 'Track mission' : 'Assign mission', 'order-mission', 'primary', 'route')}${button('Export delivery', 'export-delivery', '', 'download')}${o.status === 'queued' ? button('Remove from queue', 'remove-order', '', 'trash') : ''}</div>` : `<div class="empty-state"><h3>No delivery selected</h3><p>Select a delivery to see its progress.</p></div>`}</aside></div>`;
  }
  function chartData() {
    return state.chartRange === 'Last 7 days' ? [['5 Nov', 84], ['6 Nov', 96], ['7 Nov', 72], ['8 Nov', 105], ['9 Nov', 88], ['10 Nov', 112], ['11 Nov', 91]] : [['Week 1', 402], ['Week 2', 468], ['Week 3', 435], ['Week 4', 521]];
  }
  function chartMarkup(data) {
    const maximum = state.chartRange === 'Last 7 days' ? 120 : 600;
    const slot = 565 / data.length;
    return `<div class="chart-container"><svg class="chart" viewBox="0 0 660 320" role="img" aria-label="Completed deliveries, ${escape(state.chartRange)}">${[0,1,2,3,4].map(i => `<line class="grid-line" x1="54" x2="625" y1="${268 - i * 57}" y2="${268 - i * 57}"/><text x="40" y="${273 - i * 57}" text-anchor="end">${i * maximum / 4}</text>`).join('')}${data.map(([label, value], i) => { const x = 54 + slot * (i + .5); const h = value / maximum * 228; return `<g><rect class="chart-hit" x="${x - slot / 2}" y="30" width="${slot}" height="255" tabindex="0" data-chart-index="${i}" aria-label="${escape(label)}: ${value} completed deliveries"/><path class="chart-bar" pointer-events="none" d="M${x-12} 268V${268-h+4}Q${x-12} ${268-h} ${x-8} ${268-h}H${x+8}Q${x+12} ${268-h} ${x+12} ${268-h+4}V268Z"/><text x="${x}" y="304" text-anchor="middle">${escape(label)}</text></g>`; }).join('')}</svg><div class="chart-tooltip" role="status" hidden></div></div>`;
  }
  function renderAnalytics() {
    const data = chartData();
    const total = data.reduce((sum, [,v]) => sum + v, 0);
    return `<div class="toolbar"><div style="width:17cqw">${customSelect('Reporting period',state.chartRange,['Last 7 days','Last 30 days'])}</div><div class="toolbar-actions">${button(state.chartTable ? 'Chart view' : 'Table view','chart-table','',state.chartTable ? 'chart-bar' : 'table')}${button('Export report','export-report','','download')}</div></div><div class="analytics-content"><div class="kpi-row"><div class="kpi"><span>Completed deliveries</span><strong>${total.toLocaleString()}</strong></div><div class="kpi"><span>Successful arrivals</span><strong>${(100 - 100 / total).toFixed(1)}<small>%</small></strong></div><div class="kpi"><span>Average flight time</span><strong>${state.chartRange === 'Last 7 days' ? '8.4' : '8.7'}<small>min</small></strong></div><div class="kpi"><span>Distance flown</span><strong>${Math.round(total * 4.8).toLocaleString()}<small>km</small></strong></div></div><div class="analytics-bottom"><section class="panel"><div class="panel-title"><div><h2>Completed deliveries</h2><p class="panel-subtitle">${state.chartRange} · all ground stations</p></div></div>${state.chartTable ? `<table class="records" aria-label="Completed deliveries by date"><thead><tr><th>Period</th><th class="number">Deliveries</th></tr></thead><tbody>${data.map(([l,v]) => `<tr><td>${escape(l)}</td><td class="number">${v}</td></tr>`).join('')}</tbody></table>` : chartMarkup(data)}</section><aside class="panel"><h2>Operational performance</h2>${[['On-time arrivals', 96.8], ['Fleet availability', 87.5], ['Battery efficiency', 92.4]].map(([l,v]) => `<div class="performance-row"><div class="label"><span>${l}</span><strong>${v}%</strong></div><div class="performance-track" role="meter" aria-label="${l}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${v}"><span style="--value:${v}%"></span></div></div>`).join('')}<div class="analytics-note">Reporting window<br>${state.chartRange === 'Last 7 days' ? '5–11 November 2026' : '13 October–11 November 2026'}<br><br>All flight times are measured from takeoff to landing.</div></aside></div></div>`;
  }
  function field(name, label, value = '', options = {}) {
    return `<label class="field ${options.full ? 'full' : ''}" data-field="${name}"><span>${escape(label)}</span><input name="${name}" value="${escape(value)}" type="${options.type || 'text'}" maxlength="${options.maxlength || 80}" ${options.readonly ? 'readonly' : ''} ${options.placeholder ? `placeholder="${escape(options.placeholder)}"` : ''} ${options.inputmode ? `inputmode="${options.inputmode}"` : ''} autocomplete="off"><span class="field-error" id="error-${name}" hidden></span></label>`;
  }
  function registerMarkup() {
    return `<div class="toolbar">${button('Drone fleet','back-fleet','ghost','arrow-left')}</div><form class="form-layout" id="register-form" novalidate><section class="panel form-panel"><h2>Add a drone to your fleet</h2><p class="panel-subtitle">Device identity and operating station</p><div class="form-grid">${field('droneId','Drone ID','',{placeholder:'AD 1084-2056',maxlength:24})}${field('serial','Serial number','',{placeholder:'FX2-88421',maxlength:32})}<div class="field"><span>Drone model</span>${customSelect('Drone model','Falcon-X2',models)}</div><div class="field"><span>Ground station</span>${customSelect('Ground station','North Hub',bases)}</div>${field('capacity','Payload capacity (kg)','2.5',{inputmode:'decimal',maxlength:5})}${field('battery','Battery level (%)','100',{inputmode:'numeric',maxlength:3})}</div><div id="form-result" class="inline-success" role="status" hidden></div><div class="form-footer">${button('Cancel','back-fleet') }<button class="btn primary" type="submit">${icon('plus')}Register Drone</button></div></section><aside class="panel form-panel"><h2>Falcon-X2</h2><p class="panel-subtitle" id="model-description">Multi-purpose delivery drone</p><div class="form-illustration"><img id="model-image" src="${imageFor('Falcon-X2')}" alt="Falcon-X2 drone"></div><dl>${fact('Maximum altitude','120 m')}${fact('Maximum speed','65 km/h')}${fact('Flight time','45 min')}</dl><p class="analytics-note">The drone will be added as idle. A fleet gateway connection is required before dispatch.</p></aside></form>`;
  }
  function missionFormMarkup() {
    const existing = state.editMission ? missions.find(m => m.id === state.editMission) : null;
    const idle = drones.filter(d => d.status === 'idle');
    return `<div class="toolbar">${button('Missions & routes','open-missions','ghost','arrow-left')}</div><form class="form-layout" id="mission-form" novalidate><section class="panel form-panel"><h2>${existing ? 'Edit flight plan' : 'Plan a delivery route'}</h2><p class="panel-subtitle">Save a flight plan before dispatch</p><div class="form-grid">${field('destination','Destination address',existing?.to || '',{full:true,placeholder:'Street address, district',maxlength:80})}<div class="field"><span>Departure station</span>${customSelect('Departure station',existing?.from || 'North Hub',bases)}</div><div class="field"><span>Assigned drone</span>${customSelect('Assigned drone',existing?.drone || idle[0]?.id || 'No idle drones',idle.map(d => d.id))}</div>${field('weight','Payload weight (kg)',existing?.weight || '1.0',{inputmode:'decimal',maxlength:5})}${field('distance','Flight distance (km)',existing?.distance || '4.8',{inputmode:'decimal',maxlength:5})}</div><div class="inline-error" id="form-error" role="alert" hidden></div><div class="form-footer">${button('Cancel','open-missions')}<button class="btn primary" type="submit">${icon('device-floppy')}Save flight plan</button></div></section><aside class="panel"><div class="panel-title"><h2>Route planning</h2><span class="status idle">Draft</span></div>${mapMarkup(state.selected, true)}<div class="route-card"><div class="route-stop">${icon('circle-dot')}<div id="route-departure">${escape(existing?.from || 'North Hub')}</div></div><div class="route-link"></div><div class="route-stop">${icon('map-pin')}<div id="route-destination">${escape(existing?.to || 'Destination address')}</div></div></div><p class="analytics-note">Check flight restrictions and destination access before requesting dispatch.</p></aside></form>`;
  }
  function orderFormMarkup() {
    return `<div class="toolbar">${button('Deliveries','open-orders','ghost','arrow-left')}</div><form class="form-layout" id="order-form" novalidate><section class="panel form-panel"><h2>Create a delivery</h2><p class="panel-subtitle">Recipient and parcel information</p><div class="form-grid">${field('recipient','Recipient name','',{full:true,maxlength:60})}${field('address','Delivery address','',{full:true,maxlength:80})}<div class="field"><span>Pickup station</span>${customSelect('Pickup station','North Hub',bases)}</div>${field('weight','Parcel weight (kg)','1.0',{inputmode:'decimal',maxlength:5})}${field('contents','Parcel contents','',{full:true,maxlength:60})}</div><div class="form-footer">${button('Cancel','open-orders')}<button class="btn primary" type="submit">${icon('plus')}Add to queue</button></div></section><aside class="panel form-panel"><h2>Dispatch requirements</h2><div class="form-illustration"><img src="${imageFor('Cargo-S4')}" alt="Cargo-S4 delivery drone"></div><dl>${fact('Maximum parcel weight','2.5 kg')}${fact('Ground stations','3 locations')}${fact('Mission assignment','After queueing')}</dl><p class="analytics-note">Parcels stay in the queue until assigned to a flight plan.</p></aside></form>`;
  }
  function renderSettings() {
    const sections = [['general','General','adjustments'],['account','Account','user'],['connection','Fleet gateway','access-point'],['data','Import & export','database']];
    let content;
    if (state.settings === 'general') content = `<h2>Workspace preferences</h2>${[['notifications','Delivery notifications','Receive updates when a delivery needs attention.'], ['lowBattery','Low battery alerts','Show alerts when the battery falls below 30%.'], ['motion','Interface motion','Use short transitions for controls and panels.']].map(([k,l,p]) => `<div class="setting-row"><div><h3>${l}</h3><p>${p}</p></div><button class="switch" role="switch" aria-label="${l}" aria-checked="${preferences[k]}" data-preference="${k}"></button></div>`).join('')}<div class="setting-row"><div><h3>Measurement units</h3><p>Units used in exported reports.</p></div>${customSelect('Measurement units',preferences.units,['Metric','Imperial'])}</div><div class="form-footer">${button('Restore defaults','reset-preferences','','restore')}</div>`;
    if (state.settings === 'account') content = `<h2>Account details</h2><form id="account-form" novalidate><div class="form-grid">${field('name','Full name',profile.name,{maxlength:60})}${field('email','Email address',profile.email,{type:'email',maxlength:80})}${field('organization','Organization',profile.organization,{full:true,maxlength:60})}</div><div id="account-result" class="inline-success" role="status" hidden></div><div class="form-footer"><button class="btn primary" type="submit">${icon('device-floppy')}Apply changes</button></div></form><p class="analytics-note">Organization role · Fleet manager</p>`;
    if (state.settings === 'connection') content = `<h2>Fleet gateway</h2><div class="connection-status">${icon('plug-connected-x')}<div>Not connected<p>Device commands require an authorized fleet gateway.</p></div></div><dl>${fact('Gateway endpoint','Not configured')}${fact('Command channel','Unavailable')}${fact('Telemetry source','Last fleet snapshot')}</dl><div id="connection-error" class="inline-error" role="alert" hidden></div><div class="form-footer">${button('Export connection checklist','export-connection','','download')}${button('Check connection','check-connection','primary','refresh',state.connectionBusy ? 'disabled' : '')}</div>`;
    if (state.settings === 'data') content = `<h2>Fleet data</h2><p class="panel-subtitle">Import device records or export the current fleet</p><div class="import-zone">${icon('file-upload')}<h3>Import a fleet file</h3><p>JSON · up to 1 MB · maximum 100 drones</p>${button('Choose file','choose-file','','upload')}<input id="fleet-file" class="upload-input" type="file" accept=".json,application/json"><div class="inline-error" id="import-error" role="alert" hidden></div><div class="inline-success" id="import-result" role="status" hidden></div></div><div class="setting-row"><div><h3>Current fleet</h3><p>${drones.length} drones · identity, model, battery and ground station</p></div><div style="display:flex;gap:1cqw">${button('JSON','export-fleet-json','','download')}${button('CSV','export-fleet-csv','','download')}</div></div>`;
    return `<div class="toolbar"><span class="panel-subtitle">Air Dropper / Workspace</span></div><div class="settings-layout"><nav class="settings-nav" aria-label="Settings categories">${sections.map(([k,l,i]) => `<button data-settings="${k}" class="${k === state.settings ? 'active' : ''}" aria-current="${k === state.settings ? 'page' : 'false'}">${icon(i)}${l}</button>`).join('')}</nav><section class="panel form-panel">${content}</section></div>`;
  }
  function render() {
    $('#search').disabled = !['fleet','missions','orders','overview'].includes(state.view);
    $('#search').setAttribute('aria-label', $('#search').disabled ? 'Search is unavailable in this view' : 'Search current workspace');
    app.dataset.view = state.view;
    workspace.classList.toggle('tracking-workspace', state.view === 'missions');
    $('#page-title').textContent = titles[state.view];
    workspace.setAttribute('aria-label', `${titles[state.view]} workspace`);
    $$('.nav-button').forEach(b => { const active = b.dataset.view === (state.view === 'register' ? 'fleet' : state.view === 'missionForm' ? 'missions' : state.view === 'orderForm' ? 'orders' : state.view); b.classList.toggle('active', active); if (active) b.setAttribute('aria-current','page'); else b.removeAttribute('aria-current'); });
    workspace.innerHTML = ({ fleet:renderFleet, overview:renderOverview, missions:renderMissions, orders:renderOrders, analytics:renderAnalytics, settings:renderSettings, register:registerMarkup, missionForm:missionFormMarkup, orderForm:orderFormMarkup })[state.view]();
    document.title = `Air Dropper — ${titles[state.view]}`;
    document.body.classList.toggle('no-motion', !preferences.motion);
  }
  function navigate(view, keepSearch = false) {
    closePopover(); closeSelects(); closeDialog(false);
    if (!keepSearch) { state.search = ''; $('#search').value = ''; }
    state.view = view; state.commandError = ''; state.formBusy = false;
    render();
  }
  function toast(message) {
    clearTimeout(toastTimer);
    const node = $('#toast'); node.innerHTML = `<span>${escape(message)}</span><button data-action="close-toast" aria-label="Dismiss notification">${icon('x')}</button>`; node.hidden = false;
    toastTimer = setTimeout(() => { node.hidden = true; }, 4500);
  }
  function closeSelects() { $$('.select-panel').forEach(p => p.hidden = true); $$('.select-trigger').forEach(b => b.setAttribute('aria-expanded','false')); }
  function closePopover(restore = false) { $('#popover').hidden = true; $$('[aria-expanded=true]').filter(b => b.dataset.action).forEach(b => b.setAttribute('aria-expanded','false')); if (restore && menuFocus?.isConnected) menuFocus.focus(); }
  function popover(trigger, content, width = 25) {
    const node = $('#popover');
    if (!node.hidden && menuFocus === trigger) { closePopover(true); return; }
    closeSelects(); closePopover(); menuFocus = trigger;
    node.innerHTML = content; node.style.width = `${width}cqw`; node.hidden = false;
    const a = app.getBoundingClientRect(); const t = trigger.getBoundingClientRect();
    const n = node.getBoundingClientRect();
    node.style.left = `${Math.max(1.5, Math.min((t.right - a.left - n.width) / a.width * 100, 98.5 - width))}cqw`;
    node.style.top = `${Math.min((t.bottom - a.top) / a.width * 100 + .7, (a.height - n.height) / a.width * 100 - 1.5)}cqw`;
    trigger.setAttribute('aria-expanded','true');
  }
  function confirmDialog(title, text, action, label, dangerous = false) {
    closePopover(); dialogFocus = document.activeElement;
    const layer = $('#dialog-layer'); layer.innerHTML = `<div class="scrim" data-action="close-dialog"></div><section class="dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title" aria-describedby="dialog-description"><h2 id="dialog-title">${escape(title)}</h2><p id="dialog-description">${escape(text)}</p><div class="dialog-footer">${button('Cancel','close-dialog')}${button(label,action,dangerous ? 'danger' : 'primary')}</div></section>`; layer.hidden = false;
    workspace.inert = true; $('.app-header').inert = true; $('.rail').inert = true;
    $('.dialog-footer button').focus();
  }
  function closeDialog(restore = true) { const layer = $('#dialog-layer'); if (layer.hidden) return; layer.hidden = true; workspace.inert = false; $('.app-header').inert = false; $('.rail').inert = false; if (restore && dialogFocus?.isConnected) dialogFocus.focus(); }
  function exportFile(name, value, type = 'application/json') {
    const blob = new Blob([typeof value === 'string' ? value : JSON.stringify(value, null, 2)], {type}); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); toast(`${name} downloaded`);
  }
  function csv(rows) { return rows.map(row => row.map(v => { let s = String(v ?? ''); if (/^[=+\-@\t\r]/.test(s)) s = "'" + s; return `"${s.replace(/"/g,'""')}"`; }).join(',')).join('\r\n'); }
  function fleetExport() { return drones.map(({id,model,status,battery,payload,parcels,capacity,base,serial}) => ({id,model,status,battery,payload,parcels,capacity,base,serial})); }
  function setFieldError(form, name, message) { const f = $(`[data-field="${name}"]`, form); const input = $('input',f); f.classList.add('invalid'); input.setAttribute('aria-invalid','true'); input.setAttribute('aria-describedby',`error-${name}`); const e = $('.field-error',f); e.textContent = message; e.hidden = false; }
  function validate(form, tests) { $$('.field',form).forEach(f => {f.classList.remove('invalid'); const input = $('input',f); input?.removeAttribute('aria-invalid'); input?.removeAttribute('aria-describedby'); const e = $('.field-error',f); if(e) e.hidden=true; }); let valid = true; for (const [name, message, passed] of tests) if(!passed) {setFieldError(form,name,message); valid=false;} if(!valid) $('.invalid input',form)?.focus(); return valid; }
  function getSelect(name, root = workspace) { return $(`[data-select="${name}"]`,root)?.dataset.value; }
  function filterChanged() { state.page = 0; const result = filteredDrones(); if (!result.some(d => d.id === state.selected)) state.selected = result[0]?.id; state.commandError = ''; render(); }
  function openMissionForm(id = null) { state.editMission = id; navigate('missionForm'); }
  async function handleSubmit(form) {
    if (state.formBusy) return;
    const values = Object.fromEntries(new FormData(form));
    Object.keys(values).forEach(k => values[k] = values[k].trim());
    let apply;
    if (form.id === 'register-form') {
      const weight = Number(values.capacity), battery = Number(values.battery);
      if (!validate(form,[['droneId','Enter a drone ID (maximum 24 characters).',values.droneId.length > 2 && values.droneId.length <=24],['droneId','This drone ID is already registered.',!drones.some(d => d.id.toLowerCase() === values.droneId.toLowerCase())],['serial','Enter a unique serial number.',values.serial.length >=3 && !drones.some(d => d.serial.toLowerCase() === values.serial.toLowerCase())],['capacity','Capacity must be between 0.1 and 4.5 kg.',values.capacity !== '' && Number.isFinite(weight) && weight >=.1 && weight<=4.5],['battery','Battery must be a whole number from 0 to 100.',values.battery !== '' && Number.isInteger(battery) && battery>=0 && battery<=100]])) return;
      apply = () => { const model=getSelect('Drone model',form); drones.push({id:values.droneId,serial:values.serial,model,base:getSelect('Ground station',form),status:'idle',battery,payload:0,parcels:0,capacity:weight,hours:0,altitude:120,speed:65,flightTime:45,gps:'Not available',certification:365,image:imageFor(model)}); state.selected=values.droneId; state.filter='idle'; state.page=Math.floor((drones.filter(d=>d.status==='idle').length-1)/10); state.model='All models';state.battery='Any battery';navigate('fleet');toast(`${values.droneId} added to fleet`); };
    }
    if (form.id === 'mission-form') {
      const drone = drones.find(d=>d.id===getSelect('Assigned drone',form)); const weight=Number(values.weight),distance=Number(values.distance);
      if (!validate(form,[['destination','Enter a delivery address.',values.destination.length>=5],['weight',`Enter a weight between 0.1 and ${drone?.capacity || 2.5} kg.`,values.weight!=='' && Number.isFinite(weight) && weight>=.1 && weight<=(drone?.capacity || 2.5)],['distance','Flight distance must be between 0.1 and 20 km.',values.distance!=='' && Number.isFinite(distance) && distance>=.1 && distance<=20]])) return;
      if (!drone || drone.status!=='idle') { $('#form-error').textContent='Choose an idle drone before saving the flight plan.';$('#form-error').hidden=false;return; }
      apply=()=>{ const existing=missions.find(m=>m.id===state.editMission); const id=existing?.id || `MS-${missionSequence++}`; const from=getSelect('Departure station',form); const record={id,name:`${from} → ${values.destination}`,from,to:values.destination,drone:drone.id,status:'draft',distance,eta:'—',weight,progress:0}; if(existing) Object.assign(existing,record);else missions.unshift(record); if(state.assignOrder){ const order=orders.find(o=>o.id===state.assignOrder);if(order)order.mission=id;state.assignOrder=null; }state.mission=id;state.missionFilter='draft';navigate('missions');toast('Flight plan saved'); };
    }
    if (form.id==='order-form') {
      const weight=Number(values.weight);
      if(!validate(form,[['recipient','Enter the recipient name.',values.recipient.length>=2],['address','Enter a delivery address.',values.address.length>=5],['contents','Describe the parcel contents.',values.contents.length>=2],['weight','Parcel weight must be between 0.1 and 2.5 kg.',values.weight!=='' && Number.isFinite(weight) && weight>=.1 && weight<=2.5]]))return;
      apply=()=>{const id=`DL-${String(orderSequence++).padStart(5,'0')}`;orders.unshift({id,recipient:values.recipient,address:values.address,contents:values.contents,weight,from:getSelect('Pickup station',form),status:'queued',mission:'',time:'Unscheduled'});state.order=id;state.orderFilter='queued';navigate('orders');toast('Delivery added to queue');};
    }
    if(form.id==='account-form') {
      if(!validate(form,[['name','Enter your full name.',values.name.length>=2],['email','Enter a valid email address.',/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)],['organization','Enter an organization name.',values.organization.length>=2]]))return;
      apply=()=>{Object.assign(profile,values);$('.avatar').setAttribute('aria-label',`${profile.name}, account settings`);$('.avatar span').textContent=profile.name.split(/\s+/).slice(0,2).map(s=>s[0]).join('').toUpperCase();$('#account-result').textContent='Account details updated in this workspace.';$('#account-result').hidden=false;toast('Account details updated');};
    }
    if(!apply)return;
    state.formBusy=true; const submit=$('[type=submit]',form); const text=submit.innerHTML;submit.disabled=true;submit.textContent='Saving…'; form.setAttribute('aria-busy','true');
    await new Promise(resolve=>setTimeout(resolve,350));
    // 用户已离开表单时不应用悬挂的操作。
    if(form.isConnected) {apply(); if(submit.isConnected){submit.disabled=false;submit.innerHTML=text;form.removeAttribute('aria-busy');}}
    state.formBusy=false;
  }
  async function importFleet(file) {
    const error=$('#import-error'),result=$('#import-result');error.hidden=true;result.hidden=true;
    const trigger=$('[data-action="choose-file"]');trigger.disabled=true;trigger.textContent='Reading…';
    try {
      if(file.size>1024*1024)throw new Error('File exceeds the 1 MB limit.');
      const records=JSON.parse(await file.text());
      if(!Array.isArray(records)||records.length<1||records.length>100)throw new Error('The file must contain an array of 1–100 drone records.');
      const ids=new Set(),serials=new Set();
      const imported=records.map((r,i)=>{
        if(!r || typeof r!=='object' || typeof r.id!=='string' || r.id.trim().length<3 || r.id.trim().length>24 || typeof r.serial!=='string' || r.serial.length<3 || r.serial.length>32 || !models.includes(r.model) || !bases.includes(r.base) || !['idle','flying','charging','maintenance','offline'].includes(r.status) || !Number.isInteger(r.battery) || r.battery<0 || r.battery>100 || !Number.isFinite(r.capacity) || r.capacity<.1 || r.capacity>4.5 || !Number.isFinite(r.payload) || r.payload<0 || r.payload>r.capacity || !Number.isInteger(r.parcels) || r.parcels<0 || r.parcels>4)throw new Error(`Record ${i+1} has invalid or missing device fields.`);
        const id=r.id.trim().toLowerCase(),serial=r.serial.trim().toLowerCase();if(ids.has(id)||serials.has(serial))throw new Error(`Record ${i+1} duplicates an ID or serial number.`);ids.add(id);serials.add(serial);
        return {id:r.id.trim(),serial:r.serial.trim(),model:r.model,base:r.base,status:r.status,battery:r.battery,payload:r.payload,parcels:r.parcels,capacity:r.capacity,image:imageFor(r.model),hours:0,altitude:120,speed:65,flightTime:45,gps:'Not available',certification:365};
      });
      if(imported.some(r=>drones.some(d=>d.id.toLowerCase()===r.id.toLowerCase()||d.serial.toLowerCase()===r.serial.toLowerCase())))throw new Error('A drone ID or serial number is already registered. Import only new devices.');
      if(!trigger.isConnected)return;
      drones.push(...imported);result.textContent=`${imported.length} drones added. Fleet now contains ${drones.length} drones.`;result.hidden=false;toast('Fleet file imported');
    } catch(e) {if(error.isConnected){error.textContent=e instanceof SyntaxError?'The file is not valid JSON. Check its format and try again.':e.message;error.hidden=false;}}
    finally {if(trigger.isConnected){trigger.disabled=false;trigger.innerHTML=`${icon('upload')}Choose file`;}const input=$('#fleet-file');if(input)input.value='';}
  }
  function focusMission(id) {
    state.mission = id; state.missionFilter = 'all'; state.search = ''; $('#search').value = '';
    state.missionPage = Math.floor(Math.max(0, missions.findIndex(m => m.id === id)) / 5);
    navigate('missions');
  }
  function operationMenu(trigger) {
    state.mission = trigger.dataset.operationId;
    render();
    const anchor = $(`[data-operation-id="${state.mission}"]`);
    const m = missions.find(m => m.id === state.mission);
    popover(anchor, `<h3>${escape(m.id)}</h3><p class="panel-subtitle" style="padding:.4cqw">${escape(m.to)}</p><div class="menu-divider"></div><button class="menu-option" data-action="mission-drone">${icon('drone')}View drone</button><button class="menu-option" data-action="export-flight-plan">${icon('download')}Export flight plan</button>${m.status === 'draft' ? `<button class="menu-option" data-action="edit-mission">${icon('pencil')}Edit draft</button><button class="menu-option" data-action="dispatch">${icon('send')}Dispatch mission</button>` : `<button class="menu-option" disabled>${icon('pencil')}Edit active route</button>`}`, 25);
  }
  const actions = {
    'operation-menu': b => operationMenu(b),
    'operation-search': () => { $('#search').focus(); $('#search').select(); },
    'operations-filter': b => popover(b, `<h3>Operations</h3>${customSelect('Operation status', ({all:'All operations',flying:'In flight',draft:'Drafts',completed:'Completed',attention:'Needs attention'})[state.missionFilter], ['All operations','In flight','Drafts','Completed','Needs attention'])}<div class="menu-divider"></div><div class="fleet-page-menu"><span>Page ${state.missionPage + 1} of ${Math.max(1, Math.ceil(filteredMissions().length / 5))}</span><div class="pagination-controls"><button class="icon-button" data-action="previous-operation-page" aria-label="Previous operations page" ${state.missionPage === 0 ? 'disabled' : ''}>${icon('chevron-left')}</button><button class="icon-button" data-action="next-operation-page" aria-label="Next operations page" ${(state.missionPage + 1) * 5 >= filteredMissions().length ? 'disabled' : ''}>${icon('chevron-right')}</button></div></div><div class="menu-divider"></div><button class="menu-option" data-action="export-missions">${icon('download')}Export schedule</button>`,25),
    'previous-operation-page':()=>{state.missionPage--;state.trackCard=true;closePopover();render();},
    'next-operation-page':()=>{state.missionPage++;state.trackCard=true;closePopover();render();},
    'reset-operations':()=>{state.missionFilter='all';state.search='';$('#search').value='';state.missionPage=0;render();},
    'toggle-flight-card':()=>{state.trackCard=state.trackCard===false;const card=$('.flight-info-card');if(card)card.hidden=!state.trackCard;$('.aircraft-marker')?.setAttribute('aria-expanded',state.trackCard);},
    'street-layer':()=>{state.trackBuildings=false;render();},
    'building-layer':()=>{state.trackBuildings=true;render();},
    'expand-tracking':()=>{state.trackExpanded=!state.trackExpanded;render();},
    'telemetry-menu':b=>popover(b,`<h3>Flight instruments</h3><button class="menu-option" data-action="export-telemetry">${icon('download')}Export telemetry</button><button class="menu-option" disabled>${icon('adjustments')}Calibrate instruments</button><p class="panel-subtitle" style="padding:.4cqw">Calibration requires a fleet gateway.</p>`,26),
    'export-telemetry':()=>{const m=missions.find(m=>m.id===state.mission);const d=drones.find(d=>d.id===m?.drone);if(m)exportFile(`${m.id}-telemetry.json`,{mission:m.id,drone:m.drone,altitude:400,speed:26,payload:m.weight,battery:d?.battery,heading:105});closePopover();},
    'closure-info':b=>confirmDialog('Air corridor advisory',`${b.dataset.closure}: construction activity along the route. Keep the approved flight corridor and review clearance before dispatch.`,'close-dialog','Dismiss'),
    'expand-feed':()=>{confirmDialog('Camera image','City overview','close-dialog','Close');const dialog=$('.dialog');dialog.classList.add('dialog--image');dialog.innerHTML=`<h2 id="dialog-title">Camera image</h2><img src="./assets/city-feed.webp" alt="City camera image"><div class="dialog-footer">${button('Close','close-dialog')}</div>`;dialog.removeAttribute('aria-describedby');$('.dialog-footer button').focus();},
    register:()=>navigate('register'), 'back-fleet':()=>navigate('fleet'), 'open-missions':()=>navigate('missions'), 'open-orders':()=>navigate('orders'),
    'new-mission':()=>{state.assignOrder=null;openMissionForm();}, 'edit-mission':()=>openMissionForm(state.mission), 'new-order':()=>navigate('orderForm'),
    'close-toast':()=>{$('#toast').hidden=true;clearTimeout(toastTimer);}, 'close-dialog':()=>closeDialog(),
    'reset-filters':()=>{state.search='';$('#search').value='';state.filter='all';state.model='All models';state.battery='Any battery';state.sort='Registration order';filterChanged();},
    'previous-page':()=>{state.page--;closePopover();render();}, 'next-page':()=>{state.page++;closePopover();render();},
    'preview-left':()=>{state.previewReverse=!state.previewReverse;$('.drone-preview img')?.classList.toggle('reverse',state.previewReverse);},
    'preview-right':()=>{state.previewReverse=!state.previewReverse;$('.drone-preview img')?.classList.toggle('reverse',state.previewReverse);},
    'fleet-filters':b=>popover(b,`<h3>Filter fleet</h3><div class="field"><span>Model</span>${customSelect('Filter model',state.model,['All models',...models])}</div><div class="field" style="margin-top:1cqw"><span>Battery</span>${customSelect('Filter battery',state.battery,['Any battery','Below 30%','30% and above'])}</div><div class="field" style="margin-top:1cqw"><span>Sort by</span>${customSelect('Sort order',state.sort,['Registration order','Battery level','Payload weight'])}</div><div class="menu-divider"></div>${button('Reset filters','reset-filters','ghost','restore')}<div class="menu-divider"></div><div class="fleet-page-menu"><span>Page ${state.page + 1} of ${Math.max(1, Math.ceil(filteredDrones().length / 10))}</span><div class="pagination-controls"><button class="icon-button" data-action="previous-page" aria-label="Previous fleet page" ${state.page === 0 ? 'disabled' : ''}>${icon('chevron-left')}</button><button class="icon-button" data-action="next-page" aria-label="Next fleet page" ${(state.page + 1) * 10 >= filteredDrones().length ? 'disabled' : ''}>${icon('chevron-right')}</button></div></div>`,27),
    notifications:b=>popover(b,`<div class="panel-title"><h3>Notifications</h3>${button('Clear all','clear-notifications','small ghost')}</div><button class="notification-item" data-notification="battery">${icon('battery-1')}<div><strong>Battery needs attention</strong><p>AD 9235-1254 · 28% remaining</p></div></button><button class="notification-item" data-notification="delivery">${icon('package')}<div><strong>Delivery completed</strong><p>DL-08238 · 11:32</p></div></button><button class="notification-item" data-notification="charge">${icon('charging-pile')}<div><strong>Charging in progress</strong><p>AD 9267-9587 · North Hub</p></div></button>`,31),
    'clear-notifications':()=>{$('#popover').innerHTML='<h3>All caught up</h3><p class="panel-subtitle">No unread notifications.</p>';$('.notification-dot').hidden=true;},
    connection:()=>{state.settings='connection';navigate('settings');}, account:()=>{state.settings='account';navigate('settings');},
    'return-base':()=>{const d=drones.find(d=>d.id===state.selected);if(!d||d.status!=='flying')return;confirmDialog('Return to base?',`Request a return flight for ${d.id} to ${d.base}. A connected fleet gateway is required.`,'confirm-return','Request return');},
    'take-offline':()=>{const d=drones.find(d=>d.id===state.selected);if(!d)return;confirmDialog('Take drone offline?',`${d.id}${d.status==='flying'?' is currently in flight. It must land before going offline.':' will be unavailable for new missions.'} An authorized gateway is required to send this command.`,'confirm-offline','Request offline',true);},
    'confirm-return':()=>commandFailed('return-to-base'), 'confirm-offline':()=>commandFailed('take-offline'),
    'save-command':()=>exportFile('drone-command-request.json',lastCommand),
    'mission-drone':()=>{const m=missions.find(m=>m.id===state.mission);if(m){state.selected=m.drone;state.filter='all';navigate('fleet');const i=filteredDrones().findIndex(d=>d.id===state.selected);state.page=Math.floor(Math.max(0,i)/10);render();}},
    dispatch:()=>{const m=missions.find(m=>m.id===state.mission);if(m)confirmDialog('Dispatch mission?',`${m.id} requires an authorized gateway and flight clearance. No flight can begin without a gateway connection.`,'confirm-dispatch','Request dispatch');},
    'confirm-dispatch':()=>{closeDialog();toast('Fleet gateway is not connected. No dispatch command was sent.');},
    'order-mission':()=>{const o=orders.find(o=>o.id===state.order);if(!o)return;if(o.mission){focusMission(o.mission);}else{state.assignOrder=o.id;openMissionForm();$('[name=destination]').value=o.address;$('[name=weight]').value=o.weight;updateSelect($('[data-select="Departure station"]'),o.from);$('#route-destination').textContent=o.address;}},
    'remove-order':()=>confirmDialog('Remove queued delivery?',`${state.order} will be removed from this workspace. Other deliveries will not change.`,'confirm-remove-order','Remove delivery',true),
    'confirm-remove-order':()=>{const i=orders.findIndex(o=>o.id===state.order&&o.status==='queued');if(i>=0)orders.splice(i,1);closeDialog(false);render();toast('Delivery removed from queue');},
    'export-missions':()=>exportFile('flight-schedule.json',missions), 'export-orders':()=>exportFile('deliveries.json',orders),
    'export-flight-plan':()=>exportFile(`${state.mission}-flight-plan.json`,missions.find(m=>m.id===state.mission)),
    'export-delivery':()=>exportFile(`${state.order}.json`,orders.find(o=>o.id===state.order)),
    'export-fleet-json':()=>exportFile('air-dropper-fleet.json',fleetExport()),
    'export-fleet-csv':()=>exportFile('air-dropper-fleet.csv',csv([['Drone ID','Model','Status','Battery %','Payload kg','Capacity kg','Station','Serial'],...fleetExport().map(d=>[d.id,d.model,d.status,d.battery,d.payload,d.capacity,d.base,d.serial])]),'text/csv;charset=utf-8'),
    'choose-file':()=>$('#fleet-file')?.click(),
    'reset-preferences':()=>{Object.assign(preferences,{motion:true,lowBattery:true,notifications:true,units:'Metric'});savePreferences();render();toast('Default preferences restored');},
    'check-connection':async b=>{if(state.connectionBusy)return;state.connectionBusy=true;b.disabled=true;b.textContent='Checking…';await new Promise(r=>setTimeout(r,600));state.connectionBusy=false;if(b.isConnected){b.disabled=false;b.innerHTML=`${icon('refresh')}Check connection`;$('#connection-error').textContent='No gateway endpoint is configured. Connect your authorized fleet service, then check again.';$('#connection-error').hidden=false;}},
    'export-connection':()=>exportFile('fleet-connection-checklist.txt','Air Dropper gateway checklist\n\n1. Configure an authorized gateway endpoint.\n2. Provide a device-scoped access token.\n3. Verify telemetry and command acknowledgments.\n4. Verify flight clearance and grounded status.\n\nNo gateway is connected to this workspace.','text/plain'),
    'chart-table':()=>{state.chartTable=!state.chartTable;render();},
    'export-report':()=>exportFile('delivery-report.csv',csv([['Period','Completed deliveries'],...chartData()]),'text/csv;charset=utf-8'),
    'map-in':()=>{state.mapZoom=Math.min(1.5,state.mapZoom+.25);render();}, 'map-out':()=>{state.mapZoom=Math.max(1,state.mapZoom-.25);render();}, 'map-reset':()=>{state.mapZoom=1;render();}
  };
  function commandFailed(command) { const d=drones.find(d=>d.id===state.selected);if(!d)return;lastCommand={droneId:d.id,action:command,station:d.base,status:'not-sent',reason:'gateway-not-connected'};closeDialog(false);state.commandError='Fleet gateway is not connected. No command was sent.';render();$('[data-action="save-command"]')?.focus(); }
  function updateSelect(select, option) {
    select.dataset.value=option;$('.select-trigger span',select).textContent=option;$$('.menu-option',select).forEach(b=>{b.setAttribute('aria-selected',b.dataset.option===option);const check=$('.ti-check',b);if(check)check.remove();if(b.dataset.option===option)b.insertAdjacentHTML('beforeend',icon('check'));});closeSelects();$('.select-trigger',select).focus();
    const key=select.dataset.select;
    if(key==='Filter model')state.model=option;
    if(key==='Filter battery')state.battery=option;
    if(key==='Sort order')state.sort=option;
    if(key.startsWith('Filter ')||key==='Sort order') {closePopover();filterChanged();}
    if(key==='Operation status') {state.missionFilter=({'All operations':'all','In flight':'flying','Drafts':'draft','Completed':'completed','Needs attention':'attention'})[option];state.missionPage=0;state.trackCard=true;closePopover();render();}
    if(key==='Reporting period') {state.chartRange=option;render();}
    if(key==='Measurement units') {preferences.units=option;savePreferences();toast('Measurement units updated');}
    if(key==='Drone model') {$('#model-image').src=imageFor(option);$('#model-image').alt=`${option} drone`;$('.form-layout aside h2').textContent=option;}
    if(key==='Departure station')$('#route-departure').textContent=option;
  }
  function onClick(e) {
    const b=e.target.closest('button, [data-mission], [data-order]');
    if(!b || b.disabled)return;
    if(b.dataset.view){navigate(b.dataset.view);return;}
    if(b.classList.contains('select-trigger')) {const panel=$('.select-panel',b.parentElement);const wasOpen=!panel.hidden;closeSelects();panel.hidden=wasOpen;b.setAttribute('aria-expanded',!wasOpen);return;}
    if(b.dataset.option){updateSelect(b.closest('.custom-select'),b.dataset.option);return;}
    if(b.dataset.drone){state.selected=b.dataset.drone;state.commandError='';state.previewReverse=false;render();return;}
    if(b.dataset.filter){state.filter=b.dataset.filter;filterChanged();return;}
    if(b.dataset.missionFilter){state.missionFilter=b.dataset.missionFilter;state.missionPage=0;render();return;}
    if(b.dataset.orderFilter){state.orderFilter=b.dataset.orderFilter;state.orderPage=0;render();return;}
    if(b.dataset.recordPage){state[`${b.dataset.recordPage}Page`]+=Number(b.dataset.direction);render();return;}
    if(b.dataset.mission){state.mission=b.dataset.mission;state.trackCard=true;render();return;}
    if(b.dataset.order){state.order=b.dataset.order;render();return;}
    if(b.dataset.missionLink){focusMission(b.dataset.missionLink);return;}
    if(b.dataset.mapDrone){state.selected=b.dataset.mapDrone;state.mission=missions.find(m=>m.drone===state.selected)?.id;state.missionFilter='all';if(state.view==='overview')navigate('missions');else render();return;}
    if(b.dataset.settings){state.settings=b.dataset.settings;render();return;}
    if(b.dataset.preference){const k=b.dataset.preference;preferences[k]=!preferences[k];b.setAttribute('aria-checked',preferences[k]);savePreferences();document.body.classList.toggle('no-motion',!preferences.motion);return;}
    if(b.dataset.notification){const type=b.dataset.notification;closePopover();if(type==='delivery'){state.order='DL-08238';state.orderFilter='all';navigate('orders');}else{state.selected=type==='battery'?'AD 9235-1254':'AD 9267-9587';state.filter='all';navigate('fleet');}return;}
    if(b.dataset.overviewTab){toast('Live operations selected');return;}
    if(b.dataset.action)actions[b.dataset.action]?.(b);
  }
  function tooltip(target) { const i=Number(target.dataset.chartIndex);const d=chartData()[i];const tip=$('.chart-tooltip');if(!d||!tip)return;tip.textContent=`${d[0]} · ${d[1]} completed deliveries`;tip.hidden=false;const parent=$('.chart-container').getBoundingClientRect(),r=target.getBoundingClientRect();tip.style.left=`${Math.min(Math.max(0,r.left-parent.left),Math.max(0,parent.width-tip.offsetWidth))}px`; }
  function onKeydown(e) {
    if(e.key==='Escape'){if(!$('#dialog-layer').hidden)closeDialog();else if(!$('#popover').hidden)closePopover(true);else{const t=$('.select-trigger[aria-expanded=true]');closeSelects();t?.focus();}return;}
    if(!$('#dialog-layer').hidden && e.key==='Tab'){const focusable=$$('button:not(:disabled)', $('.dialog'));const first=focusable[0],last=focusable.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}return;}
    if((e.key==='/' || ((e.ctrlKey||e.metaKey)&&e.key==='k')) && !/INPUT|TEXTAREA/.test(e.target.tagName)) {e.preventDefault();$('#search').focus();return;}
    const trigger=e.target.closest('.select-trigger');const option=e.target.closest('.menu-option');
    if((trigger||option)&&['ArrowDown','ArrowUp','Home','End','Enter',' '].includes(e.key)) {
      const root=e.target.closest('.custom-select');if(!root)return;const options=$$('.menu-option:not(:disabled)',root);if(!options.length)return;
      if(['Enter',' '].includes(e.key))return;
      e.preventDefault();closeSelects();$('.select-panel',root).hidden=false;$('.select-trigger',root).setAttribute('aria-expanded','true');const current=options.indexOf(document.activeElement);const next=e.key==='Home'?0:e.key==='End'?options.length-1:current<0?(e.key==='ArrowUp'?options.length-1:0):((current+(e.key==='ArrowDown'?1:-1))+options.length)%options.length;options[next].focus();return;
    }
    const row=e.target.closest('tr[data-mission],tr[data-order]');if(row&&(e.key==='Enter'||e.key===' ')){e.preventDefault();row.click();}
  }
  function start() {
    if(started)return;started=true;render();
    app.addEventListener('click',onClick);
    app.addEventListener('submit',e=>{e.preventDefault();handleSubmit(e.target);});
    $('#search').addEventListener('input',e=>{state.search=e.target.value;state.page=0;state.missionPage=0;state.orderPage=0;closePopover();if(state.view==='fleet')filterChanged();else if(['overview','missions','orders'].includes(state.view))render();else toast('Search is available in fleet, missions and deliveries.');});
    app.addEventListener('input',e=>{if(e.target.name==='destination')$('#route-destination').textContent=e.target.value||'Destination address';const fieldNode=e.target.closest('.field.invalid');if(fieldNode){fieldNode.classList.remove('invalid');e.target.removeAttribute('aria-invalid');$('.field-error',fieldNode).hidden=true;}});
    app.addEventListener('change',e=>{if(e.target.id==='fleet-file'&&e.target.files[0])importFleet(e.target.files[0]);});
    app.addEventListener('pointerover',e=>{const target=e.target.closest('[data-chart-index]');if(target)tooltip(target);});
    app.addEventListener('focusin',e=>{if(e.target.matches('[data-chart-index]'))tooltip(e.target);});
    app.addEventListener('pointerout',e=>{if(e.target.matches('[data-chart-index]')){const tip=$('.chart-tooltip');if(tip)tip.hidden=true;}});
    app.addEventListener('focusout',e=>{if(e.target.matches('[data-chart-index]')){const tip=$('.chart-tooltip');if(tip)tip.hidden=true;}});
    document.addEventListener('keydown',onKeydown);
    document.addEventListener('pointerdown',e=>{if(!e.target.closest('.custom-select'))closeSelects();if(!e.target.closest('#popover')&&!e.target.closest('[data-action="fleet-filters"], [data-action="notifications"], [data-action="operations-filter"], [data-action="operation-menu"], [data-action="telemetry-menu"]')&&e.target!==menuFocus)closePopover();});
    app.addEventListener('error',e=>{if(e.target instanceof HTMLImageElement){e.target.style.visibility='hidden';e.target.insertAdjacentHTML('afterend','<span class="muted" style="font-size:var(--fs-xs)">Image unavailable</span>');}},true);
  }
  start();
})();
