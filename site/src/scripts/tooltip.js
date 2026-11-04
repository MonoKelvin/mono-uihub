export function tooltipPosition(anchor, tip, viewport) {
  const left = Math.max(8, Math.min(anchor.left + (anchor.width - tip.width) / 2, viewport.width - tip.width - 8));
  const above = anchor.top - tip.height - 9;
  const top = above >= 8 ? above : Math.min(viewport.height - tip.height - 8, anchor.bottom + 9);
  return { left, top: Math.max(8, top) };
}

// 提示与可访问名称只有一个来源；区域名称不作为整块背景的悬停提示。
export function tooltipLabel(element) {
  if (!element || ['HTML', 'BODY', 'MAIN', 'SECTION', 'ASIDE', 'NAV', 'IFRAME'].includes(element.tagName)) return '';
  if (['group', 'listbox', 'region', 'dialog', 'status', 'navigation'].includes(element.getAttribute('role'))) return '';
  return element.getAttribute('aria-label')?.trim() || '';
}

export function initTooltips() {
  if (document.querySelector('[data-site-tooltip]')) return;
  const adoptedNames = new WeakSet();
  function adoptTitle(element) {
    const title = element.getAttribute('title');
    if (title === null) return;
    if (title && (!element.hasAttribute('aria-label') || adoptedNames.has(element))) {
      element.setAttribute('aria-label', title);
      adoptedNames.add(element);
    }
    element.removeAttribute('title');
  }
  document.querySelectorAll('[title]').forEach(adoptTitle);
  // 动态插入或修改的原生 title 也被接管，不再显示浏览器默认气泡。
  new MutationObserver((records) => {
    records.forEach((record) => {
      if (record.type === 'attributes') adoptTitle(record.target);
      record.addedNodes?.forEach((node) => {
        if (node.nodeType !== 1) return;
        adoptTitle(node);
        node.querySelectorAll('[title]').forEach(adoptTitle);
      });
    });
  }).observe(document.documentElement, { subtree: true, childList: true, attributes: true, attributeFilter: ['title'] });

  const tip = document.createElement('div');
  tip.className = 'site-tooltip';
  tip.id = 'site-tooltip';
  tip.dataset.siteTooltip = '';
  tip.setAttribute('role', 'tooltip');
  tip.hidden = true;
  document.body.append(tip);
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  let active = null, pending = null, delay = 0, hideTimer = 0, oldDescription = null;
  const observer = new MutationObserver(() => {
    if (!active?.isConnected || !tooltipLabel(active)) { hide(); return; }
    tip.textContent = tooltipLabel(active);
    place();
  });
  function place() {
    if (!active) return;
    const position = tooltipPosition(active.getBoundingClientRect(), tip.getBoundingClientRect(), { width: document.documentElement.clientWidth, height: innerHeight });
    tip.style.left = position.left + 'px';
    tip.style.top = position.top + 'px';
  }
  function hide() {
    clearTimeout(delay);
    pending = null;
    observer.disconnect();
    if (active) {
      if (oldDescription === null) active.removeAttribute('aria-describedby'); else active.setAttribute('aria-describedby', oldDescription);
    }
    active = null;
    tip.dataset.open = 'false';
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => { tip.hidden = true; }, 150);
  }
  function show(element, immediate = false) {
    if (!tooltipLabel(element) || active === element || pending === element) return;
    hide();
    pending = element;
    const reveal = () => {
      pending = null;
      if (!element.isConnected || !tooltipLabel(element)) return;
      active = element;
      oldDescription = element.getAttribute('aria-describedby');
      element.setAttribute('aria-describedby', [oldDescription, tip.id].filter(Boolean).join(' '));
      clearTimeout(hideTimer);
      tip.textContent = tooltipLabel(element);
      tip.hidden = false;
      place();
      requestAnimationFrame(() => { if (active === element) tip.dataset.open = 'true'; });
      observer.observe(element, { attributes: true, attributeFilter: ['aria-label'] });
    };
    if (immediate) reveal(); else delay = setTimeout(reveal, 350);
  }
  document.addEventListener('pointerover', (event) => {
    if (fine.matches && event.pointerType !== 'touch') show(event.target.closest('[aria-label]'));
  });
  document.addEventListener('pointerout', (event) => {
    const element = event.target.closest('[aria-label]');
    if (element && !element.contains(event.relatedTarget)) hide();
  });
  document.addEventListener('focusin', (event) => {
    const element = event.target.closest('[aria-label]');
    if (element?.matches(':focus-visible')) show(element, true);
  });
  document.addEventListener('focusout', hide);
  document.addEventListener('pointerdown', hide);
  document.addEventListener('scroll', hide, true);
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') hide(); });
  addEventListener('resize', hide);
  addEventListener('hashchange', hide);
  addEventListener('popstate', hide);
}
