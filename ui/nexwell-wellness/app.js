'use strict';

// 页面交互不依赖动画库；CDN 不可用时，内容与功能仍可使用。
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const dialog = $('#detail-dialog');
const dialogBody = $('#dialog-body');
let returnFocus = null;
let toastTimer;
let dialogAnimation;

const beliefs = {
  simplicity: [
    'Modern wellness often feels overwhelming. Endless products, conflicting advice, and complicated routines can make it difficult to know where to start.',
    'Nexwell was created to bring wellness back to its essentials—clean supplements, thoughtful formulations, and daily habits that support long-term balance.'
  ],
  consistency: [
    'A routine only works when it fits your life. The small things you can repeat—a nourishing breakfast, a moment outside, a daily essential—are the ones that stay with you.',
    'We design our products around everyday rhythms, making it easier to keep showing up for your wellbeing without adding more complexity to your day.'
  ],
  quality: [
    'More ingredients do not always mean a better formula. We start with a clear purpose, then consider the role and quality of every ingredient we include.',
    'Thoughtful sourcing and considered formulations help you make informed decisions. Nothing unnecessary. Just a little more intention in your everyday choices.'
  ]
};

const promises = {
  clean: { title: 'Clean Formulations', icon: 'leaf', body: 'A formula should be defined by what it needs, not by how much it contains. Our approach starts with purposeful ingredients and leaves out unnecessary extras.', detail: 'Clear ingredient information helps you understand what you are taking. Before starting any supplement, read the full ingredient list and discuss your individual needs with a qualified healthcare professional.' },
  sourcing: { title: 'Thoughtful Sourcing', icon: 'plant-2', body: 'Good formulations begin with good ingredients. Origin, consistency, and material quality are considered together—not as an afterthought.', detail: 'We believe sourcing information should be understandable. Our ingredient philosophy focuses on considered choices, clear specifications, and long-term relationships.' },
  daily: { title: 'Daily Wellness', icon: 'calendar-heart', body: 'Wellbeing is a practice, not a finish line. We design around the everyday routines you can return to, rather than short-term fixes.', detail: 'Supplements complement a balanced diet and lifestyle; they do not replace them. Find a rhythm that works for you, and follow the directions on your product label.' },
  science: { title: 'Science-Informed', icon: 'flask-2', body: 'Curiosity comes first. Our formulation philosophy is guided by ingredient research, considered combinations, and a clear understanding of daily use.', detail: 'Wellness information should help you ask better questions, not promise instant answers. Individual needs and results differ, and professional advice is important when choosing a supplement.' }
};

const articles = {
  morning: { title: 'Morning wellness', image: 'assets/moss-product-island.webp', label: 'DAILY RITUALS · 3 MIN READ', intro: 'A good morning does not have to be a perfect morning. A few simple, repeatable choices can help you start the day with a little more intention.', heading: 'Start small. Keep it yours.', paragraphs: ['Begin with a glass of water and a breakfast you enjoy. Give yourself a moment before the day asks for your attention—open a window, take a few breaths, or step outside.', 'If a daily supplement is part of your routine, keep it somewhere that makes sense alongside an existing habit. Follow the directions on the label, rather than adding more steps than you need.', 'Consistency feels different for everyone. The best routine is the one you can comfortably come back to.'] },
  balance: { title: 'Daily balance', image: 'assets/moss-branch.webp', label: 'EVERYDAY WELLBEING · 4 MIN READ', intro: 'Balance is not about doing everything. It is about noticing the essentials, and making enough space for them in a real, sometimes unpredictable day.', heading: 'A rhythm, not a rulebook.', paragraphs: ['Think of your day in gentle anchors: a meal, a walk, a moment to pause. These familiar checkpoints can make healthy choices feel less like a list of tasks.', 'Nutrition, movement, sleep, and connection work together. Supplements can sit alongside these habits, but they are not a replacement for a varied diet or professional guidance.', 'Some days will look different. Return to the next small choice instead of trying to make up for the last one.'] },
  nutrition: { title: 'Nutrition support', image: 'assets/moss-product-island.webp', label: 'THOUGHTFUL NUTRITION · 4 MIN READ', intro: 'Good nutrition begins with food, variety, and an understanding of your own needs. A considered supplement routine is just one part of that bigger picture.', heading: 'Purpose before quantity.', paragraphs: ['Start by asking what you actually need support with. An ingredient list should help you make that decision, not leave you with more questions.', 'Look for clear directions and information you can understand. If you take medication, are pregnant, or have a health condition, speak to a qualified professional before introducing a supplement.', 'A simple, balanced approach is easier to maintain than an ever-growing shelf of products.'] },
  evening: { title: 'An evening exhale', image: 'assets/forest.webp', label: 'REST & RECOVERY · 3 MIN READ', intro: 'The end of the day deserves a little room. Not another routine to get right—just a quieter rhythm that helps you transition into rest.', heading: 'Let the day settle.', paragraphs: ['Dim the lights, put your phone aside for a few minutes, and choose one simple thing that helps you unwind. A short stretch, a warm drink, or a few pages of a book may be enough.', 'A consistent sleep schedule can be a useful anchor. Give yourself time to wind down without turning rest into a performance.', 'If sleep difficulties persist, a healthcare professional can help you understand the underlying factors.'] },
  nature: { title: 'A moment outside', image: 'assets/valley.webp', label: 'ROOTED IN NATURE · 3 MIN READ', intro: 'You do not need a mountain escape to reconnect with nature. Sometimes it is a familiar path, a patch of sunlight, or a quiet moment beneath a tree.', heading: 'Make room for the outside.', paragraphs: ['Choose a short walk you can fit into your day. Notice the light, the air, and the changing details around you without needing to track or measure them.', 'A break outside can be a gentle way to step away from a busy screen. Let it be a pause, not another target.', 'Small moments count. Bring a little of that slower pace back into the rest of your day.'] }
};

const information = {
  faq: { title: 'A few good questions.', body: '<details class="detail-accordion" open><summary>Where should I begin?</summary><p>Start with a varied diet and a routine that feels manageable. For individual supplement advice, speak with a qualified healthcare professional.</p></details><details class="detail-accordion"><summary>How do I use Daily Synbiotic?</summary><p>Follow the directions on your product packaging. Keep your daily essential in a cool, dry place and away from children.</p></details><details class="detail-accordion"><summary>Can supplements replace a balanced diet?</summary><p>No. Food supplements are intended to complement, not replace, a varied and balanced diet and healthy lifestyle.</p></details><details class="detail-accordion"><summary>How can I ask a product question?</summary><p>Use Contact Us to prepare an enquiry about the formula you are considering.</p></details>' },
  shipping: { title: 'Shipping & delivery', text: 'Delivery availability, shipping costs, and estimated arrival dates must be confirmed before placing an order. Online ordering is not available here at the moment. For a product or delivery enquiry, please use Contact Us.' },
  returns: { title: 'Returns & support', text: 'For an existing order, keep your order confirmation and contact the retailer you purchased from. If you have a product question, you can prepare an enquiry through Contact Us. Please do not return a product without confirming the return instructions first.' },
  privacy: { title: 'Your privacy matters.', text: 'This page does not submit newsletter or contact information to a server. Your enquiry can be downloaded as a text file at your request. You decide whether and how to share it. Third-party font and animation CDNs may receive ordinary browser requests when the page loads.' },
  terms: { title: 'A considered approach.', text: 'Content on this page is general wellness information, not medical advice. Supplements do not replace a balanced diet or a healthy lifestyle. Please consult a qualified healthcare professional about individual needs. No purchases or payments are processed on this page.' },
  social: { title: 'Stay close to the essentials.', text: 'Our social channels are not available from this page at the moment. Explore the journal for everyday wellness ideas, or prepare an enquiry through Contact Us.' }
};

function notify(message) {
  const toast = $('.toast');
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add('visible');
  toastTimer = setTimeout(() => toast.classList.remove('visible'), 4200);
}

// 原生 dialog 提供模态语义、焦点约束和 Escape 关闭。
function showDialog(content, trigger) {
  returnFocus = trigger || document.activeElement;
  dialogAnimation?.cancel();
  dialogBody.innerHTML = content;
  if (!dialog.open) dialog.showModal();
  document.body.classList.add('dialog-open');
  dialogBody.scrollTop = 0;
  if (!reduceMotion.matches) {
    dialogAnimation = dialog.animate([
      { opacity: 0, transform: 'translateY(12px) scale(.97)' },
      { opacity: 1, transform: 'translateY(0) scale(1)' }
    ], { duration: 230, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' });
  }
  $('.dialog-close').focus({ preventScroll: true });
}

function closeDialog() {
  dialogAnimation?.cancel();
  dialog.close();
}
$('.dialog-close').addEventListener('click', closeDialog);
dialog.addEventListener('click', (event) => {
  if (event.target !== dialog) return;
  const rect = dialog.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeDialog();
});
dialog.addEventListener('close', () => {
  document.body.classList.remove('dialog-open');
  if (returnFocus?.getClientRects().length) returnFocus.focus({ preventScroll: true });
  else $('.menu-toggle').focus({ preventScroll: true });
});

function productContent() {
  return `<div class="product-detail"><div class="product-detail-image"><img src="assets/forest-hero-labelled.webp" alt="The labelled Nexwell Daily Synbiotic resting naturally on forest moss"></div><div class="product-detail-copy"><span class="dialog-eyebrow">YOUR DAILY ESSENTIAL</span><h2 id="dialog-title">Daily Synbiotic.</h2><p>A considered probiotic + prebiotic formula, designed to fit into your everyday routine.</p><div class="detail-facts"><span>60 capsules<small>A simple daily format</small></span><span>Daily essential<small>A considered routine</small></span></div><details class="detail-accordion" open><summary>The intention</summary><p>A purposeful combination of probiotics and prebiotics, made for an uncomplicated approach to daily wellbeing.</p></details><details class="detail-accordion"><summary>Your daily routine</summary><p>Follow the directions on your product packaging. Discuss your individual needs with a qualified healthcare professional before starting any supplement.</p></details><details class="detail-accordion"><summary>Care & storage</summary><p>Keep tightly closed in a cool, dry place, away from direct sunlight and out of the reach of children.</p></details><button class="pill dialog-action" data-dialog-contact>Ask about this formula <span class="button-icon"><i class="ti ti-arrow-up-right" aria-hidden="true"></i></span></button><p class="product-disclaimer">Food supplements should not replace a varied, balanced diet and a healthy lifestyle.</p></div></div>`;
}

function contactContent() {
  return `<span class="dialog-eyebrow">LET'S KEEP IT SIMPLE</span><h2 id="dialog-title">A conversation starts here.</h2><p>Have a question about a formula or your daily routine? Prepare your enquiry and keep a copy to share with the Nexwell team.</p><form class="contact-form" id="contact-form"><label>Your name<input name="name" autocomplete="name" maxlength="100" required placeholder="Full name"></label><label>Email address<input type="email" name="email" autocomplete="email" maxlength="200" required placeholder="you@example.com"></label><label class="form-full">Your question<textarea name="message" maxlength="3000" required placeholder="What would you like to know?"></textarea></label><p class="form-note form-full">Your message will be downloaded as a text file. It will not be sent automatically.</p><button type="submit" class="pill dialog-action form-full">Download enquiry <span class="button-icon"><i class="ti ti-download" aria-hidden="true"></i></span></button><p class="form-note form-full" id="contact-status" role="status"></p></form>`;
}

function openContact(trigger) {
  showDialog(contactContent(), trigger);
}

$$('[data-open]').forEach((button) => button.addEventListener('click', () => {
  if (button.dataset.open === 'contact') return openContact(button);
    showDialog(productContent(), button);
}));
$$('[data-promise]').forEach((button) => button.addEventListener('click', () => {
  const item = promises[button.dataset.promise];
  showDialog(`<span class="dialog-eyebrow">OUR PROMISE</span><h2 id="dialog-title">${item.title}</h2><p>${item.body}</p><p>${item.detail}</p><button class="text-link" data-dialog-product>Explore our daily essential <i class="ti ti-arrow-up-right" aria-hidden="true"></i></button>`, button);
}));
$$('[data-info]').forEach((button) => button.addEventListener('click', () => {
  const item = information[button.dataset.info];
  showDialog(`<span class="dialog-eyebrow">NEXWELL SUPPORT</span><h2 id="dialog-title">${item.title}</h2>${item.body || `<p>${item.text}</p>`}`, button);
}));
$$('[data-article]').forEach((button) => button.addEventListener('click', () => {
  const article = articles[button.dataset.article];
  showDialog(`<div class="article-body"><img class="article-dialog-image" src="${article.image}" alt="${article.title}"><span class="dialog-eyebrow">${article.label}</span><h2 id="dialog-title">${article.title}</h2><p>${article.intro}</p><h3>${article.heading}</h3>${article.paragraphs.map((p) => `<p>${p}</p>`).join('')}</div>`, button);
}));

dialogBody.addEventListener('click', (event) => {
  if (event.target.closest('[data-dialog-contact]')) openContact(returnFocus);
  if (event.target.closest('[data-dialog-product]')) showDialog(productContent(), returnFocus);
});
dialogBody.addEventListener('submit', (event) => {
  if (event.target.id !== 'contact-form') return;
  event.preventDefault();
  const form = event.target;
  const data = new FormData(form);
  const name = data.get('name').trim();
  const email = data.get('email').trim();
  const message = data.get('message').trim();
  if (!name || !message) {
    $('#contact-status').textContent = 'Please include your name and question.';
    return;
  }
  const content = `NEXWELL — PRODUCT ENQUIRY\n\nName: ${name}\nEmail: ${email}\n\n${message}\n\nPrepared ${new Date().toLocaleDateString('en-GB')}\nThis enquiry has not been sent.\n`;
  const url = URL.createObjectURL(new Blob([content], { type: 'text/plain;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'nexwell-enquiry.txt';
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  $('#contact-status').textContent = 'Your enquiry file is ready. Your message has not been sent.';
});

$('#newsletter-form').addEventListener('submit', (event) => {
  event.preventDefault();
  $('#newsletter-status').textContent = 'Newsletter signup is unavailable right now. Your email has not been submitted.';
});

$$('[data-belief]').forEach((button) => button.addEventListener('click', () => {
  if (button.getAttribute('aria-pressed') === 'true') return;
  $$('[data-belief]').forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
  const paragraphs = beliefs[button.dataset.belief];
  const copy = $('.belief-copy');
  $('#belief-copy-one').textContent = paragraphs[0];
  $('#belief-copy-two').textContent = paragraphs[1];
  if (!reduceMotion.matches) {
    copy.getAnimations().forEach(animation => animation.cancel());
    copy.animate([{ opacity: .55 }, { opacity: 1 }], { duration: 200, easing: 'cubic-bezier(.23, 1, .32, 1)' });
  }
  window.ScrollTrigger?.refresh(true);
}));

const menuButton = $('.menu-toggle');
const mobileNav = $('#mobile-nav');
function setMenu(open) {
  mobileNav.hidden = !open;
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  menuButton.innerHTML = `<i class="ti ti-${open ? 'x' : 'menu-2'}" aria-hidden="true"></i>`;
}
menuButton.addEventListener('click', () => setMenu(mobileNav.hidden));
mobileNav.addEventListener('click', (event) => { if (event.target.closest('a, button')) setMenu(false); });
document.addEventListener('click', event => {
  // 按钮切换图标时会移除原始点击节点；用事件路径判断，避免菜单打开后立刻关闭。
  if (!mobileNav.hidden && !event.composedPath().includes($('.header'))) setMenu(false);
});
document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && !mobileNav.hidden) { setMenu(false); menuButton.focus(); } });

// 轮播位置按真实卡片宽度计算，不以固定像素猜测断点。
const track = $('.lifestyle-track');
const carouselWindow = $('.lifestyle-window');
const carouselCards = $$('.lifestyle-card');
let carouselIndex = 0;
let carouselTween;
let swipeStart = null;
function carouselMetrics() {
  const gap = parseFloat(getComputedStyle(track).gap) || 0;
  const width = carouselCards[0].getBoundingClientRect().width;
  const visibleCount = window.innerWidth <= 760 ? 1 : 3;
  return { width, gap, visibleCount, maxIndex: carouselCards.length - visibleCount };
}
function updateCarousel(animate = true) {
  const { width, gap, visibleCount, maxIndex } = carouselMetrics();
  carouselIndex = Math.max(0, Math.min(carouselIndex, maxIndex));
  const x = -(width + gap) * carouselIndex;
  $('.carousel-prev').disabled = carouselIndex === 0;
  $('.carousel-next').disabled = carouselIndex === maxIndex;
  $('.carousel-position').textContent = `${String(carouselIndex + 1).padStart(2, '0')} — ${String(carouselIndex + visibleCount).padStart(2, '0')}`;
  carouselCards.forEach((card, index) => {
    const visible = index >= carouselIndex && index < carouselIndex + visibleCount;
    card.inert = !visible;
    card.setAttribute('aria-hidden', String(!visible));
  });
  if (window.gsap && animate && !reduceMotion.matches) {
    carouselTween = gsap.to(track, { x, duration: .45, ease: 'power3.out', overwrite: 'auto' });
  } else {
    carouselTween?.kill();
    track.style.transform = `translateX(${x}px)`;
  }
}
$('.carousel-prev').addEventListener('click', () => { carouselIndex--; updateCarousel(); });
$('.carousel-next').addEventListener('click', () => { carouselIndex++; updateCarousel(); });
carouselWindow.addEventListener('touchstart', (event) => {
  if (event.touches.length === 1) swipeStart = { x: event.touches[0].clientX, y: event.touches[0].clientY };
}, { passive: true });
carouselWindow.addEventListener('touchend', (event) => {
  if (!swipeStart) return;
  const dx = event.changedTouches[0].clientX - swipeStart.x;
  const dy = event.changedTouches[0].clientY - swipeStart.y;
  if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.3) {
    const { maxIndex } = carouselMetrics();
    const next = carouselIndex + (dx < 0 ? 1 : -1);
    if (next < 0 || next > maxIndex) notify(next < 0 ? 'You are at the first story.' : 'You have reached the last story.');
    carouselIndex = next;
    updateCarousel();
  }
  swipeStart = null;
}, { passive: true });
carouselWindow.addEventListener('touchcancel', () => { swipeStart = null; }, { passive: true });
new ResizeObserver(() => updateCarousel(false)).observe(carouselWindow);
updateCarousel(false);

// 一个 SVG viewBox 同时承载罐体、胶囊与前景遮挡；不混用视口坐标和局部坐标。
function setupMotion() {
  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  const media = gsap.matchMedia();
  const steps = $$('.formula-step');
  let currentStep = -1;
  function selectStep(index) {
    if (index === currentStep) return;
    currentStep = index;
    steps.forEach((step, number) => {
      step.classList.toggle('is-current', number === index);
      if (number === index) step.setAttribute('aria-current', 'step');
      else step.removeAttribute('aria-current');
    });
  }

  media.add({
    desktop: '(min-width: 1101px) and (min-height: 800px)',
    compact: '(max-width: 1100px), (max-height: 799px)',
    reduced: '(prefers-reduced-motion: reduce)'
  }, (context) => {
    const { desktop, reduced } = context.conditions;
    gsap.to('.scroll-progress', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: true } });
    ScrollTrigger.create({ trigger: '.hero', start: 'bottom 110px', end: 'max', toggleClass: { targets: '.header', className: 'is-scrolled' } });
    selectStep(0);
    if (reduced) return;

    // 首屏只揭示文字，完整场景不拆层、不分别移动瓶子与草坪。
    gsap.timeline({ defaults: { ease: 'power3.out' } })
      .from('.hero-copy h1', { y: 20, opacity: 0, duration: .65 })
      .from('.hero-copy > p, .hero-copy > .pill', { opacity: 0, duration: .55, stagger: .06 }, .12);

    $$('.section-heading h2, .lifestyle-heading h2').forEach(title => {
      gsap.from(title, { y: 16, opacity: 0, duration: .65, ease: 'power3.out', scrollTrigger: { trigger: title, start: 'top 90%', once: true } });
    });
    gsap.from('.belief-capsules .capsule', { y: 14, opacity: 0, duration: .6, stagger: .07, ease: 'power3.out', scrollTrigger: { trigger: '.belief-capsules', start: 'top 88%', once: true } });
    gsap.from('.ritual-image', { clipPath: 'inset(0 0 100% 0)', duration: .8, ease: 'power3.inOut', scrollTrigger: { trigger: '.island-scene', start: 'top 82%', once: true } });
    gsap.from('.promise-card', { opacity: 0, duration: .6, stagger: .07, scrollTrigger: { trigger: '.promise-grid', start: 'top 85%', once: true } });

    document.body.classList.add('has-ritual-motion');
    const capsules = $$('.dose-capsule');
    const anchor = $(desktop ? '.formula-scroll' : '.dose-scene');
    const startPosition = () => {
      const top = anchor.getBoundingClientRect().top + window.scrollY;
      const stickyTop = Math.max(135, (window.innerHeight - $('.formula-stage').offsetHeight) / 2);
      return Math.max(0, top - (desktop ? stickyTop : window.innerHeight * .82));
    };
    const endPosition = () => desktop
      ? startPosition() + 1100
      : anchor.getBoundingClientRect().bottom + window.scrollY - window.innerHeight * .42;
    const ritual = gsap.timeline({
      scrollTrigger: {
        id: 'nexwell-dose',
        trigger: anchor,
        start: startPosition,
        end: endPosition,
        scrub: .35
      },
      onUpdate: function () { selectStep(Math.min(3, Math.floor(this.progress() * 4))); }
    });
    capsules.forEach((capsule, index) => {
      const position = .18 + index * .23;
      ritual.fromTo(capsule,
        { x: Number(capsule.dataset.x), y: Number(capsule.dataset.y) },
        { x: Number(capsule.dataset.endX), y: 515, duration: 1.45, ease: 'power1.inOut', immediateRender: true },
        position
      );
      ritual.fromTo($('.dose-spin', capsule),
        { attr: { transform: `rotate(${capsule.dataset.rotation})` } },
        { attr: { transform: 'rotate(0)' }, duration: 1.45, ease: 'power1.inOut' },
        position
      );
    });
    // 下落结束后停留；胶囊由瓶身前景自然遮住，不在瓶口外提前淡出。
    ritual.to({}, { duration: .28 });

    gsap.fromTo('.journey-landscape', { yPercent: -3 }, { yPercent: 3, ease: 'none', scrollTrigger: { trigger: '.journey', start: 'top bottom', end: 'bottom top', scrub: .6 } });
    $$('.lifestyle-card').slice(0, 3).forEach((card, index) => {
      gsap.from($('.lifestyle-image', card), { clipPath: 'inset(0 0 100% 0)', duration: .7, delay: index * .06, ease: 'power3.inOut', scrollTrigger: { trigger: '.lifestyle-window', start: 'top 87%', once: true } });
    });
    return () => {
      document.body.classList.remove('has-ritual-motion');
      selectStep(0);
    };
  });

  $('.ritual-replay').addEventListener('click', () => {
    const trigger = ScrollTrigger.getById('nexwell-dose');
    if (trigger) window.scrollTo({ top: trigger.start, behavior: 'smooth' });
  });
  let refreshQueued = false;
  const refresh = () => {
    if (refreshQueued) return;
    refreshQueued = true;
    requestAnimationFrame(() => { refreshQueued = false; ScrollTrigger.refresh(true); });
  };
  document.fonts.ready.then(refresh);
  // 所有图片槽位都预设了尺寸；图片解码不会改变布局，不在滚动途中反复 refresh。
  window.addEventListener('pagehide', event => { if (!event.persisted) media.revert(); });
}

// 动画库不可用时，导航仍能随首屏离开而切换为浅色。
if (!window.gsap || !window.ScrollTrigger) {
  new IntersectionObserver(entries => $('.header').classList.toggle('is-scrolled', !entries[0].isIntersecting), { rootMargin: '-90px 0px 0px 0px' }).observe($('.hero'));
}

setupMotion();
