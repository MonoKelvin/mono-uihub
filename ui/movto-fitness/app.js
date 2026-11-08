const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const NS = 'http://www.w3.org/2000/svg';

const metrics = {
  steps: { title: 'DAILY STEPS', label: 'Steps taken', goal: 22000, unit: 'steps', max: 100000, integer: true },
  calories: { title: 'CALORIES BURNED', label: 'Active calories', goal: 1680, unit: 'Cal', max: 10000, integer: true },
  water: { title: 'WATER INTAKE', label: 'Water consumed', goal: 3, unit: 'L', max: 15, integer: false }
};
const days = [
  { steps: 22000, calories: 1420, water: 2.2 },
  { steps: 18460, calories: 1310, water: 2.5 },
  { steps: 15620, calories: 1190, water: 1.8 },
  { steps: 23140, calories: 1760, water: 3 },
  { steps: 19800, calories: 1540, water: 2.7 },
  { steps: 12750, calories: 970, water: 2.1 },
  { steps: 0, calories: 0, water: 0 }
];
const runs = [
  { label: '5d ago', distance: 10.37, seconds: 3456, sport: 'Running' },
  { label: '9d ago', distance: 8.21, seconds: 2780, sport: 'Running' },
  { label: '14d ago', distance: 9.54, seconds: 3174, sport: 'Running' }
];
const weights = [
  { month: 'January', short: 'Jan', value: 78, x: 90 },
  { month: 'February', short: 'Feb', value: 95, x: 214 },
  { month: 'March', short: 'Mar', value: 72, x: 338 },
  { month: 'April', short: 'Apr', value: 75, x: 462 },
  { month: 'May', short: 'May', value: 80, x: 586 },
  { month: 'June', short: 'Jun', value: 67, x: 710 }
];
const sports = {
  Running: { speed: 3.37 / 1096, heart: 120, icon: 'ti-shoe' },
  Walking: { speed: 5 / 3600, heart: 98, icon: 'ti-walk' },
  Cycling: { speed: 18 / 3600, heart: 112, icon: 'ti-bike' }
};
let selectedDay = 0;
let selectedMonth = 3;
let weightGoal = 70;
let undoDay = null;
let sport = 'Running';
let runState = 'running';
let elapsedSeconds = 1096;
let distance = 3.37;
let lastTick = performance.now();
let ticker = null;
let toastTimeout;
let dialogKind = null;
let dialogMetric = null;
let returnFocus = null;

function showToast(message) {
  clearTimeout(toastTimeout);
  $('#toast-copy').textContent = message;
  $('#toast').classList.add('is-visible');
  toastTimeout = setTimeout(() => $('#toast').classList.remove('is-visible'), 2800);
}

function renderDay() {
  $$('.day').forEach((button, index) => {
    button.classList.toggle('is-selected', index === selectedDay);
    button.setAttribute('aria-pressed', String(index === selectedDay));
  });
  Object.entries(metrics).forEach(([key, metric]) => {
    const value = days[selectedDay][key];
    const percent = Math.round(value / metric.goal * 100);
    $(`#${key}-value`).textContent = key === 'water' ? String(value).replace('.', ',') : String(value);
    $(`#${key}-percent`).textContent = `${percent}%`;
    $(`#${key}-status`).textContent = value === 0 ? 'No Activity' : value >= metric.goal ? 'Completed' : 'In Progress';
    $(`[data-metric="${key}"]`).setAttribute('aria-label', `${metric.label}: ${value} of ${metric.goal} ${metric.unit}. Edit entry.`);
  });
  $('[data-action="undo-clear"]').disabled = !undoDay;
}

function formatDuration(total) {
  const seconds = Math.floor(total);
  return [Math.floor(seconds / 3600), Math.floor(seconds % 3600 / 60), seconds % 60].map((part) => String(part).padStart(2, '0')).join(':');
}

function updateElapsed() {
  const now = performance.now();
  if (runState === 'running') {
    const delta = (now - lastTick) / 1000;
    elapsedSeconds += delta;
    distance += delta * sports[sport].speed;
  }
  lastTick = now;
}

function renderTracking() {
  $('#timer-value').textContent = formatDuration(elapsedSeconds);
  $('#distance-value').textContent = distance.toFixed(2);
  $('#heart-value').textContent = runState === 'running' ? sports[sport].heart : runState === 'paused' ? 88 : 72;
  $('#tracking-status').replaceChildren();
  $('#tracking-status').append(runState === 'running' ? 'Tracking' : runState === 'paused' ? 'Workout' : 'Ready to', document.createElement('br'), runState === 'running' ? 'Now' : runState === 'paused' ? 'Paused' : 'Move');
  $('#pause-run').disabled = runState === 'stopped';
  $('#pause-run').setAttribute('aria-pressed', String(runState === 'paused'));
  $('#pause-run').setAttribute('aria-label', runState === 'paused' ? 'Resume workout' : 'Pause workout');
  $('#pause-run path').setAttribute('d', runState === 'paused' ? 'M8 5v14l11-7z' : 'M6 5h4v14H6zM14 5h4v14h-4z');
  $('#stop-run').setAttribute('aria-label', runState === 'stopped' ? 'Start workout' : 'Finish workout');
  $('#stop-run path').setAttribute('d', runState === 'stopped' ? 'M8 5v14l11-7z' : 'M6 6h12v12H6z');
  $('#sport-label').textContent = sport;
  $('.shoe-icon i').className = `ti ${sports[sport].icon}`;
}

function start() {
  if (ticker !== null) return;
  lastTick = performance.now();
  ticker = setInterval(() => {
    updateElapsed();
    renderTracking();
  }, 1000);
}

function pauseWorkout() {
  if (runState === 'stopped') return;
  updateElapsed();
  runState = runState === 'running' ? 'paused' : 'running';
  renderTracking();
  showToast(runState === 'paused' ? 'Workout paused' : 'Workout resumed');
}

function finishWorkout() {
  updateElapsed();
  if (runState === 'stopped') {
    elapsedSeconds = 0;
    distance = 0;
    runState = 'running';
    renderTracking();
    showToast('Workout started');
    return;
  }
  runState = 'stopped';
  if (elapsedSeconds >= 1) {
    runs.unshift({ label: 'Just now', distance, seconds: elapsedSeconds, sport });
    runs.length = 3;
    renderHistory();
  }
  renderTracking();
  showToast('Workout added to your history');
}

function renderHistory() {
  $$('.history-row').forEach((button, index) => {
    button.children[0].textContent = runs[index].label;
    button.children[1].textContent = `${runs[index].distance.toFixed(2)}km`;
    button.setAttribute('aria-label', `${runs[index].sport}, ${runs[index].label}, ${runs[index].distance.toFixed(2)} kilometers. View workout.`);
  });
}

function closeMenus() {
  $$('.popover').forEach((menu) => { menu.hidden = true; });
  $$('[aria-haspopup="menu"]').forEach((button) => button.setAttribute('aria-expanded', 'false'));
}

function toggleMenu(button) {
  const menu = document.getElementById(button.getAttribute('aria-controls'));
  const shouldOpen = menu.hidden;
  closeMenus();
  menu.hidden = !shouldOpen;
  button.setAttribute('aria-expanded', String(shouldOpen));
  if (shouldOpen) menu.querySelector('button:not(:disabled)').focus();
}

function openDialog(kind, title, description) {
  const focused = document.activeElement;
  const menu = focused.closest('.popover');
  returnFocus = menu ? $(`[aria-controls="${menu.id}"]`) : focused;
  closeMenus();
  dialogKind = kind;
  $('#dialog-title').textContent = title;
  $('#dialog-description').textContent = description;
  $('#entry-form').hidden = true;
  $('#workout-details').hidden = true;
  $('#dialog-action').hidden = true;
  $('#entry-error').textContent = '';
  $('#entry-value').removeAttribute('aria-invalid');
  $('#dialog-layer').hidden = false;
  $('.fitness-grid').inert = true;
  $('.dialog').focus();
}

function closeDialog() {
  if ($('#dialog-layer').hidden) return;
  $('#dialog-layer').hidden = true;
  $('.fitness-grid').inert = false;
  dialogKind = null;
  if (returnFocus?.isConnected && !returnFocus.disabled) returnFocus.focus();
}

function openEntry(key) {
  const metric = metrics[key];
  dialogMetric = key;
  openDialog('metric', metric.title, `April ${17 + selectedDay} · Daily goal: ${metric.goal} ${metric.unit}`);
  $('#entry-form').hidden = false;
  $('#entry-label').textContent = metric.label;
  $('#entry-unit').textContent = metric.unit;
  $('#entry-value').value = days[selectedDay][key];
  $('#entry-value').inputMode = metric.integer ? 'numeric' : 'decimal';
  $('#entry-value').focus();
  $('#entry-value').select();
}

function openWeightGoal() {
  openDialog('goal', 'YOUR WEIGHT GOAL', 'Choose the weight you are working toward.');
  $('#entry-form').hidden = false;
  $('#entry-label').textContent = 'Target weight';
  $('#entry-unit').textContent = 'kg';
  $('#entry-value').value = weightGoal;
  $('#entry-value').inputMode = 'decimal';
  $('#entry-value').focus();
  $('#entry-value').select();
}

function showWorkout(run, current = false) {
  openDialog(current ? 'workout' : 'history', `${run.sport.toUpperCase()} SUMMARY`, current ? runState === 'running' ? 'Every step brings you closer.' : runState === 'paused' ? 'Take a breath. Pick up where you left off.' : 'A little progress, every day.' : `${run.label} · A run to remember`);
  $('#workout-details').hidden = false;
  $('#summary-distance').textContent = `${run.distance.toFixed(2)} km`;
  $('#summary-duration').textContent = formatDuration(run.seconds);
  const pace = run.distance > 0 ? Math.round(run.seconds / run.distance) : null;
  $('#summary-pace').textContent = pace === null ? '— /km' : `${Math.floor(pace / 60)}:${String(pace % 60).padStart(2, '0')} /km`;
  $('#dialog-action').hidden = false;
  $('#dialog-action').firstChild.textContent = current && runState === 'paused' ? 'Resume workout' : current && runState === 'stopped' ? 'Start workout' : 'Keep moving';
}

function renderChart(index) {
  const item = weights[index];
  const y = 28 + (120 - item.value) * 3.9;
  $('#chart-crosshair').setAttribute('d', `M${item.x} 42V324`);
  $('#selected-point').setAttribute('cx', item.x);
  $('#selected-point').setAttribute('cy', y);
  $('#tooltip-month').textContent = `${item.month},`;
  $('#tooltip-weight').textContent = item.value;
  $('#chart-tooltip').style.setProperty('--point-x', `${item.x / 740 * 100}%`);
  $('#chart-tooltip').style.setProperty('--point-y', `${y / 430 * 100}%`);
  $('#chart-tooltip').classList.toggle('is-left', index < 2);
  $$('[data-month]').forEach((button, month) => {
    button.classList.toggle('is-selected', month === index);
    button.setAttribute('aria-pressed', String(month === selectedMonth));
  });
}

function renderWeightTable() {
  $('#weight-table-body').replaceChildren();
  weights.forEach((item, index) => {
    const row = document.createElement('tr');
    row.classList.toggle('is-selected', index === selectedMonth);
    [item.month, `${item.value} kg`, `${Math.max(0, item.value - weightGoal)} kg`].forEach((value) => {
      const cell = document.createElement('td');
      cell.textContent = value;
      row.append(cell);
    });
    $('#weight-table-body').append(row);
  });
}

function selectMonth(index) {
  selectedMonth = index;
  renderChart(index);
  renderWeightTable();
}

function exportCsv(filename, rows) {
  const csv = rows.map((row) => row.join(',')).join('\r\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  showToast('Your report is ready');
}

for (let tick = 0; tick < 100; tick++) {
  const angle = tick / 100 * Math.PI * 2;
  const line = document.createElementNS(NS, 'line');
  const inner = tick % 5 === 0 ? 103 : 107;
  line.setAttribute('x1', 120 + Math.sin(angle) * inner);
  line.setAttribute('y1', 120 - Math.cos(angle) * inner);
  line.setAttribute('x2', 120 + Math.sin(angle) * 119);
  line.setAttribute('y2', 120 - Math.cos(angle) * 119);
  line.setAttribute('class', 'dial-tick');
  $('#dial-ticks').append(line);
}

$$('.day').forEach((button) => button.addEventListener('click', () => {
  selectedDay = Number(button.dataset.day);
  renderDay();
}));
$$('[data-metric]').forEach((button) => button.addEventListener('click', () => openEntry(button.dataset.metric)));
$$('[aria-haspopup="menu"]').forEach((button) => button.addEventListener('click', () => toggleMenu(button)));
$('#pause-run').addEventListener('click', pauseWorkout);
$('#stop-run').addEventListener('click', finishWorkout);
$('#open-workout').addEventListener('click', () => {
  updateElapsed();
  showWorkout({ sport, distance, seconds: elapsedSeconds }, true);
});
$$('.history-row').forEach((button) => button.addEventListener('click', () => showWorkout(runs[Number(button.dataset.run)])));
$('#open-motivation').addEventListener('click', () => {
  openDialog('motivation', 'UNLOCK YOUR POTENTIAL', `Your next step starts now. ${metrics.steps.goal} steps, ${metrics.water.goal} L of water, and a little time for yourself.`);
  $('#dialog-action').hidden = false;
  $('#dialog-action').firstChild.textContent = runState === 'stopped' ? 'Start workout' : runState === 'paused' ? 'Resume workout' : 'Back to my workout';
});

$$('[data-sport]').forEach((button) => button.addEventListener('click', () => {
  updateElapsed();
  sport = button.dataset.sport;
  $$('[data-sport]').forEach((option) => option.setAttribute('aria-checked', String(option.dataset.sport === sport)));
  renderTracking();
  closeMenus();
  $('#sport-toggle').focus();
  showToast(`${sport} selected`);
}));

$$('[data-action]').forEach((button) => button.addEventListener('click', () => {
  switch (button.dataset.action) {
    case 'export-activity':
      exportCsv(`movto-april-${17 + selectedDay}.csv`, [['Date', 'Steps', 'Calories', 'Water (L)'], [`April ${17 + selectedDay}`, days[selectedDay].steps, days[selectedDay].calories, days[selectedDay].water]]);
      break;
    case 'clear-day':
      undoDay = { index: selectedDay, values: { ...days[selectedDay] } };
      days[selectedDay] = { steps: 0, calories: 0, water: 0 };
      renderDay();
      showToast('Day cleared · Undo in activity options');
      break;
    case 'undo-clear':
      days[undoDay.index] = undoDay.values;
      selectedDay = undoDay.index;
      undoDay = null;
      renderDay();
      showToast('Activity restored');
      break;
    case 'weight-goal':
      openWeightGoal();
      return;
    case 'weight-table': {
      const showTable = $('#weight-table-wrap').hidden;
      $('#weight-chart').hidden = showTable;
      $('#weight-table-wrap').hidden = !showTable;
      $('#table-menu-label').textContent = showTable ? 'View as chart' : 'View as table';
      break;
    }
    case 'export-weight':
      exportCsv('movto-weight-history.csv', [['Month', 'Weight (kg)', 'Goal (kg)'], ...weights.map((item) => [item.month, item.value, weightGoal])]);
      break;
  }
  const trigger = $(`[aria-controls="${button.closest('.popover').id}"]`);
  closeMenus();
  trigger.focus();
}));

$('#entry-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const raw = $('#entry-value').value.trim().replace(',', '.');
  const validSyntax = /^\d+(?:\.\d{1,2})?$/.test(raw);
  const value = Number(raw);
  const metric = dialogKind === 'metric' ? metrics[dialogMetric] : { max: 250, integer: false };
  const min = dialogKind === 'goal' ? 30 : 0;
  if (!validSyntax || value < min || value > metric.max || (metric.integer && !Number.isInteger(value))) {
    $('#entry-error').textContent = metric.integer ? `Enter a whole number from ${min} to ${metric.max}.` : `Enter a value from ${min} to ${metric.max}.`;
    $('#entry-value').setAttribute('aria-invalid', 'true');
    $('#entry-value').focus();
    return;
  }
  if (dialogKind === 'metric') {
    days[selectedDay][dialogMetric] = value;
    renderDay();
  } else {
    weightGoal = value;
    $('#weight-goal').textContent = value;
    renderWeightTable();
  }
  closeDialog();
  showToast('Entry saved');
});
$('#entry-value').addEventListener('input', () => {
  $('#entry-error').textContent = '';
  $('#entry-value').removeAttribute('aria-invalid');
});
$('#dialog-close').addEventListener('click', closeDialog);
$('#dialog-scrim').addEventListener('click', closeDialog);
$('#dialog-action').addEventListener('click', () => {
  if (dialogKind === 'motivation' || dialogKind === 'workout') {
    if (runState === 'paused') pauseWorkout();
    else if (runState === 'stopped') finishWorkout();
  }
  closeDialog();
});

$$('[data-month]').forEach((button) => button.addEventListener('click', () => selectMonth(Number(button.dataset.month))));
$('#weight-chart').addEventListener('pointermove', (event) => {
  const box = $('#weight-chart').getBoundingClientRect();
  const x = (event.clientX - box.left) / box.width * 740;
  const closest = weights.reduce((best, item, index) => Math.abs(item.x - x) < Math.abs(weights[best].x - x) ? index : best, 0);
  renderChart(closest);
});
$('#weight-chart').addEventListener('pointerleave', () => renderChart(selectedMonth));
$('#weight-chart').addEventListener('keydown', (event) => {
  if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
  event.preventDefault();
  const next = event.key === 'Home' ? 0 : event.key === 'End' ? 5 : Math.max(0, Math.min(5, selectedMonth + (event.key === 'ArrowRight' ? 1 : -1)));
  selectMonth(next);
});
$$('[data-month]').forEach((button) => button.addEventListener('focus', () => renderChart(Number(button.dataset.month))));

document.addEventListener('click', (event) => {
  if (!event.target.closest('.popover, [aria-haspopup="menu"]')) closeMenus();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    if (!$('#dialog-layer').hidden) closeDialog();
    else {
      const openMenu = $$('.popover').find((menu) => !menu.hidden);
      if (openMenu) {
        const trigger = $(`[aria-controls="${openMenu.id}"]`);
        closeMenus();
        trigger.focus();
      }
    }
  }
  if (!$('#dialog-layer').hidden && event.key === 'Tab') {
    const controls = [...$('.dialog').querySelectorAll('button:not(:disabled), input, [tabindex="0"]')].filter((element) => element.getClientRects().length);
    const first = controls[0];
    const last = controls.at(-1);
    if (event.shiftKey && (document.activeElement === first || document.activeElement === $('.dialog'))) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
  const menu = event.target.closest('.popover');
  if (menu && ['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
    event.preventDefault();
    const options = [...menu.querySelectorAll('button:not(:disabled)')];
    const current = options.indexOf(document.activeElement);
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? options.length - 1 : (current + (event.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length;
    options[next].focus();
  }
});
window.addEventListener('pagehide', () => {
  clearInterval(ticker);
  ticker = null;
  clearTimeout(toastTimeout);
});
window.addEventListener('pageshow', start);
renderDay();
renderHistory();
renderTracking();
renderWeightTable();
renderChart(selectedMonth);
start();
