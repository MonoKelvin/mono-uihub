(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const studies = {
    movement: { title: 'Movement, defined.', category: 'Identity', image: './assets/featured-motion.webp', alt: 'A black-and-white detail study of an athlete', focus: 'Visual identity · Art direction', description: 'A visual identity study built around the energy of movement. Close crops, a monochrome palette, and a clear typographic system connect every application.' },
    space: { title: 'A sense of space.', category: 'Digital', image: './assets/architecture-study.webp', alt: 'Curved modern architecture photographed from below', focus: 'Digital design · Editorial systems', description: 'An exploration of how architecture can shape a digital language. Sculptural forms meet a structured grid, with space and scale guiding the reading experience.' },
    velocity: { title: 'Velocity studies.', category: 'Motion', image: './assets/motion-study.webp', alt: 'A runner photographed with motion blur', focus: 'Motion · Image-making', description: 'An image-making study in speed and perception. Long exposures translate a single gesture into a continuous visual rhythm, balancing movement with a recognisable subject.' }
  };
  let started = false;
  let entrancePlayed = false;
  let animationContext;
  let menuTimeline;
  let menuOpen = false;
  let filter = 'All';
  let search = '';
  let collectionVersion = 0;
  let selectedProject = null;
  let selectedService = '';
  let selectedBudget = '';
  let preparedBrief = null;
  let preparing = false;
  const missingImages = new Set();

  function start() {
    if (started) return;
    started = true;
    bindNavigation();
    bindServices();
    bindProjects();
    bindBudget();
    bindBrief();
    bindImageRecovery();
    startMotion();
  }

  function startMotion() {
    if (!window.gsap) return;
    animationContext = gsap.matchMedia();
    animationContext.add('(prefers-reduced-motion: no-preference)', () => {
      if (!entrancePlayed) {
        entrancePlayed = true;
        const path = $('.orbit-path');
        const length = path.getTotalLength();
        gsap.timeline({ defaults: { ease: 'power3.out' } })
          .from('.hero-title', { y: 36, opacity: .3, duration: .8 }, 0)
          .from('.hero-portrait', { x: -22, y: 16, opacity: .75, duration: 1.1 }, 0)
          .fromTo(path, { strokeDasharray: length, strokeDashoffset: length }, { strokeDashoffset: 0, duration: 1.2, clearProps: 'strokeDasharray,strokeDashoffset' }, .05)
          .from('.talk-button', { opacity: 0, y: 12, duration: .55 }, .28)
          .from('.featured, .hero-intro', { opacity: 0, duration: .5 }, .3);
      }
      return () => {};
    });
    menuTimeline = gsap.timeline({ paused: true, defaults: { duration: .22, ease: 'power2.out' }, onReverseComplete: hideMobileMenu })
      .fromTo('#mobile-nav', { opacity: 0, y: -8 }, { opacity: 1, y: 0 });
  }

  function hideMobileMenu() {
    if (menuOpen) return;
    $('#mobile-nav').hidden = true;
  }

  function setMobileMenu(open, restoreFocus = false) {
    const menu = $('#mobile-nav');
    const trigger = $('.menu-toggle');
    menuOpen = open;
    trigger.setAttribute('aria-expanded', String(open));
    trigger.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    $('i', trigger).className = `ti ti-${open ? 'x' : 'menu-2'}`;
    menu.inert = !open;
    if (open) {
      menu.hidden = false;
      if (menuTimeline && !reducedMotion.matches) menuTimeline.play();
      else if (menuTimeline) menuTimeline.progress(1).pause();
    } else {
      if (menuTimeline && !reducedMotion.matches) menuTimeline.reverse();
      else { if (menuTimeline) menuTimeline.progress(0).pause(); hideMobileMenu(); }
      if (restoreFocus) trigger.focus();
    }
  }

  function bindNavigation() {
    $('.menu-toggle').addEventListener('click', () => setMobileMenu(!menuOpen));
    $$('#mobile-nav a').forEach(link => link.addEventListener('click', () => setMobileMenu(false)));
    document.addEventListener('click', event => { if (menuOpen && !$('.site-header').contains(event.target)) setMobileMenu(false); });
    document.addEventListener('keydown', event => { if (event.key === 'Escape' && menuOpen) setMobileMenu(false, true); });
    window.matchMedia('(min-width: 641px)').addEventListener('change', event => { if (event.matches) setMobileMenu(false); });
    const observer = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      $$('[data-nav]').forEach(link => {
        if (link.dataset.nav === visible.target.id) link.setAttribute('aria-current', 'page');
        else link.removeAttribute('aria-current');
      });
    }, { rootMargin: '-10% 0px -55% 0px', threshold: 0 });
    $$('main > section').forEach(section => observer.observe(section));
    $('[data-featured]').addEventListener('click', () => { filter = 'Identity'; search = ''; $('#project-search').value = ''; renderCollection(); });
    reducedMotion.addEventListener('change', () => { if (menuTimeline) menuTimeline.progress(menuOpen ? 1 : 0).pause(); if (!menuOpen) hideMobileMenu(); });
    window.addEventListener('pagehide', () => { observer.disconnect(); animationContext?.revert(); menuTimeline?.kill(); }, { once: true });
  }

  function bindServices() {
    $$('.service-toggle').forEach(button => button.addEventListener('click', () => {
      const content = document.getElementById(button.getAttribute('aria-controls'));
      const open = button.getAttribute('aria-expanded') !== 'true';
      button.setAttribute('aria-expanded', String(open));
      content.hidden = !open;
      button.closest('.service-item').classList.toggle('is-open', open);
      $('i', button).className = `ti ti-${open ? 'minus' : 'plus'}`;
    }));
    $$('[data-service]').forEach(button => button.addEventListener('click', () => goToContact(button.dataset.service)));
  }

  function goToContact(service = '') {
    if (service) chooseService(service);
    if (preparedBrief) editBrief();
    $('#contact').scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth' });
  }

  function collectionState(message, action = null) {
    const region = $('#collection-status');
    region.replaceChildren();
    const paragraph = document.createElement('p');
    paragraph.textContent = message;
    region.append(paragraph);
    if (action) {
      const button = document.createElement('button');
      button.className = 'pill-button';
      button.textContent = action.label;
      button.addEventListener('click', action.run);
      region.append(button);
    }
    region.hidden = false;
  }

  function renderCollection() {
    $('#collection-status').hidden = true;
    const query = search.trim().toLowerCase();
    let visibleCount = 0;
    $$('#project-grid [data-project]').forEach(card => {
      const study = studies[card.dataset.project];
      const visible = (filter === 'All' || study.category === filter) && `${study.title} ${study.category} ${study.focus}`.toLowerCase().includes(query);
      card.hidden = !visible;
      if (visible) visibleCount++;
    });
    $$('[data-filter]').forEach(button => {
      const active = button.dataset.filter === filter;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
      button.disabled = false;
    });
    $('#project-grid').classList.remove('is-loading');
    $('#project-grid').setAttribute('aria-busy', 'false');
    if (!visibleCount) collectionState('No studies match your search.', { label: 'Clear filters', run: () => { filter = 'All'; search = ''; $('#project-search').value = ''; renderCollection(); $('#project-search').focus(); } });
    else if (missingImages.size) collectionState('Some images could not be loaded.', { label: 'Reload images', run: reloadImages });
  }

  function updateCollection() {
    const version = ++collectionVersion;
    $('#project-grid').classList.add('is-loading');
    $('#project-grid').setAttribute('aria-busy', 'true');
    $$('[data-filter]').forEach(button => { button.disabled = true; });
    collectionState('Loading studies…');
    window.setTimeout(() => { if (version === collectionVersion) renderCollection(); }, 220);
  }

  function bindProjects() {
    $$('[data-filter]').forEach(button => button.addEventListener('click', () => { filter = button.dataset.filter; updateCollection(); }));
    $('#project-search').addEventListener('input', event => { search = event.target.value; updateCollection(); });
    $$('[data-project]').forEach(card => card.addEventListener('click', () => openProject(card.dataset.project)));
    $('#back-to-projects').addEventListener('click', () => {
      $('#project-detail').hidden = true;
      $('#project-browser').hidden = false;
      const card = $(`[data-project="${selectedProject}"]`);
      if (card && !card.hidden) card.focus({ preventScroll: true });
      $('#projects').scrollIntoView({ behavior: 'instant' });
    });
    $('#detail-contact').addEventListener('click', () => goToContact({ Identity: 'Brand identity', Digital: 'Digital experience', Motion: 'Art direction' }[studies[selectedProject].category]));
  }

  function openProject(id) {
    const study = studies[id];
    if (!study) return;
    selectedProject = id;
    $('#project-browser').hidden = true;
    $('#project-detail').hidden = false;
    $('#detail-title').textContent = study.title;
    $('#detail-category').textContent = study.category;
    $('#detail-description').textContent = study.description;
    $('#detail-focus').textContent = study.focus;
    $('#detail-image-status').hidden = true;
    $('#detail-image').style.opacity = '1';
    $('#detail-image').src = study.image;
    $('#detail-image').alt = study.alt;
    $('#projects').scrollIntoView({ behavior: 'instant' });
    $('#detail-title').focus({ preventScroll: true });
  }

  function bindImageRecovery() {
    $('#retry-detail-image').addEventListener('click', () => {
      if (!selectedProject) return;
      $('#detail-image-status p').textContent = 'Loading image…';
      $('#retry-detail-image').disabled = true;
      $('#detail-image').src = `${studies[selectedProject].image}?retry=${Date.now()}`;
    });
    $$('img').forEach(image => {
      image.addEventListener('error', () => {
        missingImages.add(image);
        if (image.id === 'detail-image') {
          image.style.opacity = '0';
          $('#detail-image-status').hidden = false;
          $('#detail-image-status p').textContent = 'Image unavailable.';
          $('#retry-detail-image').disabled = false;
        }
        if (image.closest('#project-grid')) renderCollection();
      });
      image.addEventListener('load', () => {
        missingImages.delete(image);
        if (image.id === 'detail-image') { image.style.opacity = '1'; $('#detail-image-status').hidden = true; $('#retry-detail-image').disabled = false; }
        if (!missingImages.size && !$('#collection-status').hidden && $('#collection-status').textContent.includes('images')) $('#collection-status').hidden = true;
      });
      if (image.complete && !image.naturalWidth) missingImages.add(image);
    });
  }

  function reloadImages() {
    if (!missingImages.size) { renderCollection(); return; }
    collectionState('Loading images…');
    [...missingImages].forEach(image => {
      const source = image.getAttribute('src').split('?')[0];
      image.src = `${source}?retry=${Date.now()}`;
    });
    window.setTimeout(() => { if (missingImages.size) collectionState('Images are still unavailable. Please try again.', { label: 'Retry images', run: reloadImages }); else renderCollection(); }, 1200);
  }

  function chooseService(value) {
    selectedService = value;
    $$('[data-choice]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.choice === value)));
    $('#service-error').textContent = '';
  }

  function setBudgetOpen(open, focusOption = false) {
    const trigger = $('#budget-trigger');
    const panel = $('#budget-options');
    trigger.setAttribute('aria-expanded', String(open));
    panel.hidden = !open;
    if (open && focusOption) {
      const option = $('[aria-selected="true"]', panel) || $('button:not(:disabled)', panel);
      option.focus();
    }
  }

  function bindBudget() {
    const trigger = $('#budget-trigger');
    const panel = $('#budget-options');
    trigger.addEventListener('click', () => setBudgetOpen(panel.hidden, true));
    trigger.addEventListener('keydown', event => { if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); setBudgetOpen(true, true); } });
    $$('[data-budget]').forEach(button => button.addEventListener('click', () => {
      selectedBudget = button.dataset.budget;
      $('#budget-value').textContent = selectedBudget;
      $$('[role="option"]', panel).forEach(option => option.setAttribute('aria-selected', String(option === button)));
      setBudgetOpen(false);
      trigger.focus();
    }));
    panel.addEventListener('keydown', event => {
      const options = $$('button:not(:disabled)', panel);
      let index = options.indexOf(document.activeElement);
      if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
        event.preventDefault();
        if (event.key === 'Home') index = 0;
        else if (event.key === 'End') index = options.length - 1;
        else index = (index + (event.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length;
        options[index].focus();
      }
    });
    document.addEventListener('keydown', event => { if (event.key === 'Escape' && !panel.hidden) { setBudgetOpen(false); trigger.focus(); } });
    document.addEventListener('click', event => { if (!event.target.closest('.budget-field')) setBudgetOpen(false); });
    document.addEventListener('focusin', event => { if (!event.target.closest('.budget-field')) setBudgetOpen(false); });
  }

  function validateBrief() {
    const errors = [];
    const checks = [
      ['contact-name', 'name-error', value => value.trim().length > 0, 'Please enter your name.'],
      ['contact-email', 'email-error', value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()), 'Please enter a valid email address.'],
      ['project-message', 'message-error', value => value.trim().length > 0, 'Tell us a little about your project.']
    ];
    checks.forEach(([id, errorId, valid, message]) => {
      const field = document.getElementById(id);
      const invalid = !valid(field.value);
      field.setAttribute('aria-invalid', String(invalid));
      document.getElementById(errorId).textContent = invalid ? message : '';
      if (invalid) errors.push(field);
    });
    $('#service-error').textContent = selectedService ? '' : 'Please choose a service.';
    if (!selectedService) errors.push($('[data-choice]'));
    if (errors.length) {
      $('#form-status').textContent = 'Please check the highlighted fields.';
      $('#form-status').classList.add('is-error');
      errors[0].focus();
      return false;
    }
    return true;
  }

  function showBrief() {
    const summary = $('#brief-summary');
    summary.replaceChildren();
    [['Name', preparedBrief.name], ['Email', preparedBrief.email], ['Service', preparedBrief.service], ['Budget', preparedBrief.budget]].forEach(([label, value]) => {
      const row = document.createElement('div');
      const term = document.createElement('dt');
      const detail = document.createElement('dd');
      term.textContent = label; detail.textContent = value;
      row.append(term, detail); summary.append(row);
    });
    const body = briefText();
    $('#email-brief').href = `mailto:hello@clevatess.example?subject=${encodeURIComponent(`Project enquiry — ${preparedBrief.service}`)}&body=${encodeURIComponent(body)}`;
    $('#project-form').hidden = true;
    $('#brief-result').hidden = false;
    $('#download-status').textContent = '';
    const heading = $('#brief-result h3');
    heading.setAttribute('tabindex', '-1');
    heading.focus({ preventScroll: true });
  }

  function briefText() {
    return `CLEVATESS — Project brief\n\nName: ${preparedBrief.name}\nEmail: ${preparedBrief.email}\nService: ${preparedBrief.service}\nBudget: ${preparedBrief.budget}\n\nProject outline\n${preparedBrief.message}\n`;
  }

  function editBrief() {
    $('#brief-result').hidden = true;
    $('#project-form').hidden = false;
    $('#form-status').textContent = '';
    $('#contact-name').focus({ preventScroll: true });
  }

  function bindBrief() {
    $$('[data-choice]').forEach(button => button.addEventListener('click', () => chooseService(button.dataset.choice)));
    $('#edit-brief').addEventListener('click', editBrief);
    $('#project-form').addEventListener('submit', async event => {
      event.preventDefault();
      if (preparing || !validateBrief()) return;
      preparing = true;
      setBudgetOpen(false);
      const button = $('#prepare-brief');
      const disabledStates = $$('input, textarea, button', event.currentTarget).map(control => [control, control.disabled]);
      disabledStates.forEach(([control]) => { control.disabled = true; });
      $('#form-status').classList.remove('is-error');
      $('#form-status').textContent = 'Preparing your project outline…';
      $('span', button).textContent = 'Preparing brief…';
      try {
        const brief = { name: $('#contact-name').value.trim(), email: $('#contact-email').value.trim(), service: selectedService, budget: selectedBudget || 'To be discussed', message: $('#project-message').value.trim() };
        await new Promise(resolve => window.setTimeout(resolve, 650));
        const file = new Blob([JSON.stringify(brief)], { type: 'application/json' });
        if (!file.size) throw new Error('Empty document');
        preparedBrief = brief;
        showBrief();
      } catch {
        $('#form-status').textContent = 'Your brief could not be prepared. Your details are saved in this form — please try again.';
        $('#form-status').classList.add('is-error');
      } finally {
        preparing = false;
        disabledStates.forEach(([control, disabled]) => { control.disabled = disabled; });
        $('span', button).textContent = 'Prepare project brief';
      }
    });
    $('#download-brief').addEventListener('click', () => {
      if (!preparedBrief) return;
      try {
        const file = new Blob([briefText()], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(file);
        const link = document.createElement('a');
        link.href = url; link.download = 'clevatess-project-brief.txt';
        document.body.append(link); link.click(); link.remove();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
        $('#download-status').classList.remove('is-error');
        $('#download-status').textContent = 'Your brief is ready to save.';
      } catch {
        $('#download-status').classList.add('is-error');
        $('#download-status').textContent = 'The download could not start. Try again, or open your brief in email.';
      }
    });
  }

  start();
})();
