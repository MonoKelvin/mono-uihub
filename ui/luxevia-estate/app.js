(() => {
  'use strict';

  const properties = [
    { id: 'seabrook', name: 'Seabrook Residence', location: 'Malibu', type: 'Villa', price: 32000, bedrooms: 5, baths: 6, area: '6,400', description: 'An ocean-facing residence with generous glass walls, private terraces and an infinity pool. Quiet architecture, warm interiors and uninterrupted coastal views.' },
    { id: 'the-palisades', name: 'The Palisades', location: 'Santa Monica', type: 'House', price: 18000, bedrooms: 4, baths: 4, area: '4,200', description: 'A light-filled family home minutes from the coast. Open living spaces flow into a landscaped garden, with a private study and a sheltered outdoor lounge.' },
    { id: 'marina-house', name: 'Marina House', location: 'Miami', type: 'Villa', price: 24000, bedrooms: 4, baths: 5, area: '4,850', description: 'Waterfront living with a private pool, sunlit entertaining spaces and a calm material palette. A generous terrace looks out over the marina.' },
    { id: 'skyline', name: 'Skyline Penthouse', location: 'New York', type: 'Penthouse', price: 26000, bedrooms: 3, baths: 3, area: '3,100', description: 'A penthouse above the city with panoramic views, a private roof terrace and an expansive living room. Thoughtfully appointed for effortless urban living.' },
    { id: 'mayfair', name: 'Mayfair Apartment', location: 'London', type: 'Apartment', price: 11500, bedrooms: 2, baths: 2, area: '1,850', description: 'A refined apartment in a historic neighbourhood, pairing generous proportions with contemporary interiors. Parks, galleries and restaurants are a short walk away.' },
    { id: 'palm', name: 'Palm Vista Villa', location: 'Dubai', type: 'Villa', price: 42000, bedrooms: 6, baths: 7, area: '7,600', description: 'A secluded waterfront villa with a private beach, shaded courtyards and spacious guest suites. Indoor and outdoor living are connected throughout.' }
  ];
  const filterOptions = {
    location: [{ value: '', label: 'All locations' }, ...['Malibu', 'Santa Monica', 'Miami', 'New York', 'London', 'Dubai'].map(value => ({ value, label: value }))],
    type: [{ value: '', label: 'All Type' }, ...['Villa', 'House', 'Apartment', 'Penthouse'].map(value => ({ value, label: value })), { value: 'Commercial', label: 'Commercial · unavailable', disabled: true }],
    price: [{ value: '', label: '$10,000 - $50,000+' }, { value: '10000-20000', label: '$10,000 - $20,000' }, { value: '20000-35000', label: '$20,000 - $35,000' }, { value: '35000-', label: '$35,000+' }],
    bedrooms: [{ value: '', label: 'Any' }, ...[1, 2, 3, 4, 5, 6].map(value => ({ value: String(value), label: `${value}${value === 6 ? '+' : ''} bedrooms` }))]
  };
  const filters = { location: '', type: '', price: '', bedrooms: '' };
  const layer = document.querySelector('#modal-layer');
  const dialog = layer.querySelector('.dialog');
  const dialogBody = document.querySelector('#dialog-body');
  const title = document.querySelector('#dialog-title');
  const toast = document.querySelector('#toast');
  const results = document.querySelector('#property-results');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let returnFocus;
  let currentProperty = null;
  let searchTimer;
  let toastTimer;
  let started = false;

  const money = value => '$' + value.toLocaleString('en-US');

  function closeDropdowns(restoreFocus = false) {
    document.querySelectorAll('[aria-expanded="true"]').forEach(trigger => {
      trigger.setAttribute('aria-expanded', 'false');
      const panel = document.getElementById(trigger.getAttribute('aria-controls'));
      if (panel) panel.hidden = true;
      if (restoreFocus) trigger.focus();
    });
  }

  function toggleDropdown(trigger) {
    const wasOpen = trigger.getAttribute('aria-expanded') === 'true';
    closeDropdowns();
    if (wasOpen) return;
    const panel = document.getElementById(trigger.getAttribute('aria-controls'));
    panel.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');
    (panel.querySelector('[aria-selected="true"]:not(:disabled)') || panel.querySelector('button:not(:disabled)'))?.focus();
  }

  function renderFilter(key) {
    const panel = document.querySelector(`#${key}-options`);
    panel.innerHTML = filterOptions[key].map(option => `<button type="button" role="option" class="option" data-select-filter="${key}" data-value="${option.value}" aria-selected="${filters[key] === option.value}"${option.disabled ? ' disabled aria-disabled="true"' : ''}>${option.label}</button>`).join('');
    const selected = filterOptions[key].find(option => option.value === filters[key]);
    document.querySelector(`#${key}-value`).textContent = key === 'location' && !filters[key] ? 'Enter location' : selected.label;
  }

  function resetFilters() {
    Object.keys(filters).forEach(key => { filters[key] = ''; renderFilter(key); });
  }

  function openModal(heading, content, type = 'editorial') {
    if (layer.hidden) {
      const focused = document.activeElement;
      const dropdown = focused.closest('.dropdown');
      returnFocus = dropdown ? document.querySelector(`[aria-controls="${dropdown.id}"]`) : focused;
    }
    closeDropdowns();
    title.textContent = heading;
    dialogBody.innerHTML = content;
    dialogBody.setAttribute('aria-busy', 'false');
    dialog.dataset.view = type;
    document.querySelector('.stage').inert = true;
    layer.hidden = false;
    layer.classList.add('is-opening');
    dialogBody.scrollTop = 0;
    layer.querySelector('.close-button').focus();
  }

  function closeModal() {
    closeDropdowns();
    layer.hidden = true;
    layer.classList.remove('is-opening');
    document.querySelector('.stage').inert = false;
    returnFocus?.focus();
  }

  function showToast(message, error = false) {
    clearTimeout(toastTimer);
    toast.querySelector('span').textContent = message;
    toast.querySelector('.ti').className = `ti ${error ? 'ti-alert-circle' : 'ti-circle-check'}`;
    toast.classList.toggle('is-error', error);
    toast.hidden = false;
    toastTimer = setTimeout(() => { toast.hidden = true; }, 4200);
  }

  function matchingProperties() {
    const [min, max] = filters.price.split('-').map(Number);
    return properties.filter(property => (!filters.location || property.location === filters.location)
      && (!filters.type || property.type === filters.type)
      && (!filters.price || (property.price >= min && (!max || property.price <= max)))
      && (!filters.bedrooms || (filters.bedrooms === '6' ? property.bedrooms >= 6 : property.bedrooms === Number(filters.bedrooms))));
  }

  function scrollToSection(name) {
    if (!layer.hidden) closeModal();
    closeDropdowns();
    const section = document.getElementById(name);
    section.focus({ preventScroll: true });
    section.scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth', block: 'start' });
    history.replaceState(null, '', '#' + name);
    document.querySelectorAll('.navigation > a').forEach(link => {
      if (link.dataset.action === name) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }

  function renderResults() {
    const matches = matchingProperties();
    const summary = [filters.location || 'All locations', filters.type || 'All property types', 'Monthly rentals'].join(' · ');
    results.innerHTML = `<div class="results-meta"><span>${matches.length} ${matches.length === 1 ? 'property' : 'properties'} · ${summary}</span><button class="text-button" data-action="reset-results">Reset filters</button></div>${matches.length ? `<div class="property-list">${matches.map(property => `<article class="property-card"><div><h3>${property.name}</h3><p class="property-location"><i class="ti ti-map-pin" aria-hidden="true"></i>${property.location} · ${property.type}</p><p class="property-specs"><span>${property.bedrooms} beds</span><span>${property.baths} baths</span><span>${property.area} sq ft</span></p></div><div class="property-side"><p class="property-price">${money(property.price)} <small>/ month</small></p><button class="text-button" data-property="${property.id}">View property <i class="ti ti-arrow-up-right" aria-hidden="true"></i></button></div></article>`).join('')}</div>` : `<div class="empty-state"><i class="ti ti-home-search" aria-hidden="true"></i><h3>A different view awaits.</h3><p>No homes match this combination.<br>Try another location or widen your search.</p><button class="button" data-action="reset-results">View all properties <i class="ti ti-arrow-right" aria-hidden="true"></i></button></div>`}`;
    results.setAttribute('aria-busy', 'false');
  }

  function showResults() {
    clearTimeout(searchTimer);
    currentProperty = null;
    results.innerHTML = '<div class="property-list" aria-label="Loading properties"><div class="skeleton"></div><div class="skeleton"></div></div>';
    results.setAttribute('aria-busy', 'true');
    scrollToSection('properties');
    searchTimer = setTimeout(renderResults, 420);
  }

  function showProperty(id) {
    const property = properties.find(item => item.id === id);
    if (!property) return;
    currentProperty = property;
    openModal(property.name, `<div class="results-meta"><button class="text-button" data-action="properties">Back to properties</button><span>${property.location} · ${property.type}</span></div><div class="detail-layout"><div class="detail-photo" aria-hidden="true"></div><div class="detail-content"><p class="property-specs"><span>${property.bedrooms} bedrooms</span><span>${property.baths} bathrooms</span><span>${property.area} sq ft</span></p><p class="property-price">${money(property.price)} <small>/ month</small></p><p>${property.description}</p><p>Private viewings by appointment.</p><button class="button" data-action="visit">Schedule a Visit <i class="ti ti-arrow-right" aria-hidden="true"></i></button></div></div>`, 'property');
  }

  function visitDates() {
    const dates = [];
    const day = new Date();
    day.setHours(12, 0, 0, 0);
    while (dates.length < 7) {
      day.setDate(day.getDate() + 1);
      if (day.getDay() === 0) continue;
      const value = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
      dates.push({ value, label: day.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) });
    }
    return dates;
  }

  function formSelect(name, label, options) {
    return `<div class="form-field"><label id="${name}-label">${label}</label><input type="hidden" name="${name}" value="${options[0].value}"><button type="button" class="form-select" id="${name}-trigger" aria-labelledby="${name}-label ${name}-selected" aria-expanded="false" aria-haspopup="listbox" aria-controls="${name}-panel"><span id="${name}-selected">${options[0].label}</span><i class="ti ti-chevron-down" aria-hidden="true"></i></button><div class="dropdown form-options scroll-area" id="${name}-panel" role="listbox" aria-label="${label}" hidden>${options.map((option, index) => `<button type="button" class="option" role="option" data-form-select="${name}" data-value="${option.value}" aria-selected="${index === 0}">${option.label}</button>`).join('')}</div></div>`;
  }

  function showVisit() {
    const name = currentProperty?.name || 'Your next home';
    const location = currentProperty?.location || 'A location that feels like you';
    openModal('Let’s find a time to visit.', `<div class="visit-layout"><aside class="visit-summary"><i class="ti ti-calendar-event" aria-hidden="true"></i><h3>${name}</h3><p>${location}</p><p>Choose a preferred time and save a visit plan to your calendar.</p><p>For availability and confirmation, call<br><strong>+1 (234) 567 8900</strong>.</p></aside><form class="visit-form" id="visit-form" novalidate><div class="form-field"><label for="visit-name">Your name</label><input id="visit-name" name="name" autocomplete="name" placeholder="Full name" maxlength="100" required aria-describedby="name-error"><p class="field-error" id="name-error" hidden></p></div><div class="form-field"><label for="visit-email">Email address</label><input id="visit-email" name="email" type="email" autocomplete="email" placeholder="you@example.com" maxlength="180" required aria-describedby="email-error"><p class="field-error" id="email-error" hidden></p></div>${formSelect('date', 'Preferred date', visitDates())}${formSelect('time', 'Preferred time · local time', [{ value: '10:00', label: '10:00 AM' }, { value: '12:00', label: '12:00 PM' }, { value: '14:00', label: '2:00 PM' }, { value: '16:00', label: '4:00 PM' }])}<div class="form-field form-wide"><label for="visit-notes">Anything you’d like us to know?</label><textarea id="visit-notes" name="notes" maxlength="500" placeholder="Your priorities, preferred neighbourhood or questions"></textarea></div><p class="form-status form-wide" id="visit-status" role="status" hidden></p><button class="button form-wide" type="submit">Save visit plan <i class="ti ti-calendar-plus" aria-hidden="true"></i></button><p class="form-note form-wide">A calendar file will be saved. Viewing availability must be confirmed by phone.</p></form></div>`, 'visit');
  }

  function saveVisit(form) {
    const nameInput = form.elements.name;
    const emailInput = form.elements.email;
    const errors = { name: !nameInput.value.trim() ? 'Please enter your name.' : '', email: !emailInput.value.trim() ? 'Please enter your email address.' : !emailInput.validity.valid ? 'Please enter a valid email address.' : '' };
    for (const [key, error] of Object.entries(errors)) {
      const field = form.elements[key];
      field.setAttribute('aria-invalid', String(Boolean(error)));
      const output = form.querySelector(`#${key}-error`);
      output.textContent = error;
      output.hidden = !error;
    }
    const invalidKey = Object.keys(errors).find(key => errors[key]);
    if (invalidKey) { form.elements[invalidKey].focus(); return; }
    const status = form.querySelector('#visit-status');
    const submit = form.querySelector('[type="submit"]');
    const icsText = value => String(value).replace(/\\/g, '\\\\').replace(/[\r\n]+/g, '\\n').replace(/;/g, '\\;').replace(/,/g, '\\,');
    const date = form.elements.date.value.replace(/-/g, '');
    const [hour, minute] = form.elements.time.value.split(':');
    const start = `${date}T${hour}${minute}00`;
    const end = `${date}T${String(Number(hour) + 1).padStart(2, '0')}${minute}00`;
    const propertyName = currentProperty?.name || 'Property consultation';
    const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
    const description = `Preferred viewing for ${nameInput.value.trim()}. Contact: ${emailInput.value.trim()}. Please call +1 (234) 567 8900 to confirm availability. ${form.elements.notes.value.trim()}`;
    const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//LUXEVIA//Visit Plan//EN', 'CALSCALE:GREGORIAN', 'BEGIN:VEVENT', `UID:${crypto.randomUUID()}@luxevia`, `DTSTAMP:${timestamp}`, `DTSTART:${start}`, `DTEND:${end}`, `SUMMARY:${icsText('LUXEVIA — ' + propertyName)}`, `LOCATION:${icsText(currentProperty?.location || 'To be confirmed by phone')}`, `DESCRIPTION:${icsText(description)}`, 'STATUS:TENTATIVE', 'END:VEVENT', 'END:VCALENDAR', ''];
    let url;
    submit.disabled = true;
    try {
      url = URL.createObjectURL(new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = 'luxevia-visit-plan.ics';
      document.body.append(link);
      link.click();
      link.remove();
      status.textContent = 'Your visit plan is ready. Please call +1 (234) 567 8900 to confirm your viewing.';
      status.classList.remove('is-error');
      status.hidden = false;
      submit.innerHTML = 'Save visit plan again <i class="ti ti-calendar-plus" aria-hidden="true"></i>';
    } catch {
      status.textContent = 'We couldn’t save your calendar file. Please try again or call us to arrange a viewing.';
      status.classList.add('is-error');
      status.hidden = false;
    } finally {
      submit.disabled = false;
      if (url) setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
  }

  function showVideo() {
    openModal('A closer look at exceptional living.', '<div class="empty-state"><i class="ti ti-video-off" aria-hidden="true"></i><h3>The property film is currently unavailable.</h3><p>Experience the space in person.<br>Our team can arrange a private viewing.</p><button class="button" data-action="visit">Schedule a Visit <i class="ti ti-arrow-right" aria-hidden="true"></i></button></div>');
  }

  async function action(name) {
    if (['home', 'properties', 'about', 'services', 'team', 'guide', 'faq', 'contact'].includes(name)) { currentProperty = null; scrollToSection(name); return; }
    if (name === 'reset-results') {
      clearTimeout(searchTimer);
      resetFilters();
      renderResults();
      results.querySelector('[data-action="reset-results"]').focus({ preventScroll: true });
      return;
    }
    if (name === 'visit') { showVisit(); return; }
    if (name === 'video') { showVideo(); return; }
    if (name === 'copy-phone') {
      try {
        await navigator.clipboard.writeText('+1 (234) 567 8900');
        showToast('Phone number copied.');
      } catch {
        const error = document.querySelector('#copy-error');
        if (error) {
          error.textContent = 'Copy is unavailable. Please select the phone number above.';
          error.hidden = false;
        }
      }
      return;
    }
  }

  function start() {
    if (started) return;
    started = true;
    Object.keys(filters).forEach(renderFilter);
    renderResults();
    if (location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView({ behavior: 'instant' });
    document.addEventListener('click', event => {
      const trigger = event.target.closest('[aria-expanded][aria-controls]');
      if (trigger) { toggleDropdown(trigger); return; }
      const filterOption = event.target.closest('[data-select-filter]');
      if (filterOption) {
        const key = filterOption.dataset.selectFilter;
        filters[key] = filterOption.dataset.value;
        closeDropdowns();
        renderFilter(key);
        document.querySelector(`#${key}-trigger`).focus();
        return;
      }
      const formOption = event.target.closest('[data-form-select]');
      if (formOption) {
        const name = formOption.dataset.formSelect;
        const form = formOption.closest('form');
        form.elements[name].value = formOption.dataset.value;
        document.querySelector(`#${name}-selected`).textContent = formOption.textContent;
        formOption.parentElement.querySelectorAll('[role="option"]').forEach(option => option.setAttribute('aria-selected', String(option === formOption)));
        closeDropdowns();
        document.querySelector(`#${name}-trigger`).focus();
        return;
      }
      const control = event.target.closest('[data-action]');
      if (control) { event.preventDefault(); action(control.dataset.action); return; }
      const propertyControl = event.target.closest('[data-property]');
      if (propertyControl) { showProperty(propertyControl.dataset.property); return; }
      if (event.target.closest('[data-close-modal]')) { closeModal(); return; }
      if (!event.target.closest('.dropdown')) closeDropdowns();
    });
    document.addEventListener('submit', event => {
      if (event.target.id === 'property-search') { event.preventDefault(); showResults(); }
      if (event.target.id === 'visit-form') { event.preventDefault(); saveVisit(event.target); }
    });
    document.addEventListener('input', event => {
      if (event.target.closest('#visit-form') && event.target.getAttribute('aria-invalid') === 'true') {
        event.target.setAttribute('aria-invalid', 'false');
        const error = document.querySelector(`#${event.target.name}-error`);
        if (error) error.hidden = true;
      }
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        if (document.querySelector('[aria-expanded="true"]')) closeDropdowns(true);
        else if (!layer.hidden) closeModal();
        return;
      }
      const panel = event.target.closest('.dropdown');
      if (panel && ['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
        event.preventDefault();
        const options = [...panel.querySelectorAll('button:not(:disabled)')];
        const index = options.indexOf(document.activeElement);
        const next = event.key === 'Home' ? 0 : event.key === 'End' ? options.length - 1 : (index + (event.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length;
        options[next]?.focus();
        return;
      }
      if (['ArrowDown', 'ArrowUp'].includes(event.key) && event.target.matches('[aria-expanded][aria-controls]')) {
        event.preventDefault();
        if (event.target.getAttribute('aria-expanded') === 'false') toggleDropdown(event.target);
        return;
      }
      if (event.key === 'Tab') {
        if (panel && layer.hidden) closeDropdowns();
        if (!layer.hidden) {
          const focusable = [...dialog.querySelectorAll('button:not(:disabled), a[href], input:not([type="hidden"]), textarea, summary')].filter(element => element.getClientRects().length);
          const first = focusable[0];
          const last = focusable.at(-1);
          if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
          else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
        }
      }
    });
    layer.addEventListener('animationend', () => layer.classList.remove('is-opening'));
  }

  start();
})();
