/* Oppopay landing — self-contained native JS.
   Views, local data, states and motion. No build step, no remote data. */
(() => {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = () => typeof window.gsap !== 'undefined';
  const VIEWS = ['home', 'pricing', 'developers', 'login', 'apply', 'account', 'story'];

  const ICON = (name, cls = 'ico ico-xs') => `<svg class="${cls}" aria-hidden="true"><use href="#i-${name}"/></svg>`;

  const STORIES = [
    { name: 'Lattice', summary: 'Paying eleven countries of illustrators without a finance team', meta: 'Design studio' },
    { name: 'Monday', summary: 'One statement for every project card and contractor invoice', meta: 'Software team' },
    { name: 'Rakuten', summary: 'Local rails for regional partners, settled the same day', meta: 'Commerce' }
  ];
  const PLANS = [
    { id: 'Starter', price: 0, desc: 'For freelancers sending their first international invoice.', features: ['Receive payments free', '3 virtual cards', 'Local payouts', 'Email support'], featured: false },
    { id: 'Growth', price: 29, desc: 'For studios paying a distributed team every month.', features: ['Everything in Starter', '25 virtual cards', 'Same-day settlement', 'Accountant-ready exports', 'Priority support'], featured: true },
    { id: 'Scale', price: null, desc: 'For platforms embedding payouts into their own product.', features: ['Custom transaction rates', 'Unlimited virtual cards', 'API and webhooks', 'Dedicated onboarding'], featured: false }
  ];
  const FAQ = [
    { q: 'Is there a fee to receive money?', a: 'No. Incoming client payments are free on every plan. Fees apply only when you move money out or accept a card payment.' },
    { q: 'When can I settle a balance?', a: 'Choose same-day or T+1 transfer when you confirm a payout. The fee for the option you pick is shown before you confirm.' },
    { q: 'Can I issue cards to contractors?', a: 'Yes. Each card has its own limit and can be frozen or closed without affecting the others. Starter includes 3, Growth includes 25.' },
    { q: 'What do I need to open an account?', a: 'Registration details for the business, a website, the countries you pay into, and an estimate of monthly volume. You can save the application file and finish later.' }
  ];
  const ENDPOINTS = [
    { method: 'POST', path: '/v1/payouts', desc: 'Create a payout to a recipient' },
    { method: 'GET', path: '/v1/payouts/{id}', desc: 'Retrieve a payout and its status' },
    { method: 'GET', path: '/v1/balances', desc: 'List available and pending balances' },
    { method: 'POST', path: '/v1/cards', desc: 'Issue a virtual card' },
    { method: 'DELETE', path: '/v1/cards/{id}', desc: 'Close a virtual card' },
    { method: 'GET', path: '/v1/transactions', desc: 'List transactions with filters' },
    { method: 'POST', path: '/v1/webhooks', desc: 'Register a webhook endpoint' },
    { method: 'GET', path: '/v1/rates', desc: 'Current settlement windows and fees' },
    { method: 'POST', path: '/v1/recipients', desc: 'Add a payout recipient' },
    { method: 'GET', path: '/v1/statements', desc: 'Download a monthly statement' }
  ];
  const TX = [
    { id: 'OP-24815', name: 'Jenifer Cole · Design retainer', kind: 'in', date: '14 Nov, 09:42', amount: '+$14,800.00', status: 'Settled', rail: 'Visa · Local settlement', ref: 'OP-24815-USD' },
    { id: 'OP-24814', name: 'Ark Motion · Storyboard', kind: 'out', date: '13 Nov, 16:08', amount: '−$2,450.00', status: 'Settled', rail: 'Local transfer · EUR', ref: 'OP-24814-EUR' },
    { id: 'OP-24811', name: 'Northwind Studio', kind: 'in', date: '12 Nov, 11:20', amount: '+$6,200.00', status: 'Settled', rail: 'SEPA · EUR', ref: 'OP-24811-EUR' },
    { id: 'OP-24809', name: 'Card · Figma subscription', kind: 'out', date: '11 Nov, 08:05', amount: '−$45.00', status: 'Settled', rail: 'Virtual card · 7642', ref: 'OP-24809-USD' },
    { id: 'OP-24806', name: 'Payment attempt · Declined', kind: 'out', date: '11 Nov, 08:16', amount: '−$1,450.00', status: 'Declined', rail: 'Card issuer declined', ref: 'OP-24806-USD' },
    { id: 'OP-24802', name: 'Sato Illustration', kind: 'out', date: '09 Nov, 14:31', amount: '−$3,180.00', status: 'Settled', rail: 'Local transfer · SGD', ref: 'OP-24802-SGD' },
    { id: 'OP-24798', name: 'Rakuten Commerce', kind: 'in', date: '08 Nov, 10:02', amount: '+$18,400.00', status: 'Settled', rail: 'SWIFT · USD', ref: 'OP-24798-USD' },
    { id: 'OP-24791', name: 'Card · Workspace', kind: 'out', date: '06 Nov, 19:44', amount: '−$120.00', status: 'Settled', rail: 'Virtual card · 7642', ref: 'OP-24791-USD' }
  ];
  const CODE = {
    curl: `curl https://api.oppopy.io/v1/payouts \\
  -H "Authorization: Bearer sk_test_4f82" \\
  -H "Content-Type: application/json" \\
  -d '{
    "recipient": "rec_8Hk21",
    "amount": 245000,
    "currency": "EUR",
    "reference": "INV-2026-114"
  }'`,
    node: `import Oppopay from '@oppopy/sdk';

const oppopy = new Oppopay('sk_test_4f82');

const payout = await oppopy.payouts.create({
  recipient: 'rec_8Hk21',
  amount: 245000,
  currency: 'EUR',
  reference: 'INV-2026-114'
});

console.log(payout.status);`,
    python: `from oppopy import Oppopay

client = Oppopay("sk_test_4f82")

payout = client.payouts.create(
    recipient="rec_8Hk21",
    amount=245000,
    currency="EUR",
    reference="INV-2026-114",
)

print(payout.status)`
  };
  const SELECTS = {
    country: [
      { value: 'US', label: 'United States' }, { value: 'GB', label: 'United Kingdom' },
      { value: 'SG', label: 'Singapore' }, { value: 'DE', label: 'Germany' },
      { value: 'AU', label: 'Australia' }, { value: 'JP', label: 'Japan' },
      { value: 'FR', label: 'France' }, { value: 'CA', label: 'Canada' }
    ],
    businessType: [
      { value: 'Design studio', label: 'Design studio' }, { value: 'Software company', label: 'Software company' },
      { value: 'Agency', label: 'Agency' }, { value: 'Sole trader', label: 'Sole trader' },
      { value: 'Marketplace', label: 'Marketplace', disabled: true }
    ],
    currency: [
      { value: 'USD', label: 'USD — US Dollar' }, { value: 'EUR', label: 'EUR — Euro' },
      { value: 'GBP', label: 'GBP — Pound Sterling' }, { value: 'SGD', label: 'SGD — Singapore Dollar' },
      { value: 'AUD', label: 'AUD — Australian Dollar' }
    ]
  };

  const state = {
    view: 'home',
    cycle: 'monthly',
    plan: 'Growth',
    lang: 'curl',
    keyVisible: false,
    apiKey: 'sk_test_4f82c1d7e9a04b6',
    endpointMethod: 'all',
    endpointQuery: '',
    txKind: 'all',
    txQuery: '',
    txData: TX.slice(),
    applyStep: 1,
    applyData: {},
    receiptRef: '',
    cardFlipped: false,
    cardMasked: false,
    cardFrozen: false,
    openExpanders: new Set(),
    openTx: null
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
    setTimeout(() => {
      node.classList.remove('is-in');
      setTimeout(() => node.remove(), 260);
    }, 2400);
  }

  function setStatus(node, message, kind = '') {
    if (!node) return;
    node.textContent = message;
    node.hidden = !message;
    node.classList.toggle('is-error', kind === 'error');
    node.classList.toggle('is-ok', kind === 'ok');
  }

  function iconSwap(button, name) {
    const use = $('use', button);
    if (use) use.setAttribute('href', '#i-' + name);
  }

  async function copyText(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const area = document.createElement('textarea');
        area.value = text;
        area.style.position = 'fixed';
        area.style.opacity = '0';
        document.body.appendChild(area);
        area.select();
        document.execCommand('copy');
        area.remove();
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
    const els = $$('#view-home .reveal');
    introTl = window.gsap.timeline();
    introTl.fromTo(els,
      { y: 16, opacity: 0.55 },
      { y: 0, opacity: 1, duration: 0.72, stagger: 0.075, ease: 'power3.out', clearProps: 'transform,opacity' });
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
      // Height is never animated: the panel is measured while hidden by GSAP only
      // if we animate it, which collapses hidden panels to zero. Opacity + offset
      // keep the reveal reversible without depending on measurement.
      tl = window.gsap.timeline({
        paused: true,
        onReverseComplete: () => { panel.hidden = true; }
      });
      tl.fromTo(panel, { opacity: 0 }, { opacity: 1, duration: 0.26, ease: 'power2.out' }, 0)
        .fromTo(inner, { y: -8 }, { y: 0, duration: 0.28, ease: 'power2.out' }, 0);
    }
    const api = {
      open() { panel.hidden = false; if (tl) tl.play(); },
      close() { if (tl) tl.reverse(); else { panel.hidden = true; } },
      isOpen: () => !panel.hidden
    };
    timelines.set(panel, api);
    return api;
  }

  function togglePanel(button, panel, soloGroup) {
    const api = getTimeline(panel);
    const willOpen = !api.isOpen();
    if (soloGroup) {
      soloGroup.forEach(([otherButton, otherPanel]) => {
        if (otherPanel !== panel && getTimeline(otherPanel).isOpen()) {
          getTimeline(otherPanel).close();
          otherButton.setAttribute('aria-expanded', 'false');
        }
      });
    }
    if (willOpen) api.open(); else api.close();
    button.setAttribute('aria-expanded', String(willOpen));
    state.openExpanders.delete(panel.id);
    if (willOpen) state.openExpanders.add(panel.id);
  }

  function bindGlow() {
    if (!hasGsap() || REDUCED) return;
    const visual = $('#heroVisual');
    const glow = $('#visualGlow');
    const xTo = window.gsap.quickTo(glow, 'x', { duration: 0.7, ease: 'power3.out' });
    const yTo = window.gsap.quickTo(glow, 'y', { duration: 0.7, ease: 'power3.out' });
    visual.addEventListener('pointermove', (event) => {
      const rect = visual.getBoundingClientRect();
      xTo(event.clientX - rect.left - rect.width * 0.34);
      yTo(event.clientY - rect.top - rect.height * 0.3);
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
    $$('.mainnav .nav-link[data-nav]').forEach((link) => link.classList.toggle('is-active', link.dataset.nav === name));
    closeDropdowns();
    closeSelects();
    closeMobile();
    if (options.scroll !== false) window.scrollTo({ top: 0, behavior: REDUCED ? 'auto' : 'smooth' });
    const active = $('#view-' + name);
    animateView(active);
    if (options.focus !== false) {
      const heading = $('h1', active);
      if (heading) heading.focus({ preventScroll: true });
    }
    if (name === 'developers') renderEndpoints();
    if (name === 'account') renderTx();
    if (name === 'apply') renderSteps();
  }

  /* ---------------- dropdowns / mobile ---------------- */
  function closeDropdowns(except) {
    $$('.dropdown').forEach((wrap) => {
      if (wrap === except) return;
      const panel = $('.dropdown-panel', wrap);
      const trigger = $('.dropdown-trigger', wrap);
      if (panel) panel.hidden = true;
      if (trigger) trigger.setAttribute('aria-expanded', 'false');
    });
  }

  function closeMobile() {
    const panel = $('#mobilePanel');
    const toggle = $('#menuToggle');
    if (panel) panel.hidden = true;
    if (toggle) { toggle.setAttribute('aria-expanded', 'false'); iconSwap(toggle, 'menu'); }
  }

  function closeSelects(except) {
    $$('.select').forEach((wrap) => {
      if (wrap === except) return;
      const panel = $('.select-panel', wrap);
      const trigger = $('.select-trigger', wrap);
      if (panel) panel.hidden = true;
      if (trigger) trigger.setAttribute('aria-expanded', 'false');
    });
  }

  function bindDropdowns() {
    $$('.dropdown-trigger').forEach((trigger) => {
      trigger.addEventListener('click', (event) => {
        event.stopPropagation();
        const wrap = trigger.closest('.dropdown');
        const panel = $('.dropdown-panel', wrap);
        const open = panel.hidden;
        closeDropdowns(open ? wrap : null);
        closeSelects();
        panel.hidden = !open;
        trigger.setAttribute('aria-expanded', String(open));
      });
    });
    $('#menuToggle').addEventListener('click', (event) => {
      event.stopPropagation();
      const panel = $('#mobilePanel');
      const open = panel.hidden;
      panel.hidden = !open;
      $('#menuToggle').setAttribute('aria-expanded', String(open));
      iconSwap($('#menuToggle'), open ? 'x' : 'menu');
      closeDropdowns();
    });
    document.addEventListener('click', (event) => {
      if (!event.target.closest('.dropdown')) closeDropdowns();
      if (!event.target.closest('.select')) closeSelects();
      if (!event.target.closest('.topbar')) closeMobile();
    });
    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape') return;
      closeDropdowns(); closeSelects(); closeMobile();
    });
  }

  /* ---------------- custom selects ---------------- */
  function buildSelects() {
    $$('.select').forEach((wrap) => {
      const key = wrap.dataset.select;
      const panel = $('.select-panel', wrap);
      const trigger = $('.select-trigger', wrap);
      const hidden = $('input[type="hidden"]', wrap);
      const options = SELECTS[key] || [];
      panel.innerHTML = options.map((option) =>
        `<button type="button" class="select-option" role="option" data-value="${option.value}" aria-selected="${option.value === hidden.value}" ${option.disabled ? 'disabled' : ''}>${option.label}${option.value === hidden.value ? ICON('check') : ''}</button>`
      ).join('');
      trigger.addEventListener('click', (event) => {
        event.stopPropagation();
        const open = panel.hidden;
        closeSelects(open ? wrap : null);
        closeDropdowns();
        panel.hidden = !open;
        trigger.setAttribute('aria-expanded', String(open));
      });
      panel.addEventListener('click', (event) => {
        const option = event.target.closest('.select-option');
        if (!option || option.disabled) return;
        hidden.value = option.dataset.value;
        $('.select-value', trigger).textContent = option.textContent.replace(/\s+$/, '');
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

  /* ---------------- home renderers ---------------- */
  const noticeGroup = () => [
    [$('#noticePaid'), $('#paidDetail')],
    [$('#noticeDeclined'), $('#declinedDetail')]
  ];

  function bindHome() {
    $('#ratingToggle').addEventListener('click', () => togglePanel($('#ratingToggle'), $('#ratingDetail')));
    $('#processToggle').addEventListener('click', () => togglePanel($('#processToggle'), $('#processPanel')));
    $('#noticePaid').addEventListener('click', () => togglePanel($('#noticePaid'), $('#paidDetail'), noticeGroup()));
    $('#noticeDeclined').addEventListener('click', () => togglePanel($('#noticeDeclined'), $('#declinedDetail'), noticeGroup()));

    const card = $('#paycard');
    const flip = () => {
      state.cardFlipped = !state.cardFlipped;
      card.classList.toggle('is-flipped', state.cardFlipped);
      card.setAttribute('aria-label', state.cardFlipped ? 'Flip the card to see the front' : 'Flip the card to see the back');
    };
    card.addEventListener('click', flip);
    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); flip(); }
    });

    $('#storyList').innerHTML = STORIES.map((story) =>
      `<button type="button" class="story-row" data-nav="story"><strong>${story.name}</strong><span>${story.summary}</span>${ICON('arrow-right', 'ico')}</button>`
    ).join('');
  }

  /* ---------------- pricing ---------------- */
  function renderPlans() {
    const yearly = state.cycle === 'yearly';
    $('#planGrid').innerHTML = PLANS.map((plan) => {
      const price = plan.price === null ? 'Custom' : (plan.price === 0 ? '$0' : `$${yearly ? Math.round(plan.price * 0.8) : plan.price}`);
      const suffix = plan.price === null ? '' : (plan.price === 0 ? ' / forever' : ' / month');
      return `<article class="plan ${plan.featured ? 'is-featured' : ''}">
        ${plan.featured ? '<span class="plan-tag">Most chosen</span>' : ''}
        <h2>${plan.id}</h2>
        <div class="plan-price">${price}<small>${suffix}</small></div>
        <p class="plan-desc">${plan.desc}</p>
        <ul>${plan.features.map((item) => `<li>${ICON('check', 'ico ico-xs')}<span>${item}</span></li>`).join('')}</ul>
        <button type="button" class="btn ${plan.featured ? 'btn-dark' : 'btn-outline'} btn-pill" data-choose-plan="${plan.id}">${plan.price === null ? 'Talk to sales' : 'Choose ' + plan.id}</button>
      </article>`;
    }).join('');
  }

  function renderFaq() {
    $('#faqList').innerHTML = FAQ.map((item, index) =>
      `<div class="faq-item">
        <button type="button" class="faq-q" aria-expanded="false" aria-controls="faq-a-${index}">${item.q}${ICON('chevron-down', 'ico ico-sm')}</button>
        <div class="expand-panel faq-a" id="faq-a-${index}" hidden><div class="expand-inner"><p>${item.a}</p></div></div>
      </div>`
    ).join('');
    $$('.faq-q').forEach((button) => {
      button.addEventListener('click', () => {
        const panel = document.getElementById(button.getAttribute('aria-controls'));
        togglePanel(button, panel, $$('.faq-q').map((q) => [q, document.getElementById(q.getAttribute('aria-controls'))]));
      });
    });
  }

  function bindPricing() {
    $$('.segment').forEach((button) => button.addEventListener('click', () => {
      state.cycle = button.dataset.cycle;
      $$('.segment').forEach((item) => {
        const active = item === button;
        item.classList.toggle('is-active', active);
        item.setAttribute('aria-pressed', String(active));
      });
      renderPlans();
    }));
    $('#planGrid').addEventListener('click', (event) => {
      const button = event.target.closest('[data-choose-plan]');
      if (!button) return;
      state.plan = button.dataset.choosePlan;
      showView('apply');
      toast(`${state.plan} selected for your application`);
    });
  }

  /* ---------------- developers ---------------- */
  function renderCode() {
    $('#codeSample').textContent = CODE[state.lang];
  }

  function renderEndpoints() {
    const query = state.endpointQuery.trim().toLowerCase();
    const rows = ENDPOINTS.filter((item) =>
      (state.endpointMethod === 'all' || item.method === state.endpointMethod) &&
      (!query || item.path.toLowerCase().includes(query) || item.desc.toLowerCase().includes(query))
    );
    $('#endpointList').innerHTML = rows.map((item) =>
      `<div class="endpoint-row"><span class="method ${item.method}">${item.method}</span><span class="endpoint-path">${item.path}</span><span class="endpoint-desc">${item.desc}</span></div>`
    ).join('');
    $('#endpointCount').textContent = `${rows.length} endpoint${rows.length === 1 ? '' : 's'}`;
    $('#endpointEmpty').hidden = rows.length !== 0;
  }

  function refreshList(loadingNode, render, delay = 620) {
    loadingNode.hidden = false;
    setTimeout(() => { loadingNode.hidden = true; render(); toast('List is up to date'); }, delay);
  }

  function bindDevelopers() {
    $$('.tab').forEach((button) => button.addEventListener('click', () => {
      state.lang = button.dataset.lang;
      $$('.tab').forEach((tab) => {
        const active = tab === button;
        tab.classList.toggle('is-active', active);
        tab.setAttribute('aria-selected', String(active));
      });
      renderCode();
    }));

    $('#copyCode').addEventListener('click', async () => {
      const ok = await copyText(CODE[state.lang]);
      toast(ok ? 'Code copied to clipboard' : 'Clipboard unavailable — select the code manually', ok ? 'check' : 'info');
      if (ok) { $('#copyCodeLabel').textContent = 'Copied'; setTimeout(() => { $('#copyCodeLabel').textContent = 'Copy'; }, 1600); }
    });

    $('#toggleKey').addEventListener('click', () => {
      state.keyVisible = !state.keyVisible;
      $('#apiKey').textContent = state.keyVisible ? state.apiKey : '••••••••••••••••••••••••sk_test_4f82';
      iconSwap($('#toggleKey'), state.keyVisible ? 'eye-off' : 'eye');
      $('#toggleKey').setAttribute('aria-label', state.keyVisible ? 'Hide API key' : 'Show API key');
    });
    $('#copyKey').addEventListener('click', async () => {
      const ok = await copyText(state.apiKey);
      toast(ok ? 'Test key copied' : 'Clipboard unavailable', ok ? 'check' : 'info');
    });
    $('#rotateKey').addEventListener('click', () => {
      state.apiKey = 'sk_test_' + Math.random().toString(16).slice(2, 14);
      state.keyVisible = false;
      $('#apiKey').textContent = '••••••••••••••••••••••••sk_test_4f82';
      $('#keyStatus').textContent = 'Test key · rotated just now';
      toast('Key rotated — update your integration');
    });

    $('#endpointSearch').addEventListener('input', (event) => { state.endpointQuery = event.target.value; renderEndpoints(); });
    $$('.chips [data-method]').forEach((button) => button.addEventListener('click', () => {
      state.endpointMethod = button.dataset.method;
      $$('.chips [data-method]').forEach((chip) => {
        const active = chip === button;
        chip.classList.toggle('is-active', active);
        chip.setAttribute('aria-pressed', String(active));
      });
      renderEndpoints();
    }));
    $('#clearEndpoints').addEventListener('click', () => {
      state.endpointQuery = '';
      state.endpointMethod = 'all';
      $('#endpointSearch').value = '';
      $$('.chips [data-method]').forEach((chip) => {
        const active = chip.dataset.method === 'all';
        chip.classList.toggle('is-active', active);
        chip.setAttribute('aria-pressed', String(active));
      });
      renderEndpoints();
    });
    $('#refreshEndpoints').addEventListener('click', () => refreshList($('#endpointLoading'), renderEndpoints));
  }

  /* ---------------- login ---------------- */
  function bindLogin() {
    $('#togglePassword').addEventListener('click', () => {
      const input = $('#loginPassword');
      const showing = input.type === 'text';
      input.type = showing ? 'password' : 'text';
      iconSwap($('#togglePassword'), showing ? 'eye' : 'eye-off');
      $('#togglePassword').setAttribute('aria-label', showing ? 'Show password' : 'Hide password');
      input.focus();
    });
    $('#forgotToggle').addEventListener('click', () => togglePanel($('#forgotToggle'), $('#resetPanel')));
    $('#sendReset').addEventListener('click', () => {
      if (!validate($('#resetPanel'))) { setStatus($('#resetStatus'), 'Enter a valid email address.', 'error'); return; }
      setStatus($('#resetStatus'), `Reset link prepared for ${$('#resetEmail').value.trim()}.`, 'ok');
    });
    $$('#loginForm input').forEach((input) => input.addEventListener('input', () => fieldError(input, '')));
    $('#loginForm').addEventListener('submit', (event) => {
      event.preventDefault();
      if (!validate($('#loginForm'))) { setStatus($('#loginStatus'), 'Check the highlighted fields.', 'error'); return; }
      const button = $('#loginSubmit');
      button.classList.add('is-busy');
      button.disabled = true;
      setStatus($('#loginStatus'), 'Opening your workspace…');
      setTimeout(() => {
        button.classList.remove('is-busy');
        button.disabled = false;
        setStatus($('#loginStatus'), '');
        showView('account');
        toast('Signed in to Lattice Studio Ltd');
      }, 620);
    });
  }

  /* ---------------- application ---------------- */
  const STEP_LABELS = ['Business', 'Payouts', 'Review'];

  function renderSteps() {
    $('#applySteps').innerHTML = STEP_LABELS.map((label, index) => {
      const number = index + 1;
      const cls = number === state.applyStep ? 'is-current' : (number < state.applyStep ? 'is-done' : '');
      return `<span class="step ${cls}"><b>${number < state.applyStep ? '✓' : String(number).padStart(2, '0')}</b><span>${label}</span></span>`;
    }).join('');
    $$('.step-pane').forEach((pane) => { pane.hidden = Number(pane.dataset.step) !== state.applyStep; });
    $('#applyBack').disabled = state.applyStep === 1;
    $('#applyNext').hidden = state.applyStep === 3;
    $('#applySubmit').hidden = state.applyStep !== 3;
    if (state.applyStep === 3) renderReview();
  }

  function readApply() {
    const form = $('#applyForm');
    return {
      company: $('#companyName').value.trim(),
      site: $('#companySite').value.trim(),
      country: $('input[name="country"]', form).value,
      businessType: $('input[name="businessType"]', form).value,
      currency: $('input[name="currency"]', form).value,
      volume: $('#monthlyVolume').value.trim(),
      useCase: $('#useCase').value.trim(),
      cards: $('#needsCards').checked,
      plan: state.plan
    };
  }

  function renderReview() {
    const data = readApply();
    const rows = [
      ['Plan', data.plan], ['Registered name', data.company], ['Website', data.site],
      ['Country', SELECTS.country.find((item) => item.value === data.country)?.label || data.country],
      ['Business type', data.businessType],
      ['Settlement currency', SELECTS.currency.find((item) => item.value === data.currency)?.label || data.currency],
      ['Monthly volume', `$${Number(data.volume || 0).toLocaleString('en-US')}`],
      ['Virtual cards', data.cards ? 'Yes' : 'No'], ['Use case', data.useCase]
    ];
    $('#applyReview').innerHTML = rows.map(([label, value]) => `<div><span>${label}</span><b>${value}</b></div>`).join('');
  }

  function resetApplication() {
    state.applyStep = 1;
    state.applyData = {};
    state.receiptRef = '';
    $('#applyForm').reset();
    $('#applyReceipt').hidden = true;
    $('#applyForm').hidden = false;
    $('#applyActions').hidden = false;
    $$('.select').forEach((wrap) => {
      const key = wrap.dataset.select;
      const first = SELECTS[key][0];
      $('input[type="hidden"]', wrap).value = first.value;
      $('.select-value', wrap).textContent = first.label;
      $$('.select-option', wrap).forEach((option, index) => {
        option.setAttribute('aria-selected', String(index === 0));
        const tick = $('use', option);
        if (index === 0 && !tick) option.insertAdjacentHTML('beforeend', ICON('check'));
        else if (index !== 0 && tick) tick.closest('svg').remove();
      });
    });
    $$('#applyForm [data-required]').forEach((input) => fieldError(input, ''));
    renderSteps();
  }

  function bindApply() {
    $$('#applyForm [data-required]').forEach((input) => input.addEventListener('input', () => fieldError(input, '')));
    $('#applyBack').addEventListener('click', () => { if (state.applyStep > 1) { state.applyStep -= 1; renderSteps(); } });
    $('#applyNext').addEventListener('click', () => {
      const pane = $(`.step-pane[data-step="${state.applyStep}"]`);
      if (!validate(pane)) return;
      state.applyStep += 1;
      renderSteps();
    });
    $('#applyForm').addEventListener('submit', (event) => {
      event.preventDefault();
      const terms = $('#confirmTerms');
      if (!terms.checked) { fieldError(terms, 'Please confirm this before continuing.'); terms.focus(); return; }
      fieldError(terms, '');
      if (!validate($('.step-pane[data-step="3"]'))) return;
      state.applyData = readApply();
      state.receiptRef = 'OP-' + Math.floor(100000 + Math.random() * 899999);
      $('#receiptNumber').textContent = `Reference ${state.receiptRef} · ${state.applyData.company}`;
      $('#applyActions').hidden = true;
      $('#applyForm').hidden = true;
      $('#applyReceipt').hidden = false;
      toast('Application file ready');
    });
    $('#downloadApplication').addEventListener('click', () => {
      const blob = new Blob([JSON.stringify({ reference: state.receiptRef, ...state.applyData }, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `oppopy-application-${state.receiptRef}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      toast('Application file downloaded');
    });
    $('#applyRestart').addEventListener('click', () => { resetApplication(); toast('Ready for a new application'); });
  }

  /* ---------------- account ---------------- */
  function renderTx() {
    const query = state.txQuery.trim().toLowerCase();
    const rows = state.txData.filter((item) =>
      (state.txKind === 'all' || item.kind === state.txKind) &&
      (!query || item.name.toLowerCase().includes(query) || item.ref.toLowerCase().includes(query))
    );
    $('#txList').innerHTML = rows.map((item) =>
      `<button type="button" class="tx-row" data-tx-id="${item.id}" aria-expanded="${state.openTx === item.id}">
        <span><span class="tx-name">${item.name}</span><br><span class="tx-meta">${item.ref}</span></span>
        <span class="tx-date">${item.date}</span>
        <span class="tx-status">${item.status}</span>
        <span class="tx-amount ${item.kind === 'in' ? 'is-in' : ''}">${item.amount}</span>
        ${ICON('chevron-down', 'ico ico-xs')}
      </button>
      ${state.openTx === item.id ? `<div class="tx-detail"><div><span>Rail</span><b>${item.rail}</b></div><div><span>Reference</span><b>${item.ref}</b></div><div><span>Status</span><b>${item.status}</b></div></div>` : ''}`
    ).join('');
    $('#txCount').textContent = `${rows.length} transaction${rows.length === 1 ? '' : 's'}`;
    $('#txEmpty').hidden = rows.length !== 0;
  }

  function bindAccount() {
    $('#draftToggle').addEventListener('click', () => {
      const form = $('#draftForm');
      form.hidden = !form.hidden;
      if (!form.hidden) $('#draftName').focus();
    });
    $$('#draftForm [data-required]').forEach((input) => input.addEventListener('input', () => fieldError(input, '')));
    $('#draftForm').addEventListener('submit', (event) => {
      event.preventDefault();
      const form = $('#draftForm');
      if (!validate(form)) return;
      const name = $('#draftName').value.trim();
      const amount = Number($('#draftAmount').value);
      state.txData.unshift({
        id: 'DRAFT-' + Date.now(), name: name + ' · Draft', kind: 'draft', date: 'Just now',
        amount: '−$' + amount.toLocaleString('en-US', { minimumFractionDigits: 2 }), status: 'Draft',
        rail: 'Not sent yet', ref: 'DRAFT-' + name.slice(0, 8).toUpperCase()
      });
      form.reset();
      form.hidden = true;
      setStatus($('#draftStatus'), 'Draft saved in this session. It has not been sent.', 'ok');
      state.txQuery = '';
      state.txKind = 'all';
      $('#txSearch').value = '';
      $$('.chips [data-tx]').forEach((chip) => {
        const active = chip.dataset.tx === 'all';
        chip.classList.toggle('is-active', active);
        chip.setAttribute('aria-pressed', String(active));
      });
      renderTx();
    });

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
    $('#refreshTx').addEventListener('click', () => refreshList($('#txLoading'), renderTx));
    $('#txList').addEventListener('click', (event) => {
      const row = event.target.closest('[data-tx-id]');
      if (!row) return;
      state.openTx = state.openTx === row.dataset.txId ? null : row.dataset.txId;
      renderTx();
    });

    $('#maskCard').addEventListener('click', () => {
      state.cardMasked = !state.cardMasked;
      $('#miniCardNumber').textContent = state.cardMasked ? '•••• •••• •••• 7642' : '8923 2461 5320 7642';
      $('#maskCardLabel').textContent = state.cardMasked ? 'Show card number' : 'Hide card number';
      iconSwap($('#maskCard'), state.cardMasked ? 'eye' : 'eye-off');
      toast(state.cardMasked ? 'Card number hidden' : 'Card number visible');
    });
    $('#freezeCard').addEventListener('click', () => {
      state.cardFrozen = !state.cardFrozen;
      $('#miniCard').classList.toggle('is-frozen', state.cardFrozen);
      $('#paycard').classList.toggle('is-frozen', state.cardFrozen);
      $('#cardStateBadge').textContent = state.cardFrozen ? 'Frozen' : 'Active';
      $('#cardStateBadge').classList.toggle('is-frozen', state.cardFrozen);
      $('#freezeCardLabel').textContent = state.cardFrozen ? 'Unfreeze card' : 'Freeze card';
      toast(state.cardFrozen ? 'Card frozen — new charges are blocked' : 'Card active again');
    });
    $('#logoutBtn').addEventListener('click', () => {
      state.openTx = null;
      showView('login');
      toast('Signed out');
    });
  }

  /* ---------------- global delegation ---------------- */
  function bindGlobal() {
    document.addEventListener('click', (event) => {
      const nav = event.target.closest('[data-nav]');
      if (nav) {
        event.preventDefault();
        if (nav.dataset.plan) state.plan = nav.dataset.plan;
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
      }
    });
  }

  /* ---------------- boot ---------------- */
  let booted = false;
  function boot() {
    if (booted) return;
    booted = true;
    try { bindGlobal(); } catch (error) { console.error('global binding', error); }
    try { bindDropdowns(); } catch (error) { console.error('dropdowns', error); }
    try { buildSelects(); } catch (error) { console.error('selects', error); }
    try { bindHome(); } catch (error) { console.error('home', error); }
    try { renderPlans(); renderFaq(); bindPricing(); } catch (error) { console.error('pricing', error); }
    try { renderCode(); renderEndpoints(); bindDevelopers(); } catch (error) { console.error('developers', error); }
    try { bindLogin(); } catch (error) { console.error('login', error); }
    try { renderSteps(); bindApply(); } catch (error) { console.error('apply', error); }
    try { renderTx(); bindAccount(); } catch (error) { console.error('account', error); }
    try { bindGlow(); } catch (error) { console.error('glow', error); }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { boot(); start(); });
  } else { boot(); start(); }
  window.addEventListener('pageshow', (event) => { if (event.persisted) start(); });
})();
