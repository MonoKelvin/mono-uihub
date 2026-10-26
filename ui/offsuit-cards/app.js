const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const editions = {
  pink: { name: 'Electric pink', color: 'var(--pink)' },
  blue: { name: 'After hours', color: 'var(--blue)' },
};
const unitPrice = 18;
const maxQuantity = 12;
const money = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
const bag = new Map();
let edition = 'pink';
let quantity = 1;

const bagDialog = $('#bag-dialog');
const bagItems = $('#bag-items');
const checkoutMessage = $('#checkout-message');
const toast = $('#toast');
let toastTimer;

function notify(message) {
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add('is-visible');
  toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 3500);
}

function updateQuantity() {
  $('#quantity').value = quantity;
  $('#decrease-quantity').disabled = quantity <= 1;
  $('#increase-quantity').disabled = quantity >= maxQuantity;
}

$('#decrease-quantity').addEventListener('click', () => {
  quantity = Math.max(1, quantity - 1);
  updateQuantity();
});
$('#increase-quantity').addEventListener('click', () => {
  quantity = Math.min(maxQuantity, quantity + 1);
  updateQuantity();
});

$$('input[name="edition"]').forEach((radio) => {
  radio.addEventListener('change', () => {
    edition = radio.value;
    document.body.classList.toggle('edition-blue', edition === 'blue');
    $('#edition-name').textContent = editions[edition].name;
    $('.box-front svg').setAttribute('aria-label', `OFFSUIT Wild Card playing card box in ${editions[edition].name}`);
  });
});

$('#flip-deck').addEventListener('click', (event) => {
  const button = event.currentTarget;
  const flipped = button.getAttribute('aria-pressed') !== 'true';
  button.setAttribute('aria-pressed', String(flipped));
  button.setAttribute('aria-label', flipped ? 'Show the front of the box' : 'Turn the box around');
});
$('#shuffle-hero').addEventListener('click', () => {
  $('#product-stage').classList.toggle('is-shuffled');
});
$$('.fan-card').forEach((card) => {
  card.addEventListener('click', () => {
    card.setAttribute('aria-pressed', String(card.getAttribute('aria-pressed') !== 'true'));
  });
});

function bagTotals() {
  const count = [...bag.values()].reduce((total, amount) => total + amount, 0);
  const subtotal = count * unitPrice;
  const shipping = count && subtotal < 50 ? 5 : 0;
  return { count, subtotal, shipping, total: subtotal + shipping };
}

function renderBag(focusTarget) {
  const totals = bagTotals();
  $('#bag-count').textContent = `(${totals.count})`;
  $('#open-bag').setAttribute('aria-label', `Open bag, ${totals.count} ${totals.count === 1 ? 'deck' : 'decks'}`);
  $('#bag-footer').hidden = totals.count === 0;
  checkoutMessage.hidden = true;
  $('#checkout').disabled = false;

  if (!totals.count) {
    bagItems.innerHTML = '<div class="empty-bag"><i class="ti ti-shopping-bag" aria-hidden="true"></i><h3>A good hand starts here.</h3><p>Your bag is waiting for its first deck.</p><button type="button" class="primary-button" data-action="continue">Find your deck</button></div>';
  } else {
    // Values are selected from the local edition dictionary, never from user HTML.
    bagItems.innerHTML = [...bag.entries()].map(([key, count]) => `
      <article class="bag-item" data-edition="${key}">
        <svg class="bag-item-art" viewBox="0 0 300 430" style="--edition: ${editions[key].color}" role="img" aria-label="${editions[key].name} deck"><use href="#deck-art"/></svg>
        <div class="bag-item-info">
          <div class="bag-item-head"><h3>Wild Card</h3><span>${money(count * unitPrice)}</span></div>
          <p>${editions[key].name}</p>
          <div class="bag-item-actions">
            <div class="quantity-picker" aria-label="${editions[key].name} quantity">
              <button type="button" data-action="decrease" aria-label="One fewer ${editions[key].name} deck" ${count <= 1 ? 'disabled' : ''}><i class="ti ti-minus" aria-hidden="true"></i></button>
              <output aria-live="polite">${count}</output>
              <button type="button" data-action="increase" aria-label="One more ${editions[key].name} deck" ${count >= maxQuantity ? 'disabled' : ''}><i class="ti ti-plus" aria-hidden="true"></i></button>
            </div>
            <button class="remove-item" type="button" data-action="remove" aria-label="Remove ${editions[key].name} deck from bag">Remove</button>
          </div>
        </div>
      </article>
    `).join('');
  }

  $('#bag-subtotal').textContent = money(totals.subtotal);
  $('#bag-shipping').textContent = totals.shipping ? money(totals.shipping) : 'Free';
  $('#bag-total').textContent = money(totals.total);

  if (focusTarget) {
    const row = $(`[data-edition="${focusTarget.edition}"]`, bagItems);
    const sameButton = row && $(`[data-action="${focusTarget.action}"]:not(:disabled)`, row);
    const fallback = row && $('button:not(:disabled)', row);
    (sameButton || fallback || $('button', bagItems) || $('#close-bag')).focus();
  }
}

function openBag() {
  renderBag();
  if (!bagDialog.open) {
    document.body.classList.add('dialog-open');
    bagDialog.showModal();
  }
}

$('#open-bag').addEventListener('click', openBag);
$('#close-bag').addEventListener('click', () => bagDialog.close());
bagDialog.addEventListener('close', () => document.body.classList.remove('dialog-open'));
let backdropPointer = false;
bagDialog.addEventListener('pointerdown', (event) => {
  backdropPointer = event.target === bagDialog && event.clientX < bagDialog.getBoundingClientRect().left;
});
bagDialog.addEventListener('click', (event) => {
  if (backdropPointer && event.target === bagDialog) bagDialog.close();
  backdropPointer = false;
});

$('#add-to-bag').addEventListener('click', () => {
  const existing = bag.get(edition) || 0;
  if (existing + quantity > maxQuantity) {
    notify(`Up to ${maxQuantity} decks per color. You already have ${existing} in your bag.`);
    return;
  }
  bag.set(edition, existing + quantity);
  openBag();
});

bagItems.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;
  const { action } = button.dataset;
  if (action === 'continue') {
    bagDialog.close();
    return;
  }
  const row = button.closest('[data-edition]');
  if (!row) return;
  const key = row.dataset.edition;
  const count = bag.get(key);
  if (action === 'remove') bag.delete(key);
  if (action === 'increase') bag.set(key, Math.min(maxQuantity, count + 1));
  if (action === 'decrease') bag.set(key, Math.max(1, count - 1));
  renderBag({ edition: key, action });
});

$('#checkout').addEventListener('click', () => {
  if (!bag.size) return;
  checkoutMessage.hidden = false;
  $('#checkout').disabled = true;
  $('#save-bag').focus({ preventScroll: true });
  checkoutMessage.scrollIntoView({ behavior: motionReduced() ? 'instant' : 'smooth', block: 'nearest' });
});

$('#save-bag').addEventListener('click', () => {
  const totals = bagTotals();
  const lines = ['OFFSUIT / Wild Card', 'Bag summary (not an order)', ''];
  bag.forEach((count, key) => lines.push(`${editions[key].name}: ${count} x ${money(unitPrice)} = ${money(count * unitPrice)}`));
  lines.push('', `Subtotal: ${money(totals.subtotal)}`, `US standard shipping: ${money(totals.shipping)}`, `Estimated total: ${money(totals.total)}`, 'USD. Taxes are not included. No payment has been taken.');
  const url = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'offsuit-bag.txt';
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});

// Only the motion preference persists. Product choices and bag contents do not.
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
let motionPaused = false;
try { motionPaused = localStorage.getItem('offsuit-motion') === 'paused'; } catch { /* Storage is optional for file previews. */ }
function motionReduced() { return reducedMotion.matches || motionPaused; }
const ensemble = $('#product-ensemble');
const motionButton = $('#motion-toggle');
const strip = $('.strip-track');
const fan = $('#fan-display');

function syncMotion() {
  document.documentElement.classList.toggle('motion-paused', motionPaused);
  motionButton.disabled = reducedMotion.matches;
  motionButton.setAttribute('aria-pressed', String(motionPaused || reducedMotion.matches));
  motionButton.innerHTML = reducedMotion.matches
    ? 'Reduced motion <i class="ti ti-player-pause" aria-hidden="true"></i>'
    : `${motionPaused ? 'Resume' : 'Pause'} motion <i class="ti ti-player-${motionPaused ? 'play' : 'pause'}" aria-hidden="true"></i>`;
  motionButton.title = reducedMotion.matches ? 'Following your device’s reduced motion preference' : 'Control decorative motion';
  if (motionReduced()) {
    ensemble.style.transform = '';
    strip.style.transform = '';
    fan.classList.remove('is-waiting');
  }
}
motionButton.addEventListener('click', () => {
  motionPaused = !motionPaused;
  try { localStorage.setItem('offsuit-motion', motionPaused ? 'paused' : 'playing'); } catch { /* Keep the in-memory preference. */ }
  syncMotion();
});
reducedMotion.addEventListener('change', syncMotion);
syncMotion();

let pointerFrame = 0;
$('#product-stage').addEventListener('pointermove', (event) => {
  if (!finePointer.matches || motionReduced() || pointerFrame) return;
  const { clientX, clientY } = event;
  pointerFrame = requestAnimationFrame(() => {
    pointerFrame = 0;
    if (motionReduced()) return;
    const bounds = $('#product-stage').getBoundingClientRect();
    const x = (clientX - bounds.left) / bounds.width - .5;
    const y = (clientY - bounds.top) / bounds.height - .5;
    ensemble.style.transform = `rotateX(${-y * 7}deg) rotateY(${x * 11}deg) translateY(${-y * 5}px)`;
  });
});
$('#product-stage').addEventListener('pointerleave', () => {
  cancelAnimationFrame(pointerFrame);
  pointerFrame = 0;
  ensemble.style.transform = '';
});

if ('IntersectionObserver' in window && !motionReduced()) {
  fan.classList.add('is-waiting');
  const observer = new IntersectionObserver((entries) => {
    if (entries.some((entry) => entry.isIntersecting)) {
      fan.classList.remove('is-waiting');
      observer.disconnect();
    }
  }, { threshold: .25 });
  observer.observe(fan);
}
let scrollFrame = 0;
window.addEventListener('scroll', () => {
  if (scrollFrame || motionReduced()) return;
  scrollFrame = requestAnimationFrame(() => {
    scrollFrame = 0;
    if (motionReduced()) return;
    const bounds = $('.game-strip').getBoundingClientRect();
    if (bounds.bottom < 0 || bounds.top > window.innerHeight) return;
    const progress = 1 - bounds.top / window.innerHeight;
    strip.style.transform = `translateX(${-progress * 100}px)`;
  });
}, { passive: true });

const suits = [
  { name: 'spades', icon: 'spade', red: false },
  { name: 'hearts', icon: 'hearts', red: true },
  { name: 'clubs', icon: 'clubs', red: false },
  { name: 'diamonds', icon: 'diamonds', red: true },
];
const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const rankNames = ['Ace', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Jack', 'Queen', 'King'];
const drawButton = $('#draw-card');
const luckyCard = $('#lucky-card');
let lastCard = -1;
let dealing = false;

drawButton.addEventListener('click', () => {
  if (dealing) return;
  dealing = true;
  drawButton.disabled = true;
  drawButton.innerHTML = 'Dealing… <i class="ti ti-cards" aria-hidden="true"></i>';
  const wasRevealed = luckyCard.classList.contains('is-revealed');
  luckyCard.classList.remove('is-revealed');
  const delay = wasRevealed && !motionReduced() ? 700 : 0;
  setTimeout(() => {
    let nextCard;
    do { nextCard = Math.floor(Math.random() * 52); } while (nextCard === lastCard);
    lastCard = nextCard;
    const rank = nextCard % 13;
    const suit = suits[Math.floor(nextCard / 13)];
    $$('.lucky-rank').forEach((element) => { element.textContent = ranks[rank]; });
    $$('.lucky-suit').forEach((element) => {
      suits.forEach((value) => element.classList.remove(`ti-${value.icon}`));
      element.classList.add(`ti-${suit.icon}`);
    });
    $('.lucky-face').classList.toggle('is-red', suit.red);
    luckyCard.classList.add('is-revealed');
    $('#lucky-result').textContent = `${rankNames[rank]} of ${suit.name}. Make it a good hand.`;
    setTimeout(() => {
      dealing = false;
      drawButton.disabled = false;
      drawButton.innerHTML = 'Deal again <i class="ti ti-cards" aria-hidden="true"></i>';
    }, motionReduced() ? 0 : 700);
  }, delay);
});

$('#copy-deck').addEventListener('click', async () => {
  const text = `OFFSUIT / Wild Card playing cards. ${editions[edition].name}. ${money(unitPrice)} USD. 52 cards + 2 jokers, 310 gsm linen finish, 63 × 88 mm.`;
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      const input = document.createElement('textarea');
      input.value = text;
      input.className = 'sr-only';
      document.body.append(input);
      input.select();
      const copied = document.execCommand('copy');
      input.remove();
      $('#copy-deck').focus({ preventScroll: true });
      if (!copied) throw new Error('Clipboard unavailable');
    }
    notify('Deck details copied. Pass on the good stuff.');
  } catch {
    notify('Clipboard access is blocked. Please allow it in your browser and try again.');
  }
});

renderBag();
