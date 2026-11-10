(() => {
  const products = {
    purifier: { name: 'SERE air purifier', detail: 'Mist White · Air care system', price: 449, visual: '<img src="./assets/air-purifier.webp" alt="SERE purifier in Mist White">' },
    oil: { name: 'Botanical essential oil', detail: 'Forest blend · 15 ml', description: 'A considered blend of cedar, eucalyptus, and fresh botanical notes.', price: 24, visual: '<div class="oil-bottle" aria-hidden="true"><span></span></div>' },
    filter: { name: 'SERE replacement filter', detail: 'HEPA + activated carbon', description: 'An easy-to-replace filter for a fresher start and cleaner everyday air.', price: 49, visual: '<div class="filter-model" aria-hidden="true"></div>' },
    hydro: { name: 'SERE hydro pack', detail: 'Humidification care pack', description: 'Refresh your humidity routine with a care pack made to fit your SERE.', price: 29, visual: '<div class="hydro-model" aria-hidden="true"></div>' }
  };
  const questions = [
    { title: 'How do I get started with SERE?', answer: 'Place SERE on a level surface with clear space around the intake. Remove the filter packaging, fit the filter and hydro pack, connect the power cable, and use the top touch control to select your airflow.', keywords: 'start setup install first use power' },
    { title: 'When should I replace the filter?', answer: 'Check the filter indicator regularly. Replacement timing depends on your room and usage. When the indicator lights up, switch off and unplug SERE before replacing the filter. Do not wash the HEPA filter.', keywords: 'filter replace replacement hepa indicator' },
    { title: 'How do I use the botanical essential oil?', answer: 'Add a few drops to the removable aroma pad, then return the pad to its holder. Never pour oil into the water tank, filter, or air outlet. Start with a small amount and follow the instructions on your oil bottle.', keywords: 'oil aroma botanical scent essential drops' },
    { title: 'How should I clean my SERE?', answer: 'Switch off and unplug SERE. Wipe the outer shell with a soft, slightly damp cloth. Keep the intake free of dust. Rinse removable humidification components as directed, let them dry, and never immerse the main unit in water.', keywords: 'clean cleaning maintenance water dust cloth care' },
    { title: 'What does automatic airflow do?', answer: 'Automatic airflow uses the air quality sensor to adjust the fan setting. For manual control, choose a fixed airflow level using the top control. Keep the sensor opening free of dust for a clear reading.', keywords: 'automatic auto airflow fan sensor control pm2.5 mode' },
    { title: 'Where can I find the right replacement parts?', answer: 'SERE essentials include the replacement filter, hydro pack, and botanical essential oil. Choose the care item that matches your routine and check that your product is a SERE air care system before replacing a component.', keywords: 'parts hydro pack essentials accessories purchase compatibility' }
  ];
  const bag = new Map();
  let shopQuantity = 1;
  let activePage = 'home';
  let activeFilter = 'all';
  let homeScroll = 0;
  let airflowMode = 0;
  let airflowOn = true;
  const modes = ['AUTO', 'LOW', 'HIGH'];
  const money = amount => '$' + amount.toLocaleString('en-US');

  function status(id, text, error = false) {
    const element = document.getElementById(id);
    element.textContent = text;
    element.classList.toggle('error', error);
  }

  function updateCounts() {
    const count = [...bag.values()].reduce((sum, quantity) => sum + quantity, 0);
    document.querySelectorAll('.bag-count').forEach(element => {
      element.textContent = count;
      element.dataset.empty = String(count === 0);
    });
    document.querySelector('.bag-button').setAttribute('aria-label', `Shopping bag, ${count} ${count === 1 ? 'item' : 'items'}`);
  }

  function addToBag(id, quantity, target) {
    const existing = bag.get(id) || 0;
    if (existing + quantity > 5) {
      status(target, 'You can add up to 5 of each item. Adjust the quantity in your bag.', true);
      return;
    }
    bag.set(id, existing + quantity);
    updateCounts();
    status(target, `${quantity === 1 ? products[id].name : quantity + ' × ' + products[id].name} added to your bag.`);
  }

  function updateShopQuantity() {
    document.getElementById('shop-quantity').textContent = shopQuantity;
    document.querySelector('[data-quantity="-1"]').disabled = shopQuantity === 1;
    document.querySelector('[data-quantity="1"]').disabled = shopQuantity === 5;
  }

  function renderCatalog(filter = activeFilter) {
    activeFilter = ['oil', 'filter', 'hydro'].includes(filter) ? filter : 'all';
    document.querySelectorAll('[data-filter]').forEach(button => {
      const selected = button.dataset.filter === activeFilter;
      button.classList.toggle('selected', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
    document.getElementById('catalog-grid').innerHTML = Object.entries(products)
      .filter(([id]) => id !== 'purifier' && (activeFilter === 'all' || id === activeFilter))
      .map(([id, product]) => `<article class="catalog-item"><div class="catalog-item-visual">${product.visual}</div><div class="catalog-item-heading"><h2>${product.name}</h2><span>${money(product.price)}</span></div><p>${product.description}</p><button class="pill pill-dark" data-add="${id}">Add to bag<i class="ti ti-plus" aria-hidden="true"></i></button></article>`).join('');
  }

  function renderBag(focusAction) {
    const content = document.getElementById('bag-content');
    if (bag.size === 0) {
      content.innerHTML = '<div class="bag-empty"><span class="brand-symbol" aria-hidden="true"></span><h2>A little room for fresh air.</h2><p>Your bag is empty. Find something that feels like home.</p><a class="pill pill-dark" href="#shop">Discover SERE<i class="ti ti-arrow-up-right" aria-hidden="true"></i></a></div>';
      if (focusAction) content.querySelector('a').focus({ preventScroll: true });
      return;
    }
    const total = [...bag].reduce((sum, [id, quantity]) => sum + products[id].price * quantity, 0);
    const items = [...bag].map(([id, quantity]) => {
      const product = products[id];
      return `<article class="bag-item"><div class="bag-item-visual">${product.visual}</div><div><h2>${product.name}</h2><p>${product.detail}</p><div class="quantity-control"><button data-bag-id="${id}" data-bag-change="-1" aria-label="Decrease ${product.name} quantity" ${quantity === 1 ? 'disabled' : ''}><i class="ti ti-minus" aria-hidden="true"></i></button><output aria-label="Quantity">${quantity}</output><button data-bag-id="${id}" data-bag-change="1" aria-label="Increase ${product.name} quantity" ${quantity === 5 ? 'disabled' : ''}><i class="ti ti-plus" aria-hidden="true"></i></button></div></div><div class="bag-item-end"><strong>${money(product.price * quantity)}</strong><button class="remove-item" data-remove="${id}">Remove</button></div></article>`;
    }).join('');
    content.innerHTML = `<div class="bag-layout"><div class="bag-items">${items}</div><aside class="bag-summary"><h2>A little closer to comfort.</h2><dl><div><dt>Subtotal</dt><dd>${money(total)}</dd></div><div><dt>Shipping</dt><dd>Calculated at checkout</dd></div><div class="total-row"><dt>Total</dt><dd>${money(total)} USD</dd></div></dl><button class="pill pill-dark" id="checkout-button">Continue to checkout<i class="ti ti-arrow-up-right" aria-hidden="true"></i></button><p>Taxes and shipping are calculated before payment.</p><p class="inline-status" id="checkout-status" role="status"></p></aside></div>`;
    if (focusAction) {
      const target = content.querySelector(`[data-bag-id="${focusAction.id}"][data-bag-change="${focusAction.change}"]`);
      if (target && !target.disabled) target.focus({ preventScroll: true });
      else content.querySelector(`[data-remove="${focusAction.id}"]`)?.focus({ preventScroll: true });
    }
  }

  function closeMenu() {
    document.getElementById('navigation').classList.remove('is-open');
    document.getElementById('menu-button').setAttribute('aria-expanded', 'false');
    document.getElementById('menu-button').setAttribute('aria-label', 'Open navigation');
  }

  function route() {
    const hash = location.hash.slice(1) || 'home';
    const [key, category] = hash.split('/');
    const nextPage = ['shop', 'catalog', 'bag', 'support'].includes(key) ? key : 'home';
    const changed = activePage !== nextPage;
    if (activePage === 'home' && changed) homeScroll = window.scrollY;
    activePage = nextPage;
    document.querySelectorAll('[data-page]').forEach(element => { element.hidden = element.dataset.page !== nextPage; });
    document.getElementById('site-header').classList.toggle('is-solid', nextPage !== 'home');
    closeMenu();
    if (nextPage === 'catalog') renderCatalog(category || 'all');
    if (nextPage === 'bag') renderBag();
    const titles = { home: 'A Breath of Nature', shop: 'Meet your fresh air', catalog: 'Everyday essentials', bag: 'Your bag', support: 'Help & care' };
    document.title = `SERE — ${titles[nextPage]}`;
    document.querySelectorAll('.navigation a').forEach(link => {
      if (link.hash === location.hash) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
    if (nextPage !== 'home') {
      if (changed) {
        window.scrollTo({ top: 0, behavior: 'instant' });
        const heading = document.querySelector(`[data-page="${nextPage}"] h1`);
        heading.setAttribute('tabindex', '-1');
        heading.focus({ preventScroll: true });
      }
    } else if (key !== 'home') {
      document.getElementById(key)?.scrollIntoView({ behavior: changed || matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: changed ? homeScroll : 0, behavior: 'instant' });
    }
  }

  function renderQuestions() {
    document.getElementById('faq-list').innerHTML = questions.map((question, index) => `<details class="faq-item" data-question="${index}"><summary>${question.title}<i class="ti ti-plus" aria-hidden="true"></i></summary><p>${question.answer}</p></details>`).join('');
  }

  function searchQuestions() {
    const query = document.getElementById('support-search').value.trim().toLowerCase();
    let matches = 0;
    document.querySelectorAll('[data-question]').forEach(element => {
      const question = questions[Number(element.dataset.question)];
      const visible = `${question.title} ${question.answer} ${question.keywords}`.toLowerCase().includes(query);
      element.hidden = !visible;
      if (visible) matches++;
    });
    document.getElementById('search-empty').hidden = matches !== 0;
  }

  function updateAirflow() {
    const button = document.getElementById('air-power');
    button.setAttribute('aria-pressed', String(airflowOn));
    button.setAttribute('aria-label', airflowOn ? 'Switch airflow off' : 'Switch airflow on');
    const mode = document.getElementById('air-mode');
    mode.disabled = !airflowOn;
    mode.innerHTML = `${airflowOn ? modes[airflowMode] : 'OFF'}<i class="ti ti-chevron-right" aria-hidden="true"></i>`;
    mode.setAttribute('aria-label', `Airflow ${airflowOn ? modes[airflowMode].toLowerCase() : 'off'}. Change mode`);
  }

  function downloadGuide() {
    const text = 'SERE — Help & care\n\n' + questions.map(question => question.title + '\n' + question.answer).join('\n\n');
    const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sere-care-guide.txt';
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    status('guide-status', 'Your care guide is ready.');
  }

  function start() {
    if (document.body.dataset.sereReady === 'true') return;
    document.body.dataset.sereReady = 'true';
    renderQuestions();
    updateCounts();
    updateShopQuantity();
    updateAirflow();
    route();
    window.addEventListener('hashchange', route);
    document.getElementById('support-search').addEventListener('input', searchQuestions);
    document.addEventListener('click', event => {
      const button = event.target.closest('button');
      if (event.target.closest('.navigation a')) closeMenu();
      if (!event.target.closest('.site-header')) closeMenu();
      if (!button || button.disabled) return;
      if (button.dataset.view) location.hash = button.dataset.view;
      else if (button.id === 'menu-button') {
        const expanded = button.getAttribute('aria-expanded') !== 'true';
        document.getElementById('navigation').classList.toggle('is-open', expanded);
        button.setAttribute('aria-expanded', String(expanded));
        button.setAttribute('aria-label', expanded ? 'Close navigation' : 'Open navigation');
      } else if (button.dataset.quantity) {
        shopQuantity = Math.max(1, Math.min(5, shopQuantity + Number(button.dataset.quantity)));
        updateShopQuantity();
        status('shop-status', '');
      } else if (button.id === 'add-purifier') addToBag('purifier', shopQuantity, 'shop-status');
      else if (button.dataset.add) addToBag(button.dataset.add, 1, 'catalog-status');
      else if (button.dataset.filter) renderCatalog(button.dataset.filter);
      else if (button.dataset.bagChange) {
        const id = button.dataset.bagId;
        bag.set(id, Math.max(1, Math.min(5, bag.get(id) + Number(button.dataset.bagChange))));
        updateCounts();
        renderBag({ id, change: button.dataset.bagChange });
      } else if (button.dataset.remove) {
        bag.delete(button.dataset.remove);
        updateCounts();
        renderBag();
        document.querySelector('#bag-content button, #bag-content a')?.focus({ preventScroll: true });
      } else if (button.id === 'checkout-button') status('checkout-status', 'Checkout requires a connected payment service. Your items will stay in this bag while you browse.', true);
      else if (button.id === 'air-power') { airflowOn = !airflowOn; updateAirflow(); }
      else if (button.id === 'air-mode') { airflowMode = (airflowMode + 1) % modes.length; updateAirflow(); }
      else if (button.id === 'clear-search') {
        const input = document.getElementById('support-search');
        input.value = '';
        searchQuestions();
        input.focus();
      } else if (button.id === 'download-guide') downloadGuide();
      else if (button.id === 'contact-support') status('contact-status', 'Support messaging is not connected. You can download the care guide above.', true);
      else if (button.classList.contains('finish-option')) status('shop-status', 'Mist White selected.');
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && document.getElementById('navigation').classList.contains('is-open')) {
        closeMenu();
        document.getElementById('menu-button').focus();
      }
    });
  }
  start();
})();
