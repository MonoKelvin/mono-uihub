(() => {
  'use strict';
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const talent = [
    { id: 'roman', name: 'Roman Hayes', category: 'editorial', label: 'Editorial / Creative', location: 'London · Available worldwide', image: 'portrait-roman.webp', bio: 'A distinctive presence for editorial stories and expressive campaigns. Roman brings intensity, character, and a considered approach to every frame.', height: '188 cm', chest: '96 cm', waist: '78 cm', eyes: 'Brown' },
    { id: 'noah', name: 'Noah Bennett', category: 'fashion', label: 'Fashion / Runway', location: 'Paris · Available worldwide', image: 'portrait-noah.webp', bio: 'Clean lines, quiet confidence, and a versatile look. Noah works across runway, contemporary fashion, and studio-led brand campaigns.', height: '186 cm', chest: '94 cm', waist: '76 cm', eyes: 'Hazel' },
    { id: 'ellis', name: 'Ellis James', category: 'commercial', label: 'Commercial / Fashion', location: 'New York · Available worldwide', image: 'portrait-ellis.webp', bio: 'A sharp, assured style for fashion and commercial storytelling. Ellis brings personality to tailoring, lifestyle, and portrait-led productions.', height: '189 cm', chest: '98 cm', waist: '80 cm', eyes: 'Brown' },
    { id: 'luca', name: 'Luca Moreau', category: 'editorial', label: 'Editorial / Lifestyle', location: 'Milan · Available worldwide', image: 'portrait-luca.webp', bio: 'An effortless look shaped by movement and natural expression. Luca is a fit for intimate editorials, lifestyle photography, and creative collaborations.', height: '184 cm', chest: '92 cm', waist: '75 cm', eyes: 'Green' },
    { id: 'kai', name: 'Kai Morgan', category: 'fashion', label: 'Fashion / Editorial', location: 'Berlin · Available worldwide', image: 'portrait-kai.webp', bio: 'Strong profiles and an understated presence. Kai works with photographers and designers on directional fashion and light-driven portraiture.', height: '187 cm', chest: '95 cm', waist: '77 cm', eyes: 'Blue' }
  ];
  const services = {
    representation: { label: '[Model]', title: 'Model Representation', copy: 'Individual guidance, from the first portfolio to the next international campaign. We shape a career around the person, not the other way around.', items: ['Personal career planning', 'Portfolio development and positioning', 'Casting preparation and representation', 'Brand and editorial opportunities'] },
    campaigns: { label: '[Brand]', title: 'Brand Campaigns', copy: 'The right talent changes the way a brand is seen. Build a considered cast around your creative direction, audience, and production needs.', items: ['Talent selection and shortlisting', 'Commercial and editorial casting', 'Campaign planning and coordination', 'Runway and lifestyle talent'] },
    production: { label: '[Creative]', title: 'Creative Production', copy: 'From a clear idea to a coherent body of work. Photography, styling, art direction, and talent come together under one creative vision.', items: ['Creative and art direction', 'Studio photography and styling', 'Production planning', 'Editorial and campaign delivery'] }
  };
  const projects = [
    { image: 'portrait-roman.webp', alt: 'After Hours — studio portrait', copy: '“Working with Apex Model Studio transformed our campaign. Their professional talent, organization, and creativity exceeded every expectation from casting to final production.”', name: 'Sophia Carter', role: 'Creative Director', rating: true },
    { image: 'portrait-noah.webp', alt: 'Form — contemporary fashion editorial', copy: 'FORM / A study in silhouette, attitude, and modern tailoring. A studio-led fashion editorial with a focused cast and a single, confident visual direction.', name: 'Form', role: 'Fashion editorial · Talent & creative direction', rating: false },
    { image: 'portrait-ellis.webp', alt: 'New Perspective — tailoring campaign', copy: 'NEW PERSPECTIVE / Character comes first. A portrait-led campaign bringing sharp tailoring and individual expression into the same frame.', name: 'New Perspective', role: 'Brand campaign · Casting & production', rating: false }
  ];
  const info = {
    agency: { title: 'People first.\nPossibilities next.', lead: 'Apex Model Studio connects individual talent with fashion, commercial, and creative opportunities.', sections: [['A career, not just a casting', 'Representation starts with understanding a person: their strengths, ambitions, and creative identity. Portfolio development, preparation, and considered opportunities support the long-term picture.'], ['A clear creative partnership', 'Brands and production teams can explore talent, discuss a brief, and find the right approach across casting, photography, styling, and creative direction.']] },
    portfolio: { title: 'Your portfolio.\nYour point of view.', lead: 'Build a body of work that shows range without losing identity.', sections: [['Start with the essentials', 'Clear portraits, full-length images, and recent work help a casting team understand your look. Keep measurements current and choose images that reflect you today.'], ['Develop with intention', 'Editorial, movement, and commercial images serve different purposes. Discuss the roles you want to pursue before planning the next shoot.']] },
    casting: { title: 'The right face.\nThe right story.', lead: 'Casting is the meeting point between individual character and a creative brief.', sections: [['For brands and producers', 'Describe the concept, location, dates, usage, and the kinds of talent you need. A specific brief makes selection and coordination clearer.'], ['For new faces', 'Explore representation and portfolio guidance. Open-casting dates will be listed when available; there is no open casting scheduled at present.']] },
    careers: { title: 'Behind every face.\nA creative team.', lead: 'Explore work in talent management, casting, and creative production.', sections: [['Current opportunities', 'There are no open team positions listed at present.'], ['Introduce yourself', 'Use the contact page to prepare an introduction with your experience, area of interest, and a link to your work.']] },
    partners: { title: 'Good work begins\nwith good people.', lead: 'Collaborations bring together talent, photographers, stylists, and production teams.', sections: [['Creative partners', 'We welcome conversations around fashion editorials, brand productions, and collaborative shoots.'], ['Bring a clear brief', 'Share the idea, intended use, location, and schedule so the appropriate creative roles can be identified.']] },
    journal: { title: 'Notes from\nthe studio.', lead: 'Practical perspectives on portfolios, casting, and creative work.', sections: [['A portfolio that feels like you', 'Lead with recent, clear photographs. Choose fewer strong images rather than many similar frames, and keep your measurements and availability current.'], ['Before your next casting', 'Read the brief, prepare the requested images, and confirm the location and timing. Wear something simple that lets the casting team see your silhouette.']] },
    media: { title: 'Apex in focus.', lead: 'Studio information for editorial and media enquiries.', sections: [['Media enquiries', 'Prepare a message with your publication, topic, deadline, and the information or talent you would like to feature.'], ['Photography credits', 'Website portraits are adapted from Pixabay photography: Pexels, hugolionnard, and Ramiz-Rizi. The interface is based on the Apex Model Studio reference by Mayur V.']] },
    events: { title: 'Meet. Create.\nConnect.', lead: 'Casting sessions, studio events, and creative gatherings.', sections: [['Upcoming events', 'No public events are currently listed.'], ['Private productions', 'For a shoot, runway project, or brand event, prepare a project brief through the contact page.']] },
    privacy: { title: 'Your details.\nYour choice.', lead: 'Personal details entered here are used only to prepare the file you choose to download.', sections: [['No online submission', 'This website does not send your enquiry to a server. Name, email, company, and project text remain in the current page until you refresh or leave.'], ['Downloaded files', 'Your brief includes personal details only after you confirm the checkbox. Keep the file private and share it only with the intended recipient.'], ['External resources', 'Fonts and interface icons load from external CDN providers. Portraits are served from this website’s local assets.']] },
    terms: { title: 'Clear expectations.', lead: 'Information here supports browsing talent and preparing a creative brief.', sections: [['Enquiries and bookings', 'Downloading a brief does not make a booking, reserve a model, or establish a service agreement. Availability, usage, fees, and production details require confirmation.'], ['Creative material', 'Photography and design references remain subject to their original licences and creators’ rights. Do not redistribute portrait files as standalone stock images.']] },
    newsletter: { title: 'Stay close\nto the studio.', lead: 'New faces, fresh work, and studio updates.', sections: [['Newsletter availability', 'The newsletter subscription service is not connected. No email address is collected or added to a mailing list.'], ['Explore what is here', 'Browse the current talent roster and selected creative projects, or prepare a message through the contact page.']] },
    social: { title: 'Connect with\nthe studio.', lead: 'Follow new faces, editorial work, and creative collaborations.', sections: [['Social profiles', 'Social profiles are not connected. External accounts will be available here once verified.']] }
  };
  const faqs = [['How do I enquire about a model?', 'Open a talent profile and choose “Enquire About This Model.” Their name will be included in your project message. You can then download a complete brief.'], ['What should my project brief include?', 'Include the concept, dates, location, intended usage, and the kind of talent or production support you need.'], ['Can I apply for representation?', 'Choose Model Representation on the contact page and share your current experience and a portfolio link.'], ['Is a downloaded brief a confirmed booking?', 'No. Downloading prepares a file; it does not send an enquiry or confirm a booking.'], ['Will my details be saved?', 'No business details are stored in the browser. Your form stays available during this visit and is cleared when the page is refreshed.']];
  const state = { started: false, view: 'home', filter: 'all', query: '', service: null, project: 0, model: talent[0], interest: 'Model Representation', homeScroll: 0, rosterScroll: 0, media: null, entered: false, menuOpen: false, toastTimer: null, projectAnimation: null };

  function node(tag, text, className) {
    const item = document.createElement(tag);
    if (text !== undefined) item.textContent = text;
    if (className) item.className = className;
    return item;
  }
  function notify(message) {
    clearTimeout(state.toastTimer);
    $('#toast').textContent = message;
    $('#toast').classList.add('is-visible');
    state.toastTimer = setTimeout(() => $('#toast').classList.remove('is-visible'), 3200);
  }
  function download(filename, content, type = 'text/plain;charset=utf-8') {
    const url = URL.createObjectURL(new Blob([content], { type }));
    const link = node('a');
    link.href = url;
    link.download = filename;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function renderTalent() {
    const matches = talent.filter((person) => (state.filter === 'all' || person.category === state.filter) && person.name.toLowerCase().includes(state.query.toLowerCase().trim()));
    $('#talent-grid').replaceChildren(...matches.map((person) => {
      const link = node('a', undefined, 'talent-card');
      link.href = '#talent/' + person.id;
      const figure = node('figure');
      const image = node('img');
      image.src = 'assets/' + person.image;
      image.alt = person.name + ' — ' + person.label;
      image.width = 760;
      image.height = 800;
      const icon = node('i', undefined, 'ti ti-arrow-up-right');
      icon.setAttribute('aria-hidden', 'true');
      figure.append(image, icon);
      link.append(figure, node('h2', person.name), node('p', person.label));
      return link;
    }));
    $('#talent-empty').hidden = matches.length !== 0;
    $('#result-count').textContent = matches.length + (matches.length === 1 ? ' face' : ' faces') + ' / ' + (state.filter === 'all' ? 'All talent' : state.filter[0].toUpperCase() + state.filter.slice(1));
    $$('[data-filter]').forEach((button) => {
      const selected = button.dataset.filter === state.filter;
      button.classList.toggle('is-active', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
  }
  function renderProfile(person) {
    state.model = person;
    $('#profile-name').textContent = person.name;
    $('#profile-image').src = 'assets/' + person.image;
    $('#profile-image').alt = person.name;
    $('#profile-category').textContent = '[' + person.label + ']';
    $('#profile-location').textContent = person.location;
    $('#profile-bio').textContent = person.bio;
    $('#profile-status').textContent = '';
    $('#profile-measurements').replaceChildren(...[['Height',person.height],['Chest',person.chest],['Waist',person.waist],['Eyes',person.eyes]].map(([label,value]) => {
      const group = node('div');
      group.append(node('dt',label),node('dd',value));
      return group;
    }));
  }
  function renderInfo(topic) {
    const data = info[topic] || info.agency;
    $('#info-label').textContent = topic === 'faq' || topic === 'help' ? '[Support]' : '[The studio]';
    $('#info-title').textContent = topic === 'faq' || topic === 'help' ? 'A few good answers.' : data.title;
    $('#info-lead').textContent = topic === 'faq' || topic === 'help' ? 'The essentials about talent, creative briefs, and working with the studio.' : data.lead;
    const content = topic === 'faq' || topic === 'help' ? faqs.map(([title,copy]) => {
      const item = node('details');
      item.append(node('summary',title),node('p',copy));
      return item;
    }) : data.sections.map(([title,copy]) => {
      const item = node('section');
      item.append(node('h2',title),node('p',copy));
      return item;
    });
    $('#info-content').replaceChildren(...content);
  }
  function setView(view) {
    const changed = state.view !== view;
    if (changed) {
      if (state.view === 'home') state.homeScroll = window.scrollY;
      if (state.view === 'talent') state.rosterScroll = window.scrollY;
    }
    state.view = view;
    ['home','talent','profile','contact','info'].forEach((key) => $('#' + key + '-view').hidden = key !== view);
    $('#inner-header').hidden = view === 'home';
    $('#main-content').dataset.currentView = view;
    setMenu(false);
    if (changed) {
      const position = view === 'home' ? state.homeScroll : view === 'talent' ? state.rosterScroll : 0;
      window.scrollTo({ top: position, behavior: 'instant' });
      const heading = $('#' + view + '-view').querySelector('h1, h2');
      if (heading) {
        heading.tabIndex = -1;
        heading.focus({ preventScroll: true });
      }
    }
    if (view === 'home') startMotion();
    window.ScrollTrigger?.refresh(true);
  }
  function route() {
    const hash = location.hash.slice(1);
    if (hash === 'talent') {
      renderTalent();
      setView('talent');
    } else if (hash.startsWith('talent/')) {
      const person = talent.find((item) => item.id === hash.slice(7));
      if (person) { renderProfile(person); setView('profile'); }
      else { renderTalent(); setView('talent'); notify('This profile is not available.'); }
    } else if (hash === 'contact') {
      setView('contact');
    } else if (hash.startsWith('info/')) {
      renderInfo(hash.slice(5));
      setView('info');
    } else {
      const target = hash.startsWith('services/') ? 'services' : hash || 'home';
      setView('home');
      if (hash.startsWith('services/')) showService(hash.slice(9), true);
      const element = document.getElementById(target);
      if (element && !$('#home-view').hidden) requestAnimationFrame(() => element.scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth', block: 'start' }));
    }
    document.title = state.view === 'home' ? 'Apex Model Studio — Talent Without Limits' : state.view === 'profile' ? state.model.name + ' — Apex Model Studio' : state.view === 'talent' ? 'Our Talent — Apex Model Studio' : state.view === 'contact' ? 'Contact — Apex Model Studio' : $('#info-title').textContent.replace('\n',' ') + ' — Apex Model Studio';
  }
  function showService(key, forceOpen = false) {
    const data = services[key];
    if (!data) return;
    const opening = forceOpen || state.service !== key;
    state.service = opening ? key : null;
    $('#service-detail').hidden = !opening;
    $$('[data-service]').forEach((button) => button.setAttribute('aria-expanded', String(opening && button.dataset.service === key)));
    $$('[data-service-card]').forEach((card) => card.classList.toggle('is-active', opening && card.dataset.serviceCard === key));
    if (opening) {
      $('#service-detail-label').textContent = data.label;
      $('#service-detail-title').textContent = data.title;
      $('#service-detail-copy').textContent = data.copy;
      $('#service-detail-list').replaceChildren(...data.items.map((text) => node('li',text)));
      requestAnimationFrame(() => $('#service-detail').scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth', block: 'nearest' }));
    }
    window.ScrollTrigger?.refresh(true);
  }
  function switchProject(index, focus = false) {
    if (index === state.project) { if (focus) $$('[data-project]')[index].focus(); return; }
    const previous = state.project;
    state.project = index;
    const data = projects[index];
    $('#project-image').src = 'assets/' + data.image;
    $('#project-image').alt = data.alt;
    $('#project-quote').textContent = data.copy;
    $('#project-person').textContent = data.name;
    $('#project-role').textContent = data.role;
    $('#project-rating').hidden = !data.rating;
    $('#project-panel').setAttribute('aria-labelledby','project-tab-' + index);
    $$('[data-project]').forEach((button,i) => {
      button.classList.toggle('is-active', i === index);
      button.setAttribute('aria-selected', String(i === index));
      button.tabIndex = i === index ? 0 : -1;
    });
    if (!reducedMotion.matches) {
      const currentOpacity = state.projectAnimation?.playState === 'running' ? getComputedStyle($('#project-panel')).opacity : .65;
      state.projectAnimation?.cancel();
      state.projectAnimation = $('#project-panel').animate([{ opacity: currentOpacity, transform: `translateX(${index > previous ? 7 : -7}px)` }, { opacity: 1, transform: 'translateX(0)' }], { duration: 240, easing: 'cubic-bezier(.2,.7,.25,1)' });
    }
    if (focus) $$('[data-project]')[index].focus();
  }
  function setMenu(open) {
    state.menuOpen = open;
    $('#main-navigation').classList.toggle('is-open',open);
    $('.mobile-menu-button').setAttribute('aria-expanded',String(open));
    $('.mobile-menu-button .ti').className = open ? 'ti ti-x' : 'ti ti-menu-2';
  }
  function setSelect(open, position = null) {
    $('.select-trigger').setAttribute('aria-expanded',String(open));
    $('#interest-options').hidden = !open;
    if (open) {
      const options = $$('#interest-options [role="option"]:not(:disabled)');
      (position === 'last' ? options.at(-1) : options.find((option) => option.getAttribute('aria-selected') === 'true') || options[0]).focus();
    }
  }
  function setInterest(value) {
    state.interest = value;
    $('#interest-value').textContent = value;
    $$('#interest-options [data-value]').forEach((option) => option.setAttribute('aria-selected',String(option.dataset.value === value)));
    setSelect(false);
    $('.select-trigger').focus();
  }
  async function prepareBrief(event) {
    event.preventDefault();
    if ($('#contact-submit').disabled) return;
    const fields = [['name', !$('#contact-name').value.trim(), 'Please enter your name.'], ['email', !$('#contact-email').value.trim() || !$('#contact-email').validity.valid, 'Enter a valid email address.'], ['message', !$('#contact-message').value.trim(), 'Tell us a little about your project.']];
    fields.forEach(([key,invalid,message]) => {
      $('#contact-' + key).setAttribute('aria-invalid',String(invalid));
      $('#contact-' + key).setAttribute('aria-describedby',key + '-error');
      $('#' + key + '-error').textContent = invalid ? message : '';
    });
    const consent = $('#contact-consent').checked;
    $('#consent-error').textContent = consent ? '' : 'Confirm that your contact details may be included in the file.';
    $('#contact-consent').setAttribute('aria-describedby','consent-error');
    $('#contact-consent').setAttribute('aria-invalid',String(!consent));
    const firstError = fields.find(([,invalid]) => invalid);
    if (firstError || !consent) {
      $('#contact-status').textContent = 'Check the highlighted fields before preparing your brief.';
      (firstError ? $('#contact-' + firstError[0]) : $('#contact-consent')).focus();
      return;
    }
    const button = $('#contact-submit');
    button.disabled = true;
    button.setAttribute('aria-busy','true');
    button.querySelector('span').textContent = 'Preparing Brief…';
    $('#contact-status').textContent = 'Preparing your project details.';
    await new Promise(requestAnimationFrame);
    try {
      const lines = ['APEX MODEL STUDIO — PROJECT BRIEF','', 'Name: ' + $('#contact-name').value.trim(), 'Email: ' + $('#contact-email').value.trim(), 'Company: ' + ($('#contact-company').value.trim() || '—'), 'Interest: ' + state.interest, '', 'PROJECT', $('#contact-message').value.trim(), '', 'This file has not been submitted online.'];
      download('apex-project-brief.txt',lines.join('\n'));
      $('#contact-status').textContent = 'Your brief is ready to download. No enquiry has been sent online.';
    } catch {
      $('#contact-status').textContent = 'Could not prepare your brief. Your details are still here; please try again.';
    } finally {
      button.disabled = false;
      button.removeAttribute('aria-busy');
      button.querySelector('span').textContent = 'Download Project Brief';
    }
  }
  function startMotion() {
    if (state.media || !window.gsap || !window.ScrollTrigger) return;
    const gsap = window.gsap;
    gsap.registerPlugin(window.ScrollTrigger);
    state.media = gsap.matchMedia();
    state.media.add('(prefers-reduced-motion: no-preference)',() => {
      if (!state.entered && state.view === 'home') {
        state.entered = true;
        gsap.timeline({ defaults: { duration: .45, ease: 'power2.out' } })
          .from('.hero-person img',{ opacity: .5 },0)
          .from('.hero-wordmark',{ opacity: .5 },.06)
          .from('.hero-copy',{ y: 12, opacity: .6 },.1)
          .from('.hero-discover',{ y: 10, opacity: .6 },.16);
      }
      const heroTimeline = gsap.timeline({ scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
      heroTimeline.to('.hero-person img',{ yPercent: 12, ease: 'none' },0).to('.hero-wordmark',{ yPercent: -14, ease: 'none' },0);
      gsap.from('.agency-photo',{ clipPath: 'inset(0 100% 0 0)', duration: .8, ease: 'power3.out', scrollTrigger: { trigger: '#agency', start: 'top 72%', once: true } });
      gsap.from('.service-card',{ y: 28, opacity: .45, stagger: .065, duration: .55, ease: 'power2.out', scrollTrigger: { trigger: '.service-grid', start: 'top 85%', once: true } });
      gsap.from('.project-panel',{ clipPath: 'inset(0 0 0 100%)', duration: .75, ease: 'power3.out', scrollTrigger: { trigger: '.project-layout', start: 'top 82%', once: true } });
      gsap.from('.mosaic-photo--feature',{ opacity: .3, duration: .6, ease: 'power2.out', scrollTrigger: { trigger: '.model-mosaic', start: 'top 76%', once: true } });
      gsap.from('.manifesto-photo',{ clipPath: 'inset(0 0 100% 0)', duration: .75, ease: 'power3.out', scrollTrigger: { trigger: '.manifesto-grid', start: 'top 80%', once: true } });
      gsap.fromTo('.manifesto-word',{ opacity: .24 },{ opacity: 1, stagger: .09, ease: 'none', scrollTrigger: { trigger: '.manifesto-title', start: 'top 91%', end: 'bottom 52%', scrub: true } });
      return () => {};
    });
  }
  function start() {
    if (state.started) return;
    state.started = true;
    $$('.manifesto-title > span').forEach((item) => item.classList.add('accent'));
    const title = $('.manifesto-title');
    const walker = document.createTreeWalker(title,NodeFilter.SHOW_TEXT);
    const texts = [];
    while (walker.nextNode()) texts.push(walker.currentNode);
    texts.forEach((text) => {
      const fragment = document.createDocumentFragment();
      text.textContent.split(/(\s+)/).forEach((word) => fragment.append(/\S/.test(word) ? node('span',word,'manifesto-word') : document.createTextNode(word)));
      text.replaceWith(fragment);
    });
    document.addEventListener('click',(event) => {
      const target = event.target.closest('button,a');
      if (!target) return;
      if (target.matches('[data-service]')) showService(target.dataset.service);
      if (target.matches('.service-close')) { const key = state.service; if (key) { showService(key); $('[data-service="' + key + '"]').focus(); } }
      if (target.matches('[data-project]')) switchProject(Number(target.dataset.project));
      if (target.matches('[data-filter]')) { state.filter = target.dataset.filter; renderTalent(); }
      if (target.id === 'clear-filters') { state.filter = 'all'; state.query = ''; $('#talent-search').value = ''; renderTalent(); $('#talent-search').focus(); }
      if (target.matches('.mobile-menu-button')) setMenu(!state.menuOpen);
      if (target.matches('[data-social]')) { location.hash = '#info/social'; notify(target.dataset.social + ' profile is not connected.'); }
      if (target.id === 'enquire-model') { state.interest = 'Talent Booking'; $('#interest-value').textContent = state.interest; $$('#interest-options [data-value]').forEach((option) => option.setAttribute('aria-selected',String(option.dataset.value === state.interest))); $('#contact-message').value = 'I would like to enquire about ' + state.model.name + ' for an upcoming project.\n\n'; }
      if (target.id === 'download-profile') { const person = state.model; download('apex-' + person.id + '-profile.json',JSON.stringify(person,null,2),'application/json'); $('#profile-status').textContent = person.name + '’s profile is ready to download.'; }
      if (target.matches('.select-trigger')) setSelect($('#interest-options').hidden);
      if (target.matches('#interest-options [data-value]')) setInterest(target.dataset.value);
      if (target.tagName === 'A' && target.hash && target.hash === location.hash) { event.preventDefault(); route(); }
    });
    document.addEventListener('click',(event) => { if (!event.target.closest('#interest-select')) setSelect(false); if (state.menuOpen && !event.target.closest('.hero-header')) setMenu(false); });
    document.addEventListener('keydown',(event) => {
      if (event.key === 'Escape') { if (!$('#interest-options').hidden) { setSelect(false); $('.select-trigger').focus(); } if (state.menuOpen) { setMenu(false); $('.mobile-menu-button').focus(); } }
      if (event.target.closest('.project-tabs') && ['ArrowDown','ArrowUp','ArrowRight','ArrowLeft','Home','End'].includes(event.key)) {
        event.preventDefault();
        const index = event.key === 'Home' ? 0 : event.key === 'End' ? projects.length - 1 : (state.project + (event.key === 'ArrowDown' || event.key === 'ArrowRight' ? 1 : -1) + projects.length) % projects.length;
        switchProject(index,true);
      }
      if (event.target.matches('.select-trigger') && ['ArrowDown','ArrowUp'].includes(event.key)) { event.preventDefault(); setSelect(true,event.key === 'ArrowUp' ? 'last' : null); }
      if (event.target.closest('#interest-options')) {
        const options = $$('#interest-options [role="option"]:not(:disabled)');
        const index = options.indexOf(event.target);
        if (['ArrowDown','ArrowUp','Home','End'].includes(event.key)) {
          event.preventDefault();
          const next = event.key === 'Home' ? 0 : event.key === 'End' ? options.length - 1 : (index + (event.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length;
          options[next].focus();
        }
        if (event.key === 'Tab') setSelect(false);
      }
    });
    $('#talent-search').addEventListener('input',(event) => { state.query = event.target.value; renderTalent(); });
    $('#contact-form').addEventListener('submit',prepareBrief);
    $('#contact-form').addEventListener('input',(event) => {
      const key = event.target.name;
      if (['name','email','message'].includes(key)) { $('#' + key + '-error').textContent = ''; event.target.removeAttribute('aria-invalid'); }
      if (key === 'consent') { $('#consent-error').textContent = ''; event.target.removeAttribute('aria-invalid'); }
      $('#contact-status').textContent = '';
    });
    window.addEventListener('hashchange',route);
    window.addEventListener('apex:motion-ready',() => { if (state.view === 'home') startMotion(); });
    window.addEventListener('pagehide',() => { state.media?.revert(); state.media = null; clearTimeout(state.toastTimer); state.projectAnimation?.cancel(); });
    window.addEventListener('pageshow',(event) => { if (event.persisted && state.view === 'home') startMotion(); });
    document.fonts.ready.then(() => window.ScrollTrigger?.refresh());
    route();
  }
  start();
})();
