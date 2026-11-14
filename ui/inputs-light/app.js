(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const money = (value) => '$ ' + value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const countryInfo = { us: ['United States', '+1'], de: ['Germany', '+49'], br: ['Brazil', '+55'], au: ['Australia', '+61'], ca: ['Canada', '+1'] };
  let started = false;
  let selectedCountry = 'br';
  let selectedApp = 'Invision Studio';
  let prefix = 'us';
  let low = 12340.45;
  let high = 40350.90;
  let applied = { low, high, colors: [], brands: [] };
  let loginAttempts = 0;
  let countryAttempts = 0;
  let phoneAttempts = 0;
  let loggedIn = false;
  let selectedFile = null;
  let fileUrl = '';
  let fileVersion = 0;
  let editorSelection = null;
  const timers = new Set();
  const after = (callback, delay) => {
    const timer = setTimeout(() => { timers.delete(timer); callback(); }, delay);
    timers.add(timer);
  };
  function setStatus(card, selector, text, state) {
    card.dataset.state = state;
    $(selector, card).textContent = text;
  }
  function asyncButton(button, callback) {
    if (button.disabled) return;
    const label = button.textContent;
    button.disabled = true;
    button.setAttribute('aria-busy', 'true');
    button.textContent = 'Connecting...';
    after(() => {
      button.disabled = false;
      button.removeAttribute('aria-busy');
      button.textContent = label;
      callback();
    }, 750);
  }
  function filterList(input, rowSelector, emptySelector, button) {
    const root = input.closest('.card');
    const query = input.value.toLowerCase().trim();
    let count = 0;
    $$(rowSelector, root).forEach((row) => {
      row.hidden = !row.textContent.toLowerCase().includes(query);
      if (!row.hidden) count++;
    });
    $(emptySelector, root).hidden = count > 0;
    if (button) button.disabled = count === 0 || !$(rowSelector + '[aria-checked="true"]:not([hidden])', root);
  }
  function selectRadio(row, selector, key) {
    $$(selector).forEach((item) => {
      const active = item === row;
      item.classList.toggle('is-selected', active);
      item.setAttribute('aria-checked', String(active));
      item.tabIndex = active ? 0 : -1;
    });
    return row.dataset[key];
  }
  function radioKeyboard(event, selector) {
    if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const rows = $$(selector).filter((row) => !row.hidden && !row.disabled);
    const index = rows.indexOf(event.target.closest(selector));
    let next = index + (['ArrowDown', 'ArrowRight'].includes(event.key) ? 1 : -1);
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = rows.length - 1;
    const row = rows[(next + rows.length) % rows.length];
    if (row) { row.click(); row.focus(); }
  }
  function updateRange(writeInputs = true) {
    const range = $('#price-range');
    range.style.setProperty('--low', (low - 4000) / 46000 * 100 + '%');
    range.style.setProperty('--high', (high - 4000) / 46000 * 100 + '%');
    $('#min-handle').setAttribute('aria-valuemin', '4000');
    $('#max-handle').setAttribute('aria-valuemax', '50000');
    $('#min-handle').setAttribute('aria-valuenow', String(low));
    $('#min-handle').setAttribute('aria-valuetext', money(low));
    $('#min-handle').setAttribute('aria-valuemax', String(high - 100));
    $('#max-handle').setAttribute('aria-valuenow', String(high));
    $('#max-handle').setAttribute('aria-valuetext', money(high));
    $('#max-handle').setAttribute('aria-valuemin', String(low + 100));
    if (writeInputs) { $('#price-from').value = money(low); $('#price-to').value = money(high); }
  }
  function changeRange(kind, value) {
    if (kind === 'min') low = Math.max(4000, Math.min(high - 100, value));
    else high = Math.min(50000, Math.max(low + 100, value));
    low = Math.round(low * 100) / 100;
    high = Math.round(high * 100) / 100;
    updateRange();
    $('#apply-filter').textContent = 'Apply';
    $('.filter-status').textContent = '';
  }
  function updateFilterCount() {
    const colors = $$('[data-color][aria-pressed="true"]').map((button) => button.dataset.color);
    const brands = $$('[data-brand][aria-pressed="true"]').map((button) => button.dataset.brand);
    const count = 2 + colors.length + brands.length;
    $$('.filter-count, .product-count').forEach((badge) => { badge.textContent = count; badge.setAttribute('aria-label', count + ' active filters'); });
    return { colors, brands };
  }
  function switchFilter(name, focus = false) {
    $('.filter-card').dataset.filter = name;
    $$('.filter-tabs [role="tab"]').forEach((tab) => {
      const active = tab.dataset.filter === name;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      $('#' + tab.getAttribute('aria-controls')).hidden = !active;
      if (active && focus) tab.focus();
    });
  }
  function openMenu(menu, trigger, open) {
    menu.hidden = !open;
    trigger.setAttribute('aria-expanded', String(open));
    if (open) $('[aria-checked="true"]', menu)?.focus();
  }
  function restoreEditorSelection() {
    const editor = $('#message-editor');
    editor.focus();
    if (editorSelection && editor.contains(editorSelection.commonAncestorContainer)) {
      const selection = getSelection();
      selection.removeAllRanges();
      selection.addRange(editorSelection);
    }
  }
  function updateToolbar() {
    if (!$('#message-editor').contains(getSelection()?.anchorNode)) return;
    $$('[data-command]').forEach((button) => button.setAttribute('aria-pressed', String(document.queryCommandState(button.dataset.command))));
  }
  function resetUpload() {
    fileVersion++;
    if (fileUrl) URL.revokeObjectURL(fileUrl);
    fileUrl = '';
    selectedFile = null;
    $('#file-input').value = '';
    $('#upload-idle').hidden = false;
    $('#upload-result').hidden = true;
    $('#upload-preview').replaceChildren();
    $('#upload-button').textContent = 'Upload';
    $('#upload-button').disabled = false;
    $('#upload-button').removeAttribute('aria-busy');
    $('#upload-status').textContent = '';
    $('.upload-card').dataset.state = 'idle';
  }
  function readFile(file) {
    resetUpload();
    if (!file) return;
    const isImage = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'].includes(file.type);
    const isVideo = ['video/mp4', 'video/webm'].includes(file.type);
    const limit = isImage ? 2 : 30;
    if ((!isImage && !isVideo) || file.size >= limit * 1024 * 1024 || file.size === 0) {
      setStatus($('.upload-card'), '#upload-status', (!isImage && !isVideo) ? 'Unsupported file type.' : file.size === 0 ? 'Choose a non-empty file.' : `${isImage ? 'Photo' : 'Video'} exceeds ${limit} MB.`, 'error');
      $('#upload-button').textContent = 'Try another';
      return;
    }
    selectedFile = file;
    const version = fileVersion;
    $('#upload-idle').hidden = true;
    $('#upload-result').hidden = false;
    $('#file-name').textContent = file.name;
    $('#file-name').title = file.name;
    $('#file-detail').textContent = Math.max(1, Math.ceil(file.size / 1024)) + ' KB';
    $('#upload-status').textContent = 'Opening file...';
    $('#upload-button').disabled = true;
    $('#upload-button').setAttribute('aria-busy', 'true');
    $('#upload-button').textContent = 'Opening...';
    fileUrl = URL.createObjectURL(file);
    const media = document.createElement(isImage ? 'img' : 'video');
    if (isImage) media.alt = file.name;
    else { media.controls = true; media.preload = 'metadata'; }
    const done = () => {
      if (version !== fileVersion || !selectedFile) return;
      $('#upload-button').disabled = false;
      $('#upload-button').removeAttribute('aria-busy');
      $('#upload-button').textContent = 'Replace';
      setStatus($('.upload-card'), '#upload-status', 'Ready to preview', 'success');
    };
    const failed = () => {
      if (version !== fileVersion) return;
      $('#upload-button').disabled = false;
      $('#upload-button').removeAttribute('aria-busy');
      $('#upload-button').textContent = 'Try another';
      setStatus($('.upload-card'), '#upload-status', 'Could not open this file.', 'error');
    };
    media.addEventListener(isImage ? 'load' : 'loadedmetadata', done, { once: true });
    media.addEventListener('error', failed, { once: true });
    media.src = fileUrl;
    $('#upload-preview').append(media);
    after(() => { if ($('.upload-card').dataset.state !== 'success') failed(); }, 8000);
  }
  function start() {
    if (started) return;
    started = true;
    // A transient value, set at runtime, is not an account credential.
    $('#login-password').value = 'ace-design-2021';
    $$('.country-row, .app-row').forEach((row) => { row.tabIndex = row.getAttribute('aria-checked') === 'true' ? 0 : -1; });
    $$('.country-row').forEach((row) => row.addEventListener('click', () => {
      selectedCountry = selectRadio(row, '.country-row', 'country');
      $('#country-login').disabled = false;
      $('.country-status').textContent = '';
    }));
    $('.country-list').addEventListener('keydown', (event) => radioKeyboard(event, '.country-row'));
    $('#country-search').addEventListener('input', (event) => {
      filterList(event.target, '.country-row', '.list-empty', $('#country-login'));
      const visibleRows = $$('.country-row:not([hidden])');
      if (visibleRows.length && !visibleRows.some((row) => row.tabIndex === 0)) visibleRows[0].tabIndex = 0;
    });
    $('#country-clear').addEventListener('click', () => {
      selectedCountry = '';
      $('#country-search').value = '';
      $$('.country-row').forEach((row, index) => { row.hidden = false; row.classList.remove('is-selected'); row.setAttribute('aria-checked', 'false'); row.tabIndex = index === 0 ? 0 : -1; });
      $('.countries .list-empty').hidden = true;
      $('#country-login').disabled = true;
      $('.country-status').textContent = '';
    });
    $('#country-login').addEventListener('click', () => {
      if (!selectedCountry || $('#country-login').hasAttribute('aria-busy')) return;
      const card = $('.countries');
      const name = countryInfo[selectedCountry][0];
      countryAttempts++;
      $$('.country-row, #country-clear').forEach((button) => { button.disabled = true; });
      setStatus(card, '.country-status', '', 'loading');
      asyncButton($('#country-login'), () => {
        $$('.country-row, #country-clear').forEach((button) => { button.disabled = false; });
        setStatus(card, '.country-status', countryAttempts % 2 ? name + ' selected' : 'Connection timed out.', countryAttempts % 2 ? 'success' : 'error');
      });
    });

    $$('.filter-tabs [role="tab"]').forEach((tab) => tab.addEventListener('click', () => switchFilter(tab.dataset.filter)));
    $('.filter-tabs').addEventListener('keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const tabs = $$('.filter-tabs [role="tab"]');
      let index = tabs.indexOf(event.target);
      index = event.key === 'Home' ? 0 : event.key === 'End' ? 2 : (index + (event.key === 'ArrowRight' ? 1 : 2)) % 3;
      switchFilter(tabs[index].dataset.filter, true);
    });
    $$('.segment-buttons button').forEach((button) => button.addEventListener('click', () => {
      const mode = button.dataset.mode;
      $('.segment-card').dataset.mode = mode;
      $$('.segment-buttons button').forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
      switchFilter(mode === 'price' ? 'price' : 'brand');
    }));
    $$('.color-choice, [data-brand]').forEach((button) => button.addEventListener('click', () => {
      button.setAttribute('aria-pressed', String(button.getAttribute('aria-pressed') !== 'true'));
      updateFilterCount();
      $('#apply-filter').textContent = 'Apply';
      $('.filter-status').textContent = '';
    }));
    ['min', 'max'].forEach((kind) => {
      const handle = $('#' + kind + '-handle');
      let dragging = false;
      const move = (event) => {
        if (!dragging) return;
        const rect = $('#price-range').getBoundingClientRect();
        const value = 4000 + Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width)) * 46000;
        changeRange(kind, Math.max(4000, Math.min(50000, value)));
      };
      handle.addEventListener('pointerdown', (event) => { event.preventDefault(); dragging = true; handle.setPointerCapture(event.pointerId); handle.focus(); });
      handle.addEventListener('pointermove', move);
      handle.addEventListener('pointerup', () => { dragging = false; });
      handle.addEventListener('pointercancel', () => { dragging = false; });
      handle.addEventListener('lostpointercapture', () => { dragging = false; });
      handle.addEventListener('keydown', (event) => {
        const current = kind === 'min' ? low : high;
        const step = event.shiftKey ? 1000 : 100;
        const values = { ArrowLeft: current - step, ArrowDown: current - step, ArrowRight: current + step, ArrowUp: current + step, Home: kind === 'min' ? 4000 : low + 100, End: kind === 'max' ? 50000 : high - 100, PageDown: current - 1000, PageUp: current + 1000 };
        if (event.key in values) { event.preventDefault(); changeRange(kind, values[event.key]); }
      });
    });
    $$('#price-from, #price-to').forEach((input) => {
      input.addEventListener('input', () => {
        input.removeAttribute('aria-invalid');
        $('#apply-filter').disabled = $$('.price-fields [aria-invalid="true"]').length > 0;
      });
      input.addEventListener('change', () => {
        const value = Number(input.value.replace(/[$,\s]/g, ''));
        const valid = input.value.trim() !== '' && Number.isFinite(value) && value >= 4000 && value <= 50000 && (input.id === 'price-from' ? value <= high - 100 : value >= low + 100);
        input.setAttribute('aria-invalid', String(!valid));
        $('#apply-filter').disabled = !valid;
        if (valid) { changeRange(input.id === 'price-from' ? 'min' : 'max', value); }
        else setStatus($('.filter-card'), '.filter-status', 'Check the price range.', 'error');
      });
    });
    $('#apply-filter').addEventListener('click', () => {
      if ($$('.price-fields [aria-invalid="true"]').length) return;
      applied = { low, high, ...updateFilterCount() };
      $('#apply-filter').textContent = 'Applied';
      setStatus($('.filter-card'), '.filter-status', 'Filters updated', 'success');
    });
    $('#cancel-filter').addEventListener('click', () => {
      low = applied.low; high = applied.high;
      $$('.color-choice').forEach((button) => button.setAttribute('aria-pressed', String(applied.colors.includes(button.dataset.color))));
      $$('[data-brand]').forEach((button) => button.setAttribute('aria-pressed', String(applied.brands.includes(button.dataset.brand))));
      $$('.price-fields input').forEach((input) => input.removeAttribute('aria-invalid'));
      $('#apply-filter').disabled = false;
      $('#apply-filter').textContent = 'Apply';
      $('.filter-status').textContent = '';
      updateFilterCount(); updateRange();
    });
    updateRange();

    $('#password-toggle').addEventListener('click', () => {
      const input = $('#login-password');
      const show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      $('#password-toggle').setAttribute('aria-pressed', String(show));
      $('#password-toggle').setAttribute('aria-label', show ? 'Hide password' : 'Show password');
      $('#password-toggle i').className = show ? 'ti ti-eye' : 'ti ti-eye-off';
    });
    $$('#login-username, #login-password').forEach((input) => input.addEventListener('input', () => {
      input.removeAttribute('aria-invalid');
      $('#login-status').textContent = '';
      if (!loggedIn) $('#login-submit').disabled = false;
    }));
    $('#login-form').addEventListener('submit', (event) => {
      event.preventDefault();
      const button = $('#login-submit');
      if (button.disabled) return;
      if (loggedIn) {
        loggedIn = false;
        $('#login-username').disabled = false;
        $('#login-password').disabled = false;
        button.textContent = 'Login';
        setStatus($('#login-form'), '#login-status', '', 'idle');
        return;
      }
      const username = $('#login-username');
      const password = $('#login-password');
      const validName = /^[\p{L}\p{N}_. -]{2,40}$/u.test(username.value.trim());
      const validPassword = password.value.length >= 6;
      username.setAttribute('aria-invalid', String(!validName));
      password.setAttribute('aria-invalid', String(!validPassword));
      if (!validName || !validPassword) {
        setStatus($('#login-form'), '#login-status', !validName ? 'Enter a valid username.' : 'Use at least 6 characters.', 'error');
        (!validName ? username : password).focus();
        return;
      }
      loginAttempts++;
      username.disabled = true;
      password.disabled = true;
      $('#password-toggle').disabled = true;
      setStatus($('#login-form'), '#login-status', '', 'loading');
      asyncButton(button, () => {
        const success = loginAttempts % 2 === 1;
        $('#password-toggle').disabled = false;
        username.disabled = success;
        password.disabled = success;
        if (success) {
          loggedIn = true;
          username.disabled = true;
          password.disabled = true;
          button.textContent = 'Logout';
          setStatus($('#login-form'), '#login-status', 'Signed in', 'success');
        } else setStatus($('#login-form'), '#login-status', 'Timed out. Try again.', 'error');
      });
    });
    $('#event-switch').addEventListener('click', () => {
      const active = $('#event-switch').getAttribute('aria-checked') !== 'true';
      $('#event-switch').setAttribute('aria-checked', String(active));
      $('#event-switch > span:first-child').textContent = active ? 'On' : 'Off';
    });
    $('#event-name').addEventListener('change', () => {
      const valid = $('#event-name').value.trim().length > 0;
      $('#event-name').setAttribute('aria-invalid', String(!valid));
      setStatus($('.event-card'), '#event-status', valid ? '' : 'Enter an event name.', valid ? 'idle' : 'error');
    });
    $('#event-date').addEventListener('change', () => {
      const input = $('#event-date');
      // Accept a readable month name or ISO date, never open a system calendar.
      const text = input.value.trim();
      const pattern = /^(?:\d{4}-\d{2}-\d{2}|[A-Za-z]+ \d{1,2}, \d{4})$/;
      const parsed = new Date(text);
      const valid = pattern.test(text) && !Number.isNaN(parsed.getTime());
      input.setAttribute('aria-invalid', String(!valid));
      setStatus($('.event-card'), '#event-status', valid ? '' : 'Use Month DD, YYYY or YYYY-MM-DD.', valid ? 'idle' : 'error');
      if (valid) input.value = parsed.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: text.includes('-') ? 'UTC' : undefined });
    });
    $('#like-button').addEventListener('click', () => {
      const active = $('#like-button').getAttribute('aria-pressed') !== 'true';
      $('#like-button').setAttribute('aria-pressed', String(active));
      $('.like-count').textContent = active ? 10 : 9;
      $('.like-count').setAttribute('aria-label', (active ? 10 : 9) + ' likes');
    });

    document.addEventListener('selectionchange', () => {
      const selection = getSelection();
      if (selection?.rangeCount && $('#message-editor').contains(selection.anchorNode)) {
        editorSelection = selection.getRangeAt(0).cloneRange(); updateToolbar();
      }
    });
    $('.editor-toolbar').addEventListener('pointerdown', (event) => event.preventDefault());
    $$('[data-command]').forEach((button) => button.addEventListener('click', () => {
      restoreEditorSelection();
      document.execCommand(button.dataset.command, false);
      updateToolbar();
    }));
    $('#message-editor').addEventListener('paste', (event) => {
      event.preventDefault();
      document.execCommand('insertText', false, event.clipboardData.getData('text/plain'));
    });
    $('#message-editor').addEventListener('input', () => {
      if (!$('#message-editor').textContent.trim() && !$('#message-editor').querySelector('img')) $('#message-editor').replaceChildren();
    });
    $('#text-style').addEventListener('click', () => openMenu($('#text-menu'), $('#text-style'), $('#text-menu').hidden));
    $$('[data-text-style]').forEach((button) => button.addEventListener('click', () => {
      restoreEditorSelection();
      document.execCommand('formatBlock', false, button.dataset.textStyle === 'heading' ? 'h3' : 'p');
      $$('[data-text-style]').forEach((item) => item.setAttribute('aria-checked', String(item === button)));
      openMenu($('#text-menu'), $('#text-style'), false);
      $('#text-style').focus();
    }));
    $('#line-height').addEventListener('click', () => {
      const active = $('#message-editor').classList.toggle('is-spaced');
      $('#line-height').setAttribute('aria-pressed', String(active));
      $('#line-height').setAttribute('aria-label', active ? 'Reset line spacing' : 'Increase line spacing');
    });

    $$('.app-row').forEach((row) => row.addEventListener('click', () => {
      selectedApp = selectRadio(row, '.app-row', 'app');
      $('#app-continue').disabled = false;
      $('#app-continue').setAttribute('aria-label', 'Use ' + selectedApp);
      $('.app-status').textContent = '';
    }));
    $('.app-list').addEventListener('keydown', (event) => radioKeyboard(event, '.app-row'));
    $('#app-search').addEventListener('input', (event) => {
      filterList(event.target, '.app-row', '.list-empty', $('#app-continue'));
      const visibleRows = $$('.app-row:not([hidden])');
      if (visibleRows.length && !visibleRows.some((row) => row.tabIndex === 0)) visibleRows[0].tabIndex = 0;
    });
    $('#app-continue').addEventListener('click', () => {
      setStatus($('.apps-card'), '.app-status', selectedApp + ' selected', 'success');
    });
    $('#upload-button').addEventListener('click', () => $('#file-input').click());
    $('#file-input').addEventListener('change', (event) => readFile(event.target.files[0]));
    $('#remove-file').addEventListener('click', resetUpload);
    let dragDepth = 0;
    const zone = $('#drop-zone');
    zone.addEventListener('dragenter', (event) => { event.preventDefault(); dragDepth++; zone.classList.add('is-dragging'); });
    zone.addEventListener('dragover', (event) => { event.preventDefault(); event.dataTransfer.dropEffect = 'copy'; });
    zone.addEventListener('dragleave', () => { dragDepth--; if (dragDepth <= 0) { dragDepth = 0; zone.classList.remove('is-dragging'); } });
    zone.addEventListener('drop', (event) => { event.preventDefault(); dragDepth = 0; zone.classList.remove('is-dragging'); readFile(event.dataTransfer.files[0]); });
    $('.canvas').addEventListener('dragover', (event) => event.preventDefault());
    $('.canvas').addEventListener('drop', (event) => event.preventDefault());

    $('#phone-prefix').addEventListener('click', () => openMenu($('#phone-menu'), $('#phone-prefix'), $('#phone-menu').hidden));
    $$('[data-prefix]').forEach((button) => button.addEventListener('click', () => {
      prefix = button.dataset.prefix;
      const [name, code] = countryInfo[prefix];
      $('#phone-prefix use').setAttribute('href', '#flag-' + prefix);
      $('#phone-prefix > span').textContent = code;
      $('#phone-prefix').setAttribute('aria-label', 'Country code: ' + name + ' ' + code);
      $$('[data-prefix]').forEach((item) => item.setAttribute('aria-checked', String(item === button)));
      openMenu($('#phone-menu'), $('#phone-prefix'), false);
      $('#phone-prefix').focus();
    }));
    $('#phone-number').addEventListener('input', () => { $('#phone-number').removeAttribute('aria-invalid'); $('.phone-status').textContent = ''; });
    $('#phone-submit').addEventListener('click', () => {
      const input = $('#phone-number');
      const valid = /^[\d ()-]+$/.test(input.value) && input.value.replace(/\D/g, '').length >= 7 && input.value.replace(/\D/g, '').length <= 15;
      input.setAttribute('aria-invalid', String(!valid));
      if (!valid) { setStatus($('.phone-card'), '.phone-status', 'Check the number', 'error'); input.focus(); return; }
      const button = $('#phone-submit');
      if (button.disabled) return;
      phoneAttempts++;
      button.disabled = true;
      button.setAttribute('aria-busy', 'true');
      setStatus($('.phone-card'), '.phone-status', 'Checking...', 'loading');
      after(() => {
        button.disabled = false;
        button.removeAttribute('aria-busy');
        setStatus($('.phone-card'), '.phone-status', phoneAttempts % 2 ? 'Number confirmed' : 'Try again', phoneAttempts % 2 ? 'success' : 'error');
      }, 650);
    });
    document.addEventListener('click', (event) => {
      [['#phone-menu', '#phone-prefix'], ['#text-menu', '#text-style']].forEach(([menuSelector, triggerSelector]) => {
        const menu = $(menuSelector), trigger = $(triggerSelector);
        if (!menu.hidden && !menu.contains(event.target) && !trigger.contains(event.target)) openMenu(menu, trigger, false);
      });
    });
    document.addEventListener('keydown', (event) => {
      $$('.dropdown:not([hidden])').forEach((menu) => {
        const trigger = menu.id === 'phone-menu' ? $('#phone-prefix') : $('#text-style');
        if (event.key === 'Escape') { event.preventDefault(); openMenu(menu, trigger, false); trigger.focus(); }
        if (event.key === 'Tab') openMenu(menu, trigger, false);
        if (['ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key) && menu.contains(event.target)) {
          event.preventDefault();
          const buttons = $$('button:not(:disabled)', menu);
          const index = buttons.indexOf(document.activeElement);
          let next = (index + (event.key === 'ArrowDown' ? 1 : buttons.length - 1)) % buttons.length;
          if (event.key === 'Home') next = 0;
          if (event.key === 'End') next = buttons.length - 1;
          buttons[next]?.focus();
        }
      });
    });
    if (!reducedMotion.matches) {
      $('.filter-card').animate([{ opacity: .75, transform: 'translateY(.3cqw)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 320, easing: 'cubic-bezier(.2,.75,.25,1)' });
    }
    window.addEventListener('pagehide', () => { timers.forEach(clearTimeout); timers.clear(); if (fileUrl) URL.revokeObjectURL(fileUrl); });
  }
  start();
})();
