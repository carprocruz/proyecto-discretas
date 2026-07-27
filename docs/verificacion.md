# Guía de verificación

## Preparación

1. Ejecuta `npm install`.
2. Ejecuta `npm run dev`.
3. Abre la URL local indicada por Vite.
4. Abre la consola del navegador para detectar errores de JavaScript.

## Casos funcionales

| Caso | Pasos | Resultado esperado |
|---|---|---|
| Carga inicial | Abrir la aplicación | Se muestran navegación, teoría, laboratorio y retos sin errores en consola. |
| Tema | Pulsar el botón de tema en la navegación | Cambian los colores de la interfaz y el botón sigue disponible. |
| Edición | Añadir dos vértices, conectarlos, mover uno y eliminar la arista o un vértice | El canvas y los contadores reflejan cada operación. |
| Grafo aleatorio | Pulsar **Aleatorio** y después **Limpiar** | Se genera un grafo nuevo y luego el laboratorio queda vacío. |
| Datos del grafo | Revisar lista, matriz y grados | Las tres representaciones corresponden al grafo visible. |
| BFS/DFS | Crear un grafo conectado, elegir inicio y ejecutar cada algoritmo | Se muestra el orden de visita y la animación permite pausar, reanudar, avanzar y reiniciar. |
| Conectividad | Crear dos componentes y pulsar **Verificar conectividad** | Se informa que el grafo tiene más de una componente. |
| Bipartición | Probar un camino de tres vértices y un triángulo | El camino se identifica como bipartito y el triángulo como no bipartito. |
| Cuestionario | Responder las preguntas y pulsar **Comprobar respuestas** | Se muestra el puntaje y la explicación de cada respuesta. |

## Validación técnica

Desde la raíz del repositorio:

```bash
node --check js/graph.js
node --check js/algorithms.js
node --check js/heroCanvas.js
node --check js/labCanvas.js
node --check js/quiz.js
node --check js/ui.js
node --check js/script.js
npm run build
```

Los comandos `node --check` validan la sintaxis de los módulos de la versión entregada. `npm run build` valida TypeScript y genera la compilación de Vite.
