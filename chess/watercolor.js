// Watercolour paint layer for the chess pages.
// Drag on empty paper to paint a brush stroke that slowly dries away; tap to leave a dab.
// window.Paint.stroke(x1,y1,x2,y2,colour) and Paint.splash(x,y,colour) are used by the game for moves and captures.
(function () {
  const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const NS = 'http://www.w3.org/2000/svg';
  const WASH = ['#e07a96', '#6c9bd2', '#8fb88a', '#e3b04b', '#b99ad8'];
  let svg, layer, k = 0;
  function build() {
    svg = document.createElementNS(NS, 'svg'); svg.setAttribute('class', 'paint'); svg.setAttribute('aria-hidden', 'true');
    svg.innerHTML = `<defs>
      <filter id="wc-edge" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="2" seed="3"/><feDisplacementMap in="SourceGraphic" scale="5"/></filter>
      <filter id="wc" x="-30%" y="-30%" width="160%" height="160%"><feTurbulence type="fractalNoise" baseFrequency=".05" numOctaves="3" seed="7" result="t"/><feDisplacementMap in="SourceGraphic" in2="t" scale="14" result="d"/><feGaussianBlur in="d" stdDeviation="1.4"/></filter>
    </defs><g class="layer"></g>`;
    document.body.prepend(svg); layer = svg.querySelector('.layer');
    // painting on empty paper
    let cur = null;
    // empty paper = anything that isn't a control, the board, or a card
    const empty = t => !t.closest('button,a,input,select,textarea,label,.board,.pcs,.card,.st,.box,.pl,.bd,.set,.strip,.moves,.g,.modal,.tabs,.face,.who,.new,.offer');
    addEventListener('pointerdown', e => {
      if (!empty(e.target) || reduce()) return;
      const c = WASH[k++ % WASH.length];
      cur = { pts: [[e.clientX, e.clientY]], path: brush(c, 16 + Math.random() * 10), c };
      document.body.style.userSelect = 'none'; document.body.style.webkitUserSelect = 'none';
    });
    addEventListener('pointermove', e => {
      if (!cur) return; const last = cur.pts[cur.pts.length - 1];
      if (Math.hypot(e.clientX - last[0], e.clientY - last[1]) < 4) return;
      cur.pts.push([e.clientX, e.clientY]); cur.path.setAttribute('d', smooth(cur.pts));
    });
    const end = () => { document.body.style.userSelect = ''; document.body.style.webkitUserSelect = ''; if (!cur) return; if (cur.pts.length < 3) { cur.path.remove(); dab(cur.pts[0][0], cur.pts[0][1], cur.c); } else dry(cur.path, 2600); cur = null; };
    addEventListener('pointerup', end); addEventListener('pointercancel', end);
  }
  function brush(c, w) {
    const p = document.createElementNS(NS, 'path');
    p.setAttribute('fill', 'none'); p.setAttribute('stroke', c); p.setAttribute('stroke-width', w); p.setAttribute('stroke-linecap', 'round'); p.setAttribute('stroke-linejoin', 'round');
    p.setAttribute('stroke-opacity', '.45'); p.setAttribute('filter', 'url(#wc)'); layer.appendChild(p); return p;
  }
  function smooth(pts) {
    if (pts.length < 2) return `M${pts[0][0]} ${pts[0][1]}`;
    let d = `M${pts[0][0]} ${pts[0][1]}`;
    for (let i = 1; i < pts.length - 1; i++) { const [x, y] = pts[i], [nx, ny] = pts[i + 1]; d += ` Q${x} ${y} ${(x + nx) / 2} ${(y + ny) / 2}`; }
    const l = pts[pts.length - 1]; return d + ` L${l[0]} ${l[1]}`;
  }
  function dry(el, ms) { el.animate([{ opacity: 1 }, { opacity: 1, offset: .5 }, { opacity: 0 }], { duration: ms, easing: 'ease-in', fill: 'forwards' }).onfinish = () => el.remove(); }
  function blob(x, y, r, c, o) {
    const e = document.createElementNS(NS, 'ellipse');
    e.setAttribute('cx', x); e.setAttribute('cy', y); e.setAttribute('rx', r); e.setAttribute('ry', r * (.75 + Math.random() * .4));
    e.setAttribute('fill', c); e.setAttribute('fill-opacity', o); e.setAttribute('filter', 'url(#wc)'); layer.appendChild(e); return e;
  }
  function dab(x, y, c) {
    if (reduce() || !layer) return;
    const e = blob(x, y, 18 + Math.random() * 10, c || WASH[k++ % WASH.length], .4);
    e.animate([{ transform: 'scale(.2)', transformOrigin: `${x}px ${y}px` }, { transform: 'scale(1)', transformOrigin: `${x}px ${y}px` }], { duration: 400, easing: 'ease-out' });
    dry(e, 2200);
  }
  // a brush stroke from one point to another, drawn on and then drying away
  function stroke(x1, y1, x2, y2, c) {
    if (reduce() || !layer) return;
    const mx = (x1 + x2) / 2 + (Math.random() - .5) * 30, my = (y1 + y2) / 2 + (Math.random() - .5) * 30;
    const p = brush(c, 26); p.setAttribute('stroke-opacity', '.6'); p.setAttribute('d', `M${x1} ${y1} Q${mx} ${my} ${x2} ${y2}`); p.setAttribute('pathLength', '1');
    p.style.strokeDasharray = '1'; p.style.strokeDashoffset = '1';
    p.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: 380, easing: 'ease-out', fill: 'forwards' });
    setTimeout(() => dry(p, 1800), 380);
  }
  function splash(x, y, c) {
    if (reduce() || !layer) return;
    const main = blob(x, y, 26, c, .45); dry(main, 2000);
    for (let i = 0; i < 9; i++) {
      const a = Math.random() * Math.PI * 2, d = 26 + Math.random() * 40, r = 3 + Math.random() * 6;
      const s = blob(x + Math.cos(a) * d, y + Math.sin(a) * d, r, c, .55);
      s.animate([{ transform: 'scale(0)', transformOrigin: `${x}px ${y}px` }, { transform: 'scale(1)', transformOrigin: `${x}px ${y}px` }], { duration: 300, easing: 'ease-out' });
      dry(s, 1800 + Math.random() * 600);
    }
  }
  window.Paint = { stroke, splash, dab };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build); else build();
})();
