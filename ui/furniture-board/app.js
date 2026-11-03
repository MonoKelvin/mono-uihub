'use strict';

const assets = {
  cognac: './assets/chair-cognac.png',
  grey: './assets/chair-grey.png',
  lamp: './assets/lamp-minimal.svg'
};
const products = [
  { id: 'cognac', name: 'Cognac armchair', title: 'Armchair<br>room design', price: 329, rating: 4.8, reviews: 64, description: 'Stylish armchair that decorates<br class="desktop-break"> interior with designer elements.', material: 'Leather · Black steel legs', color: 'Cognac', dimensions: '78 × 76 × 84 cm', alt: 'Cognac leather armchair with black legs', halo: '#e2ddd7' },
  { id: 'grey', name: 'Grey armchair', title: 'Grey armchair<br>room design', price: 259, rating: 4.7, reviews: 42, description: 'A soft upholstered seat, a generous cushion<br class="desktop-break"> and a quiet place to unwind.', material: 'Woven fabric · Dark wood legs', color: 'Charcoal grey', dimensions: '72 × 70 × 80 cm', alt: 'Grey upholstered armchair with a white cushion', halo: '#dedfe0' },
  { id: 'lamp', name: 'Minimal lamp', title: 'Minimal lamp<br>room design', price: 59, rating: 4.9, reviews: 38, description: 'A clean silhouette and focused light<br class="desktop-break"> for your favourite reading corner.', material: 'Powder-coated steel', color: 'Black', dimensions: '28 × 28 × 142 cm', alt: 'Black standing reading lamp with an angled shade', halo: '#e2e2e1' }
];
const byId = Object.fromEntries(products.map(product => [product.id, product]));
const state = { selected: 'cognac', favorites: new Set(['grey']), cart: {}, enquiry: null };
const showroom = document.querySelector('#showroom');
const base = document.querySelector('#shop-base');
const hero = document.querySelector('#hero-image');
const copy = document.querySelector('#product-copy');
const overlay = document.querySelector('#overlay');
const panel = document.querySelector('#panel');
const panelBody = document.querySelector('#panel-body');
const panelFooter = document.querySelector('#panel-footer');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const animate = () => Boolean(window.gsap) && !reducedMotion.matches;
let productTransition;
let panelTimeline;
let panelOpen = false;
let panelMode = '';
let currentView = '';
let returnFocus;
let toastTimer;
let toastTween;

function escape(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}
function icon(name) { return `<i class="ti ti-${name}" aria-hidden="true"></i>`; }
function price(value) { return `${value} €`; }
function image(id, className = '') { return `<img src="${escape(assets[id])}" alt="${escape(byId[id].alt)}" class="${className}" decoding="async" draggable="false">`; }
function heart() { return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.1 4.5 12.7a4.9 4.9 0 0 1 7-7l.5.5.5-.5a4.9 4.9 0 0 1 7 7Z"/></svg>'; }
function stars(rating) {
  return `<span class="stars" aria-label="${rating} out of 5 stars">${Array.from({ length: 5 }, (_, index) => `<svg viewBox="0 0 24 24" class="${index >= Math.floor(rating) ? 'star-outline' : ''}" aria-hidden="true"><path d="m12 3 2.8 5.8 6.4.9-4.6 4.5 1.1 6.4-5.7-3-5.7 3 1.1-6.4-4.6-4.5 6.4-.9Z"/></svg>`).join('')}</span>`;
}
function favoriteButton(id) {
  return `<button class="card-favorite" data-action="favorite" data-id="${id}" aria-pressed="${state.favorites.has(id)}" aria-label="${state.favorites.has(id) ? 'Remove' : 'Save'} ${byId[id].name}" title="${state.favorites.has(id) ? 'Remove from saved items' : 'Save item'}">${heart()}</button>`;
}
function recommendation(product) {
  return `<article class="recommendation ${product.id === 'lamp' ? 'is-lamp' : ''}"><button class="recommendation-image" data-action="select" data-id="${product.id}" aria-label="View ${product.name}">${image(product.id)}</button><div class="recommendation-copy"><button class="recommendation-name" data-action="select" data-id="${product.id}">${product.name}</button><p class="recommendation-price">${price(product.price)}</p></div><div class="recommendation-bottom">${stars(product.rating)}${favoriteButton(product.id)}</div></article>`;
}
function renderSelected() {
  const product = byId[state.selected];
  hero.src = assets[product.id];
  hero.alt = product.alt;
  hero.classList.remove('image-unavailable');
  showroom.classList.toggle('showing-lamp', product.id === 'lamp');
  document.querySelector('#product-title').innerHTML = product.title;
  document.querySelector('#product-description').innerHTML = product.description;
  document.querySelector('#product-price').textContent = price(product.price);
  document.querySelector('#product-halo').style.backgroundColor = product.halo;
  document.querySelector('.review-link .stars').outerHTML = stars(product.rating);
  document.querySelector('.review-link .stars').classList.add('hero-stars');
  document.querySelector('#recommendations').innerHTML = products.filter(item => item.id !== product.id).map(recommendation).join('');
  updateFavorites();
  updateCartIndicators();
  document.title = `Design — ${product.name}`;
}
function selectProduct(id) {
  if (state.selected === id) return;
  state.selected = id;
  productTransition?.kill();
  if (!animate()) { if (window.gsap) window.gsap.set([hero, copy], { clearProps: 'transform,opacity' }); renderSelected(); return; }
  productTransition = window.gsap.timeline({ defaults: { ease: 'power3.out' } })
    .to([hero, copy], { opacity: 0, x: -9, duration: .13, overwrite: 'auto' }, 0)
    .call(renderSelected)
    .fromTo(hero, { x: 26, opacity: 0 }, { x: 0, opacity: 1, duration: .43, clearProps: 'transform,opacity' })
    .fromTo(copy, { x: 10, opacity: 0 }, { x: 0, opacity: 1, duration: .31, clearProps: 'transform,opacity' }, '<.035');
}
function updateFavorites() {
  const product = byId[state.selected];
  const main = document.querySelector('#main-favorite');
  main.setAttribute('aria-pressed', state.favorites.has(product.id));
  main.setAttribute('aria-label', `${state.favorites.has(product.id) ? 'Remove' : 'Save'} ${product.name}`);
  document.querySelectorAll('[data-action="favorite"]').forEach(button => { const selected = state.favorites.has(button.dataset.id); button.setAttribute('aria-pressed', selected); button.setAttribute('aria-label', `${selected ? 'Remove' : 'Save'} ${byId[button.dataset.id].name}`); });
}
function toggleFavorite(id, button) {
  state.favorites.has(id) ? state.favorites.delete(id) : state.favorites.add(id);
  updateFavorites();
  if (button && animate()) window.gsap.fromTo(button.querySelector('svg'), { scale: .78 }, { scale: 1, duration: .29, ease: 'back.out(1.4)', clearProps: 'transform' });
  if (currentView === 'favorites') showFavorites();
  if (currentView === 'account') showAccount();
  toast(state.favorites.has(id) ? 'Saved to your collection' : 'Removed from saved items');
}
function cartTotals() {
  return Object.entries(state.cart).reduce((totals, [id, count]) => ({ count: totals.count + count, total: totals.total + byId[id].price * count }), { count: 0, total: 0 });
}
function updateCartIndicators() {
  const { count, total } = cartTotals();
  const badge = document.querySelector('#cart-badge');
  badge.hidden = !count;
  badge.textContent = count;
  document.querySelector('#view-cart-link').hidden = !count;
  document.querySelector('#cart-total-inline').textContent = price(total);
}
function addToCart(id, button) {
  if ((state.cart[id] || 0) >= 9) { toast('You can select up to 9 of each item', 'info-circle'); return; }
  state.cart[id] = (state.cart[id] || 0) + 1;
  updateCartIndicators();
  if (button && animate()) window.gsap.fromTo(button, { scale: .96 }, { scale: 1, duration: .26, ease: 'power3.out', clearProps: 'transform' });
  toast(`${byId[id].name} added to cart`);
  if (currentView === 'cart') showCart();
}
function toast(message, symbol = 'check') {
  const element = document.querySelector('#toast');
  clearTimeout(toastTimer);
  toastTween?.kill();
  element.querySelector('.ti').className = `ti ti-${symbol}`;
  document.querySelector('#toast-message').textContent = message;
  const entering = element.hidden;
  element.hidden = false;
  if (animate()) {
    if (entering) window.gsap.set(element, { y: 8, opacity: 0 });
    toastTween = window.gsap.to(element, { y: 0, opacity: 1, duration: .22, ease: 'power3.out', overwrite: 'auto' });
  } else { element.style.opacity = '1'; element.style.transform = 'translateX(-50%)'; }
  toastTimer = setTimeout(() => {
    if (animate()) toastTween = window.gsap.to(element, { y: 6, opacity: 0, duration: .2, onComplete: () => { element.hidden = true; } });
    else element.hidden = true;
  }, 2300);
}
function createPanelTimeline(mode) {
  if (!window.gsap) return;
  panelTimeline?.kill();
  window.gsap.set(panel, { clearProps: 'transform,opacity,visibility' });
  panelTimeline = window.gsap.timeline({ paused: true, defaults: { ease: 'power3.out' }, onReverseComplete: finishClose });
  panelTimeline.fromTo('#scrim', { opacity: 0 }, { opacity: 1, duration: .27 }, 0);
  if (mode === 'drawer') panelTimeline.fromTo(panel, { xPercent: 100, opacity: 1 }, { xPercent: 0, opacity: 1, duration: .42 }, 0);
  else panelTimeline.fromTo(panel, { y: 19, scale: .98, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: .3 }, 0);
}
function openPanel(title, body, footer = '', view = '', mode = 'dialog') {
  const focused = document.activeElement;
  const preserve = panelOpen && currentView === view && view === 'cart';
  const oldScroll = preserve ? panelBody.scrollTop : 0;
  const existing = !overlay.hidden;
  const changeMode = panelMode !== mode;
  currentView = view;
  document.querySelector('#panel-title').textContent = title;
  panelBody.innerHTML = body;
  panelFooter.innerHTML = footer;
  panelFooter.hidden = !footer;
  panel.classList.toggle('is-drawer', mode === 'drawer');
  panelBody.scrollTop = oldScroll;
  if (!panelOpen) {
    if (!existing) returnFocus = focused;
    overlay.hidden = false;
    base.inert = true;
    panelOpen = true;
  }
  if (changeMode || !panelTimeline) {
    panelMode = mode;
    createPanelTimeline(mode);
    if (existing && panelTimeline) panelTimeline.progress(1).pause();
  }
  if (animate()) panelTimeline.timeScale(1).play();
  else { panelTimeline?.progress(1).pause(); panel.style.transform = 'none'; panel.style.opacity = '1'; document.querySelector('#scrim').style.opacity = '1'; }
  const replacement = preserve && focused?.dataset.action ? [...panel.querySelectorAll('[data-action]')].find(button => button.dataset.action === focused.dataset.action && button.dataset.id === focused.dataset.id && button.dataset.step === focused.dataset.step) : null;
  (replacement || panel).focus({ preventScroll: true });
}
function closePanel() {
  if (!panelOpen) return;
  panelOpen = false;
  if (animate() && panelTimeline.progress() > 0) panelTimeline.timeScale(1.35).reverse();
  else finishClose();
}
function finishClose() {
  if (panelOpen) return;
  overlay.hidden = true;
  base.inert = false;
  currentView = '';
  panelTimeline?.timeScale(1);
  if (returnFocus?.isConnected && !overlay.contains(returnFocus)) returnFocus.focus({ preventScroll: true });
  else document.querySelector('.wordmark').focus({ preventScroll: true });
}
function emptyState(title, description, action = 'products', label = 'Browse the collection', symbol = 'shopping-bag') {
  return `<div class="empty-state">${icon(symbol)}<h3>${escape(title)}</h3><p>${escape(description)}</p><button class="secondary-button" data-action="${action}">${escape(label)}</button></div>`;
}
function catalogRow(product) {
  return `<article class="catalog-row"><button class="catalog-photo" data-action="choose" data-id="${product.id}" aria-label="View ${product.name}">${image(product.id)}</button><div class="catalog-row-copy"><button class="catalog-title" data-action="choose" data-id="${product.id}">${product.name}</button><p>${product.material}</p><strong>${price(product.price)}</strong></div>${favoriteButton(product.id)}<button class="catalog-add" data-action="add-item" data-id="${product.id}" aria-label="Add ${product.name} to cart">${icon('plus')}</button></article>`;
}
function showProducts() {
  openPanel('Our collection', `<nav class="dialog-navigation" aria-label="Store information"><button data-action="about">About us</button><button data-action="pricing">Pricing</button><button data-action="contact">Contact</button></nav>${products.map(catalogRow).join('')}`, '', 'products');
}
function showAbout() {
  openPanel('About Design', `<h3 class="panel-lead">A little character.<br>A room of your own.</h3><div class="panel-copy"><p>Our collection brings together quiet shapes, tactile materials and furniture made for everyday living.</p><h3>Considered materials</h3><p>Soft leather, woven upholstery and clean metal finishes. Each piece is selected to sit naturally alongside the things you already love.</p><h3>Made to feel at home</h3><p>Choose a comfortable seat. Add a reading light. Keep the rest simple.</p></div>`, '<button class="primary-button" data-action="products">Explore the collection</button>', 'about');
}
function showPricing() {
  openPanel('Pricing & delivery', `<div class="panel-copy"><p>Clear prices, with no surprises. All listed prices include VAT.</p></div><table class="price-table"><thead><tr><th>Product</th><th>Price</th></tr></thead><tbody>${products.map(product => `<tr><td><button data-action="choose" data-id="${product.id}">${product.name}</button><small>${product.material}</small></td><td>${price(product.price)}</td></tr>`).join('')}</tbody></table><div class="summary-row"><span>Standard delivery</span><span>19 €</span></div><div class="summary-row"><span>Orders from 500 €</span><span>Free delivery</span></div><div class="panel-copy"><p style="margin-top:17px">Delivery options and dates are confirmed at checkout.</p></div>`, '<button class="primary-button" data-action="products">Find your piece</button>', 'pricing');
}
function showCart() {
  const entries = Object.entries(state.cart);
  if (!entries.length) { openPanel('Your cart', emptyState('A little room for something new', 'Your selected pieces will appear here.'), '', 'cart', 'drawer'); return; }
  const { total } = cartTotals();
  const delivery = total >= 500 ? 0 : 19;
  const rows = entries.map(([id, count]) => `<article class="catalog-row cart-row"><span class="catalog-photo">${image(id)}</span><div class="cart-row-copy"><h3>${byId[id].name}</h3><p>${byId[id].color}</p><div class="quantity-control"><button data-action="quantity" data-id="${id}" data-step="-1" aria-label="Reduce ${byId[id].name} quantity">${icon('minus')}</button><output aria-label="${byId[id].name} quantity">${count}</output><button data-action="quantity" data-id="${id}" data-step="1" aria-label="Increase ${byId[id].name} quantity" ${count >= 9 ? 'disabled' : ''}>${icon('plus')}</button></div></div><div class="cart-row-price">${price(byId[id].price * count)}<button class="remove-button" data-action="remove" data-id="${id}" aria-label="Remove ${byId[id].name}">${icon('trash')}</button></div></article>`).join('');
  openPanel('Your cart', `${rows}<p class="cart-note">Take your time. Your room, your choice.</p>`, `<div class="summary-row"><span>Subtotal</span><span>${price(total)}</span></div><div class="summary-row"><span>Delivery</span><span>${delivery ? price(delivery) : 'Free'}</span></div><div class="summary-row total"><span>Total</span><strong>${price(total + delivery)}</strong></div><button class="primary-button" data-action="checkout">Continue to checkout ${icon('arrow-right')}</button>`, 'cart', 'drawer');
}
function showFavorites() {
  const saved = products.filter(product => state.favorites.has(product.id));
  openPanel('Saved items', saved.length ? saved.map(catalogRow).join('') : emptyState('Keep a few favourites', 'Save a piece with the heart button to find it here.', 'products', 'Browse the collection', 'heart'), '', 'favorites');
}
function showAccount() {
  const { count } = cartTotals();
  openPanel('Your space', `<h3 class="panel-lead">Make yourself at home.</h3><div class="account-links"><button class="account-link" data-action="favorites">${icon('heart')}<strong>${state.favorites.size}</strong><small>Saved pieces</small></button><button class="account-link" data-action="cart">${icon('shopping-bag')}<strong>${count}</strong><small>Items in your cart</small></button></div><div class="panel-copy"><p>Browse your saved pieces or finish putting your room together.</p></div>`, '<button class="secondary-button" data-action="sign-in">Sign in to your account</button>', 'account');
}
function showSearch() {
  openPanel('Find your piece', `<label class="search-field">${icon('search')}<input id="product-search" type="search" placeholder="Try armchair, leather or lamp" aria-label="Search products" enterkeyhint="search" autocomplete="off"></label><p class="result-label" id="result-label">3 pieces in the collection</p><div id="search-results">${products.map(catalogRow).join('')}</div>`, '', 'search');
  document.querySelector('#product-search').focus({ preventScroll: true });
}
function showReviews() {
  const product = byId[state.selected];
  const reviews = [ { name: 'Alex R.', rating: 5, text: product.id === 'lamp' ? 'The light is just right for reading. Simple, well proportioned and easy to place.' : 'A beautifully shaped chair. Comfortable from the first evening and a lovely fit for our sitting room.', date: 'October 28, 2026' }, { name: 'Jamie L.', rating: 5, text: 'The finish feels thoughtful. It adds character without making the room feel busy.', date: 'October 19, 2026' }, { name: 'Sam T.', rating: 4, text: 'A good everyday piece. The size and materials were exactly what I was looking for.', date: 'October 11, 2026' } ];
  openPanel('Reviews', `<div class="review-summary"><strong>${product.rating}</strong><div>${stars(product.rating)}<p>${product.reviews} reviews · ${product.name}</p></div></div>${reviews.map(review => `<article class="review-entry"><header><strong>${review.name}</strong>${stars(review.rating)}</header><p>${review.text}</p><time>${review.date}</time></article>`).join('')}`, '', 'reviews');
}
function showContact() {
  const saved = state.enquiry;
  openPanel('Contact us', `<div class="contact-details">${icon('clock')}Monday–Friday, 9:00–17:00</div><div class="panel-copy"><p>A question about a piece, its size or its finish? Leave your details and prepare an enquiry.</p></div><form id="contact-form"><div class="form-grid"><div class="form-field"><label for="contact-name">Your name</label><input id="contact-name" name="name" required maxlength="60" autocomplete="name" value="${escape(saved?.name || '')}"></div><div class="form-field"><label for="contact-email">Email address</label><input id="contact-email" name="email" type="email" required maxlength="100" autocomplete="email" value="${escape(saved?.email || '')}"></div></div><div class="form-field"><label for="contact-message">Your message</label><textarea id="contact-message" name="message" required maxlength="1000" placeholder="How can we help?">${escape(saved?.message || '')}</textarea></div><p class="form-error" id="contact-error" role="alert"></p></form>`, '<button type="submit" form="contact-form" class="primary-button">Save enquiry</button>', 'contact');
}

showroom.addEventListener('click', event => {
  const button = event.target.closest('[data-action]');
  if (!button || button.disabled) return;
  const { action, id } = button.dataset;
  switch (action) {
    case 'home': closePanel(); selectProduct('cognac'); break;
    case 'select': selectProduct(id); break;
    case 'choose': selectProduct(id); closePanel(); break;
    case 'main-favorite': toggleFavorite(state.selected, button); break;
    case 'favorite': toggleFavorite(id, button); break;
    case 'add': addToCart(state.selected, button); break;
    case 'add-item': addToCart(id, button); break;
    case 'cart': showCart(); break;
    case 'quantity': {
      state.cart[id] = Math.min(9, (state.cart[id] || 0) + Number(button.dataset.step));
      if (state.cart[id] <= 0) delete state.cart[id];
      updateCartIndicators(); showCart(); break;
    }
    case 'remove': delete state.cart[id]; updateCartIndicators(); showCart(); break;
    case 'products': showProducts(); break;
    case 'about': showAbout(); break;
    case 'pricing': showPricing(); break;
    case 'contact': showContact(); break;
    case 'reviews': showReviews(); break;
    case 'account': showAccount(); break;
    case 'favorites': showFavorites(); break;
    case 'search': showSearch(); break;
    case 'close': closePanel(); break;
    case 'checkout': toast('Checkout needs a connected payment service', 'credit-card'); break;
    case 'sign-in': toast('Connect the account service to sign in', 'user'); break;
  }
});
showroom.addEventListener('input', event => {
  if (event.target.id !== 'product-search') return;
  const query = event.target.value.trim().toLowerCase();
  const results = products.filter(product => `${product.name} ${product.material} ${product.color}`.toLowerCase().includes(query));
  document.querySelector('#result-label').textContent = `${results.length} ${results.length === 1 ? 'piece' : 'pieces'} found`;
  document.querySelector('#search-results').innerHTML = results.length ? results.map(catalogRow).join('') : emptyState('No matching pieces', 'Try armchair, grey, leather or lamp.', 'products', 'View all products', 'search');
});
showroom.addEventListener('submit', event => {
  if (event.target.id !== 'contact-form') return;
  event.preventDefault();
  const form = event.target;
  const data = { name: form.elements.name.value.trim(), email: form.elements.email.value.trim(), message: form.elements.message.value.trim() };
  if (!data.name || !data.message) { document.querySelector('#contact-error').textContent = 'Please add your name and a message.'; return; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) { document.querySelector('#contact-error').textContent = 'Please enter a valid email address.'; return; }
  state.enquiry = data;
  openPanel('Your enquiry', `<h3 class="panel-lead">Ready when you are.</h3><div class="panel-copy"><p>Your enquiry has been prepared. Connect the messaging service to send it to the team.</p></div><div class="summary-row"><span>Name</span><span>${escape(data.name)}</span></div><div class="summary-row"><span>Email</span><span>${escape(data.email)}</span></div><div class="panel-copy"><p style="margin-top:16px;white-space:pre-wrap">${escape(data.message)}</p></div>`, '<button class="secondary-button" data-action="contact">Edit enquiry</button>', 'enquiry');
});
showroom.addEventListener('error', event => {
  if (event.target instanceof HTMLImageElement) { event.target.classList.add('image-unavailable'); event.target.alt = 'Product image unavailable'; }
}, true);
document.addEventListener('keydown', event => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); showSearch(); return; }
  if (!panelOpen) return;
  if (event.key === 'Escape') { event.preventDefault(); closePanel(); }
  if (event.key === 'Tab') {
    const buttons = [...panel.querySelectorAll('button:not(:disabled), input, textarea, a[href]')].filter(item => item.getClientRects().length);
    const first = buttons[0];
    const last = buttons.at(-1);
    if (!first) { event.preventDefault(); return; }
    if (event.shiftKey && (document.activeElement === first || document.activeElement === panel)) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && (document.activeElement === last || document.activeElement === panel)) { event.preventDefault(); first.focus(); }
  }
});
window.addEventListener('gsap-ready', () => {
  if (panelOpen && !panelTimeline) { createPanelTimeline(panelMode); panelTimeline.progress(1).pause(); }
});
reducedMotion.addEventListener('change', () => {
  if (!reducedMotion.matches) return;
  productTransition?.progress(1);
  toastTween?.progress(1);
  panelTimeline?.progress(panelOpen ? 1 : 0).pause();
  if (!panelOpen) finishClose();
});
renderSelected();
if (animate()) {
  window.gsap.timeline({ defaults: { ease: 'power3.out' } })
    .from(hero, { x: -14, opacity: .5, duration: .65 }, 0)
    .from('#product-halo', { scale: .97, opacity: .55, duration: .65 }, 0)
    .from('.product-info', { opacity: 0, duration: .42 }, .08);
}
