/* ═══════════════════════════════════════════════
   WAVEFUN! 波玩公社 — 交互与动效
   平滑滚动 · 滚动驱动叙事 · 花哨反馈 · 社区功能
   ═══════════════════════════════════════════════ */

(() => {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ───── 平滑滚动 Lenis ───── */
  let lenis = null;
  if (!prefersReduced && window.Lenis) {
    lenis = new Lenis({
      duration: 0.9,
      smoothWheel: true,
      wheelMultiplier: 1.1,
      touchMultiplier: 1.4,
      easing: t => Math.min(1, 1.001 - Math.pow(2, -9 * t)),
    });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // 锚点跳转走 lenis
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(el, { offset: -80 });
      else el.scrollIntoView({ behavior: 'smooth' });
    });
  });

  /* ───── 顶栏滚动状态 ───── */
  const topbar = document.getElementById('topbar');
  const onScroll = () => topbar.classList.toggle('is-scrolled', window.scrollY > 20);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ───── 游标跟随 ───── */
  const cursor = document.getElementById('cursor');
  if (cursor && matchMedia('(pointer: fine)').matches && !prefersReduced) {
    const ring = cursor.querySelector('.cursor-ring');
    const xTo = gsap.quickTo(cursor, 'x', { duration: 0.4, ease: 'power3.out' });
    const yTo = gsap.quickTo(cursor, 'y', { duration: 0.4, ease: 'power3.out' });
    window.addEventListener('pointermove', e => { xTo(e.clientX); yTo(e.clientY); });
    document.querySelectorAll('a, button, .post, .channel-card, .event-card, .mason-item').forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('is-active'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('is-active'));
    });
  }

  /* ───── 数字滚动 ───── */
  const counters = document.querySelectorAll('[data-count]');
  const counterObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = +el.dataset.count;
      const dur = 1600;
      const start = performance.now();
      const step = (now) => {
        const p = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.floor(target * eased).toLocaleString();
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = target.toLocaleString();
      };
      requestAnimationFrame(step);
      counterObs.unobserve(el);
    });
  }, { threshold: 0.4 });
  counters.forEach(c => counterObs.observe(c));

  /* ───── 话题跑马灯（无限循环）───── */
  const track = document.getElementById('tickerTrack');
  if (track && !prefersReduced) {
    const items = track.innerHTML;
    track.innerHTML = items + items; // 两份实现无缝循环
    let pos = 0;
    let half = 0;
    const measure = () => { half = track.scrollWidth / 2; };
    measure();
    window.addEventListener('resize', measure);
    gsap.ticker.add(() => {
      pos -= 1.2;
      if (pos <= -half) pos += half;
      track.style.transform = `translateX(${pos}px)`;
    });
  }

  /* ───── HERO 入场 ───── */
  if (!prefersReduced) {
    gsap.set('.hero-title .line', { yPercent: 110 });
    gsap.set('.hero-visual .polaroid', { autoAlpha: 0, scale: 0.7, rotate: 0 });
    gsap.set('.sticker-pow, .sticker-boom, .sticker-wow', { autoAlpha: 0, scale: 0.3 });
    gsap.set('.hero-stats .stat', { autoAlpha: 0, y: 24 });

    const heroTl = gsap.timeline({ defaults: { ease: 'power4.out' } });
    heroTl
      .to('.hero-title .line', { yPercent: 0, duration: 1, stagger: 0.12 }, 0.25)
      .fromTo('.hero-sub', { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power3.out' }, 0.6)
      .fromTo('.hero-cta > *', { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'power3.out' }, 0.8)
      .to('.hero-stats .stat', { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'power3.out' }, 0.95)
      .to('.hero-visual .polaroid', { autoAlpha: 1, scale: 1, rotate: (i) => [-5, 4, -2][i], duration: 0.9, stagger: 0.15, ease: 'back.out(1.7)' }, 0.5)
      .to('.sticker-pow, .sticker-boom, .sticker-wow', { autoAlpha: 1, scale: 1, duration: 0.5, stagger: 0.1, ease: 'back.out(2.2)' }, 1.15)
      .fromTo('.hero-eyebrow', { autoAlpha: 0, y: -12 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power3.out' }, 0.15);
  }

  /* ───── 滚动驱动动画 ───── */
  if (!prefersReduced && window.ScrollTrigger) {
    // 标题逐行揭示
    gsap.utils.toArray('.sec-title').forEach(title => {
      gsap.from(title, {
        scrollTrigger: { trigger: title, start: 'top 88%', once: true },
        y: 40, autoAlpha: 0, duration: 0.8, ease: 'power3.out',
      });
    });
    gsap.utils.toArray('.kicker').forEach(k => {
      gsap.from(k, {
        scrollTrigger: { trigger: k, start: 'top 92%', once: true },
        x: -24, autoAlpha: 0, duration: 0.6, ease: 'power3.out',
      });
    });

    // 数据卡弹跳入场
    gsap.from('.data-card', {
      scrollTrigger: { trigger: '.databand-grid', start: 'top 85%', once: true },
      y: 50, autoAlpha: 0, scale: 0.9, stagger: 0.1, duration: 0.7, ease: 'back.out(1.6)',
    });

    // 频道卡错峰入场
    gsap.from('.channel-card', {
      scrollTrigger: { trigger: '.channel-grid', start: 'top 85%', once: true },
      y: 46, autoAlpha: 0, stagger: 0.09, duration: 0.65, ease: 'power3.out',
    });

    // 照片墙：视差 + 交错浮现
    gsap.utils.toArray('.mason-item').forEach((item, i) => {
      gsap.from(item, {
        scrollTrigger: { trigger: item, start: 'top 96%', once: true },
        y: 60, autoAlpha: 0, rotate: i % 2 ? 2 : -2, duration: 0.7, ease: 'power3.out',
      });
    });
    gsap.to('.masonry', {
      scrollTrigger: { trigger: '.wall', start: 'top bottom', end: 'bottom top', scrub: 1 },
      y: -30, ease: 'none',
    });

    // 帖子错峰入场
    gsap.from('.post', {
      scrollTrigger: { trigger: '.feed', start: 'top 86%', once: true },
      y: 44, autoAlpha: 0, stagger: 0.12, duration: 0.6, ease: 'power3.out',
    });

    // 活动卡翻转入场
    gsap.from('.event-card', {
      scrollTrigger: { trigger: '.event-row', start: 'top 84%', once: true },
      y: 70, autoAlpha: 0, rotate: (i) => [-3, 2, -2, 3][i], stagger: 0.12, duration: 0.75, ease: 'power3.out',
    });

    // 成员卡弹入
    gsap.from('.member-card', {
      scrollTrigger: { trigger: '.member-row', start: 'top 86%', once: true },
      y: 50, autoAlpha: 0, scale: 0.85, stagger: 0.09, duration: 0.6, ease: 'back.out(1.5)',
    });

    // 侧栏滑动入场
    gsap.from('.sidebar .side-card', {
      scrollTrigger: { trigger: '.sidebar', start: 'top 82%', once: true },
      x: 50, autoAlpha: 0, stagger: 0.1, duration: 0.6, ease: 'power3.out',
    });
  }

  /* ───── 通知面板 ───── */
  const notifyBtn = document.getElementById('notifyBtn');
  const notifyPanel = document.getElementById('notifyPanel');
  let notifyOpen = false;
  const notifyTl = gsap.timeline({ paused: true });
  notifyTl.fromTo(notifyPanel, { autoAlpha: 0, y: -8, scale: 0.96 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.3, ease: 'power3.out' });
  notifyTl.eventCallback('onReverseComplete', () => { notifyPanel.hidden = true; });

  const toggleNotify = () => {
    notifyOpen = !notifyOpen;
    if (notifyOpen) {
      notifyPanel.hidden = false;
      notifyTl.timeScale(1).play();
    } else {
      notifyTl.timeScale(1.6).reverse();
    }
    notifyBtn.setAttribute('aria-expanded', notifyOpen);
  };
  notifyBtn.addEventListener('click', (e) => { e.stopPropagation(); toggleNotify(); });
  document.addEventListener('click', (e) => { if (notifyOpen && !notifyPanel.contains(e.target)) toggleNotify(); });

  document.getElementById('notifyClear').addEventListener('click', () => {
    document.querySelectorAll('.notify-item').forEach(li => li.classList.add('is-read'));
    const badge = notifyBtn.querySelector('.dot-badge');
    if (badge) badge.style.display = 'none';
    showToast('已全部标记为已读');
  });

  /* ───── 搜索栏 ───── */
  const searchToggle = document.getElementById('searchToggle');
  const searchBar = document.getElementById('searchBar');
  const searchInput = document.getElementById('searchInput');
  let searchOpen = false;
  const toggleSearch = (open) => {
    searchOpen = open ?? !searchOpen;
    searchBar.hidden = !searchOpen;
    searchToggle.setAttribute('aria-expanded', searchOpen);
    if (searchOpen) setTimeout(() => searchInput.focus(), 60);
  };
  searchToggle.addEventListener('click', () => toggleSearch());
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && searchInput.value.trim()) {
      showToast(`正在搜索「${searchInput.value.trim()}」…`);
      toggleSearch(false);
    }
  });
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); toggleSearch(); }
    if (e.key === 'Escape') { toggleSearch(false); closeModal(); closeLightbox(); }
  });

  /* ───── 发帖弹窗 ───── */
  const composerBackdrop = document.getElementById('composerBackdrop');
  const composerText = document.getElementById('composerText');
  const composerCount = document.getElementById('composerCount');
  const publishBtn = document.getElementById('publishBtn');
  const topicPick = document.getElementById('topicPick');
  let pickedTopic = '';
  let modalOpen = false;
  const modalTl = gsap.timeline({ paused: true });
  modalTl
    .fromTo(composerBackdrop, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.22, ease: 'power2.out' }, 0)
    .fromTo('.modal', { scale: 0.9, y: 30, autoAlpha: 0 }, { scale: 1, y: 0, autoAlpha: 1, duration: 0.4, ease: 'back.out(1.6)' }, 0.05);

  const openModal = () => {
    modalOpen = true;
    composerBackdrop.hidden = false;
    modalTl.timeScale(1).play();
    setTimeout(() => composerText.focus(), 120);
  };
  const closeModal = () => {
    if (!modalOpen) return;
    modalOpen = false;
    modalTl.timeScale(1.8).reverse();
  };
  modalTl.eventCallback('onReverseComplete', () => { composerBackdrop.hidden = true; });

  document.getElementById('openComposer').addEventListener('click', openModal);
  document.getElementById('composerClose').addEventListener('click', closeModal);
  composerBackdrop.addEventListener('click', (e) => { if (e.target === composerBackdrop) closeModal(); });

  composerText.addEventListener('input', () => {
    composerCount.textContent = `${composerText.value.length} / 500`;
    if (composerText.value.length > 500) composerText.value = composerText.value.slice(0, 500);
  });

  document.getElementById('pickTopic').addEventListener('click', () => {
    topicPick.hidden = !topicPick.hidden;
  });
  topicPick.querySelectorAll('.topic-opt').forEach(opt => {
    opt.addEventListener('click', () => {
      pickedTopic = opt.textContent;
      topicPick.querySelectorAll('.topic-opt').forEach(o => o.classList.remove('is-picked'));
      opt.classList.add('is-picked');
      topicPick.hidden = true;
    });
  });

  publishBtn.addEventListener('click', () => {
    const text = composerText.value.trim();
    if (!text) { showToast('先写点内容吧'); return; }
    const feed = document.getElementById('feed');
    const first = feed.querySelector('.post');
    const newPost = document.createElement('article');
    newPost.className = 'post';
    newPost.dataset.liked = 'false';
    newPost.innerHTML = `
      <header class="post-head">
        <img src="./assets/avatar-12.jpg" alt="我" class="post-avatar">
        <div class="post-meta">
          <span class="post-name">我 <span class="post-tag">@me</span></span>
          <span class="post-time"><i class="ti ti-clock"></i> 刚刚 · 广场</span>
        </div>
        <button class="icon-btn sm" aria-label="更多"><i class="ti ti-dots"></i></button>
      </header>
      <div class="post-body">
        <p>${escapeHtml(text)}${pickedTopic ? ' <span class="post-topic">' + pickedTopic + '</span>' : ''}</p>
      </div>
      <footer class="post-actions">
        <button class="act like-btn" data-action="like"><i class="ti ti-heart"></i><span>0</span></button>
        <button class="act" data-action="comment"><i class="ti ti-message"></i><span>0</span></button>
        <button class="act" data-action="repost"><i class="ti ti-repeat"></i><span>0</span></button>
        <button class="act save-btn" data-action="save"><i class="ti ti-bookmark"></i></button>
      </footer>`;
    feed.insertBefore(newPost, feed.querySelector('.load-more'));
    bindPostActions(newPost);
    gsap.from(newPost, { y: -20, autoAlpha: 0, duration: 0.5, ease: 'back.out(1.4)' });
    showToast('发布成功');
    composerText.value = '';
    composerCount.textContent = '0 / 500';
    pickedTopic = '';
    topicPick.querySelectorAll('.topic-opt').forEach(o => o.classList.remove('is-picked'));
    closeModal();
  });

  const escapeHtml = (s) => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ───── 帖子交互（点赞/收藏/转发/评论）───── */
  const bindPostActions = (post) => {
    post.querySelector('[data-action="like"]').addEventListener('click', function () {
      const num = this.querySelector('span');
      const liked = this.classList.toggle('is-liked');
      post.dataset.liked = liked;
      let n = parseInt(num.textContent.replace(/[,\s]/g, '')) || 0;
      n += liked ? 1 : -1;
      num.textContent = n >= 1000 ? (n / 1000).toFixed(1).replace('.0', '') + 'k' : n;
    });
    post.querySelector('[data-action="save"]').addEventListener('click', function () {
      const saved = this.classList.toggle('is-saved');
      showToast(saved ? '已收藏' : '已取消收藏');
    });
    post.querySelector('[data-action="comment"]').addEventListener('click', () => showToast('评论功能演示'));
    post.querySelector('[data-action="repost"]').addEventListener('click', () => showToast('转发功能演示'));
  };
  document.querySelectorAll('.post').forEach(bindPostActions);

  /* ───── 关注按钮 ───── */
  document.querySelectorAll('.follow-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const followed = btn.classList.toggle('is-followed');
      btn.textContent = followed ? '已关注' : '关注';
      showToast(followed ? '已关注' : '已取消关注');
    });
  });

  /* ───── 活动报名 ───── */
  document.querySelectorAll('.event-join').forEach(btn => {
    btn.addEventListener('click', () => {
      const joined = btn.classList.toggle('is-joined');
      btn.textContent = joined ? '已报名 ✓' : '报名';
      showToast(joined ? '报名成功，活动前一天提醒你' : '已取消报名');
    });
  });

  /* ───── 照片墙点赞（hover 显示）───── */
  document.querySelectorAll('.m-likes').forEach(l => {
    l.style.cursor = 'pointer';
    l.addEventListener('click', () => {
      const textNode = [...l.childNodes].find(n => n.nodeType === 3);
      const cur = parseInt((textNode?.textContent || '').replace(/\D/g, '')) || 0;
      const liked = l.dataset.liked === '1';
      l.dataset.liked = liked ? '0' : '1';
      if (textNode) textNode.textContent = ' ' + (cur + (liked ? -1 : 1));
      showToast(liked ? '已取消点赞' : '已点赞');
    });
  });

  /* ───── 帖子图片灯箱 ───── */
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxTl = gsap.timeline({ paused: true });
  lightboxTl
    .fromTo(lightbox, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.22, ease: 'power2.out' }, 0)
    .fromTo(lightboxImg, { scale: 0.92 }, { scale: 1, duration: 0.35, ease: 'power3.out' }, 0.05);

  const openLightbox = (src) => {
    lightbox.hidden = false;
    lightboxImg.src = src;
    lightboxTl.timeScale(1).play();
  };
  const closeLightbox = () => {
    if (lightbox.hidden) return;
    lightboxTl.timeScale(1.6).reverse();
  };
  lightboxTl.eventCallback('onReverseComplete', () => { lightbox.hidden = true; lightboxImg.src = ''; });
  document.querySelectorAll('.post-imgs img').forEach(img => {
    img.addEventListener('click', () => openLightbox(img.src));
  });
  document.getElementById('lightboxClose').addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });

  /* ───── Toast ───── */
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toastMsg');
  let toastTimer;
  const showToast = (msg) => {
    toastMsg.textContent = msg;
    toast.hidden = false;
    clearTimeout(toastTimer);
    gsap.killTweensOf(toast);
    gsap.fromTo(toast, { y: 24, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.3, ease: 'back.out(1.6)' });
    toastTimer = setTimeout(() => {
      gsap.to(toast, { y: 16, autoAlpha: 0, duration: 0.3, ease: 'power2.in', onComplete: () => { toast.hidden = true; } });
    }, 2200);
  };

  /* ───── 发布按钮悬停微动 ───── */
  document.querySelectorAll('.btn-ink').forEach(b => {
    b.addEventListener('mouseenter', () => !prefersReduced && gsap.to(b, { scale: 1.04, duration: 0.2, ease: 'power2.out' }));
    b.addEventListener('mouseleave', () => !prefersReduced && gsap.to(b, { scale: 1, duration: 0.2, ease: 'power2.out' }));
  });

  // 暴露给控制台调试
  window.__wavefun = { showToast, lenis };
})();
