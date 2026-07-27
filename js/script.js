/* ============================================================
   SCRIPT — punto de entrada, inicializa todos los módulos
   ============================================================ */

function typesetMath(scope) {
  const mathjax = window.MathJax;
  if (mathjax && typeof mathjax.typesetPromise === 'function') {
    return mathjax.typesetPromise(scope ? [scope] : undefined).catch(() => {});
  }
  return Promise.resolve();
}

function initTheoryAccordions() {
  document.querySelectorAll('.theory-section').forEach(section => {
    section.addEventListener('toggle', () => {
      if (section.open) typesetMath(section);
    });
  });
}

function initThemeToggle() {
  const toggle = document.getElementById('themeToggle');
  if (!toggle) return;

  const saved = localStorage.getItem('theme');
  if (saved === 'light') {
    document.body.classList.add('light');
    toggle.textContent = '🌙';
  }

  toggle.addEventListener('click', () => {
    document.body.classList.toggle('light');
    const isLight = document.body.classList.contains('light');
    toggle.textContent = isLight ? '🌙' : '☀️';
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  HeroCanvas.init();
  UI.init();
  LabCanvas.init();
  Quiz.init();
  initTheoryAccordions();
  window.addEventListener('load', () => {
    typesetMath(document.getElementById('teoria'));
  });
});
