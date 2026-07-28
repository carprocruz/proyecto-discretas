# La GrafoNal

Aplicación web educativa e interactiva para aprender teoría de grafos. Incluye explicaciones con fórmulas, un laboratorio para construir grafos, visualizaciones de algoritmos y retos de verificación.

## Integrantes

- Carlos Albarracin
- Sebastian Arevalo
- Tomas Saldaña

## Requisitos

- Node.js 18 o superior.
- npm, incluido con Node.js.
- Un navegador moderno con soporte para JavaScript y Canvas.

No se requieren bases de datos, cuentas ni variables de entorno.

## Instalación

Desde la carpeta raíz del repositorio:

```bash
npm install
```

## Ejecución

### Visualizacion en linea

La pagina tambien puede visualizarse directamente desde GitHub Pages en el siguiente enlace:

[https://carprocruz.github.io/proyecto-discretas/](https://carprocruz.github.io/proyecto-discretas/)

### Linux

Desde una terminal, ubicate en la carpeta raiz del repositorio, instala las dependencias e inicia el servidor de desarrollo:

```bash
npm run dev
```

### Windows con Visual Studio Code

Tambien puedes ejecutar la aplicacion usando Visual Studio Code y la extension **Live Server**:

1. Abre la carpeta del proyecto en Visual Studio Code.
2. Instala la extension **Live Server** de Ritwick Dey si aun no la tienes.
3. Haz clic derecho sobre `index.html` y selecciona **Open with Live Server**.
4. Se abrira la aplicacion en el navegador mediante una direccion local, normalmente `http://127.0.0.1:5500/`.

Luego abre la dirección que indique Vite, normalmente `http://localhost:5173/`.

Para generar una versión de producción:

```bash
npm run build
```

La aplicación entregada se carga desde `index.html`. Vite se utiliza para servirla en desarrollo y generar la compilación.

## Ejemplo de uso

1. Abre la sección **Laboratorio**.
2. Usa **Añadir vértice** para crear nodos y **Conectar** para agregar aristas; también puedes mover o borrar elementos.
3. Activa **dirigido** si necesitas trabajar con un grafo dirigido.
4. Cambia a la pestaña **Algoritmos**, elige un vértice inicial cuando corresponda y ejecuta BFS o DFS paso a paso o de forma animada.
5. Consulta la lista de adyacencia, la matriz y los grados del grafo.
6. En **Retos**, responde el cuestionario y verifica si el grafo es bipartito o conexo.

## Estructura del repositorio

```text
.
├── index.html              # Aplicación web entregada
├── css/styles.css          # Estilos de la interfaz
├── js/                     # Código JavaScript modular de la aplicación
│   ├── graph.js            # Modelo y operaciones sobre grafos
│   ├── algorithms.js       # BFS, DFS y coloreo voraz
│   ├── heroCanvas.js       # Visualización del encabezado
│   ├── labCanvas.js        # Editor y animación del laboratorio
│   ├── ui.js               # Controles y paneles de la interfaz
│   ├── quiz.js             # Cuestionario y retos
│   └── script.js           # Inicialización, tema y teoría
├── public/                 # Logos y recursos estáticos
├── algoritmos/             # Implementaciones de referencia en Python y JavaScript
├── src/                    # Base TypeScript/React para evolución futura
├── docs/                   # Arquitectura, requisitos, casos de uso y guías
├── package.json            # Scripts y dependencias
├── package-lock.json       # Versiones exactas de dependencias
└── .gitignore              # Archivos excluidos del repositorio
```

## Comprobación del funcionamiento

La guía detallada de verificación está en [`docs/verificacion.md`](docs/verificacion.md). Como mínimo, comprueba que:

- la página carga sin errores en la consola del navegador;
- el cambio de tema funciona;
- se pueden crear, conectar, mover, borrar y limpiar vértices;
- BFS y DFS muestran el recorrido y permiten avanzar paso a paso;
- se actualizan la lista, la matriz, los grados y las componentes conexas;
- funcionan el cuestionario y los retos de bipartición y conectividad.

Validaciones técnicas disponibles:

```bash
# Comprueba la sintaxis de los módulos JavaScript
node --check js/graph.js
node --check js/algorithms.js
node --check js/heroCanvas.js
node --check js/labCanvas.js
node --check js/quiz.js
node --check js/ui.js
node --check js/script.js

# Comprueba tipos y genera la compilación
npm run build
```

## Documentación adicional

- [`docs/requerimientos.md`](docs/requerimientos.md): requisitos del proyecto.
- [`docs/casos-de-uso.md`](docs/casos-de-uso.md): casos de uso.
- [`docs/arquitectura.md`](docs/arquitectura.md): organización técnica.
- [`docs/manual-usuario.md`](docs/manual-usuario.md): guía breve de uso.
- [`docs/verificacion.md`](docs/verificacion.md): casos de verificación manual y técnica.

## Uso de inteligencia artificial

Durante el desarrollo del proyecto se utilizaron herramientas de inteligencia artificial como apoyo. La creaciÃ³n y el mejoramiento de las interfaces tienen una alta incidencia de la IA, al igual que la identificaciÃ³n y soluciÃ³n de errores en el cÃ³digo. Las decisiones finales, la integraciÃ³n de los componentes y la verificaciÃ³n del funcionamiento fueron realizadas por el equipo.

## Estado actual

Versión académica funcional en desarrollo. La interfaz web, el laboratorio de grafos, las visualizaciones BFS/DFS, el cuestionario y los retos principales están implementados. La carpeta `src/` contiene una base TypeScript/React preparada para futuras iteraciones; la versión entregada actualmente se ejecuta desde `index.html` y los módulos de `js/`.
