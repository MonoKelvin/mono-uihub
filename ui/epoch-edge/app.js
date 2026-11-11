const finishes = {
  russet: { name: 'Juli Brown', finish: 'Russet', image: './assets/chair-russet.webp' },
  ivory: { name: 'Juli Ivory', finish: 'Ivory', image: './assets/chair-ivory.webp' },
  sand: { name: 'Juli Sand', finish: 'Sand', image: './assets/chair-sand.webp' }
};
let selectedFinish = 'russet';
let quantity = 1;
let returnScroll = 0;
let enquiry = '';
let entrancePlayed = false;
let animationMedia;
let started = false;
let menuTimeline;
let lastBuyButton;
const landing = document.querySelector('#landing-view');
const order = document.querySelector('#order-view');
const menu = document.querySelector('#site-menu');
const menuButton = document.querySelector('.menu-toggle');
const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');

function setMenu(open, restoreFocus = false) {
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  menuButton.querySelector('i').className = open ? 'ti ti-x' : 'ti ti-menu-2';
  menu.inert = !open;
  if (open) menu.hidden = false;
  if (menuTimeline && !motionPreference.matches) {
    if (open) menuTimeline.play();
    else {
      menuTimeline.reverse();
      if (menuTimeline.time() === 0) menu.hidden = true;
    }
  } else {
    menuTimeline?.progress(open ? 1 : 0).pause();
    menu.hidden = !open;
  }
  if (restoreFocus) menuButton.focus({ preventScroll: true });
}
motionPreference.addEventListener('change', () => setMenu(menuButton.getAttribute('aria-expanded') === 'true'));
menuButton.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
document.addEventListener('click', (event) => {
  if (!event.target.closest('.site-header') && menuButton.getAttribute('aria-expanded') === 'true') setMenu(false);
});
document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  if (!document.querySelector('#film-panel').hidden) closeFilm();
  else if (menuButton.getAttribute('aria-expanded') === 'true') setMenu(false, true);
  else if (!contactPanel.hidden) closeContact();
});

function refreshLayout() {
  if (window.ScrollTrigger) ScrollTrigger.refresh(true);
}
function showLanding(restore = false) {
  if (!order.hidden) {
    order.hidden = true;
    landing.hidden = false;
    startMotion();
    if (restore) window.scrollTo({ top: returnScroll, behavior: 'instant' });
  }
  refreshLayout();
}
function scrollToSection(id) {
  showLanding();
  const target = document.querySelector(id);
  if (!target) return;
  target.tabIndex = -1;
  target.focus({ preventScroll: true });
  target.scrollIntoView({ behavior: motionPreference.matches ? 'instant' : 'smooth', block: 'start' });
}
document.querySelectorAll('a[href^="#"]:not([data-contact])').forEach((link) => {
  link.addEventListener('click', (event) => {
    const id = link.getAttribute('href');
    if (id === '#main') return;
    event.preventDefault();
    setMenu(false);
    scrollToSection(id);
  });
});

function updateQuantity() {
  document.querySelector('#quantity-value').value = quantity;
  document.querySelector('#quantity-minus').disabled = quantity === 1;
  document.querySelector('#quantity-plus').disabled = quantity === 10;
  document.querySelector('#order-total').textContent = '$' + (quantity * 299).toLocaleString('en-US');
}
function resetEnquiry() {
  document.querySelector('#order-form').hidden = false;
  document.querySelector('#order-result').hidden = true;
  document.querySelector('#order-status').textContent = '';
}
function selectFinish(key) {
  selectedFinish = key;
  const choice = finishes[key];
  document.querySelector('#product-title').textContent = choice.name;
  document.querySelector('#finish-name').textContent = choice.finish;
  for (const image of [document.querySelector('#product-image'), document.querySelector('#order-image')]) {
    image.src = choice.image;
    image.alt = choice.name + ' in the ' + choice.finish + ' finish';
  }
  document.querySelector('#order-product-name').textContent = choice.name + ' — ' + choice.finish;
  document.querySelectorAll('[data-finish]').forEach((button) => {
    const active = button.dataset.finish === key;
    button.setAttribute('aria-pressed', String(active));
    button.classList.toggle('is-selected', active);
  });
  resetEnquiry();
}
document.querySelectorAll('[data-finish]').forEach((button) => button.addEventListener('click', () => selectFinish(button.dataset.finish)));
document.querySelectorAll('[data-buy]').forEach((button) => {
  button.addEventListener('click', () => {
    lastBuyButton = button;
    returnScroll = window.scrollY;
    animationMedia?.revert();
    animationMedia = undefined;
    started = false;
    landing.hidden = true;
    order.hidden = false;
    resetEnquiry();
    updateQuantity();
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.querySelector('#order-back').focus({ preventScroll: true });
    setMenu(false);
  });
});
document.querySelector('#order-back').addEventListener('click', () => {
  showLanding(true);
  lastBuyButton?.focus({ preventScroll: true });
});
document.querySelector('#quantity-minus').addEventListener('click', () => { quantity = Math.max(1, quantity - 1); updateQuantity(); resetEnquiry(); });
document.querySelector('#quantity-plus').addEventListener('click', () => { quantity = Math.min(10, quantity + 1); updateQuantity(); resetEnquiry(); });

const galleryViews = {
  comfort: { description: 'Soft upholstery.\nA generous seat.\nRoom to slow down.', main: './assets/chair-ivory.webp', detail: './assets/chair-russet.webp', mainAlt: 'Juli in the Ivory finish', detailAlt: 'Russet leather upholstery and curved armrest', finish: 'ivory' },
  quality: { description: 'Considered materials.\nBeautiful from every angle.\nMade to be lived in.', main: './assets/chair-russet.webp', detail: './assets/chair-back.webp', mainAlt: 'Juli in the Russet finish', detailAlt: 'Walnut frame and fabric upholstery material study', finish: 'russet' },
  custom: { description: 'Your room. Your rhythm.\nFind the finish that feels\njust right for you.', main: './assets/chair-sand.webp', detail: './assets/chair-pair.webp', mainAlt: 'Juli in the Sand finish', detailAlt: 'Russet and Ivory finish comparison', finish: 'sand' }
};
const galleryButtons = [...document.querySelectorAll('[data-gallery]')];
function selectGallery(key) {
  const view = galleryViews[key];
  galleryButtons.forEach((button) => {
    const active = button.dataset.gallery === key;
    button.setAttribute('aria-selected', String(active));
    button.tabIndex = active ? 0 : -1;
  });
  document.querySelector('#gallery-panel').setAttribute('aria-labelledby', galleryButtons.find((button) => button.dataset.gallery === key).id);
  document.querySelector('.gallery-description').textContent = view.description;
  document.querySelector('#gallery-main-image').src = view.main;
  document.querySelector('#gallery-main-image').alt = view.mainAlt;
  document.querySelector('#gallery-detail-image').src = view.detail;
  document.querySelector('#gallery-detail-image').alt = view.detailAlt;
  document.querySelectorAll('[data-gallery-pick]').forEach((button) => {
    button.dataset.galleryPick = view.finish;
    button.setAttribute('aria-label', 'Explore ' + finishes[view.finish].name);
  });
  document.querySelector('.gallery-image--close span').firstChild.textContent = 'Explore ' + finishes[view.finish].finish + ' ';
}
galleryButtons.forEach((button, index) => {
  button.addEventListener('click', () => selectGallery(button.dataset.gallery));
  button.addEventListener('keydown', (event) => {
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % galleryButtons.length;
    if (event.key === 'ArrowLeft') next = (index + galleryButtons.length - 1) % galleryButtons.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = galleryButtons.length - 1;
    if (next === undefined) return;
    event.preventDefault();
    selectGallery(galleryButtons[next].dataset.gallery);
    galleryButtons[next].focus();
  });
});
document.querySelectorAll('[data-gallery-pick]').forEach((button) => button.addEventListener('click', () => { selectFinish(button.dataset.galleryPick); scrollToSection('#product'); }));
document.querySelectorAll('details').forEach((details) => details.addEventListener('toggle', refreshLayout));
document.querySelector('.comfort-toggle').addEventListener('click', (event) => {
  const button = event.currentTarget;
  const open = button.getAttribute('aria-expanded') !== 'true';
  button.setAttribute('aria-expanded', String(open));
  document.querySelector('#comfort-extra').hidden = !open;
  refreshLayout();
});

function closeFilm() {
  document.querySelector('#film-panel').hidden = true;
  document.querySelector('.room-play').setAttribute('aria-expanded', 'false');
  document.querySelector('.room-play').focus({ preventScroll: true });
}
document.querySelector('.room-play').addEventListener('click', () => {
  document.querySelector('#film-panel').hidden = false;
  document.querySelector('.room-play').setAttribute('aria-expanded', 'true');
  document.querySelector('.film-close').focus({ preventScroll: true });
});
document.querySelector('.film-close').addEventListener('click', closeFilm);

function validateForm(form, status) {
  let firstInvalid;
  for (const input of form.querySelectorAll('input, textarea')) {
    input.value = input.value.trim();
    const valid = input.checkValidity();
    input.setAttribute('aria-invalid', String(!valid));
    const error = input.parentElement.querySelector('.field-error');
    error.hidden = valid;
    error.textContent = valid ? '' : input.validity.typeMismatch ? 'Enter a valid email address.' : 'This field is required.';
    if (!valid && !firstInvalid) firstInvalid = input;
  }
  if (firstInvalid) {
    status.dataset.state = 'error';
    status.textContent = 'Please check the highlighted fields.';
    firstInvalid.focus();
    return false;
  }
  status.textContent = '';
  return true;
}
function downloadText(text, filename, status) {
  let url;
  try {
    url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.append(link);
    link.click();
    link.remove();
    status.dataset.state = 'success';
    status.textContent = 'Your download is ready.';
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch {
    if (url) URL.revokeObjectURL(url);
    status.dataset.state = 'error';
    status.textContent = 'The download could not be prepared. Please try again.';
  }
}
document.querySelector('#order-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  if (!validateForm(form, document.querySelector('#order-status'))) return;
  const data = new FormData(form);
  const choice = finishes[selectedFinish];
  enquiry = ['EPOCH EDGE — PURCHASE ENQUIRY', '', choice.name + ' / ' + choice.finish, 'Quantity: ' + quantity, 'Unit price: $299', 'Subtotal: $' + (299 * quantity), '', 'Name: ' + data.get('name'), 'Email: ' + data.get('email'), 'Location: ' + data.get('location'), '', 'Please confirm availability, delivery charges and the final purchase details.'].join('\n');
  form.hidden = true;
  document.querySelector('#order-result').hidden = false;
  document.querySelector('#download-status').textContent = '';
  document.querySelector('#download-enquiry').focus({ preventScroll: true });
});
document.querySelector('#download-enquiry').addEventListener('click', () => downloadText(enquiry, 'epoch-edge-purchase-enquiry.txt', document.querySelector('#download-status')));
document.querySelector('#edit-enquiry').addEventListener('click', () => { resetEnquiry(); document.querySelector('#order-form input').focus(); });
document.addEventListener('input', (event) => {
  if (!event.target.matches('input, textarea')) return;
  event.target.removeAttribute('aria-invalid');
  event.target.parentElement.querySelector('.field-error').hidden = true;
  const status = event.target.form.querySelector('.form-status');
  status.textContent = '';
  delete status.dataset.state;
});

const contactPanel = document.querySelector('#contact-panel');
const contactContent = document.querySelector('#contact-content');
let lastContactButton;
async function copyText(text, button) {
  if (button.disabled) return;
  const original = button.innerHTML;
  button.disabled = true;
  button.setAttribute('aria-busy', 'true');
  button.textContent = 'Copying…';
  try {
    await navigator.clipboard.writeText(text);
    button.textContent = 'Copied';
  } catch {
    button.textContent = 'Copy unavailable — select the text above';
  } finally {
    button.removeAttribute('aria-busy');
    setTimeout(() => {
      if (!button.isConnected) return;
      button.innerHTML = original;
      button.disabled = false;
    }, 2200);
  }
}
function openContact(type, trigger) {
  lastContactButton = trigger;
  showLanding();
  contactPanel.hidden = false;
  const title = document.querySelector('#contact-panel-title');
  if (type === 'phone') {
    title.textContent = 'A voice is always welcome.';
    contactContent.innerHTML = '<p class="contact-value">+1 646 533 7279</p><p>Visit us at 110 W 3rd St, New York, NY 10012, USA.</p><button class="text-button copy-button">Copy phone number <i class="ti ti-copy" aria-hidden="true"></i></button>';
    contactContent.querySelector('button').addEventListener('click', (event) => copyText('+1 646 533 7279', event.currentTarget));
  } else if (type === 'social') {
    title.textContent = 'Good design is worth sharing.';
    contactContent.innerHTML = '<p>Share the Juli collection with someone who loves a considered space.</p><div class="social-actions"><button class="text-button" id="share-collection">Share collection <i class="ti ti-share" aria-hidden="true"></i></button><button class="text-button" id="copy-collection">Copy collection link <i class="ti ti-copy" aria-hidden="true"></i></button></div><p class="form-status" id="share-status" role="status"></p>';
    const shareData = { title: 'Epoch Edge — Juli Collection', url: location.href.split('#')[0] + '#product' };
    contactContent.querySelector('#copy-collection').addEventListener('click', (event) => copyText(shareData.url, event.currentTarget));
    const shareStatus = contactContent.querySelector('#share-status');
    contactContent.querySelector('#share-collection').addEventListener('click', async (event) => {
      const button = event.currentTarget;
      if (!navigator.share) {
        await copyText(shareData.url, button);
        return;
      }
      button.disabled = true;
      button.setAttribute('aria-busy', 'true');
      shareStatus.textContent = '';
      try {
        await navigator.share(shareData);
      } catch (error) {
        if (error.name !== 'AbortError') shareStatus.textContent = 'Sharing is unavailable. Copy the collection link instead.';
      } finally {
        button.disabled = false;
        button.removeAttribute('aria-busy');
      }
    });
  } else {
    title.textContent = type === 'email' ? 'Put your thoughts into words.' : 'A little conversation.';
    contactContent.innerHTML = '<form id="contact-form" class="contact-form" novalidate><div class="form-fields"><label>Your name<input name="name" autocomplete="name" required maxlength="100" aria-describedby="contact-name-error"><span class="field-error" id="contact-name-error" hidden></span></label><label>Email address<input name="email" type="email" autocomplete="email" required maxlength="254" aria-describedby="contact-email-error"><span class="field-error" id="contact-email-error" hidden></span></label></div><label>How can we help?<textarea name="message" required maxlength="3000" aria-describedby="contact-message-error"></textarea><span class="field-error" id="contact-message-error" hidden></span></label><p class="form-status" role="status"></p><button class="solid-button" type="submit"><span>Prepare message</span><i class="ti ti-arrow-right" aria-hidden="true"></i></button><p class="contact-form-note">Prepare and download your message to share with our team.</p></form>';
    const form = contactContent.querySelector('form');
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const status = form.querySelector('.form-status');
      if (!validateForm(form, status)) return;
      const data = new FormData(form);
      const message = ['EPOCH EDGE — CONTACT ENQUIRY', '', 'Name: ' + data.get('name'), 'Email: ' + data.get('email'), '', data.get('message')].join('\n');
      downloadText(message, 'epoch-edge-contact-enquiry.txt', status);
    });
  }
  refreshLayout();
  contactPanel.scrollIntoView({ behavior: motionPreference.matches ? 'instant' : 'smooth', block: 'center' });
  document.querySelector('.contact-close').focus({ preventScroll: true });
}
document.querySelectorAll('[data-contact]').forEach((button) => button.addEventListener('click', (event) => { event.preventDefault(); openContact(button.dataset.contact, button); }));
function closeContact() {
  contactPanel.hidden = true;
  lastContactButton?.focus({ preventScroll: true });
  refreshLayout();
}
document.querySelector('.contact-close').addEventListener('click', closeContact);

function startMotion() {
  if (started || !window.gsap || !window.ScrollTrigger || landing.hidden) return;
  started = true;
  gsap.registerPlugin(ScrollTrigger);
  if (!menuTimeline) {
    menuTimeline = gsap.timeline({ paused: true, onReverseComplete: () => { if (menuButton.getAttribute('aria-expanded') === 'false') menu.hidden = true; } });
    menuTimeline.fromTo(menu, { opacity: 0, y: -8 }, { opacity: 1, y: 0, duration: .22, ease: 'power2.out', immediateRender: false });
    setMenu(menuButton.getAttribute('aria-expanded') === 'true');
  }
  animationMedia = gsap.matchMedia();
  animationMedia.add('(prefers-reduced-motion: no-preference)', () => {
    if (!entrancePlayed) {
      entrancePlayed = true;
      gsap.timeline({ id: 'hero-entrance', defaults: { ease: 'power3.out' } })
        .from('.hero-chair', { opacity: .2, y: 24, duration: .55 })
        .from('.hero h1', { opacity: .6, y: 12, duration: .45 }, .06)
        .from('.material-note', { opacity: 0, duration: .35, stagger: .06 }, .18);
    }
    gsap.timeline({ id: 'discover-reveal', scrollTrigger: { trigger: '.features-heading', start: 'top 88%', once: true }, defaults: { ease: 'power3.out' } })
      .from('.features-heading h2 span', { y: 35, opacity: .25, duration: .5, stagger: .07 })
      .from('.feature-detail-image', { rotation: -5, opacity: .4, duration: .45 }, .12);
    gsap.timeline({ id: 'gallery-reveal', scrollTrigger: { trigger: '.gallery-content', start: 'top 90%', once: true } })
      .from('.gallery-image--back', { y: 50, rotation: -1.5, opacity: .5, duration: .65, ease: 'power3.out' })
      .from('.gallery-image--close', { y: 32, opacity: .5, duration: .55, ease: 'power3.out' }, .08);
    gsap.timeline({ id: 'juli-scroll-story', scrollTrigger: { id: 'juli-scroll-story', trigger: '.product-stage', start: 'top 95%', end: 'bottom 55%', scrub: true }, defaults: { ease: 'none' } })
      .fromTo('#product-image', { scale: .84 }, { scale: 1 }, 0)
      .fromTo('.collections-word', { xPercent: 5 }, { xPercent: -3 }, 0);
    gsap.from('.room-image', { clipPath: 'inset(8% 0 0 0 round 24px)', scale: 1.06, duration: .75, ease: 'power3.out', scrollTrigger: { trigger: '.room-image-wrap', start: 'top 85%', once: true } });
    gsap.from('.contact-flower', { rotation: 25, duration: .7, ease: 'power3.out', scrollTrigger: { trigger: '.contact-heading', start: 'top 85%', once: true } });
  });
  refreshLayout();
}
window.addEventListener('load', startMotion, { once: true });
document.fonts.ready.then(refreshLayout);
window.addEventListener('pagehide', () => { animationMedia?.revert(); menuTimeline?.revert(); });
window.addEventListener('pageshow', (event) => { if (event.persisted) { started = false; menuTimeline = undefined; startMotion(); } });
