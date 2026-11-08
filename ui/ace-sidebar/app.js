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

function reversibleAnimation(element, frames, atEnd = false) {
  const animation = element.animate(frames, {
    duration: parseFloat(tokens.getPropertyValue('--duration-panel')),
    easing: tokens.getPropertyValue('--ease-out').trim(),
    fill: 'both',
  });
  animation.pause();
  animation.currentTime = atEnd ? animation.effect.getTiming().duration : 0;
  return animation;
}

function moveTimeline(animation, toEnd, instant = false) {
  if (instant || reducedMotion.matches) {
    animation.pause();
    animation.currentTime = toEnd ? animation.effect.getTiming().duration : 0;
    return;
  }
  animation.playbackRate = 1;
  if (toEnd) animation.play();
  else animation.reverse();
}

function renderNavigation(sidebar) {
  const buttons = navigationItems.map((item) => {
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
    const tooltip = document.createElement('span');
    tooltip.className = 'tooltip';
    tooltip.textContent = item.label;
    tooltip.setAttribute('aria-hidden', 'true');
    button.append(tooltip);
    button.addEventListener('pointerenter', () => { sidebar.dataset.preview = 'false'; });
    button.addEventListener('focus', () => { sidebar.dataset.preview = 'false'; });
    button.addEventListener('click', () => {
      document.querySelectorAll('.nav-item').forEach((entry) => {
        if (entry.dataset.key === item.key) entry.setAttribute('aria-current', 'page');
        else entry.removeAttribute('aria-current');
        entry.removeAttribute('data-hint');
      });
      if (!matchMedia('(hover: hover) and (pointer: fine)').matches) button.dataset.hint = 'true';
      document.querySelector('.announcement').textContent = `${item.label} selected`;
    });
    return button;
  });
  sidebar.querySelector('.navigation').replaceChildren(...buttons);
}

function renderRecentContacts(sidebar) {
  const page = contactPages.get(sidebar);
  const buttons = contacts.slice(page * 4, page * 4 + 4).map((contact) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'message-row';
    button.dataset.contact = contact.id;
    button.setAttribute('aria-label', `Messages from ${contact.name}${contact.unread ? `, ${contact.unread} unread` : ''}`);
    button.setAttribute('aria-pressed', String(selectedContact === contact.id));
    button.append(avatar(contact));
    const name = document.createElement('span');
    name.className = 'contact-name wide-content';
    name.textContent = contact.name;
    button.append(name);
    if (contact.unread) button.append(badge(contact.unread, 'wide-content'));
    if (contact.typing) {
      const typing = document.createElement('span');
      typing.className = 'typing-indicator';
      typing.setAttribute('aria-label', `${contact.name} is typing`);
      typing.append(...Array.from({ length: 3 }, () => document.createElement('span')));
      button.append(typing);
    }
    button.addEventListener('click', () => {
      selectedContact = contact.id;
      document.querySelectorAll('.message-row').forEach((entry) => entry.setAttribute('aria-pressed', String(entry.dataset.contact === contact.id)));
      document.querySelectorAll('.all-messages').forEach((entry) => entry.setAttribute('aria-pressed', 'false'));
      document.querySelector('.announcement').textContent = `${contact.name} selected`;
    });
    return button;
  });
  sidebar.querySelector('.recent-contacts').replaceChildren(...buttons);
  sidebar.querySelector('.page-prev').disabled = page === 0;
  sidebar.querySelector('.page-next').disabled = (page + 1) * 4 >= contacts.length;
}

function toggleSidebar(sidebar, instant) {
  const collapsed = sidebar.dataset.collapsed !== 'true';
  sidebar.dataset.collapsed = String(collapsed);
  sidebar.dataset.preview = 'false';
  sidebar.querySelector('.brand').setAttribute('aria-expanded', String(!collapsed));
  sidebar.querySelector('.brand').setAttribute('aria-label', collapsed ? 'Expand navigation' : 'Collapse navigation');
  const control = sidebar.querySelector('.collapse-control');
  control.setAttribute('aria-expanded', String(!collapsed));
  control.tabIndex = collapsed ? -1 : 0;
  sidebar.querySelector('.message-pagination').inert = collapsed;
  foldTimelines.get(sidebar).forEach((animation) => moveTimeline(animation, collapsed, instant));
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
    const surfaceTimeline = reversibleAnimation(sidebar.querySelector('.sidebar-surface'), [
      { clipPath: 'inset(0 0 0 0 round 1.25cqw)' },
      { clipPath: 'inset(0 13.1875cqw 0 0 round 1.25cqw)' },
    ], collapsed);
    const messagesTimeline = reversibleAnimation(sidebar.querySelector('.message-surface'), [
      { clipPath: 'inset(0 0 0 0 round 1.5cqw)' },
      { clipPath: 'inset(0 13.25cqw 0 0 round 1.5cqw)' },
    ], collapsed);
    foldTimelines.set(sidebar, [surfaceTimeline, messagesTimeline]);
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
  document.addEventListener('pointerdown', () => {
    sidebars.forEach((sidebar) => { sidebar.dataset.preview = 'false'; });
  });
  reducedMotion.addEventListener('change', () => {
    if (!reducedMotion.matches) return;
    sidebars.forEach((sidebar) => {
      foldTimelines.get(sidebar).forEach((animation) => moveTimeline(animation, sidebar.dataset.collapsed === 'true', true));
    });
  });
  document.querySelectorAll('.profile-avatar').forEach((wrapper) => {
    wrapper.dataset.initials = 'AB';
    wrapper.querySelector('img').addEventListener('error', (event) => { event.target.hidden = true; });
  });
}

start();
