let answersEl = null;
let currentOptions = [];

export function initAnswers(el, onAnswer) {
  answersEl = el;
  el.addEventListener('click', (e) => {
    const btn = e.target.closest('.answer-btn');
    if (!btn || btn.disabled) return;
    onAnswer(btn.dataset.id, btn);
  });
}

// options: [{ id, label }]
export function setAnswerOrder(options) {
  currentOptions = options;
  renderAnswers();
}

function renderAnswers() {
  answersEl.innerHTML = '';
  currentOptions.forEach((opt) => {
    const btn = document.createElement('button');
    btn.className = 'answer-btn';
    btn.textContent = opt.label;
    btn.dataset.id = opt.id;
    answersEl.appendChild(btn);
  });
}

export function resetAnswerButtons() {
  answersEl.querySelectorAll('.answer-btn').forEach((b) => {
    b.disabled = false;
    b.classList.remove('correct', 'wrong');
  });
}

export function disableAnswers() {
  answersEl.querySelectorAll('.answer-btn').forEach((b) => {
    b.disabled = true;
  });
}

export function markCorrect(id) {
  answersEl.querySelector(`[data-id="${id}"]`)?.classList.add('correct');
}

export function markWrong(id) {
  answersEl.querySelector(`[data-id="${id}"]`)?.classList.add('wrong');
}