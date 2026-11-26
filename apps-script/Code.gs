/**
 * Adda: Google Sheets backend for all games and dashboards.
 *
 * Tabs (created automatically):
 *   Boards      one row per dashboard
 *               board_id | game | name | player_1 | player_2 | player_3 | low_wins | passcode_hash | created_at | deleted_at
 *               (a deleted dashboard only gets a deleted_at date; its hands stay in Scores. Clear the date to bring it back.)
 *   Scores      one row per hand, tagged with its dashboard
 *               board_id | hand_id | date | player_1_score | player_2_score | player_3_score | logged_at | note
 *               (note says how a game ended, e.g. "checkmate · 34 moves · Leah white")
 *               hand_id starting with "ai" = a game against the computer: the player's score is 1 / 0.5 / 0,
 *               the other player's is -1 (not playing). These are left out of dashboard totals.
 *   Live games  one row per dashboard with a phone game in progress
 *               board_id | state (JSON) | version | updated_at
 *
 * The first time the script runs it copies the old "Hands" and "Game" tabs into
 * the "leah-manas" dashboard. The old tabs are left untouched as a backup.
 *
 * Reading scores is open to anyone with the link. Every change needs the
 * dashboard's own passcode (stored only as a hash) or the master PASSCODE below.
 */

// Master passcode: works for every dashboard. It is also the passcode of "Leah vs Manas".
const PASSCODE = 'CHANGE-ME';

const GAMES = {
  rummy: { name: 'Rummy', minPlayers: 2, maxPlayers: 3, lowWins: true },
  chess: { name: 'Chess', minPlayers: 2, maxPlayers: 2, lowWins: false }, // win = 1, draw = ½ each
};
const MAX_PLAYERS = 3;
const LEGACY_BOARD = 'leah-manas';

const T = { BOARDS: 'Boards', SCORES: 'Scores', LIVE: 'Live games' };
const BOARD_HEAD = ['board_id', 'game', 'name', 'player_1', 'player_2', 'player_3', 'low_wins', 'passcode_hash', 'created_at', 'deleted_at'];
const SCORE_HEAD = ['board_id', 'hand_id', 'date', 'player_1_score', 'player_2_score', 'player_3_score', 'logged_at', 'note'];
const LIVE_HEAD = ['board_id', 'state', 'version', 'updated_at'];

// ---------------- web app ----------------

function doGet(e) {
  ensureSetup_();
  const p = (e && e.parameter) || {};
  if (p.action === 'boards') return json_({ ok: true, boards: listBoards_(p.game) });
  const board = getBoard_(p.board || LEGACY_BOARD);
  if (!board) return json_({ ok: false, error: 'no_board' });
  return json_({ ok: true, board: publicBoard_(board), names: board.players, entries: readScores_(board) });
}

function doPost(e) {
  let body;
  try { body = JSON.parse(e.postData.contents); } catch (err) { return json_({ ok: false, error: 'bad_json' }); }
  ensureSetup_();

  if (body.action === 'board_create') return createBoard_(body);

  const board = getBoard_(body.board || LEGACY_BOARD);
  if (!board) return json_({ ok: false, error: 'no_board' });
  if (!authOk_(board, body.key)) return json_({ ok: false, error: 'bad_key' });

  if (body.action === 'game_get') return json_({ ok: true, ...readLive_(board.id) });
  if (body.action === 'check') return json_({ ok: true, board: publicBoard_(board) });
  if (body.action === 'board_delete') return deleteBoard_(board);

  const lock = LockService.getScriptLock();
  if (!lock.tryLock(20000)) return json_({ ok: false, error: 'busy' });
  try {
    switch (body.action) {
      case 'game_put': return putLive_(board.id, body);
      case 'add': {
        const en = clean_(body.entry, board);
        if (!en) return json_({ ok: false, error: 'bad_entry' });
        if (en.note) noteHead_();
        if (rowOfHand_(board.id, en.id) < 0) sheet_(T.SCORES).appendRow(scoreRow_(board.id, en));
        break;
      }
      case 'update': {
        const en = clean_(body.entry, board);
        if (!en) return json_({ ok: false, error: 'bad_entry' });
        const r = rowOfHand_(board.id, en.id);
        if (r < 0) sheet_(T.SCORES).appendRow(scoreRow_(board.id, en));
        else sheet_(T.SCORES).getRange(r, 3, 1, 1 + MAX_PLAYERS).setValues([scoreRow_(board.id, en).slice(2, 3 + MAX_PLAYERS)]); // keep logged_at
        break;
      }
      case 'delete': {
        const r = rowOfHand_(board.id, String(body.id || ''));
        if (r > 0) sheet_(T.SCORES).deleteRow(r);
        break;
      }
      case 'replace': {
        const list = (body.entries || []).map(x => clean_(x, board)).filter(Boolean);
        const sh = sheet_(T.SCORES);
        const ids = colValues_(sh, 1);
        for (let i = ids.length - 1; i >= 0; i--) if (ids[i] === board.id) sh.deleteRow(i + 2);
        list.forEach(en => sh.appendRow(scoreRow_(board.id, en)));
        break;
      }
      default:
        return json_({ ok: false, error: 'bad_action' });
    }
    SpreadsheetApp.flush();
    return json_({ ok: true, board: publicBoard_(board), names: board.players, entries: readScores_(board) });
  } finally {
    lock.releaseLock();
  }
}

// ---------------- dashboards ----------------

function createBoard_(body) {
  const game = String(body.game || '');
  const g = GAMES[game];
  if (!g) return json_({ ok: false, error: 'bad_game' });
  const players = (body.players || []).map(s => String(s || '').trim().slice(0, 24)).filter(Boolean);
  if (players.length < g.minPlayers || players.length > g.maxPlayers) return json_({ ok: false, error: 'bad_players' });
  if (new Set(players.map(s => s.toLowerCase())).size !== players.length) return json_({ ok: false, error: 'same_names' });
  const pass = String(body.passcode || '');
  if (pass.length < 4) return json_({ ok: false, error: 'short_passcode' });
  const name = String(body.name || '').trim().slice(0, 40) || players.join(' vs ');
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(20000)) return json_({ ok: false, error: 'busy' });
  try {
    let id = slug_(players.join('-')) || 'board';
    while (boardRow_(id, true) > 0) id = id.replace(/-[a-z0-9]{4}$/, '') + '-' + Math.random().toString(36).slice(2, 6);
    const row = [id, game, name].concat(pad_(players, MAX_PLAYERS, '')).concat([g.lowWins, hash_(pass), new Date(), '']);
    sheet_(T.BOARDS).appendRow(row);
    SpreadsheetApp.flush();
    return json_({ ok: true, board: publicBoard_(getBoard_(id)) });
  } finally {
    lock.releaseLock();
  }
}

function listBoards_(game) {
  const v = sheet_(T.BOARDS).getDataRange().getValues().slice(1);
  const counts = {}, totals = {}, sh = sheet_(T.SCORES), n = sh.getLastRow() - 1;
  if (n > 0) sh.getRange(2, 1, n, 3 + MAX_PLAYERS).getValues().forEach(r => {
    const id = String(r[0]);
    if (String(r[1]).startsWith('ai')) return;   // games against the computer have their own record
    counts[id] = (counts[id] || 0) + 1;
    const t = totals[id] || (totals[id] = Array(MAX_PLAYERS).fill(0));
    for (let i = 0; i < MAX_PLAYERS; i++) t[i] += Number(r[3 + i]) || 0;
  });
  return v.filter(r => r[0] && !isDeleted_(r) && (!game || r[1] === game)).map(r => {
    const b = boardFromRow_(r);
    return { ...publicBoard_(b), hands: counts[b.id] || 0, totals: (totals[b.id] || []).slice(0, b.players.length) };
  });
}

function getBoard_(id) {
  const r = boardRow_(id, false);
  return r > 0 ? boardFromRow_(sheet_(T.BOARDS).getRange(r, 1, 1, BOARD_HEAD.length).getValues()[0]) : null;
}

// Row number of a dashboard in Boards, or -1. Deleted ones count only when asked.
function boardRow_(id, withDeleted) {
  const v = sheet_(T.BOARDS).getDataRange().getValues();
  for (let i = 1; i < v.length; i++) if (String(v[i][0]) === String(id) && (withDeleted || !isDeleted_(v[i]))) return i + 1;
  return -1;
}

function isDeleted_(r) { return r.length > BOARD_HEAD.length - 1 && r[BOARD_HEAD.length - 1] !== '' && r[BOARD_HEAD.length - 1] != null; }

// Hides a dashboard. Nothing is erased: its hands stay in Scores and the row stays in Boards.
function deleteBoard_(board) {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(20000)) return json_({ ok: false, error: 'busy' });
  try {
    const sh = sheet_(T.BOARDS), r = boardRow_(board.id, false);
    if (r < 0) return json_({ ok: false, error: 'no_board' });
    if (String(sh.getRange(1, BOARD_HEAD.length).getValues()[0][0]) === '') sh.getRange(1, BOARD_HEAD.length).setValue('deleted_at').setFontWeight('bold');
    sh.getRange(r, BOARD_HEAD.length).setValue(new Date());
    SpreadsheetApp.flush();
    return json_({ ok: true });
  } finally {
    lock.releaseLock();
  }
}

function boardFromRow_(r) {
  return {
    id: String(r[0]), game: String(r[1]), name: String(r[2]),
    players: r.slice(3, 3 + MAX_PLAYERS).map(String).filter(Boolean),
    lowWins: r[3 + MAX_PLAYERS] === true || String(r[3 + MAX_PLAYERS]).toUpperCase() === 'TRUE',
    hash: String(r[4 + MAX_PLAYERS] || ''),
    created: r[5 + MAX_PLAYERS] instanceof Date ? r[5 + MAX_PLAYERS].getTime() : 0,
  };
}

function publicBoard_(b) {
  return { id: b.id, game: b.game, name: b.name, players: b.players, lowWins: b.lowWins, created: b.created };
}

function authOk_(board, key) {
  key = String(key || '');
  if (!key) return false;
  return key === PASSCODE || (board.hash && hash_(key) === board.hash);
}

// ---------------- scores ----------------

function readScores_(board) {
  const sh = sheet_(T.SCORES);
  const v = sh.getDataRange().getValues().slice(1);
  const tz = SpreadsheetApp.getActive().getSpreadsheetTimeZone();
  const n = board.players.length;
  return v.filter(r => String(r[0]) === board.id && r[1] !== '' && r[2] !== '').map(r => {
    const s = r.slice(3, 3 + n).map(x => Number(x) || 0);
    const t = r[3 + MAX_PLAYERS];
    return {
      id: String(r[1]),
      d: r[2] instanceof Date ? Utilities.formatDate(r[2], tz, 'yyyy-MM-dd') : String(r[2]).trim(),
      g: board.game,
      s,
      a: s[0], b: s[1], // kept for older pages
      t: t instanceof Date ? t.getTime() : (Number(t) || 0),
      note: String(r[4 + MAX_PLAYERS] || ''),
    };
  });
}

function clean_(en, board) {
  if (!en || !en.id || !/^\d{4}-\d{2}-\d{2}$/.test(String(en.d))) return null;
  const n = board.players.length;
  let s = Array.isArray(en.s) ? en.s : [en.a, en.b];
  s = s.slice(0, n).map(Number);
  while (s.length < n) s.push(0);
  if (!s.every(x => isFinite(x))) return null;
  const t = Number(en.t);
  return { id: String(en.id).slice(0, 40), d: String(en.d), s, t: t > 0 ? t : 0, note: String(en.note || '').slice(0, 80) };
}

function scoreRow_(boardId, en) {
  return [boardId, en.id, en.d].concat(pad_(en.s, MAX_PLAYERS, '')).concat([en.t ? new Date(en.t) : new Date(), en.note || '']);
}

// older sheets were made before the note column existed
function noteHead_() {
  const sh = sheet_(T.SCORES), c = SCORE_HEAD.length;
  if (String(sh.getRange(1, c).getValues()[0][0]) === '') sh.getRange(1, c).setValue('note').setFontWeight('bold');
}

function rowOfHand_(boardId, handId) {
  const sh = sheet_(T.SCORES);
  const n = sh.getLastRow() - 1;
  if (n < 1) return -1;
  const v = sh.getRange(2, 1, n, 2).getValues();
  for (let i = 0; i < v.length; i++) if (String(v[i][0]) === boardId && String(v[i][1]) === handId) return i + 2;
  return -1;
}

// ---------------- live phone games ----------------

function readLive_(boardId, fresh) {
  const cache = CacheService.getScriptCache(), ck = 'live:' + boardId;
  if (!fresh) {
    const hit = cache.get(ck);
    if (hit) { try { return JSON.parse(hit); } catch (e) {} }
  }
  const r = rowOfLive_(boardId);
  let out = { game: null, ver: 0 };
  if (r > 0) {
    const v = sheet_(T.LIVE).getRange(r, 2, 1, 2).getValues()[0];
    let game = null;
    try { game = JSON.parse(String(v[0] || 'null')); } catch (e) { game = null; }
    out = { game, ver: Number(v[1]) || 0 };
  }
  try { cache.put(ck, JSON.stringify(out), 21600); } catch (e) {}
  return out;
}

function putLive_(boardId, body) {
  const cur = readLive_(boardId, true);
  if (Number(body.ver) !== cur.ver) return json_({ ok: false, error: 'conflict', ...cur });
  const txt = JSON.stringify(body.game || null);
  if (txt.length > 45000) return json_({ ok: false, error: 'too_big' });
  const sh = sheet_(T.LIVE);
  const r = rowOfLive_(boardId);
  const row = [boardId, txt, cur.ver + 1, new Date()];
  if (r > 0) sh.getRange(r, 1, 1, 4).setValues([row]); else sh.appendRow(row);
  const out = { game: body.game || null, ver: cur.ver + 1 };
  try { CacheService.getScriptCache().put('live:' + boardId, JSON.stringify(out), 21600); } catch (e) {}
  return json_({ ok: true, ...out });
}

function rowOfLive_(boardId) {
  const ids = colValues_(sheet_(T.LIVE), 1);
  const i = ids.indexOf(boardId);
  return i < 0 ? -1 : i + 2;
}

// ---------------- setup and one-time copy of the old tabs ----------------

function setup() { ensureSetup_(); return 'Ready'; }

function ensureSetup_() {
  const ss = SpreadsheetApp.getActive();
  if (ss.getSheetByName(T.BOARDS) && ss.getSheetByName(T.SCORES) && ss.getSheetByName(T.LIVE)) return;
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    if (!ss.getSheetByName(T.BOARDS)) {
      const b = makeSheet_(T.BOARDS, BOARD_HEAD, 'A:C');
      const old = ss.getSheetByName('Hands');
      const head = old ? old.getRange(1, 1, 1, 5).getValues()[0] : [];
      const names = [String(head[3] || 'Leah'), String(head[4] || 'Manas')];
      b.appendRow([LEGACY_BOARD, 'rummy', names.join(' vs ')].concat(pad_(names, MAX_PLAYERS, '')).concat([true, hash_(PASSCODE), new Date()]));
    }
    if (!ss.getSheetByName(T.SCORES)) {
      const s = makeSheet_(T.SCORES, SCORE_HEAD, 'A:C');
      const old = ss.getSheetByName('Hands');
      if (old && old.getLastRow() > 1) {
        const tz = ss.getSpreadsheetTimeZone();
        const rows = old.getRange(2, 1, old.getLastRow() - 1, 6).getValues()
          .filter(r => r[0] !== '' && r[1] !== '')
          .map(r => [LEGACY_BOARD, String(r[0]),
            r[1] instanceof Date ? Utilities.formatDate(r[1], tz, 'yyyy-MM-dd') : String(r[1]).trim(),
            Number(r[3]) || 0, Number(r[4]) || 0, '', r[5] instanceof Date ? r[5] : (Number(r[5]) > 0 ? new Date(Number(r[5])) : '')]);
        if (rows.length) s.getRange(2, 1, rows.length, SCORE_HEAD.length).setValues(rows);
      }
    }
    if (!ss.getSheetByName(T.LIVE)) {
      const l = makeSheet_(T.LIVE, LIVE_HEAD, 'A:A');
      l.getRange('B:B').setNumberFormat('@');
      const old = ss.getSheetByName('Game');
      if (old) {
        const v = old.getRange('A1:B1').getValues()[0];
        if (v[0] && String(v[0]) !== 'null') l.appendRow([LEGACY_BOARD, String(v[0]), Number(v[1]) || 0, new Date()]);
      }
    }
    SpreadsheetApp.flush();
  } finally {
    lock.releaseLock();
  }
}

// ---------------- helpers ----------------

function sheet_(name) { return SpreadsheetApp.getActive().getSheetByName(name); }

function makeSheet_(name, head, textCols) {
  const sh = SpreadsheetApp.getActive().insertSheet(name);
  sh.getRange(1, 1, 1, head.length).setValues([head]).setFontWeight('bold');
  sh.setFrozenRows(1);
  if (textCols) sh.getRange(textCols).setNumberFormat('@'); // ids and dates stay plain text
  return sh;
}

function colValues_(sh, col) {
  const n = sh.getLastRow() - 1;
  return n < 1 ? [] : sh.getRange(2, col, n, 1).getValues().map(r => String(r[0]));
}

function pad_(arr, n, fill) { const a = arr.slice(0, n); while (a.length < n) a.push(fill); return a; }

function slug_(s) { return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 30); }

function hash_(s) {
  return Utilities.base64Encode(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, 'adda:' + s, Utilities.Charset.UTF_8));
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
