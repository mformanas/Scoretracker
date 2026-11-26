// Adda's own chess engine (Easy, Medium, Hard). Runs as a Web Worker.
// Message in: {fen, level: 'easy'|'medium'|'hard', id}. Message out: {id, move: 'e2e4' or 'e7e8q'}.
// Alpha-beta search with quiescence, move ordering and piece-square tables; lower levels add deliberate mistakes.
importScripts('chess.js?v=28');
const C = self.Chess;
const VAL = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 0 };
// piece-square tables from white's point of view, a8..h1 (index = square)
const PST = {
  p: [0,0,0,0,0,0,0,0, 50,50,50,50,50,50,50,50, 10,10,20,30,30,20,10,10, 5,5,10,25,25,10,5,5, 0,0,0,20,20,0,0,0, 5,-5,-10,0,0,-10,-5,5, 5,10,10,-20,-20,10,10,5, 0,0,0,0,0,0,0,0],
  n: [-50,-40,-30,-30,-30,-30,-40,-50, -40,-20,0,0,0,0,-20,-40, -30,0,10,15,15,10,0,-30, -30,5,15,20,20,15,5,-30, -30,0,15,20,20,15,0,-30, -30,5,10,15,15,10,5,-30, -40,-20,0,5,5,0,-20,-40, -50,-40,-30,-30,-30,-30,-40,-50],
  b: [-20,-10,-10,-10,-10,-10,-10,-20, -10,0,0,0,0,0,0,-10, -10,0,5,10,10,5,0,-10, -10,5,5,10,10,5,5,-10, -10,0,10,10,10,10,0,-10, -10,10,10,10,10,10,10,-10, -10,5,0,0,0,0,5,-10, -20,-10,-10,-10,-10,-10,-10,-20],
  r: [0,0,0,0,0,0,0,0, 5,10,10,10,10,10,10,5, -5,0,0,0,0,0,0,-5, -5,0,0,0,0,0,0,-5, -5,0,0,0,0,0,0,-5, -5,0,0,0,0,0,0,-5, -5,0,0,0,0,0,0,-5, 0,0,0,5,5,0,0,0],
  q: [-20,-10,-10,-5,-5,-10,-10,-20, -10,0,0,0,0,0,0,-10, -10,0,5,5,5,5,0,-10, -5,0,5,5,5,5,0,-5, 0,0,5,5,5,5,0,-5, -10,5,5,5,5,5,0,-10, -10,0,5,0,0,0,0,-10, -20,-10,-10,-5,-5,-10,-10,-20],
  k: [-30,-40,-40,-50,-50,-40,-40,-30, -30,-40,-40,-50,-50,-40,-40,-30, -30,-40,-40,-50,-50,-40,-40,-30, -30,-40,-40,-50,-50,-40,-40,-30, -20,-30,-30,-40,-40,-30,-30,-20, -10,-20,-20,-20,-20,-20,-20,-10, 20,20,0,0,0,0,20,20, 20,30,10,0,0,10,30,20],
  ke: [-50,-40,-30,-20,-20,-30,-40,-50, -30,-20,-10,0,0,-10,-20,-30, -30,-10,20,30,30,20,-10,-30, -30,-10,30,40,40,30,-10,-30, -30,-10,30,40,40,30,-10,-30, -30,-10,20,30,30,20,-10,-30, -30,-30,0,0,0,0,-30,-30, -50,-30,-30,-30,-30,-30,-30,-50],
};
function evaluate(st) {
  let s = 0, minor = 0;
  for (const p of st.b) if (p && 'qQ'.includes(p)) minor += 1;
  for (const p of st.b) if (p && 'rRbBnN'.includes(p)) minor += .3;
  const end = minor < 2.2;
  st.b.forEach((p, i) => {
    if (!p) return;
    const t = p.toLowerCase(), white = p !== t, idx = white ? i : (7 - (i >> 3)) * 8 + (i & 7);
    const v = VAL[t] + (t === 'k' && end ? PST.ke : PST[t])[idx];
    s += white ? v : -v;
  });
  return st.t === 'w' ? s : -s;
}
const ordered = ms => ms.map(m => ({ m, o: (m.cap ? 10 * VAL[m.cap.toLowerCase()] - VAL[m.piece.toLowerCase()] + 1000 : 0) + (m.promo ? 800 : 0) })).sort((a, b) => b.o - a.o).map(x => x.m);
let nodes = 0, deadline = Infinity, stopped = false;
function quiesce(st, a, b, d) {
  const stand = evaluate(st); if (stand >= b) return b; if (a < stand) a = stand; if (d > 6) return a;
  for (const m of ordered(C.moves(st).filter(m => m.cap || m.promo))) {
    const sc = -quiesce(C.make(st, m), -b, -a, d + 1);
    if (sc >= b) return b; if (sc > a) a = sc;
  }
  return a;
}
function search(st, depth, a, b, ply) {
  if ((++nodes & 1023) === 0 && Date.now() > deadline) stopped = true;
  if (stopped) return 0;
  const ms = C.moves(st);
  if (!ms.length) return C.inCheck(st) ? -100000 + ply : 0;
  if (st.h >= 100) return 0;
  if (depth <= 0) return quiesce(st, a, b, 0);
  for (const m of ordered(ms)) {
    const sc = -search(C.make(st, m), depth - 1, -b, -a, ply + 1);
    if (stopped) return 0;
    if (sc >= b) return b; if (sc > a) a = sc;
  }
  return a;
}
function rootScores(st, depth) {
  const out = [];
  for (const m of ordered(C.moves(st))) { const sc = -search(C.make(st, m), depth - 1, -1e9, 1e9, 1); if (stopped) break; out.push({ m, sc }); }
  return out;
}
const uci = m => C.name(m.f) + C.name(m.t) + (m.promo || '');
function choose(fen, level) {
  const st = C.fromFen(fen), all = C.moves(st);
  if (all.length === 1) return uci(all[0]);
  nodes = 0; stopped = false;
  if (level === 'easy') {
    // shallow look, plenty of noise, and sometimes a careless move
    deadline = Date.now() + 1500;
    if (Math.random() < .25) return uci(all[Math.floor(Math.random() * all.length)]);
    const sc = rootScores(st, 1).map(x => ({ ...x, sc: x.sc + (Math.random() - .5) * 300 }));
    return uci(sc.sort((a, b) => b.sc - a.sc)[0].m);
  }
  if (level === 'medium') {
    deadline = Date.now() + 2500;
    const sc = rootScores(st, 2).map(x => ({ ...x, sc: x.sc + (Math.random() - .5) * 60 }));
    return uci(sc.sort((a, b) => b.sc - a.sc)[0].m);
  }
  // hard: iterative deepening within a time budget, keep the best finished depth
  deadline = Date.now() + 2200; let best = null;
  for (let d = 1; d <= 6; d++) {
    const sc = rootScores(st, d); if (stopped && best) break;
    if (sc.length) best = sc.sort((a, b) => b.sc - a.sc)[0];
    if (best && best.sc > 90000) break;
  }
  return uci((best || { m: all[0] }).m);
}
self.onmessage = e => {
  const { fen, level, id } = e.data;
  const t0 = Date.now(), move = choose(fen, level);
  // never answer instantly: a short "thinking" pause feels friendlier
  const wait = Math.max(0, (level === 'easy' ? 500 : 650) - (Date.now() - t0));
  setTimeout(() => self.postMessage({ id, move }), wait);
};
