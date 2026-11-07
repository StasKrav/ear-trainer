const MIN = 43; // G2
const MAX = 84; // C6
const BLACK_PC = new Set([1, 3, 6, 8, 10]);
const isBlack = (midi) => BLACK_PC.has(midi % 12);

let pianoEl = null;

export function initPiano(el) {
  pianoEl = el;
  buildPiano();
}

function buildPiano() {
  const whiteKeys = [];
  for (let m = MIN; m <= MAX; m++) {
    if (!isBlack(m)) whiteKeys.push(m);
  }
  const blackAfter = whiteKeys.filter((m) => m + 1 <= MAX && isBlack(m + 1));

  pianoEl.innerHTML = '';
  pianoEl.style.setProperty('--white-count', whiteKeys.length);

  const whitesWrap = document.createElement('div');
  whitesWrap.className = 'keys-white';
  pianoEl.appendChild(whitesWrap);

  const blacksWrap = document.createElement('div');
  blacksWrap.className = 'keys-black';
  pianoEl.appendChild(blacksWrap);

  const n = whiteKeys.length;
  const whiteWidth = 100 / n;

  whiteKeys.forEach((m, i) => {
    const w = document.createElement('div');
    w.className = 'key';
    w.dataset.midi = m;
    whitesWrap.appendChild(w);

    if (blackAfter.includes(m)) {
      const b = document.createElement('div');
      b.className = 'key black';
      b.dataset.midi = m + 1;
      b.style.left = `${(i + 1) * whiteWidth}%`;
      blacksWrap.appendChild(b);
    }
  });
}

export function highlightKeys(midis) {
  if (!pianoEl) return;
  pianoEl.querySelectorAll('.key').forEach((k) => k.classList.remove('active'));
  midis.forEach((m) => {
    const k = pianoEl.querySelector(`.key[data-midi="${m}"]`);
    if (k) k.classList.add('active');
  });
}

export function clearHighlights() {
  if (!pianoEl) return;
  pianoEl.querySelectorAll('.key').forEach((k) => k.classList.remove('active'));
}