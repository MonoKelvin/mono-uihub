const models = [
  {
    id: 'ivory', name: 'C45', category: 'Classic Model', label: 'Classic Moped', finish: 'Ivory', price: 2495,
    image: './assets/moped-ivory.png', range: '65 miles', speed: '28 mph', charging: '4–6 hours',
    story: 'Officially the UK’s No.1 selling moped. <span class="story-highlight">This 50cc</span> Panther moped is agile and ready to strike.'
  },
  {
    id: 'panther', name: 'DB50QT', category: 'Panther Model', label: 'Panther Moped', finish: 'Panther black', price: 2695,
    image: './assets/moped-ivory.png', range: '70 miles', speed: '28 mph', charging: '4–6 hours',
    story: 'Quiet confidence. A deep black finish, instant electric response, and a little more freedom in your everyday.'
  },
  {
    id: 'sport', name: 'S72', category: 'Sport Model', label: 'Sport Moped', finish: 'Sunburst', price: 2895,
    image: './assets/moped-ivory.png', range: '80 miles', speed: '28 mph', charging: '4–6 hours',
    story: 'A brighter way through the city. Distinctive colour and the same effortless, all-electric ride.'
  }
];

const canvas = document.querySelector('.canvas');
const overlay = document.querySelector('#overlay');
const dialog = overlay.querySelector('.dialog');
const content = document.querySelector('#dialog-content');
const productArt = document.querySelector('.product-art');
const currency = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 });
const cart = new Map();
let selectedId = 'ivory';
let activePanel = null;
let returnFocus = null;
let toastTimeout;
let started = false;

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
}

function selectedModel() {
  return models.find(model => model.id === selectedId);
}

function setModel(id) {
  if (!models.some(model => model.id === id)) return;
  if (id !== selectedId) canvas.classList.remove('is-started');
  selectedId = id;
  const model = selectedModel();
  canvas.dataset.model = id;
  document.querySelector('#model-name').textContent = model.name;
  document.querySelector('#model-category').textContent = model.category;
  document.querySelector('#model-story').innerHTML = model.story;
  document.querySelector('.explore-button').setAttribute('aria-label', `Explore the ${model.name} moped`);
  document.querySelectorAll('[data-art]').forEach(image => {
    image.classList.toggle('is-active', image.dataset.art === id);
    image.setAttribute('aria-hidden', String(image.dataset.art !== id));
  });
  document.querySelectorAll('.model-card').forEach(button => {
    const selected = button.dataset.model === id;
    button.classList.toggle('is-selected', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
  updateImageState();
}

function updateImageState() {
  const image = productArt.querySelector('.is-active');
  const state = image.dataset.state || 'loading';
  productArt.dataset.state = state;
  productArt.setAttribute('aria-busy', String(state === 'loading'));
  productArt.querySelector('.image-error').hidden = state !== 'error';
}

function notify(message) {
  const toast = document.querySelector('.toast');
  clearTimeout(toastTimeout);
  toast.querySelector('span').textContent = message;
  toast.hidden = false;
  toastTimeout = setTimeout(() => { toast.hidden = true; }, 2800);
}

function collectionMarkup(list = models) {
  if (!list.length) return '<div class="empty-state"><i class="ti ti-search-off" aria-hidden="true"></i><p>No mopeds match your search.</p><button class="text-button" data-clear-search>Show all mopeds</button></div>';
  return `<div class="collection-list">${list.map(model => `<button class="collection-item" data-view-product="${model.id}"><img src="${model.image}" data-tone="${model.id}" alt=""><span><strong>${model.name}</strong><small>${model.label} · ${model.finish}</small></span><span class="item-price">${currency.format(model.price)}</span><i class="ti ti-arrow-right" aria-hidden="true"></i></button>`).join('')}</div>`;
}

function productMarkup() {
  const model = selectedModel();
  return `<div class="detail-layout"><img class="detail-image" src="${model.image}" data-tone="${model.id}" alt="${model.finish} ${model.name} moped"><div><div class="detail-meta"><h3>${model.name}</h3><p>${model.label} / ${model.finish}</p></div><dl class="spec-list"><div><dt>Range, up to</dt><dd>${model.range}</dd></div><div><dt>Top speed</dt><dd>${model.speed}</dd></div><div><dt>Full charge</dt><dd>${model.charging}</dd></div><div><dt>Power</dt><dd>100% electric</dd></div></dl><div class="price">${currency.format(model.price)}</div><button class="primary-button" data-add="${model.id}">Add to cart <i class="ti ti-plus" aria-hidden="true"></i></button></div></div>`;
}

function cartMarkup() {
  if (!cart.size) return '<div class="empty-state"><i class="ti ti-shopping-bag" aria-hidden="true"></i><p>Your next adventure starts here.<br>Your cart is empty.</p><button class="primary-button" data-open="collections">Find your moped <i class="ti ti-arrow-right" aria-hidden="true"></i></button></div>';
  let total = 0;
  const rows = [...cart].map(([id, quantity]) => {
    const model = models.find(item => item.id === id);
    total += model.price * quantity;
    return `<div class="cart-row"><img src="${model.image}" data-tone="${model.id}" alt=""><div><h3>${model.name} / ${model.finish}</h3><p>${currency.format(model.price)}</p><div class="quantity-control"><button data-quantity="${id}" data-delta="-1" aria-label="Decrease ${model.name} quantity" ${quantity === 1 ? 'disabled' : ''}><i class="ti ti-minus" aria-hidden="true"></i></button><output aria-label="${model.name} quantity">${quantity}</output><button data-quantity="${id}" data-delta="1" aria-label="Increase ${model.name} quantity" ${quantity === 9 ? 'disabled' : ''}><i class="ti ti-plus" aria-hidden="true"></i></button></div></div><button class="icon-button remove-item" data-remove="${id}" aria-label="Remove ${model.name}"><i class="ti ti-trash" aria-hidden="true"></i></button></div>`;
  }).join('');
  return `${rows}<div class="cart-total"><span>Subtotal</span><strong>${currency.format(total)}</strong></div><button class="primary-button" data-download-cart>Download your selection <i class="ti ti-download" aria-hidden="true"></i></button><p class="cart-note">Delivery and availability are confirmed with your retailer. No payment is taken here.</p>`;
}

function contactMarkup() {
  return '<p class="dialog-lead">A question about your next ride?</p><form class="contact-form" id="contact-form" novalidate><div class="form-row"><div><label class="field-label" for="contact-name">Your name</label><input id="contact-name" name="name" autocomplete="name" required maxlength="80" aria-describedby="name-error"><div class="field-error" id="name-error" hidden></div></div><div><label class="field-label" for="contact-email">Email address</label><input id="contact-email" name="email" type="email" autocomplete="email" required maxlength="150" aria-describedby="email-error"><div class="field-error" id="email-error" hidden></div></div></div><div><label class="field-label" for="contact-message">What’s on your mind?</label><textarea id="contact-message" name="message" required maxlength="2000" aria-describedby="message-error"></textarea><div class="field-error" id="message-error" hidden></div></div><button class="primary-button" type="submit">Prepare enquiry <i class="ti ti-arrow-right" aria-hidden="true"></i></button><p class="form-message" id="form-error" role="status" hidden></p></form>';
}

function optionsMarkup() {
  return `<p class="dialog-lead">Find the finish that feels like you.</p><div class="finish-options">${models.map(model => `<button class="finish-option" data-finish="${model.id}" aria-pressed="${model.id === selectedId}"><span class="swatch-${model.id}"></span>${model.finish}</button>`).join('')}</div><div class="options-preview">${productMarkup()}</div>`;
}

const panelTitles = { about: 'Less noise. More life.', collections: 'Find your kind of fast.', services: 'Good rides. Great care.', options: 'Make it yours.', contact: 'Let’s talk.', search: 'Where will you go?', product: 'Your everyday, electrified.', cart: 'Your cart.', reviews: 'From the rider’s seat.' };

function openPanel(panel, trigger = null) {
  if (!panelTitles[panel]) return;
  if (overlay.hidden) returnFocus = trigger || document.activeElement;
  activePanel = panel;
  document.querySelector('#dialog-title').textContent = panelTitles[panel];
  if (panel === 'collections') content.innerHTML = collectionMarkup();
  else if (panel === 'product') content.innerHTML = productMarkup();
  else if (panel === 'cart') content.innerHTML = cartMarkup();
  else if (panel === 'contact') content.innerHTML = contactMarkup();
  else if (panel === 'options') content.innerHTML = optionsMarkup();
  else if (panel === 'search') content.innerHTML = '<div class="search-field"><i class="ti ti-search" aria-hidden="true"></i><input id="model-search" type="search" placeholder="Search by model or finish" aria-label="Search by model or finish" autocomplete="off"></div><div id="search-results" aria-live="polite">' + collectionMarkup() + '</div>';
  else if (panel === 'about') content.innerHTML = '<p class="dialog-lead">Classic on the outside.<br>A different kind of energy within.</p><div class="info-grid"><div><i class="ti ti-bolt" aria-hidden="true"></i><h3>Electric by nature</h3><p>Quiet journeys. Instant response. A ride that fits the rhythm of the city.</p></div><div><i class="ti ti-route" aria-hidden="true"></i><h3>Made for everyday</h3><p>The early start. The scenic route. A little freedom between where you are and where you’re going.</p></div><div><i class="ti ti-sparkles" aria-hidden="true"></i><h3>Always a classic</h3><p>Familiar lines, thoughtful details, and a personality that’s entirely your own.</p></div></div>';
  else if (panel === 'services') content.innerHTML = '<p class="dialog-lead">Keep the good days rolling.</p><div class="info-grid"><div><i class="ti ti-tool" aria-hidden="true"></i><h3>Servicing</h3><p>Get advice on routine maintenance, tyres and keeping your ride in good shape.</p></div><div><i class="ti ti-battery-charging" aria-hidden="true"></i><h3>Battery care</h3><p>Questions about charging, storage or getting the most out of your battery?</p></div><div><i class="ti ti-helmet" aria-hidden="true"></i><h3>Your first ride</h3><p>Talk through fit, riding equipment and choosing the right moped.</p></div></div><button class="text-button" data-open="contact">Ask the Skot team</button>';
  else if (panel === 'reviews') content.innerHTML = '<div class="empty-state"><i class="ti ti-message-circle" aria-hidden="true"></i><p>The rider review feed is currently unavailable.</p><button class="primary-button" data-open="contact">Talk to the Skot team <i class="ti ti-arrow-right" aria-hidden="true"></i></button></div>';
  overlay.hidden = false;
  content.scrollTop = 0;
  [...canvas.children].filter(element => element !== overlay && !element.classList.contains('toast')).forEach(element => { element.inert = true; });
  requestAnimationFrame(() => {
    if (activePanel !== panel || overlay.hidden) return;
    (content.querySelector('input') || dialog).focus({ preventScroll: true });
    if (matchMedia('(max-width: 1100px)').matches) dialog.scrollIntoView({ block: 'nearest', behavior: 'instant' });
  });
}

function closePanel() {
  overlay.hidden = true;
  activePanel = null;
  [...canvas.children].forEach(element => { element.inert = false; });
  if (returnFocus?.isConnected) returnFocus.focus({ preventScroll: true });
}

function updateCartCount() {
  const count = [...cart.values()].reduce((sum, quantity) => sum + quantity, 0);
  const badge = document.querySelector('.cart-count');
  badge.textContent = count;
  badge.hidden = count === 0;
  document.querySelector('.cart-button').setAttribute('aria-label', `Cart, ${count} ${count === 1 ? 'item' : 'items'}`);
}

function downloadText(filename, text) {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function filterSearch() {
  const query = content.querySelector('#model-search').value.trim().toLocaleLowerCase();
  const results = models.filter(model => `${model.name} ${model.label} ${model.finish}`.toLocaleLowerCase().includes(query));
  content.querySelector('#search-results').innerHTML = collectionMarkup(results);
}

function submitContact(form) {
  const fields = ['name', 'email', 'message'];
  let firstInvalid = null;
  fields.forEach(name => {
    const field = form.elements.namedItem(name);
    const value = field.value.trim();
    const invalid = !value || (name === 'email' && field.validity.typeMismatch);
    const error = form.querySelector(`#${name}-error`);
    field.setAttribute('aria-invalid', String(invalid));
    error.hidden = !invalid;
    error.textContent = name === 'email' ? 'Enter a valid email address.' : name === 'name' ? 'Please enter your name.' : 'Please tell us how we can help.';
    if (invalid && !firstInvalid) firstInvalid = field;
  });
  if (firstInvalid) { firstInvalid.focus(); return; }
  const submit = form.querySelector('[type="submit"]');
  submit.disabled = true;
  submit.textContent = 'Preparing…';
  try {
    const name = form.elements.namedItem('name').value.trim();
    const email = form.elements.namedItem('email').value.trim();
    const message = form.elements.namedItem('message').value.trim();
    const text = `SKOT / ENQUIRY\n\nName: ${name}\nEmail: ${email}\nInterested in: ${selectedModel().name}\n\n${message}\n`;
    downloadText('skot-enquiry.txt', text);
    const ready = document.createElement('div');
    ready.className = 'enquiry-ready';
    ready.innerHTML = `<h3>Your enquiry is ready.</h3><p>${escapeHtml(name)}, your enquiry has been saved as a text file. Share it with your retailer when you’re ready. It has not been sent.</p><button class="primary-button" data-open="contact">Write another enquiry</button>`;
    form.replaceWith(ready);
  } catch {
    const error = form.querySelector('#form-error');
    error.textContent = 'The enquiry couldn’t be saved. Please try again.';
    error.hidden = false;
    submit.disabled = false;
    submit.innerHTML = 'Prepare enquiry <i class="ti ti-arrow-right" aria-hidden="true"></i>';
  }
}

function start() {
  if (started) return;
  started = true;
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
    canvas.classList.add('is-started');
    productArt.querySelector('[data-art="ivory"]').addEventListener('animationend', () => canvas.classList.remove('is-started'), { once: true });
  }
  productArt.querySelectorAll('[data-art]').forEach(image => {
    image.addEventListener('load', () => { image.dataset.state = 'ready'; if (image.dataset.art === selectedId) updateImageState(); });
    image.addEventListener('error', () => { image.dataset.state = 'error'; if (image.dataset.art === selectedId) updateImageState(); });
    if (image.complete) image.dataset.state = image.naturalWidth ? 'ready' : 'error';
  });
  setModel('ivory');
  canvas.addEventListener('click', event => {
    const button = event.target.closest('button, a');
    if (!button) return;
    if (button.classList.contains('brand')) { event.preventDefault(); setModel('ivory'); if (!overlay.hidden) closePanel(); return; }
    if (button.hasAttribute('data-close')) { closePanel(); return; }
    if (button.dataset.open) { openPanel(button.dataset.open, button); return; }
    if (button.dataset.model) { setModel(button.dataset.model); return; }
    if (button.dataset.viewProduct) { setModel(button.dataset.viewProduct); openPanel('product'); return; }
    if (button.dataset.finish) { setModel(button.dataset.finish); content.innerHTML = optionsMarkup(); content.querySelector(`[data-finish="${selectedId}"]`).focus(); return; }
    if (button.dataset.add) {
      const id = button.dataset.add;
      const quantity = cart.get(id) || 0;
      if (quantity >= 9) { notify('A maximum of 9 per model.'); return; }
      cart.set(id, quantity + 1);
      updateCartCount();
      notify(`${models.find(model => model.id === id).name} added to your cart.`);
      button.innerHTML = 'Added to cart <i class="ti ti-check" aria-hidden="true"></i>';
      return;
    }
    if (button.dataset.quantity) {
      const id = button.dataset.quantity;
      const quantity = cart.get(id) + Number(button.dataset.delta);
      if (quantity < 1 || quantity > 9) return;
      cart.set(id, quantity);
      updateCartCount();
      const delta = button.dataset.delta;
      content.innerHTML = cartMarkup();
      content.querySelector(`[data-quantity="${id}"][data-delta="${delta}"]`)?.focus();
      return;
    }
    if (button.dataset.remove) {
      cart.delete(button.dataset.remove);
      updateCartCount();
      content.innerHTML = cartMarkup();
      (content.querySelector('button') || dialog).focus();
      return;
    }
    if (button.hasAttribute('data-download-cart')) {
      const lines = [...cart].map(([id, quantity]) => {
        const model = models.find(item => item.id === id);
        return `${model.name} / ${model.finish} × ${quantity} — ${currency.format(model.price * quantity)}`;
      });
      try { downloadText('skot-selection.txt', `SKOT / YOUR SELECTION\n\n${lines.join('\n')}\n\nAvailability and delivery to be confirmed by your retailer. No payment has been taken.\n`); notify('Your selection has been downloaded.'); }
      catch { notify('The file couldn’t be saved. Please try again.'); }
      return;
    }
    if (button.hasAttribute('data-clear-search')) { content.querySelector('#model-search').value = ''; filterSearch(); content.querySelector('#model-search').focus(); return; }
    if (button.classList.contains('theme-switch')) {
      const light = canvas.dataset.theme !== 'light';
      canvas.dataset.theme = light ? 'light' : 'dark';
      document.documentElement.dataset.theme = canvas.dataset.theme;
      button.setAttribute('aria-checked', String(light));
      button.querySelector('.ti').className = light ? 'ti ti-sun' : 'ti ti-moon';
      return;
    }
    if (button.id === 'retry-image') {
      const image = productArt.querySelector('.is-active');
      image.dataset.state = 'loading';
      const source = image.getAttribute('src');
      image.removeAttribute('src');
      image.setAttribute('src', source);
      updateImageState();
    }
  });
  overlay.querySelector('.scrim').addEventListener('click', closePanel);
  content.addEventListener('input', event => {
    if (event.target.id === 'model-search') filterSearch();
    if (event.target.closest('#contact-form')) {
      event.target.removeAttribute('aria-invalid');
      const error = event.target.parentElement.querySelector('.field-error');
      if (error) error.hidden = true;
    }
  });
  content.addEventListener('submit', event => { event.preventDefault(); if (event.target.id === 'contact-form') submitContact(event.target); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !overlay.hidden) { closePanel(); return; }
    if (event.key !== 'Tab' || overlay.hidden) return;
    const focusable = [...dialog.querySelectorAll('button:not(:disabled), a[href], input, textarea')].filter(element => element.getClientRects().length);
    if (!focusable.length) { event.preventDefault(); dialog.focus(); return; }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog)) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && (document.activeElement === last || document.activeElement === dialog)) { event.preventDefault(); first.focus(); }
  });
}

start();
