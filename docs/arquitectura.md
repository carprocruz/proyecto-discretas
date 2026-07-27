# Arquitectura

La versión entregada es una aplicación web estática servida por Vite. El punto de entrada es `index.html`, que carga la hoja de estilos y los módulos JavaScript del laboratorio.

## Capas principales

- `index.html`: estructura de navegación, teoría, laboratorio y retos.
- `css/styles.css`: estilos, temas, componentes visuales y diseño responsivo.
- `js/graph.js`: estado del grafo, vértices, aristas, representaciones y componentes conexas.
- `js/algorithms.js`: algoritmos BFS, DFS y coloreo voraz.
- `js/labCanvas.js`: edición del grafo y animación de recorridos sobre Canvas.
- `js/ui.js`: controles, pestañas, estadísticas y paneles de datos.
- `js/quiz.js`: cuestionario, bipartición y conectividad.
- `js/heroCanvas.js`: visualización animada del encabezado.
- `js/script.js`: inicialización general, acordeones, tema y renderizado de fórmulas.

La carpeta `src/` contiene una base TypeScript/React para futuras iteraciones y no reemplaza todavía al punto de entrada funcional de la versión entregada.
