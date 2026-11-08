(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const canvas = $('.canvas');
  const workspace = $('#workspace');
  const layer = $('#modal-layer');
  const popover = $('#popover');
  const products = [
    { id: 'nova', name: 'Nova Pro', description: 'Wireless Headphones', image: 'https://pngimg.com/uploads/headphones/headphones_PNG7659.png', rating: '4.8', reviews: '1.2K', price: '$249', battery: '32 hours', feature: 'Adaptive ANC' },
    { id: 'air', name: 'Air Pro', description: 'True Wireless Earbuds', image: 'https://pngimg.com/uploads/airPods/airPods_PNG40.png', rating: '4.6', reviews: '748', price: '$149', battery: '24 hours', feature: 'Transparency mode' },
    { id: 'focus', name: 'Focus', description: 'ANC Headphones', image: 'https://pngimg.com/uploads/headphones/headphones_PNG101921.png', rating: '4.7', reviews: '936', price: '$199', battery: '40 hours', feature: 'Active noise cancelling' },
    { id: 'studio', name: 'Studio Max', description: 'Over-Ear Headphones', image: 'https://pngimg.com/uploads/headphones/headphones_PNG7659.png', rating: '4.6', reviews: '624', price: '$329', battery: '30 hours', feature: 'High-resolution audio' }
  ];
  const listening = {
    'This Week': { values: [1.6, 3.2, 4.8, 6.2, 3.6, 5.2, 3.8], labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], trend: 18 },
    'Last Week': { values: [1.4, 2.6, 4.1, 4.8, 3.0, 4.7, 3.5], labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], trend: 9 },
    'This Month': { values: [4.2, 3.6, 4.8, 2.9, 3.2, 5.1, 4.2], labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], trend: 12, factor: 4 }
  };
  const profileNames = ['Noise Cancelling', 'Ambient Mode', 'Normal', 'Spatial Audio', 'Bass Boost'];
  const profileShares = { Monthly: [42, 24, 18, 12, 4], Weekly: [48, 20, 16, 12, 4], Today: [56, 16, 8, 16, 4] };
  const timeline = [0.05, 0.08, 0.3, 0.8, 1.0, 1.12, 1.25, 1.4, 1.65, 1.85, 2.1, 2.5, 2.8, 3.0, 3.35, 3.9, 4.2];
  const preferences = {
    focus: { title: 'Deep Focus', description: 'Less distraction. Clearer detail.', mode: 'noise', preset: 'Balanced', icon: 'brain', gains: [1, 0, 0, 2, 1] },
    everyday: { title: 'Everyday Balance', description: 'Stay in your music. Stay in your world.', mode: 'ambient', preset: 'Balanced', icon: 'sun', gains: [0, 0, 0, 0, 0] },
    immersive: { title: 'Full Immersion', description: 'A wider stage, with a little more depth.', mode: 'noise', preset: 'Bass Boost', icon: 'headphones', gains: [5, 3, 0, 1, 2] }
  };
  const state = { view: 'overview', table: 'listening', device: 'nova', connected: true, name: 'Nova Pro', mode: 'noise', spatial: true, phone: true, laptop: true, volume: 65, autoPause: true, autoOff: '30 minutes', listeningPeriod: 'This Week', profilePeriod: 'Monthly', momentsPeriod: 'Today', selectedDay: 3, selectedMoment: 12, saved: new Set(), preference: 'focus', preset: 'Balanced', gains: [0, 0, 0, 0, 0], support: { email: 'alex.morgan@email.com', message: '' }, accountName: 'Alex Morgan', notificationsRead: false };
  let started = false;
  let toastTimer;
  let menuTrigger;
  let dialogTrigger;
  let dialogVersion = 0;
  const heart = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19.5 13.1 12 20l-7.5-6.9a4.8 4.8 0 0 1 0-6.8 4.8 4.8 0 0 1 6.8 0l.7.7.7-.7a4.8 4.8 0 0 1 6.8 6.8Z"/></svg>';
  const activeFeatureIcons = {
    noise: '<rect x="3" y="8" width="2" height="8" rx="1"/><rect x="7" y="5" width="2" height="14" rx="1"/><rect x="11" y="2" width="2" height="20" rx="1"/><rect x="15" y="6" width="2" height="12" rx="1"/><rect x="19" y="9" width="2" height="6" rx="1"/>',
    ambient: '<circle cx="12" cy="12" r="4.5"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>',
    spatial: '<path d="m12 2 9 5v10l-9 5-9-5V7Z"/><path d="m3 7 9 5 9-5M12 12v10" fill="none" stroke="var(--surface)" stroke-width="1.5" stroke-linejoin="round"/>',
    multipoint: '<path d="m10 13 4-4m-6 7-1 1a4 4 0 0 1-6-6l5-5a4 4 0 0 1 6 0m0 2 1-1a4 4 0 0 1 6 6l-5 5a4 4 0 0 1-6 0" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><circle cx="12" cy="11" r="1.5"/>'
  };
  const featureIconNames = { noise: 'waveform', ambient: 'sun', spatial: 'box', multipoint: 'link' };
  const escapeHTML = (value) => String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);

  function toast(message, error = false) {
    clearTimeout(toastTimer);
    const element = $('#toast');
    $('span', element).textContent = message;
    $('.ti', element).className = `ti ti-${error ? 'alert-circle' : 'check'}`;
    element.classList.toggle('is-error', error);
    element.classList.add('is-visible');
    toastTimer = setTimeout(() => element.classList.remove('is-visible'), 2600);
  }

  function renderProducts() {
    $('#product-list').innerHTML = products.map((product) => `<article class="product-entry"><button class="product-open" data-product="${product.id}" aria-label="View ${product.name}"><span class="product-name">${product.name}</span><span class="product-description">${product.description}</span><span class="product-rating"><i class="ti ti-star" aria-hidden="true"></i>${product.rating} (${product.reviews})</span><img class="product-image" src="${product.image}" alt="" referrerpolicy="no-referrer"></button><button class="favorite-button" data-favorite="${product.id}" aria-label="Save ${product.name}" aria-pressed="${state.saved.has(product.id)}">${heart}</button></article>`).join('');
  }

  function renderListening() {
    const data = listening[state.listeningPeriod];
    const total = data.values.reduce((sum, value) => sum + value, 0) * (data.factor || 1);
    $('#listening-total').textContent = `${total.toFixed(1)}h`;
    $('#listening-trend').textContent = `${data.trend}%`;
    $('[data-period="listening"] span').textContent = state.listeningPeriod;
    $('#listening-bars').innerHTML = data.values.map((value, index) => `<button class="bar-button${index === state.selectedDay ? ' is-selected' : ''}" data-day="${index}" aria-label="${data.labels[index]}, ${value.toFixed(1)} hours${data.factor ? ' daily average' : ''}" aria-pressed="${index === state.selectedDay}"><span class="bar-mark" style="--value:${value}"><span class="bar-tooltip">${value.toFixed(1)}h</span></span><span class="bar-day">${data.labels[index]}</span></button>`).join('');
    $$('.bar-button').forEach((button) => {
      button.addEventListener('pointerenter', () => displayBar(Number(button.dataset.day)));
      button.addEventListener('pointerleave', () => displayBar(state.selectedDay));
      button.addEventListener('focus', () => displayBar(Number(button.dataset.day)));
      button.addEventListener('blur', () => displayBar(state.selectedDay));
    });
  }

  function displayBar(index) {
    $$('.bar-button').forEach((button, position) => button.classList.toggle('is-selected', position === index));
  }

  function renderProfiles() {
    $('[data-period="profile"] span').textContent = state.profilePeriod;
    $('#profile-bars').innerHTML = profileNames.map((name, index) => `<button class="profile-row" data-profile="${index}" aria-label="${name}, ${profileShares[state.profilePeriod][index]} percent"><span>${name}</span><span class="profile-track"><span style="--share:${profileShares[state.profilePeriod][index]}%"></span></span><strong>${profileShares[state.profilePeriod][index]}%</strong></button>`).join('');
  }

  function renderMoments() {
    const ratio = state.momentsPeriod === 'Yesterday' ? 3.6 / 4.2 : 1;
    const coordinates = timeline.map((value, index) => [index * 25, 89 - value / 4.2 * 77]);
    let path = `M ${coordinates[0].join(' ')}`;
    for (let index = 1; index < coordinates.length; index++) {
      const [x0, y0] = coordinates[index - 1];
      const [x1, y1] = coordinates[index];
      path += ` C ${x0 + 12.5} ${y0}, ${x1 - 12.5} ${y1}, ${x1} ${y1}`;
    }
    $('#moment-line').setAttribute('d', path);
    $('#moment-area').setAttribute('d', `${path} L 400 92 L 0 92 Z`);
    $('#daily-total').textContent = `${(4.2 * ratio).toFixed(1)}h`;
    $('#summary-day').textContent = `${(4.2 * ratio).toFixed(1)}h`;
    $('#daily-trend').textContent = state.momentsPeriod === 'Yesterday' ? '8%' : '12%';
    $('[data-period="moments"] span').textContent = state.momentsPeriod;
    $('.listening-summary > span:first-child small').textContent = state.momentsPeriod;
    updateMoment(state.selectedMoment);
  }

  function updateMoment(index) {
    state.selectedMoment = Math.max(0, Math.min(16, index));
    const value = timeline[state.selectedMoment];
    const x = state.selectedMoment * 25;
    const y = 89 - value / 4.2 * 77;
    const hour = state.selectedMoment + 6;
    const label = `${hour > 12 ? hour - 12 : hour} ${hour >= 12 ? 'PM' : 'AM'}`;
    const ratio = state.momentsPeriod === 'Yesterday' ? 3.6 / 4.2 : 1;
    $('#moment-dot').setAttribute('cx', x);
    $('#moment-dot').setAttribute('cy', y);
    $('#moment-crosshair').setAttribute('x1', x);
    $('#moment-crosshair').setAttribute('x2', x);
    $('.moment-tooltip strong').textContent = `${(value * ratio).toFixed(1)}h`;
    $('.moment-tooltip span').textContent = label;
    const chartWidth = $('.moments-chart').clientWidth;
    const tooltipWidth = $('.moment-tooltip').offsetWidth;
    const left = Math.max(tooltipWidth / 2 + 2, Math.min(chartWidth - tooltipWidth / 2 - 2, x / 400 * chartWidth));
    $('.moment-tooltip').style.left = `${left / canvas.clientWidth * 100}cqw`;
    $('.moment-tooltip').style.top = `${(y / 92 * $('.area-chart').clientHeight - 5) / canvas.clientWidth * 100}cqw`;
    $('.moments-chart').setAttribute('aria-label', `Listening timeline, ${label}: ${(value * ratio).toFixed(1)} hours. Use left and right arrow keys to explore.`);
  }

  function renderDevice() {
    $('#device-name').textContent = state.name;
    $('.device-overview').classList.toggle('has-long-name', state.name.length > 14);
    const device = products.find((product) => product.id === state.device);
    $('.device-overview img').src = device.image;
    $('.device-overview img').alt = state.name;
    $('.device-overview p').textContent = device.id === 'nova' ? 'Wireless Noise Cancelling Headphones' : device.description;
    const badge = $('#connection-status');
    badge.classList.toggle('is-disconnected', !state.connected);
    badge.replaceChildren(document.createElement('span'), document.createTextNode(state.connected ? 'Connected' : 'Disconnected'));
    $('#battery-value').textContent = state.connected ? '78%' : '—';
    $('#battery-time').textContent = state.connected ? '8h 20m left' : 'Device offline';
    $('.battery-track').style.opacity = state.connected ? '1' : '.3';
    $('#noise-label').textContent = state.mode === 'noise' ? 'Adaptive' : 'Off';
    $('#ambient-label').textContent = state.mode === 'ambient' ? 'On' : 'Off';
    $('#spatial-label').textContent = state.spatial ? 'On' : 'Off';
    $('#multipoint-label').textContent = state.phone || state.laptop ? 'Connected' : 'Off';
    $$('[data-feature]').forEach((button) => {
      const feature = button.dataset.feature;
      button.disabled = !state.connected;
      button.classList.toggle('is-active', ['noise', 'ambient'].includes(feature) && state.mode === feature);
      const active = feature === 'spatial' ? state.spatial : feature === 'multipoint' ? state.phone || state.laptop : state.mode === feature;
      button.setAttribute('aria-pressed', String(active));
      const icon = button.querySelector('i, svg');
      icon.outerHTML = active ? `<svg class="feature-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">${activeFeatureIcons[feature]}</svg>` : `<i class="ti ti-${featureIconNames[feature]}" aria-hidden="true"></i>`;
    });
  }

  function closeMenu() {
    popover.hidden = true;
    popover.replaceChildren();
    if (menuTrigger?.isConnected) menuTrigger.setAttribute('aria-expanded', 'false');
    menuTrigger = null;
  }

  function openMenu(trigger, items, title = '') {
    if (menuTrigger === trigger && !popover.hidden) return closeMenu();
    closeMenu();
    menuTrigger = trigger;
    trigger.setAttribute('aria-expanded', 'true');
    popover.setAttribute('role', 'menu');
    if (title) {
      const heading = document.createElement('div');
      heading.className = 'menu-title';
      heading.textContent = title;
      popover.append(heading);
    }
    items.forEach((item) => {
      const button = document.createElement('button');
      button.className = `menu-option${item.selected ? ' is-selected' : ''}`;
      button.setAttribute('role', 'menuitem');
      button.disabled = Boolean(item.disabled);
      const label = document.createElement('span');
      label.textContent = item.label;
      button.append(label);
      if (item.selected) {
        const icon = document.createElement('i');
        icon.className = 'ti ti-check';
        icon.setAttribute('aria-hidden', 'true');
        button.append(icon);
      }
      button.addEventListener('click', () => { closeMenu(); item.onClick(); });
      popover.append(button);
    });
    popover.hidden = false;
    positionMenu(trigger);
    $('button:not(:disabled)', popover)?.focus();
  }

  function positionMenu(trigger) {
    const bounds = canvas.getBoundingClientRect();
    const target = trigger.getBoundingClientRect();
    const margin = bounds.width * .014;
    const left = Math.max(margin, Math.min(bounds.width - popover.offsetWidth - margin, target.right - bounds.left - popover.offsetWidth));
    const top = Math.max(margin, Math.min(bounds.height - popover.offsetHeight - margin, target.bottom - bounds.top + bounds.width * .005));
    popover.style.left = `${left / bounds.width * 100}cqw`;
    popover.style.top = `${top / bounds.width * 100}cqw`;
  }

  function openDialog(title, body, footer = '') {
    closeMenu();
    if (!layer.classList.contains('is-open')) dialogTrigger = document.activeElement;
    dialogVersion++;
    $('#dialog-title').textContent = title;
    $('#dialog-body').innerHTML = body;
    $('#dialog-footer').innerHTML = footer;
    layer.inert = false;
    layer.setAttribute('aria-hidden', 'false');
    layer.classList.add('is-open');
    $('.app-shell').inert = true;
    workspace.inert = true;
    ($('input:not([type="range"])', layer) || $('.dialog')).focus();
    $$('input[type="range"]', layer).forEach(updateRange);
  }

  function closeDialog() {
    if (!layer.classList.contains('is-open')) return;
    closeMenu();
    dialogVersion++;
    layer.classList.remove('is-open');
    layer.inert = true;
    layer.setAttribute('aria-hidden', 'true');
    $('.app-shell').inert = false;
    workspace.inert = false;
    if (dialogTrigger?.isConnected) dialogTrigger.focus();
    else $('.brand').focus();
  }

  function updateRange(input) {
    const progress = (Number(input.value) - Number(input.min || 0)) / (Number(input.max || 100) - Number(input.min || 0)) * 100;
    input.style.setProperty('--range-progress', `${progress}%`);
    const output = input.closest('.field, .eq-row')?.querySelector('output');
    if (output) output.textContent = input.dataset.eq !== undefined ? `${Number(input.value) > 0 ? '+' : ''}${input.value} dB` : `${input.value}%`;
  }

  function showView(view) {
    closeDialog();
    closeMenu();
    state.view = view;
    $$('.nav-item').forEach((button) => {
      const active = button.dataset.view === view;
      button.classList.toggle('is-active', active);
      if (active) button.setAttribute('aria-current', 'page');
      else button.removeAttribute('aria-current');
    });
    const tab = $(`[data-view="${view}"]`);
    $('.nav-indicator').style.transform = `translateX(${tab.offsetLeft / canvas.clientWidth * 100}cqw)`;
    workspace.hidden = view === 'overview';
    $('#overview-view').inert = view !== 'overview';
    if (view === 'devices') renderDevicesView();
    if (view === 'activity') renderActivityView();
    if (view === 'sound') renderSoundView();
    if (view === 'support') renderSupportView();
  }

  function renderDevicesView() {
    workspace.innerHTML = `<header class="workspace-header"><div><h1>Your Devices</h1><p>A little less noise. A lot more you.</p></div><button class="secondary-button" data-action="scan"><i class="ti ti-bluetooth" aria-hidden="true"></i>Find devices</button></header><div class="workspace-grid">${products.slice(0, 3).map((product) => `<article class="device-tile"><img src="${product.image}" alt="${product.name}" referrerpolicy="no-referrer"><h2>${product.id === state.device ? escapeHTML(state.name) : product.name}</h2><p>${product.id === state.device && state.connected ? 'Connected · 78% battery' : 'Available device'}</p><button class="${product.id === state.device && state.connected ? 'secondary' : 'primary'}-button" data-device-connect="${product.id}">${product.id === state.device && state.connected ? 'Device settings' : 'Select device'}</button></article>`).join('')}</div><p class="workspace-note"><i class="ti ti-link" aria-hidden="true"></i>Your sound settings stay with your listening session.</p>`;
  }

  function activityTable() {
    if (state.table === 'profile') return `<table class="data-table"><thead><tr><th>Sound profile</th><th>Listening share</th></tr></thead><tbody>${profileNames.map((name, index) => `<tr><td>${name}</td><td>${profileShares[state.profilePeriod][index]}%</td></tr>`).join('')}</tbody><tfoot><tr><td>Total</td><td>100%</td></tr></tfoot></table>`;
    if (state.table === 'moments') return `<table class="data-table compact"><thead><tr><th>Time</th><th>Cumulative listening</th></tr></thead><tbody>${timeline.map((value, index) => { const hour = index + 6; return `<tr><td>${hour > 12 ? hour - 12 : hour} ${hour >= 12 ? 'PM' : 'AM'}</td><td>${(value * (state.momentsPeriod === 'Yesterday' ? 3.6 / 4.2 : 1)).toFixed(1)}h</td></tr>`; }).join('')}</tbody></table>`;
    const data = listening[state.listeningPeriod];
    return `<table class="data-table"><thead><tr><th>Day</th><th>${data.factor ? 'Daily average' : 'Listening time'}</th><th>Share</th></tr></thead><tbody>${data.values.map((value, index) => `<tr><td>${data.labels[index]}</td><td>${value.toFixed(1)}h</td><td>${Math.round(value / data.values.reduce((sum, item) => sum + item, 0) * 100)}%</td></tr>`).join('')}</tbody><tfoot><tr><td>${data.factor ? 'Monthly total' : 'Total'}</td><td>${(data.values.reduce((sum, value) => sum + value, 0) * (data.factor || 1)).toFixed(1)}h</td><td>100%</td></tr></tfoot></table>`;
  }

  function renderActivityView() {
    workspace.innerHTML = `<header class="workspace-header"><div><h1>Your Listening Activity</h1><p>More of the moments that sound like you.</p></div><button class="secondary-button" data-action="export"><i class="ti ti-download" aria-hidden="true"></i>Export activity</button></header><div class="preset-buttons table-tabs">${[['listening', 'Listening time'], ['profile', 'Sound profiles'], ['moments', 'Timeline']].map(([key, label]) => `<button class="choice-button" data-table="${key}" aria-pressed="${state.table === key}">${label}</button>`).join('')}</div><div class="data-toolbar"><h2>${state.table === 'profile' ? 'Sound profile share' : state.table === 'moments' ? 'Listening timeline' : 'Listening time'}</h2><button class="period-button" data-period="${state.table}" aria-haspopup="menu" aria-expanded="false"><span>${state[`${state.table}Period`]}</span><i class="ti ti-chevron-down" aria-hidden="true"></i></button></div>${activityTable()}${state.table === 'listening' ? `<p class="workspace-note">${state.listeningPeriod === 'This Month' ? '112 hours across the last four weeks. The chart shows daily averages.' : 'Time spent connected to your headphones, Monday through Sunday.'}</p>` : ''}`;
  }

  function renderSoundView() {
    workspace.innerHTML = `<header class="workspace-header"><div><h1>Make It Your Sound</h1><p>Find the balance that feels right.</p></div><button class="secondary-button" data-action="reset-eq">Reset equalizer</button></header><div class="equalizer-layout"><div class="equalizer-panel"><h2>Equalizer</h2><div class="preset-buttons">${['Balanced', 'Bass Boost', 'Vocal', 'Custom'].map((name) => `<button class="choice-button" data-preset="${name}" aria-pressed="${state.preset === name}">${name}</button>`).join('')}</div>${['60 Hz', '250 Hz', '1 kHz', '4 kHz', '16 kHz'].map((name, index) => `<label class="eq-row"><span>${name}</span><input type="range" min="-6" max="6" step="1" value="${state.gains[index]}" data-eq="${index}" aria-label="${name} equalizer"><output>${state.gains[index]} dB</output></label>`).join('')}</div><aside class="eq-side"><h2>Listening preferences</h2><div class="setting-row"><span>Spatial Audio<small>A wider, more immersive soundstage</small></span><button class="switch" role="switch" aria-checked="${state.spatial}" aria-label="Spatial Audio" data-action="spatial"></button></div><div class="setting-row"><span>Auto-pause<small>Pause when you take off your headphones</small></span><button class="switch" role="switch" aria-checked="${state.autoPause}" aria-label="Auto-pause" data-action="auto-pause"></button></div><button class="settings-link" data-action="settings">Device settings<i class="ti ti-chevron-right" aria-hidden="true"></i></button><button class="settings-link" data-action="personalize">Find your sound profile<i class="ti ti-chevron-right" aria-hidden="true"></i></button></aside></div>`;
    $$('input[type="range"]', workspace).forEach(updateRange);
  }

  function renderSupportView() {
    workspace.innerHTML = `<header class="workspace-header"><div><h1>Here for Your Sound</h1><p>A few answers, so you can get back to listening.</p></div><button class="secondary-button" data-action="settings">Device settings</button></header><div class="support-layout"><div><h2>Good to know</h2>${[['How do I use noise cancelling?', 'Choose Noise Cancelling on your device card. Adaptive mode adjusts your listening profile. Choose Ambient Mode to let your surroundings in.'], ['Can I connect two devices?', 'Yes. Open Multipoint to manage your phone and computer connections. Your headphones can keep both devices selected.'], ['How do I customize my equalizer?', 'Open Sound and choose Balanced, Bass Boost, or Vocal. Adjust any frequency to create your own balance.']].map(([question, answer], index) => `<div class="faq-item"><button class="faq-question" data-faq="${index}" aria-expanded="false">${question}<i class="ti ti-plus" aria-hidden="true"></i></button><p class="faq-answer" hidden>${answer}</p></div>`).join('')}<p class="attribution">Product imagery: <a href="https://pngimg.com/uploads/headphones/headphones_PNG7659.png" target="_blank" rel="noopener noreferrer">pngimg.com</a> · CC BY-NC 4.0.<br>Account imagery: Pravatar. Non-commercial use.</p></div><form class="support-form" id="support-form" novalidate><div class="field"><label for="support-email">Email address</label><input id="support-email" name="email" type="email" autocomplete="email" maxlength="100" required></div><div class="field"><label for="support-message">How can we help?</label><textarea id="support-message" name="message" maxlength="1000" placeholder="Tell us what’s happening with your device." required></textarea></div><div id="support-status" class="form-status" role="status" hidden></div><button class="primary-button" type="submit" id="support-submit">Send request</button><button class="secondary-button" type="button" data-action="download-support" hidden>Download request</button></form></div>`;
    $('#support-email').value = state.support.email;
    $('#support-message').value = state.support.message;
  }

  function openSettings() {
    if (!state.connected) { showView('devices'); toast('Select a device to open its settings.', true); return; }
    openDialog('Device Settings', `<form id="settings-form" novalidate><div class="dialog-grid"><div class="dialog-column"><div class="field"><label for="device-name-input">Device name</label><input id="device-name-input" name="name" maxlength="24" required><span class="field-error" id="name-error" role="status"></span></div><div class="field"><label class="range-label" for="volume-input">Listening volume<output>${state.volume}%</output></label><input id="volume-input" name="volume" type="range" min="0" max="100" value="${state.volume}"></div></div><div class="dialog-column"><div class="setting-row"><span>Auto-pause<small>Pause audio when headphones are removed</small></span><button type="button" class="switch" role="switch" aria-checked="${state.autoPause}" aria-label="Auto-pause" data-action="draft-auto-pause"></button></div><div class="field"><span class="field-label">Auto power-off</span><button class="field-select" type="button" data-action="auto-off" aria-haspopup="menu" aria-expanded="false"><span>${state.autoOff}</span><i class="ti ti-chevron-down" aria-hidden="true"></i></button></div><div class="setting-row"><span>Firmware<small>Version 2.4.1</small></span><span class="connection-badge"><span></span>Up to date</span></div></div></div></form>`, '<button class="secondary-button" data-action="close-dialog">Cancel</button><button class="primary-button" type="submit" form="settings-form" id="settings-save">Save changes</button>', 'settings');
    $('#device-name-input').value = state.name;
  }

  function openProduct(id) {
    const product = products.find((item) => item.id === id);
    openDialog(product.name, `<div class="dialog-grid"><div class="detail-media"><img src="${product.image}" alt="${product.name}" referrerpolicy="no-referrer"></div><div class="product-detail"><h3>${product.name}</h3><p>${product.description}</p><strong class="detail-price">${product.price}</strong><div class="detail-specs"><span>Battery life<strong>${product.battery}</strong></span><span>Sound technology<strong>${product.feature}</strong></span><span>Rating<strong>${product.rating} / 5</strong></span></div></div></div>`, `<button class="secondary-button" data-action="close-dialog">Close</button><button class="primary-button" data-save-product="${id}">${state.saved.has(id) ? 'Remove from saved' : 'Save this product'}</button>`, 'product');
  }

  function openSaved() {
    const saved = products.filter((product) => state.saved.has(product.id));
    openDialog('Saved Products', saved.length ? `<div class="saved-grid">${saved.map((product) => `<article class="saved-item"><img src="${product.image}" alt="${product.name}" referrerpolicy="no-referrer"><h3>${product.name}</h3><button class="secondary-button" data-remove-saved="${product.id}">Remove</button></article>`).join('')}</div>` : '<div class="empty-state"><i class="ti ti-heart" aria-hidden="true"></i><h3>Find your next favorite.</h3><p>Save a product to keep it here.</p></div>', '<button class="primary-button" data-action="close-dialog">Done</button>', 'saved');
  }

  function toggleSaved(id) {
    if (state.saved.has(id)) state.saved.delete(id);
    else state.saved.add(id);
    const product = products.find((item) => item.id === id);
    $$(`[data-favorite="${id}"]`).forEach((button) => {
      button.setAttribute('aria-pressed', String(state.saved.has(id)));
      button.setAttribute('aria-label', `${state.saved.has(id) ? 'Unsave' : 'Save'} ${product.name}`);
    });
    toast(`${product.name} ${state.saved.has(id) ? 'added to' : 'removed from'} saved products.`);
  }

  function openPersonalize() {
    const preference = preferences[state.preference];
    openDialog('Find Your Perfect Sound', `<p class="workspace-note" style="margin-top:0">What does your next listening moment look like?</p><div class="preference-grid">${Object.entries(preferences).map(([id, item]) => `<button class="preference-card" data-preference="${id}" aria-pressed="${state.preference === id}"><i class="ti ti-${item.icon}" aria-hidden="true"></i><strong>${item.title}</strong><small>${item.description}</small></button>`).join('')}</div><div class="profile-result"><div><h3>${preference.title}</h3><p>${preference.preset} equalizer · ${preference.mode === 'noise' ? 'Adaptive noise cancelling' : 'Ambient mode'}</p></div><i class="ti ti-waveform" aria-hidden="true"></i></div>`, '<button class="secondary-button" data-action="close-dialog">Not now</button><button class="primary-button" data-action="apply-profile">Use this profile</button>', 'personalize');
  }

  function openMultipoint() {
    openDialog('Multipoint Connections', `<p class="workspace-note" style="margin-top:0;margin-bottom:1.4cqw">Two devices. One seamless listening experience.</p>${[['phone', 'device-mobile', 'Alex’s iPhone', 'Phone connection'], ['laptop', 'device-laptop', 'MacBook Pro', 'Computer connection']].map(([key, icon, name, label]) => `<div class="multipoint-row"><span><i class="ti ti-${icon}" aria-hidden="true"></i><span>${name}<small>${state[key] ? 'Connected' : 'Disconnected'}</small></span></span><button class="switch" role="switch" aria-label="${label}" aria-checked="${state[key]}" data-connection="${key}"></button></div>`).join('')}`, '<button class="primary-button" data-action="close-dialog">Done</button>', 'multipoint');
  }

  function openSearch() {
    openDialog('Find Your Sound', '<div class="search-input-wrap"><i class="ti ti-search" aria-hidden="true"></i><input id="search-input" type="search" placeholder="Search devices, profiles, settings…" aria-label="Search devices, profiles, settings" autocomplete="off" maxlength="80"></div><div class="search-results" id="search-results"></div>', '<button class="secondary-button" data-action="close-dialog">Close</button>', 'search');
    renderSearch('');
  }

  function renderSearch(query) {
    const items = [...products.map((product) => ({ title: product.name, subtitle: product.description, icon: 'headphones', id: product.id })), { title: 'Device Settings', subtitle: 'Volume, auto-pause, power', icon: 'adjustments', view: 'settings' }, { title: 'Sound Profiles', subtitle: 'Equalizer and listening preferences', icon: 'waveform', view: 'sound' }];
    const matches = items.filter((item) => `${item.title} ${item.subtitle}`.toLowerCase().includes(query.trim().toLowerCase()));
    const container = $('#search-results');
    container.replaceChildren();
    matches.forEach((item) => {
      const button = document.createElement('button');
      button.className = 'search-result';
      const icon = document.createElement('i');
      icon.className = `ti ti-${item.icon}`;
      icon.setAttribute('aria-hidden', 'true');
      const text = document.createElement('span');
      const title = document.createElement('strong');
      title.textContent = item.title;
      const subtitle = document.createElement('small');
      subtitle.textContent = item.subtitle;
      text.append(title, subtitle);
      button.append(icon, text);
      button.addEventListener('click', () => {
        if (item.id) openProduct(item.id);
        else if (item.view === 'settings') openSettings();
        else showView(item.view);
      });
      container.append(button);
    });
    if (!matches.length) container.innerHTML = '<div class="empty-state"><i class="ti ti-search" aria-hidden="true"></i><h3>No matches found.</h3><p>Try a device name or a sound setting.</p></div>';
  }

  function download(filename, content, type = 'text/plain') {
    const url = URL.createObjectURL(new Blob([content], { type }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function periodMenu(button) {
    const key = button.dataset.period;
    const options = key === 'listening' ? Object.keys(listening) : key === 'profile' ? Object.keys(profileShares) : ['Today', 'Yesterday'];
    const current = state[`${key}Period`];
    openMenu(button, [...options.map((label) => ({ label, selected: label === current, onClick: () => {
      state[`${key}Period`] = label;
      if (key === 'listening') renderListening();
      if (key === 'profile') renderProfiles();
      if (key === 'moments') renderMoments();
      if (state.view === 'activity') renderActivityView();
      if (button.isConnected) button.focus();
    } })), { label: 'Custom range', disabled: true }]);
  }

  const actions = {
    overview: () => showView('overview'),
    devices: () => showView('devices'),
    search: openSearch,
    settings: openSettings,
    'close-dialog': closeDialog,
    personalize: openPersonalize,
    spatial: () => { state.spatial = !state.spatial; renderDevice(); if (state.view === 'sound') renderSoundView(); },
    'auto-pause': () => { state.autoPause = !state.autoPause; renderSoundView(); },
    'draft-auto-pause': (button) => button.setAttribute('aria-checked', String(button.getAttribute('aria-checked') !== 'true')),
    'auto-off': (button) => openMenu(button, ['15 minutes', '30 minutes', '1 hour', 'Never'].map((label) => ({ label, selected: $('span', button).textContent === label, onClick: () => { $('span', button).textContent = label; button.focus(); } }))),
    'device-menu': (button) => openMenu(button, [{ label: 'Device settings', disabled: !state.connected, onClick: openSettings }, { label: 'Multipoint connections', disabled: !state.connected, onClick: openMultipoint }, { label: state.connected ? 'Disconnect device' : 'Select device', onClick: () => { state.connected = !state.connected; renderDevice(); toast(state.connected ? `${state.name} selected.` : `${state.name} disconnected.`); } }]),
    account: (button) => openMenu(button, [{ label: 'Your profile', onClick: () => {
      openDialog('Your Profile', '<form id="account-form" novalidate><div class="dialog-grid"><div class="field"><label for="account-name-input">Display name</label><input id="account-name-input" maxlength="30" required><span class="field-error" id="account-error" role="status"></span></div><div class="setting-row"><span>Membership<small>Premium sound, every day.</small></span><span class="connection-badge"><span></span>Premium</span></div></div></form>', '<button class="secondary-button" data-action="close-dialog">Cancel</button><button class="primary-button" type="submit" form="account-form">Save profile</button>', 'account');
      $('#account-name-input').value = state.accountName;
    } }, { label: 'Saved products', onClick: openSaved }, { label: 'Data table', onClick: () => showView('activity') }, { label: canvas.classList.contains('reduce-motion') ? 'Enable animations' : 'Reduce motion', onClick: () => { canvas.classList.toggle('reduce-motion'); toast(canvas.classList.contains('reduce-motion') ? 'Reduced motion is on.' : 'Animations are on.'); } }]),
    notifications: (button) => {
      openMenu(button, [{ label: state.notificationsRead ? 'All caught up' : 'Mark all as read', disabled: state.notificationsRead, onClick: () => { state.notificationsRead = true; toast('All notifications marked as read.'); } }], 'Notifications');
      const note = document.createElement('div');
      note.className = 'notification-row';
      note.textContent = state.notificationsRead ? 'No new notifications.' : 'Your weekly listening insights are ready.';
      popover.prepend(note);
      positionMenu(button);
    },
    scan: (button) => {
      const version = state.view;
      button.disabled = true;
      button.textContent = 'Finding devices…';
      setTimeout(() => { if (state.view === version) { renderDevicesView(); toast('Three devices are available to select.'); } }, 650);
    },
    export: () => {
      const rows = $$('.data-table tr', workspace).map((row) => [...row.cells].map((cell) => `"${cell.textContent.trim().replaceAll('"', '""')}"`).join(','));
      download(`sonvex-${state.table}.csv`, rows.join('\n'), 'text/csv;charset=utf-8');
      toast('Listening activity exported.');
    },
    'reset-eq': () => { state.preset = 'Balanced'; state.gains = [0, 0, 0, 0, 0]; renderSoundView(); toast('Equalizer reset to Balanced.'); },
    'apply-profile': () => {
      if (!state.connected) { toast('Select a device before applying a sound profile.', true); return; }
      const preference = preferences[state.preference];
      state.mode = preference.mode;
      state.preset = state.preference === 'everyday' ? 'Balanced' : 'Custom';
      state.gains = [...preference.gains];
      state.spatial = state.preference === 'immersive';
      renderDevice();
      if (state.view === 'sound') renderSoundView();
      closeDialog();
      toast(`${preference.title} profile applied.`);
    },
    'download-support': () => {
      download('sonvex-support-request.txt', `SONVEX Support\nFrom: ${state.support.email}\nDevice: ${state.name}\n\n${state.support.message}\n`);
      toast('Support request downloaded.');
    }
  };

  document.addEventListener('click', (event) => {
    const target = event.target.closest('button, [data-action]');
    if (!target || target.disabled || !canvas.contains(target)) return;
    if (target.dataset.view) return showView(target.dataset.view);
    if (target.dataset.table) { state.table = target.dataset.table; renderActivityView(); return; }
    if (target.dataset.period) return periodMenu(target);
    if (target.dataset.action && actions[target.dataset.action]) return actions[target.dataset.action](target);
    if (target.dataset.favorite) return toggleSaved(target.dataset.favorite);
    if (target.dataset.product) return openProduct(target.dataset.product);
    if (target.dataset.saveProduct) { toggleSaved(target.dataset.saveProduct); target.textContent = state.saved.has(target.dataset.saveProduct) ? 'Remove from saved' : 'Save this product'; return; }
    if (target.dataset.removeSaved) { toggleSaved(target.dataset.removeSaved); openSaved(); return; }
    if (target.dataset.day !== undefined) { state.selectedDay = Number(target.dataset.day); displayBar(state.selectedDay); $$('.bar-button').forEach((button) => button.setAttribute('aria-pressed', String(Number(button.dataset.day) === state.selectedDay))); return; }
    if (target.dataset.feature) {
      const feature = target.dataset.feature;
      if (feature === 'multipoint') return openMultipoint();
      if (feature === 'spatial') state.spatial = !state.spatial;
      else state.mode = state.mode === feature ? 'normal' : feature;
      renderDevice();
      return;
    }
    if (target.dataset.deviceConnect) {
      if (target.dataset.deviceConnect === state.device && state.connected) return openSettings();
      const product = products.find((item) => item.id === target.dataset.deviceConnect);
      state.device = product.id;
      state.name = product.name;
      state.connected = true;
      renderDevice();
      renderDevicesView();
      toast(`${product.name} selected.`);
      return;
    }
    if (target.dataset.preset) {
      const name = target.dataset.preset;
      state.preset = name;
      if (name !== 'Custom') state.gains = name === 'Balanced' ? [0, 0, 0, 0, 0] : name === 'Bass Boost' ? [5, 3, 0, 1, 2] : [-2, -1, 3, 2, 0];
      renderSoundView();
      return;
    }
    if (target.dataset.preference) { state.preference = target.dataset.preference; openPersonalize(); return; }
    if (target.dataset.connection) { const key = target.dataset.connection; state[key] = !state[key]; target.setAttribute('aria-checked', String(state[key])); target.closest('.multipoint-row').querySelector('small').textContent = state[key] ? 'Connected' : 'Disconnected'; renderDevice(); return; }
    if (target.dataset.faq !== undefined) { const expanded = target.getAttribute('aria-expanded') === 'true'; target.setAttribute('aria-expanded', String(!expanded)); target.nextElementSibling.hidden = expanded; $('.ti', target).className = `ti ti-${expanded ? 'plus' : 'minus'}`; return; }
    if (target.dataset.profile !== undefined) {
      const index = Number(target.dataset.profile);
      const share = profileShares[state.profilePeriod][index];
      openDialog(profileNames[index], `<div class="profile-result"><div><h3>${share}% of your listening</h3><p>${state.profilePeriod} · ${profileNames[index]}</p></div><i class="ti ti-waveform" aria-hidden="true"></i></div><p class="workspace-note">Your sound profile is shaped by the listening modes you choose.</p>`, '<button class="secondary-button" data-action="close-dialog">Close</button><button class="primary-button" data-view="sound">Adjust sound</button>', 'insight');
    }
  });

  document.addEventListener('pointerdown', (event) => {
    if (!popover.hidden && !popover.contains(event.target) && !menuTrigger?.contains(event.target)) closeMenu();
  });

  document.addEventListener('input', (event) => {
    const input = event.target;
    if (input.id === 'search-input') renderSearch(input.value);
    if (input.type === 'range') updateRange(input);
    if (input.dataset.eq !== undefined) {
      state.gains[Number(input.dataset.eq)] = Number(input.value);
      state.preset = 'Custom';
      $$('[data-preset]').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.preset === 'Custom')));
    }
    if (input.closest('#support-form')) {
      state.support.email = $('#support-email').value;
      state.support.message = $('#support-message').value;
      input.removeAttribute('aria-invalid');
    }
    if (input.id === 'device-name-input') { input.removeAttribute('aria-invalid'); $('#name-error').textContent = ''; }
  });

  document.addEventListener('submit', (event) => {
    event.preventDefault();
    const form = event.target;
    if (form.id === 'settings-form') {
      const name = $('#device-name-input').value.trim();
      if (!name) { $('#name-error').textContent = 'Enter a device name.'; $('#device-name-input').setAttribute('aria-invalid', 'true'); $('#device-name-input').focus(); return; }
      const version = dialogVersion;
      const volume = Number($('#volume-input').value);
      const autoPause = $('[data-action="draft-auto-pause"]').getAttribute('aria-checked') === 'true';
      const autoOff = $('[data-action="auto-off"] span').textContent;
      $('#settings-save').disabled = true;
      $('#settings-save').textContent = 'Saving…';
      form.inert = true;
      setTimeout(() => {
        if (version !== dialogVersion) return;
        state.name = name;
        state.volume = volume;
        state.autoPause = autoPause;
        state.autoOff = autoOff;
        renderDevice();
        if (state.view === 'devices') renderDevicesView();
        if (state.view === 'sound') renderSoundView();
        closeDialog();
        toast('Device settings updated.');
      }, 400);
    }
    if (form.id === 'account-form') {
      const name = $('#account-name-input').value.trim();
      if (!name) { $('#account-error').textContent = 'Enter your display name.'; $('#account-name-input').setAttribute('aria-invalid', 'true'); return; }
      state.accountName = name;
      $('.account-name').textContent = name;
      $('.account').setAttribute('aria-label', `${name} account menu`);
      closeDialog();
      toast('Profile updated.');
    }
    if (form.id === 'support-form') {
      const email = $('#support-email');
      const message = $('#support-message');
      const status = $('#support-status');
      status.hidden = false;
      if (!email.validity.valid || !message.value.trim()) {
        status.textContent = !email.validity.valid ? 'Enter a valid email address.' : 'Tell us what you need help with.';
        const invalid = !email.validity.valid ? email : message;
        invalid.setAttribute('aria-invalid', 'true');
        invalid.focus();
        return;
      }
      const submit = $('#support-submit');
      submit.disabled = true;
      submit.textContent = 'Preparing request…';
      status.hidden = true;
      setTimeout(() => {
        if (!form.isConnected) return;
        submit.disabled = false;
        submit.textContent = 'Try again';
        status.hidden = false;
        status.textContent = 'A support connection is required to send your request. You can download it instead.';
        $('[data-action="download-support"]', form).hidden = false;
      }, 550);
    }
  });

  $('.moments-chart').addEventListener('pointermove', (event) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    updateMoment(Math.round((event.clientX - bounds.left) / bounds.width * 16));
  });
  $('.moments-chart').addEventListener('pointerleave', () => updateMoment(12));
  $('.moments-chart').addEventListener('keydown', (event) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    updateMoment(event.key === 'Home' ? 0 : event.key === 'End' ? 16 : state.selectedMoment + (event.key === 'ArrowRight' ? 1 : -1));
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      if (!popover.hidden) { const trigger = menuTrigger; closeMenu(); trigger?.focus(); }
      else closeDialog();
      return;
    }
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); openSearch(); return; }
    if (!popover.hidden && ['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
      event.preventDefault();
      const items = $$('button:not(:disabled)', popover);
      const current = items.indexOf(document.activeElement);
      const index = event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1 : (current + (event.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
      items[index]?.focus();
      return;
    }
    if (event.key === 'Tab' && layer.classList.contains('is-open')) {
      const focusable = [...$$('button:not(:disabled), input:not(:disabled), textarea, [tabindex="0"]', layer), ...(!popover.hidden ? $$('button:not(:disabled)', popover) : [])].filter((item) => item.getClientRects().length);
      const first = focusable[0];
      const last = focusable.at(-1);
      if (event.shiftKey && (document.activeElement === first || document.activeElement === $('.dialog'))) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }
  });

  function start() {
    if (started) return;
    started = true;
    renderProducts();
    renderListening();
    renderProfiles();
    renderDevice();
    renderMoments();
    canvas.classList.add('has-started');
    new ResizeObserver(() => {
      updateMoment(state.selectedMoment);
      const tab = $(`[data-view="${state.view}"]`);
      $('.nav-indicator').style.transform = `translateX(${tab.offsetLeft / canvas.clientWidth * 100}cqw)`;
      if (menuTrigger && !popover.hidden) positionMenu(menuTrigger);
    }).observe(canvas);
  }
  start();
})();
