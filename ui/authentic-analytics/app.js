(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const gsap = window.gsap;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const narrow = window.matchMedia('(max-width: 900px)');
  const products = [
    { id: 'blush-knit', title: ['Open', 'cable-knit', 'sweater'], name: 'Open cable-knit sweater', price: 239.99, color: 'Blush', image: 'assets/product-blush.webp', description: 'Women’s high-neck sweater with a soft finish. A relaxed silhouette, made for everyday layering.', swatches: ['--blush', '--chalk', '--forest'], colors: ['Blush', 'Chalk', 'Forest'], sizes: ['S', 'M', 'L'] },
    { id: 'draped-blouse', title: ['Light', 'draped', 'blouse'], name: 'Light draped blouse', price: 145, color: 'Forest', image: 'assets/product-olive.webp', description: 'A softly draped blouse with a sculpted collar and gathered sleeves. An easy silhouette in deep forest green.', swatches: ['--forest', '--chalk', '--blush'], colors: ['Forest', 'Chalk', 'Blush'], sizes: ['S', 'M'] }
  ];
  const state = { started: false, product: 0, size: 'S', railOpen: !narrow.matches, view: 'product', report: 'overview', range: 7, syncCount: 0, syncing: false, adding: false, menu: null, selectedOrder: null };
  const bag = [{ product: 0, size: 'S', quantity: 1 }, { product: 1, size: 'M', quantity: 1 }];
  const orders = [
    { id: 'AA-1048', customer: 'Emma Wilson', email: 'emma.wilson@example.com', product: 0, size: 'S', status: 'Paid', total: 239.99, date: 'Nov 14, 2026' },
    { id: 'AA-1047', customer: 'Noah Anderson', email: 'noah.anderson@example.com', product: 1, size: 'M', status: 'Processing', total: 145, date: 'Nov 14, 2026' },
    { id: 'AA-1046', customer: 'Sofia Chen', email: 'sofia.chen@example.com', product: 0, size: 'M', status: 'Paid', total: 239.99, date: 'Nov 13, 2026' },
    { id: 'AA-1045', customer: 'Alex Rivera', email: 'alex.rivera@example.com', product: 1, size: 'S', status: 'Paid', total: 145, date: 'Nov 12, 2026' },
    { id: 'AA-1044', customer: 'Charlie Lee', email: 'charlie.lee@example.com', product: 0, size: 'L', status: 'Processing', total: 239.99, date: 'Nov 11, 2026' },
    { id: 'AA-1043', customer: 'Oliver Martin', email: 'oliver.martin@example.com', product: 1, size: 'M', status: 'Paid', total: 145, date: 'Nov 10, 2026' }
  ];
  const sales = [204.55, 48.30, 75.20, 158.25, 204.35, 150.10, 64.30];
  const sessions = [231, 138, 152, 202, 234, 179, 112];
  const checkouts = [9, 4, 6, 8, 10, 8, 5];
  const carts = [15, 8, 11, 14, 16, 12, 8];
  const firstTime = [7, 13, 40, 23, 37, 18, 5];
  const returning = [19, 31, 94, 66, 48, 32, 14];
  const data = Array.from({ length: 60 }, (_, index) => {
    const offset = index - 53;
    const day = ((offset % 7) + 7) % 7;
    const multiplier = offset >= 0 ? 1 : .89;
    const salesMultiplier = offset >= 0 ? 1 : 1.0526316 * (1 + Math.floor((-offset - 1) / 7) * .012);
    return { date: new Date(Date.UTC(2026, 10, 14 - 59 + index)), sales: Math.round(sales[day] * salesMultiplier * 100) / 100, sessions: Math.round(sessions[day] * multiplier), checkout: Math.round(checkouts[day] * (offset >= 0 ? 1 : .925)), cart: Math.round(carts[day] * (offset >= 0 ? 1 : 1.05)), firstTime: Math.round(firstTime[day] * multiplier), returning: Math.round(returning[day] * multiplier) };
  });
  let railTimeline;
  let productTimeline;
  let toastTimer;
  let addTimer;
  let syncTimer;
  let customerIndex = 2;
  let animationContext;
  let quickCrosshair;
  const menuTimelines = new Map();
  const priceValue = { value: products[0].price };
  const usd = value => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  const eur = value => new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' }).format(value);
  const dateLabel = date => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
  const slice = () => data.slice(-state.range);
  const duration = value => reduced.matches ? 0 : value;
  const node = (tag, className, text) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  };
  function notify(message) {
    clearTimeout(toastTimer);
    $('#toast').textContent = message;
    $('#toast').classList.add('is-visible');
    toastTimer = setTimeout(() => $('#toast').classList.remove('is-visible'), 3200);
  }
  function buildRailTimeline() {
    const width = parseFloat(getComputedStyle($('#site-shell')).getPropertyValue('--rail-width'));
    const progress = state.railOpen ? 0 : 1;
    if (gsap) {
      railTimeline?.clear();
      gsap.set('#product-visual', { xPercent: window.innerWidth <= 640 ? 0 : -50, x: 0 });
      railTimeline ??= gsap.timeline({ paused: true });
      railTimeline.fromTo('#analytics-rail', { xPercent: 0 }, { xPercent: -100, duration: .52, ease: 'power3.inOut' }, 0)
        .fromTo('#analytics-handle', { x: 0 }, { x: -width, duration: .52, ease: 'power3.inOut' }, 0)
        .fromTo('#wordmark', { x: 0 }, { x: narrow.matches ? 0 : -width, duration: .52, ease: 'power3.inOut' }, 0)
        .fromTo('#product-story', { x: 0 }, { x: narrow.matches ? 0 : -width * .936, duration: .52, ease: 'power3.inOut' }, 0)
        .fromTo('#product-visual', { x: 0 }, { x: narrow.matches ? 0 : -width * .5, duration: .52, ease: 'power3.inOut' }, 0);
      railTimeline.progress(progress).pause();
    }
    applyRailSemantics();
  }
  function applyRailSemantics() {
    $('#site-shell').classList.toggle('is-rail-closed', !state.railOpen);
    $('#analytics-rail').inert = !state.railOpen;
    $('#analytics-rail').setAttribute('aria-hidden', String(!state.railOpen));
    $('#analytics-handle').setAttribute('aria-expanded', String(state.railOpen));
    $('#analytics-handle').setAttribute('aria-label', state.railOpen ? 'Hide analytics' : 'Show analytics');
  }
  function toggleRail() {
    state.railOpen = !state.railOpen;
    if (!state.railOpen && $('#analytics-rail').contains(document.activeElement)) $('#analytics-handle').focus({ preventScroll: true });
    applyRailSemantics();
    if (railTimeline) {
      if (reduced.matches) railTimeline.progress(state.railOpen ? 0 : 1).pause();
      else if (state.railOpen) railTimeline.reverse();
      else railTimeline.play();
    }
    if (state.railOpen) animateCharts();
  }
  function menuConfig(name) {
    return name === 'navigation' ? { panel: $('#navigation-menu'), trigger: $('#menu-button') } : { panel: $('#range-menu'), trigger: $('#range-button') };
  }
  function closeMenu(restoreFocus = false) {
    if (!state.menu) return;
    const name = state.menu;
    const { panel, trigger } = menuConfig(name);
    if (restoreFocus || panel.contains(document.activeElement)) trigger.focus({ preventScroll: true });
    panel.inert = true;
    trigger.setAttribute('aria-expanded', 'false');
    state.menu = null;
    const timeline = menuTimelines.get(name);
    if (timeline) reduced.matches ? timeline.progress(0).pause() : timeline.reverse();
    else panel.classList.remove('is-open');
  }
  function openMenu(name, focusFirst = false) {
    if (state.menu === name) return closeMenu(true);
    closeMenu();
    const { panel, trigger } = menuConfig(name);
    state.menu = name;
    panel.inert = false;
    trigger.setAttribute('aria-expanded', 'true');
    const timeline = menuTimelines.get(name);
    if (timeline) reduced.matches ? timeline.progress(1).pause() : timeline.play();
    else panel.classList.add('is-open');
    if (focusFirst) $('button:not(:disabled)', panel)?.focus({ preventScroll: true });
  }
  function setView(view) {
    closeMenu();
    state.view = view;
    const section = $(`#${view}-view`);
    $$('#main-content > section').forEach(item => { item.hidden = item !== section; });
    if (view === 'bag') renderBag();
    if (view === 'analytics') { renderReport(); renderOrders(); }
    if (gsap && !reduced.matches) gsap.fromTo(section, { opacity: .3 }, { opacity: 1, duration: .24, ease: 'power2.out', overwrite: 'auto' });
    window.scrollTo({ top: 0, behavior: 'instant' });
    const heading = $('h1', section);
    heading.setAttribute('tabindex', '-1');
    heading.focus({ preventScroll: true });
  }
  function renderProduct() {
    const product = products[state.product];
    const heading = $('#product-title');
    heading.replaceChildren();
    product.title.forEach((line, index) => {
      if (index) { heading.append(node('br'), document.createTextNode(' ')); }
      heading.append(document.createTextNode(line));
    });
    $('#product-description').textContent = product.description;
    $('#selection-caption').textContent = `${product.color} / Size ${state.size}`;
    $('#product-feedback').textContent = '';
    $('#asset-error').hidden = true;
    $('#product-dots').replaceChildren(...products.map((item, index) => {
      const button = node('button', 'product-dot' + (index === state.product ? ' is-active' : ''));
      button.dataset.product = index;
      button.setAttribute('aria-label', `View ${item.name}`);
      button.setAttribute('aria-pressed', String(index === state.product));
      return button;
    }));
    $('#color-options').replaceChildren(...product.swatches.map((token, index) => {
      const button = node('button', 'color-button' + (index === 0 ? ' is-selected' : ''));
      button.style.setProperty('--swatch', `var(${token})`);
      button.dataset.color = index;
      button.disabled = index !== 0;
      button.title = product.colors[index] + (index ? ' — sold out' : '');
      button.setAttribute('aria-label', product.colors[index] + (index ? ', sold out' : ', selected'));
      button.setAttribute('aria-pressed', String(index === 0));
      return button;
    }));
    $$('.size-button').forEach(button => {
      button.disabled = !product.sizes.includes(button.dataset.size);
      button.classList.toggle('is-selected', button.dataset.size === state.size);
      button.setAttribute('aria-pressed', String(button.dataset.size === state.size));
      button.setAttribute('aria-label', `Size ${button.dataset.size}${button.disabled ? ', sold out' : ''}`);
    });
    resetAddButton();
  }
  function selectProduct(index) {
    index = (index + products.length) % products.length;
    if (index === state.product) return;
    const direction = index > state.product ? 1 : -1;
    state.product = index;
    if (!products[index].sizes.includes(state.size)) state.size = 'S';
    renderProduct();
    const images = [$('#model-a'), $('#model-b')];
    images.forEach((image, imageIndex) => {
      const current = index === imageIndex;
      image.classList.toggle('is-current', current);
      image.setAttribute('aria-hidden', String(!current));
      image.alt = current ? `Model wearing ${products[imageIndex].name.toLowerCase()}` : '';
      if (gsap) gsap.to(image, { opacity: current ? 1 : 0, x: current ? 0 : -18 * direction, duration: duration(.42), ease: 'power2.inOut', overwrite: 'auto' });
    });
    if (gsap) {
      productTimeline?.clear();
      productTimeline ??= gsap.timeline();
      productTimeline.fromTo('#product-title', { opacity: .3, y: reduced.matches ? 0 : 6 }, { opacity: 1, y: 0, duration: duration(.28), ease: 'power2.out' }, 0)
        .fromTo('#product-description', { opacity: .3 }, { opacity: 1, duration: duration(.28) }, 0);
      productTimeline.restart();
      gsap.to(priceValue, { value: products[index].price, duration: duration(.42), ease: 'power2.inOut', overwrite: 'auto', onUpdate: () => { $('#product-price').textContent = eur(priceValue.value); } });
    } else $('#product-price').textContent = eur(products[index].price);
    const activeImage = images[index];
    if (activeImage.complete && !activeImage.naturalWidth) $('#asset-error').hidden = false;
  }
  function selectSize(size) {
    if (!products[state.product].sizes.includes(size)) return;
    state.size = size;
    $$('.size-button').forEach(button => {
      button.classList.toggle('is-selected', button.dataset.size === size);
      button.setAttribute('aria-pressed', String(button.dataset.size === size));
    });
    $('#selection-caption').textContent = `${products[state.product].color} / Size ${size}`;
    $('#product-feedback').textContent = '';
    resetAddButton();
  }
  function resetAddButton() {
    clearTimeout(addTimer);
    state.adding = false;
    $('#add-button').disabled = false;
    $('#add-button').removeAttribute('aria-busy');
    $('#add-label').textContent = 'Add to cart';
    $('#add-icon').className = 'ti ti-plus';
  }
  function addToBag() {
    if (state.adding) return;
    state.adding = true;
    $('#add-button').disabled = true;
    $('#add-button').setAttribute('aria-busy', 'true');
    $('#add-label').textContent = 'Adding';
    const selection = { product: state.product, size: state.size };
    addTimer = setTimeout(() => {
      const existing = bag.find(item => item.product === selection.product && item.size === selection.size);
      if (existing) existing.quantity++;
      else bag.push({ ...selection, quantity: 1 });
      state.adding = false;
      $('#add-button').disabled = false;
      $('#add-button').removeAttribute('aria-busy');
      $('#add-label').textContent = 'Added to cart';
      $('#add-icon').className = 'ti ti-check';
      $('#product-feedback').textContent = `${products[selection.product].color} / ${selection.size} is in your shopping bag.`;
      updateBagCount();
      if (state.view === 'bag') renderBag();
      if (gsap && !reduced.matches) gsap.fromTo('#bag-button', { scale: .9 }, { scale: 1, duration: .24, ease: 'power2.out', overwrite: 'auto' });
    }, 280);
  }
  function updateBagCount() {
    const count = bag.reduce((sum, item) => sum + item.quantity, 0);
    $('#bag-count').textContent = count;
    $('#bag-button').setAttribute('aria-label', `Shopping bag, ${count} items`);
  }
  function renderBag() {
    updateBagCount();
    const container = $('#bag-items');
    container.replaceChildren();
    $('#bag-summary').hidden = !bag.length;
    if (!bag.length) {
      const empty = node('div', 'empty-state');
      empty.append(node('i', 'ti ti-shopping-bag'), node('h2', '', 'Your bag is taking a breather.'), node('p', '', 'Find a piece you’ll return to, again and again.'));
      const button = node('button', 'text-button', 'Explore the collection');
      button.dataset.action = 'home';
      empty.append(button);
      container.append(empty);
      return;
    }
    bag.forEach((item, index) => {
      const product = products[item.product];
      const row = node('article', 'bag-item');
      const image = node('img');
      image.src = product.image;
      image.alt = product.name;
      const info = node('div');
      info.append(node('h2', '', product.name), node('p', '', `${product.color} / Size ${item.size}`));
      const quantity = node('div', 'quantity-control');
      for (const [symbol, change, label] of [['−', -1, 'Decrease quantity'], ['+', 1, 'Increase quantity']]) {
        const button = node('button', '', symbol);
        button.dataset.bag = index;
        button.dataset.change = change;
        button.disabled = change === -1 ? item.quantity === 1 : item.quantity >= 9;
        button.setAttribute('aria-label', label + ', ' + product.name);
        if (change === 1) quantity.append(node('span', '', item.quantity));
        quantity.append(button);
      }
      info.append(quantity);
      const price = node('div', 'bag-item-price');
      price.append(node('span', '', eur(product.price * item.quantity)));
      const remove = node('button', 'remove-item', 'Remove');
      remove.dataset.remove = index;
      remove.setAttribute('aria-label', `Remove ${product.name}, size ${item.size}`);
      price.append(remove);
      row.append(image, info, price);
      container.append(row);
    });
    const total = bag.reduce((sum, item) => sum + products[item.product].price * item.quantity, 0);
    $('#bag-subtotal').textContent = eur(total);
    $('#bag-total').textContent = eur(total);
    $('#order-message').textContent = '';
  }
  function renderCharts() {
    const rows = slice();
    const bins = state.range === 7 ? rows : Array.from({ length: 7 }, (_, i) => rows.slice(Math.floor(i * rows.length / 7), Math.floor((i + 1) * rows.length / 7)));
    const values = bins.map(item => Array.isArray(item) ? item.reduce((sum, row) => sum + row.sales, 0) : item.sales);
    const max = Math.max(...values, 1);
    $('#sales-bars').replaceChildren(...values.map((value, index) => {
      const button = node('button', 'bar-hit');
      const group = Array.isArray(bins[index]) ? bins[index] : [bins[index]];
      const label = group.length === 1 ? dateLabel(group[0].date) : `${dateLabel(group[0].date)} – ${dateLabel(group.at(-1).date)}`;
      button.dataset.value = value;
      button.dataset.date = label;
      button.setAttribute('aria-label', `${label}, sales ${usd(value)}`);
      const bar = node('span', 'bar-mark');
      bar.style.height = `${value / max * 90}%`;
      button.append(bar);
      return button;
    }));
    $('#sales-total').textContent = usd(rows.reduce((sum, row) => sum + row.sales, 0));
    $('#range-caption').textContent = `${dateLabel(rows[0].date)} – ${dateLabel(rows.at(-1).date)}`;
    const previous = data.slice(-state.range * 2, -state.range);
    for (const [selector, key] of [['#sales-delta', 'sales'], ['#cart-delta', 'cart'], ['#checkout-delta', 'checkout'], ['#sessions-delta', 'sessions']]) {
      const currentTotal = rows.reduce((sum, row) => sum + row[key], 0);
      const previousTotal = previous.reduce((sum, row) => sum + row[key], 0);
      const percent = (currentTotal / previousTotal - 1) * 100;
      const label = $(selector);
      label.textContent = `${Math.trunc(Number(Math.abs(percent).toFixed(1)))}%`;
      label.parentElement.classList.toggle('negative', percent < 0);
      $('i', label.parentElement).className = `ti ti-arrow-${percent < 0 ? 'down' : 'up'}`;
    }
    const points = rows;
    const highest = Math.max(...points.flatMap(row => [row.firstTime, row.returning]), 1);
    const area = key => `M4 102 ${points.map((row, index) => `L${4 + index * 172 / (points.length - 1)} ${102 - row[key] / highest * 88}`).join(' ')} L176 102 Z`;
    $('#customer-context').setAttribute('d', area('returning'));
    $('#customer-primary').setAttribute('d', area('firstTime'));
    animateCharts();
  }
  function animateCharts() {
    if (!gsap || reduced.matches) return;
    const timeline = gsap.timeline({ defaults: { ease: 'power2.out', overwrite: 'auto' } });
    timeline.fromTo('.bar-mark', { scaleY: .04 }, { scaleY: 1, duration: .52, stagger: .035 }, 0)
      .fromTo('.customer-primary, .customer-context', { svgOrigin: '0 102', x: 0, y: 0, scaleY: .15, opacity: .12 }, { scaleY: 1, opacity: (index, element) => element.classList.contains('customer-context') ? .32 : 1, duration: .55 }, .08);
  }
  function showCustomerTooltip(index) {
    const rows = slice();
    customerIndex = Math.max(0, Math.min(rows.length - 1, index));
    const row = rows[customerIndex];
    const tooltip = $('#customer-tooltip');
    tooltip.replaceChildren(node('strong', '', dateLabel(row.date)), node('span', '', `${row.firstTime} first-time · ${row.returning} returning`));
    tooltip.hidden = false;
    const x = 4 + customerIndex * 172 / (rows.length - 1);
    $('#customer-crosshair').style.opacity = 1;
    if (quickCrosshair && !reduced.matches) quickCrosshair(x - 70);
    else $('#customer-crosshair').setAttribute('transform', `translate(${x - 70} 0)`);
  }
  function hideCustomerTooltip() { $('#customer-tooltip').hidden = true; $('#customer-crosshair').style.opacity = 0; }
  function showSalesTooltip(button) {
    const tooltip = $('#sales-tooltip');
    tooltip.replaceChildren(node('strong', '', usd(Number(button.dataset.value))), node('span', '', button.dataset.date));
    tooltip.hidden = false;
  }
  function renderReport() {
    const rows = slice();
    const totals = rows.reduce((result, row) => { for (const key of ['firstTime', 'returning', 'sessions', 'cart', 'checkout', 'sales']) result[key] += row[key]; return result; }, { firstTime: 0, returning: 0, sessions: 0, cart: 0, checkout: 0, sales: 0 });
    $('#report-revenue').textContent = usd(totals.sales);
    $('#report-sessions').textContent = totals.sessions.toLocaleString('en-US');
    $('#report-conversion').textContent = `${(totals.checkout / totals.sessions * 100).toFixed(1)}%`;
    $('#performance-table').replaceChildren(...rows.map(row => {
      const tr = node('tr');
      tr.append(node('td', '', dateLabel(row.date)));
      for (const key of ['firstTime', 'returning', 'sessions', 'cart', 'checkout']) tr.append(node('td', '', row[key].toLocaleString('en-US')));
      tr.append(node('td', 'numeric', usd(row.sales)));
      return tr;
    }));
    const footer = node('tr');
    footer.append(node('td', '', 'Total'));
    for (const key of ['firstTime', 'returning', 'sessions', 'cart', 'checkout']) footer.append(node('td', '', totals[key].toLocaleString('en-US')));
    footer.append(node('td', 'numeric', usd(totals.sales)));
    $('#performance-footer').replaceChildren(footer);
  }
  function selectReport(report) {
    state.report = report;
    $$('.report-tabs button').forEach(button => {
      button.classList.toggle('is-active', button.dataset.report === report);
      button.setAttribute('aria-selected', String(button.dataset.report === report));
      button.tabIndex = button.dataset.report === report ? 0 : -1;
    });
    $$('.report-panel').forEach(panel => { panel.hidden = panel.id !== `report-${report}`; });
    $('#range-button').disabled = report !== 'overview' || state.syncing;
    $('#refresh-button').disabled = report === 'settings' || state.syncing;
    $('.report-actions [data-action="export"]').disabled = report === 'settings';
  }
  function renderOrders() {
    const query = $('#order-search').value.trim().toLowerCase();
    const filtered = orders.filter(order => `${order.id} ${order.customer} ${products[order.product].name}`.toLowerCase().includes(query));
    $('#orders-table').replaceChildren(...filtered.map(order => {
      const row = node('tr');
      row.append(node('td', '', order.id), node('td', '', order.customer), node('td', '', products[order.product].name));
      const statusCell = node('td');
      const status = node('span', 'status status--' + order.status.toLowerCase());
      status.append(node('i', 'ti ' + (order.status === 'Paid' ? 'ti-circle-check' : 'ti-clock')), document.createTextNode(order.status));
      statusCell.append(status);
      const actionCell = node('td', 'numeric');
      const button = node('button', 'text-button', 'Details');
      button.dataset.order = order.id;
      button.setAttribute('aria-label', 'View details for ' + order.id);
      actionCell.append(button);
      row.append(statusCell, node('td', 'numeric', eur(order.total)), actionCell);
      return row;
    }));
    $('#order-count').textContent = `${filtered.length} order${filtered.length === 1 ? '' : 's'}`;
    $('#orders-empty').hidden = filtered.length !== 0;
    $('#order-detail').hidden = true;
  }
  function showOrder(id) {
    const order = orders.find(item => item.id === id);
    if (!order) return;
    state.selectedOrder = id;
    const detail = $('#order-detail');
    const customer = node('div');
    customer.append(node('h2', '', order.id), node('p', '', order.customer), node('p', '', order.email));
    const summary = node('div');
    summary.append(node('h2', '', products[order.product].name), node('p', '', `${products[order.product].color} / Size ${order.size}`), node('p', '', `${order.date} · ${order.status} · ${eur(order.total)}`));
    const close = node('button', 'icon-button');
    close.append(node('i', 'ti ti-x'));
    close.dataset.action = 'close-order';
    close.setAttribute('aria-label', 'Close order details');
    detail.replaceChildren(customer, summary, close);
    detail.hidden = false;
  }
  function changeRange(value) {
    state.range = Number(value);
    $('#range-label').textContent = `Last ${value} days`;
    $$('#range-menu [data-range]').forEach(button => {
      button.classList.toggle('is-selected', button.dataset.range === value);
      button.setAttribute('aria-pressed', String(button.dataset.range === value));
    });
    closeMenu(true);
    hideCustomerTooltip();
    renderCharts();
    renderReport();
  }
  function refreshData() {
    if (state.syncing) return;
    state.syncing = true;
    state.syncCount++;
    const message = $('#sync-message');
    message.hidden = false;
    message.classList.remove('is-error');
    message.textContent = 'Refreshing store data…';
    $('#analytics-content').style.opacity = .45;
    $('.report-panel:not([hidden])').style.opacity = .45;
    $('#refresh-button').setAttribute('aria-busy', 'true');
    selectReport(state.report);
    syncTimer = setTimeout(() => {
      state.syncing = false;
      $('#analytics-content').style.opacity = 1;
      $$('.report-panel').forEach(panel => { panel.style.opacity = 1; });
      $('#refresh-button').removeAttribute('aria-busy');
      selectReport(state.report);
      if (state.syncCount % 2) {
        message.textContent = 'Your store data is up to date. Updated just now.';
        renderCharts();
        renderReport();
      } else {
        message.classList.add('is-error');
        const retry = node('button', '', 'Try again');
        retry.dataset.action = 'refresh';
        message.replaceChildren(node('span', '', 'Couldn’t connect to the store. Your previous data is still available.'), retry);
      }
    }, 750);
  }
  function exportCSV() {
    let rows;
    if (state.report === 'orders') rows = [['Order', 'Customer', 'Product', 'Size', 'Status', 'Total EUR'], ...orders.map(order => [order.id, order.customer, products[order.product].name, order.size, order.status, order.total.toFixed(2)])];
    else rows = [['Date', 'First-time', 'Returning', 'Sessions', 'Cart', 'Checkout', 'Sales USD'], ...slice().map(row => [row.date.toISOString().slice(0, 10), row.firstTime, row.returning, row.sessions, row.cart, row.checkout, row.sales.toFixed(2)])];
    const content = rows.map(row => row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8' }));
    const link = node('a');
    link.href = url;
    link.download = `authentic-apparel-${state.report}.csv`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    notify('Your CSV report is ready.');
  }
  async function shareProduct(platform) {
    const product = products[state.product];
    const url = `${location.href.split('#')[0]}#${product.id}`;
    try {
      if (navigator.share && narrow.matches) await navigator.share({ title: product.name, url });
      else { await navigator.clipboard.writeText(url); notify(`Product link copied for ${platform}.`); }
    } catch (error) {
      if (error.name !== 'AbortError') notify('Sharing is unavailable. Copy the address from your browser.');
    }
  }
  function saveSettings(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const name = form.elements.storeName.value.trim();
    const email = form.elements.email.value.trim();
    $('#settings-message').textContent = '';
    if (!name || !form.elements.email.validity.valid || !email) {
      $('#settings-error').textContent = !name ? 'Enter a store name.' : 'Enter a valid email address.';
      (!name ? form.elements.storeName : form.elements.email).focus();
      return;
    }
    $('#settings-error').textContent = '';
    const button = $('button[type="submit"]', form);
    button.disabled = true;
    button.setAttribute('aria-busy', 'true');
    button.textContent = 'Saving';
    setTimeout(() => {
      button.disabled = false;
      button.removeAttribute('aria-busy');
      button.replaceChildren(document.createTextNode('Save changes'), node('i', 'ti ti-check'));
      $('.menu-caption').textContent = name;
      $('#settings-message').textContent = 'Store details updated.';
    }, 350);
  }
  const actions = {
    'toggle-analytics': toggleRail,
    home: () => setView('product'),
    manage: () => setView('analytics'),
    bag: () => setView('bag'),
    journal: () => setView('journal'),
    delivery: () => setView('delivery'),
    menu: () => openMenu('navigation'),
    'range-menu': () => openMenu('range'),
    previous: () => selectProduct(state.product - 1),
    next: () => selectProduct(state.product + 1),
    'add-to-bag': addToBag,
    refresh: refreshData,
    export: exportCSV,
    share: button => shareProduct(button.dataset.platform),
    'clear-search': () => { $('#order-search').value = ''; renderOrders(); $('#order-search').focus(); },
    'close-order': () => { $('#order-detail').hidden = true; $(`[data-order="${state.selectedOrder}"]`)?.focus(); },
    'review-order': () => { $('#order-message').textContent = 'Your items and total are ready to review. Online checkout is currently unavailable.'; },
    'retry-image': () => { const image = state.product === 0 ? $('#model-a') : $('#model-b'); image.src = products[state.product].image + '?retry=' + Date.now(); $('#asset-error').hidden = true; }
  };
  function onClick(event) {
    const button = event.target.closest('button');
    if (state.menu && !menuConfig(state.menu).panel.contains(event.target) && !menuConfig(state.menu).trigger.contains(event.target)) closeMenu();
    if (!button || button.disabled) return;
    if (button.dataset.action) actions[button.dataset.action]?.(button);
    else if (button.dataset.size) selectSize(button.dataset.size);
    else if (button.dataset.product !== undefined) selectProduct(Number(button.dataset.product));
    else if (button.dataset.range) changeRange(button.dataset.range);
    else if (button.dataset.report) selectReport(button.dataset.report);
    else if (button.dataset.color) notify(`${products[state.product].color} is selected.`);
    else if (button.dataset.bag !== undefined) { bag[Number(button.dataset.bag)].quantity += Number(button.dataset.change); renderBag(); }
    else if (button.dataset.remove !== undefined) { bag.splice(Number(button.dataset.remove), 1); renderBag(); }
    else if (button.dataset.order) showOrder(button.dataset.order);
  }
  function onKeydown(event) {
    if (event.key === 'Escape') { closeMenu(true); hideCustomerTooltip(); $('#sales-tooltip').hidden = true; }
    const trigger = event.target.closest('#menu-button, #range-button');
    if (trigger && event.key === 'ArrowDown') { event.preventDefault(); openMenu(trigger.id === 'menu-button' ? 'navigation' : 'range', true); }
    if (state.menu && menuConfig(state.menu).panel.contains(event.target) && ['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
      event.preventDefault();
      const buttons = $$('button:not(:disabled)', menuConfig(state.menu).panel);
      const current = buttons.indexOf(document.activeElement);
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : (current + (event.key === 'ArrowDown' ? 1 : -1) + buttons.length) % buttons.length;
      buttons[next].focus();
    }
    if (event.target.matches('.report-tabs button') && ['ArrowLeft', 'ArrowRight'].includes(event.key)) {
      event.preventDefault();
      const buttons = $$('.report-tabs button');
      const index = (buttons.indexOf(event.target) + (event.key === 'ArrowRight' ? 1 : -1) + buttons.length) % buttons.length;
      selectReport(buttons[index].dataset.report);
      buttons[index].focus();
    }
    if (event.target.matches('.customer-chart') && ['ArrowLeft', 'ArrowRight'].includes(event.key)) { event.preventDefault(); showCustomerTooltip(customerIndex + (event.key === 'ArrowRight' ? 1 : -1)); }
  }
  function start() {
    if (state.started) return;
    state.started = true;
    $('#site-shell').classList.toggle('no-gsap', !gsap);
    if (gsap) {
      animationContext = gsap.context(() => {
        for (const name of ['navigation', 'range']) {
          const { panel } = menuConfig(name);
          menuTimelines.set(name, gsap.timeline({ paused: true }).fromTo(panel, { autoAlpha: 0, y: -5, scale: .98 }, { autoAlpha: 1, y: 0, scale: 1, duration: .2, ease: 'power2.out' }));
        }
        quickCrosshair = gsap.quickTo('#customer-crosshair', 'x', { duration: .14, ease: 'power2.out' });
      });
    }
    buildRailTimeline();
    renderProduct();
    renderCharts();
    renderReport();
    renderOrders();
    selectReport('overview');
    updateBagCount();
    document.addEventListener('click', onClick);
    document.addEventListener('keydown', onKeydown);
    $('#order-search').addEventListener('input', renderOrders);
    $('#settings-form').addEventListener('submit', saveSettings);
    const chart = $('.customer-chart');
    chart.addEventListener('pointermove', event => {
      const rect = chart.getBoundingClientRect();
      showCustomerTooltip(Math.round(Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width)) * (slice().length - 1)));
    });
    chart.addEventListener('pointerleave', hideCustomerTooltip);
    chart.addEventListener('focus', () => showCustomerTooltip(customerIndex));
    chart.addEventListener('blur', hideCustomerTooltip);
    $('#sales-bars').addEventListener('pointerover', event => { const button = event.target.closest('.bar-hit'); if (button) showSalesTooltip(button); });
    $('#sales-bars').addEventListener('focusin', event => { const button = event.target.closest('.bar-hit'); if (button) showSalesTooltip(button); });
    $('#sales-bars').addEventListener('pointerleave', () => { $('#sales-tooltip').hidden = true; });
    $('#sales-bars').addEventListener('focusout', () => { $('#sales-tooltip').hidden = true; });
    [$('#model-a'), $('#model-b')].forEach((image, index) => {
      if (image.complete && !image.naturalWidth && state.product === index) $('#asset-error').hidden = false;
      image.addEventListener('error', () => { if (state.product === index) $('#asset-error').hidden = false; });
      image.addEventListener('load', () => { if (state.product === index) $('#asset-error').hidden = true; });
    });
    const initialProduct = products.findIndex(product => '#' + product.id === location.hash);
    if (initialProduct > 0) selectProduct(initialProduct);
    let resizeFrame;
    window.addEventListener('resize', () => {
      cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(buildRailTimeline);
    });
    narrow.addEventListener('change', () => { state.railOpen = !narrow.matches; buildRailTimeline(); });
    reduced.addEventListener('change', () => { buildRailTimeline(); closeMenu(); });
    window.addEventListener('pagehide', () => {
      clearTimeout(toastTimer);
      clearTimeout(addTimer);
      clearTimeout(syncTimer);
      railTimeline?.pause();
      productTimeline?.pause();
      animationContext?.revert();
    });
  }
  start();
})();
