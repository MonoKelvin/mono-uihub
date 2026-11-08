'use strict';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const canvas = $('.canvas');
const periods = {
  monthly: { label: 'Monthly', labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'], values: [60, 72, 88, 55, 78, 82, 58], score: 78, trend: 12, comparison: 'vs last month', selected: 4 },
  weekly: { label: 'Weekly', labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], values: [70, 74, 72, 78, 76, 80, 82], score: 78, trend: 5, comparison: 'vs last week', selected: 3 },
  quarterly: { label: 'Quarterly', labels: ['Q1', 'Q2', 'Q3'], values: [73, 72, 78], score: 78, trend: 8, comparison: 'vs last quarter', selected: 2 }
};
const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const schedule = [
  [{ time: '08:00', name: 'Soil check', detail: 'North beds · moisture inspection', status: 'Completed' }, { time: '10:00', name: 'Harvest', detail: 'Herb garden · basil and mint', status: 'Scheduled' }],
  [],
  [{ time: '10:00', name: 'Feeding', detail: 'Greenhouse 01 · organic nutrients', status: 'Completed' }],
  [{ time: '09:00', name: 'Watering', detail: 'Greenhouse 01 · drip irrigation, 20 min', status: 'Completed' }, { time: '11:00', name: 'Soil check', detail: 'North beds · pH and moisture inspection', status: 'Scheduled' }],
  [{ time: '08:00', name: 'Pruning', detail: 'Greenhouse 01 · tomato vines', status: 'Scheduled' }],
  [{ time: '11:00', name: 'Harvest', detail: 'Herb garden · weekly collection', status: 'Scheduled' }]
];
const measurements = {
  temperature: { label: 'Temperature', value: 24.8, unit: '°C', range: 'Ideal range · 20–28°C', description: 'The greenhouse temperature supports steady growth. Ventilation is balanced and no temperature alerts are active.', fill: 62, icon: 'temperature' },
  humidity: { label: 'Humidity', value: 68, unit: '%', range: 'Ideal range · 60–75%', description: 'Air humidity is within the growing range. Keep the vents open during the warmest part of the day.', fill: 68, icon: 'droplet' },
  co2: { label: 'CO₂ concentration', value: 742, unit: ' ppm', range: 'Ideal range · 600–1,000 ppm', description: 'Carbon dioxide levels support photosynthesis. The greenhouse has a balanced exchange of fresh air.', fill: 74, icon: 'cloud' },
  moisture: { label: 'Soil moisture', value: 73, unit: '%', range: 'Ideal range · 65–80%', description: 'The root zone is well hydrated after the morning watering. The next soil inspection is scheduled for 11:00.', fill: 73, icon: 'ripple' }
};
const weather = {
  today: { label: 'Today', times: ['08:00', '10:00', '12:00', '14:00'], temperatures: [27, 28, 30, 31], humidity: [74, 70, 68, 64], wind: [8, 10, 12, 14], feels: [28, 29, 30, 32] },
  tomorrow: { label: 'Tomorrow', times: ['08:00', '10:00', '12:00', '14:00'], temperatures: [24, 26, 29, 30], humidity: [78, 73, 69, 65], wind: [6, 8, 11, 12], feels: [25, 27, 30, 31] }
};
const state = { view: 'overview', period: 'monthly', selected: 4, day: 3, metric: 'temperature', weatherDay: 'today', weatherIndex: 2, weatherMeasure: 'temperature', unit: 'celsius', profile: { name: 'Cody Fisher', farm: 'North Garden' }, unread: true, dialog: null, saving: false };
let started = false;
let previousFocus = null;
let toastTimer;
let formUnit = state.unit;

function node(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}
function icon(name) {
  const element = node('i', `ti ti-${name}`);
  element.setAttribute('aria-hidden', 'true');
  return element;
}
function button(text, handler, className = 'dialog-action') {
  const element = node('button', className, text);
  element.type = 'button';
  element.addEventListener('click', handler);
  return element;
}
function temperature(value, short = false) {
  const converted = state.unit === 'fahrenheit' ? value * 9 / 5 + 32 : value;
  return `${Number(converted.toFixed(short ? 0 : 1))}°${short ? '' : state.unit === 'fahrenheit' ? 'F' : 'C'}`;
}
function notify(message, error = false) {
  const toast = $('#toast');
  clearTimeout(toastTimer);
  $('span', toast).textContent = message;
  $('i', toast).className = `ti ti-${error ? 'alert-circle' : 'circle-check'}`;
  toast.classList.toggle('is-error', error);
  toast.hidden = false;
  toastTimer = setTimeout(() => { toast.hidden = true; }, 3200);
}
function closeMenus() {
  $$('.dropdown').forEach(menu => { menu.hidden = true; });
  $$('[aria-controls]').filter(trigger => !trigger.hasAttribute('data-view-target')).forEach(trigger => trigger.setAttribute('aria-expanded', 'false'));
}
function toggleMenu(trigger, menu) {
  const opening = menu.hidden;
  closeMenus();
  if (opening) {
    menu.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');
  }
}
function setView(view) {
  state.view = view;
  canvas.dataset.view = view;
  $('.main-nav').style.setProperty('--nav-index', ['overview', 'analytics', 'monitoring'].indexOf(view));
  $$('[data-view-target]').forEach(tab => {
    const selected = tab.dataset.viewTarget === view;
    tab.classList.toggle('is-active', selected);
    if (selected) tab.setAttribute('aria-current', 'page');
    else tab.removeAttribute('aria-current');
  });
  $('.hero-analytics').hidden = view !== 'analytics';
  $('.camera-overlay').hidden = view !== 'monitoring';
  closeMenus();
}
function positionDayIndicator() {
  const selector = $('.day-selector');
  const selected = $('[aria-pressed="true"]', selector);
  const rect = selected.getBoundingClientRect();
  if (!rect.width) return;
  const parent = selector.getBoundingClientRect();
  const width = canvas.getBoundingClientRect().width;
  selector.style.setProperty('--day-left', `${(rect.left - parent.left) / width * 100}cqw`);
  selector.style.setProperty('--day-width', `${rect.width / width * 100}cqw`);
  selector.style.setProperty('--day-height', `${rect.height / width * 100}cqw`);
}
function renderSchedule() {
  $$('[data-day]').forEach(tab => {
    const selected = Number(tab.dataset.day) === state.day;
    tab.classList.toggle('is-active', selected);
    tab.setAttribute('aria-pressed', String(selected));
  });
  positionDayIndicator();
  const event = schedule[state.day][0];
  $('#activity-event').hidden = !event;
  $('.activity-empty').hidden = Boolean(event);
  if (event) {
    $('#activity-label').textContent = event.name;
    $('#activity-event').setAttribute('aria-label', `${event.name} at ${event.time}`);
    $('#activity-event').style.left = `${(Number(event.time.slice(0, 2)) - 8) * 25}%`;
  }
}
function showChartTooltip(index) {
  const data = periods[state.period];
  const tooltip = $('#chart-tooltip');
  $('span', tooltip).textContent = data.labels[index];
  const value = node('strong', '', data.values[index]);
  value.append(node('small', '', '/100'));
  $('strong', tooltip).replaceWith(value);
  const plotWidth = tooltip.parentElement.getBoundingClientRect().width;
  if (!plotWidth) return;
  const padding = canvas.getBoundingClientRect().width * .004;
  const halfWidth = tooltip.getBoundingClientRect().width / 2 + padding;
  const x = (index + .5) / data.values.length * plotWidth;
  tooltip.style.left = `${Math.max(halfWidth, Math.min(plotWidth - halfWidth, x)) / plotWidth * 100}%`;
}
function selectBar(index) {
  state.selected = index;
  $$('.chart-column, .hero-bar').forEach(bar => {
    const selected = Number(bar.dataset.index) === index;
    bar.classList.toggle('is-selected', selected);
    bar.setAttribute('aria-pressed', String(selected));
  });
  showChartTooltip(index);
}
function renderChart() {
  const data = periods[state.period];
  const bars = $('#chart-bars');
  const heroBars = $('#hero-bars');
  bars.replaceChildren();
  heroBars.replaceChildren();
  bars.style.gridTemplateColumns = `repeat(${data.values.length}, minmax(0, 1fr))`;
  data.values.forEach((value, index) => {
    const bar = button('', () => selectBar(index), 'chart-column');
    bar.dataset.index = index;
    bar.style.setProperty('--value', value);
    bar.setAttribute('aria-label', `${data.labels[index]}, field health score ${value} out of 100`);
    bar.append(node('i', 'bar-fill'), node('span', 'bar-value', `${value}%`), node('span', 'bar-month', data.labels[index]));
    bar.addEventListener('pointerenter', () => showChartTooltip(index));
    bar.addEventListener('focus', () => showChartTooltip(index));
    bar.addEventListener('pointerleave', () => showChartTooltip(state.selected));
    bar.addEventListener('blur', () => showChartTooltip(state.selected));
    bars.append(bar);
    const heroBar = button('', () => selectBar(index), 'hero-bar');
    heroBar.dataset.index = index;
    heroBar.style.setProperty('--value', value);
    heroBar.setAttribute('aria-label', `${data.labels[index]}, field health score ${value} out of 100`);
    heroBar.append(node('i'), node('span', '', `${value}%`), node('small', '', data.labels[index]));
    heroBars.append(heroBar);
  });
  const average = data.values.reduce((sum, value) => sum + value, 0) / data.values.length;
  $('.average-line').style.top = `${100 - average}%`;
  $('.chart-average').textContent = `Avg ${Math.round(average)}`;
  $('#health-score').textContent = data.score;
  $('#hero-health').replaceChildren(document.createTextNode(data.score), node('small', '', '/100'));
  $('#health-trend').textContent = `${data.trend}%`;
  $('#trend-period').textContent = data.comparison;
  $('.health-chart').setAttribute('aria-label', `${data.label} field health scores, ${data.labels.join(', ')}`);
  selectBar(state.selected);
}
function renderForecast() {
  const data = weather[state.weatherDay];
  const strip = $('#forecast-strip');
  strip.replaceChildren();
  data.temperatures.forEach((value, index) => {
    const slot = button('', () => {
      state.weatherIndex = index;
      state.weatherMeasure = 'temperature';
      renderForecast();
    }, 'forecast-slot');
    slot.setAttribute('aria-pressed', String(index === state.weatherIndex));
    slot.setAttribute('aria-label', `${data.times[index]}, ${temperature(value)}, humidity ${data.humidity[index]}%, wind ${data.wind[index]} kilometers per hour`);
    slot.append(node('span', '', temperature(value, true)), node('i'));
    strip.append(slot);
  });
  let value = temperature(data.temperatures[state.weatherIndex], true);
  if (state.weatherMeasure === 'humidity') value = `${data.humidity[state.weatherIndex]}%`;
  if (state.weatherMeasure === 'feels') value = temperature(data.feels[state.weatherIndex], true);
  if (state.weatherMeasure === 'wind') value = `${data.wind[state.weatherIndex]} km/h`;
  $('#weather-current-value').textContent = value;
  $$('[data-weather-measure]').forEach(control => {
    const selected = control.dataset.weatherMeasure === state.weatherMeasure;
    control.classList.toggle('is-active', selected);
    control.setAttribute('aria-pressed', String(selected));
  });
  $('#temperature-value').textContent = temperature(24.8);
  $('.outside-weather strong').textContent = temperature(22);
}
function renderNotifications() {
  const list = $('#notification-list');
  list.replaceChildren();
  $('#mark-read').disabled = !state.unread;
  if (!state.unread) {
    list.append(node('p', 'notification-empty', 'You’re all caught up.'));
    return;
  }
  [
    { icon: 'droplet', text: 'Morning watering completed in Greenhouse 01.', time: '09:20 · North Garden' },
    { icon: 'plant-2', text: 'Field health is up 12% this month.', time: '08:00 · Agricultural insights' }
  ].forEach(item => {
    const row = node('div', 'notification-item');
    const copy = node('div');
    copy.append(node('p', '', item.text), node('small', '', item.time));
    row.append(icon(item.icon), copy);
    list.append(row);
  });
}
function dataTable(headers, rows) {
  const table = node('table', 'data-table');
  const head = node('thead');
  const headerRow = node('tr');
  headers.forEach(header => {
    const th = node('th', '', header);
    th.scope = 'col';
    headerRow.append(th);
  });
  head.append(headerRow);
  const body = node('tbody');
  rows.forEach(row => {
    const tr = node('tr');
    row.forEach(value => tr.append(node('td', '', value)));
    body.append(tr);
  });
  table.append(head, body);
  return table;
}
function summaryStats(items) {
  const stats = node('div', 'dialog-stats');
  items.forEach(([label, value]) => {
    const group = node('div');
    group.append(node('span', '', label), node('strong', '', value));
    stats.append(group);
  });
  return stats;
}
function exportData(filename, headers, rows) {
  try {
    const escape = value => {
      let text = String(value);
      if (/^[=+@\-\t\r]/.test(text)) text = `'${text}`;
      return `"${text.replaceAll('"', '""')}"`;
    };
    const csv = '﻿' + [headers, ...rows].map(row => row.map(escape).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = node('a');
    link.href = url;
    link.download = filename;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    notify(`Downloaded ${filename}`);
  } catch {
    notify('The report could not be downloaded. Please try again.', true);
  }
}
function environmentRows() {
  return Object.entries(measurements).map(([key, measure]) => [measure.label, key === 'temperature' ? temperature(measure.value) : `${measure.value}${measure.unit}`, 'Within range']);
}
function weatherRows() {
  const data = weather[state.weatherDay];
  return data.times.map((time, index) => [time, temperature(data.temperatures[index]), `${data.humidity[index]}%`, `${data.wind[index]} km/h`]);
}
function openDialog(type) {
  closeMenus();
  if (!state.dialog) previousFocus = document.activeElement;
  state.dialog = type;
  const content = $('#dialog-content');
  const footer = $('#dialog-footer');
  content.replaceChildren();
  footer.replaceChildren();
  $('#dialog-eyebrow').textContent = state.profile.farm.toUpperCase();
  if (type === 'insights') {
    const data = periods[state.period];
    $('#dialog-title').textContent = 'Agricultural Insights';
    content.append(summaryStats([['Field health', `${data.score}/100`], ['Change', `+${data.trend}%`], ['Selected period', data.label]]));
    const table = dataTable(['Period', 'Health score', 'Growing condition'], data.labels.map((label, index) => [label, `${data.values[index]}/100`, data.values[index] >= 70 ? 'Healthy' : 'Needs attention']));
    $$('tbody tr', table)[state.selected].classList.add('is-selected');
    content.append(table);
    footer.append(node('span', '', 'Field health · January–August'), button('Download CSV', () => exportData('field-health.csv', ['Period', 'Health score'], data.labels.map((label, index) => [label, data.values[index]]))));
  } else if (type === 'weather') {
    const data = weather[state.weatherDay];
    $('#dialog-title').textContent = `${data.label}’s Weather Report`;
    content.append(summaryStats([['Temperature', temperature(data.temperatures[state.weatherIndex])], ['Humidity', `${data.humidity[state.weatherIndex]}%`], ['Wind', `${data.wind[state.weatherIndex]} km/h`]]));
    content.append(dataTable(['Time', 'Temperature', 'Humidity', 'Wind'], weatherRows()));
    footer.append(node('span', '', 'North Garden · Sunny conditions'), button('Download CSV', () => exportData('weather-report.csv', ['Time', 'Temperature', 'Humidity', 'Wind'], weatherRows())));
  } else if (type === 'activity') {
    $('#dialog-title').textContent = `${days[state.day]}’s Activities`;
    if (schedule[state.day].length) {
      const list = node('div', 'schedule-list');
      schedule[state.day].forEach(item => {
        const row = node('article', 'schedule-row');
        const copy = node('div');
        copy.append(node('h3', '', item.name), node('p', '', item.detail));
        const status = node('span', 'schedule-status');
        status.append(icon(item.status === 'Completed' ? 'circle-check' : 'clock'), document.createTextNode(item.status));
        row.append(node('time', '', item.time), copy, status);
        list.append(row);
      });
      content.append(list);
    } else {
      const empty = node('div', 'dialog-empty');
      empty.append(icon('calendar-check'), node('p', '', 'No activities scheduled for Tuesday.'));
      content.append(empty);
    }
    footer.append(node('span', '', `${schedule[state.day].length} activities · Greenhouse 01`), button('Next day', () => {
      state.day = (state.day + 1) % days.length;
      renderSchedule();
      openDialog('activity');
    }));
  } else if (type === 'environment') {
    const measure = measurements[state.metric];
    $('#dialog-title').textContent = 'Environmental Insights';
    const summary = node('div', 'environment-summary');
    const figure = node('div', 'environment-figure');
    const range = node('span', 'environment-range');
    range.append(icon('circle-check'), document.createTextNode(measure.range));
    const value = state.metric === 'temperature' ? temperature(measure.value) : `${measure.value}${measure.unit}`;
    figure.append(node('span', '', measure.label), node('strong', '', value), range);
    const details = node('div', 'environment-details');
    details.append(node('h3', '', 'A healthy place to grow.'), node('p', '', measure.description));
    const meter = node('div', 'environment-meter');
    meter.setAttribute('role', 'meter');
    meter.setAttribute('aria-label', measure.label);
    meter.setAttribute('aria-valuemin', '0');
    meter.setAttribute('aria-valuemax', '100');
    meter.setAttribute('aria-valuenow', String(measure.fill));
    meter.setAttribute('aria-valuetext', `${value}, within ideal range`);
    const fill = node('span');
    fill.style.width = `${measure.fill}%`;
    meter.append(fill);
    details.append(meter, node('p', '', 'Last reading 11:40 · Greenhouse 01'));
    summary.append(figure, details);
    content.append(summary);
    footer.append(node('span', '', '4 measurements within range'), button('Download CSV', () => exportData('greenhouse-readings.csv', ['Measurement', 'Reading', 'Status'], environmentRows())));
  } else if (type === 'profile') {
    $('#dialog-title').textContent = 'Profile & Preferences';
    formUnit = state.unit;
    const form = node('form', 'profile-form');
    form.id = 'profile-form';
    form.noValidate = true;
    [['Display name', 'name', state.profile.name], ['Farm name', 'farm', state.profile.farm]].forEach(([label, name, value]) => {
      const field = node('label', 'form-field');
      const input = node('input');
      input.name = name;
      input.value = value;
      input.required = true;
      input.maxLength = name === 'name' ? 24 : 48;
      input.autocomplete = name === 'name' ? 'name' : 'organization';
      input.setAttribute('aria-describedby', 'form-message');
      field.append(node('span', '', label), input);
      form.append(field);
    });
    const units = node('div', 'form-field');
    units.append(node('span', '', 'Temperature unit'));
    const choices = node('div', 'unit-choice');
    ['celsius', 'fahrenheit'].forEach(unit => {
      const control = button(unit === 'celsius' ? 'Celsius °C' : 'Fahrenheit °F', () => {
        formUnit = unit;
        $$('button', choices).forEach(option => option.setAttribute('aria-pressed', String(option.dataset.unit === unit)));
      }, '');
      control.dataset.unit = unit;
      control.setAttribute('aria-pressed', String(unit === formUnit));
      choices.append(control);
    });
    units.append(choices);
    form.append(units);
    const message = node('p', 'form-message');
    message.id = 'form-message';
    message.setAttribute('role', 'status');
    form.append(message);
    form.addEventListener('submit', saveProfile);
    content.append(form);
    const save = node('button', 'dialog-action', 'Save changes');
    save.type = 'submit';
    save.id = 'save-profile';
    save.setAttribute('form', 'profile-form');
    footer.append(node('span', '', 'Verdant · North Garden'), save);
  }
  $('#dialog-layer').hidden = false;
  $('.app-shell').inert = true;
  $('.dialog').focus();
}
function closeDialog() {
  $('#dialog-layer').hidden = true;
  $('.app-shell').inert = false;
  state.dialog = null;
  if (previousFocus?.isConnected && previousFocus.getClientRects().length) previousFocus.focus();
}
async function saveProfile(event) {
  event.preventDefault();
  if (state.saving) return;
  const form = event.currentTarget;
  const name = form.elements.name.value.trim();
  const farm = form.elements.farm.value.trim();
  const invalidName = name.length < 2;
  const invalidFarm = farm.length < 2;
  form.elements.name.setAttribute('aria-invalid', String(invalidName));
  form.elements.farm.setAttribute('aria-invalid', String(invalidFarm));
  if (invalidName || invalidFarm) {
    $('#form-message').textContent = 'Please enter a name and farm name with at least 2 characters.';
    (invalidName ? form.elements.name : form.elements.farm).focus();
    return;
  }
  state.saving = true;
  const selectedUnit = formUnit;
  const save = $('#save-profile');
  save.disabled = true;
  save.setAttribute('aria-busy', 'true');
  save.textContent = 'Saving…';
  $('#form-message').textContent = '';
  await new Promise(resolve => setTimeout(resolve, 260));
  state.profile = { name, farm };
  state.unit = selectedUnit;
  $('#profile-name').textContent = name;
  $('#profile-toggle').setAttribute('aria-label', `${name}, profile and preferences`);
  renderForecast();
  state.saving = false;
  if (state.dialog === 'profile' && save.isConnected) closeDialog();
  notify('Profile and preferences updated.');
}
function start() {
  if (started) return;
  started = true;
  renderChart();
  renderSchedule();
  renderForecast();
  renderNotifications();
  new ResizeObserver(() => showChartTooltip(state.selected)).observe($('.chart-plot'));
  new ResizeObserver(positionDayIndicator).observe($('.day-selector'));
  document.fonts.ready.then(() => { showChartTooltip(state.selected); positionDayIndicator(); });
  canvas.classList.add('has-started');
  $$('[data-view-target]').forEach(tab => tab.addEventListener('click', () => setView(tab.dataset.viewTarget)));
  $('.brand').addEventListener('click', event => { event.preventDefault(); setView('overview'); });
  $$('[data-day]').forEach(control => control.addEventListener('click', () => { state.day = Number(control.dataset.day); renderSchedule(); }));
  $$('[data-metric]').forEach(control => control.addEventListener('click', () => {
    state.metric = control.dataset.metric;
    $$('[data-metric]').forEach(tile => {
      const selected = tile.dataset.metric === state.metric;
      tile.classList.toggle('is-selected', selected);
      tile.setAttribute('aria-pressed', String(selected));
    });
    $('.environment-link').setAttribute('aria-label', `View ${measurements[state.metric].label.toLowerCase()} insights`);
  }));
  [['#profile-toggle', '#profile-menu'], ['#notification-toggle', '#notification-menu'], ['#period-toggle', '#period-menu'], ['#weather-toggle', '#weather-menu']].forEach(([trigger, menu]) => {
    $(trigger).addEventListener('click', event => { event.stopPropagation(); toggleMenu($(trigger), $(menu)); });
  });
  $$('[data-period]').forEach(option => option.addEventListener('click', () => {
    state.period = option.dataset.period;
    state.selected = periods[state.period].selected;
    $('#period-toggle span').textContent = periods[state.period].label;
    $$('[data-period]').forEach(item => item.setAttribute('aria-selected', String(item.dataset.period === state.period)));
    renderChart();
    closeMenus();
    $('#period-toggle').focus();
  }));
  $$('[data-weather-day]').forEach(option => option.addEventListener('click', () => {
    state.weatherDay = option.dataset.weatherDay;
    $('#weather-toggle span').textContent = weather[state.weatherDay].label;
    $$('[data-weather-day]').forEach(item => item.setAttribute('aria-selected', String(item.dataset.weatherDay === state.weatherDay)));
    renderForecast();
    closeMenus();
    $('#weather-toggle').focus();
  }));
  $$('[data-weather-measure]').forEach(control => control.addEventListener('click', () => { state.weatherMeasure = control.dataset.weatherMeasure; renderForecast(); }));
  $$('[data-open]').forEach(control => control.addEventListener('click', () => openDialog(control.dataset.open)));
  $('#dialog-close').addEventListener('click', closeDialog);
  $('#dialog-scrim').addEventListener('click', closeDialog);
  $('#mark-read').addEventListener('click', () => { state.unread = false; renderNotifications(); });
  $('#export-all').addEventListener('click', () => { closeMenus(); exportData('greenhouse-readings.csv', ['Measurement', 'Reading', 'Status'], environmentRows()); });
  $('#refresh-camera').addEventListener('click', async event => {
    const control = event.currentTarget;
    control.disabled = true;
    control.setAttribute('aria-busy', 'true');
    await new Promise(resolve => setTimeout(resolve, 300));
    control.disabled = false;
    control.removeAttribute('aria-busy');
    notify('Connect a greenhouse gateway to receive live camera updates.', true);
  });
  document.addEventListener('click', event => {
    if (!event.target.closest('.dropdown') && !event.target.closest('[aria-controls]')) closeMenus();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      if (state.dialog) closeDialog();
      else {
        const menu = $$('.dropdown').find(item => !item.hidden);
        const trigger = menu && $(`[aria-controls="${menu.id}"]`);
        closeMenus();
        trigger?.focus();
      }
    }
    const menu = event.target.closest('[role="listbox"]');
    const trigger = event.target.closest('[aria-haspopup="listbox"]');
    if ((event.key === 'ArrowDown' || event.key === 'ArrowUp') && (menu || trigger)) {
      event.preventDefault();
      const target = menu || document.getElementById(trigger.getAttribute('aria-controls'));
      if (target.hidden) toggleMenu(trigger, target);
      const options = $$('[role="option"]:not(:disabled)', target);
      const current = options.indexOf(document.activeElement);
      options[(current + (event.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length]?.focus();
    }
    if (state.dialog && event.key === 'Tab') {
      const controls = $$('button:not(:disabled), input, a[href], [tabindex="0"]', $('.dialog')).filter(control => control.getClientRects().length);
      if (!controls.length) { event.preventDefault(); return; }
      const first = controls[0];
      const last = controls.at(-1);
      if (event.shiftKey && (document.activeElement === first || document.activeElement === $('.dialog'))) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || document.activeElement === $('.dialog'))) { event.preventDefault(); first.focus(); }
    }
  });
}
start();
