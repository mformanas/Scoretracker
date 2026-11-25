// "Chai & Sakura" decorations for the chess pages: a toran of little flags across the top, two paper lanterns,
// a peacock and a lucky cat. Everything can be tapped, and petals drift down now and then.
(function () {
  const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const COLS = ['#ff9a1f', '#e6177a', '#0f9e9a', '#ffc22e', '#e8442e', '#23317a'];
  const pick = a => a[Math.floor(Math.random() * a.length)];
  function bubble(x, y, text) {
    document.querySelectorAll('.bub.deco-b').forEach(b => b.remove());
    const b = document.createElement('div'); b.className = 'bub deco-b'; b.textContent = text;
    b.style.left = Math.min(Math.max(x, 110), innerWidth - 110) + 'px'; b.style.top = Math.max(y - 8, 70) + 'px'; document.body.appendChild(b);
    if (reduce()) { setTimeout(() => b.remove(), 1700); return; }
    b.animate([{ transform: 'scale(.4) rotate(-6deg)', opacity: 0 }, { transform: 'scale(1.06)', opacity: 1, offset: .2 }, { transform: 'scale(1)', opacity: 1, offset: .8 }, { transform: 'translateY(-14px)', opacity: 0 }], { duration: 1900, easing: 'ease-out' }).onfinish = () => b.remove();
  }
  const SAKURA = c => `<svg viewBox="-20 -20 40 40"><g fill="${c}"><path id="pp" d="M0-2C-5-6-6-14 0-17 6-14 5-6 0-2z"/><use href="#pp" transform="rotate(72)"/><use href="#pp" transform="rotate(144)"/><use href="#pp" transform="rotate(216)"/><use href="#pp" transform="rotate(288)"/></g><circle r="3" fill="#ffc22e"/></svg>`;
  function petals(x, y, n, spread) {
    if (reduce()) return;
    for (let k = 0; k < n; k++) {
      const p = document.createElement('i'); p.className = 'petal';
      p.innerHTML = k % 2 ? SAKURA('#ff8fb1') : `<svg viewBox="-10 -10 20 20"><circle r="8" fill="#ff9a1f"/><circle r="3" fill="#e8442e"/></svg>`;
      p.style.left = x + 'px'; p.style.top = y + 'px'; document.body.appendChild(p);
      const a = Math.random() * Math.PI * 2, v = spread * (.4 + Math.random() * .6);
      p.animate([{ transform: 'translate(-50%,-50%) scale(.3) rotate(0)', opacity: 1 },
        { transform: `translate(calc(-50% + ${Math.cos(a) * v}px),calc(-50% + ${Math.sin(a) * v * .6}px)) scale(1) rotate(${Math.random() * 360}deg)`, opacity: 1, offset: .35 },
        { transform: `translate(calc(-50% + ${Math.cos(a) * v * 1.3 + (Math.random() - .5) * 60}px),calc(-50% + ${120 + Math.random() * 120}px)) rotate(${Math.random() * 720}deg)`, opacity: 0 }],
        { duration: 1600 + Math.random() * 900, easing: 'cubic-bezier(.3,.6,.5,1)' }).onfinish = () => p.remove();
    }
  }
  function drift() {
    if (reduce() || document.hidden) return;
    const p = document.createElement('i'); p.className = 'petal'; p.innerHTML = SAKURA(pick(['#ff8fb1', '#ffb7c9', '#ffc22e']));
    p.style.left = (Math.random() * innerWidth) + 'px'; document.body.appendChild(p);
    p.animate([{ transform: 'translate(0,0) rotate(0)' }, { transform: `translate(${(Math.random() - .5) * 200}px,${innerHeight + 40}px) rotate(${Math.random() * 900}deg)` }], { duration: 7000 + Math.random() * 4000, easing: 'linear' }).onfinish = () => p.remove();
  }
  function flag(i) {
    const c = COLS[i % COLS.length], c2 = COLS[(i + 2) % COLS.length];
    return `<button class="flag" tabindex="-1" style="--d:-${(i * .27).toFixed(2)}s"><svg viewBox="0 0 26 36"><path d="M2 0H24L13 26Z" fill="${c}" stroke="#23317a" stroke-width="1.6" stroke-linejoin="round"/><circle cx="13" cy="9" r="3" fill="${c2}"/><circle cx="13" cy="31" r="4" fill="#ffc22e" stroke="#23317a" stroke-width="1.4"/></svg></button>`;
  }
  const LANTERN = `<svg viewBox="0 0 40 76"><line x1="20" y1="0" x2="20" y2="10" stroke="#23317a" stroke-width="2"/><rect x="11" y="8" width="18" height="6" rx="2" fill="#23317a"/><ellipse cx="20" cy="34" rx="17" ry="21" fill="#e8442e" stroke="#23317a" stroke-width="2"/><path d="M6 26h28M4 34h32M6 42h28" stroke="#ffc22e" stroke-width="1.4" opacity=".8"/><circle cx="20" cy="34" r="6" fill="#fff6e6"/><circle cx="20" cy="34" r="2.6" fill="#e6177a"/><rect x="11" y="53" width="18" height="6" rx="2" fill="#23317a"/><path d="M16 59v14M20 59v16M24 59v14" stroke="#ffc22e" stroke-width="2" stroke-linecap="round"/></svg>`;
  const PEACOCK = `<svg viewBox="0 0 84 70"><g class="tail">${Array.from({ length: 7 }, (_, i) => { const a = (-75 + i * 25) * Math.PI / 180, x = 22 + Math.sin(a) * 40, y = 56 - Math.cos(a) * 40; return `<line x1="22" y1="56" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="#0f9e9a" stroke-width="3"/><ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="8" ry="10" transform="rotate(${-75 + i * 25} ${x.toFixed(1)} ${y.toFixed(1)})" fill="#0f9e9a" stroke="#23317a" stroke-width="1.5"/><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4.5" fill="#ffc22e"/><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2.2" fill="#23317a"/>`; }).join('')}</g><g class="pbody"><path d="M18 66 C14 52 20 40 32 40 C34 30 36 22 42 20 C48 18 50 24 46 28 C42 32 42 40 44 48 C48 60 40 68 18 66Z" fill="#2b6fd6" stroke="#23317a" stroke-width="2"/><circle cx="44" cy="23" r="1.8" fill="#fff"/><path d="M48 24 L54 25 L48 27Z" fill="#ff9a1f" stroke="#23317a" stroke-width="1"/><path d="M42 18 L40 12 M44 18 L45 11 M46 19 L50 13" stroke="#23317a" stroke-width="1.4"/><circle cx="40" cy="12" r="1.6" fill="#ffc22e"/><circle cx="45" cy="11" r="1.6" fill="#ffc22e"/><circle cx="50" cy="13" r="1.6" fill="#ffc22e"/><ellipse cx="40" cy="27" rx="2.4" ry="1.4" fill="#ff8fb1"/></g></svg>`;
  const CAT = `<svg viewBox="0 0 62 70"><g class="paw"><rect x="40" y="12" width="12" height="30" rx="6" fill="#fff6e6" stroke="#23317a" stroke-width="2"/><path d="M42 16h8" stroke="#ff8fb1" stroke-width="2"/></g><ellipse cx="28" cy="52" rx="22" ry="17" fill="#fff6e6" stroke="#23317a" stroke-width="2"/><path d="M10 22 L12 6 L22 16Z M46 22 L44 6 L34 16Z" fill="#fff6e6" stroke="#23317a" stroke-width="2" stroke-linejoin="round"/><path d="M13 10 L14 16 L19 15Z" fill="#ff8fb1"/><circle cx="28" cy="26" r="17" fill="#fff6e6" stroke="#23317a" stroke-width="2"/><path d="M19 24q3 3 6 0M31 24q3 3 6 0" stroke="#23317a" stroke-width="2" fill="none" stroke-linecap="round"/><ellipse cx="17" cy="30" rx="3" ry="2" fill="#ff8fb1"/><ellipse cx="39" cy="30" rx="3" ry="2" fill="#ff8fb1"/><path d="M25 31q3 3 6 0" stroke="#23317a" stroke-width="1.6" fill="none"/><circle cx="28" cy="15" r="2.4" fill="#e6177a"/><path d="M12 41 Q28 48 44 41" stroke="#e8442e" stroke-width="4" fill="none" stroke-linecap="round"/><circle cx="28" cy="46" r="4" fill="#ffc22e" stroke="#23317a" stroke-width="1.5"/><ellipse cx="28" cy="58" rx="9" ry="6" fill="#ffc22e" stroke="#23317a" stroke-width="1.5"/><text x="28" y="61" text-anchor="middle" font-size="7" font-weight="700" fill="#e8442e">福</text></svg>`;
  function build() {
    const d = document.createElement('div'); d.className = 'deco'; d.setAttribute('aria-hidden', 'true');
    d.innerHTML = `<div class="toran">${Array.from({ length: 16 }, (_, i) => flag(i)).join('')}</div>` +
      `<button class="lantern l" tabindex="-1">${LANTERN}</button><button class="lantern r" tabindex="-1">${LANTERN}</button>` +
      `<button class="peacock" tabindex="-1">${PEACOCK}</button><button class="cat" tabindex="-1">${CAT}</button>`;
    document.body.prepend(d);
    d.addEventListener('click', e => {
      const f = e.target.closest('.flag'), l = e.target.closest('.lantern'), p = e.target.closest('.peacock'), c = e.target.closest('.cat');
      const at = el => { const r = el.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2, r.top]; };
      if (f) { const [x, y] = at(f); if (!reduce()) f.animate([{ transform: 'rotate(0)' }, { transform: 'rotate(360deg) scale(1.3)' }, { transform: 'rotate(720deg)' }], { duration: 800, easing: 'cubic-bezier(.3,1.4,.5,1)' }); petals(x, y + 10, 8, 50); }
      if (l) { const [x, y, top] = at(l); l.classList.add('lit'); setTimeout(() => l.classList.remove('lit'), 2200);
        if (!reduce()) l.animate([{ transform: 'rotate(0)' }, { transform: 'rotate(-28deg)' }, { transform: 'rotate(22deg)' }, { transform: 'rotate(-10deg)' }, { transform: 'rotate(0)' }], { duration: 1400, easing: 'ease-in-out' });
        bubble(x, top + 90, pick(['Lantern lit, luck on!', 'A glowing move awaits', 'Shine bright, little pawn', 'Light the way to checkmate'])); }
      if (p) { const [x, y, top] = at(p); p.classList.add('open'); setTimeout(() => p.classList.remove('open'), 2600); petals(x, y, 14, 90);
        bubble(x, top, pick(['Look at my feathers!', 'Dance like nobody’s watching', 'Strut like a queen', 'Monsoon is coming… so is checkmate'])); }
      if (c) { const [x, , top] = at(c); c.classList.add('fast'); setTimeout(() => c.classList.remove('fast'), 1800); petals(x, top + 20, 10, 60);
        bubble(x, top, pick(['Good luck! Meow', 'Fortune favours the bold', 'Lucky move incoming', 'Purr… play the knight'])); }
    });
    for (let i = 0; i < 3; i++) setTimeout(drift, i * 1500);
    setInterval(drift, 3500);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build); else build();
})();
