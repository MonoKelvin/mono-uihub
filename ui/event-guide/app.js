const events = [
  { id: 'killers', name: 'The Killers', ticketName: 'The killers', city: 'Madrid', country: 'Spain', festival: 'Mad Cool Festival', venue: 'Espacio Mad Cool', date: '15.09 2022', time: '8 Pm', row: '8', seat: '16', code: 'EG-220915-0816' },
  { id: 'muse', name: 'Muse', ticketName: 'Muse', city: 'Monterrey', country: 'Mexico', festival: 'Live in Monterrey', venue: 'Arena Monterrey', date: '18.09 2022', time: '9 Pm', row: '4', seat: '12', code: 'EG-220918-0412' },
  { id: 'elephants', name: 'Cage The Elephants', ticketName: 'Cage The Elephants', city: 'Malahide', country: 'Ireland', festival: 'Summer at the Castle', venue: 'Malahide Castle', date: '21.09 2022', time: '7 Pm' },
  { id: 'foals', name: 'The Foals', ticketName: 'The Foals', city: 'London', country: 'United Kingdom', festival: 'Life Is Yours Tour', venue: 'O2 Academy Brixton', date: '24.09 2022', time: '8 Pm', row: '6', seat: '9', code: 'EG-220924-0609' },
];
const ticketIds = ['muse', 'killers', 'foals'];
const savedEvents = new Set();
const phones = [];
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const getEvent = (id) => events.find((event) => event.id === id);
const welcomeMarkup = document.querySelector('[data-phone="cover"] .phone-content').innerHTML;
const icons = { home: 'home', locations: 'map', tickets: 'ticket', profile: 'profile' };
const labels = { home: 'Home', locations: 'Places', tickets: 'My tickets', profile: 'Profile' };

function navigation(view) {
  return Object.entries(icons).map(([key, icon]) => `<button class="nav-item" data-action="navigate" data-view="${key}" aria-label="${labels[key]}" ${view === key ? 'aria-current="page"' : ''}><svg aria-hidden="true"><use href="#nav-${icon}"/></svg></button>`).join('');
}

function eventRow(event, action = 'detail') {
  return `<button class="event-row" data-action="${action}" data-event="${event.id}" aria-label="${event.name}, ${event.city}"><span><strong>${event.name}</strong><small>${event.city}, ${event.country}</small></span><i class="ti ti-arrow-up-right" aria-hidden="true"></i></button>`;
}

function posterArt() {
  return `<svg class="poster-art" viewBox="0 0 272 228" fill="none" aria-hidden="true"><defs><linearGradient id="pill-light" x1="158" y1="80" x2="55" y2="205" gradientUnits="userSpaceOnUse"><stop stop-color="var(--poster-light)"/><stop offset="1" stop-color="var(--poster-light)" stop-opacity="0"/></linearGradient><filter id="pill-shadow" x="-40%" y="-50%" width="200%" height="220%"><feDropShadow dx="3" dy="8" stdDeviation="8" flood-color="var(--poster-shadow)" flood-opacity=".3"/></filter></defs><g fill="url(#pill-light)"><rect x="34" y="170" width="210" height="57" rx="28.5" transform="rotate(-30 34 170)"/><rect x="15" y="150" width="190" height="57" rx="28.5" transform="rotate(-30 15 150)" filter="url(#pill-shadow)"/><rect x="1" y="136" width="158" height="57" rx="28.5" transform="rotate(-30 1 136)" filter="url(#pill-shadow)"/></g></svg>`;
}

function barcode() {
  const widths = [1, 1, 2, 1, 3, 1, 1, 2, 1, 2, 1, 1, 2, 3, 1, 1];
  let x = 0;
  const bars = widths.map((width, index) => {
    const rect = `<rect x="${x}" width="${width}" height="28"/>`;
    x += width + (index % 3 === 0 ? 1.5 : .8);
    return rect;
  }).join('');
  return `<svg class="barcode" viewBox="0 0 62 28" preserveAspectRatio="none" aria-hidden="true" fill="currentColor">${bars}<rect x="36" width="26" height="28"/></svg>`;
}

function showToast(phone, message, status = 'success') {
  clearTimeout(phone.toastTimer);
  phone.toast.textContent = message;
  phone.toast.dataset.status = status;
  phone.toast.classList.add('is-visible');
  phone.toastTimer = setTimeout(() => phone.toast.classList.remove('is-visible'), 2800);
}

function renderHome(phone) {
  const results = phone.content.querySelector('.event-results');
  const query = phone.query.trim().toLowerCase();
  const matches = events.filter((event) => `${event.name} ${event.city} ${event.country}`.toLowerCase().includes(query));
  if (!matches.length) {
    results.innerHTML = '<div class="empty-state"><h3>No events found</h3><p>Try an artist, a city, or a different name.</p><button class="text-button" data-action="clear-search">Clear search</button></div>';
    return;
  }
  const [featured, ...remaining] = matches;
  results.innerHTML = `<button class="featured-event" data-action="detail" data-event="${featured.id}" aria-label="View ${featured.name} in ${featured.city}"><span class="featured-title">${featured.name}</span>${posterArt()}<span class="featured-location">${featured.city}, ${featured.country}</span></button><div class="event-list">${remaining.map((event) => eventRow(event)).join('')}</div>`;
}

function renderTicket(phone, animate = false) {
  const event = getEvent(ticketIds[phone.ticketIndex]);
  phone.content.querySelector('.ticket-carousel').innerHTML = `<article class="ticket-card${animate ? ' is-entering' : ''}" aria-label="${event.name} ticket"><h3>${event.ticketName}</h3><p class="ticket-festival">${event.festival}</p><div class="ticket-rule"></div><div class="ticket-location"><strong>${event.city}, ${event.country}</strong><small>Place</small></div><div class="ticket-fields"><div class="ticket-field"><strong>${event.row}</strong><small>Row</small></div><div class="ticket-field"><strong>${event.seat}</strong><small>Seat</small></div><div class="ticket-field"><strong>${event.date}</strong><small>Date</small></div><div class="ticket-field"><strong>${event.time}</strong><small>Time</small></div></div><button class="barcode-button" data-action="barcode" data-event="${event.id}" aria-label="Open ${event.name} ticket barcode"><span>Scan<br>Barcode</span>${barcode()}</button></article>`;
  phone.content.querySelector('.ticket-pagination').innerHTML = ticketIds.map((id, index) => `<button class="pagination-dot" data-action="ticket" data-index="${index}" aria-label="${getEvent(id).name} ticket" aria-pressed="${index === phone.ticketIndex}"></button>`).join('');
}

function renderLocations(phone, city = 'Madrid') {
  const matches = events.filter((event) => event.city === city);
  phone.content.querySelector('[data-location-title]').textContent = `${city}, ${matches[0].country}`;
  phone.content.querySelector('.location-events').innerHTML = matches.map((event) => eventRow(event)).join('');
  phone.content.querySelectorAll('.map-pin').forEach((pin) => {
    pin.classList.toggle('is-selected', pin.dataset.city === city);
    pin.setAttribute('aria-pressed', String(pin.dataset.city === city));
  });
}

function renderProfile(phone, tab = phone.profileTab) {
  phone.profileTab = tab;
  phone.content.querySelectorAll('.profile-tab').forEach((button) => {
    button.classList.toggle('is-selected', button.dataset.tab === tab);
    button.setAttribute('aria-pressed', String(button.dataset.tab === tab));
  });
  const selected = tab === 'tickets' ? ticketIds.map(getEvent) : events.filter((event) => savedEvents.has(event.id));
  phone.content.querySelector('.profile-events').innerHTML = selected.length ? selected.map((event) => eventRow(event, tab === 'tickets' ? 'view-ticket' : 'detail')).join('') : '<div class="empty-state"><h3>A night to look forward to.</h3><p>Save the artists you love. Find them here.</p><button class="text-button" data-action="navigate" data-view="home">Find an event</button></div>';
}

function navigate(phone, view, focus = true) {
  closeLayer(phone, false);
  phone.view = view;
  phone.content.dataset.view = view;
  phone.content.inert = false;
  if (view === 'welcome') {
    phone.content.innerHTML = welcomeMarkup;
  } else {
    const template = document.querySelector(`#${view}-template`);
    phone.content.replaceChildren(template.content.cloneNode(true));
    phone.content.querySelector('.bottom-nav').innerHTML = navigation(view);
    if (view === 'home') {
      phone.content.querySelector('input').value = phone.query;
      renderHome(phone);
    }
    if (view === 'tickets') renderTicket(phone);
    if (view === 'locations') renderLocations(phone);
    if (view === 'profile') renderProfile(phone);
  }
  if (focus) {
    const target = phone.content.querySelector('h2, h1');
    target.tabIndex = -1;
    target.focus({ preventScroll: true });
  }
}

function closeLayer(phone, restore = true) {
  if (!phone.layerOpen) return;
  phone.layerOpen = false;
  phone.layer.classList.remove('is-open');
  phone.layer.inert = true;
  phone.content.inert = false;
  phone.content.querySelector('.menu-trigger')?.setAttribute('aria-expanded', 'false');
  if (restore && phone.previousFocus?.isConnected) phone.previousFocus.focus({ preventScroll: true });
}

function openLayer(phone, markup) {
  phone.previousFocus = document.activeElement;
  phone.layer.innerHTML = `<div class="scrim" data-action="close-layer"></div>${markup}`;
  phone.layerOpen = true;
  phone.layer.inert = false;
  phone.layer.classList.add('is-open');
  phone.content.inert = true;
  phone.layer.querySelector('button:not(:disabled)')?.focus({ preventScroll: true });
}

function openDetail(phone, event) {
  const hasTicket = ticketIds.includes(event.id);
  openLayer(phone, `<section class="dialog detail-dialog" role="dialog" aria-modal="true" aria-label="${event.name}"><button class="icon-button dialog-close" data-action="close-layer" aria-label="Close event details"><i class="ti ti-x" aria-hidden="true"></i></button><h3>${event.name}</h3><p class="dialog-eyebrow">${event.festival}</p><div class="detail-meta"><p>${event.city}, ${event.country}<small>${event.venue}</small></p><p>${event.date}<small>${event.time}</small></p></div><div class="dialog-actions"><button class="primary-button" data-action="${hasTicket ? 'view-ticket' : 'booking'}" data-event="${event.id}"><span>${hasTicket ? 'View ticket' : 'Find tickets'}</span><i class="ti ti-arrow-up-right" aria-hidden="true"></i></button><button class="save-button" data-action="save" data-event="${event.id}" aria-label="${savedEvents.has(event.id) ? 'Unsave' : 'Save'} ${event.name}" aria-pressed="${savedEvents.has(event.id)}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 3H19V21L12 17L5 21Z"/></svg></button></div></section>`);
}

function openMenu(phone) {
  phone.content.querySelector('.menu-trigger').setAttribute('aria-expanded', 'true');
  const options = Object.keys(labels).map((view) => `<button class="menu-option${view === phone.view ? ' is-selected' : ''}" data-action="navigate" data-view="${view}" role="menuitem" ${view === phone.view ? 'aria-current="page"' : ''}><span>${labels[view]}</span><i class="ti ti-${view === 'home' ? 'home' : view === 'locations' ? 'map-pin' : view === 'tickets' ? 'ticket' : 'user'}" aria-hidden="true"></i></button>`).join('');
  openLayer(phone, `<div class="menu-panel" role="menu" aria-label="Explore Event Guide">${options}<button class="menu-option" data-action="navigate" data-view="welcome" role="menuitem">Your event guide<i class="ti ti-arrow-up-right" aria-hidden="true"></i></button><button class="menu-option" disabled role="menuitem" aria-disabled="true"><span>Online booking</span><small>Unavailable</small></button></div>`);
}

async function copyTicket(phone, button) {
  const event = getEvent(button.dataset.event);
  const original = button.textContent;
  button.disabled = true;
  button.textContent = 'Copying…';
  button.setAttribute('aria-busy', 'true');
  try {
    await navigator.clipboard.writeText(event.code);
    showToast(phone, `Copied ${event.code}`);
  } catch {
    showToast(phone, 'Clipboard unavailable. Select the ticket code to copy.', 'error');
  } finally {
    button.disabled = false;
    button.textContent = original;
    button.removeAttribute('aria-busy');
  }
}

function handleAction(phone, button) {
  const action = button.dataset.action;
  const event = button.dataset.event ? getEvent(button.dataset.event) : null;
  if (action === 'discover') navigate(phone, 'home');
  if (action === 'navigate') navigate(phone, button.dataset.view);
  if (action === 'menu') openMenu(phone);
  if (action === 'close-layer') closeLayer(phone);
  if (action === 'detail') openDetail(phone, event);
  if (action === 'clear-search') {
    phone.query = '';
    phone.content.querySelector('input').value = '';
    renderHome(phone);
    phone.content.querySelector('input').focus();
  }
  if (action === 'ticket') {
    if (phone.ticketIndex === Number(button.dataset.index)) return;
    phone.ticketIndex = Number(button.dataset.index);
    renderTicket(phone, !reduceMotion.matches);
    phone.content.querySelector(`[data-index="${phone.ticketIndex}"]`).focus({ preventScroll: true });
  }
  if (action === 'view-ticket') {
    phone.ticketIndex = ticketIds.indexOf(event.id);
    navigate(phone, 'tickets');
  }
  if (action === 'barcode') {
    openLayer(phone, `<section class="dialog barcode-dialog" role="dialog" aria-modal="true" aria-label="${event.name} barcode"><button class="icon-button dialog-close" data-action="close-layer" aria-label="Close barcode"><i class="ti ti-x" aria-hidden="true"></i></button><h3>${event.name}</h3><div class="large-barcode">${barcode()}</div><p class="ticket-code">${event.code}</p><button class="text-button" data-action="copy-ticket" data-event="${event.id}">Copy ticket code</button></section>`);
  }
  if (action === 'copy-ticket') void copyTicket(phone, button);
  if (action === 'booking') showToast(phone, 'Ticket sales require a connected booking service.', 'error');
  if (action === 'save') {
    const wasSaved = savedEvents.has(event.id);
    if (wasSaved) savedEvents.delete(event.id); else savedEvents.add(event.id);
    button.setAttribute('aria-pressed', String(!wasSaved));
    button.setAttribute('aria-label', `${wasSaved ? 'Save' : 'Unsave'} ${event.name}`);
    button.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 3H19V21L12 17L5 21Z"/></svg>';
    showToast(phone, wasSaved ? 'Removed from saved events' : 'Added to saved events');
    phones.filter((item) => item.view === 'profile').forEach((item) => renderProfile(item));
  }
  if (action === 'location') renderLocations(phone, button.dataset.city);
  if (action === 'profile-tab') renderProfile(phone, button.dataset.tab);
}

function start() {
  if (start.initialized) return;
  start.initialized = true;
  document.querySelectorAll('.canvas').forEach((canvas) => {
    const phone = { canvas, content: canvas.querySelector('.phone-content'), layer: canvas.querySelector('.layer'), toast: canvas.querySelector('.toast'), view: canvas.querySelector('.phone-content').dataset.view, query: '', ticketIndex: 1, profileTab: 'saved', touchStart: null, layerOpen: false };
    phone.layer.hidden = false;
    phone.layer.inert = true;
    phones.push(phone);
    navigate(phone, phone.view, false);
    canvas.addEventListener('click', (event) => {
      const button = event.target.closest('[data-action]');
      if (button && canvas.contains(button) && !button.disabled) handleAction(phone, button);
    });
    canvas.addEventListener('input', (event) => {
      if (event.target.matches('input[type="search"]')) {
        phone.query = event.target.value;
        renderHome(phone);
      }
    });
    canvas.addEventListener('submit', (event) => {
      if (event.target.matches('.search-form')) {
        event.preventDefault();
        phone.query = event.target.querySelector('input').value;
        renderHome(phone);
      }
    });
    canvas.addEventListener('keydown', (event) => {
      if (phone.layerOpen) {
        if (event.key === 'Escape') { event.preventDefault(); closeLayer(phone); }
        const buttons = [...phone.layer.querySelectorAll('button:not(:disabled)')];
        if (event.key === 'Tab') {
          const first = buttons[0];
          const last = buttons.at(-1);
          if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
          if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
        }
        if (phone.layer.querySelector('[role="menu"]') && ['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
          event.preventDefault();
          const index = buttons.indexOf(document.activeElement);
          const next = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : (index + (event.key === 'ArrowDown' ? 1 : -1) + buttons.length) % buttons.length;
          buttons[next].focus();
        }
        return;
      }
      if (phone.view === 'tickets' && ['ArrowLeft', 'ArrowRight'].includes(event.key)) {
        event.preventDefault();
        phone.ticketIndex = (phone.ticketIndex + (event.key === 'ArrowRight' ? 1 : -1) + ticketIds.length) % ticketIds.length;
        renderTicket(phone, !reduceMotion.matches);
        phone.content.querySelector(`[data-index="${phone.ticketIndex}"]`).focus();
      }
    });
    canvas.addEventListener('pointerdown', (event) => {
      if (phone.view === 'tickets' && event.target.closest('.ticket-carousel') && !event.target.closest('button')) phone.touchStart = { x: event.clientX, y: event.clientY };
    });
    canvas.addEventListener('pointerup', (event) => {
      if (!phone.touchStart) return;
      const dx = event.clientX - phone.touchStart.x;
      const dy = event.clientY - phone.touchStart.y;
      phone.touchStart = null;
      if (phone.view !== 'tickets' || Math.abs(dx) < 35 || Math.abs(dx) < Math.abs(dy)) return;
      phone.ticketIndex = (phone.ticketIndex + (dx < 0 ? 1 : -1) + ticketIds.length) % ticketIds.length;
      renderTicket(phone, !reduceMotion.matches);
    });
    canvas.addEventListener('pointercancel', () => { phone.touchStart = null; });
    canvas.classList.add('is-starting');
    canvas.addEventListener('animationend', (event) => {
      if (event.animationName === 'poster-arrive') canvas.classList.remove('is-starting');
    });
  });
}
start();
