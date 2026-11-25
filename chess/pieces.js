// Cute chess pieces drawn as SVG, kokeshi-doll style with Indian jewel details: a little face, a gold bindi,
// a painted flower and a gold obi band. ChessArt.svg(type, colour) returns markup.
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
  function svg(t, col) {
    // cream side and vermilion side, both outlined in indigo
    const white = col === 'w', fill = white ? '#fff6e6' : '#e8442e', eye = '#23317a', cheek = white ? '#ff9fbf' : '#ffc2a8';
    const INK = '#23317a', GOLD = '#ffc22e', FLOWER = white ? '#e6177a' : '#ffe08a';
    const [fx, fy] = FACE[t];
    let extra = '';
    if (t === 'p') extra = `<circle cx="50" cy="32" r="16" fill="${fill}" stroke="${INK}" stroke-width="5"/>`;
    if (t === 'b') extra = `<circle cx="50" cy="11" r="5" fill="${fill}" stroke="${INK}" stroke-width="4"/><path d="M58 24 L49 34" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>`;
    if (t === 'q') extra = ['24 34', '42 22', '58 22', '76 34'].map(p => { const [x, y] = p.split(' '); return `<circle cx="${x}" cy="${+y - 4}" r="5.5" fill="${GOLD}" stroke="${INK}" stroke-width="4"/>`; }).join('');
    if (t === 'k') extra = `<path d="M50 8 V30 M41 17 H59" stroke="${INK}" stroke-width="10" stroke-linecap="round"/><path d="M50 8 V30 M41 17 H59" stroke="${GOLD}" stroke-width="4.5" stroke-linecap="round"/>`;
    if (t === 'n') extra = `<path d="M52 16 C58 22 62 30 64 40" stroke="${white ? '#e6177a' : '#ffc22e'}" stroke-width="5" fill="none" stroke-linecap="round"/><circle cx="34" cy="44" r="2.4" fill="${eye}"/>`;
    const eyes = t === 'n'
      ? `<circle cx="47" cy="34" r="3.6" fill="${eye}"/><ellipse cx="44" cy="43" rx="4" ry="2.6" fill="${cheek}" opacity=".8"/>`
      : `<circle cx="${fx - 7}" cy="${fy}" r="3.4" fill="${eye}"/><circle cx="${fx + 7}" cy="${fy}" r="3.4" fill="${eye}"/>` +
        `<ellipse cx="${fx - 13}" cy="${fy + 6}" rx="4" ry="2.6" fill="${cheek}" opacity=".85"/><ellipse cx="${fx + 13}" cy="${fy + 6}" rx="4" ry="2.6" fill="${cheek}" opacity=".85"/>` +
        `<path d="M${fx - 4} ${fy + 6} Q${fx} ${fy + 10} ${fx + 4} ${fy + 6}" stroke="${eye}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`;
    return `<svg viewBox="0 0 100 100" aria-hidden="true"><ellipse cx="50" cy="90" rx="26" ry="5" fill="rgb(0 0 0 / .14)"/>` +
      `<path d="${BODY[t]}" fill="${fill}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>` +
      `<rect x="26" y="80" width="48" height="11" rx="5.5" fill="${GOLD}" stroke="${INK}" stroke-width="5"/>${extra}` +
      (t === 'p' ? '' : flower(50, t === 'k' || t === 'q' ? 74 : t === 'r' ? 72 : 73, FLOWER)) +
      `<g class="face">${eyes}${t === 'n' ? '' : `<circle cx="${fx}" cy="${fy - 9}" r="2.6" fill="#e6177a" stroke="${GOLD}" stroke-width="1.4"/>`}</g></svg>`;
  }
  function flower(x, y, c) {
    let p = '';
    for (let i = 0; i < 5; i++) { const a = i * 72 * Math.PI / 180; p += `<circle cx="${(x + Math.sin(a) * 3.6).toFixed(1)}" cy="${(y - Math.cos(a) * 3.6).toFixed(1)}" r="2.8" fill="${c}"/>`; }
    return p + `<circle cx="${x}" cy="${y}" r="1.8" fill="#ffc22e"/>`;
  }
  root.ChessArt = { svg, NAMES: { p: 'pawn', n: 'knight', b: 'bishop', r: 'rook', q: 'queen', k: 'king' } };
})(this);
