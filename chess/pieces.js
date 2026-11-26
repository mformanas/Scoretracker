// Wooden chess pieces: classic carved shapes in light maple and dark walnut, with wood grain and a soft polish.
// ChessArt.svg(type, colour) returns markup.
(function (root) {
  const WOOD = {
    w: { hi: '#fbe6c2', mid: '#e7c08a', lo: '#c08e55', edge: '#8a5a2e', grain: '#b07a42' },   // maple
    b: { hi: '#9a6640', mid: '#6e4226', lo: '#40230f', edge: '#2a160a', grain: '#2e1a0c' },   // walnut
  };
  const BASE = '<rect x="22" y="80" width="56" height="10" rx="3"/><rect x="28" y="73" width="44" height="9" rx="3"/>';
  const SHAPES = {
    p: '<path d="M38 74 C40 62 44 54 46 49 H54 C56 54 60 62 62 74 Z"/><ellipse cx="50" cy="47" rx="13" ry="4"/><circle cx="50" cy="32" r="12"/>',
    r: '<path d="M35 74 L37 47 H63 L65 74 Z"/><ellipse cx="50" cy="47" rx="17" ry="4"/><path d="M30 45 V26 H38 V32 H46 V26 H54 V32 H62 V26 H70 V45 Z"/>',
    n: '<path d="M32 74 C32 60 38 54 46 48 C38 50 30 48 28 42 C26 34 34 28 42 24 C46 16 52 12 56 12 L60 6 L63 14 C74 20 77 44 70 74 Z"/>',
    b: '<path d="M38 74 C42 64 44 60 44 58 H56 C56 60 58 64 62 74 Z"/><ellipse cx="50" cy="57" rx="14" ry="4"/><path d="M50 17 C64 27 64 44 56 54 H44 C36 44 36 27 50 17 Z"/><circle cx="50" cy="13" r="4"/>',
    q: '<path d="M36 74 C40 62 42 56 42 54 H58 C58 56 60 62 64 74 Z"/><ellipse cx="50" cy="53" rx="16" ry="4"/><path d="M30 27 L38 50 H62 L70 27 L60 38 L56 22 L50 36 L44 22 L40 38 Z"/><circle cx="30" cy="25" r="3.5"/><circle cx="44" cy="20" r="3.5"/><circle cx="56" cy="20" r="3.5"/><circle cx="70" cy="25" r="3.5"/>',
    k: '<path d="M36 74 C40 62 42 56 42 54 H58 C58 56 60 62 64 74 Z"/><ellipse cx="50" cy="53" rx="16" ry="4"/><path d="M34 32 C34 26 66 26 66 32 L62 50 H38 Z"/><path d="M47 6 H53 V12 H59 V18 H53 V27 H47 V18 H41 V12 H47 Z"/>',
  };
  const DETAIL = {   // carved lines
    p: '', r: '<path d="M38 56 H62"/>',
    n: '<path d="M58 16 C66 22 70 32 71 44"/><circle cx="46" cy="28" r="2.2" fill="currentColor" stroke="none"/><circle cx="31" cy="40" r="1.4" fill="currentColor" stroke="none"/>',
    b: '<path d="M55 27 L47 39"/>', q: '<path d="M40 44 H60"/>', k: '<path d="M40 42 H60"/>',
  };
  function defsMarkup() {
    const g = col => { const c = WOOD[col];
      return `<linearGradient id="wood${col}" x1="0" y1="0" x2="1" y2=".25"><stop offset="0" stop-color="${c.hi}"/><stop offset=".45" stop-color="${c.mid}"/><stop offset="1" stop-color="${c.lo}"/></linearGradient>` +
        `<pattern id="grain${col}" width="24" height="60" patternUnits="userSpaceOnUse" patternTransform="rotate(8)"><path d="M3 0 C6 15 0 30 4 45 S5 60 3 60 M11 0 C13 20 9 35 12 60 M19 0 C16 18 22 40 18 60" fill="none" stroke="${c.grain}" stroke-width="1.1" opacity=".55"/></pattern>`; };
    return `<defs>${g('w')}${g('b')}</defs>`;
  }
  // The gradients and grain live once in a tiny always-rendered <svg>; pieces just point at them.
  // (Gradients defined inside hidden screens stop working in some browsers.)
  function ensureDefs() {
    if (typeof document === 'undefined' || !document.body || document.getElementById('wood-defs')) return;
    const d = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    d.id = 'wood-defs'; d.setAttribute('aria-hidden', 'true'); d.setAttribute('style', 'position:absolute;width:0;height:0;overflow:hidden');
    d.innerHTML = defsMarkup(); document.body.prepend(d);
  }
  if (typeof document !== 'undefined') { if (document.body) ensureDefs(); else document.addEventListener('DOMContentLoaded', ensureDefs); }
  function svg(t, col) {
    ensureDefs();
    const c = WOOD[col], shapes = BASE + SHAPES[t];
    return `<svg viewBox="0 0 100 100" aria-hidden="true" style="color:${c.edge}">` +
      `<ellipse cx="50" cy="92" rx="30" ry="4.5" fill="rgb(60 30 10/.25)"/>` +
      `<g fill="url(#wood${col})" stroke="${c.edge}" stroke-width="1.8" stroke-linejoin="round">${shapes}</g>` +
      `<g fill="url(#grain${col})" stroke="none">${shapes}</g>` +
      `<g fill="none" stroke="${c.edge}" stroke-width="1.6" stroke-linecap="round" opacity=".7">${DETAIL[t]}</g>` +
      `<g class="face" fill="#fff" opacity="${col === 'w' ? .55 : .22}"><ellipse cx="41" cy="${t === 'p' ? 28 : t === 'n' ? 30 : 36}" rx="3" ry="5" transform="rotate(20 41 36)"/><rect x="26" y="82" width="14" height="2.5" rx="1.2"/></g></svg>`;
  }
  root.ChessArt = { svg, defsMarkup, NAMES: { p: 'pawn', n: 'knight', b: 'bishop', r: 'rook', q: 'queen', k: 'king' } };
})(this);
