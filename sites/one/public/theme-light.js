document.documentElement.dataset.theme = 'light';
try {
  localStorage.setItem('starlight-theme', 'light');
} catch {
  /* ignore */
}
document.addEventListener('astro:after-swap', () => {
  document.documentElement.dataset.theme = 'light';
});
