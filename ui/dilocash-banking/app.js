/* Dilocash landing — native HTML/CSS/JS. Views, local data, states, motion. */
(() => {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = () => typeof window.gsap !== 'undefined';
  const VIEWS = ['home', 'login', 'signup', 'account', 'cards', 'app'];
  const ICON = (name, cls = 'ico ico-xs') => `<svg class="${cls}" aria-hidden="true"><use href="#i-${name}"/></svg>`;

  const SERVICES = [
    { icon: 'card', name: 'Virtual cards', desc: 'Issue a unique number for every merchant or subscription. Single-use cards close themselves after one charge.', meta: 'Unlimited on Plus and Metal', detail: [['Card networks', 'Visa · Mastercard'], ['Issue time', 'Instant'], ['Single-use', 'Included']] },
    { icon: 'bolt', name: 'Instant transfers', desc: 'Move money between your balance and a local account without waiting for a banking window.', meta: 'Same-day settlement', detail: [['Local rails', 'SEPA · Faster Payments'], ['Cut-off', '18:00 local time'], ['Fee', 'Shown before confirm']] },
    { icon: 'globe', name: 'Multi-currency balance', desc: 'Hold USD, EUR, GBP and SGD in one account and pay in the currency the merchant expects.', meta: '4 currencies', detail: [['Currencies', 'USD · EUR · GBP · SGD'], ['Conversion', 'Mid-market rate'], ['Statement', 'Monthly export']] },
    { icon: 'shield', name: 'Card controls', desc: 'Freeze a card, change its limit or close it entirely from the app, without calling anyone.', meta: 'Always available', detail: [['Freeze', 'Instant'], ['Limit changes', 'Instant'], ['Close card', 'Permanent']] }
  ];
  const HOW_STEPS = [
    { label: 'Step 01', title: 'Create your account', desc: 'Add your name, email and country. We only check the format, so you can start right away.', points: ['No paperwork to upload', 'One account for every card', 'Balance ready immediately'] },
    { label: 'Step 02', title: 'Issue a virtual card', desc: 'Give the card a name, choose single-use or recurring, and set a monthly limit that fits the project.', points: ['Unique number per card', 'Freeze or close at any time', 'Single-use cards expire after one payment'] },
    { label: 'Step 03', title: 'Pay and reconcile', desc: 'Use the card anywhere online. Every charge lands on one statement with the merchant and reference attached.', points: ['Instant payment notification', 'Reference travels with the charge', 'Monthly statement export'] }
  ];
  const BENEFITS = [
    { icon: 'lock', title: 'Numbers that expire', text: 'A single-use card stops working after one charge, so a leaked number cannot be reused.', metric: '1 charge' },
    { icon: 'bolt', title: 'No waiting for plastic', text: 'Cards are generated in the account the moment you need one. There is nothing to post or activate.', metric: 'Instant' },
    { icon: 'globe', title: 'Pay where you work', text: 'Hold four currencies and settle locally, without a separate account in every country.', metric: '4 currencies' }
  ];
  const PLANS = [
    { id: 'Free', price: 0, desc: 'For occasional online payments and a first virtual card.', features: ['3 virtual cards / month', '2.4% card payment fee', 'Local transfers from $0.80', 'Email support'], featured: false },
    { id: 'Plus', price: 9, desc: 'For people who pay online every week and want lower fees.', features: ['Unlimited virtual cards', '1.6% card payment fee', 'Free local transfers', 'Same-day settlement', 'Priority support'], featured: true },
    { id: 'Metal', price: 24, desc: 'For teams moving larger amounts across several currencies.', features: ['Everything in Plus', '0.9% card payment fee', 'Free international transfers', 'Multi-user access', 'Dedicated onboarding'], featured: false }
  ];
  const FAQ = [
    { q: 'Is a virtual card a real card number?', a: 'Yes. Each card has its own number, expiry and security code and works anywhere the network is accepted online.' },
    { q: 'What happens to a single-use card?', a: 'It closes after one successful charge. Any later attempt on that number is declined, and the merchant name stays on your statement.' },
    { q: 'Can I hold more than one currency?', a: 'USD, EUR, GBP and SGD balances sit in the same account. Conversion uses the mid-market rate and is shown before you confirm.' },
    { q: 'How do I close my account?', a: 'Close every open card, withdraw the remaining balance, and ask support to close the account. No monthly fee keeps running after that.' }
  ];
  const TX = [
    { id: 'TX-2481', name: 'Figma · Team plan', kind: 'card', date: '14 Nov, 09:42', amount: '−$45.00', status: 'Settled', ref: 'DC-2481-USD', rail: 'Virtual card · •••• 245' },
    { id: 'TX-2480', name: 'Northwind Studio', kind: 'in', date: '13 Nov, 16:08', amount: '+$6,200.00', status: 'Settled', ref: 'DC-2480-USD', rail: 'Local transfer · USD' },
    { id: 'TX-2478', name: 'Adobe · Creative Cloud', kind: 'card', date: '12 Nov, 11:20', amount: '−$59.99', status: 'Settled', ref: 'DC-2478-USD', rail: 'Virtual card · •••• 882' },
    { id: 'TX-2475', name: 'Sato Illustration', kind: 'out', date: '11 Nov, 08:05', amount: '−$1,480.00', status: 'Settled', ref: 'DC-2475-EUR', rail: 'Local transfer · EUR' },
    { id: 'TX-2471', name: 'Payment attempt · Declined', kind: 'out', date: '10 Nov, 14:31', amount: '−$320.00', status: 'Declined', ref: 'DC-2471-USD', rail: 'Single-use card already closed' },
    { id: 'TX-2469', name: 'Rakuten Commerce', kind: 'in', date: '09 Nov, 10:02', amount: '+$18,400.00', status: 'Settled', ref: 'DC-2469-USD', rail: 'SWIFT · USD' },
    { id: 'TX-2463', name: 'Workspace subscription', kind: 'card', date: '06 Nov, 19:44', amount: '−$120.00', status: 'Settled', ref: 'DC-2463-GBP', rail: 'Virtual card · •••• 116' },
    { id: 'TX-2458', name: 'Currency conversion', kind: 'out', date: '04 Nov, 12:10', amount: '−$12.40', status: 'Settled', ref: 'DC-2458-EUR', rail: 'EUR → USD · mid-market' }
  ];
  const CARDS = [
    { id: 'C-1', name: 'Studio subscriptions', type: 'Recurring', limit: 500, frozen: false, number: '•••• 245' },
    { id: 'C-2', name: 'Travel booking', type: 'Single-use', limit: 1200, frozen: false, number: '•••• 882' },
    { id: 'C-3', name: 'Contractor tools', type: 'Recurring', limit: 300, frozen: true, number: '•••• 116' }
  ];
  const USERS = [
    { name: 'Maya Chen', place: 'Singapore', note: 'Pays 14 contractors monthly' },
    { name: 'Tomas Rivera', place: 'Lisbon', note: 'Uses single-use cards for travel' },
    { name: 'Aiko Tanaka', place: 'Tokyo', note: 'Holds EUR and USD balances' }
  ];
  const SELECTS = {
    signupCountry: [
      { value: 'US', label: 'United States' }, { value: 'GB', label: 'United Kingdom' },
      { value: 'SG', label: 'Singapore' }, { value: 'DE', label: 'Germany' },
      { value: 'AU', label: 'Australia' }, { value: 'JP', label: 'Japan' },
      { value: 'FR', label: 'France' }, { value: 'CA', label: 'Canada' }
    ],
    newCardType: [
      { value: 'Single-use', label: 'Single-use' }, { value: 'Recurring', label: 'Recurring' },
      { value: 'Merchant-locked', label: 'Merchant-locked', disabled: true }
    ]
  };
  const APP_FEATURES = {
    iOS: [['Requires', 'iOS 16 or later'], ['Size', '48 MB'], ['Release', 'Version 4.2'], ['Face ID', 'Supported']],
    Android: [['Requires', 'Android 10 or later'], ['Size', '36 MB'], ['Release', 'Version 4.2'], ['Biometrics', 'Supported']]
  };

  const state = {
    view: 'home', cycle: 'monthly', howStep: 0, platform: 'iOS',
    txKind: 'all', txQuery: '', txData: TX.slice(), openTx: null,
    cardData: CARDS.slice(), cardMasked: false, cardFrozen: false,
    appEmail: '', openService: null, openFaq: new Set()
  };

  /* ---------------- utilities ---------------- */
  function toast(message, icon = 'check') {
    const host = $('#toastHost');
    if (!host) return;
    const node = document.createElement('div');
    node.className = 'toast';
    node.innerHTML = ICON(icon) + '<span></span>';
    $('span', node).textContent = message;
    host.appendChild(node);
    requestAnimationFrame(() => node.classList.add('is-in'));
    setTimeout(() => { node.classList.remove('is-in'); setTimeout(() => node.remove(), 260); }, 2400);
  }

  function iconSwap(button, name) {
    const use = $('use', button);
    if (use) use.setAttribute('href', '#i-' + name);
  }

  async function copyText(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(text);
      else {
        const area = document.createElement('textarea');
        area.value = text; area.style.position = 'fixed'; area.style.opacity = '0';
        document.body.appendChild(area); area.select(); document.execCommand('copy'); area.remove();
      }
      return true;
    } catch (_) { return false; }
  }

  function fieldError(input, message) {
    const err = $(`[data-error-for="${input.id}"]`);
    if (err) { err.textContent = message; err.hidden = !message; }
    if (message) input.setAttribute('aria-invalid', 'true');
    else input.removeAttribute('aria-invalid');
  }

  function validate(root) {
    let first = null;
    $$('[data-required]', root).forEach((input) => {
      if (input.closest('[hidden]')) return;
      let message = '';
      const value = (input.value || '').trim();
      if (input.type === 'checkbox') {
        if (!input.checked) message = 'Please confirm this before continuing.';
      } else if (!value) {
        message = 'This field is required.';
      } else if (input.dataset.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        message = 'Enter a valid email address.';
      } else if (input.dataset.type === 'number' && (!Number.isFinite(Number(value)) || Number(value) <= 0)) {
        message = 'Enter an amount greater than zero.';
      } else if (input.dataset.min && value.length < Number(input.dataset.min)) {
        message = `Use at least ${input.dataset.min} characters.`;
      }
      fieldError(input, message);
      if (message && !first) first = input;
    });
    if (first) first.focus();
    return !first;
  }

  /* ---------------- motion: idempotent start + reusable timelines ---------------- */
  let introTl = null;
  const timelines = new Map();

  function startIntro() {
    $$('#view-home .reveal').forEach((el) => { el.style.opacity = ''; el.style.transform = ''; });
    if (!hasGsap() || REDUCED) return;
    if (introTl) introTl.kill();
    introTl = window.gsap.timeline();
    introTl.fromTo($$('#view-home .reveal'),
      { y: 18, opacity: 0.55 },
      { y: 0, opacity: 1, duration: 0.72, stagger: 0.09, ease: 'power3.out', clearProps: 'transform,opacity' });
  }

  function start() {
    if (introTl) { introTl.kill(); introTl = null; }
    startIntro();
  }

  function animateView(view) {
    if (!hasGsap() || REDUCED) return;
    window.gsap.fromTo(view, { y: 12, opacity: 0.72 },
      { y: 0, opacity: 1, duration: 0.4, ease: 'power2.out', clearProps: 'transform,opacity' });
  }

  function getTimeline(panel) {
    if (timelines.has(panel)) return timelines.get(panel);
    const inner = $('.expand-inner', panel);
    let tl = null;
    if (hasGsap() && !REDUCED && inner) {
      tl = window.gsap.timeline({ paused: true, onReverseComplete: () => { panel.hidden = true; } });
      tl.fromTo(panel, { opacity: 0 }, { opacity: 1, duration: 0.26, ease: 'power2.out' }, 0)
        .fromTo(inner, { y: -8 }, { y: 0, duration: 0.28, ease: 'power2.out' }, 0);
    }
    const api = {
      open() { panel.hidden = false; if (tl) tl.play(); },
      close() { if (tl) tl.reverse(); else panel.hidden = true; },
      isOpen: () => !panel.hidden
    };
    timelines.set(panel, api);
    return api;
  }

  function togglePanel(button, panel) {
    const api = getTimeline(panel);
    const open = !api.isOpen();
    if (open) api.open(); else api.close();
    button.setAttribute('aria-expanded', String(open));
  }

  function bindParallax() {
    if (!hasGsap() || REDUCED) return;
    const visual = $('#heroVisual');
    const art = $('.hero-art');
    const xTo = window.gsap.quickTo(art, 'x', { duration: 0.7, ease: 'power3.out' });
    const yTo = window.gsap.quickTo(art, 'y', { duration: 0.7, ease: 'power3.out' });
    visual.addEventListener('pointermove', (event) => {
      const rect = visual.getBoundingClientRect();
      xTo(((event.clientX - rect.left) / rect.width - 0.5) * 12);
      yTo(((event.clientY - rect.top) / rect.height - 0.5) * 10);
    });
  }

  /* ---------------- views ---------------- */
  function showView(name, options = {}) {
    if (!VIEWS.includes(name)) return;
    VIEWS.forEach((view) => {
      const node = $('#view-' + view);
      if (!node) return;
      node.hidden = view !== name;
      node.classList.toggle('is-active', view === name);
    });
    state.view = name;
    closeMobile();
    closeSelects();
    if (options.scroll !== false) window.scrollTo({ top: 0, behavior: REDUCED ? 'auto' : 'smooth' });
    animateView($('#view-' + name));
    if (options.focus !== false) {
      const heading = $('h1', $('#view-' + name));
      if (heading) heading.focus({ preventScroll: true });
    }
    if (name === 'account') renderTx();
    if (name === 'cards') renderCards();
  }

  function closeMobile() {
    $('#mobilePanel').hidden = true;
    $('#menuToggle').setAttribute('aria-expanded', 'false');
    iconSwap($('#menuToggle'), 'menu');
  }

  function closeSelects(except) {
    $$('.select').forEach((wrap) => {
      if (wrap === except) return;
      $('.select-panel', wrap).hidden = true;
      $('.select-trigger', wrap).setAttribute('aria-expanded', 'false');
    });
  }

  /* ---------------- custom selects ---------------- */
  function buildSelects() {
    $$('.select').forEach((wrap) => {
      const key = wrap.dataset.select;
      const panel = $('.select-panel', wrap);
      const trigger = $('.select-trigger', wrap);
      const hidden = $('input[type="hidden"]', wrap);
      panel.innerHTML = SELECTS[key].map((option) =>
        `<button type="button" class="select-option" role="option" data-value="${option.value}" aria-selected="${option.value === hidden.value}" ${option.disabled ? 'disabled' : ''}>${option.label}${option.value === hidden.value ? ICON('check') : ''}</button>`
      ).join('');
      trigger.addEventListener('click', (event) => {
        event.stopPropagation();
        const open = panel.hidden;
        closeSelects(open ? wrap : null);
        panel.hidden = !open;
        trigger.setAttribute('aria-expanded', String(open));
      });
      panel.addEventListener('click', (event) => {
        const option = event.target.closest('.select-option');
        if (!option || option.disabled) return;
        hidden.value = option.dataset.value;
        $('.select-value', trigger).textContent = option.textContent.trim();
        $$('.select-option', panel).forEach((item) => {
          item.setAttribute('aria-selected', String(item === option));
          const tick = $('use', item);
          if (item === option && !tick) item.insertAdjacentHTML('beforeend', ICON('check'));
          else if (item !== option && tick) tick.closest('svg').remove();
        });
        panel.hidden = true;
        trigger.setAttribute('aria-expanded', 'false');
      });
      trigger.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowDown' || event.key === 'Enter') {
          event.preventDefault();
          panel.hidden = false;
          trigger.setAttribute('aria-expanded', 'true');
          $('.select-option:not(:disabled)', panel)?.focus();
        }
      });
      panel.addEventListener('keydown', (event) => {
        const items = $$('.select-option:not(:disabled)', panel);
        const index = items.indexOf(document.activeElement);
        if (event.key === 'ArrowDown') { event.preventDefault(); items[(index + 1) % items.length].focus(); }
        if (event.key === 'ArrowUp') { event.preventDefault(); items[(index - 1 + items.length) % items.length].focus(); }
        if (event.key === 'Escape') { closeSelects(); trigger.focus(); }
      });
    });
  }

  /* ---------------- connection simulation (memory counter: odd success / even failure) ---------------- */
  const connectionCounts = new Map();
  function nextAttempt(key) {
    const n = (connectionCounts.get(key) || 0) + 1;
    connectionCounts.set(key, n);
    return n % 2 === 1;
  }

  function connect(options) {
    if (options.validate && !options.validate()) return;
    const ok = nextAttempt(options.key);
    const { conn, bar, status, fail, retry } = options.nodes;
    const buttons = options.buttons || [];
    conn.hidden = false;
    fail.hidden = true;
    buttons.forEach((button) => { button.disabled = true; button.classList.add('is-busy'); });
    let pct = 0;
    const timer = setInterval(() => {
      pct = Math.min(100, pct + 9 + Math.random() * 10);
      bar.style.width = pct + '%';
      status.textContent = pct < 38 ? 'Connecting…' : (pct < 78 ? 'Verifying…' : 'Finishing up…');
      if (pct < 100) return;
      clearInterval(timer);
      setTimeout(() => {
        buttons.forEach((button) => { button.disabled = false; button.classList.remove('is-busy'); });
        if (ok) {
          conn.hidden = true;
          bar.style.width = '0';
          options.onSuccess();
        } else {
          status.textContent = 'Connection could not be completed.';
          fail.hidden = false;
          if (options.onFail) options.onFail();
        }
      }, 240);
    }, 120);
    retry.onclick = () => connect(options);
  }

  function bindConnections() {
    const loginOptions = {
      key: 'login',
      nodes: { conn: $('#loginConnection'), bar: $('#loginBar'), status: $('#loginStatus'), fail: $('#loginFail'), retry: $('#loginRetry') },
      buttons: [$('#loginSubmit')],
      validate: () => validate($('#loginForm')),
      onSuccess: () => { showView('account'); toast('Signed in to Dilocash'); }
    };
    $('#loginForm').addEventListener('submit', (event) => { event.preventDefault(); connect(loginOptions); });

    const signupOptions = {
      key: 'signup',
      nodes: { conn: $('#signupConnection'), bar: $('#signupBar'), status: $('#signupStatus'), fail: $('#signupFail'), retry: $('#signupRetry') },
      buttons: [$('#signupSubmit')],
      validate: () => {
        if (!validate($('#signupForm'))) return false;
        const terms = $('#signupTerms');
        if (!terms.checked) { fieldError(terms, 'Please agree to the account terms.'); terms.focus(); return false; }
        fieldError(terms, '');
        return true;
      },
      onSuccess: () => { showView('account'); toast('Account opened — your first card is ready'); }
    };
    $('#signupForm').addEventListener('submit', (event) => { event.preventDefault(); connect(signupOptions); });

    const syncOptions = {
      key: 'sync',
      nodes: { conn: $('#syncConnection'), bar: $('#syncBar'), status: $('#syncStatus'), fail: $('#syncFail'), retry: $('#syncRetry') },
      buttons: [$('#refreshSync')],
      onSuccess: () => {
        state.txData.unshift({ id: 'SYNC-' + Date.now(), name: 'Balance sync', kind: 'in', date: 'Just now', amount: '+$0.00', status: 'Up to date', ref: 'SYNC-LOCAL', rail: 'Local account refresh' });
        renderTx();
        toast('Activity is up to date');
      }
    };
    $('#refreshSync').addEventListener('click', () => connect(syncOptions));

    const cardOptions = {
      key: 'new-card',
      nodes: { conn: $('#cardConnection'), bar: $('#cardBar'), status: $('#cardStatus'), fail: $('#cardFail'), retry: $('#cardRetry') },
      buttons: [$('#newCardSubmit')],
      validate: () => validate($('#newCardForm')),
      onSuccess: () => {
        state.cardData.unshift({
          id: 'C-' + Date.now(), name: $('#newCardName').value.trim(),
          type: $('input[name="cardType"]').value, limit: Number($('#newCardLimit').value),
          frozen: false, number: '•••• ' + Math.floor(100 + Math.random() * 899)
        });
        $('#newCardForm').reset();
        $$('#newCardForm [data-required]').forEach((input) => fieldError(input, ''));
        renderCards();
        toast('New card is ready to use');
      }
    };
    $('#newCardForm').addEventListener('submit', (event) => { event.preventDefault(); connect(cardOptions); });

    const appOptions = {
      key: 'app-link',
      nodes: { conn: $('#appConnection'), bar: $('#appBar'), status: $('#appStatus'), fail: $('#appFail'), retry: $('#appRetry') },
      buttons: [$('#appSubmit')],
      validate: () => validate($('#appLinkForm')),
      onSuccess: () => {
        state.appEmail = $('#appEmail').value.trim();
        $('#appSuccessText').textContent = `Install link prepared for ${state.appEmail}.`;
        $('#appSuccess').hidden = false;
        toast('Install link ready');
      }
    };
    $('#appLinkForm').addEventListener('submit', (event) => { event.preventDefault(); connect(appOptions); });
    $('#copyAppLink').addEventListener('click', async () => {
      const ok = await copyText('https://dilocash.app/get');
      toast(ok ? 'Install link copied' : 'Clipboard unavailable', ok ? 'check' : 'info');
    });
  }

  /* ---------------- home renderers ---------------- */
  function renderHome() {
    $('#serviceList').innerHTML = SERVICES.map((item, index) =>
      `<button type="button" class="service-row" data-service="${index}" aria-expanded="false">
        <span class="svc-icon">${ICON(item.icon, 'ico')}</span><h3>${item.name}</h3><p>${item.desc}</p>${ICON('chevron-right', 'ico ico-sm')}
      </button>
      ${state.openService === index ? `<div class="service-detail">${item.detail.map(([k, v]) => `<div><span>${k}</span><b>${v}</b></div>`).join('')}</div>` : ''}`
    ).join('');
    $$('.service-row').forEach((row) => row.addEventListener('click', () => {
      const index = Number(row.dataset.service);
      state.openService = state.openService === index ? null : index;
      renderHome();
    }));

    $('#howTabs').innerHTML = HOW_STEPS.map((step, index) =>
      `<button type="button" class="how-tab ${index === state.howStep ? 'is-active' : ''}" role="tab" aria-selected="${index === state.howStep}" data-step="${index}">${step.label}</button>`
    ).join('');
    const step = HOW_STEPS[state.howStep];
    $('#howPanel').innerHTML = `<div><span class="how-step">${step.label}</span><h3>${step.title}</h3><p>${step.desc}</p></div><ul>${step.points.map((point) => `<li>${ICON('check', 'ico ico-xs')}<span>${point}</span></li>`).join('')}</ul>`;
    $$('#howTabs .how-tab').forEach((button) => button.addEventListener('click', () => {
      state.howStep = Number(button.dataset.step);
      renderHome();
    }));

    $('#benefitGrid').innerHTML = BENEFITS.map((item) =>
      `<article class="benefit">${ICON(item.icon)}<h3>${item.title}</h3><p>${item.text}</p><b>${item.metric}</b></article>`
    ).join('');

    const yearly = state.cycle === 'yearly';
    $('#planGrid').innerHTML = PLANS.map((plan) => {
      const price = plan.price === 0 ? '$0' : (yearly ? '$' + Math.round(plan.price * 10 / 12) : '$' + plan.price);
      const suffix = plan.price === 0 ? ' / forever' : ' / month';
      return `<article class="plan ${plan.featured ? 'is-featured' : ''}">
        ${plan.featured ? '<span class="plan-tag">Most chosen</span>' : ''}
        <h3>${plan.id}</h3><div class="plan-price">${price}<small>${suffix}</small></div>
        <p class="plan-desc">${plan.desc}</p>
        <ul>${plan.features.map((item) => `<li>${ICON('check', 'ico ico-xs')}<span>${item}</span></li>`).join('')}</ul>
        <button type="button" class="btn ${plan.featured ? 'btn-gold' : 'btn-outline'}" data-plan="${plan.id}">Choose ${plan.id}</button>
      </article>`;
    }).join('');
    $$('[data-plan]').forEach((button) => button.addEventListener('click', () => {
      showView('signup');
      toast(`${button.dataset.plan} selected`);
    }));

    $('#faqList').innerHTML = FAQ.map((item, index) =>
      `<div class="faq-item"><button type="button" class="faq-q" aria-expanded="${state.openFaq.has(index)}" aria-controls="faq-a-${index}">${item.q}${ICON('chevron-down', 'ico ico-sm')}</button><div class="expand-panel faq-a" id="faq-a-${index}" ${state.openFaq.has(index) ? '' : 'hidden'}><div class="expand-inner"><p>${item.a}</p></div></div></div>`
    ).join('');
    $$('.faq-q').forEach((button) => button.addEventListener('click', () => {
      const index = Number(button.getAttribute('aria-controls').split('-').pop());
      if (state.openFaq.has(index)) state.openFaq.delete(index); else state.openFaq.add(index);
      renderHome();
    }));

    $('#userLines').innerHTML = USERS.map((user) => `<div><b>${user.name}</b><span>${user.place}</span><span>${user.note}</span></div>`).join('');
  }

  function bindHome() {
    $('#sealToggle').addEventListener('click', () => togglePanel($('#sealToggle'), $('#sealDetail')));
    $('#usersToggle').addEventListener('click', () => togglePanel($('#usersToggle'), $('#usersDetail')));
    $('#userPlus').addEventListener('click', () => {
      if (!$('#usersDetail').hidden) return;
      togglePanel($('#usersToggle'), $('#usersDetail'));
    });
    $$('.segment').forEach((button) => button.addEventListener('click', () => {
      state.cycle = button.dataset.cycle;
      $$('.segment').forEach((item) => {
        const active = item === button;
        item.classList.toggle('is-active', active);
        item.setAttribute('aria-pressed', String(active));
      });
      renderHome();
    }));
    $('#appTabs').innerHTML = ['iOS', 'Android'].map((platform) =>
      `<button type="button" class="how-tab ${platform === state.platform ? 'is-active' : ''}" role="tab" aria-selected="${platform === state.platform}" data-platform="${platform}">${platform}</button>`
    ).join('');
    renderAppFeatures();
    $$('#appTabs .how-tab').forEach((button) => button.addEventListener('click', () => {
      state.platform = button.dataset.platform;
      $$('#appTabs .how-tab').forEach((tab) => {
        const active = tab === button;
        tab.classList.toggle('is-active', active);
        tab.setAttribute('aria-selected', String(active));
      });
      renderAppFeatures();
    }));
  }

  function renderAppFeatures() {
    $('#appFeatureList').innerHTML = APP_FEATURES[state.platform].map(([k, v]) => `<div><span>${k}</span><b>${v}</b></div>`).join('');
  }

  /* ---------------- account / cards ---------------- */
  function renderTx() {
    const query = state.txQuery.trim().toLowerCase();
    const rows = state.txData.filter((item) =>
      (state.txKind === 'all' || item.kind === state.txKind) &&
      (!query || item.name.toLowerCase().includes(query) || item.ref.toLowerCase().includes(query))
    );
    $('#txList').innerHTML = rows.map((item) =>
      `<button type="button" class="tx-row" data-tx-id="${item.id}" aria-expanded="${state.openTx === item.id}">
        <span><span class="tx-name">${item.name}</span><br><span class="tx-meta">${item.ref}</span></span>
        <span class="tx-date">${item.date}</span><span class="tx-status">${item.status}</span>
        <span class="tx-amount ${item.kind === 'in' ? 'is-in' : ''}">${item.amount}</span>${ICON('chevron-down', 'ico ico-xs')}
      </button>
      ${state.openTx === item.id ? `<div class="tx-detail"><div><span>Rail</span><b>${item.rail}</b></div><div><span>Reference</span><b>${item.ref}</b></div><div><span>Status</span><b>${item.status}</b></div></div>` : ''}`
    ).join('');
    $('#txCount').textContent = `${rows.length} transaction${rows.length === 1 ? '' : 's'}`;
    $('#txEmpty').hidden = rows.length !== 0;
  }

  function bindAccount() {
    $('#txSearch').addEventListener('input', (event) => { state.txQuery = event.target.value; renderTx(); });
    $$('.chips [data-tx]').forEach((button) => button.addEventListener('click', () => {
      state.txKind = button.dataset.tx;
      $$('.chips [data-tx]').forEach((chip) => {
        const active = chip === button;
        chip.classList.toggle('is-active', active);
        chip.setAttribute('aria-pressed', String(active));
      });
      renderTx();
    }));
    $('#clearTx').addEventListener('click', () => {
      state.txQuery = ''; state.txKind = 'all'; $('#txSearch').value = '';
      $$('.chips [data-tx]').forEach((chip) => {
        const active = chip.dataset.tx === 'all';
        chip.classList.toggle('is-active', active);
        chip.setAttribute('aria-pressed', String(active));
      });
      renderTx();
    });
    $('#txList').addEventListener('click', (event) => {
      const row = event.target.closest('[data-tx-id]');
      if (!row) return;
      state.openTx = state.openTx === row.dataset.txId ? null : row.dataset.txId;
      renderTx();
    });
    $('#toggleCardNumber').addEventListener('click', () => {
      state.cardMasked = !state.cardMasked;
      $('#accountCardNumber').textContent = state.cardMasked ? '•••• •••• •••• 245' : '1234 5678 9012 245';
      $('#toggleCardNumberLabel').textContent = state.cardMasked ? 'Show card number' : 'Hide card number';
      iconSwap($('#toggleCardNumber'), state.cardMasked ? 'eye' : 'eye-off');
      toast(state.cardMasked ? 'Card number hidden' : 'Card number visible');
    });
    $('#freezeCard').addEventListener('click', () => {
      state.cardFrozen = !state.cardFrozen;
      $('#miniCard').classList.toggle('is-frozen', state.cardFrozen);
      $('#cardStateBadge').textContent = state.cardFrozen ? 'Frozen' : 'Active';
      $('#cardStateBadge').classList.toggle('is-frozen', state.cardFrozen);
      $('#freezeCardLabel').textContent = state.cardFrozen ? 'Unfreeze card' : 'Freeze card';
      toast(state.cardFrozen ? 'Card frozen — new charges are blocked' : 'Card active again');
    });
    $('#logoutBtn').addEventListener('click', () => { state.openTx = null; showView('login'); toast('Signed out'); });
  }

  function renderCards() {
    $('#cardList').innerHTML = state.cardData.map((card) =>
      `<div class="card-row ${card.frozen ? 'is-frozen' : ''}">
        <span class="card-icon">${ICON('card', 'ico ico-sm')}</span>
        <span><strong>${card.name}</strong><span>${card.type} · ${card.number}</span></span>
        <span class="card-limit">$${card.limit.toLocaleString('en-US')} / mo</span>
        <button type="button" data-card="${card.id}">${card.frozen ? 'Unfreeze' : 'Freeze'}</button>
      </div>`
    ).join('');
    $('#cardCount').textContent = `${state.cardData.length} card${state.cardData.length === 1 ? '' : 's'}`;
    $('#cardEmpty').hidden = state.cardData.length !== 0;
    $$('[data-card]').forEach((button) => button.addEventListener('click', () => {
      const card = state.cardData.find((item) => item.id === button.dataset.card);
      if (!card) return;
      card.frozen = !card.frozen;
      renderCards();
      toast(card.frozen ? `${card.name} frozen` : `${card.name} active again`);
    }));
  }

  /* ---------------- global delegation ---------------- */
  function bindGlobal() {
    document.addEventListener('click', (event) => {
      const nav = event.target.closest('[data-nav]');
      if (nav) {
        event.preventDefault();
        showView(nav.dataset.nav);
        return;
      }
      const scroll = event.target.closest('[data-scroll]');
      if (scroll) {
        event.preventDefault();
        const target = document.getElementById(scroll.dataset.scroll);
        if (!target) return;
        if (state.view !== 'home') showView('home', { focus: false, scroll: false });
        requestAnimationFrame(() => target.scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth', block: 'start' }));
        return;
      }
      if (!event.target.closest('.select')) closeSelects();
      if (!event.target.closest('.topbar')) closeMobile();
    });
    $('#menuToggle').addEventListener('click', (event) => {
      event.stopPropagation();
      const panel = $('#mobilePanel');
      const open = panel.hidden;
      panel.hidden = !open;
      $('#menuToggle').setAttribute('aria-expanded', String(open));
      iconSwap($('#menuToggle'), open ? 'x' : 'menu');
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') { closeMobile(); closeSelects(); }
    });
    $('#toggleLoginPassword').addEventListener('click', () => {
      const input = $('#loginPassword');
      const showing = input.type === 'text';
      input.type = showing ? 'password' : 'text';
      iconSwap($('#toggleLoginPassword'), showing ? 'eye' : 'eye-off');
      $('#toggleLoginPassword').setAttribute('aria-label', showing ? 'Show password' : 'Hide password');
      input.focus();
    });
    $$('input[data-required]').forEach((input) => input.addEventListener('input', () => fieldError(input, '')));
  }

  /* ---------------- boot ---------------- */
  let booted = false;
  function boot() {
    if (booted) return;
    booted = true;
    try { bindGlobal(); } catch (error) { console.error('global', error); }
    try { buildSelects(); } catch (error) { console.error('selects', error); }
    try { renderHome(); bindHome(); } catch (error) { console.error('home', error); }
    try { bindConnections(); } catch (error) { console.error('connections', error); }
    try { bindAccount(); renderTx(); renderCards(); } catch (error) { console.error('account', error); }
    try { bindParallax(); } catch (error) { console.error('parallax', error); }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { boot(); start(); });
  } else { boot(); start(); }
  window.addEventListener('pageshow', (event) => { if (event.persisted) start(); });
})();
