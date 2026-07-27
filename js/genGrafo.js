const GraphGenerators = (() => {
  function clearCurrentGraph() {
    Graph.clear();
    LabCanvas.clearStartNode();
  }

  function getCanvasCenter() {
    const cvs = document.getElementById('labCanvas');
    return { cx: cvs.width / 2, cy: cvs.height / 2, w: cvs.width, h: cvs.height };
  }

  function makeComplete(n = 5) {
    clearCurrentGraph();
    const { cx, cy } = getCanvasCenter();
    const radius = Math.min(cx, cy) - 60;
    const newNodes = [];

    for (let i = 0; i < n; i++) {
      const angle = (i * 2 * Math.PI) / n - Math.PI / 2;
      Graph.addNode(cx + radius * Math.cos(angle), cy + radius * Math.sin(angle));
      newNodes.push(Graph.state.nodes[Graph.state.nodes.length - 1].id);
    }

    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        Graph.addEdge(newNodes[i], newNodes[j]);
      }
    }
    LabCanvas.afterGraphChange();
    LabCanvas.log(`Grafo Completo K${n} generado.`, true);
  }

  function makeBipartite(n1 = 3, n2 = 3) {
    clearCurrentGraph();
    const { w, h } = getCanvasCenter();
    const col1X = w * 0.3; 
    const col2X = w * 0.7; 
    const nodesA = [];
    const nodesB = [];

    for (let i = 0; i < n1; i++) {
      Graph.addNode(col1X, h * ((i + 1) / (n1 + 1)));
      nodesA.push(Graph.state.nodes[Graph.state.nodes.length - 1].id);
    }
    for (let i = 0; i < n2; i++) {
      Graph.addNode(col2X, h * ((i + 1) / (n2 + 1)));
      nodesB.push(Graph.state.nodes[Graph.state.nodes.length - 1].id);
    }
    for (const idA of nodesA) {
      for (const idB of nodesB) {
        Graph.addEdge(idA, idB);
      }
    }
    LabCanvas.afterGraphChange();
    LabCanvas.log(`Grafo Bipartito K${n1},${n2} generado.`, true);
  }

  function makePlanar(n = 6) {
    clearCurrentGraph();
    const { cx, cy } = getCanvasCenter();
    const radius = Math.min(cx, cy) - 60;
    
    Graph.addNode(cx, cy);
    const centerId = Graph.state.nodes[Graph.state.nodes.length - 1].id;
    const cycleNodes = [];

    const outerCount = n - 1;
    for (let i = 0; i < outerCount; i++) {
      const angle = (i * 2 * Math.PI) / outerCount - Math.PI / 2;
      Graph.addNode(cx + radius * Math.cos(angle), cy + radius * Math.sin(angle));
      cycleNodes.push(Graph.state.nodes[Graph.state.nodes.length - 1].id);
    }

    for (let i = 0; i < cycleNodes.length; i++) {
      Graph.addEdge(centerId, cycleNodes[i]); 
      Graph.addEdge(cycleNodes[i], cycleNodes[(i + 1) % cycleNodes.length]); 
    }
    LabCanvas.afterGraphChange();
    LabCanvas.log(`Grafo Planar (Rueda W${n}) generado.`, true);
  }

  return { makeComplete, makeBipartite, makePlanar };
})();