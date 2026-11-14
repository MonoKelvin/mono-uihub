(() => {
  'use strict';
  const canvas = document.querySelector('.canvas');
  const menu = document.querySelector('.product-menu');
  const toggle = document.querySelector('.menu-toggle');
  const views = ['overview', 'specification', 'bag'];
  const bagStatus = document.querySelector('.bag-status');
  const price = 1096.95;
  let quantity = 0;
  let saving = false;
  let started = false;
  let saveTimer;
  const money = value => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

  function setMenu(open, restoreFocus = false) {
    menu.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    toggle.querySelector('i').className = open ? 'ti ti-x' : 'ti ti-menu-2';
    if (open) menu.querySelector('[aria-current="page"]').focus();
    else if (restoreFocus) toggle.focus();
  }

  function setView(view, focus = false) {
    const name = view === 'specifications' ? 'specification' : view;
    canvas.dataset.view = view;
    views.forEach(key => { document.querySelector(`.${key}-view`).hidden = key !== name; });
    menu.querySelectorAll('[data-action]').forEach(button => {
      if (button.dataset.action === view) button.setAttribute('aria-current', 'page');
      else button.removeAttribute('aria-current');
    });
    setMenu(false);
    if (focus) {
      const target = document.querySelector(`.${name}-view button:not(:disabled)`) || document.querySelector('#bag-title');
      target.focus();
    }
  }

  function renderBag() {
    const empty = quantity === 0;
    document.querySelector('.bag-empty').hidden = !empty;
    document.querySelector('.bag-content').hidden = empty;
    document.querySelector('.bag-count').textContent = quantity;
    document.querySelector('#quantity').textContent = quantity;
    document.querySelector('#bag-total').textContent = money(price * quantity);
    document.querySelector('#decrease').disabled = quantity <= 1 || saving;
    document.querySelector('#increase').disabled = quantity >= 9 || saving;
    document.querySelector('#remove').disabled = saving;
    document.querySelector('#save-bag').disabled = empty || saving;
    document.querySelector('#save-bag').textContent = saving ? 'SAVING…' : 'SAVE BAG';
    document.querySelector('.bag-content').setAttribute('aria-busy', String(saving));
  }

  function clearStatus() {
    bagStatus.textContent = '';
    delete bagStatus.dataset.state;
  }

  function buy() {
    if (!quantity) quantity = 1;
    clearStatus();
    renderBag();
    setView('bag', true);
    document.querySelector('.announcement').textContent = 'Konica Hexanon AR added to your bag.';
  }

  function saveBag() {
    if (saving || !quantity) return;
    saving = true;
    clearStatus();
    renderBag();
    saveTimer = window.setTimeout(() => {
      try {
        const lines = ['STUDIO', 'Konica Hexanon AR', '40mm f/1.8 · Konica AR mount', `Quantity: ${quantity}`, `Unit price: ${money(price)}`, `Total: ${money(price * quantity)}`];
        const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'studio-shopping-bag.txt';
        document.body.append(link);
        link.click();
        link.remove();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
        bagStatus.dataset.state = 'success';
        bagStatus.textContent = 'Bag saved to a text file.';
      } catch {
        bagStatus.dataset.state = 'error';
        bagStatus.textContent = 'Could not save the file. Try again.';
      } finally {
        saving = false;
        renderBag();
      }
    }, 420);
  }

  function drawPatina() {
    const element = document.querySelector('.patina');
    element.width = 1400;
    element.height = 1080;
    const context = element.getContext('2d');
    if (!context) return;
    let seed = 97;
    const random = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    for (let i = 0; i < 65000; i++) {
      const x = random() * element.width;
      const y = random() * element.height;
      const bottom = y / element.height;
      if (random() > bottom * bottom * .7 + .045) continue;
      const a = (.05 + random() * .19) * (x > 980 ? 1.3 : 1);
      context.fillStyle = `rgba(187,164,58,${a})`;
      context.fillRect(x, y, .5 + random() * 1.25, .4 + random() * .65);
    }
  }

  function start() {
    if (started) return;
    started = true;
    drawPatina();
    renderBag();
    toggle.addEventListener('click', () => setMenu(menu.hidden));
    document.querySelector('.studio').addEventListener('click', () => setView('overview', true));
    document.querySelector('#buy-now').addEventListener('click', buy);
    document.querySelectorAll('[data-action]').forEach(button => button.addEventListener('click', () => {
      if (button.dataset.action === 'buy') buy();
      else setView(button.dataset.action, true);
    }));
    document.querySelector('#decrease').addEventListener('click', () => {
      if (!saving && quantity > 1) { quantity--; clearStatus(); renderBag(); }
    });
    document.querySelector('#increase').addEventListener('click', () => {
      if (!saving && quantity < 9) { quantity++; clearStatus(); renderBag(); }
    });
    document.querySelector('#remove').addEventListener('click', () => {
      if (saving) return;
      quantity = 0;
      clearStatus();
      renderBag();
      document.querySelector('.bag-empty button').focus();
    });
    document.querySelector('#save-bag').addEventListener('click', saveBag);
    document.addEventListener('pointerdown', event => {
      if (!menu.hidden && !menu.contains(event.target) && !toggle.contains(event.target)) setMenu(false, true);
    });
    document.addEventListener('focusin', event => {
      if (!menu.hidden && !menu.contains(event.target) && !toggle.contains(event.target)) setMenu(false);
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && !menu.hidden) { event.preventDefault(); setMenu(false, true); }
    });
    menu.addEventListener('keydown', event => {
      const buttons = [...menu.querySelectorAll('button:not(:disabled)')];
      const index = buttons.indexOf(document.activeElement);
      if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
        event.preventDefault();
        const next = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : (index + (event.key === 'ArrowDown' ? 1 : -1) + buttons.length) % buttons.length;
        buttons[next].focus();
      }
    });
    const image = document.querySelector('.lens-image');
    const fallback = document.querySelector('.image-error');
    image.addEventListener('error', () => { fallback.hidden = false; });
    image.addEventListener('load', () => {
      const restoreFocus = fallback.contains(document.activeElement);
      fallback.hidden = true;
      if (restoreFocus) {
        const view = canvas.dataset.view === 'specifications' ? 'specification' : canvas.dataset.view;
        document.querySelector(`.${view}-view button:not(:disabled)`)?.focus();
      }
    });
    if (image.complete && !image.naturalWidth) fallback.hidden = false;
    document.querySelector('#retry-image').addEventListener('click', () => {
      image.src = `./assets/lens.webp?retry=${Date.now()}`;
    });
    const accessory = document.querySelector('.accessory');
    accessory.addEventListener('error', () => { accessory.hidden = true; });
    window.addEventListener('pagehide', () => { window.clearTimeout(saveTimer); saving = false; renderBag(); });
  }
  start();
})();
