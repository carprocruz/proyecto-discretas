/* renderizado, interacción y animación del lab */
const LabCanvas = (() => {
  const NODE_RADIUS = 20;
  const HOVER_RING_RADIUS = 4;
  const SELECTION_RING_RADIUS = 6;
  const EDGE_HIT_THRESHOLD = 8;
  const ARROW_SIZE = 9;
  const ARROW_OFFSET = 2;
  const ARROW_ANGLE = 0.32;

  let canvas, ctx;
  let mode = 'move';
  let connectFirst = null;
  let dragNode = null;
  let hoverNode = null;
  let pickStartCallback = null;
  let startNodeId = null;

  const visitOrder = {};
  const componentColor = {};
  const coloring = {};

  let animTimer = null;
  let animIndex = 0;
  let currentSteps = [];
  let animApply = null;

  function getPosition(event) {
    const rect = canvas.getBoundingClientRect();
    const clientX = event.touches ? event.touches[0].clientX : event.clientX;
    const clientY = event.touches ? event.touches[0].clientY : event.clientY;
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height)
    };
  }

  function findNodeAt(position) {
    for (let i = Graph.state.nodes.length - 1; i >= 0; i--) {
      const node = Graph.state.nodes[i];
      if (Math.hypot(node.x - position.x, node.y - position.y) <= NODE_RADIUS + HOVER_RING_RADIUS) {
        return node;
      }
    }
    return null;
  }

  function distanceToSegment(point, segmentStart, segmentEnd) {
    const lengthSquared = (segmentEnd.x - segmentStart.x) ** 2 + (segmentEnd.y - segmentStart.y) ** 2;
    if (lengthSquared === 0) return Math.hypot(point.x - segmentStart.x, point.y - segmentStart.y);
    let t = ((point.x - segmentStart.x) * (segmentEnd.x - segmentStart.x) +
             (point.y - segmentStart.y) * (segmentEnd.y - segmentStart.y)) / lengthSquared;
    t = Math.max(0, Math.min(1, t));
    const projectionX = segmentStart.x + t * (segmentEnd.x - segmentStart.x);
    const projectionY = segmentStart.y + t * (segmentEnd.y - segmentStart.y);
    return Math.hypot(point.x - projectionX, point.y - projectionY);
  }

  function findEdgeAt(position) {
    for (const edge of Graph.state.edges) {
      const startNode = Graph.getNodeById(edge.from);
      const endNode = Graph.getNodeById(edge.to);
      if (!startNode || !endNode) continue;
      if (distanceToSegment(position, startNode, endNode) < EDGE_HIT_THRESHOLD) return edge;
    }
    return null;
  }

  function drawArrowHead(x1, y1, x2, y2) {
    const angle = Math.atan2(y2 - y1, x2 - x1);
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - ARROW_SIZE * Math.cos(angle - ARROW_ANGLE), y2 - ARROW_SIZE * Math.sin(angle - ARROW_ANGLE));
    ctx.lineTo(x2 - ARROW_SIZE * Math.cos(angle + ARROW_ANGLE), y2 - ARROW_SIZE * Math.sin(angle + ARROW_ANGLE));
    ctx.closePath();
    ctx.fillStyle = '#7c8595';
    ctx.fill();
  }

  function getNodeColor(node) {
    if (coloring[node.id] !== undefined) return Graph.PALETTE[coloring[node.id] % Graph.PALETTE.length];
    if (componentColor[node.id] !== undefined) return Graph.PALETTE[componentColor[node.id] % Graph.PALETTE.length];
    if (visitOrder[node.id] !== undefined) return Graph.PALETTE[1];
    return Graph.PALETTE[node.id % Graph.PALETTE.length];
  }

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    Graph.state.edges.forEach(edge => {
      const startNode = Graph.getNodeById(edge.from);
      const endNode = Graph.getNodeById(edge.to);
      if (!startNode || !endNode) return;
      ctx.beginPath();
      ctx.moveTo(startNode.x, startNode.y);
      ctx.lineTo(endNode.x, endNode.y);
      ctx.strokeStyle = '#7c8595';
      ctx.lineWidth = 2;
      ctx.stroke();
      if (Graph.state.directed) {
        const dx = endNode.x - startNode.x;
        const dy = endNode.y - startNode.y;
        const length = Math.hypot(dx, dy) || 1;
        const arrowX = endNode.x - (dx / length) * (NODE_RADIUS + ARROW_OFFSET);
        const arrowY = endNode.y - (dy / length) * (NODE_RADIUS + ARROW_OFFSET);
        drawArrowHead(startNode.x, startNode.y, arrowX, arrowY);
      }
    });

    Graph.state.nodes.forEach(node => {
      ctx.beginPath();
      ctx.arc(node.x, node.y, NODE_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = getNodeColor(node);
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = (node.id === connectFirst || node.id === startNodeId) ? '#ffffff' : '#10131a';
      ctx.stroke();

      if (node.id === startNodeId) {
        ctx.beginPath();
        ctx.setLineDash([4, 3]);
        ctx.arc(node.x, node.y, NODE_RADIUS + SELECTION_RING_RADIUS, 0, Math.PI * 2);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.setLineDash([]);
      }

      if (node === hoverNode && mode !== 'move') {
        ctx.beginPath();
        ctx.arc(node.x, node.y, NODE_RADIUS + HOVER_RING_RADIUS, 0, Math.PI * 2);
        ctx.strokeStyle = '#ffffff55';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      ctx.fillStyle = '#101319';
      ctx.font = '600 14px Space Grotesk, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.label, node.x, node.y);

      if (visitOrder[node.id] !== undefined) {
        ctx.fillStyle = '#e9e7e0';
        ctx.font = '600 12px JetBrains Mono, monospace';
        ctx.fillText('#' + visitOrder[node.id], node.x, node.y - NODE_RADIUS - 12);
      }
    });
  }

  function clearAlgoState() {
    Object.keys(visitOrder).forEach(k => delete visitOrder[k]);
    Object.keys(componentColor).forEach(k => delete componentColor[k]);
    Object.keys(coloring).forEach(k => delete coloring[k]);
  }

  function afterGraphChange() {
    clearAlgoState();
    UI.updatePanels();
    render();
  }

  function log(message, highlight) {
    const box = document.getElementById('logBox');
    const div = document.createElement('div');
    if (highlight) div.className = 'hl';
    div.textContent = message;
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
  }

  function logClear() {
    document.getElementById('logBox').innerHTML = '';
  }

  function resetAnimation() {
    clearInterval(animTimer);
    animTimer = null;
    animIndex = 0;
    currentSteps = [];
    animApply = null;
    clearAlgoState();
    render();
  }

  function stepAnimation() {
    if (animIndex >= currentSteps.length) {
      clearInterval(animTimer);
      animTimer = null;
      log('— Animación completa —', true);
      return;
    }
    animApply(currentSteps[animIndex], animIndex);
    animIndex++;
    render();
  }

  function playAnimation() {
    if (animTimer || currentSteps.length === 0) return;
    animTimer = setInterval(stepAnimation, Number(document.getElementById('speedRange').value));
  }

  function pauseAnimation() {
    clearInterval(animTimer);
    animTimer = null;
  }

  function runAlgorithm() {
    resetAnimation();
    logClear();
    if (Graph.state.nodes.length === 0) {
      log('Primero construye un grafo en modo Editar.');
      return;
    }

    const currentAlgo = UI.getCurrentAlgo();

    if (currentAlgo === 'bfs' || currentAlgo === 'dfs') {
      if (startNodeId === null || !Graph.getNodeById(startNodeId)) {
        log('Elige primero un vértice inicial con «Elegir vértice inicial».');
        return;
      }
      const order = currentAlgo === 'bfs' ? Algorithms.bfs(startNodeId) : Algorithms.dfs(startNodeId);
      log(`${currentAlgo.toUpperCase()} desde ${Graph.getNodeById(startNodeId).label}:`, true);
      currentSteps = order;
      animApply = (nodeId, i) => {
        visitOrder[nodeId] = i + 1;
        log(`Paso ${i + 1}: visitar ${Graph.getNodeById(nodeId).label}`);
      };
      playAnimation();
    }

    if (currentAlgo === 'comp') {
      const components = Graph.connectedComponents();
      log(`Se encontraron ${components.length} componente(s) conexa(s).`, true);
      currentSteps = components.flatMap((comp, ci) => comp.map(id => ({ id, ci })));
      animApply = (step) => {
        componentColor[step.id] = step.ci;
        log(`${Graph.getNodeById(step.id).label} → componente ${step.ci + 1}`);
      };
      playAnimation();
    }

    if (currentAlgo === 'color') {
      const { assignments, order, colorCount } = Algorithms.greedyColoring();
      log(`Coloreo voraz: usa ${colorCount} color(es) (cota superior del número cromático real).`, true);
      currentSteps = order;
      animApply = (id) => {
        coloring[id] = assignments[id];
        log(`${Graph.getNodeById(id).label} → color ${assignments[id] + 1}`);
      };
      playAnimation();
    }
  }

  function initEventListeners() {
    canvas.addEventListener('pointerdown', event => {
      const position = getPosition(event);
      const node = findNodeAt(position);

      if (pickStartCallback) {
        if (node) {
          pickStartCallback(node.id);
          pickStartCallback = null;
          render();
        }
        return;
      }

      if (mode === 'addNode') {
        if (!node) {
          Graph.addNode(position.x, position.y);
          afterGraphChange();
        }
        return;
      }

      if (mode === 'connect') {
        if (node) {
          if (connectFirst === null) {
            connectFirst = node.id;
          } else {
            if (connectFirst !== node.id) {
              Graph.addEdge(connectFirst, node.id);
              afterGraphChange();
            }
            connectFirst = null;
          }
        } else {
          connectFirst = null;
        }
        render();
        return;
      }

      if (mode === 'delete') {
        if (node) {
          Graph.removeNode(node.id);
        } else {
          const edge = findEdgeAt(position);
          if (edge) Graph.removeEdge(edge.id);
        }
        afterGraphChange();
        return;
      }

      if (mode === 'move') {
        if (node) {
          dragNode = node.id;
          canvas.style.cursor = 'grabbing';
        }
      }
    });

    canvas.addEventListener('pointermove', event => {
      const position = getPosition(event);
      if (dragNode !== null) {
        const node = Graph.getNodeById(dragNode);
        node.x = Math.max(NODE_RADIUS, Math.min(canvas.width - NODE_RADIUS, position.x));
        node.y = Math.max(NODE_RADIUS, Math.min(canvas.height - NODE_RADIUS, position.y));
        render();
      } else {
        hoverNode = findNodeAt(position);
        render();
      }
    });

    window.addEventListener('pointerup', () => {
      dragNode = null;
      canvas.style.cursor = mode === 'move' ? 'grab' : 'crosshair';
    });

    document.getElementById('speedRange').addEventListener('input', e => {
      document.getElementById('speedVal').textContent = e.target.value + 'ms';
      if (animTimer) {
        pauseAnimation();
        playAnimation();
      }
    });

    document.getElementById('playPauseBtn').addEventListener('click', () => {
      animTimer ? pauseAnimation() : playAnimation();
    });

    document.getElementById('stepBtn').addEventListener('click', () => {
      pauseAnimation();
      stepAnimation();
    });

    document.getElementById('resetAlgoBtn').addEventListener('click', () => {
      resetAnimation();
      logClear();
      log('Reiniciado.');
    });

    document.getElementById('runAlgoBtn').addEventListener('click', runAlgorithm);

    document.getElementById('pickStartBtn').addEventListener('click', () => {
      log('Haz clic sobre un vértice del lienzo para fijarlo como inicio.');
      pickStartCallback = (id) => {
        startNodeId = id;
        log(`Vértice inicial: ${Graph.getNodeById(id).label}`);
      };
    });
  }

  function init() {
    canvas = document.getElementById('labCanvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    initEventListeners();
    render();
  }

  return {
    init,
    render,
    afterGraphChange,
    clearAlgoState,
    resetAnimation,
    log,
    logClear,
    getMode: () => mode,
    setMode: (newMode) => { mode = newMode; },
    getConnectFirst: () => connectFirst,
    setConnectFirst: (val) => { connectFirst = val; },
    getStartNodeId: () => startNodeId,
    clearStartNode: () => { startNodeId = null; }
  };
})();
