/**
 * Rummy score tracker: Google Sheets backend.
 *
 * The sheet tab "Hands" is the database. One row per hand:
 *   id | date | game | <player 1> | <player 2> | logged_at
 * The two player names are read from the header cells D1 and E1,
 * so renaming those headers renames the players on the site.
 *
 * Reads are open to anyone with the web-app URL.
 * Every change needs the PASSCODE below.
 */

// 1) Change this before you deploy. Anyone who knows it can add or delete hands.
const PASSCODE = 'CHANGE-ME';

const TAB = 'Hands';
const HEADERS = ['id', 'date', 'game', 'Leah', 'Manas', 'logged_at'];

// Hands that were already logged before the sheet existed.
const SEED = [
  ['r1', '2026-11-19', 'Rummy', 13, 0],
  ['r2', '2026-11-19', 'Rummy', 14, 0],
  ['r3', '2026-11-19', 'Rummy', 28, 0],
  ['r4', '2026-11-19', 'Rummy', 64, 0],
];

/** Run once from the Apps Script editor: creates the tab and adds the existing hands. */
function setup() {
  const sh = sheet_();
  if (sh.getLastRow() < 2) {
    const now = new Date();
    sh.getRange(2, 1, SEED.length, HEADERS.length).setValues(SEED.map(r => r.concat([now])));
  }
  return 'Ready: ' + (sh.getLastRow() - 1) + ' hands in the sheet';
}

function doGet() {
  return json_({ ok: true, ...read_() });
}

function doPost(e) {
  let body;
  try { body = JSON.parse(e.postData.contents); } catch (err) { return json_({ ok: false, error: 'bad_json' }); }
  if (String(body.key || '') !== PASSCODE) return json_({ ok: false, error: 'bad_key' });

  if (body.action === 'game_get') return json_({ ok: true, ...readGame_() });

  const lock = LockService.getScriptLock();
  if (!lock.tryLock(20000)) return json_({ ok: false, error: 'busy' });
  try {
    const sh = sheet_();
    switch (body.action) {
      case 'check':
        break;
      case 'game_put': {
        const cur = readGame_();
        if (Number(body.ver) !== cur.ver) return json_({ ok: false, error: 'conflict', ...cur });
        const txt = JSON.stringify(body.game || null);
        if (txt.length > 45000) return json_({ ok: false, error: 'too_big' });
        const gs = gameSheet_();
        gs.getRange('A1:B1').setValues([[txt, cur.ver + 1]]);
        SpreadsheetApp.flush();
        return json_({ ok: true, ...readGame_() });
      }
      case 'add': {
        const en = clean_(body.entry);
        if (!en) return json_({ ok: false, error: 'bad_entry' });
        if (rowOf_(sh, en.id) < 0) sh.appendRow(toRow_(en));
        break;
      }
      case 'update': {
        const en = clean_(body.entry);
        if (!en) return json_({ ok: false, error: 'bad_entry' });
        const r = rowOf_(sh, en.id);
        if (r < 0) sh.appendRow(toRow_(en));
        else sh.getRange(r, 1, 1, 5).setValues([toRow_(en).slice(0, 5)]); // keep the original logged_at
        break;
      }
      case 'delete': {
        const r = rowOf_(sh, String(body.id || ''));
        if (r > 0) sh.deleteRow(r);
        break;
      }
      case 'replace': {
        const list = (body.entries || []).map(clean_).filter(Boolean);
        if (sh.getLastRow() > 1) sh.getRange(2, 1, sh.getLastRow() - 1, HEADERS.length).clearContent();
        if (list.length) sh.getRange(2, 1, list.length, HEADERS.length).setValues(list.map(toRow_));
        break;
      }
      default:
        return json_({ ok: false, error: 'bad_action' });
    }
    SpreadsheetApp.flush();
    return json_({ ok: true, ...read_() });
  } finally {
    lock.releaseLock();
  }
}

// ---------- helpers ----------

// The digital game lives in its own tab: A1 = game state (JSON), B1 = version number.
function gameSheet_() {
  const ss = SpreadsheetApp.getActive();
  let gs = ss.getSheetByName('Game');
  if (!gs) {
    gs = ss.insertSheet('Game');
    gs.getRange('A1:B1').setValues([['null', 0]]);
    gs.getRange('A1').setNumberFormat('@');
  }
  return gs;
}

function readGame_() {
  const v = gameSheet_().getRange('A1:B1').getValues()[0];
  let game = null;
  try { game = JSON.parse(String(v[0] || 'null')); } catch (e) { game = null; }
  return { game, ver: Number(v[1]) || 0 };
}

function sheet_() {
  const ss = SpreadsheetApp.getActive();
  let sh = ss.getSheetByName(TAB);
  if (!sh) {
    sh = ss.insertSheet(TAB);
    sh.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]).setFontWeight('bold');
    sh.setFrozenRows(1);
    sh.getRange('A:B').setNumberFormat('@'); // keep ids and dates as plain text
  }
  return sh;
}

function read_() {
  const sh = sheet_();
  const values = sh.getDataRange().getValues();
  const head = values[0] || HEADERS;
  const tz = SpreadsheetApp.getActive().getSpreadsheetTimeZone();
  const entries = values.slice(1).filter(r => r[0] !== '' && r[1] !== '').map(r => ({
    id: String(r[0]),
    d: r[1] instanceof Date ? Utilities.formatDate(r[1], tz, 'yyyy-MM-dd') : String(r[1]).trim(),
    g: String(r[2] || 'Rummy'),
    a: Number(r[3]) || 0,
    b: Number(r[4]) || 0,
    t: r[5] instanceof Date ? r[5].getTime() : (Number(r[5]) || 0),
  }));
  return { names: [String(head[3] || 'Player 1'), String(head[4] || 'Player 2')], entries };
}

function clean_(en) {
  if (!en || !en.id || !/^\d{4}-\d{2}-\d{2}$/.test(String(en.d))) return null;
  const a = Number(en.a), b = Number(en.b);
  if (!isFinite(a) || !isFinite(b)) return null;
  const t = Number(en.t);
  return { id: String(en.id).slice(0, 40), d: String(en.d), g: String(en.g || 'Rummy').slice(0, 40), a, b, t: t > 0 ? t : 0 };
}

function toRow_(en) {
  return [en.id, en.d, en.g, en.a, en.b, en.t ? new Date(en.t) : new Date()];
}

function rowOf_(sh, id) {
  const n = sh.getLastRow() - 1;
  if (n < 1) return -1;
  const ids = sh.getRange(2, 1, n, 1).getValues();
  for (let i = 0; i < ids.length; i++) if (String(ids[i][0]) === id) return i + 2;
  return -1;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
