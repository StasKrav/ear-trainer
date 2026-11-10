import './style.css';
import { AudioEngine } from './audio.js';
import { EXERCISE_TYPES, INTERVAL_GROUPS } from './exercises/index.js';
import { RANGES } from './constants.js';
import * as AnswersUI from './ui/answers.js';
import * as GroupsUI from './ui/groups.js';
import * as PianoUI from './ui/piano.js';
import * as ToastUI from './ui/toast.js';
import { initSettings } from './ui/settings.js';
import { createSession } from './session.js';

// ── Инициализация UI ─────────────────────────────────────────
PianoUI.initPiano(document.getElementById('piano'));
ToastUI.initToast(document.getElementById('toastLayer'));
ToastUI.initRoundLayer(document.getElementById('roundLayer'));

AnswersUI.initAnswers(document.getElementById('answers'), (id, btn) => {
  session.answer(id, btn);
});

// ── Сессия ───────────────────────────────────────────────────
const state = {
  mode: 'melodic',
  direction: 'up',
  allowed: ['M3', 'm3'],
  difficulty: 'medium',
};

function buildExercise() {
  const Ex = EXERCISE_TYPES.interval;
  return new Ex({
    allowed: [...state.allowed],
    mode: state.mode,
    direction: state.direction,
    range: RANGES[state.difficulty],
  });
}

const session = createSession({
  exercise: buildExercise(),
  mode: state.mode,
  direction: state.direction,
  difficulty: state.difficulty,
});

// ── Группы интервалов ────────────────────────────────────────
function toggleGroup(groupId) {
  const g = INTERVAL_GROUPS.find((x) => x.id === groupId);
  if (!g) return;

  const allActive = g.members.every((id) => state.allowed.includes(id));
  if (allActive) {
    const after = state.allowed.filter((id) => !g.members.includes(id));
    if (after.length < 2) return;
    state.allowed = after;
  } else {
    const added = g.members.filter((id) => !state.allowed.includes(id));
    state.allowed = [...state.allowed, ...added];
  }

  GroupsUI.renderGroupChips(state.allowed);
  AnswersUI.setAnswerOrder(state.allowed);
  session.setAllowed(state.allowed);
}

GroupsUI.initGroups(document.getElementById('groupChips'), toggleGroup);
GroupsUI.renderGroupChips(state.allowed);
AnswersUI.setAnswerOrder(state.allowed);

// ── Настройки ────────────────────────────────────────────────
initSettings({
  onModeChange: (mode) => {
    state.mode = mode;
    session.setMode(mode);
  },
  onDirectionChange: (direction) => {
    state.direction = direction;
    session.setDirection(direction);
  },
  onDifficultyChange: (difficulty) => {
    state.difficulty = difficulty;
    session.setDifficulty(difficulty);
  },
});

// ── Кнопка «Слушать» — старт подхода ─────────────────────────
const playBtn = document.getElementById('playBtn');
let audioLoading = false;

playBtn.addEventListener('click', async () => {
  if (playBtn.disabled) return;

  if (!AudioEngine.ready()) {
    if (audioLoading) return;
    audioLoading = true;
    const originalText = playBtn.textContent;
    playBtn.textContent = 'Загрузка…';

    try {
      await AudioEngine.resume();
      await AudioEngine.load();
    } catch (e) {
      console.error(e);
      ToastUI.showToast({
        correct: false,
        answerName: 'не удалось загрузить звук (см. консоль)',
      });
      playBtn.textContent = originalText;
      audioLoading = false;
      return;
    }

    playBtn.textContent = originalText;
    audioLoading = false;
  }

  session.startRound();
});

const repeatBtn = document.getElementById('repeatBtn');

repeatBtn.addEventListener('click', () => {
  if (repeatBtn.disabled) return;
  session.repeatCurrent();
});

// ── Старт ────────────────────────────────────────────────────
// Первый подход запускается только по кнопке «Слушать».
// createSession уже привёл UI в исходное состояние
// (ответы недоступны, статистика обнулена).