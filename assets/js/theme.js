/* Sets data-theme on <html> before first paint (loaded sync in <head>).
   Saved choice wins; otherwise follow the OS setting. */
(function () {
  var theme = null;
  try { theme = localStorage.getItem('rv-theme'); } catch (e) {}
  if (theme !== 'light' && theme !== 'dark') {
    theme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  document.documentElement.setAttribute('data-theme', theme);
})();
