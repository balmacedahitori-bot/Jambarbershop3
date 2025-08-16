// Alternador de tema global: aplica a todo (index, admin, cliente)
(function () {
  const root = document.documentElement;
  const KEY = 'theme';

  function apply(theme) {
    root.setAttribute('data-theme', theme);
    const toggles = document.querySelectorAll('[data-theme-toggle]');
    const icon = theme === 'light' ? '☀️' : '🌙';
    toggles.forEach(t => t.setAttribute('data-icon', icon));
  }

  function init() {
    const saved = localStorage.getItem(KEY) || 'dark';
    apply(saved);

    // Siempre creamos el botón en forma de pestaña en el borde derecho
    const tab = document.createElement('div');
    tab.className = 'theme-toggle-tab';
    tab.setAttribute('data-theme-toggle', '');
    tab.title = 'Cambiar tema';
    tab.setAttribute('data-icon', saved === 'light' ? '☀️' : '🌙');
    document.body.appendChild(tab);

    document.addEventListener('click', (e) => {
      const el = e.target.closest('[data-theme-toggle]');
      if (!el) return;
      const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      localStorage.setItem(KEY, next);
      apply(next);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();


