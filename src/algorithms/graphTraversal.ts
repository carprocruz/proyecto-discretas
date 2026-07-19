export function traverseGraph(graph: { vertices: Array<{ id: string }> }, start: string) {
  return graph.vertices.filter((vertex) => vertex.id !== start);
}
