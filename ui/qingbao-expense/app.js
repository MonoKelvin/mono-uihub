'use strict';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
const money = cents => (cents / 100).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const amountHTML = cents => `<span class="currency">¥</span>${money(cents)}`;
const icon = name => `<i class="ti ti-${name}" aria-hidden="true"></i>`;
const today = () => { const date = new Date(); return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`; };
const dateLabel = date => `${Number(date.slice(5, 7))}月${Number(date.slice(8, 10))}日`;
const company = { name: '木禾创意设计（杭州）有限公司', tax: '91330106MA2B7X6K8R', department: '品牌设计部', costCenter: '品牌与创意 · CC-031' };
const categories = {
  travel: { label: '差旅交通', icon: 'plane', tone: 'blue' },
  software: { label: '软件订阅', icon: 'device-laptop', tone: 'green' },
  office: { label: '办公采购', icon: 'briefcase', tone: 'amber' },
  team: { label: '团队活动', icon: 'users', tone: 'rose' },
  client: { label: '客户招待', icon: 'coffee', tone: 'amber' }
};
const statuses = {
  draft: { label: '草稿', icon: 'pencil', tone: 'gray' },
  review: { label: '审批中', icon: 'clock', tone: 'blue' },
  returned: { label: '待补充', icon: 'alert-circle', tone: 'amber' },
  paid: { label: '已报销', icon: 'circle-check', tone: 'green' }
};
const invoices = [
  { id: 'i1', title: '上海往返机票', supplier: '中国东方航空股份有限公司', amount: 156000, date: '2026-11-01', number: '26312000000123864001' },
  { id: 'i2', title: '品牌工作坊住宿 · 2 晚', supplier: '上海栖间酒店有限公司', amount: 92000, date: '2026-11-02', number: '26312000000123864002' },
  { id: 'i3', title: '机场往返交通', supplier: '滴滴出行科技有限公司', amount: 20000, date: '2026-11-02', number: '26110000000123681003' },
  { id: 'i4', title: '设计软件月度订阅', supplier: '上海创意软件有限公司', amount: 32800, date: '2026-11-02', number: '26310000000123864004' },
  { id: 'i5', title: '创意设计展入场与物料', supplier: '杭州创意会展服务有限公司', amount: 129000, date: '2026-11-01', number: '26330000000123764005' },
  { id: 'i6', title: '客户沟通咖啡', supplier: '杭州拾光咖啡有限公司', amount: 18600, date: '2026-11-03', number: '26330000000123864006' },
  { id: 'i7', title: '品牌组团队午餐', supplier: '杭州山间食集有限公司', amount: 42000, date: '2026-11-03', number: '26330000000123864007' },
  { id: 'i8', title: '杭州客户拜访交通与住宿', supplier: '杭州商旅服务有限公司', amount: 112600, date: '2026-11-01', number: '26330000000123864008' },
  { id: 'i9', title: '秋季品牌摄影物料', supplier: '杭州光屿摄影器材有限公司', amount: 246000, date: '2026-11-01', number: '26330000000123864009' },
  { id: 'i10', title: '设计参考书采购', supplier: '杭州晓风图书有限公司', amount: 68000, date: '2026-11-01', number: '26330000000123864010' },
  { id: 'i11', title: '品牌手册打样', supplier: '杭州青禾印刷有限公司', amount: 9600, date: '2026-11-03', number: '26330000000123864011' },
  { id: 'i12', title: '杭州—南京高铁', supplier: '中国铁路上海局集团有限公司', amount: 55300, date: '2026-11-03', number: '26320000000123864012' },
  { id: 'i13', title: '工作室至客户公司交通', supplier: '滴滴出行科技有限公司', amount: 4800, date: '2026-11-03', number: '26110000000123864013' }
];
const claims = [
  { id: 'c1', title: '上海品牌工作坊差旅', amount: 268000, category: 'travel', status: 'review', date: '2026-11-02', expenseDate: '2026-11-01', description: '参加春山品牌工作坊，往返机票、两晚住宿及机场交通。', invoiceIds: ['i1', 'i2', 'i3'] },
  { id: 'c2', title: '十一月设计软件订阅', amount: 32800, category: 'software', status: 'review', date: '2026-11-02', expenseDate: '2026-11-02', description: '品牌设计组日常协作所需的设计软件订阅。', invoiceIds: ['i4'] },
  { id: 'c3', title: '创意设计展参展费用', amount: 129000, category: 'office', status: 'returned', date: '2026-11-01', expenseDate: '2026-11-01', description: '展会入场及布展物料。', invoiceIds: ['i5'], reason: '请补充参与的项目名称和费用用途，方便财务归集到对应项目。' },
  { id: 'c4', title: '客户沟通咖啡', amount: 18600, category: 'client', status: 'draft', date: '2026-11-03', expenseDate: '2026-11-03', description: '与春山品牌团队沟通包装设计方案。', invoiceIds: ['i6'] },
  { id: 'c5', title: '品牌组团队午餐', amount: 42000, category: 'team', status: 'draft', date: '2026-11-03', expenseDate: '2026-11-03', description: '项目复盘后，品牌设计组三人工作午餐。', invoiceIds: ['i7'] },
  { id: 'c6', title: '杭州客户拜访', amount: 112600, category: 'travel', status: 'paid', date: '2026-11-02', expenseDate: '2026-11-01', description: '春山项目阶段汇报，客户拜访交通及住宿。', invoiceIds: ['i8'] },
  { id: 'c7', title: '秋季品牌摄影物料', amount: 246000, category: 'office', status: 'paid', date: '2026-11-01', expenseDate: '2026-11-01', description: '春山秋季新品摄影布景与拍摄耗材采购。', invoiceIds: ['i9'] },
  { id: 'c8', title: '设计参考书采购', amount: 68000, category: 'office', status: 'paid', date: '2026-11-01', expenseDate: '2026-11-01', description: '品牌设计部公共资料库书籍采购。', invoiceIds: ['i10'] }
];
const approvals = [
  { id: 'a1', name: '陈知夏', avatar: '夏', title: '客户沟通交通', amount: 63600, category: 'travel', date: '2026-11-03', description: '春山品牌包装项目，两次往返客户公司的交通费用。', status: 'pending' },
  { id: 'a2', name: '周以宁', avatar: '宁', title: '产品发布物料采购', amount: 208000, category: 'office', date: '2026-11-02', description: '春山秋季新品发布会，展示物料及包装打样费用。', status: 'pending' }
];
const state = { view: 'home', month: '2026-11', claimTab: 'all', claimQuery: '', invoiceTab: 'available', invoiceQuery: '', category: 'all', approvalTab: 'pending', invoiceSelection: new Set(), editingId: null, invoiceFile: null, modal: null, returnFocus: null, toastTimer: null, nextClaim: 9, nextInvoice: 14 };
const main = $('#main-content');
const modalLayer = $('#modal-layer');
const dialog = $('#dialog');

function statusHTML(status) {
  const item = statuses[status];
  return `<span class="status ${item.tone}">${icon(item.icon)}${item.label}</span>`;
}
function invoiceClaim(id) { return claims.find(claim => claim.invoiceIds.includes(id)); }
function availableInvoices(editingId = null) { return invoices.filter(invoice => !invoiceClaim(invoice.id) || invoiceClaim(invoice.id).id === editingId); }
function monthClaims() { return claims.filter(claim => claim.date.startsWith(state.month)); }
function inTab(claim) { return state.claimTab === 'all' || (state.claimTab === 'pending' ? ['draft', 'returned'].includes(claim.status) : claim.status === state.claimTab); }
function filteredClaims() {
  const query = state.claimQuery.toLowerCase().trim();
  return (state.view === 'home' ? monthClaims() : claims).filter(claim => inTab(claim) && (state.category === 'all' || claim.category === state.category) && (!query || `${claim.title} ${claim.id} ${claim.description}`.toLowerCase().includes(query)));
}
function filteredInvoices() {
  const query = state.invoiceQuery.toLowerCase().trim();
  return invoices.filter(invoice => (state.invoiceTab === 'all' || (state.invoiceTab === 'available' ? !invoiceClaim(invoice.id) : invoiceClaim(invoice.id))) && (!query || `${invoice.title} ${invoice.supplier} ${invoice.number}`.toLowerCase().includes(query)));
}
function heading(title, subtitle, actions) {
  return `<div class="page-heading"><div><h1>${title}</h1><p class="page-subtitle">${subtitle}</p></div><div class="heading-actions">${actions}</div></div>`;
}
const newClaimButton = () => `<button class="button button-primary" data-action="new-claim">${icon('plus')}新建报销</button>`;
function tabsHTML() {
  const source = state.view === 'home' ? monthClaims() : claims;
  const tabs = [ ['all', '全部', source.length], ['pending', '待提交', source.filter(claim => ['draft', 'returned'].includes(claim.status)).length], ['review', '进行中', source.filter(claim => claim.status === 'review').length], ['paid', '已报销', source.filter(claim => claim.status === 'paid').length] ];
  return `<div class="tabs" role="tablist" aria-label="报销状态">${tabs.map(([key, label, count]) => `<button class="tab ${state.claimTab === key ? 'active' : ''}" role="tab" aria-selected="${state.claimTab === key}" data-action="claim-tab" data-value="${key}">${label}<span>${count}</span></button>`).join('')}</div>`;
}
function tableHTML() {
  return `<div class="table-scroll"><table class="claims-table"><thead><tr><th scope="col">报销事项</th><th scope="col">金额</th><th scope="col">状态</th><th scope="col"><span aria-label="操作"></span></th></tr></thead><tbody id="claims-table-body">${claimRows()}</tbody></table></div>`;
}
function claimRows() {
  const list = filteredClaims();
  if (!list.length) return `<tr><td colspan="4"><div class="empty-state">${icon('file-search')}<h3>${state.claimQuery ? '还没有找到这份报销' : '这里暂时没有报销单'}</h3><p>${state.claimQuery ? '换一个关键词，或看看其他状态吧。' : '每一笔小小的付出，都可以从这里记下。'}</p><button class="button button-soft" data-action="${state.claimQuery ? 'clear-claim-search' : 'new-claim'}">${state.claimQuery ? '清除筛选' : '新建一份报销'}</button></div></td></tr>`;
  return list.map(claim => {
    const category = categories[claim.category];
    return `<tr><td><button class="claim-title-button" data-action="detail" data-id="${claim.id}" title="${escapeHTML(claim.title)}"><span class="item-icon ${category.tone}">${icon(category.icon)}</span><span class="claim-title-copy"><strong>${escapeHTML(claim.title)}</strong><small>${category.label}<span class="claim-date"> · ${dateLabel(claim.date)}</span></small></span></button></td><td class="amount">¥ ${money(claim.amount)}</td><td>${statusHTML(claim.status)}</td><td><button class="icon-button" data-action="${['draft', 'returned'].includes(claim.status) ? 'edit-claim' : 'detail'}" data-id="${claim.id}" aria-label="${['draft', 'returned'].includes(claim.status) ? '编辑' : '查看'}${escapeHTML(claim.title)}">${icon(['draft', 'returned'].includes(claim.status) ? 'pencil' : 'chevron-right')}</button></td></tr>`;
  }).join('');
}
function tableFooter() {
  return `<div class="panel-bottom"><span>${icon('shield-check')}报销信息仅对相关审批人可见</span><span id="claim-result-count">共 ${filteredClaims().length} 笔</span></div>`;
}
function renderHome() {
  const current = new Date();
  const greeting = current.getHours() < 12 ? '上午好' : current.getHours() < 18 ? '下午好' : '晚上好';
  const rows = monthClaims();
  const amounts = [ ['paid', '本月已报销', 'wallet', 'green'], ['review', '审批中', 'clock', 'blue'], ['pending', '待提交', 'file-pencil', 'amber'] ].map(([key, label, name, tone]) => {
    const list = rows.filter(claim => key === 'pending' ? ['draft', 'returned'].includes(claim.status) : claim.status === key);
    return `<div class="money-row"><span class="money-icon ${tone}">${icon(name)}</span><div class="money-label">${label}<small>${list.length} 笔</small></div><div class="money-value">${amountHTML(list.reduce((sum, claim) => sum + claim.amount, 0))}</div></div>`;
  }).join('');
  const returned = claims.filter(claim => claim.status === 'returned');
  const months = [...new Set(['2026-10', state.month, ...claims.map(claim => claim.date.slice(0, 7))])].sort().reverse();
  const period = `<div class="period-label">${icon('calendar')}<div class="select-wrapper">${icon('chevron-down')}<select id="month-select" aria-label="统计月份">${months.map(month => `<option value="${month}" ${state.month === month ? 'selected' : ''}>${month.slice(0, 4)} 年 ${Number(month.slice(5))} 月</option>`).join('')}</select></div></div>`;
  main.innerHTML = `<section class="page home-page">${heading(`${greeting}，林予安。`, '今天也辛苦啦，剩下的小事，一件件轻松办好。', period)}<div class="desk-layout"><aside class="desk-aside" aria-label="报销工具与金额概览"><button class="start-ticket" data-action="new-claim"><span class="ticket-label">给每一笔付出，一个着落</span><h2>开始一笔<br>新的报销</h2><img src="./assets/receipt.svg" alt="" class="ticket-art"><span class="ticket-bottom"><span>从一张发票开始</span><span class="ticket-plus">${icon('plus')}</span></span></button><section class="desk-totals" aria-label="月度报销汇总"><h2 class="aside-heading">报销概览<span>人民币 / CNY</span></h2>${amounts}</section><div class="desk-tools"><button class="desk-tool" data-action="import-invoice">${icon('upload')}添加发票${icon('arrow-up-right')}</button><button class="desk-tool" data-view="guide">${icon('book-2')}报销指南${icon('arrow-up-right')}</button></div><p class="aside-whisper">不必赶，把事情一件件理清就好。</p></aside><div class="ledger-area"><div class="task-note"><span class="note-symbol">${icon(returned.length ? 'bulb' : 'circle-check')}</span><span><strong>${returned.length ? `${returned.length} 份报销，还差一点点` : '每一笔，都在好好向前'}</strong><small>${returned.length ? '补上项目名称和用途，就可以继续啦。' : '暂时没有需要补充的信息，辛苦啦。'}</small></span><button class="text-button" ${returned.length ? `data-action="edit-claim" data-id="${returned[0].id}"` : 'data-view="claims"'}>${returned.length ? '去完善' : '查看进度'}${icon('arrow-right')}</button></div><section class="claims-panel"><div class="panel-heading"><div class="book-heading"><span class="book-symbol">${icon('notebook')}</span><h2>我的报销簿</h2><span class="book-count">${monthClaims().length} 笔记录</span></div><button class="text-button" data-action="export">${icon('download')}导出</button></div>${tabsHTML()}${tableHTML()}${tableFooter()}</section><div class="book-endnote"><img src="./assets/finance.svg" alt="" loading="lazy"><span>发票收好，进度放心。<strong>把时间留给更值得的事。</strong></span><button class="text-button" data-view="claims">查看所有报销${icon('arrow-right')}</button></div></div></div></section>`;
}
function renderClaims() {
  main.innerHTML = `<section class="page">${heading('我的报销', '从草稿到到账，每一步都有迹可循。', `<button class="button button-secondary" data-action="export">${icon('download')}导出记录</button>${newClaimButton()}`)}<div class="toolbar"><div class="filter-group"><label class="search-field">${icon('search')}<input id="claim-search" type="search" placeholder="搜索报销事项" aria-label="搜索报销事项" value="${escapeHTML(state.claimQuery)}"></label><div class="select-wrapper">${icon('chevron-down')}<select id="category-filter" aria-label="费用类别"><option value="all">全部类别</option>${Object.entries(categories).map(([key, item]) => `<option value="${key}" ${state.category === key ? 'selected' : ''}>${item.label}</option>`).join('')}</select></div></div><span class="page-subtitle">费用归属 · ${company.department}</span></div><section class="claims-panel full-table">${tabsHTML()}${tableHTML()}${tableFooter()}</section></section>`;
}
function invoiceCards() {
  const list = filteredInvoices();
  if (!list.length) return `<div class="empty-state" style="grid-column:1/-1">${icon('receipt')}<h3>${state.invoiceQuery ? '没有找到这张发票' : '发票夹暂时是空的'}</h3><p>${state.invoiceQuery ? '试试商户名称或发票号码。' : '先收好电子发票，下一次报销就会轻松一些。'}</p><button class="button button-soft" data-action="${state.invoiceQuery ? 'clear-invoice-search' : 'import-invoice'}">${state.invoiceQuery ? '清除搜索' : '添加电子发票'}</button></div>`;
  return list.map(invoice => `<button class="invoice-card" data-action="invoice-detail" data-id="${invoice.id}"><div class="invoice-card-head">${icon('receipt')}<span class="status ${invoiceClaim(invoice.id) ? 'gray' : 'green'}">${icon(invoiceClaim(invoice.id) ? 'link' : 'circle-check')}${invoiceClaim(invoice.id) ? '已关联' : '可报销'}</span></div><h3>${escapeHTML(invoice.title)}</h3><span class="invoice-id">${escapeHTML(invoice.number)}</span><div class="money-value">${amountHTML(invoice.amount)}</div><div class="invoice-card-footer"><span>${dateLabel(invoice.date)}</span><span>电子发票 ${icon('chevron-right')}</span></div></button>`).join('');
}
function renderInvoices() {
  const freeCount = availableInvoices().length;
  main.innerHTML = `<section class="page">${heading('发票夹', '把票据收好，把繁琐的事留少一点。', `<button class="button button-primary" data-action="import-invoice">${icon('upload')}添加电子发票</button>`)}<div class="inline-note">${icon('folder-check')}有 ${freeCount} 张发票还没报销，可以为它们找个归属啦。</div><div class="toolbar"><div class="tabs" role="tablist" aria-label="发票状态">${[['available', '可报销', freeCount], ['linked', '已关联', invoices.length - freeCount], ['all', '全部发票', invoices.length]].map(([key, label, count]) => `<button class="tab ${state.invoiceTab === key ? 'active' : ''}" role="tab" aria-selected="${state.invoiceTab === key}" data-action="invoice-tab" data-value="${key}">${label}<span>${count}</span></button>`).join('')}</div><label class="search-field">${icon('search')}<input id="invoice-search" type="search" placeholder="搜索商户、发票号码" aria-label="搜索发票" value="${escapeHTML(state.invoiceQuery)}"></label></div><div class="invoice-grid" id="invoice-grid">${invoiceCards()}</div></section>`;
}
function renderApprovals() {
  const list = approvals.filter(item => state.approvalTab === 'pending' ? item.status === 'pending' : item.status !== 'pending');
  main.innerHTML = `<section class="page">${heading('待我审批', '认真看过每一笔，也照顾每一份信任。', `<span class="status green">${icon('user-check')}项目负责人</span>`)}<div class="tabs" role="tablist" aria-label="审批记录"><button class="tab ${state.approvalTab === 'pending' ? 'active' : ''}" data-action="approval-tab" data-value="pending" role="tab" aria-selected="${state.approvalTab === 'pending'}">待处理<span>${approvals.filter(item => item.status === 'pending').length}</span></button><button class="tab ${state.approvalTab === 'handled' ? 'active' : ''}" data-action="approval-tab" data-value="handled" role="tab" aria-selected="${state.approvalTab === 'handled'}">已处理<span>${approvals.filter(item => item.status !== 'pending').length}</span></button></div><div class="scroll-area"><div class="approval-list">${list.length ? list.map(item => `<article class="approval-card"><span class="avatar ${categories[item.category].tone}">${item.avatar}</span><div><h3>${item.title}</h3><p class="approval-meta"><span>${item.name} · 品牌设计部</span><span>${dateLabel(item.date)}提交</span></p><p>${escapeHTML(item.description)}</p>${item.note ? `<p>审批意见：${escapeHTML(item.note)}</p>` : ''}</div><div><div class="money-value">${amountHTML(item.amount)}</div><div class="approval-actions">${item.status === 'pending' ? `<button class="button button-secondary" data-action="approval-detail" data-id="${item.id}">查看申请</button><button class="button button-soft" data-action="approve" data-id="${item.id}">${icon('check')}审批</button>` : `<span class="status ${item.status === 'approved' ? 'green' : 'amber'}">${icon(item.status === 'approved' ? 'circle-check' : 'arrow-back-up')}${item.status === 'approved' ? '已通过' : '已退回'}</span>`}</div></div></article>`).join('') : `<div class="empty-state">${icon('circle-check')}<h3>${state.approvalTab === 'pending' ? '待办清空，轻松一点' : '还没有已处理的申请'}</h3><p>${state.approvalTab === 'pending' ? '每一份申请都被认真看过了，辛苦啦。' : '处理后的审批意见会留在这里。'}</p></div>`}</div></div></section>`;
}
function renderGuide() {
  const faqs = [
    ['报销前，需要准备什么？', '准备电子发票、费用发生日期和一段清楚的用途说明。差旅费用还需要注明出行项目、目的地和住宿晚数。发票先放进发票夹，填单时就不用来回找啦。'],
    ['发票抬头应该怎么填写？', `请填写「${company.name}」，纳税人识别号为 ${company.tax}。个人抬头或简称可能需要重新开具，开票前核对一下，会省去很多往返。`],
    ['差旅和团队餐费有什么标准？', '住宿标准：一线城市每晚不超过 650 元，其他城市每晚不超过 450 元；团队工作餐每人不超过 150 元。确有特殊情况，请在费用说明中写明原因，并取得项目负责人确认。'],
    ['多久提交，什么时候到账？', '请在费用发生后 30 天内提交。申请依次经过项目负责人审批、财务复核和付款安排；财务每周二、周五安排付款。具体进度可以在报销单详情中查看。'],
    ['报销退回了，怎么办？', '先看看财务留下的补充说明，再进入报销单修改对应信息。补齐后重新提交即可，不需要重新建一份。遇到拿不准的地方，可以随时问问财务。']
  ];
  main.innerHTML = `<section class="page">${heading('报销指南', '不用记住所有规则，遇到问题时来这里看看就好。', `<button class="button button-secondary" data-action="help">${icon('message-circle')}问问财务</button>`)}<div class="scroll-area"><div class="guide-hero"><div><h2>少一点疑惑，多一点安心。</h2><p>把常见的问题整理好，陪你把报销顺顺当当办完。</p></div><img src="./assets/finance.svg" alt="整理好每一笔费用"></div><div class="guide-content"><section aria-label="常见问题">${faqs.map(([title, text], index) => `<details class="faq" ${index === 0 ? 'open' : ''}><summary>${title}</summary><p>${text}</p></details>`).join('')}</section><aside class="company-info"><h3>开票信息，收好啦</h3><dl><div><dt>公司抬头</dt><dd>${company.name}</dd></div><div><dt>纳税人识别号</dt><dd>${company.tax}</dd></div><div><dt>所属部门</dt><dd>${company.department}</dd></div></dl><button class="button button-soft" data-action="copy-company">${icon('copy')}复制开票信息</button></aside></div></div></section>`;
}
function render() {
  const focusedTab = document.activeElement.closest('[role="tab"]');
  ({ home: renderHome, claims: renderClaims, invoices: renderInvoices, approvals: renderApprovals, guide: renderGuide })[state.view]();
  const names = { home: '工作台', claims: '我的报销', invoices: '发票夹', approvals: '待我审批', guide: '报销指南' };
  $('#breadcrumb-current').textContent = names[state.view];
  $$('.nav-item[data-view]').forEach(button => {
    const selected = button.dataset.view === state.view;
    button.classList.toggle('active', selected);
    if (selected) button.setAttribute('aria-current', 'page'); else button.removeAttribute('aria-current');
  });
  const count = approvals.filter(item => item.status === 'pending').length;
  $('#approval-count').textContent = count;
  $('#approval-count').hidden = count === 0;
  const invoiceDot = $('.nav-dot');
  invoiceDot.hidden = availableInvoices().length === 0;
  if (focusedTab) $(`[data-action="${focusedTab.dataset.action}"][data-value="${focusedTab.dataset.value}"]`)?.focus({ preventScroll: true });
}
function goToView(view) {
  if (!['home', 'claims', 'invoices', 'approvals', 'guide'].includes(view)) return;
  closeModal();
  closeNotifications();
  if (view !== state.view) { state.claimTab = 'all'; state.claimQuery = ''; state.category = 'all'; }
  state.view = view;
  main.scrollTop = 0;
  render();
}
function showToast(message, warning = false) {
  clearTimeout(state.toastTimer);
  $('#toast-message').textContent = message;
  $('.toast-icon').innerHTML = icon(warning ? 'info-circle' : 'circle-check');
  $('#toast').hidden = false;
  state.toastTimer = setTimeout(() => { $('#toast').hidden = true; }, 4500);
}
function closeNotifications() {
  $('#notification-popover').hidden = true;
  $('.notification-button').setAttribute('aria-expanded', 'false');
}
function modalHeader(title, subtitle = '') {
  return `<header class="dialog-header"><div><h2 id="dialog-title">${title}</h2>${subtitle ? `<p>${subtitle}</p>` : ''}</div><button class="icon-button" data-action="close-modal" aria-label="关闭弹窗">${icon('x')}</button></header>`;
}
function openModal(type, content, size = '') {
  if (modalLayer.hidden) state.returnFocus = document.activeElement;
  state.modal = type;
  closeNotifications();
  dialog.className = `dialog ${size}`;
  dialog.innerHTML = content;
  modalLayer.hidden = false;
  $('.app-header').inert = true;
  $('.app-body').inert = true;
  const focusTarget = $('input:not([type="checkbox"]):not([type="file"]), textarea', dialog) || dialog;
  focusTarget.focus({ preventScroll: true });
}
function closeModal() {
  if (modalLayer.hidden) return;
  modalLayer.hidden = true;
  state.modal = null;
  $('.app-header').inert = false;
  $('.app-body').inert = false;
  if (state.returnFocus?.isConnected) state.returnFocus.focus({ preventScroll: true });
  state.returnFocus = null;
}
function formError(message, field = null) {
  const error = $('#form-error');
  error.textContent = message;
  error.hidden = false;
  if (field) $(field, dialog)?.focus();
  error.scrollIntoView({ block: 'nearest', behavior: 'auto' });
}
function openClaimForm(id = null, invoiceId = null) {
  const claim = id ? claims.find(item => item.id === id) : null;
  if (id && (!claim || !['draft', 'returned'].includes(claim.status))) return;
  if (claim?.status === 'returned' && claim.supplementBaseline === undefined) claim.supplementBaseline = claim.description;
  state.editingId = id;
  state.invoiceSelection = new Set(claim?.invoiceIds || (invoiceId ? [invoiceId] : []));
  const available = availableInvoices(id);
  const total = available.filter(invoice => state.invoiceSelection.has(invoice.id)).reduce((sum, invoice) => sum + invoice.amount, 0);
  openModal('claim-form', `${modalHeader(claim ? '把这份报销再完善一下' : '新建报销', '不必一次填完，随时可以存为草稿。')}<div class="dialog-body"><div class="form-error" id="form-error" role="alert" hidden></div><form id="claim-form" novalidate><div class="form-layout"><div class="form-fields"><label class="field"><span>报销事项<span class="required">*</span></span><input name="title" id="claim-title" maxlength="60" placeholder="例如：南京客户拜访差旅" value="${escapeHTML(claim?.title || '')}" required></label><div class="field-row"><label class="field"><span>费用类别</span><div class="select-wrapper">${icon('chevron-down')}<select name="category">${Object.entries(categories).map(([key, item]) => `<option value="${key}" ${(claim?.category || 'travel') === key ? 'selected' : ''}>${item.label}</option>`).join('')}</select></div></label><label class="field"><span>费用日期<span class="required">*</span></span><input name="expenseDate" id="expense-date" type="text" inputmode="numeric" maxlength="10" placeholder="YYYY-MM-DD" value="${claim?.expenseDate || today()}" required></label></div><label class="field"><span>报销金额 · 元</span><input class="money-input" name="amount" id="claim-amount" value="${(total / 100).toFixed(2)}" readonly><small>根据所选发票汇总，金额不会漏算。</small></label><label class="field"><span>费用说明<span class="required">*</span></span><textarea name="description" id="claim-description" maxlength="500" placeholder="写下项目名称、用途，让审批更顺畅。">${escapeHTML(claim?.description || '')}</textarea></label><div class="field"><span>费用归属</span><div class="info-block">${company.department}<br><small>${company.costCenter}</small></div></div></div><aside class="form-side"><div class="form-side-heading"><h3>选择要报销的发票</h3><small>${available.length} 张可选</small></div>${available.length ? available.map(invoice => `<label class="invoice-option"><input type="checkbox" name="invoice" value="${invoice.id}" ${state.invoiceSelection.has(invoice.id) ? 'checked' : ''}><span class="invoice-option-copy"><strong>${escapeHTML(invoice.title)}</strong><small>${dateLabel(invoice.date)}</small></span><span class="amount">¥ ${money(invoice.amount)}</span></label>`).join('') : `<div class="empty-state">${icon('receipt')}<h3>还没有可用的发票</h3><p>可以先保存草稿，再到发票夹添加票据。</p></div>`}<div class="attached-total"><span>已选 <strong id="selected-count">${state.invoiceSelection.size}</strong> 张</span><strong class="amount" id="selected-total">¥ ${money(total)}</strong></div><div class="form-gentle-note">${icon('heart-handshake')}<span>${claim?.reason ? escapeHTML(claim.reason) : '发票仅会关联到这一份报销，不会重复使用。暂时缺票也没关系，先存好草稿。'}</span></div></aside></div></form></div><footer class="dialog-footer"><span class="footer-hint">${icon('lock')}你的费用信息会被妥善保管</span><button class="button button-secondary" data-action="save-draft">保存草稿</button><button class="button button-primary" data-action="submit-claim">${icon('send')}提交审批</button></footer>`);
}
function validDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const timestamp = Date.parse(`${value}T00:00:00Z`);
  return Number.isFinite(timestamp) && new Date(timestamp).toISOString().slice(0, 10) === value;
}
function selectedTotal() { return invoices.filter(invoice => state.invoiceSelection.has(invoice.id)).reduce((sum, invoice) => sum + invoice.amount, 0); }
function saveClaim(submit) {
  const form = $('#claim-form');
  const title = form.elements.title.value.trim();
  const expenseDate = form.elements.expenseDate.value.trim();
  const description = form.elements.description.value.trim();
  const previous = claims.find(claim => claim.id === state.editingId);
  if (!title) return formError('先给这笔报销起个名字吧，之后会更好找。', '#claim-title');
  if (!validDate(expenseDate)) return formError('日期再检查一下吧，请填写完整的 YYYY-MM-DD。', '#expense-date');
  if (expenseDate > today()) return formError('这一天还没到呢，费用日期请填写实际发生的日子。', '#expense-date');
  if (submit && !state.invoiceSelection.size) return formError('还差一张发票。选好票据后再提交，也可以先存为草稿。');
  if (submit && description.length < 6) return formError('再写一点用途说明吧，带上项目名称会更清楚。', '#claim-description');
  if (submit && previous?.supplementBaseline === description) return formError('请在说明里补上项目名称和用途，财务就能继续处理啦。', '#claim-description');
  const entry = { id: previous?.id || `c${state.nextClaim++}`, title, expenseDate, description, amount: selectedTotal(), category: form.elements.category.value, invoiceIds: [...state.invoiceSelection], status: submit ? 'review' : 'draft', date: submit ? today() : (previous?.date || today()) };
  if (previous) Object.assign(previous, entry); else claims.unshift(entry);
  if (submit && previous) { delete previous.supplementBaseline; delete previous.reason; }
  if (entry.date.slice(0, 7) !== state.month && state.view === 'home') state.month = entry.date.slice(0, 7);
  state.claimTab = submit ? 'review' : 'pending';
  state.claimQuery = '';
  state.category = 'all';
  closeModal();
  if (state.view !== 'home' && state.view !== 'claims') state.view = 'claims';
  render();
  showToast(submit ? '报销单已进入审批队列，辛苦啦。' : '草稿收好了，不着急，准备好再继续。');
}
function claimTimeline(claim) {
  if (claim.status === 'draft') return `<div class="info-block"><strong>准备好了，再出发</strong>这份报销还在草稿中，选好发票、写好用途后，就可以提交审批。</div>`;
  const doneCount = claim.status === 'paid' ? 4 : 1;
  const steps = [ ['已提交', `林予安 · ${dateLabel(claim.date)}`], ['项目负责人审批', claim.status === 'paid' ? '许清和 · 审批通过' : claim.status === 'returned' ? '许清和 · 请补充费用说明' : '许清和 · 正在查看申请'], ['财务复核', claim.status === 'paid' ? '陈舒 · 发票与费用已核对' : '审批通过后，财务会接着处理'], ['报销到账', claim.status === 'paid' ? `${dateLabel(claim.date)} · 付款记录已归档` : '每周二、周五安排付款'] ];
  return `<div class="timeline">${steps.map(([title, description], index) => `<div class="timeline-step ${index < doneCount ? 'done' : index === doneCount ? 'current' : ''}"><span class="step-icon">${index < doneCount ? icon('check') : index + 1}</span><h4>${title}</h4><p>${description}</p></div>`).join('')}</div>${claim.status === 'returned' ? `<div class="info-block amber"><strong>还差一点点，我们一起补齐</strong>${escapeHTML(claim.reason)}</div>` : claim.status === 'review' ? `<div class="form-gentle-note">${icon('leaf')}进度有变化会及时告诉你，不用反复确认。</div>` : ''}`;
}
function openClaimDetail(id) {
  const claim = claims.find(item => item.id === id);
  if (!claim) return;
  const category = categories[claim.category];
  const canEdit = ['draft', 'returned'].includes(claim.status);
  openModal('claim-detail', `${modalHeader('报销详情', `报销单 QB-${claim.date.replaceAll('-', '')}-${claim.id.slice(1).padStart(3, '0')}`)}<div class="dialog-body"><div class="detail-layout"><section><div class="detail-heading"><span class="item-icon ${category.tone}">${icon(category.icon)}</span><div><h3>${escapeHTML(claim.title)}</h3>${statusHTML(claim.status)}</div></div><div class="detail-amount">${amountHTML(claim.amount)}</div><dl class="detail-fields"><div><dt>费用类别</dt><dd>${category.label}</dd></div><div><dt>费用日期</dt><dd>${claim.expenseDate}</dd></div><div><dt>申请人</dt><dd>林予安</dd></div><div><dt>所属部门</dt><dd>${company.department}</dd></div><div class="full-span"><dt>费用说明</dt><dd>${escapeHTML(claim.description || '尚未填写费用说明')}</dd></div></dl><div class="detail-attachments"><h3 class="section-heading">关联发票 · ${claim.invoiceIds.length} 张</h3>${claim.invoiceIds.map(invoiceId => { const invoice = invoices.find(item => item.id === invoiceId); return `<button class="detail-attachment" data-action="invoice-detail" data-id="${invoice.id}">${icon('receipt')}<span>${escapeHTML(invoice.title)}</span><strong class="amount">¥ ${money(invoice.amount)}</strong>${icon('chevron-right')}</button>`; }).join('')}</div></section><section><h3 class="section-heading">报销进度</h3>${claimTimeline(claim)}</section></div></div><footer class="dialog-footer"><button class="button button-secondary" data-action="close-modal">关闭</button>${claim.status === 'review' ? `<button class="button button-secondary" data-action="withdraw" data-id="${claim.id}">撤回修改</button>` : ''}${canEdit ? `<button class="button button-primary" data-action="edit-claim" data-id="${claim.id}">${icon('pencil')}${claim.status === 'returned' ? '补充信息' : '继续填写'}</button>` : ''}</footer>`);
}
function openWithdraw(id) {
  const claim = claims.find(item => item.id === id);
  if (!claim || claim.status !== 'review') return;
  openModal('withdraw', `${modalHeader('要把这份报销撤回吗？')}<div class="dialog-body"><div class="info-block">「${escapeHTML(claim.title)}」会回到草稿中，已有内容和发票都会保留。修改好后，可以重新提交。</div></div><footer class="dialog-footer"><button class="button button-secondary" data-action="detail" data-id="${id}">再想一下</button><button class="button button-primary" data-action="confirm-withdraw" data-id="${id}">撤回到草稿</button></footer>`, 'compact');
}
function openInvoiceDetail(id) {
  const invoice = invoices.find(item => item.id === id);
  if (!invoice) return;
  const linked = invoiceClaim(id);
  openModal('invoice-detail', `${modalHeader('发票详情', '开票信息清清楚楚，报销才能顺顺利利。')}<div class="dialog-body"><div class="detail-layout"><section><div class="detail-heading"><span class="item-icon green">${icon('receipt')}</span><div><h3>${escapeHTML(invoice.title)}</h3><small>电子普通发票</small></div></div><div class="detail-amount">${amountHTML(invoice.amount)}</div><dl class="detail-fields"><div class="full-span"><dt>发票号码</dt><dd>${escapeHTML(invoice.number)}</dd></div><div class="full-span"><dt>销售方</dt><dd>${escapeHTML(invoice.supplier)}</dd></div><div><dt>开票日期</dt><dd>${invoice.date}</dd></div><div><dt>关联状态</dt><dd>${linked ? '已关联报销单' : '可用于报销'}</dd></div></dl></section><aside class="form-side"><h3 class="section-heading">购买方信息</h3><dl class="detail-fields"><div class="full-span"><dt>公司抬头</dt><dd>${company.name}</dd></div><div class="full-span"><dt>纳税人识别号</dt><dd>${company.tax}</dd></div>${invoice.fileName ? `<div class="full-span"><dt>票据文件</dt><dd>${escapeHTML(invoice.fileName)}</dd></div>` : ''}</dl><div class="form-gentle-note">${icon('shield-check')}同一张发票不会重复关联到多份报销。</div></aside></div></div><footer class="dialog-footer">${linked ? `<span class="footer-hint">已关联：${escapeHTML(linked.title)}</span><button class="button button-soft" data-action="detail" data-id="${linked.id}">查看报销</button>` : `<button class="button button-danger" data-action="remove-invoice" data-id="${id}">移出发票夹</button><button class="button button-primary" data-action="claim-with-invoice" data-id="${id}">${icon('file-plus')}用这张发票报销</button>`}<button class="button button-secondary" data-action="close-modal">关闭</button></footer>`);
}
function importInvoice() {
  state.invoiceFile = null;
  openModal('invoice-import', `${modalHeader('把电子发票收好', '选择文件，再核对一下票面信息。')}<div class="dialog-body"><div class="form-error" id="form-error" role="alert" hidden></div><form id="invoice-form" novalidate><div class="form-layout"><div class="form-fields"><label class="drop-zone" id="drop-zone">${icon('cloud-upload')}<strong>点击选择，或把文件拖到这里</strong><small id="file-hint">PDF、JPG、PNG · 单个文件不超过 20 MB</small><input type="file" id="invoice-file" accept=".pdf,.jpg,.jpeg,.png" aria-label="选择电子发票文件"></label><label class="field"><span>票据名称<span class="required">*</span></span><input name="title" id="invoice-title" maxlength="60" placeholder="例如：品牌手册印刷"></label><label class="field"><span>销售方<span class="required">*</span></span><input name="supplier" id="invoice-supplier" maxlength="100" placeholder="填写票面上的商户名称"></label></div><div class="form-fields"><label class="field"><span>发票号码<span class="required">*</span></span><input name="number" id="invoice-number" inputmode="numeric" maxlength="20" placeholder="填写 8、10、12 或 20 位号码"></label><div class="field-row"><label class="field"><span>价税合计 · 元<span class="required">*</span></span><input name="amount" id="invoice-amount" inputmode="decimal" maxlength="12" placeholder="0.00"></label><label class="field"><span>开票日期<span class="required">*</span></span><input name="date" id="invoice-date" type="text" inputmode="numeric" maxlength="10" value="${today()}" placeholder="YYYY-MM-DD"></label></div><div class="info-block"><strong>开票抬头记得核对</strong>${company.name}<br><small>${company.tax}</small></div><div class="form-gentle-note">${icon('bulb')}请按票面填写信息。发票真伪校验需要连接企业财务服务。</div></div></div></form></div><footer class="dialog-footer"><button class="button button-secondary" data-action="close-modal">稍后再说</button><button class="button button-primary" data-action="save-invoice">${icon('folder-plus')}收进发票夹</button></footer>`);
}
function chooseFile(file) {
  state.invoiceFile = null;
  $('#file-hint').textContent = 'PDF、JPG、PNG · 单个文件不超过 20 MB';
  if (!file) return;
  if (!/\.(pdf|jpe?g|png)$/i.test(file.name)) return formError('这个格式还不能放进发票夹，请选择 PDF、JPG 或 PNG。');
  if (file.size > 20 * 1024 * 1024 || !file.size) return formError(file.size ? '这张票据有点大，换成 20 MB 以内的文件吧。' : '这个文件好像是空的，再选一次吧。');
  state.invoiceFile = file;
  $('#form-error').hidden = true;
  $('#file-hint').textContent = `${file.name} · ${Math.max(1, Math.round(file.size / 1024))} KB`;
  if (!$('#invoice-title').value) $('#invoice-title').value = file.name.replace(/\.[^.]+$/, '').slice(0, 60);
}
function saveInvoice() {
  const form = $('#invoice-form');
  const title = form.elements.title.value.trim();
  const supplier = form.elements.supplier.value.trim();
  const number = form.elements.number.value.trim();
  const rawAmount = form.elements.amount.value.trim();
  const date = form.elements.date.value.trim();
  if (!state.invoiceFile) return formError('先选择一张电子发票，再一起核对票面信息吧。');
  if (!title) return formError('给发票起个名字，之后会更好找。', '#invoice-title');
  if (!supplier) return formError('补上票面上的销售方名称吧。', '#invoice-supplier');
  if (!/^(?:\d{8}|\d{10}|\d{12}|\d{20})$/.test(number)) return formError('发票号码再核对一下，应为 8、10、12 或 20 位数字。', '#invoice-number');
  if (invoices.some(invoice => invoice.number === number)) return formError('这张发票已经收好啦，不需要重复添加。', '#invoice-number');
  if (!/^\d{1,7}(?:\.\d{1,2})?$/.test(rawAmount) || Number(rawAmount) <= 0) return formError('金额请填写大于 0 的数字，最多保留两位小数。', '#invoice-amount');
  if (!validDate(date) || date > today()) return formError('请核对开票日期，填写实际发生的 YYYY-MM-DD。', '#invoice-date');
  invoices.unshift({ id: `i${state.nextInvoice++}`, title, supplier, number, date, amount: Math.round(Number(rawAmount) * 100), fileName: state.invoiceFile.name });
  state.invoiceFile = null;
  state.invoiceTab = 'available';
  state.invoiceQuery = '';
  closeModal();
  state.view = 'invoices';
  render();
  showToast('发票信息收好了，需要报销时再来取。');
}
function openApproval(id) {
  const item = approvals.find(entry => entry.id === id);
  if (!item || item.status !== 'pending') return;
  openModal('approval', `${modalHeader('认真看过，再给一个回应', `${item.name} · ${dateLabel(item.date)}提交`)}<div class="dialog-body"><div class="form-error" id="form-error" role="alert" hidden></div><div class="detail-layout"><section><h3 class="section-heading">${escapeHTML(item.title)}</h3><div class="detail-amount">${amountHTML(item.amount)}</div><dl class="detail-fields"><div><dt>费用类别</dt><dd>${categories[item.category].label}</dd></div><div><dt>所属项目</dt><dd>春山品牌项目</dd></div><div class="full-span"><dt>费用说明</dt><dd>${escapeHTML(item.description)}</dd></div><div class="full-span"><dt>票据核对</dt><dd>票面合计与申请金额一致</dd></div></dl></section><section class="form-fields"><label class="field"><span>审批意见</span><textarea id="approval-note" maxlength="300" placeholder="通过时可留空；需要补充时，请写明具体原因。"></textarea></label><div class="info-block"><strong>让沟通更轻松一点</strong>如果需要补充，告诉对方还差什么，比一句“请修改”更有帮助。</div><div class="form-gentle-note">${icon('shield-check')}通过后进入财务复核，不会直接发起付款。</div></section></div></div><footer class="dialog-footer"><button class="button button-secondary" data-action="close-modal">稍后处理</button><button class="button button-danger" data-action="decide-approval" data-id="${id}" data-value="returned">退回补充</button><button class="button button-primary" data-action="decide-approval" data-id="${id}" data-value="approved">${icon('check')}同意报销</button></footer>`);
}
function decideApproval(id, decision) {
  const item = approvals.find(entry => entry.id === id);
  if (!item || item.status !== 'pending' || !['approved', 'returned'].includes(decision)) return;
  const note = $('#approval-note').value.trim();
  if (decision === 'returned' && note.length < 4) return formError('写清楚需要补充的内容吧，让对方知道下一步怎么做。', '#approval-note');
  item.status = decision;
  item.note = note || '费用用途清楚，同意报销。';
  closeModal();
  state.view = 'approvals';
  render();
  showToast(decision === 'approved' ? '审批意见已记录，下一步由财务复核。' : '补充意见已记下，申请回到待完善状态。');
}
function openSearch() {
  openModal('search', `${modalHeader('找一找报销单和发票')}<div class="dialog-body"><label class="search-field">${icon('search')}<input id="global-search" type="search" maxlength="100" placeholder="报销事项、商户或发票号码" aria-label="搜索报销单和发票"></label><div class="search-results" id="search-results" style="margin-top:16px">${searchResults('')}</div></div><footer class="dialog-footer"><span class="footer-hint">${icon('command')}Ctrl K 打开搜索 · Esc 关闭</span></footer>`, 'search-dialog');
}
function searchResults(value) {
  const query = value.trim().toLowerCase();
  const matchingClaims = claims.filter(claim => !query || `${claim.title} ${claim.description}`.toLowerCase().includes(query)).slice(0, 5);
  const matchingInvoices = query ? invoices.filter(invoice => `${invoice.title} ${invoice.supplier} ${invoice.number}`.toLowerCase().includes(query)).slice(0, 5) : [];
  if (!matchingClaims.length && !matchingInvoices.length) return `<div class="empty-state">${icon('search')}<h3>暂时没找到，换个词试试</h3><p>可以试试项目名称、商户名称或发票号码。</p></div>`;
  return matchingClaims.map(claim => `<button class="search-result" data-action="detail" data-id="${claim.id}"><span class="item-icon ${categories[claim.category].tone}">${icon(categories[claim.category].icon)}</span><span><strong>${escapeHTML(claim.title)}</strong><small>报销单 · ${dateLabel(claim.date)}</small></span>${statusHTML(claim.status)}</button>`).join('') + matchingInvoices.map(invoice => `<button class="search-result" data-action="invoice-detail" data-id="${invoice.id}"><span class="item-icon green">${icon('receipt')}</span><span><strong>${escapeHTML(invoice.title)}</strong><small>${escapeHTML(invoice.supplier)}</small></span><span class="amount">¥ ${money(invoice.amount)}</span></button>`).join('');
}
async function copyText(text, message) {
  try { await navigator.clipboard.writeText(text); showToast(message); }
  catch { showToast('暂时无法自动复制，可以选中开票信息后手动复制。', true); }
}
function openHelp() {
  openModal('help', `${modalHeader('拿不准的事，问问财务就好')}<div class="dialog-body"><div class="settings-profile"><span class="avatar green">舒</span><div><h3>陈舒</h3><p>财务伙伴 · 企业通讯录 / 财务部</p></div></div><div class="info-block"><strong>我们在这里</strong>工作日 09:00—12:00、13:30—18:00<br>带上报销单名称和遇到的问题，就能更快帮你理清。<br>不必担心问得太细，重要的是把事情安心办好。</div></div><footer class="dialog-footer"><button class="button button-secondary" data-action="close-modal">知道啦</button><button class="button button-primary" data-action="help-service">${icon('message-circle')}联系财务伙伴</button></footer>`, 'compact');
}
function openProfile() {
  openModal('profile', `${modalHeader('我的信息')}<div class="dialog-body"><div class="settings-profile"><span class="avatar avatar-self">予</span><div><h3>林予安</h3><p>品牌设计师 · 项目负责人</p></div></div><dl class="detail-fields"><div><dt>所属部门</dt><dd>${company.department}</dd></div><div><dt>员工编号</dt><dd>MH-0316</dd></div><div class="full-span"><dt>费用归属</dt><dd>${company.costCenter}</dd></div><div class="full-span"><dt>报销账户</dt><dd>招商银行 · 尾号 6829</dd></div></dl><div class="form-gentle-note">${icon('lock')}账户信息修改需要由企业管理员核验，请联系财务伙伴。</div></div><footer class="dialog-footer"><button class="button button-secondary" data-action="close-modal">关闭</button><button class="button button-soft" data-action="help">联系财务伙伴</button></footer>`, 'compact');
}
function openOrganization() {
  openModal('organization', `${modalHeader('企业工作空间')}<div class="dialog-body"><div class="settings-profile"><span class="avatar green">禾</span><div><h3>木禾设计</h3><p>用认真，做有温度的设计</p></div></div><dl class="detail-fields"><div class="full-span"><dt>企业名称</dt><dd>${company.name}</dd></div><div><dt>当前空间</dt><dd>员工报销工作台</dd></div><div><dt>权限角色</dt><dd>员工 · 项目负责人</dd></div></dl><div class="form-gentle-note">${icon('building-community')}工作空间和权限由企业管理员统一维护。</div></div><footer class="dialog-footer"><button class="button button-secondary" data-action="close-modal">关闭</button><button class="button button-soft" data-action="copy-company">复制开票信息</button></footer>`, 'compact');
}
function exportClaims() {
  const rows = filteredClaims();
  if (!rows.length) return showToast('当前筛选下没有记录，可以清除筛选后再导出。', true);
  const csvCell = value => {
    const raw = String(value);
    const safe = /^[\s]*[=+@\-]/.test(raw) ? `'${raw}` : raw;
    return `"${safe.replaceAll('"', '""')}"`;
  };
  const csv = [['报销事项', '金额（元）', '费用类别', '状态', '费用日期', '费用说明'], ...rows.map(claim => [claim.title, (claim.amount / 100).toFixed(2), categories[claim.category].label, statuses[claim.status].label, claim.expenseDate, claim.description])].map(row => row.map(csvCell).join(',')).join('\r\n');
  const url = URL.createObjectURL(new Blob(['﻿', csv], { type: 'text/csv;charset=utf-8;' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `轻报-报销记录-${today()}.csv`;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  showToast(`${rows.length} 笔报销记录已整理为 CSV 文件。`);
}

document.addEventListener('click', event => {
  const button = event.target.closest('[data-action], [data-view]');
  if (!button) {
    if (!event.target.closest('#notification-popover')) closeNotifications();
    return;
  }
  event.preventDefault();
  const { action, view, id, value } = button.dataset;
  if (view) return goToView(view);
  if (action !== 'notifications' && !button.closest('#notification-popover')) closeNotifications();
  switch (action) {
    case 'new-claim': openClaimForm(); break;
    case 'edit-claim': openClaimForm(id); break;
    case 'claim-with-invoice': openClaimForm(null, id); break;
    case 'detail': openClaimDetail(id); break;
    case 'close-modal': closeModal(); break;
    case 'save-draft': saveClaim(false); break;
    case 'submit-claim': saveClaim(true); break;
    case 'withdraw': openWithdraw(id); break;
    case 'confirm-withdraw': {
      const claim = claims.find(item => item.id === id);
      if (!claim || claim.status !== 'review') break;
      claim.status = 'draft';
      state.claimTab = 'pending';
      closeModal(); render(); showToast('已回到草稿，原来的内容和发票都还在。'); break;
    }
    case 'claim-tab': state.claimTab = value; render(); break;
    case 'clear-claim-search': state.claimQuery = ''; state.category = 'all'; state.claimTab = 'all'; render(); break;
    case 'invoice-tab': state.invoiceTab = value; render(); break;
    case 'clear-invoice-search': state.invoiceQuery = ''; render(); break;
    case 'invoice-detail': openInvoiceDetail(id); break;
    case 'import-invoice': importInvoice(); break;
    case 'save-invoice': saveInvoice(); break;
    case 'remove-invoice': {
      const invoice = invoices.find(item => item.id === id);
      if (!invoice || invoiceClaim(id)) break;
      openModal('remove-invoice', `${modalHeader('要把这张发票移出吗？')}<div class="dialog-body"><div class="info-block">「${escapeHTML(invoice.title)}」会从发票夹中移出。原始文件不会删除，需要时可以重新添加。</div></div><footer class="dialog-footer"><button class="button button-secondary" data-action="invoice-detail" data-id="${id}">留在这里</button><button class="button button-danger" data-action="confirm-remove-invoice" data-id="${id}">确认移出</button></footer>`, 'compact'); break;
    }
    case 'confirm-remove-invoice': {
      const index = invoices.findIndex(item => item.id === id);
      if (index < 0 || invoiceClaim(id)) break;
      invoices.splice(index, 1); closeModal(); render(); showToast('发票已移出，原始文件没有变化。'); break;
    }
    case 'approval-tab': state.approvalTab = value; render(); break;
    case 'approve': case 'approval-detail': openApproval(id); break;
    case 'decide-approval': decideApproval(id, value); break;
    case 'notifications': {
      const open = $('#notification-popover').hidden;
      $('#notification-popover').hidden = !open;
      $('.notification-button').setAttribute('aria-expanded', String(open)); break;
    }
    case 'read-notifications': $('.notification-dot').hidden = true; showToast('消息已读，重要进度仍会留在报销记录里。'); break;
    case 'search': openSearch(); break;
    case 'profile': openProfile(); break;
    case 'organization': openOrganization(); break;
    case 'help': openHelp(); break;
    case 'help-service': showToast('联系财务伙伴需要连接企业通讯录服务。', true); break;
    case 'copy-company': copyText(`公司抬头：${company.name}\n纳税人识别号：${company.tax}`, '开票信息已复制，开票时记得再核对一下。'); break;
    case 'export': exportClaims(); break;
    case 'dismiss-toast': clearTimeout(state.toastTimer); $('#toast').hidden = true; break;
  }
});
document.addEventListener('input', event => {
  if (event.target.id === 'claim-search') { state.claimQuery = event.target.value; $('#claims-table-body').innerHTML = claimRows(); $('#claim-result-count').textContent = `共 ${filteredClaims().length} 笔`; }
  if (event.target.id === 'invoice-search') { state.invoiceQuery = event.target.value; $('#invoice-grid').innerHTML = invoiceCards(); }
  if (event.target.id === 'global-search') $('#search-results').innerHTML = searchResults(event.target.value);
  if (event.target.closest('#claim-form, #invoice-form') && $('#form-error')) $('#form-error').hidden = true;
});
document.addEventListener('change', event => {
  if (event.target.id === 'month-select') { state.month = event.target.value; state.claimTab = 'all'; render(); }
  if (event.target.id === 'category-filter') { state.category = event.target.value; $('#claims-table-body').innerHTML = claimRows(); $('#claim-result-count').textContent = `共 ${filteredClaims().length} 笔`; }
  if (event.target.matches('input[name="invoice"]')) {
    if (event.target.checked) state.invoiceSelection.add(event.target.value); else state.invoiceSelection.delete(event.target.value);
    $('#selected-count').textContent = state.invoiceSelection.size;
    $('#selected-total').textContent = `¥ ${money(selectedTotal())}`;
    $('#claim-amount').value = (selectedTotal() / 100).toFixed(2);
  }
  if (event.target.id === 'invoice-file') chooseFile(event.target.files[0]);
});
document.addEventListener('submit', event => {
  event.preventDefault();
  if (event.target.id === 'claim-form') saveClaim(true);
  if (event.target.id === 'invoice-form') saveInvoice();
});
document.addEventListener('dragover', event => { if (event.target.closest('#drop-zone')) event.preventDefault(); });
document.addEventListener('drop', event => {
  if (!event.target.closest('#drop-zone')) return;
  event.preventDefault();
  if (event.dataTransfer.files.length !== 1) {
    chooseFile(null);
    return formError('一次收好一张就好，请只选择一个文件。');
  }
  chooseFile(event.dataTransfer.files[0]);
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') { closeNotifications(); closeModal(); }
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); if (modalLayer.hidden || state.modal === 'search') openSearch(); }
  if (event.key === 'Tab' && !modalLayer.hidden) {
    const focusable = $$('button:not(:disabled), input:not(:disabled):not([readonly]), select, textarea, a[href]', dialog).filter(element => element.offsetParent !== null);
    if (!focusable.length) { event.preventDefault(); dialog.focus(); return; }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog)) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && (document.activeElement === last || document.activeElement === dialog)) { event.preventDefault(); first.focus(); }
  }
  const tab = event.target.closest('[role="tab"]');
  if (tab && ['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
    event.preventDefault();
    const peers = $$('[role="tab"]', tab.parentElement);
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? peers.length - 1 : (peers.indexOf(tab) + (event.key === 'ArrowRight' ? 1 : -1) + peers.length) % peers.length;
    const targetValue = peers[next].dataset.value;
    const targetAction = peers[next].dataset.action;
    peers[next].click();
    $(`[data-action="${targetAction}"][data-value="${targetValue}"]`)?.focus();
  }
});
$$('.nav-item').forEach(button => { button.title = $('span', button).textContent.trim(); });
render();
