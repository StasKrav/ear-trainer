import { AudioEngine } from './audio.js';
import { RANGES, ADVANCE_DELAY } from './constants.js';
import * as AnswersUI from './ui/answers.js';
import { highlightKeys, clearHighlights } from './ui/piano.js';
import { showToast, clearToast } from './ui/toast.js';


export function createSession({ exercise, mode, direction, difficulty }) {
  const state = {
    mode,
    direction,
    allowed: ['M3', 'm3'],
    difficulty,
    exercise,
    current: null,
    answered: false,
    correct: 0,
    total: 0,
    streak: 0,
    advanceTimer: null,
  };

  const playBtn = document.getElementById('playBtn');

  function cancelAdvance() {
    if (state.advanceTimer) {
      clearTimeout(state.advanceTimer);
      state.advanceTimer = null;
    }
  }

  function scheduleAdvance() {
    cancelAdvance();
    state.advanceTimer = setTimeout(() => {
      state.advanceTimer = null;
      newQuestion();
    }, ADVANCE_DELAY);
  }

  function newQuestion() {
  cancelAdvance();
  state.answered = false;
  clearToast();
  clearHighlights();
  AnswersUI.resetAnswerButtons();

  state.current = state.exercise.generate();
  playBtn.disabled = false;
  playBtn.focus();

  if (AudioEngine.ready()) {
    setTimeout(() => {
      AudioEngine.resume();
      state.exercise.play(state.current);
    }, 150);
  }
}

function answer(id, btn) {
  if (state.answered) return;
  state.answered = true;
  state.total++;

  const correct = id === state.current.answer;
  AnswersUI.disableAnswers();

  if (correct) {
    AnswersUI.markCorrect(id);
    state.correct++;
    state.streak++;
    showToast({ correct: true });
  } else {
    AnswersUI.markWrong(id);
    AnswersUI.markCorrect(state.current.answer);
    state.streak = 0;
    const name = state.exercise
      .pool()
      .find((i) => i.id === state.current.answer)?.name;
    showToast({ correct: false, answerName: name });
  }

  updateStats();
  highlightKeys(state.current.notes);
  scheduleAdvance();
}


  function updateStats() {
    document.getElementById('statCorrect').textContent = state.correct;
    document.getElementById('statTotal').textContent = state.total;
    document.getElementById('statStreak').textContent = state.streak;
  }

  function setMode(mode) {
    state.mode = mode;
    cancelAdvance();
    newQuestion();
  }

  function setDirection(direction) {
    state.direction = direction;
    cancelAdvance();
    newQuestion();
  }

  function setDifficulty(difficulty) {
    state.difficulty = difficulty;
    cancelAdvance();
    newQuestion();
  }

  function setAllowed(allowed) {
    state.allowed = allowed;
    state.exercise.opts.allowed = [...allowed];
    cancelAdvance();
    newQuestion();
  }

  function playCurrent() {
    if (!state.current) return;
    AudioEngine.resume();
    state.exercise.play(state.current);
    if (state.answered) scheduleAdvance();
  }

  function getState() {
    return state;
  }

  return {
    newQuestion,
    answer,
    setMode,
    setDirection,
    setDifficulty,
    setAllowed,
    playCurrent,
    getState,
  };
}