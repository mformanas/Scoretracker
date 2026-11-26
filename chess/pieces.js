// Storybook animal chess pieces. Each animal sits on a round token in its team colour and wears its piece's hat:
// pawn = chick, knight = pony, bishop = owl in a mitre, rook = turtle with a castle shell, queen = cat in a tiara,
// king = lion in a crown. ChessArt.svg(type, colour) returns markup.
(function (root) {
  const INK = '#3b2a4a';
  const TEAM = {
    w: { token: '#ffb347', rim: '#e0761f', hat: '#ff9f43', hat2: '#ffd166' },   // sunny team
    b: { token: '#6a58e8', rim: '#3a2c9e', hat: '#7b6cf6', hat2: '#c9c2ff' },   // berry team
  };
  const L = `stroke="${INK}" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"`;
  const eye = (x, y, r = 2.6) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${INK}"/><circle cx="${x - r * .35}" cy="${y - r * .4}" r="${r * .38}" fill="#fff"/>`;
  const blush = (x, y) => `<ellipse cx="${x}" cy="${y}" rx="3.6" ry="2.2" fill="#ff8fa3" opacity=".8"/>`;
  const token = t => `<ellipse cx="50" cy="89" rx="40" ry="10" fill="${t.rim}" ${L}/><ellipse cx="50" cy="83" rx="40" ry="10" fill="${t.token}" ${L}/>`;
  const ART = {
    // chick with a tiny team beanie
    p: t => `<path d="M30 80 C26 62 34 46 50 46 C66 46 74 62 70 80 Z" fill="#ffd84d" ${L}/>
      <path d="M34 68 C28 66 26 60 30 56 C34 60 36 64 34 68Z" fill="#ffc21a" ${L}/><path d="M66 68 C72 66 74 60 70 56 C66 60 64 64 66 68Z" fill="#ffc21a" ${L}/>
      <path d="M40 48 C40 38 60 38 60 48 Z" fill="${t.hat}" ${L}/><circle cx="50" cy="37" r="4" fill="${t.hat2}" ${L}/>
      ${eye(43, 58)}${eye(57, 58)}<path d="M46 63 L50 68 L54 63 Z" fill="#ff8a2a" ${L}/>${blush(38, 65)}${blush(62, 65)}
      <path d="M44 80 V84 M56 80 V84" stroke="#ff8a2a" stroke-width="3" stroke-linecap="round"/>`,
    // pony head and neck, mane in team colour
    n: t => `<path d="M34 82 C32 66 38 58 46 52 C38 54 28 52 26 45 C24 37 32 30 42 26 C46 18 54 14 60 15 C74 20 78 46 70 82 Z" fill="#f2c18d" ${L}/>
      <path d="M58 15 C66 16 74 26 76 40 C78 54 74 70 72 82 L66 82 C70 66 70 48 64 36 C60 28 56 22 58 15Z" fill="${t.hat}" ${L}/>
      <path d="M58 15 L56 7 L64 13 Z" fill="#f2c18d" ${L}/>
      <path d="M26 45 C30 47 34 47 37 45" fill="none" ${L}/><circle cx="31" cy="40" r="1.6" fill="${INK}"/>
      ${eye(46, 32, 3)}${blush(44, 41)}
      <path d="M44 22 C48 20 52 21 54 24" fill="none" stroke="${t.hat2}" stroke-width="3" stroke-linecap="round"/>`,
    // owl in a pointed mitre
    b: t => `<path d="M30 80 C26 60 32 42 50 42 C68 42 74 60 70 80 Z" fill="#b98a64" ${L}/>
      <path d="M38 80 C36 66 42 58 50 58 C58 58 64 66 62 80 Z" fill="#f3dcc0" ${L}/>
      <path d="M40 72 Q43 74 46 72 M54 72 Q57 74 60 72 M47 77 Q50 79 53 77" fill="none" stroke="#c9a37f" stroke-width="2" stroke-linecap="round"/>
      <path d="M36 44 C38 26 46 14 50 10 C54 14 62 26 64 44 C56 41 44 41 36 44Z" fill="${t.hat}" ${L}/>
      <path d="M44 26 H56 M50 18 V36" stroke="${t.hat2}" stroke-width="3" stroke-linecap="round"/>
      <circle cx="42" cy="52" r="7.5" fill="#fff" ${L}/><circle cx="58" cy="52" r="7.5" fill="#fff" ${L}/>${eye(42, 52, 3.4)}${eye(58, 52, 3.4)}
      <path d="M47 58 L50 63 L53 58 Z" fill="#ffb02e" ${L}/>`,
    // turtle carrying a castle-tower shell
    r: t => `<ellipse cx="22" cy="72" rx="9" ry="7.5" fill="#8fd694" ${L}/>${eye(20, 70, 2.2)}${blush(24, 75)}
      <path d="M30 80 C30 76 34 76 34 80 M64 80 C64 76 68 76 68 80" fill="#8fd694" ${L}/>
      <path d="M30 80 V44 H36 V36 H44 V44 H48 V36 H56 V44 H60 V36 H68 V44 H72 V80 Z" fill="${t.hat}" ${L}/>
      <path d="M30 56 H72 M30 68 H72 M44 44 V56 M58 44 V56 M38 56 V68 M51 56 V68 M64 56 V68 M44 68 V80 M58 68 V80" stroke="${t.hat2}" stroke-width="2" opacity=".9"/>
      <path d="M46 80 V72 C46 66 56 66 56 72 V80 Z" fill="${INK}" opacity=".75"/>`,
    // cat in a tiara
    q: t => `<path d="M30 82 C26 64 32 50 50 50 C68 50 74 64 70 82 Z" fill="#ffffff" ${L}/>
      <circle cx="50" cy="44" r="18" fill="#ffffff" ${L}/>
      <path d="M34 36 L34 20 L46 30 Z M66 36 L66 20 L54 30 Z" fill="#ffffff" ${L}/><path d="M37 30 L37 24 L42 28Z M63 30 L63 24 L58 28Z" fill="#ffb3c1"/>
      <path d="M38 30 L42 20 L46 27 L50 16 L54 27 L58 20 L62 30 Z" fill="${t.hat2}" ${L}/>
      <circle cx="50" cy="16" r="2.6" fill="#ff6b9a" ${L}/>
      ${eye(43, 45)}${eye(57, 45)}<path d="M48 50 L50 52 L52 50" fill="none" ${L}/>
      <path d="M50 52 Q47 55 45 53 M50 52 Q53 55 55 53" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>
      ${blush(38, 51)}${blush(62, 51)}<path d="M28 48 H20 M28 52 H21 M72 48 H80 M72 52 H79" stroke="${INK}" stroke-width="1.6" stroke-linecap="round"/>
      <path d="M36 70 C40 74 60 74 64 70" fill="none" stroke="${t.hat}" stroke-width="5" stroke-linecap="round"/>`,
    // lion in a crown
    k: t => `<path d="M30 82 C26 66 32 54 50 54 C68 54 74 66 70 82 Z" fill="#ffc15e" ${L}/>
      <circle cx="50" cy="48" r="24" fill="#e8873a" ${L}/>
      <path d="M26 48 C22 44 24 38 28 38 M74 48 C78 44 76 38 72 38 M30 64 C26 64 24 58 28 56 M70 64 C74 64 76 58 72 56" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>
      <circle cx="50" cy="50" r="16" fill="#ffc15e" ${L}/>
      <path d="M34 34 L36 18 L43 26 L50 14 L57 26 L64 18 L66 34 Z" fill="${t.hat2}" ${L}/>
      <path d="M50 14 V6 M46 9 H54" stroke="${INK}" stroke-width="5" stroke-linecap="round"/><path d="M50 14 V6 M46 9 H54" stroke="${t.hat2}" stroke-width="2.2" stroke-linecap="round"/>
      <circle cx="50" cy="28" r="2.6" fill="${t.hat}" ${L}/>
      ${eye(44, 49)}${eye(56, 49)}<path d="M47 55 C47 53 53 53 53 55 L50 58 Z" fill="#8a4b2a" ${L}/>
      <path d="M50 58 Q47 61 45 59 M50 58 Q53 61 55 59" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>${blush(40, 56)}${blush(60, 56)}`,
  };
  function svg(t, col) {
    const tm = TEAM[col];
    return `<svg viewBox="0 0 100 100" aria-hidden="true">${token(tm)}<g class="face">${ART[t](tm)}</g></svg>`;
  }
  root.ChessArt = { svg, NAMES: { p: 'pawn', n: 'knight', b: 'bishop', r: 'rook', q: 'queen', k: 'king' } };
})(this);
