// Background: two wave trains running at each other across a grid of faint diamonds, so crests
// meet, pile up and pass through. A slow noise field bends them so it never looks mechanical.
// Grey on black, ~30 fps, still under reduced motion, paused in hidden tabs.
// A click sends one ring out from the pointer that runs through the waves and fades in ~2 s.
// Wherever there is text (the nav, the open section) the field fades to ~20%, so words sit on clean black.
(() => {
  const c = document.getElementById('bg'); if (!c) return;
  const g = c.getContext('2d'), still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let seed = 0x9e3779b9; const rnd = () => { seed = seed + 0x6d2b79f5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const perm = [...Array(256).keys()]; for (let i = 255; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [perm[i], perm[j]] = [perm[j], perm[i]]; }
  const P = new Uint8Array(512); for (let i = 0; i < 512; i++) P[i] = perm[i & 255];
  const sm = t => t * t * (3 - 2 * t), L = (a, b, t) => a + (b - a) * t, H = (i, j, k) => P[(P[(P[i & 255] + j) & 255] + k) & 255] / 255;
  const noise = (x, y, z) => { const X = Math.floor(x), Y = Math.floor(y), Z = Math.floor(z), u = sm(x - X), v = sm(y - Y), w = sm(z - Z), n = (a, b, d) => H(X + a, Y + b, Z + d);
    return L(L(L(n(0,0,0), n(1,0,0), u), L(n(0,1,0), n(1,1,0), u), v), L(L(n(0,0,1), n(1,0,1), u), L(n(0,1,1), n(1,1,1), u), v), w); };
  const ripples = []; // {x, y, t} in device px and seconds
  let boxes = [];     // text areas in device px, re-measured on navigation and resize
  const measure = () => { boxes = [...document.querySelectorAll('nav, section:target')].map(e => e.getBoundingClientRect())
    .filter(r => r.width && r.height).map(r => ({ l: r.left * dpr, r: r.right * dpr, t: r.top * dpr, b: r.bottom * dpr })); };
  const quiet = (x, y) => { let m = 1; const pad = 22 * dpr, soft = 110 * dpr;
    for (const b of boxes) { const dx = Math.max(b.l - pad - x, 0, x - b.r - pad), dy = Math.max(b.t - pad - y, 0, y - b.b - pad);
      const k = Math.min(1, Math.hypot(dx, dy) / soft); m = Math.min(m, 0.2 + 0.8 * k * k * (3 - 2 * k)); }
    return m; };
  const BUCKETS = 7; let W, Ht, cell, dpr, cols, rows, paths;
  function size() { dpr = Math.min(devicePixelRatio || 1, 2); W = c.width = innerWidth * dpr; Ht = c.height = innerHeight * dpr;
    cell = (innerWidth < 760 ? 20 : 24) * dpr; cols = Math.ceil(W / cell) + 1; rows = Math.ceil(Ht / cell) + 1; }
  function draw(t) {
    g.clearRect(0, 0, W, Ht); paths = Array.from({ length: BUCKETS }, () => new Path2D());
    const tw = t * 1.25;                              // waves 25% faster; ripples keep real time
    const k1 = 0.0105 / dpr, k2 = 0.0086 / dpr, a1 = 0.32, a2 = Math.PI + 0.58;
    const c1 = Math.cos(a1), s1 = Math.sin(a1), c2 = Math.cos(a2), s2 = Math.sin(a2);
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      const x = i * cell + (j & 1) * cell / 2, y = j * cell;
      const bend = (noise(x / (340 * dpr), y / (340 * dpr), tw * 0.09) - 0.5) * 5.5;
      const w1 = Math.sin(k1 * (x * c1 + y * s1) - tw * 1.05 + bend);
      const w2 = Math.sin(k2 * (x * c2 + y * s2) - tw * 0.83 - bend * 0.7);
      let v = (w1 + w2) * 0.25 + 0.5;                 // 0..1, peaks where the two trains meet
      for (const rp of ripples) {                     // ring: gaussian band moving outward, fading with age
        const age = t - rp.t, d = Math.hypot(x - rp.x, y - rp.y) - age * 520 * dpr, wd = 46 * dpr;
        v += Math.exp(-(d * d) / (wd * wd)) * 0.55 * (1 - age / 2.2);
      }
      v = Math.min(1, v);
      const e = v * v * v * quiet(x, y);                // keep most of the field quiet, and quieter under text
      const r = e * cell * 0.46; if (r < 0.7 * dpr) continue;
      const p = paths[Math.min(BUCKETS - 1, Math.floor(e * BUCKETS))];
      p.moveTo(x, y - r); p.lineTo(x + r, y); p.lineTo(x, y + r); p.lineTo(x - r, y); p.closePath();
    }
    while (ripples.length && t - ripples[0].t > 2.2) ripples.shift();
    for (let b = 0; b < BUCKETS; b++) { g.fillStyle = `rgba(200,200,196,${0.028 + b * 0.012})`; g.fill(paths[b]); }
  }
  let last = 0; const t0 = performance.now();
  const loop = now => { if (!document.hidden && now - last > 33) { last = now; draw((now - t0) / 1000); } requestAnimationFrame(loop); };
  addEventListener('pointerdown', e => {
    if (still) return;
    ripples.push({ x: e.clientX * dpr, y: e.clientY * dpr, t: (performance.now() - t0) / 1000 });
    if (ripples.length > 6) ripples.shift();
  }, { passive: true });
  addEventListener('resize', () => { size(); measure(); draw(still ? 4 : (performance.now() - t0) / 1000); }, { passive: true });
  const remask = () => { measure(); if (still) draw(4); };  // the still frame must redraw when the text moves
  addEventListener('hashchange', () => requestAnimationFrame(remask));
  addEventListener('scroll', () => requestAnimationFrame(remask), { passive: true });
  addEventListener('load', remask); setInterval(remask, 1000); // catches font swaps and the section fade-in
  size(); measure(); draw(4); if (!still) requestAnimationFrame(loop);
})();
