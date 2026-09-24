// On phones, tablets and short screens the nav is a dropdown: closed by default, closes after a pick
// or a tap outside. On desktop it stays open. Without JS the <details> still opens and closes.
(() => {
  const m = document.querySelector('.menu'), compact = matchMedia('(max-width:1023px),(max-height:620px)');
  const sync = () => m.toggleAttribute('open', !compact.matches);
  sync(); compact.addEventListener('change', sync);
  m.addEventListener('click', e => { if (compact.matches && e.target.closest('a')) m.open = false; });
  document.addEventListener('click', e => { if (compact.matches && m.open && !m.contains(e.target)) m.open = false; });
})();
