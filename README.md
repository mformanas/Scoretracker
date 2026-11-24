# Leah vs Manas: Rummy score tracker

A card-table scoreboard for two players. Scores are stored in a Google Sheet, so they're the same on every phone and laptop, and the site is hosted for free on GitHub Pages.

- `index.html`: the whole site
- `config.js`: the one setting you fill in (your Google Sheet link)
- `apps-script/Code.gs`: the small script that lets the site read and write your Google Sheet

## One-time setup (about 5 minutes)

### 1. Create the sheet and add the script

1. Go to [sheets.new](https://sheets.new) to create a new Google Sheet. Name it something like **Rummy scores**.
2. In the sheet, open **Extensions → Apps Script**.
3. Delete the starter code in `Code.gs` and paste in everything from [`apps-script/Code.gs`](apps-script/Code.gs).
4. Near the top, change `const PASSCODE = 'CHANGE-ME';` to a passcode only the two of you know. Save (the disk icon or Ctrl/Cmd + S).
5. In the function dropdown at the top, choose **setup** and click **Run**. Approve the permission prompt; Google calls the app "unverified" because it's your own script. Click **Advanced → Go to (project name)**, then **Allow**.
   This creates a **Hands** tab with the 4 hands you've already played.

### 2. Publish the script as a web app

1. Click **Deploy → New deployment**.
2. Click the gear next to "Select type" and choose **Web app**.
3. Set **Execute as: Me** and **Who has access: Anyone**.
4. Click **Deploy**, then copy the **Web app URL** (it ends in `/exec`).

### 3. Connect the site to the sheet

1. In this repo on GitHub, open `config.js` and click the pencil icon to edit it.
2. Paste your Web app URL between the quotes on the `apiUrl:` line:
   ```js
   apiUrl: 'https://script.google.com/macros/s/XXXXXXXX/exec',
   ```
3. Click **Commit changes**. The site updates in about a minute.

### 4. Use it

Open the site and log a hand. The first time on each phone or laptop, it asks for your passcode once, then remembers it on that device.

## Good to know

- **The sheet is the database.** Each row is one hand: `id | date | game | Leah | Manas | logged_at`. You can view it any time. Avoid editing the `id` column by hand.
- **Changing names:** rename the `Leah` / `Manas` header cells (D1 and E1) in the sheet.
- **Offline or slow connection:** the site keeps your changes on the device and sends them to the sheet when it can reach it again. The line at the bottom of the page shows whether it's synced.
- **Other devices:** they pick up new hands when you reopen or switch back to the tab, and every minute while it's open.
- **Privacy:** anyone with the site link can *see* the scores. Only someone with the passcode can add, edit or delete hands.
- **If you change `Code.gs` later:** go to **Deploy → Manage deployments**, click the pencil, choose **Version: New version** and **Deploy**. The URL stays the same.

## Playing Rummy on your phones

Tap **Play a game** on the scoreboard (or open `play.html`). Each of you opens it on your own phone and picks who you are once.

- 10 cards each from one 52-card deck (no jokers; Ace is low, so A-2-3 but not Q-K-A).
- On your turn, draw from the deck or take the top of the discard pile, then throw a card away.
- **Call Rummy** when your 10 cards form a run of 4 plus two runs or sets of 3. The button lights up as soon as you can.
- The other player counts their cards: with a run of 4, their other runs and sets don't count, only leftover cards; without a run of 4, every card counts. A = 1, J = 11, Q = 12, K = 13.
- The game is stored in a **Game** tab in your Google Sheet and needs the same passcode. Digital games are kept separate from the scoreboard.
