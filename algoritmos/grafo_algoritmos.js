/**
 * grafo_algoritmos.js
 * --------------------
 * Implementación en JavaScript (Node.js, sin dependencias) de la misma
 * estructura de Grafo y los algoritmos usados en el proyecto:
 *
 * - Representación por lista de adyacencia y matriz de adyacencia
 * - Grado de un vértice
 * - BFS (recorrido en anchura)
 * - DFS (recorrido en profundidad)
 * - Componentes conexas
 * - Verificación de bipartición (coloreo con 2 colores)
 * - Coloreo voraz (greedy) y cota superior del número cromático
 *
 * Se puede correr directamente con:
 *     node grafo_algoritmos.js
 */

class Grafo {
  constructor(dirigido = false) {
    this.dirigido = dirigido;
    this.vertices = [];       // etiquetas, en orden de inserción
    this.adyacencia = {};     // etiqueta -> array de etiquetas vecinas
  }

  // -----------------------------------------------------------------
  // Construcción
  // -----------------------------------------------------------------
  agregarVertice(v) {
    if (!(v in this.adyacencia)) {
      this.vertices.push(v);
      this.adyacencia[v] = [];
    }
  }

  agregarArista(u, v) {
    this.agregarVertice(u);
    this.agregarVertice(v);
    if (!this.adyacencia[u].includes(v)) this.adyacencia[u].push(v);
    if (!this.dirigido && !this.adyacencia[v].includes(u)) this.adyacencia[v].push(u);
  }

  // -----------------------------------------------------------------
  // Representaciones
  // -----------------------------------------------------------------
  listaAdyacencia() {
    const out = {};
    for (const v of this.vertices) out[v] = [...this.adyacencia[v]];
    return out;
  }

  matrizAdyacencia() {
    const n = this.vertices.length;
    const idx = {};
    this.vertices.forEach((v, i) => (idx[v] = i));
    const m = Array.from({ length: n }, () => Array(n).fill(0));
    for (const u of this.vertices) {
      for (const v of this.adyacencia[u]) m[idx[u]][idx[v]] = 1;
    }
    return m;
  }

  grado(v) {
    if (this.dirigido) {
      const salida = this.adyacencia[v].length;
      const entrada = this.vertices.filter((u) => this.adyacencia[u].includes(v)).length;
      return { entrada, salida };
    }
    return this.adyacencia[v].length;
  }

  /** Vecinos ignorando dirección: útil para conectividad, bipartición y coloreo. */
  vecinosNoDirigidos(v) {
    const set = new Set(this.adyacencia[v]);
    if (this.dirigido) {
      for (const u of this.vertices) {
        if (this.adyacencia[u].includes(v)) set.add(u);
      }
    }
    return set;
  }

  // -----------------------------------------------------------------
  // Recorridos
  // -----------------------------------------------------------------
  bfs(inicio) {
    const visitados = new Set([inicio]);
    const cola = [inicio];
    const orden = [];
    while (cola.length) {
      const actual = cola.shift();
      orden.push(actual);
      for (const vecino of [...this.adyacencia[actual]].sort()) {
        if (!visitados.has(vecino)) {
          visitados.add(vecino);
          cola.push(vecino);
        }
      }
    }
    return orden;
  }

  dfs(inicio) {
    const visitados = new Set();
    const orden = [];
    const _dfs = (u) => {
      visitados.add(u);
      orden.push(u);
      for (const vecino of [...this.adyacencia[u]].sort()) {
        if (!visitados.has(vecino)) _dfs(vecino);
      }
    };
    _dfs(inicio);
    return orden;
  }

  // -----------------------------------------------------------------
  // Propiedades estructurales
  // -----------------------------------------------------------------
  componentesConexas() {
    const visitados = new Set();
    const componentes = [];
    for (const v of this.vertices) {
      if (visitados.has(v)) continue;
      const comp = [];
      const cola = [v];
      visitados.add(v);
      while (cola.length) {
        const u = cola.shift();
        comp.push(u);
        for (const w of this.vecinosNoDirigidos(u)) {
          if (!visitados.has(w)) {
            visitados.add(w);
            cola.push(w);
          }
        }
      }
      componentes.push(comp);
    }
    return componentes;
  }

  esConexo() {
    return this.componentesConexas().length <= 1;
  }

  /** Verifica bipartición con coloreo de 2 colores (BFS). */
  esBipartito() {
    const color = {};
    for (const origen of this.vertices) {
      if (origen in color) continue;
      color[origen] = 0;
      const cola = [origen];
      while (cola.length) {
        const u = cola.shift();
        for (const w of this.vecinosNoDirigidos(u)) {
          if (!(w in color)) {
            color[w] = 1 - color[u];
            cola.push(w);
          } else if (color[w] === color[u]) {
            return { bipartito: false, particion: null };
          }
        }
      }
    }
    const grupoA = this.vertices.filter((v) => color[v] === 0);
    const grupoB = this.vertices.filter((v) => color[v] === 1);
    return { bipartito: true, particion: [grupoA, grupoB] };
  }

  /**
   * Coloreo voraz (greedy): ordena por grado descendente y asigna a cada
   * vértice el menor color disponible que no usen sus vecinos.
   * Es una heurística: da una COTA SUPERIOR del número cromático real.
   */
  coloreoVoraz() {
    const orden = [...this.vertices].sort(
      (a, b) => this.vecinosNoDirigidos(b).size - this.vecinosNoDirigidos(a).size
    );
    const color = {};
    for (const v of orden) {
      const usados = new Set([...this.vecinosNoDirigidos(v)].map((u) => color[u]).filter((c) => c !== undefined));
      let c = 0;
      while (usados.has(c)) c++;
      color[v] = c;
    }
    const numColores = new Set(Object.values(color)).size;
    return { color, numColores };
  }
}

// =======================================================================
// DEMO — se ejecuta al correr el archivo directamente con `node`
// =======================================================================
if (require.main === module) {
  const g = new Grafo(false);
  const aristas = [
    ["A", "B"], ["A", "C"], ["B", "D"], ["C", "D"], ["D", "E"], ["F", "G"],
  ];
  aristas.forEach(([u, v]) => g.agregarArista(u, v));

  console.log("Vértices:", g.vertices);
  console.log("Lista de adyacencia:", g.listaAdyacencia());
  console.log("Matriz de adyacencia:");
  g.matrizAdyacencia().forEach((fila) => console.log(" ", fila));

  console.log("\nGrado de cada vértice:");
  g.vertices.forEach((v) => console.log(`  ${v}:`, g.grado(v)));

  console.log("\nBFS desde A:", g.bfs("A"));
  console.log("DFS desde A:", g.dfs("A"));

  console.log("\nComponentes conexas:", g.componentesConexas());
  console.log("¿Es conexo?:", g.esConexo());

  const { bipartito, particion } = g.esBipartito();
  console.log("\n¿Es bipartito?:", bipartito, "-> partición:", particion);

  const { color, numColores } = g.coloreoVoraz();
  console.log("\nColoreo voraz:", color);
  console.log("Colores usados (cota superior del número cromático):", numColores);
}

module.exports = { Grafo };
