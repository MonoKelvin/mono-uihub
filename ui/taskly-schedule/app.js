(() => {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const escapeHTML = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const baseDate = '2021-03-11';
  const defaults = { clock: '12', weekStart: 'Monday', reduceMotion: false, showCompleted: true, showUpgrade: true };
  let preferences = { ...defaults };
  try {
    const saved = JSON.parse(localStorage.getItem('taskly-ui-preferences') || '{}');
    for (const key of Object.keys(defaults)) {
      if (typeof saved[key] === typeof defaults[key]) preferences[key] = saved[key];
    }
  } catch {}
  if (!['12', '24'].includes(preferences.clock)) preferences.clock = '12';
  if (!['Monday', 'Sunday'].includes(preferences.weekStart)) preferences.weekStart = 'Monday';

  const tasks = $$('.task-row').map((row) => ({
    id: row.dataset.id,
    date: row.dataset.date,
    start: row.dataset.start,
    end: row.dataset.end,
    category: row.dataset.category,
    icon: row.dataset.icon,
    title: $('.task-title', row).textContent.trim(),
    description: $('.task-description', row)?.textContent.trim() || '',
    completed: row.dataset.completed === 'true',
    checklist: $$('[role="listitem"]', row).map((item) => ({ title: item.textContent.trim(), completed: false })),
    attendees: row.dataset.attendees?.split(',') || [],
  }));
  const pins = $$('.pinned-preview .pin-card').map((row) => ({
    id: row.dataset.id,
    date: row.dataset.date,
    start: row.dataset.time,
    category: row.dataset.category,
    icon: row.dataset.icon,
    title: $('.pin-title', row).textContent.trim(),
    description: $('.pin-note', row)?.textContent.trim() || '',
  }));
  pins.push({ id: 'invoice', date: '2021-03-19', start: '10:00', category: 'Work', icon: 'file-invoice', title: 'Send invoice to Shift', description: 'Send the March invoice after the design review.' });
  const earlierTasks = [
    ['2021-03-02', 'Portfolio review', '10:00', 'Work'],
    ['2021-03-03', 'Invoice follow-up', '11:00', 'Work'],
    ['2021-03-04', 'Sketch the homepage', '09:00', 'Work'],
    ['2021-03-08', 'Shift check-in', '10:00', 'Work'],
    ['2021-03-09', 'Prepare the kickoff', '14:00', 'Work'],
    ['2021-03-12', 'Design review with Elena', '10:30', 'Work'],
  ];
  earlierTasks.forEach(([date, title, start, category], index) => tasks.push({ id: `day-task-${index}`, date, title, start, end: '', category, icon: 'device-laptop', description: '', completed: false, checklist: [], attendees: [] }));

  const state = {
    tasks, pins, preferences,
    selectedDate: baseDate,
    calendarMonth: '2021-03',
    calendarRange: 'two',
    schedulePage: 0,
    pinsPage: 0,
    pinsQuery: '',
    pinsCategory: 'All',
    profile: { name: 'Mark Collins', email: 'mark.collins@example.com' },
    tracks: [{ id: 'godzilla', title: 'Godzilla', artist: 'Eminem', duration: 240, elapsed: 195, url: null, loaded: false }],
    currentTrack: 0,
    musicPage: 0,
    playing: false,
    shuffle: false,
    repeat: true,
    busy: false,
    confirmOpen: false,
    pendingDelete: null,
    returnFocus: null,
    afterConfirm: null,
    libraryError: '',
  };
  const canvas = $('.canvas');
  const shell = $('#app-shell');
  const workspace = $('#workspace-view');
  const home = $('#schedule-view');
  const audio = $('#audio-player');
  const layer = $('#confirm-layer');
  const motionQuery = matchMedia('(prefers-reduced-motion: reduce)');
  const clockStarted = Date.now();
  const albumMarkup = $('#album-cover').innerHTML;
  const profileImage = $('#profile-avatar img')?.getAttribute('src') || '';
  const avatarImages = Object.fromEntries($$('[data-person] img').map((image) => [image.parentElement.dataset.person, image.getAttribute('src')]));
  let started = false;
  let clockTimer;
  let notificationTimer;
  let confirmTimeline;

  const icon = (name) => `<i class="ti ti-${escapeHTML(name)}" aria-hidden="true"></i>`;
  const solid = (name) => `<svg viewBox="0 0 24 24" aria-hidden="true"><use href="#icon-${name}-solid"/></svg>`;
  const dateObject = (value) => new Date(`${value}T12:00:00Z`);
  const dateKey = (value) => value.toISOString().slice(0, 10);
  const addDays = (value, amount) => {
    const date = dateObject(value);
    date.setUTCDate(date.getUTCDate() + amount);
    return dateKey(date);
  };
  const validDate = (value) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const date = dateObject(value);
    return Number.isFinite(date.getTime()) && dateKey(date) === value && date.getUTCFullYear() >= 1900 && date.getUTCFullYear() <= 2100;
  };
  const validTime = (value) => /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
  const formatTime = (value) => {
    if (!value) return '';
    const [hours, minutes] = value.split(':').map(Number);
    if (state.preferences.clock === '24') return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    return `${hours % 12 || 12}:${String(minutes).padStart(2, '0')} ${hours < 12 ? 'AM' : 'PM'}`;
  };
  const shortDate = (value) => dateObject(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
  const fullDate = (value) => dateObject(value).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
  const reducedMotion = () => motionQuery.matches || state.preferences.reduceMotion;
  const routeName = () => location.hash.slice(1).split('?')[0] || 'schedule';
  const avatarMarkup = () => profileImage ? `<img src="${escapeHTML(profileImage)}" width="240" height="240" alt="">` : escapeHTML(state.profile.name.split(/\s+/).map((part) => part[0]).slice(0, 2).join(''));

  function savePreferences() {
    try { localStorage.setItem('taskly-ui-preferences', JSON.stringify(state.preferences)); } catch {}
  }

  function applyPreferences() {
    canvas.dataset.motion = reducedMotion() ? 'reduce' : 'full';
    $('#upgrade-widget').hidden = !state.preferences.showUpgrade;
    renderClock();
    if (confirmTimeline && state.confirmOpen && reducedMotion()) confirmTimeline.progress(1).pause();
  }

  function notice(message) {
    const element = $('#notification');
    clearTimeout(notificationTimer);
    element.textContent = message;
    element.hidden = false;
    notificationTimer = setTimeout(() => { element.hidden = true; }, 4200);
  }

  function closeMenus(returnFocus = false) {
    $$('.select-options:not([hidden])').forEach((panel) => {
      panel.hidden = true;
      const trigger = $(`[aria-controls="${panel.id}"]`);
      trigger?.setAttribute('aria-expanded', 'false');
      if (returnFocus) trigger?.focus({ preventScroll: true });
    });
  }

  function navigate(route) {
    if (state.busy) return;
    closeMenus();
    if (location.hash === `#${route}`) renderRoute();
    else location.hash = route;
  }

  function updateScheduleHash() {
    if (routeName() !== 'schedule') return;
    const params = new URLSearchParams();
    if (state.selectedDate !== baseDate) params.set('date', state.selectedDate);
    if (state.schedulePage) params.set('page', String(state.schedulePage + 1));
    history.replaceState(null, '', `#schedule${params.size ? `?${params}` : ''}`);
  }

  function updatePinsHash() {
    const params = new URLSearchParams();
    if (state.pinsQuery) params.set('q', state.pinsQuery);
    if (state.pinsCategory !== 'All') params.set('category', state.pinsCategory);
    if (state.pinsPage) params.set('page', String(state.pinsPage + 1));
    history.replaceState(null, '', `#pins${params.size ? `?${params}` : ''}`);
  }

  function taskPresentation(task) {
    if (task.completed) return { className: 'done', height: 5.2 };
    const long = task.title.length > 28;
    if (task.attendees.length) return { className: 'meeting', height: long ? 13.5 : 12 };
    if (task.checklist.length) return { className: 'checklist', height: long ? 12.3 : 11 };
    if (long || task.description.length > 90) return { className: 'long', height: 12 };
    if (task.description.length > 28) return { className: 'note', height: 9.2 };
    return { className: 'short', height: 6.8 };
  }

  function schedulePages() {
    const entries = state.tasks.filter((task) => task.date === state.selectedDate && (state.preferences.showCompleted || !task.completed)).sort((a, b) => a.start.localeCompare(b.start));
    const total = entries.reduce((sum, task, index) => sum + taskPresentation(task).height + (index ? .7 : 0), 0);
    const budget = total <= 53.1 ? 53.1 : 49.5;
    const pages = [[]];
    let used = 0;
    for (const task of entries) {
      const size = taskPresentation(task).height + (pages.at(-1).length ? .7 : 0);
      if (used + size > budget && pages.at(-1).length) { pages.push([]); used = 0; }
      pages.at(-1).push(task);
      used += taskPresentation(task).height + (pages.at(-1).length > 1 ? .7 : 0);
    }
    return pages;
  }

  function attendeeMarkup(names) {
    const classes = ['rose', 'mint', 'sand'];
    const avatars = names.slice(0, 3).map((name, index) => `<span class="mini-avatar avatar--${classes[index]}" data-person="${escapeHTML(name)}">${avatarImages[name] ? `<img src="${escapeHTML(avatarImages[name])}" width="280" height="280" alt="">` : escapeHTML(name[0])}</span>`).join('');
    return `<span class="attendees"><span class="avatar-stack">${avatars}</span><span>${names.length > 3 ? `+${names.length - 3} attendees` : `${names.length} ${names.length === 1 ? 'attendee' : 'attendees'}`}</span></span>`;
  }

  function renderSchedule() {
    const date = dateObject(state.selectedDate);
    $('#schedule-title').textContent = state.selectedDate === baseDate ? 'Today’s schedule' : 'Your schedule';
    $('#schedule-date').textContent = `${date.toLocaleDateString('en-GB', { weekday: 'long', timeZone: 'UTC' })} ${date.getUTCDate()}`;
    const pages = schedulePages();
    state.schedulePage = Math.max(0, Math.min(state.schedulePage, pages.length - 1));
    const page = pages[state.schedulePage];
    const container = $('#schedule-content');
    if (!$('#task-list')) container.innerHTML = '<div class="task-list" id="task-list"></div><div class="pagination schedule-pagination" id="schedule-pagination" hidden></div>';
    const list = $('#task-list');
    if (!page.length) {
      list.innerHTML = `<div class="empty-state">${icon('calendar-plus')}<h2>A little room in your day</h2><p>Nothing scheduled for ${escapeHTML(shortDate(state.selectedDate))}.</p><button class="button" type="button" data-action="new-task">Add a task</button></div>`;
      list.classList.add('is-empty');
    } else {
      list.classList.remove('is-empty');
      list.innerHTML = page.map((task) => {
        const presentation = taskPresentation(task);
        const details = task.completed ? '' : `${task.description ? `<span class="task-description">${escapeHTML(task.description.length > 120 ? `${task.description.slice(0, 117)}…` : task.description)}</span>` : ''}${task.checklist.length ? `<span class="task-checklist" role="list">${task.checklist.map((entry) => `<span role="listitem">${escapeHTML(entry.title)}</span>`).join('')}</span>` : ''}${task.attendees.length ? attendeeMarkup(task.attendees) : ''}`;
        return `<article class="task-row task-row--${presentation.className}" data-id="${task.id}" style="--task-height: ${presentation.height}cqw"><button class="completion-button${task.completed ? ' is-completed' : ''}" type="button" data-action="complete" data-id="${task.id}" aria-label="${task.completed ? 'Reopen' : 'Complete'} ${escapeHTML(task.title)}" aria-pressed="${task.completed}">${task.completed ? solid('check') : '<span aria-hidden="true"></span>'}</button><button class="task-card" type="button" data-action="task" data-id="${task.id}"><span class="task-icon task-icon--${task.icon}" aria-hidden="true">${icon(task.icon)}</span><span class="task-copy"><strong class="task-title">${escapeHTML(task.title)}</strong>${details}</span><time class="task-time">${escapeHTML(formatTime(task.start))}${task.end ? `<br>${escapeHTML(formatTime(task.end))}` : ''}</time></button></article>`;
      }).join('');
    }
    const pagination = $('#schedule-pagination');
    pagination.hidden = pages.length <= 1;
    pagination.innerHTML = `<button class="icon-button icon-button--tiny" type="button" data-action="schedule-prev" aria-label="Previous tasks" ${state.schedulePage === 0 ? 'disabled' : ''}>${icon('arrow-left')}</button><span>${state.schedulePage + 1} / ${pages.length}</span><button class="icon-button icon-button--tiny" type="button" data-action="schedule-next" aria-label="Next tasks" ${state.schedulePage === pages.length - 1 ? 'disabled' : ''}>${icon('arrow-right')}</button>`;
    updateScheduleHash();
  }

  function renderPinsPreview() {
    $('#pinned-preview').innerHTML = state.pins.slice(0, 2).map((pin, index) => {
      const date = `${shortDate(pin.date)}${pin.start ? ` - ${formatTime(pin.start)}` : ''}`;
      if (index === 0) return `<button class="pin-card pin-card--featured" type="button" data-action="pin" data-id="${pin.id}"><span class="pin-icon" aria-hidden="true">${icon(pin.icon)}</span><span class="pin-copy"><strong class="pin-title">${escapeHTML(pin.title)}</strong><span class="pin-date">${escapeHTML(date)}</span><span class="tag">${escapeHTML(pin.category)}</span><span class="pin-note">${escapeHTML(pin.description)}</span></span></button>`;
      return `<button class="pin-card pin-card--compact" type="button" data-action="pin" data-id="${pin.id}"><span class="pin-icon" aria-hidden="true">${icon(pin.icon)}</span><strong class="pin-title">${escapeHTML(pin.title)}</strong><span class="pin-date">${escapeHTML(shortDate(pin.date))}</span></button>`;
    }).join('');
    if (!state.pins.length) $('#pinned-preview').innerHTML = '<p class="sidebar-empty">Keep an important date close.</p>';
  }

  function renderCalendar() {
    const first = `${state.calendarMonth}-01`;
    const date = dateObject(first);
    $('#calendar-heading').textContent = `${date.toLocaleDateString('en-GB', { month: 'long', timeZone: 'UTC' })}, ${date.getUTCFullYear()}`;
    const weekStart = state.preferences.weekStart === 'Monday' ? 1 : 0;
    const names = weekStart ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    $('#calendar-weekdays').innerHTML = names.map((name) => `<span>${name}</span>`).join('');
    let start = addDays(first, -((date.getUTCDay() - weekStart + 7) % 7));
    let count = 14;
    if (state.calendarRange === 'full') {
      const end = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0, 12));
      count = Math.ceil(((end.getTime() - dateObject(start).getTime()) / 86400000 + 1) / 7) * 7;
    } else if (state.selectedDate.startsWith(state.calendarMonth) && state.selectedDate >= addDays(start, 14)) {
      const selected = dateObject(state.selectedDate);
      start = addDays(state.selectedDate, -((selected.getUTCDay() - weekStart + 7) % 7) - 7);
    }
    const events = new Set([...state.tasks.map((task) => task.date), ...state.pins.map((pin) => pin.date)]);
    const grid = $('#calendar-grid');
    grid.dataset.range = state.calendarRange;
    grid.setAttribute('aria-label', date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' }));
    grid.innerHTML = Array.from({ length: count }, (_, index) => {
      const value = addDays(start, index);
      const selected = value === state.selectedDate;
      return `<button class="calendar-day${selected ? ' is-selected' : events.has(value) ? ' has-event' : ' is-quiet'}${value.startsWith(state.calendarMonth) ? '' : ' is-outside'}" type="button" data-action="date" data-date="${value}" aria-label="${escapeHTML(fullDate(value))}${events.has(value) ? ', scheduled items' : ''}" aria-pressed="${selected}">${dateObject(value).getUTCDate()}</button>`;
    }).join('');
    $('#calendar-range-trigger').textContent = state.calendarRange === 'full' ? 'Full month' : 'Two weeks';
    $$('#calendar-range-list button').forEach((option) => {
      const selected = option.dataset.value === state.calendarRange;
      option.setAttribute('aria-selected', String(selected));
      option.classList.toggle('is-selected', selected);
    });
    $('[data-action="calendar-prev"]').disabled = state.calendarMonth === '1900-01';
    $('[data-action="calendar-next"]').disabled = state.calendarMonth === '2100-12';
  }

  function renderClock() {
    const minutes = 8 * 60 + 48 + Math.floor((Date.now() - clockStarted) / 60000);
    const hour = Math.floor(minutes / 60) % 24;
    $('#clock-time').textContent = formatTime(`${String(hour).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`);
  }

  function viewHeader(title, back = 'schedule') {
    return `<header class="workspace-header"><div><button class="back-button" type="button" data-action="back" data-back="${escapeHTML(back)}">${icon('arrow-left')}<span>${back === 'pins' ? 'Weekly pins' : 'Your schedule'}</span></button><h1 tabindex="-1">${escapeHTML(title)}</h1></div><button class="profile-avatar" type="button" data-action="settings" aria-label="My settings">${avatarMarkup()}</button></header>`;
  }

  function emptyMarkup(title, description, action, label, symbol = 'calendar-plus') {
    return `<div class="empty-state">${icon(symbol)}<h2>${escapeHTML(title)}</h2><p>${escapeHTML(description)}</p><button class="button" type="button" data-action="${action}">${escapeHTML(label)}</button></div>`;
  }

  function selectMarkup(name, value, options, label) {
    return `<div class="custom-select"><input type="hidden" name="${name}" value="${escapeHTML(value)}"><button class="select-trigger" id="${name}-trigger" type="button" data-action="select" role="combobox" aria-label="${escapeHTML(label)}" aria-haspopup="listbox" aria-expanded="false" aria-controls="${name}-options"><span>${escapeHTML(value)}</span>${icon('chevron-down')}</button><div class="select-options" id="${name}-options" role="listbox" aria-label="${escapeHTML(label)}" hidden>${options.map((option) => {
      const item = typeof option === 'string' ? { value: option } : option;
      const selected = item.value === value;
      return `<button class="select-option${selected ? ' is-selected' : ''}" type="button" role="option" aria-selected="${selected}"${item.disabled ? ' aria-disabled="true" tabindex="-1"' : ''} data-action="select-option" data-value="${escapeHTML(item.value)}" data-name="${name}">${escapeHTML(item.value)}${selected ? icon('check') : ''}</button>`;
    }).join('')}</div></div>`;
  }

  function fieldMarkup(name, label, value, { optional = false, maxlength = 90, placeholder = '', inputmode = 'text' } = {}) {
    return `<div class="field"><label for="edit-${name}">${escapeHTML(label)}${optional ? ' (optional)' : ''}</label><input id="edit-${name}" name="${name}" type="text" inputmode="${inputmode}" maxlength="${maxlength}" value="${escapeHTML(value)}" placeholder="${escapeHTML(placeholder)}" autocomplete="off" ${optional ? '' : 'required aria-required="true"'} aria-describedby="edit-${name}-help"><p class="field-help" id="edit-${name}-help" aria-live="polite"></p></div>`;
  }

  function renderEditor(kind, id) {
    const entries = kind === 'pin' ? state.pins : state.tasks;
    const isNew = id === 'new';
    const item = isNew ? { id: '', title: '', date: state.selectedDate, start: kind === 'pin' ? '' : '09:00', end: '', category: 'Personal', description: '', checklist: [], attendees: [], completed: false } : entries.find((entry) => entry.id === id);
    if (!item) return renderMissing(kind);
    const title = isNew ? kind === 'pin' ? 'New weekly pin' : 'A new plan for your day' : kind === 'pin' ? 'Weekly pin' : 'Task details';
    workspace.innerHTML = `${viewHeader(title, kind === 'pin' ? 'pins' : 'schedule')}<div class="workspace-body"><form class="editor-form" id="editor-form" data-kind="${kind}" data-id="${escapeHTML(item.id)}" novalidate><div class="editor-columns"><div class="editor-main">${fieldMarkup('title', kind === 'pin' ? 'Pin title' : 'Task title', item.title)}<div class="field-pair">${fieldMarkup('date', 'Date', item.date, { maxlength: 10, placeholder: 'YYYY-MM-DD', inputmode: 'numeric' })}${fieldMarkup('start', kind === 'pin' ? 'Time' : 'Start time', item.start, { optional: kind === 'pin', maxlength: 5, placeholder: '09:00', inputmode: 'numeric' })}</div><div class="field"><label for="edit-description">Notes (optional)</label><textarea id="edit-description" name="description" maxlength="300" aria-describedby="edit-description-help">${escapeHTML(item.description)}</textarea><p class="field-help" id="edit-description-help" aria-live="polite"></p></div>${item.checklist?.length ? `<div class="task-detail-checklist"><h2>Checklist</h2>${item.checklist.map((entry, index) => `<label class="check-label"><input type="checkbox" name="check-${index}" ${entry.completed ? 'checked' : ''}><span>${escapeHTML(entry.title)}</span></label>`).join('')}</div>` : ''}</div><aside class="editor-side"><h2>Make it yours</h2><div class="field"><label id="category-label">Category</label>${selectMarkup('category', item.category, ['Personal', 'Work', 'Health', { value: 'Shared workspace', disabled: true }], 'Task category')}</div>${kind === 'task' ? `${fieldMarkup('end', 'End time', item.end, { optional: true, maxlength: 5, placeholder: '10:00', inputmode: 'numeric' })}<label class="check-label"><input type="checkbox" name="completed" ${item.completed ? 'checked' : ''}><span>Completed</span></label>` : '<p class="side-note">A weekly pin keeps an important date in view.</p>'}${item.attendees?.length ? `<p class="side-note">${item.attendees.length} attendees<br>${item.attendees.map(escapeHTML).join(', ')}</p>` : ''}</aside></div><div class="form-footer">${isNew ? '<span></span>' : `<button class="button button--text" type="button" data-action="delete" data-kind="${kind}" data-id="${item.id}">${icon('trash')}Delete ${kind}</button>`}<div class="footer-actions"><button class="button button--quiet" type="button" data-action="back" data-back="${kind === 'pin' ? 'pins' : 'schedule'}">Cancel</button><button class="button" type="submit">${isNew ? `Add ${kind === 'pin' ? 'weekly pin' : 'task'}` : 'Save changes'}</button></div></div><p class="form-status" id="editor-status" role="status"></p></form></div>`;
  }

  function renderPins() {
    workspace.innerHTML = `${viewHeader('Everything worth pinning')}<div class="workspace-body"><div class="view-toolbar"><div class="search-box">${icon('search')}<input id="pin-search" type="search" value="${escapeHTML(state.pinsQuery)}" placeholder="Find a weekly pin" aria-label="Search weekly pins" autocomplete="off"></div><div class="pin-filter">${selectMarkup('pin-category', state.pinsCategory, ['All', 'Personal', 'Work', 'Health'], 'Filter pins by category')}</div><button class="button" type="button" data-action="new-pin">${icon('plus')}New pin</button></div><div class="pin-list" id="pin-results"></div><div class="pagination" id="pin-pagination"></div></div>`;
    renderPinResults();
  }

  function renderPinResults() {
    const matches = state.pins.filter((pin) => (state.pinsCategory === 'All' || pin.category === state.pinsCategory) && `${pin.title} ${pin.description}`.toLowerCase().includes(state.pinsQuery.toLowerCase().trim()));
    const pages = Math.max(1, Math.ceil(matches.length / 4));
    state.pinsPage = Math.max(0, Math.min(state.pinsPage, pages - 1));
    $('#pin-results').innerHTML = matches.length ? matches.slice(state.pinsPage * 4, state.pinsPage * 4 + 4).map((pin) => `<div class="pin-list-row"><span class="pin-icon" aria-hidden="true">${icon(pin.icon)}</span><button class="pin-list-main" type="button" data-action="pin" data-id="${pin.id}"><span class="pin-list-title"><strong>${escapeHTML(pin.title)}</strong><span>${escapeHTML(pin.category)}</span></span></button><span class="pin-list-meta">${escapeHTML(shortDate(pin.date))}${pin.start ? `<br>${escapeHTML(formatTime(pin.start))}` : ''}</span></div>`).join('') : state.pins.length ? emptyMarkup('No pins found', 'Try another title or clear your filters.', 'clear-pins', 'Clear filters', 'search') : emptyMarkup('No weekly pins yet', 'Keep your next important date close.', 'new-pin', 'Add a weekly pin');
    $('#pin-pagination').hidden = pages === 1;
    $('#pin-pagination').innerHTML = `<button class="icon-button" type="button" data-action="pins-prev" aria-label="Previous pins" ${state.pinsPage === 0 ? 'disabled' : ''}>${icon('arrow-left')}</button><span>${state.pinsPage + 1} / ${pages}</span><button class="icon-button" type="button" data-action="pins-next" aria-label="Next pins" ${state.pinsPage === pages - 1 ? 'disabled' : ''}>${icon('arrow-right')}</button>`;
    updatePinsHash();
  }

  function renderSettings(section = 'profile') {
    if (!['profile', 'preferences', 'connections'].includes(section)) section = 'profile';
    workspace.innerHTML = `${viewHeader('My settings')}<div class="workspace-body"><div class="settings-tabs" role="tablist" aria-label="Settings">${['profile', 'preferences', 'connections'].map((tab) => `<button type="button" role="tab" aria-selected="${tab === section}" data-action="settings-tab" data-tab="${tab}">${tab[0].toUpperCase() + tab.slice(1)}</button>`).join('')}</div><div id="settings-panel" role="tabpanel" aria-label="${section}"></div></div>`;
    const panel = $('#settings-panel');
    if (section === 'profile') {
      panel.innerHTML = `<form id="profile-form" novalidate><div class="settings-profile"><div class="settings-portrait"><span class="profile-avatar">${avatarMarkup()}</span><strong>Your personal space</strong></div><div>${fieldMarkup('profile-name', 'Your name', state.profile.name, { maxlength: 50 })}<div class="field"><label for="profile-email">Email address</label><input id="profile-email" name="email" type="email" value="${escapeHTML(state.profile.email)}" autocomplete="email" required aria-required="true" aria-describedby="profile-email-help"><p class="field-help" id="profile-email-help" aria-live="polite"></p></div><div class="form-footer"><span></span><button class="button" type="submit">Save changes</button></div><p class="form-status" id="profile-status" role="status"></p></div></div></form>`;
    } else if (section === 'preferences') {
      panel.innerHTML = `<div class="preference-row"><div class="preference-copy"><strong>Clock format</strong><p>The time, just how you like it.</p></div><div class="segmented" role="group" aria-label="Clock format">${['12', '24'].map((value) => `<button type="button" data-action="clock-format" data-value="${value}" aria-pressed="${state.preferences.clock === value}">${value} hour</button>`).join('')}</div></div><div class="preference-row"><div class="preference-copy"><strong>Start the week on</strong><p>Your calendar follows this choice.</p></div><div class="segmented" role="group" aria-label="First day of the week">${['Monday', 'Sunday'].map((value) => `<button type="button" data-action="week-start" data-value="${value}" aria-pressed="${state.preferences.weekStart === value}">${value}</button>`).join('')}</div></div>${[['showCompleted', 'Show completed tasks', 'Keep finished plans on your timeline.'], ['reduceMotion', 'Reduce motion', 'Quieter transitions, the same familiar space.'], ['showUpgrade', 'Show Taskly Plus', 'Keep the Plus card in your personal space.']].map(([key, title, description]) => `<div class="preference-row"><div class="preference-copy"><strong>${title}</strong><p>${description}</p></div><label class="switch"><input type="checkbox" data-preference="${key}" aria-label="${title}" ${state.preferences[key] ? 'checked' : ''}></label></div>`).join('')}`;
    } else {
      panel.innerHTML = `<div class="connection-row"><div class="connection-copy"><strong>Calendar sync</strong><p>Not connected</p></div><button class="button button--quiet button--small" type="button" data-action="connect-calendar">Connect calendar</button></div><div class="connection-row"><div class="connection-copy"><strong>Music library</strong><p>Audio files from your device.</p></div><button class="button button--quiet button--small" type="button" data-action="music">Open library</button></div><div class="connection-row"><div class="connection-copy"><strong>Email reminders</strong><p>Not connected</p></div><button class="button button--quiet button--small" type="button" data-action="connect-reminders">Connect email</button></div><p class="form-status" id="connections-status" role="status"></p><div class="form-footer"><span></span><button class="button" type="button" data-action="export-schedule">${icon('download')}Export day as calendar</button></div>`;
    }
  }

  function renderMusic() {
    const track = state.tracks[state.currentTrack];
    const pages = Math.max(1, Math.ceil(state.tracks.length / 5));
    state.musicPage = Math.max(0, Math.min(state.musicPage, pages - 1));
    workspace.innerHTML = `${viewHeader('A little music, a little focus')}<div class="workspace-body"><div class="music-view-summary"><span class="album-cover" aria-hidden="true">${albumMarkup}</span><div><h2>${escapeHTML(track.title)}</h2><p>${escapeHTML(track.artist)}</p></div><button class="play-button" type="button" data-action="play" aria-label="${state.playing ? 'Pause' : 'Play'} ${escapeHTML(track.title)}">${solid(state.playing ? 'pause' : 'play')}</button></div><div class="library-toolbar"><h2>Your queue</h2><button class="button" type="button" data-action="add-audio">${icon('plus')}Add audio files</button></div><div class="library-list">${state.tracks.slice(state.musicPage * 5, state.musicPage * 5 + 5).map((entry) => `<button class="library-row${entry.id === track.id ? ' is-current' : ''}" type="button" data-action="choose-track" data-id="${entry.id}" aria-label="${escapeHTML(entry.title)}, ${entry.url ? 'audio file' : 'not connected'}">${icon(entry.id === track.id && state.playing ? 'player-pause' : 'music')}<span class="library-row-copy"><strong title="${escapeHTML(entry.title)}">${escapeHTML(entry.title)}</strong><small>${escapeHTML(entry.artist)}</small></span><span>${entry.url ? secondsText(entry.duration) : 'Not connected'}</span></button>`).join('')}</div><p class="form-status${state.libraryError ? ' is-error' : ''}" id="library-status" role="status">${escapeHTML(state.libraryError || 'Add an audio file from your device to listen.')}</p><div class="pagination" ${pages === 1 ? 'hidden' : ''}><button class="icon-button" type="button" data-action="music-prev" aria-label="Previous audio files" ${state.musicPage === 0 ? 'disabled' : ''}>${icon('arrow-left')}</button><span>${state.musicPage + 1} / ${pages}</span><button class="icon-button" type="button" data-action="music-next" aria-label="Next audio files" ${state.musicPage === pages - 1 ? 'disabled' : ''}>${icon('arrow-right')}</button></div></div>`;
  }

  function renderPlans() {
    workspace.innerHTML = `${viewHeader('More room with Taskly Plus')}<div class="workspace-body"><div class="plans-content"><div><h2>For the plans<br>you haven’t made yet.</h2><p>Unlimited tasks, weekly pins and a more personal place to work.</p><button class="button" type="button" data-action="connect-billing">Continue with Plus</button><p class="form-status" id="billing-status" role="status"></p></div><div class="plan-features"><span class="plan-feature">${icon('check')}Unlimited daily tasks</span><span class="plan-feature">${icon('check')}More weekly pins</span><span class="plan-feature">${icon('check')}Personal workspace</span><span class="plan-feature">${icon('check')}Calendar connections</span></div></div></div>`;
  }

  function renderMissing(kind = 'page') {
    workspace.innerHTML = `${viewHeader('Let’s find your way back')}<div class="workspace-body">${emptyMarkup(`${kind[0].toUpperCase() + kind.slice(1)} not found`, 'It may have been removed. Your other plans are still here.', 'home', 'Back to your day', 'search')}</div>`;
  }

  function renderRoute(focus = true) {
    if (state.busy) return;
    const [path, query = ''] = (location.hash.slice(1) || 'schedule').split('?');
    const params = new URLSearchParams(query);
    home.hidden = path !== 'schedule';
    workspace.hidden = path === 'schedule';
    if (path === 'schedule') {
      const selected = params.get('date');
      if (selected && validDate(selected)) { state.selectedDate = selected; state.calendarMonth = selected.slice(0, 7); }
      if (params.has('page')) state.schedulePage = Math.max(0, Number(params.get('page')) - 1 || 0);
      renderSchedule();
      renderCalendar();
    } else if (path === 'pins') {
      if (params.has('q')) state.pinsQuery = params.get('q');
      if (['All', 'Personal', 'Work', 'Health'].includes(params.get('category'))) state.pinsCategory = params.get('category');
      if (params.has('page')) state.pinsPage = Math.max(0, Number(params.get('page')) - 1 || 0);
      renderPins();
    } else if (path.startsWith('task/')) renderEditor('task', path.slice(5));
    else if (path.startsWith('pin/')) renderEditor('pin', path.slice(4));
    else if (path.startsWith('settings/')) renderSettings(path.slice(9));
    else if (path === 'music') renderMusic();
    else if (path === 'plans') renderPlans();
    else renderMissing();
    if (focus && path !== 'schedule' && !state.confirmOpen) $('h1', workspace)?.focus({ preventScroll: true });
  }

  function selectDate(value) {
    if (!validDate(value)) return;
    state.selectedDate = value;
    state.calendarMonth = value.slice(0, 7);
    state.schedulePage = 0;
    if (routeName() !== 'schedule') navigate('schedule');
    else { renderSchedule(); renderCalendar(); }
  }

  function toggleSelect(trigger) {
    const panel = document.getElementById(trigger.getAttribute('aria-controls'));
    const wasOpen = !panel.hidden;
    closeMenus();
    panel.hidden = wasOpen;
    trigger.setAttribute('aria-expanded', String(!wasOpen));
  }

  function chooseSelect(button) {
    if (button.getAttribute('aria-disabled') === 'true') return;
    const group = button.closest('.custom-select');
    const value = button.dataset.value;
    const input = $('input', group);
    input.value = value;
    const trigger = $('.select-trigger', group);
    $('span', trigger).textContent = value;
    $$('.select-option', group).forEach((option) => {
      const selected = option === button;
      option.setAttribute('aria-selected', String(selected));
      option.classList.toggle('is-selected', selected);
      $('.ti-check', option)?.remove();
      if (selected) option.insertAdjacentHTML('beforeend', icon('check'));
    });
    closeMenus();
    trigger.focus({ preventScroll: true });
    if (button.dataset.name === 'pin-category') { state.pinsCategory = value; state.pinsPage = 0; renderPinResults(); }
  }

  function openConfirm(kind, id) {
    const item = (kind === 'pin' ? state.pins : state.tasks).find((entry) => entry.id === id);
    if (!item) return;
    closeMenus();
    state.pendingDelete = { kind, id };
    state.returnFocus = document.activeElement;
    state.afterConfirm = null;
    state.confirmOpen = true;
    $('#confirm-title').textContent = `Delete this ${kind}?`;
    $('#confirm-description').textContent = `${item.title} will be removed from ${kind === 'pin' ? 'your weekly pins' : 'your schedule'}.`;
    $('#confirm-delete').textContent = `Delete ${kind}`;
    layer.hidden = false;
    shell.inert = true;
    if (confirmTimeline) reducedMotion() ? confirmTimeline.progress(1).pause() : confirmTimeline.play();
    $('#confirm-cancel').focus({ preventScroll: true });
  }

  function finishConfirm() {
    if (state.confirmOpen) return;
    layer.hidden = true;
    shell.inert = false;
    state.pendingDelete = null;
    const route = state.afterConfirm;
    state.afterConfirm = null;
    if (route) navigate(route);
    else if (state.returnFocus?.isConnected) state.returnFocus.focus({ preventScroll: true });
  }

  function closeConfirm(route = null) {
    state.confirmOpen = false;
    state.afterConfirm = route;
    if (!confirmTimeline || reducedMotion() || confirmTimeline.progress() === 0) {
      confirmTimeline?.progress(0).pause();
      finishConfirm();
    } else confirmTimeline.reverse();
  }

  function deleteConfirmed() {
    const item = state.pendingDelete;
    if (!item) return;
    if (item.kind === 'pin') state.pins = state.pins.filter((entry) => entry.id !== item.id);
    else state.tasks = state.tasks.filter((entry) => entry.id !== item.id);
    renderPinsPreview();
    renderCalendar();
    closeConfirm(item.kind === 'pin' ? 'pins' : 'schedule');
  }

  async function saveEditor(form) {
    const kind = form.dataset.kind;
    const data = new FormData(form);
    const title = String(data.get('title') || '').trim();
    const date = String(data.get('date') || '').trim();
    const start = String(data.get('start') || '').trim();
    const end = String(data.get('end') || '').trim();
    const description = String(data.get('description') || '').trim();
    const category = String(data.get('category'));
    const errors = {};
    if (!title) errors.title = 'Give this plan a title.';
    if (!validDate(date)) errors.date = 'Use a real date in YYYY-MM-DD format.';
    if ((kind === 'task' || start) && !validTime(start)) errors.start = 'Use a time from 00:00 to 23:59.';
    if (kind === 'task' && end && (!validTime(end) || (validTime(start) && end <= start))) errors.end = 'End time must be later than start time.';
    let firstInvalid;
    for (const name of ['title', 'date', 'start', 'end']) {
      const input = $(`[name="${name}"]`, form);
      if (!input) continue;
      input.setAttribute('aria-invalid', String(Boolean(errors[name])));
      $(`#edit-${name}-help`, form).textContent = errors[name] || '';
      if (errors[name] && !firstInvalid) firstInvalid = input;
    }
    if (firstInvalid) { firstInvalid.focus({ preventScroll: true }); return; }
    if (!['Personal', 'Work', 'Health'].includes(category)) return;
    const entries = kind === 'pin' ? state.pins : state.tasks;
    const existing = entries.find((entry) => entry.id === form.dataset.id);
    const item = { ...existing, id: existing?.id || `${kind}-${crypto.randomUUID()}`, title, date, start, description, category, icon: existing?.icon || (category === 'Work' ? 'device-laptop' : category === 'Health' ? 'barbell' : 'calendar-event') };
    if (kind === 'task') {
      item.end = end;
      item.completed = data.has('completed');
      item.checklist = (existing?.checklist || []).map((entry, index) => ({ ...entry, completed: data.has(`check-${index}`) }));
      item.attendees = existing?.attendees || [];
    }
    const submit = $('button[type="submit"]', form);
    state.busy = true;
    submit.setAttribute('aria-busy', 'true');
    submit.textContent = 'Saving…';
    $$('button, input, textarea', form).forEach((control) => { control.disabled = true; });
    await new Promise((resolve) => setTimeout(resolve, 320));
    if (existing) entries[entries.indexOf(existing)] = item;
    else entries.push(item);
    state.busy = false;
    state.selectedDate = date;
    state.calendarMonth = date.slice(0, 7);
    if (kind === 'task') state.schedulePage = Math.max(0, schedulePages().findIndex((page) => page.some((entry) => entry.id === item.id)));
    else { state.pinsQuery = ''; state.pinsCategory = 'All'; state.pinsPage = Math.floor(entries.indexOf(item) / 4); }
    renderPinsPreview();
    renderCalendar();
    navigate(kind === 'pin' ? 'pins' : 'schedule');
  }

  async function saveProfile(form) {
    const name = $('[name="profile-name"]', form).value.trim();
    const email = $('[name="email"]', form);
    const nameInput = $('[name="profile-name"]', form);
    $('#edit-profile-name-help').textContent = name ? '' : 'Your name cannot be empty.';
    nameInput.setAttribute('aria-invalid', String(!name));
    $('#profile-email-help').textContent = email.checkValidity() ? '' : 'Use a complete email address.';
    email.setAttribute('aria-invalid', String(!email.checkValidity()));
    if (!name || !email.checkValidity()) { (!name ? nameInput : email).focus({ preventScroll: true }); return; }
    const button = $('button[type="submit"]', form);
    button.disabled = true;
    button.setAttribute('aria-busy', 'true');
    button.textContent = 'Saving…';
    await new Promise((resolve) => setTimeout(resolve, 320));
    state.profile = { name, email: email.value.trim() };
    $('#profile-name').textContent = name;
    $('#profile-name').title = name;
    $('#profile-avatar').innerHTML = avatarMarkup();
    if (form.isConnected) {
      button.disabled = false;
      button.removeAttribute('aria-busy');
      button.textContent = 'Save changes';
      $('#profile-status').textContent = 'Changes saved.';
      $('#profile-status').className = 'form-status is-success';
    }
  }

  function secondsText(value) {
    const seconds = Math.max(0, Math.floor(Number.isFinite(value) ? value : 0));
    return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  }

  function updatePlayer() {
    const track = state.tracks[state.currentTrack];
    $('#track-name').textContent = track.title;
    $('#track-name').title = track.title;
    $('#track-artist').textContent = track.artist;
    const button = $('#play-button');
    button.setAttribute('aria-label', `${state.playing ? 'Pause' : 'Play'} ${track.title}`);
    button.innerHTML = solid(state.playing ? 'pause' : 'play');
    const seek = $('#track-seek');
    seek.max = String(track.duration || 1);
    seek.value = String(track.elapsed || 0);
    seek.disabled = !track.url || !track.loaded;
    seek.style.setProperty('--seek', `${track.duration ? track.elapsed / track.duration * 100 : 0}%`);
    $('#track-elapsed').textContent = secondsText(track.elapsed);
    $('#track-remaining').textContent = secondsText(track.duration - track.elapsed);
    $('#shuffle-button').setAttribute('aria-pressed', String(state.shuffle));
    $('#shuffle-button').innerHTML = state.shuffle ? solid('shuffle') : icon('arrows-shuffle');
    $('#repeat-button').setAttribute('aria-pressed', String(state.repeat));
    $('#repeat-button').innerHTML = state.repeat ? solid('repeat') : icon('repeat-once');
    const available = state.tracks.filter((entry) => entry.url).length;
    $('#previous-track').disabled = available < 2;
    $('#next-track').disabled = available < 2;
    if (routeName() === 'music') {
      $('.music-view-summary .play-button', workspace)?.setAttribute('aria-label', `${state.playing ? 'Pause' : 'Play'} ${track.title}`);
      const play = $('.music-view-summary .play-button', workspace);
      if (play) play.innerHTML = solid(state.playing ? 'pause' : 'play');
    }
  }

  function playerError(message) {
    $('#player-status').textContent = message;
    $('.music-widget').classList.toggle('has-error', Boolean(message));
    state.libraryError = message;
    if ($('#library-status')) { $('#library-status').textContent = message; $('#library-status').classList.toggle('is-error', Boolean(message)); }
  }

  function selectTrack(index) {
    audio.pause();
    state.playing = false;
    state.currentTrack = index;
    const track = state.tracks[index];
    playerError('');
    if (track.url) { audio.src = track.url; audio.loop = state.repeat; audio.load(); }
    else { audio.removeAttribute('src'); audio.load(); }
    updatePlayer();
    if (routeName() === 'music') renderMusic();
  }

  async function togglePlayback() {
    const track = state.tracks[state.currentTrack];
    if (!track.url) { playerError('Add an audio file to listen.'); return; }
    playerError('');
    if (!audio.paused) { audio.pause(); state.playing = false; updatePlayer(); return; }
    try { await audio.play(); state.playing = true; updatePlayer(); }
    catch { state.playing = false; playerError('This audio file could not play.'); updatePlayer(); }
  }

  function skipTrack(direction, autoPlay = state.playing) {
    const available = state.tracks.map((track, index) => track.url ? index : -1).filter((index) => index >= 0);
    if (available.length < 2) return;
    const position = available.indexOf(state.currentTrack);
    const other = available.filter((index) => index !== state.currentTrack);
    const index = state.shuffle ? other[Math.floor(Math.random() * other.length)] : available[(position + direction + available.length) % available.length];
    selectTrack(index);
    if (autoPlay) togglePlayback();
  }

  function importAudio(files) {
    const accepted = [...files].filter((file) => file.type.startsWith('audio/') || /\.(mp3|wav|ogg|m4a|flac|aac)$/i.test(file.name));
    if (!accepted.length) { playerError('Choose an audio file to continue.'); return; }
    const first = state.tracks.length;
    for (const file of accepted) state.tracks.push({ id: `audio-${crypto.randomUUID()}`, title: file.name.replace(/\.[^.]+$/, ''), artist: 'Your library', duration: 0, elapsed: 0, url: URL.createObjectURL(file), loaded: false });
    state.musicPage = Math.floor(first / 5);
    selectTrack(first);
    if (routeName() !== 'music') navigate('music');
    $('#music-file').value = '';
  }

  function exportSchedule() {
    const escapeCalendar = (value) => value.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
    const entries = state.tasks.filter((task) => task.date === state.selectedDate);
    const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Taskly//Daily Schedule//EN', 'CALSCALE:GREGORIAN'];
    for (const task of entries) {
      const timestamp = `${task.date.replaceAll('-', '')}T${task.start.replace(':', '')}00`;
      lines.push('BEGIN:VEVENT', `UID:${task.id}@taskly.local`, `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').slice(0, 15)}Z`, `DTSTART:${timestamp}`, `SUMMARY:${escapeCalendar(task.title)}`);
      if (task.end) lines.push(`DTEND:${task.date.replaceAll('-', '')}T${task.end.replace(':', '')}00`);
      if (task.description) lines.push(`DESCRIPTION:${escapeCalendar(task.description)}`);
      lines.push('END:VEVENT');
    }
    lines.push('END:VCALENDAR');
    const url = URL.createObjectURL(new Blob([lines.join('\r\n') + '\r\n'], { type: 'text/calendar;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `taskly-${state.selectedDate}.ics`;
    link.hidden = true;
    canvas.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    if ($('#connections-status')) $('#connections-status').textContent = 'Your calendar file is ready.';
  }

  function setPreference(key, value) {
    state.preferences[key] = value;
    savePreferences();
    applyPreferences();
    renderSchedule();
    renderCalendar();
    renderPinsPreview();
    if (key === 'clock') $$('[data-action="clock-format"]').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.value === value)));
    if (key === 'weekStart') $$('[data-action="week-start"]').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.value === value)));
  }

  function onClick(event) {
    const button = event.target.closest('[data-action]');
    if (!button || button.disabled || button.getAttribute('aria-disabled') === 'true' || state.busy) return;
    const action = button.dataset.action;
    if (action !== 'select' && action !== 'calendar-range' && action !== 'select-option' && action !== 'range-option') closeMenus();
    if (action === 'home') { state.selectedDate = baseDate; state.calendarMonth = baseDate.slice(0, 7); state.schedulePage = 0; navigate('schedule'); }
    else if (action === 'pins') navigate('pins');
    else if (action === 'new-task') navigate('task/new');
    else if (action === 'new-pin') navigate('pin/new');
    else if (action === 'task' || action === 'pin') navigate(`${action}/${button.dataset.id}`);
    else if (action === 'back') navigate(button.dataset.back || 'schedule');
    else if (action === 'settings') navigate('settings/profile');
    else if (action === 'clock-settings') navigate('settings/preferences');
    else if (action === 'settings-tab') navigate(`settings/${button.dataset.tab}`);
    else if (action === 'music') navigate('music');
    else if (action === 'plans') navigate('plans');
    else if (action === 'dismiss-upgrade') setPreference('showUpgrade', false);
    else if (action === 'day-prev' || action === 'day-next') selectDate(addDays(state.selectedDate, action === 'day-prev' ? -1 : 1));
    else if (action === 'date') selectDate(button.dataset.date);
    else if (action === 'calendar-prev' || action === 'calendar-next') {
      const date = dateObject(`${state.calendarMonth}-01`);
      date.setUTCMonth(date.getUTCMonth() + (action === 'calendar-prev' ? -1 : 1));
      state.calendarMonth = dateKey(date).slice(0, 7);
      renderCalendar();
    } else if (action === 'calendar-range' || action === 'select') toggleSelect(button);
    else if (action === 'range-option') { state.calendarRange = button.dataset.value; closeMenus(true); renderCalendar(); }
    else if (action === 'select-option') chooseSelect(button);
    else if (action === 'complete') {
      const task = state.tasks.find((entry) => entry.id === button.dataset.id);
      if (task) { task.completed = !task.completed; renderSchedule(); $(`[data-action="complete"][data-id="${task.id}"]`)?.focus({ preventScroll: true }); }
    } else if (action === 'schedule-prev' || action === 'schedule-next') { state.schedulePage += action === 'schedule-prev' ? -1 : 1; renderSchedule(); }
    else if (action === 'pins-prev' || action === 'pins-next') { state.pinsPage += action === 'pins-prev' ? -1 : 1; renderPinResults(); }
    else if (action === 'clear-pins') { state.pinsQuery = ''; state.pinsCategory = 'All'; state.pinsPage = 0; renderPins(); $('#pin-search').focus({ preventScroll: true }); }
    else if (action === 'delete') openConfirm(button.dataset.kind, button.dataset.id);
    else if (action === 'cancel-confirm') closeConfirm();
    else if (action === 'confirm-delete') deleteConfirmed();
    else if (action === 'clock-format') setPreference('clock', button.dataset.value);
    else if (action === 'week-start') setPreference('weekStart', button.dataset.value);
    else if (action === 'connect-calendar' || action === 'connect-reminders') {
      $('#connections-status').className = 'form-status is-error';
      $('#connections-status').textContent = action === 'connect-calendar' ? 'Calendar sync needs a connected account. You can export your day instead.' : 'Email reminders need a connected email service.';
    } else if (action === 'export-schedule') exportSchedule();
    else if (action === 'connect-billing') { $('#billing-status').className = 'form-status is-error'; $('#billing-status').textContent = 'Billing isn’t connected. No payment was made.'; }
    else if (action === 'add-audio') $('#music-file').click();
    else if (action === 'play') togglePlayback();
    else if (action === 'choose-track') selectTrack(state.tracks.findIndex((track) => track.id === button.dataset.id));
    else if (action === 'shuffle') { state.shuffle = !state.shuffle; updatePlayer(); }
    else if (action === 'repeat') { state.repeat = !state.repeat; audio.loop = state.repeat; updatePlayer(); }
    else if (action === 'track-prev' || action === 'track-next') skipTrack(action === 'track-prev' ? -1 : 1);
    else if (action === 'music-prev' || action === 'music-next') { state.musicPage += action === 'music-prev' ? -1 : 1; renderMusic(); }
  }

  function onKeydown(event) {
    if (state.confirmOpen) {
      if (event.key === 'Escape') { event.preventDefault(); closeConfirm(); }
      if (event.key === 'Tab') {
        const controls = $$('button:not(:disabled)', layer);
        const first = controls[0];
        const last = controls.at(-1);
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
      return;
    }
    const group = event.target.closest('.custom-select, .calendar-range');
    if (group && ['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
      event.preventDefault();
      const trigger = $('[role="combobox"]', group);
      const panel = $('.select-options', group);
      if (panel.hidden) { closeMenus(); panel.hidden = false; trigger.setAttribute('aria-expanded', 'true'); }
      const options = $$('button:not([aria-disabled="true"])', panel);
      const current = options.indexOf(document.activeElement);
      const index = event.key === 'Home' ? 0 : event.key === 'End' ? options.length - 1 : (current + (event.key === 'ArrowUp' ? -1 : 1) + options.length) % options.length;
      options[index]?.focus({ preventScroll: true });
      return;
    }
    if (event.key === 'Escape') { closeMenus(true); return; }
    if (event.key === 'Tab') closeMenus();
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'n') { event.preventDefault(); navigate('task/new'); }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'f') { event.preventDefault(); navigate('pins'); setTimeout(() => $('#pin-search')?.focus({ preventScroll: true }), 0); }
    if (event.target.matches('[role="tab"]') && ['ArrowLeft', 'ArrowRight'].includes(event.key)) {
      event.preventDefault();
      const tabs = $$('[role="tab"]', event.target.parentElement);
      const next = tabs[(tabs.indexOf(event.target) + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length];
      navigate(`settings/${next.dataset.tab}`);
    }
  }

  function start() {
    if (started) return;
    started = true;
    if (window.gsap) {
      confirmTimeline = gsap.timeline({ paused: true, onReverseComplete: finishConfirm });
      confirmTimeline.fromTo($('.scrim', layer), { autoAlpha: 0 }, { autoAlpha: 1, duration: .2, ease: 'power2.out' }, 0).fromTo($('.dialog', layer), { autoAlpha: 0, yPercent: 4 }, { autoAlpha: 1, yPercent: 0, duration: .24, ease: 'power2.out' }, 0);
    }
    canvas.addEventListener('click', onClick);
    canvas.addEventListener('submit', (event) => {
      event.preventDefault();
      if (state.busy) return;
      if (event.target.id === 'editor-form') saveEditor(event.target);
      if (event.target.id === 'profile-form') saveProfile(event.target);
    });
    canvas.addEventListener('input', (event) => {
      if (event.target.id === 'pin-search') { state.pinsQuery = event.target.value; state.pinsPage = 0; renderPinResults(); }
      if (event.target.id === 'track-seek' && !event.target.disabled) { audio.currentTime = Number(event.target.value); state.tracks[state.currentTrack].elapsed = audio.currentTime; updatePlayer(); }
      if (event.target.matches('#editor-form input[aria-invalid="true"]')) {
        event.target.removeAttribute('aria-invalid');
        const help = document.getElementById(event.target.getAttribute('aria-describedby'));
        if (help) help.textContent = '';
      }
    });
    canvas.addEventListener('change', (event) => {
      if (event.target.dataset.preference) setPreference(event.target.dataset.preference, event.target.checked);
      if (event.target.id === 'music-file') importAudio(event.target.files);
    });
    document.addEventListener('keydown', onKeydown);
    document.addEventListener('pointerdown', (event) => { if (!event.target.closest('.custom-select, .calendar-range')) closeMenus(); });
    window.addEventListener('hashchange', () => renderRoute());
    motionQuery.addEventListener('change', applyPreferences);
    audio.addEventListener('loadedmetadata', () => {
      const track = state.tracks[state.currentTrack];
      if (!track.url || audio.currentSrc !== track.url) return;
      track.duration = Number.isFinite(audio.duration) ? audio.duration : 0;
      track.loaded = true;
      audio.currentTime = Math.min(track.elapsed, Math.max(0, track.duration - .01));
      updatePlayer();
      if (routeName() === 'music') renderMusic();
    });
    audio.addEventListener('timeupdate', () => { state.tracks[state.currentTrack].elapsed = audio.currentTime; updatePlayer(); });
    audio.addEventListener('play', () => { state.playing = true; updatePlayer(); });
    audio.addEventListener('pause', () => { state.playing = false; updatePlayer(); });
    audio.addEventListener('ended', () => { state.playing = false; updatePlayer(); if (!state.repeat) skipTrack(1, true); });
    audio.addEventListener('error', () => {
      if (state.tracks[state.currentTrack].url) { state.playing = false; playerError('This audio file could not load.'); updatePlayer(); }
    });
    renderPinsPreview();
    renderCalendar();
    renderRoute(false);
    updatePlayer();
    applyPreferences();
    clockTimer = setInterval(renderClock, 1000);
    window.addEventListener('pagehide', () => {
      clearInterval(clockTimer);
      clearTimeout(notificationTimer);
      audio.pause();
      confirmTimeline?.pause();
    });
    window.addEventListener('pageshow', (event) => { if (event.persisted) clockTimer = setInterval(renderClock, 1000); });
  }

  window.Taskly = { start };
  start();
})();
