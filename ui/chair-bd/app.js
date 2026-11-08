const images = {
  eloriHero: 'https://pngimg.com/uploads/armchair/armchair_PNG7049.png',
  eloriFront: 'https://pngimg.com/uploads/armchair/armchair_PNG7049.png',
  eloriSide: 'https://pngimg.com/uploads/armchair/armchair_PNG7049.png',
  orbitGreen: 'https://pngimg.com/uploads/armchair/armchair_PNG7049.png',
  orbitYellow: 'https://pngimg.com/uploads/armchair/armchair_PNG7012.png',
  roseChair: 'https://pngimg.com/uploads/armchair/armchair_PNG7070.png',
  brownChair: 'https://pngimg.com/uploads/armchair/armchair_PNG7012.png',
  greenSofa: 'https://pngimg.com/uploads/sofa/sofa_PNG6954.png',
  blackSofa: 'https://pngimg.com/uploads/sofa/sofa_PNG6956.png',
  brownSofa: 'https://pngimg.com/uploads/sofa/sofa_PNG6955.png',
  redSofa: 'https://pngimg.com/uploads/sofa/sofa_PNG6936.png',
  avatarJohn: 'https://i.pravatar.cc/160?img=12',
  avatarAmelia: 'https://i.pravatar.cc/160?img=47',
  avatarMaya: 'https://i.pravatar.cc/160?img=44',
  avatarSophie: 'https://i.pravatar.cc/160?img=49',
  avatarOlivia: 'https://i.pravatar.cc/160?img=45',
};

const products = [
  { id: 'elori', name: 'Elori print armchair', image: 'eloriHero', colour: 'Teal', price: 319.44, original: 399, stock: 8, description: 'A generous seat, beautifully curved arms and a touch of colour for your favourite corner.' },
  { id: 'forest', name: 'Forest velvet armchair', image: 'orbitGreen', colour: 'Forest green', price: 319.44, original: 399, stock: 5, description: 'Soft green upholstery and an enveloping silhouette. A comfortable companion for slow afternoons.' },
  { id: 'ochre', name: 'Amber lounge armchair', image: 'brownChair', colour: 'Amber brown', price: 329, original: 399, stock: 4, description: 'Warm upholstery, a generous backrest and an inviting shape with a classic character.' },
  { id: 'rose', name: 'Rose lounge armchair', image: 'roseChair', colour: 'Dusty rose', price: 329, original: 399, stock: 6, description: 'A soft accent for your living space, with curved arms and a relaxed, welcoming seat.' },
  { id: 'rose-bench', name: '2-seater velvet bench', image: 'redSofa', colour: 'Rose', price: 597.60, original: 849, stock: 4, rating: 4.8, arrival: 3, sales: 83, description: 'Room for two, with generous cushions and a timeless shape. Made for evenings in.' },
  { id: 'daybed', name: 'Velvet day bed', image: 'brownSofa', colour: 'Warm brown', price: 301.33, original: 459, stock: 3, rating: 4.9, arrival: 5, sales: 74, featured: true, description: 'A quiet place to read, stretch out and take a moment. A low, comfortable profile for any room.' },
  { id: 'forest-bench', name: '2-seater fixed bench', image: 'greenSofa', colour: 'Forest green', price: 421.85, original: 599, stock: 5, rating: 4.7, arrival: 4, sales: 92, description: 'A compact sofa with a generous seat and a rich green finish. Comfort without taking over the room.' },
  { id: 'charcoal-bench', name: '2-seater velvet bench', image: 'blackSofa', colour: 'Charcoal', price: 597.60, original: 849, stock: 3, rating: 4.6, arrival: 2, sales: 68, description: 'Deep charcoal upholstery and soft, comfortable cushions. A versatile centrepiece for everyday living.' },
  { id: 'rose-lounge', name: 'Rose lounge chair', image: 'roseChair', colour: 'Dusty rose', price: 329, original: 399, stock: 6, rating: 4.5, arrival: 6, sales: 51, description: 'A little warmth and a comfortable place to settle in. A sculptural chair with a soft, inviting seat.' },
  { id: 'green-lounge', name: 'Forest lounge chair', image: 'orbitGreen', colour: 'Forest green', price: 319.44, original: 399, stock: 5, rating: 4.4, arrival: 1, sales: 46, description: 'Curved arms and an enveloping seat in deep green. A finishing touch for your favourite space.' },
];

const reviews = [
  { name: 'John Dalton', handle: '@jhondalton', image: 'avatarJohn', quote: "The print is even more beautiful in person, and the seat is just the right kind of soft. It has turned an unused corner of our home into everyone's favourite spot." },
  { name: 'Amelia Brooks', handle: '@ameliabrooks', image: 'avatarAmelia', quote: 'Beautifully made and so comfortable. I bought it for my reading corner, but it somehow makes the whole room feel more like home.' },
  { name: 'Maya Chen', handle: '@mayachen', image: 'avatarMaya', quote: 'The colour brings just the right amount of life to our living room. A lovely chair to look at, and an even better one to sit in.' },
  { name: 'Sophie Evans', handle: '@sophieevans', image: 'avatarSophie', quote: 'The perfect balance of character and comfort. The fabric feels wonderful, and the proportions are just right for our small apartment.' },
  { name: 'Olivia Reed', handle: '@oliviareed', image: 'avatarOlivia', quote: 'A thoughtful finishing touch for our new home. I love the soft seat and the way it pairs with our other furniture. We are already choosing our next piece.' },
];

const bag = new Map();
const dialog = document.getElementById('shop-dialog');
const money = value => '$' + value.toFixed(2);
const productById = id => products.find(product => product.id === id);
const discount = product => Math.floor((1 - product.price / product.original) * 100);
let selectedChair = 'elori';
let collectionSort = 'rated';
let collectionPage = 0;
let searchTimer;
let searchVersion = 0;
let toastTimer;
let started = false;

function showToast(message, error = false) {
  const toast = document.getElementById('toast');
  clearTimeout(toastTimer);
  toast.querySelector('span').textContent = message;
  toast.querySelector('i').className = error ? 'ti ti-alert-circle' : 'ti ti-check';
  toast.classList.toggle('is-error', error);
  toast.classList.add('is-visible');
  toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 3000);
}

function openPanel(panel) {
  const titles = { bag: 'Your shopping bag', search: 'Find your favourite', product: 'A closer look', contact: 'Talk to our team' };
  document.querySelectorAll('.dialog-panel').forEach(element => { element.hidden = element.id !== panel + '-panel'; });
  document.getElementById('dialog-title').textContent = titles[panel];
  if (panel === 'bag') renderBag();
  if (panel === 'search') renderSearch(document.getElementById('search-input').value);
  if (!dialog.open) dialog.showModal();
  if (panel === 'search') document.getElementById('search-input').focus();
}

function chooseChair(id) {
  if (id === selectedChair) return;
  selectedChair = id;
  const product = productById(id);
  const title = document.getElementById('hero-title');
  title.replaceChildren(document.createTextNode(product.name.replace(' armchair', '')), document.createElement('br'), document.createTextNode('armchair'));
  const image = document.getElementById('hero-chair');
  image.src = images[product.image];
  image.alt = product.name;
  const copy = document.querySelector('.hero-copy');
  copy.querySelector('.price-line strong').textContent = money(product.price);
  copy.querySelector('.price-line del').textContent = money(product.original);
  copy.querySelector('.price-line > span').textContent = '−' + discount(product) + '%';
  copy.querySelector('[data-buy]').dataset.buy = id;
  document.querySelectorAll('[data-colour]').forEach(button => {
    const active = button.dataset.colour === id;
    button.classList.toggle('is-selected', active);
    button.setAttribute('aria-pressed', String(active));
  });
}

function addToBag(id) {
  const product = productById(id);
  const quantity = bag.get(id) || 0;
  if (quantity >= product.stock) {
    showToast('All available pieces are already in your bag.', true);
    return;
  }
  bag.set(id, quantity + 1);
  renderBag();
  openPanel('bag');
}

function renderBag() {
  document.getElementById('bag-count').textContent = [...bag.values()].reduce((sum, quantity) => sum + quantity, 0);
  const container = document.getElementById('bag-items');
  document.getElementById('checkout-message').textContent = '';
  document.getElementById('bag-summary').hidden = bag.size === 0;
  if (!bag.size) {
    container.innerHTML = '<div class="empty-state"><i class="ti ti-shopping-bag" aria-hidden="true"></i><h3>A little room for something lovely.</h3><p>Your shopping bag is empty.</p><button class="buy-button" type="button" data-browse>Explore the collection</button></div>';
    return;
  }
  container.innerHTML = [...bag].map(([id, quantity]) => {
    const product = productById(id);
    return `<div class="bag-row"><img src="${images[product.image]}" alt="${product.name}"><div><h3>${product.name}</h3><p>${product.colour}</p><div class="quantity-control"><button type="button" data-quantity="${id}" data-change="-1" aria-label="Decrease ${product.name} quantity" ${quantity <= 1 ? 'disabled' : ''}><i class="ti ti-minus" aria-hidden="true"></i></button><span aria-label="Quantity">${quantity}</span><button type="button" data-quantity="${id}" data-change="1" aria-label="Increase ${product.name} quantity" ${quantity >= product.stock ? 'disabled' : ''}><i class="ti ti-plus" aria-hidden="true"></i></button><button class="remove-item" type="button" data-remove="${id}" aria-label="Remove ${product.name}"><i class="ti ti-trash" aria-hidden="true"></i></button></div></div><strong class="bag-row-price">${money(product.price * quantity)}</strong></div>`;
  }).join('');
  document.getElementById('bag-total').textContent = money([...bag].reduce((sum, [id, quantity]) => sum + productById(id).price * quantity, 0));
}

function showProduct(id) {
  const product = productById(id);
  document.getElementById('product-detail').innerHTML = `<div class="product-detail-layout"><img class="product-detail-image" src="${images[product.image]}" alt="${product.name}"><div class="product-detail-copy"><h3>${product.name}</h3><p>${product.description}</p><p>${product.colour} · ${product.stock} pieces available</p><div class="price-line"><strong>${money(product.price)}</strong><del>${money(product.original)}</del><span>−${discount(product)}%</span></div><button class="buy-button" type="button" data-buy="${id}">Add to bag</button></div></div>`;
  openPanel('product');
}

function chooseReview(index) {
  const review = reviews[index];
  document.getElementById('review-avatar').src = images[review.image];
  document.getElementById('review-avatar').alt = review.name;
  document.getElementById('review-quote').textContent = review.quote;
  document.getElementById('review-name').textContent = review.name;
  document.getElementById('review-handle').textContent = review.handle;
  document.querySelectorAll('.review-pagination [data-review]').forEach(button => {
    const active = Number(button.dataset.review) === index;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
  });
}

function renderCollection() {
  const narrow = window.matchMedia('(max-width: 999px)').matches;
  const pageSize = narrow ? 4 : 5;
  let collection = products.filter(product => product.rating);
  if (collectionSort === 'rated') {
    const order = ['green-lounge', 'rose-bench', 'daybed', 'forest-bench', 'charcoal-bench', 'rose-lounge'];
    collection.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
  } else {
    if (collectionSort === 'new') collection = collection.filter(product => product.arrival >= 3);
    const key = collectionSort === 'best' ? 'sales' : 'arrival';
    collection.sort((a, b) => b[key] - a[key]);
  }
  const offset = collectionPage * (narrow ? pageSize : 1);
  const visible = collection.slice(offset, offset + pageSize);
  document.getElementById('collection-track').innerHTML = visible.map(product => `<article class="product-card ${product.featured ? 'is-featured' : ''}"><button class="product-open" type="button" data-product="${product.id}" aria-label="View ${product.name}, ${product.colour}"><span class="product-image"><img src="${images[product.image]}" alt="${product.colour} ${product.name}" loading="lazy"></span><span class="product-title">${product.name}</span></button><div class="product-price"><span>−${discount(product)}%</span><del>${money(product.original)}</del><strong>${money(product.price)}</strong></div></article>`).join('');
  document.getElementById('collection-prev').disabled = collectionPage === 0;
  document.getElementById('collection-next').disabled = offset + pageSize >= collection.length;
  document.querySelectorAll('[data-sort]').forEach(button => {
    const active = button.dataset.sort === collectionSort;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-selected', String(active));
    button.tabIndex = active ? 0 : -1;
    if (active) document.getElementById('collection-panel').setAttribute('aria-labelledby', button.id);
  });
}

function renderSearch(query) {
  clearTimeout(searchTimer);
  const version = ++searchVersion;
  const container = document.getElementById('search-results');
  container.setAttribute('aria-busy', 'true');
  container.innerHTML = '<div class="loading-state" aria-label="Searching the collection"><span></span><span></span><span></span></div>';
  searchTimer = setTimeout(() => {
    if (version !== searchVersion) return;
    const term = query.trim().toLowerCase();
    const matches = products.filter(product => `${product.name} ${product.colour} ${product.description}`.toLowerCase().includes(term));
    container.setAttribute('aria-busy', 'false');
    if (!matches.length) {
      container.innerHTML = '<div class="empty-state"><i class="ti ti-search" aria-hidden="true"></i><h3>No furniture found.</h3><p></p><button class="buy-button" type="button" data-clear-search>View all furniture</button></div>';
      container.querySelector('p').textContent = `No matches for “${query.trim()}”. Try a colour or a type of chair.`;
      return;
    }
    container.innerHTML = matches.map(product => `<button class="search-result" type="button" data-product="${product.id}"><img src="${images[product.image]}" alt="${product.name}" loading="lazy"><span><strong>${product.name}</strong><small>${product.colour}</small></span><span class="result-price">${money(product.price)}</span></button>`).join('');
  }, 180);
}

function saveEnquiry(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const inputs = [...form.querySelectorAll('input, textarea')];
  const invalid = inputs.filter(input => !input.value.trim() || !input.checkValidity());
  inputs.forEach(input => input.setAttribute('aria-invalid', String(invalid.includes(input))));
  const message = document.getElementById('contact-message');
  message.classList.remove('is-success');
  if (invalid.length) {
    message.textContent = invalid.some(input => input.type === 'email' && input.value.trim()) ? 'Enter a valid email address.' : 'Fill in your name, email address and enquiry.';
    invalid[0].focus();
    return;
  }
  const submit = form.querySelector('button[type="submit"]');
  submit.disabled = true;
  const text = `Chair.Bd furniture enquiry\n\nName: ${form.elements.name.value.trim()}\nEmail: ${form.elements.email.value.trim()}\n\n${form.elements.enquiry.value.trim()}\n`;
  const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'chair-bd-enquiry.txt';
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  message.textContent = 'Enquiry saved to your device. It has not been sent.';
  message.classList.add('is-success');
  submit.disabled = false;
}

async function sharePage(network) {
  try {
    await navigator.clipboard.writeText(location.href);
    showToast(`Link copied. Share it on ${network}.`);
  } catch {
    showToast('Copy the page address from your browser to share it.', true);
  }
}

function fitHero() {
  const hero = document.querySelector('.hero');
  const width = hero.clientWidth;
  const compact = matchMedia('(min-width: 750px) and (max-width: 999px) and (max-height: 700px), (min-width: 1000px) and (max-height: 599px)').matches;
  const minimumWidth = compact ? Math.min(750, width) : 1000;
  const ratio = compact ? .47 : .6;
  const scale = width < 1000 && !compact ? 1 : Math.min(1, Math.max(minimumWidth / width, innerHeight / (width * ratio)));
  hero.style.setProperty('--hero-scale', scale);
}

function start() {
  if (started) return;
  started = true;
  fitHero();
  window.addEventListener('resize', fitHero);
  document.querySelectorAll('[data-image]').forEach(image => { image.src = images[image.dataset.image]; });
  renderCollection();
  renderBag();
  document.addEventListener('error', event => {
    if (event.target instanceof HTMLImageElement) event.target.classList.add('is-unavailable');
  }, true);

  document.addEventListener('click', event => {
    const target = event.target.closest('button');
    if (!target || target.disabled) return;
    if (target.dataset.open) openPanel(target.dataset.open);
    else if (target.dataset.buy) addToBag(target.dataset.buy);
    else if (target.dataset.colour) chooseChair(target.dataset.colour);
    else if (target.dataset.review !== undefined) chooseReview(Number(target.dataset.review));
    else if (target.dataset.product) showProduct(target.dataset.product);
    else if (target.dataset.sort) { collectionSort = target.dataset.sort; collectionPage = 0; renderCollection(); }
    else if (target.dataset.quantity) {
      const id = target.dataset.quantity;
      const quantity = bag.get(id) + Number(target.dataset.change);
      if (quantity >= 1 && quantity <= productById(id).stock) bag.set(id, quantity);
      renderBag();
      const sameButton = [...document.querySelectorAll('[data-quantity]')].find(button => button.dataset.quantity === id && button.dataset.change === target.dataset.change && !button.disabled);
      sameButton?.focus();
    } else if (target.dataset.remove) { bag.delete(target.dataset.remove); renderBag(); }
    else if (target.hasAttribute('data-browse')) { dialog.close(); document.getElementById('products').scrollIntoView(); }
    else if (target.hasAttribute('data-clear-search')) { document.getElementById('search-input').value = ''; renderSearch(''); }
    else if (target.dataset.share) sharePage(target.dataset.share);
  });

  document.getElementById('dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    const rect = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
  });
  document.getElementById('checkout-button').addEventListener('click', () => {
    document.getElementById('checkout-message').textContent = 'Checkout is unavailable until a payment service is connected. Your bag is unchanged.';
  });
  document.getElementById('collection-prev').addEventListener('click', () => { collectionPage -= 1; renderCollection(); });
  document.getElementById('collection-next').addEventListener('click', () => { collectionPage += 1; renderCollection(); });
  window.matchMedia('(max-width: 999px)').addEventListener('change', () => { collectionPage = 0; renderCollection(); });
  document.getElementById('search-input').addEventListener('input', event => renderSearch(event.target.value));
  document.getElementById('search-form').addEventListener('submit', event => { event.preventDefault(); renderSearch(document.getElementById('search-input').value); });
  document.getElementById('contact-form').addEventListener('submit', saveEnquiry);
  document.getElementById('contact-form').addEventListener('input', event => { event.target.removeAttribute('aria-invalid'); document.getElementById('contact-message').textContent = ''; });
  document.querySelector('.collection-tabs').addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    const tabs = [...document.querySelectorAll('[data-sort]')];
    let index = tabs.indexOf(document.activeElement);
    if (index < 0) return;
    event.preventDefault();
    if (event.key === 'Home') index = 0;
    else if (event.key === 'End') index = tabs.length - 1;
    else index = (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
    tabs[index].click();
    tabs[index].focus();
  });
  const navLinks = [...document.querySelectorAll('.side-nav a')];
  const observer = new IntersectionObserver(entries => {
    const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    navLinks.forEach(link => {
      const active = link.getAttribute('href') === '#' + visible.target.id;
      link.classList.toggle('is-active', active);
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }, { threshold: [0, .25, .5], rootMargin: '-5% 0px -40% 0px' });
  ['home', 'features', 'reviews', 'products'].forEach(id => observer.observe(document.getElementById(id)));
}

start();
