const navigationItems = [
  { key: 'offers', label: 'My Offers' },
  { key: 'tasks', label: 'User’s Task' },
  { key: 'discounts', label: 'Product Discounts', count: 2 },
  { key: 'case', label: 'Case Study' },
  { key: 'security', label: 'Security' },
  { key: 'ability', label: 'Your Ability' },
];

const contacts = [
  { id: 'max', name: 'Max Maraston', image: 'https://i.pravatar.cc/120?img=12', unread: 2 },
  { id: 'celia', name: 'Celia W McCombs', image: 'https://i.pravatar.cc/120?img=47', unread: 0, typing: true },
  { id: 'edna', name: 'Edna J Critchlow', image: 'https://i.pravatar.cc/120?img=44', unread: 1 },
  { id: 'dima', name: 'Dima Groshev', image: 'https://i.pravatar.cc/120?img=33', unread: 0 },
  { id: 'leo', name: 'Leo Bennett', image: 'https://i.pravatar.cc/120?img=49', unread: 0 },
  { id: 'maya', name: 'Maya Spencer', image: 'https://i.pravatar.cc/120?img=5', unread: 0 },
  { id: 'oliver', name: 'Oliver Walsh', image: 'https://i.pravatar.cc/120?img=60', unread: 0 },
  { id: 'nina', name: 'Nina Parker', image: 'https://i.pravatar.cc/120?img=32', unread: 0 },
];

const sidebars = [...document.querySelectorAll('.sidebar')];
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const tokens = getComputedStyle(document.documentElement);
const foldTimelines = new Map();
const contactPages = new Map();
let started = false;
let selectedContact = null;

function icon(name, className = '') {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
  use.setAttribute('href', `#icon-${name}`);
  svg.setAttribute('aria-hidden', 'true');
  if (className) svg.setAttribute('class', className);
  svg.append(use);
  return svg;
}

function avatar(contact) {
  const wrapper = document.createElement('span');
  wrapper.className = 'avatar';
  wrapper.dataset.initials = contact.name.split(' ').map((part) => part[0]).slice(0, 2).join('');
  const image = document.createElement('img');
  image.alt = '';
  image.src = contact.image;
  image.referrerPolicy = 'no-referrer';
  image.addEventListener('error', () => { image.hidden = true; });
  wrapper.append(image);
  return wrapper;
}

function badge(count, className = '') {
  const span = document.createElement('span');
  span.className = `notification-badge ${className}`.trim();
  span.textContent = count;
  span.setAttribute('aria-hidden', 'true');
  return span;
}

function reversibleAnimation(element, frames) {
  const animation = element.animate(frames, {
    duration: parseFloat(tokens.getPropertyValue('--duration-panel')),
    easing: tokens.getPropertyValue('--ease-in-out').trim(),
    fill: 'both',
  });
  animation.cancel();
  return animation;
}

function moveTimeline(timeline, toEnd, instant = false) {
  const { animations } = timeline;
  const duration = animations[0].effect.getTiming().duration;
  const targetTime = toEnd ? duration : 0;
  const currentTime = animations[0].currentTime ?? timeline.position;
  const immediate = instant || reducedMotion.matches || currentTime === targetTime;
  timeline.position = targetTime;
  animations.forEach((animation) => {
    if (immediate) animation.cancel();
    else {
      animation.currentTime = currentTime;
      animation.playbackRate = 1;
      if (toEnd) animation.play();
      else animation.reverse();
    }
  });
  return !immediate;
}

function syncSidebarControls(sidebar) {
  const collapsed = sidebar.dataset.collapsed === 'true';
  const transitioning = sidebar.dataset.transitioning === 'true';
  sidebar.querySelector('.collapse-control').tabIndex = collapsed || transitioning ? -1 : 0;
  sidebar.querySelector('.message-pagination').inert = collapsed || transitioning;
}

function renderNavigation(sidebar) {
  const tooltip = sidebar.querySelector('.tooltip');
  const hover = matchMedia('(hover: hover) and (pointer: fine)');
  const buttons = navigationItems.map((item, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'nav-item';
    button.dataset.key = item.key;
    button.setAttribute('aria-label', item.count ? `${item.label}, ${item.count} updates` : item.label);
    button.append(icon(item.key, 'nav-icon'));
    const label = document.createElement('span');
    label.className = 'nav-label wide-content';
    label.textContent = item.label;
    button.append(label);
    if (item.count) button.append(badge(item.count, 'wide-content'));
    const showTooltip = (keyboard = false) => {
      sidebar.dataset.preview = 'false';
      tooltip.textContent = item.label;
      tooltip.style.top = `${15.125 + index * 3.625}cqw`;
      tooltip.dataset.visible = 'true';
      tooltip.dataset.keyboard = String(keyboard);
    };
    button.addEventListener('pointerenter', () => { if (hover.matches) showTooltip(); });
    button.addEventListener('pointerleave', () => { if (document.activeElement !== button) tooltip.dataset.visible = 'false'; });
    button.addEventListener('focus', () => { if (button.matches(':focus-visible')) showTooltip(true); });
    button.addEventListener('blur', () => { if (!hover.matches || !button.matches(':hover')) tooltip.dataset.visible = 'false'; });
    button.addEventListener('click', () => {
      document.querySelectorAll('.nav-item').forEach((entry) => {
        if (entry.dataset.key === item.key) entry.setAttribute('aria-current', 'page');
        else entry.removeAttribute('aria-current');
      });
      if (!hover.matches) showTooltip();
      document.querySelector('.announcement').textContent = `${item.label} selected`;
    });
    return button;
  });
  sidebar.querySelector('.navigation').replaceChildren(...buttons);
}

function renderRecentContacts(sidebar) {
  const page = contactPages.get(sidebar);
  const visibleContacts = contacts.slice(page * 4, page * 4 + 4);
  const typingIndex = visibleContacts.findIndex((contact) => contact.typing);
  const typing = sidebar.querySelector('.typing-indicator');
  typing.hidden = typingIndex === -1;
  if (typingIndex !== -1) {
    typing.setAttribute('aria-label', `${visibleContacts[typingIndex].name} is typing`);
    typing.style.top = `${40.4375 + typingIndex * 3.375}cqw`;
  }
  const list = sidebar.querySelector('.recent-contacts');
  visibleContacts.forEach((contact, index) => {
    let button = list.children[index];
    if (!button) {
      button = document.createElement('button');
      button.type = 'button';
      button.className = 'message-row';
      const name = document.createElement('span');
      name.className = 'contact-name wide-content';
      button.append(avatar(contact), name, badge(contact.unread, 'wide-content'));
      button.addEventListener('click', () => {
        selectedContact = button.dataset.contact;
        document.querySelectorAll('.message-row').forEach((entry) => entry.setAttribute('aria-pressed', String(entry.dataset.contact === selectedContact)));
        document.querySelectorAll('.all-messages').forEach((entry) => entry.setAttribute('aria-pressed', 'false'));
        document.querySelector('.announcement').textContent = `${button.querySelector('.contact-name').textContent} selected`;
      });
      list.append(button);
    }
    button.dataset.contact = contact.id;
    button.setAttribute('aria-label', `Messages from ${contact.name}${contact.unread ? `, ${contact.unread} unread` : ''}`);
    button.setAttribute('aria-pressed', String(selectedContact === contact.id));
    button.querySelector('.contact-name').textContent = contact.name;
    const notification = button.querySelector('.notification-badge');
    notification.textContent = contact.unread;
    notification.hidden = !contact.unread;
    const wrapper = button.querySelector('.avatar');
    wrapper.dataset.initials = contact.name.split(' ').map((part) => part[0]).slice(0, 2).join('');
    const image = wrapper.querySelector('img');
    if (image.src !== contact.image) {
      image.hidden = false;
      image.src = contact.image;
    }
  });
  sidebar.querySelector('.page-prev').disabled = page === 0;
  sidebar.querySelector('.page-next').disabled = (page + 1) * 4 >= contacts.length;
}

function toggleSidebar(sidebar, instant = false) {
  const collapsed = sidebar.dataset.collapsed !== 'true';
  sidebar.dataset.instant = String(instant || reducedMotion.matches);
  sidebar.dataset.collapsed = String(collapsed);
  sidebar.dataset.preview = 'false';
  sidebar.querySelector('.tooltip').dataset.visible = 'false';
  sidebar.querySelector('.brand').setAttribute('aria-expanded', String(!collapsed));
  sidebar.querySelector('.brand').setAttribute('aria-label', collapsed ? 'Expand navigation' : 'Collapse navigation');
  const control = sidebar.querySelector('.collapse-control');
  control.setAttribute('aria-expanded', String(!collapsed));
  sidebar.dataset.transitioning = String(moveTimeline(foldTimelines.get(sidebar), collapsed, instant));
  syncSidebarControls(sidebar);
  if (collapsed && document.activeElement === control) sidebar.querySelector('.brand').focus({ preventScroll: true });
}

function start() {
  if (started) return;
  started = true;
  sidebars.forEach((sidebar) => {
    contactPages.set(sidebar, 0);
    renderNavigation(sidebar);
    renderRecentContacts(sidebar);
    const collapsed = sidebar.dataset.collapsed === 'true';
    const panelFrames = [
      { clipPath: 'inset(0 0 0 0 round var(--radius-panel))' },
      { clipPath: 'inset(0 var(--panel-cut) 0 0 round var(--radius-panel))' },
    ];
    const messageFrames = [
      { clipPath: 'inset(0 0 0 0 round var(--radius-card))' },
      { clipPath: 'inset(0 var(--message-cut) 0 0 round var(--radius-card))' },
    ];
    const animations = [
      ['.sidebar-surface, .sidebar-viewport', panelFrames],
      ['.navigation', [
        { clipPath: 'inset(0 0 0 0)' },
        { clipPath: 'inset(0 var(--panel-cut) 0 0)' },
      ]],
      ['.message-surface', messageFrames],
      ['.recent-contacts', [
        { clipPath: 'inset(0 0 0 0)' },
        { clipPath: 'inset(0 var(--message-cut) 0 0)' },
      ]],
      ['.wide-content', [
        { opacity: 1, transform: 'translateX(0)' },
        { opacity: 0, transform: 'translateX(-.375cqw)' },
      ]],
      ['.collapse-control', [{ opacity: 1 }, { opacity: 0 }]],
      ['.window-dots', [{ transform: 'translateX(0)' }, { transform: 'translateX(-.25cqw)' }]],
      ['.brand-mark, .profile-avatar', [{ transform: 'translateX(0)' }, { transform: 'translateX(.3125cqw)' }]],
      ['.nav-icon', [{ transform: 'translateX(0)' }, { transform: 'translateX(1cqw)' }]],
      ['.header-divider, .messages-divider', [
        { transform: 'translateX(0) scaleX(1)' },
        { transform: 'translateX(-.53125cqw) scaleX(.2798507463)' },
      ]],
      ['.menu-label, .messages-heading .section-label', [
        { transform: 'translateX(0)' },
        { transform: 'translateX(calc(var(--rail-width) / 2 - var(--space-lg) - 50%))' },
      ]],
      ['.all-messages', [
        { transform: 'translateX(3.875cqw)', clipPath: 'inset(0 0 0 0 round var(--radius-panel))' },
        { transform: 'translateX(0)', clipPath: 'inset(0 var(--cta-cut) 0 0 round var(--radius-panel))' },
      ]],
      ['.all-messages svg', [
        { transform: 'translate(0, -50%)' },
        { transform: 'translate(.5625cqw, -50%)' },
      ]],
    ].flatMap(([selector, frames]) => [...sidebar.querySelectorAll(selector)].map((element) => reversibleAnimation(element, frames)));
    foldTimelines.set(sidebar, { animations, position: collapsed ? animations[0].effect.getTiming().duration : 0 });
    animations[0].onfinish = () => {
      if (animations[0].playState !== 'finished') return;
      animations.forEach((animation) => animation.cancel());
      sidebar.dataset.transitioning = 'false';
      syncSidebarControls(sidebar);
    };
    syncSidebarControls(sidebar);
    sidebar.querySelector('.brand').addEventListener('click', (event) => toggleSidebar(sidebar, event.detail === 0));
    sidebar.querySelector('.collapse-control').addEventListener('click', (event) => toggleSidebar(sidebar, event.detail === 0));
    sidebar.querySelector('.page-prev').addEventListener('click', () => { contactPages.set(sidebar, contactPages.get(sidebar) - 1); renderRecentContacts(sidebar); });
    sidebar.querySelector('.page-next').addEventListener('click', () => { contactPages.set(sidebar, contactPages.get(sidebar) + 1); renderRecentContacts(sidebar); });
    sidebar.querySelector('.all-messages').addEventListener('click', () => {
      selectedContact = null;
      sidebars.forEach((entry) => {
        contactPages.set(entry, 0);
        renderRecentContacts(entry);
        entry.querySelector('.all-messages').setAttribute('aria-pressed', 'true');
      });
      document.querySelector('.announcement').textContent = 'Recent messages selected';
    });
  });
  document.addEventListener('pointerdown', (event) => {
    sidebars.forEach((sidebar) => {
      sidebar.dataset.preview = 'false';
      if (!sidebar.querySelector('.navigation').contains(event.target)) sidebar.querySelector('.tooltip').dataset.visible = 'false';
    });
  });
  reducedMotion.addEventListener('change', () => {
    if (!reducedMotion.matches) return;
    sidebars.forEach((sidebar) => {
      moveTimeline(foldTimelines.get(sidebar), sidebar.dataset.collapsed === 'true', true);
      sidebar.dataset.transitioning = 'false';
      syncSidebarControls(sidebar);
    });
  });
  document.querySelectorAll('.profile-avatar').forEach((wrapper) => {
    wrapper.dataset.initials = 'AB';
    wrapper.querySelector('img').addEventListener('error', (event) => { event.target.hidden = true; });
  });
}

start();
