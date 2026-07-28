/*UI — paneles de datos, tabs, toolbar del laboratorio*/
const UI = (() => {
  let currentAlgo = 'bfs';

  function updatePanels() {
    document.getElementById('statN').textContent = Graph.state.nodes.length;
    document.getElementById('statM').textContent = Graph.state.edges.length;

    const components = Graph.connectedComponents();
    document.getElementById('statConn').textContent =
      Graph.state.nodes.length === 0 ? '—' :
      components.length === 1 ? 'Sí' :
      `No (${components.length})`;

    document.getElementById('statType').textContent =
      Graph.state.directed ? 'dirigido' : 'no dirigido';

    updateAdjacencyList();
    updateAdjacencyMatrix();
    updateDegrees();
  }

  function updateAdjacencyList() {
    const container = document.getElementById('adjListBody');
    if (Graph.state.nodes.length === 0) {
      container.innerHTML = '<div>Aún no hay vértices. Añade uno en el laboratorio.</div>';
      return;
    }
    container.innerHTML = Graph.state.nodes.map(node => {
      const neighbors = Graph.neighborsOf(node.id, true)
        .map(id => Graph.getNodeById(id)?.label)
        .filter(Boolean);
      const list = neighbors.length ? neighbors.join(', ') : '(sin conexiones)';
      return `<div><strong>${node.label}</strong> → ${list}</div>`;
    }).join('');
  }

  function updateAdjacencyMatrix() {
    const container = document.getElementById('matrixBody');
    if (Graph.state.nodes.length === 0) {
      container.innerHTML = 'Aún no hay vértices.';
      return;
    }
    let html = '<table class="matrix-table"><tr><th></th>' +
      Graph.state.nodes.map(n => `<th>${n.label}</th>`).join('') + '</tr>';
    Graph.state.nodes.forEach(row => {
      html += `<tr><th>${row.label}</th>` +
        Graph.state.nodes.map(col => {
          const hasEdge = Graph.edgeExists(row.id, col.id) ||
            (!Graph.state.directed && Graph.edgeExists(col.id, row.id));
          return `<td>${row.id === col.id ? '–' : (hasEdge ? 1 : 0)}</td>`;
        }).join('') + '</tr>';
    });
    html += '</table>';
    container.innerHTML = html;
  }

  function updateDegrees() {
    const container = document.getElementById('degreeBody');
    if (Graph.state.nodes.length === 0) {
      container.innerHTML = '<div>Aún no hay vértices.</div>';
      return;
    }
    container.innerHTML = Graph.state.nodes
      .map(node => `<div><strong>${node.label}</strong> — grado ${Graph.degreeOf(node.id)}</div>`)
      .join('');
  }

  function initToolbar() {
    document.querySelectorAll('#editToolbar [data-mode]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#editToolbar [data-mode]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        LabCanvas.setMode(btn.dataset.mode);
        LabCanvas.setConnectFirst(null);

        const hints = {
          move: 'Modo Mover: arrastra un vértice para reubicarlo.',
          addNode: 'Modo Vértice: haz clic en un espacio vacío del lienzo para crear un vértice.',
          connect: 'Modo Conectar: haz clic en un vértice y luego en otro para unirlos con una arista.',
          delete: 'Modo Borrar: haz clic sobre un vértice o una arista para eliminarla.'
        };
        document.getElementById('editHint').textContent = hints[btn.dataset.mode];

        const canvas = document.getElementById('labCanvas');
        canvas.style.cursor =
          btn.dataset.mode === 'move' ? 'grab' :
          btn.dataset.mode === 'delete' ? 'not-allowed' : 'crosshair';

        LabCanvas.render();
      });
    });

    document.getElementById('directedToggle').addEventListener('change', e => {
      Graph.state.directed = e.target.checked;
      document.getElementById('statType').textContent =
        Graph.state.directed ? 'dirigido' : 'no dirigido';
      LabCanvas.render();
      updatePanels();
    });

    document.getElementById('clearGraphBtn').addEventListener('click', () => {
      Graph.clear();
      LabCanvas.clearStartNode();
      LabCanvas.afterGraphChange();
    });
    document.getElementById('btnGenComplete').addEventListener('click', () => {
      GraphGenerators.makeComplete(5); 
    });

    document.getElementById('btnGenBipartite').addEventListener('click', () => {
      GraphGenerators.makeBipartite(3, 4); 
    });

    document.getElementById('btnGenPlanar').addEventListener('click', () => {
      GraphGenerators.makePlanar(7); 
    });

    document.getElementById('randomGraphBtn').addEventListener('click', () => {
      Graph.clear();
      LabCanvas.clearStartNode();
      const canvas = document.getElementById('labCanvas');
      const nodeCount = 6;
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = 170;
      for (let i = 0; i < nodeCount; i++) {
        const angle = (i / nodeCount) * Math.PI * 2 - Math.PI / 2;
        Graph.addNode(centerX + radius * Math.cos(angle), centerY + radius * Math.sin(angle));
      }
      for (let i = 0; i < nodeCount; i++) {
        Graph.addEdge(i, (i + 1) % nodeCount);
      }
      for (let i = 0; i < nodeCount; i++) {
        for (let j = i + 1; j < nodeCount; j++) {
          if (Math.random() < 0.22) Graph.addEdge(i, j);
        }
      }
      LabCanvas.afterGraphChange();
    });
  }

  function initTabs() {
    document.querySelectorAll('.panel-tabs button').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.panel-tabs button').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.data-panel').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        const panelId = 'panel' + btn.dataset.panel[0].toUpperCase() + btn.dataset.panel.slice(1);
        document.getElementById(panelId).classList.add('active');
      });
    });
  }

  function initLabModeSwitch() {
    document.getElementById('tabEdit').addEventListener('click', () => {
      document.getElementById('tabEdit').classList.add('active');
      document.getElementById('tabAlgo').classList.remove('active');
      document.getElementById('editToolbar').style.display = 'flex';
      document.getElementById('editHint').style.display = 'block';
      document.getElementById('algoToolbar').style.display = 'none';
    });

    document.getElementById('tabAlgo').addEventListener('click', () => {
      document.getElementById('tabAlgo').classList.add('active');
      document.getElementById('tabEdit').classList.remove('active');
      document.getElementById('editToolbar').style.display = 'none';
      document.getElementById('editHint').style.display = 'none';
      document.getElementById('algoToolbar').style.display = 'block';
      LabCanvas.setMode('move');
    });
  }

  function initAlgoButtons() {
    document.querySelectorAll('[data-algo]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-algo]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentAlgo = btn.dataset.algo;
        LabCanvas.resetAnimation();
        LabCanvas.log(`Algoritmo seleccionado: ${btn.textContent.trim()}.`);
      });
    });
  }

  function init() {
    initToolbar();
    initTabs();
    initLabModeSwitch();
    initAlgoButtons();
    updatePanels();
  }

  return {
    init,
    updatePanels,
    getCurrentAlgo: () => currentAlgo
  };
})();
