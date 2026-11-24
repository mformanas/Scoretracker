// Rummy rules used by the Adda Rummy table.
// Cards are strings like "1S" (Ace of spades), "10H", "13D" (King of diamonds).
// - 10 cards each, one 52-card deck, no jokers, Ace is low (A-2-3).
// - To call Rummy: all 10 cards in melds, including at least one run of 4 (or longer).
//   Melds are runs (3+ in a row, same suit) or sets (3-4 of the same rank).
// - The other player scores their cards: if they have a run of 4, cards in any of
//   their melds don't count; without a run of 4, every card counts.
// - Card values: A = 1, 2-10 face value, J = 11, Q = 12, K = 13.
(function (root) {
  const SUITS = ['S', 'H', 'D', 'C'];
  const rank = c => parseInt(c, 10);
  const suit = c => c.slice(-1);
  const value = c => rank(c);
  const total = cards => cards.reduce((s, c) => s + value(c), 0);

  function newDeck() {
    const d = [];
    for (const s of SUITS) for (let r = 1; r <= 13; r++) d.push(r + s);
    return d;
  }

  function shuffle(a, rnd = Math.random) {
    a = a.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // Every possible meld inside these cards.
  function allMelds(cards) {
    const out = [];
    const byRank = {}, bySuit = {};
    cards.forEach(c => {
      (byRank[rank(c)] = byRank[rank(c)] || []).push(c);
      (bySuit[suit(c)] = bySuit[suit(c)] || []).push(c);
    });
    // sets of 3 or 4
    Object.values(byRank).forEach(g => {
      if (g.length >= 3) {
        if (g.length === 4) out.push({ type: 'set', cards: g.slice() });
        for (let i = 0; i < g.length; i++)
          for (let j = i + 1; j < g.length; j++)
            for (let k = j + 1; k < g.length; k++) out.push({ type: 'set', cards: [g[i], g[j], g[k]] });
      }
    });
    // runs of 3+
    Object.values(bySuit).forEach(g => {
      const has = {};
      g.forEach(c => { has[rank(c)] = c; });
      for (let start = 1; start <= 11; start++) {
        const run = [];
        for (let r = start; r <= 13 && has[r]; r++) {
          run.push(has[r]);
          if (run.length >= 3) out.push({ type: 'run', cards: run.slice() });
        }
      }
    });
    return out;
  }

  const isLongRun = m => m.type === 'run' && m.cards.length >= 4;

  // Best arrangement: the melds that leave the fewest points uncovered.
  // needRun: only count arrangements that include a run of 4+.
  function bestArrangement(cards, needRun) {
    const melds = allMelds(cards);
    let best = null;
    function dfs(i, used, chosen, hasRun) {
      if (i === melds.length) {
        if (needRun && !hasRun) return;
        const left = cards.filter(c => !used.has(c));
        const pts = total(left);
        if (!best || pts < best.points || (pts === best.points && chosen.length > best.melds.length))
          best = { melds: chosen.slice(), deadwood: left, points: pts };
        return;
      }
      const m = melds[i];
      if (m.cards.every(c => !used.has(c))) {
        m.cards.forEach(c => used.add(c));
        chosen.push(m);
        dfs(i + 1, used, chosen, hasRun || isLongRun(m));
        chosen.pop();
        m.cards.forEach(c => used.delete(c));
      }
      dfs(i + 1, used, chosen, hasRun);
    }
    dfs(0, new Set(), [], false);
    return best;
  }

  // Can these exactly-10 cards go out?
  function canGoOut(cards) {
    if (cards.length !== 10) return null;
    const b = bestArrangement(cards, true);
    return b && b.points === 0 && b.deadwood.length === 0 ? b : null;
  }

  // With 11 cards (after drawing): which discards let you call Rummy?
  function rummyDiscards(cards11) {
    const out = [];
    cards11.forEach((c, i) => {
      const rest = cards11.slice(0, i).concat(cards11.slice(i + 1));
      if (canGoOut(rest)) out.push(c);
    });
    return out;
  }

  // Points for the player who did not go out, with the arrangement used.
  function scoreHand(cards) {
    const withRun = bestArrangement(cards, true);
    if (withRun) return { points: withRun.points, melds: withRun.melds, deadwood: withRun.deadwood, hasRun: true };
    return { points: total(cards), melds: [], deadwood: cards.slice(), hasRun: false };
  }

  // Helpful view of a hand in progress: best melds (preferring ones with a run of 4).
  function analyse(cards) {
    const withRun = bestArrangement(cards, true);
    const any = bestArrangement(cards, false);
    if (withRun) return { melds: withRun.melds, deadwood: withRun.deadwood, points: withRun.points, hasRun: true };
    return { melds: any ? any.melds : [], deadwood: any ? any.deadwood : cards.slice(), points: total(cards), hasRun: false };
  }

  const NAMES = { 1: 'A', 11: 'J', 12: 'Q', 13: 'K' };
  const SYM = { S: '♠', H: '♥', D: '♦', C: '♣' };
  const label = c => (NAMES[rank(c)] || String(rank(c))) + SYM[suit(c)];

  function sortCards(cards, by) {
    const so = { S: 0, H: 1, C: 2, D: 3 };
    return cards.slice().sort((a, b) => by === 'rank'
      ? rank(a) - rank(b) || so[suit(a)] - so[suit(b)]
      : so[suit(a)] - so[suit(b)] || rank(a) - rank(b));
  }

  const api = { newDeck, shuffle, allMelds, bestArrangement, canGoOut, rummyDiscards, scoreHand, analyse, label, sortCards, rank, suit, value, total, SYM, NAMES };
  if (typeof module !== 'undefined') module.exports = api; else root.Rummy = api;
})(this);
