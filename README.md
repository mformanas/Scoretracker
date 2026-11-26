# Adda: game night headquarters

Adda is a home for your game scoreboards. Each game has its own page (Rummy is the first), and each game can have many dashboards, such as **Leah vs Manas** or a three-player **Friday crew**. Scores live in one Google Sheet, so they're the same on every phone and laptop, and the site is hosted for free on GitHub Pages.

## What's where

| File | What it is |
| --- | --- |
| `index.html` | Adda, the home page listing every game |
| `rummy/index.html` | Rummy: all Rummy dashboards, plus a form to start a new one |
| `rummy/board.html?b=<id>` | One dashboard's scoreboard (2 or 3 players) |
| `rummy/play.html?b=<id>` | Play Rummy on your phones for that dashboard |
| `rummy/rummy.js` | Rummy rules |
| `config.js` | The one setting: your Google Sheet web app link |
| `apps-script/Code.gs` | The script that lets the site read and write the Google Sheet |
| `chess/index.html` | Chess: all chess dashboards, new and delete |
| `chess/board.html?b=<id>` | One chess dashboard: points (win 1, draw ½), streaks, the race chart, game history |
| `chess/play.html?b=<id>` | Play chess on two phones (or both on one), with legal moves highlighted |
| `chess/chess.js`, `chess/pieces.js` | Chess rules and the flat piece silhouettes |
| `chess/minimal.css` | The chess look: warm cream, peach board, coral accents |
| `chess/levels.js` | The 1–10 difficulty scale for computer boards |
| `chess/ai.js` | Adda's own chess engine for levels 1–3 (runs on the phone) |
| `chess/engine/` | Stockfish 18 lite (single-threaded WASM, GPL-3.0, see stockfish-COPYING.txt) for levels 4–10 |
| `play.html` | Old link, now forwards to the Leah vs Manas table |

## How the Google Sheet is organised

The script creates and manages three tabs:

| Tab | One row per | Columns |
| --- | --- | --- |
| **Boards** | dashboard | `board_id, game, name, player_1, player_2, player_3, low_wins, passcode_hash, created_at` |
| **Scores** | hand, for every dashboard | `board_id, hand_id, date, player_1_score, player_2_score, player_3_score, logged_at, note` |
| **Live games** | dashboard with a phone game in progress | `board_id, state, version, updated_at` |

- `board_id` links the tabs together. Filter **Scores** by `board_id` to see one dashboard.
- Passcodes are stored only as a scrambled hash, never as plain text.
- The original **Hands** and **Game** tabs were copied into the `leah-manas` dashboard the first time the new script ran. They're left untouched as a backup; you can delete them once you're happy.
- A chess board can be made against the computer: player 2 is "Computer" and **Boards** column `cpu_level` holds its difficulty (1–10, fixed when the board is made). Its games are scored like any other board.
- Older test games against the computer on two-person boards have a `hand_id` starting with `ai`; they are left out of totals.
- Deleting a dashboard (trash button on the Rummy page, needs its passcode) only fills in its `deleted_at` date in **Boards**. Its hands stay in **Scores**; clear the date to bring it back.
- Avoid editing `board_id` and `hand_id` by hand. Renaming a player in **Boards** renames them everywhere.

## Passcodes

- Each dashboard has its own passcode, chosen when it's created. Anyone with it can log hands and play on that dashboard.
- The `PASSCODE` at the top of `Code.gs` is the master passcode: it works for every dashboard and is also the Leah vs Manas passcode.
- Anyone with the link can *see* scores. Only someone with the passcode can change them.

## Adding another game later

1. Add it to `GAMES` near the top of `Code.gs`, e.g. `scrabble: { name: 'Scrabble', minPlayers: 2, maxPlayers: 3, lowWins: false }`.
2. Copy the `rummy/` folder to a new folder for that game and adjust the pages.
3. Add a tile for it on `index.html`.
Its dashboards and scores go into the same three tabs, tagged with the game name.

## One-time setup (already done for this site)

1. Create a Google Sheet, open **Extensions → Apps Script**, paste in [`apps-script/Code.gs`](apps-script/Code.gs) and set `PASSCODE`.
2. **Deploy → New deployment → Web app**, Execute as **Me**, access **Anyone**. Copy the `/exec` URL.
3. Paste that URL into `config.js` as `apiUrl`.
4. **If you change `Code.gs` later:** go to **Deploy → Manage deployments**, click the pencil, choose **Version: New version** and **Deploy**. The URL stays the same.

## Playing Rummy on your phones

Tap **Play a game** on a dashboard. Each player opens it on their own phone and picks who they are once.

- 10 cards each from one 52-card deck (no jokers; Ace is low, so A-2-3 but not Q-K-A). With 3 players, turns go around in order.
- On your turn, draw from the deck or take the top of the discard pile, then throw a card away.
- **Call Rummy** when your 10 cards form a run of 4 plus two runs or sets of 3.
- Everyone else counts their cards: with a run of 4, their other runs and sets don't count, only leftover cards; without a run of 4, every card counts. A = 1, J = 11, Q = 12, K = 13.
- After a game, tap **Add to scoreboard** to log it as a hand on that dashboard.
