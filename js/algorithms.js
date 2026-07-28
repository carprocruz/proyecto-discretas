/* funciones que pintan los algoritmos*/
const Algorithms = (() => {
  function bfs(start) {
    const visited = new Set([start]);
    const queue = [start];
    const steps = [];
    while (queue.length) {
      const current = queue.shift();
      steps.push(current);
      Graph.neighborsOf(current, true).sort((a, b) => a - b).forEach(neighbor => {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push(neighbor);
        }
      });
    }
    return steps;
  }

  function dfs(start) {
    const visited = new Set();
    const steps = [];
    function visit(node) {
      visited.add(node);
      steps.push(node);
      Graph.neighborsOf(node, true).sort((a, b) => a - b).forEach(neighbor => {
        if (!visited.has(neighbor)) visit(neighbor);
      });
    }
    visit(start);
    return steps;
  }

  function greedyColoring() {
    const order = [...Graph.state.nodes]
      .sort((a, b) => Graph.degreeOf(b.id) - Graph.degreeOf(a.id))
      .map(n => n.id);

    const assignments = {};
    order.forEach(id => {
      const usedColors = new Set(
        Graph.neighborsOf(id, false)
          .map(nb => assignments[nb])
          .filter(v => v !== undefined)
      );
      let color = 0;
      while (usedColors.has(color)) color++;
      assignments[id] = color;
    });

    return { assignments, order, colorCount: new Set(Object.values(assignments)).size };
  }

  return { bfs, dfs, greedyColoring };
})();
