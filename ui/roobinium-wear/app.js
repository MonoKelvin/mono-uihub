'use strict';

const pieces = [
  {
    id: 'tank', number: '01', name: 'Studio Tank', color: 'BLACK / OFF-WHITE',
    selectedColor: 'Washed black', swatch: '#29292b', print: '#f3f1eb', price: 48,
    image: './assets/studio-tank.webp', artClass: 'tank',
    description: 'Room to move. A relaxed, open-arm tank with a softly washed finish. Made for the studio, and everything after.',
    materials: '100% cotton jersey · 240 GSM. Wash cold with similar colors, inside out. Reshape while damp. Do not tumble dry.',
    measurements: [[54, 69], [57, 72], [60, 75], [63, 78]]
  },
  {
    id: 'hoodie', number: '02', name: 'Off-Duty Hoodie', color: 'WARM ECRU',
    selectedColor: 'Warm ecru', swatch: '#ded9cc', print: '#353332', price: 118,
    image: './assets/off-duty-hoodie.webp', artClass: 'hoodie',
    description: 'Your soft landing. A substantial cotton hoodie with dropped shoulders, a generous hood and a pocket for the essentials.',
    materials: '100% cotton brushed fleece · 420 GSM. Wash cold on a gentle cycle. Dry flat. Avoid bleach and direct heat on the print.',
    measurements: [[60, 66], [63, 69], [66, 72], [69, 75]]
  },
  {
    id: 'creative', number: '03', name: 'Creative Tee', color: 'DUSTY LAVENDER',
    selectedColor: 'Dusty lavender', swatch: '#b9a5cc', print: '#4f356b', price: 58,
    image: './assets/creative-tee.webp', artClass: 'tee',
    description: 'A different kind of blank canvas. An easy, oversized tee in dusty lavender, with a soft hand feel and space for your ideas.',
    materials: '100% cotton jersey · 260 GSM. Machine wash cold, inside out. Line dry in the shade. Iron on reverse at low heat.',
    measurements: [[57, 68], [60, 71], [63, 74], [66, 77]]
  },
  {
    id: 'heavyweight', number: '04', name: 'Heavyweight Tee', color: 'SOFT CHARCOAL',
    selectedColor: 'Soft charcoal', swatch: '#454445', print: '#f3f1eb', price: 68,
    image: './assets/heavyweight-tee.webp', artClass: 'tee',
    description: 'A little more weight. A little more structure. A washed charcoal tee with a boxy silhouette that only gets better with wear.',
    materials: '100% heavyweight cotton jersey · 320 GSM. Wash cold with dark colors, inside out. Line dry. Do not iron directly on the print.',
    measurements: [[58, 67], [61, 70], [64, 73], [67, 76]]
  }
];

const sizes = ['S', 'M', 'L', 'XL'];
const money = value => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
const byId = id => document.getElementById(id);
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const narrowScreen = window.matchMedia('(max-width: 1050px)');
const phoneScreen = window.matchMedia('(max-width: 650px)');
const products = byId('products');
const cart = [];
let rackOffset = 0;
let selectedPiece = null;
let selectedSize = null;
let activeLayer = null;
let returnFocus = null;
let toastTimer;

const logo = '<svg viewBox="0 0 100 120" fill="none" aria-hidden="true"><path d="M77 35C75 9 25 8 20 42C16 65 20 96 48 107C72 103 83 84 82 60L51 49V91C35 84 31 66 34 48C38 26 66 27 66 43" stroke="currentColor" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M52 38C42 36 40 43 40 55L42 72M58 65L69 69C70 82 65 92 57 97" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

function art(piece) {
  return `<span class="garment-art garment-art--${piece.artClass}" style="--print-color:${piece.print}"><span class="garment-body"><img class="garment-image" src="${piece.image}" alt="${piece.selectedColor} ${piece.name} on a wooden hanger" draggable="false"><span class="garment-print" aria-hidden="true">${logo}<span class="print-label">roobinium</span></span></span></span>`;
}

const productButtons = new Map(pieces.map(piece => {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'product';
  button.dataset.piece = piece.id;
  button.setAttribute('aria-haspopup', 'dialog');
  button.setAttribute('aria-label', `View ${piece.name}, ${piece.selectedColor}`);
  button.innerHTML = `<span class="product-art">${art(piece)}<span class="view-piece">View piece <i class="ti ti-arrow-up-right" aria-hidden="true"></i></span></span><span class="product-caption"><span class="product-number">${piece.number}</span><span class="product-name">${piece.name}</span><span class="product-color">${piece.color}</span></span>`;
  button.addEventListener('click', () => openProduct(piece, button));
  return [piece.id, button];
}));

function renderRack(direction = 0) {
  const oldRects = new Map([...products.children].map(button => [button.dataset.piece, button.getBoundingClientRect()]));
  const focusedPiece = document.activeElement?.closest('.product')?.dataset.piece;
  productButtons.forEach(button => button.getAnimations().forEach(animation => animation.cancel()));
  const count = phoneScreen.matches ? 1 : narrowScreen.matches ? 2 : 4;
  const visible = Array.from({ length: count }, (_, index) => pieces[(rackOffset + index) % pieces.length]);
  products.replaceChildren(...visible.map(piece => productButtons.get(piece.id)));

  if (direction && !reducedMotion.matches) {
    for (const button of products.children) {
      const previous = oldRects.get(button.dataset.piece);
      const current = button.getBoundingClientRect();
      const distance = previous ? previous.left - current.left : direction * 28;
      const wraps = !previous || Math.abs(distance) > current.width * 1.5;
      button.animate([
        { transform: `translateX(${wraps ? direction * 28 : distance}px)`, opacity: wraps ? 0 : 1 },
        { transform: 'translateX(0)', opacity: 1 }
      ], { duration: 420, easing: 'cubic-bezier(.22, 1, .36, 1)' });
    }
  }

  if (focusedPiece) {
    const focusedButton = productButtons.get(focusedPiece);
    (focusedButton.isConnected ? focusedButton : products.firstElementChild).focus({ preventScroll: true });
  }
  byId('rack-announcement').textContent = visible.map(piece => piece.name).join(', ');
}

function moveRack(direction) {
  rackOffset = (rackOffset + direction + pieces.length) % pieces.length;
  renderRack(direction);
}

function hideToast() {
  clearTimeout(toastTimer);
  byId('toast').hidden = true;
}

function openLayer(id, trigger) {
  hideToast();
  if (activeLayer) activeLayer.hidden = true;
  returnFocus = trigger || document.activeElement;
  activeLayer = byId(id);
  byId('header').inert = true;
  byId('collection').inert = true;
  activeLayer.hidden = false;
  activeLayer.querySelector('.dialog [data-close]').focus({ preventScroll: true });
}

function closeLayer() {
  if (!activeLayer) return;
  activeLayer.hidden = true;
  activeLayer = null;
  byId('header').inert = false;
  byId('collection').inert = false;
  const target = returnFocus?.isConnected && returnFocus.getClientRects().length ? returnFocus : byId('bag-button');
  target.focus({ preventScroll: true });
  returnFocus = null;
}

function openProduct(piece, trigger) {
  selectedPiece = piece;
  selectedSize = null;
  byId('product-code').innerHTML = `CAPSULE 001 / <span>OBJECT ${piece.number}</span>`;
  byId('product-title').textContent = piece.name;
  byId('product-price').textContent = money(piece.price);
  byId('product-description').textContent = piece.description;
  byId('product-color').textContent = piece.selectedColor;
  byId('product-swatch').style.backgroundColor = piece.swatch;
  byId('detail-art').innerHTML = art(piece);
  byId('materials-content').textContent = piece.materials;
  byId('size-options').innerHTML = sizes.map(size => `<button class="size-option" type="button" aria-pressed="false" data-size="${size}">${size}</button>`).join('');
  byId('size-guide-body').innerHTML = piece.measurements.map(([chest, length], index) => `<tr><th scope="row">${sizes[index]}</th><td>${chest}</td><td>${length}</td></tr>`).join('');
  byId('size-guide').hidden = true;
  byId('size-guide-button').setAttribute('aria-expanded', 'false');
  document.querySelectorAll('.fact-toggle').forEach(button => {
    button.setAttribute('aria-expanded', 'false');
    byId(button.getAttribute('aria-controls')).hidden = true;
  });
  byId('add-button').disabled = true;
  byId('add-button').querySelector('span').textContent = 'Choose a size';
  openLayer('product-layer', trigger);
  document.querySelector('.detail-body').scrollTop = 0;
}

function renderBag(focusAfter) {
  const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.piece.price * item.quantity, 0);
  byId('bag-count').textContent = totalQuantity;
  byId('bag-button').setAttribute('aria-label', `Shopping bag, ${totalQuantity} ${totalQuantity === 1 ? 'piece' : 'pieces'}`);
  byId('bag-subtotal').textContent = money(subtotal);
  byId('bag-total').textContent = money(subtotal);
  byId('bag-shipping').textContent = subtotal >= 150 ? 'Complimentary' : 'Calculated at checkout';
  byId('shipping-note').textContent = subtotal >= 150 ? 'Your order qualifies for free shipping.' : subtotal > 0 ? `${money(150 - subtotal)} away from free shipping.` : 'Free shipping on orders over $150.';
  byId('checkout-button').disabled = cart.length === 0;
  byId('checkout-message').hidden = true;

  if (!cart.length) {
    byId('bag-list').innerHTML = '<div class="bag-empty"><i class="ti ti-shopping-bag" aria-hidden="true"></i><h3>Room for something good.</h3><p>Your bag is empty. Find your everyday in capsule 001.</p><button class="text-button" data-close>Explore the collection <i class="ti ti-arrow-right" aria-hidden="true"></i></button></div>';
  } else {
    byId('bag-list').innerHTML = cart.map(item => `<article class="bag-row"><div class="bag-art">${art(item.piece)}</div><div><h3 class="bag-row-title">${item.piece.name}</h3><p class="bag-row-meta">${item.piece.selectedColor} / ${item.size}</p><div class="quantity-control" aria-label="Quantity for ${item.piece.name}, size ${item.size}"><button data-cart-action="decrease" data-key="${item.key}" aria-label="Decrease ${item.piece.name}, size ${item.size} quantity"><i class="ti ti-minus" aria-hidden="true"></i></button><span>${item.quantity}</span><button data-cart-action="increase" data-key="${item.key}" aria-label="Increase ${item.piece.name}, size ${item.size} quantity"><i class="ti ti-plus" aria-hidden="true"></i></button></div></div><div class="bag-row-end"><button class="remove-button" data-cart-action="remove" data-key="${item.key}" aria-label="Remove ${item.piece.name}, size ${item.size}"><i class="ti ti-x" aria-hidden="true"></i></button><span>${money(item.piece.price * item.quantity)}</span></div></article>`).join('');
  }

  if (focusAfter) {
    const target = byId('bag-list').querySelector(`[data-key="${focusAfter.key}"][data-cart-action="${focusAfter.action}"]`) || byId('bag-list').querySelector('button');
    target?.focus({ preventScroll: true });
  }
}

function openBag(trigger) {
  renderBag();
  openLayer('bag-layer', trigger);
}

function returnToCollection() {
  closeLayer();
  hideToast();
  rackOffset = 0;
  renderRack();
}

byId('previous-button').addEventListener('click', () => moveRack(-1));
byId('next-button').addEventListener('click', () => moveRack(1));
byId('home-button').addEventListener('click', returnToCollection);
byId('collection-button').addEventListener('click', returnToCollection);
byId('about-collection-button').addEventListener('click', returnToCollection);
byId('about-button').addEventListener('click', event => openLayer('about-layer', event.currentTarget));
byId('bag-button').addEventListener('click', event => openBag(event.currentTarget));
byId('toast-bag-button').addEventListener('click', () => openBag(byId('bag-button')));
byId('toast').addEventListener('focusin', () => clearTimeout(toastTimer));
byId('toast').addEventListener('focusout', event => {
  if (!byId('toast').contains(event.relatedTarget)) toastTimer = setTimeout(hideToast, 2000);
});

byId('size-options').addEventListener('click', event => {
  const button = event.target.closest('[data-size]');
  if (!button) return;
  selectedSize = button.dataset.size;
  byId('size-options').querySelectorAll('button').forEach(option => option.setAttribute('aria-pressed', String(option === button)));
  byId('add-button').disabled = false;
  byId('add-button').querySelector('span').textContent = `Add to bag — ${money(selectedPiece.price)}`;
});

byId('size-guide-button').addEventListener('click', event => {
  const expanded = event.currentTarget.getAttribute('aria-expanded') === 'true';
  event.currentTarget.setAttribute('aria-expanded', String(!expanded));
  byId('size-guide').hidden = expanded;
});

document.querySelectorAll('.fact-toggle').forEach(button => button.addEventListener('click', () => {
  const expanded = button.getAttribute('aria-expanded') === 'true';
  button.setAttribute('aria-expanded', String(!expanded));
  byId(button.getAttribute('aria-controls')).hidden = expanded;
}));

byId('add-button').addEventListener('click', () => {
  if (!selectedPiece || !selectedSize) return;
  const key = `${selectedPiece.id}-${selectedSize}`;
  const existing = cart.find(item => item.key === key);
  if (existing) existing.quantity += 1;
  else cart.push({ key, piece: selectedPiece, size: selectedSize, quantity: 1 });
  renderBag();
  closeLayer();
  byId('toast-message').textContent = `${selectedPiece.name} added to bag.`;
  byId('toast').hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(hideToast, 4500);
});

byId('bag-list').addEventListener('click', event => {
  const button = event.target.closest('[data-cart-action]');
  if (!button) return;
  const index = cart.findIndex(item => item.key === button.dataset.key);
  if (index === -1) return;
  const action = button.dataset.cartAction;
  const shouldRestoreFocus = document.activeElement === button;
  if (action === 'remove' || (action === 'decrease' && cart[index].quantity === 1)) cart.splice(index, 1);
  else cart[index].quantity += action === 'increase' ? 1 : -1;
  renderBag(shouldRestoreFocus ? { key: button.dataset.key, action } : null);
});

byId('checkout-button').addEventListener('click', () => {
  byId('checkout-message').textContent = 'Checkout requires a connected store. Your selected pieces remain in the bag.';
  byId('checkout-message').hidden = false;
});

byId('canvas').addEventListener('click', event => {
  if (event.target.closest('[data-close]')) closeLayer();
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    if (activeLayer) closeLayer();
    else hideToast();
    return;
  }
  if (activeLayer && event.key === 'Tab') {
    const focusable = [...activeLayer.querySelectorAll('.dialog button:not(:disabled), .dialog a[href]')].filter(element => element.getClientRects().length);
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  } else if (!activeLayer && document.activeElement?.closest('.rack')) {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      moveRack(event.key === 'ArrowLeft' ? -1 : 1);
    }
  }
});

narrowScreen.addEventListener('change', () => renderRack());
phoneScreen.addEventListener('change', () => renderRack());
renderRack();
renderBag();

// 样式表可访问但字体文件加载失败时，同样切换在线镜像。
document.fonts.ready.then(() => {
  const failed = [...document.fonts].some(font => ['DM Sans', 'Syne'].includes(font.family) && font.status === 'error');
  const stylesheet = byId('brand-fonts');
  if (failed && !stylesheet.href.startsWith('https://fonts.font.im/')) {
    stylesheet.href = 'https://fonts.font.im/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap';
  }
});
