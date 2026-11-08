'use strict';

function start() {
  const canvas = document.getElementById('canvas');
  if (canvas.dataset.initialized) return;
  canvas.dataset.initialized = 'true';

  const workspace = canvas.querySelector('.workspace');
  const modelView = document.getElementById('model-view');
  const modelObject = document.getElementById('model-object');
  const villaImage = document.getElementById('villa-image');
  const interiorView = document.getElementById('interior-view');
  const drawingView = document.getElementById('drawing-view');
  const zoomRange = document.getElementById('zoom-range');
  const dialogLayer = document.getElementById('dialog-layer');
  const dialog = document.getElementById('dialog');
  const dialogBody = document.getElementById('dialog-body');
  const toast = document.getElementById('toast');
  const formatMenu = document.getElementById('format-menu');
  const projectMenu = document.getElementById('project-menu');
  const state = {
    name: 'Riro Home complex', location: 'Portland, Oregon', area: 286,
    view: 'model', zoom: 80, x: 0, y: 0, light: 'night', format: 'PDF',
    wall: 'Architectural concrete', roof: 'Terracotta tile', insulation: 'Mineral wool',
    finish: 'Mineral plaster', landscape: 'Woodland', climate: true, entranceLight: true,
    comments: []
  };
  let toastTimer;
  let returnFocus;
  let drag;
  let downloading = false;
  let nextCommentId = 1;

  function notify(message, error = false) {
    clearTimeout(toastTimer);
    toast.classList.toggle('is-error', error);
    toast.querySelector('.ti').className = error ? 'ti ti-alert-circle' : 'ti ti-check';
    toast.querySelector('span').textContent = message;
    toast.hidden = false;
    toastTimer = setTimeout(() => { toast.hidden = true; }, 3200);
  }

  function closeMenus() {
    formatMenu.hidden = true;
    projectMenu.hidden = true;
    document.getElementById('format-toggle').setAttribute('aria-expanded', 'false');
    document.getElementById('more-toggle').setAttribute('aria-expanded', 'false');
  }

  function openDialog(title, content) {
    closeMenus();
    returnFocus = document.activeElement;
    document.getElementById('dialog-title').textContent = title;
    dialogBody.innerHTML = content;
    dialogLayer.hidden = false;
    workspace.inert = true;
    dialog.focus();
  }

  function closeDialog() {
    dialogLayer.hidden = true;
    workspace.inert = false;
    if (returnFocus?.isConnected) returnFocus.focus();
  }

  function updateZoom(value) {
    state.zoom = Math.max(40, Math.min(120, Math.round(Number(value) / 5) * 5));
    zoomRange.value = String(state.zoom);
    document.getElementById('zoom-value').textContent = state.zoom + '%';
    zoomRange.style.setProperty('--range-fill', ((state.zoom - 40) / 80 * 100) + '%');
    modelObject.style.setProperty('--object-size', state.zoom / 80);
    canvas.querySelector('[data-zoom="-5"]').disabled = state.zoom === 40;
    canvas.querySelector('[data-zoom="5"]').disabled = state.zoom === 120;
  }

  function updatePosition() {
    state.x = Math.max(-14, Math.min(14, state.x));
    state.y = Math.max(-10, Math.min(10, state.y));
    modelObject.style.setProperty('--pan-x', state.x + 'cqw');
    modelObject.style.setProperty('--pan-y', state.y + 'cqw');
  }

  function changeView(view) {
    state.view = view;
    canvas.querySelectorAll('[data-view]').forEach(button => {
      const active = button.dataset.view === view;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    modelObject.hidden = view !== 'model';
    interiorView.hidden = view !== 'interior';
    drawingView.hidden = view !== 'drawings';
    modelView.style.cursor = view === 'model' ? 'grab' : 'default';
    zoomRange.disabled = view !== 'model';
    canvas.querySelectorAll('[data-zoom], [data-pan]').forEach(button => { button.disabled = view !== 'model'; });
    if (view === 'model') updateZoom(state.zoom);
    document.getElementById('asset-error').hidden = true;
  }

  function resetView() {
    state.x = state.y = 0;
    updatePosition();
    updateZoom(80);
    changeView('model');
    notify('View centered');
  }

  function setLighting(light) {
    state.light = light;
    workspace.classList.toggle('is-day', light === 'day');
    canvas.querySelectorAll('[data-light]').forEach(button => {
      const selected = button.dataset.light === light;
      button.classList.toggle('is-active', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
  }

  function toggleSection(section) {
    const shouldOpen = !section.classList.contains('is-open');
    canvas.querySelectorAll('.material-section').forEach(item => {
      const open = item === section && shouldOpen;
      item.classList.toggle('is-open', open);
      item.querySelector('.section-toggle').setAttribute('aria-expanded', String(open));
      item.querySelector('.section-content').inert = !open;
    });
  }

  function projectData() {
    return {
      name: state.name, version: 1,
      architecture: { floors: 3, area_m2: state.area, location: state.location },
      materials: { wall: state.wall, roof: state.roof, insulation: state.insulation, finish: state.finish },
      landscape: state.landscape,
      technology: { climateControl: state.climate, entranceLighting: state.entranceLight },
      view: { type: state.view, lighting: state.light, zoom: state.zoom, pan: { x: state.x, y: state.y } },
      comments: state.comments.map(({ id, text, createdAt }) => ({ id, text, createdAt })),
      exportedAt: new Date().toISOString()
    };
  }

  function createPDF() {
    const escape = value => String(value).replace(/[^\x20-\x7E]/g, '?').replace(/[\\()]/g, '\\$&');
    const lines = [
      'BUILDWY / RIRO HOME', 'Architecture & material specification', '',
      'PROJECT', state.name, state.location, '3 floors / ' + state.area + ' square metres', '',
      'MATERIALS', 'Roof: ' + state.roof, 'Wall panels: ' + state.wall,
      'Insulation: ' + state.insulation, 'Finishing: ' + state.finish, '',
      'LANDSCAPE', state.landscape, '', 'TECHNOLOGY',
      'Climate control: ' + (state.climate ? 'Enabled' : 'Disabled'),
      'Entrance lighting: ' + (state.entranceLight ? 'Enabled' : 'Disabled'), '',
      'Prepared ' + new Date().toISOString().slice(0, 10)
    ];
    const commands = ['BT', '50 790 Td', '23 TL'];
    lines.forEach((line, index) => {
      if (index) commands.push('T*');
      if (/[^\x20-\x7E]/.test(line)) {
        const unicode = Array.from({ length: line.length }, (_, position) => line.charCodeAt(position).toString(16).padStart(4, '0')).join('');
        commands.push('/F2 14 Tf', '<' + unicode + '> Tj');
      } else commands.push('/F1 14 Tf', '(' + escape(line) + ') Tj');
    });
    commands.push('ET');
    const stream = commands.join('\n');
    const objects = [
      '<< /Type /Catalog /Pages 2 0 R >>',
      '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
      '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 6 0 R >> >> /Contents 5 0 R >>',
      '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
      '<< /Length ' + stream.length + ' >>\nstream\n' + stream + '\nendstream',
      '<< /Type /Font /Subtype /Type0 /BaseFont /STSong-Light /Encoding /UniGB-UCS2-H /DescendantFonts [7 0 R] >>',
      '<< /Type /Font /Subtype /CIDFontType0 /BaseFont /STSong-Light /CIDSystemInfo << /Registry (Adobe) /Ordering (GB1) /Supplement 4 >> /DW 1000 >>'
    ];
    let pdf = '%PDF-1.4\n';
    const offsets = [0];
    objects.forEach((object, index) => {
      offsets.push(pdf.length);
      pdf += (index + 1) + ' 0 obj\n' + object + '\nendobj\n';
    });
    const xref = pdf.length;
    pdf += 'xref\n0 ' + (objects.length + 1) + '\n0000000000 65535 f \n';
    offsets.slice(1).forEach(offset => { pdf += String(offset).padStart(10, '0') + ' 00000 n \n'; });
    pdf += 'trailer\n<< /Size ' + (objects.length + 1) + ' /Root 1 0 R >>\nstartxref\n' + xref + '\n%%EOF';
    return new Blob([pdf], { type: 'application/pdf' });
  }

  async function download(format = state.format) {
    if (downloading) return;
    downloading = true;
    const button = document.getElementById('download-button');
    button.disabled = true;
    button.textContent = 'Preparing…';
    button.setAttribute('aria-busy', 'true');
    try {
      await new Promise(resolve => requestAnimationFrame(resolve));
      let blob;
      if (format === 'PDF') blob = createPDF();
      else if (format === 'JSON') blob = new Blob([JSON.stringify(projectData(), null, 2)], { type: 'application/json' });
      else {
        const svg = document.getElementById('floor-plan').cloneNode(true);
        svg.removeAttribute('id');
        svg.setAttribute('width', '720');
        svg.setAttribute('height', '600');
        const background = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        background.setAttribute('width', '720');
        background.setAttribute('height', '600');
        background.setAttribute('fill', '#252626');
        svg.prepend(background);
        blob = new Blob(['<?xml version="1.0" encoding="UTF-8"?>\n' + new XMLSerializer().serializeToString(svg)], { type: 'image/svg+xml' });
      }
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'riro-home-' + (format === 'SVG' ? 'ground-floor' : 'materials') + '.' + format.toLowerCase();
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      notify(format + ' file prepared');
    } catch {
      notify('Unable to export. Please try again.', true);
    } finally {
      downloading = false;
      button.disabled = false;
      button.textContent = 'Download file';
      button.removeAttribute('aria-busy');
    }
  }

  function showProject() {
    openDialog('Project details', '<div class="project-summary"><img src="assets/riro-interior.webp" alt="Riro Home living room"><div><h2>A home, thoughtfully built.</h2><p>3 floors · Architecture by Marco Rossi</p></div></div><form id="project-form" novalidate><div class="project-fields"><label>Project name<input id="project-name" maxlength="80" required></label><label>Location<input id="project-location" maxlength="100" required></label><label>Floor area, m²<input id="project-area" type="number" min="1" max="100000" step="0.1" required></label></div><p class="form-error" id="project-error" role="alert" hidden></p><div><button class="primary-action" type="submit">Save changes</button> <button class="secondary-action" type="button" data-dialog-action="export-json">Export project</button></div></form>');
    document.getElementById('project-name').value = state.name;
    document.getElementById('project-location').value = state.location;
    document.getElementById('project-area').value = state.area;
    document.getElementById('project-form').addEventListener('submit', event => {
      event.preventDefault();
      const name = document.getElementById('project-name');
      const locationInput = document.getElementById('project-location');
      const area = document.getElementById('project-area');
      const invalid = [name, locationInput, area].find(input => !input.value.trim() || !input.validity.valid);
      if (invalid) {
        document.getElementById('project-error').textContent = 'Enter a project name, location and valid floor area.';
        document.getElementById('project-error').hidden = false;
        invalid.focus();
        return;
      }
      state.name = name.value.trim();
      state.location = locationInput.value.trim();
      state.area = Number(area.value);
      updateProjectTitle();
      closeDialog();
      notify('Project details updated');
    });
  }

  function updateProjectTitle() {
    canvas.querySelector('.project-button > span').textContent = state.name === 'Riro Home complex' ? '«Riro Home» complex' : state.name;
    document.title = 'Buildwy — ' + state.name;
  }

  function showImport() {
    openDialog('Import a project', '<p>Restore a Buildwy project and its material selections from a JSON file.</p><form id="import-form"><label>Project file<input id="import-file" type="file" accept=".json,application/json" required></label><p class="form-error" id="import-error" role="alert" hidden></p><button class="primary-action" type="submit" id="import-submit">Import project</button></form>');
    document.getElementById('import-form').addEventListener('submit', async event => {
      event.preventDefault();
      const file = document.getElementById('import-file').files[0];
      const button = document.getElementById('import-submit');
      const error = document.getElementById('import-error');
      button.disabled = true;
      button.textContent = 'Reading…';
      error.hidden = true;
      try {
        if (!file || file.size > 512000) throw new Error('Choose a project JSON file smaller than 500 KB.');
        const data = JSON.parse(await file.text());
        if (data.version !== 1 || typeof data.name !== 'string' || !data.name.trim() || data.name.length > 80 || typeof data.architecture?.location !== 'string' || data.architecture.location.length > 100 || !data.architecture.location.trim() || !Number.isFinite(data.architecture?.area_m2) || data.architecture.area_m2 < 1 || data.architecture.area_m2 > 100000) throw new Error('This file is not a valid Buildwy project.');
        for (const group of ['wall', 'roof', 'insulation']) {
          const choices = [...canvas.querySelectorAll('[data-material-group="' + group + '"] [data-material]')].map(item => item.dataset.material);
          if (!choices.includes(data.materials?.[group])) throw new Error('The project contains unsupported materials.');
        }
        if (!['Mineral plaster', 'Limewash'].includes(data.materials?.finish) || !['Woodland', 'Mediterranean', 'Minimal'].includes(data.landscape) || !['model', 'interior', 'drawings'].includes(data.view?.type) || !['day', 'night'].includes(data.view?.lighting) || !Number.isFinite(data.view?.zoom) || !Number.isFinite(data.view?.pan?.x) || !Number.isFinite(data.view?.pan?.y) || typeof data.technology?.climateControl !== 'boolean' || typeof data.technology?.entranceLighting !== 'boolean') throw new Error('The project settings are incomplete.');
        if (!Array.isArray(data.comments) || data.comments.length > 100 || data.comments.some(item => typeof item?.text !== 'string' || !item.text.trim() || item.text.length > 800 || !Number.isFinite(Date.parse(item.createdAt)))) throw new Error('The project comments are invalid.');
        Object.assign(state, {
          name: data.name.trim(), location: data.architecture.location.trim(), area: data.architecture.area_m2,
          wall: data.materials.wall, roof: data.materials.roof, insulation: data.materials.insulation, finish: data.materials.finish,
          landscape: data.landscape, climate: data.technology.climateControl, entranceLight: data.technology.entranceLighting,
          x: data.view.pan.x, y: data.view.pan.y,
          comments: data.comments.map(item => ({ id: nextCommentId++, text: item.text, createdAt: item.createdAt }))
        });
        canvas.querySelectorAll('[data-material-group]').forEach(group => {
          group.querySelectorAll('[data-material]').forEach(item => {
            const selected = item.dataset.material === state[group.dataset.materialGroup];
            item.classList.toggle('is-selected', selected);
            item.setAttribute('aria-pressed', String(selected));
          });
        });
        canvas.querySelectorAll('[data-landscape]').forEach(item => {
          const selected = item.dataset.landscape === state.landscape;
          item.classList.toggle('is-selected', selected);
          item.setAttribute('aria-pressed', String(selected));
        });
        updateMaterialDescriptions();
        updateProjectTitle();
        updatePosition();
        updateZoom(data.view.zoom);
        setLighting(data.view.lighting);
        changeView(data.view.type);
        document.getElementById('climate-toggle').checked = state.climate;
        document.getElementById('entrance-toggle').checked = state.entranceLight;
        workspace.classList.toggle('lights-off', !state.entranceLight);
        const counter = document.getElementById('comment-count');
        counter.textContent = state.comments.length;
        counter.hidden = !state.comments.length;
        closeDialog();
        notify('Project imported');
      } catch (failure) {
        error.textContent = failure instanceof SyntaxError ? 'The JSON file could not be read. Check its format.' : failure.message;
        error.hidden = false;
      } finally {
        button.disabled = false;
        button.textContent = 'Import project';
      }
    });
  }

  function updateMaterialDescriptions() {
    document.getElementById('roof-description').textContent = state.roof + ' · Exterior grade';
    const insulation = { 'Mineral wool': '120 mm · A1 fire rating', 'Rigid foam': '100 mm · High thermal resistance', 'Natural cork': '140 mm · Renewable material' };
    document.getElementById('insulation-description').textContent = state.insulation + ' · ' + insulation[state.insulation];
    const landscape = { Woodland: 'Birch, boxwood and ornamental grasses', Mediterranean: 'Olive, lavender and rosemary', Minimal: 'Gravel, architectural grasses and a single tree' };
    document.getElementById('landscape-description').textContent = landscape[state.landscape];
    document.getElementById('finish-description').textContent = state.finish === 'Mineral plaster' ? 'Prevents mold growth' : 'Natural breathable finish';
    const finish = canvas.querySelector('.finish-swatch');
    finish.classList.toggle('ochre-art', state.finish === 'Mineral plaster');
    finish.classList.toggle('plaster-art', state.finish === 'Limewash');
    finish.setAttribute('aria-label', state.finish + '. Choose next finish.');
  }

  function showComments() {
    openDialog('Project comments', '<div class="comment-list scroll-area" id="comment-list"></div><form id="comment-form" novalidate><label for="comment-input">Add a comment<textarea id="comment-input" maxlength="800" placeholder="What would you like to refine?" required></textarea></label><p class="form-error" id="comment-error" role="alert" hidden></p><button type="submit" class="primary-action" id="comment-submit" disabled>Add comment</button></form>');
    renderComments();
    const input = document.getElementById('comment-input');
    input.addEventListener('input', () => {
      document.getElementById('comment-submit').disabled = !input.value.trim();
      document.getElementById('comment-error').hidden = true;
    });
    document.getElementById('comment-form').addEventListener('submit', event => {
      event.preventDefault();
      const text = input.value.trim();
      if (!text) {
        document.getElementById('comment-error').textContent = 'Enter a comment before posting.';
        document.getElementById('comment-error').hidden = false;
        return;
      }
      state.comments.push({ id: nextCommentId++, text, createdAt: new Date().toISOString() });
      input.value = '';
      document.getElementById('comment-submit').disabled = true;
      renderComments();
      const counter = document.getElementById('comment-count');
      counter.textContent = state.comments.length;
      counter.hidden = false;
      notify('Comment added');
    });
  }

  function renderComments() {
    const list = document.getElementById('comment-list');
    list.replaceChildren();
    if (!state.comments.length) {
      const empty = document.createElement('p');
      empty.className = 'empty-state';
      empty.textContent = 'No comments yet. Start the conversation.';
      list.append(empty);
    }
    state.comments.forEach(comment => {
      const item = document.createElement('article');
      item.className = 'comment-item';
      const author = document.createElement('strong');
      author.textContent = 'You';
      const time = document.createElement('time');
      time.dateTime = comment.createdAt;
      time.textContent = new Date(comment.createdAt).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' });
      const text = document.createElement('p');
      text.textContent = comment.text;
      const remove = document.createElement('button');
      remove.textContent = 'Remove';
      remove.addEventListener('click', () => {
        state.comments = state.comments.filter(entry => entry.id !== comment.id);
        renderComments();
        const counter = document.getElementById('comment-count');
        counter.textContent = state.comments.length;
        counter.hidden = !state.comments.length;
      });
      item.append(author, time, text, remove);
      list.append(item);
    });
  }

  function showCollaborators() {
    openDialog('People on this project', '<div class="member-row"><img src="https://i.pravatar.cc/120?u=marco-buildwy" alt="Marco Rossi"><div><strong>Marco Rossi</strong><span>Architect</span></div><span>Owner</span></div><div class="member-row"><img src="https://i.pravatar.cc/120?u=anna-buildwy" alt="Anna Miller"><div><strong>Anna Miller</strong><span>Interior designer</span></div><span>Editor</span></div><form id="invite-form" novalidate><label for="invite-email">Invite by email<input id="invite-email" type="email" placeholder="name@studio.com" autocomplete="email" required></label><p class="form-error" id="invite-error" role="alert" hidden></p><button class="primary-action" type="submit">Invite collaborator</button></form>');
    document.getElementById('invite-form').addEventListener('submit', event => {
      event.preventDefault();
      const input = document.getElementById('invite-email');
      const error = document.getElementById('invite-error');
      error.textContent = input.validity.valid && input.value.trim() ? 'Connect a workspace to send invitations.' : 'Enter a valid email address.';
      error.hidden = false;
      if (!input.validity.valid || !input.value.trim()) input.focus();
    });
  }

  function showShare() {
    openDialog('Share ' + state.name, '<p>Send a link to this workspace, or share the complete material specification.</p><div class="share-row"><input id="share-link" aria-label="Workspace link" readonly><button class="primary-action" data-dialog-action="copy">Copy link</button></div><p class="form-error" id="share-error" role="alert" hidden></p><p>For access from another device, publish the workspace to a shared host.</p><button class="secondary-action" data-dialog-action="export-pdf">Download specification</button>');
    document.getElementById('share-link').value = location.href.split('#')[0];
  }

  function showPublish() {
    openDialog('Present your project', '<div class="project-summary"><img src="assets/riro-interior.webp" alt="Riro Home interior"><div><h2>Riro Home complex</h2><p>Your architecture and material selections, ready for the next conversation.</p></div></div><p>Connect a Buildwy workspace to publish online. You can download your material sheet now.</p><button class="primary-action" data-dialog-action="export-pdf">Download material sheet</button>');
    dialogBody.querySelector('.project-summary h2').textContent = state.name;
  }

  function showGeneration() {
    openDialog('Create your next direction', '<form id="generation-form" novalidate><label for="generation-input">Describe your architecture<textarea id="generation-input" maxlength="1500" placeholder="A warm, minimal home with natural materials…" required></textarea></label><div class="choice-row" role="group" aria-label="Architectural style"><button type="button" class="is-selected" aria-pressed="true" data-style="Minimal">Minimal</button><button type="button" aria-pressed="false" data-style="Organic">Organic</button><button type="button" aria-pressed="false" data-style="Modern">Modern</button></div><p class="form-error" id="generation-error" role="alert" hidden></p><div><button type="submit" class="primary-action">Generate architecture</button> <button type="button" class="secondary-action" data-dialog-action="export-brief">Save brief</button></div></form>');
    document.getElementById('generation-form').addEventListener('submit', event => {
      event.preventDefault();
      const input = document.getElementById('generation-input');
      const error = document.getElementById('generation-error');
      error.textContent = input.value.trim() ? 'Connect an image generation service to create architecture.' : 'Describe the home you want to create.';
      error.hidden = false;
      if (!input.value.trim()) input.focus();
    });
  }

  canvas.addEventListener('click', async event => {
    const button = event.target.closest('button');
    if (!button || button.disabled) return;
    if (!button.closest('.menu-anchor, .format-control')) closeMenus();
    if (button.id === 'more-toggle' || button.id === 'format-toggle') {
      const menu = button.id === 'more-toggle' ? projectMenu : formatMenu;
      const open = menu.hidden;
      closeMenus();
      menu.hidden = !open;
      button.setAttribute('aria-expanded', String(open));
      if (open) menu.querySelector('button:not(:disabled)').focus();
      return;
    }
    if (button.dataset.view) changeView(button.dataset.view);
    if (button.dataset.light) setLighting(button.dataset.light);
    if (button.dataset.zoom) updateZoom(state.zoom + Number(button.dataset.zoom));
    if (button.dataset.pan) {
      const direction = button.dataset.pan;
      state.x += direction === 'left' ? -1.5 : direction === 'right' ? 1.5 : 0;
      state.y += direction === 'up' ? -1.5 : direction === 'down' ? 1.5 : 0;
      updatePosition();
    }
    if (button.classList.contains('section-toggle')) toggleSection(button.closest('.material-section'));
    if (button.dataset.materialTab) {
      const decorative = button.dataset.materialTab === 'decorative';
      document.getElementById('decorative-materials').hidden = !decorative;
      document.getElementById('insulation-materials').hidden = decorative;
      canvas.querySelectorAll('[data-material-tab]').forEach(item => {
        const active = item === button;
        item.classList.toggle('is-active', active);
        item.setAttribute('aria-pressed', String(active));
      });
    }
    if (button.dataset.material) {
      const group = button.closest('[data-material-group]');
      state[group.dataset.materialGroup] = button.dataset.material;
      group.querySelectorAll('button').forEach(item => {
        const selected = item === button;
        item.classList.toggle('is-selected', selected);
        item.setAttribute('aria-pressed', String(selected));
      });
      if (group.dataset.materialGroup === 'roof') document.getElementById('roof-description').textContent = state.roof + ' · Exterior grade';
      if (group.dataset.materialGroup === 'insulation') {
        const descriptions = { 'Mineral wool': '120 mm · A1 fire rating', 'Rigid foam': '100 mm · High thermal resistance', 'Natural cork': '140 mm · Renewable material' };
        document.getElementById('insulation-description').textContent = state.insulation + ' · ' + descriptions[state.insulation];
      }
      notify(button.dataset.material + ' selected');
    }
    if (button.dataset.landscape) {
      state.landscape = button.dataset.landscape;
      canvas.querySelectorAll('[data-landscape]').forEach(item => {
        const selected = item === button;
        item.classList.toggle('is-selected', selected);
        item.setAttribute('aria-pressed', String(selected));
      });
      const descriptions = { Woodland: 'Birch, boxwood and ornamental grasses', Mediterranean: 'Olive, lavender and rosemary', Minimal: 'Gravel, architectural grasses and a single tree' };
      document.getElementById('landscape-description').textContent = descriptions[state.landscape];
    }
    if (button.dataset.format) {
      state.format = button.dataset.format;
      document.getElementById('format-label').textContent = state.format;
      formatMenu.querySelectorAll('[data-format]').forEach(item => item.setAttribute('aria-selected', String(item === button)));
      closeMenus();
      document.getElementById('format-toggle').focus();
    }
    if (button.dataset.style) {
      dialogBody.querySelectorAll('[data-style]').forEach(item => {
        const selected = item === button;
        item.classList.toggle('is-selected', selected);
        item.setAttribute('aria-pressed', String(selected));
      });
    }
    const action = button.dataset.action;
    if (action === 'project') showProject();
    else if (action === 'comments') showComments();
    else if (action === 'collaborators') showCollaborators();
    else if (action === 'share') showShare();
    else if (action === 'publish') showPublish();
    else if (action === 'generation') showGeneration();
    else if (action === 'import') showImport();
    else if (action === 'reset') resetView();
    else if (action === 'download') await download();
    else if (action === 'export-json') await download('JSON');
    else if (action === 'toggle-interior') changeView(state.view === 'interior' ? 'model' : 'interior');
    else if (action === 'finish') {
      state.finish = state.finish === 'Mineral plaster' ? 'Limewash' : 'Mineral plaster';
      document.getElementById('finish-description').textContent = state.finish === 'Mineral plaster' ? 'Prevents mold growth' : 'Natural breathable finish';
      const finish = canvas.querySelector('.finish-swatch');
      finish.classList.toggle('ochre-art', state.finish === 'Mineral plaster');
      finish.classList.toggle('plaster-art', state.finish === 'Limewash');
      finish.setAttribute('aria-label', state.finish + '. Choose next finish.');
    } else if (action === 'retry-image') {
      const image = state.view === 'interior' ? interiorView.querySelector('img') : villaImage;
      const src = image.getAttribute('src');
      image.removeAttribute('src');
      image.setAttribute('src', src);
      document.getElementById('asset-error').hidden = true;
    }
    const dialogAction = button.dataset.dialogAction;
    if (dialogAction === 'export-json') await download('JSON');
    else if (dialogAction === 'export-pdf') await download('PDF');
    else if (dialogAction === 'copy') {
      const input = document.getElementById('share-link');
      try {
        await navigator.clipboard.writeText(input.value);
        button.textContent = 'Copied';
        notify('Workspace link copied');
      } catch {
        input.select();
        document.getElementById('share-error').textContent = 'Clipboard unavailable. Copy the selected link.';
        document.getElementById('share-error').hidden = false;
      }
    } else if (dialogAction === 'export-brief') {
      const prompt = document.getElementById('generation-input').value.trim();
      const error = document.getElementById('generation-error');
      if (!prompt) {
        error.textContent = 'Describe your architecture before saving.';
        error.hidden = false;
      } else {
        const style = dialogBody.querySelector('[data-style].is-selected').dataset.style;
        const url = URL.createObjectURL(new Blob([JSON.stringify({ project: state.name, style, prompt }, null, 2)], { type: 'application/json' }));
        const link = document.createElement('a');
        link.href = url;
        link.download = 'riro-home-architecture-brief.json';
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        notify('Architecture brief prepared');
      }
    }
  });

  document.getElementById('dialog-close').addEventListener('click', closeDialog);
  document.getElementById('dialog-scrim').addEventListener('click', closeDialog);
  zoomRange.addEventListener('input', () => updateZoom(zoomRange.value));
  document.getElementById('climate-toggle').addEventListener('change', event => { state.climate = event.target.checked; });
  document.getElementById('entrance-toggle').addEventListener('change', event => {
    state.entranceLight = event.target.checked;
    workspace.classList.toggle('lights-off', !state.entranceLight);
  });

  modelView.addEventListener('pointerdown', event => {
    if (state.view !== 'model' || event.button !== 0) return;
    drag = { startX: event.clientX, startY: event.clientY, x: state.x, y: state.y, unit: canvas.getBoundingClientRect().width / 100 };
    modelView.setPointerCapture(event.pointerId);
    modelView.focus({ preventScroll: true });
  });
  modelView.addEventListener('pointermove', event => {
    if (!drag) return;
    state.x = drag.x + (event.clientX - drag.startX) / drag.unit;
    state.y = drag.y + (event.clientY - drag.startY) / drag.unit;
    updatePosition();
  });
  modelView.addEventListener('pointerup', () => { drag = null; });
  modelView.addEventListener('pointercancel', () => { drag = null; });
  modelView.addEventListener('lostpointercapture', () => { drag = null; });
  modelView.addEventListener('wheel', event => {
    if (state.view !== 'model') return;
    if (event.ctrlKey || matchMedia('(max-width: 760px)').matches) return;
    event.preventDefault();
    updateZoom(state.zoom + (event.deltaY < 0 ? 5 : -5));
  }, { passive: false });
  modelView.addEventListener('keydown', event => {
    if (state.view !== 'model') return;
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', '+', '=', '-'].includes(event.key)) event.preventDefault();
    if (event.key === 'ArrowLeft') state.x -= 1.5;
    else if (event.key === 'ArrowRight') state.x += 1.5;
    else if (event.key === 'ArrowUp') state.y -= 1.5;
    else if (event.key === 'ArrowDown') state.y += 1.5;
    else if (event.key === '+' || event.key === '=') updateZoom(state.zoom + 5);
    else if (event.key === '-') updateZoom(state.zoom - 5);
    updatePosition();
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      if (!dialogLayer.hidden) closeDialog();
      else {
        const target = !formatMenu.hidden ? document.getElementById('format-toggle') : !projectMenu.hidden ? document.getElementById('more-toggle') : null;
        closeMenus();
        target?.focus();
      }
    }
    const menu = event.target.closest('.dropdown');
    if (menu && ['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
      event.preventDefault();
      const options = [...menu.querySelectorAll('button:not(:disabled)')];
      let index = options.indexOf(document.activeElement);
      if (event.key === 'Home') index = 0;
      else if (event.key === 'End') index = options.length - 1;
      else index = (index + (event.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length;
      options[index].focus();
    }
    if (!dialogLayer.hidden && event.key === 'Tab') {
      const focusables = [...dialog.querySelectorAll('button:not(:disabled), input, textarea, [tabindex="0"]')].filter(element => element.getClientRects().length);
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog)) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || document.activeElement === dialog)) { event.preventDefault(); first.focus(); }
    }
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's' && dialogLayer.hidden) {
      event.preventDefault();
      download('JSON');
    }
  });
  document.addEventListener('click', event => {
    if (!event.target.closest('.menu-anchor, .format-control')) closeMenus();
  });
  [villaImage, interiorView.querySelector('img')].forEach(image => {
    image.addEventListener('error', () => {
      const visible = image === villaImage ? state.view === 'model' : state.view === 'interior';
      if (visible) document.getElementById('asset-error').hidden = false;
    });
    image.addEventListener('load', () => { document.getElementById('asset-error').hidden = true; });
  });
  updateZoom(state.zoom);
}

start();
