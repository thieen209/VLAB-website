(() => {
  let saved;
  try { saved = localStorage.getItem('vlab-theme'); } catch (_) {}
  document.documentElement.dataset.theme = saved === 'dark' || saved === 'light' ? saved : matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
})();
