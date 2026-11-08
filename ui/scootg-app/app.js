(() => {
  const $ = (selector) => document.querySelector(selector);
  const products = [
    { id: 'voi', name: 'Voi unveils scooter', price: 1590, category: 'E-Scooter', image: './assets/scooter-voi.png', speed: '25km/h', power: '2kw', charge: '5 hours', load: '120kg', rating: '4.8' },
    { id: 'm300', name: 'M300 Electric scooter', price: 1399, category: 'E-Scooter', image: './assets/scooter-m300.png', speed: '25km/h', power: '1.5kw', charge: '4 hours', load: '100kg', rating: '4.7' },
    { id: 'mi3', name: 'Mi Electric Scooter 3', price: 1590, category: 'E-Scooter', image: './assets/scooter-mi3.png', speed: '25km/h', power: '2kw', charge: '5 hours', load: '120kg', rating: '4.8' },
    { id: 'pro2', name: 'Mi Electric Scooter Pro2', price: 1350, category: 'E-Scooter', image: './assets/scooter-pro2.png', speed: '25km/h', power: '2kw', charge: '6 hours', load: '120kg', rating: '4.9' },
    { id: 'helmet', name: 'Atphfety scooter helmet', price: 60, category: 'Accessories', image: './assets/helmet-black.svg', speed: 'M / L', power: '420g', charge: 'ABS shell', load: 'Adjustable', rating: '4.8' },
    { id: 'bag', name: 'Epessa scooter storage bag', price: 60, category: 'Accessories', image: './assets/storage-bag.svg', speed: '3L', power: 'EVA shell', charge: 'Waterproof', load: 'Universal', rating: '4.7' }
  ];
  const state = { screen: 'home', navigation: [], selected: 'mi3', category: 'E-Scooter', query: '', sort: 'featured', offer: 0, trackIndex: 0, cartPage: 0, favorites: new Set(), cart: new Map([['mi3', 1], ['helmet', 1], ['bag', 1]]), panel: null, draftCategory: 'E-Scooter', draftSort: 'featured', showBadge: false, noticesRead: false, started: false, sideView: false };
  const find = (id) => products.find((product) => product.id === id);
  const money = (amount, decimals = false) => '$' + amount.toFixed(decimals ? 2 : 0);
  let toastTimer;
  let closeTimer;
  let panelOpener;
  let searchTimer;
  let openFrame;
  const text = (tag, className, content) => {
    const element = document.createElement(tag);
    element.className = className;
    element.textContent = content;
    return element;
  };
  const icon = (name) => {
    const element = document.createElement('i');
    element.className = 'ti ti-' + name;
    element.setAttribute('aria-hidden', 'true');
    return element;
  };
  function notify(message, error = false) {
    clearTimeout(toastTimer);
    $('#toast-message').textContent = message;
    $('#toast').classList.toggle('is-error', error);
    $('#toast > i').className = 'ti ti-' + (error ? 'alert-circle' : 'check');
    $('#toast').classList.add('is-visible');
    toastTimer = setTimeout(() => $('#toast').classList.remove('is-visible'), 2400);
  }
  function attachImage(image, product) {
    image.alt = product.name;
    image.hidden = false;
    if (image.nextElementSibling?.classList.contains('asset-error')) image.nextElementSibling.remove();
    image.onload = () => {
      image.hidden = false;
      image.parentElement?.classList.remove('is-loading');
      if (image.nextElementSibling?.classList.contains('asset-error')) image.nextElementSibling.remove();
    };
    image.onerror = () => {
      if (!image.isConnected || image.nextElementSibling?.classList.contains('asset-error')) return;
      image.hidden = true;
      image.parentElement.classList.remove('is-loading');
      const error = text('span', 'asset-error', '');
      error.append(icon('photo-off'), text('span', '', 'Image unavailable'));
      if (!image.closest('button')) {
        const retry = text('button', 'asset-retry', 'Retry');
        retry.type = 'button';
        retry.addEventListener('click', () => attachImage(image, product));
        error.append(retry);
      }
      image.after(error);
    };
    image.src = product.image;
  }
  function productCard(product) {
    const card = text('button', 'product-card', '');
    card.type = 'button';
    card.dataset.action = 'product';
    card.dataset.id = product.id;
    card.setAttribute('aria-label', product.name + ', ' + money(product.price));
    const photo = text('span', 'product-photo is-loading', '');
    const image = document.createElement('img');
    image.draggable = false;
    attachImage(image, product);
    photo.append(image);
    card.append(photo, text('span', 'product-name', product.name), text('span', 'product-price', '$ ' + product.price));
    return card;
  }
  function filteredProducts() {
    let result = products.filter((product) => (state.category === 'All products' || product.category === state.category) && product.name.toLowerCase().includes(state.query.toLowerCase()));
    if (state.sort === 'low') result.sort((a, b) => a.price - b.price);
    if (state.sort === 'high') result.sort((a, b) => b.price - a.price);
    return result;
  }
  function renderHome() {
    const result = filteredProducts();
    state.trackIndex = Math.min(state.trackIndex, Math.max(0, result.length - 2));
    $('#product-track').replaceChildren(...result.map(productCard));
    updateTrack();
    $('#release-window').hidden = !result.length;
    $('#search-message').hidden = Boolean(result.length);
    const emptyCategory = !state.query && !result.length;
    $('#search-message strong').textContent = emptyCategory ? 'More rides are on the way' : 'No rides found';
    $('#search-message > span').textContent = emptyCategory ? 'Explore our electric scooters and accessories.' : 'Try another name or category.';
    $('#release-heading').textContent = state.query ? 'Search results' : state.category === 'E-Scooter' ? 'New Releases' : state.category;
    $('#category-tabs').querySelectorAll('button').forEach((button) => {
      const active = button.dataset.category === state.category;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  }
  function updateTrack() {
    $('#product-track').style.setProperty('--track-offset', -state.trackIndex * 45.5 + 'cqw');
    [...$('#product-track').children].forEach((card, index) => { card.tabIndex = index >= state.trackIndex && index <= state.trackIndex + 1 ? 0 : -1; });
  }
  function renderOffer() {
    const product = find(state.offer ? 'mi3' : 'pro2');
    $('#promo-discount').textContent = state.offer ? 'New arrival' : '15% off';
    $('#promo-name').textContent = state.offer ? 'Scooter 3' : 'Scooter Pro2';
    $('#promo-price').textContent = money(product.price);
    $('#promo-card').setAttribute('aria-label', 'View ' + product.name + ', ' + money(product.price));
    attachImage($('#promo-image'), product);
    document.querySelectorAll('[data-action="offer"]').forEach((button) => {
      const active = Number(button.dataset.index) === state.offer;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  }
  function renderDetail() {
    const product = find(state.selected);
    $('#detail-name').textContent = product.name;
    $('#detail-price').textContent = '$ ' + product.price;
    $('#detail-rating').textContent = product.rating;
    const image = $('#detail-image');
    attachImage(image, product);
    image.classList.toggle('is-side', state.sideView);
    $('#angle-label').textContent = state.sideView ? '180°' : '360°';
    const saved = state.favorites.has(product.id);
    $('#favorite-button').setAttribute('aria-pressed', String(saved));
    $('#favorite-button').setAttribute('aria-label', saved ? 'Remove saved product' : 'Save product');
    const accessory = product.category === 'Accessories';
    const specs = accessory ? [['Size / Capacity', product.speed, 'ruler'], ['Material', product.power, 'layers-intersect'], ['Protection', product.charge, 'shield-check'], ['Fit', product.load, 'adjustments']] : [['Top Speed', product.speed, 'gauge'], ['Power', product.power, 'bolt'], ['Charge', product.charge, 'battery-vertical'], ['Max Load', product.load, 'dashboard']];
    $('#specifications').replaceChildren(...specs.map(([label, value, symbol]) => {
      const row = text('div', 'spec-item', '');
      const tile = text('div', 'spec-icon', '');
      tile.append(icon(symbol));
      const data = document.createElement('div');
      data.append(text('dt', '', label), text('dd', '', value));
      row.append(tile, data);
      return row;
    }));
    updateAddButton();
  }
  function updateAddButton() {
    const full = (state.cart.get(state.selected) || 0) >= 9;
    $('#add-cart-button').disabled = full;
    $('#add-cart-button span').textContent = full ? 'Limit reached' : 'Add to cart';
  }
  function subtotal() { return [...state.cart].reduce((total, [id, quantity]) => total + find(id).price * quantity, 0); }
  function updateBadge() {
    const quantity = [...state.cart.values()].reduce((sum, value) => sum + value, 0);
    $('#cart-badge').textContent = quantity;
    $('#cart-badge').hidden = !quantity || !state.showBadge;
    $('.cart-nav-button').setAttribute('aria-label', 'Open cart, ' + quantity + ' items');
  }
  function renderCart() {
    const entries = [...state.cart];
    state.cartPage = Math.min(state.cartPage, Math.max(0, Math.ceil(entries.length / 3) - 1));
    $('#cart-items').replaceChildren(...entries.slice(state.cartPage * 3, state.cartPage * 3 + 3).map(([id, quantity]) => {
      const product = find(id);
      const row = text('article', 'cart-item', '');
      const thumbnail = text('button', 'cart-item-image', '');
      thumbnail.dataset.action = 'product';
      thumbnail.dataset.id = id;
      thumbnail.setAttribute('aria-label', 'View ' + product.name);
      const image = document.createElement('img');
      attachImage(image, product);
      thumbnail.append(image);
      const information = text('div', 'cart-item-info', '');
      const title = text('button', 'cart-item-title', product.name);
      title.dataset.action = 'product';
      title.dataset.id = id;
      const controls = text('div', 'quantity-control', '');
      const minus = text('button', 'quantity-button', '');
      minus.append(icon('minus'));
      minus.dataset.action = 'quantity';
      minus.dataset.id = id;
      minus.dataset.delta = '-1';
      minus.setAttribute('aria-label', quantity === 1 ? 'Remove ' + product.name : 'Decrease ' + product.name + ' quantity');
      const output = text('output', '', String(quantity));
      output.setAttribute('aria-label', product.name + ' quantity');
      const plus = text('button', 'quantity-button plus', '');
      plus.append(icon('plus'));
      plus.dataset.action = 'quantity';
      plus.dataset.id = id;
      plus.dataset.delta = '1';
      plus.disabled = quantity >= 9;
      plus.setAttribute('aria-label', 'Increase ' + product.name + ' quantity');
      controls.append(minus, output, plus);
      information.append(title, text('strong', 'cart-item-price', '$ ' + product.price), controls);
      row.append(thumbnail, information);
      return row;
    }));
    let pager = $('#cart-pager');
    if (entries.length > 3) {
      if (!pager) {
        pager = text('div', 'cart-pager', '');
        pager.id = 'cart-pager';
        $('#cart-items').after(pager);
      }
      const prev = text('button', 'text-button', 'Previous');
      prev.dataset.action = 'cart-page';
      prev.dataset.delta = '-1';
      prev.disabled = state.cartPage === 0;
      const next = text('button', 'text-button', 'Next');
      next.dataset.action = 'cart-page';
      next.dataset.delta = '1';
      next.disabled = state.cartPage >= Math.ceil(entries.length / 3) - 1;
      pager.replaceChildren(prev, text('span', '', (state.cartPage + 1) + ' / ' + Math.ceil(entries.length / 3)), next);
    } else pager?.remove();
    const empty = !entries.length;
    $('#cart-empty').hidden = !empty;
    $('#order-info').hidden = empty;
    $('#checkout-button').disabled = empty;
    $('#cart-subtotal').textContent = money(subtotal(), true);
    $('#cart-shipping').textContent = '+ ' + money(empty ? 0 : 10, true);
    $('#cart-total').textContent = money(subtotal() + (empty ? 0 : 10), true);
    updateBadge();
  }
  function navigate(screen, remember = true, utility) {
    if (remember && state.screen !== screen) state.navigation.push({ screen: state.screen, utility: state.utility, selected: state.selected });
    state.screen = screen;
    state.utility = utility || state.utility;
    if (screen === 'home') renderHome();
    if (screen === 'cart') renderCart();
    if (screen === 'detail') renderDetail();
    if (screen === 'utility') renderUtility(state.utility);
    document.querySelectorAll('.screen').forEach((section) => {
      const active = section.id === 'screen-' + screen;
      section.hidden = !active;
      section.classList.toggle('is-active', active);
    });
    document.querySelectorAll('.nav-item').forEach((button) => {
      const active = button.dataset.nav === (screen === 'home' || screen === 'detail' ? 'home' : screen === 'utility' ? state.utility : 'cart');
      button.classList.toggle('is-active', active);
      if (active) button.setAttribute('aria-current', 'page');
      else button.removeAttribute('aria-current');
    });
    const heading = $('#screen-' + screen + ' h1');
    if (heading) { heading.tabIndex = -1; heading.focus({ preventScroll: true }); }
  }
  function openProduct(id) {
    if (!find(id)) return;
    if (state.screen === 'detail') state.navigation.push({ screen: 'detail', selected: state.selected });
    state.sideView = false;
    const oldSelected = state.selected;
    state.selected = id;
    navigate('detail');
    if (state.navigation.length && state.navigation.at(-1).screen === 'detail') state.navigation.at(-1).selected = oldSelected;
  }
  function back() {
    const previous = state.navigation.pop();
    if (!previous) return navigate('home', false);
    if (previous.selected) state.selected = previous.selected;
    navigate(previous.screen, false, previous.utility);
  }
  function addToCart(id) {
    const quantity = state.cart.get(id) || 0;
    if (quantity >= 9) { notify('Maximum 9 per item', true); return false; }
    state.cart.set(id, quantity + 1);
    state.showBadge = true;
    updateBadge();
    updateAddButton();
    notify('Added to your cart');
    return true;
  }
  function openPanel(title, content, kind) {
    clearTimeout(closeTimer);
    if (!state.panel) panelOpener = document.activeElement;
    cancelAnimationFrame(openFrame);
    $('#panel-title').textContent = title;
    $('#panel-body').replaceChildren(content);
    state.panel = kind;
    $('#panel-layer').hidden = false;
    $('#app-content').inert = true;
    $('.bottom-nav').inert = true;
    openFrame = requestAnimationFrame(() => $('#panel-layer').classList.add('is-open'));
    $('#panel').focus({ preventScroll: true });
  }
  function closePanel() {
    cancelAnimationFrame(openFrame);
    state.panel = null;
    $('#panel-layer').classList.remove('is-open');
    $('#app-content').inert = false;
    $('.bottom-nav').inert = false;
    if (panelOpener?.isConnected) panelOpener.focus({ preventScroll: true });
    clearTimeout(closeTimer);
    closeTimer = setTimeout(() => { if (!state.panel) $('#panel-layer').hidden = true; }, matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 260);
  }
  function menuItem(label, action, symbol = 'chevron-right') {
    const button = text('button', '', '');
    button.dataset.action = action;
    button.append(text('span', '', label), icon(symbol));
    return button;
  }
  function simplePanel(title, message) {
    openPanel(title, text('p', '', message), 'information');
  }
  function showMenu() {
    const menu = text('div', 'panel-menu', '');
    menu.append(menuItem('Explore scooters', 'panel-home'), menuItem('My cart', 'panel-cart'), menuItem('Saved products', 'saved'), menuItem('Rent a scooter', 'panel-rent'), menuItem('Help & support', 'support'));
    openPanel('SCOOTG', menu, 'menu');
  }
  function showFilters() {
    state.draftCategory = state.category;
    state.draftSort = state.sort;
    const content = text('div', '', '');
    [['Category', ['E-Scooter', 'E-Bike', 'For Kids', 'Accessories'], ['E-Scooter', 'E-Bike', 'For Kids', 'Accessories'], 'draft-category'], ['Sort by', ['Featured', 'Price: low to high', 'Price: high to low'], ['featured', 'low', 'high'], 'draft-sort']].forEach(([label, labels, values, action]) => {
      const group = text('div', 'filter-group', '');
      group.append(text('span', '', label));
      const options = text('div', 'filter-options', '');
      labels.forEach((name, index) => {
        const button = text('button', '', name);
        button.dataset.action = action;
        button.dataset.value = values[index];
        button.setAttribute('aria-pressed', String(values[index] === (action === 'draft-category' ? state.draftCategory : state.draftSort)));
        options.append(button);
      });
      group.append(options);
      content.append(group);
    });
    const apply = text('button', 'button button-dark', 'Show products');
    apply.dataset.action = 'apply-filters';
    content.append(apply);
    openPanel('Filters', content, 'filters');
  }
  function showCategories() {
    const menu = text('div', 'panel-menu', '');
    ['All products', 'E-Scooter', 'E-Bike', 'For Kids', 'Accessories'].forEach((category) => {
      const button = menuItem(category, 'panel-category');
      button.dataset.category = category;
      button.setAttribute('aria-pressed', String(category === state.category));
      menu.append(button);
    });
    openPanel('Categories', menu, 'categories');
  }
  function showCatalog() {
    const result = filteredProducts();
    const content = text('div', 'panel-menu', '');
    if (!result.length) content.append(text('p', 'form-status', 'No products in this category yet. Explore electric scooters and accessories.'));
    result.forEach((product) => {
      const button = menuItem(product.name + ' · ' + money(product.price), 'catalog-product');
      button.dataset.id = product.id;
      content.append(button);
    });
    openPanel('All releases', content, 'catalog');
  }
  function showCheckout(singleProduct = false) {
    const amount = singleProduct ? find(state.selected).price + 10 : subtotal() + 10;
    if (!singleProduct && !state.cart.size) return;
    const form = text('form', 'checkout-form', '');
    form.noValidate = true;
    form.innerHTML = '<label>Full name<input name="fullName" autocomplete="name" maxlength="80" required></label><label>Email<input name="email" type="email" autocomplete="email" maxlength="120" required></label><label>Delivery address<input name="address" autocomplete="street-address" maxlength="180" required></label><div class="form-error" role="alert" hidden></div><div class="checkout-summary"><span>Total</span><strong></strong></div><p class="form-status" aria-live="polite">Delivery and payment details are reviewed before ordering.</p><button class="button button-dark" type="submit">Continue to payment</button>';
    form.querySelector('.checkout-summary strong').textContent = money(amount, true);
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const error = form.querySelector('.form-error');
      const fields = [...form.querySelectorAll('input')];
      fields.forEach((input) => input.setAttribute('aria-invalid', String(!input.value.trim() || !input.validity.valid)));
      const invalid = fields.find((input) => input.getAttribute('aria-invalid') === 'true');
      if (invalid) {
        error.textContent = invalid.name === 'email' ? 'Enter a valid email address.' : invalid.name === 'fullName' ? 'Enter your full name.' : 'Enter a delivery address.';
        error.hidden = false;
        invalid.focus();
        return;
      }
      error.hidden = true;
      const button = form.querySelector('button[type="submit"]');
      button.disabled = true;
      button.textContent = 'Checking availability…';
      form.setAttribute('aria-busy', 'true');
      await new Promise((resolve) => setTimeout(resolve, 650));
      if (!form.isConnected) return;
      form.removeAttribute('aria-busy');
      button.disabled = false;
      button.textContent = 'Try again';
      error.textContent = 'Payment service is unavailable. Your cart and delivery details have been kept.';
      error.hidden = false;
    });
    openPanel('Checkout', form, 'checkout');
  }
  function showSaved() {
    const many = state.favorites.size > 4;
    const content = text('div', many ? 'panel-menu' : 'saved-grid', '');
    [...state.favorites].forEach((id) => {
      const product = find(id);
      const card = many ? menuItem(product.name, 'catalog-product') : productCard(product);
      card.dataset.action = 'catalog-product';
      card.dataset.id = id;
      content.append(card);
    });
    if (!state.favorites.size) {
      const empty = text('div', 'list-message', '');
      empty.append(icon('heart'), text('strong', '', 'Nothing saved yet'), text('span', '', 'Save a ride you love from its details.'));
      openPanel('Saved products', empty, 'saved');
    } else openPanel('Saved products', content, 'saved');
  }
  function renderUtility(kind) {
    $('#utility-title').textContent = kind === 'rent' ? 'Rent a scooter' : kind === 'history' ? 'Ride history' : 'Account';
    const content = $('#utility-content');
    content.replaceChildren();
    if (kind === 'account') {
      const account = text('div', 'account-card', '');
      const avatar = text('span', 'account-avatar', '');
      avatar.append(icon('user'));
      const details = document.createElement('div');
      details.append(text('h2', '', 'Your account'), text('p', '', 'Everyday rides. All in one place.'));
      account.append(avatar, details);
      const menu = text('div', 'panel-menu', '');
      menu.append(menuItem('Saved products', 'saved', 'heart'), menuItem('My cart', 'panel-cart', 'shopping-cart'), menuItem('Notifications', 'notifications', 'bell'), menuItem('Help & support', 'support', 'headset'), menuItem('Material credits', 'credits', 'info-circle'));
      content.append(account, menu);
    } else if (kind === 'history') {
      const empty = text('div', 'list-message cart-empty', '');
      const button = text('button', 'button button-dark', 'Explore rentals');
      button.dataset.action = 'rent';
      empty.append(icon('route'), text('strong', '', 'Your next ride starts here'), text('span', '', 'Your completed rentals will appear here.'), button);
      content.append(empty);
    } else {
      const image = document.createElement('img');
      image.className = 'rent-photo';
      attachImage(image, find('mi3'));
      const heading = text('div', 'rent-heading', '');
      heading.append(text('h2', '', 'Mi Electric Scooter 3'), text('strong', '', '$ 12 / hour'));
      const button = text('button', 'button button-dark', 'Check availability');
      button.dataset.action = 'rent-availability';
      content.append(image, heading, text('p', '', 'A lighter way to get around. Helmet included with every rental.'), button);
    }
  }
  document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-action]');
    if (!button || button.disabled) return;
    const { action } = button.dataset;
    if (['home', 'cart', 'rent', 'history', 'account', 'panel-home', 'panel-cart', 'panel-rent'].includes(action)) {
      if (state.panel) closePanel();
      const target = action.replace('panel-', '');
      navigate(['home', 'cart'].includes(target) ? target : 'utility', true, target);
    } else if (action === 'back') back();
    else if (action === 'product') openProduct(button.dataset.id);
    else if (action === 'catalog-product') { closePanel(); openProduct(button.dataset.id); }
    else if (action === 'promo') openProduct(state.offer ? 'mi3' : 'pro2');
    else if (action === 'offer') { state.offer = Number(button.dataset.index); renderOffer(); }
    else if (action === 'menu') showMenu();
    else if (action === 'close-panel') closePanel();
    else if (action === 'filters') showFilters();
    else if (action === 'categories') showCategories();
    else if (action === 'catalog') showCatalog();
    else if (action === 'category' || action === 'panel-category') {
      if (state.panel) closePanel();
      state.category = button.dataset.category;
      state.trackIndex = 0;
      navigate('home', state.screen !== 'home');
    } else if (action === 'draft-category' || action === 'draft-sort') {
      if (action === 'draft-category') state.draftCategory = button.dataset.value;
      else state.draftSort = button.dataset.value;
      button.parentElement.querySelectorAll('button').forEach((option) => option.setAttribute('aria-pressed', String(option === button)));
    } else if (action === 'apply-filters') {
      state.category = state.draftCategory;
      state.sort = state.draftSort;
      state.trackIndex = 0;
      closePanel();
      renderHome();
    } else if (action === 'reset-search') {
      state.query = '';
      state.category = 'E-Scooter';
      state.trackIndex = 0;
      $('#search-input').value = '';
      renderHome();
    } else if (action === 'favorite') {
      if (state.favorites.has(state.selected)) state.favorites.delete(state.selected);
      else state.favorites.add(state.selected);
      const saved = state.favorites.has(state.selected);
      button.setAttribute('aria-pressed', String(saved));
      button.setAttribute('aria-label', saved ? 'Remove saved product' : 'Save product');
      notify(saved ? 'Saved to your favorites' : 'Removed from favorites');
    } else if (action === 'angle') {
      state.sideView = !state.sideView;
      $('#detail-image')?.classList.toggle('is-side', state.sideView);
      $('#angle-label').textContent = state.sideView ? '180°' : '360°';
    } else if (action === 'reviews') simplePanel('Customer rating', find(state.selected).rating + ' / 5. Detailed customer reviews are not available right now.');
    else if (action === 'add-cart') addToCart(state.selected);
    else if (action === 'buy-now') showCheckout(true);
    else if (action === 'checkout') showCheckout();
    else if (action === 'quantity') {
      const quantity = (state.cart.get(button.dataset.id) || 0) + Number(button.dataset.delta);
      if (quantity <= 0) { state.cart.delete(button.dataset.id); notify('Removed from your cart'); }
      else if (quantity <= 9) state.cart.set(button.dataset.id, quantity);
      state.showBadge = true;
      renderCart();
    } else if (action === 'cart-page') { state.cartPage += Number(button.dataset.delta); renderCart(); }
    else if (action === 'saved') showSaved();
    else if (action === 'notifications') {
      $('.notification-dot').hidden = true;
      state.noticesRead = true;
      const notice = text('div', 'notice', '');
      notice.append(text('strong', '', 'Your city. Your ride.'), text('p', '', 'Discover the Mi Electric Scooter Pro2. Now 15% off.'));
      const view = text('button', 'button button-dark', 'Explore the offer');
      view.dataset.action = 'catalog-product';
      view.dataset.id = 'pro2';
      notice.append(view);
      openPanel('Notifications', notice, 'notifications');
    } else if (action === 'support') simplePanel('Help & support', 'For product information, delivery questions or rental support, contact hello@scootg.com.');
    else if (action === 'credits') simplePanel('Material credits', 'Product images: pngimg.com · CC BY-NC 4.0. For non-commercial use. Interface reference: SolGuruz on Dribbble.');
    else if (action === 'rent-availability') { notify('Rental service is unavailable. Please try again later.', true); }
  });
  $('#search-input').addEventListener('input', (event) => {
    clearTimeout(searchTimer);
    state.query = event.target.value.trim();
    state.trackIndex = 0;
    searchTimer = setTimeout(renderHome, 120);
  });
  $('#search-input').addEventListener('keydown', (event) => { if (event.key === 'Enter') { clearTimeout(searchTimer); renderHome(); event.target.blur(); } });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') { if (state.panel) closePanel(); else if (state.screen !== 'home') back(); }
    if (event.key === 'Tab' && state.panel) {
      const controls = [...$('#panel').querySelectorAll('button:not(:disabled), input')];
      const first = controls[0];
      const last = controls.at(-1);
      if (event.shiftKey && (document.activeElement === first || document.activeElement === $('#panel'))) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }
    if ((event.key === 'ArrowRight' || event.key === 'ArrowLeft') && document.activeElement.closest('.release-window')) {
      event.preventDefault();
      state.trackIndex = Math.max(0, Math.min(Math.max(0, filteredProducts().length - 2), state.trackIndex + (event.key === 'ArrowRight' ? 1 : -1)));
      updateTrack();
      $('#product-track').children[state.trackIndex]?.focus({ preventScroll: true });
    }
  });
  let pointerStart;
  $('#release-window').addEventListener('pointerdown', (event) => { pointerStart = { x: event.clientX, y: event.clientY }; });
  $('#release-window').addEventListener('pointerup', (event) => {
    if (!pointerStart) return;
    const dx = event.clientX - pointerStart.x;
    const dy = event.clientY - pointerStart.y;
    pointerStart = null;
    if (Math.abs(dx) > 25 && Math.abs(dx) > Math.abs(dy)) {
      state.trackIndex = Math.max(0, Math.min(Math.max(0, filteredProducts().length - 2), state.trackIndex + (dx < 0 ? 1 : -1)));
      updateTrack();
      $('#release-window').addEventListener('click', (click) => { click.stopPropagation(); click.preventDefault(); }, { once: true, capture: true });
    }
  });
  $('#release-window').addEventListener('pointercancel', () => { pointerStart = null; });
  function start() {
    if (state.started) return;
    state.started = true;
    renderOffer();
    renderHome();
    renderCart();
    $('.canvas').classList.add('is-starting');
    setTimeout(() => $('.canvas').classList.remove('is-starting'), 500);
  }
  start();
})();
