(() => {
  function start() {
    if (document.documentElement.dataset.sunReady) return;
    document.documentElement.dataset.sunReady = 'true';
    const views = [...document.querySelectorAll('.content-view')];
    const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
    const trigger = document.querySelector('#region-trigger');
    const menu = document.querySelector('#region-menu');
    const options = [...menu.querySelectorAll('[data-region]')];
    const form = document.querySelector('#request-form');
    const status = document.querySelector('#request-status');
    const saveButton = document.querySelector('#save-request');
    let region = 'Global';

    function showView(hash, scroll = true) {
      const selected = views.find((view) => `#${view.id}` === hash);
      views.forEach((view) => { view.hidden = view !== selected; });
      closeMenu();
      if (selected && scroll) {
        selected.querySelector('h2').focus({ preventScroll: true });
        selected.scrollIntoView({ behavior: reduceMotion.matches ? 'instant' : 'smooth', block: 'start' });
      } else if (hash === '#home' && scroll) {
        document.querySelector('.introduction .wordmark').focus({ preventScroll: true });
        window.scrollTo({ top: 0, behavior: reduceMotion.matches ? 'instant' : 'smooth' });
      }
    }

    function closeMenu(restoreFocus = false) {
      menu.hidden = true;
      trigger.setAttribute('aria-expanded', 'false');
      if (restoreFocus) trigger.focus({ preventScroll: true });
    }

    trigger.addEventListener('click', () => {
      const open = menu.hidden;
      menu.hidden = !open;
      trigger.setAttribute('aria-expanded', String(open));
      if (open) (options.find((option) => option.getAttribute('aria-selected') === 'true') || options[0]).focus({ preventScroll: true });
    });
    options.forEach((option) => {
      option.addEventListener('click', () => {
        region = option.dataset.region;
        document.querySelector('#region-label').textContent = region;
        document.querySelector('#request-region').textContent = region;
        options.forEach((entry) => entry.setAttribute('aria-selected', String(entry === option)));
        closeMenu(true);
      });
    });
    menu.addEventListener('keydown', (event) => {
      const index = options.indexOf(document.activeElement);
      if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
        event.preventDefault();
        let next = index;
        if (event.key === 'ArrowDown') next = (index + 1) % options.length;
        if (event.key === 'ArrowUp') next = (index - 1 + options.length) % options.length;
        if (event.key === 'Home') next = 0;
        if (event.key === 'End') next = options.length - 1;
        options[next].focus({ preventScroll: true });
      }
      if (event.key === 'Tab') closeMenu();
    });
    trigger.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        menu.hidden = false;
        trigger.setAttribute('aria-expanded', 'true');
        options[event.key === 'ArrowDown' ? 0 : options.length - 1].focus({ preventScroll: true });
      }
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !menu.hidden) closeMenu(true);
    });
    document.addEventListener('pointerdown', (event) => {
      if (!event.target.closest('.region-control')) closeMenu();
    });
    document.addEventListener('focusin', (event) => {
      if (!event.target.closest('.region-control') && !menu.hidden) closeMenu();
    });
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener('click', (event) => {
        const hash = link.getAttribute('href');
        if (hash === '#main') return;
        event.preventDefault();
        if (location.hash === hash) showView(hash);
        else location.hash = hash;
      });
    });
    window.addEventListener('hashchange', () => showView(location.hash));
    showView(location.hash, Boolean(location.hash));

    function validate() {
      const name = form.elements.name;
      const email = form.elements.email;
      const consent = form.elements.consent;
      const errors = [
        [name, '#name-error', name.value.trim() ? '' : 'Please enter your full name.'],
        [email, '#email-error', email.value.trim() && email.validity.valid ? '' : 'Enter a valid email address.'],
        [consent, '#consent-error', consent.checked ? '' : 'Please confirm your contact preference.'],
      ];
      errors.forEach(([input, selector, message]) => {
        input.setAttribute('aria-invalid', String(Boolean(message)));
        document.querySelector(selector).textContent = message;
      });
      const invalid = errors.find(([, , message]) => message);
      if (invalid) {
        status.textContent = 'Review the highlighted fields.';
        status.dataset.state = 'error';
        invalid[0].focus();
        return false;
      }
      return true;
    }
    form.addEventListener('input', (event) => {
      if (event.target.hasAttribute('aria-invalid')) {
        event.target.removeAttribute('aria-invalid');
        const errorId = event.target.getAttribute('aria-describedby');
        if (errorId?.endsWith('-error')) document.getElementById(errorId).textContent = '';
      }
      if (status.dataset.state !== 'loading') {
        status.textContent = '';
        delete status.dataset.state;
      }
    });
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!validate()) return;
      status.textContent = 'The reservation service is not connected. Nothing was sent. Save your request to keep a copy.';
      status.dataset.state = 'error';
    });
    saveButton.addEventListener('click', async () => {
      if (saveButton.disabled || !validate()) return;
      saveButton.disabled = true;
      saveButton.setAttribute('aria-busy', 'true');
      saveButton.textContent = 'Preparing…';
      status.textContent = 'Preparing your request file…';
      status.dataset.state = 'loading';
      let url;
      try {
        const content = [
          'SUN / MARK V / Installation request',
          '',
          `Name: ${form.elements.name.value.trim()}`,
          `Email: ${form.elements.email.value.trim()}`,
          `Region: ${region}`,
          `Installation: ${form.elements.project.value.trim() || 'Not specified'}`,
          '',
          'Contact preference: agreed',
          'This request has not been submitted. Availability and installation suitability require review.',
        ].join('\n');
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        await blob.text();
        url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'sun-mark-v-request.txt';
        document.body.append(link);
        link.click();
        link.remove();
        status.textContent = 'Your request file is ready. No reservation or payment has been made.';
        status.dataset.state = 'saved';
      } catch {
        status.textContent = 'The file could not be prepared. Your information is still here. Try saving again.';
        status.dataset.state = 'error';
      } finally {
        if (url) setTimeout(() => URL.revokeObjectURL(url), 1000);
        saveButton.disabled = false;
        saveButton.removeAttribute('aria-busy');
        saveButton.textContent = 'Save request';
      }
    });
  }
  start();
})();
