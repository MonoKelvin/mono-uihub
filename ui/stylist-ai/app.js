'use strict';
(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const canvas = $('#canvas');
  const workspace = $('#workspace');
  const heart = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/></svg>';
  const products = [
    { id: 'satin', name: 'Satin Shirt Dress', price: 59, category: 'Dresses', subtitle: 'Satin finish', image: 'satin-shirt-dress.png', cutout: true, description: 'Midi design. Flared design. Flowy fabric. Shirt-style. Satin finish.', colors: ['blue', 'black', 'white'] },
    { id: 'night', name: 'Night Business Dress', price: 230, category: 'Dresses', subtitle: 'Pleated Skirt', image: 'night-business-dress.jpg', description: 'A tailored silhouette. Notched collar. Soft pleats and a flattering waist.', colors: ['black'] },
    { id: 'winter', name: 'White Winter Belt Dress', price: 215, category: 'Dresses', subtitle: 'Adjustable Belt', image: 'white-belt-dress.jpg', description: 'Soft winter knit. Relaxed sleeves. A warm, comfortable fit with a waist belt.', colors: ['white'] },
    { id: 'red', name: 'Red Dress With Flounces', price: 205, category: 'Dresses', subtitle: 'Classic Collar', image: 'red-flounce-dress.jpg', description: 'Easy summer shape. Short sleeves. A classic collar with a playful flared hem.', colors: ['red'] },
    { id: 'sunglasses', name: 'Everyday Sunglasses', price: 45, category: 'Accessories', subtitle: 'Classic frame', image: 'sunglasses.png', cutout: true, description: 'A timeless frame. Lightweight finish. Made for everyday styling.', colors: ['black'] },
    { id: 'belt', name: 'Leather Waist Belt', price: 38, category: 'Accessories', subtitle: 'Adjustable fit', image: 'leather-belt.png', cutout: true, description: 'Smooth leather. A classic buckle. The finishing touch to your favorite dress.', colors: ['brown'] }
  ];
  const state = {
    view: 'shop', product: 'satin', color: 'blue', size: 'S', saved: new Set(['satin', 'night']),
    cart: [{ id: 'night', size: 'S', color: 'black', quantity: 1 }, { id: 'winter', size: 'M', color: 'white', quantity: 1 }],
    category: 'All', query: '', page: 0, promo: false, signedIn: true, name: 'Olivia Wilson', email: 'olivia.wilson@gmail.com',
    preferences: { notifications: true, motion: true, recommendations: true }, occasion: 'Everyday', style: 'Minimal',
    connectionAttempts: 0, stylingBusy: false, stylingError: false, stylingIds: ['night', 'winter'], accountAttempts: 0,
    checkout: { name: 'Olivia Wilson', email: 'olivia.wilson@gmail.com', address: '', city: '', zip: '' }
  };
  let started = false;
  let toastTimer;
  const money = value => '$ ' + value.toLocaleString('en-US', { maximumFractionDigits: 2 });
  const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const productById = id => products.find(product => product.id === id);
  const favorite = (id, className = '') => `<button class="favorite-button ${className} ${state.saved.has(id) ? 'is-saved' : ''}" data-save="${id}" aria-label="${state.saved.has(id) ? 'Remove' : 'Save'} ${escape(productById(id).name)} ${state.saved.has(id) ? 'from' : 'to'} wishlist" aria-pressed="${state.saved.has(id)}">${heart}</button>`;
  const imagePath = product => `assets/${product.image}`;
  function toast(message) {
    const element = $('#toast');
    element.textContent = message;
    element.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => element.classList.remove('is-visible'), 2700);
  }
  function updateBagCount() {
    const count = state.cart.reduce((total, item) => total + item.quantity, 0);
    $('#bag-count').textContent = count;
    $('.bag-button').setAttribute('aria-label', `Shopping bag, ${count} items`);
  }
  function setView(view, { reset = true, focus = false } = {}) {
    if (reset && ['catalog', 'accessories'].includes(view)) {
      state.query = '';
      $('#search').value = '';
      state.page = 0;
      state.category = view === 'accessories' ? 'Accessories' : 'All';
    }
    state.view = view;
    render();
    if (focus) {
      const heading = $('.view-heading h2, .product-heading h2, .style-intro, .login-panel h3', workspace);
      if (heading) { heading.tabIndex = -1; heading.focus({ preventScroll: true }); }
    }
  }
  function openProduct(id) {
    const product = productById(id);
    if (!product) return;
    state.product = id;
    state.color = product.colors[0];
    state.size = 'S';
    setView('shop');
  }
  function recommendation(product) {
    return `<article class="recommendation-row">
      <button class="recommendation-image" data-product="${product.id}" aria-label="View ${escape(product.name)}"><img src="${imagePath(product)}" alt="${escape(product.name)}"></button>
      <button class="recommendation-name" data-product="${product.id}">${escape(product.name)}<span class="recommendation-subtitle">${escape(product.subtitle)}</span></button>
      <span class="recommendation-price">${money(product.price)}</span>${favorite(product.id, 'row-favorite')}
    </article>`;
  }
  const gem = `<svg class="promo-gem" viewBox="0 0 90 110" aria-hidden="true"><path fill="#c59a55" d="M44 3 73 24 88 66 62 95 42 106 2 78 4 33Z"/><path fill="#f4e1a4" d="M44 3 4 33 26 28 70 27Z"/><path fill="#b38142" d="m4 33 22-5-9 42-15 8Z"/><path fill="#e0bb78" d="m26 28 44-1 18 39-29 12Z"/><path fill="#fffbd4" d="m26 28 44-1-23 44Z"/><path fill="#7f512b" d="m70 27-23 44 41-5Z"/><path fill="#a77134" d="m26 28-9 42 30 1Z"/><path fill="#f0cb8a" d="m17 70 30 1-5 35-40-28Z"/><path fill="#d6a866" d="m47 71 12 7 3 17-20 11Z"/><path fill="#b88643" d="m59 78 29-12-26 29Z"/></svg>`;
  function renderShop() {
    const product = productById(state.product);
    const related = products.filter(item => item.id !== product.id && item.category === 'Dresses').slice(0, 3);
    const heroImage = product.id === 'satin' && state.color !== 'blue' ? `assets/satin-shirt-dress-${state.color}.png` : imagePath(product);
    return `<section class="shop-view" aria-label="${escape(product.name)}">
      <div class="product-stack"><article class="product-card">
        ${favorite(product.id, 'hero-favorite')}
        <div class="product-visual" id="product-visual"><img id="hero-image" src="${heroImage}" alt="${escape(product.name)} in ${state.color}"></div>
        <div class="color-picker" role="radiogroup" aria-label="Dress color">
          ${product.colors.map(color => `<button class="color-swatch" style="--swatch:${({ blue: '#65a6df', black: '#191919', white: '#ffffff', red: '#bd2544', brown: '#94643f' })[color]}" data-color="${color}" role="radio" aria-label="${color}" aria-checked="${state.color === color}"></button>`).join('')}
        </div>
        <div class="product-info"><div class="product-heading"><h2>${escape(product.name)}</h2><span class="product-price">${money(product.price)}</span></div>
          <p class="product-description">${escape(product.description)}</p>
          <div class="purchase-actions">
            <div class="size-select"><button class="size-trigger" id="size-trigger" aria-haspopup="listbox" aria-expanded="false" aria-controls="size-menu"><span class="size-label">SIZE:</span><strong id="selected-size">${state.size}</strong><i class="ti ti-chevron-down" aria-hidden="true"></i></button>
              <div class="size-menu" id="size-menu" role="listbox" aria-label="Choose size" hidden>
                ${['XS', 'S', 'M', 'L', 'XL'].map(size => `<button class="size-option" role="option" data-size="${size}" aria-selected="${state.size === size}" ${size === 'XL' ? 'disabled aria-disabled="true"' : ''}>${size}<span>${size === 'XL' ? 'Sold out' : size === state.size ? 'Selected' : 'Available'}</span></button>`).join('')}
              </div>
            </div><button class="primary-button add-button" id="add-to-cart">Add to cart</button>
          </div>
        </div>
      </article></div>
      <aside class="recommendations" aria-label="Recommended pieces"><h2 class="section-label">YOU MAY ALSO LIKE:</h2><div class="recommendation-list">${related.map(recommendation).join('')}</div>
        <button class="promo-banner" id="invite-button" aria-label="Copy friend invitation code FS2022 for 20 percent off">${gem}<span class="promo-copy">INVITE FRIEND AND<br>GET PROMO: <strong>FS2022</strong></span><span class="promo-discount">-20%</span></button>
      </aside>
    </section>`;
  }
  function catalogItem(product) {
    return `<article class="catalog-item"><button class="catalog-picture ${product.cutout ? 'is-cutout' : ''}" data-product="${product.id}" aria-label="View ${escape(product.name)}"><img src="${imagePath(product)}" alt="${escape(product.name)}"></button>${favorite(product.id)}<button class="catalog-name" data-product="${product.id}">${escape(product.name)}</button><p class="catalog-meta"><span>${escape(product.subtitle)}</span><span>${money(product.price)}</span></p></article>`;
  }
  function empty(title, description, icon = 'hanger', action = 'Browse the shop') {
    return `<div class="empty-state"><i class="ti ti-${icon}" aria-hidden="true"></i><h3>${title}</h3><p>${description}</p><button class="primary-button" data-view="catalog">${action}</button></div>`;
  }
  function renderCatalog() {
    const isWishlist = state.view === 'wishlist';
    const isAccessories = state.view === 'accessories';
    const filtered = products.filter(product => (!isWishlist || state.saved.has(product.id)) && (state.category === 'All' || product.category === state.category) && (!state.query || `${product.name} ${product.subtitle} ${product.category}`.toLowerCase().includes(state.query.toLowerCase())));
    const pageCount = Math.max(1, Math.ceil(filtered.length / 4));
    state.page = Math.min(state.page, pageCount - 1);
    const title = state.query ? `Results for “${escape(state.query)}”` : isWishlist ? 'Your favorite pieces' : isAccessories ? 'The finishing touches' : 'Find your next favorite';
    return `<section aria-label="${isWishlist ? 'Wishlist' : 'Catalog'}"><div class="view-heading"><h2>${title}</h2><p>${filtered.length} ${filtered.length === 1 ? 'piece' : 'pieces'}</p></div>
      ${!isAccessories && !isWishlist ? `<div class="filter-bar" aria-label="Product categories">${['All', 'Dresses', 'Accessories'].map(category => `<button class="filter-button" data-category="${category}" aria-pressed="${state.category === category}">${category}</button>`).join('')}${state.query ? '<button class="text-button" id="clear-search">Clear search</button>' : ''}</div>` : ''}
      ${filtered.length ? `<div class="catalog-grid">${filtered.slice(state.page * 4, state.page * 4 + 4).map(catalogItem).join('')}</div>` : empty(isWishlist ? 'Keep your favorites close' : 'No pieces found', isWishlist ? 'Save the pieces you love. They’ll be waiting here.' : 'Try a different name, color, or category.', isWishlist ? 'heart' : 'search')}
      ${filtered.length > 4 ? `<div class="pager"><button data-page="${state.page - 1}" ${state.page === 0 ? 'disabled' : ''} aria-label="Previous page"><i class="ti ti-chevron-left" aria-hidden="true"></i></button><span>${state.page + 1} / ${pageCount}</span><button data-page="${state.page + 1}" ${state.page === pageCount - 1 ? 'disabled' : ''} aria-label="Next page"><i class="ti ti-chevron-right" aria-hidden="true"></i></button></div>` : ''}
    </section>`;
  }
  function costSummary(checkout = false) {
    const subtotal = state.cart.reduce((sum, item) => sum + productById(item.id).price * item.quantity, 0);
    const discount = state.promo ? subtotal * .2 : 0;
    return `<aside class="soft-panel"><h3>Order summary</h3><div class="cost-row"><span>Subtotal</span><span>${money(subtotal)}</span></div><div class="cost-row"><span>Shipping</span><span>Complimentary</span></div>${state.promo ? `<div class="cost-row"><span>FS2022 · 20% off</span><span>−${money(discount)}</span></div>` : ''}
      ${!checkout ? `<form class="promo-form" id="promo-form"><input aria-label="Promo code" name="code" placeholder="Promo code" value="${state.promo ? 'FS2022' : ''}" ${state.promo ? 'readonly' : ''}><button ${state.promo ? 'disabled' : ''}>${state.promo ? 'Applied' : 'Apply'}</button></form><p class="field-message" id="promo-message" role="status"></p>` : ''}
      <div class="cost-row total"><span>Total</span><span>${money(subtotal - discount)}</span></div>${!checkout ? '<button class="primary-button full-button" data-view="checkout">Continue to checkout <i class="ti ti-arrow-right" aria-hidden="true"></i></button>' : ''}</aside>`;
  }
  function renderBag() {
    const pageCount = Math.max(1, Math.ceil(state.cart.length / 3));
    state.page = Math.min(state.page, pageCount - 1);
    return `<section><div class="view-heading"><h2>Your shopping bag</h2><button class="text-button" data-view="catalog">Continue shopping</button></div>${state.cart.length ? `<div class="split-view"><div>${state.cart.slice(state.page * 3, state.page * 3 + 3).map((item, offset) => {
      const index = state.page * 3 + offset;
      const product = productById(item.id);
      return `<article class="bag-row"><button data-product="${product.id}" aria-label="View ${escape(product.name)}"><img class="bag-image" src="${imagePath(product)}" alt="${escape(product.name)}"></button><div><h3>${escape(product.name)}</h3><p>${item.color[0].toUpperCase() + item.color.slice(1)} · Size ${item.size}</p><div class="quantity-control" aria-label="Quantity"><button data-quantity="${index}" data-delta="-1" ${item.quantity === 1 ? 'disabled' : ''} aria-label="Decrease quantity of ${escape(product.name)}"><i class="ti ti-minus" aria-hidden="true"></i></button><span>${item.quantity}</span><button data-quantity="${index}" data-delta="1" ${item.quantity >= 9 ? 'disabled' : ''} aria-label="Increase quantity of ${escape(product.name)}"><i class="ti ti-plus" aria-hidden="true"></i></button></div></div><div class="bag-row-end"><span>${money(product.price * item.quantity)}</span><button class="remove-button" data-remove="${index}" aria-label="Remove ${escape(product.name)}"><i class="ti ti-trash" aria-hidden="true"></i></button></div></article>`;
    }).join('')}${state.cart.length > 3 ? `<div class="pager"><button data-page="${state.page - 1}" ${state.page === 0 ? 'disabled' : ''} aria-label="Previous items"><i class="ti ti-chevron-left" aria-hidden="true"></i></button><span>${state.page + 1} / ${pageCount}</span><button data-page="${state.page + 1}" ${state.page === pageCount - 1 ? 'disabled' : ''} aria-label="Next items"><i class="ti ti-chevron-right" aria-hidden="true"></i></button></div>` : ''}</div>${costSummary()}</div>` : empty('Your bag is waiting', 'Find a piece you love and make it yours.', 'shopping-bag')}</section>`;
  }
  function renderCheckout() {
    if (!state.cart.length) return empty('Your bag is empty', 'Add your favorite pieces before checking out.', 'shopping-bag');
    const fields = [['name', 'Full name', 'text'], ['email', 'Email address', 'email'], ['address', 'Street address', 'text'], ['city', 'City', 'text'], ['zip', 'Postal code', 'text']];
    return `<section><div class="view-heading"><h2>Delivery details</h2><button class="text-button" data-view="bag">Back to bag</button></div><div class="split-view"><form id="checkout-form" novalidate><div class="form-grid">${fields.map(([name, label, type]) => `<label class="field ${name === 'address' ? 'full' : ''}">${label}<input name="${name}" type="${type}" autocomplete="${({ name: 'name', email: 'email', address: 'street-address', city: 'address-level2', zip: 'postal-code' })[name]}" value="${escape(state.checkout[name])}" required></label>`).join('')}</div><p class="field-message" id="checkout-message" role="status"></p><div class="checkout-actions"><button class="primary-button">Review order</button></div></form>${costSummary(true)}</div></section>`;
  }
  function renderReview() {
    const info = state.checkout;
    return `<section><div class="view-heading"><h2>Review your order</h2><button class="text-button" data-view="checkout">Edit delivery</button></div><div class="split-view"><div class="soft-panel"><h3>Deliver to</h3><p>${escape(info.name)}</p><p class="order-detail">${escape(info.address)}<br>${escape(info.city)} ${escape(info.zip)}<br>${escape(info.email)}</p><div class="order-list"><h3>Payment</h3><p class="field-message">Online checkout is currently unavailable. Your bag and delivery details are saved for this visit.</p><button class="primary-button full-button" data-view="bag">Return to shopping bag</button></div></div>${costSummary(true)}</div></section>`;
  }
  function renderDiscover() {
    if (!state.preferences.recommendations) return `<section><div class="view-heading"><h2>Your personal edit</h2></div><div class="empty-state"><i class="ti ti-hanger" aria-hidden="true"></i><h3>A wardrobe your way</h3><p>Personal recommendations are turned off. You can still explore the full collection.</p><button class="primary-button" data-view="settings">Manage preferences</button><button class="text-button" data-view="catalog">Browse the collection</button></div></section>`;
    return `<section class="split-view"><div><h2 class="style-intro">A little inspiration.<br>A look that’s you.</h2><p class="style-p">Choose your mood. Find pieces that fit the way you want to feel.</p><p class="section-label">DRESSING FOR</p><div class="choice-group">${['Everyday', 'Work', 'Evening'].map(value => `<button class="choice-button" data-occasion="${value}" aria-pressed="${state.occasion === value}">${value}</button>`).join('')}</div><p class="section-label">YOUR STYLE</p><div class="choice-group">${['Minimal', 'Classic', 'Colorful'].map(value => `<button class="choice-button" data-style="${value}" aria-pressed="${state.style === value}">${value}</button>`).join('')}</div><button class="primary-button" id="refresh-edit" ${state.stylingBusy ? 'disabled' : ''}>${state.stylingBusy ? 'Finding your edit…' : state.stylingError ? 'Try again' : 'Find my edit'}</button><p class="field-message" role="status">${state.stylingError ? 'We couldn’t refresh your edit. Please try again.' : ''}</p></div><div><div class="view-heading"><h2 style="font-size:var(--fs-title)">Your personal edit</h2></div><div class="style-results" aria-busy="${state.stylingBusy}">${state.stylingIds.map(id => catalogItem(productById(id))).join('')}</div></div></section>`;
  }
  function renderSettings() {
    return `<section><div class="view-heading"><h2>Make yourself at home</h2></div><div class="split-view"><div class="soft-panel"><h3>Preferences</h3>${[['notifications', 'Collection updates', 'New collections and special offers.'], ['recommendations', 'Personal recommendations', 'An edit based on your style preferences.'], ['motion', 'Interface motion', 'Gentle transitions while you browse.']].map(([key, label, description]) => `<div class="setting-row"><div><span>${label}</span><p>${description}</p></div><button class="switch" data-preference="${key}" role="switch" aria-label="${label}" aria-checked="${state.preferences[key]}"></button></div>`).join('')}</div><div class="soft-panel"><h3>Your fit</h3><p class="section-label">PREFERRED SIZE</p><div class="choice-group">${['XS', 'S', 'M', 'L'].map(size => `<button class="choice-button" data-fit="${size}" aria-pressed="${state.size === size}">${size}</button>`).join('')}</div><p class="section-label">PREFERRED STYLE</p><div class="choice-group">${['Minimal', 'Classic', 'Colorful'].map(value => `<button class="choice-button" data-style="${value}" aria-pressed="${state.style === value}">${value}</button>`).join('')}</div><button class="primary-button full-button" data-view="discover">Explore your edit</button></div></div></section>`;
  }
  function renderAccount() {
    if (!state.signedIn) return `<section class="soft-panel login-panel"><h3>Welcome back</h3><form id="login-form" novalidate><div class="field"><label for="login-email">Email address</label><input id="login-email" name="email" type="email" autocomplete="email" maxlength="96" value="${escape(state.email)}" required></div><p class="field-message" id="login-message" role="status"></p><button class="primary-button full-button" id="login-button">Sign in</button></form></section>`;
    return `<section><div class="view-heading"><h2>Your account</h2><button class="text-button" id="sign-out">Sign out</button></div><div class="split-view"><div><form id="profile-form" novalidate><div class="form-grid"><label class="field">Full name<input name="name" autocomplete="name" maxlength="60" value="${escape(state.name)}" required></label><label class="field">Email address<input name="email" type="email" autocomplete="email" maxlength="96" value="${escape(state.email)}" required></label></div><button class="primary-button" style="margin-top:var(--s-4)">Save changes</button><p class="field-message" id="profile-message" role="status"></p></form><div class="order-list"><h3>Recent orders</h3><article class="order-row"><div><strong>ST–1024</strong><br><span>November 8, 2026</span></div><div><strong>Satin Shirt Dress</strong><br><span>Delivered · Blue · S</span></div><button class="text-button" data-view="order">View order</button></article></div></div><aside class="soft-panel"><img class="account-avatar" src="assets/avatar.jpg" alt=""><h3>${escape(state.name)}</h3><p>${escape(state.email)}</p><button class="primary-button full-button" data-view="settings">Edit preferences</button></aside></div></section>`;
  }
  function renderOrder() {
    return `<section><div class="view-heading"><h2>Order ST–1024</h2><button class="text-button" data-view="account">Back to account</button></div><div class="split-view"><article class="bag-row"><img class="bag-image" src="assets/satin-shirt-dress.png" alt="Satin Shirt Dress"><div><h3>Satin Shirt Dress</h3><p>Blue · Size S · Quantity 1</p><p class="order-detail">Delivered November 8, 2026</p></div><span>${money(59)}</span></article><aside class="soft-panel"><h3>Delivery complete</h3><p>Olivia Wilson</p><p class="order-detail">Your order was delivered.<br>Complimentary standard shipping.</p><div class="cost-row total"><span>Order total</span><span>${money(59)}</span></div><button class="primary-button full-button" data-product="satin">Shop this piece again</button></aside></div></section>`;
  }
  function render() {
    const titles = { shop: 'Stylist A.I.', catalog: 'Collection', accessories: 'Accessories', wishlist: 'Wishlist', bag: 'Shopping Bag', checkout: 'Checkout', review: 'Review Order', discover: 'For You', settings: 'Settings', account: 'My Account', order: 'My Orders' };
    $('#view-title').textContent = titles[state.view];
    workspace.setAttribute('aria-label', titles[state.view]);
    canvas.dataset.motion = state.preferences.motion ? 'on' : 'off';
    $$('.nav-button').forEach(button => {
      const active = button.dataset.view === state.view || button.dataset.view === 'shop' && ['catalog', 'checkout', 'review', 'bag'].includes(state.view);
      button.classList.toggle('is-active', active);
      active ? button.setAttribute('aria-current', 'page') : button.removeAttribute('aria-current');
    });
    const renderers = { shop: renderShop, catalog: renderCatalog, accessories: renderCatalog, wishlist: renderCatalog, bag: renderBag, checkout: renderCheckout, review: renderReview, discover: renderDiscover, settings: renderSettings, account: renderAccount, order: renderOrder };
    workspace.innerHTML = renderers[state.view]();
    updateBagCount();
  }
  function $$(selector, root = document) { return [...root.querySelectorAll(selector)]; }
  function closeSize(restoreFocus = false) {
    const menu = $('#size-menu');
    if (!menu || menu.hidden) return;
    menu.hidden = true;
    $('#size-trigger').setAttribute('aria-expanded', 'false');
    if (restoreFocus) $('#size-trigger').focus();
  }
  async function copyInvite() {
    try {
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText('FS2022');
      else {
        const input = document.createElement('input');
        input.value = 'FS2022'; input.style.cssText = 'position:absolute;opacity:0;pointer-events:none'; canvas.append(input); input.select();
        const copied = document.execCommand('copy'); input.remove(); if (!copied) throw new Error('Copy unavailable');
      }
      toast('Invitation code FS2022 copied');
    } catch { toast('Your invitation code: FS2022'); }
  }
  function handleClick(event) {
    const button = event.target.closest('button');
    if (!button || button.disabled) return;
    if (button.dataset.view) {
      if (button.dataset.view === 'wishlist') { state.category = 'All'; state.query = ''; state.page = 0; }
      if (button.dataset.view === 'bag') state.page = 0;
      setView(button.dataset.view); return;
    }
    if (button.dataset.product) { openProduct(button.dataset.product); return; }
    if (button.dataset.save) {
      const id = button.dataset.save;
      if (state.saved.has(id)) state.saved.delete(id); else state.saved.add(id);
      if (state.view === 'wishlist') render();
      else $$(`[data-save="${id}"]`).forEach(element => { element.classList.toggle('is-saved', state.saved.has(id)); element.setAttribute('aria-pressed', state.saved.has(id)); element.setAttribute('aria-label', `${state.saved.has(id) ? 'Remove' : 'Save'} ${productById(id).name} ${state.saved.has(id) ? 'from' : 'to'} wishlist`); });
      return;
    }
    if (button.dataset.color) {
      state.color = button.dataset.color;
      $$('.color-swatch').forEach(element => element.setAttribute('aria-checked', element.dataset.color === state.color));
      const product = productById(state.product);
      const hero = $('#hero-image');
      delete hero.dataset.failed; hero.classList.remove('image-error'); $('.image-retry')?.remove();
      hero.src = product.id === 'satin' && state.color !== 'blue' ? `assets/satin-shirt-dress-${state.color}.png` : imagePath(product);
      hero.alt = `${product.name} in ${state.color}`; return;
    }
    if (button.id === 'size-trigger') {
      const menu = $('#size-menu'); menu.hidden = !menu.hidden; button.setAttribute('aria-expanded', !menu.hidden);
      if (!menu.hidden) $('.size-option[aria-selected="true"]', menu).focus(); return;
    }
    if (button.dataset.size) { state.size = button.dataset.size; $('#selected-size').textContent = state.size; $$('.size-option').forEach(element => { element.setAttribute('aria-selected', element.dataset.size === state.size); $('span', element).textContent = element.disabled ? 'Sold out' : element.dataset.size === state.size ? 'Selected' : 'Available'; }); closeSize(true); return; }
    if (button.id === 'add-to-cart') {
      const item = state.cart.find(item => item.id === state.product && item.color === state.color && item.size === state.size);
      if (item?.quantity >= 9) { toast('You can add up to 9 of this piece'); return; }
      if (item) item.quantity++; else state.cart.push({ id: state.product, size: state.size, color: state.color, quantity: 1 });
      updateBagCount(); button.textContent = 'Added to bag'; toast(`${productById(state.product).name} added to your bag`); return;
    }
    if (button.id === 'invite-button') { copyInvite(); return; }
    if (button.dataset.retryImage) {
      const image = $('#hero-image');
      if (image) { delete image.dataset.failed; image.classList.remove('image-error'); image.alt = `${productById(state.product).name} in ${state.color}`; image.src = button.dataset.retryImage; }
      button.remove(); return;
    }
    if (button.dataset.category) { state.category = button.dataset.category; state.page = 0; render(); return; }
    if (button.id === 'clear-search') { state.query = ''; $('#search').value = ''; state.page = 0; render(); return; }
    if (button.dataset.page !== undefined) { state.page = Number(button.dataset.page); render(); return; }
    if (button.dataset.quantity !== undefined) { const item = state.cart[Number(button.dataset.quantity)]; if (item) item.quantity = Math.max(1, Math.min(9, item.quantity + Number(button.dataset.delta))); render(); return; }
    if (button.dataset.remove !== undefined) { state.cart.splice(Number(button.dataset.remove), 1); render(); return; }
    if (button.dataset.preference) { const key = button.dataset.preference; state.preferences[key] = !state.preferences[key]; canvas.dataset.motion = state.preferences.motion ? 'on' : 'off'; button.setAttribute('aria-checked', state.preferences[key]); return; }
    if (button.dataset.fit) { state.size = button.dataset.fit; render(); return; }
    if (button.dataset.occasion) { state.occasion = button.dataset.occasion; render(); return; }
    if (button.dataset.style) { state.style = button.dataset.style; render(); return; }
    if (button.id === 'refresh-edit') {
      if (state.stylingBusy) return;
      const attempt = ++state.connectionAttempts;
      state.stylingBusy = true; state.stylingError = false; render();
      setTimeout(() => {
        state.stylingBusy = false;
        state.stylingError = attempt % 2 === 0;
        if (!state.stylingError) state.stylingIds = state.style === 'Colorful' ? ['red', 'satin'] : state.occasion === 'Work' ? ['night', 'winter'] : ['satin', 'winter'];
        if (state.view === 'discover') render();
      }, 850); return;
    }
    if (button.id === 'sign-out') { state.signedIn = false; render(); }
  }
  function validEmail(value) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value); }
  function handleSubmit(event) {
    const form = event.target; event.preventDefault();
    const data = new FormData(form);
    if (form.id === 'search-form') { state.query = $('#search').value.trim(); state.category = 'All'; state.page = 0; setView('catalog', { reset: false }); return; }
    if (form.id === 'promo-form') {
      const code = String(data.get('code')).trim().toUpperCase();
      if (code !== 'FS2022') { $('#promo-message').textContent = 'This code isn’t valid. Please check and try again.'; $('input', form).setAttribute('aria-invalid', 'true'); return; }
      state.promo = true; render(); $('#promo-message').textContent = 'Your 20% discount is applied.'; $('#promo-message').classList.add('form-success'); return;
    }
    if (form.id === 'checkout-form') {
      const values = Object.fromEntries(data); state.checkout = values;
      $$('input', form).forEach(input => input.removeAttribute('aria-invalid'));
      const invalid = $$('input', form).find(input => !input.value.trim() || input.type === 'email' && !validEmail(input.value));
      if (invalid) { invalid.setAttribute('aria-invalid', 'true'); invalid.focus(); $('#checkout-message').textContent = 'Please complete your delivery details with a valid email address.'; return; }
      setView('review'); return;
    }
    if (form.id === 'profile-form') {
      const name = String(data.get('name')).trim(), email = String(data.get('email')).trim();
      if (!name || !validEmail(email)) { $('#profile-message').textContent = 'Enter your name and a valid email address.'; return; }
      state.name = name; state.email = email; render(); $('#profile-message').textContent = 'Your details have been updated.'; $('#profile-message').classList.add('form-success'); return;
    }
    if (form.id === 'login-form') {
      const email = String(data.get('email')).trim();
      if (!validEmail(email)) { $('#login-message').textContent = 'Enter a valid email address.'; $('#login-email').setAttribute('aria-invalid', 'true'); return; }
      $('#login-email').removeAttribute('aria-invalid');
      const attempt = ++state.accountAttempts; const button = $('#login-button'); button.disabled = true; button.textContent = 'Signing in…'; $('#login-message').textContent = '';
      setTimeout(() => {
        if (attempt % 2) { state.email = email; state.signedIn = true; if (state.view === 'account') render(); toast('Welcome back'); }
        else if (state.view === 'account') { $('#login-message').textContent = 'We couldn’t connect. Please try again.'; button.disabled = false; button.textContent = 'Try again'; }
      }, 750);
    }
  }
  function handleKeydown(event) {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); $('#search').focus(); }
    if (event.key === 'Escape') { closeSize(true); $('#toast').classList.remove('is-visible'); }
    const menu = $('#size-menu');
    if (menu && !menu.hidden && ['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
      event.preventDefault(); const options = $$('.size-option:not(:disabled)', menu); const current = options.indexOf(document.activeElement);
      const index = event.key === 'Home' ? 0 : event.key === 'End' ? options.length - 1 : (current + (event.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length;
      options[index].focus();
    }
    if (event.target.matches('.color-swatch') && ['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
      event.preventDefault(); const options = $$('.color-swatch'); const current = options.indexOf(event.target); const index = (current + (['ArrowDown', 'ArrowRight'].includes(event.key) ? 1 : -1) + options.length) % options.length; options[index].focus(); options[index].click();
    }
  }
  function start() {
    if (started) return; started = true;
    canvas.addEventListener('click', handleClick);
    canvas.addEventListener('submit', handleSubmit);
    document.addEventListener('keydown', handleKeydown);
    document.addEventListener('click', event => { if (!event.target.closest('.size-select')) closeSize(); });
    canvas.addEventListener('error', event => {
      if (event.target instanceof HTMLImageElement && !event.target.dataset.failed) {
        event.target.dataset.failed = 'true'; event.target.classList.add('image-error');
        event.target.alt = 'Image unavailable';
        if (event.target.id === 'hero-image') {
          const retry = document.createElement('button');
          retry.className = 'image-retry primary-button'; retry.dataset.retryImage = event.target.getAttribute('src'); retry.textContent = 'Reload image';
          event.target.parentElement.append(retry);
        }
      }
    }, true);
    render();
  }
  start();
})();
