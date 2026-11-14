const cars = [
  { id: 'porsche-911', name: 'Porsche 911 GT3', short: 'Porsche 911 GT3', brand: 'Porsche', category: 'Sports', seats: 2, doors: 2, image: 'porsche-side.png', rate: 1200, deposit: 3000, available: true, description: 'An unmistakable silhouette. A thrilling flat-six engine. The 911 turns every stretch of road into a reason to keep driving.', engine: '3.8L flat-six', power: '475 hp' },
  { id: 'audi-r8', name: 'Audi R8 V10 Performance', short: 'Audi R8 V10 Performance', brand: 'Audi', category: 'Sports', seats: 2, doors: 2, image: 'audi-r8.png', rate: 1600, deposit: 5000, available: true, description: 'Precision meets presence. With a naturally aspirated V10 and an exquisitely finished cabin, the R8 makes the journey as memorable as the destination.', engine: '5.2L V10', power: '602 hp' },
  { id: 'ferrari-458', name: 'Ferrari 458 Italia', short: 'Ferrari 458 Italia', brand: 'Ferrari', category: 'Sports', seats: 2, doors: 2, image: 'ferrari.png', rate: 2200, deposit: 7000, available: true, description: 'Italian craftsmanship. A naturally aspirated V8. The 458 pairs sculpted proportions with a drive that stays with you.', engine: '4.5L V8', power: '562 hp' },
  { id: 'mercedes-sl', name: 'Mercedes-Benz SL AMG', short: 'Mercedes-Benz SL AMG', brand: 'Mercedes-Benz', category: 'Convertible', seats: 2, doors: 2, image: 'mercedes.png', rate: 650, deposit: 2000, available: true, description: 'A refined companion for the city and the open road. Open-top comfort, confident performance, and timeless Mercedes-Benz design.', engine: '5.5L twin-turbo V8', power: '577 hp' },
  { id: 'bmw-coupe', name: 'BMW 4 Series Coupe', short: 'BMW 4 Series Coupe', brand: 'BMW', category: 'Coupe', seats: 4, doors: 2, image: 'bmw.png', rate: 950, deposit: 3000, available: true, description: 'Elegant proportions and effortless power. A beautifully balanced coupe for a coastal escape or a city weekend.', engine: '3.0L turbo', power: '300 hp' },
  { id: 'audi-a6', name: 'Audi A6 Sedan', short: 'Audi A6', brand: 'Audi', category: 'Sedan', seats: 5, doors: 4, image: 'audi-sedan.png', rate: 550, deposit: 2000, available: false, description: 'Space to unwind. Technology that feels natural. A beautifully balanced sedan for workdays and weekends alike.', engine: '2.0L turbo', power: '261 hp' }
];
const services = [
  ['Expert Service', 'Professional guidance for your perfect ride', 'porsche-side.png'],
  ['Flexible Rentals', 'A day, a week, or a little longer. Your choice.', 'bmw.png'],
  ['Fresh for Every Drive', 'Meticulously cleaned and prepared for you', 'audi-r8.png'],
  ['Effortless Booking', 'Your next extraordinary journey, made simple', 'ferrari.png'],
  ['Drive More. Enjoy More.', 'Personal service and benefits for returning drivers', 'mercedes.png']
];
const reviews = [
  ['The entire booking experience was seamless. I picked up a BMW for a weekend trip, and it felt brand new. Everything from the cleanliness to the pickup process was perfectly organized. Definitely the best rental experience I’ve had.', 'Daniel Roberts', 'London', 'DR'],
  ['The Porsche was immaculate, and the team helped us choose the perfect route out of Dubai. Hotel delivery was right on time. A genuinely personal service from start to finish.', 'Sarah Mitchell', 'Manchester', 'SM'],
  ['A beautiful car and no unnecessary paperwork. Every detail was explained clearly before pickup. We enjoyed every minute and will be back for our next trip.', 'Alex Laurent', 'Paris', 'AL'],
  ['From the first conversation to returning the keys, everything was effortless. The Ferrari made our anniversary weekend unforgettable.', 'Jordan Ellis', 'Dubai', 'JE']
];
const state = { brand: 'All', category: 'All', query: '', car: cars[0], location: 'Dubai showroom', picks: 0, reviews: 0, itinerary: '', message: '', started: false };
const $ = (selector) => document.querySelector(selector);
const money = (amount) => 'AED ' + amount.toLocaleString('en-US');
function specs(car) {
  return `<div class="car-specs"><span><i class="ti ti-car" aria-hidden="true"></i>${car.category === 'Sports' ? 'Sports Car' : car.category}</span><span><i class="ti ti-user" aria-hidden="true"></i>${car.seats} Seats</span><span><i class="ti ti-door" aria-hidden="true"></i>${car.doors} Doors</span><span><i class="ti ti-manual-gearbox" aria-hidden="true"></i>Automatic</span></div>`;
}
function carCard(car, index, full = false) {
  return `<article class="car-card"><button class="car-image" data-car="${car.id}" aria-label="View ${car.name}"><img src="./assets/${car.image}" alt="${car.short}" loading="lazy"></button><h3>${car.name}</h3>${specs(car)}${full ? `<div class="car-price"><strong>${money(car.rate)} / day</strong><span>${car.available ? 'Available' : 'Currently rented'}</span></div>` : ''}<button class="button button-light" data-car="${car.id}">View Details</button><button class="button ${index === 0 ? 'button-dark' : 'button-light'}" data-book="${car.id}" ${car.available ? '' : 'disabled'}>${car.available ? 'Book Now' : 'Unavailable'}</button></article>`;
}
function closeDropdowns(except) {
  const dropdown = document.activeElement.closest('.dropdown');
  document.querySelectorAll('.dropdown-trigger').forEach((trigger) => {
    if (trigger === except) return;
    if (dropdown === trigger.closest('.dropdown')) trigger.focus();
    trigger.setAttribute('aria-expanded', 'false');
    document.getElementById(trigger.getAttribute('aria-controls')).hidden = true;
  });
}
function showView(view) {
  document.querySelectorAll('main > .view').forEach((item) => { item.hidden = item.id !== view + '-view'; });
  document.querySelectorAll('.main-nav [data-route]').forEach((link) => {
    const active = link.dataset.route === view;
    link.classList.toggle('active', active);
    if (active) link.setAttribute('aria-current', 'page'); else link.removeAttribute('aria-current');
  });
  closeDropdowns();
  $('#mobile-nav').hidden = true;
  $('.menu-button').setAttribute('aria-expanded', 'false');
  $('.menu-button').setAttribute('aria-label', 'Open navigation');
}
function navigate(route) {
  if (location.hash === '#' + route) renderRoute(); else location.hash = route;
}
function renderRoute() {
  const route = location.hash.slice(1) || 'home';
  if (['about', 'services', 'faq', 'how-it-works'].includes(route)) {
    showView('home');
    requestAnimationFrame(() => document.getElementById(route).scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' }));
    return;
  }
  if (route.startsWith('car/')) {
    const car = cars.find((item) => item.id === route.slice(4));
    if (car) { renderDetail(car); showView('detail'); } else showView('fleet');
  } else if (['home', 'fleet', 'booking', 'contact', 'info'].includes(route)) {
    if (route === 'fleet') renderFleet();
    if (route === 'booking') updateBooking();
    if (route === 'info' && !$('#info-view').children.length) showInfo('Privacy Policy');
    showView(route);
  } else showView('home');
  window.scrollTo({ top: 0, behavior: 'instant' });
  document.title = (route === 'home' ? 'Drive Your Dream Car' : route.startsWith('car/') ? 'Your next drive' : route.charAt(0).toUpperCase() + route.slice(1)) + ' — Dream Drive';
  $('#main').focus({ preventScroll: true });
}
function renderFleet() {
  const filtered = cars.filter((car) => (state.brand === 'All' || car.brand === state.brand) && (state.category === 'All' || car.category === state.category) && car.name.toLowerCase().includes(state.query.toLowerCase()));
  $('#fleet-cars').innerHTML = filtered.map((car, index) => carCard(car, index, true)).join('');
  $('#empty-fleet').hidden = filtered.length !== 0;
  $('#result-count').textContent = filtered.length + (filtered.length === 1 ? ' car to discover' : ' cars to discover');
  $('#brand-filter-label').textContent = state.brand === 'All' ? 'All brands' : state.brand;
  document.querySelectorAll('[data-brand]').forEach((button) => {
    if (button.classList.contains('dropdown-option')) button.setAttribute('aria-current', String(button.dataset.brand === state.brand));
  });
  document.querySelectorAll('[data-category]').forEach((button) => {
    button.classList.toggle('active', button.dataset.category === state.category);
    button.setAttribute('aria-pressed', String(button.dataset.category === state.category));
  });
}
function renderDetail(car) {
  $('#detail-view').innerHTML = `<div class="page-intro"><a class="back-link" href="#fleet" data-route="fleet"><i class="ti ti-arrow-left" aria-hidden="true"></i>Back to our fleet</a></div><div class="detail-layout"><div class="detail-visual"><img src="./assets/${car.image}" alt="${car.name}"></div><div class="detail-content"><h1 id="detail-title">${car.name}</h1><p>${car.description}</p><div class="detail-rate">${money(car.rate)} <span>/ day</span></div>${specs(car)}<button class="button button-dark" data-book="${car.id}" ${car.available ? '' : 'disabled'}>${car.available ? 'Book this ride' : 'Currently unavailable'}</button><p class="fine-print">Standard insurance included. 250 km per day.<br>Refundable deposit: ${money(car.deposit)}.</p></div><div class="detail-features"><div><h2>A drive worth taking</h2><ul><li><i class="ti ti-check" aria-hidden="true"></i>${car.engine} engine · ${car.power}</li><li><i class="ti ti-check" aria-hidden="true"></i>Automatic transmission</li><li><i class="ti ti-check" aria-hidden="true"></i>Leather interior and climate control</li><li><i class="ti ti-check" aria-hidden="true"></i>Bluetooth and navigation</li></ul></div><div><h2>Good to know</h2><ul><li><i class="ti ti-check" aria-hidden="true"></i>Minimum age: 25 years</li><li><i class="ti ti-check" aria-hidden="true"></i>Valid driving licence and ID required</li><li><i class="ti ti-check" aria-hidden="true"></i>Minimum rental: 24 hours</li><li><i class="ti ti-check" aria-hidden="true"></i>Airport and hotel delivery available</li></ul><a class="back-link" href="#faq" data-section="faq">Rental questions<i class="ti ti-arrow-right" aria-hidden="true"></i></a></div></div></div>`;
}
function selectCar(id) {
  const car = cars.find((item) => item.id === id);
  if (!car?.available) return;
  state.car = car;
  $('#booking-review').hidden = true;
  updateBooking();
}
function parseDate(value) {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  if (!match) return null;
  const date = new Date(Number(match[3]), Number(match[2]) - 1, Number(match[1]));
  return date.getFullYear() === Number(match[3]) && date.getMonth() === Number(match[2]) - 1 && date.getDate() === Number(match[1]) ? date : null;
}
function bookingCosts() {
  const pickup = parseDate($('#pickup-date').value), end = parseDate($('#return-date').value);
  const days = pickup && end && end > pickup ? Math.round((end - pickup) / 86400000) : 0;
  const extras = [...$('#booking-form').querySelectorAll('.preferences input:checked')].reduce((sum, input) => sum + Number(input.value), 0);
  return { days, extras: extras * days, total: (state.car.rate + extras) * days };
}
function updateBooking() {
  const car = state.car, costs = bookingCosts();
  $('#booking-car-value').textContent = car.short;
  $('#booking-image').src = './assets/' + car.image;
  $('#booking-image').alt = car.short;
  $('#summary-name').textContent = car.short;
  $('#summary-specs').textContent = `${car.category} · ${car.seats} seats · Automatic`;
  $('#daily-rate').textContent = money(car.rate);
  $('#rental-duration').textContent = costs.days ? costs.days + (costs.days === 1 ? ' day' : ' days') : 'Choose your dates';
  $('#extras-cost').textContent = money(costs.extras);
  $('#total-cost').textContent = costs.days ? money(costs.total) : '—';
  $('#deposit-cost').textContent = money(car.deposit);
  $('#booking-cars').querySelectorAll('[data-select-car]').forEach((button) => button.setAttribute('aria-current', String(button.dataset.selectCar === car.id)));
}
function fieldError(inputId, errorId, message) {
  $('#' + inputId).setAttribute('aria-invalid', String(Boolean(message)));
  $('#' + errorId).textContent = message;
  return Boolean(message);
}
function validateBooking() {
  const pickup = parseDate($('#pickup-date').value), end = parseDate($('#return-date').value);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  let invalid = fieldError('pickup-date', 'pickup-error', !pickup ? 'Use DD/MM/YYYY.' : pickup < today ? 'Choose today or a future date.' : '');
  invalid = fieldError('return-date', 'return-error', !end ? 'Use DD/MM/YYYY.' : !pickup || end <= pickup ? 'Return must be after pickup.' : '') || invalid;
  invalid = fieldError('full-name', 'name-error', $('#full-name').value.trim().length < 2 ? 'Enter your full name.' : '') || invalid;
  invalid = fieldError('booking-email', 'email-error', !$('#booking-email').value || !$('#booking-email').validity.valid ? 'Enter a valid email address.' : '') || invalid;
  if (invalid) { $('#booking-form [aria-invalid="true"]').focus(); return false; }
  return true;
}
function downloadText(text, filename) {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob), link = document.createElement('a');
  link.href = url; link.download = filename; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
let toastTimer;
function toast(message) { clearTimeout(toastTimer); $('#toast').textContent = message; $('#toast').hidden = false; toastTimer = setTimeout(() => { $('#toast').hidden = true; }, 3500); }
function carousel(type, delta) {
  const isPicks = type === 'picks';
  const track = $(isPicks ? '#picks-track' : '#reviews-track');
  const viewport = track.parentElement, first = track.children[0];
  const gap = parseFloat(getComputedStyle(track).gap);
  const step = first.getBoundingClientRect().width + gap;
  const max = Math.max(0, track.scrollWidth - viewport.clientWidth);
  state[type] = Math.min(max, Math.max(0, state[type] + delta * step));
  track.style.transform = `translateX(-${state[type]}px)`;
  $(`[data-carousel="${type}-prev"]`).disabled = state[type] === 0;
  $(`[data-carousel="${type}-next"]`).disabled = state[type] >= max - 1;
}
function selectService(index) {
  document.querySelectorAll('[data-service]').forEach((tab, position) => { tab.classList.toggle('active', position === index); tab.setAttribute('aria-selected', String(position === index)); tab.tabIndex = position === index ? 0 : -1; });
  $('#service-name').textContent = services[index][0]; $('#service-description').textContent = services[index][1];
  $('#service-image').src = './assets/' + services[index][2];
  $('#service-image').alt = cars.find((car) => car.image === services[index][2]).short;
  $('#service-number').textContent = String(index + 1).padStart(2, '0');
  $('#service-card').setAttribute('aria-labelledby', 'service-tab-' + index);
}
function showInfo(title) {
  const content = {
    'Lease To Own': [['A longer-term relationship', 'Explore a monthly plan with an option to purchase at the end of the agreed term. Our team will explain the eligible cars, deposit, mileage allowance, and ownership terms.'], ['Start with a conversation', 'Tell us which car you have in mind and how long you would like to drive it. A personal quote and eligibility check are required before any agreement.']],
    'Image credits': [['Vehicle photography', 'Vehicle cutouts: pngimg.com. Licensed under Creative Commons Attribution–NonCommercial 4.0 (CC BY-NC 4.0). Images have been converted and resized for presentation. Noncommercial use only; obtain appropriate rights before commercial use.'], ['Architectural photography', 'Porsche architectural photograph: Pixabay, image 10041657. Pixabay Content License.'], ['Design reference', 'Dream Drive Luxury Car Rental Website by Rakibul Islam Joy on Dribbble.']],
    'Privacy Policy': [['Your information', 'Your contact details are used to plan your rental and respond to your enquiry. Only share the information needed for your journey.'], ['Your choices', 'You can request changes to your contact preferences through our team. Payment and identity documents should only be provided through a confirmed booking channel.']],
    'Terms & Conditions': [['Rental requirements', 'Drivers must be at least 25 years old and hold a valid driving licence. Rentals are subject to vehicle availability and identity verification.'], ['Rates and deposits', 'Rates are shown in AED. Standard insurance and 250 km per day are included. Additional distance, delivery and optional services may incur charges. A refundable security deposit is required.'], ['Before you drive', 'Confirm the vehicle condition and agreed rental terms with our team at pickup. A saved itinerary is not a confirmed reservation.']],
    'Cookie Policy': [['A fresh start', 'Your selections stay in this visit only. This page does not store rental details in your browser.'], ['External resources', 'Fonts and icons are delivered by external content providers. Contact our team if you have questions about privacy.']],
    'Journal': [['A weekend beyond the city', 'Leave the skyline behind and take the long way to Hatta. Winding roads, mountain air, and a car that makes the journey part of the destination.'], ['Choosing your next drive', 'A coupe for a quiet coastal escape. A convertible for an open-sky afternoon. A sports car for the road you have always wanted to take. Explore our fleet to find yours.']],
    'Follow Dream Drive': [['Stay in the loop', 'Discover new arrivals and ideas for your next journey. Choose email updates below, or speak to our team for the latest collection.']]
  };
  $('#info-view').innerHTML = `<div class="page-intro"><a class="back-link" href="#home" data-route="home"><i class="ti ti-arrow-left" aria-hidden="true"></i>Back to Dream Drive</a><h1 id="info-title"></h1></div><div class="info-content"></div>`;
  $('#info-title').textContent = title;
  const target = $('.info-content');
  (content[title] || content['Journal']).forEach(([heading, body]) => { const h = document.createElement('h2'), p = document.createElement('p'); h.textContent = heading; p.textContent = body; target.append(h, p); });
  const link = document.createElement('a'); link.href = '#contact'; link.dataset.route = 'contact'; link.className = 'button button-dark'; link.textContent = 'Talk to our team'; target.append(link);
  navigate('info');
}
function drawWheel() {
  const ns = 'http://www.w3.org/2000/svg';
  [500, 489, 478, 467, 456, 422].forEach((radius) => { const circle = document.createElementNS(ns, 'circle'); circle.setAttribute('cx', '550'); circle.setAttribute('cy', '550'); circle.setAttribute('r', radius); $('#wheel-rings').append(circle); });
  for (let i = 0; i < 36; i++) { const path = document.createElementNS(ns, 'path'); path.setAttribute('d', 'M 525 96 L 575 96 Q 582 96 583 102 L 580 121 Q 580 126 574 126 L 526 126 Q 520 126 520 121 L 517 102 Q 518 96 525 96 Z'); path.setAttribute('transform', `rotate(${i * 10} 550 550)`); $('#wheel-spokes').append(path); }
  for (let i = 0; i < 10; i++) { const path = document.createElementNS(ns, 'path'); path.setAttribute('d', 'M 523 372 L 496 148 Q 520 135 550 134 Q 580 135 604 148 L 577 372 M 530 372 L 526 177 Q 550 168 574 177 L 570 372'); path.setAttribute('transform', `rotate(${i * 36} 550 550)`); $('#wheel-spokes').append(path); }
}
function start() {
  if (state.started) return;
  state.started = true;
  $('#featured-cars').innerHTML = cars.slice(0, 3).map((car, index) => carCard(car, index)).join('');
  const pickCars = [cars[3], cars[4], cars[5], cars[0], cars[1], cars[2]];
  $('#picks-track').innerHTML = pickCars.map((car) => `<button class="pick-card" data-car="${car.id}"><img src="./assets/${car.image}" alt="${car.short}" loading="lazy"><span>${car.short}</span></button>`).join('');
  $('#reviews-track').innerHTML = reviews.map(([quote, name, city, initials]) => `<article class="review-card"><span class="quote-mark" aria-hidden="true">“</span><blockquote>${quote}</blockquote><div class="review-person"><span class="person-avatar" aria-hidden="true">${initials}</span><div><h3>${name}</h3><p>${city}</p></div></div></article>`).join('');
  $('#fleet-brands').innerHTML = ['All', 'Porsche', 'Audi', 'Ferrari', 'BMW', 'Mercedes-Benz'].map((brand) => `<button role="menuitem" class="dropdown-option" data-brand="${brand}" aria-current="${brand === 'All'}">${brand === 'All' ? 'All brands' : brand}<i class="ti ti-check" aria-hidden="true"></i></button>`).join('');
  $('#booking-cars').innerHTML = cars.map((car) => `<button type="button" role="menuitem" class="dropdown-option" data-select-car="${car.id}" ${car.available ? '' : 'disabled'}>${car.short}<i class="ti ti-check" aria-hidden="true"></i></button>`).join('');
  drawWheel();
  document.addEventListener('click', (event) => {
    const trigger = event.target.closest('.dropdown-trigger');
    if (trigger) { const open = trigger.getAttribute('aria-expanded') !== 'true'; closeDropdowns(trigger); trigger.setAttribute('aria-expanded', String(open)); document.getElementById(trigger.getAttribute('aria-controls')).hidden = !open; return; }
    if (!event.target.closest('.dropdown')) closeDropdowns();
    const item = event.target.closest('a, button'); if (!item || item.disabled) return;
    if (item.dataset.route) { event.preventDefault(); navigate(item.dataset.route); }
    if (item.dataset.section) { event.preventDefault(); navigate(item.dataset.section); }
    if (item.dataset.car) navigate('car/' + item.dataset.car);
    if (item.dataset.book) { selectCar(item.dataset.book); navigate('booking'); }
    if (item.dataset.selectCar) { selectCar(item.dataset.selectCar); closeDropdowns(); item.closest('.dropdown').querySelector('.dropdown-trigger').focus(); }
    if (item.dataset.brand) { state.brand = item.dataset.brand; state.category = 'All'; state.query = ''; $('#fleet-search').value = ''; renderFleet(); closeDropdowns(); navigate('fleet'); }
    if (item.dataset.category) { state.category = item.dataset.category; renderFleet(); }
    if (item.dataset.location) { state.location = item.dataset.location; $('#location-value').textContent = state.location; document.querySelectorAll('[data-location]').forEach((option) => option.setAttribute('aria-current', String(option === item))); closeDropdowns(); item.closest('.dropdown').querySelector('.dropdown-trigger').focus(); $('#booking-review').hidden = true; }
    if (item.dataset.service !== undefined) selectService(Number(item.dataset.service));
    if (item.dataset.carousel) { const [type, direction] = item.dataset.carousel.split('-'); carousel(type, direction === 'next' ? 1 : -1); }
    if (item.dataset.info) showInfo(item.dataset.info);
    const action = item.dataset.action;
    if (action === 'search') { navigate('fleet'); requestAnimationFrame(() => $('#fleet-search').focus()); }
    if (action === 'brand-other') { state.brand = 'All'; state.category = 'All'; state.query = item.textContent.trim(); $('#fleet-search').value = state.query; renderFleet(); navigate('fleet'); }
    if (action === 'reset-filters') { state.brand = 'All'; state.category = 'All'; state.query = ''; $('#fleet-search').value = ''; renderFleet(); }
    if (action === 'download-itinerary') { downloadText(state.itinerary, 'dream-drive-itinerary.txt'); toast('Itinerary downloaded'); }
    if (action === 'download-message') { downloadText(state.message, 'dream-drive-enquiry.txt'); toast('Message downloaded'); }
    if (item.classList.contains('menu-button')) { const open = $('#mobile-nav').hidden; $('#mobile-nav').hidden = !open; item.setAttribute('aria-expanded', String(open)); item.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation'); }
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') { const active = $('.dropdown-trigger[aria-expanded="true"]'), menuOpen = !$('#mobile-nav').hidden; closeDropdowns(); active?.focus(); $('#mobile-nav').hidden = true; $('.menu-button').setAttribute('aria-expanded', 'false'); $('.menu-button').setAttribute('aria-label', 'Open navigation'); if (menuOpen) $('.menu-button').focus(); }
    const dropdown = event.target.closest('.dropdown');
    if (dropdown && ['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
      event.preventDefault(); const trigger = dropdown.querySelector('.dropdown-trigger'), panel = dropdown.querySelector('.dropdown-panel');
      closeDropdowns(trigger); panel.hidden = false; trigger.setAttribute('aria-expanded', 'true');
      const options = [...panel.querySelectorAll('button:not(:disabled)')], index = options.indexOf(document.activeElement);
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? options.length - 1 : event.key === 'ArrowDown' ? (index + 1) % options.length : index < 0 ? options.length - 1 : (index - 1 + options.length) % options.length;
      options[next]?.focus();
    }
    const tab = event.target.closest('[data-service]');
    if (tab && ['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) { event.preventDefault(); const i = Number(tab.dataset.service), next = event.key === 'Home' ? 0 : event.key === 'End' ? 4 : (i + (event.key === 'ArrowRight' ? 1 : 4)) % 5; selectService(next); $(`[data-service="${next}"]`).focus(); }
  });
  $('#fleet-search').addEventListener('input', (event) => { state.query = event.target.value; renderFleet(); });
  $('#booking-form').addEventListener('input', (event) => {
    if (['pickup-date', 'return-date'].includes(event.target.id)) {
      const digits = event.target.value.replace(/\D/g, '').slice(0, 8);
      event.target.value = [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4)].filter(Boolean).join('/');
    }
    updateBooking(); $('#booking-review').hidden = true;
  });
  $('#booking-form').addEventListener('submit', (event) => {
    event.preventDefault(); if (!validateBooking()) return;
    const cost = bookingCosts();
    state.itinerary = `DREAM DRIVE\nYOUR RENTAL ITINERARY\n\n${state.car.name}\n${$('#pickup-date').value} — ${$('#return-date').value}\n${cost.days} days\nPickup: ${state.location}\nDriver: ${$('#full-name').value.trim()}\nEmail: ${$('#booking-email').value.trim()}\n\nDaily rate: ${money(state.car.rate)}\nExtras: ${money(cost.extras)}\nEstimated total: ${money(cost.total)}\nRefundable deposit: ${money(state.car.deposit)}\n\nThis itinerary is not a confirmed reservation. Contact our team to confirm availability and final pricing.\ninfo@dream-drive.com\n+971 4 578 9025`;
    $('#review-details').textContent = `${state.car.short} · ${cost.days} ${cost.days === 1 ? 'day' : 'days'} · ${state.location}. Estimated total ${money(cost.total)}. Contact our team to confirm availability.`;
    $('#booking-review').hidden = false; $('#booking-review').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'center' });
  });
  $('#contact-form').addEventListener('submit', (event) => {
    event.preventDefault(); const form = event.currentTarget; let invalid = false;
    [...form.querySelectorAll('input, textarea')].forEach((input) => { const bad = !input.value.trim() || !input.validity.valid; input.setAttribute('aria-invalid', String(bad)); invalid ||= bad; });
    if (invalid) { $('#contact-error').textContent = 'Enter your name, a valid email address, and a message.'; form.querySelector('[aria-invalid="true"]').focus(); return; }
    $('#contact-error').textContent = ''; state.message = `From: ${$('#contact-name').value.trim()}\nEmail: ${$('#contact-email').value.trim()}\n\n${$('#contact-message').value.trim()}`;
    $('#contact-mail-link').href = 'mailto:info@dream-drive.com?subject=' + encodeURIComponent('Dream Drive rental enquiry') + '&body=' + encodeURIComponent(state.message);
    $('#contact-result').hidden = false;
  });
  $('#contact-form').addEventListener('input', () => { $('#contact-result').hidden = true; });
  $('#newsletter-form').addEventListener('submit', (event) => {
    event.preventDefault(); const input = $('#newsletter-email'), status = $('#newsletter-status'), link = $('#newsletter-mail-link');
    link.hidden = true;
    if (!input.value || !input.validity.valid) { status.textContent = 'Enter a valid email address.'; status.className = 'error'; input.setAttribute('aria-invalid', 'true'); input.focus(); return; }
    input.setAttribute('aria-invalid', 'false'); status.className = '';
    link.href = 'mailto:info@dream-drive.com?subject=' + encodeURIComponent('Dream Drive email updates') + '&body=' + encodeURIComponent('Please send car news and rental updates to ' + input.value.trim() + '.');
    link.hidden = false; status.textContent = 'Your request is ready. Send it from your email app.';
  });
  $('#newsletter-email').addEventListener('input', () => { $('#newsletter-mail-link').hidden = true; $('#newsletter-status').textContent = ''; });
  window.addEventListener('hashchange', renderRoute);
  window.addEventListener('resize', () => { carousel('picks', 0); carousel('reviews', 0); });
  document.addEventListener('error', (event) => { if (event.target instanceof HTMLImageElement) event.target.alt = 'Image unavailable'; }, true);
  updateBooking(); renderRoute();
}
start();
