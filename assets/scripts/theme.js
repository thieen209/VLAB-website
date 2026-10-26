(() => {
  let saved;
  try { saved = localStorage.getItem('vlab-theme'); } catch (_) {}
  document.documentElement.dataset.theme = saved === 'dark' || saved === 'light' ? saved : matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  let motion;
  try { motion = localStorage.getItem('vlab-motion'); } catch (_) {}
  document.documentElement.dataset.motion = motion === 'off' || motion === 'on' ? motion : matchMedia('(prefers-reduced-motion: reduce)').matches ? 'off' : 'on';
})();
