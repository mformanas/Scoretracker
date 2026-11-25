// Cute chess pieces in a watercolour style: a loose wash of colour that bleeds a little past
// thin charcoal lines, and a tiny face. ChessArt.svg(type, colour) returns markup.
(function (root) {
  const BODY = {
    p: 'M36 84 Q38 60 44 50 L56 50 Q62 60 64 84 Z',
    r: 'M30 18 h10 v8 h6 v-8 h8 v8 h6 v-8 h10 v22 l-4 4 v40 H34 V44 l-4 -4 Z',
    n: 'M32 84 C31 66 38 58 46 52 C40 53 33 55 28 50 C24 44 30 36 38 30 C42 22 48 18 52 16 L54 7 L60 16 C74 22 78 46 72 84 Z',
    b: 'M50 14 C68 28 68 52 58 62 L62 84 H38 L42 62 C32 52 32 28 50 14 Z',
    q: 'M24 34 L34 62 L36 84 H64 L66 62 L76 34 L63 46 L58 22 L50 42 L42 22 L37 46 Z',
    k: 'M30 46 C30 32 70 32 70 46 L64 64 L66 84 H34 L36 64 Z',
  };
  const FACE = { p: [50, 32], r: [50, 56], n: [50, 40], b: [50, 46], q: [50, 62], k: [50, 54] };
  const INK = '#3d3a4f';
  function svg(t, col) {
    const white = col === 'w';
    const paper = white ? '#fffdf8' : '#8aa6d6';        // the piece itself
    const wash = white ? '#f2b8a2' : '#4f6fb0';         // the colour that bleeds past the line
    const cheek = white ? '#f0a0b4' : '#f5b8c8', eye = INK, accent = '#e3b04b';
    const [fx, fy] = FACE[t];
    const shape = (fill, extra = '') => `<path d="${BODY[t]}" fill="${fill}" ${extra}/>` + `<rect x="26" y="80" width="48" height="11" rx="5.5" fill="${fill}" ${extra}/>` +
      (t === 'p' ? `<circle cx="50" cy="32" r="16" fill="${fill}" ${extra}/>` : '');
    let deco = '';
    if (t === 'b') deco = `<circle cx="50" cy="11" r="5" fill="${paper}" stroke="${INK}" stroke-width="3"/><path d="M58 24 L49 34" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`;
    if (t === 'q') deco = ['24 34', '42 22', '58 22', '76 34'].map(p => { const [x, y] = p.split(' '); return `<circle cx="${x}" cy="${+y - 4}" r="5" fill="${accent}" fill-opacity=".85" stroke="${INK}" stroke-width="3"/>`; }).join('');
    if (t === 'k') deco = `<path d="M50 8 V30 M41 17 H59" stroke="${accent}" stroke-width="7" stroke-linecap="round" opacity=".8"/><path d="M50 8 V30 M41 17 H59" stroke="${INK}" stroke-width="2.5" stroke-linecap="round" fill="none"/>`;
    if (t === 'n') deco = `<path d="M52 16 C58 22 62 30 64 40" stroke="${wash}" stroke-width="5" fill="none" stroke-linecap="round" opacity=".7"/><circle cx="34" cy="44" r="2" fill="${eye}"/>`;
    const face = t === 'n'
      ? `<circle cx="47" cy="34" r="3" fill="${eye}"/><ellipse cx="44" cy="43" rx="4" ry="2.4" fill="${cheek}" opacity=".85"/>`
      : `<circle cx="${fx - 7}" cy="${fy}" r="2.8" fill="${eye}"/><circle cx="${fx + 7}" cy="${fy}" r="2.8" fill="${eye}"/>` +
        `<ellipse cx="${fx - 13}" cy="${fy + 6}" rx="4" ry="2.4" fill="${cheek}" opacity=".85"/><ellipse cx="${fx + 13}" cy="${fy + 6}" rx="4" ry="2.4" fill="${cheek}" opacity=".85"/>` +
        `<path d="M${fx - 3.5} ${fy + 5} Q${fx} ${fy + 8.5} ${fx + 3.5} ${fy + 5}" stroke="${eye}" stroke-width="2.2" fill="none" stroke-linecap="round"/>`;
    return `<svg viewBox="0 0 100 100" aria-hidden="true">` +
      `<g transform="translate(-3 3)" opacity="${white ? .55 : .5}">${shape(wash)}</g>` +   // wash bleeding past the line
      shape(paper, `opacity="${white ? 1 : .95}"`) +
      `<g fill="none" stroke="${INK}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">${shape('none')}</g>` +
      deco + `<g class="face">${face}</g></svg>`;
  }
  root.ChessArt = { svg, NAMES: { p: 'pawn', n: 'knight', b: 'bishop', r: 'rook', q: 'queen', k: 'king' } };
})(this);
