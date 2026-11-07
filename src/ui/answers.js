import { INTERVALS } from '../exercises/index.js';

let answersEl = null;
let currentOrder = [];

export function initAnswers(el, onAnswer) {
  answersEl = el;
  el.addEventListener('click', (e) => {
    const btn = e.target.closest('.answer-btn');
    if (!btn || btn.disabled) return;
    onAnswer(btn.dataset.id, btn);
  });
}

export function setAnswerOrder(ids) {
  currentOrder = INTERVALS.filter((iv) => ids.includes(iv.id)).sort(
    (a, b) => a.semitones - b.semitones
  );
  renderAnswers();
}

function renderAnswers() {
  answersEl.innerHTML = '';
  currentOrder.forEach((iv) => {
    const btn = document.createElement('button');
    btn.className = 'answer-btn';
    btn.textContent = iv.name;
    btn.dataset.id = iv.id;
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

export function getButton(id) {
  return answersEl.querySelector(`[data-id="${id}"]`);
}