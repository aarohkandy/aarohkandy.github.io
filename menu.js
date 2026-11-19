// On phones, tablets and short screens the nav is a dropdown: closed by default, closes after a pick
// or a tap outside. On desktop it stays open. Without JS the <details> still opens and closes.
(() => {
  const m = document.querySelector('.menu'), compact = matchMedia('(max-width:1023px),(max-height:620px)');
  const sync = () => m.toggleAttribute('open', !compact.matches);
  sync(); compact.addEventListener('change', sync);
  m.addEventListener('click', e => { if (compact.matches && e.target.closest('a')) m.open = false; });
  document.addEventListener('click', e => { if (compact.matches && m.open && !m.contains(e.target)) m.open = false; });
})();

// Phones: the nav is a dial at the bottom of the screen. Drag it round: it keeps spinning, clicks into each
// item (haptic tick where the phone allows), the page shows whichever item is under the marker as it passes,
// and the URL follows once it stops. Tapping an item turns the dial to it. CSS shows it only on phones;
// without JS the dropdown above stays.
(() => {
  const src = [...document.querySelectorAll('nav .links a')], n = src.length, step = 360 / n;
  const w = document.createElement('div'), disc = document.createElement('div'), dial = document.createElement('div');
  w.className = 'wheel'; w.setAttribute('role', 'navigation'); w.setAttribute('aria-label', 'Site');
  disc.className = 'disc'; dial.className = 'dial';
  let ticks = '';
  for (let k = 0; k < n; k++) {
    const t = k * step * Math.PI / 180, x = Math.sin(t), y = -Math.cos(t), f = q => q.toFixed(2);
    ticks += `<line x1="${f(x * 91)}" y1="${f(y * 91)}" x2="${f(x * 96.5)}" y2="${f(y * 96.5)}"/>`;
  }
  dial.innerHTML = `<svg viewBox="-100 -100 200 200" aria-hidden="true">${ticks}</svg>`;
  const links = src.map((a, i) => {
    const l = document.createElement('a');
    l.href = a.getAttribute('href'); l.textContent = a.textContent; l.draggable = false;
    l.style.setProperty('--a', i * step + 'deg'); dial.append(l); return l;
  });
  const sw = document.createElement('label'); sw.hidden = true; sw.innerHTML = '<input type="checkbox" switch>'; // iOS 18+ taps a haptic when a switch flips
  disc.append(dial); w.append(disc, sw); document.body.append(w);

  const idx = () => links.findIndex(l => l.getAttribute('href') === (location.hash || '#'));
  let rot = -Math.max(idx(), 0) * step, v = 0, target = null, raf = 0, tPrev = 0, last = -1, drag = null, moved = false, user = false, quiet = false;
  const at = () => ((Math.round(-rot / step) % n) + n) % n;
  // While the dial is in hand the page shows the item under the marker (a class, not the URL: browsers
  // throttle rapid hash changes, and each would replay the fade). A link elsewhere hands control back to :target.
  const panes = links.map(l => document.querySelector(l.getAttribute('href') === '#' ? '.home' : l.getAttribute('href')));
  let scrub = false;
  const peek = i => { panes.forEach((p, k) => p?.classList.toggle('peek', k === i)); scrollTo(0, 0); };
  const hold = () => { if (!scrub) { scrub = true; document.body.classList.add('scrub'); peek(at()); } };
  const release = () => { scrub = false; document.body.classList.remove('scrub'); panes.forEach(p => p?.classList.remove('peek')); };
  const draw = () => {
    dial.style.transform = `rotate(${rot}deg)`;
    const i = at(); if (i === last) return;
    links[last]?.classList.remove('on'); links[i].classList.add('on');
    if (scrub) peek(i);
    if (last >= 0 && !quiet) navigator.vibrate ? navigator.vibrate(10) : sw.click();
    last = i;
  };

  // Free spin: friction that grows as it slows, plus a detent force pulling toward the nearest item, so it
  // settles into a notch on its own. With a target (a tap), a slightly underdamped spring turns it there.
  const K = 180, C = 24, KD = 250, H = 1 / 240;
  const loop = now => {
    for (let dt = Math.min((now - tPrev) / 1000, .05); dt > 0; dt -= H) {
      const h = Math.min(H, dt), a = target !== null ? -K * (rot - target) - C * v
        : -KD * step / (2 * Math.PI) * Math.sin(2 * Math.PI * rot / step) - (5 + 20 * Math.exp(-Math.abs(v) / 120)) * v;
      v += a * h; rot += v * h;
    }
    tPrev = Math.max(tPrev, now);
    const rest = target ?? Math.round(rot / step) * step;
    if (Math.abs(v) < 2 && Math.abs(rot - rest) < .05) {
      rot = rest; v = 0; target = null; raf = 0; draw(); quiet = false;
      const h = links[at()].getAttribute('href');
      if (user && h !== (location.hash || '#')) location.replace(h);
      user = false; return;
    }
    draw(); raf = requestAnimationFrame(loop);
  };
  const run = () => { if (!raf) { tPrev = performance.now(); raf = requestAnimationFrame(loop); } };
  const turnTo = i => { const t = -i * step; target = t + 360 * Math.round((rot - t) / 360); run(); };

  const ang = e => Math.atan2(e.clientX - drag.cx, drag.cy - e.clientY) * 180 / Math.PI;
  disc.addEventListener('pointerdown', e => {
    if (e.button) return;
    cancelAnimationFrame(raf); raf = 0; target = null; v = 0; quiet = false; user = true; moved = false; hold(); // a touch stops it dead
    const b = disc.getBoundingClientRect();
    drag = { cx: b.left + b.width / 2, cy: b.top + b.height / 2, x: e.clientX, y: e.clientY };
    drag.a = ang(e); drag.s = [[e.timeStamp, rot]];
  });
  addEventListener('pointermove', e => {
    if (!drag) return;
    const a = ang(e), d = a - drag.a; drag.a = a; rot += d - 360 * Math.round(d / 360); draw();
    moved ||= Math.hypot(e.clientX - drag.x, e.clientY - drag.y) > 8;
    drag.s.push([e.timeStamp, rot]); if (drag.s.length > 12) drag.s.shift();
  });
  const up = e => {
    if (!drag) return;
    const s = drag.s.filter(p => e.timeStamp - p[0] < 80), f = s[0], l = s.at(-1);
    v = s.length > 1 && l[0] > f[0] ? Math.max(-1500, Math.min(1500, (l[1] - f[1]) / (l[0] - f[0]) * 1000)) : 0;
    drag = null; run();
  };
  addEventListener('pointerup', up); addEventListener('pointercancel', up);
  dial.addEventListener('click', e => {
    const a = e.target.closest('a'); if (!a) return;
    e.preventDefault(); if (moved && e.detail) return;
    user = true; hold(); turnTo(links.indexOf(a));
  });
  addEventListener('hashchange', () => { const i = idx(); if (i >= 0 && i !== at() && !drag) { release(); user = false; quiet = true; turnTo(i); } });

  draw();
  // one small nudge on load, so it reads as something that turns
  if (matchMedia('(max-width:760px) and (min-height:621px)').matches && !matchMedia('(prefers-reduced-motion:reduce)').matches)
    setTimeout(() => { if (drag || raf) return; quiet = true; target = rot; v = 360; run(); }, 600);
})();
