const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const app = $('.app-window');
const TODAY = '2026-05-18';
const statuses = {
  good: { label: '健康', icon: 'circle-check' },
  warning: { label: '偏弱', icon: 'alert-triangle' },
  danger: { label: '待巡检', icon: 'alert-circle' }
};
const hives = [
  { id: 'A-01', location: '北坡，刺槐林边', colony: 4.1, reserve: 16.4, harvest: 16.2, temperature: 34.5, frames: 8, status: 'good', queen: '产卵正常', age: 1, x: 25, y: 32 },
  { id: 'A-02', location: '北坡，刺槐林边', colony: 4.5, reserve: 20.1, harvest: 18.4, temperature: 34.9, frames: 10, status: 'good', queen: '产卵正常', age: 1, x: 37, y: 26 },
  { id: 'A-03', location: '北坡，刺槐林边', colony: 4.2, reserve: 18.6, harvest: 21.7, temperature: 34.8, frames: 9, status: 'good', queen: '产卵正常', age: 1, x: 48, y: 38 },
  { id: 'A-04', location: '中央草甸，步道旁', colony: 3.9, reserve: 13.9, harvest: 15.1, temperature: 34.4, frames: 8, status: 'good', queen: '产卵正常', age: 2, x: 30, y: 57 },
  { id: 'A-05', location: '中央草甸，步道旁', colony: 4.6, reserve: 21.3, harvest: 19.6, temperature: 35.1, frames: 10, status: 'good', queen: '产卵正常', age: 1, x: 42, y: 65 },
  { id: 'A-06', location: '中央草甸，南侧', colony: 3.8, reserve: 14.2, harvest: 12.8, temperature: 34.2, frames: 8, status: 'good', queen: '产卵正常', age: 2, x: 54, y: 56 },
  { id: 'A-07', location: '南坡，板栗林边', colony: 2.8, reserve: 8.7, harvest: 8.3, temperature: 33.4, frames: 6, status: 'warning', queen: '产卵偏少', age: 2, x: 19, y: 77 },
  { id: 'A-08', location: '东侧草甸，近溪流', colony: 4.2, reserve: 17.8, harvest: 16.9, temperature: 34.7, frames: 9, status: 'good', queen: '产卵正常', age: 1, x: 60, y: 28 },
  { id: 'B-01', location: '溪东，乌桕林边', colony: 4.7, reserve: 20.7, harvest: 18.2, temperature: 35.0, frames: 10, status: 'good', queen: '产卵正常', age: 1, x: 77, y: 29 },
  { id: 'B-02', location: '溪东，乌桕林边', colony: 4.5, reserve: 19.3, harvest: 17.5, temperature: 34.6, frames: 10, status: 'good', queen: '产卵正常', age: 1, x: 85, y: 50 },
  { id: 'B-03', location: '溪东，林地低处', colony: 3.2, reserve: 9.8, harvest: 10.1, temperature: 33.8, frames: 7, status: 'warning', queen: '产卵偏少', age: 2, x: 77, y: 72 },
  { id: 'B-04', location: '南侧草甸，溪边', colony: 4.1, reserve: 12.5, harvest: 11.6, temperature: 36.2, frames: 8, status: 'danger', queen: '待确认', age: 2, x: 61, y: 81 }
].map((hive, index) => ({
  ...hive,
  inspected: `2026-05-${index === 11 ? '14' : index === 6 || index === 10 ? '16' : '17'}`,
  note: hive.status === 'good' ? '采集活跃，建议本周检查继箱空间。' : hive.status === 'warning' ? '蜂群偏弱，建议检查子脾与饲料储备。' : '巢温偏高且蜂王状态待确认，请优先巡检。'
}));

const temperatureSamples = [18, 19, 21, 20, 17, 18, 22, 23, 25, 24, 21, 19, 22, 24, 25, 23, 20, 19, 22, 24, 25, 27, 26, 24, 21, 23, 25, 26, 25, 24];
const rainSamples = [4, 1, 0, 2, 11, 7, 0, 0, 0, 1, 4, 9, 2, 0, 0, 2, 5, 8, 1, 0, 0, 0, 0, 1, 6, 2, 0, 0, 0, 0];
const days = temperatureSamples.map((temperature, index) => {
  const date = new Date(Date.UTC(2026, 3, 19 + index));
  return { date: date.toISOString().slice(0, 10), temperature, rain: rainSamples[index] };
});
hives.forEach((hive, hiveIndex) => {
  const weights = days.map((day, i) => Math.max(.15, (day.temperature - 13) / 12) * (1 - Math.min(day.rain, 12) * .055) * (1 + Math.sin((i + hiveIndex) * 1.4) * .16));
  const sum = weights.reduce((total, weight) => total + weight, 0);
  hive.daily = weights.map(weight => Number((weight / sum * hive.harvest * .64).toFixed(2)));
});
days.forEach((day, index) => { day.harvest = Number(hives.reduce((sum, hive) => sum + hive.daily[index], 0).toFixed(2)); });

const plants = [
  { name: '紫云英', start: '2026-03-18', end: '2026-05-08', honey: '紫云英蜜', description: '清甜柔和，春季田间蜜源。连雨可能缩短蜜流。' },
  { name: '刺槐', start: '2026-04-28', end: '2026-05-27', honey: '刺槐蜜', description: '花香清淡，蜜色浅金。预计蜜流持续至 5 月下旬。' },
  { name: '乌桕', start: '2026-05-24', end: '2026-06-28', honey: '乌桕蜜', description: '蜜色浅琥珀，夏季蜜源。雨期需留意通风。' },
  { name: '板栗', start: '2026-05-28', end: '2026-06-23', honey: '板栗蜜', description: '蜜色偏深，香气浓郁。开花前检查蜂群群势。' }
];
let selectedId = 'A-03';
let comparisonId = 'average';
let healthFilter = 'all';
let range = 14;
let bloomMonth = 4;
let zoom = 1;
let toastTimer;
let dialogOpener;
const records = [
  { hiveId: 'A-03', date: '2026-05-17', status: 'good', queen: '产卵正常', note: '子脾分布完整，巢门采集活跃。继箱约七成满，三天后复查。', author: '林禾' },
  { hiveId: 'A-07', date: '2026-05-16', status: 'warning', queen: '产卵偏少', note: '群势偏弱，已检查饲料储备。下次重点观察蜂王产卵情况。', author: '林禾' },
  { hiveId: 'B-04', date: '2026-05-14', status: 'danger', queen: '待确认', note: '午后巢温偏高，蜂王未确认。已列入下一次优先巡检。', author: '林禾' }
];

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}
function icon(name) {
  const node = element('i', `ti ti-${name}`);
  node.setAttribute('aria-hidden', 'true');
  return node;
}
function statusBadge(status) {
  const badge = element('span', `status-badge ${status}`);
  badge.append(icon(statuses[status].icon), document.createTextNode(statuses[status].label));
  return badge;
}
function currentHive() { return hives.find(hive => hive.id === selectedId); }
function shortDate(date) { return date.slice(5).replace('-', '.'); }
function currentDays() { return days.slice(-range); }
function matchesHealth(hive) { return healthFilter === 'all' || (healthFilter === 'attention' ? hive.status !== 'good' : hive.status === healthFilter); }
function comparisonValues() {
  return comparisonId === 'average' ? days.map(day => day.harvest / hives.length) : hives.find(hive => hive.id === comparisonId).daily;
}
function comparisonLabel() { return comparisonId === 'average' ? '全场箱均' : comparisonId; }

function renderMetrics() {
  const healthy = hives.filter(hive => hive.status === 'good').length;
  $('#metric-hives').textContent = hives.length;
  $('#metric-colony').textContent = hives.reduce((sum, hive) => sum + hive.colony, 0).toFixed(1);
  $('#metric-honey').textContent = hives.reduce((sum, hive) => sum + hive.harvest, 0).toFixed(1);
  $('#metric-health').textContent = `${healthy} 箱状态良好`;
  $('#alerts-button').setAttribute('aria-label', `查看 ${hives.length - healthy} 项蜂群提醒`);
  $('.notification-button > span').hidden = healthy === hives.length;
  $('#attention-metric .metric-value strong').textContent = String(hives.length - healthy).padStart(2, '0');
  $('#attention-metric .metric-foot').replaceChildren(element('span', 'status-dot warning'), document.createTextNode(`${hives.filter(hive => hive.status === 'warning').length} 箱偏弱，${hives.filter(hive => hive.status === 'danger').length} 箱需巡检`));
  $$('.map-legend button').forEach(button => {
    $('b', button).textContent = button.dataset.health === 'all' ? hives.length : hives.filter(hive => hive.status === button.dataset.health).length;
  });
}

function renderMap() {
  const markers = $('#map-markers');
  const list = $('#map-list');
  markers.replaceChildren();
  list.replaceChildren();
  hives.forEach(hive => {
    const visible = matchesHealth(hive);
    const marker = element('button', `map-marker ${hive.status}${hive.id === selectedId ? ' selected' : ''}${visible ? '' : ' dimmed'}`);
    marker.style.left = `${hive.x}%`;
    marker.style.top = `${hive.y}%`;
    marker.setAttribute('aria-label', `${hive.id}，${statuses[hive.status].label}，查看详情`);
    marker.setAttribute('aria-pressed', String(hive.id === selectedId));
    marker.title = `${hive.id} ${statuses[hive.status].label} | 储蜜 ${hive.reserve} kg`;
    marker.tabIndex = visible ? 0 : -1;
    const markerBox = element('span', 'marker-box');
    markerBox.append(icon(hive.status === 'danger' ? 'alert-circle' : hive.status === 'warning' ? 'alert-triangle' : 'box'));
    marker.append(markerBox, element('b', '', hive.id));
    marker.addEventListener('click', () => selectHive(hive.id, true));
    markers.append(marker);
    if (!visible) return;
    const row = element('button', `hive-list-row${hive.id === selectedId ? ' selected' : ''}`);
    row.append(element('span', '', hive.id), element('span', '', hive.location), element('span', 'mono', `${hive.reserve} kg`), statusBadge(hive.status));
    row.addEventListener('click', () => selectHive(hive.id, true));
    list.append(row);
  });
  if (!hives.some(matchesHealth)) list.append(element('p', 'empty-state', '没有符合此健康状态的蜂箱。'));
  $$('.map-legend button').forEach(button => {
    const active = button.dataset.health === healthFilter;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
}

function renderDetail() {
  const hive = currentHive();
  $('#hive-name').textContent = hive.id;
  $('#hive-location').textContent = hive.location;
  const badge = statusBadge(hive.status);
  badge.id = 'hive-status';
  $('#hive-status').replaceWith(badge);
  $('#hive-population').textContent = hive.colony.toFixed(1);
  $('#hive-frames').textContent = `${hive.frames} 框足蜂 / 双继箱`;
  $('#hive-reserve').textContent = hive.reserve.toFixed(1);
  $('#hive-temperature').textContent = hive.temperature.toFixed(1);
  $('#hive-queen').replaceChildren(document.createTextNode(hive.queen), element('small', '', `${hive.age} 年龄`));
  $('#hive-note').textContent = hive.note;
  $('#hive-inspected').textContent = `最近巡检 ${shortDate(hive.inspected)}`;
}

function selectHive(id, focusDetail = false) {
  selectedId = id;
  if (comparisonId === id) comparisonId = 'average';
  renderMap();
  renderDetail();
  renderCharts();
  const content = $('#hive-content');
  content.classList.remove('changing');
  requestAnimationFrame(() => content.classList.add('changing'));
  if (focusDetail && isCompact()) setPanel('detail');
}
function setHealthFilter(filter) {
  healthFilter = filter;
  const firstMatch = hives.find(matchesHealth);
  if (firstMatch && !matchesHealth(currentHive())) selectHive(firstMatch.id);
  else renderMap();
}
function isCompact() { return matchMedia('(max-width: 980px), (max-height: 899px)').matches; }
function setPanel(panel) {
  app.dataset.panel = panel;
  if (app.dataset.view === 'records') setView('overview');
  $$('.focus-nav button').forEach(button => button.classList.toggle('active', button.dataset.panel === panel));
  requestAnimationFrame(() => { renderCharts(); renderBloom(); });
}
function setView(view) {
  app.dataset.view = view;
  const text = {
    overview: ['蜂场总览', '花开有时，每一箱的变化都在这里。'],
    hives: ['蜂箱档案', '从群势到蜂王，了解每一箱的近况。'],
    bloom: ['花期日历', '跟着花期，安排蜂群与采收节奏。'],
    analytics: ['产量分析', '比较蜂箱的收成，也留意天气的影响。'],
    records: ['巡检记录', '把每次开箱的观察，留给下一次照料。']
  };
  $('#page-title').textContent = text[view][0];
  $('#page-description').textContent = text[view][1];
  $$('.nav-item[data-view]').forEach(button => {
    const active = button.dataset.view === view;
    button.classList.toggle('active', active);
    if (active) button.setAttribute('aria-current', 'page');
    else button.removeAttribute('aria-current');
  });
  const panel = { overview: 'map', hives: 'map', bloom: 'bloom', analytics: 'yield' }[view];
  if (panel) setPanel(panel);
  if (view === 'records') renderRecords();
  requestAnimationFrame(renderCharts);
}

function showTooltip(title, rows, target, pointer) {
  const tooltip = $('#chart-tooltip');
  tooltip.replaceChildren(element('strong', '', title));
  rows.forEach(([label, value]) => {
    const row = element('div', 'tooltip-row');
    row.append(element('span', '', label), element('b', '', value));
    tooltip.append(row);
  });
  tooltip.hidden = false;
  const targetRect = target.getBoundingClientRect();
  const x = pointer ? pointer.clientX : targetRect.left + targetRect.width / 2;
  const y = pointer ? pointer.clientY : targetRect.top;
  const bounds = tooltip.getBoundingClientRect();
  tooltip.style.left = `${Math.max(8, Math.min(innerWidth - bounds.width - 8, x + 12))}px`;
  tooltip.style.top = `${Math.max(8, Math.min(innerHeight - bounds.height - 8, y - bounds.height - 10))}px`;
}
function hideTooltip() { $('#chart-tooltip').hidden = true; }
function attachTooltip(target, title, rows, onShow, onHide) {
  const show = event => {
    showTooltip(title, rows, target, event.type.startsWith('pointer') ? event : null);
    if (onShow) onShow();
  };
  const hide = () => { hideTooltip(); if (onHide) onHide(); };
  target.addEventListener('pointermove', show);
  target.addEventListener('pointerleave', hide);
  target.addEventListener('focus', show);
  target.addEventListener('blur', hide);
}
function svgNode(tag, attributes = {}) {
  const node = document.createElementNS('http://www.w3.org/2000/svg', tag);
  Object.entries(attributes).forEach(([key, value]) => node.setAttribute(key, value));
  return node;
}
function svgText(svg, text, x, y, attributes = {}) {
  const node = svgNode('text', { x, y, ...attributes });
  node.textContent = text;
  svg.append(node);
  return node;
}
function chartFrame(container, label) {
  const rect = container.getBoundingClientRect();
  if (rect.width < 10 || rect.height < 10) return null;
  container.replaceChildren();
  const width = rect.width;
  const height = rect.height;
  const svg = svgNode('svg', { viewBox: `0 0 ${width} ${height}`, class: 'chart-svg', role: 'group', 'aria-label': label });
  const title = svgNode('title');
  title.textContent = label;
  svg.append(title);
  container.append(svg);
  return { svg, width, height };
}
function roundAxis(max) {
  const step = max > 15 ? 5 : max > 6 ? 2 : max > 2 ? 1 : .5;
  return Math.ceil(max / step) * step;
}

function renderYieldChart() {
  const frame = chartFrame($('#yield-chart'), `${currentHive().id} 与 ${comparisonLabel()} 每日蜂蜜采收对比，单位千克。可用键盘逐日查看，也可打开数据表。`);
  if (!frame) return;
  const { svg, width, height } = frame;
  const compact = width < 320;
  const left = 28;
  const right = width - (compact ? 37 : 44);
  const top = 9;
  const bottom = Math.max(top + 20, height - 24);
  const selected = currentHive().daily.slice(-range);
  const compared = comparisonValues().slice(-range);
  const filteredDays = currentDays();
  const max = roundAxis(Math.max(...selected, ...compared) * 1.16);
  const x = index => left + index / (range - 1) * (right - left);
  const y = value => bottom - value / max * (bottom - top);
  for (let i = 0; i <= 2; i++) {
    const value = max * i / 2;
    svg.append(svgNode('line', { x1: left, x2: right, y1: y(value), y2: y(value), class: 'grid-line' }));
    svgText(svg, value.toFixed(max < 3 ? 1 : 0), left - 7, y(value) + 3, { 'text-anchor': 'end' });
  }
  const tickCount = compact ? 3 : 4;
  for (let i = 0; i < tickCount; i++) {
    const index = Math.round(i / (tickCount - 1) * (range - 1));
    svgText(svg, shortDate(filteredDays[index].date), x(index), height - 5, { 'text-anchor': 'middle' });
  }
  const path = values => values.map((value, index) => `${index ? 'L' : 'M'}${x(index).toFixed(2)},${y(value).toFixed(2)}`).join(' ');
  svg.append(svgNode('path', { d: `${path(selected)} L${right},${bottom} L${left},${bottom} Z`, fill: 'var(--plot)', opacity: '.07' }));
  svg.append(svgNode('path', { d: path(compared), class: 'data-line', stroke: 'var(--plot-context)', 'stroke-dasharray': '4 4' }));
  svg.append(svgNode('path', { d: path(selected), class: 'data-line', stroke: 'var(--plot)' }));
  const endpointA = y(selected.at(-1));
  const endpointB = y(compared.at(-1));
  const labelA = Math.max(top + 4, Math.min(bottom - 13, endpointA - 4));
  const labelB = Math.min(bottom, Math.max(labelA + 15, endpointB + 4));
  [[selected.at(-1), endpointA, labelA, 'var(--plot)'], [compared.at(-1), endpointB, labelB, 'var(--plot-context)']].forEach(([value, pointY, labelY, color]) => {
    svg.append(svgNode('circle', { cx: right, cy: pointY, r: 4, fill: color, stroke: 'var(--surface)', 'stroke-width': 2 }));
    svg.append(svgNode('path', { d: `M${right + 3},${pointY} L${right + 7},${labelY - 3}`, stroke: color, fill: 'none', 'stroke-width': 1 }));
    svgText(svg, value.toFixed(2), right + 9, labelY, { class: 'direct-label' });
  });
  const crosshair = svgNode('line', { x1: left, x2: left, y1: top, y2: bottom, class: 'crosshair', opacity: 0 });
  svg.append(crosshair);
  const sliceWidth = (right - left) / (range - 1);
  filteredDays.forEach((day, index) => {
    const hit = svgNode('rect', { x: x(index) - sliceWidth / 2, y: top, width: sliceWidth, height: bottom - top, class: 'hit-area', tabindex: 0, role: 'img', 'aria-label': `${shortDate(day.date)}，${selectedId} ${selected[index].toFixed(2)} 千克，${comparisonLabel()} ${compared[index].toFixed(2)} 千克` });
    attachTooltip(hit, `${shortDate(day.date)} 采收`, [[selectedId, `${selected[index].toFixed(2)} kg`], [comparisonLabel(), `${compared[index].toFixed(2)} kg`]], () => {
      crosshair.setAttribute('x1', x(index));
      crosshair.setAttribute('x2', x(index));
      crosshair.setAttribute('opacity', 1);
    }, () => crosshair.setAttribute('opacity', 0));
    svg.append(hit);
  });
  const legend = $('#yield-legend');
  legend.replaceChildren();
  [[selectedId, ''], [comparisonLabel(), 'context']].forEach(([label, type]) => {
    const item = element('span', 'legend-item');
    item.append(element('span', `legend-line ${type}`), document.createTextNode(label));
    legend.append(item);
  });
  $('#yield-summary').textContent = `期间采收 ${selected.reduce((sum, value) => sum + value, 0).toFixed(2)} kg`;
}

function renderWeatherChart() {
  const dimension = $('#weather-select').value;
  const temperature = dimension === 'temperature';
  const frame = chartFrame($('#weather-chart'), `天气与全场每日采收量散点图。横轴${temperature ? '气温，摄氏度' : '降雨量，毫米'}，纵轴每日采收量，千克。`);
  if (!frame) return;
  const { svg, width, height } = frame;
  const data = currentDays();
  const left = 26;
  const right = width - 12;
  const top = 9;
  const bottom = Math.max(top + 20, height - 31);
  const minX = temperature ? 15 : 0;
  const maxX = temperature ? 30 : 12;
  const maxY = roundAxis(Math.max(...data.map(day => day.harvest)) * 1.1);
  const x = value => left + (value - minX) / (maxX - minX) * (right - left);
  const y = value => bottom - value / maxY * (bottom - top);
  for (let i = 0; i <= 2; i++) {
    const value = maxY * i / 2;
    svg.append(svgNode('line', { x1: left, x2: right, y1: y(value), y2: y(value), class: 'grid-line' }));
    svgText(svg, value.toFixed(maxY < 10 && value % 1 ? 1 : 0), left - 7, y(value) + 3, { 'text-anchor': 'end' });
  }
  (temperature ? [15, 20, 25, 30] : [0, 4, 8, 12]).forEach(value => svgText(svg, value, x(value), bottom + 15, { 'text-anchor': 'middle' }));
  svgText(svg, temperature ? '日均气温 / °C' : '日降雨量 / mm', (left + right) / 2, height - 1, { 'text-anchor': 'middle', class: 'axis-title' });
  data.forEach(day => {
    const group = svgNode('g', { class: 'scatter-group', tabindex: 0, role: 'img', 'aria-label': `${shortDate(day.date)}，${day.temperature} 摄氏度，降雨 ${day.rain} 毫米，采收 ${day.harvest.toFixed(2)} 千克` });
    const cx = x(day[dimension]);
    const cy = y(day.harvest);
    group.append(svgNode('circle', { cx, cy, r: 4.5, fill: 'var(--plot)', opacity: '.72', class: 'scatter-point' }), svgNode('circle', { cx, cy, r: 12, fill: 'transparent' }));
    attachTooltip(group, shortDate(day.date), [['全场采收', `${day.harvest.toFixed(2)} kg`], ['日均气温', `${day.temperature} °C`], ['降雨量', `${day.rain} mm`]]);
    svg.append(group);
  });
  $('#weather-insight').textContent = temperature ? '气温与采收同向变化，非因果结论' : '雨天采收偏少，非因果结论';
}
function renderCharts() {
  hideTooltip();
  renderYieldChart();
  renderWeatherChart();
}

function renderBloom() {
  const timeline = $('#bloom-timeline');
  timeline.replaceChildren();
  const monthStart = new Date(Date.UTC(2026, bloomMonth, 1));
  const monthEnd = new Date(Date.UTC(2026, bloomMonth + 1, 0));
  const daysInMonth = monthEnd.getUTCDate();
  const scale = element('div', 'timeline-scale');
  [1, 8, 15, 22, daysInMonth].forEach(day => {
    const tick = element('span', '', String(day).padStart(2, '0'));
    tick.style.left = `${(day - 1) / (daysInMonth - 1) * 100}%`;
    scale.append(tick);
  });
  timeline.append(scale);
  plants.forEach(plant => {
    const row = element('div', 'flower-row');
    const name = element('span', 'flower-name', plant.name);
    const track = element('div', 'flower-track');
    const start = new Date(`${plant.start}T00:00:00Z`);
    const end = new Date(`${plant.end}T00:00:00Z`);
    if (end >= monthStart && start <= monthEnd) {
      const first = Math.max(0, (start - monthStart) / 86400000);
      const last = Math.min(daysInMonth, (end - monthStart) / 86400000 + 1);
      const current = plant.start <= TODAY && plant.end >= TODAY;
      const bar = element('button', `flower-bar${current ? ' current' : plant.end < TODAY ? ' past' : ''}`);
      bar.style.left = `${first / daysInMonth * 100}%`;
      bar.style.width = `${(last - first) / daysInMonth * 100}%`;
      bar.setAttribute('aria-label', `${plant.name}，花期 ${shortDate(plant.start)} 至 ${shortDate(plant.end)}，查看蜜种预测`);
      attachTooltip(bar, plant.name, [['参考花期', `${shortDate(plant.start)}–${shortDate(plant.end)}`], ['预计蜜种', plant.honey]]);
      bar.addEventListener('click', () => {
        $('#honey-prediction-label').textContent = `${plant.name}花期的预计蜜种`;
        $('#honey-prediction').textContent = plant.honey;
        $('#bloom-prediction-note').textContent = plant.description;
        hideTooltip();
      });
      track.append(bar);
    }
    row.append(name, track);
    timeline.append(row);
  });
  if (bloomMonth === 4) {
    const today = element('span', 'today-rule');
    const labelWidth = app.dataset.view === 'bloom' && !isCompact() ? 70 : 51;
    today.style.left = `calc(${labelWidth}px + (100% - ${labelWidth}px) * ${17 / daysInMonth})`;
    today.title = '演示日期：5 月 18 日';
    timeline.append(today);
  }
  $('#bloom-month').textContent = `${bloomMonth + 1} 月`;
  $('#month-prev').disabled = bloomMonth === 0;
  $('#month-next').disabled = bloomMonth === 11;
  const featured = bloomMonth === 4 ? plants[1] : plants.find(plant => new Date(`${plant.start}T00:00:00Z`) <= monthEnd && new Date(`${plant.end}T00:00:00Z`) >= monthStart);
  $('#honey-prediction-label').textContent = bloomMonth === 4 ? '当前预计蜜种' : '当月参考蜜种';
  $('#honey-prediction').textContent = featured ? featured.honey : '暂无已录入蜜源';
  $('#bloom-prediction-note').textContent = featured ? featured.description : '该月份没有已录入植物的花期，不代表当地没有蜜源。';
  const expanded = $('#bloom-expanded');
  expanded.replaceChildren();
  plants.forEach(plant => {
    const item = element('div', 'plant-description');
    item.append(element('strong', '', `${plant.name}  ${shortDate(plant.start)} 至 ${shortDate(plant.end)}`), element('p', '', plant.description));
    expanded.append(item);
  });
}

function openDialog(title, subtitle, buildBody, buildFooter) {
  hideTooltip();
  dialogOpener = document.activeElement;
  $('#dialog-title').textContent = title;
  $('#dialog-subtitle').textContent = subtitle;
  $('#dialog-body').replaceChildren();
  $('#dialog-footer').replaceChildren();
  buildBody($('#dialog-body'));
  if (buildFooter) buildFooter($('#dialog-footer'));
  $('#app-dialog').showModal();
}
function closeDialog() { $('#app-dialog').close(); }
function toast(message) {
  clearTimeout(toastTimer);
  $('#toast span').textContent = message;
  $('#toast').hidden = false;
  toastTimer = setTimeout(() => { $('#toast').hidden = true; }, 3500);
}
function openSearch(initialFilter = 'all') {
  openDialog(initialFilter === 'attention' ? '需要关注的蜂箱' : '蜂箱档案', '输入蜂箱编号或位置，选择后查看详细状态。', body => {
    const input = element('input', 'search-input');
    input.type = 'search';
    input.placeholder = '搜索编号或位置，如 A-03、溪东';
    input.setAttribute('aria-label', '搜索蜂箱编号或位置');
    const results = element('div', 'search-results');
    const update = () => {
      const query = input.value.trim().toLowerCase();
      const matches = hives.filter(hive => (initialFilter !== 'attention' || hive.status !== 'good') && `${hive.id} ${hive.location}`.toLowerCase().includes(query));
      results.replaceChildren();
      if (!matches.length) results.append(element('p', 'empty-state', '没有找到蜂箱，试试编号或“北坡”“溪东”。'));
      matches.forEach(hive => {
        const button = element('button', 'search-result');
        const info = element('span');
        info.append(element('strong', '', hive.id), element('small', '', hive.location));
        button.append(info, statusBadge(hive.status));
        button.addEventListener('click', () => {
          closeDialog();
          setView('hives');
          healthFilter = 'all';
          selectHive(hive.id, true);
        });
        results.append(button);
      });
    };
    input.addEventListener('input', update);
    body.append(input, results);
    update();
    requestAnimationFrame(() => input.focus());
  });
}

function openRecordForm() {
  openDialog('记录巡检', '记录开箱观察，更新蜂箱的健康状态。', body => {
    const form = element('form', 'form-grid');
    form.id = 'inspection-form';
    const addField = (label, name, options, value, full = false) => {
      const field = element('label', `form-field${full ? ' full' : ''}`, label);
      let input;
      if (options) {
        input = element('select');
        options.forEach(([key, text]) => { const option = element('option', '', text); option.value = key; input.append(option); });
      } else {
        input = element(name === 'note' ? 'textarea' : 'input');
        if (name === 'date') { input.type = 'date'; input.max = TODAY; input.min = '2026-03-01'; }
        if (name === 'note') { input.maxLength = 500; input.placeholder = '例如：子脾完整，巢门采集活跃，需加继箱。'; }
      }
      input.name = name;
      input.required = true;
      input.value = value;
      field.append(input);
      form.append(field);
      return input;
    };
    const hiveSelect = addField('蜂箱', 'hive', hives.map(hive => [hive.id, `${hive.id}  ${hive.location}`]), selectedId);
    addField('巡检日期', 'date', null, TODAY);
    const statusSelect = addField('蜂群状态', 'status', Object.entries(statuses).map(([key, value]) => [key, value.label]), currentHive().status);
    const queenSelect = addField('蜂王状态', 'queen', ['产卵正常', '产卵偏少', '待确认'].map(value => [value, value]), currentHive().queen);
    const notes = addField('巡检观察', 'note', null, '', true);
    notes.addEventListener('input', () => notes.setCustomValidity(''));
    hiveSelect.addEventListener('change', () => {
      const hive = hives.find(item => item.id === hiveSelect.value);
      statusSelect.value = hive.status;
      queenSelect.value = hive.queen;
    });
    form.addEventListener('submit', event => {
      event.preventDefault();
      if (!notes.value.trim()) { notes.setCustomValidity('请填写实际观察内容。'); notes.reportValidity(); return; }
      const data = new FormData(form);
      const hive = hives.find(item => item.id === data.get('hive'));
      const record = { hiveId: hive.id, date: data.get('date'), status: data.get('status'), queen: data.get('queen'), note: notes.value.trim(), author: '林禾' };
      records.unshift(record);
      if (record.date >= hive.inspected) {
        hive.status = record.status;
        hive.queen = record.queen;
        hive.inspected = record.date;
        hive.note = record.note;
      }
      healthFilter = 'all';
      renderMetrics();
      selectHive(hive.id);
      renderRecords();
      closeDialog();
      toast(`${hive.id} 巡检已保留在本次演示中`);
    });
    body.append(form, element('p', 'form-note', '本地演示：记录仅保存在当前页面，刷新后重置。历史巡检不会覆盖更新的蜂箱状态。'));
  }, footer => {
    const cancel = element('button', 'secondary-button', '取消');
    cancel.addEventListener('click', closeDialog);
    const save = element('button', 'primary-button', '保存本次记录');
    save.type = 'submit';
    save.setAttribute('form', 'inspection-form');
    footer.append(cancel, save);
  });
}

function renderRecords() {
  const list = $('#records-list');
  list.replaceChildren();
  [...records].sort((a, b) => b.date.localeCompare(a.date)).forEach(record => {
    const entry = element('article', 'record-entry');
    const header = element('header');
    const name = element('strong', '', record.hiveId);
    const time = element('time', '', record.date);
    time.dateTime = record.date;
    header.append(name, statusBadge(record.status), time);
    entry.append(header, element('p', '', record.note), element('small', '', `蜂王：${record.queen}　记录人：${record.author}`));
    list.append(entry);
  });
}
function openCompare() {
  let nextId = comparisonId;
  openDialog('选择产量对比', `主蜂箱 ${selectedId} 保持不变，选择一个对比对象。`, body => {
    [['average', '全场箱均', '12 箱日采收量的平均值'], ...hives.filter(hive => hive.id !== selectedId).map(hive => [hive.id, hive.id, hive.location])].forEach(([value, title, caption]) => {
      const label = element('label', 'comparison-option');
      const input = element('input');
      input.type = 'radio'; input.name = 'comparison'; input.value = value; input.checked = value === comparisonId;
      input.addEventListener('change', () => { nextId = value; });
      const text = element('span', '', title);
      label.append(input, text, element('small', '', caption));
      body.append(label);
    });
  }, footer => {
    const apply = element('button', 'primary-button', '应用对比');
    apply.addEventListener('click', () => { comparisonId = nextId; renderCharts(); closeDialog(); });
    footer.append(apply);
  });
}
function dataRows() {
  const selected = currentHive().daily.slice(-range);
  const compared = comparisonValues().slice(-range);
  return currentDays().map((day, index) => [shortDate(day.date), selected[index].toFixed(2), compared[index].toFixed(2), day.harvest.toFixed(2), day.temperature, day.rain]);
}
function openDataTable() {
  const headers = ['日期', `${selectedId} kg`, `${comparisonLabel()} kg`, '全场 kg', '°C', 'mm'];
  openDialog('采收与天气数据', `近 ${range} 天的本地演示数据，温度为日均值，降雨为日累计。`, body => {
    const table = element('table', 'data-table');
    const head = element('thead');
    const row = element('tr');
    headers.forEach(label => { const cell = element('th', '', label); cell.scope = 'col'; row.append(cell); });
    head.append(row);
    const tbody = element('tbody');
    dataRows().forEach(values => {
      const tr = element('tr');
      values.forEach(value => tr.append(element('td', '', String(value))));
      tbody.append(tr);
    });
    table.append(head, tbody);
    body.append(table);
  }, footer => {
    const download = element('button', 'secondary-button');
    download.append(icon('download'), document.createTextNode('导出演示 CSV'));
    download.addEventListener('click', () => {
      const csv = '﻿' + [headers, ...dataRows()].map(row => row.join(',')).join('\r\n');
      const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
      const link = element('a');
      link.href = url; link.download = `蜂野-演示采收-${range}天.csv`;
      document.body.append(link); link.click(); link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    });
    footer.append(download);
  });
}
function openHelp() {
  openDialog('使用指南', '这是可交互的蜂场管理原型，不连接真实设备。', body => {
    const copy = element('div', 'dialog-copy');
    copy.append(element('h3', '', '从一只蜂箱开始'), element('p', '', '点击地图上的蜂箱，会联动右侧详情和产量主曲线。健康筛选只筛选地图；巡检记录会更新本次演示中的蜂箱状态。'));
    copy.append(element('h3', '', '读懂图表'), element('p', '', '产量实线表示选中蜂箱，虚线表示对比对象。悬停或聚焦可读到每天的数值，表格按钮可查看和导出全部数据。时间范围同时影响产量与天气图，不改变当前蜂群状态。'));
    copy.append(element('h3', '', '关于预测与数据'), element('p', '', '地图是地块示意图；花期仅为地区参考，蜜种为示意预测。天气与采收的相关性不代表因果关系。刷新页面会还原全部演示记录。'));
    body.append(copy);
  });
}

$$('.nav-item[data-view]').forEach(button => button.addEventListener('click', () => setView(button.dataset.view)));
$$('[data-go]').forEach(button => button.addEventListener('click', () => setView(button.dataset.go)));
$$('.focus-nav button').forEach(button => button.addEventListener('click', () => setPanel(button.dataset.panel)));
$('.brand').addEventListener('click', event => { event.preventDefault(); setView('overview'); });
$$('.map-legend button').forEach(button => button.addEventListener('click', () => setHealthFilter(button.dataset.health)));
$('#attention-metric').addEventListener('click', () => { setView('hives'); setHealthFilter('attention'); });
$('#search-button').addEventListener('click', () => openSearch());
$('#hive-directory').addEventListener('click', () => openSearch());
$('#alerts-button').addEventListener('click', () => openSearch('attention'));
$('#add-record').addEventListener('click', openRecordForm);
$('#hive-record').addEventListener('click', openRecordForm);
$('#compare-button').addEventListener('click', openCompare);
$('#data-table-button').addEventListener('click', openDataTable);
$('#help-button').addEventListener('click', openHelp);
$('#close-dialog').addEventListener('click', closeDialog);
$('#app-dialog').addEventListener('close', () => { hideTooltip(); if (dialogOpener?.isConnected) dialogOpener.focus(); });
$('#app-dialog').addEventListener('click', event => {
  const rect = $('#app-dialog').getBoundingClientRect();
  if (event.target === $('#app-dialog') && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) closeDialog();
});
document.addEventListener('keydown', event => { if (event.key === 'Escape') hideTooltip(); });
$('#apiary-switch').addEventListener('click', () => {
  openDialog('山野蜂场', '浙江省湖州市安吉县', body => {
    const copy = element('div', 'dialog-copy');
    copy.append(element('h3', '', '沿着山涧，照料 12 箱蜂'), element('p', '', '北坡 8 箱，溪东及南侧 4 箱。主要蜜源为刺槐、紫云英、乌桕和板栗。'), element('p', '', '当前提供一个蜂场的本地演示。地块与蜂箱位置均为示意，不用于实际导航。'));
    body.append(copy);
  });
});
$('#range-select').addEventListener('change', event => { range = Number(event.target.value); renderCharts(); });
$('#weather-select').addEventListener('change', renderWeatherChart);
$('#month-prev').addEventListener('click', () => { bloomMonth = Math.max(0, bloomMonth - 1); renderBloom(); });
$('#month-next').addEventListener('click', () => { bloomMonth = Math.min(11, bloomMonth + 1); renderBloom(); });
$('#vegetation-button').addEventListener('click', event => {
  const button = event.currentTarget;
  const hidden = $('#terrain').classList.toggle('no-vegetation');
  button.setAttribute('aria-pressed', String(!hidden));
});
function updateZoom() {
  $('#terrain').style.transform = `scale(${zoom})`;
  $('#zoom-in').disabled = zoom >= 1.6;
  $('#zoom-out').disabled = zoom <= 1;
}
$('#zoom-in').addEventListener('click', () => { zoom = Math.min(1.6, Number((zoom + .2).toFixed(1))); updateZoom(); });
$('#zoom-out').addEventListener('click', () => { zoom = Math.max(1, Number((zoom - .2).toFixed(1))); updateZoom(); });
$('#reset-map').addEventListener('click', () => { zoom = 1; updateZoom(); setHealthFilter('all'); });
function setMapMode(list) {
  $('#map-list').hidden = !list;
  $('#list-mode').classList.toggle('active', list);
  $('#map-mode').classList.toggle('active', !list);
  $('#list-mode').setAttribute('aria-pressed', String(list));
  $('#map-mode').setAttribute('aria-pressed', String(!list));
  $('#terrain').inert = list;
  $('.map-tools').hidden = list;
  $('.compass').hidden = list;
  $('.map-area-label').hidden = list;
}
$('#map-mode').addEventListener('click', () => setMapMode(false));
$('#list-mode').addEventListener('click', () => setMapMode(true));

let resizeFrame;
const observer = new ResizeObserver(() => {
  cancelAnimationFrame(resizeFrame);
  resizeFrame = requestAnimationFrame(renderCharts);
});
observer.observe($('#yield-chart'));
observer.observe($('#weather-chart'));
matchMedia('(max-width: 980px), (max-height: 899px)').addEventListener('change', renderBloom);
renderMetrics();
renderMap();
renderDetail();
renderBloom();
renderRecords();
updateZoom();
requestAnimationFrame(renderCharts);
