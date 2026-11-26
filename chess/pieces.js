// Minimal chess pieces: simple flat silhouettes. White pieces are white with a thin dark line, black pieces solid.
// ChessArt.svg(type, colour) returns markup.
(function (root) {
  const BASE = 'M28 86 H72 V80 C72 77 70 76 67 76 H33 C30 76 28 77 28 80 Z';
  const BODY = {
    p: 'M38 76 C38 66 42 60 45 56 C40 54 38 50 38 46 C38 39 43 34 50 34 C57 34 62 39 62 46 C62 50 60 54 55 56 C58 60 62 66 62 76 Z',
    r: 'M34 76 L37 44 H63 L66 76 Z M33 44 V30 H40 V35 H46 V30 H54 V35 H60 V30 H67 V44 Z',
    n: 'M34 76 C34 64 39 57 47 51 C40 53 33 52 31 46 C29 39 36 32 44 28 C47 20 53 16 58 16 L61 10 L64 18 C74 25 76 48 69 76 Z',
    b: 'M38 76 C41 68 43 62 44 58 H56 C57 62 59 68 62 76 Z M50 18 C62 27 63 43 56 54 H44 C37 43 38 27 50 18 Z M50 9 A4.5 4.5 0 1 1 49.9 9 Z',
    q: 'M36 76 C40 66 42 60 42 56 H58 C58 60 60 66 64 76 Z M30 30 L38 54 H62 L70 30 L60 40 L56 24 L50 38 L44 24 L40 40 Z',
    k: 'M36 76 C40 66 42 60 42 56 H58 C58 60 60 66 64 76 Z M33 36 C33 29 67 29 67 36 L62 54 H38 Z M47 10 H53 V16 H59 V22 H53 V30 H47 V22 H41 V16 H47 Z',
  };
  const DOTS = { q: [[30, 28], [44, 22], [56, 22], [70, 28]] };   // the queen's crown points
  function svg(t, col) {
    const white = col === 'w', fill = white ? '#ffffff' : '#1f1f22', line = '#1f1f22';
    const dots = (DOTS[t] || []).map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.5"/>`).join('');
    const cut = t === 'n' ? `<circle cx="47" cy="31" r="2.2" fill="${white ? line : '#fff'}" stroke="none"/>` : '';
    return `<svg viewBox="0 0 100 100" aria-hidden="true"><g class="face" fill="${fill}" stroke="${line}" stroke-width="2.4" stroke-linejoin="round">` +
      `<path d="${BASE}"/><path d="${BODY[t]}"/>${dots}</g>${cut}</svg>`;
  }
  root.ChessArt = { svg, NAMES: { p: 'pawn', n: 'knight', b: 'bishop', r: 'rook', q: 'queen', k: 'king' } };
})(this);
