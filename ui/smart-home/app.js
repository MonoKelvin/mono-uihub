const canvas = document.querySelector('.canvas');
const appShell = document.querySelector('.app-shell');
const state = {
  rooms: [
    { id: 'living', name: 'Living room', icon: 'sofa', locked: false },
    { id: 'bath', name: 'Bathroom', icon: 'bath', locked: false },
    { id: 'office', name: 'Office', icon: 'desk', locked: false },
    { id: 'garage', name: 'Garage', icon: 'garage', locked: false },
    { id: 'library', name: 'Library', icon: 'library', locked: false },
    { id: 'laundry', name: 'Laundry', icon: 'washer', locked: false }
  ],
  devices: [
    { id: 'climate', name: 'Climate', type: 'climate', room: 'living', number: '380939412641', on: false },
    { id: 'cctv', name: 'CCTV', type: 'camera', room: 'living', number: '380939412642', on: true },
    { id: 'lighting', name: 'Lighting', type: 'bulb', room: 'living', number: '380939412643', on: true }
  ],
  currentRoom: 'living',
  homeRoom: 'all',
  devicePage: 0,
  temperature: 25,
  profile: { name: 'Haiduk Yehor', phone: '38093 94 12 641' },
  address: 'Vinnitsa, Donjenka 60',
  notificationsRead: false,
  notificationsEnabled: true,
  draft: { name: '', type: '', room: '', number: '' },
  activeScreen: null,
  detailId: null,
  navigation: [],
  securityPage: 0,
  started: false
};
const deviceTypes = [
  { id: 'climate', name: 'Climate', icon: 'climate' },
  { id: 'camera', name: 'CCTV', icon: 'camera' },
  { id: 'bulb', name: 'Lighting', icon: 'bulb' },
  { id: 'intercom', name: 'Intercom', icon: 'intercom' }
];
const icon = (name, extra = '') => `<svg class="icon ${extra}" aria-hidden="true"><use href="#i-${name}"/></svg>`;
const avatar = () => '<svg class="avatar-art" aria-hidden="true" viewBox="0 0 100 100"><use href="#avatar-yehor"/></svg>';
const escapeHTML = (value) => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const roomById = (id) => state.rooms.find((room) => room.id === id);
const typeById = (id) => deviceTypes.find((type) => type.id === id);
const buttonIcon = (name, action, label) => `<button class="icon-button" data-action="${action}" aria-label="${label}">${icon(name)}</button>`;
let toastTimer;
let requestId = 0;

function topbar() {
  return `<header class="topbar">
    ${buttonIcon('menu', 'menu', 'Open menu')}
    <div class="topbar-actions">
      <button class="icon-button notification-button" data-action="notifications" aria-label="Notifications">
        ${icon(state.notificationsRead ? 'bell' : 'bell-filled')}
        ${state.notificationsRead ? '' : '<span class="notification-count">1</span>'}
      </button>
      <button class="avatar" data-action="profile" aria-label="My profile">${avatar()}</button>
    </div>
  </header>`;
}

function navbar(active) {
  return `<nav class="navbar" aria-label="Main navigation">${[
    ['home', 'home', 'Home'], ['rooms', 'rooms', 'Rooms'],
    ['security', 'shield', 'Security'], ['settings', 'settings', 'Settings']
  ].map(([screen, glyph, title]) => `<button data-action="navigate" data-screen="${screen}" ${screen === active ? 'aria-current="page"' : ''}>
    ${icon(glyph + (screen === active ? '-filled' : ''))}<span>${title}</span>
  </button>`).join('')}</nav>`;
}

function shortcuts(home = false) {
  const active = home ? state.homeRoom : state.currentRoom;
  const homeShortcut = `<button class="shortcut ${active === 'all' ? 'is-active' : ''}" data-action="${home ? 'home-room' : 'choose-room'}" data-room="all">${icon('desk')}<span>My home</span></button>`;
  const addShortcut = `<button class="shortcut shortcut--add" data-action="add-room">${icon('plus')}<span>Add room</span></button>`;
  const roomShortcut = (room) => `<button class="shortcut ${room.name.length > 12 ? 'has-long-name' : ''} ${active === room.id ? 'is-active' : ''}" data-action="${home ? 'home-room' : 'choose-room'}" data-room="${room.id}">${icon(room.icon)}<span>${escapeHTML(room.name)}</span></button>`;
  return `<div class="rooms-shortcuts">${home ? homeShortcut + addShortcut : addShortcut}${state.rooms.slice(0, home ? 2 : 3).map(roomShortcut).join('')}</div>`;
}

function deviceDescription(device) {
  if (device.type === 'climate') return `Air +${state.temperature}°C`;
  if (device.type === 'camera') return '8 devices';
  if (device.type === 'bulb') return '3 devices';
  return 'Ready to connect';
}

function deviceCard(device) {
  return `<div class="device-card ${device.on ? 'is-on' : ''} ${device.name.length > 16 ? 'has-long-name' : ''}" data-device-card="${device.id}">
    <div class="device-icon">${icon(device.type)}</div>
    <button class="switch" role="switch" aria-checked="${device.on}" data-action="toggle-device" data-id="${device.id}" aria-label="${escapeHTML(device.name)} power"></button>
    <button class="device-name" data-action="device-detail" data-id="${device.id}">${escapeHTML(device.name)}</button>
    <span class="device-description">${deviceDescription(device)}</span>
  </div>`;
}

function deviceGrid(room = 'all', add = true) {
  const devices = state.devices.filter((device) => room === 'all' || device.room === room);
  if (!devices.length) return `<div class="device-grid"><div class="empty-devices">${icon('hub')}<p>No devices yet</p><button class="primary-button" data-action="add">Add device</button></div></div>`;
  const offset = room === 'all' ? state.devicePage * 4 : 0;
  return `<div class="device-grid">${devices.slice(offset, offset + 4).map(deviceCard).join('')}${add && devices.length < 4 ? `<button class="device-card add-device-card" data-action="add">${icon('plus')}<span>Add device</span></button>` : ''}</div>`;
}

function roomCards() {
  return state.rooms.slice(state.securityPage * 6, state.securityPage * 6 + 6).map((room) => `<button class="room-card ${room.locked ? 'is-locked' : ''}" data-action="toggle-lock" data-room="${room.id}" aria-label="${room.locked ? 'Unlock' : 'Lock'} ${escapeHTML(room.name)}" aria-pressed="${room.locked}">
    <span class="device-icon">${icon(room.icon)}</span>
    <span class="room-name">${escapeHTML(room.name)}</span>
    <span class="lock-state">${icon(room.locked ? 'lock-filled' : 'unlock')}<span>${room.locked ? 'Locked' : 'Unlock'}</span></span>
  </button>`).join('');
}

function homeScreen() {
  return `${topbar()}<div class="page-heading"><h1>Welcome home</h1></div>
    <p class="home-shortcuts-label">Shortcuts</p>${shortcuts(true)}
    <section class="home-devices"><div class="section-heading">${state.homeRoom === 'all' && state.devices.length > 4 ? `<button class="text-button" data-action="device-page">Devices · ${state.devicePage + 1}/${Math.ceil(state.devices.length / 4)}</button>` : '<span>Devices</span>'}<button class="add-inline" data-action="add">${icon('plus')}Add device</button></div>${deviceGrid(state.homeRoom)}</section>${navbar('home')}`;
}

function roomsScreen() {
  const room = roomById(state.currentRoom) || state.rooms[0];
  return `${topbar()}<div class="page-heading"><h1>Rooms</h1><p>Your home, room by room</p></div>${shortcuts()}
    <section class="rooms-section"><div class="section-heading"><h2>${escapeHTML(room.name)}</h2><button class="more-button" data-action="room-menu" aria-label="Room options">···</button></div>${deviceGrid(room.id)}</section>${navbar('rooms')}`;
}

function securityScreen() {
  const allLocked = state.rooms.every((room) => room.locked);
  return `${topbar()}<div class="page-heading"><h1>Security</h1><p>${state.rooms.length > 6 ? `<button class="text-button" data-action="security-page">Rooms ${state.securityPage * 6 + 1}–${Math.min(state.securityPage * 6 + 6, state.rooms.length)} of ${state.rooms.length} · Next</button>` : 'Select the rooms to be secured'}</p></div>
    <div class="security-grid">${roomCards()}</div>
    <button class="lock-all" data-action="lock-all">${icon(allLocked ? 'unlock' : 'lock-filled')}<span>${allLocked ? 'Unlock all' : 'Lock all'}</span></button>${navbar('security')}`;
}

function loginScreen() {
  return `${buttonIcon('back', 'back', 'Back').replace('icon-button', 'icon-button back-button')}<header class="login-heading"><h1>Welcome</h1><p>to smart home system</p></header>
    <form class="login-form" data-form="login" novalidate>
      <div class="field"><input name="phone" type="tel" inputmode="tel" aria-label="Phone number" value="38093 94 12 641" autocomplete="tel" maxlength="24"></div>
      <div class="field password-field"><input name="password" type="password" aria-label="Password" value="clap24" autocomplete="current-password" maxlength="80"><button class="eye-button" type="button" data-action="password" aria-label="Show password" aria-pressed="false">${icon('eye')}</button></div>
      <button class="forgot-password text-button" data-action="forgot" type="button">Forgot password ?</button>
      <button class="primary-button" type="submit">Log in</button>
      <p class="register-line">Don’t have account? <button class="text-button" data-action="register" type="button">Register now</button></p>
      <p class="form-error" aria-live="polite" hidden></p>
    </form>
    <div class="social-signin"><div class="separator">Or sign in with</div><div class="social-buttons">
      <button class="social-button social-button--dark" data-action="social" data-provider="Facebook">${icon('facebook')}Facebook</button>
      <button class="social-button" data-action="social" data-provider="Google">${icon('google', 'google-mark')}Google</button>
    </div></div>`;
}

function addScreen() {
  const fields = [
    ['name', 'Device name', state.draft.name],
    ['type', 'Device type', typeById(state.draft.type)?.name],
    ['room', 'Device location', roomById(state.draft.room)?.name],
    ['number', 'Device number', state.draft.number]
  ];
  return `${buttonIcon('back', 'back', 'Back').replace('icon-button', 'icon-button back-button')}<h2 class="screen-title">Add device</h2>
    <div class="add-fields">${fields.map(([key, label, value]) => `<button class="add-field" data-action="edit-field" data-field="${key}"><span class="field-icon">${icon('plus')}</span><span class="add-field-copy"><small>${label}</small><span>${escapeHTML(value || 'Empty')}</span></span>${icon('plus', 'field-plus')}</button>`).join('')}
      <button class="scan-link text-button" data-action="scanner">Or scan QR code</button>
    </div>
    <div class="add-submit"><button class="primary-button" data-action="save-device" ${Object.values(state.draft).every(Boolean) ? '' : 'disabled'}>Add device</button></div>`;
}

function qrCode() {
  const size = 21;
  const modules = Array.from({ length: size }, () => Array(size).fill(null));
  const bytes = [...new TextEncoder().encode('CLAP:380939412649')];
  const dataBits = [];
  const pushBits = (value, count) => { for (let bit = count - 1; bit >= 0; bit--) dataBits.push((value >>> bit) & 1); };
  pushBits(4, 4);
  pushBits(bytes.length, 8);
  bytes.forEach((byte) => pushBits(byte, 8));
  pushBits(0, Math.min(4, 152 - dataBits.length));
  while (dataBits.length % 8) dataBits.push(0);
  let pad = false;
  while (dataBits.length < 152) { pushBits(pad ? 0x11 : 0xec, 8); pad = !pad; }
  const data = Array.from({ length: 19 }, (_, index) => dataBits.slice(index * 8, index * 8 + 8).reduce((value, bit) => (value << 1) | bit, 0));
  const multiply = (a, b) => {
    let result = 0;
    while (b) { if (b & 1) result ^= a; b >>>= 1; a <<= 1; if (a & 0x100) a ^= 0x11d; }
    return result;
  };
  let generator = [1];
  let root = 1;
  for (let degree = 0; degree < 7; degree++) {
    const next = Array(generator.length + 1).fill(0);
    generator.forEach((value, index) => { next[index] ^= value; next[index + 1] ^= multiply(value, root); });
    generator = next;
    root = multiply(root, 2);
  }
  const encoded = [...data, ...Array(7).fill(0)];
  for (let index = 0; index < data.length; index++) {
    const factor = encoded[index];
    generator.forEach((value, offset) => { encoded[index + offset] ^= multiply(value, factor); });
  }
  const codewords = [...data, ...encoded.slice(19)];
  const finder = (top, left) => {
    for (let row = -1; row <= 7; row++) for (let col = -1; col <= 7; col++) {
      const r = top + row, c = left + col;
      if (r < 0 || c < 0 || r >= size || c >= size) continue;
      modules[r][c] = (row >= 0 && row <= 6 && (col === 0 || col === 6)) || (col >= 0 && col <= 6 && (row === 0 || row === 6)) || (row >= 2 && row <= 4 && col >= 2 && col <= 4);
    }
  };
  finder(0, 0); finder(0, 14); finder(14, 0);
  for (let index = 8; index < 13; index++) { modules[6][index] = index % 2 === 0; modules[index][6] = index % 2 === 0; }
  const format = 0x77c4;
  for (let index = 0; index < 15; index++) {
    const value = ((format >>> index) & 1) === 1;
    modules[index < 6 ? index : index < 8 ? index + 1 : size - 15 + index][8] = value;
    modules[8][index < 8 ? size - index - 1 : index < 9 ? 15 - index : 15 - index - 1] = value;
  }
  modules[13][8] = true;
  let row = 20, direction = -1, bitIndex = 0;
  for (let col = 20; col > 0; col -= 2) {
    if (col === 6) col--;
    while (true) {
      for (let offset = 0; offset < 2; offset++) {
        const c = col - offset;
        if (modules[row][c] !== null) continue;
        const bit = bitIndex < 208 ? (codewords[Math.floor(bitIndex / 8)] >>> (7 - bitIndex % 8)) & 1 : 0;
        modules[row][c] = Boolean(bit ^ ((row + c) % 2 === 0 ? 1 : 0));
        bitIndex++;
      }
      row += direction;
      if (row < 0 || row >= size) { row -= direction; direction = -direction; break; }
    }
  }
  const path = modules.flatMap((line, r) => line.flatMap((dark, c) => dark ? [`M${c} ${r}h1v1h-1z`] : [])).join('');
  return `<svg viewBox="0 0 21 21" shape-rendering="crispEdges" aria-hidden="true"><path fill="currentColor" d="${path}"/></svg>`;
}
const qrMarkup = qrCode();

function scannerScreen() {
  return `${buttonIcon('back', 'back', 'Back').replace('icon-button', 'icon-button back-button')}<h2 class="screen-title">Add device</h2>
    <div class="scan-heading"><div class="scan-symbol">${icon('scan')}</div><p>Scan QR code</p></div>
    <button class="scanner-frame" data-action="scan" aria-label="Scan device QR code">
      <span class="corner corner--tl"></span><span class="corner corner--tr"></span><span class="corner corner--bl"></span><span class="corner corner--br"></span>
      <span class="qr-art">${qrMarkup}</span><span class="qr-wash"></span><span class="scan-line"></span>
    </button>
    <div class="scanner-actions"><p>Place the device code inside the frame</p><button class="primary-button" data-action="scan">Scan QR code</button><button class="text-button" data-action="manual-number">Enter device number</button></div>`;
}

function menuScreen() {
  return `${buttonIcon('x', 'back', 'Close menu').replace('icon-button', 'icon-button back-button')}
    <div class="menu-profile"><button class="avatar" data-action="profile" aria-label="My profile">${avatar()}</button><p>${escapeHTML(state.profile.name.split(' ').reverse().join(' '))}</p><button class="address-button" data-action="address">${escapeHTML(state.address)}${icon('chevron')}</button></div>
    <nav class="menu-list" aria-label="Home services">${[
      ['camera', 'CCTV', 'cctv'], ['bolt', 'Utilities', 'utilities'],
      ['intercom', 'Intercom', 'intercom'], ['climate', 'Devices', 'home'],
      ['service', 'Additional services', 'services']
    ].map(([glyph, label, action]) => `<button class="menu-item" data-action="${action}"><span class="icon-wrap">${icon(glyph)}</span><span>${label}</span></button>`).join('')}</nav>`;
}

function settingsScreen() {
  return `${topbar()}<div class="page-heading"><h1>Settings</h1><p>A home that works your way</p></div>
    <div class="settings-list">${[
      ['home', 'My home', 'address'], ['bell', 'Notifications', 'notification-settings'],
      ['hub', 'Hub connection', 'hub'], ['service', 'Clap instruction', 'instruction'],
      ['shield-filled', 'Access rights', 'access'], ['lock', 'Account · Log in', 'login']
    ].map(([glyph, text, action]) => `<button class="settings-row" data-action="${action}">${icon(glyph)}<span>${text}</span>${icon('chevron')}</button>`).join('')}</div>${navbar('settings')}`;
}

function profileScreen() {
  return `${buttonIcon('x', 'back', 'Close profile').replace('icon-button', 'icon-button back-button')}<h2 class="screen-title">My profile</h2>
    <div class="profile-avatar"><div class="avatar">${avatar()}</div><button class="avatar-plus" data-action="avatar" aria-label="Change profile photo">${icon('plus')}</button></div>
    <p class="profile-name">${escapeHTML(state.profile.name)}</p>
    <form class="profile-form" data-form="profile" novalidate><label class="form-label">Full name</label><input name="name" aria-label="Full name" value="${escapeHTML(state.profile.name)}" maxlength="40" autocomplete="name"><label class="form-label">Phone number</label><input name="phone" type="tel" aria-label="Phone number" value="${escapeHTML(state.profile.phone)}" maxlength="24" autocomplete="tel"><p class="form-error" hidden aria-live="polite"></p><button class="primary-button" type="submit">Save changes</button></form>`;
}

function detailScreen() {
  const device = state.devices.find((entry) => entry.id === state.detailId);
  if (!device) return homeScreen();
  return `${buttonIcon('back', 'back', 'Back').replace('icon-button', 'icon-button back-button')}<h2 class="screen-title">Device</h2>
    <div class="detail-symbol">${icon(device.type)}</div><div class="detail-body"><h1>${escapeHTML(device.name)}</h1><p>${escapeHTML(roomById(device.room)?.name || 'My home')}</p>
    <div class="detail-rows"><div class="detail-row"><span>Device number</span><strong>${escapeHTML(device.number)}</strong></div><div class="detail-row"><span>Power</span><strong>${device.on ? 'On' : 'Off'}</strong></div>${device.type === 'climate' ? `<div class="detail-row"><span>Temperature</span><button data-action="temperature" data-step="-1" aria-label="Lower temperature">${icon('back')}</button><strong>+${state.temperature}°C</strong><button data-action="temperature" data-step="1" aria-label="Raise temperature">${icon('chevron')}</button></div>` : ''}</div>
    <button class="primary-button" data-action="toggle-detail" data-id="${device.id}">${device.on ? 'Turn off' : 'Turn on'}</button><button class="text-button" data-action="remove-device" data-id="${device.id}">Remove device</button></div>`;
}

function notificationsScreen() {
  return `${topbar()}<div class="page-heading"><h1>Notifications</h1><p>Everything happening at home</p></div><div class="notification-list">${state.notificationsRead ? '<p class="notification-empty">You’re all caught up</p>' : `<div class="notification-card">${icon('shield')}<div><h2>Your home is ready</h2><p>Security is available for all six rooms.<br>Today, 09:41</p></div></div><button class="primary-button" data-action="read-notifications">Mark as read</button>`}</div>${navbar('home')}`;
}

function authScreen(mode) {
  const register = mode === 'register';
  return `${buttonIcon('back', 'back', 'Back to login').replace('icon-button', 'icon-button back-button')}<div class="page-heading"><h1>${register ? 'Join Clap' : 'Reset password'}</h1><p>${register ? 'Make yourself at home' : 'Let’s get you back home'}</p></div>
    <form class="auth-panel-form" data-form="${mode}" novalidate>${register ? '<label class="form-label">Full name</label><input name="name" aria-label="Full name" placeholder="Your name" maxlength="40" autocomplete="name">' : ''}<label class="form-label">Phone number</label><input name="phone" type="tel" inputmode="tel" aria-label="Phone number" placeholder="Phone number" maxlength="24" autocomplete="tel">${register ? '<label class="form-label">Password</label><input name="password" type="password" aria-label="Password" placeholder="At least 6 characters" minlength="6" maxlength="80" autocomplete="new-password">' : ''}<p class="form-error" hidden aria-live="polite"></p><button class="primary-button" type="submit">${register ? 'Create account' : 'Send reset link'}</button></form>`;
}

function renderScreen(name) {
  const renderers = { home: homeScreen, rooms: roomsScreen, security: securityScreen, login: loginScreen, add: addScreen, scanner: scannerScreen, menu: menuScreen, settings: settingsScreen, profile: profileScreen, detail: detailScreen, notifications: notificationsScreen, register: () => authScreen('register'), forgot: () => authScreen('forgot') };
  return `<div class="screen screen-${name}" data-view="${name}">${(renderers[name] || homeScreen)()}<div class="phone-toast" role="status" aria-live="polite"></div></div>`;
}

function refreshFocus() {
  if (state.activeScreen) appShell.innerHTML = renderScreen(state.activeScreen);
}

function openScreen(name, animate = true, remember = true) {
  const previous = state.activeScreen;
  if (previous && previous !== name && remember) state.navigation.push(previous);
  requestId++;
  state.activeScreen = name;
  appShell.innerHTML = renderScreen(name);
  appShell.setAttribute('aria-label', ({ home: 'Welcome home', rooms: 'Rooms', security: 'Security', login: 'Log in', add: 'Add device', scanner: 'Scan QR code', menu: 'Home menu', settings: 'Settings', profile: 'My profile', detail: 'Device details', notifications: 'Notifications', register: 'Create account', forgot: 'Reset password' })[name] || 'Clap');
  if (previous && previous !== name && animate && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) appShell.querySelector('.screen').classList.add('is-entering');
  if (previous) appShell.querySelector('button:not(:disabled), input')?.focus({ preventScroll: true });
}

function goBack() {
  openScreen(state.navigation.pop() || 'home', true, false);
}

function toast(message) {
  clearTimeout(toastTimer);
  const target = appShell.querySelector('.phone-toast');
  target.textContent = message;
  target.classList.add('is-visible');
  toastTimer = setTimeout(() => target.classList.remove('is-visible'), 3500);
}

function sheet(title, contents) {
  appShell.querySelector('.sheet-layer')?.remove();
  const container = document.createElement('div');
  container.className = 'sheet-layer';
  container.innerHTML = `<button class="scrim" data-action="close-sheet" aria-label="Close panel"></button><section class="control-panel" role="dialog" aria-modal="true" aria-label="${escapeHTML(title)}"><h2>${escapeHTML(title)}</h2><button class="panel-close" data-action="close-sheet" aria-label="Close panel">${icon('x')}</button>${contents}</section>`;
  const screen = appShell.querySelector('.screen');
  [...screen.children].forEach((child) => { child.inert = true; });
  screen.append(container);
  (container.querySelector('input, .picker-option:not(:disabled)') || container.querySelector('.primary-button') || container.querySelector('.panel-close'))?.focus({ preventScroll: true });
}

function closeSheet() {
  const panel = appShell.querySelector('.sheet-layer');
  if (!panel) return;
  const title = panel.querySelector('h2')?.textContent;
  panel.remove();
  [...appShell.querySelector('.screen').children].forEach((child) => { child.inert = false; });
  const field = ({ 'Device name': 'name', 'Device type': 'type', 'Device location': 'room', 'Device number': 'number' })[title];
  (field ? appShell.querySelector(`[data-field="${field}"]`) : appShell.querySelector('button'))?.focus({ preventScroll: true });
}

function editField(field) {
  if (state.activeScreen !== 'add') openScreen('add');
  const labels = { name: 'Device name', type: 'Device type', room: 'Device location', number: 'Device number' };
  if (field === 'type' || field === 'room') {
    const options = field === 'type' ? deviceTypes : state.rooms;
    sheet(labels[field], `<div class="picker-options" role="listbox" aria-label="${labels[field]}">${options.map((option) => `<button class="picker-option" role="option" aria-selected="${state.draft[field] === option.id}" data-action="pick-field" data-field="${field}" data-value="${option.id}"><span>${escapeHTML(option.name)}</span>${state.draft[field] === option.id ? icon('check') : ''}</button>`).join('')}${field === 'type' ? '<button class="picker-option" role="option" aria-selected="false" disabled>Hub · connection required</button>' : ''}</div>`);
  } else {
    sheet(labels[field], `<form data-form="device-field" data-field="${field}" novalidate><input name="value" aria-label="${labels[field]}" value="${escapeHTML(state.draft[field])}" placeholder="${field === 'number' ? '12-digit device number' : 'Name your device'}" maxlength="${field === 'number' ? 12 : 24}" ${field === 'number' ? 'inputmode="numeric"' : ''}><p class="form-error" hidden aria-live="polite"></p><button class="primary-button" type="submit">Save</button></form>`);
  }
}

function chooseRoom(home = false) {
  sheet('Choose a room', `<div class="picker-options" role="listbox" aria-label="Rooms">${home ? '<button class="picker-option" role="option" aria-selected="false" data-action="home-room" data-room="all">My home</button>' : ''}${state.rooms.map((room) => `<button class="picker-option" role="option" aria-selected="${(home ? state.homeRoom : state.currentRoom) === room.id}" data-action="${home ? 'home-room' : 'choose-room'}" data-room="${room.id}">${escapeHTML(room.name)}${icon(room.icon)}</button>`).join('')}</div>`);
}

function toggleDevice(id) {
  const device = state.devices.find((entry) => entry.id === id);
  if (!device) return;
  device.on = !device.on;
  document.querySelectorAll(`[data-device-card="${id}"]`).forEach((card) => {
    card.classList.toggle('is-on', device.on);
    card.querySelector('.switch').setAttribute('aria-checked', String(device.on));
  });
}

function toggleLock(id) {
  const room = roomById(id);
  if (!room) return;
  room.locked = !room.locked;
  updateLocks();
}

function updateLocks() {
  document.querySelectorAll('[data-action="toggle-lock"]').forEach((card) => {
    const room = roomById(card.dataset.room);
    card.classList.toggle('is-locked', room.locked);
    card.setAttribute('aria-pressed', String(room.locked));
    card.setAttribute('aria-label', `${room.locked ? 'Unlock' : 'Lock'} ${room.name}`);
    card.querySelector('.lock-state').innerHTML = `${icon(room.locked ? 'lock-filled' : 'unlock')}<span>${room.locked ? 'Locked' : 'Unlock'}</span>`;
  });
  const allLocked = state.rooms.every((room) => room.locked);
  document.querySelectorAll('[data-action="lock-all"]').forEach((button) => { button.innerHTML = `${icon(allLocked ? 'unlock' : 'lock-filled')}<span>${allLocked ? 'Unlock all' : 'Lock all'}</span>`; });
}

function error(form, message, field = null) {
  const target = form.querySelector('.form-error');
  target.textContent = message;
  target.hidden = false;
  form.querySelectorAll('[aria-invalid]').forEach((input) => input.removeAttribute('aria-invalid'));
  if (field) { form.elements[field].setAttribute('aria-invalid', 'true'); form.elements[field].focus(); }
}

function pending(form, done) {
  const submit = form.querySelector('button[type="submit"]');
  const original = submit.innerHTML;
  const token = requestId;
  submit.disabled = true;
  submit.setAttribute('aria-busy', 'true');
  submit.innerHTML = '<span class="spinner" aria-hidden="true"></span><span>Connecting…</span>';
  setTimeout(() => {
    if (!form.isConnected) return;
    submit.disabled = false;
    submit.removeAttribute('aria-busy');
    submit.innerHTML = original;
    if (token === requestId) done();
  }, 700);
}

function handleAction(button) {
  const action = button.dataset.action;
  const origin = button.closest('.phone-shell');
  if (action === 'back') return goBack();
  if (action === 'close-sheet') return closeSheet();
  if (action === 'toggle-device') return toggleDevice(button.dataset.id);
  if (action === 'toggle-lock') return toggleLock(button.dataset.room);
  if (action === 'lock-all') {
    const lock = !state.rooms.every((room) => room.locked);
    state.rooms.forEach((room) => { room.locked = lock; });
    updateLocks();
    return;
  }
  if (action === 'password') {
    const input = button.parentElement.querySelector('input');
    const show = input.type === 'password';
    input.type = show ? 'text' : 'password';
    button.setAttribute('aria-pressed', String(show));
    button.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
    button.innerHTML = icon(show ? 'eye-off' : 'eye');
    return;
  }
  if (action === 'social') return toast(`${button.dataset.provider} sign-in requires an account connection.`, origin);
  if (action === 'navigate') {
    state.navigation = [];
    return openScreen(button.dataset.screen, true, false);
  }
  if (['home', 'rooms', 'security', 'settings', 'profile', 'menu', 'notifications', 'register', 'forgot', 'login', 'scanner'].includes(action)) return openScreen(action);
  if (action === 'device-page') {
    state.devicePage = (state.devicePage + 1) % Math.ceil(state.devices.length / 4);
    return refreshFocus();
  }
  if (action === 'security-page') {
    state.securityPage = (state.securityPage + 1) % Math.ceil(state.rooms.length / 6);
    return refreshFocus();
  }
  if (action === 'add') {
    if (!state.draft.room) state.draft.room = state.currentRoom;
    return openScreen('add');
  }
  if (action === 'edit-field') return editField(button.dataset.field);
  if (action === 'pick-field') {
    state.draft[button.dataset.field] = button.dataset.value;
        refreshFocus();
    appShell.querySelector(`[data-field="${button.dataset.field}"]`)?.focus();
    return;
  }
  if (action === 'choose-room' || action === 'home-room') {
    const home = action === 'home-room';
    if (button.dataset.room === 'all' && !home) {
            chooseRoom();
      return;
    }
    if (home) { state.homeRoom = button.dataset.room; state.devicePage = 0; }
    else state.currentRoom = button.dataset.room;
        openScreen(home ? 'home' : 'rooms');
    return;
  }
  if (action === 'add-room') {
    sheet('Add room', `<form data-form="room" novalidate><input name="name" aria-label="Room name" placeholder="Room name" maxlength="24"><p class="form-error" hidden aria-live="polite"></p><button class="primary-button" type="submit" ${state.rooms.length >= 12 ? 'disabled' : ''}>Add room</button></form>`);
    return;
  }
  if (action === 'room-menu') {
        sheet('Room options', '<div class="picker-options"><button class="picker-option" data-action="all-rooms">Choose a room</button><button class="picker-option" data-action="add">Add device</button><button class="picker-option" data-action="rename-room">Rename room</button></div>');
    return;
  }
  if (action === 'all-rooms') return chooseRoom();
  if (action === 'rename-room') {
    sheet('Rename room', `<form data-form="rename-room" novalidate><input name="name" aria-label="Room name" value="${escapeHTML(roomById(state.currentRoom).name)}" maxlength="24"><p class="form-error" hidden aria-live="polite"></p><button class="primary-button" type="submit">Save</button></form>`);
    return;
  }
  if (action === 'save-device') {
    if (!Object.values(state.draft).every(Boolean)) return;
    if (state.devices.some((device) => device.number === state.draft.number)) return toast('This device is already in your home.', origin);
    if (state.devices.filter((device) => device.room === state.draft.room).length >= 4) return toast('This room already has four devices. Choose another room.', origin);
    const name = state.draft.name;
    state.devices.push({ id: `device-${Date.now()}`, ...state.draft, on: false });
    state.currentRoom = state.draft.room;
    state.draft = { name: '', type: '', room: '', number: '' };
        openScreen('rooms');
    return toast(`${name} added to your room.`, appShell);
  }
  if (action === 'scan') {
    if (state.activeScreen !== 'scanner') openScreen('scanner');
    sheet('Connect a camera', '<p>A connected camera is required to scan a device. You can enter the number printed on your device instead.</p><button class="primary-button" data-action="manual-number">Enter device number</button>');
    return;
  }
  if (action === 'manual-number') { openScreen('add'); return editField('number'); }
  if (action === 'device-detail') {
    state.detailId = button.dataset.id;
    return openScreen('detail');
  }
  if (action === 'toggle-detail') { toggleDevice(button.dataset.id); refreshFocus(); return; }
  if (action === 'temperature') {
    state.temperature = Math.max(16, Math.min(30, state.temperature + Number(button.dataset.step)));
        refreshFocus();
    return;
  }
  if (action === 'remove-device') {
    sheet('Remove device?', `<p>The device will be removed from your room.</p><button class="primary-button" data-action="confirm-remove-device" data-id="${button.dataset.id}">Remove device</button><button class="picker-option" data-action="close-sheet">Keep device</button>`);
    return;
  }
  if (action === 'confirm-remove-device') {
    state.devices = state.devices.filter((device) => device.id !== button.dataset.id);
    state.devicePage = 0;
        goBack();
    return toast('Device removed from your room.', appShell);
  }
  if (action === 'read-notifications') { state.notificationsRead = true; refreshFocus(); return; }
  if (action === 'notification-settings') {
    sheet('Notifications', `<div class="picker-options"><button class="picker-option" data-action="toggle-notifications" aria-pressed="${state.notificationsEnabled}">Home alerts ${icon(state.notificationsEnabled ? 'check' : 'x')}</button></div>`);
    return;
  }
  if (action === 'toggle-notifications') {
    state.notificationsEnabled = !state.notificationsEnabled;
    button.setAttribute('aria-pressed', String(state.notificationsEnabled));
    button.innerHTML = `Home alerts ${icon(state.notificationsEnabled ? 'check' : 'x')}`;
    return;
  }
  if (action === 'address') {
    sheet('My home', `<form data-form="address" novalidate><label class="form-label">Home address</label><input name="address" aria-label="Home address" value="${escapeHTML(state.address)}" maxlength="48"><p class="form-error" hidden aria-live="polite"></p><button class="primary-button" type="submit">Save</button></form>`);
    return;
  }
  if (action === 'access') return openScreen('security');
  if (action === 'cctv') { state.detailId = 'cctv'; return openScreen(state.devices.some((device) => device.id === 'cctv') ? 'detail' : 'rooms'); }
  if (action === 'utilities') { state.detailId = 'climate'; return openScreen(state.devices.some((device) => device.id === 'climate') ? 'detail' : 'rooms'); }
  if (action === 'intercom' || action === 'hub' || action === 'services' || action === 'instruction' || action === 'avatar') {
    const messages = {
      intercom: ['Intercom', 'Connect an intercom to see visitors and open your door.'],
      hub: ['Add Hub', 'Connect your Clap Hub to the same network as your phone, then enter its device number.'],
      services: ['Additional services', 'Connect your Clap account to see services available at your address.'],
      instruction: ['Clap instruction', 'Add a device by entering its name, type, room and the number printed on it. Control power in Rooms and lock individual rooms in Security.'],
      avatar: ['Profile photo', 'Your profile photo is managed through your connected Clap account.']
    };
    const [title, text] = messages[action];
    sheet(title, `<p>${text}</p><button class="primary-button" data-action="${action === 'hub' || action === 'intercom' ? 'add' : 'close-sheet'}">${action === 'hub' || action === 'intercom' ? 'Add device' : 'Got it'}</button>`);
  }
}

function handleSubmit(form) {
  const data = new FormData(form);
  const kind = form.dataset.form;
  if (kind === 'login' || kind === 'register' || kind === 'forgot') {
    if (kind === 'register' && !String(data.get('name')).trim()) return error(form, 'Enter your full name.', 'name');
    if (!/^\+?[\d\s()-]{8,24}$/.test(String(data.get('phone'))) || String(data.get('phone')).replace(/\D/g, '').length < 8) return error(form, 'Enter a valid phone number.', 'phone');
    if (kind !== 'forgot' && String(data.get('password')).length < 6) return error(form, 'Use at least 6 characters.', 'password');
    form.querySelector('.form-error').hidden = true;
    pending(form, () => error(form, kind === 'login' ? 'Account connection unavailable. Please try again later.' : kind === 'register' ? 'Account service unavailable. Please try again later.' : 'Password reset requires an account connection.'));
    return;
  }
  if (kind === 'device-field') {
    const field = form.dataset.field;
    const value = String(data.get('value')).trim();
    if (!value) return error(form, 'This field is required.', 'value');
    if (field === 'number' && !/^\d{12}$/.test(value)) return error(form, 'Enter the 12-digit device number.', 'value');
    if (field === 'name' && value.length > 24) return error(form, 'Use 24 characters or fewer.', 'value');
    state.draft[field] = value;
        refreshFocus();
    appShell.querySelector(`[data-field="${field}"]`)?.focus();
    return;
  }
  if (kind === 'room' || kind === 'rename-room') {
    const name = String(data.get('name')).trim();
    if (!name) return error(form, 'Give your room a name.', 'name');
    if (name.length > 24) return error(form, 'Use 24 characters or fewer.', 'name');
    if (state.rooms.some((room) => room.name.toLowerCase() === name.toLowerCase() && (kind === 'room' || room.id !== state.currentRoom))) return error(form, 'A room with this name already exists.', 'name');
    if (kind === 'room') {
      if (state.rooms.length >= 12) return error(form, 'Your home can have up to 12 rooms.');
      const id = `room-${Date.now()}`;
      state.rooms.push({ id, name, icon: 'home', locked: false });
      state.currentRoom = id;
    } else roomById(state.currentRoom).name = name;
        openScreen('rooms');
    return toast(kind === 'room' ? `${name} added to your home.` : 'Room name updated.', appShell);
  }
  if (kind === 'profile') {
    const name = String(data.get('name')).trim(), phone = String(data.get('phone')).trim();
    if (!name) return error(form, 'Enter your full name.', 'name');
    if (name.length > 40) return error(form, 'Use 40 characters or fewer.', 'name');
    if (!/^\+?[\d\s()-]{8,24}$/.test(phone)) return error(form, 'Enter a valid phone number.', 'phone');
    state.profile = { name, phone };
        refreshFocus();
    return toast('Profile updated.', appShell);
  }
  if (kind === 'address') {
    const address = String(data.get('address')).trim();
    if (!address) return error(form, 'Enter your home address.', 'address');
    state.address = address;
        refreshFocus();
    return toast('Home address updated.', appShell);
  }
}

function start() {
  if (state.started) return;
  state.started = true;
  openScreen('home', false, false);
  canvas.classList.add('is-starting');
  canvas.addEventListener('animationend', () => canvas.classList.remove('is-starting'), { once: true });
  document.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-action]');
    if (button && !button.disabled) handleAction(button);
    else if (event.target.classList.contains('sheet-layer')) closeSheet();
  });
  document.addEventListener('submit', (event) => {
    if (!event.target.matches('form[data-form]')) return;
    event.preventDefault();
    handleSubmit(event.target);
  });
  document.addEventListener('input', (event) => {
    event.target.removeAttribute('aria-invalid');
    const message = event.target.closest('form')?.querySelector('.form-error');
    if (message) message.hidden = true;
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      if (appShell.querySelector('.sheet-layer')) closeSheet();
      else goBack();
    }
    const option = event.target.closest('.picker-option');
    if (option && ['ArrowDown', 'ArrowUp'].includes(event.key)) {
      event.preventDefault();
      const options = [...option.parentElement.querySelectorAll('.picker-option:not(:disabled)')];
      const offset = event.key === 'ArrowDown' ? 1 : -1;
      options[(options.indexOf(option) + offset + options.length) % options.length]?.focus();
    }
    const panel = appShell.querySelector('.sheet-layer');
    if (event.key === 'Tab' && panel) {
      const controls = [...panel.querySelectorAll('button:not(:disabled), input:not(:disabled)')].filter((element) => element.getClientRects().length && getComputedStyle(element).display !== 'none' && getComputedStyle(element).visibility !== 'hidden');
      const first = controls[0], last = controls[controls.length - 1];
      if (event.shiftKey && (document.activeElement === first || !panel.contains(document.activeElement))) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || !panel.contains(document.activeElement))) { event.preventDefault(); first?.focus(); }
    }
  });
}
start();
