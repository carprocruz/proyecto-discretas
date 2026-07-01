"""
grafo_algoritmos.py
--------------------
Implementación en Python de una estructura de Grafo y los algoritmos
trabajados en el proyecto de Teoría de Grafos:

- Representación por lista de adyacencia y matriz de adyacencia
- Grado de un vértice
- BFS (recorrido en anchura)
- DFS (recorrido en profundidad)
- Componentes conexas
- Verificación de bipartición (coloreo con 2 colores)
- Coloreo voraz (greedy) y cota superior del número cromático

No requiere librerías externas. Se puede ejecutar directamente:
    python3 grafo_algoritmos.py
"""

from collections import deque


class Grafo:
    def __init__(self, dirigido: bool = False):
        self.dirigido = dirigido
        self.vertices = []          # lista de etiquetas, en orden de inserción
        self.adyacencia = {}        # etiqueta -> lista de etiquetas vecinas

    # ---------------------------------------------------------------
    # Construcción
    # ---------------------------------------------------------------
    def agregar_vertice(self, v):
        if v not in self.adyacencia:
            self.vertices.append(v)
            self.adyacencia[v] = []

    def agregar_arista(self, u, v):
        self.agregar_vertice(u)
        self.agregar_vertice(v)
        if v not in self.adyacencia[u]:
            self.adyacencia[u].append(v)
        if not self.dirigido and u not in self.adyacencia[v]:
            self.adyacencia[v].append(u)

    # ---------------------------------------------------------------
    # Representaciones
    # ---------------------------------------------------------------
    def lista_adyacencia(self):
        return {v: list(vecinos) for v, vecinos in self.adyacencia.items()}

    def matriz_adyacencia(self):
        n = len(self.vertices)
        idx = {v: i for i, v in enumerate(self.vertices)}
        m = [[0] * n for _ in range(n)]
        for u in self.vertices:
            for v in self.adyacencia[u]:
                m[idx[u]][idx[v]] = 1
        return m

    def grado(self, v):
        if self.dirigido:
            salida = len(self.adyacencia[v])
            entrada = sum(1 for u in self.vertices if v in self.adyacencia[u])
            return {"entrada": entrada, "salida": salida}
        return len(self.adyacencia[v])

    def vecinos_no_dirigidos(self, v):
        """Vecinos ignorando la dirección (útil para conectividad, bipartición y coloreo)."""
        vecinos = set(self.adyacencia[v])
        if self.dirigido:
            for u in self.vertices:
                if v in self.adyacencia[u]:
                    vecinos.add(u)
        return vecinos

    # ---------------------------------------------------------------
    # Recorridos
    # ---------------------------------------------------------------
    def bfs(self, inicio):
        """Recorrido en anchura. Devuelve el orden de visita."""
        visitados = {inicio}
        cola = deque([inicio])
        orden = []
        while cola:
            actual = cola.popleft()
            orden.append(actual)
            for vecino in sorted(self.adyacencia[actual]):
                if vecino not in visitados:
                    visitados.add(vecino)
                    cola.append(vecino)
        return orden

    def dfs(self, inicio):
        """Recorrido en profundidad (recursivo). Devuelve el orden de visita."""
        visitados = set()
        orden = []

        def _dfs(u):
            visitados.add(u)
            orden.append(u)
            for vecino in sorted(self.adyacencia[u]):
                if vecino not in visitados:
                    _dfs(vecino)

        _dfs(inicio)
        return orden

    # ---------------------------------------------------------------
    # Propiedades estructurales
    # ---------------------------------------------------------------
    def componentes_conexas(self):
        """Componentes conexas ignorando dirección (noción clásica de conectividad)."""
        visitados = set()
        componentes = []
        for v in self.vertices:
            if v in visitados:
                continue
            comp = []
            cola = deque([v])
            visitados.add(v)
            while cola:
                u = cola.popleft()
                comp.append(u)
                for w in self.vecinos_no_dirigidos(u):
                    if w not in visitados:
                        visitados.add(w)
                        cola.append(w)
            componentes.append(comp)
        return componentes

    def es_conexo(self):
        return len(self.componentes_conexas()) <= 1

    def es_bipartito(self):
        """
        Verifica bipartición con un coloreo de 2 colores (BFS).
        Devuelve (True, particion) o (False, None).
        """
        color = {}
        for origen in self.vertices:
            if origen in color:
                continue
            color[origen] = 0
            cola = deque([origen])
            while cola:
                u = cola.popleft()
                for w in self.vecinos_no_dirigidos(u):
                    if w not in color:
                        color[w] = 1 - color[u]
                        cola.append(w)
                    elif color[w] == color[u]:
                        return False, None
        grupo_a = [v for v in self.vertices if color[v] == 0]
        grupo_b = [v for v in self.vertices if color[v] == 1]
        return True, (grupo_a, grupo_b)

    def coloreo_voraz(self):
        """
        Coloreo voraz (greedy): recorre los vértices ordenados por grado
        descendente y asigna a cada uno el menor color disponible que no
        usen sus vecinos. Es una heurística: da una COTA SUPERIOR del
        número cromático real, no siempre el valor mínimo exacto.
        """
        orden = sorted(self.vertices, key=lambda v: len(self.vecinos_no_dirigidos(v)), reverse=True)
        color = {}
        for v in orden:
            usados = {color[u] for u in self.vecinos_no_dirigidos(v) if u in color}
            c = 0
            while c in usados:
                c += 1
            color[v] = c
        num_colores = len(set(color.values())) if color else 0
        return color, num_colores


# =====================================================================
# DEMO — se ejecuta al correr el archivo directamente
# =====================================================================
if __name__ == "__main__":
    g = Grafo(dirigido=False)
    aristas = [("A", "B"), ("A", "C"), ("B", "D"), ("C", "D"), ("D", "E"), ("F", "G")]
    for u, v in aristas:
        g.agregar_arista(u, v)

    print("Vértices:", g.vertices)
    print("Lista de adyacencia:", g.lista_adyacencia())
    print("Matriz de adyacencia:")
    for fila in g.matriz_adyacencia():
        print(" ", fila)

    print("\nGrado de cada vértice:")
    for v in g.vertices:
        print(f"  {v}: {g.grado(v)}")

    print("\nBFS desde A:", g.bfs("A"))
    print("DFS desde A:", g.dfs("A"))

    print("\nComponentes conexas:", g.componentes_conexas())
    print("¿Es conexo?:", g.es_conexo())

    es_bip, particion = g.es_bipartito()
    print("\n¿Es bipartito?:", es_bip, "-> partición:", particion)

    color, k = g.coloreo_voraz()
    print("\nColoreo voraz:", color)
    print("Colores usados (cota superior del número cromático):", k)
