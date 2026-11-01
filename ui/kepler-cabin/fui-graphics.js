(() => {
  'use strict';
  const fui = window.KeplerFUI = window.KeplerFUI || {};

  fui.initGraphics = () => {
    const field = document.querySelector('.fui-registration');
    const crosses = [[22, 60], [1178, 60], [22, 338], [1178, 338], [295, 80], [905, 80], [320, 608], [880, 608], [22, 718], [1178, 718]];
    field.innerHTML = `<defs><pattern id="fui-dot-grid" width="28" height="28" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r=".7"/></pattern><g id="fui-cross"><path d="M-5 0H5M0-5V5"/><circle r="1"/></g></defs><rect width="1200" height="780" fill="url(#fui-dot-grid)" stroke="none" opacity=".3"/><g class="fui-cross-field">${crosses.map(([x, y]) => `<use href="#fui-cross" x="${x}" y="${y}"/>`).join('')}</g><g class="fui-traces"><path d="M112 138H264L318 82H882L936 138H1088M112 548H266L340 624H860L934 548H1088M600 22V70M600 638V754M28 356H88M1112 356H1172M28 368H68M1132 368H1172"/><path d="M352 126V102H382M818 102H848V126M352 588V612H382M818 612H848V588"/><circle cx="112" cy="138" r="3"/><circle cx="1088" cy="138" r="3"/><circle cx="112" cy="548" r="3"/><circle cx="1088" cy="548" r="3"/></g>`;

    const lattice = document.querySelector('.holo-lattice');
    const faces = ['front', 'back', 'left', 'right', 'top', 'bottom'];
    lattice.innerHTML = `<svg class="lattice-definition"><defs><symbol id="lattice-panel" viewBox="0 0 100 100"><path d="M0 0H100V100H0ZM0 25H100M0 50H100M0 75H100M25 0V100M50 0V100M75 0V100M0 0L100 100M0 100L100 0"/><path d="M0 6V0H6M94 0H100V6M0 94V100H6M94 100H100V94"/></symbol></defs></svg><div class="lattice-rig hud-loop">${faces.map((face) => `<svg class="lattice-face lattice-${face}" viewBox="0 0 100 100"><use href="#lattice-panel"/></svg>`).join('')}</div><span class="projection-base"></span><svg class="projection-beams" viewBox="0 0 200 80"><path d="M100 75L28 8M100 75L172 8M100 75L70 8M100 75L130 8M68 74H132"/></svg>`;

    document.querySelectorAll('[data-fui-matrix]').forEach((matrix) => {
      const phase = Number(matrix.dataset.fuiMatrix);
      for (let column = 0; column < 8; column++) {
        const strip = document.createElement('div');
        strip.className = 'matrix-column hud-loop';
        strip.style.animationDelay = `${-(column * 0.43 + phase * 2.4)}s`;
        for (let row = 0; row < 10; row++) {
          const cell = document.createElement('span');
          cell.className = (row * 17 + column * 11 + phase * 5) % 13 < 5 ? 'matrix-cell is-lit' : 'matrix-cell';
          strip.append(cell);
        }
        matrix.append(strip);
      }
    });
  };
})();
