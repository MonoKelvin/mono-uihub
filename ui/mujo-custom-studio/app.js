/* MUJO is a self-contained local prototype. No customer messages or changes are sent to a server. */
(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const icon = name => `<i class="ti ti-${name}" aria-hidden="true"></i>`;
  const photo = (id, width = 640) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=85`;
  const people = [{ name:'林可', image:47 }, { name:'陈屿', image:12 }, { name:'沈之', image:32 }];
  const avatar = (person, className = '') => `<img class="${className}" src="https://i.pravatar.cc/80?img=${people[person]?.image || 47}" alt="${people[person]?.name || '林可'}">`;
  const stages = [
    { id:'design', name:'设计确认', tone:'', dot:'' },
    { id:'waiting', name:'待生产', tone:'amber', dot:'waiting' },
    { id:'production', name:'生产中', tone:'green', dot:'production' },
    { id:'delivery', name:'待交付', tone:'blue', dot:'delivery' },
    { id:'completed', name:'已完成', tone:'green', dot:'completed' }
  ];
  const materials = [
    { id:'walnut', name:'北美黑胡桃木', short:'黑胡桃木', color:'#896544', stock:'24.8 m³', category:'wood', price:12800 },
    { id:'oak', name:'北美白橡木', short:'白橡木', color:'#c5a477', stock:'36.2 m³', category:'wood', price:8600 },
    { id:'ash', name:'进口白蜡木', short:'白蜡木', color:'#ddc59a', stock:'18.5 m³', category:'wood', price:6800 },
    { id:'cherry', name:'北美樱桃木', short:'樱桃木', color:'#b9845c', stock:'12.6 m³', category:'wood', price:9200 },
    { id:'linen', name:'原色亚麻', short:'原色亚麻', color:'#beb8a4', stock:'128 m', category:'fabric', price:260 },
    { id:'moss', name:'苔绿羊毛呢', short:'羊毛呢', color:'#83917b', stock:'86 m', category:'fabric', price:380 },
    { id:'travertine', name:'米色洞石', short:'天然洞石', color:'#c8c0aa', stock:'42 m²', category:'stone', price:1200 },
    { id:'marble', name:'云灰大理石', short:'大理石', color:'#a8aaa1', stock:'31 m²', category:'stone', price:1600 }
  ];
  const images = {
    table:'photo-1533090161767-e6ffed986c88', chair:'photo-1598300042247-d088f8ab3a91', shelf:'photo-1494438639946-1ebd1d20bf85',
    bed:'photo-1505693416388-ac5ce068fe85', dining:'photo-1617806118233-18e1de247200', cabinet:'photo-1556020685-ae41abfc9365',
    sofa:'photo-1555041469-a586c61ea9bc', desk:'photo-1518455027359-f3f8164ba6bd', lounge:'photo-1592078615290-033ee584e267', room:'photo-1616486338812-3dadae4b4ace'
  };
  const makeOrder = (id,title,client,place,type,material,status,due,owner,image,extra={}) => ({
    id,title,client,place,type,material,status,due,owner,image,dimensions:{width:1800,depth:800,height:750},quantity:1,price:12800,
    note:'保留自然木纹，边缘手工打磨。最终尺寸以客户确认的现场测量结果为准。', deliveryStep:0, ...extra
  });
  const initialOrders = [
    makeOrder('MJ-1028','栖木 · 实木餐桌','周女士','杭州 · 滨江','table','walnut','design','2026-10-28',0,images.table,{badge:'待确认尺寸',quantity:1}),
    makeOrder('MJ-1029','弧线 · 休闲椅','许先生','上海 · 徐汇','chair','oak','design','2026-10-30',1,images.chair,{badge:'方案修改中',dimensions:{width:680,depth:720,height:820},price:4800}),
    makeOrder('MJ-1030','山间 · 开放书架','南山书房','杭州 · 西湖','cabinet','ash','design','2026-11-02',0,images.shelf,{badge:'新订单',price:16800,dimensions:{width:2000,depth:400,height:1800}}),
    makeOrder('MJ-1023','晚安 · 实木双人床','蒋女士','苏州 · 姑苏','bed','oak','waiting','2026-10-24',2,images.bed,{badge:'材料已齐备',dimensions:{width:1800,depth:2100,height:900},price:15600}),
    makeOrder('MJ-1024','团聚 · 长桌与餐椅','和光民宿','湖州 · 莫干山','table','walnut','waiting','2026-10-26',0,images.dining,{badge:'待安排工位',quantity:7,price:28600,dimensions:{width:2200,depth:900,height:750}}),
    makeOrder('MJ-1025','留白 · 玄关柜','方先生','杭州 · 上城','cabinet','cherry','waiting','2026-10-29',1,images.cabinet,{badge:'工艺已确认',dimensions:{width:1600,depth:420,height:900},price:9800}),
    makeOrder('MJ-1016','云栖 · 三人沙发','陈女士','杭州 · 余杭','sofa','linen','production','2026-10-22',0,images.sofa,{badge:'木工制作',progress:2,dimensions:{width:2400,depth:900,height:780},price:22800}),
    makeOrder('MJ-1019','独处 · 书房工作桌','吴先生','上海 · 长宁','table','walnut','production','2026-10-23',1,images.desk,{badge:'表面涂装',progress:4,price:8600,dimensions:{width:1600,depth:700,height:750}}),
    makeOrder('MJ-1020','映山 · 低柜','沈女士','宁波 · 鄞州','cabinet','oak','production','2026-10-25',2,images.cabinet,{badge:'精细打磨',progress:3,dimensions:{width:2000,depth:450,height:500},price:12800}),
    makeOrder('MJ-1021','日常 · 餐椅','郑先生','杭州 · 拱墅','chair','ash','production','2026-10-26',1,images.chair,{badge:'木工制作',progress:2,quantity:4,dimensions:{width:500,depth:520,height:820},price:6400}),
    makeOrder('MJ-1008','午后 · 单人休闲椅','顾女士','杭州 · 西湖','chair','oak','delivery','2026-10-16',2,images.lounge,{badge:'待预约安装',urgent:true,dimensions:{width:720,depth:760,height:840},deliveryStep:1,price:6800}),
    makeOrder('MJ-1012','拾光 · 餐边柜','陆先生','苏州 · 工业园区','cabinet','walnut','delivery','2026-10-18',0,images.room,{badge:'运输中',urgent:true,deliveryStep:2,dimensions:{width:1600,depth:450,height:900},price:14800}),
    makeOrder('MJ-1002','一隅 · 边桌','罗女士','杭州 · 滨江','table','cherry','completed','2026-10-08',1,images.table,{deliveryStep:4,price:3600}),
    makeOrder('MJ-1004','木里 · 餐椅组合','唐先生','杭州 · 西湖','chair','oak','completed','2026-10-11',2,images.chair,{deliveryStep:4,quantity:4,price:7600})
  ];
  const defaultTasks = [
    {order:'MJ-1016',name:'框架制作与软包',worker:'木工 A 组',start:0,duration:5,tone:'green'},
    {order:'MJ-1019',name:'涂装与养护',worker:'涂装 B 组',start:0,duration:3,tone:'blue'},
    {order:'MJ-1020',name:'精细打磨',worker:'木工 B 组',start:1,duration:4,tone:'green'},
    {order:'MJ-1021',name:'榫卯与组装',worker:'木工 A 组',start:3,duration:4,tone:'green'},
    {order:'MJ-1023',name:'开料与木工',worker:'木工 C 组',start:4,duration:5,tone:'green'},
    {order:'MJ-1024',name:'木材预处理',worker:'备料组',start:6,duration:3,tone:'blue'}
  ];
  const initialMessages = {
    'MJ-1028':[{mine:false,text:'林设计师你好，餐桌长度想调整到 1800 mm，六个人坐会更舒服一些。',time:'10:24'},{mine:true,text:'可以的，宽度建议保留 800 mm，黑胡桃木配圆角桌边。我会把更新后的尺寸和效果整理给您。',time:'10:28'},{mine:false,text:'好的，木材就选之前那块偏深的黑胡桃木，想保留它自然的纹理。',time:'10:31'}],
    'MJ-1008':[{mine:false,text:'这周五下午家里有人，可以安排送货和安装。',time:'09:42'},{mine:true,text:'已记录您的时间偏好，我们会在正式发货前和您核对地址。',time:'09:48'}],
    'MJ-1016':[{mine:false,text:'想了解一下沙发目前的制作进度，亚麻面料已经到了吗？',time:'昨天'}],
    'MJ-1012':[{mine:false,text:'餐边柜送到后，需要预留多长的安装时间？',time:'昨天'},{mine:true,text:'安装预计需要 1 至 2 小时，请提前清空摆放位置。',time:'昨天'}]
  };
  const storageKey = 'mujo-custom-studio-v1';
  let stored = null;
  try { stored = JSON.parse(localStorage.getItem(storageKey)); } catch { /* Private browsing still supports the current session. */ }
  const usableStored = stored && Array.isArray(stored.orders) && stored.orders.every(o => o && typeof o.id === 'string' && stages.some(s => s.id === o.status) && materials.some(m => m.id === o.material) && o.dimensions);
  const state = {
    orders:usableStored ? stored.orders : initialOrders, tasks:usableStored && Array.isArray(stored.tasks) ? stored.tasks : defaultTasks,
    messages:usableStored && stored.messages ? stored.messages : initialMessages, checks:usableStored && stored.checks ? stored.checks : {},
    view:'orders', orderTab:'all', query:'', filter:{owner:'all',type:'all'}, list:false, selected:'MJ-1028',
    materialCategory:'wood', craftSelected:'MJ-1028', chatSelected:'MJ-1028', scheduleOffset:0
  };
  let cleanupView = null, lastFocus = null, toastTimer = null;
  const main = $('#main-content');
  const currentOrder = () => state.orders.find(o => o.id === state.selected) || state.orders[0];
  const mat = id => materials.find(m => m.id === id) || materials[0];
  const stage = id => stages.find(s => s.id === id) || stages[0];
  const dateShort = date => `${Number(date.slice(5,7))}月${Number(date.slice(8,10))}日`;
  const money = value => new Intl.NumberFormat('zh-CN',{style:'currency',currency:'CNY',maximumFractionDigits:0}).format(value);
  const isoDate = offset => { const date = new Date(Date.UTC(2026,9,14 + offset)); return date.toISOString().slice(0,10); };
  function save() {
    try {
      localStorage.setItem(storageKey, JSON.stringify({orders:state.orders,tasks:state.tasks,messages:state.messages,checks:state.checks}));
      $('#save-state').textContent = '已保存到此浏览器';
    } catch { $('#save-state').textContent = '仅保留本次会话的更改'; }
    $('#nav-order-count').textContent = state.orders.filter(o => o.status !== 'completed').length;
  }
  function toast(text) {
    clearTimeout(toastTimer);
    $('#toast').innerHTML = icon('circle-check') + escapeHTML(text);
    $('#toast').classList.add('visible');
    toastTimer = setTimeout(() => $('#toast').classList.remove('visible'), 3000);
  }
  function pageHead(title,description,actions='') {
    return `<div class="page-head"><div><h1>${title}</h1><p>${description}</p></div><div class="head-actions">${actions}</div></div>`;
  }
  function renderView(view = state.view) {
    cleanupView?.(); cleanupView = null;
    state.view = view;
    const nav = $(`[data-view="${view}"]`);
    $$('.nav-item[data-view]').forEach(item => { item.classList.toggle('active',item.dataset.view === view); item.setAttribute('aria-current',item.dataset.view === view ? 'page' : 'false'); });
    $('#breadcrumb-current').textContent = nav ? nav.querySelector('span').textContent : '订单看板';
    $('#sidebar').classList.remove('mobile-open');
    if (view === 'orders') renderOrders();
    else if (['materials','dimensions','preview'].includes(view)) renderWorkbench();
    else if (view === 'production') renderProduction();
    else if (view === 'delivery') renderDelivery();
    else if (view === 'craft') renderCraft();
    else if (view === 'messages') renderMessages();
  }
  function renderOrders() {
    const active = state.orders.filter(o => o.status !== 'completed');
    const due = active.filter(o => o.due >= '2026-10-14' && o.due <= '2026-10-20').length;
    main.innerHTML = pageHead('定制订单','跟进每件家具，从第一张草图到准时交付。',`<div class="team-avatars" aria-label="三位团队成员">${avatar(0)}${avatar(1)}${avatar(2)}<span>+2</span></div><button class="btn btn-quiet" data-action="export">${icon('download')}<span class="export-label">导出</span></button><button class="btn btn-primary" data-action="new-order">${icon('plus')}新建订单</button>`) +
      `<section class="metrics" aria-label="订单概览"><div class="metric"><div class="metric-label">进行中的订单 ${icon('info-circle')}</div><div class="metric-bottom"><strong class="metric-value">${active.length}</strong><span class="metric-note">件定制正在发生</span></div></div><div class="metric"><div class="metric-label">设计待确认</div><div class="metric-bottom"><strong class="metric-value">${active.filter(o=>o.status==='design').length.toString().padStart(2,'0')}</strong><span class="metric-note">等待灵感落定</span></div></div><div class="metric"><div class="metric-label">本周待交付</div><div class="metric-bottom"><strong class="metric-value">${String(due).padStart(2,'0')}</strong><span class="metric-note amber">记得提前预约</span></div></div><div class="metric"><div class="metric-label">本月已交付</div><div class="metric-bottom"><strong class="metric-value">${String(state.orders.filter(o=>o.status==='completed').length).padStart(2,'0')}</strong><span class="metric-note green">每一份期待已抵达</span></div></div></section>
      <div class="board-controls"><div class="tabs" role="tablist" aria-label="订单范围">${[['all','全部订单',active.length],['mine','我负责的',active.filter(o=>o.owner===0).length],['completed','已完成',state.orders.filter(o=>o.status==='completed').length]].map(([id,label,count])=>`<button class="tab ${state.orderTab===id?'active':''}" role="tab" aria-selected="${state.orderTab===id}" data-order-tab="${id}">${label}<span class="count">${count}</span></button>`).join('')}</div><div class="control-group"><label class="search-box">${icon('search')}<input id="order-search" type="search" placeholder="搜索订单、客户…" aria-label="搜索订单或客户" value="${escapeHTML(state.query)}"><kbd>⌘ K</kbd></label><button class="btn filter-button ${state.filter.owner!=='all'||state.filter.type!=='all'?'is-filtered':''}" data-action="filter">${icon('adjustments-horizontal')}筛选</button><div class="view-toggle" aria-label="显示方式"><button class="${!state.list?'active':''}" data-layout="board" aria-label="看板视图" aria-pressed="${!state.list}">${icon('layout-kanban')}</button><button class="${state.list?'active':''}" data-layout="list" aria-label="列表视图" aria-pressed="${state.list}">${icon('list')}</button></div></div></div><div id="order-results" class="${state.list?'table-wrap':'board'}"></div><div class="board-footnote"><span>${icon('hand-move')}拖拽卡片切换阶段，点击查看订单</span><span id="result-count"></span></div>`;
    $('#order-search').addEventListener('input', event => {state.query=event.target.value; renderBoard();});
    renderBoard();
  }
  function filteredOrders() {
    const query=state.query.trim().toLowerCase();
    return state.orders.filter(o => (state.orderTab==='completed' ? o.status==='completed' : o.status!=='completed') && (state.orderTab!=='mine'||o.owner===0) && (state.filter.owner==='all'||o.owner===Number(state.filter.owner)) && (state.filter.type==='all'||o.type===state.filter.type) && (!query||`${o.id} ${o.title} ${o.client} ${o.place} ${mat(o.material).name}`.toLowerCase().includes(query)));
  }
  function cardHTML(order,index) {
    const material=mat(order.material);
    return `<article class="order-card" draggable="true" data-order="${order.id}" tabindex="0" role="button" aria-label="查看${escapeHTML(order.title)}，${stage(order.status).name}"><div class="card-top"><span class="order-id">${order.id}</span><span class="tag ${order.urgent?'amber':stage(order.status).tone}">${escapeHTML(order.badge||stage(order.status).name)}</span></div>${index<2?`<img class="order-photo" src="${photo(order.image)}" alt="${escapeHTML(order.title)}家具参考图" draggable="false" loading="${index===0?'eager':'lazy'}">`:''}<h3>${escapeHTML(order.title)}</h3><p class="card-subtitle">${escapeHTML(order.client)} / ${escapeHTML(order.place.split(' · ')[0])}</p><div class="material-line"><span class="material-swatch" style="background:${material.color}"></span>${material.short}<span> · </span><span class="mono">${order.dimensions.width} × ${order.dimensions.depth}</span></div>${order.status==='production'?`<div class="order-progress" aria-label="${order.progress||1}/5 道工序完成">${[1,2,3,4,5].map(i=>`<span class="${i<=(order.progress||1)?'done':''}"></span>`).join('')}</div><div class="production-note"><span>${escapeHTML(order.badge||'木工制作')}</span><span class="mono">${order.progress||1}/5</span></div>`:''}<div class="card-footer"><span class="due ${order.urgent?'urgent':''}">${icon('calendar-event')}<time datetime="${order.due}">${dateShort(order.due)}</time>${order.urgent?'交付':''}</span><span class="card-person">${avatar(order.owner)}<span>${people[order.owner]?.name||'林可'}</span></span></div></article>`;
  }
  function renderBoard() {
    const orders=filteredOrders(), root=$('#order-results');
    root.className=state.list?'table-wrap':'board';
    $('#result-count').textContent=`共 ${orders.length} 件订单`;
    if (state.list) {
      root.innerHTML=`<table><thead><tr><th>定制家具</th><th>阶段</th><th>客户</th><th>负责人</th><th>交付日期</th></tr></thead><tbody>${orders.map(o=>`<tr tabindex="0" data-order="${o.id}"><td><div class="table-product"><img src="${photo(o.image,160)}" alt=""><span><strong>${escapeHTML(o.title)}</strong><small class="mono">${o.id}</small></span></div></td><td><span class="tag ${stage(o.status).tone}">${stage(o.status).name}</span></td><td>${escapeHTML(o.client)}</td><td>${people[o.owner]?.name||'林可'}</td><td><time>${dateShort(o.due)}</time></td></tr>`).join('')}</tbody></table>${!orders.length?'<div class="empty">没有符合条件的订单，请调整搜索或筛选。</div>':''}`;
      return;
    }
    const visibleStages=state.orderTab==='completed'?[stages[4]]:stages.slice(0,4);
    root.style.gridTemplateColumns=state.orderTab==='completed'?'repeat(auto-fit,minmax(230px,320px))':'';
    root.innerHTML=visibleStages.map(s=>{
      const items=orders.filter(o=>o.status===s.id);
      return `<section class="kanban-column view-enter" data-stage="${s.id}" aria-label="${s.name}"><header class="column-head"><h2 class="column-title"><span class="stage-dot ${s.dot}"></span>${s.name}<span class="count">${items.length}</span></h2><div class="column-actions"><button class="icon-button" data-stage-info="${s.id}" aria-label="${s.name}阶段说明">${icon('dots')}</button><button class="icon-button" data-new-stage="${s.id}" aria-label="在${s.name}阶段新建订单">${icon('plus')}</button></div></header><div class="card-list">${items.map(cardHTML).join('')}${!items.length?`<div class="empty">${icon('inbox')}暂无订单<small>可将其他阶段的订单拖到这里</small></div>`:''}<button class="card-add" data-new-stage="${s.id}">${icon('plus')}添加订单</button></div></section>`;
    }).join('');
    $$('.order-card',root).forEach(card=>{
      card.addEventListener('dragstart',event=>{event.dataTransfer.setData('text/plain',`order:${card.dataset.order}`);event.dataTransfer.effectAllowed='move';card.classList.add('dragging');});
      card.addEventListener('dragend',()=>{$$('.dragging,.drag-over').forEach(el=>el.classList.remove('dragging','drag-over'));});
    });
    $$('[data-stage]',root).forEach(column=>{
      column.addEventListener('dragover',event=>{event.preventDefault();event.dataTransfer.dropEffect='move';column.classList.add('drag-over');});
      column.addEventListener('dragleave',event=>{if(!column.contains(event.relatedTarget))column.classList.remove('drag-over');});
      column.addEventListener('drop',event=>{event.preventDefault();column.classList.remove('drag-over');const data=event.dataTransfer.getData('text/plain');if(data.startsWith('order:'))changeStatus(data.slice(6),column.dataset.stage);});
    });
  }
  function changeStatus(id,next) {
    const order=state.orders.find(o=>o.id===id);
    if(!order||!stages.some(s=>s.id===next)||order.status===next)return;
    order.status=next;order.badge=stage(next).name;
    if(next==='completed'){order.deliveryStep=4;order.urgent=false;}
    if(next==='production')order.progress=order.progress||1;
    save();renderView();toast(`${order.title}已移至「${stage(next).name}」`);
  }
  function openModal(content,wide=false) {
    lastFocus=document.activeElement;
    $('#overlay-root').innerHTML=`<div class="overlay"><section class="dialog ${wide?'wide':''}" role="dialog" aria-modal="true" aria-labelledby="dialog-title">${content}</section></div>`;
    const focus=$('input,textarea,select,button',$('.dialog'));focus?.focus();
  }
  function closeModal() { $('#overlay-root').innerHTML='';if(lastFocus?.isConnected)lastFocus.focus(); }
  const modalHead=title=>`<div class="dialog-head"><h2 id="dialog-title">${title}</h2><button class="icon-button" data-action="close" aria-label="关闭弹窗">${icon('x')}</button></div>`;
  function newOrder(status='design') {
    openModal(modalHead('创建一份定制订单')+`<p class="dialog-description">记录想法，开始一件新家具的旅程。</p><form id="new-order-form"><div class="form-grid"><div class="field full"><label for="new-title">家具名称</label><input id="new-title" name="title" placeholder="例如：栖木 · 实木餐桌" required maxlength="60"></div><div class="field"><label for="new-client">客户姓名</label><input id="new-client" name="client" placeholder="客户或品牌名称" required maxlength="40"></div><div class="field"><label for="new-place">交付城市</label><input id="new-place" name="place" placeholder="例如：杭州" required maxlength="40"></div><div class="field"><label for="new-type">家具类型</label><select id="new-type" name="type"><option value="table">桌几</option><option value="chair">座椅</option><option value="cabinet">柜架</option><option value="sofa">沙发</option><option value="bed">床</option></select></div><div class="field"><label for="new-material">主要材料</label><select id="new-material" name="material">${materials.map(m=>`<option value="${m.id}">${m.name}</option>`).join('')}</select></div><div class="field"><label for="new-due">预计交付</label><input id="new-due" name="due" type="date" value="2026-10-28" required></div><div class="field"><label for="new-owner">负责人</label><select id="new-owner" name="owner">${people.map((p,i)=>`<option value="${i}">${p.name}</option>`).join('')}</select></div><div class="field full"><label for="new-note">定制需求</label><textarea id="new-note" name="note" placeholder="尺寸偏好、使用场景或特别的工艺要求…" maxlength="1000"></textarea></div></div><p class="form-error" id="form-error" role="alert"></p><div class="dialog-actions"><button type="button" class="btn" data-action="close">取消</button><button class="btn btn-primary" type="submit">${icon('plus')}创建订单</button></div></form>`);
    $('#new-order-form').addEventListener('submit',event=>{
      event.preventDefault();const data=Object.fromEntries(new FormData(event.target));
      if(!data.title.trim()||!data.client.trim()||!data.place.trim()){$('#form-error').textContent='请填写家具名称、客户和交付城市。';return;}
      const id=`MJ-${Math.max(...state.orders.map(o=>Number(o.id.split('-')[1])||0))+1}`;
      const item=makeOrder(id,data.title.trim(),data.client.trim(),data.place.trim(),data.type,data.material,status,data.due,Number(data.owner),images[data.type]||images.table,{note:data.note.trim(),badge:stage(status).name});
      state.orders.unshift(item);state.orderTab=status==='completed'?'completed':'all';state.query='';state.filter={owner:'all',type:'all'};save();closeModal();renderView('orders');toast(`已创建本地订单 ${id}`);
    });
  }
  function openOrder(id) {
    const order=state.orders.find(o=>o.id===id);if(!order)return;
    state.selected=id;lastFocus=document.activeElement;
    $('#overlay-root').innerHTML=`<div class="overlay drawer-overlay"><section class="drawer" role="dialog" aria-modal="true" aria-labelledby="dialog-title"><header class="drawer-header"><div class="dialog-head"><span class="order-id">${order.id}</span><button class="icon-button" data-action="close" aria-label="关闭订单详情">${icon('x')}</button></div><h2 id="dialog-title">${escapeHTML(order.title)}</h2><p class="card-subtitle">${escapeHTML(order.client)} / ${escapeHTML(order.place)}</p></header><div class="drawer-body"><img class="drawer-cover" src="${photo(order.image,900)}" alt="${escapeHTML(order.title)}参考图"><span class="tag ${stage(order.status).tone}">${stage(order.status).name}</span><dl class="detail-grid"><div><dt>主要材料</dt><dd>${mat(order.material).name}</dd></div><div><dt>家具尺寸 / mm</dt><dd class="mono">${order.dimensions.width} × ${order.dimensions.depth} × ${order.dimensions.height}</dd></div><div><dt>预计交付</dt><dd><time>${order.due}</time></dd></div><div><dt>订单金额</dt><dd class="price">${money(order.price)}</dd></div><div><dt>数量</dt><dd>${order.quantity} 件</dd></div><div><dt>项目负责人</dt><dd>${people[order.owner]?.name||'林可'}</dd></div></dl><section class="detail-section"><h3>定制备注</h3><p>${escapeHTML(order.note||'暂无补充说明。')}</p></section><section class="detail-section"><h3><label for="order-stage-select">订单阶段</label></h3><select id="order-stage-select">${stages.map(s=>`<option value="${s.id}" ${s.id===order.status?'selected':''}>${s.name}</option>`).join('')}</select></section><section class="detail-section"><h3>最新记录</h3><div class="activity">${avatar(order.owner)}<p>${people[order.owner]?.name||'林可'} 正在跟进此订单<time>当前阶段：${stage(order.status).name}</time></p></div><div class="activity">${avatar(0)}<p>材料与尺寸可在定制工作台中调整<time>变更仅保存在当前浏览器</time></p></div></section></div><footer class="drawer-footer"><button class="btn" data-order-chat="${order.id}">${icon('messages')}客户沟通</button><button class="btn btn-primary" data-edit-order="${order.id}">${icon('ruler-measure')}进入定制工作台</button></footer></section></div>`;
    $('#order-stage-select').addEventListener('change',event=>{changeStatus(id,event.target.value);openOrder(id);});
    $('.drawer .icon-button').focus();
  }
  function openFilters() {
    openModal(modalHead('筛选订单')+`<p class="dialog-description">组合筛选负责人和家具类型。</p><form id="filter-form"><div class="form-grid"><div class="field"><label for="filter-owner">负责人</label><select id="filter-owner" name="owner"><option value="all">所有成员</option>${people.map((p,i)=>`<option value="${i}" ${String(i)===state.filter.owner?'selected':''}>${p.name}</option>`).join('')}</select></div><div class="field"><label for="filter-type">家具类型</label><select id="filter-type" name="type">${[['all','全部类型'],['table','桌几'],['chair','座椅'],['cabinet','柜架'],['sofa','沙发'],['bed','床']].map(([id,title])=>`<option value="${id}" ${id===state.filter.type?'selected':''}>${title}</option>`).join('')}</select></div></div><div class="dialog-actions"><button type="button" class="btn" data-action="reset-filter">清除筛选</button><button class="btn btn-primary" type="submit">应用筛选</button></div></form>`);
    $('#filter-form').addEventListener('submit',event=>{event.preventDefault();state.filter=Object.fromEntries(new FormData(event.target));closeModal();renderOrders();});
  }
  function downloadFile(name,content,type) {
    const url=URL.createObjectURL(new Blob([content],{type}));const link=document.createElement('a');link.href=url;link.download=name;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  function exportOrders() {
    const cell=value=>`"${String(value).replace(/^[=+\-@]/,"'$&").replaceAll('"','""')}"`;
    const rows=[['订单编号','家具名称','客户','材料','阶段','交付日期','负责人','金额'],...filteredOrders().map(o=>[o.id,o.title,o.client,mat(o.material).name,stage(o.status).name,o.due,people[o.owner]?.name||'林可',o.price])];
    downloadFile('木序-定制订单.csv','\uFEFF'+rows.map(row=>row.map(cell).join(',')).join('\r\n'),'text/csv;charset=utf-8');toast('已导出当前筛选的订单');
  }
  function renderWorkbench() {
    cleanupView?.();cleanupView=null;
    const order=currentOrder();
    state.drafts ||= {};
    const draft=state.drafts[order.id] ||= {dimensions:{...order.dimensions},material:order.material};
    const titles={materials:['材料库','从一块好木材开始，为家具找到合适的质感。'],dimensions:['尺寸编辑器','让比例刚刚好，让家具适合真实的生活。'],preview:['效果预览','换一个角度，看看材料与比例相遇的样子。']};
    const [title,description]=titles[state.view];
    main.innerHTML=pageHead(title,description,`<select class="order-selector" id="workbench-order" aria-label="选择编辑的订单">${state.orders.map(o=>`<option value="${o.id}" ${order.id===o.id?'selected':''}>${o.id} / ${escapeHTML(o.title)}</option>`).join('')}</select>`) +
      `<div class="workbench view-enter"><section class="panel material-panel"><h2 class="panel-title">材料样板</h2><p class="panel-caption">点击选用，或拖到家具上</p><div class="material-tabs" role="tablist" aria-label="材料类别">${[['wood','木材'],['fabric','面料'],['stone','石材']].map(([id,label])=>`<button class="chip ${state.materialCategory===id?'active':''}" data-material-category="${id}" role="tab" aria-selected="${state.materialCategory===id}">${label}</button>`).join('')}</div><div class="material-grid" id="material-grid"></div><p class="material-tip">${icon('hand-move')}真实材质以实物样板为准。</p></section><section class="panel stage-panel"><div class="stage-toolbar"><strong>${escapeHTML(order.title)}</strong><span class="tag">${state.view==='dimensions'?'尺寸视图':'立体视图'}</span></div><div class="canvas-wrap" id="model-stage"><canvas id="furniture-canvas" tabindex="0" aria-label="家具立体模型，可拖拽旋转、滚轮缩放；键盘左右箭头旋转，加减键缩放。尺寸视图中可拖动绿色尺寸端点。"></canvas></div><p class="model-label" id="model-instruction">${state.view==='dimensions'?'拖动绿色端点调整尺寸，拖动空白旋转':'按住拖动旋转 · 滚轮缩放'}</p><div class="stage-controls"><button class="icon-button" data-model="rotate-left" aria-label="向左旋转">${icon('rotate-2')}</button><button class="icon-button" data-model="rotate-right" aria-label="向右旋转">${icon('rotate-clockwise-2')}</button><span class="divider"></span><button class="icon-button" data-model="zoom-out" aria-label="缩小">${icon('minus')}</button><span class="zoom-label" id="zoom-value">100%</span><button class="icon-button" data-model="zoom-in" aria-label="放大">${icon('plus')}</button><span class="divider"></span><button class="icon-button" data-model="reset" aria-label="重置视角">${icon('focus-centered')}</button><button class="icon-button" data-model="dimensions" aria-label="显示或隐藏尺寸标注" aria-pressed="${state.view==='dimensions'}">${icon('ruler-measure')}</button></div></section><section class="panel inspector"><h2 class="panel-title">尺寸与材质</h2><p class="panel-caption">单位：毫米 / mm</p>${[['width','长度',400,3000],['depth','深度',300,2400],['height','高度',350,2200]].map(([key,label,min,max])=>`<div class="dimension-control"><label for="dim-${key}">${label}<span><input type="number" id="dim-${key}" data-dim-number="${key}" min="${min}" max="${max}" step="10" value="${draft.dimensions[key]}" aria-label="${label}，毫米">mm</span></label><input type="range" data-dim-range="${key}" min="${min}" max="${max}" step="10" value="${draft.dimensions[key]}" aria-label="拖动调整${label}"><div class="range-labels"><span>${min}</span><span>${max}</span></div></div>`).join('')}<div class="inspector-section"><h3 class="panel-title">当前材料</h3><div class="material-selected" id="selected-material"></div></div><button class="btn btn-primary" id="save-design">${icon('check')}保存定制方案</button><p class="inspector-hint">此处展示家具比例与材质示意。生产以确认后的工艺图纸为准。</p></section></div>`;
    $('#workbench-order').addEventListener('change',event=>{state.selected=event.target.value;renderWorkbench();});
    const renderer=createFurnitureRenderer($('#furniture-canvas'),order.type,draft,state.view==='dimensions',updateDimension);
    cleanupView=renderer.destroy;
    function updateMaterialDisplay() {
      const material=mat(draft.material);
      $('#selected-material').innerHTML=`<span class="texture ${material.category==='fabric'?'fabric':material.category==='stone'?'stone':''}" style="--wood:${material.color}"></span><span><strong>${material.name}</strong><small>可用库存 ${material.stock}</small></span>`;
      $$('.material-tile').forEach(tile=>{tile.classList.toggle('active',tile.dataset.material===draft.material);tile.setAttribute('aria-pressed',tile.dataset.material===draft.material);});
    }
    function selectMaterial(id) {
      if(!materials.some(m=>m.id===id))return;
      draft.material=id;renderer.render();updateMaterialDisplay();toast(`已应用${mat(id).name}，保存后同步至订单`);
    }
    function renderMaterials() {
      $('#material-grid').innerHTML=materials.filter(m=>m.category===state.materialCategory).map(m=>`<button class="material-tile ${m.id===draft.material?'active':''}" data-material="${m.id}" draggable="true" aria-label="应用${m.name}" aria-pressed="${m.id===draft.material}"><span class="texture ${m.category==='fabric'?'fabric':m.category==='stone'?'stone':''}" style="--wood:${m.color}"></span><strong>${m.name}</strong><small>${m.stock}</small></button>`).join('');
      $$('.material-tile').forEach(tile=>{
        tile.addEventListener('click',()=>selectMaterial(tile.dataset.material));
        tile.addEventListener('dragstart',event=>{event.dataTransfer.setData('text/plain',`material:${tile.dataset.material}`);event.dataTransfer.effectAllowed='copy';});
      });
    }
    $$('[data-material-category]').forEach(button=>button.addEventListener('click',()=>{state.materialCategory=button.dataset.materialCategory;$$('[data-material-category]').forEach(b=>{b.classList.toggle('active',b===button);b.setAttribute('aria-selected',b===button);});renderMaterials();}));
    const drop=$('#model-stage');
    drop.addEventListener('dragover',event=>{event.preventDefault();event.dataTransfer.dropEffect='copy';drop.classList.add('drag-over');});
    drop.addEventListener('dragleave',event=>{if(!drop.contains(event.relatedTarget))drop.classList.remove('drag-over');});
    drop.addEventListener('drop',event=>{event.preventDefault();drop.classList.remove('drag-over');const data=event.dataTransfer.getData('text/plain');if(data.startsWith('material:'))selectMaterial(data.slice(9));});
    function updateDimension(key,value) {
      const input=$(`[data-dim-number="${key}"]`);if(!input||!Number.isFinite(value))return;
      value=Math.max(Number(input.min),Math.min(Number(input.max),Math.round(value/10)*10));
      draft.dimensions[key]=value;input.value=value;$(`[data-dim-range="${key}"]`).value=value;renderer.render();
    }
    $$('[data-dim-range]').forEach(input=>input.addEventListener('input',()=>updateDimension(input.dataset.dimRange,Number(input.value))));
    $$('[data-dim-number]').forEach(input=>input.addEventListener('change',()=>updateDimension(input.dataset.dimNumber,Number(input.value))));
    $$('[data-model]').forEach(button=>button.addEventListener('click',()=>{renderer.control(button.dataset.model);if(button.dataset.model==='dimensions')button.setAttribute('aria-pressed',renderer.dimensionsVisible());}));
    $('#save-design').addEventListener('click',()=>{order.dimensions={...draft.dimensions};order.material=draft.material;save();toast('材料与尺寸已保存至当前订单');});
    renderMaterials();updateMaterialDisplay();
  }
  // Painter-sorted, orthographically projected furniture geometry; no external rendering dependency.
  function createFurnitureRenderer(canvas,type,draft,dimensions,onDimension) {
    const ctx=canvas.getContext('2d');
    let theta=-.64,pitch=.35,zoom=1,showDimensions=dimensions,drag=null,handles=[],frame=0,width=0,height=0,scale=1;
    const baseColor=()=>mat(draft.material).color;
    const shade=(hex,factor)=>{const n=parseInt(hex.slice(1),16);return `rgb(${Math.min(255,Math.round((n>>16)*factor))},${Math.min(255,Math.round((n>>8&255)*factor))},${Math.min(255,Math.round((n&255)*factor))})`;};
    function project(point) {
      const [x,y,z]=point,rx=x*Math.cos(theta)+z*Math.sin(theta),rz=-x*Math.sin(theta)+z*Math.cos(theta);
      return {x:width*.5+rx*scale,y:height*.63-(y*Math.cos(pitch)-rz*Math.sin(pitch))*scale,depth:rz*Math.cos(pitch)+y*Math.sin(pitch)};
    }
    function drawPolygon(points,fill,stroke='') {
      if(!points.length)return;ctx.beginPath();ctx.moveTo(points[0].x,points[0].y);points.slice(1).forEach(p=>ctx.lineTo(p.x,p.y));ctx.closePath();ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=.65;ctx.stroke();}
    }
    function render() { cancelAnimationFrame(frame);frame=requestAnimationFrame(draw); }
    function draw() {
      const box=canvas.getBoundingClientRect();width=box.width;height=box.height;if(!width||!height)return;
      const ratio=Math.min(window.devicePixelRatio||1,2);if(canvas.width!==Math.round(width*ratio)||canvas.height!==Math.round(height*ratio)){canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);}ctx.setTransform(ratio,0,0,ratio,0,0);ctx.clearRect(0,0,width,height);
      const w=draft.dimensions.width/1000,d=draft.dimensions.depth/1000,h=draft.dimensions.height/1000;
      scale=Math.min(width/Math.max(w+d*.55,2.7)*.76,height/Math.max(h+d*.45,1.7)*.73)*zoom;
      // A quiet ground grid gives the furniture a stable spatial reference.
      ctx.strokeStyle='#a5b09927';ctx.lineWidth=.6;
      for(let i=-5;i<=5;i++){const k=i*.5;for(const ends of [[[-2.5,0,k],[2.5,0,k]],[[k,0,-2.5],[k,0,2.5]]]){const a=project(ends[0]),b=project(ends[1]);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();}}
      const center=project([0,0,0]);ctx.save();ctx.translate(center.x,center.y);ctx.scale(1,.24);const shadow=ctx.createRadialGradient(0,0,10,0,0,Math.max(w,d)*scale*.66);shadow.addColorStop(0,'#48503c28');shadow.addColorStop(1,'#48503c00');ctx.fillStyle=shadow;ctx.beginPath();ctx.arc(0,0,Math.max(w,d)*scale*.66,0,Math.PI*2);ctx.fill();ctx.restore();
      const faces=[];
      function cuboid(x,y,z,cw,ch,cd,color=baseColor(),grain=true) {
        const v=[[x-cw/2,y,z-cd/2],[x+cw/2,y,z-cd/2],[x+cw/2,y+ch,z-cd/2],[x-cw/2,y+ch,z-cd/2],[x-cw/2,y,z+cd/2],[x+cw/2,y,z+cd/2],[x+cw/2,y+ch,z+cd/2],[x-cw/2,y+ch,z+cd/2]];
        const definitions=[[[0,1,2,3],.79],[[4,7,6,5],.94],[[0,3,7,4],.7],[[1,5,6,2],.85],[[3,2,6,7],1.12],[[0,4,5,1],.62]];
        definitions.forEach(([indices,light],index)=>{const points=indices.map(i=>project(v[i]));faces.push({points,color:shade(color,light),depth:points.reduce((s,p)=>s+p.depth,0)/4,grain:grain&&index===4,vertical:grain&&[0,1].includes(index)});});
      }
      const legColor=['fabric','stone'].includes(mat(draft.material).category)?'#846544':baseColor();
      if(type==='cabinet') {
        const legs=.17,body=h-legs;
        [[-w*.4,-d*.34],[w*.4,-d*.34],[-w*.4,d*.34],[w*.4,d*.34]].forEach(([x,z])=>cuboid(x,0,z,.065,legs,.065,legColor));
        cuboid(0,legs,0,w,body,d);cuboid(0,h-.04,0,w+.025,.045,d+.025);
        const doors=Math.max(2,Math.round(w/.6));for(let i=0;i<doors;i++){const x=-w/2+(i+.5)*w/doors;cuboid(x,legs+.045,d/2+.009,w/doors-.013,body-.09,.027);cuboid(x+w/doors*.33,legs+body*.66,d/2+.029,.023,.12,.025,'#525344',false);}
      } else if(type==='sofa') {
        [[-w*.4,-d*.34],[w*.4,-d*.34],[-w*.4,d*.34],[w*.4,d*.34]].forEach(([x,z])=>cuboid(x,0,z,.07,.18,.07,legColor));
        cuboid(0,.15,0,w,.13,d,legColor);cuboid(0,.28,-d*.38,w,h-.28,d*.22);
        const seats=3;for(let i=0;i<seats;i++)cuboid(-w/2+w/seats*(i+.5),.28,d*.03,w/seats-.02,.19,d*.69);
        cuboid(-w*.47,.27,.02,w*.09,h*.53,d*.91);cuboid(w*.47,.27,.02,w*.09,h*.53,d*.91);
      } else if(type==='chair') {
        const seat=h*.49;
        [[-w*.36,-d*.33],[w*.36,-d*.33],[-w*.36,d*.33],[w*.36,d*.33]].forEach(([x,z])=>cuboid(x,0,z,.048,seat,.048,legColor));
        cuboid(0,seat,0,w*.93,.065,d*.86);cuboid(-w*.4,seat,-d*.34,.045,h-seat,.05,legColor);cuboid(w*.4,seat,-d*.34,.045,h-seat,.05,legColor);cuboid(0,h*.77,-d*.34,w*.88,h*.23,.065);cuboid(-w*.45,h*.61,0,.065,.04,d*.8);cuboid(w*.45,h*.61,0,.065,.04,d*.8);
      } else if(type==='bed') {
        const base=h*.27;cuboid(0,.09,0,w,base,d,legColor);cuboid(0,base+.09,.025,w*.96,h*.2,d*.94,'#dedbd0',false);cuboid(0,.05,-d/2,w+.04,h,.07,legColor);
        cuboid(-w*.23,base+h*.28,-d*.31,w*.38,.1,d*.18,'#e9e5d9',false);cuboid(w*.23,base+h*.28,-d*.31,w*.38,.1,d*.18,'#e9e5d9',false);
      } else {
        const thick=.052;[[-w*.41,-d*.34],[w*.41,-d*.34],[-w*.41,d*.34],[w*.41,d*.34]].forEach(([x,z])=>cuboid(x,0,z,.065,h-thick,.065,legColor));
        cuboid(0,h-.14,-d*.35,w*.85,.1,.035,legColor);cuboid(0,h-.14,d*.35,w*.85,.1,.035,legColor);cuboid(-w*.42,h-.14,0,.04,.1,d*.72,legColor);cuboid(w*.42,h-.14,0,.04,.1,d*.72,legColor);cuboid(0,h-thick,0,w,thick,d);
      }
      faces.sort((a,b)=>a.depth-b.depth).forEach(face=>{
        drawPolygon(face.points,face.color,'#3d33221b');
        if((face.grain||face.vertical)&&mat(draft.material).category==='wood') {
          const [a,b,c,e]=face.points;ctx.save();ctx.beginPath();ctx.moveTo(a.x,a.y);face.points.slice(1).forEach(p=>ctx.lineTo(p.x,p.y));ctx.closePath();ctx.clip();ctx.strokeStyle='#3b2d1c20';ctx.lineWidth=.5;
          for(let i=1;i<27;i++){const t=i/27;ctx.beginPath();ctx.moveTo(a.x+(e.x-a.x)*t,a.y+(e.y-a.y)*t);const ex=b.x+(c.x-b.x)*t,ey=b.y+(c.y-b.y)*t;ctx.quadraticCurveTo((a.x+(e.x-a.x)*t+ex)/2,(a.y+(e.y-a.y)*t+ey)/2+Math.sin(i*2)*1.2,ex,ey);ctx.stroke();}ctx.restore();
        }
      });
      handles=[];
      if(showDimensions) {
        const lines=[['width',[-w/2,0,d/2+.18],[w/2,0,d/2+.18]],['depth',[w/2+.2,0,-d/2],[w/2+.2,0,d/2]],['height',[-w/2-.16,0,-d/2],[-w/2-.16,h,-d/2]]];
        lines.forEach(([key,from,to])=>{
          const a=project(from),b=project(to);ctx.strokeStyle='#627c54';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
          for(const p of [a,b]){ctx.beginPath();ctx.arc(p.x,p.y,4,0,Math.PI*2);ctx.fillStyle='#f9faf4';ctx.fill();ctx.stroke();}
          const label=String(draft.dimensions[key]),mx=(a.x+b.x)/2,my=(a.y+b.y)/2;ctx.font='10px "IBM Plex Mono", monospace';const tw=ctx.measureText(label).width;ctx.fillStyle='#eceee7';ctx.fillRect(mx-tw/2-5,my-9,tw+10,17);ctx.fillStyle='#456037';ctx.textAlign='center';ctx.fillText(label,mx,my+3);
          handles.push({key,x:b.x,y:b.y,axisX:b.x-a.x,axisY:b.y-a.y,startValue:draft.dimensions[key]});
        });
      }
      ctx.font='9px "DM Sans", sans-serif';ctx.textAlign='left';ctx.fillStyle='#6d7965';ctx.fillText('比例示意',14,height-12);
      const z=$('#zoom-value');if(z)z.textContent=`${Math.round(zoom*100)}%`;
    }
    const localPoint=event=>{const r=canvas.getBoundingClientRect();return{x:event.clientX-r.left,y:event.clientY-r.top};};
    function pointerDown(event) {
      if(event.button!==0)return;const p=localPoint(event);const handle=handles.find(h=>Math.hypot(h.x-p.x,h.y-p.y)<17);
      drag={x:p.x,y:p.y,theta,pitch,handle:handle?{...handle}:null};canvas.setPointerCapture(event.pointerId);
    }
    function pointerMove(event) {
      const p=localPoint(event);
      if(!drag){canvas.style.cursor=handles.some(h=>Math.hypot(h.x-p.x,h.y-p.y)<17)?'ew-resize':'grab';return;}
      if(drag.handle){const h=drag.handle;const amount=((p.x-drag.x)*h.axisX+(p.y-drag.y)*h.axisY)/Math.max(1,h.axisX*h.axisX+h.axisY*h.axisY);onDimension(h.key,h.startValue*(1+amount));}
      else {theta=drag.theta+(p.x-drag.x)*.009;pitch=Math.max(.1,Math.min(1.05,drag.pitch+(p.y-drag.y)*.006));render();}
    }
    function pointerUp(){drag=null;}
    function wheel(event){event.preventDefault();zoom=Math.max(.6,Math.min(1.65,zoom-event.deltaY*.001));render();}
    function control(action){if(action==='rotate-left')theta-=.28;if(action==='rotate-right')theta+=.28;if(action==='zoom-in')zoom=Math.min(1.65,zoom+.1);if(action==='zoom-out')zoom=Math.max(.6,zoom-.1);if(action==='reset'){theta=-.64;pitch=.35;zoom=1;}if(action==='dimensions')showDimensions=!showDimensions;render();}
    function keydown(event){const actions={ArrowLeft:'rotate-left',ArrowRight:'rotate-right','+':'zoom-in','=':'zoom-in','-':'zoom-out','0':'reset'};if(actions[event.key]){event.preventDefault();control(actions[event.key]);}}
    canvas.addEventListener('pointerdown',pointerDown);canvas.addEventListener('pointermove',pointerMove);canvas.addEventListener('pointerup',pointerUp);canvas.addEventListener('pointercancel',pointerUp);canvas.addEventListener('lostpointercapture',pointerUp);canvas.addEventListener('wheel',wheel,{passive:false});canvas.addEventListener('keydown',keydown);
    const observer=new ResizeObserver(render);observer.observe(canvas);render();
    return {render,control,dimensionsVisible:()=>showDimensions,destroy(){cancelAnimationFrame(frame);observer.disconnect();canvas.removeEventListener('pointerdown',pointerDown);canvas.removeEventListener('pointermove',pointerMove);canvas.removeEventListener('pointerup',pointerUp);canvas.removeEventListener('pointercancel',pointerUp);canvas.removeEventListener('lostpointercapture',pointerUp);canvas.removeEventListener('wheel',wheel);canvas.removeEventListener('keydown',keydown);}};
  }
  function renderProduction() {
    main.innerHTML=pageHead('生产排期','让每一道工序有序衔接，让每一次交付如约而至。',`<button class="btn btn-primary" data-action="add-schedule">${icon('plus')}安排生产</button>`) +
      `<div class="scroll-content view-enter"><div class="panel production-summary"><div>生产中的订单 <strong>${state.orders.filter(o=>o.status==='production').length}</strong></div><div>待生产 <strong>${state.orders.filter(o=>o.status==='waiting').length}</strong></div><div class="legend"><span><b class="legend-dot"></b>木作与组装</span><span><b class="legend-dot blue"></b>涂装与备料</span></div></div><section class="panel schedule-container"><div class="schedule-top"><div><h2>${dateShort(isoDate(state.scheduleOffset))}至${dateShort(isoDate(state.scheduleOffset+9))}</h2><span>生产工序 / 10 日排期</span></div><div class="control-group"><button class="icon-button" data-schedule-shift="-7" aria-label="查看前七天">${icon('chevron-left')}</button><button class="btn" data-action="schedule-today">今天</button><button class="icon-button" data-schedule-shift="7" aria-label="查看后七天">${icon('chevron-right')}</button></div></div><div class="schedule-grid"><div class="schedule-header" style="text-align:left">定制订单 / 工位</div>${Array.from({length:10},(_,i)=>`<div class="schedule-header ${state.scheduleOffset+i===0?'today':''}">${isoDate(state.scheduleOffset+i).slice(5).replace('-','/')}</div>`).join('')}${state.tasks.map((task,index)=>{
        const order=state.orders.find(o=>o.id===task.order),start=task.start-state.scheduleOffset,visibleStart=Math.max(0,start),visibleEnd=Math.min(10,start+task.duration);
        return `<div class="schedule-label">${escapeHTML(order?.title||task.order)}<small>${escapeHTML(task.worker)}</small></div><div class="schedule-track" data-track="${index}">${visibleEnd>visibleStart?`<button class="schedule-bar ${task.tone==='blue'?'blue':''}" data-task="${index}" style="left:calc(${visibleStart*10}% + 3px);width:calc(${(visibleEnd-visibleStart)*10}% - 6px)" title="${escapeHTML(task.name)}：${dateShort(isoDate(task.start))}开始，${task.duration}天。拖动或方向键调整日期。" aria-label="${escapeHTML(order?.title||task.order)}的${escapeHTML(task.name)}，${dateShort(isoDate(task.start))}开始，${task.duration}天，左右箭头调整日期">${escapeHTML(task.name)}</button>`:''}</div>`;
      }).join('')}</div><p class="schedule-hint">${icon('hand-move')}左右拖动工序调整开始日期，也可选中后使用方向键。点按工序查看详情。</p></section></div>`;
    let dragged=false;
    $$('[data-task]').forEach(bar=>{
      const task=state.tasks[Number(bar.dataset.task)];let drag=null;
      bar.addEventListener('pointerdown',event=>{if(event.button!==0)return;drag={x:event.clientX,start:task.start,width:bar.parentElement.clientWidth,delta:0};dragged=false;bar.setPointerCapture(event.pointerId);});
      bar.addEventListener('pointermove',event=>{if(!drag)return;const dx=event.clientX-drag.x;if(Math.abs(dx)>4)dragged=true;drag.delta=Math.round(dx/(drag.width/10));bar.style.transform=`translateX(${drag.delta*drag.width/10}px)`;bar.classList.add('dragging');});
      bar.addEventListener('pointerup',()=>{if(!drag)return;const next=drag.start+drag.delta;drag=null;if(dragged){task.start=next;save();renderProduction();toast(`工序已调整至 ${dateShort(isoDate(next))}开始`);}else{bar.classList.remove('dragging');openTask(Number(bar.dataset.task));}});
      const cancel=()=>{drag=null;bar.style.transform='';bar.classList.remove('dragging');};bar.addEventListener('pointercancel',cancel);bar.addEventListener('lostpointercapture',cancel);
      bar.addEventListener('keydown',event=>{if(['ArrowLeft','ArrowRight'].includes(event.key)){event.preventDefault();task.start+=event.key==='ArrowLeft'?-1:1;save();renderProduction();$(`[data-task="${bar.dataset.task}"]`)?.focus();toast(`工序开始日期：${dateShort(isoDate(task.start))}`);}else if(event.key==='Enter'){event.preventDefault();openTask(Number(bar.dataset.task));}});
    });
  }
  function openTask(index) {
    const task=state.tasks[index],order=state.orders.find(o=>o.id===task.order);
    openModal(modalHead('调整生产工序')+`<p class="dialog-description">${escapeHTML(order?.title||task.order)} / ${task.order}</p><form id="task-form"><div class="form-grid"><div class="field full"><label for="task-name">工序名称</label><input id="task-name" name="name" required maxlength="30" value="${escapeHTML(task.name)}"></div><div class="field"><label for="task-date">开始日期</label><input id="task-date" name="date" type="date" value="${isoDate(task.start)}" required></div><div class="field"><label for="task-duration">预计工期 / 天</label><input id="task-duration" name="duration" type="number" min="1" max="30" value="${task.duration}" required></div><div class="field full"><label for="task-worker">生产工位</label><input id="task-worker" name="worker" required maxlength="30" value="${escapeHTML(task.worker)}"></div></div><div class="dialog-actions"><button type="button" class="btn" data-action="close">取消</button><button class="btn btn-primary" type="submit">保存排期</button></div></form>`);
    $('#task-form').addEventListener('submit',event=>{event.preventDefault();const data=Object.fromEntries(new FormData(event.target));if(!data.name.trim()||!data.worker.trim())return;task.name=data.name.trim();task.worker=data.worker.trim();task.duration=Number(data.duration);task.start=Math.round((Date.parse(data.date+'T00:00:00Z')-Date.UTC(2026,9,14))/86400000);save();closeModal();renderProduction();toast('生产排期已保存在本地');});
  }
  function addSchedule() {
    const eligible=state.orders.filter(o=>['waiting','production'].includes(o.status));
    openModal(modalHead('安排生产')+`<p class="dialog-description">为待生产的家具分配工序与工位。</p><form id="schedule-form"><div class="form-grid"><div class="field full"><label for="schedule-order">定制订单</label><select id="schedule-order" name="order">${eligible.map(o=>`<option value="${o.id}">${o.id} / ${escapeHTML(o.title)}</option>`).join('')}</select></div><div class="field full"><label for="schedule-name">工序名称</label><input id="schedule-name" name="name" placeholder="例如：精细打磨" required maxlength="30"></div><div class="field"><label for="schedule-date">开始日期</label><input id="schedule-date" name="date" type="date" value="2026-10-15" required></div><div class="field"><label for="schedule-duration">工期 / 天</label><input id="schedule-duration" name="duration" type="number" min="1" max="30" value="3" required></div><div class="field full"><label for="schedule-worker">工位</label><select id="schedule-worker" name="worker"><option>木工 A 组</option><option>木工 B 组</option><option>木工 C 组</option><option>涂装 B 组</option><option>备料组</option></select></div></div><div class="dialog-actions"><button type="button" class="btn" data-action="close">取消</button><button class="btn btn-primary" type="submit" ${eligible.length?'':'disabled'}>加入排期</button></div></form>`);
    $('#schedule-form').addEventListener('submit',event=>{event.preventDefault();const data=Object.fromEntries(new FormData(event.target));if(!data.name.trim()||!data.order)return;const start=Math.round((Date.parse(data.date+'T00:00:00Z')-Date.UTC(2026,9,14))/86400000);state.tasks.push({order:data.order,name:data.name.trim(),worker:data.worker,start,duration:Number(data.duration),tone:data.worker.includes('木工')?'green':'blue'});state.scheduleOffset=start<0||start>9?start:0;save();closeModal();renderProduction();toast('工序已加入本地排期');});
  }
  const deliveryLabels=['质检完成','保护包装','运输配送','上门安装','客户签收'];
  function renderDelivery() {
    const orders=state.orders.filter(o=>['delivery','completed'].includes(o.status));
    main.innerHTML=pageHead('交付追踪','从工坊到家，把最后一段路也照顾周全。',`<span class="tag blue">${state.orders.filter(o=>o.status==='delivery').length} 件家具等待抵达</span>`) +
      `<div class="scroll-content view-enter"><div class="delivery-list">${orders.map(o=>`<article class="panel delivery-card"><div class="delivery-top"><img src="${photo(o.image,260)}" alt="${escapeHTML(o.title)}"><div><h3>${escapeHTML(o.title)}</h3><p>${o.id} / ${escapeHTML(o.client)}</p><span class="tag ${o.status==='completed'?'green':'blue'}">${o.status==='completed'?'已签收':deliveryLabels[Math.min(o.deliveryStep||0,4)]}</span></div></div><div class="delivery-steps" aria-label="交付进度">${deliveryLabels.map((label,i)=>`<div class="delivery-step ${i<=(o.deliveryStep||0)?'done':''}"><span class="step-circle">${i<=(o.deliveryStep||0)?icon('check'):i+1}</span>${label}</div>`).join('')}</div><div class="delivery-address"><strong>${escapeHTML(o.client)}</strong>　${escapeHTML(o.address||o.place)}<p>${icon('calendar-event')} ${o.status==='completed'?'签收日期':'预约日期'}：<time>${o.due}</time>${o.deliveryTime?' / '+escapeHTML(o.deliveryTime):' / 待确认时段'}</p></div><div class="delivery-footer"><span>${o.status==='completed'?'交付记录已归档':'负责人：'+(people[o.owner]?.name||'林可')}</span><div class="control-group">${o.status!=='completed'?`<button class="btn" data-appointment="${o.id}">预约</button><button class="btn btn-primary" data-delivery-progress="${o.id}">更新进度</button>`:`<button class="btn" data-order="${o.id}">查看订单</button>`}</div></div></article>`).join('')}</div>${!orders.length?`<div class="empty">${icon('truck-delivery')}还没有进入交付阶段的订单。</div>`:''}</div>`;
  }
  function openAppointment(id) {
    const order=state.orders.find(o=>o.id===id);if(!order)return;
    openModal(modalHead('预约上门交付')+`<p class="dialog-description">${escapeHTML(order.title)} / ${escapeHTML(order.client)}</p><form id="appointment-form"><div class="form-grid"><div class="field"><label for="appointment-date">交付日期</label><input id="appointment-date" name="date" type="date" value="${order.due}" required></div><div class="field"><label for="appointment-time">上门时段</label><select id="appointment-time" name="time">${['09:00–12:00','13:00–16:00','16:00–19:00'].map(t=>`<option ${order.deliveryTime===t?'selected':''}>${t}</option>`).join('')}</select></div><div class="field full"><label for="appointment-address">交付地址</label><input id="appointment-address" name="address" required maxlength="150" value="${escapeHTML(order.address||order.place)}"></div></div><p class="inspector-hint">预约记录保存在本地，需由负责人另外与客户确认。</p><div class="dialog-actions"><button class="btn" type="button" data-action="close">取消</button><button class="btn btn-primary" type="submit">保存预约</button></div></form>`);
    $('#appointment-form').addEventListener('submit',event=>{event.preventDefault();const data=Object.fromEntries(new FormData(event.target));if(!data.address.trim())return;order.due=data.date;order.deliveryTime=data.time;order.address=data.address.trim();save();closeModal();renderDelivery();toast('已保存本地交付预约');});
  }
  function openDeliveryProgress(id) {
    const order=state.orders.find(o=>o.id===id);if(!order)return;
    openModal(modalHead('更新交付节点')+`<p class="dialog-description">${escapeHTML(order.title)} / ${escapeHTML(order.client)}</p><form id="delivery-progress-form"><div class="field"><label for="delivery-step">当前已完成的节点</label><select id="delivery-step" name="step">${deliveryLabels.map((label,i)=>`<option value="${i}" ${i===(order.deliveryStep||0)?'selected':''}>${label}</option>`).join('')}</select></div><p class="inspector-hint">选择客户签收后，该本地订单将归入已完成。</p><div class="dialog-actions"><button class="btn" type="button" data-action="close">取消</button><button class="btn btn-primary" type="submit">保存进度</button></div></form>`);
    $('#delivery-progress-form').addEventListener('submit',event=>{event.preventDefault();order.deliveryStep=Number(new FormData(event.target).get('step'));order.status=order.deliveryStep===4?'completed':'delivery';order.badge=deliveryLabels[order.deliveryStep];if(order.deliveryStep===4)order.urgent=false;save();closeModal();renderDelivery();toast('本地交付记录已更新');});
  }
  const craftSteps=[
    ['选材与开料','对齐木纹走向，避开活结与开裂区域。含水率控制在 8%–12%，按确认尺寸预留加工余量。'],
    ['榫卯加工','受力连接采用榫卯结构，拼接面完整贴合。试装后核对对角线，保证结构方正、稳固。'],
    ['精细打磨','依次使用 120 / 180 / 240 目砂纸。边角做圆润处理，所有可触及表面应平滑、无毛刺。'],
    ['表面处理','木材表面使用透明木蜡油，保留天然纹理。薄涂两遍，按材料工艺要求充分干燥。'],
    ['组装与品检','复核整体尺寸、连接强度和表面效果，清洁后做成品保护。外观和包装检查完成后进入交付。']
  ];
  const craftChecks=['尺寸与确认图纸一致','榫卯连接牢固，无松动','表面均匀，无明显划痕','边角、五金与包装检查完成'];
  function renderCraft() {
    const choices=state.orders.filter(o=>o.status!=='completed');
    const order=choices.find(o=>o.id===state.craftSelected)||choices[0];
    if(!order){main.innerHTML=pageHead('工艺卡','把设计中的讲究，落实到制作的每一步。')+`<div class="empty">${icon('file-check')}当前没有制作中的订单。</div>`;return;}
    state.craftSelected=order.id;
    const checks=state.checks[order.id]||[];
    main.innerHTML=pageHead('工艺卡','把设计中的讲究，落实到制作的每一步。',`<button class="btn" data-action="export-craft">${icon('download')}导出工艺卡</button>`) +
      `<div class="craft-layout view-enter"><aside class="panel craft-list" aria-label="订单工艺卡">${choices.map(o=>`<button class="craft-list-item ${o.id===order.id?'active':''}" data-craft-order="${o.id}">${icon('file-pencil')}<span><strong>${escapeHTML(o.title)}</strong><small>${o.id} / ${mat(o.material).short}</small></span></button>`).join('')}</aside><article class="panel craft-sheet"><div class="sheet-title"><h2>${escapeHTML(order.title)}</h2><span class="tag ${stage(order.status).tone}">${stage(order.status).name}</span></div><p class="sheet-meta">${order.id} / 负责人：${people[order.owner]?.name||'林可'}</p><div class="spec-row"><span>主要材料<strong>${mat(order.material).name}</strong></span><span>成品尺寸 / mm<strong class="mono">${order.dimensions.width} × ${order.dimensions.depth} × ${order.dimensions.height}</strong></span><span>数量<strong class="mono">${order.quantity}</strong></span></div><div class="craft-steps">${craftSteps.map(([title,description],i)=>`<section class="craft-step"><span class="craft-step-number">${String(i+1).padStart(2,'0')}</span><div><h3>${title}</h3><p>${i===3&&mat(order.material).category!=='wood'?'织物与石材使用对应材料的清洁和表面保护工艺，木质框架按木蜡油工艺处理。':description}</p></div></section>`).join('')}</div><div class="inspector-section"><div class="subhead"><h2>出厂检查</h2><span class="tag green" id="craft-check-count">${checks.length} / ${craftChecks.length} 已完成</span></div>${craftChecks.map((label,i)=>`<label class="craft-check"><input type="checkbox" data-craft-check="${i}" ${checks.includes(i)?'checked':''}>${label}</label>`).join('')}</div><div class="inspector-section"><h3 class="panel-title">特殊要求</h3><p class="panel-caption">${escapeHTML(order.note||'无补充要求。')}</p></div></article></div>`;
    $$('[data-craft-check]').forEach(input=>input.addEventListener('change',()=>{state.checks[order.id]=$$('[data-craft-check]:checked').map(el=>Number(el.dataset.craftCheck));$('#craft-check-count').textContent=`${state.checks[order.id].length} / ${craftChecks.length} 已完成`;save();}));
  }
  function exportCraft() {
    const o=state.orders.find(o=>o.id===state.craftSelected);if(!o)return;
    const text=[`木序家具定制工艺卡`,`${o.id} / ${o.title}`,`客户：${o.client}`,`材料：${mat(o.material).name}`,`尺寸：${o.dimensions.width} × ${o.dimensions.depth} × ${o.dimensions.height} mm`,`数量：${o.quantity}`,`交付：${o.due}`,'',...craftSteps.map(([t,d],i)=>`${i+1}. ${t}\n${d}`),'','出厂检查',...craftChecks.map((c,i)=>`${(state.checks[o.id]||[]).includes(i)?'[已检查]':'[待检查]'} ${c}`),'',`特殊要求：${o.note||'无'}`].join('\n');
    downloadFile(`${o.id}-工艺卡.txt`,text,'text/plain;charset=utf-8');toast('工艺卡已导出');
  }
  function renderMessages() {
    state.messages[state.chatSelected] ||= [];
    const order=state.orders.find(o=>o.id===state.chatSelected)||state.orders[0];state.chatSelected=order.id;
    const contacts=Object.keys(state.messages).filter(id=>state.orders.some(o=>o.id===id));
    main.innerHTML=pageHead('客户沟通','把需求聊清楚，让每一次确认都有记录。',`<span class="tag">本地对话演示</span>`) +
      `<div class="panel chat-layout view-enter"><aside class="conversation-list" aria-label="客户会话">${contacts.map((id,i)=>{const o=state.orders.find(o=>o.id===id),messages=state.messages[id],last=messages[messages.length-1];return `<button class="conversation-item ${id===order.id?'active':''}" data-chat-order="${id}"><img src="https://i.pravatar.cc/80?img=${[44,49,45,13][i%4]}" alt="${escapeHTML(o.client)}"><span><time>${last?.time||''}</time><strong>${escapeHTML(o.client)}</strong><small>${escapeHTML(last?.text||'开始记录客户需求')}</small></span></button>`;}).join('')}</aside><section class="chat-panel"><header class="chat-header"><div><h2>${escapeHTML(order.client)}</h2><p>${order.id} / ${escapeHTML(order.title)}</p></div><button class="btn" data-order="${order.id}">${icon('file-description')}关联订单</button></header><div class="chat-messages" id="chat-messages" role="log" aria-label="客户对话记录" aria-live="polite"></div><form class="chat-compose" id="chat-form"><label for="chat-text" class="sr-only">沟通内容</label><textarea id="chat-text" name="message" placeholder="记录回复、确认细节，或补充一份灵感…" maxlength="2000" required></textarea><div class="compose-actions"><span>仅记录在此浏览器，不会发送给客户</span><button class="btn btn-primary" type="submit">${icon('send')}添加记录</button></div></form></section></div>`;
    renderChatMessages();
    $('#chat-form').addEventListener('submit',event=>{event.preventDefault();const input=$('#chat-text'),text=input.value.trim();if(!text)return;state.messages[order.id].push({mine:true,text,time:new Date().toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit',hour12:false})});input.value='';save();renderChatMessages();toast('已添加到本地对话记录');});
    $('#chat-text').addEventListener('keydown',event=>{if(event.key==='Enter'&&(event.ctrlKey||event.metaKey)){event.preventDefault();$('#chat-form').requestSubmit();}});
  }
  function renderChatMessages() {
    const messages=state.messages[state.chatSelected]||[];
    $('#chat-messages').innerHTML=`<div class="chat-date">订单沟通记录</div>${messages.map(m=>`<div class="message ${m.mine?'mine':''}"><img src="https://i.pravatar.cc/80?img=${m.mine?47:44}" alt="${m.mine?'林可':'客户'}"><div class="message-bubble">${escapeHTML(m.text).replaceAll('\n','<br>')}<time>${escapeHTML(m.time)}</time></div></div>`).join('')}${!messages.length?'<div class="empty">从第一条需求记录开始。</div>':''}`;
    $('#chat-messages').scrollTop=$('#chat-messages').scrollHeight;
  }
  function showNotifications() {
    openModal(modalHead('工作提醒')+`<p class="dialog-description">今天需要留意的几件小事。</p><div class="notifications"><button class="notification" data-order="MJ-1008">${icon('truck-delivery')}<span><strong>午后休闲椅即将交付</strong><p>顾女士希望预约 10 月 16 日下午，请核对上门时间。</p></span></button><button class="notification" data-order="MJ-1028">${icon('ruler-measure')}<span><strong>餐桌尺寸等待确认</strong><p>周女士希望长度调整到 1800 mm，查看关联设计。</p></span></button><button class="notification" data-view="production">${icon('calendar-week')}<span><strong>本周生产排期</strong><p>查看正在推进的制作工序，及时调整工位安排。</p></span></button></div><div class="dialog-actions"><button class="btn" data-action="close">知道了</button></div>`);
  }
  function showSettings() {
    openModal(modalHead('工作空间设置')+`<p class="dialog-description">木序设计事务所的本地演示空间。</p><div class="detail-grid"><div><span class="field-label">工作空间</span><strong>木序设计事务所</strong></div><div><span class="field-label">当前身份</span><strong>林可 / 设计负责人</strong></div><div><span class="field-label">订单数量</span><strong class="mono">${state.orders.length}</strong></div><div><span class="field-label">保存方式</span><strong>浏览器本地存储</strong></div></div><div class="inspector-section"><h3 class="panel-title">数据备份</h3><p class="panel-caption">可导出订单、排期、工艺检查和沟通记录。更换浏览器不会自动同步。</p><button class="btn" style="margin-top:14px" data-action="backup">${icon('download')}下载本地备份</button></div><div class="dialog-actions"><button class="btn btn-primary" data-action="close">完成</button></div>`);
  }
  function stageInfo(id) {
    const descriptions={design:'完善家具方案，确认现场尺寸、材料与预算。确认后可将订单拖入待生产。',waiting:'材料与工艺已经明确，等待分配生产工序和工位。可以在生产排期中安排制作。',production:'跟进开料、榫卯、打磨、涂装和组装工序，完成出厂检查后进入交付。',delivery:'记录包装、运输、安装与签收，和客户确认上门日期。',completed:'已记录签收的订单在这里归档，可以查看详情与历史沟通。'};
    openModal(modalHead(stage(id).name)+`<p class="dialog-description">${descriptions[id]}</p><div class="dialog-actions"><button class="btn btn-primary" data-action="close">知道了</button></div>`);
  }
  document.addEventListener('click',event=>{
    const button=event.target.closest('button,a,[data-order]');
    if(event.target.classList.contains('overlay')){closeModal();return;}
    if(!button)return;
    if(button.matches('.brand')){event.preventDefault();renderView('orders');return;}
    const data=button.dataset;
    if(data.view){closeModal();renderView(data.view);return;}
    if(data.orderTab){state.orderTab=data.orderTab;renderOrders();return;}
    if(data.layout){state.list=data.layout==='list';renderOrders();return;}
    if(data.newStage){newOrder(data.newStage);return;}
    if(data.stageInfo){stageInfo(data.stageInfo);return;}
    if(data.order){openOrder(data.order);return;}
    if(data.editOrder){state.selected=data.editOrder;closeModal();renderView('dimensions');return;}
    if(data.orderChat){state.chatSelected=data.orderChat;closeModal();renderView('messages');return;}
    if(data.craftOrder){state.craftSelected=data.craftOrder;renderCraft();return;}
    if(data.chatOrder){state.chatSelected=data.chatOrder;renderMessages();return;}
    if(data.appointment){openAppointment(data.appointment);return;}
    if(data.deliveryProgress){openDeliveryProgress(data.deliveryProgress);return;}
    if(data.scheduleShift){state.scheduleOffset+=Number(data.scheduleShift);renderProduction();return;}
    const actions={
      'close':closeModal,'new-order':()=>newOrder(),'export':exportOrders,'filter':openFilters,
      'reset-filter':()=>{state.filter={owner:'all',type:'all'};closeModal();renderOrders();},
      'search':()=>{if(state.view!=='orders')renderView('orders');$('#order-search')?.focus();},
      'notifications':showNotifications,'settings':showSettings,'workspace':showSettings,
      'menu':()=>$('#sidebar').classList.toggle('mobile-open'),
      'profile':()=>openModal(modalHead('林可')+`<p class="dialog-description">设计负责人 / 木序设计事务所</p><div class="profile-detail">${avatar(0)}<p>正在负责 <strong class="mono">${state.orders.filter(o=>o.owner===0&&o.status!=='completed').length}</strong> 件定制订单。</p></div><div class="dialog-actions"><button class="btn btn-primary" data-action="my-orders">查看我的订单</button></div>`),
      'my-orders':()=>{state.orderTab='mine';state.filter={owner:'all',type:'all'};state.query='';closeModal();renderView('orders');},
      'schedule-today':()=>{state.scheduleOffset=0;renderProduction();},'add-schedule':addSchedule,'export-craft':exportCraft,
      'backup':()=>{downloadFile('木序-本地数据备份.json',JSON.stringify({orders:state.orders,tasks:state.tasks,messages:state.messages,checks:state.checks},null,2),'application/json;charset=utf-8');toast('本地数据备份已导出');}
    };
    actions[data.action]?.();
  });
  document.addEventListener('keydown',event=>{
    if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='k'){event.preventDefault();closeModal();if(state.view!=='orders')renderView('orders');$('#order-search').focus();}
    if(event.key==='Escape'){closeModal();$('#sidebar').classList.remove('mobile-open');}
    const modal=$('[role="dialog"]');
    if(modal&&event.key==='Tab'){
      const focusable=$$('button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex="0"]',modal).filter(el=>el.getClientRects().length);
      const first=focusable[0],last=focusable[focusable.length-1];
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}
    }
    if((event.key==='Enter'||event.key===' ')&&event.target.matches('.order-card,tr[data-order]')){event.preventDefault();openOrder(event.target.dataset.order);}
  });
  document.addEventListener('error',event=>{
    if(event.target.tagName!=='IMG')return;
    const image=event.target;
    if(image.dataset.fallback)return;image.dataset.fallback='true';
    if(image.src.includes('pravatar')){
      image.src='data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect width="80" height="80" fill="#dde5d6"/><circle cx="40" cy="29" r="13" fill="#85967a"/><path d="M14 78V66a26 26 0 0 1 52 0v12" fill="#85967a"/></svg>');
    }else{
      image.src='data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 260"><rect width="480" height="260" fill="#e8e9df"/><ellipse cx="240" cy="211" rx="145" ry="17" fill="#d9ddd0"/><path d="M103 102v93h12v-85m236-8v93h12v-93M162 84v79h10V84m134 0v79h10V84" fill="#947252"/><path d="m100 94 57-33h212l-26 44H100Z" fill="#ba9670"/><path d="M100 94h243v12H100Z" fill="#866346"/><text x="240" y="244" text-anchor="middle" font-size="12" fill="#647059" font-family="sans-serif">家具参考图暂不可用</text></svg>');
    }
  },true);
  renderView();
  $('#nav-order-count').textContent=state.orders.filter(o=>o.status!=='completed').length;
})();
