// Starlight sky for the chess pages: tap a star to make a wish, tap the moon to wake it up,
// and now and then a shooting star goes by.
(function () {
  const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const WISHES = ['Make a wish!', 'Wish granted… maybe', 'A lucky move is coming', 'The stars are on your side', 'Twinkle twinkle, checkmate', 'Shh, the moon is watching'];
  function bubble(x, y, text) {
    const b = document.createElement('div'); b.className = 'bub'; b.textContent = text;
    b.style.left = Math.min(Math.max(x, 100), innerWidth - 100) + 'px'; b.style.top = (y - 8) + 'px'; document.body.appendChild(b);
    if (reduce()) { setTimeout(() => b.remove(), 1600); return; }
    b.animate([{ transform: 'scale(.4)', opacity: 0 }, { transform: 'scale(1.06)', opacity: 1, offset: .2 }, { transform: 'scale(1)', opacity: 1, offset: .8 }, { transform: 'translateY(-14px)', opacity: 0 }], { duration: 1800, easing: 'ease-out' }).onfinish = () => b.remove();
  }
  function sparks(x, y, n, cols) {
    if (reduce()) return;
    for (let k = 0; k < n; k++) {
      const s = document.createElement('i'); s.className = 'bit'; s.textContent = ['✦', '★', '✧', '·'][k % 4];
      s.style.color = cols[k % cols.length]; s.style.left = x + 'px'; s.style.top = y + 'px'; s.style.fontSize = (10 + Math.random() * 14) + 'px'; s.style.textShadow = '0 0 8px currentColor'; document.body.appendChild(s);
      const a = Math.random() * Math.PI * 2, v = 30 + Math.random() * 80;
      s.animate([{ transform: 'translate(-50%,-50%) scale(.3)', opacity: 1 }, { transform: `translate(calc(-50% + ${Math.cos(a) * v}px),calc(-50% + ${Math.sin(a) * v}px)) rotate(${Math.random() * 360}deg)`, opacity: 0 }], { duration: 800 + Math.random() * 600, easing: 'cubic-bezier(.2,.7,.3,1)' }).onfinish = () => s.remove();
    }
  }
  function shoot(sky) {
    if (reduce() || document.hidden) return;
    const s = document.createElement('i'); s.className = 'shoot'; const y = Math.random() * innerHeight * .5;
    s.style.left = (innerWidth * (.4 + Math.random() * .6)) + 'px'; s.style.top = y + 'px'; s.style.transform = 'rotate(155deg)'; sky.appendChild(s);
    s.animate([{ translate: '0 0', opacity: 0 }, { opacity: 1, offset: .2 }, { translate: '-340px 160px', opacity: 0 }], { duration: 1100, easing: 'ease-in' }).onfinish = () => s.remove();
  }
  function build() {
    const sky = document.createElement('div'); sky.className = 'sky'; sky.setAttribute('aria-hidden', 'true');
    let h = '';
    const spots = [[6, 18], [14, 64], [22, 8], [88, 30], [94, 72], [70, 12], [4, 88], [96, 92], [48, 4], [30, 94]];
    spots.forEach(([x, y], i) => { h += `<button class="st8" tabindex="-1" style="left:${x}%;top:${y}%;--z:${12 + (i % 3) * 5}px;--t:${2 + (i % 4) * .7}s;--d:-${i * .4}s">${i % 3 ? '✦' : '★'}</button>`; });
    h += `<button class="moon" tabindex="-1"><svg viewBox="0 0 64 64"><path d="M44 6a26 26 0 1 0 14 40A22 22 0 0 1 44 6z" fill="#ffe7a8" stroke="#ffd98a" stroke-width="2"/><g class="mface"><path d="M26 30q3 3 6 0" stroke="#7a5aa8" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="M14 36q3 3 6 0" stroke="#7a5aa8" stroke-width="2.4" fill="none" stroke-linecap="round"/><ellipse cx="18" cy="43" rx="3.5" ry="2" fill="#ff9ccf"/><ellipse cx="31" cy="38" rx="3.5" ry="2" fill="#ff9ccf"/><path d="M22 44q2 2 4 0" stroke="#7a5aa8" stroke-width="2" fill="none" stroke-linecap="round"/></g></svg></button>`;
    sky.innerHTML = h; document.body.prepend(sky);
    sky.addEventListener('click', e => {
      const st = e.target.closest('.st8'), mo = e.target.closest('.moon');
      if (st) {
        const r = st.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
        if (!reduce()) st.animate([{ transform: 'scale(1)' }, { transform: 'scale(2.6) rotate(180deg)' }, { transform: 'scale(1) rotate(360deg)' }], { duration: 700, easing: 'cubic-bezier(.3,1.5,.5,1)' });
        sparks(x, y, 14, ['#fff', '#ffd98a', '#ff9ccf', '#c3a9ff']); bubble(x, r.top, WISHES[Math.floor(Math.random() * WISHES.length)]);
      }
      if (mo) {
        const r = mo.getBoundingClientRect(), svg = mo.querySelector('svg');
        if (!reduce()) svg.animate([{ transform: 'rotate(0)' }, { transform: 'rotate(-25deg) scale(1.15)' }, { transform: 'rotate(18deg) scale(1.1)' }, { transform: 'rotate(0)' }], { duration: 900, easing: 'ease-in-out' });
        bubble(r.left + r.width / 2, r.top, ['Yawn… who woke me?', 'Good move, sleepyhead', 'Five more minutes…', 'Psst, watch the knight'][Math.floor(Math.random() * 4)]);
        sparks(r.left + r.width / 2, r.top + r.height / 2, 10, ['#ffe7a8', '#fff']);
        for (let i = 0; i < 3; i++) setTimeout(() => shoot(sky), i * 250);
      }
    });
    setInterval(() => { if (Math.random() < .5) shoot(sky); }, 7000);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build); else build();
})();
