const view = document.querySelector('#view');
const overlay = document.querySelector('#overlay');
const toast = document.querySelector('#toast');
const accounts = [
  { id: 'usd', currency: 'USD', balance: 10473, number: '9934', valid: '05/28', flag: 'us', name: 'US Dollar account' },
  { id: 'vnd', currency: 'VND', balance: 11309000, number: '1179', valid: '08/28', flag: 'vn', name: 'Vietnamese Dong account' }
];
const recipients = [
  { id: 'sara', name: 'Sara Wong', initials: 'SW', bank: 'Bank of America', number: '4821' },
  { id: 'john', name: 'John Smith', initials: 'JS', bank: 'Standard Chartered', number: '7319' },
  { id: 'emma', name: 'Emma Wilson', initials: 'EW', bank: 'Chase', number: '0652' },
  { id: 'alex', name: 'Alex Chen', initials: 'AC', bank: 'Standard Chartered', number: '9086' }
];
const transactions = [
  { id: 'tx1', person: 'Sara Wong', recipient: 'sara', direction: 'out', amount: 341, time: '04:03 PM', date: 'Today', fullDate: 'November 11, 2026', reference: 'LM-261111-0341', note: 'Dinner and groceries' },
  { id: 'tx2', person: 'John Smith', recipient: 'john', direction: 'in', amount: 3115, time: '02:15 PM', date: 'Today', fullDate: 'November 11, 2026', reference: 'LM-261111-3115', note: 'Monthly payment' },
  { id: 'tx3', person: 'Emma Wilson', recipient: 'emma', direction: 'out', amount: 85, time: '07:42 PM', date: 'Yesterday', fullDate: 'November 10, 2026', reference: 'LM-261110-0085', note: 'Weekend plans' },
  { id: 'tx4', person: 'Alex Chen', recipient: 'alex', direction: 'in', amount: 250, time: '10:18 AM', date: 'Yesterday', fullDate: 'November 10, 2026', reference: 'LM-261110-0250', note: 'Shared expenses' },
  { id: 'tx5', person: 'Sara Wong', recipient: 'sara', direction: 'out', amount: 120, time: '06:30 PM', date: 'Nov 9', fullDate: 'November 9, 2026', reference: 'LM-261109-0120', note: 'Concert tickets' },
  { id: 'tx6', person: 'John Smith', recipient: 'john', direction: 'in', amount: 680, time: '11:24 AM', date: 'Nov 9', fullDate: 'November 9, 2026', reference: 'LM-261109-0680', note: 'Project payment' }
];
const cards = [
  { id: 'card1', bank: 'Standard Chartered', nickname: '', number: '3416', balance: 43200, dark: false },
  { id: 'card2', bank: 'Bank of America', nickname: '', number: '3416', balance: 2146.30, dark: true }
];
const state = {
  screen: 'home', history: [], wallet: 0, hiddenBalances: new Set(),
  recipientQuery: '', recipientPage: 0, activityQuery: '', filter: 'all', activityPage: 0, cardPage: 0,
  selectedTransaction: 'tx1', selectedCard: 'card1',
  transfer: { recipient: 'sara', account: 'usd', amount: '', note: '' },
  request: { amount: '', note: '', payload: '' },
  addCard: { bank: 'Standard Chartered', nickname: '', number: '' }
};
let toastTimer;
let dialogTrigger;
let cameraStream;
let cameraFrame;
let started = false;

const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
const icon = (name) => `<i class="ti ti-${name}" aria-hidden="true"></i>`;
const money = (amount, currency = 'USD', decimals = false) => new Intl.NumberFormat('en-US', { style: 'currency', currency, currencyDisplay: 'narrowSymbol', minimumFractionDigits: decimals || !Number.isInteger(amount) ? 2 : 0, maximumFractionDigits: 2 }).format(amount);
const avatar = () => '<span class="avatar"><img src="./assets/avatar-color.svg" alt=""></span>';
const pageHeader = (title, end = '') => `<header class="page-header"><button class="icon-button" data-action="back" aria-label="Go back">${icon('arrow-left')}</button><h1>${title}</h1><div class="header-end">${end}</div></header>`;
const primary = (label, action, options = '') => `<div class="bottom-action"><button class="primary-button" data-action="${action}" ${options}>${label}</button></div>`;
const maskDots = () => `<span class="mask-dots" aria-hidden="true">${'<b></b>'.repeat(12)}</span>`;
const emptyState = (title, description, action = '', label = 'Clear search') => `<div class="empty-state">${icon('search')}<h2>${title}</h2><p>${description}</p>${action ? `<button class="text-button" data-action="${action}">${label}</button>` : ''}</div>`;

function activeNavIcon(name) {
  const paths = {
    home: '<path d="M10.8 2.5a2 2 0 0 1 2.4 0l8 6A2 2 0 0 1 22 10v9a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3v-9a2 2 0 0 1 .8-1.5z"/><path d="M9 16h6v6H9z" fill="var(--surface)"/>',
    recipients: '<path d="M4 3a1 1 0 0 1 1 1v15h15a1 1 0 1 1 0 2H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1m3.3 11.3 4-4a1 1 0 0 1 1.4 0L15 12.6l4.3-4.3a1 1 0 0 1 1.4 1.4l-5 5a1 1 0 0 1-1.4 0L12 12.4l-3.3 3.3a1 1 0 0 1-1.4-1.4"/>',
    activity: '<path d="M12 2a1 1 0 0 1 1 .8L16 18l1-6a1 1 0 0 1 1-1h3a1 1 0 1 1 0 2h-2.2l-1.9 8.2a1 1 0 0 1-2 0L12 6.7 10 15a1 1 0 0 1-1.9.2L6.4 11H3a1 1 0 1 1 0-2h4a1 1 0 0 1 .9.6l.8 1.8L11 2.8A1 1 0 0 1 12 2"/>'
  };
  return `<svg class="active-nav-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">${paths[name]}</svg>`;
}

function navigation(active) {
  const item = (name, label, symbol) => `<button class="nav-item ${active === name ? 'is-active' : ''}" data-action="nav" data-screen="${name}" ${active === name ? 'aria-current="page"' : ''}>${active === name ? activeNavIcon(name) : icon(symbol)}<span>${label}</span></button>`;
  return `<nav class="bottom-nav" aria-label="Main navigation">${item('home', 'Home', 'home-2')}${item('recipients', 'Recipients', 'chart-line')}<button class="scan-button" data-action="scan" aria-label="Scan a QR code">${icon('scan')}</button>${item('activity', 'Activity', 'activity')}<button class="nav-item" data-action="nav" data-screen="cards">${icon('credit-card')}<span>Card</span></button></nav>`;
}

function transactionRow(transaction) {
  return `<button class="transaction-row" data-action="transaction" data-id="${transaction.id}"><span class="transaction-icon">${icon(transaction.direction === 'out' ? 'arrow-up-right' : 'arrow-down-left')}</span><span class="transaction-info"><span class="transaction-name">${transaction.direction === 'out' ? 'Transfer to' : 'Receive from'} ${escapeHtml(transaction.person)}</span><span class="transaction-time">${transaction.time}</span></span><span class="transaction-amount"><span class="amount-sign ${transaction.direction === 'out' ? 'out' : ''}">${transaction.direction === 'out' ? '−' : '+'}</span>${money(transaction.amount)}</span></button>`;
}

function homeView() {
  const walletCards = accounts.map((account, index) => `<article class="account-card ${index ? 'dark' : ''} ${state.wallet !== index ? 'is-preview' : ''}" data-wallet="${index}" ${state.wallet !== index ? 'inert' : ''}><div class="account-top"><button class="flag-button" data-action="switch-wallet" aria-label="Switch currency account"><svg class="flag" aria-hidden="true"><use href="#flag-${account.flag}"/></svg></button><span class="visa">VISA</span></div><p class="balance-label">Your balance</p><div class="balance-row"><strong class="balance-value">${state.hiddenBalances.has(account.id) ? '••••••' : money(account.balance, account.currency, account.currency === 'USD')}</strong><button class="eye-button" data-action="balance" data-id="${account.id}" aria-label="${state.hiddenBalances.has(account.id) ? 'Show' : 'Hide'} balance" aria-pressed="${state.hiddenBalances.has(account.id)}">${icon(state.hiddenBalances.has(account.id) ? 'eye-off' : 'eye')}</button></div><div class="account-footer"><div><span>Account number</span><strong>**** ${account.number}</strong></div><div><span>Valid</span><strong>${account.valid}</strong></div></div></article>`).join('');
  return `<section class="screen home-screen" aria-label="Home"><header class="home-header"><button class="profile-button" data-action="profile" aria-label="Open Jos Pham's profile">${avatar()}<span><span class="welcome">Welcome back,</span><span class="profile-name">Jos Pham</span></span></button><button class="earn-button" data-action="referrals">Earn $45</button></header><section class="account-section"><h1 class="section-title">Account</h1><div class="wallet-carousel" aria-label="Wallet accounts"><div class="wallet-track" style="--wallet-offset: ${state.wallet ? '-70.1cqw' : '0cqw'}">${walletCards}</div><button class="account-next" data-action="switch-wallet" aria-label="Switch to ${accounts[state.wallet ? 0 : 1].name}" ${state.wallet ? 'hidden' : ''}></button></div></section><div class="quick-actions"><button class="pill-button" data-action="request">${icon('arrow-down-left')}Request</button><button class="pill-button" data-action="transfer">${icon('arrow-up-right')}Transfer</button></div><section class="home-transactions"><div class="section-heading"><h2 class="section-title">Transaction</h2><button class="text-button" data-action="nav" data-screen="activity">View all</button></div><p class="day-label">Today</p><div class="transaction-list">${transactions.slice(0, 2).map(transactionRow).join('')}</div></section>${navigation('home')}</section>`;
}

function referralView() {
  return `<section class="screen" aria-label="Referrals">${pageHeader('Referrals')}<article class="referral-card"><h2 class="referral-title">SHARE QR<br>AND EARN $45</h2><p class="referral-description">Share QR with 5 friends and earn $45<br>for yourself. Your friends get zero fees<br>on a transfer up to $500.</p><div class="qr-panel">${makeQr('LIME:INVITE:JOS45')}</div></article><div id="share-popover" class="share-popover" hidden><button data-action="copy-invite">${icon('copy')}Copy invitation code</button><button data-action="download-invite">${icon('download')}Save QR code</button><button data-action="share-code">${icon('share-2')}Share invitation</button></div>${primary('Share Now', 'share', 'aria-expanded="false" aria-controls="share-popover"')}</section>`;
}

function bankCard(card, showMore = true) {
  return `<article class="bank-card ${card.dark ? 'dark' : ''}"><div class="bank-card-top"><h3 class="bank-name">${escapeHtml(card.nickname || card.bank)}</h3><span class="visa">VISA</span></div><p class="card-number" aria-label="Card ending in ${card.number}">${maskDots()}<span>${escapeHtml(card.number)}</span></p><div class="bank-card-bottom"><strong class="balance-value">${money(card.balance)}</strong>${showMore ? `<button class="card-more" data-action="card-detail" data-id="${card.id}" aria-label="Manage ${escapeHtml(card.nickname || card.bank)} card">${icon('dots-vertical')}</button>` : ''}</div></article>`;
}

function cardsView() {
  const pages = Math.ceil(cards.length / 2);
  state.cardPage = Math.max(0, Math.min(state.cardPage, pages - 1));
  return `<section class="screen" aria-label="My Cards">${pageHeader('My Cards')}<div class="cards-content"><h2 class="section-title">My Card</h2><div class="bank-card-list">${cards.length ? cards.slice(state.cardPage * 2, state.cardPage * 2 + 2).map((card) => bankCard(card)).join('') : emptyState('No cards yet', 'Add a card to keep your accounts together.')}</div>${pages > 1 ? pagination('cards', state.cardPage, pages) : ''}</div>${primary('Add New Card', 'add-card')}</section>`;
}

function recipientRow(recipient) {
  return `<button class="recipient-row" data-action="recipient" data-id="${recipient.id}"><span class="recipient-avatar">${escapeHtml(recipient.initials)}</span><span class="recipient-meta"><strong>${escapeHtml(recipient.name)}</strong><span>${escapeHtml(recipient.bank)} · ${escapeHtml(recipient.number)}</span></span>${icon('chevron-right')}</button>`;
}

function recipientResults() {
  const results = recipients.filter((recipient) => `${recipient.name} ${recipient.bank} ${recipient.number}`.toLowerCase().includes(state.recipientQuery.toLowerCase()));
  const pages = Math.ceil(results.length / 5);
  state.recipientPage = Math.max(0, Math.min(state.recipientPage, pages - 1));
  return results.length ? results.slice(state.recipientPage * 5, state.recipientPage * 5 + 5).map(recipientRow).join('') + (pages > 1 ? pagination('recipients', state.recipientPage, pages) : '') : emptyState('No recipients found', 'Try a different name or account number.', 'clear-recipients');
}

function searchField(id, value, placeholder) {
  return `<div class="search-field">${icon('search')}<input id="${id}" data-field="${id}" type="search" value="${escapeHtml(value)}" placeholder="${placeholder}" aria-label="${placeholder}" autocomplete="off" enterkeyhint="search"><button class="clear-search" data-action="clear-${id === 'recipientQuery' ? 'recipients' : 'activity'}" aria-label="Clear search" ${value ? '' : 'hidden'}>${icon('x')}</button></div>`;
}

function recipientsView() {
  return `<section class="screen" aria-label="Recipients">${pageHeader('Recipients', `<button class="icon-button" data-action="add-recipient" aria-label="Add recipient">${icon('plus')}</button>`)}<div class="content"><h2 class="content-title">Your people</h2>${searchField('recipientQuery', state.recipientQuery, 'Search recipients')}<div id="recipient-results" class="recipient-list">${recipientResults()}</div></div>${navigation('recipients')}</section>`;
}

function pagination(type, page, pages) {
  return `<div class="pagination"><button class="icon-button" data-action="paginate" data-type="${type}" data-step="-1" aria-label="Previous page" ${page === 0 ? 'disabled' : ''}>${icon('chevron-left')}</button><span>${page + 1} / ${pages}</span><button class="icon-button" data-action="paginate" data-type="${type}" data-step="1" aria-label="Next page" ${page + 1 >= pages ? 'disabled' : ''}>${icon('chevron-right')}</button></div>`;
}

function activityResults() {
  const filtered = transactions.filter((transaction) => (state.filter === 'all' || transaction.direction === state.filter) && `${transaction.person} ${transaction.note} ${transaction.amount}`.toLowerCase().includes(state.activityQuery.toLowerCase()));
  const pages = Math.ceil(filtered.length / 4);
  state.activityPage = Math.max(0, Math.min(state.activityPage, pages - 1));
  const rows = filtered.slice(state.activityPage * 4, state.activityPage * 4 + 4);
  let date = '';
  return rows.length ? `<div class="transaction-list">${rows.map((transaction) => { const label = transaction.date !== date ? `<p class="day-label">${transaction.date}</p>` : ''; date = transaction.date; return label + transactionRow(transaction); }).join('')}</div>${pages > 1 ? pagination('activity', state.activityPage, pages) : ''}` : emptyState('No transactions found', 'Try another name, amount or filter.', 'clear-activity');
}

function activityView() {
  return `<section class="screen" aria-label="Activity">${pageHeader('Activity')}<div class="content"><h2 class="content-title">Your transactions</h2>${searchField('activityQuery', state.activityQuery, 'Search transactions')}<div class="segmented" aria-label="Transaction type">${[['all', 'All'], ['in', 'Received'], ['out', 'Sent']].map(([value, label]) => `<button data-action="filter" data-value="${value}" aria-pressed="${state.filter === value}">${label}</button>`).join('')}</div><div id="activity-results" class="activity-list">${activityResults()}</div></div>${navigation('activity')}</section>`;
}

function choice(name, current, options) {
  const selected = options.find((option) => option.value === current);
  return `<div class="choice"><button class="choice-trigger" type="button" data-action="toggle-choice" aria-expanded="false" aria-controls="choice-${name}"><span>${escapeHtml(selected?.label || current)}</span>${icon('chevron-down')}</button><div id="choice-${name}" class="choice-menu" role="listbox" aria-label="${name}" hidden>${options.map((option) => `<button class="choice-option" type="button" role="option" data-action="choose" data-choice="${name}" data-value="${escapeHtml(option.value)}" aria-selected="${current === option.value}" ${option.disabled ? 'disabled' : ''}><span>${escapeHtml(option.label)}</span>${current === option.value ? icon('check') : ''}</button>`).join('')}</div></div>`;
}

function transferView() {
  const transfer = state.transfer;
  const account = accounts.find((entry) => entry.id === transfer.account);
  return `<section class="screen" aria-label="Transfer">${pageHeader('Transfer')}<form id="transfer-form" class="content" novalidate><h2 class="content-title">Send money</h2><div class="form-fields"><div class="field"><label>To</label>${choice('recipient', transfer.recipient, recipients.map((recipient) => ({ value: recipient.id, label: recipient.name })))}</div><div class="field"><label>From</label>${choice('account', transfer.account, accounts.map((entry) => ({ value: entry.id, label: `${entry.currency} account · ${entry.number}` })))}</div><div class="field"><label for="transfer-amount">Amount (${account.currency})</label><div class="amount-field"><span>${account.currency === 'USD' ? '$' : '₫'}</span><input id="transfer-amount" data-field="transfer.amount" inputmode="decimal" type="text" value="${escapeHtml(transfer.amount)}" placeholder="0.00" autocomplete="off" aria-describedby="amount-error"></div><p id="amount-error" class="field-error" role="alert"></p></div><div class="field"><label for="transfer-note">Note <span class="optional">(optional)</span></label><input id="transfer-note" data-field="transfer.note" type="text" maxlength="60" value="${escapeHtml(transfer.note)}" placeholder="What's it for?"></div></div><div class="form-summary"><span>Available balance</span><strong>${money(account.balance, account.currency, account.currency === 'USD')}</strong></div><p class="form-feedback" role="alert"></p></form>${primary('Continue', 'review-transfer')}</section>`;
}

function reviewTransferView() {
  const transfer = state.transfer;
  const recipient = recipients.find((entry) => entry.id === transfer.recipient);
  const account = accounts.find((entry) => entry.id === transfer.account);
  return `<section class="screen" aria-label="Review transfer">${pageHeader('Review Transfer')}<div class="content"><h2 class="content-title">Ready to send</h2><p class="review-amount">${money(Number(transfer.amount), account.currency, account.currency === 'USD')}</p><div class="review-person"><span class="recipient-avatar">${escapeHtml(recipient.initials)}</span><div><strong>${escapeHtml(recipient.name)}</strong><p class="content-subtitle">${escapeHtml(recipient.bank)} · ${escapeHtml(recipient.number)}</p></div></div><dl class="detail-list"><div class="detail-row"><dt>From</dt><dd>${account.currency} account · ${account.number}</dd></div><div class="detail-row"><dt>Transfer fee</dt><dd>${money(0, account.currency, account.currency === 'USD')}</dd></div><div class="detail-row"><dt>Total</dt><dd>${money(Number(transfer.amount), account.currency, account.currency === 'USD')}</dd></div>${transfer.note ? `<div class="detail-row"><dt>Note</dt><dd>${escapeHtml(transfer.note)}</dd></div>` : ''}</dl><div id="transfer-service" class="service-notice" hidden>${icon('plug-connected')}<span>Connect your banking service to authorize this transfer. No money has been moved.</span></div></div>${primary('Confirm Transfer', 'confirm-transfer')}</section>`;
}

function requestView() {
  return `<section class="screen" aria-label="Request money">${pageHeader('Request Money')}<form id="request-form" class="content" novalidate><h2 class="content-title">Make a request</h2><p class="content-subtitle">Let someone pay you with a QR code.</p><div class="form-fields"><div class="field"><label for="request-amount">Amount (USD)</label><div class="amount-field"><span>$</span><input id="request-amount" data-field="request.amount" inputmode="decimal" value="${escapeHtml(state.request.amount)}" placeholder="0.00" autocomplete="off" aria-describedby="request-error"></div><p id="request-error" class="field-error" role="alert"></p></div><div class="field"><label for="request-note">Note <span class="optional">(optional)</span></label><input id="request-note" data-field="request.note" maxlength="60" value="${escapeHtml(state.request.note)}" placeholder="What's it for?"></div></div><dl class="detail-list"><div class="detail-row"><dt>Receive into</dt><dd>USD account · 9934</dd></div><div class="detail-row"><dt>Account holder</dt><dd>Jos Pham</dd></div></dl></form>${primary('Create QR Code', 'create-request')}</section>`;
}

function requestQrView() {
  return `<section class="screen" aria-label="Payment request">${pageHeader('Request Money')}<div class="content"><h2 class="content-title">Your payment QR</h2><div class="request-qr">${makeQr(state.request.payload)}</div><p class="request-value">${money(Number(state.request.amount), 'USD', true)}</p><p class="request-caption">Jos Pham · USD account 9934</p>${state.request.note ? `<p class="request-caption">${escapeHtml(state.request.note)}</p>` : ''}<div class="secondary-actions"><button data-action="download-request">${icon('download')}Save QR</button><button data-action="copy-request">${icon('copy')}Copy code</button></div></div>${primary('Done', 'home')}</section>`;
}

function scanView() {
  return `<section class="screen" aria-label="Scan QR">${pageHeader('Scan QR Code')}<form id="scan-form" class="content" novalidate><h2 class="content-title">Scan. Send. Simple.</h2><div class="scan-area">${icon('scan')}<p>Scan a Lime payment QR<br>or enter its code below.</p></div><div class="secondary-actions"><button data-action="camera" type="button">${icon('camera')}Open camera</button></div><div class="field" style="margin-top: 5cqw"><label for="scan-code">Payment or invitation code</label><input id="scan-code" type="text" maxlength="120" placeholder="LIME:…" autocomplete="off" autocapitalize="none" spellcheck="false" aria-describedby="scan-error"><p id="scan-error" class="field-error" role="alert"></p></div></form>${primary('Continue', 'read-code')}</section>`;
}

function addCardView() {
  return `<section class="screen" aria-label="Add card">${pageHeader('Add New Card')}<form id="card-form" class="content" novalidate><h2 class="content-title">A place for your card</h2><div class="form-fields"><div class="field"><label>Bank</label>${choice('bank', state.addCard.bank, [{ value: 'Standard Chartered', label: 'Standard Chartered' }, { value: 'Bank of America', label: 'Bank of America' }, { value: 'Chase', label: 'Chase' }, { value: 'Other', label: 'Other banks · coming soon', disabled: true }])}</div><div class="field"><label for="card-nickname">Card name <span class="optional">(optional)</span></label><input id="card-nickname" data-field="addCard.nickname" maxlength="24" value="${escapeHtml(state.addCard.nickname)}" placeholder="Everyday card"></div><div class="field"><label for="card-digits">Last 4 digits</label><input id="card-digits" data-field="addCard.number" inputmode="numeric" maxlength="4" value="${escapeHtml(state.addCard.number)}" placeholder="0000" autocomplete="off" aria-describedby="card-error"><p id="card-error" class="field-error" role="alert"></p></div></div><div class="service-notice">${icon('shield-lock')}<span>Only the last four digits are needed. Never enter your full card number or security code.</span></div></form>${primary('Add Card', 'save-card')}</section>`;
}

function cardDetailView() {
  const card = cards.find((entry) => entry.id === state.selectedCard);
  return `<section class="screen" aria-label="Card details">${pageHeader('Card Details')}<div class="content"><div class="card-detail-preview">${bankCard(card, false)}</div><div class="form-fields"><div class="field"><label for="edit-card-name">Card name</label><input id="edit-card-name" maxlength="24" value="${escapeHtml(card.nickname)}" placeholder="${escapeHtml(card.bank)}"></div></div><dl class="detail-list"><div class="detail-row"><dt>Bank</dt><dd>${escapeHtml(card.bank)}</dd></div><div class="detail-row"><dt>Card type</dt><dd>Visa</dd></div><div class="detail-row"><dt>Last 4 digits</dt><dd>${escapeHtml(card.number)}</dd></div></dl><button class="delete-button" data-action="remove-card">Remove Card</button></div>${primary('Save Changes', 'rename-card')}</section>`;
}

function transactionDetailView() {
  const transaction = transactions.find((entry) => entry.id === state.selectedTransaction);
  return `<section class="screen" aria-label="Transaction details">${pageHeader('Transaction')}<div class="content"><h2 class="content-title">${transaction.direction === 'out' ? 'Transfer sent' : 'Money received'}</h2><p class="review-amount">${transaction.direction === 'out' ? '−' : '+'}${money(transaction.amount)}</p><p class="content-subtitle">${transaction.direction === 'out' ? 'To' : 'From'} ${escapeHtml(transaction.person)}</p><dl class="detail-list"><div class="detail-row"><dt>Status</dt><dd>Completed</dd></div><div class="detail-row"><dt>Date</dt><dd>${transaction.fullDate}</dd></div><div class="detail-row"><dt>Time</dt><dd>${transaction.time}</dd></div><div class="detail-row"><dt>Account</dt><dd>USD · 9934</dd></div><div class="detail-row"><dt>Reference</dt><dd>${transaction.reference}</dd></div><div class="detail-row"><dt>Note</dt><dd>${escapeHtml(transaction.note)}</dd></div></dl><div class="secondary-actions"><button data-action="copy-reference">${icon('copy')}Copy reference</button></div></div>${primary(transaction.direction === 'out' ? 'Send Again' : 'Send Money', 'repeat-transfer')}</section>`;
}

function profileView() {
  return `<section class="screen" aria-label="Profile">${pageHeader('My Account')}<div class="content profile-content">${avatar()}<h2>Jos Pham</h2><p>Your everyday wallet.</p><dl class="detail-list"><div class="detail-row"><dt>Account</dt><dd>USD · 9934</dd></div><div class="detail-row"><dt>Currency accounts</dt><dd>USD & VND</dd></div><div class="detail-row"><dt>Referral code</dt><dd>JOS45</dd></div></dl><div class="profile-links"><button data-action="nav" data-screen="cards"><span>My cards</span>${icon('chevron-right')}</button><button data-action="nav" data-screen="recipients"><span>My recipients</span>${icon('chevron-right')}</button><button data-action="referrals"><span>Invite friends</span>${icon('chevron-right')}</button></div></div>${primary('Back to Home', 'home')}</section>`;
}

function addRecipientView() {
  return `<section class="screen" aria-label="Add recipient">${pageHeader('Add Recipient')}<form id="recipient-form" class="content" novalidate><h2 class="content-title">Someone new</h2><div class="form-fields"><div class="field"><label for="recipient-name">Full name</label><input id="recipient-name" maxlength="32" placeholder="Full name" autocomplete="off" aria-describedby="recipient-error"></div><div class="field"><label for="recipient-bank">Bank name</label><input id="recipient-bank" maxlength="28" placeholder="Bank name" autocomplete="off"></div><div class="field"><label for="recipient-digits">Last 4 account digits</label><input id="recipient-digits" maxlength="4" inputmode="numeric" placeholder="0000" autocomplete="off"></div><p id="recipient-error" class="field-error" role="alert"></p></div><div class="service-notice">${icon('address-book')}<span>Keep your recipient's details together for your next transfer.</span></div></form>${primary('Save Recipient', 'save-recipient')}</section>`;
}

const screens = { home: homeView, referrals: referralView, cards: cardsView, recipients: recipientsView, activity: activityView, transfer: transferView, reviewTransfer: reviewTransferView, request: requestView, requestQr: requestQrView, scan: scanView, addCard: addCardView, cardDetail: cardDetailView, transactionDetail: transactionDetailView, profile: profileView, addRecipient: addRecipientView };

function render(animate = false) {
  view.innerHTML = screens[state.screen]();
  if (animate) view.firstElementChild.classList.add('screen-enter');
}

function navigate(screen, reset = false) {
  clearTimeout(toastTimer);
  toast.hidden = true;
  stopCamera();
  closeDialog();
  if (reset) state.history = [];
  else state.history.push(state.screen);
  state.screen = screen;
  render(true);
  const heading = view.querySelector('h1');
  if (heading) { heading.tabIndex = -1; heading.focus({ preventScroll: true }); }
}

function goBack() {
  clearTimeout(toastTimer);
  toast.hidden = true;
  stopCamera();
  state.screen = state.history.pop() || 'home';
  render(true);
  const heading = view.querySelector('h1');
  if (heading) { heading.tabIndex = -1; heading.focus({ preventScroll: true }); }
}

function notify(message) {
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.hidden = false;
  toastTimer = setTimeout(() => { toast.hidden = true; }, 2600);
}

async function copyText(text, button, label = 'Copied') {
  try {
    await navigator.clipboard.writeText(text);
    if (button?.isConnected) button.innerHTML = `${icon('check')} ${label}`;
    notify(label);
  } catch {
    notify('Clipboard access is unavailable. Select and copy the code.');
    const existing = view.querySelector('.copy-field');
    if (existing) { existing.focus(); existing.select(); return; }
    const field = document.createElement('input');
    field.className = 'copy-field'; field.value = text; field.readOnly = true; field.setAttribute('aria-label', 'Code to copy');
    view.querySelector('.content, .share-popover').append(field);
    field.focus(); field.select();
  }
}

function closeChoices() {
  view.querySelectorAll('.choice-menu').forEach((menu) => { menu.hidden = true; });
  view.querySelectorAll('.choice-trigger').forEach((trigger) => trigger.setAttribute('aria-expanded', 'false'));
}

function setError(input, error, message) {
  error.textContent = message;
  input.setAttribute('aria-invalid', message ? 'true' : 'false');
  if (message) input.focus();
}

function validateAmount(value, currency = 'USD', limit = Infinity) {
  if (!/^\d{1,9}(\.\d{1,2})?$/.test(value.trim()) || Number(value) <= 0) return 'Enter an amount greater than zero.';
  if (currency === 'VND' && !Number.isInteger(Number(value))) return 'Enter a whole amount in VND.';
  if (Number(value) > limit) return 'This amount is more than your available balance.';
  return '';
}

function closeDialog() {
  if (overlay.hidden) return;
  overlay.hidden = true;
  overlay.innerHTML = '';
  view.inert = false;
  if (dialogTrigger?.isConnected) dialogTrigger.focus({ preventScroll: true });
}

function removeCardDialog(trigger) {
  dialogTrigger = trigger;
  view.inert = true;
  overlay.hidden = false;
  overlay.innerHTML = `<div class="scrim" data-action="close-dialog"></div><section class="dialog" role="dialog" aria-modal="true" aria-labelledby="remove-title"><h2 id="remove-title">Remove this card?</h2><p>You can add it to your wallet again whenever you need it.</p><div class="dialog-actions"><button data-action="close-dialog">Keep Card</button><button class="confirm-danger" data-action="confirm-remove">Remove</button></div></section>`;
  overlay.querySelector('button').focus({ preventScroll: true });
}

function readCode(code) {
  const error = view.querySelector('#scan-error');
  if (code === 'LIME:INVITE:JOS45') { navigate('referrals'); notify('Invitation code: JOS45'); return; }
  const match = /^LIME:REQUEST:(USD|VND):(\d{1,9}(?:\.\d{1,2})?):(\d{4})$/.exec(code.trim());
  if (!match || validateAmount(match[2], match[1])) { error.textContent = 'That code is not a valid Lime payment request.'; return; }
  const account = accounts.find((entry) => entry.currency === match[1]);
  let recipient = recipients.find((entry) => entry.number === match[3]);
  if (!recipient && accounts.some((entry) => entry.number === match[3])) {
    recipient = { id: 'jos', name: 'Jos Pham', initials: 'JP', bank: 'Lime Wallet', number: match[3] };
    recipients.push(recipient);
  }
  if (!recipient) { error.textContent = 'Save this recipient before opening their payment request.'; return; }
  state.transfer.recipient = recipient.id;
  state.transfer.account = account.id;
  state.transfer.amount = match[2];
  state.transfer.note = `Payment request · ${match[3]}`;
  navigate('transfer');
}

function stopCamera() {
  if (cameraFrame) cancelAnimationFrame(cameraFrame);
  cameraFrame = undefined;
  if (cameraStream) cameraStream.getTracks().forEach((track) => track.stop());
  cameraStream = undefined;
}

async function openCamera(button) {
  const error = view.querySelector('#scan-error');
  if (!navigator.mediaDevices?.getUserMedia || !('BarcodeDetector' in window)) { error.textContent = 'Camera scanning is unavailable in this browser. Enter a code instead.'; return; }
  button.disabled = true;
  button.innerHTML = `${icon('loader-2')} Opening camera…`;
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
    if (state.screen !== 'scan') { stream.getTracks().forEach((track) => track.stop()); return; }
    cameraStream = stream;
    const area = view.querySelector('.scan-area');
    const video = document.createElement('video');
    video.autoplay = true; video.playsInline = true; video.muted = true; video.srcObject = stream;
    area.replaceChildren(video); area.classList.add('is-live');
    await video.play();
    const detector = new BarcodeDetector({ formats: ['qr_code'] });
    const scanFrame = async () => {
      if (!cameraStream || !video.isConnected) return;
      try {
        const codes = await detector.detect(video);
        if (codes.length) { stopCamera(); readCode(codes[0].rawValue); return; }
      } catch { error.textContent = 'The code could not be read. Try entering it below.'; stopCamera(); }
      if (cameraStream) cameraFrame = requestAnimationFrame(scanFrame);
    };
    cameraFrame = requestAnimationFrame(scanFrame);
    button.innerHTML = `${icon('camera-off')} Close camera`;
    button.dataset.action = 'close-camera'; button.disabled = false;
  } catch {
    stopCamera();
    if (state.screen === 'scan') { error.textContent = 'Camera access was denied or no camera was found. Enter a code instead.'; button.disabled = false; button.innerHTML = `${icon('camera')} Open camera`; }
  }
}

function makeQr(text) {
  const bytes = new TextEncoder().encode(text);
  if (bytes.length > 53) throw new Error('QR payload is too long.');
  const bits = [];
  const append = (value, length) => { for (let bit = length - 1; bit >= 0; bit--) bits.push((value >>> bit) & 1); };
  append(4, 4); append(bytes.length, 8); bytes.forEach((byte) => append(byte, 8));
  append(0, Math.min(4, 440 - bits.length));
  while (bits.length % 8) bits.push(0);
  const data = [];
  for (let offset = 0; offset < bits.length; offset += 8) data.push(bits.slice(offset, offset + 8).reduce((value, bit) => (value << 1) | bit, 0));
  for (let pad = 0; data.length < 55; pad++) data.push(pad % 2 ? 0x11 : 0xec);
  const multiply = (a, b) => { let result = 0; for (let i = 7; i >= 0; i--) { result = (result << 1) ^ ((result >>> 7) * 0x11d); result ^= ((b >>> i) & 1) * a; } return result; };
  let generator = [1]; let root = 1;
  for (let i = 0; i < 15; i++) { const next = Array(generator.length + 1).fill(0); generator.forEach((coefficient, j) => { next[j] ^= coefficient; next[j + 1] ^= multiply(coefficient, root); }); generator = next; root = multiply(root, 2); }
  const remainder = Array(15).fill(0);
  data.forEach((byte) => { const factor = byte ^ remainder.shift(); remainder.push(0); for (let i = 0; i < 15; i++) remainder[i] ^= multiply(generator[i + 1], factor); });
  const codewords = [...data, ...remainder];
  const size = 29; const grid = Array.from({ length: size }, () => Array(size).fill(false));
  const reserved = Array.from({ length: size }, () => Array(size).fill(false));
  const set = (x, y, value) => { if (x >= 0 && y >= 0 && x < size && y < size) { grid[y][x] = Boolean(value); reserved[y][x] = true; } };
  for (const [cx, cy] of [[3, 3], [25, 3], [3, 25]]) for (let y = -4; y <= 4; y++) for (let x = -4; x <= 4; x++) { const distance = Math.max(Math.abs(x), Math.abs(y)); set(cx + x, cy + y, distance !== 2 && distance !== 4); }
  for (let i = 8; i < size - 8; i++) { set(6, i, i % 2 === 0); set(i, 6, i % 2 === 0); }
  for (let y = -2; y <= 2; y++) for (let x = -2; x <= 2; x++) set(22 + x, 22 + y, Math.max(Math.abs(x), Math.abs(y)) !== 1);
  let format = 8 << 10;
  for (let i = 14; i >= 10; i--) if ((format >>> i) & 1) format ^= 0x537 << (i - 10);
  format = ((8 << 10) | format) ^ 0x5412;
  const formatBit = (i) => (format >>> i) & 1;
  for (let i = 0; i <= 5; i++) set(8, i, formatBit(i));
  set(8, 7, formatBit(6)); set(8, 8, formatBit(7)); set(7, 8, formatBit(8));
  for (let i = 9; i < 15; i++) set(14 - i, 8, formatBit(i));
  for (let i = 0; i < 8; i++) set(size - 1 - i, 8, formatBit(i));
  for (let i = 8; i < 15; i++) set(8, size - 15 + i, formatBit(i));
  set(8, size - 8, true);
  let index = 0;
  for (let right = size - 1; right >= 1; right -= 2) { if (right === 6) right = 5; for (let vertical = 0; vertical < size; vertical++) { const y = ((right + 1) & 2) === 0 ? size - 1 - vertical : vertical; for (let j = 0; j < 2; j++) { const x = right - j; if (!reserved[y][x]) { const value = index < codewords.length * 8 ? (codewords[index >>> 3] >>> (7 - (index & 7))) & 1 : 0; grid[y][x] = Boolean(value ^ ((x + y) % 2 === 0 ? 1 : 0)); index++; } } } }
  const path = grid.flatMap((row, y) => row.flatMap((dark, x) => dark ? [`M${x} ${y}h1v1h-1z`] : [])).join('');
  return `<svg class="qr-code" viewBox="-1 -1 31 31" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="QR code for ${escapeHtml(text)}"><rect x="-1" y="-1" width="31" height="31" fill="#fff"/><path d="${path}" fill="#191a18"/></svg>`;
}

async function downloadQr(text, filename, button) {
  button.disabled = true;
  try {
    const source = new Blob([makeQr(text)], { type: 'image/svg+xml' });
    const sourceUrl = URL.createObjectURL(source);
    const image = new Image();
    try {
      image.src = sourceUrl;
      await image.decode();
      const canvas = document.createElement('canvas'); canvas.width = canvas.height = 740;
      const context = canvas.getContext('2d'); context.fillStyle = '#ffffff'; context.fillRect(0, 0, 740, 740); context.imageSmoothingEnabled = false; context.drawImage(image, 60, 60, 620, 620);
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
      if (!blob) throw new Error('QR export failed.');
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a'); link.href = downloadUrl; link.download = filename; link.click();
      setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
      notify('QR code saved');
    } finally { URL.revokeObjectURL(sourceUrl); }
  } catch { notify('Could not save the QR code. Please try again.'); }
  finally { if (button.isConnected) button.disabled = false; }
}

function updateSearch(name, value) {
  state[name] = value;
  if (name === 'recipientQuery') state.recipientPage = 0;
  const results = view.querySelector(name === 'recipientQuery' ? '#recipient-results' : '#activity-results');
  if (name === 'activityQuery') state.activityPage = 0;
  results.innerHTML = name === 'recipientQuery' ? recipientResults() : activityResults();
  view.querySelector('.clear-search').hidden = !value;
}

async function onClick(event) {
  const button = event.target.closest('[data-action]');
  if (!event.target.closest('.choice')) closeChoices();
  const popover = view.querySelector('#share-popover');
  if (popover && !event.target.closest('.share-popover, [data-action="share"]')) {
    popover.hidden = true;
    view.querySelector('[data-action="share"]').setAttribute('aria-expanded', 'false');
  }
  if (!button || button.disabled) return;
  const action = button.dataset.action;
  switch (action) {
    case 'nav': navigate(button.dataset.screen, true); break;
    case 'home': navigate('home', true); break;
    case 'back': goBack(); break;
    case 'profile': navigate('profile'); break;
    case 'referrals': navigate('referrals'); break;
    case 'scan': navigate('scan'); break;
    case 'request': navigate('request'); break;
    case 'transfer': state.transfer.account = accounts[state.wallet].id; navigate('transfer'); break;
    case 'balance': state.hiddenBalances.has(button.dataset.id) ? state.hiddenBalances.delete(button.dataset.id) : state.hiddenBalances.add(button.dataset.id); render(); view.querySelector('.eye-button').focus({ preventScroll: true }); break;
    case 'switch-wallet': state.wallet = state.wallet ? 0 : 1; render(); break;
    case 'transaction': state.selectedTransaction = button.dataset.id; navigate('transactionDetail'); break;
    case 'card-detail': state.selectedCard = button.dataset.id; navigate('cardDetail'); break;
    case 'recipient': state.transfer.recipient = button.dataset.id; navigate('transfer'); break;
    case 'add-recipient': navigate('addRecipient'); break;
    case 'repeat-transfer': { const transaction = transactions.find((entry) => entry.id === state.selectedTransaction); state.transfer = { recipient: transaction.recipient, account: 'usd', amount: String(transaction.amount), note: transaction.note }; navigate('transfer'); break; }
    case 'filter': state.filter = button.dataset.value; state.activityPage = 0; render(); break;
    case 'paginate': state[button.dataset.type === 'cards' ? 'cardPage' : button.dataset.type === 'recipients' ? 'recipientPage' : 'activityPage'] += Number(button.dataset.step); render(); break;
    case 'clear-recipients': updateSearch('recipientQuery', ''); view.querySelector('#recipientQuery').value = ''; view.querySelector('#recipientQuery').focus(); break;
    case 'clear-activity': state.filter = 'all'; state.activityQuery = ''; state.activityPage = 0; render(); view.querySelector('#activityQuery').focus(); break;
    case 'toggle-choice': { const expanded = button.getAttribute('aria-expanded') === 'true'; closeChoices(); button.setAttribute('aria-expanded', String(!expanded)); button.nextElementSibling.hidden = expanded; if (!expanded) button.nextElementSibling.querySelector('[aria-selected="true"]')?.focus(); break; }
    case 'choose': { const key = button.dataset.choice; if (key === 'bank') state.addCard.bank = button.dataset.value; else state.transfer[key] = button.dataset.value; render(); view.querySelector(`#choice-${key}`).previousElementSibling.focus(); break; }
    case 'review-transfer': { const account = accounts.find((entry) => entry.id === state.transfer.account); const error = validateAmount(state.transfer.amount, account.currency, account.balance); setError(view.querySelector('#transfer-amount'), view.querySelector('#amount-error'), error); if (!error) navigate('reviewTransfer'); break; }
    case 'confirm-transfer': view.querySelector('#transfer-service').hidden = false; button.textContent = 'Bank connection required'; button.disabled = true; break;
    case 'create-request': { const error = validateAmount(state.request.amount); setError(view.querySelector('#request-amount'), view.querySelector('#request-error'), error); if (!error) { state.request.payload = `LIME:REQUEST:USD:${Number(state.request.amount).toFixed(2)}:9934`; navigate('requestQr'); } break; }
    case 'download-request': await downloadQr(state.request.payload, 'lime-payment-qr.png', button); break;
    case 'copy-request': await copyText(state.request.payload, button, 'Payment code copied'); break;
    case 'share': { const popover = view.querySelector('#share-popover'); popover.hidden = !popover.hidden; button.setAttribute('aria-expanded', String(!popover.hidden)); break; }
    case 'copy-invite': await copyText('LIME:INVITE:JOS45', button, 'Invitation code copied'); break;
    case 'download-invite': await downloadQr('LIME:INVITE:JOS45', 'lime-invitation-qr.png', button); break;
    case 'share-code': if (navigator.share) { try { await navigator.share({ title: 'Join me on Lime', text: 'Join me on Lime. Your invitation code is JOS45. LIME:INVITE:JOS45' }); } catch (error) { if (error.name !== 'AbortError') notify('Sharing is unavailable. Copy the invitation code instead.'); } } else await copyText('Join me on Lime. Invitation code: JOS45. LIME:INVITE:JOS45', button, 'Invitation copied'); break;
    case 'add-card': state.addCard = { bank: 'Standard Chartered', nickname: '', number: '' }; navigate('addCard'); break;
    case 'save-card': { const error = /^\d{4}$/.test(state.addCard.number) ? '' : 'Enter exactly four digits.'; setError(view.querySelector('#card-digits'), view.querySelector('#card-error'), error); if (error) break; button.disabled = true; button.innerHTML = `${icon('loader-2')} Adding card…`; await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))); cards.push({ id: `card-${Date.now()}`, bank: state.addCard.bank, nickname: state.addCard.nickname.trim(), number: state.addCard.number, balance: 0, dark: cards.length % 2 === 1 }); state.cardPage = Math.floor((cards.length - 1) / 2); navigate('cards', true); notify('Card added to your wallet'); break; }
    case 'rename-card': { const card = cards.find((entry) => entry.id === state.selectedCard); card.nickname = view.querySelector('#edit-card-name').value.trim(); render(); notify('Card name updated'); break; }
    case 'remove-card': removeCardDialog(button); break;
    case 'close-dialog': closeDialog(); break;
    case 'confirm-remove': { const index = cards.findIndex((entry) => entry.id === state.selectedCard); cards.splice(index, 1); closeDialog(); navigate('cards', true); notify('Card removed from your wallet'); break; }
    case 'copy-reference': await copyText(transactions.find((entry) => entry.id === state.selectedTransaction).reference, button, 'Reference copied'); break;
    case 'read-code': readCode(view.querySelector('#scan-code').value); break;
    case 'camera': await openCamera(button); break;
    case 'close-camera': stopCamera(); render(); break;
    case 'save-recipient': { const name = view.querySelector('#recipient-name').value.trim(); const bank = view.querySelector('#recipient-bank').value.trim(); const number = view.querySelector('#recipient-digits').value; const error = !name || !bank ? 'Enter the recipient name and bank.' : !/^\d{4}$/.test(number) ? 'Enter exactly four account digits.' : ''; view.querySelector('#recipient-error').textContent = error; if (error) { view.querySelector(!name ? '#recipient-name' : !bank ? '#recipient-bank' : '#recipient-digits').focus(); break; } const initials = Array.from(name.split(/\s+/).map((part) => Array.from(part)[0]).join('')).slice(0, 2).join('').toUpperCase(); recipients.push({ id: `recipient-${Date.now()}`, name, initials, bank, number }); state.recipientQuery = name; navigate('recipients', true); notify('Recipient saved'); break; }
  }
}

function onInput(event) {
  const name = event.target.dataset.field;
  if (!name) return;
  if (name === 'recipientQuery' || name === 'activityQuery') updateSearch(name, event.target.value);
  else { const [group, field] = name.split('.'); state[group][field] = event.target.value; event.target.setAttribute('aria-invalid', 'false'); const error = event.target.closest('.field')?.querySelector('.field-error'); if (error) error.textContent = ''; }
}

function onKeyDown(event) {
  if (!overlay.hidden) {
    if (event.key === 'Escape') closeDialog();
    if (event.key === 'Tab') { const buttons = [...overlay.querySelectorAll('button')]; const first = buttons[0]; const last = buttons.at(-1); if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); } else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); } }
    return;
  }
  const choiceMenu = event.target.closest('.choice-menu');
  if (choiceMenu && ['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) { event.preventDefault(); const options = [...choiceMenu.querySelectorAll('button:not(:disabled)')]; let index = options.indexOf(document.activeElement); index = event.key === 'Home' ? 0 : event.key === 'End' ? options.length - 1 : (index + (event.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length; options[index].focus(); }
  if (event.key === 'Escape') { const trigger = event.target.closest('.choice')?.querySelector('.choice-trigger'); closeChoices(); trigger?.focus(); const popover = view.querySelector('#share-popover'); if (popover) { popover.hidden = true; view.querySelector('[data-action="share"]').setAttribute('aria-expanded', 'false'); } }
}

function start() {
  if (started) return;
  started = true;
  view.addEventListener('click', onClick);
  overlay.addEventListener('click', onClick);
  view.addEventListener('input', onInput);
  document.addEventListener('keydown', onKeyDown);
  view.addEventListener('submit', (event) => { event.preventDefault(); const actions = { 'transfer-form': 'review-transfer', 'request-form': 'create-request', 'card-form': 'save-card', 'recipient-form': 'save-recipient', 'scan-form': 'read-code' }; view.querySelector(`[data-action="${actions[event.target.id]}"]`)?.click(); });
  let swipeX = null;
  view.addEventListener('pointerdown', (event) => { if (event.target.closest('.wallet-carousel')) swipeX = event.clientX; });
  view.addEventListener('pointerup', (event) => { if (swipeX === null) return; if (Math.abs(event.clientX - swipeX) > view.clientWidth * .14) { state.wallet = event.clientX < swipeX ? 1 : 0; render(); } swipeX = null; });
  view.addEventListener('pointercancel', () => { swipeX = null; });
  window.addEventListener('pagehide', stopCamera);
  render();
}
start();
