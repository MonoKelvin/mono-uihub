const products = [
  { id: 'hoodie-lavender', name: 'Essential Hoodie', category: 'Hoodies', color: 'Lavender', hex: '#bca0d8', price: 49, image: 'product-hoodie.webp', family: 'hoodie', fits: ['unisex', 'women', 'men'], sizes: { S: 10, M: 12, L: 8, XL: 6 }, new: true, description: 'Everyday comfort with a modern edge. A soft, heavyweight hoodie with a relaxed fit, dropped shoulders and a generous kangaroo pocket.' },
  { id: 'sweatshirt-sage', name: 'Relaxed Sweatshirt', category: 'Sweatshirts', color: 'Sage', hex: '#afbea7', price: 45, image: 'product-sweatshirt.webp', family: 'sweatshirt', fits: ['unisex', 'women', 'men'], sizes: { S: 8, M: 10, L: 8, XL: 4 }, new: true, description: 'An easy crewneck with a roomy silhouette. Cotton-rich fleece and ribbed details make this one a daily favorite.' },
  { id: 'jogger-oat', name: 'Everyday Joggers', category: 'Joggers', color: 'Oat', hex: '#e5ded1', price: 42, image: 'product-joggers.webp', family: 'jogger', fits: ['unisex', 'women', 'men'], sizes: { S: 8, M: 10, L: 6, XL: 4 }, new: false, description: 'Comfort without compromise. Soft cotton fleece, an adjustable waist and an easy leg that moves with you.' },
  { id: 'tee-cream', name: 'Boxy Cotton Tee', category: 'T-Shirts', color: 'Cream', hex: '#f0e9df', price: 28, image: 'product-tee.webp', family: 'tee', fits: ['unisex', 'women', 'men'], sizes: { S: 10, M: 12, L: 10, XL: 0 }, new: true, description: 'Your everyday tee, rethought. Substantial cotton jersey, a slightly boxy cut and a neckline that sits just right.' },
  { id: 'hoodie-oat', name: 'Essential Hoodie', category: 'Hoodies', color: 'Oat', hex: '#e5ded1', price: 49, image: 'product-hoodie-oat.webp', family: 'hoodie', fits: ['unisex', 'women', 'men'], sizes: { S: 10, M: 12, L: 8, XL: 0 }, new: false, description: 'The Essential Hoodie in warm oat. A relaxed, cotton-rich layer that goes with everything in your wardrobe.' },
  { id: 'hoodie-sage', name: 'Essential Hoodie', category: 'Hoodies', color: 'Sage', hex: '#afbea7', price: 49, image: 'product-hoodie-sage.webp', family: 'hoodie', fits: ['unisex', 'women', 'men'], sizes: { S: 6, M: 8, L: 8, XL: 4 }, new: true, description: 'A softer shade of everyday. The same roomy fit and substantial cotton fleece, in a considered sage green.' },
  { id: 'sweatshirt-lavender', name: 'Relaxed Sweatshirt', category: 'Sweatshirts', color: 'Lavender', hex: '#bca0d8', price: 45, image: 'product-sweatshirt-lavender.webp', family: 'sweatshirt', fits: ['unisex', 'women', 'men'], sizes: { S: 8, M: 8, L: 6, XL: 4 }, new: false, description: 'Soft lavender, an easy crewneck and a relaxed shape. A layer for slow mornings and everything after.' },
  { id: 'tee-sage', name: 'Boxy Cotton Tee', category: 'T-Shirts', color: 'Sage', hex: '#afbea7', price: 28, image: 'product-tee-sage.webp', family: 'tee', fits: ['unisex', 'women', 'men'], sizes: { S: 10, M: 12, L: 10, XL: 6 }, new: false, description: 'Our boxy cotton tee in a quiet sage green. Soft, substantial jersey with plenty of room to move.' }
];
const heroSlides = [
  { id: 'hoodie-oat', color: 'Oat', number: '01', image: 'hero-oat.webp', top: '#c6b49a', bottom: '#eee6d7' },
  { id: 'hoodie-lavender', color: 'Lavender', number: '02', image: 'hero-lavender.webp', top: '#a987c8', bottom: '#e1d4ee' },
  { id: 'hoodie-sage', color: 'Sage', number: '03', image: 'hero-sage.webp', top: '#9aac90', bottom: '#e0e6d9' }
];
const state = { heroIndex: 1, heroSize: 'L', productId: null, productSize: 'L', productQuantity: 1, bag: [], saved: new Set(), profile: null, sort: 'featured', category: 'All', fit: '', newOnly: false, accountTab: 'profile' };
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const money = (value) => '$' + value.toFixed(value % 1 ? 2 : 0);
const escapeHTML = (value) => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const getProduct = (id) => products.find((product) => product.id === id);
let started = false;
let searchTimer;
let heroTimer;
let toastTimer;
let currentView = 'collections';

function productCard(product) {
  const saved = state.saved.has(product.id);
  return `<article class="product-card"><a class="product-image-link" href="#product?id=${product.id}" aria-label="${product.name} in ${product.color}"><img src="assets/${product.image}" alt="${product.color} ${product.name}" width="600" height="680" loading="lazy"></a><button class="save-button${saved ? ' is-saved' : ''}" data-save="${product.id}" aria-label="${saved ? 'Unsave' : 'Save'} ${product.name} in ${product.color}" aria-pressed="${saved}"><i class="ti ti-heart" aria-hidden="true"></i><svg class="saved-heart" viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M12 21a1 1 0 0 1-.707-.293l-8.15-8.151a5.75 5.75 0 0 1 8.132-8.132l.725.725.725-.725a5.75 5.75 0 0 1 8.132 8.132l-8.15 8.151A1 1 0 0 1 12 21Z"/></svg></button><div class="product-info"><div><h3><a href="#product?id=${product.id}">${product.name}</a></h3><p>${product.color}</p></div><span class="price">${money(product.price)}</span></div></article>`;
}
function renderCards(container, list) { container.innerHTML = list.map(productCard).join(''); }
function renderFilters() {
  $('#category-filters').innerHTML = ['All', 'Hoodies', 'Sweatshirts', 'Joggers', 'T-Shirts'].map((category) => `<button class="filter-tab${state.category === category ? ' is-current' : ''}" data-category="${category}" aria-pressed="${state.category === category}">${category}</button>`).join('');
}
function renderCatalog() {
  let list = products.filter((product) => (state.category === 'All' || product.category === state.category) && (!state.newOnly || product.new) && (!state.fit || product.fits.includes(state.fit)));
  if (state.sort === 'price-low') list.sort((a, b) => a.price - b.price);
  if (state.sort === 'price-high') list.sort((a, b) => b.price - a.price);
  if (state.sort === 'new') list.sort((a, b) => Number(b.new) - Number(a.new));
  $('#catalog-eyebrow').textContent = state.fit ? state.fit.toUpperCase() + ' · THE TOONI COLLECTION' : state.newOnly ? 'JUST JOINED THE EVERYDAY' : 'THE TOONI COLLECTION';
  $('#catalog-title').textContent = state.newOnly ? 'Fresh, not fleeting.' : state.category === 'All' ? 'All the essentials.' : state.category + '.';
  $('#catalog-description').textContent = state.newOnly ? 'New colors. Familiar comfort.' : 'Everyday pieces. Anything but ordinary.';
  $('#catalog-count').textContent = list.length + ' pieces';
  renderFilters();
  renderCards($('#catalog-products'), list);
  $('[data-sort="new"]').disabled = list.length < 2;
}
function renderSearch() {
  const query = $('#search-input').value.trim().toLowerCase();
  const words = query.split(/\s+/).filter(Boolean);
  const list = products.filter((product) => words.every((word) => `${product.name} ${product.category} ${product.color} ${product.description}`.toLowerCase().includes(word)));
  $('#search-count').textContent = query ? list.length + ' ' + (list.length === 1 ? 'match' : 'matches') : 'Explore all ' + products.length + ' essentials';
  $('#search-count').classList.remove('loading-label');
  $('#search-empty').hidden = list.length > 0;
  renderCards($('#search-products'), list);
  $('#search-products').hidden = !list.length;
}
function sizeButtons(product) {
  return Object.entries(product.sizes).map(([size, stock]) => `<button class="size-button${size === state.productSize ? ' is-selected' : ''}" data-size="${size}" aria-pressed="${size === state.productSize}"${stock === 0 ? ' disabled aria-label="' + size + ', out of stock"' : ''}>${size}</button>`).join('');
}
function renderProduct(id) {
  const product = getProduct(id);
  if (!product) { $('#product-content').innerHTML = '<div class="empty-state"><h2>This piece isn’t here.</h2><p>Find your next everyday favorite in the collection.</p><a class="primary-button" href="#shop">Explore the collection</a></div>'; return; }
  if (state.productId !== id) {
    const previous = getProduct(state.productId);
    state.productQuantity = 1;
    if (!previous || previous.family !== product.family || !product.sizes[state.productSize]) state.productSize = product.sizes[state.heroSize] ? state.heroSize : Object.keys(product.sizes).find((size) => product.sizes[size]);
  }
  state.productId = id;
  const colors = products.filter((item) => item.family === product.family);
  const fabric = product.family === 'tee' ? '100% cotton jersey, 240 gsm.' : '80% cotton, 20% recycled polyester fleece, 350 gsm.';
  $('#product-content').innerHTML = `<nav class="product-breadcrumb" aria-label="Breadcrumb"><a href="#shop">Collection</a><i class="ti ti-chevron-right" aria-hidden="true"></i><a href="#shop?category=${product.category}">${product.category}</a><i class="ti ti-chevron-right" aria-hidden="true"></i><span>${product.color}</span></nav><div class="product-detail"><div class="product-stage"><img src="assets/${product.image}" alt="${product.color} ${product.name}, front" width="700" height="800"></div><div class="product-description"><p class="eyebrow">THE EVERYDAY COLLECTION</p><h1>${product.name}</h1><span class="price">${money(product.price)}</span><p>${product.description}</p><div class="product-color-label">color — <strong>${product.color}</strong></div><div class="color-options" aria-label="Choose color">${colors.map((item) => `<a class="color-swatch${item.id === id ? ' is-selected' : ''}" href="#product?id=${item.id}" style="background:${item.hex}" aria-label="${item.color}"${item.id === id ? ' aria-current="true"' : ''}></a>`).join('')}</div><fieldset class="size-picker"><legend>select size<button type="button" class="size-guide-toggle" data-action="size-guide" aria-expanded="false" aria-controls="size-guide">Size guide</button></legend><div class="size-options" data-size-group="product">${sizeButtons(product)}</div></fieldset><div class="size-guide" id="size-guide" hidden><table><caption class="sr-only">Garment measurements in centimeters</caption><thead><tr><th>Size</th><th>${product.family === 'jogger' ? 'Waist' : 'Chest'}</th><th>Length</th></tr></thead><tbody>${['S', 'M', 'L', 'XL'].map((size, index) => `<tr><td>${size}</td><td>${product.family === 'jogger' ? 70 + index * 6 : 110 + index * 6} cm</td><td>${product.family === 'jogger' ? 98 + index * 2 : 66 + index * 2} cm</td></tr>`).join('')}</tbody></table><p>Garment measurements. For an oversized fit, choose your usual size.</p></div><div class="product-actions"><div class="quantity-control" aria-label="Quantity"><button data-product-quantity="-1" aria-label="Decrease quantity"${state.productQuantity === 1 ? ' disabled' : ''}><i class="ti ti-minus" aria-hidden="true"></i></button><output id="product-quantity" aria-live="polite">${state.productQuantity}</output><button data-product-quantity="1" aria-label="Increase quantity"><i class="ti ti-plus" aria-hidden="true"></i></button></div><button class="primary-button" data-action="add-to-bag">Add to bag — ${money(product.price * state.productQuantity)}</button></div><div class="product-feedback" id="product-feedback" role="status"></div><div class="product-details"><details><summary>Fit & fabric</summary><p>${fabric} Relaxed ${product.family === 'jogger' ? 'leg' : 'fit with dropped shoulders'}. Choose your usual size for an easy fit.</p></details><details><summary>Care</summary><p>Machine wash cold with similar colors. Turn inside out. Reshape while damp and line dry. Do not tumble dry.</p></details><details><summary>Delivery & returns</summary><p>Standard delivery: $5. Free delivery on orders of $100 or more. Returns accepted within 30 days for unworn pieces with tags attached.</p></details></div></div></div>`;
  updateProductQuantity();
}
function bagTotals() {
  const count = state.bag.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = state.bag.reduce((sum, item) => sum + getProduct(item.id).price * item.quantity, 0);
  const shipping = subtotal >= 100 || !count ? 0 : 5;
  return { count, subtotal, shipping, total: subtotal + shipping };
}
function updateBagCount() {
  const { count } = bagTotals();
  $('.bag-count').textContent = count;
  $('.bag-count').hidden = count === 0;
  $('.bag-link').setAttribute('aria-label', 'Shopping bag, ' + count + ' items');
  $('#bag-heading-count').textContent = count ? ` (${count})` : '';
}
function summaryMarkup(checkout = false) {
  const { subtotal, shipping, total } = bagTotals();
  return `<h2>${checkout ? 'Your good picks' : 'The details'}</h2>${checkout ? state.bag.map((item) => { const product = getProduct(item.id); return `<div class="summary-item"><span>${product.name}<br>${product.color} / ${item.size} × ${item.quantity}</span><span class="price">${money(product.price * item.quantity)}</span></div>`; }).join('') : ''}<div class="summary-row"><span>Subtotal</span><span class="price">${money(subtotal)}</span></div><div class="summary-row"><span>Delivery</span><span class="price">${shipping ? money(shipping) : 'On us'}</span></div><div class="summary-row total"><span>Total</span><span class="price">${money(total)}</span></div>${checkout ? '' : '<a class="primary-button" href="#checkout">Checkout<i class="ti ti-arrow-right" aria-hidden="true"></i></a><p>Free delivery on orders of $100 or more.</p>'}`;
}
function renderBag() {
  updateBagCount();
  if (!state.bag.length) {
    $('#bag-content').innerHTML = '<div class="empty-state"><i class="ti ti-shopping-bag" aria-hidden="true"></i><h2>A little room for something good.</h2><p>Your bag is empty. Find your new everyday favorite.</p><a class="primary-button" href="#shop">Explore the collection</a></div>';
    return;
  }
  $('#bag-content').innerHTML = `<div class="bag-layout"><div>${state.bag.map((item) => {
    const product = getProduct(item.id);
    return `<article class="bag-item"><a class="bag-item-image" href="#product?id=${product.id}"><img src="assets/${product.image}" alt="${product.color} ${product.name}" width="200" height="240"></a><div><h3><a href="#product?id=${product.id}">${product.name}</a></h3><p>${product.color} / Size ${item.size}</p><div class="quantity-control"><button data-bag-key="${item.key}" data-bag-quantity="-1" aria-label="Decrease ${product.name} quantity"${item.quantity === 1 ? ' disabled' : ''}><i class="ti ti-minus" aria-hidden="true"></i></button><output aria-live="polite">${item.quantity}</output><button data-bag-key="${item.key}" data-bag-quantity="1" aria-label="Increase ${product.name} quantity"${item.quantity >= product.sizes[item.size] ? ' disabled' : ''}><i class="ti ti-plus" aria-hidden="true"></i></button></div></div><div class="bag-item-end"><span class="price">${money(product.price * item.quantity)}</span><button class="remove-item" data-remove="${item.key}">Remove</button></div></article>`;
  }).join('')}<a class="text-link" href="#shop">Continue exploring<i class="ti ti-arrow-right" aria-hidden="true"></i></a></div><aside class="order-summary">${summaryMarkup()}</aside></div>`;
}
function renderAccount(tab = 'profile') {
  state.accountTab = ['profile', 'orders', 'saved'].includes(tab) ? tab : 'profile';
  $$('[data-account-tab]').forEach((button) => { button.classList.toggle('is-current', button.dataset.accountTab === state.accountTab); button.setAttribute('aria-current', button.dataset.accountTab === state.accountTab ? 'page' : 'false'); });
  if (state.accountTab === 'saved') {
    const saved = products.filter((product) => state.saved.has(product.id));
    $('#account-content').innerHTML = saved.length ? `<div class="product-grid saved-grid">${saved.map(productCard).join('')}</div>` : '<div class="empty-state"><i class="ti ti-heart" aria-hidden="true"></i><h2>Keep the good ones close.</h2><p>Save the pieces you love and find them here.</p><a class="primary-button" href="#shop">Find your favorites</a></div>';
  } else if (state.accountTab === 'orders') {
    $('#account-content').innerHTML = '<div class="empty-state"><i class="ti ti-package" aria-hidden="true"></i><h2>Your story starts here.</h2><p>No orders to show. Your next favorite is waiting.</p><a class="primary-button" href="#shop">Explore the collection</a><a class="text-link" href="#contact">Need help with an order?<i class="ti ti-arrow-up-right" aria-hidden="true"></i></a></div>';
  } else {
    const profile = state.profile || { name: '', email: '' };
    $('#account-content').innerHTML = `<div class="account-panel"><h2>${profile.name ? 'Hi, ' + escapeHTML(profile.name) + '.' : 'Make yourself at home.'}</h2><p>Your details, all in one place.</p><form class="account-form" id="account-form" novalidate><label>Your name<input name="name" autocomplete="name" value="${escapeHTML(profile.name)}" placeholder="Full name" required></label><label>Email address<input name="email" type="email" autocomplete="email" value="${escapeHTML(profile.email)}" placeholder="you@example.com" required></label><p class="form-status" id="account-status" role="status" hidden></p><button class="primary-button" type="submit">Save details<i class="ti ti-arrow-right" aria-hidden="true"></i></button></form></div>`;
  }
}
function route() {
  const [name, query = ''] = location.hash.slice(1).split('?');
  const params = new URLSearchParams(query);
  const requested = name || 'collections';
  const view = requested === 'shop' || requested === 'new-arrivals' ? 'shop' : ['collections', 'search', 'product', 'bag', 'checkout', 'lookbook', 'about', 'contact', 'account'].includes(requested) ? requested : 'collections';
  if (view === 'checkout' && !state.bag.length) { location.replace('#bag'); return; }
  currentView = view;
  clearTimeout(toastTimer);
  $('#toast').hidden = true;
  $$('[data-view]').forEach((section) => { section.hidden = section.dataset.view !== view; });
  $$('[data-nav]').forEach((link) => { const selected = link.dataset.nav === requested || link.dataset.nav === 'collections' && (view === 'product' || requested === 'shop'); if (selected) link.setAttribute('aria-current', 'page'); else link.removeAttribute('aria-current'); });
  $('.mobile-nav').hidden = true;
  $('.menu-toggle').setAttribute('aria-expanded', 'false');
  $('.menu-toggle').setAttribute('aria-label', 'Open menu');
  closeSort();
  if (view === 'shop') { state.category = ['Hoodies', 'Sweatshirts', 'Joggers', 'T-Shirts'].includes(params.get('category')) ? params.get('category') : 'All'; state.fit = ['unisex', 'women', 'men'].includes(params.get('fit')) ? params.get('fit') : ''; state.newOnly = requested === 'new-arrivals'; renderCatalog(); }
  if (view === 'product') renderProduct(params.get('id'));
  if (view === 'bag') renderBag();
  if (view === 'checkout') { $('#checkout-summary').innerHTML = summaryMarkup(true); $('#checkout-status').hidden = true; }
  if (view === 'search') { clearTimeout(searchTimer); renderSearch(); }
  if (view === 'account') renderAccount(params.get('tab') || 'profile');
  document.title = `${view === 'collections' ? 'Everyday, elevated.' : view === 'product' ? getProduct(params.get('id'))?.name || 'Collection' : view === 'shop' ? state.newOnly ? 'New arrivals' : state.category === 'All' ? 'The collection' : state.category : view.charAt(0).toUpperCase() + view.slice(1)} — tooni™`;
  window.scrollTo({ top: 0, behavior: 'instant' });
  if (view === 'search') $('#search-input').focus({ preventScroll: true });
}
function changeHero(direction) {
  state.heroIndex = (state.heroIndex + direction + heroSlides.length) % heroSlides.length;
  const slide = heroSlides[state.heroIndex];
  const image = $('.hero-model');
  clearTimeout(heroTimer);
  const apply = () => { image.src = 'assets/' + slide.image; image.alt = slide.color + ' Essential Hoodie styled with cream trousers'; $('.edition-number').textContent = slide.number; $('.edition-number').setAttribute('aria-label', 'Edition ' + slide.number); $('.hero').style.setProperty('--arch-top', slide.top); $('.hero').style.setProperty('--arch-bottom', slide.bottom); image.classList.remove('is-switching'); $('#hero-status').textContent = slide.color + ', edition ' + slide.number; };
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) apply();
  else { image.classList.add('is-switching'); heroTimer = setTimeout(apply, 150); }
}
function selectSize(button) {
  const group = button.closest('[data-size-group]');
  $$('[data-size]', group).forEach((option) => { option.classList.toggle('is-selected', option === button); option.setAttribute('aria-pressed', option === button ? 'true' : 'false'); });
  if (group.dataset.sizeGroup === 'hero') state.heroSize = button.dataset.size;
  else { state.productSize = button.dataset.size; state.productQuantity = 1; updateProductQuantity(); $('#product-feedback').textContent = ''; }
}
function updateProductQuantity() {
  const product = getProduct(state.productId);
  $('#product-quantity').textContent = state.productQuantity;
  $('[data-product-quantity="-1"]').disabled = state.productQuantity <= 1;
  const inBag = state.bag.find((item) => item.id === product.id && item.size === state.productSize)?.quantity || 0;
  const remaining = product.sizes[state.productSize] - inBag;
  $('[data-product-quantity="1"]').disabled = state.productQuantity >= remaining;
  $('[data-action="add-to-bag"]').disabled = remaining < state.productQuantity;
  $('[data-action="add-to-bag"]').textContent = remaining < state.productQuantity ? 'All available pieces are in your bag' : 'Add to bag — ' + money(product.price * state.productQuantity);
}
function showToast(message) {
  clearTimeout(toastTimer);
  $('#toast span').textContent = message;
  $('#toast').hidden = false;
  toastTimer = setTimeout(() => { $('#toast').hidden = true; }, 3500);
}
function addToBag() {
  const product = getProduct(state.productId);
  const key = product.id + ':' + state.productSize;
  let item = state.bag.find((entry) => entry.key === key);
  const total = (item?.quantity || 0) + state.productQuantity;
  if (total > product.sizes[state.productSize]) { $('#product-feedback').textContent = 'Only ' + product.sizes[state.productSize] + ' pieces available in this size.'; return; }
  if (item) item.quantity = total;
  else state.bag.push({ key, id: product.id, size: state.productSize, quantity: state.productQuantity });
  updateBagCount();
  updateProductQuantity();
  $('#product-feedback').innerHTML = 'A good choice. Added to your bag. <a class="text-link" href="#bag">View bag<i class="ti ti-arrow-right" aria-hidden="true"></i></a>';
  showToast(product.name + ' added');
}
function toggleSave(id) {
  if (state.saved.has(id)) state.saved.delete(id); else state.saved.add(id);
  $$(`[data-save="${id}"]`).forEach((button) => { const product = getProduct(id); const saved = state.saved.has(id); button.classList.toggle('is-saved', saved); button.setAttribute('aria-pressed', saved); button.setAttribute('aria-label', `${saved ? 'Unsave' : 'Save'} ${product.name} in ${product.color}`); });
  if (currentView === 'account' && state.accountTab === 'saved') renderAccount('saved');
}
function closeSort() { $('#sort-menu').hidden = true; $('.sort-trigger').setAttribute('aria-expanded', 'false'); }
function validateForm(form, status) {
  const inputs = [...form.elements].filter((element) => element.matches('input, textarea'));
  const invalid = inputs.filter((input) => !input.checkValidity() || input.required && !input.value.trim());
  inputs.forEach((input) => input.setAttribute('aria-invalid', invalid.includes(input) ? 'true' : 'false'));
  status.classList.remove('is-success');
  status.hidden = false;
  if (invalid.length) {
    status.textContent = invalid.some((input) => input.type === 'email' && input.value) ? 'Please enter a valid email address.' : 'Please complete the highlighted fields.';
    invalid[0].focus({ preventScroll: true });
    return false;
  }
  return true;
}
function handleSubmit(event) {
  const form = event.target;
  event.preventDefault();
  if (form.id === 'search-form') { clearTimeout(searchTimer); renderSearch(); return; }
  const status = $('#' + form.id.replace('-form', '-status'));
  if (!status || !validateForm(form, status)) return;
  const submit = $('button[type="submit"]', form);
  if (submit.disabled) return;
  const label = submit.innerHTML;
  submit.disabled = true;
  submit.textContent = form.id === 'account-form' ? 'Saving…' : 'Connecting…';
  status.innerHTML = '<span class="loading-label">' + (form.id === 'account-form' ? 'Updating your details' : 'Checking connection') + '</span>';
  const profile = form.id === 'account-form' ? { name: form.elements.name.value.trim(), email: form.elements.email.value.trim() } : null;
  const heading = form.closest('.account-panel')?.querySelector('h2');
  setTimeout(() => {
    submit.disabled = false;
    submit.innerHTML = label;
    if (form.id === 'account-form') {
      state.profile = profile;
      heading.textContent = 'Hi, ' + state.profile.name + '.';
      status.textContent = 'Your details are updated.';
      status.classList.add('is-success');
    } else {
      status.textContent = form.id === 'checkout-form' ? 'Payment service is not connected. Your bag and delivery details are still here. Please try again later.' : 'We couldn’t connect to the message service. Your note is still here. Please try again later.';
    }
  }, 650);
}
function handleClick(event) {
  const button = event.target.closest('button');
  if (!button || button.disabled) { if (!event.target.closest('.sort-control')) closeSort(); return; }
  if (button.dataset.size) selectSize(button);
  if (button.dataset.save) toggleSave(button.dataset.save);
  if (button.dataset.category) { state.category = button.dataset.category; renderCatalog(); }
  if (button.dataset.sort) {
    state.sort = button.dataset.sort;
    $('#sort-label').textContent = button.textContent;
    $$('[data-sort]').forEach((option) => option.setAttribute('aria-selected', option === button));
    closeSort(); renderCatalog(); $('.sort-trigger').focus({ preventScroll: true });
  }
  if (button.classList.contains('sort-trigger')) { const open = $('#sort-menu').hidden; $('#sort-menu').hidden = !open; button.setAttribute('aria-expanded', open); if (open) ($('#sort-menu button[aria-selected="true"]:not(:disabled)') || $('#sort-menu button:not(:disabled)')).focus(); }
  if (button.classList.contains('menu-toggle')) { const open = $('.mobile-nav').hidden; $('.mobile-nav').hidden = !open; button.setAttribute('aria-expanded', open); button.setAttribute('aria-label', open ? 'Close menu' : 'Open menu'); }
  if (button.dataset.productQuantity) { const product = getProduct(state.productId); const inBag = state.bag.find((item) => item.id === product.id && item.size === state.productSize)?.quantity || 0; state.productQuantity = Math.max(1, Math.min(product.sizes[state.productSize] - inBag, state.productQuantity + Number(button.dataset.productQuantity))); updateProductQuantity(); }
  if (button.dataset.bagQuantity) { const item = state.bag.find((entry) => entry.key === button.dataset.bagKey); if (item) { item.quantity = Math.max(1, Math.min(getProduct(item.id).sizes[item.size], item.quantity + Number(button.dataset.bagQuantity))); renderBag(); } }
  if (button.dataset.remove) { state.bag = state.bag.filter((item) => item.key !== button.dataset.remove); renderBag(); }
  if (button.dataset.accountTab) { location.hash = 'account?tab=' + button.dataset.accountTab; }
  if (button.dataset.retryImage) {
    event.preventDefault();
    const wrapper = button.closest('.image-error');
    const image = new Image(); image.src = wrapper.dataset.src; image.alt = wrapper.dataset.alt; image.width = 600; image.height = 680; wrapper.replaceWith(image);
  }
  const action = button.dataset.action;
  if (action === 'hero-shop') { state.productId = null; state.productSize = state.heroSize; location.hash = 'product?id=' + heroSlides[state.heroIndex].id; }
  if (action === 'previous-hero') changeHero(-1);
  if (action === 'next-hero') changeHero(1);
  if (action === 'add-to-bag') addToBag();
  if (action === 'size-guide') { const open = $('#size-guide').hidden; $('#size-guide').hidden = !open; button.setAttribute('aria-expanded', open); }
  if (action === 'clear-search') { $('#search-input').value = ''; renderSearch(); $('#search-input').focus(); }
  if (!event.target.closest('.sort-control')) closeSort();
}
function start() {
  if (started) return;
  started = true;
  renderCards($('#home-products'), products.slice(0, 4));
  window.addEventListener('hashchange', route);
  document.addEventListener('click', handleClick);
  document.addEventListener('submit', handleSubmit);
  $('#search-input').addEventListener('input', () => { clearTimeout(searchTimer); $('#search-count').textContent = 'Finding your essentials'; $('#search-count').classList.add('loading-label'); searchTimer = setTimeout(renderSearch, 180); });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') { const sortOpen = !$('#sort-menu').hidden; closeSort(); if (sortOpen) $('.sort-trigger').focus(); $('.mobile-nav').hidden = true; $('.menu-toggle').setAttribute('aria-expanded', 'false'); $('.menu-toggle').setAttribute('aria-label', 'Open menu'); $('#toast').hidden = true; }
    if (event.target.closest('#sort-menu') && ['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
      event.preventDefault(); const options = $$('button:not(:disabled)', $('#sort-menu')); const index = options.indexOf(document.activeElement); const next = event.key === 'Home' ? 0 : event.key === 'End' ? options.length - 1 : (index + (event.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length; options[next].focus();
    }
  });
  document.addEventListener('error', (event) => {
    const image = event.target;
    if (!(image instanceof HTMLImageElement) || !image.closest('.product-image-link, .product-stage, .bag-item-image')) return;
    const wrapper = document.createElement('div'); wrapper.className = 'image-error'; wrapper.dataset.src = image.getAttribute('src'); wrapper.dataset.alt = image.alt;
    wrapper.innerHTML = '<i class="ti ti-photo-off" aria-hidden="true"></i><span>Image unavailable</span><button class="text-link" data-retry-image="true">Try again</button>';
    image.replaceWith(wrapper);
  }, true);
  route();
}
start();
