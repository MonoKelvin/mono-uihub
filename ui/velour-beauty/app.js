const products = [
  {
    id: 'serum', name: 'The Dew Serum', category: 'skincare', kind: 'Daily hydration',
    subtitle: 'Hydrating facial serum', price: 48, size: '30 ml / 1.0 fl oz',
    image: './assets/dew-serum-branded.webp', alt: 'Cyan Velour Dew Serum bottle with brand lettering and pink botanical linework',
    description: 'A lightweight layer of moisture for your morning or evening ritual. A fresh, dewy finish, without the weight.',
    use: 'Press 2–3 drops into clean skin before your moisturiser.'
  },
  {
    id: 'cream', name: 'The Cloud Cream', category: 'skincare', kind: 'Soft daily care',
    subtitle: 'Everyday facial moisturiser', price: 54, size: '50 ml / 1.7 fl oz',
    image: './assets/cloud-cream-branded.webp', alt: 'Cyan Velour Cloud Cream jar with an ivory lid, pink rim and printed botanical details',
    description: 'A soft, comforting cream for the part of your routine that should feel effortless. Smooth it on, take a breath, and get on with your day.',
    use: 'Massage a small amount into your face and neck after your serum.'
  },
  {
    id: 'tint', name: 'The Bare Tint', category: 'makeup', kind: 'Your skin, softly',
    subtitle: 'Sheer skin tint · Light neutral', price: 42, size: '30 ml / 1.0 fl oz',
    image: './assets/skin-tint-branded.webp', alt: 'Cyan Velour Bare Tint bottle with elegant lettering and a small pink collar',
    description: 'A sheer veil of colour with a natural-looking finish. A little coverage, a little softness, and plenty of you. Available in light neutral.',
    use: 'Blend a small amount with fingertips, working from the centre of your face outwards.'
  },
  {
    id: 'fragrance', name: 'The Petal Essence', category: 'fragrance', kind: 'A quiet signature',
    subtitle: 'Eau de parfum', price: 86, size: '50 ml / 1.7 fl oz',
    image: './assets/petal-fragrance-branded.webp', alt: 'Cyan Velour Petal Essence bottle with ivory cap and pink botanical decoration',
    description: 'A clean floral impression, opening with citrus and settling into soft petals and warm woods. Something personal, rather than something loud.',
    use: 'Spritz lightly onto your wrists or neck. Let the fragrance settle naturally.'
  }
];

const bag = new Map();
const currencies = {
  USD: { country: 'United States', rate: 1 },
  GBP: { country: 'United Kingdom', rate: .79 },
  EUR: { country: 'European Union', rate: .92 }
};
let currency = 'USD';
let detailProduct = null;
let detailQuantity = 1;
let toastTimer;
const grid = document.querySelector('#product-grid');
const bagDialog = document.querySelector('#bag-dialog');
const searchDialog = document.querySelector('#search-dialog');
const productDialog = document.querySelector('#product-dialog');
const searchInput = document.querySelector('#search-input');
const toast = document.querySelector('#toast');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let productAnimations = [];
let motionMedia;
let motionInitialized = false;

function money(value) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 2 }).format(value * currencies[currency].rate);
}

function renderProducts() {
  grid.innerHTML = products.map((product, index) => `
    <article class="product-card" data-category="${product.category}" data-product="${product.id}">
      <div class="product-visual">
        <span class="product-kind">${product.kind}</span><span class="product-number">0${index + 1}</span>
        <span class="product-ghost" aria-hidden="true">${product.name.split(' ')[1].toLowerCase()}</span>
        <button class="product-image-button" data-detail="${product.id}" aria-label="View ${product.name}">
          <span class="product-image-motion"><img class="product-image" src="${product.image}" alt="${product.alt}" loading="lazy" width="1024" height="1536"></span>
        </button>
        <button class="quick-add" data-add="${product.id}" aria-label="Add ${product.name} to bag"><span>Add to bag</span><i class="ti ti-plus" aria-hidden="true"></i></button>
      </div>
      <div class="product-info"><div><button class="product-name" data-detail="${product.id}">${product.name}</button><p>${product.subtitle}</p></div><span class="product-price" data-price="${product.price}">${money(product.price)}</span></div>
    </article>
  `).join('');
}

function filterProducts(category) {
  productAnimations.forEach(({ timeline }) => timeline.progress(1));
  grid.classList.toggle('is-filtered', category !== 'all');
  const visibleProducts = products.filter(product => category === 'all' || product.category === category);
  document.querySelectorAll('.product-card').forEach(card => {
    const wasHidden = card.hidden;
    card.hidden = category !== 'all' && card.dataset.category !== category;
    if (wasHidden && !card.hidden && !reducedMotion.matches) {
      card.animate([{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 260, easing: 'cubic-bezier(.23,1,.32,1)' });
    }
  });
  document.querySelectorAll('[data-filter]').forEach(button => {
    const active = button.dataset.filter === category;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  document.querySelector('#filter-status').textContent = `${visibleProducts.length} ${category === 'all' ? 'essential' : category} products`;
  if (window.ScrollTrigger) ScrollTrigger.refresh(true);
}

function openDialog(dialog) {
  document.querySelectorAll('dialog[open]').forEach(open => { if (open !== dialog) open.close(); });
  if (dialog === searchDialog) renderSearch();
  if (dialog === bagDialog) {
    renderBag();
    hideToast();
  }
  if (!dialog.open) dialog.showModal();
  if (dialog === searchDialog) searchInput.focus();
}

function hideToast() {
  clearTimeout(toastTimer);
  toast.classList.remove('visible');
}

function notify(message) {
  clearTimeout(toastTimer);
  document.querySelector('#toast-text').textContent = message;
  toast.classList.add('visible');
  toastTimer = setTimeout(hideToast, 4200);
}

function addToBag(id, quantity = 1) {
  const current = bag.get(id) || 0;
  if (current + quantity > 9) {
    notify('You can add up to 9 of each essential.');
    return false;
  }
  bag.set(id, current + quantity);
  renderBag();
  notify(`${products.find(product => product.id === id).name} added to bag`);
  const count = document.querySelector('.bag-count');
  if (!reducedMotion.matches) count.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.18)' }, { transform: 'scale(1)' }], { duration: 300 });
  return true;
}

function renderBag() {
  let count = 0;
  let subtotal = 0;
  bag.forEach((quantity, id) => {
    count += quantity;
    subtotal += products.find(product => product.id === id).price * quantity;
  });
  document.querySelector('.bag-count').textContent = count;
  document.querySelector('.bag-trigger').setAttribute('aria-label', `Open shopping bag, ${count} items`);
  document.querySelector('#bag-title-count').textContent = `(${count})`;
  document.querySelector('#bag-subtotal').textContent = money(subtotal);
  document.querySelector('#bag-footer').hidden = count === 0;
  document.querySelector('#checkout-message').textContent = '';
  document.querySelector('#shipping-note').textContent = count === 0 ? 'A few good things, waiting to be yours.' : subtotal >= 75 ? 'Your order qualifies for complimentary shipping.' : `${money(75 - subtotal)} away from complimentary shipping.`;
  document.querySelector('#bag-items').innerHTML = count === 0 ? `
    <div class="bag-empty"><i class="ti ti-shopping-bag" aria-hidden="true"></i><h3>A little room for beauty.</h3><p>Your bag is empty. Find a few good things.</p><button class="primary-button" id="empty-bag-shop">Explore the edit <i class="ti ti-arrow-right" aria-hidden="true"></i></button></div>
  ` : [...bag].map(([id, quantity]) => {
    const product = products.find(item => item.id === id);
    return `<article class="bag-item"><button class="bag-item-image" data-detail="${id}" aria-label="View ${product.name}"><img src="${product.image}" alt="${product.alt}"></button><div class="bag-item-content"><div class="bag-item-top"><h3>${product.name}</h3><span>${money(product.price * quantity)}</span></div><p>${product.size}</p><div class="bag-item-bottom"><div class="quantity-picker"><button data-quantity="${id}" data-change="-1" aria-label="Decrease ${product.name} quantity" ${quantity === 1 ? 'disabled' : ''}><i class="ti ti-minus" aria-hidden="true"></i></button><span aria-label="Quantity">${quantity}</span><button data-quantity="${id}" data-change="1" aria-label="Increase ${product.name} quantity" ${quantity === 9 ? 'disabled' : ''}><i class="ti ti-plus" aria-hidden="true"></i></button></div><button class="remove-item" data-remove="${id}" aria-label="Remove ${product.name}">Remove</button></div></div></article>`;
  }).join('');
}

function renderDetail(id) {
  detailProduct = products.find(product => product.id === id);
  detailQuantity = 1;
  const product = detailProduct;
  document.querySelector('#product-detail').innerHTML = `
    <div class="detail-layout"><div class="detail-media"><img src="${product.image}" alt="${product.alt}"></div><div class="detail-content"><span class="section-label">VELOUR · ${product.category.toUpperCase()}</span><h2 id="detail-title">${product.name}</h2><p class="detail-subtitle">${product.subtitle}</p><p class="detail-price" data-price="${product.price}">${money(product.price)}</p><p class="detail-description">${product.description}</p><div class="detail-spec"><span>Size</span><span>${product.size}</span></div><div class="detail-add-row"><div class="quantity-picker"><button id="detail-decrease" aria-label="Decrease quantity" disabled><i class="ti ti-minus" aria-hidden="true"></i></button><span id="detail-quantity">1</span><button id="detail-increase" aria-label="Increase quantity"><i class="ti ti-plus" aria-hidden="true"></i></button></div><button class="primary-button" id="detail-add">Add to bag <i class="ti ti-plus" aria-hidden="true"></i></button></div><p class="detail-delivery">Complimentary shipping on orders ${money(75)}+</p><details class="detail-how"><summary>How to make it yours <i class="ti ti-plus" aria-hidden="true"></i></summary><p>${product.use}</p></details><p class="detail-feedback" id="detail-feedback" role="status"></p></div></div>
  `;
  openDialog(productDialog);
}

function updateDetailQuantity(change) {
  detailQuantity = Math.max(1, Math.min(9, detailQuantity + change));
  document.querySelector('#detail-quantity').textContent = detailQuantity;
  document.querySelector('#detail-decrease').disabled = detailQuantity === 1;
  document.querySelector('#detail-increase').disabled = detailQuantity === 9;
}

function renderSearch() {
  const query = searchInput.value.trim().toLowerCase();
  const results = products.filter(product => `${product.name} ${product.category} ${product.subtitle}`.toLowerCase().includes(query));
  document.querySelector('#search-label').textContent = query ? 'Your search results' : 'Explore the edit';
  document.querySelector('#search-count').textContent = `${results.length} essentials`;
  document.querySelector('#clear-search').disabled = !query;
  document.querySelector('#search-results').innerHTML = results.length ? results.map(product => `<button class="search-result" data-detail="${product.id}"><img src="${product.image}" alt="${product.alt}"><span><strong>${product.name}</strong><small>${product.subtitle}</small></span><span>${money(product.price)}</span></button>`).join('') : '<div class="search-empty"><strong>No essentials found.</strong><p>Try “serum”, “cream”, “tint”, or “fragrance”.</p></div>';
}

const information = {
  shipping: { title: 'Shipping & returns', content: '<h3>A little care, on us.</h3><p>Complimentary standard shipping on orders $75 and above. Orders below $75 have a $6 shipping fee. Allow 3–5 business days after dispatch.</p><h3>Changed your mind?</h3><p>Unopened products in their original packaging can be returned within 30 days of delivery. For hygiene reasons, opened cosmetics cannot be returned.</p>' },
  care: { title: 'Customer care', content: '<p>For product questions, start with the details on each essential. You’ll find the size, finish, and how to use it.</p><p>For help with an existing order, have your order number ready. Customer care is available Monday–Friday, 9am–5pm Eastern Time.</p>' },
  privacy: { title: 'Your privacy matters.', content: '<p>This page does not create an account or collect payment details. Your product selections are cleared when the page is refreshed.</p><p>Fonts and icons are provided by external content delivery networks. No newsletter request is sent from this page.</p>' }
};

function openInformation(type) {
  const dialog = document.querySelector('#info-dialog');
  if (type === 'currency') {
    document.querySelector('#info-title').textContent = 'Make yourself at home.';
    document.querySelector('#info-content').innerHTML = `<p>Choose your region and preferred currency.</p><div class="currency-options">${Object.entries(currencies).map(([code, item]) => `<button data-currency="${code}" aria-pressed="${code === currency}">${item.country}<span>${code}${code === currency ? ' · Selected' : ''}</span></button>`).join('')}</div>`;
  } else {
    document.querySelector('#info-title').textContent = information[type].title;
    document.querySelector('#info-content').innerHTML = information[type].content;
  }
  openDialog(dialog);
}

function setCurrency(code) {
  currency = code;
  document.querySelector('.currency').innerHTML = `${currencies[code].country} · ${code} ${money(0).replace(/[\d.,\s]/g, '')} <i class="ti ti-chevron-down" aria-hidden="true"></i>`;
  document.querySelectorAll('[data-price]').forEach(element => { element.textContent = money(Number(element.dataset.price)); });
  document.querySelector('.announcement span').textContent = `Complimentary shipping on orders ${money(75)}+`;
  renderBag();
  renderSearch();
  openInformation('currency');
}

document.addEventListener('click', event => {
  const button = event.target.closest('button, a');
  if (!button) return;
  if (button.dataset.open) openDialog(document.getElementById(button.dataset.open));
  if (button.hasAttribute('data-close')) button.closest('dialog').close();
  if (button.dataset.detail) renderDetail(button.dataset.detail);
  if (button.dataset.add && addToBag(button.dataset.add)) animateBagAddition(button, button.dataset.add);
  if (button.dataset.filter) filterProducts(button.dataset.filter);
  if (button.dataset.category) {
    filterProducts(button.dataset.category);
    document.querySelector('#menu-dialog').close();
  }
  if (button.hasAttribute('data-menu-link')) document.querySelector('#menu-dialog').close();
  if (button.dataset.quantity) {
    const id = button.dataset.quantity;
    bag.set(id, Math.max(1, Math.min(9, bag.get(id) + Number(button.dataset.change))));
    renderBag();
    const updated = document.querySelector(`[data-quantity="${id}"][data-change="${button.dataset.change}"]`);
    if (updated && !updated.disabled) updated.focus({ preventScroll: true });
  }
  if (button.dataset.remove) {
    bag.delete(button.dataset.remove);
    renderBag();
    document.querySelector('.bag-dialog [data-close]').focus({ preventScroll: true });
  }
  if (button.dataset.info) openInformation(button.dataset.info);
  if (button.dataset.currency) setCurrency(button.dataset.currency);
  if (button.id === 'detail-decrease') updateDetailQuantity(-1);
  if (button.id === 'detail-increase') updateDetailQuantity(1);
  if (button.id === 'detail-add') {
    if (addToBag(detailProduct.id, detailQuantity)) productDialog.close();
    else document.querySelector('#detail-feedback').textContent = 'You can add up to 9 of each essential.';
  }
  if (button.id === 'clear-search') { searchInput.value = ''; renderSearch(); searchInput.focus(); }
  if (button.id === 'toast-bag') openDialog(bagDialog);
  if (button.id === 'empty-bag-shop') { bagDialog.close(); document.querySelector('#shop').scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth' }); }
  if (button.id === 'checkout-button') document.querySelector('#checkout-message').textContent = 'Checkout is temporarily unavailable. Your bag is still here. Please try again later.';
});

searchInput.addEventListener('input', renderSearch);
document.querySelector('#search-form').addEventListener('submit', event => event.preventDefault());
document.querySelector('#newsletter-form').addEventListener('submit', event => {
  event.preventDefault();
  document.querySelector('#newsletter-message').textContent = 'We couldn’t connect right now. Your email hasn’t been submitted. Please try again later.';
});

document.querySelectorAll('dialog').forEach(dialog => {
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
});

renderProducts();
renderBag();
renderSearch();

const initialState = new URLSearchParams(window.location.search).get('state');
if (initialState === 'bag') { bag.set('serum', 1); bag.set('cream', 1); openDialog(bagDialog); }
if (initialState === 'empty-bag') openDialog(bagDialog);
if (initialState === 'search') openDialog(searchDialog);
if (initialState === 'product') renderDetail('serum');

function initMotion() {
  if (motionInitialized || !window.gsap || !window.ScrollTrigger) return;
  motionInitialized = true;
  gsap.registerPlugin(ScrollTrigger);
  motionMedia = gsap.matchMedia();

  motionMedia.add({
    desktop: '(min-width: 901px) and (min-height: 720px)',
    compact: '(max-width: 900px), (max-height: 719px)',
    reduce: '(prefers-reduced-motion: reduce)'
  }, context => {
    if (context.conditions.reduce) return;
    const desktop = context.conditions.desktop;
    productAnimations = [];
    const intro = gsap.timeline({ defaults: { ease: 'power3.out', duration: .85 } });
    if (window.scrollY < 50) {
      intro.from('.hero-watermark > span', { yPercent: 105, autoAlpha: 0, duration: 1.15 }, 0)
        .from('.hero-media', { clipPath: 'inset(0% 0% 14% 0%)', duration: 1.25, ease: 'power3.inOut' }, .12)
        .from('.hero-copy .line-mask > *', { yPercent: 110, stagger: .075 }, .4)
        .from('.hero-copy p, .hero-cta', { y: 15, autoAlpha: 0, stagger: .055, duration: .6 }, .6)
        .from('.hero-caption, .hero-scroll', { autoAlpha: 0, duration: .45 }, .8);
    }

    if (desktop) {
      gsap.to('.hero-image', { yPercent: 9, scale: 1.045, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: .7 } });
    }

    function revealLines(heading, trigger) {
      return gsap.from(heading.querySelectorAll('.line-mask > *'), {
        yPercent: 110, autoAlpha: 0, duration: .85, stagger: .075, ease: 'power3.out',
        scrollTrigger: { trigger, start: 'top 85%', once: true }
      });
    }
    revealLines(document.querySelector('#shop-title'), document.querySelector('.section-heading'));
    gsap.from('.shop-heading-right', { y: 18, autoAlpha: 0, duration: .7, ease: 'power3.out', scrollTrigger: { trigger: '.section-heading', start: 'top 80%', once: true } });

    document.querySelectorAll('.product-card').forEach(card => {
      const timeline = gsap.timeline({
        defaults: { ease: 'power3.out' },
        scrollTrigger: { trigger: card, start: 'top 87%', once: true }
      });
      timeline.from(card.querySelector('.product-image-button'), { y: 55, autoAlpha: 0, scale: .95, duration: .95 }, 0)
        .from(card.querySelector('.product-ghost'), { x: -25, autoAlpha: 0, duration: .85 }, .08)
        .from(card.querySelector('.product-info'), { y: 14, autoAlpha: 0, duration: .6 }, .22);
      productAnimations.push({ card, timeline });
    });

    const paths = document.querySelectorAll('.botanical-lines path');
    if (desktop) {
      paths.forEach(path => {
        const length = path.getTotalLength();
        gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
      });
      const signature = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: '.fragrance-story', pin: '.fragrance-scene', start: 'top 80px',
          end: () => `+=${Math.round(window.innerHeight * 1.1)}`, scrub: .8,
          invalidateOnRefresh: true
        }
      });
      signature.fromTo('.fragrance-product', { scale: .79, rotation: -8, y: 40 }, { scale: 1.09, rotation: 4, y: -15, duration: 2.2 }, 0)
        .fromTo('.fragrance-copy .line-mask > *', { yPercent: 110 }, { yPercent: 0, duration: .6, stagger: .1 }, 0)
        .to(paths, { strokeDashoffset: 0, duration: 1.4, stagger: .06 }, .25)
        .fromTo('.fragrance-word', { xPercent: -8 }, { xPercent: 8, duration: 2.2 }, 0)
        .from('.fragrance-notes > span', { y: 18, autoAlpha: 0, duration: .35, stagger: .12 }, 1.1)
        .to('.story-progress span', { scaleX: 1, duration: 2.2 }, 0);
    } else {
      revealLines(document.querySelector('#fragrance-title'), document.querySelector('.fragrance-copy'));
      gsap.from('.fragrance-product', { scale: .89, rotation: -5, autoAlpha: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '.fragrance-art', start: 'top 85%', once: true } });
      paths.forEach(path => {
        const length = path.getTotalLength();
        gsap.fromTo(path, { strokeDasharray: length, strokeDashoffset: length }, {
          strokeDashoffset: 0, duration: 1.4, ease: 'power2.inOut',
          scrollTrigger: { trigger: '.fragrance-art', start: 'top 82%', once: true }
        });
      });
    }

    revealLines(document.querySelector('#philosophy-title'), document.querySelector('.philosophy'));
    gsap.from('.philosophy-principles article', { y: 22, autoAlpha: 0, duration: .65, stagger: .075, ease: 'power3.out', scrollTrigger: { trigger: '.philosophy-bottom', start: 'top 85%', once: true } });
    revealLines(document.querySelector('#newsletter-title'), document.querySelector('.newsletter'));
    gsap.from('.footer-wordmark', { yPercent: 28, autoAlpha: 0, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: '.site-footer', start: 'top 85%', once: true } });

    return () => { productAnimations = []; };
  });

  motionMedia.add('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)', () => {
    const cleanups = [];
    document.querySelectorAll('.product-image-button').forEach(button => {
      const image = button.querySelector('.product-image-motion');
      const toX = gsap.quickTo(image, 'rotationX', { duration: .45, ease: 'power3.out' });
      const toY = gsap.quickTo(image, 'rotationY', { duration: .45, ease: 'power3.out' });
      let bounds;
      const enter = () => { bounds = button.getBoundingClientRect(); };
      const move = event => {
        if (!bounds) return;
        toX((.5 - (event.clientY - bounds.top) / bounds.height) * 7);
        toY(((event.clientX - bounds.left) / bounds.width - .5) * 7);
      };
      const leave = () => { toX(0); toY(0); bounds = null; };
      button.addEventListener('pointerenter', enter);
      button.addEventListener('pointermove', move);
      button.addEventListener('pointerleave', leave);
      cleanups.push(() => {
        button.removeEventListener('pointerenter', enter);
        button.removeEventListener('pointermove', move);
        button.removeEventListener('pointerleave', leave);
      });
    });
    return () => cleanups.forEach(cleanup => cleanup());
  });

  document.fonts.ready.then(() => ScrollTrigger.refresh(true));
  document.querySelectorAll('main img').forEach(image => {
    if (!image.complete) image.addEventListener('load', () => ScrollTrigger.refresh(true), { once: true });
  });
  ScrollTrigger.refresh();
}

function animateBagAddition(button, id) {
  if (!window.gsap || reducedMotion.matches) return;
  const source = button.closest('.product-card').querySelector('.product-image').getBoundingClientRect();
  const target = document.querySelector('.bag-trigger').getBoundingClientRect();
  const image = document.createElement('img');
  image.src = products.find(product => product.id === id).image;
  image.className = 'bag-flight';
  image.alt = '';
  image.setAttribute('aria-hidden', 'true');
  document.body.append(image);
  gsap.set(image, { x: source.left + source.width / 2 - 32, y: source.top + source.height / 2 - 40 });
  gsap.to(image, { x: target.left, y: target.top, scale: .25, autoAlpha: 0, duration: .75, ease: 'power3.inOut', onComplete: () => image.remove() });
}

initMotion();
document.querySelector('#scrolltrigger-script').addEventListener('load', initMotion, { once: true });
window.addEventListener('pagehide', () => {
  if (motionMedia) motionMedia.revert();
  motionInitialized = false;
});
window.addEventListener('pageshow', event => { if (event.persisted) initMotion(); });
