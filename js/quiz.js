/* ============================================================
   QUIZ — cuestionario aleatorio y retos interactivos
   ============================================================ */
const Quiz = (() => {
  const QUESTION_BANK = [
    { q: '¿Cuál es el número mínimo de aristas de un árbol con 7 vértices?', opts: ['5', '6', '7', '14'], correct: 1, ex: 'Un árbol siempre tiene exactamente n − 1 aristas: 7 − 1 = 6.' },
    { q: 'En un grafo dirigido, ¿qué representa una arista (A, B)?', opts: ['Conexión en ambos sentidos', 'Conexión solo de A hacia B', 'Que A y B tienen el mismo grado', 'Un ciclo entre A y B'], correct: 1, ex: 'En grafos dirigidos, la arista solo se recorre en el sentido en que está definida.' },
    { q: '¿Qué estructura de datos usa el BFS para decidir el orden de visita?', opts: ['Una pila (LIFO)', 'Una cola (FIFO)', 'Un árbol binario', 'Una matriz'], correct: 1, ex: 'BFS usa una cola: primero en entrar, primero en salir, lo que garantiza explorar por niveles.' },
    { q: 'Un grafo es bipartito si...', opts: ['Tiene exactamente dos vértices', 'Sus vértices se pueden dividir en dos grupos donde toda arista va entre grupos', 'No tiene ciclos', 'Es siempre conexo'], correct: 1, ex: 'La condición clave es que ninguna arista una a dos vértices del mismo grupo.' },
    { q: 'El número cromático de un grafo es...', opts: ['El número de vértices', 'El número de aristas', 'La cantidad mínima de colores necesarios para colorearlo sin conflictos', 'El grado máximo del grafo'], correct: 2, ex: 'Es la menor cantidad de colores con la que se puede colorear el grafo respetando la regla de coloreo.' },
    { q: '¿Qué garantiza el algoritmo de coloreo voraz (greedy)?', opts: ['Siempre encuentra el número cromático exacto', 'Da una cota superior, no siempre el valor mínimo exacto', 'Solo funciona en árboles', 'Requiere que el grafo sea dirigido'], correct: 1, ex: 'El greedy es rápido pero no óptimo en general: puede usar más colores de los estrictamente necesarios.' },
    { q: 'La suma de los grados de todos los vértices de un grafo no dirigido es igual a...', opts: ['El número de vértices', 'El doble del número de aristas', 'El número de aristas al cuadrado', 'Cero'], correct: 1, ex: 'Por el Lema del apretón de manos, cada arista aporta 2 al grado total del grafo.' },
    { q: '¿Cuál es el número máximo de aristas en un grafo simple no dirigido de 5 vértices?', opts: ['5', '10', '20', '25'], correct: 1, ex: 'Un grafo completo de n vértices tiene n(n-1)/2 aristas. Para 5 vértices, es 5*4/2 = 10.' },
    { q: 'Si un grafo conexo tiene n vértices y n aristas, necesariamente contiene...', opts: ['Al menos un ciclo', 'Ningún ciclo', 'Exactamente dos componentes', 'Un camino euleriano'], correct: 0, ex: 'Un árbol (sin ciclos) tiene n-1 aristas. Al agregar una arista más, se forma obligatoriamente un ciclo.' },
    { q: '¿En qué consiste un camino Euleriano?', opts: ['Pasa por todos los vértices exactamente una vez', 'Pasa por todas las aristas exactamente una vez', 'El vértice inicial es igual al final', 'Tiene peso mínimo'], correct: 1, ex: 'Un camino Euleriano recorre cada arista del grafo exactamente una vez.' },
    { q: '¿En qué consiste un ciclo Hamiltoniano?', opts: ['Pasa por todas las aristas exactamente una vez', 'Es un ciclo que pasa por todos los vértices exactamente una vez y vuelve al inicio', 'No tiene vértices repetidos pero no incluye todos', 'Es un árbol de expansión mínima'], correct: 1, ex: 'A diferencia del Euleriano que se centra en las aristas, el Hamiltoniano debe visitar todos los vértices.' },
    { q: 'En un grafo completo K4, ¿cuál es el grado de cada vértice?', opts: ['2', '3', '4', '12'], correct: 1, ex: 'En un grafo completo, cada vértice está conectado a todos los demás, por lo que su grado es n-1 (4-1 = 3).' }
  ];

  const QUIZ_SIZE = 6;

  function shuffleAndPick(bank, count) {
    const copy = [...bank];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy.slice(0, count);
  }

  function renderQuiz(selectedQuestions) {
    const container = document.getElementById('quizContainer');
    container.innerHTML = '';
    selectedQuestions.forEach((item, index) => {
      const card = document.createElement('div');
      card.className = 'quiz-card';
      card.innerHTML =
        `<h4>${index + 1}. ${item.q}</h4>` +
        item.opts.map((opt, optIndex) =>
          `<label class="opt" data-q="${index}" data-o="${optIndex}">` +
          `<input type="radio" name="q${index}" value="${optIndex}"> ${opt}</label>`
        ).join('') +
        `<div class="explain" id="ex-${index}">${item.ex}</div>`;
      container.appendChild(card);
    });
  }

  function checkAnswers(selectedQuestions) {
    let score = 0;
    selectedQuestions.forEach((item, index) => {
      const checked = document.querySelector(`input[name="q${index}"]:checked`);
      document.querySelectorAll(`.opt[data-q="${index}"]`).forEach(el => {
        el.classList.remove('correct', 'wrong');
      });
      const correctEl = document.querySelector(`.opt[data-q="${index}"][data-o="${item.correct}"]`);

      if (checked) {
        const value = Number(checked.value);
        if (value === item.correct) {
          score++;
          correctEl.classList.add('correct');
        } else {
          document.querySelector(`.opt[data-q="${index}"][data-o="${value}"]`).classList.add('wrong');
          correctEl.classList.add('correct');
        }
      } else {
        correctEl.classList.add('correct');
      }
      document.getElementById(`ex-${index}`).classList.add('show');
    });
    document.getElementById('quizScore').textContent = `${score} / ${selectedQuestions.length}`;
  }

  function checkBipartite() {
    const resultBox = document.getElementById('bipartiteResult');
    if (Graph.state.nodes.length < 2 || Graph.state.edges.length === 0) {
      resultBox.className = 'result-box';
      resultBox.textContent = 'Construye primero un grafo con al menos algunas aristas en el laboratorio.';
      return;
    }

    const color = {};
    let isBipartite = true;
    let conflictMessage = '';

    Graph.state.nodes.forEach(node => {
      if (color[node.id] !== undefined) return;
      color[node.id] = 0;
      const queue = [node.id];
      while (queue.length) {
        const current = queue.shift();
        for (const neighbor of Graph.neighborsOf(current, false)) {
          if (color[neighbor] === undefined) {
            color[neighbor] = 1 - color[current];
            queue.push(neighbor);
          } else if (color[neighbor] === color[current]) {
            isBipartite = false;
            conflictMessage = `Conflicto entre ${Graph.getNodeById(current).label} y ${Graph.getNodeById(neighbor).label}: quedaron en el mismo grupo.`;
          }
        }
      }
    });

    if (isBipartite) {
      resultBox.className = 'result-box ok';
      resultBox.textContent = '✅ Tu grafo es bipartito. Se puede dividir en dos grupos sin aristas internas en ningún grupo.';
    } else {
      resultBox.className = 'result-box no';
      resultBox.textContent = `❌ Tu grafo NO es bipartito. ${conflictMessage} (Pista: probablemente tiene un ciclo de longitud impar.)`;
    }
  }

  function checkConnectivity() {
    const resultBox = document.getElementById('connectedResult');
    if (Graph.state.nodes.length === 0) {
      resultBox.className = 'result-box';
      resultBox.textContent = 'Aún no hay vértices en el laboratorio.';
      return;
    }

    const components = Graph.connectedComponents();
    if (components.length === 1) {
      resultBox.className = 'result-box ok';
      resultBox.textContent = '✅ Tu grafo es conexo: existe un camino entre cualquier par de vértices.';
    } else {
      const detail = components
        .map((comp, i) => `Comp. ${i + 1}: {${comp.map(id => Graph.getNodeById(id).label).join(', ')}}`)
        .join(' · ');
      resultBox.className = 'result-box no';
      resultBox.textContent = `❌ Tu grafo NO es conexo: tiene ${components.length} componentes. ${detail}`;
    }
  }

  function init() {
    const selectedQuestions = shuffleAndPick(QUESTION_BANK, QUIZ_SIZE);
    renderQuiz(selectedQuestions);

    const checkBtn = document.getElementById('checkQuizBtn');
    const newCheckBtn = checkBtn.cloneNode(true);
    checkBtn.parentNode.replaceChild(newCheckBtn, checkBtn);
    newCheckBtn.addEventListener('click', () => checkAnswers(selectedQuestions));

    document.getElementById('checkBipartiteBtn').addEventListener('click', checkBipartite);
    document.getElementById('checkConnectedBtn').addEventListener('click', checkConnectivity);
  }

  return { init };
})();
