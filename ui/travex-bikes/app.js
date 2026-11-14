const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const colorNames = { forest: 'Forest olive', carbon: 'Carbon black', silver: 'Glacier silver' };
const money = value => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
const bikeSpecs = [['Frame', 'Carbon / full suspension'], ['Fork travel', '160 mm'], ['Rear travel', '150 mm'], ['Wheel size', '29 inches'], ['Drivetrain', '1 × 12 speed'], ['Brakes', 'Hydraulic disc']];
const products = [
  { id: 'ridgex-pro', name: 'Ridgex Pro', category: 'bikes', color: 'forest', price: 3250, image: 'bike-forest.webp', note: 'Forest olive · Trail / All mountain', description: 'Made for long climbs and the descent you came for. A full-suspension carbon frame, confident geometry, and room to find your own line.', specs: bikeSpecs },
  { id: 'ridgex-pro-carbon', name: 'Ridgex Pro', category: 'bikes', color: 'carbon', price: 3250, image: 'bike-carbon.webp', note: 'Carbon black · Trail / All mountain', description: 'The same trail-ready Ridgex Pro, with an understated carbon-black finish. Built to feel as good on the climb as it does on the way down.', specs: bikeSpecs },
  { id: 'ridgex-pro-silver', name: 'Ridgex Pro', category: 'bikes', color: 'silver', price: 3400, image: 'bike-silver.webp', note: 'Glacier silver · Trail / All mountain', description: 'Our full-suspension trail bike in a glacier-silver finish. A capable carbon chassis, generous suspension travel, and a little extra shine.', specs: bikeSpecs },
  { id: 'trail-multitool', name: 'Topeak trail multitool', category: 'accessories', price: 39, image: 'bike-multitool.webp', note: 'Black / silver · Trail essentials', description: 'Keep the essentials close. A compact folding tool for adjustments at the trailhead and the small fixes that keep your ride going.', specs: [['Finish', 'Black / silver'], ['Tools', 'Hex keys and chain tool'], ['Storage', 'Pocket-size folding body']] },
  { id: 'trail-helmet', name: 'Trail helmet', category: 'gear', price: 89, image: 'trail-helmet.webp', note: 'Graphite · Riding gear', description: 'A ventilated cycling helmet with an adjustable fit. Choose the right size before your next ride.', specs: [['Fit', 'Adjustable retention'], ['Ventilation', 'Open-channel airflow'], ['Finish', 'Graphite']] }
];
const state = { view: 'home', category: 'bikes', filter: 'all', sort: 'featured', query: '', color: 'forest', gallery: null, product: products[0], size: null, cart: [], signedIn: false, signInAttempts: 0, loginBusy: false, saving: false, catalogScroll: 0 };
const galleryOrder = [null, 'frame', 'suspension', 'drivetrain'];
let started = false;
let imageVersion = 0;
let imageTimer;
let toastTimer;

function setStatus(element, message, type = '') {
  element.textContent = message;
  element.dataset.state = type;
}

function notify(message) {
  const toast = $('.toast');
  toast.textContent = message;
  toast.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2600);
}

function showView(view, currentNav) {
  if (state.view === 'catalog' && view !== 'catalog') state.catalogScroll = window.scrollY;
  state.view = view;
  document.body.dataset.view = view;
  $$('.view').forEach(element => { element.hidden = element.id !== `${view}-view`; });
  $('.site-footer').hidden = view === 'home';
  $$('[data-nav]').forEach(link => {
    if (link.dataset.nav === currentNav) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  closeSort(false);
  window.scrollTo({ top: 0, behavior: 'instant' });
}

function openCatalog(category, search = false) {
  if (state.category !== category) {
    state.filter = 'all';
    state.query = '';
    $('#product-search').value = '';
  }
  state.category = category;
  const titles = { bikes: 'The bike collection.', accessories: 'The little essentials.', gear: 'Ready for the ride.', all: 'Find your next ride.' };
  const brows = { bikes: 'FIND YOUR LINE', accessories: 'TAKE IT WITH YOU', gear: 'TRAIL READY', all: 'EXPLORE TRAVEX' };
  $('#catalog-title').textContent = titles[category];
  $('#catalog-eyebrow').textContent = brows[category];
  $('.category-filters').hidden = category !== 'bikes';
  $('#catalog-note').textContent = category === 'bikes' ? 'From the first climb\nto the last descent.' : 'Small things.\nBig days out.';
  showView('catalog', category);
  renderCatalog();
  if (search) $('#product-search').focus({ preventScroll: true });
  else $('#catalog-title').focus({ preventScroll: true });
}

function renderCatalog() {
  const query = state.query.trim().toLowerCase();
  let results = products.filter(product => (state.category === 'all' || product.category === state.category)
    && (state.filter === 'all' || state.category !== 'bikes' || product.color === state.filter)
    && `${product.name} ${product.note} ${product.category}`.toLowerCase().includes(query));
  if (state.sort === 'price-asc') results.sort((a, b) => a.price - b.price);
  if (state.sort === 'price-desc') results.sort((a, b) => b.price - a.price);
  $('#product-grid').innerHTML = results.map(product => `<article class="product-card"><a href="#product/${product.id}" aria-label="View ${product.name}${product.color ? ` in ${colorNames[product.color]}` : ''}"><div class="card-visual"><span class="card-category">${product.category === 'bikes' ? 'Trail / All mountain' : product.category === 'gear' ? 'Riding gear' : 'Trail essentials'}</span><img src="./assets/${product.image}" alt="${product.name}${product.color ? ` in ${colorNames[product.color]}` : ''}" loading="lazy"></div><div class="card-info"><h2>${product.name}</h2><span class="card-price">${money(product.price)}</span></div><p class="card-note">${product.note}</p></a></article>`).join('');
  $('#catalog-empty').hidden = results.length !== 0;
  $('#result-count').textContent = `${results.length} ${results.length === 1 ? 'product' : 'products'}`;
  $('#clear-search').hidden = !state.query;
  $$('[data-filter]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === state.filter)));
}

function syncColors() {
  $$('[data-color]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.color === state.color)));
  $('#selected-color').textContent = colorNames[state.color];
}

function updateHero() {
  const image = $('.hero-photo');
  const version = ++imageVersion;
  clearTimeout(imageTimer);
  image.classList.add('is-changing');
  if (state.gallery) $('#home-view').dataset.gallery = state.gallery;
  else delete $('#home-view').dataset.gallery;
  const path = state.gallery ? `detail-${state.gallery}${state.color === 'forest' ? '' : `-${state.color}`}.webp` : `hero-${state.color}.webp`;
  const preload = new Image();
  preload.onload = () => {
    if (version !== imageVersion) return;
    imageTimer = setTimeout(() => {
      image.src = `./assets/${path}`;
      image.dataset.detail = String(Boolean(state.gallery));
      image.classList.remove('is-changing');
      $('.hero-image-state').hidden = true;
    }, matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 100);
  };
  preload.onerror = () => {
    if (version !== imageVersion) return;
    image.classList.remove('is-changing');
    $('.hero-image-state').hidden = false;
  };
  preload.src = `./assets/${path}`;
  $$('.thumbnail').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.gallery === state.gallery)));
  $('.gallery-reset').hidden = !state.gallery;
  $('#gallery-status').textContent = `Ridgex Pro in ${colorNames[state.color]}, ${state.gallery ? `${state.gallery} detail` : 'full bike view'}.`;
  $('.hero-model').href = `#product/${products.find(product => product.color === state.color).id}`;
  $('.header-cta').href = $('.hero-model').href;
  if ($('.hero-mobile-bike')) $('.hero-mobile-bike').src = `./assets/bike-${state.color}.webp`;
}

function setColor(color) {
  state.color = color;
  syncColors();
  if (state.view === 'home') updateHero();
  if (state.view === 'detail' && state.product.category === 'bikes') {
    state.product = products.find(product => product.color === color);
    $('#detail-image').src = `./assets/${state.product.image}`;
    $('#detail-image').alt = `Ridgex Pro in ${colorNames[color]}`;
    $('#detail-price').textContent = money(state.product.price);
    setStatus($('#add-status'), '');
  }
}

function openProduct(id) {
  const product = products.find(item => item.id === id);
  if (!product) { openCatalog('bikes'); return; }
  state.product = product;
  state.size = product.category === 'accessories' ? 'One size' : null;
  if (product.color) state.color = product.color;
  $('#detail-title').textContent = product.name;
  $('#detail-description').textContent = product.description;
  $('#detail-price').textContent = money(product.price);
  $('#detail-image').src = `./assets/${product.image}`;
  $('#detail-image').alt = `${product.name}${product.color ? ` in ${colorNames[product.color]}` : ''}`;
  $('#detail-image-label').textContent = product.name.toUpperCase();
  $('#detail-category').textContent = product.category === 'bikes' ? 'TRAIL / ALL MOUNTAIN' : product.category === 'gear' ? 'RIDING GEAR' : 'TRAIL ESSENTIALS';
  $('#detail-colors-group').hidden = product.category !== 'bikes';
  $('.size-group').hidden = product.category === 'accessories';
  $('.size-group legend').textContent = product.category === 'bikes' ? 'Frame size' : 'Size';
  $('#size-options').innerHTML = (product.category === 'bikes' ? ['S', 'M', 'L', 'XL'] : ['S', 'M', 'L']).map(size => `<button type="button" class="size-option" data-size="${size}" aria-pressed="false" ${size === 'XL' ? 'disabled aria-label="XL, unavailable"' : ''}>${size}</button>`).join('');
  $('#size-note').textContent = product.category === 'bikes' ? 'Select your frame size. XL is currently unavailable.' : 'Select your size.';
  $('#spec-list').innerHTML = product.specs.map(([key, value]) => `<div><dt>${key}</dt><dd>${value}</dd></div>`).join('');
  $('#detail-back').href = `#${product.category}`;
  $('#add-to-bag').disabled = !state.size;
  setStatus($('#add-status'), '');
  syncColors();
  showView('detail', product.category);
  $('#detail-title').focus({ preventScroll: true });
}

function addToBag() {
  if (!state.size) return;
  const product = state.product;
  const key = `${product.id}-${state.size}`;
  const existing = state.cart.find(item => item.key === key);
  if (existing && existing.quantity >= 9) {
    setStatus($('#add-status'), 'You can add up to 9 of this item.', 'error');
    return;
  }
  if (existing) existing.quantity++;
  else state.cart.push({ key, product, size: state.size, quantity: 1 });
  updateBagCount();
  setStatus($('#add-status'), `${product.name} added to your bag.`, 'success');
  notify('Added to your bag.');
  const link = document.createElement('a');
  link.href = '#bag';
  link.textContent = ' View bag →';
  $('#add-status').append(link);
}

function updateBagCount() {
  const count = state.cart.reduce((sum, item) => sum + item.quantity, 0);
  $('.bag-count').textContent = count;
  $('.bag-link').setAttribute('aria-label', `Shopping bag, ${count} ${count === 1 ? 'item' : 'items'}`);
}

function renderBag() {
  const empty = state.cart.length === 0;
  $('#bag-empty').hidden = !empty;
  $('#bag-content').hidden = empty;
  $('#bag-items').innerHTML = state.cart.map(item => `<article class="bag-item" data-key="${item.key}"><a class="bag-item-image" href="#product/${item.product.id}" aria-label="View ${item.product.name}"><img src="./assets/${item.product.image}" alt="${item.product.name}"></a><div><h2>${item.product.name}</h2><p>${item.product.color ? colorNames[item.product.color] : 'Graphite / black'} · ${item.size}</p><div class="quantity-controls"><button type="button" data-quantity="-1" aria-label="Decrease quantity" ${item.quantity === 1 ? 'disabled' : ''}><i class="ti ti-minus" aria-hidden="true"></i></button><output aria-label="Quantity">${item.quantity}</output><button type="button" data-quantity="1" aria-label="Increase quantity" ${item.quantity === 9 ? 'disabled' : ''}><i class="ti ti-plus" aria-hidden="true"></i></button></div></div><div class="bag-item-end"><span class="bag-item-price">${money(item.product.price * item.quantity)}</span><button type="button" class="remove-item" data-remove="true">Remove</button></div></article>`).join('');
  const total = state.cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  $('#bag-subtotal').textContent = money(total);
  $('#bag-total').textContent = money(total);
  $('#save-bag').disabled = empty || state.saving;
}

async function saveBag() {
  if (state.saving || !state.cart.length) return;
  state.saving = true;
  const button = $('#save-bag');
  button.disabled = true;
  button.dataset.busy = 'true';
  button.innerHTML = 'Preparing your selection <i class="ti ti-loader-2" aria-hidden="true"></i>';
  setStatus($('#save-status'), 'Preparing your file…', 'loading');
  let url;
  try {
    await new Promise(resolve => setTimeout(resolve, 220));
    const lines = ['TRAVEX — Your ride selection', '', ...state.cart.map(item => `${item.product.name} · ${item.product.color ? colorNames[item.product.color] : item.product.note} · ${item.size} · Qty ${item.quantity} · ${money(item.product.price * item.quantity)}`), '', `Estimated total: ${$('#bag-total').textContent}`, 'Delivery is calculated at checkout.'];
    const file = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    url = URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'travex-ride-selection.txt';
    document.body.append(link);
    link.click();
    link.remove();
    setStatus($('#save-status'), 'Your selection is ready to take with you.', 'success');
  } catch {
    setStatus($('#save-status'), 'Your file couldn’t be created. Please try again.', 'error');
  } finally {
    if (url) setTimeout(() => URL.revokeObjectURL(url), 1000);
    state.saving = false;
    button.disabled = !state.cart.length;
    button.dataset.busy = 'false';
    button.innerHTML = 'Save your selection <i class="ti ti-download" aria-hidden="true"></i>';
  }
}

function closeSort(restoreFocus = true) {
  const wasOpen = !$('#sort-panel').hidden;
  $('#sort-panel').hidden = true;
  $('#sort-trigger').setAttribute('aria-expanded', 'false');
  if (wasOpen && restoreFocus) $('#sort-trigger').focus();
}

function toggleSort() {
  const panel = $('#sort-panel');
  if (!panel.hidden) { closeSort(); return; }
  panel.hidden = false;
  $('#sort-trigger').setAttribute('aria-expanded', 'true');
  $('[aria-selected="true"]', panel).focus();
}

function renderAccount() {
  $('#account-form-view').hidden = state.signedIn;
  $('#account-signed-in').hidden = !state.signedIn;
}

async function signIn(event) {
  event.preventDefault();
  if (state.loginBusy) return;
  const email = $('#account-email');
  const password = $('#account-password');
  const emailValid = email.validity.valid && email.value.trim() !== '';
  const passwordValid = password.value.length >= 6;
  email.setAttribute('aria-invalid', String(!emailValid));
  password.setAttribute('aria-invalid', String(!passwordValid));
  $('#email-error').textContent = emailValid ? '' : 'Enter a valid email address.';
  $('#password-error').textContent = passwordValid ? '' : 'Use at least 6 characters.';
  if (!emailValid || !passwordValid) { (emailValid ? password : email).focus(); return; }
  state.loginBusy = true;
  state.signInAttempts++;
  const button = $('#sign-in');
  button.disabled = true;
  button.dataset.busy = 'true';
  button.innerHTML = 'Signing in <i class="ti ti-loader-2" aria-hidden="true"></i>';
  setStatus($('#account-status'), 'Connecting to your account…', 'loading');
  await new Promise(resolve => setTimeout(resolve, 800));
  if (state.signInAttempts % 2 === 1) {
    state.signedIn = true;
    $('#signed-in-email').textContent = email.value.trim();
    setStatus($('#account-status'), '', 'success');
    renderAccount();
    if (state.view === 'account') $('#account-signed-in h1').focus({ preventScroll: true });
  } else {
    setStatus($('#account-status'), 'We couldn’t connect. Please try signing in again.', 'error');
  }
  state.loginBusy = false;
  button.disabled = false;
  button.dataset.busy = 'false';
  button.innerHTML = 'Sign in <i class="ti ti-arrow-right" aria-hidden="true"></i>';
}

function route() {
  const destination = location.hash.slice(1) || 'home';
  if (destination.startsWith('product/')) openProduct(destination.slice(8));
  else if (['bikes', 'accessories', 'gear'].includes(destination)) {
    const restore = state.view === 'detail' && state.category === destination;
    openCatalog(destination);
    if (restore) window.scrollTo({ top: state.catalogScroll, behavior: 'instant' });
  } else if (destination === 'search') openCatalog('all', true);
  else if (destination === 'bag') { renderBag(); showView('bag'); $('#bag-title').focus({ preventScroll: true }); }
  else if (destination === 'account') { renderAccount(); showView('account'); }
  else if (destination === 'about') { showView('about', 'about'); $('#about-title').focus({ preventScroll: true }); }
  else { showView('home', 'bikes'); syncColors(); updateHero(); }
}

function start() {
  if (started) return;
  started = true;
  window.addEventListener('hashchange', route);
  $$('[data-color]').forEach(button => button.addEventListener('click', () => setColor(button.dataset.color)));
  $$('.thumbnail').forEach(button => button.addEventListener('click', () => { state.gallery = state.gallery === button.dataset.gallery ? null : button.dataset.gallery; updateHero(); }));
  $$('[data-gallery-step]').forEach(button => button.addEventListener('click', () => {
    state.gallery = galleryOrder[(galleryOrder.indexOf(state.gallery) + Number(button.dataset.galleryStep) + galleryOrder.length) % galleryOrder.length];
    updateHero();
  }));
  $('.gallery-reset').addEventListener('click', () => { state.gallery = null; updateHero(); });
  $('.hero-photo').addEventListener('error', () => { $('.hero-image-state').hidden = false; });
  $('#retry-hero').addEventListener('click', updateHero);
  $('#product-search').addEventListener('input', event => { state.query = event.target.value; renderCatalog(); });
  $('#search-form').addEventListener('submit', event => { event.preventDefault(); renderCatalog(); });
  $('#clear-search').addEventListener('click', () => { state.query = ''; $('#product-search').value = ''; renderCatalog(); $('#product-search').focus(); });
  $('#reset-filters').addEventListener('click', () => { state.query = ''; state.filter = 'all'; $('#product-search').value = ''; renderCatalog(); });
  $$('[data-filter]').forEach(button => button.addEventListener('click', () => { state.filter = button.dataset.filter; renderCatalog(); }));
  $('#sort-trigger').addEventListener('click', toggleSort);
  $('#sort-panel').addEventListener('click', event => {
    const option = event.target.closest('[data-sort]');
    if (!option || option.disabled) return;
    state.sort = option.dataset.sort;
    $('#sort-label').textContent = option.textContent.trim();
    $$('[data-sort]').forEach(button => { button.setAttribute('aria-selected', String(button === option)); $('i', button)?.remove(); });
    const check = document.createElement('i');
    check.className = 'ti ti-check';
    check.setAttribute('aria-hidden', 'true');
    option.append(check);
    closeSort();
    renderCatalog();
  });
  $('#sort-panel').addEventListener('keydown', event => {
    const options = $$('[data-sort]:not(:disabled)');
    const index = options.indexOf(document.activeElement);
    if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
      event.preventDefault();
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? options.length - 1 : (index + (event.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length;
      options[next].focus();
    }
  });
  $('#sort-trigger').addEventListener('keydown', event => { if (event.key === 'ArrowDown') { event.preventDefault(); if ($('#sort-panel').hidden) toggleSort(); } });
  document.addEventListener('click', event => { if (!event.target.closest('.sort-select')) closeSort(false); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeSort(); });
  document.addEventListener('focusin', event => { if (!event.target.closest('.sort-select')) closeSort(false); });
  $('#size-options').addEventListener('click', event => {
    const button = event.target.closest('[data-size]');
    if (!button || button.disabled) return;
    state.size = button.dataset.size;
    $$('[data-size]').forEach(option => option.setAttribute('aria-pressed', String(option === button)));
    $('#size-note').textContent = state.product.category === 'bikes' ? { S: 'Recommended rider height: 155–168 cm.', M: 'Recommended rider height: 168–180 cm.', L: 'Recommended rider height: 178–190 cm.' }[state.size] : `Size ${state.size} selected.`;
    $('#add-to-bag').disabled = false;
    setStatus($('#add-status'), '');
  });
  $('#add-to-bag').addEventListener('click', addToBag);
  $('#bag-items').addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button || button.disabled) return;
    const key = button.closest('[data-key]').dataset.key;
    const item = state.cart.find(entry => entry.key === key);
    if (button.dataset.remove) state.cart = state.cart.filter(entry => entry.key !== key);
    else if (button.dataset.quantity) item.quantity = Math.max(1, Math.min(9, item.quantity + Number(button.dataset.quantity)));
    updateBagCount();
    renderBag();
    setStatus($('#save-status'), '');
    if (button.dataset.quantity) {
      const next = $$('.bag-item').find(entry => entry.dataset.key === key);
      const control = $(`[data-quantity="${button.dataset.quantity}"]`, next);
      if (!control.disabled) control.focus({ preventScroll: true });
    }
  });
  $('#save-bag').addEventListener('click', saveBag);
  $('#account-form').addEventListener('submit', signIn);
  $('#toggle-password').addEventListener('click', () => {
    const password = $('#account-password');
    const visible = password.type === 'password';
    password.type = visible ? 'text' : 'password';
    $('#toggle-password').setAttribute('aria-label', visible ? 'Hide password' : 'Show password');
    $('#toggle-password').setAttribute('aria-pressed', String(visible));
    $('#toggle-password i').className = visible ? 'ti ti-eye-off' : 'ti ti-eye';
  });
  $('#sign-out').addEventListener('click', () => { state.signedIn = false; $('#account-password').value = ''; setStatus($('#account-status'), ''); renderAccount(); $('#account-email').focus(); });
  $('#account-signed-in h1').tabIndex = -1;
  route();
}

start();
