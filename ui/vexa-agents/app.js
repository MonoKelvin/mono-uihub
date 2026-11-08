const skins = { silver: 'Silver', sienna: 'Sienna' };
const purposes = { community: 'Community guide', commerce: 'Product advisor', personal: 'Personal assistant' };
const draft = { name: '', skin: 'silver', purpose: 'community', plan: 'build' };
const form = document.querySelector('#agent-form');
const nameInput = document.querySelector('#agent-name');
const code = document.querySelector('#api-code');
let copyTimer;
let motionMedia;
let hasEntered = false;

function configuration() {
  return {
    name: draft.name.trim() || 'Lumi',
    skin: draft.skin,
    purpose: draft.purpose,
    modules: ['core', 'skin'],
    workspace: null,
    plan: draft.plan
  };
}

function updateConfiguration() {
  clearTimeout(copyTimer);
  code.textContent = JSON.stringify(configuration(), null, 2);
  document.querySelector('#purpose-name').textContent = purposes[draft.purpose];
  document.querySelector('#plan-name').textContent = `${draft.plan.toUpperCase()} PLAN`;
  const copyButton = document.querySelector('[data-action="copy"]');
  if (!copyButton.disabled) {
    copyButton.querySelector('span').textContent = 'Copy configuration';
    copyButton.querySelector('.ti').className = 'ti ti-copy';
  }
  document.querySelector('#api-feedback').hidden = true;
}

function applySkin(key) {
  draft.skin = key;
  document.querySelectorAll('[data-skin]').forEach(button => {
    button.setAttribute('aria-pressed', String(button.dataset.skin === key));
  });
  document.querySelectorAll('[data-portrait]').forEach(portrait => {
    const selected = portrait.dataset.portrait === key;
    portrait.classList.toggle('is-selected', selected);
    portrait.setAttribute('aria-hidden', String(!selected));
  });
  document.querySelectorAll('input[name="skin"]').forEach(input => { input.checked = input.value === key; });
  document.querySelector('.skin-showcase').dataset.selectedSkin = key;
  document.querySelector('#skin-name').textContent = skins[key].toUpperCase();
  updateConfiguration();
}

function choosePlan(key) {
  draft.plan = key;
  document.querySelectorAll('[data-plan]').forEach(button => {
    const selected = button.dataset.plan === key;
    button.setAttribute('aria-pressed', String(selected));
    button.querySelector('.ti').className = selected ? 'ti ti-check' : 'ti ti-arrow-right';
  });
  updateConfiguration();
}

function goToBuilder() {
  document.querySelector('#build').scrollIntoView({ block: 'start' });
  window.history.replaceState(null, '', '#build');
  nameInput.focus({ preventScroll: true });
}

function downloadConfiguration(config = configuration()) {
  const blob = new Blob([JSON.stringify(config, null, 2) + '\n'], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const filename = (config.name.toLowerCase().replace(/[^\p{L}\p{N}-]+/gu, '-').replace(/^-|-$/g, '') || 'agent').slice(0, 48);
  link.download = `vexa-${filename}.json`;
  document.body.append(link);
  try { link.click(); }
  finally {
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  }
}

function apiFeedback(message) {
  const feedback = document.querySelector('#api-feedback');
  feedback.textContent = message;
  feedback.hidden = false;
}

async function copyConfiguration(button) {
  clearTimeout(copyTimer);
  button.disabled = true;
  button.setAttribute('aria-busy', 'true');
  button.querySelector('span').textContent = 'Copying…';
  try {
    await navigator.clipboard.writeText(JSON.stringify(configuration(), null, 2));
    button.querySelector('span').textContent = 'Copied';
    button.querySelector('.ti').className = 'ti ti-check';
    apiFeedback('Agent configuration copied.');
    copyTimer = setTimeout(() => {
      button.querySelector('span').textContent = 'Copy configuration';
      button.querySelector('.ti').className = 'ti ti-copy';
      document.querySelector('#api-feedback').hidden = true;
    }, 2200);
  } catch {
    button.querySelector('span').textContent = 'Copy configuration';
    button.querySelector('.ti').className = 'ti ti-copy';
    const range = document.createRange();
    range.selectNodeContents(code);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    code.focus({ preventScroll: true });
    apiFeedback('Copy is unavailable. Select the configuration to copy it.');
  } finally {
    button.disabled = false;
    button.removeAttribute('aria-busy');
  }
}

async function submitAgent() {
  const error = document.querySelector('#name-error');
  const result = document.querySelector('#form-result');
  const button = form.querySelector('.export-button');
  if (button.disabled) return;
  const reset = document.querySelector('#reset-agent');
  const name = nameInput.value.trim();
  result.hidden = true;
  reset.hidden = true;
  if (name.length < 2 || name.length > 40) {
    error.textContent = name ? 'Use between 2 and 40 characters.' : 'Enter a name for your agent.';
    error.hidden = false;
    nameInput.setAttribute('aria-invalid', 'true');
    nameInput.focus();
    return;
  }
  error.hidden = true;
  nameInput.removeAttribute('aria-invalid');
  draft.name = name;
  updateConfiguration();
  const config = configuration();
  button.disabled = true;
  button.setAttribute('aria-busy', 'true');
  button.querySelector('.ti').className = 'ti ti-loader-2';
  button.querySelector('span').textContent = 'Preparing…';
  await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  try {
    downloadConfiguration(config);
    result.dataset.state = 'success';
    result.textContent = 'Your agent configuration is ready.';
    reset.hidden = false;
    button.querySelector('span').textContent = 'Download again';
  } catch {
    result.dataset.state = 'error';
    result.textContent = "Your browser couldn't create the file. Try again.";
    button.querySelector('span').textContent = 'Try again';
  } finally {
    result.hidden = false;
    button.disabled = false;
    button.removeAttribute('aria-busy');
    button.querySelector('.ti').className = 'ti ti-download';
    window.ScrollTrigger?.refresh();
  }
}

function setupMotion() {
  if (motionMedia || !window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  motionMedia = gsap.matchMedia();
  motionMedia.add('(prefers-reduced-motion: no-preference)', () => {
    if (!hasEntered && window.scrollY < 20) {
      hasEntered = true;
      gsap.timeline({ defaults: { duration: .5, ease: 'power2.out' } })
        .from('.agent-image', { y: 12, opacity: .8 }, 0)
        .from('.hero-title', { y: 10 }, .06)
        .from('.hero-action', { opacity: .75 }, .12);
    }
    gsap.timeline({ scrollTrigger: { id: 'core-assembly', trigger: '#core', start: 'top 80%', end: 'bottom 45%', scrub: true }, defaults: { ease: 'none' } })
      .fromTo('.core-symbol', { rotation: -70, scale: .72 }, { rotation: 50, scale: 1, duration: 1 });
    gsap.timeline({ scrollTrigger: { id: 'core-entry', trigger: '.core-copy', start: 'top 85%', once: true }, defaults: { duration: .5, ease: 'power2.out' } })
      .from('.core-copy .section-title', { x: 18, opacity: .65 })
      .from('.capability-row', { x: 12, opacity: .6, stagger: .07 }, .1);
    gsap.timeline({ scrollTrigger: { id: 'skins-entry', trigger: '#skins', start: 'top 75%', once: true }, defaults: { duration: .5, ease: 'power2.out' } })
      .from('.skin-showcase', { y: 20, opacity: .65 }, 0)
      .from('.skins-copy .section-title', { x: -12 }, .08);
    gsap.timeline({ scrollTrigger: { id: 'purpose-entry', trigger: '#purpose', start: 'top 75%', once: true }, defaults: { duration: .45, ease: 'power2.out' } })
      .from('.usecase', { y: 16, opacity: .6, stagger: .07 });
    gsap.timeline({ scrollTrigger: { id: 'api-entry', trigger: '#api', start: 'top 70%', once: true }, defaults: { duration: .5, ease: 'power2.out' } })
      .from('.code-panel', { x: 16, opacity: .7 }, 0)
      .from('.builder-column .section-title', { x: -12 }, .08);
    gsap.timeline({ scrollTrigger: { id: 'pricing-entry', trigger: '#pricing', start: 'top 70%', once: true }, defaults: { duration: .5, ease: 'power2.out' } })
      .from('.pricing-tier', { y: 12, rotation: .5, opacity: .75, stagger: .08 });
    gsap.timeline({ scrollTrigger: { id: 'questions-entry', trigger: '#questions', start: 'top 75%', once: true }, defaults: { duration: .4, ease: 'power2.out' } })
      .from('.faq-item', { x: 10, opacity: .7, stagger: .05 });
    gsap.timeline({ scrollTrigger: { id: 'closing-entry', trigger: '#app', start: 'top 75%', once: true }, defaults: { duration: .5, ease: 'power2.out' } })
      .from('.footer-wordmark', { y: 12 }, 0);
  });
  document.fonts.ready.then(() => ScrollTrigger.refresh());
}

function start() {
  if (document.documentElement.dataset.vexaReady) return;
  document.documentElement.dataset.vexaReady = 'true';
  document.addEventListener('click', event => {
    const skinButton = event.target.closest('[data-skin]');
    if (skinButton) return applySkin(skinButton.dataset.skin);
    const planButton = event.target.closest('[data-plan]');
    if (planButton) { choosePlan(planButton.dataset.plan); return goToBuilder(); }
    const purposeButton = event.target.closest('[data-purpose]');
    if (purposeButton) {
      draft.purpose = purposeButton.dataset.purpose;
      updateConfiguration();
      return goToBuilder();
    }
    const actionButton = event.target.closest('[data-action]');
    if (!actionButton || actionButton.disabled) return;
    if (actionButton.dataset.action === 'copy') return copyConfiguration(actionButton);
    if (actionButton.dataset.action === 'export') {
      try { downloadConfiguration(); apiFeedback('Configuration ready.'); }
      catch { apiFeedback("Your browser couldn't create the file. Try again."); }
    }
    if (actionButton.dataset.action === 'reset') {
      draft.name = '';
      nameInput.value = '';
      nameInput.removeAttribute('aria-invalid');
      document.querySelector('#name-error').hidden = true;
      document.querySelector('#form-result').hidden = true;
      actionButton.hidden = true;
      form.querySelector('.export-button span').textContent = 'Download agent';
      updateConfiguration();
      nameInput.focus();
    }
  });
  form.addEventListener('change', event => {
    if (event.target.matches('input[name="skin"]')) applySkin(event.target.value);
  });
  nameInput.addEventListener('input', () => {
    draft.name = nameInput.value;
    nameInput.removeAttribute('aria-invalid');
    document.querySelector('#name-error').hidden = true;
    document.querySelector('#form-result').hidden = true;
    document.querySelector('#reset-agent').hidden = true;
    form.querySelector('.export-button span').textContent = 'Download agent';
    updateConfiguration();
  });
  form.addEventListener('submit', event => { event.preventDefault(); submitAgent(); });
  document.querySelectorAll('.faq-item').forEach(item => item.addEventListener('toggle', () => window.ScrollTrigger?.refresh()));
  window.addEventListener('load', setupMotion, { once: true });
  window.addEventListener('pagehide', event => {
    if (!event.persisted) { motionMedia?.revert(); clearTimeout(copyTimer); }
  });
  updateConfiguration();
}

start();
