const products = [
  { id: 1, name: '初夏紫丁香', sub: '丁香枝 · 蓝釉玻璃瓶', price: 218, sold: 156, cat: 'lilac', scenes: ['home', 'love'], img: 'assets/lilac-vase.webp', desc: '新鲜紫丁香插于波纹蓝釉玻璃瓶，清香淡雅，到手即可摆放。放在餐桌或窗边，让日常多一点花香。' },
  { id: 2, name: '阳光向日葵', sub: '5 枝向日葵 · 绿叶', price: 128, sold: 214, cat: 'sunflower', scenes: ['birthday', 'graduate'], img: 'assets/sunflower.webp', desc: '灿烂的向日葵象征热情与希望，搭配清新的绿叶。送给即将开启新旅程的人，也送给需要一点鼓励的自己。' },
  { id: 3, name: '淡雅蝴蝶兰', sub: '单株蝴蝶兰 · 方形陶瓷盆', price: 298, sold: 87, cat: 'orchid', scenes: ['home', 'visit'], img: 'assets/orchid-vase.webp', desc: '白色蝴蝶兰搭配方形陶瓷盆，花期较长。适合办公桌与客厅，置于明亮的散射光处，避免过度浇水。' },
  { id: 4, name: '春日郁金香', sub: '10 枝黄色郁金香', price: 158, sold: 193, cat: 'tulip', scenes: ['birthday', 'love'], img: 'assets/tulip.webp', desc: '黄色郁金香，明快又不张扬。花苞会在瓶中慢慢舒展，用一束温柔的颜色，表达祝福与爱意。' },
  { id: 5, name: '感恩康乃馨', sub: '红色康乃馨 · 缎带礼结', price: 139, sold: 412, cat: 'carnation', scenes: ['visit', 'birthday'], img: 'assets/carnation.webp', desc: '红色康乃馨以缎带束成小捧，寓意温情与感谢。适合探望长辈，或在一个普通的日子里，认真说声谢谢。' },
  { id: 6, name: '丁香小束', sub: '紫丁香枝 · 手扎', price: 88, sold: 268, cat: 'lilac', scenes: ['love', 'wedding'], img: 'assets/lilac-sprig.webp', desc: '几枝紫丁香随手扎成小束，适合插在窄口瓶里，也可作为伴手礼。不必等一个特别的日子，喜欢就带一束回家。' },
  { id: 7, name: '白瓣兰花', sub: '单枝白兰 · 紫色唇瓣', price: 118, sold: 64, cat: 'orchid', scenes: ['wedding', 'home'], img: 'assets/orchid.webp', desc: '白色花瓣衬着紫色斑点唇瓣，清雅而有层次。适合婚礼桌花、胸花与日常小瓶插花。' },
  { id: 8, name: '温馨百合花篮', sub: '百合 · 藤编花篮', price: 268, sold: 131, cat: 'lily', scenes: ['visit', 'wedding'], img: 'assets/lily-basket.webp', desc: '百合配粉色小花与绿叶，盛于藤编花篮。适合探望问候与庆祝时刻，用花替你送去一份惦念。' },
];

const sceneNames = { all: '所有花选', birthday: '庆祝生日', love: '表达爱意', home: '装点日常', visit: '探望问候', graduate: '毕业祝福', wedding: '婚礼用花', favorites: '我的收藏' };
const categoryNames = { all: '今日花选', lilac: '丁香花选', tulip: '郁金香花选', sunflower: '向日葵花选', orchid: '兰花花选', carnation: '康乃馨花选', lily: '百合花选' };
const orderStatuses = { all: '全部订单', processing: '待发货', delivery: '运输中', review: '待评价', return: '退换货' };
const orders = [
  { number: 'YZ102903', date: '10 月 29 日', productId: 1, status: 'processing' },
  { number: 'YZ102802', date: '10 月 28 日', productId: 4, status: 'delivery' },
  { number: 'YZ102801', date: '10 月 28 日', productId: 8, status: 'delivery' },
];
const pointEntries = [
  { name: '花友入会礼', date: '10 月 12 日', amount: 200 },
  { name: '秋日花事活动', date: '10 月 20 日', amount: 88 },
  { name: '鲜花养护打卡', date: '10 月 25 日', amount: 40 },
];
const freeShippingThreshold = 199;
const deliveryFee = 15;
const $ = id => document.getElementById(id);
const frame = document.querySelector('.app-frame');
const content = $('app-content');
const navigation = document.querySelector('.tab-bar');
const overlay = $('sheet-overlay');
const productSheet = $('product-sheet');
const infoSheet = $('info-sheet');
const search = $('flower-search');
const favs = new Set();
let cart = [];
let currentCat = 'all';
let currentScene = 'all';
let sheetProduct = null;
let activeSheet = null;
let returnFocus = null;
let address = null;
let checkoutDraft = null;
let notificationsEnabled = true;
let notificationsRead = false;
let motionEnabled = true;
let toastTimer;

const findProduct = id => products.find(product => product.id === id);
const money = value => `¥${value}`;
const heartIcon = () => '<i class="ti ti-heart heart-outline" aria-hidden="true"></i><svg class="heart-filled" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6.979 3.074a6 6 0 0 1 4.988 1.425l.037 .033l.034 -.03a6 6 0 0 1 4.733 -1.44l.246 .036a6 6 0 0 1 3.364 10.008l-.18 .185l-.048 .041l-7.45 7.379a1 1 0 0 1 -1.313 .082l-.094 -.082l-7.493 -7.422a6 6 0 0 1 3.176 -10.215z" /></svg>';
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const activeMotions = new Set();
const addedTimers = new WeakMap();
const featuredIds = [1, 4, 2];
const motionEase = getComputedStyle(frame).getPropertyValue('--ease-out').trim();
let keyboardInput = false;
let featuredIndex = 0;
let featuredVersion = 0;
let featuredMotion = null;
const canAnimate = () => motionEnabled && !reducedMotion.matches && !keyboardInput;

function trackMotion(animation) {
  activeMotions.add(animation);
  animation.finished.then(() => activeMotions.delete(animation), () => activeMotions.delete(animation));
  return animation;
}

function settleMotion() {
  activeMotions.forEach(animation => { if (animation.playState === 'running' || animation.playState === 'paused') animation.finish(); });
}

function revealGrid(grid) {
  if (!canAnimate() || grid.closest('.screen').hidden) return;
  grid.querySelectorAll('.product-card__stage').forEach((stage, index) => {
    trackMotion(stage.animate([{ opacity: .35, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 200, delay: Math.min(index * 30, 90), easing: motionEase }));
  });
}

function selectFeatured(index) {
  if (index === featuredIndex) return;
  featuredIndex = index;
  const version = ++featuredVersion;
  const product = findProduct(featuredIds[index]);
  const image = $('featured-image');
  document.querySelectorAll('[data-featured]').forEach(button => {
    const active = Number(button.dataset.featured) === index;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  const swap = () => {
    image.src = product.img;
    const text = money(product.price);
    const chars = text.replace(/¥/g, '');
    let lines;
    if (chars.length <= 4) {
      lines = text;
    } else if (chars.length === 5) {
      lines = text.slice(0, 2) + '<br>' + text.slice(2);
    } else if (chars.length === 6) {
      lines = text.slice(0, 3) + '<br>' + text.slice(3);
    } else if (chars.length === 7) {
      lines = text.slice(0, 3) + '<br>' + text.slice(3);
    } else {
      lines = text.slice(0, 4) + '<br>' + text.slice(4);
    }
    $('featured-price').innerHTML = lines;
  };
  if (!canAnimate()) {
    featuredMotion?.cancel();
    featuredMotion = null;
    swap();
    return;
  }
  const current = getComputedStyle(image);
  const previous = featuredMotion;
  const exit = trackMotion(image.animate([{ opacity: current.opacity, transform: current.transform }, { opacity: 0, transform: 'translateX(-8px)' }], { duration: 120, easing: motionEase, fill: 'forwards' }));
  featuredMotion = exit;
  previous?.cancel();
  exit.finished.then(() => {
    if (version !== featuredVersion) return;
    swap();
    if (!canAnimate()) { exit.cancel(); featuredMotion = null; return; }
    const entry = trackMotion(image.animate([{ opacity: 0, transform: 'translateX(8px)' }, { opacity: 1, transform: 'none' }], { duration: 180, easing: motionEase, fill: 'forwards' }));
    featuredMotion = entry;
    exit.cancel();
    entry.finished.then(() => { if (version === featuredVersion) { entry.cancel(); featuredMotion = null; } }, () => {});
  }, () => {});
}

function confirmAdded(button) {
  if (!button) return;
  clearTimeout(addedTimers.get(button));
  button.classList.add('is-added');
  addedTimers.set(button, setTimeout(() => button.classList.remove('is-added'), 900));
}

function flyToCart(id, button) {
  if (!canAnimate() || !button) return;
  const source = button.closest('.product-card')?.querySelector('.product-card__img') || $('sheet-img');
  const bounds = frame.getBoundingClientRect();
  const start = source.getBoundingClientRect();
  const target = navigation.querySelector('[data-tab="cart"] .tab-icon').getBoundingClientRect();
  const x = start.left + start.width / 2 - bounds.left - 30;
  const y = start.top + start.height / 2 - bounds.top - 30;
  const dx = target.left + target.width / 2 - bounds.left - 30 - x;
  const dy = target.top + target.height / 2 - bounds.top - 30 - y;
  const flower = document.createElement('img');
  flower.className = 'flower-flight';
  flower.src = findProduct(id).img;
  flower.alt = '';
  flower.setAttribute('aria-hidden', 'true');
  flower.style.left = `${x}px`;
  flower.style.top = `${y}px`;
  frame.appendChild(flower);
  const animation = trackMotion(flower.animate([{ transform: 'translate(0, 0) scale(1)', opacity: 1 }, { offset: .45, transform: `translate(${dx * .45}px, ${dy * .45 - 35}px) scale(.8)`, opacity: 1 }, { transform: `translate(${dx}px, ${dy}px) scale(.25)`, opacity: 0 }], { duration: 300, easing: motionEase }));
  animation.finished.then(() => flower.remove(), () => flower.remove());
}

function careTips(product) {
  return product.id === 3 ? [
    { icon: 'droplet', name: '少水', text: '基质干燥后再浇水，倒掉托盘积水，不让根部长期泡在水中。' },
    { icon: 'sun', name: '散光', text: '放在明亮的散射光处，避开午后直射阳光。' },
    { icon: 'wind', name: '通风', text: '保持空气流通，避免空调和暖气直接吹向花朵。' },
    { icon: 'flower', name: '护花', text: '不要剪掉仍然健康的花茎，及时移除已经凋谢的花朵。' },
  ] : [
    { icon: 'cut', name: '剪枝', text: '用干净剪刀斜剪花脚，去掉水面以下的叶片，帮助花枝吸水。' },
    { icon: 'droplet', name: '换水', text: '使用干净花瓶，每天检查水质。花篮以花泥保持湿润，避免整篮浸水。' },
    { icon: 'sun', name: '散光', text: '放在阴凉、明亮的位置，避开长时间直射阳光。' },
    { icon: 'temperature', name: '避热', text: '远离暖气、空调出风口与成熟水果，让花期更长一些。' },
  ];
}

function toggleCare(index) {
  const button = $('care-tools').querySelector(`[data-care="${index}"]`);
  const show = button.getAttribute('aria-pressed') !== 'true';
  $('care-tools').querySelectorAll('button').forEach(item => {
    const active = show && item === button;
    item.classList.toggle('active', active);
    item.setAttribute('aria-pressed', String(active));
  });
  $('care-tip').hidden = !show;
  if (show) {
    $('care-tip').textContent = careTips(sheetProduct)[index].text;
    if (canAnimate()) trackMotion($('care-tip').animate([{ opacity: .4 }, { opacity: 1 }], { duration: 160, easing: motionEase }));
  }
}

function productCards(list) {
  return list.map(product => {
    const liked = favs.has(product.id);
    return `<article class="product-card">
      <button class="product-card__open" data-open="${product.id}" aria-label="查看${product.name}">
        <span class="product-card__stage tone-${product.cat}"><img class="product-card__img" src="${product.img}" alt="${product.name}" loading="lazy" /></span>
        <span class="product-card__name">${product.name}</span>
      </button>
      <button class="product-card__fav${liked ? ' liked' : ''}" data-fav="${product.id}" aria-label="${liked ? '取消收藏' : '收藏'}${product.name}" aria-pressed="${liked}">${heartIcon()}</button>
      <div class="product-card__bottom"><span class="price"><small>¥</small>${product.price}</span><button class="add-btn" data-add="${product.id}" aria-label="将${product.name}加入花篮"><span class="add-feedback" aria-hidden="true"><i class="ti ti-plus add-icon"></i><i class="ti ti-check added-icon"></i></span></button></div>
    </article>`;
  }).join('');
}

function renderProducts() {
  const list = currentCat === 'all' ? products.slice(0, 6) : products.filter(product => product.cat === currentCat);
  $('product-grid').innerHTML = productCards(list);
  $('grid-empty').hidden = list.length > 0;
  $('home-list-title').textContent = categoryNames[currentCat];
}

function renderExplore() {
  const query = search.value.trim().toLocaleLowerCase();
  const list = products.filter(product => {
    const matchesScene = currentScene === 'all' || (currentScene === 'favorites' ? favs.has(product.id) : product.scenes.includes(currentScene));
    const searchable = [product.name, product.sub, product.desc, ...product.scenes.map(scene => sceneNames[scene])].join(' ').toLocaleLowerCase();
    return matchesScene && searchable.includes(query);
  });
  $('explore-grid').innerHTML = productCards(list);
  $('explore-title').textContent = sceneNames[currentScene];
  $('explore-count').textContent = `${list.length} 款鲜花`;
  $('explore-empty').hidden = list.length > 0;
  $('search-clear').hidden = search.value.length === 0;
  const emptyFavorites = currentScene === 'favorites' && favs.size === 0;
  $('explore-empty-title').textContent = emptyFavorites ? '喜欢的花，留在这里。' : '暂时没有找到';
  $('explore-empty-desc').textContent = emptyFavorites ? '点一下花束上的爱心，就能收藏。' : '换一个关键词，或看看其他场景。';
}

function setCategory(category) {
  currentCat = category;
  document.querySelectorAll('[data-cat]').forEach(button => {
    const active = button.dataset.cat === category;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  renderProducts();
  revealGrid($('product-grid'));
}

function setScene(scene) {
  currentScene = scene;
  document.querySelectorAll('[data-scene]').forEach(button => {
    const active = button.dataset.scene === scene;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  renderExplore();
  revealGrid($('explore-grid'));
}

function cartTotals() {
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  const subtotal = cart.reduce((sum, item) => sum + findProduct(item.id).price * item.qty, 0);
  const shipping = count > 0 && subtotal < freeShippingThreshold ? deliveryFee : 0;
  return { count, subtotal, shipping, total: subtotal + shipping };
}

function renderCart() {
  const totals = cartTotals();
  const empty = totals.count === 0;
  $('cart-badge').textContent = totals.count > 99 ? '99+' : totals.count;
  $('cart-badge').hidden = empty;
  $('cart-item-count').textContent = `${totals.count} 件`;
  $('screen-cart').classList.toggle('has-items', !empty);
  $('cart-empty').hidden = !empty;
  ['cart-footer', 'cart-summary', 'shipping-note'].forEach(id => { $(id).hidden = empty; });
  $('cart-subtotal').textContent = money(totals.subtotal);
  $('cart-shipping').textContent = totals.shipping === 0 ? '免配送费' : money(totals.shipping);
  $('cart-total').textContent = money(totals.total);
  $('shipping-note').innerHTML = '<i class="ti ti-truck-delivery" aria-hidden="true"></i><span></span>';
  $('shipping-note').querySelector('span').textContent = totals.shipping === 0 ? '已享免运费' : `再选 ¥${freeShippingThreshold - totals.subtotal} 免运费`;
  $('cart-list').innerHTML = cart.map(item => {
    const product = findProduct(item.id);
    return `<article class="cart-item">
      <button class="cart-item__image-btn tone-${product.cat}" data-open="${product.id}" aria-label="查看${product.name}"><img class="cart-item__img" src="${product.img}" alt="${product.name}" /></button>
      <div class="cart-item__info">
        <div class="cart-item__top"><button class="cart-item__name" data-open="${product.id}">${product.name}</button><button class="cart-item__remove" data-remove="${product.id}" aria-label="从花篮移除${product.name}"><i class="ti ti-x" aria-hidden="true"></i></button></div>
        <div class="cart-item__row"><span class="price">${money(product.price)}</span><div class="qty" aria-label="${product.name}数量"><button data-qty="-1" data-id="${product.id}" aria-label="减少${product.name}数量"><i class="ti ti-minus" aria-hidden="true"></i></button><span aria-live="polite">${item.qty}</span><button data-qty="1" data-id="${product.id}" aria-label="增加${product.name}数量"><i class="ti ti-plus" aria-hidden="true"></i></button></div></div>
      </div>
    </article>`;
  }).join('');
}

function addToCart(id, button) {
  const item = cart.find(entry => entry.id === id);
  if (item) item.qty++; else cart.push({ id, qty: 1 });
  renderCart();
  confirmAdded(button);
  flyToCart(id, button);
  showToast('已加入花篮', 'shopping-cart');
}

function changeQty(id, delta) {
  const item = cart.find(entry => entry.id === id);
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter(entry => entry.id !== id);
  renderCart();
  const control = document.querySelector(`#cart-list [data-id="${id}"][data-qty="${delta}"]`);
  (control || $('cart-list').querySelector('button') || $('cart-empty').querySelector('button')).focus({ preventScroll: true });
  if (item.qty <= 0) showToast('已移除这束花');
}

function syncSheetFav() {
  if (!sheetProduct) return;
  const liked = favs.has(sheetProduct.id);
  $('sheet-fav').classList.toggle('liked', liked);
  $('sheet-fav').setAttribute('aria-pressed', String(liked));
  $('sheet-fav').setAttribute('aria-label', `${liked ? '取消收藏' : '收藏'}${sheetProduct.name}`);
}

function toggleFav(id) {
  favs.has(id) ? favs.delete(id) : favs.add(id);
  const liked = favs.has(id);
  const product = findProduct(id);
  document.querySelectorAll(`[data-fav="${id}"]`).forEach(button => {
    button.classList.toggle('liked', liked);
    button.setAttribute('aria-pressed', String(liked));
    button.setAttribute('aria-label', `${liked ? '取消收藏' : '收藏'}${product.name}`);
  });
  $('fav-count').textContent = `${favs.size} 束`;
  syncSheetFav();
  if (currentScene === 'favorites') {
    const hadFocus = $('explore-grid').contains(document.activeElement);
    renderExplore();
    if (hadFocus) ($('explore-grid').querySelector('button') || $('explore-empty').querySelector('button')).focus({ preventScroll: true });
  }
  showToast(liked ? '已收藏' : '已取消收藏', 'heart');
}

function switchTab(name) {
  if (activeSheet) closeSheet();
  const previous = document.querySelector('.screen.active');
  document.querySelectorAll('.screen').forEach(screen => {
    const active = screen.id === `screen-${name}`;
    screen.classList.toggle('active', active);
    screen.hidden = !active;
  });
  const tabs = [...document.querySelectorAll('[data-tab]')];
  tabs.forEach(button => {
    const active = button.dataset.tab === name;
    button.classList.toggle('active', active);
    if (active) button.setAttribute('aria-current', 'page'); else button.removeAttribute('aria-current');
  });
  $('tab-indicator').style.transform = `translateX(${tabs.findIndex(button => button.dataset.tab === name) * 100}%)`;
  const next = $('screen-' + name);
  if (previous !== next && next.querySelector('.product-grid')) revealGrid(next.querySelector('.product-grid'));
}

function openModal(sheet) {
  if (!activeSheet) returnFocus = document.activeElement;
  if (activeSheet && activeSheet !== sheet) {
    activeSheet.classList.remove('open');
    activeSheet.inert = true;
    activeSheet.hidden = true;
  }
  activeSheet = sheet;
  sheet.hidden = false;
  sheet.inert = false;
  sheet.classList.add('open');
  overlay.classList.add('open');
  frame.classList.add('has-sheet');
  content.inert = true;
  navigation.inert = true;
  sheet.querySelector('.sheet__scroll').scrollTop = 0;
  sheet.querySelector('[data-close-sheet]').focus({ preventScroll: true });
}

function openSheet(id) {
  sheetProduct = findProduct(id);
  $('sheet-img').src = sheetProduct.img;
  $('sheet-img').alt = sheetProduct.name;
  $('sheet-stage').className = `sheet__stage tone-${sheetProduct.cat}`;
  $('sheet-sub').textContent = sheetProduct.sub;
  $('sheet-name').textContent = sheetProduct.name;
  $('sheet-desc').textContent = sheetProduct.desc;
  $('sheet-price').textContent = money(sheetProduct.price);
  $('sheet-sold').textContent = `已售 ${sheetProduct.sold}`;
  $('sheet-fav').innerHTML = heartIcon();
  $('sheet-zoom').setAttribute('aria-pressed', 'false');
  $('sheet-zoom').setAttribute('aria-label', '放大花束');
  $('sheet-zoom').innerHTML = '<i class="ti ti-zoom-in" aria-hidden="true"></i>';
  $('sheet-add-cart').classList.remove('is-added');
  clearTimeout(addedTimers.get($('sheet-add-cart')));
  $('care-tip').hidden = true;
  $('care-tools').innerHTML = careTips(sheetProduct).map((tip, index) => `<button data-care="${index}" aria-pressed="false"><i class="ti ti-${tip.icon}" aria-hidden="true"></i><span>${tip.name}</span></button>`).join('');
  syncSheetFav();
  openModal(productSheet);
}

function openInfo(title, body, footer = '') {
  $('info-title').textContent = title;
  $('info-body').innerHTML = body;
  $('info-footer').innerHTML = footer;
  $('info-footer').hidden = !footer;
  sheetProduct = null;
  openModal(infoSheet);
}

function closeSheet() {
  if (!activeSheet) return;
  activeSheet.classList.remove('open');
  activeSheet.inert = true;
  activeSheet = null;
  sheetProduct = null;
  overlay.classList.remove('open');
  frame.classList.remove('has-sheet');
  content.inert = false;
  navigation.inert = false;
  const target = returnFocus?.isConnected && returnFocus.matches('button, input, textarea, [tabindex]') && !returnFocus.closest('[hidden]') ? returnFocus : navigation.querySelector('.active');
  target.focus({ preventScroll: true });
  returnFocus = null;
}

function contactFields() {
  return `<label class="field"><span>收花人</span><input name="name" autocomplete="name" placeholder="怎么称呼你" maxlength="30" required /></label>
    <label class="field"><span>手机号码</span><input name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="11 位手机号码" pattern="1[3-9][0-9]{9}" maxlength="11" title="请填写有效的 11 位中国大陆手机号码" required /></label>
    <label class="field"><span>收货地址</span><textarea name="street" autocomplete="street-address" placeholder="省市区、街道与门牌号" maxlength="120" required></textarea></label>`;
}

function fillContact(form, values) {
  if (!values) return;
  ['name', 'phone', 'street'].forEach(key => { form.elements.namedItem(key).value = values[key]; });
}

function readContact(form) {
  const contact = {};
  for (const key of ['name', 'phone', 'street']) {
    const input = form.elements.namedItem(key);
    contact[key] = input.value.trim();
    input.setCustomValidity(contact[key] ? '' : '请填写此项，不能只输入空格。');
    if (!input.reportValidity()) return null;
  }
  return contact;
}

function openAddress() {
  openInfo('收货地址', `<p class="panel-intro">地址仅保留至页面刷新，请勿填写真实个人信息。</p><form id="address-form">${contactFields()}</form>`, '<button class="btn btn--primary btn--full" type="submit" form="address-form">保存地址</button>');
  fillContact($('address-form'), address);
}

function openCheckout() {
  const totals = cartTotals();
  if (!totals.count) return;
  if (!checkoutDraft) checkoutDraft = { name: address?.name || '', phone: address?.phone || '', street: address?.street || '', note: '' };
  const items = cart.map(item => {
    const product = findProduct(item.id);
    return `<div class="checkout-item"><img src="${product.img}" alt="${product.name}" /><div><strong>${product.name}</strong><p>${item.qty} 件 · ${money(product.price)} / 件</p></div><span class="price">${money(product.price * item.qty)}</span></div>`;
  }).join('');
  openInfo('确认这份心意', `<p class="panel-intro">支付服务尚未连接，请勿填写真实个人信息。</p>${items}
    <form id="checkout-form"><h3 class="form-section-title">送到哪里</h3>${contactFields()}<label class="field"><span>花语卡（选填）</span><textarea name="note" placeholder="写一句想说的话" maxlength="120"></textarea></label><p class="field-help">手写花语卡随花附赠，最多 120 字。</p></form>
    <div class="checkout-totals"><div><span>商品金额</span><span>${money(totals.subtotal)}</span></div><div><span>配送费</span><span>${totals.shipping ? money(totals.shipping) : '免配送费'}</span></div><div><span>应付金额</span><span>${money(totals.total)}</span></div></div><p class="inline-notice" id="payment-notice" role="status" hidden></p>`,
    `<span class="price price--lg">${money(totals.total)}</span><button class="btn btn--primary" type="submit" form="checkout-form">确认支付 <i class="ti ti-arrow-narrow-right" aria-hidden="true"></i></button>`);
  fillContact($('checkout-form'), checkoutDraft);
  $('checkout-form').elements.namedItem('note').value = checkoutDraft.note;
}

function openOrders(status) {
  const list = status === 'all' ? orders : orders.filter(order => order.status === status);
  const body = list.length ? list.map(order => {
    const product = findProduct(order.productId);
    return `<article class="order-card"><div class="order-card__meta"><span>${order.date} · ${order.number}</span><span>${orderStatuses[order.status]}</span></div><button class="order-card__product" data-open="${product.id}"><img src="${product.img}" alt="${product.name}" /><div><strong>${product.name}</strong><p>1 件 · ${money(product.price)}</p></div></button></article>`;
  }).join('') : '<div class="empty-state"><i class="ti ti-package" aria-hidden="true"></i><h3>这里暂时没有订单</h3><button class="btn btn--primary btn--sm" data-tab-jump="home">去看鲜花</button></div>';
  openInfo(orderStatuses[status], body);
}

function syncNotifications() {
  $('notification-dot').hidden = notificationsRead || !notificationsEnabled;
  $('notification-btn').setAttribute('aria-label', notificationsRead || !notificationsEnabled ? '花店消息' : '花店消息，2 条未读');
}

function openPanel(name) {
  if (name === 'address') return openAddress();
  if (name === 'notifications') {
    notificationsRead = true;
    syncNotifications();
    return openInfo('花店消息', '<article class="panel-item"><span>花材养护</span><h3>让丁香多陪你几天</h3><p>收到后斜剪花脚，去掉水面以下的叶子，每天换水。避开直射阳光与暖气出风口。</p></article><article class="panel-item"><span>花语卡</span><h3>有些心意，手写更好</h3><p>每份花束都附一张花语卡。在结算页写下祝福，花艺师会为你手写在卡片上。</p></article>');
  }
  if (name === 'coupons') {
    const coupons = [{ amount: 20, name: '花友专享券', rule: '满 ¥199 可用' }, { amount: 30, name: '鲜花礼赠券', rule: '满 ¥299 可用' }, { amount: 10, name: '日常小束券', rule: '满 ¥99 可用' }];
    return openInfo('我的优惠券', `<p class="panel-intro">优惠券暂不可抵扣，需连接会员服务。</p>${coupons.map(coupon => `<article class="coupon"><span class="coupon__amount"><small>¥</small>${coupon.amount}</span><div><strong>${coupon.name}</strong><p>${coupon.rule}</p></div></article>`).join('')}`);
  }
  if (name === 'points') {
    const total = pointEntries.reduce((sum, entry) => sum + entry.amount, 0);
    return openInfo('花瓣积分', `<p class="panel-intro">${total} 花瓣 · 兑换需连接会员服务</p>${pointEntries.map(entry => `<article class="panel-item"><span>${entry.date} · +${entry.amount} 花瓣</span><h3>${entry.name}</h3></article>`).join('')}`);
  }
  if (name === 'settings') {
    return openInfo('设置', `<label class="switch-field"><span><strong>消息提醒</strong><p>显示未读消息标记</p></span><input type="checkbox" id="setting-notifications" aria-label="消息提醒" ${notificationsEnabled ? 'checked' : ''} /></label><label class="switch-field"><span><strong>界面动效</strong><p>遵循系统的减少动态效果设置</p></span><input type="checkbox" id="setting-motion" aria-label="界面动效" ${motionEnabled ? 'checked' : ''} /></label>`);
  }
}

function showToast(message, icon = 'check') {
  const symbol = document.createElement('i');
  symbol.className = `ti ti-${icon}`;
  symbol.setAttribute('aria-hidden', 'true');
  const label = document.createElement('span');
  label.textContent = message;
  $('toast').replaceChildren(symbol, label);
  $('toast').classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $('toast').classList.remove('show'), 2000);
}

function browseAll() {
  search.value = '';
  setScene('all');
  switchTab('explore');
  $('screen-explore').querySelector('.scroll-area').scrollTop = 0;
}

frame.addEventListener('click', event => {
  const target = event.target;
  let button;
  if ((button = target.closest('[data-add]'))) return addToCart(Number(button.dataset.add), button);
  if ((button = target.closest('[data-fav]'))) return toggleFav(Number(button.dataset.fav));
  if ((button = target.closest('[data-qty]'))) return changeQty(Number(button.dataset.id), Number(button.dataset.qty));
  if ((button = target.closest('[data-remove]'))) {
    cart = cart.filter(item => item.id !== Number(button.dataset.remove));
    renderCart();
    ($('cart-list').querySelector('button') || $('cart-empty').querySelector('button')).focus({ preventScroll: true });
    return showToast('已移除这束花');
  }
  if ((button = target.closest('[data-featured]'))) return selectFeatured(Number(button.dataset.featured));
  if (target.closest('[data-featured-next]')) return selectFeatured((featuredIndex + 1) % featuredIds.length);
  if ((button = target.closest('[data-care]'))) return toggleCare(Number(button.dataset.care));
  if ((button = target.closest('[data-open]'))) return openSheet(Number(button.dataset.open));
  if ((button = target.closest('[data-tab]'))) return switchTab(button.dataset.tab);
  if ((button = target.closest('[data-tab-jump]'))) return switchTab(button.dataset.tabJump);
  if ((button = target.closest('[data-cat]'))) return setCategory(button.dataset.cat);
  if ((button = target.closest('[data-scene]'))) return setScene(button.dataset.scene);
  if ((button = target.closest('[data-order]'))) return openOrders(button.dataset.order);
  if ((button = target.closest('[data-panel]'))) return openPanel(button.dataset.panel);
  if (target.closest('[data-close-sheet]') || target === overlay) return closeSheet();
  if (target.closest('[data-browse-all], [data-reset-explore]')) return browseAll();
  if (target.closest('[data-reset-home]')) return setCategory('all');
  if (target.closest('[data-search-jump]')) {
    browseAll();
    return search.focus();
  }
  if (target.closest('[data-favorites-jump]')) {
    search.value = '';
    setScene('favorites');
    switchTab('explore');
    $('screen-explore').querySelector('.scroll-area').scrollTop = 0;
  }
});

search.addEventListener('input', renderExplore);
$('search-clear').addEventListener('click', () => { search.value = ''; renderExplore(); search.focus(); });
$('sheet-fav').addEventListener('click', () => toggleFav(sheetProduct.id));
$('sheet-add-cart').addEventListener('click', event => addToCart(sheetProduct.id, event.currentTarget));
$('checkout-btn').addEventListener('click', openCheckout);
$('sheet-zoom').addEventListener('click', () => {
  const zoomed = $('sheet-stage').classList.toggle('zoomed');
  $('sheet-zoom').setAttribute('aria-pressed', String(zoomed));
  $('sheet-zoom').setAttribute('aria-label', zoomed ? '还原花束大小' : '放大花束');
  $('sheet-zoom').innerHTML = `<i class="ti ti-${zoomed ? 'zoom-out' : 'zoom-in'}" aria-hidden="true"></i>`;
});

frame.addEventListener('input', event => {
  const input = event.target;
  if (input.closest('#address-form, #checkout-form')) input.setCustomValidity('');
  if (input.closest('#checkout-form')) checkoutDraft[input.name] = input.value;
});

frame.addEventListener('change', event => {
  if (event.target.id === 'setting-notifications') {
    notificationsEnabled = event.target.checked;
    syncNotifications();
  }
  if (event.target.id === 'setting-motion') {
    motionEnabled = event.target.checked;
    frame.classList.toggle('motion-off', !motionEnabled);
    if (!motionEnabled) settleMotion();
  }
});

frame.addEventListener('submit', event => {
  const form = event.target;
  if (form.id !== 'address-form' && form.id !== 'checkout-form') return;
  event.preventDefault();
  const contact = readContact(form);
  if (!contact) return;
  if (form.id === 'address-form') {
    address = contact;
    if (checkoutDraft) Object.assign(checkoutDraft, contact);
    $('address-status').textContent = address.name;
    closeSheet();
    return showToast('地址已更新，刷新后清空');
  }
  Object.assign(checkoutDraft, contact, { note: form.elements.namedItem('note').value });
  $('payment-notice').textContent = '支付服务未连接，未发起付款或创建订单。';
  $('payment-notice').hidden = false;
  infoSheet.querySelector('.sheet__scroll').scrollTop = infoSheet.querySelector('.sheet__scroll').scrollHeight;
});

frame.addEventListener('keydown', () => {
  keyboardInput = true;
  frame.classList.add('keyboard-input');
  settleMotion();
}, true);
frame.addEventListener('pointerdown', () => {
  keyboardInput = false;
  frame.classList.remove('keyboard-input');
}, true);
reducedMotion.addEventListener('change', () => { if (reducedMotion.matches) settleMotion(); });

document.addEventListener('keydown', event => {
  if (!activeSheet) return;
  if (event.key === 'Escape') { event.preventDefault(); closeSheet(); return; }
  if (event.key !== 'Tab') return;
  const focusable = [...activeSheet.querySelectorAll('button:not(:disabled), input:not(:disabled), textarea:not(:disabled), [tabindex="0"]')].filter(element => element.getClientRects().length > 0);
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
});

document.querySelectorAll('[data-order-count]').forEach(badge => {
  const count = orders.filter(order => order.status === badge.dataset.orderCount).length;
  badge.textContent = count;
  badge.hidden = count === 0;
});
document.querySelector('.member-strip strong').textContent = pointEntries.reduce((sum, entry) => sum + entry.amount, 0);
renderProducts();
renderExplore();
renderCart();
revealGrid($('product-grid'));
