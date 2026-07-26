/* ============================================================
   ESTADO DEL GRAFO (compartido por Laboratorio y Retos)
   ============================================================ */
const graph = { directed:false, nodes:[], edges:[] };
let nodeSeq = 0, edgeSeq = 0;
const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
function makeLabel(){
  const i = nodeSeq;
  return i < 26 ? LETTERS[i] : LETTERS[i%26] + Math.floor(i/26);
}
const PALETTE = ['#ff6b5b','#ffbe4d','#4fd6ca','#a293ff'];

function addNode(x,y){
  graph.nodes.push({id:nodeSeq, x, y, label:makeLabel()});
  nodeSeq++;
  afterGraphChange();
}
function edgeExists(a,b){
  return graph.edges.some(e => graph.directed ? (e.from===a && e.to===b) : ((e.from===a&&e.to===b)||(e.from===b&&e.to===a)));
}
function addEdge(a,b){
  if(a===b || edgeExists(a,b)) return;
  graph.edges.push({id:edgeSeq++, from:a, to:b});
  afterGraphChange();
}
function removeNode(id){
  graph.nodes = graph.nodes.filter(n=>n.id!==id);
  graph.edges = graph.edges.filter(e=>e.from!==id && e.to!==id);
  afterGraphChange();
}
function removeEdge(id){
  graph.edges = graph.edges.filter(e=>e.id!==id);
  afterGraphChange();
}
function neighborsOf(id, respectDirection){
  if(respectDirection && graph.directed){
    return graph.edges.filter(e=>e.from===id).map(e=>e.to);
  }
  const out = [];
  graph.edges.forEach(e=>{
    if(e.from===id) out.push(e.to);
    else if(e.to===id) out.push(e.from);
  });
  return out;
}
function degreeOf(id){ return neighborsOf(id,false).length; }

function connectedComponents(){
  const seen = new Set(); const comps = [];
  graph.nodes.forEach(n=>{
    if(seen.has(n.id)) return;
    const comp = []; const q=[n.id]; seen.add(n.id);
    while(q.length){
      const cur = q.shift(); comp.push(cur);
      neighborsOf(cur,false).forEach(nb=>{ if(!seen.has(nb)){ seen.add(nb); q.push(nb);} });
    }
    comps.push(comp);
  });
  return comps;
}

/* ============================================================
   HERO CANVAS — grafo aleatorio ambiental
   ============================================================ */
const heroCanvas = document.getElementById('heroCanvas');
const hctx = heroCanvas.getContext('2d');
let heroNodes = [], heroEdges = [];
function genHero(){
  heroNodes = []; heroEdges = [];
  const n = 8 + Math.floor(Math.random()*4);
  for(let i=0;i<n;i++){
    heroNodes.push({
      x: 40+Math.random()*(heroCanvas.width-80),
      y: 40+Math.random()*(heroCanvas.height-80),
      vx:(Math.random()-.5)*.25, vy:(Math.random()-.5)*.25,
      c: PALETTE[i%4]
    });
  }
  for(let i=0;i<n;i++){
    const links = 1+Math.floor(Math.random()*2);
    for(let k=0;k<links;k++){
      const j = Math.floor(Math.random()*n);
      if(j!==i) heroEdges.push([i,j]);
    }
  }
  document.getElementById('heroCapInfo').textContent = `${n} vértices · ${heroEdges.length} aristas`;
}
function drawHero(){
  hctx.clearRect(0,0,heroCanvas.width,heroCanvas.height);
  heroNodes.forEach(n=>{
    n.x+=n.vx; n.y+=n.vy;
    if(n.x<24||n.x>heroCanvas.width-24) n.vx*=-1;
    if(n.y<24||n.y>heroCanvas.height-24) n.vy*=-1;
  });
  hctx.strokeStyle = '#394155aa'; hctx.lineWidth=1.4;
  heroEdges.forEach(([a,b])=>{
    hctx.beginPath(); hctx.moveTo(heroNodes[a].x,heroNodes[a].y); hctx.lineTo(heroNodes[b].x,heroNodes[b].y); hctx.stroke();
  });
  heroNodes.forEach(n=>{
    hctx.beginPath(); hctx.arc(n.x,n.y,9,0,Math.PI*2);
    hctx.fillStyle=n.c; hctx.fill();
  });
  requestAnimationFrame(drawHero);
}
genHero(); drawHero();
setInterval(()=>{ if(Math.random()<0.4) genHero(); }, 5000);

/* ============================================================
   TEORÍA — tabs
   ============================================================ */
document.querySelectorAll('.tt-btn').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    document.querySelectorAll('.tt-btn').forEach(b=>b.classList.remove('active'));
    document.querySelectorAll('.theory-panel').forEach(p=>p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('panel-'+btn.dataset.t).classList.add('active');
  });
});

/* ============================================================
   LABORATORIO — canvas principal
   ============================================================ */
const labCanvas = document.getElementById('labCanvas');
const lctx = labCanvas.getContext('2d');
const RADIUS = 20;
let mode = 'move';
let connectFirst = null;
let dragNode = null;
let hoverNode = null;
let pickStartCallback = null;

// resultados de algoritmos para pintar
let visitOrder = {};      // nodeId -> paso (número)
let componentColor = {};  // nodeId -> índice de color (componentes)
let coloring = {};        // nodeId -> índice de color (coloreo)
let startNodeId = null;

function getPos(e){
  const r = labCanvas.getBoundingClientRect();
  const cx = (e.touches ? e.touches[0].clientX : e.clientX);
  const cy = (e.touches ? e.touches[0].clientY : e.clientY);
  return { x:(cx-r.left)*(labCanvas.width/r.width), y:(cy-r.top)*(labCanvas.height/r.height) };
}
function nodeAt(pos){
  for(let i=graph.nodes.length-1;i>=0;i--){
    const n = graph.nodes[i];
    if(Math.hypot(n.x-pos.x, n.y-pos.y) <= RADIUS+4) return n;
  }
  return null;
}
function edgeAt(pos){
  for(const e of graph.edges){
    const a = graph.nodes.find(n=>n.id===e.from), b = graph.nodes.find(n=>n.id===e.to);
    if(!a||!b) continue;
    const d = distToSeg(pos, a, b);
    if(d < 8) return e;
  }
  return null;
}
function distToSeg(p,a,b){
  const l2 = (b.x-a.x)**2+(b.y-a.y)**2;
  if(l2===0) return Math.hypot(p.x-a.x,p.y-a.y);
  let t = ((p.x-a.x)*(b.x-a.x)+(p.y-a.y)*(b.y-a.y))/l2;
  t = Math.max(0,Math.min(1,t));
  const px = a.x+t*(b.x-a.x), py = a.y+t*(b.y-a.y);
  return Math.hypot(p.x-px,p.y-py);
}

function drawArrowHead(x1,y1,x2,y2){
  const ang = Math.atan2(y2-y1,x2-x1);
  const size=9;
  lctx.beginPath();
  lctx.moveTo(x2,y2);
  lctx.lineTo(x2-size*Math.cos(ang-0.32), y2-size*Math.sin(ang-0.32));
  lctx.lineTo(x2-size*Math.cos(ang+0.32), y2-size*Math.sin(ang+0.32));
  lctx.closePath();
  lctx.fillStyle = '#7c8595';
  lctx.fill();
}

function render(){
  lctx.clearRect(0,0,labCanvas.width,labCanvas.height);

  // edges
  graph.edges.forEach(e=>{
    const a = graph.nodes.find(n=>n.id===e.from), b = graph.nodes.find(n=>n.id===e.to);
    if(!a||!b) return;
    lctx.beginPath();
    lctx.moveTo(a.x,a.y); lctx.lineTo(b.x,b.y);
    lctx.strokeStyle = '#7c8595'; lctx.lineWidth=2;
    lctx.stroke();
    if(graph.directed){
      const dx=b.x-a.x, dy=b.y-a.y, len=Math.hypot(dx,dy)||1;
      const ex = b.x-(dx/len)*(RADIUS+2), ey = b.y-(dy/len)*(RADIUS+2);
      drawArrowHead(a.x,a.y,ex,ey);
    }
  });

  // connect-mode highlight line to cursor-ish (first selection ring only)
  graph.nodes.forEach(n=>{
    let fill = '#374156';
    if(coloring[n.id]!==undefined) fill = PALETTE[coloring[n.id]%PALETTE.length];
    else if(componentColor[n.id]!==undefined) fill = PALETTE[componentColor[n.id]%PALETTE.length];
    else if(visitOrder[n.id]!==undefined) fill = PALETTE[1];
    else fill = PALETTE[n.id%PALETTE.length];

    lctx.beginPath();
    lctx.arc(n.x,n.y,RADIUS,0,Math.PI*2);
    lctx.fillStyle = fill;
    lctx.fill();
    lctx.lineWidth = 2.5;
    lctx.strokeStyle = (n.id===connectFirst) ? '#ffffff' : (n.id===startNodeId ? '#ffffff' : '#10131a');
    lctx.stroke();

    if(n.id===startNodeId){
      lctx.beginPath();
      lctx.setLineDash([4,3]);
      lctx.arc(n.x,n.y,RADIUS+6,0,Math.PI*2);
      lctx.strokeStyle = '#ffffff';
      lctx.lineWidth=1.5;
      lctx.stroke();
      lctx.setLineDash([]);
    }
    if(n===hoverNode && mode!=='move'){
      lctx.beginPath(); lctx.arc(n.x,n.y,RADIUS+4,0,Math.PI*2);
      lctx.strokeStyle='#ffffff55'; lctx.lineWidth=1.5; lctx.stroke();
    }

    lctx.fillStyle = '#101319';
    lctx.font = '600 14px Space Grotesk, sans-serif';
    lctx.textAlign='center'; lctx.textBaseline='middle';
    lctx.fillText(n.label, n.x, n.y);

    if(visitOrder[n.id]!==undefined){
      lctx.fillStyle = '#e9e7e0';
      lctx.font = '600 12px JetBrains Mono, monospace';
      lctx.fillText('#'+visitOrder[n.id], n.x, n.y-RADIUS-12);
    }
  });
}

function afterGraphChange(){
  visitOrder = {}; componentColor = {}; coloring = {};
  updatePanels();
  render();
}

/* ---- edición: modos ---- */
document.querySelectorAll('#editToolbar [data-mode]').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    document.querySelectorAll('#editToolbar [data-mode]').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    mode = btn.dataset.mode;
    connectFirst = null;
    const hints = {
      move:'Modo Mover: arrastra un vértice para reubicarlo.',
      addNode:'Modo Vértice: haz clic en un espacio vacío del lienzo para crear un vértice.',
      connect:'Modo Conectar: haz clic en un vértice y luego en otro para unirlos con una arista.',
      delete:'Modo Borrar: haz clic sobre un vértice o una arista para eliminarla.'
    };
    document.getElementById('editHint').textContent = hints[mode];
    labCanvas.style.cursor = mode==='move' ? 'grab' : mode==='delete' ? 'not-allowed' : 'crosshair';
    render();
  });
});

document.getElementById('directedToggle').addEventListener('change', e=>{
  graph.directed = e.target.checked;
  document.getElementById('statType').textContent = graph.directed ? 'dirigido' : 'no dirigido';
  render(); updatePanels();
});

document.getElementById('clearGraphBtn').addEventListener('click', ()=>{
  graph.nodes = []; graph.edges = []; nodeSeq=0; edgeSeq=0; startNodeId=null;
  afterGraphChange();
});

document.getElementById('randomGraphBtn').addEventListener('click', ()=>{
  graph.nodes=[]; graph.edges=[]; nodeSeq=0; edgeSeq=0; startNodeId=null;
  const n = 6;
  const cx = labCanvas.width/2, cy = labCanvas.height/2, r = 170;
  for(let i=0;i<n;i++){
    const ang = (i/n)*Math.PI*2 - Math.PI/2;
    addNode(cx+r*Math.cos(ang), cy+r*Math.sin(ang));
  }
  for(let i=0;i<n;i++) addEdge(i,(i+1)%n); // asegura conexidad (ciclo)
  for(let i=0;i<n;i++){
    for(let j=i+1;j<n;j++){
      if(Math.random()<0.22) addEdge(i,j);
    }
  }
  afterGraphChange();
});

/* ---- eventos de puntero en el lienzo ---- */
labCanvas.addEventListener('pointerdown', e=>{
  const pos = getPos(e);
  const n = nodeAt(pos);

  if(pickStartCallback){
    if(n){ pickStartCallback(n.id); pickStartCallback = null; render(); }
    return;
  }
  if(mode==='addNode'){ if(!n) addNode(pos.x,pos.y); return; }
  if(mode==='connect'){
    if(n){
      if(connectFirst===null){ connectFirst=n.id; }
      else { if(connectFirst!==n.id) addEdge(connectFirst,n.id); connectFirst=null; }
    } else { connectFirst=null; }
    render();
    return;
  }
  if(mode==='delete'){
    if(n){ removeNode(n.id); }
    else { const ed = edgeAt(pos); if(ed) removeEdge(ed.id); }
    return;
  }
  if(mode==='move'){ if(n){ dragNode=n.id; labCanvas.style.cursor='grabbing'; } return; }
});
labCanvas.addEventListener('pointermove', e=>{
  const pos = getPos(e);
  if(dragNode!==null){
    const n = graph.nodes.find(x=>x.id===dragNode);
    n.x = Math.max(RADIUS, Math.min(labCanvas.width-RADIUS,pos.x));
    n.y = Math.max(RADIUS, Math.min(labCanvas.height-RADIUS,pos.y));
    render();
  } else {
    hoverNode = nodeAt(pos);
    render();
  }
});
window.addEventListener('pointerup', ()=>{ dragNode=null; labCanvas.style.cursor = mode==='move'?'grab':'crosshair'; });

/* ---- paneles de datos ---- */
document.querySelectorAll('.panel-tabs button').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    document.querySelectorAll('.panel-tabs button').forEach(b=>b.classList.remove('active'));
    document.querySelectorAll('.data-panel').forEach(p=>p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('panel'+btn.dataset.panel[0].toUpperCase()+btn.dataset.panel.slice(1)).classList.add('active');
  });
});

function updatePanels(){
  document.getElementById('statN').textContent = graph.nodes.length;
  document.getElementById('statM').textContent = graph.edges.length;
  const comps = connectedComponents();
  document.getElementById('statConn').textContent = graph.nodes.length===0 ? '—' : (comps.length===1 ? 'Sí' : 'No ('+comps.length+')');
  document.getElementById('statType').textContent = graph.directed ? 'dirigido' : 'no dirigido';

  // lista de adyacencia
  const adjBody = document.getElementById('adjListBody');
  if(graph.nodes.length===0){ adjBody.innerHTML = '<div>Aún no hay vértices. Añade uno en el laboratorio.</div>'; }
  else {
    adjBody.innerHTML = graph.nodes.map(n=>{
      const nb = neighborsOf(n.id, true).map(id=>graph.nodes.find(x=>x.id===id)?.label).filter(Boolean);
      return `<div><strong>${n.label}</strong> → ${nb.length? nb.join(', ') : '(sin conexiones)'}</div>`;
    }).join('');
  }

  // matriz de adyacencia
  const matBody = document.getElementById('matrixBody');
  if(graph.nodes.length===0){ matBody.innerHTML = 'Aún no hay vértices.'; }
  else{
    let html = '<table class="matrix-table"><tr><th></th>' + graph.nodes.map(n=>`<th>${n.label}</th>`).join('') + '</tr>';
    graph.nodes.forEach(r=>{
      html += `<tr><th>${r.label}</th>` + graph.nodes.map(c=>{
        const v = edgeExists(r.id,c.id) || (!graph.directed && edgeExists(c.id,r.id)) ? 1 : 0;
        return `<td>${r.id===c.id?'–':v}</td>`;
      }).join('') + '</tr>';
    });
    html += '</table>';
    matBody.innerHTML = html;
  }

  // grados
  const degBody = document.getElementById('degreeBody');
  if(graph.nodes.length===0){ degBody.innerHTML = '<div>Aún no hay vértices.</div>'; }
  else {
    degBody.innerHTML = graph.nodes.map(n=>`<div><strong>${n.label}</strong> — grado ${degreeOf(n.id)}</div>`).join('');
  }
}
updatePanels();
render();

/* ============================================================
   LABORATORIO — cambio entre modo Editar / Algoritmos
   ============================================================ */
document.getElementById('tabEdit').addEventListener('click', ()=>{
  document.getElementById('tabEdit').classList.add('active');
  document.getElementById('tabAlgo').classList.remove('active');
  document.getElementById('editToolbar').style.display='flex';
  document.getElementById('editHint').style.display='block';
  document.getElementById('algoToolbar').style.display='none';
});
document.getElementById('tabAlgo').addEventListener('click', ()=>{
  document.getElementById('tabAlgo').classList.add('active');
  document.getElementById('tabEdit').classList.remove('active');
  document.getElementById('editToolbar').style.display='none';
  document.getElementById('editHint').style.display='none';
  document.getElementById('algoToolbar').style.display='block';
  mode='move';
});

/* ============================================================
   ALGORITMOS
   ============================================================ */
let currentAlgo = 'bfs';
document.querySelectorAll('[data-algo]').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    document.querySelectorAll('[data-algo]').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    currentAlgo = btn.dataset.algo;
    resetAnimation();
    log(`Algoritmo seleccionado: ${btn.textContent.trim()}.`);
  });
});

document.getElementById('pickStartBtn').addEventListener('click', ()=>{
  log('Haz clic sobre un vértice del lienzo para fijarlo como inicio.');
  pickStartCallback = (id)=>{ startNodeId=id; log(`Vértice inicial: ${graph.nodes.find(n=>n.id===id).label}`); };
});

function log(msg, hl){
  const box = document.getElementById('logBox');
  const d = document.createElement('div');
  if(hl) d.className='hl';
  d.textContent = msg;
  box.appendChild(d);
  box.scrollTop = box.scrollHeight;
}
function logClear(){ document.getElementById('logBox').innerHTML=''; }

let animTimer=null, animIndex=0, currentSteps=[], animApply=null;

function resetAnimation(){
  clearInterval(animTimer); animTimer=null; animIndex=0; currentSteps=[]; animApply=null;
  visitOrder={}; componentColor={}; coloring={};
  render();
}

function stepAnimation(){
  if(animIndex>=currentSteps.length){ clearInterval(animTimer); animTimer=null; log('— Animación completa —', true); return; }
  animApply(currentSteps[animIndex], animIndex);
  animIndex++;
  render();
}
function playAnim(){
  if(animTimer || currentSteps.length===0) return;
  animTimer = setInterval(stepAnimation, Number(document.getElementById('speedRange').value));
}
function pauseAnim(){ clearInterval(animTimer); animTimer=null; }

document.getElementById('speedRange').addEventListener('input', e=>{
  document.getElementById('speedVal').textContent = e.target.value+'ms';
  if(animTimer){ pauseAnim(); playAnim(); }
});
document.getElementById('playPauseBtn').addEventListener('click', ()=>{ animTimer ? pauseAnim() : playAnim(); });
document.getElementById('stepBtn').addEventListener('click', ()=>{ pauseAnim(); stepAnimation(); });
document.getElementById('resetAlgoBtn').addEventListener('click', ()=>{ resetAnimation(); logClear(); log('Reiniciado.'); });

function bfsSteps(start){
  const visited=new Set([start]); const q=[start]; const steps=[];
  while(q.length){
    const cur=q.shift(); steps.push(cur);
    neighborsOf(cur,true).sort((a,b)=>a-b).forEach(nb=>{
      if(!visited.has(nb)){ visited.add(nb); q.push(nb); }
    });
  }
  return steps;
}
function dfsSteps(start){
  const visited=new Set(); const steps=[];
  (function go(u){
    visited.add(u); steps.push(u);
    neighborsOf(u,true).sort((a,b)=>a-b).forEach(nb=>{ if(!visited.has(nb)) go(nb); });
  })(start);
  return steps;
}
function greedyColoringCompute(){
  const order = [...graph.nodes].sort((a,b)=>degreeOf(b.id)-degreeOf(a.id)).map(n=>n.id);
  const assign = {};
  order.forEach(id=>{
    const used = new Set(neighborsOf(id,false).map(nb=>assign[nb]).filter(v=>v!==undefined));
    let c=0; while(used.has(c)) c++;
    assign[id]=c;
  });
  return { assign, order, k: new Set(Object.values(assign)).size };
}

document.getElementById('runAlgoBtn').addEventListener('click', ()=>{
  resetAnimation(); logClear();
  if(graph.nodes.length===0){ log('Primero construye un grafo en modo Editar.'); return; }

  if(currentAlgo==='bfs' || currentAlgo==='dfs'){
    if(startNodeId===null || !graph.nodes.find(n=>n.id===startNodeId)){
      log('Elige primero un vértice inicial con «Elegir vértice inicial».'); return;
    }
    const order = currentAlgo==='bfs' ? bfsSteps(startNodeId) : dfsSteps(startNodeId);
    log(`${currentAlgo.toUpperCase()} desde ${graph.nodes.find(n=>n.id===startNodeId).label}:`, true);
    currentSteps = order;
    animApply = (nodeId, i)=>{
      visitOrder[nodeId]=i+1;
      log(`Paso ${i+1}: visitar ${graph.nodes.find(n=>n.id===nodeId).label}`);
    };
    playAnim();
  }

  if(currentAlgo==='comp'){
    const comps = connectedComponents();
    log(`Se encontraron ${comps.length} componente(s) conexa(s).`, true);
    currentSteps = comps.flatMap((comp,ci)=>comp.map(id=>({id,ci})));
    animApply = (step,i)=>{
      componentColor[step.id]=step.ci;
      log(`${graph.nodes.find(n=>n.id===step.id).label} → componente ${step.ci+1}`);
    };
    playAnim();
  }

  if(currentAlgo==='color'){
    const { assign, order, k } = greedyColoringCompute();
    log(`Coloreo voraz: usa ${k} color(es) (cota superior del número cromático real).`, true);
    currentSteps = order;
    animApply = (id,i)=>{
      coloring[id]=assign[id];
      log(`${graph.nodes.find(n=>n.id===id).label} → color ${assign[id]+1}`);
    };
    playAnim();
  }
});

const BANCO_PREGUNTAS = [
  { q:'¿Cuál es el número mínimo de aristas de un árbol con 7 vértices?', opts:['5','6','7','14'], correct:1, ex:'Un árbol siempre tiene exactamente n − 1 aristas: 7 − 1 = 6.' },
  { q:'En un grafo dirigido, ¿qué representa una arista (A, B)?', opts:['Conexión en ambos sentidos','Conexión solo de A hacia B','Que A y B tienen el mismo grado','Un ciclo entre A y B'], correct:1, ex:'En grafos dirigidos, la arista solo se recorre en el sentido en que está definida.' },
  { q:'¿Qué estructura de datos usa el BFS para decidir el orden de visita?', opts:['Una pila (LIFO)','Una cola (FIFO)','Un árbol binario','Una matriz'], correct:1, ex:'BFS usa una cola: primero en entrar, primero en salir, lo que garantiza explorar por niveles.' },
  { q:'Un grafo es bipartito si...', opts:['Tiene exactamente dos vértices','Sus vértices se pueden dividir en dos grupos donde toda arista va entre grupos','No tiene ciclos','Es siempre conexo'], correct:1, ex:'La condición clave es que ninguna arista una a dos vértices del mismo grupo.' },
  { q:'El número cromático de un grafo es...', opts:['El número de vértices','El número de aristas','La cantidad mínima de colores necesarios para colorearlo sin conflictos','El grado máximo del grafo'], correct:2, ex:'Es la menor cantidad de colores con la que se puede colorear el grafo respetando la regla de coloreo.' },
  { q:'¿Qué garantiza el algoritmo de coloreo voraz (greedy)?', opts:['Siempre encuentra el número cromático exacto','Da una cota superior, no siempre el valor mínimo exacto','Solo funciona en árboles','Requiere que el grafo sea dirigido'], correct:1, ex:'El greedy es rápido pero no óptimo en general: puede usar más colores de los estrictamente necesarios.' },
  { q:'La suma de los grados de todos los vértices de un grafo no dirigido es igual a...', opts:['El número de vértices','El doble del número de aristas','El número de aristas al cuadrado','Cero'], correct:1, ex:'Por el Lema del apretón de manos, cada arista aporta 2 al grado total del grafo.' },
  { q:'¿Cuál es el número máximo de aristas en un grafo simple no dirigido de 5 vértices?', opts:['5','10','20','25'], correct:1, ex:'Un grafo completo de n vértices tiene n(n-1)/2 aristas. Para 5 vértices, es 5*4/2 = 10.' },
  { q:'Si un grafo conexo tiene n vértices y n aristas, necesariamente contiene...', opts:['Al menos un ciclo','Ningún ciclo','Exactamente dos componentes','Un camino euleriano'], correct:0, ex:'Un árbol (sin ciclos) tiene n-1 aristas. Al agregar una arista más, se forma obligatoriamente un ciclo.' },
  { q:'¿En qué consiste un camino Euleriano?', opts:['Pasa por todos los vértices exactamente una vez','Pasa por todas las aristas exactamente una vez','El vértice inicial es igual al final','Tiene peso mínimo'], correct:1, ex:'Un camino Euleriano recorre cada arista del grafo exactamente una vez.' },
  { q:'¿En qué consiste un ciclo Hamiltoniano?', opts:['Pasa por todas las aristas exactamente una vez','Es un ciclo que pasa por todos los vértices exactamente una vez y vuelve al inicio','No tiene vértices repetidos pero no incluye todos','Es un árbol de expansión mínima'], correct:1, ex:'A diferencia del Euleriano que se centra en las aristas, el Hamiltoniano debe visitar todos los vértices.' },
  { q:'En un grafo completo K4, ¿cuál es el grado de cada vértice?', opts:['2','3','4','12'], correct:1, ex:'En un grafo completo, cada vértice está conectado a todos los demás, por lo que su grado es n-1 (4-1 = 3).' }
];

// 2. Función para desordenar y extraer aleatoriamente
function obtenerPreguntasAleatorias(banco, cantidad) {
  const copia = [...banco];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia.slice(0, cantidad);
}

// 3. Generar el cuestionario actual (6 preguntas al azar)
const QUIZ = obtenerPreguntasAleatorias(BANCO_PREGUNTAS, 6);

// 4. Inyección en el DOM
const quizContainer = document.getElementById('quizContainer');
quizContainer.innerHTML = ''; // Limpiamos contenedor por seguridad

QUIZ.forEach((item, qi) => {
  const card = document.createElement('div');
  card.className = 'quiz-card';
  card.innerHTML = `<h4>${qi+1}. ${item.q}</h4>` +
    item.opts.map((o, oi) => `<label class="opt" data-q="${qi}" data-o="${oi}"><input type="radio" name="q${qi}" value="${oi}"> ${o}</label>`).join('') +
    `<div class="explain" id="ex-${qi}">${item.ex}</div>`;
  quizContainer.appendChild(card);
});

// 5. Validación del puntaje
// Para evitar duplicar eventos si este código se ejecuta múltiples veces, 
// puedes clonar y reemplazar el botón (opcional, pero buena práctica)
const oldBtn = document.getElementById('checkQuizBtn');
const newBtn = oldBtn.cloneNode(true);
oldBtn.parentNode.replaceChild(newBtn, oldBtn);

newBtn.addEventListener('click', () => {
  let score = 0;
  QUIZ.forEach((item, qi) => {
    const checked = document.querySelector(`input[name="q${qi}"]:checked`);
    document.querySelectorAll(`.opt[data-q="${qi}"]`).forEach(el => el.classList.remove('correct', 'wrong'));
    const correctEl = document.querySelector(`.opt[data-q="${qi}"][data-o="${item.correct}"]`);
    
    if (checked) {
      const val = Number(checked.value);
      if (val === item.correct) { 
        score++; 
        correctEl.classList.add('correct'); 
      } else {
        document.querySelector(`.opt[data-q="${qi}"][data-o="${val}"]`).classList.add('wrong');
        correctEl.classList.add('correct');
      }
    } else {
      correctEl.classList.add('correct');
    }
    document.getElementById('ex-' + qi).classList.add('show');
  });
  document.getElementById('quizScore').textContent = `${score} / ${QUIZ.length}`;
});

/* ============================================================
   RETOS — verificaciones sobre el grafo real del laboratorio
   ============================================================ */
document.getElementById('checkBipartiteBtn').addEventListener('click', ()=>{
  const box = document.getElementById('bipartiteResult');
  if(graph.nodes.length < 2 || graph.edges.length===0){
    box.className='result-box'; box.textContent='Construye primero un grafo con al menos algunas aristas en el laboratorio.'; return;
  }
  const color = {};
  let ok = true, conflictMsg='';
  graph.nodes.forEach(n=>{
    if(color[n.id]!==undefined) return;
    color[n.id]=0;
    const q=[n.id];
    while(q.length){
      const u=q.shift();
      for(const v of neighborsOf(u,false)){
        if(color[v]===undefined){ color[v]=1-color[u]; q.push(v); }
        else if(color[v]===color[u]){
          ok=false;
          conflictMsg = `Conflicto entre ${graph.nodes.find(x=>x.id===u).label} y ${graph.nodes.find(x=>x.id===v).label}: quedaron en el mismo grupo.`;
        }
      }
    }
  });
  if(ok){ box.className='result-box ok'; box.textContent='✅ Tu grafo es bipartito. Se puede dividir en dos grupos sin aristas internas en ningún grupo.'; }
  else { box.className='result-box no'; box.textContent='❌ Tu grafo NO es bipartito. '+conflictMsg+' (Pista: probablemente tiene un ciclo de longitud impar.)'; }
});

document.getElementById('checkConnectedBtn').addEventListener('click', ()=>{
  const box = document.getElementById('connectedResult');
  if(graph.nodes.length===0){ box.className='result-box'; box.textContent='Aún no hay vértices en el laboratorio.'; return; }
  const comps = connectedComponents();
  if(comps.length===1){ box.className='result-box ok'; box.textContent='✅ Tu grafo es conexo: existe un camino entre cualquier par de vértices.'; }
  else {
    const detalle = comps.map((c,i)=>`Comp. ${i+1}: {${c.map(id=>graph.nodes.find(n=>n.id===id).label).join(', ')}}`).join(' · ');
    box.className='result-box no'; box.textContent=`❌ Tu grafo NO es conexo: tiene ${comps.length} componentes. ${detalle}`;
  }
});
