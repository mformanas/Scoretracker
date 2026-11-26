// Computer difficulty for chess boards played against the computer: one slider, 1 to 10.
// Levels 1-3 use Adda's own small engine (ai.js); 4-10 use Stockfish at rising skill.
(function () {
  const NAMES = ['Beginner', 'Novice', 'Casual', 'Club player', 'Solid', 'Strong', 'Expert', 'Master', 'Grandmaster', 'Unbeatable'];
  const SF = { 4: 2, 5: 5, 6: 8, 7: 11, 8: 14, 9: 17, 10: 20 };
  const clamp = n => Math.max(1, Math.min(10, Math.round(Number(n) || 1)));
  window.ChessLevels = {
    NAMES,
    name: n => NAMES[clamp(n) - 1],
    label: n => 'Level ' + clamp(n) + ' · ' + NAMES[clamp(n) - 1],
    // {ai:'easy'|'medium'|'hard'} or {sf:skill 0-20}
    engine: n => { n = clamp(n); return n <= 3 ? { ai: ['easy', 'medium', 'hard'][n - 1] } : { sf: SF[n] }; },
  };
})();
