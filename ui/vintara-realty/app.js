const residences = [
  { id: 'deepkey', name: 'DeepKey House', city: 'London', location: 'Hampstead, London', bedrooms: 4, area: 286, type: 'Private residence', description: 'Sculptural terracotta walls, double-height glazing, and a quiet garden. A considered home where thoughtful architecture meets connected living.' },
  { id: 'maisonya', name: 'Maisonya Power', city: 'Lisbon', location: 'Estrela, Lisbon', bedrooms: 3, area: 224, type: 'City residence', description: 'Warm materials and generous light, with spaces that open naturally to the outdoors. An intimate city retreat with intelligent energy at its heart.' },
  { id: 'vintara', name: 'Vintara Residence', city: 'Barcelona', location: 'Pedralbes, Barcelona', bedrooms: 5, area: 340, type: 'Garden residence', description: 'A private courtyard, expansive living spaces, and a timeless material palette. Designed around slow mornings and effortless everyday life.' }
];

let started = false;
let activeFilter = 'all';
let dialogOpen = false;
let returnFocus = null;
let dialogTimeline = null;
let motionMedia = null;
let introPlayed = false;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const pageContent = document.getElementById('page-content');
const layer = document.getElementById('modal-layer');
const dialog = document.getElementById('dialog');
const dialogBody = document.getElementById('dialog-body');

function residenceArt() {
  return '<img src="./assets/terracotta-residence.webp" alt="" loading="lazy" decoding="async" draggable="false">';
}

function renderResidences() {
  const query = document.getElementById('property-search').value.trim().toLowerCase();
  const matches = residences.filter((property) => (activeFilter === 'all' || property.city === activeFilter) && `${property.name} ${property.city} ${property.location}`.toLowerCase().includes(query));
  document.getElementById('property-grid').innerHTML = matches.map((property) => `
    <article class="property-card">
      <button type="button" class="property-image property-image--${property.id}" data-property="${property.id}" aria-label="View ${property.name}">${residenceArt()}<span class="property-open"><i class="ti ti-arrow-up-right" aria-hidden="true"></i></span></button>
      <span class="property-location">${property.location}</span>
      <div class="property-title-row"><h3>${property.name}</h3><button type="button" data-property="${property.id}">Explore</button></div>
      <div class="property-specs"><span>${property.bedrooms} bedrooms</span><span>${property.area} m²</span><span>Smart living</span></div>
    </article>`).join('');
  document.getElementById('result-count').textContent = `${matches.length} ${matches.length === 1 ? 'residence' : 'residences'} to discover`;
  document.getElementById('empty-state').hidden = matches.length > 0;
}

function finishClose() {
  if (dialogOpen) return;
  layer.hidden = true;
  pageContent.inert = false;
  document.body.classList.remove('has-dialog');
  if (returnFocus?.isConnected) returnFocus.focus({ preventScroll: true });
}

function closeDialog() {
  if (!dialogOpen) return;
  dialogOpen = false;
  if (dialogTimeline && !reducedMotion.matches && dialogTimeline.progress() > 0) {
    dialogTimeline.timeScale(1.4).reverse();
  } else {
    dialogTimeline?.pause(0);
    finishClose();
  }
}

function showDialog(kicker, content) {
  if (!dialogOpen && layer.hidden) returnFocus = document.activeElement;
  document.getElementById('dialog-kicker').textContent = kicker;
  if (content instanceof DocumentFragment) dialogBody.replaceChildren(content);
  else dialogBody.innerHTML = content;
  dialogBody.scrollTop = 0;
  layer.hidden = false;
  pageContent.inert = true;
  document.body.classList.add('has-dialog');
  dialogOpen = true;
  if (dialogTimeline && !reducedMotion.matches) dialogTimeline.timeScale(1).play();
  else dialogTimeline?.progress(1).pause();
  dialog.focus({ preventScroll: true });
}

function openProperty(id) {
  const property = residences.find((item) => item.id === id);
  if (!property) return;
  showDialog('The SailingEscape collection', `<div class="detail-layout"><div class="detail-visual property-image--${property.id}">${residenceArt()}</div><div class="detail-info"><span>${property.type} / ${property.city}</span><h2 id="dialog-title">${property.name}</h2><p>${property.description}</p><dl class="detail-facts"><div><dt>Bedrooms</dt><dd>${property.bedrooms}</dd></div><div><dt>Living space</dt><dd>${property.area} m²</dd></div><div><dt>Location</dt><dd>${property.city}</dd></div></dl><p>Private outdoor space · Connected climate control · Natural materials</p><button type="button" class="solid-button" data-enquire="${property.id}">Enquire about this home<i class="ti ti-arrow-up-right" aria-hidden="true"></i></button></div></div>`);
}

function openView(view) {
  if (view === 'contact') {
    showDialog('A place to start', document.getElementById('contact-template').content.cloneNode(true));
    setupContactForm();
  } else if (view === 'branches') {
    showDialog('Our professional branches', `<h2 id="dialog-title">Closer to<br><em>your next home.</em></h2><p class="dialog-intro">Local knowledge. A shared point of view. Meet our teams in the cities we call home.</p><div class="branch-list">${[
      ['London', 'Hampstead', 'Monday–Friday · 9:00–18:00'],
      ['Lisbon', 'Estrela', 'Monday–Friday · 9:00–18:00'],
      ['Barcelona', 'Pedralbes', 'Monday–Friday · 9:00–18:00']
    ].map(([city, district, hours]) => `<article class="branch-row"><div><h3>${city} / ${district}</h3><p>${hours}</p></div><button class="text-button" type="button" data-branch="${city}">Plan a visit<i class="ti ti-arrow-up-right" aria-hidden="true"></i></button></article>`).join('')}</div>`);
  } else if (view === 'community') {
    showDialog('The SailingEscape community', `<h2 id="dialog-title">Good spaces.<br><em>Great company.</em></h2><p class="dialog-intro">A community built around thoughtful homes, shared interests, and a little more time for what matters.</p><div class="community-stories"><article class="community-story"><i class="ti ti-leaf" aria-hidden="true"></i><h3>Living with less</h3><p>Small, considered choices for a lighter footprint at home.</p><span class="story-meta">Architecture & everyday life</span></article><article class="community-story"><i class="ti ti-sun" aria-hidden="true"></i><h3>Room for rituals</h3><p>Spaces that make the everyday feel a little more special.</p><span class="story-meta">A slower kind of living</span></article><article class="community-story"><i class="ti ti-building-community" aria-hidden="true"></i><h3>Better together</h3><p>Meet the people and places behind our connected neighborhoods.</p><span class="story-meta">People & places</span></article></div>`);
  } else if (view === 'careers') {
    showDialog('Careers at SailingEscape', `<h2 id="dialog-title">Build something<br><em>worth living in.</em></h2><p class="dialog-intro">Bring your perspective to a team working at the intersection of architecture, technology, and everyday life.</p><div class="career-list">${[
      ['Architectural Designer', 'London · Design · Full-time'],
      ['Resident Experience Lead', 'Lisbon · Community · Full-time'],
      ['Smart Home Specialist', 'Barcelona · Technology · Full-time']
    ].map(([role, location]) => `<article class="career-row"><div><h3>${role}</h3><p>${location}</p></div><button type="button" class="text-button" data-career="${role}">Get in touch<i class="ti ti-arrow-up-right" aria-hidden="true"></i></button></article>`).join('')}</div>`);
  } else if (view === 'menu') {
    showDialog('SailingEscape', '<h2 id="dialog-title">Explore.</h2><nav class="mobile-nav" aria-label="Main navigation"><a href="#home">Home</a><a href="#residences">Products</a><button type="button" data-open="community">Community</button><button type="button" data-open="careers">Careers</button><a href="#about">About us</a><button type="button" data-open="contact">Contact Us</button></nav>');
  }
}

function setupContactForm() {
  const form = document.getElementById('contact-form');
  const nameInput = document.getElementById('contact-name');
  const emailInput = document.getElementById('contact-email');
  const messageInput = document.getElementById('contact-message');
  const trigger = document.getElementById('interest-trigger');
  const options = document.getElementById('interest-options');
  const selectedValue = document.getElementById('interest-value');
  const submit = document.getElementById('create-enquiry');
  const download = document.getElementById('download-enquiry');
  const status = document.getElementById('form-status');
  let enquiry = null;

  function clearDraft() {
    enquiry = null;
    download.hidden = true;
    status.textContent = '';
    status.removeAttribute('data-state');
    submit.innerHTML = 'Create enquiry <i class="ti ti-arrow-up-right" aria-hidden="true"></i>';
  }

  function closeSelect(restoreFocus = false) {
    options.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
    if (restoreFocus) trigger.focus();
  }

  function openSelect() {
    options.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');
    options.querySelector('[aria-selected="true"]').focus();
  }

  trigger.addEventListener('click', () => options.hidden ? openSelect() : closeSelect(true));
  trigger.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      openSelect();
    }
  });
  options.addEventListener('click', (event) => {
    const option = event.target.closest('[data-interest]');
    if (!option || option.disabled) return;
    selectedValue.textContent = option.dataset.interest;
    options.querySelectorAll('[role="option"]').forEach((item) => {
      const selected = item === option;
      item.setAttribute('aria-selected', String(selected));
      item.classList.toggle('is-selected', selected);
    });
    clearDraft();
    closeSelect(true);
  });
  options.addEventListener('keydown', (event) => {
    const choices = [...options.querySelectorAll('[data-interest]:not(:disabled)')];
    const current = choices.indexOf(document.activeElement);
    if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
      event.preventDefault();
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? choices.length - 1 : (current + (event.key === 'ArrowDown' ? 1 : -1) + choices.length) % choices.length;
      choices[next].focus();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      closeSelect(true);
    } else if (event.key === 'Tab') {
      closeSelect(true);
    }
  });
  form.addEventListener('click', (event) => {
    if (!event.target.closest('.custom-select')) closeSelect();
  });
  form.addEventListener('input', (event) => {
    clearDraft();
    if (event.target === nameInput || event.target === emailInput) {
      event.target.removeAttribute('aria-invalid');
      document.getElementById(event.target === nameInput ? 'name-error' : 'email-error').textContent = '';
    }
  });
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (submit.disabled) return;
    closeSelect();
    const nameError = nameInput.value.trim() ? '' : 'Please enter your name.';
    const emailError = !emailInput.value.trim() ? 'Please enter your email address.' : emailInput.validity.typeMismatch ? 'Please enter a valid email address.' : '';
    document.getElementById('name-error').textContent = nameError;
    document.getElementById('email-error').textContent = emailError;
    nameInput.setAttribute('aria-invalid', String(Boolean(nameError)));
    emailInput.setAttribute('aria-invalid', String(Boolean(emailError)));
    if (nameError || emailError) {
      (nameError ? nameInput : emailInput).focus();
      return;
    }
    submit.disabled = true;
    form.setAttribute('aria-busy', 'true');
    status.dataset.state = 'loading';
    status.textContent = 'Preparing your enquiry…';
    try {
      await new Promise((resolve) => requestAnimationFrame(resolve));
      if (!form.isConnected) return;
      enquiry = new Blob([
        `SAILINGESCAPE — PERSONAL ENQUIRY\n\nName: ${nameInput.value.trim()}\nEmail: ${emailInput.value.trim()}\nInterest: ${selectedValue.textContent}\n\nYour plans\n${messageInput.value.trim() || 'I would like to find out more.'}\n`
      ], { type: 'text/plain;charset=utf-8' });
      status.dataset.state = 'success';
      status.textContent = 'Your enquiry is ready. Download it to share with your advisor.';
      submit.innerHTML = 'Update enquiry <i class="ti ti-check" aria-hidden="true"></i>';
      download.hidden = false;
    } catch {
      status.dataset.state = 'error';
      status.textContent = 'Your enquiry could not be prepared. Please try again.';
    } finally {
      submit.disabled = false;
      form.removeAttribute('aria-busy');
    }
  });
  download.addEventListener('click', () => {
    if (!enquiry) return;
    try {
      const url = URL.createObjectURL(enquiry);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'sailingescape-enquiry.txt';
      document.body.append(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      status.dataset.state = 'error';
      status.textContent = 'The download could not start. Please try again.';
    }
  });
}

function chooseInterest(value, message) {
  openView('contact');
  const option = [...document.querySelectorAll('[data-interest]')].find((item) => item.dataset.interest === value);
  option.click();
  document.getElementById('contact-message').value = message;
  document.getElementById('contact-name').focus({ preventScroll: true });
}

function startMotion() {
  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  if (!dialogTimeline) {
    dialogTimeline = gsap.timeline({ paused: true, onReverseComplete: finishClose })
      .fromTo('#modal-scrim', { opacity: 0 }, { opacity: 1, duration: .26, ease: 'power2.out' }, 0)
      .fromTo('#dialog', { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: .32, ease: 'power3.out' }, 0);
  }
  motionMedia?.revert();
  motionMedia = gsap.matchMedia();
  motionMedia.add({ desktop: '(min-width: 701px)', mobile: '(max-width: 700px)', reduce: '(prefers-reduced-motion: reduce)' }, (context) => {
    if (context.conditions.reduce) return;
    if (!introPlayed) {
      introPlayed = true;
      const intro = gsap.timeline({ defaults: { ease: 'power2.out' } });
      intro.from('.architecture', { opacity: 0, yPercent: 1.5, duration: .55 }, 0)
        .from('.title-layer', { opacity: 0, duration: .4 }, .08)
        .from('.site-header, .hotspot, .cut-card, .start-button, .join-link, .hero-description', { opacity: 0, duration: .32 }, .2);
    }
    if (context.conditions.desktop) {
      gsap.timeline({ scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: .5 }, defaults: { ease: 'none' } })
        .to('.architecture', { yPercent: -8, duration: 1 }, 0)
        .to('.title-layer', { yPercent: -32, opacity: .45, duration: 1 }, 0);
    }
    gsap.from('.section-heading-row', { clipPath: 'inset(0 0 100% 0)', duration: .6, ease: 'power3.out', scrollTrigger: { trigger: '.section-heading-row', start: 'top 90%', once: true } });
    gsap.from('.about-section h2, .about-copy', { opacity: 0, y: 16, duration: .5, stagger: .06, ease: 'power2.out', scrollTrigger: { trigger: '.about-section', start: 'top 85%', once: true } });
  });
  document.fonts.ready.then(() => ScrollTrigger.refresh());
}

function start() {
  if (started) return;
  started = true;
  renderResidences();
  document.getElementById('property-search').addEventListener('input', renderResidences);
  document.querySelector('.filter-group').addEventListener('click', (event) => {
    const button = event.target.closest('[data-filter]');
    if (!button) return;
    activeFilter = button.dataset.filter;
    document.querySelectorAll('[data-filter]').forEach((item) => {
      const active = item === button;
      item.classList.toggle('is-active', active);
      item.setAttribute('aria-pressed', String(active));
    });
    renderResidences();
  });
  document.getElementById('reset-search').addEventListener('click', () => {
    document.getElementById('property-search').value = '';
    document.querySelector('[data-filter="all"]').click();
    document.getElementById('property-search').focus({ preventScroll: true });
  });
  document.addEventListener('click', (event) => {
    const action = event.target.closest('[data-open], [data-property], [data-enquire], [data-branch], [data-career]');
    if (action) {
      if (action.dataset.open) openView(action.dataset.open);
      else if (action.dataset.property) openProperty(action.dataset.property);
      else if (action.dataset.enquire) {
        const property = residences.find((item) => item.id === action.dataset.enquire);
        chooseInterest('Finding a residence', `I would like to learn more about ${property.name} in ${property.city}.`);
      } else if (action.dataset.branch) chooseInterest('Visiting a branch', `I would like to arrange a visit to your ${action.dataset.branch} branch.`);
      else if (action.dataset.career) chooseInterest('Joining the team', `I am interested in the ${action.dataset.career} position.`);
    }
    const anchor = event.target.closest('a[href^="#"]');
    if (anchor) {
      const target = document.getElementById(anchor.getAttribute('href').slice(1));
      if (target) {
        event.preventDefault();
        closeDialog();
        target.scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth', block: 'start' });
      }
    }
    const selectPanel = document.getElementById('interest-options');
    if (selectPanel && !selectPanel.hidden && !event.target.closest('.custom-select')) {
      selectPanel.hidden = true;
      document.getElementById('interest-trigger').setAttribute('aria-expanded', 'false');
    }
  });
  document.getElementById('dialog-close').addEventListener('click', closeDialog);
  document.getElementById('modal-scrim').addEventListener('click', closeDialog);
  document.addEventListener('keydown', (event) => {
    if (!dialogOpen) return;
    if (event.key === 'Escape') {
      const selectPanel = document.getElementById('interest-options');
      if (selectPanel && !selectPanel.hidden) {
        selectPanel.hidden = true;
        const trigger = document.getElementById('interest-trigger');
        trigger.setAttribute('aria-expanded', 'false');
        trigger.focus();
      } else closeDialog();
      event.preventDefault();
    } else if (event.key === 'Tab') {
      const controls = [...dialog.querySelectorAll('button:not(:disabled), a[href], input, textarea, [tabindex="0"]')].filter((element) => element.getClientRects().length > 0);
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || document.activeElement === dialog)) {
        event.preventDefault();
        first.focus();
      }
    }
  });
  document.querySelectorAll('.avatar img').forEach((image) => {
    image.addEventListener('error', () => { image.hidden = true; image.parentElement.classList.add('is-unavailable'); });
    if (image.complete && !image.naturalWidth) { image.hidden = true; image.parentElement.classList.add('is-unavailable'); }
  });
  startMotion();
  reducedMotion.addEventListener('change', () => {
    if (!reducedMotion.matches || !dialogTimeline) return;
    dialogTimeline.progress(dialogOpen ? 1 : 0).pause();
    if (!dialogOpen) finishClose();
  });
  window.addEventListener('pagehide', () => motionMedia?.revert());
  window.addEventListener('pageshow', (event) => { if (event.persisted) startMotion(); });
}

start();
