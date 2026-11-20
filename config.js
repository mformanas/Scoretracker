// Settings for the Rummy score tracker.
// Paste your Google Apps Script web-app URL between the quotes (see README.md).
window.SCORE_CONFIG = {
  apiUrl: 'https://script.google.com/macros/s/AKfycbyn_tXN5UfQhF2mPwvLT3W5kvlrOjYAQ7ToVE0GQ-dfeo86SV_0TiwHCbUpmzYKwhql/exec',
  names: ['Leah', 'Manas'], // fallback until the sheet loads; the sheet's header row wins
  lowWins: true             // Rummy: lowest score wins each hand
};
