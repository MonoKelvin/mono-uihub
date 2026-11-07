'use strict';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const escapeHTML = (value) => String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
const number = (value, decimals = 2) => value.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
const cardData = [
  { id: 'personal', name: 'Personal', balance: 1242.42, currency: 'USD', number: '5495 7381 3759 2321', expiry: '04 / 24', network: 'Mastercard', primary: true, frozen: false, credit: 1500, creditTotal: 2000, online: 1324, onlineTotal: 1500 },
  { id: 'euro', name: 'Everyday', balance: 249, currency: 'EUR', number: '4535 8933 1673 6770', expiry: '05 / 25', network: 'Visa', frozen: false, credit: 410, creditTotal: 1000, online: 275, onlineTotal: 500 },
  { id: 'corporate', name: 'Corporate', balance: 249, currency: 'EUR', number: '5363 7205 7398 4138', expiry: '01 / 25', network: 'Mastercard', frozen: true, credit: 800, creditTotal: 2500, online: 320, onlineTotal: 1000 },
  { id: 'travel', name: 'Travel', balance: 860.5, currency: 'USD', number: '4535 7820 4196 8062', expiry: '09 / 26', network: 'Visa', frozen: false, credit: 620, creditTotal: 2000, online: 240, onlineTotal: 1000 },
];
const activityData = [
  { id: 't1', name: 'To Martin Mitchel', category: 'Sent', amount: -3004.52, currency: 'USD', day: 'Today', icon: 'send', date: '2026-11-07', account: 'Martin Mitchel', reference: 'INV-2026-1107' },
  { id: 't2', name: 'To Jane Klamberg', category: 'Sent', amount: -1023.19, currency: 'USD', day: 'Today', icon: 'send', date: '2026-11-07', account: 'Jane Klamberg', reference: 'INV-2026-1106' },
  { id: 't3', name: 'EUR to USD', category: 'Conversion', amount: 1456, currency: 'USD', day: 'Today', icon: 'exchange', date: '2026-11-07', account: 'USD balance', reference: 'FX-2026-1107' },
  { id: 't4', name: 'Starbucks', category: 'Café & Restaurants', amount: -5.99, currency: 'USD', day: 'Yesterday', icon: 'credit-card', date: '2026-11-06', account: 'Starbucks Coffee', reference: 'CARD-2321' },
  { id: 't5', name: 'Deposit to your USD balance', category: 'Opened', amount: 4000, currency: 'USD', day: 'Yesterday', icon: 'square-plus', date: '2026-11-06', account: 'USD balance', reference: 'DEP-2026-1106' },
  { id: 't6', name: 'Monthly salary', category: 'Received', amount: 4969, currency: 'USD', day: 'Earlier this month', icon: 'arrow-down-left', date: '2026-11-01', account: 'Heartbeat Studio', reference: 'SAL-2026-11' },
  { id: 't7', name: 'Apartment rent', category: 'Housing', amount: -2100, currency: 'USD', day: 'Earlier this month', icon: 'home', date: '2026-11-01', account: 'Westside Apartments', reference: 'RENT-2026-11' },
  { id: 't8', name: 'Figma', category: 'Subscriptions', amount: -24, currency: 'USD', day: 'Earlier this month', icon: 'credit-card', date: '2026-10-30', account: 'Figma', reference: 'SUB-2026-1030' },
  { id: 't9', name: 'Vercel', category: 'Subscriptions', amount: -20, currency: 'USD', day: 'Earlier this month', icon: 'credit-card', date: '2026-10-29', account: 'Vercel', reference: 'SUB-2026-1029' },
  { id: 't10', name: 'Whole Foods', category: 'Groceries', amount: -148.3, currency: 'USD', day: 'Earlier this month', icon: 'shopping-bag', date: '2026-10-27', account: 'Whole Foods Market', reference: 'CARD-2321' },
  { id: 't11', name: 'Eurostar', category: 'Travel', amount: -314.14, currency: 'USD', day: 'Earlier this month', icon: 'train', date: '2026-10-24', account: 'Eurostar', reference: 'CARD-2321' },
];
const contacts = [
  { id: 1, name: 'Martin Mitchel', email: 'martin.mitchel@mail.com', currency: 'USD' },
  { id: 2, name: 'Jane Klamberg', email: 'jane.klamberg@mail.com', currency: 'USD' },
  { id: 3, name: 'Heartbeat Studio', email: 'finance@heartbeat.studio', currency: 'EUR' },
  { id: 4, name: 'Oliver Bennett', email: 'oliver.bennett@mail.com', currency: 'GBP' },
  { id: 5, name: 'Emma Wilson', email: 'emma.wilson@mail.com', currency: 'EUR' },
];
const paymentData = [];
const recipients = ['Martin Mitchel', 'Jane Klamberg', 'Heartbeat Studio', 'Oliver Bennett', 'Emma Wilson'];
for (const [status, count] of [['Awaiting', 8], ['In Progress', 5], ['Completed', 12], ['Canceled', 4]]) {
  for (let index = 0; index < count; index++) {
    paymentData.push({ id: `p${paymentData.length + 1}`, name: recipients[index % recipients.length], amount: [450, 1023.19, 780, 210, 1250][index % 5], currency: index % 3 === 0 ? 'EUR' : 'USD', status, date: `2026-11-${String(7 - index % 7).padStart(2, '0')}`, reference: `INT-${String(paymentData.length + 1).padStart(5, '0')}` });
  }
}
let activeCard = 0;
let paymentFilter = 'All';
let paymentQuery = '';
let reportFilter = 'All';
let contactQuery = '';
let nextContactId = 6;
let toastTimer;
let dialogTrigger;
const preferences = { notifications: true, alerts: true, motion: !matchMedia('(prefers-reduced-motion: reduce)').matches };

function cardMarkup(card, index) {
  return `<button class="bank-card ${card.primary ? 'bank-card--primary' : ''} ${index === activeCard ? 'is-selected' : ''}" data-card="${index}" aria-label="${escapeHTML(card.name)} card, ${number(card.balance)} ${card.currency}${card.frozen ? ', frozen' : ''}" aria-pressed="${index === activeCard}">
    ${card.primary ? '<svg class="card-art" viewBox="0 0 410 256" preserveAspectRatio="none" aria-hidden="true"><use href="#card-art" /></svg>' : ''}
    <span class="card-top"><svg class="card-mark" aria-hidden="true"><use href="#klamma-mark" /></svg>${card.id === 'corporate' ? '<span class="card-name">Corporate</span>' : ''}${card.frozen ? '<i class="ti ti-lock card-lock" aria-label="Frozen"></i>' : ''}</span>
    <span class="card-balance">${number(card.balance).replace(',', '')} <strong>${card.currency}</strong></span>
    <span class="card-number">${card.number}</span>
    <span class="card-bottom"><span class="card-expiry">${card.expiry}</span>${card.network === 'Visa' ? '<span class="visa" aria-label="Visa">VISA</span>' : `<span class="mastercard ${card.primary ? '' : 'mastercard--mono'}" aria-label="Mastercard"></span>`}</span>
  </button>`;
}

function renderCards() {
  $('#card-track').innerHTML = cardData.map(cardMarkup).join('');
  $('#card-pagination').innerHTML = cardData.map((card, index) => `<button class="pagination-dot" data-select-card="${index}" aria-label="Select ${escapeHTML(card.name)} card" aria-pressed="${index === activeCard}"></button>`).join('');
  $('#cards-view').innerHTML = `<div class="cards-grid">${cardData.map((card, index) => `<div>${cardMarkup(card, index)}<div class="card-caption"><span>${card.name} · ${card.network}</span><span>${card.frozen ? 'Frozen' : 'Active'}</span></div></div>`).join('')}</div>`;
  positionCards();
}

function positionCards() {
  const window = $('.card-window');
  const track = $('#card-track');
  const card = $('.bank-card', track);
  if (!card || !window.clientWidth) return;
  const gap = parseFloat(getComputedStyle(track).gap);
  const step = parseFloat(getComputedStyle(card).width) + gap;
  const maxOffset = Math.max(0, track.scrollWidth - window.clientWidth);
  track.style.transform = `translateX(-${Math.min(activeCard * step, maxOffset)}px)`;
  $$('.bank-card', track).forEach((element, index) => { element.tabIndex = index === activeCard ? 0 : -1; });
}

function selectCard(index) {
  activeCard = index;
  $$('#card-track .bank-card, #cards-view .bank-card').forEach((element) => {
    const selected = Number(element.dataset.card) === index;
    element.classList.toggle('is-selected', selected);
    element.setAttribute('aria-pressed', selected);
  });
  $$('.pagination-dot').forEach((element, cardIndex) => element.setAttribute('aria-pressed', cardIndex === index));
  const card = cardData[index];
  for (const kind of ['credit', 'online']) {
    const meter = $(`#${kind}-meter`);
    meter.style.setProperty('--used', `${card[kind] / card[`${kind}Total`] * 100}%`);
    meter.setAttribute('aria-valuemax', card[`${kind}Total`]);
    meter.setAttribute('aria-valuenow', card[kind]);
    $(`#${kind}-used`).textContent = card[kind];
    $(`#${kind}-total`).textContent = card[`${kind}Total`];
  }
  $$('.limit-currency').forEach((element) => { element.textContent = card.currency; });
  positionCards();
}

function activityMarkup(activity) {
  return `<button class="activity-row" data-activity="${activity.id}"><i class="ti ti-${activity.icon}" aria-hidden="true"></i><span class="activity-name"><span>${escapeHTML(activity.name)}</span><small>${escapeHTML(activity.category)}</small></span><span class="activity-amount">${activity.amount < 0 ? '− ' : '+ '}${number(Math.abs(activity.amount))} <strong>${activity.currency}</strong></span></button>`;
}

function renderActivities() {
  let day = '';
  $('#activity-list').innerHTML = activityData.map((activity) => {
    const date = day !== activity.day ? `<p class="activity-date">${activity.day}</p>` : '';
    day = activity.day;
    return date + activityMarkup(activity);
  }).join('');
}

function setView(view) {
  if (!['overview', 'cards', 'payments', 'reports', 'contacts'].includes(view)) view = 'overview';
  $$('.view-panel').forEach((panel) => { panel.hidden = panel.id !== `${view}-view`; });
  $$('.navigation .nav-item').forEach((item) => {
    const active = item.dataset.view === view;
    item.classList.toggle('is-active', active);
    if (active) item.setAttribute('aria-current', 'page'); else item.removeAttribute('aria-current');
  });
  const titles = { overview: 'Your Cards', cards: 'Your Cards', payments: 'Int. Payments', reports: 'Your Reports', contacts: 'Your Contacts' };
  const actions = { overview: ['New card', 'new-card'], cards: ['New card', 'new-card'], payments: ['New payment', 'new-payment'], reports: ['Export CSV', 'export-report'], contacts: ['Add contact', 'new-contact'] };
  $('#page-title').textContent = titles[view];
  $('#header-action span').textContent = actions[view][0];
  $('#header-action').setAttribute('aria-label', actions[view][0]);
  $('#header-action').dataset.action = actions[view][1];
  $('#header-action i').className = `ti ti-${view === 'reports' ? 'download' : 'plus'}`;
  if (view === 'payments') renderPayments();
  if (view === 'reports') renderReports();
  if (view === 'contacts') renderContacts();
  $('#content-scroll').scrollTop = 0;
  $('#notification-popover').hidden = true;
  $('#notification-button').setAttribute('aria-expanded', 'false');
  closeMenu();
  if (location.hash !== `#${view}`) history.replaceState(null, '', `#${view}`);
  if (view === 'overview') positionCards();
}

function tabsMarkup(values, selected, attribute) {
  return `<div class="filter-tabs" aria-label="Filter">${values.map((value) => `<button class="filter-tab ${value === selected ? 'is-active' : ''}" ${attribute}="${value}" aria-pressed="${value === selected}">${value}</button>`).join('')}</div>`;
}

function filteredPayments() {
  return paymentData.filter((payment) => (paymentFilter === 'All' || payment.status === paymentFilter) && payment.name.toLowerCase().includes(paymentQuery.toLowerCase()));
}

function renderPayments() {
  $('#payments-view').innerHTML = `<div class="view-toolbar">${tabsMarkup(['All', 'Awaiting', 'In Progress', 'Completed', 'Canceled'], paymentFilter, 'data-payment-filter')}<input class="search-field" id="payment-search" type="search" aria-label="Search payments" placeholder="Search payments" value="${escapeHTML(paymentQuery)}"></div><div id="payment-results"></div>`;
  renderPaymentResults();
}

function renderPaymentResults() {
  const results = filteredPayments();
  $('#payment-results').innerHTML = results.length ? `<div class="table-wrap"><table class="transaction-table"><thead><tr><th>Recipient</th><th>Date</th><th>Status</th><th>Amount</th></tr></thead><tbody>${results.map((payment) => `<tr data-payment="${payment.id}" tabindex="0" aria-label="${escapeHTML(payment.name)}, ${payment.status}, ${number(payment.amount)} ${payment.currency}"><td>${escapeHTML(payment.name)}</td><td>${payment.date}</td><td><span class="status-label status-label--${payment.status.toLowerCase().replace(' ', '-')}">${payment.status}</span></td><td>${number(payment.amount)} <strong>${payment.currency}</strong></td></tr>`).join('')}</tbody></table></div>` : '<div class="empty-state"><h3>No payments found</h3><p>Try another name or status.</p></div>';
}

function filteredActivities() {
  return activityData.filter((activity) => reportFilter === 'All' || (reportFilter === 'Money In' ? activity.amount > 0 : activity.amount < 0));
}

function renderReports() {
  const incoming = activityData.filter((activity) => activity.amount > 0).reduce((sum, activity) => sum + activity.amount, 0);
  const outgoing = -activityData.filter((activity) => activity.amount < 0).reduce((sum, activity) => sum + activity.amount, 0);
  $('#reports-view').innerHTML = `<div class="report-summary"><div><span>Money In · last 30 days</span><strong>${number(incoming)} USD</strong></div><div><span>Money Out · last 30 days</span><strong>${number(outgoing)} USD</strong></div><div><span>Net cash flow · last 30 days</span><strong>${number(incoming - outgoing)} USD</strong></div></div><div class="view-toolbar">${tabsMarkup(['All', 'Money In', 'Money Out'], reportFilter, 'data-report-filter')}<span class="period-label">October 9 – November 7</span></div><table class="transaction-table"><thead><tr><th>Transaction</th><th>Date</th><th>Category</th><th>Amount</th></tr></thead><tbody>${filteredActivities().map((activity) => `<tr data-activity="${activity.id}" tabindex="0" aria-label="${escapeHTML(activity.name)}, ${number(activity.amount)} ${activity.currency}"><td>${escapeHTML(activity.name)}</td><td>${activity.date}</td><td>${escapeHTML(activity.category)}</td><td>${activity.amount < 0 ? '−' : '+'}${number(Math.abs(activity.amount))} <strong>${activity.currency}</strong></td></tr>`).join('')}</tbody></table>`;
}

function renderContacts() {
  $('#contacts-view').innerHTML = '<div class="view-toolbar"><span class="period-label">Your saved recipients</span><input class="search-field" type="search" id="contact-search" aria-label="Search contacts" placeholder="Search contacts"></div><div id="contact-results"></div>';
  $('#contact-search').value = contactQuery;
  renderContactResults();
}

function renderContactResults() {
  const results = contacts.filter((contact) => `${contact.name} ${contact.email}`.toLowerCase().includes(contactQuery.toLowerCase()));
  $('#contact-results').innerHTML = results.length ? `<div class="contacts-grid">${results.map((contact) => `<article class="contact-card"><div class="contact-avatar" aria-hidden="true">${escapeHTML(contact.name.split(/\s+/).slice(0, 2).map((part) => [...part][0] || '').join(''))}</div><h3>${escapeHTML(contact.name)}</h3><p>${escapeHTML(contact.email)}</p><div class="contact-actions"><button class="text-button" data-pay-contact="${contact.id}">Send money<i class="ti ti-arrow-up-right" aria-hidden="true"></i></button><button class="icon-button" data-delete-contact="${contact.id}" aria-label="Delete ${escapeHTML(contact.name)}"><i class="ti ti-trash" aria-hidden="true"></i></button></div></article>`).join('')}</div>` : `<div class="empty-state"><h3>${contacts.length ? 'No contacts found' : 'No contacts yet'}</h3><p>${contacts.length ? 'Try a different name or email.' : 'Add a recipient to get started.'}</p><button class="text-button" data-action="new-contact">Add contact</button></div>`;
}

function openDialog(title, content) {
  const opening = $('#modal-layer').hidden;
  if (opening) dialogTrigger = document.activeElement;
  closeMenu();
  $('#notification-popover').hidden = true;
  $('#notification-button').setAttribute('aria-expanded', 'false');
  $('#dialog-title').textContent = title;
  $('#dialog-body').innerHTML = content;
  $('#modal-layer').hidden = false;
  $$('.workspace, .sidebar, .chat-launcher').forEach((element) => { element.inert = true; });
  $('#dialog-body').scrollTop = 0;
  const target = $('#dialog-body input:not([type="hidden"]), #dialog-body select, #dialog-body button') || $('.dialog-heading button');
  target.focus();
}

function closeDialog() {
  $('#modal-layer').hidden = true;
  $$('.workspace, .sidebar, .chat-launcher').forEach((element) => { element.inert = false; });
  syncNavigation();
  if (dialogTrigger?.isConnected && !dialogTrigger.closest('[hidden], [inert]')) dialogTrigger.focus();
  else $('#header-action').focus();
}

function showToast(text) {
  clearTimeout(toastTimer);
  $('#toast span').textContent = text;
  $('#toast').hidden = false;
  toastTimer = setTimeout(() => { $('#toast').hidden = true; }, 3200);
}

function detailMarkup(rows) {
  return `<dl class="detail-list">${rows.map(([label, value]) => `<div><dt>${escapeHTML(label)}</dt><dd>${escapeHTML(value)}</dd></div>`).join('')}</dl>`;
}

function showCard(index) {
  selectCard(index);
  const card = cardData[index];
  openDialog(`${card.name} card`, `<div class="detail-balance">${number(card.balance)} <small>${card.currency}</small></div>${detailMarkup([['Card number', card.number], ['Valid until', card.expiry], ['Card network', card.network], ['Status', card.frozen ? 'Frozen' : 'Active'], ['Cardholder', 'Alex Morgan']])}<div class="dialog-actions"><button class="soft-button" data-action="freeze-card">${card.frozen ? 'Unfreeze card' : 'Freeze card'}<i class="ti ti-${card.frozen ? 'lock-open' : 'lock'}" aria-hidden="true"></i></button><button class="primary-button" data-action="credit-limit">View limits</button></div>`);
}

function showLimit(kind) {
  const card = cardData[activeCard];
  const total = card[`${kind}Total`];
  const used = card[kind];
  openDialog(kind === 'credit' ? 'Credit limit' : 'Online limit', `<p class="dialog-description">${card.name} card · ${card.currency}</p>${detailMarkup([['Monthly limit', `${number(total)} ${card.currency}`], ['Used this month', `${number(used)} ${card.currency}`], ['Available', `${number(total - used)} ${card.currency}`], ['Usage', `${number(used / total * 100, 1)}%`]])}<div class="dialog-actions"><button class="soft-button" data-action="close-dialog">Close</button><button class="primary-button" data-action="request-limit">Request a change</button></div><p class="form-error" id="limit-error" role="status" hidden></p>`);
}

function showActivity(id) {
  const activity = activityData.find((item) => item.id === id);
  if (!activity) return;
  openDialog('Transaction details', `<div class="detail-balance">${activity.amount < 0 ? '−' : '+'}${number(Math.abs(activity.amount))} <small>${activity.currency}</small></div>${detailMarkup([['Transaction', activity.name], ['Recipient / account', activity.account], ['Category', activity.category], ['Date', activity.date], ['Reference', activity.reference]])}<div class="dialog-actions"><button class="soft-button" data-action="close-dialog">Close</button><button class="primary-button" data-export-activity="${activity.id}">Download receipt<i class="ti ti-download" aria-hidden="true"></i></button></div>`);
}

function showPayment(id) {
  const payment = paymentData.find((item) => item.id === id);
  if (!payment) return;
  openDialog('Payment details', `<div class="detail-balance">${number(payment.amount)} <small>${payment.currency}</small></div>${detailMarkup([['Recipient', payment.name], ['Status', payment.status], ['Date', payment.date], ['Reference', payment.reference]])}${payment.status === 'In Progress' ? '<p class="form-error">Recipient verification is required. Connect your bank to continue.</p>' : ''}<div class="dialog-actions"><button class="primary-button" data-action="close-dialog">Done</button></div>`);
}

function newCardDialog() {
  openDialog('Add a new card', `<p class="dialog-description">Choose a card for everyday spending, travel, or your business.</p><form id="new-card-form"><div class="form-grid"><label class="field">Card type<select name="type"><option>Personal</option><option>Corporate</option><option>Travel</option></select></label><label class="field">Currency<select name="currency"><option>USD</option><option>EUR</option><option>GBP</option></select></label><label class="field field-wide">Name on card<input name="holder" autocomplete="name" value="Alex Morgan" required maxlength="60"></label></div><p class="form-error" id="card-error" role="status" hidden></p><div class="dialog-actions"><button class="soft-button" type="button" data-action="close-dialog">Cancel</button><button class="primary-button" type="submit">Continue<i class="ti ti-arrow-right" aria-hidden="true"></i></button></div></form>`);
}

function newPaymentDialog(contact) {
  openDialog('New international payment', `<form id="new-payment-form"><div class="form-grid"><label class="field field-wide">Recipient<input name="recipient" autocomplete="off" required maxlength="80" value="${escapeHTML(contact?.name || '')}" placeholder="Recipient's full name"></label><label class="field">Amount<input name="amount" type="number" inputmode="decimal" required min="0.01" max="1000000" step="0.01" placeholder="0.00"></label><label class="field">Currency<select name="currency">${['USD', 'EUR', 'GBP'].map((currency) => `<option ${contact?.currency === currency ? 'selected' : ''}>${currency}</option>`).join('')}</select></label><label class="field field-wide">Reference<input name="reference" maxlength="100" placeholder="Invoice or payment reference"></label></div><div class="dialog-actions"><button class="soft-button" type="button" data-action="close-dialog">Cancel</button><button class="primary-button" type="submit">Review payment<i class="ti ti-arrow-right" aria-hidden="true"></i></button></div></form>`);
}

function newContactDialog() {
  openDialog('Add a contact', '<form id="new-contact-form"><div class="form-grid"><label class="field field-wide">Full name<input name="name" required maxlength="80" autocomplete="name" placeholder="Full name"></label><label class="field">Email address<input name="email" type="email" required maxlength="120" autocomplete="email" placeholder="name@example.com"></label><label class="field">Preferred currency<select name="currency"><option>USD</option><option>EUR</option><option>GBP</option></select></label></div><p id="contact-error" class="form-error" role="alert" hidden></p><div class="dialog-actions"><button class="soft-button" type="button" data-action="close-dialog">Cancel</button><button class="primary-button" type="submit">Add contact</button></div></form>');
}

function settingsDialog() {
  openDialog('Settings', `<p class="dialog-description">Make Klamma feel right for you.</p>${[['notifications', 'Payment notifications', 'Updates about incoming and outgoing payments.'], ['alerts', 'Card security alerts', 'Stay informed about card access and limits.'], ['motion', 'Interface animations', 'Gentle transitions between cards and views.']].map(([key, title, description]) => `<div class="setting-row"><span><strong>${title}</strong><small>${description}</small></span><button class="toggle" role="switch" aria-label="${title}" aria-checked="${preferences[key]}" data-preference="${key}"></button></div>`).join('')}<div class="dialog-actions"><button class="primary-button" data-action="close-dialog">Done</button></div>`);
}

function closeMenu() {
  $('#bank-app').classList.remove('menu-open');
  $('#mobile-scrim').hidden = true;
  $('.menu-button').setAttribute('aria-expanded', 'false');
  if (matchMedia('(max-width: 650px)').matches) $('.sidebar').inert = true;
}

function fitPreview() {
  const frame = $('#preview-frame');
  const { width, height } = frame.getBoundingClientRect();
  const scale = Math.min(width / 1800, height / 1125);
  frame.style.setProperty('--preview-scale', scale);
  syncNavigation();
}

function syncNavigation() {
  const mobile = matchMedia('(max-width: 650px)').matches;
  $('.sidebar').inert = !$('#modal-layer').hidden || (mobile && !$('#bank-app').classList.contains('menu-open'));
  if (!mobile) {
    $('#bank-app').classList.remove('menu-open');
    $('#mobile-scrim').hidden = true;
    $('.menu-button').setAttribute('aria-expanded', 'false');
  }
  positionCards();
}

function downloadFile(filename, content, type) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function exportReport() {
  const quote = (value) => `"${String(value).replace(/^[=+@-]/, "'$&").replace(/"/g, '""')}"`;
  const rows = [['Date', 'Transaction', 'Category', 'Amount', 'Currency'], ...filteredActivities().map((activity) => [activity.date, activity.name, activity.category, activity.amount, activity.currency])];
  downloadFile('klamma-transactions.csv', '﻿' + rows.map((row) => row.map(quote).join(',')).join('\r\n'), 'text/csv;charset=utf-8');
  showToast(`${rows.length - 1} transactions exported`);
}

const actions = {
  'new-card': newCardDialog,
  'new-payment': () => newPaymentDialog(),
  'new-contact': newContactDialog,
  'close-dialog': closeDialog,
  'next-card': () => selectCard((activeCard + 1) % cardData.length),
  'credit-limit': () => showLimit('credit'),
  'online-limit': () => showLimit('online'),
  'request-limit': () => { $('#limit-error').hidden = false; $('#limit-error').textContent = 'Connect your bank to request a limit change.'; },
  'freeze-card': () => { const card = cardData[activeCard]; card.frozen = !card.frozen; renderCards(); showCard(activeCard); },
  'view-report': () => { reportFilter = 'All'; setView('reports'); },
  'money-in': () => { reportFilter = 'Money In'; setView('reports'); },
  'money-out': () => { reportFilter = 'Money Out'; setView('reports'); },
  'export-report': exportReport,
  settings: settingsDialog,
  account: () => openDialog('Your account', `<div class="contact-avatar" aria-hidden="true">AM</div>${detailMarkup([['Full name', 'Alex Morgan'], ['Email address', 'alex.morgan@mail.com'], ['Account currency', 'USD'], ['Account plan', 'Personal'], ['Account ID', 'KL-0084-2321']])}<div class="dialog-actions"><button class="primary-button" data-action="close-dialog">Done</button></div>`),
  notifications: () => {
    const popover = $('#notification-popover');
    popover.hidden = !popover.hidden;
    $('#notification-button').setAttribute('aria-expanded', !popover.hidden);
  },
  'mark-read': () => { $('.notification-dot').hidden = true; $('#notification-button').setAttribute('aria-label', 'Notifications, all read'); showToast('All notifications marked as read'); },
  'payment-alert': () => { paymentFilter = 'In Progress'; paymentQuery = ''; setView('payments'); },
  'corporate-alert': () => showCard(2),
  menu: () => {
    const opened = $('#bank-app').classList.toggle('menu-open');
    $('#mobile-scrim').hidden = !opened;
    $('.menu-button').setAttribute('aria-expanded', opened);
    $('.sidebar').inert = !opened;
    if (opened) $('.nav-item.is-active').focus();
  },
  support: () => openDialog('How can we help?', '<p class="dialog-description">Find a quick answer about your Klamma account.</p><button class="faq-row" data-faq="cards">How do I freeze a card?<i class="ti ti-chevron-right" aria-hidden="true"></i></button><button class="faq-row" data-faq="payments">Where can I find a payment?<i class="ti ti-chevron-right" aria-hidden="true"></i></button><button class="faq-row" data-faq="reports">How do I download a statement?<i class="ti ti-chevron-right" aria-hidden="true"></i></button><p class="faq-answer" id="faq-answer" role="status" hidden></p><div class="dialog-actions"><button class="soft-button" data-action="contact-support">Contact support</button><button class="primary-button" data-action="close-dialog">Done</button></div>'),
  'contact-support': () => { const answer = $('#faq-answer'); answer.hidden = false; answer.textContent = 'Connect your bank to speak with the Klamma support team.'; },
};

document.addEventListener('click', (event) => {
  const control = event.target.closest('button, a, tr[data-payment], tr[data-activity]');
  if (!control) {
    if (event.target === $('#mobile-scrim')) { closeMenu(); $('.menu-button').focus(); }
    if (event.target === $('.modal-scrim')) closeDialog();
    if (!event.target.closest('.notification-popover')) { $('#notification-popover').hidden = true; $('#notification-button').setAttribute('aria-expanded', 'false'); }
    return;
  }
  if (!control.closest('.notification-popover') && control.dataset.action !== 'notifications') {
    $('#notification-popover').hidden = true;
    $('#notification-button').setAttribute('aria-expanded', 'false');
  }
  const data = control.dataset;
  if (data.view) { event.preventDefault(); setView(data.view); return; }
  if (control.classList.contains('brand')) { event.preventDefault(); setView('overview'); return; }
  if (data.action && actions[data.action]) { event.preventDefault(); actions[data.action](); }
  if (data.card !== undefined) showCard(Number(data.card));
  if (data.selectCard !== undefined) selectCard(Number(data.selectCard));
  if (data.activity) showActivity(data.activity);
  if (data.payment) showPayment(data.payment);
  if (data.status) { paymentFilter = data.status; paymentQuery = ''; setView('payments'); }
  if (data.paymentFilter) { paymentFilter = data.paymentFilter; renderPayments(); $(`[data-payment-filter="${paymentFilter}"]`).focus(); }
  if (data.reportFilter) { reportFilter = data.reportFilter; renderReports(); $(`[data-report-filter="${reportFilter}"]`).focus(); }
  if (data.payContact) newPaymentDialog(contacts.find((contact) => contact.id === Number(data.payContact)));
  if (data.deleteContact) {
    const contact = contacts.find((item) => item.id === Number(data.deleteContact));
    openDialog('Delete contact?', `<p class="dialog-description">Remove ${escapeHTML(contact.name)} from your saved recipients?</p><div class="dialog-actions"><button class="soft-button" data-action="close-dialog">Keep contact</button><button class="primary-button" data-confirm-delete="${contact.id}">Delete contact</button></div>`);
  }
  if (data.confirmDelete) {
    const index = contacts.findIndex((contact) => contact.id === Number(data.confirmDelete));
    const name = contacts[index].name;
    contacts.splice(index, 1);
    renderContacts();
    closeDialog();
    showToast(`${name} removed from contacts`);
  }
  if (data.preference) {
    preferences[data.preference] = !preferences[data.preference];
    control.setAttribute('aria-checked', preferences[data.preference]);
    if (data.preference === 'motion') $('#bank-app').classList.toggle('reduce-motion', !preferences.motion);
  }
  if (data.faq) {
    const answers = { cards: 'Open Cards, choose your card, then select Freeze card. You can unfreeze it from the same place.', payments: 'Open Payments to filter by status or search for a recipient. Select a payment to see its details.', reports: 'Open Reports and select Export CSV. You can filter for incoming or outgoing transactions before downloading.' };
    $('#faq-answer').hidden = false;
    $('#faq-answer').textContent = answers[data.faq];
  }
  if (data.exportActivity) {
    const activity = activityData.find((item) => item.id === data.exportActivity);
    downloadFile(`klamma-${activity.reference.toLowerCase()}.txt`, `Klamma | Transaction receipt\n\n${activity.name}\nAmount: ${number(activity.amount)} ${activity.currency}\nDate: ${activity.date}\nCategory: ${activity.category}\nReference: ${activity.reference}\n`, 'text/plain;charset=utf-8');
    showToast('Transaction receipt downloaded');
  }
});

document.addEventListener('input', (event) => {
  if (event.target.id === 'payment-search') { paymentQuery = event.target.value; renderPaymentResults(); }
  if (event.target.id === 'contact-search') { contactQuery = event.target.value; renderContactResults(); }
});

document.addEventListener('submit', (event) => {
  event.preventDefault();
  const form = event.target;
  if (!form.reportValidity()) return;
  const values = Object.fromEntries(new FormData(form));
  if (form.id === 'new-card-form') {
    $('#card-error').hidden = false;
    $('#card-error').textContent = 'Connect your bank to issue a new card. Your selection has not been submitted.';
  }
  if (form.id === 'new-payment-form') {
    const amount = Number(values.amount);
    if (!values.recipient.trim() || !Number.isFinite(amount) || amount <= 0) { form.elements.recipient.setCustomValidity('Enter a recipient name.'); form.reportValidity(); form.elements.recipient.setCustomValidity(''); return; }
    openDialog('Review your payment', `<div class="detail-balance">${number(amount)} <small>${escapeHTML(values.currency)}</small></div>${detailMarkup([['Recipient', values.recipient.trim()], ['Currency', values.currency], ['Reference', values.reference || '—']])}<p class="form-error" id="payment-error" role="status" hidden></p><div class="dialog-actions"><button class="soft-button" data-action="close-dialog">Cancel</button><button class="primary-button" id="connect-bank-button">Continue</button></div>`);
    $('#connect-bank-button').addEventListener('click', () => { $('#payment-error').hidden = false; $('#payment-error').textContent = 'Connect your bank to authorize this payment. No money has been sent.'; });
  }
  if (form.id === 'new-contact-form') {
    const name = values.name.trim();
    const email = values.email.trim();
    const error = $('#contact-error');
    if (!name || contacts.some((contact) => contact.email.toLowerCase() === email.toLowerCase())) {
      error.hidden = false;
      error.textContent = name ? 'A contact with this email address already exists.' : 'Enter a contact name.';
      return;
    }
    contacts.push({ id: nextContactId++, name, email, currency: values.currency });
    contactQuery = '';
    setView('contacts');
    closeDialog();
    showToast(`${name} added to contacts`);
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    if (!$('#modal-layer').hidden) closeDialog();
    else if ($('#bank-app').classList.contains('menu-open')) { closeMenu(); $('.menu-button').focus(); }
    else { $('#notification-popover').hidden = true; $('#notification-button').setAttribute('aria-expanded', 'false'); }
  }
  if ((event.key === 'Enter' || event.key === ' ') && event.target.matches('tr[data-payment], tr[data-activity]')) { event.preventDefault(); event.target.click(); }
  if ((event.key === 'ArrowRight' || event.key === 'ArrowLeft') && event.target.closest('.card-carousel') && $('#modal-layer').hidden) {
    event.preventDefault();
    selectCard((activeCard + (event.key === 'ArrowRight' ? 1 : -1) + cardData.length) % cardData.length);
    $(`#card-track [data-card="${activeCard}"]`).focus({ preventScroll: true });
  }
  if (event.key === 'Tab' && !$('#modal-layer').hidden) {
    const focusable = $$('button:not(:disabled), input, select, textarea, a[href], [tabindex="0"]', $('#dialog')).filter((element) => !element.closest('[hidden]'));
    const first = focusable[0];
    const last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
});

$$('.nav-item').forEach((item) => item.setAttribute('aria-label', $('span', item).textContent));
fitPreview();
renderCards();
renderActivities();
setView(location.hash.slice(1) || 'overview');
new ResizeObserver(fitPreview).observe($('#preview-frame'));
new ResizeObserver(syncNavigation).observe($('#bank-app'));
window.addEventListener('resize', fitPreview);
window.addEventListener('hashchange', () => setView(location.hash.slice(1)));
if (document.fonts) document.fonts.ready.then(positionCards);
