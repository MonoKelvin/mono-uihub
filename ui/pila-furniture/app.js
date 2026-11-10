const products = [
  { id: 'pila', name: 'The Classic Pila', maker: 'BLOOEY', category: 'bath', material: 'White marble', price: 980, image: 'assets/pila.webp', alt: 'A white marble T-shaped washbasin with a wide basin and a single rectangular pedestal', description: 'Made by local craftsmen mostly working from their backyards, the classic Pila is an iconic symbol of local design culture and can be found in colonial residences or at the central square', details: 'A generous rectangular basin rests on a single architectural pedestal. Natural white marble brings a quiet, individual character to a familiar everyday form.', dimensions: '90 × 45 × 85 cm', care: 'Clean with a soft cloth and a pH-neutral stone cleaner. Avoid acidic products and abrasive pads. Wipe away standing water to protect the natural finish.' },
  { id: 'chair', name: 'The Linen Chair', maker: 'FURNITURE STUDIO', category: 'living', material: 'Woven linen · solid wood', price: 340, image: 'assets/linen-chair.webp', alt: 'A soft white woven upholstered armchair', description: 'A quiet corner, an unhurried afternoon. Soft woven upholstery and a generous seat make the Linen Chair an easy companion for everyday living.', details: 'A comfortable, generously proportioned armchair with a woven finish. A simple shape that sits naturally in a reading corner or beside a sunny window.', dimensions: '78 × 82 × 92 cm', care: 'Vacuum with a soft upholstery attachment. Blot spills promptly with a clean cloth; do not rub. Keep away from prolonged direct sunlight.' },
  { id: 'table', name: 'The Everyday Table', maker: 'FURNITURE STUDIO', category: 'living', material: 'Natural wood', price: 210, image: 'assets/everyday-table.webp', alt: 'A pale wooden table with a simple rounded rectangular top', description: 'A small gathering place for the things you reach for. A warm wooden surface and an uncomplicated frame, made for the rhythm of daily life.', details: 'A light wooden table with softly rounded corners and an open, practical frame. Room for your morning coffee, a favourite book, or an object worth keeping close.', dimensions: '80 × 50 × 48 cm', care: 'Wipe with a slightly damp cloth and dry immediately. Use coasters for hot or wet objects. Avoid harsh household cleaners.' },
  { id: 'lamp', name: 'The Studio Lamp', maker: 'FURNITURE STUDIO', category: 'living', material: 'Black metal', price: 165, image: 'assets/studio-lamp.webp', alt: 'A black adjustable table lamp with a metal shade and an articulated arm', description: 'A pool of warm light, right where you need it. The Studio Lamp turns a side table into a small evening ritual, with an adjustable arm and a focused glow.', details: 'An articulated metal table lamp with a simple, adjustable shade. Place it beside a chair or on a desk to bring light closer to the things you love.', dimensions: 'Ø 20 × 56 cm', care: 'Unplug before cleaning. Dust the shade and wipe the base with a soft, dry cloth. Bulb is not included.' }
];
const $ = (selector) => document.querySelector(selector);
const cart = new Map();
let activeSlide = 0;
let activeProduct = products[0];
let detailQuantity = 1;
let category = 'all';
let currentView = 'home';
let previousView = '#home';
let toastTimer;
let addTimer;
let pageMotion;
let started = false;
let filmTimeline;
let filmPlaying = false;
let filmProgress = 0;
let filmFrame;
let filmLastTime = 0;
let filmOpen = false;
let filmReturnFocus;
let menuScroll = 0;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const money = (value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
const getProduct = (id) => products.find((product) => product.id === id);
const totalQuantity = () => [...cart.values()].reduce((sum, quantity) => sum + quantity, 0);
const subtotal = () => [...cart].reduce((sum, [id, quantity]) => sum + getProduct(id).price * quantity, 0);

function notify(message) {
  $('#toast').textContent = message;
  $('#toast').classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $('#toast').classList.remove('is-visible'), 2600);
}

function attachImageState(image) {
  image.addEventListener('error', () => {
    image.hidden = true;
    const message = image.parentElement.querySelector('.image-error');
    if (message) message.hidden = false;
  });
  image.addEventListener('load', () => {
    image.hidden = false;
    const message = image.parentElement.querySelector('.image-error');
    if (message) message.hidden = true;
  });
  if (image.complete && !image.naturalWidth) image.dispatchEvent(new Event('error'));
}

function imageMarkup(product) {
  return `<img src="${product.image}" alt="${product.alt}"><span class="image-error" hidden>Image unavailable<button class="retry-image text-link" data-image="${product.id}">Try again</button></span>`;
}

function updateCartCount() {
  const count = totalQuantity();
  $('#cart-count').textContent = count || '';
  $('#cart-count').classList.toggle('has-items', count > 0);
  $('.cart-link').setAttribute('aria-label', `Shopping bag, ${count} ${count === 1 ? 'item' : 'items'}`);
}

function addToCart(id, quantity = 1, button) {
  const product = getProduct(id);
  const oldQuantity = cart.get(id) || 0;
  if (oldQuantity + quantity > 9) {
    notify('You can add up to 9 of each object.');
    return;
  }
  cart.set(id, oldQuantity + quantity);
  updateCartCount();
  invalidateReview();
  if (button === $('#hero-add')) {
    $('#hero-add span').textContent = 'ADDED TO CART';
    $('#hero-add').classList.add('is-added');
    clearTimeout(addTimer);
    addTimer = setTimeout(resetHeroAdd, 2000);
  }
  if (window.gsap && !reducedMotion.matches) gsap.to('.bag-mark', { y: -4, duration: .15, yoyo: true, repeat: 1, ease: 'power2.out', overwrite: 'auto' });
  notify(`${product.name} added to your bag.`);
  if (currentView === 'product') updateQuantityButtons();
}

function resetHeroAdd() {
  $('#hero-add span').textContent = 'ADD TO CART';
  $('#hero-add').classList.remove('is-added');
}

function showSlide(index, direction = 1) {
  activeSlide = (index + products.length) % products.length;
  const product = products[activeSlide];
  $('#hero-title').textContent = product.name;
  $('#hero-maker').textContent = product.maker === 'BLOOEY' ? 'BLOOEY' : 'STUDIO';
  $('#hero-description').textContent = product.description;
  $('#hero-add').dataset.add = product.id;
  clearTimeout(addTimer);
  resetHeroAdd();
  $('#hero-product').src = product.image;
  $('#hero-product').alt = product.alt;
  $('#hero-product-link').href = `#product/${product.id}`;
  $('#hero-product-link').dataset.product = product.id;
  $('#hero-product-link').setAttribute('aria-label', `View ${product.name}`);
  $('#film-open').setAttribute('aria-label', `Play ${product.name} material story`);
  $('#current-slide').textContent = String(activeSlide + 1).padStart(2, '0');
  $('.slide-index').setAttribute('aria-label', `Product ${activeSlide + 1} of 4`);
  $('#slide-progress').style.transform = innerWidth <= 760 ? `translateX(${activeSlide * 12}px)` : `translateY(${activeSlide * 26}px)`;
  $('#share-panel .label').textContent = product.name.toUpperCase();
  $('#share-panel').hidden = true;
  $('#share-toggle').setAttribute('aria-expanded', 'false');
  if (window.gsap && !reducedMotion.matches) {
    if (!gsap.isTweening('#hero-product')) gsap.set('#hero-product', { opacity: .25, x: direction * 24 });
    gsap.to('#hero-product', { opacity: 1, x: 0, duration: .45, ease: 'power3.out', overwrite: 'auto' });
  }
}

function renderCollection() {
  const query = $('#collection-search').value.trim().toLowerCase();
  const filtered = products.filter((product) => (category === 'all' || product.category === category) && `${product.name} ${product.material} ${product.maker}`.toLowerCase().includes(query));
  $('#product-grid').innerHTML = filtered.map((product) => `<a class="product-card" href="#product/${product.id}"><div class="card-image">${imageMarkup(product)}</div><div class="card-info"><div><h2>${product.name}</h2><p>${product.material}</p></div><span class="card-price">${money(product.price)}</span></div></a>`).join('');
  $('#search-empty').hidden = filtered.length > 0;
  $('#results-status').textContent = `${filtered.length} objects found`;
  $('#product-grid').querySelectorAll('img').forEach(attachImageState);
  $('.collection-total').textContent = `${String(filtered.length).padStart(2, '0')} ${filtered.length === 1 ? 'OBJECT' : 'OBJECTS'}`;
}

function updateQuantityButtons() {
  $('#detail-quantity').textContent = detailQuantity;
  $('#detail-minus').disabled = detailQuantity <= 1;
  const remaining = 9 - (cart.get(activeProduct.id) || 0);
  $('#detail-plus').disabled = detailQuantity >= Math.max(1, remaining);
  $('#detail-add').disabled = remaining === 0 || detailQuantity > remaining;
  $('#detail-add').textContent = remaining === 0 ? 'MAXIMUM ADDED TO BAG' : 'ADD TO CART';
  if (remaining > 0) $('#detail-add').insertAdjacentHTML('beforeend', '<i class="ti ti-arrow-narrow-right" aria-hidden="true"></i>');
}

function renderProduct(id) {
  activeProduct = getProduct(id);
  if (!activeProduct) { location.hash = '#collection'; return; }
  detailQuantity = 1;
  $('#detail-image').innerHTML = imageMarkup(activeProduct);
  attachImageState($('#detail-image img'));
  $('#detail-maker').textContent = activeProduct.maker;
  $('#detail-title').textContent = activeProduct.name;
  $('#detail-price').textContent = money(activeProduct.price);
  $('#detail-description').textContent = activeProduct.details;
  $('#detail-material').textContent = activeProduct.material;
  $('#detail-availability').textContent = 'Availability and delivery confirmed by the studio.';
  $('#detail-specifications').innerHTML = `<div><dt>Dimensions</dt><dd>${activeProduct.dimensions}</dd></div><div><dt>Material</dt><dd>${activeProduct.material}</dd></div>`;
  $('#detail-care').textContent = activeProduct.care;
  $('.care-details').open = false;
  updateQuantityButtons();
}

function renderCart() {
  const empty = !cart.size;
  $('#cart-empty').hidden = !empty;
  $('#cart-filled').hidden = empty;
  $('#cart-items').innerHTML = [...cart].map(([id, quantity]) => {
    const product = getProduct(id);
    return `<article class="cart-item"><a href="#product/${id}" class="cart-item-image" aria-label="View ${product.name}">${imageMarkup(product)}</a><div><a href="#product/${id}"><h2>${product.name}</h2></a><p class="item-material">${product.material}</p><div class="cart-item-actions"><div class="quantity-control"><button data-cart-minus="${id}" aria-label="Decrease ${product.name} quantity" ${quantity <= 1 ? 'disabled' : ''}><i class="ti ti-minus" aria-hidden="true"></i></button><output aria-label="${product.name} quantity">${quantity}</output><button data-cart-plus="${id}" aria-label="Increase ${product.name} quantity" ${quantity >= 9 ? 'disabled' : ''}><i class="ti ti-plus" aria-hidden="true"></i></button></div><button class="remove-item" data-remove="${id}">Remove</button></div></div><span class="item-total">${money(product.price * quantity)}</span></article>`;
  }).join('');
  $('#cart-items').querySelectorAll('img').forEach(attachImageState);
  $('#cart-subtotal').textContent = money(subtotal());
  $('#cart-total').textContent = money(subtotal());
}

function invalidateReview() {
  $('#order-review').hidden = true;
  $('#download-status').textContent = '';
}

function renderCheckout() {
  if (!cart.size) { location.hash = '#cart'; return; }
  $('#checkout-items').innerHTML = [...cart].map(([id, quantity]) => `<div class="checkout-item"><div>${getProduct(id).name}<br><span>Quantity ${quantity}</span></div><strong>${money(getProduct(id).price * quantity)}</strong></div>`).join('');
  $('#checkout-total').textContent = money(subtotal());
}

function setPageMotion() {
  pageMotion?.revert();
  pageMotion = undefined;
  if (!window.gsap || !window.ScrollTrigger || reducedMotion.matches) return;
  gsap.registerPlugin(ScrollTrigger);
  pageMotion = gsap.context(() => {
    if (currentView === 'home') {
      gsap.fromTo('.story-image img', { scale: 1.18 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: '.story-section', start: 'top 90%', end: 'center center', scrub: true } });
      gsap.from('.story-copy', { x: 24, opacity: 0, duration: .65, ease: 'power3.out', scrollTrigger: { trigger: '.story-copy', start: 'top 85%', once: true } });
      gsap.from('.collection-invitation h2', { clipPath: 'inset(0 0 100% 0)', duration: .7, ease: 'power3.out', scrollTrigger: { trigger: '.collection-invitation', start: 'top 85%', once: true } });
    }
    if (currentView === 'story') {
      gsap.fromTo('.story-wide-image img', { scale: 1.18 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: '.story-wide-image', start: 'top bottom', end: 'bottom center', scrub: true } });
    }
  }, $('#main'));
  document.fonts.ready.then(() => ScrollTrigger.refresh());
}

function route() {
  const hash = location.hash.slice(1) || 'home';
  const [view, id] = hash.split('/');
  const allowed = ['home', 'menu', 'collection', 'product', 'cart', 'checkout', 'story'];
  if (!allowed.includes(view)) { location.hash = '#home'; return; }
  if (filmOpen) closeFilm();
  $('#share-panel').hidden = true;
  $('#share-toggle').setAttribute('aria-expanded', 'false');
  pageMotion?.revert();
  pageMotion = undefined;
  document.querySelectorAll('.view').forEach((element) => { element.hidden = element.id !== `${view}-view`; });
  const leavingMenu = currentView === 'menu';
  currentView = view;
  document.body.dataset.view = view;
  const menu = view === 'menu';
  $('#menu-toggle').setAttribute('aria-expanded', String(menu));
  $('#menu-toggle').setAttribute('aria-label', menu ? 'Close menu' : 'Open menu');
  $('#menu-label').textContent = menu ? 'CLOSE' : 'MENU';
  if (view === 'collection') renderCollection();
  if (view === 'product') renderProduct(id);
  if (view === 'cart') renderCart();
  if (view === 'checkout') renderCheckout();
  document.title = view === 'product' && activeProduct ? `FURNiTURE — ${activeProduct.name}` : `FURNiTURE — ${view === 'home' ? 'The Classic Pila' : ({ collection: 'The Collection', cart: 'Shopping Bag', checkout: 'Make It Yours', story: 'Our Story', menu: 'Discover' })[view]}`;
  window.scrollTo({ top: leavingMenu && location.hash === previousView ? menuScroll : 0, behavior: 'instant' });
  if (view !== 'home' || started) $('#main').focus({ preventScroll: true });
  setPageMotion();
}

function updateFilm(progress) {
  filmProgress = progress;
  $('#film-progress').value = progress;
  const seconds = Math.min(12, Math.floor(progress * 12));
  $('#film-time').textContent = `00:${String(seconds).padStart(2, '0')} / 00:12`;
  const chapter = progress < 1 / 3 ? 0 : progress < 2 / 3 ? 1 : 2;
  const product = products[activeSlide];
  const chapters = [
    ['01 / THE FORM', 'A familiar form.', product.id === 'pila' ? 'A wide, generous basin. One sculptural pedestal.' : product.details],
    ['02 / THE MATERIAL', product.id === 'pila' ? 'Naturally individual.' : 'Honest materials.', product.id === 'pila' ? 'The soft movement of marble. A surface with its own character.' : product.material + '. A simple material, thoughtfully considered.'],
    ['03 / THE EVERYDAY', 'Made to live with.', 'An ordinary moment, made a little more considered.']
  ];
  $('#film-chapter').textContent = chapters[chapter][0];
  $('#film-title').textContent = chapters[chapter][1];
  $('#film-description').textContent = chapters[chapter][2];
}

function updateFilmButton() {
  $('#film-play').setAttribute('aria-label', filmPlaying ? 'Pause material story' : filmProgress >= 1 ? 'Replay material story' : 'Play material story');
  $('#film-play').innerHTML = `<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="${filmPlaying ? 'M6 5h4v14H6zM14 5h4v14h-4z' : 'M8 5v14l11-7z'}" fill="currentColor"/></svg>`;
}

function tickFilm(time) {
  if (!filmOpen || !filmPlaying || filmTimeline) return;
  if (filmLastTime) updateFilm(Math.min(1, filmProgress + (time - filmLastTime) / 12000));
  filmLastTime = time;
  if (filmProgress < 1) filmFrame = requestAnimationFrame(tickFilm);
  else { filmPlaying = false; updateFilmButton(); }
}

function createFilmTimeline() {
  if (!window.gsap || reducedMotion.matches || filmTimeline) return;
  const progressState = { value: 0 };
  filmTimeline = gsap.timeline({ paused: true, onUpdate: () => updateFilm(filmTimeline.progress()), onComplete: () => { filmPlaying = false; updateFilmButton(); } });
  filmTimeline.to(progressState, { value: 1, duration: 12, ease: 'none' }, 0)
    .to('#film-image', { scale: 1.22, xPercent: -4, duration: 4, ease: 'power1.inOut' }, 0)
    .to('#film-image', { scale: 1.75, xPercent: 10, yPercent: -5, duration: 4, ease: 'power1.inOut' }, 4)
    .to('#film-image', { scale: 1, xPercent: 0, yPercent: 0, duration: 4, ease: 'power1.inOut' }, 8);
}

function openFilm() {
  filmReturnFocus = document.activeElement;
  filmOpen = true;
  const product = products[activeSlide];
  $('#film-image').src = product.image;
  $('#film-image').alt = product.alt;
  $('#film-layer').hidden = false;
  $('#main').inert = true;
  $('.site-header').inert = true;
  $('.site-footer').inert = true;
  document.body.style.overflow = 'hidden';
  $('#film-close').focus();
  updateFilm(0);
  createFilmTimeline();
  filmPlaying = true;
  filmLastTime = 0;
  if (filmTimeline) filmTimeline.restart();
  else filmFrame = requestAnimationFrame(tickFilm);
  updateFilmButton();
}

function closeFilm() {
  filmOpen = false;
  filmPlaying = false;
  filmTimeline?.pause(0);
  cancelAnimationFrame(filmFrame);
  $('#film-layer').hidden = true;
  $('#main').inert = false;
  $('.site-header').inert = false;
  $('.site-footer').inert = false;
  document.body.style.overflow = '';
  filmReturnFocus?.focus({ preventScroll: true });
}

function start() {
  if (started) return;
  route();
  started = true;
  document.querySelectorAll('img').forEach(attachImageState);
  $('#menu-toggle').addEventListener('click', () => {
    if (currentView === 'menu') location.hash = previousView;
    else { previousView = location.hash || '#home'; menuScroll = window.scrollY; location.hash = '#menu'; }
  });
  $('#next-slide').addEventListener('click', () => showSlide(activeSlide + 1, 1));
  $('#previous-slide').addEventListener('click', () => showSlide(activeSlide - 1, -1));
  $('#hero-add').addEventListener('click', () => addToCart($('#hero-add').dataset.add, 1, $('#hero-add')));
  $('#detail-add').addEventListener('click', () => addToCart(activeProduct.id, detailQuantity));
  $('#detail-minus').addEventListener('click', () => { detailQuantity = Math.max(1, detailQuantity - 1); updateQuantityButtons(); });
  $('#detail-plus').addEventListener('click', () => { detailQuantity = Math.min(9 - (cart.get(activeProduct.id) || 0), detailQuantity + 1); updateQuantityButtons(); });
  $('#collection-search').addEventListener('input', renderCollection);
  $('.category-filters').addEventListener('click', (event) => {
    const button = event.target.closest('[data-filter]');
    if (!button) return;
    category = button.dataset.filter;
    $('.category-filters').querySelectorAll('button').forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
    renderCollection();
  });
  $('#clear-search').addEventListener('click', () => { $('#collection-search').value = ''; category = 'all'; $('.category-filters').querySelectorAll('button').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.filter === 'all'))); renderCollection(); $('#collection-search').focus(); });
  $('#cart-items').addEventListener('click', (event) => {
    const button = event.target.closest('button');
    if (!button) return;
    const id = button.dataset.cartMinus || button.dataset.cartPlus || button.dataset.remove;
    if (!id || !cart.has(id)) return;
    const quantity = cart.get(id);
    if (button.dataset.remove) cart.delete(id);
    else cart.set(id, Math.min(9, Math.max(1, quantity + (button.dataset.cartPlus ? 1 : -1))));
    invalidateReview();
    renderCart();
    updateCartCount();
    const action = button.dataset.cartPlus ? 'data-cart-plus' : button.dataset.cartMinus ? 'data-cart-minus' : 'data-remove';
    const replacement = $(`[${action}="${id}"]`);
    if (replacement && !replacement.disabled) replacement.focus({ preventScroll: true });
    else ($('#cart-filled').hidden ? $('#cart-empty a') : $('#cart-filled a')).focus({ preventScroll: true });
  });
  $('#main').addEventListener('click', (event) => {
    const retry = event.target.closest('.retry-image');
    if (!retry) return;
    event.preventDefault();
    const image = retry.parentElement.parentElement.querySelector('img');
    const product = getProduct(retry.dataset.image);
    retry.textContent = 'Loading…';
    retry.disabled = true;
    image.addEventListener('load', () => { retry.textContent = 'Try again'; retry.disabled = false; }, { once: true });
    image.addEventListener('error', () => { retry.textContent = 'Try again'; retry.disabled = false; }, { once: true });
    image.src = `${product.image}?retry=${Date.now()}`;
  });
  $('#share-toggle').addEventListener('click', () => { const open = $('#share-panel').hidden; $('#share-panel').hidden = !open; $('#share-toggle').setAttribute('aria-expanded', String(open)); $('#share-status').textContent = ''; $('#share-url').hidden = true; if (open) $('#copy-link').focus(); });
  $('#copy-link').addEventListener('click', async () => {
    const url = new URL(location.href);
    url.hash = `product/${products[activeSlide].id}`;
    try { await navigator.clipboard.writeText(url.href); $('#share-status').textContent = 'Product link copied.'; }
    catch { $('#share-url').value = url.href; $('#share-url').hidden = false; $('#share-url').focus(); $('#share-url').select(); $('#share-status').textContent = 'Copy this link to share the object.'; }
  });
  document.addEventListener('click', (event) => { if (!event.target.closest('#share-panel, #share-toggle') && !$('#share-panel').hidden) { $('#share-panel').hidden = true; $('#share-toggle').setAttribute('aria-expanded', 'false'); } });
  $('#film-open').addEventListener('click', openFilm);
  $('#film-close').addEventListener('click', closeFilm);
  $('#film-scrim').addEventListener('click', closeFilm);
  $('#film-play').addEventListener('click', () => {
    filmPlaying = !filmPlaying;
    if (filmPlaying) {
      if (filmProgress >= 1) { updateFilm(0); filmTimeline?.pause(0); }
      filmLastTime = 0;
      if (filmTimeline) filmTimeline.play(); else filmFrame = requestAnimationFrame(tickFilm);
    } else { filmTimeline?.pause(); cancelAnimationFrame(filmFrame); }
    updateFilmButton();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      if (filmOpen) closeFilm();
      else if (!$('#share-panel').hidden) { $('#share-panel').hidden = true; $('#share-toggle').setAttribute('aria-expanded', 'false'); $('#share-toggle').focus(); }
      else if (currentView === 'menu') location.hash = previousView;
    }
    if (filmOpen && event.key === 'Tab') {
      const first = $('#film-close'), last = $('#film-play');
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
    if (currentView === 'home' && !filmOpen && !event.target.closest('input, textarea, button, a') && ['ArrowRight', 'ArrowLeft'].includes(event.key)) { event.preventDefault(); showSlide(activeSlide + (event.key === 'ArrowRight' ? 1 : -1), event.key === 'ArrowRight' ? 1 : -1); }
  });
  $('#checkout-form').addEventListener('input', (event) => {
    invalidateReview();
    const input = event.target;
    if (input.name) { input.removeAttribute('aria-invalid'); $(`#${input.name}-error`).textContent = ''; }
  });
  $('#checkout-form').addEventListener('submit', (event) => {
    event.preventDefault();
    if (!cart.size) { location.hash = '#cart'; return; }
    let firstInvalid;
    [...$('#checkout-form').elements].filter((element) => element.tagName === 'INPUT').forEach((input) => {
      const invalid = !input.value.trim() || !input.validity.valid;
      input.setAttribute('aria-describedby', `${input.name}-error`);
      input.setAttribute('aria-invalid', String(invalid));
      $(`#${input.name}-error`).textContent = invalid ? input.name === 'email' ? 'Enter a valid email address.' : 'Please complete this field.' : '';
      if (invalid && !firstInvalid) firstInvalid = input;
    });
    if (firstInvalid) { firstInvalid.focus(); return; }
    const data = new FormData($('#checkout-form'));
    $('#review-contact').textContent = `${data.get('name')} · ${data.get('email')} · ${data.get('address')}, ${data.get('city')} ${data.get('postal')}`;
    $('#order-review').hidden = false;
    $('#order-review').scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth', block: 'center' });
  });
  $('#download-order').addEventListener('click', () => {
    if ($('#order-review').hidden || !cart.size) return;
    const data = new FormData($('#checkout-form'));
    const lines = ['FURNITURE — SELECTION DETAILS', '', ...[...cart].map(([id, quantity]) => `${getProduct(id).name} | ${getProduct(id).material} | ${quantity} × ${money(getProduct(id).price)} | ${money(getProduct(id).price * quantity)}`), '', `Subtotal: ${money(subtotal())}`, 'Delivery: to be confirmed by the studio', '', `Name: ${data.get('name')}`, `Email: ${data.get('email')}`, `Address: ${data.get('address')}, ${data.get('city')} ${data.get('postal')}`, '', 'This document is a selection summary, not an order confirmation. No order has been placed and no payment has been taken.'];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'furniture-selection.txt';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    $('#download-status').textContent = 'Your selection details are ready to download.';
  });
  window.addEventListener('hashchange', route);
  window.addEventListener('resize', () => { $('#slide-progress').style.transform = innerWidth <= 760 ? `translateX(${activeSlide * 12}px)` : `translateY(${activeSlide * 26}px)`; });
  reducedMotion.addEventListener('change', () => {
    setPageMotion();
    if (filmTimeline) { filmTimeline.kill(); filmTimeline = undefined; }
    if (window.gsap) gsap.set('#film-image', { clearProps: 'transform' });
    if (filmOpen && filmPlaying) { filmLastTime = 0; cancelAnimationFrame(filmFrame); filmFrame = requestAnimationFrame(tickFilm); }
  });
  window.addEventListener('pagehide', () => { pageMotion?.revert(); filmTimeline?.pause(); cancelAnimationFrame(filmFrame); clearTimeout(toastTimer); clearTimeout(addTimer); });
  window.addEventListener('pageshow', (event) => { if (event.persisted) { setPageMotion(); if (filmOpen && filmPlaying) { if (filmTimeline) filmTimeline.play(); else { filmLastTime = 0; filmFrame = requestAnimationFrame(tickFilm); } } } });
  if (window.gsap && !reducedMotion.matches && currentView === 'home') {
    gsap.from('#hero-product', { x: 24, opacity: .2, duration: .55, ease: 'power3.out' });
  }
}
start();
