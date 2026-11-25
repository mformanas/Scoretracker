// Puffy 3D toy chess pieces: rounded, squishy-looking shapes with soft clay shading and a glossy highlight.
// One side is mint, the other lilac. ChessArt.svg(type, colour) returns markup.
(function (root) {
  const TONES = {
    w: { light: '#d6fbed', base: '#8fe3c7', dark: '#4fb592', edge: '#3f9c7c' },   // mint
    b: { light: '#ece3ff', base: '#b99ff2', dark: '#7f63cc', edge: '#6a50b4' },   // lilac
  };
  const SHAPES = {
    p: '<path d="M28 82 C26 64 36 52 50 52 C64 52 74 64 72 82 Z"/><circle cx="50" cy="38" r="18"/>',
    r: '<path d="M30 44 H70 C72 60 72 72 72 82 H28 C28 72 28 60 30 44 Z"/><path d="M24 30 C24 22 30 20 34 20 C38 20 39 25 43 25 C46 25 46 18 50 18 C54 18 54 25 57 25 C61 25 62 20 66 20 C70 20 76 22 76 30 L74 42 C74 46 71 48 68 48 L32 48 C29 48 26 46 26 42 Z"/>',
    n: '<path d="M30 82 C28 66 34 58 42 53 C34 55 26 52 25 46 C24 38 31 30 40 27 C43 19 50 14 56 14 C58 10 62 9 64 13 C76 20 80 44 72 82 Z"/>',
    b: '<path d="M34 82 C30 70 34 62 40 58 H60 C66 62 70 70 66 82 Z"/><path d="M50 20 C68 28 74 46 64 60 H36 C26 46 32 28 50 20 Z"/><circle cx="50" cy="15" r="7"/>',
    q: '<path d="M30 82 C26 66 32 54 38 50 H62 C68 54 74 66 70 82 Z"/><path d="M24 30 L34 52 H66 L76 30 L62 40 L58 24 L50 38 L42 24 L38 40 Z"/><circle cx="24" cy="28" r="6"/><circle cx="42" cy="21" r="6"/><circle cx="58" cy="21" r="6"/><circle cx="76" cy="28" r="6"/>',
    k: '<path d="M30 82 C26 66 32 56 38 52 H62 C68 56 74 66 70 82 Z"/><path d="M26 42 C26 30 74 30 74 42 C74 50 68 54 62 54 H38 C32 54 26 50 26 42 Z"/><path d="M45 6 C45 4 55 4 55 6 V13 H61 C63 13 63 21 61 21 H55 V31 H45 V21 H39 C37 21 37 13 39 13 H45 Z"/>',
  };
  // glossy highlights so the pieces look round and soft
  const HIGHLIGHT = {
    p: '<ellipse cx="43" cy="31" rx="6" ry="4" transform="rotate(-30 43 31)"/><ellipse cx="38" cy="68" rx="3" ry="6"/>',
    r: '<ellipse cx="36" cy="33" rx="5" ry="3"/><ellipse cx="37" cy="64" rx="3" ry="10"/>',
    n: '<ellipse cx="44" cy="28" rx="5" ry="3" transform="rotate(-35 44 28)"/><ellipse cx="38" cy="66" rx="2.5" ry="7"/>',
    b: '<circle cx="47.5" cy="12.5" r="2.2"/><ellipse cx="41" cy="38" rx="4" ry="7" transform="rotate(20 41 38)"/><ellipse cx="40" cy="70" rx="2.5" ry="5"/>',
    q: '<ellipse cx="37" cy="66" rx="3" ry="8"/><circle cx="40" cy="19" r="2"/><circle cx="56" cy="19" r="2"/><circle cx="22" cy="26" r="2"/>',
    k: '<ellipse cx="38" cy="38" rx="6" ry="3"/><ellipse cx="37" cy="67" rx="3" ry="8"/><rect x="47" y="7" width="3" height="9" rx="1.5"/>',
  };
  // The shading gradients live once in a tiny always-rendered <svg> on the page. Gradients defined inside
  // hidden elements (like a screen that isn't showing) stop working in some browsers, so pieces just point here.
  function ensureDefs() {
    if (typeof document === 'undefined' || document.getElementById('toy-defs') || !document.body) return;
    const g = (col) => { const c = TONES[col], id = 'toy' + col;
      return `<radialGradient id="${id}" cx="35%" cy="28%" r="80%"><stop offset="0" stop-color="${c.light}"/><stop offset=".45" stop-color="${c.base}"/><stop offset="1" stop-color="${c.dark}"/></radialGradient>` +
        `<linearGradient id="${id}base" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c.base}"/><stop offset="1" stop-color="${c.dark}"/></linearGradient>`; };
    const d = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    d.id = 'toy-defs'; d.setAttribute('aria-hidden', 'true'); d.setAttribute('style', 'position:absolute;width:0;height:0;overflow:hidden');
    d.innerHTML = `<defs>${g('w')}${g('b')}</defs>`; document.body.prepend(d);
  }
  if (typeof document !== 'undefined') { if (document.body) ensureDefs(); else document.addEventListener('DOMContentLoaded', ensureDefs); }
  function svg(t, col) {
    ensureDefs();
    const c = TONES[col], id = 'toy' + col;
    return `<svg viewBox="0 0 100 100" aria-hidden="true">` +
      `<ellipse cx="50" cy="92" rx="30" ry="5" fill="rgb(90 60 120/.22)"/>` +
      `<rect x="24" y="78" width="52" height="13" rx="6.5" fill="url(#${id}base)" stroke="${c.edge}" stroke-width="1.5"/>` +
      `<g fill="url(#${id})" stroke="${c.edge}" stroke-width="1.5" stroke-linejoin="round">${SHAPES[t]}</g>` +
      `<g class="face" fill="#fff" opacity=".75">${HIGHLIGHT[t]}</g>` +
      `<rect x="30" y="80" width="22" height="3.5" rx="1.75" fill="#fff" opacity=".55"/></svg>`;
  }
  root.ChessArt = { svg, NAMES: { p: 'pawn', n: 'knight', b: 'bishop', r: 'rook', q: 'queen', k: 'king' } };
})(this);
