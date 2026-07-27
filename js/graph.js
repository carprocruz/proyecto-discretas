/* ============================================================
   GRAPH — estado del grafo y operaciones sobre él
   ============================================================ */
const Graph = (() => {
  const state = { directed: false, nodes: [], edges: [] };
  const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const PALETTE = ['#ff6b5b', '#ffbe4d', '#4fd6ca', '#a293ff'];

  let nodeSeq = 0;
  let edgeSeq = 0;

  function makeLabel() {
    const i = nodeSeq;
    return i < 26 ? LETTERS[i] : LETTERS[i % 26] + Math.floor(i / 26);
  }

  function getNodeById(id) {
    return state.nodes.find(n => n.id === id);
  }

  function addNode(x, y) {
    state.nodes.push({ id: nodeSeq, x, y, label: makeLabel() });
    nodeSeq++;
  }

  function edgeExists(a, b) {
    return state.edges.some(e =>
      state.directed
        ? e.from === a && e.to === b
        : (e.from === a && e.to === b) || (e.from === b && e.to === a)
    );
  }

  function addEdge(a, b) {
    if (a === b || edgeExists(a, b)) return;
    state.edges.push({ id: edgeSeq++, from: a, to: b });
  }

  function removeNode(id) {
    state.nodes = state.nodes.filter(n => n.id !== id);
    state.edges = state.edges.filter(e => e.from !== id && e.to !== id);
  }

  function removeEdge(id) {
    state.edges = state.edges.filter(e => e.id !== id);
  }

  function neighborsOf(id, respectDirection) {
    if (respectDirection && state.directed) {
      return state.edges.filter(e => e.from === id).map(e => e.to);
    }
    const result = [];
    state.edges.forEach(e => {
      if (e.from === id) result.push(e.to);
      else if (e.to === id) result.push(e.from);
    });
    return result;
  }

  function degreeOf(id) {
    return neighborsOf(id, false).length;
  }

  function connectedComponents() {
    const seen = new Set();
    const components = [];
    state.nodes.forEach(n => {
      if (seen.has(n.id)) return;
      const component = [];
      const queue = [n.id];
      seen.add(n.id);
      while (queue.length) {
        const current = queue.shift();
        component.push(current);
        neighborsOf(current, false).forEach(neighbor => {
          if (!seen.has(neighbor)) {
            seen.add(neighbor);
            queue.push(neighbor);
          }
        });
      }
      components.push(component);
    });
    return components;
  }

  function clear() {
    state.nodes = [];
    state.edges = [];
    nodeSeq = 0;
    edgeSeq = 0;
  }

  function resetSequences() {
    nodeSeq = 0;
    edgeSeq = 0;
  }

  return {
    state,
    PALETTE,
    getNodeById,
    addNode,
    addEdge,
    edgeExists,
    removeNode,
    removeEdge,
    neighborsOf,
    degreeOf,
    connectedComponents,
    clear,
    resetSequences
  };
})();
