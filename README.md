# Nodo & Arista — Teoría de Grafos interactiva

Proyecto web para la enseñanza de la Teoría de Grafos: teoría explicada de forma
simple, un laboratorio donde se construye el grafo a mano, ejecución animada de
algoritmos (BFS, DFS, componentes conexas, coloreo voraz) y una sección de retos
que se verifica sobre el grafo real que el usuario construyó.

## Cómo abrirlo

No necesita instalación ni servidor. Solo hay que abrir `index.html` con
doble clic, o arrastrarlo a cualquier navegador (Chrome, Firefox, Edge, Safari).

## Estructura del proyecto

```
proyecto-grafos/
├── index.html            → estructura de la página (HTML puro, sin estilos ni lógica embebidos)
├── css/
│   └── styles.css        → todos los estilos visuales
├── js/
│   └── script.js         → toda la lógica: estado del grafo, dibujo en canvas,
│                            algoritmos, animaciones, cuestionario y retos
└── algoritmos/            → anexo de código para el informe escrito
    ├── grafo_algoritmos.py   → misma lógica de algoritmos, en Python puro
    └── grafo_algoritmos.js   → misma lógica de algoritmos, en JavaScript (Node.js)
```

## Por qué JavaScript para la página

La página es un producto que corre en el navegador, así que el lenguaje natural
para su interactividad es JavaScript (es el único que un navegador ejecuta de
forma nativa sin instalar nada extra). Por eso el proyecto principal está en
HTML + CSS + JS separados en archivos limpios, como se estructura cualquier
proyecto web real.

Los scripts en `algoritmos/` son un anexo aparte: la misma lógica de grafos
(BFS, DFS, componentes conexas, bipartición, coloreo voraz) reescrita como
programas de línea de comandos, uno en Python y otro en JavaScript/Node, para
mostrar la implementación de forma más "cruda" en el informe si se necesita.

Para correrlos:
```
python3 algoritmos/grafo_algoritmos.py
node algoritmos/grafo_algoritmos.js
```

## Módulos de la página

- **Teoría** — definiciones, representación, propiedades, tipos especiales,
  algoritmos y aspectos computacionales, en acordeones organizados por tema.
- **Laboratorio** — construcción interactiva del grafo (mover, añadir vértice,
  conectar, borrar, alternar dirigido/no dirigido, generar grafo aleatorio),
  con lista de adyacencia, matriz de adyacencia y grados actualizándose en vivo.
- **Algoritmos** — BFS, DFS, componentes conexas y coloreo voraz, animados
  paso a paso sobre el grafo construido, con control de velocidad y bitácora.
- **Retos** — cuestionario de opción múltiple con retroalimentación, más dos
  retos prácticos (bipartición y conectividad) que se verifican en tiempo real
  contra el grafo que el usuario construyó.
