import { AudioEngine } from './audio.js';
import { ROUND_SIZE, ADVANCE_DELAY } from './constants.js';
import * as AnswersUI from './ui/answers.js';
import { showToast, clearToast, showRoundResult } from './ui/toast.js';
import { highlightKeys, clearHighlights } from './ui/piano.js';

export function createSession({ exercise, mode, direction }) {
  const state = {
    mode,
    direction,
    exercise,

    current: null,
    answered: false,

    roundActive: false,
    roundCorrect: 0,
    roundTotal: 0,

    advanceTimer: null,
  };

  const playBtn = document.getElementById('playBtn');
  const repeatBtn = document.getElementById('repeatBtn');

  // ── Таймер ────────────────────────────────────────────────
  function cancelAdvance() {
    if (state.advanceTimer) {
      clearTimeout(state.advanceTimer);
      state.advanceTimer = null;
    }
  }

  function scheduleAdvance() {
    if (!state.roundActive) return;
    cancelAdvance();
    state.advanceTimer = setTimeout(() => {
      state.advanceTimer = null;
      newQuestion();
    }, ADVANCE_DELAY);
  }

  // ── Статистика ────────────────────────────────────────────
  function updateStats() {
    document.getElementById('statCorrect').textContent = state.roundCorrect;
    document.getElementById('statTotal').textContent = state.roundTotal;
    const acc =
      state.roundTotal === 0
        ? '—'
        : Math.round((state.roundCorrect / state.roundTotal) * 100) + '%';
    document.getElementById('statAccuracy').textContent = acc;
  }

  // ── Вопрос ────────────────────────────────────────────────
  function newQuestion() {
    cancelAdvance();
    state.answered = false;
    clearToast();
    clearHighlights();
    AnswersUI.resetAnswerButtons();

    state.current = state.exercise.generate();
    playBtn.focus();

    if (AudioEngine.ready()) {
      setTimeout(() => {
        AudioEngine.resume();
        state.exercise.play(state.current);
      }, 150);
    }
  }

  // ── Подход ────────────────────────────────────────────────
  function startRound() {
    state.roundActive = true;
    state.roundCorrect = 0;
    state.roundTotal = 0;
    updateStats();
    clearToast();
    playBtn.disabled = true;
    if (repeatBtn) repeatBtn.disabled = false;
    newQuestion();
  }

  function endRound() {
    state.roundActive = false;
    cancelAdvance();
    AnswersUI.disableAnswers();
    playBtn.disabled = false;
    if (repeatBtn) repeatBtn.disabled = true;

    const acc = Math.round((state.roundCorrect / ROUND_SIZE) * 100);
    showRoundResult({
      correct: state.roundCorrect,
      total: ROUND_SIZE,
      accuracy: acc,
    });
  }

  // ── Ответ ─────────────────────────────────────────────────
  function answer(id, btn) {
    if (state.answered || !state.roundActive) return;
    state.answered = true;
    state.roundTotal++;

    const correct = id === state.current.answer;
    AnswersUI.disableAnswers();

    if (correct) {
      AnswersUI.markCorrect(id);
      state.roundCorrect++;
      showToast({ correct: true });
    } else {
      AnswersUI.markWrong(id);
      AnswersUI.markCorrect(state.current.answer);
      const name = state.exercise.getAnswerLabel(state.current.answer);
      showToast({ correct: false, answerName: name });
    }

    updateStats();

    if (state.roundTotal >= ROUND_SIZE) {
      endRound();
      return;
    }

    highlightKeys(state.current.notes);
    scheduleAdvance();
  }

  // ── Повтор ────────────────────────────────────────────────
  function repeatCurrent() {
    if (!state.current) return;
    if (!AudioEngine.ready()) return;
    AudioEngine.resume();
    state.exercise.play(state.current);
    if (state.answered && state.roundActive) scheduleAdvance();
  }

  // ── Сброс ─────────────────────────────────────────────────
  function resetForSettingsChange() {
    cancelAdvance();
    state.roundActive = false;
    state.roundCorrect = 0;
    state.roundTotal = 0;
    state.answered = false;
    state.current = null;

    updateStats();
    clearToast();
    clearHighlights();

    playBtn.disabled = false;
    if (repeatBtn) repeatBtn.disabled = true;
    AnswersUI.resetAnswerButtons();
    AnswersUI.disableAnswers();
  }

  // ── Смена упражнения ──────────────────────────────────────
  function setExercise(nextExercise) {
    state.exercise = nextExercise;
    resetForSettingsChange();
  }

  // ── Сеттеры ───────────────────────────────────────────────
  function setMode(mode) {
    state.mode = mode;
    state.exercise.opts.mode = mode;
    resetForSettingsChange();
  }

  function setDirection(direction) {
    state.direction = direction;
    state.exercise.opts.direction = direction;
    resetForSettingsChange();
  }

  function setAllowed(allowed) {
    state.exercise.opts.allowed = [...allowed];
    resetForSettingsChange();
  }

  function setAllowedGroups(allowedGroups) {
    state.exercise.opts.allowedGroups = [...allowedGroups];
    resetForSettingsChange();
  }

  function setRange(range) {
    state.exercise.opts.range = range;
    resetForSettingsChange();
  }

  function getState() {
    return state;
  }

  resetForSettingsChange();

  return {
    startRound,
    repeatCurrent,
    answer,
    setExercise,
    setMode,
    setDirection,
    setAllowed,
    setAllowedGroups,
    setRange,
    getState,
  };
}