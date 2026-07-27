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

document.addEventListener('DOMContentLoaded', () => {
  HeroCanvas.init();
  UI.init();
  LabCanvas.init();
  Quiz.init();
  initTheoryAccordions();
  window.addEventListener('load', () => {
    typesetMath(document.getElementById('teoria'));
  });
});
