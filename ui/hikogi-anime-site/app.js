/* 「灯漕」官网原型：最简原生 JS
   滚动出现 / 视差 / 导航高亮 / 角色切换 / 映像弹窗 / 轻提示 */

(() => {
  'use strict';

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* ---------------- 首屏入场 ---------------- */
  const hero = $('.hero');
  if (hero) requestAnimationFrame(() => hero.classList.add('is-ready'));

  /* ---------------- 滚动出现 ---------------- */
  const reveals = $$('.reveal');
  if (reduce || !('IntersectionObserver' in window)) {
    reveals.forEach(el => el.classList.add('is-in'));
  } else {
    const io = new IntersectionObserver((list) => {
      list.forEach(e => {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.06 });
    reveals.forEach(el => io.observe(el));
  }

  /* ---------------- 视差：主视觉 / 远景 / 沈み言纸片 ---------------- */
  const layers = $$('[data-parallax]');
  if (!reduce && layers.length) {
    let ticking = false;
    const paint = () => {
      ticking = false;
      const vh = window.innerHeight;
      layers.forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.bottom < -240 || r.top > vh + 240) return;
        const offset = (r.top + r.height / 2) - vh / 2;
        el.style.setProperty('--sy', (offset * parseFloat(el.dataset.parallax)).toFixed(2));
      });
    };
    const queue = () => { if (!ticking) { ticking = true; requestAnimationFrame(paint); } };
    addEventListener('scroll', queue, { passive: true });
    addEventListener('resize', queue);
    paint();
  }

  /* ---------------- 顶栏：底色与当前区块 ---------------- */
  const bar = $('#topbar');
  const onStick = () => bar.classList.toggle('is-stuck', window.scrollY > 40);
  addEventListener('scroll', onStick, { passive: true });
  onStick();

  const navLinks = $$('.nav__link');
  const sections = navLinks
    .map(a => $(a.getAttribute('href')))
    .filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    const spy = new IntersectionObserver((list) => {
      list.forEach(e => {
        if (!e.isIntersecting) return;
        navLinks.forEach(a => a.classList.toggle('is-here', a.getAttribute('href') === '#' + e.target.id));
      });
    }, { rootMargin: '-42% 0px -52% 0px' });
    sections.forEach(s => spy.observe(s));
  }

  /* ---------------- 角色切换 ---------------- */
  const names   = $$('.cname');
  const shots   = $$('.standee img');
  const profs   = $$('.cprof');
  const counter = $('[data-count]');
  let cur = 0;

  const show = (next) => {
    if (!names.length) return;
    cur = (next + names.length) % names.length;

    names.forEach((b, i) => {
      const on = i === cur;
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-selected', on ? 'true' : 'false');
      b.tabIndex = on ? 0 : -1;
    });
    shots.forEach((img, i) => {
      const on = i === cur;
      img.classList.toggle('is-on', on);
      img.setAttribute('aria-hidden', on ? 'false' : 'true');
    });
    profs.forEach((p, i) => { p.hidden = i !== cur; });
    if (counter) counter.textContent = String(cur + 1);
  };

  names.forEach((b, i) => b.addEventListener('click', () => show(i)));
  $$('[data-step]').forEach(b => b.addEventListener('click', () => show(cur + Number(b.dataset.step))));

  const rail = $('.chara__names');
  if (rail) {
    rail.addEventListener('keydown', (e) => {
      const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
      if (!step) return;
      e.preventDefault();
      show(cur + step);
      names[cur].focus();
    });
  }

  /* ---------------- 映像弹窗 ---------------- */
  const PV = {
    pv1: {
      img: 'assets/still-reflection.png',
      title: '第1弾PV', len: '90秒',
      info: '11月14日 18:00 公開予定です。公開までこの場で映像を再生することはできません。'
    },
    pv0: {
      img: 'assets/still-town.png',
      title: 'ティザー映像', len: '30秒',
      info: '10月31日 公開予定です。公開までこの場で映像を再生することはできません。'
    }
  };

  const lb       = $('#lb');
  const lbImg    = $('#lb-img');
  const lbTitle  = $('#lb-title');
  const lbInfo   = $('#lb-info');
  const lbClose  = $('.iconbtn--lb');
  let lastFocus  = null;

  const openLb = (key) => {
    const d = PV[key];
    if (!d || !lb) return;
    lastFocus = document.activeElement;
    lbImg.src = d.img;
    lbImg.alt = d.title + 'の一場面';
    lbTitle.textContent = d.title + '　' + d.len;
    lbInfo.textContent = d.info;
    lb.hidden = false;
    document.documentElement.style.overflow = 'hidden';
    requestAnimationFrame(() => {
      lb.classList.add('is-open');
      if (lbClose) lbClose.focus();
    });
  };

  const closeLb = () => {
    if (!lb || lb.hidden) return;
    lb.classList.remove('is-open');
    document.documentElement.style.overflow = '';
    setTimeout(() => {
      lb.hidden = true;
      if (lastFocus) lastFocus.focus();
    }, reduce ? 0 : 420);
  };

  $$('[data-pv]').forEach(b => b.addEventListener('click', () => openLb(b.dataset.pv)));
  if (lb) $$('[data-close]', lb).forEach(el => el.addEventListener('click', closeLb));
  addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLb(); });

  /* 焦点锁在弹窗内 */
  if (lb) {
    lb.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab') return;
      const able = $$('button, a[href], img[tabindex]', lb).filter(el => el.offsetParent !== null);
      if (!able.length) return;
      const first = able[0], last = able[able.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }

  /* ---------------- 占位链接：只提示准备中，不伪造成功 ---------------- */
  const toast = $('#toast');
  let toastTimer = 0;
  const say = (msg) => {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-on'), 2800);
  };

  $$('a[href="#"]').forEach(a => a.addEventListener('click', (e) => {
    e.preventDefault();
    say('このページは準備中です。');
  }));
})();
