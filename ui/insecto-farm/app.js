'use strict';

const workspace = document.querySelector('#workspace');
const canvas = document.querySelector('.canvas');
const icon = (name) => `<i class="ti ti-${name}" aria-hidden="true"></i>`;
const escapeHTML = (value) => String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
const fruits = {
  tomato: { title: 'Tomato Cluster', image: 'https://pngimg.com/uploads/tomato/tomato_PNG12588.png', className: 'tomato', alt: 'Fresh red tomatoes with green leaves' },
  citrus: { title: 'Citrus Grove', image: 'https://pngimg.com/uploads/lemon/lemon_PNG3876.png', className: 'citrus', alt: 'Real yellow lemon, cut out on a transparent background' },
  vineyard: { title: 'Vineyard Block', image: 'https://pngimg.com/uploads/grape/grape_PNG2997.png', className: 'vineyard', alt: 'A bunch of black grapes, cut out on a transparent background' },
};
const zones = [
  { id: 'B12', name: 'Tomato Cluster B12', crop: 'tomato', sector: 'B', area: 4.2, moisture: 24, nitrogen: 52, par: 680, yield: 18.4, risk: 8 },
  { id: 'A12', name: 'Citrus Grove A12', crop: 'citrus', sector: 'A', area: 6.8, moisture: 57, nitrogen: 76, par: 1050, yield: 23.6, risk: 3 },
  { id: 'A01', name: 'Vineyard Block A', crop: 'vineyard', sector: 'A', area: 8.1, moisture: 42, nitrogen: 38, par: 1120, yield: 15.2, risk: 28 },
  ...Array.from({ length: 21 }, (_, index) => {
    const crop = ['tomato', 'citrus', 'vineyard'][index % 3];
    const sector = ['A', 'B', 'C'][Math.floor(index / 7)];
    const id = `${sector}${String(index + 20).padStart(2, '0')}`;
    return { id, name: `${fruits[crop].title} ${id}`, crop, sector, area: +(2.4 + index % 5 * .6).toFixed(1), moisture: 38 + index % 8 * 5, nitrogen: 54 + index % 6 * 6, par: 880 + index % 7 * 40, yield: +(3.1 + index % 7 * .7).toFixed(1), risk: 3 + index % 5 * 3 };
  }),
];
const tasks = [
  { id: 'task-1', zone: 'B12', title: 'Adjust irrigation flow', note: 'Sector B moisture below target', date: '2026-03-24', time: '06:00', progress: 74, done: false, type: 'Irrigation' },
  { id: 'task-2', zone: 'A12', title: 'Apply nitrogen treatment', note: 'Scheduled for Zone A12', date: '2026-03-23', time: '09:30', progress: 100, done: true, type: 'Nutrition' },
  { id: 'task-3', zone: 'A01', title: 'Inspect disease indicators', note: 'AI detected abnormal leaf patterns', date: '2026-03-23', time: '11:00', progress: 100, done: true, type: 'Inspection' },
  { id: 'task-4', zone: 'C34', title: 'Check soil conductivity', note: 'Verify salinity before the next cycle', date: '2026-03-24', time: '10:00', progress: 0, done: false, type: 'Inspection' },
  { id: 'task-5', zone: 'B12', title: 'Calibrate moisture sensor', note: 'Compare readings with a manual sample', date: '2026-03-25', time: '08:00', progress: 0, done: false, type: 'Inspection' },
  { id: 'task-6', zone: 'A01', title: 'Review canopy health', note: 'Inspect lower leaves in Sector 4', date: '2026-03-25', time: '14:00', progress: 0, done: false, type: 'Inspection' },
];
const notifications = [
  { id: 'note-1', title: 'Moisture below target', text: 'Tomato Cluster B12 is at 24%. Target range: 40–60%. Review the irrigation plan.', time: 'Mar 23 · 11:42', zone: 'B12', icon: 'droplet', read: false },
  { id: 'note-2', title: 'Vineyard needs a closer look', text: 'Leaf disease risk is 28% in Block A. Inspect Sector 4 before scheduling treatment.', time: 'Mar 23 · 10:18', zone: 'A01', icon: 'leaf', read: false },
  { id: 'note-3', title: 'Nitrogen treatment completed', text: 'The field team marked the A12 nutrition task as complete.', time: 'Mar 23 · 09:45', zone: 'A12', icon: 'check', read: true },
  { id: 'note-4', title: 'March field snapshot available', text: 'The latest production data covers 24 zones. Open the snapshot in Documents.', time: 'Mar 23 · 08:00', page: 'documents', icon: 'file-spreadsheet', read: true },
];
const recommendations = [
  { id: 'irrigation-b12', zone: 'B12', title: 'Restore moisture in Tomato Cluster B12', text: 'Schedule a 35-minute drip cycle. Check moisture before repeating.', icon: 'droplet', type: 'Irrigation' },
  { id: 'nutrition-a01', zone: 'A01', title: 'Review nitrogen in Vineyard Block A', text: 'Current nitrogen index is 38. Confirm with a soil sample before treatment.', icon: 'flask', type: 'Nutrition' },
  { id: 'inspection-a01', zone: 'A01', title: 'Inspect the lower canopy in Sector 4', text: 'Disease risk is 28%. Prioritize a field inspection; avoid preventive spraying.', icon: 'leaf', type: 'Inspection' },
];
const chartRanges = {
  week: { label: 'Last 7 days', labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], dates: ['Mar 16, 2026', 'Mar 17, 2026', 'Mar 18, 2026', 'Mar 19, 2026', 'Mar 20, 2026', 'Mar 21, 2026', 'Mar 22, 2026'], values: [18, 34, 69, 44, 69, 65, 16] },
  month: { label: 'Last 30 days', labels: ['Feb 22', 'Feb 27', 'Mar 4', 'Mar 9', 'Mar 14', 'Mar 19', 'Mar 23'], dates: ['Feb 22, 2026', 'Feb 27, 2026', 'Mar 4, 2026', 'Mar 9, 2026', 'Mar 14, 2026', 'Mar 19, 2026', 'Mar 23, 2026'], values: [42, 46, 38, 51, 58, 61, 65] },
  quarter: { label: 'This quarter', labels: ['Jan 1', 'Jan 15', 'Feb 1', 'Feb 15', 'Mar 1', 'Mar 15', 'Mar 23'], dates: ['Jan 1, 2026', 'Jan 15, 2026', 'Feb 1, 2026', 'Feb 15, 2026', 'Mar 1, 2026', 'Mar 15, 2026', 'Mar 23, 2026'], values: [41, 38, 35, 42, 51, 60, 65] },
};
const initialConversation = {
  question: 'Generate Q2 production forecast for Vineyard Block A',
  paragraphs: ['Moisture and nutrient levels recovered in March following irrigation adjustments. Projections indicate a 12% increase in yield efficiency by April.', 'Apply nutrient optimization recommendations to improve yield performance?'],
  label: 'Analyzing Sector 1...',
};
const state = {
  page: 'overview', featured: 0, assistantOpen: false, agronomyTab: 'care', settingsTab: 'profile', detailTab: 'conditions', fieldTab: 'zones', fieldMode: 'list', selectedZone: 'B12', fieldSearch: '', fieldSector: 'all', fieldCrop: 'all', fieldPage: 1,
  taskFilter: 'all', taskPage: 1, zonePickerPage: 0, chartRange: 'week', selectedBar: 5, chartTable: false, analyticsSector: 'all', documentSearch: '', documentPage: 1,
  selectedDocument: null, documentChunk: 0, notificationFilter: 'all', notificationPage: 1, draft: null, busy: false, conversations: [initialConversation], conversationIndex: 0,
  profile: { farm: 'Insecto Farm', manager: 'Eleanor Reed', email: 'eleanor@insecto.farm', timezone: 'UTC+1', units: 'metric' },
  profileDraft: null,
  settings: { motion: !matchMedia('(prefers-reduced-motion: reduce)').matches, texture: false, alerts: true },
  attachment: null, pendingImport: 'documents', nextZone: 50, started: false,
};
const validPages = ['overview', 'fields', 'agronomy', 'analytics', 'documents', 'notifications', 'settings'];
let toastTimer;

function csvCell(value) {
  let text = String(value);
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}
function snapshotCSV(rows = zones) {
  const keys = ['id', 'name', 'crop', 'sector', 'area', 'moisture', 'nitrogen', 'par', 'yield', 'risk'];
  return [keys.join(','), ...rows.map((zone) => keys.map((key) => csvCell(zone[key])).join(','))].join('\r\n');
}
const documents = [
  { id: 'doc-1', name: 'March field snapshot', category: 'Sensor data', date: 'Mar 23, 2026', filename: 'march-field-snapshot.csv', kind: 'csv', content: snapshotCSV() },
  { id: 'doc-2', name: 'Vineyard Block A · production forecast', category: 'Agronomy report', date: 'Mar 23, 2026', filename: 'vineyard-production-forecast.txt', kind: 'txt', content: 'INSECTO — VINEYARD BLOCK A\nProduction forecast · March 23, 2026\n\nArea: 8.1 hectares\nCurrent yield estimate: 15.2 tonnes\nQ2 scenario: 17.0 tonnes (+12%)\n\nCurrent readings\nMoisture: 42% · target 40–60%\nNitrogen index: 38 · target 60–85\nDisease risk: 28% · inspection required\n\nRecommendations\n1. Confirm nitrogen with a soil sample.\n2. Inspect the lower canopy in Sector 4.\n3. Recheck moisture after the next drip cycle.\n\nForecast assumes stable weather and scheduled care.\nField recommendations require on-site verification.' },
  { id: 'doc-3', name: 'Sector B · irrigation schedule', category: 'Field operations', date: 'Mar 24, 2026', filename: 'sector-b-irrigation.csv', kind: 'csv', content: 'zone,date,time,flow_l_min,duration_min,status\r\nB12,2026-03-24,06:00,45,35,Planned\r\nB27,2026-03-24,07:00,30,25,Planned\r\nB28,2026-03-24,08:00,30,25,Planned' },
  { id: 'doc-4', name: 'A12 · soil nutrient assessment', category: 'Soil report', date: 'Mar 21, 2026', filename: 'a12-soil-assessment.txt', kind: 'txt', content: 'INSECTO — CITRUS GROVE A12\nSoil nutrient assessment · March 21, 2026\n\nSample depth: 20 cm\nSoil pH: 6.4\nNitrogen index: 76\nMoisture: 57%\nConductivity: 1.2 mS/cm\n\nAssessment\nReadings are within the target range.\nMaintain the current irrigation schedule.\nRepeat soil sampling in 14 days.\n\nField lead: Eleanor Reed' },
];

function toast(message, error = false) {
  const element = document.querySelector('#toast');
  clearTimeout(toastTimer);
  element.classList.toggle('error', error);
  element.querySelector('span').textContent = message;
  element.querySelector(':scope > i').className = `ti ti-${error ? 'alert-circle' : 'check'}`;
  element.hidden = false;
  toastTimer = setTimeout(() => { element.hidden = true; }, 4200);
}
function download(filename, content, type = 'text/plain') {
  const url = URL.createObjectURL(new Blob([content], { type: `${type};charset=utf-8` }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function menu(id, label, options, key, selected, extraClass = '') {
  return `<div class="dropdown ${extraClass}"><button class="filter-button" data-menu="${id}" aria-haspopup="listbox" aria-expanded="false">${escapeHTML(label)} ${icon('chevron-down')}</button><div class="dropdown-panel" id="${id}" role="listbox" hidden>${options.map((option) => `<button role="option" aria-selected="${selected === option.value}" data-set="${key}" data-value="${option.value}" ${option.disabled ? 'disabled' : ''}>${escapeHTML(option.label)}</button>`).join('')}</div></div>`;
}
function rangeMenu() {
  return `<div class="dropdown"><button class="text-button" data-menu="range-menu" aria-haspopup="listbox" aria-expanded="false">${chartRanges[state.chartRange].label} ${icon('chevron-down')}</button><div class="dropdown-panel" id="range-menu" role="listbox" hidden>${Object.entries(chartRanges).map(([key, range]) => `<button role="option" data-set="chartRange" data-value="${key}" aria-selected="${key === state.chartRange}">${range.label}</button>`).join('')}<button role="option" disabled aria-selected="false">Live readings unavailable</button></div></div>`;
}
function zoneStatus(zone) {
  if (zone.moisture < 40) return { label: 'Needs irrigation', warning: true, icon: 'droplet' };
  if (zone.nitrogen < 60) return { label: 'Nutrient deficit', warning: true, icon: 'flask' };
  if (zone.risk >= 20) return { label: 'Inspection needed', warning: true, icon: 'leaf' };
  return { label: 'Stable growth', warning: false, icon: 'check' };
}
function cropCard(zone, interactive = true) {
  const fruit = fruits[zone.crop];
  const status = zoneStatus(zone);
  const words = zone.name.split(/\s+/);
  const parts = [words[0], words.slice(1).join(' ')];
  const note = zone.par < 800 ? 'PAR levels below optimal range' : zone.risk >= 20 ? 'Disease risk detected in Sector 4' : zone.moisture < 40 ? 'Moisture levels below target range' : zone.nitrogen < 60 ? 'Nitrogen levels below target range' : 'Moisture levels within target range';
  const tag = interactive ? 'button' : 'div';
  return `<${tag} class="crop-card ${fruit.className} ${zone.id === zones[state.featured].id ? 'is-featured' : ''}" ${interactive ? `data-open-zone="${zone.id}" aria-label="Open ${escapeHTML(zone.name)}"` : ''}><div class="crop-top"><span class="status-chip ${status.warning ? '' : 'stable'}">${status.label}</span>${interactive ? icon('arrow-right') : ''}</div><img class="crop-art ${fruit.className}" src="${fruit.image}" alt="${fruit.alt}" draggable="false"><div class="crop-copy"><h2>${escapeHTML(parts[0])}<br>${escapeHTML(parts[1])}</h2><p>${note}</p></div></${tag}>`;
}
function chartValues() {
  const values = chartRanges[state.chartRange].values;
  if (state.page !== 'analytics' || state.analyticsSector === 'all') return values;
  const factor = { A: 1.08, B: .88, C: 1.03 }[state.analyticsSector];
  return values.map((value) => Math.min(100, Math.round(value * factor)));
}
function chartMarkup() {
  const range = chartRanges[state.chartRange];
  const values = chartValues();
  if (state.chartTable) return `<table class="data-table chart-table"><thead><tr><th>Date</th><th class="number">Crop performance</th><th>Period</th></tr></thead><tbody>${values.map((value, index) => `<tr><td>${range.dates[index]}</td><td class="number">${value}%</td><td>${range.label}</td></tr>`).join('')}</tbody></table>`;
  return `<div class="performance-plot" role="group" aria-label="Crop performance, 0 to 100 percent"><div class="axis-y" aria-hidden="true"><span>100%</span><span>50%</span><span>0%</span></div>${values.map((value, index) => `<button class="bar-button ${state.selectedBar === index ? 'is-active' : ''}" data-bar="${index}" style="--value:${value}" aria-label="${range.dates[index]}: ${value}% crop performance" aria-pressed="${state.selectedBar === index}"><span class="bar"></span><span class="bar-date">${range.dates[index]}</span><strong class="bar-cap">${value}%</strong><span class="bar-label">${range.labels[index]}</span></button>`).join('')}</div>`;
}
function operationPreview(task) {
  return `<div class="operation-item"><p class="operation-title">${escapeHTML(task.title)}</p><p class="operation-note">${escapeHTML(task.note)}</p><button class="task-toggle ${task.done ? 'is-done' : ''}" data-task="${task.id}" aria-label="${task.done ? 'Reopen' : 'Complete'} ${escapeHTML(task.title)}" aria-pressed="${task.done}">${icon('check')}</button>${!task.done && task.progress > 0 ? `<div class="progress-row"><div class="progress-track" role="progressbar" aria-label="${escapeHTML(task.title)} progress" aria-valuenow="${task.progress}" aria-valuemin="0" aria-valuemax="100"><span style="width:${task.progress}%"></span></div><span>${task.progress}%</span></div>` : ''}</div>`;
}
function overviewPage() {
  return `<section class="page overview-page"><header class="page-header"><h1>Production overview</h1><div class="inline-actions"><div class="featured-pagination"><button class="icon-button" data-featured-step="-1" aria-label="Previous crop">${icon('chevron-left')}</button><span>${state.featured + 1} / 3</span><button class="icon-button" data-featured-step="1" aria-label="Next crop">${icon('chevron-right')}</button></div><button class="text-button" data-nav="fields">View all</button></div></header><div class="crop-grid">${zones.slice(0, 3).map((zone) => cropCard(zone)).join('')}</div><section class="optimization-banner"><div><h2>Automated crop monitoring & prediction</h2><p class="subheading">Real-time field analytics powered by satellite data</p></div><button class="btn primary" data-action="optimize">Optimize yield</button></section><div class="overview-bottom"><section class="performance"><div class="section-header performance-heading"><h2>Crop performance</h2><div class="chart-control">${rangeMenu()}<button class="icon-button" data-action="chart-table" aria-label="${state.chartTable ? 'Show chart' : 'Show data table'}" title="${state.chartTable ? 'Show chart' : 'Show data table'}">${icon(state.chartTable ? 'chart-bar' : 'table')}</button></div></div><div class="large-chart chart-overview" id="chart-content">${chartMarkup()}</div></section><section class="operations-preview"><div class="section-header operations-heading"><h2>Field operations</h2><button class="icon-button" data-action="open-operations" aria-label="View all field operations">${icon('dots')}</button></div><div id="operation-preview">${tasks.slice(0, 3).map(operationPreview).join('')}</div></section></div></section>`;
}
function filteredZones() {
  const search = state.fieldSearch.toLowerCase();
  return zones.filter((zone) => (state.fieldSector === 'all' || zone.sector === state.fieldSector) && (state.fieldCrop === 'all' || zone.crop === state.fieldCrop) && `${zone.name} ${zone.id}`.toLowerCase().includes(search));
}
function pagination(count, page, size, action, noun) {
  const total = Math.max(1, Math.ceil(count / size));
  const start = count ? (page - 1) * size + 1 : 0;
  const end = Math.min(count, page * size);
  return `<footer class="table-footer"><span>${start}–${end} of ${count} ${noun}</span><div class="inline-actions"><button class="icon-button" data-page-step="${action}" data-step="-1" aria-label="Previous page" ${page <= 1 ? 'disabled' : ''}>${icon('chevron-left')}</button><span>${page} / ${total}</span><button class="icon-button" data-page-step="${action}" data-step="1" aria-label="Next page" ${page >= total ? 'disabled' : ''}>${icon('chevron-right')}</button></div></footer>`;
}
function fieldResults() {
  const filtered = filteredZones();
  state.fieldPage = Math.min(state.fieldPage, Math.max(1, Math.ceil(filtered.length / 6)));
  const current = filtered.slice((state.fieldPage - 1) * 6, state.fieldPage * 6);
  if (!current.length) return `<div class="empty-state">${icon('plant-2')}<h3>No fields found</h3><p>Try another crop, sector or field name.</p><button class="btn" data-action="reset-fields">Clear filters</button></div>${pagination(0, 1, 6, 'fieldPage', 'zones')}`;
  return `<table class="data-table"><colgroup><col style="width:36%"><col style="width:10%"><col style="width:15%"><col style="width:15%"><col style="width:24%"></colgroup><thead><tr><th>Production zone</th><th>Sector</th><th class="number">Area</th><th class="number">Moisture</th><th>Health</th></tr></thead><tbody>${current.map((zone) => {
    const status = zoneStatus(zone);
    return `<tr><td><button class="field-name" data-open-zone="${zone.id}"><img class="field-thumb" src="${fruits[zone.crop].image}" alt=""><span>${escapeHTML(zone.name)}<small>${zone.id} · ${zone.crop === 'citrus' ? 'Citrus' : zone.crop === 'tomato' ? 'Tomato' : 'Grape'}</small></span></button></td><td>${zone.sector}</td><td class="number">${formatArea(zone.area)}</td><td class="number">${zone.moisture}%</td><td><span class="state-label ${status.warning ? 'warning' : ''}">${icon(status.icon)}${status.label}</span></td></tr>`;
  }).join('')}</tbody></table>${pagination(filtered.length, state.fieldPage, 6, 'fieldPage', 'zones')}`;
}
function formatArea(area) { return state.profile.units === 'imperial' ? `${(area * 2.471).toFixed(1)} ac` : `${area.toFixed(1)} ha`; }
function fieldsPage() {
  if (state.fieldMode === 'detail') return zoneDetail();
  if (state.fieldMode === 'editor') return zoneEditor();
  if (state.fieldMode === 'task-editor') return taskEditor();
  return `<section class="page"><header class="page-header"><div><h1>Fields & operations</h1><p class="subheading">${zones.length} production zones · 3 sectors · Valencia, Spain</p></div><div class="inline-actions"><button class="btn outline" data-action="import-fields">${icon('upload')} Import</button><button class="btn primary" data-action="${state.fieldTab === 'zones' ? 'new-zone' : 'new-task'}">${icon('plus')} ${state.fieldTab === 'zones' ? 'Add field' : 'Add task'}</button></div></header><div class="tabs" role="tablist" aria-label="Field workspace"><button role="tab" aria-selected="${state.fieldTab === 'zones'}" class="${state.fieldTab === 'zones' ? 'is-active' : ''}" data-set="fieldTab" data-value="zones">Production zones</button><button role="tab" aria-selected="${state.fieldTab === 'operations'}" class="${state.fieldTab === 'operations' ? 'is-active' : ''}" data-set="fieldTab" data-value="operations">Field operations <span class="muted">${tasks.filter((task) => !task.done).length}</span></button></div>${state.fieldTab === 'zones' ? `<div class="toolbar"><label class="search">${icon('search')}<input id="field-search" placeholder="Search by field or zone..." value="${escapeHTML(state.fieldSearch)}" aria-label="Search fields"></label>${menu('sector-menu', state.fieldSector === 'all' ? 'All sectors' : `Sector ${state.fieldSector}`, [{ label: 'All sectors', value: 'all' }, ...['A', 'B', 'C'].map((value) => ({ label: `Sector ${value}`, value }))], 'fieldSector', state.fieldSector)}${menu('crop-menu', state.fieldCrop === 'all' ? 'All crops' : fruits[state.fieldCrop].title, [{ label: 'All crops', value: 'all' }, ...Object.keys(fruits).map((value) => ({ label: fruits[value].title, value }))], 'fieldCrop', state.fieldCrop)}</div><div class="table-wrap" id="field-results">${fieldResults()}</div>` : operationsBody()}</section>`;
}
function operationsBody() {
  const filtered = tasks.filter((task) => state.taskFilter === 'all' || (state.taskFilter === 'done' ? task.done : !task.done));
  state.taskPage = Math.min(state.taskPage, Math.max(1, Math.ceil(filtered.length / 6)));
  const current = filtered.slice((state.taskPage - 1) * 6, state.taskPage * 6);
  return `<div class="toolbar">${menu('task-filter-menu', { all: 'All tasks', pending: 'Pending tasks', done: 'Completed tasks' }[state.taskFilter], [{ label: 'All tasks', value: 'all' }, { label: 'Pending tasks', value: 'pending' }, { label: 'Completed tasks', value: 'done' }], 'taskFilter', state.taskFilter)}<span class="muted">${tasks.filter((task) => task.done).length} completed · ${tasks.filter((task) => !task.done).length} to do</span><button class="text-button" data-action="export-tasks">${icon('download')} Export</button></div><div class="operation-list">${current.length ? current.map((task) => `<article class="operation-row ${task.done ? 'is-done' : ''}"><div><h3>${escapeHTML(task.title)}</h3><p><button class="text-button task-zone-link" data-open-zone="${task.zone}">${escapeHTML(task.zone)}</button> · ${escapeHTML(task.note)}</p></div><div class="operation-time">${task.done ? 'Completed' : task.date.slice(5).replace('-', '/')}<br>${task.time}</div><button class="task-toggle ${task.done ? 'is-done' : ''}" data-task="${task.id}" aria-pressed="${task.done}" aria-label="${task.done ? 'Reopen' : 'Complete'} ${escapeHTML(task.title)}">${icon('check')}</button></article>`).join('') : `<div class="empty-state">${icon('clipboard-check')}<h3>${state.taskFilter === 'pending' ? 'Everything is taken care of' : 'No tasks here yet'}</h3><p>Add a field task to keep your team in sync.</p><button class="btn" data-action="new-task">Add task</button></div>`}</div>${pagination(filtered.length, state.taskPage, 6, 'taskPage', 'tasks')}`;
}
function zoneDetail() {
  const zone = zones.find((item) => item.id === state.selectedZone);
  const status = zoneStatus(zone);
  const plan = zone.plan || { flow: 45, duration: 35, time: '06:00' };
  return `<section class="page"><header class="page-header"><button class="text-button" data-action="field-list">${icon('arrow-left')} All fields</button><div class="inline-actions"><button class="btn outline" data-action="edit-zone">${icon('pencil')} Edit field</button><button class="btn" data-action="export-zone">${icon('download')} Export</button></div></header><div class="detail-layout"><div class="detail-visual">${cropCard(zone, false)}<div class="detail-caption"><span>Sector ${zone.sector} · ${zone.id}</span><span>${formatArea(zone.area)}</span></div><div class="assumptions"><strong>${escapeHTML(zone.name)}</strong><br>${status.label}.<br>Latest readings: Mar 23, 11:42.<br>Next inspection: Mar 25.</div></div><div class="detail-info"><div class="section-header"><h1>${escapeHTML(zone.name)}</h1></div><p class="subheading">Field conditions · latest snapshot</p><div class="reading-grid"><div class="reading"><span>Soil moisture</span><strong>${zone.moisture}%</strong><small>Target 40–60%</small></div><div class="reading"><span>Nitrogen index</span><strong>${zone.nitrogen}</strong><small>Target 60–85</small></div><div class="reading"><span>PAR</span><strong>${zone.par}</strong><small>µmol/m²/s</small></div><div class="reading"><span>Disease risk</span><strong>${zone.risk}%</strong><small>${zone.risk >= 20 ? 'Inspection required' : 'Low risk'}</small></div></div><form class="form-section" id="irrigation-form" novalidate><h3>Irrigation plan</h3><div class="form-field"><div class="range-value"><label for="flow">Water flow</label><strong id="flow-value">${plan.flow} L/min</strong></div><input class="range" type="range" id="flow" name="flow" min="5" max="100" step="5" value="${plan.flow}" aria-label="Water flow in litres per minute"></div><div class="form-row"><div class="form-field"><label for="duration">Duration · minutes</label><input id="duration" name="duration" type="number" min="5" max="240" value="${plan.duration}" required></div><div class="form-field"><label for="start-time">Start time · 24h</label><input id="start-time" name="time" inputmode="numeric" maxlength="5" value="${plan.time}" placeholder="06:00" required></div></div><button class="btn primary" type="submit">${icon('droplet')} Save irrigation plan</button><p class="form-feedback" id="irrigation-feedback" role="status">A saved plan awaits execution by the field team.</p></form><div class="form-section"><h3>Field care</h3><p class="muted">${zone.nitrogen < 60 ? 'Confirm nutrient levels with a soil sample before treatment.' : zone.moisture < 40 ? 'Check soil moisture after the next irrigation cycle.' : 'Maintain the current care schedule and monitor leaf health.'}</p><button class="text-button" data-action="zone-advice">Ask agronomist ${icon('arrow-up-right')}</button></div></div></div></section>`;
}
function zoneEditor() {
  const draft = state.draft;
  return `<section class="page"><header class="page-header"><button class="text-button" data-action="cancel-editor">${icon('arrow-left')} ${draft.existing ? 'Field details' : 'All fields'}</button><span class="muted">Field information</span></header><form class="inline-editor" id="zone-form" novalidate><h2>${draft.existing ? 'A little closer to this field.' : 'Room for something new.'}</h2><p class="editor-description">Keep production zones organized by crop and sector.</p><div class="form-field"><label for="zone-name">Field name</label><input id="zone-name" name="name" maxlength="48" value="${escapeHTML(draft.name)}" placeholder="e.g. Citrus Grove C14" required></div><div class="form-row"><div class="form-field"><label>Crop</label>${menu('editor-crop-menu', fruits[draft.crop].title, Object.keys(fruits).map((value) => ({ label: fruits[value].title, value })), 'draftCrop', draft.crop)}</div><div class="form-field"><label>Sector</label>${menu('editor-sector-menu', `Sector ${draft.sector}`, ['A', 'B', 'C'].map((value) => ({ label: `Sector ${value}`, value })), 'draftSector', draft.sector)}</div></div><div class="form-row"><div class="form-field"><label for="zone-area">Area · hectares</label><input id="zone-area" name="area" type="number" min="0.1" max="1000" step="0.1" value="${draft.area}" required></div><div class="form-field"><label for="zone-moisture">Soil moisture · %</label><input id="zone-moisture" name="moisture" type="number" min="0" max="100" value="${draft.moisture}" required></div></div><div class="form-row"><div class="form-field"><label for="zone-nitrogen">Nitrogen index</label><input id="zone-nitrogen" name="nitrogen" type="number" min="0" max="100" value="${draft.nitrogen}" required></div><div class="form-field"><label for="zone-yield">Yield estimate · tonnes</label><input id="zone-yield" name="yield" type="number" min="0" max="10000" step="0.1" value="${draft.yield}" required></div></div><p class="form-feedback" id="zone-feedback" role="status"></p><div class="form-actions"><button class="btn primary" type="submit">Save field</button><button class="btn" type="button" data-action="cancel-editor">Cancel</button></div></form></section>`;
}
function zoneChoices() {
  const total = Math.ceil(zones.length / 8);
  return `<div class="zone-options">${zones.slice(state.zonePickerPage * 8, state.zonePickerPage * 8 + 8).map((zone) => `<button role="option" aria-selected="${zone.id === state.draft.zone}" data-set="draftZone" data-value="${zone.id}">${zone.id} · ${zone.crop}</button>`).join('')}</div><div class="zone-option-pager"><button data-picker-step="-1" aria-label="Previous zones" ${state.zonePickerPage === 0 ? 'disabled' : ''}>${icon('chevron-left')}</button><span>${state.zonePickerPage + 1} / ${total}</span><button data-picker-step="1" aria-label="Next zones" ${state.zonePickerPage === total - 1 ? 'disabled' : ''}>${icon('chevron-right')}</button></div>`;
}
function taskZoneMenu() {
  return `<div class="dropdown zone-picker"><button class="filter-button" data-menu="task-zone-menu" aria-expanded="false" aria-haspopup="listbox">${state.draft.zone} ${icon('chevron-down')}</button><div class="dropdown-panel" id="task-zone-menu" role="listbox" hidden>${zoneChoices()}</div></div>`;
}
function taskEditor() {
  const draft = state.draft;
  return `<section class="page"><header class="page-header"><button class="text-button" data-action="cancel-task">${icon('arrow-left')} Field operations</button></header><form class="inline-editor" id="task-form" novalidate><h2>Good care starts with a plan.</h2><p class="editor-description">Assign a practical next step to a production zone.</p><div class="form-field"><label for="task-title">Task</label><input id="task-title" name="title" maxlength="64" value="${escapeHTML(draft.title)}" placeholder="e.g. Inspect the lower canopy" required></div><div class="form-row"><div class="form-field"><label>Production zone</label>${taskZoneMenu()}</div><div class="form-field"><label>Category</label>${menu('task-type-menu', draft.type, ['Irrigation', 'Nutrition', 'Inspection'].map((value) => ({ label: value, value })), 'draftType', draft.type)}</div></div><div class="form-row"><div class="form-field"><label for="task-date">Date · YYYY-MM-DD</label><input id="task-date" name="date" value="${draft.date}" maxlength="10" placeholder="2026-03-24" required></div><div class="form-field"><label for="task-time">Time · 24h</label><input id="task-time" name="time" value="${draft.time}" maxlength="5" placeholder="08:00" required></div></div><div class="form-field"><label for="task-note">Field notes</label><textarea id="task-note" name="note" maxlength="120" placeholder="What should the field team check?">${escapeHTML(draft.note)}</textarea></div><p class="form-feedback" id="task-feedback" role="status"></p><div class="form-actions"><button class="btn primary" type="submit">Schedule task</button><button class="btn" type="button" data-action="cancel-task">Cancel</button></div></form></section>`;
}
function totals(rows = zones) {
  return { area: rows.reduce((sum, zone) => sum + zone.area, 0), yield: rows.reduce((sum, zone) => sum + zone.yield, 0), moisture: rows.length ? Math.round(rows.reduce((sum, zone) => sum + zone.moisture, 0) / rows.length) : 0 };
}
function agronomyPage() {
  const total = totals();
  return `<section class="page"><header class="page-header"><div><h1>Agronomy workspace</h1><p class="subheading">From field readings to thoughtful next steps.</p></div><button class="btn primary" data-action="analyze" ${state.busy ? 'disabled' : ''}>${icon('sparkles')} ${state.busy ? 'Analyzing...' : 'Run analysis'}</button></header><section class="insight-banner"><div><h2>A healthier field.<br>A better harvest.</h2><p>March readings show recovery after irrigation adjustments. A targeted care plan could improve yield efficiency by April.</p></div><div class="insight-number">+12%<small>Q2 yield scenario</small></div></section><div class="kpi-row"><div class="kpi"><span class="kpi-label">Current yield estimate</span><strong class="kpi-value">${total.yield.toFixed(1)}<small>t</small></strong><span class="kpi-note">Across ${zones.length} production zones</span></div><div class="kpi"><span class="kpi-label">Q2 care scenario</span><strong class="kpi-value">${(total.yield * 1.12).toFixed(1)}<small>t</small></strong><span class="kpi-note">With the proposed care plan</span></div><div class="kpi"><span class="kpi-label">Needs attention</span><strong class="kpi-value">${zones.filter((zone) => zoneStatus(zone).warning).length}<small>zones</small></strong><span class="kpi-note">Moisture, nutrition or leaf health</span></div></div><div class="section-header"><h2>Recommended field care</h2><button class="text-button" data-action="export-report">Export report ${icon('download')}</button></div><div class="recommendations">${recommendations.map((recommendation) => {
    const scheduled = tasks.some((task) => task.recommendation === recommendation.id && !task.done);
    return `<article class="recommendation"><span class="recommendation-icon">${icon(recommendation.icon)}</span><div><h3>${recommendation.title}</h3><p>${recommendation.text}</p></div><button class="btn ${scheduled ? '' : 'outline'} small" data-schedule="${recommendation.id}" ${scheduled ? 'disabled' : ''}>${icon(scheduled ? 'check' : 'plus')} ${scheduled ? 'Scheduled' : 'Schedule'}</button></article>`;
  }).join('')}</div><div class="assumptions"><strong>Forecast assumptions</strong> · Stable weather, consistent crop area and timely field care. This is a planning scenario, not a guaranteed harvest. Verify treatment decisions on site.</div></section>`;
}
function analyticsPage() {
  const selected = state.analyticsSector === 'all' ? zones : zones.filter((zone) => zone.sector === state.analyticsSector);
  const total = totals(selected);
  return `<section class="page"><header class="page-header"><div><h1>Crop analytics</h1><p class="subheading">A clearer picture of production performance.</p></div><button class="btn outline" data-action="export-analytics">${icon('download')} Export data</button></header><div class="toolbar">${menu('analytics-range-menu', chartRanges[state.chartRange].label, Object.entries(chartRanges).map(([value, range]) => ({ label: range.label, value })), 'chartRange', state.chartRange)}${menu('analytics-sector-menu', state.analyticsSector === 'all' ? 'All sectors' : `Sector ${state.analyticsSector}`, [{ label: 'All sectors', value: 'all' }, ...['A', 'B', 'C'].map((value) => ({ label: `Sector ${value}`, value }))], 'analyticsSector', state.analyticsSector)}<button class="btn small" data-action="chart-table">${icon(state.chartTable ? 'chart-bar' : 'table')} ${state.chartTable ? 'Chart view' : 'Table view'}</button></div><div class="kpi-row"><div class="kpi"><span class="kpi-label">Period performance</span><strong class="kpi-value">${chartValues().at(-1)}<small>%</small></strong><span class="kpi-note">${chartRanges[state.chartRange].label} · latest reading</span></div><div class="kpi"><span class="kpi-label">Tracked crop area</span><strong class="kpi-value">${(state.profile.units === 'imperial' ? total.area * 2.471 : total.area).toFixed(1)}<small>${state.profile.units === 'imperial' ? 'ac' : 'ha'}</small></strong><span class="kpi-note">${selected.length} production zones</span></div><div class="kpi"><span class="kpi-label">Yield estimate</span><strong class="kpi-value">${total.yield.toFixed(1)}<small>t</small></strong><span class="kpi-note">Based on the latest field snapshot</span></div></div><div class="section-header"><h2>Crop performance</h2><span class="muted">Efficiency · %</span></div><section class="large-chart" id="chart-content">${chartMarkup()}</section><div class="analytics-summary">${icon('chart-line')}<p>Current sector performance is measured against the productive capacity of its crops. ${state.analyticsSector === 'B' ? 'Sector B is below the farm average; check irrigation first.' : 'March recovery follows the February decline. Review the field care plan before the next cycle.'}</p></div></section>`;
}
function documentResults() {
  const filtered = documents.filter((document) => `${document.name} ${document.category}`.toLowerCase().includes(state.documentSearch.toLowerCase()));
  state.documentPage = Math.min(state.documentPage, Math.max(1, Math.ceil(filtered.length / 6)));
  const current = filtered.slice((state.documentPage - 1) * 6, state.documentPage * 6);
  return `<div class="document-list">${current.length ? current.map((document) => `<article class="document-row"><span class="document-icon">${icon(document.kind === 'csv' ? 'file-spreadsheet' : 'file-text')}</span><div><button class="document-name" data-document="${document.id}">${escapeHTML(document.name)}</button><p>${escapeHTML(document.category)} · ${document.kind.toUpperCase()}</p></div><span class="document-date">${document.date}</span><button class="icon-button" data-download-document="${document.id}" aria-label="Download ${escapeHTML(document.name)}">${icon('download')}</button></article>`).join('') : `<div class="empty-state">${icon('folder')}<h3>No matching documents</h3><p>Search by report name or category.</p><button class="btn" data-action="reset-documents">Clear search</button></div>`}</div>${pagination(filtered.length, state.documentPage, 6, 'documentPage', 'documents')}`;
}
function documentChunks(text) {
  const lines = text.replace(/\r/g, '').split('\n').flatMap((line) => line.match(/.{1,52}/gu) || ['']);
  return Array.from({ length: Math.max(1, Math.ceil(lines.length / 9)) }, (_, index) => lines.slice(index * 9, (index + 1) * 9).join('\n'));
}
function documentsPage() {
  if (state.selectedDocument) {
    const document = documents.find((item) => item.id === state.selectedDocument);
    const chunks = documentChunks(document.content);
    state.documentChunk = Math.min(state.documentChunk, chunks.length - 1);
    return `<section class="page"><header class="page-header"><button class="text-button" data-action="document-list">${icon('arrow-left')} All documents</button><button class="btn primary" data-download-document="${document.id}">${icon('download')} Download ${document.kind.toUpperCase()}</button></header><article class="document-preview"><p class="muted">${escapeHTML(document.category)} · ${document.date}</p><h2>${escapeHTML(document.name)}</h2><p>${escapeHTML(document.filename)}</p><pre>${escapeHTML(chunks[state.documentChunk])}</pre><div class="table-footer"><span>Page ${state.documentChunk + 1} of ${chunks.length}</span><div class="inline-actions"><button class="icon-button" data-action="previous-chunk" aria-label="Previous document page" ${state.documentChunk === 0 ? 'disabled' : ''}>${icon('chevron-left')}</button><button class="icon-button" data-action="next-chunk" aria-label="Next document page" ${state.documentChunk === chunks.length - 1 ? 'disabled' : ''}>${icon('chevron-right')}</button></div></div></article></section>`;
  }
  return `<section class="page"><header class="page-header"><div><h1>Documents</h1><p class="subheading">Field reports, sensor snapshots and care plans.</p></div><button class="btn primary" data-action="import-document">${icon('upload')} Import file</button></header><div class="toolbar"><label class="search">${icon('search')}<input id="document-search" placeholder="Search documents..." aria-label="Search documents" value="${escapeHTML(state.documentSearch)}"></label><button class="btn outline" data-action="export-data">${icon('download')} Field snapshot</button></div><div class="table-wrap" id="document-results">${documentResults()}</div><div class="assumptions"><strong>Keep it in the field.</strong> Import CSV, JSON or TXT files up to 1 MB. Download reports for your team; files stay in this session.</div></section>`;
}
function notificationsPage() {
  const filtered = notifications.filter((notification) => state.notificationFilter === 'all' || !notification.read);
  state.notificationPage = Math.min(state.notificationPage, Math.max(1, Math.ceil(filtered.length / 4)));
  const current = filtered.slice((state.notificationPage - 1) * 4, state.notificationPage * 4);
  return `<section class="page"><header class="page-header"><div><h1>Notifications</h1><p class="subheading">${notifications.filter((notification) => !notification.read).length} unread updates from your farm.</p></div><button class="btn outline" data-action="read-all" ${notifications.every((notification) => notification.read) ? 'disabled' : ''}>${icon('checks')} Mark all read</button></header><div class="tabs" role="tablist" aria-label="Notification filter"><button role="tab" aria-selected="${state.notificationFilter === 'all'}" class="${state.notificationFilter === 'all' ? 'is-active' : ''}" data-set="notificationFilter" data-value="all">All updates</button><button role="tab" aria-selected="${state.notificationFilter === 'unread'}" class="${state.notificationFilter === 'unread' ? 'is-active' : ''}" data-set="notificationFilter" data-value="unread">Unread</button></div><div class="notification-list">${current.length ? current.map((notification) => `<article class="notification-row ${notification.read ? 'is-read' : ''}"><span class="recommendation-icon">${icon(notification.icon)}</span><div><h3>${escapeHTML(notification.title)}</h3><p>${escapeHTML(notification.text)}</p><time>${notification.time}</time><button class="text-button" data-notification-open="${notification.id}">${notification.zone ? 'View field' : 'View document'} ${icon('arrow-up-right')}</button></div><button class="icon-button" data-read="${notification.id}" aria-label="Mark ${escapeHTML(notification.title)} as ${notification.read ? 'unread' : 'read'}" aria-pressed="${notification.read}">${icon(notification.read ? 'mail-opened' : 'mail')}</button></article>`).join('') : `<div class="empty-state">${icon('bell-check')}<h3>You’re all caught up.</h3><p>New field updates will appear here.</p><button class="btn" data-set="notificationFilter" data-value="all">View all updates</button></div>`}</div>${pagination(filtered.length, state.notificationPage, 4, 'notificationPage', 'updates')}</section>`;
}
function settingsPage() {
  const profile = state.profileDraft || state.profile;
  return `<section class="page"><header class="page-header"><div><h1>Farm settings</h1><p class="subheading">Make Insecto feel a little more like your farm.</p></div></header><div class="settings-layout"><form class="settings-form" id="profile-form" novalidate><section class="settings-section"><h2>Farm & profile</h2><div class="form-field"><label for="farm-name">Farm name</label><input id="farm-name" name="farm" maxlength="48" value="${escapeHTML(profile.farm)}" required></div><div class="form-field"><label for="manager-name">Farm manager</label><input id="manager-name" name="manager" maxlength="48" value="${escapeHTML(profile.manager)}" required></div><div class="form-field"><label for="manager-email">Email</label><input id="manager-email" name="email" type="email" maxlength="80" value="${escapeHTML(profile.email)}" required></div><div class="form-field"><label>Time zone</label>${menu('timezone-menu', state.profile.timezone, ['UTC', 'UTC+1', 'UTC+2'].map((value) => ({ label: value, value })), 'timezone', state.profile.timezone)}</div></section><button class="btn primary" type="submit">Save changes</button><p class="form-feedback" id="profile-feedback" role="status"></p><p class="muted">Changes apply to this session. Export field data to keep a copy.</p></form><div><section class="settings-section"><h2>Your workspace</h2><div class="setting-row"><div><strong>Motion</strong><p>Subtle feedback and transitions</p></div><button class="switch" role="switch" aria-label="Motion" aria-checked="${state.settings.motion}" data-setting="motion"></button></div><div class="setting-row"><div><strong>Chart texture</strong><p>Improve monochrome readability</p></div><button class="switch" role="switch" aria-label="Chart texture" aria-checked="${state.settings.texture}" data-setting="texture"></button></div><div class="setting-row"><div><strong>Field alerts</strong><p>Highlight unread field updates</p></div><button class="switch" role="switch" aria-label="Field alerts" aria-checked="${state.settings.alerts}" data-setting="alerts"></button></div><div class="setting-row"><strong>Area units</strong>${menu('units-menu', state.profile.units === 'metric' ? 'Hectares' : 'Acres', [{ label: 'Hectares', value: 'metric' }, { label: 'Acres', value: 'imperial' }], 'units', state.profile.units)}</div></section><section class="settings-section"><h2>Data connection</h2><div class="connection-card"><h3>${icon('database')} Field snapshot</h3><p>Loaded Mar 23, 2026. Live sensor readings require a farm data connection.</p><button class="btn outline small" data-action="connect-sensors">Connect sensors</button><p class="form-feedback" id="connection-feedback" role="status"></p></div></section><section class="settings-section"><p class="muted">Fruit photography: <a href="https://pngimg.com/" target="_blank" rel="noopener noreferrer">pngimg.com</a><br>CC BY-NC 4.0 · non-commercial use<br>Design reference: <a href="https://dribbble.com/shots/27615655-Product-for-an-Agriculture-Company-Insecto" target="_blank" rel="noopener noreferrer">Insecto by HALO LAB</a></p></section></div></div></section>`;
}
function addCompactViews() {
  const page = workspace.querySelector('.page');
  const header = page.querySelector('.page-header');
  const tabs = (key, options) => `<div class="tabs narrow-subtabs" role="tablist">${options.map(([value, label]) => `<button role="tab" class="${state[key] === value ? 'is-active' : ''}" aria-selected="${state[key] === value}" data-set="${key}" data-value="${value}">${label}</button>`).join('')}</div>`;
  if (state.page === 'agronomy') {
    page.classList.add('agronomy-page');
    header.insertAdjacentHTML('beforeend', `<button class="btn outline narrow-ask" data-action="open-assistant">${icon('robot')} Ask agronomist</button>`);
    header.insertAdjacentHTML('afterend', tabs('agronomyTab', [['care', 'Field care'], ['forecast', 'Yield forecast']]));
    page.querySelector('.recommendations').previousElementSibling.classList.add('care-heading');
  }
  if (state.page === 'settings') {
    page.classList.add('settings-page');
    page.querySelector('.settings-layout > div').classList.add('settings-preferences');
    header.insertAdjacentHTML('afterend', tabs('settingsTab', [['profile', 'Farm & profile'], ['workspace', 'Your workspace']]));
  }
  if (state.page === 'fields' && state.fieldMode === 'detail') {
    page.classList.add('detail-page');
    header.insertAdjacentHTML('afterend', tabs('detailTab', [['conditions', 'Field conditions'], ['care', 'Irrigation plan']]));
  }
}
function render() {
  closeMenus();
  canvas.dataset.page = state.page;
  canvas.dataset.motion = state.settings.motion;
  canvas.dataset.texture = state.settings.texture;
  canvas.dataset.assistantOpen = state.assistantOpen;
  canvas.dataset.agronomyTab = state.agronomyTab;
  canvas.dataset.settingsTab = state.settingsTab;
  canvas.dataset.detailTab = state.detailTab;
  document.querySelectorAll('.primary-nav .nav-button, .rail-bottom .nav-button').forEach((button) => {
    const active = button.dataset.nav === state.page;
    button.classList.toggle('is-active', active);
    if (active) button.setAttribute('aria-current', 'page'); else button.removeAttribute('aria-current');
  });
  const pages = { overview: overviewPage, fields: fieldsPage, agronomy: agronomyPage, analytics: analyticsPage, documents: documentsPage, notifications: notificationsPage, settings: settingsPage };
  workspace.innerHTML = pages[state.page]();
  addCompactViews();
  workspace.querySelectorAll('button:not([type])').forEach((button) => { button.type = 'button'; });
  updateUnread();
  document.querySelector('#zone-count').textContent = zones.length;
  document.title = `Insecto — ${({ overview: 'Production overview', fields: 'Fields & operations', agronomy: 'Agronomy workspace', analytics: 'Crop analytics', documents: 'Documents', notifications: 'Notifications', settings: 'Farm settings' })[state.page]}`;
}
function navigate(page) {
  if (!validPages.includes(page)) return;
  state.page = page;
  if (location.hash !== `#${page}`) location.hash = page;
  else render();
}
function openZone(id) {
  if (!zones.some((zone) => zone.id === id)) { toast('This field is not in the current snapshot.', true); return; }
  state.selectedZone = id;
  state.fieldMode = 'detail';
  navigate('fields');
}
function closeMenus() {
  document.querySelectorAll('.dropdown-panel').forEach((panel) => { panel.hidden = true; });
  document.querySelectorAll('[data-menu]').forEach((button) => { button.setAttribute('aria-expanded', 'false'); });
}
function updateUnread() {
  document.querySelector('.unread-dot').hidden = !state.settings.alerts || notifications.every((notification) => notification.read);
}
function renderConversation() {
  const item = state.conversations[state.conversationIndex];
  const paginated = item.question.length > 90 && item.paragraphs.length > 1;
  const answerPage = item.answerPage || 0;
  const paragraphs = paginated ? [item.paragraphs[answerPage]] : item.paragraphs;
  document.querySelector('#conversation').innerHTML = `<div class="user-message ${item.question.length > 90 ? 'long' : ''}">${escapeHTML(item.question)}</div><div class="assistant-message"><div class="analysis-label">${icon(state.busy ? 'loader-2' : 'sparkles')}<span>${escapeHTML(item.label)}</span></div>${paragraphs.map((paragraph) => `<p>${escapeHTML(paragraph)}</p>`).join('')}${paginated ? `<div class="answer-pagination"><button class="icon-button light" data-action="previous-answer" aria-label="Previous answer section" ${answerPage === 0 ? 'disabled' : ''}>${icon('chevron-left')}</button><span>Answer ${answerPage + 1} / ${item.paragraphs.length}</span><button class="icon-button light" data-action="next-answer" aria-label="Next answer section" ${answerPage === item.paragraphs.length - 1 ? 'disabled' : ''}>${icon('chevron-right')}</button></div>` : ''}</div>`;
  document.querySelector('#conversation').setAttribute('aria-busy', String(state.busy));
  const intro = document.querySelector('.assistant-intro');
  document.querySelector('.assistant-content').classList.toggle('has-history', state.conversations.length > 1);
  if (state.conversations.length > 1) {
    intro.querySelector('p').innerHTML = `Mar 23 snapshot · <span id="zone-count">${zones.length}</span> zones · 3 sectors`;
    intro.querySelector('p:last-child').hidden = true;
  }
  const pager = document.querySelector('#conversation-pager');
  pager.hidden = state.conversations.length <= 1;
  pager.innerHTML = `<button class="icon-button light" data-action="previous-chat" aria-label="Previous message" ${state.conversationIndex === 0 || state.busy ? 'disabled' : ''}>${icon('chevron-left')}</button><span>${state.conversationIndex + 1} / ${state.conversations.length}</span><button class="icon-button light" data-action="next-chat" aria-label="Next message" ${state.conversationIndex === state.conversations.length - 1 || state.busy ? 'disabled' : ''}>${icon('chevron-right')}</button>`;
  document.querySelectorAll('[data-action="analyze"], [data-action="optimize"]').forEach((button) => { button.disabled = state.busy; });
  document.querySelector('.send-button').disabled = state.busy;
}
function replyFor(question) {
  const lower = question.toLowerCase();
  const zone = zones.find((item) => lower.includes(item.id.toLowerCase()) || lower.includes(item.name.toLowerCase())) || (lower.includes('vineyard') || lower.includes('grape') || lower.includes('葡萄') ? zones[2] : lower.includes('citrus') || lower.includes('lemon') || lower.includes('柠檬') ? zones[1] : lower.includes('tomato') || lower.includes('番茄') ? zones[0] : null);
  if (/forecast|yield|production|产量|预测/.test(lower)) {
    const value = zone ? zone.yield : totals().yield;
    return [`${zone ? zone.name : 'Farm-wide'} yield estimate: ${value.toFixed(1)} t. The Q2 care scenario is ${(value * 1.12).toFixed(1)} t, a 12% increase.`, 'Assumes stable weather and timely care. Review nutrient levels and inspect affected leaves before treatment.'];
  }
  if (/moisture|water|irrigat|水|灌溉/.test(lower)) {
    const field = zone || zones[0];
    return [`${field.name} moisture is ${field.moisture}%. Target: 40–60%. ${field.moisture < 40 ? 'Schedule a drip cycle and recheck the soil.' : 'Current moisture is within range; avoid overwatering.'}`, 'Open the field to adjust water flow, duration and start time. Plans await field-team execution.'];
  }
  if (/nitrogen|nutrient|fertil|氮|营养|施肥/.test(lower)) {
    const field = zone || zones[2];
    return [`${field.name} nitrogen index is ${field.nitrogen}. Target: 60–85. ${field.nitrogen < 60 ? 'Confirm with a soil sample before adding fertilizer.' : 'No extra treatment is indicated by this reading.'}`, 'Schedule a nutrient review in the agronomy workspace. Avoid dosing from a single sensor reading.'];
  }
  if (/disease|risk|leaf|health|病|叶/.test(lower)) {
    const field = zone || zones[2];
    return [`${field.name} disease risk is ${field.risk}%. ${field.risk >= 20 ? 'Inspect the lower canopy and isolate affected leaves for assessment.' : 'Risk is low. Maintain the regular inspection schedule.'}`, 'A field inspection should confirm leaf symptoms before treatment is scheduled.'];
  }
  if (/task|operation|任务|作业/.test(lower)) return [`${tasks.filter((task) => !task.done).length} field tasks are pending; ${tasks.filter((task) => task.done).length} are complete.`, 'Open Fields → Field operations to schedule care or update a task.'];
  return ['I can review moisture, nitrogen, leaf health and yield estimates from the field snapshot.', 'Ask about a zone such as B12, A12 or Vineyard Block A. Live data requires a sensor connection.'];
}
async function sendQuestion(question, forceAnalysis = false) {
  if (state.busy) return;
  state.busy = true;
  const item = { question, label: 'Reviewing field snapshot...', paragraphs: ['Checking moisture, nutrient levels and production data.'] };
  state.conversations.push(item);
  state.conversationIndex = state.conversations.length - 1;
  renderConversation();
  await new Promise((resolve) => setTimeout(resolve, matchMedia('(prefers-reduced-motion: reduce)').matches ? 80 : 650));
  item.label = `Field analysis · ${zones.length} zones`;
  item.paragraphs = forceAnalysis ? [`${zones.filter((zone) => zoneStatus(zone).warning).length} zones need attention. Average soil moisture is ${totals().moisture}%. B12 needs irrigation; Vineyard Block A needs a nutrient review.`, 'Inspect affected leaves before treatment. The care plan is ready in your agronomy workspace.'] : replyFor(question);
  if (state.attachment) { state.attachment = null; document.querySelector('#attachment-label').textContent = 'Attachment'; }
  state.busy = false;
  renderConversation();
}
function toggleTask(id) {
  const task = tasks.find((item) => item.id === id);
  if (!task) return;
  task.done = !task.done;
  task.progress = task.done ? 100 : id === 'task-1' ? 74 : 0;
  render();
  toast(task.done ? 'Task marked complete.' : 'Task reopened.');
}
function scheduleRecommendation(id) {
  const recommendation = recommendations.find((item) => item.id === id);
  if (!recommendation || tasks.some((task) => task.recommendation === id && !task.done)) return;
  tasks.push({ id: `task-${Date.now()}-${tasks.length}`, zone: recommendation.zone, title: recommendation.title, note: recommendation.text, date: '2026-03-24', time: '08:00', progress: 0, done: false, type: recommendation.type, recommendation: id });
  render();
  toast('Added to the field care schedule.');
}
function openZoneEditor(existing) {
  const zone = zones.find((item) => item.id === state.selectedZone);
  state.draft = existing ? { ...zone, existing: true } : { name: '', crop: 'tomato', sector: 'C', area: 3.5, moisture: 50, nitrogen: 70, yield: 4.2, par: 1000, risk: 5, existing: false };
  state.fieldMode = 'editor';
  render();
  document.querySelector('#zone-name').focus();
}
function openTaskEditor() {
  state.draft = { title: '', zone: state.selectedZone, type: 'Inspection', date: '2026-03-24', time: '08:00', note: '' };
  state.fieldMode = 'task-editor';
  navigate('fields');
}
function exportReport() {
  const total = totals();
  download('insecto-agronomy-report.txt', `INSECTO — AGRONOMY REPORT\nMarch 23, 2026\n\n${zones.length} production zones across 3 sectors\nCrop area: ${total.area.toFixed(1)} ha\nAverage moisture: ${total.moisture}%\nCurrent yield estimate: ${total.yield.toFixed(1)} tonnes\nQ2 care scenario: ${(total.yield * 1.12).toFixed(1)} tonnes (+12%)\n\n${recommendations.map((item) => `${item.title}\n${item.text}`).join('\n\n')}\n\nForecast assumptions: stable weather, consistent crop area and timely care.\nVerify treatment decisions on site.`);
  toast('Agronomy report downloaded.');
}
function exportTasks() {
  download('insecto-field-operations.csv', ['zone,title,date,time,status,notes', ...tasks.map((task) => [task.zone, task.title, task.date, task.time, task.done ? 'Completed' : 'Pending', task.note].map(csvCell).join(','))].join('\r\n'), 'text/csv');
  toast('Field operations downloaded.');
}
function setValue(key, value) {
  closeMenus();
  const enums = { agronomyTab: ['care', 'forecast'], settingsTab: ['profile', 'workspace'], detailTab: ['conditions', 'care'], fieldTab: ['zones', 'operations'], fieldSector: ['all', 'A', 'B', 'C'], fieldCrop: ['all', 'tomato', 'citrus', 'vineyard'], taskFilter: ['all', 'pending', 'done'], chartRange: ['week', 'month', 'quarter'], analyticsSector: ['all', 'A', 'B', 'C'], notificationFilter: ['all', 'unread'], units: ['metric', 'imperial'], timezone: ['UTC', 'UTC+1', 'UTC+2'] };
  if (key.startsWith('draft')) {
    const map = { draftCrop: 'crop', draftSector: 'sector', draftZone: 'zone', draftType: 'type' };
    if (!Object.hasOwn(map, key) || !state.draft) return;
    state.draft[map[key]] = value;
  } else {
    if (!enums[key]?.includes(value)) return;
    if (key === 'units' || key === 'timezone') state.profile[key] = value;
    else state[key] = value;
    if (key === 'fieldSector' || key === 'fieldCrop') state.fieldPage = 1;
    if (key === 'notificationFilter') state.notificationPage = 1;
    if (key === 'taskFilter') state.taskPage = 1;
    if (key === 'chartRange') state.selectedBar = value === 'week' ? 5 : 6;
  }
  render();
}
function setBar(index) {
  if (index < 0 || index > 6 || state.chartTable) return;
  state.selectedBar = index;
  document.querySelectorAll('[data-bar]').forEach((bar) => {
    const selected = Number(bar.dataset.bar) === index;
    bar.classList.toggle('is-active', selected);
    bar.setAttribute('aria-pressed', String(selected));
  });
}
function handleAction(action) {
  switch (action) {
    case 'open-assistant': state.assistantOpen = true; render(); break;
    case 'close-assistant': state.assistantOpen = false; render(); break;
    case 'hide-toast': document.querySelector('#toast').hidden = true; break;
    case 'analyze': state.assistantOpen = matchMedia('(max-width: 1100px)').matches; navigate('agronomy'); sendQuestion('Analyze the current farm conditions', true); break;
    case 'optimize': state.assistantOpen = false; state.agronomyTab = 'care'; navigate('agronomy'); toast('Your field care recommendations are ready.'); break;
    case 'view-report': state.assistantOpen = false; state.agronomyTab = 'forecast'; navigate('agronomy'); break;
    case 'export-data': download('insecto-field-snapshot.csv', snapshotCSV(), 'text/csv'); toast('Field snapshot downloaded.'); break;
    case 'export-tasks': exportTasks(); break;
    case 'export-report': exportReport(); break;
    case 'export-zone': {
      const zone = zones.find((item) => item.id === state.selectedZone);
      download(`${zone.id.toLowerCase()}-field-data.csv`, snapshotCSV([zone]), 'text/csv'); toast('Field data downloaded.'); break;
    }
    case 'export-analytics': {
      const range = chartRanges[state.chartRange];
      download('insecto-crop-performance.csv', ['date,performance_percent,sector', ...chartValues().map((value, index) => [range.dates[index], value, state.analyticsSector].map(csvCell).join(','))].join('\r\n'), 'text/csv'); toast('Performance data downloaded.'); break;
    }
    case 'chart-table': state.chartTable = !state.chartTable; render(); break;
    case 'open-operations': state.fieldTab = 'operations'; state.fieldMode = 'list'; navigate('fields'); break;
    case 'field-list': state.fieldMode = 'list'; state.fieldTab = 'zones'; render(); break;
    case 'reset-fields': state.fieldSearch = ''; state.fieldSector = 'all'; state.fieldCrop = 'all'; state.fieldPage = 1; render(); break;
    case 'new-zone': openZoneEditor(false); break;
    case 'edit-zone': openZoneEditor(true); break;
    case 'cancel-editor': state.fieldMode = state.draft.existing ? 'detail' : 'list'; state.draft = null; render(); break;
    case 'new-task': openTaskEditor(); break;
    case 'cancel-task': state.fieldMode = 'list'; state.fieldTab = 'operations'; state.draft = null; render(); break;
    case 'zone-advice': state.assistantOpen = matchMedia('(max-width: 1100px)').matches; sendQuestion(`Review moisture and irrigation for ${state.selectedZone}`); render(); break;
    case 'import-fields': state.pendingImport = 'fields'; pickFile(); break;
    case 'import-document': state.pendingImport = 'documents'; pickFile(); break;
    case 'attach': state.pendingImport = 'attachment'; pickFile(); break;
    case 'reset-documents': state.documentSearch = ''; state.documentPage = 1; render(); break;
    case 'document-list': state.selectedDocument = null; render(); break;
    case 'next-chunk': state.documentChunk++; render(); break;
    case 'previous-chunk': state.documentChunk--; render(); break;
    case 'read-all': notifications.forEach((notification) => { notification.read = true; }); render(); toast('All notifications marked read.'); break;
    case 'connect-sensors': document.querySelector('#connection-feedback').textContent = 'No sensor service is configured. Import a field CSV to update the snapshot.'; break;
    case 'previous-answer': { const item = state.conversations[state.conversationIndex]; item.answerPage = Math.max(0, (item.answerPage || 0) - 1); renderConversation(); break; }
    case 'next-answer': { const item = state.conversations[state.conversationIndex]; item.answerPage = Math.min(item.paragraphs.length - 1, (item.answerPage || 0) + 1); renderConversation(); break; }
    case 'previous-chat': state.conversationIndex = Math.max(0, state.conversationIndex - 1); renderConversation(); break;
    case 'next-chat': state.conversationIndex = Math.min(state.conversations.length - 1, state.conversationIndex + 1); renderConversation(); break;
    case 'clear-chat':
      if (state.busy) { toast('Wait for the current analysis to finish.'); break; }
      state.conversations = [{ question: 'Give me an overview of my farm', paragraphs: [`Your field snapshot includes ${zones.length} production zones across 3 sectors.`, 'Ask about moisture, nutrition, leaf health or yield to review a field.'], label: 'Ready to review your fields' }];
      state.conversationIndex = 0; state.attachment = null; document.querySelector('#attachment-label').textContent = 'Attachment'; renderConversation(); break;
    case 'export-chat': download('insecto-agronomist-conversation.txt', state.conversations.map((item) => `YOU\n${item.question}\n\nAGRONOMIST\n${item.paragraphs.join('\n\n')}`).join('\n\n---\n\n')); toast('Conversation downloaded.'); break;
  }
}
function pickFile() {
  const input = document.querySelector('#file-input');
  input.accept = state.pendingImport === 'fields' ? '.csv,.json' : '.csv,.json,.txt';
  input.value = '';
  input.click();
}
function parseCSV(text) {
  const rows = [];
  let row = [], cell = '', quoted = false;
  const source = text.replace(/^﻿/, '');
  for (let index = 0; index < source.length; index++) {
    const character = source[index];
    if (character === '"') {
      if (quoted && source[index + 1] === '"') { cell += '"'; index++; }
      else if (quoted || cell === '') quoted = !quoted;
      else throw new Error('Invalid CSV quoting.');
    } else if (character === ',' && !quoted) { row.push(cell); cell = ''; }
    else if ((character === '\n' || character === '\r') && !quoted) {
      if (character === '\r' && source[index + 1] === '\n') index++;
      row.push(cell); if (row.some((value) => value.trim())) rows.push(row); row = []; cell = '';
    } else cell += character;
  }
  if (quoted) throw new Error('A quoted CSV cell is not closed.');
  row.push(cell); if (row.some((value) => value.trim())) rows.push(row);
  if (rows.length < 2) throw new Error('The CSV needs a header and at least one field.');
  const keys = rows.shift().map((key) => key.trim().toLowerCase());
  if (new Set(keys).size !== keys.length) throw new Error('CSV headers must be unique.');
  return rows.map((values) => {
    if (values.length !== keys.length) throw new Error('CSV rows must match the header columns.');
    const result = Object.create(null);
    keys.forEach((key, index) => { result[key] = values[index]; });
    return result;
  });
}
function normalizeFields(records) {
  if (!Array.isArray(records) || !records.length || records.length > 200) throw new Error('Import 1–200 fields at a time.');
  const seen = new Set();
  return records.map((record) => {
    if (!record || typeof record !== 'object') throw new Error('Each field must be a data record.');
    const id = String(record.id || '').trim().toUpperCase();
    const name = String(record.name || '').trim();
    const crop = String(record.crop || '').trim().toLowerCase();
    const sector = String(record.sector || '').trim().toUpperCase();
    if (!/^[A-Z0-9-]{1,12}$/.test(id) || seen.has(id)) throw new Error('Each field needs a unique ID, using 1–12 letters, digits or hyphens.');
    if (!name || name.length > 48) throw new Error('Field names must contain 1–48 characters.');
    if (!Object.hasOwn(fruits, crop) || !['A', 'B', 'C'].includes(sector)) throw new Error('Use crop tomato, citrus or vineyard, and sector A, B or C.');
    const result = { id, name, crop, sector };
    const limits = { area: [.1, 1000, null], moisture: [0, 100, null], nitrogen: [0, 100, 70], par: [0, 3000, 1000], yield: [0, 10000, 0], risk: [0, 100, 5] };
    for (const [key, [min, max, fallback]] of Object.entries(limits)) {
      const raw = record[key];
      const number = raw === undefined || raw === '' || raw === null ? fallback : Number(raw);
      if (number === null || !Number.isFinite(number) || number < min || number > max) throw new Error(`${id}: ${key} must be between ${min} and ${max}.`);
      result[key] = number;
    }
    seen.add(id);
    return result;
  });
}
async function importFile(file) {
  const mode = state.pendingImport;
  const extension = file.name.split('.').at(-1).toLowerCase();
  if (!(mode === 'fields' ? ['csv', 'json'] : ['csv', 'json', 'txt']).includes(extension) || file.size > 1024 * 1024 || !file.size) { toast('Choose a non-empty CSV, JSON or TXT file up to 1 MB.', true); return; }
  const trigger = document.querySelector(`[data-action="${mode === 'fields' ? 'import-fields' : mode === 'documents' ? 'import-document' : 'attach'}"]`);
  if (trigger) { trigger.disabled = true; trigger.setAttribute('aria-busy', 'true'); }
  try {
    const text = await file.text();
    if (mode === 'fields') {
      const parsed = extension === 'json' ? JSON.parse(text.replace(/^﻿/, '')) : parseCSV(text);
      const incoming = normalizeFields(Array.isArray(parsed) ? parsed : parsed.zones);
      for (const item of incoming) {
        const index = zones.findIndex((zone) => zone.id === item.id);
        if (index >= 0) zones[index] = { ...zones[index], ...item }; else zones.push(item);
      }
      state.fieldMode = 'list'; state.fieldTab = 'zones'; state.fieldPage = 1; state.fieldSearch = ''; state.fieldSector = 'all'; state.fieldCrop = 'all';
      toast(`${incoming.length} fields imported into the snapshot.`);
    } else if (mode === 'attachment') {
      if (extension === 'json') JSON.parse(text);
      state.attachment = { name: file.name, content: text, kind: extension };
      document.querySelector('#attachment-label').textContent = file.name;
      document.querySelector('#chat-input').value = `Review the attached file: ${file.name}`.slice(0, 180);
      toast('File attached to this conversation.');
    } else {
      if (extension === 'json') JSON.parse(text);
      documents.unshift({ id: `doc-${Date.now()}-${documents.length}`, name: file.name.replace(/\.[^.]+$/, ''), filename: file.name, content: text, category: 'Imported file', date: 'This session', kind: extension });
      state.documentSearch = ''; state.documentPage = 1;
      toast('File added to Documents.');
    }
    render();
  } catch (error) { toast(error instanceof SyntaxError ? 'This JSON file is invalid. Check its format and try again.' : error.message, true); }
  finally { if (trigger?.isConnected) { trigger.disabled = false; trigger.removeAttribute('aria-busy'); } }
}
function formError(form, feedbackId, message, field) {
  const feedback = document.querySelector(`#${feedbackId}`);
  feedback.textContent = message;
  feedback.classList.add('error');
  form.querySelectorAll('[aria-invalid]').forEach((input) => input.removeAttribute('aria-invalid'));
  if (field) { const input = form.elements[field]; input.setAttribute('aria-invalid', 'true'); input.focus(); }
}
function validTime(time) { return /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(time); }
function validDate(date) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const parsed = new Date(`${date}T00:00:00Z`);
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === date;
}
async function submitForm(form) {
  const data = Object.fromEntries(new FormData(form));
  if (form.id === 'chat-form') {
    const input = document.querySelector('#chat-input');
    const question = input.value.trim();
    const feedback = document.querySelector('#composer-error');
    if (!question) { feedback.textContent = 'Write a question before sending.'; feedback.hidden = false; input.focus(); return; }
    feedback.hidden = true;
    input.value = '';
    if (state.attachment) {
      const attachment = state.attachment;
      await sendQuestion(question);
      const item = state.conversations.at(-1);
      item.label = `File review · ${attachment.name}`;
      item.paragraphs = [`Attached ${attachment.kind.toUpperCase()} contains ${attachment.content.split(/\r?\n/).length} lines. It is available locally for review.`, 'To analyze field readings, import a CSV or JSON snapshot in Fields. Required columns: id, name, crop, sector, area and moisture.'];
      renderConversation();
    } else await sendQuestion(question);
    return;
  }
  if (form.id === 'zone-form') {
    const name = data.name.trim();
    if (!name) return formError(form, 'zone-feedback', 'Give this field a name.', 'name');
    const values = { area: Number(data.area), moisture: Number(data.moisture), nitrogen: Number(data.nitrogen), yield: Number(data.yield) };
    for (const [key, [min, max]] of Object.entries({ area: [.1, 1000], moisture: [0, 100], nitrogen: [0, 100], yield: [0, 10000] })) {
      if (data[key].trim() === '' || !Number.isFinite(values[key]) || values[key] < min || values[key] > max) return formError(form, 'zone-feedback', `${key === 'area' ? 'Area' : key === 'moisture' ? 'Moisture' : key === 'nitrogen' ? 'Nitrogen index' : 'Yield'} must be between ${min} and ${max}.`, key);
    }
    const draft = state.draft;
    const submit = form.querySelector('[type="submit"]');
    submit.disabled = true; submit.textContent = 'Saving...';
    await new Promise((resolve) => setTimeout(resolve, 220));
    if (state.draft !== draft || state.fieldMode !== 'editor') return;
    if (draft.existing) {
      const zone = zones.find((item) => item.id === draft.id);
      Object.assign(zone, { name, crop: draft.crop, sector: draft.sector, ...values });
      state.selectedZone = zone.id;
    } else {
      let id;
      do { id = `${draft.sector}${state.nextZone++}`; } while (zones.some((zone) => zone.id === id));
      zones.push({ id, name, crop: draft.crop, sector: draft.sector, ...values, par: 1000, risk: 5 });
      state.selectedZone = id;
    }
    state.fieldMode = 'detail'; state.draft = null; navigate('fields'); toast('Field saved.');
    return;
  }
  if (form.id === 'task-form') {
    if (!data.title.trim()) return formError(form, 'task-feedback', 'Add a task for the field team.', 'title');
    if (!validDate(data.date)) return formError(form, 'task-feedback', 'Use a valid date in YYYY-MM-DD format.', 'date');
    if (!validTime(data.time)) return formError(form, 'task-feedback', 'Use 24-hour time, for example 08:00.', 'time');
    tasks.unshift({ id: `task-${Date.now()}-${tasks.length}`, title: data.title.trim(), note: data.note.trim() || `${state.draft.type} · field care`, zone: state.draft.zone, type: state.draft.type, date: data.date, time: data.time, done: false, progress: 0 });
    state.fieldMode = 'list'; state.fieldTab = 'operations'; state.taskPage = 1; state.taskFilter = 'all'; state.draft = null; render(); toast('Field task scheduled.');
    return;
  }
  if (form.id === 'irrigation-form') {
    if (data.duration.trim() === '' || !Number.isFinite(Number(data.duration)) || Number(data.duration) < 5 || Number(data.duration) > 240) return formError(form, 'irrigation-feedback', 'Choose a duration between 5 and 240 minutes.', 'duration');
    if (!validTime(data.time)) return formError(form, 'irrigation-feedback', 'Use 24-hour time, for example 06:00.', 'time');
    const zone = zones.find((item) => item.id === state.selectedZone);
    zone.plan = { flow: Number(data.flow), duration: Number(data.duration), time: data.time };
    const existing = tasks.find((task) => task.zone === zone.id && task.type === 'Irrigation' && !task.done);
    const details = `${data.flow} L/min · ${data.duration} min · field execution pending`;
    if (existing) { existing.note = details; existing.time = data.time; }
    else tasks.unshift({ id: `task-${Date.now()}-${tasks.length}`, zone: zone.id, title: `Irrigate ${zone.id}`, note: details, date: '2026-03-24', time: data.time, progress: 0, done: false, type: 'Irrigation' });
    const feedback = document.querySelector('#irrigation-feedback'); feedback.classList.remove('error'); feedback.textContent = 'Plan saved. Awaiting execution by the field team.';
    form.querySelectorAll('[aria-invalid]').forEach((input) => input.removeAttribute('aria-invalid'));
    toast('Irrigation plan added to field operations.');
    return;
  }
  if (form.id === 'profile-form') {
    if (!data.farm.trim()) return formError(form, 'profile-feedback', 'Enter a farm name.', 'farm');
    if (!data.manager.trim()) return formError(form, 'profile-feedback', 'Enter the farm manager’s name.', 'manager');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return formError(form, 'profile-feedback', 'Enter a valid email address.', 'email');
    Object.assign(state.profile, { farm: data.farm.trim(), manager: data.manager.trim(), email: data.email.trim() });
    state.profileDraft = null;
    const initials = state.profile.manager.split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase();
    document.querySelector('.avatar-button span').textContent = initials;
    document.querySelector('.avatar-button').setAttribute('aria-label', `Profile of ${state.profile.manager}`);
    const feedback = document.querySelector('#profile-feedback'); feedback.classList.remove('error'); feedback.textContent = 'Farm profile updated for this session.';
    form.querySelectorAll('[aria-invalid]').forEach((input) => input.removeAttribute('aria-invalid'));
  }
}
function start() {
  if (state.started) return;
  state.started = true;
  state.page = validPages.includes(location.hash.slice(1)) ? location.hash.slice(1) : 'overview';
  document.addEventListener('click', (event) => {
    const control = event.target.closest('button, a[data-nav]');
    if (!event.target.closest('.dropdown')) closeMenus();
    if (!control || control.disabled) return;
    if (control.dataset.nav) { event.preventDefault(); state.assistantOpen = false; state.fieldMode = 'list'; state.selectedDocument = null; navigate(control.dataset.nav); return; }
    if (control.dataset.featuredStep) { state.featured = (state.featured + Number(control.dataset.featuredStep) + 3) % 3; render(); return; }
    if (control.dataset.menu) {
      const panel = document.getElementById(control.dataset.menu);
      const wasHidden = panel.hidden;
      closeMenus(); panel.hidden = !wasHidden; control.setAttribute('aria-expanded', String(wasHidden));
      return;
    }
    if (control.dataset.pickerStep) {
      state.zonePickerPage = Math.max(0, Math.min(Math.ceil(zones.length / 8) - 1, state.zonePickerPage + Number(control.dataset.pickerStep)));
      const panel = document.querySelector('#task-zone-menu');
      panel.innerHTML = zoneChoices();
      panel.querySelectorAll('button').forEach((button) => { button.type = 'button'; });
      return;
    }
    if (control.dataset.set) return setValue(control.dataset.set, control.dataset.value);
    if (control.dataset.openZone) return openZone(control.dataset.openZone);
    if (control.dataset.task) return toggleTask(control.dataset.task);
    if (control.dataset.schedule) return scheduleRecommendation(control.dataset.schedule);
    if (control.dataset.bar !== undefined) return setBar(Number(control.dataset.bar));
    if (control.dataset.document) { state.selectedDocument = control.dataset.document; state.documentChunk = 0; render(); return; }
    if (control.dataset.downloadDocument) {
      const document = documents.find((item) => item.id === control.dataset.downloadDocument);
      download(document.filename, document.content, document.kind === 'csv' ? 'text/csv' : 'text/plain'); toast('Document downloaded.'); return;
    }
    if (control.dataset.read) { const notification = notifications.find((item) => item.id === control.dataset.read); notification.read = !notification.read; render(); return; }
    if (control.dataset.notificationOpen) {
      const notification = notifications.find((item) => item.id === control.dataset.notificationOpen);
      notification.read = true; updateUnread();
      if (notification.zone) openZone(notification.zone); else navigate(notification.page);
      return;
    }
    if (control.dataset.setting) { const key = control.dataset.setting; state.settings[key] = !state.settings[key]; render(); return; }
    if (control.dataset.pageStep) { state[control.dataset.pageStep] += Number(control.dataset.step); render(); return; }
    if (control.dataset.trend !== undefined) {
      const index = Number(control.dataset.trend);
      const months = ['January', 'February', 'March', 'April'];
      const values = [42, 35, 65, 73];
      document.querySelectorAll('[data-trend]').forEach((button) => button.classList.toggle('is-active', button === control));
      const readout = document.querySelector('#trend-readout'); readout.hidden = false; readout.textContent = `${months[index]} · ${values[index]}%${index === 3 ? ' forecast' : ''}`;
      return;
    }
    if (control.dataset.action) handleAction(control.dataset.action);
  });
  document.addEventListener('input', (event) => {
    if (event.target.id === 'field-search') { state.fieldSearch = event.target.value; state.fieldPage = 1; document.querySelector('#field-results').innerHTML = fieldResults(); }
    if (event.target.id === 'document-search') { state.documentSearch = event.target.value; state.documentPage = 1; document.querySelector('#document-results').innerHTML = documentResults(); }
    if (event.target.id === 'flow') document.querySelector('#flow-value').textContent = `${event.target.value} L/min`;
    if (event.target.id === 'chat-input') document.querySelector('#composer-error').hidden = true;
    if (event.target.closest('#zone-form, #task-form') && state.draft) state.draft[event.target.name] = event.target.value;
    if (event.target.closest('#profile-form')) { state.profileDraft ||= { ...state.profile }; state.profileDraft[event.target.name] = event.target.value; }
  });
  document.addEventListener('pointerover', (event) => {
    const bar = event.target.closest('[data-bar]');
    if (bar) setBar(Number(bar.dataset.bar));
  });
  document.addEventListener('focusin', (event) => { if (event.target.dataset.bar !== undefined) setBar(Number(event.target.dataset.bar)); });
  document.addEventListener('submit', (event) => { event.preventDefault(); submitForm(event.target); });
  document.querySelector('#file-input').addEventListener('change', (event) => { const file = event.target.files[0]; if (file) importFile(file); });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') { const owner = event.target.closest('.dropdown')?.querySelector('[data-menu]'); closeMenus(); owner?.focus(); document.querySelector('#composer-error').hidden = true; }
    if (event.target.id === 'chat-input' && event.key === 'Enter' && !event.shiftKey && !event.isComposing) { event.preventDefault(); document.querySelector('#chat-form').requestSubmit(); }
    if (event.target.matches('[data-menu]') && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
      event.preventDefault(); closeMenus(); const panel = document.getElementById(event.target.dataset.menu); panel.hidden = false; event.target.setAttribute('aria-expanded', 'true'); panel.querySelector('button:not(:disabled)')?.focus();
    }
    const panel = event.target.closest('.dropdown-panel');
    if (panel && ['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
      event.preventDefault(); const options = [...panel.querySelectorAll('button:not(:disabled)')]; const index = options.indexOf(event.target); const next = event.key === 'Home' ? 0 : event.key === 'End' ? options.length - 1 : (index + (event.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length; options[next]?.focus();
    }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); document.querySelector('#chat-input').focus(); if (matchMedia('(max-width: 640px)').matches) navigate('agronomy'); }
  });
  window.addEventListener('hashchange', () => { state.page = validPages.includes(location.hash.slice(1)) ? location.hash.slice(1) : 'overview'; render(); });
  render();
  renderConversation();
}
start();
