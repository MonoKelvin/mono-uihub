/* ============================================================
   AUREA · 顶级艺术拍卖行 (v2)
   交互与动效：滚动叙事 / 导航 / 计数 / 揭示 / 标题入场
   ============================================================ */

(function () {
  "use strict";

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasGsap = !prefersReduced && typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);

  /* ---------- 顶部导航状态 ---------- */
  const header = document.getElementById("siteHeader");
  function updateHeader() {
    if (!header) return;
    header.classList.toggle("scrolled", window.scrollY > 60);
  }
  window.addEventListener("scroll", updateHeader, { passive: true });
  updateHeader();

  /* ---------- 移动端菜单 ---------- */
  const burger = document.getElementById("burger");
  const mobileMenu = document.getElementById("mobileMenu");
  const mmLinks = document.querySelectorAll(".mm-link");

  function toggleMenu(force) {
    if (!burger || !mobileMenu) return;
    const open = force !== undefined ? force : !mobileMenu.classList.contains("open");
    mobileMenu.classList.toggle("open", open);
    burger.classList.toggle("open", open);
    document.body.style.overflow = open ? "hidden" : "";
  }
  if (burger) burger.addEventListener("click", () => toggleMenu());
  mmLinks.forEach((link) => link.addEventListener("click", () => toggleMenu(false)));

  /* ---------- Hero 标题入场（GSAP 并行揭示） ---------- */
  const heroTitle = document.getElementById("heroTitle");
  if (heroTitle) {
    if (hasGsap) {
      const tl = gsap.timeline({ delay: 0.05 });
      const l1 = heroTitle.querySelector(".hero-line-1");
      const l2 = heroTitle.querySelector(".hero-line-2");
      if (l1 && l2) {
        // 两行标题并行：分别从上下 clip 揭示，制造对撞错位
        tl.from(l1, {
          yPercent: 70,
          autoAlpha: 0,
          clipPath: "inset(0 0 100% 0)",
          duration: 1.2,
          ease: "power4.out"
        }, 0)
          .from(l2, {
            yPercent: -40,
            autoAlpha: 0,
            clipPath: "inset(100% 0 0 0)",
            duration: 1.1,
            ease: "power4.out"
          }, 0.08);
      } else {
        tl.from(heroTitle, { yPercent: 40, autoAlpha: 0, duration: 1.1, ease: "power4.out" }, 0);
      }
      // 眉标 / 副标题 / CTA：与标题并行进入（不是等标题播完）
      tl.from(".hero-eyebrow", {
        y: -18,
        autoAlpha: 0,
        duration: 0.7,
        ease: "power3.out"
      }, 0.25)
        .from(".hero-sub", {
          y: 30,
          autoAlpha: 0,
          duration: 0.85,
          ease: "power3.out"
        }, 0.4)
        .from(".hero-cta-row", {
          y: 26,
          autoAlpha: 0,
          duration: 0.8,
          ease: "power3.out"
        }, 0.55);
    }
  }

  /* ---------- Hero 背景装饰：横向滚动视差（scrub） ---------- */
  if (hasGsap) {
    const hdWord = document.querySelector(".hd-word");
    if (hdWord) {
      gsap.to(hdWord, {
        xPercent: -8,
        ease: "none",
        scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 1 }
      });
    }
    const hdRing = document.querySelector(".hd-ring");
    if (hdRing) {
      gsap.to(hdRing, {
        yPercent: 24,
        rotation: 30,
        ease: "none",
        scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 1.4 }
      });
    }
    const hsBadge = document.querySelector(".hs-badge");
    if (hsBadge) {
      gsap.from(hsBadge, {
        y: 40,
        autoAlpha: 0,
        duration: 1,
        delay: 0.6,
        ease: "power3.out"
      });
    }
  }

  /* ---------- Hero 数据条：错峰入场（GSAP stagger） ---------- */
  const hmItems = document.querySelectorAll(".hm-item");
  if (hmItems.length && hasGsap) {
    gsap.from(hmItems, {
      y: 34,
      autoAlpha: 0,
      duration: 0.9,
      ease: "power3.out",
      stagger: 0.1,
      delay: 0.7
    });
  }

  /* ---------- 章节大编号：滚动位移（scrub 快慢） ---------- */
  if (hasGsap) {
    document.querySelectorAll(".section-index").forEach((el, i) => {
      gsap.fromTo(el,
        { x: i % 2 ? 24 : -24, opacity: 0.2 },
        {
          x: 0,
          opacity: 0.55,
          ease: "none",
          scrollTrigger: {
            trigger: el.closest(".section-head") || el,
            start: "top 92%",
            end: "top 45%",
            scrub: 0.9
          }
        }
      );
    });
  }

  /* ---------- 滚动揭示动画 ---------- */
  const revealEls = document.querySelectorAll(".reveal, .reveal-l, .reveal-r, .reveal-scale");
  if (revealEls.length) {
    if (prefersReduced || !("IntersectionObserver" in window)) {
      revealEls.forEach((el) => el.classList.add("in"));
    } else {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("in");
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1, rootMargin: "0px 0px -6% 0px" }
      );
      revealEls.forEach((el) => io.observe(el));
    }
  }

  /* ---------- 横向滚动条带 · 无限循环 + 滚动变速（GSAP） ---------- */
  const mqTrack = document.querySelector(".marquee-track");
  if (mqTrack && hasGsap) {
    const mqTween = gsap.to(mqTrack, {
      xPercent: -50,
      duration: 24,
      ease: "none",
      repeat: -1
    });
    // 滚动驱动：向下滚动时条带加速，静止回落
    ScrollTrigger.create({
      trigger: document.body,
      start: "top top",
      end: "max",
      onUpdate: (self) => {
        const speed = 1 + Math.min(self.getVelocity() / 600, 3);
        mqTween.timeScale(speed);
      },
      onScrubComplete: () => mqTween.timeScale(1)
    });
  }

  /* ---------- 拍品画框错峰入场（GSAP，滚动触发） ---------- */
  const lotPieces = document.querySelectorAll(".lot-piece");
  if (lotPieces.length && hasGsap) {
    lotPieces.forEach((piece, i) => {
      const media = piece.querySelector(".lot-media");
      const isAlt = i % 2 === 1; // 错落侧

      // 1) 画框快速入场（阻尼回弹）
      gsap.from(piece, {
        y: isAlt ? 90 : 60,
        autoAlpha: 0,
        duration: 1.15,
        ease: "power4.out",
        delay: (i % 3) * 0.08,
        scrollTrigger: { trigger: piece, start: "top 88%" }
      });

      // 2) 滚动驱动：画框内图片慢速 zoom（纵深，scrub）
      if (media) {
        gsap.fromTo(media,
          { scale: 1.12 },
          {
            scale: 1,
            ease: "none",
            scrollTrigger: {
              trigger: piece,
              start: "top 95%",
              end: "top 25%",
              scrub: 1.2
            }
          }
        );
      }

      // 3) 滚动驱动：编号横向位移（快慢对比，scrub）
      const num = piece.querySelector(".lot-num");
      if (num) {
        gsap.fromTo(num,
          { x: isAlt ? 34 : -34, opacity: 0.2 },
          {
            x: 0,
            opacity: 1,
            ease: "none",
            scrollTrigger: {
              trigger: piece,
              start: "top 92%",
              end: "top 40%",
              scrub: 0.8
            }
          }
        );
      }
    });
  }

  /* ---------- 拍卖日历行：滚动驱动 + 阻尼 hover ---------- */
  const auctionRows = document.querySelectorAll(".auction-row");
  if (auctionRows.length && hasGsap) {
    auctionRows.forEach((row, i) => {
      gsap.from(row, {
        y: 34,
        autoAlpha: 0,
        duration: 0.9,
        ease: "power3.out",
        delay: (i % 2) * 0.1,
        scrollTrigger: { trigger: row, start: "top 90%" }
      });
      const date = row.querySelector(".a-date");
      if (date) {
        gsap.fromTo(date,
          { x: -26 },
          {
            x: 0,
            ease: "none",
            scrollTrigger: { trigger: row, start: "top 88%", end: "top 30%", scrub: 0.8 }
          }
        );
      }
    });
  }

  /* ---------- 品类条目：缩略图滚动驱动放大 + 快慢错位 ---------- */
  const catEntries = document.querySelectorAll(".cat-entry");
  if (catEntries.length && hasGsap) {
    catEntries.forEach((entry, i) => {
      gsap.from(entry, {
        x: i % 2 ? 30 : -30,
        autoAlpha: 0,
        duration: 0.9,
        ease: "power3.out",
        delay: (i % 2) * 0.12,
        scrollTrigger: { trigger: entry, start: "top 90%" }
      });
      const thumb = entry.querySelector(".cat-thumb");
      if (thumb) {
        gsap.fromTo(thumb,
          { scale: 0.82 },
          {
            scale: 1,
            ease: "none",
            scrollTrigger: { trigger: entry, start: "top 92%", end: "top 35%", scrub: 1 }
          }
        );
      }
    });
  }

  /* ---------- 服务图标：阻尼弹跳 hover（GSAP spring） ---------- */
  const svcIcons = document.querySelectorAll(".svc-icon");
  if (svcIcons.length && hasGsap) {
    svcIcons.forEach((icon) => {
      icon.addEventListener("mouseenter", () => {
        gsap.to(icon, { scale: 1.18, rotation: -6, duration: 0.35, ease: "back.out(2.5)" });
      });
      icon.addEventListener("mouseleave", () => {
        gsap.to(icon, { scale: 1, rotation: 0, duration: 0.6, ease: "elastic.out(1, 0.4)" });
      });
    });
  }

  /* ---------- 数字计数动画 ---------- */
  const counters = document.querySelectorAll(".hm-value");
  if (counters.length) {
    const animateCount = (el) => {
      const target = parseFloat(el.dataset.count);
      const suffix = el.dataset.suffix || "";
      const prefix = el.dataset.prefix || "";
      const isDecimal = target % 1 !== 0;
      const duration = 1600;
      const start = performance.now();
      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const val = target * eased;
        el.textContent = prefix + (isDecimal ? val.toFixed(1) : Math.round(val).toLocaleString()) + suffix;
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    const counterIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            counterIO.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach((el) => counterIO.observe(el));
  }

  /* ---------- Hero 滚动视差（GSAP 竖向驱动） ---------- */
  const heroStage = document.querySelector(".hero-stage");
  if (hasGsap) {
    // 主文案：慢速上移 + 淡出（纵向 scrub，快慢对比）
    gsap.to(".hero-copy", {
      yPercent: -16,
      autoAlpha: 0.25,
      ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom 35%", scrub: 1.2 }
    });
    // 挂画：向下微移（反向，制造前后景纵深）
    if (heroStage) {
      gsap.to(heroStage, {
        yPercent: 12,
        ease: "none",
        scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 1.4 }
      });
    }
  }

  /* ---------- CTA 群青圆：滚动放大（scrub，伪元素） ---------- */
  if (hasGsap) {
    gsap.fromTo(".cta-band", {
      "--c-scale": 0.6
    }, {
      "--c-scale": 1.15,
      ease: "none",
      scrollTrigger: { trigger: ".cta-band", start: "top 90%", end: "top 30%", scrub: 1 }
    });
  }

  /* ---------- Footer 入场（错峰） ---------- */
  if (hasGsap) {
    gsap.from(".footer-top > *", {
      y: 30,
      autoAlpha: 0,
      duration: 0.9,
      ease: "power3.out",
      stagger: 0.1,
      scrollTrigger: { trigger: ".footer-top", start: "top 92%" }
    });
  }

  /* ---------- 订阅表单（本地演示） ---------- */
  const form = document.getElementById("subscribeForm");
  const note = document.getElementById("ctaNote");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (note) {
        note.textContent = "订阅服务需要连接服务器，请在正式环境配置邮箱接口。";
        note.style.color = "var(--poppy)";
      }
      form.reset();
    });
  }

  /* ---------- 3D 悬停倾斜（阻尼跟随 + 弹性回正） ---------- */
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const tiltEls = document.querySelectorAll("[data-tilt]");
  if (tiltEls.length && !prefersReduced && finePointer) {
    tiltEls.forEach((el) => {
      const max = 7;
      if (hasGsap) {
        // 阻尼跟随：quickTo 让倾斜有惯性
        const rotX = gsap.quickTo(el, "rotationX", { duration: 0.55, ease: "power3.out" });
        const rotY = gsap.quickTo(el, "rotationY", { duration: 0.55, ease: "power3.out" });
        gsap.set(el, { transformPerspective: 1100 });
        el.addEventListener("pointermove", (e) => {
          const r = el.getBoundingClientRect();
          const px = (e.clientX - r.left) / r.width;
          const py = (e.clientY - r.top) / r.height;
          rotX((0.5 - py) * max * 2);
          rotY((px - 0.5) * max * 2);
          el.classList.add("is-tilting");
          el.style.animation = "none";
          el.style.setProperty("--gx", (px * 100).toFixed(2) + "%");
          el.style.setProperty("--gy", (py * 100).toFixed(2) + "%");
        });
        el.addEventListener("pointerleave", () => {
          el.classList.remove("is-tilting");
          // 弹性回正
          gsap.to(el, { rotationX: 0, rotationY: 0, duration: 0.9, ease: "elastic.out(1, 0.45)" });
          el.style.animation = "";
        });
      } else {
        el.addEventListener("pointermove", (e) => {
          const r = el.getBoundingClientRect();
          const px = (e.clientX - r.left) / r.width;
          const py = (e.clientY - r.top) / r.height;
          el.style.animation = "none";
          el.style.transform =
            "perspective(1100px) rotateX(" + ((0.5 - py) * max * 2).toFixed(2) +
            "deg) rotateY(" + ((px - 0.5) * max * 2).toFixed(2) + "deg)";
          el.style.setProperty("--gx", (px * 100).toFixed(2) + "%");
          el.style.setProperty("--gy", (py * 100).toFixed(2) + "%");
        });
        el.addEventListener("pointerleave", () => {
          el.style.transform = "";
          el.style.animation = "";
        });
      }
    });
  }

  /* ---------- 平滑锚点 ---------- */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      const id = anchor.getAttribute("href");
      if (id.length > 1) {
        const target = document.querySelector(id);
        if (target) {
          e.preventDefault();
          const offset = header && header.offsetHeight ? header.offsetHeight : 0;
          const top = target.getBoundingClientRect().top + window.scrollY - offset + 8;
          window.scrollTo({ top, behavior: prefersReduced ? "auto" : "smooth" });
        }
      }
    });
  });
})();
