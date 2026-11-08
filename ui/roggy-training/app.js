(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const canvas = $('.canvas');
  const modal = $('#modal-layer');
  const dialog = $('#dialog');
  const dialogContent = $('#dialog-content');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const state = { goal: 120, completed: 76, sport: 'running', period: 'week', favoritesOnly: false, sort: null, ascending: true, activityPage: 0, friendPage: 0, feeling: 'Great', motion: true, texture: false, selectedPace: 3.82, joined: new Set(), waved: new Set() };
  const activities = [
    { id: 'eifel', name: 'Eifel route', distance: 15, pace: 314, duration: 4710, days: 1, sport: 'running', favorite: true, place: 'Champ de Mars, Paris', thumb: 'tower' },
    { id: 'monceau', name: 'Parque Monceau', distance: 12.5, pace: 300, duration: 3755, days: 3, sport: 'running', favorite: false, place: 'Parc Monceau, Paris', thumb: 'park' },
    { id: 'seine', name: 'Along the Seine', distance: 8, pace: 275, duration: 2200, days: 0, sport: 'running', favorite: false, place: 'Quai de la Seine, Paris', thumb: 'river' },
    { id: 'boulogne', name: 'Bois de Boulogne', distance: 24.8, pace: 180, duration: 4464, days: 4, sport: 'cycling', favorite: false, place: 'Bois de Boulogne, Paris', thumb: 'park' },
    { id: 'luxembourg', name: 'Jardin du Luxembourg', distance: 6.2, pace: 330, duration: 2046, days: 9, sport: 'running', favorite: true, place: 'Jardin du Luxembourg, Paris', thumb: 'park' },
    { id: 'montmartre', name: 'Montmartre walk', distance: 4.6, pace: 682, duration: 3137, days: 10, sport: 'walking', favorite: false, place: 'Montmartre, Paris', thumb: 'tower' }
  ];
  const friends = [
    { id: 'emily', name: 'Emily Smith', distance: 3.68, online: true, photo: 'https://i.pravatar.cc/120?u=roggy-emily' },
    { id: 'mike', name: 'Mike Mirandes', distance: 5.77, online: false, photo: 'https://i.pravatar.cc/120?u=roggy-mike' }
  ];
  const candidates = [
    { id: 'jordan', name: 'Jordan Lee', distance: 6.42, online: true, initials: 'JL' },
    { id: 'sophia', name: 'Sophia Williams', distance: 4.15, online: true, initials: 'SW' },
    { id: 'oliver', name: 'Oliver Martin', distance: 7.2, online: false, initials: 'OM' }
  ];
  const paceSamples = [[0,268],[.3,270],[.65,280],[1.05,268],[1.5,280],[1.82,278],[2.03,267],[2.35,262],[2.6,270],[2.92,290],[3.1,294],[3.23,278],[3.4,267],[3.55,250],[3.7,237],[3.82,228],[4.1,218],[4.35,220],[4.67,226],[5,230],[5.2,244],[5.45,255],[5.68,264],[5.98,271],[6.22,267],[6.4,256],[6.7,253],[7,256],[7.35,254],[7.6,247],[7.77,235],[7.85,225],[8,223]];
  const splitPaces = [275, 286, 294, 268, 259, 275, 274, 269];
  let dialogTrigger = null;
  let toastTimer;
  let refreshTimer;
  let started = false;
  let activeMenu = null;
  const number = value => value.toFixed(2).replace('.', ',');
  const pace = seconds => `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(Math.round(seconds % 60)).padStart(2, '0')}`;
  const duration = seconds => seconds >= 3600 ? `${String(Math.floor(seconds / 3600)).padStart(2, '0')}:${pace(seconds % 3600)}` : pace(seconds);
  const escapeHTML = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const heart = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/></svg>';
  const routeShapes = [
    'M9 31q-5-9 6-10t8-12q-2-10 12-6t5 17q-4 12 11 10t11-7q-4-8 14-2t16-9q-13-2-7-12t15 6',
    'M9 13q12-6 20 1t16 1q11-11 22-5t19 4q16-2 12 11t-17 10q-11-8-17-1t-14-5q-8-10 4-14',
    'M9 31Q35 5 45 21T74 12T101 25'
  ];

  function thumbnail(type) {
    const scene = type === 'tower'
      ? '<rect width="60" height="60" fill="#d6dddb"/><path d="M0 47h60v13H0Z" fill="#a9b7b0"/><path d="m30 5-2 23-11 28h7l6-15 6 15h7L32 28Z" fill="#81746b"/><path d="M23 43h14M26 32h8M24 38l12 13m0-13L24 51" stroke="#e2d8c9" stroke-width="1.2"/><path d="M16 56h29" stroke="#6c6059" stroke-width="2"/>'
      : type === 'river'
        ? '<rect width="60" height="60" fill="#dbdfe1"/><path d="M0 40q15-21 28-5t32-8v33H0Z" fill="#b9c9ce"/><path d="M0 34h60M13 28v9m17-9v9m17-9v9" stroke="#a79889" stroke-width="3"/>'
        : '<rect width="60" height="60" fill="#e6ded5"/><path d="M0 41h60v19H0Z" fill="#c6cbb4"/><path d="M22 60 35 37h9L36 60" fill="#e7ddcd"/><g fill="#bcc0a8"><circle cx="12" cy="30" r="13"/><circle cx="42" cy="22" r="13"/><circle cx="57" cy="34" r="11"/></g><path d="M12 31v17m30-24v17m15-5v11" stroke="#a5947f" stroke-width="2"/>';
    return `<svg class="activity-thumbnail" viewBox="0 0 60 60" aria-hidden="true">${scene}</svg>`;
  }

  function filteredActivities() {
    let result = activities.filter(item => (state.sport === 'all' || item.sport === state.sport) && (state.period === 'month' || (state.period === 'week' ? item.days < 7 : item.days >= 7 && item.days < 14)) && (!state.favoritesOnly || item.favorite));
    if (state.sort) result = result.toSorted((a, b) => (a[state.sort] - b[state.sort]) * (state.ascending ? 1 : -1));
    return result;
  }

  function renderActivities() {
    const result = filteredActivities();
    const pages = Math.max(1, Math.ceil(result.length / 2));
    state.activityPage %= pages;
    $('#activities-body').innerHTML = result.slice(state.activityPage * 2, state.activityPage * 2 + 2).map((item, index) => `<tr>
      <td>${String(state.activityPage * 2 + index + 1).padStart(2, '0')}</td>
      <td><button class="activity-name" data-activity="${item.id}">${thumbnail(item.thumb)}<span>${item.name}</span></button></td>
      <td>${number(item.distance)} km</td><td>${pace(item.pace)} <span class="table-unit">min/km</span></td><td>${duration(item.duration)}</td>
      <td><button class="route-preview" data-activity="${item.id}" aria-label="View ${item.name} route"><svg viewBox="0 0 110 42" aria-hidden="true"><path d="${routeShapes[activities.indexOf(item) % routeShapes.length]}"/><circle cx="9" cy="${activities.indexOf(item) % 3 === 1 ? 13 : 31}" r="3.5"/><circle cx="101" cy="${activities.indexOf(item) % 3 === 0 ? 6 : 25}" r="3.5"/></svg></button></td>
      <td><button class="heart-button ${item.favorite ? 'is-favorite' : ''}" data-favorite="${item.id}" aria-label="Favorite ${item.name}" aria-pressed="${item.favorite}">${heart}</button></td>
    </tr>`).join('');
    $('#activity-state').hidden = result.length !== 0;
    $('.next-activities').disabled = pages <= 1;
    $('.next-activities').setAttribute('aria-label', `Next activities, page ${state.activityPage + 1} of ${pages}`);
    $$('.sort-button').forEach(button => button.parentElement.setAttribute('aria-sort', state.sort === button.dataset.sort ? (state.ascending ? 'ascending' : 'descending') : 'none'));
  }

  function avatar(friend, className = 'friend-avatar') {
    return `<div class="${className}">${friend.photo ? `<img src="${friend.photo}" alt="${friend.name}" referrerpolicy="no-referrer">` : `<span class="avatar-initials">${friend.initials}</span>`}</div>`;
  }

  function friendRow(friend) {
    return `<div class="friend-row">${avatar(friend)}<div class="friend-info"><button class="friend-name" data-friend="${friend.id}">${friend.name}</button><div class="friend-distance">${number(friend.distance)} <small>km</small></div></div><button class="wave-button ${state.waved.has(friend.id) ? 'is-waved' : ''}" data-wave="${friend.id}" aria-label="Wave to ${friend.name}" title="${friend.online ? `Wave to ${friend.name}` : `${friend.name} is offline`}" ${friend.online ? '' : 'disabled'}><i class="ti ti-hand-stop" aria-hidden="true"></i></button><span class="online-dot ${friend.online ? 'is-online' : ''}" role="img" aria-label="${friend.online ? 'Online' : 'Offline'}"></span></div>`;
  }

  function renderFriends() {
    const pages = Math.max(1, Math.ceil(friends.length / 2));
    state.friendPage %= pages;
    $('#friends-list').innerHTML = friends.slice(state.friendPage * 2, state.friendPage * 2 + 2).map(friendRow).join('');
    $('[data-action="next-friends"]').disabled = pages <= 1;
  }

  function drawCity() {
    let result = '';
    function building(x, y, w, h, elevation, style = 'flat') {
      const dx = elevation * .38;
      const dy = -elevation * .55;
      result += `<g filter="url(#building-shadow)"><path d="M${x},${y}h${w}v${h}h-${w}Z" fill="#d5cfd9"/><path d="M${x},${y + h}l${dx},${dy}h${w}l-${dx},${-dy}Z" fill="#e6e0e9"/><path d="M${x + w},${y}l${dx},${dy}v${h}l-${dx},${-dy}Z" fill="#dfd9e3"/><rect x="${x + dx}" y="${y + dy}" width="${w}" height="${h}" fill="url(#roof-light)"/>`;
      if (style === 'gable') {
        result += `<path d="M${x + dx},${y + dy} ${x + dx + w / 2},${y + dy + 12} ${x + dx + w},${y + dy}Z" fill="#e9e5ec"/><path d="M${x + dx + w / 2},${y + dy + 12}v${h - 24}l${w / 2},12v-${h}Z" fill="#f5f2f6"/><path d="M${x + dx},${y + dy + h} ${x + dx + w / 2},${y + dy + h - 12} ${x + dx + w},${y + dy + h}Z" fill="#fff"/>`;
      } else {
        const count = Math.max(1, Math.floor(h / 36));
        for (let i = 0; i < count; i++) result += `<rect x="${x + dx + w * .22}" y="${y + dy + 9 + i * 31}" width="${w * .28}" height="11" fill="#ebe7ee"/><path d="M${x + dx + w * .22},${y + dy + 20 + i * 31}h${w * .28}" stroke="#fff" stroke-width="2"/>`;
      }
      result += '</g>';
    }
    [[18,-10,72,60,20],[122,-24,75,75,18],[251,-28,78,78,15],[367,-12,48,91,22],[246,101,42,90,23],[351,106,47,113,18],[259,202,83,95,38],[371,232,35,75,14],[28,337,142,72,31],[19,366,40,45,10],[70,387,70,43,14],[258,322,51,48,22],[320,320,35,68,17],[372,324,32,57,25],[265,390,30,58,16],[318,402,33,51,21],[258,463,80,54,16],[368,421,35,91,28],[24,542,90,54,12],[137,537,43,63,18],[261,548,60,54,20],[353,539,65,60,15]].forEach((args, index) => building(...args, index % 3 === 0 ? 'gable' : 'flat'));
    $('#city-buildings').innerHTML = result;
  }

  function drawPace() {
    const points = paceSamples.map(([km, seconds]) => [km / 8 * 588, (seconds - 210) * 3 + 22]);
    let path = `M${points[0][0]},${points[0][1]}`;
    for (let i = 0; i < points.length - 1; i++) {
      const before = points[Math.max(0, i - 1)], current = points[i], next = points[i + 1], after = points[Math.min(points.length - 1, i + 2)];
      path += ` C${current[0] + (next[0] - before[0]) / 6},${current[1] + (next[1] - before[1]) / 6} ${next[0] - (after[0] - current[0]) / 6},${next[1] - (after[1] - current[1]) / 6} ${next[0]},${next[1]}`;
    }
    $('#pace-line').setAttribute('d', path);
    inspectPace(3.82);
  }

  function inspectPace(km) {
    const sample = paceSamples.reduce((closest, item) => Math.abs(item[0] - km) < Math.abs(closest[0] - km) ? item : closest);
    state.selectedPace = sample[0];
    const x = sample[0] / 8 * 588, y = (sample[1] - 210) * 3 + 22;
    $('#chart-point').setAttribute('cx', x);
    $('#chart-point').setAttribute('cy', y);
    $('#chart-crosshair').setAttribute('d', `M${x} 0V306`);
    $('#tooltip-distance').innerHTML = `${number(sample[0]).padStart(5, '0')} <small>km</small>`;
    $('#tooltip-pace').innerHTML = `${pace(sample[1])} <small>min/km</small>`;
    const tooltip = $('#chart-tooltip');
    tooltip.style.left = `${Math.max(1, Math.min(67, x / 650 * 100 - 23))}%`;
    tooltip.style.top = `${Math.max(4, Math.min(69, y / 330 * 93.6 - 8))}%`;
    $('#pace-chart').setAttribute('aria-label', `${number(sample[0])} kilometers, pace ${pace(sample[1])} minutes per kilometer. Use left and right arrow keys to inspect.`);
  }

  function closeMenus(restoreFocus = false) {
    if (!activeMenu) return;
    const button = $(`[data-menu="${activeMenu}"]`);
    $(`#${activeMenu}-menu`).hidden = true;
    button.setAttribute('aria-expanded', 'false');
    activeMenu = null;
    if (restoreFocus) button.focus();
  }

  function toggleMenu(name, button) {
    const wasOpen = activeMenu === name;
    closeMenus();
    if (wasOpen) return;
    activeMenu = name;
    $(`#${name}-menu`).hidden = false;
    button.setAttribute('aria-expanded', 'true');
  }

  function selectMenu(name, key, value) {
    $$(`#${name}-menu [data-${key}]`).forEach(button => {
      const selected = button.dataset[key] === value;
      button.classList.toggle('is-selected', selected);
      button.setAttribute('aria-checked', selected);
    });
    closeMenus(true);
  }

  function setNav(view) {
    const buttons = $$('.nav-button');
    const index = buttons.findIndex(button => button.dataset.view === view);
    buttons.forEach(button => {
      const selected = button.dataset.view === view;
      button.classList.toggle('is-active', selected);
      if (selected) button.setAttribute('aria-current', 'page'); else button.removeAttribute('aria-current');
    });
    $('.nav-indicator').style.transform = `translateX(${index * 4.155}cqw)`;
  }

  function openDialog(title, content, { compact = false, eyebrow = 'YOUR TRAINING' } = {}) {
    closeMenus();
    if (!modal.classList.contains('is-open')) dialogTrigger = document.activeElement;
    $('#dialog-title').textContent = title;
    $('#dialog-eyebrow').textContent = eyebrow;
    dialogContent.innerHTML = content;
    dialog.classList.toggle('is-compact', compact);
    modal.inert = false;
    modal.setAttribute('aria-hidden', 'false');
    modal.classList.add('is-open');
    [...canvas.children].filter(child => child !== modal && child.id !== 'toast').forEach(child => { child.inert = true; });
    const focusTarget = $('input:not(:disabled), button:not(:disabled)', dialogContent) || $('.close-dialog');
    focusTarget.focus({ preventScroll: true });
  }

  function closeDialog() {
    if (!modal.classList.contains('is-open')) return;
    modal.classList.remove('is-open');
    [...canvas.children].filter(child => child !== modal && child.id !== 'toast').forEach(child => { child.inert = false; });
    modal.inert = true;
    modal.setAttribute('aria-hidden', 'true');
    setNav('overview');
    if (dialogTrigger?.isConnected && !dialogTrigger.disabled) dialogTrigger.focus({ preventScroll: true });
    else $('.brand').focus({ preventScroll: true });
  }

  function notify(message, error = false) {
    clearTimeout(toastTimer);
    const toast = $('#toast');
    $('span', toast).textContent = message;
    $('i', toast).className = `ti ${error ? 'ti-alert-circle' : 'ti-check'}`;
    toast.classList.add('is-visible');
    toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 3000);
  }

  function showGoal() {
    openDialog('A little further, every month.', `<p class="dialog-copy">Set a distance that fits your rhythm. Every run counts toward your monthly goal.</p><form id="goal-form" novalidate><div class="form-row"><div><label class="field-label" for="goal-input">Monthly distance · km</label><input id="goal-input" name="goal" inputmode="decimal" autocomplete="off" value="${state.goal}" aria-describedby="goal-error"><p class="field-error" id="goal-error" aria-live="polite"></p></div><div><span class="field-label">Distance completed</span><div class="goal-summary compact-summary"><strong>${state.completed} <small>km</small></strong><i class="ti ti-run" aria-hidden="true"></i></div></div></div><div class="goal-summary"><div><strong id="goal-percentage">${Math.round(state.completed / state.goal * 100)}<small>% complete</small></strong><p id="goal-remaining">${Math.max(0, state.goal - state.completed)} km to your goal</p></div><i class="ti ti-target-arrow" aria-hidden="true"></i></div><div class="form-actions"><button type="button" class="secondary-button" data-action="close-dialog">Cancel</button><button type="submit" class="primary-button" id="goal-save">Save goal<i class="ti ti-arrow-right" aria-hidden="true"></i></button></div></form>`, { compact: true, eyebrow: 'MONTHLY GOAL' });
  }

  function validateGoal() {
    const input = $('#goal-input');
    const valid = /^\d+(?:[.,]\d)?$/.test(input.value.trim()) && Number(input.value.replace(',', '.')) >= 1 && Number(input.value.replace(',', '.')) <= 1000;
    input.setAttribute('aria-invalid', !valid);
    $('#goal-error').textContent = valid ? '' : 'Enter a distance from 1 to 1,000 km.';
    $('#goal-save').disabled = !valid;
    if (valid) {
      const value = Number(input.value.replace(',', '.'));
      $('#goal-percentage').innerHTML = `${Math.round(state.completed / value * 100)}<small>% complete</small>`;
      $('#goal-remaining').textContent = value <= state.completed ? 'Goal reached. Keep moving!' : `${Math.round((value - state.completed) * 10) / 10} km to your goal`;
    }
    return valid;
  }

  function saveGoal() {
    if (!validateGoal()) return;
    state.goal = Number($('#goal-input').value.replace(',', '.'));
    const progress = Math.min(86, state.completed / state.goal * 100);
    $('.ring-fill').style.strokeDasharray = `${progress} 100`;
    $('.ring-highlight').style.strokeDasharray = `${Math.max(0, progress - 3)} 100`;
    $('#goal-target').textContent = state.goal;
    $('.goal-ring').setAttribute('aria-label', `Monthly goal: ${state.completed} of ${state.goal} kilometers. Edit goal.`);
    closeDialog();
    notify(`Monthly goal set to ${state.goal} km`);
  }

  function showSearch() {
    openDialog('Find your next favorite.', '<div class="search-field"><i class="ti ti-search" aria-hidden="true"></i><input id="search-input" type="search" placeholder="Search activities or places" aria-label="Search activities or places" autocomplete="off" maxlength="120"></div><div class="search-results" id="search-results" aria-live="polite"></div>', { compact: true, eyebrow: 'ACTIVITY SEARCH' });
    renderSearch('');
  }

  function renderSearch(query) {
    const term = query.trim().toLowerCase();
    const results = activities.filter(item => `${item.name} ${item.place} ${item.sport}`.toLowerCase().includes(term));
    $('#search-results').innerHTML = results.length ? results.slice(0, 5).map(item => `<button class="result-row" data-activity="${item.id}"><i class="ti ti-${item.sport === 'cycling' ? 'bike' : item.sport === 'walking' ? 'walk' : 'run'}" aria-hidden="true"></i><span class="result-info"><strong>${item.name}</strong><span>${item.place}</span></span><span>${number(item.distance)} km</span><i class="ti ti-chevron-right" aria-hidden="true"></i></button>`).join('') : `<p class="empty-results">No activities match “${escapeHTML(query)}”. Try a place or activity name.</p>`;
  }

  function showActivity(id = 'seine') {
    const item = activities.find(activity => activity.id === id);
    const map = $('.city-map').cloneNode(true);
    $$('[id]', map).forEach(element => {
      const oldId = element.id, newId = `detail-${oldId}`;
      element.id = newId;
      $$('*', map).forEach(node => ['fill', 'stroke', 'filter'].forEach(attribute => {
        if (node.getAttribute(attribute) === `url(#${oldId})`) node.setAttribute(attribute, `url(#${newId})`);
      }));
    });
    map.removeAttribute('id');
    map.setAttribute('viewBox', '0 0 400 580');
    openDialog(item.name, `<div class="detail-layout"><div><p class="dialog-copy">${item.place}<br>${item.days === 0 ? 'Today · 9:24 am' : `${item.days} days ago · Morning ${item.sport === 'cycling' ? 'ride' : item.sport === 'walking' ? 'walk' : 'run'}`}</p><div class="detail-metrics"><div><strong>${number(item.distance)} <small>km</small></strong><span>Distance</span></div><div><strong>${duration(item.duration)}</strong><span>Moving time</span></div><div><strong>${pace(item.pace)}</strong><span>Avg. pace · min/km</span></div><div><strong>${Math.round(item.distance * 65.75)}</strong><span>Calories</span></div></div><button class="secondary-button" data-favorite="${item.id}"><i class="ti ti-heart" aria-hidden="true"></i><span>${item.favorite ? 'Remove from favorites' : 'Add to favorites'}</span></button><button class="secondary-button detail-export" data-export="${item.id}"><i class="ti ti-download" aria-hidden="true"></i>Export CSV</button></div><div class="detail-map">${map.outerHTML}</div></div>`, { eyebrow: 'ACTIVITY DETAILS' });
  }

  function showSplits() {
    openDialog('Every kilometer, in detail.', `<table class="data-table"><caption>Along the Seine · 8,00 km · 36:40 moving time</caption><thead><tr><th scope="col">Kilometer</th><th scope="col">Avg. pace</th><th scope="col">Elapsed time</th></tr></thead><tbody>${splitPaces.map((value, index) => `<tr><td>${String(index + 1).padStart(2, '0')}</td><td>${pace(value)} min/km</td><td>${pace(splitPaces.slice(0, index + 1).reduce((sum, split) => sum + split, 0))}</td></tr>`).join('')}</tbody></table><div class="form-actions"><button class="secondary-button" data-export="seine"><i class="ti ti-download" aria-hidden="true"></i>Export CSV</button><button class="primary-button" data-action="close-dialog">Done</button></div>`, { compact: true, eyebrow: 'PACE & SPLITS' });
  }

  function showHistory() {
    openDialog('Your miles, all together.', `<table class="data-table"><caption>This month · ${number(activities.reduce((sum, item) => sum + item.distance, 0))} km across ${activities.length} activities</caption><thead><tr><th scope="col">Activity</th><th scope="col">Distance</th><th scope="col">Avg. pace</th><th scope="col">Duration</th></tr></thead><tbody>${activities.map(item => `<tr><td><button class="text-button" data-activity="${item.id}">${item.name}</button></td><td>${number(item.distance)} km</td><td>${pace(item.pace)} min/km</td><td>${duration(item.duration)}</td></tr>`).join('')}</tbody></table><div class="form-actions"><button class="secondary-button" data-export="all"><i class="ti ti-download" aria-hidden="true"></i>Export activities</button><button class="primary-button" data-action="close-dialog">Done</button></div>`, { eyebrow: 'TRAINING HISTORY' });
  }

  function showSettings() {
    openDialog('Make it your rhythm.', `<div class="settings-row"><div><strong>Gentle animations</strong><p>Keep movement light and focused.</p></div><button class="switch" role="switch" aria-checked="${state.motion && !reducedMotion.matches}" aria-label="Gentle animations" data-setting="motion" ${reducedMotion.matches ? 'disabled' : ''}></button></div><div class="settings-row"><div><strong>High-contrast chart patterns</strong><p>Distinguish data without relying on color.</p></div><button class="switch" role="switch" aria-checked="${state.texture}" aria-label="High-contrast chart patterns" data-setting="texture"></button></div><div class="settings-row"><div><strong>Distance units</strong><p>Kilometers · min/km</p></div><span class="setting-value">Metric</span></div><div class="form-actions"><button class="secondary-button" data-action="goal">Edit monthly goal</button><button class="primary-button" data-action="close-dialog">Done</button></div>`, { compact: true, eyebrow: 'TRAINING PREFERENCES' });
  }

  function showChallenges() {
    openDialog('A reason to keep moving.', `<div class="challenge-grid"><article class="challenge"><i class="ti ti-flame" aria-hidden="true"></i><h3>The 100 km club</h3><p>One month. One hundred kilometers.<br>Find your stride with the community.</p><div class="challenge-progress"><span>76 km completed</span><span>100 km</span></div><div class="progress-track" role="progressbar" aria-label="100 km club progress" aria-valuenow="76" aria-valuemin="0" aria-valuemax="100"><span style="width:76%"></span></div><button class="secondary-button" data-challenge="club" ${state.joined.has('club') ? 'disabled' : ''}>${state.joined.has('club') ? 'Joined' : 'Join challenge'}</button></article><article class="challenge"><i class="ti ti-sunrise" aria-hidden="true"></i><h3>Early bird</h3><p>Make the morning yours.<br>Complete five runs before 10 am.</p><div class="challenge-progress"><span>3 morning runs</span><span>5 runs</span></div><div class="progress-track" role="progressbar" aria-label="Early bird progress" aria-valuenow="3" aria-valuemin="0" aria-valuemax="5"><span style="width:60%"></span></div><button class="secondary-button" data-challenge="bird" ${state.joined.has('bird') ? 'disabled' : ''}>${state.joined.has('bird') ? 'Joined' : 'Join challenge'}</button></article></div>`, { eyebrow: 'MONTHLY CHALLENGES' });
  }

  function showCommunity() {
    openDialog('Better, together.', `<p class="dialog-copy">A little encouragement goes a long way.</p><div class="community-list">${friends.map(friendRow).join('')}</div><div class="form-actions"><button class="secondary-button" data-action="add-friend"><i class="ti ti-plus" aria-hidden="true"></i>Add a friend</button><button class="primary-button" data-action="close-dialog">Done</button></div>`, { compact: true, eyebrow: 'YOUR COMMUNITY' });
  }

  function showAddFriend() {
    openDialog('Find your running people.', '<div class="search-field"><i class="ti ti-search" aria-hidden="true"></i><input id="friend-search" type="search" placeholder="Search a name" aria-label="Search friends" autocomplete="off" maxlength="120"></div><div class="search-results" id="friend-results" aria-live="polite"></div>', { compact: true, eyebrow: 'GROW YOUR CIRCLE' });
    renderCandidates('');
  }

  function renderCandidates(query) {
    const result = candidates.filter(friend => friend.name.toLowerCase().includes(query.trim().toLowerCase()));
    $('#friend-results').innerHTML = result.length ? result.map(friend => `<div class="result-row">${avatar(friend)}<span class="result-info"><strong>${friend.name}</strong><span>${number(friend.distance)} km today</span></span><button class="secondary-button" data-add-friend="${friend.id}" ${friends.some(item => item.id === friend.id) ? 'disabled' : ''}>${friends.some(item => item.id === friend.id) ? 'Added' : 'Add friend'}</button></div>`).join('') : '<p class="empty-results">No runners found. Try another name.</p>';
  }

  function showProfile(id) {
    const friend = id ? friends.find(item => item.id === id) : { name: 'Alex Morgan', photo: 'https://i.pravatar.cc/120?u=roggy-alex', distance: state.completed, online: true };
    openDialog(friend.name, `<div class="profile-layout">${avatar(friend, 'profile-photo')}<div><h3>${id ? 'Always a little further.' : 'Your next mile starts here.'}</h3><p>Paris, France · ${id ? (friend.online ? 'Active now' : 'Last active yesterday') : 'Member since March 2024'}</p></div></div><div class="detail-metrics"><div><strong>${number(friend.distance)} <small>km</small></strong><span>${id ? 'Distance today' : 'Distance this month'}</span></div><div><strong>${id ? '12' : '18'}</strong><span>Activities this month</span></div></div><div class="form-actions">${id ? `<button class="primary-button" data-wave="${friend.id}" ${friend.online ? '' : 'disabled'}><i class="ti ti-hand-stop" aria-hidden="true"></i>Wave hello</button>` : '<button class="secondary-button" data-action="settings"><i class="ti ti-settings" aria-hidden="true"></i>Preferences</button><button class="primary-button" data-action="goal">Set your goal</button>'}</div>`, { compact: true, eyebrow: id ? 'RUNNER PROFILE' : 'YOUR PROFILE' });
  }

  function exportActivity(id) {
    const selected = id === 'all' ? activities : activities.filter(item => item.id === id);
    const rows = [['Activity', 'Distance (km)', 'Pace (min/km)', 'Moving time', 'Place'], ...selected.map(item => [item.name, item.distance, pace(item.pace), duration(item.duration), item.place])];
    const csv = rows.map(row => row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `roggy-${id}.csv`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    notify('Activity data exported as CSV');
  }

  function refreshTraining() {
    const button = $('.update-status');
    if (button.disabled) return;
    button.disabled = true;
    button.classList.add('is-loading');
    $('span', button).textContent = 'Checking for new training';
    refreshTimer = setTimeout(() => {
      button.disabled = false;
      button.classList.remove('is-loading');
      $('span', button).textContent = 'Training is up to date';
      $('i', button).className = 'ti ti-circle-check';
      notify('No new activities to add');
    }, 650);
  }

  function waveTo(id, button) {
    const friend = friends.find(item => item.id === id);
    if (!friend?.online) return;
    state.waved.add(id);
    button.classList.add('is-waving');
    button.addEventListener('animationend', () => button.classList.remove('is-waving'), { once: true });
    notify(`${friend.name} is online. Connect your account to send a wave.`);
  }

  document.addEventListener('click', event => {
    const button = event.target.closest('button, .scrim');
    if (!button || button.disabled) return;
    if (button.dataset.menu) return toggleMenu(button.dataset.menu, button);
    if (!button.closest('.dropdown')) closeMenus();
    if (button.dataset.view) {
      const view = button.dataset.view;
      setNav(view);
      if (view === 'overview') closeDialog();
      if (view === 'training') showHistory();
      if (view === 'challenges') showChallenges();
      if (view === 'community') showCommunity();
      return;
    }
    if (button.dataset.sport) {
      state.sport = button.dataset.sport;
      state.activityPage = 0;
      const icons = { running: 'run', cycling: 'bike', walking: 'walk', all: 'activity' };
      $('#sport-icon').className = `ti ti-${icons[state.sport]}`;
      $('[data-menu="sport"]').setAttribute('aria-label', `Activity type: ${state.sport}`);
      selectMenu('sport', 'sport', state.sport);
      return renderActivities();
    }
    if (button.dataset.period) {
      state.period = button.dataset.period;
      state.activityPage = 0;
      $('#period-label').textContent = { week: 'This Week', last: 'Last Week', month: 'This Month' }[state.period];
      selectMenu('period', 'period', state.period);
      return renderActivities();
    }
    if (button.dataset.feeling) {
      state.feeling = button.dataset.feeling;
      selectMenu('feelings', 'feeling', state.feeling);
      $('#feeling-label').textContent = state.feeling;
      $('#feeling-button').setAttribute('aria-label', `Feeling: ${state.feeling}. Change feeling`);
      $('#feeling-button').classList.add('is-changed');
      $('#feeling-button').innerHTML = `<i class="ti ti-${{ Great: 'mood-happy', Good: 'mood-smile', Tired: 'mood-empty' }[state.feeling]}" aria-hidden="true"></i>`;
      return notify(`Feeling updated to ${state.feeling.toLowerCase()}`);
    }
    if (button.dataset.sort) {
      state.ascending = state.sort === button.dataset.sort ? !state.ascending : true;
      state.sort = button.dataset.sort;
      state.activityPage = 0;
      return renderActivities();
    }
    if (button.dataset.favorite) {
      const item = activities.find(activity => activity.id === button.dataset.favorite);
      item.favorite = !item.favorite;
      renderActivities();
      if (button.closest('.dialog-content')) $('span', button).textContent = item.favorite ? 'Remove from favorites' : 'Add to favorites';
      return notify(`${item.name} ${item.favorite ? 'added to' : 'removed from'} favorites`);
    }
    if (button.dataset.activity) return showActivity(button.dataset.activity);
    if (button.dataset.friend) return showProfile(button.dataset.friend);
    if (button.dataset.wave) return waveTo(button.dataset.wave, button);
    if (button.dataset.export) return exportActivity(button.dataset.export);
    if (button.dataset.addFriend) {
      const candidate = candidates.find(friend => friend.id === button.dataset.addFriend);
      if (!friends.some(friend => friend.id === candidate.id)) friends.push({ ...candidate });
      state.friendPage = Math.floor((friends.length - 1) / 2);
      renderFriends();
      renderCandidates($('#friend-search').value);
      return notify(`${candidate.name} added to your circle`);
    }
    if (button.dataset.challenge) {
      state.joined.add(button.dataset.challenge);
      button.disabled = true;
      button.textContent = 'Joined';
      return notify('Challenge added to your training goals');
    }
    if (button.dataset.setting) {
      const key = button.dataset.setting;
      state[key] = !state[key];
      button.setAttribute('aria-checked', state[key]);
      canvas.classList.toggle('motion-off', !state.motion);
      canvas.classList.toggle('has-texture', state.texture);
      return;
    }
    if (button.dataset.pace) {
      const key = button.dataset.pace;
      if (key === 'average') return showSplits();
      const sample = key === 'fastest' ? paceSamples.reduce((a, b) => a[1] < b[1] ? a : b) : paceSamples.reduce((a, b) => a[1] > b[1] ? a : b);
      inspectPace(sample[0]);
      $$('.map-metric').forEach(metric => metric.classList.toggle('is-selected', metric === button));
      return;
    }
    const action = button.dataset.action;
    if (action === 'home') { closeDialog(); state.sport = 'running'; state.period = 'week'; state.favoritesOnly = false; state.activityPage = 0; $('#period-label').textContent = 'This Week'; $('#sport-icon').className = 'ti ti-run'; $('.favorite-filter').setAttribute('aria-pressed', 'false'); selectMenu('sport', 'sport', 'running'); selectMenu('period', 'period', 'week'); renderActivities(); setNav('overview'); }
    if (action === 'goal') showGoal();
    if (action === 'search') showSearch();
    if (action === 'profile') showProfile();
    if (action === 'settings') showSettings();
    if (action === 'training-detail' || action === 'route') showActivity();
    if (action === 'splits') showSplits();
    if (action === 'close-dialog') closeDialog();
    if (action === 'refresh') refreshTraining();
    if (action === 'add-friend') showAddFriend();
    if (action === 'next-friends') { state.friendPage++; renderFriends(); }
    if (action === 'next-activities') { state.activityPage++; renderActivities(); }
    if (action === 'favorites') { state.favoritesOnly = !state.favoritesOnly; state.activityPage = 0; button.setAttribute('aria-pressed', state.favoritesOnly); renderActivities(); }
    if (action === 'reset-filters') { state.sport = 'running'; state.period = 'week'; state.favoritesOnly = false; state.activityPage = 0; $('#period-label').textContent = 'This Week'; $('#sport-icon').className = 'ti ti-run'; $('.favorite-filter').setAttribute('aria-pressed', 'false'); selectMenu('sport', 'sport', 'running'); selectMenu('period', 'period', 'week'); renderActivities(); }
  });

  document.addEventListener('input', event => {
    if (event.target.id === 'search-input') renderSearch(event.target.value);
    if (event.target.id === 'friend-search') renderCandidates(event.target.value);
    if (event.target.id === 'goal-input') validateGoal();
  });
  document.addEventListener('submit', event => {
    if (event.target.id === 'goal-form') { event.preventDefault(); saveGoal(); }
  });
  document.addEventListener('pointerdown', event => {
    if (activeMenu && !event.target.closest('.dropdown, [data-menu]')) closeMenus();
  });
  $('#pace-chart').addEventListener('pointermove', event => {
    const bounds = $('#pace-chart').getBoundingClientRect();
    inspectPace(Math.max(0, Math.min(8, (event.clientX - bounds.left) / bounds.width * 650 / 588 * 8)));
  });
  $('#pace-chart').addEventListener('pointerleave', () => inspectPace(3.82));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      if (activeMenu) closeMenus(true); else closeDialog();
      return;
    }
    if (event.key === '/' && !modal.classList.contains('is-open') && !event.target.matches('input, textarea')) { event.preventDefault(); showSearch(); }
    if (event.target.id === 'pace-chart' && ['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
      event.preventDefault();
      const index = paceSamples.findIndex(item => item[0] === state.selectedPace);
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? paceSamples.length - 1 : Math.max(0, Math.min(paceSamples.length - 1, index + (event.key === 'ArrowRight' ? 1 : -1)));
      inspectPace(paceSamples[next][0]);
    }
    if (activeMenu && ['ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) {
      event.preventDefault();
      const options = $$(`#${activeMenu}-menu button:not(:disabled)`);
      const index = options.indexOf(document.activeElement);
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? options.length - 1 : (index + (event.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length;
      options[next].focus();
    }
    if (event.key === 'Tab' && activeMenu) closeMenus();
    if (event.key === 'Tab' && modal.classList.contains('is-open')) {
      const focusable = $$('button:not(:disabled), input:not(:disabled), [tabindex="0"]', dialog).filter(element => element.getClientRects().length);
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });

  function start() {
    if (started) return;
    started = true;
    drawCity();
    drawPace();
    renderActivities();
    renderFriends();
    if (!reducedMotion.matches) {
      canvas.classList.add('is-entering');
      $('.ring-fill').addEventListener('animationend', () => canvas.classList.remove('is-entering'), { once: true });
    }
  }
  reducedMotion.addEventListener('change', () => { if (reducedMotion.matches) canvas.classList.remove('is-entering'); });
  window.addEventListener('pagehide', () => { clearTimeout(toastTimer); clearTimeout(refreshTimer); });
  window.addEventListener('pageshow', () => {
    if ($('.update-status').disabled) {
      $('.update-status').disabled = false;
      refreshTraining();
    }
  });
  start();
})();
