// 3D chess board for the play page (three.js, bundled in ./vendor).
// A polished walnut and maple board with turned "Tuscany"-style pieces: glossy ebony against antiqued boxwood.
// The page keeps all the game rules; this file only draws, animates and reports taps.
import * as THREE from 'three';
import { RoomEnvironment } from './vendor/RoomEnvironment.js';
import { OrbitControls } from './vendor/OrbitControls.js';

const SQ = 1;                                  // one square = 1 unit; the board spans -4..4
const TOP = 0.0;                               // height of the playing surface
const pos = s => new THREE.Vector3((s & 7) - 3.5, TOP, (s >> 3) - 3.5);

// ---------- textures ----------
function grainCanvas(w, h, base, streak, opts = {}) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d');
  g.fillStyle = base; g.fillRect(0, 0, w, h);
  const n = opts.lines || 70;
  for (let i = 0; i < n; i++) {
    const x0 = Math.random() * w, amp = 2 + Math.random() * (opts.wave || 8), lw = .6 + Math.random() * (opts.thick || 2.2);
    g.strokeStyle = streak; g.globalAlpha = .08 + Math.random() * (opts.alpha || .22); g.lineWidth = lw; g.beginPath();
    for (let y = 0; y <= h; y += 8) { const x = x0 + Math.sin(y / (30 + Math.random() * 6) + i) * amp; y ? g.lineTo(x, y) : g.moveTo(x, y); }
    g.stroke();
  }
  g.globalAlpha = 1;
  return c;
}
function texFrom(canvas, repeat = 1) {
  const t = new THREE.CanvasTexture(canvas); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat, repeat); t.anisotropy = 8; return t;
}
function boardTexture() {
  const N = 1024, s = N / 8, c = document.createElement('canvas'); c.width = c.height = N; const g = c.getContext('2d');
  const light = grainCanvas(256, 256, '#dcb57a', '#a7783f', { lines: 46, wave: 6, alpha: .22 });
  const dark = grainCanvas(256, 256, '#5e3a20', '#2e1a0c', { lines: 50, wave: 7, alpha: .3 });
  for (let r = 0; r < 8; r++) for (let f = 0; f < 8; f++) {
    const src = (r + f) % 2 ? dark : light;
    g.save(); g.translate(f * s + s / 2, r * s + s / 2); g.rotate(((r * 7 + f * 3) % 2) ? Math.PI / 2 : 0);
    g.drawImage(src, (r * 37 + f * 53) % 120, (r * 61 + f * 17) % 120, 128, 128, -s / 2, -s / 2, s, s); g.restore();
  }
  g.strokeStyle = 'rgba(30,15,5,.35)'; g.lineWidth = 1.2;
  for (let i = 0; i <= 8; i++) { g.beginPath(); g.moveTo(i * s, 0); g.lineTo(i * s, N); g.stroke(); g.beginPath(); g.moveTo(0, i * s); g.lineTo(N, i * s); g.stroke(); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}
function radialTex(inner, outer) {
  const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d');
  const gr = g.createRadialGradient(64, 64, 4, 64, 64, 64); gr.addColorStop(0, inner); gr.addColorStop(1, outer);
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

// ---------- piece shapes ----------
const arc = (cx, cy, r, a0, a1, n = 10) => Array.from({ length: n + 1 }, (_, i) => { const a = a0 + (a1 - a0) * i / n; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r]; });
const BASE = [[0, 0], [.34, 0], [.355, .02], [.355, .05], [.33, .075], [.30, .085], [.305, .11], [.27, .135], [.24, .15]];
const PROFILES = {
  p: [...BASE, [.17, .2], [.13, .3], [.11, .38], [.16, .41], [.17, .43], [.15, .45], [.10, .47], ...arc(0, .6, .13, -Math.PI / 2.6, Math.PI / 2)],
  r: [...BASE, [.24, .2], [.21, .32], [.19, .52], [.2, .6], [.25, .64], [.26, .68], [.25, .78], [.25, .82], [.18, .82], [.18, .76], [0, .76]],
  b: [...BASE, [.19, .2], [.14, .34], [.11, .5], [.17, .54], [.18, .57], [.16, .6], [.10, .62], [.15, .68], [.16, .76], [.14, .84], [.10, .91], [.05, .96], [.03, .98], ...arc(0, 1.03, .045, -Math.PI / 2, Math.PI / 2, 6)],
  q: [...BASE, [.22, .2], [.16, .36], [.12, .6], [.19, .64], [.2, .67], [.18, .7], [.12, .72], [.13, .78], [.17, .9], [.2, .96], [.19, .99], [.15, .99], [.12, 1.0], ...arc(0, 1.05, .06, -Math.PI / 2, Math.PI / 2, 8)],
  k: [...BASE, [.22, .2], [.16, .38], [.13, .64], [.2, .68], [.21, .71], [.19, .74], [.13, .76], [.14, .82], [.19, .95], [.19, 1.0], [.14, 1.05], [.08, 1.09], [0, 1.1]],
  n: [...BASE, [.2, .2], [.2, .24], [0, .24]],
};
function knightHead() {
  // a carved horse head, extruded and bevelled; drawn from the 2D piece outline
  const P = (x, y) => [(x - 52) / 100 * 1.05, (74 - y) / 100 * 1.05 + .22];
  const s = new THREE.Shape();
  const m = (x, y) => s.moveTo(...P(x, y)), c = (a, b, cc, d, e, f) => s.bezierCurveTo(...P(a, b), ...P(cc, d), ...P(e, f)), l = (x, y) => s.lineTo(...P(x, y));
  m(32, 74); c(32, 60, 38, 54, 46, 48); c(38, 50, 30, 48, 28, 42); c(26, 34, 34, 28, 42, 24); c(46, 16, 52, 12, 56, 12);
  l(60, 6); l(63, 14); c(74, 20, 77, 44, 70, 74); l(32, 74);
  const g = new THREE.ExtrudeGeometry(s, { depth: .2, bevelEnabled: true, bevelThickness: .06, bevelSize: .045, bevelSegments: 4, curveSegments: 24 });
  g.translate(0, 0, -.1); return g;
}
function lathe(points) { return new THREE.LatheGeometry(points.map(([x, y]) => new THREE.Vector2(Math.max(0, x), y)), 48); }

// ---------- the scene ----------
export default function create(el, { onTap }) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = .9;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  el.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer); scene.environment = pmrem.fromScene(new RoomEnvironment(), .04).texture; scene.environmentIntensity = .55;
  const camera = new THREE.PerspectiveCamera(34, 1, .1, 100);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enablePan = false; controls.enableDamping = true; controls.dampingFactor = .08;
  controls.minPolarAngle = .25; controls.maxPolarAngle = 1.12; controls.minDistance = 12; controls.maxDistance = 22; controls.rotateSpeed = .6;
  controls.target.set(0, 0, 0);

  // light: a warm key light with soft shadows plus gentle fill
  const key = new THREE.DirectionalLight(0xffe9c8, 2.6); key.position.set(-4, 10, 5); key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048); Object.assign(key.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6, near: 1, far: 30 }); key.shadow.bias = -.0004; key.shadow.radius = 4;
  scene.add(key, new THREE.HemisphereLight(0xfff0dc, 0x2a180c, .35));

  // board: inlaid squares, a walnut frame and a bevelled base
  const squares = new THREE.Mesh(new THREE.BoxGeometry(8, .12, 8), [null, null, new THREE.MeshPhysicalMaterial({ map: boardTexture(), roughness: .45, clearcoat: .6, clearcoatRoughness: .3, envMapIntensity: .6 }), null, null, null].map(m => m || new THREE.MeshStandardMaterial({ color: 0x3e2414, roughness: .5 })));
  squares.position.y = TOP - .06; squares.receiveShadow = true; scene.add(squares);
  const frameTex = texFrom(grainCanvas(512, 512, '#3a1f0e', '#120804', { lines: 80, wave: 10, alpha: .4 }), 2);
  const frameMat = new THREE.MeshPhysicalMaterial({ map: frameTex, roughness: .4, clearcoat: .8, clearcoatRoughness: .25, envMapIntensity: .45 });
  const frame = new THREE.Mesh(new THREE.BoxGeometry(9.3, .34, 9.3), frameMat); frame.position.y = TOP - .2; frame.receiveShadow = true; frame.castShadow = true; scene.add(frame);
  const inlay = new THREE.Mesh(new THREE.BoxGeometry(8.16, .02, 8.16), new THREE.MeshStandardMaterial({ color: 0xc9a050, metalness: .8, roughness: .3 })); inlay.position.y = TOP - .025; scene.add(inlay);
  const table = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.ShadowMaterial({ opacity: .28 })); table.rotation.x = -Math.PI / 2; table.position.y = TOP - .37; table.receiveShadow = true; scene.add(table);
  // file and rank letters carved into the frame
  {
    const c = document.createElement('canvas'); c.width = c.height = 1024; const g = c.getContext('2d'); g.fillStyle = 'rgba(232,200,140,.75)'; g.font = '600 26px Georgia'; g.textAlign = 'center'; g.textBaseline = 'middle';
    const s = 1024 / 9.3, o = (9.3 - 8) / 2 * s;
    for (let i = 0; i < 8; i++) { g.fillText('abcdefgh'[i], o + (i + .5) * s, 1024 - o / 2); g.fillText(String(8 - i), o / 2, o + (i + .5) * s); }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    const lab = new THREE.Mesh(new THREE.PlaneGeometry(9.3, 9.3), new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false })); lab.rotation.x = -Math.PI / 2; lab.position.y = TOP - .029; scene.add(lab);
  }

  // materials: glossy ebony and antiqued boxwood
  const ebony = new THREE.MeshPhysicalMaterial({ map: texFrom(grainCanvas(256, 512, '#150d09', '#000000', { lines: 60, wave: 3, alpha: .55, thick: 1.4 })), roughness: .34, clearcoat: 1, clearcoatRoughness: .1, envMapIntensity: .55 });
  const boxwood = new THREE.MeshPhysicalMaterial({ map: texFrom(grainCanvas(256, 512, '#c98a43', '#7a4a1c', { lines: 60, wave: 3, alpha: .32, thick: 1.6 })), roughness: .4, clearcoat: .8, clearcoatRoughness: .2, envMapIntensity: .8 });
  const felt = new THREE.MeshStandardMaterial({ color: 0x1f4a2e, roughness: 1 });
  const GEO = {}; for (const t of 'prbqk') GEO[t] = lathe(PROFILES[t]); GEO.n = lathe(PROFILES.n); const knightG = knightHead();
  const merlon = new THREE.BoxGeometry(.11, .1, .1), crossV = new THREE.BoxGeometry(.06, .24, .06), crossH = new THREE.BoxGeometry(.18, .06, .06), bead = new THREE.SphereGeometry(.035, 12, 8), feltG = new THREE.CylinderGeometry(.33, .33, .01, 32);
  function makePiece(p) {
    const t = p.toLowerCase(), white = p === t.toUpperCase(), mat = white ? boxwood : ebony, g = new THREE.Group();
    const add = (geo, x = 0, y = 0, z = 0, ry = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.rotation.y = ry; m.castShadow = true; m.receiveShadow = true; g.add(m); return m; };
    add(GEO[t]);
    if (t === 'r') for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + Math.PI / 4; add(merlon, Math.cos(a) * .21, .86, Math.sin(a) * .21, -a); }
    if (t === 'q') for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; add(bead, Math.cos(a) * .18, 1.0, Math.sin(a) * .18); }
    if (t === 'k') { add(crossV, 0, 1.22); add(crossH, 0, 1.25); }
    if (t === 'n') { const h = add(knightG); h.rotation.y = white ? -.45 : Math.PI + .45; }   // show the carved profile, turned toward the opponent
    const f = new THREE.Mesh(feltG, felt); f.position.y = -.004; g.add(f);
    g.userData.type = t; return g;
  }

  // highlights
  const hl = new THREE.Group(); scene.add(hl);
  const flat = new THREE.PlaneGeometry(.98, .98); flat.rotateX(-Math.PI / 2);
  const M = {
    last: new THREE.MeshBasicMaterial({ color: 0xffd27a, transparent: true, opacity: .28, depthWrite: false }),
    sel: new THREE.MeshBasicMaterial({ color: 0xffc85a, transparent: true, opacity: .45, depthWrite: false }),
    check: new THREE.MeshBasicMaterial({ map: radialTex('rgba(255,60,40,.9)', 'rgba(255,60,40,0)'), transparent: true, depthWrite: false }),
    dot: new THREE.MeshBasicMaterial({ color: 0x1a0d05, transparent: true, opacity: .38, depthWrite: false }),
    ring: new THREE.MeshBasicMaterial({ color: 0xd8a64a, transparent: true, opacity: .9, depthWrite: false }),
  };
  const dotG = new THREE.CircleGeometry(.14, 32); dotG.rotateX(-Math.PI / 2);
  const ringG = new THREE.RingGeometry(.38, .46, 48); ringG.rotateX(-Math.PI / 2);

  let pieces = new Map(), flipped = null, anims = [], lifted = null, w = 0, h = 0, dirty = true;
  function setFlip(f) {
    if (f === flipped) return; flipped = f;
    camera.position.set(0, 12.6, f ? -10.4 : 10.4); controls.update(); dirty = true;
  }
  function sync(b, o = {}) {
    dirty = true;
    for (const g of pieces.values()) scene.remove(g); pieces = new Map(); lifted = null;
    b.forEach((p, s) => { if (!p) return; const g = makePiece(p); g.position.copy(pos(s)); scene.add(g); pieces.set(s, g);
      if (o.fallen && p.toLowerCase() === 'k' && ((p === 'K') === (o.fallen === 'w'))) { g.rotation.z = Math.PI / 2 * .96; g.position.y += .2; g.position.x += .35; }
    });
    hl.clear();
    const put = (mat, s, y = .002, geo = flat, sc = 1) => { const m = new THREE.Mesh(geo, mat); m.position.copy(pos(s)); m.position.y += y; m.scale.setScalar(sc); m.renderOrder = 2; hl.add(m); return m; };
    if (o.last) { put(M.last, o.last.f); put(M.last, o.last.t); }
    if (o.check != null && o.check >= 0) put(M.check, o.check, .003, flat, 1.1);
    if (o.sel != null) { put(M.sel, o.sel, .004); const g = pieces.get(o.sel); if (g) lifted = g; }
    (o.moves || []).forEach((m, i) => { const d = put(m.cap ? M.ring : M.dot, m.t, .006, m.cap ? ringG : dotG, .01); anims.push({ t0: performance.now() + i * 25, dur: 260, f: k => d.scale.setScalar(.01 + .99 * easeBack(k)) }); });
  }
  const easeBack = k => { const c = 1.7; return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2); };
  const easeIO = k => k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
  function move(b, m, done) {
    const g = pieces.get(m.f); if (!g) { done(); return; }
    lifted = null; const from = pos(m.f), to = pos(m.t), knight = m.piece.toLowerCase() === 'n';
    const dist = from.distanceTo(to), dur = knight ? 650 : Math.min(620, 300 + dist * 55), lift = knight ? .9 : .18 + dist * .02;
    const capSq = m.ep ? m.t + (b[m.f] === 'P' ? 8 : -8) : m.t, cap = m.cap ? pieces.get(capSq) : null;
    const t0 = performance.now();
    anims.push({ t0, dur, f: k => { const e = easeIO(k); g.position.lerpVectors(from, to, e); g.position.y = TOP + Math.sin(Math.PI * e) * lift; } });
    if (cap) anims.push({ t0: t0 + dur * .55, dur: 600, f: k => { const e = easeIO(k); cap.rotation.z = (to.x > 0 ? -1 : 1) * e * Math.PI / 2; cap.position.y = TOP + .1 * Math.sin(Math.PI * e) - e * .9; cap.position.x = to.x + (to.x > 0 ? 1 : -1) * e * .5; } });
    if (m.castle) { const rf = m.castle === 'k' ? m.f + 3 : m.f - 4, rt = m.castle === 'k' ? m.f + 1 : m.f - 1, rk = pieces.get(rf), a = pos(rf), z = pos(rt);
      if (rk) anims.push({ t0: t0 + 120, dur: dur + 100, f: k => { const e = easeIO(k); rk.position.lerpVectors(a, z, e); rk.position.y = TOP + Math.sin(Math.PI * e) * .5; } }); }
    anims.push({ t0, dur: Math.max(dur, cap ? dur * .55 + 600 : 0) + 30, f: k => { if (k >= 1) done(); } });
  }
  function wiggle(s) { const g = pieces.get(s); if (!g) return; anims.push({ t0: performance.now(), dur: 500, f: k => { g.rotation.z = Math.sin(k * Math.PI * 5) * .12 * (1 - k); } }); }
  function hop(s) { const g = pieces.get(s); if (!g) return; const y0 = g.position.y; anims.push({ t0: performance.now(), dur: 450, f: k => { g.position.y = y0 + Math.sin(Math.PI * k) * .35; } }); }
  function anchor(s) {
    return { wiggle: () => wiggle(s), hop: () => hop(s), getBoundingClientRect() {
      const p = pos(s); p.y += .9; p.project(camera); const r = renderer.domElement.getBoundingClientRect();
      const x = r.left + (p.x + 1) / 2 * r.width, y = r.top + (1 - p.y) / 2 * r.height; return { left: x - 20, top: y - 20, width: 40, height: 40, right: x + 20, bottom: y + 20 }; } };
  }
  // taps: a short press without dragging picks the square under the finger
  const ray = new THREE.Raycaster(), plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -TOP), v2 = new THREE.Vector2(), hit = new THREE.Vector3();
  let down = null;
  renderer.domElement.addEventListener('pointerdown', e => { down = { x: e.clientX, y: e.clientY, t: performance.now() }; });
  renderer.domElement.addEventListener('pointerup', e => {
    if (!down || Math.hypot(e.clientX - down.x, e.clientY - down.y) > 8) { down = null; return; } down = null;
    const r = renderer.domElement.getBoundingClientRect(); v2.set((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1); ray.setFromCamera(v2, camera);
    // prefer a piece if the ray hits one, otherwise the square on the board
    const meshes = []; for (const [s, g] of pieces) g.traverse(o => { if (o.isMesh) { o.userData.sq = s; meshes.push(o); } });
    const ph = ray.intersectObjects(meshes, false)[0];
    if (ph) { onTap(ph.object.userData.sq); return; }
    if (!ray.ray.intersectPlane(plane, hit)) return;
    const f = Math.floor(hit.x + 4), rr = Math.floor(hit.z + 4); if (f < 0 || f > 7 || rr < 0 || rr > 7) return; onTap(rr * 8 + f);
  });
  function size() {
    const W = el.clientWidth, H = el.clientHeight; if (!W || !H || (W === w && H === h)) return false; w = W; h = H;
    renderer.setSize(W, H, false); renderer.domElement.style.width = W + 'px'; renderer.domElement.style.height = H + 'px';
    camera.aspect = W / H; camera.fov = W / H < .9 ? 42 : 36; camera.updateProjectionMatrix(); return true;
  }
  new ResizeObserver(size).observe(el);
  // draw only when something changes (saves battery): animations, a lifted piece, the camera moving, a resize
  controls.addEventListener('change', () => { dirty = true; });
  function frame_(now) {
    if (size()) dirty = true;
    const busy = anims.length > 0;
    anims = anims.filter(a => { const k = Math.min(1, Math.max(0, (now - a.t0) / a.dur)); if (now < a.t0) return true; a.f(k); return k < 1; });
    if (lifted) { lifted.position.y = TOP + .22 + Math.sin(now / 260) * .05; dirty = true; }
    if (controls.update()) dirty = true;
    if (busy || dirty) { renderer.render(scene, camera); dirty = false; }
    requestAnimationFrame(frame_);
  }
  requestAnimationFrame(frame_);
  setFlip(false);
  return { sync, move, setFlip, anchor, wiggle, hop, tap: s => onTap(s), reset() { setFlip(!flipped); setFlip(!flipped); } };
}
