let layer = null
let roundLayer = null
let roundResultTimer = null

export function initToast(el) {
  layer = el
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') hideRoundResult()
  })
}

export function initRoundLayer(el) {
  roundLayer = el
}

// ── Обычный тост (верно / ошибка) ──────────────────────────

export function showToast({ correct, answerName }) {
  if (!layer) return
  layer.innerHTML = ''

  const el = document.createElement('div')
  el.className = 'toast ' + (correct ? 'ok' : 'err')

  const icon = document.createElement('span')
  icon.className = 'icon'
  icon.textContent = correct ? '✓' : '✕'

  const text = document.createElement('span')
  if (correct) {
    text.textContent = 'Верно!'
  } else {
    text.innerHTML = `Это <span class="answer-name"></span>`
    text.querySelector('.answer-name').textContent = answerName
  }

  el.append(icon, text)
  layer.appendChild(el)

  setTimeout(() => {
    el.classList.add('hide')
  }, 1200)
}

export function clearToast() {
  if (roundResultTimer) {
    clearTimeout(roundResultTimer)
    roundResultTimer = null
  }
  if (layer) layer.innerHTML = ''
}

// ── Карточка результата подхода ────────────────────────────

const ROUND_RESULT_HIDE_MS = 4000

export function showRoundResult({ correct, total, accuracy }) {
  if (!roundLayer) return;
  hideRoundResult();          // убрать предыдущую, если была
  roundLayer.innerHTML = '';

  const card = document.createElement('div');
  card.className = 'round-result';
  card.innerHTML = `
    <div class="round-title">Подход завершён</div>
    <div class="round-score"><b>${correct}</b> из <b>${total}</b> · <b>${accuracy}%</b></div>
  `;
  roundLayer.appendChild(card);

  roundResultTimer = setTimeout(hideRoundResult, ROUND_RESULT_HIDE_MS);
}

export function hideRoundResult() {
  if (roundResultTimer) {
    clearTimeout(roundResultTimer);
    roundResultTimer = null;
  }
  if (!roundLayer) return;
  const card = roundLayer.querySelector('.round-result');
  if (!card) return;
  card.classList.add('hide');
  setTimeout(() => {
    if (card.parentNode) card.remove();
  }, 250);
}