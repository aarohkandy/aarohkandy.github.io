// macOS-dock style magnification for the desktop nav column.
// Each link scales with a Gaussian of its distance to the pointer, so the one under the cursor pops out
// and its neighbours bend around it. Scaling from the right edge pushes the curve out toward the page.
// Transforms only, so nothing reflows. Off for touch, reduced motion, and the phone/tablet dropdown.
(() => {
  const links = [...document.querySelectorAll('nav .links a')];
  const desktop = matchMedia('(min-width:1024px) and (min-height:621px)');
  const fine = matchMedia('(hover:hover) and (pointer:fine)');
  const calm = matchMedia('(prefers-reduced-motion: reduce)');
  if (!links.length) return;
  const MAX = 0.62, SIGMA = 62, PUSH = 16, REACH = 150;  // growth, falloff (px), outward pop (px), activation width (px)
  const cur = links.map(() => 0), target = links.map(() => 0);
  let py = null, running = false;
  const active = () => desktop.matches && fine.matches && !calm.matches;
  const centers = () => links.map(a => { const r = a.getBoundingClientRect(), s = 1 + cur[links.indexOf(a)] * MAX; return r.top + r.height / 2; });
  function frame() {
    let c = centers(), moving = false;
    links.forEach((a, i) => {
      target[i] = py === null ? 0 : Math.exp(-((py - c[i]) ** 2) / (2 * SIGMA * SIGMA));
      cur[i] += (target[i] - cur[i]) * 0.2;
      if (Math.abs(target[i] - cur[i]) > 0.002) moving = true; else cur[i] = target[i];
      const k = cur[i];
      a.style.transform = k ? `translateX(${-k * PUSH}px) scale(${1 + k * MAX})` : '';
      a.style.color = k > 0.01 ? `color-mix(in srgb, var(--ink) ${Math.round(k * 100)}%, var(--mute))` : '';
    });
    running = moving; if (running) requestAnimationFrame(frame);
  }
  const kick = () => { if (!running) { running = true; requestAnimationFrame(frame); } };
  addEventListener('pointermove', e => {
    if (!active()) return;
    const col = links[0].parentElement.getBoundingClientRect();
    py = (e.clientX > col.right - col.width - REACH && e.clientY > col.top - 40 && e.clientY < col.bottom + 40) ? e.clientY : null;
    kick();
  }, { passive: true });
  document.addEventListener('pointerleave', () => { py = null; kick(); });
  const reset = () => { py = null; links.forEach((a, i) => { cur[i] = target[i] = 0; a.style.transform = a.style.color = ''; }); };
  desktop.addEventListener('change', reset); calm.addEventListener('change', reset);
})();
