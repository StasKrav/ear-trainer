let layer = null;

export function initToast(el) {
  layer = el;
}

export function showToast({ correct, answerName }) {
  if (!layer) return;

  // Убираем предыдущий тост, если он ещё висит
  layer.innerHTML = '';

  const el = document.createElement('div');
  el.className = 'toast ' + (correct ? 'ok' : 'err');

  const icon = document.createElement('span');
  icon.className = 'icon';
  icon.textContent = correct ? '✓' : '✕';

  const text = document.createElement('span');
  if (correct) {
    text.textContent = 'Верно!';
  } else {
    text.innerHTML = `Это <span class="answer-name"></span>`;
    text.querySelector('.answer-name').textContent = answerName;
  }

  el.append(icon, text);
  layer.appendChild(el);

  // Плавно убираем перед автопереходом.
  // ADVANCE_DELAY = 1500 мс, тост уходит за 250 мс до конца.
  setTimeout(() => {
    el.classList.add('hide');
  }, 1200);
}

export function clearToast() {
  if (layer) layer.innerHTML = '';
}