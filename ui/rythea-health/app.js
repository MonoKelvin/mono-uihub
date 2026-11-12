(() => {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const app = $('#app');
  const referenceDate = new Date('2025-02-12T12:00:00');
  const currentWeek = [66, 68, 78, 73, 69, 80, 70];
  const previousWeek = [72, 81, 76, 78, 75, 87, 77];
  const olderWeek = [77, 83, 78, 82, 78, 85, 77];
  const workout = [79, 83, 91, 102, 115, 121, 127, 123, 117, 108, 98, 89, 82, 79];
  const digits = {
    '0': ['01110', '10001', '10011', '10101', '11001', '10001', '01110'],
    '1': ['00100', '01100', '00100', '00100', '00100', '00100', '01110'],
    '2': ['01110', '10001', '00001', '00010', '00100', '01000', '11111'],
    '3': ['11110', '00001', '00001', '01110', '00001', '00001', '11110'],
    '4': ['00010', '00110', '01010', '10010', '11111', '00010', '00010'],
    '5': ['11111', '10000', '10000', '11110', '00001', '00001', '11110'],
    '6': ['01110', '10000', '10000', '11110', '10001', '10001', '01110'],
    '7': ['11111', '00001', '00010', '00100', '01000', '01000', '01000'],
    '8': ['01110', '10001', '10001', '01110', '10001', '10001', '01110'],
    '9': ['01110', '10001', '10001', '01111', '00001', '00001', '01110'],
    '-': ['00000', '00000', '00000', '11111', '00000', '00000', '00000']
  };
  const state = {
    view: 'dashboard',
    healthTab: 'heart',
    profileTab: 'personal',
    profile: { name: 'Ryan Walker', email: 'ryan.cooper@gmail.com', birth: '20/07/1985', gender: 'Male', phone: '(444)-678-8721', id: '3KF2-DW90D-8A1' },
    editingGender: 'Male',
    profileSaving: false,
    allergies: [{ id: 'penicillin', name: 'Penicillin', note: 'Skin rash', severity: 'Moderate' }, { id: 'pollen', name: 'Pollen', note: 'Seasonal rhinitis', severity: 'Mild' }],
    diagnoses: [{ id: 'hypertension', name: 'Hypertension', note: 'Reviewed Feb 5, 2025' }, { id: 'cholesterol', name: 'High cholesterol', note: 'Reviewed Jan 21, 2025' }, { id: 'migraine', name: 'Migraine', note: 'Reviewed Dec 18, 2024' }, { id: 'vitamin-d', name: 'Vitamin D deficiency', note: 'Reviewed Dec 18, 2024' }],
    device: { name: 'Apple Watch', model: 'Series X', battery: 84 },
    discovery: false,
    deviceBusy: false,
    settings: { privacy: false, motion: false, contrast: false },
    history: { period: 'february', rhythm: 'all', query: '', page: 0 },
    insights: { period: 'current', tab: 'resting', mode: 'chart' },
    selectedId: 'ecg-0212',
    recordMode: 'chart',
    signalPage: 0,
    playback: { running: false, elapsed: 0, started: 0, frame: 0 },
    records: [],
    dropdown: null,
    menuAnchor: null,
    dialog: null,
    toastTimer: 0,
    searchIndex: 0,
    importBusy: false
  };

  function escape(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
  }

  function icon(name) { return `<i class="ti ti-${name}" aria-hidden="true"></i>`; }
  function average(values) { return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length); }
  function dateLabel(date, long = false) { return new Date(date).toLocaleDateString('en-US', { month: long ? 'long' : 'short', day: 'numeric', year: 'numeric' }); }
  function timeLabel(date) { return new Date(date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }); }
  function durationLabel(seconds) { return `${Math.floor(seconds / 60)} m ${Math.round(seconds % 60)} s`; }
  function clock(seconds) { return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`; }
  function selectedRecord() { return state.records.find((record) => record.id === state.selectedId) || state.records[0]; }
  function age(birth) {
    const [day, month, year] = birth.split('/').map(Number);
    return referenceDate.getFullYear() - year - (referenceDate.getMonth() + 1 < month || (referenceDate.getMonth() + 1 === month && referenceDate.getDate() < day) ? 1 : 0);
  }

  function makeSignal(bpm, duration, seed) {
    const period = 60 / bpm;
    const gaussian = (x, center, width) => Math.exp(-((x - center) ** 2) / (2 * width ** 2));
    return Array.from({ length: duration * 50 + 1 }, (_, index) => {
      const time = index / 50;
      const phase = (time % period) / period;
      const voltage = .13 * gaussian(phase, .16, .045) - .13 * gaussian(phase, .345, .016) + 1.05 * gaussian(phase, .385, .014) - .3 * gaussian(phase, .425, .018) + .25 * gaussian(phase, .65, .075) + .009 * Math.sin(time * 8 + seed);
      return { time, voltage: Math.round(voltage * 1000) / 1000 };
    });
  }

  state.records = [
    ['ecg-0212', '2025-02-12T08:42:00', 90, 89, 'Normal'],
    ['ecg-0210', '2025-02-10T07:18:00', 60, 73, 'Normal'],
    ['ecg-0208', '2025-02-08T19:06:00', 90, 83, 'Normal'],
    ['ecg-0205', '2025-02-05T08:35:00', 90, 85, 'Normal'],
    ['ecg-0202', '2025-02-02T21:12:00', 60, 102, 'Needs review'],
    ['ecg-0125', '2025-01-25T09:20:00', 30, 76, 'Normal']
  ].map(([id, date, duration, bpm, rhythm], index) => ({ id, date, duration, bpm, rhythm, device: 'Apple Watch', samples: makeSignal(bpm, duration, index), note: 'Lead I · Recorded while resting. The signal view shows the first 6 seconds.' }));

  function svgNode(tag, attributes = {}) {
    const element = document.createElementNS('http://www.w3.org/2000/svg', tag);
    Object.entries(attributes).forEach(([name, value]) => element.setAttribute(name, value));
    return element;
  }

  function renderDigits(element, value) {
    const text = String(value ?? '--');
    element.dataset.value = text;
    element.setAttribute('role', 'img');
    element.setAttribute('aria-label', text);
    const svg = svgNode('svg', { viewBox: `0 0 ${text.length * 30 - 3} 34`, 'aria-hidden': 'true' });
    [...text].forEach((character, index) => {
      (digits[character] || digits['-']).forEach((row, y) => [...row].forEach((pixel, x) => {
        if (pixel === '1') svg.append(svgNode('circle', { cx: index * 30 + x * 5 + 2, cy: y * 5 + 2, r: 1.98 }));
      }));
    });
    element.replaceChildren(svg);
  }

  function refreshDigits(root = app) { $$('.dot-number[data-value]', root).forEach((element) => renderDigits(element, element.dataset.value)); }

  function tooltip(element, svg, points, labels, valueLabel, series = []) {
    const tip = document.createElement('div');
    tip.className = 'chart-tooltip';
    tip.hidden = true;
    const crosshair = svgNode('line', { class: 'chart-crosshair', y1: 0, y2: svg.viewBox.baseVal.height, visibility: 'hidden' });
    const marker = svgNode('circle', { class: 'chart-hover-dot', r: 4.5, visibility: 'hidden' });
    svg.append(crosshair, marker);
    element.append(tip);
    let index = 0;
    const show = (target) => {
      index = Math.max(0, Math.min(points.length - 1, target));
      const point = points[index];
      crosshair.setAttribute('x1', point.x);
      crosshair.setAttribute('x2', point.x);
      crosshair.setAttribute('visibility', 'visible');
      marker.setAttribute('cx', point.x);
      marker.setAttribute('cy', point.y);
      marker.setAttribute('visibility', 'visible');
      tip.replaceChildren();
      const strong = document.createElement('strong');
      strong.textContent = valueLabel(index);
      tip.append(strong, document.createTextNode(` · ${labels[index]}`));
      series.forEach((entry) => {
        const row = document.createElement('div');
        row.textContent = `${entry.label}: ${entry.values[index]} bpm`;
        tip.append(row);
      });
      tip.hidden = false;
      const box = element.getBoundingClientRect();
      const canvasWidth = app.getBoundingClientRect().width;
      const x = point.x / svg.viewBox.baseVal.width * box.width;
      const left = Math.max(0, Math.min(box.width - tip.offsetWidth, x - tip.offsetWidth / 2));
      tip.style.left = `${left / canvasWidth * 100}cqw`;
      tip.style.top = `${-(tip.offsetHeight / canvasWidth * 100 + .6)}cqw`;
    };
    const hide = () => { tip.hidden = true; crosshair.setAttribute('visibility', 'hidden'); marker.setAttribute('visibility', 'hidden'); };
    element.onpointermove = (event) => {
      const box = element.getBoundingClientRect();
      const logicalX = (event.clientX - box.left) / box.width * svg.viewBox.baseVal.width;
      const first = points[0].x;
      const last = points[points.length - 1].x;
      show(Math.round((logicalX - first) / (last - first || 1) * (points.length - 1)));
    };
    element.onpointerleave = hide;
    element.onfocus = () => show(0);
    element.onblur = hide;
    element.onkeydown = (event) => {
      if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
        event.preventDefault();
        show(event.key === 'Home' ? 0 : event.key === 'End' ? points.length - 1 : index + (event.key === 'ArrowRight' ? 1 : -1));
      }
    };
  }

  function drawDotChart(element, values, labels, { rows = 10, min = 0, max = 1.1, context = false, unit = 'mV' } = {}) {
    const step = context ? 8 : 10;
    const height = rows * step + 4;
    const width = values.length * step + 4;
    const svg = svgNode('svg', { viewBox: `0 0 ${width} ${height}`, 'aria-hidden': 'true' });
    const points = values.map((value, index) => {
      const count = Math.max(context ? 1 : 2, Math.min(rows, Math.round((value - min) / (max - min) * rows)));
      for (let row = 0; row < rows; row++) {
        if (row < count || context) svg.append(svgNode('circle', { cx: index * step + step / 2 + 2, cy: height - row * step - step / 2 - 2, r: context ? 1.65 : 2.8, class: row < count ? 'chart-point' : 'chart-context-dot' }));
      }
      return { x: index * step + step / 2 + 2, y: height - (count - 1) * step - step / 2 - 2 };
    });
    element.replaceChildren(svg);
    tooltip(element, svg, points, labels, (index) => `${unit === 'mV' ? values[index].toFixed(2) : values[index]} ${unit}`);
  }

  function drawLineChart(element, values, labels, { min = 55, max = 95, context = null, times = null, unit = 'bpm' } = {}) {
    const width = 720;
    const height = 315;
    const area = { left: 51, right: 28, top: 27, bottom: 44 };
    const plotWidth = width - area.left - area.right;
    const plotHeight = height - area.top - area.bottom;
    const point = (value, index) => ({ x: area.left + index / Math.max(1, values.length - 1) * plotWidth, y: area.top + (1 - (value - min) / (max - min)) * plotHeight });
    const svg = svgNode('svg', { viewBox: `0 0 ${width} ${height}`, 'aria-hidden': 'true' });
    const tickCount = unit === 'mV' ? 4 : 3;
    for (let index = 0; index <= tickCount; index++) {
      const value = min + (max - min) * index / tickCount;
      const y = area.top + (1 - index / tickCount) * plotHeight;
      svg.append(svgNode('line', { x1: area.left, x2: width - area.right, y1: y, y2: y, class: 'plot-grid' }));
      const label = svgNode('text', { x: area.left - 12, y: y + 5, 'text-anchor': 'end', 'font-size': 15 });
      label.textContent = unit === 'mV' ? value.toFixed(1) : Math.round(value);
      svg.append(label);
    }
    const labelIndexes = values.length > 14 ? Array.from({ length: 7 }, (_, index) => Math.round(index / 6 * (values.length - 1))) : values.map((_, index) => index).filter((index) => values.length <= 7 || index % 2 === 0 || index === values.length - 1);
    labelIndexes.forEach((index) => {
      const text = svgNode('text', { x: point(values[index], index).x, y: height - 12, 'text-anchor': 'middle', 'font-size': 15 });
      text.textContent = times ? `${times[index].toFixed(0)}s` : labels[index];
      svg.append(text);
    });
    const path = (data) => data.map((value, index) => { const location = point(value, index); return `${index ? 'L' : 'M'}${location.x.toFixed(2)},${location.y.toFixed(2)}`; }).join(' ');
    if (context) svg.append(svgNode('path', { d: path(context.values), class: 'plot-context' }));
    svg.append(svgNode('path', { d: path(values), class: 'plot-series' }));
    if (!times) values.forEach((value, index) => {
      if (values.length <= 14) svg.append(svgNode('circle', { ...point(value, index), cx: point(value, index).x, cy: point(value, index).y, r: 4, class: 'chart-hover-dot' }));
    });
    element.replaceChildren(svg);
    tooltip(element, svg, values.map(point), labels, (index) => `${unit === 'mV' ? values[index].toFixed(3) : values[index]} ${unit}`, context ? [context] : []);
    return svg;
  }

  function drawAura() {
    const canvas = $('#record-aura');
    const context = canvas.getContext('2d');
    const size = canvas.width;
    const brand = getComputedStyle(app).getPropertyValue('--brand').trim();
    context.clearRect(0, 0, size, size);
    context.strokeStyle = brand;
    context.fillStyle = brand;
    const center = size / 2;
    for (let strand = 0; strand < 30; strand++) {
      context.beginPath();
      for (let step = 0; step <= 400; step++) {
        const angle = step / 400 * Math.PI * 2;
        const radius = 174 + Math.sin(angle * 5 + strand * .43) * 10 + Math.sin(angle * 11 - strand * .3) * 6 + (strand - 8) * .85;
        const x = center + Math.cos(angle) * radius;
        const y = center + Math.sin(angle) * radius;
        if (!step) context.moveTo(x, y); else context.lineTo(x, y);
      }
      context.globalAlpha = .24 + strand % 4 * .045;
      context.lineWidth = strand % 4 === 0 ? 1.2 : .65;
      context.stroke();
    }
    for (let index = 0; index < 380; index++) {
      const angle = index * 2.39996;
      const radius = 176 + Math.sin(index * 12.38) * 16;
      context.fillStyle = `rgba(255, 55, 68, ${.12 + index % 5 * .055})`;
      context.beginPath();
      context.arc(center + Math.cos(angle) * radius, center + Math.sin(angle) * radius, index % 8 === 0 ? 1.3 : .65, 0, Math.PI * 2);
      context.fill();
    }
  }

  function renderDashboard() {
    const profile = state.profile;
    const privateView = state.settings.privacy;
    $('#dashboard-name').textContent = privateView ? 'Your Profile' : profile.name;
    $('#dashboard-name').classList.toggle('is-long', profile.name.length > 20);
    $('#dashboard-name').setAttribute('aria-label', privateView ? 'Open your profile' : `Open profile for ${profile.name}`);
    $('#dashboard-email').textContent = privateView ? 'Contact details hidden' : profile.email;
    $('#dashboard-email').setAttribute('aria-label', privateView ? 'Edit contact details' : profile.email);
    $('#dashboard-age').textContent = `${age(profile.birth)} years`;
    $('#dashboard-birth').textContent = privateView ? '••/••/••••' : profile.birth;
    $('#dashboard-gender').textContent = profile.gender;
    $('#dashboard-phone').textContent = privateView ? '•••-•••-••••' : profile.phone;
    $('#dashboard-patient-id').textContent = privateView ? '••••-••••-•••' : profile.id;
    $('#profile-photo-name').textContent = privateView ? 'Your Profile' : profile.name;
    $('#profile-photo-age').textContent = `${age(profile.birth)} years`;
    $$('.patient-portrait, .profile-photo-panel img').forEach((image) => image.alt = privateView ? '' : profile.name);
    app.classList.toggle('private-details', privateView);
    const latest = state.records[0];
    $('#ecg-summary').hidden = !latest;
    $('#dashboard-ecg-chart').hidden = !latest;
    $('#ecg-empty').hidden = Boolean(latest);
    $$('.ecg-card .card-actions button').forEach((button) => button.disabled = !latest);
    $('#ecg-last-check').textContent = latest ? `Last Check · ${dateLabel(latest.date)}` : 'Your heart checks, in one place.';
    if (latest) {
      $('#ecg-duration').textContent = durationLabel(latest.duration);
      $('#ecg-status').textContent = latest.rhythm;
      $('#ecg-device').textContent = latest.device;
      renderDigits($('#ecg-bpm'), latest.bpm);
      const sample = latest.samples.filter((point) => point.time <= 6);
      const peaks = Array.from({ length: 68 }, (_, index) => {
        const start = Math.floor(index / 68 * sample.length);
        const end = Math.max(start + 1, Math.floor((index + 1) / 68 * sample.length));
        return Math.max(...sample.slice(start, end).map((point) => Math.abs(point.voltage)));
      });
      const values = peaks.map((value, index) => (value + .6 * (peaks[index - 1] ?? value) + .6 * (peaks[index + 1] ?? value)) / 2.2);
      const labels = values.map((_, index) => `${(index / 67 * sample[sample.length - 1].time).toFixed(2)} s`);
      drawDotChart($('#dashboard-ecg-chart'), values, labels, { rows: 11, max: Math.max(...values) + .04 });
      $('#dashboard-ecg-chart').setAttribute('aria-label', `ECG signal, ${latest.rhythm}, ${latest.bpm ?? 'unavailable'} bpm. The first 6 seconds of the recording.`);
    }
    const earlier = state.records.find((record) => record.id === 'ecg-0205') || latest;
    const card = $('.record-card');
    renderDigits($('.record-reading .dot-number', card), earlier?.bpm);
    $('.last-check', card).textContent = earlier ? `Last Check · ${dateLabel(earlier.date)}` : 'No saved recordings';
    $('#dashboard-device-count').textContent = `Devices (${state.device ? 1 : 0})`;
    $('#dashboard-device-last').textContent = state.device ? 'Last Connected · 2 days ago' : 'No device connected';
    $('#dashboard-watch-image').hidden = !state.device;
    $('#dashboard-device-name').hidden = !state.device;
    $('#dashboard-device-empty').hidden = Boolean(state.device);
    $('#allergy-count').textContent = state.allergies.length;
    $('#diagnosis-count').textContent = state.diagnoses.length;
    const expanded = (week) => week.flatMap((value) => [value - 4, value + 4, value + 7, value - 7]);
    const labels = (offset) => Array.from({ length: 28 }, (_, index) => {
      const date = new Date(2025, 1, 6 - offset + Math.floor(index / 4));
      return `${date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} ${['8:00 AM', '11:00 AM', '2:00 PM', '8:00 PM'][index % 4]}`;
    });
    drawDotChart($('#current-week-chart'), expanded(currentWeek), labels(0), { context: true, rows: 9, min: 55, max: 96, unit: 'bpm' });
    drawDotChart($('#previous-week-chart'), expanded(previousWeek), labels(7), { context: true, rows: 9, min: 55, max: 96, unit: 'bpm' });
    renderCompactHealth();
  }

  function renderCompactHealth() {
    const render = (kind, records, title) => {
      const panel = $(`#panel-${kind}`);
      panel.innerHTML = `<h3>${title}</h3>${records.length ? records.map((record) => `<div class="compact-record"><div><strong>${escape(record.name)}</strong><p>${escape(record.note)}</p></div><span class="status-label">${escape(record.severity || 'On file')}</span></div>`).join('') : '<div class="empty-state"><h3>No records on file</h3><p>Add a health record to keep your profile up to date.</p></div>'}<button class="small-button" data-action="manage-health">Manage health profile ${icon('arrow-up-right')}</button>`;
    };
    render('allergies', state.allergies, 'A little more about you.');
    render('diagnoses', state.diagnoses, 'Your health, on file.');
  }

  function switchHealthTab(tab) {
    state.healthTab = tab;
    $$('.health-tab').forEach((button) => { const active = button.dataset.healthTab === tab; button.classList.toggle('is-active', active); button.setAttribute('aria-selected', active); button.tabIndex = active ? 0 : -1; });
    $$('.health-panel').forEach((panel) => panel.hidden = panel.id !== `panel-${tab}`);
  }

  function navigate(view) {
    if (!$('#view-' + view)) return;
    if (state.view !== view) pause();
    state.view = view;
    closeDropdown(false);
    closeMenu(false);
    closeSearch();
    $$('.view').forEach((element) => element.hidden = element.id !== `view-${view}`);
    const activeNav = view === 'recording' ? 'history' : view === 'settings' ? 'profile' : view;
    $$('.dock-button').forEach((button) => {
      const active = button.dataset.view === activeNav;
      button.classList.toggle('is-active', active);
      if (active) button.setAttribute('aria-current', 'page'); else button.removeAttribute('aria-current');
    });
    $('#dock-label').textContent = { dashboard: 'Dashboard', history: 'History', recording: 'History', devices: 'Devices', insights: 'Heart Rate', profile: 'Profile', settings: 'Preferences' }[view];
    ({ dashboard: renderDashboard, history: renderHistory, recording: renderRecording, devices: renderDevices, insights: renderInsights, profile: renderProfile, settings: renderSettings }[view])();
  }

  function filteredRecords() {
    return state.records.filter((record) => {
      const date = new Date(record.date);
      const periodMatch = state.history.period === 'all' || (date.getFullYear() === 2025 && date.getMonth() === (state.history.period === 'february' ? 1 : 0));
      const rhythmMatch = state.history.rhythm === 'all' || ({ normal: 'Normal', attention: 'Needs review', unreviewed: 'Unreviewed' }[state.history.rhythm] === record.rhythm);
      const queryMatch = !state.history.query || `${dateLabel(record.date)} ${record.rhythm} ${record.device} ECG ${record.bpm ?? ''}`.toLowerCase().includes(state.history.query.toLowerCase());
      return periodMatch && rhythmMatch && queryMatch;
    });
  }

  function paginationMarkup(page, pages, total, action, size) {
    return `<span>${total ? `${page * size + 1}–${Math.min((page + 1) * size, total)} of ${total}` : '0 records'}</span><div class="pagination-controls"><button class="icon-button" data-action="${action}" data-direction="-1" aria-label="Previous page" ${page === 0 ? 'disabled' : ''}>${icon('chevron-left')}</button><span>${pages ? page + 1 : 0} / ${pages}</span><button class="icon-button" data-action="${action}" data-direction="1" aria-label="Next page" ${page >= pages - 1 ? 'disabled' : ''}>${icon('chevron-right')}</button></div>`;
  }

  function renderHistory() {
    const records = filteredRecords();
    const pages = Math.ceil(records.length / 5);
    state.history.page = Math.max(0, Math.min(state.history.page, pages - 1));
    $('#history-summary').textContent = `${state.records.length} recordings · Last check ${state.records.length ? dateLabel(state.records[0].date) : 'not recorded yet'}`;
    $('#history-rows').innerHTML = records.length ? records.slice(state.history.page * 5, state.history.page * 5 + 5).map((record) => `<button class="record-row" data-action="open-record" data-id="${escape(record.id)}"><span class="record-date"><strong>${escape(dateLabel(record.date))}</strong><span>${escape(timeLabel(record.date))}</span></span><span>${durationLabel(record.duration)}</span><span class="status-label ${record.rhythm === 'Needs review' ? 'attention' : ''}">${icon(record.rhythm === 'Normal' ? 'check' : 'alert-circle')}${escape(record.rhythm)}</span><span class="numeric">${record.bpm ?? '—'} <span class="unit">bpm</span></span><span>${escape(record.device)}</span>${icon('chevron-right')}</button>`).join('') : `<div class="empty-state">${icon('file-heart')}<h3>${state.records.length ? 'No recordings match' : 'Your next check starts here.'}</h3><p>${state.records.length ? 'Try another date, rhythm or search.' : 'Import an ECG file to keep your heart checks together.'}</p><button class="small-button" data-action="${state.records.length ? 'clear-filters' : 'import-record'}">${state.records.length ? 'Clear filters' : 'Import ECG'} ${icon('arrow-up-right')}</button></div>`;
    $('#history-pagination').innerHTML = paginationMarkup(state.history.page, pages, records.length, 'history-page', 5);
    setSelectLabel('history-period', { february: 'February 2025', january: 'January 2025', all: 'All time' }[state.history.period]);
    setSelectLabel('history-rhythm', { all: 'All rhythms', normal: 'Normal', attention: 'Needs review', unreviewed: 'Unreviewed' }[state.history.rhythm]);
    $('.notification-dot').hidden = state.history.period === 'all' && state.history.rhythm === 'all';
  }

  function openRecord(id) {
    if (!state.records.some((record) => record.id === id)) return;
    pause();
    state.selectedId = id;
    state.signalPage = 0;
    state.recordMode = 'chart';
    state.playback.elapsed = 0;
    navigate('recording');
  }

  function renderRecording() {
    const record = selectedRecord();
    if (!record) { navigate('history'); return; }
    $('#recording-title').textContent = dateLabel(record.date, true);
    const sample = record.samples.filter((point) => point.time <= record.samples[0].time + 6);
    const values = sample.map((point) => point.voltage);
    const labels = sample.map((point) => `${point.time.toFixed(2)} s`);
    const low = Math.min(-.4, ...values);
    const high = Math.max(1.2, ...values);
    drawLineChart($('#detail-chart'), values, labels, { min: low, max: high, times: sample.map((point) => point.time), unit: 'mV' });
    $('#detail-chart').hidden = state.recordMode !== 'chart';
    $('#signal-table').hidden = state.recordMode !== 'table';
    $$('[data-record-mode]').forEach((button) => { const active = button.dataset.recordMode === state.recordMode; button.classList.toggle('is-active', active); button.setAttribute('aria-pressed', active); });
    renderSignalTable(record);
    $('#recording-info').innerHTML = `<h2>Heart rate</h2><div class="info-rate"><span class="dot-number" data-value="${record.bpm ?? '--'}"></span><span class="unit">bpm</span></div><span class="status-label ${record.rhythm === 'Needs review' ? 'attention' : ''}">${icon(record.rhythm === 'Normal' ? 'check' : 'alert-circle')}${escape(record.rhythm)}</span><div class="info-row"><span>Duration</span><strong>${durationLabel(record.duration)}</strong></div><div class="info-row"><span>Device</span><strong>${escape(record.device)}</strong></div><div class="info-row"><span>Recorded</span><strong>${escape(timeLabel(record.date))}</strong></div><p class="recording-note">${escape(record.note)}</p><button class="small-button" data-action="delete-record">Remove recording ${icon('trash')}</button>`;
    refreshDigits($('#recording-info'));
    updatePlayback();
  }

  function renderSignalTable(record) {
    const total = record.samples.length;
    const pages = Math.ceil(total / 8);
    state.signalPage = Math.max(0, Math.min(state.signalPage, pages - 1));
    $('#signal-table').innerHTML = `<table class="data-table"><thead><tr><th scope="col">Time (s)</th><th scope="col">Voltage (mV)</th></tr></thead><tbody>${record.samples.slice(state.signalPage * 8, state.signalPage * 8 + 8).map((point) => `<tr><td>${point.time.toFixed(2)}</td><td>${point.voltage.toFixed(3)}</td></tr>`).join('')}</tbody></table><div class="pagination">${paginationMarkup(state.signalPage, pages, total, 'signal-page', 8)}</div>`;
  }

  function playbackDuration() {
    const record = selectedRecord();
    if (!record) return 0;
    return Math.min(6, record.samples[record.samples.length - 1].time - record.samples[0].time);
  }

  function updatePlayback() {
    const duration = playbackDuration();
    const progress = duration ? Math.min(100, state.playback.elapsed / duration * 100) : 0;
    $('#playback-time').textContent = `${clock(state.playback.elapsed)} / ${clock(duration)}`;
    $('#playback-progress').style.width = `${progress}%`;
    $('.playback-track').setAttribute('aria-valuenow', Math.round(progress));
    $('#playback-button').innerHTML = icon(state.playback.running ? 'player-pause' : 'player-play');
    $('#playback-button').setAttribute('aria-label', state.playback.running ? 'Pause ECG recording' : 'Play ECG recording');
    $('#playback-button').disabled = duration <= 0;
  }

  function start() {
    if (state.playback.running || !selectedRecord()) return;
    if (state.playback.elapsed >= playbackDuration()) state.playback.elapsed = 0;
    state.playback.running = true;
    state.playback.started = performance.now() - state.playback.elapsed * 1000;
    const frame = () => {
      if (!state.playback.running) return;
      state.playback.elapsed = Math.min(playbackDuration(), (performance.now() - state.playback.started) / 1000);
      if (state.playback.elapsed >= playbackDuration()) state.playback.running = false;
      updatePlayback();
      if (state.playback.running) state.playback.frame = requestAnimationFrame(frame);
    };
    state.playback.frame = requestAnimationFrame(frame);
    updatePlayback();
  }

  function pause() {
    if (state.playback.running) state.playback.elapsed = Math.min(playbackDuration(), (performance.now() - state.playback.started) / 1000);
    state.playback.running = false;
    cancelAnimationFrame(state.playback.frame);
    updatePlayback();
  }

  function renderDevices() {
    $('#devices-summary').textContent = state.device ? '1 registered device · Last connected Feb 10, 2025' : 'No devices registered';
    $('#device-workspace').innerHTML = state.device ? `<section class="surface device-detail-card"><img class="watch-large" src="assets/apple-watch.webp" alt="Black Apple Watch Series X"><div class="device-detail-info"><h2>Apple Watch<br>Series X</h2><p>Aluminium · Midnight</p><span class="status-label">${icon('plug-off')}Offline</span><div class="info-row"><span>Last known battery</span><strong>84%</strong></div><div class="info-row"><span>Last connected</span><strong>Feb 10</strong></div><div class="info-row"><span>ECG support</span><strong>Lead I</strong></div><button class="secondary-button" data-action="sync-device" ${state.deviceBusy ? 'disabled' : ''}>${icon('refresh')}Sync now</button><p class="device-sync-status" id="device-sync-status" role="status"></p></div><button class="text-button device-remove" data-action="remove-device">Remove device</button></section><aside class="surface connection-card">${icon('activity-heartbeat')}<h2>A closer connection.<br>A clearer picture.</h2><p>Open Rythea on your Apple Watch and keep it nearby to sync your latest heart checks.</p><button class="secondary-button" data-action="record-connect">${icon('device-watch')}Record an ECG</button><p class="connection-status" id="connection-status" role="status"></p></aside>` : `<div class="empty-state">${icon('device-watch-plus')}<h3>Keep your heart in the loop.</h3><p>Add an Apple Watch to bring your ECG and heart-rate readings together.</p><button class="primary-button" data-action="add-device">Find a device ${icon('arrow-up-right')}</button><p id="connection-status" class="connection-status" role="status"></p></div>`;
    if (state.discovery) {
      const target = $('#connection-status');
      if (target) target.textContent = 'Apple Watch Series 4 or later · Open Rythea on your watch to pair.';
    }
  }

  async function findDevice(forRecording = false) {
    if (state.deviceBusy) return;
    state.deviceBusy = true;
    const target = $('#device-sync-status') || $('#connection-status');
    const buttons = $$('[data-action="sync-device"], [data-action="record-connect"], [data-action="add-device"]');
    buttons.forEach((button) => button.disabled = true);
    if (target) { target.classList.remove('is-error'); target.textContent = forRecording ? 'Looking for a watch to record an ECG…' : 'Looking for Apple Watch…'; }
    await new Promise((resolve) => setTimeout(resolve, 850));
    state.deviceBusy = false;
    buttons.forEach((button) => button.disabled = false);
    if (target?.isConnected) { target.classList.add('is-error'); target.textContent = 'Apple Watch is not connected. Open Rythea on your watch, then try again.'; }
  }

  function renderInsights() {
    const resting = state.insights.tab === 'resting';
    const current = state.insights.period === 'current';
    const values = resting ? (current ? currentWeek : previousWeek) : workout;
    const context = resting ? (current ? previousWeek : olderWeek) : null;
    const labels = resting ? ['Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue', 'Wed'] : workout.map((_, index) => `${index * 2}m`);
    $('#insights-date').textContent = resting ? (current ? 'February 6–12, 2025' : 'January 30 – February 5, 2025') : 'Outdoor walk · February 11, 2025 · 26 minutes';
    $('#insight-chart-title').textContent = resting ? 'Resting heart rate' : 'Heart rate during your last workout';
    $('#insight-legend').innerHTML = resting ? `<span class="legend-item">${current ? 'Current week' : 'Previous week'}</span><span class="legend-item context">Week before</span>` : '<span class="legend-item">Outdoor walk</span>';
    drawLineChart($('#insight-chart'), values, labels, { min: resting ? 55 : 60, max: resting ? 95 : 140, context: context ? { label: 'Week before', values: context } : null });
    $('#insight-chart').hidden = state.insights.mode !== 'chart';
    $('#insight-table').hidden = state.insights.mode !== 'table';
    $('#insight-table').innerHTML = `<table class="data-table"><thead><tr><th scope="col">${resting ? 'Day' : 'Time (min)'}</th><th scope="col">Heart rate (bpm)</th>${resting ? '<th scope="col">Week before (bpm)</th>' : ''}</tr></thead><tbody>${values.filter((_, index) => resting || index % 2 === 0 || index === values.length - 1).map((value, index) => {
      const sourceIndex = resting ? index : Math.min(index * 2, values.length - 1);
      return `<tr><td>${escape(labels[sourceIndex])}</td><td>${value}</td>${resting ? `<td>${context[index]}</td>` : ''}</tr>`;
    }).join('')}</tbody></table>`;
    const recovery = Math.round((127 - 79) / (127 - 72) * 100);
    $('#insight-aside').innerHTML = resting ? `<section class="insight-main-stat"><h2>Weekly average</h2><div class="info-rate"><span class="dot-number" data-value="${average(values)}"></span><span class="unit">bpm</span></div><p>${average(values)} bpm this week, compared with ${average(context)} bpm in the week before.</p><div class="info-row"><span>Lowest day</span><strong>${Math.min(...values)} bpm</strong></div><div class="info-row"><span>Highest day</span><strong>${Math.max(...values)} bpm</strong></div></section><section class="insight-secondary-stat"><strong>−${average(context) - average(values)} <span class="unit">bpm</span></strong><p>A lower average than the week before.</p></section>` : `<section class="insight-main-stat"><h2>Peak heart rate</h2><div class="info-rate"><span class="dot-number" data-value="127"></span><span class="unit">bpm</span></div><p>Outdoor walk · 26 minutes</p><div class="info-row"><span>Finished at</span><strong>79 bpm</strong></div><div class="info-row"><span>Resting baseline</span><strong>72 bpm</strong></div></section><section class="insight-secondary-stat"><strong>${recovery}%</strong><p>Recovery toward your resting baseline after this workout.</p></section>`;
    refreshDigits($('#insight-aside'));
    $$('[data-insight-tab]').forEach((button) => { const active = button.dataset.insightTab === state.insights.tab; button.classList.toggle('is-active', active); button.setAttribute('aria-pressed', active); });
    $$('[data-insight-mode]').forEach((button) => { const active = button.dataset.insightMode === state.insights.mode; button.classList.toggle('is-active', active); button.setAttribute('aria-pressed', active); });
    $('#insights-period').disabled = !resting;
    setSelectLabel('insights-period', current ? 'Current week' : 'Previous week');
  }

  function renderProfile() {
    $('#profile-personal').hidden = state.profileTab !== 'personal';
    $('#profile-health').hidden = state.profileTab !== 'health';
    $$('[data-profile-tab]').forEach((button) => { const active = button.dataset.profileTab === state.profileTab; button.classList.toggle('is-active', active); button.setAttribute('aria-pressed', active); });
    if (state.profileTab === 'health') renderProfileHealth();
  }

  function renderProfileHealth() {
    $('#profile-health').innerHTML = `<div class="health-section"><div class="health-record-topline"><h2>Allergies (${state.allergies.length})</h2><button class="small-button" data-action="show-add-allergy" ${state.allergies.length >= 3 ? 'disabled' : ''}>${icon('plus')}Add</button></div>${state.allergies.length ? state.allergies.map((record) => `<div class="health-record-row"><div><strong>${escape(record.name)}</strong><p>${escape(record.note)}</p></div><span class="status-label">${escape(record.severity)}</span><button class="icon-button" data-action="remove-allergy" data-id="${escape(record.id)}" aria-label="Remove ${escape(record.name)}">${icon('x')}</button></div>`).join('') : '<p class="health-record-empty">No allergies on file.</p>'}<form class="add-allergy-form" id="add-allergy-form" hidden><input id="allergy-name" type="text" maxlength="40" placeholder="Allergy name" aria-label="Allergy name" required><button class="small-button" type="submit">Add</button><button class="icon-button" type="button" data-action="cancel-add-allergy" aria-label="Cancel adding allergy">${icon('x')}</button></form><p class="form-message" id="allergy-message" role="status" hidden></p></div><div class="health-section"><div class="health-record-topline"><h2>Diagnoses (${state.diagnoses.length})</h2></div>${state.diagnoses.length ? state.diagnoses.map((record) => `<div class="health-record-row"><div><strong>${escape(record.name)}</strong><p>${escape(record.note)}</p></div><button class="icon-button" data-action="remove-diagnosis" data-id="${escape(record.id)}" aria-label="Remove ${escape(record.name)}">${icon('x')}</button></div>`).join('') : '<p class="health-record-empty">No diagnoses on file.</p>'}</div>`;
  }

  function profileValues() { return { name: $('#profile-name').value.trim(), email: $('#profile-email').value.trim(), birth: $('#profile-birth').value.trim(), gender: state.editingGender, phone: $('#profile-phone').value.trim() }; }
  function profileDirty() { return Object.entries(profileValues()).some(([key, value]) => value !== state.profile[key]); }
  function updateProfileButtons() { const dirty = profileDirty(); $('#save-profile').disabled = !dirty || state.profileSaving; $('[data-action="reset-profile"]').disabled = !dirty || state.profileSaving; }

  function validateProfile(values) {
    if (!values.name) return ['name', 'Enter your full name.'];
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) return ['email', 'Enter a valid email address.'];
    const match = values.birth.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!match) return ['birth', 'Enter a date of birth in DD/MM/YYYY format.'];
    const [, day, month, year] = match.map(Number);
    const date = new Date(year, month - 1, day);
    if (date.getDate() !== day || date.getMonth() !== month - 1 || date.getFullYear() !== year || date >= referenceDate || year < 1900) return ['birth', 'Enter a valid date before February 12, 2025.'];
    if (!/^[+\d\s().-]{7,24}$/.test(values.phone) || values.phone.replace(/\D/g, '').length < 7) return ['phone', 'Enter a valid phone number.'];
    return null;
  }

  async function saveProfile(event) {
    event.preventDefault();
    if (state.profileSaving || !profileDirty()) return;
    const values = profileValues();
    $$('#profile-form input').forEach((input) => input.removeAttribute('aria-invalid'));
    const error = validateProfile(values);
    const message = $('#profile-form-message');
    message.classList.toggle('is-error', Boolean(error));
    if (error) { message.textContent = error[1]; $(`#profile-${error[0]}`).setAttribute('aria-invalid', 'true'); $(`#profile-${error[0]}`).focus(); return; }
    state.profileSaving = true;
    updateProfileButtons();
    $$('#profile-form input, #profile-gender').forEach((input) => input.disabled = true);
    $('#save-profile').textContent = 'Saving…';
    message.textContent = '';
    await new Promise((resolve) => setTimeout(resolve, 350));
    Object.assign(state.profile, values);
    state.profileSaving = false;
    $$('#profile-form input, #profile-gender').forEach((input) => input.disabled = false);
    $('#save-profile').innerHTML = `Save changes ${icon('arrow-up-right')}`;
    message.textContent = 'Your changes are saved.';
    updateProfileButtons();
    renderDashboard();
  }

  function resetProfile() {
    ['name', 'email', 'birth', 'phone'].forEach((name) => { $(`#profile-${name}`).value = state.profile[name]; $(`#profile-${name}`).removeAttribute('aria-invalid'); });
    state.editingGender = state.profile.gender;
    setSelectLabel('profile-gender', state.profile.gender);
    $('#profile-form-message').textContent = '';
    updateProfileButtons();
  }

  function renderSettings() {
    $$('[data-setting]').forEach((button) => button.setAttribute('aria-checked', state.settings[button.dataset.setting]));
    app.classList.toggle('reduce-motion', state.settings.motion);
    app.classList.toggle('high-contrast', state.settings.contrast);
  }

  function setSelectLabel(id, label) { $('#' + id).innerHTML = `${escape(label)} ${icon('chevron-down')}`; }

  function dropdownOptions(kind) {
    return {
      'history-period': { value: state.history.period, options: [['february', 'February 2025'], ['january', 'January 2025'], ['all', 'All time']] },
      'history-rhythm': { value: state.history.rhythm, options: [['all', 'All rhythms'], ['normal', 'Normal'], ['attention', 'Needs review'], ['unreviewed', 'Unreviewed'], ['live', 'Live readings', true]], hint: 'Connect your watch to enable live readings.' },
      'insights-period': { value: state.insights.period, options: [['current', 'Current week'], ['previous', 'Previous week']] },
      'profile-gender': { value: state.editingGender, options: [['Male', 'Male'], ['Female', 'Female'], ['Other', 'Other'], ['Prefer not to say', 'Prefer not to say']] }
    }[kind];
  }

  function placePopover(panel, anchor) {
    const canvas = app.getBoundingClientRect();
    const box = anchor.getBoundingClientRect();
    const width = panel.offsetWidth;
    const height = panel.offsetHeight;
    const left = Math.max(canvas.width * .025, Math.min(canvas.width - width - canvas.width * .025, box.left - canvas.left));
    const bottomSpace = canvas.bottom - box.bottom;
    const top = bottomSpace >= height + canvas.width * .012 ? box.bottom - canvas.top + canvas.width * .008 : box.top - canvas.top - height - canvas.width * .008;
    panel.style.left = `${left / canvas.width * 100}cqw`;
    panel.style.top = `${Math.max(canvas.width * .025, top) / canvas.width * 100}cqw`;
  }

  function openDropdown(kind, anchor) {
    if (state.dropdown?.kind === kind) { closeDropdown(); return; }
    closeDropdown(false);
    closeMenu(false);
    const config = dropdownOptions(kind);
    if (!config) return;
    state.dropdown = { kind, anchor };
    anchor.setAttribute('aria-expanded', 'true');
    const panel = $('#option-panel');
    panel.innerHTML = config.options.map(([value, label, disabled]) => `<button class="option-item" role="option" data-action="select-option" data-value="${escape(value)}" aria-selected="${config.value === value}" ${disabled ? 'disabled' : ''}><span>${escape(label)}</span>${config.value === value ? icon('check') : ''}</button>`).join('') + (config.hint ? `<p class="option-hint">${config.hint}</p>` : '');
    panel.setAttribute('aria-label', kind.replaceAll('-', ' '));
    panel.hidden = false;
    placePopover(panel, anchor);
    ($('[aria-selected="true"]', panel) || $('button:not(:disabled)', panel)).focus();
  }

  function closeDropdown(restore = true) {
    if (!state.dropdown) return;
    const anchor = state.dropdown.anchor;
    anchor.setAttribute('aria-expanded', 'false');
    state.dropdown = null;
    $('#option-panel').hidden = true;
    if (restore && anchor.isConnected) anchor.focus();
  }

  function selectOption(value) {
    const kind = state.dropdown?.kind;
    if (!kind) return;
    const config = dropdownOptions(kind);
    const option = config.options.find((item) => item[0] === value);
    if (!option || option[2]) return;
    if (kind === 'history-period') { state.history.period = value; state.history.page = 0; renderHistory(); }
    if (kind === 'history-rhythm') { state.history.rhythm = value; state.history.page = 0; renderHistory(); }
    if (kind === 'insights-period') { state.insights.period = value; renderInsights(); }
    if (kind === 'profile-gender') { state.editingGender = value; setSelectLabel('profile-gender', value); updateProfileButtons(); }
    closeDropdown();
  }

  function openMenu(anchor, items) {
    if (state.menuAnchor === anchor) { closeMenu(); return; }
    closeMenu(false);
    closeDropdown(false);
    state.menuAnchor = anchor;
    anchor.setAttribute('aria-expanded', 'true');
    const menu = $('#quick-menu');
    menu.innerHTML = items.map((item) => item.separator ? '<div class="menu-separator"></div>' : `<button class="menu-item" role="menuitem" ${item.view ? `data-view="${item.view}"` : `data-action="${item.action}"`} ${item.disabled ? 'disabled' : ''}><span>${item.label}</span>${icon(item.icon || 'arrow-up-right')}</button>`).join('');
    menu.hidden = false;
    placePopover(menu, anchor);
    $('button:not(:disabled)', menu)?.focus();
  }

  function closeMenu(restore = true) {
    if (!state.menuAnchor) return;
    const anchor = state.menuAnchor;
    anchor.setAttribute('aria-expanded', 'false');
    state.menuAnchor = null;
    $('#quick-menu').hidden = true;
    if (restore && anchor.isConnected) anchor.focus();
  }

  function renderSearch() {
    const query = $('#global-search').value.trim().toLowerCase();
    const routes = [
      ['ECG history', 'Your saved heart checks', 'history', 'history'],
      ['Apple Watch', 'Device connection and ECG recording', 'devices', 'device-watch'],
      ['Heart rate', 'Weekly trends and your last workout', 'insights', 'activity-heartbeat'],
      ['Personal details', 'Name, contact and health records', 'profile', 'user'],
      ['Privacy & display', 'Personal details and chart preferences', 'settings', 'shield']
    ];
    const records = query ? state.records.filter((record) => `${dateLabel(record.date)} ECG ${record.rhythm} ${record.bpm ?? ''}`.toLowerCase().includes(query)).slice(0, 3).map((record) => `<button class="menu-item search-result" role="option" data-action="open-record" data-id="${escape(record.id)}" aria-selected="false">${icon('file-heart')}<span><strong>ECG · ${escape(dateLabel(record.date))}</strong><small>${escape(record.rhythm)} · ${record.bpm ?? '—'} bpm</small></span></button>`) : [];
    const results = routes.filter((route) => !query || `${route[0]} ${route[1]}`.toLowerCase().includes(query)).map(([name, description, view, symbol]) => `<button class="menu-item search-result" role="option" data-view="${view}" aria-selected="false">${icon(symbol)}<span><strong>${name}</strong><small>${description}</small></span></button>`);
    const panel = $('#search-results');
    panel.innerHTML = [...records, ...results].slice(0, 5).join('') || '<p class="search-empty">No matches found.</p><button class="menu-item" data-action="clear-search">Clear search</button>';
    panel.hidden = false;
    $('#global-search').setAttribute('aria-expanded', 'true');
    state.searchIndex = 0;
    highlightSearch();
    if (state.view === 'history') { state.history.query = query; state.history.page = 0; renderHistory(); }
  }

  function highlightSearch() {
    const results = $$('.search-result');
    results.forEach((button, index) => { button.setAttribute('aria-selected', index === state.searchIndex); button.id = `search-option-${index}`; });
    if (results.length) $('#global-search').setAttribute('aria-activedescendant', `search-option-${state.searchIndex}`); else $('#global-search').removeAttribute('aria-activedescendant');
  }

  function closeSearch() { $('#search-results').hidden = true; $('#global-search').setAttribute('aria-expanded', 'false'); $('#global-search').removeAttribute('aria-activedescendant'); }

  function toast(message, error = false) {
    clearTimeout(state.toastTimer);
    const element = $('#toast');
    element.classList.toggle('is-error', error);
    $('i', element).className = `ti ti-${error ? 'alert-circle' : 'check'}`;
    $('span', element).textContent = message;
    element.hidden = false;
    state.toastTimer = setTimeout(() => element.hidden = true, 3500);
  }

  async function copy(value) {
    try { await navigator.clipboard.writeText(value); toast('Copied to clipboard.'); }
    catch { toast('Clipboard access is not available in this browser.', true); }
  }

  function download(content, name, type) {
    const url = URL.createObjectURL(new Blob([content], { type }));
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function exportRecord(record) {
    if (!record) { toast('There are no ECG recordings to download.', true); return; }
    const lines = ['time_s,voltage_mv,heart_rate_bpm', ...record.samples.map((point) => `${point.time.toFixed(2)},${point.voltage.toFixed(3)},${record.bpm ?? ''}`)];
    download(lines.join('\n'), `rythea-ecg-${record.date.slice(0, 10)}.csv`, 'text/csv;charset=utf-8');
    toast('Your ECG file is ready.');
  }

  function exportAll() {
    if (!state.records.length) { toast('There are no ECG recordings to download.', true); return; }
    download(JSON.stringify({ recordings: state.records }, null, 2), 'rythea-ecg-recordings.json', 'application/json');
    toast('Your recordings file is ready.');
  }

  function heartRateRows() {
    const resting = state.insights.tab === 'resting';
    if (!resting && state.view === 'insights') return ['time_min,heart_rate_bpm', ...workout.map((value, index) => `${index * 2},${value}`)];
    const previous = state.view === 'insights' && state.insights.period === 'previous';
    const values = previous ? previousWeek : currentWeek;
    return ['date,heart_rate_bpm', ...values.map((value, index) => {
      const date = new Date(2025, 1, 6 - (previous ? 7 : 0) + index);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')},${value}`;
    })];
  }

  function showDialog(title, description, confirmLabel, callback) {
    closeMenu(false);
    closeDropdown(false);
    closeSearch();
    state.dialog = { callback, focus: document.activeElement };
    $('#dialog-title').textContent = title;
    $('#dialog-description').textContent = description;
    $('#dialog-confirm').textContent = confirmLabel;
    $('.views').inert = true;
    $('.app-header').inert = true;
    $('.dock').inert = true;
    $('#dialog-layer').hidden = false;
    $('[data-action="close-dialog"]', $('.dialog')).focus();
  }

  function closeDialog() {
    if (!state.dialog) return;
    const { focus } = state.dialog;
    state.dialog = null;
    $('#dialog-layer').hidden = true;
    $('.views').inert = false;
    $('.app-header').inert = false;
    $('.dock').inert = false;
    if (focus?.isConnected && !focus.closest('[hidden]')) focus.focus(); else $('.dock-button.is-active').focus();
  }

  function normalizeImport(record, index) {
    if (!record || !Array.isArray(record.samples) || record.samples.length < 2 || record.samples.length > 20000) throw new Error('The file needs between 2 and 20,000 ECG samples.');
    const samples = record.samples.map((point) => ({ time: Number(point.time), voltage: Number(point.voltage) }));
    if (samples.some((point, sampleIndex) => !Number.isFinite(point.time) || !Number.isFinite(point.voltage) || point.time < 0 || point.time > 600 || Math.abs(point.voltage) > 10 || (sampleIndex > 0 && point.time <= samples[sampleIndex - 1].time))) throw new Error('Check that ECG times increase and all voltages are valid numbers.');
    const bpm = record.bpm == null ? null : Number(record.bpm);
    if (bpm !== null && (!Number.isFinite(bpm) || bpm < 30 || bpm > 220)) throw new Error('The heart-rate value must be between 30 and 220 bpm.');
    const date = record.date && !Number.isNaN(Date.parse(record.date)) ? new Date(record.date).toISOString() : referenceDate.toISOString();
    const duration = samples[samples.length - 1].time - samples[0].time;
    return { id: `import-${Date.now()}-${index}`, date, duration, bpm, rhythm: 'Unreviewed', device: 'Imported file', samples, note: 'Imported ECG · Not clinically reviewed. The signal view shows the first 6 seconds.' };
  }

  async function importFile(file) {
    if (!file || state.importBusy) return;
    navigate('history');
    const status = $('#import-status');
    status.classList.remove('is-error');
    status.textContent = 'Reading ECG file…';
    state.importBusy = true;
    $$('[data-action="import-record"]').forEach((button) => button.disabled = true);
    try {
      if (file.size > 10 * 1024 * 1024) throw new Error('Choose an ECG file smaller than 10 MB.');
      const text = await file.text();
      let recordings;
      if (file.name.toLowerCase().endsWith('.json')) {
        let value;
        try { value = JSON.parse(text); } catch { throw new Error('This JSON file could not be read. Check the file and try again.'); }
        recordings = Array.isArray(value.recordings) ? value.recordings : [value];
        if (!recordings.length || recordings.length > 30) throw new Error('Import between 1 and 30 recordings at a time.');
      } else if (file.name.toLowerCase().endsWith('.csv')) {
        const lines = text.trim().split(/\r?\n/);
        if (lines[0].trim().toLowerCase() !== 'time_s,voltage_mv,heart_rate_bpm' && lines[0].trim().toLowerCase() !== 'time_s,voltage_mv') throw new Error('Use a CSV with time_s and voltage_mv columns.');
        const samples = lines.slice(1).filter((line) => line.trim()).map((line) => { const columns = line.split(','); return { time: columns[0] === '' ? NaN : Number(columns[0]), voltage: columns[1] === '' ? NaN : Number(columns[1]) }; });
        const bpmText = lines[1]?.split(',')[2]?.trim();
        recordings = [{ samples, bpm: bpmText ? Number(bpmText) : null }];
      } else throw new Error('Choose a CSV or JSON ECG file.');
      const imported = recordings.map(normalizeImport);
      state.records.push(...imported);
      state.records.sort((a, b) => new Date(b.date) - new Date(a.date));
      state.history.period = 'all';
      state.history.rhythm = 'all';
      state.history.query = '';
      state.history.page = 0;
      $('#global-search').value = '';
      status.textContent = `${imported.length} ${imported.length === 1 ? 'recording' : 'recordings'} imported · Awaiting review`;
      renderHistory();
      renderDashboard();
    } catch (error) { status.classList.add('is-error'); status.textContent = error.message; }
    finally { state.importBusy = false; $$('[data-action="import-record"]').forEach((button) => button.disabled = false); $('#import-file').value = ''; }
  }

  const actions = {
    'open-filters': () => { navigate('history'); openDropdown('history-period', $('#history-period')); },
    'app-menu': (button) => openMenu(button, [{ label: 'Your profile', view: 'profile', icon: 'user' }, { label: 'Privacy & display', view: 'settings', icon: 'shield' }, { separator: true }, { label: 'Export all recordings', action: 'export-all', icon: 'download', disabled: !state.records.length }, { label: 'Share with care team', disabled: true, icon: 'lock' }]),
    'ecg-menu': (button) => openMenu(button, [{ label: 'View recording', action: 'latest-details' }, { label: 'View data table', action: 'latest-table', icon: 'table' }, { label: 'Download ECG', action: 'export-latest', icon: 'download' }]),
    'record-menu': (button) => openMenu(button, [{ label: 'Review last ECG', action: 'review-last' }, { label: 'Recording device', view: 'devices', icon: 'device-watch' }]),
    'latest-details': () => state.records[0] && openRecord(state.records[0].id),
    'latest-table': () => { if (!state.records[0]) return; openRecord(state.records[0].id); state.recordMode = 'table'; renderRecording(); },
    'export-latest': () => exportRecord(state.records[0]),
    'export-selected': () => exportRecord(selectedRecord()),
    'export-all': exportAll,
    'export-heart-rate': () => { download(heartRateRows().join('\n'), 'rythea-heart-rate.csv', 'text/csv;charset=utf-8'); toast('Your heart-rate file is ready.'); },
    'open-record': (button) => openRecord(button.dataset.id),
    'review-last': () => { const record = state.records.find((entry) => entry.id === 'ecg-0205') || state.records[0]; if (record) openRecord(record.id); else navigate('history'); },
    'record-start': () => { navigate('devices'); findDevice(true); },
    'record-connect': () => findDevice(true),
    'sync-device': () => findDevice(),
    'add-device': () => { state.discovery = true; navigate('devices'); findDevice(); },
    'remove-device': () => showDialog('Remove your Apple Watch?', 'Your saved ECG recordings will stay. You can add the watch again whenever you need it.', 'Remove device', () => { state.device = null; state.discovery = false; renderDevices(); renderDashboard(); }),
    'delete-record': () => { const record = selectedRecord(); if (record) showDialog('Remove this recording?', `${dateLabel(record.date)} · ${durationLabel(record.duration)}. Download a copy first if you want to keep it.`, 'Remove ECG', () => { state.records = state.records.filter((entry) => entry.id !== record.id); navigate('history'); renderDashboard(); }); },
    'clear-records': () => showDialog('Remove all ECG recordings?', 'Your profile and heart-rate history will stay. Download a copy of your ECG recordings before removing them.', 'Remove all', () => { state.records = []; renderDashboard(); toast('ECG recordings removed.'); }),
    'close-dialog': closeDialog,
    'confirm-dialog': () => { if (state.dialog) { const callback = state.dialog.callback; callback(); closeDialog(); } },
    'copy-id': () => copy(state.profile.id),
    'copy-phone': () => copy(state.profile.phone),
    'edit-contact': () => { state.profileTab = 'personal'; navigate('profile'); $('#profile-email').focus(); },
    'manage-health': () => { state.profileTab = 'health'; navigate('profile'); },
    'previous-insights': () => { state.insights.period = 'previous'; state.insights.tab = 'resting'; navigate('insights'); },
    'workout-insights': () => { state.insights.tab = 'workout'; navigate('insights'); },
    'clear-filters': () => { state.history = { period: 'all', rhythm: 'all', query: '', page: 0 }; $('#global-search').value = ''; closeSearch(); renderHistory(); },
    'clear-search': () => { $('#global-search').value = ''; state.history.query = ''; renderSearch(); $('#global-search').focus(); },
    'history-page': (button) => { state.history.page += Number(button.dataset.direction); renderHistory(); },
    'signal-page': (button) => { state.signalPage += Number(button.dataset.direction); renderSignalTable(selectedRecord()); },
    'playback': () => state.playback.running ? pause() : start(),
    'reset-playback': () => { pause(); state.playback.elapsed = 0; updatePlayback(); },
    'reset-profile': resetProfile,
    'import-record': () => $('#import-file').click(),
    'show-add-allergy': () => { $('#add-allergy-form').hidden = false; $('#allergy-name').focus(); },
    'cancel-add-allergy': () => { $('#add-allergy-form').hidden = true; $('#allergy-message').hidden = true; },
    'remove-allergy': (button) => { const record = state.allergies.find((entry) => entry.id === button.dataset.id); if (record) showDialog(`Remove ${record.name}?`, 'This allergy will be removed from your health profile.', 'Remove', () => { state.allergies = state.allergies.filter((entry) => entry.id !== record.id); renderProfileHealth(); renderDashboard(); }); },
    'remove-diagnosis': (button) => { const record = state.diagnoses.find((entry) => entry.id === button.dataset.id); if (record) showDialog(`Remove ${record.name}?`, 'This diagnosis will be removed from your health profile.', 'Remove', () => { state.diagnoses = state.diagnoses.filter((entry) => entry.id !== record.id); renderProfileHealth(); renderDashboard(); }); },
    'select-option': (button) => selectOption(button.dataset.value)
  };

  function initialize() {
    if (app.dataset.ready) return;
    app.dataset.ready = 'true';
    refreshDigits();
    drawAura();
    renderDashboard();
    app.addEventListener('click', (event) => {
      const button = event.target.closest('button, [data-action="close-dialog"]');
      if (!button || button.disabled) return;
      if (button.dataset.view) { navigate(button.dataset.view); return; }
      if (button.dataset.healthTab) { switchHealthTab(button.dataset.healthTab); return; }
      if (button.dataset.select) { openDropdown(button.dataset.select, button); return; }
      if (button.dataset.recordMode) { state.recordMode = button.dataset.recordMode; renderRecording(); return; }
      if (button.dataset.insightTab) { state.insights.tab = button.dataset.insightTab; renderInsights(); return; }
      if (button.dataset.insightMode) { state.insights.mode = button.dataset.insightMode; renderInsights(); return; }
      if (button.dataset.profileTab) { state.profileTab = button.dataset.profileTab; renderProfile(); return; }
      if (button.dataset.setting) { state.settings[button.dataset.setting] = !state.settings[button.dataset.setting]; renderSettings(); renderDashboard(); return; }
      if (actions[button.dataset.action]) { const keepMenu = ['app-menu', 'ecg-menu', 'record-menu'].includes(button.dataset.action); if (!keepMenu && button.closest('#quick-menu')) closeMenu(false); actions[button.dataset.action](button); }
    });
    app.addEventListener('pointerdown', (event) => {
      if (state.dropdown && !$('#option-panel').contains(event.target) && !state.dropdown.anchor.contains(event.target)) closeDropdown(false);
      if (state.menuAnchor && !$('#quick-menu').contains(event.target) && !state.menuAnchor.contains(event.target)) closeMenu(false);
      if (!$('.search-cluster').contains(event.target)) closeSearch();
    });
    app.addEventListener('keydown', (event) => {
      if (state.dialog) {
        if (event.key === 'Escape') { event.preventDefault(); closeDialog(); }
        if (event.key === 'Tab') { const buttons = $$('button', $('.dialog')); const first = buttons[0]; const last = buttons[buttons.length - 1]; if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); } else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); } }
        return;
      }
      if (event.key === 'Escape') { closeDropdown(); closeMenu(); closeSearch(); }
      const panel = event.target.closest('#option-panel, #quick-menu');
      if (panel && ['ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) {
        event.preventDefault();
        const buttons = $$('button:not(:disabled)', panel);
        const index = buttons.indexOf(document.activeElement);
        const next = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : (index + (event.key === 'ArrowDown' ? 1 : -1) + buttons.length) % buttons.length;
        buttons[next].focus();
      }
      if (event.target.matches('.health-tab') && ['ArrowLeft', 'ArrowRight'].includes(event.key)) {
        event.preventDefault();
        const tabs = $$('.health-tab');
        const next = (tabs.indexOf(event.target) + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
        switchHealthTab(tabs[next].dataset.healthTab);
        tabs[next].focus();
      }
    });
    $('#global-search').addEventListener('input', renderSearch);
    $('#global-search').addEventListener('focus', renderSearch);
    $('#global-search').addEventListener('keydown', (event) => {
      const results = $$('.search-result');
      if (['ArrowDown', 'ArrowUp'].includes(event.key) && results.length) { event.preventDefault(); state.searchIndex = (state.searchIndex + (event.key === 'ArrowDown' ? 1 : -1) + results.length) % results.length; highlightSearch(); }
      if (event.key === 'Enter' && results[state.searchIndex]) { event.preventDefault(); results[state.searchIndex].click(); $('#global-search').blur(); }
    });
    document.addEventListener('keydown', (event) => { if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k' && !state.dialog) { event.preventDefault(); $('#global-search').focus(); } });
    $('#profile-form').addEventListener('input', updateProfileButtons);
    $('#profile-form').addEventListener('submit', saveProfile);
    $('#import-file').addEventListener('change', (event) => importFile(event.target.files[0]));
    app.addEventListener('submit', (event) => {
      if (event.target.id !== 'add-allergy-form') return;
      event.preventDefault();
      const name = $('#allergy-name').value.trim();
      const message = $('#allergy-message');
      if (!name || state.allergies.some((record) => record.name.toLowerCase() === name.toLowerCase())) { message.hidden = false; message.classList.add('is-error'); message.textContent = name ? 'This allergy is already on file.' : 'Enter an allergy name.'; return; }
      if (state.allergies.length >= 3) return;
      state.allergies.push({ id: `allergy-${Date.now()}`, name, note: 'Added to your health profile', severity: 'On file' });
      renderProfileHealth();
      renderDashboard();
    });
    $$('img').forEach((image) => image.addEventListener('error', () => image.hidden = true));
    window.addEventListener('pagehide', () => { pause(); clearTimeout(state.toastTimer); });
    window.addEventListener('resize', () => { if (state.dropdown) placePopover($('#option-panel'), state.dropdown.anchor); if (state.menuAnchor) placePopover($('#quick-menu'), state.menuAnchor); });
  }

  initialize();
})();
