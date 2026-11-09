const ASSETS = {
  BTC: { name: 'Bitcoin', price: 42850, change: 6.2, volume: '$38.2B', cap: '$820B', dominance: '47.3%', quantity: .18 },
  BNB: { name: 'BNB', price: 320.5, change: 5.6, volume: '$1.4B', cap: '$49.3B', dominance: '2.8%', quantity: 5 },
  ETH: { name: 'Ethereum', price: 3250, change: 8.7, volume: '$19.6B', cap: '$391B', dominance: '22.6%', quantity: 1.5 },
  ADA: { name: 'Cardano', price: .64, change: 7.1, volume: '$584M', cap: '$22.6B', dominance: '1.3%', quantity: 800 },
  USDT: { name: 'Tether', price: 1, change: .01, volume: '$52.1B', cap: '$97.5B', dominance: '5.6%', quantity: 727.78 },
  SOL: { name: 'Solana', price: 142.75, change: -1.8, volume: '$2.8B', cap: '$63.9B', dominance: '3.7%', quantity: 0 },
  XRP: { name: 'XRP', price: .54, change: 2.4, volume: '$962M', cap: '$29.8B', dominance: '1.7%', quantity: 0 }
};
const INCOME = {
  week: { title: 'Income per week', label: 'Week', current: 'This week', previous: 'last week', previousTotal: 561.55, rows: [['Sun', 'Feb 9', 61.84], ['Mon', 'Feb 10', 28.70], ['Tue', 'Feb 11', 78.26], ['Wed', 'Feb 12', 155.20], ['Thu', 'Feb 13', 95.48], ['Fri', 'Feb 14', 60.56], ['Sat', 'Feb 15', 96.11]] },
  month: { title: 'Income per month', label: 'Month', current: 'This month', previous: 'last month', previousTotal: 2397.38, rows: [['W1', 'Feb 1–7', 584.23], ['W2', 'Feb 8–14', 576.15], ['W3', 'Feb 15–21', 562.88], ['W4', 'Feb 22–28', 689.42]] },
  year: { title: 'Income per year', label: 'Year', current: 'This year', previous: 'last year', previousTotal: 29462.80, rows: [['Q1', 'Jan–Mar', 7362.40], ['Q2', 'Apr–Jun', 8054.61], ['Q3', 'Jul–Sep', 6940.25], ['Q4', 'Oct–Dec', 8330.12]] }
};
const ledger = [
  { id: 'KNY-48271', asset: 'BTC', type: 'Buy', total: 1357, fee: 1.27, status: 'Completed', date: '2025-02-14', time: '14:32' },
  { id: 'KNY-48270', asset: 'ETH', type: 'Sell', total: 3816, fee: 2.53, status: 'Pending', date: '2025-02-14', time: '14:16' },
  { id: 'KNY-48269', asset: 'BNB', type: 'Buy', total: 640.80, fee: .85, status: 'Completed', date: '2025-02-13', time: '18:41' },
  { id: 'KNY-48268', asset: 'ADA', type: 'Sell', total: 214.40, fee: .42, status: 'Completed', date: '2025-02-13', time: '11:08' },
  { id: 'KNY-48267', asset: 'BTC', type: 'Sell', total: 1856.72, fee: 0, status: 'Failed', date: '2025-02-12', time: '16:52' },
  { id: 'KNY-48266', asset: 'SOL', type: 'Buy', total: 428.25, fee: .58, status: 'Completed', date: '2025-02-12', time: '09:23' }
];
for (let index = 0; index < 41; index++) {
  const symbols = ['BTC', 'ETH', 'BNB', 'ADA', 'SOL'];
  ledger.push({ id: `KNY-${48265 - index}`, asset: symbols[index % symbols.length], type: index % 3 === 1 ? 'Sell' : 'Buy', total: Number((126.48 + (index * 137.31) % 1800).toFixed(2)), fee: index === 40 ? 1.10 : 1.02, status: 'Completed', date: '2025-02-14', time: `${String(13 - Math.floor(index / 4)).padStart(2, '0')}:${String(54 - (index % 4) * 12).padStart(2, '0')}` });
}
const notices = [
  { id: 'purchase', title: 'Your BTC purchase is complete', text: '$1,357.00 has been added to your trading activity.', time: 'Today, 14:32', icon: 'circle-check', view: 'trade', tradeId: 'KNY-48271', read: false },
  { id: 'withdrawal', title: 'Withdrawal in progress', text: 'Your $1,200 withdrawal is being processed.', time: 'Today, 12:18', icon: 'arrows-sort', view: 'withdrawal', read: false },
  { id: 'security', title: 'Keep your account protected', text: 'Review your security settings and connected accounts.', time: 'Yesterday, 09:40', icon: 'shield-check', view: 'security', read: false }
];
const FAQS = [
  ['How are exchange fees calculated?', 'An exchange fee is included in your quote before you confirm. The estimate uses a 0.15% fee. Your connected provider supplies the final rate and fees.'],
  ['Why is my withdrawal pending?', 'Withdrawals remain pending while your provider checks and processes the transfer. Open the withdrawal details to review its amount, destination, and status.'],
  ['How do I connect a trading account?', 'Open Security, then Connected accounts. Select your provider and authorize the connection through Kony. Your provider credentials are never requested in this workspace.'],
  ['Can I download my trading activity?', 'Open Trading history, apply any filters you need, and select Export CSV. The file includes all transactions matching your current filters, not just the visible page.']
];
const VIEW_TITLES = { overview: 'Overview', portfolio: 'Portfolio', history: 'Trading history', markets: 'Markets', analytics: 'Analytics', referrals: 'Referrals', security: 'Security', support: 'Help & support', exchange: 'Exchange', withdrawal: 'Withdrawals', account: 'Your account', connections: 'Connected accounts', trade: 'Transaction details', notifications: 'Notifications', search: 'Search' };
const PARENTS = { history: 'portfolio', markets: 'portfolio', exchange: 'portfolio', withdrawal: 'portfolio', trade: 'portfolio', account: 'security', connections: 'security', notifications: 'overview', search: 'overview' };
const RATES = { USD: 1, EUR: .96, GBP: .79 };
const app = {
  view: 'overview', trail: [], period: 'week', day: 3,
  watchlist: new Set(['BTC', 'BNB', 'ETH', 'ADA']), expanded: 'BTC',
  dashboard: { query: '', date: '2025-02-14', status: 'All' },
  history: { query: '', date: 'All', status: 'All', asset: 'All', type: 'All', sort: 'Recent', page: 1 },
  market: { query: '', selected: 'BTC', watchedOnly: false },
  exchange: { sell: 'BTC', buy: 'USDT', amount: '0.025', quote: null, busy: false, error: '' },
  withdrawal: { amount: '', method: 'Bank transfer', address: '', quote: null, busy: false, error: '' },
  profile: { name: 'Alex Morgan', email: 'alex.morgan@mail.com', busy: false, error: '' },
  support: { subject: '', message: '', busy: false, error: '' },
  connection: { provider: 'Coinbase', busy: false, error: '' },
  trade: { id: 'KNY-48271', busy: false, error: '' },
  analyticsMetric: 'income', faq: 0, notificationFilter: 'All', search: '',
  preferences: { currency: 'USD', reduceMotion: false }
};
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const escapeHTML = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const icon = name => `<i class="ti ti-${name}" aria-hidden="true"></i>`;
const button = (label, action, classes = 'button button-outline button-roomy', attributes = '') => `<button type="button" class="${classes}" data-action="${action}" ${attributes}>${label}</button>`;
const sum = rows => rows.reduce((total, row) => total + row[2], 0);
const portfolioTotal = () => Object.values(ASSETS).reduce((total, asset) => total + asset.price * asset.quantity, 0);
const money = (amount, digits = 2) => new Intl.NumberFormat('en-US', { style: 'currency', currency: app.preferences.currency, minimumFractionDigits: digits, maximumFractionDigits: digits }).format(amount * RATES[app.preferences.currency]);
const quantity = amount => new Intl.NumberFormat('en-US', { maximumFractionDigits: 8 }).format(amount);
const dateLabel = date => date === 'All' ? 'All dates' : new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${date}T12:00:00Z`));
const assetPrice = symbol => money(ASSETS[symbol].price, ['BTC', 'ETH'].includes(symbol) ? 0 : 2);
const changeLabel = change => `${change >= 0 ? '+' : ''}${change.toFixed(change < .1 && change > -.1 ? 2 : 1)}%`;
const deltaHTML = change => `<span class="delta${change < 0 ? ' is-negative' : ''}">${escapeHTML(changeLabel(change))}</span>`;
const emptyHTML = (title, text, action = '', label = '', compact = false) => `<div class="empty-state${compact ? ' compact-empty' : ''}">${icon('search')}<h3>${escapeHTML(title)}</h3>${text ? `<p>${escapeHTML(text)}</p>` : ''}${action ? button(escapeHTML(label), action, 'button button-outline') : ''}</div>`;
const heading = (title, description, actions = '') => `<div class="view-heading"><div><h2>${escapeHTML(title)}</h2>${description ? `<p class="subtle">${escapeHTML(description)}</p>` : ''}</div>${actions ? `<div class="view-heading-actions">${actions}</div>` : ''}</div>`;
const errorHTML = error => `<p class="form-error" role="alert" ${error ? '' : 'hidden'}>${escapeHTML(error)}</p>`;
function coinHTML(symbol) {
  let glyph;
  if (symbol === 'BTC') glyph = icon('currency-bitcoin');
  else if (symbol === 'ETH') glyph = icon('currency-ethereum');
  else if (['BNB', 'ADA', 'SOL'].includes(symbol)) glyph = `<svg aria-hidden="true" viewBox="0 0 24 24"><use href="#coin-${symbol.toLowerCase()}"/></svg>`;
  else glyph = symbol === 'USDT' ? '₮' : 'X';
  return `<span class="coin-icon coin-${symbol.toLowerCase()}" aria-hidden="true">${glyph}</span>`;
}
function statusHTML(status) {
  return `<span class="status status-${status.toLowerCase()}">${icon(status === 'Completed' ? 'check' : status === 'Pending' ? 'sun' : 'x')}${escapeHTML(status)}</span>`;
}
function getIncomeRows() {
  if (app.analyticsMetric !== 'fees') return INCOME[app.period].rows;
  if (app.period === 'week') return INCOME.week.rows.map(row => [row[0], row[1], ledger.filter(trade => trade.date === `2025-02-${row[1].split(' ')[1].padStart(2, '0')}`).reduce((total, trade) => total + trade.fee, 0)]);
  const total = ledger.reduce((value, trade) => value + trade.fee, 0);
  if (app.period === 'month') return [['W1', 'Feb 1–7', 0], ['W2', 'Feb 8–14', total], ['W3', 'Feb 15–21', 0], ['W4', 'Feb 22–28', 0]];
  return [['Q1', 'Jan–Mar', total], ['Q2', 'Apr–Jun', 0], ['Q3', 'Jul–Sep', 0], ['Q4', 'Oct–Dec', 0]];
}
function chartHTML(rows, scope = 'overview', height = 18) {
  const max = Math.max(...rows.map(row => row[2]), 1) * 1.07;
  const selected = Math.min(app.day, rows.length - 1);
  return rows.map((row, index) => `<button class="day-mark${index === selected ? ' is-selected' : ''}" data-action="income-day" data-index="${index}" data-chart="${scope}" style="--mark-height:${(row[2] / max * height).toFixed(3)}cqw" aria-label="${escapeHTML(`${row[0]}, ${row[1]}: ${money(row[2])}`)}" aria-pressed="${index === selected}"><span class="day-highlight" aria-hidden="true"></span><span class="day-stick" aria-hidden="true"></span><span class="day-value" aria-hidden="true">${escapeHTML(money(row[2]))}</span><span class="day-letter" aria-hidden="true">${scope === 'overview' && app.period === 'week' ? row[0][0] : escapeHTML(row[0])}</span></button>`).join('');
}
function filteredTrades(filters) {
  const query = filters.query.trim().toLowerCase();
  return ledger.filter(trade => (!query || `${trade.id} ${trade.asset} ${ASSETS[trade.asset].name} ${trade.type} ${trade.status} ${trade.total}`.toLowerCase().includes(query)) && (filters.date === 'All' || trade.date === filters.date) && (filters.status === 'All' || trade.status === filters.status) && (!filters.asset || filters.asset === 'All' || trade.asset === filters.asset) && (!filters.type || filters.type === 'All' || trade.type === filters.type)).sort((a, b) => filters.sort === 'Amount' ? b.total - a.total : `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`));
}
function tradesTableHTML(rows, compact = false) {
  return `<table class="data-table"><colgroup>${(compact ? [18, 13, 13, 23, 12, 21] : [20, 12, 17, 21, 12, 18]).map(width => `<col style="width:${width}%">`).join('')}</colgroup><thead><tr><th scope="col">Asset</th><th scope="col">Type</th><th scope="col">Total</th><th scope="col">Status</th><th scope="col">Fee</th><th scope="col">Date</th></tr></thead><tbody>${rows.map(trade => `<tr><td><button class="row-button asset-cell" data-action="trade-detail" data-id="${trade.id}" aria-label="Open ${escapeHTML(trade.asset)} transaction ${trade.id}">${coinHTML(trade.asset)}<span class="coin-name">${trade.asset}</span></button></td><td><span class="trade-type${trade.type === 'Sell' ? ' is-sell' : ''}">${trade.type}${icon(trade.type === 'Sell' ? 'chevrons-down' : 'chevrons-up')}</span></td><td class="number">${escapeHTML(money(trade.total, compact ? 0 : 2))}</td><td>${statusHTML(trade.status)}</td><td class="number">${escapeHTML(money(trade.fee))}</td><td class="number">${dateLabel(trade.date)}</td></tr>`).join('')}</tbody></table>`;
}
function refreshDashboardTable() {
  const rows = filteredTrades(app.dashboard).slice(0, 2);
  $('#dashboard-table').innerHTML = rows.length ? tradesTableHTML(rows, true) : emptyHTML('No matching transactions', '', 'clear-dashboard-filters', 'Clear filters', true);
  $('#dashboard-date').textContent = dateLabel(app.dashboard.date);
  $('[data-action="dashboard-filter"]').classList.toggle('is-filtered', app.dashboard.status !== 'All');
}
function renderWatchlist() {
  const symbols = [...app.watchlist].slice(0, 4);
  if (!symbols.length) { $('#watchlist').innerHTML = emptyHTML('Your watchlist is empty', 'Add an asset to keep it in view.', 'browse-markets', 'Browse assets'); return; }
  if (app.expanded && !symbols.includes(app.expanded)) app.expanded = symbols[0];
  $('#watchlist').innerHTML = symbols.map(symbol => {
    const asset = ASSETS[symbol];
    return `<div class="watch-item${app.expanded === symbol ? ' is-expanded' : ''}" data-symbol="${symbol}"><button class="watch-row" data-action="watch-expand" data-symbol="${symbol}" aria-expanded="${app.expanded === symbol}">${coinHTML(symbol)}<span class="coin-name">${symbol}</span><span class="watch-price">${escapeHTML(assetPrice(symbol))}</span>${deltaHTML(asset.change)}<span class="watch-chevron">${icon('chevron-down')}</span></button><div class="watch-details"><div class="watch-details-inner"><dl class="watch-metrics"><div><dt>Trading volume</dt><dd>${asset.volume}</dd></div><div><dt>Market capitalization</dt><dd>${asset.cap}</dd></div><div><dt>Market dominance</dt><dd>${asset.dominance}</dd></div></dl></div></div></div>`;
  }).join('');
}
function renderOverview() {
  const period = INCOME[app.period];
  $('#income-title').textContent = period.title;
  $('#period-label').textContent = period.label;
  const change = (sum(period.rows) / period.previousTotal - 1) * 100;
  $('#income-delta').textContent = `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
  $('#income-comparison').innerHTML = `${period.current}’s income is<br>${change >= 0 ? 'higher' : 'lower'} than ${period.previous}’s`;
  $('#income-chart').style.gridTemplateColumns = `repeat(${period.rows.length}, minmax(0, 1fr))`;
  $('#income-chart').innerHTML = chartHTML(period.rows);
  $('#income-chart').setAttribute('aria-label', `${period.title}, ${app.preferences.currency}`);
  const daily = ledger.filter(trade => trade.date === '2025-02-14');
  $('#daily-transactions').textContent = daily.length;
  $('#exchange-fees').textContent = money(daily.reduce((total, trade) => total + trade.fee, 0));
  $('#pending-withdrawals').textContent = money(1200, 0);
  $('#total-balance').textContent = money(portfolioTotal());
  $('#mini-sell').innerHTML = `${coinHTML(app.exchange.sell)}${app.exchange.sell}`;
  $('#mini-buy').innerHTML = `${coinHTML(app.exchange.buy)}${app.exchange.buy}`;
  $('#dashboard-query').value = app.dashboard.query;
  renderWatchlist();
  refreshDashboardTable();
  refreshNotificationDot();
}
function renderPortfolio() {
  const holdings = Object.entries(ASSETS).filter(([, asset]) => asset.quantity > 0).sort((a, b) => b[1].price * b[1].quantity - a[1].price * a[1].quantity);
  return `<section class="panel full-panel">${heading('Your portfolio', 'A clear view of what you hold.', button('Withdraw', 'cashout') + button(`Exchange ${icon('arrow-up-right')}`, 'navigate', 'button button-dark button-roomy', 'data-view="exchange"'))}<div class="split-layout"><div class="split-main"><p class="subtle">Total balance</p><div class="hero-balance">${escapeHTML(money(portfolioTotal()))}</div><p class="subtle">${deltaHTML(4.8)} over the last 7 days</p><table class="data-table holdings-table"><colgroup><col style="width:37%"><col style="width:23%"><col style="width:25%"><col style="width:15%"></colgroup><thead><tr><th>Asset</th><th class="align-right">Holdings</th><th class="align-right">Value</th><th class="align-right">Share</th></tr></thead><tbody>${holdings.map(([symbol, asset]) => `<tr><td><button class="row-button asset-identity" data-action="asset-detail" data-symbol="${symbol}">${coinHTML(symbol)}<div><strong>${asset.name}</strong><small>${symbol}</small></div></button></td><td class="align-right number">${quantity(asset.quantity)}</td><td class="align-right number">${escapeHTML(money(asset.quantity * asset.price))}</td><td class="align-right number">${(asset.quantity * asset.price / portfolioTotal() * 100).toFixed(1)}%</td></tr>`).join('')}</tbody></table></div><aside class="split-side side-summary"><h3 class="section-label">Account balance</h3><dl><div><dt>Available USDT</dt><dd class="number">${escapeHTML(money(ASSETS.USDT.quantity))}</dd></div><div><dt>Assets held</dt><dd>${holdings.length} currencies</dd></div><div><dt>Trading account</dt><dd>Not connected</dd></div></dl>${button(`Connect account ${icon('arrow-right')}`, 'navigate', 'button button-outline button-roomy', 'data-view="connections"')}<div class="withdrawal-item">${statusHTML('Pending')}<strong>${escapeHTML(money(1200))}</strong><p class="subtle">Withdrawal · Feb 14, 2025</p>${button('View withdrawal', 'navigate', 'button button-outline', 'data-view="withdrawal"')}</div></aside></div></section>`;
}
function renderHistory() {
  const h = app.history;
  return `<section class="panel full-panel">${heading('Trading history', 'Every trade, all in one place.', button(`${icon('download')} Export CSV`, 'export-history'))}<div class="toolbar"><label class="search-field">${icon('search')}<input id="history-query" type="search" placeholder="Search transactions..." value="${escapeHTML(h.query)}" autocomplete="off" aria-label="Search transactions"></label>${button(`${h.asset === 'All' ? 'All assets' : h.asset}${icon('chevron-down')}`, 'history-filter', 'text-button filter-button', 'data-filter="asset" aria-haspopup="listbox" aria-expanded="false"')}${button(`${h.status === 'All' ? 'All statuses' : h.status}${icon('chevron-down')}`, 'history-filter', 'text-button filter-button', 'data-filter="status" aria-haspopup="listbox" aria-expanded="false"')}${button(`${icon('calendar-event')}${dateLabel(h.date)}${icon('chevron-down')}`, 'date-menu', 'text-button filter-button', 'data-scope="history" aria-haspopup="listbox" aria-expanded="false"')}${button(icon('arrows-sort'), 'history-filter', 'icon-button', 'data-filter="sort" aria-label="Sort transactions" aria-haspopup="listbox" aria-expanded="false"')}</div><div id="history-full-table" class="history-full-table"></div><div class="pagination" id="history-pagination"></div></section>`;
}
function refreshHistoryRows() {
  const rows = filteredTrades(app.history);
  const pages = Math.max(1, Math.ceil(rows.length / 6));
  app.history.page = Math.min(app.history.page, pages);
  const start = (app.history.page - 1) * 6;
  $('#history-full-table').innerHTML = rows.length ? tradesTableHTML(rows.slice(start, start + 6)) : emptyHTML('No matching transactions', 'Try a different asset, date, or search.', 'clear-history-filters', 'Clear filters');
  $('#history-pagination').innerHTML = `<span>${rows.length ? `${start + 1}–${Math.min(start + 6, rows.length)} of ${rows.length} transactions` : '0 transactions'}</span><div class="pagination-actions">${button(icon('chevron-left'), 'history-page', 'icon-button', `data-direction="-1" aria-label="Previous page" ${app.history.page <= 1 ? 'disabled' : ''}`)}<span>Page ${app.history.page} of ${pages}</span>${button(icon('chevron-right'), 'history-page', 'icon-button', `data-direction="1" aria-label="Next page" ${app.history.page >= pages ? 'disabled' : ''}`)}</div>`;
}
function renderMarkets() {
  return `<section class="panel full-panel">${heading('Crypto markets', 'Keep an eye on the assets that matter.', `<div class="segmented">${button('All assets', 'market-scope', '', `data-scope="all" aria-pressed="${!app.market.watchedOnly}"`)}${button('Watchlist', 'market-scope', '', `data-scope="watchlist" aria-pressed="${app.market.watchedOnly}"`)}</div>`)}<div class="split-layout"><div class="split-main"><label class="search-field">${icon('search')}<input id="market-query" type="search" placeholder="Search assets..." value="${escapeHTML(app.market.query)}" aria-label="Search crypto assets" autocomplete="off"></label><div id="market-results"></div></div><aside class="split-side market-detail" id="market-detail"></aside></div></section>`;
}
function refreshMarketRows() {
  const query = app.market.query.trim().toLowerCase();
  const assets = Object.keys(ASSETS).filter(symbol => (!app.market.watchedOnly || app.watchlist.has(symbol)) && `${symbol} ${ASSETS[symbol].name}`.toLowerCase().includes(query));
  if (assets.length && !assets.includes(app.market.selected)) app.market.selected = assets[0];
  $('#market-results').innerHTML = assets.length ? `<table class="data-table market-table"><colgroup><col style="width:47%"><col style="width:27%"><col style="width:18%"><col style="width:8%"></colgroup><thead><tr><th>Asset</th><th class="align-right">Price</th><th class="align-right">24h</th><th><span aria-label="Watchlist"></span></th></tr></thead><tbody>${assets.map(symbol => `<tr class="${app.market.selected === symbol ? 'is-selected' : ''}"><td><button class="row-button asset-identity" data-action="select-asset" data-symbol="${symbol}" aria-label="View ${ASSETS[symbol].name}">${coinHTML(symbol)}<div><strong>${ASSETS[symbol].name}</strong><small>${symbol}</small></div></button></td><td class="align-right number">${escapeHTML(assetPrice(symbol))}</td><td class="align-right">${deltaHTML(ASSETS[symbol].change)}</td><td><button class="star-button" data-action="toggle-watchlist" data-symbol="${symbol}" aria-label="${app.watchlist.has(symbol) ? 'Remove' : 'Add'} ${symbol} ${app.watchlist.has(symbol) ? 'from' : 'to'} watchlist" aria-pressed="${app.watchlist.has(symbol)}">${app.watchlist.has(symbol) ? '<svg aria-hidden="true" viewBox="0 0 24 24"><use href="#star-filled"/></svg>' : icon('star')}</button></td></tr>`).join('')}</tbody></table>` : emptyHTML(app.market.watchedOnly && !query ? 'Your watchlist is empty' : 'No matching assets', 'Browse all assets or change your search.', 'clear-market-filters', 'Show all assets');
  $('#market-detail').innerHTML = assets.length ? marketDetailHTML(app.market.selected) : '';
}
function marketDetailHTML(symbol) {
  const asset = ASSETS[symbol];
  return `<div class="market-title">${coinHTML(symbol)}<div><h3>${asset.name}</h3><p class="subtle">${symbol} / ${app.preferences.currency}</p></div></div><p class="subtle">Last price</p><div class="market-price">${escapeHTML(assetPrice(symbol))}</div>${deltaHTML(asset.change)}<span class="subtle"> in 24 hours</span><dl><div><dt>Trading volume</dt><dd>${asset.volume}</dd></div><div><dt>Market capitalization</dt><dd>${asset.cap}</dd></div><div><dt>Market dominance</dt><dd>${asset.dominance}</dd></div><div><dt>Your holdings</dt><dd>${quantity(asset.quantity)} ${symbol}</dd></div></dl>${button(`Exchange ${symbol} ${icon('arrow-right')}`, 'exchange-asset', 'button button-dark button-full button-roomy', `data-symbol="${symbol}"`)}${button(app.watchlist.has(symbol) ? 'Remove from watchlist' : 'Add to watchlist', 'toggle-watchlist', 'button button-outline button-full button-roomy', `data-symbol="${symbol}"`)}`;
}
function parseAmount(value) {
  return /^(?:\d+(?:\.\d{0,8})?|\.\d{1,8})$/.test(value.trim()) ? Number(value) : NaN;
}
function exchangeEstimate() {
  const { sell, buy, amount } = app.exchange;
  const value = parseAmount(amount);
  return Number.isFinite(value) && value > 0 ? value * ASSETS[sell].price / ASSETS[buy].price * .9985 : 0;
}
function renderExchange() {
  const e = app.exchange;
  return `<section class="panel full-panel">${heading('Exchange crypto', 'Review the rate and fees before you trade.')}<div class="exchange-layout"><form class="exchange-form" id="exchange-form"><div class="exchange-field"><div class="exchange-field-heading"><label for="exchange-amount">You sell</label>${button(`${coinHTML(e.sell)}${e.sell}${icon('chevron-down')}`, 'coin-menu', 'text-button coin-select', `data-side="sell" aria-haspopup="listbox" aria-expanded="false" ${e.busy ? 'disabled' : ''}`)}</div><input id="exchange-amount" type="text" inputmode="decimal" autocomplete="off" maxlength="20" value="${escapeHTML(e.amount)}" aria-describedby="exchange-available exchange-validation" ${e.busy ? 'disabled' : ''}><div class="exchange-available" id="exchange-available"><span>Available: ${quantity(ASSETS[e.sell].quantity)} ${e.sell}</span>${button('Max', 'exchange-max', 'inline-link', e.busy ? 'disabled' : '')}</div></div>${button(icon('arrows-sort'), 'swap-pair', 'icon-button exchange-swap', `aria-label="Swap exchange currencies" ${e.busy ? 'disabled' : ''}`)}<div class="exchange-field"><div class="exchange-field-heading"><span>You get</span>${button(`${coinHTML(e.buy)}${e.buy}${icon('chevron-down')}`, 'coin-menu', 'text-button coin-select', `data-side="buy" aria-haspopup="listbox" aria-expanded="false" ${e.busy ? 'disabled' : ''}`)}</div><output id="exchange-output" for="exchange-amount">${quantity(exchangeEstimate())}</output><p class="subtle">Estimated amount, including the exchange fee</p></div><p class="form-error" id="exchange-validation" role="alert" hidden></p><button type="submit" class="button button-dark button-roomy" id="review-exchange" ${e.busy || !e.amount.trim() ? 'disabled' : ''}>Review exchange${icon('arrow-right')}</button></form><aside class="quote-panel" id="exchange-quote">${exchangeQuoteHTML()}</aside></div></section>`;
}
function exchangeQuoteHTML() {
  const e = app.exchange;
  if (!e.quote) return `${icon('arrows-exchange')}<h3>Your exchange, at a glance.</h3><p>Enter an amount to review your quote.</p><dl><div><dt>Rate</dt><dd>1 ${e.sell} = ${quantity(ASSETS[e.sell].price / ASSETS[e.buy].price)} ${e.buy}</dd></div><div><dt>Exchange fee</dt><dd>0.15%</dd></div><div><dt>Trading account</dt><dd>Not connected</dd></div></dl>${button('Connect account', 'navigate', 'button button-light button-full button-roomy', 'data-view="connections"')}`;
  const q = e.quote;
  return `${icon('receipt')}<h3>Review your exchange</h3><p>Estimated quote · ${q.sell} → ${q.buy}</p><dl><div><dt>You sell</dt><dd>${quantity(q.amount)} ${q.sell}</dd></div><div><dt>You receive</dt><dd>${quantity(q.receive)} ${q.buy}</dd></div><div><dt>Exchange fee</dt><dd>${escapeHTML(money(q.fee))}</dd></div><div><dt>Total value</dt><dd>${escapeHTML(money(q.amount * ASSETS[q.sell].price))}</dd></div></dl>${errorHTML(e.error)}${e.error ? button('Connect account', 'navigate', 'button button-light button-full button-roomy', 'data-view="connections"') : button(e.busy ? 'Connecting…' : 'Confirm exchange', 'confirm-exchange', 'button button-light button-full button-roomy', e.busy ? 'disabled aria-busy="true"' : '')}`;
}
function renderWithdrawal() {
  const w = app.withdrawal;
  return `<section class="panel full-panel">${heading('Withdraw funds', 'Choose an amount and review your payout.')}<div class="exchange-layout"><form class="form-stack" id="withdrawal-form"><div><p class="subtle">Available USDT balance</p><div class="hero-balance">${escapeHTML(money(ASSETS.USDT.quantity))}</div></div><label class="field"><span>Amount in USD</span><input id="withdrawal-amount" type="text" inputmode="decimal" maxlength="20" autocomplete="off" placeholder="0.00" value="${escapeHTML(w.amount)}" ${w.busy ? 'disabled' : ''}></label><div class="field"><span>Payout method</span>${button(`${escapeHTML(w.method)}${icon('chevron-down')}`, 'payout-menu', 'text-button filter-button', `aria-haspopup="listbox" aria-expanded="false" ${w.busy ? 'disabled' : ''}`)}</div>${w.method === 'Crypto wallet' ? `<label class="field"><span>Ethereum wallet address</span><input id="withdrawal-address" type="text" autocomplete="off" maxlength="42" placeholder="0x…" value="${escapeHTML(w.address)}" ${w.busy ? 'disabled' : ''}><small>USDT · Ethereum (ERC20)</small></label>` : '<p class="form-note">Your connected account supplies the bank transfer destination.</p>'}<p class="form-error" id="withdrawal-validation" role="alert" hidden></p><button type="submit" class="button button-dark button-roomy" id="review-withdrawal" ${w.busy || !w.amount.trim() ? 'disabled' : ''}>Review withdrawal${icon('arrow-right')}</button></form><aside class="quote-panel" id="withdrawal-quote">${withdrawalQuoteHTML()}</aside></div></section>`;
}
function withdrawalQuoteHTML() {
  const w = app.withdrawal;
  if (!w.quote) return `${icon('clock-hour-4')}<h3>Pending withdrawal</h3><p>Feb 14, 2025 · Processing</p><dl><div><dt>Amount</dt><dd>${escapeHTML(money(1200))}</dd></div><div><dt>Reference</dt><dd>KNY-WD-1042</dd></div><div><dt>Status</dt><dd>Pending</dd></div></dl><p>A new withdrawal requires a connected trading account.</p>${button('Connect account', 'navigate', 'button button-light button-full button-roomy', 'data-view="connections"')}`;
  return `${icon('receipt')}<h3>Review your withdrawal</h3><p>${escapeHTML(w.quote.method)}</p><dl><div><dt>Amount</dt><dd>${escapeHTML(money(w.quote.amount))}</dd></div><div><dt>Transfer fee</dt><dd>${escapeHTML(money(w.quote.fee))}</dd></div><div><dt>You receive</dt><dd>${escapeHTML(money(w.quote.receive))}</dd></div></dl>${errorHTML(w.error)}${w.error ? button('Connect account', 'navigate', 'button button-light button-full button-roomy', 'data-view="connections"') : button(w.busy ? 'Connecting…' : 'Confirm withdrawal', 'confirm-withdrawal', 'button button-light button-full button-roomy', w.busy ? 'disabled aria-busy="true"' : '')}`;
}
function renderAnalytics() {
  const period = INCOME[app.period];
  const rows = getIncomeRows();
  const title = app.analyticsMetric === 'income' ? 'Income' : 'Exchange fees';
  const total = sum(rows);
  return `<section class="panel full-panel">${heading('A closer look at your money.', 'The numbers behind your activity.', button(`${icon('download')} Download report`, 'export-analytics'))}<div class="toolbar"><div class="segmented">${button('Income', 'analytics-metric', '', `data-metric="income" aria-pressed="${app.analyticsMetric === 'income'}"`)}${button('Exchange fees', 'analytics-metric', '', `data-metric="fees" aria-pressed="${app.analyticsMetric === 'fees'}"`)}</div>${button(`${period.label}${icon('chevron-down')}`, 'period-menu', 'text-button filter-button', 'aria-haspopup="listbox" aria-expanded="false"')}</div><div class="analytics-layout"><div class="analytics-plot"><p class="subtle">${title} · ${period.current.toLowerCase()}</p><div class="hero-balance">${escapeHTML(money(total))}</div><p class="subtle">${app.analyticsMetric === 'income' ? `${deltaHTML((total / period.previousTotal - 1) * 100)} compared with ${period.previous}` : 'Fees charged on recorded trading activity'}</p><div class="income-chart" id="analytics-chart" style="grid-template-columns:repeat(${rows.length},minmax(0,1fr))" aria-label="${title} by period, ${app.preferences.currency}">${chartHTML(rows, 'analytics', 20)}</div></div><aside class="split-side"><h3 class="section-label">${title} breakdown</h3><table class="data-table analytics-table"><colgroup><col style="width:62%"><col style="width:38%"></colgroup><thead><tr><th scope="col">Period</th><th scope="col" class="align-right">Amount</th></tr></thead><tbody>${rows.map(row => `<tr><td>${escapeHTML(row[1])}</td><td class="number align-right">${escapeHTML(money(row[2]))}</td></tr>`).join('')}</tbody></table><div class="analytics-total"><span>Total ${title.toLowerCase()}</span><strong class="number">${escapeHTML(money(total))}</strong></div></aside></div></section>`;
}
function renderReferrals() {
  return `<section class="panel full-panel">${heading('Better, together.', 'Invite a friend to Kony.')}<div class="referral-layout"><div class="referral-card">${icon('gift')}<h3>$10 for them.<br>$10 for you.</h3><p>Your friend receives $10 after their first eligible trade. Your reward follows once the referral is verified.</p><div class="referral-code"><span>Your invite code</span><strong id="invite-code">KNY-ALEX10</strong></div>${button(`${icon('copy')} Copy invite code`, 'copy-invite', 'button button-dark button-full')}${button('Referral terms', 'referral-terms', 'inline-link')}</div><div><h3 class="section-label">Your invitations</h3><div class="referral-list">${[['Jamie Lee', 'JL', 'Feb 12, 2025', 'Reward pending'], ['Sam Rivera', 'SR', 'Feb 9, 2025', 'Joined'], ['Taylor Brooks', 'TB', 'Feb 6, 2025', 'Reward pending']].map(person => `<div class="referral-person"><div class="person-identity"><span class="person-initials">${person[1]}</span><div><strong>${person[0]}</strong><p class="subtle">${person[2]}</p></div></div><span class="status${person[3] === 'Reward pending' ? ' status-pending' : ''}">${person[3]}</span></div>`).join('')}</div><div class="referral-invite"><p class="form-note">Share your code with a friend. They can enter it when creating their account.</p></div></div></div></section>`;
}
function renderTrade() {
  const trade = ledger.find(item => item.id === app.trade.id);
  const asset = ASSETS[trade.asset];
  return `<section class="panel full-panel">${heading('Transaction details', trade.id, button(`${icon('download')} Download receipt`, 'export-receipt'))}<div class="detail-layout"><div><div class="trade-detail-head">${coinHTML(trade.asset)}<div><h3>${trade.type} ${asset.name}</h3><p class="subtle">${dateLabel(trade.date)} · ${trade.time}</p></div></div>${statusHTML(trade.status)}<div class="hero-balance">${escapeHTML(money(trade.total))}</div><dl class="detail-grid"><div><dt>Asset</dt><dd>${asset.name} (${trade.asset})</dd></div><div><dt>Quantity</dt><dd>${quantity(trade.total / asset.price)} ${trade.asset}</dd></div><div><dt>Exchange fee</dt><dd>${escapeHTML(money(trade.fee))}</dd></div><div><dt>Total including fee</dt><dd>${escapeHTML(money(trade.total + trade.fee))}</dd></div><div><dt>Reference</dt><dd>${trade.id}</dd></div></dl></div><aside class="receipt-panel">${icon(trade.status === 'Completed' ? 'circle-check' : trade.status === 'Pending' ? 'clock-hour-4' : 'alert-circle')}<h3>${trade.status === 'Completed' ? 'All the details, in one place.' : trade.status === 'Pending' ? 'Your trade is being processed.' : 'This trade could not be completed.'}</h3><p>${trade.status === 'Completed' ? 'Download a receipt for your records, including the amount, fees, and transaction reference.' : trade.status === 'Pending' ? 'Your provider is processing this transaction. Connect your account to check the latest status.' : 'The trading provider could not complete this order. No funds were exchanged. Connect your account before trying again.'}</p>${errorHTML(app.trade.error)}${trade.status === 'Completed' ? button('Download receipt', 'export-receipt', 'button button-dark button-roomy') : button(app.trade.busy ? 'Checking…' : trade.status === 'Pending' ? 'Check status' : 'Retry transaction', 'retry-trade', 'button button-dark button-roomy', app.trade.busy ? 'disabled aria-busy="true"' : '')}</aside></div></section>`;
}
function renderSecurity() {
  return `<section class="panel full-panel">${heading('Make security a habit.', 'Manage access to your money.')}<div class="security-layout"><div><h3 class="section-label">Account protection</h3><div class="settings-row"><div><h3>Two-factor authentication</h3><p>An extra layer of protection when you sign in.</p></div>${button('Enable', 'enable-2fa', 'button button-outline')}</div><div class="settings-row"><div><h3>Connected accounts</h3><p>Connect your exchange to trade and withdraw.</p></div>${button('Manage', 'navigate', 'button button-outline', 'data-view="connections"')}</div><div class="settings-row"><div><h3>Account details</h3><p>Review your name, email, and preferences.</p></div>${button('View account', 'navigate', 'button button-outline', 'data-view="account"')}</div><div class="device-item">${icon('device-desktop')}<div><strong>Current session</strong><p class="subtle">This browser · Active now</p></div></div></div><aside class="security-banner">${icon('shield-check')}<h3>Your access stays yours.</h3><p>Connect your account through Kony’s secure authorization flow. Never share your provider password or recovery codes.</p>${button('Connected accounts', 'navigate', 'button button-dark button-roomy', 'data-view="connections"')}</aside></div></section>`;
}
function renderConnections() {
  const c = app.connection;
  return `<section class="panel full-panel">${heading('Connected accounts', 'Bring your trading account into Kony.')}<div class="detail-layout"><form class="form-stack" id="connection-form"><div class="field"><span>Trading provider</span>${button(`${c.provider}${icon('chevron-down')}`, 'provider-menu', 'text-button filter-button', `aria-haspopup="listbox" aria-expanded="false" ${c.busy ? 'disabled' : ''}`)}</div><p class="form-note">You authorize access with your provider. Kony never asks for your password or recovery phrase.</p>${errorHTML(c.error)}<button type="submit" class="button button-dark button-roomy" ${c.busy ? 'disabled aria-busy="true"' : ''}>${c.busy ? 'Connecting…' : 'Connect account'}${icon('arrow-right')}</button>${c.error ? button('Connection help', 'connection-help', 'inline-link') : ''}</form><aside class="security-banner">${icon('link')}<h3>No connected accounts</h3><p>A connected account is required to place trades, withdraw funds, and update account security.</p><span class="status">${icon('plug-connected-x')}Not connected</span></aside></div></section>`;
}
function renderAccount() {
  const p = app.profile;
  return `<section class="panel full-panel">${heading('Your account', 'A few details. Everything in order.')}<div class="account-layout"><form class="form-stack" id="profile-form" novalidate><div class="profile-identity"><img src="https://i.pravatar.cc/120?u=kony-account" alt="" width="120" height="120" referrerpolicy="no-referrer"><div><h3>Alex Morgan</h3><p class="subtle">Personal account</p></div></div><label class="field"><span>Full name</span><input id="profile-name" type="text" value="${escapeHTML(p.name)}" maxlength="60" autocomplete="name" ${p.busy ? 'disabled' : ''}></label><label class="field"><span>Email address</span><input id="profile-email" type="email" value="${escapeHTML(p.email)}" maxlength="100" autocomplete="email" ${p.busy ? 'disabled' : ''}></label>${errorHTML(p.error)}<button type="submit" class="button button-dark button-roomy" ${p.busy ? 'disabled aria-busy="true"' : ''}>${p.busy ? 'Updating…' : 'Update profile'}</button></form><aside class="split-side"><h3 class="section-label">Workspace preferences</h3><div class="settings-row"><div><h3>Display currency</h3><p>Use one currency across the workspace.</p></div>${button(`${app.preferences.currency}${icon('chevron-down')}`, 'currency-menu', 'text-button filter-button', 'aria-haspopup="listbox" aria-expanded="false"')}</div><div class="settings-row"><div><h3>Reduce motion</h3><p>Keep transitions still and direct.</p></div><label class="preference-switch"><input id="reduce-motion" type="checkbox" aria-label="Reduce motion" ${app.preferences.reduceMotion ? 'checked' : ''}><span class="switch-track" aria-hidden="true"></span></label></div><div class="settings-row"><div><h3>Trading provider</h3><p>No account is connected.</p></div>${button('Connect', 'navigate', 'button button-outline', 'data-view="connections"')}</div></aside></div></section>`;
}
function renderSupport() {
  const s = app.support;
  return `<section class="panel full-panel">${heading('How can we help?', 'Answers for your next step.')}<div class="support-layout"><div><h3 class="section-label">Good to know</h3>${FAQS.map((faq, index) => `<div class="faq-item${app.faq === index ? ' is-expanded' : ''}" data-faq="${index}"><button class="faq-trigger" data-action="faq-toggle" data-index="${index}" aria-expanded="${app.faq === index}">${faq[0]}${icon('chevron-down')}</button><div class="faq-content"><div><p>${faq[1]}</p></div></div></div>`).join('')}</div><form class="form-stack support-form" id="support-form"><h3 class="section-label">Contact support</h3><label class="field"><span>Subject</span><input id="support-subject" type="text" value="${escapeHTML(s.subject)}" placeholder="What do you need help with?" maxlength="100" ${s.busy ? 'disabled' : ''}></label><label class="field"><span>Message</span><textarea id="support-message" placeholder="Tell us what happened..." maxlength="1200" ${s.busy ? 'disabled' : ''}>${escapeHTML(s.message)}</textarea></label>${errorHTML(s.error)}<button type="submit" class="button button-dark button-roomy" ${s.busy ? 'disabled aria-busy="true"' : ''}>${s.busy ? 'Sending…' : 'Send message'}</button>${s.error ? button(`${icon('download')} Download your request`, 'export-support', 'button button-outline button-roomy') : ''}</form></div></section>`;
}
function renderNotifications() {
  const rows = notices.filter(notice => app.notificationFilter === 'All' || !notice.read);
  return `<section class="panel full-panel">${heading('Your latest updates', 'Activity worth keeping in view.', button('Mark all as read', 'mark-all-read', 'button button-outline button-roomy', notices.every(notice => notice.read) ? 'disabled' : ''))}<div class="segmented">${button('All', 'notification-filter', '', `data-filter="All" aria-pressed="${app.notificationFilter === 'All'}"`)}${button('Unread', 'notification-filter', '', `data-filter="Unread" aria-pressed="${app.notificationFilter === 'Unread'}"`)}</div><div class="notifications-list">${rows.length ? rows.map(notice => `<div class="notification-item${notice.read ? ' is-read' : ''}">${icon(notice.icon)}<div><strong>${notice.title}</strong><p class="subtle">${notice.text}</p><time>${notice.time}</time></div>${button('View', 'open-notice', 'button button-outline', `data-id="${notice.id}"`)}</div>`).join('') : emptyHTML('You’re all caught up.', 'There are no unread updates.', 'all-notifications', 'View all updates')}</div></section>`;
}
function renderSearch() {
  const query = app.search.trim().toLowerCase();
  const assets = Object.keys(ASSETS).filter(symbol => `${symbol} ${ASSETS[symbol].name}`.toLowerCase().includes(query));
  const trades = filteredTrades({ query, date: 'All', status: 'All' });
  return `<section class="panel full-panel">${heading('Search results', `Results for “${app.search}”`)}${!assets.length && !trades.length ? emptyHTML('Nothing matched your search.', 'Try an asset name, currency code, or transaction reference.', 'clear-search', 'Clear search') : `<div class="split-layout"><div><h3 class="section-label">Assets · ${assets.length}</h3>${assets.length ? `<div class="referral-list">${assets.slice(0, 6).map(symbol => `<button class="referral-person row-button" data-action="asset-detail" data-symbol="${symbol}"><span class="asset-identity">${coinHTML(symbol)}<span>${ASSETS[symbol].name} <span class="subtle">${symbol}</span></span></span><span class="number">${escapeHTML(assetPrice(symbol))}</span></button>`).join('')}</div>` : '<p class="subtle">No matching assets</p>'}</div><aside class="split-side"><h3 class="section-label">Transactions · ${trades.length}</h3>${trades.length ? `<div class="referral-list">${trades.slice(0, 4).map(trade => `<button class="referral-person row-button" data-action="trade-detail" data-id="${trade.id}"><span><strong>${trade.type} ${trade.asset}</strong><p class="subtle">${dateLabel(trade.date)}</p></span><span class="number">${escapeHTML(money(trade.total))}</span></button>`).join('')}</div>${button('View matching transactions', 'search-history', 'button button-outline button-roomy')}` : '<p class="subtle">No matching transactions</p>'}</aside></div>`}</section>`;
}
const RENDERERS = { portfolio: renderPortfolio, history: renderHistory, markets: renderMarkets, exchange: renderExchange, withdrawal: renderWithdrawal, analytics: renderAnalytics, referrals: renderReferrals, trade: renderTrade, security: renderSecurity, connections: renderConnections, account: renderAccount, support: renderSupport, notifications: renderNotifications, search: renderSearch };
function renderSecondary() {
  if (app.view === 'overview') return;
  $('#secondary-view').innerHTML = RENDERERS[app.view]();
  if (app.view === 'history') refreshHistoryRows();
  if (app.view === 'markets') refreshMarketRows();
}
function updateRail() {
  const current = PARENTS[app.view] || app.view;
  $$('.rail-button').forEach(item => {
    const active = item.dataset.view === current;
    item.classList.toggle('is-current', active);
    if (active) item.setAttribute('aria-current', 'page'); else item.removeAttribute('aria-current');
  });
  const item = $('.rail-button.is-current');
  if (!item) return;
  const canvasWidth = $('#canvas').getBoundingClientRect().width;
  $('#rail-indicator').style.translate = `0 ${(item.getBoundingClientRect().top - $('.rail-nav').getBoundingClientRect().top) / canvasWidth * 100}cqw`;
}
function navigate(view, back = false) {
  if (!VIEW_TITLES[view]) return;
  closeMenu();
  hideRailTooltip();
  closeDialog(false);
  if (!back && app.view !== view) app.trail.push(app.view);
  app.view = view;
  $('#page-title').textContent = VIEW_TITLES[view];
  $('#back-button').hidden = view === 'overview' || !app.trail.length;
  $('#overview-view').hidden = view !== 'overview';
  $('#secondary-view').hidden = view === 'overview';
  if (view === 'overview') renderOverview(); else renderSecondary();
  updateRail();
}
let menuTrigger = null;
let menuOptions = [];
let menuCallback = null;
function placePopover() {
  if (!menuTrigger?.isConnected) { closeMenu(); return; }
  const canvas = $('#canvas').getBoundingClientRect();
  const trigger = menuTrigger.getBoundingClientRect();
  const menu = $('#popover').getBoundingClientRect();
  const unit = canvas.width / 100;
  const gap = .7 * unit;
  const safe = 1.8 * unit;
  let left = trigger.right - canvas.left - menu.width;
  left = Math.max(safe, Math.min(left, canvas.width - menu.width - safe));
  let top = trigger.bottom - canvas.top + gap;
  if (top + menu.height > canvas.height - safe) top = trigger.top - canvas.top - menu.height - gap;
  top = Math.max(safe, Math.min(top, canvas.height - menu.height - safe));
  $('#popover').style.left = `${left / unit}cqw`;
  $('#popover').style.top = `${top / unit}cqw`;
}
function openMenu(trigger, options, selected, callback, title = '', width = 22) {
  closeMenu();
  menuTrigger = trigger;
  menuOptions = options;
  menuCallback = callback;
  const popover = $('#popover');
  popover.style.setProperty('--popover-width', `${width}cqw`);
  popover.classList.remove('notification-popover');
  popover.setAttribute('role', 'listbox');
  popover.setAttribute('aria-label', title || trigger.getAttribute('aria-label') || 'Choose an option');
  popover.innerHTML = `${title ? `<div class="popover-title">${escapeHTML(title)}</div>` : ''}${options.map((option, index) => `<button class="menu-option" role="option" aria-selected="${option.value === selected}" data-action="menu-select" data-index="${index}" ${option.disabled ? 'disabled' : ''}>${option.symbol ? coinHTML(option.symbol) : ''}<span class="option-label">${escapeHTML(option.label)}${option.description ? `<small>${escapeHTML(option.description)}</small>` : ''}</span>${option.value === selected ? icon('check') : option.meta ? `<span class="option-meta">${escapeHTML(option.meta)}</span>` : ''}</button>`).join('')}`;
  popover.classList.add('is-open');
  popover.setAttribute('aria-hidden', 'false');
  trigger.setAttribute('aria-expanded', 'true');
  placePopover();
  $('.menu-option[aria-selected="true"]:not(:disabled)', popover)?.focus({ preventScroll: true });
}
function closeMenu(restoreFocus = false) {
  const trigger = menuTrigger;
  $('#popover').classList.remove('is-open');
  $('#popover').setAttribute('aria-hidden', 'true');
  if (trigger?.isConnected) trigger.setAttribute('aria-expanded', 'false');
  menuTrigger = null;
  menuOptions = [];
  menuCallback = null;
  if (restoreFocus && trigger?.isConnected) trigger.focus({ preventScroll: true });
}
function showNotificationsMenu(trigger) {
  closeMenu();
  menuTrigger = trigger;
  const popover = $('#popover');
  popover.style.setProperty('--popover-width', '32cqw');
  popover.classList.add('notification-popover', 'is-open');
  popover.setAttribute('role', 'menu');
  popover.setAttribute('aria-hidden', 'false');
  popover.innerHTML = '<div class="popover-title">Notifications</div>' + notices.filter(notice => !notice.read).map(notice => `<button class="notification-menu-row" role="menuitem" data-action="open-notice" data-id="${notice.id}"><strong>${notice.title}</strong><span>${notice.time}</span></button>`).join('') + (notices.every(notice => notice.read) ? '<div class="notification-menu-row">You’re all caught up.</div>' : '') + `<div class="popover-footer">${button('Mark all read', 'mark-all-read', 'inline-link', notices.every(notice => notice.read) ? 'disabled' : '')}${button('View all', 'navigate', 'inline-link', 'data-view="notifications"')}</div>`;
  trigger.setAttribute('aria-expanded', 'true');
  placePopover();
}
function refreshNotificationDot() { $('#notification-dot').hidden = notices.every(notice => notice.read); }
let toastTimer;
function toast(message) {
  clearTimeout(toastTimer);
  $('#toast').textContent = message;
  $('#toast').classList.add('is-visible');
  toastTimer = setTimeout(() => $('#toast').classList.remove('is-visible'), 3000);
}
let dialogTrigger;
function openDialog(title, content, trigger) {
  closeMenu();
  dialogTrigger = trigger;
  $('#dialog-title').textContent = title;
  $('#dialog-body').innerHTML = content;
  $('#dialog-layer').hidden = false;
  $('.shell').inert = true;
  $('[data-action="close-dialog"]', $('#dialog')).focus({ preventScroll: true });
}
function closeDialog(restore = true) {
  if ($('#dialog-layer').hidden) return;
  $('#dialog-layer').hidden = true;
  $('.shell').inert = false;
  if (restore && dialogTrigger?.isConnected) dialogTrigger.focus({ preventScroll: true });
  dialogTrigger = null;
}
function showRailTooltip(trigger) {
  const canvas = $('#canvas').getBoundingClientRect();
  const rect = trigger.getBoundingClientRect();
  const unit = canvas.width / 100;
  $('#rail-tooltip').textContent = trigger.dataset.tooltip;
  $('#rail-tooltip').style.left = `${(rect.right - canvas.left) / unit + 1}cqw`;
  $('#rail-tooltip').style.top = `${Math.min((rect.top - canvas.top) / unit, canvas.height / unit - 5)}cqw`;
  $('#rail-tooltip').classList.add('is-visible');
  $('#rail-tooltip').setAttribute('aria-hidden', 'false');
}
function hideRailTooltip() {
  $('#rail-tooltip').classList.remove('is-visible');
  $('#rail-tooltip').setAttribute('aria-hidden', 'true');
}
function setChartFocus(mark, active) {
  const chart = mark.closest('.income-chart');
  if (active) $$('.day-mark', chart).forEach(item => item.classList.toggle('is-hovered', item === mark));
  else $$('.day-mark', chart).forEach(item => item.classList.remove('is-hovered'));
  chart.classList.toggle('has-hover', active);
}
function savePreferences() {
  $('#canvas').dataset.motion = app.preferences.reduceMotion ? 'reduce' : 'normal';
  try { localStorage.setItem('kony-preferences', JSON.stringify(app.preferences)); } catch { toast('Your browser could not retain these preferences.'); }
}
function downloadFile(filename, contents, type = 'text/plain;charset=utf-8') {
  const url = URL.createObjectURL(new Blob([contents], { type }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function csvCell(value) {
  let text = String(value);
  if (typeof value === 'string' && /^[=+@-]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}
function exportCSV(filename, rows) { downloadFile(filename, '﻿' + rows.map(row => row.map(csvCell).join(',')).join('\r\n'), 'text/csv;charset=utf-8'); }
async function copyInvite() {
  try { await navigator.clipboard.writeText('KNY-ALEX10'); toast('Invite code copied.'); }
  catch {
    const code = $('#invite-code');
    if (code) { const range = document.createRange(); range.selectNodeContents(code); const selection = window.getSelection(); selection.removeAllRanges(); selection.addRange(range); }
    toast('Select the invite code and copy it from your browser.');
  }
}
function exportHistory() {
  const rows = filteredTrades(app.history);
  exportCSV('kony-trading-history.csv', [['Reference', 'Asset', 'Type', `Total (${app.preferences.currency})`, `Fee (${app.preferences.currency})`, 'Status', 'Date', 'Time'], ...rows.map(trade => [trade.id, trade.asset, trade.type, (trade.total * RATES[app.preferences.currency]).toFixed(2), (trade.fee * RATES[app.preferences.currency]).toFixed(2), trade.status, trade.date, trade.time])]);
  toast(`${rows.length} transactions exported.`);
}
function exportReceipt() {
  const trade = ledger.find(item => item.id === app.trade.id);
  downloadFile(`${trade.id.toLowerCase()}-receipt.txt`, `Kony · Transaction receipt\n\nReference: ${trade.id}\nAsset: ${ASSETS[trade.asset].name} (${trade.asset})\nType: ${trade.type}\nStatus: ${trade.status}\nDate: ${dateLabel(trade.date)} ${trade.time}\nAmount: ${money(trade.total)}\nFee: ${money(trade.fee)}\nTotal including fee: ${money(trade.total + trade.fee)}\n`);
  toast('Transaction receipt downloaded.');
}
async function requireService(key, view, message) {
  const scope = app[key];
  if (scope.busy) return;
  scope.busy = true;
  scope.error = '';
  if (app.view === view) renderSecondary();
  await new Promise(resolve => setTimeout(resolve, 420));
  scope.busy = false;
  scope.error = message;
  if (app.view === view) renderSecondary();
}
function updateExchangeInput() {
  app.exchange.quote = null;
  app.exchange.error = '';
  $('#exchange-output').textContent = quantity(exchangeEstimate());
  $('#review-exchange').disabled = !app.exchange.amount.trim();
  $('#exchange-validation').hidden = true;
  $('#exchange-quote').innerHTML = exchangeQuoteHTML();
}
function chooseCoin(side, symbol) {
  app.exchange[side] = symbol;
  app.exchange.quote = null;
  app.exchange.error = '';
  if (app.view === 'exchange') renderSecondary(); else renderOverview();
}
function coinMenu(trigger) {
  const side = trigger.dataset.side;
  const other = side === 'sell' ? 'buy' : 'sell';
  openMenu(trigger, Object.entries(ASSETS).map(([symbol, asset]) => ({ value: symbol, label: symbol, description: asset.name, symbol, disabled: symbol === app.exchange[other] || (side === 'sell' && asset.quantity === 0), meta: side === 'sell' ? quantity(asset.quantity) : '' })), app.exchange[side], value => chooseCoin(side, value), side === 'sell' ? 'You sell' : 'You receive', 25);
}
function swapPair() {
  if (app.exchange.busy) return;
  if (!ASSETS[app.exchange.buy].quantity) { toast(`No ${app.exchange.buy} balance is available to sell.`); return; }
  const oldSell = app.exchange.sell;
  app.exchange.sell = app.exchange.buy;
  app.exchange.buy = oldSell;
  app.exchange.amount = '';
  app.exchange.quote = null;
  app.exchange.error = '';
  if (app.view === 'exchange') renderSecondary(); else renderOverview();
}
function handleClick(event) {
  const target = event.target.closest('[data-action]');
  if (!target || target.disabled) return;
  const action = target.dataset.action;
  if (action === 'navigate') { navigate(target.dataset.view); return; }
  if (action === 'back') { navigate(app.trail.pop() || 'overview', true); return; }
  if (action === 'menu-select') {
    const option = menuOptions[Number(target.dataset.index)];
    const callback = menuCallback;
    if (!option || option.disabled) return;
    closeMenu();
    callback(option.value);
    return;
  }
  if (action === 'period-menu') {
    openMenu(target, ['week', 'month', 'year'].map(value => ({ value, label: INCOME[value].label })), app.period, value => { app.period = value; app.day = Math.min(app.day, INCOME[value].rows.length - 1); if (app.view === 'analytics') renderSecondary(); else renderOverview(); }, 'Time period', 18);
  } else if (action === 'income-day') {
    app.day = Number(target.dataset.index);
    $$('.income-chart .day-mark').forEach(item => { const selected = Number(item.dataset.index) === app.day; item.classList.toggle('is-selected', selected); item.setAttribute('aria-pressed', String(selected)); });
  } else if (action === 'watch-expand') {
    app.expanded = app.expanded === target.dataset.symbol ? '' : target.dataset.symbol;
    $$('.watch-item').forEach(item => { const active = item.dataset.symbol === app.expanded; item.classList.toggle('is-expanded', active); $('.watch-row', item).setAttribute('aria-expanded', String(active)); });
  } else if (action === 'cashout') navigate('withdrawal');
  else if (action === 'fees') { app.analyticsMetric = 'fees'; navigate('analytics'); }
  else if (action === 'date-menu') {
    const scope = target.dataset.scope;
    openMenu(target, [{ value: 'All', label: 'All dates' }, ...['2025-02-14', '2025-02-13', '2025-02-12'].map(value => ({ value, label: dateLabel(value) })), { value: '2025-02-15', label: 'Feb 15, 2025', description: 'No trading activity', disabled: true }], app[scope].date, value => { app[scope].date = value; if (scope === 'history') { app.history.page = 1; renderSecondary(); } else refreshDashboardTable(); }, 'Trading date', 23);
  } else if (action === 'dashboard-filter') openMenu(target, ['All', 'Completed', 'Pending', 'Failed'].map(value => ({ value, label: value === 'All' ? 'All statuses' : value })), app.dashboard.status, value => { app.dashboard.status = value; refreshDashboardTable(); }, 'Transaction status', 21);
  else if (action === 'clear-dashboard-filters') { app.dashboard = { query: '', status: 'All', date: '2025-02-14' }; $('#dashboard-query').value = ''; refreshDashboardTable(); }
  else if (action === 'history-filter') {
    const key = target.dataset.filter;
    const values = key === 'asset' ? ['All', ...Object.keys(ASSETS)] : key === 'status' ? ['All', 'Completed', 'Pending', 'Failed'] : ['Recent', 'Amount'];
    openMenu(target, values.map(value => ({ value, label: value === 'All' ? key === 'asset' ? 'All assets' : 'All statuses' : value === 'Recent' ? 'Most recent first' : value === 'Amount' ? 'Largest amount first' : value, symbol: key === 'asset' && value !== 'All' ? value : '' })), app.history[key], value => { app.history[key] = value; app.history.page = 1; renderSecondary(); }, key === 'sort' ? 'Sort transactions' : key === 'asset' ? 'Filter by asset' : 'Filter by status', key === 'asset' ? 21 : 25);
  } else if (action === 'history-page') { app.history.page += Number(target.dataset.direction); refreshHistoryRows(); }
  else if (action === 'clear-history-filters') { app.history = { query: '', date: 'All', status: 'All', asset: 'All', type: 'All', sort: 'Recent', page: 1 }; renderSecondary(); }
  else if (action === 'trade-detail') { app.trade.id = target.dataset.id; app.trade.error = ''; navigate('trade'); }
  else if (action === 'asset-detail') { app.market.selected = target.dataset.symbol; app.market.query = ''; app.market.watchedOnly = false; navigate('markets'); }
  else if (action === 'select-asset') { app.market.selected = target.dataset.symbol; refreshMarketRows(); }
  else if (action === 'toggle-watchlist') { const symbol = target.dataset.symbol; if (app.watchlist.has(symbol)) app.watchlist.delete(symbol); else app.watchlist.add(symbol); refreshMarketRows(); }
  else if (action === 'market-scope') { app.market.watchedOnly = target.dataset.scope === 'watchlist'; renderSecondary(); }
  else if (action === 'clear-market-filters' || action === 'browse-markets') { app.market.query = ''; app.market.watchedOnly = false; if (app.view === 'markets') renderSecondary(); else navigate('markets'); }
  else if (action === 'coin-menu') coinMenu(target);
  else if (action === 'swap-pair') swapPair();
  else if (action === 'exchange-max') { app.exchange.amount = String(ASSETS[app.exchange.sell].quantity); $('#exchange-amount').value = app.exchange.amount; updateExchangeInput(); }
  else if (action === 'exchange-asset') { const symbol = target.dataset.symbol; if (ASSETS[symbol].quantity > 0) { app.exchange.sell = symbol; app.exchange.buy = symbol === 'USDT' ? 'BTC' : 'USDT'; } else { app.exchange.sell = 'USDT'; app.exchange.buy = symbol; } app.exchange.amount = ''; app.exchange.quote = null; app.exchange.error = ''; navigate('exchange'); }
  else if (action === 'confirm-exchange') requireService('exchange', 'exchange', 'Connect your trading account to place this exchange. Your funds have not moved.');
  else if (action === 'payout-menu') openMenu(target, ['Bank transfer', 'Crypto wallet'].map(value => ({ value, label: value })), app.withdrawal.method, value => { app.withdrawal.method = value; app.withdrawal.quote = null; app.withdrawal.error = ''; renderSecondary(); }, 'Payout method', 23);
  else if (action === 'confirm-withdrawal') requireService('withdrawal', 'withdrawal', 'Connect your trading account to request this withdrawal. No funds have been transferred.');
  else if (action === 'analytics-metric') { app.analyticsMetric = target.dataset.metric; renderSecondary(); }
  else if (action === 'copy-invite') copyInvite();
  else if (action === 'referral-terms') openDialog('Referral terms', '<p>Both accounts must be verified. Your friend must complete an eligible first trade before either reward is issued.</p><p class="subtle">Rewards are subject to your region’s eligibility requirements and your provider’s account review.</p>' + button('Got it', 'close-dialog', 'button button-dark button-roomy'), target);
  else if (action === 'close-dialog') closeDialog();
  else if (action === 'enable-2fa') openDialog('Protect your account', '<p>Connect your account before enabling two-factor authentication. Setup continues in Kony’s secure authorization flow.</p>' + button('Connected accounts', 'navigate', 'button button-dark button-roomy', 'data-view="connections"'), target);
  else if (action === 'provider-menu') openMenu(target, ['Coinbase', 'Kraken', 'Binance'].map(value => ({ value, label: value })), app.connection.provider, value => { app.connection.provider = value; app.connection.error = ''; renderSecondary(); }, 'Trading provider', 22);
  else if (action === 'connection-help') { app.faq = 2; navigate('support'); }
  else if (action === 'currency-menu') openMenu(target, [{ value: 'USD', label: 'US dollar', meta: 'USD' }, { value: 'EUR', label: 'Euro', meta: 'EUR' }, { value: 'GBP', label: 'British pound', meta: 'GBP' }], app.preferences.currency, value => { app.preferences.currency = value; savePreferences(); renderSecondary(); }, 'Display currency', 24);
  else if (action === 'faq-toggle') { app.faq = app.faq === Number(target.dataset.index) ? -1 : Number(target.dataset.index); $$('.faq-item').forEach(item => { const active = Number(item.dataset.faq) === app.faq; item.classList.toggle('is-expanded', active); $('.faq-trigger', item).setAttribute('aria-expanded', String(active)); }); }
  else if (action === 'notifications-menu') { if (menuTrigger === target) closeMenu(true); else showNotificationsMenu(target); }
  else if (action === 'mark-all-read') { notices.forEach(notice => { notice.read = true; }); refreshNotificationDot(); if (app.view === 'notifications') renderSecondary(); else if (menuTrigger) showNotificationsMenu(menuTrigger); }
  else if (action === 'open-notice') { const notice = notices.find(item => item.id === target.dataset.id); notice.read = true; if (notice.tradeId) app.trade.id = notice.tradeId; refreshNotificationDot(); navigate(notice.view); }
  else if (action === 'notification-filter') { app.notificationFilter = target.dataset.filter; renderSecondary(); }
  else if (action === 'all-notifications') { app.notificationFilter = 'All'; renderSecondary(); }
  else if (action === 'clear-search') { app.search = ''; $('#global-query').value = ''; navigate('overview'); $('#global-query').focus({ preventScroll: true }); }
  else if (action === 'search-history') { app.history.query = app.search; app.history.date = 'All'; app.history.asset = 'All'; app.history.status = 'All'; app.history.page = 1; navigate('history'); }
  else if (action === 'export-history') exportHistory();
  else if (action === 'export-watchlist') { exportCSV('kony-watchlist.csv', [['Asset', 'Name', `Price (${app.preferences.currency})`, '24h change', 'Trading volume', 'Market capitalization'], ...[...app.watchlist].map(symbol => [symbol, ASSETS[symbol].name, (ASSETS[symbol].price * RATES[app.preferences.currency]).toFixed(2), ASSETS[symbol].change, ASSETS[symbol].volume, ASSETS[symbol].cap])]); toast('Watchlist exported.'); }
  else if (action === 'export-analytics') { exportCSV(`kony-${app.analyticsMetric}-${app.period}.csv`, [['Period', `Amount (${app.preferences.currency})`], ...getIncomeRows().map(row => [row[1], (row[2] * RATES[app.preferences.currency]).toFixed(2)])]); toast('Report downloaded.'); }
  else if (action === 'export-receipt') exportReceipt();
  else if (action === 'retry-trade') requireService('trade', 'trade', 'Connect your trading account to retrieve this transaction’s latest status.');
  else if (action === 'export-support') { downloadFile('kony-support-request.txt', `Kony · Support request\n\nSubject: ${app.support.subject}\n\n${app.support.message}\n`); toast('Support request downloaded.'); }
}
function validationError(id, message) { const field = $(id); field.textContent = message; field.hidden = false; }
function handleSubmit(event) {
  const form = event.target;
  event.preventDefault();
  if (form.id === 'global-search') {
    app.search = $('#global-query').value.trim();
    if (!app.search) { $('#global-query').focus(); return; }
    navigate('search');
  } else if (form.id === 'exchange-form') {
    if (app.exchange.busy) return;
    const amount = parseAmount(app.exchange.amount);
    if (!Number.isFinite(amount) || amount <= 0) { validationError('#exchange-validation', 'Enter an amount greater than zero, with up to 8 decimal places.'); return; }
    if (amount > ASSETS[app.exchange.sell].quantity) { validationError('#exchange-validation', `You have ${quantity(ASSETS[app.exchange.sell].quantity)} ${app.exchange.sell} available.`); return; }
    app.exchange.quote = { sell: app.exchange.sell, buy: app.exchange.buy, amount, receive: exchangeEstimate(), fee: amount * ASSETS[app.exchange.sell].price * .0015 };
    app.exchange.error = '';
    $('#exchange-validation').hidden = true;
    $('#exchange-quote').innerHTML = exchangeQuoteHTML();
  } else if (form.id === 'withdrawal-form') {
    if (app.withdrawal.busy) return;
    const amount = parseAmount(app.withdrawal.amount);
    if (!Number.isFinite(amount) || amount < 10) { validationError('#withdrawal-validation', 'Enter a withdrawal amount of at least $10.'); return; }
    if (amount > ASSETS.USDT.quantity) { validationError('#withdrawal-validation', `Your available balance is $${ASSETS.USDT.quantity.toFixed(2)}.`); return; }
    if (app.withdrawal.method === 'Crypto wallet' && !/^0x[0-9a-fA-F]{40}$/.test(app.withdrawal.address)) { validationError('#withdrawal-validation', 'Enter a valid Ethereum wallet address.'); return; }
    app.withdrawal.quote = { amount, fee: 2.5, receive: amount - 2.5, method: app.withdrawal.method, address: app.withdrawal.address };
    app.withdrawal.error = '';
    $('#withdrawal-validation').hidden = true;
    $('#withdrawal-quote').innerHTML = withdrawalQuoteHTML();
  } else if (form.id === 'connection-form') requireService('connection', 'connections', 'The account connection service is unavailable. Your provider has not been connected.');
  else if (form.id === 'profile-form') {
    if (!app.profile.name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(app.profile.email)) { app.profile.error = 'Enter your full name and a valid email address.'; renderSecondary(); return; }
    requireService('profile', 'account', 'Connect your account to update personal details. Your entered changes have been kept here.');
  } else if (form.id === 'support-form') {
    if (!app.support.subject.trim() || !app.support.message.trim()) { app.support.error = 'Add a subject and a message before sending.'; renderSecondary(); return; }
    requireService('support', 'support', 'Support is unavailable right now. Your message is still here; download a copy or try again later.');
  }
}
function handleInput(event) {
  const input = event.target;
  if (input.id === 'dashboard-query') { app.dashboard.query = input.value; refreshDashboardTable(); }
  else if (input.id === 'history-query') { app.history.query = input.value; app.history.page = 1; refreshHistoryRows(); }
  else if (input.id === 'market-query') { app.market.query = input.value; refreshMarketRows(); }
  else if (input.id === 'exchange-amount') { app.exchange.amount = input.value; updateExchangeInput(); }
  else if (input.id === 'withdrawal-amount') { app.withdrawal.amount = input.value; app.withdrawal.quote = null; app.withdrawal.error = ''; $('#review-withdrawal').disabled = !input.value.trim(); $('#withdrawal-validation').hidden = true; $('#withdrawal-quote').innerHTML = withdrawalQuoteHTML(); }
  else if (input.id === 'withdrawal-address') { app.withdrawal.address = input.value; app.withdrawal.quote = null; app.withdrawal.error = ''; $('#withdrawal-validation').hidden = true; $('#withdrawal-quote').innerHTML = withdrawalQuoteHTML(); }
  else if (input.id === 'profile-name') app.profile.name = input.value;
  else if (input.id === 'profile-email') app.profile.email = input.value;
  else if (input.id === 'support-subject') app.support.subject = input.value;
  else if (input.id === 'support-message') app.support.message = input.value;
}
function handleKeydown(event) {
  if (event.key === 'Escape') { if (!$('#dialog-layer').hidden) closeDialog(); else { closeMenu(true); hideRailTooltip(); } return; }
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); $('#global-query').focus({ preventScroll: true }); return; }
  if (!$('#dialog-layer').hidden && event.key === 'Tab') {
    const controls = $$('button:not(:disabled), input:not(:disabled), [tabindex="0"]', $('#dialog'));
    const first = controls[0]; const last = controls.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    return;
  }
  if ($('#popover').classList.contains('is-open') && ['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
    const items = $$('button:not(:disabled)', $('#popover'));
    if (!items.length) return;
    event.preventDefault();
    const index = items.indexOf(document.activeElement);
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1 : (index + (event.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
    items[next].focus({ preventScroll: true });
  }
}
let started = false;
function start() {
  if (started) return;
  started = true;
  try {
    const preferences = JSON.parse(localStorage.getItem('kony-preferences') || '{}');
    if (Object.hasOwn(RATES, preferences.currency)) app.preferences.currency = preferences.currency;
    if (typeof preferences.reduceMotion === 'boolean') app.preferences.reduceMotion = preferences.reduceMotion;
  } catch {}
  $('#canvas').dataset.motion = app.preferences.reduceMotion ? 'reduce' : 'normal';
  $('#canvas').addEventListener('click', handleClick);
  $('#canvas').addEventListener('submit', handleSubmit);
  $('#canvas').addEventListener('input', handleInput);
  $('#canvas').addEventListener('change', event => { if (event.target.id === 'reduce-motion') { app.preferences.reduceMotion = event.target.checked; savePreferences(); } });
  document.addEventListener('pointerdown', event => { if (menuTrigger && !$('#popover').contains(event.target) && !menuTrigger.contains(event.target)) closeMenu(); });
  document.addEventListener('keydown', handleKeydown);
  $('#canvas').addEventListener('pointerover', event => {
    const tooltip = event.target.closest('[data-tooltip]');
    if (tooltip) showRailTooltip(tooltip);
    const mark = event.target.closest('.day-mark');
    if (mark) setChartFocus(mark, true);
  });
  $('#canvas').addEventListener('pointerout', event => {
    if (event.target.closest('[data-tooltip]') && !event.target.closest('[data-tooltip]').contains(event.relatedTarget)) hideRailTooltip();
    const mark = event.target.closest('.day-mark');
    if (mark && !mark.contains(event.relatedTarget)) setChartFocus(mark, false);
  });
  $('#canvas').addEventListener('focusin', event => { const mark = event.target.closest('.day-mark'); if (mark) setChartFocus(mark, true); const trigger = event.target.closest('[data-tooltip]'); if (trigger) showRailTooltip(trigger); });
  $('#canvas').addEventListener('focusout', event => { const mark = event.target.closest('.day-mark'); if (mark) setChartFocus(mark, false); if (event.target.closest('[data-tooltip]')) hideRailTooltip(); });
  new ResizeObserver(() => { updateRail(); if (menuTrigger) placePopover(); hideRailTooltip(); }).observe($('#canvas'));
  $('.account-avatar img').addEventListener('error', event => { event.target.hidden = true; });
  renderOverview();
  updateRail();
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches && !app.preferences.reduceMotion) { $('#canvas').classList.add('is-entering'); setTimeout(() => $('#canvas').classList.remove('is-entering'), 650); }
  document.fonts.ready.then(updateRail);
  const view = new URLSearchParams(location.search).get('view');
  if (view && Object.hasOwn(VIEW_TITLES, view)) navigate(view);
}
start();
