// Little hand-drawn illustrations around the chess pages: a potted plant, a sleeping cat and a cup of tea.
// Each one does something small when tapped.
(function () {
  const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const INK = '#6b4a33';
  const PLANT = `<svg viewBox="0 0 110 150"><g stroke="${INK}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
    <g class="leaves">
      <path d="M55 96 C50 70 40 52 22 44 C30 64 38 80 55 96Z" fill="#a8c29a"/><path d="M30 56 C38 66 46 78 54 92" fill="none"/>
      <path d="M57 96 C60 66 72 44 92 36 C88 60 78 80 57 96Z" fill="#94b585"/><path d="M86 44 C76 58 66 74 58 92" fill="none"/>
      <path d="M56 94 C54 62 56 36 62 14 C70 36 68 66 56 94Z" fill="#b6cfa6"/><path d="M61 22 C61 44 59 70 56 90" fill="none"/>
      <path d="M54 98 C40 86 22 84 8 90 C24 98 40 102 54 98Z" fill="#a0bd91"/>
    </g>
    <path d="M30 96 H82 L76 140 C75 144 72 146 68 146 H44 C40 146 37 144 36 140 Z" fill="#e0997a"/>
    <path d="M27 96 H85 V106 H27 Z" fill="#eaae92"/>
    <path d="M44 120 C48 116 52 124 56 120 C60 116 64 124 68 120" fill="none" stroke="#fff4e6" stroke-width="2"/></g></svg>`;
  const CAT = `<svg viewBox="0 0 150 90"><g stroke="${INK}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
    <path class="tail" d="M120 70 C140 70 146 50 134 42 C128 38 124 44 128 48" fill="none" stroke-width="7" stroke="#e7b98a"/>
    <path class="tail" d="M120 70 C140 70 146 50 134 42 C128 38 124 44 128 48" fill="none" stroke-width="2.4"/>
    <path d="M18 74 C14 46 46 28 82 30 C112 32 132 48 128 72 C126 82 112 84 96 84 H34 C24 84 19 80 18 74Z" fill="#f0c99c"/>
    <path d="M50 40 C60 46 64 58 62 70 M80 34 C86 44 88 56 86 70" fill="none" stroke="#d59f6c" stroke-width="3"/>
    <path d="M14 60 C10 40 24 26 40 30 C50 32 56 42 54 56 C52 70 40 76 28 74 C20 72 15 67 14 60Z" fill="#f0c99c"/>
    <path d="M18 36 L16 20 L30 30 M42 30 L50 18 L52 36" fill="#f0c99c"/>
    <path d="M24 50 Q28 53 32 50 M38 50 Q42 53 46 50" fill="none"/>
    <path d="M33 58 L35 60 L37 58" fill="none" stroke-width="2"/>
    <ellipse cx="24" cy="58" rx="4" ry="2.5" fill="#f2a08a" stroke="none"/><ellipse cx="45" cy="58" rx="4" ry="2.5" fill="#f2a08a" stroke="none"/></g></svg>`;
  const TEA = `<svg viewBox="0 0 120 110"><g stroke="${INK}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
    <g class="steam" fill="none" stroke="#c9b8a6"><path d="M44 30 C38 22 50 18 44 8"/><path d="M58 32 C52 22 64 18 58 6"/><path d="M72 30 C66 22 78 18 72 8"/></g>
    <ellipse cx="60" cy="96" rx="48" ry="9" fill="#d8e3ea"/>
    <path d="M26 44 H94 C94 70 82 88 60 88 C38 88 26 70 26 44Z" fill="#9bb4c9"/>
    <path d="M94 52 C110 52 110 74 92 72" fill="none" stroke-width="5" stroke="#9bb4c9"/><path d="M94 52 C110 52 110 74 92 72" fill="none"/>
    <ellipse cx="60" cy="44" rx="34" ry="6" fill="#c98f5e"/>
    <path d="M40 62 C44 58 48 66 52 62 C56 58 60 66 64 62 C68 58 72 66 76 62" fill="none" stroke="#fff4e6" stroke-width="2.2"/></g></svg>`;
  function bubble(el, text) {
    const r = el.getBoundingClientRect(), b = document.createElement('div'); b.className = 'bub'; b.textContent = text;
    b.style.left = Math.min(Math.max(r.left + r.width / 2, 90), innerWidth - 90) + 'px'; b.style.top = (r.top + 4) + 'px'; document.body.appendChild(b);
    if (reduce()) { setTimeout(() => b.remove(), 1600); return; }
    b.animate([{ transform: 'scale(.5)', opacity: 0 }, { transform: 'scale(1)', opacity: 1, offset: .2 }, { opacity: 1, offset: .8 }, { transform: 'translateY(-10px)', opacity: 0 }], { duration: 1800, easing: 'ease-out' }).onfinish = () => b.remove();
  }
  const pick = a => a[Math.floor(Math.random() * a.length)];
  function build() {
    const d = document.createElement('div'); d.className = 'illus'; d.setAttribute('aria-hidden', 'true');
    d.innerHTML = `<button class="il plant" tabindex="-1">${PLANT}</button><button class="il tea" tabindex="-1">${TEA}</button><button class="il cat" tabindex="-1">${CAT}</button>`;
    document.body.appendChild(d);
    d.addEventListener('click', e => {
      const b = e.target.closest('.il'); if (!b) return;
      const svg = b.querySelector('svg');
      if (b.classList.contains('plant')) { if (!reduce()) svg.querySelector('.leaves').animate([{ transform: 'rotate(0)' }, { transform: 'rotate(-5deg)' }, { transform: 'rotate(4deg)' }, { transform: 'rotate(-2deg)' }, { transform: 'rotate(0)' }], { duration: 900, easing: 'ease-in-out' }); bubble(b, pick(['Grow, little pawn', 'Photosynthesising…', 'Water me after this game'])); }
      if (b.classList.contains('tea')) { b.classList.remove('puff'); void b.offsetWidth; b.classList.add('puff'); bubble(b, pick(['Tea break?', 'Still warm', 'Sip and think'])); }
      if (b.classList.contains('cat')) { b.classList.remove('wake'); void b.offsetWidth; b.classList.add('wake'); bubble(b, pick(['Zzz…', 'Mrrp?', 'Five more minutes', 'Don’t move my king'])); }
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build); else build();
})();
