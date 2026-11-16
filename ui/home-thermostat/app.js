const screen = document.querySelector('#screen');
const rooms = {
  living: { name: 'Living room', light: true, brightness: 80, tone: 'Warm', air: true, target: 21, current: 28, humidity: 52, mode: 'cool', automatic: false, auxiliary: false, auxiliaryName: 'Smart TV', airName: 'Samsung F7', volume: 25, source: 'HDMI 1' },
  kitchen: { name: 'Kitchen', light: true, brightness: 100, tone: 'Neutral', air: false, target: 23, current: 24, humidity: 46, mode: 'cool', automatic: false, auxiliary: false, auxiliaryName: 'Smart outlet', airName: 'Daikin A3', volume: 0, source: 'HDMI 1' },
  dining: { name: 'Dining', light: false, brightness: 60, tone: 'Warm', air: true, target: 22, current: 25, humidity: 48, mode: 'cool', automatic: false, auxiliary: false, auxiliaryName: 'Smart outlet', airName: 'Samsung F7', volume: 0, source: 'HDMI 1' },
  bathroom: { name: 'Bathroom', light: null, brightness: 75, tone: 'Neutral', air: null, target: 24, current: 24, humidity: 60, mode: 'cool', automatic: false, auxiliary: null, auxiliaryName: 'Smart outlet', airName: '', volume: 0, source: 'HDMI 1' }
};
const state = { view: 'home', room: 'living', climateTab: 'temperature', period: 'week', budget: 180, activeScene: null, chartTable: false, dropdown: false, addRoom: 'bathroom', scan: 'idle', scanCount: 0, pairCount: 0, scanTimer: null, started: false, dragging: false };
const energyData = {
  today: { labels: ['00', '04', '08', '12', '16', '20'], values: [0.4, 0.3, 1.6, 1.1, 1.4, 2.2], max: 3, title: 'Today', caption: 'Consumption · kWh' },
  week: { labels: ['M', 'T', 'W', 'T', 'F', 'S', 'S'], fullLabels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], values: [7.2, 9.8, 6.4, 8.1, 7.6, 9.5, 7], max: 12, title: 'This week', caption: 'Consumption · kWh' },
  month: { labels: ['1–4', '5–8', '9–12', '13–16'], values: [67, 71, 74, 66], max: 80, title: 'November', caption: 'Consumption · kWh' }
};
const scenes = [
  { id: 'welcome', name: 'Welcome home', icon: 'home', description: 'Lights on · Air at 21°C', light: true, air: true, tv: false, brightness: 80, target: 21 },
  { id: 'movie', name: 'Movie night', icon: 'movie', description: 'Lights dimmed · TV on', light: true, air: true, tv: true, brightness: 35, target: 22 },
  { id: 'away', name: 'Away', icon: 'door-exit', description: 'All devices off', light: false, air: false, tv: false, brightness: 80, target: 21 }
];
const icon = name => name === 'lamp-ceiling' ? '<svg class="ti device-glyph" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2v6" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M3 17a9 9 0 0 1 18 0z" fill="currentColor"/><path d="M10 20h4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>' : `<i class="ti ti-${name}" aria-hidden="true"></i>`;
const room = () => rooms[state.room];
const countDevices = item => ['light', 'air', 'auxiliary'].filter(key => item[key] !== null).length;
const switchButton = (key, value, label) => `<button type="button" class="switch" role="switch" aria-checked="${value}" aria-label="${label}" data-toggle="${key}"><span>${value ? 'On' : 'Off'}</span></button>`;
const heading = (title, subtitle, back = 'home') => `<header class="view-header"><button type="button" class="icon-button" data-view="${back}" aria-label="Back">${icon('chevron-left')}</button><div class="view-heading"><h1>${title}</h1><p>${subtitle}</p></div></header>`;

function houseIllustration() {
  return `<svg class="hero-house" viewBox="0 0 272 164" aria-hidden="true">
    <path class="house-ink" d="M2 151c16-34 37-48 59-33 28 21 37 3 61-7 40-18 69 1 87 8 30 10 49 1 62 45H2z"/>
    <path class="house-body" d="m121 77 48-49 50 49v79h-98z"/>
    <path class="house-side" d="M208 83h31v73h-31z"/>
    <path class="house-ink" d="M127 37h13v29h-13zM124 33h19v7h-19z"/>
    <path class="house-line" d="m114 88 55-58 59 58" stroke-width="6"/>
    <path class="house-wifi" d="M216 57c8-5 17-5 25 0m-21 7c5-3 11-3 17 0m-12 7c2-1 4-1 6 0"/>
    <circle class="house-detail" cx="166" cy="118" r="14"/>
    <circle class="house-ink" cx="166" cy="118" r="9"/>
    <path class="house-line" d="M166 73v44" stroke-width="4"/>
    <path d="M166 72c-4-6-11-6-11 1v17" stroke="var(--white)" fill="none" stroke-width="4" stroke-linecap="round"/>
    <circle class="house-detail" cx="153" cy="79" r="2.5"/><circle class="house-detail" cx="153" cy="91" r="2.5"/><circle class="house-detail" cx="153" cy="103" r="2.5"/>
    <path d="m221 110 4-4 4 4m-8 11 4 4 4-4" stroke="var(--white)" fill="none" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
}
function renderHome() {
  const item = room();
  const tabs = Object.entries(rooms).filter(([key]) => key !== 'bathroom');
  if (state.room === 'bathroom') tabs[2] = ['bathroom', rooms.bathroom];
  let cards = '';
  if (item.light !== null) cards += `<article class="device-card ${item.light ? '' : 'is-off'}"><div class="device-card-top">${icon('lamp-ceiling')}${switchButton('light', item.light, 'Smart spotlights power')}</div><button type="button" class="device-name" data-view="light"><span>Smart<br>Spotlights</span></button></article>`;
  if (item.air !== null) cards += `<article class="device-card device-card--air ${item.air ? '' : 'is-off'}"><div class="device-card-top">${icon('air-conditioning')}${switchButton('air', item.air, 'Air conditioning power')}</div><button type="button" class="device-name" data-view="climate"><span>Air<br>${item.airName}</span>${icon('chevron-down')}</button>${[['cool', 'snowflake', `${item.target}°C`], ['fan', 'wind', 'Inactive'], ['eco', 'bolt', 'Inactive']].map(([mode, glyph, label]) => `<button type="button" class="air-mode ${item.air && item.mode === mode ? 'active' : ''}" data-mode="${mode}" ${!item.air ? 'disabled' : ''}>${icon(glyph)}<span>${item.air && item.mode === mode ? (mode === 'cool' ? `${item.target}°C` : mode === 'fan' ? 'Active' : 'Eco') : label === 'Inactive' ? label : 'Inactive'}</span></button>`).join('')}</article>`;
  if (item.auxiliary !== null) cards += `<article class="device-card ${item.auxiliary ? '' : 'is-off'}"><div class="device-card-top">${item.auxiliaryName === 'Smart TV' ? '<span class="tv-mark" aria-hidden="true">TV</span>' : icon('plug')}${switchButton('auxiliary', item.auxiliary, `${item.auxiliaryName} power`)}</div><button type="button" class="device-name" data-view="tv"><span>${item.auxiliaryName === 'Smart TV' ? 'Smart<br>TV' : 'Smart<br>Outlet'}</span></button></article>`;
  return `<section class="view view--home"><header class="room-header"><button type="button" class="menu-button" data-view="settings" aria-label="Home settings"><span class="menu-mark" aria-hidden="true"></span></button><div class="room-tabs" role="tablist" aria-label="Rooms">${tabs.map(([key, value]) => `<button type="button" class="room-tab" role="tab" aria-selected="${key === state.room}" data-room="${key}">${value.name}</button>`).join('')}</div></header><div class="home-hero"><h1 class="welcome">Welcome Home<strong>Garret Reynolds</strong></h1>${houseIllustration()}</div><section class="energy-card" aria-label="Monthly energy expenses"><div class="energy-card-top"><div class="energy-symbol" aria-hidden="true"><div class="energy-lines"><span></span><span></span><span></span></div>${icon('bolt')}</div><button type="button" class="energy-copy" data-view="energy">Estimated energy<br>expenses this month</button><button type="button" class="energy-more" data-view="budget" aria-label="Energy budget">${icon('dots')}</button></div><div class="expense-meter" role="meter" aria-label="Monthly energy expenses" aria-valuemin="0" aria-valuemax="${state.budget}" aria-valuenow="89" aria-valuetext="89 euros of ${state.budget} euros" style="--fill:${Math.min(89 / state.budget * 100, 100)}%"><span class="expense-fill"></span><span>89 €</span></div></section>${cards ? `<div class="device-grid">${cards}</div>` : `<div class="empty-state"><h2>A little more connected</h2><p>Add your first device to the bathroom.</p><button type="button" class="primary-button" data-view="add">${icon('plus')} Add a device</button></div>`}</section>`;
}
function renderClimate() {
  const item = room();
  return `<section class="view view--climate">${heading('Temperature', item.name)}<div class="segmented" role="tablist" aria-label="Climate views"><button type="button" role="tab" data-climate-tab="temperature" aria-selected="${state.climateTab === 'temperature'}">${icon('temperature')}Temperature</button><button type="button" role="tab" data-climate-tab="statistics" aria-selected="${state.climateTab === 'statistics'}">${icon('chart-bar')}Statistics</button></div>${state.climateTab === 'temperature' ? `<div class="dial-area"><p class="comfort-label">${item.air ? (item.target <= 19 ? 'Cool' : item.target >= 25 ? 'Warm' : 'Medium') : 'Air is off'}</p><div class="dial" role="slider" tabindex="${item.air ? '0' : '-1'}" aria-label="Target temperature" aria-valuemin="16" aria-valuemax="28" aria-valuenow="${item.target}" aria-valuetext="${item.target} degrees Celsius" aria-disabled="${!item.air}"><svg class="dial-ticks" viewBox="0 0 320 286" aria-hidden="true">${dialTicks(item.target)}</svg><div class="dial-face"><div class="dial-pointer" style="--angle:${(item.target - 16) / 12 * 180 - 90}deg"></div><div class="dial-reading"><span id="target-temperature">${item.target}</span><span class="dial-unit">°C</span></div></div><span class="dial-end dial-end--min">16°C</span><span class="dial-end dial-end--max">28°C</span></div></div><div class="climate-metrics"><div class="climate-metric"><p>Current temp.</p><strong>${item.current}°</strong></div><div class="climate-metric"><p>Current humidity</p><strong>${item.humidity}%</strong></div></div><div class="temperature-controls"><button type="button" class="soft-button ${item.automatic ? 'is-selected' : ''}" data-action="automatic" aria-pressed="${item.automatic}" ${!item.air ? 'disabled' : ''}>Automatic</button><button type="button" class="soft-button" data-step="-1" aria-label="Decrease temperature" ${!item.air || item.target <= 16 ? 'disabled' : ''}>${icon('minus')}</button><button type="button" class="soft-button" data-step="1" aria-label="Increase temperature" ${!item.air || item.target >= 28 ? 'disabled' : ''}>${icon('plus')}</button></div>` : `<div class="summary-row"><div><p>Weekly average</p><div class="hero-number">22.3<span>°C</span></div></div><div><p>Comfort range</p><strong>20–24°C</strong></div></div>${renderChart({ labels: ['M', 'T', 'W', 'T', 'F', 'S', 'S'], fullLabels: energyData.week.fullLabels, values: [22, 23, 24, 23, 21, 22, 21], max: 30, caption: 'Room temperature · °C' }, '°C')}<div class="section-heading"><h2>Room climate</h2></div><div class="breakdown-row"><span>Air conditioning</span>${switchButton('air', item.air, 'Air conditioning power')}</div><div class="breakdown-row"><span>Cooling target</span><strong>${item.target}°C</strong></div>`}</section>`;
}
function dialTicks(value) {
  return Array.from({ length: 49 }, (_, index) => {
    const angle = (180 + index / 48 * 180) * Math.PI / 180;
    const outer = 143, inner = index % 4 === 0 ? 135 : 139;
    return `<line x1="${160 + Math.cos(angle) * inner}" y1="${163 + Math.sin(angle) * inner}" x2="${160 + Math.cos(angle) * outer}" y2="${163 + Math.sin(angle) * outer}" class="${index / 4 + 16 <= value ? 'passed' : ''}"/>`;
  }).join('');
}
function renderChart(data, unit = 'kWh') {
  return `<section class="chart-card" aria-label="${data.caption}"><div class="chart-caption"><span>${data.caption}</span><button type="button" data-action="chart-table" aria-pressed="${state.chartTable}">${state.chartTable ? 'Chart' : 'Data'}</button></div>${state.chartTable ? `<table class="data-table"><caption hidden>${data.caption}</caption><tbody>${data.values.map((value, index) => `<tr><th scope="row">${data.fullLabels?.[index] || data.labels[index]}</th><td>${value} ${unit}</td></tr>`).join('')}</tbody></table>` : `<div class="chart-readout" id="chart-readout" hidden></div><div class="bar-chart"><div class="chart-axis" aria-hidden="true"><span>${data.max}</span><span>${data.max / 2}</span><span>0</span></div><div class="chart-grid" aria-hidden="true"><span></span><span></span><span></span></div><div class="chart-bars">${data.values.map((value, index) => `<button type="button" class="chart-bar" data-chart-label="${data.fullLabels?.[index] || data.labels[index]}" data-chart-value="${value} ${unit}" aria-label="${data.fullLabels?.[index] || data.labels[index]}, ${value} ${unit}" style="--bar-height:calc(var(--plot-height) * ${value / data.max})"><span>${data.labels[index]}</span></button>`).join('')}</div></div>`}</section>`;
}
function renderEnergy() {
  const data = energyData[state.period];
  const total = Number(data.values.reduce((sum, value) => sum + value, 0).toFixed(1));
  return `<section class="view view--energy">${heading('Energy', 'Your home')}<div class="segmented" role="tablist" aria-label="Energy period">${[['today', 'Today'], ['week', 'Week'], ['month', 'Month']].map(([key, label]) => `<button type="button" role="tab" data-period="${key}" aria-selected="${state.period === key}">${label}</button>`).join('')}</div><div class="summary-row"><div><p>${data.title}</p><div class="hero-number">${total}<span>kWh</span></div></div><div><p>Energy cost</p><strong>${(total * .32).toFixed(2)} €</strong></div></div>${renderChart(data)}<div class="section-heading"><h2>By device</h2><button type="button" data-view="budget">Monthly budget ${icon('chevron-right')}</button></div><div class="breakdown">${[['air-conditioning', 'Air conditioning', .65], ['lamp', 'Lighting', .23], ['device-tv', 'Other devices', .12]].map(([glyph, name, portion]) => `<div class="breakdown-row"><span>${icon(glyph)}${name}</span><strong>${(total * portion).toFixed(1)} kWh</strong></div>`).join('')}</div></section>`;
}
function renderBudget() {
  return `<section class="view">${heading('Energy budget', 'November', 'energy')}<section class="energy-total"><p class="muted">Estimated expenses</p><div class="hero-number">89<span>€</span></div><div class="budget-heading"><span>Monthly budget</span><strong>${state.budget} €</strong></div><div class="expense-meter" role="meter" aria-label="Monthly budget used" aria-valuemin="0" aria-valuemax="${state.budget}" aria-valuenow="89" style="--fill:${Math.min(89 / state.budget * 100, 100)}%"><span class="expense-fill"></span><span>${Math.round(89 / state.budget * 100)}%</span></div></section><form id="budget-form" class="budget-edit" novalidate><label class="field"><span>Monthly limit · €</span><input name="budget" inputmode="decimal" type="text" value="${state.budget}" maxlength="5" autocomplete="off"></label><p id="budget-error" class="field-error" role="alert"></p><button type="submit" class="primary-button">Save budget</button><p id="budget-message" class="form-message" role="status"></p></form><div class="section-heading"><h2>Electricity rate</h2></div><div class="breakdown-row"><span>Per kilowatt-hour</span><strong>0.32 €</strong></div></section>`;
}
function renderLight() {
  const item = room();
  return `<section class="view view--light">${heading('Smart Spotlights', item.name)}<div class="device-visual"><div class="lamp-illustration"><div class="lamp-wire"></div><div class="lamp-shade"></div><div class="lamp-light" style="--brightness:${item.light ? item.brightness / 100 : 0}"></div></div></div><div class="device-power-row"><div><h2>Lighting</h2><p class="muted">${item.light ? 'On' : 'Off'}</p></div>${switchButton('light', item.light, 'Smart spotlights power')}</div><div class="slider-group"><label class="slider-label" for="brightness"><span>Brightness</span><strong id="brightness-value">${item.brightness}%</strong></label><input type="range" id="brightness" min="1" max="100" value="${item.brightness}" style="--range:${item.brightness}%" ${!item.light ? 'disabled' : ''}></div><div class="section-heading"><h2>White tone</h2></div><div class="light-tones">${['Warm', 'Neutral', 'Cool'].map(tone => `<button type="button" data-tone="${tone}" aria-pressed="${item.tone === tone}" ${!item.light ? 'disabled' : ''}>${tone}</button>`).join('')}</div><div class="breakdown-row"><span>Connection</span><strong>Connected</strong></div></section>`;
}
function renderTv() {
  const item = room();
  const isTv = item.auxiliaryName === 'Smart TV';
  return `<section class="view view--tv">${heading(item.auxiliaryName, item.name)}<div class="device-visual">${isTv ? `<div class="television"><div class="tv-screen ${item.auxiliary ? 'on' : ''}">${item.auxiliary ? item.source : 'TV'}</div></div>` : icon('plug')}</div><div class="device-power-row"><div><h2>Power</h2><p class="muted">${item.auxiliary ? 'On' : 'Off'}</p></div>${switchButton('auxiliary', item.auxiliary, `${item.auxiliaryName} power`)}</div>${isTv ? `<div class="slider-group"><label class="slider-label" for="volume"><span>Volume</span><strong id="volume-value">${item.volume}%</strong></label><input type="range" id="volume" min="0" max="100" value="${item.volume}" style="--range:${item.volume}%" ${!item.auxiliary ? 'disabled' : ''}></div><div class="section-heading"><h2>Input source</h2></div>${renderDropdown('source', item.source, ['HDMI 1', 'HDMI 2', 'TV', 'USB'], !item.auxiliary)}` : `<div class="breakdown-row"><span>Power usage</span><strong>${item.auxiliary ? '18 W' : '0 W'}</strong></div>`}<div class="breakdown-row"><span>Connection</span><strong>Connected</strong></div></section>`;
}
function renderDropdown(kind, current, options, disabled = false) {
  return `<div class="dropdown"><button type="button" class="dropdown-trigger" data-dropdown="${kind}" aria-label="${kind === 'source' ? 'Input source' : 'Room'}" aria-haspopup="listbox" aria-expanded="${state.dropdown === kind}" aria-controls="${kind}-menu" ${disabled ? 'disabled' : ''}><span>${current}</span>${icon('chevron-down')}</button><div id="${kind}-menu" class="dropdown-menu" role="listbox" aria-label="${kind === 'source' ? 'Input source' : 'Room'}" ${state.dropdown !== kind ? 'hidden' : ''}>${options.map(value => {
    const isDisabled = kind === 'source' && value === 'USB';
    return `<button type="button" role="option" aria-selected="${value === current}" data-option-kind="${kind}" data-option="${value}" ${isDisabled ? 'disabled' : ''}><span>${value}${isDisabled ? ' · Not connected' : ''}</span>${value === current ? icon('check') : ''}</button>`;
  }).join('')}</div></div>`;
}
function renderScenes() {
  return `<section class="view">${heading('Scenes', 'A home that follows you')}<div class="scene-list">${scenes.map(scene => `<button type="button" class="scene-card" data-scene="${scene.id}" aria-pressed="${state.activeScene === scene.id}">${icon(scene.icon)}<span><strong>${scene.name}</strong><small>${scene.description}</small></span>${state.activeScene === scene.id ? `<i class="ti ti-check scene-check" aria-hidden="true"></i>` : ''}</button>`).join('')}</div><p class="scene-footer">${state.activeScene ? `${scenes.find(scene => scene.id === state.activeScene).name} is active.` : 'One touch. Everything in its place.'}</p><div class="section-heading"><h2>Living room</h2><span class="muted">3 devices</span></div><div class="breakdown-row"><span>${icon('lamp-ceiling')}Smart Spotlights</span><strong>${rooms.living.light ? `${rooms.living.brightness}%` : 'Off'}</strong></div><div class="breakdown-row"><span>${icon('air-conditioning')}Air Samsung F7</span><strong>${rooms.living.air ? `${rooms.living.target}°C` : 'Off'}</strong></div><div class="breakdown-row"><span>${icon('device-tv')}Smart TV</span><strong>${rooms.living.auxiliary ? 'On' : 'Off'}</strong></div></section>`;
}
function renderSettings() {
  return `<section class="view">${heading('My home', 'Home settings')}<div class="profile"><div class="profile-monogram" aria-hidden="true">GR</div><div><h2>Garret Reynolds</h2><p>Home sweet home.</p></div></div><div class="section-heading"><h2>Rooms</h2><button type="button" data-view="add">Add device ${icon('plus')}</button></div><div class="room-list">${Object.entries(rooms).map(([key, item]) => `<button type="button" class="room-option" data-room="${key}" aria-pressed="${state.room === key}">${item.name}<small>${countDevices(item)} devices</small></button>`).join('')}</div><div class="settings-list"><button type="button" class="settings-row" data-view="budget"><span>Energy budget<small>${state.budget} € per month</small></span>${icon('chevron-right')}</button><button type="button" class="settings-row" data-view="add"><span>Add a device<small>Connect your home</small></span>${icon('chevron-right')}</button><button type="button" class="settings-row" data-view="scenes"><span>Scenes<small>Welcome home, Movie night, Away</small></span>${icon('chevron-right')}</button></div></section>`;
}
function renderAdd() {
  const content = {
    idle: `${icon('access-point')}<h2>Find your device</h2><p>Keep your device nearby and ready to pair.</p><button type="button" class="primary-button" data-action="scan">Search devices</button>`,
    loading: `<i class="ti ti-loader-2 spinner" aria-hidden="true"></i><h2>Searching nearby</h2><p>Looking for devices on your home network.</p><button type="button" class="primary-button" disabled>Searching…</button>`,
    found: `${icon('lamp-ceiling')}<h2>Smart Spotlights</h2><p>Ready to connect · Wi-Fi</p><button type="button" class="primary-button" data-action="pair" ${rooms[state.addRoom].light !== null ? 'disabled' : ''}>${rooms[state.addRoom].light !== null ? 'Already connected in this room' : 'Connect device'}</button><button type="button" class="soft-button" data-action="scan">Search again</button>`,
    error: `${icon('wifi-off')}<h2>Couldn’t find a device</h2><p>Check that your device is on and connected to Wi-Fi.</p><button type="button" class="primary-button" data-action="scan">Try again</button>`,
    pairing: `<i class="ti ti-loader-2 spinner" aria-hidden="true"></i><h2>Connecting device</h2><p>Adding Smart Spotlights to your home.</p><button type="button" class="primary-button" disabled>Connecting…</button>`,
    connected: `${icon('circle-check')}<h2>You’re connected</h2><p>Smart Spotlights is ready in ${rooms[state.addRoom].name}.</p><button type="button" class="primary-button" data-action="open-paired">Open room</button><button type="button" class="soft-button" data-action="scan">Search again</button>`
  };
  return `<section class="view">${heading('Add device', 'Make yourself at home', 'settings')}<label class="field"><span>Room</span></label>${renderDropdown('room', rooms[state.addRoom].name, Object.values(rooms).map(item => item.name), ['loading', 'pairing'].includes(state.scan))}<section class="connection-card" aria-live="polite">${content[state.scan]}</section></section>`;
}
function render() {
  const renderers = { home: renderHome, climate: renderClimate, light: renderLight, tv: renderTv, energy: renderEnergy, budget: renderBudget, scenes: renderScenes, settings: renderSettings, add: renderAdd };
  screen.innerHTML = renderers[state.view]();
  const nav = ['energy', 'budget'].includes(state.view) ? 'energy' : state.view === 'scenes' ? 'scenes' : 'home';
  document.querySelectorAll('[data-nav]').forEach(button => {
    if (button.dataset.nav === nav) button.setAttribute('aria-current', 'page');
    else button.removeAttribute('aria-current');
  });
}
function navigate(view) {
  state.view = view;
  state.dropdown = false;
  state.dragging = false;
  render();
  screen.querySelector('h1')?.setAttribute('tabindex', '-1');
  screen.querySelector('h1')?.focus({ preventScroll: true });
}
function clearScene() { state.activeScene = null; }
function setTemperature(value) {
  if (!room().air) return;
  room().target = Math.max(16, Math.min(28, Math.round(value)));
  room().automatic = false;
  clearScene();
  const dial = screen.querySelector('.dial');
  if (!dial) return;
  const target = room().target;
  dial.setAttribute('aria-valuenow', target);
  dial.setAttribute('aria-valuetext', `${target} degrees Celsius`);
  screen.querySelector('#target-temperature').textContent = target;
  screen.querySelector('.dial-pointer').style.setProperty('--angle', `${(target - 16) / 12 * 180 - 90}deg`);
  screen.querySelector('.dial-ticks').innerHTML = dialTicks(target);
  screen.querySelector('.comfort-label').textContent = target <= 19 ? 'Cool' : target >= 25 ? 'Warm' : 'Medium';
  screen.querySelector('[data-step="-1"]').disabled = target <= 16;
  screen.querySelector('[data-step="1"]').disabled = target >= 28;
  const automatic = screen.querySelector('[data-action="automatic"]');
  automatic.classList.remove('is-selected');
  automatic.setAttribute('aria-pressed', 'false');
}
function temperatureFromPointer(event, dial) {
  const rect = dial.getBoundingClientRect();
  const x = event.clientX - rect.left - rect.width / 2;
  const y = event.clientY - rect.top - rect.width * 163 / 320;
  let angle = Math.atan2(y, x) * 180 / Math.PI;
  if (angle > 0) angle = x < 0 ? -180 : 0;
  setTemperature(16 + (angle + 180) / 180 * 12);
}
function scanDevices() {
  if (['loading', 'pairing'].includes(state.scan)) return;
  state.scan = 'loading';
  const succeeds = ++state.scanCount % 2 === 1;
  render();
  state.scanTimer = setTimeout(() => {
    state.scan = succeeds ? 'found' : 'error';
    if (state.view === 'add') render();
  }, 1000);
}
function pairDevice() {
  if (state.scan !== 'found' || rooms[state.addRoom].light !== null) return;
  state.scan = 'pairing';
  const succeeds = ++state.pairCount % 2 === 1;
  render();
  state.scanTimer = setTimeout(() => {
    if (succeeds) {
      rooms[state.addRoom].light = true;
      state.scan = 'connected';
    } else state.scan = 'error';
    if (state.view === 'add') render();
  }, 900);
}
function chartReadout(target) {
  const readout = screen.querySelector('#chart-readout');
  if (readout) {
    readout.textContent = `${target.dataset.chartLabel} · ${target.dataset.chartValue}`;
    readout.hidden = false;
  }
}
function handleClick(event) {
  const button = event.target.closest('button');
  if (!button || button.disabled) return;
  const data = button.dataset;
  if (data.view) return navigate(data.view);
  if (data.nav) return navigate(data.nav);
  if (data.room) { state.room = data.room; return navigate('home'); }
  if (data.toggle) {
    room()[data.toggle] = !room()[data.toggle];
    clearScene();
    render();
    screen.querySelector(`[data-toggle="${data.toggle}"]`)?.focus({ preventScroll: true });
    return;
  }
  if (data.mode) {
    room().mode = data.mode;
    clearScene();
    render();
    return;
  }
  if (data.climateTab) { state.climateTab = data.climateTab; state.chartTable = false; render(); return; }
  if (data.step) { setTemperature(room().target + Number(data.step)); return; }
  if (data.period) { state.period = data.period; render(); return; }
  if (data.tone) { room().tone = data.tone; clearScene(); render(); return; }
  if (data.scene) {
    const scene = scenes.find(item => item.id === data.scene);
    state.activeScene = scene.id;
    const item = rooms.living;
    Object.assign(item, { light: scene.light, air: scene.air, auxiliary: scene.tv, brightness: scene.brightness, target: scene.target, automatic: false });
    if (scene.id === 'away') Object.values(rooms).forEach(value => ['light', 'air', 'auxiliary'].forEach(key => { if (value[key] !== null) value[key] = false; }));
    render();
    return;
  }
  if (data.dropdown) {
    state.dropdown = state.dropdown === data.dropdown ? false : data.dropdown;
    const expanded = Boolean(state.dropdown);
    button.setAttribute('aria-expanded', expanded);
    screen.querySelector(`#${data.dropdown}-menu`).hidden = !expanded;
    if (expanded) screen.querySelector(`#${data.dropdown}-menu [aria-selected="true"]`)?.focus();
    return;
  }
  if (data.optionKind) {
    if (data.optionKind === 'source') room().source = data.option;
    else state.addRoom = Object.keys(rooms).find(key => rooms[key].name === data.option);
    state.dropdown = false;
    render();
    screen.querySelector(`[data-dropdown="${data.optionKind}"]`)?.focus();
    return;
  }
  if (data.chartLabel) { chartReadout(button); return; }
  if (data.action === 'automatic') {
    room().automatic = !room().automatic;
    if (room().automatic) room().target = 22;
    clearScene();
    render();
    return;
  }
  if (data.action === 'chart-table') { state.chartTable = !state.chartTable; render(); return; }
  if (data.action === 'scan') return scanDevices();
  if (data.action === 'pair') return pairDevice();
  if (data.action === 'open-paired') { state.room = state.addRoom; return navigate('home'); }
}
function handleInput(event) {
  const input = event.target;
  if (input.id === 'brightness' || input.id === 'volume') {
    room()[input.id] = Number(input.value);
    input.style.setProperty('--range', `${input.value}%`);
    screen.querySelector(`#${input.id}-value`).textContent = `${input.value}%`;
    if (input.id === 'brightness') screen.querySelector('.lamp-light').style.setProperty('--brightness', input.value / 100);
    clearScene();
  }
}
function handleSubmit(event) {
  if (event.target.id !== 'budget-form') return;
  event.preventDefault();
  const input = event.target.elements.budget;
  const value = Number(input.value);
  const error = screen.querySelector('#budget-error');
  if (!/^\d+(?:\.\d{1,2})?$/.test(input.value.trim()) || value < 90 || value > 9999) {
    input.setAttribute('aria-invalid', 'true');
    input.setAttribute('aria-describedby', 'budget-error');
    error.textContent = 'Choose a limit between 90 € and 9,999 €.';
    input.focus();
    return;
  }
  state.budget = value;
  render();
  screen.querySelector('#budget-message').textContent = 'Your monthly budget is updated.';
}
function handleKeydown(event) {
  if (event.key === 'Escape' && state.dropdown) {
    const kind = state.dropdown;
    state.dropdown = false;
    screen.querySelector(`#${kind}-menu`).hidden = true;
    const trigger = screen.querySelector(`[data-dropdown="${kind}"]`);
    trigger.setAttribute('aria-expanded', 'false');
    trigger.focus();
    return;
  }
  const dial = event.target.closest('.dial');
  if (dial) {
    const directions = { ArrowUp: 1, ArrowRight: 1, ArrowDown: -1, ArrowLeft: -1 };
    if (event.key in directions) { event.preventDefault(); setTemperature(room().target + directions[event.key]); }
    if (event.key === 'Home' || event.key === 'End') { event.preventDefault(); setTemperature(event.key === 'Home' ? 16 : 28); }
  }
  const option = event.target.closest('.dropdown-menu [role="option"]');
  if (option && ['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
    event.preventDefault();
    const items = [...option.parentElement.querySelectorAll('button:not(:disabled)')];
    const position = items.indexOf(option);
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1 : (position + (event.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
    items[next].focus();
  }
}
function start() {
  if (state.started) return;
  state.started = true;
  screen.addEventListener('click', handleClick);
  document.querySelector('.bottom-nav').addEventListener('click', handleClick);
  screen.addEventListener('input', handleInput);
  screen.addEventListener('submit', handleSubmit);
  screen.addEventListener('keydown', handleKeydown);
  screen.addEventListener('focusin', event => {
    const bar = event.target.closest('[data-chart-label]');
    if (bar) chartReadout(bar);
  });
  screen.addEventListener('pointerover', event => {
    const bar = event.target.closest('[data-chart-label]');
    if (bar) chartReadout(bar);
  });
  screen.addEventListener('pointerdown', event => {
    const dial = event.target.closest('.dial');
    if (!dial || !room().air || event.button !== 0) return;
    state.dragging = true;
    dial.setPointerCapture(event.pointerId);
    temperatureFromPointer(event, dial);
  });
  screen.addEventListener('pointermove', event => {
    const dial = event.target.closest('.dial');
    if (state.dragging && dial) temperatureFromPointer(event, dial);
  });
  for (const name of ['pointerup', 'pointercancel', 'lostpointercapture']) screen.addEventListener(name, () => { state.dragging = false; });
  document.addEventListener('click', event => {
    if (!state.dropdown || event.target.closest('.dropdown')) return;
    const kind = state.dropdown;
    state.dropdown = false;
    screen.querySelector(`#${kind}-menu`).hidden = true;
    screen.querySelector(`[data-dropdown="${kind}"]`).setAttribute('aria-expanded', 'false');
  });
  window.addEventListener('pagehide', () => clearTimeout(state.scanTimer));
  render();
}
start();
