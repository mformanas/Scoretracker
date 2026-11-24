// Chess rules used by the Adda chess table. Squares are 0..63, a8 = 0, h1 = 63.
// White pieces are upper case (PNBRQK), black lower case, '' is empty.
(function (root) {
  const FILES = 'abcdefgh';
  const N = -8, S = 8, E = 1, W = -1;
  const KN = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
  const KG = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
  const DIAG = [[-1, -1], [-1, 1], [1, -1], [1, 1]], ORTH = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  const VALUE = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };

  const rc = s => [s >> 3, s & 7];
  const at = (r, c) => (r < 0 || r > 7 || c < 0 || c > 7) ? -1 : r * 8 + c;
  const colorOf = p => !p ? '' : p === p.toUpperCase() ? 'w' : 'b';
  const typeOf = p => p ? p.toLowerCase() : '';
  const name = s => FILES[s & 7] + (8 - (s >> 3));
  const sq = n => (8 - Number(n[1])) * 8 + FILES.indexOf(n[0]);

  function start() {
    const b = Array(64).fill('');
    'rnbqkbnr'.split('').forEach((p, i) => { b[i] = p; b[56 + i] = p.toUpperCase(); b[8 + i] = 'p'; b[48 + i] = 'P'; });
    return { b, t: 'w', c: 'KQkq', ep: -1, h: 0, n: 1 };
  }

  function fromFen(fen) {
    const [pos, t, c, ep, h, n] = fen.trim().split(/\s+/), b = [];
    pos.split('/').forEach(row => { for (const ch of row) { if (/\d/.test(ch)) for (let i = 0; i < +ch; i++) b.push(''); else b.push(ch); } });
    return { b, t: t || 'w', c: c && c !== '-' ? c : '', ep: ep && ep !== '-' ? sq(ep) : -1, h: +(h || 0), n: +(n || 1) };
  }

  function toFen(st) {
    let out = '';
    for (let r = 0; r < 8; r++) {
      let e = 0;
      for (let c = 0; c < 8; c++) { const p = st.b[r * 8 + c]; if (!p) e++; else { if (e) out += e; e = 0; out += p; } }
      if (e) out += e; if (r < 7) out += '/';
    }
    return `${out} ${st.t} ${st.c || '-'} ${st.ep >= 0 ? name(st.ep) : '-'} ${st.h} ${st.n}`;
  }

  // is square s attacked by colour `by`?
  function attacked(b, s, by) {
    const [r, c] = rc(s), up = by === 'w';
    const pr = up ? r + 1 : r - 1, pawn = up ? 'P' : 'p';
    for (const dc of [-1, 1]) { const x = at(pr, c + dc); if (x >= 0 && b[x] === pawn) return true; }
    const kn = up ? 'N' : 'n', kg = up ? 'K' : 'k';
    for (const [dr, dc] of KN) { const x = at(r + dr, c + dc); if (x >= 0 && b[x] === kn) return true; }
    for (const [dr, dc] of KG) { const x = at(r + dr, c + dc); if (x >= 0 && b[x] === kg) return true; }
    const slide = (dirs, kinds) => {
      for (const [dr, dc] of dirs) {
        let rr = r + dr, cc = c + dc;
        while (true) {
          const x = at(rr, cc); if (x < 0) break;
          const p = b[x];
          if (p) { if (colorOf(p) === by && kinds.includes(typeOf(p))) return true; break; }
          rr += dr; cc += dc;
        }
      }
      return false;
    };
    return slide(DIAG, 'bq') || slide(ORTH, 'rq');
  }

  const kingSq = (b, col) => b.indexOf(col === 'w' ? 'K' : 'k');
  const inCheck = (st, col = st.t) => { const k = kingSq(st.b, col); return k >= 0 && attacked(st.b, k, col === 'w' ? 'b' : 'w'); };

  function pseudo(st) {
    const out = [], b = st.b, me = st.t, them = me === 'w' ? 'b' : 'w';
    const add = (f, t, extra) => out.push({ f, t, piece: b[f], cap: b[t] || '', ...extra });
    for (let s = 0; s < 64; s++) {
      const p = b[s]; if (!p || colorOf(p) !== me) continue;
      const [r, c] = rc(s), k = typeOf(p);
      if (k === 'p') {
        const dir = me === 'w' ? -1 : 1, last = me === 'w' ? 0 : 7, home = me === 'w' ? 6 : 1;
        const pushPromo = (t, extra = {}) => { if ((t >> 3) === last) for (const pr of 'qrbn') add(s, t, { ...extra, promo: pr }); else add(s, t, extra); };
        const one = at(r + dir, c);
        if (one >= 0 && !b[one]) {
          pushPromo(one);
          const two = at(r + 2 * dir, c);
          if (r === home && !b[two]) add(s, two, { double: true });
        }
        for (const dc of [-1, 1]) {
          const x = at(r + dir, c + dc); if (x < 0) continue;
          if (b[x] && colorOf(b[x]) === them) pushPromo(x);
          else if (x === st.ep) add(s, x, { ep: true, cap: me === 'w' ? 'p' : 'P' });
        }
      } else if (k === 'n' || k === 'k') {
        for (const [dr, dc] of (k === 'n' ? KN : KG)) {
          const x = at(r + dr, c + dc); if (x < 0) continue;
          if (!b[x] || colorOf(b[x]) === them) add(s, x);
        }
        if (k === 'k') {
          const rights = me === 'w' ? ['K', 'Q'] : ['k', 'q'], row = me === 'w' ? 7 : 0, rook = me === 'w' ? 'R' : 'r';
          if (s === row * 8 + 4 && !attacked(b, s, them)) {
            if (st.c.includes(rights[0]) && !b[s + 1] && !b[s + 2] && b[s + 3] === rook && !attacked(b, s + 1, them) && !attacked(b, s + 2, them)) add(s, s + 2, { castle: 'k' });
            if (st.c.includes(rights[1]) && !b[s - 1] && !b[s - 2] && !b[s - 3] && b[s - 4] === rook && !attacked(b, s - 1, them) && !attacked(b, s - 2, them)) add(s, s - 2, { castle: 'q' });
          }
        }
      } else {
        const dirs = k === 'b' ? DIAG : k === 'r' ? ORTH : DIAG.concat(ORTH);
        for (const [dr, dc] of dirs) {
          let rr = r + dr, cc = c + dc;
          while (true) {
            const x = at(rr, cc); if (x < 0) break;
            if (!b[x]) add(s, x);
            else { if (colorOf(b[x]) === them) add(s, x); break; }
            rr += dr; cc += dc;
          }
        }
      }
    }
    return out;
  }

  function make(st, m) {
    const b = st.b.slice(), me = st.t, p = b[m.f];
    b[m.t] = m.promo ? (me === 'w' ? m.promo.toUpperCase() : m.promo) : p; b[m.f] = '';
    if (m.ep) b[m.t + (me === 'w' ? S : N)] = '';
    if (m.castle === 'k') { b[m.f + 1] = b[m.f + 3]; b[m.f + 3] = ''; }
    if (m.castle === 'q') { b[m.f - 1] = b[m.f - 4]; b[m.f - 4] = ''; }
    let c = st.c;
    const strip = chars => { for (const ch of chars) c = c.replace(ch, ''); };
    if (p === 'K') strip('KQ'); if (p === 'k') strip('kq');
    [[63, 'K'], [56, 'Q'], [7, 'k'], [0, 'q']].forEach(([s, ch]) => { if (m.f === s || m.t === s) strip(ch); });
    return {
      b, t: me === 'w' ? 'b' : 'w', c,
      ep: m.double ? (m.f + m.t) / 2 : -1,
      h: typeOf(p) === 'p' || m.cap ? 0 : st.h + 1,
      n: me === 'b' ? st.n + 1 : st.n,
    };
  }

  function moves(st) { return pseudo(st).filter(m => !inCheck(make(st, m), st.t)); }
  const movesFrom = (st, s) => moves(st).filter(m => m.f === s);

  function insufficient(b) {
    const left = b.filter(p => p && typeOf(p) !== 'k');
    if (!left.length) return true;
    if (left.length === 1 && 'bn'.includes(typeOf(left[0]))) return true;
    if (left.every(p => typeOf(p) === 'b')) {
      const shades = new Set(); b.forEach((p, s) => { if (typeOf(p) === 'b') shades.add(((s >> 3) + (s & 7)) % 2); });
      return shades.size === 1;
    }
    return false;
  }

  // position key for repetition: pieces, side, castling, en passant
  const key = st => toFen(st).split(' ').slice(0, 4).join(' ');

  // {over, result, winner}; `seen` = list of earlier position keys for threefold repetition
  function status(st, seen) {
    const ms = moves(st), check = inCheck(st);
    if (!ms.length) return check ? { over: true, result: 'checkmate', winner: st.t === 'w' ? 'b' : 'w', check } : { over: true, result: 'stalemate', winner: null, check };
    if (insufficient(st.b)) return { over: true, result: 'insufficient', winner: null, check };
    if (st.h >= 100) return { over: true, result: 'fifty', winner: null, check };
    if (seen) { const k = key(st); if (seen.filter(x => x === k).length >= 3) return { over: true, result: 'repetition', winner: null, check }; }
    return { over: false, result: null, winner: null, check };
  }

  function san(st, m) {
    if (m.castle) return (m.castle === 'k' ? 'O-O' : 'O-O-O') + suffix(st, m);
    const k = typeOf(m.piece), P = k === 'p' ? '' : k.toUpperCase();
    let dis = '';
    if (k !== 'p') {
      const twins = moves(st).filter(o => o.t === m.t && o.f !== m.f && o.piece === m.piece);
      if (twins.length) {
        const sameFile = twins.some(o => (o.f & 7) === (m.f & 7)), sameRank = twins.some(o => (o.f >> 3) === (m.f >> 3));
        dis = !sameFile ? FILES[m.f & 7] : !sameRank ? String(8 - (m.f >> 3)) : name(m.f);
      }
    }
    const x = m.cap ? (k === 'p' ? FILES[m.f & 7] : '') + 'x' : '';
    return P + dis + x + name(m.t) + (m.promo ? '=' + m.promo.toUpperCase() : '') + suffix(st, m);
  }
  function suffix(st, m) { const n = make(st, m); if (!inCheck(n)) return ''; return moves(n).length ? '+' : '#'; }

  function material(b) {
    const w = { taken: [], score: 0 }, k = { taken: [], score: 0 }, full = { p: 8, n: 2, b: 2, r: 2, q: 1 };
    const count = {}; b.forEach(p => { if (p) count[p] = (count[p] || 0) + 1; });
    let ws = 0, bs = 0;
    b.forEach(p => { if (!p) return; if (colorOf(p) === 'w') ws += VALUE[typeOf(p)]; else bs += VALUE[typeOf(p)]; });
    // pieces each side has captured (missing from the other side), capped so promotions don't go negative
    for (const t of 'qrbnp') {
      for (let i = 0; i < Math.max(0, full[t] - (count[t] || 0)); i++) w.taken.push(t);
      for (let i = 0; i < Math.max(0, full[t] - (count[t.toUpperCase()] || 0)); i++) k.taken.push(t.toUpperCase());
    }
    w.score = ws - bs; k.score = bs - ws;
    return { w, b: k };
  }

  function perft(st, d) { if (!d) return 1; let n = 0; for (const m of moves(st)) n += perft(make(st, m), d - 1); return n; }

  const api = { start, fromFen, toFen, moves, movesFrom, make, inCheck, attacked, status, san, key, material, perft, name, sq, colorOf, typeOf, VALUE };
  if (typeof module !== 'undefined') module.exports = api; else root.Chess = api;
})(this);
