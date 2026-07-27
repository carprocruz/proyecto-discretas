/* ============================================================
   HERO CANVAS — grafo aleatorio ambiental en el hero
   ============================================================ */
const HeroCanvas = (() => {
  const NODE_MARGIN = 40;
  const NODE_RADIUS = 9;
  const BOUNCE_MARGIN = 24;
  const SPEED_RANGE = 0.25;
  const REGEN_INTERVAL_MS = 5000;
  const REGEN_PROBABILITY = 0.4;
  const MIN_NODES = 8;
  const EXTRA_NODES = 4;
  const MIN_LINKS = 1;
  const EXTRA_LINKS = 2;

  let nodes = [];
  let edges = [];
  let canvas, ctx;

  function generate() {
    nodes = [];
    edges = [];
    const count = MIN_NODES + Math.floor(Math.random() * EXTRA_NODES);

    for (let i = 0; i < count; i++) {
      nodes.push({
        x: NODE_MARGIN + Math.random() * (canvas.width - NODE_MARGIN * 2),
        y: NODE_MARGIN + Math.random() * (canvas.height - NODE_MARGIN * 2),
        vx: (Math.random() - 0.5) * SPEED_RANGE,
        vy: (Math.random() - 0.5) * SPEED_RANGE,
        color: Graph.PALETTE[i % Graph.PALETTE.length]
      });
    }

    for (let i = 0; i < count; i++) {
      const linkCount = MIN_LINKS + Math.floor(Math.random() * EXTRA_LINKS);
      for (let k = 0; k < linkCount; k++) {
        const j = Math.floor(Math.random() * count);
        if (j !== i) edges.push([i, j]);
      }
    }

    const caption = document.getElementById('heroCapInfo');
    if (caption) {
      caption.textContent = `${count} vértices · ${edges.length} aristas`;
    }
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    nodes.forEach(node => {
      node.x += node.vx;
      node.y += node.vy;
      if (node.x < BOUNCE_MARGIN || node.x > canvas.width - BOUNCE_MARGIN) node.vx *= -1;
      if (node.y < BOUNCE_MARGIN || node.y > canvas.height - BOUNCE_MARGIN) node.vy *= -1;
    });

    ctx.strokeStyle = '#394155aa';
    ctx.lineWidth = 1.4;
    edges.forEach(([a, b]) => {
      ctx.beginPath();
      ctx.moveTo(nodes[a].x, nodes[a].y);
      ctx.lineTo(nodes[b].x, nodes[b].y);
      ctx.stroke();
    });

    nodes.forEach(node => {
      ctx.beginPath();
      ctx.arc(node.x, node.y, NODE_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = node.color;
      ctx.fill();
    });

    requestAnimationFrame(draw);
  }

  function init() {
    canvas = document.getElementById('heroCanvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    generate();
    draw();
    setInterval(() => {
      if (Math.random() < REGEN_PROBABILITY) generate();
    }, REGEN_INTERVAL_MS);
  }

  return { init };
})();
