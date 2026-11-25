// Cute chess pieces: chubby little characters with big shiny eyes and rosy cheeks.
// Each one wears its own hat: the rook a castle top, the bishop a pointy cap, the queen a tiara, the king a crown.
// ChessArt.svg(type, colour) returns markup.
(function (root) {
  const INK = '#3d3a4f';
  const BLOB = 'M24 86 C20 60 32 46 50 46 C68 46 80 60 76 86 Z';            // chubby body for most pieces
  function eyes(x, y, s = 1) {
    const e = (cx) => `<ellipse cx="${cx}" cy="${y}" rx="${3.8 * s}" ry="${4.8 * s}" fill="${INK}"/><circle cx="${cx - 1.3 * s}" cy="${y - 1.8 * s}" r="${1.5 * s}" fill="#fff"/>`;
    return e(x - 8 * s) + e(x + 8 * s);
  }
  const cheeks = (x, y, c) => `<ellipse cx="${x - 15}" cy="${y + 6}" rx="5" ry="3" fill="${c}" opacity=".75"/><ellipse cx="${x + 15}" cy="${y + 6}" rx="5" ry="3" fill="${c}" opacity=".75"/>`;
  const smile = (x, y) => `<path d="M${x - 4} ${y + 6} Q${x - 2} ${y + 9} ${x} ${y + 6} Q${x + 2} ${y + 9} ${x + 4} ${y + 6}" stroke="${INK}" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  function svg(t, col) {
    const white = col === 'w';
    const body = white ? '#fffaf2' : '#5f72b8', shine = white ? '#ffffff' : '#93a6e0', belly = white ? '#f6e6d8' : '#5266a8';
    const gold = '#f2c45a', cheek = white ? '#f7a8bb' : '#f7b6c8';
    const line = `stroke="${INK}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"`;
    const base = `<ellipse cx="50" cy="91" rx="28" ry="4.5" fill="rgb(61 58 79/.15)"/>`;
    const blob = (d = BLOB) => `<path d="${d}" fill="${body}" ${line}/><path d="M30 84 C30 76 40 72 50 72 C60 72 70 76 70 84 Z" fill="${belly}" opacity=".6"/><ellipse cx="36" cy="58" rx="6" ry="4" fill="${shine}" opacity=".7" transform="rotate(-30 36 58)"/>`;
    let art = '';
    if (t === 'p') {
      art = `<path d="M26 86 C22 60 32 44 50 44 C68 44 78 60 74 86 Z" fill="${body}" ${line}/><path d="M32 84 C32 77 41 73 50 73 C59 73 68 77 68 84 Z" fill="${belly}" opacity=".6"/><ellipse cx="37" cy="56" rx="5.5" ry="3.8" fill="${shine}" opacity=".7" transform="rotate(-30 37 56)"/>` +
        `<path d="M50 44 C48 37 53 33 57 36" stroke="${INK}" stroke-width="3" fill="none" stroke-linecap="round"/>` + eyes(50, 63) + cheeks(50, 63, cheek) + smile(50, 63);
    } else if (t === 'r') {
      art = `<path d="M26 86 V44 H74 V86 Z" fill="${body}" ${line}/>` +
        `<path d="M24 46 V30 H34 V36 H44 V30 H56 V36 H66 V30 H76 V46 Z" fill="${body}" ${line}/>` +
        `<ellipse cx="34" cy="54" rx="5" ry="3.5" fill="${shine}" opacity=".7"/>` + eyes(50, 62) + cheeks(50, 62, cheek) + smile(50, 62);
    } else if (t === 'b') {
      art = blob() + `<path d="M32 52 C34 30 44 18 50 12 C56 18 66 30 68 52 C58 48 42 48 32 52 Z" fill="${white ? '#f9c7d4' : '#b7a3e6'}" ${line}/>` +
        `<path d="M54 24 L46 36" ${line}/><circle cx="50" cy="10" r="4.5" fill="${gold}" ${line}/>` + eyes(50, 66) + cheeks(50, 66, cheek) + smile(50, 66);
    } else if (t === 'q') {
      art = blob() + `<path d="M30 50 L30 34 L40 42 L50 28 L60 42 L70 34 L70 50 C62 46 38 46 30 50 Z" fill="${gold}" ${line}/>` +
        `<circle cx="30" cy="31" r="3.6" fill="#f7a8bb" ${line}/><circle cx="50" cy="25" r="3.6" fill="#f7a8bb" ${line}/><circle cx="70" cy="31" r="3.6" fill="#f7a8bb" ${line}/>` +
        eyes(50, 66) + cheeks(50, 66, cheek) + smile(50, 66);
    } else if (t === 'k') {
      art = blob() + `<path d="M31 50 L31 32 L41 40 L50 30 L59 40 L69 32 L69 50 C60 46 40 46 31 50 Z" fill="${gold}" ${line}/>` +
        `<path d="M50 30 V14 M43 20 H57" stroke="${INK}" stroke-width="8" stroke-linecap="round"/><path d="M50 30 V14 M43 20 H57" stroke="${gold}" stroke-width="3.5" stroke-linecap="round"/>` +
        eyes(50, 66) + cheeks(50, 66, cheek) + smile(50, 66);
    } else if (t === 'n') {
      art = `<path d="M30 86 C28 70 32 60 40 54 C32 56 24 54 22 47 C20 39 28 31 38 27 C42 19 48 14 54 13 L58 6 L63 15 C76 22 80 46 74 86 Z" fill="${body}" ${line}/>` +
        `<path d="M58 15 C66 18 72 26 74 36 C72 30 68 27 64 26 C70 32 72 40 73 48" fill="none" stroke="${gold}" stroke-width="5" stroke-linecap="round"/>` +
        `<ellipse cx="38" cy="38" rx="5" ry="3.5" fill="${shine}" opacity=".7" transform="rotate(-30 38 38)"/>` +
        `<ellipse cx="48" cy="33" rx="4.2" ry="5.2" fill="${INK}"/><circle cx="46.6" cy="31" r="1.6" fill="#fff"/>` +
        `<circle cx="27" cy="45" r="1.8" fill="${INK}"/><ellipse cx="44" cy="45" rx="5" ry="3" fill="${cheek}" opacity=".75"/>` +
        `<path d="M27 51 Q31 54 35 51" stroke="${INK}" stroke-width="2.2" fill="none" stroke-linecap="round"/>`;
    }
    return `<svg viewBox="0 0 100 100" aria-hidden="true">${base}<g class="face">${art}</g></svg>`;
  }
  root.ChessArt = { svg, NAMES: { p: 'pawn', n: 'knight', b: 'bishop', r: 'rook', q: 'queen', k: 'king' } };
})(this);
